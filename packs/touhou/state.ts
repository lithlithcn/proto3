import { type Schema, f64s, i32s } from '@kernel';
import { MAXP } from '@pack/combat/api';

/** Character-owned state of the touhou pack, indexed by player id. Each character adds its fields here (one file per concept as it grows). */
export const touhouSchema: Schema = {
  /** Reimu: game frame of her last dash (teleport cooldown). */
  reimuDashAt: f64s(MAXP),
  /** Reimu: orb charge counter, heavy held last frame, orbs gathered (focus) flag, gather start frame, gather lockout, re-gather cooldown frame, launch aim. */
  rC: i32s(MAXP), rHp: i32s(MAXP), rG: i32s(MAXP), rGW: i32s(MAXP), rGT: f64s(MAXP), rGC: f64s(MAXP), rA: f64s(MAXP),
};
export interface TouhouState { reimuDashAt: Float64Array; rC: Int32Array; rHp: Int32Array; rG: Int32Array; rGW: Int32Array; rGT: Float64Array; rGC: Float64Array; rA: Float64Array }
