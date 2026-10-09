"""Tests for the rebalancer. Run: python test_rebalancer.py"""
import csv
import json
import tempfile
from pathlib import Path
from types import SimpleNamespace

from rebalancer.brokers import IBKRBroker, ManualBroker, PaperBroker
from rebalancer.planner import BROKER_FEES, FeeModel, plan_orders

FREE = FeeModel(rate=0.0, min_fee=0.0, slippage=0.0)


def test_initial_buy_hits_targets_and_never_overspends():
    plan = plan_orders({"A": 0.7, "B": 0.3}, {}, {"A": 10.0, "B": 20.0}, 10_000, BROKER_FEES["ibkr"])
    spent = sum(o.value * (1 + BROKER_FEES["ibkr"].slippage) + o.est_fee for o in plan.orders)
    assert spent <= 10_000
    assert abs(plan.weights_after["A"] - 0.7) < 0.01 and abs(plan.weights_after["B"] - 0.3) < 0.01


def test_within_band_means_no_orders():
    plan = plan_orders({"A": 0.5, "B": 0.5}, {"A": 51, "B": 49}, {"A": 100.0, "B": 100.0}, 0, FREE, band=0.02)
    assert plan.orders == []


def test_drift_outside_band_sells_winner_buys_loser():
    plan = plan_orders({"A": 0.5, "B": 0.5}, {"A": 60, "B": 40}, {"A": 100.0, "B": 100.0}, 0, FREE,
                       band=0.02, cash_buffer=0.0)
    sides = {o.ticker: (o.side, o.quantity) for o in plan.orders}
    assert sides == {"A": ("SELL", 10), "B": ("BUY", 10)}
    assert plan.orders[0].side == "SELL"            # sells go first


def test_pko_minimum_fee_skips_small_rebalances_but_opens_positions():
    pko = BROKER_FEES["pko"]
    # B is 4 points over target: trimming ~$400 would cost the $10 minimum = 2.5% > 1% -> skipped.
    plan = plan_orders({"A": 0.5, "B": 0.5}, {"A": 46, "B": 54}, {"A": 100.0, "B": 100.0}, 0, pko,
                       band=0.02, max_cost_pct=0.01, cash_buffer=0.0)
    assert plan.orders == [] and len(plan.skipped) == 2
    # A brand-new position is opened even though the fee is a large share of it.
    plan2 = plan_orders({"A": 0.95, "C": 0.05}, {"A": 100}, {"A": 100.0, "C": 50.0}, 600, pko)
    assert any(o.ticker == "C" and o.side == "BUY" for o in plan2.orders)


def test_unwanted_holding_is_sold_completely():
    plan = plan_orders({"A": 1.0}, {"A": 10, "OLD": 7}, {"A": 100.0, "OLD": 30.0}, 0, FREE)
    old = [o for o in plan.orders if o.ticker == "OLD"]
    assert old and old[0].side == "SELL" and old[0].quantity == 7


def test_expensive_share_is_reported_not_forced():
    plan = plan_orders({"A": 0.97, "X": 0.03}, {}, {"A": 10.0, "X": 900.0}, 10_000, FREE)
    assert not any(o.ticker == "X" for o in plan.orders)
    assert any(s[0] == "X" and "account of about" in s[3] for s in plan.skipped)


def test_missing_price_is_an_error():
    try:
        plan_orders({"A": 1.0}, {}, {}, 1000, FREE)
    except ValueError as e:
        assert "no price" in str(e)
    else:
        raise AssertionError("expected ValueError")


def test_paper_broker_round_trip_persists_state():
    with tempfile.TemporaryDirectory() as d:
        path = Path(d) / "acct.json"
        b = PaperBroker(path, BROKER_FEES["paper"], 5_000)
        cash, pos = b.account()
        plan = plan_orders({"A": 1.0}, pos, {"A": 50.0}, cash, BROKER_FEES["paper"])
        for o in plan.orders:
            b.place(o, 50.0)
        b.save()
        cash2, pos2 = PaperBroker(path, BROKER_FEES["paper"]).account()
        assert pos2["A"] > 90 and 0 <= cash2 < 100
        assert json.loads(path.read_text())["history"]


class FakeIB:
    """Stands in for ib_async.IB with the methods IBKRBroker uses."""
    def __init__(self):
        self.placed = []

    def qualifyContracts(self, *c):
        return list(c)

    def accountValues(self):
        return [SimpleNamespace(tag="CashBalance", value="1500.5", currency="USD"),
                SimpleNamespace(tag="CashBalance", value="999", currency="EUR"),
                SimpleNamespace(tag="NetLiquidation", value="9999", currency="USD")]

    def positions(self):
        return [SimpleNamespace(contract=SimpleNamespace(symbol="CSPX"), position=3.0),
                SimpleNamespace(contract=SimpleNamespace(symbol="ZZZ"), position=5.0)]

    def reqTickers(self, *contracts):
        prices = {"CSPX": 700.0, "NVDA": float("nan")}
        return [SimpleNamespace(marketPrice=lambda s=c.symbol: prices[s], close=230.0) for c in contracts]

    def placeOrder(self, contract, order):
        self.placed.append((contract.symbol, order.action, order.totalQuantity, order.lmtPrice))
        return SimpleNamespace(orderStatus=SimpleNamespace(status="Submitted"))


def test_ibkr_adapter_with_fake_connection():
    fake = FakeIB()
    contracts = {"CSPX": {"symbol": "CSPX", "exchange": "LSEETF", "currency": "USD"},
                 "NVDA": {"symbol": "NVDA", "exchange": "SMART", "currency": "USD"}}
    b = IBKRBroker(contracts, ib=fake)
    cash, pos = b.account()
    assert cash == 1500.5 and pos == {"CSPX": 3}          # other currencies / unknown symbols ignored
    px = b.prices(["CSPX", "NVDA"])
    assert px == {"CSPX": 700.0, "NVDA": 230.0}           # NaN live price falls back to last close
    plan = plan_orders({"CSPX": 0.7, "NVDA": 0.3}, pos, px, cash, BROKER_FEES["ibkr"], cash_buffer=0.0)
    for o in plan.orders:
        b.place(o, px[o.ticker])
    assert fake.placed and all(p[3] > 0 for p in fake.placed)
    buy = [p for p in fake.placed if p[1] == "BUY"][0]
    assert buy[3] == round(px[buy[0]] * 1.005, 2)          # limit just above last price


def test_manual_mode_cli_writes_pko_order_list():
    import rebalance
    with tempfile.TemporaryDirectory() as d:
        d = Path(d)
        (d / "holdings.csv").write_text("ticker,shares\nCSPX,10\nNVDA,4\n")
        (d / "prices.csv").write_text("ticker,price\nCSPX,700\nNVDA,240\nGOOGL,350\n")
        (d / "cfg.json").write_text(json.dumps({"targets": {"CSPX": 0.7, "NVDA": 0.15, "GOOGL": 0.15},
                                                "band": 0.02, "max_cost_pct": 0.01}))
        rebalance.main(["--mode", "manual", "--config", str(d / "cfg.json"), "--holdings", str(d / "holdings.csv"),
                        "--prices", str(d / "prices.csv"), "--cash", "3000"])
        rows = list(csv.DictReader(open(d / "orders_to_enter.csv")))
        assert any(r["ticker"] == "GOOGL" and r["side"] == "BUY" for r in rows)
        assert all(float(r["approx_fee"]) >= 10 for r in rows)   # PKO minimum applied


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test_"):
            fn()
            print("PASS", name)
