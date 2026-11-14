import { type World, cos, hypot, sin } from '@kernel';
import { charOf } from '../api';
import type { PCtx } from '../input';
import { MOVES, MV, MV_NAMES, type MeleeName, type MoveDef } from '../moves';
import { PS, type CombatState } from '../state';

/** Current move definition of a player (character override, else default), or null when not attacking. */
export function moveOf(w: World, s: CombatState, p: number): MoveDef | null {
  const name = MV_NAMES[s.mvId[p]!];
  if (!name) return null;
  return charOf(w, s, p).melee?.[name as MeleeName] ?? MOVES[name as MeleeName | 'grab'];
}

/** Begin a melee move (legacy startAtk). A move started while moving fast keeps 93 % of the momentum per frame. */
export function startAtk(s: CombatState, p: number, mv: number): void {
  s.mHit[p] = 0; s.state[p] = PS.atk; s.mvId[p] = mv; s.nextHit[p] = 0; s.t[p] = 0; s.hitDone[p] = 0; s.atkA[p] = s.aim[p]!;
  s.charge[p] = 0; s.charging[p] = mv === MV.strong ? 1 : 0; s.run[p] = 0; s.carry[p] = hypot(s.vx[p]!, s.vy[p]!) > 5 ? 0.93 : 0;
}

/** Stick direction relative to the aim: F = toward the foe, B = away, N = neutral (legacy rel). */
export function rel(c: PCtx): 'F' | 'B' | 'N' {
  const l = hypot(c.ix, c.iy);
  if (l < 0.3) return 'N';
  const d = (c.ix * cos(c.s.aim[c.p]!) + c.iy * sin(c.s.aim[c.p]!)) / l;
  return d > 0.45 ? 'F' : d < -0.45 ? 'B' : 'N';
}

