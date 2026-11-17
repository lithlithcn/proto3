import { drawCharArt } from '@pack/render/ld/portrait';
import { COLS, TAU, TCOL, UF, UFI, clamp, eo, eob, hexA, lerp, skewRect, strokeTxt, wrapT, type RosterEntry, type UiCtx } from '../../core';
import { uiBG } from '../../bg';
import { SET } from '../../settings';
import { devName } from '../../input/devices';
import { CS2, CSA, cssGo, cssTapTile, type CssHost } from './state';

/** Character select drawing (legacy drawCss v2, line ~4867, + the CPU BATTLE button wrapper): animated tiles with the in-game art, spotlight on
 *  the fighter of the last active player, player cards, FIGHT button. `frame` animates the art like in a fight. */
const BODY_R = 16;
function cssPort(u: UiCtx, ch: RosterEntry, cx: number, cy: number, s: number, aim: number | null, col: string | null, frame: number): void {
  const c = u.c, fq = { x: cx, y: cy, aim: aim == null ? -Math.PI / 2 : aim, chM: (u.now / 1.5 | 0) % 3, chC: 4, chG: 70, chS: 3, chT: 0, state: 'idle', power: 4, fx: {}, id: 950 };
  c.save(); c.translate(cx, cy); c.scale(s, s); c.translate(-cx, -cy); c.fillStyle = '#222'; c.strokeStyle = col || ch.col; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, BODY_R, 0, TAU); c.fill(); c.stroke();
  drawCharArt(c, ch.key, fq, BODY_R, frame); c.restore();
}
export function drawCss(u: UiCtx, h: CssHost, frame: number): void {
  const { c, W, H } = u, R = h.roster, S = CS2.sl, N = R.length, t = u.now, te = t - CSA.t0, port = W < H * 1.05, on = CS2.on; u.hot.length = 0;
  const act = S.map((s, i) => s.dev ? i : -1).filter(i => i >= 0), focus = act.length ? act[act.length - 1]! : -1, fty = focus >= 0 ? S[focus]!.ty : (t * 0.4 | 0) % N, fch = R[fty]!;
  if (!on) { u.acc = fch.col; uiBG(u, fch.name.toUpperCase() + '  '); }
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  // header: title, BACK, FREE FOR ALL / TEAM BATTLE toggle
  if (!on) {
    const e = eo(clamp(te / 0.4, 0, 1)); c.save(); c.translate((e - 1) * W * 0.4, 0); c.fillStyle = '#05060c'; skewRect(c, -20, H * 0.03, W * 0.42, H * 0.08, H * 0.03); c.fill(); c.fillStyle = fch.col; c.fillRect(0, H * 0.03 + H * 0.08 - 4, W * 0.38, 4); c.textAlign = 'left'; c.font = UFI(H * 0.05); strokeTxt(c, 'CHOOSE YOUR FIGHTER', W * 0.03, H * 0.09, 6, '#05060c', '#fff'); c.restore();
    const bb = { x: W * 0.03, y: H * 0.125, w: Math.max(90, W * 0.08), h: Math.max(30, H * 0.045) }; c.fillStyle = 'rgba(5,6,12,.8)'; skewRect(c, bb.x, bb.y, bb.w, bb.h, bb.h * 0.3); c.fill(); c.fillStyle = '#fff'; c.font = UF(900, bb.h * 0.5); c.textAlign = 'center'; c.fillText('◀ BACK', bb.x + bb.w / 2, bb.y + bb.h * 0.68);
    { const tw = Math.max(150, W * 0.15), tb = { x: bb.x + bb.w + 14, y: bb.y, w: tw, h: bb.h }, tm = CS2.tb; c.fillStyle = tm ? '#ffd23a' : 'rgba(5,6,12,.8)'; skewRect(c, tb.x, tb.y, tb.w, tb.h, tb.h * 0.3); c.fill(); c.strokeStyle = '#ffd23a'; c.lineWidth = 2; skewRect(c, tb.x, tb.y, tb.w, tb.h, tb.h * 0.3); c.stroke(); c.fillStyle = tm ? '#05060c' : '#ffd23a'; c.font = UF(900, tb.h * 0.46); c.fillText(tm ? '⚑ TEAM BATTLE' : 'FREE FOR ALL', tb.x + tb.w / 2, tb.y + tb.h * 0.66);
      u.hot.push({ ...tb, hover: () => {}, click: () => { CS2.tb = !CS2.tb; h.sfx('ok00'); } }); }
    u.hot.push({ ...bb, hover: () => {}, click: () => { const k = S.find(q => q.dev === 'k0'); if (k && (k.rd || k.pg)) { k.rd = false; k.pg = false; } else if (S.some(q => q.dev)) { for (const q of S) if (q.dev === 'k0') q.dev = null; } else h.back(); h.sfx('cancel00'); } });
  }
  // grid
  const cols = port ? Math.min(4, N) : Math.min(5, Math.ceil(N / 2)), rows = Math.ceil(N / cols), gx0 = on ? W * 0.02 : W * 0.04, gw = on ? Math.min(W * 0.42, 560) : port ? W * 0.92 : W * 0.54, gy0 = on ? H * 0.02 : H * 0.2, gh = on ? H * 0.42 : port ? H * 0.36 : H * 0.44, tw = gw / cols, th = Math.min(gh / rows, tw * 1.05);
  for (let j = 0; j < N; j++) {
    const ch = R[j]!, cx = gx0 + (j % cols) * tw, cy = gy0 + (j / cols | 0) * th, w = tw - 10, hh = th - 10, ins = S.map((s, i) => s.dev && s.ty === j ? i : -1).filter(i => i >= 0), hov = ins.length > 0, A = CSA.tile[j] = lerp(CSA.tile[j] || 0, hov ? 1 : 0, 0.2), uu = clamp((te - 0.1 - j * 0.04) / 0.45, 0, 1), e = eob(uu); if (uu <= 0) continue;
    c.save(); c.globalAlpha = on ? 0.85 : 1; c.translate(cx + w / 2, cy + hh / 2); c.rotate((1 - e) * 0.5 - 0.03 + A * 0.03); c.scale(e * (1 + A * 0.06), e * (1 + A * 0.06));
    c.shadowColor = hov ? COLS[ins[ins.length - 1]! % 8]! : 'rgba(0,0,0,.6)'; c.shadowBlur = hov ? 24 : 10; c.fillStyle = '#05060c'; skewRect(c, -w / 2 - 3, -hh / 2 - 3, w + 6, hh + 6, hh * 0.12); c.fill(); c.shadowBlur = 0;
    const g = c.createLinearGradient(-w / 2, -hh / 2, w / 2, hh / 2); g.addColorStop(0, hexA(ch.col, 0.85)); g.addColorStop(1, hexA(ch.col, 0.25 + A * 0.3)); c.fillStyle = g; skewRect(c, -w / 2, -hh / 2, w, hh, hh * 0.12); c.fill();
    c.save(); skewRect(c, -w / 2, -hh / 2, w, hh, hh * 0.12); c.clip(); c.globalAlpha = 0.18; c.fillStyle = '#000';
    for (let q = -6; q < 10; q++) { const xx = -w / 2 + q * hh * 0.3 + ((t * (hov ? 40 : 10)) % (hh * 0.3)); c.beginPath(); c.moveTo(xx, -hh / 2); c.lineTo(xx + hh * 0.12, -hh / 2); c.lineTo(xx + hh * 0.12 - hh * 0.4, hh / 2); c.lineTo(xx - hh * 0.4, hh / 2); c.fill(); }
    c.globalAlpha = 1;
    if (hov) { const sw = ((t * 0.9 + j * 0.3) % 1.6) / 1.6 * w * 1.8 - w * 0.9, sg = c.createLinearGradient(sw - 50, 0, sw + 50, 0); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,255,.35)'); sg.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = sg; c.fillRect(-w / 2, -hh / 2, w, hh); }
    c.fillStyle = 'rgba(5,6,12,.55)'; c.fillRect(-w / 2, hh / 2 - hh * 0.24, w, hh * 0.24); c.restore();
    const ps = Math.min(w, hh * 0.76) * 0.36 / BODY_R; cssPort(u, ch, 0, -hh * 0.1 + (hov ? Math.sin(t * 4 + j) * 2 : 0), ps, hov ? Math.atan2(Math.sin(t * 1.5), Math.cos(t * 1.5)) : -Math.PI / 2, null, frame);
    c.textAlign = 'center'; c.font = UFI(Math.min(hh * 0.16, w * 0.15)); strokeTxt(c, ch.name.toUpperCase(), 0, hh / 2 - hh * 0.06, 4, '#05060c', '#fff');
    c.lineWidth = hov ? 3 : 1.5; c.strokeStyle = hov ? '#fff' : 'rgba(255,255,255,.25)'; skewRect(c, -w / 2, -hh / 2, w, hh, hh * 0.12); c.stroke();
    ins.forEach((i, k) => { const tx = -w / 2 + 12 + k * hh * 0.2, tyy = -hh / 2 + 12, r = hh * 0.09; c.fillStyle = COLS[i % 8]!; c.beginPath(); c.arc(tx + r, tyy + r, r, 0, TAU); c.fill(); c.strokeStyle = S[i]!.rd ? '#fff' : '#05060c'; c.lineWidth = S[i]!.rd ? 3 : 2; c.stroke(); c.fillStyle = '#05060c'; c.font = 'bold ' + Math.round(r * 1.05) + 'px monospace'; c.fillText('P' + (i + 1), tx + r, tyy + r * 1.38); });
    c.restore(); u.hot.push({ x: cx, y: cy, w, h: hh, hover: () => {}, click: () => cssTapTile(h, j, u.now) });
  }
  // spotlight on the fighter of the last active player
  if (!on && !port) {
    const sx = W * 0.6, sy = H * 0.12, sw = W * 0.37, sh = H * 0.42, pcx = sx + sw * 0.5, pcy = sy + sh * 0.42; if (CSA.pk.ty !== fty) CSA.pk = { ty: fty, t }; const pu = eob(clamp((t - CSA.pk.t) / 0.45, 0, 1));
    c.save(); c.globalCompositeOperation = 'lighter'; for (let r = 0; r < 10; r++) { const a = r * TAU / 10 + t * 0.25; c.fillStyle = hexA(fch.col, 0.06); c.beginPath(); c.moveTo(pcx, pcy); c.arc(pcx, pcy, sh * 0.75, a, a + 0.18); c.fill(); }
    const hg = c.createRadialGradient(pcx, pcy, 0, pcx, pcy, sh * 0.5); hg.addColorStop(0, hexA(fch.col, 0.45)); hg.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = hg; c.fillRect(sx, sy - sh * 0.2, sw, sh * 1.2); c.restore();
    c.save(); c.translate(pcx + (1 - pu) * W * 0.25, pcy + Math.sin(t * 2) * 6); c.rotate((1 - pu) * 0.4); cssPort(u, fch, 0, 0, sh * 0.24 / BODY_R * pu, Math.atan2(Math.sin(t * 0.8), Math.cos(t * 0.8)), fch.col, frame); c.restore();
    c.globalAlpha = pu; c.textAlign = 'left'; let fs = sh * 0.16; c.font = UFI(fs); const nm = fch.name.toUpperCase(); while (c.measureText(nm).width > sw * 0.95 && fs > 12) { fs *= 0.9; c.font = UFI(fs); } strokeTxt(c, nm, sx + (1 - pu) * 60, sy + sh * 0.92, 8, '#05060c', '#fff');
    c.fillStyle = fch.col; c.font = UF(900, sh * 0.045); c.fillText((fch.role || '').toUpperCase(), sx + 4, sy + sh + sh * 0.02); c.fillStyle = 'rgba(230,232,245,.85)'; c.font = '600 ' + Math.round(sh * 0.04) + 'px sans-serif';
    wrapT(c, fch.desc || '', sw).slice(0, 3).forEach((l, i) => c.fillText(l, sx + 4, sy + sh * 1.12 + i * sh * 0.065)); c.globalAlpha = 1;
  }
  // player cards
  const n = Math.max(port ? 2 : 4, act.length ? Math.max(...act) + 1 : 0, Math.min(8, CS2.nP0)), cw = Math.min(port ? W * 0.46 : 250, (W - 30) / Math.min(n, port ? 2 : 8)), chh = Math.min(H * (port ? 0.13 : 0.24), 170), perRow = port ? 2 : n, cy0 = on ? H - chh - 10 : port ? H * 0.6 : H * 0.74;
  const fl: { x: number; y: number; w: number; h: number; i: number }[] = [];
  for (let i = 0; i < n; i++) {
    const s = S[i]!, col = CS2.tb ? TCOL[s.tm]! : COLS[i % 8]!, row = i / perRow | 0, x = W / 2 - cw * Math.min(perRow, n) / 2 + (i % perRow) * cw + 5, y = cy0 + row * (chh + 8), w = cw - 10, hh = chh, ch = s.dev ? R[s.ty]! : null, A = CSA.card[i] = lerp(CSA.card[i] || 0, s.dev ? 1 : 0, 0.15);
    const dy = (1 - eo(clamp((te - 0.3 - i * 0.05) / 0.4, 0, 1))) * H * 0.4;
    c.save(); c.globalAlpha = (on ? 0.85 : 1) * (s.dev || i < CS2.nP0 ? 1 : 0.45); c.translate(x + w / 2, y + hh / 2 + dy);
    const g = c.createLinearGradient(-w / 2, -hh / 2, w / 2, hh / 2); g.addColorStop(0, 'rgba(10,12,22,.95)'); g.addColorStop(1, hexA(ch ? ch.col : col, 0.25 + 0.2 * A)); c.fillStyle = g; skewRect(c, -w / 2, -hh / 2, w, hh, hh * 0.15); c.fill(); c.fillStyle = col; skewRect(c, -w / 2, -hh / 2, w, 6, 4); c.fill();
    c.lineWidth = s.rd || s.pg ? 3 : 1.5; c.strokeStyle = s.pg ? '#ffd23a' : s.rd ? '#5cff8a' : hexA(col, 0.7); skewRect(c, -w / 2, -hh / 2, w, hh, hh * 0.15); c.stroke();
    c.textAlign = 'left'; c.font = UFI(hh * 0.2); c.fillStyle = col; c.fillText('P' + (i + 1), -w / 2 + hh * 0.15 + 6, -hh / 2 + hh * 0.26);
    if (ch) {
      const pr = hh * 0.24; cssPort(u, ch, -w / 2 + hh * 0.15 + pr + 6, hh * 0.1, pr / BODY_R * (0.9 + 0.1 * A), -Math.PI / 2 + Math.sin(t * 2 + i) * 0.5, col, frame);
      c.textAlign = 'left'; let fs = hh * 0.19; c.font = UFI(fs); const nm = ch.name.toUpperCase(), tx = -w / 2 + hh * 0.15 + pr * 2 + 18, mw = w / 2 - tx - 8; while (c.measureText(nm).width > mw && fs > 9) { fs *= 0.9; c.font = UFI(fs); } c.fillStyle = '#fff'; c.fillText(nm, tx, hh * 0.05);
      c.font = 'bold ' + Math.round(hh * 0.09) + 'px monospace'; c.fillStyle = '#aab'; c.fillText(devName(s.dev!), tx, hh * 0.2); c.fillStyle = s.pg ? '#ffd23a' : s.rd ? '#5cff8a' : '#ccd';
      c.fillText(s.pg ? 'IN THE ARENA' : s.rd ? (h.touch ? 'TAP ME = TRY IT' : 'PARRY = TRY IT') : (h.touch ? 'TAP AGAIN = READY' : 'ATTACK = READY'), tx, hh * 0.33);
    } else { c.textAlign = 'center'; c.font = 'bold ' + Math.round(hh * 0.12) + 'px monospace'; c.fillStyle = '#889'; c.fillText(i < CS2.nP0 ? 'CPU LV ' + SET.cpuLv : (h.touch ? 'TAP A FIGHTER' : 'ATTACK = JOIN'), 0, hh * 0.1); }
    if (s.rd && CSA.rdT[i] == null) CSA.rdT[i] = t; if (!s.rd) delete CSA.rdT[i];
    if (s.rd) { const ru = clamp((t - CSA.rdT[i]!) / 0.35, 0, 1), sc = 1 + (1 - eob(ru)) * 1.5; c.save(); c.translate(w * 0.3, -hh * 0.3); c.rotate(-0.12); c.scale(sc, sc); c.globalAlpha *= ru; c.strokeStyle = '#5cff8a'; c.lineWidth = 3; c.fillStyle = 'rgba(5,6,12,.85)'; c.fillRect(-hh * 0.34, -hh * 0.1, hh * 0.68, hh * 0.2); c.strokeRect(-hh * 0.34, -hh * 0.1, hh * 0.68, hh * 0.2); c.fillStyle = '#5cff8a'; c.font = UFI(hh * 0.13); c.textAlign = 'center'; c.fillText('READY!', 0, hh * 0.045); c.restore(); }
    if (CS2.tb && (s.dev || i < CS2.nP0)) {
      const fx = -w / 2 + hh * 0.15 + w * 0.24, fy = -hh / 2 + hh * 0.08, fs = hh * 0.2, tc = TCOL[s.tm]!; c.save(); c.translate(fx, fy); c.fillStyle = '#05060c'; c.fillRect(-2, -2, fs * 1.5 + 4, fs * 1.1 + 4); c.fillStyle = '#ddd'; c.fillRect(0, 0, fs * 0.12, fs * 1.1);
      c.fillStyle = tc; c.beginPath(); c.moveTo(fs * 0.12, 0); c.lineTo(fs * 1.4, fs * 0.2 + Math.sin(t * 6 + i) * fs * 0.06); c.lineTo(fs * 1.25, fs * 0.45); c.lineTo(fs * 1.4, fs * 0.7 + Math.sin(t * 6 + i + 1) * fs * 0.06); c.lineTo(fs * 0.12, fs * 0.62); c.closePath(); c.fill(); c.restore();
      fl.push({ x: x + w / 2 + fx - 6, y: y + hh / 2 + fy - 6 + dy, w: fs * 1.5 + 12, h: fs * 1.1 + 12, i });
    }
    c.restore(); if (s.dev === 'k0') u.hot.push({ x, y, w, h: hh, hover: () => {}, click: () => { if (s.rd) { s.pg = !s.pg; h.sfx(s.pg ? 'joined' : 'cancel00', 0.7); } } });
  }
  // team flags: a click cycles the colour (before the card so it wins)
  for (const f of fl) u.hot.unshift({ x: f.x, y: f.y, w: f.w, h: f.h, hover: () => {}, click: () => { const q = S[f.i]!; q.tm = (q.tm + 1) % 4; h.sfx('se_select00', 0.7); } });
  // fight button
  const J = S.filter(s => s.dev), all = J.length > 0 && J.every(s => s.rd);
  if (all && !on) {
    const bw = port ? Math.min(380, W * 0.7) : Math.min(380, gw * 0.7), bh = Math.max(44, H * 0.075), x = port ? W / 2 - bw / 2 : gx0 + gw / 2 - bw / 2, y = (port ? cy0 - bh - 12 : Math.min(gy0 + gh + 6, cy0 - bh - 8)) + Math.sin(t * 5) * 3;
    c.save(); c.shadowColor = '#5cff8a'; c.shadowBlur = 20 + 8 * Math.sin(t * 6); c.fillStyle = '#5cff8a'; skewRect(c, x, y, bw, bh, bh * 0.3); c.fill(); c.shadowBlur = 0; c.fillStyle = '#05060c'; c.textAlign = 'center'; c.font = UFI(bh * 0.5); c.fillText(h.touch ? '▶ TAP TO FIGHT!' : '▶ START: FIGHT!', x + bw / 2, y + bh * 0.68); c.restore();
    u.hot.push({ x, y, w: bw, h: bh, hover: () => {}, click: () => cssGo(h) });
  } else if (!on) { c.textAlign = 'center'; c.font = 'bold ' + Math.round(Math.max(11, H * 0.018)) + 'px monospace'; c.fillStyle = '#aab'; c.fillText(h.touch ? 'Tap a fighter to join · tap it again: ready · tap your card: try it in the arena' : 'Join with Attack · pick your fighter · Parry = try it in the arena · B / Esc = back', W / 2, cy0 - 12); }
  c.restore();
  // nobody joined: CPU BATTLE shortcut
  if (!S.some(s => s.dev)) {
    const bw = Math.min(300, W * 0.42), bh = Math.max(40, H * 0.06), x = W - bw - 18, y = H * 0.03; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.shadowColor = '#ff3355'; c.shadowBlur = 14 + 6 * Math.sin(t * 4); c.fillStyle = '#ff3355'; skewRect(c, x, y, bw, bh, bh * 0.3); c.fill(); c.shadowBlur = 0;
    c.fillStyle = '#05060c'; c.textAlign = 'center'; c.font = UFI(bh * 0.42); c.fillText('▶ CPU BATTLE', x + bw / 2, y + bh * 0.66); c.font = 'bold ' + Math.round(bh * 0.22) + 'px monospace'; c.fillStyle = '#fff'; c.fillText(h.touch ? 'tap to watch CPUs fight' : 'Start (pad) / click: CPUs only', x + bw / 2, y + bh + bh * 0.3); c.restore();
    u.hot.push({ x, y, w: bw, h: bh, hover: () => {}, click: () => cssGo(h) });
  }
}
