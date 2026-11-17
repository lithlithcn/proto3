import { type ItemDef, addJ, jBig } from '@pack/combat/api';
import type { ThemedState } from '../state';

/** The Gate Is Closed (Hong Meiling): a 10 s gate at your x (logic: themed/meiling.ts). */
export default { name: 'The Gate Is Closed', color: '#3fbf6f', ch: 'Hong Meiling', desc: '10 s: a gate splits the arena. On your side, a rainbow kick hits anyone who gets close to you.', order: 14, sfx: 'blockshield',
  give({ w, s, p }) {
    const T = w.slice<ThemedState>('themed'); T.wallX = s.x[p]!; T.wallO = p; T.wallT = 600;
    for (let q = 0; q < s.n; q++) T.gside[q] = s.x[q]! >= s.x[p]! ? 1 : -1;
    jBig(w, 'THE GATE IS CLOSED', '#3fbf6f', 44); addJ(w, 'shake', 14, 30);
  } } satisfies ItemDef;
