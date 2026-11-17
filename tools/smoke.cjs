// Browser smoke test (needs Playwright): opens the game, collects page errors, saves title + in-game screenshots to reports/.
//   node tools/smoke.cjs     -> "SMOKE PASS" when the game loads and a CPU match runs without a JavaScript error
const fs = require('fs'), path = require('path'); const { chromium } = require('playwright'); const { server } = require('./serve.cjs');
const OUT = path.join(__dirname, '../reports'); fs.mkdirSync(OUT, { recursive: true });
server.listen(0, async () => {
  const b = await chromium.launch(), pg = await b.newPage({ viewport: { width: 1280, height: 720 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.stack || e.message));
  await pg.goto(`http://localhost:${server.address().port}/index.html`); await pg.waitForTimeout(2000); await pg.screenshot({ path: path.join(OUT, 'smoke-title.png') });
  await pg.evaluate(() => { nP = 2; nH = 0; start('game'); }); await pg.waitForTimeout(4000); await pg.screenshot({ path: path.join(OUT, 'smoke-game.png') });
  const fr = await pg.evaluate(() => frame);
  // the YouTube player (loaded when the network allows it) can take the keyboard focus: give it back to the game before pressing keys
  const focusGame = () => pg.evaluate(() => { const a = document.activeElement; if (a && a !== document.body) a.blur(); window.focus(); return a ? a.tagName : ''; });
  // every declared mode (content/*): open it, play 2 s with input held, go back to the hub
  await pg.evaluate(() => { mode = 'menu'; }); await pg.waitForTimeout(600); await pg.screenshot({ path: path.join(OUT, 'smoke-hub.png') });
  const ids = await pg.evaluate(() => Object.values(MODEX).map(m => m.id));
  for (const id of ids) {
    await focusGame(); await pg.evaluate(i => openMode(i), id); await pg.keyboard.down('KeyD'); await pg.waitForTimeout(2000); await pg.keyboard.up('KeyD');
    await pg.screenshot({ path: path.join(OUT, `smoke-mode-${id}.png`) }); await pg.keyboard.press('Escape'); await pg.waitForTimeout(300);
    const m = await pg.evaluate(() => mode); if (m !== 'menu' && m !== 'sub') errs.push(`mode ${id}: Escape did not go back (mode=${m}, focus=${await pg.evaluate(() => document.activeElement && document.activeElement.tagName)})`);
  }
  console.log(`modes checked: ${ids.join(', ') || 'none'}`);
  // secret DEBUG LAB: typed code opens it, its workers load the game and finish at least one headless match
  await pg.evaluate(() => { mode = 'title'; }); await focusGame(); for (const c of 'ewekeks') await pg.keyboard.press(c);
  if (await pg.evaluate(() => mode + subT) !== 'subDEBUG LAB') errs.push('debug lab: the code "ewekeks" did not open it');
  else { await pg.evaluate(() => { LABC.par = 2; LABC.kind = 'cpu'; LABC.frames = 600; LABC.autodl = false; labStart(); });
    let g = 0; for (let i = 0; i < 40 && !g; i++) { await pg.waitForTimeout(500); g = await pg.evaluate(() => LABS.games); }
    const bad = await pg.evaluate(() => Object.values(LABS.list).filter(L => /load|worker/.test(L.first.type)).map(L => L.first.msg)); await pg.evaluate(() => labStop());
    if (!g) errs.push('debug lab: no game finished in 20 s ' + bad.join(' | ')); else console.log(`debug lab: ${g} headless game(s) done in workers`); } await b.close(); server.close();
  errs.forEach(e => console.log('ERROR', e.split('\n').slice(0, 3).join(' | ')));
  const ok = !errs.length && fr > 100; console.log(`frames run: ${fr}`); console.log(ok ? 'SMOKE PASS' : 'SMOKE FAIL'); process.exit(ok ? 0 : 1);
});
