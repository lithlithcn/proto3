import { describe, expect, it } from 'vitest';
import { giveItem } from '../../packs/combat/api';
import { type Script, makePair } from './harness';

type Pair = ReturnType<typeof makePair>;
const still: Script = () => ({});
/** Give `name` to P0 at frame `at` on both sides, run `n` frames comparing every frame; `probe` collects maxima of legacy expressions. */
function scenario(name: string, a: Script, b: Script, n: number, probes: string[], opt: { at?: number; seed?: number; setup?: (k: Pair) => void; item?: string } = {}): number[] {
  const k = makePair(['reimu', 'reimu'], opt.seed ?? 31, { items: ['green'] });
  opt.setup?.(k);
  const best = probes.map(() => 0), kind = k.kind(opt.item ?? name);
  for (let f = 1; f <= n; f++) {
    if (f === (opt.at ?? 60)) { k.legacy.eval(`give(P[0],'${opt.item ?? name}')`); giveItem(k.world, k.s, 0, kind, k.s.x[0]!, k.s.y[0]!); }
    k.step([a, b], f); k.compare(name);
    probes.forEach((p, i) => { best[i] = Math.max(best[i]!, Number(k.legacy.eval(p))); });
  }
  return best;
}

describe('parity: base items (vs legacy)', () => {
  it('Rifle: aim 40 frames, thin piercing bolt (22 dmg); a parried bolt returns as a one-shot', () => {
    const fire: Script = f => ({ btn: f === 70 || f === 200 ? ['heavy'] : [] });
    const [hurt] = scenario('rifle-hit', fire, still, 330, ['P[1].hp<100?1:0'], { item: 'white' });
    expect(hurt, 'the bolt hit').toBe(1);
    const spam: Script = f => ({ btn: f >= 95 && f % 4 === 0 ? ['parry'] : [] });
    const [refl, down] = scenario('rifle-parry', fire, spam, 330, ['B.filter(b=>b.rifle&&b.oneshot).length', 'P[0].stocks<3||P[0].hp<100?1:0'], { item: 'white' });
    expect(refl + down, 'a parry returned the bolt or hurt the shooter').toBeGreaterThan(0);
  });
  it('Fairies: 3 thieves steal spirit/power from the richest foe and bring it home; bullets shoot them down', () => {
    const shooter: Script = f => ({ btn: f > 200 ? ['shot'] : [] });
    const [n, loot] = scenario('fairies', still, shooter, 500, ['FAIRIES.length', 'FAIRIES.some(f=>f.loot)?1:0'], { setup: k => { k.legacy.eval('P[1].spirit=60;P[1].power=3'); k.s.spirit[1] = 60; k.s.power[1] = 3; }, item: 'blue' });
    expect(n).toBe(3); expect(loot, 'a fairy carried loot').toBe(1);
  });
  it('Doppelganger: the mirrored twin copies light shots at 70 % and absorbs bullets', () => {
    const shooter: Script = f => ({ x: Math.sin(f / 30) * 0.5, btn: ['shot'] });
    const [c, hp] = scenario('clone', shooter, shooter, 450, ['P[0].clone', 'P[0].cloneHP<15?1:0'], { item: 'clone' });
    expect(c).toBeGreaterThan(0); expect(hp, 'the twin soaked something').toBe(1);
  });
  it('Master Spark: 5 s charge (slow, aim locks), then a wide beam that deletes bullets and hits', () => {
    const walk: Script = f => ({ y: Math.sin(f / 50) * 0.6, btn: f > 100 && f % 40 === 0 ? ['shot'] : [] });
    const [spk, hurt] = scenario('spark', still, walk, 520, ['P[0].spk', 'P[1].hp<100?1:0'], { item: 'spark' });
    expect(spk).toBe(389); expect(hurt, 'the beam hit').toBe(1);
  });
  it('The World: 3 s charge, 4 s stopped time with knives around the frozen foe, then they fly in', () => {
    const shooter: Script = f => ({ btn: f % 20 === 0 ? ['shot', 'heavy'] : ['shot'] });
    const [ts, kn, hurt] = scenario('world', still, shooter, 620, ['TSTOP', 'B.filter(b=>b.knife).length', 'P[1].hp<100?1:0'], { item: 'world' });
    expect(ts).toBeGreaterThan(0); expect(kn).toBeGreaterThan(0); expect(hurt).toBe(1);
  });
  it('Tengu Camera: 3 snaps erase bullets and stun foes in the cone; dashes are free', () => {
    const snap: Script = f => ({ btn: f === 90 || f === 150 || f === 210 ? ['heavy'] : f % 45 === 0 ? ['dash'] : [] });
    const shooter: Script = () => ({ btn: ['shot'] });
    const [cam] = scenario('camera', snap, shooter, 330, ['P[0].cam'], { item: 'camera' });
    expect(cam).toBe(3);
  });
});
