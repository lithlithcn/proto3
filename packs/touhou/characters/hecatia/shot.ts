import { cos, sin } from '@kernel';
import { type CombatState, BF, type ShotCtx, lightBullet } from '@pack/combat/api';
import type { TouhouState } from '../../state';
import { HEC } from './kinds';

/** One volley of body `bd` from (x, y): Earth = 2 gravity orbs (shove foes away), Moon = 3 fast-growing needles, Otherworld = 2 wavy shots (legacy hShot). */
export function bodyShot(s: CombatState, p: number, a: number, pm: number, bd: number, x: number, y: number): void {
  const mk = (da: number, sp: number, dmg: number, r: number, life: number): number => {
    const i = lightBullet(s, p, a + da, sp, dmg, r, life, HEC[bd]);
    if (i >= 0) { s.bx[i] = x + cos(a + da) * 10; s.by[i] = y + sin(a + da) * 10; }
    return i;
  };
  if (bd === 0) for (const o of [-0.12, 0.12]) { const i = mk(o, 4.5, pm * 0.8, 8, 150); if (i >= 0) s.bflags[i] = s.bflags[i]! | BF.hgr; }
  else if (bd === 1) for (let k = 0; k < 3; k++) { const i = mk((k - 1) * 0.06, 4, pm * 0.45, 3, 110); if (i >= 0) { s.bacc[i] = 14; } }
  else for (let k = 0; k < 2; k++) { const i = mk((k - 0.5) * 0.2, 6.5, pm * 0.7, 6, 120); if (i >= 0) { s.bwav[i] = 0.1; s.bph[i] = k * 3; } }
}

/** Hecatia's light shot; during Trinity all three bodies fire at 60 % power each. */
export function hecatiaShot(c: ShotCtx): void {
  const { s, p, a, pm } = c, ts = c.w.slice<TouhouState>('touhou');
  if (ts.hTr[p]! > s.gf) for (let b = 0; b < 3; b++) bodyShot(s, p, a, pm * 0.6, b, s.x[p]!, s.y[p]!);
  else bodyShot(s, p, a, pm, ts.hM[p]!, s.x[p]!, s.y[p]!);
}
