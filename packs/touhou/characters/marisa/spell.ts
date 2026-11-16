import { RAYF, fireRay, type SpellDef, sfx } from '@pack/combat/api';

/** Love Sign「Final Spark」: one huge slowly rotating beam (150 frames, 36 of warning) that clears light bullets. */
export const marisaSpell: SpellDef = {
  name: 'Love Sign「Final Spark」', loop: 200,
  fn({ w, s, p, k }) { if (k === 0) fireRay(s, p, { T: 150, tele: 36, flags: RAYF.follow | RAYF.clear, w: 52, len: 1500, dmg: 3, ev: 5, kb: 7, stun: 18, c: 0xfff3a0, a: s.aim[p]! - 0.5, spin: 0.007 }); if (k === 0) sfx(w, 'masterspark2', 1); },
};
