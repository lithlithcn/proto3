import { describe, expect, it } from 'vitest';
import { type Script, makePair } from './harness';

const hold = (x: number, y: number, ...btn: string[]): Script => () => ({ x, y, btn });
const strafe = (period: number, ...btn: string[]): Script => (f) => ({ x: 0, y: Math.floor(f / period) % 2 ? 1 : -1, btn });

describe('parity: light shot, bullets, graze, damage (Reimu vs legacy)', () => {
  it('shot cadence, bullets, homing options (no contact)', () => {
    makePair(['reimu', 'reimu']).run('shot', [hold(0, 0, 'shot'), hold(0, 1)], 90);
  });
  it('focus shot pattern', () => {
    makePair(['reimu', 'reimu']).run('focus-shot', [hold(0, 0, 'shot', 'focus'), hold(0, 0)], 90);
  });
  it('mutual fire while strafing: graze, power, spirit, damage, burst gain', () => {
    makePair(['reimu', 'reimu']).run('duel', [strafe(40, 'shot'), strafe(55, 'shot')], 600);
  });
  it('long duel until a KO: stocks, hitstop, slow-motion (stops before the KO beam lands)', () => {
    const k = makePair(['reimu', 'reimu']);
    k.run('ko', [hold(0, 0, 'shot'), hold(0, 0)], 2540);
    expect(k.legacy.obs().P[1]!.stocks, 'scenario must include a KO').toBeLessThan(3);
  });
  it.todo('KO beam: aim, fire, damage via hit() — needs the hit/hitstun system (next batch)');
});
