'use strict';
/**
 * DEBUG LAB > BALANCE: every matchup (each pair of characters, mirrors included, sides alternated) played N times by the CPU in Web Workers,
 * measured by worker/balance.js. At the end (or any time) DOWNLOAD gives one text file: DIAGNOSTIC (readable verdicts with confidence
 * intervals) + per-character stats + matchup matrix + raw JSON, in the owner's merge format.
 * Caveat written in the diagnostic: results measure "characters as played by the CPU AI"; a kit the AI plays badly looks weaker.
 */
const LABB = { on: false, per: 30, cpu: 9, items: false, lives: 2, timer: 3, map: 0, jobs: [], next: 0, done: 0, R: [], t0: 0 };
function labBalJobs() { const K = CHR.map(c => c.k), J = []; let s = (Date.now() % 1e9) | 1;
  for (let a = 0; a < K.length; a++) for (let b = a; b < K.length; b++) for (let n = 0; n < LABB.per; n++) { s = (s * 1103515245 + 12345) >>> 0; J.push({ seed: s || 1, chars: n % 2 ? [K[b], K[a]] : [K[a], K[b]], cpu: LABB.cpu, items: LABB.items, lives: LABB.lives, timer: LABB.timer, map: LABB.map, frames: (LABB.timer || 5) * 3600 + 600 }); }
  return J; }
