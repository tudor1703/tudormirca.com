/* ==========================================================================
   efecte.js — DOAR ASPECT: banda cu componente și apariția la derulare.
   Nu atinge modelul 3D și nici bara de progres (acelea sunt în pagina.js).
   ========================================================================== */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const faraMiscare = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 1. Banda: numele componentelor, ca o peliculă care rulează
  const pista = $("#banda-pista");
  if (pista && typeof COMPONENTE !== "undefined") {
    const bucata = COMPONENTE.map((c, i) =>
      `<span><b>${String(i + 1).padStart(2, "0")}</b>${c.nume}</span>`).join("");
    pista.innerHTML = `<div>${bucata}</div><div>${bucata}</div>`;
  }

  // 2. Apariția la derulare (grupe de elemente, cu mică întârziere între ele)
  const grupe = [
    ".sectiune__antet",
    ".grila--carduri > li",
    ".tabel-clipuri__rand",
    ".nota",
    ".config-card",
    ".secventa__pasi li",
    "#btn-imagine-2",
    ".termeni > div",
    ".intrebari details",
    ".subsol__grila > *",
  ];
  const tinte = [];
  grupe.forEach(sel => {
    $$(sel).forEach((el, i) => {
      el.classList.add("apare");
      el.style.setProperty("--intarziere", `${Math.min(i, 8) * 60}ms`);
      tinte.push(el);
    });
  });

  if (faraMiscare || !("IntersectionObserver" in window)) {
    tinte.forEach(el => el.classList.add("apare--da"));
  } else {
    const obs = new IntersectionObserver(intrari => {
      intrari.forEach(x => {
        if (x.isIntersecting) { x.target.classList.add("apare--da"); obs.unobserve(x.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    tinte.forEach(el => obs.observe(el));
  }

  // 3. Titlurile mari se „desfac” ușor pe măsură ce secțiunea intră în ecran
  const titluri = $$(".sectiune__antet h2, .subsol__titlu");
  if (!faraMiscare && titluri.length) {
    let asteapta = false;
    const actualizeaza = () => {
      asteapta = false;
      const h = window.innerHeight;
      titluri.forEach(t => {
        const r = t.getBoundingClientRect();
        const p = Math.max(0, Math.min(1, (h - r.top) / (h * 0.55)));
        t.style.setProperty("--desfacere", p.toFixed(3));
      });
    };
    window.addEventListener("scroll", () => {
      if (!asteapta) { asteapta = true; requestAnimationFrame(actualizeaza); }
    }, { passive: true });
    actualizeaza();
  }
})();
