"""Build report.html from results/results.json (run run.py first)."""
import html
import json
import math
from pathlib import Path

HERE = Path(__file__).parent
R = json.loads((HERE / "results" / "results.json").read_text())

CHART_SERIES = [
    ("Buy & hold (benchmark)", "--s0"),
    ("Ensemble + vol targeting", "--s1"),
    ("Donchian 20/10 breakout", "--s2"),
    ("Trend + sentiment", "--s3"),
]
HIGHLIGHT = {"Ensemble + vol targeting"}


def pct(x, signed=True):
    if x is None or not math.isfinite(x):
        return "n/a"
    return f"{x * 100:+.0f}%" if signed else f"{x * 100:.0f}%"


def money(x):
    return f"${x:,.0f}"


def chart_series(asset):
    # On the S&P 500 the 50/200 crossover is the strategy worth showing.
    if asset["name"] == "S&P 500":
        return [(n if n != "Donchian 20/10 breakout" else "SMA 50/200 crossover", v) for n, v in CHART_SERIES]
    return CHART_SERIES


def chart(asset):
    W, H, L, Rm, T, B = 760, 320, 64, 16, 14, 30
    series_list = chart_series(asset)
    series = {n: asset["strategies"][n]["equity_weekly"] for n, _ in series_list}
    vals = [v for s in series.values() for _, v in s]
    lo, hi = math.log10(min(vals) * 0.9), math.log10(max(vals) * 1.1)
    dates = [d for d, _ in series[series_list[0][0]]]
    span = int(dates[-1][:4]) - int(dates[0][:4])
    step = 1 if span <= 12 else (2 if span <= 20 else 4)
    n = len(dates)

    def x(i):
        return L + (W - L - Rm) * i / (n - 1)

    def y(v):
        return T + (H - T - B) * (hi - math.log10(v)) / (hi - lo)

    parts = []
    for tick in (1e3, 2e3, 5e3, 1e4, 2e4, 5e4, 1e5, 2e5, 5e5):
        if lo <= math.log10(tick) <= hi:
            ty = y(tick)
            parts.append(f'<line x1="{L}" x2="{W - Rm}" y1="{ty:.1f}" y2="{ty:.1f}" class="grid"/>'
                         f'<text x="{L - 8}" y="{ty + 4:.1f}" class="axis" text-anchor="end">${tick / 1000:g}k</text>')
    last_year = None
    for i, d in enumerate(dates):
        yr = d[:4]
        if yr != last_year and d[5:7] == "01" and int(yr) % step == 0:
            parts.append(f'<line x1="{x(i):.1f}" x2="{x(i):.1f}" y1="{T}" y2="{H - B}" class="grid"/>'
                         f'<text x="{x(i):.1f}" y="{H - 10}" class="axis" text-anchor="middle">{yr}</text>')
            last_year = yr
    ty = y(10_000)
    parts.append(f'<line x1="{L}" x2="{W - Rm}" y1="{ty:.1f}" y2="{ty:.1f}" class="base"/>')
    for name, var in series_list:
        pts = " ".join(f"{x(i):.1f},{y(v):.1f}" for i, (_, v) in enumerate(series[name]))
        w = 2.4 if name in HIGHLIGHT else 1.5
        parts.append(f'<polyline points="{pts}" fill="none" stroke="var({var})" stroke-width="{w}" '
                     f'stroke-linejoin="round"/>')
    legend = "".join(
        f'<span class="key"><i style="background:var({var})"></i>{html.escape(name)} '
        f'<b>{money(asset["strategies"][name]["full"]["final_value"])}</b></span>'
        for name, var in series_list)
    return (f'<div class="chart"><svg viewBox="0 0 {W} {H}" role="img" '
            f'aria-label="Growth of $10,000, log scale">{"".join(parts)}</svg></div>'
            f'<div class="legend">{legend}</div>')


