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
/** Slot defaults (no profile), persisted as `sf_binds3`; BINDS = defaults + the bindings of the profile assigned to each slot (legacy DEFB / applyBinds). */
export const DEFB = { KB: cp(DEF_KB), PAD: [0, 1, 2, 3].map(() => cp(DEF_PAD)) };
export interface ProfBinds { kb?: Partial<Record<Act, string>>; pad?: PadMap }
let profOf: (i: number) => ProfBinds | null = () => null;
export const setProfileLookup = (f: (i: number) => ProfBinds | null): void => { profOf = f; };
export function applyBinds(): void { BINDS.KB = cp(DEFB.KB); BINDS.PAD = cp(DEFB.PAD); for (let i = 0; i < 4; i++) { const f = profOf(i); if (!f) continue; if (f.kb && BINDS.KB[i]) Object.assign(BINDS.KB[i]!, f.kb); if (f.pad && BINDS.PAD[i]) Object.assign(BINDS.PAD[i]!, f.pad); } }
export function loadBinds(s: Store): void {
  DEFB.KB = cp(DEF_KB); DEFB.PAD = [0, 1, 2, 3].map(() => cp(DEF_PAD));
  try {
    const o = JSON.parse(s.getItem('sf_binds3') ?? 'null') as { KB: Record<Act, string>[]; PAD: PadMap[] } | null;
    if (o) { o.KB.forEach((x, i) => { if (DEFB.KB[i]) Object.assign(DEFB.KB[i]!, x); }); o.PAD.forEach((x, i) => { if (DEFB.PAD[i]) Object.assign(DEFB.PAD[i]!, x); }); }
    for (const M of DEFB.PAD) { if (Array.isArray(M.burst)) M.burst = 3; if (M.next === 12) M.next = 11; } // old saves: burst was a chord, next was 12
  } catch { /* corrupt: defaults */ }
  applyBinds();
}
/** Edits go to the profile of each slot when it has one, else to the slot defaults. `saveProfiles` persists the profiles. */
export function saveBinds(s: Store, saveProfiles: () => void = () => {}): void {
  for (let i = 0; i < 4; i++) { const f = profOf(i); if (f) { if (BINDS.KB[i]) f.kb = cp(BINDS.KB[i]!); f.pad = cp(BINDS.PAD[i]!); } else { if (BINDS.KB[i]) DEFB.KB[i] = cp(BINDS.KB[i]!); DEFB.PAD[i] = cp(BINDS.PAD[i]!); } }
  try { s.setItem('sf_binds3', JSON.stringify(DEFB)); } catch { /* quota */ }
  saveProfiles();
}
/** Row labels (legacy ACT_FR). */
export const ACT_LABEL: Record<Act, string> = { up: 'Up', down: 'Down', left: 'Left', right: 'Right', shot: 'Shot', heavy: 'Heavy', melee: 'Melee', dash: 'Dash', parry: 'Parry', burst: 'Skill 2', spell: 'Spell card', focus: 'Focus', prev: 'Skill 1', next: 'Skill 2 (alt)' };
/** Layout-aware key labels (navigator.keyboard layout map when the browser has it; legacy LBL). */
export const LBL: Record<string, string> = {};
export const keyName = (c: string): string => LBL[c] || ({ Mouse0: 'Mouse L', Mouse1: 'Mouse M', Mouse2: 'Mouse R', Mouse3: 'Mouse 4', Mouse4: 'Mouse 5', WheelUp: 'Wheel ↑', WheelDown: 'Wheel ↓', Space: 'Space', ShiftLeft: 'L Shift', ShiftRight: 'R Shift', ControlLeft: 'L Ctrl', ControlRight: 'R Ctrl', ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', Enter: 'Enter', Tab: 'Tab' } as Record<string, string>)[c] || c.replace(/^Key|^Digit/, '').replace('Numpad', 'Num ');
const PADN = ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 'Select', 'Start', 'L3', 'R3', '↑', '↓', '←', '→'], PADNS = ['✕', '○', '□', '△', 'L1', 'R1', 'L2', 'R2', 'Share', 'Options', 'L3', 'R3', '↑', '↓', '←', '→'];
export const isPS = (ps: Gamepad[]): boolean => ps.some(g => /054c|sony|playstation|dualshock|dualsense|wireless controller/i.test(g.id));
export const padName = (n: number, ps: Gamepad[]): string => (isPS(ps) ? PADNS : PADN)[n] || ('Button ' + n);
export const padOn = (g: Gamepad): number[] => g.buttons.map((b, n) => b && (b.pressed || b.value > 0.3) ? n : -1).filter(n => n >= 0);
