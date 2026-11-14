import type { World } from '@kernel';
import { T } from '../tuning';
import type { CombatState } from '../state';

/** A bullet grazed player `t` (legacy `graze`). k = 1 light, 2 heavy. Gains spirit, dash charge and power; announces via events. */
export function graze(w: World, s: CombatState, t: number, bx: number, by: number, k: number): void {
  s.graze[t]!++;
  s.spirit[t] = Math.min(T.SPIRIT_MAX, s.spirit[t]! + T.GRAZE_GAIN * k);
  s.boost[t] = Math.min(T.DASH_CHARGES, s.boost[t]! + T.DASH_GRAZE * k);
  s.gStreak[t] = s.gf - s.gLast[t]! < 30 ? s.gStreak[t]! + 1 : 1;
  s.gLast[t] = s.gf;
  const lv = s.power[t]! | 0;
  s.power[t] = Math.min(T.POWER_MAX, s.power[t]! + T.POWER_GRAZE * k);
  w.emit('combat:graze', { p: t, x: bx, y: by, k, streak: s.gStreak[t]! });
  if ((s.power[t]! | 0) > lv) w.emit('combat:power-up', { p: t, level: s.power[t]! | 0 });
}
