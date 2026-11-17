/** Music (legacy MUS / BMUS / musPick / musPlay / musTick, line ~2038 + 4018): built-in tracks per screen (public/music, the owner's files),
 *  plus the player's own files per screen stored in IndexedDB `sf_music` (same store as legacy), weighted random pick, fade-in, KO dip
 *  (slower + quieter for ~2 s), ducking, paused while time is stopped, ENDK swell. Presentation only. */
export interface Track { id: string; scr: string; name: string; w: number; url: string; blob?: Blob; b?: 1 }
export const MSCRS = [['menu', 'Menu'], ['combat', 'Combat'], ['training', 'Training'], ['results', 'Results']] as const;
const BMUS = [['menu', 'menumusiclofi'], ['menu', 'menumusicupbeat'], ['menu', 'menumusicmegaman'], ['combat', 'fight1'], ['combat', 'fight2'], ['combat', 'fight4'], ['combat', 'menumusicmegaman'], ['combat', 'fight8'], ['combat', 'fight9'], ['combat', 'fight10'], ['training', 'fight8'], ['training', 'fight10'], ['results', 'results'], ['results', 'results2'], ['last', '1stockleft'], ['last', '1stockleft2'], ['last', '1stockleft3']] as const;
export const MUS: Track[] = [];
const BFAIL = new Set<string>(), M = { scr: '', cur: null as Track | null, fade: 0, duck: 0, ko: -1e9, pend: false, tsP: false, base: '/' };
const A: HTMLAudioElement | null = typeof Audio === 'function' ? new Audio() : null;
let DB: Promise<IDBDatabase | null> = Promise.resolve(null);
const bTracks = (scr: string): Track[] => BMUS.filter(b => b[0] === scr && !BFAIL.has(b[1])).map(b => ({ id: 'b:' + b[1], scr, url: M.base + 'music/' + b[1] + '.ogg', w: 5, name: b[1], b: 1 as const }));
function pick(scr: string): Track | null {
  const L = MUS.filter(t => t.scr === scr).concat(bTracks(scr)); if (!L.length) return null;
  const C = L.length > 1 ? L.filter(t => !M.cur || t.id !== M.cur.id) : L; let r = Math.random() * C.reduce((a, t) => a + t.w, 0);
  for (const t of C) if ((r -= t.w) <= 0) return t; return C[0]!;
}
export function musPlay(t: Track | null): void { if (!A) return; M.cur = t; if (!t) { A.pause(); return; } A.src = t.url; A.currentTime = 0; M.fade = 0; A.play().catch(() => { M.pend = true; }); }
export function initMusic(base: string): void {
  M.base = base; if (!A) return;
  A.onended = () => musPlay(pick(M.scr)); A.addEventListener('error', () => { if (M.cur?.b) { BFAIL.add(M.cur.name); musPlay(pick(M.scr)); } });
  const go = (): void => { if (M.pend && M.cur) { M.pend = false; A.play().catch(() => {}); } }; addEventListener('pointerdown', go); addEventListener('keydown', go); addEventListener('touchstart', go);
  DB = new Promise(r => { try { const q = indexedDB.open('sf_music', 1); q.onupgradeneeded = () => q.result.createObjectStore('t', { keyPath: 'id' }); q.onsuccess = () => r(q.result); q.onerror = () => r(null); } catch { r(null); } });
  void DB.then(db => { if (!db) return; const g = db.transaction('t').objectStore('t').getAll(); g.onsuccess = () => { for (const t of g.result as Track[]) MUS.push({ ...t, url: URL.createObjectURL(t.blob!) }); }; });
}
const put = (t: Track): void => { void DB.then(db => { if (db) db.transaction('t', 'readwrite').objectStore('t').put({ id: t.id, scr: t.scr, name: t.name, w: t.w, blob: t.blob }); }); };
const del = (id: string): void => { void DB.then(db => { if (db) db.transaction('t', 'readwrite').objectStore('t').delete(id); }); };
/** File picker: adds the chosen audio files to screen `scr`. */
export function addMusic(scr: string): void {
  const i = document.createElement('input'); i.type = 'file'; i.accept = 'audio/*'; i.multiple = true;
  i.onchange = () => { for (const f of Array.from(i.files ?? [])) { const t: Track = { id: Date.now() + '_' + Math.random().toString(36).slice(2, 7), scr, name: f.name.replace(/\.[^.]+$/, '').slice(0, 30), w: 5, blob: f, url: URL.createObjectURL(f) }; MUS.push(t); put(t); } if (M.scr === scr) M.scr = ''; };
  i.click();
}
export const setWeight = (t: Track, w: number): void => { t.w = w; put(t); };
export function removeMusic(t: Track): void { const i = MUS.indexOf(t); if (i >= 0) MUS.splice(i, 1); del(t.id); URL.revokeObjectURL(t.url); if (M.cur === t) { M.cur = null; M.scr = ''; } }
/** A KO happened (music dips). */
export const musKO = (): void => { M.ko = performance.now(); };
/** Once per frame. `scr` = '' (title: keep silent / current), 'menu', 'combat', 'training', 'results', 'last'. `vol` = music × master. */
export function musTick(scr: string, vol: number, endk: number, duck: boolean, tstop: boolean, game: boolean): void {
  if (!A) return;
  if (scr !== M.scr) { M.scr = scr; musPlay(pick(scr)); }
  M.fade = Math.min(1, M.fade + 0.02); const kd = (performance.now() - M.ko) / 1000, ke = kd < 0 ? 0 : kd < 0.12 ? kd / 0.12 : kd < 1.1 ? 1 : kd < 2.1 ? 1 - (kd - 1.1) : 0;
  M.duck += ((game && duck ? 1 : 0) - M.duck) * 0.05; A.volume = Math.max(0, Math.min(1, vol * endk * M.fade * (1 - 0.45 * ke) * (1 - 0.75 * M.duck)));
  if (game && tstop) { if (!A.paused) { A.pause(); M.tsP = true; } } else if (M.tsP) { M.tsP = false; A.play().catch(() => {}); }
  const pr = +(1 - 0.32 * ke).toFixed(2); if (A.playbackRate !== pr) { try { (A as HTMLAudioElement & { preservesPitch: boolean }).preservesPitch = false; A.playbackRate = pr; } catch { /* old browsers */ } }
}
