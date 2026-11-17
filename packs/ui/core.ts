/** Shared UI context + drawing primitives (legacy UF/UFI/skewRect/strokeTxt, line ~3821). Every screen draws through `u.c` (a Ctx2D). */
import { hexA } from '@pack/render/ui';
export { UF, UFI, clamp, hexA, lerp } from '@pack/render/ui';
export const TAU = 6.2832; // legacy constant (op parity: arcs end at 6.2832, not 2π)

/** Clickable / hoverable region (legacy `hot`). */
export interface Hot { x: number; y: number; w: number; h: number; hover(): void; click(): void }
export interface UiCtx {
  c: CanvasRenderingContext2D; W: number; H: number;
  /** UI clock in seconds (legacy UNOW = performance.now()/1000). */ now: number;
  /** pointer in px (0 = never moved: legacy `MOUSE.x||W/2`) */ mx: number; my: number;
  fxLow: boolean; hot: Hot[];
  /** accent colour of the current screen (legacy UIC.acc) */ acc: string;
}
export function skewRect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, k: number): void {
  c.beginPath(); c.moveTo(x + k, y); c.lineTo(x + w, y); c.lineTo(x + w - k, y + h); c.lineTo(x, y + h); c.closePath();
}
export function strokeTxt(c: CanvasRenderingContext2D, t: string, x: number, y: number, lw: number, sc: string, fc: string): void {
  c.lineJoin = 'round'; c.lineWidth = lw; c.strokeStyle = sc; c.strokeText(t, x, y); c.fillStyle = fc; c.fillText(t, x, y);
}
/** Cosmetic randomness (late-bound so the comparison tool can pin it). */
export const RND = { r: (): number => Math.random() };
export const eo = (u: number): number => 1 - Math.pow(1 - Math.max(0, Math.min(1, u)), 3);
/** Ornate panel frame (legacy ornFrame, line ~4930): chamfered dark plate, double border, corner brackets, top diamond. */
export function ornFrame(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, col: string, a?: number): void {
  const k = Math.min(18, h * 0.12); c.save(); c.globalAlpha *= a == null ? 1 : a;
  const pth = (i: number): void => { c.beginPath(); c.moveTo(x + k + i, y + i); c.lineTo(x + w - k - i, y + i); c.lineTo(x + w - i, y + k + i); c.lineTo(x + w - i, y + h - k - i); c.lineTo(x + w - k - i, y + h - i); c.lineTo(x + k + i, y + h - i); c.lineTo(x + i, y + h - k - i); c.lineTo(x + i, y + k + i); c.closePath(); };
  const g = c.createLinearGradient(x, y, x, y + h); g.addColorStop(0, 'rgba(18,20,36,.94)'); g.addColorStop(1, 'rgba(8,9,18,.94)'); c.fillStyle = g; pth(0); c.fill(); c.strokeStyle = hexA(col, 0.85); c.lineWidth = 2; pth(1); c.stroke(); c.strokeStyle = hexA(col, 0.3); c.lineWidth = 1; pth(6); c.stroke();
  c.strokeStyle = col; c.lineWidth = 3; const L = Math.min(30, w * 0.12);
  for (const [sx, sy] of [[0, 0], [1, 0], [0, 1], [1, 1]] as const) { const px = sx ? x + w - 4 : x + 4, py = sy ? y + h - 4 : y + 4, dx = sx ? -1 : 1, dy = sy ? -1 : 1; c.beginPath(); c.moveTo(px + dx * (k + L), py); c.lineTo(px + dx * k, py); c.moveTo(px, py + dy * k); c.lineTo(px, py + dy * (k + L)); c.stroke(); }
  c.fillStyle = col; c.beginPath(); c.moveTo(x + w / 2, y - 5); c.lineTo(x + w / 2 + 7, y + 1); c.lineTo(x + w / 2, y + 7); c.lineTo(x + w / 2 - 7, y + 1); c.fill(); c.restore();
}
