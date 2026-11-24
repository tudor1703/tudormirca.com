/* ==========================================================================
   16voci16zile/expozitie.js — PAGINA EXPOZIȚIEI

   Citește conținutul din date.js și construiește pagina: cele 16 zile ca
   bare de voce, peretele cu voci, vocile cu poveștile lor, echipa și
   liniile de sprijin. Pentru conținut nu ai nevoie de acest fișier.
   ========================================================================== */

"use strict";

(function () {
  const E = typeof EXPOZITIE !== "undefined" ? EXPOZITIE : {};
  const voci = Array.isArray(E.voci) ? E.voci : [];
  const departamente = Array.isArray(E.departamente) ? E.departamente : [];
  const echipa = Array.isArray(E.echipa) ? E.echipa : [];

  const html = document.documentElement;
  const miscareRedusa = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const douaCifre = (n) => String(n).padStart(2, "0");
  const limita = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  function escapa(v) {
    const m = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return String(v == null ? "" : v).replace(/[&<>"']/g, (c) => m[c]);
  }
  const iconita = (id) => `<svg aria-hidden="true"><use href="#${id}"></use></svg>`;

  /* ---------- texte simple ---------- */
  $("#hero-campanie").innerHTML = `<strong>${escapa(E.campanie || "")}</strong> · ${escapa(E.perioadaCampaniei || "")}`;
  const lansare = E.lansare || {};
  $("#hero-autori").textContent = `${E.autori || ""}. Lansarea: ${lansare.data || ""}, ${lansare.loc || ""}.`;
  $("#subsol-autori").textContent = `${E.autori || ""} · ${E.facultate || ""}`;
  $("#subsol-coordonatori").innerHTML = (E.coordonatori || []).map((c) => `<li>${escapa(c)}</li>`).join("");
  $("#subsol-lansare").textContent = `${lansare.data || ""} · ${lansare.loc || ""}, ${lansare.oras || ""}`;

  const concept = E.concept || {};
  $("#titlu-concept").textContent = concept.titlu || "";
  $("#concept-text").innerHTML = (concept.text || []).map((p) => `<p>${escapa(p)}</p>`).join("");

  $("#cifre").innerHTML = (E.cifre || [])
    .map((c) => (c.valoare === "voci" ? { ...c, valoare: voci.length } : c))
    .map((c) =>
      // Numerele cresc la scroll; un text (ex: „PM266”) apare așa cum e
      isNaN(Number(c.valoare))
        ? `<li><strong class="cifre__text">${escapa(c.valoare)}</strong><span>${escapa(c.eticheta)}</span></li>`
        : `<li><strong data-numar="${Number(c.valoare) || 0}" data-sufix="${escapa(c.sufix || "")}">${miscareRedusa ? escapa(c.valoare + (c.sufix || "")) : "0"}</strong><span>${escapa(c.eticheta)}</span></li>`
    )
    .join("");

  /* ---------- cele 16 zile: 25.11 → 10.12, fiecare o bară de voce ---------- */
  const zile = [];
  for (let i = 0; i < 16; i += 1) {
    const d = new Date(2026, 10, 25 + i);
    zile.push(`${douaCifre(d.getDate())}.${douaCifre(d.getMonth() + 1)}`);
  }
  const indexLansare = zile.indexOf(lansare.zi);
  $("#zile").innerHTML = zile
    .map(
      (z, i) => `<div class="zi${i === indexLansare ? " zi--lansare" : ""}" title="Ziua ${i + 1} · ${z}">
        <span class="zi__bara"></span><span class="zi__data">${z}</span></div>`
    )
    .join("");
  if (indexLansare >= 0) {
    const nota = $("#zile-nota");
    nota.textContent = `Lansarea · ${lansare.loc || ""}`;
    nota.style.setProperty("--x", `${((indexLansare + 0.5) / 16) * 100}%`);
  }

  /* ---------- peretele cu voci (bandă care curge) ---------- */
  if (voci.length) {
    let rand = [];
    while (rand.length < 8) rand = rand.concat(voci);
    const grup = rand
      .map(
        (v, k) => `<a class="perete__voce" href="${escapa(v.slug)}/" ${k >= voci.length ? 'tabindex="-1" aria-hidden="true"' : ""}>
          ${v.fotoMica || v.foto ? `<img src="${escapa(v.fotoMica || v.foto)}" alt="" loading="lazy" width="760" height="1090">` : `<span class="gol" aria-hidden="true"><span class="gol__nr">${voci.indexOf(v) + 1}</span></span>`}
          <span class="perete__nume"><small>Vocea ${voci.indexOf(v) + 1}</small>${escapa(v.titlu)}</span></a>`
      )
      .join("");
    const pista = $("#perete");
    pista.style.setProperty("--durata", `${rand.length * 7}s`);
    pista.innerHTML = `<div class="perete__grup">${grup}</div><div class="perete__grup" aria-hidden="true">${grup.replaceAll("<a ", '<a tabindex="-1" ')}</div>`;
  } else {
    $(".perete").remove();
  }

  /* ---------- vocile ---------- */
  // Cât timp fotografia lipsește, rămâne un loc gol cu numărul vocii
  const golFoto = (i) => `<div class="voce__cadru gol" role="img" aria-label="Fotografia va fi adăugată în curând">
            <span class="gol__nr" aria-hidden="true">${i + 1}</span>
            <span class="gol__text" aria-hidden="true">Fotografia vine în curând</span>
          </div>`;
  const alteLimbi = (v) =>
    (v.descriereEn ? `<p class="en" lang="en">${escapa(v.descriereEn)}</p>` : "");
  $("#lista-voci").innerHTML = voci
    .map(
      (v, i) => `
      <article class="voce" id="voce-${escapa(v.slug)}" aria-labelledby="titlu-${escapa(v.slug)}">
        <div class="voce__foto" data-apare>
          ${v.oglinda && window.Oglinda
            ? window.Oglinda.cadru(i + 1)
            : v.foto
            ? `<button class="voce__cadru" type="button" data-poster="${i}" aria-label="Vezi posterul ${escapa(v.titlu)}">
            <img src="${escapa(v.foto)}" srcset="${escapa(v.fotoMica || v.foto)} 760w, ${escapa(v.foto)} 1400w" sizes="(max-width: 760px) 92vw, 46vw" alt="${escapa(v.alt || "")}" loading="lazy" width="1400" height="2008">
          </button>`
            : golFoto(i)}
        </div>
        <div class="voce__text" data-apare>
          <h3 class="voce__titlu negru" id="titlu-${escapa(v.slug)}">${escapa(v.titlu)}</h3>
          <p class="voce__ro">${escapa(v.titluRo || "")}</p>
          ${v.etichete ? `<p class="voce__etichete">${escapa(v.etichete)}</p>` : ""}
          <div class="blocuri">
            <div class="bloc"><span class="bloc__nr">01</span><div><h3>Ce este</h3><p>${escapa(v.descriere)}</p>${alteLimbi(v)}</div></div>
            <div class="bloc bloc--accent"><span class="bloc__nr">02</span><div><h3>Ce poate lăsa violența în urmă</h3><p>${escapa(v.efect)}</p></div></div>
            <div class="bloc"><span class="bloc__nr">03</span><div><h3>De ce contează</h3><p>${escapa(v.relevanta)}</p></div></div>
          </div>
          <div class="voce__actiuni">
            <a class="buton" href="${escapa(v.slug)}/">${iconita("i-qr")} Pagina vocii</a>
            ${v.poster || v.foto ? `<button class="buton buton--gol" type="button" data-poster="${i}">Vezi posterul</button>` : ""}
          </div>
        </div>
      </article>`
    )
    .join("");

  // Vocea-oglindă: camera pornește doar la cerere, după termeni
  if (window.Oglinda) voci.forEach((v) => v.oglinda && window.Oglinda.leaga(document.querySelector(`#voce-${v.slug} [data-oglinda]`), v.titlu, false));

  /* ---------- fereastra cu posterul întreg ---------- */
  const fereastra = $("#fereastra");
  const imgFereastra = $("#fereastra-img");
  let lenis = null;
  document.addEventListener("click", (e) => {
    const buton = e.target.closest("[data-poster]");
    if (!buton) return;
    const v = voci[Number(buton.dataset.poster)];
    if (!v) return;
    imgFereastra.src = v.foto || v.poster; // doar fotografia, fără textul de pe poster
    imgFereastra.alt = `Posterul ${v.titlu}: ${v.descriere}`;
    if (typeof fereastra.showModal === "function") fereastra.showModal();
    if (lenis) lenis.stop();
  });
  $("#fereastra-inchide").addEventListener("click", () => fereastra.close());
  fereastra.addEventListener("click", (e) => {
    if (e.target === fereastra) fereastra.close();
  });
  fereastra.addEventListener("close", () => {
    if (lenis) lenis.start();
  });

  /* ---------- echipa: toți într-o grilă, departamentele doar ca listă ---------- */
  const studentiPlan = departamente.reduce((s, d) => s + (Number(d.studenti) || 0), 0);
  const studenti = Number(E.studenti) || studentiPlan;
  const grupa = E.grupa ? `grupa ${E.grupa}` : "grupă";
  $("#echipa-intro").textContent = `${studenti} de studenți din ${grupa}, în ${departamente.length} departamente: de la cercetare și concept până la fotografie, design și promovare.`;
  $("#dep-lista").innerHTML = departamente.map((d) => `<li>${escapa(d.nume)}</li>`).join("");

  const silueta = `<svg viewBox="0 0 100 100" aria-hidden="true"><use href="#i-om"></use></svg>`;
  const libere = Math.max(0, studenti - echipa.length);
  $("#echipa-grila").innerHTML =
    echipa
      .map(
        (m) => `<li class="om">
          <div class="om__foto">${m.foto ? `<img src="${escapa(m.foto)}" alt="${escapa(m.nume || "Membru al echipei")}" loading="lazy">` : silueta}</div>
          ${m.nume ? `<p class="om__nume">${escapa(m.nume)}</p>` : ""}
          ${m.rol ? `<p class="om__rol">${escapa(m.rol)}</p>` : ""}</li>`
      )
      .join("") +
    Array.from({ length: libere }, () => `<li class="om om--liber" aria-hidden="true"><div class="om__foto">${silueta}</div></li>`).join("");

  /* ---------- sprijin ---------- */
  $("#linii").innerHTML = (E.sprijin || [])
    .map(
      (l) => `<li>
        <p class="linie__nume">${escapa(l.nume)}</p>
        <a class="linie__numar" href="tel:${escapa(l.tel || l.numar)}">${escapa(l.numar)}</a>
        <p class="linie__detalii">${escapa(l.detalii || "")}</p></li>`
    )
    .join("");

  /* ---------- declarația: cuvinte separate ---------- */
  const declaratie = $("#declaratie");
  const cuvinte = declaratie.textContent.trim().split(/\s+/);
  declaratie.innerHTML = cuvinte
    .map((c, i) => `<span class="cuvant${i >= cuvinte.length - 3 ? " oranj" : ""}">${escapa(c)}</span>`)
    .join(" ");
  const spanuri = $$("#declaratie .cuvant");

  /* ---------- titlul cât lățimea paginii ---------- */
  const titlu = $("#titlu");
  function potrivesteTitlul() {
    titlu.style.fontSize = "";
    const latime = titlu.clientWidth;
    const randuri = $$("#titlu .rand > span");
    const maxim = Math.max(...randuri.map((r) => r.scrollWidth));
    if (!maxim) return;
    const marime = parseFloat(getComputedStyle(titlu).fontSize);
    titlu.style.fontSize = `${marime * (latime / maxim) * 0.995}px`;
  }
  $$("#titlu .rand > span").forEach((r) => (r.style.display = "inline-block"));
  potrivesteTitlul();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(potrivesteTitlul);
  window.addEventListener("resize", potrivesteTitlul);

  /* ---------- titlurile vocilor: niciodată mai late decât coloana ---------- */
  function potrivesteVocile() {
    document.querySelectorAll(".voce__titlu").forEach((el) => {
      el.style.fontSize = "";
      const r = document.createRange();
      r.selectNodeContents(el);
      const lat = r.getBoundingClientRect().width;
      if (lat > el.clientWidth) el.style.fontSize = `${parseFloat(getComputedStyle(el).fontSize) * (el.clientWidth / lat) * 0.99}px`;
    });
  }
  potrivesteVocile();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(potrivesteVocile);
  window.addEventListener("resize", potrivesteVocile);

  /* ---------- scroll lin ---------- */
  if (!miscareRedusa && typeof Lenis === "function") {
    lenis = new Lenis({ lerp: 0.1, anchors: { offset: -64 } });
    const cadru = (t) => {
      lenis.raf(t);
      requestAnimationFrame(cadru);
    };
    requestAnimationFrame(cadru);
  }

  /* ---------- apariții ---------- */
  requestAnimationFrame(() => requestAnimationFrame(() => html.classList.add("gata")));
  const apare = $$("[data-apare]");
  if ("IntersectionObserver" in window && !miscareRedusa) {
    const obs = new IntersectionObserver(
      (intrari) =>
        intrari.forEach((i) => {
          if (!i.isIntersecting) return;
          i.target.classList.add("vizibil");
          obs.unobserve(i.target);
        }),
      { rootMargin: "0px 0px -8% 0px" }
    );
    apare.forEach((el) => obs.observe(el));
  } else apare.forEach((el) => el.classList.add("vizibil"));

  /* ---------- cifrele care cresc ---------- */
  const cifre = $$("#cifre strong[data-numar]");
  let cifreCrescute = miscareRedusa;
  function cresteCifrele() {
    cifreCrescute = true;
    const start = performance.now();
    (function pas(acum) {
      const p = limita((acum - start) / 1400);
      const u = 1 - Math.pow(1 - p, 4);
      cifre.forEach((c) => {
        c.textContent = Math.round(Number(c.dataset.numar) * u) + (p >= 1 ? c.dataset.sufix : "");
      });
      if (p < 1) requestAnimationFrame(pas);
    })(start);
  }

  /* ---------- la scroll: bara, declarația, cifrele ---------- */
  const bara = $("#bara");
  function laScroll() {
    const vh = window.innerHeight;
    bara.classList.toggle("bara--derulat", window.scrollY > 10);
    const r = declaratie.getBoundingClientRect();
    const p = limita((vh * 0.82 - r.top) / (r.height + vh * 0.3));
    const aprinse = Math.round(p * spanuri.length);
    spanuri.forEach((s, i) => s.classList.toggle("aprins", miscareRedusa || i < aprinse));
    if (!cifreCrescute) {
      const rc = $("#cifre").getBoundingClientRect();
      if (rc.top < vh * 0.85) cresteCifrele();
    }
  }
  let programat = false;
  const programeaza = () => {
    if (programat) return;
    programat = true;
    requestAnimationFrame(() => {
      programat = false;
      laScroll();
    });
  };
  window.addEventListener("scroll", programeaza, { passive: true });
  if (lenis) lenis.on("scroll", programeaza);
  window.addEventListener("resize", programeaza);
  laScroll();

  /* ---------- cele 16 bare „vorbesc”; cursorul le ridică ---------- */
  const bare = $$(".zi__bara");
  const zona = $("#zile");
  let cursorX = null;
  zona.addEventListener("pointermove", (e) => {
    const r = zona.getBoundingClientRect();
    cursorX = (e.clientX - r.left) / r.width;
  });
  zona.addEventListener("pointerleave", () => (cursorX = null));

  function nivel(i, t) {
    const voce = 0.5 + 0.5 * Math.sin(t * 1.7 + i * 0.83) * Math.cos(t * 0.61 + i * 1.37);
    const respiratie = 0.5 + 0.5 * Math.sin(t * 0.45 + i * 0.4);
    let v = 0.16 + 0.62 * voce * (0.55 + 0.45 * respiratie);
    if (i === indexLansare) v = Math.max(v, 0.82 + 0.1 * Math.sin(t * 2.1));
    if (cursorX != null) {
      const d = cursorX - (i + 0.5) / 16;
      v += 0.6 * Math.exp(-(d * d) / 0.006);
    }
    return limita(v, 0.06, 1);
  }

  if (miscareRedusa) bare.forEach((b, i) => b.style.setProperty("--v", nivel(i, 1.2).toFixed(3)));
  else {
    let cadruZile = 0;
    const t0 = performance.now();
    const misca = (acum) => {
      const t = (acum - t0) / 1000;
      bare.forEach((b, i) => b.style.setProperty("--v", nivel(i, t).toFixed(3)));
      cadruZile = requestAnimationFrame(misca);
    };
    // rulează doar cât timp se vede
    if ("IntersectionObserver" in window)
      new IntersectionObserver(([i]) => {
        if (i.isIntersecting && !cadruZile) cadruZile = requestAnimationFrame(misca);
        else if (!i.isIntersecting) {
          cancelAnimationFrame(cadruZile);
          cadruZile = 0;
        }
      }).observe(zona);
    else cadruZile = requestAnimationFrame(misca);
  }
})();
