import { addJ, big, flash, maxJ, sfx, sfxStop } from '../jfx';
import { PI, type World, clamp, cos, sin } from '@kernel';
import { spRand } from '../bullets/pattern';
import { bulletArrays, clearBullet, stamp } from '../bullets/arrays';
import { hit } from '../player/hit';
import { parryFx } from '../player/parry';
import { ISRC } from '../moves';
import { BF, BT, MAX_B, PS, type CombatState } from '../state';
import { TAU } from '../tuning';
import { bodyR } from '../stats';

/** Item `spark` (Master Spark): 390 frames. 300 charging (aim locked, then turning slowly), then 90 frames of a wide beam that deletes bullets and hits foes every 12 frames. */
export const SPARK = { time: 390, fire: 90, turn: 0.012, bulletW: 110, hitW: 100, hit: { dmg: 5, kb: 10, stun: 16 }, mult: 1.4, rainbow: [0xff4a4a, 0xffa63a, 0xffe83a, 0x5cff7a, 0x4ab3ff, 0xc06cff] };

/** Per-player tick (legacy updWorld, after the elixir): charge, beam, star burst, deletion, damage. */
export function updateSpark(w: World, s: CombatState, p: number): void {
  if (s.spk[p]! <= 0) return;
  s.spk[p]!--;
  if (s.spk[p]! >= SPARK.fire) { s.spkA[p] = s.aim[p]!; return; }
  const da = ((s.aim[p]! - s.spkA[p]!) % TAU + TAU * 1.5) % TAU - PI;
  s.spkA[p] = s.spkA[p]! + clamp(da, -SPARK.turn, SPARK.turn);
  if (s.spk[p] === 89) { sfxStop(w, 'rsrc' + p); sfx(w, 'se_enep01'); sfx(w, 'mastersparkrelease'); big(w, 'MASTER SPARK!', '#fff5a0', 62); flash(w, 0.4, '#fff5a0'); maxJ(w, 'chroma', 18); maxJ(w, 'zblur', 0.1); }
  addJ(w, 'shake', 1.2, 30);
  const c = cos(s.spkA[p]!), n = sin(s.spkA[p]!), x = s.x[p]!, y = s.y[p]!;
  if (s.gf % 3 === 0) for (let i = 0; i < 3 && s.nb < MAX_B; i++) { // stars all around
    const a = spRand(s) * TAU, v = 2.2 + spRand(s) * 2, col = SPARK.rainbow[(spRand(s) * 6) | 0]!, b = s.nb++;
    clearBullet(bulletArrays(s), b); stamp(s, b);
    s.bx[b] = x; s.by[b] = y; s.bvx[b] = cos(a) * v; s.bvy[b] = sin(a) * v; s.br[b] = 6; s.bdmg[b] = 1; s.blife[b] = 220; s.bowner[b] = p; s.bcol[b] = col; s.bmult[b] = 1; s.btag[b] = BT.star;
  }
  for (let i = 0; i < s.nb; i++) {
    if (s.bowner[i] === p || (s.bflags[i]! & BF.frozen)) continue;
    const rx = s.bx[i]! - x, ry = s.by[i]! - y;
    if (rx * c + ry * n > 0 && Math.abs(ry * c - rx * n) < SPARK.bulletW) s.bflags[i] = s.bflags[i]! | BF.dead;
  }
  for (let q = 0; q < s.n; q++) {
    if (q === p || s.state[q] === PS.dead || s.inv[q]! > 0 || s.sCD[q]! > s.gf) continue;
    const rx = s.x[q]! - x, ry = s.y[q]! - y;
    if (rx * c + ry * n > 0 && Math.abs(ry * c - rx * n) < SPARK.hitW + bodyR(s, q)) {
      s.sCD[q] = s.gf + 12;
      if (s.state[q] === PS.parry) { parryFx(w, s, q); continue; }
      hit(w, s, q, p, c, n, SPARK.hit, ISRC.spark, SPARK.mult, false);
    }
  }
}
