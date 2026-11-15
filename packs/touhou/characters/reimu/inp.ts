import { BTN, hypot, atan2, type World } from '@kernel';
import { PS, pushJ, relStick, type CombatState, type VIn } from '@pack/combat/api';
import type { TouhouState } from '../../state';
import { throwOrbs } from './orbs';

/**
 * Reimu's input hook (legacy `inp`): a Heavy press from idle with a neutral-ish stick starts a charge instead of a heavy shot — hold to throw
 * 1 / 2 / 4 orbs on release (25 / 55 frames), moving at 55 % speed and without shooting meanwhile.
 */
export function reimuInp(w: World, s: CombatState, p: number, v: VIn): void {
  const t = w.slice<TouhouState>('touhou'), h = (v.b & BTN.heavy) !== 0, e = h && !t.rHp[p];
  t.rHp[p] = h ? 1 : 0;
  if (t.rG[p] && hypot(v.ix, v.iy) > 0.3) t.rA[p] = atan2(v.iy, v.ix);
  if (t.rC[p]! > 0) {
    if (s.state[p] !== PS.idle) { t.rC[p] = 0; return; }
    if (h) { t.rC[p] = t.rC[p]! + 1; v.ix *= 0.55; v.iy *= 0.55; v.b &= ~(BTN.heavy | BTN.shot); w.emit('touhou:reimu-charge', { p, c: t.rC[p]! }); if (t.rC[p] === 25 || t.rC[p] === 55) pushJ(w, 'RINGS', 'x', s.x[p]!, 'y', s.y[p]!, 'r', 0, 'm', t.rC[p]! > 50 ? 60 : 40, 't', 12, 'c', '#ff9aa8'); return; }
    throwOrbs(w, s, p, t.rC[p]! < 25 ? 1 : t.rC[p]! < 55 ? 2 : 4); t.rC[p] = 0; s.shotCd[p] = Math.max(s.shotCd[p]!, 14); v.b &= ~BTN.heavy; return;
  }
  if (e && s.state[p] === PS.idle && s.rifle[p]! <= 0 && s.cam[p]! <= 0 && relStick(s, p, v.ix, v.iy) === 'N') { t.rC[p] = 1; v.b &= ~BTN.heavy; }
}
