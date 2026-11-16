import { MAX_FX, MAXP, MAX_ENT, PS, MV_NAMES, moveOf, bodyR, coreR, charOf, statusPool, BF, type CombatState } from '@pack/combat/api';
import { sortBy, type World } from '@kernel';
import { COLS } from '../colors';
import { bindChars, CHDRAW } from './chars';
import { bindLayers } from './layers';

/** Presentation view-model: legacy draw code reads `q.x`, `q.fx.koishi`, `P[i]`, `ENT`… — this maps those names onto the SoA state (per-character aliases: legacy `ch*` fields live under each character's own names). */
const PSN: string[] = []; for (const [k, v] of Object.entries(PS)) PSN[v] = k;
const ALIAS: Record<string, Record<string, string>> = { hecatia: { chM: 'hM' }, okina: { chM: 'oS' }, nue: { chS: 'nS' } };
/** Port entity kind -> legacy ENT name and the columns its legacy fields live in (per-kind; base fields x/y/t/o/vx/vy/a/r always mapped). */
const EKN: Record<number, [string, Record<string, string | ((s: CombatState, i: number) => unknown)>]> = {
  1: ['ryy', { g: 'eg' }], 2: ['rbar', { w: 'ew', h: 'eh' }],
  3: ['mpot', { T: 'ebc' }], 4: ['mpud', {}], 5: ['mtr', {}],
  6: ['fsb', { T: 'ebc', c: (s, i) => ['#ff4a4a', '#ffa33a', '#ffe83a', '#5cff7a', '#4ab3ff', '#7a5cff', '#ff5cf0'][s.ea[i]!] }], 7: ['flv', { sp: 'ew' }], 8: ['ffl', {}], 9: ['fcl', { T: 'ebc' }],
  10: ['cray', { T: 'ebc', tele: 'eh', w: 'ew', len: 'er', warn: (s, i) => s.efl[i]! & 1, c: (s, i) => s.ec[i] ? '#' + (s.ec[i]! - 1).toString(16).padStart(6, '0') : '#fff', r: () => undefined }],
  200: ['hpl', { b: 'ebc' }], 201: ['hst', { b: 'ebc' }], 202: ['hrg', { i: 'ebc' }],
  203: ['ncl', { i: 'ebc' }], 204: ['nufo', {}], 205: ['nst', {}],
  206: ['obd', { T: 'ebc', n: 'ew' }], 207: ['odr', { hp: 'eh' }], 208: ['odn', { i: 'ebc' }],
  209: ['nms', { i: 'ebc' }], 210: ['npd', { ax: 'er', ay: 'eh', big: (s, i) => s.ebc[i] === 200 }], 211: ['npg', { i: 'ebc' }], 212: ['nrc', {}], 213: ['ncoin', { T: 'ebc' }],
  214: ['atn', {}], 215: ['anw', { tg: 'ebc' }], 216: ['awd', {}],
  100: ['heal', {}], 101: ['bomb', {}], 102: ['hole', {}], 103: ['bump', {}], 104: ['fairy', {}],
};
const ENTF: Record<string, string> = { o: 'eo', t: 'et', x: 'ex', y: 'ey', vx: 'evx', vy: 'evy', a: 'ea', r: 'er' };
const EV = new Map<number, Record<string, unknown>>();
function entView(s: CombatState, i: number): Record<string, unknown> {
  const [k, m] = EKN[s.ek[i]!] ?? ['?' + s.ek[i], {}], id = s.eid[i]!;
  let o = EV.get(id); if (!o) { o = {}; EV.set(id, o); if (EV.size > 600) { const first = EV.keys().next().value!; EV.delete(first); } }
  o['k'] = k; o['i'] = 0; o['_i'] = i;
  const S = s as unknown as Record<string, ArrayLike<number>>;
  for (const [f, c] of Object.entries(ENTF)) o[f] = S[c]![i];
  for (const [f, c] of Object.entries(m)) o[f] = typeof c === 'function' ? c(s, i) : S[c]![i];
  return o;
}

