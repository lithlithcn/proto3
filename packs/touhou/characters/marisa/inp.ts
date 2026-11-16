import { BTN, hypot, atan2, type World } from '@kernel';
import { PS, RAYF, fireRay, relStick, type CombatState, type VIn } from '@pack/combat/api';
import type { TouhouState } from '../../state';

/**
 * Marisa's input hook (legacy `inp`): Heavy during a dash = rear laser boost (13 px wide, kicks her forward, extends the dash);
 * Heavy while the lasers recharge is swallowed (unless pushing away, which is the Stardust heavy).
 */
export function marisaInp(w: World, s: CombatState, p: number, v: VIn): void {
  const t = w.slice<TouhouState>('touhou'), h = (v.b & BTN.heavy) !== 0, e = h && !t.mHp[p];
  t.mHp[p] = h ? 1 : 0;
  if (e && s.state[p] === PS.dash && !(t.mLz[p]! > s.gf)) {
    const sp = hypot(s.vx[p]!, s.vy[p]!) || 1, ux = s.vx[p]! / sp, uy = s.vy[p]! / sp;
    fireRay(s, p, { T: 28, tele: 0, flags: RAYF.follow | RAYF.clear, w: 13, len: 360, dmg: 2, ev: 7, kb: 5, stun: 16, a: atan2(-uy, -ux), c: 0xffe060 });
    s.vx[p] = s.vx[p]! + ux * 7; s.vy[p] = s.vy[p]! + uy * 7; s.t[p] = s.t[p]! + 10; t.mBS[p] = s.gf + s.t[p]!; t.mLz[p] = s.gf + 90; w.emit('touhou:marisa-star', { p });
    v.b &= ~BTN.heavy; return;
  }
  if (h && t.mLz[p]! > s.gf && s.state[p] === PS.idle && relStick(s, p, v.ix, v.iy) !== 'B') { if (e) w.emit('combat:skill-cooldown', { p, left: t.mLz[p]! - s.gf, n: 'LASER' }); v.b &= ~BTN.heavy; }
}
