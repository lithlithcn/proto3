/** Menu navigation from the first pad (legacy pollNav, line ~286): d-pad / stick with key-repeat (380 ms then every 140 ms), A ok, B back,
 *  Y reset, Start / Select, LB / RB tabs. Calls `ev` for each event; the time base is performance.now() ms. */
const prev: Record<string, boolean> = {}; let next = 0;
export function pollNav(g: Gamepad | undefined, nowMs: number, ev: (k: string) => void): void {
  if (!g) return; const bt = (n: number): boolean => !!g.buttons[n]?.pressed, ax = g.axes[0] ?? 0, ay = g.axes[1] ?? 0;
  const s: Record<string, boolean> = { up: bt(12) || ay < -0.6, down: bt(13) || ay > 0.6, left: bt(14) || ax < -0.6, right: bt(15) || ax > 0.6, ok: bt(0), back: bt(1), reset: bt(3), start: bt(9), sel: bt(8), tabL: bt(4), tabR: bt(5) };
  for (const k in s) { const dir = k === 'up' || k === 'down' || k === 'left' || k === 'right'; if (s[k] && !prev[k]) { if (dir) next = nowMs + 380; ev(k); } else if (s[k] && dir && nowMs >= next) { next = nowMs + 140; ev(k); } }
  Object.assign(prev, s);
}
