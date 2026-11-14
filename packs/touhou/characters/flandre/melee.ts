import type { CharacterDef } from '@pack/combat/api';

/** Flandre's melee set (legacy `melee`): numbers verbatim. */
export const flandreMelee: NonNullable<CharacterDef['melee']> = {
  jab: { start: 3, act: 9, rec: 10, range: 40, arc: 1.8, dmg: 2.5, kb: 2, stun: 12, multi: 1, every: 3 },
  lunge: { start: 8, act: 6, rec: 20, range: 84, arc: 2.4, dmg: 11, kb: 12, stun: 30 },
  strong: { start: 10, act: 10, rec: 28, range: 100, arc: 0.55, dmg: 16, kb: 18, stun: 44, charge: 40 },
  dashatk: { start: 2, act: 10, rec: 16, range: 42, arc: 1.4, dmg: 8, kb: 10, stun: 24, keep: 1 },
};
