import type { World } from '@kernel';
import { PS, TAU, spRand, type CombatState } from '@pack/combat/api';
import { ang, fb, hb, ring } from './fire';

/** Daiyousei, Fairy Ambush (legacy GIVE.daiyousei / updEnt 'efairy'): 7 fairies on the screen edge, each fires every 26 frames at a random foe. */
export const EK_EFAIRY = 300;
const FS: number[] = [];
export function efairy(w: World, s: CombatState, i: number): void {
  if ((s.gf + s.eg[i]!) % 26 !== 0) return;
  const o = s.eo[i]!; let n = 0; for (let q = 0; q < s.n; q++) if (q !== o && s.state[q] !== PS.dead) FS[n++] = q;
  if (!n) return;
  const q = FS[(spRand(s) * n) | 0]!, x = s.ex[i]!, y = s.ey[i]!, a = ang(s, q, x, y), r = spRand(s);
  if (r < 0.4) hb(s, x, y, a, 3.2, o, 0x7fe0a0);
  else if (r < 0.7) ring(s, x, y, 8, 2.4, 0xbff0c8, o, 200, spRand(s) * TAU);
  else for (let k = -2; k <= 2; k++) fb(s, x, y, a + k * 0.18, 3.6, o, 0x7fe0a0);
  void w;
}
