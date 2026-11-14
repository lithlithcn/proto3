import { describe, expect, it } from 'vitest';
import { type Script, makePair } from './harness';

type Pair = ReturnType<typeof makePair>;
const both = (k: Pair, js: string, fn: (s: Pair['s']) => void): void => { k.legacy.eval(js); fn(k.s); };
/** P1 is one shot from death; P0 holds fire, so P1 is KO'd early and its beam charges where it died. */
function duel(tag: string, sc0: Script, sc1: Script, frames: number, probe: (L: (e: string) => number) => void, stocks = 3, credit = false): Pair {
  const k = makePair(['reimu', 'reimu']), L = (e: string): number => k.legacy.eval(e) as number;
  both(k, 'P[1].hp=0.5', s => { s.hp[1] = 0.5; });
  if (credit) both(k, 'P[1].lastBy=0;P[1].lastByF=frame+1', s => { s.lastBy[1] = 0; s.lastByF[1] = s.gf + 1; }); // light shots don't credit (legacy quirk): credit as if a melee did
  if (stocks !== 3) both(k, `P.forEach(p=>p.stocks=${stocks})`, s => { s.stocks.fill(stocks, 0, 2); });
  for (let f = 1; f <= frames; f++) { k.step([sc0, sc1], f); k.compare(tag); probe(L); }
  return k;
}
const shoot: Script = () => ({ x: 0, btn: ['shot'] });
const track = (get: (L: (e: string) => number) => number): { probe: (L: (e: string) => number) => void; max: () => number } => { let m = 0; return { probe: L => { m = Math.max(m, get(L)); }, max: () => m }; };

describe('parity: KO beam, kill credit, winner (Reimu vs legacy)', () => {
  it('beam aimed by the dead player with the stick fires and hits a standing foe (18 dmg, big launch); the killer is credited', () => {
    const hurt = track(L => L('P[0].hp<100?1:0')), kos = track(L => L('P[0].kos||0'));
    duel('beam-hit', shoot, () => ({ x: -1 }), 520, l => { hurt.probe(l); kos.probe(l); }, 3, true);
    expect(hurt.max(), 'the beam must land').toBe(1); expect(kos.max()).toBe(1);
  });
  it('a well-timed Parry reflects the beam: foe is thrown to the wall (costs a pip), the reflected beam is re-aimed with the stick', () => {
    const dep = track(L => L('KOB.reduce((m,k)=>Math.max(m,k.dep||0),0)')), pip = track(L => L('P[0].pips<3?1:0'));
    const par: Script = f => (f < 70 ? { x: 0, btn: ['shot'] } : { x: f > 233 ? 1 : 0, btn: f === 233 ? ['parry'] : [] }); // the beam fires at frame 239: Parry 6 f before
    duel('beam-parry', par, () => ({ x: -1 }), 600, l => { dep.probe(l); pip.probe(l); });
    expect(dep.max(), 'a reflection must have happened').toBeGreaterThanOrEqual(1);
  });
  it('Parry while aiming your own beam cancels it', () => {
    const seen = track(L => L('KOB.length')), hurt = track(L => L('P[0].hp<100?1:0'));
    duel('beam-cancel', shoot, f => ({ x: -1, btn: f > 60 && f % 30 === 0 ? ['parry'] : [] }), 520, l => { seen.probe(l); hurt.probe(l); });
    expect(seen.max()).toBe(1); expect(hurt.max(), 'canceled beam must not hit').toBe(0);
  });
  it('last stock: match ends, winner chosen by KO ranking (bestId)', () => {
    const k = duel('winner', shoot, () => ({}), 300, () => {}, 1);
    expect(k.s.winner).toBe(k.legacy.eval('winner')); expect(k.s.winner).toBe(0);
  });
});
