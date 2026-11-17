import { type Schema, f64s, i32s } from '@kernel';
import { MAXP } from '@pack/combat/api';

/** Themed-item state (one block per item, named after the legacy field), indexed by player id. */
export const themedSchema: Schema = {
  /** Rumia: frame until which the player is EDIBLE (hit by a dark orb); who is digesting an eaten player. */
  dark: f64s(MAXP), eatBy: i32s(MAXP),
};
export interface ThemedState { dark: Float64Array; eatBy: Int32Array }
