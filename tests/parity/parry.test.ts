import { describe, expect, it } from 'vitest';
import { type Script, makePair } from './harness';

const walk = (dir: number, then: Script, n = 62): Script => f => (f < n ? { x: dir } : then(f)); // close the 600 px gap, then act
const every = (period: number, offset: number, ...btn: string[]): Script => f => ({ btn: (f + offset) % period === 0 ? btn : [] });

/** Runs a pair with per-frame comparison; `probe` is a legacy expression counted across frames so each scenario proves its mechanic happened. */
function run(tag: string, scripts: Script[], frames: number, probe: string): number {
  const k = makePair(['reimu', 'reimu']);
  let n = 0;
  for (let f = 1; f <= frames; f++) { k.step(scripts, f); k.compare(tag); if (k.legacy.eval(probe)) n++; }
  return n;
}

describe('parity: parry, grab, clash, guard gauge (Reimu vs legacy)', () => {
  it('melee parried: attacker punished (or not, legacy quirk R67), parry chain, damage streak', () => {
    const n = run('parried', [walk(1, every(20, 0, 'melee')), walk(-1, every(20, 0, 'parry'))], 500, 'P[0].t===50&&P[0].mvName==="jab"&&P[1].pChain>0');
    expect(n).toBeGreaterThan(0);
  });
  it('parry spam: whiff lag drains the guard gauge until a guard crush (110-frame stun)', () => {
    const n = run('crush', [walk(1, every(20, 6, 'melee')), walk(-1, every(20, 0, 'parry'))], 500, 'P[1].state==="parrystun"&&P[1].t===110');
    expect(n).toBeGreaterThan(0);
  });
  it('clash: simultaneous melee cancel each other and push apart', () => {
    const n = run('clash', [walk(1, every(20, 0, 'melee')), walk(-1, every(20, 0, 'melee'))], 500, 'P[0].state==="idle"&&Math.hypot(P[0].vx,P[0].vy)>8&&P[0].inv>=9');
    expect(n).toBeGreaterThan(0);
  });
  it('grab (parry + melee) breaks a parrying foe', () => {
    const n = run('grab', [walk(1, every(20, 0, 'parry', 'melee'), 64), walk(-1, every(20, 0, 'parry'), 64)], 500, 'P[0].mvName==="grab"&&P[0].state==="atk"&&P[0].hitDone&&P[1].state==="parrystun"&&P[1].t>=108');
    expect(n).toBeGreaterThan(0);
  });
});
