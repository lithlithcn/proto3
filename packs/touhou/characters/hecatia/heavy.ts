import { atan2 } from '@kernel';
import { type HeavyCtx, addEnt, entsOf, heavyBullet, nearFoe } from '@pack/combat/api';
import type { TouhouState } from '../../state';
import { EK_HPL, EK_HRG, HEC } from './kinds';

/** Hecatia's heavies: N = a planet of the current body that orbits the foe (max 3), F = a line of 6 stars, B = a ring of 3 planets that guards her for 4 s. */
export const hecatiaHeavy = {
  N({ w, s, p, clone }: HeavyCtx): void {
    const q = nearFoe(s, p, s.x[p]!, s.y[p]!), e = addEnt(s, EK_HPL, p, 300, s.x[p]!, s.y[p]!);
    if (e >= 0) { s.ebc[e] = clone ? 0 : w.slice<TouhouState>('touhou').hM[p]!; s.ew[e] = q; s.ea[e] = atan2(s.y[p]! - (q >= 0 ? s.y[q]! : s.y[p]!), s.x[p]! - (q >= 0 ? s.x[q]! : s.x[p]!)); }
    const L: number[] = []; entsOf(s, EK_HPL, p, L); for (let i = 0; i < L.length - 3; i++) s.et[L[i]!] = 0;
  },
  F({ s, p, a, k, m, src }: HeavyCtx): void { for (let i = 0; i < 6; i++) heavyBullet(s, p, src, m, a, k, { spd: 6 + i * 0.9, r: 6, k: 0.22, col: HEC[i % 3] }); },
  B({ s, p }: HeavyCtx): void {
    const L: number[] = []; entsOf(s, EK_HRG, p, L); for (const i of L) s.et[i] = 0;
    for (let i = 0; i < 3; i++) { const e = addEnt(s, EK_HRG, p, 240, s.x[p]!, s.y[p]!); if (e >= 0) s.ebc[e] = i; }
  },
} as const;
