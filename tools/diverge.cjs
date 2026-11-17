// "Why did `npm test` say CHANGED?": plays the same regress match with the current code and with another git version (default HEAD),
// finds the FIRST frame where the game state differs and prints exactly which values differ (P[1].hp: 80 -> 72, B.length...).
//   node tools/diverge.cjs [match=0] [ref=HEAD] [frames=2400]
const fs = require('fs'), path = require('path'), os = require('os'), { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..'), [m = '0', ref = 'HEAD', F = '2400'] = process.argv.slice(2);
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'p4-diverge-'));
execSync(`git -C "${ROOT}" worktree add --detach "${dir}" ${ref}`, { stdio: 'ignore' });
try {
  const { setup } = require('./regress.cjs'), o = setup(+m), A = require(path.join(dir, 'tools/headless.cjs')).createGame(o), B = require('./headless.cjs').createGame(o);
  const SNAP = `JSON.stringify({frame,seed,winner,P:P.map(p=>Object.fromEntries(Object.entries(p).filter(([k,v])=>typeof v!=='object'||v===null||Array.isArray(v)&&v.length<16))),B:B.map(b=>[b.x,b.y,b.vx,b.vy,b.owner]),ENT:ENT.map(e=>[e.k,e.x,e.y,e.t]),CX:Object.keys(CX).sort()})`;
  const diff = (a, b, p, out) => { if (out.length > 25) return; if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) { if (a !== b && !(Number.isNaN(a) && Number.isNaN(b))) out.push(`${p}: ${JSON.stringify(a)} -> ${JSON.stringify(b)}`); return; }
    if (Array.isArray(a) && a.length !== b.length) out.push(`${p}.length: ${a.length} -> ${b.length}`); for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) diff(a[k], b[k], p ? p + (Array.isArray(a) ? `[${k}]` : '.' + k) : k, out); };
  for (let f = 1; f <= +F; f++) { A.step([]); B.step([]); const a = A.eval(SNAP), b = B.eval(SNAP);
    if (a !== b) { const out = []; diff(JSON.parse(a), JSON.parse(b), '', out); console.log(`match ${m} [${o.chars}]: first difference at frame ${f} (${ref} -> working tree):`); out.forEach(l => console.log('  ' + l)); process.exitCode = 1; break; }
    if (f === +F) console.log(`match ${m}: identical for ${F} frames (${ref} vs working tree)`); }
} finally { execSync(`git -C "${ROOT}" worktree remove --force "${dir}"`, { stdio: 'ignore' }); }
