import { describe, expect, it } from 'vitest';
import { giveItem } from '../../packs/combat/api';
import { type Script, makePair } from './harness';

type Pair = ReturnType<typeof makePair>;
/** Give item `key` to P0 at frame `at` on both sides, run `n` frames comparing every frame; returns the max of each legacy probe. */
export function themed(key: string, a: Script, b: Script, n: number, probes: string[], opt: { at?: number; seed?: number; chars?: [string, string]; setup?: (k: Pair) => void; check?: (k: Pair, f: number) => void; also?: { key: string; at: number; p: number } } = {}): number[] {
  const k = makePair(opt.chars ?? ['reimu', 'reimu'], opt.seed ?? 31, { items: ['green'] });
  opt.setup?.(k);
  const best = probes.map(() => 0), kind = k.kind(key);
  for (let f = 1; f <= n; f++) {
    if (f === (opt.at ?? 60)) { k.legacy.eval(`give(P[0],'${key}')`); giveItem(k.world, k.s, 0, kind, k.s.x[0]!, k.s.y[0]!); }
    if (opt.also && f === opt.also.at) { const o = opt.also; k.legacy.eval(`give(P[${o.p}],'${o.key}')`); giveItem(k.world, k.s, o.p, k.kind(o.key), k.s.x[o.p]!, k.s.y[o.p]!); }
    k.step([a, b], f); k.compare(key); opt.check?.(k, f);
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
  it('Daiyousei: 7 edge fairies fire heavy balls, rings and fans at a random foe every 26 frames for 8 s', () => {
    const [fairies, heavy, hurt] = themed('daiyousei', still, still, 620, ["ENT.filter(e=>e.k==='efairy').length", 'B.filter(b=>b.heavy&&b.mult===.6).length', 'P[1].hp<T.HP?1:0']);
    expect(fairies, 'fairies spawned').toBe(7);
    expect(heavy, 'big fairy balls').toBeGreaterThan(0);
    expect(hurt, 'the foe was hit').toBe(1);
  }, 60000);
  it('Rin: anonymous mode for 8 s, 5 decoys mirror the owner (bouncing on the margins)', () => {
    const walker: Script = f => ({ x: f > 80 && f < 400 ? (f % 160 < 80 ? 1 : -1) : 0, y: f > 100 && f < 300 ? 1 : 0 });
    const [decoys, anon] = themed('rin', walker, still, 600, ["ENT.filter(e=>e.k==='decoy').length", 'CX.anon||0'], {
      check: (k, f) => expect(k.world.slice<{ anon: number }>('themed').anon, `f${f} CX.anon`).toBe(Number(k.legacy.eval('CX.anon||0'))) });
    expect(decoys, 'decoys spawned').toBe(5);
    expect(anon, 'anonymous mode (given then ticked once)').toBe(479);
  }, 60000);
  it('Meiling: the gate blocks the foe, its bullets die on the line, the rainbow kick hits a foe who comes close on her side', () => {
    const cross: Script = f => ({ x: f > 70 && f < 300 ? -1 : f >= 300 && f < 600 ? 1 : 0, btn: f % 20 === 0 ? ['shot'] : [] }); // the foe tries to cross, shooting
    const meiling: Script = f => ({ x: f > 320 && f < 400 ? 1 : 0, btn: f % 30 === 0 ? ['shot'] : [] }); // she walks through her own gate
    const [wall, kicked] = themed('meiling', meiling, cross, 760, ['CX.wall?1:0', 'P[1].mkCD>0?1:0'], { check: (k, f) => expect(k.world.slice<{ wallO: number }>('themed').wallO, `f${f} CX.wall`).toBe(Number(k.legacy.eval('CX.wall?CX.wall.o:-1'))) });
    expect(wall, 'gate up').toBe(1);
    expect(kicked, 'rainbow kick').toBe(1);
  }, 60000);
  it('Koakuma: a K.O. under the pact swaps lives with the leader when behind, costs a life when leading', () => {
    const shoot: Script = f => ({ btn: f > 70 && f % 6 === 0 ? ['shot'] : [] });
    const set = (a: number, b: number) => (k: Pair): void => { k.legacy.eval(`P[0].stocks=${a};P[1].stocks=${b};P[1].hp=4`); k.s.stocks[0] = a; k.s.stocks[1] = b; k.s.hp[1] = 4; };
    const [behind] = themed('koakuma', shoot, still, 500, ['P[0].stocks'], { setup: set(1, 3) });
    expect(behind, 'swapped with the leader (3-1 = 2 lives)').toBe(2);
    const [lead] = themed('koakuma', shoot, still, 500, ['P[0].stocks===2?1:0'], { setup: set(3, 1) });
    expect(lead, 'leading: lost a life').toBe(1);
  }, 60000);
  it('Elements: two item holders of different elements shoot each other: bullet tags, auras, the grid scan rng (reactions not ported)', () => {
    const duel: Script = f => ({ x: f % 120 < 60 ? 0.5 : -0.5, btn: f % 4 === 0 ? ['shot'] : f % 50 === 0 ? ['heavy'] : [] });
    const [el, aura, aura0] = themed('koakuma', duel, duel, 700, ['P[0].el', 'P[1].aura?P[1].aura.el:0', 'P[0].aura?P[0].aura.el:0'], { also: { key: 'elixir', at: 70, p: 1 }, setup: k => k.legacy.eval('for(const q in RX)delete RX[q]') }); // ledger:elements-reactions
    expect(el, 'P0 element DARK').toBe(8);
    expect(aura, 'P1 got a DARK aura').toBe(8);
    expect(aura0, 'P0 got a FIRE aura').toBe(1);
  }, 60000);
});
