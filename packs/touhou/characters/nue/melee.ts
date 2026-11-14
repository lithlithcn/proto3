import type { CharacterDef } from '@pack/combat/api';

/** Nue's melee set (legacy `melee`): trident strikes, numbers verbatim (the strong is a 4-frame multi-hit spin, the dash attack pulls). */
export const nueMelee: NonNullable<CharacterDef['melee']> = {
  jab: { start: 5, act: 4, rec: 12, range: 72, arc: 0.5, dmg: 6, kb: 7, stun: 22 },
  lunge: { start: 7, act: 8, rec: 20, range: 50, arc: 1, dmg: 9, kb: 11, stun: 28, move: 16 },
  strong: { start: 8, act: 12, rec: 24, range: 64, arc: 6.2832, dmg: 3, kb: 4, stun: 14, multi: 1, every: 4, charge: 40 },
  dashatk: { start: 3, act: 6, rec: 16, range: 70, arc: 1.2, dmg: 6, kb: -9, stun: 28, keep: 0.9 },
};
