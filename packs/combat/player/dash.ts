import { atan2, clamp, cos, hypot, sin, PI } from '@kernel';
import { TAU } from '../tuning';
import { T } from '../tuning';
import { PS } from '../state';
import { type PCtx, held, pr } from '../input';
import { BTN } from '@kernel';

/** Glide (legacy `glide`, a.k.a. wavedash): stick direction, else current momentum, else away from the foe. */
export function glide(c: PCtx): void {
  const { s, p } = c, l = hypot(c.ix, c.iy), cs = hypot(s.vx[p]!, s.vy[p]!), sp = Math.max(cs, T.DASH_V * 0.85);
  let x: number, y: number;
  if (l > 0.3) { x = c.ix / l; y = c.iy / l; }
  else if (cs > 1) { x = s.vx[p]! / cs; y = s.vy[p]! / cs; }
  else { x = -cos(s.aim[p]!); y = -sin(s.aim[p]!); }
  s.state[p] = PS.idle; s.slide[p] = T.SLIDE_T; s.run[p] = 0; s.vx[p] = x * sp; s.vy[p] = y * sp;
  c.w.emit('combat:glide', { p, x: s.x[p]!, y: s.y[p]!, dx: x, dy: y });
}

/** Dash start (legacy `dash`, default behaviour; characters may replace it, e.g. Reimu teleports). */
export function startDash(c: PCtx): void {
  const { s, p } = c;
  let x = c.ix, y = c.iy;
  if (hypot(x, y) < 0.3) { x = -cos(s.aim[p]!); y = -sin(s.aim[p]!); }
  const l = hypot(x, y), v = T.DASH_V;
  s.state[p] = PS.dash; s.t[p] = T.DASH_T; s.vx[p] = x / l * v; s.vy[p] = y / l * v;
  s.slide[p] = 0; s.run[p] = 0; s.kicked[p] = 0; s.noSteer[p] = 0; s.dashCd[p] = T.DASH_REGEN_DELAY;
  s.boost[p] = s.boost[p]! - T.DASH_COST;
  c.w.emit('combat:dash', { p, x: s.x[p]!, y: s.y[p]! });
}

/** Dash state tick (legacy case 'dash'): steerable curve, glide cancel, then run (button held) or lag. */
export function updDash(c: PCtx): void {
  const { s, p } = c;
  if (s.noSteer[p]! > 0) s.noSteer[p] = s.noSteer[p]! - 1;
  else if (hypot(c.ix, c.iy) > 0.3) {
    const sp = hypot(s.vx[p]!, s.vy[p]!), a = atan2(s.vy[p]!, s.vx[p]!);
    const da = ((atan2(c.iy, c.ix) - a) % TAU + TAU * 1.5) % TAU - PI, na = a + clamp(da, -0.12, 0.12);
    s.vx[p] = cos(na) * sp; s.vy[p] = sin(na) * sp;
  }
  if (pr(c, BTN.focus)) { glide(c); return; }
  // TODO(next batch): pr(melee) → dash attack
  s.t[p] = s.t[p]! - 1;
  if (s.t[p]! <= 0) {
    if (held(c, BTN.dash)) { s.state[p] = PS.idle; s.run[p] = 1; s.vx[p] = s.vx[p]! * 0.6; s.vy[p] = s.vy[p]! * 0.6; }
    else { s.state[p] = PS.dashlag; s.t[p] = T.DASH_LAG; s.vx[p] = s.vx[p]! * 0.5; s.vy[p] = s.vy[p]! * 0.5; }
  }
}

/** Dash recovery (legacy case 'dashlag'). */
export function updDashLag(c: PCtx): void {
  const { s, p } = c;
  if (pr(c, BTN.focus)) { glide(c); return; }
  s.vx[p] = s.vx[p]! * 0.88; s.vy[p] = s.vy[p]! * 0.88;
  s.t[p] = s.t[p]! - 1;
  if (s.t[p]! <= 0) s.state[p] = PS.idle;
}