export interface Env { w: World; s: CombatState; th: Record<string, ArrayLike<number>>; rnd: () => number }
export function makeQ(e: Env, p: number): Record<string, unknown> {
  const { w, s, th } = e, fxo = new Proxy({}, { get: (_, n: string) => { const d = statusPool(w).find(x => x?.name === n); return d ? s.fx[p * MAX_FX + d.slot]! : undefined; } });
  const key = (): string => charOf(w, s, p).name.toLowerCase();
  return new Proxy({}, { get(_, k: string) {
    switch (k) {
      case 'id': return p; case 'cpu': return !!s.cpu[p]; case 'state': return PSN[s.state[p]!];
      case 'fx': return fxo; case 'mvName': return s.mvId[p]! > 0 ? MV_NAMES[s.mvId[p]!] : undefined;
      case 'mv': return s.mvId[p]! > 0 && s.state[p] === PS.atk ? moveOf(w, s, p) : null;
      case 'chC': if (key() === 'flandre') return 9; break; // legacy flandre.tick pins chC=9, chM=1 every frame
      case 'chM': if (key() === 'flandre') return 1; break;
      case 'chG': return juiceOf(w).chG[p] ?? undefined;
      case 'burst': return s.skip || (s.tstop > 0 && p !== s.tso) || s.state[p] === PS.dead ? 0 : 0.08; // legacy burst is a dead feature (reset every step, then one regen tick); its mini-HUD bar shows that
      case 'tgt': return s.tgt[p]! >= 0 ? cur[s.tgt[p]!] : undefined;
      case 'nOrig': return th.nOr?.[p] ? th.nOc![p] : undefined;
      case 'stocks': return s.stocks[p]; case 'charging': return !!s.charging[p]; case 'focus': return !!s.focus[p]; case 'giant': return s.giant[p];
    }
    const a = ALIAS[key()]?.[k] ?? k, t = th[a], c = (s as unknown as Record<string, ArrayLike<number>>)[a];
    const arr = t ?? (c && typeof c === 'object' && c.length === MAXP ? c : undefined);
    return arr ? arr[p] : undefined;
  } });
}

const QS = new WeakMap<World, { env: Env; q: Record<string, unknown>[] }>();
/** Player proxies, one per player and world (stable identity: legacy trail caches key on the player object). */
function qsOf(e: Env): Record<string, unknown>[] {
  let c = QS.get(e.w); if (!c) { c = { env: e, q: [] }; QS.set(e.w, c); }
  Object.assign(c.env, e); for (let i = c.q.length; i < e.s.n; i++) c.q.push(makeQ(c.env, i));
  return c.q.slice(0, e.s.n);
}
/** Legacy bullet objects (only the fields legacy drawing reads). */
const SHN = ['orb', 'rice', 'kunai', 'star', 'bubble', 'pill', 'flea'];
export const bulletsView = (s: CombatState): Record<string, unknown>[] => Array.from({ length: s.nb }, (_, i) => {
  const f = s.bflags[i]!, sh = SHN[s.bsh[i]!];
  return { id: s.bid[i], x: s.bx[i], y: s.by[i], vx: s.bvx[i], vy: s.bvy[i], r: s.br[i], dead: !!(f & BF.dead), heavy: !!(f & BF.heavy), breaker: !!(f & BF.breaker), oneshot: !!(f & BF.oneshot), rifle: !!(f & BF.rifle),
    owner: s.bowner[i], refl: s.brefl[i], dist: s.bdist[i], bf: s.bborn[i], ang: s.bang[i], sh: sh === 'orb' ? undefined : sh, m: f & BF.heavy ? { arm: s.barm[i], dmg: s.bdmg[i] } : undefined,
    c: s.bcol[i] ? '#' + (s.bcol[i]! & 0xffffff).toString(16).padStart(6, '0') : undefined };
});
/** Everything the copied legacy drawing code touches, rebuilt per frame (cheap: <= 8 players, lazy bullet/entity views). */
export function bindLegacy(c: CanvasRenderingContext2D, e: Env): void {
  const { w, s } = e, P = qsOf(e), cache: { B?: unknown[]; ENT?: unknown[] } = {};
  const v = {
    ctx: c, frame: s.gf, P, rnd: e.rnd, hitstop: s.hitstop, CX: {} as Record<string, unknown>, bodyR: (q: { id: number }) => bodyR(s, q.id), coreR: (q: { id: number }) => coreR(s, q.id),
    get B() { return cache.B ??= bulletsView(s); },
    get ENT() { return cache.ENT ??= Array.from({ length: Math.min(s.nent, MAX_ENT) }, (_, i) => entView(s, i)); },
    chOf: (q: { id: number }) => { const k = charOf(w, s, q.id).name.toLowerCase(); const d = (CHDRAW as Record<string, unknown>)[k]; return d ? { k, draw: d } : null; },
    foeOf: (id: number, q: { id: number }) => !s.teams || s.team[id] !== s.team[q.id],
    COLS,
  };
  cur = P; bindChars(v); bindLayers(v);
}
let cur: unknown[] = [];
const P = (p: number): unknown => cur[p];

