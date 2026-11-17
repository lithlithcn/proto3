/** Key / pad bindings (legacy ACTS, DEF_KB, DEF_PAD, resetBinds/saveBinds; storage key `sf_binds3`, same format). Spell on a pad = LB+RB chord. */
export const ACTS = ['up', 'down', 'left', 'right', 'shot', 'heavy', 'melee', 'dash', 'parry', 'burst', 'spell', 'focus', 'prev', 'next'] as const;
export type Act = (typeof ACTS)[number];
export const BTNS = ACTS.slice(4) as readonly Exclude<Act, 'up' | 'down' | 'left' | 'right'>[];
export const DEF_KB: Record<Act, string>[] = [
  { up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD', shot: 'KeyJ', heavy: 'KeyK', melee: 'KeyL', dash: 'Space', parry: 'KeyI', burst: 'KeyU', spell: 'KeyO', focus: 'ShiftLeft', prev: 'KeyE', next: 'KeyR' },
  { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', shot: 'Numpad1', heavy: 'Numpad2', melee: 'Numpad3', dash: 'Numpad0', parry: 'Numpad5', burst: 'Numpad7', spell: 'Numpad6', focus: 'Numpad4', prev: 'Numpad8', next: 'Numpad9' },
];
export type PadMap = Partial<Record<Act, number | number[]>>;
export const DEF_PAD: PadMap = { shot: 0, melee: 1, heavy: 2, parry: 5, focus: 6, dash: 7, burst: 3, spell: [4, 5], prev: 10, next: 11 };
const cp = <T>(o: T): T => JSON.parse(JSON.stringify(o)) as T;
export const BINDS = { KB: cp(DEF_KB), PAD: [0, 1, 2, 3].map(() => cp(DEF_PAD)) };
export function resetBinds(): void { BINDS.KB = cp(DEF_KB); BINDS.PAD = [0, 1, 2, 3].map(() => cp(DEF_PAD)); }
type Store = Pick<Storage, 'getItem' | 'setItem'>;
export function loadBinds(s: Store): void {
  resetBinds();
  try {
    const o = JSON.parse(s.getItem('sf_binds3') ?? 'null') as { KB: Record<Act, string>[]; PAD: PadMap[] } | null; if (!o) return;
    o.KB.forEach((x, i) => { if (BINDS.KB[i]) Object.assign(BINDS.KB[i]!, x); }); o.PAD.forEach((x, i) => { if (BINDS.PAD[i]) Object.assign(BINDS.PAD[i]!, x); });
    for (const M of BINDS.PAD) { if (Array.isArray(M.burst)) M.burst = 3; if (M.next === 12) M.next = 11; } // old saves: burst was a chord, next was 12
  } catch { /* corrupt: defaults */ }
}
export function saveBinds(s: Store): void { try { s.setItem('sf_binds3', JSON.stringify(BINDS)); } catch { /* quota */ } }
