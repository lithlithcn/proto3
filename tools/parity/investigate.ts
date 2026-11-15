/* pnpm investigate <report.json> — the investigation orchestrator (DESIGN §28.x). Runs, in order, what an AI would do by hand and prints ONE verdict:
 *   1 classify the divergence   2 MINIMISE the scenario (ddmin over the forced item gives: which gives are really needed)   3 rca (port + legacy traces)
 *   4 test the hypotheses against the facts (each ends CONFIRMED / ELIMINATED / UNKNOWN with its evidence)   5 surface known legacy quirks for every term involved
 *   6 log the start in metrics/log.jsonl (closed by `pnpm parity keep --cause ...`) so the real time-to-fix is measured.
 * The individual tools stay usable alone (pnpm rca, parity replay, spec standin, map). */
import { appendFileSync, mkdirSync, readFileSync } from 'node:fs';
import { analyse, type Facts } from './why';
import { findQuirks, fmt } from '../spec/quirks';
import { play } from './campaign';

interface Rep { a: string; b: string; seed: number; frame: number; sig: string; kind: string; items: string[]; plan?: string; gives: string[]; diffs: string[]; commit?: string; crash?: string }
const base = (sig: string): string => sig.split(' @')[0]!;
const planOf = (r: Rep): string[] => r.plan ? r.plan.split(',') : r.gives.map(g => { const m = /^f(\d+) (\S+)->P(\d)/.exec(g); return m ? `${m[2]}@${m[1]}/${m[3]}` : ''; }).filter(Boolean);

/** Delta-debugging over the gives: smallest subset that still reproduces the same divergence variable. */
function minimise(r: Rep, budget = 14): { needed: string[]; runs: number; note: string } {
  let cur = planOf(r), runs = 0; if (!cur.length) return { needed: [], runs, note: 'no forced gives in this scenario' };
  const still = (g: string[]): boolean => { runs++; const x = play(r.a, r.b, r.seed, r.frame + 80, Infinity, r.items, g.length ? g.join(',') : '-'); return !!x && base(x.sig) === base(r.sig); };
  if (!still(cur)) return { needed: cur, runs, note: 'could not reproduce from the recorded gives alone (cards/random pickups also matter): kept all' };
  let n = 2;
  while (cur.length >= 2 && runs < budget) {
    const size = Math.ceil(cur.length / n); let reduced = false;
    for (let i = 0; i < cur.length && runs < budget; i += size) { const rest = [...cur.slice(0, i), ...cur.slice(i + size)]; if (still(rest)) { cur = rest; n = Math.max(n - 1, 2); reduced = true; break; } }
    if (!reduced) { if (n >= cur.length) break; n = Math.min(cur.length, n * 2); }
  }
  if (cur.length === 1 && runs < budget && still([])) cur = [];
  return { needed: cur, runs, note: runs >= budget ? 'budget hit, may not be minimal' : 'minimal' };
}

