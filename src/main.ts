import { BTN, FixedLoop, World, newInput, setInput } from '@kernel';
import type { CombatState } from '@pack/combat/api';
import { drawHud } from '@pack/render/hud';
import { drawView } from '@pack/render/view';
import { builtinPacks } from './packs';

/** Playable slice: Reimu (P1: WASD + JKL...) vs Marisa (P2: arrows + numpad). Menus, modes, touch and gamepad arrive with the ui/modes packs. */
const cfg = { seed: (Math.random() * 1e9) | 0, players: 2, world: { players: [{ char: 'touhou:reimu' }, { char: 'touhou:marisa' }] } }; // sim-allow(boot-time seed)
const world = new World({ packs: builtinPacks.filter(p => p.id !== 'sandbox'), ...cfg });
const rec: number[][] = []; // every input frame of the match: the whole game is replayable from cfg + rec
const KB = [
  { up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD', shot: 'KeyJ', heavy: 'KeyK', melee: 'KeyL', dash: 'Space', parry: 'KeyI', burst: 'KeyU', spell: 'KeyO', focus: 'ShiftLeft', prev: 'KeyE', next: 'KeyR' },
  { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', shot: 'Numpad1', heavy: 'Numpad2', melee: 'Numpad3', dash: 'Numpad0', parry: 'Numpad5', burst: 'Numpad7', spell: 'Numpad6', focus: 'Numpad4', prev: 'Numpad8', next: 'Numpad9' },
] as const;
const keys = new Set<string>();
addEventListener('keydown', e => { keys.add(e.code); if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault(); });
addEventListener('keyup', e => keys.delete(e.code));
addEventListener('blur', () => keys.clear());
/** F8: downloads the match (config + every input frame + build id) so a bug can be replayed exactly. */
addEventListener('keydown', e => { if (e.code !== 'F8') return; e.preventDefault(); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify({ v: 1, build: import.meta.env.MODE, cfg, frames: rec.length, inputs: rec })], { type: 'application/json' })); a.download = `proto3-match-${cfg.seed}-f${rec.length}.json`; a.click(); });
const canvas = document.getElementById('c') as HTMLCanvasElement, c = canvas.getContext('2d')!, loop = new FixedLoop();
let last = performance.now();
function frame(now: number): void {
  const n = loop.advance(now - last); last = now;
  for (let i = 0; i < n; i++) {
    const f = newInput(2);
    KB.forEach((k, p) => {
      let b = 0; for (const name of ['shot', 'heavy', 'melee', 'dash', 'parry', 'burst', 'spell', 'focus', 'prev', 'next'] as const) if (keys.has(k[name])) b |= BTN[name];
      setInput(f, p, ((keys.has(k.right) ? 1 : 0) - (keys.has(k.left) ? 1 : 0)) * 127, ((keys.has(k.down) ? 1 : 0) - (keys.has(k.up) ? 1 : 0)) * 127, b);
    });
    rec.push(Array.from(f)); world.step(f);
  }
  if (canvas.width !== innerWidth || canvas.height !== innerHeight) { canvas.width = innerWidth; canvas.height = innerHeight; }
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#000'; c.fillRect(0, 0, canvas.width, canvas.height);
  drawView(c, world, 0, 0, canvas.width, canvas.height, 0);
  drawHud(c, world, world.slice<CombatState>('combat'), canvas.width, canvas.height);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
