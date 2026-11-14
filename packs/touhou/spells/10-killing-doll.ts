import { BK, SH, hB, sB, spRand, type SpellDef } from '@pack/combat/api';
import { TAU } from './palette';

/** Illusion Sign「Killing Doll Redirect」: dolls brake, freeze, then are sent at the target (behaviours BK.dollH / BK.dollK). */
export default {
  name: 'Illusion Sign「Killing Doll Redirect」', loop: 55,
  fn({ w, s, p, k }) {
    if (k % 55) return;
    const x = s.x[p]!, y = s.y[p]!, a0 = spRand(s) * TAU;
    for (let i = 0; i < 16; i++) hB(w, s, p, x, y, a0 + i * TAU / 16, 5, { col: 0xd8e0ff, drg: 0.92, life: 320, kind: BK.dollH });
    for (let i = 0; i < 24; i++) sB(s, p, x, y, a0 + i * TAU / 24 + TAU / 48, 4, { sh: SH.kunai, col: 0xf0f4ff, drg: 0.93, life: 260, kind: BK.dollK });
  },
} satisfies SpellDef;
