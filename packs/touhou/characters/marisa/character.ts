import type { CharacterDef } from '@pack/combat/api';
import { marisaDash } from './dash';
import { marisaEnts } from './ents';
import { marisaHeavy } from './heavy';
import { marisaInp } from './inp';
import { marisaMelee } from './melee';
import { marisaShot } from './shot';
import { marisaLaser, marisaPotion } from './skills';
import { marisaSpell } from './spell';
import { marisaTick } from './tick';

/** Marisa Kirisame — glass cannon: lasers (Master / Narrow Spark, Stardust), Hakkero heat on Focus, Blazing Star dash. */
export const marisa: CharacterDef = { name: 'Marisa', order: 1, color: '#ffd23a', spd: 1.04, din: 1.1, dout: 1, cd: 9, shot: marisaShot, dash: marisaDash, melee: marisaMelee, heavy: marisaHeavy, tick: marisaTick, ents: marisaEnts, entKinds: [3, 5], spell: marisaSpell, inp: marisaInp, skill1: marisaPotion, skill2: marisaLaser };
