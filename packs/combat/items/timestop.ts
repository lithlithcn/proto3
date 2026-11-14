import { type World, cos, sin } from '@kernel';
import { spRand } from '../bullets/pattern';
import { customHeavy } from '../bullets/spawn';
import { ISRC } from '../moves';
import { MAX_B, PS, type CombatState } from '../state';
import { TAU } from '../tuning';

/** Item `world` (The World): 3 s charge, then 4 s of stopped time (everyone but the holder frozen, bullets frozen); knives gather around the frozen foes and fly in when time resumes. */
export const WORLD = { charge: 180, stop: 240, knife: { dmg: 4, kb: 3, stun: 12, arm: 0 }, knifeR: 6, knifeSpeed: 9, knifeLife: 200, every: 3, rMin: 110, rSpan: 170 };

/** End-of-step (legacy `step` wrapper): charge countdown, time-stop start, knife spawning while time is stopped. */
export function updateTimeStop(w: World, s: CombatState): void {
  void w;
  if (s.zawT > 0 && --s.zawT <= 0) { const p = s.zawO; if (s.state[p] !== PS.dead) { s.tstop = WORLD.stop; s.tso = p; } }
  if (s.tstop > 0 && s.gf % WORLD.every === 0) {
    const o = s.tso;
    for (let q = 0; q < s.n; q++) {
      if (q === o || s.state[q] === PS.dead || s.nb >= MAX_B) continue;
      for (let j = 0; j < 2; j++) {
        const a = spRand(s) * TAU, r = WORLD.rMin + spRand(s) * WORLD.rSpan;
        const b = customHeavy(s, o, s.x[q]! + cos(a) * r, s.y[q]! + sin(a) * r, 0, 0, WORLD.knifeR, WORLD.knife, WORLD.knifeLife, 0xe8f4ff);
        if (b >= 0) { s.bvx[b] = -cos(a) * WORLD.knifeSpeed; s.bvy[b] = -sin(a) * WORLD.knifeSpeed; s.bmv[b] = ISRC.sknife; }
      }
    }
  }
}
