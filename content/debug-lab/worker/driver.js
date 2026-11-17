'use strict';
/**
 * Debug lab driver. Runs INSIDE a game sandbox (browser Web Worker on the player's own PC, or node vm), after the game scripts. No rendering.
 *   labOffline(cfg)  one match -> {frames, rules, issues, ms}
 *   labNetOpts(cfg) / labNetBoot(o,id,send,botSeed) / labNetTick()  one peer of a simulated ONLINE match (the game's real netcode)
 * cfg: {seed, kind:'cpu'|'rollback'|'bots'|'online', fighters, cpu, items, lives, timer, map ('random' or a value), frames,
 *       bots:'expert'|'chaos'|'spam'|'edge'|'cluster'|'items'|'parry'|'cpu', item:'all'|<item key>, cards (1-64), fast (cards spawn fast)}
 * Issue types: crash, caught:<where>, desync, rollback, nan, oob (out of the map), softlock (same non-idle state 15 s), invalid
 * (impossible values), flood (bullets/entities/effects explode), slow (one frame > 60 ms), endless (timer over, no winner), stall, hang.
 * Every issue carries the job (replayable: node tools/campaign.cjs --repro <file>), the rules, a snapshot of the match and the last events.
 */
const LAB = { issues: [], bot: [], rng: 1, seen: new Set(), ev: [], style: [], st: [], cfg: null, rules: null, T0: null };
function labRand() { let x = LAB.rng; x ^= x << 13; x ^= x >>> 17; x ^= x << 5; LAB.rng = x >>> 0; return LAB.rng / 4294967296; }
const labPick = (v, list) => v === 'random' || v == null ? list[labRand() * list.length | 0] : v;
const labChar = p => (CHR[p.shotT - CH0] || {}).k || '?';
function labEv(...a) { LAB.ev.push([typeof frame === 'number' ? frame : -1, ...a]); if (LAB.ev.length > 30) LAB.ev.shift(); }
/** What the match looked like when the issue happened (the part that helps find the cause). */
function labCtx() { try { return { frame, winner, players: P.map(p => ({ id: p.id, char: labChar(p), state: p.state, t: p.t | 0, hp: Math.round(p.hp * 10) / 10, stocks: p.stocks, x: Math.round(p.x), y: Math.round(p.y), inv: p.inv | 0, fx: Object.keys(p.fx || {}).filter(k => p.fx[k] > 0), item: p.lastIt || null, bot: LAB.style[p.id] || (p.cpu ? 'cpu' : '') })),
  effects: Object.keys(CX || {}), counts: { bullets: B.length, entities: ENT.length, fx: FX.length, cards: CARDS.length }, map: { w: T.MAP_W, h: T.MAP_H, warp: WARP > 0 }, events: LAB.ev.slice() }; } catch (e) { return { ctxError: String(e) }; } }
function labIssue(type, e, extra) {
  const st = String(e && e.stack || ''), m = [...st.matchAll(/((?:src|content)\/[^\s)?:]+)(?:\?[^:\s)]*)?:(\d+)/g)].find(x => !x[1].includes('debug-lab')), msg = String(e && e.message || e).slice(0, 400);
  const at = m ? m[1] + ':' + m[2] : '', key = type + '|' + msg.replace(/\d+/g, '#') + '|' + at; if (LAB.seen.has(key)) return; LAB.seen.add(key); // once per match
  LAB.issues.push(Object.assign({ type, msg, at, stack: st.split('\n').slice(0, 10).map(s => s.trim().replace(/https?:\/\/[^\s)]*?\/((?:src|content)\/)/, '$1')).join('\n'), frame: typeof frame === 'number' ? frame : -1, ctx: labCtx() }, extra || {}));
}
errRep = (w, e) => labIssue(w === 'desync' ? 'desync' : 'caught:' + w, e);
// event trail
{ const G = give0; give0 = (p, k) => { labEv('item', p && p.id, k); return G(p, k); }; }
{ const K = ko; ko = (p, why) => { if (p && p.state !== 'dead') labEv('ko', p.id, why || '', p.lastBy); return K(p, why); }; }
{ const S = startSpell; startSpell = (p, o, u) => { labEv(u ? 'ult' : 'spell', p && p.id); return S(p, o, u); }; }

