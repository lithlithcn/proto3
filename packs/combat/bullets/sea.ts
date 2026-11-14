import { hypot } from '@kernel';
import type { CombatState } from '../state';
import { T } from '../tuning';

/** Season bullets (Okina): `bsea` = 1 spring (heals the shooter 0.35 hp), 3 autumn (shoves the victim along the bullet), 4 winter (victim slowed 45 frames). Applied just before the damage. */
export function seaHit(s: CombatState, i: number, victim: number, owner: number): void {
  const k = s.bsea[i]! - 1;
  if (k === 0) s.hp[owner] = Math.min(T.HP, s.hp[owner]! + 0.35);
  else if (k === 2) { const l = hypot(s.bvx[i]!, s.bvy[i]!) || 1; s.vx[victim] = s.vx[victim]! + s.bvx[i]! / l * 1.6; s.vy[victim] = s.vy[victim]! + s.bvy[i]! / l * 1.6; }
  else if (k === 3) s.slowT[victim] = Math.max(s.slowT[victim]!, s.gf + 45);
}
