/**
 * Input frame (DESIGN §6): everything the sim reads from the outside. Per player: x, y analog as int8 (-127..127), buttons bitmask.
 * Layout: Int32Array [x0, y0, btn0, x1, y1, btn1, ...]. Quantised before entering the sim (DESIGN §3.8).
 */
export const INPUT_STRIDE = 3;
export type InputFrame = Int32Array;
export const newInput = (players: number): InputFrame => new Int32Array(players * INPUT_STRIDE);
export const quantize = (v: number): number => Math.max(-127, Math.min(127, Math.round(v * 127)));
export function setInput(f: InputFrame, player: number, x: number, y: number, buttons: number): void {
  f[player * 3] = x; f[player * 3 + 1] = y; f[player * 3 + 2] = buttons;
}
/** Standard action bits (index = bit). Packs may define more in higher bits. */
export const BTN = { shot: 1, heavy: 2, melee: 4, dash: 8, parry: 16, burst: 32, spell: 64, focus: 128, prev: 256, next: 512 } as const;
