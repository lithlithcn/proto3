'use strict';
/**
 * GRAZE RUSH (mini-game, EXTRAS menu). Survive ever-denser danmaku waves fired from the core at the centre.
 * Score comes from GRAZING bullets (passing very close without being hit): each graze feeds a chain -> multiplier (x1..x8)
 * and the BURST gauge. Full gauge + SPELL button = GRAZE BURST: every bullet on screen turns into points.
 * 3 lives each, 1-2 local players (P2 joins on the title card with its SHOT button). Best score kept in the browser.
 * Self-contained: own state (GR), own bullets, own drawing in a fixed 1280x720 arena scaled to the screen.
 * Uses from the game only: defMode/modeInput (engine), sfx, fxOff/fxLow, TAU, UF/UFI fonts, strokeTxt.
 */
const GRW = 1280, GRH = 720, GRC = { x: 640, y: 360 }, GR_HIT = 3.5, GR_GRAZE = 22, GR_COLS = ['#ff3a6e', '#3ad6ff', '#ffd23a', '#9b6bff', '#5cff9a', '#ff8a3a'];
const GR = { st: 'ready', t: 0, time: 0, wave: 0, wt: 0, pat: 0, order: [], B: [], FX: [], TX: [], P: [], shake: 0, best: 0, prev: [{}, {}], newBest: false, pause: false };
try { GR.best = +localStorage.getItem('sf_grazerush_best') || 0; } catch (e) {}

const grRand = (a, b) => a + Math.random() * (b - a);
const grShot = (x, y, a, sp, r, c, acc) => { if (GR.B.length < 1400) GR.B.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r, c, acc: acc || 0, g: 0 }); };
const grDiff = () => Math.min(9, 1 + GR.wave * .32);
const GR_EXTEND = [15000, 40000, 80000, 150000, 250000]; // extra life at each of these scores
const grAlive = () => GR.P.filter(p => p.lives > 0);
const grNear = () => { let b = null, d = 1e9; for (const p of grAlive()) { const k = (p.x - GRC.x) ** 2 + (p.y - GRC.y) ** 2; if (k < d) { d = k; b = p; } } return b || { x: GRC.x, y: GRH };};

/** Wave patterns: f(t = frame in wave, d = difficulty 1..9). All fire from the core. */
const GR_PATS = [
  { n: 'BLOOM', f(t, d) { if (t % Math.max(9, 30 - 2 * d | 0)) return; const n = 12 + 3 * d | 0, o = t * .13; for (let i = 0; i < n; i++) grShot(GRC.x, GRC.y, o + i * TAU / n, 2.1 + .25 * d, 7, GR_COLS[0]); } },
  { n: 'SPIRAL', f(t, d) { if (t % 3) return; const k = 3 + (d / 2 | 0); for (let i = 0; i < k; i++) grShot(GRC.x, GRC.y, t * .1 + i * TAU / k, 2.5 + .2 * d, 6, GR_COLS[1]); } },
  { n: 'HUNTER', f(t, d) { const p = grNear(), a = Math.atan2(p.y - GRC.y, p.x - GRC.x);
      if (t % Math.max(12, 40 - 3 * d | 0) === 0) { const n = 5 + d | 0; for (let i = 0; i < n; i++) grShot(GRC.x, GRC.y, a + (i - (n - 1) / 2) * .11, 3.2 + .3 * d, 8, GR_COLS[2]); }
      if (t % 50 === 25) for (let i = 0; i < 16; i++) grShot(GRC.x, GRC.y, i * TAU / 16 + a, 1.8, 5, GR_COLS[5]); } },
  { n: 'FLOWER', f(t, d) { if (t % 5) return; for (let i = 0; i < 8; i++) grShot(GRC.x, GRC.y, t * .05 + i * TAU / 8, 1.5 + 1.5 * (1 + Math.sin(t * .09)) / 2 + .2 * d, 6, GR_COLS[3]); } },
  { n: 'RAIN', f(t, d) { if (t % Math.max(2, 7 - d / 2 | 0)) return; grShot(grRand(0, GRW), -10, Math.PI / 2 + grRand(-.25, .25), 2 + .25 * d, 5, GR_COLS[4]);
      if (d > 3 && t % 9 === 0) grShot(-10, grRand(0, GRH), grRand(-.3, .3), 2.4 + .2 * d, 6, GR_COLS[4]); if (t % 60 === 0) for (let i = 0; i < 10; i++) grShot(GRC.x, GRC.y, i * TAU / 10 + t, 2, 9, GR_COLS[0]); } },
  { n: 'CROSSFIRE', f(t, d) { if (t % 4) return; for (const s of [1, -1]) for (let i = 0; i < 2 + (d / 3 | 0); i++) grShot(GRC.x, GRC.y, s * t * .07 + i * TAU / (2 + (d / 3 | 0)), 2.3 + .2 * d, 6, s > 0 ? GR_COLS[1] : GR_COLS[0]); } },
  { n: 'SURGE', f(t, d) { if (t % Math.max(24, 48 - 3 * d | 0)) return; const n = 20 + 2 * d | 0, o = grRand(0, TAU); for (let i = 0; i < n; i++) grShot(GRC.x, GRC.y, o + i * TAU / n, .4, 8, GR_COLS[5], .045 + .006 * d); } },
];
const GR_WAVE = 450, GR_GAP = 70; // 7.5 s of fire, then a short breather

