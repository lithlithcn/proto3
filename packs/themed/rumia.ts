import { type World, atan2, cos, hypot, sin } from '@kernel';
import { BF, FXS, ISRC, MAX_FX, PS, T, type CombatState, type HitCtx, customHeavy, jfx, jBig, ko, nearFoe, pushJ, sfx, addJ, jFlash, jBurst } from '@pack/combat/api';
import type { ThemedState } from './state';

/** Rumia, The Darkness Feeds (legacy GIVE.rumia / chPre dark orbs / chBullet b.dark / chHit xSwallow / updEaten / xSpitWall). */
const th = (w: World): ThemedState => w.slice<ThemedState>('themed');
const eat = (s: CombatState, p: number): number => s.fx[p * MAX_FX + FXS.eat]!;
/** chPre: every 50 frames of darkness a slow homing dark orb (heavy, armed) at the nearest foe. */
export function rumiaPre(s: CombatState, p: number): void {
  const f = eat(s, p); if (!(f > 0 && f % 50 === 0)) return;
  const q = nearFoe(s, p, s.x[p]!, s.y[p]!), a = q >= 0 ? atan2(s.y[q]! - s.y[p]!, s.x[q]! - s.x[p]!) : s.aim[p]!;
  const i = customHeavy(s, p, s.x[p]!, s.y[p]!, a, 2.6, 24, { dmg: 5, kb: 6, stun: 26, arm: 0 }, 300, 0x1a0f2e);
  if (i >= 0) { s.bhome[i] = 0.01; s.bflags[i] = s.bflags[i]! | BF.dark; s.bmv[i] = ISRC.dark; }
}
/** chPre: dark orbs erase the foes' bullets they touch and grow (max radius 46). */
const ABS: number[] = [];
export function darkAbsorb(s: CombatState): void {
  let n = 0; for (let a = 0; a < s.nb; a++) if ((s.bflags[a]! & (BF.dark | BF.dead)) === BF.dark) ABS[n++] = a; // legacy collects them first
  for (let j = 0; j < n; j++) {
    const a = ABS[j]!;
    for (let b = 0; b < s.nb; b++) {
      if (b === a || (s.bflags[b]! & (BF.dead | BF.fake)) || s.bowner[b] === s.bowner[a]) continue;
      const rr = s.br[a]! + s.br[b]!, dx = s.bx[b]! - s.bx[a]!, dy = s.by[b]! - s.by[a]!;
      if (Math.abs(dx) < rr && Math.abs(dy) < rr && hypot(dx, dy) < rr) { s.bflags[b] = s.bflags[b]! | BF.dead; s.br[a] = Math.min(46, s.br[a]! + 0.5); }
    }
  }
}
/** chBullet: a dark orb marks its victim EDIBLE for 5 s. */
export function darkMark(w: World, s: CombatState, i: number, t: number): void { if (s.bflags[i]! & BF.dark) th(w).dark[t] = s.gf + 300; }
/** chHit: an attack of a dark-fed fighter on an EDIBLE foe swallows it. */
export function rumiaHit(c: HitCtx): boolean {
  const { w, s, v, a } = c; if (a < 0 || s.state[a] !== PS.atk || !(eat(s, a) > 0) || !(th(w).dark[v]! > s.gf)) return false;
  s.state[v] = PS.eaten; th(w).eatBy[v] = a; s.t[v] = 150; s.vx[v] = 0; s.vy[v] = 0; s.charging[v] = 0; th(w).dark[v] = 0;
  jBig(w, 'CHOMP!', '#6b5bb0', 60); sfx(w, 'hit3'); addJ(w, 'shake', 14, 30); s.fx[a * MAX_FX + FXS.eat] = Math.max(eat(s, a), 160);
  return true;
}
/** updEaten: held inside the eater, 2 HP drained every 10 frames, spat out along its aim after 2.5 s. */
export function updEaten(w: World, s: CombatState, p: number): void {
  const e = th(w).eatBy[p]!; s.inv[p] = Math.max(s.inv[p]!, 2); if (e < 0 || s.state[e] === PS.dead) { s.state[p] = PS.idle; return; }
  s.x[p] = s.x[e]!; s.y[p] = s.y[e]!;
  if (s.t[p]! % 10 === 0) { s.hp[p] = s.hp[p]! - 2; s.hp[e] = Math.min(T.HP, s.hp[e]! + 2); if (s.hp[p]! <= 0) { s.inv[p] = 0; ko(w, s, p, 'DIGESTED'); return; } }
  if (--s.t[p]! <= 0) {
    const c = cos(s.aim[e]!), sn = sin(s.aim[e]!); s.state[p] = PS.hitstun; s.t[p] = 400; s.spit[p] = 1; s.x[p] = s.x[e]! + c * 36; s.y[p] = s.y[e]! + sn * 36; s.vx[p] = c * 24; s.vy[p] = sn * 24; s.inv[p] = 3;
    jBig(w, 'PTOOEY!', '#6b5bb0', 54); sfx(w, 'tan02'); pushJ(w, 'WAVES', 'x', s.x[e]!, 'y', s.y[e]!, 't', 14, 'T', 14, 'spd', 12, 'th', 24, 'inv', 1);
  }
}
/** xSpitWall (spit = 1, spat out): a fighter with no HP left is a MAX POWER K.O.; otherwise SPLAT: 16 damage and a wall pip (K.O. at 0). */
export function spitWall(w: World, s: CombatState, p: number, ax: number): boolean {
  if (!s.spit[p] || s.spit[p] === 2) return false;
  if (s.spit[p] === 1 && s.hp[p]! <= 0) { s.spit[p] = 0; ko(w, s, p, 'MAX POWER K.O.!'); return true; }
  s.spit[p] = 0; s.hp[p] = s.hp[p]! - 16; s.t[p] = 24; addJ(w, 'shake', 20, 40); jFlash(w, 0.3); jBurst(w, s.x[p]!, s.y[p]!, '#6b5bb0', 30); jBig(w, 'SPLAT!', '#fff', 60); sfx(w, 'se_enep00');
  if (s.pips[p]! <= 0 || s.hp[p]! <= 0) { ko(w, s, p, s.hp[p]! <= 0 ? 'K.O.' : 'SPAT OUT!'); return true; }
  s.pips[p] = s.pips[p]! - 1; w.emit('combat:wall-pip', { p, pips: s.pips[p]! }); if (ax) s.vy[p] = s.vy[p]! * -0.3; else s.vx[p] = s.vx[p]! * -0.3;
  return true;
}
/** Legacy step wrapper (line 2283): every 28 frames of darkness, 12 harmless dark wisps + a dark wave (presentation: juice RDK). */
export function rumiaLate(w: World, s: CombatState, p: number): void { if (eat(s, p) > 0 && s.gf % 28 === 0) jfx(w, 'rdk', s.x[p]!, s.y[p]!); }
