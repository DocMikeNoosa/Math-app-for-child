"""Daily US stock prices for the stock backtests.

Source: the free, nightly-refreshed `Johnbrick123/sp500-data` dataset on GitHub
(S&P 500 members past and present plus major ETFs, 1995 onward, split- and
dividend-adjusted, with point-in-time index membership). The full file is
~165 MB, so it is downloaded on first use into data/stocks/ (git-ignored)
rather than committed.

Known limitation (stated by the dataset): Yahoo has purged prices for many
companies that left the index, so price coverage of past members is ~76% in
2015 and ~97% in 2024. Missing names skew towards failures, which flatters any
backtest over the full universe, especially before ~2012.
"""
import urllib.request
from pathlib import Path

import pandas as pd

BASE = "https://github.com/Johnbrick123/sp500-data/releases/download/data"
STOCK_DIR = Path(__file__).parent / "data" / "stocks"
FILES = ("prices.parquet", "membership_intervals.parquet", "recycled_tickers.csv")


def download(force: bool = False) -> None:
    STOCK_DIR.mkdir(parents=True, exist_ok=True)
    for name in FILES:
        dest = STOCK_DIR / name
        if dest.exists() and not force:
            continue
        print(f"downloading {name} ...")
        tmp = dest.with_suffix(dest.suffix + ".part")
        urllib.request.urlretrieve(f"{BASE}/{name}", tmp)
        tmp.rename(dest)


def load_prices(tickers=None, start=None) -> pd.DataFrame:
    """Long table: date, ticker, open, high, low, close, adj_close, volume."""
    download()
    cols = ["date", "ticker", "open", "high", "low", "close", "adj_close", "volume"]
    filters = []
    if tickers is not None:
        filters.append(("ticker", "in", list(tickers)))
    if start is not None:
        filters.append(("date", ">=", pd.Timestamp(start)))
    df = pd.read_parquet(STOCK_DIR / "prices.parquet", columns=cols, filters=filters or None)
    df["date"] = pd.to_datetime(df["date"])
    return df.sort_values(["ticker", "date"])


def adjusted_ohlcv(long_df: pd.DataFrame, ticker: str) -> pd.DataFrame:
    """One ticker as a daily OHLCV frame on a total-return basis.

    `close` is split-adjusted only; `adj_close` also reinvests dividends. Scale
    open/high/low by the same factor so every column is on the adj_close basis.
    """
    d = long_df[long_df["ticker"] == ticker].set_index("date").sort_index()
    f = d["adj_close"] / d["close"]
    out = pd.DataFrame({
        "Open": d["open"] * f, "High": d["high"] * f, "Low": d["low"] * f,
        "Close": d["adj_close"], "Volume": d["volume"],
    }).dropna(subset=["Close"])
    out.index.name = "Date"
    return out


def wide_adj_close(long_df: pd.DataFrame) -> pd.DataFrame:
    return long_df.pivot(index="date", columns="ticker", values="adj_close").sort_index()


def membership() -> pd.DataFrame:
    """[start, end) S&P 500 membership spans per ticker, minus recycled symbols."""
    download()
    m = pd.read_parquet(STOCK_DIR / "membership_intervals.parquet")
    recycled = pd.read_csv(STOCK_DIR / "recycled_tickers.csv")
    bad = set(recycled.iloc[:, 0].astype(str))
    m = m[~m["ticker"].isin(bad)].copy()
    m["start"] = pd.to_datetime(m["start"])
    m["end"] = pd.to_datetime(m["end"])
    return m


def members_on(m: pd.DataFrame, date: pd.Timestamp) -> list:
    live = (m["start"] <= date) & (m["end"].isna() | (m["end"] > date))
    return sorted(m.loc[live, "ticker"].unique())
