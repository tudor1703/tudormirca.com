/* ==========================================================================
   16voci16zile/tema.js — TEMA LUMINOASĂ / ÎNTUNECATĂ

   Se încarcă în <head>, înaintea paginii, ca tema aleasă să apară de la
   început, fără să clipească. Butonul [data-tema-buton] din bara de sus
   schimbă tema; alegerea rămâne ținută minte în browser.
   Tema întunecată nu are oranj: accentul ei e mov (vezi stil.css, „Tema întunecată”).
   ========================================================================== */

(function () {
  "use strict";

  var CHEIE = "tema-16voci";
  var radacina = document.documentElement;

  function citeste() {
    try { return localStorage.getItem(CHEIE); } catch (e) { return null; }
  }

  function scrie(tema) {
    try { localStorage.setItem(CHEIE, tema); } catch (e) { /* fără memorie: tema ține până la închiderea paginii */ }
  }

  function aplica(tema) {
    var intunecat = tema === "intunecat";
    if (intunecat) radacina.setAttribute("data-tema", "intunecat");
    else radacina.removeAttribute("data-tema");

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", intunecat ? "#0b0b0b" : "#ffffff");

    var butoane = document.querySelectorAll("[data-tema-buton]");
    for (var i = 0; i < butoane.length; i++) butoane[i].setAttribute("aria-pressed", intunecat ? "true" : "false");
  }

  // Implicit, tema luminoasă; cea întunecată doar dacă vizitatorul a ales-o
  aplica(citeste() === "intunecat" ? "intunecat" : "luminos");

  document.addEventListener("DOMContentLoaded", function () {
    aplica(radacina.getAttribute("data-tema") === "intunecat" ? "intunecat" : "luminos");
  });

  document.addEventListener("click", function (e) {
    var buton = e.target && e.target.closest ? e.target.closest("[data-tema-buton]") : null;
    if (!buton) return;
    var noua = radacina.getAttribute("data-tema") === "intunecat" ? "luminos" : "intunecat";
    aplica(noua);
    scrie(noua);
  });
})();
