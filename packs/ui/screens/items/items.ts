import { backBtn, uiHeader, wrapT, type UiCtx } from '../../core';
import { uiBG } from '../../bg';
import { SET } from '../../settings';

/** Item list (legacy drawItemsMenu + its nav, line ~3699 / 259): two columns of 8 per page, ON/OFF per item, TEST button, page arrows. */
export interface CatItem { k: string; name: string; c: string; d: string; ch: string }
export const IM = { sel: 0 };
export interface ItemsHost { items: CatItem[]; frame: number; sfx(n: string, v?: number, r?: number): void; nav(ev: 'ok' | 'back'): void; test(k: string): void }
const rainbow = (f: number): string => `hsl(${f * 6 % 360},100%,65%)`;
export function drawItems(u: UiCtx, h: ItemsHost): void {
  const { c, W, H } = u, I = h.items; u.acc = '#ff4fd8'; uiBG(u, 'ITEMS  ');
  u.hot.length = 0; c.textAlign = 'center'; c.fillStyle = '#fff'; uiHeader(u, 'ITEMS');
  c.font = '14px monospace'; c.fillStyle = SET.itemsOn ? '#9f9' : '#f88'; c.fillText(SET.itemsOn ? 'Items are ON (change it in RULES)' : 'Items are OFF: the center card always gives the LAST WORD', W / 2, 86);
  const per = 16, pg = Math.floor(IM.sel / per), np = Math.ceil(I.length / per), rows = 8, cw = Math.min(620, (W - 60) / 2), sp = Math.min(62, (H - 210) / rows);
  I.slice(pg * per, pg * per + per).forEach((it, j) => {
    const i = pg * per + j, x = j < rows ? W / 2 - 10 - cw : W / 2 + 10, y = 128 + (j % rows) * sp, sel = i === IM.sel, col = it.c === 'rainbow' ? rainbow(h.frame) : it.c, on = SET.itemOn[it.k] !== false;
    if (sel) { c.fillStyle = '#222'; c.fillRect(x, y - 26, cw, sp - 4); }
    c.fillStyle = col; c.fillRect(x + 10, y - 18, 18, 28); c.textAlign = 'left'; c.font = 'bold 16px monospace'; c.fillStyle = sel ? '#ffd23a' : '#fff'; c.fillText(it.name, x + 40, y);
    if (it.ch) { const w = c.measureText(it.name).width; c.font = '12px monospace'; c.fillStyle = '#888'; c.fillText('(' + it.ch + ')', x + 48 + w, y); }
    if (sp >= 34) { c.font = '11px monospace'; c.fillStyle = '#aaa'; const wl = wrapT(c, it.d, cw - 110); c.fillText(wl[0]! + (wl.length > 1 ? '…' : ''), x + 40, y + 16); }
    c.textAlign = 'right'; c.font = 'bold 16px monospace'; c.fillStyle = on ? '#6f6' : '#f55'; c.fillText(on ? 'ON' : 'OFF', x + cw - 10, y);
    c.fillStyle = sel ? '#6ff' : '#488'; c.fillText('▶TEST', x + cw - 56, y); u.hot.push({ x: x + cw - 130, y: y - 26, w: 76, h: sp - 4, hover: () => { IM.sel = i; }, click: () => h.test(it.k) });
    u.hot.push({ x, y: y - 26, w: cw, h: sp - 4, hover: () => { if (IM.sel !== i) { IM.sel = i; h.sfx('se_select00', 0.6); } }, click: () => h.nav('ok') });
  });
  backBtn(u, () => h.nav('back')); c.textAlign = 'center'; c.fillStyle = '#ffd23a'; c.font = '15px monospace'; c.fillText('Page ' + (pg + 1) + '/' + np + '  ◀ ▶', W / 2, H - 50);
  { const bw = Math.max(56, H * 0.08), by = H - 50 - bw * 0.62; ([[-1, W / 2 - 150 - bw], [1, W / 2 + 150]] as const).forEach(([d, x]) => { c.fillStyle = 'rgba(10,12,22,.85)'; c.fillRect(x, by, bw, bw * 0.8); c.strokeStyle = '#ffd23a'; c.lineWidth = 2; c.strokeRect(x, by, bw, bw * 0.8); c.fillStyle = '#ffd23a'; c.textAlign = 'center'; c.font = 'bold ' + Math.round(bw * 0.4) + 'px monospace'; c.fillText(d < 0 ? '◀' : '▶', x + bw / 2, by + bw * 0.55);
    u.hot.push({ x, y: by, w: bw, h: bw * 0.8, hover: () => {}, click: () => { const n = I.length, np2 = Math.ceil(n / 16); IM.sel = Math.min(n - 1, ((((IM.sel / 16 | 0) + d) % np2 + np2) % np2) * 16); h.sfx('se_select00', 0.6); } }); }); }
  c.fillStyle = '#888'; c.font = '13px monospace'; c.fillText('Up/Down: select · Left/Right: page · Enter / A / click: toggle · Y / Backspace: all ON/OFF · T / Start: TEST · Esc / B: back', W / 2, H - 24);
}
/** Legacy items nav: 2-column grid paging, toggle, all on/off. Returns true to leave the screen. */
export function itemsNav(ev: string, h: ItemsHost): boolean {
  const I = h.items, n = I.length, pg = IM.sel / 16 | 0, j = IM.sel % 16, col = j >= 8, row = j % 8, np = Math.ceil(n / 16), at = (p: number, cc: boolean, r: number): number => Math.min(n - 1, ((p + np) % np) * 16 + (cc ? 8 : 0) + r);
  if (ev === 'up' || ev === 'down') { let r = (row + (ev === 'up' ? 7 : 1)) % 8; while (at(pg, col, r) !== pg * 16 + (col ? 8 : 0) + r && r > 0) r--; IM.sel = at(pg, col, r); h.sfx('se_select00', 0.6); }
  if (ev === 'left') { IM.sel = col ? at(pg, false, row) : at(pg - 1, true, row); h.sfx('se_select00', 0.6); }
  if (ev === 'right') { IM.sel = !col && pg * 16 + 8 + row < n ? at(pg, true, row) : at(pg + 1, false, row); h.sfx('se_select00', 0.6); }
  if (ev === 'tabL' || ev === 'tabR') { IM.sel = at(pg + (ev === 'tabL' ? -1 : 1), false, 0); h.sfx('se_select00', 0.6); }
  if (ev === 'ok') { const k = I[IM.sel]!.k; SET.itemOn[k] = SET.itemOn[k] === false; h.sfx('se_changeitem', 0.6); }
  if (ev === 'reset') { const all = I.every(i => SET.itemOn[i.k] !== false); for (const i of I) SET.itemOn[i.k] = !all; h.sfx('se_changeitem', 0.6); }
  if (ev === 'start') { h.test(I[IM.sel]!.k); return false; }
  if (ev === 'back') { h.sfx('cancel00'); return true; }
  return false;
}
