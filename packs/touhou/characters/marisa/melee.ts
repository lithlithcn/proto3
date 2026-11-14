import type { CharacterDef } from '@pack/combat/api';

/** Marisa's melee set (legacy `melee`): broom strikes, numbers verbatim. */
export const marisaMelee: NonNullable<CharacterDef['melee']> = {
  jab: { start: 5, act: 5, rec: 13, range: 52, arc: 2.2, dmg: 6, kb: 7, stun: 22 },
  lunge: { start: 6, act: 12, rec: 20, range: 40, arc: 1.2, dmg: 9, kb: 11, stun: 28, move: 22 },
  strong: { start: 8, act: 4, rec: 26, range: 70, arc: 6.2832, dmg: 14, kb: 16, stun: 40, charge: 40 },
  dashatk: { start: 2, act: 7, rec: 18, range: 50, arc: 1.4, dmg: 9, kb: 12, stun: 28, keep: 0.97 },
};
