import { type World, atan2, cos, hypot, sin } from '@kernel';
import { BF, PS, TAU, bodyR, chHitQ, customHeavy, foe, nearFoe, type CombatState, jBurst, addJ } from '@pack/combat/api';
import type { TouhouState } from '../../state';
import { EK_NCOIN, EK_NMS, EK_NPD, EK_NPG, EK_NRC } from './kinds';

const live = (s: CombatState, o: number, q: number): boolean => q !== o && s.state[q] !== PS.dead && s.inv[q]! <= 0 && foe(s, o, q);
/** Erases every foreign light bullet within `r` of (x, y). */
function sweep(s: CombatState, p: number, x: number, y: number, r: number): void {
  for (let b = 0; b < s.nb; b++) if (!(s.bflags[b]! & (BF.dead | BF.heavy)) && s.bowner[b] !== p && hypot(s.bx[b]! - x, s.by[b]! - y) < r + s.br[b]!) s.bflags[b] = s.bflags[b]! | BF.dead;
}
function bite(w: World, s: CombatState, p: number, i: number, r: number, cd: number, dmg: number, kb: number, stun: number, tx = NaN, ty = NaN): void {
  for (let q = 0; q < s.n; q++) {
    if (!live(s, p, q) || s.ehc[i * 32 + q]! > s.gf || hypot(s.x[q]! - s.ex[i]!, s.y[q]! - s.ey[i]!) >= r + bodyR(s, q)) continue;
    s.ehc[i * 32 + q] = s.gf + cd;
    chHitQ(w, s, p, q, tx === tx ? tx : s.x[q]! - s.ex[i]!, ty === ty ? ty : s.y[q]! - s.ey[i]!, dmg, kb, stun);
  }
}

/** Nazrin's entities (legacy EST.nms / npd / npg / nrc / ncoin and the mouse-homing wrapper), run after every character tick. */
export function nazrinEnts(w: World, s: CombatState, p: number): void {
  const t = w.slice<TouhouState>('touhou');
  for (let i = s.eLo; i < s.eHi; i++) {
    if (s.eo[i] !== p || s.et[i]! <= 0) continue;
    const k = s.ek[i]!;
    if (k === EK_NMS) { // sentinel mouse: rushes to the marked foe, or to the Focus pendulum point; bites what it touches
      const tg = t.nTgF[p]! > s.gf ? t.nTg[p]! : -1; let tx = NaN, ty = NaN;
      if (tg >= 0 && s.state[tg] !== PS.dead) { tx = s.x[tg]!; ty = s.y[tg]!; }
      else if (s.focus[p]) { tx = s.x[p]! + cos(s.aim[p]!) * 160 + cos(s.ebc[i]!) * 18; ty = s.y[p]! + sin(s.aim[p]!) * 160 + sin(s.ebc[i]!) * 18; }
      if (tx === tx) { const dx = tx - s.ex[i]!, dy = ty - s.ey[i]!, d = hypot(dx, dy); if (d > 3) { const sp = Math.min(d, tg >= 0 ? 4.5 : 3.5); s.ex[i] = s.ex[i]! + dx / d * sp; s.ey[i] = s.ey[i]! + dy / d * sp; s.ea[i] = atan2(dy, dx); } }
      bite(w, s, p, i, 10, 40, 2, 3, 10);
    } else if (k === EK_NPD) { // pendulum: swings around its anchor, erases light bullets, hurts foes
      const big = s.efl[i] === 1, age = s.ebc[i]! - s.et[i]!, ang = s.ea[i]! + sin(age * (big ? 0.04 : 0.09)) * (big ? 1.3 : 1.1), r = big ? 26 : 14;
      s.ex[i] = s.er[i]! + cos(ang) * s.ew[i]!; s.ey[i] = s.eh[i]! + sin(ang) * s.ew[i]!;
      sweep(s, p, s.ex[i]!, s.ey[i]!, r); bite(w, s, p, i, r, 30, s.ed[i]!, 9, 24);
      for (let m = 0; m < s.nent; m++) { // a mouse sentinel touched by the swing is batted at the nearest foe (legacy EST.npd wrapper)
        if (s.ek[m] !== EK_NMS || s.eo[m] !== p || s.et[m]! <= 0 || hypot(s.ex[m]! - s.ex[i]!, s.ey[m]! - s.ey[i]!) >= (big ? 30 : 18)) continue;
        s.et[m] = 0; const q = nearFoe(s, p, s.ex[m]!, s.ey[m]!), near = q >= 0 && hypot(s.x[q]! - s.ex[m]!, s.y[q]! - s.ey[m]!) < 900;
        customHeavy(s, p, s.ex[m]!, s.ey[m]!, near ? atan2(s.y[q]! - s.ey[m]!, s.x[q]! - s.ex[m]!) : s.ea[i]!, 9, 6, { dmg: 6, kb: 7, stun: 20, arm: 0 }, 80, 0xc8c8d8);
      }
    } else if (k === EK_NPG) { // guard pendulum
      const a = s.gf * 0.08 + s.ebc[i]! * TAU / 3; s.ex[i] = s.x[p]! + cos(a) * 50; s.ey[i] = s.y[p]! + sin(a) * 50;
      sweep(s, p, s.ex[i]!, s.ey[i]!, 14); bite(w, s, p, i, 12, 30, 4, 8, 18);
    } else if (k === EK_NRC) { // recalled mouse: flies home at 9 px/frame, biting on the way
      const dx = s.x[p]! - s.ex[i]!, dy = s.y[p]! - s.ey[i]!, d = hypot(dx, dy) || 1;
      if (d < 20) { s.et[i] = 0; continue; }
      s.ex[i] = s.ex[i]! + dx / d * 9; s.ey[i] = s.ey[i]! + dy / d * 9; s.ea[i] = atan2(dy, dx);
      bite(w, s, p, i, 10, 99, 3, 5, 14, dx, dy);
    } else if (k === EK_NCOIN) { // bomb coin: arcs to the foe, explodes on its last frame
      const u = 1 - s.et[i]! / s.ebc[i]!; s.ex[i] = s.er[i]! + (s.ea[i]! - s.er[i]!) * u; s.ey[i] = s.eh[i]! + (s.ew[i]! - s.eh[i]!) * u;
      if (s.et[i] === 1) for (let q = 0; q < s.n; q++) if (live(s, p, q)) { const dx = s.x[q]! - s.ex[i]!, dy = s.y[q]! - s.ey[i]!, d = hypot(dx, dy) || 1; if (d < 70 + bodyR(s, q)) chHitQ(w, s, p, q, dx / d, dy / d, 10, 13, 34); }
      if (s.et[i] === 1) { jBurst(w, s.ex[i]!, s.ey[i]!, '#ffd23a', 22); addJ(w, 'shake', 6, 28); }
    }
  }
}

/** After the entity pass: shots of the mice home harder on the marked foe. */
export function nazrinPost(w: World, s: CombatState, p: number): void {
  const t = w.slice<TouhouState>('touhou');
  const tg = t.nTgF[p]! > s.gf ? t.nTg[p]! : -1, home = tg >= 0 && s.state[tg] !== PS.dead ? 0.09 : 0.03; // marked foe: mice shots home harder
  for (let b = 0; b < s.nb; b++) if (s.bnsf[b] && s.bowner[b] === p && !(s.bflags[b]! & BF.dead)) s.bhome[b] = home;
}
