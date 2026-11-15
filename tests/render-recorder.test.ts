import { createRequire } from 'node:module';
import { expect, it } from 'vitest';
const { createLegacy } = createRequire(import.meta.url)('../tools/parity/legacy.cjs') as { createLegacy: (o: object) => { step(i: object[]): void; render(): unknown[][] } };
const { diffOps } = createRequire(import.meta.url)('../tools/parity/recorder.cjs') as { diffOps(a: unknown[][], b: unknown[][], tol?: number): { i: number; who: string; a: unknown[]; b: unknown[] } | null };
const frame = (seed: number, n: number): unknown[][] => { const L = createLegacy({ chars: ['reimu', 'marisa'], seed }); for (let f = 0; f < n; f++) L.step([{ x: 0.5, b: { shot: f % 30 < 15 } }, {}]); return L.render(); };

it('render recorder: same game -> identical op stream; a different game is located (op index + which draw function)', () => {
  const a = frame(1, 150), b = frame(1, 150), c = frame(1, 151);
  expect(a.length).toBeGreaterThan(2000); expect(a.some(o => o[0] === '#')).toBe(true);
  expect(diffOps(a, b)).toBeNull();
  const d = diffOps(a, c); expect(d, 'one more frame of play must change the picture').not.toBeNull(); expect(d!.who).toMatch(/draw/);
});
