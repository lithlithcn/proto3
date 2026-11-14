import type { World } from '@kernel';
import { hit } from './player/hit';
import { parryFx } from './player/parry';
import { PS, type CombatState } from './state';

/** Legacy `chHitQ`: a character-owned hazard (entity, ray, trail) hits `q` for `o`; a parrying victim answers with the parry effect instead (returns false). Not tracked for stun repeats. */
export function chHitQ(w: World, s: CombatState, o: number, q: number, dx: number, dy: number, dmg: number, kb: number, stun: number): boolean {
  if (s.state[q] === PS.parry) { parryFx(w, s, q); return false; }
  hit(w, s, q, o, dx, dy, { dmg, kb, stun }, -1, 1, true); return true;
}
