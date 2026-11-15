// pnpm affected [--run] — which checks does MY change need? Maps changed files (git diff HEAD + untracked) to the smallest sufficient set; --run executes it.
//   packs/touhou/characters/<c>/...      -> tests/parity/<c>.test.ts + a short campaign of c vs a few others
//   packs/<pack>/items/<x>.ts            -> matrix for item x (every character) + items tests
//   packs/combat|touhou core, src/kernel, tools/parity, tests/parity/harness -> core: full gate
//   docs only                            -> nothing beyond check:fast
// Heuristics: when unsure it widens, never narrows.
import { execSync, spawnSync } from 'node:child_process';

const sh = (c: string): string => { try { return execSync(c, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return ''; } };
const files = [...new Set([...sh('git diff --name-only HEAD').split('\n'), ...sh('git ls-files --others --exclude-standard').split('\n')].filter(Boolean))];
const chars = new Set<string>(), items = new Set<string>(); let core = false, any = false;
for (const f of files) {
  const c = /^packs\/touhou\/characters\/([a-z]+)\//.exec(f), i = /^packs\/[a-z]+\/items\/([a-z]+)\.ts$/.exec(f);
  if (c) { chars.add(c[1]!); any = true; } else if (i) { items.add(i[1]!); any = true; }
  else if (/^(packs\/(combat|touhou)\/(?!characters|items)|src\/kernel\/|tools\/parity\/|tests\/parity\/harness)/.test(f)) { core = true; any = true; }
  else if (/^(packs|src|tools|tests)\//.test(f)) any = true;
}
const plan: string[][] = [['pnpm', '-s', 'check:fast']];
if (core) plan.push(['pnpm', '-s', 'gate', '--items']);
else {
  for (const c of chars) { plan.push(['pnpm', '-s', 'exec', 'vitest', 'run', `tests/parity/${c}.test.ts`]); plan.push(['pnpm', '-s', 'parity', '--games', '16', '--frames', '1500', '--seed', '77', '--chars', [c, 'reimu', 'marisa', 'nue'].join(','), '--out', 'reports/affected']); }
  if (items.size) plan.push(['pnpm', '-s', 'parity', '--matrix', '--frames', '700', '--items', [...items].join(','), '--out', 'reports/affected-items'], ['pnpm', '-s', 'exec', 'vitest', 'run', 'tests/parity/items.test.ts', 'tests/parity/items-base.test.ts']);
}
console.log(`changed: ${files.length} file(s); characters: ${[...chars].join(',') || '-'}; items: ${[...items].join(',') || '-'}; core: ${core}\nplan:\n${plan.map(p => '  ' + p.slice(1).join(' ')).join('\n')}${!any ? '\n(only docs/other files changed: nothing to run beyond check:fast)' : ''}\nThen, once per lot: pnpm gate.`);
if (process.argv.includes('--run')) for (const p of plan) { const r = spawnSync(p[0]!, p.slice(1), { stdio: 'inherit' }); if (r.status !== 0) { console.log(`\nAFFECTED FAIL: ${p.slice(1).join(' ')}`); process.exit(1); } }
if (process.argv.includes('--run')) console.log('\nAFFECTED PASS');
