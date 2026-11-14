import { describe, expect, it } from 'vitest';
import { type Script, makePair } from './harness';

const ALL = ['yellow', 'green', 'purple', 'orange', 'mirror', 'oni', 'elixir'];
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
    for (const seed of [1, 2, 3, 4, 5, 6]) {
      const k = makePair(['reimu', 'reimu'], seed, { items: ALL, maxCards: 1 });
      const sc = [walker(k), () => ({})];
      for (let f = 1; f <= 2600; f++) {
        k.step(sc, f); k.compare(`cards${seed}`);
        const it = k.legacy.eval('P[0].lastIt') as string | undefined; if (it) seen.add(it);
      }
    }
    expect(seen.size, `kinds given: ${[...seen]}`).toBeGreaterThanOrEqual(5);
  }, 60000);
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
  it('Blade, Bombs, Warp given directly: blades cut, bombs fall near the foe, walls wrap', () => {
    const walkTo: Script = f => ({ x: f < 200 ? 1 : 0, btn: [] }), still: Script = () => ({});
    const cases: [string, string, (k: Pair) => void, Script, Script, number][] = [
      ['blade', 'P[0].blade=600', k => { k.s.blade[0] = 600; }, walkTo, still, 500],
      ['bombs', 'P[0].bombs=480', k => { k.s.bombs[0] = 480; }, still, still, 700],
      ['warp', 'WARP=600', k => { k.s.warp = 600; }, f => ({ x: -1, y: f > 100 ? 0.5 : 0, btn: [] }), still, 400],
    ];
    for (const [name, lg, set, a, b, n] of cases) {
      const k = makePair(['reimu', 'reimu'], 11, { items: ['green'] });
      k.legacy.eval(lg); set(k);
      let hurt = 0, zone = 0, wrapped = 0;
      for (let f = 1; f <= n; f++) {
        k.step([a, b], f); k.compare(name);
        hurt = Math.max(hurt, k.legacy.eval('P[1].hp<100?1:0') as number); zone = Math.max(zone, k.legacy.eval('ZONES.length') as number);
        wrapped = Math.max(wrapped, k.legacy.eval('P[0].x>T.MAP_W-100?1:0') as number);
      }
      if (name === 'blade') expect(hurt, name).toBe(1);
      if (name === 'bombs') expect(zone, name).toBeGreaterThan(0);
      if (name === 'warp') expect(wrapped, name).toBe(1);
    }
  });
  it('Hourai Elixir: 5 s brewing, then 10 s immortal (a lethal blow leaves 1 HP and 30 frames of invincibility)', () => {
    const k = makePair(['reimu', 'reimu'], 13, { items: ['green'] });
    k.legacy.eval('P[0].fx.elx=300;P[0].hp=4'); k.s.fx[0] = 300; k.s.hp[0] = 4;
    let immSeen = 0, saved = 0;
    const foe: Script = f => ({ x: f < 60 ? -1 : 0, btn: [...(f > 310 ? ['shot'] : []), ...(f > 330 && f % 45 === 0 ? ['heavy'] : [])] });
    for (let f = 1; f <= 930; f++) { // stops before the post-immortal KO: its beam angle hits the deliberate R71 deviation (friction residue)
      k.step([() => ({}), foe], f); k.compare('elixir');
      immSeen = Math.max(immSeen, k.legacy.eval('P[0].fx.imm>0?1:0') as number);
      if ((k.legacy.eval('P[0].fx.imm>0&&P[0].hp===1?1:0') as number)) saved = 1;
    }
    expect(immSeen).toBe(1); expect(saved, 'a KO was prevented').toBe(1);
  });
});
