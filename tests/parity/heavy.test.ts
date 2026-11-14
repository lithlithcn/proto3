import { describe, expect, it } from 'vitest';
import { type Script, makePair } from './harness';

const every = (period: number, offset: number, x: number, ...btn: string[]): Script => f => ({ x, btn: f > 5 && (f + offset) % period === 0 ? btn : [] });
const holdBtn = (period: number, len: number, x: number, ...btn: string[]): Script => f => ({ x, btn: f > 5 && f % period < len ? btn : [] });
const idle: Script = () => ({});

type Probe = (L: (e: string) => number) => void;
/** Per-frame comparison; `probe` observes the legacy side so each scenario proves its mechanic happened. NB: stick is never neutral while pressing heavy (Reimu's neutral heavy = orbs, not ported yet). */
function run(tag: string, scripts: Script[], frames: number, probe: Probe, setup?: (k: ReturnType<typeof makePair>) => void): void {
  const k = makePair(['reimu', 'reimu']), L = (e: string): number => k.legacy.eval(e) as number;
  setup?.(k);
  for (let f = 1; f <= frames; f++) { k.step(scripts, f); k.compare(tag); probe(L); }
}
const maxOf = (get: (L: (e: string) => number) => number): { probe: Probe; max: () => number } => { let m = 0; return { probe: L => { m = Math.max(m, get(L)); }, max: () => m }; };

describe('parity: heavy shots, reflect, clash, breaker (Reimu vs legacy)', () => {
  it('heavy F (fan of fast shots) and B (slow orbs that split in six): arming distance, graze, hit, recoil', () => {
    const f = maxOf(L => L('P[1].state==="hitstun"?1:0')), n = maxOf(L => L('B.filter(b=>b.heavy).length'));
    run('F', [every(40, 0, 1, 'heavy'), idle], 400, l => { f.probe(l); n.probe(l); }); expect(f.max()).toBe(1);
    const b = maxOf(L => L('B.filter(b=>b.heavy).length'));
    run('B', [every(40, 0, -1, 'heavy'), idle], 400, b.probe); expect(b.max(), 'split bullets must appear').toBeGreaterThan(20);
  });
  it('charged heavy: LV2 (hold 60+ frames) adds side shots; LV3 (120+ frames, 15 spirit) adds an 8-way ring', () => {
    const lv = maxOf(L => L('P[0].hLv||1')), n = maxOf(L => L('B.filter(b=>b.heavy).length'));
    run('lv2', [holdBtn(120, 70, 1, 'heavy'), idle], 300, lv.probe); expect(lv.max()).toBe(2);
    const lv3 = maxOf(L => L('P[0].hLv||1'));
    run('lv3', [holdBtn(300, 135, 1, 'heavy'), idle], 300, l => { lv3.probe(l); n.probe(l); }, k => { k.s.spirit[0] = 50; k.legacy.eval('P[0].spirit=50'); });
    expect(lv3.max()).toBe(3); expect(n.max()).toBeGreaterThan(7);
  });
  it('parry reflects a heavy shot back (damage x1.3 per reflection, homing)', () => {
    const r = maxOf(L => L('Math.max(0,...B.map(b=>b.refl||0))'));
    const sc: Script[] = [f => ({ x: 1, btn: [...(f > 5 && f % 90 === 0 ? ['heavy'] : []), ...(f > 5 && (f + 1) % 7 === 0 ? ['parry'] : [])] }), every(4, 1, -1, 'parry')];
    run('reflect', sc, 800, r.probe); expect(r.max()).toBeGreaterThanOrEqual(2);
  });
  it('heavy vs heavy clash', () => {
    const both = maxOf(L => L('B.some(b=>b.heavy&&b.owner===0)&&B.some(b=>b.heavy&&b.owner===1)?1:0'));
    run('clash', [every(45, 0, 1, 'heavy'), every(45, 0, -1, 'heavy')], 400, both.probe); expect(both.max()).toBe(1);
  });
  it('breaker (parry + heavy) shatters the shield of a parrying foe', () => {
    const sb = maxOf(L => L('P[1].state==="parrystun"&&P[1].t>100?1:0'));
    const brk: Script = f => ({ x: 1, btn: f > 5 && f % 50 === 0 ? ['parry', 'heavy'] : f > 5 && f % 50 < 6 ? ['parry'] : [] });
    run('breaker', [brk, every(9, 0, 0, 'parry')], 500, sb.probe); expect(sb.max()).toBe(1);
  });
  it('hit-confirm: a connecting jab cancels into a heavy shot (pressed after the hit-stop, too late for a plain heavy)', () => {
    const c = maxOf(L => L('P[0].state==="atk"&&P[0].mvName==="heavyB"&&P[1].state==="hitstun"?1:0'));
    const sc: Script = f => (f < 62 ? { x: 1 } : { x: f % 40 === 14 || f % 40 === 15 ? -1 : 0.6, btn: f > 100 && f % 40 === 0 ? ['melee'] : f > 100 && f % 40 === 14 ? ['heavy'] : [] });
    run('confirm', [sc, f => (f < 62 ? { x: -1 } : {})], 600, c.probe); expect(c.max()).toBe(1);
  });
  it.todo('MAX POWER (7th reflection = unparryable instant KO): needs a scripted 7-reflection rally');
});
