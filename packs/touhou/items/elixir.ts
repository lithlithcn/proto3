import { FXS, type ItemDef, jBig, setFx } from '@pack/combat/api';

/** Hourai Elixir (Mokou): brew for 5 s, then 10 s of immortality. (The legacy `p.star` variant was dead code.) */
export default { name: "Hourai Elixir", color: '#ff5030', ch: "Fujiwara no Mokou", desc: "The elixir takes 5 s to work. Then for 10 s you CANNOT lose a life.", order: 44, sfx: 'healing', give({ w, s, p }) { setFx(s, p, FXS.elx, 300); jBig(w, 'HOURAI ELIXIR: IMMORTAL IN 5 S', '#ffd23a', 40); } } satisfies ItemDef;