type V = 'CONFIRMED' | 'ELIMINATED' | 'UNKNOWN';
function hypotheses(r: Rep, f: Facts, needed: string[]): { v: V; h: string; ev: string }[] {
  const out: { v: V; h: string; ev: string }[] = [], d = (a: [number, number] | null, b: [number, number] | null): number => a && b ? Math.hypot(a[0] - b[0], a[1] - b[1]) : -1;
  const count = /count/.test(r.diffs[0] ?? ''), val = /[PBE]\d+\.\w+/.test(r.diffs[0] ?? '');
  if (count) {
    out.push(f.portSpawn !== f.legSpawn ? { v: 'CONFIRMED', h: 'a spawn exists on one side only', ev: `port spawned ${f.portSpawn}, legacy ${f.legSpawn} this frame (legacy new calls: ${f.fresh.slice(0, 6).join(' ')})` } : { v: 'ELIMINATED', h: 'a spawn exists on one side only', ev: `both spawned ${f.portSpawn}` });
    const dist = d(f.portCenter, f.legCenter);
    if (f.portSpawn === f.legSpawn && f.portSpawn > 0) out.push(dist > 1 ? { v: 'CONFIRMED', h: 'spawned at the wrong place', ev: `centre port (${f.portCenter!.map(x => x.toFixed(0))}) vs legacy (${f.legCenter!.map(x => x.toFixed(0))}), distance ${dist.toFixed(0)} px` } : { v: 'ELIMINATED', h: 'spawned at the wrong place', ev: `centres within ${dist.toFixed(2)} px` });
    const sameSpot = f.portSpawn === 0 || d(f.portCenter, f.legCenter) <= 1;
    out.push(f.portSpawn === f.legSpawn && sameSpot && f.portCount !== f.legCount ? { v: 'CONFIRMED', h: 'one side removed/culled an object the other kept', ev: `same spawns, counts port ${f.portCount} legacy ${f.legCount}` } : { v: 'UNKNOWN', h: 'one side removed/culled an object the other kept', ev: `counts port ${f.portCount} legacy ${f.legCount}` });
  }
  if (val) {
    out.push(f.legWriters.length ? { v: 'CONFIRMED', h: 'legacy changes this variable in a path the port lacks/orders differently', ev: `legacy writer: ${f.legWriters[f.legWriters.length - 1]} | port writer: ${f.portWriters[f.portWriters.length - 1] ?? 'none seen'}` } : { v: 'UNKNOWN', h: 'legacy changes this variable in the last frames', ev: 'no legacy write seen in the window: set earlier or at creation' });
    out.push(f.portWriters.length > 1 && /alternat|->.*->/.test(f.portWriters.slice(-4).join(' ')) ? { v: 'UNKNOWN', h: 'two port systems fight over this variable (update-order difference)', ev: f.portWriters.slice(-4).join(' ; ').slice(0, 220) } : { v: 'ELIMINATED', h: 'two port systems fight over this variable (update-order difference)', ev: 'no alternating writers' });
  }
  if (needed.some(g => /^clone@/.test(g))) out.push({ v: 'CONFIRMED', h: 'Doppelganger stand-in quirk', ev: 'the clone give is NEEDED to reproduce (ddmin) -> see QUIRK clone-standin, run pnpm spec standin' });
  else if (planOf(r).some(g => /^clone@/.test(g))) out.push({ v: 'ELIMINATED', h: 'Doppelganger stand-in quirk', ev: 'reproduces without the clone give' });
  return out;
}

const file = process.argv[2];
if (file) {
  const t0 = Date.now(), r = JSON.parse(readFileSync(file, 'utf8')) as Rep, out: string[] = [];
  out.push(`INVESTIGATE ${r.a}/${r.b} seed ${r.seed} f${r.frame} [${r.kind}] ${r.sig}`);
  out.push(`  first diff: ${(r.diffs[0] ?? r.crash ?? '').trim().slice(0, 200)}`);
  const m = minimise(r); out.push(`MINIMAL SCENARIO: ${m.needed.length ? m.needed.join(', ') : 'no gives needed (plain game)'}  [${m.note}; ${m.runs} replays]  -> replay: pnpm parity replay <report> (plan ${m.needed.join(',') || '-'})`);
  const { text, facts } = analyse({ ...r, gives: r.gives, plan: m.needed.length ? m.needed.join(',') : r.plan } as never);
  out.push('HYPOTHESES:'); for (const h of hypotheses(r, facts, m.needed)) out.push(`  ${h.v.padEnd(10)} ${h.h} — ${h.ev}`);
  const terms = [r.a, r.b, ...m.needed.map(g => g.split('@')[0]!), ...facts.fresh, ...(r.diffs[0] ?? '').split(/[\s.:#=\[\]/]+/)], qs = findQuirks(terms);
  out.push(qs.length ? 'KNOWN QUIRKS (read before changing code):' : 'KNOWN QUIRKS: none matched (a new one? add it with pnpm parity keep --cause)', ...qs.map(q => '  ' + fmt(q)));
  out.push('--- rca digest ---', text);
  mkdirSync('metrics', { recursive: true }); appendFileSync('metrics/log.jsonl', JSON.stringify({ t: new Date().toISOString(), ev: 'investigate', report: file.split('/').pop(), sig: r.sig, ms: Date.now() - t0, minimal: m.needed.length }) + '\n');
  console.log(out.join('\n'));
}
