import { cos, sin } from '@kernel';
import { type HeavyCtx, TAU, addEnt, customHeavy, entsOf, nearFoe, sfx } from '@pack/combat/api';
import { EK_FLV, EK_FSB } from './kinds';

/** Flandre's heavies: N = Starbow Break (7 delayed bursts around the foe), F = Laevatein (boomerang that flies out then returns), B = Cranberry Trap (12 orbs that converge on her cast spot). */
export const flandreHeavy = {
  N({ s, p, a, k }: HeavyCtx): void {
    const q = nearFoe(s, p, s.x[p]!, s.y[p]!), cx = q >= 0 ? s.x[q]! : s.x[p]! + cos(a) * 250, cy = q >= 0 ? s.y[q]! : s.y[p]! + sin(a) * 250;
    for (let i = 0; i < 7; i++) {
      const r = i ? 55 + i * 6 : 0, t = 22 + i * 5, e = addEnt(s, EK_FSB, p, t, cx + cos(i * 2.4) * r, cy + sin(i * 2.4) * r);
      if (e >= 0) { s.ebc[e] = t; s.ed[e] = 6 * k; s.ea[e] = i; } // ea = colour index (presentation)
    }
  },
  F({ w, s, p, a, k }: HeavyCtx): void {
    const old: number[] = []; entsOf(s, EK_FLV, p, old); for (const i of old) s.et[i] = 0;
    const e = addEnt(s, EK_FLV, p, 90, s.x[p]!, s.y[p]!);
    if (e >= 0) { s.ebc[e] = 90; s.evx[e] = cos(a) * 11; s.evy[e] = sin(a) * 11; s.ed[e] = 5 * k; }
    sfx(w, 'fire', 0.7);
  },
  B({ w, s, p, k }: HeavyCtx): void {
    for (let i = 0; i < 12; i++) {
      const b = i * TAU / 12, j = customHeavy(s, p, s.x[p]! + cos(b) * 170, s.y[p]! + sin(b) * 170, 0, 0, 7, { dmg: 5 * k, kb: 5, stun: 18, arm: 0 }, 130, 0xff2a5a);
      if (j >= 0) { s.bct[j] = s.gf + 30; s.btx[j] = s.x[p]!; s.bty[j] = s.y[p]!; }
    }
    sfx(w, 'tan01', 0.6);
  },
} as const;
