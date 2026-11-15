import { KernelError } from './errors';
import { type Schema, type SliceState, type WorldState, copySlice, createSlice, diffSlice, hashSlice, i32, i32s } from './schema';
import { EVENT_PHASES, PHASES, type GameEvent, type HookDef, type PackManifest, type Registry, type SystemDef, resolvePacks } from './pack';
import { type RngStream, seedStreams, streamAt } from './rng';
import { INPUT_STRIDE, type InputFrame } from './input';
import { withSanitizer } from './sanitizer';
import { simMath } from './math';

export interface WorldConfig {
  packs: readonly PackManifest[];
  loadOrder?: readonly string[];
  seed: number;
  players: number;
  /** World config (DESIGN §20.2): everything that defines the match besides inputs (characters, map, rules). Plain JSON; first record of a replay. */
  world?: Record<string, unknown>;
  /** Trap non-deterministic APIs during step (dev / lab / tests). */
  sanitize?: boolean;
  /** Rethrow hook/system errors instead of isolating them (tests). */
  strict?: boolean;
}
export interface Report { frame: number; code: string; where: string; message: string }

const MAX_CHAIN = 32;
interface Ordered<T> { full: string; idx: number; def: T }

/** Orders items by `after` constraints; ties keep declaration order (pack order, then position). Throws on cycles. */
function order<T extends { id: string; after?: string[] }>(items: { pack: string; def: T }[], what: string): Ordered<T>[] {
  const all = items.map((x, i) => ({ full: `${x.pack}:${x.def.id}`, pack: x.pack, def: x.def, i }));
  const norm = (pack: string, a: string): string => (a.includes(':') ? a : `${pack}:${a}`);
  const done = new Set<string>(), out: Ordered<T>[] = [];
  while (out.length < all.length) {
    const nxt = all.find(x => !done.has(x.full) && (x.def.after ?? []).every(a => { const n = norm(x.pack, a); return done.has(n) || !all.some(y => y.full === n); }));
    if (!nxt) throw new KernelError('E_ORDER_CYCLE', `${what}: cycle in 'after' among ${all.filter(x => !done.has(x.full)).map(x => x.full).join(', ')}`);
    done.add(nxt.full); out.push({ full: nxt.full, idx: out.length, def: nxt.def });
  }
  return out;
}

export class World {
  readonly cfg: WorldConfig;
  readonly registry: Registry;
  readonly packs: PackManifest[];
  readonly math = simMath;
  readonly schemas: Record<string, Schema> = {};
  readonly state: WorldState = {};
  readonly reports: Report[] = [];
  readonly players: number;
  private readonly rngIds: string[];
  private readonly rngCache = new Map<string, RngStream>();
  private readonly systems: Ordered<SystemDef>[][];
  /** Diagnosis hook (tools/parity): called before (`false`) and after (`true`) every system run. Never set in the game. */
  sysTrace: ((system: string, after: boolean) => void) | null = null;
  private readonly hooks = new Map<string, Ordered<HookDef>[]>();
  private readonly hookFull: string[] = [];
  private readonly sysFull: string[] = [];
  private readonly known = new Set<string>(['frame']);
  private readonly queue: GameEvent[] = [];
  private running = false;
  private chain = 0;
  private cur: InputFrame;
  private readonly k: SliceState;

  constructor(cfg: WorldConfig) {
    this.cfg = cfg; this.players = cfg.players;
    const { ordered, registry } = resolvePacks(cfg.packs, cfg.loadOrder);
    this.packs = ordered; this.registry = registry;
    for (const p of ordered) for (const e of p.events ?? []) this.known.add(e);
    this.rngIds = ['kernel:main'];
    for (const p of ordered) for (const r of p.rng ?? []) this.rngIds.push(`${p.id}:${r}`);
    // hooks and systems, ordered once
    const sysItems = ordered.flatMap(p => (p.systems ?? []).map(def => ({ pack: p.id, def })));
    const hookItems = ordered.flatMap(p => (p.hooks ?? []).map(def => ({ pack: p.id, def })));
    this.systems = PHASES.map(ph => order(sysItems.filter(s => s.def.phase === ph), `systems(${ph})`));
    let si = 0; this.systems.forEach((g, gi) => g.forEach(s => { s.idx = si++; this.sysFull[s.idx] = s.full; void gi; }));
    let hi = 0;
    for (const ev of new Set(hookItems.map(h => h.def.event))) {
      if (!this.known.has(ev)) throw new KernelError('E_EVENT_UNKNOWN', `hook on undeclared event '${ev}'`);
      for (const ph of EVENT_PHASES) {
        const list = order(hookItems.filter(h => h.def.event === ev && h.def.phase === ph), `hooks(${ev}:${ph})`);
        list.forEach(h => { h.idx = hi++; this.hookFull[h.idx] = h.full; });
        this.hooks.set(`${ev}:${ph}`, list);
      }
    }
    // state
    this.schemas['kernel'] = { frame: i32(), seed: i32(), rng: i32s(this.rngIds.length * 4), hookOff: i32s(Math.max(1, hi)), sysOff: i32s(Math.max(1, si)), prevBtn: i32s(Math.max(1, cfg.players)) };
    for (const p of ordered) if (p.state) this.schemas[p.id] = p.state;
    for (const id in this.schemas) this.state[id] = createSlice(this.schemas[id]!);
    this.k = this.state['kernel']!;
    this.k['seed'] = cfg.seed | 0;
    seedStreams(this.k['rng'] as Int32Array, this.rngIds, cfg.seed);
    this.cur = new Int32Array(cfg.players * INPUT_STRIDE);
    for (const p of ordered) p.init?.(this);
  }

