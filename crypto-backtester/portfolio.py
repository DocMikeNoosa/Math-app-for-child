"""Multi-stock portfolio backtest engine (monthly rebalancing).

Execution model:
  * Target weights are decided from data up to the close of the last trading
    day of each month, and traded at the NEXT trading day's close.
  * Between rebalances, holdings drift with prices (no daily rebalancing).
  * Each rebalance pays fee + slippage on the value traded.
  * Prices are dividend-adjusted, so returns include reinvested dividends.
  * A stock whose price series ends (delisted/acquired) is sold at its last
    available price and the proceeds sit in cash until the next rebalance.
"""
import numpy as np
import pandas as pd


def month_end_days(index: pd.DatetimeIndex) -> pd.DatetimeIndex:
    s = pd.Series(index, index=index)
    return pd.DatetimeIndex(s.groupby([index.year, index.month]).max().values)


def run_portfolio(prices: pd.DataFrame, weight_fn, start, end=None, capital=10_000.0,
                  fee=0.0001, slippage=0.0005):
    """prices: wide adj-close DataFrame. weight_fn(date) -> dict ticker->weight
    (sum <= 1, remainder in cash), using only data up to `date`."""
    px = prices.loc[:end]
    days = px.loc[start:].index
    decision_days = set(month_end_days(px.index))
    tickers = list(px.columns)
    col = {t: i for i, t in enumerate(tickers)}
    P = px.to_numpy()
    pos = {d: i for i, d in enumerate(px.index)}
    cost_rate = fee + slippage

    shares = np.zeros(len(tickers))
    cash = capital
    pending = None
    equity, turnover, n_rebal = [], 0.0, 0
    last_px = np.full(len(tickers), np.nan)
    for d in days:
        i = pos[d]
        row = P[i]
        alive = ~np.isnan(row)
        last_px = np.where(alive, row, last_px)
        # Liquidate positions whose price history has ended.
        dead = (shares != 0) & ~alive
        if dead.any():
            cash += float((shares[dead] * last_px[dead]).sum())
            shares[dead] = 0.0
        value = cash + float(np.nansum(shares * np.where(alive, row, 0.0)))
        if pending is not None:
            target = np.zeros(len(tickers))
            for t, w in pending.items():
                if t in col and alive[col[t]]:
                    target[col[t]] = w
            cur = shares * np.where(alive, row, 0.0)
            want = target * value
            trade = want - cur
            cost = np.abs(trade).sum() * cost_rate
            value_after = value - cost
            want = target * value_after
            with np.errstate(divide="ignore", invalid="ignore"):
                shares = np.where(alive & (target > 0), want / row, 0.0)
            cash = value_after - float(want.sum())
            turnover += float(np.abs(trade).sum()) / value
            n_rebal += 1
            value = value_after
            pending = None
        equity.append(value)
        if d in decision_days:
            pending = weight_fn(d)
    eq = pd.Series(equity, index=days)
    return eq, {"rebalances": n_rebal, "avg_turnover": turnover / max(n_rebal, 1)}


def stats(eq: pd.Series, periods_per_year=252) -> dict:
    r = eq.pct_change().dropna()
    years = (eq.index[-1] - eq.index[0]).days / 365.25
    dd = eq / eq.cummax() - 1
    cagr = (eq.iloc[-1] / eq.iloc[0]) ** (1 / years) - 1
    return {
        "final_value": float(eq.iloc[-1]),
        "total_return": float(eq.iloc[-1] / eq.iloc[0] - 1),
        "cagr": float(cagr),
        "max_drawdown": float(dd.min()),
        "volatility": float(r.std() * np.sqrt(periods_per_year)),
        "sharpe": float(r.mean() / r.std() * np.sqrt(periods_per_year)),
    }
