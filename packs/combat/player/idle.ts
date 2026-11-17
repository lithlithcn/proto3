import { BTN, hypot } from '@kernel';
import { charOf } from '../api';
import { type PCtx, held, pr } from '../input';
import { powerMul, speedMul } from '../stats';
import { T } from '../tuning';
import { MV } from '../moves';
import { doDash, glide } from './dash';
import { rel, startAtk } from './atkstart';
import { startParry } from './parry';
import { snap, startRifle } from '../items/rifle';
import { SPARK } from '../items/spark';
import { CLONE, cloneAim, clonePos } from '../items/clone';
import { meleeRule } from '../rules';

/** Idle locomotion + actions (legacy updP after the state switch). */
export function updIdle(c: PCtx): void {
  const { w, s, p } = c, il = hypot(c.ix, c.iy), focus = held(c, BTN.focus);
  if (s.run[p] && (il < 0.3 || focus || !held(c, BTN.dash))) s.run[p] = 0;
  let sp = focus ? T.FOCUS_SPEED : s.run[p] ? T.RUN_SPEED : T.SPEED;
  if (held(c, BTN.shot)) sp *= 0.8;
  if (s.spk[p]! > 0 && s.spk[p]! < SPARK.fire) sp *= 0.4;
  if (s.giant[p]! > 0) sp *= 0.9;
  sp *= speedMul(w, s, p);
  if (s.slide[p]! > 0) { // glide: momentum kept, still steerable
    s.slide[p] = s.slide[p]! - 1;
    s.vx[p] = s.vx[p]! * 0.955 + c.ix * sp * 0.1; s.vy[p] = s.vy[p]! * 0.955 + c.iy * sp * 0.1;
  } else {
    const spd = hypot(s.vx[p]!, s.vy[p]!);
    if (!focus && il > 0.3 && spd > 3 && (s.vx[p]! * c.ix + s.vy[p]! * c.iy) / (spd * il) < -0.6) { s.vx[p] = c.ix / il * spd * 0.9; s.vy[p] = c.iy / il * spd * 0.9; c.w.emit('combat:pivot', { p }); } // instant pivot
    const ac = focus ? 0.5 : s.run[p] ? 0.14 : 0.24;
    s.vx[p] = s.vx[p]! + (c.ix * sp - s.vx[p]!) * ac; s.vy[p] = s.vy[p]! + (c.iy * sp - s.vy[p]!) * ac;
  }
  if (pr(c, BTN.focus) && hypot(s.vx[p]!, s.vy[p]!) > T.BRAKE_MIN) { s.vx[p] = s.vx[p]! * 0.15; s.vy[p] = s.vy[p]! * 0.15; s.slide[p] = 0; s.run[p] = 0; } // sharp brake
  if (s.shotCd[p]! > 0) s.shotCd[p] = s.shotCd[p]! - 1;
  
  if (pr(c, BTN.parry)) { startParry(s, p); return; }
  if (pr(c, BTN.dash) && s.boost[p]! >= T.DASH_COST) {
    if (focus) { s.boost[p] = s.boost[p]! - T.DASH_COST; s.dashCd[p] = T.DASH_REGEN_DELAY; glide(c); }
    else doDash(c);
    return;
  }
  if (pr(c, BTN.melee)) { if (meleeRule(w, s, p)) return; startAtk(s, p, focus ? MV.strong : rel(c) === 'F' ? MV.lunge : MV.jab); return; }
  if (pr(c, BTN.heavy)) {
    if (s.rifle[p]! > 0) { startRifle(c.w, s, p); return; }
    if (s.cam[p]! > 0) { snap(c.w, s, p); return; }
    const r = rel(c); startAtk(s, p, r === 'F' ? MV.heavyF : r === 'B' ? MV.heavyB : MV.heavyN); return;
  }
  if (held(c, BTN.shot) && s.shotCd[p]! <= 0 && !(s.spk[p]! > 0 && s.spk[p]! < SPARK.fire)) fireLight(c, focus);
}

/** Light shot (legacy fireLight): cooldown then the character's pattern at the current power level. */
function fireLight(c: PCtx, focus: boolean): void {
  const { w, s, p } = c, ch = charOf(w, s, p);
  s.shotCd[p] = Math.round(ch.cd * (focus ? 0.75 : 1));
  ch.shot({ w, s, p, a: s.aim[p]!, focus, pm: powerMul(s, p, 0), lv: s.power[p]! | 0 });
  if (s.clone[p]! > 0) { // the Doppelganger fires the same pattern from its own spot (legacy cloneOf): the shooter is moved there for the call
    const [x, y] = clonePos(s, p), ox = s.x[p]!, oy = s.y[p]!, oa = s.aim[p]!, a = cloneAim(s, p);
    s.x[p] = x; s.y[p] = y; s.aim[p] = a;
    ch.shot({ w, s, p, a, focus, pm: powerMul(s, p, 0) * CLONE.shotMul, lv: s.power[p]! | 0, clone: true });
    s.x[p] = ox; s.y[p] = oy; s.aim[p] = oa;
  }
}
