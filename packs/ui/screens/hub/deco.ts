import { RND, TAU, UFI, clamp, eo, hexA, ornFrame, type UiCtx } from '../../core';
import { SET } from '../../settings';
import { UISUB } from '../../trans';

/** Hub extras (legacy hubFX + hubProfile, line ~4982): accent horizon with rising motes; player card (level from XP, avatar, name, WINS/KOS/GAMES). */
export const HUBP = [...Array(80)].map(() => ({ x: RND.r(), y: RND.r(), s: 0.012 + RND.r() * 0.03, w: RND.r() * TAU, r: 0.8 + RND.r() * 2.2, k: RND.r() < 0.35 }));
export function hubFX(u: UiCtx): void {
  const { c, W, H } = u, t = u.now, acc = u.acc || '#ff3355', n = u.fxLow ? 20 : HUBP.length; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'lighter';
  const hy = H * 0.9, lw = W * 0.5 * (0.85 + 0.15 * Math.sin(t * 0.7)); let g = c.createLinearGradient(W / 2 - lw, 0, W / 2 + lw, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, hexA(acc, 0.55)); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(W / 2 - lw, hy - 1, lw * 2, 2);
  c.save(); c.translate(W / 2, hy); c.scale(lw / 60, 1); g = c.createRadialGradient(0, 0, 0, 0, 0, 60); g.addColorStop(0, hexA(acc, 0.22)); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(-60, -60, 120, 120); c.restore();
  for (let i = 0; i < n; i++) {
    const p = HUBP[i]!; p.y -= p.s / 60; if (p.y < -0.03) { p.y = 1.03; p.x = RND.r(); }
    const x = (p.x + Math.sin(t * 0.6 + p.w) * 0.015) * W, y = p.y * H, f = 0.5 + 0.5 * Math.sin(t * 5 + p.w * 3); c.globalAlpha = (0.25 + 0.45 * f) * Math.min(1, p.y * 1.5); c.fillStyle = p.k ? '#9fd8ff' : acc; c.beginPath(); c.arc(x, y, p.r * (0.7 + 0.3 * f), 0, TAU); c.fill();
  }
  c.restore();
}
const PICC = new Map<string, HTMLImageElement>();
/** `onPic` / `onNick` open the avatar picker / name editor (profiles screen). */
export function hubProfile(u: UiCtx, onPic: () => void, onNick: () => void): void {
  const { c, W, H } = u, acc = u.acc || '#ff3355', sm = W < 820, w = Math.min(sm ? 300 : 470, W * (sm ? 0.42 : 0.34)), h = H < 560 ? Math.max(36, H * 0.085) : Math.max(52, Math.min(96, H * 0.1)), x = W - w - 16, y = H < 560 ? 6 : H * 0.03, e = eo(clamp((u.now - UISUB.t0) / 0.45, 0, 1)); if (e <= 0) return;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.translate((1 - e) * w * 0.6, 0); c.globalAlpha = e; ornFrame(c, x, y, w, h, acc, 1);
  const S = SET.st, xp = S.w * 3 + S.k + S.m, lv = 1 + Math.floor(Math.sqrt(xp / 2)), l0 = 2 * (lv - 1) ** 2, l1 = 2 * lv ** 2, pr = clamp((xp - l0) / Math.max(1, l1 - l0), 0, 1);
  c.textAlign = 'left'; c.fillStyle = '#8a8fa8'; c.font = 'bold ' + Math.round(h * 0.13) + 'px monospace'; c.fillText('LV', x + 14, y + h * 0.32); c.font = UFI(h * 0.42); c.fillStyle = '#fff'; c.fillText(String(lv).padStart(3, '0'), x + 12, y + h * 0.76);
  const px = x + h * 1.02, R = h * 0.34, cy = y + h / 2; c.save(); c.beginPath(); c.arc(px + R, cy, R, 0, TAU); c.closePath(); c.fillStyle = '#14161f'; c.fill(); c.clip();
  let im: HTMLImageElement | null = null; if (SET.pic && typeof Image !== 'undefined') { im = PICC.get(SET.pic) ?? null; if (!im) { im = new Image(); im.src = SET.pic; PICC.set(SET.pic, im); } }
  if (im && im.complete && im.naturalWidth) c.drawImage(im, px, cy - R, R * 2, R * 2); else { c.fillStyle = acc; c.font = UFI(R); c.textAlign = 'center'; c.fillText((SET.nick || 'P')[0]!.toUpperCase(), px + R, cy + R * 0.36); }
  c.restore(); c.strokeStyle = acc; c.lineWidth = 2.5; c.beginPath(); c.arc(px + R, cy, R, 0, TAU); c.stroke();
  const nx = px + R * 2 + 12, nw = x + w - nx - 14; c.textAlign = 'left'; let fs = h * 0.24; c.font = UFI(fs); const nm = (SET.nick || 'PLAYER').toUpperCase(); while (c.measureText(nm).width > nw * (sm ? 1 : 0.55) && fs > 9) { fs *= 0.9; c.font = UFI(fs); } c.fillStyle = '#fff'; c.fillText(nm, nx, y + h * 0.4);
  const bw = sm ? nw : nw * 0.55, by = y + h * 0.56; c.fillStyle = 'rgba(255,255,255,.1)'; c.fillRect(nx, by, bw, h * 0.12); const bg = c.createLinearGradient(nx, 0, nx + bw, 0); bg.addColorStop(0, '#3aff8a'); bg.addColorStop(1, '#b8ff5a'); c.fillStyle = bg; c.fillRect(nx, by, bw * pr, h * 0.12);
  c.fillStyle = '#cfe'; c.font = 'bold ' + Math.round(h * 0.11) + 'px monospace'; c.fillText((xp - l0) + ' / ' + (l1 - l0) + ' XP', nx, by + h * 0.27);
  if (!sm) { const sx = nx + nw * 0.6, sw = nw * 0.4 / 3; ([['WINS', S.w, '#ffd23a'], ['KOS', S.k, '#ff5a6a'], ['GAMES', S.m, '#6cf']] as const).forEach(([lb, v, col], k) => { const bx = sx + k * sw; c.fillStyle = 'rgba(255,255,255,.05)'; c.fillRect(bx + 2, y + h * 0.16, sw - 4, h * 0.68); c.fillStyle = col; c.fillRect(bx + 2, y + h * 0.16, sw - 4, 2); c.textAlign = 'center'; c.font = UFI(h * 0.26); c.fillStyle = '#fff'; c.fillText(String(v), bx + sw / 2, y + h * 0.55); c.font = 'bold ' + Math.round(h * 0.1) + 'px monospace'; c.fillStyle = col; c.fillText(lb, bx + sw / 2, y + h * 0.74); }); }
  c.restore(); u.hot.push({ x: px, y: cy - R, w: R * 2, h: R * 2, hover: () => {}, click: onPic }, { x: nx, y, w: nw * (sm ? 1 : 0.55), h: h * 0.48, hover: () => {}, click: onNick });
}
