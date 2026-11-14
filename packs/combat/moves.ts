/**
 * Melee / hit data (legacy `MOVES`). Balance numbers live here, not in systems. Characters override entries via `CharacterDef.melee`.
 * `kb` < 0 pulls the victim in. `stun` is the base hit-stun in frames.
 */
export interface HitData { dmg: number; kb: number; stun: number }
export interface MoveDef extends HitData {
  start: number; act: number; rec: number; range: number; arc: number;
  /** Forward lunge speed at `start`. */ move?: number;
  /** Velocity kept per frame while attacking (default: carried momentum or 0.85). */ keep?: number;
  /** Frames the move can be charged while the button is held (strong). */ charge?: number;
  /** Re-hit every N frames (multi-hit moves). */ multi?: number; every?: number;
}
export type MeleeName = 'jab' | 'lunge' | 'strong' | 'dashatk' | 'tslam';

/** Move ids stored in state (`mvId`); 0 = none. Heavy shots and grab join in the next batches. */
export const MV = { none: 0, jab: 1, lunge: 2, strong: 3, dashatk: 4, tslam: 5, grab: 6 } as const;
export const MV_NAMES: (MeleeName | 'grab' | '')[] = ['', 'jab', 'lunge', 'strong', 'dashatk', 'tslam', 'grab'];

/** Hit sources for the stun-repeat reduction: one slot per distinct hit-data object of the legacy game. */
export const SRC = { jab: 0, lunge: 1, strong: 2, dashatk: 3, tslam: 4, grab: 5 } as const;

export const MOVES: Record<MeleeName | 'grab', MoveDef> = {
  tslam: { start: 32, act: 5, rec: 30, range: 56, arc: 2.2, dmg: 6, kb: 10, stun: 30 },
  grab: { start: 4, act: 5, rec: 9, range: 46, arc: 2.2, dmg: 0, kb: 0, stun: 0 },
  jab: { start: 4, act: 4, rec: 10, range: 34, arc: 1.6, dmg: 5, kb: 5, stun: 20 },
  lunge: { start: 7, act: 5, rec: 18, range: 40, arc: 1.2, dmg: 8, kb: 8, stun: 26, move: 9 },
  strong: { start: 6, act: 5, rec: 26, range: 48, arc: 1.8, dmg: 12, kb: 14, stun: 38, charge: 40 },
  dashatk: { start: 3, act: 6, rec: 16, range: 40, arc: 1.4, dmg: 7, kb: 9, stun: 24, keep: 0.94 },
};
