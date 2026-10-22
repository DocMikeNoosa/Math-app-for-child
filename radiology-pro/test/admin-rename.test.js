// RadVox Pro rename: the local test install's administrator admin@radiopis.local moves to the new login once.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';

let ensureAdmin, auth;
before(async () => {
  process.env.DB_FILE = ':memory:';
  process.env.BACKUP_DISABLED = '1';
  const { openDb } = await import('../lib/db.js');
  openDb(':memory:');
  const { openLearningDb } = await import('../lib/learning.js');
  openLearningDb(':memory:');
  ({ ensureAdmin } = await import('../server.js'));
  auth = await import('../lib/auth.js');
});

test('old local administrator becomes admin@radvoxpro.local with the new password; nothing else changes', async () => {
  process.env.ADMIN_EMAIL = 'admin@radiopis.local';
  process.env.ADMIN_PASSWORD = 'Radiopis2026';
  const first = await ensureAdmin();
  assert.equal(first.email, 'admin@radiopis.local');

  process.env.ADMIN_EMAIL = 'admin@radvoxpro.local';
  process.env.ADMIN_PASSWORD = 'RadVoxPro2026';
  const moved = await ensureAdmin();
  assert.equal(moved.id, first.id, 'same account, data kept');
  assert.equal(moved.email, 'admin@radvoxpro.local');
  assert.ok(!auth.getUserByEmail('admin@radiopis.local'));
  const user = auth.getUserByEmail('admin@radvoxpro.local');
  assert.equal(user.role, 'admin');
  assert.ok(await auth.verifyPassword('RadVoxPro2026', user.pwd));
  assert.ok(!(await auth.verifyPassword('Radiopis2026', user.pwd)));

  assert.equal(await ensureAdmin(), null, 'runs once');
});

test('a real server administrator is never touched', async () => {
  process.env.ADMIN_EMAIL = 'owner@firma.pl';
  process.env.ADMIN_PASSWORD = 'InneHaslo2026';
  assert.equal(await ensureAdmin(), null);
  assert.ok(!auth.getUserByEmail('owner@firma.pl'));
});
