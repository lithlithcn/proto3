import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const walk = (d: string): string[] => readdirSync(d).flatMap(n => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : p.endsWith('.md') ? [p] : []; });

describe('docs/game sheets', () => {
  it('every backticked repo path exists (docs must not rot)', () => {
    const bad: string[] = [];
    for (const f of walk('docs/game')) for (const m of readFileSync(f, 'utf8').matchAll(/`((?:packs|src|tools|tests|docs)\/[^`\s]+?)`/g)) { const p = m[1]!.replace(/[,.;:]$/, ''); if (!/[*#<{]/.test(p) && !existsSync(p)) bad.push(`${f}: ${p}`); }
    expect(bad).toEqual([]);
  });
});
