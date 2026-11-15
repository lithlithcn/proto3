import { type World, hypot } from '@kernel';
import { BF, PS, bodyR, chHitQ, foe } from '@pack/combat/api';
import type { CombatState } from '@pack/combat/api';
import { EK_ANW, EK_ATN, EK_AWD } from './kinds';

/** Aya's entities (legacy EST.atn / anw / awd), run after every character tick. */
export function ayaEnts(w: World, s: CombatState, p: number): void {
  for (let i = s.eLo; i < s.eHi; i++) {
    if (s.eo[i] !== p || s.et[i]! <= 0) continue;
    const k = s.ek[i]!;
    if (k === EK_ATN) { // tornado: drifts, drags foes in, bites, erases foreign light bullets
      s.ex[i] = s.ex[i]! + s.evx[i]!; s.ey[i] = s.ey[i]! + s.evy[i]!;
      for (let q = 0; q < s.n; q++) {
        if (q === p || s.state[q] === PS.dead || s.inv[q]! > 0 || !foe(s, p, q)) continue;
        const dx = s.ex[i]! - s.x[q]!, dy = s.ey[i]! - s.y[q]!, d = hypot(dx, dy) || 1;
        if (d < 150) { s.vx[q] = s.vx[q]! + dx / d * 0.45; s.vy[q] = s.vy[q]! + dy / d * 0.45; }
        if (d < 34 + bodyR(s, q) && !(s.ehc[i * 32 + q]! > s.gf)) { s.ehc[i * 32 + q] = s.gf + 15; chHitQ(w, s, p, q, -dx / d, -dy / d, s.ed[i]!, 2, 16); }
      }
      for (let b = 0; b < s.nb; b++) if (!(s.bflags[b]! & (BF.dead | BF.heavy)) && s.bowner[b] !== p && hypot(s.bx[b]! - s.ex[i]!, s.by[b]! - s.ey[i]!) < 40) s.bflags[b] = s.bflags[b]! | BF.dead;
    } else if (k === EK_ANW) { const q = s.ebc[i]!; if (s.state[q] !== PS.dead) { s.ex[i] = s.ex[i]! + (s.x[q]! - s.ex[i]!) * 0.3; s.ey[i] = s.ey[i]! + (s.y[q]! - s.ey[i]!) * 0.3; } }
    else if (k === EK_AWD) { // tailwind (direction cached in er/eh)
      const c = s.er[i]!, n = s.eh[i]!;
      for (let q = 0; q < s.n; q++) if (s.state[q] !== PS.dead) { s.vx[q] = s.vx[q]! + c * 0.22; s.vy[q] = s.vy[q]! + n * 0.22; }
      for (let b = 0; b < s.nb; b++) if (!(s.bflags[b]! & (BF.dead | BF.heavy))) { s.bvx[b] = s.bvx[b]! + c * 0.03; s.bvy[b] = s.bvy[b]! + n * 0.03; }
    }
  }
}
