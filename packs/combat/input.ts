import { BTN, type World } from '@kernel';
import type { CombatState } from './state';
import { guardGauge } from './player/parry';
import { NBTN, PS } from './state';

/** Per-player input context for the current frame. Reused object (no allocation); NOT state — rebuilt every step. */
export interface PCtx { w: World; s: CombatState; p: number; ix: number; iy: number; b: number; edge: number; gf: number }
export const ctx: PCtx = { w: null as never, s: null as never, p: 0, ix: 0, iy: 0, b: 0, edge: 0, gf: 0 };

/** Buttons that act only on the press frame / are read as held (legacy NOBUF). */
const NOBUF = BTN.next | BTN.prev | BTN.shot | BTN.focus;
const bit = (mask: number): number => 31 - Math.clz32(mask);
const HEAVY_BIT = 31 - Math.clz32(BTN.heavy);

/** Legacy input handling: 8-frame press buffer (3 for parry), computed once per player per frame. */
export function begin(w: World, s: CombatState, p: number): PCtx {
  let b = w.buttons(p), prev = s.prevB[p]!;
  if (!s.cpu[p] && s.state[p] !== PS.dead) { // human heavy = charge on hold, fires on release (legacy wrapper; R68)
    const held = (b & BTN.heavy) !== 0, was = s.hHeld[p] !== 0, hb = p * NBTN + HEAVY_BIT;
    s.hHeld[p] = held ? 1 : 0;
    if (held && !was && !(b & BTN.parry)) { s.hch[p] = s.gf; b &= ~BTN.heavy; s.bufF[hb] = 0; }
    else if (held && s.hch[p]! > 0) { b &= ~BTN.heavy; s.bufF[hb] = 0; }
    else if (!held && s.hch[p]! > 0) {
      const k = s.gf - s.hch[p]!; s.hch[p] = 0;
      s.hLv[p] = k >= 120 && s.spirit[p]! >= 15 ? 3 : k >= 60 ? 2 : 1;
      if (s.hLv[p] === 3) s.spirit[p] = s.spirit[p]! - 15;
      b |= BTN.heavy; prev &= ~BTN.heavy; s.bufF[hb] = s.gf;
    }
  }
  const edge = b & ~prev;
  ctx.w = w; ctx.s = s; ctx.p = p; ctx.ix = w.x(p) / 127; ctx.iy = w.y(p) / 127; ctx.b = b; ctx.edge = edge; ctx.gf = s.gf;
  for (let i = 0; i < NBTN; i++) { const m = 1 << i; if (edge & m && !(NOBUF & m)) s.bufF[p * NBTN + i] = s.gf; }
  s.prevB[p] = b;
  return ctx;
}
/** Legacy `pr(k)`: press (edge) for unbuffered keys, buffered press otherwise. */
export function pr(c: PCtx, mask: number): boolean {
  if (NOBUF & mask) return (c.edge & mask) !== 0;
  const f = c.s.bufF[c.p * NBTN + bit(mask)]!;
  return f > 0 && c.gf - f <= (mask === BTN.parry ? 3 : 8);
}
export const held = (c: PCtx, mask: number): boolean => (c.b & mask) !== 0;

export function clearBuf(s: CombatState, p: number): void { for (let i = 0; i < NBTN; i++) s.bufF[p * NBTN + i] = 0; }

/**
 * Legacy end-of-step input wrapper: a press that the base logic did not stamp (because the buffer was just emptied by an action start)
 * is stamped now, unless that key was stamped within the last 8 frames. Heavy is excluded for humans. Not run on frozen frames
 * (hit-stop, KO slow-motion), where only the base step runs.
 */
export function bufferInputs(w: World, s: CombatState): void {
  for (let p = 0; p < s.n; p++) {
    const b = w.buttons(p), edge = b & ~s.bpv[p]!;
    for (let i = 0; i < NBTN; i++) {
      const m = 1 << i;
      if (!(edge & m) || NOBUF & m || (m === BTN.heavy && !s.cpu[p])) continue;
      const f = s.bufF[p * NBTN + i]!;
      if (!(f > 0 && s.gf - f <= 8)) s.bufF[p * NBTN + i] = s.gf;
    }
    s.bpv[p] = b;
    guardGauge(w, s, p);
  }
}
