'use strict';
/**
 * Audio spectrum in the background (owner request). Toggle: playlist > VIDEO OPTIONS > "Audio spectrum in the background".
 * Colours: the current video's palette (--c1 / --c2 computed by the playlist), so it matches the background.
 * - YouTube playing: drawn on a canvas INSIDE the background video layer (#ytvw), so it gets exactly the video's opacity, blur and
 *   Reverse Ideology flip. The page cannot read YouTube's sound (browser security), so this one is animated from an estimated beat.
 * - Game music (playlist off): real spectrum (WebAudio analyser on the music element), drawn in the menu background with the same
 *   OPACITY and BLUR sliders.
 * Effects OFF: no brightness pulse, softer motion.
 */
const SPX = { on: false, cv: null, cx: null, an: null, src: null, buf: null, lv: new Float32Array(64), c1: '#ff2d7a', c2: '#3ad6ff', last: 0, kick: 0, real: false };
try { SPX.on = localStorage.getItem('sf_spec') === '1'; } catch (e) {}
const specYT = () => typeof YTP !== 'undefined' && YTP.Y.on && !YTP.Y.gone && YTP.Y.st === 1;
const specGame = () => !specYT() && typeof MAUD !== 'undefined' && MAUD && !MAUD.paused && MAUD.volume > 0;

