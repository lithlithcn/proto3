import { type World, atan2 } from '@kernel';
import { T } from '../tuning';
import { PS, type CombatState } from '../state';

/**
 * K.O. (legacy `ko`, core part). Presentation (KO beam, shake, rings) belongs to listeners of `combat:ko`.
 * TODO(next batch): KO beam aiming state, phoenix/rebirth hook (before-event), exact `bestId()` winner ranking.
 */
export function ko(w: World, s: CombatState, p: number): void {
  if (s.state[p] === PS.dead) return;
  const ev = w.emit('combat:ko:before', { p, cancelled: false });
  if (ev.cancelled) return;
  const mx = s.vx[p]!, my = s.vy[p]!;
  const a = mx || my ? atan2(my, mx) + 3.141592653589793 : atan2(s.mapH / 2 - s.y[p]!, s.mapW / 2 - s.x[p]!);
  const oldStocks = s.stocks[p]!;
  s.stocks[p]!--;
  if (s.stocks[p]! <= 0) s.outAt[p] = s.gf;
  s.state[p] = PS.dead; s.t[p] = T.KO_T; s.vx[p] = 0; s.vy[p] = 0;
  s.hitstop = Math.max(s.hitstop, 15);
  s.slow = oldStocks <= 1 ? 120 : 60; // legacy: slow = (stocks before decrement) <= 1 ? 120 : 60
  for (let i = 0; i < s.nb; i++) if (s.bowner[i] === p) s.bflags[i] = s.bflags[i]! | 2;
  w.emit('combat:ko', { p, x: s.x[p]!, y: s.y[p]!, beamAngle: a, stocksLeft: s.stocks[p]! });
  // match end: one team (or nobody) left
  let alive = -1, teams = 0, firstTeam = -2;
  for (let q = 0; q < s.n; q++) if (s.stocks[q]! > 0) { const t = s.teams ? s.team[q]! : q; if (t !== firstTeam) { teams++; firstTeam = t; } alive = q; }
  if (teams <= 1) { s.winner = alive >= 0 ? alive : p; s.winT = 0; }
}
