import type { UiCtx } from './core';

/** Text entry box (legacy txtInput / drawTXI v2, line ~2870 / 5000): keyboard typing on the canvas, a real <input> on touch devices (phone
 *  keyboard), OK / CANCEL buttons everywhere. While open it captures every key. */
interface Txi { title: string; val: string; max: number; cb(v: string | null): void; up: boolean; allow: RegExp; hint: string; t: number; sh: number; dom: HTMLInputElement | null }
export let TXI: Txi | null = null;
let burst = 0, sfx: (n: string, v?: number, r?: number) => void = () => {};
const geo = (W: number, H: number): { bw: number; bh: number; x: number; y: number } => { const bw = Math.min(620, W - 40), bh = 190; return { bw, bh, x: W / 2 - bw / 2, y: Math.min(H / 2 - bh / 2, H * 0.12 + 10) }; };
function end(ok: boolean): void { const T = TXI; if (!T) return; TXI = null; T.dom?.remove(); sfx(ok ? 'ok00' : 'cancel00'); T.cb(ok ? (T.val.trim() || null) : null); }
/** Opens the box. `touch` = use a real input (phone keyboard). */
export function txtInput(title: string, val: string, max: number, cb: (v: string | null) => void, o: { up?: boolean; allow?: RegExp; hint?: string; touch?: boolean; sfx?: typeof sfx; W?: number; H?: number } = {}): void {
  TXI?.dom?.remove(); if (o.sfx) sfx = o.sfx;
  const T: Txi = { title, val: val || '', max: max || 12, cb, up: !!o.up, allow: o.allow ?? /^[\w \-.!?'#&()+]$/, hint: o.hint ?? '', t: 0, sh: 0, dom: null }; TXI = T;
  if (!o.touch || typeof document === 'undefined') return;
  const i = document.createElement('input'); T.dom = i; i.value = T.val; i.maxLength = T.max; i.setAttribute('autocomplete', 'off'); i.setAttribute('autocorrect', 'off'); i.setAttribute('spellcheck', 'false'); if (T.up) i.setAttribute('autocapitalize', 'characters');
  i.style.cssText = 'position:fixed;z-index:30;background:#05060a;color:#ffd23a;border:2px solid #fff;outline:0;text-align:center;font:bold 20px monospace;border-radius:0;box-sizing:border-box;padding:0 8px';
  const g = geo(o.W ?? innerWidth, o.H ?? innerHeight); i.style.left = (g.x + 30) + 'px'; i.style.top = (g.y + 64) + 'px'; i.style.width = (g.bw - 60) + 'px'; i.style.height = '54px';
  i.oninput = () => { let v = ''; for (let ch of i.value) { if (T.up) ch = ch.toUpperCase(); if (T.allow.test(ch) && v.length < T.max) v += ch; } if (i.value !== v) i.value = v; if (v.length > T.val.length) sfx('se_select00', 0.55, 1.15 + Math.min(0.6, v.length * 0.05)); T.val = v; T.t = 0; };
  i.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); end(true); } else if (e.key === 'Escape') { e.preventDefault(); end(false); } });
  for (const ev of ['mousedown', 'pointerdown', 'touchstart', 'touchend', 'click', 'keydown', 'keyup', 'keypress']) i.addEventListener(ev, e => e.stopPropagation());
  document.body.appendChild(i); i.focus();
}
/** Keyboard typing while the box is open (canvas mode). Returns true when the key was consumed. */
export function txiKey(e: { key: string; target?: unknown }): boolean {
  const T = TXI; if (!T || T.dom && e.target === T.dom) return !!T;
  if (e.key === 'Enter') { end(true); return true; } if (e.key === 'Escape') { end(false); return true; }
  if (e.key === 'Backspace') { if (T.val.length) { T.val = T.val.slice(0, -1); sfx('se_select00', 0.45, 0.8); } else T.sh = 8; return true; }
  if (e.key && e.key.length === 1) { const c = T.up ? e.key.toUpperCase() : e.key; if (!T.allow.test(c) || T.val.length >= T.max) { T.sh = 8; sfx('cancel00', 0.25); return true; } T.val += c; T.t = 0; sfx('se_select00', 0.55, 1.15 + Math.min(0.6, T.val.length * 0.05)); burst = 8; }
  return true;
}
/** Draws the box over everything (and replaces the screen's hot regions). */
export function drawTXI(u: UiCtx): void {
  const T = TXI; if (!T) return; T.t++; u.hot.length = 0; const { c, W, H } = u, g = geo(W, H);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = 'rgba(5,6,12,.82)'; c.fillRect(0, 0, W, H);
  const x = g.x + (T.sh > 0 ? Math.sin(T.sh-- * 2.5) * 6 : 0), y = g.y; c.fillStyle = '#10121c'; c.fillRect(x, y, g.bw, g.bh); c.strokeStyle = '#ffd23a'; c.lineWidth = 2; c.strokeRect(x, y, g.bw, g.bh);
  c.textAlign = 'center'; c.fillStyle = '#fff'; c.font = 'bold ' + (g.bw < 420 ? 17 : 22) + 'px monospace'; c.fillText(T.title, W / 2, y + 40); c.fillStyle = '#05060a'; c.fillRect(x + 30, y + 64, g.bw - 60, 54); c.strokeStyle = burst > 0 ? '#fff' : '#555'; c.lineWidth = burst > 0 ? 3 : 1; c.strokeRect(x + 30, y + 64, g.bw - 60, 54); if (burst > 0) burst--;
  if (!T.dom) { c.font = 'bold 30px monospace'; c.fillStyle = '#ffd23a'; c.fillText(T.val + ((T.t >> 4) & 1 ? '_' : ' '), W / 2, y + 101); }
  c.font = '12px monospace'; c.fillStyle = '#888'; c.fillText((T.hint ? T.hint + '  ·  ' : '') + T.val.length + '/' + T.max + (T.dom ? '' : '  ·  Enter: OK  ·  Esc: cancel'), W / 2, y + 150); c.restore();
  const bw2 = Math.min(200, (g.bw - 30) / 2), by = g.y + g.bh + 12; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.textAlign = 'center'; c.font = 'bold 18px monospace';
  ([['✔ OK', '#ffd23a', true], ['✖ CANCEL', '#888', false]] as const).forEach(([lb, col, ok], k) => { const bx = W / 2 + (k ? 8 : -8 - bw2); c.fillStyle = '#10121c'; c.fillRect(bx, by, bw2, 46); c.strokeStyle = col; c.lineWidth = 2; c.strokeRect(bx, by, bw2, 46); c.fillStyle = col; c.fillText(lb, bx + bw2 / 2, by + 29); u.hot.push({ x: bx, y: by, w: bw2, h: 46, hover: () => {}, click: () => end(ok) }); });
  if (T.dom) { const d = T.dom; u.hot.push({ x: g.x, y: g.y, w: g.bw, h: g.bh, hover: () => {}, click: () => d.focus() }); }
  c.restore();
}
