import type { UiCtx } from './core';
import { LABELS, uiTrans } from './trans';
import { TITLE, drawSoundLock, drawTitle, titleShake } from './screens/title/title';
import { HUB, UIHUB, drawHub, hubGo, hubMove, type HubHost, type HubKey } from './screens/hub/hub';
import { CS2, cssOpen, cssTick, type CssHost } from './screens/css/state';
import { drawCss } from './screens/css/draw';
import type { RosterEntry } from './core';
import type { Keys } from './input/devices';
import { PZ, drawGameEnd, drawIntro, drawLastStock, drawPause, lsCheck, type FightView, type PauseItem } from './screens/fight/overlays';
import { drawResults, type ResP } from './screens/fight/results';
import { SET, saveStats } from './settings';
import { SUB, drawSub, type Row } from './screens/sub/draw';
import { helpRows, optionRows, ruleRows, type MenuHost } from './screens/sub/menus';
import { clamp } from './core';

/** UI router (legacy `mode` + the render()/nav()/onKey() wrapper chains, flattened). 'game' is drawn by the render pack. */
export type Mode = 'title' | 'menu' | 'css' | 'sub' | 'game';
export type NavEv = 'up' | 'down' | 'left' | 'right' | 'ok' | 'back' | 'reset' | 'tabL' | 'tabR' | 'start' | 'sel';
export interface UiHost {
  sfx(n: string, v?: number, r?: number): void; audioLocked(): boolean; nowMs(): number;
  /** width of the music sidebar (0 = hidden) */ sb: number; touch: boolean; music: boolean;
  /** hub tile chosen other than FIGHT (online, training...) — the shell opens it */ open(k: HubKey): void;
  roster: RosterEntry[]; keys: Keys; pads(): Gamepad[]; /** frame counter the character art animates with */ frame(): number;
  /** start the match: device per human, character per fighter (-1 = default) */ start(devs: string[], chars: number[]): void;
  /** live arena behind the select (empty = stop) */ playground(devs: string[], chars: number[]): void; drawPlayground(c: CanvasRenderingContext2D): void;
  /** same line-up, new match */ restart(): void; /** persist the settings */ save(): void; fullscreen(): boolean; toggleFullscreen(): void;
}
export const APP = { mode: 'title' as Mode, paused: false };

const titleGo = (h: UiHost): void => { if (APP.mode !== 'title') return; if (h.audioLocked()) { TITLE.agn = h.nowMs(); return; } APP.mode = 'menu'; h.sfx('titleclick', 1); };
const hubHost = (h: UiHost, now: number): HubHost => ({ sb: h.sb, touch: h.touch, music: h.music, audioLocked: h.audioLocked(), sfx: h.sfx, go: k => { if (k === 'fight') { APP.mode = 'css'; cssOpen(cssHost(h), now); } else if (k === 'rules') openSub('RULES', () => ruleRows(menuHost(h))); else if (k === 'opt') openSub('OPTIONS', () => optionRows(menuHost(h))); else if (k === 'help') openSub('HOW TO PLAY', () => helpRows(menuHost(h))); else soon(({ online: 'ONLINE', train: 'TRAINING', items: 'ITEMS', maps: 'MAP MAKER' } as Record<string, string>)[k] ?? k); }, pic() {}, nick() {} });
const cssHost = (h: UiHost): CssHost => ({ roster: h.roster, keys: h.keys, pads: h.pads(), touch: h.touch, sfx: h.sfx, go: (d, c) => { APP.mode = 'game'; h.start(d, c); }, back: () => { APP.mode = 'menu'; h.playground([], []); }, playground: h.playground });

