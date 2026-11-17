/* pnpm ui [scenario...] — menu/screen parity: draws the same screen state with the legacy render() (headless, op recorder) and with the port UI,
 * then diffs the two op streams (canonicalised like `pnpm render compare`). Scenarios set the state on both sides and the clock (ms).
 * Cosmetic decorations generated with Math.random at load are copied legacy -> port; later Math.random draws are pinned to 0.5 on both sides. */
import { createRequire } from 'node:module';
import { RND, type UiCtx } from '@pack/ui/core';
import { APP, renderUi, type UiHost } from '@pack/ui/app';
import { TEMB, TGAL, TSTAR } from '@pack/ui/screens/title/bg';
import { TITLE } from '@pack/ui/screens/title/title';
import { UISUB, UIT } from '@pack/ui/trans';
import { SUB } from '@pack/ui/screens/sub/draw';
import { IM } from '@pack/ui/screens/items/items';
import { BIND } from '@pack/ui/screens/binds/binds';
import { GUIDE } from '@pack/ui/screens/info/info';
import { SET } from '@pack/ui/settings';
import type { ItemDef } from '@pack/combat/api';
import { optionRows, ruleRows, soundRows, teamRows } from '@pack/ui/screens/sub/menus';
import { UIDOTS } from '@pack/ui/bg';
import { HUBP } from '@pack/ui/screens/hub/deco';
import { UIHUB } from '@pack/ui/screens/hub/hub';
import { CS2, CSA, cssOpen } from '@pack/ui/screens/css/state';
import type { CharacterDef } from '@pack/combat/api';
import touhou from '@pack/touhou/pack';
import { LS, PZ, drawGameEnd, drawIntro, drawLastStock, drawPause } from '@pack/ui/screens/fight/overlays';
import { drawResults, resetResults, type ResP } from '@pack/ui/screens/fight/results';

const req = createRequire(import.meta.url);
const { createLegacy } = req('../parity/legacy.cjs') as { createLegacy(o: object): Legacy };
const { makeRecorder, diffOps } = req('../parity/recorder.cjs') as { makeRecorder(): Rec; diffOps(a: Op[], b: Op[], tol?: number): { i: number; a: Op | null; b: Op | null } | null };
type Op = unknown[]; interface Rec { screenCtx: Record<string, unknown>; take(): Op[] }
interface Legacy { eval(s: string): unknown; render(): Op[]; clock(ms: number): void }

const L = createLegacy({}), ev = (s: string): unknown => L.eval(s), J = <T>(s: string): T => JSON.parse(ev(`JSON.stringify(${s})`) as string) as T;
const copy = <T extends object>(dst: T[], src: T[]): void => { dst.length = 0; dst.push(...src); };
copy(TSTAR, J('TSTAR')); copy(UIDOTS, J('UIDOTS')); copy(HUBP, J('HUBP')); copy(TGAL, J('TGAL')); copy(TEMB, J('TEMB'));
ev('nP=2;nH=1;cpuLv=5;stI=2;itemsOn=true;TIMER=0;COMP=false;TEAMS=false;NERV=10;mapI=0'); // menu defaults (the oracle runner starts a 2-human match)
ev('Math.random=()=>0.5'); RND.r = () => 0.5; Math.random = () => 0.5;
const W = +ev('W')!, H = +ev('H')!;
/** legacy item catalog, read before any scenario trims it */
const LITEMS = J<{ k: string; name: string; c: string; d: string; ch: string }[]>('ITEMS.map(i=>({k:i.k,name:i.name,c:i.c,d:i.d,ch:i.ch||""}))');

