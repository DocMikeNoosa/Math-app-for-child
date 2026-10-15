// Hardware dictation button (e.g. Nuance PowerMic, Philips SpeechMike in HID mode) via WebHID, with a "learn"
// mode: the user presses the chosen button TWICE and the bit that follows the presses (goes on and off) is
// remembered. Bits that never change (status bytes) or change all the time (trackball, counters) are ignored.
// Modes: 'toggle' (press = start, press again = stop) or 'hold' (hold to talk, release to stop).
// When the device sends nothing at all, diagnose() explains the likely cause (another program holds the
// microphone, the browser blocks this kind of device, or no permission) — the workstation check shows it too.

const STORE_KEY = 'radvox.mic.v1';
export const NUANCE_VENDOR_ID = 0x0554;
export const PHILIPS_VENDOR_ID = 0x0911;

/** Bits that went from 0 to 1 between two reports: [{ byte, mask }]. Pure, for tests. */
export function risingBits(prev, next) {
  const out = [];
  for (let i = 0; i < next.length; i++) {
    const rose = next[i] & ~(prev?.[i] ?? 0);
    for (let b = 0; b < 8; b++) if (rose & (1 << b)) out.push({ byte: i, mask: 1 << b });
  }
  return out;
}

/** Bits that went from 1 to 0. */
export function fallingBits(prev, next) {
  if (!prev) return [];
  const out = [];
  for (let i = 0; i < next.length; i++) {
    const fell = (prev[i] ?? 0) & ~next[i];
    for (let b = 0; b < 8; b++) if (fell & (1 << b)) out.push({ byte: i, mask: 1 << b });
  }
  return out;
}

/**
 * Choose the button bit from the reports seen while learning: [{ reportId, bytes }] in order.
 * A button bit is 0 in some reports and 1 in others, goes 0 → 1 at least once (a press), and does not flicker
 * (trackball / counters change many times). Returns { reportId, byte, mask } or null. Pure, for tests.
 */
export function chooseButton(reports, { expectedPresses = 2 } = {}) {
  const stats = new Map(); // key → { reportId, byte, mask, rises, falls, on, off }
  const last = new Map();
  for (const { reportId, bytes } of reports) {
    const prev = last.get(reportId);
    for (let i = 0; i < bytes.length; i++) {
      for (let b = 0; b < 8; b++) {
        const mask = 1 << b;
        const key = `${reportId}:${i}:${mask}`;
        const s = stats.get(key) || { reportId, byte: i, mask, rises: 0, falls: 0, on: 0, off: 0 };
        const now = (bytes[i] & mask) !== 0;
        if (now) s.on++; else s.off++;
        if (prev) {
          const was = ((prev[i] ?? 0) & mask) !== 0;
          if (!was && now) s.rises++;
          if (was && !now) s.falls++;
        }
        stats.set(key, s);
      }
    }
    last.set(reportId, bytes);
  }
  const flicker = expectedPresses * 3 + 2;
  const candidates = [...stats.values()]
    .filter((s) => s.on && s.off && s.rises + s.falls <= flicker && (s.rises >= 1 || s.falls >= 1))
    // the first report may already be "pressed" (devices often send nothing while idle): a fall counts too
    .map((s) => ({ ...s, score: Math.min(s.rises + (s.falls > s.rises ? 1 : 0), expectedPresses) * 2 + Math.min(s.falls, expectedPresses) - Math.abs(s.rises - expectedPresses) * 0.5 }))
    .sort((a, b) => b.score - a.score || a.byte - b.byte || a.mask - b.mask);
  const best = candidates[0];
  return best ? { reportId: best.reportId, byte: best.byte, mask: best.mask } : null;
}

// HID usages Chrome does not give to web pages (keyboards, mice…): a device that only has these cannot be read
const PROTECTED = (c) => c.usagePage === 0x01 && [0x02, 0x06, 0x07, 0x80].includes(c.usage);

