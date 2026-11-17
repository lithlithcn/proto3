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
export const marisa: CharacterDef = { name: 'Marisa', order: 1, color: '#ffd23a', role: "Glass cannon · Lasers + Hakkero heat", desc: "FOCUS: heat the Hakkero (bigger heavies, overheat burns you). HEAVY: Master Spark / Narrow Spark (toward) / Stardust Reverie (away), lasers show a 1 s warning, then need 1 s to recharge. DASH: Blazing Star, DASH + HEAVY = rear laser boost. SKILL 2: star potion. SKILL 1: Non-Directional Laser.", spd: 1.04, din: 1.1, dout: 1, cd: 9, shot: marisaShot, dash: marisaDash, melee: marisaMelee, heavy: marisaHeavy, tick: marisaTick, ents: marisaEnts, entKinds: [3, 5], spell: marisaSpell, inp: marisaInp, skill1: marisaPotion, skill2: marisaLaser };
