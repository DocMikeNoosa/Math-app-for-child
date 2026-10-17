// Load settings before anything reads process.env:
//   1. .env in the app folder (developer use)
//   2. ~/.radvox/.env in the user's home folder (written by the installer; survives app updates)
// Values already set in the environment are never overridden.
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import path from 'node:path';

export const USER_ENV = path.join(os.homedir(), '.radvox', '.env');
const appEnv = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env');
for (const file of [appEnv, USER_ENV]) {
  if (existsSync(file) && typeof process.loadEnvFile === 'function') process.loadEnvFile(file);
}
