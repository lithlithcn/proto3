/**
 * State schemas (DESIGN §4.2). A pack declares its state slice as fields; the kernel generates allocation, copy, hash and diff from it.
 * Only numbers and typed arrays: state is plain data, never functions/classes (snapshots, replays, hot reload depend on it).
 */
export type Field =
  | { k: 'f64'; d: number } | { k: 'i32'; d: number }
  | { k: 'f64[]'; n: number } | { k: 'i32[]'; n: number };
export type Schema = Readonly<Record<string, Field>>;
export type SliceState = Record<string, number | Float64Array | Int32Array>;
export type WorldState = Record<string, SliceState>;

export const f64 = (d = 0): Field => ({ k: 'f64', d });
export const i32 = (d = 0): Field => ({ k: 'i32', d });
export const f64s = (n: number): Field => ({ k: 'f64[]', n });
export const i32s = (n: number): Field => ({ k: 'i32[]', n });

export function createSlice(schema: Schema): SliceState {
  const s: SliceState = {};
  for (const name in schema) {
    const f = schema[name]!;
    s[name] = f.k === 'f64' || f.k === 'i32' ? f.d : f.k === 'f64[]' ? new Float64Array(f.n) : new Int32Array(f.n);
  }
  return s;
}
/** Copies `from` into `to` without allocating; array identities in `to` are preserved (references held by systems stay valid). */
export function copySlice(schema: Schema, from: SliceState, to: SliceState): void {
  for (const name in schema) {
    const f = schema[name]!;
    if (f.k === 'f64' || f.k === 'i32') to[name] = from[name]!;
    else (to[name] as Float64Array | Int32Array).set(from[name] as Float64Array | Int32Array);
  }
}

const scratch = new Float64Array(1), scratchU = new Uint32Array(scratch.buffer);
const mix = (h: number, w: number): number => Math.imul(h ^ w, 16777619) >>> 0;
const hashNum = (h: number, v: number): number => { scratch[0] = v; return mix(mix(h, scratchU[0]!), scratchU[1]!); };

/** FNV-1a over fields in schema order. Never uses JSON (DESIGN §3.10). */
export function hashSlice(schema: Schema, s: SliceState): number {
  let h = 2166136261;
  for (const name in schema) {
    const f = schema[name]!;
    if (f.k === 'f64' || f.k === 'i32') h = hashNum(h, s[name] as number);
    else if (f.k === 'f64[]') { const a = s[name] as Float64Array; for (let i = 0; i < a.length; i++) h = hashNum(h, a[i]!); }
    else { const a = s[name] as Int32Array; for (let i = 0; i < a.length; i++) h = mix(h, a[i]! >>> 0); }
  }
  return h >>> 0;
}
/** First differing fields, e.g. ['hp', 'pos[3]'] (cap 16). */
export function diffSlice(schema: Schema, a: SliceState, b: SliceState): string[] {
  const out: string[] = [];
  for (const name in schema) {
    const f = schema[name]!;
    if (f.k === 'f64' || f.k === 'i32') { if (!Object.is(a[name], b[name])) out.push(name); }
    else {
      const x = a[name] as Float64Array, y = b[name] as Float64Array;
      for (let i = 0; i < x.length; i++) if (!Object.is(x[i], y[i])) { out.push(`${name}[${i}]`); break; }
    }
    if (out.length >= 16) break;
  }
  return out;
}