export class MicButton {
  constructor({ onPress, onRelease, onChange, onRaw, persist = true }) {
    this.persist = persist; // false: test pages that must not change the saved button
    this.onPress = onPress;
    this.onRelease = onRelease || (() => {});
    this.onChange = onChange || (() => {});
    this.onRaw = onRaw || null; // live report view (diagnostics)
    this.device = null;
    this.learning = null; // collector while learning
    this.last = new Map(); // reportId → previous report bytes
    this.lastPress = 0;
    this.pressed = false;
    this.reports = 0; // reports received since connecting (diagnostics)
    this.config = persist ? load() : null;
    this.handle = (e) => this.onReport(e);
  }

  get supported() { return typeof navigator !== 'undefined' && 'hid' in navigator; }
  get connected() { return Boolean(this.device?.opened); }
  get bound() { return Boolean(this.config?.binding); }
  get name() { return this.device?.productName || this.config?.productName || ''; }
  get mode() { return this.config?.mode === 'hold' ? 'hold' : 'toggle'; }
  setMode(mode) {
    this.config = { ...(this.config || {}), mode: mode === 'hold' ? 'hold' : 'toggle' };
    this.save(this.config);
    this.onChange();
  }

  save(config) { if (this.persist) save(config); }

  /** Reopen a device the user already allowed (no prompt). */
  async restore() {
    if (!this.supported || !this.config?.vendorId) return false;
    try {
      const devices = await navigator.hid.getDevices();
      const d = devices.find((x) => x.vendorId === this.config.vendorId && x.productId === this.config.productId);
      if (d) await this.open(d);
    } catch { /* ignore */ }
    navigator.hid.addEventListener?.('disconnect', (e) => {
      if (e.device === this.device) { this.device = null; this.onChange(); }
    });
    navigator.hid.addEventListener?.('connect', (e) => {
      if (!this.device && this.config && e.device.vendorId === this.config.vendorId && e.device.productId === this.config.productId) this.open(e.device).catch(() => {});
    });
    return this.connected;
  }

  /** Ask the user to pick the device (dictation microphones first; `any` lists every HID device). */
  async connect({ any = false } = {}) {
    if (!this.supported) throw new Error('Ta przeglądarka nie obsługuje WebHID — użyj Chrome lub Edge.');
    const filters = any ? [] : [{ vendorId: NUANCE_VENDOR_ID }, { vendorId: PHILIPS_VENDOR_ID }];
    const devices = await navigator.hid.requestDevice({ filters });
    if (!devices.length) return false;
    // a microphone often shows up as several HID interfaces: prefer one that is not a keyboard / mouse
    const d = devices.find((x) => x.collections?.some((c) => !PROTECTED(c))) || devices[0];
    await this.open(d);
    const same = this.config && this.config.vendorId === d.vendorId && this.config.productId === d.productId;
    this.config = { vendorId: d.vendorId, productId: d.productId, productName: d.productName, binding: same ? this.config.binding : null, mode: this.mode };
    this.save(this.config);
    this.onChange();
    return true;
  }

  async open(d) {
    if (!d.opened) {
      try {
        await d.open();
      } catch (err) {
        throw new Error(`Nie można otworzyć urządzenia (${err.name || 'błąd'}) — prawdopodobnie używa go inny program (np. oprogramowanie Nuance / Dragon). Zamknij go i spróbuj ponownie.`);
      }
    }
    if (this.device && this.device !== d) this.device.removeEventListener('inputreport', this.handle);
    this.device = d;
    this.reports = 0;
    this.last.clear();
    d.addEventListener('inputreport', this.handle);
    this.onChange();
  }

  async disconnect() {
    try {
      if (this.device) {
        this.device.removeEventListener('inputreport', this.handle);
        if (this.device.forget) await this.device.forget();
        else await this.device.close();
      }
    } catch { /* ignore */ }
    this.device = null;
    this.config = null;
    this.save(null);
    this.onChange();
  }

