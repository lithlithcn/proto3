import type { ItemDef } from '@pack/combat/api';
import { SPARK } from '@pack/combat/items/spark';

/** Master Spark: 5 s charge then a wide 1.5 s beam. Logic: combat/items/spark.ts. */
export default { name: 'Master Spark', color: '#fff5a0', order: 9, give({ s, p }) { s.spk[p] = SPARK.time; s.spkA[p] = s.aim[p]!; } } satisfies ItemDef;
