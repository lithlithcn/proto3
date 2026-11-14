import { describe, expect, it } from 'vitest';
import { type Script, makePair } from './harness';

type Pair = ReturnType<typeof makePair>;
const still: Script = () => ({});
function duel(seed = 61): Pair { return makePair(['hecatia', 'reimu'], seed); }
const aim = (k: Pair, sign = 1) => (): { x: number; y: number } => { const dx = k.s.x[1]! - k.s.x[0]!, dy = k.s.y[1]! - k.s.y[0]!, d = Math.hypot(dx, dy) || 1; return { x: sign * dx / d, y: sign * dy / d }; };
function run(k: Pair, tag: string, a: Script, n: number, probes: string[]): number[] {
  const best = probes.map(() => 0);
  for (let f = 1; f <= n; f++) { k.step([a, still], f); k.compare(tag); probes.forEach((p, i) => { best[i] = Math.max(best[i]!, Number(k.legacy.eval(p))); }); }
  return best;
}

/** Neutral stick for a few frames around each neutral Heavy (the press is buffered, so the stick must still be neutral when it fires). */
const calm = (f: number): boolean => [270, 400, 520, 640].some(n => f >= n - 4 && f <= n + 8);

describe('parity: Hecatia (vs legacy)', () => {
  it('three bodies (Earth gravity, Moon needles, Otherworld waves), statues, melee, the three heavies (planet orbit + burn, star line, ring shield)', () => {
    const k = duel(), t = aim(k), away = aim(k, -1);
    const a: Script = f => ({
      ...(f > 130 && !calm(f) ? t() : {}),
      btn: [...(f > 100 && f < 140 ? ['shot'] : []), ...(f === 150 || f === 151 ? ['focus'] : []), ...(f > 160 && f < 200 ? ['shot'] : []), ...(f === 210 ? ['focus'] : []), ...(f > 215 && f < 255 ? ['shot'] : []),
        ...(f === 300 || f === 330 ? ['melee'] : []), ...(f === 175 ? ['heavy'] : []), ...(f === 270 || f === 400 || f === 520 || f === 640 ? ['heavy'] : [])],
      ...(f === 443 ? { btn: [] } : f === 470 ? { ...away(), btn: ['heavy'] } : f === 471 ? away() : f === 560 ? { x: 0, y: 0, btn: ['heavy'] } : {}),
    });
    const [pl, st, rg] = run(k, 'hecatia-moves', a, 760, ['ENT.filter(e=>e.k==="hpl").length', 'ENT.filter(e=>e.k==="hst").length', 'ENT.filter(e=>e.k==="hrg").length']);
    expect([pl, st, rg]).toEqual([expect.any(Number), expect.any(Number), expect.any(Number)]); expect(pl, `planets ${pl} statues ${st} rings ${rg}`).toBeGreaterThan(0); expect(st, `statues`).toBeGreaterThan(0); expect(rg, `rings`).toBeGreaterThan(0);
  });
  it('skills (Trinity, statue swap) and the spell card', () => {
    const k = duel(62), t = aim(k);
    const a: Script = f => ({ ...(f > 130 ? t() : {}), btn: [...(f === 120 ? ['focus'] : []), ...(f === 150 ? ['prev'] : []), ...(f === 200 ? ['next'] : []), ...(f > 210 && f < 280 ? ['shot'] : []), ...(f === 330 ? ['spell'] : [])] });
    k.legacy.eval('P[0].spirit=0;seed=777;P[1].inv=1e6;{const S=startSpell;startSpell=(p,o,u)=>{S(p,o,u);if(p.state==="spell"&&!u)p.spI=14}}'); k.s.spSeed = 777; k.s.inv[1] = 1e6; k.s.spPick = 14;
    run(k, 'hecatia-skills', f => { if (f === 325) { k.legacy.eval('P[0].spirit=100'); k.s.spirit[0] = 100; } return a(f); }, 600, []);
  });
});
