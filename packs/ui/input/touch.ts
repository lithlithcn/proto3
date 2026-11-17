import { BTN } from '@kernel';
import { TAU, type Hot, type UiCtx } from '../core';

/** Touch controls (legacy TCH / tBtns / tJoy / uiTS-uiTM-uiTE / tDraw, line ~139): floating left stick, right thumb pad (ATK / DASH / HEAVY /
 *  PARRY around it, FOCUS, SKILL 1, SKILL 2, SPELL, AUTO-fire toggle, pause), swipe to scroll menus, tap = click, pause / results buttons.
 *  The touch player is the first human. */
export const TCH = { on: false, joy: null as null | { id: number; x0: number; y0: number; x: number; y: number }, jx: 0, jy: 0, b: {} as Record<string, number>, ids: new Map<number, { k: string | null }>(), auto: true, sy: null as number | null };
interface TBtn { k: string; x: number; y: number; r: number; l: string; c: string; tog?: 1 }
const tU = (W: number, H: number): number => Math.min(W, H) / 7.2;
export function tBtns(W: number, H: number): TBtn[] {
  const u = tU(W, H), cx = W - 2.1 * u, cy = H - 2.05 * u, s = 1.25 * u, r = 0.68 * u, y2 = H - 4.6 * u;
  return [{ k: 'melee', x: cx + s, y: cy, r: r * 1.12, l: 'ATK', c: '#ff6a6a' }, { k: 'dash', x: cx, y: cy + s * 0.85, r, l: 'DASH', c: '#6cf' }, { k: 'heavy', x: cx - s, y: cy, r, l: 'HEAVY', c: '#ffa63a' }, { k: 'parry', x: cx, y: cy - s * 0.85, r, l: 'PARRY', c: '#6ff' },
    { k: 'focus', x: cx - s * 2.1, y: cy + s * 0.6, r: r * 0.78, l: 'FOCUS', c: '#ddd' }, { k: 'prev', x: cx - s * 2.1, y: cy - s * 0.7, r: r * 0.62, l: 'SKILL 1', c: '#c9f' },
    { k: 'burst', x: W - 3.6 * u, y: y2, r: 0.55 * u, l: 'SKILL 2', c: '#fc4' }, { k: 'spell', x: W - 2.3 * u, y: y2, r: 0.55 * u, l: 'SPELL', c: '#f8f' }, { k: 'shot', x: W - 1 * u, y: y2, r: 0.5 * u, l: 'AUTO', c: '#8f8', tog: 1 },
    { k: 'pause', x: W / 2, y: H - 0.6 * u, r: 0.42 * u, l: 'II', c: '#fff', tog: 1 }];
}
/** Pause / results buttons (legacy tOvB). */
const ovB = (W: number, H: number, paused: boolean): { x: number; y: number; w: number; h: number; l: string; ev: 'ok' | 'back' }[] => { const u = tU(W, H); return [{ x: W / 2 - 3.1 * u, y: H * 0.62, w: 2.9 * u, h: u, l: paused ? 'RESUME' : 'REMATCH', ev: 'ok' }, { x: W / 2 + 0.2 * u, y: H * 0.62, w: 2.9 * u, h: u, l: 'MENU', ev: 'back' }]; };
function tHit(W: number, H: number, x: number, y: number): TBtn | null { let best: TBtn | null = null, bd = 1e9; for (const b of tBtns(W, H)) { const d = Math.hypot(x - b.x, y - b.y); if (d < b.r * 1.3 && d < bd) { bd = d; best = b; } } return best; }
function tSync(): void { const nb: Record<string, number> = {}; for (const t of TCH.ids.values()) if (t.k) nb[t.k] = 1; for (const k in nb) if (!TCH.b[k] && navigator.vibrate) try { navigator.vibrate(8); } catch { /* no vibration */ } TCH.b = nb; }
function tJoy(W: number, H: number, t: Touch): void {
  const j = TCH.joy!, R = tU(W, H) * 1.1; let dx = t.clientX - j.x0, dy = t.clientY - j.y0, l = Math.hypot(dx, dy);
  if (l > R * 1.4) { j.x0 += dx / l * (l - R * 1.4); j.y0 += dy / l * (l - R * 1.4); dx = t.clientX - j.x0; dy = t.clientY - j.y0; l = Math.hypot(dx, dy); } // the base follows the thumb
  const k = l < R * 0.18 ? 0 : Math.min(1, l / R) / l; TCH.jx = dx * k; TCH.jy = dy * k; j.x = t.clientX; j.y = t.clientY;
}
/** Fight input of the touch player (merged into the first human's device reading). */
export function touchInput(): { x: number; y: number; b: number } {
  let b = 0; for (const k in TCH.b) if (k in BTN) b |= BTN[k as keyof typeof BTN]; if (TCH.auto) b |= BTN.shot;
  return { x: TCH.joy ? TCH.jx : 0, y: TCH.joy ? TCH.jy : 0, b };
}
export interface TouchHost { mode(): string; paused(): boolean; over(): boolean; hot(): Hot[]; nav(ev: string): void; pause(): void; sfx(n: string, v?: number): void; unlock(): void; noTouch(): boolean; infoScroll(dy: number): void; W(): number; H(): number }
const UT = new Map<number, { x0: number; y0: number; y: number; acc: number; mv: number }>();
const at = (hot: Hot[], x: number, y: number): Hot | undefined => hot.find(r => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
function fsTry(): void { try { const d = document.documentElement; if (!document.fullscreenElement && d.requestFullscreen) d.requestFullscreen().then(() => { try { (screen.orientation as ScreenOrientation & { lock?(o: string): Promise<void> }).lock?.('landscape').catch(() => {}); } catch { /* no lock */ } }).catch(() => {}); } catch { /* not allowed */ } }
/** Installs the touch listeners (call once). */
export function installTouch(h: TouchHost): void {
  addEventListener('touchstart', e => {
    TCH.on = true; h.unlock(); e.preventDefault(); const W = h.W(), H = h.H();
    for (const t of Array.from(e.changedTouches)) {
      const x = t.clientX, y = t.clientY; if (TCH.joy && t.identifier === TCH.joy.id || TCH.ids.has(t.identifier)) continue;
      if (h.mode() !== 'game') { if (h.noTouch()) continue; TCH.sy = y; if (h.mode() !== 'info') { const hh = at(h.hot(), x, y); hh?.hover(); UT.set(t.identifier, { x0: x, y0: y, y, acc: 0, mv: 0 }); continue; } const hh = at(h.hot(), x, y); if (hh) { hh.hover(); hh.click(x, y); fsTry(); } continue; }
      if (h.paused() && h.hot().length) { const hh = at(h.hot(), x, y); if (hh) { hh.hover(); hh.click(x, y); continue; } }
      if (h.over()) { const o = ovB(W, H, h.paused()).find(r => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h); if (o) h.nav(o.ev); continue; }
      const b = tHit(W, H, x, y);
      if (b && b.tog) { if (b.k === 'shot') { TCH.auto = !TCH.auto; h.sfx('move', 0.6); } else h.pause(); continue; }
      if (!b && !TCH.joy && x < W * 0.5 && y > H * 0.15) { TCH.joy = { id: t.identifier, x0: x, y0: y, x, y }; TCH.jx = TCH.jy = 0; continue; }
      TCH.ids.set(t.identifier, { k: b ? b.k : null });
    }
    tSync();
  }, { passive: false });
  addEventListener('touchmove', e => {
    e.preventDefault(); const W = h.W(), H = h.H();
    for (const t of Array.from(e.changedTouches)) {
      const u = UT.get(t.identifier); if (u) { const y = t.clientY; u.acc += y - u.y; u.y = y; if (Math.hypot(t.clientX - u.x0, y - u.y0) > 14) u.mv = 1; while (u.acc > 42) { h.nav('up'); u.acc -= 42; } while (u.acc < -42) { h.nav('down'); u.acc += 42; } continue; } // swipe = scroll the list
      if (h.mode() === 'info' && TCH.sy != null) { h.infoScroll(-(t.clientY - TCH.sy)); TCH.sy = t.clientY; continue; }
      if (TCH.joy && t.identifier === TCH.joy.id) { tJoy(W, H, t); continue; }
      const s = TCH.ids.get(t.identifier); if (s) { const b = tHit(W, H, t.clientX, t.clientY); s.k = b && !b.tog ? b.k : null; } // slide from one button to another
    }
    tSync();
  }, { passive: false });
  const end = (e: TouchEvent): void => {
    for (const t of Array.from(e.changedTouches)) {
      const u = UT.get(t.identifier); if (u) { UT.delete(t.identifier); if (!u.mv) { const hh = at(h.hot(), u.x0, u.y0); if (hh) { hh.hover(); hh.click(u.x0, u.y0); fsTry(); } } }
      if (TCH.joy && t.identifier === TCH.joy.id) { TCH.joy = null; TCH.jx = TCH.jy = 0; } TCH.ids.delete(t.identifier);
    }
    tSync();
  };
  addEventListener('touchend', end); addEventListener('touchcancel', end);
}
/** Overlay (legacy tDraw): turn-your-phone notice, pause/results buttons, stick + buttons with spell/skill gauges. `me` = the touch player. */
export function drawTouch(u: UiCtx, mode: string, paused: boolean, over: boolean, me: { spirit: number; ult: boolean } | null, spellCost: number, frame: number): void {
  if (!TCH.on) return; const { c, W, H } = u, s = tU(W, H); c.save(); c.textAlign = 'center'; c.textBaseline = 'middle';
  if (H > W) { c.fillStyle = 'rgba(0,0,0,.85)'; c.fillRect(0, 0, W, H); c.fillStyle = '#fff'; c.font = 'bold 22px monospace'; c.fillText('↻ Turn your phone sideways', W / 2, H / 2); c.restore(); return; }
  if (mode === 'game' && (over || paused)) { if (over) for (const r of ovB(W, H, paused)) { c.fillStyle = 'rgba(255,255,255,.15)'; c.fillRect(r.x, r.y, r.w, r.h); c.strokeStyle = '#fff'; c.lineWidth = 2; c.strokeRect(r.x, r.y, r.w, r.h); c.fillStyle = '#fff'; c.font = 'bold ' + (s * 0.38 | 0) + 'px monospace'; c.fillText(r.l, r.x + r.w / 2, r.y + r.h / 2); } }
  else if (mode === 'game') {
    const j = TCH.joy, bx = j ? j.x0 : 1.8 * s, by = j ? j.y0 : H - 1.9 * s, R = s * 1.1; c.globalAlpha = j ? 0.4 : 0.13; c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.arc(bx, by, R, 0, TAU); c.stroke();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(bx + TCH.jx * R, by + TCH.jy * R, R * 0.45, 0, TAU); c.fill();
    for (const b of tBtns(W, H)) {
      const on = b.tog ? b.k === 'shot' && TCH.auto : TCH.b[b.k]; c.globalAlpha = on ? 0.45 : 0.13; c.fillStyle = b.c; c.beginPath(); c.arc(b.x, b.y, b.r, 0, TAU); c.fill(); c.globalAlpha = on ? 0.9 : 0.3; c.strokeStyle = b.c; c.lineWidth = 2; c.stroke();
      if (me && (b.k === 'spell' || b.k === 'burst')) { const f = b.k === 'spell' ? (me.ult ? 1 : me.spirit / spellCost) : 1, full = f >= 1; c.globalAlpha = 0.6; c.lineWidth = 3; c.strokeStyle = full ? '#fff' : b.c; c.beginPath(); c.arc(b.x, b.y, b.r + 3, -Math.PI / 2, -Math.PI / 2 + TAU * Math.min(1, f)); c.stroke(); if (full && (frame >> 3) % 2) { c.globalAlpha = 0.18; c.fillStyle = '#fff'; c.beginPath(); c.arc(b.x, b.y, b.r, 0, TAU); c.fill(); } }
      c.globalAlpha = on ? 1 : 0.8; c.fillStyle = '#fff'; c.font = 'bold ' + Math.max(10, b.r * 0.42 | 0) + 'px monospace'; c.fillText(b.k === 'spell' && me && me.ult ? 'LAST' : b.l, b.x, b.y);
    }
  }
  c.restore();
}
