import { type World, atan2, cos, hypot, sin } from '@kernel';
import { PS, addEnt, bodyR, chHitQ, foe, type CombatState } from '@pack/combat/api';
import type { TouhouState } from '../../state';
import { EK_FCL, EK_FFL, EK_FLV, EK_FSB } from './kinds';

const live = (s: CombatState, o: number, q: number): boolean => q !== o && s.state[q] !== PS.dead && s.inv[q]! <= 0 && foe(s, o, q);

/** Flandre's entities (legacy EST.fsb / flv / ffl / fcl), run after every character tick. */
export function flandreEnts(w: World, s: CombatState, p: number): void {
  const ts = w.slice<TouhouState>('touhou');
  for (let i = 0; i < s.nent; i++) {
    if (s.eo[i] !== p || s.et[i]! <= 0) continue;
    const k = s.ek[i]!;
    if (k === EK_FSB) { // Starbow burst: hurts everyone within 30 px on its last frame
      if (s.et[i] !== 1) continue;
      for (let q = 0; q < s.n; q++) if (live(s, p, q)) { const dx = s.x[q]! - s.ex[i]!, dy = s.y[q]! - s.ey[i]!, d = hypot(dx, dy) || 1; if (d < 30 + bodyR(s, q)) chHitQ(w, s, p, q, dx / d, dy / d, s.ed[i]!, 6, 22); }
    } else if (k === EK_FLV) { // Laevatein: coasts for 30 frames, then homes back to Flandre and vanishes when it reaches her
      const age = s.ebc[i]! - s.et[i]!; s.ew[i] = s.ew[i]! + 0.45;
      if (age < 30) { s.evx[i] = s.evx[i]! * 0.965; s.evy[i] = s.evy[i]! * 0.965; }
      else {
        const dx = s.x[p]! - s.ex[i]!, dy = s.y[p]! - s.ey[i]!, d = hypot(dx, dy) || 1;
        s.evx[i] = s.evx[i]! + (dx / d * 12 - s.evx[i]!) * 0.15; s.evy[i] = s.evy[i]! + (dy / d * 12 - s.evy[i]!) * 0.15;
        if (d < 22) { s.et[i] = 0; continue; }
      }
      s.ex[i] = s.ex[i]! + s.evx[i]!; s.ey[i] = s.ey[i]! + s.evy[i]!;
      if (age % 4 === 0) addEnt(s, EK_FFL, p, 45, s.ex[i]!, s.ey[i]!);
      for (let q = 0; q < s.n; q++) if (live(s, p, q) && s.ehc[i * 32 + q]! <= s.gf && hypot(s.x[q]! - s.ex[i]!, s.y[q]! - s.ey[i]!) < 26 + bodyR(s, q)) { s.ehc[i * 32 + q] = s.gf + 18; chHitQ(w, s, p, q, s.evx[i]!, s.evy[i]!, s.ed[i]!, 7, 20); }
    } else if (k === EK_FFL) { // flame trail: 2 dmg, shared 30-frame cooldown per victim
      for (let q = 0; q < s.n; q++) if (live(s, p, q) && ts.fHc[q]! <= s.gf && hypot(s.x[q]! - s.ex[i]!, s.y[q]! - s.ey[i]!) < 12 + bodyR(s, q)) { ts.fHc[q] = s.gf + 30; chHitQ(w, s, p, q, 0, 0, 2, 1, 10); }
    } else if (k === EK_FCL) { // clone: waits 30 frames, locks on, dashes at 13 px/f and hurts the first foe it touches
      const age = s.ebc[i]! - s.et[i]!, t = s.ew[i]!;
      if (age === 30 && t >= 0) { const a = atan2(s.y[t]! - s.ey[i]!, s.x[t]! - s.ex[i]!); s.evx[i] = cos(a) * 13; s.evy[i] = sin(a) * 13; }
      if (age > 30) {
        s.ex[i] = s.ex[i]! + s.evx[i]!; s.ey[i] = s.ey[i]! + s.evy[i]!;
        if (!s.efl[i]) for (let z = 0; z < s.n; z++) if (live(s, p, z) && hypot(s.x[z]! - s.ex[i]!, s.y[z]! - s.ey[i]!) < 18 + bodyR(s, z)) { s.efl[i] = 1; chHitQ(w, s, p, z, s.evx[i]!, s.evy[i]!, 7, 9, 26); }
      }
    }
  }
}
