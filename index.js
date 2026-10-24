// NX8V situs — i18n ID/EN + menu mobile + tab kode + salin kode
(function () {
  "use strict";

  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }

  var I18N = {
    id: {
      "meta.title": "NX8V — Runtime aplikasi JavaScript yang mandiri",
      "meta.desc": "NX8V adalah runtime aplikasi JavaScript yang mandiri — server dan desktop — dalam satu binary C++. Mesin V8, event loop libuv, HTTP/HTTPS, WebSocket, router, hingga jendela desktop. Tanpa dependensi.",
      "skip": "Langsung ke konten",
      "ui.menu.open": "Buka menu",
      "ui.menu.close": "Tutup menu",
      "ui.copy": "Salin kode",
      "ui.copied": "Tersalin",
      "nav.fitur": "Fitur",
      "nav.modul": "Modul",
      "nav.contoh": "Contoh",
      "nav.mulai": "Mulai",
      "nav.cta": "Mulai Cepat",
      "nav.github": "GitHub",
      "nav.panduan": "Panduan",
      "hero.title": "Jalankan JavaScript.",
      "hero.claim": "Cukup HTML, CSS, JavaScript — sisanya NX8V.",
      "hero.desc": "Runtime aplikasi JavaScript yang mandiri — server dan desktop — dalam satu binary C++: mesin V8, event loop libuv, HTTP/HTTPS, WebSocket, router, hingga jendela desktop. Satu perintah, tanpa dependensi, tanpa setup.",
      "hero.cta1": "Unduh NX8V",
      "hero.cta2": "Lihat Contoh",
      "hero.meta": "C++17 · mesin V8 · libuv · Windows & Linux",
      "pj.title": "Dua jalur penggunaan",
      "pj.sub": "Pilih jalur: server web atau aplikasi desktop — runtime yang sama.",
      "pj.1.t": "Server & web",
      "pj.1.d": "Jalankan aplikasi web penuh: HTTP/HTTPS, router, static file dengan ETag & Range, WebSocket, dan komponen HTML partial.",
      "pj.1.link": "Baca server.md &#8594;",
      "pj.2.t": "Desktop",
      "pj.2.d": "<code class=\"mono\">nx8v window</code> membuka jendela WebView2 dengan bridge <code class=\"mono\">window.nx8v</code> — jendela desktop native yang ringan.",
      "pj.2.link": "Baca desktop.md &#8594;",
      "fit.title": "Fitur",
      "fit.sub": "API inti yang tersedia langsung di dalam runtime.",
      "fit.1.t": "Eksekusi script & REPL",
      "fit.1.d": "Jalankan <code class=\"mono\">nx8v script.js</code> atau masuk REPL interaktif dengan <code class=\"mono\">nx8v</code> tanpa argumen.",
      "fit.2.t": "Event loop libuv",
      "fit.2.d": "<code class=\"mono\">Promise</code> dan <code class=\"mono\">async/await</code> bekerja secara native lewat microtask pump.",
      "fit.3.t": "require() & ES Modules",
      "fit.3.d": "CommonJS dengan cache (<code class=\"mono\">__filename</code>, <code class=\"mono\">__dirname</code>) plus <code class=\"mono\">import</code>/<code class=\"mono\">export</code> untuk file <code class=\"mono\">.mjs</code>.",
      "fit.4.t": "HTTPS server &amp; klien",
      "fit.4.d": "Server HTTPS bawaan dengan PFX/PEM (TLS 1.2/1.3, ALPN h2 untuk HTTP/2), fetch HTTP/HTTPS berbasis Promise, router (params &amp; middleware), plus komponen HTML <code class=\"mono\">partial</code>.",
      "fit.5.t": "WebSocket & stream",
      "fit.5.d": "Server + client WebSocket (RFC 6455), dan stream <code class=\"mono\">Readable</code>/<code class=\"mono\">Writable</code>/<code class=\"mono\">Duplex</code> dengan <code class=\"mono\">pipe</code>.",
      "fit.6.t": "Tooling, test & desktop",
      "fit.6.d": "<code class=\"mono\">nx8v init/dev/start/stop/list/logs</code> + <code class=\"mono\">package</code> — dev menyegarkan browser saat HTML/CSS berubah; <code class=\"mono\">nx8v window</code>: dialog, tray, notifikasi, multi-window.",
      "mod.title": "Modul built-in",
      "mod.sub": "Tujuh belas modul siap <code class=\"mono\">require()</code> — detail API tiap modul ada di Panduan.",
      "mod.note": "Lihat detail API tiap modul di Panduan &#8594;",
      "mod.th1": "Modul",
      "mod.th2": "Isi",
      "mod.fs": "<code class=\"mono\">readFileSync</code>/<code class=\"mono\">writeFile</code>, <code class=\"mono\">watch</code>, <code class=\"mono\">rename</code>/<code class=\"mono\">copyFile</code>/<code class=\"mono\">rm</code>/<code class=\"mono\">appendFile</code>, <code class=\"mono\">createReadStream</code>/<code class=\"mono\">createWriteStream</code>, sync &amp; async",
      "mod.path": "<code class=\"mono\">join</code>, <code class=\"mono\">resolve</code>, <code class=\"mono\">dirname</code>, <code class=\"mono\">parse</code>/<code class=\"mono\">format</code>",
      "mod.os": "<code class=\"mono\">platform</code>, <code class=\"mono\">cpus</code>, <code class=\"mono\">freemem</code>, <code class=\"mono\">homedir</code>, <code class=\"mono\">networkInterfaces</code>",
      "mod.url": "Parsing URL menjadi semua komponennya",
      "mod.querystring": "<code class=\"mono\">parse</code>, <code class=\"mono\">stringify</code>, <code class=\"mono\">URLSearchParams</code>",
      "mod.events": "<code class=\"mono\">EventEmitter</code>: on, once, emit, removeListener",
      "mod.http": "Server <code class=\"mono\">createServer</code> dan client <code class=\"mono\">get</code>/<code class=\"mono\">request</code>",
      "mod.https": "Client HTTPS via WinHTTP (TLS 1.2/1.3 + cert store Windows)",
      "mod.router": "<code class=\"mono\">app.get/post/put/delete</code> dengan <code class=\"mono\">req.params</code>, middleware, <code class=\"mono\">res.json/send/redirect</code>",
      "mod.static": "Static file server: ETag/304, Range/206, HEAD, Cache-Control, anti path traversal",
      "mod.stream": "<code class=\"mono\">Readable</code>/<code class=\"mono\">Writable</code>/<code class=\"mono\">Duplex</code>/<code class=\"mono\">PassThrough</code> + <code class=\"mono\">pipe</code>",
      "mod.ws": "WebSocket server + client (RFC 6455): send, message, close",
      "mod.crypto": "<code class=\"mono\">createHash</code>, <code class=\"mono\">randomBytes</code>, <code class=\"mono\">randomUUID</code>",
      "mod.zlib": "<code class=\"mono\">gzipSync</code>, <code class=\"mono\">gunzipSync</code>, <code class=\"mono\">deflateSync</code>, <code class=\"mono\">inflateSync</code>",
      "mod.net": "TCP mentah: <code class=\"mono\">createServer</code>, <code class=\"mono\">connect</code>",
      "mod.dns": "<code class=\"mono\">lookup</code>, <code class=\"mono\">resolve</code>, <code class=\"mono\">resolve4</code>",
      "mod.child_process": "<code class=\"mono\">exec</code>, <code class=\"mono\">spawn</code>",
      "ex.title": "Contoh kode",
      "ex.sub": "Simpan sebagai file .js lalu eksekusi dengan <code class=\"mono\">nx8v</code>.",
      "ex.tab.http": "HTTP server",
      "ex.tab.events": "EventEmitter",
      "ex.tab.fetch": "fetch",
      "ex.tab.crypto": "crypto",
      "qs.title": "Mulai dalam 60 detik",
      "qs.sub": "Tiga langkah dari nol sampai HTTP server berjalan.",
      "qs.1.t": "1. Pasang sekali",
      "qs.1.d": "Installer mengunduh dari GitHub Releases, memverifikasi SHA256SUMS, lalu binary masuk ke PATH user.",
      "qs.2.t": "2. Buat proyek",
      "qs.2.d": "Wizard menghasilkan <code class=\"mono\">project.json</code>, <code class=\"mono\">server.js</code>, dan folder <code class=\"mono\">public/</code>.",
      "qs.3.t": "3. Jalankan",
      "qs.3.d": "Server statik aktif beserta contoh endpoint <code class=\"mono\">GET /api/hello</code>.",
      "foot.copy": "© 2026 NX8V",
    },
    en: {
      "meta.title": "NX8V — A self-contained JavaScript application runtime",
      "meta.desc": "NX8V is a self-contained JavaScript application runtime — server and desktop — in a single C++ binary. The V8 engine, a libuv event loop, HTTP/HTTPS, WebSockets, a router, even a desktop window. No dependencies.",
      "skip": "Skip to main content",
      "ui.menu.open": "Open menu",
      "ui.menu.close": "Close menu",
      "ui.copy": "Copy code",
      "ui.copied": "Copied",
      "nav.fitur": "Features",
      "nav.modul": "Modules",
      "nav.contoh": "Examples",
      "nav.mulai": "Get started",
      "nav.cta": "Quick start",
      "nav.github": "GitHub",
      "nav.panduan": "Guide",
      "hero.title": "Run JavaScript.",
      "hero.claim": "Just HTML, CSS, JavaScript — NX8V does the rest.",
      "hero.desc": "A self-contained JavaScript application runtime — server and desktop — in one C++ binary: the V8 engine, a libuv event loop, HTTP/HTTPS, WebSockets, a router, even a desktop window. One command, zero dependencies, zero setup.",
      "hero.cta1": "Download NX8V",
      "hero.cta2": "See examples",
      "hero.meta": "C++17 · V8 engine · libuv · Windows & Linux",
      "pj.title": "Two ways to use it",
      "pj.sub": "Pick a path: web server or desktop app — the same runtime.",
      "pj.1.t": "Server & web",
      "pj.1.d": "Run a full web app: HTTP/HTTPS, a router, static files with ETag & Range, WebSockets, and HTML partial components.",
      "pj.1.link": "Read server.md &#8594;",
      "pj.2.t": "Desktop",
      "pj.2.d": "<code class=\"mono\">nx8v window</code> opens a WebView2 window with the <code class=\"mono\">window.nx8v</code> bridge — a lightweight native desktop window.",
      "pj.2.link": "Read desktop.md &#8594;",
      "fit.title": "Features",
      "fit.sub": "Core APIs available right inside the runtime.",
      "fit.1.t": "Script execution & REPL",
      "fit.1.d": "Run <code class=\"mono\">nx8v script.js</code> or enter an interactive REPL with plain <code class=\"mono\">nx8v</code>.",
      "fit.2.t": "libuv event loop",
      "fit.2.d": "<code class=\"mono\">Promise</code> and <code class=\"mono\">async/await</code> work natively via the microtask pump.",
      "fit.3.t": "require() & ES Modules",
      "fit.3.d": "CommonJS with module cache (<code class=\"mono\">__filename</code>, <code class=\"mono\">__dirname</code>) plus <code class=\"mono\">import</code>/<code class=\"mono\">export</code> for <code class=\"mono\">.mjs</code> files.",
      "fit.4.t": "HTTPS server &amp; client",
      "fit.4.d": "Built-in HTTPS server with PFX/PEM (TLS 1.2/1.3, ALPN h2 for HTTP/2), Promise-based HTTP/HTTPS fetch, a router (params &amp; middleware), plus server-assembled HTML <code class=\"mono\">partial</code> components.",
      "fit.5.t": "WebSocket & streams",
      "fit.5.d": "WebSocket server + client (RFC 6455), and <code class=\"mono\">Readable</code>/<code class=\"mono\">Writable</code>/<code class=\"mono\">Duplex</code> streams with <code class=\"mono\">pipe</code>.",
      "fit.6.t": "Tooling, test & desktop",
      "fit.6.d": "<code class=\"mono\">nx8v init/dev/start/stop/list/logs</code> + <code class=\"mono\">package</code> — dev refreshes the browser when HTML/CSS changes; <code class=\"mono\">nx8v window</code>: dialogs, tray, notifications, multi-window.",
      "mod.title": "Built-in modules",
      "mod.sub": "Seventeen modules ready to call via <code class=\"mono\">require()</code>, no extra installs.",
      "mod.note": "Per-module API details in the Guide &#8594;",
      "mod.th1": "Module",
      "mod.th2": "Contents",
      "mod.fs": "<code class=\"mono\">readFileSync</code>/<code class=\"mono\">writeFile</code>, <code class=\"mono\">watch</code>, <code class=\"mono\">rename</code>/<code class=\"mono\">copyFile</code>/<code class=\"mono\">rm</code>/<code class=\"mono\">appendFile</code>, <code class=\"mono\">createReadStream</code>/<code class=\"mono\">createWriteStream</code>, sync &amp; async",
      "mod.path": "<code class=\"mono\">join</code>, <code class=\"mono\">resolve</code>, <code class=\"mono\">dirname</code>, <code class=\"mono\">parse</code>/<code class=\"mono\">format</code>",
      "mod.os": "<code class=\"mono\">platform</code>, <code class=\"mono\">cpus</code>, <code class=\"mono\">freemem</code>, <code class=\"mono\">homedir</code>, <code class=\"mono\">networkInterfaces</code>",
      "mod.url": "Parses a URL into all of its components",
      "mod.querystring": "<code class=\"mono\">parse</code>, <code class=\"mono\">stringify</code>, <code class=\"mono\">URLSearchParams</code>",
      "mod.events": "<code class=\"mono\">EventEmitter</code>: on, once, emit, removeListener",
      "mod.http": "Server (<code class=\"mono\">createServer</code>) and client (<code class=\"mono\">get</code>/<code class=\"mono\">request</code>)",
      "mod.https": "HTTPS client over WinHTTP (TLS 1.2/1.3 + Windows cert store)",
      "mod.router": "<code class=\"mono\">app.get/post/put/delete</code> with <code class=\"mono\">req.params</code>, middleware, <code class=\"mono\">res.json/send/redirect</code>",
      "mod.static": "Static file server: ETag/304, Range/206, HEAD, Cache-Control, path traversal protection",
      "mod.stream": "<code class=\"mono\">Readable</code>/<code class=\"mono\">Writable</code>/<code class=\"mono\">Duplex</code>/<code class=\"mono\">PassThrough</code> + <code class=\"mono\">pipe</code>",
      "mod.ws": "WebSocket server + client (RFC 6455): send, message, close",
      "mod.crypto": "<code class=\"mono\">createHash</code>, <code class=\"mono\">randomBytes</code>, <code class=\"mono\">randomUUID</code>",
      "mod.zlib": "<code class=\"mono\">gzipSync</code>, <code class=\"mono\">gunzipSync</code>, <code class=\"mono\">deflateSync</code>, <code class=\"mono\">inflateSync</code>",
      "mod.net": "Raw TCP: <code class=\"mono\">createServer</code>, <code class=\"mono\">connect</code>",
      "mod.dns": "<code class=\"mono\">lookup</code>, <code class=\"mono\">resolve</code>, <code class=\"mono\">resolve4</code>",
      "mod.child_process": "<code class=\"mono\">exec</code>, <code class=\"mono\">spawn</code>",
      "ex.title": "Code examples",
      "ex.sub": "Save as a .js file, then run it with <code class=\"mono\">nx8v</code>.",
      "ex.tab.http": "HTTP server",
      "ex.tab.events": "EventEmitter",
      "ex.tab.fetch": "fetch",
      "ex.tab.crypto": "crypto",
      "qs.title": "Up and running in 60 seconds",
      "qs.sub": "Three steps from zero to a running HTTP server.",
      "qs.1.t": "1. Install once",
      "qs.1.d": "The installer downloads from GitHub Releases, verifies the SHA256SUMS, then puts the binary on the user PATH.",
      "qs.2.t": "2. Create a project",
      "qs.2.d": "The wizard generates <code class=\"mono\">project.json</code>, <code class=\"mono\">server.js</code>, and a <code class=\"mono\">public/</code> folder.",
      "qs.3.t": "3. Run it",
      "qs.3.d": "The static server starts together with a sample <code class=\"mono\">GET /api/hello</code> endpoint.",
      "foot.copy": "© 2026 NX8V",
    },
  };

  var lang = "id";

  function t(key) {
    return (I18N[lang] && I18N[lang][key]) || key;
  }

  function setLang(value) {
    lang = I18N[value] ? value : "id";
    var dict = I18N[lang];

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (dict[key] !== undefined) el.innerHTML = dict[key];
    });

    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(",").forEach(function (rule) {
        var parts = rule.split("|");
        if (parts.length === 2 && dict[parts[1]] !== undefined) {
          el.setAttribute(parts[0], dict[parts[1]]);
        }
      });
    });

    if (dict["meta.title"]) document.title = dict["meta.title"];

    document.documentElement.lang = lang;
    document.querySelectorAll("[data-lang-btn]").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-lang-btn") === lang);
    });

    try { localStorage.setItem("nx8v-lang", lang); } catch (e) { /* mode privat */ }
  }

  // --- Menu mobile ---
  var toggle = document.getElementById("toggle");
  var menu = document.getElementById("menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? t("ui.menu.close") : t("ui.menu.open"));
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", t("ui.menu.open"));
      }
    });
  }

  // --- Tab contoh kode ---
  var tabs = document.querySelectorAll('[role="tab"]');
  var panes = document.querySelectorAll('[role="tabpanel"]');
  var runFile = document.getElementById("runFile");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (tb) {
        tb.classList.toggle("active", tb === tab);
        tb.setAttribute("aria-selected", String(tb === tab));
      });
      panes.forEach(function (p) {
        var show = p.id === tab.getAttribute("aria-controls");
        p.classList.toggle("active", show);
        p.hidden = !show;
        if (show && runFile) runFile.textContent = p.dataset.name || "script.js";
      });
    });
  });

  // --- Salin kode panel aktif ---
  var copyBtn = document.getElementById("copyBtn");
  var activePane = document.querySelector(".pane.active");
  if (copyBtn && activePane) {
    copyBtn.addEventListener("click", function () {
      var done = function () {
        copyBtn.textContent = t("ui.copied");
        copyBtn.classList.add("copy-done");
        setTimeout(function () {
          copyBtn.textContent = t("ui.copy");
          copyBtn.classList.remove("copy-done");
        }, 1500);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(activePane.textContent).then(done, function () { copyViaFallback(activePane, done); });
      } else {
        copyViaFallback(activePane, done);
      }
    });
  }

  function copyViaFallback(node, done) {
    var temp = document.createElement("textarea");
    temp.value = node.textContent;
    temp.setAttribute("readonly", "");
    temp.style.position = "fixed";
    temp.style.opacity = "0";
    document.body.appendChild(temp);
    temp.select();
    try {
      if (document.execCommand("copy")) done();
    } catch (err) { /* abaikan */ }
    document.body.removeChild(temp);
  }

  // --- Init bahasa ---
  document.querySelectorAll("[data-lang-btn]").forEach(function (btn) {
    btn.addEventListener("click", function () { setLang(btn.getAttribute("data-lang-btn")); });
  });

  try {
    var saved = localStorage.getItem("nx8v-lang");
    if (saved) { setLang(saved); return; }
  } catch (e) { /* abaikan */ }
  var browser = (navigator.language || "").slice(0, 2).toLowerCase();
  setLang(browser === "en" ? "en" : "id");
})();
