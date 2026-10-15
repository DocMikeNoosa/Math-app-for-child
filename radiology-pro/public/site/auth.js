// Login, registration, forgotten password and password reset forms.
import { $, api, showMsg, brand } from './common.js';

brand();
const page = document.body.dataset.page;
const msg = $('#msg');
const next = () => {
  const n = new URLSearchParams(location.search).get('next');
  return n && n.startsWith('/') && !n.startsWith('//') ? n : null;
};

function busy(form, on) {
  for (const b of form.querySelectorAll('button')) b.disabled = on;
}

if (page === 'login') {
  const form = $('#form');
  if (new URLSearchParams(location.search).get('reset') === '1') showMsg(msg, 'Hasło zmienione — zaloguj się.', 'ok');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    busy(form, true);
    showMsg(msg, '');
    try {
      const d = await api('/api/auth/login', { method: 'POST', body: { email: form.email.value, password: form.password.value } });
      if (d.need2fa) {
        // second step: code from the authenticator app
        form.hidden = true;
        const f2 = $('#form2fa');
        f2.hidden = false;
        f2.code.focus();
        f2.addEventListener('submit', async (ev) => {
          ev.preventDefault();
          busy(f2, true);
          showMsg(msg, '');
          try {
            const r = await api('/api/auth/login-2fa', { method: 'POST', body: { ticket: d.ticket, code: f2.code.value } });
            location.href = next() && r.next === '/app/' ? next() : r.next || '/app/';
          } catch (err) {
            showMsg(msg, err.message);
            if (err.code === 'expired') location.reload();
            busy(f2, false);
            f2.code.select();
          }
        });
        return;
      }
      location.href = next() && d.next === '/app/' ? next() : d.next || '/app/';
    } catch (err) {
      showMsg(msg, err.message);
      busy(form, false);
    }
  });
}

if (page === 'register') {
  const form = $('#form');
  api('/api/plans').then((d) => {
    $('#trialDays').textContent = d.trialDays;
    if (!d.registrationOpen) {
      showMsg(msg, 'Rejestracja jest chwilowo zamknięta. Napisz do nas, a założymy konto.', 'info');
      busy(form, true);
    }
  }).catch(() => {});
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showMsg(msg, '');
    if (form.password.value !== form.password2.value) return showMsg(msg, 'Hasła nie są takie same.');
    busy(form, true);
    try {
      const d = await api('/api/auth/register', {
        method: 'POST',
        body: { name: form.name.value, email: form.email.value, npwz: form.npwz.value, phone: form.phone.value, password: form.password.value, accept: form.accept.checked },
      });
      location.href = d.next || '/app/';
    } catch (err) {
      showMsg(msg, err.message);
      busy(form, false);
    }
  });
}

if (page === 'forgot') {
  const form = $('#form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    busy(form, true);
    try {
      await api('/api/auth/forgot', { method: 'POST', body: { email: form.email.value } });
      showMsg(msg, 'Jeśli konto z tym adresem istnieje, wysłaliśmy link do ustawienia nowego hasła. Sprawdź skrzynkę (także SPAM).', 'ok');
    } catch (err) {
      showMsg(msg, err.message);
      busy(form, false);
    }
  });
}

if (page === 'reset') {
  const form = $('#form');
  const token = new URLSearchParams(location.search).get('token') || '';
  api('/api/auth/reset-check', { method: 'POST', body: { token } })
    .then((d) => { $('#who').textContent = d.email; })
    .catch((err) => { showMsg(msg, err.message); busy(form, true); });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showMsg(msg, '');
    if (form.password.value !== form.password2.value) return showMsg(msg, 'Hasła nie są takie same.');
    busy(form, true);
    try {
      const d = await api('/api/auth/reset', { method: 'POST', body: { token, password: form.password.value } });
      location.href = d.next || '/app/';
    } catch (err) {
      showMsg(msg, err.message);
      busy(form, false);
    }
  });
}

if (page === 'change-password') {
  const form = $('#form');
  api('/api/me').then((d) => { $('#who').textContent = d.user.email; }).catch(() => { location.href = '/login'; });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showMsg(msg, '');
    if (form.password.value !== form.password2.value) return showMsg(msg, 'Hasła nie są takie same.');
    busy(form, true);
    try {
      if (!form.accept.checked) { busy(form, false); return showMsg(msg, 'Zaznacz akceptację regulaminu i informacji o przetwarzaniu danych.'); }
      const d = await api('/api/me/first-password', { method: 'POST', body: { next: form.password.value, accept: true } });
      location.href = d.next || '/app/';
    } catch (err) {
      showMsg(msg, err.message);
      busy(form, false);
    }
  });
}

if (page === 'accept') {
  const form = $('#form');
  api('/api/me').then((d) => { $('#who').textContent = d.user.email; }).catch(() => { location.href = '/login'; });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showMsg(msg, '');
    if (!form.accept.checked) return showMsg(msg, 'Zaznacz akceptację, aby przejść dalej.');
    busy(form, true);
    try {
      const d = await api('/api/me/accept', { method: 'POST', body: { accept: true } });
      location.href = d.next || '/app/';
    } catch (err) {
      showMsg(msg, err.message);
      busy(form, false);
    }
  });
}
