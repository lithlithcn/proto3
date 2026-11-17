import { UF, UFI, clamp, hexA, lerp, skewRect, strokeTxt, type UiCtx } from '../../core';
import { uiBG } from '../../bg';
import { STOCKS, SET, allMaps } from '../../settings';
import { UISUB } from '../../trans';
import { hubFX, hubProfile } from './deco';
import { TXI } from '../../txi';
import { hubIcon } from './icons';

/** Main hub (legacy HUB + drawMenu, line ~3852, with its v3 graph navigation and hubFX/hubProfile wrappers): spell-card-like tiles. */
export const HUB = [
  { k: 'fight', t: 'FIGHT!', c: '#ff3355', d: 'Choose your shot, join with any pad or keyboard, then fight.' }, // legacy text as overridden by the character-select wrapper
  { k: 'online', t: 'ONLINE', c: '#29d4ff', d: 'Play with friends over the internet (2 to 32 players).' },
  { k: 'train', t: 'TRAINING', c: '#9dff3a', d: 'Practice freely: test every item, infinite lives, dummies.' },
  { k: 'rules', t: 'RULES', c: '#ffd23a', d: 'Fighters, CPUs, lives, timer, map, items, teams, tempo.' },
  { k: 'items', t: 'ITEMS', c: '#ff4fd8', d: 'Turn each item on or off.' },
  { k: 'maps', t: 'MAP MAKER', c: '#9b6bff', d: 'Build your own arenas: layers, music, rules, scripts, export.' },
  { k: 'opt', t: 'OPTIONS', c: '#7fa8ff', d: 'Sound, profiles, controls, effects.' },
  { k: 'help', t: 'HOW TO PLAY', c: '#ff9a3a', d: 'Tutorial and full guide.' },
] as const;
export type HubKey = (typeof HUB)[number]['k'];
export const UIHUB = { sel: 0, a: {} as Record<string, number>, desc: '', dt0: 0, bump: -9, bd: [0, 0] };
/** Neighbour graph (legacy HUBG): which tile each direction leads to. */
const HUBG: Record<number, Partial<Record<'l' | 'r' | 'u' | 'd', number>>> = { 0: { r: 1, d: 3 }, 1: { l: 0, d: 2 }, 2: { l: 0, u: 1, d: 6 }, 3: { u: 0, l: 7, r: 4 }, 4: { u: 0, l: 3, r: 5 }, 5: { u: 0, l: 4, r: 6 }, 6: { u: 2, l: 5, r: 7 }, 7: { u: 2, l: 6, r: 3 } };

/** Big card left, two cards right, ribbon of small cards below. `sb` = width taken by the music sidebar. */
export function hubLayout(W: number, H: number, sb: number): { i: number; x: number; y: number; w: number; h: number; rot: number; big?: 1 }[] {
  const m = Math.min(W - sb, H * 1.9), x0 = sb + (W - sb) / 2 - m * 0.47, y0 = H * 0.17, ch = H * 0.5, R: { i: number; x: number; y: number; w: number; h: number; rot: number; big?: 1 }[] = [];
  R.push({ i: 0, x: x0, y: y0, w: m * 0.52, h: ch, rot: -0.035, big: 1 }); R.push({ i: 1, x: x0 + m * 0.55, y: y0, w: m * 0.39, h: ch * 0.48, rot: 0.025 }); R.push({ i: 2, x: x0 + m * 0.53, y: y0 + ch * 0.53, w: m * 0.39, h: ch * 0.47, rot: -0.02 });
  const n = 5, bw = m * 0.94 / n; for (let j = 0; j < n; j++) R.push({ i: 3 + j, x: x0 + j * bw + (j % 2 ? 6 : 0), y: y0 + ch + H * 0.05 + (j % 2 ? H * 0.018 : 0), w: bw - 14, h: H * 0.13, rot: j % 2 ? 0.03 : -0.03 });
  return R;
}
export function hubChips(): string[] {
  const M = allMaps()[SET.mapI] ?? allMaps()[0]!, cpu = SET.nP - SET.nH;
  return [SET.nP + ' FIGHTERS', cpu + ' CPU' + (cpu > 0 ? ' LV' + SET.cpuLv : ''), STOCKS[SET.stI] + ' LIVES', SET.timer ? SET.timer + ' MIN' : 'NO TIMER', M.name.toUpperCase().slice(0, 18), SET.comp ? 'COMPETITIVE' : SET.itemsOn ? 'ITEMS ON' : 'ITEMS OFF', SET.teams ? 'TEAMS' : 'FREE FOR ALL'];
}
export interface HubHost { sb: number; touch: boolean; music: boolean; audioLocked: boolean; sfx(n: string, v?: number, r?: number): void; go(k: HubKey): void; pic(): void; nick(): void }

