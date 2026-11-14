import type { CombatState } from './state';

/** Winner pick (legacy bestId/byKD): most KOs, then damage dealt, then who went out last (alive = latest), then lowest id. Teams: best team first, then its best member. */
const out = (s: CombatState, p: number): number => s.outAt[p]! || 1e9;
const byKD = (s: CombatState) => (a: number, b: number): number => s.kos[b]! - s.kos[a]! || s.dmgDealt[b]! - s.dmgDealt[a]! || out(s, b) - out(s, a) || a - b;

export function bestId(s: CombatState): number {
  const ids: number[] = [];
  for (let p = 0; p < s.n; p++) ids.push(p);
  const kd = byKD(s);
  if (!s.teams) return ids.sort(kd)[0]!; // sim-allow(total order on ints: no ties possible because the last key is the unique id)
  const g = new Map<number, { ko: number; d: number; m: number[] }>();
  for (const p of ids) { const k = s.team[p]!, e = g.get(k) ?? { ko: 0, d: 0, m: [] }; e.ko += s.kos[p]!; e.d += s.dmgDealt[p]!; e.m.push(p); g.set(k, e); }
  const best = [...g.values()].sort((a, b) => b.ko - a.ko || b.d - a.d || a.m[0]! - b.m[0]!)[0]!; // sim-allow(total order: unique first member id)
  return best.m.sort(kd)[0]!; // sim-allow(total order on ints)
}
