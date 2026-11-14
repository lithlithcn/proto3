import { bodyR } from './stats';
import { BTN, type World, atan2, clamp, cos, hypot, sin } from '@kernel';
import { MAX_KB, PS, type CombatState } from './state';
import { SRC } from './moves';
import { T, TAU } from './tuning';
import { hit } from './player/hit';
import { parryFx } from './player/parry';

/** KO beam (legacy KOB + fireBeam). Beams live in a tiny fixed pool; `kbDep` = reflection depth. Presentation hangs off `combat:kobeam-*` events. */
export const BEAM_T = 120;
const BEAM = { dmg: 18, kb: 18, stun: 40 }, REFL_T = 40, PI = 3.141592653589793;

export function addBeam(s: CombatState, o: number, x: number, y: number, a: number, t: number, dep: number): void {
  if (s.nkb >= MAX_KB) return;
  const i = s.nkb++;
  s.kbO[i] = o; s.kbX[i] = x; s.kbY[i] = y; s.kbA[i] = a; s.kbT[i] = t; s.kbTT[i] = t; s.kbPP[i] = 0; s.kbDep[i] = dep;
}

/** Fire: pierces everything; a parrying foe (active or within BEAM_PARRY frames of starting) stops it and sends it back (unbounded depth up to 30). */
function fire(w: World, s: CombatState, x: number, y: number, a: number, o: number, dep: number): void {
  const c = cos(a), sn = sin(a);
  const hits: { q: number; d: number }[] = [];
  for (let q = 0; q < s.n; q++) {
    if (q === o || s.state[q] === PS.dead || s.inv[q]! > 0 || (s.teams && s.team[q] === s.team[o])) continue;
    const rx = s.x[q]! - x, ry = s.y[q]! - y, d = rx * c + ry * sn, e = Math.abs(ry * c - rx * sn);
    if (d > 0 && e < 70 + bodyR(s, q)) hits.push({ q, d });
  }
  for (let i = 1; i < hits.length; i++) { const h = hits[i]!; let j = i - 1; while (j >= 0 && hits[j]!.d > h.d) { hits[j + 1] = hits[j]!; j--; } hits[j + 1] = h; } // stable insertion sort by distance
  for (const { q, d } of hits) {
    if ((s.state[q] === PS.parry || s.gf - s.pStart[q]! <= T.BEAM_PARRY) && dep < 30) {
      s.state[q] = PS.idle; parryFx(w, s, q, Math.min(7, dep + 1));
      s.state[q] = PS.hitstun; s.t[q] = 400; s.spit[q] = 2; s.beamPip[q] = 1; s.vx[q] = c * 28; s.vy[q] = sn * 28; s.charging[q] = 0;
      const ix = w.x(q) / 127, iy = w.y(q) / 127;
      const ra = hypot(ix, iy) > 0.3 ? atan2(iy, ix) : dep ? s.aim[q]! : -PI / 2;
      s.pStart[q] = -999; addBeam(s, q, s.x[q]!, s.y[q]!, ra, REFL_T, dep + 1);
      w.emit('combat:kobeam-reflect', { p: q, dep: dep + 1, x, y, a, len: d });
      return;
    }
    hit(w, s, q, o, c, sn, BEAM, SRC.beam, 1, true);
  }
  w.emit('combat:kobeam-fire', { o, x, y, a, dep });
}

/** One step of every beam: Parry cancels (after 8 f), the owner aims with the stick (CPU: turns toward its target at ≤ .04 rad/f), then fire when the timer ends. */
export function updateBeams(w: World, s: CombatState): void {
  for (let i = 0; i < s.nkb; i++) { // pool may grow while iterating (reflections), like the legacy for-of
    const p = s.kbO[i]!;
    const pp = (w.buttons(p) & BTN.parry) !== 0 ? 1 : 0;
    if (pp && !s.kbPP[i] && s.kbTT[i]! - s.kbT[i]! > 8) { s.kbT[i] = -1; w.emit('combat:kobeam-cancel', { p }); continue; }
    s.kbPP[i] = pp;
    if (s.cpu[p]) {
      const q = s.tgt[p]!;
      if (q >= 0) s.kbA[i] = s.kbA[i]! + clamp(((atan2(s.y[q]! - s.kbY[i]!, s.x[q]! - s.kbX[i]!) - s.kbA[i]!) % TAU + TAU * 1.5) % TAU - PI, -0.04, 0.04);
    } else { const ix = w.x(p) / 127, iy = w.y(p) / 127; if (hypot(ix, iy) > 0.3) s.kbA[i] = atan2(iy, ix); }
    if (--s.kbT[i]! > 0) continue;
    fire(w, s, s.kbX[i]!, s.kbY[i]!, s.kbA[i]!, p, s.kbDep[i]!);
  }
  let k = 0; // keep(): drop expired
  for (let i = 0; i < s.nkb; i++) if (s.kbT[i]! > 0) {
    if (k !== i) { s.kbO[k] = s.kbO[i]!; s.kbX[k] = s.kbX[i]!; s.kbY[k] = s.kbY[i]!; s.kbA[k] = s.kbA[i]!; s.kbT[k] = s.kbT[i]!; s.kbTT[k] = s.kbTT[i]!; s.kbPP[k] = s.kbPP[i]!; s.kbDep[k] = s.kbDep[i]!; }
    k++;
  }
  s.nkb = k;
}
