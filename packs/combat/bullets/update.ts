import { bulletArrays, clearBullet, copyBullet } from './arrays';
import { type World, atan2, clamp, cos, hypot, sin, PI } from '@kernel';
import { TAU } from '../tuning';
import { graze } from '../player/graze';
import { lightHit } from '../player/damage';
import { bodyR, coreR, kB } from '../stats';
import { mirrorRef } from './mirror';
import { heavyClash, heavyContact } from './heavy';
import { T } from '../tuning';
import { EK_FAIRY, hitFairy } from '../items/fairy';
import { PS, BF, type CombatState } from '../state';

/** Distance from point (px,py) to segment a→b (legacy segD). */
export function segD(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy || 1, u = clamp(((px - ax) * dx + (py - ay) * dy) / l, 0, 1);
  return hypot(px - ax - u * dx, py - ay - u * dy);
}

/**
 * Bullet step (legacy updBullets). Order: move → expire → per-player collision (light: parry-cancel, graze, damage) → compact.
 * Heavy bullets: see heavy.ts. TODO(next batches): splitting, freeze, item hooks (mirror/fake/pure).
 */
export function updateBullets(w: World, s: CombatState): void {
  const k = kB(s), nb = s.nb;
  let nf = 0;
  for (let e = 0; e < s.nent; e++) if (s.ek[e] === EK_FAIRY) nf++;
  for (let i = 0; i < nb; i++) {
    if (s.bflags[i]! & (BF.dead | BF.frozen)) continue; // frozen bullets hang in the air (Perfect Freeze)
    const home = s.bhome[i]!;
    if (home) { // homing: turn toward the owner's target by at most `home` rad/frame
      const o = s.bowner[i]!, tq = s.tgt[o]! >= 0 ? s.tgt[o]! : (o + 1) % s.n;
      if (s.state[tq] !== PS.dead) {
        const sp = hypot(s.bvx[i]!, s.bvy[i]!), a = atan2(s.bvy[i]!, s.bvx[i]!);
        const da = ((atan2(s.y[tq]! - s.by[i]!, s.x[tq]! - s.bx[i]!) - a) % TAU + TAU * 1.5) % TAU - PI;
        const na = a + clamp(da, -home, home);
        s.bvx[i] = cos(na) * sp; s.bvy[i] = sin(na) * sp;
      }
    }
    s.bx[i] = s.bx[i]! + s.bvx[i]! * k; s.by[i] = s.by[i]! + s.bvy[i]! * k;
    if (s.bflags[i]! & BF.heavy) s.bdist[i] = s.bdist[i]! + hypot(s.bvx[i]!, s.bvy[i]!) * k;
    s.blife[i] = s.blife[i]! - k;
    const bx = s.bx[i]!, by = s.by[i]!;
    if (s.blife[i]! <= 0 || bx < -20 || by < -20 || bx > s.mapW + 20 || by > s.mapH + 20) { s.bflags[i] = s.bflags[i]! | BF.dead; continue; }
    const fast = s.bvx[i]! * s.bvx[i]! + s.bvy[i]! * s.bvy[i]! > 144;
    for (let t = 0; t < s.n; t++) {
      if (s.bflags[i]! & BF.dead) break;
      const owner = s.bowner[i]!; // live: a mirror bounce changes the owner mid-loop
      if ((s.teams !== 0 && owner !== t && s.team[owner] === s.team[t]) || t === owner || s.state[t] === PS.dead || (s.bflags[i]! & BF.fake)) continue; // `fake` = harmless decoy (Nue)
      const vx = s.bvx[i]!, vy = s.bvy[i]!; // live: a mirror bounce earlier in this loop changed them (legacy reads b.vx directly)
      const ax = s.x[t]! - bx, ay = s.y[t]! - by, mg = 82 + (fast ? Math.abs(vx) + Math.abs(vy) : 0);
      if (ax > mg || ax < -mg || ay > mg || ay < -mg) continue;
      const d = fast ? segD(s.x[t]!, s.y[t]!, bx - vx, by - vy, bx, by) : hypot(ax, ay);
      if (d > 80) continue;
      if (s.bflags[i]! & BF.heavy) { heavyContact(w, s, i, t, d); continue; }
      const r = s.br[i]!;
      if (s.mirror[t]! > 0 && d < bodyR(s, t) + r) { mirrorRef(s, i, t); continue; }
      if (s.state[t] === PS.parry && d < T.PARRY_R) { s.bflags[i] = s.bflags[i]! | BF.dead; continue; }
      if (!(s.bflags[i]! & BF.grazed) && d < r + T.GRAZE_R) { s.bflags[i] = s.bflags[i]! | BF.grazed; graze(w, s, t, bx, by, 1); }
      if (s.state[t] !== PS.dash && s.inv[t]! <= 0 && d < r * 0.68 + coreR(s, t)) { s.bflags[i] = s.bflags[i]! | BF.dead; lightHit(w, s, t, owner, s.bdmg[i]!); }
    }
    if (nf && !(s.bflags[i]! & BF.dead) && hitFairy(s, i)) s.bflags[i] = s.bflags[i]! | BF.dead;
  }
  heavyClash(s);
  // compact in order; zero the freed tail so identical live states hash identically
  let wi = 0;
  const A = bulletArrays(s);
  for (let i = 0; i < nb; i++) {
    if (s.bflags[i]! & BF.dead) continue;
    if (wi !== i) copyBullet(A, i, wi);
    wi++;
  }
  for (let i = wi; i < nb; i++) clearBullet(A, i);
  s.nb = wi;
}
