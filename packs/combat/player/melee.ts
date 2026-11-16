import { sfx, sfxR } from '../jfx';
import { BTN, type World, atan2, cos, hypot, sin } from '@kernel';
import { type PCtx, held, pr } from '../input';
import { MV, MV_NAMES, SRC, type MeleeName, type MoveDef } from '../moves';
import { characters } from '../api';
import { T, TAU } from '../tuning';
import { PS, type CombatState } from '../state';
import { bodyR } from '../stats';
import { doDash, glide } from './dash';
import { fireHeavy } from './heavy';
import { rel, startAtk } from './atkstart';
import { moveOf } from './atkstart';
import { hit } from './hit';
import { parryFx, shieldBreak } from './parry';
import { clearBuf } from '../input';

const SRC_IDX = ['jab', 'lunge', 'strong', 'dashatk', 'tslam', 'grab'];
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
  const heavy = m.spd !== undefined, act = m.act, t = s.t[p]!;
  if (heavy) { s.vx[p] = s.vx[p]! * 0.9; s.vy[p] = s.vy[p]! * 0.9; if (t === m.start) fireHeavy(c, m); }
  else {
    const fr = m.keep || s.carry[p]! || 0.85;
    s.vx[p] = s.vx[p]! * fr; s.vy[p] = s.vy[p]! * fr;
    if (t === m.start && m.move) { s.vx[p] = cos(s.atkA[p]!) * m.move; s.vy[p] = sin(s.atkA[p]!) * m.move; }
    if (t > m.start && t <= m.start + act && !s.hitDone[p] && t >= s.nextHit[p]!) for (let q = 0; q < s.n; q++) if (q !== p && !s.hitDone[p]) strike(w, s, p, q, m);
  }
  if (heavy && t > m.start && pr(c, BTN.dash) && s.focus[p] && s.boost[p]! >= T.DASH_COST) { s.boost[p] = s.boost[p]! - T.DASH_COST; s.dashCd[p] = T.DASH_REGEN_DELAY; glide(c); return; } // glide out of a heavy shot
  if (s.mHit[p] && pr(c, BTN.heavy) && !heavy && s.mvId[p] !== MV.grab) { // hit-confirm: a connecting melee cancels into a heavy shot
    s.mHit[p] = 0; s.state[p] = PS.idle; clearBuf(s, p); w.emit('combat:cancel', { p, kind: 'confirm' });
    startAtk(s, p, rel(c) === 'F' ? MV.heavyF : rel(c) === 'B' ? MV.heavyB : MV.heavyN);
    return;
  }
  if (s.mHit[p] && pr(c, BTN.dash) && s.boost[p]! >= T.DASH_COST && !heavy) { s.mHit[p] = 0; w.emit('combat:cancel', { p, kind: 'hit' }); doDash(c); return; } // a connecting hit can be cancelled into a dash
  const t2 = s.t[p]!; // live value: a parried attacker has t = PARRY_STUN here, which ends short moves at once (legacy quirk, R67)
  if (t2 > m.start + act && pr(c, BTN.dash) && s.spirit[p]! >= T.CANCEL_COST && s.boost[p]! >= T.DASH_COST) {
    s.spirit[p] = s.spirit[p]! - T.CANCEL_COST; w.emit('combat:cancel', { p, kind: 'spirit' }); doDash(c); return;
  }
  if (t2 >= m.start + act + Math.round(m.rec * (heavy ? 1 : 0.8))) s.state[p] = PS.idle;
}

/** Melee contact test and resolution (legacy `melee`): grab (only catches a parrying/whiffing foe), clash, parry, hit. */
function strike(w: World, s: CombatState, p: number, o: number, m: MoveDef): void {
  if (s.state[o] === PS.dead || s.inv[o]! > 0) return;
  const dx = s.x[o]! - s.x[p]!, dy = s.y[o]! - s.y[p]!, d = hypot(dx, dy) || 1;
  if (d > m.range * (s.giant[p]! > 0 ? 1.6 : 1) + bodyR(s, o)) return;
  const da = Math.abs(((atan2(dy, dx) - s.atkA[p]!) % TAU + TAU * 1.5) % TAU - 3.141592653589793);
  if (da > m.arc / 2 && d > T.BODY_R * 2) return;
  const name = MV_NAMES[s.mvId[p]!]!;
  if (name === 'grab') { if (s.state[o] === PS.parry || s.state[o] === PS.parrylag) { s.hitDone[p] = 1; shieldBreak(w, s, o); } return; }
  const om = s.state[o] === PS.atk ? moveOf(w, s, o) : null;
  if (om && !om.spd && !m.spd && s.mvId[o] !== MV.grab && s.t[o]! >= om.start - 3 && s.t[o]! <= om.start + (om.act || 4) + 2) { // clash: both moves cancel, both pushed apart
    s.hitDone[p] = 1; s.hitDone[o] = 1;
    const l = hypot(dx, dy) || 1;
    for (const [q, k] of [[p, -1], [o, 1]] as const) { s.state[q] = PS.idle; s.t[q] = 0; s.vx[q] = dx / l * T.CLASH_PUSH * k; s.vy[q] = dy / l * T.CLASH_PUSH * k; s.inv[q] = T.CLASH_INV; clearBuf(s, q); }
    w.emit('combat:clash', { x: (s.x[p]! + s.x[o]!) / 2, y: (s.y[p]! + s.y[o]!) / 2 });
    return;
  }
  s.hitDone[p] = 1;
  if (s.state[o] === PS.parry) { // parried melee: the attacker is left defenceless
    s.state[p] = PS.parrystun; s.t[p] = T.PARRY_STUN; s.vx[p] = 0; s.vy[p] = 0; s.state[o] = PS.idle; s.inv[o] = T.PARRY_INV;
    parryFx(w, s, o);
    return;
  }
  const mult = (1 + s.charge[p]! / (m.charge || 1) * 0.7) * (s.giant[p]! > 0 ? 1.5 : 1);
  sfxR(w, 'hit', 3, 0.8); sfx(w, name === 'strong' ? 'strongslice' : name === 'lunge' ? 'slice' : 'weakslice', 0.35); s.mHit[p] = 1;
  // stun-repeat counters are keyed by the hit-data OBJECT in legacy: a character's own override of a move is a different object from the shared default (ids 64+, DESIGN §25)
  const own = characters(w)[s.mvCh[p]!]![1].melee?.[name as MeleeName] !== undefined, src = own ? 64 + s.mvCh[p]! * 8 + SRC_IDX.indexOf(name) : SRC_OF[name]!;
  hit(w, s, o, p, dx, dy, m, src, mult, name !== 'jab', true);
  if (m.multi) { s.hitDone[p] = 0; s.nextHit[p] = s.t[p]! + (m.every ?? 1); }
}
