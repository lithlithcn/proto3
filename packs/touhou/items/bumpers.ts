import type { ItemDef } from '@pack/combat/api';
import { spawnBumpers } from '@pack/combat/items/bumpers';

/** Bumpers: 5 bumpers for 7 s launch foes and bounce all bullets. Logic: combat/items/bumpers.ts. */
export default { name: "Kappa Bumpers", color: '#1fb5a5', ch: "Nitori Kawashiro", desc: "7 s: 5 bumpers appear and drift up or down. Fighters bounce off them.", order: 57, give({ s, p }) { spawnBumpers(s, p); } } satisfies ItemDef;
