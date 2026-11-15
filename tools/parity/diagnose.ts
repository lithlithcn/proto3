/* Surgical diagnosis of one divergence: re-runs the game deterministically and records, for the last frames before it, every drifting variable (1e-12),
 * both players' state/move, the port's events, the first mismatching bullet/entity with its owner + owner's move, and a classification. Test-side only. */
import type { makePair } from '../../tests/parity/harness';
import { session } from './session';
import { PS } from '../../packs/combat/state';

const SN = Object.fromEntries(Object.entries(PS).map(([k, v]) => [v, k])) as Record<number, string>;
const r4 = (v: number): number => Math.round(v * 1e4) / 1e4;
type K = ReturnType<typeof makePair>;
interface LB { x: number; y: number; vx: number; vy: number; r: number; owner: number; heavy?: number; life: number }

const players = (k: K, chars: string[]): object[] => {
  const o = k.legacy.obs();
  return o.P.map((lp, i) => ({
    p: i, char: chars[i], move: String(k.legacy.eval(`P[${i}].mvName||''`)),
    port: { st: SN[k.s.state[i]!], t: k.s.t[i], x: r4(k.s.x[i]!), y: r4(k.s.y[i]!), vx: r4(k.s.vx[i]!), vy: r4(k.s.vy[i]!), hp: r4(k.s.hp[i]!), sp: r4(k.s.spirit[i]!), pw: r4(k.s.power[i]!), inv: k.s.inv[i] },
    legacy: { st: lp.state, t: lp.t, x: r4(lp.x), y: r4(lp.y), vx: r4(lp.vx), vy: r4(lp.vy), hp: r4(lp.hp), sp: r4(lp.spirit), pw: r4(lp.power), inv: lp.inv },
  }));
};
const bullet = (k: K, i: number, chars: string[], lb: LB | undefined): object => ({
  i, port: i < k.s.nb ? { x: r4(k.s.bx[i]!), y: r4(k.s.by[i]!), vx: r4(k.s.bvx[i]!), vy: r4(k.s.bvy[i]!), r: k.s.br[i], own: chars[k.s.bowner[i]!], life: k.s.blife[i], heavy: (k.s.bflags[i]! & 1) as number, kind: k.s.bkind[i], age: k.s.bag[i], mv: k.s.bmv[i] } : null,
  legacy: lb ? { x: r4(lb.x), y: r4(lb.y), vx: r4(lb.vx), vy: r4(lb.vy), r: lb.r, own: chars[lb.owner], life: lb.life, heavy: lb.heavy ?? 0 } : null,
});

/** Index of the first bullet that differs in anything but tiny float noise (index order is the same in both sims). */
function firstBadBullet(k: K): number {
  const lb = k.legacy.obs().B as LB[], n = Math.max(lb.length, k.s.nb);
  for (let i = 0; i < n; i++) { const l = lb[i]; if (!l || i >= k.s.nb) return i; if (Math.abs(k.s.bx[i]! - l.x) > 1e-6 || Math.abs(k.s.by[i]! - l.y) > 1e-6 || Math.abs(k.s.br[i]! - l.r) > 1e-6 || k.s.bowner[i] !== l.owner || Math.abs(k.s.blife[i]! - l.life) > 1e-6) return i; }
  return -1;
}
const kindCounts = (ks: number[]): Record<number, number> => { const m: Record<number, number> = {}; for (const x of ks) m[x] = (m[x] ?? 0) + 1; return m; };

export interface Diagnosis { cls: string; suspect: string; onset: string; trace: object[]; at: object }

export function diagnose(a: string, b: string, seed: number, frame: number, firstDiff: string, items: string[] = [], window = 12): Diagnosis {
  const chars = [a, b], ss = session(a, b, seed, items), k = ss.k, ev: string[] = [], trace: object[] = [];
  const w0 = k.world as unknown as { emit: (t: string, p: unknown) => unknown }, e0 = w0.emit.bind(w0); w0.emit = (t: string, p: unknown) => { ev.push(t + ' ' + JSON.stringify(p).slice(0, 90)); return e0(t, p); };
  let drift0 = '', driftVar = '';
  for (let f = 1; f <= frame; f++) {
    ev.length = 0; const g = ss.pre(f); if (g) ev.push('GIVE ' + g); const [i0, i1] = ss.inputs(f); k.step([() => i0, () => i1], f);
    const d = k.diffs('', 1e-9, 5);
    if (d.length && !drift0) { drift0 = `f${f}`; driftVar = d[0]!.trim(); }
    if (f > frame - window) trace.push({ f, drift: d.map(x => x.trim().slice(0, 100)), events: ev.slice(0, 8), players: players(k, chars) });
  }
  const bad = firstBadBullet(k), lbs = k.legacy.obs().B as LB[], pl = k.legacy.obs().P;
  const at: Record<string, unknown> = { diffsAtFrame: k.diffs('', 1e-6, 12).map(x => x.trim()) };
  if (bad >= 0) { at['firstBadBullet'] = bad; at['bullets'] = [bad - 1, bad, bad + 1, bad + 2].filter(i => i >= 0).map(i => bullet(k, i, chars, lbs[i])); const o = (k.s.bowner[bad] ?? lbs[bad]?.owner) as number | undefined; if (o !== undefined) at['ownerMove'] = `${chars[o]}:${String(k.legacy.eval(`P[${o}].mvName||''`))} state ${pl[o]?.state}`; }
  const lk = kindCounts(k.legacy.obs().E.map(e => e.k)), pk = kindCounts(Array.from({ length: k.s.nent }, (_, i) => k.s.ek[i]!));
  at['entityKinds'] = { port: pk, legacy: lk };
  // suspect = the character that owns the first differing thing
  const m = /(?:^|\s)([PBEC])(\d+)\./.exec(firstDiff); let suspect = '?';
  if (m) { const i = +m[2]!; suspect = m[1] === 'P' ? chars[i]! : m[1] === 'B' ? (chars[(k.s.bowner[i] ?? lbs[i]?.owner) as number] ?? '?') : m[1] === 'E' ? (chars[k.s.eo[i] ?? 0] ?? '?') : '?'; }
  else if (/bullet count/.test(firstDiff) && bad >= 0) suspect = chars[(k.s.bowner[bad] ?? lbs[bad]?.owner) as number] ?? '?';
  const nums = [...firstDiff.matchAll(/proto3=(-?[\d.e+-]+) legacy=(-?[\d.e+-]+)/g)].map(x => Math.abs(+x[1]! - +x[2]!));
  const cls = /count/.test(firstDiff) ? 'spawn/despawn mismatch' : nums.length && Math.max(...nums) < 1e-9 ? 'float-noise (ulp flip? R97/R109 family)' : /state|stocks|kind/.test(firstDiff) ? 'state-machine mismatch' : drift0 && drift0 !== `f${frame}` ? 'gradual drift (formula/order slightly off)' : 'sudden jump (missing or extra effect)';
  return { cls, suspect, onset: drift0 ? `${drift0} ${driftVar}` : 'none before failing frame', trace, at };
}
