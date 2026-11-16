import { type World, atan2, cos, hypot, sin } from '@kernel';
import { BF, PS, T, TAU, customHeavy, entsOf, foe, hit, jBurst, jTxt, moveOf, parryFx, pushJ, spark, type CombatState, sfx } from '@pack/combat/api';
import type { TouhouState } from '../../state';
import { EK_BAR, EK_ORB } from './kinds';

const OS: number[] = [], BARS: number[] = [];
/** Legacy `inS`: signed side of the barrier rectangle a circle (x,y,r) overlaps, 0 = outside. */
function inBar(s: CombatState, z: number, x: number, y: number, r: number): number {
  const c = cos(s.ea[z]!), sn = sin(s.ea[z]!), u = (x - s.ex[z]!) * c + (y - s.ey[z]!) * sn, v = -(x - s.ex[z]!) * sn + (y - s.ey[z]!) * c;
  return Math.abs(u) < s.ew[z]! + r && Math.abs(v) < s.eh[z]! + r ? (v || 1e-3) : 0;
}
const canHit = (s: CombatState, p: number, q: number): boolean => q !== p && s.state[q] !== PS.dead && s.inv[q]! <= 0 && foe(s, p, q);

/** Reimu per-frame hook (legacy `tick`): back-heavy orbs split in six, yin-yang orbs live (bounce, gather, launch, hit), Border deletes bullets / stuns melee. */
export function reimuTick(w: World, s: CombatState, p: number): void {
  const t = w.slice<TouhouState>('touhou');
  for (let i = 0; i < s.nb; i++) {
    if (!s.bspl[i] || s.bowner[i] !== p || (s.bflags[i]! & BF.dead) || s.gf < s.bspl[i]!) continue;
    s.bflags[i] = s.bflags[i]! | BF.dead;
    for (let k = 0; k < 6; k++) customHeavy(s, p, s.bx[i]!, s.by[i]!, k * TAU / 6 + s.gf * 0.1, 3.4, 5, { dmg: 3, kb: 3, stun: 12, arm: 0 }, 110, 0x9ab4ff);
  }
  const nOs = entsOf(s, EK_ORB, p, OS), nBars = entsOf(s, EK_BAR, p, BARS), focus = s.focus[p] !== 0;
  if (!focus) t.rGW[p] = 0;
  if (t.rG[p]) { // gathered orbs: released on focus end, timeout (4 s), no orbs, or a spell
    const out = s.gf - t.rGT[p]! >= 240;
    if (!focus || out || !nOs || s.state[p] === PS.spell) {
      for (let k = 0; k < nOs; k++) { const e = OS[k]!; s.evx[e] = cos(t.rA[p]!) * 6.5; s.evy[e] = sin(t.rA[p]!) * 6.5; s.eg[e] = 0; s.et[e] = Math.max(s.et[e]!, 240); s.ehc.fill(0, e * 32, e * 32 + 32); }
      t.rG[p] = 0; t.rGC[p] = s.gf + 60; if (out) t.rGW[p] = 1;
      if (nOs) sfx(w, 'tan00', 0.6); if (nOs) pushJ(w, 'RINGS', 'x', s.x[p]!, 'y', s.y[p]!, 'r', 0, 'm', 50, 't', 12, 'c', '#fff');
    }
  } else if (focus && !t.rGW[p] && s.gf >= t.rGC[p]! && nOs && s.state[p] !== PS.spell) { t.rG[p] = 1; t.rGT[p] = s.gf; t.rA[p] = s.aim[p]!; sfx(w, 'se_kira00', 0.4); }
  const ghost = t.rG[p] !== 0;
  for (let k = 0; k < nOs; k++) {
    const e = OS[k]!;
    s.eg[e] = ghost ? 1 : 0;
    if (ghost) { // spirit form: drift to a ring in front of her
      const ra = nOs > 1 ? 34 : 0, tx = s.x[p]! + cos(s.aim[p]!) * 70 + cos(k * TAU / nOs + s.gf * 0.05) * ra, ty = s.y[p]! + sin(s.aim[p]!) * 70 + sin(k * TAU / nOs + s.gf * 0.05) * ra;
      s.ex[e] = s.ex[e]! + (tx - s.ex[e]!) * 0.1; s.ey[e] = s.ey[e]! + (ty - s.ey[e]!) * 0.1;
      continue;
    }
    s.ex[e] = s.ex[e]! + s.evx[e]!; s.ey[e] = s.ey[e]! + s.evy[e]!;
    const r = s.er[e]!;
    if (s.ex[e]! < r) { s.ex[e] = r; s.evx[e] = Math.abs(s.evx[e]!); } else if (s.ex[e]! > s.mapW - r) { s.ex[e] = s.mapW - r; s.evx[e] = -Math.abs(s.evx[e]!); }
    if (s.ey[e]! < r) { s.ey[e] = r; s.evy[e] = Math.abs(s.evy[e]!); } else if (s.ey[e]! > s.mapH - r) { s.ey[e] = s.mapH - r; s.evy[e] = -Math.abs(s.evy[e]!); }
    for (let b = 0; b < nBars; b++) { // bouncing off her own Border re-aims the orb at the nearest foe
      if (s.ebc[e]! > s.gf || !inBar(s, BARS[b]!, s.ex[e]!, s.ey[e]!, r)) continue;
      let q = -1, bd = 900;
      for (let c = 0; c < s.n; c++) if (c !== p && s.state[c] !== PS.dead && foe(s, p, c)) { const d = hypot(s.x[c]! - s.ex[e]!, s.y[c]! - s.ey[e]!); if (d < bd) { bd = d; q = c; } }
      const sp = Math.min(10, hypot(s.evx[e]!, s.evy[e]!) * 1.4), a2 = q >= 0 ? atan2(s.y[q]! - s.ey[e]!, s.x[q]! - s.ex[e]!) : atan2(s.evy[e]!, s.evx[e]!) + Math.PI;
      s.evx[e] = cos(a2) * sp; s.evy[e] = sin(a2) * sp; s.ebc[e] = s.gf + 20; pushJ(w, 'RINGS', 'x', s.ex[e]!, 'y', s.ey[e]!, 'r', 0, 'm', 40, 't', 12, 'c', '#9fe0ff'); sfx(w, 'shoot3', 0.4);
    }
    if (hypot(s.evx[e]!, s.evy[e]!) > 4.6) { s.evx[e] = s.evx[e]! * 0.995; s.evy[e] = s.evy[e]! * 0.995; }
    for (let b = 0; b < s.nb; b++) { // orbs erase foe light bullets
      if ((s.bflags[b]! & (BF.dead | BF.heavy)) || s.bowner[b] === p || !foe(s, s.bowner[b]!, p)) continue;
      const rr = r + s.br[b]!;
      if (Math.abs(s.bx[b]! - s.ex[e]!) < rr && hypot(s.bx[b]! - s.ex[e]!, s.by[b]! - s.ey[e]!) < rr) s.bflags[b] = s.bflags[b]! | BF.dead;
    }
    for (let q = 0; q < s.n; q++) {
      if (!canHit(s, p, q) || s.ehc[e * 32 + q]! > s.gf) continue;
      const dx = s.x[q]! - s.ex[e]!, dy = s.y[q]! - s.ey[e]!, d = hypot(dx, dy) || 1;
      if (d > r + T.BODY_R) continue;
      s.ehc[e * 32 + q] = s.gf + 30;
      const sp = hypot(s.evx[e]!, s.evy[e]!); s.evx[e] = -dx / d * sp; s.evy[e] = -dy / d * sp;
      if (s.state[q] === PS.parry) { parryFx(w, s, q); continue; }
      hit(w, s, q, p, dx / d, dy / d, { dmg: 8, kb: 9, stun: 26 }, -1, 1, true); jBurst(w, s.ex[e]!, s.ey[e]!, '#ff3a4a', 8);
    }
  }
  for (let b = 0; b < nBars; b++) {
    const z = BARS[b]!;
    for (let i = 0; i < s.nb; i++) if (!(s.bflags[i]! & BF.dead) && s.bowner[i] !== p && foe(s, s.bowner[i]!, p) && inBar(s, z, s.bx[i]!, s.by[i]!, s.br[i]!)) { s.bflags[i] = s.bflags[i]! | BF.dead; spark(w, s.bx[i]!, s.by[i]!); s.efl[z] = s.gf; }
    for (let q = 0; q < s.n; q++) { // melee attackers inside the Border are stunned (not heavy shots)
      if (!canHit(s, p, q) || s.state[q] !== PS.atk) continue;
      const m = moveOf(w, s, q);
      if (!m || m.spd || s.t[q]! < m.start || s.ehc[z * 32 + q]! > s.gf || !inBar(s, z, s.x[q]!, s.y[q]!, T.BODY_R + m.range * 0.8)) continue;
      s.ehc[z * 32 + q] = s.gf + 90; s.efl[z] = s.gf;
      hit(w, s, q, p, 0, 0, { dmg: 2, kb: 0, stun: 75 }, -1, 1, true); s.mvId[q] = 0; jTxt(w, s.x[q]!, s.y[q]! - 34, 'STUN!', '#7cc8ff', 16); sfx(w, 'shield-break', 0.7); jBurst(w, s.x[q]!, s.y[q]!, '#7cc8ff', 16);
    }
  }
}
