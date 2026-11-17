import type { RosterEntry } from '../../core';
import { SET } from '../../settings';
import { devIn, devList, type DevIn, type Keys } from '../../input/devices';
import { BINDS } from '../../input/binds';

/** Character select state + per-frame device handling (legacy CS2/cssOpen/cssTick/cssGo/cssTapTile, line ~4818). Every keyboard / pad joins
 *  on Attack, picks with the stick, readies with Attack, tries the fighter in a live arena behind the menu with Parry (playground). */
export interface Slot { dev: string | null; ty: number; rd: boolean; pg: boolean; tm: number }
export const CS2 = { sl: [] as Slot[], pv: {} as Record<string, DevIn>, on: false, key: '', nP0: 2, map0: 0, tb: false };
export const CSA = { t0: 0, tile: {} as Record<number, number>, rdT: {} as Record<number, number>, pk: { ty: -1, t: 0 }, card: {} as Record<number, number> };
/** Last picks (legacy SELTY): the next opening starts on them. */
export let SELTY: number[] | null = null;
export interface CssHost {
  roster: RosterEntry[]; keys: Keys; pads: Gamepad[]; touch: boolean; sfx(n: string, v?: number, r?: number): void;
  /** start the match: device per human slot (in slot order) + character per fighter (humans first, then CPUs = -1 = keep default) */ go(devs: string[], chars: number[]): void;
  back(): void; /** live arena behind the menu with these slots (empty = stop) */ playground(devs: string[], chars: number[]): void;
}
export function cssOpen(h: CssHost, now: number): void {
  const N = h.roster.length;
  CS2.sl = [0, 1, 2, 3, 4, 5, 6, 7].map(i => ({ dev: null, ty: SELTY && SELTY[i]! >= 0 ? SELTY[i]! : i % N, rd: false, pg: false, tm: SET.teams && SET.teamA[i] != null ? SET.teamA[i]! : i % 2 }));
  CS2.pv = {}; CS2.on = false; CS2.key = ''; CS2.nP0 = SET.nP; CS2.map0 = SET.mapI; CS2.tb = SET.teams;
  for (const d of devList(h.pads)) CS2.pv[d] = cssIn(d, h);
  CSA.t0 = now; CSA.rdT = {}; CSA.pk = { ty: -1, t: 0 }; h.sfx('ok00');
}
/** Menu reading with Parry apart (legacy cssIn): on keyboards Parry = try it, Back = Esc / Backspace (keyboard 1 only). */
function cssIn(d: string, h: CssHost): DevIn {
  const I = devIn(d, h.keys, h.pads);
  if (d[0] === 'k') { const m = BINDS.KB[+d[1]!]!; I.p = h.keys.has(m.parry); I.b = d === 'k0' && (h.keys.has('Escape') || h.keys.has('Backspace')); }
  else { const g = h.pads[+d.slice(1)]; if (g) { const M = BINDS.PAD[+d.slice(1)] ?? BINDS.PAD[0]!; I.p = ([] as number[]).concat(M.parry ?? []).every(n => !!g.buttons[n]?.pressed); } }
  return I;
}
/** One menu frame of device input. Returns false when the screen was left. */
export function cssTick(h: CssHost, now: number): boolean {
  const S = CS2.sl, N = h.roster.length, C = 4;
  for (const d of devList(h.pads)) {
    const I = cssIn(d, h), p = CS2.pv[d] ?? { x: 0, y: 0, a: false, b: false, s: false }, e = (k: 'a' | 'b' | 's' | 'p' | 't'): boolean => !!I[k] && !p[k]; CS2.pv[d] = I;
    const i = S.findIndex(s => s.dev === d);
    if (i >= 0 && CS2.tb && e('t')) { S[i]!.tm = (S[i]!.tm + 1) % 4; h.sfx('se_select00', 0.7); }
    if (i < 0) {
      if (d[0] === 'p' && e('s') && !S.some(s => s.dev && !s.rd)) { cssGo(h); return false; }
      if (e('a')) { const n = S.findIndex(s => !s.dev); if (n >= 0) { S[n]!.dev = d; S[n]!.rd = false; S[n]!.pg = false; h.sfx('joined', 0.7); } }
      else if (e('b') && !S.some(s => s.dev)) { h.sfx('cancel00'); h.back(); return false; }
      continue;
    }
    const s = S[i]!;
    if (s.pg) { if (e('s') || e('b')) { s.pg = false; h.sfx('cancel00'); } continue; } // in the playground: Start = back to the select
    if (!s.rd) {
      const j = s.ty; let k = j; if (I.x && I.x !== p.x) k = (j + (I.x > 0 ? 1 : N - 1)) % N; if (I.y && I.y !== p.y) k = (j + (I.y > 0 ? C : N - C)) % N;
      if (k !== j) { s.ty = k; h.sfx('se_select00', 0.5); }
      if (e('a')) { s.rd = true; h.sfx('ok00'); } if (e('b')) { s.dev = null; h.sfx('cancel00'); }
    } else if (e('p')) { s.pg = true; h.sfx('joined', 0.8); }
    else if (e('b')) { s.rd = false; h.sfx('cancel00'); }
    else if (e('s') || e('a') && d === 'k0' && h.keys.has('Enter')) { const J = S.filter(q => q.dev); if (J.every(q => q.rd)) { cssGo(h); return false; } }
  }
  // playground: the line-up changed -> restart the small match behind
  const G = S.map((s, i) => s.dev && s.pg ? i : -1).filter(i => i >= 0), key = G.map(i => i + ':' + S[i]!.ty).join(',');
  if (key !== CS2.key) { CS2.key = key; h.playground(G.map(i => S[i]!.dev!), G.map(i => S[i]!.ty)); CS2.on = G.length > 0; }
  void now; return true;
}
export function cssGo(h: CssHost): void {
  const S = CS2.sl, J = S.filter(s => s.dev); CS2.on = false;
  SET.teams = CS2.tb; if (SET.teams) { const O = [...J, ...S.filter(s => !s.dev)]; O.forEach((s, k) => { SET.teamA[k] = s.tm; }); if (new Set(O.slice(0, Math.max(CS2.nP0, J.length)).map(s => s.tm)).size < 2) SET.teams = false; }
  SET.nH = J.length; SET.nP = Math.max(CS2.nP0, SET.nH); SET.mapI = CS2.map0;
  SELTY = [...J.map(s => s.ty), ...S.filter(s => !s.dev).map(() => -1)];
  h.sfx('title', 1); h.go(J.map(s => s.dev!), SELTY.slice(0, SET.nP));
}
/** Touch / mouse: the pointer drives keyboard 1 (tap = join, tap again = ready). */
export function cssTapTile(h: CssHost, ty: number, now: number): void {
  const S = CS2.sl; let s = S.find(q => q.dev === 'k0');
  if (!s) { s = S.find(q => !q.dev); if (!s) return; s.dev = 'k0'; s.rd = false; s.pg = false; s.ty = ty; h.sfx('joined', 0.7); return; }
  if (s.pg) return;
  if (s.ty === ty && !s.rd) { s.rd = true; h.sfx('ok00'); CSA.rdT[S.indexOf(s)] = now; } else { s.ty = ty; s.rd = false; h.sfx('se_select00', 0.6); }
}
