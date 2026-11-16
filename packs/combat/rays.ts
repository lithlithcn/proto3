import { type World, atan2, cos, hypot, sin } from '@kernel';
import { addEnt } from './ents';
import { segD } from './bullets/update';
import { hit } from './player/hit';
import { parryFx } from './player/parry';
import { foe } from './target';
import { BF, PS, type CombatState } from './state';
import { bodyR } from './stats';

/** Entity kind of sustained rays (legacy `cray`: Marisa, Okina, spells...). Kinds 10-19 are shared combat kinds; 1-9 per character, >= 100 items. */
export const EK_RAY = 10;
export const RAYF = { warn: 1, follow: 2, clear: 4, nodash: 8 } as const;

export interface RayOpts { /** presentation colour 0xRRGGBB (default white) */ c?: number;
  /** Total frames. */ T: number; /** Warning frames before it fires. */ tele?: number; w?: number; len?: number; dmg?: number; ev?: number; kb?: number; stun?: number;
  a?: number; spin?: number; push?: number; flags?: number; /** Origin (default: the owner). */ x?: number; y?: number;
}
/** Legacy chRay: a straight ray that telegraphs for `tele` frames, then hurts everyone it crosses every `ev` frames; it can follow its owner, rotate (`spin`), push the owner back, and erase light bullets (`clear`). */
export function fireRay(s: CombatState, p: number, o: RayOpts): void {
  const i = addEnt(s, EK_RAY, p, o.T, o.x ?? s.x[p]!, o.y ?? s.y[p]!);
  if (i < 0) return;
  s.ebc[i] = o.T; s.eh[i] = o.tele ?? 20; s.ew[i] = o.w ?? 10; s.er[i] = o.len ?? 900; s.ed[i] = o.dmg ?? 2; s.eg[i] = o.ev ?? 6; s.ekb[i] = o.kb ?? 4; s.est[i] = o.stun ?? 14;
  s.ec[i] = o.c !== undefined ? o.c + 1 : 0; s.ea[i] = o.a ?? s.aim[p]!; s.evx[i] = o.spin ?? 0; s.evy[i] = o.push ?? 0; s.efl[i] = o.flags ?? RAYF.follow;
}

/** Ray step (legacy chStep, ray part): runs after every character hook. */
export function stepRay(w: World, s: CombatState, i: number): void {
  {
    if (s.ek[i] !== EK_RAY || s.et[i]! <= 0) return;
    const o = s.eo[i]!, f = s.efl[i]!;
    if (f & RAYF.follow) { s.ex[i] = s.x[o]!; s.ey[i] = s.y[o]!; }
    s.ea[i] = s.ea[i]! + s.evx[i]!;
    const a = s.ea[i]!, c = cos(a), n = sin(a), warming = s.ebc[i]! - s.et[i]! < s.eh[i]!;
    if (s.evy[i]! && !((f & RAYF.warn) && warming)) { s.vx[o] = s.vx[o]! - c * s.evy[i]!; s.vy[o] = s.vy[o]! - n * s.evy[i]!; }
    if (warming) return;
    const x = s.ex[i]!, y = s.ey[i]!, x2 = x + c * s.er[i]!, y2 = y + n * s.er[i]!, wd = s.ew[i]!;
    if (f & RAYF.clear) for (let b = 0; b < s.nb; b++) if (!(s.bflags[b]! & (BF.dead | BF.heavy)) && s.bowner[b] !== o && segD(s.bx[b]!, s.by[b]!, x, y, x2, y2) < wd + s.br[b]!) s.bflags[b] = s.bflags[b]! | BF.dead;
    for (let q = 0; q < s.n; q++) {
      if (q === o || s.state[q] === PS.dead || s.inv[q]! > 0 || !foe(s, o, q) || ((f & RAYF.nodash) && s.state[q] === PS.dash) || s.ehc[i * 32 + q]! > s.gf || segD(s.x[q]!, s.y[q]!, x, y, x2, y2) >= bodyR(s, q) + wd) continue;
      s.ehc[i * 32 + q] = s.gf + s.eg[i]!;
      if (s.state[q] === PS.parry) parryFx(w, s, q); else hit(w, s, q, o, c, n, { dmg: s.ed[i]!, kb: s.ekb[i]!, stun: s.est[i]! }, -1, 1, true);
    }
  }
}

/** Per-bullet modifier `bmst` (Marisa's light shots): slow down for 14 frames after launch, then speed up from frame 24 until speed 10 (legacy chStep bullet loop). */
export function waveBullets(s: CombatState): void {
  for (let i = 0; i < s.nb; i++) {
    if ((s.bflags[i]! & BF.dead) || !s.bwav[i]) continue;
    const sp = hypot(s.bvx[i]!, s.bvy[i]!), a = atan2(s.bvy[i]!, s.bvx[i]!) + sin(s.gf * 0.25 + s.bph[i]!) * s.bwav[i]!;
    s.bvx[i] = cos(a) * sp; s.bvy[i] = sin(a) * sp;
  }
}
export function bulletMods(s: CombatState): void {
  for (let i = 0; i < s.nb; i++) {
    if (s.bflags[i]! & BF.dead) continue;
    if (s.bmst[i]) {
      const g = s.gf - s.bmst[i]!, sp = hypot(s.bvx[i]!, s.bvy[i]!);
      if (g < 14 && sp > 1.6) { s.bvx[i] = s.bvx[i]! * 0.9; s.bvy[i] = s.bvy[i]! * 0.9; } else if (g > 24 && sp < 10) { s.bvx[i] = s.bvx[i]! * 1.07; s.bvy[i] = s.bvy[i]! * 1.07; }
    }
    if (s.bacc[i]! && hypot(s.bvx[i]!, s.bvy[i]!) < s.bacc[i]!) { s.bvx[i] = s.bvx[i]! * 1.05; s.bvy[i] = s.bvy[i]! * 1.05; } // slower than `acc`: +5 %/frame (after the clamp of the pattern pass)
    if (s.bflags[i]! & BF.hgr) for (let q = 0; q < s.n; q++) { // gravity bullets (Hecatia's Earth body) shove foes within 80 px away
      if (q === s.bowner[i] || s.state[q] === PS.dead || !foe(s, s.bowner[i]!, q)) continue;
      const dx = s.bx[i]! - s.x[q]!, dy = s.by[i]! - s.y[q]!, d = hypot(dx, dy);
      if (d < 80 && d > 1) { s.vx[q] = s.vx[q]! + dx / d * 0.22; s.vy[q] = s.vy[q]! + dy / d * 0.22; }
    }
    if (s.bct[i] === s.gf) { const a = atan2(s.bty[i]! - s.by[i]!, s.btx[i]! - s.bx[i]!); s.bvx[i] = cos(a) * 7; s.bvy[i] = sin(a) * 7; } // Cranberry Trap: converge on the point stored at launch
  }
}
