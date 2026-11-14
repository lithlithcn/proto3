import { addEnt, type ItemDef, TAU } from '@pack/combat/api';
import { EK_HEAL } from '@pack/combat/items/world';
import { cos, sin } from '@kernel';

/** Healing orbs: 12 orbs bounce everywhere for 10 s; touching one heals 100 HP (anyone). */
export default { name: 'Healing orbs', color: '#5cff8a', order: 2, give({ s, x, y }) {
  for (let i = 0; i < 12; i++) { const a = i * TAU / 12, e = addEnt(s, EK_HEAL, -1, 600, x, y); if (e >= 0) { s.evx[e] = cos(a) * 4.5; s.evy[e] = sin(a) * 4.5; } }
} } satisfies ItemDef;
