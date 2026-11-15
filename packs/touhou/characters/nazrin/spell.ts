import { type SpellDef, TAU, customHeavy } from '@pack/combat/api';
import { pendulum } from './heavy';

/** Dowsing「Nazrin Pendulum」: one huge slow pendulum (200 frames) and every 20 frames a ring of 10 gold orbs. */
export const nazrinSpell: SpellDef = {
  name: 'Dowsing「Nazrin Pendulum」', loop: 200,
  fn({ s, p, k }) {
    if (k === 0) { pendulum(s, p, s.x[p]!, s.y[p]!, s.aim[p]!, 300, 9, true); }
    if (k % 20 === 10) for (let i = 0; i < 10; i++) customHeavy(s, p, s.x[p]!, s.y[p]!, i * TAU / 10 + k, 4.5, 5, { dmg: 3, kb: 3, stun: 12, arm: 0 }, 140, 0xffd23a);
  },
};
