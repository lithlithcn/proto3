/* pnpm render compare [a,b] [frames=900] [seed=1] — visual/HUD/audio parity, the same way the oracle campaign checks the sim.
 * Plays a bot match on legacy + port, calls the legacy render() every frame (camera easing needs it), and at sample frames:
 *   - splits the legacy op stream into per-draw-function blocks (drawHUD, drawP, drawHeavy, drawItem, drawView...), each with the ctx state at entry;
 *   - re-draws the same thing with the PORT renderer from that state and diffs the op streams (identical / first differing op);
 *   - lists every legacy draw function with NO port counterpart (instance counts) and every legacy sfx() name never produced by the port (audio is not ported).
 * Honest by construction: "not ported" is reported as such, never as passing. Output feeds docs/parity-ledger.json `render-parity`. */
import { createRequire } from 'node:module';
import type { World } from '@kernel';
import type { CombatState } from '@pack/combat/api';
import { BF } from '@pack/combat/api';
import { drawBullet } from '@pack/render/actors';
import { drawPlayerL } from '@pack/render/ld/bind';
import { drawCard } from '@pack/render/cards';
import { HUDS, drawHudPanel } from '@pack/render/hud';
import { camOf, drawView, renderViews, viewsOf } from '@pack/render/view';
import { juiceOf, syncJuice } from '@pack/render/juice/state';
import { session } from '../parity/session';

const { makeRecorder, diffOps, isMarker } = createRequire(import.meta.url)('../parity/recorder.cjs') as { makeRecorder(): Rec; diffOps(a: Op[], b: Op[], tol?: number): { i: number; a: Op | null; b: Op | null; who: string } | null; isMarker(o: Op): boolean };
type Op = unknown[]; interface Rec { screenCtx: Record<string, unknown>; take(): Op[]; reset(): void }
interface Block { name: string; snap: Record<string, unknown>; ops: Op[] }

const arg = (i: number, d: string): string => process.argv[i] && !process.argv[i]!.startsWith('--') ? process.argv[i]! : d;
const [a, b] = arg(3, 'reimu,marisa').split(','), FR = +arg(4, '900'), SEED = +arg(5, '1'), STEP = 150;
const ss = session(a!, b!, SEED, []), k = ss.k, ev = (s: string): unknown => k.legacy.eval(s);
ev("globalThis.__SFX=[];globalThis.__SFL=[];{const s0=sfx;sfx=function(n,v,r){__SFX.push(n);const L=[...new Error().stack.matchAll(/legacy:(\\d+)/g)].map(m=>m[1]);__SFL.push(n+'@'+(L[1]||'?'));return s0.apply(this,arguments)}}");
const sink = makeRecorder(), W = k.world as World, S = k.s as CombatState;

/** Legacy stream -> blocks (nested blocks also appear on their own, their ops are included in every enclosing block). */
function blocks(stream: Op[]): Block[] {
  const out: Block[] = [], open: Block[] = [];
  for (const o of stream) {
    if (o[0] === '#') { const bl = { name: o[1] as string, snap: o[2] as Record<string, unknown>, ops: [] as Op[] }; out.push(bl); open.push(bl); }
    else if (o[0] === '#/') open.pop();
    else for (const bl of open) bl.ops.push(o);
  }
  return out;
}
/** Re-draws with the port from the legacy entry state; returns the ops. */
function portOps(snap: Record<string, unknown>, fn: (c: CanvasRenderingContext2D) => void): Op[] {
  const r = makeRecorder(); for (const [p, v] of Object.entries(snap)) r.screenCtx[p] = v; r.take(); fn(r.screenCtx as unknown as CanvasRenderingContext2D); return r.take();
}
/** Gradient ids are global counters (legacy and port differ): renumber by order of appearance inside one op list. */
function canon(a: Op[]): Op[] {
  const m = new Map<number, number>(), id = (v: number): number => { if (!m.has(v)) m.set(v, m.size); return m.get(v)!; };
  const fix = (v: unknown): unknown => typeof v === 'string' ? v.replace(/\d+\.\d{7,}/g, n => (+n).toFixed(6)) : v && typeof v === 'object' && !Array.isArray(v) && 'g' in v ? { ...v, g: id((v as { g: number }).g) } : v;
  return a.map(o => { const r = o.map(fix); if (typeof r[0] === 'string' && r[0].startsWith('create')) r[r.length - 1] = id(r[r.length - 1] as number); else if (r[0] === 'stop') r[1] = id(r[1] as number); return r; });
}
const fmt = (o: Op | null): string => o ? JSON.stringify(o).slice(0, 110) : '(none)';

