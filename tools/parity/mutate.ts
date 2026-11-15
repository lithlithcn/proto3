/* Mutation testing of the DETECTORS (DESIGN §28). Injects known, realistic bugs one at a time into the port, runs a short campaign and records
 * whether the legacy oracle and/or the self-diagnosis (invariants) noticed. Survivors = blind spots (or equivalent mutants): a measured
 * answer to "is the detection good enough?". Always restores the file from a backup, even on Ctrl-C.
 *   pnpm mutate [--games 16] [--frames 1200] [--only id1,id2] */
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

interface Mutant { id: string; kind: string; file: string; find: string; replace: string; items?: boolean }
const T = 'packs/combat/tuning.ts', H = 'packs/combat/player/hit.ts', D = 'packs/combat/player/damage.ts';
const M: Mutant[] = [
  { id: 'hit-gain', kind: 'balance', file: T, find: 'HIT_GAIN: 0.3', replace: 'HIT_GAIN: 0.35' },
  { id: 'graze-gain', kind: 'balance', file: T, find: 'GRAZE_GAIN: 1.2', replace: 'GRAZE_GAIN: 1.25' },
  { id: 'respawn-inv-off1', kind: 'off-by-one', file: T, find: 'RESPAWN_INV: 120', replace: 'RESPAWN_INV: 119' },
  { id: 'dash-cost', kind: 'balance', file: T, find: 'DASH_COST: 1,', replace: 'DASH_COST: 2,' },
  { id: 'parry-radius', kind: 'balance', file: T, find: 'PARRY_R: 30', replace: 'PARRY_R: 31' },
  { id: 'graze-boundary', kind: 'boundary', file: 'packs/combat/bullets/update.ts', find: 'd < r + T.GRAZE_R) { s.bflags[i]', replace: 'd <= r + T.GRAZE_R) { s.bflags[i]' },
  { id: 'hit-hp-drift', kind: 'subtle-math', file: H, find: 's.hp[v] = s.hp[v]! - dmg; s.flash[v] = 8; s.combo[v]', replace: 's.hp[v] = s.hp[v]! - dmg * 1.001; s.flash[v] = 8; s.combo[v]' },
  { id: 'damage-offset', kind: 'subtle-math', file: D, find: 'const d = raw * damageMul(', replace: 'const d = (raw + 0.01) * damageMul(' },
  { id: 'streak-not-reset', kind: 'missing-effect', file: D, find: 's.pStk[victim] = 0; ', replace: '' },
  { id: 'inv-threshold', kind: 'boundary', file: H, find: 'if (s.inv[v]! > 0 || s.state[v] === PS.dead) return;', replace: 'if (s.inv[v]! > 1 || s.state[v] === PS.dead) return;' },
  { id: 'shot-cd-focus', kind: 'balance', file: 'packs/combat/player/idle.ts', find: 'ch.cd * (focus ? 0.75 : 1)', replace: 'ch.cd * (focus ? 0.85 : 1)' },
  { id: 'hit-spirit-gain', kind: 'subtle-math', file: H, find: 's.spirit[a] = Math.min(T.SPIRIT_MAX, s.spirit[a]! + dmg * T.HIT_GAIN); s.spirit[v]', replace: 's.spirit[a] = Math.min(T.SPIRIT_MAX, s.spirit[a]! + dmg * T.HIT_GAIN * 1.01); s.spirit[v]' },
  { id: 'wall-bounce-damp', kind: 'balance', file: 'packs/combat/player/physics.ts', find: 'v[p]! * -0.85', replace: 'v[p]! * -0.86' },
  { id: 'heavy-fake-filter', kind: 'regression(R112)', file: 'packs/combat/bullets/heavy.ts', find: 'BF.breaker | BF.fake)) === BF.heavy', replace: 'BF.breaker)) === BF.heavy', items: true },
  { id: 'caster-follow', kind: 'regression(R113)', file: 'packs/combat/bullets/pattern.ts', find: 'const p = s.bcast[i]!;', replace: 'const p = s.bowner[i]!;' },
  { id: 'heavy-arm-boundary', kind: 'boundary', file: 'packs/combat/bullets/heavy.ts', find: 'const armed = s.bdist[i]! >= s.barm[i]!', replace: 'const armed = s.bdist[i]! > s.barm[i]!' },
  { id: 'spell-refuse-cd', kind: 'off-by-one', file: 'packs/combat/player/spell.ts', find: 's.spRef[p] = s.gf + 45', replace: 's.spRef[p] = s.gf + 44' },
  { id: 'marisa-dashatk-kb', kind: 'character', file: 'packs/touhou/characters/marisa/melee.ts', find: 'dmg: 9, kb: 12, stun: 28', replace: 'dmg: 9, kb: 13, stun: 28' },
  { id: 'math-atan2-zero', kind: 'math', file: 'src/kernel/math.ts', find: 'return y >= 0 ? atan(y / x) + PI : atan(y / x) - PI;', replace: 'return y > 0 ? atan(y / x) + PI : atan(y / x) - PI;' },
  { id: 'fairy-steal', kind: 'item', file: 'packs/combat/items/fairy.ts', find: 'steal: 15', replace: 'steal: 16', items: true },
];

