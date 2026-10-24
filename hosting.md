# Hosting NX8V

Satu aplikasi NX8V. Tiga web server di depannya: **aaPanel**, **CyberPanel**, dan **Apache**.

Situs yang sudah ada tetap di `/`. Aplikasi NX8V tampil di `/nx8v/`. Web server hanya meneruskan jalur itu ke proses NX8V. NX8V sendiri yang menulis halaman dan API.

Yang tampil di ketiga server sama.

| | |
|---|---|
| Halaman | `https://domain/nx8v/` |
| Judul | NX8V Server & web |
| API | `https://domain/nx8v/api/where` |
| Isi API | `{"runtime":"nx8v","host":"nama-mesin"}` |

Nama host di halaman diisi dari API itu.

---

## 1. Aplikasi

Simpan di `/opt/nx8v`.

`project.json`

```json
{
  "name": "nx8v-web",
  "version": "1.0.0",
  "description": "NX8V Server and web",
  "main": "server.js",
  "nx8v": { "port": 6002 }
}
```

`public/index.html`

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>NX8V Server &amp; web</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem; }
    h1 { color: #1d4ed8; }
  </style>
</head>
<body>
  <h1>NX8V Server &amp; web</h1>
  <p>Halaman ini dilayani oleh runtime NX8V.</p>
  <p>Host: <strong id="host">memuat</strong></p>
  <script>
    fetch('api/where').then(function (r) { return r.json(); }).then(function (j) {
      document.getElementById('host').textContent = j.host;
    }).catch(function () {
      document.getElementById('host').textContent = 'tidak terbaca';
    });
  </script>
</body>
</html>
```

`server.js` mendengar di `127.0.0.1:6002`. Awalan `/nx8v` dibuang sebelum rute dipilih, karena halaman memakai `fetch('api/where')` dan browser mengirim `/nx8v/api/where`.

```js
const http = require('http');
const fs = require('fs');
const os = require('os');

const PORT = 6002;
const page = process.cwd().replace(/\/$/, '') + '/public/index.html';

function route(url) {
  let p = (url || '/').split('?')[0];
  if (p === '/nx8v' || p === '/nx8v/') return '/';
  if (p.indexOf('/nx8v/') === 0) return p.slice('/nx8v'.length);
  return p;
}

const server = http.createServer((req, res) => {
  const clean = route(req.url);
  if (clean === '/api/where') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ runtime: 'nx8v', host: os.hostname() }));
    return;
  }
  if (clean === '/' || clean === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(fs.readFileSync(page, 'utf8'));
    return;
  }
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('nx8v web http://127.0.0.1:' + PORT);
});
```

Port `6002` hanya untuk mesin itu. Dari internet yang terbuka tetap port web server, `80` atau `443`.

---

## 2. Dari mana NX8V dipasang

Runtime-nya tidak ikut panel. Di aaPanel, CyberPanel, dan Apache, sumbernya sama: rilis Linux di [github.com/iyanrsaleh/nx8v/releases/latest](https://github.com/iyanrsaleh/nx8v/releases/latest).

Tiap server punya SSH sendiri. Perintah di bawah diketik di terminal SSH server itu, bukan dari mesin lain.

Mesin membutuhkan glibc 2.34 atau lebih baru. `install.sh` mengunduh `nx8v-linux-x64.tar.gz`, mencocokkan hash di `SHA256SUMS`, lalu memasang biner ke `~/.local/bin/nx8v`.

```bash
curl -fsSL -o install.sh https://raw.githubusercontent.com/iyanrsaleh/nx8v/main/install.sh
sed -i 's/\r$//' install.sh
sh install.sh
sudo install -m 755 "$HOME/.local/bin/nx8v" /usr/local/bin/nx8v
nx8v --version
```

`sh install.sh` memasang biner untuk user SSH `admin`. Hasilnya di ketiga server:

| Server | Hasil |
|---|---|
| aaPanel | `nx8v/0.2.2` terpasang di `/home/admin/.local/bin/nx8v` |
| Apache | `nx8v/0.2.2` terpasang di `/home/admin/.local/bin/nx8v` |
| CyberPanel | berkas terpasang di `/home/admin/.local/bin/nx8v`, tetapi tidak bisa dijalankan: `libssl.so.3` tidak ada |

`/usr/local/bin` membuat `nx8v` ketemu oleh layanan sistem. Di CyberPanel langkah `sudo install` tidak dijalankan, karena biner itu tidak bisa dieksekusi di mesin tersebut. Aplikasi di bagian 1 tetap berkas Anda sendiri. Salin `project.json`, `server.js`, dan `public/index.html` ke `/opt/nx8v`, lalu nyalakan.

```bash
cd /opt/nx8v
nx8v start
curl -sS http://127.0.0.1:6002/api/where
```

Jawaban yang benar:

```json
{"runtime":"nx8v","host":"nama-mesin"}
```

Agar hidup lagi setelah mesin menyala, pasang unit dari skrip yang sama. Direktori kerja unit itu `/opt/nx8v`, perintahnya `nx8v start`.

```bash
sudo sh install.sh --service /opt/nx8v
sudo systemctl enable --now nx8v
```

---

## 3. aaPanel

aaPanel di sini memakai Apache. Situs lama tetap di konfigurasi situsnya. Tambahkan penerusan ini pada vhost situs, lalu muat ulang Apache dari panel.

```apache
RedirectMatch ^/nx8v$ /nx8v/
<Location /nx8v/>
    ProxyPass http://127.0.0.1:6002/
    ProxyPassReverse http://127.0.0.1:6002/
