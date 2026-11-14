import { atan2, cos, hypot, sin } from '@kernel';
import { BF, type CombatState } from '../state';

/** Mirror Aura bounce (legacy mirrorRef): the bullet flies back at its shooter 10 % faster and now belongs to the mirror's owner. */
export function mirrorRef(s: CombatState, i: number, t: number): void {
  const o = s.bowner[i]!, a = atan2(s.y[o]! - s.by[i]!, s.x[o]! - s.bx[i]!), sp = hypot(s.bvx[i]!, s.bvy[i]!) * 1.1;
  s.bvx[i] = cos(a) * sp; s.bvy[i] = sin(a) * sp; s.bowner[i] = t; s.bflags[i] = s.bflags[i]! & ~BF.grazed;
  if (s.bflags[i]! & BF.heavy) s.bdist[i] = s.barm[i]!; else s.bcol[i] = 0xe0e6f0;
}
