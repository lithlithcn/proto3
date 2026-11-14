import type { World } from '@kernel';
import type { PCtx } from './input';
import type { MeleeName, MoveDef } from './moves';

/** Context handed to a character's heavy-shot function: `k` is the per-bullet damage base (power multiplier), `src` the stun-repeat source id for `heavyBullet`. */
export interface HeavyCtx { w: World; s: CombatState; p: number; m: MoveDef; src: number; a: number; k: number }
import type { CombatState } from './state';

/** Context handed to a character's light-shot function (all values already resolved by the combat systems). */
export interface ShotCtx { w: World; s: CombatState; p: number; a: number; focus: boolean; pm: number; lv: number }

/** Content type `character` (DESIGN §15). More members (heavy, melee, spell, skills, passives, cpu, visuals) are added as batches are ported. */
export interface CharacterDef {
  name: string;
  color: string;
  /** Movement multiplier (legacy `spd`). */
  spd: number;
  /** Damage taken / dealt multipliers (legacy `din` / `dout`). */
  din: number;
  dout: number;
  /** Light-shot cooldown in frames (focus: ×0.75). */
  cd: number;
  /** Melee overrides (legacy `melee`); missing moves use the defaults in moves.ts. */
  melee?: Partial<Record<MeleeName, MoveDef>>;
  /** Heavy shot patterns by direction (N neutral, F toward the foe, B away). */
  heavy?: Partial<Record<'N' | 'F' | 'B', (c: HeavyCtx) => void>>;
  /** Per-frame hook, run after every system on frames where time advances (legacy character `tick`). */
  tick?(w: World, s: CombatState, p: number): void;
  shot(c: ShotCtx): void;
  /** Replaces the dash start; call `base(c)` for the default dash (legacy: wrapper around `dash`). Return without calling it to refuse the dash. */
  dash?(c: PCtx, base: (c: PCtx) => void): void;
}
