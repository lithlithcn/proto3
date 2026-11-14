import { definePack } from '@kernel';
import { reimu } from './characters/reimu/character';
import { touhouSchema } from './state';
import type { TouhouState } from './state';

/** Touhou content pack. Characters are added one folder at a time under characters/ (DESIGN §15). */
export default definePack({
  id: 'touhou',
  version: '0.1.0',
  requires: ['combat@^0.1.0'],
  state: touhouSchema,
  events: ['touhou:reimu-teleport'],
  content: { character: { reimu } },
  init(w) { const ts = w.slice<TouhouState>('touhou'); ts.reimuDashAt.fill(-99); },
});
