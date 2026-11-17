'use strict';
/**
 * DEBUG LAB (secret): type "ewekeks" on the title screen. Runs many headless games in Web Workers for as long as you want and
 * collects every crash / desync / rollback mismatch / NaN / flood / hang. Each NEW issue (by signature) downloads one JSON
 * report at once; a duplicate only increases its counter (signatures are remembered in this browser across sessions).
 * Job kinds: CPU matches (crash hunt), bot matches with save/load/replay checks (rollback), ONLINE matches between 2-4 workers
 * through the real netcode with simulated latency/jitter (desync). Workers: content/debug-lab/worker/ (driver.js = the checks).
 */
const LABC = { par: Math.max(1, Math.min(16, (navigator.hardwareConcurrency || 4) - 1)), kind: 'mix', fighters: 'random', cpu: 'random', items: 'random', lives: 'random', timer: 'random', map: 'random', frames: 7200, net: 'mid', autodl: true };
const LABS = { on: false, W: [], games: 0, frames: 0, t0: 0, jobs: 0, list: {}, newN: 0, total: 0, seed: (Date.now() % 1e9) | 1, groups: 0 };
let LABK = {}; try { LABK = JSON.parse(localStorage.getItem('sf_lab_known') || '{}'); } catch (e) {}
const LAB_NET = { low: [20, 50, 5], mid: [60, 140, 25], bad: [150, 320, 80] }; // ms: min, max, jitter
const labVer = () => { const s = [...document.scripts].find(x => /content\/debug-lab\/lab\.js/.test(x.src)); return s && s.src.includes('?') ? s.src.slice(s.src.indexOf('?')) : ''; };
const labScripts = () => [...document.scripts].map(s => s.src).filter(s => s && s.startsWith(labBase()) && !/vendor\/|data\/sfx|content\/debug-lab\//.test(s));
const labBase = () => location.href.replace(/[?#].*$/, '').replace(/[^/]*$/, '');
function labSig(i) { return i.type + '|' + String(i.msg).replace(/\d+(\.\d+)?/g, '#').slice(0, 160) + '|' + (i.at || ''); }
function labDl(name, obj) { try { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(obj, null, 1)], { type: 'application/json' })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000); } catch (e) {} }
function labReport(i, ctx) {
  const sig = labSig(i); LABS.total++; const L = LABS.list[sig] || (LABS.list[sig] = { sig, n: 0, first: Object.assign({}, i, ctx), t: new Date().toISOString() }); L.n++;
  if (LABK[sig]) { LABK[sig]++; return; } LABK[sig] = 1; LABS.newN++; try { localStorage.setItem('sf_lab_known', JSON.stringify(LABK)); } catch (e) {}
  if (LABC.autodl) labDl(`shmup-lab-${i.type.replace(/[^a-z]/gi, '')}-${(Math.abs([...sig].reduce((h, c) => h * 31 + c.charCodeAt(0) | 0, 7)) % 1e8).toString(36)}.json`,
    { kind: 'proto4-lab-issue', ver: typeof NETV !== 'undefined' ? NETV : '', when: L.t, ua: navigator.userAgent, issue: L.first, repro: 'node tools/campaign.cjs --repro <this file>' });
  sfx('alert', .4);
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
  if (d.fatal) { LABS.on = false; labReport({ type: 'load', msg: d.fatal.split('\n')[0], at: (d.fatal.match(/((?:src|content)\/[^\s)?:]+)(?:\?[^:\s)]*)?:(\d+)/) || []).slice(1, 3).join(':') }, {}); labKill(w); return; }
  if (d.net && w.grp) { labRelay(w, d.net); return; }
  if (d.opts && w.grp) { const g = w.grp; g.ws.forEach((x, i) => x.wk.postMessage({ job: 'net', o: d.opts, id: i, botSeed: g.job.seed + i * 7919, speed: 3, frames: g.job.frames })); return; }
  if (d.st && w.grp) { const g = w.grp; for (const i of d.st.issues) labReport(i, { job: g.job, peer: w.peer }); g.f[w.peer] = d.st.f;
    if (d.st.stall && !g.stallRep) { g.stallRep = 1; labReport({ type: 'stall', msg: 'online match stuck (no frame progress for 1500 ticks)', at: '' }, { job: g.job, frames: g.f }); } }
  if (d.done) {
    if (w.grp) { const g = w.grp; g.left--; w.grp = null; w.busy = false; if (g.left <= 0 && !g.over) { g.over = 1; LABS.games++; LABS.frames += Math.max(...g.f); } return; }
    w.busy = false; LABS.games++; LABS.frames += d.res.frames; for (const i of d.res.issues) labReport(i, { job: w.job, rules: d.res.rules });
  }
}
function labRelay(from, m) { const g = from.grp; if (!g || g.dead) return; const [a, b, j] = LAB_NET[LABC.net];
  for (const w of g.ws) if (w !== from) { const k = from.peer + '>' + w.peer, now = performance.now(), at = Math.max(now + a + Math.random() * (b - a) + Math.random() * j, g.last[k] || 0); g.last[k] = at;
    setTimeout(() => { if (w.grp === g) w.wk.postMessage({ net: m }); }, at - now); } }