  get frame(): number { return this.k['frame'] as number; }
  slice<S = SliceState>(packId: string): S { return this.state[packId] as unknown as S; }
  rng(id: string): RngStream {
    let r = this.rngCache.get(id);
    if (!r) { const n = this.rngIds.indexOf(id); if (n < 0) throw new KernelError('E_STATE', `unknown rng stream '${id}' (declare it in the pack's rng list)`); r = streamAt(this.k['rng'] as Int32Array, n); this.rngCache.set(id, r); }
    return r;
  }
  // ---- input access (current frame) ----
  x(p: number): number { return this.cur[p * 3]!; }
  y(p: number): number { return this.cur[p * 3 + 1]!; }
  buttons(p: number): number { return this.cur[p * 3 + 2]!; }
  held(p: number, mask: number): boolean { return (this.buttons(p) & mask) !== 0; }
  /** True only on the frame the button went down. */
  pressed(p: number, mask: number): boolean { return (this.buttons(p) & ~(this.k['prevBtn'] as Int32Array)[p]! & mask) !== 0; }

  // ---- events ----
  emit<P>(type: string, payload: P): GameEvent<P> {
    if (!this.known.has(type)) throw new KernelError('E_EVENT_UNKNOWN', `event '${type}' not declared by any pack (add it to the pack's events list)`);
    const ev: GameEvent<P> = { type, payload, cancelled: false, depth: this.chain };
    if (this.running) {
      ev.depth = this.chain + 1;
      if (ev.depth > MAX_CHAIN) throw new KernelError('E_EVENT_DEPTH', `event chain deeper than ${MAX_CHAIN} at '${type}'`);
      this.queue.push(ev as GameEvent); return ev; // queued: processed after the current hook returns (DESIGN §5.4)
    }
    this.running = true;
    try {
      this.dispatch(ev as GameEvent);
      while (this.queue.length) this.dispatch(this.queue.shift()!);
    } finally { this.running = false; this.queue.length = 0; this.chain = 0; }
    return ev;
  }
  private dispatch(ev: GameEvent): void {
    this.chain = ev.depth;
    const off = this.k['hookOff'] as Int32Array;
    for (const ph of EVENT_PHASES) {
      if (ev.cancelled && ph !== 'before') return;
      for (const h of this.hooks.get(`${ev.type}:${ph}`) ?? []) {
        if (off[h.idx]) continue;
        try { h.def.run(this, ev); }
        catch (e) { if (this.cfg.strict) throw e; off[h.idx] = 1; this.report('E_HOOK_FAIL', this.hookFull[h.idx]!, e); } // same code+state ⇒ every client disables it on the same frame
      }
    }
  }
  private report(code: string, where: string, e: unknown): void { this.reports.push({ frame: this.frame, code, where, message: e instanceof Error ? e.message : String(e) }); }

  // ---- stepping ----
  step(input: InputFrame): void {
    this.cur = input;
    this.k['frame'] = this.frame + 1; // frame = 1-based number of the step being executed (same convention as the legacy game)
    const run = (): void => {
      this.emit('frame', { frame: this.frame });
      const off = this.k['sysOff'] as Int32Array;
      for (const group of this.systems) for (const s of group) {
        if (off[s.idx]) continue;
        if (this.sysTrace) this.sysTrace(s.full, false);
        try { s.def.run(this); }
        catch (e) { if (this.cfg.strict) throw e; off[s.idx] = 1; this.report('E_SYSTEM_FAIL', s.full, e); }
        if (this.sysTrace) this.sysTrace(s.full, true);
      }
    };
    if (this.cfg.sanitize) withSanitizer(run); else run();
    const prev = this.k['prevBtn'] as Int32Array;
    for (let p = 0; p < this.players; p++) prev[p] = this.cur[p * 3 + 2]!;
  }

  // ---- snapshot / hash / diff (generated from schemas) ----
  alloc(): WorldState { const s: WorldState = {}; for (const id in this.schemas) s[id] = createSlice(this.schemas[id]!); return s; }
  snapshot(into: WorldState = this.alloc()): WorldState { for (const id in this.schemas) copySlice(this.schemas[id]!, this.state[id]!, into[id]!); return into; }
  restore(from: WorldState): void { for (const id in this.schemas) copySlice(this.schemas[id]!, from[id]!, this.state[id]!); }
  sections(s: WorldState = this.state): Record<string, number> { const o: Record<string, number> = {}; for (const id in this.schemas) o[id] = hashSlice(this.schemas[id]!, s[id]!); return o; }
  hash(s: WorldState = this.state): number {
    let h = 2166136261;
    const sec = this.sections(s);
    for (const id in sec) h = Math.imul(h ^ sec[id]!, 16777619) >>> 0;
    return h;
  }
  diff(a: WorldState, b: WorldState): { slice: string; fields: string[] }[] {
    const out: { slice: string; fields: string[] }[] = [];
    for (const id in this.schemas) { const f = diffSlice(this.schemas[id]!, a[id]!, b[id]!); if (f.length) out.push({ slice: id, fields: f }); }
    return out;
  }
}
