/* ==========================================================================
   16voci16zile/voce.js — PAGINA UNEI VOCI (aici duce codul QR)

   Află vocea din adresă (/16voci16zile/<slug>/ sau ?v=<slug>) și arată
   doar fotografia și povestea ei, plus linia de sprijin.
   ========================================================================== */

"use strict";

(function () {
  const E = typeof EXPOZITIE !== "undefined" ? EXPOZITIE : {};
  const voci = Array.isArray(E.voci) ? E.voci : [];
  const $ = (s) => document.querySelector(s);
  const douaCifre = (n) => String(n).padStart(2, "0");

  function escapa(v) {
    const m = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return String(v == null ? "" : v).replace(/[&<>"']/g, (c) => m[c]);
  }

  // Slug-ul: din ?v=..., altfel din ultimul segment al adresei
  const parametru = new URLSearchParams(location.search).get("v");
  const segmente = location.pathname.split("/").filter(Boolean);
  const dinAdresa = segmente[segmente.length - 1] === "index.html" ? segmente[segmente.length - 2] : segmente[segmente.length - 1];
  // Paginile făcute de build_16voci.py au vocea scrisă în <html data-voce="...">
  const slug = String(parametru || document.documentElement.dataset.voce || dinAdresa || "").toLowerCase();
  const index = voci.findIndex((v) => v.slug === slug || (Array.isArray(v.alias) && v.alias.includes(slug)));
  const v = voci[index];

  const radacina = "../"; // imaginile din date.js sunt relative la /16voci16zile/
  const cale = (p) => (/^(https?:|\/|data:)/.test(p || "") ? p : radacina + (p || ""));
  const main = $("#voce");

  $("#subsol").textContent = `Expoziția „${E.titlu || "16 Zile. 16 Voci."}” · ${E.autori || ""} · ${E.facultate || ""}`;

  if (!v) {
    document.title = "Vocea nu a fost găsită — 16 Zile. 16 Voci.";
    main.innerHTML = `<section class="negasit">
      <h1 class="negru">Vocea nu e aici.</h1>
      <p>Poate codul QR a fost scanat greșit sau vocea încă nu a fost adăugată. Le găsești pe toate pe pagina expoziției.</p>
      <a class="buton" href="${radacina}">Toată expoziția</a></section>`;
    return;
  }

  document.title = `${v.titlu} — 16 Zile. 16 Voci.`;
  $("#pozitie").textContent = `Vocea ${douaCifre(index + 1)} / ${douaCifre(voci.length)}`;

  const sprijin = (E.sprijin || [])[0];
  const anterior = voci[(index - 1 + voci.length) % voci.length];
  const urmator = voci[(index + 1) % voci.length];

  main.innerHTML = `
    <article class="voce-pagina" aria-labelledby="titlu-voce">
      <div class="voce__foto">
        ${v.foto
          ? `<figure class="voce__cadru">
          <img src="${escapa(cale(v.foto))}" srcset="${escapa(cale(v.fotoMica || v.foto))} 760w, ${escapa(cale(v.foto))} 1400w" sizes="(max-width: 760px) 94vw, 46vw" alt="${escapa(v.alt || "")}" width="1400" height="2008" fetchpriority="high">
          <span class="voce__index">${douaCifre(index + 1)}</span>
        </figure>`
          : `<div class="voce__cadru gol" role="img" aria-label="Fotografia va fi adăugată în curând">
          <span class="gol__nr" aria-hidden="true">${douaCifre(index + 1)}</span>
          <span class="gol__text" aria-hidden="true">Fotografia vine în curând</span>
        </div>`}
      </div>
      <div class="voce__text">
        <h1 class="voce__titlu negru" id="titlu-voce">${escapa(v.titlu)}</h1>
        <p class="voce__ro">${escapa(v.titluRo || "")}</p>
        ${v.etichete ? `<p class="voce__etichete">${escapa(v.etichete)}</p>` : ""}
        <div class="blocuri">
          <div class="bloc"><span class="bloc__nr">01</span><div><h2 class="h3">Ce este</h2><p>${escapa(v.descriere)}</p>${v.descriereEn ? `<p class="en" lang="en">${escapa(v.descriereEn)}</p>` : ""}</div></div>
          <div class="bloc bloc--accent"><span class="bloc__nr">02</span><div><h2 class="h3">Ce poate lăsa violența în urmă</h2><p>${escapa(v.efect)}</p></div></div>
          <div class="bloc"><span class="bloc__nr">03</span><div><h2 class="h3">De ce contează în campanie</h2><p>${escapa(v.relevanta)}</p></div></div>
        </div>
        ${sprijin ? `<aside class="ajutor" aria-label="Sprijin">
          <p><strong>Ai nevoie să vorbești cu cineva?</strong> ${escapa(sprijin.nume)}. ${escapa(sprijin.detalii || "")}</p>
          <a href="tel:${escapa(sprijin.tel || sprijin.numar)}">${escapa(sprijin.numar)}</a>
        </aside>` : ""}
        ${voci.length > 1 ? `<nav class="voce-pagina__nav" aria-label="Alte voci">
          <a href="${radacina}${escapa(anterior.slug)}/">← Vocea anterioară<strong>${escapa(anterior.titlu)}</strong></a>
          <a href="${radacina}${escapa(urmator.slug)}/">Vocea următoare →<strong>${escapa(urmator.titlu)}</strong></a>
        </nav>` : ""}
      </div>
    </article>`;

  // Titlul mare nu iese niciodată din coloană, oricât de lung e cuvântul
  const titlu = document.getElementById("titlu-voce");
  function potriveste() {
    titlu.style.fontSize = "";
    const r = document.createRange();
    r.selectNodeContents(titlu);
    const lat = r.getBoundingClientRect().width;
    if (lat > titlu.clientWidth) titlu.style.fontSize = `${parseFloat(getComputedStyle(titlu).fontSize) * (titlu.clientWidth / lat) * 0.99}px`;
  }
  potriveste();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(potriveste);
  window.addEventListener("resize", potriveste);
})();
