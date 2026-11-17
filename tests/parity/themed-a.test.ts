import { describe, expect, it } from 'vitest';
import { giveItem } from '../../packs/combat/api';
import { type Script, makePair } from './harness';

type Pair = ReturnType<typeof makePair>;
/** Give item `key` to P0 at frame `at` on both sides, run `n` frames comparing every frame; returns the max of each legacy probe. */
export function themed(key: string, a: Script, b: Script, n: number, probes: string[], opt: { at?: number; seed?: number; chars?: [string, string]; setup?: (k: Pair) => void } = {}): number[] {
  const k = makePair(opt.chars ?? ['reimu', 'reimu'], opt.seed ?? 31, { items: ['green'] });
  opt.setup?.(k);
  const best = probes.map(() => 0), kind = k.kind(key);
  for (let f = 1; f <= n; f++) {
    if (f === (opt.at ?? 60)) { k.legacy.eval(`give(P[0],'${key}')`); giveItem(k.world, k.s, 0, kind, k.s.x[0]!, k.s.y[0]!); }
    k.step([a, b], f); k.compare(key);
    probes.forEach((p, i) => { best[i] = Math.max(best[i]!, Number(k.legacy.eval(p))); });
  }
  return best;
}
const still: Script = () => ({});

describe('parity: themed items, TH6 (vs legacy)', () => {
  it('Rumia: dark orbs home in and eat bullets, mark the foe EDIBLE; Attack swallows it, drains it, spits it at the wall', () => {
    const chaser: Script = f => ({ x: f > 200 && f < 520 ? 1 : 0, btn: f > 300 && f < 520 && f % 12 === 0 ? ['melee'] : [] }); // walk in once the orbs reach the foe (~f350), then bite
    const [edible, eaten, splat, orbs] = themed('rumia', chaser, still, 1100, ['P[1].dark>frame?1:0', "P[1].state==='eaten'?1:0", 'P[1].hp<60?1:0', 'B.filter(b=>b.dark).length']);
    expect(orbs, 'dark orbs were shot').toBeGreaterThan(0);
    void edible; // the mark is consumed by the bite in the same frame here
    expect(eaten, 'the foe was swallowed').toBe(1);
    expect(splat, 'spat into the wall: SPLAT').toBe(1);
  }, 60000);
});
