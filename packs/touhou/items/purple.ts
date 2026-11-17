import type { ItemDef } from '@pack/combat/api';

/** Warp: for 10 s walls wrap around (exit left, come back right) and the red zone is off. Global, not per player. */
export default { name: "Warp", color: '#b45cff', desc: "For 10 s walls wrap around: exit left, come back right. No red zone.", order: 3, give({ s }) { s.warp = 600; } } satisfies ItemDef;
