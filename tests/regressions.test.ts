import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { play } from '../tools/parity/campaign';

/** Every bug ever fixed stays fixed: each file in tests/regressions/ is a frozen scenario (`pnpm parity keep <report>`), replayed against the legacy game for its full length. */
const dir = 'tests/regressions', files = existsSync(dir) ? readdirSync(dir).filter(f => f.endsWith('.json')) : [];
describe('regressions (replayed against legacy)', () => {
  // one test per scenario: each stays short (a single multi-minute synchronous test starves vitest's worker RPC on slow CI runners)
  it.skipIf(!files.length).each(files)('%s stays identical to legacy', f => {
    const r = JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')) as { a: string; b: string; seed: number; items: string[]; plan?: string; frames: number; was: { sig: string } };
    const again = play(r.a, r.b, r.seed, r.frames, Infinity, r.items, r.plan);
    expect(again?.diffs[0] ?? again?.crash ?? null, `${f} (was ${r.was.sig})`).toBeNull();
  }, 120000);
});
