/* Replays a recorded op stream (+ its offscreen sprite streams) in Chromium and returns a PNG: lets us SEE a legacy frame headlessly and, once the
 * port renderer exists, compare pictures pixel by pixel when two op streams differ but may still look the same (DESIGN §28). */
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright') as { chromium: { launch(): Promise<{ newPage(): Promise<{ evaluate(s: string): Promise<unknown> }>; close(): Promise<void> }> } }; // optional dev dependency (browser screenshots)
type Op = unknown[]; interface Sprite { id: number; w: number; h: number; ops: Op[] }

const PAGE = `(arg) => { const { ops, sprites, w, h } = arg, G = {}, C = {};
  const cv = id => C[id] ??= document.createElement('canvas'), val = v => v && typeof v === 'object' && !Array.isArray(v) ? (v.g !== undefined ? G[v.g] : v.cv !== undefined ? cv(v.cv) : v) : v;
  const run = (c, list) => { for (const o of list) { const k = o[0]; if (k === '#' || k === '#/') continue;
    if (k === 'size') { c.canvas.width = o[1]; c.canvas.height = o[2]; continue; }
    if (k === 'stop') { G[o[1]].addColorStop(o[2], o[3]); continue; }
    if (k[0] === '=') { c[k.slice(1)] = val(o[1]); continue; }
    if (k === 'createLinearGradient' || k === 'createRadialGradient') { const a = o.slice(1, -1); G[o[o.length - 1]] = c[k](...a); continue; }
    if (k === 'createPattern') continue;
    try { c[k](...o.slice(1).map(val)); } catch (e) {} } };
  for (const s of sprites) { const c = cv(s.id); c.width = s.w; c.height = s.h; run(c.getContext('2d'), s.ops); }
  const scr = document.createElement('canvas'); scr.width = w; scr.height = h; run(scr.getContext('2d'), ops); return scr.toDataURL('image/png'); }`;

export async function rasterize(ops: Op[], sprites: Sprite[], w = 1280, h = 720): Promise<Buffer> {
  const b = await chromium.launch(), p = await b.newPage();
  try { const url = await p.evaluate(`(${PAGE})(${JSON.stringify({ ops, sprites, w, h })})`) as string; return Buffer.from(url.split(',')[1]!, 'base64'); } finally { await b.close(); }
}
