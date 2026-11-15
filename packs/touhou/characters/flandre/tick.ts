import { type World, hypot } from '@kernel';
import { BF, PS, bodyR, moveOf, type CombatState, jBurst, jTxt } from '@pack/combat/api';

/** Focus melee = CRUSH: while the active frames of a focused melee are out, foreign heavy shots inside its reach are destroyed. */
export function flandreTick(w: World, s: CombatState, p: number): void {
  if (!s.focus[p] || s.state[p] !== PS.atk) return;
  const m = moveOf(w, s, p); if (!m || m.act === undefined || s.t[p]! < m.start || s.t[p]! >= m.start + m.act) return;
  const r = m.range + bodyR(s, p);
  for (let i = 0; i < s.nb; i++) if (!(s.bflags[i]! & BF.dead) && (s.bflags[i]! & BF.heavy) && s.bowner[i] !== p && hypot(s.bx[i]! - s.x[p]!, s.by[i]! - s.y[p]!) < r + s.br[i]!) { s.bflags[i] = s.bflags[i]! | BF.dead; jBurst(w, s.bx[i]!, s.by[i]!, '#ff3030', 10); jTxt(w, s.bx[i]!, s.by[i]! - 14, 'CRUSH', '#ff6060', 12); }
}
