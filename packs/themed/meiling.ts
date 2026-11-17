import { type World, atan2, hypot } from '@kernel';
import { BF, ISRC, PS, type CombatState, bodyR, hit, jTxt, parryFx, parryOn, pushJ, pushJc, sfx, wallHit } from '@pack/combat/api';
import type { ThemedState } from './state';

/** Hong Meiling, The Gate Is Closed (legacy GIVE.meiling / chPre CX.wall, line 1030): a vertical gate at the owner's x for 10 s.
 *  Nobody but the owner crosses it (pushed back as a wall contact), a foe on the owner's side who comes close eats a RAINBOW KICK (70-frame cooldown),
 *  and every foe bullet that crosses the gate line is destroyed. */
const RB = ['#ff4a4a', '#ffa63a', '#ffe83a', '#5cff7a', '#4ab3ff', '#c06cff'];
export const MKICK = { dmg: 9, kb: 15, stun: 34 };
export function meilingGate(w: World, s: CombatState, T: ThemedState, al: number[], n: number): void {
  if (T.wallO < 0) return;
  const o = T.wallO, x = T.wallX;
  if (s.state[o] === PS.dead) { T.wallO = -1; return; }
  T.gside[o] = s.x[o]! >= x ? 1 : -1;
  for (let j = 0; j < n; j++) {
    const q = al[j]!; if (q === o || s.state[q] === PS.dead) continue;
    const R = bodyR(s, q); if (!T.gside[q]) T.gside[q] = s.x[q]! >= x ? 1 : -1;
    if (T.gside[q]! > 0 && s.x[q]! < x + R) { s.x[q] = x + R; wallHit(w, s, q, 0); } else if (T.gside[q]! < 0 && s.x[q]! > x - R) { s.x[q] = x - R; wallHit(w, s, q, 0); }
    if (s.state[q] !== PS.dead && T.gside[q] === T.gside[o] && hypot(s.x[q]! - s.x[o]!, s.y[q]! - s.y[o]!) < bodyR(s, q) + bodyR(s, o) + 18 && T.mkCD[q]! < s.gf && s.inv[q]! <= 0 && s.state[o] !== PS.hitstun) {
      T.mkCD[q] = s.gf + 70; pushJ(w, 'SMR', 'x', s.x[o]!, 'y', s.y[o]!, 'a', atan2(s.y[q]! - s.y[o]!, s.x[q]! - s.x[o]!), 't', 16); sfx(w, 'swordheavy', 0.6); jTxt(w, s.x[o]!, s.y[o]! - 40, 'RAINBOW KICK!', RB[s.gf % 6]!, 16);
      if (parryOn(s, q)) parryFx(w, s, q); else hit(w, s, q, o, s.x[q]! - s.x[o]!, s.y[q]! - s.y[o]!, MKICK, ISRC.mkick, 1, true);
    }
  }
  for (let i = 0; i < s.nb; i++) if (s.bowner[i] !== o && (s.bx[i]! - x) * (s.bx[i]! - s.bvx[i]! - x) < 0) { s.bflags[i] = s.bflags[i]! | BF.dead; pushJc(w, 'FX', 480, 'x', s.bx[i]!, 'y', s.by[i]!, 'vx', 0, 'vy', 0, 't', 10, 'c', '#3fbf6f'); }
}
