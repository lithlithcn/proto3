import { BK, hB, sB, spRand, type SpellDef } from '@pack/combat/api';
import { RBC, TAU } from './palette';

/** Orbit Sign「Kepler's Rings」: rings of giant danmaku orbit the caster, then fly off along the tangent (behaviour BK.orbit). */
export default {
  name: "Orbit Sign「Kepler's Rings」", loop: 60,
  fn({ w, s, p, k }) {
    const x = s.x[p]!, y = s.y[p]!;
    if (k % 60 === 0) for (let r = 0; r < 3; r++) {
      const dir = r % 2 ? -1 : 1, a0 = spRand(s) * TAU;
      for (let i = 0; i < 8; i++) hB(w, s, p, x, y, 0, 0, { col: RBC[(r * 2 + 4) % 7], life: 480, kind: BK.orbit, p0: a0 + i * TAU / 8, p1: dir, p2: r });
    }
    if (k % 30 === 15) for (let i = 0; i < 12; i++) sB(s, p, x, y, i * TAU / 12 + k, 1.6, { col: 0xe0f0ff });
  },
} satisfies SpellDef;
