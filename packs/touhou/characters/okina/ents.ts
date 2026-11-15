import { type World, atan2, hypot } from '@kernel';
import { BF, PS, TAU, bodyR, chHitQ, customHeavy, foe, moveOf, nearFoe, type CombatState } from '@pack/combat/api';
import { EK_OBD, EK_ODN, EK_ODR } from './kinds';

const live = (s: CombatState, o: number, q: number): boolean => q !== o && s.state[q] !== PS.dead && s.inv[q]! <= 0 && foe(s, o, q);

/** Okina's entities (legacy EST.obd / odr / odn), run after every character tick. */
export function okinaEnts(w: World, s: CombatState, p: number): void {
  for (let i = s.eLo; i < s.eHi; i++) {
    if (s.eo[i] !== p || s.et[i]! <= 0) continue;
    const k = s.ek[i]!;
    if (k === EK_OBD) { // big door: swallows every foreign bullet within 90 px for 70 frames, then spits n + 4 back (max 24) at the nearest foe
      if (s.ebc[i]! - s.et[i]! < 70) for (let b = 0; b < s.nb; b++) if (!(s.bflags[b]! & BF.dead) && s.bowner[b] !== p && hypot(s.bx[b]! - s.ex[i]!, s.by[b]! - s.ey[i]!) < 90) { s.bflags[b] = s.bflags[b]! | BF.dead; s.ew[i] = s.ew[i]! + 1; }
      if (s.et[i] === 1) {
        const q = nearFoe(s, p, s.ex[i]!, s.ey[i]!, 1500), a = q >= 0 ? atan2(s.y[q]! - s.ey[i]!, s.x[q]! - s.ex[i]!) : s.ea[i]!, n = Math.min(24, s.ew[i]! + 4);
        for (let j = 0; j < n; j++) customHeavy(s, p, s.ex[i]!, s.ey[i]!, a + (j - n / 2) * 0.06, 7, 6, { dmg: 4, kb: 4, stun: 14, arm: 0 }, 160, 0xffd23a);
      }
    } else if (k === EK_ODR) { // placed door: 50 hp, breaks on foreign bullets and foes' active melee
      for (let b = 0; b < s.nb; b++) {
        if ((s.bflags[b]! & BF.dead) || s.bowner[b] === p || !foe(s, p, s.bowner[b]!) || Math.abs(s.bx[b]! - s.ex[i]!) >= 14 + s.br[b]! || Math.abs(s.by[b]! - s.ey[i]!) >= 22 + s.br[b]!) continue;
        s.bflags[b] = s.bflags[b]! | BF.dead; s.eh[i] = s.eh[i]! - ((s.bflags[b]! & BF.heavy) ? s.bdmg[b]! || 6 : s.bdmg[b]! || 1.5);
      }
      for (let q = 0; q < s.n; q++) {
        if (!live(s, p, q) || s.state[q] !== PS.atk || s.ehc[i * 32 + q]! > s.gf) continue;
        const m = moveOf(w, s, q); if (!m || m.spd !== undefined || s.t[q]! < m.start || s.t[q]! >= m.start + m.act) continue;
        if (hypot(s.x[q]! - s.ex[i]!, s.y[q]! - s.ey[i]!) < (m.range || 40) + bodyR(s, q) + 16) { s.ehc[i * 32 + q] = s.gf + 20; s.eh[i] = s.eh[i]! - (m.dmg || 5); }
      }
      if (s.eh[i]! <= 0) s.et[i] = 0;
    } else if (k === EK_ODN) { // dancer: kicks foes it touches (toward its sister if both are out), throws an 8-way ring every 45 frames and a big pair every 3rd ring
      let S = -1; for (let z = 0; z < s.nent; z++) if (z !== i && s.ek[z] === EK_ODN && s.eo[z] === p && s.et[z]! > 0) { S = z; break; }
      for (let q = 0; q < s.n; q++) {
        if (!live(s, p, q) || s.ehc[i * 32 + q]! > s.gf || hypot(s.x[q]! - s.ex[i]!, s.y[q]! - s.ey[i]!) > 30 + bodyR(s, q)) continue;
        s.ehc[i * 32 + q] = s.gf + 20;
        let dx = S >= 0 ? s.ex[S]! - s.ex[i]! : s.x[q]! - s.ex[i]!, dy = S >= 0 ? s.ey[S]! - s.ey[i]! : s.y[q]! - s.ey[i]!; const l = hypot(dx, dy) || 1; dx /= l; dy /= l;
        chHitQ(w, s, p, q, dx, dy, 5, S >= 0 ? Math.min(18, 7 + l / 16) : 12, 30);
      }
      s.er[i] = s.er[i]! - 1;
      if (s.er[i]! <= 0) {
        s.er[i] = 45; s.ew[i] = s.ew[i]! + 1; const n = s.ew[i]!, c = s.ebc[i]! ? 0x5cff7a : 0xff7ad0;
        for (let j = 0; j < 8; j++) customHeavy(s, p, s.ex[i]!, s.ey[i]!, j * TAU / 8 + n * 0.3 + s.ebc[i]!, 2.2, 4, { dmg: 2, kb: 2, stun: 8, arm: 0 }, 150, c);
        if (n % 3 === 0) for (const sg of [-1, 1]) customHeavy(s, p, s.ex[i]!, s.ey[i]!, n * 0.7 + sg * 1.3, 1.8, 10, { dmg: 4, kb: 4, stun: 14, arm: 0 }, 200, 0xffd23a);
      }
    }
  }
}
