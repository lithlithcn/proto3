// Browser smoke test (needs Playwright): opens the game, collects page errors, saves title + in-game screenshots to reports/.
//   node tools/smoke.cjs     -> "SMOKE PASS" when the game loads and a CPU match runs without a JavaScript error
const fs = require('fs'), path = require('path'); const { chromium } = require('playwright'); const { server } = require('./serve.cjs');
const OUT = path.join(__dirname, '../reports'); fs.mkdirSync(OUT, { recursive: true });
server.listen(0, async () => {
  const b = await chromium.launch(), pg = await b.newPage({ viewport: { width: 1280, height: 720 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.stack || e.message));
  await pg.goto(`http://localhost:${server.address().port}/index.html`); await pg.waitForTimeout(2000); await pg.screenshot({ path: path.join(OUT, 'smoke-title.png') });
  await pg.evaluate(() => { nP = 2; nH = 0; start('game'); }); await pg.waitForTimeout(4000); await pg.screenshot({ path: path.join(OUT, 'smoke-game.png') });
  const fr = await pg.evaluate(() => frame); await b.close(); server.close();
  errs.forEach(e => console.log('ERROR', e.split('\n').slice(0, 3).join(' | ')));
  const ok = !errs.length && fr > 100; console.log(`frames run: ${fr}`); console.log(ok ? 'SMOKE PASS' : 'SMOKE FAIL'); process.exit(ok ? 0 : 1);
});
