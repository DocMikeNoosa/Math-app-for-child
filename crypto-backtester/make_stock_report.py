"""Build stocks_report.html from results/stocks.json (run run_stocks.py first)."""
import html
import json
import math
from pathlib import Path

from report_style import STYLE

HERE = Path(__file__).parent
R = json.loads((HERE / "results" / "stocks.json").read_text())
EXTRA_CSS = """<style>
.callout { background:var(--panel); border:1px solid var(--line); border-left:4px solid var(--s2); padding:16px 20px; }
.callout p { margin:0; }
td.na { color:var(--muted); }
.matrix td { min-width:64px; }
.chips { display:flex; flex-wrap:wrap; gap:8px; margin-top:8px; }
.chip { font:600 13px var(--mono); border:1px solid var(--line); background:var(--panel); padding:4px 10px; }
</style>"""


def pct(x, signed=True):
    if x is None or not math.isfinite(x):
        return "n/a"
    return f"{x * 100:+.0f}%" if signed else f"{x * 100:.0f}%"


def money(x):
    return f"${x:,.0f}"


def chart(series, label):
    """series: list of (name, css_var, equity_weekly, bold)."""
    W, H, L, Rm, T, B = 760, 320, 64, 16, 14, 30
    vals = [v for _, _, s, _ in series for _, v in s]
    lo, hi = math.log10(min(vals) * 0.9), math.log10(max(vals) * 1.1)
    dates = [d for d, _ in series[0][2]]
    n = len(dates)

    def x(i):
        return L + (W - L - Rm) * i / (n - 1)

    def y(v):
        return T + (H - T - B) * (hi - math.log10(v)) / (hi - lo)

    parts = []
    for tick in (5e3, 1e4, 2e4, 5e4, 1e5, 2e5, 5e5, 1e6):
        if lo <= math.log10(tick) <= hi:
            ty = y(tick)
            lab = f"${tick / 1e6:g}M" if tick >= 1e6 else f"${tick / 1000:g}k"
            parts.append(f'<line x1="{L}" x2="{W - Rm}" y1="{ty:.1f}" y2="{ty:.1f}" class="grid"/>'
                         f'<text x="{L - 8}" y="{ty + 4:.1f}" class="axis" text-anchor="end">{lab}</text>')
    span = int(dates[-1][:4]) - int(dates[0][:4])
    step = 1 if span <= 12 else 2
    seen = set()
    for i, d in enumerate(dates):
        yr = d[:4]
        if yr not in seen and d[5:7] == "01" and int(yr) % step == 0:
            seen.add(yr)
            parts.append(f'<line x1="{x(i):.1f}" x2="{x(i):.1f}" y1="{T}" y2="{H - B}" class="grid"/>'
                         f'<text x="{x(i):.1f}" y="{H - 10}" class="axis" text-anchor="middle">{yr}</text>')
    ty = y(10_000)
    parts.append(f'<line x1="{L}" x2="{W - Rm}" y1="{ty:.1f}" y2="{ty:.1f}" class="base"/>')
    for name, var, s, bold in series:
        pts = " ".join(f"{x(i):.1f},{y(v):.1f}" for i, (_, v) in enumerate(s))
        parts.append(f'<polyline points="{pts}" fill="none" stroke="var({var})" '
                     f'stroke-width="{2.4 if bold else 1.5}" stroke-linejoin="round"/>')
    legend = "".join(f'<span class="key"><i style="background:var({var})"></i>{html.escape(name)} '
                     f'<b>{money(s[-1][1])}</b></span>' for name, var, s, _ in series)
    return (f'<div class="chart"><svg viewBox="0 0 {W} {H}" role="img" aria-label="{label}">'
            f'{"".join(parts)}</svg></div><div class="legend">{legend}</div>')


