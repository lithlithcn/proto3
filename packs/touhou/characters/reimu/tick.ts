import { TAU, customHeavy } from '@pack/combat/api';
import type { World } from '@kernel';
import type { CombatState } from '@pack/combat/api';
import { BF } from '@pack/combat/api';

/** Reimu per-frame hook (legacy `tick`, split part): her back-heavy orbs burst into six small orbs when their timer ends. TODO: yin-yang orbs, Border. */
export function reimuTick(_w: World, s: CombatState, p: number): void {
  for (let i = 0; i < s.nb; i++) {
    if (!s.bspl[i] || s.bowner[i] !== p || (s.bflags[i]! & BF.dead) || s.gf < s.bspl[i]!) continue;
    s.bflags[i] = s.bflags[i]! | BF.dead;
    for (let k = 0; k < 6; k++) customHeavy(s, p, s.bx[i]!, s.by[i]!, k * TAU / 6 + s.gf * 0.1, 3.4, 5, { dmg: 3, kb: 3, stun: 12, arm: 0 }, 110, 0x9ab4ff);
  }
}
