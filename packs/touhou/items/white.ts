import type { ItemDef } from '@pack/combat/api';

/** Rifle: 2 aimed, piercing, deadly shots on Heavy. A parried bolt kills YOU. Logic: combat/items/rifle.ts. */
export default { name: 'Rifle', color: '#ffffff', order: 1, give({ s, p }) { s.rifle[p] = 2; } } satisfies ItemDef;
