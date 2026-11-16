import { type World, cos, sin } from '@kernel';
import { type CombatState, addEnt, entsOf, nearFoe, jTxt, sfx } from '@pack/combat/api';
import { EK_ANW, EK_AWD } from './kinds';

/** Skill 1 — SCOOP: a newspaper flies onto the nearest foe (10 s cooldown, spent even without a target). */
export function ayaScoop(w: World, s: CombatState, p: number): void {
  if (s.skC1[p]! > s.gf) { w.emit('combat:skill-cooldown', { p, left: s.skC1[p]! - s.gf, n: 'SCOOP' }); return; }
  s.skC1[p] = s.gf + 600;
  const q = nearFoe(s, p, s.x[p]!, s.y[p]!); if (q < 0) return;
  const e = addEnt(s, EK_ANW, p, 150, s.x[q]!, s.y[q]!); if (e >= 0) s.ebc[e] = q; jTxt(w, s.x[q]!, s.y[q]! - 40, 'SCOOP!', '#e04a4a', 16); sfx(w, 'se_kira00', 0.6);
}

/** Skill 2 — TAILWIND: a 5 s wind field along her aim pushes every fighter and every light bullet (12 s cooldown; a new one replaces the old). */
export function ayaTailwind(w: World, s: CombatState, p: number): void {
  if (s.skC2[p]! > s.gf) { w.emit('combat:skill-cooldown', { p, left: s.skC2[p]! - s.gf, n: 'TAILWIND' }); return; }
  s.skC2[p] = s.gf + 720;
  const L: number[] = []; entsOf(s, EK_AWD, p, L); for (const i of L) s.et[i] = 0;
  const e = addEnt(s, EK_AWD, p, 300, s.x[p]!, s.y[p]!); if (e >= 0) { s.evx[e] = 0; s.ea[e] = s.aim[p]!; s.er[e] = cos(s.aim[p]!); s.eh[e] = sin(s.aim[p]!); }
  sfx(w, 'roll', 0.8);
}
