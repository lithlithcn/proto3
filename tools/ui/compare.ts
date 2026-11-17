/* pnpm ui [scenario...] — menu/screen parity: draws the same screen state with the legacy render() (headless, op recorder) and with the port UI,
 * then diffs the two op streams (canonicalised like `pnpm render compare`). Scenarios set the state on both sides and the clock (ms).
 * Cosmetic decorations generated with Math.random at load are copied legacy -> port; later Math.random draws are pinned to 0.5 on both sides. */
import { createRequire } from 'node:module';
import { RND, type UiCtx } from '@pack/ui/core';
import { APP, renderUi, type UiHost } from '@pack/ui/app';
import { TEMB, TGAL, TSTAR } from '@pack/ui/screens/title/bg';
import { TITLE } from '@pack/ui/screens/title/title';
import { UISUB, UIT } from '@pack/ui/trans';
import { UIDOTS } from '@pack/ui/bg';
import { HUBP } from '@pack/ui/screens/hub/deco';
import { UIHUB } from '@pack/ui/screens/hub/hub';
import { CS2, CSA, cssOpen } from '@pack/ui/screens/css/state';
import type { CharacterDef } from '@pack/combat/api';
import touhou from '@pack/touhou/pack';

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

function canon(a: Op[]): Op[] {
  const m = new Map<number, number>(), id = (v: number): number => { if (!m.has(v)) m.set(v, m.size); return m.get(v)!; };
  const fix = (v: unknown): unknown => typeof v === 'string' ? v.replace(/\d+\.\d{5,}/g, n => (+n).toFixed(4)) : v && typeof v === 'object' && !Array.isArray(v) && 'g' in v ? { ...v, g: id((v as { g: number }).g) } : v;
  return a.filter(o => typeof o[0] === 'string' && !(o[0] as string).startsWith('#')).map(o => {
    const r = o.map(fix), n = r[0] as string;
    if (/^create\w*Gradient$/.test(n)) r[r.length - 1] = id(r[r.length - 1] as number); else if (n === 'stop') r[1] = id(r[1] as number); // gradient ids are global counters
    return r;
  });
}
interface Sc { name: string; ms: number; legacy: string; port(): void }
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
];
const want = process.argv.slice(2).filter(a => !a.startsWith('-'));
const roster = [touhou].flatMap(p => Object.entries((p.content?.['character'] ?? {}) as Record<string, CharacterDef>).map(([k, d]) => ({ id: `${p.id}:${k}`, key: k, name: d.name, col: d.color, role: d.role ?? '', desc: d.desc ?? '', o: d.order }))).sort((a, b) => a.o - b.o);
const host: UiHost = { sfx() {}, audioLocked: () => false, nowMs: () => 0, sb: 0, touch: false, music: false, open() {}, roster, keys: new Set<string>(), pads: () => [], frame: () => +ev('frame')!, start() {}, playground() {}, drawPlayground() {} };
let bad = 0;
for (const s of SC.filter(x => !want.length || want.some(w => x.name.startsWith(w)))) {
  L.clock(s.ms); ev(s.legacy); const lo = canon(L.render());
  s.port(); const r = makeRecorder(); host.nowMs = () => s.ms;
  const u: UiCtx = { c: r.screenCtx as unknown as CanvasRenderingContext2D, W, H, now: s.ms / 1000, mx: 0, my: 0, fxLow: false, hot: [], acc: '#ff3355' };
  renderUi(u, host); const po = canon(r.take());
  // legacy clears its overlay canvas (OC) first: the port draws on one canvas
  let lo2 = lo[0]?.[0] === 'clearRect' ? lo.slice(1) : lo;
  { const i = lo2.findIndex(o => o[0] === 'fillText' && o[1] === 'WebGL unavailable — 2D mode'); if (i >= 0) lo2 = [...lo2.slice(0, i - 4), ...lo2.slice(i + 2)]; } // legacy 2D-fallback notice: the port has no WebGL layer (deliberate, DESIGN §25)
  const d = diffOps(lo2, po, 1e-6);
  if (!d) console.log(`ok   ${s.name.padEnd(22)} ${lo2.length} ops identical`);
  else { bad++; console.log(`DIFF ${s.name.padEnd(22)} op ${d.i}/${lo2.length}: legacy ${JSON.stringify(d.a).slice(0, 140)} | port ${JSON.stringify(d.b).slice(0, 140)}`); if (process.env['UICTX']) console.log('  legacy ctx:', lo2.slice(Math.max(0, d.i - 6), d.i + 3).map(o => JSON.stringify(o).slice(0, 90)).join('\n  ')); }
}
console.log(bad ? `${bad} screen(s) differ` : 'all screens identical');
process.exitCode = bad ? 1 : 0;
