import type { ItemDef } from '@pack/combat/api';
import { giveFreeze } from '@pack/combat/items/freeze';

/** Perfect Freeze: every enemy bullet freezes, then shatters in all directions as YOURS (twice). Logic: combat/items/freeze.ts. */
export default { name: "Perfect Freeze", color: '#a8f0ff', ch: "Cirno", desc: "Freezes every enemy bullet 3 times in a row. Each time the frozen bullets burst and become yours.", order: 19, give({ w, s, p }) { giveFreeze(w, s, p); } } satisfies ItemDef;
