'use strict';
/**
 * Joining a room DURING a match = spectating it, then playing the next one (owner request).
 * Works on the game's determinism: the host logs every confirmed input of the match (ONL.splog). A newcomer receives the match options
 * ('go' message) + that log on the reliable channel, replays the match at high speed until it catches up, then keeps following the new
 * frames (~6 frames behind). Nothing it does reaches the match. At the results screen it is a normal player (REMATCH), so the next match
 * includes it. Custom maps (not transferred to a spectator): it waits for the next match instead.
 */
// ---------- host side
{ const G0 = onlGo; onlGo = m => { if (m.id === 0) { ONL.lastGo = m.o; ONL.splog = { g: m.o.g, A: [] }; for (const k of ONL.cl) k.spec = false; } return G0(m); }; }
{ const C0 = onlHostConn; onlHostConn = c => { C0(c); const k = ONL.cl[ONL.cl.length - 1]; if (k && NET && ONL.st === 'game') { k.spec = true; k.spSent = -1; } }; }
{ const T0 = netTick; netTick = () => { const N = NET; if (N && N.spec) return specTick(); T0();
  if (!ONL || ONL.id !== 0 || !NET || !ONL.splog) return; const L = ONL.splog, ca = Math.min(netConfAll(NET), NET.f - 1);
  while (L.A.length <= ca) { const f = L.A.length; L.A.push(Array.from({ length: NET.n }, (_, i) => f >= NET.drop[i] ? netNeutral() : (NET.inp[i].get(f) || netNeutral()))); }
  for (const k of ONL.cl) { if (!k.spec || !k.r || !k.r.open) continue;
    try { if (k.spSent < 0) { k.r.send({ t: 'spec', o: ONL.lastGo }); k.spSent = 0; }
      if (L.A.length - k.spSent >= 6 || winner >= 0 && L.A.length > k.spSent) { for (let a = k.spSent; a < L.A.length; a += 1200) k.r.send({ t: 'spf', f0: a, A: L.A.slice(a, Math.min(L.A.length, a + 1200)) }); k.spSent = L.A.length; if (winner >= 0) k.spec = false; } } catch (e) {} } }; } // match over: the spectator is a normal player for the rematch
// ---------- spectator side
function specRecv(x) {
  if (x.t === 'spec') { const o = x.o; if (o.cm && !NETMAP) { onlLog('Match in progress on a custom map: you will join the next match.'); return; }
    NETNAMES = o.names || null; ONL.st = 'game'; ONL.rdy = new Set(); netBoot(o, ONL.id); const n = o.n;
    NET = { spec: 1, L: 0, n, f: 0, top: -1, cur: 0, g: o.g, D: o.D, lat: 0, rtt: 100, inp: Array.from({ length: n }, () => new Map()), conf: Array(n).fill(-1), drop: Array(n).fill(Infinity), pred: Array.from({ length: n }, () => new Map()),
      left: [], S: new Map(), sums: new Map(), prov: new Map(), rsum: new Map(), rbN: 0, rbMax: 0, desync: -1, stall: 0, miss: 0, skip: 0, ended: false, send() {} };
    mode = 'game'; paused = false; big('SPECTATING · YOU PLAY NEXT MATCH', '#29d4ff', 34); sfx('ok00'); return; }
  if (x.t === 'spf' && NET && NET.spec) { x.A.forEach((a, j) => { const f = x.f0 + j; for (let i = 0; i < NET.n; i++) NET.inp[i].set(f, a[i]); }); NET.top = Math.max(NET.top, x.f0 + x.A.length - 1); for (let i = 0; i < NET.n; i++) NET.conf[i] = NET.top; }
}
/** Follows the match: fast while far behind, then one frame per tick, always a few frames behind the host. */
function specTick() { const N = NET; if (winner >= 0) return; const lag = N.top - N.f, n = lag > 60 ? 30 : lag > 8 ? 2 : lag > 0 ? 1 : 0;
  for (let k = 0; k < n && winner < 0; k++) { N.cur = N.f; step(); if (CX.mer && winner < 0) step(); N.f++; } }
{ const R0 = netRecv; netRecv = m => { if (NET && NET.spec) return; return R0(m); }; } // the match's own traffic is not for spectators
{ const R1 = render; render = (...a) => { R1(...a); if (mode !== 'game' || !NET || !NET.spec || winner >= 0) return; const c = OC || CTX0; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.textAlign = 'center';
  c.fillStyle = 'rgba(5,6,12,.7)'; c.fillRect(W / 2 - 260, 34, 520, 30); c.fillStyle = '#29d4ff'; c.font = UF(800, 15); c.fillText(NET.top - NET.f > 60 ? 'SPECTATING · catching up with the match…' : 'SPECTATING · you will play the next match', W / 2, 55); c.restore(); }; }
