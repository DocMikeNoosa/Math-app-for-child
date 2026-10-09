"""Shared CSS for the HTML reports."""

STYLE = """<style>
/* Layout: single reading column; wide tables and charts scroll inside their own boxes. */
:root {
  --bg:#f6f7f8; --panel:#ffffff; --fg:#14202b; --muted:#5a6773; --line:#d9dee3;
  --accent:#0f7b74; --up:#16794a; --down:#b3402e; --hl:#e3f2ef;
  --s0:#8a96a1; --s1:#0f7b74; --s2:#c07a12; --s3:#7a4fb5;
  --display:"Archivo", "Helvetica Neue", Arial, sans-serif;
  --body:"Archivo", "Helvetica Neue", Arial, sans-serif;
  --mono:"JetBrains Mono", ui-monospace, Menlo, Consolas, monospace;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --bg:#0f161c; --panel:#162029; --fg:#e4eaef; --muted:#93a1ad; --line:#2a3743;
  --accent:#4cc3b5; --up:#5cc98d; --down:#ee7f6a; --hl:#183a38;
  --s0:#7d8a96; --s1:#4cc3b5; --s2:#e2a23f; --s3:#a888e0; color-scheme:dark; } }
:root[data-theme="dark"] {
  --bg:#0f161c; --panel:#162029; --fg:#e4eaef; --muted:#93a1ad; --line:#2a3743;
  --accent:#4cc3b5; --up:#5cc98d; --down:#ee7f6a; --hl:#183a38;
  --s0:#7d8a96; --s1:#4cc3b5; --s2:#e2a23f; --s3:#a888e0; color-scheme:dark; }
body { background:var(--bg); color:var(--fg); font:16px/1.55 var(--body); }
main { max-width:980px; margin:0 auto; padding-inline:20px; padding-block:40px 64px; display:grid; gap:48px; }
main > * { min-width:0; }
h1,h2,h3 { font-family:var(--display); text-wrap:balance; margin:0; }
h1 { font-size:clamp(28px,5vw,42px); font-weight:800; letter-spacing:-0.02em; }
h2 { font-size:28px; font-weight:800; border-bottom:2px solid var(--fg); padding-bottom:8px; }
h2 small { font:400 14px var(--mono); color:var(--muted); margin-left:8px; }
h3 { font-size:13px; text-transform:uppercase; letter-spacing:0.08em; color:var(--muted); font-weight:600; margin-top:28px; margin-bottom:10px; }
p { margin:0 0 12px; max-width:68ch; }
.muted { color:var(--muted); font-size:14px; }
.mono { font-family:var(--mono); font-size:13px; }
header { display:grid; gap:14px; }
.eyebrow { font:600 12px var(--mono); letter-spacing:0.1em; text-transform:uppercase; color:var(--accent); }
.verdict { background:var(--panel); border:1px solid var(--line); border-left:4px solid var(--accent); padding:20px 22px; display:grid; gap:10px; }
.verdict p { margin:0; }
.verdict ul { margin:0; padding-left:20px; display:grid; gap:6px; }
.scroll { overflow-x:auto; border:1px solid var(--line); background:var(--panel); }
table { border-collapse:collapse; width:100%; font-size:14px; min-width:820px; }
table.narrow { min-width:560px; }
th,td { padding:8px 10px; text-align:right; border-bottom:1px solid var(--line); white-space:nowrap; font-variant-numeric:tabular-nums; }
td { font-family:var(--mono); font-size:13px; }
thead th { font-size:12px; color:var(--muted); font-weight:600; text-transform:uppercase; letter-spacing:0.04em; }
th[scope=row], thead th:first-child { text-align:left; font-weight:600; }
tr.hl { background:var(--hl); }
tr.bench th, tr.bench td { color:var(--muted); }
td.up { color:var(--up); } td.down { color:var(--down); }
.chart { background:var(--panel); border:1px solid var(--line); padding:10px; overflow-x:auto; }
.chart svg { width:100%; min-width:560px; height:auto; display:block; }
.grid { stroke:var(--line); stroke-width:1; }
.base { stroke:var(--muted); stroke-dasharray:4 4; stroke-width:1; }
.axis { fill:var(--muted); font:11px var(--mono); }
.legend { display:flex; flex-wrap:wrap; gap:8px 20px; margin-top:10px; font-size:14px; }
.key { display:inline-flex; align-items:center; gap:8px; }
.key i { width:18px; height:3px; display:inline-block; }
.key b { font-family:var(--mono); font-weight:600; font-size:13px; }
.pair { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:32px; align-items:start; }
.pair > div { min-width:0; }
.big { font:800 34px var(--display); margin:4px 0 6px; }
.big span { font:400 14px var(--body); color:var(--muted); margin-left:6px; }
.picks { list-style:none; padding:0; margin:8px 0 0; display:grid; grid-template-columns:repeat(auto-fill,minmax(250px,1fr)); gap:4px 16px; font-size:14px; }
.picks span { font-family:var(--mono); color:var(--muted); display:inline-block; width:52px; }
.notes { display:grid; gap:14px; }
.notes ol { margin:0; padding-left:22px; display:grid; gap:10px; max-width:72ch; }
footer { color:var(--muted); font-size:13px; border-top:1px solid var(--line); padding-top:16px; }
</style>
"""
