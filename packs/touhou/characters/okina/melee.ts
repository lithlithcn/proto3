import type { CharacterDef } from '@pack/combat/api';

/** Okina's melee set (legacy `melee`): drum strikes, numbers verbatim. */
export const okinaMelee: NonNullable<CharacterDef['melee']> = {
  jab: { start: 5, act: 4, rec: 14, range: 46, arc: 6.2832, dmg: 5, kb: 9, stun: 20 },
  lunge: { start: 8, act: 8, rec: 18, range: 110, arc: 0.6, dmg: 8, kb: 10, stun: 26 },
  strong: { start: 12, act: 6, rec: 28, range: 72, arc: 6.2832, dmg: 13, kb: 16, stun: 40, charge: 40 },
};
