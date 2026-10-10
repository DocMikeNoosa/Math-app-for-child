// DentList — skargi i pisma (np. od pacjenta, pełnomocnika, Rzecznika Praw Pacjenta): dane, gotowe argumenty,
// wbudowany projekt odpowiedzi (bez AI) i dane dla AI. Odpowiedź jest zawsze projektem do sprawdzenia przez
// dyrektora medycznego; przy piśmie od kancelarii lub roszczeniu warto skonsultować ją z prawnikiem / ubezpieczycielem OC.
import { recordEntry, fmtDate, PT } from './letter.js';

export const SOURCES = {
  patient: 'Pacjent', family: 'Rodzina / opiekun pacjenta', lawyer: 'Kancelaria / pełnomocnik pacjenta', rpp: 'Rzecznik Praw Pacjenta',
  oil: 'Okręgowa Izba Lekarska (rzecznik odpowiedzialności zawodowej)', nfz: 'NFZ', insurer: 'Ubezpieczyciel', other: 'Inne',
};
export const STATUS = { new: 'nowa', work: 'w opracowaniu', sent: 'odpowiedź wysłana', closed: 'zamknięta' };
export const TONES = { factual: 'rzeczowy', concil: 'ugodowy', firm: 'stanowczy' };

/** Common, factual arguments — the director ticks only those that are true in this case. */
export const REBUTTALS = {
  consent: { label: 'Świadoma zgoda', text: 'Przed rozpoczęciem leczenia Pacjent został poinformowany o rozpoznaniu, proponowanym leczeniu, możliwych alternatywach oraz ryzyku i wyraził świadomą zgodę na leczenie.' },
  standard: { label: 'Zgodnie z wiedzą medyczną', text: 'Leczenie zostało przeprowadzone zgodnie z aktualną wiedzą medyczną i przyjętymi standardami postępowania, z zachowaniem należytej staranności.' },
  docs: { label: 'Udokumentowane (dokumentacja, RTG)', text: 'Przebieg leczenia jest szczegółowo udokumentowany w dokumentacji medycznej, w tym na zdjęciach radiologicznych wykonanych w trakcie leczenia.' },
  complication: { label: 'Znane powikłanie', text: 'Opisane dolegliwości mieszczą się w zakresie znanych i opisywanych w literaturze możliwych następstw lub powikłań tego rodzaju leczenia, o których Pacjent był informowany, i same w sobie nie świadczą o nieprawidłowym wykonaniu zabiegu.' },
  prognosis: { label: 'Rokowanie przedstawione', text: 'Rokowanie leczonego zęba było przed leczeniem ocenione i przedstawione Pacjentowi, w tym możliwość niepowodzenia leczenia mimo prawidłowego postępowania.' },
  compliance: { label: 'Niezastosowanie się do zaleceń', text: 'Z dokumentacji wynika, że Pacjent nie zastosował się do części zaleceń pozabiegowych (np. dotyczących ostatecznej odbudowy zęba lub wizyt kontrolnych), co mogło mieć wpływ na wynik leczenia.' },
  time: { label: 'Długi czas od leczenia', text: 'Dolegliwości pojawiły się po znacznym czasie od zakończenia leczenia, co wskazuje na możliwość innej, niezależnej przyczyny.' },
  other: { label: 'Inna przyczyna dolegliwości', text: 'Z oceny klinicznej wynika, że przyczyną zgłaszanych dolegliwości może być stan niezwiązany bezpośrednio z wykonanym leczeniem.' },
  fee: { label: 'Koszt zgodny z cennikiem', text: 'Wynagrodzenie za leczenie było zgodne z cennikiem i kosztorysem przedstawionym Pacjentowi przed rozpoczęciem leczenia.' },
  control: { label: 'Propozycja wizyty kontrolnej', text: 'Proponujemy Pacjentowi bezpłatną wizytę kontrolną w celu oceny stanu zdrowia i omówienia dalszego postępowania.' },
  docsAccess: { label: 'Dostęp do dokumentacji', text: 'Dokumentacja medyczna może zostać udostępniona na zasadach określonych w ustawie o prawach pacjenta i Rzeczniku Praw Pacjenta.' },
  goodwill: { label: 'Gest dobrej woli (bez uznania roszczenia)', text: 'Bez uznania zasadności roszczenia, w geście dobrej woli, jesteśmy gotowi zaproponować rozwiązanie opisane poniżej.' },
};

