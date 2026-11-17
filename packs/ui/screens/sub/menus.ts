import { clamp } from '../../core';
import { MAPS, SET, STOCKS, allMaps } from '../../settings';
import type { Row } from './draw';

/** Row lists of the sub-menus (legacy MENU rows filtered by RULESL / OPTL / HELPL, TEAMM, SOUNDM). Rows change SET; the router saves after each change. */
export interface MenuHost { open(title: string, rows: () => Row[]): void; title(): void; controls(): void; guide(): void; tutorial(): void; fullscreen(): boolean; toggleFullscreen(): void; soon(what: string): void }
const TNAME = ['RED', 'BLUE', 'YELLOW', 'GREEN'];
const teamTxt = (n: number): string => {
  if (!SET.teams) return 'OFF (free for all)'; const g: Record<number, string[]> = {}; for (let i = 0; i < n; i++) (g[SET.teamA[i]!] ??= []).push('P' + (i + 1));
  const v = Object.values(g); return v.length < 2 ? 'ON - all in the same team! (= free for all)' : v.map(x => x.join('+')).join(' vs ');
};
export const teamRows = (): Row[] => [
  { t: () => 'Teams: ' + (SET.teams ? 'ON' : 'OFF') + '  ◀ ▶', lr: () => { SET.teams = !SET.teams; } },
  ...[0, 1, 2, 3, 4, 5, 6, 7].filter(i => i < Math.max(2, SET.nP)).map(i => ({ t: () => 'P' + (i + 1) + ' team: ' + TNAME[SET.teamA[i]!] + '  ◀ ▶', lr: (d: number) => { SET.teamA[i] = (SET.teamA[i]! + d + 4) % 4; SET.teams = true; } })),
  ...([['Preset 2 teams of 4 (8 players)', 0, [0, 1, 0, 1, 0, 1, 0, 1]], ['Preset 4 teams of 2 (8 players)', 0, [0, 0, 1, 1, 2, 2, 3, 3]], ['Preset 2v2: P1+P3 vs P2+P4', 0, [0, 1, 0, 1]], ['Preset 2v2: P1+P2 vs P3+P4', 0, [0, 0, 1, 1]], ['Preset 1v3: P1 vs everyone', 0, [0, 1, 1, 1]], ['Preset 1v2: P1 vs P2+P3', 0, [0, 1, 1, 2]]] as const)
    .map(([t, , a]) => ({ t: () => t, f: () => { SET.teamA.splice(0, a.length, ...a); SET.teams = true; } })),
];
export const ruleRows = (h: MenuHost): Row[] => [
  { t: () => 'Mode: ' + (SET.comp ? 'COMPETITIVE (4 lives, 5 min, no items)' : 'CASUAL') + '  ◀ ▶', lr: () => { SET.comp = !SET.comp; } },
  { t: () => 'Fighters: ' + SET.nP + '  ◀ ▶', lr: d => { SET.nP = clamp(SET.nP + d, 2, 8); SET.nH = Math.min(SET.nH, SET.nP); } },
  { t: () => 'Humans: ' + SET.nH + '  (CPU: ' + (SET.nP - SET.nH) + ')  ◀ ▶', lr: d => { SET.nH = clamp(SET.nH + d, 0, SET.nP); } },
  { t: () => 'CPU level: ' + SET.cpuLv + (SET.cpuLv === 9 ? ' (SUPERHUMAN)' : '') + '  ◀ ▶', lr: d => { SET.cpuLv = clamp(SET.cpuLv + d, 1, 9); } },
  { t: () => 'Lives: ' + STOCKS[SET.stI] + '  ◀ ▶', lr: d => { SET.stI = clamp(SET.stI + d, 0, STOCKS.length - 1); } },
  { t: () => 'Timer: ' + (SET.timer ? SET.timer + ' min' : 'OFF') + '  ◀ ▶', lr: d => { SET.timer = (SET.timer + d + 100) % 100; } },
  { t: () => 'Map: ' + (allMaps()[SET.mapI] ?? MAPS[0]!).name + '  ◀ ▶', lr: d => { const n = allMaps().length; SET.mapI = ((SET.mapI | 0) + d + n) % n; } },
  { t: () => 'Items: ' + (SET.itemsOn ? 'ON' : 'OFF (card = Last Word)') + '  ◀ ▶', lr: () => { SET.itemsOn = !SET.itemsOn; } },
  { t: () => 'Cards at once: ' + SET.maxC + '  ◀ ▶', lr: d => { SET.maxC = clamp(SET.maxC + d, 1, 16); } },
  { t: () => 'Teams: ' + teamTxt(SET.nP) + '  (Enter: edit)', lr: () => { SET.teams = !SET.teams; }, f: () => h.open('TEAMS', teamRows) },
  { t: () => 'Tempo: ' + SET.nerv + '/10 ' + (SET.nerv < 4 ? '(calm)' : SET.nerv < 8 ? '(relaxed)' : '(frantic)') + '  ◀ ▶', lr: d => { SET.nerv = clamp(SET.nerv + d, 0, 10); } },
];
/** Volumes + per-screen custom music (track lists arrive with the music port: 0 tracks until then). */
export const soundRows = (h?: Pick<MenuHost, 'soon'>): Row[] => [
  ...([['Master volume', 'master'], ['Sound effects', 'sfx'], ['Music', 'music']] as const).map(([n, k]) => ({ t: () => n + ': ' + Math.round(SET.vols[k] * 100) + '%  ◀ ▶', lr: (d: number) => { SET.vols[k] = clamp(Math.round(SET.vols[k] * 10 + d) / 10, 0, 1); } })),
  ...['Menu', 'Combat', 'Training', 'Results'].map(n => ({ t: () => 'Music · ' + n + ': 0 track(s)…', f: () => h?.soon('MUSIC · ' + n.toUpperCase()) })),
];
export const optionRows = (h: MenuHost): Row[] => [
  { t: () => 'Effects: ' + (SET.fxOff ? 'OFF (epilepsy safe)' : SET.fxLow ? 'REDUCED (sensitive)' : 'FULL') + '  ◀ ▶', lr: d => { const v = ((SET.fxOff ? 2 : SET.fxLow ? 1 : 0) + ((d | 0) < 0 ? 2 : 1)) % 3; SET.fxLow = v > 0; SET.fxOff = v === 2; } },
  { t: () => 'Error report file: ' + (SET.errdl ? 'ON (downloads a .json when a bug happens)' : 'OFF') + '  ◀ ▶', lr: () => { SET.errdl = SET.errdl ? 0 : 1; }, f: () => { SET.errdl = SET.errdl ? 0 : 1; } },
  { t: () => 'Full screen: ' + (h.fullscreen() ? 'ON' : 'OFF') + '  (Enter)', f: () => h.toggleFullscreen() },
  { t: () => 'Motion: ' + ['AUTO', 'SMOOTH', 'STRICT 60'][SET.motion] + '  ◀ ▶', lr: d => { SET.motion = (SET.motion + (d > 0 ? 1 : 2)) % 3; } },
  { t: () => 'Screen shake: ' + Math.round(SET.acc.shk * 100) + '%  ◀ ▶', lr: d => { SET.acc.shk = clamp(Math.round((SET.acc.shk + (d > 0 ? 0.25 : -0.25)) * 100) / 100, 0, 1.5); } },
  { t: () => 'Interface size: ' + Math.round(SET.acc.ui * 100) + '%  ◀ ▶', lr: d => { SET.acc.ui = clamp(Math.round((SET.acc.ui + (d > 0 ? 0.1 : -0.1)) * 10) / 10, 0.7, 1.5); } },
  { t: () => 'Color-blind marks: ' + (SET.acc.cb ? 'ON ▲■●◆' : 'OFF') + '  ◀ ▶', lr: () => { SET.acc.cb ^= 1; } },
  { t: () => 'Sound…', f: () => h.open('SOUND', () => soundRows(h)) },
  { t: () => 'Records…', f: () => h.soon('RECORDS') },
  { t: () => 'Profiles…', f: () => h.soon('PROFILES') },
  { t: () => 'Controls', f: () => h.controls() },
  { t: () => 'Title screen', f: () => h.title() },
];
export const helpRows = (h: MenuHost): Row[] => [{ t: () => 'How to play (tutorial)', f: () => h.tutorial() }, { t: () => 'Guide', f: () => h.guide() }];
