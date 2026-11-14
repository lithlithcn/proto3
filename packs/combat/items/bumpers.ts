import { type World, hypot } from '@kernel';
import { addEnt } from '../ents';
import { spRand } from '../bullets/pattern';
import { bodyR } from '../stats';
import { PS, type CombatState } from '../state';

/** Entity kind of a bumper (`er` radius, `evy` drift, `eh` hit flash, `ew` = holder; ownerless so it outlives a KO). */
export const EK_BUMP = 103;

/** Item `bumpers`: 5 bumpers for 7 s that launch foes (3 dmg) and bounce every bullet; they drift up and down. RNG order per bumper: x, y (retried up to 20x near fighters), direction. */
export function spawnBumpers(s: CombatState, p: number): void {
  for (let i = 0; i < 5; i++) {
    let x = 0, y = 0, n = 0;
    for (;;) {
      x = 150 + spRand(s) * (s.mapW - 300); y = 150 + spRand(s) * (s.mapH - 300);
      let near = false;
      for (let q = 0; q < s.n; q++) if (hypot(s.x[q]! - x, s.y[q]! - y) < 120) { near = true; break; }
      if (!(n++ < 20 && near)) break;
    }
    const e = addEnt(s, EK_BUMP, -1, 420, x, y);
    if (e >= 0) { s.ew[e] = p; s.er[e] = 26; s.evy[e] = (spRand(s) < 0.5 ? -1 : 1) * 0.7; }
  }
}
export function updateBumpers(w: World, s: CombatState): void {
  void w;
  for (let u = 0; u < s.nent; u++) {
    if (s.ek[u] !== EK_BUMP) continue;
    if (s.eh[u]! > 0) s.eh[u] = s.eh[u]! - 1;
    for (let q = 0; q < s.n; q++) {
      if (q === s.ew[u] || s.state[q] === PS.dead) continue;
      const dx = s.x[q]! - s.ex[u]!, dy = s.y[q]! - s.ey[u]!, d = hypot(dx, dy) || 1;
      if (d < s.er[u]! + bodyR(s, q) && s.uCD[q]! < s.gf) {
        s.uCD[q] = s.gf + 12; s.vx[q] = dx / d * 15; s.vy[q] = dy / d * 15; s.hp[q] = s.hp[q]! - 3; s.eh[u] = 10;
        if (s.state[q] !== PS.spell) { s.state[q] = PS.hitstun; s.t[q] = 14; s.run[q] = 0; s.slide[q] = 0; s.charging[q] = 0; }
      }
    }
    for (let b = 0; b < s.nb; b++) {
      const dx = s.bx[b]! - s.ex[u]!, dy = s.by[b]! - s.ey[u]!, d = hypot(dx, dy);
      if (d < s.er[u]! + s.br[b]! && d > 0) { const nx = dx / d, ny = dy / d, dt = s.bvx[b]! * nx + s.bvy[b]! * ny; if (dt < 0) { s.bvx[b] = s.bvx[b]! - 2 * dt * nx; s.bvy[b] = s.bvy[b]! - 2 * dt * ny; } }
    }
  }
}
/** After the step (legacy wrapper): bumpers drift vertically and turn at 120 px from the top/bottom. */
export function driftBumpers(s: CombatState): void {
  for (let u = 0; u < s.nent; u++) if (s.ek[u] === EK_BUMP && s.evy[u]) { s.ey[u] = s.ey[u]! + s.evy[u]!; if (s.ey[u]! < 120 || s.ey[u]! > s.mapH - 120) s.evy[u] = -s.evy[u]!; }
}
