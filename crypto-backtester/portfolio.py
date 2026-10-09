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


def decision_days_for(index: pd.DatetimeIndex, frequency: str = "M") -> set:
    """Last trading day of each month (M), quarter (Q) or year (A)."""
    me = month_end_days(index)
    months = {"M": range(1, 13), "Q": (3, 6, 9, 12), "A": (12,)}[frequency]
    return {d for d in me if d.month in months}


def run_portfolio(prices: pd.DataFrame, weight_fn, start, end=None, capital=10_000.0,
                  fee=0.0001, slippage=0.0005, min_fee=0.0, custody_annual=0.0,
                  frequency="M", band=None, max_cost_pct=0.01):
    """prices: wide adj-close DataFrame. weight_fn(date) -> dict ticker->weight
    (sum <= 1, remainder in cash), using only data up to `date`.

    min_fee:        minimum commission per order in dollars (e.g. 10 at PKO BP).
    custody_annual: yearly custody fee as a fraction of holdings (e.g. 0.0015).
    frequency:      rebalance check at month (M), quarter (Q) or year (A) ends.
    band:           if set, only positions whose weight is more than `band`
                    away from target are traded (e.g. 0.02 = 2 points).
    max_cost_pct:   skip any rebalancing order whose fee would exceed this share
                    of the order's value (a $10 minimum fee on a $50 trade is 20%).
                    Orders that open a new position are always placed.
    """
    px = prices.loc[:end]
    days = px.loc[start:].index
    decision_days = decision_days_for(px.index, frequency)
    tickers = list(px.columns)
    col = {t: i for i, t in enumerate(tickers)}
    P = px.to_numpy()
    pos = {d: i for i, d in enumerate(px.index)}
    cost_rate = fee + slippage
    daily_custody = custody_annual / 252

    shares = np.zeros(len(tickers))
    cash = capital
    pending = None
    equity, turnover, n_rebal, n_orders, total_cost = [], 0.0, 0, 0, 0.0
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
        held = shares * np.where(alive, row, 0.0)
        if daily_custody:
            c = float(held.sum()) * daily_custody
            cash -= c
            total_cost += c
        value = cash + float(held.sum())
        if pending is not None:
            target = np.zeros(len(tickers))
            for t, w in pending.items():
                if t in col and alive[col[t]]:
                    target[col[t]] = w
            cur_w = held / value
            trade = target * value - held
            if band is not None:
                new_position = (held == 0) & (target > 0)          # always open new positions
                trade = np.where((np.abs(target - cur_w) > band) | new_position, trade, 0.0)
            fee_if = np.maximum(min_fee, np.abs(trade) * cost_rate)
            opening = (held == 0) & (target > 0)                    # always open new positions
            worth_it = (np.abs(trade) >= 1.0) & ((fee_if <= max_cost_pct * np.abs(trade)) | opening)
            trade = np.where(worth_it, trade, 0.0)
            traded = trade != 0
            costs = np.where(traded, fee_if, 0.0)
            # Pay fees from the buys so cash never goes negative.
            buys = trade > 0
            budget = cash - trade[~buys].sum() - costs.sum()   # cash after sells and fees
            if buys.any() and trade[buys].sum() > budget:
                trade[buys] *= max(budget, 0.0) / trade[buys].sum()
            with np.errstate(divide="ignore", invalid="ignore"):
                shares = shares + np.where(traded & alive, trade / row, 0.0)
            cash -= float(trade.sum() + costs.sum())
            total_cost += float(costs.sum())
            turnover += float(np.abs(trade).sum()) / value
            n_orders += int(traded.sum())
            n_rebal += 1
            value = cash + float((shares * np.where(alive, row, 0.0)).sum())
            pending = None
        equity.append(value)
        if d in decision_days:
            pending = weight_fn(d)
    eq = pd.Series(equity, index=days)
    return eq, {"rebalances": n_rebal, "avg_turnover": turnover / max(n_rebal, 1),
                "orders": n_orders, "total_costs": total_cost}


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
