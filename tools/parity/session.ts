/* One simulated game (shared by the campaign and the diagnosis so both replay exactly the same thing): two bots + optional forced item gives. Test-side only. */
import { giveItem } from '../../packs/combat/api';
import { makePair } from '../../tests/parity/harness';
import { bot } from '../../tests/parity/fuzzbot';

export interface Session { k: ReturnType<typeof makePair>; inputs(f: number): [ReturnType<typeof bot> extends (f: number) => infer R ? R : never, ReturnType<typeof bot> extends (f: number) => infer R ? R : never]; pre(f: number): string | null }
const lcg = (seed: number) => { let x = seed >>> 0 || 1; return (): number => (x = (Math.imul(x, 1664525) + 1013904223) >>> 0) / 4294967296; };

/** `items`: names of the item cards enabled in both sims (cards spawn by themselves) AND forced onto a random player every ~200-500 frames. */
export function session(a: string, b: string, seed: number, items: string[] = []): Session {
  const k = makePair([a, b], seed, items.length ? { items, maxCards: 1 } : {}), s0 = bot(k, 0, seed * 3), s1 = bot(k, 1, seed * 7), r = lcg(seed * 11 + 5);
  // KNOWN GAP (INVENTORY: elements/reactions, themed-items lot 1): the port has no element reactions yet, so the oracle runs legacy without them. Remove this line when they are ported.
  k.legacy.eval('for(const q in RX)delete RX[q]');
  let next = 150 + (r() * 250 | 0);
  return {
    k, inputs: f => [s0(f), s1(f)],
    /** Runs before the step of frame f: forces an item into both sims; returns what it gave. */
    pre(f) {
      if (!items.length || f < next) return null; next = f + 200 + (r() * 300 | 0);
      const name = items[r() * items.length | 0]!, p = r() * 2 | 0;
      // legacy spawns some items at the global card position `item`: put it on the receiver, like a real capture
      k.legacy.eval(`{const it0=item;item={x:P[${p}].x,y:P[${p}].y};give(P[${p}],'${name}');item=it0}`); giveItem(k.world, k.s, p, k.kind(name), k.s.x[p]!, k.s.y[p]!); return `${name}->P${p}`;
    },
  };
}
