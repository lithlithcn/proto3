import type { CharacterDef } from '@pack/combat/api';

/** Aya's melee set (legacy `melee`): fan swipes and a spinning strong, numbers verbatim. */
export const ayaMelee: NonNullable<CharacterDef['melee']> = {
  jab: { start: 4, act: 5, rec: 10, range: 46, arc: 2, dmg: 5, kb: 6, stun: 20 },
  lunge: { start: 5, act: 14, rec: 18, range: 42, arc: 1.4, dmg: 3, kb: 3, stun: 14, multi: 1, every: 4, move: 20 },
  strong: { start: 12, act: 5, rec: 26, range: 66, arc: 6.2832, dmg: 15, kb: 20, stun: 44, charge: 40 },
  dashatk: { start: 2, act: 6, rec: 14, range: 44, arc: 1.2, dmg: 7, kb: 12, stun: 24, keep: 0.95 },
};
