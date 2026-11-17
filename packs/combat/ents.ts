import type { World } from '@kernel';
import { MAX_ENT, MAXP, PS, type CombatState } from './state';
import { entRule } from './rules';

/** Entity pool (legacy ENT): kind ids belong to content (a character declares its own constants). Order is creation order and is preserved on compaction. */
export function addEnt(s: CombatState, kind: number, owner: number, t: number, x: number, y: number): number {
  if (s.nent >= MAX_ENT) return -1;
  const i = s.nent++; s.eid[i] = ++s.nextEid; s.eborn[i] = s.gf;
  s.ek[i] = kind; s.eo[i] = owner; s.et[i] = t; s.ex[i] = x; s.ey[i] = y; s.eg[i] = 0;
  s.evx[i] = 0; s.evy[i] = 0; s.ea[i] = 0; s.er[i] = 0; s.ew[i] = 0; s.eh[i] = 0; s.ebc[i] = 0; s.efl[i] = 0; s.ed[i] = 0; s.ec[i] = 0; s.ekb[i] = 0; s.est[i] = 0; s.ec[i] = 0; s.ehc.fill(0, i * MAXP, (i + 1) * MAXP);
  return i;
}
/** Live entities of a kind owned by `owner`, in creation order, written into `out`; returns the count. */
export function entsOf(s: CombatState, kind: number, owner: number, out: number[]): number {
  let n = 0;
  for (let i = 0; i < s.nent; i++) if (s.ek[i] === kind && s.eo[i] === owner && s.et[i]! > 0) out[n++] = i;
  out.length = n;
  return n;
}
/** Legacy updEnt + keep(): timers tick, entities die with their owner, then the kind's rule (themed items, `RulesDef.ent`) runs in creation order
 *  (entities spawned meanwhile run this same frame, like the legacy for-of); expired ones are compacted away. */
export function updateEnts(w: World, s: CombatState): void {
  for (let i = 0; i < s.nent; i++) { s.et[i] = s.et[i]! - 1; if (s.state[s.eo[i]!] === PS.dead) s.et[i] = 0; else entRule(w, s, i); }
  let k = 0;
  const n = s.nent;
  for (let i = 0; i < n; i++) {
    if (s.et[i]! <= 0) continue;
    if (k !== i) {
      s.eid[k] = s.eid[i]!; s.eborn[k] = s.eborn[i]!; s.ek[k] = s.ek[i]!; s.eo[k] = s.eo[i]!; s.eg[k] = s.eg[i]!; s.et[k] = s.et[i]!; s.ex[k] = s.ex[i]!; s.ey[k] = s.ey[i]!; s.evx[k] = s.evx[i]!; s.evy[k] = s.evy[i]!; s.ea[k] = s.ea[i]!;
      s.er[k] = s.er[i]!; s.ew[k] = s.ew[i]!; s.eh[k] = s.eh[i]!; s.ebc[k] = s.ebc[i]!; s.efl[k] = s.efl[i]!; s.ed[k] = s.ed[i]!; s.ekb[k] = s.ekb[i]!; s.est[k] = s.est[i]!; s.ec[k] = s.ec[i]!; s.ehc.copyWithin(k * MAXP, i * MAXP, (i + 1) * MAXP);
    }
    k++;
  }
  for (let i = k; i < n; i++) { s.eid[i] = 0; s.eborn[i] = 0; s.ek[i] = 0; s.eo[i] = 0; s.eg[i] = 0; s.et[i] = 0; s.ex[i] = 0; s.ey[i] = 0; s.evx[i] = 0; s.evy[i] = 0; s.ea[i] = 0; s.er[i] = 0; s.ew[i] = 0; s.eh[i] = 0; s.ebc[i] = 0; s.efl[i] = 0; s.ed[i] = 0; s.ekb[i] = 0; s.est[i] = 0; s.ehc.fill(0, i * MAXP, (i + 1) * MAXP); }
  s.nent = k;
}
