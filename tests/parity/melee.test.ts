import { describe, expect, it } from 'vitest';
import { type Script, makePair } from './harness';

/** P0 walks at the foe; taps melee every 9 frames, and in the second half of every 120 frames holds focus (charged strong). */
const CAD = 9;
const chaser: Script = f => ({ x: 1, y: 0, btn: f > 100 ? (f % 120 > 60 ? ['focus', ...(f % CAD < 4 ? ['melee'] : [])] : f % CAD === 0 ? ['melee'] : []) : [] });
const still: Script = () => ({});
const dasher = (every: number): Script => f => (f % every === 0 ? { btn: ['dash'] } : {});
const drift: Script = f => ({ x: 0.3, y: f % 90 < 45 ? 1 : -1 });

interface Seen { states: Set<string>; maxCombo: number; maxCharge: number; minPips: number; bounce: number; techs: number }
/** Runs the pair frame by frame (every frame compared) and records what the legacy side went through, so a scenario cannot pass vacuously. */
function run(tag: string, scripts: Script[], frames: number): Seen {
  const k = makePair(['reimu', 'reimu']), L = (e: string): number => k.legacy.eval(e) as number;
  const seen: Seen = { states: new Set(), maxCombo: 0, maxCharge: 0, minPips: 9, bounce: 0, techs: 0 };
  for (let f = 1; f <= frames; f++) {
    k.step(scripts, f); k.compare(tag);
    seen.states.add(String(k.legacy.eval('P[1].state'))); seen.states.add(`a:${String(k.legacy.eval('P[0].state'))}`); seen.maxCombo = Math.max(seen.maxCombo, L('P[1].combo')); seen.maxCharge = Math.max(seen.maxCharge, L('P[0].charge'));
    seen.minPips = Math.min(seen.minPips, L('P[1].pips')); seen.bounce = Math.max(seen.bounce, L('P[1].bounceN') | 0);
    if (k.legacy.eval('P[1].state==="idle"&&P[1].inv===14')) seen.techs++;
  }
  expect(L('P[1].hp') < 100 || L('P[1].stocks') < 3, 'victim must be damaged').toBe(true);
  return seen;
}

describe('parity: melee and hit system (Reimu vs legacy)', () => {
  it('lunge / jab / charged strong chain: hit, hit-stun, knockback, charge, stun-repeat, combo, wall pips', () => {
    const s = run('chain', [chaser, still], 1800);
    expect(s.states.has('a:atk') && s.states.has('hitstun')).toBe(true);
    expect(s.maxCharge, 'strong must have been charged').toBeGreaterThan(0);
    expect(s.minPips, 'wall pips must be spent').toBeLessThan(3);
  });
  it('DI / SDI while being juggled', () => {
    const s = run('di', [chaser, drift], 700);
    expect(s.states.has('hitstun')).toBe(true);
  });
  it('wall tech (dash buffer) and bounces of overpowered launches', () => {
    const s = run('tech', [chaser, dasher(25)], 1500);
    expect(s.techs, 'a tech must happen').toBeGreaterThan(0);
    expect(s.bounce, 'an overpowered launch must set bounces').toBeGreaterThan(0);
  });
  it('knock-out by hits (hp or street smash), hit-stop and slow-motion; stops before the KO beam lands', () => {
    const k = makePair(['reimu', 'reimu']);
    for (let f = 1; f <= 2250; f++) { k.step([chaser, dasher(11)], f); k.compare('ko'); }
    expect(k.legacy.obs().P[1]!.stocks, 'scenario must include a KO').toBeLessThan(3);
  });
});