def stats_table(block, highlight, bench_names):
    rows = []
    for name, d in block.items():
        s = d["stats"]
        cls = ' class="hl"' if name == highlight else (' class="bench"' if name in bench_names else "")
        rows.append(f"<tr{cls}><th scope=row>{html.escape(name)}</th><td>{money(s['final_value'])}</td>"
                    f"<td>{pct(s['cagr'])}</td><td>{pct(s['max_drawdown'])}</td><td>{s['sharpe']:.2f}</td>"
                    f"<td>{pct(s['volatility'], False)}</td></tr>")
    return ("<div class='scroll'><table class='narrow'><thead><tr><th scope=col>Strategy</th><th>$10k became</th>"
            "<th>Per year</th><th>Worst drop</th><th>Sharpe</th><th>Volatility</th></tr></thead><tbody>"
            + "".join(rows) + "</tbody></table></div>")


def picks_table():
    rows = []
    for t, p in R["picks"].items():
        sc = R["screen"][t]
        rnd = pct(p["rnd"], False) if p["rnd"] else "<span class='muted'>not verified</span>"
        rows.append(f"<tr><th scope=row>{t} <span class='muted'>{html.escape(p['name'])}</span></th>"
                    f"<td>{pct(p['margin'], False)}</td><td style='text-align:left;white-space:normal;min-width:220px'>{html.escape(p['debt'])}</td>"
                    f"<td>{rnd}</td><td>{pct(sc['vol_3y'], False)}</td><td>{pct(sc['ret_1y'])}</td><td>{pct(sc['cagr_5y'])}</td></tr>")
    spy = R["screen"]["SPY"]
    rows.append(f"<tr class='bench'><th scope=row>SPY <span class='muted'>S&amp;P 500 ETF</span></th><td></td><td></td><td></td>"
                f"<td>{pct(spy['vol_3y'], False)}</td><td>{pct(spy['ret_1y'])}</td><td>{pct(spy['cagr_5y'])}</td></tr>")
    return ("<div class='scroll'><table><thead><tr><th scope=col>Stock</th><th>Net margin</th>"
            "<th style='text-align:left'>Debt</th><th>R&amp;D / revenue</th><th>Volatility (3y)</th>"
            "<th>Past year</th><th>5 years, per year</th></tr></thead><tbody>" + "".join(rows) + "</tbody></table></div>")


def matrix():
    names = ["Buy & hold (benchmark)", "SMA 50/200 crossover", "Price above 200-day SMA", "Donchian 20/10 breakout",
             "MACD trend", "RSI mean reversion", "Trend + sentiment", "Ensemble + vol targeting"]
    ticks = list(R["picks"])
    head = "".join(f"<th>{t}</th>" for t in ticks)
    rows = []
    for n in names:
        cells = []
        for t in ticks:
            v = R["single"][t][n]["cagr"]
            bh = R["single"][t]["Buy & hold (benchmark)"]["cagr"]
            cls = "" if "benchmark" in n else ("up" if v > bh else "down")
            cells.append(f"<td class='{cls}'>{pct(v)}</td>")
        cls = ' class="bench"' if "benchmark" in n else ""
        beat = "" if "benchmark" in n else f" <span class='muted'>({int(R['beat_count'][n])}/9)</span>"
        rows.append(f"<tr{cls}><th scope=row>{html.escape(n)}{beat}</th>{''.join(cells)}</tr>")
    return (f"<div class='scroll'><table class='matrix'><thead><tr><th scope=col>Strategy (stocks beaten)</th>{head}</tr></thead>"
            f"<tbody>{''.join(rows)}</tbody></table></div>")


BR_FILE = HERE / "results" / "brokers.json"
BR = json.loads(BR_FILE.read_text()) if BR_FILE.exists() else None


