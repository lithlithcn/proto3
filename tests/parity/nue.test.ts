import { describe, expect, it } from 'vitest';
import { type Script, makePair } from './harness';

type Pair = ReturnType<typeof makePair>;
const still: Script = () => ({});
function duel(seed = 71): Pair { return makePair(['nue', 'reimu'], seed); }
const aim = (k: Pair, sign = 1) => (): { x: number; y: number } => { const dx = k.s.x[1]! - k.s.x[0]!, dy = k.s.y[1]! - k.s.y[0]!, d = Math.hypot(dx, dy) || 1; return { x: sign * dx / d, y: sign * dy / d }; };
function run(k: Pair, tag: string, a: Script, n: number, probes: string[]): number[] {
  const best = probes.map(() => 0);
  for (let f = 1; f <= n; f++) { k.step([a, still], f); k.compare(tag); probes.forEach((p, i) => { best[i] = Math.max(best[i]!, Number(k.legacy.eval(p))); }); }
  return best;
}
/** Neutral stick for a few frames around each neutral Heavy (presses are buffered). */
const calm = (f: number, at: number[]): boolean => at.some(n => f >= n - 4 && f <= n + 8);

describe('parity: Nue (vs legacy)', () => {
  it('wavy shots + Focus decoys, stand-still clouds launched by a shot, melee, UFO / trident / storm-trap heavies, dash invincibility', () => {
    const k = duel(), t = aim(k), away = aim(k, -1), N = [330, 420];
    const a: Script = f => ({
      ...(f > 40 && f < 120 ? t() : {}), ...(f > 230 && !calm(f, N) && f < 560 ? t() : {}),
      btn: [...(f > 40 && f < 70 ? ['shot'] : []), ...(f > 70 && f < 110 ? ['shot', 'focus'] : []), ...(f === 240 ? ['shot'] : []), ...(f === 270 || f === 290 ? ['melee'] : []), ...(f === 310 ? ['dash'] : []), ...(N.includes(f) ? ['heavy'] : [])],
      ...(f === 480 ? { ...t(), btn: ['heavy'] } : f === 500 ? { ...away(), btn: ['heavy'] } : f === 501 ? away() : {}),
    });
    const [cl, ufo, st] = run(k, 'nue-moves', a, 700, ['ENT.filter(e=>e.k==="ncl").length', 'ENT.filter(e=>e.k==="nufo").length', 'ENT.filter(e=>e.k==="nst").length']);
    expect(cl, 'clouds').toBeGreaterThan(0); expect(ufo, 'ufo').toBeGreaterThan(0); expect(st, 'storm').toBeGreaterThan(0);
  });
  it('skills (Disguise as the foe: its shot and spell card; UFO swap) and Undefined Darkness', () => {
    const k = duel(72), t = aim(k);
    const a: Script = f => ({ ...(f > 150 ? t() : {}), btn: [...(f === 20 ? ['heavy'] : []), ...(f === 120 ? ['next'] : []), ...(f > 125 && f < 180 ? ['shot'] : []), ...(f === 200 ? ['prev'] : []), ...(f === 380 ? ['spell'] : [])] });
    k.legacy.eval('seed=777;P[1].inv=1e6'); k.s.spSeed = 777; k.s.inv[1] = 1e6;
    k.legacy.eval('{const S=startSpell;startSpell=(p,o,u)=>{S(p,o,u);if(p.state==="spell"&&!u)p.spI=15}}'); k.s.spPick = 15;
    run(k, 'nue-skills', f => { if (f === 375) { k.legacy.eval('P[0].spirit=100'); k.s.spirit[0] = 100; } return a(f); }, 640, []);
  });
});
