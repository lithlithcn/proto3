import { type ShotCtx, lightBullet } from '@pack/combat/api';
import { FLC } from './kinds';

/** Flandre's light shot: a 7-colour shotgun fan (fast, 20-frame range). */
export function flandreShot(c: ShotCtx): void {
  for (let i = 0; i < 7; i++) lightBullet(c.s, c.p, c.a + (i - 3) * 0.09, 11, c.pm * (0.36 + 0.04 * c.lv), 4, 20, FLC[i]);
}