const argv = process.argv.slice(2), opt = (k: string, d: string): string => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1]! : d; };
const GAMES = opt('games', '16'), FRAMES = opt('frames', '1200'), ONLY = opt('only', '').split(',').filter(Boolean), OUT = '/tmp/mutants';
const results: string[] = [];
let active: { file: string; bak: string } | null = null;
const restore = (): void => { if (active) { copyFileSync(active.bak, active.file); active = null; } };
process.on('SIGINT', () => { restore(); process.exit(130); }); process.on('exit', restore);
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true });
for (const m of M) {
  if (ONLY.length && !ONLY.includes(m.id)) continue;
  const src = readFileSync(m.file, 'utf8');
  if (!src.includes(m.find)) { results.push(`| ${m.id} | ${m.kind} | - | SKIPPED: pattern not found (code moved?) | |`); continue; }
  const bak = `${OUT}/${m.id}.bak`; copyFileSync(m.file, bak); active = { file: m.file, bak };
  writeFileSync(m.file, src.replace(m.find, m.replace));
  const dir = `${OUT}/${m.id}`, t0 = Date.now();
  const r = spawnSync('pnpm', ['-s', 'parity', '--games', GAMES, '--frames', FRAMES, '--seed', '5', '--out', dir, ...(m.items ? ['--items', 'all'] : [])], { encoding: 'utf8', timeout: 900000 });
  const reps0 = existsSync(dir) ? readdirSync(dir).filter(f => f.endsWith('.json')).length : 0; // second channel for survivors: frozen regressions + content contracts (the cheap tests that run on every `pnpm check`)
  const tests = reps0 || r.status !== 0 ? null : spawnSync('npx', ['vitest', 'run', 'tests/regressions.test.ts', 'tests/contracts.test.ts', 'tests/math-legacy.test.ts'], { encoding: 'utf8', timeout: 900000 });
  restore();
  const reps = existsSync(dir) ? readdirSync(dir).filter(f => f.endsWith('.json')).map(f => JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')) as { kind: string; frame: number; sig: string; diffs: string[] }) : [];
  const first = reps.sort((a, b) => a.frame - b.frame)[0], kinds = [...new Set(reps.map(x => x.kind))].join('+');
  const byTests = !!tests && tests.status !== 0, ok = reps.length > 0 || byTests, crashedRun = r.status !== 0 && !reps.length;
  results.push(`| ${m.id} | ${m.kind} | ${byTests ? 'KILLED' : ok ? 'KILLED' : crashedRun ? 'RUN-ERROR' : 'SURVIVED'} | ${byTests ? 'caught by frozen regression / contract tests only (campaign saw nothing)' : ok ? `${reps.length} report(s) [${kinds}], earliest f${first!.frame}: ${first!.sig}` : crashedRun ? String(r.stderr).slice(0, 80) : 'nothing noticed'} | ${((Date.now() - t0) / 1000) | 0}s |`);
  console.log(results.at(-1));
}
const killed = results.filter(r => r.includes('| KILLED |')).length, valid = results.filter(r => r.includes('| KILLED |') || r.includes('| SURVIVED |')).length;
const md = `# Detector mutation score\n${killed}/${valid} mutants noticed (${GAMES} games x ${FRAMES} frames). Survivors are blind spots OR equivalent mutants: inspect each.\n\n| mutant | kind | verdict | first detection | time |\n|---|---|---|---|---|\n${results.join('\n')}\n`;
writeFileSync('docs/MUTATION.generated.md', md); console.log(`\n${killed}/${valid} killed -> docs/MUTATION.generated.md`);
