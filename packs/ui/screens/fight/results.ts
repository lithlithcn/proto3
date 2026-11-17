import { drawCharArt } from '@pack/render/ld/portrait';
import { COLS, RND, TAU, TCOL, UFI, clamp, eo, eob, hexA, ornFrame, skewRect, strokeTxt, type UiCtx } from '../../core';

/** Results screen (legacy drawResults v2 + rankList/resAwards/resPortrait, line ~4925): winner banner, podium with the fighters' art, stats panel
 *  with titles, match-flow curve (HP + stocks every 30 frames), confetti. Shown once winT >= 100. */
export interface ResP { id: number; cpu: boolean; key: string; col: string; kos: number; dmgDealt: number; dmgTk: number; parN: number; spN: number; bigHit: number; sd: number; outAt: number; stocks: number; hp: number; dead: boolean }
export interface ResultsView { t: number; winner: number; teams: boolean; teamA: ArrayLike<number>; P: ResP[]; tlg: (number[] | undefined)[]; touch: boolean }
const TNAME = ['RED', 'BLUE', 'YELLOW', 'GREEN'], MED = ['#ffd23a', '#d8e0ea', '#e09a5a'];
export { pname } from '../../profiles';
import { pname } from '../../profiles';
const byKD = (a: ResP, b: ResP): number => b.kos - a.kos || b.dmgDealt - a.dmgDealt || (b.outAt || 1e9) - (a.outAt || 1e9) || a.id - b.id;
/** Winner (or its team) first, then the one knocked out last; at time-up: stocks, then HP, then KOs / damage. */
export function rankList(v: ResultsView): ResP[] {
  const out = (p: ResP): number => p.outAt || 1e12, al = (p: ResP): number => p.outAt ? 0 : 1, W = v.winner;
  return [...v.P].sort((a, b) => (v.teams && W >= 0 ? +(v.teamA[b.id] === v.teamA[W]) - +(v.teamA[a.id] === v.teamA[W]) : 0) || (!v.teams && W >= 0 ? +(b.id === W) - +(a.id === W) : 0) || out(b) - out(a) || al(b) * al(a) * ((b.stocks - a.stocks) || (Math.max(0, b.hp) - Math.max(0, a.hp))) || byKD(a, b));
}
/** Up to two titles per fighter (most aggressive, KO machine, parry master...). */
export function resAwards(L: ResP[]): Map<number, [string, string][]> {
  const A = new Map<number, [string, string][]>(), give = (lab: string, col: string, f: (p: ResP) => number | null, lo?: boolean): void => {
    let best: ResP | null = null, bv = lo ? 1e18 : -1e18; for (const p of L) { const v = f(p); if (v == null) continue; if (lo ? v < bv : v > bv) { bv = v; best = p; } }
    if (best && bv !== 0 && (lo || bv > 0)) { const a = A.get(best.id) ?? []; if (a.length < 2) { a.push([lab, col]); A.set(best.id, a); } }
  };
  give('MOST AGGRESSIVE', '#ff5a6a', p => p.dmgDealt); give('KO MACHINE', '#ffd23a', p => p.kos); give('PARRY MASTER', '#6ff', p => p.parN); give('SPELL ADDICT', '#c08cff', p => p.spN);
  give('HEAVY HITTER', '#ff9a3a', p => p.bigHit); give('IRON WALL', '#7fa8ff', p => L.length > 1 ? p.dmgTk + 1 : null, true); give('OOPS…', '#999', p => p.sd); return A;
}
/** Points of the match-flow curve for one sample (legacy TLG entry). */
export const flowSample = (P: ResP[]): number[] => P.map(p => Math.max(0, p.dead ? Math.max(0, p.stocks) : p.stocks - 1) * 100 + (p.dead ? 0 : Math.max(0, p.hp)));
let RSC: { x: number; y: number; vx: number; vy: number; r: number; c: string }[] = [], RAW: Map<number, [string, string][]> | null = null;
export const resetResults = (): void => { RSC = []; RAW = null; };
function resPortrait(u: UiCtx, p: ResP, cx: number, cy: number, s: number, frame: number): void {
  const c = u.c, fq = { x: cx, y: cy, aim: -Math.PI / 2 + Math.sin(u.now * 1.3 + p.id) * 0.4, chM: (u.now / 1.5 | 0) % 3, chC: 4, chG: 70, chS: 3, chT: 0, state: 'idle', fx: {} };
  c.save(); c.translate(cx, cy); c.scale(s, s); c.translate(-cx, -cy); c.fillStyle = '#222'; c.strokeStyle = p.col; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, 16, 0, TAU); c.fill(); c.stroke(); drawCharArt(c, p.key, fq, 16, frame); c.restore();
}
export function drawResults(u: UiCtx, v: ResultsView, frame: number): void {
  const { c, W, H } = u, t = v.t, L = rankList(v), n = L.length, r = (): number => RND.r();
  if (t === 1 || !RAW) { RAW = resAwards(v.P); v.tlg.push(flowSample(v.P)); }
  const a = eo(t / 20), wc = v.teams ? TCOL[v.teamA[v.winner]!]! : COLS[v.winner % 8]!; c.save(); c.fillStyle = 'rgba(4,5,12,' + (0.8 * a) + ')'; c.fillRect(0, 0, W, H);
  c.globalAlpha = 0.08 * a; c.fillStyle = wc; for (let i = -2; i < W / 60 + 4; i++) { const x = i * 60 + ((t * 1.2) % 60); c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 30, 0); c.lineTo(x + 30 - H * 0.4, H); c.lineTo(x - H * 0.4, H); c.fill(); } c.globalAlpha = 1;
  const rg = c.createRadialGradient(W * 0.28, H * 0.55, 0, W * 0.28, H * 0.55, H * 0.6); rg.addColorStop(0, hexA(wc, 0.22 * a)); rg.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = rg; c.fillRect(0, 0, W, H);
  if (t === 1) { RSC = []; for (let i = 0; i < (u.fxLow ? 40 : 140); i++) RSC.push({ x: r() * W, y: -r() * H * 0.6, vx: (r() - 0.5) * 2, vy: 1 + r() * 3, r: r() * 6.28, c: ['#ffd23a', '#ff5a7a', '#5ab4ff', '#5cff8a', '#fff'][i % 5]! }); }
  for (const q of RSC) { q.x += q.vx; q.y += q.vy; q.r += 0.1; if (q.y > H + 20) { q.y = -10; q.x = r() * W; } c.save(); c.translate(q.x, q.y); c.rotate(q.r); c.fillStyle = q.c; c.globalAlpha = 0.8 * a; c.fillRect(-4, -2, 8, 4); c.restore(); }
  const port = W / H < 1.25, sc = Math.min(1.25, Math.max(0.62, Math.min(W / 1500, H / 850)));
  // winner banner
  { const title = (v.teams ? TNAME[v.teamA[v.winner]!]! + ' TEAM' : pname(v.P[v.winner]!)) + ' WINS!', bs = eob(t / 22), by = H * (port ? 0.08 : 0.11); c.save(); c.translate(W / 2, by); c.scale(bs, bs); c.rotate(-0.02); c.textAlign = 'center'; let fs = Math.min(H * 0.085, W * 0.075); c.font = UFI(fs); while (c.measureText(title).width > W * 0.86 && fs > 14) { fs *= 0.92; c.font = UFI(fs); }
    const tw = c.measureText(title).width; c.fillStyle = '#05060c'; skewRect(c, -tw / 2 - 40, -fs * 0.95, tw + 80, fs * 1.3, fs * 0.3); c.fill(); c.fillStyle = wc; skewRect(c, -tw / 2 - 40, fs * 0.3, tw + 80, 5, 4); c.fill(); strokeTxt(c, title, 0, 0, 9, '#05060c', '#fff'); c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.25 + 0.15 * Math.sin(t * 0.12); c.fillStyle = wc; c.fillText(title, 3, 2);
    const sw = ((t * 12) % (tw * 3)) - tw * 1.5, sg = c.createLinearGradient(sw - 60, 0, sw + 60, 0); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,255,.35)'); sg.addColorStop(1, 'rgba(255,255,255,0)'); c.globalAlpha = 1; c.fillStyle = sg; c.fillText(title, 0, 0); c.restore(); }
  // podium
  const pw = port ? W * 0.96 : W * 0.42, px0 = port ? W * 0.02 : W * 0.04, pbase = port ? H * 0.44 : H * 0.78, stepW = Math.min(pw / 3.3, 220 * sc), hs = [1, 0.62, 0.42], ph = port ? H * 0.17 : H * 0.3;
  [1, 0, 2].forEach((ri, col) => {
    const p = L[ri]; if (!p) return; const st = 18 + col * 10 + (ri === 0 ? 24 : 0), uu = clamp((t - st) / 28, 0, 1), e = eob(uu), cx = px0 + pw / 2 + (col - 1) * (stepW + 14 * sc), h = ph * hs[ri]! * e, x = cx - stepW / 2, y = pbase - h, mc = MED[ri]!, pc = COLS[p.id % 8]!; if (uu <= 0) return;
    const g = c.createLinearGradient(x, y, x + stepW, y + h); g.addColorStop(0, hexA(mc, 0.95)); g.addColorStop(0.5, hexA(mc, 0.55)); g.addColorStop(1, hexA(mc, 0.85)); c.fillStyle = '#05060c'; c.fillRect(x - 3, y - 3, stepW + 6, h + 3); c.fillStyle = g; c.fillRect(x, y, stepW, h);
    c.save(); c.beginPath(); c.rect(x, y, stepW, h); c.clip(); c.globalAlpha = 0.18; c.fillStyle = '#000'; for (let q = -4; q < 10; q++) { const xx = x + q * 24 + ((t * 0.6) % 24); c.beginPath(); c.moveTo(xx, y); c.lineTo(xx + 10, y); c.lineTo(xx - 30, y + h); c.lineTo(xx - 40, y + h); c.fill(); } c.restore();
    c.fillStyle = pc; c.fillRect(x, y, stepW, 5); c.textAlign = 'center'; c.font = UFI(Math.min(h * 0.55, stepW * 0.5)); if (h > 30) strokeTxt(c, String(ri + 1), cx, y + h * 0.62, 6, '#05060c', '#fff');
    const pu = clamp((t - st - 14) / 20, 0, 1), pe = eob(pu);
    if (pu > 0) {
      const pr = (ri === 0 ? 1.25 : 1) * stepW * 0.3, py = y - pr - 30 - (1 - pe) * H * 0.3 + Math.sin(u.now * 2 + ri) * 3; c.save(); c.globalAlpha = pu;
      if (ri === 0) {
        c.globalCompositeOperation = 'lighter'; const hg = c.createRadialGradient(cx, py, 0, cx, py, pr * 2.2); hg.addColorStop(0, hexA(mc, 0.55)); hg.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = hg; c.fillRect(cx - pr * 2.2, py - pr * 2.2, pr * 4.4, pr * 4.4); c.globalCompositeOperation = 'source-over';
        c.save(); c.translate(cx, py - pr - 8); c.rotate(Math.sin(u.now * 2) * 0.08); c.fillStyle = mc; c.beginPath(); c.moveTo(-pr * 0.5, 0); c.lineTo(-pr * 0.5, -pr * 0.35); c.lineTo(-pr * 0.25, -pr * 0.15); c.lineTo(0, -pr * 0.45); c.lineTo(pr * 0.25, -pr * 0.15); c.lineTo(pr * 0.5, -pr * 0.35); c.lineTo(pr * 0.5, 0); c.closePath(); c.fill(); c.strokeStyle = '#05060c'; c.lineWidth = 3; c.stroke(); c.restore();
      }
      c.strokeStyle = pc; c.lineWidth = 4; c.beginPath(); c.arc(cx, py, pr, 0, TAU); c.stroke(); resPortrait(u, p, cx, py, pr / 16 * 0.8, frame);
      c.font = UFI(Math.max(12, stepW * 0.12)); c.textAlign = 'center'; strokeTxt(c, pname(p).slice(0, 14), cx, y - 6 + (h < 40 ? -4 : 0), 5, '#05060c', pc); c.restore();
    }
  });
  if (n > 3) { const uu = clamp((t - 60) / 20, 0, 1); c.save(); c.globalAlpha = uu; c.textAlign = 'left'; c.font = 'bold ' + Math.round(13 * sc) + 'px monospace'; let xx = px0, yy = pbase + 22 * sc;
    for (let i = 3; i < n; i++) { const p = L[i]!, s = (i + 1) + '. ' + pname(p), w = c.measureText(s).width + 20; if (xx + w > px0 + pw) { xx = px0; yy += 24 * sc; } c.fillStyle = 'rgba(20,22,34,.9)'; c.fillRect(xx, yy - 15 * sc, w, 20 * sc); c.fillStyle = COLS[p.id % 8]!; c.fillRect(xx, yy - 15 * sc, 3, 20 * sc); c.fillText(s, xx + 10, yy); xx += w + 8; }
    c.restore(); }
  // stats panel + titles
  const fx = port ? W * 0.03 : W * 0.5, fw = port ? W * 0.94 : W * 0.47, fy0 = port ? H * 0.52 : H * 0.2, rowH = Math.max(22, Math.min(40 * sc, (port ? H * 0.26 : H * 0.38) / Math.max(n, 1) - 4)), fh = 34 * sc + n * (rowH + 4) + 12, fu = eo(clamp((t - 30) / 25, 0, 1));
  if (fu > 0) {
    c.save(); c.translate((1 - fu) * W * 0.3, 0); ornFrame(c, fx, fy0, fw, fh, wc, fu);
    const cols: [string, (p: ResP) => number][] = [['KO', p => p.kos], ['DMG', p => p.dmgDealt], ['TAKEN', p => p.dmgTk], ['PARRY', p => p.parN], ['SPELL', p => p.spN], ['BEST', p => p.bigHit]], nx = fx + fw * 0.36, cw = (fw * 0.62) / cols.length;
    c.font = 'bold ' + Math.round(11 * sc + 2) + 'px monospace'; c.textAlign = 'center'; c.fillStyle = hexA(wc, 0.9); cols.forEach((q, j) => c.fillText(q[0], nx + cw * (j + 0.5), fy0 + 24 * sc)); c.textAlign = 'left'; c.fillText('RESULTS', fx + 20, fy0 + 24 * sc);
    L.forEach((p, i) => {
      const ry = fy0 + 34 * sc + i * (rowH + 4), uu = clamp((t - 40 - i * 6) / 18, 0, 1); if (uu <= 0) return; c.save(); c.globalAlpha *= uu; c.translate((1 - eo(uu)) * 40, 0); c.fillStyle = i === 0 ? hexA(MED[0]!, 0.14) : 'rgba(255,255,255,.04)'; c.fillRect(fx + 12, ry, fw - 24, rowH); c.fillStyle = COLS[p.id % 8]!; c.fillRect(fx + 12, ry, 4, rowH);
      c.font = UFI(rowH * 0.55); c.fillStyle = MED[i] || '#8a8f9a'; c.fillText(String(i + 1), fx + 24, ry + rowH * 0.72); c.font = 'bold ' + Math.round(rowH * 0.42) + 'px sans-serif'; c.fillStyle = COLS[p.id % 8]!; c.fillText(pname(p).slice(0, 12), fx + 24 + rowH * 0.75, ry + rowH * 0.48);
      const aw = RAW!.get(p.id); if (aw) { c.font = 'bold ' + Math.round(rowH * 0.24 + 3) + 'px monospace'; let ax = fx + 24 + rowH * 0.75; for (const [lb, ac] of aw) { const w = c.measureText(lb).width + 10; if (ax + w > nx - 4) break; c.fillStyle = hexA(ac, 0.2); c.fillRect(ax, ry + rowH * 0.58, w, rowH * 0.34); c.fillStyle = ac; c.fillText(lb, ax + 5, ry + rowH * 0.85); ax += w + 5; } }
      c.textAlign = 'center'; c.font = 'bold ' + Math.round(rowH * 0.42) + 'px monospace'; const cu = clamp((t - 46 - i * 6) / 40, 0, 1); cols.forEach((q, j) => { const val = Math.round(q[1](p) * cu); c.fillStyle = val ? '#fff' : '#667'; c.fillText(String(val), nx + cw * (j + 0.5), ry + rowH * 0.66); }); c.textAlign = 'left';
      c.restore();
    });
    c.restore();
  }
  // match flow curve
  const gy0 = fy0 + fh + 18 * sc, gh = port ? 0 : Math.min(H * 0.86 - gy0 - 40 * sc, H * 0.22);
  if (!port && gh > 60 && v.tlg.length > 1) { const gu = eo(clamp((t - 70) / 30, 0, 1)); if (gu > 0) {
    c.save(); ornFrame(c, fx, gy0, fw, gh, '#7fa8ff', gu); const ix = fx + 22, iw = fw - 44, iy = gy0 + 28 * sc, ih = gh - 40 * sc, S = v.tlg.filter((x): x is number[] => !!x), mx = Math.max(1, ...S.flat());
    c.font = 'bold ' + Math.round(11 * sc + 2) + 'px monospace'; c.fillStyle = '#7fa8ff'; c.fillText('MATCH FLOW', ix, gy0 + 20 * sc); c.strokeStyle = 'rgba(255,255,255,.08)'; c.lineWidth = 1; for (let k = 0; k <= 4; k++) { const yy = iy + ih * k / 4; c.beginPath(); c.moveTo(ix, yy); c.lineTo(ix + iw, yy); c.stroke(); }
    const rv = clamp((t - 80) / 70, 0, 1); c.beginPath(); c.rect(ix - 4, iy - 6, iw * rv + 8, ih + 12); c.clip();
    for (const p of v.P) { const col = COLS[p.id % 8]!; c.strokeStyle = col; c.lineWidth = 2.5; c.shadowColor = col; c.shadowBlur = 8; c.beginPath(); S.forEach((s, k) => { const xx = ix + iw * k / (S.length - 1), yy = iy + ih * (1 - (s[p.id] || 0) / mx); if (k) c.lineTo(xx, yy); else c.moveTo(xx, yy); }); c.stroke(); }
    c.shadowBlur = 0; c.restore(); } }
  c.textAlign = 'center'; const fyB = port ? Math.min(H - 40, fy0 + fh + 40) : Math.max(H * 0.9, Math.min(H - 30, gy0 + gh + 40));
  if (t > 40) { c.globalAlpha = clamp((t - 40) / 20, 0, 1); c.fillStyle = '#ccc'; c.font = 'bold ' + Math.round(14 * sc + 2) + 'px monospace'; c.fillText(v.touch ? 'Tap: rematch' : 'Enter / A: rematch  ·  V / Y: replay  ·  M / B: menu', W / 2, fyB); c.globalAlpha = 1; }
  c.restore();
}
