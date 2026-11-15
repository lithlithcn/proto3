import { type SpellDef, TAU, addB } from '@pack/combat/api';
import { SEA, SEAC } from './kinds';

/** Secret Ceremony「Four Seasons at Once」: every 6 frames four spinning bullets, one per season (spring heals her, autumn shoves, winter slows). */
export const okinaSpell: SpellDef = {
  name: 'Secret Ceremony「Four Seasons at Once」', loop: 200,
  fn({ s, p, k }) {
    if (k % 6) return;
    for (let i = 0; i < 4; i++) {
      const a = k * 0.05 + i * TAU / 4, b = addB(s, p, a, 3.4, { life: 220, col: SEAC[i] });
      if (b >= 0 && i !== 1) s.bsea[b] = SEA[i]!;
    }
  },
};
