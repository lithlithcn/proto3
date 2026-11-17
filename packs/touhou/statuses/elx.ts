import { FXS, type StatusDef, jBig, jFlash, pushJ, setFx, sfx } from '@pack/combat/api';

/** Hourai Elixir brewing: 5 s, then the holder is immortal (`imm`) for 10 s. */
export default { slot: FXS.elx, name: 'ELIXIR BREWING', end: ({ w, s, p }) => { setFx(s, p, FXS.imm, 600); jBig(w, 'IMMORTAL FOR 10 S!', '#ffd23a', 50); sfx(w, 'healing'); jFlash(w, 0.3, '#ffd23a'); pushJ(w, 'RINGS', 'x', s.x[p]!, 'y', s.y[p]!, 'r', 0, 'm', 120, 't', 30, 'c', '#ffd23a'); } } satisfies StatusDef;
