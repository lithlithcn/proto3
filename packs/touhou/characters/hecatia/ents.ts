import { type World, atan2, cos, hypot, sin } from '@kernel';
import { BF, PS, TAU, bodyR, chHitQ, foe, nearFoe, powerMul, type CombatState } from '@pack/combat/api';
import type { TouhouState } from '../../state';
import { bodyShot } from './shot';
import { EK_HPL, EK_HRG, EK_HST } from './kinds';

const live = (s: CombatState, o: number, q: number): boolean => q !== o && s.state[q] !== PS.dead && s.inv[q]! <= 0 && foe(s, o, q);
const PL_DMG = [6, 5, 4] as const;

/** Hecatia's entities (legacy EST.hst / hpl / hrg), run after every character tick. */
export function hecatiaEnts(w: World, s: CombatState, p: number): void {
  const ts = w.slice<TouhouState>('touhou');
  for (let i = 0; i < s.nent; i++) {
    if (s.eo[i] !== p || s.et[i]! <= 0) continue;
    const k = s.ek[i]!;
    if (k === EK_HST) { // statue: fires its body's volley at the nearest foe within 700 px every 12 frames
      s.er[i] = s.er[i]! - 1; if (s.er[i]! > 0) continue;
      s.er[i] = 12;
      const q = nearFoe(s, p, s.ex[i]!, s.ey[i]!); if (q < 0 || hypot(s.x[q]! - s.ex[i]!, s.y[q]! - s.ey[i]!) >= 700) continue;
      bodyShot(s, p, atan2(s.y[q]! - s.ey[i]!, s.x[q]! - s.ex[i]!), powerMul(s, p, 0) * 0.5, s.ebc[i]!, s.ex[i]!, s.ey[i]!, true);
    } else if (k === EK_HPL) { // planet: orbits its target at 90 px; on touch Earth pulls, Moon slows, Otherworld burns
      const q = s.ew[i]!;
      if (q >= 0 && s.state[q] !== PS.dead) { s.ea[i] = s.ea[i]! + 0.05; s.ex[i] = s.ex[i]! + (s.x[q]! + cos(s.ea[i]!) * 90 - s.ex[i]!) * 0.12; s.ey[i] = s.ey[i]! + (s.y[q]! + sin(s.ea[i]!) * 90 - s.ey[i]!) * 0.12; }
      const b = s.ebc[i]!;
      for (let z = 0; z < s.n; z++) {
        if (!live(s, p, z) || s.ehc[i * 32 + z]! > s.gf) continue;
        const dx = s.x[z]! - s.ex[i]!, dy = s.y[z]! - s.ey[i]!, d = hypot(dx, dy) || 1;
        if (d > 16 + bodyR(s, z)) continue;
        s.ehc[i * 32 + z] = s.gf + 40;
        if (!chHitQ(w, s, p, z, dx / d, dy / d, PL_DMG[b]!, 5, 20)) continue;
        if (b === 0) { s.vx[z] = s.vx[z]! - dx / d * 4; s.vy[z] = s.vy[z]! - dy / d * 4; } else if (b === 1) s.slowT[z] = Math.max(s.slowT[z]!, s.gf + 90); else { ts.hBurn[z] = s.gf + 120; ts.hBurnBy[z] = p + 1; }
      }
    } else if (k === EK_HRG) { // ring shield: three planets circle her, erase light bullets and hurt foes they touch
      const a = s.gf * 0.06 + s.ebc[i]! * TAU / 3; s.ex[i] = s.x[p]! + cos(a) * 48; s.ey[i] = s.y[p]! + sin(a) * 48;
      for (let b = 0; b < s.nb; b++) if (!(s.bflags[b]! & (BF.dead | BF.heavy)) && s.bowner[b] !== p && hypot(s.bx[b]! - s.ex[i]!, s.by[b]! - s.ey[i]!) < 12 + s.br[b]!) s.bflags[b] = s.bflags[b]! | BF.dead;
      for (let z = 0; z < s.n; z++) if (live(s, p, z) && s.ehc[i * 32 + z]! <= s.gf && hypot(s.x[z]! - s.ex[i]!, s.y[z]! - s.ey[i]!) < 12 + bodyR(s, z)) { s.ehc[i * 32 + z] = s.gf + 30; chHitQ(w, s, p, z, s.x[z]! - s.ex[i]!, s.y[z]! - s.ey[i]!, 5, 8, 20); }
    }
  }
}
