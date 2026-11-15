import { type SpellDef, TAU, addB } from '@pack/combat/api';
import { FLC } from './kinds';

/** Secret Barrage「And Then Will There Be None?」: every 8 frames a ring of 8 slow rainbow bullets, spinning one way then the other every 8 rings. */
export const flandreSpell: SpellDef = {
  name: 'Secret Barrage「And Then Will There Be None?」', loop: 240,
  fn({ s, p, k }) {
    if (k % 8) return;
    for (let i = 0; i < 8; i++) { const a = i * TAU / 8 + k * 0.07 * ((k >> 3) % 2 ? 1 : -1); addB(s, p, a, 3.6, { life: 200, col: FLC[i % 7] }); }
  },
};
