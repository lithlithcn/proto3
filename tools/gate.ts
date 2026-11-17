/* pnpm gate — THE definition of done for any lot of work (DESIGN §28, CLAUDE.md). One command, in order, stops at the first failure:
 *   1 typecheck + lint + all tests (incl. frozen regressions, contracts, math, diagnostics neutrality)
 *   2 oracle campaign: fresh seed per commit (so repeated gates keep exploring), 0 divergences required (plus, with --items, the MATRIX: every item x every character, 128 short games)
 *   2b with --items: every item of RITEMS rendered after a forced give (render compare STRICT: draws, sounds, juice identical; RITEMS lists excused blocks)
 *   3 coverage never goes down: value-contract fields per pack + oracle-compared fields vs docs/coverage.baseline.json (raise it with --bless)
 * Output ends with one line: GATE PASS / GATE FAIL <step>. Nothing here is optional: a lot is not "done" until it passes. */
import { spawnSync } from 'node:child_process';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { invariantCoverage } from '../src/kernel';
import { makePair } from '../tests/parity/harness';

const argv = process.argv.slice(2), has = (k: string): boolean => argv.includes('--' + k), opt = (k: string, d: string): string => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1]! : d; };
/** Items checked by the render step (forced give, every draw block + sounds + juice identical), with the blocks still excused. Every ported item joins once it passes. */
const RITEMS: [string, string[]][] = [['rumia', []], ['daiyousei', []], ['rin', []], ['meiling', []], ['koakuma', []], ['mirror', []], ['clone', []], ['oni', []], ['bumpers', []]];
const GAMES = opt('games', '40'), FRAMES = opt('frames', '2000'), BASE = 'docs/coverage.baseline.json';
const run = (name: string, cmd: string, args: string[]): void => { console.log(`\n== ${name}`); const r = spawnSync(cmd, args, { stdio: 'inherit' }); if (r.status !== 0) { console.log(`\nGATE FAIL ${name}`); process.exit(1); } };
run('check (typecheck + lint + tests)', 'pnpm', ['-s', 'check']);
const head = (() => { try { return parseInt(execSync('git rev-parse --short=7 HEAD', { encoding: 'utf8' }).trim(), 16) % 90000 + 1000; } catch { return 1; } })();
run(`oracle campaign (${GAMES} games x ${FRAMES} f, seed ${head})`, 'pnpm', ['-s', 'parity', '--games', GAMES, '--frames', FRAMES, '--seed', String(head), '--out', 'reports/gate']);
if (has('items')) run('matrix: every item x every character', 'pnpm', ['-s', 'parity', '--matrix', '--frames', '700', '--seed', String(head + 1), '--out', 'reports/gate-items']);
if (has('items')) for (const [it, skip] of RITEMS) { // per themed item: visuals + sounds + juice vs legacy after a forced give (known gaps listed in RITEMS)
  console.log(`\n== render: ${it}`); const blocks = ['drawActs', 'drawHUD', 'drawP', 'drawHeavy', 'drawWorldItems', 'drawView', 'sounds', 'juice'].filter(b => !skip.includes(b));
  const r = spawnSync('pnpm', ['-s', 'render', 'compare', 'reimu,marisa', '450', '1'], { encoding: 'utf8', env: { ...process.env, PLAN: `${it}@100/0`, STRICT: blocks.join(',') } });
  const out = (r.stdout ?? '') + (r.stderr ?? ''); if (r.status !== 0) { console.log(out); console.log(`\nGATE FAIL render ${it}`); process.exit(1); } console.log('identical: ' + blocks.join(' '));
}
console.log('\n== coverage ratchet');
const probe = makePair(['reimu', 'reimu'], 1), ic = invariantCoverage(probe.world), now: Record<string, number> = { oracleUncovered: probe.uncovered().length };
for (const [pack, c] of Object.entries(ic)) now[`contracts:${pack}`] = c.contracts;
if (has('bless') || !existsSync(BASE)) { writeFileSync(BASE, JSON.stringify(now, null, 1) + '\n'); console.log(`baseline written: ${JSON.stringify(now)}`); }
else {
  const base = JSON.parse(readFileSync(BASE, 'utf8')) as Record<string, number>, bad: string[] = [];
  for (const k of Object.keys(base)) if (k === 'oracleUncovered' ? now[k]! > base[k]! : (now[k] ?? 0) < base[k]!) bad.push(`${k}: baseline ${base[k]} -> now ${now[k]}`);
  if (bad.length) { console.log(`coverage went DOWN:\n  ${bad.join('\n  ')}\n(if intentional: pnpm gate --bless)\n\nGATE FAIL coverage`); process.exit(1); }
  console.log(`coverage ok: ${JSON.stringify(now)}`);
}
console.log(`\n${(await import('./spec/ledger')).summary()}\n(GATE PASS = the configured checks pass; it does NOT mean the port is complete: see the ledger above)`);
console.log('\nGATE PASS');
