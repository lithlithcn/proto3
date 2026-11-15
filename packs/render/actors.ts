import { BF, PS, T, TAU, MOVES, MV_NAMES, bodyR, coreR, type CombatState } from '@pack/combat/api';
import { COLS, LCOLS, hexOf } from './colors';

/** Legacy drawHeavy (heavy bullets: gungnir/rifle lines are entity-specific and arrive with their items) + light bullet sprite (bSpr): outline circle, fill, white core. */
export function drawBullet(c: CanvasRenderingContext2D, s: CombatState, i: number): void {
  const x = s.bx[i]!, y = s.by[i]!, o = s.bowner[i]!, col = s.bcol[i]! ? hexOf(s.bcol[i]!) : null;
  if (s.bflags[i]! & BF.heavy) {
    const armed = s.bdist[i]! >= s.barm[i]!, r = s.br[i]! * (armed ? 1 : 0.35 + 0.65 * s.bdist[i]! / s.barm[i]!), cc = col ?? COLS[o % 8]!, refl = s.brefl[i]!;
    c.beginPath(); c.arc(x, y, r, 0, TAU);
    if (armed) {
      c.fillStyle = cc; c.fill(); c.strokeStyle = refl ? '#6ff' : '#fff'; c.lineWidth = 2 + refl * 2; c.stroke();
      c.strokeStyle = COLS[o % 8]!; c.lineWidth = 2.5; c.beginPath(); c.arc(x, y, r + 3, 0, TAU); c.stroke();
      c.globalAlpha = 0.1; c.beginPath(); c.arc(x, y, r * 1.45, 0, TAU); c.fill(); c.globalAlpha = 1;
    } else { c.strokeStyle = cc; c.lineWidth = 2; c.stroke(); }
    return;
  }
  const rr = Math.round(s.br[i]! * 2) / 2;
  c.globalAlpha = 0.8; c.fillStyle = COLS[o % 8]!; c.beginPath(); c.arc(x, y, rr + 1.8, 0, TAU); c.fill(); c.globalAlpha = 1;
  c.fillStyle = col ?? LCOLS[o % 8]!; c.beginPath(); c.arc(x, y, rr, 0, TAU); c.fill();
  if (rr >= 3) { c.fillStyle = 'rgba(255,255,255,.85)'; c.beginPath(); c.arc(x, y, rr * 0.5, 0, TAU); c.fill(); }
}

/** Legacy drawP: body disc + aim tick + core, focus ring, slide trail, spell/parry rings, melee wedge, hitstun bar. */
export function drawPlayer(c: CanvasRenderingContext2D, s: CombatState, q: number): void {
  const st = s.state[q]!; if (st === PS.dead || st === PS.eaten) return;
  const x = s.x[q]!, y = s.y[q]!, col = COLS[q % 8]!, R = bodyR(s, q), f = s.gf, aim = s.aim[q]!;
  if (s.inv[q]! > 0 && (f >> 2) % 2) c.globalAlpha = 0.45;
  c.fillStyle = s.flash[q]! > 0 ? '#fff' : st === PS.parrystun || st === PS.broken ? '#555' : '#222'; c.strokeStyle = col; c.lineWidth = 3;
  c.beginPath(); c.arc(x, y, R, 0, TAU); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(x + Math.cos(aim) * R, y + Math.sin(aim) * R); c.lineTo(x + Math.cos(aim) * (R + 10), y + Math.sin(aim) * (R + 10)); c.stroke();
  c.fillStyle = '#fff'; c.beginPath(); c.arc(x, y, coreR(s, q) + (s.focus[q] ? 1.5 : 0), 0, TAU); c.fill();
  if (s.focus[q]) { c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 1; c.beginPath(); c.arc(x, y, T.GRAZE_R, 0, TAU); c.stroke(); }
  if (s.slide[q]! > 0) { c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x - s.vx[q]! * 4, y - s.vy[q]! * 4); c.stroke(); }
  if (st === PS.spell) { c.strokeStyle = col; c.lineWidth = 2; c.globalAlpha = 0.5; c.beginPath(); c.arc(x, y, 40 + 6 * Math.sin(f * 0.2), 0, TAU); c.stroke(); c.globalAlpha = 1; }
  if (st === PS.parry || st === PS.parrylag) { const on = st === PS.parry; c.strokeStyle = on ? '#6ff' : '#355'; c.lineWidth = on ? 4 : 2; c.beginPath(); c.arc(x, y, T.PARRY_R, 0, TAU); c.stroke(); }
  const m = st === PS.atk && s.mvId[q]! > 0 ? MOVES[MV_NAMES[s.mvId[q]!] as keyof typeof MOVES] : null;
  if (m) {
    const t = s.t[q]!;
    if (m.spd) { if (t < m.start) { c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.arc(x, y, R + 6 + (m.start - t) * 2, 0, TAU); c.stroke(); } }
    else if (s.charging[q]) { c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, R + 4 + s.charge[q]! * 0.6, 0, TAU); c.stroke(); }
    else {
      const live = t > m.start && t <= m.start + m.act, a = s.atkA[q]!;
      c.beginPath(); c.moveTo(x, y); c.arc(x, y, m.range * (s.giant[q]! > 0 ? 1.6 : 1) + R, a - m.arc / 2, a + m.arc / 2); c.closePath();
      if (live) { c.globalAlpha = 0.4; c.fillStyle = col; c.fill(); c.globalAlpha = 1; } else if (t <= m.start) { c.strokeStyle = col; c.lineWidth = 1; c.stroke(); }
    }
  }
  if (st === PS.hitstun) { c.fillStyle = '#fc3'; c.fillRect(x - 16, y - 28, 32 * Math.min(1, s.t[q]! / 40), 3); }
  c.globalAlpha = 1;
}
