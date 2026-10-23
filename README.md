# NX8V — Runtime JavaScript berbasis V8

NX8V adalah runtime JavaScript kustom (ala Node.js mini) yang dibangun dengan
menanamkan **Google V8** sebagai mesin JS dan **libuv** sebagai event loop,
ditulis dalam **C++17** menggunakan V8 Embedding API.

```
script JS Anda ──▶ nx8v.exe ──▶ V8 (eksekusi JS)  +  libuv (event loop / I/O)
```

## Dua jalur penggunaan

| Jalur | Dokumen | Isi |
|---|---|---|
| **Server / web** | **[server.md](server.md)** | HTTP server, router, static file, WebSocket, client HTTP/HTTPS, CLI server, deployment |
| **Desktop** | **[desktop.md](desktop.md)** | `nx8v window`, jendela WebView2, bridge `window.nx8v`, dialog, tray, notifikasi, packaging |

Dokumen ini menjelaskan **bagian bersama**: runtime inti, modul built-in,
build, struktur kode, dan roadmap.

---

## Fitur inti

- **Eksekusi script & REPL interaktif** (`nx8v script.js` atau `nx8v` tanpa argumen)
- **Event loop libuv** dengan microtask pump — `Promise` bekerja secara native
- **`require()` CommonJS** dengan cache modul, `__filename` / `__dirname`
- **ES Modules** — `import`/`export`, file `.mjs`
- **Global:**
  - `console` — `log`, `error`, `warn`, `dir`
  - `process` — `argv`, `env`, `exit()`, `exitCode`, `cwd()`, `nextTick()`, `version`, `platform`
  - `setTimeout` / `setInterval` / `clearTimeout` / `clearInterval`
  - `fetch` — Promise-based HTTP(S) client
  - `Buffer` — Uint8Array-backed, Node-style
  - `test` / `it` / `describe` / `assert` — test runner bawaan

## Modul built-in (`require()`)

| Modul | Isi |
|-------|-----|
| `fs` | `readFileSync`/`readFile`, `writeFileSync`/`writeFile`, `existsSync`, `mkdirSync`, `readdirSync`, `statSync`, `unlinkSync`, `rename`, `copyFile`, `rm`, `appendFile`, `watch`, `createReadStream`, `createWriteStream` |
| `path` | `join`, `resolve`, `normalize`, `dirname`, `basename`, `extname`, `isAbsolute`, `relative`, `parse`, `format`, `sep`, `delimiter` |
| `os` | `platform`, `arch`, `type`, `release`, `version`, `hostname`, `homedir`, `tmpdir`, `cpus`, `freemem`, `totalmem`, `uptime`, `endianness`, `networkInterfaces` |
| `url` | `href`, `protocol`, `host`, `hostname`, `port`, `pathname`, `search`, `hash`, `auth`, `origin`, `path`, `username`, `password` |
| `querystring` | `parse`, `stringify`, `escape`, `unescape`, `URLSearchParams` |
| `events` | `EventEmitter` — `on`, `once`, `off`/`removeListener`, `emit`, `removeAllListeners`, `listenerCount`, `listeners`, `eventNames` |
| `http` | server (`createServer`, `listen`) + client (`get`, `request`) + WebSocket server |
| `https` | sama dengan `http`, untuk URL `https://` (WinHTTP di Windows) |
| `router` | `app.get/post/put/delete/patch/all`, `app.use`, `app.notFound`, `app.listen`, `res.status/json/send/redirect` |
| `static` | `serve(root[, opts])` — ETag/304, Range/206, HEAD, Cache-Control, anti path traversal |
| `stream` | `Readable`/`Writable`/`Duplex`/`PassThrough`: `push`, `write`, `end`, `pipe` |
| `ws` | client WebSocket (`connect`) + server (`server.on('websocket')`) |
| `crypto` | `createHash('md5'/'sha1'/'sha256')`, `randomBytes`, `randomUUID`, `getHashes` |
| `zlib` | `gzipSync`, `gunzipSync`, `deflateSync`, `inflateSync` |
| `net` | `createServer`, `connect` (TCP mentah) |
| `dns` | `lookup`, `resolve`, `resolve4` |
| `child_process` | `exec`, `spawn` |

Detail pemakaian tiap modul server-side ada di **[server.md](server.md)**.

---

## Perintah CLI

