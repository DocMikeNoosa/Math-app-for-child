// Load .env (if present) before anything reads process.env.
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env');
if (existsSync(envPath) && typeof process.loadEnvFile === 'function') process.loadEnvFile(envPath);
