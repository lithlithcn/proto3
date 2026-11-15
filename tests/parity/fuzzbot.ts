import type { makePair } from './harness';
import type { Script } from './harness';

export const ROSTER = ['reimu', 'marisa', 'flandre', 'hecatia', 'nue', 'okina', 'nazrin', 'aya'];
const BTNS = ['shot', 'heavy', 'melee', 'dash', 'parry', 'focus', 'next', 'prev', 'spell'];
/** Deterministic LCG (test-side only; independent of the sim's RNG). */
const lcg = (seed: number) => { let x = seed >>> 0 || 1; return (): number => (x = (Math.imul(x, 1664525) + 1013904223) >>> 0) / 4294967296; };

/** Skill presses before frame 130 are skipped: the legacy lobby uses them to switch character (R78, not ported). Random but plausible player: holds a stick mode (chase / flee / random / still) and button bursts for a few frames, so most moves actually trigger. */
export function bot(k: ReturnType<typeof makePair>, me: number, seed: number): Script {
  const r = lcg(seed); let mode = 0, until = 0, ax = 0, ay = 0; const held = new Map<string, number>();
  return f => {
    if (f >= until) { mode = r() * 4 | 0; until = f + 8 + (r() * 40 | 0); ax = (r() * 2 - 1) * 0.69; ay = (r() * 2 - 1) * 0.69; }
    const o = 1 - me, dx = k.s.x[o]! - k.s.x[me]!, dy = k.s.y[o]! - k.s.y[me]!, d = Math.hypot(dx, dy) || 1;
    const st = mode === 0 ? { x: dx / d * 0.95, y: dy / d * 0.95 } : mode === 1 ? { x: -dx / d * 0.95, y: -dy / d * 0.95 } : mode === 2 ? { x: ax, y: ay } : {};
    for (const b of BTNS) if ((f >= 130 || (b !== 'next' && b !== 'prev')) && !held.has(b) && r() < (b === 'spell' ? 0.004 : b === 'shot' ? 0.05 : 0.02)) held.set(b, f + 1 + (r() * (b === 'shot' || b === 'focus' || b === 'heavy' ? 25 : 3) | 0));
    const btn = [...held].filter(([, e]) => e > f).map(([b]) => b); for (const [b, e] of held) if (e <= f) held.delete(b);
    if (f > 150 && f % 400 === 0) { k.legacy.eval(`for(const p of P)p.spirit=100`); k.s.spirit.fill(100, 0, 2); }
    // tiny stick noise: an exactly anti-parallel stick makes the dash steering sign a coin flip at float level (legacy quirk, R97 family)
    const jx = (r() - 0.5) * 0.04, jy = (r() - 0.5) * 0.04;
    return { x: ((st as { x?: number }).x ?? 0) + (mode === 3 ? 0 : jx), y: ((st as { y?: number }).y ?? 0) + (mode === 3 ? 0 : jy), btn };
  };
}

