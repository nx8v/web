// Static server untuk situs NX8V — dijalankan dengan: nx8v server.js
const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT   = Number(process.env.NX8V_PORT) || 7182;
const ROOT   = path.resolve(__dirname);
// NX8V versions that return binary fs reads as UTF-8 strings can corrupt PNGs.
// Keep the original icon bytes in a text-safe sidecar and restore them here.
const ICON_B64 = path.join(ROOT, 'icon.png.b64');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.txt':  'text/plain; charset=utf-8',
  '.md':   'text/plain; charset=utf-8',
};

const server = http.createServer((req, res) => {
  console.log(req.method, req.url);

  const file = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const full = path.resolve(path.join(ROOT, file));

  if (full !== ROOT && !full.startsWith(ROOT + path.sep)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  if (!fs.existsSync(full) || fs.statSync(full).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
    return;
  }

  fs.readFile(full, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
      return;
    }
    if (path.basename(full).toLowerCase() === 'icon.png' && fs.existsSync(ICON_B64)) {
      try { data = Buffer.from(fs.readFileSync(ICON_B64, 'utf8').trim(), 'base64'); }
      catch (e) { /* use the normal response below */ }
    }
    const type = MIME[path.extname(full).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('situs nx8v berjalan di http://localhost:' + PORT);
});