def broker_section():
    if BR is None:
        return ""
    runs = {(r["size"], r["broker"], r["policy"]): r for r in BR["runs"]}
    pols = ["When 2+ points off (checked monthly)", "Quarterly", "Never (buy once and hold)"]
    rows = []
    for size in (10_000, 50_000, 100_000):
        for pol in pols:
            k, i = runs[(size, "PKO BP", pol)], runs[(size, "Interactive Brokers", pol)]
            rows.append(f"<tr><th scope=row>{money(size)} · {html.escape(pol)}</th>"
                        f"<td>{money(k['costs'])}</td><td>{k['orders']}</td>"
                        f"<td>{money(i['costs'])}</td><td>{i['orders']}</td></tr>")
    return f"""
<section id="brokers">
  <h2>PKO BP vs Interactive Brokers <small>same portfolio, {BR['start']} to {BR['end']}</small></h2>
  <p>The portfolio is 70% S&amp;P 500 fund plus 30% split across the nine picks. The table shows what each broker would have charged in total, including commissions, custody fees and currency conversion. "Orders" counts trades placed. At PKO, rebalancing trades whose $10 minimum fee would be more than 1% of the trade are skipped.</p>
  <div class="scroll"><table class="narrow"><thead><tr><th scope=col>Starting amount · rebalancing</th><th>PKO BP costs</th><th>Orders</th><th>IBKR costs</th><th>Orders</th></tr></thead>
  <tbody>{''.join(rows)}</tbody></table></div>
  <p class="muted">PKO cost model: 0.28% per foreign order with a $10 minimum, 0.15% a year custody on foreign holdings, and about 1% to convert PLN to USD once. Interactive Brokers: about $0.005 per share with a $1 minimum, no custody fee. Costs grow with the portfolio, because custody is charged on its value. Check both brokers' current price lists; PKO's figures come from its website and comparison sites.</p>
  <div class="pair">
    <div>
      <h3>PKO BP at a glance</h3>
      <ul class="picks" style="grid-template-columns:1fr">
        <li>US stocks and ETFs: 0.28%, minimum $10 / 38 PLN per order</li>
        <li>Custody of foreign securities: 0.15% a year</li>
        <li>Currency: use a USD sub-account and PKO's online exchange (about 0.8–1.1% spread)</li>
        <li>No public trading API found: orders go through PKO supermakler by hand</li>
        <li>IKE/IKZE for foreign shares: reported as unavailable (2024); ask PKO to confirm</li>
      </ul>
    </div>
    <div>
      <h3>What that means</h3>
      <p>For a buy-and-hold portfolio of about $50,000 or more, PKO's main cost is the 0.15% yearly custody fee. Below about $25,000, the $10 minimum makes rebalancing small positions expensive. Interactive Brokers is cheaper at every size and has an API. PKO's advantages are a Polish bank account, Polish-language support and tax reporting (PIT-8C).</p>
    </div>
  </div>
</section>"""


P, RB = R["portfolios"], R["rule_based"]
eqw, mom, spy, qqq = (P["Equal weight, rebalanced monthly"], P["Momentum: top 4 of 9 (6-month return)"],
                      P["S&P 500 (SPY)"], P["Nasdaq-100 (QQQ)"])
hs, pm = RB["Hot & steady: top 10 momentum, vol ≤ 55%, above 200-day"], RB["Pure momentum: top 10"]
spyb, qqqb = RB["S&P 500 (SPY)"], RB["Nasdaq-100 (QQQ)"]
near = "".join(f"<li><strong>{html.escape(k)}</strong>: {html.escape(v)}</li>" for k, v in R["near_misses"].items())
now = "".join(f"<span class='chip'>{t}</span>" for t in R["rule_based_now"])
cov = R["coverage"]

