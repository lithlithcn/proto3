import type { World } from '@kernel';
import { addEnt, entsOf, addJ, sfx } from '@pack/combat/api';
import { cos, sin } from '@kernel';
import type { CombatState } from '@pack/combat/api';
import { EK_ORB } from './kinds';

const SPREAD: Record<number, number[]> = { 1: [0], 2: [-0.35, 0.35], 4: [-0.6, -0.2, 0.2, 0.6] };
const L: number[] = [];
/** Throw `n` (1, 2 or 4) bouncing yin-yang orbs along the aim; she can only keep the 4 newest. */
export function throwOrbs(w: World, s: CombatState, p: number, n: number): void {
  for (const o of SPREAD[n]!) {
    const a = s.aim[p]! + o, i = addEnt(s, EK_ORB, p, 600, s.x[p]! + cos(a) * 24, s.y[p]! + sin(a) * 24);
    if (i < 0) continue;
    s.evx[i] = cos(a) * 4.5; s.evy[i] = sin(a) * 4.5; s.er[i] = 15;
  }
  const k = entsOf(s, EK_ORB, p, L);
  for (let i = 0; i < k - 4; i++) s.et[L[i]!] = 0;
  addJ(w, 'shake', 2, 28); sfx(w, 'tan00', 0.6);
}
