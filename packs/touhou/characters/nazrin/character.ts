import { type CharacterDef, MV_NAMES } from '@pack/combat/api';
import type { TouhouState } from '../../state';
import { nazrinEnts, nazrinPost } from './ents';
import { nazrinHeavy } from './heavy';
import { nazrinInp } from './inp';
import { nazrinMelee } from './melee';
import { nazrinShot } from './shot';
import { nazrinDig, nazrinRecall } from './skills';
import { nazrinSpell } from './spell';
import { nazrinTick } from './tick';

/** Nazrin — mouse boss: sentinel mice, pendulums, dowsing mark, spell-gauge thief (lunge), dig for a random bonus. */
export const nazrin: CharacterDef = {
  name: 'Nazrin', order: 6, color: '#a0a0b0', spd: 1.02, din: 1, dout: 1, cd: 11,
  shot: nazrinShot, melee: nazrinMelee, heavy: nazrinHeavy, inp: nazrinInp, tick: nazrinTick, ents: nazrinEnts, post: nazrinPost, entKinds: [209, 213], skill1: nazrinDig, skill2: nazrinRecall, spell: nazrinSpell,
  spdM: (w, s, p) => (w.slice<TouhouState>('touhou').nSpd[p]! > s.gf ? 1.3 : 1),
  dinM: (w, _s, v) => { const t = w.slice<TouhouState>('touhou'); if (t.nSh[v]) { t.nSh[v] = 0; return 0; } return 1; }, // the shield blocks the next hit entirely
  onHit(_w, s, a, v, heavy) { // a connecting lunge steals up to 25 spirit
    if (heavy || MV_NAMES[s.mvId[a]!] !== 'lunge') return;
    const st = Math.min(s.spirit[v]!, 25); if (st > 0) { s.spirit[v] = s.spirit[v]! - st; s.spirit[a] = Math.min(100, s.spirit[a]! + st); }
  },
};
