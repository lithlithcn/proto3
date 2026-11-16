import { type World, cos, hypot, sin } from '@kernel';
import { BF, PS, T, chHitQ, entsOf, foe, pushJ, jTxt, addJ, jFlash, sfx } from '@pack/combat/api';
import type { CombatState } from '@pack/combat/api';
import type { TouhouState } from '../../state';
import { EK_ATN } from './kinds';

/**
 * Aya's per-frame hook: faster dash recharge, Hyper Dash (dash through your own tornado), the camera (hold Focus to grow the frame, release = photo that erases
 * foreign bullets and stuns foes inside, 1.5 s cooldown) and the dash gust. The legacy trail entity and the photo flash are cosmetic and not simulated.
 */
export function ayaTick(w: World, s: CombatState, p: number): void {
  const t = w.slice<TouhouState>('touhou'), c = cos(s.aim[p]!), n = sin(s.aim[p]!);
  if (s.state[p] !== PS.dash) { if (s.dashCd[p]! > 0) s.dashCd[p] = s.dashCd[p]! - 1; s.boost[p] = Math.min(T.DASH_CHARGES, s.boost[p]! + T.DASH_REGEN * 2.5); }
  if (s.state[p] === PS.dash && !(t.aHy[p] && t.aHy[p]! > s.gf - 20)) {
    const L: number[] = []; entsOf(s, EK_ATN, p, L);
    for (const e of L) if (hypot(s.ex[e]! - s.x[p]!, s.ey[e]! - s.y[p]!) < 60) {
      const v = hypot(s.vx[p]!, s.vy[p]!) || 1;
      s.vx[p] = s.vx[p]! / v * 24; s.vy[p] = s.vy[p]! / v * 24; s.t[p] = Math.max(s.t[p]!, 16); s.inv[p] = Math.max(s.inv[p]!, 12); s.et[e] = 0; t.aHy[p] = s.gf;
      w.emit('touhou:aya-hyper', { p }); pushJ(w, 'RINGS', 'x', s.x[p]!, 'y', s.y[p]!, 'r', 0, 'm', 70, 't', 14, 'c', '#bfffe0'); jTxt(w, s.x[p]!, s.y[p]! - 34, 'HYPER DASH', '#bfffe0', 14); sfx(w, 'windblow', 0.9); addJ(w, 'shake', 6, 28); break;
    }
  }
  if (s.focus[p] && s.state[p] !== PS.spell && s.gf >= t.aCd[p]!) t.aF[p] = Math.min(140, (t.aF[p]! || 30) + 2);
  else if (t.aF[p] && !s.focus[p]) {
    const S = t.aF[p]! / 2, D = 50 + S; let hit = 0;
    for (let b = 0; b < s.nb; b++) {
      if (s.bflags[b]! & BF.dead || s.bowner[b] === p) continue;
      const u = (s.bx[b]! - s.x[p]!) * c + (s.by[b]! - s.y[p]!) * n, v = -(s.bx[b]! - s.x[p]!) * n + (s.by[b]! - s.y[p]!) * c;
      if (Math.abs(u - D) < S && Math.abs(v) < S * 0.75) { s.bflags[b] = s.bflags[b]! | BF.dead; hit++; }
    }
    for (let q = 0; q < s.n; q++) {
      if (q === p || s.state[q] === PS.dead || s.inv[q]! > 0 || !foe(s, p, q)) continue;
      const u = (s.x[q]! - s.x[p]!) * c + (s.y[q]! - s.y[p]!) * n, v = -(s.x[q]! - s.x[p]!) * n + (s.y[q]! - s.y[p]!) * c;
      if (Math.abs(u - D) < S && Math.abs(v) < S * 0.75 && chHitQ(w, s, p, q, c, n, 3, 0, 60)) { s.vx[q] = 0; s.vy[q] = 0; jTxt(w, s.x[q]!, s.y[q]! - 34, 'STUN!', '#fff', 15); }
    }
    w.emit('touhou:aya-photo', { p, x: s.x[p]! + c * D, y: s.y[p]! + n * D, a: s.aim[p]!, S, bullets: hit });
    pushJ(w, 'PE', 'k', 'aph', 'o', p, 't', 12, 'x', s.x[p]! + c * D, 'y', s.y[p]! + n * D, 'a', s.aim[p]!, 'S', S); jFlash(w, 0.15, '#fff'); sfx(w, 'photo', 1); if (hit) jTxt(w, s.x[p]!, s.y[p]! - 36, 'PHOTO x' + hit, '#fff', 13);
    t.aF[p] = 0; t.aCd[p] = s.gf + 90;
  }
  if (t.aG[p]! > s.gf) {
    const v = hypot(s.vx[p]!, s.vy[p]!) || 1, nx = -s.vy[p]! / v, ny = s.vx[p]! / v;
    for (let b = 0; b < s.nb; b++) {
      if (s.bflags[b]! & BF.dead || s.bowner[b] === p || hypot(s.bx[b]! - s.x[p]!, s.by[b]! - s.y[p]!) >= 80) continue;
      const sg = ((s.bx[b]! - s.x[p]!) * nx + (s.by[b]! - s.y[p]!) * ny) > 0 ? 1 : -1;
      s.bvx[b] = s.bvx[b]! + nx * sg * 1.5; s.bvy[b] = s.bvy[b]! + ny * sg * 1.5;
    }
  }
}
