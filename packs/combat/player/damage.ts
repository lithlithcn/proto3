import type { World } from '@kernel';
import { damageMul } from '../stats';
import { T } from '../tuning';
import type { CombatState } from '../state';
import { ko } from './ko';

/** Light bullet hit (legacy updBullets damage branch + chDmg bookkeeping). */
export function lightHit(w: World, s: CombatState, victim: number, attacker: number, rawDmg: number): void {
  const d = rawDmg * damageMul(w, s, victim, attacker);
  s.hp[victim] = s.hp[victim]! - d;
  if (attacker !== victim) {
    s.pStk[victim] = 0; s.dmgDealt[attacker] = s.dmgDealt[attacker]! + d; s.dmgTaken[victim] = s.dmgTaken[victim]! + d;
    if (d > s.bigHit[attacker]!) s.bigHit[attacker] = d;
    s.lastHit[victim] = attacker; s.lastHitF[victim] = s.gf;
  }
  s.flash[victim] = 3;
  s.spirit[attacker] = Math.min(T.SPIRIT_MAX, s.spirit[attacker]! + T.SHOT_GAIN);
  s.burst[victim] = Math.min(T.BURST_MAX, s.burst[victim]! + rawDmg * T.BURST_HURT);
  w.emit('combat:hit-light', { victim, attacker, dmg: d });
  if (s.hp[victim]! <= 0) ko(w, s, victim);
}