function grNewPlayer(slot) { return { slot, x: GRC.x + (slot ? 120 : -120), y: GRH - 110, lives: 3, inv: 90, score: 0, ext: 0, waveHit: false, chain: 0, chainT: 0, mult: 1, meter: 0, graze: 0, maxChain: 0, sfxT: 0, c: slot ? '#3ad6ff' : '#ff3a6e', focus: false }; }
function grStart() { Object.assign(GR, { st: 'play', t: 0, wave: 0, wt: -60, B: [], FX: [], TX: [], newBest: false, pause: false }); GR.order = []; for (const p of GR.P) Object.assign(p, grNewPlayer(p.slot)); sfx('ok00'); }
function grText(x, y, s, c, z) { if (GR.TX.length < 60) GR.TX.push({ x, y, s, c, z: z || 18, t: 50 }); }
function grSpark(x, y, c, n, sp) { for (let i = 0; i < n && GR.FX.length < 500; i++) { const a = grRand(0, TAU), v = grRand(.5, sp || 3); GR.FX.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: grRand(18, 34), c }); } }
function grShake(n) { if (!fxOff) GR.shake = Math.max(GR.shake, fxLow ? n * .4 : n); }
/** One button edge (press) per slot: shot / melee / heavy / parry all mean "confirm". */
function grPress(slot, I, k) { const was = GR.prev[slot][k]; GR.prev[slot][k] = !!I.b[k]; return !!I.b[k] && !was; }
const grOk = (s, I) => ['shot', 'melee', 'heavy', 'parry'].some(k => grPress(s, I, k));

function grHit(p) {
  p.lives--; p.inv = 120; p.waveHit = true; if (p.chain >= 20) grText(p.x, p.y - 30, 'CHAIN LOST', '#aaa', 16); p.chain = 0; p.mult = 1; grShake(10); sfx('damage00', .9);
  grSpark(p.x, p.y, p.c, 40, 6); GR.B = GR.B.filter(b => { const k = (b.x - p.x) ** 2 + (b.y - p.y) ** 2 > 160 * 160; if (!k) grSpark(b.x, b.y, b.c, 2); return k; });
  if (p.lives <= 0) { grText(p.x, p.y - 40, 'DOWN!', p.c, 26); sfx('dissapear'); }
}
function grBurst(p) {
  p.meter = 0; p.inv = Math.max(p.inv, 60); let n = 0; for (const b of GR.B) { n++; grSpark(b.x, b.y, b.c, 1, 2); } p.score += n * 5 * p.mult; GR.B = [];
  grText(p.x, p.y - 50, 'GRAZE BURST +' + n * 5 * p.mult, '#fff', 26); grShake(14); sfx('bombexplosion', .8); GR.FX.push({ ring: 1, x: p.x, y: p.y, t: 40, c: p.c });
}

