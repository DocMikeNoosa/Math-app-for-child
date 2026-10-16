// Test accounts for trying RadVox Pro (local test install, or a test server). Safe to run again: existing
// accounts are left as they are. Usage: node scripts/create-test-accounts.mjs   (reads the same settings as the app)
//
// Never run this on the real server with paying customers: the password is printed and the same for every account.
import '../lib/env.js';
import { openDb, one, run } from '../lib/db.js';
import { createUser, getUserByEmail } from '../lib/auth.js';
import { createOrg } from '../lib/orgs.js';
import { settings } from '../lib/plans.js';

const PASSWORD = 'TestRadVox2026';
const DAY = 86400000;
const now = Date.now();
openDb();
const termsVersion = settings().termsVersion || '1.0';

function finish(u, extra = {}) {
  run("UPDATE users SET terms_version = ?, terms_at = ?, note = 'Konto testowe', must_change_pwd = 0 WHERE id = ?", termsVersion, now, u.id);
  if (extra.plan) run('UPDATE users SET plan = ?, sub_status = ?, sub_until = ? WHERE id = ?', extra.plan, extra.status, extra.until, u.id);
}

async function person(email, name, extra = {}, orgId = null, role = 'user') {
  if (getUserByEmail(email)) return { email, name, created: false };
  const u = await createUser({ email, password: PASSWORD, name, role, orgId });
  finish(u, extra);
  return { email, name, created: true };
}

const rows = [];
rows.push({ ...(await person('pro@test.radvoxpro.local', 'Lek. Anna Testowa', { plan: 'pro', status: 'active', until: now + 365 * DAY })), what: 'Pro, opłacony na rok — pełny dostęp' });
rows.push({ ...(await person('start@test.radvoxpro.local', 'Lek. Piotr Testowy', { plan: 'start', status: 'active', until: now + 30 * DAY })), what: 'Start, opłacony na miesiąc' });
rows.push({ ...(await person('proba@test.radvoxpro.local', 'Lek. Ewa Próbna')), what: 'Okres próbny (14 dni, 60 opisów)' });
rows.push({ ...(await person('wygasly@test.radvoxpro.local', 'Lek. Jan Wygasły', { plan: 'start', status: 'expired', until: now - DAY })), what: 'Subskrypcja wygasła — zobaczysz blokadę i stronę płatności' });

let org = one("SELECT * FROM orgs WHERE name = 'Szpital Testowy'");
if (!org) org = createOrg({ name: 'Szpital Testowy', seats: 10, status: 'active', days: 365, plan: 'pro', devices: 2, contact: 'it@test.radvoxpro.local', note: 'Organizacja testowa' }, null);
rows.push({ ...(await person('it@test.radvoxpro.local', 'Dział IT (test)', {}, org.id, 'orgadmin')), what: 'Szpital Testowy — konsola IT (/it)' });
rows.push({ ...(await person('radiolog1@test.radvoxpro.local', 'Lek. Marta Szpitalna', {}, org.id)), what: 'Szpital Testowy — radiolog (licencja szpitala)' });
rows.push({ ...(await person('radiolog2@test.radvoxpro.local', 'Lek. Tomasz Szpitalny', {}, org.id)), what: 'Szpital Testowy — radiolog (licencja szpitala)' });

console.log(`\nKonta testowe RadVox Pro — hasło do wszystkich: ${PASSWORD}`);
for (const r of rows) console.log(`  ${r.created ? 'utworzono' : 'już było '}  ${r.email.padEnd(34)} ${r.what}`);
console.log('');
