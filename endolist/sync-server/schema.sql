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
