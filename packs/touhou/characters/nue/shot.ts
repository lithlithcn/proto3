import { BF, type ShotCtx, customHeavy, lightBullet } from '@pack/combat/api';
import { EK_NCL } from './kinds';

/**
 * Nue's light shot: three wavy shots; every gathered cloud is launched as a heavy dark orb (and vanishes); Focus adds six harmless black decoys
 * (`BF.fake`).
 */
export function nueShot(c: ShotCtx): void {
  const { s, p, a } = c;
  for (let i = 0; i < s.nent; i++) {
    if (s.ek[i] !== EK_NCL || s.eo[i] !== p || s.et[i]! <= 0) continue;
    customHeavy(s, p, s.ex[i]!, s.ey[i]!, a + (s.ebc[i]! % 5 - 2) * 0.08, 6.5, 8, { dmg: 4, kb: 5, stun: 16, arm: 0 }, 160, 0x2a1a4a); s.et[i] = 0;
  }
  for (let i = 0; i < 3; i++) { const b = lightBullet(s, p, a + (i - 1) * 0.25, 6, c.pm * 0.6, 5, 120, c.focus ? 0x141018 : 0x4a4aff); if (b >= 0) { s.bwav[b] = 0.12; s.bph[b] = i * 2; } }
  if (c.focus) for (let i = 0; i < 6; i++) { const b = lightBullet(s, p, a + (i - 2.5) * 0.18, 6, 0, 5, 120, 0x141018); if (b >= 0) { s.bwav[b] = 0.12; s.bph[b] = i; s.bflags[b] = s.bflags[b]! | BF.fake; } }
}
