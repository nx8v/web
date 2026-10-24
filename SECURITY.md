# SECURITY — Catatan Keamanan NX8V (referensi internal)

> Dokumen bacaan: model ancaman, pemetaan kerentanan ekosistem, dan pengerasan
> terencana. **Tidak dimasukkan ke git** — sifatnya internal.

## 1. Permukaan serang (apa yang terbuka ke luar)

| Permukaan | Berkas | Catatan |
|---|---|---|
| HTTP server & client | `http.h` | parser/keep-alive/chunked ditulis sendiri |
| HTTPS client | `tls.h` | WinHTTP (Windows) — TLS & validasi sertifikat diserahkan ke Windows; OpenSSL hanya via `-DNX8V_USE_OPENSSL` (Linux) |
| WebSocket client/server | `ws.h`, `http.h` | RFC 6455 implementasi sendiri (server) + WinHttpWebSocket (client) |
| Static server | `static.h` | ETag/Range/HEAD — anti path traversal sudah ada |
| Bridge jendela | `window.h` | `postMessage` halaman↔host; `desktop.devtools` bisa dimatikan produksi |
| Terminal di halaman | `desktop.md` §Terminal | ConPTY — input keyboard halaman masuk ke shell |
| CLI | `init.h`, `dev.h`, `list.h`, `logs.h` | `nx8v i/u/p/d/r` menyentuh GitHub (dibaca dari gh CLI) |

## 2. Lapisan bersama yang wajib dantau

- **V8** — CVE-nya mengalir kemari (contoh: hash seed / HashDoS, 2026). Respons:
  build ulang tinju (increment ~90 detik) segera setelah advisory.
- **libuv** — sama; `uv_getaddrinfo` dipakai `dns`.
- **zlib** — `compress.h` (gzip/deflate) — pantau advisory zlib.
- **OpenSSL** — hanya build Linux (`NX8V_USE_OPENSSL`).
- **ca-cert Linux** — build Linux harus ikut pembaruan trust store; di Windows
  validasi sertifikat via WinHTTP + Windows Update (otomatis).

## 3. Pemetaan batch CVE Node.js 21 Okt 2026 (10 CVE)

| CVE kelas | Permukaan di nx8v | Status |
|---|---|---|
| c-ares — dns.resolve NUL (high) | ❌ — `dns.h` pakai `uv_getaddrinfo` | tidak berlaku |
| TLS hostname bypass (fullwidth/loose-IP, high) | Windows: delegasi ke WinHTTP | tidak berlaku (Win); cek saat build Linux |
| Brotli OOB-write RCE (high) | ❌ — zlib module tanpa Brotli | tidak berlaku |
| Undici / SQLite / zipfile | ❌ — fetch ditulis sendiri; tanpa modul itu | tidak berlaku |
| Keep-alive pra-request (medium) | kelas serupa ada di `http.h` sendiri | 🔶 jaga: selalu `Connection: close` + fuzzing |
| APA entropi `randomUUID` di snapshot (medium) | ❌ tidak ada snapshot — `crypto.h` pakai `std::random_device` per panggilan | tidak berlaku (lihat §4-i) |
| Permission Model ×2 (rendah) | ❌ belum ada permission model | tidak berlaku — 🔶 trade-off: proteksinya juga belum ada |
| ca-cert (eMudhra, medium) | Windows tidak terdampak; Linux ikut OpenSSL | 🔶 cek pada build Linux |

## 4. Pengerasan terencana (urut prioritas)

1. **Fuzzing `http.h` / `ws.h`** — ✅ berlaku sejak v0.2.2: perintah
   `nx8v --fuzz` (korpus + 20.000 mutasi, benih `--fuzz=1:20000`). Jawaban
   untuk kelas "CVE RCE tanpa autentikasi": parser C++ milik sendiri.
2. **`crypto.h`** — ✅ berlaku sejak v0.2.2: `randomBytes`/`randomUUID` kini
   lewat `BCryptGenRandom` (Windows) dan `getrandom` (Linux).
3. **Rilis** — ✅ berlaku sejak `v0.2.2`: aset `SHA256SUMS` dilampirkan dan
   `install.ps1` memverifikasi hash sebelum memasang.
4. **Linux** — audit versi OpenSSL terbundel + pembaruan ca-cert path sebelum
   pemasangan dipublikasikan luas.
5. **Terminal bridge** — uji batas pesan halaman↔host; halaman tak boleh bisa
   meminta operasi di luar set (setTitle/setSize/...) tanpa hardening.
6. **Batas HTTPS client** — `req.httpVersion` berhenti di HTTP/2 via ALPN;
   pantau spec upgrade berikutnya.

## 5. Disklaimer

- Batch CVE-2026-10-21 Node.js **tidak menular** langsung ke nx8v karena
  lapisan yang bermasalahnya (c-ares/Brotli/Undici/SQLite/permission/ca-cert)
  tidak diimplementasi ulang di sini — namun **kelas** kerentanannya
  (keep-alive, entropi, path, parser) tetap relevan dan masuk §4.
- PHP RCE (2 CVE, 21 Okt 2026) — stack berbeda; pelajaran: parser
  tanpa autentikasi harus selalu diasumsikan diserang.