const JV = ['shake', 'zk', 'kx', 'ky', 'chroma', 'bright', 'focusL', 'zblur', 'flashS', 'invF'] as const, JL = ['FX', 'TX', 'RINGS', 'WAVES', 'LINES', 'KOFX', 'BIG', 'CRACK', 'GZ'] as const;
const juiceBad = new Map<string, string>(); let juiceN = 0;
// legacy push sites: every list push records the html line that produced it (shown next to the first divergence)
const WRAP = `for (const n of ${JSON.stringify(['FX', 'TX', 'RINGS', 'WAVES', 'LINES', 'KOFX', 'BIG', 'CRACK', 'GZ'])}) { const a = eval(n); if (!a.__w) { a.__w = 1; a.push = function (...x) { const L = [...new Error().stack.matchAll(/legacy:(\\d+)/g)].map(m => m[1]).filter(x => !['210', '223', '326', '327', '328'].includes(x)), l = L.length ? [0, L[0]] : null; (globalThis.__JW ||= []).push(n + '@' + (l ? l[1] : '?')); return Array.prototype.push.apply(this, x); }; } }`;
function juiceCheck(f: number): void {
  const j = juiceOf(W), pev = j.q.filter(e => e.ev !== 'combat:fx-tick').map(e => e.ev.replace('combat:', '') + ((e as unknown as { op?: string }).op ? ':' + (e as unknown as { op: string }).op : '') + ((e as unknown as { p?: number }).p !== undefined ? '(' + (e as unknown as { p: number }).p + ')' : '')).join(' ') || '-'; let fxPush = 0; const op = j.FX.push; j.FX.push = (...x) => { fxPush += x.length; return op.apply(j.FX, x); }; syncJuice(j, S); j.FX.push = op; juiceN++;
  const L = ev('JSON.stringify([' + JV.join(',') + ',' + JL.map(n => n + '.length').join(',') + ',bgF.t,borderF.t])') as string, l = JSON.parse(L) as number[]; l[JV.length] = -1; // FX: pushes this frame (filled below), lifetimes are random
  const lfx = (JSON.parse(ev('JSON.stringify(globalThis.__JW||[])') as string) as string[]).filter(x => x.startsWith('FX@')).length;
  const P = [...JV.map(n => j[n]), ...JL.map(n => n === 'FX' ? fxPush : j[n].length), j.bgF.t, j.borderF.t], N = [...JV, ...JL.map(n => n === 'FX' ? 'FX pushes' : n + '.length'), 'bgF.t', 'borderF.t'];
  l[JV.length] = lfx;
  const sites = (ev('JSON.stringify(globalThis.__JW||[])') as string), sf = (ev('JSON.stringify(__SFL)') as string); ev('globalThis.__JW=[];__SFL=[]');
  N.forEach((n, i) => { const a = l[i]!, b = P[i] as number; if (Math.abs(a - b) > 1e-6 && !juiceBad.has(n)) juiceBad.set(n, `f${f}: legacy ${a} | port ${b}   legacy pushes this frame: ${[...new Set(JSON.parse(sites) as string[])].filter(x => x.startsWith(n.split(/[. ]/)[0]!)).join(' ') || '-'}   port events: ${pev}   sfx this frame: ${(JSON.parse(sf) as string[]).join(' ') || '-'}`); });
}
const tally = new Map<string, { ok: number; bad: number; first?: string }>(), unported = new Map<string, number>(), sfxSeen = new Map<string, number>();
const mark = (n: string, ok: boolean, why: string): void => { const t = tally.get(n) ?? { ok: 0, bad: 0 }; if (ok) t.ok++; else { t.bad++; t.first ??= why; } tally.set(n, t); };

