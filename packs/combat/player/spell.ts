import { ULT } from './ult';
import { jfx, sfx } from '../jfx';
import { hypot, type World } from '@kernel';
import { spellPool } from '../api';
import { spRand } from '../bullets/pattern';
import type { PCtx } from '../input';
import { foe } from '../target';
import { BF, PS, type CombatState } from '../state';
import { T } from '../tuning';

/**
 * Spell cards (legacy startSpell/updSpell/endSpell + the cast wrapper that shoves nearby foes).
 * Deliberate deviations (DESIGN R72): the card is drawn from a pool by a deterministic named rng stream (`combat:spell`) or `s.spPick`
 * (lab/tests); casting from hit-stun reacts to the button's rising edge (legacy only refreshed its "held" flag when the key object existed).
 */
export const castable = (st: number): boolean => st === PS.idle || st === PS.dash || st === PS.dashlag || st === PS.parry || st === PS.parrylag || st === PS.atk;

export function startSpell(w: World, s: CombatState, p: number, ult: boolean): void {
  if (!ult) s.spirit[p] = s.spirit[p]! - T.SPELL_COST;
  s.ultS[p] = ult ? 1 : 0; s.spN[p] = s.spN[p]! + 1;
  const n = spellPool(w).length;
  if (!ult && n > 0) {
    const r = spRand(s);
    s.spI[p] = s.spPick >= 0 ? s.spPick % n : s.spI[p]! < 0 ? Math.floor(r * n) : (s.spI[p]! + 1 + Math.floor(r * (n - 1))) % n;
    s.spPick = -1;
  }
  s.state[p] = PS.spell; s.t[p] = 0; s.inv[p] = Math.max(120, T.SPELL_CUTIN + 10); s.vx[p] = 0; s.vy[p] = 0; s.charging[p] = 0;
  s.spellHit.fill(0);
  const cut: number[] = []; // cancelled bullets: x, y, heavy (presentation sparks)
  for (let i = 0; i < s.nb; i++) if (s.bowner[i] !== p && hypot(s.bx[i]! - s.x[p]!, s.by[i]! - s.y[p]!) < 220) { s.bflags[i] = s.bflags[i]! | BF.dead; cut.push(s.bx[i]!, s.by[i]!, s.bflags[i]! & BF.heavy); if (s.bflags[i]! & BF.heavy) jfx(w, 'brk'); }
  for (let q = 0; q < s.n; q++) { // the cast shoves close foes away and interrupts their attack
    if (!foe(s, p, q) || s.state[q] === PS.dead) continue;
    const dx = s.x[q]! - s.x[p]!, dy = s.y[q]! - s.y[p]!, d = hypot(dx, dy) || 1;
    if (d < T.BURST_R + T.BODY_R) { s.vx[q] = s.vx[q]! + dx / d * 14; s.vy[q] = s.vy[q]! + dy / d * 14; if (s.state[q] === PS.atk) { s.mvId[q] = 0; s.state[q] = PS.idle; } }
  }
  w.emit('combat:spell', { p, ult, spell: s.spI[p]!, cut });
}

export function endSpell(w: World, s: CombatState, p: number, timeout: boolean): void {
  s.state[p] = PS.idle; s.ultS[p] = 0;
  if (!timeout) return;
  for (let q = 0; q < s.n; q++) if (q !== p && !s.spellHit[q] && s.state[q] !== PS.dead && s.stocks[q]! > 0) {
    s.spirit[q] = Math.min(T.SPIRIT_MAX, s.spirit[q]! + T.CAPTURE_GAIN);
    w.emit('combat:spell-capture', { p: q, by: p });
  }
}

/** One frame of the 'spell' state: cut-in (frozen), then free movement at focus speed while the card's pattern runs. */
export function updSpell(c: PCtx): void {
  const { w, s, p } = c;
  s.t[p] = s.t[p]! + 1;
  if (s.t[p]! <= T.SPELL_CUTIN) { s.vx[p] = s.vx[p]! * 0.8; s.vy[p] = s.vy[p]! * 0.8; return; }
  s.vx[p] = s.vx[p]! + (c.ix * T.FOCUS_SPEED - s.vx[p]!) * 0.35; s.vy[p] = s.vy[p]! + (c.iy * T.FOCUS_SPEED - s.vy[p]!) * 0.35;
  const k = s.t[p]! - T.SPELL_CUTIN - 1, pool = spellPool(w), d = s.ultS[p] ? ULT : pool[s.spI[p]!];
  d?.fn({ w, s, p, o: s.tgt[p]!, k });
  if (k > 0 && k % (d?.loop ?? 60) === 0) jfx(w, 'kira'); // presentation: the pattern restarts (rate-limited sound), last-3-seconds countdown
  { const rem = T.SPELL_CUTIN + (s.ultS[p] ? T.ULT_T : T.SPELL_T) - s.t[p]!; if (rem <= 180 && rem % 60 === 0) sfx(w, 'timeout', 0.6); }
  if (s.t[p]! >= T.SPELL_CUTIN + (s.ultS[p] ? T.ULT_T : T.SPELL_T)) endSpell(w, s, p, true);
}

/** Spell-related input, run before the state dispatch (legacy updP lines for `pr('spell')`). Returns true when the frame is consumed. */
export function spellInput(c: PCtx, pressed: boolean): boolean {
  const { w, s, p } = c, st = s.state[p]!;
  if (!pressed) return false;
  if (castable(st)) {
    if (s.ult[p]) { s.ult[p] = 0; startSpell(w, s, p, true); return true; }
    if (s.spirit[p]! >= T.SPELL_COST) {
      if (st === PS.dash && T.DASH_T - s.t[p]! < 10) s.boost[p] = Math.min(T.DASH_CHARGES, s.boost[p]! + T.DASH_COST);
      startSpell(w, s, p, false); return true;
    }
  }
  // legacy: the "refused" feedback is NOT gated by the player's state (only by spirit, ult and the 45-frame cooldown)
  if (s.spirit[p]! < T.SPELL_COST && !s.ult[p] && s.spRef[p]! < s.gf) { s.spRef[p] = s.gf + 45; w.emit('combat:spell-refused', { p, spirit: s.spirit[p]! }); }
  return false;
}
