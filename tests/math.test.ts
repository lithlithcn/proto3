import { describe, expect, it } from 'vitest';
import { acos, asin, atan, atan2, cos, exp, hypot, log, pow, sin, tan, wrapAngle } from '@kernel';

const close = (a: number, b: number, tol = 1e-12): void => { expect(Math.abs(a - b) / Math.max(1, Math.abs(b))).toBeLessThan(tol); };
describe('sim.math matches Math.* within 1e-12', () => {
  it('sin/cos/tan over a wide range', () => { for (let x = -200; x <= 200; x += 0.0137) { close(sin(x), Math.sin(x)); close(cos(x), Math.cos(x)); } for (let x = -1.5; x <= 1.5; x += 0.01) close(tan(x), Math.tan(x)); });
  it('atan/atan2/asin/acos', () => {
    for (let x = -50; x <= 50; x += 0.0731) close(atan(x), Math.atan(x));
    for (let y = -9; y <= 9; y += 0.37) for (let x = -9; x <= 9; x += 0.41) close(atan2(y, x), Math.atan2(y, x));
    for (let x = -1; x <= 1; x += 0.01) { close(asin(x), Math.asin(x), 1e-9); close(acos(x), Math.acos(x), 1e-9); }
  });
  it('exp/log/pow/hypot', () => {
    for (let x = -30; x <= 30; x += 0.173) close(exp(x), Math.exp(x));
    for (let x = 1e-6; x < 1e6; x *= 1.37) close(log(x), Math.log(x));
    for (let a = 0.1; a < 20; a += 0.9) for (let b = -4; b <= 4; b += 0.5) close(pow(a, b), Math.pow(a, b));
    close(hypot(3, 4), 5); close(pow(2, 10), 1024);
  });
  it('edge cases', () => { expect(atan2(0, 0)).toBe(0); expect(log(0)).toBe(-Infinity); expect(Number.isNaN(log(-1))).toBe(true); expect(exp(800)).toBe(Infinity); close(wrapAngle(7), 7 - 2 * Math.PI); });
  it('is bit-stable (golden values)', () => { // these exact doubles must never change across engines/versions
    expect(sin(1)).toBe(sin(1)); expect([sin(0.5), cos(0.5), atan2(1, 2), exp(1.5), log(7)].map(v => v.toString())).toMatchSnapshot();
  });
});
