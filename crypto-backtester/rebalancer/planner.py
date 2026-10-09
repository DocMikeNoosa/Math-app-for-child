"""Order planning for a fixed-weight portfolio (pure logic, no broker calls).

Given current holdings, cash, prices and target weights, work out the
whole-share orders that bring the portfolio back to target, while
  * leaving positions alone when they're within `band` of target,
  * skipping orders whose fee would be more than `max_cost_pct` of the order
    (important with a broker minimum such as PKO BP's $10), except orders that
    open a new position or fully close one that's no longer wanted,
  * selling before buying and never spending more cash than is available.
"""
import math
from dataclasses import dataclass, field


@dataclass(frozen=True)
class FeeModel:
    rate: float = 0.0001         # commission as a fraction of order value
    min_fee: float = 1.0         # minimum commission per order (account currency)
    slippage: float = 0.0005     # allowance for spread/price movement

    def fee(self, value: float) -> float:
        return max(self.min_fee, abs(value) * self.rate)


BROKER_FEES = {
    # Interactive Brokers fixed pricing, US stocks: $0.005/share, $1 minimum.
    "ibkr": FeeModel(rate=0.0001, min_fee=1.0),
    # BM PKO BP foreign markets: 0.28%, minimum $10 (check the current price list).
    "pko": FeeModel(rate=0.0028, min_fee=10.0),
    "paper": FeeModel(rate=0.0001, min_fee=1.0),
}


@dataclass
class Order:
    ticker: str
    side: str            # "BUY" or "SELL"
    quantity: int
    price: float
    est_fee: float
    reason: str

    @property
    def value(self) -> float:
        return self.quantity * self.price


@dataclass
class Plan:
    orders: list
    total_value: float
    weights_before: dict
    weights_after: dict
    skipped: list = field(default_factory=list)
    est_fees: float = 0.0
    cash_after: float = 0.0


def plan_orders(targets: dict, positions: dict, prices: dict, cash: float, fees: FeeModel,
                band: float = 0.02, max_cost_pct: float = 0.01, cash_buffer: float = 0.005) -> Plan:
    """targets: ticker -> weight (sum <= 1). positions: ticker -> shares. prices: ticker -> price."""
    if abs(sum(targets.values()) - 1.0) > 1e-6 and sum(targets.values()) > 1.0:
        raise ValueError("target weights add up to more than 100%")
    tickers = sorted(set(targets) | {t for t, q in positions.items() if q})
    missing = [t for t in tickers if not prices.get(t) or prices[t] <= 0]
    if missing:
        raise ValueError(f"no price for: {', '.join(missing)}")

    holding = {t: positions.get(t, 0) * prices[t] for t in tickers}
    total = cash + sum(holding.values())
    if total <= 0:
        raise ValueError("portfolio is empty")
    investable = total * (1 - cash_buffer)
    before = {t: holding[t] / total for t in tickers}

    sells, buys, skipped = [], [], []
    for t in tickers:
        w = targets.get(t, 0.0)
        held = positions.get(t, 0)
        diff = w * investable - holding[t]
        opening = held == 0 and w > 0
        closing = held > 0 and w == 0
        if not (opening or closing) and abs(before[t] - w) <= band:
            continue
        # Round down here; spare cash is handed out share by share further below.
        qty = held if closing else math.floor(abs(diff) / prices[t])
        if qty <= 0:
            if opening:
                need = prices[t] / (2 * w) / (1 - cash_buffer)
                skipped.append((t, "BUY", 0, f"one share (${prices[t]:,.0f}) is more than double its target "
                                f"of ${w * investable:,.0f}; needs an account of about ${need:,.0f}"))
            else:
                skipped.append((t, "SELL" if diff < 0 else "BUY", 0,
                                f"off target by ${abs(diff):,.0f}, less than one share (${prices[t]:,.0f})"))
            continue
        side = "SELL" if diff < 0 else "BUY"
        value = qty * prices[t]
        fee = fees.fee(value)
        if not (opening or closing) and fee > max_cost_pct * value:
            skipped.append((t, side, qty, f"fee ${fee:.2f} is {fee / value:.1%} of a ${value:,.0f} order"))
            continue
        reason = "open position" if opening else "close position" if closing else \
            f"weight {before[t]:.1%} vs target {w:.1%}"
        (sells if side == "SELL" else buys).append(Order(t, side, qty, prices[t], fee, reason))

    # Cash available for buys: current cash + sale proceeds - all sell fees, minus slippage allowance.
    available = cash + sum(o.value * (1 - fees.slippage) - o.est_fee for o in sells)
    buys.sort(key=lambda o: o.value, reverse=True)
    final_buys = []
    for o in buys:
        unit = o.price * (1 + fees.slippage)
        qty = o.quantity
        while qty > 0 and qty * unit + fees.fee(qty * o.price) > available:
            qty -= 1
        if qty <= 0:
            skipped.append((o.ticker, "BUY", o.quantity, "not enough cash"))
            continue
        o = Order(o.ticker, "BUY", qty, o.price, fees.fee(qty * o.price), o.reason)
        available -= qty * unit + o.est_fee
        final_buys.append(o)

    # Spend leftover cash one share at a time on the most underweight holdings,
    # as long as each extra share moves that holding closer to its target.
    planned = {t: positions.get(t, 0) * prices[t] for t in tickers}
    for o in sells + final_buys:
        planned[o.ticker] += (o.value if o.side == "BUY" else -o.value)
    by_ticker = {o.ticker: o for o in final_buys}
    sold = {o.ticker for o in sells}
    while True:
        best, best_short = None, 0.0
        for t in tickers:
            w = targets.get(t, 0.0)
            short = w * investable - planned[t]
            if w == 0 or t in sold or short < prices[t] / 2:
                continue
            existing = by_ticker.get(t)
            extra_fee = (fees.fee((existing.quantity + 1) * prices[t]) - existing.est_fee) if existing \
                else fees.fee(prices[t])
            if not existing and extra_fee > max_cost_pct * prices[t] and positions.get(t, 0) > 0:
                continue
            if prices[t] * (1 + fees.slippage) + extra_fee > available:
                continue
            if short > best_short:
                best, best_short, best_fee = t, short, extra_fee
        if best is None:
            break
        o = by_ticker.get(best)
        if o:
            by_ticker[best] = Order(best, "BUY", o.quantity + 1, o.price, o.est_fee + best_fee, o.reason)
        else:
            reason = "open position" if positions.get(best, 0) == 0 else "top up with spare cash"
            by_ticker[best] = Order(best, "BUY", 1, prices[best], best_fee, reason)
        available -= prices[best] * (1 + fees.slippage) + best_fee
        planned[best] += prices[best]
    final_buys = sorted(by_ticker.values(), key=lambda o: -o.value)
    skipped = [s for s in skipped if not (s[1] == "BUY" and s[0] in by_ticker)]

    orders = sells + final_buys
    after_hold = dict(holding)
    after_cash = cash
    for o in orders:
        sign = 1 if o.side == "BUY" else -1
        after_hold[o.ticker] += sign * o.value
        after_cash -= sign * o.value + o.est_fee
    after_total = after_cash + sum(after_hold.values())
    after = {t: after_hold[t] / after_total for t in tickers}
    return Plan(orders, total, before, after, skipped, sum(o.est_fee for o in orders), after_cash)
