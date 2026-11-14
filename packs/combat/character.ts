import type { World } from '@kernel';
import type { PCtx } from './input';
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
  shot(c: ShotCtx): void;
  /** Replaces the dash start; call `base(c)` for the default dash (legacy: wrapper around `dash`). Return without calling it to refuse the dash. */
  dash?(c: PCtx, base: (c: PCtx) => void): void;
}
