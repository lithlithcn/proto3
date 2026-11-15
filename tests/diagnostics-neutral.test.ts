import { describe, expect, it } from 'vitest';
import { World, newInput, setInput } from '@kernel';
import combat from '../packs/combat/pack';
import touhou from '../packs/touhou/pack';

/** The diagnostics must not change the game: same seed + inputs ⇒ identical state hashes with diag off, diag 2 and a system tracer attached; and snapshot/restore replays exactly. */
const make = (diag: 0 | 1 | 2): World => new World({ packs: [combat, touhou], seed: 7, players: 2, diag, world: { players: [{ char: 'touhou:reimu' }, { char: 'touhou:aya' }], items: false } });
const inputs = (f: number) => { const i = newInput(2); for (let p = 0; p < 2; p++) setInput(i, p, Math.round(Math.sin(f * 0.07 + p) * 100), Math.round(Math.cos(f * 0.05 * (p + 1)) * 100), (f % (13 + p) < 5 ? 1 : 0) | (f % 97 === 0 ? 2 : 0) | (f % 211 === 0 ? 64 : 0)); return i; };
const run = (w: World, from: number, to: number): void => { for (let f = from; f < to; f++) w.step(inputs(f)); };
describe('diagnostics are neutral', () => {
  it('diag 0 / diag 2 / sysTrace give identical state', () => {
    const a = make(0), b = make(2), c = make(1); let n = 0; c.sysTrace = () => { n++; };
    run(a, 0, 900); run(b, 0, 900); run(c, 0, 900);
    expect(b.sections()).toEqual(a.sections()); expect(c.sections()).toEqual(a.sections()); expect(n).toBeGreaterThan(900);
  });
  it('snapshot → restore → continue reproduces the straight run (no hidden state outside the schema)', () => {
    const a = make(2), b = make(2); run(a, 0, 400); const snap = a.snapshot(); run(a, 400, 900); run(b, 0, 400); run(b, 400, 600); b.restore(snap); run(b, 400, 900);
    expect(b.sections()).toEqual(a.sections());
  });
});
