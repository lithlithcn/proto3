import { KernelError } from './errors';
import { INPUT_STRIDE } from './input';
import type { PackManifest } from './pack';
import { World, type WorldConfig } from './world';

/** Replay / bug report / golden = world config + inputs (DESIGN §20.2). Inputs are flattened Int32 triples per player per frame. */
export interface Replay {
  v: 1;
  seed: number;
  players: number;
  packs: { id: string; version: string }[];
  loadOrder: string[];
  world: Record<string, unknown>;
  frames: number;
  inputs: number[];
  /** Checkpoints [frame, hash] for desync detection / goldens. */
  hashes: [number, number][];
}
export const HASH_EVERY = 60;

export function worldFor(r: Pick<Replay, 'seed' | 'players' | 'packs' | 'loadOrder' | 'world'>, available: readonly PackManifest[], extra: Partial<WorldConfig> = {}): World {
  const packs = r.packs.map(p => {
    const m = available.find(a => a.id === p.id);
    if (!m) throw new KernelError('E_REPLAY', `replay needs pack '${p.id}', not available`);
    if (m.version !== p.version) throw new KernelError('E_REPLAY', `replay recorded with ${p.id}@${p.version}, loaded ${m.version}`);
    return m;
  });
  return new World({ packs, loadOrder: r.loadOrder, seed: r.seed, players: r.players, world: r.world, ...extra });
}

/** Runs a replay; returns the final hash and any checkpoint mismatches. */
export function playReplay(r: Replay, available: readonly PackManifest[], extra: Partial<WorldConfig> = {}): { world: World; hash: number; mismatches: number[] } {
  const w = worldFor(r, available, extra), stride = r.players * INPUT_STRIDE, mismatches: number[] = [];
  const want = new Map(r.hashes);
  for (let f = 0; f < r.frames; f++) {
    w.step(Int32Array.from(r.inputs.slice(f * stride, (f + 1) * stride)));
    const exp = want.get(w.frame);
    if (exp !== undefined && exp !== w.hash()) mismatches.push(w.frame);
  }
  return { world: w, hash: w.hash(), mismatches };
}
export function record(cfg: Pick<WorldConfig, 'seed' | 'players' | 'packs' | 'loadOrder' | 'world'>, inputs: Int32Array[], extra: Partial<WorldConfig> = {}): Replay {
  const w = new World({ ...cfg, ...extra }), hashes: [number, number][] = [], flat: number[] = [];
  for (const i of inputs) { w.step(i); flat.push(...i); if (w.frame % HASH_EVERY === 0) hashes.push([w.frame, w.hash()]); }
  hashes.push([w.frame, w.hash()]);
  return { v: 1, seed: cfg.seed, players: cfg.players, packs: w.packs.map(p => ({ id: p.id, version: p.version })), loadOrder: [...(cfg.loadOrder ?? [])], world: cfg.world ?? {}, frames: inputs.length, inputs: flat, hashes };
}
