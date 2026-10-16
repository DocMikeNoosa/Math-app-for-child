// Hardware dictation button (e.g. Nuance PowerMic, Philips SpeechMike in HID mode) via WebHID, with a "learn"
// mode: the user presses the chosen button TWICE and the bit that follows the presses (goes on and off) is
// remembered. Bits that never change (status bytes) or change all the time (trackball, counters) are ignored.
// Modes: 'toggle' (press = start, press again = stop) or 'hold' (hold to talk, release to stop).
// When the device sends nothing at all, diagnose() explains the likely cause (another program holds the
// microphone, the browser blocks this kind of device, or no permission) — the workstation check shows it too.

const STORE_KEY = 'radvox.mic.v1';
const MODE_KEY = 'radvox.micmode.v1'; // kept apart so "Odłącz" does not reset the user's choice
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
  if (!best) return null;
  return { reportId: best.reportId, byte: best.byte, mask: best.mask, ...signatureOf(reports, best) };
}

/**
 * What a genuine button message looks like: the bytes that are identical in every report where the button bit
 * changed during learning (e.g. a "message type" byte). Some microphones (PowerMic 4) also send status messages with
 * the same bit meaning something else (the light being on) — those differ in such a byte and are ignored.
 * Returns { sig: [[byte, value], …] } or {} when it cannot be told.
 */
export function signatureOf(reports, { reportId, byte, mask }) {
  const own = reports.filter((r) => r.reportId === reportId);
  const changes = [];
  let prev = null;
  for (const r of own) {
    if (prev && ((prev.bytes[byte] ^ r.bytes[byte]) & mask)) changes.push(r.bytes);
    prev = r;
  }
  if (changes.length < 2) return {};
  const sig = [];
  for (let j = 0; j < changes[0].length; j++) {
    if (j === byte) continue;
    if (changes.every((b) => b[j] === changes[0][j])) sig.push([j, changes[0][j]]);
  }
  return sig.length ? { sig } : {};
}

/**
 * Places in the device's output / feature reports that could switch a light, from the HID descriptor the browser
 * exposes. Bits declared on the standard LED usage page (0x08) come first — that is where a "record" light is
 * normally described. Pure, for tests: [{ type: 'output'|'feature', reportId, length, byte, mask, led }].
 */
export function ledCandidates(collections = []) {
  const out = [];
  const walk = (cols) => {
    for (const c of cols || []) {
      // the keyboard / mouse part of a microphone: the browser never lets a page switch its lights (Num Lock…)
      if (isProtected(c)) continue;
      for (const [type, reports] of [['output', c.outputReports], ['feature', c.featureReports]]) {
        for (const r of reports || []) {
          let bit = 0;
          const slots = [];
          for (const it of r.items || []) {
            const size = Number(it.reportSize) || 0;
            const count = Number(it.reportCount) || 0;
            const usages = it.usages || [];
            const page = usages.length ? usages[0] >>> 16 : it.usageMinimum >>> 16;
            for (let k = 0; k < count; k++) {
              const led = page === 0x08;
              // feature reports can hold device settings: only touch those declared as lights
              if (type === 'feature' && !led) continue;
              if (size === 1) slots.push({ bit: bit + k, led });
              else if (size > 1 && size <= 8) slots.push({ bit: bit + k * size, led }); // multi-bit field: lowest bit = "on"
            }
            bit += size * count;
          }
          const length = Math.ceil(bit / 8);
          if (!length || length > 64) continue;
          for (const sl of slots) out.push({ type, reportId: r.reportId || 0, length, byte: sl.bit >> 3, mask: 1 << (sl.bit & 7), led: sl.led });
        }
      }
      walk(c.children);
    }
  };
  walk(collections);
  // LED-page bits first, output before feature; no duplicates
  const seen = new Set();
  return out.sort((a, b) => Number(b.led) - Number(a.led) || (a.type === 'output' ? -1 : 1) + (b.type === 'output' ? 1 : -1))
    .filter((c) => { const k = `${c.type}:${c.reportId}:${c.byte}:${c.mask}`; if (seen.has(k)) return false; seen.add(k); return true; })
    .slice(0, 48);
}

/** The bytes to send for one light state (one switch, or a remembered pattern of several). */
export function ledBytes(led, on) {
  const data = new Uint8Array(led.length);
  if (!on && Array.isArray(led.off)) data.set(led.off.slice(0, led.length)); // a device with its own "light off" command
  else if (on && Array.isArray(led.on)) data.set(led.on.slice(0, led.length));
  else if (on) data[led.byte] |= led.mask;
  return data;
}

