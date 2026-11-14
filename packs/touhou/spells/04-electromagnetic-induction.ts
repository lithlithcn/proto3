import { hB, sB, spRand, type SpellDef } from '@pack/combat/api';
import { TAU } from './palette';

/** Thunder Sign「Electromagnetic Induction」: coiling spirals (curve = per-frame rotation of the velocity). */
export default {
  name: 'Thunder Sign「Electromagnetic Induction」', loop: 48,
  fn({ w, s, p, k }) {
    const x = s.x[p]!, y = s.y[p]!;
    if (k % 24 === 0) {
      const wv = k / 24 | 0, dir = wv % 2 ? -1 : 1;
      for (let i = 0; i < 5; i++) hB(w, s, p, x, y, i * TAU / 5 + wv * 0.35, 2.3, { rot: dir * 0.011, col: dir > 0 ? 0x5ab0ff : 0xa07cff, life: 400 });
      if (wv % 2 === 0) spRand(s); // legacy picks a thunder sound here; the draw is kept so the stream stays aligned
    }
    if (k % 6 === 3) for (let i = 0; i < 5; i++) sB(s, p, x, y, i * TAU / 5 + k * 0.02 + TAU / 10, 2, { rot: 0.008, col: 0xcfe0ff, life: 300 });
  },
} satisfies SpellDef;
