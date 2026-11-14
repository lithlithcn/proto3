import { type World, atan2, cos, hypot, sin } from '@kernel';
import { graze } from '../player/graze';
import { hit } from '../player/hit';
import { ko } from '../player/ko';
import { parryFx, shieldBreak } from '../player/parry';
import { T } from '../tuning';
import { BF, PS, type CombatState } from '../state';


/** Parry reflects a heavy bullet back at its shooter: damage x1.3 per reflection, faster, homing; the 7th reflection cannot be parried and kills (legacy `reflect`). */
function reflect(w: World, s: CombatState, i: number, t: number): void {
  const o = s.bowner[i]!, sp = Math.min(44, hypot(s.bvx[i]!, s.bvy[i]!) * 1.3), a = atan2(s.y[o]! - s.by[i]!, s.x[o]! - s.bx[i]!);
  s.bmult[i] = s.bmult[i]! * 1.3;
  s.bowner[i] = t; s.bvx[i] = cos(a) * sp; s.bvy[i] = sin(a) * sp; s.bdist[i] = s.barm[i]!; s.blife[i] = 200; s.bflags[i] = s.bflags[i]! & ~BF.grazed;
  s.bhome[i] = Math.max(s.bhome[i]!, 0.03); s.brefl[i] = s.brefl[i]! + 1;
  s.state[t] = PS.idle; s.inv[t] = 10;
  parryFx(w, s, t, s.brefl[i]!);
  if (s.brefl[i]! >= 7) s.bflags[i] = s.bflags[i]! | BF.np;
  w.emit('combat:reflect', { p: t, refl: s.brefl[i]!, x: s.bx[i]!, y: s.by[i]! });
}

/** One heavy bullet against one player (legacy updBullets heavy branch). `d` = distance bullet → player. */
export function heavyContact(w: World, s: CombatState, i: number, t: number, d: number): void {
  const r = s.br[i]!, f = s.bflags[i]!, owner = s.bowner[i]!, parrying = s.state[t] === PS.parry;
  if (f & BF.breaker) { if (parrying && d < r + T.PARRY_R) { s.bflags[i] = f | BF.dead; shieldBreak(w, s, t); } return; }
  if (parrying && d < r + T.PARRY_R && !(f & BF.np)) { reflect(w, s, i, t); return; }
  const armed = s.bdist[i]! >= s.barm[i]!;
  if (armed && s.inv[t]! <= 0 && d < r * 0.82 + T.CORE_R) {
    s.bflags[i] = f | BF.dead;
    const n = s.brefl[i]!;
    if (n >= 7) { s.hp[t] = 0; s.kbx[t] = s.bvx[i]!; s.kby[t] = s.bvy[i]!; ko(w, s, t, 'max-power'); }
    else hit(w, s, t, owner, s.bvx[i]!, s.bvy[i]!, { dmg: s.bdmg[i]!, kb: s.bkb[i]! * (1 + 0.35 * n), stun: s.bstun[i]! * (1 + 0.1 * n) }, n ? -1 : s.bmv[i]!, s.bmult[i]!, true);
  } else if (!(f & BF.grazed) && armed && d < r + T.GRAZE_R) { s.bflags[i] = f | BF.grazed; graze(w, s, t, s.bx[i]!, s.by[i]!, 2); }
}

/** Heavy vs heavy clash (both vanish; a reflected one beats a fresh one), and heavy bullets sweep away enemy light bullets around them. */
export function heavyClash(s: CombatState): void {
  const H: number[] = [];
  for (let i = 0; i < s.nb; i++) if ((s.bflags[i]! & (BF.heavy | BF.dead | BF.breaker)) === BF.heavy) H.push(i);
  for (let a = 0; a < H.length; a++) {
    const h = H[a]!;
    if (s.bflags[h]! & BF.dead) continue;
    for (let b = a + 1; b < H.length; b++) {
      const k = H[b]!;
      if ((s.bflags[k]! & BF.dead) || s.bowner[k] === s.bowner[h]) continue;
      if (hypot(s.bx[h]! - s.bx[k]!, s.by[h]! - s.by[k]!) < s.br[h]! + s.br[k]!) {
        if (s.brefl[h]! && !s.brefl[k]!) s.bflags[k] = s.bflags[k]! | BF.dead;
        else if (s.brefl[k]! && !s.brefl[h]!) s.bflags[h] = s.bflags[h]! | BF.dead;
        else { s.bflags[h] = s.bflags[h]! | BF.dead; s.bflags[k] = s.bflags[k]! | BF.dead; }
        break;
      }
    }
    if (s.bflags[h]! & BF.dead) continue;
    const rr = s.br[h]! + 4, ow = s.bowner[h]!;
    for (let j = 0; j < s.nb; j++) {
      if ((s.bflags[j]! & (BF.heavy | BF.dead)) || s.bowner[j] === ow || Math.abs(s.bx[j]! - s.bx[h]!) >= rr || Math.abs(s.by[j]! - s.by[h]!) >= rr) continue;
      s.bflags[j] = s.bflags[j]! | BF.dead; s.spirit[ow] = Math.min(T.SPIRIT_MAX, s.spirit[ow]! + 0.3);
    }
  }
}
