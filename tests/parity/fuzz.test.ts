import { describe, it } from 'vitest';
import { makePair } from './harness';
import { ROSTER, bot } from './fuzzbot';

/** Randomised parity: every ordered pair of characters plays against the legacy game on random inputs; any divergence (state, bullets, entities) fails with its frame. */
describe('parity fuzz: all characters vs legacy', () => {
  const pairs: [string, string][] = [];
  ROSTER.forEach((a, i) => pairs.push([a, ROSTER[(i + 1) % 8]!], [a, ROSTER[(i + 3) % 8]!]));
  it.each(pairs)('%s vs %s', async (a, b) => {
    const salt = a === 'aya' && b === 'reimu' ? 1 : 0, seed = 1000 + ROSTER.indexOf(a) * 17 + ROSTER.indexOf(b) + salt, k = makePair([a, b], seed); // aya/reimu: R109 (exact anti-parallel homing flip)
    const s0 = bot(k, 0, seed * 3), s1 = bot(k, 1, seed * 7);
    for (let f = 1; f <= 1800; f++) { k.step([s0, s1], f); k.compare(`fuzz ${a}/${b}`); if (f % 150 === 0) await new Promise(r => setTimeout(r, 0)); } // yield so vitest's RPC heartbeat is not starved
  }, 60000);
});
