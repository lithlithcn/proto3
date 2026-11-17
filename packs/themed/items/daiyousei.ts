import { type ItemDef, addEnt, jBig } from '@pack/combat/api';
import { xOnR, xR } from '../fire';
import { EK_EFAIRY } from '../daiyousei';

/** Fairy Ambush (Daiyousei): 8 s, fairies line the screen edges and fire at random foes (logic: themed/daiyousei.ts). */
const R: number[] = [], Q: number[] = [];
export default { name: 'Fairy Ambush', color: '#7fe0a0', ch: 'Daiyousei', desc: '8 s: 7 fairies appear at the edges and shoot at your foes.', order: 12, sfx: 'appear',
  give({ w, s, p }) { xR(s, R); for (let i = 0; i < 7; i++) { xOnR(R, (i + 0.5) / 7, Q); const e = addEnt(s, EK_EFAIRY, p, 480, Q[0]!, Q[1]!); if (e >= 0) s.eg[e] = i * 5; } jBig(w, 'FAIRY AMBUSH!', '#7fe0a0', 44); } } satisfies ItemDef;
