import { atan2, hypot, sin, type World } from '@kernel';
import { BF, type CombatState, customHeavy, nearFoe, sfx, jBurst } from '@pack/combat/api';
import { EK_NUFO } from './kinds';

/** UFO turret (legacy wrapper that runs after the whole entity pass): bobs, eats foreign light bullets (4 hp), fires a triple shot at the nearest foe within 700 px every 40 frames. */
export function nueUfo(w: World, s: CombatState, p: number): void {
  for (let i = s.eLo; i < s.eHi; i++) {
    if (s.eo[i] !== p || s.ek[i] !== EK_NUFO || s.et[i]! <= 0) continue;
    s.ey[i] = s.ey[i]! + sin(s.gf * 0.05 + s.ex[i]!) * 0.4;
    for (let b = 0; b < s.nb; b++) {
      if ((s.bflags[b]! & (BF.dead | BF.heavy)) || s.bowner[b] === p || hypot(s.bx[b]! - s.ex[i]!, s.by[b]! - s.ey[i]!) >= 22) continue;
      s.bflags[b] = s.bflags[b]! | BF.dead; s.eh[i] = s.eh[i]! - 1; if (s.eh[i]! <= 0) { s.et[i] = 0; jBurst(w, s.ex[i]!, s.ey[i]!, '#9a6aff', 14); sfx(w, 'break', 0.5); }
    }
    s.er[i] = s.er[i]! - 1;
    if (s.er[i]! <= 0) {
      const q = nearFoe(s, p, s.ex[i]!, s.ey[i]!); s.er[i] = 40;
      if (q >= 0 && hypot(s.x[q]! - s.ex[i]!, s.y[q]! - s.ey[i]!) < 700) { const a = atan2(s.y[q]! - s.ey[i]!, s.x[q]! - s.ex[i]!); for (const da of [-0.18, 0, 0.18]) customHeavy(s, p, s.ex[i]!, s.ey[i]!, a + da, 4.2, 7, { dmg: 3.5, kb: 5, stun: 16, arm: 0 }, 200, 0x9a6aff); sfx(w, 'shoot3', 0.25); }
    }
  }
}
