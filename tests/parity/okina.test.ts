import { describe, expect, it } from 'vitest';
import { type Script, makePair } from './harness';

type Pair = ReturnType<typeof makePair>;
const still: Script = () => ({});
function duel(seed = 81): Pair { return makePair(['okina', 'reimu'], seed); }
const aim = (k: Pair, sign = 1) => (): { x: number; y: number } => { const dx = k.s.x[1]! - k.s.x[0]!, dy = k.s.y[1]! - k.s.y[0]!, d = Math.hypot(dx, dy) || 1; return { x: sign * dx / d, y: sign * dy / d }; };
function run(k: Pair, tag: string, a: Script, n: number, probes: string[] = []): number[] {
  const best = probes.map(() => 0);
  for (let f = 1; f <= n; f++) { k.step([a, still], f); k.compare(tag); probes.forEach((p, i) => { best[i] = Math.max(best[i]!, Number(k.legacy.eval(p))); }); }
  return best;
}
const calm = (f: number, at: number[]): boolean => at.some(n => f >= n - 4 && f <= n + 8);

describe('parity: Okina (vs legacy)', () => {
  it('four seasons of shots (heal / fast / shove / slow), doors copying the shot, melee, big door, door ray, dash through a door, wavy ring', () => {
    const k = duel(), t = aim(k), away = aim(k, -1), N = [330], B = [620];
    const a: Script = f => ({
      ...(f > 30 && !calm(f, N) && !calm(f, B) ? t() : {}),
      btn: [...(f > 40 && f < 1000 && f % 3 !== 0 ? ['shot'] : []), ...(f === 135 || f === 200 ? ['next'] : []), ...(f === 150 ? ['focus'] : []), ...(f === 250 || f === 270 ? ['melee'] : []), ...(f === 290 ? ['dash'] : []), ...(N.includes(f) ? ['heavy'] : [])],
      ...(f === 420 ? { ...t(), btn: ['heavy'] } : f === 480 ? { ...t(), btn: ['heavy'] } : f === 620 ? { ...away(), btn: ['heavy'] } : f === 621 ? away() : {}),
    });
    const [odr, obd, ray, sea] = run(k, 'okina-moves', a, 1000, ['ENT.filter(e=>e.k==="odr").length', 'ENT.filter(e=>e.k==="obd").length', 'ENT.filter(e=>e.k==="cray").length', 'B.filter(b=>b.sea).length']);
    expect([odr > 0, obd > 0, ray > 0, sea > 0], 'doors, big door, ray, season bullets').toEqual([true, true, true, true]);
  });
  it('skills (dancers Satono + Mai, door limit) and Four Seasons at Once', () => {
    const k = duel(82), t = aim(k);
    const a: Script = f => ({ ...(f > 100 ? t() : {}), btn: [...(f === 130 ? ['prev'] : []), ...(f === 160 ? ['prev'] : []), ...(f === 500 ? ['prev'] : []), ...(f === 380 ? ['spell'] : [])] });
    k.legacy.eval('seed=777;P[1].inv=1e6'); k.s.spSeed = 777; k.s.inv[1] = 1e6;
    k.legacy.eval('{const S=startSpell;startSpell=(p,o,u)=>{S(p,o,u);if(p.state==="spell"&&!u)p.spI=16}}'); k.s.spPick = 16;
    const [odn] = run(k, 'okina-skills', f => { if (f === 375) { k.legacy.eval('P[0].spirit=100'); k.s.spirit[0] = 100; } return a(f); }, 700, ['ENT.filter(e=>e.k==="odn").length']);
    expect(odn).toBe(2);
  });
});
