import { BTN, atan2, type World } from '@kernel';
import { begin, clearBuf, held, pr } from '../input';
import { T } from '../tuning';
import { PS, type CombatState } from '../state';
import { updDash, updDashLag } from './dash';
import { updHitstun } from './hitstun';
import { updIdle } from './idle';
import { updAtk } from './melee';
import { updRifle } from '../items/rifle';
import { updParry, updParrylag, updParrystun } from './parry';
import { startAtk } from './atkstart';
import { breakerBullet } from '../bullets/spawn';
import { MV } from '../moves';
import { ko } from './ko';
import { respawn } from './respawn';
import { inEdge } from '../stats';
import { spellInput, startSpell, updSpell } from './spell';


/**
 * One player's frame (legacy `updP` + the "action start empties the buffer" wrapper): starting any non-idle action, or
 * restarting an attack, clears the press buffer (the same press is re-stamped by `bufferInputs` at the end of the step).
 */
export function updatePlayer(w: World, s: CombatState, p: number): void {
  // legacy: the hit-stun spell cancel is an OUTER wrapper, so it runs before the buffer wrapper samples the state: it never empties the press buffer
  { // spell cancel out of hit-stun: rising edge of the spell button with a full gauge (legacy wrapper; R72)
    const down = (w.buttons(p) & BTN.spell) !== 0;
    if (down && !s.spHv[p] && s.state[p] === PS.hitstun && s.spirit[p]! >= T.SPELL_COST) { s.state[p] = PS.idle; startSpell(w, s, p, false); }
    s.spHv[p] = down ? 1 : 0;
  }
  const st0 = s.state[p]!, t0 = s.t[p]!;
  step(w, s, p);
  if ((s.state[p] !== st0 && s.state[p] !== PS.idle) || (s.state[p] === PS.atk && s.t[p]! < t0)) clearBuf(s, p);
}

/** The state machine itself (legacy `updP`, ported incrementally). The order of statements is the legacy order and is parity-tested. */
function step(w: World, s: CombatState, p: number): void {
  const c = begin(w, s, p);
  const st = s.state[p];
  if (held(c, BTN.parry) && (st === PS.idle || st === PS.parry || st === PS.parrylag || st === PS.dashlag)) { // parry + melee = grab (only catches a parrying foe); parry + heavy = breaker (heavy batch)
    if (pr(c, BTN.melee)) { startAtk(s, p, MV.grab); w.emit('combat:grab', { p }); return; }
    if (pr(c, BTN.heavy) && s.brCD[p]! < s.gf) { s.brCD[p] = s.gf + 90; s.state[p] = PS.idle; breakerBullet(s, p); return; } // breaker: shatters the shield of a parrying foe
  }
  if (s.state[p] === PS.dead) { if (s.stocks[p]! > 0) { s.t[p] = s.t[p]! - 1; if (s.t[p]! <= 0) respawn(w, s, p); } return; }
  if (pr(c, BTN.dash) || pr(c, BTN.parry)) s.techBuf[p] = 10; else if (s.techBuf[p]! > 0) s.techBuf[p] = s.techBuf[p]! - 1;
  if (s.inv[p]! > 0) s.inv[p] = s.inv[p]! - 1;
  if (s.flash[p]! > 0) s.flash[p] = s.flash[p]! - 1;
  if (s.comboT[p]! > 0) s.comboT[p] = s.comboT[p]! - 1;
  if (s.state[p] !== PS.dash) {
    if (s.dashCd[p]! > 0) s.dashCd[p] = s.dashCd[p]! - 1;
    else s.boost[p] = Math.min(T.DASH_CHARGES, s.boost[p]! + T.DASH_REGEN * (held(c, BTN.shot) || s.state[p] === PS.spell ? 1 : T.DASH_REGEN_IDLE));
  }
  s.burst[p] = Math.min(T.BURST_MAX, s.burst[p]! + T.BURST_REGEN);
  if (inEdge(s, p) && s.inv[p]! <= 0) { // red zone near the walls hurts slowly
    s.hp[p] = s.hp[p]! - T.EDGE_DMG;
    if (s.hp[p]! <= 0) { ko(w, s, p); return; }
  }
  const o = s.tgt[p]!;
  s.aim[p] = atan2(s.y[o]! - s.y[p]!, s.x[o]! - s.x[p]!);
  s.focus[p] = held(c, BTN.focus) ? 1 : 0;
  const sp = s.spirit[p]!;
  if (sp >= T.SPELL_COST) { if (!s.spReady[p]) { s.spReady[p] = 1; w.emit('combat:spell-ready', { p }); } } else s.spReady[p] = 0;
  if (spellInput(c, pr(c, BTN.spell))) return;
  switch (s.state[p]) {
    case PS.spell: updSpell(c); return;
    case PS.rifle: updRifle(c); return;
    case PS.dash: updDash(c); return;
    case PS.dashlag: updDashLag(c); return;
    case PS.hitstun: updHitstun(c); return;
    case PS.atk: updAtk(c); return;
    case PS.parry: updParry(c); return;
    case PS.parrylag: updParrylag(c); return;
    case PS.parrystun: updParrystun(c); return;
    default: updIdle(c); // TODO(next batches): parry*, spell, bursting, rifle, ...
  }
}
