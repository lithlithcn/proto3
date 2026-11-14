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
  name: 'Flandre', order: 2, color: '#ff3030', spd: 1.02, din: 1.05, dout: 1, cd: 13,
  shot: flandreShot, dash: flandreDash, melee: flandreMelee, heavy: flandreHeavy, tick: flandreTick, ents: flandreEnts, skill1: flandreClones, skill2: flandreFrenzy, spell: flandreSpell,
  doutM: (w, s, a, _v, heavy) => (!heavy && s.focus[a] ? 1.6 : 1) * (frenzy(w, s, a) ? 1.35 : 1),
  spdM: (w, s, p) => (frenzy(w, s, p) ? 1.25 : 1),
};
