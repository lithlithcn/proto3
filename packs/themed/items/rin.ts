import { clamp } from '@kernel';
import { type ItemDef, addEnt, jBig, spRand } from '@pack/combat/api';
import { EK_DECOY } from '../rin';
import type { ThemedState } from '../state';

/** Anonymous Fairy (Rin Satsuki): 8 s anonymous mode + 5 decoys copying your moves (logic: themed/rin.ts; the look: render CX.anon). */
export default { name: 'Anonymous Fairy', color: '#9aa', ch: 'Rin Satsuki', desc: '8 s: everyone becomes an identical grey silhouette, the HUD vanishes and 5 decoys copy your moves. Who is who?', order: 13, sfx: 'dissapear',
  give({ w, s, p }) {
    w.slice<ThemedState>('themed').anon = 480;
    for (let i = 0; i < 5; i++) {
      const x = clamp(s.x[p]! + (spRand(s) - 0.5) * 700, 40, s.mapW - 40), y = clamp(s.y[p]! + (spRand(s) - 0.5) * 500, 40, s.mapH - 40), sx = spRand(s) < 0.5 ? -1 : 1, sy = spRand(s) < 0.5 ? -1 : 1;
      const e = addEnt(s, EK_DECOY, p, 480, x, y); if (e >= 0) { s.ew[e] = sx; s.eh[e] = sy; }
    }
    jBig(w, 'WHO IS WHO?', '#9aa', 56);
  } } satisfies ItemDef;
