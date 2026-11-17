// Regression check (the test of the project): plays fixed CPU matches headless and compares a fingerprint of the whole game state every
// 50 frames with tests/baseline.json. Any gameplay change, intended or not, shows up here.
//   node tools/regress.cjs             PASS, or for each match the first 50-frame window that changed / the crash with its file:line (exit 1)
//   node tools/regress.cjs --update    accept the current behaviour as the new baseline (only after an INTENDED gameplay change)
//   MATCHES=20 FRAMES=3000 node tools/regress.cjs   more coverage
const fs = require('fs'), path = require('path'); const { createGame } = require('./headless.cjs');
const B = path.join(__dirname, '../tests/baseline.json');
const CH = ['reimu', 'marisa', 'flandre', 'hecatia', 'nue', 'okina', 'nazrin', 'aya'];
const N = +(process.env.MATCHES || 8), F = +(process.env.FRAMES || 2400);
const HASH = `(()=>{const seen=new WeakSet();let h=2166136261;const S=v=>{const t=typeof v;if(t==='number'||t==='string'||t==='boolean'){const s=String(v);for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619)}else if(v&&t==='object'){if(seen.has(v))return;seen.add(v);if(v instanceof Set||v instanceof Map){S([...v]);return}for(const k of Object.keys(v)){S(k);S(v[k])}}};S({f:frame,seed,P,B,ENT,CX,CARDS,FX:FX.length,ORBS,ZONES,KOB});return h>>>0})()`;
/** Match m: 2-4 characters, items on 3 matches out of 4, CPU level 3-8, its own seed. */
const setup = m => ({ chars: [CH[m % 8], CH[(m * 3 + 1) % 8], CH[(m * 5 + 2) % 8], CH[(m * 7 + 3) % 8]].slice(0, 2 + m % 3), seed: m + 7, humans: 0, items: m % 4 !== 3, cpuLevel: 3 + m % 6 });
function play(m) {
  const o = setup(m), g = createGame(o), H = [];
  try { for (let f = 1; f <= F; f++) { g.step([]); if (f % 50 === 0) H.push(g.eval(HASH)); } }
  catch (e) { const at = /(src\/[^):]+:\d+)/.exec(e.stack || ''); return { o, H, err: e.message + (at ? ' @ ' + at[1] : '') }; }
  return { o, H };
}
module.exports = { setup, play, HASH };
if (require.main === module) {
  const upd = process.argv.includes('--update'), base = !upd && fs.existsSync(B) ? JSON.parse(fs.readFileSync(B, 'utf8')) : null, out = []; let bad = 0;
  for (let m = 0; m < N; m++) {
    const r = play(m); out.push(r.H); let msg = 'ok';
    if (r.err) { bad++; msg = 'CRASH ' + r.err; }
    else if (base && base[m]) { const i = r.H.findIndex((h, k) => h !== base[m][k]); if (i >= 0) { bad++; msg = `CHANGED between frames ${i * 50} and ${i * 50 + 50}`; } }
    console.log(`match ${m} [${r.o.chars.join(',')} items:${r.o.items} cpu:${r.o.cpuLevel}] ${msg}`);
  }
  if (upd) { fs.writeFileSync(B, JSON.stringify(out) + '\n'); console.log('baseline updated'); }
  else if (!base) console.log('no baseline yet: run with --update');
  console.log(bad ? `REGRESS FAIL (${bad})` : 'REGRESS PASS'); process.exit(bad ? 1 : 0);
}