function grStep() {
  if (GR.shake > 0) GR.shake *= .85;
  const ins = [0, 1].map(s => modeInput(s));
  if (GR.st === 'ready') { if (grOk(0, ins[0])) grStart(); else if (grOk(1, ins[1]) && GR.P.length < 2) { GR.P.push(grNewPlayer(1)); sfx('joined'); } return; }
  if (GR.st === 'over') { GR.t++; if (GR.t > 50 && (grOk(0, ins[0]) || grOk(1, ins[1]))) grStart(); return; }
  if (GR.pause) return;
  GR.t++; GR.wt++;
  const d = grDiff();
  if (GR.wt === GR_WAVE) for (const p of grAlive()) { if (!p.waveHit) { const v = 1000 * (GR.wave + 1); p.score += v; grText(p.x, p.y - 60, 'NO MISS +' + v, '#5cff9a', 22); sfx('coin', .6); } p.waveHit = false; }
  if (GR.wt >= GR_WAVE + GR_GAP) { GR.wt = 0; GR.wave++; }
  if (GR.wt === 0) { if (!GR.order.length) GR.order = GR_PATS.map((_, i) => i).sort(() => Math.random() - .5); GR.pat = GR.order.pop(); grText(GRC.x, GRC.y - 90, 'WAVE ' + (GR.wave + 1) + ' · ' + GR_PATS[GR.pat].n, '#fff', 30); sfx('alert', .5); }
  if (GR.wt >= 0 && GR.wt < GR_WAVE) { GR_PATS[GR.pat].f(GR.wt, d); if (GR.wave >= 4 && GR.wt % 2 === 0) GR_PATS[(GR.pat + 3) % GR_PATS.length].f(GR.wt + 1, d * .45); } // late waves stack a second, lighter pattern
  for (const p of GR.P) {
    if (p.lives <= 0) continue; const I = ins[p.slot];
    p.focus = !!(I.b.focus || I.b.dash); const sp = p.focus ? 2.1 : 4.8;
    p.x = Math.max(12, Math.min(GRW - 12, p.x + I.x * sp)); p.y = Math.max(12, Math.min(GRH - 12, p.y + I.y * sp));
    if (p.inv > 0) p.inv--; if (p.sfxT > 0) p.sfxT--;
    if (p.chainT > 0 && --p.chainT === 0) { if (p.chain >= 20) grText(p.x, p.y - 30, 'CHAIN END ×' + p.chain, '#aaa', 15); p.chain = 0; p.mult = 1; }
    p.score += 1; // surviving pays a little; grazing pays a lot
    if (p.ext < GR_EXTEND.length && p.score >= GR_EXTEND[p.ext]) { p.ext++; p.lives++; grText(p.x, p.y - 50, 'EXTEND!', '#5cff9a', 28); sfx('1up', .8); }
    if (grPress(p.slot, I, 'spell') && p.meter >= 100) grBurst(p);
  }
  for (const b of GR.B) {
    if (b.acc) { const l = Math.hypot(b.vx, b.vy); if (l < 5.5) { b.vx *= 1 + b.acc / l; b.vy *= 1 + b.acc / l; } }
    b.x += b.vx; b.y += b.vy;
    for (const p of GR.P) {
      if (p.lives <= 0) continue; const dx = b.x - p.x, dy = b.y - p.y, d2 = dx * dx + dy * dy, hr = b.r * .7 + GR_HIT;
      if (d2 < hr * hr && p.inv <= 0) { grHit(p); b.x = -999; break; }
      const gr = b.r + GR_GRAZE, bit = 1 << p.slot;
      if (d2 < gr * gr && !(b.g & bit)) { b.g |= bit; p.graze++; p.chain++; p.chainT = 120; p.maxChain = Math.max(p.maxChain, p.chain);
        const m = 1 + Math.min(7, p.chain / 10 | 0); if (m > p.mult) { grText(p.x, p.y - 34, '×' + m + '!', '#ffd23a', 22); sfx('se_kira00', .5); } p.mult = m;
        p.score += 25 * p.mult; const was = p.meter; p.meter = Math.min(100, p.meter + 1.4); if (was < 100 && p.meter >= 100) { grText(p.x, p.y + 40, 'BURST READY', '#fff', 18); sfx('se_powerup', .7); }
        grSpark(p.x + dx * .5, p.y + dy * .5, '#fff', 3, 2.5); if (p.sfxT <= 0) { sfx('graze', .35); p.sfxT = 4; } }
    }
  }
  GR.B = GR.B.filter(b => b.x > -40 && b.x < GRW + 40 && b.y > -40 && b.y < GRH + 40);
  for (const f of GR.FX) { if (!f.ring) { f.x += f.vx; f.y += f.vy; f.vx *= .93; f.vy *= .93; } f.t--; } GR.FX = GR.FX.filter(f => f.t > 0);
  for (const x of GR.TX) { x.y -= .6; x.t--; } GR.TX = GR.TX.filter(x => x.t > 0);
  if (!grAlive().length) { GR.st = 'over'; GR.time = GR.t; GR.t = 0; const top = Math.max(...GR.P.map(p => p.score)); if (top > GR.best) { GR.best = top; GR.newBest = true; try { localStorage.setItem('sf_grazerush_best', String(top)); } catch (e) {} } sfx(GR.newBest ? 'bonus' : 'dissapointed_or_failed', .8); }
}

