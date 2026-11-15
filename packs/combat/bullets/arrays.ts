import type { CombatState } from '../state';

type TA = Float64Array | Int32Array;
const BULLET_KEYS = ['bid', 'bborn', 'bx', 'by', 'bvx', 'bvy', 'br', 'bdmg', 'blife', 'bhome', 'bdist', 'bmult', 'bowner', 'bflags', 'bcol', 'brefl', 'bmv', 'bkb', 'bstun', 'barm', 'bspl', 'bmst', 'bct', 'bsea', 'bnsf', 'bwav', 'bph', 'btx', 'bty', 'bag', 'bkind', 'bsh', 'bgrp', 'bang', 'brot', 'bdrg', 'bacc', 'bvmax', 'bp0', 'bp1', 'bp2'] as const;
const cache = new WeakMap<CombatState, TA[]>();
/** Every per-bullet column, so compaction / removal / spawn reset can never forget one (adding a column = one name above + the schema). */
export function bulletArrays(s: CombatState): TA[] {
  let a = cache.get(s);
  if (!a) { a = BULLET_KEYS.map(k => s[k]); cache.set(s, a); }
  return a;
}
export const copyBullet = (A: TA[], from: number, to: number): void => { for (let k = 0; k < A.length; k++) A[k]![to] = A[k]![from]!; };
export const clearBullet = (A: TA[], i: number): void => { for (let k = 0; k < A.length; k++) A[k]![i] = 0; };
/** Stable identity of a bullet for diagnosis: unique per match (never reused, unlike its array index), plus its birth frame. Moves with the bullet on compaction. */
export const stamp = (s: CombatState, i: number): void => { s.bid[i] = ++s.nextBid; s.bborn[i] = s.gf; };
