import { type World, hypot } from '@kernel';
import { addEnt } from '../ents';
import { hit } from '../player/hit';
import { parryFx } from '../player/parry';
import { spRand } from '../bullets/pattern';
import { ISRC } from '../moves';
import { PS, type CombatState } from '../state';
import { T } from '../tuning';

/** Entity kind of a bomb zone (ownerless entity: `ew` = thrower, so it still explodes if the thrower is KO'd). */
export const EK_BOMB = 101;
const BOMB = { dmg: 12, kb: 13, stun: 30 };
const clamp = (v: number, a: number, b: number): number => (v < a ? a : v > b ? b : v);

/** Item `orange`: for 8 s a zone appears near a random foe, ever faster, exploding after 180 frames. Draw order of the shared RNG: foe, x, y. */
export function spawnBombs(s: CombatState, p: number): void {
  if (s.bombs[p]! <= 0) return;
  s.bombs[p]!--;
  s.bombN[p] = (s.bombN[p]! || 1) - 1;
  if (s.bombN[p]! > 0) return;
  s.bombN[p] = Math.round(10 + 70 * s.bombs[p]! / 480);
  const al: number[] = [];
  for (let q = 0; q < s.n; q++) if (q !== p && s.state[q] !== PS.dead) al.push(q);
  if (!al.length) return;
  const q = al[(spRand(s) * al.length) | 0]!;
  const x = clamp(s.x[q]! + (spRand(s) - 0.5) * 220, 40, s.mapW - 40), y = clamp(s.y[q]! + (spRand(s) - 0.5) * 220, 40, s.mapH - 40);
  const e = addEnt(s, EK_BOMB, -1, 180, x, y);
  if (e >= 0) { s.er[e] = 90; s.ew[e] = p; }
}

/** Zones explode on the frame their timer reaches 0 (the generic entity tick runs right after this, so `et === 1` here). */
export function explodeBombs(w: World, s: CombatState): void {
  for (let i = 0; i < s.nent; i++) {
    if (s.ek[i] !== EK_BOMB || s.et[i]! !== 1) continue;
    const o = s.ew[i]!;
    for (let q = 0; q < s.n; q++) {
      if (q === o || s.state[q] === PS.dead || s.inv[q]! > 0) continue;
      const dx = s.x[q]! - s.ex[i]!, dy = s.y[q]! - s.ey[i]!;
      if (hypot(dx, dy) < s.er[i]! + T.BODY_R) { if (s.state[q] === PS.parry) { parryFx(w, s, q); continue; } hit(w, s, q, o, dx, dy, BOMB, ISRC.bomb, 1, true); }
    }
  }
}
