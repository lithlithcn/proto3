import type { UiCtx } from './core';
import { LABELS, uiTrans } from './trans';
import { TITLE, drawSoundLock, drawTitle, titleShake } from './screens/title/title';
import { HUB, UIHUB, drawHub, hubGo, hubMove, type HubHost, type HubKey } from './screens/hub/hub';

/** UI router (legacy `mode` + the render()/nav()/onKey() wrapper chains, flattened). 'game' is drawn by the render pack. */
export type Mode = 'title' | 'menu' | 'game';
export type NavEv = 'up' | 'down' | 'left' | 'right' | 'ok' | 'back' | 'reset' | 'tabL' | 'tabR' | 'start' | 'sel';
export interface UiHost {
  sfx(n: string, v?: number, r?: number): void; audioLocked(): boolean; nowMs(): number;
  /** width of the music sidebar (0 = hidden) */ sb: number; touch: boolean; music: boolean;
  /** hub tile chosen (fight/online/... ) — the shell starts the match or opens the screen */ open(k: HubKey): void;
}
export const APP = { mode: 'title' as Mode };

const titleGo = (h: UiHost): void => { if (APP.mode !== 'title') return; if (h.audioLocked()) { TITLE.agn = h.nowMs(); return; } APP.mode = 'menu'; h.sfx('titleclick', 1); };
const hubHost = (h: UiHost): HubHost => ({ sb: h.sb, touch: h.touch, music: h.music, audioLocked: h.audioLocked(), sfx: h.sfx, go: h.open, pic() {}, nick() {} });

/** Draws the current screen (not 'game'). Returns false when the caller must draw the fight. */
export function renderUi(u: UiCtx, h: UiHost): boolean {
  if (APP.mode === 'game') return false;
  const { c } = u; c.setTransform(1, 0, 0, 1, 0, 0);
  if (APP.mode === 'title') drawTitle(u, () => titleGo(h));
  else { c.fillStyle = '#000'; c.fillRect(0, 0, u.W, u.H); drawHub(u, hubHost(h)); }
  uiTrans(u, APP.mode, LABELS[APP.mode] ?? '');
  if (APP.mode === 'title' && h.audioLocked()) drawSoundLock(u, h.nowMs());
  return true;
}
/** Menu navigation event (keyboard / pad / touch all map to these). */
export function nav(ev: NavEv, h: UiHost, now: number): void {
  if (APP.mode === 'title') { if (ev === 'up' || ev === 'down' || ev === 'left' || ev === 'right' || ev === 'tabL' || ev === 'tabR') { titleShake(0.7); h.sfx('se_select00', 0.35, 0.8 + Math.random() * 0.4); return; } titleGo(h); return; }
  if (APP.mode === 'menu') {
    const hh = hubHost(h);
    if (ev === 'up') hubMove(hh, now, 0, -1); else if (ev === 'down') hubMove(hh, now, 0, 1); else if (ev === 'left') hubMove(hh, now, -1, 0); else if (ev === 'right') hubMove(hh, now, 1, 0);
    else if (ev === 'ok') hubGo(hh); else if (ev === 'back') { APP.mode = 'title'; TITLE.t0 = now; h.sfx('cancel00'); }
    else if (ev === 'tabL' || ev === 'tabR') { UIHUB.sel = (UIHUB.sel + (ev === 'tabL' ? HUB.length - 1 : 1)) % HUB.length; h.sfx('se_select00', 0.6); }
    else if (ev === 'start' || ev === 'sel') { h.sfx('ok00'); h.open('fight'); } // pad Start: quick fight
  }
}
const KEYEV: Record<string, NavEv> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', Enter: 'ok', Space: 'ok', Escape: 'back', Backspace: 'reset', PageUp: 'tabL', PageDown: 'tabR', KeyQ: 'tabL', KeyE: 'tabR', Delete: 'reset', Digit1: 'ok', Numpad1: 'ok' };
/** Raw key (KeyboardEvent.code) outside the fight. */
export function onKey(code: string, h: UiHost, now: number): void {
  if (APP.mode === 'title') { if (/^(Arrow|Key[WASDQE]$)/.test(code)) { nav(({ ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' } as Record<string, NavEv>)[code] ?? 'left', h, now); return; } if (!/^F\d+$/.test(code)) titleGo(h); return; }
  const ev = KEYEV[code]; if (ev) nav(ev, h, now);
}
