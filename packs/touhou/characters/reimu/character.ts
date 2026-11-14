import type { CharacterDef } from '@pack/combat/api';
import { reimuDash } from './dash';
import { reimuShot } from './shot';

export const reimu: CharacterDef = { name: 'Reimu', color: '#ff3a4a', spd: 1, din: 1, dout: 1, cd: 7, shot: reimuShot, dash: reimuDash };
