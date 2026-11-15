/* pnpm sim match <proto3-match-*.json> — replays a match recorded in the browser (F8) against the legacy oracle, frame by frame, with the very same inputs.
 * Prints the first divergence (or "identical"). A real human game is the best test input there is; send the file, not a description. */
import { readFileSync } from 'node:fs';
import { BTN } from '../../src/kernel';
import { makePair } from '../../tests/parity/harness';

const m = JSON.parse(readFileSync(process.argv[2]!, 'utf8')) as { cfg: { seed: number; players: number; world: { players: { char: string }[] } }; inputs: number[][] };
const names = Object.keys(BTN) as (keyof typeof BTN)[];
const chars = m.cfg.world.players.map(p => p.char), items = (m.cfg.world as { items?: boolean }).items === false ? [] : makePair(['reimu', 'reimu'], 1).itemNames; // the browser game has every ported item on unless the config says items:false
const k = makePair(chars, m.cfg.seed, items.length ? { items, maxCards: 1 } : {});
let bad = '';
for (let f = 1; f <= m.inputs.length && !bad; f++) {
  const row = m.inputs[f - 1]!;
  k.step(m.cfg.world.players.map((_, p) => () => ({ x: row[p * 3]! / 127, y: row[p * 3 + 1]! / 127, btn: names.filter(n => row[p * 3 + 2]! & BTN[n]) })), f);
  try { k.compare('match'); } catch (e) { bad = `frame ${f}: ${(e as Error).message}`; }
}
console.log(bad ? `DIVERGES ${bad}` : `identical to legacy over ${m.inputs.length} frames`);
process.exit(bad ? 1 : 0);
