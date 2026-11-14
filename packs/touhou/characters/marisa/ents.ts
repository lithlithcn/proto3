import { type World, hypot } from '@kernel';
import { PS, T, TAU, addEnt, customHeavy, foe, hit, parryFx, type CombatState } from '@pack/combat/api';
import { EK_POT, EK_PUD, EK_TRAIL } from './kinds';
import type { TouhouState } from '../../state';

/** Potion in flight (30 frames, straight line) and the puddle it leaves (legacy EST.mpot / EST.mpud), run after every character tick. */
export function marisaEnts(w: World, s: CombatState, p: number): void {
  for (let i = 0; i < s.nent; i++) {
    if (s.eo[i] !== p || s.et[i]! <= 0) continue;
    if (s.ek[i] === EK_POT) {
      const u = 1 - s.et[i]! / s.ebc[i]!;
      s.ex[i] = s.er[i]! + (s.ea[i]! - s.er[i]!) * u; s.ey[i] = s.eh[i]! + (s.ew[i]! - s.eh[i]!) * u;
      if (s.et[i] === 1) addEnt(s, EK_PUD, p, 240, s.ea[i]!, s.ew[i]!);
    } else if (s.ek[i] === EK_TRAIL) { // comet trail: a 14 px hitbox per segment, shared 20-frame cooldown per victim
      const H = w.slice<TouhouState>('touhou').mHc;
      for (let q = 0; q < s.n; q++) {
        if (q === p || s.state[q] === PS.dead || s.inv[q]! > 0 || !foe(s, p, q) || H[q]! > s.gf || hypot(s.x[q]! - s.ex[i]!, s.y[q]! - s.ey[i]!) >= 14 + T.BODY_R) continue;
        H[q] = s.gf + 20;
        if (s.state[q] === PS.parry) parryFx(w, s, q); else hit(w, s, q, p, s.x[q]! - s.ex[i]!, s.y[q]! - s.ey[i]!, { dmg: 3, kb: 6, stun: 16 }, -1, 1, true);
      }
    } else if (s.ek[i] === EK_PUD) {
      const x = s.ex[i]!, y = s.ey[i]!;
      let go = s.et[i] === 1;
      for (let q = 0; q < s.n && !go; q++) if (s.state[q] !== PS.dead && s.inv[q]! <= 0 && foe(s, p, q) && q !== p && hypot(s.x[q]! - x, s.y[q]! - y) < 40 + T.BODY_R) go = true;
      if (!go) continue;
      s.et[i] = 0;
      for (let q = 0; q < s.n; q++) {
        if (q === p || s.state[q] === PS.dead || s.inv[q]! > 0 || !foe(s, p, q)) continue;
        const dx = s.x[q]! - x, dy = s.y[q]! - y, d = hypot(dx, dy) || 1;
        if (d < 70 + T.BODY_R) { if (s.state[q] === PS.parry) parryFx(w, s, q); else hit(w, s, q, p, dx / d, dy / d, { dmg: 11, kb: 14, stun: 36 }, -1, 1, true); }
      }
      for (let k = 0; k < 10; k++) customHeavy(s, p, x, y, k * TAU / 10, 5, 6, { dmg: 3, kb: 3, stun: 12, arm: 0 }, 90, k % 2 ? 0xffe14a : 0x7cff7a);
    }
  }
}
