"""Run every strategy on BTC, ETH and the S&P 500 and report the results.

Usage:
  python run.py                     # bundled CSV data + price-derived mood proxy
  python run.py --fear-greed        # crypto uses the real alternative.me Fear & Greed
                                    # Index (needs internet access to api.alternative.me)
  python run.py --crypto-fee 0.0018 # e.g. Interactive Brokers' crypto rate
"""
import argparse
import json
from pathlib import Path

import numpy as np
import pandas as pd

from backtest import metrics, run_backtest, yearly_returns
from data import fetch_fear_greed, load_csv
from strategies import STRATEGIES, mood_proxy, price_above_sma

# Per-market settings. "split" = results are also reported before/after this date.
ASSETS = {
    "BTC": dict(name="Bitcoin", start="2018-01-01", split="2022-01-01", crypto=True),
    "ETH": dict(name="Ethereum", start="2019-01-01", split="2022-01-01", crypto=True),
    # S&P 500 index (price only - see README). Traded via an ETF such as SPY/VOO.
    # Interactive Brokers fixed pricing: $0.005/share, $1 minimum -> ~0.01% on a
    # $10k order; 0.05% slippage is generous for SPY's tight spread.
    "SP500": dict(name="S&P 500", start="2000-01-01", split="2013-01-01", crypto=False,
                  fee=0.0001, slippage=0.0005, periods_per_year=252, vol_target=0.15),
}
OUT = Path(__file__).parent / "results"


