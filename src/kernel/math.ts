/**
 * Deterministic math for the simulation (DESIGN §3.1).
 * Uses only + - * / and Math.sqrt/floor/round/abs, which are IEEE-exact on every engine, so results are bit-identical everywhere.
 * Accuracy ≈ 1e-15 relative (tested against Math.* with 1e-12 tolerance).
 */
export const PI = 3.141592653589793;
export const TAU = 6.283185307179586;
export const HALF_PI = 1.5707963267948966;
const TAU_HI = 6.28125, TAU_LO = 0.0019353071795864769; // Cody-Waite split of 2π
const LN2_HI = 6.93147180369123816490e-01, LN2_LO = 1.90821492927058770002e-10, LN2 = 0.6931471805599453;

const SIN_K: number[] = [], COS_K: number[] = [], ATAN_K: number[] = [];
for (let i = 1; i <= 14; i++) { SIN_K.push(1 / ((2 * i) * (2 * i + 1))); COS_K.push(1 / ((2 * i - 1) * (2 * i))); }
for (let i = 0; i < 14; i++) ATAN_K.push(1 / (2 * i + 1));

function reduce(x: number): number {
  if (x >= -PI && x <= PI) return x;
  const k = Math.round(x / TAU);
  return (x - k * TAU_HI) - k * TAU_LO;
}
function sinCore(r: number): number { const r2 = r * r; let t = r, s = r; for (let i = 0; i < 13; i++) { t *= -r2 * SIN_K[i]!; s += t; } return s; }
function cosCore(r: number): number { const r2 = r * r; let t = 1, s = 1; for (let i = 0; i < 13; i++) { t *= -r2 * COS_K[i]!; s += t; } return s; }

export function sin(x: number): number {
  let r = reduce(x);
  if (r > HALF_PI) r = PI - r; else if (r < -HALF_PI) r = -PI - r;
  return sinCore(r);
}
export function cos(x: number): number {
  let r = reduce(x), s = 1;
  if (r > HALF_PI) { r = PI - r; s = -1; } else if (r < -HALF_PI) { r = -PI - r; s = -1; }
  return s * cosCore(r);
}
export function tan(x: number): number { return sin(x) / cos(x); }

function atanSmall(x: number): number { const x2 = x * x; let p = x, s = x; for (let i = 1; i < 14; i++) { p *= -x2; s += p * ATAN_K[i]!; } return s; }
export function atan(x: number): number {
  if (x !== x) return x;
  const neg = x < 0, a = neg ? -x : x;
  let inv = false, v = a;
  if (a > 1) { inv = true; v = 1 / a; }
  v = v / (1 + Math.sqrt(1 + v * v)); v = v / (1 + Math.sqrt(1 + v * v)); // atan(x) = 4·atan(t) after two halvings
  let r = 4 * atanSmall(v);
  if (inv) r = HALF_PI - r;
  return neg ? -r : r;
}
export function atan2(y: number, x: number): number {
  if (x > 0) return atan(y / x);
  if (x < 0) return y >= 0 ? atan(y / x) + PI : atan(y / x) - PI;
  return y > 0 ? HALF_PI : y < 0 ? -HALF_PI : 0;
}
export function asin(x: number): number { return atan2(x, Math.sqrt(1 - x * x)); }
export function acos(x: number): number { return atan2(Math.sqrt(1 - x * x), x); }
/**
 * Hypotenuse, same algorithm as V8's Math.hypot (scale by the max, Kahan-summed squares, sqrt, rescale): only IEEE-exact ops, so it is
 * deterministic on every engine AND bit-identical to the legacy game's Math.hypot in V8 (matters for knife-edge thresholds such as the
 * heavy-bullet arming distance: 6 frames x speed 10 = exactly 60 in one and 59.999999999999986 in the other otherwise).
 */
export function hypot(x: number, y: number): number {
  const ax = x < 0 ? -x : x, ay = y < 0 ? -y : y, max = ax > ay ? ax : ay;
  if (max === 0 || max === Infinity) return max;
  if (max !== max) return max;
  let sum = 0, comp = 0;
  for (let i = 0; i < 2; i++) {
    const n = (i ? ay : ax) / max, summand = n * n - comp, prelim = sum + summand;
    comp = (prelim - sum) - summand; sum = prelim;
  }
  return Math.sqrt(sum) * max;
}

function pow2(n: number): number { let r = 1, b = 2, k = n < 0 ? -n : n; while (k > 0) { if (k & 1) r *= b; b *= b; k >>= 1; } return n < 0 ? 1 / r : r; }
export function exp(x: number): number {
  if (x !== x) return x;
  if (x > 709.7) return Infinity;
  if (x < -745) return 0;
  const k = Math.round(x / LN2), r = (x - k * LN2_HI) - k * LN2_LO;
  let t = 1, s = 1;
  for (let i = 1; i <= 16; i++) { t *= r / i; s += t; }
  const h = k >> 1; // split to avoid overflow of 2^k near the limits
  return s * pow2(h) * pow2(k - h);
}
export function log(x: number): number {
  if (x !== x || x < 0) return NaN;
  if (x === 0) return -Infinity;
  if (x === Infinity) return Infinity;
  let k = 0;
  while (x >= 2) { x *= 0.5; k++; }
  while (x < 1) { x *= 2; k--; }
  if (x > 1.4142135623730951) { x *= 0.5; k++; }
  const f = (x - 1) / (x + 1), s = f * f;
  let t = f, sum = f;
  for (let i = 1; i < 14; i++) { t *= s; sum += t / (2 * i + 1); }
  return 2 * sum + k * LN2;
}
export function pow(a: number, b: number): number {
  if (b === 0) return 1;
  if (b === Math.floor(b) && b > -1025 && b < 1025) { // exact repeated squaring for integer exponents
    let r = 1, base = a, k = b < 0 ? -b : b;
    while (k > 0) { if (k & 1) r *= base; base *= base; k = Math.floor(k / 2); }
    return b < 0 ? 1 / r : r;
  }
  if (a < 0) return NaN;
  if (a === 0) return b > 0 ? 0 : Infinity;
  return exp(b * log(a));
}

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v);
/** Wraps an angle to (-π, π]. */
export function wrapAngle(a: number): number { return reduce(a) <= -PI ? PI : reduce(a); }
/** Shortest signed difference b - a in radians. */
export function angleDiff(a: number, b: number): number { return wrapAngle(b - a); }

export const simMath = { PI, TAU, HALF_PI, sin, cos, tan, atan, atan2, asin, acos, hypot, exp, log, pow, lerp, clamp, wrapAngle, angleDiff } as const;
