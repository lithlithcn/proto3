import { atan2, clamp, cos, sin } from '@kernel';
import { MOVES, PS, SRC, BF, TAU, xB, type CombatState } from '@pack/combat/api';

/** Shared themed-item helpers (legacy hb / fb / ring / xR / xOnR, lines ~859-920). Colours are 0xRRGGBB. */
const RB = [0xff4a4a, 0xffa63a, 0xffe83a, 0x5cff7a, 0x4ab3ff, 0xc06cff];
/** Big fairy ball (legacy hb): heavyN hit data x0.6, arms like a normal heavy shot. */
export function hb(s: CombatState, x: number, y: number, a: number, sp: number, o: number, c = 0x66ccff): number {
  const i = xB(s, o, x, y, a, sp, { r: 12, life: 320, col: c }); if (i < 0) return i;
  const m = MOVES.heavyN; s.bflags[i] = BF.heavy; s.bdmg[i] = m.dmg; s.bkb[i] = m.kb; s.bstun[i] = m.stun; s.barm[i] = m.arm!; s.bdist[i] = 0; s.bmult[i] = 0.6; s.bmv[i] = SRC.heavyN;
  return i;
}
/** Small light bullet (legacy fb). */
export const fb = (s: CombatState, x: number, y: number, a: number, sp: number, o: number, c: number): number => xB(s, o, x, y, a, sp, { life: 150, col: c });
/** Ring of `n` light bullets (legacy ring); `c` 0 = rainbow. */
export function ring(s: CombatState, x: number, y: number, n: number, sp: number, c: number, o: number, life = 120, off = 0, rad = 0): void {
  for (let i = 0; i < n; i++) { const a = off + i * TAU / n; if (xB(s, o, x + cos(a) * rad, y + sin(a) * rad, a, sp, { life, col: c || RB[i % 6]! }) < 0) return; }
}
/** Screen-sized rectangle around the live players' centroid, clamped to the map (legacy xR): [x0, y0, x1, y1]. */
export function xR(s: CombatState, r: number[]): number[] {
  let cx = 0, cy = 0, n = 0; for (let q = 0; q < s.n; q++) if (s.state[q] !== PS.dead) { cx += s.x[q]!; cy += s.y[q]!; n++; }
  if (n) { cx /= n; cy /= n; } else { cx = s.mapW / 2; cy = s.mapH / 2; }
  const hw = Math.min(s.mapW / 2 - 20, 600), hh = Math.min(s.mapH / 2 - 20, 340);
  cx = clamp(cx, hw + 20, s.mapW - hw - 20); cy = clamp(cy, hh + 20, s.mapH - hh - 20);
  r[0] = cx - hw; r[1] = cy - hh; r[2] = cx + hw; r[3] = cy + hh; return r;
}
/** Point at fraction `u` of the rectangle's perimeter, clockwise from the top-left corner (legacy xOnR). */
export function xOnR(r: number[], u: number, out: number[]): number[] {
  const w = r[2]! - r[0]!, h = r[3]! - r[1]!; let d = u * 2 * (w + h);
  if (d < w) { out[0] = r[0]! + d; out[1] = r[1]!; return out; } d -= w;
  if (d < h) { out[0] = r[2]!; out[1] = r[1]! + d; return out; } d -= h;
  if (d < w) { out[0] = r[2]! - d; out[1] = r[3]!; return out; } d -= w;
  out[0] = r[0]!; out[1] = r[3]! - d; return out;
}
export const ang = (s: CombatState, q: number, x: number, y: number): number => atan2(s.y[q]! - y, s.x[q]! - x);
