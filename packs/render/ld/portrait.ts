import { bindChars, CHDRAW } from './chars';

/** Character art outside a fight (character select, results): the in-game draw of `key` with a stand-in player `q` (legacy cssPort `ch.draw(fq,R)`).
 *  The draw sees no world (no players, bullets, entities); `frame` = the legacy frame counter it animates with. */
export function drawCharArt(c: CanvasRenderingContext2D, key: string, q: Record<string, unknown>, R: number, frame: number): void {
  const d = (CHDRAW as Record<string, ((q: unknown, R: number) => void) | undefined>)[key]; if (!d) return;
  bindChars({ ctx: c, frame, P: [], B: [], ENT: [], CX: {}, chOf: () => null, foeOf: () => false, bodyR: () => 16, coreR: () => 3 });
  try { d(q, R); } catch { /* legacy wraps it in try/catch too: art that needs a world just stops */ }
}
