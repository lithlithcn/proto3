import type { SystemDef } from '@kernel';
import { combatOf, jBurst } from '@pack/combat/api';
import type { TouhouState } from '../state';

/** Nue's disguise: when the 4 s end she gets her kit and spell card back. */
export const disguise: SystemDef = {
  id: 'disguise', phase: 'sim', after: ['combat:ray-step'],
  run(w) {
    const s = combatOf(w); if (s.skip) return;
    const t = w.slice<TouhouState>('touhou');
    for (let p = 0; p < s.n; p++) {
      if (!t.nOr[p]) continue;
      if (t.nD[p]! <= s.gf) { t.nOr[p] = 0; s.charIdx[p] = t.nOc[p]!; s.spI[p] = t.nOsp[p]!; jBurst(w, s.x[p]!, s.y[p]!, '#2a1a4a', 14); }
    }
  },
};
