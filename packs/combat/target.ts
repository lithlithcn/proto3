import { hypot } from '@kernel';
import { PS, type CombatState } from './state';

const ally = (s: CombatState, a: number, b: number): boolean => s.teams !== 0 && a !== b && s.team[a] === s.team[b];
export const foe = (s: CombatState, a: number, b: number): boolean => a !== b && !ally(s, a, b);

/** Nearest living foe, keeping the previous target while it stays within 25 % of the best distance (legacy tgt). */
export function pickTarget(s: CombatState, p: number): number {
  let best = -1, bd = 1e9;
  for (let q = 0; q < s.n; q++) {
    if (q === p || s.stocks[q]! <= 0 || s.state[q] === PS.dead || ally(s, p, q)) continue;
    const d = hypot(s.x[q]! - s.x[p]!, s.y[q]! - s.y[p]!);
    if (d < bd) { bd = d; best = q; }
  }
  const c = s.tgt[p]!;
  if (c >= 0 && c !== best && s.stocks[c]! > 0 && s.state[c] !== PS.dead && hypot(s.x[c]! - s.x[p]!, s.y[c]! - s.y[p]!) < bd * 1.25) best = c;
  if (best < 0) { for (let q = 0; q < s.n; q++) if (q !== p && s.stocks[q]! > 0 && !ally(s, p, q)) { best = q; break; } }
  if (best < 0) best = (p + 1) % s.n;
  return (s.tgt[p] = best);
}
