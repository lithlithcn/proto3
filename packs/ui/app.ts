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
import { SET, pickPicture, saveNick, saveStats } from './settings';
import { SUB, drawSub, type Row } from './screens/sub/draw';
import { helpRows, optionRows, ruleRows, type MenuHost } from './screens/sub/menus';
import { clamp } from './core';
import { TXI, drawTXI, txtInput } from './txi';
import { profOf } from './profiles';
import { BIND, bindKey, bindPadTick, bindsNav, drawBinds, type BindsHost } from './screens/binds/binds';
import { GUIDE, drawInfo, infoNav } from './screens/info/info';
import { IM, drawItems, itemsNav, type CatItem, type ItemsHost } from './screens/items/items';

/** UI router (legacy `mode` + the render()/nav()/onKey() wrapper chains, flattened). 'game' is drawn by the render pack. */
export type Mode = 'title' | 'menu' | 'css' | 'sub' | 'items' | 'binds' | 'info' | 'game';
export type NavEv = 'up' | 'down' | 'left' | 'right' | 'ok' | 'back' | 'reset' | 'tabL' | 'tabR' | 'start' | 'sel';
export interface UiHost {
  sfx(n: string, v?: number, r?: number): void; audioLocked(): boolean; nowMs(): number;
  /** width of the music sidebar (0 = hidden) */ sb: number; touch: boolean; music: boolean;
  /** hub tile chosen other than FIGHT (online, training...) — the shell opens it */ open(k: HubKey): void;
  roster: RosterEntry[]; /** item catalog in legacy order */ items: CatItem[]; keys: Keys; pads(): Gamepad[]; /** frame counter the character art animates with */ frame(): number;
  /** start the match: device per human, character per fighter (-1 = default) */ start(devs: string[], chars: number[]): void;
  /** live arena behind the select (empty = stop) */ playground(devs: string[], chars: number[]): void; drawPlayground(c: CanvasRenderingContext2D): void;
  /** same line-up, new match */ restart(): void; /** persist the settings */ save(): void; fullscreen(): boolean; toggleFullscreen(): void;
}
export const APP = { mode: 'title' as Mode, paused: false };

const titleGo = (h: UiHost): void => { if (APP.mode !== 'title') return; if (h.audioLocked()) { TITLE.agn = h.nowMs(); return; } APP.mode = 'menu'; h.sfx('titleclick', 1); };
const hubHost = (h: UiHost, now: number): HubHost => ({ sb: h.sb, touch: h.touch, music: h.music, audioLocked: h.audioLocked(), sfx: h.sfx, go: k => { if (k === 'fight') { APP.mode = 'css'; cssOpen(cssHost(h), now); } else if (k === 'rules') openSub('RULES', () => ruleRows(menuHost(h))); else if (k === 'opt') openSub('OPTIONS', () => optionRows(menuHost(h), h.save)); else if (k === 'help') openSub('HOW TO PLAY', () => helpRows(menuHost(h))); else if (k === 'items') { APP.mode = 'items'; IM.sel = 0; } else soon(({ online: 'ONLINE', train: 'TRAINING', maps: 'MAP MAKER' } as Record<string, string>)[k] ?? k); }, pic: () => pickPicture(() => h.sfx('ok00'), () => h.sfx('cancel00')), nick: () => txtInput('YOUR NAME (seen by everyone)', SET.nick || profOf(0)?.n || 'Player', 12, v => { if (v) saveNick(v); }, { touch: h.touch, sfx: h.sfx }) });
const cssHost = (h: UiHost): CssHost => ({ roster: h.roster, keys: h.keys, pads: h.pads(), touch: h.touch, sfx: h.sfx, go: (d, c) => { APP.mode = 'game'; h.start(d, c); }, back: () => { APP.mode = 'menu'; h.playground([], []); }, playground: h.playground });

