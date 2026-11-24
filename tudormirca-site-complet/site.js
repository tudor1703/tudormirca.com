/* ==========================================================================
   site.js — LOGICA PAGINII PRINCIPALE

   Citește conținutul din data.js (sau din admin, prin _worker.js) și îl pune
   în pagină, apoi se ocupă de mișcare:
   - scrollul lin (Lenis, în vendor/)
   - intrarea în pagină după intro
   - apariția secțiunilor, perspectiva studioului, capul de redare
   - fereastra cu detaliile unei creații (în date: „proiecte”) sau ale unui certificat

   Pentru conținut nu ai nevoie de acest fișier: îl schimbi din /admin
   sau din data.js.
   ========================================================================== */

"use strict";

(function () {
  /* ------------------------------------------------------------------------
     1. DATE ȘI FUNCȚII AJUTĂTOARE
     ------------------------------------------------------------------------ */
  const DATE_SITE = typeof DATE !== "undefined" ? DATE : {};
  const FPS = Number(DATE_SITE.fps) || 25;
  const profil = DATE_SITE.profil || {};
  const linkuri = DATE_SITE.linkuri || {};
  const contact = DATE_SITE.contact || {};
  const skills = Array.isArray(DATE_SITE.skills) ? DATE_SITE.skills : [];
  const experienta = Array.isArray(DATE_SITE.experienta) ? DATE_SITE.experienta : [];
  const proiecte = Array.isArray(DATE_SITE.proiecte) ? DATE_SITE.proiecte : []; // „Creații de ale mele”
  const parcurs = Array.isArray(DATE_SITE.parcurs) ? DATE_SITE.parcurs : [];
  const cursuri = Array.isArray(DATE_SITE.cursuri) ? DATE_SITE.cursuri : [];
  const platforme = Array.isArray(DATE_SITE.platforme) ? DATE_SITE.platforme : [];
  // „Pe unde am lucrat” apare doar când data.js / adminul o cere și are ce arăta
  const arataExperienta = DATE_SITE.arataExperienta !== false && experienta.length > 0;
  const arataParcurs = parcurs.length + cursuri.length + platforme.length > 0;
  // Secvența de pe monitorul studioului (clipuri care pornesc odată cu capul de redare)
  const secventa = (Array.isArray(DATE_SITE.secventa) ? DATE_SITE.secventa : []).filter(
    (c) => c && typeof c.media === "string" && c.media.trim() && !c.media.includes("[DE COMPLETAT]")
  );
  const segmente = []; // pozițiile clipurilor pe timeline, completate în afiseazaHero
  const culori = Array.isArray(DATE_SITE.culoriCategorii) && DATE_SITE.culoriCategorii.length
    ? DATE_SITE.culoriCategorii
    : ["#38bdf8", "#a78bfa", "#34d399", "#f472b6", "#facc15", "#60a5fa", "#fb7185", "#a3e635"];

  const html = document.documentElement;
  const MARCAJ = "[DE COMPLETAT]";
  const miscareRedusa = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  function escapa(valoare) {
    const inlocuiri = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return String(valoare == null ? "" : valoare).replace(/[&<>"']/g, (c) => inlocuiri[c]);
  }

  // Textul pentru afișare: [DE COMPLETAT] apare ca o etichetă punctată
  function text(valoare) {
    return escapa(valoare).replaceAll(MARCAJ, `<mark class="de-completat">${MARCAJ}</mark>`);
  }

  const deCompletat = (valoare) => !valoare || String(valoare).includes(MARCAJ);
  const curat = (valoare) => String(valoare == null ? "" : valoare).replaceAll(MARCAJ, "").trim();
  const douaCifre = (n) => String(n).padStart(2, "0");

  function iconita(id) {
    return `<svg class="iconita" aria-hidden="true"><use href="#${id}"></use></svg>`;
  }

  // Un link care încă are [DE COMPLETAT] nu duce nicăieri: arată doar un mesaj
  function legatura(url, continut, clasa, atribute = "") {
    if (deCompletat(url)) return `<a class="${clasa}" href="#" data-de-completat ${atribute}>${continut}</a>`;
    const extern = /^https?:/.test(url) ? 'target="_blank" rel="noopener"' : "";
    return `<a class="${clasa}" href="${escapa(url)}" ${extern} ${atribute}>${continut}</a>`;
  }

  // Acordul numeralelor: 1 an, 2 ani, 20 de ani
  function numara(numar, singular, plural) {
    if (numar === 1) return `1 ${singular}`;
    const cuDe = numar >= 20 && (numar % 100 === 0 || numar % 100 >= 20);
    return `${numar} ${cuDe ? "de " : ""}${plural}`;
  }

  // Cadre → „00:02:14:08”
  function timecode(cadreTotal) {
    const cadre = Math.max(0, Math.round(cadreTotal));
    const secunde = Math.floor(cadre / FPS);
    return [Math.floor(secunde / 3600), Math.floor(secunde / 60) % 60, secunde % 60, cadre % FPS].map(douaCifre).join(":");
  }

  // „00:02:14:08 [DE COMPLETAT]” → secunde (sau null)
  function secundeDin(durata) {
    const potrivire = curat(durata).match(/^(\d{1,2}):(\d{2}):(\d{2})(?::(\d{2}))?$/);
    if (!potrivire) return null;
    const [, h, m, s, f] = potrivire.map(Number);
    return h * 3600 + m * 60 + s + (f || 0) / FPS;
  }

  // O undă audio desenată din linii. Aceeași „sămânță” dă mereu același desen.
  function unda(samanta, bare = 60, clasa = "unda") {
    let cale = "";
    for (let i = 0; i < bare; i += 1) {
      const h = 2 + Math.abs(Math.sin(i * 0.37 + samanta) * Math.cos(i * 0.11 + samanta * 2)) * 16;
      cale += `M${i * 2 + 1} ${(20 - h).toFixed(1)}V${(20 + h).toFixed(1)}`;
    }
    return `<svg class="${clasa}" viewBox="0 0 ${bare * 2} 40" preserveAspectRatio="none" aria-hidden="true"><path d="${cale}" stroke-width="1.2" stroke-linecap="round"/></svg>`;
  }

  // Cuvintele unui titlu, fiecare în „masca” lui, pentru animația de apariție
  function cuvinte(element, continut) {
    const curent = String(continut).trim();
    if (!curent) return;
    if (curent.includes(MARCAJ)) {
      element.innerHTML = text(curent);
      return;
    }
    element.innerHTML = curent
      .split(/\s+/)
      .map((cuvant, i) => `<span class="cuvant"><span class="cuvant__interior" style="--i:${i}">${escapa(cuvant)}</span></span>`)
      .join(" ");
  }

  function anunta(mesaj) {
    $("#anunt").textContent = mesaj;
  }

  let cronometruToast;
  function arataToast(mesaj) {
    const toast = $("#toast");
    toast.textContent = mesaj;
    anunta(mesaj);
    try {
      if (toast.matches(":popover-open")) toast.hidePopover();
      toast.showPopover();
    } catch (eroare) {
      return;
    }
    clearTimeout(cronometruToast);
    cronometruToast = setTimeout(() => toast.hidePopover(), 2600);
  }

  // Culoarea fiecărei categorii, în ordinea în care apar în proiecte
  const categorii = [];
  proiecte.forEach((proiect) => {
    const categorie = curat(proiect.categorie) || "Altele";
    if (!categorii.includes(categorie)) categorii.push(categorie);
  });
  const culoareCategorie = (categorie) => culori[Math.max(0, categorii.indexOf(curat(categorie) || "Altele")) % culori.length];

  const nume = curat(profil.nume) || "Tudor Mirca";

  /* ------------------------------------------------------------------------
     2. NAVIGAREA
     ------------------------------------------------------------------------ */
  const SECTIUNI = [
    { id: "despre", nume: "Despre" },
    { id: "skills", nume: "Skills" },
    { id: "creatii", nume: "Creații" },
    arataParcurs && { id: "parcurs", nume: "Parcurs" },
    arataExperienta && { id: "experienta", nume: "Experiență" },
    { id: "contact", nume: "Contact" },
  ].filter(Boolean);

  function afiseazaNavigare() {
    $("#marca-nume").textContent = nume;
    $("#nav-lista").innerHTML = SECTIUNI.map((s) => `<li><a class="nav__link" href="#${s.id}">${s.nume}</a></li>`).join("");
    $("#nav-mobil-lista").innerHTML = SECTIUNI.map(
      (s, i) => `<li><a href="#${s.id}"><span>${douaCifre(i + 1)}</span>${s.nume}</a></li>`
    ).join("");

    const buton = $("#nav-meniu");
    const panou = $("#nav-mobil");
    buton.addEventListener("click", () => {
      const deschis = buton.getAttribute("aria-expanded") === "true";
      buton.setAttribute("aria-expanded", String(!deschis));
      buton.setAttribute("aria-label", deschis ? "Deschide meniul" : "Închide meniul");
      panou.classList.toggle("nav-mobil--deschis", !deschis);
    });
  }

  function inchideMeniul() {
    $("#nav-meniu").setAttribute("aria-expanded", "false");
    $("#nav-meniu").setAttribute("aria-label", "Deschide meniul");
    $("#nav-mobil").classList.remove("nav-mobil--deschis");
  }

  /* ------------------------------------------------------------------------
     3. HERO ȘI STUDIOUL
     ------------------------------------------------------------------------ */
  function afiseazaHero() {
    document.title = `${nume} — Portofoliu`;
    $("#hero-insigna").textContent = `Portofoliu · ${new Date().getFullYear()}`;
    cuvinte($("#hero-titlu"), nume);
    $("#hero-rol").innerHTML = text(profil.rol || MARCAJ);
    $("#hero-descriere").innerHTML = text(profil.descriereScurta || "");

    // Numele fișierului de proiect din bara studioului
    const fisier = nume.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    $("#studio-fisier").textContent = `${fisier || "portofoliu"}.prproj`;
    $("#studio-info").textContent = `${FPS} fps · 16:9 · 4K`;

    // Bin-ul: proiectele, ca fișiere media
    const bin = proiecte.length
      ? proiecte.slice(0, 7).map((p) => `<li style="--culoare:${culoareCategorie(p.categorie)}"><i></i><span>${escapa(curat(p.titlu) || "Creație")}</span></li>`)
      : ["Showreel", "Interviu", "B-roll", "Muzică"].map((t, i) => `<li style="--culoare:${culori[i]}"><i></i><span>${t}</span></li>`);
    $("#studio-bin").innerHTML = bin.join("");

    // Monitorul: imaginea proprie sau lumina animată
    const { imagine = "", alt = "", video = "" } = profil.showreel || {};
    const ecran = $("#monitor-ecran");
    const imagineImplicita = !imagine || /(^|\/)assets\/showreel\.svg$/.test(imagine);
    ecran.insertAdjacentHTML(
      "afterbegin",
      imagineImplicita
        ? '<div class="aurora" aria-hidden="true"><i></i><i></i><i></i><i></i></div>'
        : `<img class="monitor__imagine" src="${escapa(imagine)}" alt="${escapa(alt)}" width="1920" height="1080">`
    );
    // Clipurile secvenței: la mărimea lor naturală, centrate, ca să nu-și piardă calitatea
    if (secventa.length) {
      ecran.classList.add("monitor__ecran--secventa");
      ecran.insertAdjacentHTML(
        "beforeend",
        `<div class="monitor__clipuri" aria-hidden="true">${secventa
          .map((c, i) =>
            /\.(mp4|webm|mov|m4v)([?#]|$)/i.test(curat(c.media)) || /^data:video\//i.test(c.media)
              ? `<video class="monitor__clip" data-clip="${i}" src="${escapa(curat(c.media))}" muted loop playsinline preload="auto"></video>`
              : `<img class="monitor__clip" data-clip="${i}" src="${escapa(curat(c.media))}" alt="">`
          )
          .join("")}</div>`
      );
      ecran.querySelectorAll(".monitor__clip").forEach((m) => {
        const marime = () => {
          const l = m.videoWidth || m.naturalWidth;
          const h = m.videoHeight || m.naturalHeight;
          if (!l || !h) return;
          m.style.setProperty("--l", l);
          m.style.setProperty("--h", h);
        };
        m.addEventListener(m.tagName === "VIDEO" ? "loadedmetadata" : "load", marime);
        marime();
      });
    }
    ecran.insertAdjacentHTML("beforeend", `<p class="monitor__titlu" aria-hidden="true"><small id="monitor-eticheta">Showreel</small><span class="monitor__nume">${escapa(nume)}</span></p>`);

    if (video && !deCompletat(video)) {
      const buton = $("#monitor-redare");
      buton.hidden = false;
      buton.addEventListener("click", () => {
        if (ecran.querySelector("video")) return;
        ecran.insertAdjacentHTML(
          "beforeend",
          `<video class="monitor__video" src="${escapa(video)}" ${imagineImplicita ? "" : `poster="${escapa(imagine)}"`} controls autoplay playsinline></video>`
        );
        buton.hidden = true;
      });
    }

    // Inspectorul: fișa scurtă
    const ani = Number(curat(profil.aniExperienta));
    const textAni = Number.isFinite(ani) && curat(profil.aniExperienta) !== "" ? numara(ani, "an", "ani") : text(profil.aniExperienta || MARCAJ);
    $("#studio-fisa").innerHTML = [
      ["Rol", text(profil.rol || MARCAJ)],
      ["Experiență", textAni],
      ["Creații", String(proiecte.length)],
      ["Skills", String(skills.length)],
    ]
      .map(([eticheta, valoare]) => `<div><dt>${eticheta}</dt><dd>${valoare}</dd></div>`)
      .join("");

    // Timeline-ul: clipurile secvenței (Acasă, Pe drum…), fiecare cât durează.
    // Fără secvență: creațiile, ca niște cadre fixe de 20 de secunde.
    const etichete = [];
    const culoareEticheta = (e) => {
      const k = curat(e) || "Clip";
      if (!etichete.includes(k)) etichete.push(k);
      return culori[etichete.indexOf(k) % culori.length];
    };
    const clipuri = secventa.length
      ? secventa.map((c) => ({ titlu: curat(c.eticheta) || "Clip", culoare: culoareEticheta(c.eticheta), durata: Number(c.secunde) > 0 ? Number(c.secunde) : 5 }))
      : proiecte.slice(0, 8).map((p) => ({ titlu: curat(p.titlu) || "Creație", culoare: culoareCategorie(p.categorie), durata: secundeDin(p.durata) || 20 }));
    const total = clipuri.reduce((suma, c) => suma + c.durata, 0) || 240;
    const minim = total * 0.08; // un clip foarte scurt rămâne totuși vizibil

    // Unde începe și unde se termină fiecare clip pe timeline (pentru capul de redare)
    let pozitie = 0;
    if (secventa.length)
      clipuri.forEach((c) => {
        const latime = Math.max(c.durata, minim);
        segmente.push({ eticheta: c.titlu, secunde: c.durata, inceput: pozitie, latime, sfarsit: pozitie + latime });
        pozitie += latime;
      });

    $("#timeline-v1").innerHTML = clipuri.length
      ? clipuri.map((c, i) => `<span class="timeline__clip" data-clip="${i}" style="--culoare:${c.culoare};--durata:${Math.max(c.durata, minim)}">${escapa(c.titlu)}</span>`).join("")
      : '<span class="timeline__clip timeline__clip--gol"></span>';
    $("#timeline-a1").innerHTML = (clipuri.length ? clipuri : [{ durata: 1 }])
      .map((c, i) => `<span class="timeline__clip" style="--durata:${Math.max(c.durata, minim)}">${unda(i * 1.7 + 0.5, 40, "")}</span>`)
      .join("");
    $("#timeline-rigla").innerHTML = [0, 0.25, 0.5, 0.75]
      .map((p) => `<span style="left:${p * 100}%">${timecode(total * p * FPS)}</span>`)
      .join("");

    return total;
  }

  /* ------------------------------------------------------------------------
     4. BANDA, DESPRE, SKILLS
     ------------------------------------------------------------------------ */
  function afiseazaBanda() {
    let nume_ = skills.map((s) => curat(s && s.nume)).filter(Boolean);
    if (!nume_.length) nume_ = ["Montaj video", "Color grading", "Sound design", "Motion"];
    let elemente = [...nume_];
    while (elemente.length < 10) elemente = elemente.concat(nume_);
    const grup = elemente
      .map((n, i) => `<span class="banda__element">${iconita(i % 2 ? "i-unda" : "i-film")}${escapa(n)}</span>`)
      .join("");
    const banda = $("#banda");
    banda.setAttribute("aria-hidden", "true");
    banda.innerHTML = `<div class="banda__pista" style="--durata-banda:${Math.max(30, elemente.length * 3.2)}s"><div class="banda__grup">${grup}</div><div class="banda__grup">${grup}</div></div>`;
  }

  function afiseazaDespre() {
    const randuri = Array.isArray(profil.despre) && profil.despre.length ? profil.despre : ["Salut!"];
    $("#subtitrari").innerHTML = randuri
      .map((rand, i) => `<li><span class="subtitrari__tc">${timecode((i * 3 + 1) * FPS)}</span><span class="subtitrari__text">${text(rand)}</span></li>`)
      .join("");

    const avatar = $("#avatar");
    avatar.src = profil.avatar || "assets/avatar.svg";
    avatar.alt = `Portret ${nume}`;
    $("#profil-nume").textContent = nume;

    const ani = Number(curat(profil.aniExperienta));
    const areAni = Number.isFinite(ani) && curat(profil.aniExperienta) !== "";
    $("#profil-fisa").innerHTML = [
      ["Rol", text(profil.rol || MARCAJ)],
      ["Experiență", areAni ? `${numara(ani, "an", "ani")} experiență` : text(profil.aniExperienta || MARCAJ)],
    ]
      .map(([e, v]) => `<div><dt>${e}</dt><dd>${v}</dd></div>`)
      .join("");

    $("#cifre").innerHTML = [
      [proiecte.length, proiecte.length === 1 ? "Creație" : "Creații"],
      [skills.length, "Skills"],
      [areAni ? ani : null, "Ani experiență"],
    ]
      .map(([valoare, eticheta]) => `<li><strong data-numar="${valoare == null ? "" : valoare}">${valoare == null ? "—" : 0}</strong><span>${eticheta}</span></li>`)
      .join("");

    $("#acum-lucrez").innerHTML = text(profil.acumLucrezLa || MARCAJ);
  }

  function retele() {
    const email = deCompletat(linkuri.email) ? linkuri.email : `mailto:${linkuri.email}`;
    return {
      email,
      lista: [
        { eticheta: "Instagram", iconita: "i-instagram", url: linkuri.instagram },
        { eticheta: "YouTube", iconita: "i-youtube", url: linkuri.youtube },
        { eticheta: "GitHub", iconita: "i-github", url: linkuri.github },
        { eticheta: "Email", iconita: "i-email", url: email },
      ],
      cv: { eticheta: "Descarcă CV", iconita: "i-descarca", url: profil.cv },
    };
  }

  function afiseazaRetele() {
    const { lista, cv } = retele();
    $("#retele").innerHTML =
      lista
        .map((r) => `<li>${legatura(r.url, iconita(r.iconita), "buton-rotund", `aria-label="${r.eticheta}" title="${r.eticheta}"`)}</li>`)
        .join("") + `<li>${legatura(cv.url, `${iconita(cv.iconita)} Descarcă CV`, "buton buton--sticla buton--mic", "download")}</li>`;
  }

  function afiseazaSkills() {
    $("#grila-skills").innerHTML = skills.length
      ? skills
          .map(
            (skill, i) => `
        <li data-apare>
          <article class="placa skill lumina-cursor">
            <div class="skill__antet">
              <span class="skill__numar">S${douaCifre(i + 1)}</span>
              <span class="skill__iconita">${iconita(i % 2 ? "i-unda" : "i-film")}</span>
            </div>
            <h3 class="skill__titlu">${text(skill.nume)}</h3>
            <p class="skill__detaliu">${text(skill.detaliu)}</p>
            ${unda(i * 2.3 + 1)}
          </article>
        </li>`
          )
          .join("")
      : '<li class="gol">Skill-urile se adaugă din admin.</li>';
  }

  /* ------------------------------------------------------------------------
     5. CREAȚII ȘI FEREASTRA DE DETALII
     ------------------------------------------------------------------------ */
  function afiseazaProiecte() {
    const lista = $("#lista-proiecte");
    if (!proiecte.length) {
      lista.innerHTML = '<li class="gol">Creațiile se adaugă din admin.</li>';
      return;
    }

    lista.innerHTML = proiecte
      .map((p, i) => {
        const categorie = curat(p.categorie) || "Altele";
        const durata = secundeDin(p.durata);
        return `
        <li class="proiect" data-apare data-categorie="${escapa(categorie)}">
          <button class="placa proiect__buton lumina-cursor" type="button" data-proiect="${i}" style="--culoare:${culoareCategorie(categorie)}">
            <span class="proiect__cadru">
              <img src="${escapa(p.imagine || "assets/placeholder.svg")}" alt="${escapa(p.alt || "")}" loading="lazy" width="1280" height="800">
              <span class="proiect__sageata">${iconita("i-sageata")}</span>
              ${durata != null ? `<span class="proiect__durata">${timecode(durata * FPS)}</span>` : ""}
            </span>
            <span class="proiect__date">
              <span class="proiect__meta"><i></i>${escapa(categorie)}${curat(p.data) ? ` · ${escapa(curat(p.data))}` : ""}</span>
              <span class="proiect__titlu" style="display:block">${text(p.titlu || "Creație")}</span>
              ${curat(p.descriere) ? `<span class="proiect__descriere">${text(p.descriere)}</span>` : ""}
            </span>
          </button>
        </li>`;
      })
      .join("");

    // Filtrele apar doar când există cel puțin două categorii
    if (categorii.length > 1) {
      const numar = (c) => proiecte.filter((p) => (curat(p.categorie) || "Altele") === c).length;
      $("#filtre").innerHTML =
        `<button class="filtru" type="button" aria-pressed="true" data-filtru="">Toate <span>${proiecte.length}</span></button>` +
        categorii
          .map((c) => `<button class="filtru" type="button" aria-pressed="false" data-filtru="${escapa(c)}" style="--culoare:${culoareCategorie(c)}"><i></i>${escapa(c)} <span>${numar(c)}</span></button>`)
          .join("");

      $("#filtre").addEventListener("click", (eveniment) => {
        const buton = eveniment.target.closest(".filtru");
        if (!buton) return;
        const ales = buton.dataset.filtru;
        $$(".filtru").forEach((b) => b.setAttribute("aria-pressed", String(b === buton)));
        $$(".proiect").forEach((element) => {
          const vizibil = !ales || element.dataset.categorie === ales;
          element.hidden = !vizibil;
          if (vizibil) element.classList.add("vizibil");
        });
        const afisate = $$(".proiect:not([hidden])").length;
        anunta(afisate === 1 ? "o creație afișată" : `${afisate} creații afișate`);
      });
    } else {
      $("#filtre").remove();
    }

    lista.addEventListener("click", (eveniment) => {
      const buton = eveniment.target.closest("[data-proiect]");
      if (buton) deschideProiect(Number(buton.dataset.proiect));
    });
  }

  let lenis = null;
  const fereastra = $("#fereastra");

  function deschideProiect(index) {
    const p = proiecte[index];
    if (!p) return;
    const categorie = curat(p.categorie) || "Altele";
    const durata = secundeDin(p.durata);
    const taguri = Array.isArray(p.taguri) ? p.taguri.filter((t) => curat(t)) : [];
    const butoane = Array.isArray(p.linkuri) ? p.linkuri : [];

    fereastra.classList.remove("fereastra--certificat");
    $("#fereastra-continut").innerHTML = `
      <div class="fereastra__cadru"><img src="${escapa(p.imagine || "assets/placeholder.svg")}" alt="${escapa(p.alt || "")}"></div>
      <div class="fereastra__corp" style="--culoare:${culoareCategorie(categorie)}">
        <span class="proiect__meta"><i></i>${escapa(categorie)}</span>
        <h3 id="fereastra-titlu">${text(p.titlu || "Creație")}</h3>
        ${p.descriere ? `<p>${text(p.descriere)}</p>` : ""}
        <dl class="fereastra__date">
          <div><dt>Categorie</dt><dd>${escapa(categorie)}</dd></div>
          <div><dt>Data</dt><dd>${text(p.data || "—")}</dd></div>
          ${String(p.durata || "").trim() ? `<div><dt>Durată</dt><dd>${durata != null ? timecode(durata * FPS) : text(p.durata)}</dd></div>` : ""}
        </dl>
        ${taguri.length ? `<ul class="taguri">${taguri.map((t) => `<li>${text(t)}</li>`).join("")}</ul>` : ""}
        ${butoane.length ? `<div class="fereastra__linkuri">${butoane
          .map((l, i) => legatura(l.url, `${text(l.text || "Deschide")} ${iconita("i-sageata")}`, `buton ${i ? "buton--sticla" : "buton--accent"} buton--mic`))
          .join("")}</div>` : ""}
      </div>`;

    if (typeof fereastra.showModal === "function") fereastra.showModal();
    else fereastra.setAttribute("open", "");
    if (lenis) lenis.stop();
  }

  function inchideProiect() {
    if (fereastra.open) fereastra.close();
  }

  $("#fereastra-inchide").addEventListener("click", inchideProiect);
  fereastra.addEventListener("click", (eveniment) => {
    if (eveniment.target === fereastra) inchideProiect(); // click pe fundal
  });
  fereastra.addEventListener("close", () => {
    if (lenis) lenis.start();
  });

  /* ------------------------------------------------------------------------
     6. PARCURS (studii, organizații, cursuri, platforme) ȘI EXPERIENȚĂ
     ------------------------------------------------------------------------ */
  const lista_ = (v) => (Array.isArray(v) ? v : typeof v === "string" && v ? [v] : []).filter((x) => curat(x) || deCompletat(x) && x);

  function taguri(eticheta, valori) {
    const v = lista_(valori);
    if (!v.length) return "";
    return `<div class="post__grup"><p class="post__grup-titlu">${eticheta}</p><ul class="taguri">${v.map((t) => `<li>${text(t)}</li>`).join("")}</ul></div>`;
  }

  // „https://www.usm.md/ceva” → „usm.md”
  const domeniu = (url) => curat(url).replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");

  function afiseazaParcurs() {
    const sectiune = $("#parcurs");
    if (!arataParcurs) {
      sectiune.hidden = true;
      return;
    }

    // Linia de timp: carduri de aceeași mărime, cu un rezumat și „Detalii”
    if (!parcurs.length) $("#parcurs-linie").hidden = true;
    $("#lista-parcurs").innerHTML = parcurs
      .map((e, i) => {
        const puncte = lista_(e.puncte).length;
        const skillsNr = lista_(e.softSkills).length + lista_(e.hardSkills).length;
        const rezumat = [
          puncte ? (puncte === 1 ? "1 realizare" : `${puncte} realizări`) : "",
          skillsNr ? (skillsNr === 1 ? "1 skill" : `${skillsNr} skills`) : "",
        ].filter(Boolean).join(" · ");
        return `
        <li class="placa post post--parcurs lumina-cursor" data-apare>
          <div class="post__lateral">
            <p class="post__perioada">${text(e.perioada || MARCAJ)}</p>
            ${curat(e.tip) ? `<span class="post__tip">${escapa(curat(e.tip))}</span>` : ""}
            ${curat(e.oras) ? `<p class="post__oras">${escapa(curat(e.oras))}</p>` : ""}
          </div>
          <div class="post__corp">
            <h3 class="post__rol">${text(e.nume || MARCAJ)}</h3>
            ${e.detalii ? `<p class="post__companie">${text(e.detalii)}</p>` : ""}
            ${e.descriere ? `<p class="post__descriere">${text(e.descriere)}</p>` : ""}
            <div class="post__subsol">
              <span class="post__rezumat">${rezumat}</span>
              <button class="buton buton--sticla buton--mic" type="button" data-parcurs="${i}" aria-label="Detalii: ${escapa(curat(e.nume))}">Detalii ${iconita("i-dreapta")}</button>
            </div>
          </div>
        </li>`;
      })
      .join("");

    // Cursurile și platformele, sub linia de timp, ca niște carduri egale
    const iconite = { instagram: "i-instagram", youtube: "i-youtube", github: "i-github" };
    const iconitaPlatforma = (pl) => iconite[String(pl.iconita || "").toLowerCase()] || "i-web";
    const carduri = [
      ...cursuri.map((c, i) => {
        const meta = [c.data, c.ore].filter((x) => curat(x)).map((x) => escapa(curat(x))).join(" · ");
        return `
        <li class="placa extra lumina-cursor" data-apare>
          <div class="extra__coperta extra__coperta--certificat">
            ${c.imagine
              ? `<img src="${escapa(c.imagine)}" alt="${escapa(c.alt || "")}" loading="lazy" width="640" height="324">`
              : `<span class="extra__iconita">${iconita("i-certificat")}</span>`}
          </div>
          <div class="extra__corp">
            <span class="post__tip">Curs · certificat</span>
            <h3 class="extra__titlu">${text(c.nume || MARCAJ)}</h3>
            ${c.organizator ? `<p class="extra__text">${text(c.organizator)}</p>` : ""}
            <div class="post__subsol">
              <span class="post__rezumat">${meta}</span>
              <button class="buton buton--sticla buton--mic" type="button" data-curs="${i}" aria-label="Detalii: ${escapa(curat(c.nume))}">Detalii ${iconita("i-dreapta")}</button>
            </div>
          </div>
        </li>`;
      }),
      ...platforme.map((pl, i) => `
        <li class="placa extra lumina-cursor" data-apare>
          <div class="extra__coperta extra__coperta--platforma">
            <span class="extra__iconita">${iconita(iconitaPlatforma(pl))}</span>
          </div>
          <div class="extra__corp">
            <span class="post__tip">Platformă${curat(pl.rol) ? ` · ${escapa(curat(pl.rol))}` : ""}</span>
            <h3 class="extra__titlu">${text(pl.nume || MARCAJ)}</h3>
            ${pl.descriere ? `<p class="extra__text">${text(pl.descriere)}</p>` : ""}
            <div class="post__subsol">
              <span class="post__rezumat">${deCompletat(pl.url) ? "" : escapa(domeniu(pl.url))}</span>
              <button class="buton buton--sticla buton--mic" type="button" data-platforma="${i}" aria-label="Detalii: ${escapa(curat(pl.nume))}">Detalii ${iconita("i-dreapta")}</button>
            </div>
          </div>
        </li>`),
    ];
    const lista = $("#parcurs-carduri");
    if (!carduri.length) lista.hidden = true;
    lista.innerHTML = carduri.join("");

    // Un singur ascultător pentru toate butoanele „Detalii” din secțiune
    sectiune.addEventListener("click", (eveniment) => {
      const buton = eveniment.target.closest("[data-parcurs], [data-curs], [data-platforma]");
      if (!buton) return;
      if (buton.dataset.parcurs != null) deschideParcurs(Number(buton.dataset.parcurs));
      else if (buton.dataset.curs != null) deschideCertificat(Number(buton.dataset.curs));
      else deschidePlatforma(Number(buton.dataset.platforma));
    });
  }

  // Fereastra comună: conținut nou, apoi o deschide și oprește scrollul din spate
  function deschideFereastra(html, certificat = false) {
    fereastra.classList.toggle("fereastra--certificat", certificat);
    $("#fereastra-continut").innerHTML = html;
    if (typeof fereastra.showModal === "function") fereastra.showModal();
    else fereastra.setAttribute("open", "");
    if (lenis) lenis.stop();
  }

  const randData = (eticheta, valoare) => (curat(valoare) || deCompletat(valoare) && valoare ? `<div><dt>${eticheta}</dt><dd>${text(valoare)}</dd></div>` : "");

  function deschideParcurs(index) {
    const e = parcurs[index];
    if (!e) return;
    const puncte = lista_(e.puncte);
    const organizatie = /organiza/i.test(curat(e.tip));
    deschideFereastra(`
      <div class="fereastra__corp" style="--culoare:var(--accent)">
        <span class="proiect__meta"><i></i>${escapa(curat(e.tip) || "Parcurs")}</span>
        <h3 id="fereastra-titlu">${text(e.nume || MARCAJ)}</h3>
        ${e.detalii ? `<p class="fereastra__subtitlu">${text(e.detalii)}</p>` : ""}
        ${e.descriere ? `<p>${text(e.descriere)}</p>` : ""}
        <dl class="fereastra__date">
          ${randData("Perioada", e.perioada)}
          ${randData("Oraș", e.oras)}
          ${randData("Tip", e.tip)}
        </dl>
        ${puncte.length ? `<div class="post__grup"><p class="post__grup-titlu">${organizatie ? "Ce fac" : "Realizări"}</p><ul class="post__puncte">${puncte.map((x) => `<li>${text(x)}</li>`).join("")}</ul></div>` : ""}
        ${taguri("Soft skills", e.softSkills)}
        ${taguri("Hard skills", e.hardSkills)}
        ${e.link ? `<div class="fereastra__linkuri">${legatura(e.link, `Site-ul oficial${deCompletat(e.link) ? "" : ` · ${escapa(domeniu(e.link))}`} ${iconita("i-sageata")}`, "buton buton--accent buton--mic")}</div>` : ""}
      </div>`);
  }

  function deschideCertificat(index) {
    const c = cursuri[index];
    if (!c) return;
    deschideFereastra(`
      ${c.imagine ? `<div class="fereastra__cadru"><img src="${escapa(c.imagine)}" alt="${escapa(c.alt || "")}"></div>` : ""}
      <div class="fereastra__corp" style="--culoare:var(--accent)">
        <span class="proiect__meta"><i></i>Curs · certificat</span>
        <h3 id="fereastra-titlu">${text(c.nume || MARCAJ)}</h3>
        ${c.descriere ? `<p>${text(c.descriere)}</p>` : ""}
        <dl class="fereastra__date">
          ${randData("Organizator", c.organizator)}
          ${randData("Data", c.data)}
          ${randData("Durată", c.ore)}
        </dl>
        ${c.link ? `<div class="fereastra__linkuri">${legatura(c.link, `Verifică certificatul ${iconita("i-sageata")}`, "buton buton--accent buton--mic")}</div>` : ""}
      </div>`, Boolean(c.imagine));
  }

  function deschidePlatforma(index) {
    const pl = platforme[index];
    if (!pl) return;
    deschideFereastra(`
      <div class="fereastra__corp" style="--culoare:var(--accent)">
        <span class="proiect__meta"><i></i>Platformă</span>
        <h3 id="fereastra-titlu">${text(pl.nume || MARCAJ)}</h3>
        ${pl.descriere ? `<p>${text(pl.descriere)}</p>` : ""}
        <dl class="fereastra__date">
          ${randData("Rolul meu", pl.rol)}
          ${randData("Adresă", deCompletat(pl.url) ? pl.url : domeniu(pl.url))}
        </dl>
        ${pl.url ? `<div class="fereastra__linkuri">${legatura(pl.url, `Deschide pagina ${iconita("i-sageata")}`, "buton buton--accent buton--mic")}</div>` : ""}
      </div>`);
  }

  function afiseazaExperienta() {
    if (!arataExperienta) {
      $("#experienta").hidden = true;
      return;
    }
    $("#timeline").innerHTML = experienta
      .map(
        (e) => `
        <li class="placa post lumina-cursor" data-apare>
          <p class="post__perioada">${text(e.perioada)}</p>
          <div>
            <h3 class="post__rol">${text(e.rol)}</h3>
            <p class="post__companie">${text(e.companie)}</p>
            <p class="post__descriere">${text(e.descriere)}</p>
          </div>
        </li>`
      )
      .join("");
  }

  /* ------------------------------------------------------------------------
     7. CONTACT ȘI FOOTER
     ------------------------------------------------------------------------ */
  function afiseazaContact() {
    const { email, lista, cv } = retele();
    $("#titlu-contact").innerHTML = text(contact.titlu || "Hai să lucrăm împreună");
    $("#contact-text").innerHTML = text(contact.text || "");
    $("#contact-butoane").innerHTML =
      legatura(email, `Scrie-mi un email ${iconita("i-dreapta")}`, "buton buton--accent") +
      lista
        .slice(0, 3)
        .map((r) => legatura(r.url, iconita(r.iconita), "buton-rotund", `aria-label="${r.eticheta}" title="${r.eticheta}"`))
        .join("");

    $("#subsol-nume").textContent = nume;
    $("#subsol-rol").innerHTML = text(profil.descriereScurta || profil.rol || "");
    $("#subsol-navigare").innerHTML =
      SECTIUNI.map((s) => `<li><a href="#${s.id}">${s.nume}</a></li>`).join("") +
      `<li><a href="universitate.html">Universitate</a></li>`;
    $("#subsol-retele").innerHTML = [...lista, cv]
      .map((r) => `<li>${legatura(r.url, `${iconita(r.iconita)}<span>${r.eticheta}</span>`, "", r === cv ? "download" : "")}</li>`)
      .join("");
    $("#an-curent").textContent = new Date().getFullYear();
    $("#subsol-copyright").textContent = nume;
    $("#tc-final").textContent = timecode(60 * FPS);
    $("#subsol-gigant").textContent = nume;
  }

  /* ------------------------------------------------------------------------
     8. PUNEREA ÎN PAGINĂ
     ------------------------------------------------------------------------ */
  afiseazaNavigare();
  const durataTotala = afiseazaHero();
  afiseazaBanda();
  afiseazaDespre();
  afiseazaRetele();
  afiseazaSkills();
  afiseazaProiecte();
  afiseazaParcurs();
  afiseazaExperienta();
  afiseazaContact();

  // Numerele secțiunilor („04 — Parcurs”) urmează ordinea celor vizibile
  SECTIUNI.forEach((sectiune, i) => {
    const numar = document.querySelector(`#${sectiune.id} .sectiune__numar`);
    if (numar) numar.textContent = numar.textContent.replace(/^\d+/, douaCifre(i + 1));
  });

  // Titlurile de secțiune, despărțite în cuvinte
  $$(".titlu-split").forEach((titlu) => cuvinte(titlu, titlu.textContent));

  // Linkurile necompletate afișează un mesaj
  document.addEventListener("click", (eveniment) => {
    const link = eveniment.target.closest("[data-de-completat]");
    if (!link) return;
    eveniment.preventDefault();
    arataToast("Link de completat în admin");
  });

  // O imagine lipsă e înlocuită cu una neutră
  document.addEventListener(
    "error",
    (eveniment) => {
      const imagine = eveniment.target;
      if (imagine.tagName === "IMG" && !imagine.src.endsWith("assets/placeholder.svg")) imagine.src = "assets/placeholder.svg";
    },
    true
  );

  /* ------------------------------------------------------------------------
     9. INTRAREA ÎN PAGINĂ (după intro, dacă există)
     ------------------------------------------------------------------------ */
  let gata = false;
  function intraInPagina() {
    if (gata) return;
    gata = true;
    // Două cadre de așteptare: browserul desenează întâi starea ascunsă,
    // apoi tranzițiile pornesc lin, fără salt
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        html.classList.remove("asteapta");
        html.classList.add("gata");
      })
    );
  }

  if (html.classList.contains("intro-activ")) {
    window.addEventListener("intro:deschis", intraInPagina, { once: true });
    setTimeout(intraInPagina, 8000);
  } else {
    intraInPagina();
  }

  /* ------------------------------------------------------------------------
     10. SCROLLUL LIN (Lenis)
     ------------------------------------------------------------------------ */
  if (!miscareRedusa && typeof window.Lenis === "function") {
    lenis = new window.Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      autoRaf: true,
      allowNestedScroll: true,
    });
    if (html.classList.contains("intro-activ")) {
      lenis.stop();
      window.addEventListener("intro:deschis", () => lenis.start(), { once: true });
    }
  }

  // Linkurile #secțiune: scroll lin până la secțiune, sub navigare
  document.addEventListener("click", (eveniment) => {
    const link = eveniment.target.closest('a[href^="#"]');
    if (!link || link.hasAttribute("data-de-completat")) return;
    const id = link.getAttribute("href").slice(1);
    const tinta = id === "acasa" ? document.body : document.getElementById(id);
    if (!tinta || id === "continut") return;
    eveniment.preventDefault();
    inchideMeniul();
    // Titlul secțiunii ajunge la ~110px de sus, sub navigare: sărim peste
    // spațiul de deasupra lui (Lenis ține cont singur de scroll-padding-top).
    const spatiuSus = parseFloat(getComputedStyle(html).scrollPaddingTop) || 0;
    const sus = parseFloat(getComputedStyle(tinta).paddingTop) || 0;
    if (lenis) lenis.scrollTo(id === "acasa" ? 0 : tinta, { offset: sus, duration: 1.6 });
    else window.scrollTo({ top: id === "acasa" ? 0 : tinta.getBoundingClientRect().top + window.scrollY + sus - spatiuSus, behavior: miscareRedusa ? "auto" : "smooth" });
    history.replaceState(null, "", id === "acasa" ? location.pathname : `#${id}`);
  });

  /* ------------------------------------------------------------------------
     11. LA SCROLL: progres, navigare, perspectiva, liniile de timp
     ------------------------------------------------------------------------ */
  const nav = $("#nav");
  const progres = $("#progres");
  const heroText = $("#hero-text");
  const eclipsa = $("#eclipsa");
  const studio = $("#studio");
  const scena = $("#studio-scena");
  // Liniile verticale (parcurs, experiență): fiecare se umple la scroll
  const linii = $$(".experienta").map((bloc) => ({ bloc, umplere: bloc.querySelector(".experienta__linie span") }));
  const indicator = $("#nav-indicator");
  const linkuriNav = $$(".nav__link");
  const linkuriMobil = $$(".nav-mobil li a");
  const sectiuni = SECTIUNI.map((s) => document.getElementById(s.id));

  const limita = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  let activa = -2;

  function mutaIndicatorul(index) {
    if (index === activa) return;
    activa = index;
    linkuriNav.forEach((l, i) => (i === index ? l.setAttribute("aria-current", "location") : l.removeAttribute("aria-current")));
    linkuriMobil.forEach((l, i) => (i === index ? l.setAttribute("aria-current", "location") : l.removeAttribute("aria-current")));
    const link = linkuriNav[index];
    if (!link || !link.offsetParent) {
      indicator.style.setProperty("--o", "0");
      return;
    }
    const li = link.parentElement;
    indicator.style.setProperty("--x", `${li.offsetLeft}px`);
    indicator.style.setProperty("--l", `${li.offsetWidth}px`);
    indicator.style.setProperty("--o", "1");
  }

  function laScroll() {
    const y = window.scrollY;
    const vh = window.innerHeight;
    const maxim = Math.max(1, document.documentElement.scrollHeight - vh);

    progres.style.transform = `scaleX(${(y / maxim).toFixed(4)})`;
    nav.classList.toggle("nav--derulat", y > 20);

    if (!miscareRedusa && y < vh * 1.6) {
      // Textul din hero urcă mai repede și se stinge; eclipsa rămâne în urmă
      heroText.style.transform = `translate3d(0, ${(y * 0.32).toFixed(1)}px, 0)`;
      heroText.style.opacity = String(limita(1 - y / (vh * 0.65)).toFixed(3));
      eclipsa.style.transform = `translateX(-50%) translate3d(0, ${(y * 0.18).toFixed(1)}px, 0)`;

      // Studioul se ridică din perspectivă pe măsură ce intră în ecran
      const sus = scena.getBoundingClientRect().top;
      const p = limita(1 - (sus - vh * 0.1) / (vh * 0.62));
      const usor = 1 - Math.pow(1 - p, 3);
      studio.style.setProperty("--rx", `${(26 * (1 - usor)).toFixed(2)}deg`);
      studio.style.setProperty("--sc", (0.9 + 0.1 * usor).toFixed(4));
    }

    // Liniile verticale se umplu odată cu scrollul
    linii.forEach(({ bloc, umplere }) => {
      if (!umplere || !bloc.offsetParent) return;
      const cadru = bloc.getBoundingClientRect();
      const p = limita((vh * 0.6 - cadru.top) / Math.max(1, cadru.height));
      umplere.style.setProperty("--umplere", p.toFixed(4));
    });

    // Secțiunea activă: ultima al cărei început a trecut de 40% din ecran
    let index = -1;
    sectiuni.forEach((s, i) => {
      if (s && s.getBoundingClientRect().top < vh * 0.4) index = i;
    });
    if (y >= maxim - 4) index = sectiuni.length - 1;
    mutaIndicatorul(index);
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
  if (lenis) lenis.on("scroll", programeaza);
  window.addEventListener("scroll", programeaza, { passive: true });
  window.addEventListener("resize", () => {
    activa = -2;
    programeaza();
  });
  laScroll();

  /* ------------------------------------------------------------------------
     12. APARIȚIA LA SCROLL
     ------------------------------------------------------------------------ */
  const deApare = $$("[data-apare], .titlu-split");
  deApare.forEach((element) => {
    // Elementele din aceeași listă apar pe rând (întârziere crescătoare)
    if (element.matches("li[data-apare], .bento > [data-apare]")) {
      const frati = Array.from(element.parentElement.children);
      element.style.setProperty("--i", Math.min(frati.indexOf(element) % 6, 5));
    }
  });

  if ("IntersectionObserver" in window && !miscareRedusa) {
    const observator = new IntersectionObserver(
      (intrari) =>
        intrari.forEach((intrare) => {
          if (!intrare.isIntersecting) return;
          intrare.target.classList.add("vizibil");
          observator.unobserve(intrare.target);
        }),
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
    );
    deApare.forEach((element) => observator.observe(element));
  } else {
    deApare.forEach((element) => element.classList.add("vizibil"));
  }

  /* ------------------------------------------------------------------------
     13. CIFRELE CARE CRESC, SUBTITRĂRILE, CAPUL DE REDARE
     ------------------------------------------------------------------------ */
  function cresteCifrele() {
    $$("#cifre strong[data-numar]").forEach((element) => {
      const tinta = Number(element.dataset.numar);
      if (!element.dataset.numar || !Number.isFinite(tinta)) return;
      if (miscareRedusa) {
        element.textContent = tinta;
        return;
      }
      const start = performance.now();
      const durata = 1400;
      (function pas(acum) {
        const p = limita((acum - start) / durata);
        element.textContent = Math.round(tinta * (1 - Math.pow(1 - p, 4)));
        if (p < 1) requestAnimationFrame(pas);
      })(start);
    });
  }

  // Bucle care rulează doar cât timp elementul lor se vede
  function candSeVede(element, pornit, oprit) {
    if (!("IntersectionObserver" in window)) return pornit();
    new IntersectionObserver(([intrare]) => (intrare.isIntersecting ? pornit() : oprit && oprit()), { threshold: 0.05 }).observe(element);
  }

  let cifreCrescute = false;
  candSeVede($("#cifre"), () => {
    if (cifreCrescute) return;
    cifreCrescute = true;
    setTimeout(cresteCifrele, 250);
  });

  // Subtitrările se aprind pe rând, ca într-un player
  const randuri = $$("#subtitrari li");
  const tcSubtitrari = $("#subtitrari-tc");
  let indexRand = 0;
  let cronometruRanduri = 0;
  function urmatorulRand() {
    randuri.forEach((r, i) => r.classList.toggle("activ", i === indexRand));
    tcSubtitrari.textContent = timecode((indexRand * 3 + 1) * FPS);
    indexRand = (indexRand + 1) % randuri.length;
  }
  if (randuri.length) {
    if (miscareRedusa) randuri.forEach((r) => r.classList.add("activ"));
    else
      candSeVede(
        $(".placa--subtitrari"),
        () => {
          if (cronometruRanduri) return;
          urmatorulRand();
          cronometruRanduri = setInterval(urmatorulRand, 2600);
        },
        () => {
          clearInterval(cronometruRanduri);
          cronometruRanduri = 0;
        }
      );
  }

  // Capul de redare parcurge timeline-ul studioului, iar timecode-ul curge
  const cap = $("#timeline-cap");
  const pistaV1 = $("#timeline-v1");
  const tcStudio = $("#studio-tc");
  let cadruCap = 0;
  // Cu secvență, o trecere durează cât clipurile (în timp real); altfel 14 s
  const DURATA_BUCLA = segmente.length ? Math.max(4000, durataTotala * 1000) : 14000;
  const latimeTotala = segmente.length ? segmente[segmente.length - 1].sfarsit : 1;
  const t0 = performance.now();

  // Clipul de sub capul de redare se vede pe monitor și pornește de la începutul lui
  const clipuriMonitor = $$(".monitor__clip");
  const clipuriTimeline = $$("#timeline-v1 .timeline__clip");
  const etichetaMonitor = $("#monitor-eticheta");
  let clipActiv = -1;

  function sincronizeaza(video, local, fortat) {
    const d = video.duration;
    if (!d || !Number.isFinite(d)) return;
    const tinta = local % d;
    let dif = Math.abs(video.currentTime - tinta);
    dif = Math.min(dif, d - dif); // la reluarea buclei, 0 și finalul sunt vecine
    if (fortat || dif > 0.35) {
      try {
        video.currentTime = tinta;
      } catch (eroare) {
        /* încă se încarcă: se sincronizează la cadrul următor */
      }
    }
  }

  function arataClip(i, local, reda = true) {
    const media = clipuriMonitor[i];
    if (!media) return;
    if (i !== clipActiv) {
      clipuriMonitor.forEach((m, k) => {
        m.classList.toggle("activ", k === i);
        if (k !== i && m.tagName === "VIDEO") m.pause();
      });
      clipuriTimeline.forEach((c, k) => c.classList.toggle("timeline__clip--activ", k === i));
      if (etichetaMonitor) etichetaMonitor.textContent = `${douaCifre(i + 1)} · ${segmente[i].eticheta}`;
      clipActiv = i;
      if (media.tagName === "VIDEO") {
        sincronizeaza(media, local, true);
        if (reda) {
          const promisiune = media.play();
          if (promisiune && promisiune.catch) promisiune.catch(() => {});
        }
      }
    } else if (reda && media.tagName === "VIDEO") {
      sincronizeaza(media, local, false);
    }
  }

  function misca(acum) {
    const p = ((acum - t0) % DURATA_BUCLA) / DURATA_BUCLA;
    cap.style.setProperty("--cap", `${(p * pistaV1.offsetWidth).toFixed(1)}px`);
    tcStudio.textContent = timecode(p * durataTotala * FPS);
    if (segmente.length) {
      const x = p * latimeTotala;
      let i = segmente.findIndex((s) => x < s.sfarsit);
      if (i < 0) i = segmente.length - 1;
      const s = segmente[i];
      arataClip(i, ((x - s.inceput) / s.latime) * s.secunde);
    }
    cadruCap = requestAnimationFrame(misca);
  }
  if (!miscareRedusa)
    candSeVede(
      studio,
      () => {
        if (!cadruCap) cadruCap = requestAnimationFrame(misca);
      },
      () => {
        cancelAnimationFrame(cadruCap);
        cadruCap = 0;
        // Monitorul nu se mai vede: clipurile stau, ca să nu consume degeaba
        clipuriMonitor.forEach((m) => m.tagName === "VIDEO" && m.pause());
        clipActiv = -1;
      }
    );
  else if (segmente.length) arataClip(0, 0, false); // mișcare redusă: primul cadru, oprit

  // Numele uriaș din footer ocupă exact lățimea paginii
  const gigant = $("#subsol-gigant");
  function potrivesteGigantul() {
    gigant.style.fontSize = "100px";
    const latime = gigant.parentElement.clientWidth - parseFloat(getComputedStyle(gigant.parentElement).paddingLeft) * 2;
    gigant.style.fontSize = `${Math.min(220, (100 * latime) / Math.max(1, gigant.scrollWidth)).toFixed(1)}px`;
  }
  potrivesteGigantul();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(potrivesteGigantul);
  window.addEventListener("resize", potrivesteGigantul);

  /* ------------------------------------------------------------------------
     14. LUMINA DE SUB CURSOR (doar cu mouse)
     ------------------------------------------------------------------------ */
  if (mouse && !miscareRedusa) {
    document.addEventListener(
      "pointermove",
      (eveniment) => {
        const element = eveniment.target.closest && eveniment.target.closest(".lumina-cursor");
        if (!element) return;
        const cadru = element.getBoundingClientRect();
        element.style.setProperty("--mx", `${(eveniment.clientX - cadru.left).toFixed(0)}px`);
        element.style.setProperty("--my", `${(eveniment.clientY - cadru.top).toFixed(0)}px`);
      },
      { passive: true }
    );
  }
})();
