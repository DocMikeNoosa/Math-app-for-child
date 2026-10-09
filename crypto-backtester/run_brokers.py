"""Compare PKO BP vs Interactive Brokers costs on the core + satellite portfolio.

Portfolio: 70% S&P 500 index fund + 30% split equally across the 9 quality picks.
The index part uses SPY's total-return prices as a stand-in for an S&P 500 UCITS
ETF (EU residents generally can't buy US-listed ETFs such as SPY).

Usage:  python run_brokers.py      Writes: results/brokers.json
"""
import json
from pathlib import Path

from portfolio import run_portfolio, stats
from run_stocks import PICKS
from stock_data import load_prices, wide_adj_close

OUT = Path(__file__).parent / "results"
START = "2016-01-04"
CORE, CORE_W = "SPY", 0.70
TARGETS = {CORE: CORE_W, **{t: (1 - CORE_W) / len(PICKS) for t in PICKS}}

# Cost models (check current price lists before relying on them):
BROKERS = {
    # BM PKO BP, foreign markets: 0.28% per order, minimum 10 USD; custody of
    # foreign instruments 0.15% a year; ~1% FX spread converting PLN->USD once.
    "PKO BP": dict(fee=0.0028, min_fee=10.0, custody_annual=0.0015, fx_once=0.01),
    # Interactive Brokers fixed: $0.005/share (~0.01% of a typical order), $1
    # minimum; no custody fee; FX conversion ~0.002% (negligible).
    "Interactive Brokers": dict(fee=0.0001, min_fee=1.0, custody_annual=0.0, fx_once=0.00002),
}
POLICIES = {
    "Monthly": dict(frequency="M"),
    "Quarterly": dict(frequency="Q"),
    "Yearly": dict(frequency="A"),
    "When 2+ points off (checked monthly)": dict(frequency="M", band=0.02),
    "Never (buy once and hold)": dict(frequency="A", band=1.0),
}
SIZES = (10_000, 25_000, 50_000, 100_000)


def main():
    px = wide_adj_close(load_prices(list(TARGETS), start="2015-01-01"))
    out = {"targets": TARGETS, "start": START, "end": str(px.index[-1].date()), "runs": []}
    for size in SIZES:
        print(f"\n=== Starting with ${size:,}")
        for broker, c in BROKERS.items():
            for pol, p in POLICIES.items():
                eq, info = run_portfolio(px, lambda d: TARGETS, START, capital=size * (1 - c["fx_once"]),
                                         fee=c["fee"], slippage=0.0005, min_fee=c["min_fee"],
                                         custody_annual=c["custody_annual"], **p)
                s = stats(eq)
                end_value = s["final_value"]
                cagr = (end_value / size) ** (1 / ((eq.index[-1] - eq.index[0]).days / 365.25)) - 1
                out["runs"].append({"size": size, "broker": broker, "policy": pol, "final_value": end_value,
                                    "cagr": cagr, "max_drawdown": s["max_drawdown"], "orders": info["orders"],
                                    "costs": info["total_costs"] + size * c["fx_once"]})
                print(f"{broker:20s} {pol:38s} ${end_value:>10,.0f}  {cagr * 100:5.1f}%/yr  "
                      f"orders {info['orders']:4d}  fees+custody+FX ${info['total_costs'] + size * c['fx_once']:>8,.0f}")
    OUT.mkdir(exist_ok=True)
    with open(OUT / "brokers.json", "w") as fh:
        json.dump(out, fh, indent=1)
    print("\nSaved", OUT / "brokers.json")


if __name__ == "__main__":
    main()
