/* pnpm rca <report.json>  — root-cause digest of one divergence in ~40 lines (replaces hand-written probes).
 * Re-plays the game and prints, for the failing frame: the differing variable, the PORT's last writers (system-level provenance from diagnose), the LEGACY's
 * writers of the same variable (setter hook + call stack: which legacy function changed it), the legacy functions called in the last frames (rare ones with args),
 * both players' active timers/items (clone, disguise, ...), the bullets/entities that exist on one side only, and ready-made hypotheses.
 * Test-side only (reads the frozen legacy through the harness). */
import { readFileSync } from 'node:fs';
import { session } from './session';
import { diagnose } from './diagnose';

interface Rep { plan?: string; a: string; b: string; seed: number; frame: number; items: string[]; gives: string[]; diffs: string[]; kind: string; diag?: { provenance?: { writes: string[]; births: string[] } } }
const NOISE = /^(sfx|txt|shake|spark|puff|fx|burst|stepFx|ring|flash|rnd|rand|lb|big|tgt|aud|play|snd|vib|haptic|popup|addFx|glow|trail)/i;

/** Installs, from `frame - win` on, a call logger on every global legacy function plus (optionally) a setter on the watched legacy property. */
function legacyPass(rep: Rep, win: number, watch: { kind: string; idx: number; prop: string; id?: number } | null): { calls: Map<number, Map<string, string[]>>; writes: string[]; id: number; ctx: string[]; only: string[]; counts: string[]; born: string } {
  const ss = session(rep.a, rep.b, rep.seed, rep.items, rep.plan), k = ss.k, calls = new Map<number, Map<string, string[]>>(), writes: string[] = [];
  const ev = (s: string): unknown => k.legacy.eval(s);
  ev(`globalThis.__T=${rep.frame};globalThis.__W=new WeakMap();globalThis.__nb=0;globalThis.__CL=[];globalThis.__WR=[]`);
  const tag = `for(const o of B)if(!__W.has(o))__W.set(o,++__nb);for(const o of ENT)if(!__W.has(o))__W.set(o,++__nb)`;
  let id = -1; const counts: string[] = [];
  for (let f = 1; f <= rep.frame; f++) {
    const g = ss.pre(f); void g; const [i0, i1] = ss.inputs(f);
    ev(tag); if (f === rep.frame) ev('globalThis.__N0=new Set(B)');
    if (f === rep.frame - win) ev(`(()=>{const NO=${NOISE.toString()};for(const n of Object.getOwnPropertyNames(globalThis)){let o;try{o=globalThis[n]}catch(e){continue}if(typeof o!=='function'||!/^[a-z]\\w*$/.test(n)||NO.test(n)||/^(eval|parse|is|escape|unescape|encode|decode|setTimeout|setInterval|clearTimeout|clearInterval|requestAnimationFrame|queueMicrotask|fetch|atob|btoa)/.test(n))continue;
      const w=({[n]:function(...a){const d=a.slice(0,5).map(x=>typeof x==='number'?+x.toFixed(2):x===P[0]?'P0':x===P[1]?'P1':typeof x==='string'?"'"+x.slice(0,12)+"'":Array.isArray(x)?'[]':x&&typeof x==='object'?(x.k??x.owner!==undefined?'B'+x.owner:'{}'):typeof x);__CL.push([frame,n,d.join(',')+(frame>=__T?' <'+new Error().stack.split('\\n').slice(2,5).map(s=>s.trim().split(' ')[1]).filter(x=>x&&x!==n).slice(0,2).join('<'):'')]);return o.apply(this,a)}})[n];try{globalThis[n]=w}catch(e){}}})()`);
    if (watch && id >= 0 && f >= rep.frame - win) ev(`(()=>{const o=${watch.kind === 'P' ? `P[${watch.idx}]` : `(${watch.kind === 'B' ? 'B' : 'ENT'}.find(x=>__W.get(x)===${id}))`};if(!o||o.__hk)return;o.__hk=1;let h=o.${watch.prop};Object.defineProperty(o,'${watch.prop}',{get(){return h},set(v){if(v!==h)__WR.push('f'+frame+' ${watch.prop} '+(typeof h==='number'?+h.toFixed(4):h)+' -> '+(typeof v==='number'?+v.toFixed(4):v)+'  by '+new Error().stack.split('\\n').slice(2,16).map(s=>s.trim().split(' ')[1]).filter(Boolean).filter((x,i,a)=>x!==a[i-1]).slice(0,7).join(' < '));h=v},configurable:true})})()`);
    k.step([() => i0, () => i1], f);
    if (f >= rep.frame - 2) counts.push(`f${f}: bullets port ${k.s.nb - (() => { let d = 0; for (let i = 0; i < k.s.nb; i++) if (k.s.bflags[i]! & 2) d++; return d; })()} legacy ${ev('B.length')}, entities port ${k.s.nent} legacy ${ev('ENT.length')}`);
    if (watch && f === rep.frame - 1 && watch.id !== undefined) id = watch.id;
  }
  if (watch && watch.kind !== 'P' && watch.id === undefined) id = +String(ev(`__W.get((${watch.kind === 'B' ? 'B' : 'ENT'})[${watch.idx}])||-1`));
  const cl = JSON.parse(String(ev('JSON.stringify(__CL)'))) as [number, string, string][];
  for (const [f, n, a] of cl) { const m = calls.get(f) ?? new Map<string, string[]>(); m.set(n, [...(m.get(n) ?? []), a]); calls.set(f, m); }
  writes.push(...(JSON.parse(String(ev('JSON.stringify(__WR)'))) as string[]));
  // context: numeric timers still running on each legacy player (clone, disguise, ...), and one-sided bullets/entities
  const ctx = [0, 1].map(i => String(ev(`(()=>{const p=P[${i}];return 'P${i} '+p.shotT+' '+p.state+' timers: '+Object.entries(p).filter(([k,v])=>Number.isInteger(v)&&v>frame&&v<frame+5000&&!/^(t|inv|cd)$/.test(k)).map(([k,v])=>k+'+'+(v-frame)).join(' ')})()`)));
  const s = k.s, L = JSON.parse(String(ev('JSON.stringify(B.map(b=>[b.owner,Math.round(b.x),Math.round(b.y),b.r]))'))) as number[][], pk = new Map<string, number>(), lk = new Map<string, number>(), only: string[] = [], inc = (m: Map<string, number>, x: string): void => { m.set(x, (m.get(x) ?? 0) + 1); };
  for (let i = 0; i < s.nb; i++) if (!(s.bflags[i]! & 2)) inc(pk, [s.bowner[i], Math.round(s.bx[i]!), Math.round(s.by[i]!), s.br[i]].join());
  for (const b of L) inc(lk, b.join());
  const ex = (a: Map<string, number>, b: Map<string, number>): string[] => [...a].filter(([x, n]) => n > (b.get(x) ?? 0)).map(([x, n]) => `${x}${n - (b.get(x) ?? 0) > 1 ? 'x' + (n - (b.get(x) ?? 0)) : ''}`), po = ex(pk, lk), lo = ex(lk, pk);
  only.push(`bullets (owner,x,y,r): only-port ${po.slice(0, 6).join(' | ') || '-'} ; only-legacy ${lo.slice(0, 6).join(' | ') || '-'}`);
  const E = JSON.parse(String(ev('JSON.stringify(ENT.map(e=>[e.k,e.o,Math.round(e.x),Math.round(e.y),e.t]))'))) as (string | number)[][];
  only.push(`entities: port ${s.nent} legacy ${E.length}: legacy ${E.slice(0, 8).map(e => e.join('/')).join(' ')}`);
  const born = String(ev('JSON.stringify(B.filter(b=>!__N0.has(b)).map(b=>[b.owner,+b.x.toFixed(1),+b.y.toFixed(1),+b.vx.toFixed(2),+b.vy.toFixed(2),b.r,b.life]))'));
  return { calls, writes, id, ctx, only, counts, born };
}

