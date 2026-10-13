// Hardware dictation button (e.g. Nuance PowerMic) via WebHID, with a "learn" mode: the user
// presses the chosen button once and the bit that changed in the HID report is remembered.
// Each later press of that button calls onPress (the app toggles recording).

const STORE_KEY = 'radvox.mic.v1';
export const NUANCE_VENDOR_ID = 0x0554;

/** Bits that went from 0 to 1 between two reports: [{ byte, mask }]. Pure, for tests. */
export function risingBits(prev, next) {
  const out = [];
  for (let i = 0; i < next.length; i++) {
    const rose = next[i] & ~(prev?.[i] ?? 0);
    for (let b = 0; b < 8; b++) if (rose & (1 << b)) out.push({ byte: i, mask: 1 << b });
  }
  return out;
}

export class MicButton {
  constructor({ onPress, onChange }) {
    this.onPress = onPress;
    this.onChange = onChange || (() => {});
    this.device = null;
    this.learning = null; // resolve function while waiting for the button
    this.last = new Map(); // reportId → previous report bytes
    this.lastPress = 0;
    this.config = load();
    this.handle = (e) => this.onReport(e);
  }

  get supported() { return typeof navigator !== 'undefined' && 'hid' in navigator; }
  get connected() { return Boolean(this.device?.opened); }
  get bound() { return Boolean(this.config?.binding); }
  get name() { return this.device?.productName || this.config?.productName || ''; }

  /** Reopen a device the user already allowed (no prompt). */
  async restore() {
    if (!this.supported || !this.config) return false;
    try {
      const devices = await navigator.hid.getDevices();
      const d = devices.find((x) => x.vendorId === this.config.vendorId && x.productId === this.config.productId);
      if (d) await this.open(d);
    } catch { /* ignore */ }
    navigator.hid.addEventListener?.('disconnect', (e) => {
      if (e.device === this.device) { this.device = null; this.onChange(); }
    });
    navigator.hid.addEventListener?.('connect', (e) => {
      if (!this.device && this.config && e.device.vendorId === this.config.vendorId && e.device.productId === this.config.productId) this.open(e.device);
    });
    return this.connected;
  }

  /** Ask the user to pick the device (Nuance first; `any` lists every HID device). */
  async connect({ any = false } = {}) {
    if (!this.supported) throw new Error('Ta przeglądarka nie obsługuje WebHID — użyj Chrome lub Edge.');
    const filters = any ? [] : [{ vendorId: NUANCE_VENDOR_ID }];
    const [d] = await navigator.hid.requestDevice({ filters });
    if (!d) return false;
    await this.open(d);
    const keep = this.config && this.config.vendorId === d.vendorId && this.config.productId === d.productId ? this.config.binding : null;
    this.config = { vendorId: d.vendorId, productId: d.productId, productName: d.productName, binding: keep };
    save(this.config);
    this.onChange();
    return true;
  }

  async open(d) {
    if (!d.opened) await d.open();
    if (this.device && this.device !== d) this.device.removeEventListener('inputreport', this.handle);
    this.device = d;
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
    save(null);
    this.onChange();
  }

  /** Resolve with true after the next button press is learned (false on timeout). */
  learn(timeoutMs = 15000) {
    return new Promise((resolve) => {
      const timer = setTimeout(() => { this.learning = null; resolve(false); }, timeoutMs);
      this.learning = (binding) => {
        clearTimeout(timer);
        this.learning = null;
        this.config = { ...this.config, binding };
        save(this.config);
        this.onChange();
        resolve(true);
      };
    });
  }

  onReport(e) {
    const bytes = new Uint8Array(e.data.buffer, e.data.byteOffset, e.data.byteLength);
    const prev = this.last.get(e.reportId);
    this.last.set(e.reportId, Uint8Array.from(bytes));
    const rising = risingBits(prev, bytes);
    if (!rising.length) return;
    if (this.learning) {
      const r = rising[0];
      this.learning({ reportId: e.reportId, byte: r.byte, mask: r.mask });
      return;
    }
    const b = this.config?.binding;
    if (!b || b.reportId !== e.reportId) return;
    if (!rising.some((r) => r.byte === b.byte && r.mask === b.mask)) return;
    const now = Date.now();
    if (now - this.lastPress < 300) return; // bounce
    this.lastPress = now;
    this.onPress();
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
