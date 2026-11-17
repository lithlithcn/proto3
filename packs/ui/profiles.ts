import { applyBinds, setProfileLookup, type ProfBinds } from './input/binds';

/** Player profiles (legacy PROF / SLOTP / profOf, line ~1941): a name, a name colour and animation, and personal bindings; P1..P4 slots each
 *  point at a profile or none. Storage keys `sf_prof`, `sf_slotp` (same format). */
export interface Profile extends ProfBinds { n: string; c: number; a: number }
export const PROFS = { list: [] as Profile[], slot: [-1, -1, -1, -1], edit: 0 };
export const NCOL: (string | 0)[] = [0, '#ffffff', '#ff5a5a', '#ffa63a', '#ffe83a', '#7cff6a', '#3affd0', '#5ab0ff', '#a07cff', '#ff7ce0', 'rainbow'];
export const NCN = ['player color', 'white', 'red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'pink', 'rainbow'], NANIM = ['still', 'bob', 'tilt', 'bob + tilt', 'wave', 'pulse', 'swing'];
export const profOf = (i: number): Profile | null => PROFS.list[PROFS.slot[i] ?? -1] ?? null;
setProfileLookup(profOf);
type Store = Pick<Storage, 'getItem' | 'setItem'>;
export function loadProfiles(s: Store): void {
  try { PROFS.list = JSON.parse(s.getItem('sf_prof') ?? '[]') as Profile[] || []; PROFS.slot = JSON.parse(s.getItem('sf_slotp') ?? '[-1,-1,-1,-1]') as number[]; } catch { PROFS.list = []; PROFS.slot = [-1, -1, -1, -1]; }
  applyBinds();
}
export function saveProfiles(s: Store): void { try { s.setItem('sf_prof', JSON.stringify(PROFS.list)); s.setItem('sf_slotp', JSON.stringify(PROFS.slot)); } catch { /* quota */ } }
/** Name shown for a fighter: its slot's profile name, else P<n> / CPU <n> (legacy pname; online names join in lot 4). */
export const pname = (p: { id: number; cpu: boolean }): string => { const f = !p.cpu && profOf(p.id); return f ? f.n : (p.cpu ? 'CPU ' : 'P') + (p.id + 1); };
export const ncol = (c: number, d: string, frame: number): string => NCOL[c] === 'rainbow' ? `hsl(${frame * 6 % 360},100%,65%)` : (NCOL[c] || d) as string;
/** Animated name (legacy drawName): still / bob / tilt / bob + tilt / wave / pulse / swing. */
export function drawName(c: CanvasRenderingContext2D, s: string, x: number, y: number, col: string, a: number, t: number, sx = 1): void {
  c.save(); c.translate(x, y);
  if (a === 1 || a === 3) c.translate(0, Math.sin(t * 3) * 3); if (a === 2 || a === 3) c.rotate(Math.sin(t * 2.2) * 0.15); if (a === 5) { const z = 1 + 0.1 * Math.sin(t * 4); c.scale(z, z); } if (a === 6) { c.translate(Math.sin(t * 2) * 5, 0); c.rotate(Math.sin(t * 2) * 0.1); }
  c.scale(sx, 1); c.font = 'bold 17px monospace'; c.lineWidth = 5; c.lineJoin = 'round'; c.strokeStyle = 'rgba(0,0,0,.85)'; c.fillStyle = col;
  if (a === 4) { let px = -c.measureText(s).width / 2; c.textAlign = 'left'; for (let i = 0; i < s.length; i++) { const yy = Math.sin(t * 5 - i * 0.6) * 3; c.strokeText(s[i]!, px, yy); c.fillText(s[i]!, px, yy); px += c.measureText(s[i]!).width; } }
  else { c.textAlign = 'center'; c.strokeText(s, 0, 0); c.fillText(s, 0, 0); }
  c.restore();
}
