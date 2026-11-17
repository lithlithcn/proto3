import { createRequire } from 'node:module';
import { BTN, World, newInput, setInput } from '@kernel';
import combat from '../../packs/combat/pack';
import touhou from '../../packs/touhou/pack';
import render from '../../packs/render/pack';
import touhoufx from '../../packs/touhoufx/pack';
import themed from '../../packs/themed/pack';
import { PS, type CombatState } from '../../packs/combat/state';
import { spellPool } from '../../packs/combat/api';

const require_ = createRequire(import.meta.url);
const { createLegacy } = require_('../../tools/parity/legacy.cjs') as { createLegacy(o: object): Legacy };

interface LegacyInput { x?: number; y?: number; b?: Record<string, boolean> }
interface Legacy { step(i: LegacyInput[]): void; obs(): { f: number; ts: number; P: LP[]; C: { x: number; y: number; on: number; age: number; type: string; cp: number[] }[]; E: { k: number; t: number; x: number; y: number; vx: number; vy: number; g: number; a: number; w?: number; h?: number; r?: number }[]; K: { o: number; x: number; y: number; a: number; t: number; dep: number }[]; B: LB[] }; eval(c: string): unknown }
interface LP { rifle: number; cam: number; clone: number; cHP: number; spk: number; elx: number; imm: number; mirror: number; giant: number; x: number; y: number; vx: number; vy: number; hp: number; state: string; t: number; boost: number; spirit: number; power: number; graze: number; inv: number; run: boolean; slide: number; shotCd: number; aim: number; stocks: number; kos: number; sd: number; pips: number; spit: number }
interface LB { x: number; y: number; vx: number; vy: number; r: number; owner: number; dmg?: number; life: number; fz: number; heavy?: number; mult?: number; dist?: number; refl: number; gr?: number; home?: number; wav?: number; ph?: number; fake?: number }

const BIT: Record<string, number> = { shot: BTN.shot, heavy: BTN.heavy, melee: BTN.melee, dash: BTN.dash, parry: BTN.parry, burst: BTN.burst, spell: BTN.spell, focus: BTN.focus, prev: BTN.prev, next: BTN.next };
export interface FrameIn { x?: number; y?: number; btn?: string[] }
/** Per-player input generator: frame number (1-based) → input. */
export type Script = (f: number) => FrameIn;

const q = (v: number | undefined): number => Math.max(-127, Math.min(127, Math.round((v ?? 0) * 127)));
/** Legacy player fields deliberately NOT auto-compared (each with its reason; DESIGN §25). */
/** Themed columns whose unset value is not 0 (legacy field absent). */
const THEMED_UNSET: Record<string, number> = { eatBy: -1 };
const AUTO_SKIP = new Set([
  'burst', // legacy `burst` is dead (removed feature, value 0.08); the port's `burst` is the live burst gauge: name collision
  'spP', // spirit at frame start: stored by a different wrapper layer in legacy; the resulting spirit IS compared
  'spReady', // 'SPELL READY' fx flag, refreshed only in some states in legacy; presentation only (spirit is compared)
]);
const STATE_NAME = Object.fromEntries(Object.entries(PS).map(([k, v]) => [v, k]));