| Perintah | Fungsi |
|----------|--------|
| `nx8v` | REPL interaktif |
| `nx8v <script.js>` | eksekusi file script |
| `nx8v run <script.js>` | alias eksplisit eksekusi script |
| `nx8v init` | wizard pembuatan proyek |
| `nx8v i <nama>@<versi>` | pasang modul dari `repository` → [server.md](server.md) |
| `nx8v u <nama>@<versi>` | ganti versi modul yang sudah terpasang |
| `nx8v p <nama>@<versi>` | terbitkan `modules/<nama>` ke repository |
| `nx8v d <nama>` | hapus modul dari `dependencies` |
| `nx8v r <nama>` | hapus rilis, tag, dan folder modul dari repository |
| `nx8v start [--port=N]` | jalankan proyek dari `project.json` |
| `nx8v dev [--port=N]` | development: simpan HTML memuat ulang browser; simpan JS me-restart server |
| `nx8v stop [--port=N]` | hentikan server proyek |
| `nx8v list` | daftar server nx8v yang berjalan |
| `nx8v logs [--lines=N]` | ekor `nx8v.log` proyek ini |
| `nx8v test [path]` | jalankan test (`*.test.js`) |
| `nx8v window` | buka jendela desktop WebView2 → [desktop.md](desktop.md) |
| `nx8v package` | buat folder distribusi (`dist/<nama>/`) |
| `nx8v --version` / `--help` | versi / bantuan |

---

## Menjalankan

```powershell
# script
& "D:\NX8V\build\Release\nx8v.exe" D:\NX8V\samples\hello.js

# REPL interaktif
& "D:\NX8V\build\Release\nx8v.exe"

# wizard pembuatan proyek
& "D:\NX8V\build\Release\nx8v.exe" init
```

## Instalasi global

```powershell
# Windows
powershell -ExecutionPolicy Bypass -File D:\NX8V\install.ps1
```

Menyalin `nx8v.exe` ke `%LOCALAPPDATA%\nx8v\bin` + menambah ke PATH user.
**Buka terminal baru**, lalu `nx8v --version`, `nx8v init`, `nx8v dev`, dst.

Mencabut: `powershell -ExecutionPolicy Bypass -File D:\NX8V\install.ps1 -Remove`

```sh
# Linux/macOS
./install.sh                    # ~/.local/bin
sudo ./install.sh --service DIR # + unit systemd
```

---

## Test (`nx8v test`)

```powershell
nx8v test              # semua *.test.js di folder ini
nx8v test tests/       # folder tertentu
nx8v test a.test.js    # file tertentu
```

```js
test('penjumlahan', () => {
  assert.equal(1 + 1, 2);
  assert.deepEqual([1, 2], [1, 2]);
  assert.throws(() => { throw new Error('x'); });
});
```

Assertion: `equal`, `strictEqual`, `notEqual`, `deepEqual`, `deepStrictEqual`,
`ok`, `truthy`, `notOk`, `throws`, `doesNotThrow`.

---

## Membangun

Lihat **[BUILD.md](BUILD.md)** — panduan lengkap membangun V8 monolith dari
source di Windows/MSVC (depot_tools, patch SDK, args.gn, target GN) plus
build libuv + CMake.

Ringkasan:

