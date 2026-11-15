import { type ShotCtx, lightBullet } from '@pack/combat/api';

/** Aya's light shot: three fast leaf bullets in a narrow fan, each wobbling out of phase. */
export function ayaShot(c: ShotCtx): void {
  const { s, p } = c;
  for (let i = 0; i < 3; i++) {
    const b = lightBullet(s, p, c.a + (i - 1) * 0.12, 8, c.pm * (0.45 + 0.05 * c.lv), 5, 90, 0x5cc04a);
    if (b >= 0) { s.bwav[b] = 0.3; s.bph[b] = i * 2.1; }
  }
}
