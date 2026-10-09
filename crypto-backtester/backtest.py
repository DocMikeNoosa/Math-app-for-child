"""Backtest engine and performance metrics.

Execution model (deliberately conservative):
  * Signal computed from day t's close, traded at day t+1's open.
  * Every trade pays a taker fee plus slippage on the traded amount.
    Defaults: 0.40% fee (Kraken Pro entry-tier taker rate - check your own
    tier) + 0.10% slippage.
  * Long-only spot, no leverage, no shorting. Idle cash earns nothing.
  * Positions drift with price; we only rebalance when the target differs
    from the current weight by more than `rebalance_band`, so fractional
    strategies don't pay fees for tiny daily adjustments.
"""
from dataclasses import dataclass

import numpy as np
import pandas as pd


@dataclass
class Result:
    equity: pd.Series      # account value, indexed by date (open of each day)
    weight: pd.Series      # fraction invested after each day's trade
    trades: int
    fees_paid: float


def run_backtest(df, target, start, end=None, capital=10_000.0,
                 fee=0.004, slippage=0.001, rebalance_band=0.10):
    opens = df["Open"]
    # Target decided at close of t-1 is executed at open of t.
    exec_target = target.shift(1)
    idx = df.loc[start:end].index
    o = opens.loc[idx].to_numpy()
    tgt = exec_target.loc[idx].fillna(0.0).clip(0, 1).to_numpy()
    cost_rate = fee + slippage

    equity = np.empty(len(idx))
    weights = np.empty(len(idx))
    cash, units = capital, 0.0
    trades, fees = 0, 0.0
    for i in range(len(idx)):
        price = o[i]
        value = cash + units * price
        w = units * price / value if value > 0 else 0.0
        t = tgt[i]
        if abs(t - w) > rebalance_band or (t == 0 and w > 0) or (t == 1 and w < 0.98):
            trade_value = (t - w) * value
            if trade_value > 0:  # leave room for fees so cash never goes negative
                trade_value /= 1 + cost_rate
            cost = abs(trade_value) * cost_rate
            units += trade_value / price
            cash -= trade_value + cost
            fees += cost
            trades += 1
            value = cash + units * price
        equity[i] = value
        weights[i] = units * price / value if value > 0 else 0.0
    return Result(pd.Series(equity, idx), pd.Series(weights, idx), trades, fees)


def metrics(res: Result, periods_per_year: int = 365) -> dict:
    eq = res.equity
    rets = eq.pct_change().dropna()
    years = (eq.index[-1] - eq.index[0]).days / 365.25
    total = eq.iloc[-1] / eq.iloc[0] - 1
    cagr = (eq.iloc[-1] / eq.iloc[0]) ** (1 / years) - 1 if years > 0 else np.nan
    dd = eq / eq.cummax() - 1
    vol = rets.std() * np.sqrt(periods_per_year)
    sharpe = rets.mean() / rets.std() * np.sqrt(periods_per_year) if rets.std() > 0 else np.nan
    downside = rets[rets < 0].std() * np.sqrt(periods_per_year)
    return {
        "final_value": eq.iloc[-1],
        "total_return": total,
        "cagr": cagr,
        "max_drawdown": dd.min(),
        "volatility": vol,
        "sharpe": sharpe,
        "sortino": rets.mean() * periods_per_year / downside if downside > 0 else np.nan,
        "calmar": cagr / abs(dd.min()) if dd.min() < 0 else np.nan,
        "time_in_market": res.weight.mean(),
        "trades": res.trades,
        "fees_paid": res.fees_paid,
    }


def yearly_returns(res: Result) -> pd.Series:
    eq = res.equity
    yearly = eq.groupby(eq.index.year).last()
    first = eq.iloc[0]
    prev = yearly.shift(1)
    prev.iloc[0] = first
    return yearly / prev - 1
