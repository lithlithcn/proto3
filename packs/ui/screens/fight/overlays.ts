import { pname } from '../../profiles';
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
  if (go && uu < 0.15 && !u.fxOff) { c.globalAlpha = (1 - uu / 0.15) * 0.6; c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); }
  c.restore();
}
/** GAME! : letterbox, white flash, text slamming in, glint. */
export function drawGameEnd(u: UiCtx, v: FightView): void {
  const { c, W, H } = u, t = v.winT; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const lb = clamp(t / 10, 0, 1) * H * 0.12; c.fillStyle = '#000'; c.fillRect(0, 0, W, lb); c.fillRect(0, H - lb, W, lb);
  if (t < 6 && !u.fxOff) { c.globalAlpha = (1 - t / 6) * 0.7; c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
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
/** LAST STOCK! (legacy LS / lsCheck / drawLastStock / LSZoom, line ~4024): in a 1v1 that started with more than one stock, when one fighter
 *  is down to its last life: red heartbeat vignette, letterbox, streaks, slammed banner, name line, camera punch-in. */
export const LS = { on: 0, t0: 0, id: -1, init: 0, p: -1 };
export interface LsPlayer { id: number; stocks: number; cpu: boolean }
/** Once per frame before the fight draw. `matchId` changes on every new match. Returns true the frame the banner starts (play its sounds). */
export function lsCheck(now: number, matchId: number, f: number, winner: number, P: LsPlayer[], on: boolean): boolean {
  if (!on) { LS.on = 0; return false; }
  if (LS.id !== matchId) { LS.id = matchId; LS.on = 0; LS.init = 0; }
  if (f < 10) LS.init = Math.max(LS.init, ...P.map(p => p.stocks));
  if (!LS.on && winner < 0 && P.length === 2 && LS.init > 1 && P.every(p => p.stocks > 0)) { const q = P.find(p => p.stocks === 1); if (q) { LS.on = 1; LS.t0 = now; LS.p = q.id; return true; } }
  return false;
}
export const lsZoom = (now: number, fxLow: boolean): number => {
  if (!LS.on) return 1; const d = now - LS.t0, env = d < 0.12 ? d / 0.12 : d < 0.7 ? 1 : d < 1.8 ? 1 - (d - 0.7) / 1.1 : 0, beat = Math.pow(Math.max(0, Math.sin(now * Math.PI * 2 * 1.1)), 12);
  return 1 + (fxLow ? 0.12 : 0.32) * env + 0.025 * beat;
};
export function drawLastStock(u: UiCtx, v: FightView, P: LsPlayer[]): void {
  if (!LS.on || v.winner >= 0 && v.winT >= 100) return;
  const { c, W, H } = u, t = u.now, d = t - LS.t0, q = P[LS.p]; c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  const beat = u.fxOff ? 0 : Math.pow(Math.max(0, Math.sin(t * Math.PI * 2 * 1.1)), 8), vg = c.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95); vg.addColorStop(0, 'rgba(255,0,40,0)'); vg.addColorStop(1, 'rgba(255,0,40,' + (0.12 + 0.16 * beat) + ')'); c.fillStyle = vg; c.fillRect(0, 0, W, H);
  if (d < 2.6) {
    if (d < 0.18 && !u.fxOff) { c.globalAlpha = (1 - d / 0.18) * 0.8; c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
    const inn = clamp(d / 0.2, 0, 1), out = clamp((d - 2.1) / 0.5, 0, 1), lb = H * 0.13 * inn * (1 - out); c.fillStyle = '#000'; c.fillRect(0, 0, W, lb); c.fillRect(0, H - lb, W, lb);
    for (let i = 0; i < 5; i++) { const uu = clamp((d - i * 0.05) / 0.35, 0, 1), x = -W + uu * W * 2.6; c.globalAlpha = 0.5 * (1 - out); c.fillStyle = i % 2 ? '#ff2d55' : '#fff'; c.beginPath(); c.moveTo(x, H * (0.2 + i * 0.13)); c.lineTo(x + W * 0.6, H * (0.16 + i * 0.13)); c.lineTo(x + W * 0.6, H * (0.165 + i * 0.13)); c.lineTo(x, H * (0.205 + i * 0.13)); c.fill(); }
    c.globalAlpha = 1;
    const e = clamp(d / 0.16, 0, 1), sc = e < 1 ? 2.6 - 1.6 * e : 1 + 0.03 * Math.sin(d * 18), sh = d < 0.4 ? (Math.random() - 0.5) * 18 * (1 - d / 0.4) : 0; c.translate(W / 2 + sh + out * W, H * 0.45 + sh); c.rotate(-0.07); c.globalAlpha = 1 - out;
    c.fillStyle = 'rgba(5,6,12,.88)'; skewRect(c, -W * 0.42, -H * 0.1, W * 0.84, H * 0.2, H * 0.07); c.fill(); c.fillStyle = '#ff2d55'; c.fillRect(-W * 0.42, -H * 0.1, W * 0.84, 6); c.fillRect(-W * 0.42 + H * 0.0, H * 0.1 - 6, W * 0.84, 6);
    c.save(); c.scale(sc, sc); c.font = UFI(Math.min(H * 0.14, W * 0.1)); c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = 14; c.strokeStyle = '#05060c'; c.strokeText('LAST STOCK!', 0, 0);
    if (!u.fxLow) { c.fillStyle = '#2df0ff'; c.fillText('LAST STOCK!', -5, 2); c.fillStyle = '#ff2d6a'; c.fillText('LAST STOCK!', 5, -2); } c.fillStyle = '#fff'; c.fillText('LAST STOCK!', 0, 0); c.restore();
    if (q && d > 0.25) { const uu = clamp((d - 0.25) / 0.25, 0, 1); c.globalAlpha = (1 - out) * uu; c.font = UF(900, H * 0.03); c.textAlign = 'center'; c.fillStyle = COLS[q.id % 8]!; c.fillText(pname(q).toUpperCase() + '  ·  ONE LIFE LEFT', (1 - uu) * 80, H * 0.135); }
  }
  c.restore();
}
