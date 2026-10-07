// Spoken editing commands, recognised in the raw speech-recognition text before it is added to
// the dictation. parseVoiceCommands() splits a recognised chunk into plain text and commands.

// \b is ASCII-only in JS, so Polish words ("usuń", "zmień") need explicit letter boundaries.
const W = (src) => new RegExp(`(?<![\\p{L}\\d])(?:${src})(?![\\p{L}\\d])`, 'iu');

const COMMANDS = [
  // dictation buffer
  { cmd: 'deleteSentence', re: W('(skasuj|usuń|wykasuj) ostatnie zdanie|delete (the )?last sentence') },
  { cmd: 'deleteWord', re: W('(skasuj|usuń|wykasuj) ostatnie słowo|delete (the )?last word') },
  { cmd: 'undoChunk', re: W('(cofnij to|cofnij ostatnie)|scratch that|undo that') },
  { cmd: 'clear', re: W('(wyczyść|skasuj) (cały )?dyktat|clear (the )?dictation') },
  // app actions
  { cmd: 'prepare', re: W('(przygotuj|opracuj|zrób) opis|prepare (the )?report') },
  { cmd: 'copy', re: W('(kopiuj|skopiuj) opis|copy (the )?report') },
  { cmd: 'stop', re: W('(zakończ|zatrzymaj|stop) dyktowani[ea]|stop dictation') },
];

// Editing commands for the finished report: the rest of the chunk goes to the AI instruction.
const INSTRUCTION_RE = /^(?:polecenie|instrukcja|instruction|command)[\s:,]+(.+)$/iu;
const EDIT_RE = /^((?:zmień|popraw|dodaj do wniosków|dodaj do opisu|usuń z opisu|usuń z wniosków|skróć|przenieś|change|add to (?:the )?conclusion|remove from (?:the )?report|shorten)(?![\p{L}\d]).*)$/iu;

/**
 * Split recognised text into parts: { text } and { cmd } (and { cmd: 'instruction', text }).
 * Commands may appear anywhere in the chunk; text before and after them is kept in order.
 */
export function parseVoiceCommands(raw) {
  const text = String(raw || '').trim();
  if (!text) return [];
  const instr = text.match(INSTRUCTION_RE);
  if (instr) return [{ cmd: 'instruction', text: instr[1].trim() }];
  const parts = [];
  let rest = text;
  for (;;) {
    let first = null;
    for (const c of COMMANDS) {
      const m = rest.match(c.re);
      if (m && (!first || m.index < first.index)) first = { cmd: c.cmd, index: m.index, length: m[0].length };
    }
    if (!first) break;
    const before = rest.slice(0, first.index).trim();
    if (before) parts.push(...textOrInstruction(before));
    parts.push({ cmd: first.cmd });
    rest = rest.slice(first.index + first.length).replace(/^[\s.,;:!?]+/, '');
  }
  if (rest.trim()) parts.push(...textOrInstruction(rest.trim()));
  return parts;
}

function textOrInstruction(text) {
  const m = text.match(EDIT_RE);
  return m ? [{ cmd: 'instruction', text: m[1].trim() }] : [{ text }];
}

/** Remove the last sentence of the dictation (falls back to `previous`, the text before the last chunk). */
export function dropLastSentence(text, previous = '') {
  const t = String(text || '').replace(/\s+$/, '').replace(/[.!?]+$/, '');
  const cut = Math.max(t.lastIndexOf('. '), t.lastIndexOf('! '), t.lastIndexOf('? '), t.lastIndexOf('\n'));
  if (cut >= 0) return `${t.slice(0, cut + 1).replace(/\s+$/, '')} `.replace(/^\s+$/, '');
  return previous;
}

/** Remove the last word (and any punctuation after it). */
export function dropLastWord(text) {
  const t = String(text || '').replace(/[\s.,;:!?]+$/, '');
  const cut = t.search(/\S+$/);
  if (cut <= 0) return '';
  return `${t.slice(0, cut).replace(/\s+$/, '')} `;
}

export const COMMAND_LABELS = {
  deleteSentence: 'Usunięto ostatnie zdanie',
  deleteWord: 'Usunięto ostatnie słowo',
  undoChunk: 'Cofnięto ostatni fragment',
  clear: 'Wyczyszczono dyktat',
  prepare: 'Przygotowuję opis…',
  copy: 'Kopiuję opis…',
  stop: 'Zatrzymano dyktowanie',
  instruction: 'Polecenie dla AI',
};
