import { SH, hB, sB, tgA, type SpellDef } from '@pack/combat/api';
import { TAU } from './palette';

/** Magic Sign「Starlight Rain」: alternating rings of giant stars + an aimed trio. */
export default {
  name: 'Magic Sign「Starlight Rain」', loop: 40,
  fn({ w, s, p, k }) {
    const x = s.x[p]!, y = s.y[p]!;
    if (k % 20 === 0) for (let i = 0; i < 8; i++) hB(w, s, p, x, y, i * TAU / 8 + (k % 40 ? TAU / 16 : 0), 2.8, { col: k % 40 ? 0xffe83a : 0x5ab0ff });
    if (k % 20 === 10) for (let i = 0; i < 16; i++) sB(s, p, x, y, i * TAU / 16 + k * 0.03, 3.2, { sh: SH.star, r: 3.5, col: 0xfff7b0 });
    if (k % 40 === 30) { const a = tgA(s, p, x, y); for (let i = -1; i <= 1; i++) hB(w, s, p, x, y, a + i * 0.2, 4.2, { col: 0xff7ce0 }); }
  },
} satisfies SpellDef;
