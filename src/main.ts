import { FixedLoop, World, newInput, setInput } from '@kernel';
import type { CharacterDef, CombatState } from '@pack/combat/api';
import { drawHud } from '@pack/render/hud';
import { camStart, renderViews } from '@pack/render/view';
import { drawScreenL, drawScreenTopL, screenFilterL } from '@pack/render/ld/bind';
import { juiceOf } from '@pack/render/juice/state';
import { audioLocked, initAudio, playSounds, uiSound } from '@pack/audio/player';
import { APP, fightKey, onKey, renderFightUi, renderUi, type UiHost } from '@pack/ui/app';
import { PZ, type FightView } from '@pack/ui/screens/fight/overlays';
import type { Hot, RosterEntry, UiCtx } from '@pack/ui/core';
import { pads, readDev } from '@pack/ui/input/devices';
import { loadBinds } from '@pack/ui/input/binds';
import { SET, STOCKS, loadSettings, saveSettings } from '@pack/ui/settings';
import { builtinPacks } from './packs';

/** App shell: menus (packs/ui) until FIGHT!, then the match. Fight keys: P1 WASD + JKL..., P2 arrows + numpad (bindings screen = lot 3). */
const canvas = document.getElementById('c') as HTMLCanvasElement, c = canvas.getContext('2d')!, loop = new FixedLoop();
loadSettings(localStorage); loadBinds(localStorage); initAudio(import.meta.env.BASE_URL);
type Cfg = { seed: number; players: number; world: Record<string, unknown> };
let lastDevs: string[] = [], lastChars: number[] = [];
let cfg: Cfg = { seed: 0, players: 2, world: {} }, world: World | null = null, rec: number[][] = [], devs: string[] = [];
/** Characters in roster order (character content of the loaded packs). */
const roster: RosterEntry[] = builtinPacks.flatMap(p => Object.entries((p.content?.['character'] ?? {}) as Record<string, CharacterDef>).map(([k, d]) => ({ id: `${p.id}:${k}`, key: k, name: d.name, col: d.color, role: d.role ?? '', desc: d.desc ?? '', o: d.order })))
  .sort((a, b) => a.o - b.o).map(({ o, ...r }) => (void o, r));
