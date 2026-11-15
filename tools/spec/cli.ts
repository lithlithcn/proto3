/* Spec & knowledge tools (DESIGN §27).
 *   pnpm spec lock            regenerate docs/contracts.lock.json (do it only when a content change is INTENDED; state why in the commit)
 *   pnpm spec check           diff current content vs the lock (same check as tests/contracts.test.ts)
 *   pnpm map <term>           everything an AI needs before touching <term>: pack/system/event/content id/file -> owner, deps, systems, events, invariants,
 *                             content numbers, tests, docs, frozen regressions. Derived from the live registries: nothing to keep in sync by hand. */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolvePacks } from '../../src/kernel';
import { PACKS, contracts, diffContracts } from './contracts';

const LOCK = 'docs/contracts.lock.json', [cmd, ...args] = process.argv.slice(2);
const sh = (c: string): string => { try { return execSync(c, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return ''; } };
if (cmd === 'lock') { const c = contracts(); writeFileSync(LOCK, JSON.stringify(c, null, 1) + '\n'); console.log(`wrote ${LOCK}: ${Object.keys(c).length} numeric contracts`); }
else if (cmd === 'check') { const d = diffContracts(JSON.parse(readFileSync(LOCK, 'utf8')), contracts()); console.log(d.length ? d.join('\n') + `\n${d.length} contract change(s): intended? -> pnpm spec lock` : 'contracts match the lock'); process.exit(d.length ? 1 : 0); }
else if (cmd === 'map' && args[0]) {
  const q = args[0].toLowerCase(), { ordered, registry } = resolvePacks(PACKS), out: string[] = [], c = contracts();
  for (const p of ordered) {
    const hit = p.id.toLowerCase() === q;
    if (hit) out.push(`PACK ${p.id}@${p.version} requires [${(p.requires ?? []).join(', ')}] contentTypes [${(p.contentTypes ?? []).join(', ')}]\n  systems: ${(p.systems ?? []).map(s => `${s.phase}:${s.id}`).join(' → ')}\n  events: ${(p.events ?? []).join(', ')}\n  rng: ${(p.rng ?? []).join(', ')}`);
    for (const s of p.systems ?? []) if (hit || s.id.toLowerCase().includes(q)) out.push(`SYSTEM ${p.id}/${s.id} phase ${s.phase} after [${(s.after ?? []).join(', ')}]`);
    for (const e of p.events ?? []) if (e.toLowerCase().includes(q)) out.push(`EVENT ${e} declared by ${p.id}`);
    for (const i of p.invariants ?? []) if (hit || JSON.stringify(i, (_, v) => typeof v === 'function' ? undefined : v).toLowerCase().includes(q)) out.push(`INVARIANT ${p.id}: ${(i as { id: string }).id} covers ${JSON.stringify((i as { covers?: unknown }).covers ?? [])}`);
    for (const h of p.hooks ?? []) if (h.id.toLowerCase().includes(q) || h.event.toLowerCase().includes(q)) out.push(`HOOK ${p.id}/${h.id} on ${h.event} (${h.phase})`);
  }
  for (const t of registry.types()) for (const [id] of registry.list(t)) if (id.toLowerCase().includes(q)) {
    const vals = Object.entries(c).filter(([k]) => k.toLowerCase().startsWith(`${t}:${id}.`.toLowerCase())).slice(0, 40).map(([k, v]) => `${k.slice(t.length + id.length + 2)}=${v}`);
    out.push(`CONTENT ${t}:${id}  numbers: ${vals.join(' ') || '(none)'}`);
  }
  const mv = Object.entries(c).filter(([k]) => k.startsWith('moves:default.') && k.toLowerCase().includes(q)).slice(0, 20); if (mv.length) out.push(`MOVES ${mv.map(([k, v]) => `${k.slice(14)}=${v}`).join(' ')}`);
  const tn = Object.entries(c).filter(([k]) => k.startsWith('tuning:T.') && k.toLowerCase().includes(q)); if (tn.length) out.push(`TUNING ${tn.map(([k, v]) => `${k.slice(9)}=${v}`).join(' ')}`);
  const files = sh(`git ls-files | grep -i -- "${q.replace(/[^a-z0-9_-]/g, '')}" | head -15`), tests = sh(`git grep -il -- "${q.replace(/[^a-z0-9_ -]/g, '')}" -- tests | head -12`), docs = sh(`git grep -n -i -- "${q.replace(/[^a-z0-9_ -]/g, '')}" -- docs/DESIGN.md PROJECT_MAP.md | cut -c1-140 | head -8`);
  const reg = existsSync('tests/regressions') ? readdirSync('tests/regressions').filter(f => f.toLowerCase().includes(q)) : [];
  if (files) out.push(`FILES\n  ${files.replace(/\n/g, '\n  ')}`); if (tests) out.push(`TESTS mentioning it\n  ${tests.replace(/\n/g, '\n  ')}`); if (docs) out.push(`DOCS\n  ${docs.replace(/\n/g, '\n  ')}`); if (reg.length) out.push(`FROZEN REGRESSIONS ${reg.join(', ')}`);
  console.log(out.join('\n') || `nothing matches '${args[0]}'`);
} else console.log('usage: pnpm spec lock|check   |   pnpm map <pack|system|event|content id|file|move>');
