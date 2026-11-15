/* Parity campaign: plays many random games against the frozen legacy game and writes one report per divergence / crash.
 *   pnpm parity [--games 200] [--frames 2400] [--seed 1] [--workers N] [--chars a,b,c] [--out reports]
 *   pnpm parity --matrix [--frames 700]   EVERY item x EVERY character as holder (scripted give at f40, opponents rotate): systematic, replaces the seed lottery for item/character interactions
 *   pnpm parity verify [dir]              after a fix: replay every report (full original length, >= +600 frames) -> FIXED / STILL / CHANGED, exit 1 if any still fails
 *   pnpm parity keep <report.json>        freeze a FIXED bug as a permanent regression scenario in tests/regressions/ (run by `pnpm test`)
 *   pnpm parity replay <report.json>      re-run one report and print every differing variable at its frame
 * Reports are plain JSON (+ SUMMARY.md): send the reports/ folder (or just SUMMARY.md + a few files) to Claude. */
import { execSync, spawn } from 'node:child_process';
import { cpus } from 'node:os';
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { makePair } from '../../tests/parity/harness';
import { ROSTER } from '../../tests/parity/fuzzbot';
import { session } from './session';
import { invariantCoverage } from '../../src/kernel';
import { diagnose, type Diagnosis } from './diagnose';

const argv = process.argv.slice(2), opt = (k: string, d: string): string => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1]! : d; };
const MATRIX = argv.includes('--matrix'), FROM = +opt('from', '0'), OUT = opt('out', 'reports'), FRAMES = +opt('frames', '2400'), SEED0 = +opt('seed', '1'), GAMES = +opt('games', MATRIX ? '0' : '200'), WINDOW = +opt('window', '60');
const ITEMS_OPT = opt('items', MATRIX ? 'all' : 'none'); let ALLI: string[] | undefined; const itemList = (): string[] => ITEMS_OPT === 'none' ? [] : ITEMS_OPT === 'all' ? (ALLI ??= makePair(['reimu', 'reimu'], 1).itemNames) : ITEMS_OPT.split(',');
const CHARS = opt('chars', 'all') === 'all' ? ROSTER : opt('chars', 'all').split(',');
const NGAMES = MATRIX ? CHARS.length * itemList().length : GAMES;
const gameOf = (g: number): { a: string; b: string; seed: number } => ({ a: CHARS[g % CHARS.length]!, b: CHARS[(g * 7 + (g / CHARS.length | 0)) % CHARS.length]!, seed: SEED0 * 100003 + g });
/** matrix game g: holder = CHARS[g % n], item = items[g / n], opponent rotates with the item index so every pairing family is met; item forced on P0 at f40. */
const matrixOf = (g: number): { a: string; b: string; seed: number; items: string[]; plan: string } => { const its = itemList(), n = CHARS.length, ci = g % n, ii = (g / n | 0) % its.length; return { a: CHARS[ci]!, b: CHARS[(ci + 1 + ii % (n - 1)) % n]!, seed: SEED0 * 100003 + g, items: [its[ii]!], plan: `${its[ii]}@40/0` }; };
const sigOf = (m: string): string => (/ ([A-Za-z]+\d*\.\w+|[a-z ]+):/.exec(m)?.[1] ?? m.slice(0, 30)).replace(/\d+/g, '#');

const COMMIT = ((): string => { try { const h = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(), d = execSync('git status --porcelain', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); return h + (d ? '+dirty' : ''); } catch { return 'unknown'; } })();
interface Report { commit: string; frames: number; a: string; b: string; seed: number; frame: number; sig: string; kind: 'diff' | 'crash' | 'anomaly'; items: string[]; plan?: string; gives: string[]; diffs: string[]; crash?: string; inputs: { f: number; p0: unknown; p1: unknown }[]; repro: string; diag?: Diagnosis }

