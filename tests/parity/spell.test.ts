import { describe, expect, it } from 'vitest';
import { type Script, makePair } from './harness';

type Pair = ReturnType<typeof makePair>;
const idle: Script = () => ({});
/** Both sides: pool = the 11 shared cards + Reimu's own (legacy also holds the other 7 characters' cards after these: truncated), same spell RNG seed, P0 full of spirit.
 *  `pick` forces the card of the next cast on both sides (legacy: wrapper on startSpell; proto3: `spPick`). */
function pair(pick = -1): Pair {
  const k = makePair(['reimu', 'reimu']);
  k.legacy.eval(`P.forEach(p=>p.spI=11);P[0].spirit=100;seed=777;globalThis.PICK=${pick};{const S=startSpell;startSpell=(p,o,u)=>{S(p,o,u);if(PICK>=0&&p.state==='spell'&&!u)p.spI=PICK}}`);
  k.s.spirit[0] = 100; k.s.spI.fill(11, 0, 2); k.s.spSeed = 777; k.s.spPick = pick;
  return k;
}
function run(tag: string, sc: Script[], frames: number, probe: (L: (e: string) => number) => void, k = pair()): Pair {
  const L = (e: string): number => k.legacy.eval(e) as number;
  for (let f = 1; f <= frames; f++) { k.step(sc, f); k.compare(tag); probe(L); }
  return k;
}
const track = (get: (L: (e: string) => number) => number): { probe: (L: (e: string) => number) => void; max: () => number } => { let m = 0; return { probe: L => { m = Math.max(m, get(L)); }, max: () => m }; };

describe('parity: spell card (Reimu vs legacy)', () => {
  it('cast, cut-in, pattern, timeout and SPELL CAPTURED (+50 spirit to a foe the card never touched)', () => {
    const on = track(L => L('P[0].state==="spell"?1:0')), cap = track(L => L('P[1].spirit>=50?1:0')), n = track(L => L('B.filter(b=>b.heavy).length'));
    const k = pair(); k.legacy.eval('P[1].inv=1e6'); k.s.inv[1] = 1e6; // untouchable foe: the card never hits it
    run('cast', [f => (f === 10 ? { btn: ['spell'] } : {}), idle], 420, l => { on.probe(l); cap.probe(l); n.probe(l); }, k);
    expect(on.max()).toBe(1); expect(n.max(), 'the card must fire').toBeGreaterThan(6); expect(cap.max()).toBe(1);
  });
  it('refused with a low gauge (no state change); a spell press from idle consumes the cost', () => {
    const k = pair(); k.legacy.eval('P[0].spirit=40'); k.s.spirit[0] = 40;
    run('refuse', [f => (f % 20 === 0 ? { btn: ['spell'] } : {}), idle], 100, () => {}, k);
    expect(k.s.spirit[0]).toBeGreaterThanOrEqual(40);
  });
  it('a spell card is broken by melee (after its 120 f invulnerability) — the caster is launched', () => {
    const brk = track(L => L('P[0].state==="hitstun"?1:0')), on = track(L => L('P[0].state==="spell"?1:0'));
    const foe: Script = f => ({ x: -0.15, btn: f > 120 && f % 9 === 0 ? ['melee'] : [] }); // creeps toward the caster so a jab lands right after its invulnerability
    const k = pair(); k.legacy.eval('P[1].x=P[0].x+75;P[1].y=P[0].y;P[1].inv=1e6'); k.s.x[1] = k.s.x[0]! + 75; k.s.y[1] = k.s.y[0]!; k.s.inv[1] = 1e6; // foe starts at melee range, untouchable by the orbs
    run('break', [f => (f === 10 ? { btn: ['spell'] } : {}), foe], 400, l => { brk.probe(l); on.probe(l); }, k);
    expect(on.max()).toBe(1); expect(brk.max()).toBe(1);
  });
  it('spell cancel out of hit-stun (rising edge of the button with a full gauge)', () => {
    const foe: Script = f => ({ x: f < 130 ? -1 : 0, btn: f > 100 && f % 9 === 0 ? ['melee'] : [] });
    const first = { f: 0 };
    { const k = pair(); const L = (e: string): number => k.legacy.eval(e) as number; // dry run: when is P0 first in hit-stun?
      for (let f = 1; f <= 400 && !first.f; f++) { k.step([idle, foe], f); if (L('P[0].state==="hitstun"?1:0')) first.f = f; } }
    expect(first.f, 'P0 must get hit').toBeGreaterThan(0);
    const on = track(L => L('P[0].state==="spell"?1:0'));
    run('cancel', [f => (f === first.f + 10 ? { btn: ['spell'] } : {}), foe], first.f + 60, on.probe);
    expect(on.max(), 'cancelled into a spell').toBe(1);
  });
  it.each([...Array(11).keys()])('shared card #%i: every bullet matches the legacy engine frame by frame (positions, curves, drag, timed events, RNG)', i => {
    const k = pair(i); k.legacy.eval('P[1].inv=1e6'); k.s.inv[1] = 1e6;
    const n = track(L => L('B.length'));
    run(`card${i}`, [f => (f === 10 ? { btn: ['spell'] } : {}), idle], 330, n.probe, k);
    expect(n.max(), 'the card must fire').toBeGreaterThan(10);
    expect(k.s.spSeed, 'spell RNG consumption').toBe(k.legacy.eval('seed'));
  });
});
