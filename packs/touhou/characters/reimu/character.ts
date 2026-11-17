import type { CharacterDef } from '@pack/combat/api';
import { reimuDash } from './dash';
import { reimuHeavy } from './heavy';
import { reimuMelee } from './melee';
import { reimuTick } from './tick';
import { reimuShot } from './shot';
import { reimuSpell } from './spell';
import { reimuInp } from './inp';
import { reimuBorder } from './border';

export const reimu: CharacterDef = { name: 'Reimu', order: 0, color: '#ff3a4a', role: "All-rounder · Yin-yang orbs + Borders", desc: "SHOT: twin amulets + yin-yang options firing homing amulets. HEAVY (neutral, HOLD): 1 / 2 / 4 bouncing yin-yang orbs. FOCUS (4 s max): orbs turn to spirit and come to you, an arrow follows your stick, release = launch. DASH = teleport. SKILL 1: Cautionary Border blocks shots and stuns foes who melee inside it (5 s, 15 s cooldown). Dash cooldown 0.35 s.", spd: 1, din: 1, dout: 1, cd: 7, shot: reimuShot, dash: reimuDash, melee: reimuMelee, heavy: reimuHeavy, tick: reimuTick, spell: reimuSpell, inp: reimuInp, skill2: reimuBorder };
