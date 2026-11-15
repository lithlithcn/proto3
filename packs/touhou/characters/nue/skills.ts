import { type World, cos, sin } from '@kernel';
import { PS, type CombatState, entsOf, jBurst, jTxt } from '@pack/combat/api';
import type { TouhouState } from '../../state';
import { EK_NUFO } from './kinds';

/** Skill 1 — Disguise: for 4 s she becomes a random other living player (whole kit and spell card; legacy swapped the shot type, which every hook follows). 10 s cooldown. */
export function nueDisguise(w: World, s: CombatState, p: number): void {
  if (s.skC1[p]! > s.gf) { w.emit('combat:skill-cooldown', { p, left: s.skC1[p]! - s.gf, n: 'DISGUISE' }); return; }
  s.skC1[p] = s.gf + 600;
  const L: number[] = []; for (let q = 0; q < s.n; q++) if (q !== p && s.state[q] !== PS.dead) L.push(q);
  if (!L.length) return;
  const q = L[s.gf % L.length]!, t = w.slice<TouhouState>('touhou');
  t.nD[p] = s.gf + 240; t.nDid[p] = q;
  if (s.charIdx[q] !== s.charIdx[p] && !t.nOr[p]) { t.nOr[p] = 1; t.nOc[p] = s.charIdx[p]!; t.nOsp[p] = s.spI[p]!; s.charIdx[p] = s.charIdx[q]!; s.spI[p] = s.spI[q]!; }
  jBurst(w, s.x[p]!, s.y[p]!, '#2a1a4a', 20);
}

/** Skill 2 — swap places with the UFO furthest ahead of her aim (4 s cooldown; nothing without a UFO). */
export function nueSwap(w: World, s: CombatState, p: number): void {
  const U: number[] = []; entsOf(s, EK_NUFO, p, U); if (!U.length) { jTxt(w, s.x[p]!, s.y[p]! - 40, 'NO UFO', '#888', 13); return; }
  if (s.skC2[p]! > s.gf) { w.emit('combat:skill-cooldown', { p, left: s.skC2[p]! - s.gf, n: 'SWAP' }); return; }
  s.skC2[p] = s.gf + 240;
  let u = U[0]!, bd = -1e9;
  for (const e of U) { const d = (s.ex[e]! - s.x[p]!) * cos(s.aim[p]!) + (s.ey[e]! - s.y[p]!) * sin(s.aim[p]!); if (d > bd) { bd = d; u = e; } }
  const x = s.x[p]!, y = s.y[p]!; s.x[p] = s.ex[u]!; s.y[p] = s.ey[u]!; s.ex[u] = x; s.ey[u] = y; jBurst(w, x, y, '#2a1a4a', 14);
}
