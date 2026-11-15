import { PS, type CombatState } from '@pack/combat/api';
import type { World } from '@kernel';
import { drawArena } from './arena';
import { drawBullet } from './actors';
import { drawPlayerL, drawVignetteL, drawWorldFxL } from './ld/bind';
import { juiceOf, syncJuice } from './juice/state';
import { drawCards } from './cards';
import { newCam, stepCam, type Cam } from './camera';

/** Visible world height in world units (legacy T.VIEW_H): the scale is canvas height / VIEW_H. */
export const VIEW_H = 600;
const cams: Cam[] = [];

/** One screen region (legacy `views[]`): x/w in canvas px, y/h for the 2x2 layout, `i` = viewed player, `q` = quarter view (zoom x1.2). */
export interface VW { x: number; y: number; w: number; h: number; i: number; q?: 1 }
/** Legacy render(): one view for <2 or >4 human players, side by side for 2, quarters for 3-4 (humans = non-CPU players). */
export function viewsOf(s: CombatState, W: number, H: number): VW[] {
  const hum: number[] = []; for (let p = 0; p < s.n; p++) if (!s.cpu[p]) hum.push(p);
  if (hum.length < 2 || hum.length > 4) return [{ x: 0, y: 0, w: W, h: H, i: hum.length ? hum[0]! : 0 }];
  if (hum.length === 2) return hum.map((p, k) => ({ x: k ? W / 2 + 2 : 0, y: 0, w: W / 2 - 2, h: H, i: p }));
  return hum.map((p, k) => ({ x: k % 2 ? W / 2 + 2 : 0, y: k > 1 ? H / 2 + 2 : 0, w: W / 2 - 2, h: H / 2 - 2, i: p, q: 1 as const }));
}
/** Legacy render() view loop + split bars. */
export function renderViews(c: CanvasRenderingContext2D, w: World, s: CombatState, W: number, H: number): void {
  const vs = viewsOf(s, W, H); syncJuice(juiceOf(w), s);
  for (const v of vs) { c.save(); c.translate(0, v.y); drawView(c, w, v); c.restore(); }
  if (vs.length > 1) { c.fillStyle = '#555'; c.fillRect(W / 2 - 2, 0, 4, H); if (vs.length > 2) c.fillRect(0, H / 2 - 2, W, 4); }
}

/** Draws one player's view of the match through the given Ctx2D (legacy drawView, step by step; missing parts are tracked in docs/parity-ledger.json `render-parity`). Caller has translated by v.y. */
export function drawView(c: CanvasRenderingContext2D, w: World, v: VW, until?: 'arena'): void {
  const s = w.slice<CombatState>('combat'), j = juiceOf(w), sc = v.h / VIEW_H * (v.q ? 1.2 : 1) * (1 + j.zk), viewer = v.i, cam = (cams[viewer] ??= newCam()), ww = v.w / sc, hh = v.h / sc;
  if (!until) stepCam(cam, s, viewer, ww, hh); // `until` = parity probe: the camera was already stepped by the full draw of this frame
  c.save(); c.beginPath(); c.rect(v.x, 0, v.w, v.h); c.clip();
  const fr = 0.35 + 0.065 * s.tempo, f = s.gf, shN = (t: number, k: number): number => Math.sin(t * 1.7 + k) * 0.5 + Math.sin(t * 2.9 + k * 3) * 0.3 + Math.sin(t * 5.3 + k * 7) * 0.2;
  const sx = ((j.shake ? shN(f * 0.9, 1.3) * j.shake * 0.55 : 0) + j.kx) * fr, sy = ((j.shake ? shN(f * 0.9 + 77, 2.1) * j.shake * 0.55 : 0) + j.ky) * fr; // legacy screen shake + camera kick
  c.translate(v.x + v.w / 2 + sx, v.h / 2 + sy); c.scale(sc, sc); c.translate(-cam.x, -cam.y);
  const L = cam.x - ww / 2, Tp = cam.y - hh / 2;
  drawArena(c, s, L, Tp, L + ww, Tp + hh, j.bgF);
  if (until === 'arena') return; // parity probe: the recorder is thrown away, no restore
  drawCards(c, w, s);
  const inV = (i: number): boolean => s.bx[i]! > L - 30 && s.bx[i]! < L + ww + 30 && s.by[i]! > Tp - 30 && s.by[i]! < Tp + hh + 30;
  for (let i = 0; i < s.nb; i++) if (!(s.bflags[i]! & 2) && !(s.bflags[i]! & 1) && inV(i)) drawBullet(c, s, i); // light bullets
  for (let i = 0; i < s.nb; i++) if (!(s.bflags[i]! & 2) && (s.bflags[i]! & 1) && inV(i)) drawBullet(c, s, i); // heavy bullets on top
  for (let q = 0; q < s.n; q++) drawPlayerL(c, w, s, q);
  drawWorldFxL(c, w, s, L, Tp, L + ww, Tp + hh, ww, hh);
  c.restore();
  drawVignetteL(c, w, s, v, v.h, viewer);
  void PS;
}

/** Camera centre of a viewer (read by render parity). */
export const camOf = (viewer: number): Cam => (cams[viewer] ??= newCam());
