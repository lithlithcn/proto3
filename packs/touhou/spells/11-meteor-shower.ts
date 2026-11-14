import { BK, SH, hB, sB, type SpellDef } from '@pack/combat/api';
import { RBC } from './palette';

/** Star Sign「Meteor Shower Spiral」: double spiral of meteors that slow down then set off again (behaviour BK.meteor). */
export default {
  name: 'Star Sign「Meteor Shower Spiral」', loop: 120,
  fn({ w, s, p, k }) {
    const x = s.x[p]!, y = s.y[p]!;
    if (k % 7 === 0) for (let j = 0; j < 2; j++) hB(w, s, p, x, y, k * 0.065 + j * Math.PI, 3, { col: RBC[(k / 7 | 0) % 7], drg: 0.985, kind: BK.meteor });
    if (k % 4 === 0) for (let j = 0; j < 2; j++) sB(s, p, x, y, -k * 0.05 + j * Math.PI, 2.6, { sh: SH.star, r: 3.5, col: 0xfff7b0 });
  },
} satisfies SpellDef;
