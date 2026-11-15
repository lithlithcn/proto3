import { execSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { entries } from '../tools/spec/ledger';

import { existsSync } from 'node:fs';
import { quirks } from '../tools/spec/quirks';

describe('quirks knowledge base', () => {
  it('ids unique, every port file still exists (the KB must not rot)', () => { const q = quirks(); expect(new Set(q.map(x => x.id)).size).toBe(q.length); for (const x of q) for (const f of x.port) expect(existsSync(f), `${x.id}: ${f} is gone: update docs/quirks.json`).toBe(true); });
});

describe('parity ledger', () => {
  const es = entries(), ids = new Set(es.map(e => e.id));
  it('ids are unique and statuses valid', () => { expect(ids.size).toBe(es.length); for (const e of es) expect(['validated', 'diverging', 'not-ported', 'comparison-disabled', 'unverifiable']).toContain(e.status); });
  it('every `ledger:<id>` marker in code points at an entry, and every comparison-disabled entry has a marker', () => {
    const marks = execSync('git grep -ho "ledger:[a-z0-9-]*" -- tools tests packs src ":!tests/ledger.test.ts" || true', { encoding: 'utf8' }).split('\n').filter(Boolean).map(m => m.slice(7));
    for (const m of marks) expect(ids, `marker ledger:${m} has no entry in docs/parity-ledger.json`).toContain(m);
    for (const e of es.filter(x => x.status === 'comparison-disabled')) expect(marks, `comparison-disabled entry ${e.id} has no ledger marker in code`).toContain(e.id);
  });
});
