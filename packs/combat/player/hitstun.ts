import { type World, clamp, cos, hypot, sin } from '@kernel';
import type { PCtx } from '../input';
import { T } from '../tuning';
import { PS, type CombatState } from '../state';
import { ko } from './ko';

/** Hit-stun tick (legacy case 'hitstun'): launch velocity decays, then back to idle with the combo reset. */
export function updHitstun(c: PCtx): void {
  const { s, p } = c;
  if (!s.spit[p]) { s.vx[p] = s.vx[p]! * 0.93; s.vy[p] = s.vy[p]! * 0.93; } else { s.t[p] = Math.max(s.t[p]!, 2); s.inv[p] = Math.max(s.inv[p]!, 2); } // thrown to the wall: no decay, can't be hit
  s.t[p] = s.t[p]! - 1;
  if (s.t[p]! <= 0) { s.state[p] = PS.idle; s.combo[p] = 0; }
}

/** End of hit-stop: apply the pending knockback bent by the victim's DI (stick perpendicular to the launch), then the deferred KO. */
function resolveHit(w: World, s: CombatState, p: number): void {
  if (!s.diPend[p]) return;
  s.diPend[p] = 0;
  let x = s.kbx[p]!, y = s.kby[p]!;
  const sp = hypot(x, y), ix = w.x(p) / 127, iy = w.y(p) / 127, il = hypot(ix, iy);
  if (il > 0.3 && sp > 0) {
    const a = T.DI_MAX * (x * iy - y * ix) / (sp * il), c = cos(a), sn = sin(a);
    const nx = x * c - y * sn; y = x * sn + y * c; x = nx;
  }
  s.vx[p] = x; s.vy[p] = y;
  if (s.koPend[p]) { s.koPend[p] = 0; ko(w, s, p); }
}

/** Frozen frame (legacy step hit-stop branch): victims may nudge themselves (SDI); at the end of the freeze every pending hit resolves. */
export function holdFrame(w: World, s: CombatState): void {
  s.hitstop = Math.max(0, s.hitstop - 1 - (10 - s.tempo) * 0.15);
  const R = T.BODY_R;
  for (let p = 0; p < s.n; p++) if (s.diPend[p]) {
    s.x[p] = clamp(s.x[p]! + w.x(p) / 127 * T.SDI, R, s.mapW - R); s.y[p] = clamp(s.y[p]! + w.y(p) / 127 * T.SDI, R, s.mapH - R);
  }
  if (s.hitstop <= 0) for (let p = 0; p < s.n; p++) resolveHit(w, s, p);
}