/**
 * A light code typed in by hand (e.g. read by IT from the manufacturer's software): hex bytes for "on" and, if the
 * device needs it, "off". Returns the light setting or { error }. Pure, for tests.
 */
export function parseLedCode(onText, offText = '', reportId = 0, type = 'output') {
  const bytes = (t) => String(t || '').trim().split(/[\s,;:]+/).filter(Boolean).map((x) => x.replace(/^0x/i, ''));
  const on = bytes(onText);
  const off = bytes(offText);
  if (!on.length) return { error: 'Wpisz bajty „włącz” (szesnastkowo, np. 00 01 00 …).' };
  for (const b of [...on, ...off]) if (!/^[0-9a-f]{1,2}$/i.test(b)) return { error: `„${b}” to nie bajt szesnastkowy (00–ff).` };
  const id = Number(reportId) || 0;
  if (id < 0 || id > 255) return { error: 'Numer raportu: 0–255.' };
  const length = Math.max(on.length, off.length);
  if (length > 64) return { error: 'Za długi kod (najwyżej 64 bajty).' };
  const num = (a) => [...a.map((x) => parseInt(x, 16)), ...new Array(length - a.length).fill(0)];
  return { type: type === 'feature' ? 'feature' : 'output', reportId: id, length, on: num(on), off: off.length ? num(off) : undefined, led: false, manual: true };
}

/** The reports (groups of switches) the candidates live in: [{ type, reportId, length }], in candidate order. */
export function ledReports(candidates) {
  const out = [];
  for (const c of candidates) if (!out.some((r) => r.type === c.type && r.reportId === c.reportId)) out.push({ type: c.type, reportId: c.reportId, length: c.length });
  return out;
}
/** A light setting made of several switches of one report (null = every bit of the report on). */
export function ledPattern(report, cands = null) {
  const on = new Array(report.length).fill(cands ? 0 : 0xff);
  for (const c of cands || []) on[c.byte] |= c.mask;
  return { type: report.type, reportId: report.reportId, length: report.length, on, led: false };
}
const isProtected = (c) => c.usagePage === 0x01 && [0x02, 0x06, 0x07, 0x80].includes(c.usage);

// HID usages Chrome does not give to web pages (keyboards, mice…): a device that only has these cannot be read
const PROTECTED = isProtected;
/**
 * Light commands found on real microphones (vendor:product → light setting), used automatically on every computer.
 * Filled in from codes users found with the light search (Diagnostyka → „Kod czerwonej diody”).
 */
export const KNOWN_LEDS = {
  // Nuance PowerMic 4: found on a real device (search attempt 259 = command 0x02 with every value byte on)
  '0554:0064': { type: 'output', reportId: 0, length: 9, on: [0x02, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff], off: [0x02, 0, 0, 0, 0, 0, 0, 0, 0] },
};
/** Record buttons known for a model: used without learning, and to upgrade an older saved button (no signature). */
export const KNOWN_BUTTONS = {
  // Nuance PowerMic 4: button messages "80 00 00 20 …", record button = byte 8 bit 0 (status messages "…08…" ignored)
  '0554:0064': { reportId: 0, byte: 8, mask: 0x01, sig: [[0, 0x80], [3, 0x20]] },
};
const modelKey = (d) => `${Number(d?.vendorId).toString(16).padStart(4, '0')}:${Number(d?.productId).toString(16).padStart(4, '0')}`;
const knownLed = (d) => KNOWN_LEDS[`${Number(d?.vendorId).toString(16).padStart(4, '0')}:${Number(d?.productId).toString(16).padStart(4, '0')}`] || null;

