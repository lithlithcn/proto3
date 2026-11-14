import { SH, hB, sB, type SpellDef } from '@pack/combat/api';
import { RBC, TAU } from './palette';

/** Fate Sign「Wheel of Fortune」: rotating spokes of giant danmaku. */
export default {
  name: 'Fate Sign「Wheel of Fortune」', loop: 100,
  fn({ w, s, p, k }) {
    const dir = (k / 100 | 0) % 2 ? -1 : 1, base = k * 0.03 * dir, x = s.x[p]!, y = s.y[p]!;
    if (k % 12 === 0) for (let i = 0; i < 4; i++) hB(w, s, p, x, y, base + i * TAU / 4, 2.8, { col: RBC[i * 2 % 7] });
    if (k % 4 === 0) for (let i = 0; i < 4; i++) sB(s, p, x, y, base + i * TAU / 4 + TAU / 8, 3.4, { sh: SH.rice, col: 0xfff3c0 });
  },
} satisfies SpellDef;
