/* Canvas-2D call recorder shared by the legacy harness and (later) the port's renderer tests (DESIGN §28).
 * Records every drawing call + every property change that actually changes the effective state (save/restore aware, colours normalised),
 * so two renderers that draw the same picture produce the same stream. Offscreen canvases (sprite caches) get their own stream, referenced by id.
 * Markers ('#'/'#/') are emitted by `mark()` (legacy: wrapped draw* functions) and are IGNORED by the comparison, used only to say WHO drew a diverging op. */
const DEF = { fillStyle: '#000000', strokeStyle: '#000000', globalAlpha: 1, lineWidth: 1, font: '10px sans-serif', textAlign: 'start', textBaseline: 'alphabetic', globalCompositeOperation: 'source-over', shadowBlur: 0, shadowColor: 'rgba(0,0,0,0)', shadowOffsetX: 0, shadowOffsetY: 0, lineCap: 'butt', lineJoin: 'miter', miterLimit: 10, lineDashOffset: 0, filter: 'none', imageSmoothingEnabled: true, letterSpacing: '0px', fontKerning: 'auto' };
const col = v => { if (typeof v !== 'string') return v; let s = v.trim().toLowerCase().replace(/\s+/g, ''); const m = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/.exec(s); if (m) s = '#' + m[1] + m[1] + m[2] + m[2] + m[3] + m[3]; return s; };
function makeRecorder() {
  const streams = [[]], canv = [{ w: 0, h: 0 }]; // stream 0 = the screen; others = offscreen canvases (sprite caches)
  let gid = 0; const resets = [];
  const norm = v => v && typeof v === 'object' ? (v.__g !== undefined ? { g: v.__g } : v.__cv !== undefined ? { cv: v.__cv } : Array.isArray(v) ? v.slice() : undefined) : v;
  const snaps = [];
  function ctxFor(cid) {
    const out = () => streams[cid], t = { ...DEF }, stack = []; snaps[cid] = () => ({ ...t }); resets.push(() => { Object.assign(t, DEF); stack.length = 0; });
    return new Proxy(t, {
      get(_, k) {
        if (k === 'canvas') return canv[cid].el;
        if (k === 'measureText') return s => ({ width: (s || '').length * 8 });
        if (k === 'getTransform') return () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 });
        if (k === 'getImageData') return () => ({ data: new Uint8ClampedArray(4) });
        if (k in t) return t[k];
        if (typeof k !== 'string') return undefined;
        if (k === 'save') return () => { stack.push({ ...t }); out().push(['save']); };
        if (k === 'restore') return () => { const s = stack.pop(); if (s) Object.assign(t, s); out().push(['restore']); };
        if (k.startsWith('createLinear') || k.startsWith('createRadial') || k === 'createPattern') return (...a) => { const id = gid++; out().push([k, ...a.map(norm), id]); return { __g: id, addColorStop: (o, c) => out().push(['stop', id, o, col(c)]) }; };
        return (...a) => { out().push([k, ...a.map(norm)]); };
      },
      set(_, k, v) { const nv = k === 'fillStyle' || k === 'strokeStyle' || k === 'shadowColor' ? (v && v.__g !== undefined ? v : col(v)) : v, cur = t[k], same = nv && nv.__g !== undefined ? cur && cur.__g === nv.__g : cur === nv; t[k] = nv; if (!same) out().push(['=' + String(k), norm(nv)]); return true; },
    });
  }
  function newCanvas() {
    const id = streams.length; streams.push([]); const el = { __cv: id }; canv.push({ w: 300, h: 150, el });
    let ctx; Object.defineProperties(el, { width: { get: () => canv[id].w, set: v => { canv[id].w = v; streams[id].push(['size', v, canv[id].h]); } }, height: { get: () => canv[id].h, set: v => { canv[id].h = v; streams[id].push(['size', canv[id].w, v]); } } });
    el.getContext = () => (ctx ??= ctxFor(id)); el.style = {}; el.addEventListener = () => {}; return el;
  }
  const screen = { el: null }; screen.ctx = ctxFor(0);
  return {
    screenCtx: screen.ctx, newCanvas, mark: (n, enter) => streams[0].push(enter ? ['#', n, snaps[0]()] : ['#/', n]), // enter markers carry the effective ctx state (so a block can be re-drawn from the same state)
    /** Canonical state at the start of a frame (same on both sides: the comparison must not depend on what the previous frame leaked). */
    reset() { for (const r of resets) r(); },
    /** Ops drawn on the screen since the last take(); offscreen streams are cumulative (`sprites()`). */
    take() { const o = streams[0]; streams[0] = []; return o; },
    sprites() { return streams.slice(1).map((ops, i) => ({ id: i + 1, w: canv[i + 1].w, h: canv[i + 1].h, ops })); },
  };
}
const isMarker = o => o[0] === '#' || o[0] === '#/';
const same = (a, b, tol) => typeof a === 'number' && typeof b === 'number' ? Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b)) : a === b || (a && b && typeof a === 'object' && typeof b === 'object' && JSON.stringify(a) === JSON.stringify(b));
/** First difference between two op streams (markers ignored). Returns null when identical, else {i, a, b, who, before, na, nb}. `who` = innermost legacy draw function at that point. */
function diffOps(A, B, tol = 1e-9) {
  const a = A.filter(o => !isMarker(o)), b = B.filter(o => !isMarker(o)), n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    const x = a[i], y = b[i]; let ok = x[0] === y[0] && x.length === y.length; for (let j = 1; ok && j < x.length; j++) ok = same(x[j], y[j], tol);
    if (!ok) { let k = 0, c = 0; const st = []; for (const o of A) { if (isMarker(o)) { if (o[0] === '#') st.push(o[1]); else st.pop(); } else if (c++ === i) break; } return { i, a: x, b: y, who: st.join('>'), before: a.slice(Math.max(0, i - 3), i), na: a.length, nb: b.length }; }
  }
  return a.length === b.length ? null : { i: n, a: a[n] ?? null, b: b[n] ?? null, who: '', before: a.slice(Math.max(0, n - 3), n), na: a.length, nb: b.length };
}
module.exports = { makeRecorder, diffOps, isMarker };
