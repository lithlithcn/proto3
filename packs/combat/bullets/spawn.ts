import { BTN, cos, sin, type World } from '@kernel';
import { BF, MAX_B, PS, type CombatState } from '../state';
import { TAU } from '../tuning';
import type { MoveDef } from '../moves';
import { bulletArrays, clearBullet, stamp, copyBullet } from './arrays';

/** Single spawn path for light bullets; enforces MAX_B (legacy `lb`). Returns the index or -1. Colour is 0xRRGGBB, 0 = owner colour. */
export function lightBullet(s: CombatState, owner: number, a: number, speed: number, dmg: number, r: number, life: number, col = 0): number {
  const i = s.nb;
  if (i >= MAX_B) return -1;
  clearBullet(bulletArrays(s), i); stamp(s, i);
  const c = cos(a), sn = sin(a);
  s.bx[i] = s.x[owner]! + c * 18; s.by[i] = s.y[owner]! + sn * 18;
  s.bvx[i] = c * speed; s.bvy[i] = sn * speed;
  s.br[i] = r; s.bdmg[i] = dmg; s.blife[i] = life; s.bhome[i] = 0; s.bdist[i] = 0; s.bmult[i] = 1;
  s.bowner[i] = owner; s.bflags[i] = 0; s.bcol[i] = col; s.brefl[i] = 0; s.bmv[i] = 0; s.bkb[i] = 0; s.bstun[i] = 0; s.barm[i] = 0; s.bspl[i] = 0;
  s.nb = i + 1;
  return i;
}

/** Removes bullet `k`, keeping order (used when a heavy shot needs room). */
function removeBullet(s: CombatState, k: number): void {
  const A = bulletArrays(s);
  for (let i = k; i < s.nb - 1; i++) copyBullet(A, i + 1, i);
  clearBullet(A, s.nb - 1); s.nb--;
}

export interface HeavyOpts { spd?: number; r?: number; k?: number; off?: number; life?: number; home?: number; col?: number }
/**
 * Heavy shot bullet (legacy spawnH). `m` is the heavy move (hit data lives there, per bullet id `mv`), `pm` the power multiplier.
 * When MAX_B is reached the oldest light bullet is replaced; with none left the shot is dropped.
 */
export function heavyBullet(s: CombatState, p: number, src: number, m: MoveDef, a: number, pm: number, o: HeavyOpts = {}): void {
  const i = spawnHeavy(s, p, src, m, a, pm, o), lv = s.hLv[p]! || 1;
  if (i < 0 || lv < 2 || s.state[p] !== PS.atk) return;
  // charged heavy (hold the button): LV2 = two extra side shots + bigger core, LV3 = bigger, stronger core + an 8-way ring (R68)
  if (lv === 2) { for (const d of [-0.22, 0.22]) spawnHeavy(s, p, src, m, a + d, pm * 0.8, o); s.br[i] = s.br[i]! * 1.2; }
  else { s.br[i] = s.br[i]! * 1.5; s.bmult[i] = s.bmult[i]! * 1.4; s.bcol[i] = 0xff7ce0; for (let k = 1; k < 8; k++) spawnHeavy(s, p, src, m, a + k * TAU / 8, pm * 0.7, o); }
}
function spawnHeavy(s: CombatState, p: number, src: number, m: MoveDef, a: number, pm: number, o: HeavyOpts): number {
  const sp = o.spd || m.spd!, c = cos(a), n = sin(a), off = o.off || 0;
  if (s.nb >= MAX_B) {
    let k = -1;
    for (let i = 0; i < s.nb; i++) if (!(s.bflags[i]! & BF.heavy)) { k = i; break; }
    if (k < 0) return -1;
    removeBullet(s, k);
  }
  const i = s.nb++;
  clearBullet(bulletArrays(s), i); stamp(s, i);
  s.bx[i] = s.x[p]! + c * 20 - n * off; s.by[i] = s.y[p]! + n * 20 + c * off; s.bvx[i] = c * sp; s.bvy[i] = n * sp;
  s.br[i] = o.r || m.r!; s.bdmg[i] = 0; s.blife[i] = o.life || m.life || 200; s.bhome[i] = o.home || 0; s.bdist[i] = 0; s.bmult[i] = pm * (o.k || 1);
  s.bowner[i] = p; s.bflags[i] = BF.heavy; s.bcol[i] = o.col ?? 0; s.brefl[i] = 0; s.bmv[i] = src;
  s.bdmg[i] = m.dmg; s.bkb[i] = m.kb; s.bstun[i] = m.stun; s.barm[i] = m.arm!; s.bspl[i] = 0;
  return i;
}
/** Heavy bullet emitted by a spell pattern (legacy addB heavy): spawns on the caster, normal arming distance, hit data from move `m`.
 *  Becomes a breaker when the caster holds Parry during the spell (legacy `breaker:p.state==='spell'&&p.in.b.parry`). */
export function patternHeavy(w: World, s: CombatState, p: number, a: number, spd: number, m: MoveDef, src: number, life: number, col: number, home: number): number {
  if (s.nb >= MAX_B) return -1;
  const i = s.nb++;
  clearBullet(bulletArrays(s), i); stamp(s, i);
  s.bx[i] = s.x[p]!; s.by[i] = s.y[p]!; s.bvx[i] = cos(a) * spd; s.bvy[i] = sin(a) * spd; s.br[i] = m.r!; s.bdmg[i] = m.dmg; s.blife[i] = life; s.bhome[i] = home; s.bdist[i] = 0; s.bmult[i] = 1;
  s.bowner[i] = p; s.bflags[i] = BF.heavy | (s.state[p] === PS.spell && (w.buttons(p) & BTN.parry) ? BF.breaker : 0); s.bcol[i] = col; s.brefl[i] = 0; s.bmv[i] = src; s.bkb[i] = m.kb; s.bstun[i] = m.stun; s.barm[i] = m.arm!; s.bspl[i] = 0;
  return i;
}
/** Breaker ball (parry + heavy): armed at once, slow, only affects a parrying foe. */
export function breakerBullet(s: CombatState, p: number): void {
  const i = customHeavy(s, p, s.x[p]!, s.y[p]!, s.aim[p]!, 6.5, 17, { dmg: 0, kb: 0, stun: 0, arm: 0 }, 200, 0xffffff);
  if (i >= 0) s.bflags[i] = BF.heavy | BF.breaker;
}
/** Free-form heavy bullet with its own hit data (legacy xBall): armed at once, no stun-repeat tracking. Returns the index or -1. */
export function customHeavy(s: CombatState, owner: number, x: number, y: number, a: number, v: number, r: number, h: { dmg: number; kb: number; stun: number; arm: number }, life: number, col = 0): number {
  if (s.nb >= MAX_B) return -1;
  const i = s.nb++;
  clearBullet(bulletArrays(s), i); stamp(s, i);
  s.bx[i] = x; s.by[i] = y; s.bvx[i] = cos(a) * v; s.bvy[i] = sin(a) * v; s.br[i] = r; s.bdmg[i] = h.dmg; s.blife[i] = life; s.bhome[i] = 0; s.bdist[i] = 999; s.bmult[i] = 1;
  s.bowner[i] = owner; s.bflags[i] = BF.heavy; s.bcol[i] = col; s.brefl[i] = 0; s.bmv[i] = -1; s.bkb[i] = h.kb; s.bstun[i] = h.stun; s.barm[i] = h.arm; s.bspl[i] = 0;
  return i;
}
