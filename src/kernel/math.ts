/**
 * Deterministic math for the simulation (DESIGN §3.1).
 * Uses only + - * / and Math.sqrt/floor/round/abs, which are IEEE-exact on every engine, so results are bit-identical everywhere.
 * The transcendental functions are bit-exact ports of the legacy game's own deterministic overrides (see below).
 */
export const PI = 3.141592653589793;
export const TAU = 6.283185307179586;
export const HALF_PI = 1.5707963267948966;
const LN2 = 0.6931471805599453;

const TP = 6.283185307179586, QP = 0.7853981633974483;
const S = [1, -1 / 6, 1 / 120, -1 / 5040, 1 / 362880, -1 / 39916800, 1 / 6227020800, -1 / 1307674368000, 1 / 355687428096000, -1 / 121645100408832000];

/*
 * These are EXACT ports of the legacy game's own deterministic Math overrides (legacy/shmup-fighter.html, "maths déterministes"):
 * same formulas, same operation order, only IEEE-exact operations, so every result is bit-identical to the oracle and on every engine
 * (tests/math-legacy.test.ts evaluates the legacy block itself and compares bit for bit). Do NOT "improve" the maths: parity depends on the last bit.
 */
export function sin(x: number): number {
  if (x !== x || x === Infinity || x === -Infinity) return NaN;
  let r = x - Math.round(x / TP) * TP;
  if (r > HALF_PI) r = PI - r; else if (r < -HALF_PI) r = -PI - r;
  const z = r * r; let p = S[9]!;
  for (let i = 8; i >= 0; i--) p = p * z + S[i]!;
  return r * p;
}
export function cos(x: number): number { return sin(x + HALF_PI); }
export function tan(x: number): number { return sin(x) / cos(x); }

function at1(x: number): number { const z = x * x; let p = 0; for (let k = 27; k >= 1; k -= 2) p = p * z + ((k >> 1) & 1 ? -1 : 1) / k; return x * p; }
function atn(x: number): number { return x > 0.4142135623730950 ? QP + at1((x - 1) / (x + 1)) : at1(x); }
export function atan(x: number): number {
  if (x !== x) return NaN;
  const n = x < 0; if (n) x = -x;
  const r = x > 1 ? HALF_PI - atn(1 / x) : atn(x);
  return n ? -r : r;
}
export function atan2(y: number, x: number): number {
  if (y !== y || x !== x) return NaN;
  if (x > 0) return atan(y / x);
  if (x < 0) return y >= 0 ? atan(y / x) + PI : atan(y / x) - PI;
  return y > 0 ? HALF_PI : y < 0 ? -HALF_PI : 0;
}
export function asin(x: number): number { return atan2(x, Math.sqrt(1 - x * x)); }
export function acos(x: number): number { return atan2(Math.sqrt(1 - x * x), x); }
/** Legacy hypot: sqrt(a² + b²) (NOT V8's scaled algorithm). */
export function hypot(x: number, y: number): number { return Math.sqrt(x * x + (y || 0) * (y || 0)); }

export function exp(x: number): number {
  if (x !== x) return NaN;
  if (x > 709) return Infinity;
  if (x < -745) return 0;
  const k = Math.round(x / LN2), r = x - k * LN2;
  let p = 1; for (let i = 22; i >= 1; i--) p = 1 + p * r / i;
  let m = p, K = k;
  while (K > 0) { m *= 2; K--; }
  while (K < 0) { m /= 2; K++; }
  return m;
}
export function log(a: number): number {
  if (!(a > 0)) return a === 0 ? -Infinity : NaN;
  let e = 0;
  while (a >= 2) { a /= 2; e++; }
  while (a < 1) { a *= 2; e--; }
  const z = (a - 1) / (a + 1), z2 = z * z; let p = 0;
  for (let k = 41; k >= 1; k -= 2) p = p * z2 + 1 / k;
  return e * LN2 + 2 * z * p;
}
export function pow(a: number, b: number): number {
  if (b === 0) return 1;
  if (Number.isInteger(b) && Math.abs(b) <= 64) { let r = 1, x = a, n = Math.abs(b); while (n) { if (n & 1) r *= x; x *= x; n >>= 1; } return b < 0 ? 1 / r : r; }
  if (a < 0) return NaN;
  if (a === 0) return b > 0 ? 0 : Infinity;
  return exp(b * log(a));
}

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v);
/** Wraps an angle to (-π, π]. */
export function wrapAngle(a: number): number { const r = a >= -PI && a <= PI ? a : a - Math.round(a / TAU) * TAU; return r <= -PI ? PI : r; }
/** Shortest signed difference b - a in radians. */
export function angleDiff(a: number, b: number): number { return wrapAngle(b - a); }

export const simMath = { PI, TAU, HALF_PI, sin, cos, tan, atan, atan2, asin, acos, hypot, exp, log, pow, lerp, clamp, wrapAngle, angleDiff } as const;
