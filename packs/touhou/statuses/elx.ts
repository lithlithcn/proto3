import { FXS, type StatusDef, setFx } from '@pack/combat/api';

/** Hourai Elixir brewing: 5 s, then the holder is immortal (`imm`) for 10 s. */
export default { slot: FXS.elx, name: 'ELIXIR BREWING', end: ({ s, p }) => setFx(s, p, FXS.imm, 600) } satisfies StatusDef;
