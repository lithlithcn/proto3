'use strict';
/**
 * DEBUG LAB (secret): type "ewekeks" on the title screen. Two pages: BUG HUNT (this file) and BALANCE (lab-balance.js).
 * Everything runs in Web Workers of the player's own browser (local CPU threads, nothing on a server). Workers = CPU cores; games wait
 * in a queue ("games to run": 100 ... endless) and the workers chain them without pause, so thousands of games get played.
 * A NEW issue (by signature) downloads one JSON report (if enabled); duplicates only raise a counter (remembered across sessions).
 * "Download all" = ONE text file merging every unique report (FICHIER / TAILLE / content / FIN DU FICHIER blocks, the owner's format).
 */
const LAB_CORES = Math.max(1, (navigator.hardwareConcurrency || 4) - 1);
const LABC = { games: 1000, par: LAB_CORES, kind: 'mix', bots: 'expert', fighters: 'random', cpu: 'random', items: 'random', item: 'all', cards: 4, fast: false, lives: 'random', timer: 'random', map: 'random', frames: 7200, net: 'mid', autodl: true, dedupe: true };
const LABS = { on: false, W: [], games: 0, frames: 0, t0: 0, jobs: 0, list: {}, occ: [], newN: 0, total: 0, seed: (Date.now() % 1e9) | 1, itemI: 0, ms: 0 };
let LABK = {}; try { LABK = JSON.parse(localStorage.getItem('sf_lab_known') || '{}'); } catch (e) {}
const LAB_NET = { low: [20, 50, 5], mid: [60, 140, 25], bad: [150, 320, 80] }; // ms: min, max, jitter
const labVer = () => { const s = [...document.scripts].find(x => /content\/debug-lab\/lab\.js/.test(x.src)); return s && s.src.includes('?') ? s.src.slice(s.src.indexOf('?')) : ''; };
const labBase = () => location.href.replace(/[?#].*$/, '').replace(/[^/]*$/, '');
const labScripts = () => [...document.scripts].map(s => s.src).filter(s => s && s.startsWith(labBase()) && !/vendor\/|data\/sfx|content\/debug-lab\//.test(s));
const labHash = s => (Math.abs([...s].reduce((h, c) => h * 31 + c.charCodeAt(0) | 0, 7)) % 1e8).toString(36);
const labStamp = () => new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
function labSig(i) { return i.type + '|' + String(i.msg).replace(/\d+(\.\d+)?/g, '#').slice(0, 160) + '|' + (i.at || ''); }
function labDlText(name, text, type) { try { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: type || 'text/plain;charset=utf-8' })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000); } catch (e) {} }
const labDl = (name, obj) => labDlText(name, JSON.stringify(obj, null, 1), 'application/json');
const labSize = n => n < 1024 ? n + ' octets' : n < 1048576 ? (n / 1024).toFixed(1) + ' Ko' : (n / 1048576).toFixed(2) + ' Mo';
/** The owner's merge format (fusiontxt): one block per file. */
function labMerge(files) { return files.map(([name, text]) => `==================================================\nFICHIER : ${name}\nTAILLE : ${labSize(new Blob([text]).size)}\n==================================================\n\n${text}\n\n==================================================\nFIN DU FICHIER : ${name}\n==================================================\n\n`).join('\n'); }
const labEnv = () => ({ ver: typeof NETV !== 'undefined' ? NETV : '', build: labVer().replace('?v=', ''), ua: navigator.userAgent, cores: navigator.hardwareConcurrency || 0 });
const labIssueFile = L => [`shmup-lab-${L.first.type.replace(/[^a-z]/gi, '')}-${labHash(L.sig)}.json`, JSON.stringify(Object.assign({ kind: 'proto4-lab-issue' }, labEnv(), { count: L.n, firstSeen: L.t, issue: L.first, repro: 'node tools/campaign.cjs --repro <this file>' }), null, 1)];
function labReport(i, ctx) {
  const sig = labSig(i), full = Object.assign({}, i, ctx); LABS.total++;
  if (!LABC.dedupe && LABS.occ.length < 500) LABS.occ.push({ sig, n: 1, first: full, t: new Date().toISOString() });
  const L = LABS.list[sig] || (LABS.list[sig] = { sig, n: 0, first: full, t: new Date().toISOString() }); L.n++;
  if (LABK[sig] && LABC.dedupe) { LABK[sig]++; return; } LABK[sig] = (LABK[sig] || 0) + 1; LABS.newN++; try { localStorage.setItem('sf_lab_known', JSON.stringify(LABK)); } catch (e) {}
  if (LABC.autodl) { const [n, t] = labIssueFile(L); labDlText(n, t, 'application/json'); } sfx('alert', .4);
}
function labDownloadAll() {
  const L = LABC.dedupe ? Object.values(LABS.list) : LABS.occ, iss = L.slice().sort((a, b) => b.n - a.n);
  const sum = Object.assign({ kind: 'proto4-lab-summary' }, labEnv(), { when: new Date().toISOString(), settings: LABC, games: LABS.games, frames: LABS.frames, avgMsPerFrame: LABS.frames ? +(LABS.ms / LABS.frames).toFixed(3) : 0, uniqueIssues: iss.length, totalIssues: LABS.total, byType: iss.reduce((o, x) => (o[x.first.type] = (o[x.first.type] || 0) + x.n, o), {}) });
  labDlText('shmup-lab-ALL-' + labStamp() + '.txt', labMerge([['shmup-lab-summary.json', JSON.stringify(sum, null, 1)], ...iss.map(labIssueFile)])); sfx('ok00');
}
function labWorker() {
  const w = { wk: new Worker(labBase() + 'content/debug-lab/worker/worker.js' + labVer()), busy: false, ready: false, t: performance.now(), job: null };
  w.wk.onmessage = e => labMsg(w, e.data); w.wk.onerror = e => { labReport({ type: 'worker', msg: e.message || 'worker error', at: '' }, { job: w.job }); labKill(w); };
  w.wk.postMessage({ load: 1, base: labBase(), v: labVer(), scripts: labScripts() }); return w;
}
function labKill(w) { try { w.wk.terminate(); } catch (e) {} const i = LABS.W.indexOf(w); if (i >= 0) LABS.W.splice(i, 1); if (w.grp) w.grp.dead = true; }
function labMsg(w, d) {
  w.t = performance.now();
  if (d.ready) { w.ready = true; return; }
  if (d.beat) return; // still playing (slow game), not hung
  if (d.fatal) { LABS.on = false; LABB.on = false; labReport({ type: 'load', msg: d.fatal.split('\n')[0], at: (d.fatal.match(/((?:src|content)\/[^\s)?:]+)(?:\?[^:\s)]*)?:(\d+)/) || []).slice(1, 3).join(':') }, {}); labKill(w); return; }
  if (d.net && w.grp) { labRelay(w, d.net); return; }
  if (d.opts && w.grp) { const g = w.grp; g.ws.forEach((x, i) => x.wk.postMessage({ job: 'net', o: d.opts, id: i, botSeed: g.job.seed + i * 7919, speed: 3, frames: g.job.frames })); return; }
  if (d.st && w.grp) { const g = w.grp; for (const i of d.st.issues) labReport(i, { job: g.job, peer: w.peer }); g.f[w.peer] = d.st.f;
    if (d.st.stall && !g.stallRep) { g.stallRep = 1; labReport({ type: 'stall', msg: 'online match stuck (no frame progress for 1500 ticks)', at: '' }, { job: g.job, frames: g.f }); } }
  if (d.done) {
    if (w.grp) { const g = w.grp; g.left--; w.grp = null; w.busy = false; if (g.left <= 0 && !g.over) { g.over = 1; LABS.games++; LABS.frames += Math.max(...g.f); } return; }
    w.busy = false; if (d.bal) { labBalRes(d.res); return; } LABS.games++; LABS.frames += d.res.frames; LABS.ms += d.res.ms || 0; for (const i of d.res.issues) labReport(i, { job: w.job, rules: d.res.rules });
  }
}
function labRelay(from, m) { const g = from.grp; if (!g || g.dead) return; const [a, b, j] = LAB_NET[LABC.net];
  for (const w of g.ws) if (w !== from) { const k = from.peer + '>' + w.peer, now = performance.now(), at = Math.max(now + a + Math.random() * (b - a) + Math.random() * j, g.last[k] || 0); g.last[k] = at;
    setTimeout(() => { if (w.grp === g) w.wk.postMessage({ net: m }); }, at - now); } }
