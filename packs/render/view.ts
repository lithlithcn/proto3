import { type CombatState } from '@pack/combat/api';
import type { World } from '@kernel';
import { drawViewL } from './ld/bind';
import { juiceOf, syncJuice } from './juice/state';
import { newCam, type Cam } from './camera';

/** Visible world height in world units (legacy T.VIEW_H): the scale is canvas height / VIEW_H. */
export const VIEW_H = 600;
const cams: Cam[] = [];
let camW: World | null = null, camF = 0;

/** One screen region (legacy `views[]`): x/w in canvas px, y/h for the 2x2 layout, `i` = viewed player, `q` = quarter view (zoom x1.2). */
export interface VW { x: number; y: number; w: number; h: number; i: number; q?: 1 }
/** Legacy render(): one view for <2 or >4 human players, side by side for 2, quarters for 3-4 (humans = non-CPU players). */
export function viewsOf(s: CombatState, W: number, H: number): VW[] {
  const hum: number[] = []; for (let p = 0; p < s.n; p++) if (!s.cpu[p]) hum.push(p);
  if (hum.length < 2 || hum.length > 4) return [{ x: 0, y: 0, w: W, h: H, i: hum.length ? hum[0]! : 0 }];
  if (hum.length === 2) return hum.map((p, k) => ({ x: k ? W / 2 + 2 : 0, y: 0, w: W / 2 - 2, h: H, i: p }));
  return hum.map((p, k) => ({ x: k % 2 ? W / 2 + 2 : 0, y: k > 1 ? H / 2 + 2 : 0, w: W / 2 - 2, h: H / 2 - 2, i: p, q: 1 as const }));
}
/** Presentation knobs set by the shell: last-stock punch-in zoom (legacy LSZoom) and the reduced-effects flag (zoom kick ×0.2). */
export const VIEWZ = { k: 1, fxLow: false };
/** Legacy render() view loop + split bars. */
export function renderViews(c: CanvasRenderingContext2D, w: World, s: CombatState, W: number, H: number): void {
  const vs = viewsOf(s, W, H); syncJuice(juiceOf(w), s);
  for (const v of vs) { c.save(); c.translate(0, v.y); drawView(c, w, v); c.restore(); }
  if (vs.length > 1) { c.fillStyle = '#555'; c.fillRect(W / 2 - 2, 0, 4, H); if (vs.length > 2) c.fillRect(0, H / 2 - 2, W, 4); }
}

/** One player's view: the verbatim legacy drawView (ld/view.ts) fed by the view-model; scale as legacy render() computes it. Caller has translated by v.y. */
export function drawView(c: CanvasRenderingContext2D, w: World, v: VW): void {
  const s = w.slice<CombatState>('combat'), sc = v.h / VIEW_H * (v.q ? 1.2 : 1) * (1 + juiceOf(w).zk * (VIEWZ.fxLow ? 0.2 : 1)) * VIEWZ.k;
  for (let p = 0; p < 32; p++) cams[p] ??= newCam();
  if (camW !== w || s.gf < camF) { camW = w; for (let p = 0; p < s.n; p++) { cams[p]!.x = s.x[p]!; cams[p]!.y = s.y[p]!; } } // legacy start(): cameras begin on their player
  camF = s.gf;
  const J = juiceOf(w); for (const p of J.camSnap) if (p === 0 || !s.cpu[p]) { cams[p]!.x = s.x[p]!; cams[p]!.y = s.y[p]!; } J.camSnap.length = 0; // warp wrap: the camera jumps with its player
  drawViewL(c, w, s, v, cams, sc);
}
/** Legacy start(): every camera begins on its player. Call when a match starts (before its first frame). */
export function camStart(w: World): void { const s = w.slice<CombatState>('combat'); for (let p = 0; p < 32; p++) cams[p] ??= newCam(); for (let p = 0; p < s.n; p++) { cams[p]!.x = s.x[p]!; cams[p]!.y = s.y[p]!; } camW = w; camF = s.gf; }
export const camOf = (viewer: number): Cam => (cams[viewer] ??= newCam());
/** Parity probes: snapshot / restore every camera (drawView eases them in place). */
export const camSnap = (): Cam[] => cams.map(c => ({ ...c }));
export const camLoad = (a: Cam[]): void => { a.forEach((c, i) => { cams[i] = { ...c }; }); };
