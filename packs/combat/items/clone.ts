import { atan2, hypot } from '@kernel';
import { PS, BF, type CombatState } from '../state';
import { T } from '../tuning';

/** Item `clone` (Doppelganger): for 10 s a mirrored twin (point symmetry around the arena centre) copies every light shot at 70 % power and soaks bullets (15 hp; heavy = 5). */
export const CLONE = { time: 600, hp: 15, shotMul: 0.7, heavyCost: 5 };

export const clonePos = (s: CombatState, p: number): [number, number] => [s.mapW - s.x[p]!, s.mapH - s.y[p]!];
/** Aim of the clone: at the nearest living foe from its own position (legacy cloneOf), else opposite to the owner's aim. */
export function cloneAim(s: CombatState, p: number): number {
  const [x, y] = clonePos(s, p);
  let q = -1, bd = 1e9;
  for (let c = 0; c < s.n; c++) if (c !== p && s.state[c] !== PS.dead) { const d = hypot(s.x[c]! - x, s.y[c]! - y); if (d < bd) { bd = d; q = c; } }
  return q >= 0 ? atan2(s.y[q]! - y, s.x[q]! - x) : s.aim[p]! + Math.PI;
}

/** End-of-step soak (legacy post-step wrapper): foreign bullets touching the twin are destroyed and wear it down. */
export function updateClone(s: CombatState, p: number): void {
  if (s.clone[p]! <= 0) return;
  const [x, y] = clonePos(s, p);
  for (let i = 0; i < s.nb; i++) {
    const o = s.bowner[i]!;
    if ((s.bflags[i]! & BF.dead) || o === p || (s.teams !== 0 && s.team[o] === s.team[p]) || hypot(s.bx[i]! - x, s.by[i]! - y) >= s.br[i]! + T.BODY_R) continue;
    s.bflags[i] = s.bflags[i]! | BF.dead;
    s.cloneHP[p] = s.cloneHP[p]! - (s.bflags[i]! & BF.heavy ? CLONE.heavyCost : 1);
    if (s.cloneHP[p]! <= 0) { s.clone[p] = 0; break; }
  }
}
