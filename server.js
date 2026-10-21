// Static server untuk situs NX8V — dijalankan dengan: nx8v server.js
const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT   = Number(process.env.NX8V_PORT) || 7182;
const ROOT   = path.resolve(__dirname);

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
    const type = MIME[path.extname(full).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('situs nx8v berjalan di http://localhost:' + PORT);
});
