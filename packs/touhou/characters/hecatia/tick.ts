import type { World } from '@kernel';
import { PS, ko, type CombatState } from '@pack/combat/api';
import type { TouhouState } from '../../state';

/** Otherworld burn: planets set foes ablaze for 2 s; every 10th frame it costs 0.8 hp and credits Hecatia. */
export function hecatiaTick(w: World, s: CombatState, p: number): void {
  const t = w.slice<TouhouState>('touhou');
  for (let q = 0; q < s.n; q++) {
    if (t.hBurnBy[q] !== p + 1 || t.hBurn[q]! <= s.gf || s.state[q] === PS.dead || s.gf % 10) continue;
    s.hp[q] = s.hp[q]! - 0.8; s.flash[q] = 2; s.lastBy[q] = p; s.lastByF[q] = s.gf;
    if (s.hp[q]! <= 0) ko(w, s, q);
  }
}
