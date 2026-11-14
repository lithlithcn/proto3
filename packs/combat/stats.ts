import type { World } from '@kernel';
import { charOf } from './api';
import type { CombatState } from './state';

/**
 * Stat pipeline (DESIGN §4.4). Today: character multipliers only. Statuses (items, spells, rules) plug in here as modifiers,
 * so no system ever sprinkles `if (flag)` checks. Order of multiplication is fixed and deterministic.
 */
export const speedMul = (w: World, s: CombatState, p: number): number => charOf(w, s, p).spd;
/** Legacy chDmg wrapper order: attacker dout, then victim din, then item/status modifiers (none yet). */
export function damageMul(w: World, s: CombatState, victim: number, attacker: number): number {
  let d = 1;
  if (attacker >= 0 && attacker !== victim) d *= charOf(w, s, attacker).dout;
  return d * charOf(w, s, victim).din;
}
/** Tempo coefficients (legacy kP / kB at the default tempo 10 → 1). */
export const kP = (s: CombatState): number => 0.6 + 0.04 * s.tempo;
export const kB = (s: CombatState): number => 0.5 + 0.05 * s.tempo;
/** Power-based damage multiplier of the light shot (legacy pmul). */
export const powerMul = (s: CombatState, p: number, k: number): number => 1 * (1 + k * ((s.power[p]! | 0) - 1));
