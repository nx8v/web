(function () {
  "use strict";

  var langButtons = document.querySelectorAll("[data-lang]");
  var translatable = document.querySelectorAll("[data-id][data-en]");
  var menuButton = document.getElementById("menuButton");
  var siteNav = document.getElementById("siteNav");

  function setLanguage(language) {
    var value = language === "en" ? "en" : "id";
    translatable.forEach(function (element) {
      element.innerHTML = element.getAttribute(value === "en" ? "data-en" : "data-id");
    });
    langButtons.forEach(function (button) {
      button.classList.toggle("active", button.getAttribute("data-lang") === value);
    });
    document.documentElement.lang = value;
    try { localStorage.setItem("nx8v-lang", value); } catch (error) { /* private mode */ }
  }

  langButtons.forEach(function (button) {
    button.addEventListener("click", function () { setLanguage(button.getAttribute("data-lang")); });
  });

  if (menuButton && siteNav) {
    menuButton.addEventListener("click", function () {
      var open = siteNav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(open));
    });
    siteNav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        siteNav.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
      }
    });
  }

  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries, itemObserver) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          itemObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (element) { observer.observe(element); });
  } else {
    reveals.forEach(function (element) { element.classList.add("visible"); });
  }

  var moduleItems = document.querySelectorAll(".module-item");
  moduleItems.forEach(function (item) {
    item.addEventListener("click", function () {
      moduleItems.forEach(function (other) { other.classList.remove("active"); });
      item.classList.add("active");
    });
  });

  var savedLanguage = "id";
  try { savedLanguage = localStorage.getItem("nx8v-lang") || "id"; } catch (error) { /* private mode */ }
  setLanguage(savedLanguage);
})();
