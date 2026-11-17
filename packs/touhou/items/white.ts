import type { ItemDef } from '@pack/combat/api';

/** Rifle: 2 aimed, piercing, deadly shots on Heavy. A parried bolt kills YOU. Logic: combat/items/rifle.ts. */
export default { name: "Rifle", color: '#ffffff', desc: "Heavy button: aim, then fire a thin deadly shot (2 shots). Parried = it kills YOU.", order: 1, give({ s, p }) { s.rifle[p] = 2; } } satisfies ItemDef;
