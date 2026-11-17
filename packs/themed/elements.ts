import type { World } from '@kernel';
import { BF, BT, CARD_ULT, MAX_FX, PS, type CombatState, itemPool, spRand } from '@pack/combat/api';
import type { ThemedState } from './state';

/** Elements (legacy ITEMEL / auraOf / xAura / chPre5, lines 1759-1832). A player holding an active item of an element tags his bullets with it;
 *  a bullet or an attack landing leaves its element as an aura (4 s); bullets of two different elements meeting are scanned on a grid every 2 frames.
 *  Reactions (RX: STEAM, MELT, …) are NOT ported yet (ledger:elements-reactions; the oracle runs legacy with RX emptied), so a meeting only spends
 *  the rng draw legacy spends, and an aura never reacts. Burn / wet / frozen / poison auras arrive with their items. */
const G: Record<number, string> = {
  1: 'mokou okuu orin elixir yuiman flandre orange clown patchouli',
  2: 'nitori minamitsu wakasagi kogasa urumi yachie',
  3: 'freeze letty',
  4: 'tojiko raiko',
  5: 'kanako camera momiji kyouko toyohime saki lunasa merlin lyrica layla yatsuhashi kutaka satono sanae ran chen youmu',
  6: 'eika mayumi keiki suwako yuugi oni ariya ubame nareko enoko momoyo nemuno aunn narumi biten bumpers sekibanki',
  7: 'takane lily shizuha minoriko saigyou wriggle medicine yamame larva mai chimi daiyousei green mamizou ringo tewi blue',
  8: 'rumia remilia hina yuyuko koishi satori parsee seija hecatia zanmu hisami chiyari tsukasa kagerou mystia rin koakuma gap yukari nue doremy komachi purple mirror',
  9: 'reimu spark junko shou byakuren miko eiki keine kaguya eirin reisen sagume seiran nina misumaru megumu chimata mike world clone ichirin rainbow',
};
export const ITEMEL: Record<string, number> = {}; for (const e in G) for (const k of G[e]!.split(' ')) ITEMEL[k] = +e;
const KEL = new WeakMap<World, number[]>();
/** Element of each item pool index (legacy ITEMEL[p.lastIt]). */
const kindEl = (w: World): number[] => { let l = KEL.get(w); if (!l) { const ids = w.registry.list<object>('item'); l = itemPool(w).map(d => ITEMEL[ids.find(e => e[1] === d)![0].split(':').pop()!] ?? 0); KEL.set(w, l); } return l; };
const auraOf = (s: CombatState, T: ThemedState, t: number): number => T.auraT[t]! > s.gf ? T.auraEl[t]! : 0;
/** Legacy xAura: element `e` lands on `t` (a second element would react: not ported). */
export function xAura(s: CombatState, T: ThemedState, t: number, e: number): void { if (!e) return; void auraOf(s, T, t); T.auraEl[t] = e; T.auraT[t] = s.gf + 240; }
/** Element of a bullet the first time the scan sees it (legacy `b.el===undefined` branch). */
function bulletEl(s: CombatState, T: ThemedState, i: number): number {
  const g = s.btag[i]!;
  return g & BT.water ? 2 : g & BT.flower ? 7 : g & (BT.yy | BT.pure | BT.star) ? 9 : (s.bflags[i]! & BF.dark) || (g & BT.weird) ? 8 : g & BT.note ? 5 : g & BT.coc ? 7 : T.el[s.bowner[i]!] ?? 0;
}
const CELL = new Map<number, number[]>(), POOL: number[][] = [];
const key = (x: number, y: number): number => (((x / 48) | 0) + 1000) * 4000 + (((y / 48) | 0) + 1000);
/** Legacy chPre5 (end of the themed pre). */
export function elemPre(w: World, s: CombatState, T: ThemedState): void {
  const ke = kindEl(w);
  for (let p = 0; p < s.n; p++) {
    let any = false; for (let k = 0; k < MAX_FX; k++) if (s.fx[p * MAX_FX + k]! > 0) { any = true; break; }
    const k = s.lastIt[p]!, e = k === CARD_ULT ? ITEMEL['rainbow']! : k >= 0 ? ke[k] ?? 0 : 0;
    T.el[p] = e && any ? e : 0;
  }
  if (s.gf % 2) return;
  CELL.clear(); let np = 0;
  for (let i = 0; i < s.nb; i++) {
    if (s.bflags[i]! & (BF.dead | BF.fake)) continue;
    if (!(s.btag[i]! & BT.elset)) { s.bel[i] = bulletEl(s, T, i); s.btag[i] = s.btag[i]! | BT.elset; }
    if (!s.bel[i] || (s.btag[i]! & BT.rxd)) continue;
    const c0 = key(s.bx[i]!, s.by[i]!); let c = CELL.get(c0); if (!c) { c = POOL[np] ??= []; c.length = 0; np++; CELL.set(c0, c); } c.push(i);
  }
  if (!CELL.size) return;
  // element entities (legacy ENTEL: flake, fire, puddle…) join with their items
  for (const c of CELL.values()) for (let x = 0; x < c.length; x++) {
    const a = c[x]!; if ((s.bflags[a]! & BF.dead) || (s.btag[a]! & BT.rxd)) continue;
    for (let y = x + 1; y < c.length; y++) {
      const b = c[y]!; if ((s.bflags[b]! & BF.dead) || (s.btag[b]! & BT.rxd) || s.bel[b] === s.bel[a] || s.bowner[b] === s.bowner[a] || (s.teams && s.team[s.bowner[a]!] === s.team[s.bowner[b]!])) continue;
      if (!(s.bflags[a]! & BF.heavy) && !(s.bflags[b]! & BF.heavy) && spRand(s) < 0.7) continue;
      // legacy: overlap -> xReact (RX not ported: never reacts)
    }
  }
}
/** Legacy chBullet wrapper (line 1814): a bullet that landed leaves its element as an aura. `r` = the inner chBullet result. */
export function elemBullet(s: CombatState, T: ThemedState, i: number, t: number, r: boolean): void {
  const g = s.btag[i]!;
  if ((!r || (g & (BT.yy | BT.anni | BT.pure))) && (g & BT.elset) && s.bel[i] && !(s.bflags[i]! & BF.fake) && !(g & BT.rxd) && !(g & BT.flower)) { s.btag[i] = g | BT.rxd; xAura(s, T, t, s.bel[i]!); }
}
/** Legacy chHit wrapper (line 1815): allies never hurt each other; a melee hit leaves the attacker's element (10-frame cooldown). True = blocked. */
export function elemHit(s: CombatState, T: ThemedState, v: number, a: number): boolean {
  if (a >= 0 && a !== v && s.teams && s.team[a] === s.team[v]) return true;
  if (a >= 0 && a !== v && s.state[a] === PS.atk && T.mvEl[v]! < s.gf) { T.mvEl[v] = s.gf + 10; xAura(s, T, v, T.el[a]!); }
  return false;
}
