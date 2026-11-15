import { cos, hypot, sin } from '@kernel';
import { BF, type HeavyCtx, PS, addEnt, chHitQ, entsOf, foe, heavyBullet } from '@pack/combat/api';
import { EK_ATN } from './kinds';

/** Aya's heavies: N = slow tornado (max 2, pulls foes, erases light bullets, can be dashed through for a Hyper Dash), F = piercing wind blade, B = gust that shoves foes and bends foreign bullets away. */
export const ayaHeavy = {
  N({ s, p, a, k }: HeavyCtx): void {
    const e = addEnt(s, EK_ATN, p, 180, s.x[p]! + cos(a) * 40, s.y[p]! + sin(a) * 40);
    if (e >= 0) { s.evx[e] = cos(a) * 2; s.evy[e] = sin(a) * 2; s.ed[e] = 3 * k; }
    const L: number[] = []; entsOf(s, EK_ATN, p, L); for (let i = 0; i < L.length - 2; i++) s.et[L[i]!] = 0;
  },
  F({ s, p, a, k, m, src }: HeavyCtx): void {
    heavyBullet(s, p, src, m, a, k, { spd: 18, r: 6, k: 1 });
    const b = s.nb - 1; if (b >= 0 && s.bowner[b] === p) { s.bflags[b] = s.bflags[b]! | BF.pierce; s.bcol[b] = 0xbfffe0; }
  },
  B({ w, s, p, k }: HeavyCtx): void {
    for (let q = 0; q < s.n; q++) {
      if (q === p || s.state[q] === PS.dead || s.inv[q]! > 0 || !foe(s, p, q)) continue;
      const dx = s.x[q]! - s.x[p]!, dy = s.y[q]! - s.y[p]!, d = hypot(dx, dy) || 1;
      if (d < 220) { s.vx[q] = s.vx[q]! + dx / d * 9; s.vy[q] = s.vy[q]! + dy / d * 9; if (d < 120) chHitQ(w, s, p, q, dx / d, dy / d, 3 * k, 12, 18); }
    }
    for (let b = 0; b < s.nb; b++) {
      if (s.bflags[b]! & BF.dead || s.bowner[b] === p) continue;
      const dx = s.bx[b]! - s.x[p]!, dy = s.by[b]! - s.y[p]!, d = hypot(dx, dy) || 1;
      if (d < 180) { const sp = hypot(s.bvx[b]!, s.bvy[b]!); s.bvx[b] = dx / d * sp; s.bvy[b] = dy / d * sp; }
    }
  },
} as const;
