import type { World } from '@kernel';
import type { CharacterDef, SpellDef } from './character';
import type { CombatState } from './state';

export { T, TAU, MAP_LARGE } from './tuning';
export type { CombatState } from './state';
export * from './state';
export type { CharacterDef, ShotCtx, HeavyCtx, SpellDef, SpellCtx } from './character';
export { sB, hB, tgA, spRand, BK, SH, type PatOpts } from './bullets/pattern';
export { lightBullet, heavyBullet, customHeavy, patternHeavy } from './bullets/spawn';
export type { PCtx } from './input';
export type { MoveDef, MeleeName, HitData } from './moves';
export { MOVES, SRC } from './moves';

export const combatOf = (w: World): CombatState => w.slice<CombatState>('combat');

const cache = new WeakMap<World, [string, CharacterDef][]>();
/** Characters in stable (id-sorted) order; `charIdx` in state indexes this list. */
export function characters(w: World): [string, CharacterDef][] {
  let l = cache.get(w);
  if (!l) { l = w.registry.list<CharacterDef>('character'); cache.set(w, l); }
  return l;
}
const pools = new WeakMap<World, SpellDef[]>();
/** Spell pool every cast draws from: shared spells (content type `spell`, id-sorted) then each character's own, in character order. */
export function spellPool(w: World): SpellDef[] {
  let l = pools.get(w);
  if (!l) { l = [...w.registry.list<SpellDef>('spell').map(e => e[1]), ...characters(w).flatMap(c => (c[1].spell ? [c[1].spell] : []))]; pools.set(w, l); }
  return l;
}
export const charOf = (w: World, s: CombatState, p: number): CharacterDef => characters(w)[s.charIdx[p]!]![1];
