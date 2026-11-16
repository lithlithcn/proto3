import type { World } from '@kernel';
import { type CombatState, entsOf, jTxt, pushJ, sfx } from '@pack/combat/api';
import type { TouhouState } from '../../state';
import { EK_HST } from './kinds';

/** Skill 1 — Trinity: for 1 s all three bodies fire at once (12 s cooldown). */
export function hecatiaTrinity(w: World, s: CombatState, p: number): void {
  if (s.skC1[p]! > s.gf) { w.emit('combat:skill-cooldown', { p, left: s.skC1[p]! - s.gf, n: 'TRINITY' }); return; }
  s.skC1[p] = s.gf + 720; w.slice<TouhouState>('touhou').hTr[p] = s.gf + 60; jTxt(w, s.x[p]!, s.y[p]! - 36, 'TRINITY!', '#c070ff', 16); sfx(w, 'se_enep00', 0.6);
}

/** Skill 2 — swap places with the statue of your previous body (3 s cooldown; nothing happens without a statue). */
export function hecatiaSwap(w: World, s: CombatState, p: number): void {
  const L: number[] = []; entsOf(s, EK_HST, p, L); if (!L.length) { jTxt(w, s.x[p]!, s.y[p]! - 40, 'NO STATUE', '#888', 13); return; }
  if (s.skC2[p]! > s.gf) { w.emit('combat:skill-cooldown', { p, left: s.skC2[p]! - s.gf, n: 'SWAP' }); return; }
  s.skC2[p] = s.gf + 180;
  const i = L[0]!, x = s.x[p]!, y = s.y[p]!; s.x[p] = s.ex[i]!; s.y[p] = s.ey[i]!; s.ex[i] = x; s.ey[i] = y;
  pushJ(w, 'RINGS', 'x', x, 'y', y, 'r', 0, 'm', 40, 't', 12, 'c', '#c070ff'); pushJ(w, 'RINGS', 'x', s.x[p]!, 'y', s.y[p]!, 'r', 0, 'm', 40, 't', 12, 'c', '#fff'); sfx(w, 'teleportation', 0.6);
}
