import { type ItemDef, jfx, sfx } from '@pack/combat/api';
import { SPARK } from '@pack/combat/items/spark';

/** Master Spark: 5 s charge then a wide 1.5 s beam. Logic: combat/items/spark.ts. */
export default { name: "Master Spark", color: '#fff5a0', ch: "Marisa Kirisame", desc: "Charge 5 s (a thin rainbow ray locks on your foe), then fire a giant Master Spark for 1.5 s.", order: 9, give({ w, s, p }) { s.spk[p] = SPARK.time; s.spkA[p] = s.aim[p]!; jfx(w, 'sfxk', 'rsrc' + p, 'charge', 0.6); sfx(w, 'aimreal', 1.7); } } satisfies ItemDef;
