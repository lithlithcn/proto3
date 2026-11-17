import type { World } from '@kernel';

/** Legacy draw code reads per-player item fields (`q.eatBy`) and the CX globals (`CX.anon`). This rebuilds both from the touhou + themed
 *  slices each frame (presentation only; only the keys of ported items exist, the rest stay undefined like in a fresh legacy match). */
type Cols = Record<string, ArrayLike<number>>;
export function thOf(w: World): Cols { const t = w.slice<Cols | undefined>('themed'); return t ? { ...w.slice<Cols>('touhou'), ...t } : w.slice<Cols>('touhou'); }
export function cxOf(w: World): Record<string, unknown> {
  const t = w.slice<Record<string, number> | undefined>('themed'), C: Record<string, unknown> = {}; if (!t) return C;
  if (t['anon']! > 0) C['anon'] = t['anon'];
  if (t['wallO']! >= 0) C['wall'] = { x: t['wallX'], o: t['wallO'], t: t['wallT'] };
  return C;
}
