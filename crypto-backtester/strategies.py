"""Indicators and strategies.

Every strategy takes a daily OHLCV DataFrame (plus an optional sentiment series)
and returns a target position series in [0, 1] (0 = all cash, 1 = fully
invested). The value on day t may only use data up to and including day t's
close; the engine executes it at the NEXT day's open, so there is no look-ahead.

Parameters are textbook defaults chosen up front, NOT optimised on this data,
to avoid curve-fitting the past.
"""
import numpy as np
import pandas as pd


# ---------------------------------------------------------------- indicators

def sma(s, n):
    return s.rolling(n, min_periods=n).mean()


def ema(s, n):
    return s.ewm(span=n, adjust=False, min_periods=n).mean()


def rsi(close, n=14):
    delta = close.diff()
    gain = delta.clip(lower=0).ewm(alpha=1 / n, adjust=False, min_periods=n).mean()
    loss = (-delta.clip(upper=0)).ewm(alpha=1 / n, adjust=False, min_periods=n).mean()
    rs = gain / loss.replace(0, np.nan)
    return (100 - 100 / (1 + rs)).fillna(100)


def periods_per_year(df):
    """Bars per year: 365 for crypto, 252 for stocks (set in df.attrs by run.py)."""
    return df.attrs.get("periods_per_year", 365)


def realized_vol(close, n=30, ann=365):
    """Annualised volatility of daily log returns."""
    return np.log(close).diff().rolling(n, min_periods=n).std() * np.sqrt(ann)


def rolling_pct_rank(s, n=365):
    """Where today's value sits within the trailing n days, 0..1 (no look-ahead)."""
    return s.rolling(n, min_periods=n // 2).apply(lambda w: (w[:-1] < w[-1]).mean(), raw=True)


def mood_proxy(df):
    """Price-derived market-mood score 0 (extreme fear) .. 100 (extreme greed).

    Stand-in for the Crypto Fear & Greed Index when it isn't available. It uses
    three of that index's published inputs that can be computed from price
    data: momentum, volatility (high vol = fear) and volume surges. It does NOT
    see news or social media, so it's a proxy, not true news sentiment.
    """
    c = df["Close"]
    year = periods_per_year(df)
    momentum = rolling_pct_rank(c / sma(c, 90) - 1, year)
    calm = 1 - rolling_pct_rank(realized_vol(c, 30), year)
    vol_surge = rolling_pct_rank(df["Volume"].rolling(7).mean() / df["Volume"].rolling(90).mean(), year)
    # Volume surges during rallies read as greed, during sell-offs as fear.
    direction = np.sign(c.pct_change(7)).replace(0, 1)
    volume_score = 0.5 + direction * (vol_surge - 0.5)
    return (100 * (0.5 * momentum + 0.25 * calm + 0.25 * volume_score)).rename("mood")


def _hold(entry, exit_):
    """Turn entry/exit boolean signals into a 0/1 position that persists."""
    state = pd.Series(np.nan, index=entry.index)
    state[exit_] = 0.0
    state[entry] = 1.0
    return state.ffill().fillna(0.0)


# ---------------------------------------------------------------- strategies

def buy_and_hold(df, sent=None):
    return pd.Series(1.0, index=df.index)


def sma_crossover(df, sent=None, fast=50, slow=200):
    """'Golden cross': long while the 50-day average is above the 200-day."""
    c = df["Close"]
    return (sma(c, fast) > sma(c, slow)).astype(float)


def price_above_sma(df, sent=None, n=200):
    """Long while price closes above its 200-day average."""
    c = df["Close"]
    return (c > sma(c, n)).astype(float)


def donchian_breakout(df, sent=None, entry_n=20, exit_n=10):
    """Turtle-style: buy a new 20-day high, sell a new 10-day low."""
    entry = df["Close"] > df["High"].rolling(entry_n).max().shift(1)
    exit_ = df["Close"] < df["Low"].rolling(exit_n).min().shift(1)
    return _hold(entry, exit_)


def macd_trend(df, sent=None):
    """Long while MACD(12,26) is above its 9-day signal line."""
    c = df["Close"]
    macd = ema(c, 12) - ema(c, 26)
    return (macd > ema(macd, 9)).astype(float)


def rsi_mean_reversion(df, sent=None):
    """Buy oversold (RSI<30), sell when it recovers above 55."""
    r = rsi(df["Close"])
    return _hold(r < 30, r > 55)


def bollinger_reversion(df, sent=None, n=20, k=2.0):
    """Buy a close below the lower Bollinger band, sell back at the middle band."""
    c = df["Close"]
    mid = sma(c, n)
    lower = mid - k * c.rolling(n).std()
    return _hold(c < lower, c > mid)


def sentiment_contrarian(df, sent):
    """'Be greedy when others are fearful': buy extreme fear, sell extreme greed."""
    return _hold(sent < 20, sent > 80)


def trend_plus_sentiment(df, sent):
    """Trend-following that is sentiment-aware.

    * Uptrend (price > 200-day avg): fully invested, but trim to 50% in
      extreme greed (sentiment > 85) - euphoric tops.
    * Downtrend: stay in cash, except take a 50% contrarian position in
      extreme fear (sentiment < 15) - capitulation bottoms.
    """
    up = price_above_sma(df)
    pos = pd.Series(0.0, index=df.index)
    pos[(up == 1) & (sent <= 85)] = 1.0
    pos[(up == 1) & (sent > 85)] = 0.5
    pos[(up == 0) & (sent < 15)] = 0.5
    return pos


def trend_ensemble(df, sent=None):
    """Vote of five trend signals; position = fraction of signals that are long."""
    votes = [
        price_above_sma(df, n=50),
        price_above_sma(df, n=200),
        sma_crossover(df),
        donchian_breakout(df),
        macd_trend(df),
    ]
    return sum(votes) / len(votes)


def vol_target(df, pos, target=None, cap=1.0):
    """Scale a position so expected volatility is ~target (no leverage).

    Default target comes from df.attrs: 50% for crypto, 15% for stock indexes
    (both a bit below each market's long-run volatility).
    """
    target = target or df.attrs.get("vol_target", 0.50)
    vol = realized_vol(df["Close"], 30, periods_per_year(df))
    return (pos * (target / vol).clip(upper=cap)).fillna(0.0)


def ensemble_vol_targeted(df, sent=None):
    """Trend ensemble, sized down when the market is unusually volatile."""
    return vol_target(df, trend_ensemble(df))


def all_combined(df, sent):
    """Trend ensemble + sentiment overlay + volatility targeting."""
    pos = trend_ensemble(df)
    pos = pos.where(sent <= 85, pos * 0.5)                     # trim euphoria
    pos = pos.where(~((pos < 0.5) & (sent < 15)), 0.5)         # buy capitulation
    return vol_target(df, pos)


STRATEGIES = {
    "Buy & hold (benchmark)": buy_and_hold,
    "SMA 50/200 crossover": sma_crossover,
    "Price above 200-day SMA": price_above_sma,
    "Donchian 20/10 breakout": donchian_breakout,
    "MACD trend": macd_trend,
    "RSI mean reversion": rsi_mean_reversion,
    "Bollinger mean reversion": bollinger_reversion,
    "Sentiment contrarian": sentiment_contrarian,
    "Trend + sentiment": trend_plus_sentiment,
    "Trend ensemble (5 signals)": trend_ensemble,
    "Ensemble + vol targeting": ensemble_vol_targeted,
    "Ensemble + sentiment + vol targeting": all_combined,
}
