import type { CharacterDef } from '@pack/combat/api';

/** Hecatia's melee set (legacy `melee`): flail strikes, numbers verbatim (the lunge pulls the foe in: negative knockback). */
export const hecatiaMelee: NonNullable<CharacterDef['melee']> = {
  jab: { start: 6, act: 6, rec: 14, range: 60, arc: 2.6, dmg: 7, kb: 8, stun: 24 },
  lunge: { start: 8, act: 5, rec: 20, range: 100, arc: 0.35, dmg: 7, kb: -10, stun: 30 },
  strong: { start: 10, act: 6, rec: 30, range: 84, arc: 6.2832, dmg: 15, kb: 16, stun: 42, charge: 40 },
};
