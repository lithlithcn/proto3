import type { HookDef } from '@kernel';
import { juiceHook as on, snd } from '@pack/render/juice/events';

/** Reimu teleport dash (legacy line 4750): two rings + 8 pink afterimages along the jump. */
const teleport = on<{ x: number; y: number; x0: number; y0: number; gf: number }>('tfx-reimu-teleport', 'touhou:reimu-teleport', (j, e) => {
  snd(j, e.gf, 'teleportation', 0.6);
  j.RINGS.push({ x: e.x0, y: e.y0, r: 0, m: 44, t: 14, c: '#ff9aa8' }, { x: e.x, y: e.y, r: 0, m: 36, t: 14, c: '#fff' });
  for (let i = 0; i < 8 && j.FX.length < 480; i++) j.FX.push({ x: e.x0 + (e.x - e.x0) * i / 7, y: e.y0 + (e.y - e.y0) * i / 7, vx: 0, vy: 0, t: 10 + i, c: '#ff9aa8' });
});
/** Marisa Blazing Star dash beam (line 4395). */
const star = on<{ p: number }>('tfx-marisa-star', 'touhou:marisa-star', j => { j.shake = Math.min(28, j.shake + 5); });
export const touhouJuice: HookDef[] = [teleport, star];
