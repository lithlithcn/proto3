import type { SliceState } from './schema';

/**
 * Seeded RNG streams (DESIGN §3.3). Each stream = 4 int32 words (sfc32) living in the kernel state slice,
 * so rollback restores them. Adding a stream or a call in one pack never shifts another stream.
 */
export interface RngStream {
  /** Float in [0, 1). */ next(): number;
  /** Integer in [0, n). */ int(n: number): number;
  /** Float in [lo, hi). */ range(lo: number, hi: number): number;
}
export const hashString = (s: string): number => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; };
function splitmix(x: number): number { x = (x + 0x9e3779b9) | 0; let z = x ^ (x >>> 16); z = Math.imul(z, 0x21f0aaad); z ^= z >>> 15; z = Math.imul(z, 0x735a2d97); return z ^ (z >>> 15); }

export function seedStreams(words: Int32Array, ids: readonly string[], seed: number): void {
  ids.forEach((id, n) => {
    let x = (seed ^ hashString(id)) | 0;
    for (let j = 0; j < 4; j++) { x = splitmix(x); words[n * 4 + j] = x; }
    const g = streamAt(words, n); for (let j = 0; j < 12; j++) g.next();
  });
}
export function streamAt(words: Int32Array, n: number): RngStream {
  const o = n * 4;
  const next = (): number => {
    let a = words[o]!, b = words[o + 1]!, c = words[o + 2]!, d = words[o + 3]!;
    const t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0; a = b ^ (b >>> 9); b = (c + (c << 3)) | 0; c = (c << 21) | (c >>> 11); c = (c + t) | 0;
    words[o] = a; words[o + 1] = b; words[o + 2] = c; words[o + 3] = d;
    return (t >>> 0) / 4294967296;
  };
  return { next, int: n2 => Math.floor(next() * n2), range: (lo, hi) => lo + (hi - lo) * next() };
}
export type { SliceState };
