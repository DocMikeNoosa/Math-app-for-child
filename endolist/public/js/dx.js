// Sugestia rozpoznania wg terminologii AAE na podstawie wyników badań (zawsze do potwierdzenia klinicznego).
import { PULP_DX, PERI_DX } from './data.js';

const listPl = (a) => (a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' i ' + a[a.length - 1]);

export function suggestDx(dx) {
  const x = dx.tests || {}, h = dx.history || {}, rf = dx.radio || [];
  const why = { pulp: [], peri: [] }, warn = [];
  let pulp = '', peri = '';
  const vit = [['zimno', x.cold], ['test elektryczny', x.ept], ['ciepło', x.heat]].filter(([, v]) => v && v !== 'nt');
  const neg = vit.filter(([, v]) => v === 'nr' || v === 'neg');
  if (h.status === 'treated') { pulp = 'PT'; why.pulp.push('ząb leczony wcześniej kanałowo'); }
  else if (h.status === 'initiated') { pulp = 'PIT'; why.pulp.push('leczenie endodontyczne rozpoczęte wcześniej'); }
  else if (!vit.length) {
    if (h.spontaneous) { pulp = 'SIP'; why.pulp.push('ból samoistny (bez testów żywotności)'); }
    warn.push('Brak testów żywotności — rozpoznanie dotyczące miazgi wymaga potwierdzenia.');
  } else if (neg.length === vit.length) {
    pulp = 'PN'; why.pulp.push('brak reakcji: ' + listPl(neg.map((v) => v[0])));
  } else {
    if (neg.length) warn.push('Niezgodne wyniki testów żywotności — rozważ obliterację, niedojrzały wierzchołek lub częściową martwicę w zębie wielokorzeniowym.');
    if (x.cold === 'ling' || x.heat === 'ling' || h.spontaneous) {
      pulp = 'SIP';
      if (x.cold === 'ling') why.pulp.push('przedłużony ból po bodźcu zimnym');
      if (x.heat === 'ling') why.pulp.push('przedłużony ból po bodźcu ciepłym');
      if (h.spontaneous) why.pulp.push('ból samoistny');
      if (h.night) why.pulp.push('ból nocny');
    } else if (x.cold === 'exag') {
      pulp = 'RP'; why.pulp.push('nasilona, krótkotrwała reakcja na zimno');
    } else if (h.deep) {
      pulp = 'AIP'; why.pulp.push('żywa, bezobjawowa miazga przy głębokiej próchnicy / obnażeniu');
    } else { pulp = 'NP'; why.pulp.push('prawidłowe reakcje w testach żywotności'); }
  }
  const perc = x.perc === 'pain', palp = x.palp === 'pain', bite = x.bite === 'pain';
  if (x.swelling && x.swelling !== 'none') { peri = 'AAA'; why.peri.push(x.swelling === 'extra' ? 'obrzęk zewnątrzustny' : 'obrzęk wewnątrzustny'); }
  else if (x.sinus === 'yes') { peri = 'CAA'; why.peri.push('obecna przetoka'); }
  else if (perc || palp || bite) { peri = 'SAP'; why.peri.push([perc && 'bolesne opukiwanie', palp && 'bolesna palpacja', bite && 'ból przy nagryzaniu'].filter(Boolean).join(', ')); }
  else if (rf.includes('parl')) { peri = 'AAP'; why.peri.push('zmiana okołowierzchołkowa bez objawów'); }
  else if (rf.includes('opac')) { peri = 'CO'; why.peri.push('zagęszczenie struktury kostnej okołowierzchołkowo'); }
  else if ((x.perc && x.perc !== 'nt') || (x.palp && x.palp !== 'nt')) { peri = 'NAT'; why.peri.push('opukiwanie i palpacja niebolesne'); }
  if (peri && peri !== 'NAT' && peri !== 'AAP' && rf.includes('parl')) why.peri.push('zmiana okołowierzchołkowa w RTG');
  if (peri === 'AAA' && (pulp === 'NP' || pulp === 'RP')) warn.push('Obrzęk przy żywej miazdze — rozważ przyczynę periodontologiczną lub nieendodontyczną.');
  if (x.bite === 'release') warn.push('Ból przy zwolnieniu nacisku — oceń w kierunku pęknięcia zęba.');
  const pd = parseFloat(x.probe);
  if (x.probeIso || pd >= 6) warn.push(`${x.probeIso ? 'Izolowana wąska kieszeń' : `Głęboka kieszeń (${pd} mm)`} — oceń w kierunku pionowego złamania korzenia / zmiany endo-perio.`);
  if (x.mob === 'II' || x.mob === 'III') warn.push(`Ruchomość ${x.mob}° — oceń stan przyzębia.`);
  return { pulp, peri, why, warn };
}

export function finalDx(dx) {
  const s = suggestDx(dx || {});
  const pulp = (dx && dx.pulp) || s.pulp, peri = (dx && dx.peri) || s.peri;
  return { pulp, peri, s, pulpL: pulp ? PULP_DX[pulp] : null, periL: peri ? PERI_DX[peri] : null };
}
