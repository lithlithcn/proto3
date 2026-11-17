import { sfx, sfxDmg } from '../jfx';
import { pow, hypot, type World } from '@kernel';
import { T } from '../tuning';
import { inEdge, kS } from '../stats';
import { MAXP, PS, NSRC, type CombatState } from '../state';
import type { HitData } from '../moves';
import { dealDamage } from './damage';
import { endSpell } from './spell';
import { charOf } from '../api';
import { rulesOf } from '../rules';


/**
 * Heavy hit on a player (legacy `hit`): damage, spirit/burst gains, hit-stun with knockback decided now but applied after the
 * hit-stop (so the victim can DI), combo count, wall pips. `src` is the hit-source id (moves.ts `SRC`) for the stun-repeat reduction.
 * `dx,dy` points from attacker to victim (knockback direction). TODO(spells): spell-break / chip damage branch; item hooks (chHit).
 */
export function hit(w: World, s: CombatState, v: number, a: number, dx: number, dy: number, m: HitData, src: number, mult: number, heavy: boolean, melee = false): void {
  // stun-repeat reduction (legacy wrapper around hit, runs even when the hit is then rejected): same source on the same victim
  // within the window shortens stun by 8 % per repeat (floor 40 %)
  let stun = m.stun;
  if (a !== v && stun && src >= 0) {
    const k = v * NSRC + src, n = s.stN[k]! > 0 && s.gf - s.stF[k]! < T.STUN_REPEAT_WIN ? s.stN[k]! : 0;
    s.stN[k] = n + 1; s.stF[k] = s.gf;
    if (n > 0) stun = stun * Math.max(0.4, 1 - 0.08 * n);
  }
  if (a !== v) { s.lastBy[v] = a; s.lastByF[v] = s.gf; }
  if (s.inv[v]! > 0 || s.state[v] === PS.dead) return;
  { const R = rulesOf(w); if (R.length) { const c = { w, s, v, a, dx, dy, m, mult, heavy }; for (const r of R) if (r.hit?.(c)) return; } } // legacy chHit (themed items)
  if (s.state[v] === PS.spell && !melee) { // a spell card is only broken by melee or a very big hit; small hits just chip
    const raw = m.dmg * mult;
    if (raw < 16 && s.hp[v]! > raw * 1.6) {
      const dmg = dealDamage(w, s, v, a, raw, heavy);
      s.hp[v] = s.hp[v]! - dmg; s.flash[v] = 8; s.spirit[a] = Math.min(T.SPIRIT_MAX, s.spirit[a]! + dmg * T.HIT_GAIN);
      if (a >= 0 && a !== v && dmg > 0) charOf(w, s, a).onHit?.(w, s, a, v, heavy); // legacy wraps hit(): onHit fires on ANY path that lowered hp, chip included
      w.emit('combat:spell-chip', { victim: v, attacker: a, dmg }); return;
    }
  }
  if (s.state[v] === PS.spell) { endSpell(w, s, v, false); w.emit('combat:spell-break', { victim: v, attacker: a }); }
  if (s.state[a] === PS.spell) s.spellHit[v] = 1;
  const dmg = dealDamage(w, s, v, a, m.dmg * mult, heavy);
  s.hp[v] = s.hp[v]! - dmg; if (m.spd) sfxDmg(w, s.hp[v]!); s.flash[v] = 8; s.combo[v] = s.combo[v]! + 1; s.comboN[a] = s.combo[v]!; s.comboT[a] = 100; s.charging[v] = 0; s.mvId[v] = 0;
  s.spirit[a] = Math.min(T.SPIRIT_MAX, s.spirit[a]! + dmg * T.HIT_GAIN); s.spirit[v] = Math.min(T.SPIRIT_MAX, s.spirit[v]! + dmg * T.HURT_GAIN);
  s.burst[v] = Math.min(T.BURST_MAX, s.burst[v]! + dmg * T.BURST_HURT); s.power[v] = Math.max(1, s.power[v]! - T.POWER_HIT); s.run[v] = 0; s.slide[v] = 0;
  for (let c = 0; c < s.ncard; c++) s.ccp[c * MAXP + v] = 0; // being hit empties your capture gauge (R84: on every card; legacy only reset the first one)
  if (heavy && inEdge(s, v) && s.pips[v]! > 0) { s.pips[v] = s.pips[v]! - 1; w.emit('combat:wall-pip', { p: v, pips: s.pips[v]! }); }
  const n = hypot(dx, dy) || 1, kn = (0.7 + 0.03 * s.tempo) * m.kb * (1 + T.KB_SCALE * (1 - Math.max(0, s.hp[v]!) / T.HP)) * (s.giant[v]! > 0 ? 0.5 : 1);
  if (kn * mult > 20) { s.bounceN[v] = 3; sfx(w, kn * mult > 34 || s.hp[v]! <= 0 ? 'superheavyhit' : 'strongslice', kn * mult > 34 || s.hp[v]! <= 0 ? 0.7 : 0.3); }
  s.kbx[v] = dx / n * kn; s.kby[v] = dy / n * kn; s.diPend[v] = 1; s.vx[v] = 0; s.vy[v] = 0; s.state[v] = PS.hitstun;
  s.t[v] = Math.round(stun * pow(T.STUN_DECAY, s.combo[v]! - 1) * kS(s));
  if (s.hp[v]! <= 0) s.koPend[v] = 1;
  s.hitstop = Math.max(s.hitstop, T.HITSTOP + Math.round(dmg * 0.35));
  if (a >= 0 && a !== v && dmg > 0) charOf(w, s, a).onHit?.(w, s, a, v, heavy);
  w.emit('combat:hit', { victim: v, attacker: a, dmg, combo: s.combo[v]!, heavy, x: s.x[v]!, y: s.y[v]!, dx, dy });
}
