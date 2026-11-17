import { RND, TAU, UF, UFI, clamp, skewRect, strokeTxt, type UiCtx } from '../../core';
import { titleBG } from './bg';

/** Title screen (legacy drawTitle line ~3842 + its v3/backdrop wrappers): logo card that pops in and shakes when you move, "PRESS ANY BUTTON",
 *  sound-unlock veil while the browser blocks audio. State is presentation only. */
export const TITLE = { t0: 0, shk: 0, agn: -1e9 };
const r = (): number => RND.r();

export function drawTitle(u: UiCtx, go: () => void): void {
  const { c, W, H } = u, t = u.now - TITLE.t0; u.hot.length = 0; u.acc = '#ff3355';
  titleBG(u, t);
  { const e = clamp(t / 0.9, 0, 1); c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'lighter'; const h = c.createRadialGradient(W / 2, H * 0.43, 0, W / 2, H * 0.43, W * 0.42); h.addColorStop(0, 'rgba(255,60,100,' + 0.32 * e + ')'); h.addColorStop(0.5, 'rgba(120,40,160,' + 0.12 * e + ')'); h.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = h; c.fillRect(0, 0, W, H); c.restore(); }
  c.save(); c.textAlign = 'center';
  const e = clamp(t / 0.7, 0, 1), eb = 1 + 2.7 * Math.pow(e - 1, 3) + 1.7 * Math.pow(e - 1, 2); TITLE.shk *= 0.9; const tsh = TITLE.shk * 9;
  c.translate(W / 2 + (r() - 0.5) * tsh, H * 0.42 + (r() - 0.5) * tsh); c.rotate(-0.06 + (r() - 0.5) * TITLE.shk * 0.02); c.scale(eb, eb);
  c.fillStyle = '#ff3355'; skewRect(c, -W * 0.36, -H * 0.13, W * 0.72, H * 0.2, H * 0.05); c.fill(); c.fillStyle = '#05060c'; skewRect(c, -W * 0.35 + 6, -H * 0.13 + 6, W * 0.72 - 12, H * 0.2 - 12, H * 0.05); c.fill();
  c.font = UFI(Math.min(W * 0.085, H * 0.15)); strokeTxt(c, 'SHMUP FIGHTER', 0, H * 0.025, 10, '#05060c', '#fff');
  c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.35 + 0.25 * Math.sin(t * 3); c.fillStyle = '#ff3355'; c.fillText('SHMUP FIGHTER', 4, H * 0.025 + 3); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
  c.font = UF(800, H * 0.03); c.fillStyle = '#ffd23a'; c.fillText('TOUHOU  DANMAKU  BRAWLER', 0, H * 0.1); c.restore();
  if (t > 0.6) { c.save(); c.textAlign = 'center'; c.globalAlpha = 0.55 + 0.45 * Math.sin(t * 4.5); c.font = UFI(H * 0.042); strokeTxt(c, 'PRESS ANY BUTTON', W / 2, H * 0.75, 6, '#05060c', '#fff'); c.restore(); }
  c.save(); c.textAlign = 'center'; c.font = '12px monospace'; c.fillStyle = '#777'; c.fillText('Fan game · not affiliated with Team Shanghai Alice', W / 2, H - 18); c.restore();
  u.hot.push({ x: 0, y: 0, w: W, h: H, hover: () => {}, click: go });
  if (t > 0.6) { // the two light rails around PRESS ANY BUTTON
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.font = UFI(H * 0.042); const tw = c.measureText('PRESS ANY BUTTON').width / 2 + 26, a = clamp((t - 0.6) / 0.6, 0, 1), L = W * 0.22 * a, y = H * 0.75 - H * 0.014; c.globalCompositeOperation = 'lighter';
    for (const sg of [-1, 1]) {
      const x0 = W / 2 + sg * tw, g = c.createLinearGradient(x0, 0, x0 + sg * L, 0); g.addColorStop(0, 'rgba(255,255,255,.85)'); g.addColorStop(1, 'rgba(120,190,255,0)'); c.fillStyle = g; c.fillRect(Math.min(x0, x0 + sg * L), y - 1, L, 2);
      const px = x0 + sg * L * ((t * 0.35) % 1); c.globalAlpha = 0.8; c.fillStyle = '#fff'; c.beginPath(); c.arc(px, y, 2.2, 0, TAU); c.fill(); c.globalAlpha = 1;
    }
    c.restore();
  }
}
/** Veil drawn over everything while audio is locked (legacy line ~5381). `nowMs` = performance.now(). */
export function drawSoundLock(u: UiCtx, nowMs: number): void {
  const { c, W, H } = u, t = nowMs / 1000, n = Math.max(0, 1 - (nowMs - TITLE.agn) / 1500);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 0.78; c.fillStyle = '#05030c'; c.fillRect(0, 0, W, H); c.globalAlpha = 1; c.textAlign = 'center';
  const k = Math.min(W / 1280, H / 720), y = H * 0.74, p = 1 + 0.05 * Math.sin(t * 5) + n * 0.12 * Math.sin(t * 40); c.translate(W / 2 + n * Math.sin(t * 60) * 8, y); c.scale(p, p);
  c.font = 'bold ' + (60 * k | 0) + 'px sans-serif'; c.lineWidth = 8 * k; c.strokeStyle = '#000'; c.fillStyle = n > 0 ? '#ff5a7a' : '#fff'; c.strokeText('CLICK TO ENABLE SOUND', 0, 0); c.fillText('CLICK TO ENABLE SOUND', 0, 0);
  c.font = (22 * k | 0) + 'px monospace'; c.fillStyle = n > 0 ? '#ffb0c0' : '#c8b8ff'; const m = n > 0 ? 'Your browser needs ONE mouse click or key press to turn the sound on' : 'or press any key on your keyboard'; c.strokeText(m, 0, 50 * k); c.fillText(m, 0, 50 * k); c.restore();
}
export const titleShake = (k: number): void => { TITLE.shk = Math.min(1.2, TITLE.shk + k); };
