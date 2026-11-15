import { T, charOf, type CombatState } from '@pack/combat/api';
import type { World } from '@kernel';
import { COLS, LCOLS } from './colors';

const bar = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, f: number, col: string): void => { c.fillStyle = '#222'; c.fillRect(x, y, w, h); c.fillStyle = col; c.fillRect(x, y, w * Math.max(0, Math.min(1, f)), h); };
const box = (c: CanvasRenderingContext2D, a: number, b: number, w: number, h: number): void => { c.beginPath(); if (c.roundRect) c.roundRect(a, b, w, h, 7); else c.rect(a, b, w, h); };

/** Legacy drawHUD (one player panel): name, stocks, HP and spirit bars, dash charges, wall pips, shot/power line, status line. Team colours, profile pictures and the status list of unported items arrive with their features. */
export function drawHudPanel(c: CanvasRenderingContext2D, w: World, s: CombatState, p: number, x: number, right: boolean, y: number): void {
  const pw = 250, X = right ? x - pw : x, col = COLS[p % 8]!, hp = Math.max(0, s.hp[p]!), f = s.gf, cpu = s.cpu[p]!;
  c.save(); c.globalAlpha = 0.5; c.fillStyle = '#04050b'; box(c, X - 8, y - 20, pw + 16, 94); c.fill(); c.globalAlpha = 0.8; c.strokeStyle = col; c.lineWidth = 2; box(c, X - 8, y - 20, pw + 16, 94); c.stroke(); c.globalAlpha = 1;
  c.font = 'bold 15px monospace'; c.textAlign = right ? 'right' : 'left'; c.fillStyle = col; c.fillText((cpu ? 'CPU ' : 'P') + (p + 1), x, y - 3);
  c.textAlign = right ? 'left' : 'right'; c.fillStyle = '#ff7090'; c.fillText(s.stocks[p]! > 6 ? '♥ x' + s.stocks[p] : '♥'.repeat(Math.max(0, s.stocks[p]!)), right ? X : X + pw, y - 3);
  const hc = hp > 50 ? '#4e6' : hp > 25 ? '#ec4' : '#f44'; bar(c, X, y + 3, pw, 14, hp / T.HP, hc);
  c.textAlign = 'center'; c.font = 'bold 11px monospace'; c.fillStyle = '#000'; c.fillText(Math.ceil(hp) + ' HP', X + pw / 2, y + 14);
  const sp = s.spirit[p]!, sr = sp >= T.SPELL_COST, ult = s.ult[p]! > 0;
  bar(c, X, y + 21, pw, 10, sp / T.SPIRIT_MAX, ult ? `hsl(${f * 6 % 360},100%,65%)` : sr ? '#f8f' : '#58c');
  c.font = 'bold 9px monospace'; c.fillStyle = sr || ult ? '#000' : '#fff'; c.fillText(ult ? 'LAST WORD READY' : sr ? 'SPELL READY' : 'SPELL ' + Math.min(99, sp / T.SPELL_COST * 100 | 0) + '%', X + pw / 2, y + 29);
  for (let i = 0; i < T.DASH_CHARGES; i++) { const k = Math.max(0, Math.min(1, s.boost[p]! - i)), xx = X + pw * 0.53 + i * 17; c.fillStyle = '#262a33'; c.fillRect(xx, y + 35, 14, 9); c.fillStyle = k >= 1 ? '#fff' : '#8a8f9a'; c.fillRect(xx, y + 35, 14 * k, 9); }
  for (let i = 0; i < T.PIPS; i++) { c.fillStyle = i < s.pips[p]! ? '#f55' : '#3a2226'; c.fillRect(X + pw - (T.PIPS - i) * 15 + 3, y + 35, 12, 9); }
  c.fillStyle = '#8a8f9a'; c.font = '8px monospace'; c.fillText('DASH', X + pw * 0.53 + 25, y + 52); c.fillText('WALL', X + pw - 22, y + 52);
  c.textAlign = right ? 'right' : 'left'; c.font = '11px monospace'; c.fillStyle = LCOLS[p % 8]!;
  c.fillText(charOf(w, s, p).name + '  P ' + s.power[p]!.toFixed(1) + (s.pStk[p] ? '  ATK x' + Math.pow(1.3, s.pStk[p]!).toFixed(1) : ''), x, y + 60);
  const st = [ult ? 'LAST WORD READY' : '', sr ? 'SPELL READY' : '', s.burst[p]! >= T.BURST_MAX ? 'BURST' : '', s.blade[p]! > 0 ? 'BLADE ' + Math.ceil(s.blade[p]! / 60) + 's' : '', s.rifle[p] ? 'RIFLE x' + s.rifle[p] : '', s.bombs[p]! > 0 ? 'BOMBS ' + Math.ceil(s.bombs[p]! / 60) + 's' : '', s.mirror[p]! > 0 ? 'MIRROR ' + Math.ceil(s.mirror[p]! / 60) + 's' : '', s.giant[p]! > 0 ? 'GIANT ' + Math.ceil(s.giant[p]! / 60) + 's' : '', s.clone[p]! > 0 ? 'CLONE ' + Math.ceil(s.clone[p]! / 60) + 's' : '', s.cam[p] ? 'CAMERA x' + s.cam[p] : '', s.spk[p]! > 0 ? 'SPARK!' : '', s.comboT[p]! > 0 && s.comboN[p]! > 1 ? s.comboN[p] + ' HITS' : ''].filter(Boolean).join(' · ');
  c.fillStyle = '#ffb0f0'; c.font = '10px monospace'; c.fillText(st.length > 46 ? st.slice(0, 45) + '…' : st, x, y + 71); c.restore();
}

/** Legacy HUD placement (<= 4 players, no touch): panels on the screen edges, scaled with the window width. */
export function drawHud(c: CanvasRenderingContext2D, w: World, s: CombatState, W: number, H: number): void {
  const hk = Math.min(1, W / 1280 + 0.1);
  c.save(); c.globalAlpha = 0.85; c.scale(hk, hk);
  for (let p = 0; p < s.n; p++) drawHudPanel(c, w, s, p, (p % 2 ? W - 12 : 12) / hk, p % 2 === 1, (p < 2 ? 30 : H - 100) / hk);
  c.restore();
}
