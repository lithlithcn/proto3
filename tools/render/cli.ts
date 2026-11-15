/* pnpm render legacy <charA,charB> <frames> <out.png> : plays the legacy game headless (idle bots) and saves what its renderer drew at that frame. */
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { rasterize } from './raster';
const { createLegacy } = createRequire(import.meta.url)('../parity/legacy.cjs') as { createLegacy: (o: object) => { step(i: object[]): void; render(): unknown[][]; rec: { sprites(): { id: number; w: number; h: number; ops: unknown[][] }[] } } };
const [cmd, chars, frames, out] = process.argv.slice(2);
if (cmd === 'compare') await import('./compare');
else if (cmd === 'legacy' && chars && frames && out) {
  const L = createLegacy({ chars: chars.split(','), seed: 1 });
  for (let f = 0; f < +frames; f++) L.step([{ x: f % 90 < 45 ? 0.6 : -0.6, b: { shot: f % 40 < 20 } }, { x: -0.3, b: { shot: f % 60 < 30 } }]);
  const ops = L.render(); writeFileSync(out, await rasterize(ops, L.rec.sprites())); console.log(`wrote ${out} (${ops.length} ops)`);
} else console.log('usage: pnpm render legacy <a,b> <frames> <out.png>');
