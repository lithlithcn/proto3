import { KernelError } from './errors';

/** Dev/lab sanitizer (DESIGN §3.7): during a sim step, non-deterministic APIs throw with a stack pointing at the culprit (catches mods, which lint cannot see). */
const BANNED_MATH = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2', 'sinh', 'cosh', 'tanh', 'hypot', 'pow', 'exp', 'expm1', 'log', 'log1p', 'log2', 'log10', 'cbrt', 'random'] as const;

export function withSanitizer<T>(fn: () => T): T {
  const M = Math as unknown as Record<string, unknown>;
  const saved: [object, string, unknown][] = [];
  const trap = (obj: object, key: string, name: string): void => {
    const rec = obj as Record<string, unknown>;
    saved.push([obj, key, rec[key]]);
    rec[key] = () => { throw new KernelError('E_SANITIZER', `${name} is not allowed in simulation code`); };
  };
  for (const k of BANNED_MATH) trap(M, k, `Math.${k}`);
  trap(Date, 'now', 'Date.now'); trap(performance, 'now', 'performance.now');
  try { return fn(); } finally { for (const [o, k, v] of saved) (o as Record<string, unknown>)[k] = v; }
}
