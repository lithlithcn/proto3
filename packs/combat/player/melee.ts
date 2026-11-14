import { BTN, type World, atan2, cos, hypot, sin } from '@kernel';
import { type PCtx, held, pr } from '../input';
import { MV_NAMES, SRC, type MoveDef } from '../moves';
import { T, TAU } from '../tuning';
import { PS, type CombatState } from '../state';
import { doDash } from './dash';
import { moveOf } from './atkstart';
import { hit } from './hit';

const SRC_OF: Record<string, number> = { jab: SRC.jab, lunge: SRC.lunge, strong: SRC.strong, dashatk: SRC.dashatk, tslam: SRC.tslam, grab: SRC.grab };

/** Attack state tick (legacy `atk`): charge, movement, hit window, then the cancel options, then recovery. */
export function updAtk(c: PCtx): void {
  const { w, s, p } = c, m = moveOf(w, s, p);
  if (!m) { s.state[p] = PS.idle; return; }
  if (s.charging[p]) {
    if (held(c, BTN.melee) && s.charge[p]! < (m.charge ?? 0)) { s.charge[p] = s.charge[p]! + 1; s.vx[p] = s.vx[p]! * 0.8; s.vy[p] = s.vy[p]! * 0.8; return; }
    s.charging[p] = 0;
  }
  s.t[p] = s.t[p]! + 1;
  const act = m.act, t = s.t[p]!, fr = m.keep || s.carry[p]! || 0.85;
  s.vx[p] = s.vx[p]! * fr; s.vy[p] = s.vy[p]! * fr;
  if (t === m.start && m.move) { s.vx[p] = cos(s.atkA[p]!) * m.move; s.vy[p] = sin(s.atkA[p]!) * m.move; }
  if (t > m.start && t <= m.start + act && !s.hitDone[p] && t >= s.nextHit[p]!) for (let q = 0; q < s.n; q++) if (q !== p && !s.hitDone[p]) strike(w, s, p, q, m);
  // cancels (heavy confirm joins with the heavy-shot batch)
  if (s.mHit[p] && pr(c, BTN.dash) && s.boost[p]! >= T.DASH_COST) { s.mHit[p] = 0; w.emit('combat:cancel', { p, kind: 'hit' }); doDash(c); return; } // a connecting hit can be cancelled into a dash
  if (t > m.start + act && pr(c, BTN.dash) && s.spirit[p]! >= T.CANCEL_COST && s.boost[p]! >= T.DASH_COST) {
    s.spirit[p] = s.spirit[p]! - T.CANCEL_COST; w.emit('combat:cancel', { p, kind: 'spirit' }); doDash(c); return;
  }
  if (t >= m.start + act + Math.round(m.rec * 0.8)) s.state[p] = PS.idle;
}

/** Melee contact test and resolution (legacy `melee`). TODO(next batch): grab, parry, clash. */
function strike(w: World, s: CombatState, p: number, o: number, m: MoveDef): void {
  if (s.state[o] === PS.dead || s.inv[o]! > 0) return;
  const dx = s.x[o]! - s.x[p]!, dy = s.y[o]! - s.y[p]!, d = hypot(dx, dy) || 1;
  if (d > m.range + T.BODY_R) return;
  const da = Math.abs(((atan2(dy, dx) - s.atkA[p]!) % TAU + TAU * 1.5) % TAU - 3.141592653589793);
  if (da > m.arc / 2 && d > T.BODY_R * 2) return;
  s.hitDone[p] = 1;
  const mult = 1 + s.charge[p]! / (m.charge || 1) * 0.7, name = MV_NAMES[s.mvId[p]!]!;
  s.mHit[p] = 1;
  hit(w, s, o, p, dx, dy, m, SRC_OF[name]!, mult, name !== 'jab');
  if (m.multi) { s.hitDone[p] = 0; s.nextHit[p] = s.t[p]! + (m.every ?? 1); }
}
