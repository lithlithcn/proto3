import type { World } from '@kernel';
import { type CombatState, addEnt, entsOf } from '@pack/combat/api';
import type { TouhouState } from '../../state';
import { EK_NMS, EK_NRC } from './kinds';

/** Skill 1 — Dig: 1 s of helpless digging, then a random bonus (speed / shield / double mice / bomb coin). 10 s cooldown. */
export function nazrinDig(w: World, s: CombatState, p: number): void {
  if (s.skC1[p]! > s.gf) { w.emit('combat:skill-cooldown', { p, left: s.skC1[p]! - s.gf, n: 'DIG' }); return; }
  s.skC1[p] = s.gf + 600; w.slice<TouhouState>('touhou').nDig[p] = s.gf + 60;
}

/** Skill 2 — Recall: every sentinel mouse rushes back to her, biting foes on the way. 5 s cooldown. */
export function nazrinRecall(w: World, s: CombatState, p: number): void {
  if (s.skC2[p]! > s.gf) { w.emit('combat:skill-cooldown', { p, left: s.skC2[p]! - s.gf, n: 'RECALL' }); return; }
  s.skC2[p] = s.gf + 300;
  const L: number[] = []; entsOf(s, EK_NMS, p, L);
  for (const i of L) { s.et[i] = 0; addEnt(s, EK_NRC, p, 120, s.ex[i]!, s.ey[i]!); }
}
