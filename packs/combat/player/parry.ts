import { big, txt } from '../jfx';
import type { World } from '@kernel';
import type { PCtx } from '../input';
import { T } from '../tuning';
import { PS, NBTN, type CombatState } from '../state';
import { BTN } from '@kernel';

const bufParry = 31 - Math.clz32(BTN.parry);

/** Successful parry feedback + bonuses (legacy parryFx): chain count, dash charge, damage streak, hit-stop and slow-motion growing with the chain. */
export function parryFx(w: World, s: CombatState, p: number, rk = 0): void {
  s.bufF[p * NBTN + bufParry] = 0; // no phantom re-parry from the buffer
  s.parN[p] = s.parN[p]! + 1; s.pChain[p] = s.gf - s.pLast[p]! < 150 ? s.pChain[p]! + 1 : 1; s.pLast[p] = s.gf; s.pOK[p] = s.gf;
  s.boost[p] = Math.min(T.DASH_CHARGES, s.boost[p]! + T.DASH_PARRY); s.pStk[p] = Math.min(7, s.pStk[p]! + 1);
  const K = Math.min(7, rk || s.pChain[p]!);
  s.hitstop = Math.max(s.hitstop, 6 + K * 2);
  if (K === 7) s.slow = Math.max(s.slow, 36); else if (K >= 4) s.slow = Math.max(s.slow, K * 4);
  w.emit('combat:parry', { p, k: K, x: s.x[p]!, y: s.y[p]! });
}

/** Shield break / guard crush (legacy xShieldBreak): long stun, no velocity. */
export function shieldBreak(w: World, s: CombatState, o: number): void {
  if (s.state[o] === PS.dead) return;
  s.state[o] = PS.parrystun; s.t[o] = T.SHIELD_BREAK_STUN; s.vx[o] = 0; s.vy[o] = 0; s.charging[o] = 0; s.inv[o] = 0; s.sbT[o] = s.gf + T.SHIELD_BREAK_STUN;
  w.emit('combat:shield-break', { p: o, x: s.x[o]!, y: s.y[o]! });
}

/** Start of a parry from idle. */
export function startParry(s: CombatState, p: number): void {
  s.state[p] = PS.parry; s.t[p] = 0; s.pStart[p] = s.gf; s.run[p] = 0; s.pCnt[p] = s.pCnt[p]! * 0.9 + 1;
}
export function updParry(c: PCtx): void { // active window, then whiff lag
  const { s, p } = c;
  s.vx[p] = s.vx[p]! * 0.7; s.vy[p] = s.vy[p]! * 0.7; s.t[p] = s.t[p]! + 1;
  if (s.t[p]! >= T.PARRY_ACT) { s.state[p] = PS.parrylag; s.t[p] = T.PARRY_WHIFF; }
}
export function updParrylag(c: PCtx): void {
  const { s, p } = c;
  s.vx[p] = s.vx[p]! * 0.7; s.vy[p] = s.vy[p]! * 0.7; s.t[p] = s.t[p]! - 1;
  if (s.t[p]! <= 0) s.state[p] = PS.idle;
}
export function updParrystun(c: PCtx): void {
  const { s, p } = c;
  s.vx[p] = s.vx[p]! * 0.8; s.vy[p] = s.vy[p]! * 0.8; s.t[p] = s.t[p]! - 1;
  if (s.t[p]! <= 0) s.state[p] = PS.idle;
}

/** End-of-step guard gauge (legacy wrapper): a parry that ended without a success drains the gauge; empty = guard crush. Regens outside parry. */
export function guardGauge(w: World, s: CombatState, p: number): void {
  if (s.lstS[p] === PS.parry && s.state[p] !== PS.parry && !(Math.max(-1, s.pOK[p]!) >= s.pStart[p]!) && s.state[p] !== PS.dead) {
    s.pg[p] = s.pg[p]! - T.GUARD_WHIFF;
    if (s.pg[p]! <= 0) { s.pg[p] = T.GUARD_RESET; shieldBreak(w, s, p); big(w, 'GUARD CRUSH!', '#6ff', 40); } else if (s.pg[p]! < 35) txt(w, s.x[p]!, s.y[p]! - 40, 'GUARD LOW', '#6ff', 12);
  }
  if (s.state[p] !== PS.parry) s.pg[p] = Math.min(100, s.pg[p]! + T.GUARD_REGEN);
  s.lstS[p] = s.state[p]!;
}
