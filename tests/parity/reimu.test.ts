import { describe, expect, it } from 'vitest';
import { type Script, makePair } from './harness';

type Probe = (L: (e: string) => number) => void;
const track = (get: (L: (e: string) => number) => number): { probe: Probe; max: () => number } => { let m = 0; return { probe: L => { m = Math.max(m, get(L)); }, max: () => m }; };
function run(tag: string, sc: Script[], frames: number, probe: Probe): void {
  const k = makePair(['reimu', 'reimu']), L = (e: string): number => k.legacy.eval(e) as number;
  for (let f = 1; f <= frames; f++) { k.step(sc, f); k.compare(tag); probe(L); }
}
const orbs = 'ENT.filter(e=>e.k===\'ryy\'&&e.t>0).length';

describe('parity: Reimu yin-yang orbs, gather/launch, Border (vs legacy)', () => {
  it('neutral Heavy = charge: 1 / 2 / 4 orbs on release, bounce off walls, hit and erase bullets', () => {
    const n = track(L => L(orbs)), g = track(L => L('P[1].hp<100?1:0'));
    // hold 10 f (1 orb), pause, hold 35 f (2 orbs), pause, hold 70 f (4 orbs); foe shoots so orbs have bullets to erase
    const sc0: Script = f => ({ btn: (f > 5 && f < 15) || (f > 60 && f < 95) || (f > 140 && f < 210) ? ['heavy'] : [] });
    run('orbs', [sc0, () => ({ btn: ['shot'] })], 900, l => { n.probe(l); g.probe(l); });
    expect(n.max(), 'four orbs at once').toBe(4); expect(g.max(), 'an orb must hurt the foe').toBe(1);
  });
  it('Focus gathers the orbs into spirit form; releasing launches them along the stick', () => {
    const gather = track(L => L('P[0].rG?1:0'));
    const sc0: Script = f => (f > 5 && f < 15 ? { btn: ['heavy'] } : f > 40 && f < 110 ? { x: f > 80 ? 1 : 0.2, y: f > 80 ? 0.4 : 0, btn: ['focus'] } : {});
    run('gather', [sc0, () => ({})], 400, l => gather.probe(l));
    expect(gather.max()).toBe(1);
  });
  it('Cautionary Border (skill 2): erases foe bullets, stuns a melee attacker, 15 s cooldown', () => {
    const bar = track(L => L('ENT.filter(e=>e.k===\'rbar\'&&e.t>0).length')), stun = track(L => L('P[1].state==="hitstun"?1:0'));
    const sc0: Script = f => (f === 150 || f === 400 || f === 1100 ? { btn: ['prev'] } : {});
    const sc1: Script = f => ({ x: f < 30 ? -0.6 : f < 90 ? -1 : 0, btn: f > 40 ? ['shot', ...(f % 14 === 0 ? ['melee'] : [])] : ['shot'] });
    run('border', [sc0, sc1], 1150, l => { bar.probe(l); stun.probe(l); });
    expect(bar.max()).toBe(1);
  });
});
