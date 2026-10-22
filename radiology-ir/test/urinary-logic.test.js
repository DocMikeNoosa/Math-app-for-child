// The shared finding analysis (same code as RadVox): the old bug: „odmiedniczkowe” (pyelonephritis) was read as „odma” (pneumothorax) and sent to the top.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyseFinding } from '../public/js/crosscheck.js';

const S = {
  strand: 'Pasmowate zatarcie tkanki tłuszczowej okołonerkowej po stronie lewej — prawdopodobnie w związku z zastojem, nie można wykluczyć odmiedniczkowego zapalenia nerki lewej.',
  stone: 'W dystalnym odcinku moczowodu lewego złóg wielkości 6 mm.',
  hydro: 'Poszerzenie moczowodu lewego powyżej złogu oraz wodonercze lewostronne II stopnia.',
  cyst: 'W wątrobie torbiel prosta średnicy 8 mm.',
};

test('„odmiedniczkowe zapalenie” is not a pneumothorax; „odma” still is', () => {
  assert.ok(!analyseFinding(S.strand).concepts.has('pneumothorax'));
  assert.ok(analyseFinding('Odma opłucnowa po stronie prawej.').concepts.has('pneumothorax'));
});

