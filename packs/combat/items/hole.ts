import { type World, hypot } from '@kernel';
import { addEnt } from '../ents';
import { hit } from '../player/hit';
import { ISRC } from '../moves';
import { BF, PS, type CombatState } from '../state';

/** Entity kind of the Black Hole (`ew` = absorbed mass, `er` = current radius, `ea` = holder; ownerless like every item entity so it outlives a KO). */
export const EK_HOLE = 102;
const HOLE = { dmg: 4, kb: 8, stun: 18 };

export const spawnHole = (s: CombatState, p: number, x: number, y: number): void => { const e = addEnt(s, EK_HOLE, -1, 360, x, y); if (e >= 0) s.ea[e] = p; };

/** Item `gap`: pulls every fighter and bullet on the map (not the holder's), grows with what it swallows, hurts at its centre. */
export function updateHoles(w: World, s: CombatState): void {
  for (let i = 0; i < s.nent; i++) {
    if (s.ek[i] !== EK_HOLE) continue;
    const o = s.ea[i]!, hr = 26 + Math.min(60, Math.sqrt(s.ew[i]!) * 3.5), G = Math.min(1.8, 1 + s.ew[i]! * 0.01);
    s.er[i] = hr;
    for (let q = 0; q < s.n; q++) {
      if (q === o || s.state[q] === PS.dead) continue;
      const dx = s.ex[i]! - s.x[q]!, dy = s.ey[i]! - s.y[q]!, d = hypot(dx, dy) || 1, f = 0.12 * G / (1 + d / 300);
      s.vx[q] = s.vx[q]! + dx / d * f; s.vy[q] = s.vy[q]! + dy / d * f;
      if (d < hr + 6 && s.hCD[q]! < s.gf && s.inv[q]! <= 0) { s.hCD[q] = s.gf + 35; hit(w, s, q, o, -dx, -dy, HOLE, ISRC.hole, 1, false); }
    }
    for (let b = 0; b < s.nb; b++) {
      if (s.bowner[b] === o || (s.bflags[b]! & BF.frozen)) continue;
      const dx = s.ex[i]! - s.bx[b]!, dy = s.ey[i]! - s.by[b]!, d = hypot(dx, dy) || 1, f = 0.12 * G / (1 + d / 500);
      s.bvx[b] = s.bvx[b]! + dx / d * f; s.bvy[b] = s.bvy[b]! + dy / d * f;
      if (d < hr * 0.8) { s.bflags[b] = s.bflags[b]! | BF.dead; s.ew[i] = s.ew[i]! + (s.bflags[b]! & BF.heavy ? 4 : 1); }
    }
  }
}
