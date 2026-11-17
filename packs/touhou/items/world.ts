import type { ItemDef } from '@pack/combat/api';
import { WORLD } from '@pack/combat/items/timestop';

/** The World: after 3 s, time stops for 4 s for everyone but you. Logic: combat/items/timestop.ts. */
export default { name: "The World", color: '#00d0a0', ch: "Sakuya Izayoi", desc: "5 s: time stops for everyone except you.", order: 20, give({ s, p }) { s.zawT = WORLD.charge; s.zawO = p; } } satisfies ItemDef;
