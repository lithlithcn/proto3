import type { SystemDef } from '@kernel';
import { PS, combatOf } from '@pack/combat/api';
import { nueEnts } from '../characters/nue/ents';
import type { TouhouState } from '../state';

/** Nue's disguise: while she wears another character her own clouds / UFOs keep running; when the 4 s end she gets her kit and spell card back. */
export const disguise: SystemDef = {
  id: 'disguise', phase: 'sim', after: ['combat:ray-step'],
  run(w) {
    const s = combatOf(w); if (s.skip) return;
    const t = w.slice<TouhouState>('touhou');
    for (let p = 0; p < s.n; p++) {
      if (!t.nOr[p]) continue;
      if (s.state[p] !== PS.dead) nueEnts(w, s, p);
      if (t.nD[p]! <= s.gf) { t.nOr[p] = 0; s.charIdx[p] = t.nOc[p]!; s.spI[p] = t.nOsp[p]!; }
    }
  },
};
