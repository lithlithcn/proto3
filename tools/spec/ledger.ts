/* pnpm spec ledger — the honest parity ledger (docs/parity-ledger.json): what is validated, what diverges, what is not ported, which comparisons are switched off, what cannot be verified.
 * `summary()` is printed by `pnpm gate` so that GATE PASS is never mistaken for "port complete". */
import { readFileSync } from 'node:fs';

export interface Entry { id: string; status: 'validated' | 'diverging' | 'not-ported' | 'comparison-disabled' | 'unverifiable'; area: string; [k: string]: string | undefined }
export const entries = (): Entry[] => (JSON.parse(readFileSync('docs/parity-ledger.json', 'utf8')) as { entries: Entry[] }).entries;
const ORDER = ['diverging', 'comparison-disabled', 'not-ported', 'unverifiable', 'validated'] as const;
export function summary(detail = false): string {
  const es = entries(), by = (s: string): Entry[] => es.filter(e => e.status === s), out = [`PARITY LEDGER: ${ORDER.map(s => `${by(s).length} ${s}`).join(' | ')}`];
  for (const s of ORDER) if (s !== 'validated' || detail) for (const e of by(s)) out.push(`  [${s}] ${e.id}: ${e.area}${e.repro ? ` — repro: ${e.repro}` : ''}${e.limit ? ` — limit: ${e.limit}` : ''}`);
  return out.join('\n');
}
