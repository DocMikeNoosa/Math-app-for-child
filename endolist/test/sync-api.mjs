// EndoList — test protokołu synchronizacji (ten sam test dla serwera lokalnego i Cloudflare Worker).
// node test/sync-api.mjs http://localhost:4174/sync   |   node test/sync-api.mjs http://127.0.0.1:8787
const BASE = (process.argv[2] || 'http://localhost:4174/sync').replace(/\/+$/, '');
let failures = 0;
const ok = (c, msg) => { console.log((c ? 'PASS ' : 'FAIL ') + msg); if (!c) failures++; };
const tok = () => Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64url');
const hex = () => Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('hex');
async function call(method, path, { body, token, query } = {}) {
  const r = await fetch(BASE + path + (query ? '?' + new URLSearchParams(query) : ''), { method, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined });
  let data = null; try { data = await r.json(); } catch {}
  return { status: r.status, data, cors: r.headers.get('access-control-allow-origin') };
}

const acct = hex(), login = tok(), sync = tok(), pid = 'p' + Date.now();
const header = { id: pid, salt: 'c2FsdA==', pw: { iv: 'aXY=', ct: 'Y3Q=' }, passkeys: [], created: 1 };
const rec = (id, at, ct = 'Q1Q=') => ({ k: `${pid}|visits|${id}`, iv: 'SVY=', ct, at });

const h = await call('GET', '/v1/health');
ok(h.status === 200 && h.data.app === 'EndoList-sync' && h.cors === '*', 'health + CORS');
ok((await call('POST', '/v1/register', { body: { acct, login, sync, header } })).status === 201, 'register');
ok((await call('POST', '/v1/register', { body: { acct, login: tok(), sync: tok(), header } })).status === 409, 'register again with other tokens → 409');
ok((await call('POST', '/v1/register', { body: { acct, login, sync, header } })).status === 200, 'same device re-links with its sync token');
const lg = await call('POST', '/v1/login', { body: { acct, login } });
ok(lg.status === 200 && lg.data.header.id === pid, 'login returns the wrapped header');
ok((await call('POST', '/v1/login', { body: { acct, login: tok() } })).status === 401, 'wrong login token → 401');
ok((await call('GET', '/v1/pull', { token: tok(), query: { acct, since: 0 } })).status === 401, 'pull without the sync token → 401');
let p = await call('POST', '/v1/push', { token: sync, body: { acct, records: [rec('a', 100), rec('b', 100)] } });
ok(p.status === 200 && p.data.accepted === 2 && p.data.seq === 2, 'push 2 records → seq 2');
p = await call('POST', '/v1/push', { token: sync, body: { acct, records: [rec('a', 50, 'T0xE'), rec('b', 200, 'TkVX')] } });
ok(p.data.accepted === 1, 'older version rejected, newer accepted (last writer wins)');
let pl = await call('GET', '/v1/pull', { token: sync, query: { acct, since: 0 } });
ok(pl.status === 200 && pl.data.records.length === 2 && pl.data.records.find((r) => r.k.endsWith('|a')).ct === 'Q1Q=' && pl.data.records.find((r) => r.k.endsWith('|b')).ct === 'TkVX', 'pull returns the newest version of each record');
const cur = pl.data.seq;
ok((await call('GET', '/v1/pull', { token: sync, query: { acct, since: cur } })).data.records.length === 0, 'pull from cursor → nothing new');
ok((await call('POST', '/v1/push', { token: sync, body: { acct, records: [{ ...rec('x', 1), k: 'other|visits|x' }] } })).status === 400, 'records of another account rejected');
const many = Array.from({ length: 450 }, (_, i) => rec('m' + i, 300 + i));
ok((await call('POST', '/v1/push', { token: sync, body: { acct, records: many.slice(0, 250) } })).status === 200 && (await call('POST', '/v1/push', { token: sync, body: { acct, records: many.slice(250) } })).status === 200, 'push 450 records in two batches');
let got = 0, since = cur, more = true, pages = 0;
while (more) { const r = await call('GET', '/v1/pull', { token: sync, query: { acct, since } }); got += r.data.records.length; since = r.data.seq; more = r.data.more; pages++; }
ok(got === 450 && pages >= 3, `paged pull: ${got} records in ${pages} pages`);
const newLogin = tok();
ok((await call('PUT', '/v1/header', { token: sync, body: { acct, header: { ...header, salt: 'bmV3' }, login: newLogin, at: Date.now() } })).status === 200, 'header update with new login token (password change)');
ok((await call('POST', '/v1/login', { body: { acct, login } })).status === 401 && (await call('POST', '/v1/login', { body: { acct, login: newLogin } })).data.header.salt === 'bmV3', 'old password token stops working, new one works');
const big = 'A'.repeat(1_950_000);
ok((await call('POST', '/v1/push', { token: sync, body: { acct, records: [rec('big', 999, big)] } })).status === 400, 'record over the size limit rejected');
// brute-force protection
const acct2 = hex(), l2 = tok(), s2 = tok();
await call('POST', '/v1/register', { body: { acct: acct2, login: l2, sync: s2, header: { ...header, id: 'q' + Date.now() } } });
for (let i = 0; i < 8; i++) await call('POST', '/v1/login', { body: { acct: acct2, login: tok() } });
ok((await call('POST', '/v1/login', { body: { acct: acct2, login: l2 } })).status === 429, 'after 8 wrong attempts the account is locked for a while');
await call('DELETE', '/v1/account', { token: s2, body: { acct: acct2 } });
ok((await call('DELETE', '/v1/account', { token: sync, body: { acct } })).status === 200 && (await call('POST', '/v1/login', { body: { acct, login: newLogin } })).status === 401, 'account wipe');
console.log(failures ? `\n${failures} FAILED` : '\nALL PASSED');
process.exit(failures ? 1 : 0);
