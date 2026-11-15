import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { contracts, diffContracts } from '../tools/spec/contracts';

it('content numbers match docs/contracts.lock.json (a balance change must be deliberate: pnpm spec lock + reason + legacy parity)', () => {
  const d = diffContracts(JSON.parse(readFileSync(new URL('../docs/contracts.lock.json', import.meta.url), 'utf8')), contracts());
  expect(d, `${d.length} content contract(s) changed — intended? run \`pnpm spec lock\` and say why in the commit`).toEqual([]);
});

/** Independent source of truth: the frozen legacy game. Every shared numeric key of balance `T` and default `MOVES` must equal the legacy value
 *  (so "code AND lock both edited to 40" still fails). Keys that exist on one side only are listed, not failed (the port may rename/split). */
import { makePair } from './parity/harness';
import { T } from '../packs/combat/tuning';
import { MOVES } from '../packs/combat/moves';
it('balance T and default MOVES equal the legacy game values', () => {
  const k = makePair(['reimu', 'reimu'], 1), L = JSON.parse(String(k.legacy.eval('JSON.stringify({T:T,M:MOVES})'))) as { T: Record<string, unknown>; M: Record<string, Record<string, unknown>> };
  const bad: string[] = []; let n = 0;
  for (const [key, v] of Object.entries(T)) if (typeof v === 'number' && typeof L.T[key] === 'number') { n++; if (v !== L.T[key]) bad.push(`T.${key}: port=${v} legacy=${String(L.T[key])}`); }
  for (const [mv, def] of Object.entries(MOVES)) for (const [key, v] of Object.entries(def as unknown as Record<string, unknown>)) if (typeof v === 'number' && typeof L.M[mv]?.[key] === 'number') { n++; if (v !== L.M[mv]![key]) bad.push(`MOVES.${mv}.${key}: port=${v} legacy=${String(L.M[mv]![key])}`); }
  expect(n, 'compared keys').toBeGreaterThan(40); expect(bad).toEqual([]);
});
