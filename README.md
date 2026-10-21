# NX8V — Situs

Situs single-page untuk runtime JavaScript [NX8V](https://github.com/iyanrsaleh) — runtime berbasis mesin V8 + libuv.

## Struktur

```
├── index.html   # halaman utama (bilingual ID/EN)
├── style.css    # tema terang minimalis, responsif
├── index.js     # i18n, menu mobile, tab kode, salin ke clipboard
├── server.js    # static server (dijalankan dengan nx8v)
└── icon.png     # logo
```

## Menjalankan

Static — buka `index.html` langsung, atau:

```powershell
nx8v server.js          # http://localhost:7182
# port lain:
$env:NX8V_PORT = "8080"; nx8v server.js
```

Server apapun bisa dipakai, mis. `python -m http.server`.
