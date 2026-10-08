// EndoList — pliki: folder na listy i kopie zapasowe (File System Access API), e-mail, eksport dla ProDentis.
import { kv } from './vault.js';

export const fsSupported = () => typeof window.showDirectoryPicker === 'function';
export const safe = (s) => String(s || '').replace(/[\\/:*?"<>|\u0000-\u001F]/g, '').replace(/\s+/g, ' ').trim().replace(/\.+$/, '') || 'bez nazwy';

export class Folder {
  constructor(pid) { this.pid = pid; this.root = null; this.perm = 'none'; this.lastBackup = 0; this.error = ''; }
  async init() {
    this.root = (await kv.get(`dir:${this.pid}`)) || null;
    this.lastBackup = (await kv.get(`lastBackup:${this.pid}`)) || 0;
    if (this.root) { try { this.perm = await this.root.queryPermission({ mode: 'readwrite' }); } catch { this.perm = 'prompt'; } }
  }
  ok() { return !!this.root && this.perm === 'granted'; }
  async pick() {
    const h = await window.showDirectoryPicker({ id: 'endolist', mode: 'readwrite', startIn: 'documents' });
    this.root = h; this.perm = 'granted'; this.error = '';
    await kv.set(`dir:${this.pid}`, h);
  }
  async reconnect() { if (!this.root) return false; try { this.perm = await this.root.requestPermission({ mode: 'readwrite' }); } catch { this.perm = 'denied'; } return this.ok(); }
  async ensure() { return this.ok() || (this.root ? this.reconnect() : false); }
  async dir(parts, create = true) { let d = this.root; for (const p of parts) d = await d.getDirectoryHandle(p, { create }); return d; }
  async write(parts, data) { const d = await this.dir(parts.slice(0, -1)); const fh = await d.getFileHandle(parts.at(-1), { create: true }); const w = await fh.createWritable(); await w.write(data); await w.close(); }
  async exists(parts) { try { const d = await this.dir(parts.slice(0, -1), false); await d.getFileHandle(parts.at(-1)); return true; } catch { return false; } }
  async read(parts) { const d = await this.dir(parts.slice(0, -1), false); return (await d.getFileHandle(parts.at(-1))).getFile(); }
  async backup(json) {
    const blob = new Blob([json], { type: 'application/json' });
    await this.write(['Kopia zapasowa (nie edytować)', 'endolist-dane.json'], blob);
    const day = new Date().toISOString().slice(0, 10);
    await this.write(['Kopia zapasowa (nie edytować)', 'Archiwum', `endolist-${day}.json`], blob);
    const ad = await this.dir(['Kopia zapasowa (nie edytować)', 'Archiwum']); const names = [];
    for await (const [name] of ad.entries()) if (/^endolist-\d{4}-\d\d-\d\d\.json$/.test(name)) names.push(name);
    names.sort(); for (const nm of names.slice(0, Math.max(0, names.length - 60))) await ad.removeEntry(nm);
    this.lastBackup = Date.now(); await kv.set(`lastBackup:${this.pid}`, this.lastBackup);
  }
  async readBackup() { try { return JSON.parse(await (await this.read(['Kopia zapasowa (nie edytować)', 'endolist-dane.json'])).text()); } catch { return null; } }
}

/** Patient folder and file names: sortable by date, easy to find by surname. */
export function names(patient, letter, referrer, teeth) {
  const pf = safe(`${patient.last || ''} ${patient.first || ''}`.trim() + (patient.dob ? ` (${patient.dob})` : ''));
  const t = teeth.length ? (teeth.length === 1 ? `ząb ${teeth[0]}` : `zęby ${teeth.join(', ')}`) : 'konsultacja';
  const to = referrer ? (referrer.kind === 'clinic' ? referrer.clinic : [referrer.title, referrer.last].filter(Boolean).join(' ')) : '';
  const base = safe(`${letter.date} ${patient.last || ''} ${patient.first || ''} – ${t}${to ? ` – do ${to}` : ''}`);
  return { folder: pf, base };
}

export function download(blob, name) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
}

/* ------------------------------------------------------------ e-mail */
const b64utf8 = (s) => btoa(unescape(encodeURIComponent(s)));
const wrap76 = (s) => s.replace(/(.{76})/g, '$1\r\n');
const encWord = (s) => `=?UTF-8?B?${b64utf8(s)}?=`;

/** .eml draft with the PDF attached — opens as a ready-to-send draft in Outlook (X-Unsent) and in most mail programs. */
export async function emlDraft({ to, subject, body, pdfBlob, fileName }) {
  const a = new Uint8Array(await pdfBlob.arrayBuffer()); let bin = '';
  for (let i = 0; i < a.length; i += 0x8000) bin += String.fromCharCode(...a.subarray(i, i + 0x8000));
  const boundary = 'endolist-' + Math.random().toString(36).slice(2);
  const lines = [
    `To: ${to || ''}`, `Subject: ${encWord(subject)}`, 'X-Unsent: 1', 'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`, '',
    `--${boundary}`, 'Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: base64', '', wrap76(b64utf8(body)), '',
    `--${boundary}`, `Content-Type: application/pdf; name="${encWord(fileName)}"`, 'Content-Transfer-Encoding: base64',
    `Content-Disposition: attachment; filename="${encWord(fileName)}"`, '', wrap76(btoa(bin)), '', `--${boundary}--`, '',
  ];
  return new Blob([lines.join('\r\n')], { type: 'message/rfc822' });
}
export function canShareFile(file) { try { return !!(navigator.canShare && navigator.canShare({ files: [file] })); } catch { return false; } }
export function mailto({ to, subject, body }) { return `mailto:${encodeURIComponent(to || '')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`; }

/* ------------------------------------------------------------ ProDentis */
/** Plain text of the letter for pasting into the visit description / patient notes in ProDentis. */
export function prodentisText({ patient, letterDate, content, glance, doctorName }) {
  const L = [];
  L.push(`List do lekarza kierującego — ${letterDate}`);
  L.push(`Pacjent: ${[patient.last, patient.first].filter(Boolean).join(' ')}${patient.dob ? `, ur. ${patient.dob}` : ''}`);
  L.push('');
  for (const g of glance) L.push(`${g.fdi}: ${g.text}`);
  L.push('');
  for (const s of content.sections || []) { L.push(s.heading); for (const p of s.paragraphs || []) L.push(p); L.push(''); }
  if ((content.recommendations || []).length) { L.push('Zalecenia:'); for (const r of content.recommendations) L.push(`- ${r}`); L.push(''); }
  L.push(doctorName);
  return L.join('\r\n');
}
