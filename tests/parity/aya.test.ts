import { describe, expect, it } from 'vitest';
import { type Script, makePair } from './harness';

type Pair = ReturnType<typeof makePair>;
const still: Script = () => ({});
function duel(seed = 95): Pair { return makePair(['aya', 'reimu'], seed); }
const aim = (k: Pair, sign = 1) => (): { x: number; y: number } => { const dx = k.s.x[1]! - k.s.x[0]!, dy = k.s.y[1]! - k.s.y[0]!, d = Math.hypot(dx, dy) || 1; return { x: sign * dx / d, y: sign * dy / d }; };
function run(k: Pair, tag: string, a: Script, n: number, probes: string[] = []): number[] {
  const best = probes.map(() => 0);
  for (let f = 1; f <= n; f++) { k.step([a, still], f); k.compare(tag); probes.forEach((p, i) => { best[i] = Math.max(best[i]!, Number(k.legacy.eval(p))); }); }
  return best;
}
const calm = (f: number, at: number[]): boolean => at.some(n => f >= n - 4 && f <= n + 8);

describe('parity: Aya (vs legacy)', () => {
  it('shot, melee, heavies (tornado / blade / gust), camera photo, Hyper Dash, Scoop and Tailwind', () => {
    const k = duel(), t = aim(k), away = aim(k, -1), H = [300, 520, 700];
    const a: Script = f => ({
      ...(f > 30 && f < 120 ? t() : {}), ...(f > 200 && !calm(f, H) && f < 900 ? t() : {}),
      btn: [...(f > 40 && f < 110 && f % 2 ? ['shot'] : []), ...(f === 150 || f === 170 || f === 190 ? ['melee'] : []), ...(f > 215 && f < 255 ? ['focus'] : []),
        ...(H.includes(f) ? ['heavy'] : []), ...(f === 340 || f === 345 ? ['dash'] : []), ...(f === 600 ? ['next'] : []), ...(f === 640 ? ['prev'] : []), ...(f === 760 || f === 790 ? ['dash'] : [])],
      ...(f === 700 ? { ...away(), btn: ['heavy'] } : f > 700 && f < 710 ? away() : {}),
    });
    const [tor, hyper, scoop, wind, photo] = run(k, 'aya-moves', a, 900, ['ENT.filter(e=>e.k==="atn").length', 'P[0].aHy>0?1:0', 'ENT.filter(e=>e.k==="anw").length', 'ENT.filter(e=>e.k==="awd").length', 'P[0].aCd>0?1:0']);
    expect([tor > 0, scoop > 0, wind > 0], 'tornado, scoop, tailwind').toEqual([true, true, true]);
    expect([hyper, photo], 'hyper dash, photo').toEqual([1, 1]);
  });
  it('Wind God「Illusionary Dominance」', () => {
    const k = duel(96), t = aim(k);
    k.legacy.eval('seed=778;P[1].inv=1e6'); k.s.spSeed = 778; k.s.inv[1] = 1e6;
    k.legacy.eval('{const S=startSpell;startSpell=(p,o,u)=>{S(p,o,u);if(p.state==="spell"&&!u)p.spI=18}}'); k.s.spPick = 18;
    const [ray] = run(k, 'aya-spell', f => { if (f === 135) { k.legacy.eval('P[0].spirit=100'); k.s.spirit[0] = 100; } return { ...(f > 100 ? t() : {}), btn: f === 140 ? ['spell'] : [] }; }, 500, ['ENT.filter(e=>e.k==="cray").length']);
    expect(ray).toBeGreaterThan(0);
  });
});
