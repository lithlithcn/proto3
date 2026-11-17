import { type World, hypot } from '@kernel';
import { PS, type CombatState, addEnt, entsOf, jfx } from '@pack/combat/api';
import type { TouhouState } from '../../state';
import { EK_NCL } from './kinds';

/** Standing still (speed < 0.6, idle) gathers a dark cloud every 20 frames (max 8); the next light shot launches them all. */
export function nueTick(w: World, s: CombatState, p: number): void {
  const t = w.slice<TouhouState>('touhou');
  if (hypot(s.vx[p]!, s.vy[p]!) < 0.6 && s.state[p] === PS.idle) {
    t.nS[p] = t.nS[p]! + 1;
    if (t.nS[p]! % 20 === 0) { const L: number[] = []; if (entsOf(s, EK_NCL, p, L) < 8) { const e = addEnt(s, EK_NCL, p, 900, s.x[p]!, s.y[p]!); if (e >= 0) s.ebc[e] = t.nS[p]! / 20 | 0; } }
  } else t.nS[p] = 0;
  jfx(w, 'ndsf', p, s.x[p]!, s.y[p]!); // dash afterimage, end of the legacy tick (line 4458; the deadline lives in the juice)
}
