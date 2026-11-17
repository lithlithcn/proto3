import { UFI, clamp, type UiCtx } from './core';

/** Screen transition (legacy uiTrans, line ~3835): three oblique bands sweep across for 0.55 s whenever the screen key changes (not game -> game). */
export const UIT = { key: '', t0: -9, acc: '#ff3355', lab: '' };
/** Entry time of the current screen (cards slide in from it; legacy UISUB.t0). */
export const UISUB = { t0: 0 };
export const LABELS: Record<string, string> = { menu: 'MENU', game: 'FIGHT!', items: 'ITEMS', binds: 'CONTROLS', info: 'GUIDE', maker: 'MAP MAKER', online: 'ONLINE', title: 'SHMUP FIGHTER' };

/** `key` = mode, or 'sub:<title>' for sub-menus (label = the title upper-cased). Returns true when the key just changed (sub-menus restart their entry anim). */
export function uiTrans(u: UiCtx, key: string, label: string): boolean {
  let changed = false;
  if (key !== UIT.key) { const from = UIT.key; UIT.key = key; if (from && !(from === 'game' && key === 'game')) UIT.t0 = u.now; UIT.acc = u.acc; UIT.lab = label; UISUB.t0 = u.now; changed = true; }
  const p0 = (u.now - UIT.t0) / 0.55; if (p0 < 0 || p0 > 1) return changed;
  const { c, W, H } = u; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const cols = ['#05060c', UIT.acc, '#05060c'], bh = H / 3 + 2, sk = H * 0.18;
  for (let i = 0; i < 3; i++) {
    const p = clamp(p0 * 1.45 - i * 0.13, 0, 1), e = p < 0.5 ? 1 - Math.pow(1 - p * 2, 3) : 1 + Math.pow((p - 0.5) * 2, 3), x = W * 1.15 - e * W * 1.25, y = i * (H / 3);
    c.fillStyle = cols[i]!; c.beginPath(); c.moveTo(x + sk, y); c.lineTo(x + W * 1.25 + sk, y); c.lineTo(x + W * 1.25, y + bh); c.lineTo(x, y + bh); c.fill();
    c.fillStyle = i === 1 ? '#fff' : UIT.acc; c.fillRect(x + sk * 0.5, y + (i === 1 ? 0 : bh - 4), W * 1.25, 4);
    if (i === 1 && UIT.lab) { c.font = UFI(bh * 0.55); c.textAlign = 'left'; c.fillStyle = '#05060c'; c.fillText(UIT.lab, x + W * 0.32, y + bh * 0.7); }
  }
  c.restore(); return changed;
}