export function newComplaint() {
  return {
    id: crypto.randomUUID(), createdAt: Date.now(), received: new Date().toISOString().slice(0, 10), deadline: '',
    patientId: '', visitIds: [], doctor: '', source: 'patient', sender: '', senderAddress: '', summary: '', scans: [],
    rebuttals: [], position: '', offer: '', tone: 'factual', status: 'new', allowScanAI: false,
    response: { subject: '', paragraphs: [], source: '', warnings: [] },
  };
}

const salutationFor = (c) => (c.source === 'lawyer' || c.source === 'rpp' || c.source === 'oil' || c.source === 'nfz' || c.source === 'insurer' || c.source === 'other' ? 'Szanowni Państwo,' : 'Szanowna Pani / Szanowny Panie,');

/** Built-in draft (no AI): facts from the records + the ticked arguments + the director's position. */
export function builtinComplaintDraft(c, { patient = {}, visits = [] }) {
  const P = PT[patient.sex === 'm' ? 'm' : 'f'];
  const subject = `Odpowiedź na pismo z dnia ${fmtDate(c.received)} dotyczące leczenia ${P.gen}`;
  const paras = [];
  paras.push(`W odpowiedzi na pismo z dnia ${fmtDate(c.received)}${c.sender ? ` (${c.sender})` : ''}, dotyczące leczenia ${P.gen} w naszej placówce, uprzejmie przedstawiam stanowisko po zapoznaniu się z dokumentacją medyczną${c.doctor ? ` oraz wyjaśnieniami lekarza prowadzącego (${c.doctor})` : ''}.`);
  if (c.summary.trim()) paras.push(`W piśmie wskazano: ${c.summary.trim().replace(/([^.!?])$/, '$1.')}`);
  // the treatment record, one readable paragraph per visit date / tooth / whole-mouth block
  const blocks = []; let date = '', cur = null;
  for (const l of recordEntry({ visits, patient, fmtDate }).split('\n').map((x) => x.trim()).filter(Boolean)) {
    if (/^Data: /.test(l)) { date = l.replace(/^Data: /, ''); continue; }
    const tooth = l.match(/^Ząb (\d+) — (.+)$/);
    if (tooth) { cur = { head: `${date ? date + ', ' : ''}ząb ${tooth[1]} (${tooth[2]})`, lines: [] }; blocks.push(cur); continue; }
    if (l === 'Jama ustna') { cur = { head: `${date ? date + ', ' : ''}w obrębie jamy ustnej`, lines: [] }; blocks.push(cur); continue; }
    if (cur) cur.lines.push(l.replace(/^Leczenie: /, '').replace(/([^.!?])$/, '$1.'));
  }
  if (blocks.length) {
    paras.push('Z dokumentacji medycznej wynika następujący przebieg leczenia:');
    for (const b of blocks.filter((x) => x.lines.length)) paras.push(`${b.head[0].toUpperCase() + b.head.slice(1)}: ${b.lines.join(' ')}`);
  }
  for (const k of c.rebuttals) if (REBUTTALS[k]) paras.push(REBUTTALS[k].text.replace(/\bPacjent\b/g, P.nom).replace(/\bPacjentowi\b/g, P.nom === 'Pacjentka' ? 'Pacjentce' : 'Pacjentowi'));
  if (c.position.trim()) paras.push(c.position.trim().replace(/([^.!?])$/, '$1.'));
  if (c.offer.trim()) paras.push(c.offer.trim().replace(/([^.!?])$/, '$1.'));
  paras.push('Pozostajemy do dyspozycji w celu wyjaśnienia wszelkich wątpliwości i zapraszamy do kontaktu z placówką.');
  return { subject, salutation: salutationFor(c), paragraphs: paras, source: 'auto', warnings: [] };
}

/** Data for the AI (identifiers are pseudonymised before sending; the scan is attached only with explicit consent). */
export function complaintPayload(c, { patient = {}, visits = [], doctor = {} }) {
  return {
    language: 'pl',
    author: { role: 'dyrektor medyczny / kierownik placówki', grammatical_gender: doctor.gender === 'm' ? 'male' : 'female' },
    patient: { grammatical_gender: patient.sex === 'm' ? 'male' : 'female' },
    letter_from: SOURCES[c.source], received: c.received,
    complaint_summary: c.summary, treating_doctor: c.doctor,
    treatment_record: recordEntry({ visits, patient, fmtDate }),
    selected_arguments: c.rebuttals.map((k) => REBUTTALS[k]?.text).filter(Boolean),
    director_position: c.position, offer: c.offer, tone: TONES[c.tone],
    scan_attached: !!(c.allowScanAI && c.scans.length),
  };
}
export { salutationFor };
