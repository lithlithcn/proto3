import { PS, type CombatState } from '@pack/combat/api';
import type { World } from '@kernel';
import { drawArena } from './arena';
import { drawBullet, drawPlayer } from './actors';
import { drawCards } from './cards';
import { newCam, stepCam, type Cam } from './camera';

/** Visible world height in world units (legacy T.VIEW_H): the scale is canvas height / VIEW_H. */
export const VIEW_H = 600;
const cams: Cam[] = [];

/** Draws one player's view of the match through the given Ctx2D (legacy drawView, step by step; missing parts are tracked in docs/parity-ledger.json `render-parity`). */
export function drawView(c: CanvasRenderingContext2D, w: World, vx: number, vy: number, vw: number, vh: number, viewer: number): void {
  const s = w.slice<CombatState>('combat'), sc = vh / VIEW_H, cam = (cams[viewer] ??= newCam()), ww = vw / sc, hh = vh / sc;
  stepCam(cam, s, viewer, ww, hh);
  c.save(); c.beginPath(); c.rect(vx, vy, vw, vh); c.clip();
  c.translate(vx + vw / 2, vy + vh / 2); c.scale(sc, sc); c.translate(-cam.x, -cam.y);
  const L = cam.x - ww / 2, Tp = cam.y - hh / 2;
  drawArena(c, s, L, Tp, L + ww, Tp + hh);
  drawCards(c, w, s);
  const inV = (i: number): boolean => s.bx[i]! > L - 30 && s.bx[i]! < L + ww + 30 && s.by[i]! > Tp - 30 && s.by[i]! < Tp + hh + 30;
  for (let i = 0; i < s.nb; i++) if (!(s.bflags[i]! & 2) && !(s.bflags[i]! & 1) && inV(i)) drawBullet(c, s, i); // light bullets
  for (let i = 0; i < s.nb; i++) if (!(s.bflags[i]! & 2) && (s.bflags[i]! & 1) && inV(i)) drawBullet(c, s, i); // heavy bullets on top
  for (let q = 0; q < s.n; q++) drawPlayer(c, s, q);
  c.restore();
  void PS;
}
