import { atan2, cos, hypot, sin } from '@kernel';
import { type CombatState, type HeavyCtx, PS, TAU, addEnt, entsOf, foe, jTxt, pushJ, sfx } from '@pack/combat/api';
import type { TouhouState } from '../../state';
import { EK_NPD, EK_NPG } from './kinds';

/** Spawns a pendulum: anchor (ax, ay), swing centred on `a`, rod length L; `big` = the spell version (slower, wider, 200 frames). */
export function pendulum(s: CombatState, p: number, ax: number, ay: number, a: number, L: number, d: number, big: boolean): void {
  const T = big ? 200 : 180, e = addEnt(s, EK_NPD, p, T, s.x[p]!, s.y[p]!);
  if (e >= 0) { s.ebc[e] = T; s.er[e] = ax; s.eh[e] = ay; s.ea[e] = a; s.ew[e] = L; s.ed[e] = d; s.efl[e] = big ? 1 : 0; }
}

/** Nazrin's heavies: N = a swinging pendulum (6 dmg, erases light bullets), F = detection cone that marks the foe it covers (mice rush there for 200 frames), B = three guard pendulums orbiting her. */
export const nazrinHeavy = {
  N({ w, s, p, a, k }: HeavyCtx): void {
    const L: number[] = []; entsOf(s, EK_NPD, p, L); for (const i of L) if (!s.efl[i]) s.et[i] = 0;
    pendulum(s, p, s.x[p]! + cos(a) * 30, s.y[p]! + sin(a) * 30, a, 95, 6 * k, false); sfx(w, 'tan00', 0.5);
  },
  F({ w, s, p, a, clone }: HeavyCtx): void {
    let best = -1, bd = 1e9;
    for (let q = 0; q < s.n; q++) {
      if (q === p || s.state[q] === PS.dead || s.inv[q]! > 0 || !foe(s, p, q)) continue;
      const dx = s.x[q]! - s.x[p]!, dy = s.y[q]! - s.y[p]!, d = hypot(dx, dy); let da = Math.abs(atan2(dy, dx) - a); da = Math.min(da, TAU - da);
      if (d < 420 && da < 0.5 && d < bd) { bd = d; best = q; }
    }
    pushJ(w, 'PE', 'seq', s.nextEid, 'k', 'ncn', 'o', p, 't', 16, 'x', s.x[p]!, 'y', s.y[p]!, 'a', a); // dowsing cone (presentation entity)
    if (best >= 0 && !clone) { const t = w.slice<TouhouState>('touhou'); t.nTg[p] = best; t.nTgF[p] = s.gf + 200; jTxt(w, s.x[best]!, s.y[best]! - 36, 'FOUND!', '#ffd23a', 15); }
    if (!clone) sfx(w, best >= 0 ? 'aimreal' : 'se_invalid', best >= 0 ? 1 : 0.5);
  },
  B({ w, s, p }: HeavyCtx): void {
    sfx(w, 'blockshield', 0.5); const L: number[] = []; entsOf(s, EK_NPG, p, L); for (const i of L) s.et[i] = 0;
    for (let i = 0; i < 3; i++) { const e = addEnt(s, EK_NPG, p, 200, s.x[p]!, s.y[p]!); if (e >= 0) s.ebc[e] = i; }
  },
} as const;
