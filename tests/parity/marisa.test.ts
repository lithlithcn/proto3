import { describe, expect, it } from 'vitest';
import { type Script, makePair } from './harness';

type Pair = ReturnType<typeof makePair>;
const still: Script = () => ({});
/** Marisa (P0) vs Reimu (P1), same seed; stick helpers aim relative to the foe. */
function duel(seed = 41): Pair { return makePair(['marisa', 'reimu'], seed); }
const toward = (k: Pair, who = 0, mag = 1) => (): { x: number; y: number } => { const o = 1 - who, dx = k.s.x[o]! - k.s.x[who]!, dy = k.s.y[o]! - k.s.y[who]!, d = Math.hypot(dx, dy) || 1; return { x: dx / d * mag, y: dy / d * mag }; };
function run(k: Pair, tag: string, a: Script, b: Script, n: number, probes: string[]): number[] {
  const best = probes.map(() => 0);
  for (let f = 1; f <= n; f++) { k.step([a, b], f); k.compare(tag); probes.forEach((p, i) => { best[i] = Math.max(best[i]!, Number(k.legacy.eval(p))); }); }
  return best;
}

describe('parity: Marisa (vs legacy)', () => {
  it('light shot fan (stars hang then accelerate), melee set, Hakkero heat on Focus (burn at 100)', () => {
    const k = duel(), t = toward(k);
    const a: Script = f => ({ ...(f > 150 && f < 330 ? t() : {}), btn: [...(f < 100 ? ['shot'] : []), ...(f > 150 && f < 330 ? ['focus'] : []), ...(f === 360 || f === 400 ? ['melee'] : [])] });
    const [heat, b] = run(k, 'marisa-shot', a, still, 520, ['P[0].mH||0', 'B.filter(b=>b.mst!==undefined).length']);
    expect(heat).toBeGreaterThan(100); expect(b).toBeGreaterThan(1);
  });
  it('heavies: Master Spark (N), Narrow Spark (F), Stardust Reverie (B); lasers lock her out; heat enlarges them', () => {
    const k = duel(42), t = toward(k), away = (): { x: number; y: number } => { const v = t(); return { x: -v.x, y: -v.y }; };
    const a: Script = f => (f === 20 ? { btn: ['heavy'] } : f === 21 ? {} : f === 60 ? { ...t(), btn: ['heavy'] } : f === 61 ? t() : f === 200 ? { ...away(), btn: ['heavy'] } : f === 201 ? away() : f === 300 || f === 301 ? { btn: ['focus'] } : {});
    const [ray, hurt] = run(k, 'marisa-heavy', a, still, 420, ['ENT.filter(e=>e.k==="cray").length', 'P[1].hp<100?1:0']);
    expect(ray).toBeGreaterThan(0); expect(hurt, 'the laser hit').toBe(1);
  });
  it('Blazing Star dash, rear-laser boost (Heavy during the dash), post-dash brake', () => {
    const k = duel(43), t = toward(k);
    const a: Script = f => (f === 30 ? { ...t(), btn: ['dash'] } : f === 34 ? { btn: ['heavy'] } : f === 35 ? {} : f === 120 ? { ...t(), btn: ['dash'] } : {});
    const [bs] = run(k, 'marisa-dash', a, still, 260, ['P[0].mBS||0']);
    expect(bs).toBeGreaterThan(0);
  });
  it('skills: star potion (flight, puddle, detonation + 10 stars) and Non-Directional Laser (4 spinning rays)', () => {
    const k = duel(44), t = toward(k);
    const a: Script = f => (f === 140 ? { btn: ['next'] } : f === 330 ? { btn: ['prev'] } : f > 220 && f < 300 ? t() : {});
    const [pud, rays] = run(k, 'marisa-skills', a, still, 480, ['ENT.filter(e=>e.k==="mpud").length', 'ENT.filter(e=>e.k==="cray").length']);
    expect(pud).toBeGreaterThan(0); expect(rays).toBe(4);
  });
  it('Love Sign「Final Spark」: huge rotating beam (36 f warning)', () => {
    const k = duel(45);
    k.legacy.eval('SPELLS.length=13;P.forEach(p=>p.spI=12);P[0].spirit=100;seed=777;P[1].inv=1e6;{const S=startSpell;startSpell=(p,o,u)=>{S(p,o,u);if(p.state==="spell"&&!u)p.spI=12}}'); k.s.spirit[0] = 100; k.s.spI.fill(12, 0, 2); k.s.spSeed = 777; k.s.spPick = 12; k.s.inv[1] = 1e6;
    const [ray] = run(k, 'marisa-spell', f => (f === 10 ? { btn: ['spell'] } : {}), still, 420, ['ENT.filter(e=>e.k==="cray").length']);
    expect(ray).toBeGreaterThan(0);
  });
});