export function why(file: string): string {
  const rep = JSON.parse(readFileSync(file, 'utf8')) as Rep, first = rep.diffs[0] ?? '', out: string[] = [];
  const wm = /(?:^|\s)([PBE])(\d+)\.(\w+)/.exec(first), watch = wm ? { kind: wm[1]!, idx: +wm[2]!, prop: wm[3]! } : null;
  out.push(`WHY ${rep.a}/${rep.b} seed ${rep.seed} f${rep.frame} items:${rep.items.length ? 'on' : 'off'}  gives: ${rep.gives.join(' ') || '-'}`, `DIFF ${first.trim()}`);
  const d = rep.diag ?? diagnose(rep.a, rep.b, rep.seed, rep.frame, first, rep.items, undefined, 30, rep.plan);
  const pr = d.provenance; if (pr?.writes.length) out.push('PORT writes: ' + pr.writes.slice(-4).join(' ; ')); else out.push('PORT writes: (not an element-level diff)');
  const pb = (pr?.births ?? []).filter(x => x.startsWith(`f${rep.frame} `)), pbo = pb.map(x => /owner (\d+)/.exec(x)?.[1] ?? '?').reduce((m, o) => (m[o] = (m[o] ?? 0) + 1, m), {} as Record<string, number>);
  const prm = (pr?.births ?? []).filter(x => x.startsWith(`f${rep.frame} `) && /removed/.test(x)).map(x => x.slice(0, 220)); if (prm.length) out.push(`PORT removed f${rep.frame}: ` + prm.join(' ; '));
  out.push(`PORT spawned f${rep.frame}: ${pb.length} (by owner ${JSON.stringify(pbo)}): ` + pb.slice(0, 8).map(x => (/at \(([\d.,-]+)\) v \(([\d.,-]+)\)/.exec(x) ?? []).slice(1).join(' v ')).join(' ; '));
  const pass1 = legacyPass(rep, 3, watch ? { ...watch, kind: watch.kind } : null), pass2 = watch && watch.kind !== 'P' && pass1.id > 0 ? legacyPass(rep, 3, { ...watch, id: pass1.id }) : pass1;
  out.push('LEGACY writes: ' + (pass2.writes.slice(-5).join('\n    ') || (watch ? '(none seen in the last 3 frames: the value was set earlier or by object creation)' : '-')));
  for (const f of [rep.frame - 1, rep.frame]) { const m = pass1.calls.get(f); if (!m) continue; const prev = [pass1.calls.get(f - 1), pass1.calls.get(f - 2)], fresh = [...m].filter(([n]) => !prev.some(p => p?.has(n))).map(([n, a]) => `${n}(${a[0]})${a.length > 1 ? 'x' + a.length : ''}`).slice(0, 14); out.push(`LEGACY calls f${f}: ${[...m].reduce((s, [, a]) => s + a.length, 0)} total, addB x${m.get('addB')?.length ?? 0} (by owner ${JSON.stringify((m.get('addB') ?? []).reduce((o, a) => { const ow = /^(P\d)/.exec(a)?.[1] ?? '?'; o[ow] = (o[ow] ?? 0) + 1; return o; }, {} as Record<string, number>))}); new vs previous 2 frames: ${fresh.join(' ') || '-'}`); }
  out.push(`LEGACY born f${rep.frame} (owner,x,y,vx,vy,r,life): ${pass1.born}`);
  out.push('COUNTS ' + pass1.counts.join(' | '), ...pass1.ctx, ...pass1.only);
  const cloned = rep.gives.some(g => /clone/.test(g)); if (cloned) out.push('HINT clone given: the legacy stand-in (cloneOf) lacks player fields -> `pnpm spec standin`, then check that character\'s shot/heavy handles `clone`.');
  if (/count/.test(first)) out.push('HINT spawn/despawn mismatch: compare "only-port / only-legacy" above with PORT births and LEGACY rare calls.');
  return out.join('\n');
}
if (process.argv[2]) console.log(why(process.argv[2])); // CLI only (imported by nothing)
