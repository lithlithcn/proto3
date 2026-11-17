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
/** Same, only while the list holds fewer than `cap` entries (legacy `if(FX.length<480)FX.push(...)`). */
export const pushJc = (w: World, list: string, cap: number, ...kv: JfxArg[]): void => jfx(w, 'pushc', list, cap, ...kv);
/** Legacy sfx(name, vol, rate) at its exact site (the audio player applies SFXG gain, ALIAS and the time-stop reverb). */
export const sfx = (w: World, n: string, v = 1, r = 1): void => jfx(w, 'sfx', n, v, r);
/** Legacy `sfx(base + (1 + Math.random() * k | 0), v)` (random variant, cosmetic). `from` = first index. */
export const sfxR = (w: World, base: string, k: number, v = 1, from = 1): void => jfx(w, 'sfxr', base, k, v, from);
/** Legacy sfxDmg(victim): damage00 pitched by missing HP, at most once per 3 frames. */
export const sfxDmg = (w: World, hp: number): void => jfx(w, 'sfxdmg', hp);
