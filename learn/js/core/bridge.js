/* Bridge between the Australian and Polish programmes: overlapping topics and a two-language glossary. */
(function () {
  'use strict';
  const LA = window.LA;
  const S = LA.store;
  const B = (LA.bridge = {});

  /* Chapters carry a shared `bridge` tag (e.g. 'times-tables') in both programmes. */
  B.overlaps = (profile) => {
    if (!profile || !profile.au.on || !profile.pl.on) return [];
    const au = (LA.curriculum['au' + profile.au.year] || { subjects: [] }).subjects;
    const pl = (LA.curriculum['pl' + profile.pl.year] || { subjects: [] }).subjects;
    const plByTag = {};
    pl.forEach((s) => s.chapters.forEach((ch) => { if (ch.bridge) (plByTag[ch.bridge] = plByTag[ch.bridge] || []).push(ch); }));
    const out = [];
    au.forEach((s) => s.chapters.forEach((ch) => {
      if (!ch.bridge || !plByTag[ch.bridge]) return;
      plByTag[ch.bridge].forEach((p) => out.push({ tag: ch.bridge, au: ch, pl: p, auDone: S.isChapterPassed(ch.key), plDone: S.isChapterPassed(p.key) }));
    }));
    return out;
  };

  /* Core school words every bilingual learner needs, plus vocab from the lessons that carry a Polish meaning. */
  const CORE = [
    ['add', 'dodawać'], ['subtract', 'odejmować'], ['multiply', 'mnożyć'], ['divide', 'dzielić'], ['equals', 'równa się'], ['sum / total', 'suma'], ['difference', 'różnica'],
    ['product', 'iloczyn'], ['quotient', 'iloraz'], ['remainder', 'reszta'], ['fraction', 'ułamek'], ['half', 'połowa'], ['quarter', 'ćwierć'], ['numerator', 'licznik'], ['denominator', 'mianownik'],
    ['decimal', 'ułamek dziesiętny'], ['even number', 'liczba parzysta'], ['odd number', 'liczba nieparzysta'], ['digit', 'cyfra'], ['ones / tens / hundreds', 'jedności / dziesiątki / setki'],
    ['length', 'długość'], ['mass', 'masa'], ['capacity', 'pojemność'], ['area', 'pole'], ['perimeter', 'obwód'], ['angle', 'kąt'], ['right angle', 'kąt prosty'],
    ['triangle', 'trójkąt'], ['square', 'kwadrat'], ['rectangle', 'prostokąt'], ['circle', 'koło'], ['cube', 'sześcian'], ['clock', 'zegar'], ['hour / minute', 'godzina / minuta'],
    ['noun', 'rzeczownik'], ['verb', 'czasownik'], ['adjective', 'przymiotnik'], ['adverb', 'przysłówek'], ['sentence', 'zdanie'], ['full stop', 'kropka'], ['question mark', 'znak zapytania'],
    ['comma', 'przecinek'], ['capital letter', 'wielka litera'], ['spelling', 'pisownia / ortografia'], ['story', 'opowiadanie'], ['character', 'bohater'], ['setting', 'miejsce akcji'], ['poem', 'wiersz'],
    ['living thing', 'organizm żywy'], ['plant', 'roślina'], ['animal', 'zwierzę'], ['life cycle', 'cykl życia'], ['habitat', 'środowisko życia'], ['food chain', 'łańcuch pokarmowy'], ['weather', 'pogoda'],
    ['heat', 'ciepło'], ['solid / liquid / gas', 'ciało stałe / ciecz / gaz'], ['melting', 'topnienie'], ['freezing', 'zamarzanie'], ['evaporation', 'parowanie'], ['force', 'siła'], ['magnet', 'magnes'],
    ['map', 'mapa'], ['compass', 'kompas'], ['north / south / east / west', 'północ / południe / wschód / zachód'], ['country', 'państwo / kraj'], ['continent', 'kontynent'], ['ocean', 'ocean'],
    ['rule', 'zasada'], ['law', 'prawo'], ['community', 'społeczność'], ['history', 'historia'], ['homework', 'praca domowa'], ['quiz', 'sprawdzian / kartkówka'], ['answer', 'odpowiedź'], ['question', 'pytanie'],
  ];
  B.glossary = (profile) => {
    const seen = new Set();
    const out = [];
    const push = (en, pl) => { const k = en.toLowerCase(); if (seen.has(k) || !pl) return; seen.add(k); out.push({ en, pl }); };
    if (profile && profile.au.on) {
      (LA.curriculum['au' + profile.au.year] || { subjects: [] }).subjects.forEach((s) => s.chapters.forEach((ch) => ch.lessons.forEach((l) => l.blocks.forEach((b) => { if (b.type === 'vocab') b.words.forEach((w) => push(w[0], w[2])); }))));
    }
    CORE.forEach(([en, pl]) => push(en, pl));
    return out;
  };
})();
