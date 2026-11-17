import { BTN, FixedLoop, World, newInput, setInput } from '@kernel';
import type { CombatState } from '@pack/combat/api';
import { drawHud } from '@pack/render/hud';
import { camStart, renderViews } from '@pack/render/view';
import { drawScreenL, drawScreenTopL, screenFilterL } from '@pack/render/ld/bind';
import { juiceOf } from '@pack/render/juice/state';
import { audioLocked, initAudio, playSounds, uiSound } from '@pack/audio/player';
import { APP, onKey, renderUi, type UiHost } from '@pack/ui/app';
import type { Hot, UiCtx } from '@pack/ui/core';
import { SET, loadSettings } from '@pack/ui/settings';
import { builtinPacks } from './packs';

/** App shell: menus (packs/ui) until FIGHT!, then the match. Fight keys: P1 WASD + JKL..., P2 arrows + numpad (bindings screen = lot 3). */
const canvas = document.getElementById('c') as HTMLCanvasElement, c = canvas.getContext('2d')!, loop = new FixedLoop();
loadSettings(localStorage); initAudio(import.meta.env.BASE_URL);
let cfg = { seed: 0, players: 2, world: { players: [{ char: 'touhou:reimu' }, { char: 'touhou:marisa' }] } }, world: World | null = null, rec: number[][] = [];
function newMatch(): void {
  cfg = { ...cfg, seed: (Math.random() * 1e9) | 0 }; // sim-allow(boot-time seed)
  world = new World({ packs: builtinPacks.filter(p => p.id !== 'sandbox'), ...cfg }); camStart(world); rec = []; APP.mode = 'game';
}
const host: UiHost = { sfx: uiSound, audioLocked, nowMs: () => performance.now(), sb: 0, touch: false, music: false, open(k) { if (k === 'fight') newMatch(); } };
const KB = [
  { up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD', shot: 'KeyJ', heavy: 'KeyK', melee: 'KeyL', dash: 'Space', parry: 'KeyI', burst: 'KeyU', spell: 'KeyO', focus: 'ShiftLeft', prev: 'KeyE', next: 'KeyR' },
  { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', shot: 'Numpad1', heavy: 'Numpad2', melee: 'Numpad3', dash: 'Numpad0', parry: 'Numpad5', burst: 'Numpad7', spell: 'Numpad6', focus: 'Numpad4', prev: 'Numpad8', next: 'Numpad9' },
] as const;
const keys = new Set<string>(), now = (): number => performance.now() / 1000;
addEventListener('keydown', e => {
  keys.add(e.code); if (/^Arrow|^Space$|^Tab$|^Backspace$/.test(e.code)) e.preventDefault();
  if (e.repeat) return;
  if (APP.mode === 'title' && audioLocked()) return; // first gesture only unlocks the sound (legacy veil); runs before the audio unlock listener
  if (APP.mode === 'game') { if (e.code === 'Escape') APP.mode = 'menu'; return; } // pause screen comes with the pause port
  onKey(e.code, host, now());
}, true);
addEventListener('keyup', e => keys.delete(e.code));
addEventListener('blur', () => keys.clear());
/** Pointer: hover / click the hot regions of the screen drawn last frame (legacy `hot`). */
let hot: Hot[] = [], mx = 0, my = 0;
const at = (x: number, y: number): Hot | undefined => hot.find(r => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; if (APP.mode !== 'game') at(mx, my)?.hover(); });
addEventListener('pointerdown', e => { mx = e.clientX; my = e.clientY; if (APP.mode === 'title' && audioLocked()) return; if (APP.mode !== 'game') at(mx, my)?.click(); }, true);
/** F8: downloads the match (config + every input frame + build id) so a bug can be replayed exactly. */
addEventListener('keydown', e => { if (e.code !== 'F8' || !world) return; e.preventDefault(); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify({ v: 1, build: import.meta.env.MODE, cfg, frames: rec.length, inputs: rec })], { type: 'application/json' })); a.download = `proto3-match-${cfg.seed}-f${rec.length}.json`; a.click(); });

let last = performance.now();
function frame(t: number): void {
  const n = loop.advance(t - last); last = t;
  if (canvas.width !== innerWidth || canvas.height !== innerHeight) { canvas.width = innerWidth; canvas.height = innerHeight; }
  const W = canvas.width, H = canvas.height;
  const u: UiCtx = { c, W, H, now: t / 1000, mx, my, fxLow: SET.fxLow, hot: [], acc: '#ff3355' };
  if (renderUi(u, host)) { hot = u.hot; if (canvas.style.filter) canvas.style.filter = ''; requestAnimationFrame(frame); return; }
  const w = world!;
  for (let i = 0; i < n; i++) {
    const f = newInput(2);
    KB.forEach((k, p) => {
      let b = 0; for (const name of ['shot', 'heavy', 'melee', 'dash', 'parry', 'burst', 'spell', 'focus', 'prev', 'next'] as const) if (keys.has(k[name])) b |= BTN[name];
      setInput(f, p, ((keys.has(k.right) ? 1 : 0) - (keys.has(k.left) ? 1 : 0)) * 127, ((keys.has(k.down) ? 1 : 0) - (keys.has(k.up) ? 1 : 0)) * 127, b);
    });
    rec.push(Array.from(f)); w.step(f);
  }
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
  const S = w.slice<CombatState>('combat');
  renderViews(c, w, S, W, H); drawScreenL(c, w, S, W, H);
  drawHud(c, w, S, W, H, performance.now() / 1000); drawScreenTopL(c, w, S, W, H);
  const fl = screenFilterL(c, w, S, W, H); if (canvas.style.filter !== fl) canvas.style.filter = fl;
  const j = juiceOf(w); playSounds(j.SND.splice(0), j.stop.splice(0), S.tstop > 0, j.endk); // juice was synced by renderViews
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
