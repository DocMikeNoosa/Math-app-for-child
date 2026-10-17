// Load settings before anything reads process.env:
//   1. .env in the app folder (developer use)
//   2. ~/.radvoxpro/.env in the server user's home folder (older installs: ~/.radiopis/.env)
// Values already set in the environment are never overridden.
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import path from 'node:path';

const NEW_ENV = path.join(os.homedir(), '.radvoxpro', '.env');
const OLD_ENV = path.join(os.homedir(), '.radiopis', '.env');
export const USER_ENV = existsSync(NEW_ENV) || !existsSync(OLD_ENV) ? NEW_ENV : OLD_ENV;
const appEnv = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env');
for (const file of [appEnv, USER_ENV]) {
  if (existsSync(file) && typeof process.loadEnvFile === 'function') process.loadEnvFile(file);
}
