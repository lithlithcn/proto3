import type { CombatState } from '@pack/combat/api';
import { PS } from '@pack/combat/api';

/** Presentation-only camera (legacy `cams[i]`): follows the player, leaning 30 % toward the foe (max 220 px), eased 12 %/frame, clamped to the map. */
export interface Cam { x: number; y: number }
export const newCam = (): Cam => ({ x: 1000, y: 675 });

export function stepCam(cam: Cam, s: CombatState, p: number, vw: number, vh: number): void {
  if (s.state[p] !== PS.dead) {
    const o = s.tgt[p]! >= 0 ? s.tgt[p]! : (p + 1) % s.n;
    let ox = (s.x[o]! - s.x[p]!) * 0.3, oy = (s.y[o]! - s.y[p]!) * 0.3; const l = Math.hypot(ox, oy);
    if (l > 220) { ox *= 220 / l; oy *= 220 / l; }
    cam.x += (s.x[p]! + ox - cam.x) * 0.12; cam.y += (s.y[p]! + oy - cam.y) * 0.12;
  }
  cam.x = vw >= s.mapW ? s.mapW / 2 : Math.max(vw / 2, Math.min(s.mapW - vw / 2, cam.x));
  cam.y = vh >= s.mapH ? s.mapH / 2 : Math.max(vh / 2, Math.min(s.mapH - vh / 2, cam.y));
}
