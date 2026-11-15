import { definePack } from '@kernel';
import { touhouJuice } from './presentation/juice';

/** Presentation of the touhou characters (juice on their own events). Separate pack so the generic render pack never depends on touhou. */
export default definePack({ id: 'touhoufx', version: '0.1.0', requires: ['combat@^0.1.0', 'touhou@^0.1.0', 'render@^0.1.0'], hooks: touhouJuice });
