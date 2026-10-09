# Strategy backtester (crypto + S&P 500)

Tests 12 trading strategies (trend-following, mean reversion, sentiment, and
combinations) on daily BTC, ETH and S&P 500 prices, with realistic broker fees
(Kraken Pro or Interactive Brokers for crypto, Interactive Brokers for ETFs).

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
- `python run.py --crypto-fee 0.0018 --assets BTC,ETH --out results_ibkr_crypto.json`
  re-runs crypto at Interactive Brokers' 0.18% rate (the report compares both).
- `--assets BTC,ETH,SP500` picks markets; S&P 500 costs are set in `run.py`.

## Stocks

```bash
pip install pyarrow
python run_stocks.py          # downloads ~165 MB of daily S&P 500 stock prices on first run
python make_stock_report.py   # builds stocks_report.html
```

Tests 9 hand-picked low-debt, high-margin, R&D-heavy stocks (individually and as
portfolios, since 2016), plus a rule-based "hot & steady" stock picker that
uses only point-in-time S&P 500 membership and past prices (since 2012).
The hand-picked results carry hindsight bias; the rule-based test does not.

## Rebalancer (core + satellite portfolio)

Keeps 70% in an S&P 500 fund and 30% split across the 9 quality stocks.
Dry run by default; nothing is traded without `--execute` and a typed `YES`.

```bash
# Practice account (simulated $10,000, prices = latest close in the dataset)
python rebalance.py --mode paper --config rebalancer/portfolio_us.json
python rebalance.py --mode paper --config rebalancer/portfolio_us.json --execute

# PKO BP has no trading API: list holdings (ticker,shares) and prices (ticker,price) in CSVs,
# get orders_to_enter.csv to type into PKO supermakler
python rebalance.py --mode manual --broker-fees pko --config rebalancer/portfolio_eu.json \
    --holdings my_holdings.csv --prices my_prices.csv --cash 2500

# Interactive Brokers paper account: run TWS or IB Gateway, enable the API (port 7497)
pip install ib_async
python rebalance.py --mode ibkr --config rebalancer/portfolio_eu.json            # plan only
python rebalance.py --mode ibkr --config rebalancer/portfolio_eu.json --execute  # place limit orders
```

- `portfolio_eu.json` uses the iShares Core S&P 500 UCITS ETF (CSPX) because EU
  residents generally can't buy US-listed ETFs such as SPY. Check the contract
  details in your broker before trading.
- Positions within 2 points of target are left alone; rebalancing orders whose
  fee would exceed 1% of the order are skipped (matters with PKO's $10 minimum).
- Whole shares only: a stock whose single share costs more than double its
  target is skipped, with the account size needed to hold it.
- The live IBKR port (7496) is refused unless you add `--live`.
- `python run_brokers.py` compares PKO BP and IBKR costs on this portfolio.

## Files

| File | What it does |
|---|---|
| `data.py` | Loads the CSVs in `data/`; Kraken public OHLC and Fear & Greed fetchers |
| `strategies.py` | Indicators and the 12 strategies (each returns a 0–1 position) |
| `backtest.py` | Engine (next-day-open execution, fees, slippage) and metrics |
| `run.py` | Runs everything, splits results before/after 2022, walk-forward and robustness tests |
| `make_report.py` | HTML report (crypto + S&P 500) |
| `stock_data.py` | Downloads and loads the stock dataset and point-in-time index membership |
| `portfolio.py` | Monthly-rebalanced multi-stock portfolio engine |
| `run_stocks.py` | Stock picks, screens and all stock backtests |
| `make_stock_report.py` | HTML stock report |
| `run_brokers.py` | PKO BP vs Interactive Brokers cost comparison |
| `rebalance.py`, `rebalancer/` | Rebalancing tool: planner, paper / IBKR / manual (PKO) brokers, configs |
| `test_backtest.py`, `test_rebalancer.py` | Tests (`python test_backtest.py && python test_rebalancer.py`) |

## Assumptions

- Signal at day t's close, trade at day t+1's open: no look-ahead (tested).
- 0.40% taker fee + 0.10% slippage per trade, long-only spot, no leverage, idle cash earns 0%.
- Taxes are not modelled.
- `data/sp500.csv` is the S&P 500 index, price only: no dividends (~1.5–2%/yr),
  and idle cash earns no interest in any test.
- `data/btc.csv` and `data/eth.csv` are daily USD candles (from the public
  `Mario-SO/ohlcv` GitHub dataset), spot-checked against known historical closes.
  Kraken's API only returns the latest 720 daily candles, so it can't supply
  multi-year history in one call.

This is research code, not financial advice. Past performance does not predict future results.
