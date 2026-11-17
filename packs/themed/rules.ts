import type { World } from '@kernel';
import { PS, type CombatState, type HitCtx, type RulesDef, tickFxP } from '@pack/combat/api';
import { EK_EFAIRY, efairy } from './daiyousei';
import { EK_DECOY, decoy } from './rin';
import { meilingGate } from './meiling';
import { pactKill, pactPre } from './koakuma';
import { elemBullet, elemHit, elemPre } from './elements';
import type { ThemedState } from './state';
import { rumiaLate } from './rumia';
import { darkAbsorb, darkMark, rumiaHit, rumiaPre, spitWall, updEaten } from './rumia';

/** The themed rule set: legacy chPre..chPre5 / chHit / chDmg / chBullet / chMelee / chSpeed / chKill bodies, item branches in LEGACY ORDER
 *  (the shared rng draws depend on it). Items not ported yet simply have no branch here. See docs/game/items/themed-plan.md. */
const AL: number[] = [];
const th = (w: World): ThemedState => w.slice<ThemedState>('themed');
function pre(w: World, s: CombatState): void {
  // chPre
  const T = w.slice<ThemedState>('themed');
  if (T.wallO >= 0 && --T.wallT <= 0) T.wallO = -1; // CX timers, legacy list order: wall, swap, link, spring, lun, mer, lyr, rhy, yuyu, myst, rule, reis, pill, shr, terr
  if (T.anon > 0) T.anon--;
  let n = 0; for (let p = 0; p < s.n; p++) if (s.state[p] !== PS.dead) AL[n++] = p;
  darkAbsorb(s);
  for (let j = 0; j < n; j++) {
    const p = AL[j]!;
    pactPre(w, s, T, p);
    tickFxP(w, s, p);
    rumiaPre(s, p);
  }
  meilingGate(w, s, T, AL, n);
  // chPre2..chPre4: no ported item yet
  elemPre(w, s, T); // chPre5
}
function hit(c: HitCtx): boolean {
  if (elemHit(c.s, th(c.w), c.v, c.a)) return true; // outermost wrapper (line 1815)
  if (rumiaHit(c)) return true;
  return false;
}
function bullet(w: World, s: CombatState, i: number, t: number): boolean {
  darkMark(w, s, i, t);
  const r = false;
  elemBullet(s, th(w), i, t, r); // wrapper line 1814: after the inner chain
  return r;
}
function state(w: World, s: CombatState, p: number): boolean {
  if (s.state[p] === PS.eaten) { updEaten(w, s, p); return true; }
  return false;
}
function wall(w: World, s: CombatState, p: number, ax: number): boolean {
  if (spitWall(w, s, p, ax)) return true; // legacy wall(): `if(p.spit){xSpitWall}` first (the beam push, spit 2, stays in combat)
  return false;
}
function ent(w: World, s: CombatState, i: number): void {
  switch (s.ek[i]) { case EK_EFAIRY: efairy(w, s, i); break; case EK_DECOY: decoy(w, s, i); break; }
}
/** legacy xActive: CX.anon (anyone's), CX objects owned by p (wall) */
const active = (w: World, _s: CombatState, p: number): boolean => { const T = w.slice<ThemedState>('themed'); return T.anon > 0 || T.wallO === p; };
/** legacy step wrapper line 2277 (per live player) */
function late(w: World, s: CombatState, p: number): void { rumiaLate(w, s, p); }
/** legacy chKill */
function kill(w: World, s: CombatState, v: number): void { pactKill(w, s, v); }
export default { pre, hit, bullet, state, wall, ent, active, kill, late } satisfies RulesDef;
