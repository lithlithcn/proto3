import type { ItemDef } from '@pack/combat/api';

/** Mirror Aura: for 8 s every bullet that touches you bounces back at its shooter (see bullets/mirror in combat). */
export default { name: "Mirror Aura", color: '#e0e6f0', desc: "8 s: every bullet that touches you bounces back at its shooter.", order: 6, give({ s, p }) { s.mirror[p] = 480; } } satisfies ItemDef;
