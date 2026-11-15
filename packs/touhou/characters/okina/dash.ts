import { hypot } from '@kernel';
import { type PCtx, PS, entsOf, pushJ } from '@pack/combat/api';
import { EK_ODR } from './kinds';

/** Dashing toward a door (within ~78 degrees of the dash, at least 40 px away) teleports her to it, keeps 30 % of the speed and gives 8 frames of invincibility. */
export function okinaDash(c: PCtx, base: (c: PCtx) => void): void {
  base(c);
  const { s, p } = c; if (s.state[p] !== PS.dash) return;
  const D: number[] = []; if (!entsOf(s, EK_ODR, p, D)) return;
  const v = hypot(s.vx[p]!, s.vy[p]!) || 1; let best = -1, bd = 0.2;
  for (const d of D) { const dx = s.ex[d]! - s.x[p]!, dy = s.ey[d]! - s.y[p]!, l = hypot(dx, dy); if (l < 40) continue; const k = (dx * s.vx[p]! + dy * s.vy[p]!) / (l * v); if (k > bd) { bd = k; best = d; } }
  if (best >= 0) { pushJ(c.w, 'RINGS', 'x', s.x[p]!, 'y', s.y[p]!, 'r', 0, 'm', 36, 't', 12, 'c', '#ffd23a'); s.x[p] = s.ex[best]!; s.y[p] = s.ey[best]!; s.vx[p] = s.vx[p]! * 0.3; s.vy[p] = s.vy[p]! * 0.3; s.inv[p] = Math.max(s.inv[p]!, 8); pushJ(c.w, 'RINGS', 'x', s.x[p]!, 'y', s.y[p]!, 'r', 0, 'm', 36, 't', 12, 'c', '#fff'); }
}
