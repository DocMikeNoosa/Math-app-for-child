"""Backtest strategies on hand-picked "hot, high-quality" stocks, and on a
rule-based version of the same idea that only uses information available at
the time.

Usage:  python run_stocks.py        (downloads ~165 MB of price data on first run)
Writes: results/stocks.json
"""
import json
from pathlib import Path

import numpy as np
import pandas as pd

from backtest import metrics, run_backtest, yearly_returns
from portfolio import run_portfolio, stats
from stock_data import adjusted_ohlcv, load_prices, members_on, membership, wide_adj_close
from strategies import STRATEGIES, mood_proxy

OUT = Path(__file__).parent / "results"
FEE, SLIP = 0.0001, 0.0005          # Interactive Brokers fixed pricing + generous slippage
START_A = "2016-01-04"              # picks backtest (Arista listed mid-2014; 200-day warm-up)
START_B = "2012-01-03"              # rule-based backtest (data coverage of past members >70%)

# Screen applied in October 2026 (see README / report for sources):
#   * net margin > 20% in the latest fiscal year
#   * low debt: net cash, or total debt below ~1.5x annual net income
#   * innovation: R&D-intensive tech / biotech (R&D >= ~10% of revenue where verified)
#   * volatility: 3-year annualised volatility <= 55% (excludes MU, AMD, PLTR, TSLA)
#   * "hot": 1-year return ahead of the S&P 500 (+17%) as of 2026-10-07
PICKS = {
    "NVDA":  dict(name="Nvidia", margin=0.556, debt="Net cash: $8.5B debt vs $62.6B cash & securities", rnd=None),
    "GOOGL": dict(name="Alphabet", margin=0.33, debt="Net cash: $46.5B long-term debt vs $126.8B cash & securities", rnd=0.15),
    "ANET":  dict(name="Arista Networks", margin=0.39, debt="No debt", rnd=0.137),
    "FTNT":  dict(name="Fortinet", margin=0.273, debt="Net cash: ~$1.0B debt vs $3.6B cash & investments", rnd=0.12),
    "AMAT":  dict(name="Applied Materials", margin=0.247, debt="Net cash: ~$6.6B debt vs ~$12.9B cash & investments", rnd=None),
    "LRCX":  dict(name="Lam Research", margin=0.291, debt="Net cash: $4.5B debt vs $6.4B cash", rnd=0.114),
    "KLAC":  dict(name="KLA", margin=0.334, debt="Low: ~$5.9B debt = 1.45x net income", rnd=0.11),
    "VRTX":  dict(name="Vertex Pharmaceuticals", margin=0.33, debt="Low: ~$2–4B debt vs $4.0B net income", rnd=None),
    "REGN":  dict(name="Regeneron", margin=0.314, debt="Low: ~$2.7B debt vs $4.5B net income", rnd=0.41),
}
NEAR_MISSES = {
    "AAPL": "R&D intensity not verified; least innovation-heavy of the group",
    "MSFT": "Not 'hot': +1% over the past year",
    "LLY": "$42.5B debt, about 2x annual net income",
    "PANW": "12% net margin",
    "APH": "18.5% net margin and $15.5B debt",
    "MU / AMD / PLTR / TSLA": "Too volatile (3-year volatility 58–64%)",
}
BENCH = ["SPY", "QQQ", "RSP"]


def single_stock_tests(long_df, end):
    out = {}
    for t in PICKS:
        df = adjusted_ohlcv(long_df, t)
        df.attrs.update(periods_per_year=252, vol_target=0.30)
        sent = mood_proxy(df)
        res = {}
        for name, fn in STRATEGIES.items():
            r = run_backtest(df, fn(df, sent), START_A, fee=FEE, slippage=SLIP)
            m = metrics(r, 252)
            res[name] = {k: m[k] for k in ("final_value", "cagr", "max_drawdown", "sharpe", "trades")}
        out[t] = res
    return out


