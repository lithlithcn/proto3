import { cos, sin } from '@kernel';
import { charOf } from '../api';
import type { PCtx } from '../input';
import { MV_NAMES, RECOIL, SRC, type MoveDef } from '../moves';
import { CLONE, cloneAim, clonePos } from '../items/clone';
import { powerMul } from '../stats';

/** Fire the current heavy move (legacy fireHeavy): the character spawns its bullets, then the shooter recoils. */
export function fireHeavy(c: PCtx, m: MoveDef): void {
  const { w, s, p } = c, dir = MV_NAMES[s.mvId[p]!]!.slice(-1) as 'N' | 'F' | 'B', ch = charOf(w, s, p);
  const src = SRC[MV_NAMES[s.mvId[p]!] as 'heavyN' | 'heavyF' | 'heavyB'], k = powerMul(s, p, 0.12);
  ch.heavy?.[dir]?.({ w, s, p, m, src, a: s.aim[p]!, k });
  if (s.clone[p]! > 0) { // the Doppelganger repeats the heavy from its mirrored spot at 70 % (legacy cloneOf): the shooter is moved there for the call
    const [x, y] = clonePos(s, p), ox = s.x[p]!, oy = s.y[p]!, oa = s.aim[p]!, a = cloneAim(s, p);
    s.x[p] = x; s.y[p] = y; s.aim[p] = a;
    ch.heavy?.[dir]?.({ w, s, p, m, src, a, k: k * CLONE.shotMul });
    s.x[p] = ox; s.y[p] = oy; s.aim[p] = oa;
  }
  const r = RECOIL[dir];
  s.vx[p] = s.vx[p]! - cos(s.aim[p]!) * r; s.vy[p] = s.vy[p]! - sin(s.aim[p]!) * r;
  w.emit('combat:heavy', { p, dir });
}
