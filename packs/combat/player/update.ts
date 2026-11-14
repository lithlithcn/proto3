import { BTN, atan2, type World } from '@kernel';
import { begin, held, pr } from '../input';
import { T } from '../tuning';
import { PS, type CombatState } from '../state';
import { updDash, updDashLag } from './dash';
import { updIdle } from './idle';
import { ko } from './ko';
import { respawn } from './respawn';

const inEdge = (s: CombatState, p: number): boolean => s.x[p]! < s.edge || s.y[p]! < s.edge || s.x[p]! > s.mapW - s.edge || s.y[p]! > s.mapH - s.edge;

/** One player's frame (legacy `updP`, ported incrementally). The order of statements is the legacy order and is parity-tested. */
export function updatePlayer(w: World, s: CombatState, p: number): void {
  const c = begin(w, s, p);
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
  switch (s.state[p]) {
    case PS.dash: updDash(c); return;
    case PS.dashlag: updDashLag(c); return;
    default: updIdle(c); // TODO(next batches): hitstun, parry*, atk, spell, bursting, rifle, ...
  }
}
