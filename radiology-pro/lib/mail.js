// E-mail. With RESEND_API_KEY set, mail is sent through Resend (https://resend.com, EU region possible);
// without it, messages are only stored in the outbox (visible to the administrator) — nothing is lost.
import { run } from './db.js';
import { BRAND } from './brand.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export function mailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM);
}

/** Send (or log) one e-mail. `text` is plain text; links are written out in full. */
export async function sendMail(to, subject, text) {
  let status = 'logged';
  if (mailConfigured()) {
    try {
      const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.55;color:#1d2433">${esc(text).replace(/\n/g, '<br>').replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>')}<br><br><span style="color:#6b7385">— ${esc(BRAND.name)}</span></div>`;
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: process.env.MAIL_FROM, to: [to], subject, text, html }),
      });
      status = res.ok ? 'sent' : `error ${res.status}`;
    } catch (err) {
      status = `error ${err.code || err.message}`.slice(0, 60);
    }
  }
  // the stored copy never contains a password; a reset link is kept only if the e-mail could not be sent
  // (then the administrator can pass it on — it expires in 2 hours)
  let stored = String(text).replace(/(Hasło tymczasowe: )\S+/g, '$1••••••••');
  if (status === 'sent') stored = stored.replace(/([?&]token=)[\w-]+/g, '$1••••');
  run('INSERT INTO outbox(ts, to_addr, subject, body, status) VALUES (?, ?, ?, ?, ?)', Date.now(), to, subject, stored, status);
  return status;
}

export const adminEmail = () => process.env.ADMIN_EMAIL || '';
