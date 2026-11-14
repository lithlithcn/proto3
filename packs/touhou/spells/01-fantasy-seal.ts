import { BK, hB, sB, type SpellDef } from '@pack/combat/api';
import { RBC, TAU } from './palette';

/** Spirit Sign「Fantasy Seal」: sacred orbs that curve toward the target. */
export default {
  name: 'Spirit Sign「Fantasy Seal」', loop: 40,
  fn({ w, s, p, k }) {
    if (k % 40 === 0) for (let i = 0; i < 8; i++) hB(w, s, p, s.x[p]!, s.y[p]!, k * 0.02 + i * TAU / 8, 2.7, { col: RBC[i % 7], kind: BK.home, p0: 80, p1: 0.022 });
    if (k % 3 === 0) for (let i = 0; i < 4; i++) sB(s, p, s.x[p]!, s.y[p]!, k * 0.09 + i * Math.PI / 2, 3, { col: 0xffd0e0, life: 240 });
  },
} satisfies SpellDef;
