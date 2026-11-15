import type { CharacterDef } from '@pack/combat/api';
import { hecatiaEnts } from './ents';
import { hecatiaHeavy } from './heavy';
import { hecatiaInp } from './inp';
import { hecatiaMelee } from './melee';
import { hecatiaShot } from './shot';
import { hecatiaSwap, hecatiaTrinity } from './skills';
import { hecatiaSpell } from './spell';
import { hecatiaTick } from './tick';

/** Hecatia Lapislazuli — stance master: Focus taps cycle Earth / Moon / Otherworld bodies, old bodies stay as shooting statues. */
export const hecatia: CharacterDef = {
  name: 'Hecatia', order: 3, color: '#c070ff', spd: 0.9, din: 0.95, dout: 1, cd: 9,
  shot: hecatiaShot, melee: hecatiaMelee, heavy: hecatiaHeavy, inp: hecatiaInp, tick: hecatiaTick, ents: hecatiaEnts, entKinds: [200, 202], skill1: hecatiaTrinity, skill2: hecatiaSwap, spell: hecatiaSpell,
};
