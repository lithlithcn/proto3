import { cos, sin } from '@kernel';
import { BF, type HeavyCtx, addEnt, entsOf, heavyBullet, sfx } from '@pack/combat/api';
import { EK_NST, EK_NUFO } from './kinds';

const cap = (s: Parameters<typeof entsOf>[0], k: number, p: number, n: number): void => { const L: number[] = []; entsOf(s, k, p, L); for (let i = 0; i < L.length - n; i++) s.et[L[i]!] = 0; };

/** Nue's heavies: N = a UFO turret (max 3) that eats light bullets and fires triple shots, F = a piercing trident bolt, B = a storm trap behind her that strikes the first foe that nears it. */
export const nueHeavy = {
  N({ w, s, p, a }: HeavyCtx): void {
    const e = addEnt(s, EK_NUFO, p, 480, s.x[p]! + cos(a) * 30, s.y[p]! + sin(a) * 30);
    if (e >= 0) { s.eh[e] = 4; s.er[e] = 30; }
    cap(s, EK_NUFO, p, 3); sfx(w, 'se_enep00', 0.5);
  },
  F({ w, s, p, a, k, m, src }: HeavyCtx): void {
    heavyBullet(w, s, p, src, m, a, k, { spd: 13, r: 7, k: 1 });
    const b = s.nb - 1; if (b >= 0 && s.bowner[b] === p) { s.bflags[b] = s.bflags[b]! | BF.pierce; s.bcol[b] = 0xc03aff; } // legacy: the LAST bullet of the call (an extra of a charged shot if any)
  },
  B({ s, p, a, k }: HeavyCtx): void {
    const e = addEnt(s, EK_NST, p, 360, s.x[p]! - cos(a) * 60, s.y[p]! - sin(a) * 60);
    if (e >= 0) s.ed[e] = 10 * k;
    cap(s, EK_NST, p, 2);
  },
} as const;
