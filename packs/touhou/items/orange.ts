import type { ItemDef } from '@pack/combat/api';

/** Bombs: zones appear near your foes for 8 s and explode after 3 s. Logic: combat/items/bombs.ts. */
export default { name: 'Bombs', color: '#ff9a2a', order: 5, give({ s, p }) { s.bombs[p] = 480; } } satisfies ItemDef;
