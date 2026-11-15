import { CARD_ULT, MAXP, T, TAU, itemPool, type CombatState } from '@pack/combat/api';
import type { World } from '@kernel';
import { COLS } from './colors';

/** Legacy drawItem: a pickup card (dashed ring until armed, rotating square when armed, one capture ring per player, CONTESTED). The Last Word card ('rainbow') cycles colour. */
export function drawCards(c: CanvasRenderingContext2D, w: World, s: CombatState): void {
  const f = s.gf, pool = itemPool(w);
  for (let k = 0; k < s.ncard; k++) {
    const ult = s.ckind[k] === CARD_ULT, def = ult ? null : pool[s.ckind[k]!], ic = ult ? `hsl(${f * 6 % 360},100%,65%)` : def?.color ?? '#fff', sz = 14 + 3 * Math.sin(f * 0.15), on = s.con[k]! > 0, R = T.ITEM_R, cap = ult ? T.LW_CAP : T.ITEM_CAP;
    c.save(); c.translate(s.cx[k]!, s.cy[k]!);
    c.strokeStyle = ic; c.lineWidth = 2; c.setLineDash(on ? [] : [6, 6]); c.beginPath(); c.arc(0, 0, R, 0, TAU); c.stroke(); c.setLineDash([]);
    c.fillStyle = ic; c.font = 'bold 13px monospace'; c.textAlign = 'center'; c.fillText(ult ? 'LAST WORD' : def?.name ?? '?', 0, -R - 34);
    if (on) {
      c.rotate(f * 0.03); c.fillStyle = ic; c.fillRect(-sz / 2, -sz * 0.7, sz, sz * 1.4); c.rotate(-f * 0.03);
      for (let i = 0; i < s.n; i++) {
        const cp = s.ccp[k * MAXP + i]!; if (cp <= 0) continue;
        const fr = cp / cap, r = R + 12 + i * 10, a0 = -Math.PI / 2;
        c.lineWidth = 8; c.strokeStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.stroke();
        c.globalAlpha = 0.35; c.lineWidth = 16; c.strokeStyle = COLS[i % 8]!; c.beginPath(); c.arc(0, 0, r, a0, a0 + TAU * fr); c.stroke();
        c.globalAlpha = 1; c.lineWidth = 7; c.beginPath(); c.arc(0, 0, r, a0, a0 + TAU * fr); c.stroke();
        c.fillStyle = '#fff'; c.beginPath(); c.arc(Math.cos(a0 + TAU * fr) * r, Math.sin(a0 + TAU * fr) * r, 5, 0, TAU); c.fill();
        c.fillStyle = COLS[i % 8]!; c.font = 'bold 16px monospace'; c.textAlign = 'center'; c.fillText((fr * 100 | 0) + '%', 0, R + 40 + i * 10);
      }
      if (s.ccont[k]) { c.fillStyle = '#fff'; c.font = 'bold 14px monospace'; c.textAlign = 'center'; c.fillText('CONTESTED', 0, -R - 16); }
    }
    c.restore();
  }
}
