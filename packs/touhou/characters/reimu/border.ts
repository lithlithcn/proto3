import { addEnt, entsOf } from '@pack/combat/api';
import { cos, sin } from '@kernel';
import type { World } from '@kernel';
import type { CombatState } from '@pack/combat/api';
import { EK_BAR } from './kinds';

const L: number[] = [];
/** Skill 2 — Cautionary Border: a barrier in front of her that deletes foe bullets and stuns melee attackers (5 s, 15 s cooldown). */
export function reimuBorder(w: World, s: CombatState, p: number): void {
  if (s.skC2[p]! > s.gf) { w.emit('combat:skill-cooldown', { p, left: s.skC2[p]! - s.gf }); return; }
  s.skC2[p] = s.gf + 900;
  for (let k = entsOf(s, EK_BAR, p, L), i = 0; i < k; i++) s.et[L[i]!] = 0;
  const a = s.aim[p]!, i = addEnt(s, EK_BAR, p, 300, s.x[p]! + cos(a) * 58, s.y[p]! + sin(a) * 58);
  if (i >= 0) { s.ea[i] = a + Math.PI / 2; s.ew[i] = 62; s.eh[i] = 18; }
}
