import { jTxt, jBurst, addJ, sfx } from '@pack/combat/api';
import type { World } from '@kernel';
import type { CharacterDef, CombatState } from '@pack/combat/api';
import type { TouhouState } from '../../state';
import { flandreDash } from './dash';
import { flandreEnts } from './ents';
import { flandreHeavy } from './heavy';
import { flandreMelee } from './melee';
import { flandreShot } from './shot';
import { flandreClones, flandreFrenzy } from './skills';
import { flandreSpell } from './spell';
import { flandreTick } from './tick';

const frenzy = (w: World, s: CombatState, p: number): boolean => w.slice<TouhouState>('touhou').fFr[p]! > s.gf;
/** Flandre Scarlet — berserker: rainbow shotgun, Focus melee crushes heavy shots, boomerang / trap heavies, clones and Frenzy. */
export const flandre: CharacterDef = {
  role: "Berserker · Eye of destruction + shotgun", desc: "FOCUS: see the eye of things, focus melee = CRUSH (crit, destroys heavy shots). SHOT: rainbow shotgun. HEAVY: Starbow Break / Laevatein boomerang (toward) / Cranberry Trap (away). DASH chains speed up. SKILL 2: Four of a Kind. SKILL 1: Frenzy.",
  name: 'Flandre', order: 2, color: '#ff3030', spd: 1.02, din: 1.05, dout: 1, cd: 13,
  shot: flandreShot, dash: flandreDash, melee: flandreMelee, heavy: flandreHeavy, tick: flandreTick, ents: flandreEnts, entKinds: [6, 9], skill1: flandreClones, skill2: flandreFrenzy, spell: flandreSpell,
  doutM: (w, s, a, _v, heavy) => (!heavy && s.focus[a] ? 1.6 : 1) * (frenzy(w, s, a) ? 1.35 : 1),
  spdM: (w, s, p) => (frenzy(w, s, p) ? 1.25 : 1),
  onHit(w, s, a, v, heavy) { if (!heavy && s.focus[a]) { jTxt(w, s.x[v]!, s.y[v]! - 30, 'CRUSH!', '#ff3030', 16); jBurst(w, s.x[v]!, s.y[v]!, '#ff3030', 18); addJ(w, 'shake', 6, 28); sfx(w, 'break', 0.6); } }, // presentation only (legacy onHit)
};
