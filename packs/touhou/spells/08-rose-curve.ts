import { cos, sin } from '@kernel';
import { BK, SH, hB, sB, type SpellDef } from '@pack/combat/api';
import { TAU } from './palette';

/** Flower Sign「Blooming Rose Curve」: a rose of danmaku placed on the curve, then launched outward (behaviour BK.launch). */
export default {
  name: 'Flower Sign「Blooming Rose Curve」', loop: 110,
  fn({ w, s, p, k }) {
    if (k % 110) return;
    const rt = k * 0.013, cx = s.x[p]!, cy = s.y[p]!;
    for (let i = 0; i < 40; i++) { const th = i * TAU / 40, R = 135 * Math.abs(cos(2.5 * th)), a = th + rt; hB(w, s, p, cx + cos(a) * R, cy + sin(a) * R, a, 0, { col: i % 2 ? 0xff7ce0 : 0xffb0e8, life: 400, kind: BK.launch, p0: 30, p1: a, p2: 0.5 + R / 55 }); }
    for (let i = 0; i < 48; i++) { const th = i * TAU / 48, R = 60 * Math.abs(cos(2.5 * th)), a = th + rt + TAU / 80; sB(s, p, cx + cos(a) * R, cy + sin(a) * R, a, 0, { sh: SH.rice, col: 0xfff0fa, life: 360, kind: BK.launch, p0: 30, p1: a, p2: 0.4 + R / 50 }); }
  },
} satisfies SpellDef;
