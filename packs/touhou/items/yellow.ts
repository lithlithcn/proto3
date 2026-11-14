import type { ItemDef } from '@pack/combat/api';

/** Blade: two blades spin around you and cut anyone they touch (10 s). Logic: combat/items/blade.ts. */
export default { name: 'Blade', color: '#ffe23a', order: 0, give({ s, p }) { s.blade[p] = 600; } } satisfies ItemDef;
