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
  role: "Controller · Doors, seasons, backup dancers", desc: "SKILL 2: place a door (max 3); every door copies all your shots, aimed at the nearest foe. FOCUS: only the doors shoot. DASH: travel through a door. SHOT: season changes every 5 s (spring heals, summer fast, autumn pushes, winter slows). HEAVY: big door swallows and spits bullets / ray through doors (1 s warning, then 1 s recharge) / leaf whirl. SKILL 1: place Satono, SKILL 1 again: place Mai (5 s). They dance in place, shoot easy patterns and kick anyone close toward their sister.",
  name: 'Okina', order: 5, color: '#ffd23a', spd: 0.98, din: 1, dout: 1, cd: 8,
  shot: okinaShot, dash: okinaDash, melee: okinaMelee, heavy: okinaHeavy, inp: okinaInp, tick: okinaTick, ents: okinaEnts, entKinds: [206, 208], skill1: okinaDoor, skill2: okinaDancers, spell: okinaSpell,
};
