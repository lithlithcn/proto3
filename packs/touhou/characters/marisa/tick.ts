import type { World } from '@kernel';
import { PS, addEnt, type CombatState } from '@pack/combat/api';
import { EK_TRAIL } from './kinds';
import type { TouhouState } from '../../state';

/** Marisa per-frame hook: focus heats the Hakkero (at 100+ it burns her 0.06 hp/frame, never below 1), otherwise it cools; after a boosted dash she brakes for 25 frames. */
export function marisaTick(w: World, s: CombatState, p: number): void {
  const t = w.slice<TouhouState>('touhou');
  if (s.focus[p] && s.state[p] !== PS.spell) {
    t.mH[p] = Math.min(130, t.mH[p]! + 0.8);
    if (t.mH[p]! >= 100) s.hp[p] = Math.max(1, s.hp[p]! - 0.06);
  } else t.mH[p] = Math.max(0, t.mH[p]! - 0.4);
  if (t.mBS[p]) {
    if (s.state[p] === PS.dash && s.gf < t.mBS[p]!) { if (s.gf % 2 === 0) addEnt(s, EK_TRAIL, p, 40, s.x[p]!, s.y[p]!); return; }
    if (s.gf < t.mBS[p]! + 25) { s.vx[p] = s.vx[p]! * 0.8; s.vy[p] = s.vy[p]! * 0.8; } else t.mBS[p] = 0;
  }
}
