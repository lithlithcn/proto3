import type { CharacterDef } from '@pack/combat/api';
import { reimuDash } from './dash';
import { reimuHeavy } from './heavy';
import { reimuMelee } from './melee';
import { reimuTick } from './tick';
import { reimuShot } from './shot';
import { reimuSpell } from './spell';

export const reimu: CharacterDef = { name: 'Reimu', color: '#ff3a4a', spd: 1, din: 1, dout: 1, cd: 7, shot: reimuShot, dash: reimuDash, melee: reimuMelee, heavy: reimuHeavy, tick: reimuTick, spell: reimuSpell };
