import { cos, sin } from '@kernel';
import { MAX_B, type CombatState } from '../state';

/** Single spawn path for light bullets; enforces MAX_B (legacy `lb`). Returns the index or -1. Colour is 0xRRGGBB, 0 = owner colour. */
export function lightBullet(s: CombatState, owner: number, a: number, speed: number, dmg: number, r: number, life: number, col = 0): number {
  const i = s.nb;
  if (i >= MAX_B) return -1;
  const c = cos(a), sn = sin(a);
  s.bx[i] = s.x[owner]! + c * 18; s.by[i] = s.y[owner]! + sn * 18;
  s.bvx[i] = c * speed; s.bvy[i] = sn * speed;
  s.br[i] = r; s.bdmg[i] = dmg; s.blife[i] = life; s.bhome[i] = 0; s.bdist[i] = 0; s.bmult[i] = 1;
  s.bowner[i] = owner; s.bflags[i] = 0; s.bcol[i] = col;
  s.nb = i + 1;
  return i;
}
