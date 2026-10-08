-- EndoList sync — schemat bazy D1. Wszystkie dane pacjentów są zaszyfrowane po stronie urządzenia.
CREATE TABLE IF NOT EXISTS accounts (
  acct TEXT PRIMARY KEY,         -- SHA-256 loginu synchronizacji
  login_hash TEXT NOT NULL,      -- SHA-256 tokenu logowania (PBKDF2 z hasła)
  sync_hash TEXT NOT NULL,       -- SHA-256 tokenu synchronizacji (z klucza danych)
  header TEXT NOT NULL,          -- nagłówek konta: sól + opakowane klucze (bez klucza w postaci jawnej)
  header_at INTEGER NOT NULL,
  seq INTEGER NOT NULL DEFAULT 0,
  fails INTEGER NOT NULL DEFAULT 0,
  lock_until INTEGER NOT NULL DEFAULT 0,
  created INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS records (
  acct TEXT NOT NULL,
  k TEXT NOT NULL,
  iv TEXT NOT NULL,
  ct TEXT NOT NULL,              -- AES-256-GCM, zaszyfrowane na urządzeniu
  at INTEGER NOT NULL,
  seq INTEGER NOT NULL,
  PRIMARY KEY (acct, k)
);
CREATE INDEX IF NOT EXISTS records_seq ON records (acct, seq);

-- Gabinet (organizacja): członkowie, role, zaproszenia. Klucz gabinetu (prywatny) mają wyłącznie administratorzy — na serwerze są tylko klucze publiczne i zaszyfrowane bloki.
CREATE TABLE IF NOT EXISTS orgs (
  org_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  pub TEXT NOT NULL,             -- klucz publiczny gabinetu (ECDH P-256, JWK)
  policy TEXT NOT NULL,          -- zasady gabinetu, np. {"aiDpa": true}
  created INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS members (
  acct TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  role TEXT NOT NULL,            -- admin | member
  status TEXT NOT NULL,          -- active | removed
  meta TEXT NOT NULL,            -- login i nazwisko lekarza zaszyfrowane kluczem gabinetu
  escrow TEXT NOT NULL,          -- klucz danych lekarza zaszyfrowany kluczem gabinetu (odzyskiwanie, ciągłość dokumentacji)
  user_pub TEXT NOT NULL,        -- klucz publiczny lekarza
  grant_blob TEXT,               -- klucz gabinetu zaszyfrowany dla nowego administratora
  last_seen INTEGER NOT NULL DEFAULT 0,
  joined INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS members_org ON members (org_id);
CREATE TABLE IF NOT EXISTS invites (
  hash TEXT PRIMARY KEY,         -- SHA-256 tajnej części kodu zaproszenia
  org_id TEXT NOT NULL,
  role TEXT NOT NULL,
  expires INTEGER NOT NULL,
  created_by TEXT NOT NULL
);
