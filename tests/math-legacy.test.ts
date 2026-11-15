import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { expect, it } from 'vitest';
import { atan, atan2, cos, exp, hypot, log, pow, sin } from '../src/kernel/math';

/** The oracle's own deterministic Math block, evaluated as-is: sim.math must agree with it to the LAST BIT (parity depends on knife-edge thresholds). */
it('sim.math sin/cos/atan/atan2/hypot/log/exp/pow are bit-identical to the legacy game\'s overrides', () => {
  const html = readFileSync(new URL('../legacy/shmup-fighter.html', import.meta.url), 'utf8'), a = html.indexOf('// ===== maths déterministes'), b = html.indexOf('// ================= RÉGLAGES');
  expect(a).toBeGreaterThan(0); expect(b).toBeGreaterThan(a);
  const M = runInNewContext(`var Math=Object.create(Math);${html.slice(a, b)};Math`) as Record<string, (...v: number[]) => number>;
  let s = 987654321; const r = (): number => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
  const bad: string[] = [], chk = (n: string, got: number, want: number, ...args: number[]): void => { if (!Object.is(got, want) && bad.length < 5) bad.push(`${n}(${args.join(',')}) port=${got} legacy=${want}`); };
  for (let i = 0; i < 100000; i++) {
    const x = (r() - 0.5) * (i % 3 === 0 ? 20 : i % 3 === 1 ? 2000 : 7), y = (r() - 0.5) * (i % 2 ? 3000 : 5), p = r() * 50 + 1e-3;
    chk('sin', sin(x), M.sin!(x), x); chk('cos', cos(x), M.cos!(x), x); chk('atan', atan(y), M.atan!(y), y); chk('atan2', atan2(y, x), M.atan2!(y, x), y, x);
    chk('hypot', hypot(x, y), M.hypot!(x, y), x, y); chk('log', log(p), M.log!(p), p); chk('exp', exp(x), M.exp!(x), x); chk('pow', pow(p, y / 1500 + 0.3), M.pow!(p, y / 1500 + 0.3), p);
  }
  for (const v of [0, -0, Math.PI, -Math.PI, Math.PI / 2, 1e-300]) { chk('sin', sin(v), M.sin!(v), v); chk('cos', cos(v), M.cos!(v), v); chk('atan2', atan2(-0, v), M.atan2!(-0, v), -0, v); }
  expect(bad).toEqual([]);
});