// ---------------- expert bug-hunting bots: each style pushes the game where bugs live
const LAB_STYLES = ['chaos', 'spam', 'edge', 'cluster', 'items', 'parry', 'cpu'];
const labNear = (p, L) => { let b = null, d = 1e18; for (const q of L) { const k = (q.x - p.x) ** 2 + (q.y - p.y) ** 2; if (k < d) { d = k; b = q; } } return b; };
const labTo = (p, x, y) => { const dx = x - p.x, dy = y - p.y, l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l]; };
function labBotIn(i) {
  const p = P[i], s = LAB.bot[i] || (LAB.bot[i] = { x: 0, y: 0, b: {}, t: 0, sw: 0 }); if (!p) return { x: 0, y: 0, b: {} };
  if (LAB.cfg && LAB.cfg.bots === 'expert' && --s.sw <= 0) { s.sw = 300 + labRand() * 600 | 0; const L = LAB.cfg.noCpu ? LAB_STYLES.slice(0, -1) : LAB_STYLES; LAB.style[i] = L[labRand() * L.length | 0]; } // styles change during the match (online: no CPU AI, it writes into the shared match state)
  const st = LAB.style[i] || 'chaos', b = {}, foes = P.filter(q => q !== p && q.state !== 'dead');
  if (st === 'cpu') { try { const q = tgt(p); return cpuInput(p, q); } catch (e) { labIssue('crash', e, { where: 'cpuInput' }); } }
  if (st === 'chaos') { const a = labRand() * TAU; for (const k of BTN) if (labRand() < .3) b[k] = true; return { x: Math.cos(a), y: Math.sin(a), b }; } // new random input every frame
  if (st === 'spam') { const on = frame % 2 === 0; for (const k of BTN) b[k] = on; const a = frame * .37; return { x: Math.cos(a), y: Math.sin(a), b }; } // every button, press/release each frame
  if (st === 'edge') { if (--s.t <= 0) { s.t = 60 + labRand() * 120 | 0; s.cx = labRand() < .5 ? -1e5 : 1e5; s.cy = labRand() < .5 ? -1e5 : 1e5; } const [x, y] = labTo(p, s.cx, s.cy); b.dash = frame % 20 < 3; b.shot = true; b.heavy = frame % 45 < 2; return { x, y, b }; } // corners / walls / warp edges
  if (st === 'cluster') { const q = labNear(p, foes); const [x, y] = q ? labTo(p, q.x, q.y) : [0, 0]; b.melee = frame % 3 === 0; b.parry = frame % 11 === 0; b.heavy = frame % 17 === 0; b.spell = labRand() < .02; b.burst = labRand() < .02; return { x, y, b }; } // in the crowd
  if (st === 'items') { const c = labNear(p, CARDS.length ? CARDS : foes); const [x, y] = c ? labTo(p, c.x, c.y) : [0, 0]; b.prev = labRand() < .05; b.next = labRand() < .05; b.shot = true; b.spell = labRand() < .03; return { x, y, b }; } // grab and use everything
  if (st === 'parry') { const bl = labNear(p, B.filter(x => x.owner !== p.id)); const near = bl && (bl.x - p.x) ** 2 + (bl.y - p.y) ** 2 < 70 * 70; b.parry = near && frame % 2 === 0; b.heavy = frame % 30 === 0; b.focus = !near; const q = labNear(p, foes); const [x, y] = q ? labTo(p, q.x, q.y) : [0, 0]; return { x: x * .3, y: y * .3, b }; } // frame-perfect parries, reflect chains
  return { x: 0, y: 0, b };
}
function labRules(c) {
  if (!LAB.T0) LAB.T0 = { every: T.ITEM_EVERY };
  nP = labPick(c.fighters, [2, 3, 4, 5, 6, 7, 8]); cpuLv = labPick(c.cpu, [1, 2, 3, 4, 5, 6, 7, 8, 9]); itemsOn = labPick(c.items, [true, false]);
  stI = labPick(c.lives, [0, 1, 2, 3, 4]); TIMER = labPick(c.timer, [0, 1, 2, 3]); mapI = labPick(c.map, MAPS.map((_, i) => i)); NERV = 10; TEAMS = false; COMP = false;
  maxC = Math.max(1, Math.min(64, c.cards | 0 || maxC || 1)); T.ITEM_EVERY = c.fast ? 45 : LAB.T0.every;
  const one = c.item && c.item !== 'all' ? c.item : null; for (const k in itemOn) itemOn[k] = one ? k === one : true; if (one) itemsOn = true;
  return { fighters: nP, cpu: cpuLv, items: itemsOn, item: one || 'all', cards: maxC, fast: !!c.fast, lives: STOCKS[stI], timer: TIMER, map: (MAPS[mapI] || {}).name };
}
const LAB_HPMAX = () => T.HP * 4;
function labCheck() {
  for (const p of P) {
    for (const k of ['x', 'y', 'vx', 'vy', 'hp']) if (!Number.isFinite(p[k])) { labIssue('nan', new Error('P' + (p.id + 1) + '.' + k + ' = ' + p[k] + ' (' + labChar(p) + ')')); return; }
    if (p.state !== 'dead' && (p.x < -300 || p.y < -300 || p.x > T.MAP_W + 300 || p.y > T.MAP_H + 300)) labIssue('oob', new Error('P' + (p.id + 1) + ' (' + labChar(p) + ') outside the map at ' + (p.x | 0) + ',' + (p.y | 0) + ' state ' + p.state));
    if (p.hp > LAB_HPMAX() || p.stocks < 0 || !Number.isFinite(p.spirit)) labIssue('invalid', new Error('P' + (p.id + 1) + ' (' + labChar(p) + ') hp ' + p.hp + ' stocks ' + p.stocks + ' spirit ' + p.spirit));
    const s = LAB.st[p.id] || (LAB.st[p.id] = { k: '', f: frame }), key = p.state + '|' + Math.round(p.x / 8) + '|' + Math.round(p.y / 8);
    if (key !== s.k || p.state === 'idle' || p.state === 'dead') { s.k = key; s.f = frame; } else if (frame - s.f > 900) { labIssue('softlock', new Error('P' + (p.id + 1) + ' (' + labChar(p) + ') stuck in state "' + p.state + '" without moving for 15 s')); s.f = frame; }
  }
  for (const b of B) if (!Number.isFinite(b.x + b.y + b.vx + b.vy)) { labIssue('nan', new Error('bullet of P' + ((b.owner | 0) + 1) + ' has a non-finite position/speed')); break; }
  for (const e of ENT) if (typeof e.x === 'number' && !Number.isFinite(e.x + e.y)) { labIssue('nan', new Error('entity "' + e.k + '" has a non-finite position')); break; }
  if (B.length > 6000) labIssue('flood', new Error('bullets > 6000')); if (ENT.length > 3000) labIssue('flood', new Error('entities > 3000 (' + labTop(ENT.map(e => e.k)) + ')')); if (FX.length > 8000 || TX.length > 4000) labIssue('flood', new Error('effects/texts never cleaned (FX ' + FX.length + ', TX ' + TX.length + ')'));
  if (TIMER > 0 && frame > TIMER * 3600 + 1800 && winner < 0) labIssue('endless', new Error('timer ' + TIMER + ' min is over for 30 s but there is no winner'));
}
const labTop = L => { const c = {}; for (const k of L) c[k] = (c[k] || 0) + 1; return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, n]) => k + '×' + n).join(', '); };
/** Save, play 20 frames, load, replay the same inputs: the state must be identical (what online rollback relies on). */
function labRollback() {
  const S = gameSave(), f0 = frame, rs = LAB.rng, bs = JSON.stringify(LAB.bot), ss = LAB.style.slice(), H = [], D = [];
  for (let k = 0; k < 20 && winner < 0; k++) { step(); H.push(gameSum()); D.push(gameSumD()); }
  gameLoad(S); LAB.rng = rs; LAB.bot = JSON.parse(bs); LAB.style = ss;
  for (let k = 0; k < H.length; k++) { step(); if (gameSum() !== H[k]) { labIssue('rollback', new Error('state differs ' + (k + 1) + ' frame(s) after save/load: ' + diffD(D[k], gameSumD())), { from: f0 }); break; } }
}
function labChars() { const L = []; P.forEach(p => { p.shotT = CH0 + (labRand() * CHR.length | 0); const c = chOf(p); p.spI = c.spI; c.init && c.init(p); L.push(c.k); }); return L; }
function labOffline(c) {
  LAB.rng = (c.seed >>> 0) || 1; LAB.issues = []; LAB.bot = []; LAB.seen.clear(); LAB.ev = []; LAB.st = []; LAB.cfg = c; NET = null; let f = 0, rules = {}, ms = 0;
  const bots = c.kind !== 'cpu';
  try { rules = LAB.rules = labRules(c); nH = bots ? nP : 0; LAB.style = Array.from({ length: nP }, () => bots ? (c.bots && c.bots !== 'expert' ? c.bots : LAB_STYLES[labRand() * LAB_STYLES.length | 0]) : 'cpu');
    readHuman = i => labBotIn(i); start('game'); seed = (c.seed % 100000) | 1; rules.chars = labChars(); rules.bots = LAB.style.slice(); }
  catch (e) { labIssue('crash', e, { phase: 'start' }); return { frames: 0, rules, issues: LAB.issues }; }
  const cap = c.frames || 7200;
  try { while (f < cap && winner < 0) { const t0 = performance.now(); step(); const dt = performance.now() - t0; ms += dt; f++;
      if (dt > 60 * Math.max(1, nP / 8)) labIssue('slow', new Error('one frame took ' + (dt | 0) + ' ms with ' + nP + ' fighters, ' + B.length + ' bullets, ' + ENT.length + ' entities (' + labTop(ENT.map(e => e.k)) + ')'));
      if (f % 30 === 0) labCheck(); if ((c.kind === 'rollback' || c.kind === 'bots') && f % 240 === 120) labRollback(); } }
  catch (e) { labIssue('crash', e); }
  return { frames: f, rules, issues: LAB.issues, winner, ms: ms | 0 };
}
function labNetOpts(c) {
  LAB.rng = (c.seed >>> 0) || 1; const r = labRules(Object.assign({}, c, { fighters: labPick(c.fighters, [2, 2, 3, 4]) })), n = nP;
  return { v: NETV, g: 1, names: Array.from({ length: n }, (_, i) => 'LAB' + (i + 1)), pics: [], chars: Array.from({ length: n }, () => CH0 + (labRand() * CHR.length | 0)), dn: 1700000000000,
    mw: Math.round(W / SC), n, D: c.D ?? 2, lat: c.lat ?? 60, TEAMS: false, TEAMA: [], mapI, itemsOn, itemOn: Object.assign({}, itemOn), COMP, stI, TIMER, NERV, maxC, seed: (labRand() * 1e9 | 0) || 1, rules: r };
}
function labNetBoot(o, id, send, botSeed) { LAB.rng = (botSeed >>> 0) || 7; LAB.issues = []; LAB.bot = []; LAB.seen.clear(); LAB.ev = []; LAB.st = []; LAB.cfg = { bots: 'expert', noCpu: true }; LAB.style = [];
  Object.assign(itemOn, o.itemOn || {}); maxC = o.maxC; readHumanBase = i => labBotIn(i); netBoot(o, id); NET = netNew(id, send, o.D, o.n); NET.g = o.g; NET.lat = o.lat; NET.rtt = o.lat * 2; }
function labNetTick() { try { netTick(); } catch (e) { labIssue('crash', e, { peer: NET.L }); } if (NET.f % 30 === 0) labCheck(); return { f: NET.f, winner, desync: NET.desync, stall: NET.stall, rb: NET.rbN, issues: LAB.issues.splice(0) }; }
