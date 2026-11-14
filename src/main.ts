import { BTN, FixedLoop, World, newInput, setInput } from '@kernel';
import { builtinPacks } from './packs';

/** Proof-of-life boot: runs the kernel with the sandbox pack. Real boot (menus, modes) arrives with the ui/modes packs. */
const world = new World({ packs: builtinPacks, seed: 1, players: 2, sanitize: true });
const keys = new Set<string>();
addEventListener('keydown', e => keys.add(e.code)); addEventListener('keyup', e => keys.delete(e.code));
const canvas = document.getElementById('c') as HTMLCanvasElement, hud = document.getElementById('hud')!;
const ctx = canvas.getContext('2d')!;
const loop = new FixedLoop();
let last = performance.now();
function frame(now: number): void {
  const n = loop.advance(now - last); last = now;
  for (let i = 0; i < n; i++) {
    const f = newInput(2);
    setInput(f, 0, ((keys.has('ArrowRight') ? 1 : 0) - (keys.has('ArrowLeft') ? 1 : 0)) * 127, ((keys.has('ArrowDown') ? 1 : 0) - (keys.has('ArrowUp') ? 1 : 0)) * 127, (keys.has('ShiftLeft') ? BTN.focus : 0) | (keys.has('KeyX') ? BTN.dash : 0));
    world.step(f);
  }
  canvas.width = innerWidth; canvas.height = innerHeight;
  const s = world.slice<{ x: Float64Array; y: Float64Array }>('sandbox');
  ctx.fillStyle = '#ff3a4a'; ctx.beginPath(); ctx.arc(s.x[0]!, s.y[0]!, 16, 0, 6.2832); ctx.fill();
  ctx.fillStyle = '#4ab3ff'; ctx.beginPath(); ctx.arc(s.x[1]!, s.y[1]!, 16, 0, 6.2832); ctx.fill();
  hud.textContent = `Proto3 kernel skeleton\nframe ${world.frame}  hash ${world.hash().toString(16)}\narrows move · shift focus · X dash`;
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
