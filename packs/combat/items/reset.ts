import type { CombatState } from '../state';

/** Clears every item-granted state of a player (legacy K.O. / respawn `Object.assign`): one list so a new item cannot be forgotten in one of the two places. */
export function resetItems(s: CombatState, p: number): void {
  s.blade[p] = 0; s.bombs[p] = 0; s.rifle[p] = 0; s.mirror[p] = 0; s.giant[p] = 0; s.clone[p] = 0; s.spk[p] = 0; s.cam[p] = 0; s.ult[p] = 0;
}
