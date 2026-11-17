import type { World } from '@kernel';
import type { CombatState } from './state';
import type { HitData } from './moves';

/** Content type `rules`: game-rule sets that plug into the legacy extension points (themed items live here; DESIGN §25 R121).
 *  Each function runs where the legacy one ran, so the shared rng draws stay in the same order:
 *  - `pre`  : legacy chPre..chPre5 inside updWorld (after KO beams / global effects). A rule set that owns `pre` must call `tickFxP`
 *             itself at the legacy spot (the generic status countdown is then skipped).
 *  - `hit`  : legacy chHit, before a hit lands; return true = the hit is consumed.
 *  - `dmg`  : legacy chDmg item factors (after the parry streak), returns the new damage.
 *  - `bullet`: legacy chBullet, a bullet touches a fighter; true = consumed.
 *  - `melee`: legacy chMelee, Attack pressed; true = replaced by the item.
 *  - `speed`: legacy chSpeed factor.  - `kill`: legacy chKill (a KO credited to someone). */
export interface HitCtx { w: World; s: CombatState; v: number; a: number; dx: number; dy: number; m: HitData; mult: number; heavy: boolean }
export interface RulesDef {
  pre?(w: World, s: CombatState): void;
  hit?(c: HitCtx): boolean;
  dmg?(w: World, s: CombatState, v: number, a: number, d: number, heavy: boolean): number;
  bullet?(w: World, s: CombatState, i: number, t: number): boolean;
  melee?(w: World, s: CombatState, p: number): boolean;
  speed?(w: World, s: CombatState, p: number): number;
  kill?(w: World, s: CombatState, v: number): void;
  /** an item state (eaten / cocoon / pray) for one frame */ state?(w: World, s: CombatState, p: number): boolean;
  /** wall contact (legacy wall: spit / spin branches first); true = handled */ wall?(w: World, s: CombatState, p: number, ax: number): boolean;
}
const cache = new WeakMap<World, RulesDef[]>();
export const rulesOf = (w: World): RulesDef[] => { let l = cache.get(w); if (!l) { l = w.registry.list<RulesDef>('rules').map(e => e[1]); cache.set(w, l); } return l; };
/** True when a rule set owns the per-frame `pre` (and with it the status countdown). */
export const rulesOwnPre = (w: World): boolean => rulesOf(w).some(r => !!r.pre);
export const bulletRule = (w: World, s: CombatState, i: number, t: number): boolean => { for (const r of rulesOf(w)) if (r.bullet?.(w, s, i, t)) return true; return false; };
export const meleeRule = (w: World, s: CombatState, p: number): boolean => { for (const r of rulesOf(w)) if (r.melee?.(w, s, p)) return true; return false; };
export const stateRule = (w: World, s: CombatState, p: number): boolean => { for (const r of rulesOf(w)) if (r.state?.(w, s, p)) return true; return false; };
export const wallRule = (w: World, s: CombatState, p: number, ax: number): boolean => { for (const r of rulesOf(w)) if (r.wall?.(w, s, p, ax)) return true; return false; };
