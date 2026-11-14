import type { ItemDef } from '@pack/combat/api';
import { spawnBumpers } from '@pack/combat/items/bumpers';

/** Bumpers: 5 bumpers for 7 s launch foes and bounce all bullets. Logic: combat/items/bumpers.ts. */
export default { name: 'Bumpers', color: '#1fb5a5', order: 57, give({ s, p }) { spawnBumpers(s, p); } } satisfies ItemDef;
