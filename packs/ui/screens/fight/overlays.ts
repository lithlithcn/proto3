import { COLS, TCOL, UF, UFI, clamp, skewRect, strokeTxt, type Hot, type UiCtx } from '../../core';

/** In-fight overlays (legacy drawIntro / drawGameEnd / drawPause + its menu, line ~3989-4178). `f` = game frame, `winT` = frames since the win. */
export interface FightView { f: number; winner: number; winT: number; teams: boolean; teamA: ArrayLike<number>; intro: boolean }
let introSnd = 0;
/** READY? -> FIGHT! band. Sounds are played by the fight juice (same frames as legacy). */
export function drawIntro(u: UiCtx, v: FightView): void {
  if (!v.intro || v.f > 110 || v.winner >= 0) return; void introSnd;
  const { c, W, H } = u, f = v.f; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const go = f >= 55, uu = go ? (f - 55) / 55 : f / 55;
  const bh = H * 0.2, ein = clamp(uu * 5, 0, 1), eout = go ? clamp((uu - 0.6) / 0.4, 0, 1) : 0, bx = -W * (1 - ein) + eout * W * 1.2;
  c.globalAlpha = go ? 0.85 * (1 - eout) : 0.8; c.fillStyle = '#05060c'; c.beginPath(); c.moveTo(bx, H / 2 - bh / 2 - 20); c.lineTo(bx + W * 1.2, H / 2 - bh / 2 - 40); c.lineTo(bx + W * 1.2, H / 2 + bh / 2 - 40); c.lineTo(bx, H / 2 + bh / 2 - 20); c.fill();
  const ac = go ? '#ff3355' : '#ffd23a'; c.fillStyle = ac; c.fillRect(bx, H / 2 - bh / 2 - 24, W * 1.2, 5); c.fillRect(bx, H / 2 + bh / 2 - 30, W * 1.2, 5); c.globalAlpha = 1;
  const txt = go ? 'FIGHT!' : 'READY?', sc = go ? (uu < 0.12 ? 1 + (1 - uu / 0.12) * 1.4 : 1 + 0.04 * Math.sin(uu * 20)) : 0.9 + ein * 0.1, sh = go && uu < 0.2 ? (Math.random() - 0.5) * 14 * (1 - uu / 0.2) : 0;
  c.translate(W / 2 + sh + (go ? eout * W : 0), H / 2 - 20 + sh); c.rotate(-0.04); c.scale(sc, sc); c.font = UFI(Math.min(H * 0.17, W * 0.13)); c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = 14; c.strokeStyle = '#05060c'; c.globalAlpha = 1 - eout; c.strokeText(txt, 0, 0);
  if (!u.fxLow) { c.fillStyle = '#2df0ff'; c.fillText(txt, -5, 2); c.fillStyle = '#ff2d6a'; c.fillText(txt, 5, -2); } c.fillStyle = '#fff'; c.fillText(txt, 0, 0);
  if (go && uu < 0.15) { c.globalAlpha = (1 - uu / 0.15) * 0.6; c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); }
  c.restore();
}
/** GAME! : letterbox, white flash, text slamming in, glint. */
export function drawGameEnd(u: UiCtx, v: FightView): void {
  const { c, W, H } = u, t = v.winT; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const lb = clamp(t / 10, 0, 1) * H * 0.12; c.fillStyle = '#000'; c.fillRect(0, 0, W, lb); c.fillRect(0, H - lb, W, lb);
  if (t < 6) { c.globalAlpha = (1 - t / 6) * 0.7; c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
  const e = clamp(t / 8, 0, 1), sc = e < 1 ? 3 - 2 * e : 1 + 0.03 * Math.sin(t * 0.3), sh = t < 16 ? (Math.random() - 0.5) * 20 * (1 - t / 16) : 0, wc = v.winner >= 0 ? (v.teams ? TCOL[v.teamA[v.winner]!]! : COLS[v.winner % 8]!) : '#fff';
  c.translate(W / 2 + sh, H / 2 + sh); c.rotate(-0.06); c.globalAlpha = 0.85; c.fillStyle = '#05060c'; skewRect(c, -W * 0.6, -H * 0.11, W * 1.2 * clamp(t / 6, 0, 1), H * 0.22, H * 0.08); c.fill(); c.fillStyle = wc; c.fillRect(-W * 0.6, -H * 0.11, W * 1.2 * clamp(t / 6, 0, 1), 5); c.fillRect(-W * 0.6, H * 0.11 - 5, W * 1.2 * clamp(t / 6, 0, 1), 5); c.globalAlpha = 1;
  c.scale(sc, sc); c.font = UFI(Math.min(H * 0.2, W * 0.15)); c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = 16; c.strokeStyle = '#05060c'; c.strokeText('GAME!', 0, 0);
  if (!u.fxLow) { c.fillStyle = '#2df0ff'; c.fillText('GAME!', -6, 3); c.fillStyle = '#ff2d6a'; c.fillText('GAME!', 6, -3); } c.fillStyle = '#fff'; c.fillText('GAME!', 0, 0);
  if (t > 4 && t < 40 && !u.fxLow) { c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.5; const tw = c.measureText('GAME!').width, sx = -tw / 2 + (t - 4) / 36 * tw * 1.3, gg = c.createLinearGradient(sx - 50, 0, sx + 50, 0); gg.addColorStop(0, 'rgba(255,255,255,0)'); gg.addColorStop(0.5, '#fff'); gg.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gg; c.fillText('GAME!', 0, 0); }
  c.restore();
}
/** Pause: slanted plate, PAUSE word, menu (resume / restart / sound / quit with confirm). */
export const PZ = { sel: 0, cf: 0, why: '', t0: 0 };
export interface PauseItem { t: string; f(): void }
export function drawPause(u: UiCtx, items: PauseItem[] | null): void {
  const { c, W, H } = u; if (!PZ.t0) PZ.t0 = u.now; const t = u.now - PZ.t0, e = 1 - Math.pow(1 - clamp(t / 0.3, 0, 1), 3);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = 'rgba(4,5,12,' + (0.65 * e) + ')'; c.fillRect(0, 0, W, H);
  c.translate((1 - e) * -W * 0.5, 0); c.fillStyle = '#05060c'; skewRect(c, -40, H * 0.36, W * 0.62, H * 0.22, H * 0.08); c.fill(); c.fillStyle = '#ff3355'; c.fillRect(0, H * 0.36, W * 0.58, 5); c.fillRect(0, H * 0.58 - 5, W * 0.55, 5);
  c.font = UFI(H * 0.13); c.textAlign = 'left'; c.textBaseline = 'alphabetic'; strokeTxt(c, 'PAUSE', W * 0.06, H * 0.52, 10, '#05060c', '#fff'); c.font = UF(800, H * 0.022); c.fillStyle = '#ffd23a'; c.fillText('ESC / A  ·  RESUME          M / B  ·  MENU', W * 0.07, H * 0.56);
  c.restore(); c.save(); c.globalAlpha = 0.15 * e; c.font = UFI(H * 0.4); c.textAlign = 'right'; c.lineWidth = 3; c.strokeStyle = '#ff3355'; c.strokeText('PAUSE', W + ((u.now * 40) % 200) - 100, H * 0.98); c.restore();
  if (!items) { PZ.sel = 0; PZ.cf = 0; return; }
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#05060c'; c.fillRect(W * 0.06, H * 0.535, W * 0.5, H * 0.04); c.textAlign = 'left'; c.font = 'bold ' + Math.round(H * 0.019) + 'px monospace'; c.fillStyle = '#ffd23a'; c.fillText('▲▼ choose  ·  A / Enter confirm  ·  B / Esc resume', W * 0.07, H * 0.56);
  items.forEach(({ t: tx, f }, i) => {
    const y = H * 0.64 + i * H * 0.068, on = i === PZ.sel, x = W * 0.06 + (on ? 18 : 0); c.globalAlpha = on ? 1 : 0.75; c.fillStyle = on ? '#ff3355' : '#14161f'; c.fillRect(x, y - H * 0.04, W * 0.34, H * 0.056); c.fillStyle = '#fff'; c.font = (on ? 'bold ' : '') + Math.round(H * 0.03) + 'px monospace'; c.fillText((on ? '▶ ' : '  ') + tx, x + 14, y);
    const hot: Hot = { x, y: y - H * 0.04, w: W * 0.34, h: H * 0.056, hover: () => { if (PZ.sel !== i) { PZ.sel = i; PZ.cf = 0; } }, click: () => { PZ.sel = i; f(); } }; u.hot.push(hot);
  });
  if (PZ.why) { c.globalAlpha = 1; c.fillStyle = '#ff9a3a'; c.font = 'bold ' + Math.round(H * 0.024) + 'px monospace'; c.fillText(PZ.why, W * 0.07, H * 0.62 - H * 0.04 - H * 0.02); }
  c.restore();
}
