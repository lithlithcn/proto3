import { cos, sin } from '@kernel';
import { charOf } from '../api';
import type { PCtx } from '../input';
import { MV_NAMES, RECOIL, SRC, type MoveDef } from '../moves';
import { powerMul } from '../stats';

/** Fire the current heavy move (legacy fireHeavy): the character spawns its bullets, then the shooter recoils. */
export function fireHeavy(c: PCtx, m: MoveDef): void {
  const { w, s, p } = c, dir = MV_NAMES[s.mvId[p]!]!.slice(-1) as 'N' | 'F' | 'B', ch = charOf(w, s, p);
  ch.heavy?.[dir]?.({ w, s, p, m, src: SRC[MV_NAMES[s.mvId[p]!] as 'heavyN' | 'heavyF' | 'heavyB'], a: s.aim[p]!, k: powerMul(s, p, 0.12) });
  const r = RECOIL[dir];
  s.vx[p] = s.vx[p]! - cos(s.aim[p]!) * r; s.vy[p] = s.vy[p]! - sin(s.aim[p]!) * r;
  w.emit('combat:heavy', { p, dir });
}
