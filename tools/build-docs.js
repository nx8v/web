// Bangun SPA panduan (panduan.html) dari server.md + desktop.md — tanpa dependensi
// Jalan: node tools/build-docs.js  (dari root situs)
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function fixLink(href) {
  if (/^https?:/.test(href) || href.startsWith('#')) return href;
  if (/\.md$/i.test(href)) return 'https://github.com/nx8v/web/blob/main/' + href;
  return href;
}

function inline(s) {
  s = esc(s);
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (m, t, href) {
    return '<a href="' + fixLink(href) + '">' + t + '</a>';
  });
  return s;
}

function ghSlug(s) {
  return s.toLowerCase().replace(/`/g, '').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
}

function mdToHtml(md, prefix, toc) {
  const lines = md.split(/\r?\n/);
  const out = [];
  let i = 0;
  let inFence = false, fenceLang = '', fenceBuf = [];
  let stacks = [];

  function closeListsTo(level) {
    while (stacks.length > level) out.push(stacks.pop() === 'ul' ? '</ul>' : '</ol>');
  }

  while (i < lines.length) {
    let line = lines[i];

    if (/^```/.test(line)) {
      if (!inFence) { inFence = true; fenceLang = line.slice(3).trim(); fenceBuf = []; }
      else {
        inFence = false;
        out.push('<pre class="doc-code mono"><code>' + esc(fenceBuf.join('\n')) + '</code></pre>');
      }
      i++; continue;
    }
    if (inFence) { fenceBuf.push(line); i++; continue; }

    if (/^\s*$/.test(line)) { closeListsTo(0); i++; continue; }
    if (/^---+\s*$/.test(line)) { closeListsTo(0); out.push('<hr />'); i++; continue; }

    var h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      closeListsTo(0);
      var lvl = h[1].length;
      var raw = h[2].replace(/\s*#+\s*$/, '').trim();
      var id = prefix + '-' + ghSlug(raw);
      if (lvl === 1) id = prefix + '-judul';
      out.push('<h' + lvl + ' id="' + id + '">' + inline(raw) + '</h' + lvl + '>');
      if (lvl <= 2) toc.push({ lvl: lvl, id: id, text: raw });
      i++; continue;
    }

    if (/^\|/.test(line)) {
      closeListsTo(0);
      var rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) { rows.push(lines[i]); i++; }
      var parseRow = function (r) { return r.replace(/^\||\|\s*$/g, '').split('|').map(function (c) { return c.trim(); }); };
      if (rows.length >= 2 && /^[\s|:\-]+$/.test(rows[1])) {
        var t = '<div class="tbl-wrap"><table>';
        t += '<thead><tr>' + parseRow(rows[0]).map(function (c) { return '<th scope="col">' + inline(c) + '</th>'; }).join('') + '</tr></thead><tbody>';
        for (var k = 2; k < rows.length; k++) {
          t += '<tr>' + parseRow(rows[k]).map(function (c) { return '<td>' + inline(c) + '</td>'; }).join('') + '</tr>';
        }
        t += '</tbody></table></div>';
        out.push(t);
      } else {
        rows.forEach(function (r) { out.push('<p>' + inline(r) + '</p>'); });
      }
      continue;
    }

    if (/^>\s?/.test(line)) {
      closeListsTo(0);
      var bq = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { bq.push(lines[i].replace(/^>\s?/, '')); i++; }
      out.push('<blockquote>' + inline(bq.join(' ')) + '</blockquote>');
      continue;
    }

    var mUl = line.match(/^(\s*)-\s+(.*)$/);
    var mOl = line.match(/^(\s*)\d+\.\s+(.*)$/);
    if (mUl || mOl) {
      var type = mUl ? 'ul' : 'ol';
      var text = (mUl ? mUl[2] : mOl[2]);
      var indent = Math.floor((mUl ? mUl[1] : mOl[1]).length / 2);
      var want = indent + 1;

      while (stacks.length > want) out.push(stacks.pop() === 'ul' ? '</ul>' : '</ol>');
      while (stacks.length < want) { stacks.push('ul'); out.push('<ul>'); }
      if (stacks[stacks.length - 1] !== type) {
        out.push(stacks.pop() === 'ul' ? '</ul>' : '</ol>');
        stacks.push(type);
        out.push(type === 'ul' ? '<ul>' : '<ol>');
      }

      var check = '';
      if (/^\[x\]\s*/i.test(text)) { check = '<input type="checkbox" checked disabled /> '; text = text.replace(/^\[x\]\s*/i, ''); }
      else if (/^\[ \]\s*/.test(text)) { check = '<input type="checkbox" disabled /> '; text = text.replace(/^\[ \]\s*/, ''); }

      out.push('<li>' + check + inline(text) + '</li>');
      i++; continue;
    }

    closeListsTo(0);
    var buf = [line];
    i++;
    while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^```|^#{1,4}\s|^>|^\||^(\s*)-\s|^(\s*)\d+\.\s/.test(lines[i])) {
      buf.push(lines[i]); i++;
    }
    out.push('<p>' + inline(buf.join(' ')) + '</p>');
  }
  closeListsTo(0);
  return out.join('\n');
}

const PARTS = [
  { file: 'server.md', id: 's', ribbon: 'Server &amp; Web', title: 'Panduan Server &amp; Web' },
  { file: 'hosting.md', id: 'h', ribbon: 'Hosting', title: 'Panduan Hosting' },
  { file: 'desktop.md', id: 'd', ribbon: 'Desktop', title: 'Panduan Desktop' },
  { file: 'SECURITY.md', id: 'k', ribbon: 'Keamanan', title: 'Keamanan' },
];

const bodies = [];
const tocItems = [];

PARTS.forEach(function (p) {
  const toc = [];
  const html = mdToHtml(fs.readFileSync(path.join(ROOT, p.file), 'utf8'), p.id, toc);
  bodies.push('<section class="doc-part" id="' + p.id + '" data-part>' +
    '<div class="doc-ribbon mono">' + p.ribbon + '</div>' + html + '</section>');
  tocItems.push({ group: p.title, ref: p.title.toLowerCase().replace(/[^a-z]+/g, '-'), items: toc });
});

const nav = tocItems.map(function (g) {
  const gid = g.items.length && g.items[0].id;
  let html = '<div class="toc-group"><a class="toc-top" href="#' + gid + '">' + g.group + '</a><ul>';
  g.items.forEach(function (it) {
    if (it.lvl !== 2) return;
    html += '<li><a href="#' + it.id + '">' + it.text.replace(/`/g, '') + '</a></li>';
  });
  html += '</ul></div>';
  return html;
}).join('\n');

