import { BTN, type World } from '@kernel';
import { PS, type CombatState, type VIn, relStick } from '@pack/combat/api';
import type { TouhouState } from '../../state';

/** Okina's input hook: a forward Heavy while the ray recharges is swallowed. */
export function okinaInp(w: World, s: CombatState, p: number, v: VIn): void {
  const t = w.slice<TouhouState>('touhou'), h = (v.b & BTN.heavy) !== 0;
  t.oHp[p] = h ? 1 : 0;
  if (h && t.oLz[p]! > s.gf && s.state[p] === PS.idle && relStick(s, p, v.ix, v.iy) === 'F') v.b &= ~BTN.heavy;
}