def table(asset):
    split = asset["split"][:4]
    rows = []
    bh = asset["strategies"]["Buy & hold (benchmark)"]["full"]
    for name, s in asset["strategies"].items():
        m, a, b = s["full"], s["pre_split"], s["post_split"]
        cls = ' class="hl"' if name in HIGHLIGHT else (' class="bench"' if "benchmark" in name else "")
        beat = "up" if m["cagr"] > bh["cagr"] else "down"
        dd_better = "up" if m["max_drawdown"] > bh["max_drawdown"] + 0.05 else ""
        rows.append(
            f"<tr{cls}><th scope=row>{html.escape(name)}</th>"
            f"<td>{money(m['final_value'])}</td>"
            f"<td class='{beat if 'benchmark' not in name else ''}'>{pct(m['cagr'])}</td>"
            f"<td class='{dd_better}'>{pct(m['max_drawdown'])}</td>"
            f"<td>{m['sharpe']:.2f}</td><td>{pct(a['total_return'])}</td><td>{pct(b['total_return'])}</td>"
            f"<td>{pct(m['time_in_market'], False)}</td><td>{m['trades']}</td></tr>")
    return ("<div class='scroll'><table><thead><tr><th scope=col>Strategy</th><th>$10k became</th>"
            f"<th>Per year</th><th>Worst drop</th><th>Sharpe</th><th>Before {split}</th><th>{split} on</th>"
            "<th>In market</th><th>Trades</th></tr></thead><tbody>" + "".join(rows) + "</tbody></table></div>")


def asset_section(sym, asset):
    wf = asset["walk_forward"]
    picks = "".join(f"<li><span>{y}</span>{html.escape(p)}</li>" for y, p in wf["picks"].items())
    grid = " · ".join(f"{n}-day: {pct(g['cagr'])}/yr" for n, g in asset["sma_grid"].items())
    name = asset["name"]
    pair = "S&amp;P 500 index" if sym == "SP500" else f"{sym}/USD"
    split = asset["split"][:4]
    return f"""
<section id="{sym.lower()}">
  <h2>{name} <small>{pair} · {asset['start']} to {asset['end']} · {(asset['fee'] + asset['slippage']) * 100:.2f}% cost per trade</small></h2>
  <h3>Growth of $10,000 (log scale)</h3>
  {chart(asset)}
  <h3>All strategies</h3>
  {table(asset)}
  <div class="pair">
    <div>
      <h3>Pick-the-winner, without hindsight</h3>
      <p>Each January, switch to whichever strategy had the best Sharpe ratio over the previous two years.</p>
      <p class="big">{pct(wf['metrics']['cagr'])}<span>/yr, worst drop {pct(wf['metrics']['max_drawdown'])}</span></p>
      <p class="muted">Buy &amp; hold over the same period ({wf['start'][:4]} on): {pct(wf['buy_hold']['cagr'])}/yr, worst drop {pct(wf['buy_hold']['max_drawdown'])}.</p>
      <ul class="picks">{picks}</ul>
    </div>
    <div>
      <h3>Parameter sensitivity</h3>
      <p>The simple "price above its N-day average" rule gives very different results depending on N:</p>
      <p class="mono">{grid}</p>
      <p class="muted">Small changes in a setting swing results by double digits. That's a sign the edge is noisy, and that a setting tuned to the past may not hold up.</p>
    </div>
  </div>
</section>"""


btc, eth, spx = R["assets"]["BTC"], R["assets"]["ETH"], R["assets"]["SP500"]
IB_FILE = HERE / "results" / "results_ibkr_crypto.json"
IB = json.loads(IB_FILE.read_text())["assets"] if IB_FILE.exists() else None


def fee_rows():
    rows = []
    for sym, kr in (("BTC", btc), ("ETH", eth)):
        ib = IB[sym]
        for name in ("Buy & hold (benchmark)", "Donchian 20/10 breakout", "Trend ensemble (5 signals)",
                     "Ensemble + vol targeting"):
            k, i = kr["strategies"][name]["full"], ib["strategies"][name]["full"]
            rows.append(f"<tr><th scope=row>{sym} · {html.escape(name)}</th><td>{money(k['final_value'])}</td>"
                        f"<td>{money(i['final_value'])}</td><td class='up'>{money(i['final_value'] - k['final_value'])}</td></tr>")
    return "".join(rows)