const labItemKeys = () => ITEMS.filter(i => !i.rare).map(i => i.k);
function labCfg(kind) { const keys = labItemKeys(), item = LABC.item === 'cycle' ? keys[LABS.itemI++ % keys.length] : LABC.item;
  return { seed: (LABS.seed = (LABS.seed * 1103515245 + 12345) >>> 0) || 1, kind, bots: LABC.bots, fighters: LABC.fighters, cpu: LABC.cpu, items: item !== 'all' ? true : LABC.items, item, cards: LABC.cards, fast: LABC.fast, lives: LABC.lives, timer: LABC.timer, map: LABC.map, frames: LABC.frames }; }
function labTick() {
  if (!LABS.on && !LABB.on) return; const now = performance.now();
  for (const w of LABS.W.slice()) if (w.busy && now - w.t > 60000) { labReport({ type: 'hang', msg: 'worker silent for 60 s (infinite loop?)', at: '' }, { job: w.job }); labKill(w); }
  while (LABS.W.length < LABC.par) LABS.W.push(labWorker());
  const idle = LABS.W.filter(w => w.ready && !w.busy); if (!idle.length) return;
  if (LABB.on) { labBalTick(idle); return; }
  if (LABS.jobs >= LABC.games) { if (!LABS.W.some(w => w.busy)) { LABS.on = false; sfx('bonus', .6); } return; } // queue done
  const pick = LABC.kind === 'mix' ? ['cpu', 'bots', 'bots', 'online'][LABS.jobs % 4] : LABC.kind;
  if (pick === 'online') { if (idle.length < 2) return; const c = labCfg('online'), [a, b] = LAB_NET[LABC.net], n = Math.min(idle.length, c.fighters === 'random' ? 2 + (c.seed % 3) : Math.min(32, c.fighters));
    if (idle.length < n) return; const ws = idle.slice(0, n), g = { ws, left: n, f: ws.map(() => 0), last: {}, job: c }; c.lat = (a + b) / 2 | 0; c.D = 2; c.fighters = n; LABS.jobs++;
    ws.forEach((w, i) => { w.busy = true; w.grp = g; w.peer = i; w.job = c; w.t = now; }); ws[0].wk.postMessage({ job: 'netopts', cfg: c }); return; }
  for (const w of idle) { if (LABS.jobs >= LABC.games) break; const c = labCfg(pick); w.busy = true; w.job = c; w.t = now; LABS.jobs++; w.wk.postMessage({ job: 'offline', cfg: c }); }
}
function labStart() { if (LABS.on) return; LABB.on = false; Object.assign(LABS, { on: true, t0: performance.now(), jobs: 0, games: 0, frames: 0, ms: 0 }); sfx('ok00'); }
function labStop() { LABS.on = false; LABB.on = false; for (const w of LABS.W.slice()) labKill(w); }
setInterval(() => { try { labTick(); } catch (e) { console.error('[LAB]', e); } }, 50);

