import type { CombatState } from '@pack/combat/api';

/** Legacy drawView, floor part: dark floor, 100 px grid, red danger edge (purple while Warp), dashed inner border. All through the given Ctx2D. */
export function drawArena(c: CanvasRenderingContext2D, s: CombatState, L: number, Tp: number, R: number, Bt: number, bgF?: { c: string; t: number }): void {
  const MW = s.mapW, MH = s.mapH, E = s.edge, f = s.gf, warp = s.warp > 0;
  c.fillStyle = '#14161f'; c.fillRect(0, 0, MW, MH);
  if (bgF && bgF.t > 0) { c.globalAlpha = bgF.t / 12 * 0.28; c.fillStyle = bgF.c; c.fillRect(0, 0, MW, MH); c.globalAlpha = 1; } // the floor reacts to big hits
  c.strokeStyle = '#1f2333'; c.lineWidth = 1; c.beginPath();
  for (let x = Math.max(0, Math.ceil(L / 100) * 100); x <= Math.min(MW, R); x += 100) { c.moveTo(x, Math.max(0, Tp)); c.lineTo(x, Math.min(MH, Bt)); }
  for (let y = Math.max(0, Math.ceil(Tp / 100) * 100); y <= Math.min(MH, Bt); y += 100) { c.moveTo(Math.max(0, L), y); c.lineTo(Math.min(MW, R), y); }
  c.stroke();
  c.fillStyle = warp ? 'rgba(180,90,255,' + (0.12 + 0.06 * Math.sin(f * 0.2)) + ')' : 'rgba(255,35,50,' + (0.13 + 0.03 * Math.sin(f * 0.06)) + ')';
  c.fillRect(0, 0, MW, E); c.fillRect(0, MH - E, MW, E); c.fillRect(0, E, E, MH - 2 * E); c.fillRect(MW - E, E, E, MH - 2 * E);
  if (!warp) {
    c.save(); c.strokeStyle = '#ff2a3c'; c.globalAlpha = 0.12 + 0.05 * Math.sin(f * 0.06); c.lineWidth = 14; c.strokeRect(E, E, MW - 2 * E, MH - 2 * E);
    c.globalAlpha = 0.55; c.lineWidth = 2; c.setLineDash([22, 14]); c.lineDashOffset = -f * 0.6; c.strokeRect(E, E, MW - 2 * E, MH - 2 * E); c.restore();
  }
  c.strokeStyle = warp ? '#b5f' : '#ff2a3c'; c.lineWidth = 5; c.strokeRect(0, 0, MW, MH);
}
