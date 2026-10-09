"""Run every strategy on BTC and ETH and report the results.

Usage:
  python run.py                 # bundled CSV data + price-derived mood proxy
  python run.py --fear-greed    # use the real alternative.me Fear & Greed Index
                                # (needs internet access to api.alternative.me)
  python run.py --fee 0.0025    # e.g. maker fee if you use limit orders
"""
import argparse
import json
from pathlib import Path

import numpy as np
import pandas as pd

from backtest import metrics, run_backtest, yearly_returns
from data import fetch_fear_greed, load_csv
from strategies import STRATEGIES, mood_proxy, price_above_sma

ASSETS = {"BTC": "2018-01-01", "ETH": "2019-01-01"}
SPLIT = "2022-01-01"  # results are also reported before/after this date
OUT = Path(__file__).parent / "results"


def pct(x):
    return f"{x * 100:+.0f}%" if np.isfinite(x) else "n/a"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--fear-greed", action="store_true", help="use real Fear & Greed Index")
    ap.add_argument("--fee", type=float, default=0.004)
    ap.add_argument("--slippage", type=float, default=0.001)
    args = ap.parse_args()
    OUT.mkdir(exist_ok=True)

    fng = fetch_fear_greed() if args.fear_greed else None
    report = {"settings": {"fee": args.fee, "slippage": args.slippage, "split": SPLIT,
                           "sentiment": "fear_greed" if fng is not None else "mood_proxy"},
              "assets": {}}

    for sym, start in ASSETS.items():
        df = load_csv(sym)
        if fng is not None:
            sent = fng.reindex(df.index).ffill()
            start = max(pd.Timestamp(start), sent.first_valid_index()).strftime("%Y-%m-%d")
        else:
            sent = mood_proxy(df)
        end = df.index[-1]
        print(f"\n=== {sym}  {start} -> {end.date()}  (fee {args.fee:.2%} + slippage {args.slippage:.2%} per trade)")
        print(f"{'Strategy':38s} {'$10k ->':>10s} {'CAGR':>6s} {'MaxDD':>6s} {'Sharpe':>6s} "
              f"{'pre-22':>7s} {'22-now':>7s} {'InMkt':>6s} {'Trades':>6s}")
        asset = {"start": start, "end": str(end.date()), "strategies": {}}
        for name, fn in STRATEGIES.items():
            target = fn(df, sent)
            full = run_backtest(df, target, start, fee=args.fee, slippage=args.slippage)
            pre = run_backtest(df, target, start, pd.Timestamp(SPLIT) - pd.Timedelta(days=1),
                               fee=args.fee, slippage=args.slippage)
            post = run_backtest(df, target, SPLIT, fee=args.fee, slippage=args.slippage)
            m, mp, mq = metrics(full), metrics(pre), metrics(post)
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
            scores = {n: metrics(run_backtest(df, t, look[0], look[1], fee=args.fee,
                                              slippage=args.slippage))["sharpe"]
                      for n, t in targets.items()}
            best = max(scores, key=scores.get)
            picks[year] = best
            wf_target.loc[y0 - pd.Timedelta(days=1):f"{year}-12-31"] = targets[best]
        wf_start = f"{pd.Timestamp(start).year + 2}-01-01"
        wf = metrics(run_backtest(df, wf_target, wf_start, fee=args.fee, slippage=args.slippage))
        bh = metrics(run_backtest(df, targets["Buy & hold (benchmark)"], wf_start,
                                  fee=args.fee, slippage=args.slippage))
        asset["walk_forward"] = {"start": wf_start, "picks": picks, "metrics": wf, "buy_hold": bh}
        print(f"Walk-forward pick-the-winner from {wf_start}: CAGR {pct(wf['cagr'])}, "
              f"MaxDD {pct(wf['max_drawdown'])}  vs buy & hold CAGR {pct(bh['cagr'])}, "
              f"MaxDD {pct(bh['max_drawdown'])}")
        print("  picks:", picks)

        # Robustness: does the simple trend rule depend on a lucky parameter?
        grid = {}
        for n in (50, 100, 150, 200, 250):
            r = run_backtest(df, price_above_sma(df, n=n), start, fee=args.fee, slippage=args.slippage)
            grid[n] = metrics(r)
        asset["sma_grid"] = grid
        print("Robustness - 'price above N-day SMA' for N =",
              ", ".join(f"{n}: CAGR {pct(g['cagr'])} / DD {pct(g['max_drawdown'])}" for n, g in grid.items()))

        # Fee sensitivity for the most active strategies.
        fee_test = {}
        for f in (0.0, 0.0025, 0.004, 0.008):
            fee_test[f] = {name: metrics(run_backtest(df, STRATEGIES[name](df, sent), start, fee=f,
                                                      slippage=args.slippage))["cagr"]
                           for name in ("MACD trend", "Donchian 20/10 breakout", "Trend ensemble (5 signals)")}
        asset["fee_sensitivity"] = fee_test
        report["assets"][sym] = asset

    with open(OUT / "results.json", "w") as fh:
        json.dump(report, fh, indent=1, default=float)
    print(f"\nSaved {OUT / 'results.json'}")


if __name__ == "__main__":
    main()
