import { hypot } from '@kernel';
import { type PCtx, T, PS } from '@pack/combat/api';
import type { TouhouState } from '../../state';

/** Reimu's dash is a 150 px teleport along the stick (legacy dash wrapper): own 21-frame cooldown, short dash afterwards, brief invulnerability. */
export function reimuDash(c: PCtx, base: (c: PCtx) => void): void {
  const { w, s, p } = c, ts = w.slice<TouhouState>('touhou');
  if (s.gf - ts.reimuDashAt[p]! < 21) return;
  base(c);
  if (s.state[p] !== PS.dash) return;
  ts.reimuDashAt[p] = s.gf;
  const v = hypot(s.vx[p]!, s.vy[p]!) || 1, ux = s.vx[p]! / v, uy = s.vy[p]! / v, R = T.BODY_R;
  s.x[p] = Math.max(R, Math.min(s.mapW - R, s.x[p]! + ux * 150)); s.y[p] = Math.max(R, Math.min(s.mapH - R, s.y[p]! + uy * 150));
  s.vx[p] = ux * 1.5; s.vy[p] = uy * 1.5; s.t[p] = Math.min(s.t[p]!, 7); s.inv[p] = Math.max(s.inv[p]!, 8);
  w.emit('touhou:reimu-teleport', { p, x: s.x[p]!, y: s.y[p]! });
}

