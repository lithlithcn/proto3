import { FXS, type ItemDef, setFx } from '@pack/combat/api';

/** Hourai Elixir (Mokou): brew for 5 s, then 10 s of immortality. (The legacy `p.star` variant was dead code.) */
export default { name: "Hourai Elixir", color: '#ff5030', ch: "Fujiwara no Mokou", desc: "The elixir takes 5 s to work. Then for 10 s you CANNOT lose a life.", order: 44, sfx: 'healing', give({ s, p }) { setFx(s, p, FXS.elx, 300); } } satisfies ItemDef;
