import type { InvariantDef } from '@kernel';
import { MAXP, MAX_B, MAX_ENT, PS, type CombatState } from './state';
import { T } from './tuning';
import { combatOf } from './api';

/** Self-checks of the combat state (DESIGN §26). Each message names array, index, value and the expectation, so a report points straight at the write that broke it. */
const NS = Math.max(...Object.values(PS));
const fin = (v: number): boolean => Number.isFinite(v);

function players(s: CombatState): string[] {
  const o: string[] = [], m = s.mapW, h = s.mapH;
  for (let p = 0; p < s.n; p++) {
    const st = s.state[p]!;
    if (st < 0 || st > NS) o.push(`state[${p}] = ${st}, expected 0..${NS}`);
    if (s.stocks[p]! < 0 || s.stocks[p]! > 99) o.push(`stocks[${p}] = ${s.stocks[p]}, expected 0..99`);
    if (s.spirit[p]! < -1e-9 || s.spirit[p]! > T.SPIRIT_MAX + 1e-9) o.push(`spirit[${p}] = ${s.spirit[p]}, expected 0..${T.SPIRIT_MAX}`);
    if (s.boost[p]! < -1e-9 || s.boost[p]! > T.DASH_CHARGES + 1e-9) o.push(`boost[${p}] = ${s.boost[p]}, expected 0..${T.DASH_CHARGES}`);
    if (s.hp[p]! > 1000) o.push(`hp[${p}] = ${s.hp[p]}, expected <= 1000`);
    if (!(s.x[p]! > -2000 && s.x[p]! < m + 2000 && s.y[p]! > -2000 && s.y[p]! < h + 2000)) o.push(`position[${p}] = (${s.x[p]}, ${s.y[p]}) far outside the ${m}x${h} map`);
    if (!(Math.abs(s.vx[p]!) < 200 && Math.abs(s.vy[p]!) < 200)) o.push(`velocity[${p}] = (${s.vx[p]}, ${s.vy[p]}), expected |v| < 200`);
    for (const [nm, a] of [['tgt', s.tgt], ['lastHit', s.lastHit], ['lastBy', s.lastBy]] as const) if (a[p]! < -1 || a[p]! >= s.n) o.push(`${nm}[${p}] = ${a[p]}, expected -1..${s.n - 1}`);
    if (s.tgt[p] === p) o.push(`tgt[${p}] targets itself`);
  }
  return o;
}
function bullets(s: CombatState): string[] {
  const o: string[] = [];
  if (s.nb < 0 || s.nb > MAX_B) return [`nb = ${s.nb}, expected 0..${MAX_B}`];
  for (let i = 0; i < s.nb; i++) {
    if (s.bowner[i]! < 0 || s.bowner[i]! >= s.n) o.push(`bowner[${i}] = ${s.bowner[i]}, expected 0..${s.n - 1}`);
    if (!(s.br[i]! > 0 && s.br[i]! < 400)) o.push(`br[${i}] = ${s.br[i]}, expected 0 < r < 400`);
    if (!(Math.abs(s.bvx[i]!) < 100 && Math.abs(s.bvy[i]!) < 100)) o.push(`bv[${i}] = (${s.bvx[i]}, ${s.bvy[i]}), expected |v| < 100`);
    if (!fin(s.bx[i]!) || !fin(s.by[i]!) || Math.abs(s.bx[i]!) > 1e5 || Math.abs(s.by[i]!) > 1e5) o.push(`bpos[${i}] = (${s.bx[i]}, ${s.by[i]}), expected finite and |p| < 1e5`);
    if (!(s.blife[i]! < 1e6)) o.push(`blife[${i}] = ${s.blife[i]}, expected < 1e6`);
    if (s.bkind[i]! < 0) o.push(`bkind[${i}] = ${s.bkind[i]}, expected >= 0`);
  }
  return o;
}
function entities(s: CombatState): string[] {
  const o: string[] = [];
  if (s.nent < 0 || s.nent > MAX_ENT) return [`nent = ${s.nent}, expected 0..${MAX_ENT}`];
  for (let i = 0; i < s.nent; i++) {
    if (s.eo[i]! < -1 || s.eo[i]! >= s.n) o.push(`eo[${i}] = ${s.eo[i]}, expected -1..${s.n - 1}`);
    if (s.ek[i]! < 0) o.push(`ek[${i}] = ${s.ek[i]}, expected >= 0`);
    if (!fin(s.ex[i]!) || !fin(s.ey[i]!)) o.push(`epos[${i}] = (${s.ex[i]}, ${s.ey[i]}), expected finite`);
  }
  return o;
}
export const invariants: InvariantDef[] = [
  { id: 'counts', covers: ['n'], check: w => { const s = combatOf(w); return s.n < 1 || s.n > MAXP ? `n = ${s.n}, expected 1..${MAXP}` : null; } },
  { id: 'players', covers: ['state', 'stocks', 'spirit', 'boost', 'hp', 'x', 'y', 'vx', 'vy', 'tgt', 'lastHit', 'lastBy'], check: w => players(combatOf(w)) },
  { id: 'bullets', covers: ['nb', 'bowner', 'br', 'bvx', 'bvy', 'bx', 'by', 'blife', 'bkind'], check: w => bullets(combatOf(w)) },
  { id: 'entities', covers: ['nent', 'eo', 'ek', 'ex', 'ey'], check: w => entities(combatOf(w)) },
];