const labLR = (o, k, list) => d => { const i = Math.max(0, list.indexOf(o[k])); o[k] = list[(i + (d < 0 ? list.length - 1 : 1)) % list.length]; };
const labV = v => v === 'random' ? 'RANDOM' : v === true ? 'ON' : v === false ? 'OFF' : v === Infinity ? 'ENDLESS' : String(v).toUpperCase();
const labItemName = k => k === 'all' ? 'ALL ITEMS' : k === 'cycle' ? 'EACH ITEM IN TURN' : ((ITEMS.find(i => i.k === k) || {}).name || k).toUpperCase();
const labRange = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const LABL = () => {
  const el = LABS.on ? (performance.now() - LABS.t0) / 1000 : 0, fps = el > 1 ? LABS.frames / el | 0 : 0, iss = Object.values(LABS.list).sort((a, b) => b.n - a.n), pct = LABC.games === Infinity ? '' : ' / ' + LABC.games + ' (' + Math.min(100, LABS.games / LABC.games * 100 | 0) + '%)';
  const eta = LABS.on && LABS.games > 2 && LABC.games !== Infinity ? ' · ~' + Math.max(0, (LABC.games - LABS.games) * el / LABS.games / 60 | 0) + ' min left' : '';
  return [
    { t: () => (LABS.on ? 'STOP' : 'START') + ': ' + (LABS.on ? LABS.W.filter(w => w.busy).length + ' running' : 'stopped'), f: () => LABS.on ? labStop() : labStart() },
    { t: () => 'Progress: ' + LABS.games + pct + ' · ' + (LABS.frames / 1000 | 0) + 'k frames · ' + fps + ' f/s' + eta, f: () => {} },
    { t: () => 'Issues: ' + iss.length + ' kinds · ' + LABS.newN + ' new · ' + LABS.total + ' total', f: () => {} },
    { t: () => 'DOWNLOAD ALL (one file, unique reports)', f: labDownloadAll },
    { t: () => 'Games to run: ' + labV(LABC.games) + '  ◀ ▶', lr: labLR(LABC, 'games', [100, 300, 1000, 3000, 10000, 100000, Infinity]) },
    { t: () => 'Parallel workers: ' + LABC.par + (LABC.par === LAB_CORES ? ' (your CPU)' : LABC.par > LAB_CORES + 1 ? ' (more than your cores)' : '') + '  ◀ ▶', lr: d => { LABC.par = clamp(LABC.par + (d < 0 ? -1 : 1), 1, 64); } },
    { t: () => 'Tests: ' + { mix: 'MIX', cpu: 'CPU MATCHES', bots: 'EXPERT BOTS + ROLLBACK', online: 'ONLINE (REAL NETCODE)' }[LABC.kind] + '  ◀ ▶', lr: labLR(LABC, 'kind', ['mix', 'cpu', 'bots', 'online']) },
    { t: () => 'Bots: ' + labV(LABC.bots) + '  ◀ ▶', lr: labLR(LABC, 'bots', ['expert', 'chaos', 'spam', 'edge', 'cluster', 'items', 'parry', 'cpu']) },
    { t: () => 'Fighters: ' + labV(LABC.fighters) + '  ◀ ▶', lr: labLR(LABC, 'fighters', ['random', ...labRange(2, 32)]) },
    { t: () => 'CPU level: ' + labV(LABC.cpu) + '  ◀ ▶', lr: labLR(LABC, 'cpu', ['random', ...labRange(1, 9)]) },
    { t: () => 'Items: ' + labV(LABC.items) + '  ◀ ▶', lr: labLR(LABC, 'items', ['random', true, false]) },
    { t: () => 'Item pool: ' + labItemName(LABC.item) + '  ◀ ▶', lr: labLR(LABC, 'item', ['all', 'cycle', ...labItemKeys()]) },
    { t: () => 'Cards at once: ' + LABC.cards + '  ◀ ▶', lr: labLR(LABC, 'cards', labRange(1, 64)) },
    { t: () => 'Card spawn: ' + (LABC.fast ? 'FAST (0.75 s)' : 'NORMAL') + '  ◀ ▶', lr: labLR(LABC, 'fast', [false, true]) },
    { t: () => 'Lives: ' + (LABC.lives === 'random' ? 'RANDOM' : LABC.lives + 1) + '  ◀ ▶', lr: labLR(LABC, 'lives', ['random', 0, 1, 2, 3, 4]) },
    { t: () => 'Timer: ' + (LABC.timer === 'random' ? 'RANDOM' : LABC.timer ? LABC.timer + ' MIN' : 'OFF') + '  ◀ ▶', lr: labLR(LABC, 'timer', ['random', 0, 1, 2, 3]) },
    { t: () => 'Map: ' + (LABC.map === 'random' ? 'RANDOM' : (MAPS[LABC.map] || {}).name) + '  ◀ ▶', lr: labLR(LABC, 'map', ['random', ...MAPS.map((_, i) => i)]) },
    { t: () => 'Max length: ' + (LABC.frames / 3600) + ' MIN  ◀ ▶', lr: labLR(LABC, 'frames', [3600, 7200, 18000, 36000]) },
    { t: () => 'Online network: ' + labV(LABC.net) + '  ◀ ▶', lr: labLR(LABC, 'net', ['low', 'mid', 'bad']) },
    { t: () => 'Duplicates: ' + (LABC.dedupe ? 'REMOVED' : 'KEPT') + '  ◀ ▶', lr: labLR(LABC, 'dedupe', [true, false]) },
    { t: () => 'Auto-download each new issue: ' + labV(LABC.autodl) + '  ◀ ▶', lr: labLR(LABC, 'autodl', [true, false]) },
    { t: () => 'Forget known issues (' + Object.keys(LABK).length + ')', f: () => { LABK = {}; try { localStorage.removeItem('sf_lab_known'); } catch (e) {} sfx('cancel00'); } },
    ...iss.slice(0, 16).map(L => ({ t: () => '×' + L.n + ' ' + L.first.type.toUpperCase() + ': ' + String(L.first.msg).slice(0, 60) + (L.first.at ? ' @' + L.first.at : ''), f: () => { const [n, t] = labIssueFile(L); labDlText(n, t, 'application/json'); } })),
    { t: () => 'Back', f: () => nav('back') }];
};
const LABHOME = () => [{ t: () => 'BUG HUNT' + (LABS.on ? ' (running: ' + LABS.games + ' games)' : ''), f: () => openSub('BUG HUNT', LABL) }, { t: () => 'BALANCE' + (LABB.on ? ' (running: ' + LABB.done + '/' + LABB.jobs.length + ')' : ''), f: () => openSub('BALANCE', LABBL) }, { t: () => 'Back', f: () => nav('back') }];
Object.assign(RDESC, { 'BUG HUNT': 'Thousands of simulated games (CPU, expert bots, online netcode) looking for crashes, desyncs, softlocks, NaN, floods...', 'BALANCE': 'Every matchup, many times, with detailed statistics and a diagnostic file.',
  'START': 'Starts/stops. Leave it running for hours: every new kind of bug downloads one report.', 'Games to run': 'Queue size. The workers chain the games without pause (all your CPU cores).', 'Parallel workers': 'One worker = one CPU core of YOUR PC (nothing runs on a server). More than your cores is not faster.',
  'Tests': 'CPU = game AI. EXPERT BOTS = bug-hunting inputs + save/load/replay checks. ONLINE = real netcode between workers with simulated latency.', 'Bots': 'EXPERT mixes every style and switches during the match: chaos, button spam, walls/corners, crowd, items, frame-perfect parries, CPU.',
  'Item pool': 'ALL, one single item (to test it with many copies), or EACH ITEM IN TURN (one item per game, all items covered).', 'Cards at once': 'Up to 64 item cards on the map at the same time.', 'Duplicates': 'REMOVED: one report per kind of issue. KEPT: every occurrence (up to 500).',
  'DOWNLOAD ALL': 'One .txt file with the summary + every unique report, ready to send.', 'Online network': 'Simulated latency: LOW 20-50 ms, MID 60-140, BAD 150-320 + jitter.' });
// secret code on the title screen: e w e k e k s (keys swallowed while the code is being typed, so the title screen does not close)
{ const C = 'ewekeks'; let n = 0; EARLYKEY.push(e => { if (mode !== 'title' || e.repeat) { n = 0; return false; } const k = (e.key || '').toLowerCase();
  if (k === C[n]) { n++; if (n === C.length) { n = 0; sfx('se_powerup'); mode = 'menu'; openSub('DEBUG LAB', LABHOME); } return true; } n = k === C[0] ? 1 : 0; return n === 1; }); }
