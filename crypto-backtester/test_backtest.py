"""Sanity tests for the engine. Run: python -m pytest -q  (or python test_backtest.py)"""
import numpy as np
import pandas as pd

from backtest import metrics, run_backtest
from data import load_csv, parse_kraken_ohlc
from strategies import STRATEGIES, mood_proxy


def _toy(prices):
    idx = pd.date_range("2020-01-01", periods=len(prices), freq="D")
    p = pd.Series(prices, idx, dtype=float)
    return pd.DataFrame({"Open": p, "High": p, "Low": p, "Close": p, "Volume": 1.0})


def test_buy_and_hold_matches_price_ratio_minus_cost():
    df = _toy([100, 110, 121, 133.1])
    res = run_backtest(df, pd.Series(1.0, df.index), df.index[0], fee=0.004, slippage=0.001)
    # Day 0 target is unknown (shifted), so the buy happens at day 1's open (110).
    assert np.isclose(res.equity.iloc[-1], 10_000 / 1.005 * 133.1 / 110)
    assert res.trades == 1


def test_round_trip_costs_fee_twice():
    df = _toy([100] * 5)
    target = pd.Series([1, 1, 0, 0, 0], df.index, dtype=float)
    res = run_backtest(df, target, df.index[0], fee=0.004, slippage=0.001)
    assert res.trades == 2
    assert np.isclose(res.equity.iloc[-1], 10_000 / 1.005 * (1 - 0.005))
    assert res.equity.min() > 0


def test_cash_strategy_is_flat():
    df = _toy([100, 50, 200, 10])
    res = run_backtest(df, pd.Series(0.0, df.index), df.index[0])
    assert (res.equity == 10_000).all() and res.trades == 0


def test_no_lookahead_signal_cannot_see_tomorrow():
    """A signal that peeks at the future should look great; the real strategies
    are computed only from past data, so shuffling the future must change
    nothing about today's target."""
    df = load_csv("BTC")
    sent = mood_proxy(df)
    cut = pd.Timestamp("2022-06-01")
    trunc = df.loc[:cut]
    sent_trunc = mood_proxy(trunc)
    for name, fn in STRATEGIES.items():
        full_t = fn(df, sent).loc[:cut]
        trunc_t = fn(trunc, sent_trunc)
        assert np.allclose(full_t.fillna(-1), trunc_t.fillna(-1)), name


def test_engine_timing_rewards_only_future_knowledge():
    df = load_csv("BTC")
    o = df["Open"]
    cheat = (o.shift(-2) > o.shift(-1)).astype(float)   # knows tomorrow's move
    honest_random = pd.Series(np.random.default_rng(0).integers(0, 2, len(df)), df.index, dtype=float)
    m_cheat = metrics(run_backtest(df, cheat, "2018-01-01", fee=0, slippage=0))
    m_rand = metrics(run_backtest(df, honest_random, "2018-01-01", fee=0, slippage=0))
    assert m_cheat["sharpe"] > 5
    assert m_rand["sharpe"] < 1.5


def test_parse_kraken_ohlc_format():
    payload = {"error": [], "result": {
        "XXBTZUSD": [[1700000000, "37000.1", "37500.0", "36800.0", "37200.5", "37100.0", "123.4", 999],
                     [1700086400, "37200.5", "37900.0", "37000.0", "37800.0", "37500.0", "150.0", 1200]],
        "last": 1700086400}}
    df = parse_kraken_ohlc(payload)
    assert list(df.columns) == ["Open", "High", "Low", "Close", "Volume"]
    assert df["Close"].iloc[-1] == 37800.0 and len(df) == 2


def test_portfolio_single_asset_matches_price_ratio():
    from portfolio import run_portfolio
    idx = pd.bdate_range("2021-01-01", periods=80)
    px = pd.DataFrame({"A": np.linspace(100, 180, 80)}, idx)
    eq, info = run_portfolio(px, lambda d: {"A": 1.0}, idx[0], fee=0.0, slippage=0.0)
    first_trade = idx.get_loc(next(d for d in idx if d.month == 2))  # day after Jan month-end
    assert np.isclose(eq.iloc[-1], 10_000 * px["A"].iloc[-1] / px["A"].iloc[first_trade])


def test_portfolio_costs_and_cash_weight():
    from portfolio import run_portfolio
    idx = pd.bdate_range("2021-01-01", periods=60)
    px = pd.DataFrame({"A": 100.0, "B": 50.0}, idx)
    eq, info = run_portfolio(px, lambda d: {"A": 0.25, "B": 0.25}, idx[0], fee=0.001, slippage=0.0)
    # Flat prices: only the first rebalance trades (50% of capital), later ones trade nothing.
    assert np.isclose(eq.iloc[-1], 10_000 - 5_000 * 0.001)


def test_portfolio_delisted_stock_goes_to_cash():
    from portfolio import run_portfolio
    idx = pd.bdate_range("2021-01-01", periods=60)
    a = pd.Series(100.0, idx)
    a.iloc[40:] = np.nan                     # price history ends
    px = pd.DataFrame({"A": a, "B": 50.0})
    eq, _ = run_portfolio(px, lambda d: {"A": 1.0}, idx[0], fee=0.0, slippage=0.0)
    assert np.isclose(eq.iloc[-1], 10_000) and eq.notna().all()


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test_"):
            fn()
            print("PASS", name)
