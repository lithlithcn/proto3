import type { ItemDef } from '@pack/combat/api';
import { giveFreeze } from '@pack/combat/items/freeze';

/** Perfect Freeze: every enemy bullet freezes, then shatters in all directions as YOURS (twice). Logic: combat/items/freeze.ts. */
export default { name: 'Perfect Freeze', color: '#a8f0ff', order: 19, give({ s, p }) { giveFreeze(s, p); } } satisfies ItemDef;
