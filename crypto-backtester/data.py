"""Price and sentiment data loading.

Sources:
  * Local CSV (Date,Open,High,Low,Close,Volume) - what the bundled backtest uses.
  * Kraken public OHLC API - for running on your own machine. Note Kraken only
    returns the most recent 720 candles per request, so for multi-year daily
    backtests use the CSV source or Kraken's downloadable OHLCVT history files.
  * alternative.me Crypto Fear & Greed Index - a real daily sentiment series
    (2018-02 onward). Not reachable from the sandbox this was built in, so the
    bundled results use a price-derived "market mood" proxy instead
    (see indicators.mood_proxy).
"""
import json
import urllib.request
from pathlib import Path

import pandas as pd

DATA_DIR = Path(__file__).parent / "data"

KRAKEN_PAIRS = {"BTC": "XBTUSD", "ETH": "ETHUSD"}


def load_csv(symbol: str) -> pd.DataFrame:
    """Load daily OHLCV for symbol ('BTC' or 'ETH') from data/<symbol>.csv."""
    df = pd.read_csv(DATA_DIR / f"{symbol.lower()}.csv", parse_dates=["Date"])
    return _clean(df.set_index("Date"))


def _clean(df: pd.DataFrame) -> pd.DataFrame:
    df = df[["Open", "High", "Low", "Close", "Volume"]].astype(float)
    df = df[~df.index.duplicated(keep="last")].sort_index()
    # Crypto trades every day; a handful of days are missing in public datasets.
    # Forward-fill prices (zero volume) so the calendar is continuous.
    full = pd.date_range(df.index[0], df.index[-1], freq="D")
    df = df.reindex(full)
    df["Close"] = df["Close"].ffill()
    for col in ("Open", "High", "Low"):
        df[col] = df[col].fillna(df["Close"])
    df["Volume"] = df["Volume"].fillna(0.0)
    df.index.name = "Date"
    # Drop today's candle if it is still forming (dataset updated intraday).
    if df.index[-1] >= pd.Timestamp.utcnow().tz_localize(None).normalize():
        df = df.iloc[:-1]
    return df


def parse_kraken_ohlc(payload: dict) -> pd.DataFrame:
    """Parse a Kraken /0/public/OHLC JSON response into a DataFrame."""
    if payload.get("error"):
        raise RuntimeError(f"Kraken API error: {payload['error']}")
    result = payload["result"]
    key = next(k for k in result if k != "last")
    rows = result[key]  # [time, open, high, low, close, vwap, volume, count]
    df = pd.DataFrame(rows, columns=["time", "Open", "High", "Low", "Close", "vwap", "Volume", "count"])
    df.index = pd.to_datetime(df["time"].astype(int), unit="s")
    return _clean(df)


def fetch_kraken(symbol: str, interval_minutes: int = 1440) -> pd.DataFrame:
    """Fetch recent OHLC candles from Kraken's public API (no API key needed)."""
    pair = KRAKEN_PAIRS[symbol.upper()]
    url = f"https://api.kraken.com/0/public/OHLC?pair={pair}&interval={interval_minutes}"
    with urllib.request.urlopen(url, timeout=30) as resp:
        return parse_kraken_ohlc(json.load(resp))


def fetch_fear_greed() -> pd.Series:
    """Full daily history of the alternative.me Crypto Fear & Greed Index (0-100)."""
    url = "https://api.alternative.me/fng/?limit=0&format=json"
    with urllib.request.urlopen(url, timeout=30) as resp:
        data = json.load(resp)["data"]
    s = pd.Series(
        [float(d["value"]) for d in data],
        index=pd.to_datetime([int(d["timestamp"]) for d in data], unit="s").normalize(),
        name="fear_greed",
    )
    return s.sort_index()
