import { type ShotCtx, lightBullet } from '@pack/combat/api';
import { cos, sin } from '@kernel';

/** Yin-yang option offsets (legacy rOpt): lv options in a fixed fan; focus pulls them forward/closer. */
const OPT: number[][][] = [
  [[0, 30, 0, 20]],
  [[-30, 8, -16, 20], [30, 8, 16, 20]],
  [[-30, 8, -16, 20], [30, 8, 16, 20], [0, 32, 0, 30]],
  [[-30, 8, -16, 20], [30, 8, 16, 20], [-16, 32, -8, 30], [16, 32, 8, 30]],
];
function optPos(c: ShotCtx, i: number): [number, number] {
  const L = OPT[c.lv - 1]![i]!, lx = c.focus ? L[2]! : L[0]!, ly = c.focus ? L[3]! : L[1]!, a = c.s.aim[c.p]!, co = cos(a), si = sin(a);
  return [c.s.x[c.p]! - si * lx - co * ly, c.s.y[c.p]! + co * lx - si * ly];
}

/** Reimu light shot: twin amulets + one homing amulet per option (legacy CHR.reimu.shot). */
export function reimuShot(c: ShotCtx): void {
  const co = cos(c.a), si = sin(c.a);
  for (const o of [-10, 10]) {
    const b = lightBullet(c.s, c.p, c.a, 14, c.pm * 0.35, 4, 60, 0xff5060);
    if (b >= 0) { c.s.bx[b] = c.s.bx[b]! - si * o; c.s.by[b] = c.s.by[b]! + co * o; }
  }
  for (let i = 0; i < c.lv; i++) {
    const [x, y] = optPos(c, i), b = lightBullet(c.s, c.p, c.a, 8, c.pm * 0.3, 4, 120, 0xffffff);
    if (b >= 0) { c.s.bx[b] = x + co * 8; c.s.by[b] = y + si * 8; c.s.bhome[b] = 0.06; }
  }
}
