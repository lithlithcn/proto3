import { type World } from '@kernel';
import { kP } from '../stats';
import { T } from '../tuning';
import { PS, type CombatState } from '../state';

/** Wall contact (legacy `wall`). ax: 0 = x axis, 1 = y axis. TODO(next batch): hitstun bounce/tech/street-smash branch. */
function wall(w: World, s: CombatState, p: number, ax: number): void {
  const v = ax ? s.vy : s.vx;
  if (s.state[p] === PS.dash) { // wall kick: one per dash, bounce with momentum, half charge back
    if (s.kicked[p]) { v[p] = 0; return; }
    v[p] = v[p]! * -1.15; s.kicked[p] = 1; s.noSteer[p] = 8; s.t[p] = Math.max(s.t[p]!, 6);
    s.boost[p] = Math.min(T.DASH_CHARGES, s.boost[p]! + 0.5);
    w.emit('combat:wall-kick', { p, x: s.x[p]!, y: s.y[p]! });
    return;
  }
  if (s.slide[p]! > 0) { v[p] = v[p]! * -0.8; return; } // glide bounces
  v[p] = 0;
}

/** Position integration and arena bounds (legacy `physics`). */
export function physics(w: World, s: CombatState, p: number): void {
  if (s.state[p] === PS.dead) return;
  const k = kP(s), R = T.BODY_R;
  s.x[p] = s.x[p]! + s.vx[p]! * k; s.y[p] = s.y[p]! + s.vy[p]! * k;
  if (s.x[p]! < R) { s.x[p] = R; wall(w, s, p, 0); } else if (s.x[p]! > s.mapW - R) { s.x[p] = s.mapW - R; wall(w, s, p, 0); }
  if (s.state[p] === PS.dead) return;
  if (s.y[p]! < R) { s.y[p] = R; wall(w, s, p, 1); } else if (s.y[p]! > s.mapH - R) { s.y[p] = s.mapH - R; wall(w, s, p, 1); }
}
