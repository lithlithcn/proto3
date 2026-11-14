import { createRequire } from 'node:module';
import { expect } from 'vitest';
import { BTN, World, newInput, setInput } from '@kernel';
import combat from '../../packs/combat/pack';
import touhou from '../../packs/touhou/pack';
import { PS, type CombatState } from '../../packs/combat/state';

const require_ = createRequire(import.meta.url);
const { createLegacy } = require_('../../tools/parity/legacy.cjs') as { createLegacy(o: object): Legacy };

interface LegacyInput { x?: number; y?: number; b?: Record<string, boolean> }
interface Legacy { step(i: LegacyInput[]): void; obs(): { f: number; P: LP[]; B: LB[] }; eval(c: string): unknown }
interface LP { x: number; y: number; vx: number; vy: number; hp: number; state: string; t: number; boost: number; spirit: number; power: number; graze: number; inv: number; run: boolean; slide: number; shotCd: number; aim: number; stocks: number }
interface LB { x: number; y: number; vx: number; vy: number; r: number; owner: number; dmg?: number; life: number; heavy?: number; mult?: number; dist?: number; refl: number }

const BIT: Record<string, number> = { shot: BTN.shot, heavy: BTN.heavy, melee: BTN.melee, dash: BTN.dash, parry: BTN.parry, spell: BTN.spell, focus: BTN.focus };
export interface FrameIn { x?: number; y?: number; btn?: string[] }
/** Per-player input generator: frame number (1-based) → input. */
export type Script = (f: number) => FrameIn;

const q = (v: number | undefined): number => Math.max(-127, Math.min(127, Math.round((v ?? 0) * 127)));
const STATE_NAME = Object.fromEntries(Object.entries(PS).map(([k, v]) => [v, k]));

export function makePair(chars: string[], seed = 1) {
  const legacy = createLegacy({ chars, seed });
  const world = new World({
    packs: [combat, touhou], seed, players: chars.length, sanitize: true, strict: true,
    world: { players: chars.map(c => ({ char: `touhou:${c}` })) },
  });
  const s = world.slice<CombatState>('combat');
  return {
    legacy, world, s,
    /** Advance both with the same input scripts; returns nothing, use `compare()`. */
    step(scripts: Script[], f: number): void {
      const frames = scripts.map(sc => sc(f));
      const inp = newInput(chars.length);
      frames.forEach((fi, p) => setInput(inp, p, q(fi.x), q(fi.y), (fi.btn ?? []).reduce((m, b) => m | BIT[b]!, 0)));
      legacy.step(frames.map(fi => ({ x: q(fi.x) / 127, y: q(fi.y) / 127, b: Object.fromEntries((fi.btn ?? []).map(b => [b, true])) })));
      world.step(inp);
    },
    /** Assert observable equality (tolerance 1e-6 abs/rel) at the current frame. */
    compare(tag: string, tol = 1e-6): void {
      const o = legacy.obs();
      const near = (a: number, b: number, what: string): void => { const d = Math.abs(a - b); if (!(d <= tol * Math.max(1, Math.abs(b)))) throw new Error(`${tag} f${o.f} ${what}: proto3=${a} legacy=${b}`); };
      expect(s.gf, `${tag} game frame`).toBe(o.f);
      o.P.forEach((lp, i) => {
        near(s.x[i]!, lp.x, `P${i}.x`); near(s.y[i]!, lp.y, `P${i}.y`); near(s.vx[i]!, lp.vx, `P${i}.vx`); near(s.vy[i]!, lp.vy, `P${i}.vy`);
        near(s.hp[i]!, lp.hp, `P${i}.hp`); near(s.boost[i]!, lp.boost, `P${i}.boost`); near(s.spirit[i]!, lp.spirit, `P${i}.spirit`); near(s.power[i]!, lp.power, `P${i}.power`);
        near(s.graze[i]!, lp.graze, `P${i}.graze`); near(s.inv[i]!, lp.inv, `P${i}.inv`); near(s.slide[i]!, lp.slide, `P${i}.slide`); near(s.shotCd[i]!, lp.shotCd, `P${i}.shotCd`); near(s.t[i]!, lp.t, `P${i}.t`);
        expect(STATE_NAME[s.state[i]!], `${tag} f${o.f} P${i}.state`).toBe(lp.state); expect(s.stocks[i], `${tag} f${o.f} P${i}.stocks`).toBe(lp.stocks);
        expect(s.run[i] === 1, `${tag} f${o.f} P${i}.run`).toBe(lp.run);
      });
      expect(s.nb, `${tag} f${o.f} bullet count`).toBe(o.B.length);
      o.B.forEach((lb, i) => { near(s.bx[i]!, lb.x, `B${i}.x`); near(s.by[i]!, lb.y, `B${i}.y`); near(s.bvx[i]!, lb.vx, `B${i}.vx`); near(s.bvy[i]!, lb.vy, `B${i}.vy`); if (lb.heavy) { near(s.bmult[i]!, lb.mult!, `B${i}.mult`); near(s.bdist[i]!, lb.dist!, `B${i}.dist`); expect(s.brefl[i], `${tag} f${o.f} B${i}.refl`).toBe(lb.refl); near(s.br[i]!, lb.r, `B${i}.r`); } else near(s.bdmg[i]!, lb.dmg!, `B${i}.dmg`); near(s.blife[i]!, lb.life, `B${i}.life`); expect(s.bowner[i]).toBe(lb.owner); });
    },
    /** Run scripts for `frames` frames, comparing after every frame. */
    run(tag: string, scripts: Script[], frames: number): void { for (let f = 1; f <= frames; f++) { this.step(scripts, f); this.compare(tag); } },
  };
}
