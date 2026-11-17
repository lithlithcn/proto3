// Crash / rollback / desync campaign from the command line (same checks as the secret DEBUG LAB, content/debug-lab/worker/driver.js),
// on all CPU cores, deterministic: every issue comes with the job that reproduces it.
//   node tools/campaign.cjs [games=40] [--kind mix|cpu|rollback|online] [--frames 3600] [--par N]
//   node tools/campaign.cjs --repro <lab-or-campaign issue .json>      replay the one job of a report, print what it finds
//   node tools/campaign.cjs --selftest                                 inject one bug of each kind and check it is caught (proves the detectors)
// Output: reports/campaign.json (unique issues + counts) and a summary.
const fs = require('fs'), path = require('path'), os = require('os'); const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const DRV = 'content/debug-lab/worker/driver.js';
const INJECT = { // self-test bugs, applied inside the sandbox after the driver
  crash: `{const S=step;step=()=>{S();if(frame===200)null.boom}}`,
  nan: `{const S=step;step=()=>{S();if(frame===300&&P[0])P[0].vx=NaN}}`,
  rollback: `{const L=gameLoad;gameLoad=s=>{L(s);if(P[1])P[1].hp-=1}}`,
  desync: `{const S=step;step=()=>{S();if(NET&&NET.L===1&&frame===400&&P[0])P[0].x+=3}}`,
};
function runJob(job) {
  const { createSandbox } = require('./headless.cjs');
  if (job.kind !== 'online') { const s = createSandbox([DRV], job.seed); if (job.inject) s.eval(INJECT[job.inject]); s.g.__c = job; return s.eval('labOffline(__c)'); }
  // online: n peers in n sandboxes, the real netcode, messages delayed by `lat` ticks (deterministic)
  const n = job.fighters === 'random' ? 2 : Math.min(4, job.fighters), host = createSandbox([DRV], job.seed); host.g.__c = Object.assign({}, job, { fighters: n });
  const o = host.eval('labNetOpts(__c)'), peers = [host, ...Array.from({ length: n - 1 }, (_, i) => createSandbox([DRV], job.seed + i + 1))], Q = [], lat = job.latT || 4;
  let tick = 0; const issues = [];
  peers.forEach((p, i) => { if (job.inject) p.eval(INJECT[job.inject]); p.g.__o = o; p.g.__send = m => { for (let j = 0; j < n; j++) if (j !== i) Q.push({ at: tick + lat + (tick * 7 + i * 3 + j) % 3, to: j, m: JSON.parse(JSON.stringify(m)) }); }; p.eval(`labNetBoot(__o,${i},m=>__send(m),${job.seed + i * 7919})`); });
  let st = [], still = 0, last = -1;
  for (; tick < (job.frames || 3600) * 2; tick++) {
    for (let k = Q.length - 1; k >= 0; k--) if (Q[k].at <= tick) { const q = Q.splice(k, 1)[0]; peers[q.to].g.__m = q.m; try { peers[q.to].eval('netRecv(__m)'); } catch (e) { issues.push({ type: 'crash', msg: String(e.message), at: 'netRecv' }); } }
    st = peers.map(p => p.eval('labNetTick()')); for (const s of st) issues.push(...s.issues);
    const f = Math.min(...st.map(s => s.f)); if (f === last) still++; else { still = 0; last = f; }
    if (st.some(s => s.winner >= 0) || f >= (job.frames || 3600)) break;
    if (still > 1500) { issues.push({ type: 'stall', msg: 'online match stuck (no frame progress for 1500 ticks)', at: '' }); break; }
  }
  return { frames: Math.min(...st.map(s => s.f)), rules: o.rules, issues };
}
const sig = i => i.type + '|' + String(i.msg).replace(/\d+(\.\d+)?/g, '#').slice(0, 160) + '|' + (i.at || '');
if (!isMainThread) { parentPort.on('message', j => { let r; try { r = runJob(j); } catch (e) { r = { frames: 0, issues: [{ type: 'crash', msg: e.message, at: (String(e.stack).match(/((?:src|content)\/[^\s)?:]+):(\d+)/) || []).slice(1, 3).join(':'), stack: String(e.stack).split('\n').slice(0, 6).join('\n') }] }; } parentPort.postMessage({ j, r }); }); }
else {
  const a = process.argv.slice(2), opt = k => { const i = a.indexOf('--' + k); return i >= 0 ? a[i + 1] : null; };
  const base = { fighters: 'random', cpu: 'random', items: 'random', lives: 'random', timer: 'random', map: 'random', frames: +(opt('frames') || 3600) };
  let jobs;
  if (a.includes('--selftest')) jobs = [['cpu', 'crash'], ['cpu', 'nan'], ['rollback', 'rollback'], ['online', 'desync']].map(([kind, inject], i) => Object.assign({}, base, { kind, inject, seed: 11 + i, frames: 1200, fighters: kind === 'online' ? 2 : 'random' }));
  else if (opt('repro')) { const R = JSON.parse(fs.readFileSync(opt('repro'), 'utf8')), i = R.issue || R; const j = i.job || i.first && i.first.job; if (!j) { console.log('no job in this report'); process.exit(1); } jobs = [j]; }
  else { const n = +(a.find(x => /^\d+$/.test(x)) || 40), kinds = (opt('kind') || 'mix') === 'mix' ? ['cpu', 'cpu', 'rollback', 'online'] : [opt('kind')]; jobs = Array.from({ length: n }, (_, i) => Object.assign({}, base, { kind: kinds[i % kinds.length], seed: 1000 + i * 7 })); }
  const par = Math.max(1, Math.min(jobs.length, +(opt('par') || os.cpus().length - 1 || 1))), U = {}, t0 = Date.now(); let done = 0, frames = 0, next = 0;
  const finish = () => {
    const L = Object.values(U).sort((x, y) => y.n - x.n); fs.mkdirSync(path.join(__dirname, '../reports'), { recursive: true });
    fs.writeFileSync(path.join(__dirname, '../reports/campaign.json'), JSON.stringify({ jobs: jobs.length, frames, sec: (Date.now() - t0) / 1000 | 0, issues: L }, null, 1));
    console.log(`${jobs.length} games, ${frames} frames, ${(Date.now() - t0) / 1000 | 0} s -> ${L.length} unique issue(s) (reports/campaign.json)`);
    for (const x of L) console.log(` ×${x.n} ${x.first.type}: ${String(x.first.msg).slice(0, 140)}${x.first.at ? ' @' + x.first.at : ''}`);
    if (a.includes('--selftest')) { const want = ['crash', 'nan', 'rollback', 'desync'], got = new Set(L.map(x => x.first.type)), miss = want.filter(w => !got.has(w)); console.log(miss.length ? 'SELFTEST FAIL, not caught: ' + miss : 'SELFTEST PASS: every injected bug was caught'); process.exit(miss.length ? 1 : 0); }
  };
  for (let w = 0; w < par; w++) { const wk = new Worker(__filename); const feed = () => { if (next < jobs.length) wk.postMessage(jobs[next++]); else wk.terminate(); };
    wk.on('message', ({ j, r }) => { done++; frames += r.frames; for (const i of r.issues) { const s = sig(i); (U[s] || (U[s] = { n: 0, first: Object.assign({ job: j, rules: r.rules }, i) })).n++; } if (done === jobs.length) finish(); else feed(); }); feed(); }
}
