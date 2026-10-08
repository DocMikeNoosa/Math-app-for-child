// EndoList — ochrona danych przy korzystaniu z AI (RODO art. 25: minimalizacja, pseudonimizacja).
// Przed wysłaniem do AI wszystkie znane identyfikatory (imiona i nazwiska pacjenta, lekarzy, PESEL, daty urodzenia)
// oraz wzorce (PESEL, telefon, e-mail) są zastępowane znacznikami [OSOBA-1], [PESEL-1]…; po odpowiedzi
// aplikacja przywraca je lokalnie. Do AI nie trafia żaden z tych identyfikatorów.

const L = '\\p{L}';
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// fields that carry structure, not free text (visit dates, tooth numbers, enums) — left untouched
const SKIP = new Set(['date', 'tooth', 'language', 'grammatical_gender', 'kind', 'location', 'status', 'include_icd10', 'repeat_referral']);

/** Polish names are inflected (Kowalska → Kowalskiej, Anna → Annę): match the stem plus a short ending. */
function nameRe(word) {
  const w = word.trim(); if (w.length < 3) return null;
  const stem = w.length >= 6 ? w.slice(0, -2) : w.length >= 4 ? w.slice(0, -1) : w;
  return new RegExp(`(?<![${L}\\d])${escRe(stem)}[${L}]{0,4}(?![${L}\\d])`, 'giu');
}

export class Pseudonymizer {
  /** people: [{ first, last }], extra: other literal identifiers (PESEL, DOB…) */
  constructor({ people = [], extra = [] } = {}) {
    this.map = new Map(); // token → original text
    this.rules = [];
    let n = 0;
    // generic patterns first (an e-mail address may contain a name)
    this.rules.push({ re: /(?<!\d)\d{11}(?!\d)/g, tok: '[PESEL]' });
    this.rules.push({ re: /[\w.+-]+@[\w-]+(\.[\w-]+)+/g, tok: '[E-MAIL]' });
    this.rules.push({ re: /(?<!\d)(\+?48[\s-]?)?\d{3}[\s-]\d{3}[\s-]\d{3}(?!\d)/g, tok: '[TELEFON]' });
    for (const x of extra.filter(Boolean)) this.rules.push({ re: new RegExp(escRe(String(x)), 'g'), tok: '[DANE]' });
    for (const p of people) {
      const words = [p.first, p.last].filter(Boolean).flatMap((x) => String(x).split(/[\s-]+/)).filter((x) => x.length >= 3);
      if (!words.length) continue;
      const tok = `[OSOBA-${++n}]`;
      // full name first (keeps "Anna Kowalska" as one token), then each part
      if (p.first && p.last) this.rules.push({ re: new RegExp(`(?<![${L}])${escRe(p.first.trim())}\\s+${escRe(p.last.trim())}[${L}]{0,4}(?![${L}])`, 'giu'), tok });
      for (const w of words) { const re = nameRe(w); if (re) this.rules.push({ re, tok }); }
    }
    this.count = 0;
  }
  text(s) {
    if (typeof s !== 'string' || !s) return s;
    let out = s;
    for (const { re, tok } of this.rules) {
      out = out.replace(re, (m) => {
        this.count++;
        // keep a unique token per distinct original so it can be put back (e.g. [OSOBA-1] → "Kowalskiej")
        const variant = [...this.map.entries()].find(([, v]) => v === m)?.[0];
        if (variant) return variant;
        const t = this.map.has(tok) ? tok.replace(/\]$/, `.${this.map.size + 1}]`) : tok;
        this.map.set(t, m); return t;
      });
    }
    return out;
  }
  apply(obj, key = '') {
    if (typeof obj === 'string') return SKIP.has(key) ? obj : this.text(obj);
    if (Array.isArray(obj)) return obj.map((x) => this.apply(x, key));
    if (obj && typeof obj === 'object') return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, this.apply(v, k)]));
    return obj;
  }
  restore(obj) {
    if (typeof obj === 'string') {
      let s = obj;
      // longest tokens first so "[OSOBA-1.3]" is not cut by "[OSOBA-1]"
      for (const t of [...this.map.keys()].sort((a, b) => b.length - a.length)) s = s.split(t).join(this.map.get(t));
      return s;
    }
    if (Array.isArray(obj)) return obj.map((x) => this.restore(x));
    if (obj && typeof obj === 'object') return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, this.restore(v)]));
    return obj;
  }
}

export const PSEUDO_NOTE = 'Dane identyfikujące zostały zastąpione znacznikami w nawiasach kwadratowych, np. [OSOBA-1], [PESEL], [TELEFON]. Jeżeli musisz odnieść się do takiego fragmentu, przepisz znacznik dokładnie bez zmian; nie próbuj odgadywać ukrytych danych.';
