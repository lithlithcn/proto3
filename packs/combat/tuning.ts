/**
 * Core balance constants, copied verbatim from the legacy game (`T`, see docs/INVENTORY.generated.md). Units: frames, px, radians.
 * Rule: balance numbers live in data files like this one, never inline in systems. Map size/edge live in state (set by the map).
 */
export const T = {
  HP: 100, STOCKS: 3, RESPAWN_INV: 120,
  SPEED: 4.4, FOCUS_SPEED: 2, RUN_SPEED: 6.4, BODY_R: 16, CORE_R: 3, GRAZE_R: 27,
  DASH_CHARGES: 3, DASH_COST: 1, DASH_T: 11, DASH_V: 11, DASH_REGEN: 0.0075, DASH_REGEN_DELAY: 30, DASH_LAG: 8, DASH_REGEN_IDLE: 2.2,
  SLIDE_T: 20, DASH_GRAZE: 0.05, BRAKE_MIN: 5,
  POWER_MAX: 4, POWER_GRAZE: 0.04, POWER_HIT: 0.35,
  SPIRIT_MAX: 100, GRAZE_GAIN: 1.2, SPELL_COST: 100, SHOT_GAIN: 0.5, HIT_GAIN: 0.3, HURT_GAIN: 0.5,
  BURST_MAX: 100, BURST_REGEN: 0.08, BURST_HURT: 0.6,
  PARRY_R: 30, PARRY_ACT: 7, PARRY_WHIFF: 26, PARRY_STUN: 50,
  PIPS: 3, WALL_MIN: 3.5, EDGE_DMG: 0.04, SDI: 1.2, MAX_B: 900,
  /** The spell gauge fills at half speed: per-step gains below SPIRIT_BIG are halved; large fills (items, spells) stay whole. */
  SPIRIT_SLOW: 0.5, SPIRIT_BIG: 25,
  LIGHT_CD: 6, LIGHT_CD_F: 4, COMBO_WIN: 8, KO_T: 130,
} as const;
/** Default map (legacy "Large"). */
export const MAP_LARGE = { w: 2000, h: 1350, edge: 140 } as const;
/** The legacy game uses TAU = 6.2832 (not exactly 2π) in angle wrapping and spawn layout. Kept for parity; changing it shifts every steering curve. */
export const TAU = 6.2832;
