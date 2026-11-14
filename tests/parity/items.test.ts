import { describe, expect, it } from 'vitest';
import { type Script, makePair } from './harness';

type Pair = ReturnType<typeof makePair>;
/** Walk P0 onto the oldest armed card (parity guarantees both sides agree on positions) and stay there. */
const walker = (k: Pair, who = 0): Script => () => {
  const c = k.legacy.eval('CARDS.find(c=>c.on)||null') as { x: number; y: number } | null;
  if (!c) return {};
  const dx = c.x - k.s.x[who]!, dy = c.y - k.s.y[who]!, d = Math.hypot(dx, dy);
  return d < 12 ? {} : { x: dx / d, y: dy / d };
};

describe('parity: item cards and the first items (vs legacy)', () => {
  it('cards spawn, warn, fill while stood on, and give green / mirror / oni; orbs heal; timers run down', () => {
    const seen = new Set<string>();
    for (const seed of [1, 2, 3, 4]) {
      const k = makePair(['reimu', 'reimu'], seed, { items: ['green', 'mirror', 'oni'] });
      const sc = [walker(k), () => ({})];
      for (let f = 1; f <= 2600; f++) {
        k.step(sc, f); k.compare(`cards${seed}`);
        const it = k.legacy.eval('P[0].lastIt') as string | undefined; if (it) seen.add(it);
      }
    }
    expect([...seen].sort()).toEqual(['green', 'mirror', 'oni']);
  });
  it('Last Word card (items off): appears at ULT_EVERY, gives the ultimate', () => {
    const k = makePair(['reimu', 'reimu'], 5);
    const sc = [walker(k), () => ({})];
    let got = 0;
    for (let f = 1; f <= 2400; f++) { k.step(sc, f); k.compare('lastword'); got = Math.max(got, k.legacy.eval('P[0].ult?1:0') as number); }
    expect(got).toBe(1);
  });
  it('Mirror Aura bounces bullets (light + heavy) back at the shooter; Oni Giant: reach x1.6, damage x1.5, half knockback, bigger body', () => {
    const k = makePair(['reimu', 'reimu'], 7, { items: ['green'] });
    k.legacy.eval('P[0].mirror=400;P[1].giant=400'); k.s.mirror[0] = 400; k.s.giant[1] = 400;
    let bounced = 0, hit = 0;
    const shooter: Script = f => ({ x: f < 90 ? -1 : 0, btn: [...(f > 5 ? ['shot'] : []), ...(f > 5 && f % 60 === 0 ? ['heavy'] : [])] });
    const brawler: Script = f => ({ x: f < 140 ? 1 : 0.3, btn: f > 70 && f % 40 === 0 ? ['melee'] : [] });
    for (let f = 1; f <= 400; f++) {
      k.step([brawler, shooter], f); k.compare('mirror-giant');
      bounced = Math.max(bounced, k.legacy.eval('B.filter(b=>b.owner===0).length') as number);
      hit = Math.max(hit, k.legacy.eval('P[1].hp<100?1:0') as number);
    }
    expect(bounced, 'reflected bullets belong to the mirror owner').toBeGreaterThan(0); expect(hit, 'the giant gets hit').toBe(1);
  });
});
