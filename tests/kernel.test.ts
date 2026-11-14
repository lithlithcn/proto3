import { describe, expect, it } from 'vitest';
import { BTN, FixedLoop, KernelError, World, definePack, handleTable, i32, newInput, playReplay, record, resolvePacks, satisfies, setInput, sortBy } from '@kernel';
import { cfg, fuzzInputs, packs } from './helpers';

describe('determinism', () => {
  it('same seed + inputs ⇒ same hash; different seed ⇒ different', () => {
    const run = (seed: number) => { const w = new World(cfg({ seed })); for (const i of fuzzInputs(600, 2)) w.step(i); return w.hash(); };
    expect(run(1)).toBe(run(1)); expect(run(1)).not.toBe(run(2));
  });
  it('snapshot → restore → continue equals straight run (rollback correctness)', () => {
    const inputs = fuzzInputs(400, 2), a = new World(cfg()), b = new World(cfg());
    for (const i of inputs) a.step(i);
    const snaps: ReturnType<World['snapshot']>[] = [];
    inputs.forEach((i, f) => { if (f % 50 === 0) snaps[f / 50] = b.snapshot(); b.step(i); });
    const mid = snaps[4]!; b.restore(mid);
    for (let f = 200; f < 400; f++) b.step(inputs[f]!);
    expect(b.hash()).toBe(a.hash()); expect(b.diff(a.state, b.state)).toEqual([]);
  });
  it('replay round-trip detects tampering', () => {
    const inputs = fuzzInputs(300, 2), r = record(cfg(), inputs);
    expect(playReplay(r, packs, { strict: true }).mismatches).toEqual([]);
    const bad = { ...r, inputs: r.inputs.map((v, i) => (i === 100 ? v + 1 : v)) };
    expect(playReplay(bad, packs, { strict: true }).mismatches.length).toBeGreaterThan(0);
  });
  it('diff names the first differing field', () => {
    const a = new World(cfg()), b = new World(cfg()), i = newInput(2); setInput(i, 0, 127, 0, 0);
    a.step(i); b.step(newInput(2));
    const d = a.diff(a.state, b.state); expect(d.some(x => x.slice === 'sandbox' && x.fields.some(f => f.startsWith('x[0]')))).toBe(true);
  });
});

describe('sanitizer', () => {
  const evil = definePack({ id: 'evil', version: '1.0.0', systems: [{ id: 's', phase: 'sim', run: () => { Math.random(); } }] });
  it('traps Math.random in sim and restores it afterwards', () => {
    const w = new World({ packs: [evil], seed: 1, players: 1, sanitize: true, strict: true });
    expect(() => w.step(newInput(1))).toThrow(/E_SANITIZER/);
    expect(typeof Math.random()).toBe('number');
  });
  it('without strict, the failing system is disabled and reported, match continues', () => {
    const w = new World({ packs: [evil], seed: 1, players: 1, sanitize: true });
    w.step(newInput(1)); w.step(newInput(1));
    expect(w.reports).toHaveLength(1); expect(w.reports[0]!.code).toBe('E_SYSTEM_FAIL'); expect(w.frame).toBe(2);
  });
});

describe('events', () => {
  it('hooks run before→apply→after, cancel skips the rest, re-entrant emits are queued FIFO', () => {
    const log: string[] = [];
    const p = definePack({
      id: 't', version: '1.0.0', events: ['t:a', 't:b'],
      hooks: [
        { id: 'a-before', event: 't:a', phase: 'before', run: (w, ev) => { log.push('a-before'); w.emit('t:b', 0); log.push('a-before-end'); if (ev.payload === 1) ev.cancelled = true; } },
        { id: 'a-apply', event: 't:a', phase: 'apply', run: () => { log.push('a-apply'); } },
        { id: 'b-apply', event: 't:b', phase: 'apply', run: () => { log.push('b-apply'); } },
      ],
      systems: [{ id: 's', phase: 'sim', run: w => { if (w.frame === 1) w.emit('t:a', 0); if (w.frame === 2) w.emit('t:a', 1); } }],
    });
    const w = new World({ packs: [p], seed: 1, players: 1, strict: true });
    w.step(newInput(1)); expect(log).toEqual(['a-before', 'a-before-end', 'a-apply', 'b-apply']);
    log.length = 0; w.step(newInput(1)); expect(log).toEqual(['a-before', 'a-before-end', 'b-apply']);
  });
  it('infinite event chain is an error naming the event', () => {
    const p = definePack({ id: 'loop', version: '1.0.0', events: ['loop:x'], hooks: [{ id: 'h', event: 'loop:x', phase: 'apply', run: w => { w.emit('loop:x', 0); } }], systems: [{ id: 's', phase: 'sim', run: w => { w.emit('loop:x', 0); } }] });
    const w = new World({ packs: [p], seed: 1, players: 1, strict: true });
    expect(() => w.step(newInput(1))).toThrow(/E_EVENT_DEPTH/);
  });
  it('a throwing hook is disabled deterministically and the rest continues', () => {
    const p = definePack({ id: 'h', version: '1.0.0', events: ['h:e'], state: { n: i32() }, hooks: [{ id: 'bad', event: 'h:e', phase: 'apply', run: () => { throw new Error('boom'); } }, { id: 'good', event: 'h:e', phase: 'after', run: w => { w.slice<{ n: number }>('h').n++; } }], systems: [{ id: 's', phase: 'sim', run: w => { w.emit('h:e', 0); } }] });
    const w = new World({ packs: [p], seed: 1, players: 1 }); w.step(newInput(1)); w.step(newInput(1));
    expect(w.reports).toHaveLength(1); expect(w.slice<{ n: number }>('h').n).toBe(2);
  });
  it('undeclared event is rejected', () => { const w = new World(cfg()); expect(() => w.emit('nope', 0)).toThrow(/E_EVENT_UNKNOWN/); });
});

