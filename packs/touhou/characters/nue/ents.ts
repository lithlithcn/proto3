import { type World, cos, hypot, sin } from '@kernel';
import { PS, chHitQ, foe, type CombatState, pushJ, jFlash } from '@pack/combat/api';
import { EK_NCL, EK_NST } from './kinds';

/** Nue's entities handled in the main entity pass (legacy EST.ncl / nst); the UFO runs after it (ufo.ts). Dispatched by kind, so they keep working while Nue wears another kit. */
export function nueEnts(w: World, s: CombatState, p: number): void {
  for (let i = s.eLo; i < s.eHi; i++) {
    if (s.eo[i] !== p) continue;
    const k = s.ek[i]!;
    if (k === EK_NCL && s.et[i]! > 0) { const a = s.gf * 0.04 + s.ebc[i]! * 0.8, r = 36 + s.ebc[i]! % 3 * 8; s.ex[i] = s.x[p]! + cos(a) * r; s.ey[i] = s.y[p]! + sin(a) * r; }
    else if (k === EK_NST && s.et[i]! > 0) { // storm trap: strikes the first foe within 70 px, once
      for (let q = 0; q < s.n; q++) if (q !== p && s.state[q] !== PS.dead && s.inv[q]! <= 0 && foe(s, p, q) && hypot(s.x[q]! - s.ex[i]!, s.y[q]! - s.ey[i]!) < 70) { chHitQ(w, s, p, q, 0, 1, s.ed[i]!, 4, 34); pushJ(w, 'LINES', 'x', s.ex[i]!, 'y', s.ey[i]! - 200, 'a', Math.PI / 2, 't', 12, 'T', 12, 'len', 220); jFlash(w, 0.15, '#c0c0ff'); s.et[i] = 0; break; }
    }
  }
}
