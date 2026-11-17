import { FXS, type StatusDef, jTxt } from '@pack/combat/api';

/** Koakuma's pact (legacy fx.pact); expiring unused only says so (legacy fxEnd). */
export default { slot: FXS.pact, name: 'PACT', end: ({ w, s, p }) => jTxt(w, s.x[p]!, s.y[p]! - 40, 'PACT EXPIRED', '#888', 16) } satisfies StatusDef;
