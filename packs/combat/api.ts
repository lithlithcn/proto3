import type { World } from '@kernel';
import type { CharacterDef } from './character';
import type { CombatState } from './state';

export { T, TAU, MAP_LARGE } from './tuning';
export * from './state';
export type { CharacterDef, ShotCtx } from './character';
export { lightBullet } from './bullets/spawn';
export type { PCtx } from './input';
export type { MoveDef, MeleeName, HitData } from './moves';

export const combatOf = (w: World): CombatState => w.slice<CombatState>('combat');

const cache = new WeakMap<World, [string, CharacterDef][]>();
/** Characters in stable (id-sorted) order; `charIdx` in state indexes this list. */
export function characters(w: World): [string, CharacterDef][] {
  let l = cache.get(w);
  if (!l) { l = w.registry.list<CharacterDef>('character'); cache.set(w, l); }
  return l;
}
export const charOf = (w: World, s: CombatState, p: number): CharacterDef => characters(w)[s.charIdx[p]!]![1];
