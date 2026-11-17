import { big, burst, sfx, txt } from '../jfx';
import { T } from '../tuning';
import { PS, type CombatState } from '../state';
import { type World, hypot } from '@kernel';
import { explodeBombs, spawnBombs } from './bombs';
import { updateBlade } from './blade';
import { updateFreeze } from './freeze';
import { updateHoles } from './hole';
import { updateBumpers } from './bumpers';
import { updateSpark } from './spark';
import { updateFairies } from './fairy';

/** Entity kind of the healing orbs (item `green`); kinds >= 100 are reserved for items. Owner is -1 (ownerless: they outlive every player). */
export const EK_HEAL = 100;

/** Legacy updWorld, item part, in the legacy order: ice, holes, bumpers, timers + elixir, Warp countdown, blades + bomb spawns, bomb explosions, healing orbs. */
export function updateItemWorld(w: World, s: CombatState): void {
  if (s.tstop > 0 && --s.tstop === 0) { big(w, 'TIME RESUMES', '#00d0a0', 40); sfx(w, 'se_kira00'); w.emit('combat:time-resume', {}); }
  updateFreeze(w, s); updateHoles(w, s); updateBumpers(w, s);
  for (let p = 0; p < s.n; p++) {
    if (s.state[p] === PS.dead) continue;
    if (s.mirror[p]! > 0) s.mirror[p]!--;
    if (s.giant[p]! > 0) s.giant[p]!--;
    if (s.clone[p]! > 0) s.clone[p]!--;
    updateSpark(w, s, p);
    if (s.cam[p]! > 0) s.boost[p] = T.DASH_CHARGES; // Tengu Camera: unlimited dashes
  }
  if (s.warp > 0 && --s.warp === 0) big(w, 'WARP OVER', '#b45cff', 36);
  for (let p = 0; p < s.n; p++) { if (s.state[p] === PS.dead) continue; updateBlade(s, w, p); spawnBombs(w, s, p); }
  explodeBombs(w, s);
  for (let i = 0; i < s.nent; i++) {
    if (s.ek[i] !== EK_HEAL) continue;
    s.ex[i] = s.ex[i]! + s.evx[i]!; s.ey[i] = s.ey[i]! + s.evy[i]!; // t is ticked by updateEnts
    if (s.ex[i]! < 10 || s.ex[i]! > s.mapW - 10) s.evx[i] = -s.evx[i]!;
    if (s.ey[i]! < 10 || s.ey[i]! > s.mapH - 10) s.evy[i] = -s.evy[i]!;
    for (let q = 0; q < s.n; q++) if (s.state[q] !== PS.dead && hypot(s.x[q]! - s.ex[i]!, s.y[q]! - s.ey[i]!) < T.BODY_R + 8) { s.hp[q] = Math.min(T.HP, s.hp[q]! + 100); s.et[i] = 0; txt(w, s.x[q]!, s.y[q]! - 30, '+100', '#5f8', 22); burst(w, s.ex[i]!, s.ey[i]!, '#5f8', 8); sfx(w, 'se_powerup', 0.35); break; }
  }
  updateFairies(w, s);
}
