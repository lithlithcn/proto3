import type { ItemDef } from '@pack/combat/api';

/** Oni Giant: 10 s, twice as wide, melee reach x1.6, melee damage x1.5, knockback taken halved. */
export default { name: 'Oni Giant', color: '#c8102e', order: 9, give({ s, p }) { s.giant[p] = 600; } } satisfies ItemDef;
