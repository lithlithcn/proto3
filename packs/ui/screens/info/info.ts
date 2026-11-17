import { COLS, LCOLS } from '@pack/render/colors';
import { backBtn, uiHeader, wrapT, type UiCtx } from '../../core';
import { uiBG } from '../../bg';
import { bindInfo, buildInfo } from '../../ld/info';

/** Guide (legacy drawInfo + nav, line ~3780 / 263): paged text with scroll, an animated diagram per page (verbatim art in ld/info.ts). */
type Page = { t: string; l: string[]; d(t: number, w: number, h: number): void; it?: { k: string }[] };
let INFOS: Page[] = [], built: unknown = null;
/** Pages for this item catalog (rebuilt when the catalog changes). */
const pages = (items: unknown[]): Page[] => { if (built !== items) { built = items; INFOS = buildInfo(items) as Page[]; } return INFOS; };
export const GUIDE = { p: 0, scr: 0, max: 0 };
export interface InfoHost { nav(ev: 'left' | 'right' | 'back'): void; test(k: string): void; items: { k: string; name: string; c: string; d: string; ch: string }[]; frame: number }
export function drawInfo(u: UiCtx, h: InfoHost, nowS: number): void {
  const { c, W, H } = u; u.acc = '#ff9a3a'; uiBG(u, 'GUIDE  ');
  u.hot.length = 0; pages(h.items); const pg = INFOS[GUIDE.p]!, t = nowS, s = Math.min(W / 1280, H / 720), side = W / H > 1.2;
  let bw: number, bh: number, bx: number, by: number;
  if (side) { bw = Math.min(W * 0.5, (H - 230 * s) * 520 / 340); bh = bw * 340 / 520; bx = W - bw - 50 * s; by = (H - bh) / 2 + 10 * s; } else { bw = W - 80; bh = Math.min(H * 0.45, bw * 340 / 520); bw = bh * 520 / 340; bx = (W - bw) / 2; by = H - bh - 90 * s; }
  uiHeader(u, 'HOW TO PLAY'); c.textAlign = 'center';
  const tx = 50 * s, tw = (side ? bx - 50 * s : W - 50 * s) - tx, ty = side ? by : 110 * s;
  c.textAlign = 'left'; c.font = 'bold ' + (32 * s | 0) + 'px monospace'; c.fillStyle = '#ffd23a'; c.fillText((GUIDE.p + 1) + '/' + INFOS.length + '  ' + pg.t, tx, ty + 30 * s);
  c.font = (21 * s | 0) + 'px monospace'; c.fillStyle = '#fff'; const top = ty + 52 * s, bot = H - 78 * s; c.save(); c.beginPath(); c.rect(tx - 4, top, tw + 8, bot - top); c.clip(); let y = ty + 82 * s - GUIDE.scr;
  for (const l of pg.l) { for (const ln of wrapT(c, l, tw)) { c.fillText(ln, tx, y); y += 30 * s; } y += 8 * s; }
  c.restore(); GUIDE.max = Math.max(0, y + GUIDE.scr - bot + 10 * s); GUIDE.scr = Math.min(GUIDE.scr, GUIDE.max);
  if (GUIDE.max > 0) { const hh = (bot - top) * (bot - top) / (bot - top + GUIDE.max); c.fillStyle = '#333'; c.fillRect(tx + tw + 8, top, 5, bot - top); c.fillStyle = '#ffd23a'; c.fillRect(tx + tw + 8, top + (bot - top - hh) * GUIDE.scr / GUIDE.max, 5, hh);
    if (GUIDE.scr < GUIDE.max) { c.fillStyle = '#ffd23a'; c.font = (15 * s | 0) + 'px monospace'; c.fillText('▼ scroll (wheel / drag / Up-Down)', tx, bot + 18 * s); } }
  c.fillStyle = '#0d0f16'; c.fillRect(bx, by, bw, bh); c.strokeStyle = '#333'; c.lineWidth = 2; c.strokeRect(bx, by, bw, bh);
  c.save(); c.beginPath(); c.rect(bx, by, bw, bh); c.clip(); c.translate(bx, by); c.scale(bw / 520, bh / 340); bindInfo({ ctx: c, COLS, LCOLS, frame: h.frame }); pg.d(t, 520, 340); c.restore();
  if (pg.it) pg.it.forEach((it, i) => { const cx = bx + bw * (0.2 + (i % 3) * 0.3), cy = by + bh * (i < 3 ? 0.3 : 0.7); u.hot.push({ x: cx - bw * 0.14, y: cy - bh * 0.12, w: bw * 0.28, h: bh * 0.3, hover: () => {}, click: () => h.test(it.k) }); });
  backBtn(u, () => h.nav('back')); c.font = (24 * s | 0) + 'px monospace'; c.fillStyle = '#ffd23a'; c.textAlign = 'left'; c.fillText('◀ Prev', 50 * s, H - 36 * s); c.textAlign = 'right'; c.fillText('Next ▶', W - 50 * s, H - 36 * s);
  u.hot.push({ x: 30 * s, y: H - 70 * s, w: 160 * s, h: 50 * s, hover: () => {}, click: () => h.nav('left') }, { x: W - 190 * s, y: H - 70 * s, w: 160 * s, h: 50 * s, hover: () => {}, click: () => h.nav('right') });
  c.textAlign = 'center'; c.fillStyle = '#888'; c.font = (15 * s | 0) + 'px monospace'; c.fillText('Left/Right: page · Esc / B: back', W / 2, H - 36 * s);
}
/** Returns true to leave the guide. */
export function infoNav(ev: string, sfx: (n: string, v?: number) => void, items: unknown[]): boolean {
  pages(items);
  if (ev === 'back') { sfx('cancel00'); return true; }
  if (ev === 'up' || ev === 'down') { GUIDE.scr = Math.max(0, Math.min(GUIDE.max, GUIDE.scr + (ev === 'up' ? -60 : 60))); return false; }
  if (ev === 'left') GUIDE.p = (GUIDE.p + INFOS.length - 1) % INFOS.length; if (ev === 'right' || ev === 'ok') GUIDE.p = (GUIDE.p + 1) % INFOS.length;
  GUIDE.scr = 0; sfx('se_select00', 0.6); return false;
}
