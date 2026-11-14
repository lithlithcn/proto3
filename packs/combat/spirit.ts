import type { SystemDef } from '@kernel';
import { combatOf } from './api';
import { T } from './tuning';

/** Legacy step wrapper "spell gauge 2x slower": normal gains of a step are halved, big fills stay whole. Runs around every other system. */
export const spiritBegin: SystemDef = { id: 'spirit-begin', phase: 'input', run(w) { const s = combatOf(w); for (let p = 0; p < s.n; p++) s.spP[p] = s.spirit[p]!; } };
/** Applies the slow-down to the gains since the snapshot, then re-snapshots (so later gains in the same step stay whole: legacy character `tick`s run outside the wrapper). */
export function settleSpirit(s: ReturnType<typeof combatOf>): void { for (let p = 0; p < s.n; p++) { const d = s.spirit[p]! - s.spP[p]!; if (d > 0 && d < T.SPIRIT_BIG) s.spirit[p] = s.spP[p]! + d * T.SPIRIT_SLOW; s.spP[p] = s.spirit[p]!; } }
export const spiritEnd: SystemDef = { id: 'spirit-end', phase: 'post', run(w) { settleSpirit(combatOf(w)); } };