function canon(a: Op[]): Op[] {
  const m = new Map<number, number>(), id = (v: number): number => { if (!m.has(v)) m.set(v, m.size); return m.get(v)!; };
  const fix = (v: unknown): unknown => typeof v === 'string' ? v.replace(/\d+\.\d{5,}/g, n => (+n).toFixed(4)) : v && typeof v === 'object' && !Array.isArray(v) && 'g' in v ? { ...v, g: id((v as { g: number }).g) } : v;
  return a.filter(o => typeof o[0] === 'string' && !(o[0] as string).startsWith('#')).map(o => {
    const r = o.map(fix), n = r[0] as string;
    if (/^create\w*Gradient$/.test(n)) r[r.length - 1] = id(r[r.length - 1] as number); else if (n === 'stop') r[1] = id(r[1] as number); // gradient ids are global counters
    return r;
  });
}
/** Ops inside the first marker block `name` (nested markers dropped) and the ctx state at its entry. */
function blockOf(st: Op[], name: string): Op[] { const i = st.findIndex(o => o[0] === '#' && o[1] === name); if (i < 0) return []; const out: Op[] = []; let d = 0; for (let j = i + 1; j < st.length; j++) { const o = st[j]!; if (o[0] === '#') d++; else if (o[0] === '#/') { if (!d--) break; } else out.push(o); } return out; }
const snapOf = (st: Op[], name: string): Record<string, unknown> => (st.find(o => o[0] === '#' && o[1] === name)?.[2] ?? {}) as Record<string, unknown>;
interface Sc { name: string; ms: number; legacy: string; port(): void; /** compare only this legacy draw function's block (fight overlays) */ block?: string; draw?(u: UiCtx): void }
const roster = [touhou].flatMap(p => Object.entries((p.content?.['character'] ?? {}) as Record<string, CharacterDef>).map(([k, d]) => ({ id: `${p.id}:${k}`, key: k, name: d.name, col: d.color, role: d.role ?? '', desc: d.desc ?? '', o: d.order }))).sort((a, b) => a.o - b.o);
const items = Object.entries(touhou.content!['item'] as Record<string, ItemDef>).map(([k, d]) => ({ k, name: d.name, c: d.color, d: d.desc ?? '', ch: d.ch ?? '', o: d.order })).sort((a, b) => a.o - b.o);
const SC: Sc[] = [
  { name: 'title-intro', ms: 1300, legacy: "mode='title';UITITLE.t0=1;UIT.key='title';UIT.t0=-9", port: () => { APP.mode = 'title'; TITLE.t0 = 1; UIT.key = 'title'; UIT.t0 = -9; } },
  { name: 'title', ms: 5000, legacy: "mode='title';UITITLE.t0=2;UITITLE.shk=0;UIT.key='title';UIT.t0=-9", port: () => { APP.mode = 'title'; TITLE.t0 = 2; TITLE.shk = 0; UIT.key = 'title'; UIT.t0 = -9; } },
  { name: 'title-shake', ms: 6000, legacy: "mode='title';UITITLE.t0=2;UITITLE.shk=1;UIT.key='title';UIT.t0=-9", port: () => { APP.mode = 'title'; TITLE.t0 = 2; TITLE.shk = 1; UIT.key = 'title'; UIT.t0 = -9; } },
  { name: 'title->menu-trans', ms: 7200, legacy: "mode='title';UITITLE.t0=2;UIT.key='menu';UIT.t0=7;UIT.lab='MENU'", port: () => { APP.mode = 'title'; TITLE.t0 = 2; UIT.key = 'menu'; UIT.t0 = 7; UIT.lab = 'MENU'; } },
  ...[0, 3, 6].map(sel => ({ name: `hub-${sel}`, ms: 9000, legacy: `mode='menu';UIHUB.sel=${sel};UIHUB.a={};UIHUB.desc='';UISUB.t0=8.2;UIT.key='menu';UIT.t0=-9`, port: () => { APP.mode = 'menu'; UIHUB.sel = sel; UIHUB.a = {}; UIHUB.desc = ''; UISUB.t0 = 8.2; UIT.key = 'menu'; UIT.t0 = -9; } })),
  { name: 'hub-enter', ms: 9100, legacy: "mode='menu';UIHUB.sel=0;UIHUB.a={};UIHUB.desc='';UISUB.t0=9;UIT.key='menu';UIT.t0=-9", port: () => { APP.mode = 'menu'; UIHUB.sel = 0; UIHUB.a = {}; UIHUB.desc = ''; UISUB.t0 = 9; UIT.key = 'menu'; UIT.t0 = -9; } },
  ...([['css-empty', ''], ['css-joined', 'S[0].dev="k0";S[0].ty=CH0+3'], ['css-ready', 'S[0].dev="k0";S[0].ty=CH0+3;S[0].rd=true;S[1].dev="k1";S[1].ty=CH0+6'], ['css-teams', 'CS2.tb=true;S[0].dev="k0";S[0].tm=2']] as const).map(([name, js]) => ({ name, ms: 20000,
    legacy: `mode='menu';cssOpen();CSA.t0=18;UIT.key='css';UIT.t0=-9;{const S=CS2.sl;${js}}`,
    port: () => { APP.mode = 'css'; cssOpen({ ...host, pads: [], go() {}, back() {} } as never, 0); CSA.t0 = 18; UIT.key = 'css'; UIT.t0 = -9; const S = CS2.sl; const CH0 = 0; void CH0; new Function('S', 'CH0', 'CS2', js)(S, 0, CS2); } })),
  // fight overlays: legacy game render, only the named block is compared
  ...[20, 60, 70, 100].map(f => ({ name: `intro-f${f}`, ms: 30000, block: 'drawIntro', legacy: `mode='game';winner=-1;paused=false;MINTRO.on=true;frame=${f}`, port() {}, draw: (u: UiCtx) => drawIntro(u, { f, winner: -1, winT: 0, teams: false, teamA: [], intro: true }) })),
  ...[3, 12, 30].map(t => ({ name: `gameend-t${t}`, ms: 30000, block: 'drawGameEnd', legacy: `mode='game';winner=1;winT=${t};paused=false;frame=500`, port() {}, draw: (u: UiCtx) => drawGameEnd(u, { f: 500, winner: 1, winT: t, teams: false, teamA: [], intro: true }) })),
  { name: 'pause', ms: 30000, block: 'drawPause', legacy: "mode='game';winner=-1;paused=true;UIP.t0=29.8;PZ.sel=1;PZ.cf=0;PZ.why='';frame=500", port() { PZ.t0 = 29.8; PZ.sel = 1; PZ.cf = 0; PZ.why = ''; }, draw: (u: UiCtx) => drawPause(u, ['RESUME', 'RESTART MATCH', 'SOUND…', 'QUIT TO MENU'].map(t => ({ t, f() {} }))) },
  ...[30, 60, 160].map(t => ({ name: `results-t${t}`, ms: 30000, block: 'drawResults',
    legacy: `mode='game';paused=false;winner=0;winT=${100 + t};RAW=null;RSC=[];TLG=[[300,300],[260,280],[240,180],[200,90]];frame=900;Object.assign(P[0],{kos:2,dmgDealt:150.4,dmgTk:40,parN:3,spN:1,bigHit:22,sd:0,outAt:0,stocks:1,hp:64,state:'idle'});Object.assign(P[1],{kos:0,dmgDealt:40,dmgTk:150.4,parN:5,spN:2,bigHit:9,sd:1,outAt:850,stocks:0,hp:0,state:'dead'})`,
    port() { resetResults(); },
    draw: (u: UiCtx) => { const P: ResP[] = [{ id: 0, cpu: false, key: 'reimu', col: '#ff3a4a', kos: 2, dmgDealt: 150.4, dmgTk: 40, parN: 3, spN: 1, bigHit: 22, sd: 0, outAt: 0, stocks: 1, hp: 64, dead: false }, { id: 1, cpu: false, key: 'marisa', col: roster[1]!.col, kos: 0, dmgDealt: 40, dmgTk: 150.4, parN: 5, spN: 2, bigHit: 9, sd: 1, outAt: 850, stocks: 0, hp: 0, dead: true }];
      drawResults(u, { t, winner: 0, teams: false, teamA: [], P, tlg: [[300, 300], [260, 280], [240, 180], [200, 90]], touch: false }, 900); } })),
  ...[0.1, 0.3, 0.5, 2.3, 4].map(d => ({ name: `laststock-${d}`, ms: 30000, block: 'drawLastStock', legacy: `mode='game';paused=false;winner=-1;LS.on=1;LS.t0=${30 - d};LS.p=1;P[1].stocks=1;lsCheck=()=>{}`,
    port() { LS.on = 1; LS.t0 = 30 - d; LS.p = 1; }, draw: (u: UiCtx) => drawLastStock(u, { f: 500, winner: -1, winT: 0, teams: false, teamA: [], intro: true }, [{ id: 0, stocks: 2, cpu: false }, { id: 1, stocks: 1, cpu: false }]) })),
  ...([['RULES', 'RULESL', 0], ['RULES', 'RULESL', 6], ['OPTIONS', 'OPTL', 2], ['OPTIONS', 'OPTL', 11], ['TEAMS', 'TEAMM', 1], ['SOUND', 'SOUNDM', 0]] as const).map(([title, lst, sel]) => ({ name: `sub-${title}-${sel}`, ms: 40000,
    legacy: `mode='menu';openSub('${title}',${lst});subSel=${sel};UISUB.vals={};UISUB.t0=39;UIT.key='sub:${title}';UIT.t0=-9`,
    port() { const mh = { open() {}, title() {}, controls() {}, guide() {}, tutorial() {}, fullscreen: () => false, toggleFullscreen() {}, soon() {} }; APP.mode = 'sub'; SUB.stack = []; SUB.title = title; SUB.sel = sel; SUB.vals = {}; UISUB.t0 = 39; UIT.key = 'sub:' + title; UIT.t0 = -9;
      SUB.rows = ({ RULESL: () => ruleRows(mh), OPTL: () => optionRows(mh), TEAMM: teamRows, SOUNDM: soundRows } as const)[lst]; } })),
  ...[0, 9].map(sel => ({ name: `items-${sel}`, ms: 41000,
    legacy: `mode='items';{const keep=new Set(${JSON.stringify(items.map(i => i.k))});for(let i=ITEMS.length-1;i>=0;i--)if(!keep.has(ITEMS[i].k))ITEMS.splice(i,1)}ITEMS.forEach(i=>itemOn[i.k]=true);itemOn.orange=false;itemSel=${sel};UIT.key='items';UIT.t0=-9;frame=7`,
    port() { APP.mode = 'items'; for (const i of items) SET.itemOn[i.k] = true; SET.itemOn['orange'] = false; IM.sel = sel; UIT.key = 'items'; UIT.t0 = -9; } })),
  ...([[0, 0, false], [5, 3, false], [10, 4, true]] as const).map(([row, col, wait]) => ({ name: `binds-${row}-${col}`, ms: 42000,
    legacy: `mode='binds';resetBinds();bind.row=${row};bind.col=${col};bind.wait=${wait};bind.combo=[];MOUSEON=false;UIT.key='binds';UIT.t0=-9`,
    port() { APP.mode = 'binds'; BIND.row = row; BIND.col = col; BIND.wait = wait; BIND.combo = []; SET.mouse = false; UIT.key = 'binds'; UIT.t0 = -9; } })),
  // the guide's item pages are built from the catalog: legacy has 131 items, so the port is fed the legacy catalog here
  ...[0, 3, 7, 12, 16, 37, 38, 39].map(p => ({ name: `guide-${p}`, ms: 43210, legacy: `mode='info';infoP=${p};infoScr=0;UIT.key='info';UIT.t0=-9;frame=33`, port() { APP.mode = 'info'; GUIDE.p = p; GUIDE.scr = 0; UIT.key = 'info'; UIT.t0 = -9; host.items = LITEMS; } })),
];
const want = process.argv.slice(2).filter(a => !a.startsWith('-'));
const host: UiHost = { items, sfx() {}, audioLocked: () => false, nowMs: () => 0, sb: 0, touch: false, music: false, open() {}, roster, keys: new Set<string>(), pads: () => [], frame: () => +ev('frame')!, start() {}, playground() {}, drawPlayground() {} };
let bad = 0;
for (const s of SC.filter(x => !want.length || want.some(w => x.name.startsWith(w)))) {
  L.clock(s.ms); ev(s.legacy); const raw = L.render();
  const lo = canon(s.block ? blockOf(raw, s.block) : raw);
  s.port(); const r = makeRecorder(); host.nowMs = () => s.ms;
  const u: UiCtx = { c: r.screenCtx as unknown as CanvasRenderingContext2D, W, H, now: s.ms / 1000, mx: 0, my: 0, fxLow: false, hot: [], acc: '#ff3355' };
  if (s.draw) { for (const [k, v] of Object.entries(snapOf(raw, s.block!))) r.screenCtx[k] = v; r.take(); s.draw(u); } else renderUi(u, host); const po = canon(r.take());
  // legacy clears its overlay canvas (OC) first: the port draws on one canvas
  let lo2 = !s.block && lo[0]?.[0] === 'clearRect' ? lo.slice(1) : lo;
  { const i = lo2.findIndex(o => o[0] === 'fillText' && o[1] === 'WebGL unavailable — 2D mode'); if (i >= 0) lo2 = [...lo2.slice(0, i - 4), ...lo2.slice(i + 2)]; } // legacy 2D-fallback notice: the port has no WebGL layer (deliberate, DESIGN §25)
  const d = diffOps(lo2, po, 1e-6);
  if (!d) console.log(`ok   ${s.name.padEnd(22)} ${lo2.length} ops identical`);
  else { bad++; console.log(`DIFF ${s.name.padEnd(22)} op ${d.i}/${lo2.length}: legacy ${JSON.stringify(d.a).slice(0, 140)} | port ${JSON.stringify(d.b).slice(0, 140)}`); if (process.env['UICTX']) console.log('  legacy ctx:', lo2.slice(Math.max(0, d.i - 6), d.i + 3).map(o => JSON.stringify(o).slice(0, 90)).join('\n  ')); }
}
console.log(bad ? `${bad} screen(s) differ` : 'all screens identical');
process.exitCode = bad ? 1 : 0;
