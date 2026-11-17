import type { World } from '@kernel';
import { rulesOf } from '../rules';
import { MAX_FX, PS, type CombatState } from '../state';
import { EK_HEAL } from './world';
import { EK_BOMB } from './bombs';
import { EK_HOLE } from './hole';
import { EK_BUMP } from './bumpers';
import { EK_FAIRY } from './fairy';

/** Legacy xActive (line 805): does player `p` still have an item effect running? (the activation list prunes an item after 1.5 s once nothing is active).
 *  Item rule sets add their own globals (`RulesDef.active`) and the entity kinds that do not count (`RulesDef.quiet`, legacy flake/petal/fire...). */
export function itemActive(w: World, s: CombatState, p: number): boolean {
  for (let k = 0; k < MAX_FX; k++) if (s.fx[p * MAX_FX + k]! > 0) return true;
  if (s.blade[p]! > 0 || s.rifle[p]! > 0 || s.bombs[p]! > 0 || s.ult[p]! > 0 || s.mirror[p]! > 0 || s.giant[p]! > 0 || s.clone[p]! > 0 || s.spk[p]! > 0 || s.cam[p]! > 0) return true;
  const R = rulesOf(w);
  for (let i = 0; i < s.nent; i++) {
    const k = s.ek[i]!; if (s.et[i]! <= 0) continue;
    if (k === EK_HEAL) return true; // legacy ORBS.length: anyone's healing orbs
    // ownerless item entities keep their holder elsewhere: bombs/bumpers ew, fairies eg, holes ea
    const o = k === EK_BOMB || k === EK_BUMP ? s.ew[i] : k === EK_FAIRY ? s.eg[i] : k === EK_HOLE ? s.ea[i] : s.eo[i];
    if (o !== p || R.some(r => r.quiet?.includes(k))) continue;
    return true;
  }
  if (s.tstop > 0 || s.frz > 0 || s.warp > 0) return true;
  const st = s.state[p]; if (st === PS.pray || st === PS.cocoon || st === PS.spell) return true;
  return R.some(r => r.active?.(w, s, p));
}