for (let f = 1; f <= FR; f++) {
  ev(WRAP); ss.pre(f); const [i0, i1] = ss.inputs(f); k.step([() => i0, () => i1], f);
  const ops = k.legacy.render() as Op[];
  renderViews(sink.screenCtx as unknown as CanvasRenderingContext2D, W, S, +ev('W')!, +ev('H')!); sink.take(); // advances the port camera exactly like the browser does
  juiceCheck(f);
  const hudPre = f % STEP === 0 ? structuredClone([...HUDS]) : [];
  for (let n = 0; n < S.n; n++) drawHudPanel(sink.screenCtx as unknown as CanvasRenderingContext2D, W, S, n, 0, false, 0, 0, () => 0.5); sink.take(); // legacy HUDS animates every frame (harness clock VT = 0)
  if (f % STEP) continue;
  const bl = blocks(ops), WW = +ev('W')!, HH = +ev('H')!, hk = Math.min(1, WW / 1280 + 0.1), view = ev('JSON.stringify(MVIEW[0])') as string;
  void view;
  const cnt = new Map<string, number>(); const nth = (n: string): number => { const c = cnt.get(n) ?? 0; cnt.set(n, c + 1); return c; };
  // heavy bullets in legacy draw order: per view, the ones inside that view (camera + zoom of the port, which match the legacy ones)
  const heavies: number[] = [], jz = juiceOf(W).zk;
  for (const v of viewsOf(S, WW, HH)) { const sc = v.h / 600 * (v.q ? 1.2 : 1) * (1 + jz), cm = camOf(v.i), ww = v.w / sc, hh = v.h / sc, L = cm.x - ww / 2, Tp = cm.y - hh / 2;
    for (let i = 0; i < S.nb; i++) if (!(S.bflags[i]! & BF.dead) && (S.bflags[i]! & BF.heavy) && S.bx[i]! > L - 30 && S.bx[i]! < L + ww + 30 && S.by[i]! > Tp - 30 && S.by[i]! < Tp + hh + 30) heavies.push(i); }
  for (const x of bl) {
    const n = nth(x.name), want = x.ops.filter(o => !isMarker(o));
    let got: Op[] | null = null;
    if (x.name === 'drawHUD' && n < S.n) got = portOps(x.snap, c => { HUDS[n] = structuredClone(hudPre[n]!); drawHudPanel(c, W, S, n, (n % 2 ? WW - 12 : 12) / hk, n % 2 === 1, (n < 2 ? 30 : HH - 100) / hk, 0, () => 0.5); });
    else if (x.name === 'drawP' && n < S.n) got = portOps(x.snap, c => drawPlayerL(c, W, S, n, () => 0.5));
    else if (x.name === 'drawHeavy' && heavies[n] !== undefined) got = portOps(x.snap, c => drawBullet(c, S, heavies[n]!));
    else if (x.name === 'drawItem' && n < S.ncard) got = portOps(x.snap, c => drawCard(c, W, S, n));
    if (got) { if (x.name === 'drawHUD' || (x.name === 'drawP' && S.hitstop > 0)) { const t = (a: Op[]): Op[] => { const i = a.findIndex(o => o[0] === 'translate'); return a.filter((_, j) => j !== i); }; want.splice(0, want.length, ...t(want)); got = t(got); } /* HUD shake uses Math.random: not comparable */ const d = diffOps(canon(want), canon(got), 1e-6); mark(x.name, !d, d ? `f${f} #${n} op ${d.i}: legacy ${fmt(d.a)} | port ${fmt(d.b)}` : ''); }
    else if (x.name !== 'drawView' || n > 0) unported.set(x.name, (unported.get(x.name) ?? 0) + 1);
  }
  // drawView: floor/grid/edge prefix (everything the port draws before cards/bullets), one block per view
  const vs = viewsOf(S, WW, HH); let vi = 0;
  for (const dv of bl.filter(x => x.name === 'drawView')) { const v = vs[vi++]; if (!v) break; const got = portOps(dv.snap, c => drawView(c, W, v, 'arena')), want = dv.ops.filter(o => !isMarker(o)).slice(0, got.length), d = diffOps(canon(want), canon(got), 1e-6); mark('drawView(arena prefix)', !d, d ? `f${f} view ${vi - 1} op ${d.i}: legacy ${fmt(d.a)} | port ${fmt(d.b)}` : ''); }
}
for (const n of (ev('__SFX') as string[])) sfxSeen.set(n, (sfxSeen.get(n) ?? 0) + 1);

console.log(`RENDER COMPARE ${a}/${b} seed ${SEED}, ${FR} frames, samples every ${STEP}\n`);
console.log('| draw function | identical | differs | first difference |\n|---|---|---|---|');
for (const [n, t] of [...tally].sort()) console.log(`| ${n} | ${t.ok} | ${t.bad} | ${t.first ?? ''} |`);
console.log(`\nJUICE STATE (per frame, ${juiceN} frames; first divergence per variable): ${juiceBad.size ? '' : 'all identical'}`);
for (const [n, w] of juiceBad) console.log(`  ${n} ${w}`);
console.log(`\nNOT PORTED visual (legacy draw functions with no port counterpart, instances over the samples): ${[...unported].sort((x, y) => y[1] - x[1]).map(([n, c]) => `${n}x${c}`).join(' ') || 'none'}`);
console.log(`NOT PORTED audio (legacy sfx() names triggered; the port has no audio pack): ${[...sfxSeen].sort((x, y) => y[1] - x[1]).map(([n, c]) => `${n}x${c}`).join(' ') || 'none'}`);
console.log('NOT COMPARED: light bullets (legacy draws cached sprites; compare by pixels), everything legacy draws outside a named draw function (floor FX, post effects), animation timing between samples.');
