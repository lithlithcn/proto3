import { type World, cos, sin } from '@kernel';
import { BF, type CombatState, addEnt, entsOf, nearFoe, spRand } from '@pack/combat/api';
import type { TouhouState } from '../../state';
import { EK_NCOIN, EK_NMS } from './kinds';

/** Mice that finished their flight burrow in as sentinels (max 6, oldest go first); a finished dig rolls its bonus. */
export function nazrinTick(w: World, s: CombatState, p: number): void {
  const t = w.slice<TouhouState>('touhou');
  for (let b = 0; b < s.nb; b++) {
    if (!s.bnsf[b] || s.bowner[b] !== p || (s.bflags[b]! & BF.dead) || s.gf < s.bnsf[b]!) continue;
    s.bflags[b] = s.bflags[b]! | BF.dead;
    const e = addEnt(s, EK_NMS, p, 900, s.bx[b]!, s.by[b]!); if (e >= 0) s.ebc[e] = s.gf % 7;
    const L: number[] = []; entsOf(s, EK_NMS, p, L); for (let i = 0; i < L.length - 6; i++) s.et[L[i]!] = 0;
  }
  if (t.nDig[p] && t.nDig[p]! <= s.gf) {
    t.nDig[p] = 0; const r = spRand(s) * 4 | 0;
    if (r === 0) t.nSpd[p] = s.gf + 300; else if (r === 1) t.nSh[p] = 1; else if (r === 2) t.nDbl[p] = s.gf + 480;
    else {
      const q = nearFoe(s, p, s.x[p]!, s.y[p]!), e = addEnt(s, EK_NCOIN, p, 36, s.x[p]!, s.y[p]!);
      if (e >= 0) { s.ebc[e] = 36; s.er[e] = s.x[p]!; s.eh[e] = s.y[p]!; s.ea[e] = q >= 0 ? s.x[q]! : s.x[p]! + cos(s.aim[p]!) * 200; s.ew[e] = q >= 0 ? s.y[q]! : s.y[p]! + sin(s.aim[p]!) * 200; }
    }
  }
}
