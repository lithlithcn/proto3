import { cos, sin } from '@kernel';
import { type SpellDef, TAU, sB } from '@pack/combat/api';
import { HEC } from './kinds';

/** Trinity「Three-Body Crossfire」: every 10 frames three rings of 4 bullets (one per body, each ring at its own speed and spin). */
export const hecatiaSpell: SpellDef = {
  name: 'Trinity「Three-Body Crossfire」', loop: 200,
  fn({ s, p, k }) {
    if (k % 10) return;
    for (let j = 0; j < 3; j++) for (let i = 0; i < 4; i++) {
      const a = k * 0.04 * (j - 1 || 1) + i * TAU / 4 + j;
      sB(s, p, s.x[p]! + cos(a) * 14, s.y[p]! + sin(a) * 14, a, 3 + j * 0.6, { life: 220, col: HEC[j] });
    }
  },
};