import { drawP } from './layers';
/** Draw one player through the legacy layer chain (base body, status layers, per-character art, Nue disguise, contract, Satori ghost). */
export function drawPlayerL(c: CanvasRenderingContext2D, w: World, s: CombatState, p: number, rnd: () => number = Math.random): void {
  const e: Env = { w, s, th: w.slice<Record<string, ArrayLike<number>>>('touhou'), rnd };
  bindLegacy(c, e); drawP(P(p));
}

import { bindViewFx, drawJuiceWorld, drawVignette } from './viewfx';
import { juiceOf } from '../juice/state';
/** Legacy drawView effect layers over the world (FX, graze arcs, rings, KO beams, texts, lines, cracks, waves, inversion, The World tint). */
export function drawWorldFxL(c: CanvasRenderingContext2D, w: World, s: CombatState, L: number, Tp: number, R: number, Bt: number, vw: number, vh: number): void {
  const e: Env = { w, s, th: w.slice<Record<string, ArrayLike<number>>>('touhou'), rnd: () => RANDOM.fn() }, j = juiceOf(w);
  bindLegacy(c, e);
  bindViewFx({ ctx: c, frame: s.gf, P: cur, FX: j.FX, TX: j.TX, RINGS: j.RINGS, WAVES: j.WAVES, LINES: j.LINES, KOFX: j.KOFX, CRACK: j.CRACK, GZ: j.GZ.map(g => ({ ...g, p: cur[g['p'] as number] })), invF: j.invF, TSTOP: s.tstop, TSO: s.tso, drawP, fxLow: false });
  drawJuiceWorld(L, Tp, R, Bt, vw, vh);
}
/** Legacy low-HP red vignette of one view (drawn after the world transform is restored). */
export function drawVignetteL(c: CanvasRenderingContext2D, w: World, s: CombatState, v: { x: number; w: number }, H: number, p: number): void {
  const e: Env = { w, s, th: w.slice<Record<string, ArrayLike<number>>>('touhou'), rnd: () => RANDOM.fn() };
  bindLegacy(c, e); bindViewFx({ ctx: c, frame: s.gf, P: cur, drawP }); drawVignette(v, H, cur[p]);
}

