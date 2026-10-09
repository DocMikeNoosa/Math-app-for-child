# Crypto strategy backtester

Tests 12 trading strategies (trend-following, mean reversion, sentiment, and
combinations) on daily BTC and ETH prices, with Kraken Pro fees and slippage.

## Run it

```bash
pip install pandas numpy
python run.py                 # prints results, writes results/results.json
python make_report.py         # builds report.html from the results
python test_backtest.py       # engine sanity tests
```

Options:
- `python run.py --fear-greed` uses the real Crypto Fear & Greed Index from
  alternative.me (needs internet). Without it, a price-based mood score stands in.
- `python run.py --fee 0.0025` tests a different fee (e.g. maker/limit orders).

## Files

| File | What it does |
|---|---|
| `data.py` | Loads the CSVs in `data/`; Kraken public OHLC and Fear & Greed fetchers |
| `strategies.py` | Indicators and the 12 strategies (each returns a 0–1 position) |
| `backtest.py` | Engine (next-day-open execution, fees, slippage) and metrics |
| `run.py` | Runs everything, splits results before/after 2022, walk-forward and robustness tests |
| `make_report.py` | HTML report |

## Assumptions

- Signal at day t's close, trade at day t+1's open: no look-ahead (tested).
- 0.40% taker fee + 0.10% slippage per trade, long-only spot, no leverage, idle cash earns 0%.
- Taxes are not modelled.
- `data/btc.csv` and `data/eth.csv` are daily USD candles (from the public
  `Mario-SO/ohlcv` GitHub dataset), spot-checked against known historical closes.
  Kraken's API only returns the latest 720 daily candles, so it can't supply
  multi-year history in one call.

This is research code, not financial advice. Past performance does not predict future results.
