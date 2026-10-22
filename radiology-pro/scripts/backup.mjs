// Manual backup: `node scripts/backup.mjs` (inside the container: `docker compose exec app node scripts/backup.mjs`).
import '../lib/env.js';
import { openDb } from '../lib/db.js';
import { backupNow } from '../lib/backup.js';
import { openLearningDb } from '../lib/learning.js';

openDb();
openLearningDb();
const info = await backupNow();
console.log(`Kopie zapisane: ${info.file}, ${info.learningFile}${info.encrypted ? " (zaszyfrowane)" : ""} — ${info.ms} ms`);
