import { pow, type World } from '@kernel';
import { charOf } from './api';
import { PS, type CombatState } from './state';
import { T } from './tuning';

/**
 * Stat pipeline (DESIGN §4.4). Today: character multipliers only. Statuses (items, spells, rules) plug in here as modifiers,
 * so no system ever sprinkles `if (flag)` checks. Order of multiplication is fixed and deterministic.
 */
export const speedMul = (w: World, s: CombatState, p: number): number => { const c = charOf(w, s, p); return c.spd * (c.spdM ? c.spdM(w, s, p) : 1) * (s.slowT[p]! > s.gf ? 0.5 : 1); };
/**
 * Damage multiplier (legacy chDmg wrappers): attacker `dout`, victim `din`, then the attacker's accumulated parry streak
 * (×1.3 per streak step, applies to its melee and to non-heavy shots).
 */
export function scaleDamage(w: World, s: CombatState, victim: number, attacker: number, raw: number, heavy = false): number {
  // Same operation ORDER as legacy (outermost wrapper first: attacker out, victim in, then the base parry-streak factor), applied to the raw damage
  // one factor at a time: float multiplication is not associative and the last bit decides knife-edge outcomes (DESIGN §25 R117).
  let d = raw;
  if (attacker >= 0 && attacker !== victim) { const c = charOf(w, s, attacker); d *= c.dout * (c.doutM ? c.doutM(w, s, attacker, victim, heavy) : 1); }
  const cv = charOf(w, s, victim); d *= cv.din * (cv.dinM ? cv.dinM(w, s, victim) : 1);
  if (attacker >= 0 && s.pStk[attacker]! > 0 && (s.state[attacker] === PS.atk || !heavy)) d *= pow(1.3, s.pStk[attacker]!);
  return d;
}
/** Body / core collision radii (legacy bodyR / coreR): the Oni giant is twice as wide and an easier target. */
export const bodyR = (s: CombatState, p: number): number => (s.giant[p]! > 0 ? T.BODY_R * 2 : T.BODY_R);
export const coreR = (s: CombatState, p: number): number => (s.giant[p]! > 0 ? T.CORE_R * 2.5 : T.CORE_R);
/** Inside the red zone near the walls (none while the Warp item is active). One definition for damage, wall pips and heavy hits. */
export const inEdge = (s: CombatState, p: number): boolean => s.warp <= 0 && (s.x[p]! < s.edge || s.y[p]! < s.edge || s.x[p]! > s.mapW - s.edge || s.y[p]! > s.mapH - s.edge);
/** Tempo coefficients (legacy kP / kB / kS at the default tempo 10 → 1). kS scales hit-stun. */
export const kP = (s: CombatState): number => 0.6 + 0.04 * s.tempo;
export const kB = (s: CombatState): number => 0.5 + 0.05 * s.tempo;
export const kS = (s: CombatState): number => 0.6 + 0.04 * s.tempo;
/** Power-based damage multiplier of the light shot (legacy pmul). */
export const powerMul = (s: CombatState, p: number, k: number): number => 1 * (1 + k * ((s.power[p]! | 0) - 1));
