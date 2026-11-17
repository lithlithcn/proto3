import type { World } from '@kernel';
import type { CombatState } from '../state';

/** Where and for whom an item takes effect (`x,y` = the card's position, or the player's when given outside a card). */
export interface ItemCtx { w: World; s: CombatState; p: number; x: number; y: number }
/** Content type `item` (DESIGN §15). `order` = position in the legacy list: the card draw indexes the enabled list in that order. */
export interface ItemDef { name: string; color: string; /** item list text (legacy `d`) */ desc?: string; /** themed item: the character it belongs to (legacy `ch`) */ ch?: string; order: number; rare?: boolean; /** sound played on pickup after the generic ones (legacy ISFX) */ sfx?: string; give(c: ItemCtx): void }
