import { type HeavyCtx, heavyBullet } from '@pack/combat/api';
import { throwOrbs } from './orbs';

/**
 * Reimu heavy shots (legacy `heavy`). F: five fast needles fanned toward the foe; B: three slow big orbs that split into six
 * small orbs after 28 frames (see `reimuTick`). N (yin-yang orbs, bouncing entities) arrives with her spell/skill batch.
 */
export const reimuHeavy = {
  N(c: HeavyCtx): void { throwOrbs(c.s, c.p, 1); },
  F(c: HeavyCtx): void { for (let i = -2; i <= 2; i++) heavyBullet(c.s, c.p, c.src, c.m, c.a + i * 0.09, c.k, { spd: 10 + Math.abs(i) * 0.6, r: 8, k: 0.38, col: 0xb04aff }); },
  B(c: HeavyCtx): void {
    for (const o of [-0.5, 0, 0.5]) {
      heavyBullet(c.s, c.p, c.src, c.m, c.a + o, c.k, { spd: 4, r: 14, k: 0.45, life: 200, col: 0x8ab0ff });
      const b = c.s.nb - 1; // legacy: the LAST bullet of the call gets the timer (an extra of a charged shot if there is one)
      if (b >= 0 && c.s.bowner[b] === c.p) c.s.bspl[b] = c.s.gf + 28;
    }
  },
} as const;
