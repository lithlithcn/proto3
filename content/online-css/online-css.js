'use strict';
/**
 * ONLINE character select = the local one (mode 'css', same screen, same playground "try it in the arena"), synced like Smash online:
 * every player sees the others' pick and READY live in their P cards; when EVERYONE is ready the host starts (the existing rematch rule).
 * Entry points: lobby START (host sends everyone there), lobby "CHOOSE YOUR FIGHTER", results "CHOOSE YOUR FIGHTER".
 * Slots: slot i = player with network id i; every slot but mine is a remote 'net<id>' device, so local pads/keyboard can only take mine.
 * Messages: 'cs' {ty,pg} player -> host · 'csl' {L:[[id,ty,pg]]} host -> all · 'gocss' host -> all. Ready = the existing 'rdy' messages.
 */
const OCS = { st: {}, sent: '', lastB: 0, pv: {} };
const ocsName = id => { const L = ocsPlayers(), x = L.find(p => p[0] === id); return x ? String(x[1] || 'P' + (id + 1)).toUpperCase() : 'P' + (id + 1); };
function ocsPlayers() { if (!ONL) return []; if (ONL.id === 0) return [[0, nickOf()]].concat(ONL.cl.filter(k => k.ok && k.c.open && !k.spec).map(k => [k.id, k.nick || ''])); return (ONL.lob || []).map(x => [x[0], x[1]]); }
function cssOnline() {
  if (!ONL) return; if (NET) { NET.ended = true; NET = null; } ONL.st = ONL.id === 0 ? 'lobby' : 'lobbyc'; winner = -1;
  cssOpen(); CS2.onl = true; CS2.tb = false; const me = ONL.id, s = CS2.sl[me]; if (s) { s.ty = myCh(); s.dev = null; s.rd = false; s.pg = false; }
  if (ONL.rdy && ONL.rdy.has(me)) onlReady(false); OCS.sent = ''; ocsSync();
}
function ocsExit() { const S = CS2.sl; for (const s of S) { s.pg = false; } CS2.on = false; CS2.onl = false; PGM = 0; if (ONL && ONL.rdy && ONL.rdy.has(ONL.id)) onlReady(false); mode = ONL ? 'online' : 'menu'; sfx('cancel00'); }
/** Remote slots follow the room; my slot follows my devices. */
function ocsSync() {
  const S = CS2.sl, me = ONL.id, ids = new Set(ocsPlayers().map(p => p[0])); CS2.nP0 = Math.max(2, ids.size);
  S.forEach((s, i) => { if (i === me) return; if (ids.has(i)) { const r = OCS.st[i]; s.dev = 'net' + i; if (r) { s.ty = r.ty; s.pg = !!r.pg; } s.rd = !!(ONL.rdy && ONL.rdy.has(i)); } else if (s.dev && s.dev.startsWith('net')) { s.dev = null; s.rd = false; s.pg = false; } });
}
{ const C0 = cssTick; cssTick = () => { if (!CS2.onl) return C0(); if (!ONL) { ocsExit(); return; } ocsSync();
    const S = CS2.sl, me = ONL.id, my = S[me];
    // leave (B / Esc / Backspace) when I have not joined my slot yet
    if (!my.dev) for (const d of devList()) { const I = cssIn(d), b = !!I.b && !OCS.pv[d]; OCS.pv[d] = !!I.b; if (b) { ocsExit(); return; } }
    const lk = [], rp = []; S.forEach((s, i) => { if (i !== me && !s.dev) { s.dev = 'lock'; lk.push(s); } if (i !== me && s.pg) { s.pg = false; rp.push(s); } }); // local devices can only take MY slot; only MY playground runs here
    try { C0(); } finally { for (const s of lk) if (s.dev === 'lock') s.dev = null; for (const s of rp) s.pg = true; }
    if (mode !== 'css') return; // C0 may have left the screen
    { const j = S.findIndex((s, i) => i !== me && s.dev && !String(s.dev).startsWith('net')); if (j >= 0 && !my.dev) { my.dev = S[j].dev; my.ty = S[j].ty; S[j].dev = null; S[j].rd = false; } } // a local device always takes MY slot
    const key = my.ty + '|' + (my.rd ? 1 : 0) + '|' + (my.pg ? 1 : 0);
    if (key !== OCS.sent) { const was = OCS.sent.split('|'); OCS.sent = key; MYCH = my.ty; try { localStorage.setItem('sf_ch', MYCH); } catch (e) {}
      if (ONL.id === 0) ocsHostList(); else try { ONL.conn.send({ t: 'ch', c: my.ty }); ONL.conn.send({ t: 'cs', ty: my.ty, pg: my.pg ? 1 : 0 }); } catch (e) {}
      if ((was[1] === '1') !== !!my.rd) onlReady(!!my.rd); } // READY in this screen = ready for the match / rematch
    if (ONL.id === 0 && performance.now() - OCS.lastB > 1000) ocsHostList(); }; }