/** Sub-menu stack (legacy openSub: nested sub-menus remember where you were). */
function openSub(title: string, rows: () => Row[]): void { if (APP.mode === 'sub') SUB.stack.push([SUB.rows!, SUB.title, SUB.sel]); else SUB.stack = []; SUB.rows = rows; SUB.title = title; SUB.sel = 0; APP.mode = 'sub'; }
/** Screens still being ported open an honest placeholder instead of a dead button. */
const soon = (what: string): void => openSub(what, () => [{ t: () => 'Coming soon: this screen is being ported', f: () => {} }]);
const itemsHost = (h: UiHost, now: number): ItemsHost => ({ items: h.items, frame: h.frame(), sfx: h.sfx, nav: ev => nav(ev, h, now), test: () => soon('TRAINING') });
const bindsHost = (h: UiHost, now: number): BindsHost => ({ keys: h.keys, pads: h.pads(), mouseOn: SET.mouse, sfx: h.sfx, nav: ev => nav(ev, h, now), togMouse: () => { SET.mouse = !SET.mouse; h.save(); h.sfx('se_select00', 0.6); }, save: h.save });
const menuHost = (h: UiHost): MenuHost => ({ itemName: k => h.items.find(i => i.k === k)?.name, text: (t, v, m, cb) => txtInput(t, v, m, cb, { touch: h.touch, sfx: h.sfx }), open: openSub, title: () => { APP.mode = 'title'; TITLE.t0 = h.nowMs() / 1000; }, controls: () => { APP.mode = 'binds'; BIND.wait = false; }, guide: () => { APP.mode = 'info'; GUIDE.p = 0; GUIDE.scr = 0; }, tutorial: () => soon('HOW TO PLAY (TUTORIAL)'), fullscreen: h.fullscreen, toggleFullscreen: h.toggleFullscreen, soon });
/** Draws the current screen (not 'game'). Returns false when the caller must draw the fight. */
export function renderUi(u: UiCtx, h: UiHost): boolean {
  if (APP.mode === 'game') return false;
  const { c } = u; c.setTransform(1, 0, 0, 1, 0, 0);
  if (APP.mode === 'title') drawTitle(u, () => titleGo(h));
  else if (APP.mode === 'css') {
    const ch = cssHost(h); if (!cssTick(ch, u.now)) return renderUi(u, h); // the screen was left this frame
    if (CS2.on) { h.drawPlayground(c); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; } else { c.globalAlpha = 1; c.fillStyle = '#000'; c.fillRect(0, 0, u.W, u.H); }
    drawCss(u, ch, h.frame());
  } else if (APP.mode === 'info') { c.fillStyle = '#000'; c.fillRect(0, 0, u.W, u.H); drawInfo(u, { nav: ev => nav(ev, h, u.now), test: () => soon('TRAINING'), items: h.items, frame: h.frame() }, u.now); }
  else if (APP.mode === 'binds') { const bh = bindsHost(h, u.now); bindPadTick(bh); c.fillStyle = '#000'; c.fillRect(0, 0, u.W, u.H); drawBinds(u, bh); }
  else if (APP.mode === 'items') { c.fillStyle = '#000'; c.fillRect(0, 0, u.W, u.H); drawItems(u, itemsHost(h, u.now)); }
  else if (APP.mode === 'sub') { c.fillStyle = '#000'; c.fillRect(0, 0, u.W, u.H); drawSub(u, ev => nav(ev, h, u.now), h.sfx, h.frame()); }
  else { c.fillStyle = '#000'; c.fillRect(0, 0, u.W, u.H); drawHub(u, hubHost(h, u.now)); }
  uiTrans(u, APP.mode === 'sub' ? 'sub:' + SUB.title : APP.mode, APP.mode === 'sub' ? SUB.title.toUpperCase() : LABELS[APP.mode] ?? '');
  if (APP.mode === 'title' && h.audioLocked()) drawSoundLock(u, h.nowMs());
  drawTXI(u);
  return true;
}
/** Menu navigation event (keyboard / pad / touch all map to these). */
export function nav(ev: NavEv, h: UiHost, now: number): void {
  if (TXI) return; // the text box owns the keys
  if (APP.mode === 'title') { if (ev === 'up' || ev === 'down' || ev === 'left' || ev === 'right' || ev === 'tabL' || ev === 'tabR') { titleShake(0.7); h.sfx('se_select00', 0.35, 0.8 + Math.random() * 0.4); return; } titleGo(h); return; }
  if (APP.mode === 'css') return; // character select reads the devices itself (cssTick)
  if (APP.mode === 'info') { if (infoNav(ev, h.sfx, h.items)) APP.mode = SUB.rows ? 'sub' : 'menu'; return; }
  if (APP.mode === 'binds') { if (bindsNav(ev, bindsHost(h, now))) APP.mode = SUB.rows ? 'sub' : 'menu'; return; }
  if (APP.mode === 'items') { if (itemsNav(ev, itemsHost(h, now))) APP.mode = 'menu'; h.save(); return; }
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
  if (APP.mode === 'binds' && bindKey(code, bindsHost(h, now))) return;
  if (APP.mode === 'items' && code === 'KeyT') { nav('start', h, now); return; }
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
  drawIntro(u, v); drawLastStock(u, v, P); drawTXI(u);
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
/** Pad menu event (legacy padEv): Start = quick fight on the hub / pause or rematch in a fight; otherwise the menu nav. */
export function padEv(k: string, h: UiHost, now: number, v: FightView | null): void {
  if (APP.mode === 'binds' && BIND.wait) return;
  if (APP.mode === 'css') return; // the character select reads every pad itself
  if (k === 'start' && APP.mode === 'items') { nav('start', h, now); return; }
  if (APP.mode === 'game' && v) {
    if (k === 'start' || k === 'sel') { if (v.winner >= 0) { if (v.winT >= 100) h.restart(); } else { APP.paused = !APP.paused; if (APP.paused) PZ.why = ''; h.sfx(APP.paused ? 'cancel00' : 'ok00'); } return; }
    if (APP.paused) { fightKey(({ up: 'ArrowUp', down: 'ArrowDown', ok: 'Enter', back: 'Escape' } as Record<string, string>)[k] ?? '', h, v); return; }
    if (v.winner >= 0 && v.winT >= 100) { if (k === 'ok') h.restart(); else if (k === 'back') { APP.mode = 'menu'; h.sfx('cancel00'); } }
    return;
  }
  nav(k as NavEv, h, now);
}
