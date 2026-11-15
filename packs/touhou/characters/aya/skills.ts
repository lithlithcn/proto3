import { type World, cos, sin } from '@kernel';
import { type CombatState, addEnt, entsOf, nearFoe } from '@pack/combat/api';
import { EK_ANW, EK_AWD } from './kinds';

/** Skill 1 — SCOOP: a newspaper flies onto the nearest foe (10 s cooldown, spent even without a target). */
export function ayaScoop(w: World, s: CombatState, p: number): void {
  if (s.skC1[p]! > s.gf) { w.emit('combat:skill-cooldown', { p, left: s.skC1[p]! - s.gf }); return; }
  s.skC1[p] = s.gf + 600;
  const q = nearFoe(s, p, s.x[p]!, s.y[p]!); if (q < 0) return;
  const e = addEnt(s, EK_ANW, p, 150, s.x[q]!, s.y[q]!); if (e >= 0) s.ebc[e] = q;
}

/** Skill 2 — TAILWIND: a 5 s wind field along her aim pushes every fighter and every light bullet (12 s cooldown; a new one replaces the old). */
export function ayaTailwind(w: World, s: CombatState, p: number): void {
  if (s.skC2[p]! > s.gf) { w.emit('combat:skill-cooldown', { p, left: s.skC2[p]! - s.gf }); return; }
  s.skC2[p] = s.gf + 720;
  const L: number[] = []; entsOf(s, EK_AWD, p, L); for (const i of L) s.et[i] = 0;
  const e = addEnt(s, EK_AWD, p, 300, s.x[p]!, s.y[p]!); if (e >= 0) { s.evx[e] = 0; s.ea[e] = s.aim[p]!; s.er[e] = cos(s.aim[p]!); s.eh[e] = sin(s.aim[p]!); }
}
