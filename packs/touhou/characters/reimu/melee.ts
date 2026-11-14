import type { CharacterDef } from '@pack/combat/api';

/** Reimu's melee set (legacy `melee` of her character entry). Numbers verbatim from the legacy game. */
export const reimuMelee: NonNullable<CharacterDef['melee']> = {
  jab: { start: 5, act: 5, rec: 12, range: 48, arc: 2.6, dmg: 6, kb: 6, stun: 22 },
  lunge: { start: 6, act: 8, rec: 18, range: 38, arc: 1.2, dmg: 8, kb: 10, stun: 28, move: 13 },
  strong: { start: 5, act: 8, rec: 28, range: 52, arc: 6.2832, dmg: 13, kb: 18, stun: 40, charge: 40 },
  dashatk: { start: 2, act: 6, rec: 16, range: 50, arc: 2.2, dmg: 8, kb: 10, stun: 26, keep: 0.5 },
};