/** Sub-menu stack (legacy openSub: nested sub-menus remember where you were). */
function openSub(title: string, rows: () => Row[]): void { if (APP.mode === 'sub') SUB.stack.push([SUB.rows!, SUB.title, SUB.sel]); else SUB.stack = []; SUB.rows = rows; SUB.title = title; SUB.sel = 0; APP.mode = 'sub'; }
/** Screens still being ported open an honest placeholder instead of a dead button. */
const soon = (what: string): void => openSub(what, () => [{ t: () => 'Coming soon: this screen is being ported', f: () => {} }]);
const menuHost = (h: UiHost): MenuHost => ({ open: openSub, title: () => { APP.mode = 'title'; TITLE.t0 = h.nowMs() / 1000; }, controls: () => soon('CONTROLS'), guide: () => soon('GUIDE'), tutorial: () => soon('HOW TO PLAY (TUTORIAL)'), fullscreen: h.fullscreen, toggleFullscreen: h.toggleFullscreen, soon });
/** Draws the current screen (not 'game'). Returns false when the caller must draw the fight. */
export function renderUi(u: UiCtx, h: UiHost): boolean {
  if (APP.mode === 'game') return false;
  const { c } = u; c.setTransform(1, 0, 0, 1, 0, 0);
  if (APP.mode === 'title') drawTitle(u, () => titleGo(h));
  else if (APP.mode === 'css') {
    const ch = cssHost(h); if (!cssTick(ch, u.now)) return renderUi(u, h); // the screen was left this frame
    if (CS2.on) { h.drawPlayground(c); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; } else { c.globalAlpha = 1; c.fillStyle = '#000'; c.fillRect(0, 0, u.W, u.H); }
    drawCss(u, ch, h.frame());
  } else if (APP.mode === 'sub') { c.fillStyle = '#000'; c.fillRect(0, 0, u.W, u.H); drawSub(u, ev => nav(ev, h, u.now), h.sfx); }
  else { c.fillStyle = '#000'; c.fillRect(0, 0, u.W, u.H); drawHub(u, hubHost(h, u.now)); }
  uiTrans(u, APP.mode === 'sub' ? 'sub:' + SUB.title : APP.mode, APP.mode === 'sub' ? SUB.title.toUpperCase() : LABELS[APP.mode] ?? '');
  if (APP.mode === 'title' && h.audioLocked()) drawSoundLock(u, h.nowMs());
  return true;
}
/** Menu navigation event (keyboard / pad / touch all map to these). */
export function nav(ev: NavEv, h: UiHost, now: number): void {
  if (APP.mode === 'title') { if (ev === 'up' || ev === 'down' || ev === 'left' || ev === 'right' || ev === 'tabL' || ev === 'tabR') { titleShake(0.7); h.sfx('se_select00', 0.35, 0.8 + Math.random() * 0.4); return; } titleGo(h); return; }
  if (APP.mode === 'css') return; // character select reads the devices itself (cssTick)
  if (APP.mode === 'sub') {
    const L = SUB.rows!(); SUB.sel = clamp(SUB.sel, 0, L.length - 1); const it = L[SUB.sel]!;
    if (ev === 'up' || ev === 'down') { SUB.sel = (SUB.sel + (ev === 'up' ? L.length - 1 : 1)) % L.length; h.sfx('se_select00', 0.6); }
    if ((ev === 'left' || ev === 'right') && it.lr) { it.lr(ev === 'left' ? -1 : 1); h.sfx('changemenu', 0.8); h.save(); }
    if (ev === 'ok') { h.sfx('ok00'); if (it.f) it.f(); else if (it.lr) it.lr(1); h.save(); }
    if (ev === 'reset' && it.del) { it.del(); h.sfx('cancel00'); h.save(); }
    if (ev === 'back') { const q = SUB.stack.pop(); if (q) [SUB.rows, SUB.title, SUB.sel] = q; else APP.mode = 'menu'; h.sfx('cancel00'); }
    return;
  }
  if (APP.mode === 'menu') {
    const hh = hubHost(h, now);
    if (ev === 'up') hubMove(hh, now, 0, -1); else if (ev === 'down') hubMove(hh, now, 0, 1); else if (ev === 'left') hubMove(hh, now, -1, 0); else if (ev === 'right') hubMove(hh, now, 1, 0);
    else if (ev === 'ok') hubGo(hh); else if (ev === 'back') { APP.mode = 'title'; TITLE.t0 = now; h.sfx('cancel00'); }
    else if (ev === 'tabL' || ev === 'tabR') { UIHUB.sel = (UIHUB.sel + (ev === 'tabL' ? HUB.length - 1 : 1)) % HUB.length; h.sfx('se_select00', 0.6); }
    else if (ev === 'start' || ev === 'sel') { h.sfx('ok00'); hh.go('fight'); } // pad Start: fight
  }
}
const KEYEV: Record<string, NavEv> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', Enter: 'ok', Space: 'ok', Escape: 'back', Backspace: 'reset', PageUp: 'tabL', PageDown: 'tabR', KeyQ: 'tabL', KeyE: 'tabR', Delete: 'reset', Digit1: 'ok', Numpad1: 'ok' };
/** Raw key (KeyboardEvent.code) outside the fight. */
export function onKey(code: string, h: UiHost, now: number): void {
  if (APP.mode === 'title') { if (/^(Arrow|Key[WASDQE]$)/.test(code)) { nav(({ ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' } as Record<string, NavEv>)[code] ?? 'left', h, now); return; } if (!/^F\d+$/.test(code)) titleGo(h); return; }
  const ev = KEYEV[code]; if (ev) nav(ev, h, now);
}

/** Pause menu entries (legacy pzItems; SOUND… joins with the sound sub-menu). */
const pauseItems = (h: UiHost): PauseItem[] => [
  { t: 'RESUME', f: () => { APP.paused = false; h.sfx('ok00'); } },
  { t: 'RESTART MATCH', f: () => { APP.paused = false; h.restart(); h.sfx('ok00'); } },
  { t: PZ.cf ? 'QUIT? PRESS AGAIN' : 'QUIT TO MENU', f: () => { if (!PZ.cf) { PZ.cf = 1; h.sfx('cancel00'); return; } APP.paused = false; APP.mode = 'menu'; h.sfx('cancel00'); } },
];
/** Overlays drawn over the fight (after the fight HUD), legacy order: pause, GAME! / results, intro, last stock. `tlg` = match-flow samples. */
export function renderFightUi(u: UiCtx, h: UiHost, v: FightView, P: ResP[], tlg: (number[] | undefined)[], matchId: number, counts: boolean): void {
  u.hot.length = 0;
  if (lsCheck(u.now, matchId, v.f, v.winner, P, counts)) { h.sfx('critical_hit', 1); h.sfx('alert', 0.8); h.sfx('se_enep01', 0.6); }
  if (APP.paused) drawPause(u, pauseItems(h)); else PZ.t0 = 0;
  if (v.winner >= 0) {
    if (v.winT < 100) drawGameEnd(u, v);
    else {
      if (v.winT === 101 && counts) { const me = P.find(p => !p.cpu); if (me) { SET.st.m++; SET.st.k += me.kos; if (v.teams ? v.teamA[me.id] === v.teamA[v.winner] : me.id === v.winner) SET.st.w++; saveStats(); } }
      drawResults(u, { t: v.winT - 100, winner: v.winner, teams: v.teams, teamA: v.teamA, P, tlg, touch: h.touch }, h.frame());
    }
  }
  drawIntro(u, v); drawLastStock(u, v, P);
}
/** Keys during a fight: Esc = pause, pause menu navigation, M = quit (legacy onKey game branch + PZ nav). Returns true when consumed. */
export function fightKey(code: string, h: UiHost, v: FightView): boolean {
  if (APP.paused) {
    const L = pauseItems(h); PZ.sel = Math.max(0, Math.min(L.length - 1, PZ.sel)); const ev = KEYEV[code];
    if (code === 'KeyM') { APP.paused = false; APP.mode = 'menu'; h.sfx('cancel00'); return true; }
    if (ev === 'up' || ev === 'down') { PZ.sel = (PZ.sel + (ev === 'up' ? L.length - 1 : 1)) % L.length; PZ.cf = 0; h.sfx('se_select00', 0.6); }
    else if (ev === 'ok') L[PZ.sel]!.f(); else if (ev === 'back') { APP.paused = false; h.sfx('ok00'); }
    return true;
  }
  if (code === 'Escape' && v.winner < 0) { APP.paused = true; PZ.why = ''; h.sfx('cancel00'); return true; }
  if (v.winner >= 0 && v.winT >= 100 && (code === 'Enter' || code === 'KeyR')) { h.restart(); return true; }
  if (v.winner >= 0 && code === 'KeyM') { APP.mode = 'menu'; h.sfx('cancel00'); return true; }
  return false;
}
