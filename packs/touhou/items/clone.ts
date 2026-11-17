import type { ItemDef } from '@pack/combat/api';
import { CLONE } from '@pack/combat/items/clone';

/** Doppelganger: a twin mirrored through the arena centre copies your shots and soaks bullets. Logic: combat/items/clone.ts. */
export default { name: "Doppelganger", color: '#8a8f9a', desc: "10 s: a doppelganger on the opposite side copies your shots. It has 15 HP and can be destroyed.", order: 8, give({ s, p }) { s.clone[p] = CLONE.time; s.cloneHP[p] = CLONE.hp; } } satisfies ItemDef;
