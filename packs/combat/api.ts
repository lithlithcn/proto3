import { sortBy, type World } from '@kernel';
import type { CharacterDef, SpellDef } from './character';
import type { ItemDef } from './items/def';
import type { StatusDef } from './fx';
import type { CombatState } from './state';

export { T, TAU, MAP_LARGE } from './tuning';
export type { CombatState } from './state';
export * from './state';
export type { CharacterDef, ShotCtx, HeavyCtx, SpellDef, SpellCtx, VIn } from './character';
export { sB, addB, hB, tgA, spRand, BK, SH, type PatOpts } from './bullets/pattern';
export { lightBullet, heavyBullet, customHeavy, patternHeavy } from './bullets/spawn';
export type { PCtx } from './input';
export type { MoveDef, MeleeName, HitData } from './moves';
export { MOVES, SRC, MV_NAMES } from './moves';
export { addEnt, entsOf } from './ents';
export { fireRay, EK_RAY, RAYF, type RayOpts } from './rays';
export { powerMul } from './stats';
export { lightHit } from './player/damage';
export type { ItemDef, ItemCtx } from './items/def';
export { giveItem } from './items/cards';
export { fxOn, setFx, clearFx, FXS, MAX_FX, type StatusDef } from './fx';
export { hit } from './player/hit';
export { parryFx } from './player/parry';
export { foe, nearFoe } from './target';
export { bodyR } from './stats';
export { chHitQ } from './chhit';
export { ko } from './player/ko';
export { relStick, moveOf } from './player/atkstart';

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
  if (!l) { l = [...w.registry.list<SpellDef>('spell').map(e => e[1]), ...sortBy(characters(w).slice(), c => c[1].order, c => c[1].order).flatMap(c => (c[1].spell ? [c[1].spell] : []))]; pools.set(w, l); }
  return l;
}
/** Items in legacy list order (`order`), the index every card/`lastIt` refers to. */
const itemPools = new WeakMap<World, ItemDef[]>();
export function itemPool(w: World): ItemDef[] {
  let l = itemPools.get(w);
  if (!l) { l = sortBy(w.registry.list<ItemDef>('item').map(e => e[1]), d => d.order, d => d.order); itemPools.set(w, l); }
  return l;
}
/** Statuses indexed by slot (sparse). */
const statusPools = new WeakMap<World, (StatusDef | undefined)[]>();
export function statusPool(w: World): (StatusDef | undefined)[] {
  let l = statusPools.get(w);
  if (!l) { l = []; for (const [, d] of w.registry.list<StatusDef>('status')) l[d.slot] = d; statusPools.set(w, l); }
  return l;
}
export const charOf = (w: World, s: CombatState, p: number): CharacterDef => characters(w)[s.charIdx[p]!]![1];
