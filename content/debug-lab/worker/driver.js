'use strict';
/**
 * Debug lab driver. Runs INSIDE a game sandbox (browser worker or node vm), after the game scripts. No rendering.
 *   labOffline(cfg)  one match (CPU, or bots when cfg.kind==='rollback') -> {frames, issues}
 *   labNetOpts(cfg) / labNetBoot(o,id,send,botSeed) / labNetTick()  one peer of a simulated ONLINE match (the game's real netcode)
 * Issues: crash (exception), caught:<where> (the game's own errRep), desync (netcode checksums differ), rollback (save -> load ->
 * replay gives another state = an online desync waiting to happen), nan (non-finite player value), flood (bullets/entities explode), stall.
 * cfg: {seed, kind:'cpu'|'rollback'|'online', fighters, cpu, items, lives, timer, map ('random' or a value), frames}
 */
const LAB = { issues: [], bot: [], rng: 1, seen: new Set() };
function labRand() { let x = LAB.rng; x ^= x << 13; x ^= x >>> 17; x ^= x << 5; LAB.rng = x >>> 0; return LAB.rng / 4294967296; }
const labPick = (v, list) => v === 'random' || v == null ? list[labRand() * list.length | 0] : v;
function labIssue(type, e, extra) {
  const st = String(e && e.stack || ''), m = [...st.matchAll(/((?:src|content)\/[^\s)?:]+)(?:\?[^:\s)]*)?:(\d+)/g)].find(x => !x[1].includes('debug-lab')), msg = String(e && e.message || e).slice(0, 400);
  const at = m ? m[1] + ':' + m[2] : '', key = type + '|' + msg.replace(/\d+/g, '#') + '|' + at; if (LAB.seen.has(key)) return; LAB.seen.add(key); // once per match
  LAB.issues.push(Object.assign({ type, msg, at, stack: st.split('\n').slice(0, 8).map(s => s.trim().replace(/https?:\/\/[^\s)]*?\/((?:src|content)\/)/, '$1')).join('\n'), frame: typeof frame === 'number' ? frame : -1 }, extra || {}));
}
errRep = (w, e) => labIssue(w === 'desync' ? 'desync' : 'caught:' + w, e);
/** Random but human-like inputs for bot players (deterministic from LAB.rng). */
function labBotIn(i) {
  const s = LAB.bot[i] || (LAB.bot[i] = { x: 0, y: 0, b: {}, t: 0 });
  if (--s.t <= 0) { s.t = 5 + labRand() * 40 | 0; const a = labRand() * TAU, m = labRand() < .15 ? 0 : 1; s.x = Math.cos(a) * m; s.y = Math.sin(a) * m; s.b = {}; for (const k of BTN) if (labRand() < (k === 'shot' ? .6 : .1)) s.b[k] = true; }
  return { x: s.x, y: s.y, b: Object.assign({}, s.b) };
}
function labRules(c) {
  nP = labPick(c.fighters, [2, 3, 4, 5, 6, 7, 8]); cpuLv = labPick(c.cpu, [1, 2, 3, 4, 5, 6, 7, 8, 9]); itemsOn = labPick(c.items, [true, false]);
  stI = labPick(c.lives, [0, 1, 2, 3, 4]); TIMER = labPick(c.timer, [0, 1, 2, 3]); mapI = labPick(c.map, MAPS.map((_, i) => i)); NERV = 10; TEAMS = false; COMP = false;
  return { fighters: nP, cpu: cpuLv, items: itemsOn, lives: STOCKS[stI], timer: TIMER, map: (MAPS[mapI] || {}).name };
}
function labCheck() {
  for (const p of P) { for (const k of ['x', 'y', 'vx', 'vy', 'hp']) if (!Number.isFinite(p[k])) { labIssue('nan', new Error('P' + (p.id + 1) + '.' + k + ' = ' + p[k] + ' (' + (CHR[p.shotT - CH0] || {}).k + ')')); return; } }
  if (B.length > 6000) labIssue('flood', new Error('bullets > 6000')); if (ENT.length > 3000) labIssue('flood', new Error('entities > 3000'));
}
/** Save, play 20 frames, load, replay the same inputs: the state must be identical (what online rollback relies on). */
function labRollback() {
  const S = gameSave(), f0 = frame, rs = LAB.rng, bs = JSON.stringify(LAB.bot), H = [], D = [];
  for (let k = 0; k < 20 && winner < 0; k++) { step(); H.push(gameSum()); D.push(gameSumD()); }
  gameLoad(S); LAB.rng = rs; LAB.bot = JSON.parse(bs);
  for (let k = 0; k < H.length; k++) { step(); if (gameSum() !== H[k]) { labIssue('rollback', new Error('state differs ' + (k + 1) + ' frame(s) after save/load: ' + diffD(D[k], gameSumD())), { from: f0 }); break; } }
}
function labChars() { const L = []; P.forEach(p => { p.shotT = CH0 + (labRand() * CHR.length | 0); const c = chOf(p); p.spI = c.spI; c.init && c.init(p); L.push(c.k); }); return L; }
function labOffline(c) {
  LAB.rng = (c.seed >>> 0) || 1; LAB.issues = []; LAB.bot = []; LAB.seen.clear(); NET = null; let f = 0, rules = {};
  const bots = c.kind === 'rollback';
  try { rules = labRules(c); nH = bots ? nP : 0; readHuman = i => labBotIn(i); start('game'); seed = (c.seed % 100000) | 1; rules.chars = labChars(); }
  catch (e) { labIssue('crash', e, { phase: 'start' }); return { frames: 0, rules, issues: LAB.issues }; }
  const cap = c.frames || 7200;
  try { while (f < cap && winner < 0) { step(); f++; if (f % 30 === 0) labCheck(); if (bots && f % 240 === 120) labRollback(); } }
  catch (e) { labIssue('crash', e); }
  return { frames: f, rules, issues: LAB.issues, winner };
}
function labNetOpts(c) {
  LAB.rng = (c.seed >>> 0) || 1; const r = labRules(Object.assign({}, c, { fighters: labPick(c.fighters, [2, 2, 3, 4]) })), n = nP;
  return { v: NETV, g: 1, names: Array.from({ length: n }, (_, i) => 'LAB' + (i + 1)), pics: [], chars: Array.from({ length: n }, () => CH0 + (labRand() * CHR.length | 0)), dn: 1700000000000,
    mw: Math.round(W / SC), n, D: c.D ?? 2, lat: c.lat ?? 60, TEAMS: false, TEAMA: [], mapI, itemsOn, itemOn: Object.assign({}, itemOn), COMP, stI, TIMER, NERV, maxC, seed: (labRand() * 1e9 | 0) || 1, rules: r };
}
function labNetBoot(o, id, send, botSeed) { LAB.rng = (botSeed >>> 0) || 7; LAB.issues = []; LAB.bot = []; LAB.seen.clear(); readHumanBase = i => labBotIn(i); netBoot(o, id); NET = netNew(id, send, o.D, o.n); NET.g = o.g; NET.lat = o.lat; NET.rtt = o.lat * 2; }
function labNetTick() { try { netTick(); } catch (e) { labIssue('crash', e, { peer: NET.L }); } return { f: NET.f, winner, desync: NET.desync, stall: NET.stall, rb: NET.rbN, issues: LAB.issues.splice(0) }; }
