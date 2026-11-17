import { addB } from '../bullets/pattern';
import { patternHeavy } from '../bullets/spawn';
import type { SpellDef } from '../character';
import { flash, maxJ } from '../jfx';
import { MOVES, SRC } from '../moves';
import { TAU } from '../tuning';

const RB = [0xff4a4a, 0xffa63a, 0xffe83a, 0x5cff7a, 0x4ab3ff, 0xc06cff], RBS = ['#ff4a4a', '#ffa63a', '#ffe83a', '#5cff7a', '#4ab3ff', '#c06cff'];
/** The Last Word card (legacy ULT, line 667): rainbow spiral of big balls, an aimed white fan, a few small ones; a flash every 90 frames. */
export const ULT: SpellDef = {
  name: 'Last Word「Prismatic Danmaku Storm」', loop: 60,
  fn({ w, s, p, k }) {
    if (k % 10 === 0) for (let i = 0; i < 8; i++) patternHeavy(w, s, p, k * 0.05 + i * TAU / 8, 3.2, MOVES.heavyN, SRC.heavyN, 300, RB[i % 6]!, 0);
    if (k % 45 === 20) for (let i = 0; i < 5; i++) patternHeavy(w, s, p, s.aim[p]! + (i - 2) * 0.22, 5, MOVES.heavyF, SRC.heavyF, 240, 0xffffff, 0);
    if (k % 8 === 0) for (let i = 0; i < 3; i++) addB(s, p, -k * 0.04 + i * TAU / 3, 2.4, { life: 200, col: RB[((k / 8 + i) | 0) % 6]! });
    if (k % 90 === 0) { maxJ(w, 'focusL', 0.6); flash(w, 0.15, RBS[((k / 90) | 0) % 6]!); }
  },
};
