// Hourly housekeeping: expire subscriptions, remind users before expiry (7 and 1 day),
// alert the administrator when a user's AI cost is unusually high, clean old sessions/tokens.
import { all, run, audit, monthOf } from './db.js';
import { backupIfDue } from './backup.js';
import { planById, settings, monthUsage } from './plans.js';
import { sendMail, adminEmail } from './mail.js';
import { BRAND } from './brand.js';

const DAY = 86400000;
const fmtDate = (ms) => new Date(ms).toLocaleDateString('pl-PL', { timeZone: 'Europe/Warsaw' });

export async function runJobs(now = Date.now(), baseUrl = process.env.PUBLIC_URL || '') {
  const s = settings();
  const done = { expired: 0, reminded: 0, costAlerts: 0, orgReminders: 0, backup: null };

  // 1. expire
  for (const u of all("SELECT * FROM users WHERE role <> 'admin' AND org_id IS NULL AND sub_status IN ('trial','active','past_due','canceled') AND sub_until > 0")) {
    const grace = u.sub_status === 'past_due' ? s.graceDaysPastDue * DAY : 0;
    if (now > u.sub_until + grace) {
      run("UPDATE users SET sub_status = 'expired' WHERE id = ?", u.id);
      audit(null, 'subscription.expired', u.id, u.plan);
      done.expired++;
      // one e-mail when a free trial ends (information about the account, sent to everybody)
      if (u.sub_status === 'trial' && !u.end_mailed && !u.blocked) {
        await sendMail(u.email, `${BRAND.name}: okres próbny zakończył się`, `Dzień dobry,\n\nTwój bezpłatny okres próbny ${BRAND.name} zakończył się ${fmtDate(u.sub_until)}. Twoje szablony i wszystko, czego program się nauczył, czekają na koncie — aby pracować dalej, wybierz plan:\n${baseUrl}/account\n\nDziękujemy za wypróbowanie!`);
        run('UPDATE users SET end_mailed = 1 WHERE id = ?', u.id);
      }
    }
  }

  // 2. reminders (not for Stripe auto-renewing subscriptions that are active)
  for (const u of all("SELECT * FROM users WHERE role <> 'admin' AND org_id IS NULL AND blocked = 0 AND sub_status IN ('trial','active','canceled') AND sub_until > ?", now)) {
    if (u.stripe_sub && u.sub_status === 'active') continue;
    const daysLeft = (u.sub_until - now) / DAY;
    const step = daysLeft <= 1 ? 1 : daysLeft <= 7 ? 7 : 0;
    if (!step || (u.reminded && u.reminded <= step)) continue;
    const what = u.sub_status === 'trial' ? 'Okres próbny' : 'Subskrypcja';
    await sendMail(u.email, `${BRAND.name}: ${what.toLowerCase()} kończy się ${fmtDate(u.sub_until)}`,
      `Dzień dobry,\n\n${what} ${BRAND.name} kończy się ${fmtDate(u.sub_until)}. Aby pracować bez przerwy, przedłuż dostęp na stronie konta:\n${baseUrl}/account\n\nDziękujemy!`);
    run('UPDATE users SET reminded = ? WHERE id = ?', step, u.id);
    done.reminded++;
  }

  // 3. AI cost alerts (once per user per month)
  const month = monthOf(now);
  for (const u of all("SELECT u.*, o.price_per_seat AS org_price FROM users u LEFT JOIN orgs o ON o.id = u.org_id WHERE u.role <> 'admin' AND u.cost_alerted <> ?", month)) {
    const p = planById(u.plan);
    const price = u.org_id ? u.org_price || 249 : p.pricePln || 249;
    const limitUsd = (price * s.costAlertRatio) / s.usdPln;
    const used = monthUsage(u.id, month);
    if (used.costUsd > limitUsd) {
      run('UPDATE users SET cost_alerted = ? WHERE id = ?', month, u.id);
      audit(null, 'cost.alert', u.id, `${used.costUsd.toFixed(2)} USD`);
      if (adminEmail()) await sendMail(adminEmail(), `${BRAND.name}: wysoki koszt AI — ${u.email}`, `Użytkownik ${u.email} (plan ${p.name}) zużył w ${month} AI za ${used.costUsd.toFixed(2)} USD (${used.reports} opisów, ${used.calls} zapytań). Próg alertu: ${limitUsd.toFixed(2)} USD.`);
      done.costAlerts++;
    }
  }

  // 4. organisation licences: remind the owner and the organisation's IT administrators 7 days and 1 day before the end
  for (const o of all("SELECT * FROM orgs WHERE status <> 'suspended' AND sub_until > ?", now)) {
    const daysLeft = (o.sub_until - now) / DAY;
    const step = daysLeft <= 1 ? 1 : daysLeft <= 7 ? 7 : 0;
    if (!step || (o.reminded && o.reminded <= step)) continue;
    const what = o.status === 'trial' ? 'Okres próbny' : 'Licencja';
    const to = [adminEmail(), ...all("SELECT email FROM users WHERE org_id = ? AND role = 'orgadmin' AND blocked = 0", o.id).map((r) => r.email)].filter(Boolean);
    for (const addr of new Set(to)) {
      await sendMail(addr, `${BRAND.name}: ${what.toLowerCase()} — ${o.name} — kończy się ${fmtDate(o.sub_until)}`,
        `Dzień dobry,\n\n${what} ${BRAND.name} dla organizacji ${o.name} kończy się ${fmtDate(o.sub_until)}. Po tym dniu radiolodzy nie będą mogli korzystać z aplikacji.\nAby przedłużyć, skontaktuj się z dostawcą usługi.\n\nKonsola IT: ${baseUrl}/it`);
    }
    run('UPDATE orgs SET reminded = ? WHERE id = ?', step, o.id);
    done.orgReminders++;
  }

  // 5. daily database backup
  try { done.backup = await backupIfDue(now); } catch (err) { console.error('backup', err); done.backup = { error: String(err.message || err) }; }

  // 6. clean up
  run('DELETE FROM sessions WHERE expires_at < ?', now);
  run('DELETE FROM tokens WHERE expires_at < ?', now);
  run('DELETE FROM webhook_events WHERE ts < ?', now - 90 * DAY);
  // RODO retention: security / change log and copies of e-mails are not kept forever
  done.auditDeleted = Number(run('DELETE FROM audit WHERE ts < ?', now - s.auditRetentionDays * DAY).changes);
  done.outboxDeleted = Number(run('DELETE FROM outbox WHERE ts < ?', now - s.outboxRetentionDays * DAY).changes);
  run('DELETE FROM client_events WHERE ts < ?', now - 30 * DAY);
  // devices idle longer than the limit are logged out
  run('DELETE FROM sessions WHERE last_seen < ?', now - s.sessionIdleDays * DAY);
  return done;
}

export function startJobs() {
  const tick = () => runJobs().catch((err) => console.error('jobs', err));
  setTimeout(tick, 10_000).unref();
  setInterval(tick, 60 * 60_000).unref();
}
