import { type World, atan2 } from '@kernel';
import { clearFx } from '../fx';
import { resetItems } from '../items/reset';
import { T } from '../tuning';
import { PS, type CombatState } from '../state';
import { addBeam, BEAM_T } from '../kobeam';
import { bestId } from '../rank';

/**
 * K.O. (legacy `ko`, core part). Presentation (KO beam, shake, rings) belongs to listeners of `combat:ko`.
 * TODO: phoenix/rebirth hook (before-event is in place). The KO beam itself lives in kobeam.ts.
 */
export function ko(w: World, s: CombatState, p: number, why = 'ko'): void {
  if (s.state[p] === PS.dead) return;
  const ev = w.emit('combat:ko:before', { p, cancelled: false });
  if (ev.cancelled) return;
  const killer = s.gf - s.lastByF[p]! < 600 ? s.lastBy[p]! : -1; // credit the last attacker within 10 s, else self-destruct
  if (killer >= 0 && killer !== p) s.kos[killer] = s.kos[killer]! + 1; else s.sd[p] = s.sd[p]! + 1;
  s.lastByF[p] = -1e9;
  const ev0 = (v: number, kb: number): number => (v || kb); // legacy `p.vx||p.kbx`: ONLY an exact 0 falls back to the knockback (a 1e-12 friction residue still picks the beam direction)
  const mx = ev0(s.vx[p]!, s.kbx[p]!), my = ev0(s.vy[p]!, s.kby[p]!);
  const a = mx || my ? atan2(my, mx) + 3.141592653589793 : atan2(s.mapH / 2 - s.y[p]!, s.mapW / 2 - s.x[p]!);
  addBeam(s, p, s.x[p]!, s.y[p]!, a, BEAM_T, 0);
  const oldStocks = s.stocks[p]!;
  s.stocks[p]!--;
  if (s.stocks[p]! <= 0) s.outAt[p] = s.gf;
  s.state[p] = PS.dead; s.t[p] = T.KO_T; s.vx[p] = 0; s.vy[p] = 0; s.diPend[p] = 0; s.koPend[p] = 0; s.pStk[p] = 0; s.spit[p] = 0; resetItems(s, p); clearFx(s, p);
  s.hitstop = Math.max(s.hitstop, 15);
  s.slow = oldStocks <= 1 ? 120 : 60; // legacy: slow = (stocks before decrement) <= 1 ? 120 : 60
  for (let i = 0; i < s.nb; i++) if (s.bowner[i] === p) s.bflags[i] = s.bflags[i]! | 2;
  w.emit('combat:ko', { p, why, x: s.x[p]!, y: s.y[p]!, beamAngle: a, stocksLeft: s.stocks[p]! });
  // match end: one team (or nobody) left
  let seen = 0, teams = 0; // distinct sides still holding a stock (bitmask: ids < 32)
  for (let q = 0; q < s.n; q++) if (s.stocks[q]! > 0) { const bit = 1 << (s.teams ? s.team[q]! : q); if (!(seen & bit)) { seen |= bit; teams++; } }
  if (teams <= 1) { s.winner = bestId(s); s.winT = 0; }
}
