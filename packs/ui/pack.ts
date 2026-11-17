import { definePack } from '@kernel';

/** Menus and screens (title, hub, character select, sub-menus...). Presentation only: drawn on the canvas through a given Ctx2D (op-recordable,
 *  compared with the legacy screens by `pnpm ui`), never part of the sim; not registered in worlds. */
export default definePack({ id: 'ui', version: '0.1.0', requires: ['render@^0.1.0', 'combat@^0.1.0'] });