/** Plays one game; returns a report on the first divergence (all differing variables of that frame) or crash, else null. */
export function play(a: string, b: string, seed: number, frames: number, until = Infinity, items: string[] = itemList(), plan = ''): Report | null {
  const ss = session(a, b, seed, items, plan), k = ss.k, ring: Report['inputs'] = [], gives: string[] = []; let nrep = 0;
  const mk = (frame: number, kind: Report['kind'], diffs: string[], crash?: string): Report => ({ commit: COMMIT, frames, a, b, seed, frame, kind, diffs, crash, items, plan, gives: gives.slice(-40), sig: sigOf(diffs[0] ?? crash ?? ''), inputs: ring.slice(), repro: `pnpm parity replay <this file>` });
  for (let f = 1; f <= Math.min(frames, until); f++) {
    const g = ss.pre(f); if (g) gives.push(`f${f} ${g}`); const [i0, i1] = ss.inputs(f); ring.push({ f, p0: i0, p1: i1 }); if (ring.length > 60) ring.shift();
    try { k.step([() => i0, () => i1], f); } catch (e) { return mk(f, 'crash', [], String((e as Error).stack ?? e).split('\n').slice(0, 8).join('\n')); }
    const reps = k.world.reports; if (reps.length > nrep) { const msgs = reps.slice(nrep).map(x => `${x.code} ${x.where}: ${x.message}`); nrep = reps.length; const r = mk(f, 'anomaly', msgs); if (until === Infinity) { const arr = /: (\w+?)(?:\[|\s|=)/.exec(msgs[0]!.split(': ').slice(1).join(': '))?.[1]; r.diag = diagnose(a, b, seed, f, 'anomaly', items, arr, WINDOW, plan); r.sig = `anomaly ${msgs[0]!.split(' ')[1]} @${r.diag.suspect}`; } return r; }
    const d = k.diffs(`${a}/${b}`, 1e-6, 60); if (d.length) { const r = mk(f, 'diff', d); if (until === Infinity) { r.diag = diagnose(a, b, seed, f, d[0]!, items, undefined, WINDOW, plan); r.sig += ` @${r.diag.suspect}`; } return r; }
  }
  return null;
}

const isMain = process.argv[1] !== undefined && fileURLToPath(import.meta.url) === process.argv[1].replace(/\.ts$/, '') + (process.argv[1].endsWith('.ts') ? '.ts' : '');
if (!isMain) { /* imported by tests: expose play() only */ } else if (argv[0] === '--worker') { // child: games idx, idx+W, ...
  const idx = +argv[1]!, W = +argv[2]!; mkdirSync(OUT, { recursive: true });
  for (let g = FROM + idx; g < NGAMES; g += W) {
    const m = MATRIX ? matrixOf(g) : null, { a, b, seed } = m ?? gameOf(g); const t0 = Date.now(); let r: Report | null = null;
    try { r = m ? play(a, b, seed, FRAMES, Infinity, m.items, m.plan) : play(a, b, seed, FRAMES); } catch (e) { r = { commit: COMMIT, frames: FRAMES, a, b, seed, frame: 0, kind: 'crash', diffs: [], crash: String((e as Error).stack ?? e).split('\n').slice(0, 8).join('\n'), sig: 'setup', inputs: [], repro: '', items: [], gives: [] }; }
    if (r) writeFileSync(`${OUT}/${r.sig.replace(/[^\w.#-]/g, '_')}__${a}-${b}-${seed}.json`, JSON.stringify(r, null, 1));
    console.log(`${r ? 'FAIL' : 'ok  '} #${g} ${a}/${b} seed ${seed} ${r ? `f${r.frame} ${r.sig}` : ''} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
  }
} else if (argv[0] === 'verify') { // after a fix: replay every report of a folder (to its original game length, at least +600 frames past the divergence: a bug that merely moved later is MOVED/CHANGED, never FIXED) and say FIXED / STILL / CHANGED
  const dir = argv[1] && !argv[1].startsWith('--') ? argv[1] : OUT; let bad = 0;
  for (const fn of readdirSync(dir).filter(x => x.endsWith('.json'))) {
    const r = JSON.parse(readFileSync(`${dir}/${fn}`, 'utf8')) as Report; if (!r.a) continue;
    const again = play(r.a, r.b, r.seed, Math.max(r.frame + 600, r.frames ?? 0), Infinity, r.items, r.plan), same = again && again.sig === r.sig, st = !again ? 'FIXED  ' : same ? (again.frame === r.frame ? 'STILL  ' : 'MOVED  ') : 'CHANGED';
    if (again) bad++; console.log(`${st} ${fn}${again ? `  -> f${again.frame} ${again.sig}: ${(again.diffs[0] ?? again.crash ?? '').slice(0, 100)}` : ''}`);
  }
  console.log(`\n${bad ? bad + ' report(s) still failing: not done' : 'all reports replay clean'} — now run a fresh campaign (pnpm parity --games 100 --items all) and pnpm check to catch regressions elsewhere`); process.exit(bad ? 1 : 0);
} else if (argv[0] === 'keep' && argv[1]) {
  // post-mortem is MANDATORY: every fixed bug teaches the environment (DESIGN §28.x): --cause "<confirmed root cause>" [--family x] [--quirk <id> --tags a,b --port path1,path2] [--missed "why detection was late"] [--probes N manual probes used]
  if (!argv.includes('--cause')) { console.error('keep needs --cause "<confirmed root cause>" (and ideally --family, --quirk <id> --tags a,b --port files, --missed "<why it was not caught earlier>", --probes N)'); process.exit(2); }
  const o = (k: string): string | undefined => { const i = argv.indexOf('--' + k); return i > 0 ? argv[i + 1] : undefined; };
  const { readFileSync: rf, writeFileSync: wf, appendFileSync: af } = await import('node:fs'), cause = o('cause')!;
  if (o('quirk')) { const q = JSON.parse(rf('docs/quirks.json', 'utf8')) as { quirks: { id: string }[] }; if (!q.quirks.some(x => x.id === o('quirk'))) { q.quirks.push({ id: o('quirk')!, tags: (o('tags') ?? '').split(',').filter(Boolean), rule: cause, port: (o('port') ?? '').split(',').filter(Boolean), family: o('family') ?? 'misc', found: new Date().toISOString().slice(0, 10) } as never); wf('docs/quirks.json', JSON.stringify(q, null, 1) + '\n'); console.log(`quirk ${o('quirk')} added to docs/quirks.json`); } }
  mkdirSync('metrics', { recursive: true }); af('metrics/log.jsonl', JSON.stringify({ t: new Date().toISOString(), ev: 'validated', report: argv[1]!.split('/').pop(), cause, family: o('family') ?? 'misc', missed: o('missed') ?? '', probes: +(o('probes') ?? '-1') }) + '\n'); // regression kit: the scenario (chars, seed, items; inputs are regenerated deterministically) + how far to run it
  const r = JSON.parse(readFileSync(argv[1], 'utf8')) as Report; mkdirSync('tests/regressions', { recursive: true });
  const name = `${r.sig.replace(/[^\w#-]+/g, '_')}__${r.a}-${r.b}-${r.seed}`, spec = { a: r.a, b: r.b, seed: r.seed, items: r.items, plan: r.plan, frames: Math.max(r.frame + 600, r.frames ?? 0), was: { frame: r.frame, sig: r.sig, first: r.diffs[0] ?? r.crash ?? '', commit: r.commit } };
  writeFileSync(`tests/regressions/${name}.json`, JSON.stringify(spec, null, 1)); console.log(`kept tests/regressions/${name}.json (${spec.frames} frames)`);
} else if (argv[0] === 'replay' && argv[1]) {
  const r = JSON.parse(readFileSync(argv[1], 'utf8')) as Report; const again = play(r.a, r.b, r.seed, r.frame + 1, r.frame, r.items, r.plan);
  console.log(`${r.a}/${r.b} seed ${r.seed} frame ${r.frame} (${r.kind})`); console.log((again?.diffs ?? ['no divergence reproduced']).join('\n')); if (r.diag) console.log(JSON.stringify({ cls: r.diag.cls, suspect: r.diag.suspect, onset: r.diag.onset, at: r.diag.at }, null, 1)); if (r.crash) console.log(r.crash);
} else { // parent: spawn workers, then summarise
  rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true });
  const W = Math.max(1, +opt('workers', String(cpus().length))), self = fileURLToPath(import.meta.url), t0 = Date.now(); let done = 0, fail = 0;
  const run = (i: number): Promise<void> => new Promise(res => {
    const c = spawn(process.execPath, ['--import', 'tsx', self, '--worker', String(i), String(W), ...argv], { stdio: ['ignore', 'pipe', 'inherit'] });
    c.stdout.on('data', (d: Buffer) => { for (const l of String(d).split('\n').filter(Boolean)) { done++; if (l.startsWith('FAIL')) fail++; if (l.startsWith('FAIL') || done % 10 === 0) console.log(`[${done}/${NGAMES}] ${l}`); } });
    c.on('close', () => res());
  });
  await Promise.all(Array.from({ length: W }, (_, i) => run(i)));
  const rs = readdirSync(OUT).filter(f => f.endsWith('.json')).map(f => ({ f, r: JSON.parse(readFileSync(`${OUT}/${f}`, 'utf8')) as Report }));
  const g = new Map<string, typeof rs>(); for (const x of rs) g.set(x.r.sig, [...(g.get(x.r.sig) ?? []), x]);
  const rows = [...g].sort((x, y) => y[1].length - x[1].length).map(([sig, l]) => { const e = l.reduce((m, x) => (x.r.frame < m.r.frame ? x : m)); return `| ${sig} | ${l.length} | ${e.r.diag?.cls ?? e.r.kind} | ${e.r.a}/${e.r.b} | ${e.r.frame} | ${e.f} | ${(e.r.diffs[0] ?? e.r.crash ?? '').split('\n')[0]!.slice(0, 110)} |`; });
  const md = `# Parity campaign\n${NGAMES} games x ${FRAMES} frames${MATRIX ? ' (matrix: every item x every character)' : ''}, seed ${SEED0}, commit ${COMMIT}, ${((Date.now() - t0) / 1000).toFixed(0)}s: **${fail} failing**, ${NGAMES - fail} identical to legacy.\n\n| signature (variable @character) | games | class | earliest repro | frame | report file | first difference |\n|---|---|---|---|---|---|---|\n${rows.join('\n')}\n`;
  const probe = makePair(['reimu', 'reimu'], 1), un = probe.uncovered(), ic = invariantCoverage(probe.world); const cov = `\n## Self-diagnosis coverage (fields with a value contract / all fields; the rest only get the NaN/Infinity scan)\n${Object.entries(ic).map(([k, v]) => `- ${k}: ${v.contracts}/${v.fields}`).join('\n')}\n\n## Oracle coverage\nLegacy player fields NOT compared (no same-name port array; to map by hand or justify): ${un.length}\n${un.join(' ')}\n`;
  writeFileSync(`${OUT}/SUMMARY.md`, md + cov); console.log('\n' + md);
  // one self-contained file to send: the summary + the full diagnosis of the earliest repro of each signature (2 shortest per signature, capped)
  let send = md + cov + '\n'; for (const [sig, l] of [...g].sort((x, y) => y[1].length - x[1].length)) for (const x of l.sort((p, q) => p.r.frame - q.r.frame).slice(0, 2)) { const { inputs, ...rest } = x.r; const blob = `\n## ${sig} — ${x.f}\n\`\`\`json\n${JSON.stringify({ ...rest, inputs: inputs.slice(-12) })}\n\`\`\`\n`; if (send.length + blob.length < 150000) send += blob; }
  writeFileSync(`${OUT}/SEND-ME.md`, send); console.log(`\n=> send me ${OUT}/SEND-ME.md (${(send.length / 1024).toFixed(0)} KB); all ${rs.length} reports are in ${OUT}/`);
}
