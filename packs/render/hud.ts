import { T, charOf, type CombatState } from '@pack/combat/api';
import type { World } from '@kernel';
import { COLS, LCOLS } from './colors';
import { UF, UFI, clamp, hexA, lerp, sbar, skw } from './ui';

/** Per-player HUD animation state (legacy HUDS): lagging HP trail, lost-stock sparks, hit/heal flashes. Presentation only; `now` is seconds (legacy UNOW). */
export interface HudS { hp: number; tr: number; trT: number; st: number; lost: { i: number; t: number }[]; hit: number; heal?: number; f0: number }
export const HUDS: HudS[] = [];
export const resetHud = (): void => { HUDS.length = 0; };

/** Legacy final drawHUD (the animated skewed panel): name, stock diamonds (+ loss sparks), trailing HP bar, spirit bar with ticks/shine, dash charges, wall pips, shot/power line, item status line.
 *  Not yet: team colours, Last-Stock pulse, profile names/pictures, the `wsA` inverted-HP mode, KO-hidden HUD while anonymous/Koishi (needs those statuses). */
export function drawHudPanel(c: CanvasRenderingContext2D, w: World, s: CombatState, p: number, x: number, right: boolean, y: number, now: number, rnd: () => number = Math.random): void {
  const f = s.gf, S = (HUDS[p] ??= { hp: s.hp[p]!, tr: s.hp[p]!, trT: 0, st: s.stocks[p]!, lost: [], hit: 0, f0: f });
  if (f < S.f0 || f - S.f0 > 100000) { S.hp = S.tr = s.hp[p]!; S.st = s.stocks[p]!; S.f0 = f; S.lost = []; }
  const hpN = Math.max(0, s.hp[p]!);
  if (hpN < S.hp - 0.5) { S.hit = now; S.trT = now + 0.45; } if (hpN > S.hp + 0.5) S.heal = now;
  S.hp = lerp(S.hp, hpN, 0.35); if (now > S.trT) S.tr = lerp(S.tr, S.hp, 0.08); if (S.tr < S.hp) S.tr = S.hp;
  const stocks = s.stocks[p]!; if (stocks < S.st) for (let i = stocks; i < S.st; i++) S.lost.push({ i, t: now }); S.st = stocks; S.lost = S.lost.filter(l => now - l.t < 0.9);
  const pw = 250, X = right ? x - pw : x, col = COLS[p % 8]!, ent = clamp((f - S.f0) / 30, 0, 1), ee = 1 - Math.pow(1 - ent, 3), hs = Math.max(0, 1 - (now - S.hit) / 0.35), sx = (rnd() - 0.5) * hs * 8, sy = (rnd() - 0.5) * hs * 5;
  c.save(); c.translate((right ? 1 : -1) * (1 - ee) * (pw + 60) + sx, sy);
  c.globalAlpha *= 0.92; const g = c.createLinearGradient(X, 0, X + pw, 0); g.addColorStop(right ? 1 : 0, hexA(col, 0.5)); g.addColorStop(right ? 0 : 1, 'rgba(4,5,11,.75)');
  c.fillStyle = 'rgba(4,5,11,.72)'; skw(c, X - 10, y - 22, pw + 20, 96, 14); c.fill(); c.fillStyle = g; skw(c, X - 10, y - 22, pw + 20, 24, 10); c.fill();
  c.fillStyle = col; if (right) c.fillRect(X + pw + 4, y - 22, 5, 96); else c.fillRect(X - 16, y - 22, 5, 96);
  if (hs > 0) { c.strokeStyle = 'rgba(255,255,255,' + hs + ')'; c.lineWidth = 2 + hs * 3; skw(c, X - 10, y - 22, pw + 20, 96, 14); c.stroke(); }
  const name = (s.cpu[p] ? 'CPU ' : 'P') + (p + 1);
  c.font = UFI(17); c.textAlign = right ? 'right' : 'left'; c.lineWidth = 4; c.strokeStyle = '#05060c'; c.strokeText(name, x, y - 4); c.fillStyle = '#fff'; c.fillText(name, x, y - 4);
  const ns = Math.min(stocks, 8);
  for (let i = 0; i < ns; i++) { const ix = right ? X + 6 + i * 13 : X + pw - 6 - i * 13, iy = y - 11, pu = 1 + 0.15 * Math.sin(now * 4 + i); c.save(); c.translate(ix, iy); c.rotate(Math.PI / 4); c.scale(pu, pu); c.fillStyle = col; c.fillRect(-4, -4, 8, 8); c.strokeStyle = '#fff'; c.lineWidth = 1.2; c.strokeRect(-4, -4, 8, 8); c.restore(); }
  if (stocks > 8) { c.font = UF(900, 11); c.fillStyle = '#fff'; c.textAlign = right ? 'left' : 'right'; c.fillText('x' + stocks, right ? X + 6 + 8 * 13 : X + pw - 6 - 8 * 13, y - 7); }
  for (const l of S.lost) { const u = (now - l.t) / 0.9, ix = right ? X + 6 + l.i * 13 : X + pw - 6 - l.i * 13; c.save(); c.globalAlpha = 1 - u; for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.6; c.fillStyle = k % 2 ? '#fff' : col; c.fillRect(ix + Math.cos(a) * u * 26 - 2, y - 11 + Math.sin(a) * u * 26 + u * u * 30 - 2, 4, 4); } c.font = UFI(14); c.textAlign = 'center'; c.fillStyle = '#ff5a7a'; c.fillText('-1', ix, y - 16 - u * 18); c.restore(); }
  const hf = hpN / T.HP, low = hf < 0.25, hc1 = hf > 0.5 ? '#7dff8a' : hf > 0.25 ? '#ffe066' : '#ff5a5a', hc2 = hf > 0.5 ? '#1fa64a' : hf > 0.25 ? '#c98a12' : '#a3121e';
  c.fillStyle = 'rgba(0,0,0,.55)'; skw(c, X, y + 2, pw, 16, 6); c.fill(); c.save(); skw(c, X, y + 2, pw, 16, 6); c.clip(); c.fillStyle = '#fff'; c.fillRect(X, y + 2, pw * clamp(S.tr / T.HP, 0, 1), 16); c.fillStyle = '#ff3d5a'; c.globalAlpha = 0.85; c.fillRect(X, y + 2, pw * clamp(S.tr / T.HP, 0, 1), 16); c.globalAlpha = 1; c.restore();
  sbar(c, X, y + 2, pw, 16, S.hp / T.HP, hc1, hc2, 6);
  if (low) { c.save(); c.globalAlpha = 0.35 + 0.35 * Math.sin(now * 9); c.strokeStyle = '#ff3d5a'; c.lineWidth = 3; skw(c, X, y + 2, pw, 16, 6); c.stroke(); c.restore(); }
  if (S.heal && now - S.heal < 0.5) { c.save(); c.globalAlpha = 1 - (now - S.heal) / 0.5; c.strokeStyle = '#9dffb0'; c.lineWidth = 3; skw(c, X, y + 2, pw, 16, 6); c.stroke(); c.restore(); }
  for (let i = 1; i < 4; i++) { c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(X + pw * i / 4, y + 2, 1.5, 16); }
  c.font = UFI(13); c.textAlign = 'center'; c.lineWidth = 3; c.strokeStyle = '#05060c'; const ht = Math.ceil(hpN) + ' HP'; c.strokeText(ht, X + pw / 2, y + 15); c.fillStyle = '#fff'; c.fillText(ht, X + pw / 2, y + 15);
  const sp = s.spirit[p]!, sr = sp >= T.SPELL_COST, sf = sp / T.SPIRIT_MAX, ult = s.ult[p]! > 0;
  if (ult) { const h = (now * 200) % 360; sbar(c, X, y + 22, pw, 10, sf, 'hsl(' + h + ',100%,70%)', 'hsl(' + (h + 60) % 360 + ',100%,45%)', 4); } else sbar(c, X, y + 22, pw, 10, sf, sr ? '#ffb0f8' : '#8ab4ff', sr ? '#d040c0' : '#3a5ad0', 4);
  for (let k = T.SPELL_COST; k < T.SPIRIT_MAX; k += T.SPELL_COST) { c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(X + pw * k / T.SPIRIT_MAX, y + 22, 1.5, 10); }
  if (sr || ult) { c.save(); skw(c, X, y + 22, pw * sf, 10, 4); c.clip(); const sw = ((now * 1.4) % 1.2) / 1.2 * pw * 1.4 - pw * 0.2, gg = c.createLinearGradient(X + sw - 40, 0, X + sw + 40, 0); gg.addColorStop(0, 'rgba(255,255,255,0)'); gg.addColorStop(0.5, 'rgba(255,255,255,.8)'); gg.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gg; c.fillRect(X, y + 22, pw, 10); c.restore(); }
  c.font = UF(900, 9); c.fillStyle = sr || ult ? '#05060c' : '#fff'; c.fillText(ult ? 'LAST WORD READY' : sr ? 'SPELL READY' : 'SPELL ' + Math.min(99, sp / T.SPELL_COST * 100 | 0) + '%', X + pw / 2, y + 30);
  for (let i = 0; i < T.DASH_CHARGES; i++) { const k = clamp(s.boost[p]! - i, 0, 1), xx = X + pw * 0.53 + i * 17; c.fillStyle = '#262a33'; skw(c, xx, y + 36, 14, 9, 3); c.fill(); c.fillStyle = k >= 1 ? '#fff' : '#8a8f9a'; c.save(); skw(c, xx, y + 36, 14, 9, 3); c.clip(); c.fillRect(xx, y + 36, 14 * k, 9); c.restore(); }
  for (let i = 0; i < T.PIPS; i++) { const on = i < s.pips[p]!; c.fillStyle = on ? '#ff5a6a' : '#3a2226'; skw(c, X + pw - (T.PIPS - i) * 15 + 3, y + 36, 12, 9, 3); c.fill(); if (on) { c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(X + pw - (T.PIPS - i) * 15 + 5, y + 36, 8, 3); } }
  c.fillStyle = '#8a8f9a'; c.font = UF(800, 7); c.fillText('DASH', X + pw * 0.53 + 25, y + 53); c.fillText('WALL', X + pw - 22, y + 53);
  c.textAlign = right ? 'right' : 'left'; c.font = UF(800, 10); c.fillStyle = LCOLS[p % 8]!;
  c.fillText(charOf(w, s, p).name.toUpperCase() + '   P ' + s.power[p]!.toFixed(1) + (s.pStk[p] ? '   ATK x' + Math.pow(1.3, s.pStk[p]!).toFixed(1) : ''), x, y + 63);
  const st = [s.blade[p]! > 0 ? 'BLADE ' + Math.ceil(s.blade[p]! / 60) + 's' : '', s.rifle[p] ? 'RIFLE x' + s.rifle[p] : '', s.bombs[p]! > 0 ? 'BOMBS ' + Math.ceil(s.bombs[p]! / 60) + 's' : '', s.mirror[p]! > 0 ? 'MIRROR ' + Math.ceil(s.mirror[p]! / 60) + 's' : '', s.giant[p]! > 0 ? 'GIANT ' + Math.ceil(s.giant[p]! / 60) + 's' : '', s.clone[p]! > 0 ? 'CLONE ' + Math.ceil(s.clone[p]! / 60) + 's' : '', s.cam[p] ? 'CAMERA x' + s.cam[p] : ''].filter(Boolean).join('  ');
  if (st) { c.fillStyle = '#ffb0f0'; c.font = UF(800, 9); c.fillText(st.slice(0, 48), x, y + 73); }
  c.restore();
}

/** Legacy HUD placement (<= 4 players, no touch): panels on the screen edges, scaled with the window width. */
export function drawHud(c: CanvasRenderingContext2D, w: World, s: CombatState, W: number, H: number, now: number): void {
  const hk = Math.min(1, W / 1280 + 0.1);
  c.save(); c.globalAlpha = 0.85; c.scale(hk, hk);
  for (let p = 0; p < s.n; p++) drawHudPanel(c, w, s, p, (p % 2 ? W - 12 : 12) / hk, p % 2 === 1, (p < 2 ? 30 : H - 100) / hk, now);
  c.restore();
}