def pct(x):
    return f"{x * 100:+.0f}%" if np.isfinite(x) else "n/a"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--fear-greed", action="store_true", help="use real Fear & Greed Index")
    ap.add_argument("--crypto-fee", type=float, default=0.004,
                    help="per-trade fee for crypto (default: Kraken Pro taker 0.40%%)")
    ap.add_argument("--crypto-slippage", type=float, default=0.001)
    ap.add_argument("--out", default="results.json", help="file name inside results/")
    ap.add_argument("--assets", default=",".join(ASSETS), help="comma-separated, e.g. BTC,SP500")
    args = ap.parse_args()
    OUT.mkdir(exist_ok=True)

    fng = fetch_fear_greed() if args.fear_greed else None
    report = {"settings": {"crypto_fee": args.crypto_fee, "crypto_slippage": args.crypto_slippage,
                           "sentiment": "fear_greed" if fng is not None else "mood_proxy"},
              "assets": {}}

    for sym in args.assets.split(","):
        cfg = ASSETS[sym]
        start, split = cfg["start"], cfg["split"]
        fee = args.crypto_fee if cfg["crypto"] else cfg["fee"]
        slip = args.crypto_slippage if cfg["crypto"] else cfg["slippage"]
        ppy = cfg.get("periods_per_year", 365)
        df = load_csv(sym, fill_calendar=cfg["crypto"])
        df.attrs.update(periods_per_year=ppy, vol_target=cfg.get("vol_target", 0.50))
        if fng is not None and cfg["crypto"]:
            sent = fng.reindex(df.index).ffill()
            start = max(pd.Timestamp(start), sent.first_valid_index()).strftime("%Y-%m-%d")
            sent_kind = "fear_greed"
        else:
            sent = mood_proxy(df)
            sent_kind = "mood_proxy"
        end = df.index[-1]
        bt = lambda target, a=start, b=None: run_backtest(df, target, a, b, fee=fee, slippage=slip)
        mx = lambda res: metrics(res, ppy)
        print(f"\n=== {sym}  {start} -> {end.date()}  (fee {fee:.2%} + slippage {slip:.2%} per trade)")
        print(f"{'Strategy':38s} {'$10k ->':>10s} {'CAGR':>6s} {'MaxDD':>6s} {'Sharpe':>6s} "
              f"{'pre-' + split[2:4]:>7s} {split[2:4] + '-now':>7s} {'InMkt':>6s} {'Trades':>6s}")
        asset = {"name": cfg["name"], "start": start, "end": str(end.date()), "split": split,
                 "fee": fee, "slippage": slip, "sentiment": sent_kind, "strategies": {}}
        for name, fn in STRATEGIES.items():
            target = fn(df, sent)
            full = bt(target)
            pre = bt(target, start, pd.Timestamp(split) - pd.Timedelta(days=1))
            post = bt(target, split)
            m, mp, mq = mx(full), mx(pre), mx(post)
            print(f"{name:38s} {m['final_value']:>10,.0f} {pct(m['cagr']):>6s} {pct(m['max_drawdown']):>6s} "
                  f"{m['sharpe']:>6.2f} {pct(mp['total_return']):>7s} {pct(mq['total_return']):>7s} "
                  f"{m['time_in_market']:>6.0%} {m['trades']:>6d}")
            weekly = full.equity.resample("W").last()
            asset["strategies"][name] = {
                "full": m, "pre_split": mp, "post_split": mq,
                "yearly": {int(k): v for k, v in yearly_returns(full).items()},
                "equity_weekly": [[d.strftime("%Y-%m-%d"), round(v, 2)] for d, v in weekly.items()],
            }

        # Walk-forward selection: each January, switch to the strategy with the
        # best Sharpe over the previous 2 years (only past data). This shows
        # what "just pick the winner" would really have earned.
        targets = {name: fn(df, sent) for name, fn in STRATEGIES.items()}
        wf_target = pd.Series(np.nan, index=df.index)
        picks = {}
        for year in range(pd.Timestamp(start).year + 2, end.year + 1):
            y0 = pd.Timestamp(f"{year}-01-01")
            look = (y0 - pd.Timedelta(days=730), y0 - pd.Timedelta(days=1))
            scores = {n: mx(bt(t, look[0], look[1]))["sharpe"] for n, t in targets.items()}
            best = max(scores, key=scores.get)
            picks[year] = best
            wf_target.loc[y0 - pd.Timedelta(days=1):f"{year}-12-31"] = targets[best]
        wf_start = f"{pd.Timestamp(start).year + 2}-01-01"
        wf = mx(bt(wf_target, wf_start))
        bh = mx(bt(targets["Buy & hold (benchmark)"], wf_start))
        asset["walk_forward"] = {"start": wf_start, "picks": picks, "metrics": wf, "buy_hold": bh}
        print(f"Walk-forward pick-the-winner from {wf_start}: CAGR {pct(wf['cagr'])}, "
              f"MaxDD {pct(wf['max_drawdown'])}  vs buy & hold CAGR {pct(bh['cagr'])}, "
              f"MaxDD {pct(bh['max_drawdown'])}")
        print("  picks:", picks)

        # Robustness: does the simple trend rule depend on a lucky parameter?
        grid = {}
        for n in (50, 100, 150, 200, 250):
            grid[n] = mx(bt(price_above_sma(df, n=n)))
        asset["sma_grid"] = grid
        print("Robustness - 'price above N-day SMA' for N =",
              ", ".join(f"{n}: CAGR {pct(g['cagr'])} / DD {pct(g['max_drawdown'])}" for n, g in grid.items()))

        # Fee sensitivity for the most active strategies.
        fee_test = {}
        for f in (0.0, 0.0025, 0.004, 0.008):
            fee_test[f] = {name: mx(run_backtest(df, STRATEGIES[name](df, sent), start, fee=f,
                                                 slippage=slip))["cagr"]
                           for name in ("MACD trend", "Donchian 20/10 breakout", "Trend ensemble (5 signals)")}
        asset["fee_sensitivity"] = fee_test
        report["assets"][sym] = asset

    with open(OUT / args.out, "w") as fh:
        json.dump(report, fh, indent=1, default=float)
    print(f"\nSaved {OUT / args.out}")


if __name__ == "__main__":
    main()
