import { TAU } from '../tuning';
import { spRand } from '../bullets/pattern';
import { cos, sin } from '@kernel';
import { BF, type CombatState } from '../state';

/** Item `freeze` (Perfect Freeze): every foe bullet freezes for 90 frames, then shatters in all directions as the holder's; repeats once more after 130 frames. */
const T_FREEZE = 90, T_AGAIN = 130, ICE = 0xbff6ff;

export function freezeBullets(s: CombatState, p: number): void {
  for (let i = 0; i < s.nb; i++) if (s.bowner[i] !== p) { s.bflags[i] = s.bflags[i]! | BF.frozen; s.bcol[i] = ICE; }
  s.frz = T_FREEZE; s.frzO = p;
}
export function giveFreeze(s: CombatState, p: number): void { freezeBullets(s, p); s.frzqO = p; s.frzqN = 2; s.frzqF = s.gf + T_AGAIN; }

/** Start of updWorld: the ice countdown; on expiry each frozen bullet flies off at a random angle/speed (draw order = bullet order). */
export function updateFreeze(s: CombatState): void {
  if (!s.frz || --s.frz > 0) return;
  for (let i = 0; i < s.nb; i++) {
    if (!(s.bflags[i]! & BF.frozen)) continue;
    const a = spRand(s) * TAU, v = 2 + spRand(s) * 2.5;
    s.bflags[i] = (s.bflags[i]! & ~(BF.frozen | BF.grazed)); s.bvx[i] = cos(a) * v; s.bvy[i] = sin(a) * v; s.bowner[i] = s.frzO; s.bhome[i] = 0;
    if (s.bflags[i]! & BF.heavy) s.bdist[i] = s.barm[i]!;
  }
  s.frz = 0;
}
/** After the step (legacy wrapper): the queued second freeze. */
export function updateFreezeQueue(s: CombatState): void {
  if (s.frzqN <= 0 || s.gf < s.frzqF || s.frz) return;
  freezeBullets(s, s.frzqO);
  if (--s.frzqN > 0) s.frzqF = s.gf + T_AGAIN;
}
