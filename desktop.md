# NX8V — Desktop (WebView2)

Panduan lengkap membangun **aplikasi desktop** dengan NX8V: jendela native,
bridge JS ↔ native, dialog, tray, notifikasi, dan packaging.

> Untuk aplikasi **web/server**, lihat **[server.md](server.md)**. Untuk
> gambaran umum runtime, lihat **[README.md](README.md)**.

Daftar isi:

1. [Cara kerja](#1-cara-kerja)
2. [Menjalankan](#2-menjalankan)
3. [Bridge `window.nx8v`](#3-bridge-windownx8v)
4. [Dialog native](#4-dialog-native)
5. [Tray & menu](#5-tray--menu)
6. [Notifikasi](#6-notifikasi)
7. [Multi-window](#7-multi-window)
8. [Packaging](#8-packaging)
9. [Detail teknis](#9-detail-teknis)
10. [Prasyarat & troubleshooting](#10-prasyarat--troubleshooting)

---

## 1. Cara kerja

```
nx8v window
   │
   ├─▶ jalankan script (biasanya HTTP server) di event loop libuv
   │
   └─▶ buka jendela Win32 + WebView2
          └─▶ navigate ke http://127.0.0.1:<port>/
                 └─▶ halaman HTML/CSS/JS biasa
                        └─▶ window.nx8v  (bridge ke native)
```

Frontend tetap HTML/CSS/JS normal yang dilayani server lokal; backend adalah
runtime NX8V sendiri. Tidak ada Electron, tidak ada Node, satu exe ~34 MB.

---

## 2. Menjalankan

```powershell
nx8v window                                   # pakai project.json (main + port)
nx8v window server.js                         # script tertentu
nx8v window --url=http://localhost:3000       # URL eksplisit
nx8v window --title="Toko" --width=1200 --height=800
```

| Opsi | Default | Keterangan |
|---|---|---|
| `--url=` | `http://127.0.0.1:<port>/` | URL yang dibuka |
| `--title=` | `nx8v` | judul jendela |
| `--width=` | `desktop.width`, atau `1100` | lebar jendela |
| `--height=` | `desktop.height`, atau `760` | tinggi jendela |
| `--state=` | `desktop.state`, atau `normal` | `normal`, `maximized`, atau `minimized` |
| `--maximized` | | sama dengan `--state=maximized` |
| `--minimized` | | sama dengan `--state=minimized` |
| `--no-maximize` | `desktop.maximizable` | sembunyikan tombol maximize |
| `--min-width=` | `desktop.minWidth` | lebar terkecil saat tepi ditarik |
| `--min-height=` | `desktop.minHeight` | tinggi terkecil saat tepi ditarik |
| `--x=` `--y=` | `desktop.x`, `desktop.y` | pojok kiri atas jendela |
| `--center` | `desktop.center` | letakkan di tengah area kerja |
| `--frameless` | `desktop.titlebar` | sama dengan `"titlebar": false` |
| `--no-resize` | `desktop.resizable` | kunci ukuran; tepi jendela tidak bisa ditarik |
| `--multi-instance` | `desktop.singleInstance` | izinkan lebih dari satu jendela untuk proyek yang sama |
| `--icon=` | `nx8v.desktop.icon`, atau `icon.ico` | ikon jendela (png, jpg, webp, bmp, ico) |

Tanpa argumen, NX8V membaca `project.json` (`main` dan `nx8v.port`).

`server.listen` selesai sebelum jendela membuka URL, jadi halaman index tampil
saat unduhan data pertama masih berjalan.

Menyimpan `.html`, `.css`, atau `.svg` memuat ulang halaman di jendela.
Menyimpan `.js`, `.mjs`, atau `.json` menutup jendela lalu membukanya lagi
supaya kode server yang baru ikut jalan.

Menutup jendela lewat tombol X menghentikan proses dan mengembalikan prompt
terminal (kecuali tray aktif — lihat §5). Ctrl+C di terminal menutup jendela
yang sama.

Komponen HTML berlaku di dalam jendela, karena halamannya tetap dari server:

```html
<header partial="./header.html"></header>
```

---

## 3. Bridge `window.nx8v`

Tersedia otomatis di semua halaman (di-inject sebelum skrip halaman berjalan).

```js
// Jendela
nx8v.setTitle('Judul Baru');
nx8v.setSize(1200, 800);
nx8v.minimize();
nx8v.maximize();          // toggle maximize/restore
nx8v.openDevTools();
nx8v.close();
```

| Method | Keterangan |
|---|---|
| `setTitle(text)` | ubah judul jendela |
| `setSize(w, h)` | ubah ukuran jendela |
| `minimize()` | minimize |
| `maximize()` | maximize / restore |
| `openDevTools()` | buka DevTools WebView2 |
| `close()` | tutup aplikasi |

### Title bar sendiri

`"titlebar": false` menyembunyikan title bar Windows. Halaman menggambar bilahnya sendiri. Elemen `data-nx8v-drag` bisa diseret untuk memindahkan jendela. Tombol di dalamnya memakai `data-nx8v-nodrag` supaya tetap bisa diklik. `"titlebar": true` menampilkan title bar Windows.

```html
<header data-nx8v-drag>
  <span>Aplikasi demo</span>
  <button data-nx8v-nodrag onclick="nx8v.minimize()">—</button>
  <button data-nx8v-nodrag onclick="nx8v.maximize()">□</button>
  <button data-nx8v-nodrag onclick="nx8v.close()">×</button>
</header>
```

`nx8v.setTitle(...)` tetap mengubah nama di taskbar. Tulisan di bilah halaman diatur oleh HTML. Contohnya ada di `example/public/titlebar.html`.

Semua method jendela bersifat fire-and-forget (tidak mengembalikan Promise).
Dialog dan tray mengembalikan Promise.

---

## 4. Dialog native

```js
// Buka file -> Promise<string|null>
const file = await nx8v.dialog.openFile({
  title: 'Pilih file',
  filters: [
    { name: 'JavaScript', extensions: ['js', 'mjs'] },
    { name: 'Semua file', extensions: ['*'] },
  ],
});

// Simpan file -> Promise<string|null>
const target = await nx8v.dialog.saveFile({
  title: 'Simpan sebagai',
  defaultName: 'hasil.txt',
  filters: [{ name: 'Teks', extensions: ['txt'] }],
});

// Pilih folder -> Promise<string|null>
const folder = await nx8v.dialog.openFolder();

// Pesan modal. confirm mengembalikan true bila pengguna memilih Ya.
await nx8v.dialog.alert('Data tersimpan', 'nx8v');
const ya = await nx8v.dialog.confirm('Hapus data ini?', 'nx8v');
```

| Opsi | Keterangan |
|---|---|
| `title` | judul dialog |
| `filters` | array `{ name, extensions: ['js', 'txt', '*'] }` |
| `defaultName` | nama file awal (khusus `saveFile`) |

`alert(pesan, judul)` menampilkan kotak OK. `confirm(pesan, judul)` menampilkan Ya/Tidak dan mengembalikan `true` bila Ya dipilih.

Nilai `null` berarti pengguna membatalkan.

Contoh memakai hasilnya:

```js
const path = await nx8v.dialog.openFile({ filters: [{ name: 'Teks', extensions: ['txt'] }] });
if (path) {
  const res = await fetch('/api/read?path=' + encodeURIComponent(path));
  console.log(await res.text());
}
```

> Catatan: dialog berjalan modal di atas jendela; Promise resolve setelah
> pengguna memilih atau membatalkan.

---

## 5. Tray & menu

```js
const ok = await nx8v.tray.show({
  tooltip: 'Aplikasi saya',
  menu: [
    { label: 'Buka jendela', id: 101 },
    { label: 'Tentang', id: 102 },
    '-',                        // separator
    { label: 'Keluar', id: 103 },
  ],
});

nx8v.onMenu(101, () => console.log('buka jendela'));
nx8v.onMenu(102, () => nx8v.notify('nx8v', 'Desktop + WebView2'));
nx8v.onMenu(103, () => nx8v.close());

nx8v.tray.setTooltip('tooltip baru');
nx8v.tray.hide();
```

| API | Keterangan |
|---|---|
| `tray.show({ tooltip, menu })` | pasang ikon tray, Promise<boolean> |
| `tray.setTooltip(text)` | ubah tooltip |
| `tray.hide()` | hapus ikon tray |
| `onMenu(id, fn)` | callback saat item menu diklik |

Perilaku penting:

- **Klik kiri** ikon tray → jendela dimunculkan kembali
- **Klik kanan** → menu konteks
- Saat tray aktif, tombol close jendela **menyembunyikan ke tray** (bukan keluar)
- `exit: false` meniadakan entri **Keluar**. `exitLabel` mengganti tulisannya. Tanpa itu, **Keluar** tetap ditambahkan.
- Item menu: `{ label, id, enabled, checked, children }` atau `'-'`
- Klik kanan di halaman diganti dengan `nx8v.contextMenu.set([...])`. `clear()` mengembalikan menu browser.

---

## 6. Notifikasi

```js
nx8v.notify('Judul', 'Isi pesan');
```

Balloon notification lewat ikon tray (tray dipasang otomatis bila belum ada).
Muncul di pojok kanan bawah Windows.

---

## 7. Multi-window

```js
// buka jendela baru
nx8v.window.create({
  url: '/detail',
  title: 'Detail',
  width: 800,
  height: 600,
});
```

| Opsi | Default |
|---|---|
| `url` | `location.href` (halaman saat ini) |
| `title` | `nx8v` |
| `width` | `900` |
| `height` | `640` |

---

## 8. Packaging

```powershell
nx8v package                       # dist/<nama>/
nx8v package --name=toko --out=release
```

Isi folder hasil:

```
dist/<nama>/
├── <nama>.exe          # salinan nx8v.exe dengan nama aplikasi
├── WebView2Loader.dll  # otomatis bila proyek memakai bridge
├── project.json
├── server.js
├── public/ ...
├── start.cmd           # launcher (mode window bila memakai bridge)
└── README.txt
```

Deteksi otomatis: bila ada file `.js`/`.html` yang memuat `window.nx8v`,
`nx8v.dialog`, atau `nx8v.setTitle`, paket dianggap aplikasi desktop —
`WebView2Loader.dll` disalin dan `start.cmd` menjalankan mode `window`.

Dilewati saat menyalin: `node_modules`, `.git`, `build`, `dist`, `deps`, `out`,
`.nx8v`.

---

## 9. Detail teknis

| Bagian | Implementasi |
|---|---|
| Jendela | `CreateWindowExW` + `WNDPROC` (`src/bindings/window.h`) |
| Browser | WebView2 `ICoreWebView2Controller` (`deps/webview2/`) |
| Message loop | dua jalur pump: `uv_prepare` + `uv_timer` 4 ms |
| Bridge masuk | `AddScriptToExecuteOnDocumentCreated` + `postMessage` → `WebMessageReceived` |
| Bridge keluar | `PostWebMessageAsJson` (host → halaman) |
| Dialog | `IFileOpenDialog` / `IFileSaveDialog` (`shobjidl.h`) |
| Tray | `Shell_NotifyIconW` (`NOTIFYICONDATAW`) |
| Menu | `CreatePopupMenu` + `TrackPopupMenu` |
| Resize | `WM_SIZE` → `put_Bounds` |

**Kenapa dua jalur pump?** `uv_prepare` hanya jalan saat loop berputar; libuv
bisa memblokir lama menunggu I/O (IOCP). Timer 4 ms memastikan pesan Win32
tetap diproses → jendela tidak freeze.

**Arah pesan:** `window.chrome.webview.postMessage()` adalah halaman → host.
Untuk host → halaman wajib `PostWebMessageAsJson` (memakai
`ExecuteScript` + `postMessage` akan mengirim ke arah yang salah).

---

## 10. Prasyarat & troubleshooting

**Prasyarat:**

- Windows 10/11
- **WebView2 Runtime** — sudah terpasang di Windows 11; Windows 10 bisa unduh
  dari situs Microsoft (Evergreen Runtime)
- SDK saat build: NuGet `Microsoft.Web.WebView2` → `deps/webview2/`
  (`include/`, `lib/WebView2LoaderStatic.lib`, `bin/WebView2Loader.dll`)

| Gejala | Penyebab & solusi |
|---|---|
| Jendela tidak muncul | WebView2 Runtime tidak ada → cek log error `gagal membuat WebView2 environment` |
| Jendela freeze / "not responding" | message loop tidak dipompa → pastikan build terbaru (timer pump) |
| `window.nx8v` undefined | halaman dibuka di browser biasa, bukan `nx8v window` |
| Dialog tidak muncul | `nx8v window` harus mode desktop; cek bridge ada |
| `tray.show()` mengembalikan `false` | ikon gagal dipasang (Explorer belum siap) — panggil ulang |
| `WebView2Loader.dll` hilang di paket | jalankan `nx8v package` dari exe yang punya DLL di sebelahnya |
| Tray tidak terlihat | Windows 11 menyembunyikan ikon baru di overflow (panah `^`) |

---

## Contoh di repo

| File | Isi |
|---|---|
| `example/public/bridge.html` | uji `setTitle`, dialog open/save/folder |
| `example/public/tray.html` | uji tray, menu, notifikasi |
| `example/public/dialogtest.html` | dialog otomatis (untuk uji cepat) |
| `example/server.js` | backend: fetch HTTPS + serve halaman |
| `example/public/index.html` | halaman utama galeri |
| `example/public/about.html` | halaman About, memakai partial yang sama |
| `example/public/header.html` | komponen header yang dipakai berulang |

---

## Pembungkusan

`nx8v package` membuat folder `dist/<nama>/` dan, bila `makensis` terpasang,
satu berkas pemasang.

### `project.json`

```json
"nx8v": {
  "port": 4000,
  "desktop": {
    "icon": "./public/assets/images/32x32.png",
    "state": "normal",
    "width": 1100,
    "height": 560,
    "minWidth": 640,
    "minHeight": 400,
    "center": true,
    "maximizable": true,
    "resizable": true,
    "titlebar": true,
    "singleInstance": true,
    "productName": "Aplikasi demo",
    "shortcutName": "Aplikasi demo",
    "artifactName": "Aplikasi-demo-Setup-${version}.exe"
  }
}
```

| Kunci | Pakai |
|---|---|
| `icon` | png, jpg, webp, bmp, atau ico untuk jendela, exe, dan pintasan |
| `state` | tampilan saat aplikasi diklik: `normal`, `maximized`, atau `minimized` |
| `width`, `height` | ukuran jendela. Pada `normal` ini ukuran yang tampil. Pada `maximized` atau `minimized` ini ukuran setelah jendela dikembalikan |
| `minWidth`, `minHeight` | batas terkecil saat pengguna menarik tepi jendela |
| `x`, `y` | posisi pojok kiri atas. Bila ada, `center` diabaikan |
| `center` | `true` menaruh jendela di tengah layar |
| `maximizable` | `false` meniadakan tombol maximize. `state` yang `maximized` ikut dibuka sebagai `normal` |
| `resizable` | `false` mengunci ukuran. Tombol maximize ikut hilang |
| `titlebar` | `true` menampilkan title bar Windows. `false` menyembunyikannya; halaman memasang title bar sendiri |
| `singleInstance` | `true` membuat klik kedua memunculkan jendela yang sudah ada |
| `productName` | nama yang terlihat pengguna |
| `shortcutName` | nama pintasan Start Menu dan desktop |
| `artifactName` | nama berkas pemasang; `${version}` dan `${name}` diganti dari `project.json` |

### Tahap 1 — folder yang bisa diklik dua kali

- Baca `desktop.icon`. Tanam ikon itu ke dalam exe hasil salinan, supaya Explorer menampilkannya.
- Exe di samping `project.json`, bila dijalankan tanpa argumen, membuka `nx8v window`. `start.cmd` tidak wajib.
- Gambar ikon di `desktop.icon` ikut disalin. PNG tidak perlu diubah menjadi ico oleh pengguna.

### Tahap 2 — pemasang NSIS

- `nx8v package` menulis skrip NSIS dari `project.json`, lalu memanggil `makensis` bila ada.
- Hasilnya satu berkas sesuai `artifactName`, misalnya `dist/Aplikasi-demo-Setup-1.0.0.exe`.
- Pemasang membuat pintasan Start Menu dan desktop dengan `shortcutName`, plus entri hapus pemasangan.
- Folder mentah tahap 1 tetap ada untuk dicoba tanpa memasang.

### Tahap 3 — menu yang mengikuti aplikasi

- Item menu: `label`, `id`, `enabled`, `checked`, pemisah, dan submenu.
- `exit: false` meniadakan **Keluar** bawaan. `exitLabel` mengganti tulisannya.
- Klik kanan di halaman bisa diganti lewat `nx8v.contextMenu.set([...])`, bukan menu browser yang tetap.
