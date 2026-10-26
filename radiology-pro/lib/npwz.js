// Numer prawa wykonywania zawodu (NPWZ) of a Polish physician: 7 digits, the first is a check digit —
// (1·d2 + 2·d3 + 3·d4 + 4·d5 + 5·d6 + 6·d7) mod 11, never 0 or 10. This checks the format only, not that the
// number belongs to the person (that needs the Naczelna Izba Lekarska register).
export function validNpwz(value) {
  const s = String(value || '').replace(/\s/g, '');
  if (!/^[1-9]\d{6}$/.test(s)) return false;
  const d = [...s].map(Number);
  let sum = 0;
  for (let i = 1; i <= 6; i++) sum += i * d[i];
  return sum % 11 === d[0];
}
export const cleanNpwz = (value) => String(value || '').replace(/\s/g, '');
