import { readdirSync } from 'node:fs';
import ts from 'typescript';
import { expect, it } from 'vitest';

/** The verbatim legacy draw files (`packs/render/ld/*.ts`) are `@ts-nocheck`: a legacy global they reference but never declare only fails at
 *  runtime, on the one frame that reaches it (found live: `hz` in viewfx). This re-checks them without the pragma for unresolved names only. */
it('ld files declare every name they use', () => {
  const dir = 'packs/render/ld/', files = readdirSync(dir).filter(f => f.endsWith('.ts')).map(f => dir + f);
  const host = ts.createCompilerHost({}), read = host.readFile.bind(host);
  host.readFile = f => { const s = read(f); return s && files.some(x => f.endsWith(x)) ? s.replace('@ts-nocheck', '') : s; };
  const prog = ts.createProgram(files, { noEmit: true, allowJs: true, target: ts.ScriptTarget.ES2022, lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'], types: [], noResolve: false, baseUrl: '.', paths: { '@kernel': ['src/kernel'], '@pack/*': ['packs/*'] } }, host);
  const bad = files.flatMap(f => ts.getPreEmitDiagnostics(prog, prog.getSourceFile(f)).filter(d => d.code === 2304 || d.code === 2552).map(d => `${f}:${d.file!.getLineAndCharacterOfPosition(d.start!).line + 1} ${ts.flattenDiagnosticMessageText(d.messageText, ' ').slice(0, 60)}`));
  expect(bad).toEqual([]);
}, 60_000);
