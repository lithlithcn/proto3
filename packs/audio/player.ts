import { ALIAS, SFXG, SFX_FILES } from './sfx-list';

/** Browser sound player (legacy sfx/revNode, lines 214-220 + the 1-action-1-sound cooldown of line 1924). Presentation only: fed with the
 *  juice sound list after each render, never read by the sim. Files are the legacy game's own sounds, extracted to public/sfx/. */
export interface Sound { n: string; v: number; r: number; k?: string }
const VOL = 0.8; // legacy T.VOL
let AC: AudioContext | null = null, REV: ConvolverNode | null = null, base = '/';
const BUF = new Map<string, AudioBuffer>(), CD = new Map<string, number>(), KEY = new Map<string, AudioBufferSourceNode>();
/** Mixer volumes (legacy VOLS; options menu = lot 3). */
export const VOLS = { master: 1, sfx: 1, music: 0.7 };

function load(k: string): void {
  const f = SFX_FILES[k]; if (!AC || !f || BUF.has(k)) return;
  const ac = AC; BUF.set(k, null as never); // in flight
  fetch(`${base}sfx/${encodeURIComponent(f)}.ogg`).then(r => r.arrayBuffer()).then(b => ac.decodeAudioData(b)).then(x => BUF.set(k, x)).catch(() => BUF.delete(k));
}
/** Legacy revNode: 2.6 s seeded noise impulse, cubic decay, 12 ms fade-in; wet 0.9. Used while time is stopped. */
function rev(ac: AudioContext): ConvolverNode {
  if (REV) return REV;
  const n = ac.sampleRate * 2.6 | 0, b = ac.createBuffer(2, n, ac.sampleRate), fi = ac.sampleRate * 0.012; let x = 12345;
  for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < n; i++) { x = (x * 1103515245 + 12345) & 0x7fffffff; d[i] = (x / 0x3fffffff - 1) * Math.pow(1 - i / n, 3.2) * (i < fi ? i / fi : 1); } }
  const cv = ac.createConvolver(), g = ac.createGain(); cv.buffer = b; g.gain.value = 0.9; cv.connect(g).connect(ac.destination); return REV = cv;
}

/** Creates/resumes the AudioContext on the first user gesture (browsers refuse audio before one) and preloads every sound. */
export function initAudio(baseUrl: string): void {
  base = baseUrl;
  const go = (): void => {
    if (!AC) { try { AC = new AudioContext(); } catch { return; } for (const k in SFX_FILES) load(k); }
    if (AC.state !== 'running') void AC.resume();
  };
  for (const e of ['pointerdown', 'keydown', 'touchstart']) addEventListener(e, go, { passive: true });
}

/** Plays one frame batch. `tstop`: reverb send (legacy: in game while TSTOP>0); `endk`: legacy ENDK swell. Missing/undecoded sounds are skipped like legacy. */
export function playSounds(list: readonly Sound[], stops: readonly string[], tstop: boolean, endk: number): void {
  if (AC && AC.state === 'running') play(list, tstop, endk);
  for (const k of stops) { const s = KEY.get(k); if (s) { try { s.stop(); } catch { /* already ended */ } KEY.delete(k); } } // after the plays: a batch can hold a start and its later stop
}
function play(list: readonly Sound[], tstop: boolean, endk: number): void {
  if (!AC) return;
  const now = performance.now(), sv = VOLS.sfx * VOLS.master * endk;
  for (const { n, v, r, k } of list) {
    if ((CD.get(n) ?? 0) > now) continue; CD.set(n, now + 45); // legacy SCD: one action = one sound
    const name = BUF.get(n) ? n : ALIAS[n] ?? n, buf = BUF.get(name); if (!buf) { load(name); continue; }
    const s = AC.createBufferSource(), g = AC.createGain(); s.buffer = buf; s.playbackRate.value = r; g.gain.value = v * sv * (SFXG[n] ?? 1) * VOL; s.connect(g);
    if (tstop) { const d = AC.createGain(); d.gain.value = 0.5; g.connect(d).connect(AC.destination); g.connect(rev(AC)); } else g.connect(AC.destination);
    s.start(); if (k) { KEY.set(k, s); s.onended = () => { if (KEY.get(k) === s) KEY.delete(k); }; }
  }
}
