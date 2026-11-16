import { cos, sin } from '@kernel';
import { type SpellDef, fireRay, nearFoe, sfx } from '@pack/combat/api';

/** Wind God「Illusionary Dominance」: every 14 frames a long ray crosses the foe's position from a spinning direction (7 f warning). */
export const ayaSpell: SpellDef = {
  name: 'Wind God「Illusionary Dominance」', loop: 200,
  fn({ w, s, p, k }) {
    if (k % 14) return;
    const q = nearFoe(s, p, s.x[p]!, s.y[p]!); if (q < 0) return;
    const a = k * 0.9;
    fireRay(s, p, { T: 10, tele: 7, flags: 0, w: 12, len: 1200, dmg: 5, ev: 99, kb: 8, stun: 20, c: 0xff6060, a, x: s.x[q]! - cos(a) * 600, y: s.y[q]! - sin(a) * 600 }); sfx(w, 'roll', 0.6);
  },
};
