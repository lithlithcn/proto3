import { atan2, cos, sin } from '@kernel';
import { type ShotCtx, entsOf, lightBullet, nearFoe } from '@pack/combat/api';
import type { TouhouState } from '../../state';
import { EK_ODR, SEA, SEAC } from './kinds';

/** Okina's light shot: the shot of the current season, fired from her and from every door (doors aim at the nearest foe; with Focus only the doors shoot). Total power is shared out between sources. */
export function okinaShot(c: ShotCtx): void {
  const { s, p, a } = c, sn = c.w.slice<TouhouState>('touhou').oS[p]!, D: number[] = []; entsOf(s, EK_ODR, p, D);
  const src: [number, number, number][] = c.focus && D.length ? [] : [[s.x[p]!, s.y[p]!, 1]];
  for (const d of D) src.push([s.ex[d]!, s.ey[d]!, 0]);
  const k = c.pm * (src.length > 1 ? 1.3 / src.length : 1);
  for (const [x, y, me] of src) {
    const q = me ? -1 : nearFoe(s, p, x, y, 1500), aa = q >= 0 ? atan2(s.y[q]! - y, s.x[q]! - x) : a;
    const mk = (o: number, sp: number, dm: number, r: number): void => {
      const i = lightBullet(s, p, aa + o, sp, dm, r, 120, SEAC[sn]); if (i < 0) return;
      s.bx[i] = x + cos(aa + o) * 10; s.by[i] = y + sin(aa + o) * 10; s.bsea[i] = SEA[sn]!;
      if (sn === 2) { s.bwav[i] = 0.1; s.bph[i] = o * 9; }
    };
    if (sn === 0) for (const o of [-0.1, 0.1]) mk(o, 6, k * 0.55, 5);
    else if (sn === 1) for (const o of [-0.08, 0, 0.08]) mk(o, 11, k * 0.4, 4);
    else if (sn === 2) for (const o of [-0.15, 0, 0.15]) mk(o, 5, k * 0.5, 5);
    else for (const o of [-0.08, 0.08]) mk(o, 7, k * 0.55, 5);
  }
}
