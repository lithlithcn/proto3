import { type PCtx, PS } from '@pack/combat/api';
import type { TouhouState } from '../../state';

/** Blazing Star: the dash is 1.7x faster and 1.5x longer; afterwards she brakes for 25 frames. */
export function marisaDash(c: PCtx, base: (c: PCtx) => void): void {
  base(c);
  const { s, p } = c;
  if (s.state[p] !== PS.dash) return;
  s.vx[p] = s.vx[p]! * 1.7; s.vy[p] = s.vy[p]! * 1.7; s.t[p] = Math.round(s.t[p]! * 1.5);
  c.w.slice<TouhouState>('touhou').mBS[p] = s.gf + s.t[p]!;
}
