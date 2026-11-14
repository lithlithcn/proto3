import { SH, hB, sB, spRand, type SpellDef } from '@pack/combat/api';
import { TAU } from './palette';

/** Ice Sign「Crystal Rain」: hail of crystals above the target. */
export default {
  name: 'Ice Sign「Crystal Rain」', loop: 40,
  fn({ w, s, p, o, k }) {
    const t = o >= 0 ? o : p, tx = s.x[t]!, ty = s.y[t]!;
    if (k % 7 === 0) { const x = tx + (spRand(s) * 2 - 1) * 560, a = Math.PI / 2 + (spRand(s) - 0.5) * 0.2; hB(w, s, p, x, Math.max(14, ty - 470), a, 1.2, { col: 0xbfe9ff, acc: 0.06, vmax: 5, life: 300 }); }
    if (k % 3 === 0) { const x = tx + (spRand(s) * 2 - 1) * 600; sB(s, p, x, Math.max(4, ty - 480), Math.PI / 2, 1.5, { sh: SH.kunai, col: 0xe8f8ff, acc: 0.08, vmax: 6.5, life: 260 }); }
    if (k % 40 === 0) for (let i = 0; i < 24; i++) sB(s, p, s.x[p]!, s.y[p]!, i * TAU / 24 + k * 0.05, 2.2, { col: 0x7fd8ff });
  },
} satisfies SpellDef;
