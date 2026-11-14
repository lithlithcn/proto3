import { T } from '../tuning';
import { PS, type CombatState } from '../state';
import { type World, hypot } from '@kernel';
import { explodeBombs, spawnBombs } from './bombs';
import { updateBlade } from './blade';
import { updateFreeze } from './freeze';
import { updateHoles } from './hole';
import { updateBumpers } from './bumpers';

/** Entity kind of the healing orbs (item `green`); kinds >= 100 are reserved for items. Owner is -1 (ownerless: they outlive every player). */
export const EK_HEAL = 100;

/** Legacy updWorld, item part, in the legacy order: ice, holes, bumpers, timers + elixir, Warp countdown, blades + bomb spawns, bomb explosions, healing orbs. */
export function updateItemWorld(w: World, s: CombatState): void {
  updateFreeze(s); updateHoles(w, s); updateBumpers(w, s);
  for (let p = 0; p < s.n; p++) {
    if (s.state[p] === PS.dead) continue;
    if (s.mirror[p]! > 0) s.mirror[p]!--;
    if (s.giant[p]! > 0) s.giant[p]!--;
  }
  if (s.warp > 0) s.warp--;
  for (let p = 0; p < s.n; p++) { if (s.state[p] === PS.dead) continue; updateBlade(s, w, p); spawnBombs(s, p); }
  explodeBombs(w, s);
  for (let i = 0; i < s.nent; i++) {
    if (s.ek[i] !== EK_HEAL) continue;
    s.ex[i] = s.ex[i]! + s.evx[i]!; s.ey[i] = s.ey[i]! + s.evy[i]!; // t is ticked by updateEnts
    if (s.ex[i]! < 10 || s.ex[i]! > s.mapW - 10) s.evx[i] = -s.evx[i]!;
    if (s.ey[i]! < 10 || s.ey[i]! > s.mapH - 10) s.evy[i] = -s.evy[i]!;
    for (let q = 0; q < s.n; q++) if (s.state[q] !== PS.dead && hypot(s.x[q]! - s.ex[i]!, s.y[q]! - s.ey[i]!) < T.BODY_R + 8) { s.hp[q] = Math.min(T.HP, s.hp[q]! + 100); s.et[i] = 0; break; }
  }
}
