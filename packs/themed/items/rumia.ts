import { FXS, type ItemDef, jBig, setFx } from '@pack/combat/api';

/** The Darkness Feeds (Rumia): 8 s of dark orbs that swallow bullets; a foe they touch is EDIBLE, Attack eats it (logic: themed/rumia.ts). */
export default { name: 'The Darkness Feeds', color: '#6b5bb0', ch: 'Rumia', desc: '', order: 11, give({ w, s, p }) { setFx(s, p, FXS.eat, 480); jBig(w, 'THE DARKNESS FEEDS', '#6b5bb0', 40); } } satisfies ItemDef;