def picks_portfolios(px):
    tick = list(PICKS)
    sma200 = px.rolling(200, min_periods=200).mean()
    mom6 = px / px.shift(126) - 1
    vol60 = np.log(px).diff().rolling(60).std()

    def equal(d):
        return {t: 1 / len(tick) for t in tick}

    def trend(d):
        return {t: 1 / len(tick) for t in tick if px.at[d, t] > sma200.at[d, t]}

    def momentum(d, k=4):
        top = mom6.loc[d, tick].dropna().nlargest(k).index
        return {t: 1 / k for t in top}

    def momentum_trend(d, k=4):
        top = mom6.loc[d, tick].dropna().nlargest(k).index
        return {t: 1 / k for t in top if px.at[d, t] > sma200.at[d, t]}

    def inv_vol(d):
        iv = 1 / vol60.loc[d, tick]
        return (iv / iv.sum()).to_dict()

    strategies = {
        "Equal weight, rebalanced monthly": equal,
        "Equal weight + 200-day trend filter": trend,
        "Momentum: top 4 of 9 (6-month return)": momentum,
        "Momentum top 4 + trend filter": momentum_trend,
        "Inverse-volatility weights": inv_vol,
        "S&P 500 (SPY)": lambda d: {"SPY": 1.0},
        "Nasdaq-100 (QQQ)": lambda d: {"QQQ": 1.0},
    }
    return {n: run_portfolio(px, fn, START_A, fee=FEE, slippage=SLIP) for n, fn in strategies.items()}


def rule_based(long_all, px_all):
    """Point-in-time version: each month pick from that month's S&P 500 members."""
    m = membership()
    logret = np.log(px_all).diff()
    vol1y = logret.rolling(252, min_periods=200).std() * np.sqrt(252)
    mom = px_all.shift(21) / px_all.shift(252) - 1          # 12-month return, skipping the last month
    sma200 = px_all.rolling(200, min_periods=200).mean()
    spy_up = px_all["SPY"] > px_all["SPY"].rolling(200).mean()
    coverage = {}

    def universe(d):
        names = [t for t in members_on(m, d) if t in px_all.columns]
        ok = [t for t in names if np.isfinite(mom.at[d, t]) and np.isfinite(vol1y.at[d, t])]
        coverage[d.year] = len(ok) / max(len(members_on(m, d)), 1)
        return ok

    def hot_steady(d, k=10, market_filter=False):
        if market_filter and not spy_up.at[d]:
            return {}
        u = universe(d)
        c = mom.loc[d, u]
        c = c[(vol1y.loc[d, u] <= 0.55) & (px_all.loc[d, u] > sma200.loc[d, u])]
        top = c.nlargest(k).index
        return {t: 1 / k for t in top}

    def pure_momentum(d, k=10):
        top = mom.loc[d, universe(d)].nlargest(k).index
        return {t: 1 / k for t in top}

    strategies = {
        "Hot & steady: top 10 momentum, vol ≤ 55%, above 200-day": hot_steady,
        "Hot & steady + market filter (cash when S&P < 200-day)": lambda d: hot_steady(d, market_filter=True),
        "Pure momentum: top 10": pure_momentum,
        "S&P 500 (SPY)": lambda d: {"SPY": 1.0},
        "Equal-weight S&P 500 (RSP)": lambda d: {"RSP": 1.0},
        "Nasdaq-100 (QQQ)": lambda d: {"QQQ": 1.0},
    }
    results = {n: run_portfolio(px_all, fn, START_B, fee=FEE, slippage=SLIP) for n, fn in strategies.items()}
    holdings_now = hot_steady(px_all.index[-1])
    return results, coverage, holdings_now


def eq_weekly(eq):
    return [[d.strftime("%Y-%m-%d"), round(float(v), 2)] for d, v in eq.resample("W").last().items()]


def yearly(eq):
    y = eq.groupby(eq.index.year).last()
    prev = y.shift(1)
    prev.iloc[0] = eq.iloc[0]
    return {int(k): float(v) for k, v in (y / prev - 1).items()}


