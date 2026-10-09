"""Broker connections for the rebalancer.

  PaperBroker   - simulated account stored in a JSON file. Safe for practice.
  IBKRBroker    - Interactive Brokers via the ib_async library. Needs TWS or IB
                  Gateway running locally with the API enabled. Port 7497 is
                  TWS *paper trading*; 7496 is live. Use paper first.
  ManualBroker  - for brokers without an API (e.g. BM PKO BP): reads your
                  holdings from a CSV and produces an order list for you to
                  enter yourself in PKO supermakler.
"""
import csv
import json
from datetime import datetime, timezone
from pathlib import Path

from .planner import FeeModel, Order


class PaperBroker:
    def __init__(self, state_file: Path, fees: FeeModel, starting_cash: float = 10_000.0):
        self.path = Path(state_file)
        self.fees = fees
        if self.path.exists():
            self.state = json.loads(self.path.read_text())
        else:
            self.state = {"cash": starting_cash, "positions": {}, "history": []}

    def account(self):
        return self.state["cash"], {t: q for t, q in self.state["positions"].items() if q}

    def place(self, order: Order, price: float) -> dict:
        """Fill at `price` adjusted for slippage, charge the fee, record it."""
        fill = price * (1 + self.fees.slippage) if order.side == "BUY" else price * (1 - self.fees.slippage)
        fee = self.fees.fee(order.quantity * fill)
        sign = 1 if order.side == "BUY" else -1
        cost = sign * order.quantity * fill + fee
        if order.side == "BUY" and cost > self.state["cash"] + 1e-9:
            raise RuntimeError(f"paper account lacks cash for {order.ticker}")
        held = self.state["positions"].get(order.ticker, 0)
        if order.side == "SELL" and order.quantity > held:
            raise RuntimeError(f"paper account holds only {held} {order.ticker}")
        self.state["cash"] -= cost
        self.state["positions"][order.ticker] = held + sign * order.quantity
        rec = {"time": datetime.now(timezone.utc).isoformat(timespec="seconds"), "ticker": order.ticker,
               "side": order.side, "quantity": order.quantity, "fill": round(fill, 4), "fee": round(fee, 2)}
        self.state["history"].append(rec)
        return rec

    def save(self):
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(json.dumps(self.state, indent=1))


class IBKRBroker:
    """Thin wrapper over ib_async. `contracts` maps ticker -> dict(symbol, exchange, currency)."""

    def __init__(self, contracts: dict, host="127.0.0.1", port=7497, client_id=17, ib=None, currency="USD"):
        if ib is None:
            from ib_async import IB
            ib = IB()
            ib.connect(host, port, clientId=client_id)
        self.ib = ib
        self.currency = currency
        from ib_async import Stock
        self.contracts = {t: Stock(c["symbol"], c.get("exchange", "SMART"), c.get("currency", "USD"))
                          for t, c in contracts.items()}
        self.ib.qualifyContracts(*self.contracts.values())
        self._by_symbol = {c.symbol: t for t, c in self.contracts.items()}

    def account(self):
        cash = sum(float(v.value) for v in self.ib.accountValues()
                   if v.tag == "CashBalance" and v.currency == self.currency)
        positions = {}
        for p in self.ib.positions():
            t = self._by_symbol.get(p.contract.symbol)
            if t is not None and p.position:
                positions[t] = int(p.position)
        return cash, positions

    def prices(self, tickers):
        tick = self.ib.reqTickers(*[self.contracts[t] for t in tickers])
        out = {}
        for t, tk in zip(tickers, tick):
            p = tk.marketPrice()
            if p != p or p <= 0:            # NaN or missing: fall back to last close
                p = tk.close
            out[t] = float(p)
        return out

    def place(self, order: Order, price: float, limit_slack: float = 0.005):
        """Limit order a little through the last price, so it fills but can't run away."""
        from ib_async import LimitOrder
        lmt = round(price * (1 + limit_slack) if order.side == "BUY" else price * (1 - limit_slack), 2)
        trade = self.ib.placeOrder(self.contracts[order.ticker], LimitOrder(order.side, order.quantity, lmt))
        return {"ticker": order.ticker, "side": order.side, "quantity": order.quantity, "limit": lmt,
                "status": getattr(getattr(trade, "orderStatus", None), "status", "submitted")}

    def save(self):
        pass


class ManualBroker:
    """Holdings come from a CSV (ticker,shares) plus a cash amount; orders go to a CSV."""

    def __init__(self, holdings_csv: Path, cash: float):
        self.holdings_csv = Path(holdings_csv)
        self.cash = cash

    def account(self):
        positions = {}
        if self.holdings_csv.exists():
            with open(self.holdings_csv, newline="") as fh:
                for row in csv.DictReader(fh):
                    if row.get("ticker") and row.get("shares"):
                        positions[row["ticker"].strip().upper()] = int(float(row["shares"]))
        return self.cash, positions

    def write_orders(self, orders, path: Path):
        with open(path, "w", newline="") as fh:
            w = csv.writer(fh)
            w.writerow(["side", "ticker", "quantity", "approx_price", "approx_value", "approx_fee", "reason"])
            for o in orders:
                w.writerow([o.side, o.ticker, o.quantity, f"{o.price:.2f}", f"{o.value:.2f}", f"{o.est_fee:.2f}", o.reason])
