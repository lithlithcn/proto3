import { definePack } from '@kernel';
import { reimu } from './characters/reimu/character';
import s01 from './spells/01-fantasy-seal';
import s02 from './spells/02-starlight-rain';
import s03 from './spells/03-perfect-freeze';
import s04 from './spells/04-electromagnetic-induction';
import s05 from './spells/05-moths-to-a-flame';
import s06 from './spells/06-keplers-rings';
import s07 from './spells/07-crystal-rain';
import s08 from './spells/08-rose-curve';
import s09 from './spells/09-wheel-of-fortune';
import s10 from './spells/10-killing-doll';
import s11 from './spells/11-meteor-shower';
import green from './items/green';
import mirror from './items/mirror';
import oni from './items/oni';
import orange from './items/orange';
import purple from './items/purple';
import yellow from './items/yellow';
import { touhouSchema } from './state';
import type { TouhouState } from './state';

/** Touhou content pack. Characters are added one folder at a time under characters/ (DESIGN §15). */
export default definePack({
  id: 'touhou',
  version: '0.1.0',
  requires: ['combat@^0.1.0'],
  state: touhouSchema,
  events: ['touhou:reimu-teleport', 'touhou:reimu-charge'],
  content: { character: { reimu }, item: { green, mirror, oni, orange, purple, yellow }, spell: { '01-fantasy-seal': s01, '02-starlight-rain': s02, '03-perfect-freeze': s03, '04-electromagnetic-induction': s04, '05-moths-to-a-flame': s05, '06-keplers-rings': s06, '07-crystal-rain': s07, '08-rose-curve': s08, '09-wheel-of-fortune': s09, '10-killing-doll': s10, '11-meteor-shower': s11 } },
  init(w) { const ts = w.slice<TouhouState>('touhou'); ts.reimuDashAt.fill(-99); },
});