def pct(x):
    return f"{x * 100:+.0f}%"


def main():
    OUT.mkdir(exist_ok=True)
    long_all = load_prices(start="2010-01-01")
    px_all = wide_adj_close(long_all)
    end = px_all.index[-1]
    print(f"Data through {end.date()}  |  costs {FEE:.2%} fee + {SLIP:.2%} slippage per trade")

    # Price-based screen numbers for the picks (as of the last date).
    r = np.log(px_all).diff()
    screen = {}
    for t in list(PICKS) + BENCH:
        s = px_all[t].dropna()
        screen[t] = {"vol_3y": float(r[t].iloc[-756:].std() * np.sqrt(252)),
                     "ret_1y": float(s.iloc[-1] / s.iloc[-253] - 1),
                     "cagr_5y": float((s.iloc[-1] / s.iloc[-1261]) ** 0.2 - 1)}

    print("\n=== A1. Each pick on its own, since", START_A)
    single = single_stock_tests(long_all, end)
    names = ["Buy & hold (benchmark)", "SMA 50/200 crossover", "Price above 200-day SMA",
             "Donchian 20/10 breakout", "Ensemble + vol targeting", "RSI mean reversion"]
    print(f"{'':6s}" + "".join(f"{n[:14]:>16s}" for n in names))
    for t, res in single.items():
        print(f"{t:6s}" + "".join(f"{pct(res[n]['cagr']) + ' / ' + pct(res[n]['max_drawdown']):>16s}" for n in names))
    beat = {n: int(sum(single[t][n]["cagr"] > single[t]["Buy & hold (benchmark)"]["cagr"] for t in PICKS))
            for n in STRATEGIES if "benchmark" not in n}
    print("Stocks (of 9) where each strategy beat buy & hold:", beat)

    print("\n=== A2. Portfolios of the 9 picks, since", START_A)
    port = picks_portfolios(px_all)
    for n, (eq, info) in port.items():
        s = stats(eq)
        print(f"{n:45s} ${s['final_value']:>9,.0f}  {pct(s['cagr']):>5s}/yr  worst {pct(s['max_drawdown'])}  Sharpe {s['sharpe']:.2f}")

    print("\n=== B. Rule-based, point-in-time S&P 500 universe, since", START_B)
    rb, coverage, now = rule_based(long_all, px_all)
    for n, (eq, info) in rb.items():
        s = stats(eq)
        print(f"{n:58s} ${s['final_value']:>9,.0f}  {pct(s['cagr']):>5s}/yr  worst {pct(s['max_drawdown'])}  "
              f"Sharpe {s['sharpe']:.2f}  turnover/mo {info['avg_turnover']:.0%}")
    print("Coverage of index members with price data:", {y: f"{c:.0%}" for y, c in sorted(coverage.items()) if y % 2 == 0})
    print("Rule-based picks right now:", sorted(now))

    report = {
        "end": str(end.date()), "fee": FEE, "slippage": SLIP, "start_a": START_A, "start_b": START_B,
        "picks": PICKS, "near_misses": NEAR_MISSES, "screen": screen,
        "single": single, "beat_count": beat,
        "portfolios": {n: {"stats": stats(eq), "info": info, "yearly": yearly(eq), "equity_weekly": eq_weekly(eq)}
                       for n, (eq, info) in port.items()},
        "rule_based": {n: {"stats": stats(eq), "info": info, "yearly": yearly(eq), "equity_weekly": eq_weekly(eq)}
                       for n, (eq, info) in rb.items()},
        "coverage": {int(y): float(c) for y, c in coverage.items()},
        "rule_based_now": sorted(now),
    }
    with open(OUT / "stocks.json", "w") as fh:
        json.dump(report, fh, indent=1, default=float)
    print("\nSaved", OUT / "stocks.json")


if __name__ == "__main__":
    main()
