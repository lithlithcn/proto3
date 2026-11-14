import { pow, type World } from '@kernel';
import { charOf } from './api';
import { PS, type CombatState } from './state';

/**
 * Stat pipeline (DESIGN §4.4). Today: character multipliers only. Statuses (items, spells, rules) plug in here as modifiers,
 * so no system ever sprinkles `if (flag)` checks. Order of multiplication is fixed and deterministic.
 */
export const speedMul = (w: World, s: CombatState, p: number): number => charOf(w, s, p).spd;
/**
 * Damage multiplier (legacy chDmg wrappers): attacker `dout`, victim `din`, then the attacker's accumulated parry streak
 * (×1.3 per streak step, applies to its melee and to non-heavy shots).
 */
export function damageMul(w: World, s: CombatState, victim: number, attacker: number, heavy = false): number {
  let d = 1;
  if (attacker >= 0 && attacker !== victim) d *= charOf(w, s, attacker).dout;
  d *= charOf(w, s, victim).din;
  if (attacker >= 0 && s.pStk[attacker]! > 0 && (s.state[attacker] === PS.atk || !heavy)) d *= pow(1.3, s.pStk[attacker]!);
  return d;
}
/** Tempo coefficients (legacy kP / kB / kS at the default tempo 10 → 1). kS scales hit-stun. */
export const kP = (s: CombatState): number => 0.6 + 0.04 * s.tempo;
export const kB = (s: CombatState): number => 0.5 + 0.05 * s.tempo;
export const kS = (s: CombatState): number => 0.6 + 0.04 * s.tempo;
/** Power-based damage multiplier of the light shot (legacy pmul). */
export const powerMul = (s: CombatState, p: number, k: number): number => 1 * (1 + k * ((s.power[p]! | 0) - 1));
