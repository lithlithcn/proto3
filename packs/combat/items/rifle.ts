import { atan2, cos, hypot, sin } from '@kernel';
import type { PCtx } from '../input';
import { bulletArrays, clearBullet, stamp } from '../bullets/arrays';
import { ISRC } from '../moves';
import { BF, MAX_B, PS, type CombatState } from '../state';

/** Item `white` (Rifle): 2 shots; Heavy aims for 40 frames then fires a thin, piercing, deadly bolt. A parried bolt becomes `oneshot` and kills its shooter. */
export const RIFLE = { start: 40, spd: 34, r: 5, dmg: 22, kb: 22, stun: 55, arm: 0, life: 90 };

export const startRifle = (s: CombatState, p: number): void => { s.state[p] = PS.rifle; s.t[p] = 0; };

/** State `rifle` (legacy updP case 'rifle'): slow steering while aiming, then fire. */
export function updRifle(c: PCtx): void {
  const { s, p } = c;
  s.t[p] = s.t[p]! + 1; s.vx[p] = s.vx[p]! * 0.8 + c.ix * 0.5; s.vy[p] = s.vy[p]! * 0.8 + c.iy * 0.5;
  if (s.t[p]! >= RIFLE.start) fireRifle(s, p);
}

function fireRifle(s: CombatState, p: number): void {
  if (s.state[p] === PS.rifle) s.state[p] = PS.idle;
  s.rifle[p]!--;
  const a = s.aim[p]!, c = cos(a), n = sin(a);
  if (s.nb < MAX_B) {
    const i = s.nb++;
    clearBullet(bulletArrays(s), i); stamp(s, i);
    s.bx[i] = s.x[p]! + c * 22; s.by[i] = s.y[p]! + n * 22; s.bvx[i] = c * RIFLE.spd; s.bvy[i] = n * RIFLE.spd; s.br[i] = RIFLE.r; s.bdmg[i] = RIFLE.dmg; s.blife[i] = RIFLE.life; s.bmult[i] = 1;
    s.bowner[i] = p; s.bflags[i] = BF.heavy | BF.pierce | BF.rifle; s.bmv[i] = ISRC.rifle; s.bkb[i] = RIFLE.kb; s.bstun[i] = RIFLE.stun; s.barm[i] = RIFLE.arm;
  }
  s.vx[p] = s.vx[p]! - c * 8; s.vy[p] = s.vy[p]! - n * 8;
}

/** Item `camera` (Tengu Camera): 3 snaps. Heavy erases foreign bullets in a 380 px / ±0.55 rad cone and stuns hit foes for 40 frames (4 damage). */
export const SNAP = { range: 380, half: 0.55, dmg: 4, stun: 40 };
export function snap(s: CombatState, p: number): void {
  s.cam[p]!--;
  const a = s.aim[p]!, c = cos(a), n = sin(a), x = s.x[p]!, y = s.y[p]!;
  const inF = (px: number, py: number): boolean => { const rx = px - x, ry = py - y; return hypot(rx, ry) < SNAP.range && Math.abs(atan2(ry * c - rx * n, rx * c + ry * n)) < SNAP.half; };
  for (let i = 0; i < s.nb; i++) if (s.bowner[i] !== p && inF(s.bx[i]!, s.by[i]!)) s.bflags[i] = s.bflags[i]! | BF.dead;
  for (let q = 0; q < s.n; q++) {
    if (q === p || s.state[q] === PS.dead || s.inv[q]! > 0 || !inF(s.x[q]!, s.y[q]!)) continue;
    s.hp[q] = s.hp[q]! - SNAP.dmg; s.state[q] = PS.parrystun; s.t[q] = SNAP.stun; s.vx[q] = 0; s.vy[q] = 0; s.charging[q] = 0;
  }
}
