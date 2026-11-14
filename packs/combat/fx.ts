import type { World } from '@kernel';
import { MAX_FX, PS, type CombatState } from './state';
import { statusPool } from './api';

export { MAX_FX };
/** Status slots: one column of `MAX_FX` timers per player (legacy `p.fx.<name>` frame counters). Slots are stable ids shared by content (like `ISRC`): append, never renumber. */
export const FXS = { elx: 0, imm: 1 } as const;

/** Content type `status`: a timed effect. `perm` = never counts down on its own (legacy PERMFX); `end` runs the frame the timer reaches 0. */
export interface StatusDef { slot: number; name: string; perm?: boolean; end?(c: { w: World; s: CombatState; p: number }): void }

export const fxOn = (s: CombatState, p: number, slot: number): boolean => s.fx[p * MAX_FX + slot]! > 0;
export const setFx = (s: CombatState, p: number, slot: number, t: number): void => { s.fx[p * MAX_FX + slot] = t; };

const ACT: number[] = [];
/** Legacy chPre status loop: every live player's non-permanent timers count down; the end hook fires when one hits 0 (slot order, not insertion order). */
export function tickFx(w: World, s: CombatState): void {
  const pool = statusPool(w);
  for (let p = 0; p < s.n; p++) {
    if (s.state[p] === PS.dead) continue;
    let n = 0; // timers armed at the start of the frame; one an end hook sets (elixir -> immortal) starts counting next frame
    for (let k = 0; k < MAX_FX; k++) if (s.fx[p * MAX_FX + k]! > 0 && !pool[k]?.perm) ACT[n++] = k;
    for (let j = 0; j < n; j++) {
      const k = ACT[j]!, i = p * MAX_FX + k;
      if (--s.fx[i]! === 0) { w.emit('combat:fx-end', { p, slot: k }); pool[k]?.end?.({ w, s, p }); }
    }
  }
}
export const clearFx = (s: CombatState, p: number): void => { s.fx.fill(0, p * MAX_FX, (p + 1) * MAX_FX); };