describe('pack loader', () => {
  const mk = (id: string, extra: object = {}) => definePack({ id, version: '1.2.3', ...extra });
  it('orders dependencies first, ties by load order then id', () => {
    const r = resolvePacks([mk('c', { requires: ['a'] }), mk('b'), mk('a')]);
    expect(r.ordered.map(p => p.id)).toEqual(['a', 'b', 'c']);
    expect(resolvePacks([mk('b'), mk('a')], ['b', 'a']).ordered.map(p => p.id)).toEqual(['b', 'a']);
  });
  it('reports missing deps, bad versions, cycles, duplicates', () => {
    expect(() => resolvePacks([mk('a', { requires: ['zz'] })])).toThrow(/E_PACK_MISSING_DEP/);
    expect(() => resolvePacks([mk('a', { requires: ['b@^2.0.0'] }), mk('b')])).toThrow(/E_PACK_VERSION/);
    expect(() => resolvePacks([mk('a', { requires: ['b'] }), mk('b', { requires: ['a'] })])).toThrow(/E_PACK_CYCLE/);
    expect(() => resolvePacks([mk('a'), mk('a')])).toThrow(/E_PACK_DUP/);
  });
  it('semver', () => { expect(satisfies('1.2.3', '^1.0.0')).toBe(true); expect(satisfies('2.0.0', '^1.0.0')).toBe(false); expect(satisfies('1.2.3', '1.2.3')).toBe(true); expect(satisfies('1.2.4', '1.2.3')).toBe(false); });
  it('content: namespaced ids, collisions need an explicit override', () => {
    const base = mk('touhou', { contentTypes: ['character'], content: { character: { reimu: { hp: 100 } } } });
    const r = resolvePacks([base]); expect(r.registry.get('character', 'touhou:reimu')).toEqual({ hp: 100 });
    const silent = mk('mod', { requires: ['touhou'], content: { character: { 'touhou:reimu': { hp: 1 } } } });
    expect(() => resolvePacks([base, silent])).toThrow(/E_PACK_OVERRIDE/);
    const ok = mk('mod', { requires: ['touhou'], overrides: ['touhou:reimu'], content: { character: { 'touhou:reimu': { hp: 1 } } } });
    expect(resolvePacks([base, ok]).registry.get('character', 'touhou:reimu')).toEqual({ hp: 1 });
    expect(() => resolvePacks([mk('x', { content: { thing: { a: 1 } } })])).toThrow(/E_CONTENT_TYPE/);
  });
});

describe('handles, rng, sort, loop', () => {
  it('stale handles are detected after slot reuse', () => {
    const t = handleTable('e', 8), s = { ...Object.fromEntries(Object.entries(t.schema).map(([k, f]) => [k, f.k === 'i32[]' ? new Int32Array(f.n) : 0])) } as Record<string, number | Int32Array>;
    const h1 = t.alloc(s); expect(t.alive(s, h1)).toBe(true); expect(t.free(s, h1)).toBe(true);
    const h2 = t.alloc(s); expect(h2).not.toBe(h1); expect(t.alive(s, h1)).toBe(false); expect(t.alive(s, h2)).toBe(true); expect(t.free(s, h1)).toBe(false);
  });
  it('handle table full is an error', () => { const t = handleTable('e', 2), s = { eGen: new Int32Array(2), eFree: new Int32Array(2), eTop: 0, eNext: 0 }; t.alloc(s); t.alloc(s); expect(() => t.alloc(s)).toThrow(KernelError); });
  it('rng streams are independent: extra draws on one stream never shift another', () => {
    const a = new World(cfg()), b = new World(cfg());
    for (let i = 0; i < 50; i++) b.rng('kernel:main').next();
    expect(a.rng('sandbox:wobble').next()).toBe(b.rng('sandbox:wobble').next());
  });
  it('sortBy breaks ties by id', () => { expect(sortBy([{ k: 1, id: 3 }, { k: 0, id: 9 }, { k: 1, id: 2 }], x => x.k, x => x.id).map(x => x.id)).toEqual([9, 2, 3]); });
  it('fixed loop: 60 steps/s, bounded catch-up', () => {
    const l = new FixedLoop(); let n = 0; for (let i = 0; i < 100; i++) n += l.advance(1000 / 60); expect(n).toBe(100);
    expect(new FixedLoop().advance(10_000)).toBeLessThanOrEqual(8);
  });
  it('pressed() fires once per press', () => {
    const w = new World(cfg()); const i = newInput(2); setInput(i, 0, 0, 0, BTN.dash);
    w.step(i); w.step(i); w.step(i); expect(w.slice<{ dashes: number }>('sandbox').dashes).toBe(1);
  });
});
