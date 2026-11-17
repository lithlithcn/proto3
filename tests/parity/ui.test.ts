import { execFileSync } from 'node:child_process';
import { expect, it } from 'vitest';

/** Menu screens drawn by the port are op-identical to the legacy ones (tools/ui/compare.ts, `pnpm ui`). */
it('ui screens match the legacy op stream', () => {
  let out = '';
  try { out = execFileSync('npx', ['tsx', 'tools/ui/compare.ts'], { encoding: 'utf8' }); } catch (e) { out = String((e as { stdout?: string }).stdout ?? e); }
  expect(out).toContain('all screens identical');
}, 120_000);
