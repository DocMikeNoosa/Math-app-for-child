"""Keep a fixed-weight portfolio on target.

Dry run by default: it prints the plan and changes nothing. Add --execute to act.

Examples
  # Practice with a simulated $10,000 account (prices: latest close in the dataset)
  python rebalance.py --mode paper --config rebalancer/portfolio_us.json
  python rebalance.py --mode paper --config rebalancer/portfolio_us.json --execute

  # PKO BP (no API): list your holdings in a CSV, get an order list to enter in PKO supermakler
  python rebalance.py --mode manual --broker-fees pko --config rebalancer/portfolio_eu.json \\
      --holdings my_holdings.csv --cash 2500 --prices my_prices.csv

  # Interactive Brokers paper account (TWS/IB Gateway running, API enabled, port 7497)
  python rebalance.py --mode ibkr --config rebalancer/portfolio_eu.json
  python rebalance.py --mode ibkr --config rebalancer/portfolio_eu.json --execute
"""
import argparse
import csv
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

from rebalancer.brokers import IBKRBroker, ManualBroker, PaperBroker
from rebalancer.planner import BROKER_FEES, plan_orders

HERE = Path(__file__).parent
LOG = HERE / "rebalancer" / "trade_log.csv"


def load_price_csv(path):
    with open(path, newline="") as fh:
        return {r["ticker"].strip().upper(): float(r["price"]) for r in csv.DictReader(fh)}


def dataset_prices(tickers):
    """Latest actual closing price per ticker from the stock dataset."""
    from stock_data import load_prices
    df = load_prices(tickers, start="2025-01-01")
    df = df.dropna(subset=["close"]).sort_values("date")
    last = df.groupby("ticker").tail(1).set_index("ticker")
    return {t: float(last.at[t, "close"]) for t in last.index}, str(df["date"].max().date())


def print_plan(plan, cash):
    print(f"\nPortfolio value: ${plan.total_value:,.2f}  (cash ${cash:,.2f})")
    print(f"{'Ticker':8s} {'Now':>7s} {'After':>7s}")
    for t in sorted(plan.weights_before, key=lambda k: -plan.weights_after.get(k, 0)):
        print(f"{t:8s} {plan.weights_before[t]:>7.1%} {plan.weights_after[t]:>7.1%}")
    if plan.orders:
        print("\nOrders:")
        for o in plan.orders:
            print(f"  {o.side:4s} {o.quantity:>6d} {o.ticker:6s} @ ~${o.price:,.2f}  = ${o.value:>10,.2f}  "
                  f"fee ~${o.est_fee:.2f}   ({o.reason})")
        print(f"Estimated fees: ${plan.est_fees:.2f}   Cash left after orders: ~${plan.cash_after:,.2f}")
    else:
        print("\nNo orders needed: everything is within its band.")
    for t, side, q, why in plan.skipped:
        print(f"  skipped {side} {q} {t}: {why}")


def log_fills(mode, fills):
    new = not LOG.exists()
    with open(LOG, "a", newline="") as fh:
        w = csv.writer(fh)
        if new:
            w.writerow(["time", "mode", "ticker", "side", "quantity", "price_or_limit", "fee", "status"])
        now = datetime.now(timezone.utc).isoformat(timespec="seconds")
        for f in fills:
            w.writerow([f.get("time", now), mode, f["ticker"], f["side"], f["quantity"],
                        f.get("fill", f.get("limit")), f.get("fee", ""), f.get("status", "filled")])


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--mode", choices=["paper", "manual", "ibkr"], required=True)
    ap.add_argument("--config", required=True)
    ap.add_argument("--execute", action="store_true", help="actually place the orders")
    ap.add_argument("--broker-fees", choices=sorted(BROKER_FEES), help="fee model (default: by mode)")
    ap.add_argument("--prices", help="CSV with ticker,price (overrides dataset prices)")
    ap.add_argument("--paper-state", default=str(HERE / "rebalancer" / "paper_account.json"))
    ap.add_argument("--paper-cash", type=float, default=10_000.0, help="starting cash for a new paper account")
    ap.add_argument("--holdings", help="manual mode: CSV with ticker,shares")
    ap.add_argument("--cash", type=float, default=0.0, help="manual mode: cash available in USD")
    ap.add_argument("--port", type=int, default=7497, help="ibkr: 7497 = paper (default), 7496 = live")
    ap.add_argument("--live", action="store_true", help="ibkr: required to use the live port 7496")
    ap.add_argument("--yes", action="store_true", help="skip the confirmation prompt")
    args = ap.parse_args(argv)

    cfg = json.loads(Path(args.config).read_text())
    targets = cfg["targets"]
    fees = BROKER_FEES[args.broker_fees or {"paper": "paper", "manual": "pko", "ibkr": "ibkr"}[args.mode]]

    if args.mode == "ibkr" and args.port == 7496 and not args.live:
        sys.exit("Port 7496 is a LIVE account. Add --live if you really mean it.")

    if args.mode == "paper":
        broker = PaperBroker(Path(args.paper_state), fees, args.paper_cash)
    elif args.mode == "manual":
        if not args.holdings:
            sys.exit("manual mode needs --holdings (CSV with ticker,shares; it may list no rows)")
        broker = ManualBroker(Path(args.holdings), args.cash)
    else:
        broker = IBKRBroker(cfg["ibkr_contracts"], port=args.port)

    cash, positions = broker.account()
    tickers = sorted(set(targets) | set(positions))
    if args.mode == "ibkr":
        prices, asof = broker.prices(tickers), "live"
    else:
        prices, asof = {}, "your prices file"
        missing = tickers
        if args.prices:
            prices = load_price_csv(args.prices)
            missing = [t for t in tickers if t not in prices]
        if missing:
            ds, asof = dataset_prices(missing)
            prices.update(ds)
    print(f"Prices as of: {asof}")

    plan = plan_orders(targets, positions, prices, cash, fees, band=cfg.get("band", 0.02),
                       max_cost_pct=cfg.get("max_cost_pct", 0.01), cash_buffer=cfg.get("cash_buffer", 0.005))
    print_plan(plan, cash)

    too_big = [o for o in plan.orders if o.value > cfg.get("max_order_value", float("inf"))]
    if too_big:
        sys.exit(f"Refusing: {len(too_big)} order(s) exceed max_order_value in the config.")

    if args.mode == "manual":
        out = Path(args.holdings).with_name("orders_to_enter.csv")
        broker.write_orders(plan.orders, out)
        print(f"\nWrote {out}. Enter these in PKO supermakler yourself, then update your holdings CSV.")
        return plan
    if not args.execute or not plan.orders:
        print("\nDry run: nothing was traded. Add --execute to place these orders.")
        return plan
    if not args.yes:
        where = "PAPER account" if args.mode == "paper" or args.port == 7497 else "LIVE account"
        if input(f"\nPlace {len(plan.orders)} orders in your {where}? Type YES: ").strip() != "YES":
            print("Cancelled.")
            return plan
    fills = [broker.place(o, prices[o.ticker]) for o in plan.orders]
    broker.save()
    log_fills(args.mode, fills)
    print(f"\nPlaced {len(fills)} orders. Logged to {LOG}.")
    return plan


if __name__ == "__main__":
    main()
