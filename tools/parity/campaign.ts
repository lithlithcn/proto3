/* Parity campaign: plays many random games against the frozen legacy game and writes one report per divergence / crash.
 *   pnpm parity [--games 200] [--frames 2400] [--seed 1] [--workers N] [--chars a,b,c] [--out reports]
 *   pnpm parity verify [dir]              after a fix: replay every report (+600 frames) -> FIXED / STILL / CHANGED, exit 1 if any still fails
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
const FROM = +opt('from', '0'), OUT = opt('out', 'reports'), FRAMES = +opt('frames', '2400'), SEED0 = +opt('seed', '1'), GAMES = +opt('games', '200');
const ITEMS_OPT = opt('items', 'none'); let ALLI: string[] | undefined; const itemList = (): string[] => ITEMS_OPT === 'none' ? [] : ITEMS_OPT === 'all' ? (ALLI ??= makePair(['reimu', 'reimu'], 1).itemNames) : ITEMS_OPT.split(',');
const CHARS = opt('chars', 'all') === 'all' ? ROSTER : opt('chars', 'all').split(',');
const gameOf = (g: number): { a: string; b: string; seed: number } => ({ a: CHARS[g % CHARS.length]!, b: CHARS[(g * 7 + (g / CHARS.length | 0)) % CHARS.length]!, seed: SEED0 * 100003 + g });
const sigOf = (m: string): string => (/ ([A-Za-z]+\d*\.\w+|[a-z ]+):/.exec(m)?.[1] ?? m.slice(0, 30)).replace(/\d+/g, '#');

const COMMIT = ((): string => { try { const h = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(), d = execSync('git status --porcelain', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); return h + (d ? '+dirty' : ''); } catch { return 'unknown'; } })();
interface Report { commit: string; a: string; b: string; seed: number; frame: number; sig: string; kind: 'diff' | 'crash' | 'anomaly'; items: string[]; gives: string[]; diffs: string[]; crash?: string; inputs: { f: number; p0: unknown; p1: unknown }[]; repro: string; diag?: Diagnosis }

/** Plays one game; returns a report on the first divergence (all differing variables of that frame) or crash, else null. */
export function play(a: string, b: string, seed: number, frames: number, until = Infinity, items: string[] = itemList()): Report | null {
  const ss = session(a, b, seed, items), k = ss.k, ring: Report['inputs'] = [], gives: string[] = []; let nrep = 0;
  const mk = (frame: number, kind: Report['kind'], diffs: string[], crash?: string): Report => ({ commit: COMMIT, a, b, seed, frame, kind, diffs, crash, items, gives: gives.slice(-6), sig: sigOf(diffs[0] ?? crash ?? ''), inputs: ring.slice(), repro: `pnpm parity replay <this file>` });
  for (let f = 1; f <= Math.min(frames, until); f++) {
    const g = ss.pre(f); if (g) gives.push(`f${f} ${g}`); const [i0, i1] = ss.inputs(f); ring.push({ f, p0: i0, p1: i1 }); if (ring.length > 60) ring.shift();
    try { k.step([() => i0, () => i1], f); } catch (e) { return mk(f, 'crash', [], String((e as Error).stack ?? e).split('\n').slice(0, 8).join('\n')); }
    const reps = k.world.reports; if (reps.length > nrep) { const msgs = reps.slice(nrep).map(x => `${x.code} ${x.where}: ${x.message}`); nrep = reps.length; const r = mk(f, 'anomaly', msgs); if (until === Infinity) { const arr = /: (\w+?)(?:\[|\s|=)/.exec(msgs[0]!.split(': ').slice(1).join(': '))?.[1]; r.diag = diagnose(a, b, seed, f, 'anomaly', items, arr); r.sig = `anomaly ${msgs[0]!.split(' ')[1]} @${r.diag.suspect}`; } return r; }
    const d = k.diffs(`${a}/${b}`, 1e-6, 60); if (d.length) { const r = mk(f, 'diff', d); if (until === Infinity) { r.diag = diagnose(a, b, seed, f, d[0]!, items); r.sig += ` @${r.diag.suspect}`; } return r; }
  }
  return null;
}

if (argv[0] === '--worker') { // child: games idx, idx+W, ...
  const idx = +argv[1]!, W = +argv[2]!; mkdirSync(OUT, { recursive: true });
  for (let g = FROM + idx; g < GAMES; g += W) {
    const { a, b, seed } = gameOf(g); const t0 = Date.now(); let r: Report | null = null;
    try { r = play(a, b, seed, FRAMES); } catch (e) { r = { commit: COMMIT, a, b, seed, frame: 0, kind: 'crash', diffs: [], crash: String((e as Error).stack ?? e).split('\n').slice(0, 8).join('\n'), sig: 'setup', inputs: [], repro: '', items: [], gives: [] }; }
    if (r) writeFileSync(`${OUT}/${r.sig.replace(/[^\w.#-]/g, '_')}__${a}-${b}-${seed}.json`, JSON.stringify(r, null, 1));
    console.log(`${r ? 'FAIL' : 'ok  '} #${g} ${a}/${b} seed ${seed} ${r ? `f${r.frame} ${r.sig}` : ''} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
  }
} else if (argv[0] === 'verify') { // after a fix: replay every report of a folder (+600 frames past its divergence) and say FIXED / STILL / CHANGED
  const dir = argv[1] && !argv[1].startsWith('--') ? argv[1] : OUT; let bad = 0;
  for (const fn of readdirSync(dir).filter(x => x.endsWith('.json'))) {
    const r = JSON.parse(readFileSync(`${dir}/${fn}`, 'utf8')) as Report; if (!r.a) continue;
    const again = play(r.a, r.b, r.seed, r.frame + 600, Infinity, r.items), same = again && again.sig === r.sig, st = !again ? 'FIXED  ' : same ? (again.frame === r.frame ? 'STILL  ' : 'MOVED  ') : 'CHANGED';
    if (again) bad++; console.log(`${st} ${fn}${again ? `  -> f${again.frame} ${again.sig}: ${(again.diffs[0] ?? again.crash ?? '').slice(0, 100)}` : ''}`);
  }
  console.log(`\n${bad ? bad + ' report(s) still failing: not done' : 'all reports replay clean'} — now run a fresh campaign (pnpm parity --games 100 --items all) and pnpm check to catch regressions elsewhere`); process.exit(bad ? 1 : 0);
} else if (argv[0] === 'replay' && argv[1]) {
  const r = JSON.parse(readFileSync(argv[1], 'utf8')) as Report; const again = play(r.a, r.b, r.seed, r.frame + 1, r.frame, r.items);
  console.log(`${r.a}/${r.b} seed ${r.seed} frame ${r.frame} (${r.kind})`); console.log((again?.diffs ?? ['no divergence reproduced']).join('\n')); if (r.diag) console.log(JSON.stringify({ cls: r.diag.cls, suspect: r.diag.suspect, onset: r.diag.onset, at: r.diag.at }, null, 1)); if (r.crash) console.log(r.crash);
} else { // parent: spawn workers, then summarise
  rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true });
  const W = Math.max(1, +opt('workers', String(Math.max(1, cpus().length - 1)))), self = fileURLToPath(import.meta.url), t0 = Date.now(); let done = 0, fail = 0;
  const run = (i: number): Promise<void> => new Promise(res => {
    const c = spawn(process.execPath, ['--import', 'tsx', self, '--worker', String(i), String(W), ...argv], { stdio: ['ignore', 'pipe', 'inherit'] });
    c.stdout.on('data', (d: Buffer) => { for (const l of String(d).split('\n').filter(Boolean)) { done++; if (l.startsWith('FAIL')) fail++; if (l.startsWith('FAIL') || done % 10 === 0) console.log(`[${done}/${GAMES}] ${l}`); } });
    c.on('close', () => res());
  });
  await Promise.all(Array.from({ length: W }, (_, i) => run(i)));
  const rs = readdirSync(OUT).filter(f => f.endsWith('.json')).map(f => ({ f, r: JSON.parse(readFileSync(`${OUT}/${f}`, 'utf8')) as Report }));
  const g = new Map<string, typeof rs>(); for (const x of rs) g.set(x.r.sig, [...(g.get(x.r.sig) ?? []), x]);
  const rows = [...g].sort((x, y) => y[1].length - x[1].length).map(([sig, l]) => { const e = l.reduce((m, x) => (x.r.frame < m.r.frame ? x : m)); return `| ${sig} | ${l.length} | ${e.r.diag?.cls ?? e.r.kind} | ${e.r.a}/${e.r.b} | ${e.r.frame} | ${e.f} | ${(e.r.diffs[0] ?? e.r.crash ?? '').split('\n')[0]!.slice(0, 110)} |`; });
  const md = `# Parity campaign\n${GAMES} games x ${FRAMES} frames, seed ${SEED0}, commit ${COMMIT}, ${((Date.now() - t0) / 1000).toFixed(0)}s: **${fail} failing**, ${GAMES - fail} identical to legacy.\n\n| signature (variable @character) | games | class | earliest repro | frame | report file | first difference |\n|---|---|---|---|---|---|---|\n${rows.join('\n')}\n`;
  const probe = makePair(['reimu', 'reimu'], 1), un = probe.uncovered(), ic = invariantCoverage(probe.world); const cov = `\n## Self-diagnosis coverage (fields with a value contract / all fields; the rest only get the NaN/Infinity scan)\n${Object.entries(ic).map(([k, v]) => `- ${k}: ${v.contracts}/${v.fields}`).join('\n')}\n\n## Oracle coverage\nLegacy player fields NOT compared (no same-name port array; to map by hand or justify): ${un.length}\n${un.join(' ')}\n`;
  writeFileSync(`${OUT}/SUMMARY.md`, md + cov); console.log('\n' + md);
  // one self-contained file to send: the summary + the full diagnosis of the earliest repro of each signature (2 shortest per signature, capped)
  let send = md + cov + '\n'; for (const [sig, l] of [...g].sort((x, y) => y[1].length - x[1].length)) for (const x of l.sort((p, q) => p.r.frame - q.r.frame).slice(0, 2)) { const { inputs, ...rest } = x.r; const blob = `\n## ${sig} — ${x.f}\n\`\`\`json\n${JSON.stringify({ ...rest, inputs: inputs.slice(-12) })}\n\`\`\`\n`; if (send.length + blob.length < 150000) send += blob; }
  writeFileSync(`${OUT}/SEND-ME.md`, send); console.log(`\n=> send me ${OUT}/SEND-ME.md (${(send.length / 1024).toFixed(0)} KB); all ${rs.length} reports are in ${OUT}/`);
}