/** Real FFT of the game music (connects the music element to the analyser once; same-origin sources only, which game music is). */
function specAnalyser() {
  if (SPX.an || !AC || AC.state !== 'running' || !MAUD) return SPX.an;
  try { SPX.src = AC.createMediaElementSource(MAUD); SPX.an = AC.createAnalyser(); SPX.an.fftSize = 2048; SPX.an.smoothingTimeConstant = .78; SPX.src.connect(SPX.an); SPX.an.connect(AC.destination); SPX.buf = new Uint8Array(SPX.an.frequencyBinCount); } catch (e) { SPX.an = null; }
  return SPX.an;
}
/** Updates the 64 band levels (0..1) for this frame. */
function specLevels(t) {
  const n = SPX.lv.length, tg = new Float32Array(n);
  if (specGame() && specAnalyser()) { SPX.real = true; SPX.an.getByteFrequencyData(SPX.buf); const N = SPX.buf.length;
    for (let i = 0; i < n; i++) { const a = Math.floor(2 * Math.pow(N / 2, i / n)), b = Math.max(a + 1, Math.floor(2 * Math.pow(N / 2, (i + 1) / n))); let s = 0; for (let k = a; k < b && k < N; k++) s = Math.max(s, SPX.buf[k]); tg[i] = Math.pow(s / 255, 1.4); } }
  else if (specYT()) { SPX.real = false; const bp = t * 2.05, ph = bp % 1; SPX.kick = Math.exp(-ph * 5.5) * (Math.floor(bp) % 4 === 3 ? .7 : 1);
    for (let i = 0; i < n; i++) { const f = i / n, wob = .5 + .5 * Math.sin(t * (1.3 + i * .37) + i * 2.1) * Math.sin(t * (.7 + i * .11) + i);
      tg[i] = Math.min(1, (1 - f) ** .8 * .42 + wob * .32 * (1 - f * .5) + SPX.kick * (f < .16 ? .55 : .14) * (1 - f) + (f > .55 ? .08 * Math.sin(t * 9 + i) : 0)); } }
  const up = fxOff ? .25 : .55, dn = fxOff ? .06 : .12;
  for (let i = 0; i < n; i++) SPX.lv[i] += (tg[i] - SPX.lv[i]) * (tg[i] > SPX.lv[i] ? up : dn);
  let bass = 0; for (let i = 0; i < 8; i++) bass += SPX.lv[i]; return bass / 8;
}
/** Draws the spectrum on context c (w x h): mirrored bars along the bottom + a ring of ticks around the centre. */
function specDraw(c, w, h, bass) {
  const L = SPX.lv, n = L.length, bw = w / (n * 2), base = h * .985, top = h * .38, g = c.createLinearGradient(0, base, 0, base - top);
  g.addColorStop(0, SPX.c2); g.addColorStop(.6, SPX.c1); g.addColorStop(1, '#fff');
  c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = g;
  for (let j = 0; j < n * 2; j++) { const i = j < n ? n - 1 - j : j - n, v = L[i], bh = Math.max(2, v * top), x = j * bw;
    c.globalAlpha = .22; c.fillRect(x - bw * .35, base - bh * 1.04, bw * 1.7, bh * 1.04); // soft glow
    c.globalAlpha = .9; c.beginPath(); c.roundRect(x + bw * .18, base - bh, bw * .64, bh, bw * .32); c.fill(); }
  const cx = w / 2, cy = h * .46, R = Math.min(w, h) * .16 * (1 + bass * (fxOff ? .06 : .18)), rg = c.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
  rg.addColorStop(0, SPX.c1); rg.addColorStop(1, SPX.c2); c.strokeStyle = rg; c.lineCap = 'round'; c.lineWidth = Math.max(2, R * .035);
  c.globalAlpha = fxOff ? .55 : .45 + bass * .4; c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.stroke();
  c.globalAlpha = .85; c.beginPath(); for (let k = 0; k < n * 2; k++) { const i = k < n ? k : n * 2 - 1 - k, a = k / (n * 2) * TAU - Math.PI / 2, l = R * (.06 + L[i] * .55);
    c.moveTo(cx + Math.cos(a) * (R * 1.06), cy + Math.sin(a) * (R * 1.06)); c.lineTo(cx + Math.cos(a) * (R * 1.06 + l), cy + Math.sin(a) * (R * 1.06 + l)); } c.stroke();
  c.restore();
}
function specColors() { const r = document.getElementById('yt'); if (!r) return; const cs = getComputedStyle(r), a = cs.getPropertyValue('--c1').trim(), b = cs.getPropertyValue('--c2').trim(); if (a) SPX.c1 = a; if (b) SPX.c2 = b; }
// YouTube case: a canvas inside the background video layer
function specLoop(now) {
  requestAnimationFrame(specLoop); const vw = document.getElementById('ytvw'); if (!vw) return;
  if (!SPX.cv) { SPX.cv = document.createElement('canvas'); SPX.cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none'; vw.appendChild(SPX.cv); SPX.cx = SPX.cv.getContext('2d'); }
  if ((now | 0) % 30 < 17) specColors();
  const show = SPX.on && specYT() && vw.classList.contains('bg'), cv = SPX.cv;
  if (!show) { if (cv.style.display !== 'none') cv.style.display = 'none'; if (SPX.on && !specYT()) specLevels(now / 1000); return; }
  cv.style.display = ''; const w = Math.max(2, vw.clientWidth >> 1), h = Math.max(2, vw.clientHeight >> 1); if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
  const bass = specLevels(now / 1000); SPX.cx.clearRect(0, 0, w, h); specDraw(SPX.cx, w, h, bass);
}
requestAnimationFrame(specLoop);
// game-music case: drawn in the menu background, with the playlist's OPACITY and BLUR sliders
{ const B0 = uiBG; uiBG = word => { B0(word); if (!SPX.on || !specGame() || typeof YTP === 'undefined') return; const op = (YTP.Y.op ?? 60) / 100; if (op <= 0) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = op; if (YTP.Y.bl) ctx.filter = 'blur(' + (YTP.Y.bl * .6) + 'px)'; specDraw(ctx, W, H, (() => { let s = 0; for (let i = 0; i < 8; i++) s += SPX.lv[i]; return s / 8; })()); ctx.restore(); }; }
// the toggle, in the playlist's VIDEO OPTIONS
{ const pv2 = document.querySelector('#yt .pv2'), ref = pv2 && pv2.querySelector('.ph.s');
  if (pv2) { const l = document.createElement('label'); l.className = 'tg'; l.innerHTML = '<input type="checkbox" class="spc"><i></i>Audio spectrum in the background'; pv2.insertBefore(l, ref || null);
    const cb = l.querySelector('input'); cb.checked = SPX.on; cb.onchange = () => { SPX.on = cb.checked; try { localStorage.setItem('sf_spec', SPX.on ? '1' : '0'); } catch (e) {} }; } }
