import { definePack } from '@kernel';

/** Presentation pack: draws the world through a given Ctx2D (recordable for render parity). No sim state, no events of its own. */
export default definePack({ id: 'render', version: '0.1.0', requires: ['combat@^0.1.0'] });
