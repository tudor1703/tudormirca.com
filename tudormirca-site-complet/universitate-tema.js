/* ==========================================================================
   universitate-tema.js — MIȘCAREA PAGINII UNIVERSITATE

   - scrollul lin (Lenis, în vendor/), oprit cât rulează intro-ul
   - antetul se întărește la scroll
   - secțiunile și cardurile apar lin la scroll

   Se încarcă după universitate.js, ca tot conținutul să fie deja în pagină.
   ========================================================================== */

"use strict";

(function () {
  const html = document.documentElement;
  const miscareRedusa = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Scrollul lin ------------------------------------------------ */
  // Zonele cu scroll propriu (panoul din dreapta, fereastra de jos) își
  // păstrează scrollul lor, fără să miște pagina
  document.querySelectorAll(".panou, .sheet, .sheet__corp").forEach((zona) => zona.setAttribute("data-lenis-prevent", ""));

  if (!miscareRedusa && typeof window.Lenis === "function") {
    const lenis = new window.Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      autoRaf: true,
      allowNestedScroll: true,
      anchors: { offset: -110 },
    });

    if (html.classList.contains("intro-activ")) {
      lenis.stop();
      window.addEventListener("intro:deschis", () => lenis.start(), { once: true });
    }

    // Cât e deschisă fereastra de jos, pagina din spate nu se mișcă
    document.querySelectorAll("dialog").forEach((fereastra) => {
      new MutationObserver(() => (fereastra.open ? lenis.stop() : lenis.start())).observe(fereastra, {
        attributes: true,
        attributeFilter: ["open"],
      });
    });
  }

  /* ---------- Antetul ----------------------------------------------------- */
  const antet = document.querySelector(".antet");
  if (antet) {
    const verifica = () => antet.classList.toggle("antet--derulat", window.scrollY > 8);
    window.addEventListener("scroll", verifica, { passive: true });
    verifica();
  }

  /* ---------- Apariția la scroll ------------------------------------------ */
  if (miscareRedusa || !("IntersectionObserver" in window)) return;
  html.classList.add("js-tema");

  const elemente = document.querySelectorAll(
    ".sectiune:not(.sectiune--monitor) .sectiune__antet, .grila > li, .grila-materiale > *, .parcurs, .subsol__grila > div, .subsol__final"
  );
  const observator = new IntersectionObserver(
    (intrari) =>
      intrari.forEach((intrare) => {
        if (!intrare.isIntersecting) return;
        intrare.target.classList.add("vizibil");
        observator.unobserve(intrare.target);
        // După animație scoatem atributul, ca filtrele și hover-ul să fie instant
        setTimeout(() => intrare.target.removeAttribute("data-apare"), 1500);
      }),
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );

  elemente.forEach((element) => {
    const frati = Array.from(element.parentElement.children);
    element.style.setProperty("--i", Math.min(frati.indexOf(element) % 6, 5));
    element.setAttribute("data-apare", "");
    observator.observe(element);
  });
})();
