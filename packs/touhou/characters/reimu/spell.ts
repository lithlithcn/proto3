import { MOVES, SRC, TAU, patternHeavy, type SpellDef } from '@pack/combat/api';

const RB = [0xff4a4a, 0xffa63a, 0xffe83a, 0x5cff7a, 0x4ab3ff, 0xc06cff];
/** Spirit Sign「Fantasy Seal」: every 45 f a ring of 7 slow homing power orbs. */
export const reimuSpell: SpellDef = {
  name: 'Spirit Sign「Fantasy Seal」', loop: 90,
  fn({ w, s, p, k }) {
    if (k % 45) return;
    for (let i = 0; i < 7; i++) patternHeavy(w, s, p, i * TAU / 7, 4.5, MOVES.heavyN, SRC.heavyN, 240, RB[i % 6]!, 0.035);
  },
};