function labCfg(kind) { return { seed: (LABS.seed = (LABS.seed * 1103515245 + 12345) >>> 0) || 1, kind, fighters: LABC.fighters, cpu: LABC.cpu, items: LABC.items, lives: LABC.lives, timer: LABC.timer, map: LABC.map, frames: LABC.frames }; }
function labTick() {
  if (!LABS.on) return; const now = performance.now();
  for (const w of LABS.W.slice()) if (w.busy && now - w.t > 60000) { labReport({ type: 'hang', msg: 'worker silent for 60 s (infinite loop?)', at: '' }, { job: w.job }); labKill(w); }
  while (LABS.W.length < LABC.par) LABS.W.push(labWorker());
  const idle = LABS.W.filter(w => w.ready && !w.busy); if (!idle.length) return;
  const pick = LABC.kind === 'mix' ? ['cpu', 'cpu', 'rollback', 'online'][LABS.jobs % 4] : LABC.kind;
  if (pick === 'online') { if (idle.length < 2) return; const c = labCfg('online'), [a, b] = LAB_NET[LABC.net], n = Math.min(idle.length, c.fighters === 'random' ? 2 + (c.seed % 3) : Math.min(4, c.fighters));
    const ws = idle.slice(0, n), g = { ws, left: n, f: ws.map(() => 0), last: {}, job: c }; c.lat = (a + b) / 2 | 0; c.D = 2; c.fighters = n; LABS.jobs++;
    ws.forEach((w, i) => { w.busy = true; w.grp = g; w.peer = i; w.job = c; w.t = now; }); ws[0].wk.postMessage({ job: 'netopts', cfg: c }); // P1's sandbox builds the match options (like the host)
    return; }
  const w = idle[0], c = labCfg(pick); w.busy = true; w.job = c; w.t = now; LABS.jobs++; w.wk.postMessage({ job: 'offline', cfg: c });
}
function labStart() { if (LABS.on) return; LABS.on = true; LABS.t0 = performance.now(); sfx('ok00'); }
function labStop() { LABS.on = false; for (const w of LABS.W.slice()) labKill(w); }
setInterval(() => { try { labTick(); } catch (e) { console.error('[LAB]', e); } }, 100);

