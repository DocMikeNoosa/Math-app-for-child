// Decrypt an encrypted backup:  BACKUP_KEY=... node scripts/decrypt-backup.mjs data/backups/radiopis-20261015-0310.db.enc restored.db
import '../lib/env.js';
import { decryptFile } from '../lib/backup.js';

const [src, dest] = process.argv.slice(2);
if (!src || !dest) { console.error('Użycie: node scripts/decrypt-backup.mjs <plik.enc> <wynik.db>'); process.exit(1); }
if (!process.env.BACKUP_KEY) { console.error('Ustaw BACKUP_KEY (ten sam co na serwerze).'); process.exit(1); }
await decryptFile(src, dest, process.env.BACKUP_KEY);
console.log(`Odszyfrowano: ${dest}`);
