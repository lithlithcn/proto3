import type { CharacterDef } from '@pack/combat/api';
import { nueDash } from './dash';
import { nueEnts } from './ents';
import { nueUfo } from './ufo';
import { nueHeavy } from './heavy';
import { nueMelee } from './melee';
import { nueShot } from './shot';
import { nueDisguise, nueSwap } from './skills';
import { nueSpell } from './spell';
import { nueTick } from './tick';

/** Nue Houjuu — trickster: wavy shots with harmless decoys on Focus, stand-still clouds, UFO turrets, disguise as another player. */
export const nue: CharacterDef = {
  role: "Trickster · Unknown bullets, clouds, UFOs, disguise", desc: "FOCUS: bullets become UNKNOWN black shapes, most are harmless decoys. STAND STILL: dark clouds gather, shooting launches them. HEAVY: UFO / trident (toward) / storm trap (away). SKILL 2: disguise as another player. SKILL 1: swap with a UFO.",
  name: 'Nue', order: 4, color: '#4a4aff', spd: 1, din: 1, dout: 1, cd: 8,
  shot: nueShot, dash: nueDash, melee: nueMelee, heavy: nueHeavy, tick: nueTick, ents: nueEnts, entKinds: [203, 205], postEnts: nueUfo, postKinds: [204, 204], skill1: nueDisguise, skill2: nueSwap, spell: nueSpell,
};
