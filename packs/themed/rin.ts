import { type World, atan2, clamp, cos, sin } from '@kernel';
import type { CombatState } from '@pack/combat/api';

/** Rin Satsuki, Anonymous Fairy (legacy GIVE.rin / CX.anon / updEnt 'decoy'): 5 decoys mirror the owner's movement (`ew`/`eh` = legacy sx/sy, bouncing off a 30 px margin). */
export const EK_DECOY = 301;
export function decoy(w: World, s: CombatState, i: number): void {
  const p = s.eo[i]!; let x = s.ex[i]! + s.vx[p]! * s.ew[i]!, y = s.ey[i]! + s.vy[p]! * s.eh[i]!;
  if (x < 30 || x > s.mapW - 30) s.ew[i] = -s.ew[i]!; if (y < 30 || y > s.mapH - 30) s.eh[i] = -s.eh[i]!;
  x = clamp(x, 30, s.mapW - 30); y = clamp(y, 30, s.mapH - 30); s.ex[i] = x; s.ey[i] = y;
  s.ea[i] = atan2(sin(s.aim[p]!) * s.eh[i]!, cos(s.aim[p]!) * s.ew[i]!);
  void w;
}
