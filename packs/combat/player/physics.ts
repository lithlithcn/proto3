import { burst, jfx } from '../jfx';
import { type World, hypot } from '@kernel';
import { kP } from '../stats';
import { T } from '../tuning';
import { PS, type CombatState } from '../state';
import { ko } from './ko';
import { wallRule } from '../rules';

/** Wall contact (legacy `wall`). ax: 0 = x axis, 1 = y axis. Items that add walls (Meiling's gate) call it as `wallHit`. */
export function wallHit(w: World, s: CombatState, p: number, ax: number): void { wall(w, s, p, ax); }
function wall(w: World, s: CombatState, p: number, ax: number): void {
  if (wallRule(w, s, p, ax)) return; // legacy xSpitWall (spit 1/3) and spinning items, before the beam push
  if (s.spit[p] === 2) { // pushed to the edge by a parried KO beam: costs a wall pip, then free
    if (s.beamPip[p]) { s.beamPip[p] = 0; s.pips[p] = Math.max(0, s.pips[p]! - 1); w.emit('combat:wall-pip', { p, pips: s.pips[p]! }); }
    s.spit[p] = 0; s.state[p] = PS.idle; s.t[p] = 0; if (ax) s.vy[p] = 0; else s.vx[p] = 0;
    w.emit('combat:wall-push', { p, x: s.x[p]!, y: s.y[p]! }); return;
  }
  const v = ax ? s.vy : s.vx;
  if (s.state[p] === PS.dash) { // wall kick: one per dash, bounce with momentum, half charge back
    if (s.kicked[p]) { v[p] = 0; return; }
    v[p] = v[p]! * -1.15; s.kicked[p] = 1; s.noSteer[p] = 8; s.t[p] = Math.max(s.t[p]!, 6);
    s.boost[p] = Math.min(T.DASH_CHARGES, s.boost[p]! + 0.5);
    w.emit('combat:wall-kick', { p, x: s.x[p]!, y: s.y[p]! });
    return;
  }
  if (s.slide[p]! > 0) { v[p] = v[p]! * -0.8; return; } // glide bounces
  if (s.state[p] === PS.hitstun && hypot(s.vx[p]!, s.vy[p]!) > T.WALL_MIN) {
    if (s.techBuf[p]! > 0) { // tech: dash/parry pressed just before the impact → recover standing, brief invulnerability
      s.vx[p] = 0; s.vy[p] = 0; s.state[p] = PS.idle; s.combo[p] = 0; s.inv[p] = 14; s.techBuf[p] = 0;
      w.emit('combat:tech', { p, x: s.x[p]!, y: s.y[p]! });
      return;
    }
    if (s.pips[p]! <= 0) { ko(w, s, p, 'STREET SMASH!'); return; } // no wall pips left: the wall kills
    if (s.bounceN[p]! > 0) { s.bounceN[p] = s.bounceN[p]! - 1; v[p] = v[p]! * -0.85; w.emit('combat:wall-bounce', { p, x: s.x[p]!, y: s.y[p]!, big: 1 }); return; } // overpowered launch: bounces
    v[p] = v[p]! * -0.5; s.t[p] = s.t[p]! + 6;
    w.emit('combat:wall-bounce', { p, x: s.x[p]!, y: s.y[p]!, big: 0 });
    return;
  }
  v[p] = 0;
}

/** Position integration and arena bounds (legacy `physics`). */
export function physics(w: World, s: CombatState, p: number): void {
  if (s.state[p] === PS.dead) return;
  const k = kP(s), R = T.BODY_R;
  s.x[p] = s.x[p]! + s.vx[p]! * k; s.y[p] = s.y[p]! + s.vy[p]! * k;
  if (s.warp > 0) { // Warp item: leave one side, come back on the other; no walls, no red zone
    const ox = s.x[p]!, oy = s.y[p]!;
    if (s.x[p]! < 0) s.x[p] = s.x[p]! + s.mapW; else if (s.x[p]! > s.mapW) s.x[p] = s.x[p]! - s.mapW;
    if (s.y[p]! < 0) s.y[p] = s.y[p]! + s.mapH; else if (s.y[p]! > s.mapH) s.y[p] = s.y[p]! - s.mapH;
    if (ox !== s.x[p] || oy !== s.y[p]) { burst(w, ox, oy, '#b45cff', 10); burst(w, s.x[p]!, s.y[p]!, '#b45cff', 10); jfx(w, 'camsnap', p); }
  } else {
    if (s.x[p]! < R) { s.x[p] = R; wall(w, s, p, 0); } else if (s.x[p]! > s.mapW - R) { s.x[p] = s.mapW - R; wall(w, s, p, 0); }
    if (s.state[p] === PS.dead) return;
    if (s.y[p]! < R) { s.y[p] = R; wall(w, s, p, 1); } else if (s.y[p]! > s.mapH - R) { s.y[p] = s.mapH - R; wall(w, s, p, 1); }
  }
  // presentation (legacy lines 494-495): dash afterimages, ejection trail
  if (s.state[p] === PS.dash) jfx(w, 'trail', s.x[p]!, s.y[p]!, p);
  if (s.state[p] === PS.hitstun && s.vx[p]! * s.vx[p]! + s.vy[p]! * s.vy[p]! > 49 && s.gf % 2) jfx(w, 'trail', s.x[p]!, s.y[p]!, -1);
}
