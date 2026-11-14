import type { HookDef } from '@kernel';
import { FXS, MAX_FX, combatOf } from '@pack/combat/api';

/** Immortal fighters survive any KO with 1 HP and 30 frames of invincibility (legacy `ko` wrapper). */
export const immGuard: HookDef<{ p: number }> = {
  id: 'imm-guard', event: 'combat:ko:before', phase: 'before',
  run(w, ev) {
    const s = combatOf(w), p = ev.payload.p;
    if (s.fx[p * MAX_FX + FXS.imm]! > 0) { s.hp[p] = 1; s.inv[p] = Math.max(s.inv[p]!, 30); ev.cancelled = true; }
  },
};