export function drawHub(u: UiCtx, h: HubHost): void {
  const { c, W, H } = u; u.hot.length = 0; const t = u.now, L = hubLayout(W, H, h.sb), S = UIHUB.sel = clamp(UIHUB.sel, 0, HUB.length - 1), cur = HUB[S]!; u.acc = cur.c;
  uiBG(u, cur.t.replace('!', '') + '  ', () => hubFX(u)); const tin = u.now - UISUB.t0;
  c.save(); c.textAlign = 'left'; c.translate(h.sb + W * 0.035, H * 0.085); c.rotate(-0.04); c.font = UFI(H * 0.055); strokeTxt(c, 'SHMUP FIGHTER', 0, 0, 7, '#05060c', '#fff'); c.font = UF(800, H * 0.018); c.fillStyle = cur.c; c.fillText('TOUHOU DANMAKU BRAWLER', 4, H * 0.03); c.restore();
  L.forEach((r, j) => {
    const it = HUB[r.i]!, sel = r.i === S, A = UIHUB.a[it.k] = lerp(UIHUB.a[it.k] || 0, sel ? 1 : 0, 0.22), ent = clamp((tin - j * 0.05) / 0.35, 0, 1), ee = 1 - Math.pow(1 - ent, 3); if (ent <= 0) return;
    const cx = r.x + r.w / 2, cy = r.y + r.h / 2, sc = (1 + A * 0.045) * (0.85 + 0.15 * ee), bob = sel ? Math.sin(t * 3) * 3 : 0, k = r.h * 0.18;
    c.save(); c.globalAlpha = ee; c.translate(cx + (1 - ee) * -60, cy + bob); c.rotate(r.rot * (1 + A * 0.4)); c.scale(sc, sc);
    c.shadowColor = sel ? it.c : 'rgba(0,0,0,.6)'; c.shadowBlur = sel ? 30 : 12; c.shadowOffsetY = sel ? 0 : 8; c.fillStyle = '#05060c'; skewRect(c, -r.w / 2 - 4, -r.h / 2 - 4, r.w + 8, r.h + 8, k); c.fill(); c.shadowBlur = 0; c.shadowOffsetY = 0;
    const g = c.createLinearGradient(-r.w / 2, -r.h / 2, r.w / 2, r.h / 2); g.addColorStop(0, it.c); g.addColorStop(1, hexA(it.c, 0.55 + A * 0.3)); c.fillStyle = g; skewRect(c, -r.w / 2, -r.h / 2, r.w, r.h, k); c.fill();
    c.save(); skewRect(c, -r.w / 2, -r.h / 2, r.w, r.h, k); c.clip(); c.globalAlpha = 0.16; c.fillStyle = '#000';
    for (let q = -8; q < 12; q++) { const xx = -r.w / 2 + q * r.h * 0.32 + ((t * (sel ? 60 : 15)) % (r.h * 0.32)); c.beginPath(); c.moveTo(xx, -r.h / 2); c.lineTo(xx + r.h * 0.14, -r.h / 2); c.lineTo(xx + r.h * 0.14 - r.h * 0.4, r.h / 2); c.lineTo(xx - r.h * 0.4, r.h / 2); c.fill(); }
    c.globalAlpha = 1; c.fillStyle = 'rgba(5,6,12,' + (0.55 - A * 0.25) + ')'; skewRect(c, -r.w / 2 + r.w * 0.04, r.h * 0.12, r.w * 0.92, r.h * 0.34, k * 0.5); if (r.big) c.fill();
    if (sel) { const sw = ((t * 0.8) % 1.6) / 1.6, sx = -r.w / 2 + sw * (r.w * 1.6) - r.w * 0.3, gg = c.createLinearGradient(sx - 60, 0, sx + 60, 0); gg.addColorStop(0, 'rgba(255,255,255,0)'); gg.addColorStop(0.5, 'rgba(255,255,255,.35)'); gg.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gg; c.fillRect(-r.w / 2, -r.h / 2, r.w, r.h); }
    c.restore();
    c.lineWidth = sel ? 4 : 2; c.strokeStyle = sel ? '#fff' : hexA('#ffffff', 0.25); skewRect(c, -r.w / 2, -r.h / 2, r.w, r.h, k); c.stroke();
    const is = r.big ? r.h * 0.3 : r.h * 0.42; hubIcon(c, it.k, r.big ? r.w * 0.28 : -r.w / 2 + k + is * 0.75, r.big ? -r.h * 0.18 : 0, is, 'rgba(5,6,12,.75)', u.now);
    c.textAlign = 'left'; let fs = r.big ? Math.min(r.h * 0.26, r.w * 0.2) : Math.min(r.h * 0.34, r.w * 0.12); c.font = UFI(fs); const tx = it.t; while (c.measureText(tx).width > r.w * (r.big ? 0.8 : 0.6) && fs > 8) { fs *= 0.9; c.font = UFI(fs); }
    const lx = r.big ? -r.w / 2 + r.w * 0.07 : -r.w / 2 + k + is * 1.6, ly = r.big ? -r.h * 0.06 : fs * 0.36; strokeTxt(c, tx, lx, ly, r.big ? 12 : 7, '#05060c', '#fff');
    if (r.big) {
      c.font = UF(800, Math.max(10, r.h * 0.045)); let xx = -r.w / 2 + r.w * 0.07, yy = r.h * 0.2;
      for (const ch of hubChips()) { const w = c.measureText(ch).width + 18; if (xx + w > r.w * 0.44) { xx = -r.w / 2 + r.w * 0.07; yy += r.h * 0.085; } c.fillStyle = sel ? '#fff' : 'rgba(255,255,255,.75)'; skewRect(c, xx, yy - r.h * 0.055, w, r.h * 0.07, 6); c.fill(); c.fillStyle = '#05060c'; c.fillText(ch, xx + 9, yy); xx += w + 8; }
      if (sel) { c.font = UFI(r.h * 0.06); c.fillStyle = '#fff'; c.fillText('>>>'.slice(0, 1 + ((t * 4 | 0) % 3)), r.w * 0.3, r.h * 0.42); }
    }
    c.restore();
    u.hot.push({ x: r.x, y: r.y, w: r.w, h: r.h, hover: () => { if (UIHUB.sel !== r.i) { UIHUB.sel = r.i; h.sfx('se_select00', 0.6); } }, click: () => { UIHUB.sel = r.i; hubGo(h); } });
  });
  // description bar (sliding text)
  if (UIHUB.desc !== cur.d) { UIHUB.desc = cur.d; UIHUB.dt0 = t; }
  const du = clamp((t - UIHUB.dt0) / 0.25, 0, 1), bh = H * 0.07; c.save(); c.fillStyle = 'rgba(5,6,12,.85)'; c.fillRect(0, H - bh, W, bh); c.fillStyle = cur.c; c.fillRect(0, H - bh, W, 3);
  c.textAlign = 'left'; c.font = UF(800, bh * 0.32); c.globalAlpha = du; c.fillStyle = '#fff'; c.fillText(cur.d, h.sb + W * 0.035 + (1 - du) * 30, H - bh * 0.38); c.globalAlpha = 1;
  { const hs = h.touch ? 'tap a card' : (h.music ? 'L1/R1 · Q/E: music · Select: pause · ' : '') + 'arrows / stick: move · Enter / A: open · Start: quick fight · Esc: title', dw = c.measureText(cur.d).width; c.textAlign = 'right'; c.font = '12px monospace'; c.fillStyle = '#999'; if (h.sb + W * 0.035 + dw + 24 < W * 0.97 - c.measureText(hs).width) c.fillText(hs, W * 0.97, H - bh * 0.38); }
  c.restore();
  if (h.audioLocked) { c.save(); c.textAlign = 'center'; c.font = '13px monospace'; c.fillStyle = '#f8f'; c.fillText('Press a key or click to enable sound', W / 2, H * 0.13); c.restore(); }
  if (!TXI) hubProfile(u, h.pic, h.nick); // hidden behind the text box
}
export function hubGo(h: HubHost): void { h.sfx('ok00'); h.go(HUB[UIHUB.sel]!.k); }
/** Directional move along the tile graph; a blocked direction bumps (legacy v3 hubMove). */
export function hubMove(h: HubHost, now: number, dx: number, dy: number): void {
  const g = HUBG[UIHUB.sel] ?? {}, k = dx > 0 ? 'r' : dx < 0 ? 'l' : dy > 0 ? 'd' : 'u', n = g[k];
  if (n !== undefined) { UIHUB.sel = n; h.sfx('se_select00', 0.6); } else { UIHUB.bump = now; UIHUB.bd = [dx, dy]; h.sfx('se_select00', 0.3, 0.7); }
}
