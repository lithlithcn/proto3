import type { Schema } from './schema';
import type { World } from './world';
import { KernelError } from './errors';

/** Phases a system can run in, in this order (DESIGN §5.2: phases + `after`, never numeric priorities). */
export const PHASES = ['input', 'pre', 'sim', 'post'] as const;
export type Phase = (typeof PHASES)[number];
export const EVENT_PHASES = ['before', 'apply', 'after'] as const;
export type EventPhase = (typeof EVENT_PHASES)[number];

export interface SystemDef { id: string; phase: Phase; after?: string[]; run(w: World): void }
export interface HookDef<P = any> { id: string; event: string; phase: EventPhase; after?: string[]; run(w: World, ev: GameEvent<P>): void }
export interface GameEvent<P = any> { type: string; payload: P; cancelled: boolean; depth: number }

export interface PackManifest {
  /** Namespace. All content ids inside are `<id>:<name>`. */
  id: string;
  version: string;
  /** `other-pack@^1.2.0` (exact `@1.2.3`, caret `^`, or no range). */
  requires?: string[];
  /** Content ids this pack replaces on purpose, e.g. 'touhou:reimu'. Silent collisions are load errors. */
  overrides?: string[];
  /** Content types this pack introduces (DESIGN §18.5). */
  contentTypes?: string[];
  /** Content by type: `{ character: { reimu: {...} } }` registers `<pack>:reimu`. A full id key is only allowed if listed in `overrides`. */
  content?: Record<string, Record<string, unknown>>;
  /** Event names this pack declares (catalog is generated from this). */
  events?: string[];
  /** Local RNG stream names → `<pack>:<name>`. */
  rng?: string[];
  state?: Schema;
  systems?: SystemDef[];
  hooks?: HookDef[];
  /** Runs once after state allocation, before frame 0. Seeding initial state goes here. */
  init?(w: World): void;
}
export const definePack = <T extends PackManifest>(m: T): T => m;

// ---- semver (tiny: exact, ^caret) ----
const parse = (v: string): [number, number, number] => { const m = /^(\d+)\.(\d+)\.(\d+)/.exec(v); if (!m) throw new KernelError('E_PACK_VERSION', `bad version '${v}'`); return [+m[1]!, +m[2]!, +m[3]!]; };
export function satisfies(version: string, range: string): boolean {
  if (!range) return true;
  const v = parse(version);
  const caret = range.startsWith('^'), r = parse(caret ? range.slice(1) : range);
  const cmp = v[0] - r[0] || v[1] - r[1] || v[2] - r[2];
  if (!caret) return cmp === 0;
  return v[0] === r[0] && cmp >= 0;
}

export interface Registry { get<T = unknown>(type: string, id: string): T | undefined; list<T = unknown>(type: string): [string, T][]; types(): string[] }

/** Validates, orders (dependencies first; ties by `loadOrder` position, then id) and builds the content registry. */
export function resolvePacks(packs: readonly PackManifest[], loadOrder: readonly string[] = []): { ordered: PackManifest[]; registry: Registry } {
  const byId = new Map<string, PackManifest>();
  for (const p of packs) { if (byId.has(p.id)) throw new KernelError('E_PACK_DUP', `pack '${p.id}' loaded twice`); byId.set(p.id, p); }
  const deps = new Map<string, string[]>();
  for (const p of packs) {
    const ids: string[] = [];
    for (const req of p.requires ?? []) {
      const [id, range = ''] = req.split('@');
      const d = byId.get(id!);
      if (!d) throw new KernelError('E_PACK_MISSING_DEP', `pack '${p.id}' requires '${id}', which is not loaded`);
      if (!satisfies(d.version, range)) throw new KernelError('E_PACK_VERSION', `pack '${p.id}' requires ${req} but '${id}' is ${d.version}`);
      ids.push(id!);
    }
    deps.set(p.id, ids);
  }
  const rank = (id: string): number => { const i = loadOrder.indexOf(id); return i < 0 ? 1e9 : i; };
  const ready = [...byId.keys()].sort((a, b) => rank(a) - rank(b) || (a < b ? -1 : a > b ? 1 : 0)); // sim-allow(load-time, not sim)
  const done = new Set<string>(), ordered: PackManifest[] = [];
  while (ordered.length < packs.length) {
    const next = ready.find(id => !done.has(id) && deps.get(id)!.every(d => done.has(d)));
    if (!next) throw new KernelError('E_PACK_CYCLE', `dependency cycle among: ${ready.filter(i => !done.has(i)).join(', ')}`);
    done.add(next); ordered.push(byId.get(next)!);
  }
  // content registry
  const types = new Map<string, string>(); // type -> declaring pack
  for (const p of ordered) for (const t of p.contentTypes ?? []) types.set(t, p.id);
  const data = new Map<string, Map<string, unknown>>();
  const seenOverride = new Set<string>();
  for (const p of ordered) {
    for (const type in p.content ?? {}) {
      if (!types.has(type)) throw new KernelError('E_CONTENT_TYPE', `pack '${p.id}' adds content of undeclared type '${type}'`);
      const m = data.get(type) ?? new Map(); data.set(type, m);
      const items = p.content![type]!;
      for (const key in items) {
        const full = key.includes(':') ? key : `${p.id}:${key}`;
        if (key.includes(':')) {
          if (!(p.overrides ?? []).includes(full)) throw new KernelError('E_PACK_OVERRIDE', `pack '${p.id}' provides '${full}' without listing it in overrides`);
          if (!m.has(full)) throw new KernelError('E_PACK_OVERRIDE', `pack '${p.id}' overrides '${full}' which does not exist (load order?)`);
          seenOverride.add(full);
        } else if (m.has(full)) throw new KernelError('E_CONTENT_DUP', `content '${full}' defined twice`);
        m.set(full, items[key]);
      }
    }
  }
  return {
    ordered,
    registry: {
      get: (type, id) => data.get(type)?.get(id) as never,
      list: type => [...(data.get(type) ?? [])].sort((a, b) => (a[0] < b[0] ? -1 : 1)) as never, // sim-allow(registry listing)
      types: () => [...types.keys()],
    },
  };
}
