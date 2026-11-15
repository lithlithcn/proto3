import { describe, expect, it } from 'vitest';
import { makePair } from './harness';

/** Invulnerability edge: a melee hit that lands while the victim's `inv` is exactly 1 (last invulnerable frame) must be rejected (legacy: `inv>0`).
 *  Found as a survivor by mutation testing (DESIGN §28): random bots almost never line a hit up with that single frame. Sweeping the starting inv
 *  from 1 to 14 makes one trial hit exactly on every residual value, including 1. */
describe('parity: invulnerability window edges (vs legacy)', () => {
  it('melee into a foe whose remaining invulnerability sweeps 1..14: every frame equal, hits rejected exactly while inv > 0', () => {
    let rejected = 0, landed = 0;
    for (let n = 1; n <= 14; n++) {
      const k = makePair(['reimu', 'marisa'], 70 + n);
      k.legacy.eval('P[1].x=P[0].x+45;P[1].y=P[0].y'); k.s.x[1] = k.s.x[0]! + 45; k.s.y[1] = k.s.y[0]!;
      for (let f = 1; f <= 40; f++) {
        if (f === 1) { k.legacy.eval(`P[1].inv=${n}`); k.s.inv[1] = n; }
        const hp0 = k.s.hp[1]!, inv0 = k.s.inv[1]!;
        k.step([() => ({ btn: f === 1 || f === 15 ? ['melee'] : [] }), () => ({})], f); k.compare(`inv-edge n=${n}`);
        if (k.s.hp[1]! < hp0) landed++; else if (inv0 > 0 && k.s.state[0] === 5) rejected++;
      }
    }
    expect(landed, 'some hits must land (after the window)').toBeGreaterThan(0); expect(rejected, 'some swings must be rejected by invulnerability').toBeGreaterThan(0);
  });

  it('Marisa\'s laser (a path with no pre-check of its own) vs a foe whose invulnerability ends at every possible frame: every frame equal', () => {
    let landed = 0;
    for (let n = 20; n <= 90; n++) {
      const k = makePair(['marisa', 'reimu'], 90 + n);
      k.legacy.eval('P[1].x=P[0].x+260;P[1].y=P[0].y'); k.s.x[1] = k.s.x[0]! + 260; k.s.y[1] = k.s.y[0]!;
      for (let f = 1; f <= 110; f++) {
        if (f === 1) { k.legacy.eval(`P[1].inv=${n}`); k.s.inv[1] = n; }
        const hp0 = k.s.hp[1]!;
        k.step([() => ({ btn: f === 2 ? ['heavy'] : [] }), () => ({})], f); k.compare(`laser-inv n=${n}`);
        if (k.s.hp[1]! < hp0) landed++;
      }
    }
    expect(landed, 'the laser must land in some trials').toBeGreaterThan(0);
  });
});
