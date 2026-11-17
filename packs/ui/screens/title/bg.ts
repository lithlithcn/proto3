import { RND, TAU, clamp, type UiCtx } from '../../core';

/** Title backdrop (legacy titleBG, line ~5025): 3D warp stars, spiral galaxy, planet with atmosphere, horizon flare, rising embers. Parallax with the pointer. */
const r = (): number => RND.r();
export const TSTAR = [...Array(700)].map(() => ({ x: r() * 2 - 1, y: r() * 2 - 1, z: r() }));
export const TGAL = [...Array(1500)].map((_, i) => { const arm = i % 3, rr = Math.pow(r(), 0.65); return { arm, r: rr, a: arm * TAU / 3 + Math.log(0.06 + rr) * 2.4 + (r() - 0.5) * (0.25 + 0.5 * (1 - rr)), o: (r() - 0.5) * 0.08, s: 1 + r() * 2.2, ph: r() * TAU }; });
export const TEMB = [...Array(90)].map(() => ({ x: r(), y: r(), s: 0.015 + r() * 0.04, w: r() * TAU, r: 0.8 + r() * 2.2 }));
let lt: number | undefined;

export function titleBG(u: UiCtx, t: number): void {
  const { c, W, H } = u, lo = u.fxLow, mx = (u.mx || W / 2) / W - 0.5, my = (u.my || H / 2) / H - 0.5, dt = Math.min(0.05, t - (lt ?? t)); lt = t;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); let g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#02030a'); g.addColorStop(0.55, '#070a22'); g.addColorStop(1, '#1a0c34'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'lighter';
  // stars in 3D, starting at light speed
  const warp = Math.max(0, 1 - t / 1.4), sp = 0.025 + warp * 2.2, f = H * 0.9, cx = W / 2 - mx * 40, cy = H * 0.42 - my * 30;
  for (let i = 0; i < (lo ? 250 : TSTAR.length); i++) {
    const s = TSTAR[i]!, z0 = s.z; s.z -= dt * sp; if (s.z <= 0.02) { s.z = 1; s.x = r() * 2 - 1; s.y = r() * 2 - 1; }
    const px = cx + s.x / s.z * f * 0.5, py = cy + s.y / s.z * f * 0.5; if (px < -20 || px > W + 20 || py < -20 || py > H + 20) continue;
    const b = Math.min(1, (1 - s.z) * 1.4), sz = Math.max(0.6, (1 - s.z) * 2.4);
    c.globalAlpha = b * (0.55 + 0.45 * Math.sin(t * 3 + i)); c.fillStyle = i % 7 ? '#bcd8ff' : '#ffe7c2';
    if (warp > 0.05) { const qx = cx + s.x / z0 * f * 0.5, qy = cy + s.y / z0 * f * 0.5; c.strokeStyle = c.fillStyle; c.lineWidth = sz; c.beginPath(); c.moveTo(qx, qy); c.lineTo(px, py); c.stroke(); } else c.fillRect(px, py, sz, sz);
  }
  // spiral galaxy
  const gx = W * 0.74 - mx * 70, gy = H * 0.3 - my * 45, gr = Math.min(W, H) * 0.72, gin = clamp((t - 0.3) / 1.6, 0, 1), rot = t * 0.05;
  const hz = c.createRadialGradient(gx, gy, 0, gx, gy, gr * 0.9); hz.addColorStop(0, 'rgba(140,215,255,' + 0.38 * gin + ')'); hz.addColorStop(0.3, 'rgba(100,80,255,' + 0.16 * gin + ')'); hz.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha = 1; c.fillStyle = hz; c.fillRect(0, 0, W, H);
  for (let i = 0; i < (lo ? 500 : TGAL.length); i++) {
    const p = TGAL[i]!, a = p.a + rot / (0.25 + p.r) + p.o, rr = p.r * gr * gin, x = gx + Math.cos(a) * rr, y = gy + Math.sin(a) * rr * 0.42 - (1 - p.r) * Math.sin(a) * 6, k = p.r;
    c.globalAlpha = (0.4 + 0.6 * (1 - k)) * (0.6 + 0.4 * Math.sin(t * 2 + p.ph)) * gin; c.fillStyle = k < 0.18 ? '#ffffff' : k < 0.45 ? '#8fe3ff' : p.arm === 1 ? '#b48cff' : '#5aa8ff'; c.fillRect(x, y, p.s, p.s);
  }
  // planet and atmosphere
  const pr = Math.max(W, H) * 1.05, pcx = W * 0.5 - mx * 20, hy = H * 0.83 - my * 12, pcy = hy + pr, ain = clamp((t - 0.2) / 1, 0, 1);
  for (let k = 0; k < 7; k++) {
    const x = W * (0.12 + k * 0.13) + Math.sin(t * 0.3 + k) * W * 0.02, w = W * (0.02 + 0.03 * ((k * 37) % 5) / 5), rg = c.createLinearGradient(x, 0, x + w, 0);
    rg.addColorStop(0, 'rgba(140,180,255,0)'); rg.addColorStop(0.5, 'rgba(140,180,255,.12)'); rg.addColorStop(1, 'rgba(140,180,255,0)'); c.fillStyle = rg; c.globalAlpha = (0.4 + 0.35 * Math.sin(t * 0.7 + k * 1.7)) * ain; c.fillRect(x, hy - H * 0.5, w, H * 0.5);
  }
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; g = c.createRadialGradient(pcx, pcy - pr * 0.55, pr * 0.2, pcx, pcy, pr); g.addColorStop(0, '#1c1650'); g.addColorStop(0.85, '#0b0b2a'); g.addColorStop(1, '#2a2a8a'); c.fillStyle = g; c.beginPath(); c.arc(pcx, pcy, pr, 0, TAU); c.fill();
  c.save(); c.beginPath(); c.arc(pcx, pcy, pr, 0, TAU); c.clip(); c.globalAlpha = 0.045; c.fillStyle = '#8fb8ff';
  for (let k = 0; k < 9; k++) { const yy = hy + H * 0.02 + k * H * 0.035, o = (t * 14 * (1 + k * 0.2)) % W; c.beginPath(); c.ellipse(pcx - W * 0.6 + o + ((k * 211) % W), yy, W * 0.35, H * 0.008, 0, 0, TAU); c.fill(); }
  c.restore();
  c.globalCompositeOperation = 'lighter';
  for (const [wd, al, col] of [[34, 0.16, '#3a7bff'], [14, 0.35, '#5fd0ff'], [4, 0.9, '#dff6ff']] as const) { c.globalAlpha = al * ain; c.strokeStyle = col; c.lineWidth = wd; c.beginPath(); c.arc(pcx, pcy, pr, -Math.PI * 0.5 - 0.7, -Math.PI * 0.5 + 0.7); c.stroke(); }
  // horizon flare opening from the centre
  const lw = W * 0.62 * (1 - Math.pow(1 - clamp((t - 0.35) / 0.9, 0, 1), 3)), fl = 0.75 + 0.25 * Math.sin(t * 2.3); g = c.createLinearGradient(pcx - lw, 0, pcx + lw, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,' + fl + ')'); g.addColorStop(1, 'rgba(255,255,255,0)');
  c.globalAlpha = 1; c.fillStyle = g; c.fillRect(pcx - lw, hy - 1.5, lw * 2, 3);
  if (lw > 1) { c.save(); c.translate(pcx, hy); c.scale(lw / 40, 1); g = c.createRadialGradient(0, 0, 0, 0, 0, 40); g.addColorStop(0, 'rgba(140,200,255,' + 0.4 * fl + ')'); g.addColorStop(1, 'rgba(80,140,255,0)'); c.fillStyle = g; c.fillRect(-40, -40, 80, 80); c.restore(); }
  const gl = c.createRadialGradient(pcx, hy, 0, pcx, hy, H * 0.12 * fl); gl.addColorStop(0, 'rgba(255,255,255,' + 0.7 * ain + ')'); gl.addColorStop(0.25, 'rgba(150,210,255,' + 0.25 * ain + ')'); gl.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gl; c.fillRect(pcx - H * 0.3, hy - H * 0.3, H * 0.6, H * 0.6);
  // rising embers
  for (let i = 0; i < (lo ? 30 : TEMB.length); i++) {
    const e = TEMB[i]!; e.y -= dt * e.s; if (e.y < -0.05) { e.y = 1.05; e.x = r(); }
    const x = (e.x + Math.sin(t * 0.8 + e.w) * 0.02) * W - mx * 90, y = e.y * H - my * 60, fk = 0.5 + 0.5 * Math.sin(t * 6 + e.w * 3);
    c.globalAlpha = (0.35 + 0.5 * fk) * clamp(e.y * 1.4, 0, 1); c.fillStyle = i % 3 ? '#ffb35a' : '#ff6a3a'; c.beginPath(); c.arc(x, y, e.r * (0.7 + 0.3 * fk), 0, TAU); c.fill();
  }
  c.restore();
}
