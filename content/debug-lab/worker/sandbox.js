'use strict';
/* Minimal browser stand-ins so the game scripts load inside a Web Worker (no DOM, no rendering, no sound). */
(() => {
  const ctx = new Proxy({}, { get: (o, k) => k in o ? o[k] : k === 'measureText' ? (t => ({ width: String(t).length * 8 })) : k === 'getImageData' ? (() => ({ data: new Uint8ClampedArray(4) })) : (k === 'createLinearGradient' || k === 'createRadialGradient' || k === 'createPattern') ? (() => ({ addColorStop() {} })) : k === 'canvas' ? { width: 1280, height: 720 } : (() => {}), set: (o, k, v) => { o[k] = v; return true; } });
  // any DOM element: a callable proxy that tolerates every access (querySelector().classList.add()..., numbers read as 0)
  const el = () => { const o = { style: {}, dataset: {}, children: [], childNodes: [], width: 1280, height: 720, value: '', textContent: '', innerHTML: '' };
    return new Proxy(function () {}, { get: (t, k) => k in o ? o[k] : k === 'getContext' ? () => ctx : k === 'then' ? undefined : k === Symbol.toPrimitive ? () => 0 : k === 'getBoundingClientRect' ? () => ({ left: 0, top: 0, width: 1280, height: 720 }) : k === 'querySelectorAll' || k === 'getElementsByTagName' ? () => [] : k === 'contains' ? () => false : el(),
      set: (t, k, v) => { o[k] = v; return true; }, apply: () => el() }); };
  const EVH = self.__EVH = {}; // window/document listeners, kept so the UI monkey (monkey.js) can fire real key events
  const S = {}, mem = { getItem: k => k in S ? S[k] : null, setItem: (k, v) => { S[k] = String(v); }, removeItem: k => { delete S[k]; }, clear() {} };
  Object.assign(self, { window: self, document: { getElementById: el, createElement: el, querySelector: () => null, querySelectorAll: () => [], head: el(), body: el(), documentElement: el(), addEventListener: (t, f) => { (EVH[t] || (EVH[t] = [])).push(f); }, removeEventListener() {}, hidden: false, fonts: { load: () => Promise.resolve() } },
    innerWidth: 1280, innerHeight: 720, devicePixelRatio: 1, screen: { orientation: {} }, localStorage: mem, sessionStorage: mem, requestAnimationFrame() {}, cancelAnimationFrame() {}, matchMedia: () => ({ matches: false, addEventListener() {} }),
    alert() {}, confirm: () => false, prompt: () => null, Image: function () { return el(); }, Audio: function () { return el(); }, AudioContext: undefined, webkitAudioContext: undefined, Worker: undefined, Path2D: function () {}, addEventListener: (t, f) => { if (t !== 'message') (EVH[t] || (EVH[t] = [])).push(f); }, removeEventListener() {} });
  if (!navigator.getGamepads) navigator.getGamepads = () => self.__PADS || [];
})();