  /**
   * Learn the button: the user presses it twice. Resolves { ok: true } or { ok: false, reason } where reason is
   * 'no-data' (the device sent nothing — see diagnose()) or 'unclear' (data came but no button-like bit).
   */
  learn(timeoutMs = 20000) {
    return new Promise((resolve) => {
      const seen = [];
      let quietTimer = null;
      const finish = (result) => {
        clearTimeout(timer);
        clearTimeout(quietTimer);
        this.learning = null;
        resolve(result);
      };
      const decide = () => {
        if (!seen.length) return finish({ ok: false, reason: 'no-data' });
        const binding = chooseButton(seen);
        if (!binding) return finish({ ok: false, reason: 'unclear' });
        this.config = { ...this.config, binding };
        this.save(this.config);
        this.onChange();
        return finish({ ok: true, binding });
      };
      const timer = setTimeout(decide, timeoutMs);
      this.learning = (reportId, bytes) => {
        seen.push({ reportId, bytes });
        // two presses usually give 4 reports; decide 1.2 s after the last one
        clearTimeout(quietTimer);
        if (seen.length >= 3) quietTimer = setTimeout(decide, 1200);
      };
    });
  }

  onReport(e) {
    const bytes = new Uint8Array(e.data.buffer, e.data.byteOffset, e.data.byteLength);
    const copy = Uint8Array.from(bytes);
    const prev = this.last.get(e.reportId);
    this.last.set(e.reportId, copy);
    this.reports++;
    this.onRaw?.(e.reportId, copy);
    if (this.learning) { this.learning(e.reportId, copy); return; }
    const b = this.config?.binding;
    if (!b || b.reportId !== e.reportId) return;
    const isDown = (copy[b.byte] & b.mask) !== 0;
    const wasDown = prev ? (prev[b.byte] & b.mask) !== 0 : false;
    if (isDown && !wasDown) {
      const now = Date.now();
      if (now - this.lastPress < 250) return; // bounce
      this.lastPress = now;
      this.pressed = true;
      this.onPress();
    } else if (!isDown && wasDown && this.pressed) {
      this.pressed = false;
      if (this.mode === 'hold') this.onRelease();
    }
  }

  /** What the browser knows about the device — for the user, IT and support (no personal data). */
  diagnose() {
    const d = this.device;
    const hex = (n) => `0x${Number(n || 0).toString(16).padStart(4, '0')}`;
    const collections = (d?.collections || []).map((c) => ({ usagePage: hex(c.usagePage), usage: hex(c.usage), protected: PROTECTED(c), inputReports: (c.inputReports || []).map((r) => r.reportId) }));
    let hint = '';
    if (!this.supported) hint = 'Przeglądarka nie obsługuje WebHID — użyj aktualnego Chrome lub Edge (albo trybu klawisza).';
    else if (!d) hint = 'Mikrofon nie jest połączony z aplikacją — kliknij „Połącz PowerMic” i wybierz go z listy.';
    else if (collections.length && collections.every((c) => c.protected)) hint = 'Ten mikrofon przedstawia się przeglądarce wyłącznie jako klawiatura / mysz, których strony internetowe nie mogą odczytać. Użyj trybu klawisza (przycisk wysyła klawisz, np. F9).';
    else if (!this.reports) hint = 'Urządzenie nie wysłało żadnych danych. Najczęściej mikrofon jest przechwytywany przez inny program (oprogramowanie Nuance PowerMic, Dragon, SpeechMike Control Center) — zamknij go i spróbuj ponownie — albo zasady przeglądarki blokują to urządzenie (polityka WebHidAllowDevicesForUrls / WebHidBlockedForUrls).';
    else if (!this.bound) hint = 'Dane z mikrofonu docierają. Kliknij „Naucz przycisk” i naciśnij przycisk nagrywania dwa razy.';
    else hint = 'Mikrofon połączony, przycisk nauczony.';
    return { supported: this.supported, connected: this.connected, product: d?.productName || this.config?.productName || '', vendorId: hex(d?.vendorId ?? this.config?.vendorId), productId: hex(d?.productId ?? this.config?.productId), collections, reportsReceived: this.reports, binding: this.config?.binding || null, mode: this.mode, hint };
  }
}

function load() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch { return null; }
}
function save(config) {
  try {
    if (config) localStorage.setItem(STORE_KEY, JSON.stringify(config));
    else localStorage.removeItem(STORE_KEY);
  } catch { /* ignore */ }
}
