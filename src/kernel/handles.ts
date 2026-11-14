import { type Schema, i32, i32s } from './schema';
import { KernelError } from './errors';

/**
 * Entity handles (DESIGN §4.3): handle = (generation << 20) | index. A stale handle (slot reused) is detected, never confused.
 * The table lives in a state slice, so rollback restores it. Max 2^20 slots, 11-bit generation (never 0).
 */
export const handleIndex = (h: number): number => h & 0xfffff;
export function handleTable(name: string, max: number) {
  const gen = `${name}Gen`, free = `${name}Free`, top = `${name}Top`, next = `${name}Next`;
  const schema: Schema = { [gen]: i32s(max), [free]: i32s(max), [top]: i32(), [next]: i32() };
  type S = Record<string, number | Int32Array>;
  return {
    schema, max,
    alloc(s: S): number {
      const g = s[gen] as Int32Array, fr = s[free] as Int32Array;
      let idx: number;
      if ((s[top] as number) > 0) idx = fr[(s[top] = (s[top] as number) - 1) as number]!;
      else { idx = s[next] as number; if (idx >= max) throw new KernelError('E_HANDLE_FULL', `handle table '${name}' full (${max})`); s[next] = idx + 1; }
      g[idx] = ((g[idx]! + 1) & 0x7ff) || 1;
      return (g[idx]! << 20) | idx;
    },
    free(s: S, h: number): boolean {
      if (!this.alive(s, h)) return false;
      const idx = handleIndex(h), g = s[gen] as Int32Array;
      g[idx] = ((g[idx]! + 1) & 0x7ff) || 1; // generation bump invalidates all old handles to this slot
      (s[free] as Int32Array)[s[top] as number] = idx; s[top] = (s[top] as number) + 1;
      return true;
    },
    alive(s: S, h: number): boolean { const idx = handleIndex(h); return h > 0 && idx < (s[next] as number) && (s[gen] as Int32Array)[idx] === h >>> 20; },
  };
}
