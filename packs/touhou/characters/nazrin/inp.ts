import type { World } from '@kernel';
import type { CombatState, VIn } from '@pack/combat/api';
import type { TouhouState } from '../../state';

/** While digging (1 s) she cannot move or press anything. */
export function nazrinInp(w: World, s: CombatState, p: number, v: VIn): void {
  if (w.slice<TouhouState>('touhou').nDig[p]! > s.gf) { v.ix = 0; v.iy = 0; v.b = 0; }
}