import { bindWorld, drawWorldItems } from './world';
import { bindIfx } from './ifx';
import { bindThemed } from './themed';
import { magicCircleL } from './viewfx';
/** Legacy drawWorldItems + entity drawings (EDR) + Reimu orbs/border + Nue UFOs. Item worlds come from their entities; themed items arrive with lot 3. */
export function drawWorldItemsL(c: CanvasRenderingContext2D, w: World, s: CombatState): void {
  const e: Env = { w, s, th: w.slice<Record<string, ArrayLike<number>>>('touhou'), rnd: () => RANDOM.fn() };
  bindLegacy(c, e); drawWorldItemsBind(c, w, s); drawWorldItems();
}
function drawWorldItemsBind(c: CanvasRenderingContext2D, w: World, s: CombatState): void {
  const ENT = [...Array.from({ length: s.nent }, (_, i) => entView(s, i)).filter(x => !String(x['k']).startsWith('?')), ...juiceOf(w).PE];
  const of = (k: string): Record<string, unknown>[] => ENT.filter(x => x['k'] === k);
  const KOB = Array.from({ length: s.nkb }, (_, i) => ({ o: s.kbO[i], x: s.kbX[i], y: s.kbY[i], a: s.kbA[i], t: s.kbT[i], T: s.kbTT[i] })).filter(k => (k.t ?? 0) >= 0);
  const ORBS = of('heal'), FAIRIES = of('fairy').map(f => ({ ...f, o: s.eg[f['_i'] as number] })), HOLES = of('hole').map(h => Object.assign(h, { a: (360 - (h['t'] as number)) * 0.1 })), BUMPS = of('bump').map(u => Object.assign(u, { hit: s.eh[u['_i'] as number] ?? 0 })), ZONES = of('bomb');
  bindThemed({ ctx: c, frame: s.gf, P: cur, ENT, B: bulletsView(s), bodyR: (q: { id: number }) => bodyR(s, q.id) });
  bindIfx({ ctx: c, frame: s.gf, P: cur, ENT: ENT.filter(x => !['heal', 'bomb', 'hole', 'bump', 'fairy'].includes(x['k'] as string)), ORBS, FAIRIES, HOLES, BUMPS, ZONES, PHOTO: [], WARP: s.warp, VIEW: 0, bodyR: (q: { id: number }) => bodyR(s, q.id) });
  bindWorld({ ctx: c, frame: s.gf, P: cur, B: [], ENT: ENT.filter(x => !['heal', 'bomb', 'hole', 'bump', 'fairy'].includes(x['k'] as string)), KOB,
    HOLES, BUMPS, PHOTO: [], ZONES, ORBS, FAIRIES, IM: { rifle: { start: 40 } }, bodyR: (q: { id: number }) => bodyR(s, q.id), magicCircle: magicCircleL });
}

import { bindView, drawView as drawViewLegacy } from './view';
import { CARD_ULT, MAXP as MP, T as TT } from '@pack/combat/api';
/** Clock of time-based décor (legacy performance.now); parity probes pin it to the legacy harness clock (0). */
/** Cosmetic randomness of the copied legacy code (jitters, particles); parity probes pin it. */
export const RANDOM = { fn: (): number => Math.random() };
export const RENDER_CLOCK = { now: (): number => performance.now() };
/** One view through the verbatim legacy drawView. `cams` = the port camera objects (legacy writes x/y in place); `H`/`SCv` as legacy render() sets them. */
export function drawViewL(c: CanvasRenderingContext2D, w: World, s: CombatState, v: { x: number; y: number; w: number; h: number; i: number; q?: 1 }, cams: { x: number; y: number }[], sc: number): void {
  const e: Env = { w, s, th: w.slice<Record<string, ArrayLike<number>>>('touhou'), rnd: () => RANDOM.fn() }, j = juiceOf(w);
  bindLegacy(c, e);
  const items = sortItems(w), B = bulletsView(s);
  const CARDS = Array.from({ length: s.ncard }, (_, k) => ({ type: s.ckind[k] === CARD_ULT ? 'rainbow' : items[s.ckind[k]!]?.k, x: s.cx[k], y: s.cy[k], on: s.con[k]! > 0, cont: !!s.ccont[k], cp: Array.from({ length: s.n }, (_, i) => s.ccp[k * MP + i]) }));
  const ENT = [...Array.from({ length: s.nent }, (_, i) => entView(s, i)).filter(x => !String(x['k']).startsWith('?')), ...j.PE];
  j.stock0 ||= Math.max(1, ...Array.from({ length: s.n }, (_, i) => s.stocks[i]!));
  bindView({ ctx: c, frame: s.gf, P: cur, B, ENT, cams, performance: RENDER_CLOCK, STOCKS: [j.stock0], stI: 0, MVIEW: {}, T: { ...TT, MAP_W: s.mapW, MAP_H: s.mapH, EDGE: s.edge }, BGH: [], CARDS, ITEMS: items, item: CARDS[0] ?? null, hitstop: s.hitstop,
    FX: j.FX, TX: j.TX, RINGS: j.RINGS, WAVES: j.WAVES, LINES: j.LINES, KOFX: j.KOFX, CRACK: j.CRACK, GZ: j.GZ.map(g => ({ ...g, p: cur[g['p'] as number] })), invF: j.invF, TSTOP: s.tstop, TSO: s.tso,
    shake: j.shake, kx: j.kx, ky: j.ky, zk: j.zk, bgF: j.bgF, NERV: s.tempo, slow: s.slow, WARP: s.warp, TEAMS: s.teams, H: v.h, SCv: sc, bodyR: (q: { id: number }) => bodyR(s, q.id), coreR: (q: { id: number }) => coreR(s, q.id) });
  drawWorldItemsBind(c, w, s);
  drawViewLegacy(v);
}
/** Legacy ITEMS (k = content id without pack prefix, name, colour) in the card-draw order. */
const IT = new WeakMap<World, { k: string; name: string; c: string }[]>();
function sortItems(w: World): { k: string; name: string; c: string }[] {
  let l = IT.get(w); if (!l) { l = sortBy(w.registry.list<{ name: string; color: string; order: number }>('item'), e => e[1].order, e => e[1].order).map(([id, d]) => ({ k: id.split(':').pop()!, name: d.name, c: d.color })); IT.set(w, l); }
  return l;
}

