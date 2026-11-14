import type { World } from '@kernel';
import type { CombatState } from '@pack/combat/api';
import type { TouhouState } from '../../state';
import { season } from './kinds';

/** Season of the moment (spring, summer, autumn, winter every 5 s). */
export function okinaTick(w: World, s: CombatState, p: number): void { w.slice<TouhouState>('touhou').oS[p] = season(s.gf); }
