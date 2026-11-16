import { type PCtx, PS, sfx } from '@pack/combat/api';
import type { TouhouState } from '../../state';

/** Dashing opens a 12-frame gust around her that pushes foreign bullets sideways (applied in tick.ts). */
export function ayaDash(c: PCtx, base: (c: PCtx) => void): void {
  base(c);
  if (c.s.state[c.p] === PS.dash) { c.w.slice<TouhouState>('touhou').aG[c.p] = c.s.gf + 12; sfx(c.w, 'windblow', 0.4); }
}
