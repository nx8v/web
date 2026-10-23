// Panduan NX8V — scrollspy daftar isi
(function () {
  "use strict";
  var links = Array.prototype.slice.call(document.querySelectorAll('.toc a[href^="#"]'));
  var map = {};
  links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });

  function activate(id) {
    links.forEach(function (a) { a.classList.remove("on"); });
    var a = map[id];
    if (a) {
      a.classList.add("on");
      var group = a.closest(".toc-group");
      if (group) group.classList.add("seen");
    }
  }

  if (!("IntersectionObserver" in window)) return mapped_top();
  function mapped_top() {
    activate(links.length ? links[0].getAttribute("href").slice(1) : "");
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) activate(en.target.id);
    });
  }, { rootMargin: "-72px 0px -65% 0px" });

  Object.keys(map).forEach(function (id) {
    var el = document.getElementById(id);
    if (el) io.observe(el);
  });
})();
