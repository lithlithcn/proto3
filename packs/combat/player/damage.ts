import type { World } from '@kernel';
import { damageMul } from '../stats';
import { T } from '../tuning';
import { PS, type CombatState } from '../state';
import { ko } from './ko';

/** Final damage of a hit + the legacy chDmg bookkeeping (stats, parry-streak reset, last-hit attribution). Does not touch hp. */
export function dealDamage(w: World, s: CombatState, victim: number, attacker: number, raw: number, heavy: boolean): number {
  const d = raw * damageMul(w, s, victim, attacker, heavy);
  if (attacker !== victim) {
    s.pStk[victim] = 0; s.dmgDealt[attacker] = s.dmgDealt[attacker]! + d; s.dmgTaken[victim] = s.dmgTaken[victim]! + d;
    if (d > s.bigHit[attacker]!) s.bigHit[attacker] = d;
    s.lastHit[victim] = attacker; s.lastHitF[victim] = s.gf;
  }
  return d;
}

/** Light bullet hit (legacy updBullets damage branch). */
export function lightHit(w: World, s: CombatState, victim: number, attacker: number, rawDmg: number): void {
  const d = dealDamage(w, s, victim, attacker, rawDmg, false);
  s.hp[victim] = s.hp[victim]! - d;
  s.flash[victim] = 3; if (s.state[attacker] === PS.spell) s.spellHit[victim] = 1;
  s.spirit[attacker] = Math.min(T.SPIRIT_MAX, s.spirit[attacker]! + T.SHOT_GAIN);
  s.burst[victim] = Math.min(T.BURST_MAX, s.burst[victim]! + rawDmg * T.BURST_HURT);
  w.emit('combat:hit-light', { victim, attacker, dmg: d });
  if (s.hp[victim]! <= 0) ko(w, s, victim);
}