const mkWorld = (c: Cfg): World => { const w = new World({ packs: builtinPacks.filter(p => p.id !== 'sandbox' && p.id !== 'ui'), ...c }); camStart(w); return w; };
/** Match from the menu rules: humans (one device each) first, then CPUs (CPU AI = lot 4: they stand still for now). */
function newMatch(d: string[], chars: number[]): void {
  lastDevs = d; lastChars = chars;
  const seed = (Math.random() * 1e9) | 0, N = roster.length, n = Math.max(SET.nP, d.length); // sim-allow(boot-time seed)
  const players = Array.from({ length: n }, (_, i) => ({ char: roster[chars[i]! >= 0 ? chars[i]! : (seed + i * 3) % N]!.id, cpu: i >= d.length, ...(SET.teams ? { team: SET.teamA[i] } : {}) }));
  cfg = { seed, players: n, world: { players, stocks: STOCKS[SET.stI], items: SET.itemsOn, maxCards: SET.maxC } };
  world = mkWorld(cfg); rec = []; devs = d; pg = null; saveSettings(localStorage);
}
/** Character-select playground: the humans who pressed Parry fight behind the menu (99 stocks, no items). */
let pg: { w: World; devs: string[] } | null = null;
function playground(d: string[], chars: number[]): void {
  pg = d.length ? { w: mkWorld({ seed: 1, players: d.length, world: { players: chars.map(c => ({ char: roster[c]!.id })), stocks: 99, items: false } }), devs: d } : null;
}
const step = (w: World, ds: string[]): void => {
  const f = newInput(w.players), ps = pads();
  for (let p = 0; p < w.players; p++) { const dv = ds[p]; if (!dv) continue; const I = readDev(dv, keys, ps, w.frame); setInput(f, p, Math.round(I.x * 127), Math.round(I.y * 127), I.b); }
  if (w === world) rec.push(Array.from(f)); w.step(f);
};
const fview = (w: World): FightView => { const S = w.slice<CombatState>('combat'); return { f: S.gf, winner: S.winner, winT: S.winT, teams: !!S.teams, teamA: S.team, intro: true }; };
const drawFight = (w: World, W: number, H: number): void => {
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
  const S = w.slice<CombatState>('combat');
  renderViews(c, w, S, W, H); drawScreenL(c, w, S, W, H);
  drawHud(c, w, S, W, H, performance.now() / 1000); drawScreenTopL(c, w, S, W, H);
  const j = juiceOf(w); playSounds(j.SND.splice(0), j.stop.splice(0), S.tstop > 0, j.endk); // juice was synced by renderViews
};
/** Held keys + keys tapped since the last frame (legacy tapQ: a press shorter than a frame still counts once). */
const held = new Set<string>(), tap = new Set<string>(), keys = { has: (k: string): boolean => held.has(k) || tap.has(k) }, now = (): number => performance.now() / 1000;
const host: UiHost = {
  sfx: uiSound, audioLocked, nowMs: () => performance.now(), sb: 0, touch: false, music: false, open() { /* online, training, rules... arrive screen by screen */ },
  restart: () => newMatch(lastDevs, lastChars), roster, keys, pads, frame: () => world?.frame ?? 0, start: newMatch, playground, drawPlayground: cc => { if (pg) { void cc; drawFight(pg.w, canvas.width, canvas.height); } },
};
addEventListener('keydown', e => {
  held.add(e.code); tap.add(e.code); if (/^Arrow|^Space$|^Tab$|^Backspace$/.test(e.code)) e.preventDefault();
  if (e.repeat) return;
  if (APP.mode === 'title' && audioLocked()) return; // first gesture only unlocks the sound (legacy veil); runs before the audio unlock listener
  if (APP.mode === 'game') { if (world) fightKey(e.code, host, fview(world)); return; }
  onKey(e.code, host, now());
}, true);
addEventListener('keyup', e => held.delete(e.code));
/** Auto-pause (legacy autoPause): window blur, hidden tab, unplugged pad. */
const autoPause = (why: string): void => { if (APP.mode === 'game' && world && world.slice<CombatState>('combat').winner < 0 && !APP.paused) { APP.paused = true; PZ.why = why; uiSound('cancel00'); } };
addEventListener('blur', () => { held.clear(); autoPause('PAUSED: THE WINDOW LOST FOCUS'); });
document.addEventListener('visibilitychange', () => { if (document.hidden) autoPause('PAUSED WHILE THE GAME WAS IN THE BACKGROUND'); });
addEventListener('gamepaddisconnected', () => autoPause('CONTROLLER DISCONNECTED — plug it back in, then resume'));
addEventListener('gamepadconnected', () => { if (PZ.why.startsWith('CONTROLLER')) PZ.why = 'CONTROLLER CONNECTED — press A to resume'; });
/** Pointer: hover / click the hot regions of the screen drawn last frame (legacy `hot`). */
let hot: Hot[] = [], mx = 0, my = 0;
const at = (x: number, y: number): Hot | undefined => hot.find(r => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; if (APP.mode !== 'game' || APP.paused) at(mx, my)?.hover(); });
addEventListener('pointerdown', e => { mx = e.clientX; my = e.clientY; if (APP.mode === 'title' && audioLocked()) return; if (APP.mode !== 'game' || APP.paused) at(mx, my)?.click(); }, true);
/** F8: downloads the match (config + every input frame + build id) so a bug can be replayed exactly. */
addEventListener('keydown', e => { if (e.code !== 'F8' || !world) return; e.preventDefault(); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify({ v: 1, build: import.meta.env.MODE, cfg, frames: rec.length, inputs: rec })], { type: 'application/json' })); a.download = `proto3-match-${cfg.seed}-f${rec.length}.json`; a.click(); });

let last = performance.now();
function frame(t: number): void {
  const n = loop.advance(t - last); last = t;
  if (canvas.width !== innerWidth || canvas.height !== innerHeight) { canvas.width = innerWidth; canvas.height = innerHeight; }
  const W = canvas.width, H = canvas.height;
  const u: UiCtx = { c, W, H, now: t / 1000, mx, my, fxLow: SET.fxLow, hot: [], acc: '#ff3355' };
  if (APP.mode === 'css' && pg) for (let i = 0; i < n; i++) step(pg.w, pg.devs); // playground keeps running behind the select
  if (renderUi(u, host)) { hot = u.hot; tap.clear(); if (canvas.style.filter) canvas.style.filter = ''; requestAnimationFrame(frame); return; }
  const w = world!;
  if (!APP.paused) for (let i = 0; i < n; i++) { step(w, devs); tap.clear(); }
  drawFight(w, W, H); renderFightUi(u, host, fview(w)); hot = u.hot;
  const fl = screenFilterL(c, w, w.slice<CombatState>('combat'), W, H); if (canvas.style.filter !== fl) canvas.style.filter = fl;
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
