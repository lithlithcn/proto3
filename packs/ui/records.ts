import type { Row } from './screens/sub/draw';

/** Records per local player name (legacy STATS / RECL, line ~4195): matches, wins, KOs, damage, lives lost, minutes played, best parry chain,
 *  best combo, favourite item. Legacy saved them under `sf_stats`, the SAME key as the hub card counters (each overwrote the other); the port
 *  keeps them in `sf_records` and imports per-name entries found in an old `sf_stats` once (DESIGN §25 R120). */
export interface Rec { m: number; w: number; ko: number; dmg: number; dth: number; sec: number; pmax: number; cmax: number; it: Record<string, number> }
export const RECS: Record<string, Rec> = {};
const ST0 = (): Rec => ({ m: 0, w: 0, ko: 0, dmg: 0, dth: 0, sec: 0, pmax: 0, cmax: 0, it: {} });
type Store = Pick<Storage, 'getItem' | 'setItem'>;
export function loadRecords(s: Store): void {
  try {
    const r = s.getItem('sf_records'); if (r) { Object.assign(RECS, JSON.parse(r)); return; }
    const old = JSON.parse(s.getItem('sf_stats') ?? '{}') as Record<string, unknown>; for (const [k, v] of Object.entries(old)) if (v && typeof v === 'object' && 'it' in v) RECS[k] = { ...ST0(), ...(v as Rec) };
  } catch { /* corrupt: empty */ }
}
export const saveRecords = (s: Store): void => { try { s.setItem('sf_records', JSON.stringify(RECS)); } catch { /* quota */ } };
/** Per-match tracking (best parry chain / combo, items given). */
const STM = { done: true, f0: 0, pm: {} as Record<number, number>, cm: {} as Record<number, number> };
export function recStart(f0: number, training: boolean): void { STM.done = training; STM.f0 = f0; STM.pm = {}; STM.cm = {}; }
export function recItem(name: string, key: string): void { (RECS[name] ??= ST0()).it[key] = (RECS[name]!.it[key] ?? 0) + 1; }
export interface RecP { id: number; cpu: boolean; name: string; team: number; kos: number; dmg: number; stocks: number; pChain: number; comboN: number }
/** Once per sim frame; commits when the match has a winner. Returns true when it saved. */
export function recTick(P: RecP[], f: number, winner: number, teams: boolean, stocks0: number): boolean {
  for (const p of P) { if (p.pChain > (STM.pm[p.id] ?? 0)) STM.pm[p.id] = p.pChain; if (p.comboN > (STM.cm[p.id] ?? 0)) STM.cm[p.id] = p.comboN; }
  if (winner < 0 || STM.done) return false; STM.done = true; const sec = Math.round((f - STM.f0) / 60), wt = teams ? P[winner]!.team : winner;
  for (const p of P) { if (p.cpu) continue; const s = RECS[p.name] ??= ST0(); s.m++; if ((teams ? p.team : p.id) === wt) s.w++; s.ko += p.kos; s.dmg += Math.round(p.dmg); s.dth += Math.max(0, stocks0 - p.stocks); s.sec += sec; s.pmax = Math.max(s.pmax, STM.pm[p.id] ?? 0); s.cmax = Math.max(s.cmax, STM.cm[p.id] ?? 0); }
  return true;
}
export function recordRows(itemName: (k: string) => string | undefined): Row[] {
  const L = Object.entries(RECS).sort((a, b) => b[1].m - a[1].m); if (!L.length) return [{ t: () => 'No match played yet: your records will appear here.' }]; const R: Row[] = [];
  for (const [k, s] of L.slice(0, 6)) {
    const top = Object.entries(s.it).sort((a, b) => b[1] - a[1])[0], it = top && itemName(top[0]);
    R.push({ t: () => k + '  ·  ' + s.m + ' matches  ·  ' + s.w + ' wins (' + (s.m ? Math.round(100 * s.w / s.m) : 0) + '%)' }, { t: () => '   KO ' + s.ko + '  ·  damage ' + s.dmg + '  ·  lives lost ' + s.dth + '  ·  ' + Math.round(s.sec / 60) + ' min played' }, { t: () => '   best parry chain x' + s.pmax + '  ·  best combo ' + s.cmax + (it ? '  ·  favorite item: ' + it : '') });
  }
  return R;
}