function ocsHostList() { OCS.lastB = performance.now(); const my = CS2.onl && CS2.sl[0]; const L = [[0, my ? my.ty : myCh(), my && my.pg ? 1 : 0]].concat(ONL.cl.filter(k => k.ok && !k.spec).map(k => [k.id, k.ch || CHL[0], k.pg ? 1 : 0]));
  OCS.st = {}; for (const [id, ty, pg] of L) OCS.st[id] = { ty, pg }; onlBcast({ t: 'csl', L }); }
// starting is the host's rematch rule (everyone ready); the local START does nothing online
{ const G0 = cssGo; cssGo = () => { if (CS2.onl) { if (ONL && ONL.id !== 0) txt(W / 2, H / 2, 'Waiting for the host…', '#29d4ff', 18); return; } return G0(); }; }
{ const M0 = onlMsg; onlMsg = (m, k) => {
  if (m.t === 'cs' && k) { const c = m.ty | 0; if (c >= CH0 && c < CH0 + CHR.length) k.ch = c; k.pg = !!m.pg; if (ONL.id === 0) ocsHostList(); return true; }
  if (m.t === 'csl' && Array.isArray(m.L)) { OCS.st = {}; for (const [id, ty, pg] of m.L) OCS.st[id | 0] = { ty: ty | 0, pg: !!pg }; return true; }
  if (m.t === 'gocss') { if (mode !== 'css' || !CS2.onl) cssOnline(); return true; }
  return M0(m, k); }; }
// a match starting ends the playground and the online select
{ const G1 = onlGo; onlGo = m => { PGM = 0; CS2.on = false; CS2.onl = false; DEVMAP = null; SELTY = null; return G1(m); }; }
// lobby: START sends everyone to the character select; "YOUR FIGHTER (Enter: next)" becomes the real character select
{ const I0 = onlItems; onlItems = () => { const L = I0(), s = ONL && ONL.st; if (s !== 'lobby' && s !== 'lobbyc') return L;
  return L.map(it => it.f === onlStart ? { t: it.t.replace('START THE MATCH', 'CHOOSE FIGHTERS'), f: () => { if (!ONL.cl.some(k => k.ok)) return; onlBcast({ t: 'gocss' }); cssOnline(); } }
    : /^YOUR FIGHTER/.test(it.t) ? { t: 'CHOOSE YOUR FIGHTER: ' + CHR[myCh() - CH0].name, f: cssOnline } : it); }; }
// results: the FIGHTER entry shows the character grid OVER the results (owner: no other screen), playtest behind it;
// players who stay on the results keep their fighter and count as ready with REMATCH; everyone ready -> the real match, the playtest stops.
{ const R0 = onlResItems; onlResItems = () => R0().map(it => /^FIGHTER/.test(it.t) ? { t: 'CHOOSE YOUR FIGHTER', f: ocsFromRes } : it); }
function ocsFromRes() { let snap = null;
  try { const cv = ctx.canvas; snap = document.createElement('canvas'); snap.width = cv.width; snap.height = cv.height; snap.getContext('2d').drawImage(cv, 0, 0); } catch (e) { snap = null; }
  OCS.res = { mode, winner, NET, st: ONL.st, rdy: !!(ONL.rdy && ONL.rdy.has(ONL.id)), snap, pg: false }; OCS.map0 = mapI; cssOnline(); }
/** Playtest map: Screen (fixed camera), Large above 8 players; the room's map setting is put back right after. */
{ const T0 = cssTick; cssTick = () => { if (!CS2.onl) return T0(); CS2.pgMap = ocsPlayers().length > 8 ? 0 : 1; const m = mapI; if (OCS.map0 == null) OCS.map0 = m;
    try { T0(); } finally { if (PGM) mapI = OCS.map0; CS2.pgMap = undefined; } if (CS2.on && OCS.res) OCS.res.pg = true; }; }
// grid over the results: the results picture replaces the animated background (only while no playtest runs)
{ const B0 = uiBG; uiBG = (...a) => { const R = mode === 'css' && CS2.onl && !CS2.on && OCS.res && OCS.res.snap; if (!R) return B0(...a);
    const c = ctx; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(R, 0, 0); c.fillStyle = 'rgba(5,6,12,.55)'; c.fillRect(0, 0, c.canvas.width, c.canvas.height); c.restore(); }; }
// BACK from the grid: back to the results if no playtest replaced the match state, else to the lobby (as before)
{ const E0 = ocsExit; ocsExit = () => { const R = OCS.res; OCS.res = null; if (OCS.map0 != null) { mapI = OCS.map0; OCS.map0 = null; }
    if (!R || R.pg || !ONL) return E0(); for (const s of CS2.sl) s.pg = false; CS2.on = false; CS2.onl = false; PGM = 0;
    mode = R.mode; winner = R.winner; NET = R.NET; if (NET) NET.ended = false; ONL.st = R.st; sfx('cancel00'); }; }
{ const G2 = onlGo; onlGo = m => { OCS.res = null; if (OCS.map0 != null) { mapI = OCS.map0; OCS.map0 = null; } return G2(m); }; }