1. Build `v8_monolith.lib` dari checkout V8 (target GN di dalam tree V8)
2. Build libuv statis via CMake FetchContent
3. Build `nx8v.exe` (GN di dalam tree V8, lalu salin ke `build\Release\`)

> **Penting:** selalu pakai `third_party\ninja\ninja.exe` bawaan V8. Mencampur
> versi ninja (mis. WinGet 1.13 vs bundled 1.12) membuat `.ninja_log` ditolak
> dan **seluruh V8 dibangun ulang dari nol**. Jangan pernah `Stop-Process ninja`
> di tengah build.

Rebuild cepat setelah mengubah source NX8V (hanya 1 TU, ~90 detik):

```powershell
$env:DEPOT_TOOLS_WIN_TOOLCHAIN = "0"
$env:vs2022_install = "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools"

Remove-Item C:\v8_workspace\v8\nx8v\src -Recurse -Force -EA SilentlyContinue
Copy-Item D:\NX8V\src C:\v8_workspace\v8\nx8v\src -Recurse -Force

cd C:\v8_workspace\v8
.\third_party\ninja\ninja.exe -C out\x64.release nx8v
Copy-Item out\x64.release\nx8v.exe D:\NX8V\build\Release\ -Force
Copy-Item out\x64.release\nx8v.exe "$env:LOCALAPPDATA\nx8v\bin\nx8v.exe" -Force
```

---

## Struktur proyek

```
D:\NX8V\
├── README.md               # dokumen ini (runtime + build + roadmap)
├── server.md               # materi server/web
├── desktop.md              # materi desktop (WebView2)
├── BUILD.md                # panduan build lengkap
├── src\                    # source runtime (source of truth)
│   ├── main.cc             # entry point: CLI, init V8 + libuv
│   ├── runtime.h           # state global runtime (isolate, loop, timers, cache)
│   ├── utils.h             # helper (ReadFile, ExecuteScript, TryCatch report)
│   └── bindings\           # modul native (header-only)
│       ├── console.h       # console.log/error/warn/dir
│       ├── process.h       # process.argv/env/exit/version/platform/cwd/nextTick
│       ├── timers.h        # setTimeout/setInterval/clear* (libuv)
│       ├── loop.h          # event loop + microtask pump
│       ├── fs.h            # fs sync + async + stream + watch
│       ├── module.h        # require() CommonJS + built-in registry
│       ├── repl.h          # REPL interaktif
│       ├── manifest.h      # pembaca project.json
│       ├── events.h        # EventEmitter ala Node.js
│       ├── url.h           # modul URL
│       ├── path.h          # modul path lengkap
│       ├── buffer.h        # Buffer (Uint8Array-backed)
│       ├── crypto.h        # md5/sha1/sha256, randomBytes, randomUUID
│       ├── compress.h      # modul zlib (gzip/deflate)
│       ├── querystring.h   # modul querystring + URLSearchParams
│       ├── net.h           # modul net (TCP client/server)
│       ├── dns.h           # modul dns (lookup/resolve)
│       ├── child_process.h # modul child_process (exec/spawn)
│       ├── streams.h       # Readable/Writable/PassThrough + pipe
│       ├── esm.h           # transformasi import/export -> CommonJS
│       ├── test.h          # test runner (test/describe/assert)
│       │
│       ├── ── SERVER ──────────────────────────────────────────
│       ├── http.h          # HTTP server + client + fetch + WebSocket server
│       ├── tls.h           # HTTPS client (WinHTTP / OpenSSL)
│       ├── ws.h            # WebSocket client (RFC 6455)
│       ├── router.h        # Router (params, middleware)
│       ├── static.h        # static file server (ETag/Range/304)
│       ├── init.h          # `nx8v init` + `nx8v start` + `nx8v stop`
│       ├── dev.h           # `nx8v dev` supervisor + watcher
│       ├── list.h          # `nx8v list` (server berjalan)
│       ├── logs.h          # `nx8v logs` (ekor nx8v.log)
│       │
│       ├── ── DESKTOP ─────────────────────────────────────────
│       ├── window.h        # jendela WebView2 + dialog + tray + multi-window
│       ├── package.h       # `nx8v package` (folder distribusi)
│       │
│       └── os.h            # modul os
├── samples\                # contoh script JS
├── example\                # proyek contoh (galeri foto + bridge + tray)
├── packaging\nx8v.service  # unit systemd (Linux)
├── deps\webview2\          # SDK WebView2 (include + lib) — desktop saja
├── build\Release\nx8v.exe  # hasil build (~34 MB)
├── CMakeLists.txt          # build CMake (libuv via FetchContent)
├── install.ps1             # instalasi global (Windows)
└── install.sh              # instalasi global (Linux/macOS) + --service
```

---

## Perubahan

- `nx8v dev` memuat ulang browser saat `.html`, `.css`, atau `.svg` disimpan. Server tetap jalan.
- Komponen HTML: `<header partial="./header.html"></header>` digabung oleh nx8v saat halaman dikirim.
- Simpan `.js`, `.mjs`, atau `.json` me-restart server, lalu browser ikut memuat ulang.
- Folder root proyek ikut dipantau, termasuk `server.js`.
- `nx8v window` membuka halaman setelah server `listen`, jadi jendela langsung menampilkan aplikasi.
- Tombol X pada jendela mengembalikan prompt terminal.
- Ctrl+C menutup jendela tanpa pesan ERROR dari WebView.
- `<nx8v-terminal>` menempelkan shell ConPTY di halaman. Lebar 100%, tinggi lewat atribut `height`. Ctrl+C menyalin bila ada pilihan, selain itu tombol itu milik program. Ctrl+V menempelkan papan klip.
- Binary Linux sudah dibangun dan diuji di WSL.

## Roadmap

### Selesai — runtime

- [x] Runtime inti: V8 init, eksekusi script, REPL, teardown bersih
- [x] Event loop libuv + microtask pump (Promise)
- [x] `require()` CommonJS + cache + `__filename`/`__dirname`
- [x] ES Modules (`import`/`export`, `.mjs`)
- [x] `console`, `process`, `timers`, `Buffer`, `fetch`
- [x] `fs`, `path`, `os`, `url`, `querystring`, `events`
- [x] `stream` (Readable/Writable/Duplex/PassThrough + pipe)
- [x] `crypto` (md5/sha1/sha256, randomBytes, randomUUID)
- [x] `zlib`, `net`, `dns`, `child_process`

### Selesai — server ([server.md](server.md))

- [x] HTTP server (`createServer`, `listen`, `close`)
- [x] Router (param, middleware, notFound, `res.json/send/redirect`)
- [x] Static server (ETag/304, Range/206, HEAD, Cache-Control, anti traversal)
- [x] WebSocket server + client (RFC 6455)
- [x] HTTP client (`http.get`, `http.request`) + decoder chunked
- [x] HTTPS client (WinHTTP: TLS 1.2/1.3 + cert store Windows)
- [x] `nx8v init`, `nx8v start`, `nx8v dev`, `nx8v stop`, `nx8v list`, `nx8v logs`
- [x] `nx8v i` / `u` / `p` / `d` / `r` — pasang, ganti versi, terbitkan, hapus dari proyek, dan hapus dari repository
- [x] `nx8v dev`: simpan `.html`/`.css`/`.svg` memuat ulang browser; simpan `.js`/`.json` me-restart server lalu halaman ikut memuat ulang
- [x] `nx8v test` (test runner bawaan)
- [x] Smart file routing (`/about/data/u` → `about.html`)
- [x] Peringatan port unsafe Chromium (mis. 6000 → ERR_UNSAFE_PORT)
- [x] Perbaikan: duplikat request, RST saat close, keep-alive setengah jadi
- [x] Static server mengirim `Content-Encoding: gzip` bila klien meminta `Accept-Encoding: gzip`
- [x] Binary Linux diuji di WSL; rilis `v0.1.0` memuat `nx8v-linux-x64.tar.gz`

### Selesai — desktop ([desktop.md](desktop.md))

- [x] `nx8v window` — jendela WebView2
- [x] Bridge `window.nx8v` (`setTitle`, `setSize`, `minimize`, `maximize`, `close`, `openDevTools`)
- [x] Dialog native (`openFile`, `saveFile`, `openFolder`)
- [x] Tray icon + menu konteks + `onMenu`
- [x] Notifikasi (`nx8v.notify`)
- [x] Multi-window (`nx8v.window.create`)
- [x] `nx8v package` — folder distribusi
- [x] Perbaikan: message loop pump (tidak freeze), arah pesan host→halaman
- [x] Tutup jendela lewat X mengembalikan prompt terminal
- [x] Halaman terbuka setelah `listen`, tanpa `ERR_CONNECTION_REFUSED` di awal
- [x] Ctrl+C di terminal menutup jendela tanpa pesan ERROR WebView
- [x] `<nx8v-terminal>` — shell ConPTY di halaman HTML (Windows). Lihat [desktop.md](desktop.md)
- [x] `nx8v window` memuat ulang halaman saat HTML/CSS/SVG disimpan; JS membuka ulang jendela
- [x] Opsi jendela: posisi, ukuran, `center`, `frameless`, `resizable`, satu jendela per proyek
- [x] Dialog pesan `nx8v.dialog.alert` dan `nx8v.dialog.confirm`

### Belum

- [ ] Build macOS
- [ ] Jendela Linux via GTK/WebKitGTK (WebView2 hanya Windows)
- [ ] HTTP/2 dan TLS pada server. Yang ada sekarang HTTP biasa, dan TLS hanya pada klien HTTPS.
