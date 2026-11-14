import { type ShotCtx, lightBullet } from '@pack/combat/api';

/** Marisa's light shot: a fan of 2-5 stars (by power) that hang back, then accelerate (`bmst`, see combat/rays.ts bulletMods). Total damage 1.7 x power multiplier. */
export function marisaShot(c: ShotCtx): void {
  const n = 2 + Math.min(3, c.lv);
  for (let i = 0; i < n; i++) {
    const b = lightBullet(c.s, c.p, c.a + (i / (n - 1) - 0.5) * 0.7, 7, c.pm * 1.7 / n, 6, 90, i % 2 ? 0x7cff7a : 0xffe14a);
    if (b >= 0) c.s.bmst[b] = c.s.gf;
  }
}