/** A dictation microphone (Nuance PowerMic, Philips SpeechMike) whose buttons a web page can read. */
export const isDictationMic = (d) => [NUANCE_VENDOR_ID, PHILIPS_VENDOR_ID].includes(d?.vendorId) && (d.collections || []).some((c) => !PROTECTED(c));

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
    this.modeValue = (persist && loadMode()) || this.config?.mode || 'toggle';
    this.handle = (e) => this.onReport(e);
  }

  get supported() { return typeof navigator !== 'undefined' && 'hid' in navigator; }
  get connected() { return Boolean(this.device?.opened); }
  get bound() { return Boolean(this.config?.binding); }
  get name() { return this.device?.productName || this.config?.productName || ''; }
  get mode() { return this.modeValue === 'hold' ? 'hold' : 'toggle'; }
  /** A device was chosen (not only the mode / light settings). */
  get known() { return Boolean(this.config?.vendorId); }
  get led() { return this.config?.led || null; }
  /** Possible light switches of the connected device (for the "find the light" step). */
  ledCandidates() { return this.device ? ledCandidates(this.device.collections) : []; }
  /** The groups of switches (reports) — tried whole first, so finding the light takes only a few questions. */
  ledReports() { return ledReports(this.ledCandidates()); }
  /** The switches of one group. */
  ledBits(report) { return this.ledCandidates().filter((c) => c.type === report.type && c.reportId === report.reportId); }

  /** Light on / off (the red "recording" light of a PowerMic). Never throws. */
  async setLed(on, led = this.led) {
    this.ledOn = Boolean(on);
    if (!led || !this.connected) return false;
    const data = ledBytes(led, on);
    const log = (ok, err = '') => {
      // last attempts, for the diagnostic report (what was sent, did the browser accept it)
      (this.ledLog ||= []).push(`${led.type} ${led.reportId} [${[...data].map((b) => b.toString(16).padStart(2, '0')).join(' ')}] ${ok ? 'OK' : `BŁĄD: ${err}`}`);
      if (this.ledLog.length > 12) this.ledLog.shift();
    };
    try {
      // the microphone may answer a light change with a status message: no "press" is taken from it for a moment
      this.quietUntil = Date.now() + 500;
      if (led.type === 'feature') await this.device.sendFeatureReport(led.reportId, data);
      else await this.device.sendReport(led.reportId, data);
      log(true);
      return true;
    } catch (err) {
      this.ledError = err?.message || String(err);
      log(false, this.ledError);
      return false;
    }
  }
  saveLed(led) {
    this.config = { ...(this.config || {}), led: led || null };
    this.save(this.config);
    this.onChange();
  }
  /** A light code known for this model is used without asking; so is exactly one standard LED declared. */
  autoLed() {
    const known = knownLed(this.device);
    // a built-in code replaces one found by the automatic search (a code typed in by hand is the user's choice)
    if (known && !this.led?.manual && !this.led?.known) { const led = { ...known, led: false, known: true }; this.saveLed(led); return led; }
    if (this.led) return this.led;
    const leds = this.ledCandidates().filter((c) => c.led);
    if (leds.length === 1) { this.saveLed(leds[0]); return leds[0]; }
    return null;
  }
  setMode(mode) {
    this.modeValue = mode === 'hold' ? 'hold' : 'toggle';
    if (this.persist) { try { localStorage.setItem(MODE_KEY, this.modeValue); } catch { /* ignore */ } }
    this.onChange();
  }

  save(config) { if (this.persist) save(config); }

  /** A known model's record button: set it when none is learned yet, or replace an older one without a signature. */
  applyKnownButton() {
    const known = KNOWN_BUTTONS[modelKey(this.device)];
    if (!known || !this.config || this.config.vendorId !== this.device.vendorId || this.config.productId !== this.device.productId) return false;
    const b = this.config.binding;
    if (b && b.sig) return false;
    if (b && (b.reportId !== known.reportId || b.byte !== known.byte || b.mask !== known.mask)) return false; // the user taught another button
    this.config = { ...this.config, binding: { ...known } };
    this.save(this.config);
    return true;
  }
  /** A device needs setting up: chosen before but not connected now, or connected without a learned button. */
  get needsSetup() { return this.supported && this.known && (!this.connected || !this.bound); }
  /** A different microphone than the remembered one was taken over (e.g. a new PowerMic): learn its button. */
  adopt(d) {
    const same = this.config && this.config.vendorId === d.vendorId && this.config.productId === d.productId;
    if (same) return;
    this.config = { vendorId: d.vendorId, productId: d.productId, productName: d.productName, binding: null, led: null };
    this.save(this.config);
    this.replaced = !this.applyKnownButton();
    this.onChange();
  }

  /**
   * Reopen a device the user already allowed (no prompt). If the remembered microphone is not there but another
   * allowed dictation microphone is (a new PowerMic), use that one — its button is then learned once.
   */
  async restore() {
    if (!this.supported) return false;
    const exact = (x) => this.config && x.vendorId === this.config.vendorId && x.productId === this.config.productId;
    try {
      const devices = await navigator.hid.getDevices();
      const d = devices.find(exact);
      const other = !d && this.config?.vendorId ? devices.find(isDictationMic) : null;
      if (d) await this.open(d);
      else if (other) { await this.open(other); this.adopt(other); }
    } catch { /* ignore */ }
    navigator.hid.addEventListener?.('disconnect', (e) => {
      if (e.device === this.device) { this.device = null; this.onChange(); }
    });
    navigator.hid.addEventListener?.('connect', (e) => {
      if (this.device || !this.config) return;
      if (exact(e.device)) this.open(e.device).catch(() => {});
      else if (isDictationMic(e.device)) this.open(e.device).then(() => this.adopt(e.device)).catch(() => {});
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
    this.config = { vendorId: d.vendorId, productId: d.productId, productName: d.productName, binding: same ? this.config.binding : null, led: same ? this.config.led || null : null };
    this.save(this.config);
    this.applyKnownButton();
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
    this.applyKnownButton();
    this.reports = 0;
    this.last.clear();
    this.btnDown = undefined;
    d.addEventListener('inputreport', this.handle);
    this.onChange();
    // keep the light in step with dictation after (re)connecting
    if (this.led) this.setLed(Boolean(this.ledOn));
  }

  /**
   * "Find the light": switch candidate n on (the previous one off). The page asks "is the red light on?" and calls
   * saveLed(candidate) on yes. Returns the candidate or null when there are no more.
   */
  async tryLed(n) {
    const list = this.ledCandidates();
    if (n > 0 && list[n - 1]) await this.setLed(false, list[n - 1]);
    const c = list[n];
    if (!c) return null;
    await this.setLed(true, c);
    return c;
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
    // only genuine button messages count (see signatureOf); others (status, light echo) are ignored
    if (b.sig && !b.sig.every(([j, v]) => copy[j] === v)) return;
    const isDown = (copy[b.byte] & b.mask) !== 0;
    // the button's state comes only from genuine button messages (never from a status message in between)
    const wasDown = this.btnDown ?? false;
    const now = Date.now();
    if (isDown && !wasDown) {
      // right after switching the light, an apparent press is the device's echo, not the user: ignore it
      // (releases are still taken, so the next real press is never missed)
      if (now < (this.quietUntil || 0)) return;
      this.btnDown = true;
      if (now - this.lastPress < 250) return; // bounce
      this.lastPress = now;
      this.pressed = true;
      this.onPress();
    } else if (!isDown && wasDown) {
      this.btnDown = false;
      if (this.pressed) {
        this.pressed = false;
        if (this.mode === 'hold') this.onRelease();
      }
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
    const leds = d ? ledCandidates(d.collections) : [];
    // the device's full report layout as the browser sees it: where a light could be switched
    const page = (u) => `0x${((u >>> 16) || 0).toString(16)}`;
    const items = (r) => (r.items || []).map((it) => `${it.reportSize}×${it.reportCount}${(it.usages || []).length ? ` str.${page(it.usages[0])}` : ''}`).join(' + ');
    const layout = [];
    const walk = (cols, depth = 0) => {
      for (const c of cols || []) {
        layout.push(`${'  '.repeat(depth)}kolekcja ${hex(c.usagePage)}/${hex(c.usage)}${PROTECTED(c) ? ' (klawiatura/mysz — zablokowana)' : ''}: wejście [${(c.inputReports || []).map((r) => r.reportId).join(', ')}] · wyjście [${(c.outputReports || []).map((r) => `${r.reportId}: ${items(r)}`).join('; ')}] · funkcje [${(c.featureReports || []).map((r) => `${r.reportId}: ${items(r)}`).join('; ')}]`);
        walk(c.children, depth + 1);
      }
    };
    walk(d?.collections);
    return { layout, ledLog: this.ledLog || [], leds: leds.length, ledsStandard: leds.filter((c) => c.led).length, led: this.led, ledError: this.ledError || '', supported: this.supported, connected: this.connected, product: d?.productName || this.config?.productName || '', vendorId: hex(d?.vendorId ?? this.config?.vendorId), productId: hex(d?.productId ?? this.config?.productId), collections, reportsReceived: this.reports, binding: this.config?.binding || null, mode: this.mode, hint };
  }
}

function loadMode() {
  try { return localStorage.getItem(MODE_KEY); } catch { return null; }
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
