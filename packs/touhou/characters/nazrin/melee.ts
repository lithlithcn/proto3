import type { CharacterDef } from '@pack/combat/api';

/** Nazrin's melee set (legacy `melee`): rod strikes, numbers verbatim. */
export const nazrinMelee: NonNullable<CharacterDef['melee']> = {
  jab: { start: 4, act: 8, rec: 12, range: 44, arc: 1.6, dmg: 3.5, kb: 4, stun: 16, multi: 1, every: 4 },
  lunge: { start: 7, act: 5, rec: 18, range: 56, arc: 0.8, dmg: 5, kb: 5, stun: 24 },
  strong: { start: 10, act: 6, rec: 28, range: 76, arc: 2, dmg: 13, kb: 16, stun: 42, charge: 40 },
};
