import { cos, hypot, sin } from '@kernel';
import { hit } from '../player/hit';
import { sfxR } from '../jfx';
import { parryFx } from '../player/parry';
import { ISRC } from '../moves';
import { PS, MAXP, type CombatState } from '../state';
import { T } from '../tuning';

/** Item `yellow`: two blades orbit the holder (radius 48, +0.13 rad/frame) and cut anyone they touch, 24 frames apart per victim. Data lives here, not in the item file's behaviour. */
const BLADE = { dmg: 6, kb: 9, stun: 22 };

export function updateBlade(s: CombatState, w: import('@kernel').World, p: number): void {
  if (s.blade[p]! <= 0) return;
  s.blade[p]!--; s.bA[p] = s.bA[p]! + 0.13;
  for (let k = 0; k < 2; k++) {
    const a = s.bA[p]! + k * 3.141592653589793, bx = s.x[p]! + cos(a) * 48, by = s.y[p]! + sin(a) * 48;
    for (let q = 0; q < s.n; q++) {
      if (q === p || s.state[q] === PS.dead || s.inv[q]! > 0 || s.bCD[p * MAXP + q]! > s.gf) continue;
      if (hypot(s.x[q]! - bx, s.y[q]! - by) < T.BODY_R + 12) {
        s.bCD[p * MAXP + q] = s.gf + 24;
        if (s.state[q] === PS.parry) { parryFx(w, s, q); continue; }
        sfxR(w, 'hit', 3, 0.7); hit(w, s, q, p, s.x[q]! - s.x[p]!, s.y[q]! - s.y[p]!, BLADE, ISRC.blade, 1, false);
      }
    }
  }
}
