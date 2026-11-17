import { type Schema, f64, f64s, i32, i32s } from '@kernel';
import { MAXP } from '@pack/combat/api';

/** Themed-item state (one block per item, named after the legacy field), indexed by player id. */
export const themedSchema: Schema = {
  /** Rumia: frame until which the player is EDIBLE (hit by a dark orb); who is digesting an eaten player. */
  dark: f64s(MAXP), eatBy: i32s(MAXP),
  /** Rin (CX.anon): frames left of the anonymous mode (grey silhouettes, no names / HUD). */
  anon: f64(),
  /** Meiling (CX.wall): gate x, owner (-1 = none), frames left; per player the side of the gate (legacy gside, 0 = unset) and the kick cooldown frame. */
  /** Koakuma: a KO under the pact is pending (legacy pactPend, resolved next chPre). */
  pactPend: i32s(MAXP),
  /** Elements: the player's element (legacy p.el), his aura (legacy p.aura = {el, t}) and the melee-aura cooldown (legacy mvEl). */
  el: i32s(MAXP), auraEl: i32s(MAXP), auraT: f64s(MAXP), mvEl: f64s(MAXP),
  wallX: f64(), wallO: i32(-1), wallT: f64(), gside: f64s(MAXP), mkCD: f64s(MAXP),
};
export interface ThemedState { dark: Float64Array; eatBy: Int32Array; anon: number; wallX: number; wallO: number; wallT: number; gside: Float64Array; mkCD: Float64Array; pactPend: Int32Array; el: Int32Array; auraEl: Int32Array; auraT: Float64Array; mvEl: Float64Array }
