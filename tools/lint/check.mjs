// Repo rules that TypeScript cannot express (DESIGN §3, §14, §15). Zero dependencies. `pnpm lint`.
// Sim code = src/kernel/** and everything under packs/** EXCEPT folders named ui, render, audio, presentation, tests files and *.test.ts.
// Escape hatch: a trailing `// sim-allow(reason)` on the same line (reason mandatory). Use sparingly; reviewed in PRs.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const root = new URL('../../', import.meta.url).pathname;
const NON_SIM_DIRS = new Set(['ui', 'render', 'audio', 'presentation', 'node_modules']);
const MAX_LINES = 400;
const BANS = [
  [/\bMath\.(sin|cos|tan|asin|acos|atan|atan2|sinh|cosh|tanh|hypot|pow|exp|expm1|log|log1p|log2|log10|cbrt|random)\b/, 'banned Math.* in sim — use sim.math / rng streams'],
  [/\b(Date|performance)\b\s*[.(]/, 'Date/performance in sim — time is frame counts'],
  [/\b(setTimeout|setInterval|requestAnimationFrame|localStorage|sessionStorage|indexedDB|fetch|XMLHttpRequest|WebSocket)\b/, 'I/O or timers in sim'],
  [/\b(document|window|navigator)\./, 'DOM in sim'],
  [/\b(localeCompare|Intl|toLocaleString)\b/, 'locale-dependent API in sim'],
  [/\bJSON\.stringify\b/, 'JSON.stringify in sim (hash via schemas)'],
  [/\.sort\(/, 'Array.sort in sim — use sortBy(arr, key, id)'],
  [/\bnew Function\b|\beval\(/, 'dynamic code in sim'],
];
const errors = [];
const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (['node_modules', 'dist', 'build', 'legacy', '.git', 'tools'].includes(name)) continue;
    const p = join(dir, name), st = statSync(p);
    if (st.isDirectory()) walk(p); else if (/\.(ts|mjs|js|svelte)$/.test(name)) files.push(p);
  }
})(root);

for (const f of files) {
  const rel = relative(root, f).split(sep).join('/');
  const lines = readFileSync(f, 'utf8').split('\n');
  if (lines.length > MAX_LINES) errors.push(`${rel}: ${lines.length} lines (max ${MAX_LINES}) — split by concept`);
  const parts = rel.split('/');
  const inKernel = rel.startsWith('src/kernel/');
  const inPack = parts[0] === 'packs';
  const isTest = /\.test\.ts$/.test(rel) || parts.includes('tests');
  if (inKernel && /from ['"][^'"]*\/packs\//.test(lines.join('\n'))) errors.push(`${rel}: kernel must never import a pack`);
  if (inPack && !isTest) {
    const text = lines.join('\n');
    // packs may import the kernel and declared dependencies only (cross-pack relative imports are forbidden)
    for (const m of text.matchAll(/from ['"](\.\.[^'"]*)['"]/g)) {
      const target = join(f, '..', m[1]).split(sep).join('/');
      const packDir = join(root, 'packs', parts[1]) + '/';
      if (!target.startsWith(packDir)) errors.push(`${rel}: relative import escapes its pack (${m[1]}) — import '@kernel' or '@pack/<dep>'`);
    }
    let manifest = '';
    try { manifest = readFileSync(join(root, 'packs', parts[1], 'pack.ts'), 'utf8'); } catch { /* no manifest: reported elsewhere */ }
    const reqs = [...(manifest.match(/requires:\s*\[([^\]]*)\]/)?.[1] ?? '').matchAll(/['"]([^'"@]+)/g)].map(x => x[1]);
    for (const m of text.matchAll(/from ['"]@pack\/([^/'"]+)/g)) if (m[1] !== parts[1] && !reqs.includes(m[1])) errors.push(`${rel}: imports pack '${m[1]}' without listing it in requires`);
  }
  const isSim = (inKernel || inPack) && !isTest && !parts.some(p => NON_SIM_DIRS.has(p)) && !/loop\.ts$|sanitizer\.ts$/.test(rel);
  if (!isSim) continue;
  lines.forEach((line, i) => {
    const code = line.replace(/\/\/.*$/, (c) => (/sim-allow\(.+\)/.test(c) ? c : ''));
    if (/sim-allow\(.+\)/.test(line)) return;
    if (/^\s*(\*|\/\*)/.test(line)) return; // doc comments
    for (const [re, why] of BANS) if (re.test(code.replace(/'[^']*'|"[^"]*"|`[^`]*`/g, '""'))) errors.push(`${rel}:${i + 1}: ${why}`);
  });
}
if (errors.length) { console.error(errors.join('\n') + `\n\n${errors.length} lint error(s).`); process.exit(1); }
console.log(`lint ok (${files.length} files)`);
