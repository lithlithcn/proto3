import { BTN } from '@kernel';
import { BINDS, BTNS } from './binds';

/** Input devices outside the sim (legacy devList/devIn/readDev, line ~4213): keyboards k0/k1 and pads p0.. . `devIn` = menu reading
 *  (x/y/a/b/s/y), `readDev` = fight reading (stick + button bitmask, pad chords within T.COMBO_WIN frames). */
export interface Keys { has(code: string): boolean }
export type Pads = readonly (Gamepad | null)[];
export const pads = (): Gamepad[] => typeof navigator !== 'undefined' && navigator.getGamepads ? [...navigator.getGamepads()].filter((g): g is Gamepad => !!g) : [];
export const devList = (ps: Gamepad[]): string[] => ['k0', 'k1', ...ps.map((_, j) => 'p' + j)];
export const devName = (d: string): string => d === 'k0' ? 'KEYBOARD 1' : d === 'k1' ? 'KEYBOARD 2' : 'PAD ' + (+d.slice(1) + 1);
export interface DevIn { x: number; y: number; a: boolean; b: boolean; s: boolean; p?: boolean; t?: boolean }
const bt = (g: Gamepad, n: number): boolean => !!g.buttons[n]?.pressed;
export function devIn(d: string, k: Keys, ps: Gamepad[]): DevIn {
  const I: DevIn = { x: 0, y: 0, a: false, b: false, s: false };
  if (d[0] === 'k') { const m = BINDS.KB[+d[1]!]!, kd = (c: string): number => k.has(c) ? 1 : 0; I.x = kd(m.right) - kd(m.left); I.y = kd(m.down) - kd(m.up); I.a = !!kd(m.shot) || d === 'k0' && (k.has('Enter') || k.has('Space')); I.b = !!kd(m.parry) || d === 'k0' && k.has('Escape'); I.s = d === 'k0' && k.has('Enter'); }
  else {
    const g = ps[+d.slice(1)]; if (!g) return I;
    I.x = (Math.abs(g.axes[0] ?? 0) > 0.5 ? Math.sign(g.axes[0]!) : 0) || (bt(g, 15) ? 1 : bt(g, 14) ? -1 : 0); I.y = (Math.abs(g.axes[1] ?? 0) > 0.5 ? Math.sign(g.axes[1]!) : 0) || (bt(g, 13) ? 1 : bt(g, 12) ? -1 : 0);
    I.a = bt(g, 0); I.b = bt(g, 1); I.s = bt(g, 9); I.t = bt(g, 3); // legacy overwrote I.y with button 3 (team flag); kept apart here so the stick still moves vertically
  }
  return I;
}
/** Pad chord bookkeeping per pad: press frame of every button + buttons already consumed by a chord. */
const padT: number[][] = [], padPB: boolean[][] = [], padUsed: Set<number>[] = [];
/** Fight input of device `d` at frame `frame`: stick x/y in [-1,1] and a BTN bitmask. */
export function readDev(d: string, k: Keys, ps: Gamepad[], frame: number, comboWin = 8): { x: number; y: number; b: number } {
  let x = 0, y = 0, b = 0;
  if (d[0] === 'k') { const m = BINDS.KB[+d[1]!]!; x = (k.has(m.right) ? 1 : 0) - (k.has(m.left) ? 1 : 0); y = (k.has(m.down) ? 1 : 0) - (k.has(m.up) ? 1 : 0); for (const a of BTNS) if (k.has(m[a])) b |= BTN[a]; }
  else {
    const pi = +d.slice(1), g = ps[pi];
    if (g) {
      let ax = g.axes[0] ?? 0, ay = g.axes[1] ?? 0; if (Math.hypot(ax, ay) < 0.25) ax = ay = 0;
      const on = (n: number): boolean => !!g.buttons[n] && (g.buttons[n]!.pressed || g.buttons[n]!.value > 0.3), M = BINDS.PAD[pi] ?? BINDS.PAD[0]!, used = new Set(BTNS.flatMap(a => ([] as number[]).concat(M[a] ?? [])));
      if (!used.has(12) && on(12)) ay = -1; if (!used.has(13) && on(13)) ay = 1; if (!used.has(14) && on(14)) ax = -1; if (!used.has(15) && on(15)) ax = 1; if (ax || ay) { x = ax; y = ay; }
      const pt = padT[pi] ??= [], pb = padPB[pi] ??= [], cs = padUsed[pi] ??= new Set(); for (let n = 0; n < g.buttons.length; n++) { const o = on(n); if (o && !pb[n]) pt[n] = frame; pb[n] = o; }
      for (const n of cs) if (!on(n)) cs.delete(n);
      for (const a of BTNS) { const v = M[a]; if (Array.isArray(v) && v.every(on) && (v.every(n => cs.has(n)) || Math.abs((pt[v[0]!] ?? 0) - (pt[v[1]!] ?? 0)) <= comboWin)) { b |= BTN[a]; v.forEach(n => cs.add(n)); } }
      for (const a of BTNS) { const v = M[a]; if (typeof v === 'number' && on(v) && !cs.has(v)) b |= BTN[a]; }
    }
  }
  const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; }
  return { x, y, b };
}
