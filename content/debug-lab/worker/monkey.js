'use strict';
/**
 * UI MONKEY (debug lab, runs in the sandbox after driver.js): plays the WHOLE game like 8 people mashing at once, menus included.
 * labMonkey(cfg) drives the real main loop (loop(t): pollNav, step, render) with real key events (the game's own listeners,
 * kept by the sandbox in __EVH), 6 fake gamepads with random buttons/sticks, random taps on whatever is clickable (hot[]),
 * random text in text fields. Every error the game catches (errRep: step/render) or that a listener throws is an issue,
 * with the trail of screens and the last inputs. fetch / TURN are dead stubs: no server is ever contacted.
 * labMonkey(cfg): local, as fast as possible (fake clock). labMonkeyOnline(cfg, done): 2-4 workers in one real room (fake PeerJS on a
 * BroadcastChannel, real lobby/select/netcode/results/rematch code), real clock; the host keeps a room open, clients keep (re)joining.
 * cfg: {seed, frames, players (1-8: keyboards 2 + pads), mash (0.2-1), role: 'host'|'client', room}
 */
const LMK = { on: false, held: new Map(), pads: [], trail: [], inp: [], vt: 0 };
const lmkKey = c => c === 'Space' ? ' ' : /^Key[A-Z]$/.test(c) ? c.slice(3).toLowerCase() : /^Digit\d$/.test(c) ? c.slice(5) : /^Numpad\d$/.test(c) ? c.slice(6) : c;
function lmkFire(type, code, mod) {
  const ev = { type, code, key: lmkKey(code), repeat: false, ctrlKey: !!(mod && mod.ctrl), shiftKey: false, metaKey: false, altKey: false, target: document.body, s: 0,
    preventDefault() {}, stopPropagation() {}, stopImmediatePropagation() { this.s = 1; }, clipboardData: { getData: () => 'AB3X9' } };
  for (const f of (globalThis.__EVH || {})[type] || []) { if (ev.s) break; try { f(ev); } catch (e) { labIssue('crash', e, { where: type + ' ' + code, mode, trail: LMK.trail.slice(-25), inputs: LMK.inp.slice(-40) }); } }
}
function lmkPad(i) { return { id: 'lab pad ' + i, index: i, connected: true, mapping: 'standard', timestamp: 0, axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) }; }
function lmkInp(s) { LMK.inp.push(LMK.f + ' ' + mode + ' ' + s); if (LMK.inp.length > 80) LMK.inp.shift(); }
const lmkCtx = where => ({ where, mode, trail: LMK.trail.slice(-25), inputs: LMK.inp.slice(-40), online: ONL ? { st: ONL.st, id: ONL.id, code: ONL.code, net: !!NET } : null });
/** Fake PeerJS for one lab room (same idea as tools/online-sim.cjs, on a BroadcastChannel that also works between Web Workers). */
function lmkFakePeer(name) {
  const ch = new BroadcastChannel(name), peers = new Map(), conns = new Map(); let n = 0;
  const ev = () => { const L = {}; return { on(k, f) { (L[k] || (L[k] = [])).push(f); return this; }, off() { return this; }, emit(k, ...a) { for (const f of L[k] || []) try { f(...a); } catch (e) { labIssue('crash', e, lmkCtx('peer event ' + k)); } } }; };
  function Conn(cid, me, peer, label, metadata) { return Object.assign(ev(), { cid, me, peer, label, metadata, open: false, reliable: true, dataChannel: { bufferedAmount: 0 }, peerConnection: { getStats: () => Promise.resolve(new Map()) },
    send(d) { if (this.open) ch.postMessage({ k: 'data', cid, to: peer, d: JSON.parse(JSON.stringify(d)) }); }, close() { if (!this.open) return; this.open = false; ch.postMessage({ k: 'close', cid, to: peer }); this.emit('close'); } }); }
  ch.onmessage = ({ data: m }) => { const p = peers.get(m.to); if (!p) return;
    if (m.k === 'conn') { const c = Conn(m.cid, m.to, m.from, m.label, m.metadata); conns.set(m.cid + '@' + m.to, c); p.emit('connection', c); setTimeout(() => { c.open = true; c.emit('open'); ch.postMessage({ k: 'ack', cid: m.cid, to: m.from }); }, 20); }
    else { const c = conns.get(m.cid + '@' + m.to); if (!c) return; if (m.k === 'ack') { c.open = true; c.emit('open'); } else if (m.k === 'data') c.emit('data', m.d); else if (m.k === 'close') { c.open = false; c.emit('close'); } } };
  const F = function (id) { const p = Object.assign(ev(), { id: id || 'anon-' + (Math.random() * 1e9 | 0), destroyed: false, disconnected: false,
    connect(to, o = {}) { const cid = p.id + '#' + (n++), c = Conn(cid, p.id, to, o.label, o.metadata); conns.set(cid + '@' + p.id, c); ch.postMessage({ k: 'conn', cid, to, from: p.id, label: o.label, metadata: o.metadata }); return c; },
    destroy() { p.destroyed = true; peers.delete(p.id); }, disconnect() {}, reconnect() {} }); peers.set(p.id, p); setTimeout(() => p.emit('open', p.id), 30); return p; };
  F.close = () => { try { ch.close(); } catch (e) {} }; return F;
}
const lmkDeadPeer = function () { const o = { id: 'lab', destroyed: false, on() { return o; }, off() { return o; }, connect() { const k = { open: false, on() { return k; }, send() {}, close() {} }; return k; }, destroy() { o.destroyed = true; }, disconnect() {}, reconnect() {} }; return o; };
function lmkSetPeer(P0) { globalThis.Peer = P0; try { Peer = P0; } catch (e) {} }
function lmkBegin(c, online) {
  LAB.rng = (c.seed >>> 0) || 1; LAB.issues = []; LAB.seen.clear(); LAB.ev = []; LAB.st = []; LAB.cfg = c; LMK.trail = []; LMK.inp = []; LMK.held.clear();
  const np = Math.max(1, Math.min(8, c.players || 8)), S = LMK.S = { c, online, np, mash: c.mash || .6, cap: c.frames || 18000, f: 0, last: '', ms: 0, seen: new Set(), tm: {}, off: 0 };
  S.KBK = [...new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape', 'Space', 'Backspace', 'Tab', 'KeyT', 'F2', ...KB.slice(0, np).flatMap(m => Object.values(m).flat())].filter(k => typeof k === 'string'))];
  S.NAV = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Enter', 'Enter', 'Escape'];
  // never reach the owner's servers (TURN worker, playlist search) nor WebRTC; kept after the run (async lobby code may resume later)
  globalThis.fetch = () => Promise.reject(new Error('offline (lab)')); if (typeof onlIce === 'function') onlIce = async () => [];
  if (online) { S.fp = lmkFakePeer('lab-net-' + c.room); lmkSetPeer(S.fp); S.rc = new BroadcastChannel('lab-room-' + c.room); S.rc.onmessage = e => { if (e.data && e.data.code) LMK.code = e.data.code; }; LMK.code = null; } else lmkSetPeer(lmkDeadPeer);
  LMK.pads = Array.from({ length: Math.max(0, np - 2) }, (_, i) => lmkPad(i)); globalThis.__PADS = LMK.pads;
  S.saved = { now: performance.now, errRep, rnd: Math.random };
  errRep = (w, e) => { if (LMK.on) labIssue(w === 'desync' ? 'desync' : 'crash', e, lmkCtx('caught by the game (' + w + ')')); else try { S.saved.errRep(w, e); } catch (x) {} };
  Math.random = labRand; // menus use Math.random (random fighter...): seeded so a report replays
  if (!online) { LMK.vt = 1e6; performance.now = () => LMK.vt; } // local: a fake clock, UI animations follow the frames (reproducible); online: real time
  LMK.on = true; mode = 'title';
}
/** One frame: tap, keys, pads, text, then the game's own main loop. */
function lmkFrame() {
  const S = LMK.S, R = labRand, f = S.f, mash = S.mash;
  const key = mode + (mode === 'sub' && typeof subT === 'string' ? '|' + subT : '') + (NET ? '|net' : '') + (ONL && mode !== 'game' && mode !== 'online' ? '|room' : '') + (winner >= 0 && mode === 'game' ? '|results' : '');
  LMK.f = f; S.tm[key] = (S.tm[key] || 0) + 1;
  if (key !== S.last) { S.last = key; S.seen.add(key); LMK.trail.push(f + ' ' + key); if (LMK.trail.length > 60) LMK.trail.shift(); }
  // mouse / finger first: tap something on the screen that was just drawn (hot[] belongs to it)
  if (typeof hot !== 'undefined' && hot && hot.length && R() < mash * (S.online && ONL ? .03 : .12)) { const h = hot[R() * hot.length | 0]; lmkInp('tap ' + (h.x | 0) + ',' + (h.y | 0)); try { h.hover && h.hover(); h.click && h.click(); } catch (e) { labIssue('crash', e, lmkCtx('tap')); } }
  // keyboards: press / hold / release, mostly menu keys, sometimes anything bound
  const burst = R() < mash ? 1 + (R() * 3 | 0) : 0;
  for (let k = 0; k < burst; k++) { const code = R() < .45 ? S.NAV[R() * S.NAV.length | 0] : S.KBK[R() * S.KBK.length | 0]; if (LMK.held.has(code)) continue; if (S.online && ONL && /^(Escape|Backspace)$/.test(code) && R() < .9) continue; /* online: leave the room less often, or no match ever starts */ lmkFire('keydown', code, R() < .01 ? { ctrl: 1 } : 0); LMK.held.set(code, f + 1 + (R() < .3 ? R() * 90 | 0 : 0)); lmkInp('k:' + code); }
  for (const [code, until] of LMK.held) if (f >= until) { lmkFire('keyup', code); LMK.held.delete(code); }
  // pads: random buttons and sticks
  for (const p of LMK.pads) { if (R() < mash * .5) { const b = p.buttons[R() * 17 | 0]; b.pressed = !b.pressed; b.value = b.pressed ? 1 : 0; } if (R() < mash * .3) { p.axes[0] = R() < .3 ? 0 : R() * 2 - 1; p.axes[1] = R() < .3 ? 0 : R() * 2 - 1; } p.timestamp = f; }
  // text fields: type a bit, then validate or cancel
  if (typeof TXI !== 'undefined' && TXI && R() < .3) { const r = R(); lmkFire('keydown', r < .7 ? 'Key' + 'ABCXYZ'[R() * 6 | 0] : r < .85 ? 'Backspace' : r < .95 ? 'Enter' : 'Escape'); }
  if (S.online) { lmkRoom(); if (ONL) S.room = Math.max(S.room || 0, ONL.id === 0 ? 1 + (ONL.cl || []).filter(k => k.ok).length : ONL.conn && ONL.conn.open ? 2 : 0); if (NET && !S.wasNet) S.nets = (S.nets || 0) + 1; S.wasNet = !!NET; }
  const t0 = S.saved.now.call(performance); if (!S.online) LMK.vt += 1000 / 60;
  try { loop(S.online ? S.saved.now.call(performance) : LMK.vt); } catch (e) { labIssue('crash', e, lmkCtx('main loop')); }
  S.ms += S.saved.now.call(performance) - t0; if (globalThis.__recReset) globalThis.__recReset();
  if (mode === 'game' && f % 30 === 0) labCheck();
  // local matches would last forever with mashing: KO someone now and then so results / rematch / back-to-menu get mashed too
  if (mode === 'game' && winner < 0 && !paused && !NET && P.length && R() < .015) { const al = P.filter(p => p.state !== 'dead'); if (al.length) { const p = al[R() * al.length | 0]; lmkInp('lab KO P' + (p.id + 1)); try { p.hp = 0; ko(p, 'LAB KO'); } catch (e) { labIssue('crash', e, lmkCtx('ko')); } } }
  if (f % 600 === 0 && LAB.beat) LAB.beat(f);
  S.f++;
}
/** Online: the host keeps a room open (short rules so matches end: 1 life, 1 min) and shares its code; clients keep (re)joining it. */
function lmkRoom() {
  const S = LMK.S, c = S.c, idle = !ONL || ONL.st === 'idle' || ONL.st === undefined; S.off = idle ? S.off + 1 : 0;
  if (c.role === 'host' && ONL && ONL.code && S.f % 60 === 0) S.rc.postMessage({ code: ONL.code });
  // like real players deciding: get ready in the online select / on the results, the host sends everyone to the select
  const R = labRand; try {
    if (mode === 'css' && CS2.onl && R() < .012) { const m = CS2.sl[ONL.id]; if (m) { if (!m.dev) m.dev = 'k0'; m.rd = true; lmkInp('lab: ready in select'); } }
    else if (mode === 'game' && winner >= 0 && ONL && R() < .01) { onlReady(true); lmkInp('lab: rematch'); }
    else if (c.role === 'host' && mode === 'online' && ONL && ONL.st === 'lobby' && ONL.cl.some(k => k.ok) && R() < .006) { onlBcast({ t: 'gocss' }); cssOnline(); lmkInp('lab: host CHOOSE FIGHTERS'); } }
  catch (e) { labIssue('crash', e, lmkCtx('lab player decision')); }
  if (S.off < 240 || TXI) return; S.off = 0;
  try { if (c.role === 'host') { mode = 'menu'; onlOpen(); stI = 0; TIMER = 1; onlHost(); lmkInp('lab: host a room'); S.hosts = (S.hosts || 0) + 1; }
    else if (LMK.code) { mode = 'menu'; onlOpen(); onlJoin2(LMK.code); lmkInp('lab: join ' + LMK.code); S.joins = (S.joins || 0) + 1; } } catch (e) { labIssue('crash', e, lmkCtx('lab room keeper')); }
}
function lmkEnd() {
  const S = LMK.S; LMK.on = false; for (const [code] of LMK.held) lmkFire('keyup', code); LMK.held.clear(); globalThis.__PADS = []; performance.now = S.saved.now; errRep = S.saved.errRep; Math.random = S.saved.rnd;
  try { if (typeof onlClose === 'function' && ONL) onlClose(); } catch (e) {} if (S.fp) { S.fp.close(); try { S.rc.close(); } catch (e) {} lmkSetPeer(lmkDeadPeer); }
  NET = null; TXI = null; paused = false; mode = 'menu';
  return { frames: S.f, issues: LAB.issues, screens: [...S.seen], time: S.tm, ms: S.ms | 0, rules: { players: S.np, mash: S.mash, screens: S.seen.size, role: S.c.role || 'local', room: S.room || 0, onlineMatches: S.nets || 0, hosts: S.hosts || 0, joins: S.joins || 0 } };
}
function labMonkey(c) { lmkBegin(c, false); try { while (LMK.S.f < LMK.S.cap) lmkFrame(); } finally { return lmkEnd(); } }
/** Real time (60 fps) so the messages between the workers of the room flow; done(res) at the end. */
function labMonkeyOnline(c, done) { lmkBegin(c, true); const iv = setInterval(() => { try { lmkFrame(); } catch (e) { labIssue('crash', e, lmkCtx('monkey')); } if (LMK.S.f >= LMK.S.cap) { clearInterval(iv); done(lmkEnd()); } }, 1000 / 60); }
