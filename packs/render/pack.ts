import { definePack } from '@kernel';
import { juiceHooks } from './juice/events';

/** Presentation pack: draws the world through a given Ctx2D (recordable for render parity) and keeps the presentation-only "juice" state fed by combat events. No sim state. */
export default definePack({ id: 'render', version: '0.1.0', requires: ['combat@^0.1.0'], hooks: juiceHooks });
