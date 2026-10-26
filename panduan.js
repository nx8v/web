// Panduan NX8V — language toggle, code highlighting, and scrollspy.
(function () {
  "use strict";

  function escapeHtml(value) {
    return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
  }

  function highlight(code) {
    var source = code.textContent || "";
    var out = "";
    var i = 0;
    var keywords = /^(const|let|var|function|return|if|else|for|while|new|await|async|throw|try|catch|import|from|export|class|true|false|null|undefined)$/;
    function token(value, className) {
      return '<span class="' + className + '">' + escapeHtml(value) + '</span>';
    }
    while (i < source.length) {
      var ch = source[i];
      var next = source[i + 1];
      if ((ch === "'" || ch === '"' || ch === '`')) {
        var quote = ch;
        var startString = i++;
        while (i < source.length) {
          if (source[i] === "\\") { i += 2; continue; }
          if (source[i] === quote) { i++; break; }
          i++;
        }
        out += token(source.slice(startString, i), "tok-string");
        continue;
      }
      if ((ch === "/" && next === "/") || (ch === "#" && (i === 0 || /\s/.test(source[i - 1])))) {
        var startComment = i;
        while (i < source.length && source[i] !== "\n") i++;
        out += token(source.slice(startComment, i), "tok-comment");
        continue;
      }
      if (/\d/.test(ch) && (i === 0 || !/[\w$]/.test(source[i - 1]))) {
        var startNumber = i;
        i++;
        while (i < source.length && /[\w.]/.test(source[i])) i++;
        out += token(source.slice(startNumber, i), "tok-number");
        continue;
      }
      if (/[A-Za-z_$]/.test(ch)) {
        var startWord = i;
        i++;
        while (i < source.length && /[\w$]/.test(source[i])) i++;
        var word = source.slice(startWord, i);
        var rest = source.slice(i).match(/^\s*\(/);
        out += token(word, keywords.test(word) ? "tok-keyword" : (rest ? "tok-function" : "tok-plain"));
        continue;
      }
      out += escapeHtml(ch);
      i++;
    }
    code.innerHTML = out;
  }

  document.querySelectorAll(".doc-code code").forEach(highlight);

  var languageButtons = Array.prototype.slice.call(document.querySelectorAll("[data-doc-lang]"));
  function setLanguage(value) {
    var language = value === "en" ? "en" : "id";
    document.body.classList.toggle("docs-en", language === "en");
    document.documentElement.lang = language;
    languageButtons.forEach(function (button) {
      button.classList.toggle("active", button.getAttribute("data-doc-lang") === language);
    });
    try { localStorage.setItem("nx8v-doc-lang", language); } catch (error) { /* private mode */ }
  }
  languageButtons.forEach(function (button) {
    button.addEventListener("click", function () { setLanguage(button.getAttribute("data-doc-lang")); });
  });
  var requested = new URLSearchParams(window.location.search).get("lang");
  var stored = null;
  try { stored = localStorage.getItem("nx8v-doc-lang"); } catch (error) { /* private mode */ }
  setLanguage(requested || stored || "id");

  var links = Array.prototype.slice.call(document.querySelectorAll('.toc a[href^="#"]'));
  var map = {};
  links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
  function activate(id) {
    links.forEach(function (a) { a.classList.remove("on"); });
    var active = map[id];
    if (!active) return;
    active.classList.add("on");
    var group = active.closest(".toc-group");
    if (group) group.classList.add("seen");
  }
  if (!("IntersectionObserver" in window)) {
    activate(links.length ? links[0].getAttribute("href").slice(1) : "");
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) { if (entry.isIntersecting) activate(entry.target.id); });
  }, { rootMargin: "-88px 0px -65% 0px" });
  Object.keys(map).forEach(function (id) {
    var element = document.getElementById(id);
    if (element) io.observe(element);
  });
})();
