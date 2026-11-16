import { BTN, type World } from '@kernel';
import { PS, addEnt, entsOf, type CombatState, type VIn, pushJ, sfx } from '@pack/combat/api';
import type { TouhouState } from '../../state';
import { EK_HST } from './kinds';

/** Hecatia's input hook: tapping Focus switches body Earth > Moon > Otherworld and leaves the old body behind as a statue (3 s) that keeps shooting. */
export function hecatiaInp(w: World, s: CombatState, p: number, v: VIn): void {
  const t = w.slice<TouhouState>('touhou'), f = (v.b & BTN.focus) !== 0, e = f && !t.hFp[p];
  t.hFp[p] = f ? 1 : 0;
  if (!e || s.state[p] === PS.spell || s.state[p] === PS.dead) return;
  const L: number[] = []; entsOf(s, EK_HST, p, L); for (const i of L) s.et[i] = 0;
  const i = addEnt(s, EK_HST, p, 180, s.x[p]!, s.y[p]!);
  if (i >= 0) { s.ebc[i] = t.hM[p]!; s.er[i] = 10; }
  t.hM[p] = (t.hM[p]! + 1) % 3; pushJ(w, 'RINGS', 'x', s.x[p]!, 'y', s.y[p]!, 'r', 0, 'm', 50, 't', 12, 'c', ['#4ab3ff', '#ffe88a', '#ff4a6a'][t.hM[p]!]!); sfx(w, 'select00', 0.6);
}