const htmlOut =
  '<!doctype html>\n<html lang="id">\n<head>\n' +
  '  <meta charset="utf-8" />\n' +
  '  <meta name="viewport" content="width=device-width, initial-scale=1" />\n' +
  '  <title>Panduan NX8V — Server &amp; Desktop</title>\n' +
  '  <meta name="description" content="Panduan lengkap NX8V: server/web dan desktop (WebView2), modul, CLI, test, dan packaging." />\n' +
  '  <meta name="theme-color" content="#ffffff" />\n' +
  '  <link rel="icon" type="image/png" href="icon.png" />\n' +
  '  <link rel="stylesheet" href="style.css" />\n' +
  '</head>\n<body class="doc-page">\n' +
  '  <header class="doc-nav">\n' +
  '    <a class="brand" href="index.html"><span class="mono">&larr;</span> NX8V</a>\n' +
  '    <span class="doc-crumb mono">Panduan</span>\n' +
  '  </header>\n' +
  '  <div class="doc-layout">\n' +
  '    <aside class="toc" aria-label="Daftar isi">\n' + nav + '\n    </aside>\n' +
  '    <main class="doc-main article">\n' + bodies.join('\n') + '\n    </main>\n' +
  '  </div>\n' +
  '  <footer class="doc-footer mono">Dokumentasi NX8V &middot; sumber: D:\\NX8V (server.md &amp; desktop.md)</footer>\n' +
  '  <script src="panduan.js" defer></script>\n' +
  '</body>\n</html>\n';

fs.writeFileSync(path.join(ROOT, 'panduan.html'), htmlOut);
console.log('dibangun: panduan.html (' + htmlOut.length + ' B, ' + tocItems.length + ' bagian)');
