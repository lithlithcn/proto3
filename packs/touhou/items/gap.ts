import type { ItemDef } from '@pack/combat/api';
import { spawnHole } from '@pack/combat/items/hole';

/** Black Hole: opens at the card for 6 s; pulls fighters and bullets from the whole map, grows with what it swallows. Logic: combat/items/hole.ts. */
export default { name: 'Black Hole', color: '#ffa040', order: 7, give({ s, p, x, y }) { spawnHole(s, p, x, y); } } satisfies ItemDef;
