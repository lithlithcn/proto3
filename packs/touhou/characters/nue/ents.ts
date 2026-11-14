import { type World, atan2, cos, hypot, sin } from '@kernel';
import { BF, PS, chHitQ, customHeavy, foe, nearFoe, type CombatState } from '@pack/combat/api';
import { EK_NCL, EK_NST, EK_NUFO } from './kinds';

/** Nue's entities (legacy EST.ncl / nst and the UFO wrapper), run after every character tick. Also run by the disguise system while Nue wears another kit (her clouds and UFOs keep working). */
export function nueEnts(w: World, s: CombatState, p: number): void {
  for (let i = 0; i < s.nent; i++) {
    if (s.eo[i] !== p) continue;
    const k = s.ek[i]!;
    if (k === EK_NCL && s.et[i]! > 0) { const a = s.gf * 0.04 + s.ebc[i]! * 0.8, r = 36 + s.ebc[i]! % 3 * 8; s.ex[i] = s.x[p]! + cos(a) * r; s.ey[i] = s.y[p]! + sin(a) * r; }
    else if (k === EK_NST && s.et[i]! > 0) { // storm trap: strikes the first foe within 70 px, once
      for (let q = 0; q < s.n; q++) if (q !== p && s.state[q] !== PS.dead && s.inv[q]! <= 0 && foe(s, p, q) && hypot(s.x[q]! - s.ex[i]!, s.y[q]! - s.ey[i]!) < 70) { chHitQ(w, s, p, q, 0, 1, s.ed[i]!, 4, 34); s.et[i] = 0; break; }
    } else if (k === EK_NUFO && s.et[i]! > 0) { // UFO turret: bobs, eats foreign light bullets (4 hp), fires a triple shot at the nearest foe every 40 frames
      s.ey[i] = s.ey[i]! + sin(s.gf * 0.05 + s.ex[i]!) * 0.4;
      for (let b = 0; b < s.nb; b++) {
        if ((s.bflags[b]! & (BF.dead | BF.heavy)) || s.bowner[b] === p || hypot(s.bx[b]! - s.ex[i]!, s.by[b]! - s.ey[i]!) >= 22) continue;
        s.bflags[b] = s.bflags[b]! | BF.dead; s.eh[i] = s.eh[i]! - 1; if (s.eh[i]! <= 0) s.et[i] = 0;
      }
      s.er[i] = s.er[i]! - 1;
      if (s.er[i]! <= 0) {
        const q = nearFoe(s, p, s.ex[i]!, s.ey[i]!); s.er[i] = 40;
        if (q >= 0 && hypot(s.x[q]! - s.ex[i]!, s.y[q]! - s.ey[i]!) < 700) { const a = atan2(s.y[q]! - s.ey[i]!, s.x[q]! - s.ex[i]!); for (const da of [-0.18, 0, 0.18]) customHeavy(s, p, s.ex[i]!, s.ey[i]!, a + da, 4.2, 7, { dmg: 3.5, kb: 5, stun: 16, arm: 0 }, 200, 0x9a6aff); }
      }
    }
  }
}