import { bindScreen, drawScreen, drawScreenTop, screenFilterOf } from './screen';
import { spellPool } from '@pack/combat/api';
function bindScreenL(c: CanvasRenderingContext2D, w: World, s: CombatState, W: number, H: number): void {
  const e: Env = { w, s, th: w.slice<Record<string, ArrayLike<number>>>('touhou'), rnd: () => RANDOM.fn() }, j = juiceOf(w);
  bindLegacy(c, e);
  const items = sortItems(w), card = s.ncard ? { type: s.ckind[0] === CARD_ULT ? 'rainbow' : items[s.ckind[0]!]?.k, on: s.con[0]! > 0 } : null;
  bindScreen({ SPELLS: spellPool(w), ctx: c, cv: c.canvas, frame: s.gf, P: cur, W, H, T: { ...TT, MAP_W: s.mapW, MAP_H: s.mapH, EDGE: s.edge }, borderF: j.borderF, focusL: j.focusL, BIG: j.BIG, flashS: j.flashS, flashCol: j.flashCol, bright: j.bright, zblur: j.zblur, chroma: j.chroma,
    NERV: s.tempo, slow: s.slow, TSTOP: s.tstop, ITEMS: items, item: card, itemT: s.itemT, itemsOn: s.itemsOn, WARP: s.warp, FAIRIES: Array.from({ length: s.nent }, (_, i) => s.ek[i]).filter(k => k === 104), bodyR: (q: { id: number }) => bodyR(s, q.id), fxLow: false });
}
/** Legacy render() layers over the views (border flash, speed lines, banners, flash/brightness, zoom blur, chroma split, spell UI). */
export function drawScreenL(c: CanvasRenderingContext2D, w: World, s: CombatState, W: number, H: number): void { bindScreenL(c, w, s, W, H); drawScreen(); }
/** Legacy render() layers after the HUD (timer, item activations, next-card line). */
export function drawScreenTopL(c: CanvasRenderingContext2D, w: World, s: CombatState, W: number, H: number): void { bindScreenL(c, w, s, W, H); drawScreenTop(); }
/** CSS filter of the canvas (legacy screenFilter: saturated during slow-motion, inverted during a time stop). */
export function screenFilterL(c: CanvasRenderingContext2D, w: World, s: CombatState, W: number, H: number): string { bindScreenL(c, w, s, W, H); return screenFilterOf(); }
