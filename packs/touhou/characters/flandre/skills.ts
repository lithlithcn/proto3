import { type World, atan2, cos, sin } from '@kernel';
import { TAU, addEnt, nearFoe, type CombatState, jBurst, jTxt, sfx } from '@pack/combat/api';
import type { TouhouState } from '../../state';
import { EK_FCL } from './kinds';

/** Skill 1 — Four of a Kind: three clones appear around the nearest foe, then dash at it (8 s cooldown). */
export function flandreClones(w: World, s: CombatState, p: number): void {
  if (s.skC1[p]! > s.gf) { w.emit('combat:skill-cooldown', { p, left: s.skC1[p]! - s.gf, n: 'CLONES' }); return; }
  s.skC1[p] = s.gf + 480;
  const q = nearFoe(s, p, s.x[p]!, s.y[p]!); if (q < 0) return;
  const a0 = atan2(s.y[p]! - s.y[q]!, s.x[p]! - s.x[q]!);
  for (let i = 0; i < 3; i++) {
    const e = addEnt(s, EK_FCL, p, 70, s.x[q]! + cos(a0 + i * TAU / 3) * 160, s.y[q]! + sin(a0 + i * TAU / 3) * 160);
    if (e >= 0) { s.ebc[e] = 70; s.ew[e] = q; }
  }
  sfx(w, 'teleportation', 0.6);
}

/** Skill 2 — Frenzy: pay 12 hp (never below 1) for 4 s of +35 % damage and +25 % speed (10 s cooldown). */
export function flandreFrenzy(w: World, s: CombatState, p: number): void {
  if (s.skC2[p]! > s.gf) { w.emit('combat:skill-cooldown', { p, left: s.skC2[p]! - s.gf, n: 'FRENZY' }); return; }
  s.skC2[p] = s.gf + 600; s.hp[p] = Math.max(1, s.hp[p]! - 12); w.slice<TouhouState>('touhou').fFr[p] = s.gf + 240; jBurst(w, s.x[p]!, s.y[p]!, '#ff3030', 24); jTxt(w, s.x[p]!, s.y[p]! - 34, 'FRENZY!', '#ff3030', 16); sfx(w, 'se_enep01', 0.6);
}
