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
// ---------- clinic: admins, members, invites
const mk = async () => { const a = { acct: hex(), login: tok(), sync: tok(), pid: 'p' + Math.random().toString(36).slice(2) }; await call('POST', '/v1/register', { body: { acct: a.acct, login: a.login, sync: a.sync, header: { ...header, id: a.pid } } }); return a; };
const A = await mk(), B = await mk(), C = await mk();
const blobx = { v: 1, epk: { kty: 'EC' }, iv: 'aXY=', ct: 'Y3Q=' };
const cr = await call('POST', '/v1/org/create', { token: A.sync, body: { acct: A.acct, name: 'Centrum Stomatologiczne', pub: { kty: 'EC', crv: 'P-256', x: 'x', y: 'y' }, meta: blobx, escrow: blobx, userPub: { kty: 'EC' } } });
ok(cr.status === 201 && /^[0-9a-f]{32}$/.test(cr.data.orgId), 'clinic created, creator is admin');
ok((await call('GET', '/v1/org', { token: A.sync, query: { acct: A.acct } })).data.me.role === 'admin', 'creator has the admin role');
const code = hex();
ok((await call('POST', '/v1/org/invite', { token: B.sync, body: { acct: B.acct, code, role: 'member' } })).status === 404, 'non-member cannot invite');
ok((await call('POST', '/v1/org/invite', { token: A.sync, body: { acct: A.acct, code, role: 'member' } })).status === 201, 'admin creates an invite');
ok((await call('GET', '/v1/org/invite-info', { token: B.sync, query: { acct: B.acct, code } })).data.name === 'Centrum Stomatologiczne', 'invite info shows the clinic and its public key');
ok((await call('POST', '/v1/org/join', { token: B.sync, body: { acct: B.acct, code, meta: blobx, escrow: blobx, userPub: { kty: 'EC' } } })).status === 200, 'member joins with the invite');
ok((await call('POST', '/v1/org/join', { token: C.sync, body: { acct: C.acct, code, meta: blobx, escrow: blobx, userPub: { kty: 'EC' } } })).status === 404, 'invite is single-use');
const gB = await call('GET', '/v1/org', { token: B.sync, query: { acct: B.acct } });
ok(gB.data.me.role === 'member' && gB.data.members === null, 'member sees the clinic but not the member list');
ok((await call('POST', '/v1/org/invite', { token: B.sync, body: { acct: B.acct, code: hex(), role: 'admin' } })).status === 403, 'member cannot invite');
ok((await call('POST', '/v1/org/member', { token: B.sync, body: { acct: B.acct, member: A.acct, status: 'removed' } })).status === 403, 'member cannot remove the admin');
ok((await call('GET', '/v1/org/pull', { token: B.sync, query: { acct: B.acct, member: A.acct } })).status === 403, "member cannot read another doctor's data");
ok((await call('POST', '/v1/org/policy', { token: B.sync, body: { acct: B.acct, policy: { aiDpa: true } } })).status === 403, 'member cannot change clinic policy');
await call('POST', '/v1/push', { token: B.sync, body: { acct: B.acct, records: [{ k: `${B.pid}|patients|1`, iv: 'SVY=', ct: 'Q1Q=', at: 1 }] } });
const ap = await call('GET', '/v1/org/pull', { token: A.sync, query: { acct: A.acct, member: B.acct, since: 0 } });
ok(ap.status === 200 && ap.data.records.length === 1 && ap.data.header.id === B.pid, "admin reads a member's (encrypted) records");
ok((await call('GET', '/v1/org/pull', { token: A.sync, query: { acct: A.acct, member: C.acct } })).status === 404, 'admin cannot read accounts outside the clinic');
ok((await call('POST', '/v1/org/member', { token: A.sync, body: { acct: A.acct, member: A.acct, role: 'member' } })).status === 409, 'the last admin cannot be demoted');
ok((await call('POST', '/v1/org/member', { token: A.sync, body: { acct: A.acct, member: B.acct, role: 'admin', grant: blobx } })).status === 200, 'admin promotes a member (with key grant)');
const gB2 = await call('GET', '/v1/org', { token: B.sync, query: { acct: B.acct } });
ok(gB2.data.me.role === 'admin' && gB2.data.me.grant && Array.isArray(gB2.data.members), 'promoted member sees the grant and the member list');
ok((await call('POST', '/v1/org/member', { token: B.sync, body: { acct: B.acct, member: A.acct, role: 'member' } })).status === 200, 'with two admins one can be demoted');
const newL = tok();
ok((await call('PUT', '/v1/org/header', { token: B.sync, body: { acct: B.acct, member: A.acct, header: { ...header, id: A.pid, salt: 'cmVzZXQ=' }, login: newL } })).status === 200, 'admin resets a member password');
ok((await call('POST', '/v1/login', { body: { acct: A.acct, login: newL } })).data?.header.salt === 'cmVzZXQ=', 'member logs in with the reset password');
ok((await call('DELETE', '/v1/account', { token: A.sync, body: { acct: A.acct } })).status === 403, 'a clinic member cannot erase clinic data from the server');
ok((await call('POST', '/v1/org/member', { token: B.sync, body: { acct: B.acct, member: A.acct, status: 'removed' } })).status === 200, 'admin removes a member');
ok((await call('GET', '/v1/pull', { token: A.sync, query: { acct: A.acct, since: 0 } })).status === 403 && (await call('POST', '/v1/login', { body: { acct: A.acct, login: newL } })).status === 403, 'removed member is locked out (sync and login)');
ok((await call('GET', '/v1/org/pull', { token: B.sync, query: { acct: B.acct, member: A.acct } })).status === 200, "clinic keeps access to a removed member's records");
ok((await call('POST', '/v1/org/member', { token: B.sync, body: { acct: B.acct, member: B.acct, status: 'removed' } })).status === 409, 'the last active admin cannot remove themselves');

console.log(failures ? `\n${failures} FAILED` : '\nALL PASSED');
process.exit(failures ? 1 : 0);
