import { RND, TAU, UFI, hexA, type UiCtx } from './core';

/** Common animated menu backdrop (legacy uiBG, line ~3828): gradient, drifting diagonal bands, floating danmaku rings, giant outlined scrolling word. */
export const UIDOTS = [...Array(46)].map((_, i) => ({ x: RND.r(), y: RND.r(), r: 3 + RND.r() * 10, s: 0.02 + RND.r() * 0.05, ph: RND.r() * 6.28, k: i % 3 }));
/** `extra` runs right after the backdrop (the hub adds its horizon + motes there, legacy wrapper of uiBG). */
export function uiBG(u: UiCtx, word: string, extra?: () => void): void {
  const { c, W, H } = u, t = u.now, a = u.acc; c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  const g = c.createLinearGradient(0, 0, W * 0.4, H); g.addColorStop(0, '#05060c'); g.addColorStop(0.55, '#0b0d1a'); g.addColorStop(1, hexA(a, 0.28)); c.fillStyle = g; c.fillRect(0, 0, W, H); c.globalAlpha = 1;
  const rg = c.createRadialGradient(W * 0.78, H * 0.3, 0, W * 0.78, H * 0.3, W * 0.7); rg.addColorStop(0, hexA(a, 0.22)); rg.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = rg; c.fillRect(0, 0, W, H);
  c.globalAlpha = 0.06; c.fillStyle = a; const sw = H * 0.09;
  for (let i = -3; i < W / sw / 1.6 + 6; i++) { const x = i * sw * 1.6 + ((t * 40) % (sw * 1.6)); c.beginPath(); c.moveTo(x, 0); c.lineTo(x + sw, 0); c.lineTo(x + sw - H * 0.55, H); c.lineTo(x - H * 0.55, H); c.fill(); }
  c.globalAlpha = 1; c.globalCompositeOperation = 'lighter';
  for (const d of UIDOTS) {
    const y = ((d.y - t * d.s) % 1 + 1) % 1, x = d.x + Math.sin(t * 0.4 + d.ph) * 0.02; c.globalAlpha = 0.16 + 0.1 * Math.sin(t * 2 + d.ph); c.strokeStyle = d.k ? a : '#fff'; c.lineWidth = 2; c.beginPath(); c.arc(x * W, y * H, d.r, 0, TAU); c.stroke();
    if (d.k === 2) { c.fillStyle = a; c.beginPath(); c.arc(x * W, y * H, d.r * 0.35, 0, TAU); c.fill(); }
  }
  c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
  if (word) { c.save(); c.translate(W * 0.02, H * 0.98); c.rotate(-0.12); c.font = UFI(H * 0.32); c.textAlign = 'left'; c.lineWidth = 3; c.strokeStyle = hexA(a, 0.22); const tw = c.measureText(word + '  ').width, o = -((t * 30) % tw); for (let k = 0; k < 3; k++) c.strokeText(word, o + k * tw, 0); c.restore(); }
  c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(0, 0, W, 3); c.restore();
  extra?.();
}
