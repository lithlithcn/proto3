import { atan2, cos, sin } from '@kernel';
import { type HeavyCtx, RAYF, TAU, addEnt, entsOf, fireRay, heavyBullet, nearFoe } from '@pack/combat/api';
import type { TouhouState } from '../../state';
import { LZ_GAP, LZ_TELE } from '../marisa/kinds';
import { EK_OBD, EK_ODR } from './kinds';

/** Okina's heavies: N = a big door that swallows bullets for 70 frames then spits them back at the nearest foe, F = a straight ray from her and from every door (1 s warning, 1 s recharge), B = a wavy ring of 12 slow orbs. */
export const okinaHeavy = {
  N({ s, p, a }: HeavyCtx): void { const e = addEnt(s, EK_OBD, p, 90, s.x[p]! + cos(a) * 60, s.y[p]! + sin(a) * 60); if (e >= 0) { s.ebc[e] = 90; s.ea[e] = a; } },
  F({ w, s, p, a, k, clone }: HeavyCtx): void {
    const t = w.slice<TouhouState>('touhou'); if (!clone) { if (t.oLz[p]! > s.gf) return; t.oLz[p] = s.gf + LZ_TELE + 8 + LZ_GAP; } // legacy: the clone's stand-in has its own (always empty) cooldown
    fireRay(s, p, { T: LZ_TELE + 8, tele: LZ_TELE, flags: RAYF.warn, w: 8, len: 900, dmg: 8 * k, ev: 99, kb: 8, stun: 24, a, c: 0xffd23a });
    const D: number[] = []; entsOf(s, EK_ODR, p, D);
    for (const d of D) { const q = nearFoe(s, p, s.ex[d]!, s.ey[d]!, 1500); if (q >= 0) fireRay(s, p, { T: LZ_TELE + 8, tele: LZ_TELE, flags: RAYF.warn, w: 7, len: 900, dmg: 6 * k, ev: 99, kb: 8, stun: 24, c: 0xffd23a, a: atan2(s.y[q]! - s.ey[d]!, s.x[q]! - s.ex[d]!), x: s.ex[d]!, y: s.ey[d]! }); }
  },
  B({ s, p, a, k, m, src }: HeavyCtx): void {
    for (let i = 0; i < 12; i++) {
      heavyBullet(s, p, src, m, a + i * TAU / 12, k, { spd: 3, r: 7, k: 0.15, life: 200, col: 0xffb04a });
      const b = s.nb - 1; if (b >= 0 && s.bowner[b] === p) { s.bwav[b] = 0.08; s.bph[b] = i; }
    }
  },
} as const;
