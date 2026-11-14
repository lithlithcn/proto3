import type { ItemDef } from '@pack/combat/api';
import { spawnFairies } from '@pack/combat/items/fairy';

/** Fairies: 3 thieves for 7 s steal spirit and power from the richest foe. Logic: combat/items/fairy.ts. */
export default { name: 'Fairies', color: '#66ccff', order: 4, give({ s, p }) { spawnFairies(s, p); } } satisfies ItemDef;
