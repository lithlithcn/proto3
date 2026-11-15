/* pnpm metrics — real productivity numbers from metrics/log.jsonl (written by `pnpm investigate` and `pnpm parity keep`): per fixed bug, time from investigation start to validated fix
 * (wall clock, includes waiting), manual probes used, family, why detection was late. The goal "1 h -> 10 min" is judged here, not guessed. */
import { existsSync, readFileSync } from 'node:fs';

const L = existsSync('metrics/log.jsonl') ? readFileSync('metrics/log.jsonl', 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l) as Record<string, string | number>) : [];
const starts = new Map<string, number>(); const rows: string[] = []; let n = 0, tot = 0, probes = 0, np = 0; const fam = new Map<string, number>();
for (const e of L) {
  if (e['ev'] === 'investigate') starts.set(String(e['report']).replace(/^.*__/, '').replace(/\.json$/, ''), Date.parse(String(e['t'])));
  else if (e['ev'] === 'validated') {
    const key = String(e['report']).replace(/^.*__/, '').replace(/\.json$/, ''), t0 = starts.get(key), min = t0 ? (Date.parse(String(e['t'])) - t0) / 60000 : NaN;
    n++; if (!Number.isNaN(min)) tot += min; if (+e['probes']! >= 0) { probes += +e['probes']!; np++; } fam.set(String(e['family']), (fam.get(String(e['family'])) ?? 0) + 1);
    rows.push(`| ${key} | ${e['family']} | ${Number.isNaN(min) ? '-' : min.toFixed(0) + ' min'} | ${+e['probes']! >= 0 ? e['probes'] : '-'} | ${String(e['cause']).slice(0, 90)} | ${String(e['missed'] || '-').slice(0, 60)} |`);
  }
}
console.log(`# Fix-loop metrics\nfixed bugs logged: ${n}${n ? `, mean investigate->validated ${(tot / Math.max(1, rows.filter(r => !r.includes('| - |')).length)).toFixed(0)} min, manual probes avg ${np ? (probes / np).toFixed(1) : '-'}` : ''}\nfamilies: ${[...fam].map(([k, v]) => `${k} x${v}`).join(', ') || '-'}\n\n| report | family | time | probes | cause | why detection was late |\n|---|---|---|---|---|---|\n${rows.join('\n')}`);
