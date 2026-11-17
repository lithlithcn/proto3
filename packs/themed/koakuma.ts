import type { World } from '@kernel';
import { FXS, MAX_FX, PS, type CombatState, jBig, jFlash, ko, pushJ, sfx } from '@pack/combat/api';
import type { ThemedState } from './state';

/** Koakuma, Devil Pact (legacy GIVE.koakuma / chKill / xPact, lines 986-993): a K.O. scored under the pact is resolved at the next chPre.
 *  Behind the leader (most stocks, then HP): swap stocks, spirit, burst, power and HP with them. Already leading: lose a stock (or die on the last one). */
export function pactKill(w: World, s: CombatState, v: number): void {
  const k = s.lastHit[v]! >= 0 && s.gf - s.lastHitF[v]! < 240 ? s.lastHit[v]! : -1; if (k < 0 || k === v) return;
  const i = k * MAX_FX + FXS.pact; if (s.fx[i]! > 0) { s.fx[i] = 0; w.slice<ThemedState>('themed').pactPend[k] = 1; }
}
export function pactPre(w: World, s: CombatState, T: ThemedState, k: number): void {
  if (!T.pactPend[k]) return; T.pactPend[k] = 0;
  let t = -1;
  for (let q = 0; q < s.n; q++) if (q !== k && s.stocks[q]! > 0 && (t < 0 || s.stocks[q]! > s.stocks[t]! || s.stocks[q] === s.stocks[t] && s.hp[q]! > s.hp[t]!)) t = q;
  if (t >= 0 && (s.stocks[t]! > s.stocks[k]! || s.stocks[t] === s.stocks[k] && s.hp[t]! > s.hp[k]!)) {
    for (const a of [s.stocks, s.spirit, s.burst, s.power]) { const v = a[k]!; a[k] = a[t]!; a[t] = v; }
    if (s.state[t] !== PS.dead) { const h = s.hp[k]!; s.hp[k] = s.hp[t]!; s.hp[t] = h; }
    jBig(w, 'PACT SEALED: P' + (k + 1) + ' <-> P' + (t + 1), '#c0392b', 44);
  } else if (s.stocks[k]! > 1) { s.stocks[k]!--; jBig(w, 'PACT BROKEN: -1 SOUL', '#c0392b', 44); }
  else { s.hp[k] = 0; ko(w, s, k, 'PACT BROKEN'); }
  jFlash(w, 0.4, '#c0392b'); sfx(w, 'se_cat00'); pushJ(w, 'WAVES', 'x', s.x[k]!, 'y', s.y[k]!, 't', 30, 'T', 30, 'spd', 30, 'th', 60, 'inv', 1);
}
