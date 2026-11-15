import { type PCtx, PS, jTxt } from '@pack/combat/api';
import type { TouhouState } from '../../state';

/** Dash chain: dashing again within 45 frames of the last one is 20 % faster per link (up to x3). */
export function flandreDash(c: PCtx, base: (c: PCtx) => void): void {
  base(c);
  const { s, p } = c; if (s.state[p] !== PS.dash) return;
  const t = c.w.slice<TouhouState>('touhou'), ch = t.fLD[p] && s.gf - t.fLD[p]! < 45 ? Math.min(3, (t.fCh[p] || 1) + 1) : 1;
  t.fCh[p] = ch; t.fLD[p] = s.gf; s.vx[p] = s.vx[p]! * (1 + 0.2 * (ch - 1)); s.vy[p] = s.vy[p]! * (1 + 0.2 * (ch - 1)); if (ch > 1) jTxt(c.w, s.x[p]!, s.y[p]! - 30, 'x' + ch, '#ff7070', 12);
}
