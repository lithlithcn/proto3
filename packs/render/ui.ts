/** Legacy UI drawing helpers (UF/UFI fonts, hexA, skw/sbar skewed bars). Presentation only. */
export const UF = (w: number, s: number): string => `${w || 900} ${s | 0}px 'Arial Black','Segoe UI Black','Helvetica Neue',Impact,sans-serif`;
export const UFI = (s: number): string => `italic 900 ${s | 0}px 'Arial Black','Segoe UI Black',Impact,sans-serif`;
export const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, k: number): number => a + (b - a) * k;
export function hexA(c: string, a: number): string {
  if (c[0] !== '#') { const m = /^hsla?\(([^,]+),([^,]+),([^,)]+)/.exec(c); return m ? `hsla(${m[1]},${m[2]},${m[3]},${a})` : c; }
  const h = c.replace('#', ''), f = h.length === 3 ? h.split('').map(x => x + x).join('') : h;
  return `rgba(${parseInt(f.slice(0, 2), 16)},${parseInt(f.slice(2, 4), 16)},${parseInt(f.slice(4, 6), 16)},${a})`;
}
export function skw(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, k: number): void { c.beginPath(); c.moveTo(x + k, y); c.lineTo(x + w, y); c.lineTo(x + w - k, y + h); c.lineTo(x, y + h); c.closePath(); }
export function sbar(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, f: number, c1: string, c2: string, k: number): void {
  c.fillStyle = 'rgba(0,0,0,.55)'; skw(c, x, y, w, h, k); c.fill(); f = clamp(f, 0, 1);
  if (f > 0) { c.save(); skw(c, x, y, w, h, k); c.clip(); const g = c.createLinearGradient(x, y, x, y + h); g.addColorStop(0, c1); g.addColorStop(1, c2); c.fillStyle = g; c.fillRect(x, y, w * f, h); c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(x, y, w * f, h * 0.35); c.restore(); }
}
