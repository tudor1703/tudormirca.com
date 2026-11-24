/* ==========================================================================
   universitate.js — LOGICA PAGINII UNIVERSITATE

   Citește secțiunea „universitate” din data.js și construiește pagina:
   carnetul de student, parcursul pe semestre, bin-urile cu materiale,
   filtrele, căutarea și cardurile de materii.

   Pentru conținut nu ai nevoie de acest fișier: editezi doar data.js.
   ========================================================================== */

"use strict";

(function () {
  /* ------------------------------------------------------------------------
     1. DATE ȘI FUNCȚII AJUTĂTOARE (la fel ca în script.js)
     ------------------------------------------------------------------------ */
  const { culoriCategorii, profil, linkuri, contact, universitate: U = {} } = DATE;

  const MARCAJ = "[DE COMPLETAT]";
  const ZI = 24 * 60 * 60 * 1000;

  const $ = (selector) => document.querySelector(selector);
  const ecranFaraPanou = window.matchMedia("(max-width: 999px)");
  const miscareRedusa = window.matchMedia("(prefers-reduced-motion: reduce)");

  function escapa(valoare) {
    const inlocuiri = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return String(valoare ?? "").replace(/[&<>"']/g, (caracter) => inlocuiri[caracter]);
  }

  // Pune [DE COMPLETAT] într-o etichetă vizibilă
  function text(valoare) {
    return escapa(valoare).replaceAll(MARCAJ, `<mark class="de-completat">${MARCAJ}</mark>`);
  }

  const faraMarcaj = (valoare) => String(valoare ?? "").replaceAll(MARCAJ, "").trim();
  const deCompletat = (valoare) => !valoare || String(valoare).includes(MARCAJ);
  const areValoare = (valoare) => valoare !== undefined && valoare !== null && String(valoare).trim() !== "";

  function normalizeaza(valoare) {
    return String(valoare ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  }

  // Acordul numeralelor în română: 1 material, 2 materiale, 20 de materiale
  function numara(numar, singular, plural) {
    if (numar === 1) return `1 ${singular}`;
    const cuDe = numar >= 20 && (numar % 100 === 0 || numar % 100 >= 20);
    return `${numar} ${cuDe ? "de " : ""}${plural}`;
  }

  const douaCifre = (numar) => String(numar).padStart(2, "0");

  function iconita(id) {
    return `<svg class="iconita" aria-hidden="true"><use href="#${id}"></use></svg>`;
  }

  // Un link. Dacă adresa nu e completată, afișează doar un mesaj la click.
  function legatura(url, continut, clasa, atribute = "") {
    if (deCompletat(url)) {
      return `<a class="${clasa}" href="#" data-de-completat ${atribute}>${continut}</a>`;
    }
    const extern = /^https?:/.test(url) ? 'target="_blank" rel="noopener"' : "";
    return `<a class="${clasa}" href="${escapa(url)}" ${extern} ${atribute}>${continut}</a>`;
  }

  function anunta(mesaj) {
    $("#anunt").textContent = mesaj;
  }

  let cronometruToast;
  function arataToast(mesaj) {
    const toast = $("#toast");
    toast.textContent = mesaj;
    anunta(mesaj);
    if (toast.matches(":popover-open")) toast.hidePopover();
    toast.showPopover();
    clearTimeout(cronometruToast);
    cronometruToast = setTimeout(() => toast.hidePopover(), 2800);
  }

  /* ------------------------------------------------------------------------
     2. SEMESTRELE ȘI ZIUA DE AZI
     Semestrul de toamnă: 1 septembrie – 31 ianuarie.
     Semestrul de primăvară: 1 februarie – 30 iunie.
     ------------------------------------------------------------------------ */
  const anCitit = parseInt(U.anInceput, 10);
  const AN_INCEPUT = Number.isFinite(anCitit) ? anCitit : new Date().getFullYear();
  const aniCititi = parseInt(U.aniStudiu, 10);
  const ANI = Number.isFinite(aniCititi) && aniCititi > 0 ? Math.min(aniCititi, 8) : 3;

  const semestre = [];
  for (let an = 0; an < ANI; an += 1) {
    semestre.push({ numar: an * 2 + 1, an: an + 1, inceput: new Date(AN_INCEPUT + an, 8, 1), sfarsit: new Date(AN_INCEPUT + an + 1, 0, 31, 23, 59, 59) });
    semestre.push({ numar: an * 2 + 2, an: an + 1, inceput: new Date(AN_INCEPUT + an + 1, 1, 1), sfarsit: new Date(AN_INCEPUT + an + 1, 5, 30, 23, 59, 59) });
  }

  const INCEPUT = semestre[0].inceput;
  const SFARSIT = semestre[semestre.length - 1].sfarsit;
  const azi = new Date();
  const pozitie = (data) => (data - INCEPUT) / (SFARSIT - INCEPUT);
  const limiteaza = (valoare) => Math.min(1, Math.max(0, valoare));
  const culoareAn = (an) => culoriCategorii[(an - 1) % culoriCategorii.length];
  const anulSemestrului = (numar) => Math.ceil(numar / 2);

  function stareSemestru(semestru) {
    if (azi > semestru.sfarsit) return "trecut";
    if (azi >= semestru.inceput) return "acum";
    return "viitor";
  }

  // Unde ești azi: înainte de studii, într-un semestru, în vacanța de vară sau după
  const acum = (() => {
    if (azi < INCEPUT) return { tip: "inainte" };
    if (azi > SFARSIT) return { tip: "dupa" };
    const semestru = semestre.find((s) => azi >= s.inceput && azi <= s.sfarsit);
    if (semestru) return { tip: "semestru", semestru, zile: Math.ceil((semestru.sfarsit - azi) / ZI) };
    return { tip: "vacanta", urmator: semestre.find((s) => s.inceput > azi) };
  })();

  // Varianta scurtă, pentru monitor și antet
  function stareScurta() {
    if (acum.tip === "semestru") return `An ${acum.semestru.an} · Sem ${acum.semestru.numar}`;
    if (acum.tip === "vacanta") return "Vacanță";
    if (acum.tip === "inainte") return "În curând";
    return "Absolvent";
  }

  // Varianta lungă, pentru carnet
  function stareLunga() {
    if (acum.tip === "semestru") {
      return `Anul ${acum.semestru.an}, semestrul ${acum.semestru.numar} · se încheie în ${numara(acum.zile, "zi", "zile")}`;
    }
    if (acum.tip === "vacanta") return `Vacanță de vară · urmează anul ${acum.urmator.an}`;
    if (acum.tip === "inainte") return `Studiile încep în septembrie ${AN_INCEPUT}`;
    return `Studii încheiate în ${AN_INCEPUT + ANI}`;
  }

  /* ------------------------------------------------------------------------
     3. MATERIALELE, TIPURILE ȘI MATERIILE
     ------------------------------------------------------------------------ */
  // Iconița se alege după cuvintele din numele tipului; altfel, document
  const ICONITE_TIP = [
    [["proiect", "scurtmetraj", "film", "storyboard"], "i-proiect"],
    [["video", "clip", "montaj"], "i-video"],
    [["prezentare", "slide"], "i-prezentare"],
    [["notite", "notita", "conspect"], "i-notite"],
    [["link", "site", "url"], "i-link"],
    [["certificat", "diploma", "premiu", "atestat"], "i-certificat"],
    [["imagine", "foto", "poster", "afis"], "i-imagine"],
    [["audio", "sunet", "podcast", "muzica"], "i-audio"],
  ];

  function iconitaTip(tip) {
    const cautat = normalizeaza(tip);
    const gasit = ICONITE_TIP.find(([chei]) => chei.some((cheie) => cautat.includes(cheie)));
    return gasit ? gasit[1] : "i-document";
  }

  // Tipurile, în ordinea în care apar; fiecare primește o culoare
  const tipuri = new Map();
  (U.materiale || []).forEach((material) => {
    const nume = areValoare(material.tip) ? String(material.tip).trim() : "Document";
    const cheie = normalizeaza(faraMarcaj(nume)) || "document";
    if (!tipuri.has(cheie)) {
      tipuri.set(cheie, { cheie, nume, culoare: culoriCategorii[tipuri.size % culoriCategorii.length], iconita: iconitaTip(nume), numar: 0 });
    }
    tipuri.get(cheie).numar += 1;
  });

  // Extensia fișierului, afișată pe copertă: PDF, PPTX, MP4...
  function extensie(material) {
    if (areValoare(material.fisier) && !deCompletat(material.fisier)) {
      const potrivire = /\.([a-z0-9]{2,5})(?:[?#].*)?$/i.exec(material.fisier);
      if (potrivire) return potrivire[1].toUpperCase();
    }
    if (!areValoare(material.fisier) && (material.linkuri || []).length) return "LINK";
    return "";
  }

  const materiale = (U.materiale || []).map((material, index) => {
    const tipNume = areValoare(material.tip) ? String(material.tip).trim() : "Document";
    const tip = tipuri.get(normalizeaza(faraMarcaj(tipNume)) || "document");
    const numarSemestru = parseInt(material.semestru, 10);
    const semestru = Number.isFinite(numarSemestru) && numarSemestru > 0 ? numarSemestru : null;
    const materie = areValoare(material.materie) ? String(material.materie).trim() : "Altele";
    return {
      ...material,
      index,
      materie,
      tip,
      semestru,
      bin: semestru ?? "fara",
      ext: extensie(material),
      cautare: normalizeaza(
        [material.titlu, materie, tip.nume, material.descriere, material.data, ...(material.taguri || []), semestru ? `semestrul ${semestru} s${semestru}` : ""]
          .map(faraMarcaj)
          .join(" ")
      ),
    };
  });

  // Semestrele care apar în materiale dar nu sunt în calendar (ex: semestrul 9)
  const semestreInPlus = [...new Set(materiale.map((m) => m.semestru).filter((n) => n && n > semestre.length))].sort((a, b) => a - b);

  // Materiile, în ordinea în care apar
  const materii = new Map();
  materiale.forEach((material) => {
    const cheie = normalizeaza(faraMarcaj(material.materie)) || material.materie;
    if (!materii.has(cheie)) materii.set(cheie, { nume: material.materie, materiale: [], semestre: new Set() });
    const materie = materii.get(cheie);
    materie.materiale.push(material);
    if (material.semestru) materie.semestre.add(material.semestru);
  });

  const numarInBin = (bin) => materiale.filter((m) => String(m.bin) === String(bin)).length;

  /* ------------------------------------------------------------------------
     4. MONITORUL, CARNETUL ȘI FOOTERUL
     ------------------------------------------------------------------------ */
  function afiseazaAntetSiFooter() {
    document.title = `${profil.nume} — Universitate`;
    $("#marca").textContent = profil.initiale;
    $("#marca").setAttribute("aria-label", `${profil.initiale}, înapoi la portofoliu`);
    $("#antet-nume").textContent = profil.nume;
    $("#tc-pagina").textContent = stareScurta();

    const email = deCompletat(linkuri.email) ? linkuri.email : `mailto:${linkuri.email}`;
    const retele = [
      { eticheta: "Instagram", iconita: "i-instagram", url: linkuri.instagram },
      { eticheta: "YouTube", iconita: "i-youtube", url: linkuri.youtube },
      { eticheta: "GitHub", iconita: "i-github", url: linkuri.github },
    ];
    const cv = { eticheta: "Descarcă CV", iconita: "i-descarca", url: profil.cv, atribute: "download" };

    $("#titlu-contact").innerHTML = text(contact.titlu);
    $("#contact-text").innerHTML = text(contact.text);
    $("#contact-email").innerHTML = legatura(email, "Scrie-mi un email", "buton-accent");
    $("#contact-linkuri").innerHTML = [...retele, cv]
      .map(
        (element) =>
          `<li>${legatura(element.url, `${iconita(element.iconita)}<span>${element.eticheta}</span>`, "subsol__link", element.atribute || "")}</li>`
      )
      .join("");
    $("#avatar-subsol").src = profil.avatar;
    $("#acum-lucrez").innerHTML = text(profil.acumLucrezLa);
    $("#an-curent").textContent = new Date().getFullYear();
    $("#subsol-nume").textContent = profil.nume;
    $("#final-bin").textContent = `· ${numara(materiale.length, "material", "materiale")}`;
  }

  function afiseazaStudii() {
    const perioadaDeCompletat = deCompletat(U.anInceput) || deCompletat(U.aniStudiu);
    const perioada = `${AN_INCEPUT}–${AN_INCEPUT + ANI}`;

    // Monitorul
    $("#monitor-ecran").insertAdjacentHTML(
      "afterbegin",
      `<img class="monitor__imagine" src="${escapa(U.imagine || "assets/universitate.svg")}" alt="${escapa(U.alt || "")}" width="1920" height="1080">`
    );
    $("#monitor-perioada").textContent = `${perioada} · ${numara(ANI, "an", "ani")}`;
    $("#monitor-ciclu").innerHTML = text(U.ciclu);
    $("#nume-universitate").innerHTML = text(U.institutie);
    $("#monitor-facultate").innerHTML = [U.facultate, U.specialitate].filter(areValoare).map(text).join(" · ");
    $("#monitor-acum").textContent = stareScurta();
    $("#monitor-actiuni").innerHTML = `
      ${legatura(U.site, `${iconita("i-extern")}<span>Site-ul universității</span>`, "buton-contur")}
      <a class="buton-accent" href="#materiale">Vezi materialele</a>`;

    // Carnetul de student
    $("#avatar-carnet").src = profil.avatar;
    $("#avatar-carnet").alt = `Portret ${profil.nume}`;

    const anText =
      acum.tip === "semestru" ? `Anul ${acum.semestru.an} din ${ANI}` : acum.tip === "vacanta" ? `Urmează anul ${acum.urmator.an}` : stareScurta();
    const fisa = [
      ["Nume", escapa(profil.nume)],
      ["Ciclu", text(U.ciclu)],
      ["An de studiu", escapa(anText)],
    ];
    $("#carnet-fisa").innerHTML = fisa.map(([nume, valoare]) => `<div><dt class="eticheta">${nume}</dt><dd>${valoare}</dd></div>`).join("");

    const randuri = [
      ["Facultate", text(U.facultate)],
      ["Specialitate", text(U.specialitate)],
      ["Perioadă", `${perioada}${perioadaDeCompletat ? ` <mark class="de-completat">${MARCAJ}</mark>` : ""}`],
    ];
    $("#carnet-randuri").innerHTML = randuri.map(([nume, valoare]) => `<div><dt class="eticheta">${nume}</dt><dd>${valoare}</dd></div>`).join("");
    $("#studii-descriere").innerHTML = text(U.descriere);

    // Progresul: câte o bucată pentru fiecare semestru, umplută cât a trecut din el
    const procent = Math.round(limiteaza(pozitie(azi)) * 100);
    const bucati = semestre
      .map((s) => {
        const umplut = limiteaza((azi - s.inceput) / (s.sfarsit - s.inceput));
        return `<span class="progres__semestru" style="--culoare: ${culoareAn(s.an)}" title="Semestrul ${s.numar}"><span style="width: ${(umplut * 100).toFixed(1)}%"></span></span>`;
      })
      .join("");
    $("#progres").innerHTML = `
      <div class="progres__antet">
        <h3 class="eticheta">Parcurs</h3>
        <p class="progres__procent">${procent}%</p>
      </div>
      <div class="progres__bara" role="img" aria-label="${procent}% din studii parcurse">${bucati}</div>
      <p class="progres__stare">${escapa(stareLunga())}</p>`;
  }

  /* ------------------------------------------------------------------------
     5. PARCURSUL: semestrele pe timeline și capul de redare „Azi”
     ------------------------------------------------------------------------ */
  function afiseazaParcurs() {
    const procentDin = (data) => (limiteaza(pozitie(data)) * 100).toFixed(3);
    $(".parcurs").style.setProperty("--luni", ANI * 12 - 2);

    // Rigla: începutul fiecărui an universitar
    $("#parcurs-rigla").innerHTML = Array.from({ length: ANI }, (_, an) => {
      const inceput = new Date(AN_INCEPUT + an, 8, 1);
      return `<span style="left: ${procentDin(inceput)}%">Anul ${an + 1}<span class="parcurs__ani"> · ${AN_INCEPUT + an}–${AN_INCEPUT + an + 1}</span></span>`;
    }).join("");

    const vacante = Array.from({ length: ANI - 1 }, (_, an) => {
      const inceput = new Date(AN_INCEPUT + an + 1, 6, 1);
      const sfarsit = new Date(AN_INCEPUT + an + 1, 8, 1);
      return `<span class="parcurs__vacanta" style="left: ${procentDin(inceput)}%; width: ${(procentDin(sfarsit) - procentDin(inceput)).toFixed(3)}%">vară</span>`;
    }).join("");

    const clipuri = semestre
      .map((s) => {
        const stare = stareSemestru(s);
        const numar = numarInBin(s.numar);
        return `
        <button class="parcurs__clip parcurs__clip--${stare}" type="button" tabindex="-1" data-bin="${s.numar}"
          style="left: ${procentDin(s.inceput)}%; width: ${(procentDin(s.sfarsit) - procentDin(s.inceput)).toFixed(3)}%; --culoare: ${culoareAn(s.an)}">
          <span class="parcurs__nume">S${s.numar}${stare === "acum" ? " · acum" : ""}</span>
          ${numar ? `<span class="parcurs__numar">${numar}</span>` : ""}
        </button>`;
      })
      .join("");
    $("#parcurs-clipuri").innerHTML = vacante + clipuri;

    const capAzi = $("#parcurs-azi");
    if (azi < INCEPUT || azi > SFARSIT) capAzi.hidden = true;
    else {
      const luni = ["ian", "feb", "mar", "apr", "mai", "iun", "iul", "aug", "sep", "oct", "nov", "dec"];
      capAzi.innerHTML = `<span>Azi · ${azi.getDate()} ${luni[azi.getMonth()]}</span>`;
      capAzi.style.setProperty("--pozitie", pozitie(azi));
      capAzi.classList.toggle("parcurs__azi--stanga", pozitie(azi) > 0.88);
    }

    $("#parcurs-clipuri").addEventListener("click", (eveniment) => {
      const clip = eveniment.target.closest(".parcurs__clip");
      if (!clip) return;
      // Venind de departe, de pe timeline, arătăm tot semestrul: fără alte filtre
      stare.bin = clip.dataset.bin;
      stare.tip = "toate";
      stare.cautare = "";
      $("#camp-cautare").value = "";
      aplicaFiltrele();
      mergiLaMateriale();
    });
  }

  /* ------------------------------------------------------------------------
     6. BIN-URI, FILTRE ȘI GRILA DE MATERIALE
     ------------------------------------------------------------------------ */
  const stare = { bin: "toate", tip: "toate", cautare: "" };

  function butonBin(bin, nume, culoare, extra = "") {
    const numar = bin === "toate" ? materiale.length : numarInBin(bin);
    return `
      <li>
        <button class="bin${numar ? "" : " bin--gol"}" type="button" data-bin="${bin}" aria-pressed="false" style="--culoare: ${culoare}">
          ${iconita("i-materiale")}
          <span class="bin__nume">${nume}</span>
          ${extra}
          <span class="bin__numar">${numar}</span>
        </button>
      </li>`;
  }

  function afiseazaBinuri() {
    let html = butonBin("toate", "Toate materialele", "var(--accent)");
    const ani = Math.max(ANI, ...semestreInPlus.map(anulSemestrului));

    for (let an = 1; an <= ani; an += 1) {
      html += `<li class="binuri__an" aria-hidden="true">Anul ${an}</li>`;
      [an * 2 - 1, an * 2].forEach((numar) => {
        const semestru = semestre.find((s) => s.numar === numar);
        if (!semestru && !semestreInPlus.includes(numar)) return;
        const eticheta = semestru && stareSemestru(semestru) === "acum" ? `<span class="bin__acum">acum</span>` : "";
        html += butonBin(numar, `Semestrul ${numar}`, culoareAn(an), eticheta);
      });
    }

    if (numarInBin("fara")) {
      html += `<li class="binuri__an" aria-hidden="true">Altele</li>`;
      html += butonBin("fara", "Fără semestru", "var(--text-gri)");
    }

    $("#lista-binuri").innerHTML = html;
    $("#lista-binuri").addEventListener("click", (eveniment) => {
      const bin = eveniment.target.closest(".bin");
      if (!bin) return;
      stare.bin = bin.dataset.bin;
      aplicaFiltrele();
    });
  }

  function afiseazaFiltre() {
    const butoane = [
      `<button class="filtru" type="button" data-tip="toate" aria-pressed="true">Toate <span class="filtru__numar">${materiale.length}</span></button>`,
      ...[...tipuri.values()].map(
        (tip) => `
        <button class="filtru" type="button" data-tip="${escapa(tip.cheie)}" aria-pressed="false" style="--culoare: ${tip.culoare}">
          ${iconita(tip.iconita)}${text(tip.nume)} <span class="filtru__numar">${tip.numar}</span>
        </button>`
      ),
    ];
    $("#filtre-tip").innerHTML = butoane.join("");
    $("#filtre-tip").addEventListener("click", (eveniment) => {
      const filtru = eveniment.target.closest(".filtru");
      if (!filtru) return;
      stare.tip = filtru.dataset.tip;
      aplicaFiltrele();
    });
  }

  // Coperta desenată după tip, când materialul nu are imagine
  function coperta(material) {
    return `
      <span class="coperta" style="--culoare: ${material.tip.culoare}">
        ${iconita(material.tip.iconita)}
        ${material.ext ? `<span class="coperta__ext">${material.ext}</span>` : ""}
      </span>`;
  }

  function cadru(material, cuAlt) {
    if (areValoare(material.imagine) && !deCompletat(material.imagine)) {
      return `<img src="${escapa(material.imagine)}" alt="${cuAlt ? escapa(material.alt || "") : ""}" width="960" height="540" loading="lazy">`;
    }
    return coperta(material);
  }

  const codSemestru = (material) => (material.semestru ? `S${material.semestru}` : "—");

  function afiseazaGrila() {
    $("#grila-materiale").innerHTML = materiale
      .map(
        (material) => `
        <li data-index="${material.index}">
          <button class="material" type="button" data-index="${material.index}" style="--culoare: ${material.tip.culoare}">
            <span class="material__cadru">
              ${cadru(material, false)}
              <span class="material__arsura">${codSemestru(material)}</span>
            </span>
            <span class="material__titlu">${text(material.titlu)}</span>
            <span class="material__meta"><span class="marcaj"></span>${text(material.tip.nume)} · ${text(material.data || "")}</span>
            <span class="material__materie">${text(material.materie)}</span>
          </button>
        </li>`
      )
      .join("");

    $("#grila-materiale").addEventListener("click", (eveniment) => {
      const buton = eveniment.target.closest(".material");
      if (buton) selecteaza(Number(buton.dataset.index));
    });

    const semestreCuMateriale = new Set(materiale.map((m) => m.semestru).filter(Boolean)).size;
    $("#detaliu-materiale").textContent = `${numara(materiale.length, "material", "materiale")} · ${numara(semestreCuMateriale, "semestru", "semestre")} · ${numara(tipuri.size, "tip", "tipuri")}`;
  }

  function aplicaFiltrele() {
    const cautat = normalizeaza(stare.cautare.trim());
    let gasite = 0;

    materiale.forEach((material) => {
      const potrivire =
        (stare.bin === "toate" || String(material.bin) === String(stare.bin)) &&
        (stare.tip === "toate" || material.tip.cheie === stare.tip) &&
        (!cautat || material.cautare.includes(cautat));
      $(`#grila-materiale li[data-index="${material.index}"]`).hidden = !potrivire;
      if (potrivire) gasite += 1;
    });

    document.querySelectorAll(".bin").forEach((bin) => bin.setAttribute("aria-pressed", String(bin.dataset.bin === String(stare.bin))));
    document.querySelectorAll(".filtru").forEach((filtru) => filtru.setAttribute("aria-pressed", String(filtru.dataset.tip === stare.tip)));
    document.querySelectorAll(".parcurs__clip").forEach((clip) => clip.classList.toggle("parcurs__clip--ales", clip.dataset.bin === String(stare.bin)));

    const filtrat = stare.bin !== "toate" || stare.tip !== "toate" || cautat !== "";
    const areRezultate = gasite > 0;
    $("#sterge-cautare").hidden = stare.cautare === "";
    $("#grila-materiale").hidden = !areRezultate;
    $("#fara-rezultate").hidden = areRezultate;
    $("#rezultate-cautare").textContent = filtrat ? (areRezultate ? numara(gasite, "rezultat", "rezultate") : "Niciun rezultat") : "";

    if (!areRezultate) {
      let titlu = "Niciun material aici încă";
      let sfat = "Încearcă alt semestru, alt tip sau altă căutare.";
      if (materiale.length === 0) {
        titlu = "Încă nu ai adăugat materiale";
        sfat = "Le adaugi în data.js, la universitate › materiale.";
      } else if (cautat) {
        titlu = `Niciun material pentru „${stare.cautare.trim()}”`;
      } else if (stare.bin !== "toate" && stare.bin !== "fara") {
        titlu = `Niciun material în semestrul ${stare.bin} încă`;
      }
      $("#fara-rezultate-text").textContent = titlu;
      $("#fara-rezultate-sfat").textContent = sfat;
      $("#reseteaza-filtre").hidden = materiale.length === 0;
    }
  }

  function reseteazaFiltrele() {
    stare.bin = "toate";
    stare.tip = "toate";
    stare.cautare = "";
    $("#camp-cautare").value = "";
    aplicaFiltrele();
  }

  /* ------------------------------------------------------------------------
     7. MATERIALUL SELECTAT
     ------------------------------------------------------------------------ */
  function sablonMaterial(material) {
    const butoane = [];
    if (areValoare(material.fisier)) {
      butoane.push(legatura(material.fisier, `${iconita("i-extern")}<span>Deschide</span>`, "buton-contur", 'target="_blank" rel="noopener"'));
      butoane.push(legatura(material.fisier, `${iconita("i-descarca")}<span>Descarcă</span>`, "buton-contur", "download"));
    }
    (material.linkuri || []).forEach((link) => {
      butoane.push(legatura(link.url, `${iconita("i-extern")}<span>${text(link.text)}</span>`, "buton-contur"));
    });

    const semestru = semestre.find((s) => s.numar === material.semestru);
    const campuri = [
      ["Tip", `<span class="marcaj" style="--culoare: ${material.tip.culoare}"></span>${text(material.tip.nume)}`],
      ["Data", text(material.data || "—")],
      ["Semestru", material.semestru ? `Semestrul ${material.semestru}` : "—"],
      ["An", material.semestru ? `Anul ${anulSemestrului(material.semestru)}${semestru ? ` · ${semestru.inceput.getFullYear()}–${semestru.sfarsit.getFullYear()}` : ""}` : "—"],
      ["Materie", text(material.materie)],
    ];

    return `
      <div class="clip__cadru">
        ${cadru(material, true)}
        <span class="clip__arsura" aria-hidden="true">MAT ${douaCifre(material.index + 1)}</span>
        <span class="clip__arsura clip__arsura--dreapta" aria-hidden="true">${codSemestru(material)}</span>
        <span class="clip__taietura" aria-hidden="true"></span>
      </div>
      <h3 class="clip__titlu">${text(material.titlu)}</h3>
      <dl class="clip__date">
        ${campuri.map(([nume, valoare]) => `<div><dt>${nume}</dt><dd>${valoare}</dd></div>`).join("")}
      </dl>
      ${(material.taguri || []).length ? `<ul class="taguri">${material.taguri.map((tag) => `<li>${text(tag)}</li>`).join("")}</ul>` : ""}
      <p class="clip__descriere">${text(material.descriere || "")}</p>
      ${butoane.length ? `<div class="clip__linkuri">${butoane.join("")}</div>` : ""}`;
  }

  const sheet = $("#sheet");

  function selecteaza(index, deCatreVizitator = true) {
    const material = materiale[index];
    const continut = sablonMaterial(material);

    const panou = $("#panou-material");
    panou.classList.toggle("cu-taietura", deCatreVizitator);
    panou.innerHTML = continut;

    document.querySelectorAll(".material").forEach((buton) => {
      const activ = Number(buton.dataset.index) === index;
      buton.classList.toggle("material--activ", activ);
      if (activ) buton.setAttribute("aria-current", "true");
      else buton.removeAttribute("aria-current");
    });

    if (!deCatreVizitator) return;

    anunta(`Material selectat: ${faraMarcaj(material.titlu)}`);
    if (ecranFaraPanou.matches) {
      const corp = $("#sheet-continut");
      corp.classList.add("cu-taietura");
      corp.innerHTML = continut;
      corp.scrollTop = 0;
      if (!sheet.open) sheet.showModal();
    }
  }

  /* ------------------------------------------------------------------------
     8. MATERII
     ------------------------------------------------------------------------ */
  function afiseazaMaterii() {
    const lista = [...materii.values()];
    $("#detaliu-materii").textContent = numara(lista.length, "materie", "materii");

    $("#grila-materii").innerHTML = lista
      .map((materie, i) => {
        const peTip = new Map();
        materie.materiale.forEach((m) => peTip.set(m.tip, (peTip.get(m.tip) || 0) + 1));
        const semestreText = [...materie.semestre].sort((a, b) => a - b).map((n) => `S${n}`).join(", ");
        const tipuriText = [...peTip.keys()].map((tip) => faraMarcaj(tip.nume)).join(", ");
        const bara = [...peTip.entries()]
          .map(([tip, numar]) => `<span style="flex-grow: ${numar}; --culoare: ${tip.culoare}"></span>`)
          .join("");
        return `
        <li>
          <button class="card materie" type="button" data-filtru="${escapa(faraMarcaj(materie.nume))}">
            <span class="card__antet">
              <span>M${douaCifre(i + 1)}${semestreText ? ` · ${semestreText}` : ""}</span>
              <span class="card__actiune" aria-hidden="true">Vezi materialele</span>
            </span>
            <span class="card__titlu">${text(materie.nume)}</span>
            <span class="card__detaliu">${numara(materie.materiale.length, "material", "materiale")} · ${escapa(tipuriText)}</span>
            <span class="bara-tipuri" aria-hidden="true">${bara}</span>
          </button>
        </li>`;
      })
      .join("");

    $("#grila-materii").addEventListener("click", (eveniment) => {
      const card = eveniment.target.closest(".card");
      if (!card) return;
      stare.bin = "toate";
      stare.tip = "toate";
      stare.cautare = card.dataset.filtru;
      $("#camp-cautare").value = card.dataset.filtru;
      aplicaFiltrele();
      mergiLaMateriale();
    });
  }

  /* ------------------------------------------------------------------------
     9. CĂUTARE
     ------------------------------------------------------------------------ */
  function mergiLaMateriale() {
    $("#materiale").scrollIntoView({ behavior: miscareRedusa.matches ? "auto" : "smooth", block: "start" });
  }

  function pregatesteCautarea() {
    const camp = $("#camp-cautare");
    let cautarePornita = false;

    camp.addEventListener("input", () => {
      stare.cautare = camp.value;
      aplicaFiltrele();
      if (camp.value && !cautarePornita) mergiLaMateriale();
      cautarePornita = camp.value !== "";
    });

    $("#formular-cautare").addEventListener("submit", (eveniment) => eveniment.preventDefault());

    const sterge = () => {
      camp.value = "";
      stare.cautare = "";
      cautarePornita = false;
      aplicaFiltrele();
    };

    camp.addEventListener("keydown", (eveniment) => {
      if (eveniment.key === "Escape") {
        eveniment.preventDefault();
        sterge();
      }
    });

    $("#sterge-cautare").addEventListener("click", () => {
      sterge();
      camp.focus();
    });

    $("#reseteaza-filtre").addEventListener("click", () => {
      cautarePornita = false;
      reseteazaFiltrele();
    });

    document.addEventListener("keydown", (eveniment) => {
      if (eveniment.key === "/" && document.activeElement !== camp && !sheet.open) {
        eveniment.preventDefault();
        camp.focus();
      }
    });
  }

  /* ------------------------------------------------------------------------
     10. BOTTOM SHEET
     ------------------------------------------------------------------------ */
  function pregatesteSheet() {
    $("#sheet-inchide").addEventListener("click", () => sheet.close());
    sheet.addEventListener("click", (eveniment) => {
      if (eveniment.target === sheet) sheet.close();
    });
    ecranFaraPanou.addEventListener("change", () => {
      if (!ecranFaraPanou.matches && sheet.open) sheet.close();
    });

    const maner = $("#sheet-maner");
    let inceput = null;
    maner.addEventListener("pointerdown", (eveniment) => {
      inceput = eveniment.clientY;
      maner.setPointerCapture(eveniment.pointerId);
      sheet.style.transition = "none";
    });
    maner.addEventListener("pointermove", (eveniment) => {
      if (inceput === null) return;
      sheet.style.transform = `translateY(${Math.max(0, eveniment.clientY - inceput)}px)`;
    });
    const opresteGlisarea = (eveniment) => {
      if (inceput === null) return;
      const distanta = eveniment.clientY - inceput;
      inceput = null;
      sheet.style.transition = "";
      sheet.style.transform = "";
      if (distanta > 100) sheet.close();
    };
    maner.addEventListener("pointerup", opresteGlisarea);
    maner.addEventListener("pointercancel", opresteGlisarea);
  }

  /* ------------------------------------------------------------------------
     11. NAVIGARE ȘI POZIȚIA ÎN PAGINĂ
     ------------------------------------------------------------------------ */
  const SECTIUNI = [
    { id: "studii", nume: "Studii", iconita: "i-universitate" },
    { id: "materiale", nume: "Materiale", iconita: "i-materiale" },
    { id: "materii", nume: "Materii", iconita: "i-materii" },
    { id: "contact", nume: "Contact", iconita: "i-contact" },
  ];

  function afiseazaNavigare() {
    document.documentElement.style.setProperty("--sectiuni", SECTIUNI.length);
    $("#lista-sectiuni").innerHTML = SECTIUNI.map(
      (sectiune) => `<li><a class="sectiune-link" href="#${sectiune.id}">${sectiune.nume}</a></li>`
    ).join("");
    $("#lista-mobil").innerHTML = SECTIUNI.map(
      (sectiune) => `<li><a href="#${sectiune.id}">${iconita(sectiune.iconita)}<span>${sectiune.nume}</span></a></li>`
    ).join("");
  }

  function pregatesteScrollul() {
    const sectiuni = SECTIUNI.map((sectiune) => $(`#${sectiune.id}`));
    const linkuriNavigare = document.querySelectorAll(".pagina a, .navigare-mobil a");
    const pozitieSus = (element) => element.getBoundingClientRect().top + window.scrollY;
    let sectiuneCeruta = null;

    function actualizeaza() {
      const y = window.scrollY;
      const inaltimeEcran = window.innerHeight;
      const maxim = Math.max(1, document.documentElement.scrollHeight - inaltimeEcran);
      const progres = Math.min(1, y / maxim);
      const linie = y + inaltimeEcran * (1 / 3 + (2 / 3) * progres ** 10);

      const inceputuri = sectiuni.map(pozitieSus);
      let activa = 0;
      inceputuri.forEach((inceput, i) => {
        if (inceput <= linie) activa = i;
      });
      if (sectiuneCeruta !== null) activa = sectiuneCeruta;

      const repere = [inaltimeEcran / 3, ...inceputuri.slice(1), document.documentElement.scrollHeight];
      const inSectiune = (linie - repere[activa]) / (repere[activa + 1] - repere[activa]);
      const pozitieCap = (activa + limiteaza(inSectiune)) / sectiuni.length;
      $("#cap-pagina").style.setProperty("--pozitie", `${pozitieCap * 100}%`);
      $("#progres-mobil").style.transform = `scaleX(${progres})`;

      linkuriNavigare.forEach((link) => {
        if (link.getAttribute("href") === `#${SECTIUNI[activa].id}`) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }

    let programat = false;
    const programeaza = () => {
      if (programat) return;
      programat = true;
      requestAnimationFrame(() => {
        actualizeaza();
        programat = false;
      });
    };

    window.addEventListener("scroll", programeaza, { passive: true });
    window.addEventListener("resize", programeaza);

    document.addEventListener("click", (eveniment) => {
      const link = eveniment.target.closest('a[href^="#"]');
      if (!link) return;
      const index = SECTIUNI.findIndex((sectiune) => `#${sectiune.id}` === link.getAttribute("href"));
      if (index === -1) return;
      sectiuneCeruta = index;
      programeaza();
    });

    ["wheel", "touchmove", "keydown"].forEach((tip) => {
      window.addEventListener(tip, () => (sectiuneCeruta = null), { passive: true });
    });

    actualizeaza();
  }

  /* ------------------------------------------------------------------------
     12. COMPORTAMENTE GENERALE
     ------------------------------------------------------------------------ */
  function pregatesteGeneral() {
    document.addEventListener("click", (eveniment) => {
      const link = eveniment.target.closest("[data-de-completat]");
      if (!link) return;
      eveniment.preventDefault();
      arataToast("Link sau fișier de completat în data.js");
    });

    document.addEventListener(
      "error",
      (eveniment) => {
        const imagine = eveniment.target;
        if (imagine.tagName === "IMG" && !imagine.src.endsWith("assets/placeholder.svg")) {
          imagine.src = "assets/placeholder.svg";
        }
      },
      true
    );
  }

  /* ------------------------------------------------------------------------
     13. PORNIRE
     ------------------------------------------------------------------------ */
  afiseazaAntetSiFooter();
  afiseazaNavigare();
  afiseazaStudii();
  afiseazaParcurs();
  afiseazaBinuri();
  afiseazaFiltre();
  afiseazaGrila();
  afiseazaMaterii();
  pregatesteCautarea();
  pregatesteSheet();
  pregatesteGeneral();
  aplicaFiltrele();

  if (materiale.length > 0) selecteaza(0, false);
  else $("#panou-material").innerHTML = `<p class="clip__descriere">Materialele adăugate în data.js apar aici.</p>`;

  pregatesteScrollul();
})();
