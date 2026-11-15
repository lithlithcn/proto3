import type { World } from '@kernel';
import type { PCtx } from './input';
import type { MeleeName, MoveDef } from './moves';

/** Context handed to a character's heavy-shot function: `k` is the per-bullet damage base (power multiplier), `src` the stun-repeat source id for `heavyBullet`. */
export interface HeavyCtx { w: World; s: CombatState; p: number; m: MoveDef; src: number; a: number; k: number; /** fired by the Doppelganger (bare stand-in in legacy: per-player extras such as cooldown fields read as unset and are not written back) */ clone?: boolean }
import type { CombatState } from './state';

/** Virtual input of one player this frame (legacy `I`): a character's `inp` hook may rewrite it before the combat logic reads it. */
export interface VIn { ix: number; iy: number; b: number }

/** Spell card (DESIGN §15 `spell`): `fn` runs every frame of the card; `k` = frames since the cut-in ended, patterns restart every `loop` frames. */
export interface SpellCtx { w: World; s: CombatState; p: number; o: number; k: number }
export interface SpellDef { name: string; loop: number; fn(c: SpellCtx): void }

/** Context handed to a character's light-shot function (all values already resolved by the combat systems). */
export interface ShotCtx { w: World; s: CombatState; p: number; a: number; focus: boolean; pm: number; lv: number; /** fired by the Doppelganger: legacy hands the shot a bare stand-in object, so per-player extras (e.g. Okina's season) read as 0 */ clone?: boolean }

/** Content type `character` (DESIGN §15). More members (heavy, melee, spell, skills, passives, cpu, visuals) are added as batches are ported. */
export interface CharacterDef {
  name: string;
  /** Position in the legacy roster (selects the order of the spell pool: shared cards, then each character's own). */
  order: number;
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
  /** Extra multipliers (legacy `doutM` / `dinM` / `spdM`) on damage dealt by / taken by / speed of this character's player. */
  doutM?(w: World, s: CombatState, a: number, v: number, heavy: boolean): number;
  dinM?(w: World, s: CombatState, v: number): number;
  spdM?(w: World, s: CombatState, p: number): number;
  /** Runs after a heavy-type hit by this character's player actually hurt `v` (legacy `onHit`). */
  onHit?(w: World, s: CombatState, a: number, v: number, heavy: boolean): void;
  /** Entity handlers of the character (legacy `EST` kinds): called once per entity in creation order with the index range `s.eLo..s.eHi` to process (legacy chStep). */
  ents?(w: World, s: CombatState, p: number): void;
  /** Inclusive range of entity kinds `ents` handles: dispatch is by kind, not by the owner's current kit (a disguised Nue still runs her own clouds). */
  entKinds?: readonly [number, number];
  /** Entities that legacy updates after the whole entity pass and the bullet modifiers (e.g. Nue's UFO): same contract as `ents`/`entKinds`. */
  postEnts?(w: World, s: CombatState, p: number): void;
  postKinds?: readonly [number, number];
  /** Runs once per frame after the whole entity pass (e.g. re-tuning bullets from entity state). */
  post?(w: World, s: CombatState, p: number): void;
  /** Rewrites the virtual input (stick/buttons) before anything reads it, e.g. Reimu's charge-to-throw orbs. Runs for living players only. */
  inp?(w: World, s: CombatState, p: number, v: VIn): void;
  /** Skill 1 (button `next`, legacy `special`) and skill 2 (`prev`, legacy `special2`); edge-triggered, not while casting a spell. */
  skill1?(w: World, s: CombatState, p: number): void;
  skill2?(w: World, s: CombatState, p: number): void;
  /** The character's own spell card; joins the shared pool every cast draws from. */
  spell?: SpellDef;
  shot(c: ShotCtx): void;
  /** Replaces the dash start; call `base(c)` for the default dash (legacy: wrapper around `dash`). Return without calling it to refuse the dash. */
  dash?(c: PCtx, base: (c: PCtx) => void): void;
}
