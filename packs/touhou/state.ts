import { type Schema, f64s } from '@kernel';
import { MAXP } from '@pack/combat/api';

/** Character-owned state of the touhou pack, indexed by player id. Each character adds its fields here (one file per concept as it grows). */
export const touhouSchema: Schema = {
  /** Reimu: game frame of her last dash (teleport cooldown). */
  reimuDashAt: f64s(MAXP),
};
export interface TouhouState { reimuDashAt: Float64Array }
