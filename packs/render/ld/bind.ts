import { MAX_FX, MAXP, MAX_ENT, PS, MV_NAMES, moveOf, bodyR, coreR, charOf, statusPool, BF, type CombatState } from '@pack/combat/api';
import type { World } from '@kernel';
import { COLS } from '../colors';
import { bindChars, CHDRAW } from './chars';
import { bindLayers } from './layers';

/** Presentation view-model: legacy draw code reads `q.x`, `q.fx.koishi`, `P[i]`, `ENT`… — this maps those names onto the SoA state (per-character aliases: legacy `ch*` fields live under each character's own names). */
const PSN: string[] = []; for (const [k, v] of Object.entries(PS)) PSN[v] = k;
const ALIAS: Record<string, Record<string, string>> = { hecatia: { chM: 'hM' }, okina: { chM: 'oS' }, nue: { chS: 'nS' } };
const EKN: Record<number, string> = { 1: 'ryy', 2: 'rbar' };

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
      case 'nOrig': return th.nOr?.[p] ? th.nOc![p] : undefined;
      case 'stocks': return s.stocks[p]; case 'charging': return !!s.charging[p]; case 'focus': return !!s.focus[p]; case 'giant': return s.giant[p];
    }
    const a = ALIAS[key()]?.[k] ?? k, t = th[a], c = (s as unknown as Record<string, ArrayLike<number>>)[a];
    const arr = t ?? (c && typeof c === 'object' && c.length === MAXP ? c : undefined);
    return arr ? arr[p] : undefined;
  } });
}

/** Everything the copied legacy drawing code touches, rebuilt per frame (cheap: <= 8 players, lazy bullet/entity views). */
export function bindLegacy(c: CanvasRenderingContext2D, e: Env): void {
  const { w, s } = e, P = Array.from({ length: s.n }, (_, i) => makeQ(e, i)), cache: { B?: unknown[]; ENT?: unknown[] } = {};
  const v = {
    ctx: c, frame: s.gf, P, rnd: e.rnd, hitstop: s.hitstop, CX: {} as Record<string, unknown>, bodyR: (q: { id: number }) => bodyR(s, q.id), coreR: (q: { id: number }) => coreR(s, q.id),
    get B() { return cache.B ??= Array.from({ length: s.nb }, (_, i) => ({ x: s.bx[i], y: s.by[i], dead: !!(s.bflags[i]! & BF.dead), heavy: !!(s.bflags[i]! & BF.heavy), owner: s.bowner[i] })); },
    get ENT() { return cache.ENT ??= Array.from({ length: Math.min(s.nent, MAX_ENT) }, (_, i) => ({ k: EKN[s.ek[i]!], o: s.eo[i], t: s.et[i], x: s.ex[i], y: s.ey[i] })); },
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