page = f"""<title>Quality Stock Backtest</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;800&family=JetBrains+Mono:wght@400;600&display=swap">
{STYLE}
{EXTRA_CSS}
<main>
<header>
  <div class="eyebrow">US stocks · daily data to {R['end']} · dividends reinvested</div>
  <h1>Quality Stock Backtest</h1>
  <p>Nine stocks picked in October 2026 for low debt, high profits, heavy R&amp;D and moderate volatility, all up more than the S&amp;P 500 over the past year. They are tested with the same strategies as the crypto backtest, plus portfolio strategies. A rule-based version picks stocks each month using only what was known at the time. Trades assume Interactive Brokers: {R['fee'] * 100:.2f}% commission plus {R['slippage'] * 100:.2f}% slippage.</p>
  <div class="verdict">
    <p><strong>The short answer.</strong> Holding the nine picks since 2016 turned $10k into {money(eqw['stats']['final_value'])} ({pct(eqw['stats']['cagr'])} a year) against {money(spy['stats']['final_value'])} for the S&amp;P 500. That number is mostly hindsight: these stocks were chosen today <em>because</em> they did well.</p>
    <ul>
      <li>The fair test (a rule that picked hot, steady stocks each month from that month's S&amp;P 500) made {pct(hs['stats']['cagr'])} a year since 2012, the same as the S&amp;P 500's {pct(spyb['stats']['cagr'])}, with a bigger worst drop ({pct(hs['stats']['max_drawdown'])} vs {pct(spyb['stats']['max_drawdown'])}). Simple momentum did a bit better ({pct(pm['stats']['cagr'])}) but still trailed the Nasdaq-100 ({pct(qqqb['stats']['cagr'])}).</li>
      <li>Timing individual stocks with trend or dip-buying rules lost to simply holding them in nearly every case. The best rule beat holding on only {int(max(R['beat_count'].values()))} of 9 stocks. Trend rules did cut the worst drops.</li>
      <li>Among the picks, rotating into the 4 strongest each month earned the most ({pct(mom['stats']['cagr'])} a year). That result is just as inflated by hindsight.</li>
    </ul>
  </div>
</header>

<section id="picks">
  <h2>The picks <small>screened October 2026</small></h2>
  <p>The screen requires all of these: net profit margin above 20% in the latest fiscal year; net cash, or debt below about 1.5× a year's profit; a research-heavy tech or biotech business; three-year volatility of 55% or less; and a past-year return above the S&amp;P 500's. Profit and debt figures come from each company's latest annual report or SEC filing. Volatility and returns come from the price data.</p>
  {picks_table()}
  <h3>Close, but left out</h3>
  <ul class="picks" style="grid-template-columns:1fr">{near}</ul>
  <p class="muted">TSMC and ASML would likely pass the screen but aren't in the S&amp;P 500, so the price dataset doesn't cover them.</p>
</section>

<section id="portfolio">
  <h2>The nine as a portfolio <small>{R['start_a']} to {R['end']}</small></h2>
  <div class="callout"><p><strong>Why these numbers are too good.</strong> In 2016 nobody knew these would be the winners. Picking stocks today for strong recent performance and testing them on the past guarantees a great-looking result. Treat this section as a description of what happened, not a forecast.</p></div>
  <h3>Growth of $10,000 (log scale)</h3>
  {chart([("Equal weight, rebalanced monthly", "--s1", eqw['equity_weekly'], True),
          ("Momentum: top 4 of 9", "--s2", mom['equity_weekly'], False),
          ("Nasdaq-100 (QQQ)", "--s3", qqq['equity_weekly'], False),
          ("S&P 500 (SPY)", "--s0", spy['equity_weekly'], False)], "Growth of $10,000 in the nine picks")}
  <h3>Portfolio strategies</h3>
  {stats_table(P, "Equal weight, rebalanced monthly", {"S&P 500 (SPY)", "Nasdaq-100 (QQQ)"})}
  <p class="muted">Each month, weights are set from that month's closing data and traded the next day. The trend filter holds a stock only while it's above its 200-day average, otherwise that slot sits in cash. Momentum holds the 4 picks with the best 6-month return. Inverse-volatility gives calmer stocks bigger weights.</p>
</section>

{broker_section()}

<section id="timing">
  <h2>Timing each stock on its own <small>yearly return since {R['start_a'][:4]}</small></h2>
  <p>The crypto strategies were applied to each stock separately. Green means the rule beat simply holding that stock; red means it lost.</p>
  {matrix()}
  <p class="muted">Trend rules reduced the worst drops, for example Nvidia's from {pct(R['single']['NVDA']['Buy & hold (benchmark)']['max_drawdown'])} to {pct(R['single']['NVDA']['Ensemble + vol targeting']['max_drawdown'])} with ensemble + vol targeting. But they gave up much of the gain. These stocks went up so steadily that being out of them cost more than it saved.</p>
</section>

<section id="fair">
  <h2>The fair test <small>rule-based, {R['start_b']} to {R['end']}</small></h2>
  <p>Each month, take the companies that were in the S&amp;P 500 <em>that month</em> (including ones later removed). Keep those with one-year volatility of 55% or less that are above their 200-day average. Buy the 10 with the best 12-month return, skipping the most recent month. This copies the "hot and steady" part of the screen without hindsight. It can't copy the profit and debt checks, because past fundamentals aren't in the data.</p>
  {chart([("Hot & steady top 10", "--s1", hs['equity_weekly'], True),
          ("Pure momentum top 10", "--s2", pm['equity_weekly'], False),
          ("Nasdaq-100 (QQQ)", "--s3", qqqb['equity_weekly'], False),
          ("S&P 500 (SPY)", "--s0", spyb['equity_weekly'], False)], "Rule-based stock picking vs indexes")}
  <h3>Results</h3>
  {stats_table(RB, "Hot & steady: top 10 momentum, vol ≤ 55%, above 200-day", {"S&P 500 (SPY)", "Equal-weight S&P 500 (RSP)", "Nasdaq-100 (QQQ)"})}
  <p class="muted">The stock rules replace about {pct(hs['info']['avg_turnover'], False)} of the portfolio each month, so short-term capital-gains tax would take a large bite in a taxable account. Prices were available for {pct(min(cov.values()), False)}–{pct(max(cov.values()), False)} of each month's index members. The few missing names are companies later acquired, merged or delisted; leaving out the ones that collapsed flatters these results slightly.</p>
  <h3>What the rule would hold today</h3>
  <div class="chips">{now}</div>
  <p class="muted">The rule is momentum-driven, so it currently leans toward energy, refiners and materials, not the high-R&amp;D names above. Only Fortinet appears on both lists.</p>
</section>

<section class="notes">
  <h2>How to read this</h2>
  <ol>
    <li><strong>Hindsight bias</strong> is the biggest trap in stock backtests. A list of today's best companies always looks brilliant in the past. The rule-based test is the honest estimate.</li>
    <li><strong>Concentration risk.</strong> Nine stocks, seven of them in semiconductors, networking and software, can fall together. Their past worst drops ran from {pct(max(R['single'][t]['Buy & hold (benchmark)']['max_drawdown'] for t in R['picks']))} to {pct(min(R['single'][t]['Buy & hold (benchmark)']['max_drawdown'] for t in R['picks']))}.</li>
    <li><strong>Data.</strong> Daily prices from the public <code>Johnbrick123/sp500-data</code> dataset (split- and dividend-adjusted, point-in-time S&amp;P 500 membership), spot-checked against known prices and stock splits. Company profit and debt figures come from fiscal 2025 annual reports (Nvidia's fiscal 2026); a few R&amp;D figures couldn't be verified and are marked.</li>
    <li><strong>Not included:</strong> taxes, and interest on idle cash.</li>
  </ol>
</section>
<footer>Generated by <code>run_stocks.py</code> and <code>make_stock_report.py</code> in <code>crypto-backtester/</code>. This is research, not financial advice.</footer>
</main>
"""
(HERE / "stocks_report.html").write_text(page)
print("wrote", HERE / "stocks_report.html")
