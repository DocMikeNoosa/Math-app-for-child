// Is an account used by more than one person? Signals for the owner (friends' accounts are personal and free).
// Nothing here blocks anyone: a doctor works at home, in hospital and on call, so only a pattern is reported and the
// owner decides (suspend in one click). The device limit itself already logs out the oldest session.
import { all } from './db.js';

const DAY = 86400000;
/** The network part of an address (IPv4 /24, IPv6 /64): one hospital or one home = one network. */
const network = (ip) => {
  const v = String(ip || '').replace(/^::ffff:/, '');
  if (/^\d+\.\d+\.\d+\.\d+$/.test(v)) return v.split('.').slice(0, 3).join('.');
  return v.includes(':') ? v.split(':').slice(0, 4).join(':') : '';
};

export function sharingSignals(userId, now = Date.now()) {
  const rows = all('SELECT ip, device, kicked FROM logins WHERE user_id = ? AND ts > ?', userId, now - 30 * DAY);
  const devices = new Set(rows.map((r) => r.device).filter(Boolean)).size;
  const networks = new Set(rows.map((r) => network(r.ip)).filter(Boolean)).size;
  const kicks = rows.reduce((a, r) => a + r.kicked, 0);
  const flags = [];
  if (kicks >= 3) flags.push(`${kicks}× logowanie wyrzuciło inne urządzenie, używane kilka minut wcześniej (dwie osoby naraz?)`);
  if (devices >= 5) flags.push(`${devices} różnych przeglądarek w 30 dni`);
  if (networks >= 6) flags.push(`${networks} różnych sieci (miejsc) w 30 dni`);
  return { logins: rows.length, devices, networks, kicks, flags };
}
