/** Deterministic sorting (DESIGN §3.4): total order (key, then id), so no engine-dependent tie behaviour. The only allowed `.sort(` in sim code. */
export function sortBy<T>(arr: T[], key: (x: T) => number, id: (x: T) => number): T[] {
  return arr.sort((a, b) => { const d = key(a) - key(b); return d !== 0 ? d : id(a) - id(b); }); // sim-allow(total-order comparator)
}
