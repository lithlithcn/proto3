import { describe, expect, it } from 'vitest';
import { type Script, makePair } from './harness';

type Pair = ReturnType<typeof makePair>;
const still: Script = () => ({});
function duel(seed = 91): Pair { return makePair(['nazrin', 'reimu'], seed); }
const aim = (k: Pair, sign = 1) => (): { x: number; y: number } => { const dx = k.s.x[1]! - k.s.x[0]!, dy = k.s.y[1]! - k.s.y[0]!, d = Math.hypot(dx, dy) || 1; return { x: sign * dx / d, y: sign * dy / d }; };
function run(k: Pair, tag: string, a: Script, n: number, probes: string[] = []): number[] {
  const best = probes.map(() => 0);
  for (let f = 1; f <= n; f++) { k.step([a, still], f); k.compare(tag); probes.forEach((p, i) => { best[i] = Math.max(best[i]!, Number(k.legacy.eval(p))); }); }
  return best;
}
const calm = (f: number, at: number[]): boolean => at.some(n => f >= n - 4 && f <= n + 8);

describe('parity: Nazrin (vs legacy)', () => {
  it('mice that burrow into sentinels, Focus rush, melee (lunge steals spirit), pendulum, detection mark, guard pendulums, recall', () => {
    const k = duel(), t = aim(k), away = aim(k, -1), N = [450, 700];
    const a: Script = f => ({
      ...(f > 30 && f < 140 ? t() : {}), ...(f > 310 && !calm(f, N) && f < 640 ? t() : {}),
      btn: [...(f > 40 && f < 130 && f % 2 ? ['shot'] : []), ...(f > 160 && f < 260 ? ['focus'] : []), ...(f === 330 || f === 350 || f === 370 ? ['melee'] : []), ...(N.includes(f) ? ['heavy'] : []), ...(f === 590 ? ['prev'] : [])],
      ...(f === 520 ? { ...t(), btn: ['heavy'] } : f === 290 ? { ...away(), btn: ['heavy'] } : f > 290 && f < 300 ? away() : {}),
    });
    const [sent, pend, guard, rec] = run(k, 'nazrin-moves', a, 760, ['ENT.filter(e=>e.k==="nms").length', 'ENT.filter(e=>e.k==="npd").length', 'ENT.filter(e=>e.k==="npg").length', 'ENT.filter(e=>e.k==="nrc").length']);
    expect([sent > 0, pend > 0, guard > 0, rec > 0], 'sentinels, pendulum, guard, recall').toEqual([true, true, true, true]);
  });
  it('dig bonus (speed / shield / double mice / bomb coin) and Dowsing「Nazrin Pendulum」', () => {
    const k = duel(92), t = aim(k);
    const a: Script = f => ({ ...(f > 300 ? t() : {}), btn: [...(f === 130 || f === 760 || f === 1400 ? ['next'] : []), ...(f > 200 && f < 700 && f % 2 ? ['shot'] : []), ...(f === 1000 ? ['spell'] : [])] });
    k.legacy.eval('seed=777;P[1].inv=1e6'); k.s.spSeed = 777; k.s.inv[1] = 1e6;
    k.legacy.eval('{const S=startSpell;startSpell=(p,o,u)=>{S(p,o,u);if(p.state==="spell"&&!u)p.spI=17}}'); k.s.spPick = 17;
    const [big] = run(k, 'nazrin-dig', f => { if (f === 995) { k.legacy.eval('P[0].spirit=100'); k.s.spirit[0] = 100; } return a(f); }, 1500, ['ENT.filter(e=>e.k==="npd"&&e.big).length']);
    expect(big).toBeGreaterThan(0);
  });
});
