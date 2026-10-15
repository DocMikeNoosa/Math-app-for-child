// Manual backup: `node scripts/backup.mjs` (inside the container: `docker compose exec app node scripts/backup.mjs`).
import '../lib/env.js';
import { openDb } from '../lib/db.js';
import { backupNow } from '../lib/backup.js';

openDb();
const info = await backupNow();
console.log(`Kopia zapisana: ${info.file} (${(info.size / 1048576).toFixed(1)} MB, ${info.ms} ms)`);
