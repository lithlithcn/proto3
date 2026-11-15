import { type World, cos, hypot, sin } from '@kernel';
import { RAYF, addEnt, fireRay, foe, type CombatState, PS } from '@pack/combat/api';
import { TAU } from '@pack/combat/api';
import { EK_POT } from './kinds';

/** Skill 1 — star potion: a flask lobbed (max 260 px) at the nearest foe, bursting into a puddle that detonates on contact or after 4 s. 5 s cooldown. */
export function marisaPotion(w: World, s: CombatState, p: number): void {
  if (s.skC1[p]! > s.gf) { w.emit('combat:skill-cooldown', { p, left: s.skC1[p]! - s.gf, n: 'POTION' }); return; }
  s.skC1[p] = s.gf + 300;
  let q = -1, bd = 1e9;
  for (let c = 0; c < s.n; c++) if (c !== p && s.state[c] !== PS.dead && foe(s, p, c)) { const d = hypot(s.x[c]! - s.x[p]!, s.y[c]! - s.y[p]!); if (d < bd) { bd = d; q = c; } }
  let tx = q >= 0 ? s.x[q]! : s.x[p]! + cos(s.aim[p]!) * 220, ty = q >= 0 ? s.y[q]! : s.y[p]! + sin(s.aim[p]!) * 220;
  const d = hypot(tx - s.x[p]!, ty - s.y[p]!);
  if (d > 260) { tx = s.x[p]! + (tx - s.x[p]!) / d * 260; ty = s.y[p]! + (ty - s.y[p]!) / d * 260; }
  const i = addEnt(s, EK_POT, p, 30, s.x[p]!, s.y[p]!);
  if (i >= 0) { s.ebc[i] = 30; s.er[i] = s.x[p]!; s.eh[i] = s.y[p]!; s.ea[i] = tx; s.ew[i] = ty; }
}

/** Skill 2 — Non-Directional Laser: four short spinning lasers around her (2 s, 8 s cooldown). */
export function marisaLaser(w: World, s: CombatState, p: number): void {
  if (s.skC2[p]! > s.gf) { w.emit('combat:skill-cooldown', { p, left: s.skC2[p]! - s.gf, n: 'LASER' }); return; }
  s.skC2[p] = s.gf + 480;
  for (let i = 0; i < 4; i++) fireRay(s, p, { T: 120, tele: 14, flags: RAYF.follow | RAYF.nodash, w: 4, len: 120, dmg: 1.5, ev: 10, kb: 3, stun: 12, a: s.aim[p]! + i * TAU / 4, spin: 0.045 });
}
