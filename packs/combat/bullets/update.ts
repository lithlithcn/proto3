import { type World, atan2, clamp, cos, hypot, sin, PI } from '@kernel';
import { TAU } from '../tuning';
import { graze } from '../player/graze';
import { lightHit } from '../player/damage';
import { kB } from '../stats';
import { T } from '../tuning';
import { PS, BF, type CombatState } from '../state';

/** Distance from point (px,py) to segment a→b (legacy segD). */
function segD(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy || 1, u = clamp(((px - ax) * dx + (py - ay) * dy) / l, 0, 1);
  return hypot(px - ax - u * dx, py - ay - u * dy);
}

/**
 * Bullet step (legacy updBullets). Order: move → expire → per-player collision (light: parry-cancel, graze, damage) → compact.
 * TODO(next batches): heavy bullets (arm distance, reflect, breaker), clash, splitting, freeze, item hooks (mirror/fake/pure), teams in damage.
 */
export function updateBullets(w: World, s: CombatState): void {
  const k = kB(s), nb = s.nb;
  for (let i = 0; i < nb; i++) {
    if (s.bflags[i]! & BF.dead) continue;
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
    const vx = s.bvx[i]!, vy = s.bvy[i]!, fast = vx * vx + vy * vy > 144, owner = s.bowner[i]!;
    for (let t = 0; t < s.n; t++) {
      if (s.bflags[i]! & BF.dead) break;
      if ((s.teams !== 0 && owner !== t && s.team[owner] === s.team[t]) || t === owner || s.state[t] === PS.dead) continue;
      const ax = s.x[t]! - bx, ay = s.y[t]! - by, mg = 82 + (fast ? Math.abs(vx) + Math.abs(vy) : 0);
      if (ax > mg || ax < -mg || ay > mg || ay < -mg) continue;
      const d = fast ? segD(s.x[t]!, s.y[t]!, bx - vx, by - vy, bx, by) : hypot(ax, ay);
      if (d > 80) continue;
      const r = s.br[i]!;
      if (s.state[t] === PS.parry && d < T.PARRY_R) { s.bflags[i] = s.bflags[i]! | BF.dead; continue; }
      if (!(s.bflags[i]! & BF.grazed) && d < r + T.GRAZE_R) { s.bflags[i] = s.bflags[i]! | BF.grazed; graze(w, s, t, bx, by, 1); }
      if (s.state[t] !== PS.dash && s.inv[t]! <= 0 && d < r * 0.68 + T.CORE_R) { s.bflags[i] = s.bflags[i]! | BF.dead; lightHit(w, s, t, owner, s.bdmg[i]!); }
    }
  }
  // compact in order; zero the freed tail so identical live states hash identically
  let wi = 0;
  for (let i = 0; i < nb; i++) {
    if (s.bflags[i]! & BF.dead) continue;
    if (wi !== i) {
      s.bx[wi] = s.bx[i]!; s.by[wi] = s.by[i]!; s.bvx[wi] = s.bvx[i]!; s.bvy[wi] = s.bvy[i]!; s.br[wi] = s.br[i]!; s.bdmg[wi] = s.bdmg[i]!;
      s.blife[wi] = s.blife[i]!; s.bhome[wi] = s.bhome[i]!; s.bdist[wi] = s.bdist[i]!; s.bmult[wi] = s.bmult[i]!;
      s.bowner[wi] = s.bowner[i]!; s.bflags[wi] = s.bflags[i]!; s.bcol[wi] = s.bcol[i]!;
    }
    wi++;
  }
  for (let i = wi; i < nb; i++) {
    s.bx[i] = 0; s.by[i] = 0; s.bvx[i] = 0; s.bvy[i] = 0; s.br[i] = 0; s.bdmg[i] = 0; s.blife[i] = 0; s.bhome[i] = 0; s.bdist[i] = 0; s.bmult[i] = 0;
    s.bowner[i] = 0; s.bflags[i] = 0; s.bcol[i] = 0;
  }
  s.nb = wi;
}
