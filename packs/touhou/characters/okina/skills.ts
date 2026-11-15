import type { World } from '@kernel';
import { type CombatState, addEnt, entsOf, pushJ } from '@pack/combat/api';
import type { TouhouState } from '../../state';
import { EK_ODN, EK_ODR } from './kinds';

/** Skill 1 — place a door (max 3, 30 s life, 50 hp); doors copy her shots, break her dash into a teleport and sit on the ray. 0.7 s cooldown. */
export function okinaDoor(w: World, s: CombatState, p: number): void {
  if (s.skC1[p]! > s.gf) return;
  s.skC1[p] = s.gf + 40;
  const e = addEnt(s, EK_ODR, p, 1800, s.x[p]!, s.y[p]!); if (e >= 0) s.eh[e] = 50; pushJ(w, 'RINGS', 'x', s.x[p]!, 'y', s.y[p]!, 'r', 0, 'm', 40, 't', 12, 'c', '#ffd23a');
  const L: number[] = []; entsOf(s, EK_ODR, p, L); for (let i = 0; i < L.length - 3; i++) s.et[L[i]!] = 0;
}

/** Skill 2 — backup dancers: first press places Satono, a second press right after adds Mai (linked: they kick foes toward each other); 10 s cooldown on the first. */
export function okinaDancers(w: World, s: CombatState, p: number): void {
  const t = w.slice<TouhouState>('touhou'), D: number[] = []; entsOf(s, EK_ODN, p, D);
  if (D.length === 1 && s.ebc[D[0]!] === 0 && !t.oMai[p]) {
    const e = addEnt(s, EK_ODN, p, 300, s.x[p]!, s.y[p]!); if (e >= 0) { s.ebc[e] = 1; s.er[e] = 30; }
    s.et[D[0]!] = Math.max(s.et[D[0]!]!, 300); t.oMai[p] = 1; return;
  }
  if (s.skC2[p]! > s.gf) { w.emit('combat:skill-cooldown', { p, left: s.skC2[p]! - s.gf, n: 'DANCERS' }); return; }
  for (const i of D) s.et[i] = 0;
  const e = addEnt(s, EK_ODN, p, 300, s.x[p]!, s.y[p]!); if (e >= 0) { s.ebc[e] = 0; s.er[e] = 30; }
  t.oMai[p] = 0; s.skC2[p] = s.gf + 600;
}
