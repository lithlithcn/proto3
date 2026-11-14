import { FXS, type StatusDef } from '@pack/combat/api';

/** Immortal: cannot be KO'd while it lasts (guard in `touhou/hooks/imm-guard.ts`). */
export default { slot: FXS.imm, name: 'IMMORTAL' } satisfies StatusDef;
