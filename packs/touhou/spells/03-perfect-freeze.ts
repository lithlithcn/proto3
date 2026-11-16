import { SH, hB, sB, spRand, tgA, type SpellDef, sfx } from '@pack/combat/api';
import { RBC, TAU } from './palette';

/** Frost Sign「Perfect Rainbow Freeze」: rainbow spray → freeze → shatter. Bullets of one 200-frame round share a group tag instead of the legacy JS list. */
export default {
  name: 'Frost Sign「Perfect Rainbow Freeze」', loop: 200,
  fn({ w, s, p, o, k }) {
    const t = k % 200, g = (k / 200 | 0) * 32 + p + 1, x = s.x[p]!, y = s.y[p]!, rnd = (): number => spRand(s);
    if (t < 60 && t % 3 === 0) { const a = rnd() * TAU, sp = 1.4 + rnd() * 2.8, c = RBC[rnd() * 7 | 0]; hB(w, s, p, x, y, a, sp, { col: c, life: 420, grp: g }); }
    if (t < 60 && t % 2 === 0) for (let i = 0; i < 2; i++) { const a = rnd() * TAU, sp = 1 + rnd() * 3.5, c = RBC[rnd() * 7 | 0]; sB(s, p, x, y, a, sp, { col: c, life: 420, grp: g }); }
    if (t === 80) sfx(w, 'get_freezed', 0.5);
    if (t === 140) sfx(w, 'icebreak', 0.5);
    if (t === 80) for (let i = 0; i < s.nb; i++) if (s.bgrp[i] === g && !(s.bflags[i]! & 2)) { s.bvx[i] = 0; s.bvy[i] = 0; s.bcol[i] = 0xeaf6ff; }
    if (t === 140) for (let i = 0; i < s.nb; i++) if (s.bgrp[i] === g && !(s.bflags[i]! & 2)) {
      const hv = (s.bflags[i]! & 1) !== 0;
      s.bang[i] = rnd() * TAU; s.bacc[i] = hv ? 0.04 : 0.05; s.bvmax[i] = hv ? 2.8 : 3.2; if (hv) s.bcol[i] = RBC[rnd() * 7 | 0]!;
    }
    if (t >= 95 && t < 135 && t % 8 === 0) { const a = tgA(s, p, x, y); for (let i = -2; i <= 2; i++) sB(s, p, x, y, a + i * 0.12, 4.2, { sh: SH.rice, col: 0x7fd8ff }); }
    void o;
  },
} satisfies SpellDef;