function labBalStart() { LABS.on = false; Object.assign(LABB, { on: true, jobs: labBalJobs(), next: 0, done: 0, R: [], t0: performance.now() }); sfx('ok00'); }
function labBalTick(idle) { for (const w of idle) { if (LABB.next >= LABB.jobs.length) { if (!LABS.W.some(x => x.busy)) { LABB.on = false; sfx('bonus', .6); } return; } const c = LABB.jobs[LABB.next++]; w.busy = true; w.job = c; w.t = performance.now(); w.wk.postMessage({ job: 'balance', cfg: c }); } }
function labBalRes(r) { LABB.done++; if (r && !r.err) LABB.R.push(r); if (r && r.issues) for (const i of r.issues) labReport(i, { job: 'balance' }); }
const lbPct = x => (x * 100).toFixed(1) + '%';
/** Wilson 95% interval of a win rate. */
function lbCI(w, n) { if (!n) return [0, 0]; const z = 1.96, p = w / n, d = 1 + z * z / n, c = p + z * z / (2 * n), e = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)); return [(c - e) / d, (c + e) / d]; }
const lbTop = (o, n, tot) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => k + ' ' + (tot ? lbPct(v / tot) : Math.round(v))).join(', ') || '-';
/** Groups sources by kind: 'heavy [nazrin-souris:9 EST.nrc]' -> 'heavy', 'melee:jab' -> 'melee'. */
const lbFam = o => { const r = {}; for (const k in o) { const f = k.split(/[ :[]/)[0]; r[f] = (r[f] || 0) + o[k]; } return r; };
function labBalStats() {
  const K = CHR.map(c => c.k), C = {}, M = {}; for (const k of K) { C[k] = { games: 0, wins: 0, out: 0, in: 0, kos: 0, deaths: 0, parries: 0, spells: 0, ults: 0, items: 0, frames: 0, src: {}, deathBy: {}, koWith: {}, firstBlood: 0, comebacks: 0, timeouts: 0, stockWin: 0 }; M[k] = {}; for (const j of K) M[k][j] = { w: 0, n: 0 }; }
  let len = 0, to = 0; const lens = [];
  for (const r of LABB.R) { len += r.frames; lens.push(r.frames); if (r.timeout) to++; const [a, b] = r.chars;
    r.stats.forEach((s, i) => { const c = C[s.char]; if (!c) return; c.games++; c.out += s.out; c.in += s.in; c.kos += s.kos; c.deaths += s.deaths; c.parries += s.parries; c.spells += s.spells; c.ults += s.ults; c.items += s.items; c.frames += r.frames; c.firstBlood += s.firstBlood;
      for (const k in s.src) c.src[k] = (c.src[k] || 0) + s.src[k]; for (const k in s.deathBy) c.deathBy[k] = (c.deathBy[k] || 0) + s.deathBy[k]; for (const k in s.koWith) c.koWith[k] = (c.koWith[k] || 0) + s.koWith[k];
      if (r.timeout) c.timeouts++; if (r.winner === i) { c.wins++; c.stockWin += r.stocksLeft[i] || 0; if (r.comeback) c.comebacks++; } });
    if (a !== b) { M[a][b].n++; M[b][a].n++; if (r.winner === 0) M[a][b].w++; else if (r.winner === 1) M[b][a].w++; } }
  return { K, C, M, n: LABB.R.length, avgLen: LABB.R.length ? len / LABB.R.length : 0, timeouts: to, lens: lens.sort((x, y) => x - y) };
}
function labBalDiagnostic(S) {
  const { K, C, M } = S, L = [], sec = f => (f / 60).toFixed(1) + ' s', mins = c => Math.max(1, c.frames / 3600);
  L.push('SHMUP FIGHTER — BALANCE DIAGNOSTIC', new Date().toISOString(), `${S.n} matches · CPU level ${LABB.cpu} · items ${LABB.items ? 'ON' : 'OFF'} · ${(LABB.lives | 0) + 1} lives · timer ${LABB.timer || 'off'} min · map ${(MAPS[LABB.map] || {}).name}`, '',
    'READ FIRST: these numbers measure each kit AS PLAYED BY THE CPU AI. A character the AI plays badly looks weaker than it is. Mirrors should be ~50% (sanity check).', '');
  const rank = K.map(k => { const c = C[k], [lo, hi] = lbCI(c.wins, c.games - (C[k].mirror || 0)); return { k, c, wr: c.games ? c.wins / c.games : 0, lo, hi }; }).sort((a, b) => b.wr - a.wr);
  L.push('== OVERALL WIN RATE (95% confidence interval) ==');
  for (const r of rank) { const flag = r.lo > .5 ? '  ▲ STRONG (significant)' : r.hi < .5 ? '  ▼ WEAK (significant)' : ''; L.push(`${r.k.padEnd(9)} ${lbPct(r.wr).padStart(6)}  [${lbPct(r.lo)} – ${lbPct(r.hi)}]  ${r.c.games} games${flag}`); }
  L.push('', '== MATCHUP MATRIX (row win % vs column) ==', ' '.repeat(10) + K.map(k => k.slice(0, 6).padStart(7)).join(''));
  for (const a of K) L.push(a.padEnd(10) + K.map(b => a === b ? '      -' : M[a][b].n ? lbPct(M[a][b].w / M[a][b].n).padStart(7) : '      ?').join(''));
  const lop = []; for (const a of K) for (const b of K) if (a < b && M[a][b].n >= 6) { const p = M[a][b].w / M[a][b].n, [lo, hi] = lbCI(M[a][b].w, M[a][b].n); if (lo > .6 || hi < .4) lop.push(`${p > .5 ? a : b} beats ${p > .5 ? b : a}: ${lbPct(Math.max(p, 1 - p))} (${M[a][b].n} games)`); }
  L.push('', '== LOPSIDED MATCHUPS (significantly beyond 60/40) ==', ...(lop.length ? lop : ['none']));
  L.push('', '== PER CHARACTER ==');
  for (const r of rank) { const c = r.c, src = Object.values(c.src).reduce((a, b) => a + b, 0) || 1, dth = Object.values(c.deathBy).reduce((a, b) => a + b, 0) || 1, kw = Object.values(c.koWith).reduce((a, b) => a + b, 0) || 1, g = c.games || 1;
    L.push(`-- ${r.k.toUpperCase()} --`, `damage dealt ${(c.out / g).toFixed(0)}/match (${(c.out / mins(c)).toFixed(0)}/min) · taken ${(c.in / g).toFixed(0)}/match · ratio ${(c.out / Math.max(1, c.in)).toFixed(2)}`,
      `KOs ${(c.kos / g).toFixed(2)}/match · deaths ${(c.deaths / g).toFixed(2)}/match · first blood ${lbPct(c.firstBlood / g)} · comeback wins ${c.wins ? lbPct(c.comebacks / c.wins) : '-'} · stocks left when winning ${c.wins ? (c.stockWin / c.wins).toFixed(2) : '-'}`,
      `parries ${(c.parries / g).toFixed(1)}/match · spells ${(c.spells / g).toFixed(2)} · last words ${(c.ults / g).toFixed(2)}${LABB.items ? ' · items ' + (c.items / g).toFixed(1) : ''} · timeouts ${lbPct(c.timeouts / g)}`,
      `damage by kind: ${lbTop(lbFam(c.src), 8, src)}`, `top damage sources: ${lbTop(c.src, 6, src)}`, `KOs scored with: ${lbTop(c.koWith, 4, kw)}`, `killed by: ${lbTop(c.deathBy, 4, dth)}`);
    const top = Object.entries(c.src).sort((a, b) => b[1] - a[1])[0]; if (top && top[1] / src > .45) L.push(`   ⚠ relies on "${top[0]}" for ${lbPct(top[1] / src)} of its damage`);
    const used = new Set(Object.keys(c.src).filter(k => k.startsWith('melee:')).map(k => k.slice(6))), mv = Object.keys((CHR.find(x => x.k === r.k) || {}).melee || {}).filter(m => !used.has(m)); if (mv.length) L.push(`   ⚠ melee moves that never hit: ${mv.join(', ')} (unused by the AI or too hard to land)`); }
  const all = {}; for (const k of K) for (const s in C[k].koWith) all[s] = (all[s] || 0) + C[k].koWith[s];
  const q = p => S.lens.length ? sec(S.lens[Math.min(S.lens.length - 1, S.lens.length * p | 0)]) : '-';
  L.push('', '== GLOBAL ==', `average match ${sec(S.avgLen)} (median ${q(.5)}, 10% ${q(.1)}, 90% ${q(.9)}) · timeouts ${lbPct(S.timeouts / Math.max(1, S.n))}`, `most lethal sources overall: ${lbTop(all, 6, Object.values(all).reduce((a, b) => a + b, 0))}`);
  const spread = rank.length ? rank[0].wr - rank[rank.length - 1].wr : 0; L.push(`win-rate spread (best - worst): ${lbPct(spread)} ${spread > .2 ? '→ the cast is NOT balanced yet' : spread > .1 ? '→ moderate gaps' : '→ tight'}`);
  return L.join('\n');
}
function labBalDownload() { const S = labBalStats(); const csv = ['vs,' + S.K.join(','), ...S.K.map(a => a + ',' + S.K.map(b => a === b ? '' : S.M[a][b].n ? (S.M[a][b].w / S.M[a][b].n).toFixed(3) : '').join(','))].join('\n');
  labDlText('shmup-balance-' + labStamp() + '.txt', labMerge([['DIAGNOSTIC.txt', labBalDiagnostic(S)], ['matchups.csv', csv], ['stats.json', JSON.stringify(Object.assign({ kind: 'proto4-balance' }, labEnv(), { settings: { per: LABB.per, cpu: LABB.cpu, items: LABB.items, lives: LABB.lives + 1, timer: LABB.timer, map: (MAPS[LABB.map] || {}).name }, matches: S.n, avgFrames: S.avgLen | 0, chars: S.C, matchups: S.M }), null, 1)]])); sfx('ok00'); }
const LABBL = () => {
  const n = CHR.length * (CHR.length + 1) / 2 * LABB.per, el = LABB.on ? (performance.now() - LABB.t0) / 1000 : 0, eta = LABB.on && LABB.done > 2 ? ' · ~' + ((LABB.jobs.length - LABB.done) * el / LABB.done / 60 | 0) + ' min left' : '';
  return [
    { t: () => (LABB.on ? 'STOP' : 'START') + ': ' + (LABB.on ? 'playing every matchup' : n + ' matches (' + CHR.length + ' fighters, all pairs)'), f: () => LABB.on ? labStop() : labBalStart() },
    { t: () => 'Progress: ' + LABB.done + ' / ' + (LABB.jobs.length || n) + eta, f: () => {} },
    { t: () => 'DOWNLOAD STATS + DIAGNOSTIC (' + LABB.R.length + ' matches)', f: labBalDownload },
    { t: () => 'Matches per matchup: ' + LABB.per + '  ◀ ▶', lr: labLR(LABB, 'per', [10, 30, 100, 300, 1000]) },
    { t: () => 'CPU level: ' + LABB.cpu + '  ◀ ▶', lr: labLR(LABB, 'cpu', labRange(1, 9)) },
    { t: () => 'Items: ' + labV(LABB.items) + '  ◀ ▶', lr: labLR(LABB, 'items', [false, true]) },
    { t: () => 'Lives: ' + (LABB.lives + 1) + '  ◀ ▶', lr: labLR(LABB, 'lives', [0, 1, 2, 3, 4]) },
    { t: () => 'Timer: ' + (LABB.timer ? LABB.timer + ' MIN' : 'OFF') + '  ◀ ▶', lr: labLR(LABB, 'timer', [0, 1, 2, 3, 5]) },
    { t: () => 'Map: ' + (MAPS[LABB.map] || {}).name + '  ◀ ▶', lr: labLR(LABB, 'map', MAPS.map((_, i) => i)) },
    { t: () => 'Parallel workers: ' + LABC.par + '  ◀ ▶', lr: d => { LABC.par = clamp(LABC.par + (d < 0 ? -1 : 1), 1, 64); } },
    { t: () => 'Back', f: () => nav('back') }];
};
Object.assign(RDESC, { 'DOWNLOAD STATS + DIAGNOSTIC': 'One .txt: readable diagnostic, matchup matrix (CSV) and every raw number (JSON). Works during the run too.', 'Matches per matchup': 'More = more reliable verdicts (the diagnostic shows confidence intervals).' });
