// Local ONLINE test: 2-4 browser tabs connected through a fake PeerJS (BroadcastChannel) instead of the internet, so the real lobby /
// character select / match / results code can be driven and checked here. Not shipped (tools only).
//   const { openRoom } = require('./online-sim.cjs'); const { pages, close } = await openRoom(2); ... await close();
//   node tools/online-sim.cjs   -> host + 1 client: lobby, pictures, match start; screenshots in reports/online-*.png
const path = require('path'), fs = require('fs'); const { chromium } = require('playwright'); const { server } = require('./serve.cjs');
const FAKE_PEER = () => {
  const ch = new BroadcastChannel('fake-peerjs'), peers = new Map(), conns = new Map(); let n = 0;
  const ev = () => { const L = {}; return { on(k, f) { (L[k] || (L[k] = [])).push(f); return this; }, emit(k, ...a) { for (const f of L[k] || []) try { f(...a); } catch (e) { console.error(e); } } }; };
  function Conn(cid, me, peer, label, metadata) { return Object.assign(ev(), { cid, me, peer, label, metadata, open: false, dataChannel: { bufferedAmount: 0 }, peerConnection: { getStats: () => Promise.resolve(new Map()) },
    send(d) { if (this.open) ch.postMessage({ k: 'data', cid, to: peer, d: JSON.parse(JSON.stringify(d)) }); }, close() { if (!this.open) return; this.open = false; ch.postMessage({ k: 'close', cid, to: peer }); this.emit('close'); } }); }
  ch.onmessage = ({ data: m }) => { const p = peers.get(m.to); if (!p) return;
    if (m.k === 'conn') { const c = Conn(m.cid, m.to, m.from, m.label, m.metadata); conns.set(m.cid + '@' + m.to, c); p.emit('connection', c); setTimeout(() => { c.open = true; c.emit('open'); ch.postMessage({ k: 'ack', cid: m.cid, to: m.from }); }, 20); }
    else { const c = conns.get(m.cid + '@' + m.to); if (!c) return; if (m.k === 'ack') { c.open = true; c.emit('open'); } else if (m.k === 'data') c.emit('data', m.d); else if (m.k === 'close') { c.open = false; c.emit('close'); } } };
  window.FakePeer = function (id) { const p = Object.assign(ev(), { id: id || 'anon-' + Math.random().toString(36).slice(2, 8), destroyed: false,
    connect(to, o = {}) { const cid = p.id + '#' + (n++), c = Conn(cid, p.id, to, o.label, o.metadata); conns.set(cid + '@' + p.id, c); ch.postMessage({ k: 'conn', cid, to, from: p.id, label: o.label, metadata: o.metadata }); return c; },
    destroy() { p.destroyed = true; peers.delete(p.id); } }); peers.set(p.id, p); setTimeout(() => p.emit('open', p.id), 30); return p; };
};
async function openRoom(n = 2, opts = {}) {
  await new Promise(r => server.listening ? r() : server.listen(0, r));
  const b = await chromium.launch(), ctx = await b.newContext({ viewport: { width: 1280, height: 720 } }), pages = [], errs = [];
  const tab = async i => { const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(`tab${i}: ${e.message}`)); await pg.addInitScript(FAKE_PEER);
    await pg.goto(`http://localhost:${server.address().port}/index.html`); await pg.waitForTimeout(1200);
    await pg.evaluate(([i, pic]) => { Peer = FakePeer; onlIce = async () => []; try { localStorage.setItem('sf_nick', 'Tab' + (i + 1)); } catch (e) {} if (pic) MYPIC = pic; }, [i, opts.pics ? opts.pics[i] : null]); pages.push(pg); return pg; };
  for (let i = 0; i < n; i++) await tab(i);
  await pages[0].evaluate(() => { mode = 'menu'; onlOpen(); onlHost(); }); await pages[0].waitForTimeout(400);
  const code = await pages[0].evaluate(() => ONL.code);
  const join = async pg => { await pg.evaluate(c => { mode = 'menu'; onlOpen(); onlJoin2(c); }, code); await pg.waitForTimeout(600); };
  for (let i = 1; i < n; i++) await join(pages[i]);
  await pages[0].waitForTimeout(1500);
  return { pages, code, errs, /** a new tab that joins now (e.g. during a match) */ addTab: async () => { const pg = await tab(pages.length); await join(pg); return pg; },
    shot: (i, name) => pages[i].screenshot({ path: path.join(__dirname, '../reports', `online-${name}.png`) }), close: async () => { await b.close(); server.close(); } };
}
module.exports = { openRoom };
if (require.main === module) (async () => {
  fs.mkdirSync(path.join(__dirname, '../reports'), { recursive: true });
  const dot = c => 'data:image/svg+xml;base64,' + Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="${c}"/></svg>`).toString('base64');
  const R = await openRoom(2, { pics: [dot('#f00'), dot('#0f0')] });
  const st = await Promise.all(R.pages.map(p => p.evaluate(() => ({ st: ONL && ONL.st, id: ONL && ONL.id, cl: ONL && ONL.cl.length, lob: ONL && ONL.lob, pics: ONL && ONL.pics && Object.keys(ONL.pics).filter(k => ONL.pics[k]) }))));
  console.log(JSON.stringify(st)); await R.shot(0, 'host-lobby'); await R.shot(1, 'client-lobby'); console.log('errors', R.errs); await R.close();
})();