function grDrawArena(c) {
  const g = c.createRadialGradient(GRC.x, GRC.y, 40, GRC.x, GRC.y, 760); g.addColorStop(0, '#1a1030'); g.addColorStop(1, '#05060c'); c.fillStyle = g; c.fillRect(0, 0, GRW, GRH);
  c.strokeStyle = 'rgba(255,255,255,.05)'; c.lineWidth = 2; for (let i = 1; i < 7; i++) { c.beginPath(); c.arc(GRC.x, GRC.y, i * 110 + (GR.t * .4) % 110, 0, TAU); c.stroke(); }
  c.strokeStyle = 'rgba(58,255,200,.35)'; c.lineWidth = 3; c.strokeRect(2, 2, GRW - 4, GRH - 4);
  // the core: two counter-rotating hexagons
  for (const [r, s, col] of [[34, .02, '#3affc8'], [22, -.035, '#fff']]) { c.beginPath(); for (let i = 0; i < 6; i++) { const a = GR.t * s + i * TAU / 6; c.lineTo(GRC.x + Math.cos(a) * r, GRC.y + Math.sin(a) * r); } c.closePath(); c.strokeStyle = col; c.lineWidth = 3; c.stroke(); }
}
function grDrawPlayer(c, p) {
  if (p.lives <= 0) return; if (p.inv > 0 && (p.inv >> 2) % 2 && !fxOff) c.globalAlpha = .45;
  c.fillStyle = p.c; c.beginPath(); c.arc(p.x, p.y, 12, 0, TAU); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke();
  if (p.focus) { c.strokeStyle = 'rgba(255,255,255,.25)'; c.beginPath(); c.arc(p.x, p.y, GR_GRAZE + 6, 0, TAU); c.stroke(); }
  c.fillStyle = '#fff'; c.beginPath(); c.arc(p.x, p.y, GR_HIT + 1, 0, TAU); c.fill(); c.fillStyle = p.c; c.beginPath(); c.arc(p.x, p.y, GR_HIT - 1, 0, TAU); c.fill();
  c.globalAlpha = 1;
}
function grHud(c, p, right) {
  const x = right ? GRW - 24 : 24; c.textAlign = right ? 'right' : 'left'; c.font = UFI(34); strokeTxt(String(p.score).padStart(8, '0'), x, 46, 6, '#05060c', p.c);
  c.font = UF(800, 16); c.fillStyle = '#fff'; c.fillText('LIVES ' + '● '.repeat(Math.max(0, p.lives)).trim() + '   GRAZE ' + p.graze, x, 72);
  if (p.chain > 0) { c.font = UFI(22); c.fillStyle = '#ffd23a'; c.fillText('CHAIN ' + p.chain + '  ×' + p.mult, x, 100); }
  const bw = 220, bx = right ? x - bw : x; c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(bx, 112, bw, 8); c.fillStyle = p.meter >= 100 ? '#fff' : p.c; c.fillRect(right ? bx + bw * (1 - p.meter / 100) : bx, 112, bw * p.meter / 100, 8);
  if (p.meter >= 100) { c.font = UF(800, 13); c.fillStyle = '#fff'; c.fillText('BURST READY: SPELL', x, 138); }
}
function grCard(c, title, lines, col) {
  c.fillStyle = 'rgba(5,6,12,.72)'; c.fillRect(0, 0, GRW, GRH); c.textAlign = 'center'; c.font = UFI(86); strokeTxt(title, GRC.x, 250, 10, '#05060c', col);
  c.font = UF(800, 22); lines.forEach((l, i) => { c.fillStyle = i === lines.length - 1 && (GR.t >> 5) % 2 ? 'rgba(255,255,255,.55)' : '#fff'; c.fillText(l, GRC.x, 320 + i * 38); });
}
function grRender(c) {
  const s = Math.min(W / GRW, H / GRH), sh = GR.shake > .3 ? GR.shake : 0;
  c.translate((W - GRW * s) / 2 + (sh ? grRand(-sh, sh) : 0), (H - GRH * s) / 2 + (sh ? grRand(-sh, sh) : 0)); c.scale(s, s);
  grDrawArena(c);
  for (const b of GR.B) { c.fillStyle = b.c; c.beginPath(); c.arc(b.x, b.y, b.r, 0, TAU); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(b.x, b.y, b.r * .5, 0, TAU); c.fill(); }
  for (const f of GR.FX) { if (f.ring) { c.strokeStyle = f.c; c.globalAlpha = f.t / 40; c.lineWidth = 6; c.beginPath(); c.arc(f.x, f.y, (40 - f.t) * 22, 0, TAU); c.stroke(); } else { c.globalAlpha = Math.min(1, f.t / 20); c.fillStyle = f.c; c.fillRect(f.x - 2, f.y - 2, 4, 4); } } c.globalAlpha = 1;
  for (const p of GR.P) grDrawPlayer(c, p);
  for (const x of GR.TX) { c.globalAlpha = Math.min(1, x.t / 20); c.textAlign = 'center'; c.font = UFI(x.z); strokeTxt(x.s, x.x, x.y, 4, '#05060c', x.c); } c.globalAlpha = 1;
  GR.P.forEach((p, i) => grHud(c, p, i === 1));
  c.textAlign = 'center'; c.font = UF(800, 16); c.fillStyle = 'rgba(255,255,255,.7)'; if (GR.st === 'play') c.fillText('WAVE ' + (GR.wave + 1) + '   ' + (GR.t / 60 | 0) + ' s   BEST ' + GR.best, GRC.x, 28);
  if (GR.st === 'ready') grCard(c, 'GRAZE RUSH', ['Bullets that brush past you (without touching your white dot) = points.', 'Chain grazes for up to ×8.  Hold FOCUS (or DASH) to move slowly.', 'Full gauge + SPELL = GRAZE BURST: every bullet turns into points.', 'BEST ' + GR.best + (GR.P.length < 2 ? '   ·   Player 2: press SHOT to join' : '   ·   2 PLAYERS'), 'Press SHOT to start'], '#3affc8');
  else if (GR.st === 'over') grCard(c, GR.newBest ? 'NEW BEST!' : 'GAME OVER', [...GR.P.map((p, i) => 'P' + (i + 1) + '  ' + p.score + ' pts  ·  ' + p.graze + ' grazes  ·  best chain ' + p.maxChain), 'Survived ' + (GR.time / 60 | 0) + ' s  ·  wave ' + (GR.wave + 1) + '  ·  BEST ' + GR.best, GR.t > 50 ? 'SHOT: retry   ·   BACK: menu' : ''], GR.newBest ? '#ffd23a' : '#ff3a6e');
  else if (GR.pause) grCard(c, 'PAUSED', ['OK / START: resume', 'BACK: quit to the menu'], '#fff');
}

defMode({
  id: 'graze-rush', name: 'Graze Rush', touch: true,
  desc: 'Survive endless danmaku waves. Brush past bullets to score, chain grazes, burst the screen. 1-2 players.',
  info: () => 'BEST ' + GR.best,
  enter() { GR.st = 'ready'; GR.t = 0; GR.B = []; GR.FX = []; GR.TX = []; GR.P = [grNewPlayer(0)]; GR.prev = [{ shot: 1, melee: 1, heavy: 1, parry: 1 }, { shot: 1, melee: 1, heavy: 1, parry: 1 }]; },
  step: grStep,
  render: grRender,
  nav(ev) {
    if (GR.st === 'play') { if (GR.pause) { if (ev === 'back') return false; if (ev === 'ok' || ev === 'start') { GR.pause = false; sfx('ok00'); } return true; }
      if (ev === 'back' || ev === 'start' || ev === 'sel') { GR.pause = true; sfx('cancel00'); } return true; }
    if (ev === 'ok' && GR.st !== 'play') { if (GR.st === 'ready' || GR.t > 50) grStart(); return true; }
    return false;
  },
});
