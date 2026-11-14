/* Headless runner (DESIGN §19). Usage:
 *   pnpm sim run <replay.json> [--journal]        replay a file, print hash + checkpoint mismatches
 *   pnpm sim demo [frames] [seed]                 run the sandbox with fuzz inputs, print hash and write demo-replay.json
 *   pnpm sim bisect <a.json> <b.json>             first frame/field where two replays diverge
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { type Replay, newInput, playReplay, record, setInput, worldFor } from '../../src/kernel';
import sandbox from '../../packs/sandbox/pack';

const packs = [sandbox];
const [cmd, ...args] = process.argv.slice(2);
const load = (p: string): Replay => JSON.parse(readFileSync(p, 'utf8')) as Replay;

if (cmd === 'run' && args[0]) {
  const r = load(args[0]), out = playReplay(r, packs, { sanitize: true });
  console.log(`frames ${r.frames}  final hash ${out.hash.toString(16)}  mismatches ${out.mismatches.length ? out.mismatches.join(',') : 'none'}`);
  for (const rep of out.world.reports) console.log(`REPORT f${rep.frame} ${rep.code} ${rep.where}: ${rep.message}`);
  process.exit(out.mismatches.length ? 1 : 0);
} else if (cmd === 'demo') {
  const frames = +(args[0] ?? 600), seed = +(args[1] ?? 1);
  let s = 7; const r = (): number => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
  const inputs = Array.from({ length: frames }, () => { const i = newInput(2); for (let p = 0; p < 2; p++) setInput(i, p, Math.round((r() - 0.5) * 254), Math.round((r() - 0.5) * 254), Math.floor(r() * 1024)); return i; });
  const rep = record({ seed, players: 2, packs, loadOrder: [] }, inputs, { sanitize: true });
  writeFileSync('demo-replay.json', JSON.stringify(rep));
  console.log(`wrote demo-replay.json  final hash ${rep.hashes.at(-1)![1].toString(16)}`);
} else if (cmd === 'bisect' && args[0] && args[1]) {
  const a = load(args[0]), b = load(args[1]), wa = worldFor(a, packs), wb = worldFor(b, packs), stride = a.players * 3;
  let found = false;
  for (let f = 0; f < Math.min(a.frames, b.frames) && !found; f++) {
    wa.step(Int32Array.from(a.inputs.slice(f * stride, (f + 1) * stride))); wb.step(Int32Array.from(b.inputs.slice(f * stride, (f + 1) * stride)));
    const d = wa.diff(wa.state, wb.state);
    if (d.length) { console.log(`first divergence after frame ${f + 1}:`); for (const x of d) console.log(`  ${x.slice}: ${x.fields.join(', ')}`); found = true; }
  }
  if (!found) console.log('no divergence');
} else { console.log('usage: pnpm sim run <replay.json> | demo [frames] [seed] | bisect <a.json> <b.json>'); process.exit(2); }
