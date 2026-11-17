/**
 * Melee / hit data (legacy `MOVES`). Balance numbers live here, not in systems. Characters override entries via `CharacterDef.melee`.
 * `kb` < 0 pulls the victim in. `stun` is the base hit-stun in frames.
 */
export interface HitData { dmg: number; kb: number; stun: number; /** set by heavy-bullet hits (legacy `m.spd`): presentation only (damage sound) */ spd?: number }
export interface MoveDef extends HitData {
  start: number; act: number; rec: number; range: number; arc: number;
  /** Forward lunge speed at `start`. */ move?: number;
  /** Velocity kept per frame while attacking (default: carried momentum or 0.85). */ keep?: number;
  /** Frames the move can be charged while the button is held (strong). */ charge?: number;
  /** Re-hit every N frames (multi-hit moves). */ multi?: number; every?: number;
  /** Heavy shots only: bullet speed, radius, arming distance (no hit before it), default life. */ spd?: number; r?: number; arm?: number; life?: number;
}
export type MeleeName = 'jab' | 'lunge' | 'strong' | 'dashatk' | 'tslam';
export type HeavyName = 'heavyN' | 'heavyF' | 'heavyB';

/** Move ids stored in state (`mvId`); 0 = none. Heavy shots and grab join in the next batches. */
export const MV = { none: 0, jab: 1, lunge: 2, strong: 3, dashatk: 4, tslam: 5, grab: 6, heavyN: 7, heavyF: 8, heavyB: 9 } as const;
export const MV_NAMES: (MeleeName | HeavyName | 'grab' | '')[] = ['', 'jab', 'lunge', 'strong', 'dashatk', 'tslam', 'grab', 'heavyN', 'heavyF', 'heavyB'];

/** Hit sources for the stun-repeat reduction: one slot per distinct hit-data object of the legacy game. */
/** Hit-source ids for the stun-repeat reduction (legacy keyed it by move object identity). 0-15 combat moves, 16-63 items, 64+ characters; keep ids unique. */
export const ISRC = { blade: 16, bomb: 18, hole: 19, rifle: 20, spark: 21, sknife: 22, sph: 23, dark: 24 } as const; // sph = the shared danmaku hit data of legacy `SPH` (every pattern heavy bullet repeats on it)
export const SRC = { jab: 0, lunge: 1, strong: 2, dashatk: 3, tslam: 4, grab: 5, heavyN: 6, heavyF: 7, heavyB: 8, beam: 9 } as const;

export const MOVES: Record<MeleeName | HeavyName | 'grab', MoveDef> = {
  tslam: { start: 32, act: 5, rec: 30, range: 56, arc: 2.2, dmg: 6, kb: 10, stun: 30 },
  grab: { start: 4, act: 5, rec: 9, range: 46, arc: 2.2, dmg: 0, kb: 0, stun: 0 },
  jab: { start: 4, act: 4, rec: 10, range: 34, arc: 1.6, dmg: 5, kb: 5, stun: 20 },
  lunge: { start: 7, act: 5, rec: 18, range: 40, arc: 1.2, dmg: 8, kb: 8, stun: 26, move: 9 },
  strong: { start: 6, act: 5, rec: 26, range: 48, arc: 1.8, dmg: 12, kb: 14, stun: 38, charge: 40 },
  // heavy shots (no melee window: act/range/arc unused); slow bullets arm after `arm` px of travel
  heavyN: { start: 10, act: 0, rec: 16, range: 0, arc: 0, spd: 7, r: 11, dmg: 9, kb: 9, stun: 30, arm: 70 },
  heavyF: { start: 8, act: 0, rec: 20, range: 0, arc: 0, spd: 11, r: 8, dmg: 7, kb: 7, stun: 24, arm: 60 },
  heavyB: { start: 14, act: 0, rec: 14, range: 0, arc: 0, spd: 3.5, r: 17, dmg: 11, kb: 10, stun: 34, arm: 45, life: 300 },
  dashatk: { start: 3, act: 6, rec: 16, range: 40, arc: 1.4, dmg: 7, kb: 9, stun: 24, keep: 0.94 },
};

/** Breaker bullet (parry + heavy): hits only a parrying foe, shattering its shield. */
export const BREAKER = { dmg: 0, kb: 0, stun: 0, arm: 0 } as const;
/** Recoil per heavy direction (legacy T.RECOIL). */
export const RECOIL = { N: 2, F: 1, B: 5 } as const;
