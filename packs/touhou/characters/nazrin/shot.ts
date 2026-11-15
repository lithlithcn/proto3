import { type ShotCtx, lightBullet } from '@pack/combat/api';
import type { TouhouState } from '../../state';

/** Nazrin's light shot: 2 mice (4 after Double Mice) that home weakly, then burrow after 34 frames and stay as sentinels (`bnsf`, see tick.ts). */
export function nazrinShot(c: ShotCtx): void {
  const { s, p } = c, n = c.w.slice<TouhouState>('touhou').nDbl[p]! > s.gf ? 4 : 2;
  for (let i = 0; i < n; i++) {
    const b = lightBullet(s, p, c.a + (i / (n - 1) - 0.5) * 0.5, 5.5, c.pm * (0.6 + 0.08 * c.lv), 5, 60, 0x9a9aa8);
    if (b >= 0) { s.bhome[b] = 0.03; s.bnsf[b] = s.gf + 34; }
  }
}
