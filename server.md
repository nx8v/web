# NX8V — Server & Web

Panduan lengkap membangun aplikasi **web/server** dengan NX8V.

> Untuk aplikasi **desktop** (jendela WebView2, tray, dialog), lihat
> **[desktop.md](desktop.md)**. Untuk gambaran umum runtime, lihat
> **[README.md](README.md)**.

Daftar isi:

1. [Alur kerja](#1-alur-kerja)
2. [Membuat proyek](#2-membuat-proyek)
3. [Struktur proyek](#3-struktur-proyek)
4. [HTTP server](#4-http-server)
5. [Router](#5-router)
6. [Static file server](#6-static-file-server)
7. [WebSocket server](#7-websocket-server)
8. [HTTP/HTTPS client + fetch](#8-httphttps-client--fetch)
9. [Modul pendukung](#9-modul-pendukung)
10. [CLI server](#10-cli-server)
11. [Deployment](#11-deployment)
12. [Contoh di repo](#12-contoh-di-repo)
13. [Uji tiga server](#13-uji-tiga-server)

---

## 1. Alur kerja

```
nx8v init            # buat proyek (project.json + server.js + public/)
nx8v dev             # development: simpan HTML memuat ulang browser
nx8v start           # production: jalankan dari project.json
nx8v logs            # lihat nx8v.log
nx8v stop            # hentikan server
nx8v package         # folder distribusi siap kirim
```

---

## 2. Membuat proyek

```powershell
cd D:\proyek-saya
nx8v init
```

```
  name        [proyek-saya]: aplikasi-toko
  description [An NX8V application]: Aplikasi toko sederhana
  port        [3000]: 4000
```

Hasil:

```
D:\proyek-saya\
├── project.json          # "dependencies": {}
├── server.js
├── modules\              # folder modul, masih kosong
└── public\
    ├── index.html
    ├── about.html
    └── assets\
        ├── css\style.css
        ├── js\app.js
        ├── fonts\
        └── images\32x32.png    # ikon merek NX8V
```

Folder `assets` tetap ada. CSS, JS, font, dan gambar tinggal di dalamnya. Di HTML pathnya ditulis pendek: `/css/style.css`, `/js/app.js`, dan `/images/32x32.png`. NX8V mencari berkas itu di `public/` dulu, lalu di `public/assets/`, sebelum `server.js` dijalankan.

Halaman juga memasang `<link rel="icon" href="/images/32x32.png">`. Permintaan otomatis `/favicon.ico` memakai ikon yang sama bila proyek belum punya `favicon.ico` sendiri.

`project.json`:

```json
{
  "name": "aplikasi-toko",
  "version": "1.0.0",
  "description": "Aplikasi toko sederhana",
  "main": "server.js",
  "nx8v": {
    "port": 4000,
    "desktop": {
      "icon": "./images/32x32.png",
      "state": "normal",
      "width": 800,
      "height": 560,
      "minWidth": 640,
      "minHeight": 400,
      "center": true,
      "maximizable": true,
      "resizable": true,
      "titlebar": true,
      "devtools": false,
      "singleInstance": true,
      "productName": "aplikasi-toko",
      "shortcutName": "aplikasi-toko",
      "artifactName": "aplikasi-toko-Setup-${version}.exe"
    }
  },
  "dependencies": {},
  "repository": {
    "type": "git",
    "url": "https://github.com/nx8v/dependencies.git"
  },
  "scripts": {
    "start": "nx8v start",
    "dev": "nx8v dev",
    "stop": "nx8v stop"
  }
}
```

`"icon": "./images/32x32.png"` menunjuk berkas `public/assets/images/32x32.png`. Path panjang seperti `./public/assets/images/32x32.png` tetap berlaku bila berkasnya ada di situ.

Port bisa dioverride tanpa mengubah file: `nx8v start --port=5000`, atau lewat
environment `NX8V_PORT` / `PORT` (dibaca `server.js`).

---

## 3. Struktur proyek

```
proyek/
├── project.json      # metadata, port, desktop, dependencies
├── server.js         # entry point (main)
├── modules/          # modul proyek; nama dan index.js wajib
│   └── cotoh/
│       └── index.js
├── public/
│   ├── index.html
│   ├── about.html
│   └── assets/
│       ├── css/
│       ├── js/
│       ├── fonts/
│       └── images/
└── nx8v.log          # dibuat otomatis saat `nx8v start`
```

NX8V melayani berkas di `public/` sebelum `server.js`. Menambah halaman cukup
dengan menaruh file di folder itu:

| URL | File yang dicari |
|-----|------------------|
| `/` | `public/index.html` |
| `/about` | `public/about.html` lalu `public/about/index.html` |
| `/about/data/u` | `public/about/data/u.html`, `about/data.html`, **`about.html`** |
| `/js/dll.js` | `public/assets/js/dll.js`. Path halaman diawali `/js` |
| `/css/style.css` | `public/assets/css/style.css` |
| `/images/32x32.png` | `public/assets/images/32x32.png` |
| `/favicon.ico` | `public/favicon.ico`, lalu ikon `public/assets/images/32x32.png` |
| `/cotoh` | `modules/cotoh/index.js` |

Bila tidak ada berkas yang cocok, permintaan masuk ke `server.js`. Di situ cukup
rute milik proyek, misalnya `GET /api/hello`. `server.js` hasil `init` tidak
lagi memuat pemetaan folder.

### Modul

Modul proyek ditaruh di `modules/`. Dua hal wajib:

1. Nama di `dependencies` pada `project.json`.
2. Berkas masuk `index.js` di folder yang ditunjuk nama itu.

```json
"dependencies": {
  "cotoh": "1.0.0",
  "photos": "1.0.0"
}
```

Kuncinya nama modul. Nilainya versi. Folder selalu `modules/` ditambah nama itu, jadi `"cotoh": "1.0.0"` berarti `modules/cotoh/index.js`.

| Yang dibuat | Bentuk |
|---|---|
| Nama | kunci `cotoh` |
| Versi | `1.0.0` |
| Folder | `modules/cotoh` |
| Berkas masuk | `modules/cotoh/index.js` |

Di HTML cukup nama itu:

```html
<script type="module" src="cotoh"></script>
```

Browser meminta `/cotoh`. NX8V mengembalikan `modules/cotoh/index.js`. `/cotoh/index.js` adalah berkas yang sama. Nama yang tidak tertulis di `dependencies` tidak dilayani.

`require('./modules/photos')` di `server.js` juga membuka `index.js` folder itu. `photos` untuk server. `cotoh` untuk halaman. `nx8v init` membuat folder `modules/`, `"dependencies": {}`, dan `repository` yang menunjuk ke mega-repo internal NX8V.

### Dependensi

`repository` di `project.json` adalah tempat modul diambil dan diterbitkan. Bawaannya repo internal NX8V. Saat materi dependensi dipublikasikan dari repo milik user, `url` diganti.

```json
"repository": {
  "type": "git",
  "url": "https://github.com/nx8v/dependencies.git"
}
```

Satu versi sama dengan satu GitHub Release. Nama dan versi pada perintah menjadi tag `<nama>-<versi>`. Aset rilis disalin ke `modules/<nama>/`. Berkas masuknya `index.js`. Berkas lain di folder yang sama, misalnya `app.js`, ikut diunduh dan ikut diterbitkan.

Perintah dijalankan di folder proyek:

| Perintah | Fungsi |
|---|---|
| `nx8v i contoh@1.0.2` | pasang. Tag yang dicari: `contoh-1.0.2` |
| `nx8v u contoh@1.0.2` | ganti versi modul yang sudah ada di `dependencies`. Angka versinya yang diganti |
| `nx8v p contohnamalain@1.0.0` | terbitkan isi `modules/contohnamalain/` ke repository |
| `nx8v d contoh` | hapus `contoh` dari `dependencies`, `nx8v.lock`, dan `modules/contoh` |
| `nx8v r contoh` | hapus rilis, tag, dan folder `contoh` dari repository |

**Pasang** menulis tiga tempat:

```json
"dependencies": {
  "contoh": "1.0.2"
}
```

```text
modules/contoh/index.js
```

```json
{
  "dependencies": {
    "contoh": {
      "version": "1.0.2",
      "resolved": "https://github.com/nx8v/dependencies/releases/tag/contoh-1.0.2"
    }
  }
}
```

`resolved` di `nx8v.lock` adalah halaman rilis yang dipakai saat pemasangan. Nama yang tidak ada tag-nya tidak ditulis ke `dependencies` maupun `modules`. Bila tag tidak ketemu, perintah menampilkan daftar rilis yang ada.

**Perbarui** hanya untuk nama yang sudah terpasang. `nx8v u contoh@1.0.2` mengganti berkas di `modules/contoh/`, versi di `dependencies`, dan catatan di `nx8v.lock`. Nama yang belum ada ditolak; pasang lebih dulu dengan `nx8v i`.

**Terbitkan** membaca `modules/contohnamalain/`. Folder itu wajib berisi `index.js`. Setiap berkas di folder itu dilampirkan sebagai aset rilis `contohnamalain-1.0.0`. Perintah ini memakai GitHub CLI dan akun yang sudah masuk:

```text
gh auth login
nx8v p contohnamalain@1.0.0
```

Setelah terbit, `dependencies` dan `nx8v.lock` di proyek itu ikut mencatat versi tersebut. Rilis yang tag-nya sudah ada tidak ditimpa.

**Hapus** mengeluarkan nama dari daftar proyek. `nx8v d contoh` menghapus kunci `contoh` di `project.json` dan `nx8v.lock`, lalu menghapus folder `modules/contoh`.

**Hapus dari repository** dipakai pemilik repo. `nx8v r contoh` menghapus setiap rilis bertag `contoh-<versi>`, tag itu, dan folder `contoh` di cabang utama. Perintah ini memakai GitHub CLI yang sudah masuk, sama seperti `nx8v p`. Daftar di proyek yang sedang dibuka tidak diubah.

---

## 4. HTTP server

```js
const http = require('http');

const server = http.createServer((req, res) => {
  console.log(req.method, req.url);

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: true }));
});

server.listen(3000, () => console.log('http://localhost:3000'));
```

HTTPS memakai modul `https`. Berkas PFX dibaca sebagai `Buffer` (tanpa encoding). Kunci PEM dibaca sebagai teks.

```js
const https = require('https');
const fs = require('fs');

https.createServer({
  pfx: fs.readFileSync('server.pfx'),
  passphrase: 'rahasia'
}, (req, res) => {
  res.end(req.httpVersion);
}).listen(8443);

https.createServer({
  cert: fs.readFileSync('server.crt', 'utf8'),
  key: fs.readFileSync('server.key', 'utf8')
}, (req, res) => {
  res.end(req.httpVersion);
}).listen(8444);
```

Sertifikat PFX berunding TLS 1.2 dan 1.3. Pasangan `cert` dan `key` menerima `BEGIN CERTIFICATE` bersama `BEGIN PRIVATE KEY` (PKCS#8) atau `BEGIN RSA PRIVATE KEY`. Di Windows, PEM berunding TLS 1.2. Di Linux, PEM berunding TLS 1.2 dan 1.3. Kunci bertipe `BEGIN ENCRYPTED PRIVATE KEY` belum didukung; bungkus kunci itu ke dalam PFX. ALPN menawarkan `h2` lalu `http/1.1`. `req.httpVersion` berisi `"2.0"` saat klien memakai HTTP/2, dan `"HTTP/1.1"` saat klien memakai HTTP/1.1. HTTP/2 tanpa TLS (preface `PRI * HTTP/2.0`) juga diterima oleh `http.createServer`. Build Linux menautkan OpenSSL lewat `NX8V_USE_OPENSSL`, untuk klien `https://` dan `https.createServer`. Rilis v0.2.0 memuat server TLS ini. Biner yang sedang dipakai panel belum memuatnya.

**Request (`req`):**

| Properti/Method | Keterangan |
|---|---|
| `req.method` | `GET`, `POST`, … |
| `req.url` | path + query, apa adanya |
| `req.httpVersion` | `"HTTP/1.1"` pada HTTP/1.1, `"2.0"` pada HTTP/2 |
| `req.headers` | objek header (nama asli dari klien) |
| `req.on('data', fn)` | body (bila ada) |
| `req.on('end', fn)` | body selesai |

**Response (`res`):**

| Method | Keterangan |
|---|---|
| `res.writeHead(status[, message][, headers])` | kirim status + header. Tanpa `message`, kalimat status mengikuti kode: `404` menjadi `Not Found` |
| `res.setHeader(name, value)` | set satu header |
| `res.getHeader(name)` | baca header |
| `res.write(chunk)` | tulis body (di-buffer). `chunk` boleh string atau `Buffer` |
| `res.end([chunk][, cb])` | kirim respons, tutup koneksi. Byte `0x00` di dalam PNG ikut terkirim |
| `res.statusCode` | status default 200. Mengubah angka ini juga mengganti kalimat status |

`fs.readFile` dan `fs.readFileSync` tanpa encoding mengembalikan `Buffer`, jadi gambar tidak rusak saat dikirim lewat `res.end`. Encoding `'utf8'` tetap mengembalikan string. `data.toString()` memakai teks UTF-8.

**Event server:** `listening`, `request`, `connection`, `close`, `error`, `websocket`.

Catatan: server selalu membalas `Connection: close` (satu request per koneksi).
Ini disengaja — pipelining belum didukung, dan lebih aman untuk browser.

---

## 5. Router

```js
const app = require('router')();

app.use((req, res) => {
  console.log(req.method, req.url);       // middleware global
});

app.get('/user/:id', (req, res) => {
  res.json({ id: req.params.id });        // param dinamis
});

app.post('/api/login', (req, res) => {
  res.status(201).json({ ok: true, token: 'abc123' });
});

app.get('/lama', (req, res) => res.redirect('/baru'));

app.notFound((req, res) => {
  res.status(404).json({ error: 'tidak ada rute', path: req.url });
});

app.listen(5400, () => console.log('http://localhost:5400'));
```

| API | Keterangan |
|---|---|
| `app.get/post/put/delete/patch/all(path, handler)` | daftar rute |
| `app.use([path,] fn)` | middleware (global atau ber-scope) |
| `app.notFound(fn)` | handler 404 kustom |
| `app.listen(port[, cb])` | jalankan server, mengembalikan `http.Server` |
| `req.params` | hasil parse param rute |
| `res.status(code)` | set status (chainable) |
| `res.json(obj)` | kirim JSON + header otomatis |
| `res.send(str\|Buffer)` | kirim teks/biner |
| `res.redirect(url[, code])` | redirect (default 302) |

Pola path yang didukung:

```
/user/:id          → req.params.id
/file/:name?       → opsional
/static/*          → req.params[0] berisi sisa path
```

Middleware bisa menghentikan rantai dengan `return false`.

---

## 6. Static file server

Versi produksi dari static handler (ETag, Range, HEAD, cache):

```js
const http  = require('http');
const serve = require('static');

const handler = serve('public', { maxAge: 3600, index: 'index.html' });

http.createServer((req, res) => handler(req, res)).listen(3000);
// atau: app.use(handler)  (di router)
```

| Opsi | Default | Keterangan |
|---|---|---|
| `maxAge` | `0` | detik untuk `Cache-Control: public, max-age=N` |
| `index` | `index.html` | file untuk direktori |
| `etag` | `true` | kirim `ETag` + dukung `If-None-Match` (304) |
| `ranges` | `true` | dukung `Range` (206 Partial Content) |

Perilaku:

- `GET`/`HEAD` saja; method lain → **405** + header `Allow`
- `If-None-Match` / `If-Modified-Since` cocok → **304** (tanpa body)
- `Range: bytes=0-99` → **206** + `Content-Range`
- Range tidak valid → **416**
- `..` pada path (termasuk `%2e%2e`) → **403**
- File tidak ada → **404**

---

## 7. WebSocket server

```js
const http = require('http');
const server = http.createServer((req, res) => res.end('ws server'));

server.on('websocket', (ws) => {
  console.log('client tersambung');

  ws.send('selamat datang');

  ws.on('message', (msg) => {
    console.log('terima:', msg);
    ws.send('echo: ' + msg);
  });

  ws.on('close', () => console.log('client putus'));
});

server.listen(5300);
```

Upgrade ditangani otomatis: klien yang mengirim header `Upgrade: websocket`
ke port yang sama akan diubah menjadi koneksi WebSocket (RFC 6455).

| API | Keterangan |
|---|---|
| `server.on('websocket', fn)` | koneksi WebSocket baru |
| `ws.send(text \| Buffer)` | kirim frame |
| `ws.on('message', fn)` | pesan masuk (string) |
| `ws.on('close', fn)` | koneksi ditutup |
| `ws.close()` | tutup dari server |

Ping/pong dijawab otomatis. Klien (browser) bisa memakai API WebSocket biasa:

```js
const ws = new WebSocket('ws://localhost:5300/');
ws.onmessage = (e) => console.log(e.data);
```

---

## 8. HTTP/HTTPS client + fetch

### `http.get` / `http.request`

```js
const http = require('http');

http.get('http://127.0.0.1:3000/api/hello', (res) => {
  console.log('status:', res.statusCode, res.statusMessage);
  let body = '';
  res.on('data', (c) => { body += c; });
  res.on('end', () => console.log(body));
});
```

```js
const https = require('https');           // sama, untuk https://

const req = https.request({
  hostname: 'jsonplaceholder.typicode.com',
  path: '/photos?_limit=5',
  method: 'GET',
  headers: { 'Accept': 'application/json' },
}, (res) => {
  let body = '';
  res.on('data', (c) => { body += c; });
  res.on('end', () => console.log(JSON.parse(body).length, 'item'));
});
```

### `fetch` (global)

```js
fetch('https://jsonplaceholder.typicode.com/photos?_limit=5')
  .then((r) => {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  })
  .then((photos) => console.log(photos.length, 'foto'))
  .catch((e) => console.error(e.message));
```

| Objek respons | Keterangan |
|---|---|
| `res.ok` | `true` bila status 200–299 |
| `res.status` | kode status |
| `res.statusText` | teks status |
| `res.headers` | objek header (lowercase) |
| `res.text()` | Promise<string> |
| `res.json()` | Promise<object> |

**Catatan HTTPS:** di Windows memakai WinHTTP (TLS 1.2/1.3, sertifikat dari
cert store Windows, redirect dan de-chunk otomatis). Di Linux aktif bila
dikompilasi dengan `-DNX8V_USE_OPENSSL`.

Chunked transfer (`Transfer-Encoding: chunked`) ditangani otomatis pada
respons HTTP biasa.

---

## 9. Modul pendukung

Modul yang paling sering dipakai server:

| Modul | Kegunaan |
|---|---|
| `fs` | baca/tulis file. `readFile` tanpa encoding mengembalikan `Buffer` |
| `path` | `join`, `resolve`, `dirname`, `basename`, `extname`, `parse`, `format` |
| `querystring` | `parse`, `stringify`, `escape`, `unescape`, `URLSearchParams` |
| `url` | parse URL (`href`, `pathname`, `search`, `host`, …) |
| `zlib` | `gzipSync` / `gunzipSync` / `deflateSync` / `inflateSync` |
| `crypto` | `createHash` (md5/sha1/sha256), `randomBytes`, `randomUUID` |
| `Buffer` | data biner (index access, `toString('hex'/'base64')`, `slice`, `concat`) |
| `stream` | `Readable`/`Writable`/`PassThrough` + `pipe` |
| `events` | `EventEmitter` |
| `net` | TCP mentah (`createServer`, `connect`) |
| `dns` | `lookup`, `resolve`, `resolve4` |
| `child_process` | `exec`, `spawn` |
| `os` | `platform`, `cpus`, `networkInterfaces`, `homedir`, … |

Contoh `querystring`:

```js
const qs = require('querystring');
qs.parse('a=1&b=dua&c=x%20y');       // { a: '1', b: 'dua', c: 'x y' }
qs.stringify({ x: 1, y: 'a b' });    // 'x=1&y=a+b'
```

---

## 10. CLI server

| Perintah | Fungsi |
|---|---|
| `nx8v init` | wizard pembuatan proyek |
| `nx8v i <nama>@<versi>` | pasang modul dari `repository` di `project.json` |
| `nx8v u <nama>@<versi>` | ganti versi modul yang sudah terpasang |
| `nx8v p <nama>@<versi>` | terbitkan `modules/<nama>` ke repository |
| `nx8v d <nama>` | hapus modul dari `dependencies` |
| `nx8v r <nama>` | hapus rilis, tag, dan folder modul dari repository |
| `nx8v dev [--port=N]` | development: simpan HTML memuat ulang browser; simpan JS me-restart server |
| `nx8v start [--port=N]` | jalankan dari `project.json` |
| `nx8v stop [--port=N]` | hentikan server proyek |
| `nx8v list` | daftar server berjalan (PID, port, proyek, direktori) |
| `nx8v logs [--lines=N]` | ekor `nx8v.log` proyek ini |
| `nx8v test [path]` | jalankan `*.test.js` |
| `nx8v package` | folder distribusi (`dist/<nama>/`) |

### `nx8v dev`

Memantau folder proyek, termasuk file di root seperti `server.js`.
Dilewati: `node_modules`, `.git`, `build`, `dist`, `.nx8v`.

Simpan `.html`, `.css`, atau `.svg` memuat ulang halaman yang sedang terbuka.
Server tetap jalan:

```
[watch] change detected: D:\proyek\public\index.html
[dev] browser reload
```

Simpan `.js`, `.mjs`, atau `.json` me-restart server, lalu halaman yang sama
ikut memuat ulang setelah server hidup lagi:

```
[watch] change detected: D:\proyek\server.js
[dev] stopping server for restart...
[dev] restarting D:\proyek\server.js
[dev] server started (pid 1250)
```

Setelah `nx8v` diperbarui, refresh halaman sekali supaya skrip pemantau masuk.
Simpan berikutnya memuat ulang sendiri. Bila server crash karena error sintaks,
supervisor tetap hidup — perbaiki file dan server otomatis menyala lagi.

### Komponen HTML (`partial`)

Tag apa pun bisa memuat file HTML lain. nx8v menggabungkannya saat halaman
dikirim, tanpa JavaScript di browser:

```html
<header partial="./header.html"></header>
```

`./header.html` dibaca dari folder yang sama dengan halaman (`public/`).
Isi file masuk ke dalam tag, dan atribut `partial` dihapus. Simpan file
komponen saat `nx8v dev` berjalan: halaman yang terbuka memuat ulang sendiri.

Path di luar folder `public` ditolak.

### `nx8v list`

```
PID      PORT    PROJECT          DIR
1360     4000    Aplikasi demo    D:\NX8V\example
13204    5202    toko-demo        D:\NX8V\build\demotest
```

### `nx8v test`

```js
test('penjumlahan', () => {
  assert.equal(1 + 1, 2);
  assert.deepEqual([1, 2], [1, 2]);
  assert.throws(() => { throw new Error('x'); });
});
```

Output `✓`/`✗` per test + ringkasan; exit code 1 bila ada kegagalan.
Assertion: `equal`, `strictEqual`, `notEqual`, `deepEqual`, `deepStrictEqual`,
`ok`, `truthy`, `notOk`, `throws`, `doesNotThrow`.

---

## 11. Deployment

### Windows

```powershell
# jalankan di background lalu cek
nx8v start
nx8v list
curl http://127.0.0.1:4000/

# hentikan
nx8v stop
```

### Linux (systemd)

```sh
sudo ./install.sh --service /path/to/project
```

Menghasilkan unit dari `packaging/nx8v.service`:

```ini
[Unit]
Description=NX8V application
After=network.target

[Service]
Type=simple
WorkingDirectory=@PROJECT@
ExecStart=/usr/bin/env nx8v start
Restart=on-failure
RestartSec=2
```

### Distribusi

```powershell
nx8v package                # dist/<nama>/ berisi exe + proyek + start.cmd
nx8v package --name=toko --out=release
```

Folder hasil bisa di-zip dan dikirim; penerima cukup menjalankan `start.cmd`.

---

## 12. Contoh di repo

| File | Isi |
|---|---|
| `samples/httpserver.js` | HTTP server + JSON endpoint |
| `samples/router.js` | router: param, middleware, redirect, notFound |
| `samples/static_server.js` | static handler (ETag/Range) |
| `samples/websocket.js` | WebSocket server (echo) |
| `samples/wsclient.js` | WebSocket client |
| `samples/fs.js` | operasi file |
| `samples/timers.js` | setTimeout/setInterval |
| `samples/basic.test.js` | contoh test |
| `example/` | proyek lengkap: galeri foto dari API (fetch HTTPS) |

---

## 13. Uji tiga server

Uji 23 Oktober 2026 di tiga server Docker pada WSL Ubuntu-22.04.
Susunan server ada di `D:\server\README.md`. NX8V berjalan sebagai proses
sendiri. aaPanel, CyberPanel, dan Apache hanya meneruskan jalur `/nx8v/`.
Situs yang sudah ada tetap di akarnya.

Server kedua adalah **CyberPanel penuh** versi 1.9, container `cyberpanel`,
image `cyberpanel-ssh:latest`, CentOS 7.6. Narasinya ada di
`D:\server\CyberPanel\README.md`. Panel itu memakai stack hosting umum:
lscpd (panel, port 8090), OpenLiteSpeed (web :80/:443 dan admin :7080),
MariaDB, Postfix/Dovecot, PowerDNS, dan Pure-FTPd. OpenLiteSpeed di sini
adalah web server di dalam CyberPanel. Layanan di container ini dinyalakan
entrypoint `docker/cyberpanel/entrypoint.sh`, karena systemd di dalam
container WSL tidak lengkap.

Akses dari Windows memakai IP WSL. Di mesin uji, `localhost` tidak meneruskan
port container. IP saat uji: `192.168.144.198`. Cek ulang dengan
`wsl -d Ubuntu-22.04 -u root hostname -I`.

| Server | URL | Halaman | `/nx8v/api/where` |
|---|---|---|---|
| aaPanel | `http://192.168.144.198:8080/nx8v/` | HTTP 200 | `{"runtime":"nx8v","host":"437e50fe88dd"}` |
| CyberPanel | `http://192.168.144.198:8082/nx8v/` | HTTP 200 | `{"runtime":"nx8v","host":"DANTRIK"}` |
| Apache | `http://192.168.144.198:8083/nx8v/` | HTTP 200 | `{"runtime":"nx8v","host":"acaf18fee8e1"}` |

Halaman menampilkan judul **NX8V Server & web**, lalu mengisi nama host dari
`fetch('api/where')`. Situs NxPHP di CyberPanel (`Host: nxd-cyber.local`
pada port 8082) tetap HTTP 200 setelah jalur `/nx8v/` dipasang.

Proyek uji: `D:\server\nx8v-app` (`project.json`, `server.js`,
`public/index.html`). Port dengar `6002`. Binary Linux yang dipakai
`build/linux/nx8v` (glibc 2.34).

| Server | Tempat proses | Proxy |
|---|---|---|
| aaPanel, container `aapanel` (glibc 2.35) | `/opt/nx8v`, `127.0.0.1:6002` | `D:\server\docker\aapanel\nx8v-proxy.conf` |
| Apache, container `apache` (glibc 2.41) | `/opt/nx8v`, `127.0.0.1:6002` | `D:\server\docker\apache\nx8v-proxy.conf` |
| CyberPanel 1.9, container `cyberpanel`, CentOS 7.6 (glibc 2.17) | proses di WSL, gateway `172.18.0.1:6002` | context `/nx8v/` pada vhost `nxlocal`, `D:\server\nx8v-app\ols-nx8v.snippet` |

CentOS 7.6 di CyberPanel memakai glibc 2.17, jadi binary NX8V (glibc 2.34)
dijalankan di WSL. OpenLiteSpeed di dalam CyberPanel meneruskan `/nx8v/`
ke gateway Docker `172.18.0.1:6002`. aaPanel dan Apache menjalankan binary
yang sama di dalam masing-masing container.

Menyalakan ulang setelah WSL atau container hidup kembali:

```bash
wsl -d Ubuntu-22.04 -u root bash /mnt/d/server/nx8v-app/install-servers.sh
wsl -d Ubuntu-22.04 -u root bash /mnt/d/server/nx8v-app/enable-proxy.sh
```

---

## Troubleshooting

| Gejala | Penyebab & solusi |
|---|---|
| `ERR_UNSAFE_PORT` di browser | Port diblokir Chrome (mis. 6000). Pakai 3000/4000/8080. |
| Browser reload terus | Sudah diperbaiki; pastikan exe terbaru. |
| `Cannot find module 'X'` | Modul bukan built-in → cek path relatif, atau daftar modul di §9. |
| `EADDRINUSE` / `address already in use` | Port dipakai proses lain → `nx8v list`, lalu `nx8v stop --port=N`. |
| Gambar rusak atau hanya beberapa byte | `res.end` harus menerima `Buffer` dari `readFile`. Pakai exe terbaru. |
| `404` pada `/favicon.ico` | Letakkan `public/favicon.ico`, atau biarkan server memakai `public/assets/images/32x32.png`. |
| `invalid URL` pada fetch | Skema harus `http://` atau `https://`. |
| Halaman tidak berubah | `Cache-Control: no-store` + hard refresh (Ctrl+Shift+R). |
