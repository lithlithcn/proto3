// Local dev server: node tools/serve.cjs [port]  (SITE=<dir> serves another folder, e.g. CI's _site)  -> http://localhost:8080 (plain files, no build: edit a file, reload the page).
const http = require('http'), fs = require('fs'), path = require('path'); const ROOT = process.env.SITE ? path.resolve(process.env.SITE) : path.join(__dirname, '..'), PORT = +(process.argv[2] || 8080);
const T = { '.html': 'text/html', '.js': 'text/javascript', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.opus': 'audio/ogg', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp' };
const server = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]).replace(/\/$/, '/index.html')); if (!f.startsWith(ROOT)) { r.writeHead(403); r.end(); return; }
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });
module.exports = { server };
if (require.main === module) server.listen(PORT, () => console.log(`game: http://localhost:${PORT}`));
