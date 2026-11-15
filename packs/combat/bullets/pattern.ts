import { BTN, type World, atan2, clamp, cos, hypot, sin } from '@kernel';
import { BF, MAX_B, PS, type CombatState } from '../state';
import { bulletArrays, clearBullet, stamp } from './arrays';
import { ISRC } from '../moves';

/** Programmable bullets for spell cards (legacy sB / hB + `fn` closures). Behaviours are DATA (kind + 3 params + age), never closures: they live in typed arrays and survive snapshot/rollback. */
export const BK = { none: 0, home: 1, launch: 2, orbit: 3, moth: 4, dollH: 5, dollK: 6, meteor: 7 } as const;
export const SH = { orb: 0, rice: 1, kunai: 2, star: 3, bubble: 4, pill: 5, flea: 6 } as const;
export interface PatOpts { r?: number; life?: number; col?: number; sh?: number; rot?: number; drg?: number; acc?: number; vmax?: number; kind?: number; p0?: number; p1?: number; p2?: number; grp?: number }

/** Spell RNG: the legacy mulberry32 (so patterns are comparable bit-for-bit), seeded from state so rollback restores it. */
export function spRand(s: CombatState): number {
  s.spSeed = (s.spSeed + 0x6d2b79f5) | 0;
  let t = Math.imul(s.spSeed ^ (s.spSeed >>> 15), 1 | s.spSeed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function fill(s: CombatState, i: number, p: number, x: number, y: number, a: number, sp: number, o: PatOpts, heavy: boolean): void {
  clearBullet(bulletArrays(s), i); stamp(s, i);
  s.bx[i] = x; s.by[i] = y; s.bvx[i] = cos(a) * sp; s.bvy[i] = sin(a) * sp; s.bang[i] = a; s.bowner[i] = p; s.blife[i] = o.life ?? 320; s.bcol[i] = o.col ?? 0;
  s.bsh[i] = o.sh ?? 0; s.brot[i] = o.rot ?? 0; s.bdrg[i] = o.drg ?? 0; s.bacc[i] = o.acc ?? 0; s.bvmax[i] = o.vmax ?? 0; s.bkind[i] = o.kind ?? 0; s.bp0[i] = o.p0 ?? 0; s.bp1[i] = o.p1 ?? 0; s.bp2[i] = o.p2 ?? 0; s.bgrp[i] = o.grp ?? 0;
  if (heavy) { s.br[i] = o.r ?? 11; s.bdmg[i] = 5; s.bkb[i] = 7; s.bstun[i] = 24; s.barm[i] = 0; s.bdist[i] = 999; s.bmult[i] = 1; s.bmv[i] = ISRC.sph; s.bflags[i] = BF.heavy; }
  else { s.br[i] = o.r ?? 4; s.bdmg[i] = 1; s.bmv[i] = 0; }
}
/** Small decorative bullet (legacy sB): refused outside the map or when the pool is full. Returns the index or -1. */
export function sB(s: CombatState, p: number, x: number, y: number, a: number, sp: number, o: PatOpts = {}): number {
  if (s.nb >= MAX_B || x < 0 || y < 0 || x > s.mapW || y > s.mapH) return -1;
  const i = s.nb++; fill(s, i, p, x, y, a, sp, o, false); return i;
}
/** Big hurting danmaku placed anywhere (legacy hB/xBall): armed at once; becomes a breaker if the caster holds Parry. */
export function hB(w: World, s: CombatState, p: number, x: number, y: number, a: number, sp: number, o: PatOpts = {}): number {
  if (s.nb >= MAX_B) return -1;
  const i = s.nb++; fill(s, i, p, x, y, a, sp, o, true);
  if (s.state[p] === PS.spell && (w.buttons(p) & BTN.parry)) s.bflags[i] = BF.heavy | BF.breaker;
  return i;
}
/** Angle from (x,y) to the caster's target (or to the caster). */
export const tgA = (s: CombatState, p: number, x: number, y: number): number => { const o = s.tgt[p]! >= 0 ? s.tgt[p]! : p; return atan2(s.y[o]! - y, s.x[o]! - x); };

const setV = (s: CombatState, i: number, a: number, sp: number): void => { s.bvx[i] = cos(a) * sp; s.bvy[i] = sin(a) * sp; s.bang[i] = a; };

/** Curve, drag, accelerate (clamped to `vmax`, default 9) of one bullet. */
function motionOne(s: CombatState, i: number): void {
  const rot = s.brot[i]!, drg = s.bdrg[i]!, acc = s.bacc[i]!;
  if (rot) { const c = cos(rot), sn = sin(rot), vx = s.bvx[i]!; s.bvx[i] = vx * c - s.bvy[i]! * sn; s.bvy[i] = vx * sn + s.bvy[i]! * c; }
  if (drg) { s.bvx[i] = s.bvx[i]! * drg; s.bvy[i] = s.bvy[i]! * drg; }
  if (acc) {
    const l = hypot(s.bvx[i]!, s.bvy[i]!) || 1e-3, n = clamp(l + acc, 0, s.bvmax[i]! || 9);
    s.bvx[i] = s.bvx[i]! * n / l; s.bvy[i] = s.bvy[i]! * n / l;
    if (l < 2e-3) setV(s, i, s.bang[i]!, n);
  }
}

/**
 * Legacy step wrapper (runs right after the base step, before the character hooks): per live bullet curve, drag, accelerate, then its behaviour kind and heading.
 * Children spawned by a behaviour are visited in the same pass, like legacy's for-of over a growing array. Only on frames where time advances.
 */
export function motion(s: CombatState): void {
  for (let i = 0; i < s.nb; i++) {
    if (s.bflags[i]! & BF.dead) continue;
    motionOne(s, i);
    const kind = s.bkind[i]!;
    if (kind) { s.bag[i] = s.bag[i]! + 1; run(s, i, kind, s.bag[i]!); }
    if (s.bvx[i] || s.bvy[i]) s.bang[i] = atan2(s.bvy[i]!, s.bvx[i]!);
  }
}

function run(s: CombatState, i: number, kind: number, ag: number): void {
  const p = s.bowner[i]!;
  switch (kind) {
    case BK.home: if (ag < s.bp0[i]!) { // curve toward the target fixed at cast (bp2) for the first bp0 frames, at most bp1 rad/frame
      const o = s.bp2[i]!, t = atan2(s.y[o]! - s.by[i]!, s.x[o]! - s.bx[i]!), d = atan2(sin(t - s.bang[i]!), cos(t - s.bang[i]!));
      setV(s, i, s.bang[i]! + clamp(d, -s.bp1[i]!, s.bp1[i]!), hypot(s.bvx[i]!, s.bvy[i]!));
    } break;
    case BK.launch: if (ag === s.bp0[i]!) setV(s, i, s.bp1[i]!, s.bp2[i]!); break; // at age bp0: heading bp1, speed bp2
    case BK.orbit: // ring of phase bp0, direction bp1, ring index bp2 around the caster, then released along the tangent
      if (ag < 80) { const a = s.bp0[i]! + s.bp1[i]! * ag * 0.04, R = 30 + ag * (1 + s.bp2[i]! * 0.55); s.bx[i] = s.x[p]! + cos(a) * R; s.by[i] = s.y[p]! + sin(a) * R; s.bvx[i] = 0; s.bvy[i] = 0; s.bang[i] = a + s.bp1[i]! * 1.5707963267948966; }
      else if (ag === 80) setV(s, i, s.bang[i]!, 2.6);
      break;
    case BK.moth: {
      if (ag === 45) s.bcol[i] = 0xff5a2a;
      if (ag > 45) {
        const dx = s.x[p]! - s.bx[i]!, dy = s.y[p]! - s.by[i]!, d = hypot(dx, dy) || 1, f = Math.min(0.3, (ag - 45) * 0.005);
        s.bvx[i] = s.bvx[i]! * 0.97 + dx / d * f * 3; s.bvy[i] = s.bvy[i]! * 0.97 + dy / d * f * 3;
        if (d < 24) { s.bflags[i] = s.bflags[i]! | BF.dead; for (let j = 0; j < 3; j++) sB(s, p, s.bx[i]!, s.by[i]!, s.bang[i]! + 3.141592653589793 + (j - 1) * 0.8, 0.4, { sh: SH.flea, r: 2.5, col: 0xff9a6a, acc: 0.03, vmax: 2.4, life: 300 }); }
      }
    } break;
    case BK.dollH: if (ag === 34) { s.bdrg[i] = 0; setV(s, i, tgA(s, p, s.bx[i]!, s.by[i]!) + (spRand(s) - 0.5) * 0.1, 0); s.bacc[i] = 0.12; s.bvmax[i] = 5.2; s.bcol[i] = 0xff5a7a; } break;
    case BK.dollK: if (ag === 34) { s.bdrg[i] = 0; setV(s, i, s.bang[i]! + 1.5707963267948966, 0); s.bacc[i] = 0.1; s.bvmax[i] = 4; } break;
    case BK.meteor: if (ag === 70) { s.bdrg[i] = 0; s.bacc[i] = 0.035; s.bvmax[i] = 3.4; } break;
  }
}
