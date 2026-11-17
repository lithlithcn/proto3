import { uiHeader, type UiCtx } from '../../core';
import { uiBG } from '../../bg';
import { ACTS, ACT_LABEL, BINDS, BTNS, keyName, padName, padOn, resetBinds, type Act } from '../../input/binds';
import type { Keys } from '../../input/devices';

/** Controls (legacy drawBinds0 + drawBinds + bind nav, line ~3797 / 270): keyboard P1/P2 and 4 pad columns, live test highlight, pad chord capture for Skill 2 / Spell. */
export const BIND = { row: 0, col: 0, wait: false, pv: null as boolean[] | null, combo: [] as number[] };
export interface BindsHost { keys: Keys; pads: Gamepad[]; mouseOn: boolean; sfx(n: string, v?: number, r?: number): void; nav(ev: 'ok' | 'back'): void; togMouse(): void; save(): void }
function drawPadTest(u: UiCtx, ps: Gamepad[], y: number): void {
  const c = u.c; c.textAlign = 'left'; c.font = '12px monospace';
  if (!ps.length) { c.fillStyle = '#f66'; c.fillText('No gamepad detected: press a button on your pad', 20, y); return; }
  ps.slice(0, 4).forEach((g, k) => { const on = padOn(g), acts = BTNS.filter(a => ([] as number[]).concat(BINDS.PAD[k]![a] ?? []).every(n => on.includes(n))); c.fillStyle = g.mapping === 'standard' ? '#6f6' : '#fc4';
    c.fillText(`Pad ${k + 1} [${g.mapping || 'NON-STANDARD'}] ${g.id.slice(0, 40)} : buttons ${on.map(n => padName(n, ps) + '(' + n + ')').join(' ') || '—'}  →  actions (Pad ${k + 1} config): ${acts.map(a => ACT_LABEL[a]).join(', ') || '—'}`, 20, y + k * 16); });
}
export function drawBinds(u: UiCtx, h: BindsHost): void {
  const { c, W, H } = u, ps = h.pads; u.acc = '#7fa8ff'; uiBG(u, 'CONTROLS  ');
  u.hot.length = 0; const cols = ['P1 keys', 'P2 keys', 'Pad 1', 'Pad 2', 'Pad 3', 'Pad 4'], cw = Math.min(175, (W - 210) / 6), x0 = 210 + cw / 2, y0 = 96, rh = Math.min(27, (H - 210) / ACTS.length);
  c.textAlign = 'center'; c.fillStyle = '#fff'; uiHeader(u, 'CONTROLS');
  c.textAlign = 'left'; c.font = '16px monospace'; c.fillStyle = '#aaa'; c.fillText('◀ Back', 20, 40); u.hot.push({ x: 10, y: 15, w: 120, h: 36, hover: () => {}, click: () => h.nav('back') });
  c.font = '13px monospace'; c.textAlign = 'center'; cols.forEach((t, j) => { c.fillStyle = j === BIND.col ? '#ffd23a' : '#888'; c.fillText(t, x0 + cw * j, y0); });
  ACTS.forEach((a, r) => {
    const y = y0 + 28 + r * rh; if (r === BIND.row) { c.fillStyle = '#222'; c.fillRect(10, y - rh * 0.7, W - 20, rh); }
    c.textAlign = 'right'; c.fillStyle = '#ccc'; c.fillText(ACT_LABEL[a], 200, y); c.textAlign = 'center';
    for (let j = 0; j < 6; j++) {
      const sel = r === BIND.row && j === BIND.col, pv = j >= 2 ? BINDS.PAD[j - 2]![a] : 0, v = j < 2 ? keyName(BINDS.KB[j]![a]) : r < 4 ? 'stick' : ([] as number[]).concat(pv ?? []).map(n => padName(n, ps)).join(' + ');
      c.fillStyle = sel ? (BIND.wait ? '#f55' : '#ffd23a') : '#fff'; c.fillText(sel && BIND.wait ? (BIND.combo.length ? padName(BIND.combo[0]!, ps) + ' + …' : '… press …') : v, x0 + cw * j, y);
      u.hot.push({ x: x0 + cw * (j - 0.5), y: y - rh * 0.7, w: cw, h: rh, hover: () => { if (!BIND.wait && (BIND.row !== r || BIND.col !== j)) { BIND.row = r; BIND.col = j; h.sfx('se_select00', 0.6); } }, click: () => h.nav('ok') });
    }
  });
  { const t = 'Mouse aim (P1): ' + (h.mouseOn ? 'ON — cursor aims, left = melee, right = heavy, middle = parry' : 'OFF') + '   [click / L-R / Q-E]'; c.textAlign = 'right'; c.font = 'bold 14px monospace'; c.fillStyle = h.mouseOn ? '#6f6' : '#aaa'; c.fillText(t, W - 20, 40); u.hot.push({ x: W - 20 - c.measureText(t).width, y: 22, w: c.measureText(t).width, h: 26, hover: () => {}, click: h.togMouse }); }
  drawPadTest(u, ps, H - 112); c.textAlign = 'center'; c.fillStyle = '#888'; c.font = '13px monospace';
  c.fillText(BIND.wait ? (BIND.col >= 2 && /burst|spell/.test(ACTS[BIND.row]!) ? 'Press 2 buttons (combo)' : 'Press the key or button') + ' · Esc: cancel' : 'Arrows / stick: move · Enter / A / click: change · Backspace / Y: reset · Esc / B: back', W / 2, H - 24);
  // live test: rows light up green
  c.save(); c.globalCompositeOperation = 'lighter';
  ACTS.forEach((a, r) => { const y = y0 + 28 + r * rh; for (let j = 0; j < 6; j++) { let on = false; if (j < 2) on = h.keys.has(BINDS.KB[j]![a]); else { const g = ps[j - 2]; if (g) { const o = padOn(g); on = ([] as number[]).concat(BINDS.PAD[j - 2]![a] ?? []).every(n => o.includes(n)); } } if (on) { c.fillStyle = 'rgba(90,255,120,.35)'; c.fillRect(x0 + cw * j - cw / 2 + 4, y - rh * 0.7, cw - 8, rh); } } });
  c.restore(); c.textAlign = 'center'; c.font = '12px monospace'; c.fillStyle = '#6f6'; c.fillText('TEST: press any key or button, its row lights up green  ·  keyboard columns also accept mouse buttons and the wheel', W / 2, H - 128);
}
/** Menu events on the controls screen. Returns true to leave. */
export function bindsNav(ev: string, h: BindsHost): boolean {
  if (ev === 'tabL' || ev === 'tabR') { if (!BIND.wait) h.togMouse(); return false; }
  if (BIND.wait) return false; const n = ACTS.length;
  if (ev === 'up' || ev === 'down') { BIND.row = (BIND.row + (ev === 'up' ? n - 1 : 1)) % n; h.sfx('se_select00', 0.6); }
  if (ev === 'left' || ev === 'right') { BIND.col = (BIND.col + (ev === 'left' ? 5 : 1)) % 6; h.sfx('se_select00', 0.6); }
  if (ev === 'ok' && !(BIND.col >= 2 && BIND.row < 4)) { BIND.wait = true; BIND.pv = null; BIND.combo = []; h.sfx('ok00'); }
  if (ev === 'reset') { resetBinds(); h.save(); h.sfx('cancel00'); }
  if (ev === 'back') { h.sfx('cancel00'); return true; }
  return false;
}
/** While waiting: a key / mouse button / wheel goes to a keyboard column (Esc cancels). Returns true when consumed. */
export function bindKey(code: string, h: BindsHost): boolean {
  if (!BIND.wait) return false;
  if (code === 'Escape') { BIND.wait = false; h.sfx('cancel00'); return true; }
  if (BIND.col < 2) { BINDS.KB[BIND.col]![ACTS[BIND.row]!] = code; BIND.wait = false; h.save(); h.sfx('ok00'); }
  return true;
}
/** Once per frame while waiting on a pad column: newly pressed buttons are assigned (Spell needs a 2-button chord). */
export function bindPadTick(h: BindsHost): void {
  if (!BIND.wait || BIND.col < 2) return; const gp = h.pads[BIND.col - 2] ?? h.pads[0]; if (!gp) return;
  const now = gp.buttons.map(x => x.pressed), a: Act = ACTS[BIND.row]!, cb = a === 'spell';
  if (BIND.pv) for (let n = 0; n < now.length && BIND.wait; n++) if (now[n] && !BIND.pv[n]) { if (cb && !BIND.combo.includes(n)) BIND.combo.push(n); if (!cb || BIND.combo.length === 2) { BINDS.PAD[BIND.col - 2]![a] = cb ? BIND.combo.slice() : n; BIND.wait = false; h.save(); h.sfx('ok00'); } }
  BIND.pv = now;
}