def fee_section():
    if IB is None:
        return ""
    return f"""
<section id="fees">
  <h2>Kraken Pro vs Interactive Brokers <small>same strategies, different crypto fees</small></h2>
  <p>Kraken Pro charges a {btc['fee'] * 100:.2f}% taker fee at its entry tier. Interactive Brokers charges {IB['BTC']['fee'] * 100:.2f}% of trade value for crypto (US$1.75 minimum per order). Both runs add the same {btc['slippage'] * 100:.2f}% slippage. Active strategies keep noticeably more of their gains at the lower fee.</p>
  <div class="scroll"><table class="narrow"><thead><tr><th scope=col>$10k became</th><th>Kraken Pro</th><th>Interactive Brokers</th><th>Difference</th></tr></thead>
  <tbody>{fee_rows()}</tbody></table></div>
  <p class="muted">Interactive Brokers only offers a handful of coins (Bitcoin and Ethereum included), held through Paxos or Zero Hash and not covered by SIPC. Confirm current fees on each broker's site before trading.</p>
</section>"""
s = R["settings"]
sent_label = ("the real Crypto Fear &amp; Greed Index" if s["sentiment"] == "fear_greed"
              else "a price-based market-mood score (momentum, volatility and volume)")

page = f"""<title>Trading Strategy Backtest</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;800&family=JetBrains+Mono:wght@400;600&display=swap">
<style>
/* Layout: single reading column; wide tables and charts scroll inside their own boxes. */
:root {{
  --bg:#f6f7f8; --panel:#ffffff; --fg:#14202b; --muted:#5a6773; --line:#d9dee3;
  --accent:#0f7b74; --up:#16794a; --down:#b3402e; --hl:#e3f2ef;
  --s0:#8a96a1; --s1:#0f7b74; --s2:#c07a12; --s3:#7a4fb5;
  --display:"Archivo", "Helvetica Neue", Arial, sans-serif;
  --body:"Archivo", "Helvetica Neue", Arial, sans-serif;
  --mono:"JetBrains Mono", ui-monospace, Menlo, Consolas, monospace;
}}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{
  --bg:#0f161c; --panel:#162029; --fg:#e4eaef; --muted:#93a1ad; --line:#2a3743;
  --accent:#4cc3b5; --up:#5cc98d; --down:#ee7f6a; --hl:#183a38;
  --s0:#7d8a96; --s1:#4cc3b5; --s2:#e2a23f; --s3:#a888e0; color-scheme:dark; }} }}
:root[data-theme="dark"] {{
  --bg:#0f161c; --panel:#162029; --fg:#e4eaef; --muted:#93a1ad; --line:#2a3743;
  --accent:#4cc3b5; --up:#5cc98d; --down:#ee7f6a; --hl:#183a38;
  --s0:#7d8a96; --s1:#4cc3b5; --s2:#e2a23f; --s3:#a888e0; color-scheme:dark; }}
body {{ background:var(--bg); color:var(--fg); font:16px/1.55 var(--body); }}
main {{ max-width:980px; margin:0 auto; padding-inline:20px; padding-block:40px 64px; display:grid; gap:48px; }}
h1,h2,h3 {{ font-family:var(--display); text-wrap:balance; margin:0; }}
h1 {{ font-size:clamp(28px,5vw,42px); font-weight:800; letter-spacing:-0.02em; }}
h2 {{ font-size:28px; font-weight:800; border-bottom:2px solid var(--fg); padding-bottom:8px; }}
h2 small {{ font:400 14px var(--mono); color:var(--muted); margin-left:8px; }}
h3 {{ font-size:13px; text-transform:uppercase; letter-spacing:0.08em; color:var(--muted); font-weight:600; margin-top:28px; margin-bottom:10px; }}
p {{ margin:0 0 12px; max-width:68ch; }}
.muted {{ color:var(--muted); font-size:14px; }}
.mono {{ font-family:var(--mono); font-size:13px; }}
header {{ display:grid; gap:14px; }}
.eyebrow {{ font:600 12px var(--mono); letter-spacing:0.1em; text-transform:uppercase; color:var(--accent); }}
.verdict {{ background:var(--panel); border:1px solid var(--line); border-left:4px solid var(--accent); padding:20px 22px; display:grid; gap:10px; }}
.verdict p {{ margin:0; }}
.verdict ul {{ margin:0; padding-left:20px; display:grid; gap:6px; }}
.scroll {{ overflow-x:auto; border:1px solid var(--line); background:var(--panel); }}
table {{ border-collapse:collapse; width:100%; font-size:14px; min-width:820px; }}
table.narrow {{ min-width:560px; }}
th,td {{ padding:8px 10px; text-align:right; border-bottom:1px solid var(--line); white-space:nowrap; font-variant-numeric:tabular-nums; }}
td {{ font-family:var(--mono); font-size:13px; }}
thead th {{ font-size:12px; color:var(--muted); font-weight:600; text-transform:uppercase; letter-spacing:0.04em; }}
th[scope=row], thead th:first-child {{ text-align:left; font-weight:600; }}
tr.hl {{ background:var(--hl); }}
tr.bench th, tr.bench td {{ color:var(--muted); }}
td.up {{ color:var(--up); }} td.down {{ color:var(--down); }}
.chart {{ background:var(--panel); border:1px solid var(--line); padding:10px; overflow-x:auto; }}
.chart svg {{ width:100%; min-width:560px; height:auto; display:block; }}
.grid {{ stroke:var(--line); stroke-width:1; }}
.base {{ stroke:var(--muted); stroke-dasharray:4 4; stroke-width:1; }}
.axis {{ fill:var(--muted); font:11px var(--mono); }}
.legend {{ display:flex; flex-wrap:wrap; gap:8px 20px; margin-top:10px; font-size:14px; }}
.key {{ display:inline-flex; align-items:center; gap:8px; }}
.key i {{ width:18px; height:3px; display:inline-block; }}
.key b {{ font-family:var(--mono); font-weight:600; font-size:13px; }}
.pair {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:32px; align-items:start; }}
.pair > div {{ min-width:0; }}
.big {{ font:800 34px var(--display); margin:4px 0 6px; }}
.big span {{ font:400 14px var(--body); color:var(--muted); margin-left:6px; }}
.picks {{ list-style:none; padding:0; margin:8px 0 0; display:grid; grid-template-columns:repeat(auto-fill,minmax(250px,1fr)); gap:4px 16px; font-size:14px; }}
.picks span {{ font-family:var(--mono); color:var(--muted); display:inline-block; width:52px; }}
.notes {{ display:grid; gap:14px; }}
.notes ol {{ margin:0; padding-left:22px; display:grid; gap:10px; max-width:72ch; }}
footer {{ color:var(--muted); font-size:13px; border-top:1px solid var(--line); padding-top:16px; }}
</style>
<main>
<header>
  <div class="eyebrow">Daily data · Bitcoin · Ethereum · S&amp;P 500 · long-only</div>
  <h1>Trading Strategy Backtest</h1>
  <p>Twelve strategies run on real daily Bitcoin, Ethereum and S&amp;P 500 prices: trend-following, mean reversion, sentiment, and combinations of them. Crypto trades pay a {btc['fee'] * 100:.2f}% Kraken Pro taker fee plus {btc['slippage'] * 100:.2f}% slippage. S&amp;P 500 trades assume an ETF such as SPY bought through Interactive Brokers: about {spx['fee'] * 100:.2f}% commission plus {spx['slippage'] * 100:.2f}% slippage. Signals use only data available at that day's close and are traded at the next day's open.</p>
  <div class="verdict">
    <p><strong>The short answer (written for the bundled run below).</strong> In crypto, combining several trend signals and cutting position size when volatility is high (<em>Ensemble + vol targeting</em>) was the most consistent strategy. It had the best risk-adjusted return on both coins and roughly halved the worst crash. It did <em>not</em> reliably make more money than simply holding. In the S&amp;P 500, almost nothing beat holding.</p>
    <ul>
      <li>Bitcoin: {money(btc['strategies']['Ensemble + vol targeting']['full']['final_value'])} vs {money(btc['strategies']['Buy & hold (benchmark)']['full']['final_value'])} for buy &amp; hold, worst drop {pct(btc['strategies']['Ensemble + vol targeting']['full']['max_drawdown'])} vs {pct(btc['strategies']['Buy & hold (benchmark)']['full']['max_drawdown'])}.</li>
      <li>Ethereum: {money(eth['strategies']['Ensemble + vol targeting']['full']['final_value'])} vs {money(eth['strategies']['Buy & hold (benchmark)']['full']['final_value'])} for buy &amp; hold, worst drop {pct(eth['strategies']['Ensemble + vol targeting']['full']['max_drawdown'])} vs {pct(eth['strategies']['Buy & hold (benchmark)']['full']['max_drawdown'])}.</li>
      <li>Mean reversion (RSI, Bollinger) and the contrarian sentiment rule lost money or badly lagged. Adding the sentiment layer to trend-following made results worse, not better.</li>
      <li>S&amp;P 500 since 2000: only the 50/200-day crossover edged out buy &amp; hold ({pct(spx['strategies']['SMA 50/200 crossover']['full']['cagr'])} vs {pct(spx['strategies']['Buy & hold (benchmark)']['full']['cagr'])} a year, price only), while cutting the worst drop from {pct(spx['strategies']['Buy & hold (benchmark)']['full']['max_drawdown'])} to {pct(spx['strategies']['SMA 50/200 crossover']['full']['max_drawdown'])}. Every other strategy earned less than holding.</li>
      <li>Picking each year's strategy using only past results earned less than buy &amp; hold in all three markets.</li>
    </ul>
  </div>
</header>
{asset_section('BTC', btc)}
{asset_section('ETH', eth)}
{fee_section()}
{asset_section('SP500', spx)}
<section class="notes">
  <h2>How to read this</h2>
  <ol>
    <li><strong>S&amp;P 500 is price only.</strong> The index data leaves out dividends (roughly 1.5–2% a year), which mostly benefit buy &amp; hold since it's always invested. The backtest also gives idle cash no interest, which understates strategies that spend time in cash. The two effects partly cancel. An ETF also charges a small yearly fee (about 0.03–0.09%).</li>
    <li><strong>Sentiment data.</strong> Crypto used {sent_label}; the S&amp;P 500 always used the price-based mood score. The real Fear &amp; Greed Index and historical news headlines couldn't be downloaded from the environment this was built in. Running <code>python run.py --fear-greed</code> on your own computer uses the real index.</li>
    <li><strong>Choosing the best of twelve is biased.</strong> Some strategy will always look best on past data by luck. The walk-forward test is the fairer estimate, and it lagged buy &amp; hold.</li>
    <li><strong>Past results don't predict future ones.</strong> Most of the gains came from a few huge bull runs (2020–21, 2023–24). In a long sideways market, trend strategies lose small amounts repeatedly.</li>
    <li><strong>Not included:</strong> taxes (every sell can be a taxable event), interest on idle cash, exchange outages, and execution delays beyond the slippage allowance.</li>
    <li><strong>"Worst drop"</strong> is the largest fall from a previous high. <strong>Sharpe</strong> is return per unit of volatility; higher is better, and buy &amp; hold is the reference.</li>
  </ol>
</section>
<footer>Price data: daily BTC-USD and ETH-USD candles and the S&amp;P 500 index, cross-checked against known historical closes. Results generated by the backtester in <code>crypto-backtester/</code>. This is research, not financial advice.</footer>
</main>
"""
(HERE / "report.html").write_text(page)
print("wrote", HERE / "report.html")
