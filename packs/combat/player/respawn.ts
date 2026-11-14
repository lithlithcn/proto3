import { type World, hypot } from '@kernel';
import { clearFx } from '../fx';
import { T } from '../tuning';
import { PS, type CombatState } from '../state';

/** Respawn at the corner farthest from living foes (legacy `respawn`). */
export function respawn(w: World, s: CombatState, p: number): void {
  const ax = s.mapW * 0.2, ay = s.mapH * 0.25;
  const C: [number, number][] = [[ax, ay], [s.mapW - ax, ay], [ax, s.mapH - ay], [s.mapW - ax, s.mapH - ay]];
  let bx = C[0]![0], by = C[0]![1], bd = -1;
  for (const [cx, cy] of C) {
    let d = 1e9;
    for (let q = 0; q < s.n; q++) if (q !== p && s.state[q] !== PS.dead) d = Math.min(d, hypot(cx - s.x[q]!, cy - s.y[q]!));
    if (d > bd) { bd = d; bx = cx; by = cy; }
  }
  s.x[p] = bx; s.y[p] = by; s.vx[p] = 0; s.vy[p] = 0; s.hp[p] = T.HP; s.pips[p] = T.PIPS; s.state[p] = PS.idle; s.inv[p] = T.RESPAWN_INV;
  s.boost[p] = T.DASH_CHARGES; s.slide[p] = 0; s.run[p] = 0; s.power[p] = 1; s.combo[p] = 0; s.charging[p] = 0; s.pStk[p] = 0; s.ult[p] = 0; s.mirror[p] = 0; s.giant[p] = 0; clearFx(s, p); s.blade[p] = 0; s.bombs[p] = 0;
  w.emit('combat:respawn', { p, x: bx, y: by });
}
