'use strict';
/* Debug lab worker: loads the game (no rendering) once, then runs jobs sent by the lab screen (content/debug-lab/lab.js).
   {job:'offline', cfg} -> {done, res}   ·   {job:'net', o, id, botSeed} + {net:m} messages -> {net:m} out, {st} status, {done}  */
let loaded = false, netOn = false, netIv = 0;
self.onmessage = e => {
  const d = e.data;
  if (d.load) { try { importScripts(d.base + 'content/debug-lab/worker/sandbox.js' + d.v, ...d.scripts, d.base + 'content/debug-lab/worker/driver.js' + d.v); loaded = true; postMessage({ ready: 1 }); } catch (x) { postMessage({ fatal: String(x && x.stack || x) }); } return; }
  if (d.job === 'offline') { const res = labOffline(d.cfg); postMessage({ done: 1, res }); return; }
  if (d.job === 'netopts') { postMessage({ opts: labNetOpts(d.cfg) }); return; }
  if (d.job === 'net') { labNetBoot(d.o, d.id, m => postMessage({ net: m }), d.botSeed); netOn = true; let last = -1, still = 0;
    clearInterval(netIv); netIv = setInterval(() => { if (!netOn) return; let s; for (let k = 0; k < d.speed; k++) s = labNetTick();
      if (s.f === last) still++; else { still = 0; last = s.f; }
      const end = s.winner >= 0 || s.f >= d.frames || still > 1500; postMessage({ st: { f: s.f, rb: s.rb, desync: s.desync, issues: s.issues, stall: still > 1500 }, done: end ? 1 : 0 }); if (end) { netOn = false; clearInterval(netIv); } }, 16); return; }
  if (d.net) { try { netRecv(d.net); } catch (x) { labIssue('crash', x, { where: 'netRecv' }); } return; }
  if (d.stop) { netOn = false; clearInterval(netIv); }
};
