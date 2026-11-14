import { describe, expect, it } from 'vitest';
import { type Script, makePair } from './harness';

type Pair = ReturnType<typeof makePair>;
const still: Script = () => ({});
/** Flandre (P0) vs Reimu (P1), same seed; the stick aims at / away from the foe. */
function duel(seed = 51): Pair { return makePair(['flandre', 'reimu'], seed); }
const aim = (k: Pair, sign = 1) => (): { x: number; y: number } => { const dx = k.s.x[1]! - k.s.x[0]!, dy = k.s.y[1]! - k.s.y[0]!, d = Math.hypot(dx, dy) || 1; return { x: sign * dx / d, y: sign * dy / d }; };
function run(k: Pair, tag: string, a: Script, n: number, probes: string[]): number[] {
  const best = probes.map(() => 0);
  for (let f = 1; f <= n; f++) { k.step([a, still], f); k.compare(tag); probes.forEach((p, i) => { best[i] = Math.max(best[i]!, Number(k.legacy.eval(p))); }); }
  return best;
}

describe('parity: Flandre (vs legacy)', () => {
  it('shotgun, melee set, Focus crush, dash chain (x2, x3) and the three heavies (Starbow, Laevatein boomerang + trail, Cranberry Trap)', () => {
    const k = duel(), t = aim(k), away = aim(k, -1);
    const a: Script = f => ({
      ...(f > 150 && f < 330 ? t() : {}),
      btn: [...(f < 60 ? ['shot'] : []), ...(f > 150 && f < 330 ? ['focus'] : []), ...(f === 200 || f === 240 ? ['melee'] : []), ...(f === 340 || f === 370 || f === 400 ? ['dash'] : [])],
      ...(f === 460 ? { ...t(), btn: ['heavy'] } : f === 461 ? t() : f === 560 ? { btn: ['heavy'] } : f === 561 ? {} : f === 700 ? { ...away(), btn: ['heavy'] } : f === 701 ? away() : {}),
    });
    const [fsb, flv, ball] = run(k, 'flandre-moves', a, 900, ['ENT.filter(e=>e.k==="fsb").length', 'ENT.filter(e=>e.k==="flv").length', 'B.filter(b=>b.ct).length']);
    expect(fsb).toBeGreaterThan(0); expect(flv).toBeGreaterThan(0); expect(ball).toBe(12);
  });
  it('skills (Four of a Kind clones, Frenzy +35 % damage / +25 % speed) and the spell card', () => {
    const k = duel(52), t = aim(k);
    const a: Script = f => (f === 140 ? { btn: ['next'] } : f === 330 ? { btn: ['prev'] } : f > 340 && f < 480 ? { ...t(), btn: ['shot', 'melee'] } : f === 520 ? { btn: ['spell'] } : {});
    k.legacy.eval('P[0].spirit=0;seed=777;P[1].inv=1e6'); k.s.spSeed = 777; k.s.inv[1] = 1e6;
    k.legacy.eval('{const S=startSpell;startSpell=(p,o,u)=>{S(p,o,u);if(p.state==="spell"&&!u)p.spI=13}}'); k.s.spPick = 13;
    // give her the spirit only when the card is cast so Frenzy/clones run first
    const [cl] = run(k, 'flandre-skills', (f) => { if (f === 515) { k.legacy.eval('P[0].spirit=100'); k.s.spirit[0] = 100; } return a(f); }, 760, ['ENT.filter(e=>e.k==="fcl").length']);
    expect(cl).toBe(3);
  });
});
