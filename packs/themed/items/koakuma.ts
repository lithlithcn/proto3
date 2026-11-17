import { FXS, type ItemDef, jBig, setFx } from '@pack/combat/api';

/** Devil Pact (Koakuma): 10 s pact; a K.O. scored meanwhile swaps your lives with the leader, or costs you one if you lead (logic: themed/koakuma.ts). */
export default { name: 'Devil Pact', color: '#c0392b', ch: 'Koakuma', desc: '10 s: K.O. someone. If you are behind, you swap lives with the leader. If you already lead, you LOSE a life.', order: 15, sfx: 'weird',
  give({ w, s, p }) { setFx(s, p, FXS.pact, 600); jBig(w, 'DEVIL PACT: K.O. SOMEONE IN 10 S', '#c0392b', 36); } } satisfies ItemDef;