const labLR = (k, list) => d => { const i = list.indexOf(LABC[k]); LABC[k] = list[(i + (d < 0 ? list.length - 1 : 1)) % list.length]; };
const labV = v => v === 'random' ? 'RANDOM' : v === true ? 'ON' : v === false ? 'OFF' : String(v).toUpperCase();
const LABL = () => {
  const el = LABS.on ? (performance.now() - LABS.t0) / 1000 : 0, fps = el > 1 ? LABS.frames / el | 0 : 0, iss = Object.values(LABS.list).sort((a, b) => b.n - a.n);
  return [
    { t: () => (LABS.on ? 'STOP' : 'START') + ': ' + (LABS.on ? LABS.W.filter(w => w.busy).length + ' running' : 'stopped'), f: () => LABS.on ? labStop() : labStart() },
    { t: () => 'Status: ' + LABS.games + ' games · ' + (LABS.frames / 1000 | 0) + 'k frames · ' + fps + ' f/s', f: () => {} },
    { t: () => 'Issues: ' + iss.length + ' kinds · ' + LABS.newN + ' new · ' + LABS.total + ' total', f: () => {} },
    { t: () => 'Games at once: ' + LABC.par + '  ◀ ▶', lr: d => { LABC.par = clamp(LABC.par + (d < 0 ? -1 : 1), 1, 32); } },
    { t: () => 'Tests: ' + { mix: 'MIX', cpu: 'CPU CRASH HUNT', rollback: 'ROLLBACK CHECK', online: 'ONLINE DESYNC' }[LABC.kind] + '  ◀ ▶', lr: labLR('kind', ['mix', 'cpu', 'rollback', 'online']) },
    { t: () => 'Fighters: ' + labV(LABC.fighters) + '  ◀ ▶', lr: labLR('fighters', ['random', 2, 3, 4, 5, 6, 7, 8]) },
    { t: () => 'CPU level: ' + labV(LABC.cpu) + '  ◀ ▶', lr: labLR('cpu', ['random', 1, 2, 3, 4, 5, 6, 7, 8, 9]) },
    { t: () => 'Items: ' + labV(LABC.items) + '  ◀ ▶', lr: labLR('items', ['random', true, false]) },
    { t: () => 'Lives: ' + (LABC.lives === 'random' ? 'RANDOM' : LABC.lives + 1) + '  ◀ ▶', lr: labLR('lives', ['random', 0, 1, 2, 3, 4]) },
    { t: () => 'Timer: ' + (LABC.timer === 'random' ? 'RANDOM' : LABC.timer ? LABC.timer + ' MIN' : 'OFF') + '  ◀ ▶', lr: labLR('timer', ['random', 0, 1, 2, 3]) },
    { t: () => 'Map: ' + (LABC.map === 'random' ? 'RANDOM' : (MAPS[LABC.map] || {}).name) + '  ◀ ▶', lr: labLR('map', ['random', ...MAPS.map((_, i) => i)]) },
    { t: () => 'Max length: ' + (LABC.frames / 3600) + ' MIN  ◀ ▶', lr: labLR('frames', [3600, 7200, 18000, 36000]) },
    { t: () => 'Online network: ' + labV(LABC.net) + '  ◀ ▶', lr: labLR('net', ['low', 'mid', 'bad']) },
    { t: () => 'Auto-download new issues: ' + labV(LABC.autodl) + '  ◀ ▶', lr: labLR('autodl', [true, false]) },
    { t: () => 'Download full report (this session)', f: () => labDl('shmup-lab-report-' + new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-') + '.json', { kind: 'proto4-lab-report', ver: typeof NETV !== 'undefined' ? NETV : '', ua: navigator.userAgent, settings: LABC, games: LABS.games, frames: LABS.frames, issues: iss }) },
    { t: () => 'Forget known issues (' + Object.keys(LABK).length + ')', f: () => { LABK = {}; try { localStorage.removeItem('sf_lab_known'); } catch (e) {} sfx('cancel00'); } },
    ...iss.slice(0, 12).map(L => ({ t: () => '×' + L.n + ' ' + L.first.type.toUpperCase() + ': ' + String(L.first.msg).slice(0, 60) + (L.first.at ? ' @' + L.first.at : ''), f: () => labDl('shmup-lab-' + L.first.type.replace(/[^a-z]/gi, '') + '.json', { issue: L.first, count: L.n }) })),
    { t: () => 'Back', f: () => nav('back') }];
};
Object.assign(RDESC, { 'START': 'Starts/stops the workers. Leave it running for hours: every new kind of bug downloads one report.', 'STOP': 'Stops every worker.', 'Games at once': 'Parallel games (1 worker = 1 CPU core). Online tests use 2-4 workers per game.',
  'Tests': 'MIX = all. CPU = crash hunt. ROLLBACK = save/load/replay must give the same state. ONLINE = real netcode between workers.', 'Online network': 'Simulated latency: LOW 20-50 ms, MID 60-140, BAD 150-320 + jitter.' });
// secret code on the title screen: e w e k e k s (keys swallowed while the code is being typed, so the title screen does not close)
{ const C = 'ewekeks'; let n = 0; EARLYKEY.push(e => { if (mode !== 'title' || e.repeat) { n = 0; return false; } const k = (e.key || '').toLowerCase();
  if (k === C[n]) { n++; if (n === C.length) { n = 0; sfx('se_powerup'); mode = 'menu'; openSub('DEBUG LAB', LABL); } return true; } n = k === C[0] ? 1 : 0; return n === 1; }); }