/** Item name → pool index of the ported items (pool order = legacy order), rainbow = Last Word card. */
/** Item name → pool index: the ported items sorted by `order` (= legacy list order); the Last Word card is -2. */
function kindMap(world: World): Record<string, number> {
  const l = world.registry.list<{ order: number }>('item').map(([id, d]) => [id.replace(/^\w+:/, ''), d.order] as const).sort((a, b) => a[1] - b[1]);
  return { rainbow: -2, ...Object.fromEntries(l.map(([n], i) => [n, i])) };
}
export interface PairOpt { items?: string[]; maxCards?: number }
export function makePair(chars: string[], seed = 1, opt: PairOpt = {}) {
  const legacy = createLegacy({ chars, seed, items: !!opt.items });
  if (opt.items) legacy.eval(`ITEMS.forEach(i=>itemOn[i.k]=i.k==='rainbow'||${JSON.stringify(opt.items)}.includes(i.k));maxC=${opt.maxCards ?? 1}`);
  const world = new World({
    packs: process.env['PARITY_RENDER'] ? [combat, touhou, themed, render, touhoufx] : [combat, touhou, themed], seed, players: chars.length, sanitize: true, strict: true, diag: 2,
    world: { players: chars.map(c => ({ char: `touhou:${c}` })), ...(opt.items ? { items: true, itemSet: opt.items.flatMap(i => [`touhou:${i}`, `themed:${i}`]), maxCards: opt.maxCards ?? 1 } : { items: false }) },
  });
  const s = world.slice<CombatState>('combat'), KIND = kindMap(world);
  legacy.eval(`SPELLS.length=${spellPool(world).length}`); // legacy holds every character's card: keep exactly the ported ones, in the same order
  let autoK: string[] | null = null;
  const autoKeys = (): string[] => autoK ??= (JSON.parse(legacy.eval(`JSON.stringify(Object.entries(P[0]).filter(([k,v])=>typeof v==='number'||typeof v==='boolean').map(([k])=>k))`) as string) as string[]).filter(k => { if (AUTO_SKIP.has(k)) return false; const a = (s as unknown as Record<string, unknown>)[k]; return ArrayBuffer.isView(a) && (a as unknown as ArrayLike<number>).length >= chars.length; });
  return {
    legacy, world, s, kind: (name: string): number => KIND[name]!, itemNames: Object.keys(KIND).filter(n => n !== "rainbow"),
    /** Advance both with the same input scripts; returns nothing, use `compare()`. */
    step(scripts: Script[], f: number): void {
      const frames = scripts.map(sc => sc(f));
      const inp = newInput(chars.length);
      frames.forEach((fi, p) => setInput(inp, p, q(fi.x), q(fi.y), (fi.btn ?? []).reduce((m, b) => m | BIT[b]!, 0)));
      legacy.step(frames.map(fi => ({ x: q(fi.x) / 127, y: q(fi.y) / 127, b: Object.fromEntries(Object.keys(BIT).map(b => [b, (fi.btn ?? []).includes(b)])) })));
      world.step(inp);
    },
    /** Assert observable equality (tolerance 1e-6 abs/rel) at the current frame. */
    diffs(tag: string, tol = 1e-6, max = 40): string[] {
      const out: string[] = [];
      const o = legacy.obs();
      const near = (a: number, b: number, what: string): void => { const d = Math.abs(a - b); if (!(d <= tol * Math.max(1, Math.abs(b))) && out.length < max) out.push(`${tag} f${o.f} ${what}: proto3=${a} legacy=${b}`); };
      const eq = (a: unknown, b: unknown, msg: string): void => { if (a !== b && out.length < max) out.push(`${msg}: proto3=${String(a)} legacy=${String(b)}`); };
      eq(s.gf, o.f, `${tag} game frame`);
      o.P.forEach((lp, i) => {
        near(s.x[i]!, lp.x, `P${i}.x`); near(s.y[i]!, lp.y, `P${i}.y`); near(s.vx[i]!, lp.vx, `P${i}.vx`); near(s.vy[i]!, lp.vy, `P${i}.vy`);
        near(s.hp[i]!, lp.hp, `P${i}.hp`); near(s.boost[i]!, lp.boost, `P${i}.boost`); near(s.spirit[i]!, lp.spirit, `P${i}.spirit`); near(s.power[i]!, lp.power, `P${i}.power`);
        near(s.graze[i]!, lp.graze, `P${i}.graze`); near(s.inv[i]!, lp.inv, `P${i}.inv`); near(s.slide[i]!, lp.slide, `P${i}.slide`); near(s.shotCd[i]!, lp.shotCd, `P${i}.shotCd`); near(s.t[i]!, lp.t, `P${i}.t`);
        eq(STATE_NAME[s.state[i]!], lp.state, `${tag} f${o.f} P${i}.state`); eq(s.stocks[i], lp.stocks, `${tag} f${o.f} P${i}.stocks`);
        eq(s.run[i] === 1, lp.run, `${tag} f${o.f} P${i}.run`);
      });
      o.P.forEach((lp, i) => { eq(s.kos[i], lp.kos, `${tag} f${o.f} P${i}.kos`); eq(s.sd[i], lp.sd, `${tag} f${o.f} P${i}.sd`); eq(s.pips[i], lp.pips, `${tag} f${o.f} P${i}.pips`); eq(s.spit[i], lp.spit, `${tag} f${o.f} P${i}.spit`); });
      eq(s.ncard, o.C.length, `${tag} f${o.f} card count`);
      o.C.forEach((lc, i) => { near(s.cx[i]!, lc.x, `C${i}.x`); near(s.cy[i]!, lc.y, `C${i}.y`); eq(s.con[i], lc.on, `${tag} f${o.f} C${i}.on`); near(s.cage[i]!, lc.age, `C${i}.age`); eq(s.ckind[i], KIND[lc.type], `${tag} f${o.f} C${i}.kind`); lc.cp.forEach((v, q) => near(s.ccp[i * 32 + q]!, v, `C${i}.cp${q}`)); });
      o.P.forEach((lp, i) => { eq(s.fx[i * 128], lp.elx, `${tag} f${o.f} P${i}.elx`); eq(s.fx[i * 128 + 1], lp.imm, `${tag} f${o.f} P${i}.imm`); eq(s.mirror[i], lp.mirror, `${tag} f${o.f} P${i}.mirror`); eq(s.giant[i], lp.giant, `${tag} f${o.f} P${i}.giant`); for (const k of ['rifle', 'cam', 'clone', 'spk'] as const) eq(s[k][i], lp[k], `${tag} f${o.f} P${i}.${k}`); near(s.cloneHP[i]!, lp.cHP, `P${i}.cloneHP`); });
      eq(s.tstop, o.ts, `${tag} f${o.f} time stop`);
      eq(s.spSeed, Number(legacy.eval('seed')), `${tag} f${o.f} shared rng state (legacy seed)`); // every rng draw counted, even ones with no visible effect yet
      eq(s.nent, o.E.length, `${tag} f${o.f} entity count`);
      const idx = [...Array(s.nent).keys()].sort((a, b) => s.ek[a]! - s.ek[b]! || a - b); // legacy keeps one list per kind
      o.E.forEach((le, i) => { const j = idx[i]!; eq(s.ek[j], le.k, `${tag} f${o.f} E${i}.kind`); near(s.et[j]!, le.t, `E${i}.t`); near(s.ex[j]!, le.x, `E${i}.x`); near(s.ey[j]!, le.y, `E${i}.y`); near(s.evx[j]!, le.vx, `E${i}.vx`); near(s.evy[j]!, le.vy, `E${i}.vy`); eq(s.eg[j], le.g, `${tag} f${o.f} E${i}.g`); if (le.k === 2 || le.k === 10 || le.k >= 300) near(s.ea[j]!, le.a, `E${i}.a`); if (le.k >= 300) { near(s.ew[j]!, le.w!, `E${i}.w`); near(s.eh[j]!, le.h!, `E${i}.h`); } if (le.k === 104) { near(s.ew[j]!, le.w!, `E${i}.hp`); near(s.er[j]!, le.r!, `E${i}.loot`); } });
      eq(s.nkb, o.K.length, `${tag} f${o.f} KO beam count`);
      o.K.forEach((lk, i) => { eq(s.kbO[i], lk.o, `${tag} f${o.f} K${i}.o`); near(s.kbX[i]!, lk.x, `K${i}.x`); near(s.kbY[i]!, lk.y, `K${i}.y`); near(s.kbA[i]!, lk.a, `K${i}.a`); near(s.kbT[i]!, lk.t, `K${i}.t`); eq(s.kbDep[i], lk.dep, `${tag} f${o.f} K${i}.dep`); });
      eq(s.nb, o.B.length, `${tag} f${o.f} bullet count`);
      o.B.forEach((lb, i) => { eq(s.bflags[i]! & 32 ? 1 : 0, lb.fz, `${tag} f${o.f} B${i}.frozen`); near(s.bx[i]!, lb.x, `B${i}.x`); near(s.by[i]!, lb.y, `B${i}.y`); near(s.bvx[i]!, lb.vx, `B${i}.vx`); near(s.bvy[i]!, lb.vy, `B${i}.vy`); if (lb.heavy) { near(s.bmult[i]!, lb.mult!, `B${i}.mult`); near(s.bdist[i]!, lb.dist!, `B${i}.dist`); eq(s.brefl[i], lb.refl, `${tag} f${o.f} B${i}.refl`); near(s.br[i]!, lb.r, `B${i}.r`); } else near(s.bdmg[i]!, lb.dmg!, `B${i}.dmg`); near(s.blife[i]!, lb.life, `B${i}.life`); eq(s.bowner[i], lb.owner, `B${i}.owner`); eq((s.bflags[i]! & 4) ? 1 : 0, lb.gr ?? 0, `${tag} f${o.f} B${i}.grazed`); near(s.bhome[i]!, lb.home ?? 0, `B${i}.home`); near(s.bwav[i]!, lb.wav ?? 0, `B${i}.wav`); near(s.bph[i]!, lb.ph ?? 0, `B${i}.ph`); eq((s.bflags[i]! & 1024) ? 1 : 0, lb.fake ?? 0, `${tag} f${o.f} B${i}.fake`); });
      // THEMED: every per-player column of the themed slice vs the legacy player field of the same name (legacy `undefined` = the column's unset value; auraEl/auraT = legacy p.aura.el/.t)
      { const th = world.slice<Record<string, unknown> | undefined>('themed'); if (th) { const ks = Object.keys(th).filter(k => ArrayBuffer.isView(th[k]) && (th[k] as unknown as ArrayLike<number>).length === 32); if (ks.length) { const lv = JSON.parse(legacy.eval(`JSON.stringify(P.map(p=>${JSON.stringify(ks)}.map(k=>{const v=k==='auraEl'?(p.aura&&p.aura.el):k==='auraT'?(p.aura&&p.aura.t):p[k];return typeof v==='boolean'?+v:(typeof v==='number'&&isFinite(v)?v:null)})))`) as string) as (number | null)[][];
        lv.forEach((row, i) => row.forEach((v, j) => { const k = ks[j]!; near(Number((th[k] as ArrayLike<number>)[i]), v ?? (THEMED_UNSET[k] ?? 0), `P${i}.${k} (themed)`); })); } } }
      // AUTO: every numeric/boolean legacy player field that has a same-name per-player array in the port is compared too (exhaustive by name)
      const auto = autoKeys(); if (auto.length) { const lv = JSON.parse(legacy.eval(`JSON.stringify(P.map(p=>${JSON.stringify(auto)}.map(k=>{const v=p[k];return typeof v==='boolean'?+v:(typeof v==='number'&&isFinite(v)?v:null)})))`) as string) as (number | null)[][]; const sa = s as unknown as Record<string, ArrayLike<number>>; lv.forEach((row, i) => row.forEach((v, j) => { if (v !== null) near(Number(sa[auto[j]!]![i]), v, `P${i}.${auto[j]}`); })); }
      return out;
    },
    /** Legacy player fields not compared (no same-name port array): the coverage gap, to be mapped by hand or justified (render-only). */
    uncovered(): string[] { const auto = new Set(autoKeys()); return (JSON.parse(legacy.eval(`JSON.stringify(Object.entries(P[0]).filter(([k,v])=>typeof v==='number'||typeof v==='boolean').map(([k])=>k))`) as string) as string[]).filter(k => !auto.has(k)); },
    /** Assert observable equality (tolerance 1e-6 abs/rel) at the current frame; throws the first difference. */
    compare(tag: string, tol = 1e-6): void { const d = this.diffs(tag, tol, 1); if (d.length) throw new Error(d[0]); },
    /** Run scripts for `frames` frames, comparing after every frame. */
    run(tag: string, scripts: Script[], frames: number): void { for (let f = 1; f <= frames; f++) { this.step(scripts, f); this.compare(tag); } },
  };
}
