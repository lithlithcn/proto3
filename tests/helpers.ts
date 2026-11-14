import { type PackManifest, type WorldConfig, newInput, setInput } from '@kernel';
import sandbox from '../packs/sandbox/pack';

export const packs: PackManifest[] = [sandbox];
export const cfg = (extra: Partial<WorldConfig> = {}): WorldConfig => ({ packs, seed: 12345, players: 2, sanitize: true, strict: true, ...extra });

/** Deterministic pseudo-random input generator for fuzzing (independent from the sim RNG). */
export function fuzzInputs(frames: number, players: number, seed = 7): Int32Array[] {
  let s = seed >>> 0;
  const r = (): number => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
  const out: Int32Array[] = [];
  for (let f = 0; f < frames; f++) {
    const i = newInput(players);
    for (let p = 0; p < players; p++) setInput(i, p, Math.round((r() - 0.5) * 254), Math.round((r() - 0.5) * 254), Math.floor(r() * 1024));
    out.push(i);
  }
  return out;
}
