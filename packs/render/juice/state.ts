import type { World } from '@kernel';
import type { CombatState } from '@pack/combat/api';
import { runJuiceEvent } from './events';

/** Presentation-only "juice" state (legacy globals shake/zk/kx/chroma…, FX/TX/RINGS/WAVES/LINES/KOFX/BIG lists). Fed by event hooks (events.ts), never read by the sim. */
export interface P2 { x: number; y: number; t: number; c?: string; [k: string]: unknown }
export interface Juice {
  shake: number; zk: number; kx: number; ky: number; chroma: number; bright: number; focusL: number; zblur: number; flashS: number; flashCol: string; invF: number;
  bgF: { c: string; t: number }; borderF: { c: string; t: number };
  FX: P2[]; PE: P2[]; TX: P2[]; RINGS: P2[]; WAVES: P2[]; LINES: P2[]; KOFX: P2[]; CRACK: P2[]; GZ: P2[]; BIG: P2[];
  lastGf: number; rnd: () => number; q: { ev: string; gf: number }[]; cc: number[]; ccF: number[]; chG: number[];
}
const cache = new WeakMap<World, Juice>();
export function juiceOf(w: World): Juice {
  let j = cache.get(w);
  if (!j) { j = { shake: 0, zk: 0, kx: 0, ky: 0, chroma: 0, bright: 0, focusL: 0, zblur: 0, flashS: 0, flashCol: '#fff', invF: 0, bgF: { c: '#fff', t: 0 }, borderF: { c: '#fff', t: 0 }, FX: [], PE: [], TX: [], RINGS: [], WAVES: [], LINES: [], KOFX: [], CRACK: [], GZ: [], BIG: [], lastGf: -1, rnd: () => Math.random(), q: [], cc: [], ccF: [], chG: [] }; /* late-bound rnd: juiceOf may first run inside the sanitized step */ cache.set(w, j); }
  return j;
}

/** Legacy stepFx (+ the 10-unique-texts cap): runs once per completed sim frame. */
export function tickJuice(j: Juice): void {
  for (const f of j.FX) { if (f['vx']) { f.x += f['vx'] as number; f['vx'] = (f['vx'] as number) * 0.92; } if (f['vy']) { f.y += f['vy'] as number; f['vy'] = (f['vy'] as number) * 0.92; } f.t--; }
  for (const t of j.TX) { t.y -= 0.6; t.t--; }
  for (const r of j.RINGS) { (r['r'] as number) += ((r['m'] as number) - (r['r'] as number)) * 0.25; r.t--; }
  for (const a of [j.KOFX, j.WAVES, j.LINES, j.CRACK, j.GZ, j.BIG, j.PE]) for (const x of a) x.t--; // PE = presentation-only legacy ENT (dowsing cone, photo flash)
  if (j.invF > 0) j.invF--; j.kx *= 0.8; j.ky *= 0.8; j.chroma *= 0.85; j.bright *= 0.85; j.focusL *= 0.9; j.zblur *= 0.85; j.borderF.t--; j.bgF.t--;
  for (const a of [j.FX, j.TX, j.RINGS, j.KOFX, j.WAVES, j.LINES, j.CRACK, j.GZ, j.BIG, j.PE]) { let w = 0; for (const x of a) if (x.t > 0) a[w++] = x; a.length = w; }
  if (j.LINES.length > 240) j.LINES.splice(0, j.LINES.length - 240); if (j.RINGS.length > 120) j.RINGS.splice(0, j.RINGS.length - 120); if (j.WAVES.length > 60) j.WAVES.splice(0, j.WAVES.length - 60); if (j.TX.length > 80) j.TX.splice(0, j.TX.length - 80);
  j.shake = j.shake > 0.3 ? j.shake * 0.86 : 0; j.zk *= 0.9; j.flashS *= 0.85;
  if (j.TX.length > 10) { const seen = new Set<unknown>(); j.TX = j.TX.reverse().filter(t => { const k = t['s']; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 10).reverse(); }
}
/** Drains the journaled events in order (fx-tick events run `tickJuice`). Call before drawing; hooks themselves only journal because they run inside the sanitized sim window. */
export function syncJuice(j: Juice, s: CombatState): void {
  if (j.lastGf > s.gf) { j.lastGf = -1; j.q.length = 0; } // new match / rewind
  for (const e of j.q) runJuiceEvent(j, e);
  j.q.length = 0;
}

// legacy helpers
export const txt = (j: Juice, x: number, y: number, s: string, c: string, z = 16): void => { j.TX.push({ x, y, s, c, z, t: 50 }); };
export function burst(j: Juice, x: number, y: number, c: string, n: number): void { for (let i = 0; i < n && j.FX.length < 500; i++) { const a = j.rnd() * 6.2832, sp = 2 + j.rnd() * 4; j.FX.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, t: 20 + j.rnd() * 15 | 0, c }); } }
export const flash = (j: Juice, a: number, c = '#fff'): void => { j.flashS = Math.max(j.flashS, a); j.flashCol = c; };
export function big(j: Juice, s: string, c: string, z = 48, key?: string): void {
  if (!key) { if (j.BIG.find(b => b['s'] === s && b.t > 30)) return; }
  const o = key ? j.BIG.find(b => b['key'] === key) : undefined;
  if (o) Object.assign(o, { s, c, z, t: 45 }); else { j.BIG.push({ x: 0, y: 0, s, c, z, t: 45, key }); if (j.BIG.length > 3) j.BIG.shift(); }
  if (j.BIG.length > 2) j.BIG.splice(0, j.BIG.length - 2); // wrapper (line 1925): 2 big texts at most
}
/** Legacy crack (KO floor fissures, second definition at line 2791 wins): 9 jagged polylines + 22 flying shards. */
export function crack(j: Juice, x: number, y: number): void {
  const R = j.rnd, pl: number[][] = [], sh: unknown[] = [];
  for (let i = 0; i < 9; i++) { let a = i * 6.2832 / 9 + (R() - 0.5) * 0.5, cx = x, cy = y; const l = [cx, cy]; for (let k = 0; k < 10; k++) { a += (R() - 0.5) * 0.7; const d = 50 + R() * 130; cx += Math.cos(a) * d; cy += Math.sin(a) * d; l.push(cx, cy); } pl.push(l); }
  for (let i = 0; i < 22; i++) { const a = R() * 6.2832, d = 20 + R() * 260, r = 8 + R() * 26, p: number[] = []; for (let k = 0; k < 3 + (R() * 2 | 0); k++) { const b = k * 6.2832 / 4 + R(); p.push(Math.cos(b) * r, Math.sin(b) * r); } sh.push({ x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, vx: Math.cos(a) * (1 + R() * 3), vy: Math.sin(a) * 2 - 2 - R() * 3, rt: (R() - 0.5) * 0.3, p }); }
  j.CRACK.push({ p: pl, s: sh, x, y, t: 75, T: 75 });
}
