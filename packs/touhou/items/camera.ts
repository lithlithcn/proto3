import type { ItemDef } from '@pack/combat/api';

/** Tengu Camera: 3 snaps (Heavy) that erase bullets and stun foes in a cone; unlimited dashes. Logic: combat/items/rifle.ts (snap). */
export default { name: "Tengu Camera", color: '#d4a050', ch: "Aya Shameimaru", desc: "3 photos with Heavy. While you hold photos, your dashes are infinite.", order: 56, give({ s, p }) { s.cam[p] = 3; } } satisfies ItemDef;
