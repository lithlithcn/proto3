import { describe, it } from 'vitest';
import { type Script, makePair } from './harness';

const idle: Script = () => ({});
const seq = (...parts: [number, Script][]): Script => (f) => { let t = f - 1; for (const [n, sc] of parts) { if (t < n) return sc(t + 1); t -= n; } return {}; };
const move = (x: number, y: number, ...btn: string[]): Script => () => ({ x, y, btn });

describe('parity: locomotion (Reimu vs legacy)', () => {
  it('walk, release, reverse (pivot)', () => {
    makePair(['reimu', 'reimu']).run('walk', [seq([40, move(1, 0)], [20, idle], [30, move(-1, 0)], [30, idle]), idle], 120);
  });
  it('diagonal, focus walk and brake', () => {
    makePair(['reimu', 'reimu']).run('focus', [seq([30, move(0.7, 0.7)], [30, move(0.7, 0.7, 'focus')], [30, move(0, 0, 'focus')], [20, idle]), seq([40, move(-1, 0.5)], [60, idle])], 140);
  });
  it('dash, dash-hold run, glide', () => {
    makePair(['reimu', 'reimu']).run('dash', [seq([5, idle], [1, move(1, 0, 'dash')], [14, idle], [1, move(0, 1, 'dash')], [40, move(0, 1, 'dash')], [30, idle], [1, move(1, 0, 'focus', 'dash')], [40, idle]), idle], 140);
  });
  it('walls: walk into the wall, wall-kick dash, glide bounce, red zone damage', () => {
    makePair(['reimu', 'reimu']).run('walls', [seq([230, move(-1, 0)], [1, move(-1, 0, 'dash')], [30, idle], [1, move(0, 1, 'dash')], [60, idle]), seq([60, idle], [1, move(1, 0, 'focus', 'dash')], [120, move(1, 0)])], 320);
  });
});
