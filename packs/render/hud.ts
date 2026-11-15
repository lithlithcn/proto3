import { T, type CombatState } from '@pack/combat/api';
import { COLS } from './colors';

/** Temporary compact HUD (hp / spirit bars + stocks). The legacy drawHUD (panels, portraits, power pips, status icons) replaces it next. */
export function drawHud(c: CanvasRenderingContext2D, s: CombatState, w: number): void {
  c.save(); c.font = '12px monospace'; c.textAlign = 'left';
  for (let p = 0; p < s.n; p++) {
    const x = 12 + p * Math.max(260, w / s.n), y = 16;
    c.fillStyle = COLS[p % 8]!; c.fillText(`P${p + 1}  stocks ${s.stocks[p]}`, x, y);
    c.fillStyle = '#222'; c.fillRect(x, y + 6, 220, 8); c.fillStyle = COLS[p % 8]!; c.fillRect(x, y + 6, 220 * Math.max(0, s.hp[p]!) / T.HP, 8);
    c.fillStyle = '#222'; c.fillRect(x, y + 18, 220, 5); c.fillStyle = '#7fe'; c.fillRect(x, y + 18, 220 * Math.max(0, Math.min(100, s.spirit[p]!)) / 100, 5);
  }
  c.restore();
}
