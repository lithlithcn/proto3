import { type Schema, f64s, i32s } from '@kernel';
import { MAXP } from '@pack/combat/api';

/** Character-owned state of the touhou pack, indexed by player id. Each character adds its fields here (one file per concept as it grows). */
export const touhouSchema: Schema = {
  /** Reimu: game frame of her last dash (teleport cooldown). */
  reimuDashAt: f64s(MAXP),
  /** Reimu: orb charge counter, heavy held last frame, orbs gathered (focus) flag, gather start frame, gather lockout, re-gather cooldown frame, launch aim. */
  rC: i32s(MAXP), rHp: i32s(MAXP), rG: i32s(MAXP), rGW: i32s(MAXP), rGT: f64s(MAXP), rGC: f64s(MAXP), rA: f64s(MAXP),
  /** Marisa: laser lockout until frame, blazing-star boost end frame, Hakkero heat, heavy held last frame. */
  mLz: f64s(MAXP), mBS: f64s(MAXP), mH: f64s(MAXP), mHp: i32s(MAXP), mHc: f64s(MAXP), fFr: f64s(MAXP), fLD: f64s(MAXP), fCh: i32s(MAXP), fHc: f64s(MAXP), hM: i32s(MAXP), hFp: i32s(MAXP), hTr: f64s(MAXP), hBurn: f64s(MAXP), hBurnBy: i32s(MAXP), nD: f64s(MAXP), nDid: i32s(MAXP), nOr: i32s(MAXP), nOsp: i32s(MAXP), nS: i32s(MAXP), nOc: i32s(MAXP), oLz: f64s(MAXP), oHp: i32s(MAXP), oMai: i32s(MAXP), oS: i32s(MAXP), nDig: f64s(MAXP), nSpd: f64s(MAXP), nSh: i32s(MAXP), nDbl: f64s(MAXP), nTg: i32s(MAXP), nTgF: f64s(MAXP),
  /** Aya: camera frame size, camera cooldown frame, dash-gust end frame, last Hyper Dash frame. */
  aF: f64s(MAXP), aCd: f64s(MAXP), aG: f64s(MAXP), aHy: f64s(MAXP),
};
export interface TouhouState { reimuDashAt: Float64Array; rC: Int32Array; rHp: Int32Array; rG: Int32Array; rGW: Int32Array; rGT: Float64Array; rGC: Float64Array; rA: Float64Array; mLz: Float64Array; mBS: Float64Array; mH: Float64Array; mHp: Int32Array; mHc: Float64Array; fFr: Float64Array; fLD: Float64Array; fCh: Int32Array; fHc: Float64Array; hM: Int32Array; hFp: Int32Array; hTr: Float64Array; hBurn: Float64Array; hBurnBy: Int32Array; nD: Float64Array; nDid: Int32Array; nOr: Int32Array; nOsp: Int32Array; nS: Int32Array; nOc: Int32Array; oLz: Float64Array; oHp: Int32Array; oMai: Int32Array; oS: Int32Array; nDig: Float64Array; nSpd: Float64Array; nSh: Int32Array; nDbl: Float64Array; nTg: Int32Array; nTgF: Float64Array; aF: Float64Array; aCd: Float64Array; aG: Float64Array; aHy: Float64Array }
