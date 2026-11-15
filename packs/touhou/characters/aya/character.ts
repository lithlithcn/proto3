import type { CharacterDef } from '@pack/combat/api';
import { ayaDash } from './dash';
import { ayaEnts } from './ents';
import { ayaHeavy } from './heavy';
import { ayaMelee } from './melee';
import { ayaShot } from './shot';
import { ayaScoop, ayaTailwind } from './skills';
import { ayaSpell } from './spell';
import { ayaTick } from './tick';

/** Aya Shameimaru — speedster: fast dash recharge, Hyper Dash through tornadoes, camera photo that erases bullets and stuns, Scoop newspaper, Tailwind. */
export const aya: CharacterDef = {
  name: 'Aya', order: 7, color: '#e04a4a', spd: 1.2, din: 1.08, dout: 1, cd: 7,
  shot: ayaShot, dash: ayaDash, melee: ayaMelee, heavy: ayaHeavy, tick: ayaTick, ents: ayaEnts, skill1: ayaScoop, skill2: ayaTailwind, spell: ayaSpell,
};
