import type { makePair } from './harness';
import type { Script } from './harness';
import { PS } from '../../packs/combat/state';

export const ROSTER = ['reimu', 'marisa', 'flandre', 'hecatia', 'nue', 'okina', 'nazrin', 'aya'];
const BTNS = ['shot', 'heavy', 'melee', 'dash', 'parry', 'focus', 'next', 'prev', 'spell'];
/** Deterministic LCG (test-side only; independent of the sim's RNG). */
const lcg = (seed: number) => { let x = seed >>> 0 || 1; return (): number => (x = (Math.imul(x, 1664525) + 1013904223) >>> 0) / 4294967296; };

/** Skill presses before frame 130 are skipped: the legacy lobby uses them to switch character (R78, not ported). Random but plausible player: holds a stick mode (chase / flee / random / still) and button bursts for a few frames, so most moves actually trigger. */
export function bot(k: ReturnType<typeof makePair>, me: number, seed: number): Script {
  const r = lcg(seed), persona = (seed >>> 3) % 4; let mode = 0, until = 0, ax = 0, ay = 0; const held = new Map<string, number>();
  return f => {
    if (f >= until) { mode = r() * 4 | 0; until = f + 8 + (r() * 40 | 0); ax = (r() * 2 - 1) * 0.69; ay = (r() * 2 - 1) * 0.69; }
    const o = 1 - me, dx = k.s.x[o]! - k.s.x[me]!, dy = k.s.y[o]! - k.s.y[me]!, d = Math.hypot(dx, dy) || 1;
    const st = mode === 0 ? { x: dx / d * 0.95, y: dy / d * 0.95 } : mode === 1 ? { x: -dx / d * 0.95, y: -dy / d * 0.95 } : mode === 2 ? { x: ax, y: ay } : {};
    for (const b of BTNS) if ((f >= 130 || (b !== 'next' && b !== 'prev')) && !held.has(b) && r() < (b === 'spell' ? 0.004 : b === 'shot' ? 0.05 : 0.02)) held.set(b, f + 1 + (r() * (b === 'shot' || b === 'focus' || b === 'heavy' ? 25 : 3) | 0));
    const btn = [...held].filter(([, e]) => e > f).map(([b]) => b); for (const [b, e] of held) if (e <= f) held.delete(b);
    if (f > 150 && f % 400 === 0) { k.legacy.eval(`for(const p of P)p.spirit=100`); k.s.spirit.fill(100, 0, 2); }
    // personas (0 = the original random player). They exist to REACH situations random play almost never does (hits at the edge of invulnerability, wall bounces, combos): found by mutation testing (DESIGN §28).
    const extra: string[] = []; let pst: { x: number; y: number } | null = null;
    if (persona) {
      const cx = k.s.mapW / 2, cy = k.s.mapH / 2, ox = k.s.x[o]!, oy = k.s.y[o]!, stun = k.s.state[o] === PS.hitstun;
      if (persona === 1) { pst = { x: dx / d * 0.95, y: dy / d * 0.95 }; if (d < 110 && r() < 0.3) extra.push('melee'); if (stun && r() < 0.5) extra.push(r() < 0.5 ? 'heavy' : 'melee'); if (d < 60 && r() < 0.1) extra.push('dash'); }
      else if (persona === 2) { const sgn = d < 240 ? -1 : d > 340 ? 1 : 0; pst = { x: dx / d * 0.9 * sgn - dy / d * 0.5, y: dy / d * 0.9 * sgn + dx / d * 0.5 }; if (r() < 0.3) extra.push('shot'); if (r() < 0.04) extra.push('heavy'); if (r() < 0.03) extra.push('parry'); }
      else { const ex = ox - cx, ey = oy - cy, el = Math.hypot(ex, ey) || 1, tx = ox - ex / el * 70 - k.s.x[me]!, ty = oy - ey / el * 70 - k.s.y[me]!, tl = Math.hypot(tx, ty) || 1; pst = { x: tx / tl * 0.95, y: ty / tl * 0.95 }; if (d < 120 && r() < 0.3) extra.push('melee'); if (stun && r() < 0.6) extra.push(r() < 0.5 ? 'heavy' : 'melee'); if (r() < 0.05) extra.push('dash'); }
    }
    // tiny stick noise: an exactly anti-parallel stick makes the dash steering sign a coin flip at float level (legacy quirk, R97 family)
    const jx = (r() - 0.5) * 0.04, jy = (r() - 0.5) * 0.04;
    const pre = pst ?? (st as { x?: number; y?: number }), still = !pst && mode === 3;
    return { x: (pre.x ?? 0) + (still ? 0 : jx), y: (pre.y ?? 0) + (still ? 0 : jy), btn: persona ? [...new Set([...btn, ...extra])] : btn };
  };
}

