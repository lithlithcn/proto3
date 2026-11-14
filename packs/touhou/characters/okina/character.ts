import type { CharacterDef } from '@pack/combat/api';
import { okinaDash } from './dash';
import { okinaEnts } from './ents';
import { okinaHeavy } from './heavy';
import { okinaInp } from './inp';
import { okinaMelee } from './melee';
import { okinaShot } from './shot';
import { okinaDancers, okinaDoor } from './skills';
import { okinaSpell } from './spell';
import { okinaTick } from './tick';

/** Okina Matara — controller: doors that copy her shots and teleport her, a season that changes every 5 s, backup dancers, door ray. */
export const okina: CharacterDef = {
  name: 'Okina', order: 5, color: '#ffd23a', spd: 0.98, din: 1, dout: 1, cd: 8,
  shot: okinaShot, dash: okinaDash, melee: okinaMelee, heavy: okinaHeavy, inp: okinaInp, tick: okinaTick, ents: okinaEnts, skill1: okinaDoor, skill2: okinaDancers, spell: okinaSpell,
};
