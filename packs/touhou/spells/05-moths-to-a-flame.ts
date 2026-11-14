import { cos, sin } from '@kernel';
import { BK, SH, hB, sB, spRand, type SpellDef } from '@pack/combat/api';
import { TAU } from './palette';

/** Moth Sign「Moths to a Flame」: giant moths dive toward the caster and burst into fleas (behaviour BK.moth). */
export default {
  name: 'Moth Sign「Moths to a Flame」', loop: 70,
  fn({ w, s, p, k }) {
    const x = s.x[p]!, y = s.y[p]!;
    if (k % 70 === 0) { const a0 = spRand(s) * TAU; for (let i = 0; i < 16; i++) { const a = a0 + i * TAU / 16; hB(w, s, p, x + cos(a) * 400, y + sin(a) * 400, a + Math.PI / 2, 0.9, { col: 0xffb070, life: 500, kind: BK.moth }); } }
    if (k % 35 === 17) { const a0 = spRand(s) * TAU; for (let i = 0; i < 20; i++) { const a = a0 + i * TAU / 20; sB(s, p, x + cos(a) * 300, y + sin(a) * 300, a - Math.PI / 2, 1.2, { sh: SH.rice, col: 0xffd0a0, life: 300 }); } }
  },
} satisfies SpellDef;
