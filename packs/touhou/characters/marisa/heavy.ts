import { type HeavyCtx, RAYF, fireRay, heavyBullet, addJ } from '@pack/combat/api';
import type { TouhouState } from '../../state';
import { LZ_GAP, LZ_TELE } from './kinds';

/** Hakkero heat -> heavy size multiplier (legacy mHm); reading it cools the Hakkero. */
export function heatMul(ts: TouhouState, p: number): number { const h = 1 + Math.min(1.3, ts.mH[p]! / 100); ts.mH[p] = 0; return h; }
const STAR = [0xffe14a, 0x7cff7a, 0x4ab3ff];

/** Marisa's heavies: N = Master Spark (wide, pushes her back, clears light bullets), F = Narrow Spark (thin, hits once), B = Stardust Reverie (7 slow stars). Lasers lock her out for warning + beam + 1 s. */
export const marisaHeavy = {
  N({ w, s, p, a, k, clone }: HeavyCtx): void {
    const ts = w.slice<TouhouState>('touhou'); if (!clone && ts.mLz[p]! > s.gf) return; // the Doppelganger's stand-in has its own (empty) laser lock (legacy)
    const h = heatMul(ts, p); if (!clone) ts.mLz[p] = s.gf + LZ_TELE + 44 + LZ_GAP;
    fireRay(s, p, { T: LZ_TELE + 44, tele: LZ_TELE, flags: RAYF.warn | RAYF.follow | RAYF.clear, w: 14 * h, len: 1000, dmg: 1.5 * h * k, ev: 7, kb: 6, stun: 18, push: 0.35, a, c: 0xffe060 }); addJ(w, 'shake', 6, 28);
  },
  F({ w, s, p, a, k, clone }: HeavyCtx): void {
    const ts = w.slice<TouhouState>('touhou'); if (!clone && ts.mLz[p]! > s.gf) return;
    const h = heatMul(ts, p); if (!clone) ts.mLz[p] = s.gf + LZ_TELE + 7 + LZ_GAP;
    fireRay(s, p, { T: LZ_TELE + 7, tele: LZ_TELE, flags: RAYF.warn, w: 4 * h, len: 800, dmg: 5 * h * k, ev: 99, kb: 8, stun: 22, a, c: 0xfff6a0 });
  },
  B({ w, s, p, a, k, m, src }: HeavyCtx): void {
    const h = heatMul(w.slice<TouhouState>('touhou'), p);
    for (let i = 0; i < 7; i++) {
      heavyBullet(s, p, src, m, a + (i - 3) * 0.22, k, { spd: 5.5, r: Math.round(9 * Math.min(1.6, h)), k: 0.28 * h, col: STAR[i % 3] });
      const b = s.nb - 1; if (b >= 0 && s.bowner[b] === p) s.bmst[b] = s.gf;
    }
  },
} as const;
