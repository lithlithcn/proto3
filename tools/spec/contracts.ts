/* Content contracts: every numeric value of the game's content (balance T, default MOVES, characters, items, statuses, spells) flattened to
 * `type:id.path = number`. docs/contracts.lock.json is the reviewed reference; tests/contracts.test.ts fails when content differs from it,
 * so a "30 -> 40 damage" edit can never pass silently (it needs `pnpm spec lock` + a stated reason + legacy parity). No duplication: derived from the content itself. */
import { resolvePacks } from '../../src/kernel';
import combat from '../../packs/combat/pack';
import touhou from '../../packs/touhou/pack';
import { T } from '../../packs/combat/tuning';
import { MOVES } from '../../packs/combat/moves';

export const PACKS = [combat, touhou];
const walk = (v: unknown, path: string, out: Record<string, number | string>, depth = 0): void => {
  if (typeof v === 'number') out[path] = Number.isNaN(v) ? 'NaN' : v;
  else if (v && typeof v === 'object' && depth < 6 && !ArrayBuffer.isView(v)) for (const k of Object.keys(v as object)) walk((v as Record<string, unknown>)[k], `${path}.${k}`, out, depth + 1);
};
export function contracts(): Record<string, number | string> {
  const o: Record<string, number | string> = {}, { registry } = resolvePacks(PACKS);
  walk(T, 'tuning:T', o); walk(MOVES, 'moves:default', o);
  for (const type of registry.types()) for (const [id, def] of registry.list(type)) walk(def, `${type}:${id}`, o);
  return Object.fromEntries(Object.keys(o).sort().map(k => [k, o[k]!]));
}
export function diffContracts(lock: Record<string, unknown>, now: Record<string, unknown>): string[] {
  const d: string[] = [];
  for (const k of Object.keys(now)) if (!(k in lock)) d.push(`+ ${k} = ${String(now[k])}  (new)`); else if (!Object.is(lock[k], now[k])) d.push(`~ ${k}: lock=${String(lock[k])} now=${String(now[k])}`);
  for (const k of Object.keys(lock)) if (!(k in now)) d.push(`- ${k} (removed, was ${String(lock[k])})`);
  return d;
}
