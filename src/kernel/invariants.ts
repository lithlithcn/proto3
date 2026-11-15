/**
 * Invariant engine (DESIGN §26): the engine checks ITSELF, without any oracle.
 * Level 1 = pack invariants (cheap contracts, O(players + live objects)); level 2 = + generic scan of every float field of every slice for NaN/Infinity.
 * Violations become `Report`s (code E_INVARIANT / E_NONFINITE), de-duplicated and capped so a broken frame cannot flood. Never changes the simulation.
 */
import type { SliceState, Schema } from './schema';
import type { World } from './world';

export interface InvariantDef { id: string; /** State fields this contract constrains (drives the coverage report). */ covers?: string[]; /** Returns null when fine, else one or more precise messages (array, index, value, expectation). */ check(w: World): string | string[] | null }
export type DiagLevel = 0 | 1 | 2;
const MAX_REPORTS = 300;

export function runInvariants(w: World, level: DiagLevel, seen: Set<string>, push: (code: string, where: string, msg: string) => void, count: () => number): void {
  const emit = (code: string, where: string, msg: string): void => { const key = `${where}|${msg.replace(/[\d.e+-]+/g, '#').slice(0, 90)}`; if (seen.has(key) || count() >= MAX_REPORTS) return; seen.add(key); push(code, where, msg); };
  for (const p of w.packs) for (const inv of p.invariants ?? []) {
    let r: string | string[] | null;
    try { r = inv.check(w); } catch (e) { r = `invariant threw: ${e instanceof Error ? e.message : String(e)}`; }
    if (r) for (const m of Array.isArray(r) ? r : [r]) emit('E_INVARIANT', `${p.id}:${inv.id}`, m);
  }
  if (level < 2) return;
  for (const id in w.state) {
    const sch = (w as unknown as { schemas: Record<string, Schema> }).schemas[id]!, sl = w.state[id] as SliceState;
    for (const name in sch) {
      const f = sch[name]!, v = sl[name]!;
      if (f.k === 'f64') { if (!Number.isFinite(v as number)) emit('E_NONFINITE', `${id}.${name}`, `${id}.${name} = ${String(v)}`); }
      else if (f.k === 'f64[]') { const a = v as Float64Array; for (let i = 0; i < a.length; i++) if (!Number.isFinite(a[i]!)) { emit('E_NONFINITE', `${id}.${name}`, `${id}.${name}[${i}] = ${String(a[i])}`); break; } }
    }
  }
}

/** Measurable coverage: per slice, which fields have a contract (value check by a pack invariant) and which are only covered by the generic non-finite scan. */
export function invariantCoverage(w: World): Record<string, { contracts: number; fields: number; uncontracted: string[] }> {
  const out: Record<string, { contracts: number; fields: number; uncontracted: string[] }> = {};
  const schemas = (w as unknown as { schemas: Record<string, Schema> }).schemas;
  for (const id in schemas) {
    const covered = new Set<string>(); for (const p of w.packs) if (p.id === id) for (const inv of p.invariants ?? []) for (const c of inv.covers ?? []) covered.add(c);
    const names = Object.keys(schemas[id]!); out[id] = { contracts: names.filter(n => covered.has(n)).length, fields: names.length, uncontracted: names.filter(n => !covered.has(n)) };
  }
  return out;
}