</Location>
```

`/nx8v` tanpa garis miring diarahkan ke `/nx8v/`. Modul `proxy` dan `proxy_http` harus aktif. `httpd -t` bersih sebelum Apache dimuat ulang.

Buka `https://domain/nx8v/`. Judulnya **NX8V Server & web**. Baris host terisi nama mesin.

---

## 4. CyberPanel

Web server CyberPanel adalah OpenLiteSpeed. Tambahkan proses luar dan context ini pada vhost situs, sekali saja. Lalu jalankan ulang OpenLiteSpeed.

```
extprocessor nx8v {
  type                    proxy
  address                 127.0.0.1:6002
  maxConns                100
  initTimeout             60
  retryTimeout            0
  respBuffer              0
}

context /nx8v/ {
  type                    proxy
  handler                 nx8v
  addDefaultCharset       off
}
```

Context itu hanya menambah `/nx8v/`. Akar vhost tetap melayani situs yang sudah ada.

Bila sistem CyberPanel lebih tua dari glibc 2.34, atau belum punya OpenSSL 3 (`libssl.so.3`), biner NX8V tidak bisa jalan di mesin itu. Jalankan aplikasi di mesin yang memenuhi syarat, ubah `address` ke `alamat-mesin-itu:6002`, dan buat `server.js` mendengar di `0.0.0.0` supaya OpenLiteSpeed bisa menjangkaunya. Jangan membuka port `6002` ke internet. Yang boleh dijangkau pengunjung tetap `80` dan `443`.

Halaman dan API yang tampil sama dengan aaPanel.

---

## 5. Apache

Aktifkan modul, simpan cuplikan yang sama dengan aaPanel, lalu muat ulang.

```bash
a2enmod proxy proxy_http
```

Berkas `/etc/apache2/conf-available/nx8v.conf`:

```apache
RedirectMatch ^/nx8v$ /nx8v/
<Location /nx8v/>
    ProxyPass http://127.0.0.1:6002/
    ProxyPassReverse http://127.0.0.1:6002/
</Location>
```

```bash
a2enconf nx8v
apache2ctl configtest
apache2ctl graceful
```

`configtest` harus menjawab `Syntax OK` sebelum `graceful`.

---

## 6. Cek

Di tiap server, dua alamat ini harus menjawab.

| Alamat | Hasil |
|---|---|
| `/nx8v/` | halaman **NX8V Server & web**, host terisi |
| `/nx8v/api/where` | `{"runtime":"nx8v","host":"..."}` |
| `/` | situs lama, tidak berubah |

```bash
curl -sS -o /dev/null -w "%{http_code}\n" https://domain/nx8v/
curl -sS https://domain/nx8v/api/where
curl -sS -o /dev/null -w "%{http_code}\n" https://domain/
```

---

## 7. Bila gagal

| Gejala | Yang dicek |
|---|---|
| `/nx8v/` menjawab 502 atau 503 | `curl http://127.0.0.1:6002/api/where` di mesin yang menjalankan `nx8v start` |
| Halaman tampil, host tetap "memuat" atau "tidak terbaca" | `/nx8v/api/where` dari browser. Awalan `/nx8v` di `server.js` harus terbuang |
| Akar situs ikut pindah | Penerusan hanya pada `/nx8v/`, bukan pada `/` |
| `curl` berhenti dengan kesalahan sertifikat | port 443 yang keluar dari server ikut dialihkan ke panel, jadi sertifikat yang tampil milik panel. Batasi pengalihan itu pada alamat server sendiri, lalu ulangi `install.sh` |
| `nx8v: cannot execute` atau `libssl.so.3` tidak ketemu | glibc di bawah 2.34, atau OpenSSL 3 belum ada. Pindahkan proses ke mesin yang lebih baru, lalu arahkan `address` proxy ke sana |
| Perubahan `server.js` belum terasa | hentikan proses lama, lalu `nx8v start` lagi dari `/opt/nx8v` |
