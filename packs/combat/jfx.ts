import type { World } from '@kernel';

/**
 * Presentation command channel (legacy juice one-liners: spark/burst/txt/big/flash, `shake=Math.min(28,shake+6)`, `chroma=Math.max(chroma,10)`,
 * RINGS/WAVES/LINES pushes). Sim code calls these at the exact legacy site; the render pack journals and applies them, the sim never reads them back.
 * Numbers/strings only (journaled as-is).
 */
export type JfxArg = number | string;
export const jfx = (w: World, op: string, ...a: JfxArg[]): void => { w.emit('combat:fx', { op, a }); };
export const spark = (w: World, x: number, y: number): void => jfx(w, 'burst', x, y, '#bdf', 2);
export const burst = (w: World, x: number, y: number, c: string, n: number): void => jfx(w, 'burst', x, y, c, n);
export const txt = (w: World, x: number, y: number, s: string, c: string, z = 16): void => jfx(w, 'txt', x, y, s, c, z);
export const big = (w: World, s: string, c: string, z = 48, key = ''): void => jfx(w, 'big', s, c, z, key);
export const flash = (w: World, v: number, c = '#fff'): void => jfx(w, 'flash', v, c);
/** `name = min(cap, name + v)` (cap 0 = uncapped), e.g. shake. */
export const addJ = (w: World, name: string, v: number, cap = 0): void => jfx(w, 'add', name, v, cap);
/** `name = max(name, v)`, e.g. chroma, bright, zblur, invF. */
export const maxJ = (w: World, name: string, v: number): void => jfx(w, 'max', name, v);
/** Pushes `{ x, y, ...kv }` on a list (RINGS/WAVES/LINES/FX/KOFX): `kv` alternates key, value. */
export const pushJ = (w: World, list: string, ...kv: JfxArg[]): void => jfx(w, 'push', list, ...kv);
