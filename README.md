# NX8V — Situs

Situs single-page untuk runtime JavaScript **NX8V** (mesin V8 + libuv, satu binary C++) —
bilingual ID/EN, tema terang minimalis.

## Struktur

```
├── index.html        # halaman utama
├── style.css         # tema terang, responsif
├── index.js          # i18n, menu mobile, tab kode, salin ke clipboard
├── server.js         # static server (dijalankan dengan nx8v)
├── icon.png          # logo
├── server.md         # salinan docs proyek (materi server) — dari D:\NX8V\server.md
└── desktop.md        # salinan docs proyek (materi desktop) — dari D:\NX8V\desktop.md
```

`server.md` & `desktop.md` adalah salinan snapshot dari docs proyek. Sumber
kebenaran ada di `D:\NX8V\` — jangan sunting di sini.

## Menjalankan

```powershell
nx8v server.js          # http://localhost:7182
# port lain:
$env:NX8V_PORT = "8080"; nx8v server.js
```

Atau buka `index.html` langsung / server statik apa pun.
