/* ==========================================================================
   admin.js — pagina /admin
   Încarcă conținutul site-ului (data.js), îl editează în formulare și îl
   publică prin /api/date. Fișierele se încarcă prin /api/fisiere.
   ========================================================================== */
(() => {
  "use strict";

  const MARCAJ = "[DE COMPLETAT]";
  const LUNI = ["Ian", "Feb", "Mar", "Apr", "Mai", "Iun", "Iul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const TIPURI = ["Document", "Proiect", "Video", "Prezentare", "Notițe", "Certificat", "Link"];
  const MAX_FISIER = 25 * 1024 * 1024;
  const EXT_IMAGINE = /\.(png|jpe?g|gif|webp|avif|svg)(?:[?#].*)?$/i;

  const $ = (selector, radacina = document) => radacina.querySelector(selector);

  /* ---------- construcție DOM ---------- */
  function h(tag, atribute = {}, ...copii) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(atribute || {})) {
      if (v === undefined || v === null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else if (k === "value") el.value = v;
      else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : String(v));
    }
    for (const copil of copii.flat(Infinity)) {
      if (copil === null || copil === undefined || copil === false) continue;
      el.append(copil instanceof Node ? copil : document.createTextNode(String(copil)));
    }
    return el;
  }

  const normalizeaza = (v) => String(v ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const areMarcaj = (v) => JSON.stringify(v ?? "").includes(MARCAJ);
  const numarMarcaje = (v) => (JSON.stringify(v ?? "").match(/\[DE COMPLETAT\]/g) || []).length;
  const faraMarcaj = (v) => String(v ?? "").replaceAll(MARCAJ, "").replace(/\s{2,}/g, " ").trim();

  function marime(octeti) {
    if (!Number.isFinite(octeti)) return "";
    if (octeti < 1024) return `${octeti} B`;
    if (octeti < 1024 * 1024) return `${(octeti / 1024).toFixed(0)} KB`;
    return `${(octeti / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;
  }
  function dataOra(iso) {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleString("ro-RO", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch { return iso; }
  }
  const lunaCurenta = () => { const d = new Date(); return `${LUNI[d.getMonth()]} ${d.getFullYear()}`; };
  const extensie = (cale) => { const m = /\.([a-z0-9]{2,5})(?:[?#].*)?$/i.exec(String(cale || "")); return m ? m[1].toLowerCase() : ""; };
  const esteImagine = (cale) => EXT_IMAGINE.test(String(cale || "")) && !areMarcaj(cale);

  /* ---------- toast ---------- */
  let cronometruToast;
  function toast(mesaj, tip = "") {
    const el = $("#toast");
    el.textContent = mesaj;
    el.className = `toast vizibil ${tip}`;
    clearTimeout(cronometruToast);
    cronometruToast = setTimeout(() => el.classList.remove("vizibil"), tip === "eroare" ? 7000 : 3600);
  }

  /* ---------- ecrane ---------- */
  function arata(ecran) {
    $("#ecran-incarcare").hidden = ecran !== "incarcare";
    $("#ecran-configurare").hidden = ecran !== "configurare";
    $("#ecran-login").hidden = ecran !== "login";
    $("#aplicatie").hidden = ecran !== "aplicatie";
  }

  /* ---------- API ---------- */
  async function api(cale, optiuni = {}) {
    const init = { method: optiuni.method || "GET", credentials: "same-origin", cache: "no-store", headers: {} };
    if (optiuni.json !== undefined) {
      init.headers["content-type"] = "application/json";
      init.body = JSON.stringify(optiuni.json);
    }
    const raspuns = await fetch("/api/" + cale, init);
    let corp = {};
    try { corp = await raspuns.json(); } catch { /* fără corp */ }
    if (raspuns.status === 401 && cale !== "login") {
      cereLogin();
      throw new Error(corp.eroare || "Sesiunea a expirat. Intră din nou.");
    }
    if (!raspuns.ok) throw new Error(corp.eroare || `Eroare ${raspuns.status}`);
    return corp;
  }

  function incarcaFisier(fisier, laProgres) {
    return new Promise((rezolva, respinge) => {
      if (fisier.size > MAX_FISIER) {
        respinge(new Error(`„${fisier.name}” are ${marime(fisier.size)}. Limita e 25 MB: pune fișierele mari pe YouTube sau Google Drive și adaugă un link.`));
        return;
      }
      const formular = new FormData();
      formular.append("fisier", fisier);
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/fisiere");
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable && laProgres) laProgres(Math.round((e.loaded / e.total) * 100));
      });
      xhr.addEventListener("load", () => {
        let corp = {};
        try { corp = JSON.parse(xhr.responseText); } catch { /* gol */ }
        if (xhr.status === 401) {
          cereLogin();
          respinge(new Error("Sesiunea a expirat. Intră din nou și reîncearcă."));
        } else if (xhr.status >= 200 && xhr.status < 300) {
          fisiereCache = null;
          rezolva(corp);
        } else {
          respinge(new Error(corp.eroare || `Încărcarea a eșuat (${xhr.status}).`));
        }
      });
      xhr.addEventListener("error", () => respinge(new Error("Conexiunea s-a întrerupt în timpul încărcării.")));
      xhr.send(formular);
    });
  }

  let fisiereCache = null;
  async function fisiere(forteaza = false) {
    if (!fisiereCache || forteaza) fisiereCache = (await api("fisiere")).fisiere || [];
    return fisiereCache;
  }

  /* ---------- starea conținutului ---------- */
  let DATE = null;
  let publicat = "";
  let sursa = "fisiere"; // "fisiere" = data.js din site, "admin" = salvat din admin
  let ultimaPublicare = "";
  let sectiune = "materiale";
  const deschise = new WeakSet();

  const ia = (obiect, cale) => cale.reduce((o, k) => (o == null ? undefined : o[k]), obiect);
  function pune(obiect, cale, valoare) {
    let o = obiect;
    for (let i = 0; i < cale.length - 1; i++) {
      if (o[cale[i]] == null || typeof o[cale[i]] !== "object") o[cale[i]] = {};
      o = o[cale[i]];
    }
    o[cale[cale.length - 1]] = valoare;
  }
  function lista(cale) {
    let l = ia(DATE, cale);
    if (!Array.isArray(l)) { l = []; pune(DATE, cale, l); }
    return l;
  }

  const areModificari = () => DATE && JSON.stringify(DATE) !== publicat;

  let cadruProgramat = 0;
  function modificat() {
    if (cadruProgramat) return;
    cadruProgramat = requestAnimationFrame(() => {
      cadruProgramat = 0;
      actualizeazaStare();
    });
  }

  function actualizeazaStare() {
    const stare = $("#stare-salvare");
    const buton = $("#publica");
    const m = areModificari();
    stare.classList.toggle("nesalvat", Boolean(m));
    if (m) stare.textContent = "Modificări nepublicate";
    else if (sursa === "admin") stare.textContent = ultimaPublicare ? `Publicat · ${dataOra(ultimaPublicare)}` : "Totul e publicat";
    else stare.textContent = "Site-ul folosește data.js din fișiere";
    buton.disabled = !m;
    actualizeazaMeniu();
  }

  /* ---------- semestru și materii ---------- */
  function semestrulCurent() {
    const inceput = parseInt(ia(DATE, ["universitate", "anInceput"]), 10);
    if (!Number.isFinite(inceput)) return 1;
    const d = new Date();
    const an = d.getFullYear();
    const luna = d.getMonth();
    let s;
    if (luna >= 8) s = (an - inceput) * 2 + 1;
    else if (luna === 0) s = (an - 1 - inceput) * 2 + 1;
    else s = (an - 1 - inceput) * 2 + 2;
    return Math.max(1, s);
  }
  function valoriFolosite(cale, cheie, implicite = []) {
    const set = new Set(implicite);
    for (const el of lista(cale)) {
      if (areMarcaj(el[cheie])) continue; // exemplele cu [DE COMPLETAT] nu sunt sugestii utile
      const v = String(el[cheie] ?? "").trim();
      if (v) set.add(v);
    }
    return [...set];
  }
  function tipDinExtensie(ext) {
    if (["ppt", "pptx", "key", "odp"].includes(ext)) return "Prezentare";
    if (["mp4", "mov", "webm", "m4v", "avi", "mkv"].includes(ext)) return "Video";
    if (["png", "jpg", "jpeg", "gif", "webp", "avif", "svg", "psd", "ai", "zip"].includes(ext)) return "Proiect";
    return "Document";
  }
  function titluDinNume(nume) {
    const fara = String(nume).replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").replace(/\s{2,}/g, " ").trim();
    return fara ? fara[0].toUpperCase() + fara.slice(1) : "Material nou";
  }

  /* ---------- definițiile formularelor ---------- */
  const validTimecode = (v) => (!v || areMarcaj(v) || /^\d{2}:\d{2}:\d{2}:\d{2}$/.test(String(v).trim()) ? "" : "Format: ore:minute:secunde:cadre, ex: 00:02:14:08");

  const LISTE = {
    materiale: {
      titlu: "Materiale de la universitate",
      descriere: "Tot ce apare pe pagina Universitate: referate, proiecte, prezentări, certificate, linkuri. Ordinea de aici e ordinea de pe site.",
      cale: ["universitate", "materiale"],
      adauga: "Adaugă material",
      gol: "Niciun material încă. Trage fișiere în zona de mai sus sau apasă „Adaugă material”.",
      eticheta: (m) => faraMarcaj(m.titlu),
      meta: (m) => [faraMarcaj(m.tip), faraMarcaj(m.materie), m.semestru ? `Sem. ${m.semestru}` : "", faraMarcaj(m.data)],
      avertizari: (m) => {
        const are = (v) => v && !areMarcaj(v);
        const link = (m.linkuri || []).some((l) => are(l.url));
        return are(m.fisier) || link ? [] : ["fără fișier sau link"];
      },
      miniatura: (m) => m.imagine || m.fisier,
      nou: () => {
        const materii = valoriFolosite(["universitate", "materiale"], "materie");
        return { titlu: "", materie: materii[0] || "", tip: "Document", semestru: semestrulCurent(), data: lunaCurenta(), descriere: "", fisier: "", taguri: [], linkuri: [] };
      },
      campuri: () => [
        { k: "titlu", t: "text", eticheta: "Titlu", lat: true, obligatoriu: true },
        { k: "fisier", t: "fisier", eticheta: "Fișier", lat: true, ajutor: "PDF, Word, prezentare, imagine, video… maximum 25 MB. Pentru fișiere mai mari, pune un link mai jos." },
        { k: "materie", t: "text", eticheta: "Materie", lista: valoriFolosite(["universitate", "materiale"], "materie") },
        { k: "tip", t: "text", eticheta: "Tip", lista: valoriFolosite(["universitate", "materiale"], "tip", TIPURI), ajutor: "Un tip nou primește automat culoare și filtru." },
        { k: "semestru", t: "number", eticheta: "Semestru", min: 1, max: 12 },
        { k: "data", t: "text", eticheta: "Data", placeholder: "ex: Oct 2025" },
        { k: "descriere", t: "textarea", eticheta: "Descriere", lat: true },
        { k: "taguri", t: "taguri", eticheta: "Taguri", lat: true, ajutor: "Separate prin virgulă. Se găsesc și prin căutarea de pe site." },
        { k: "imagine", t: "fisier", eticheta: "Imagine de copertă (opțional)", lat: true, accept: "image/*", ajutor: "16:9. Fără ea, site-ul desenează o copertă după tip." },
        { k: "linkuri", t: "linkuri", eticheta: "Linkuri (opțional)", lat: true },
      ],
    },
    proiecte: {
      titlu: "Creații de ale mele",
      descriere: "Imaginile din portofoliul de pe prima pagină. Durata e opțională: o completezi doar la video.",
      cale: ["proiecte"],
      adauga: "Adaugă creație",
      gol: "Nicio creație încă.",
      eticheta: (p) => faraMarcaj(p.titlu),
      meta: (p) => [faraMarcaj(p.categorie), faraMarcaj(p.data), /\d{2}:\d{2}:\d{2}:\d{2}/.exec(p.durata || "")?.[0] || ""],
      avertizari: () => [],
      miniatura: (p) => p.imagine,
      nou: () => ({ titlu: "Creație nouă", categorie: valoriFolosite(["proiecte"], "categorie")[0] || "Fotografie", taguri: [], data: lunaCurenta(), imagine: "assets/placeholder.svg", alt: "", descriere: "", linkuri: [] }),
      campuri: () => [
        { k: "titlu", t: "text", eticheta: "Titlu", lat: true, obligatoriu: true },
        { k: "categorie", t: "text", eticheta: "Categorie", lista: valoriFolosite(["proiecte"], "categorie") },
        { k: "data", t: "text", eticheta: "Data", placeholder: "ex: Mar 2025" },
        { k: "durata", t: "text", eticheta: "Durata (opțional, doar la video)", placeholder: "00:02:14:08", valideaza: validTimecode },
        { k: "taguri", t: "taguri", eticheta: "Taguri", ajutor: "Aceleași nume ca la Skills, ca să se lege între ele." },
        { k: "imagine", t: "fisier", eticheta: "Imagine", lat: true, accept: "image/*", ajutor: "Pe card se vede decupată 16:10; întreagă când deschizi creația." },
        { k: "alt", t: "text", eticheta: "Descrierea imaginii (pentru cititoare de ecran)", lat: true },
        { k: "descriere", t: "textarea", eticheta: "Descriere", lat: true },
        { k: "linkuri", t: "linkuri", eticheta: "Linkuri", lat: true },
      ],
    },
    skills: {
      titlu: "Skills",
      descriere: "Fiecare skill devine un card pe prima pagină.",
      cale: ["skills"],
      adauga: "Adaugă skill",
      gol: "Niciun skill încă.",
      eticheta: (s) => faraMarcaj(s.nume),
      meta: (s) => [faraMarcaj(s.detaliu)],
      avertizari: () => [],
      nou: () => ({ nume: "", detaliu: "" }),
      campuri: () => [
        { k: "nume", t: "text", eticheta: "Nume", obligatoriu: true },
        { k: "detaliu", t: "text", eticheta: "Detaliu", placeholder: "ex: DaVinci Resolve, 3 ani" },
      ],
    },
    secventa: {
      titlu: "Secvența din studio",
      descriere: "Clipurile de pe monitorul de sus, în ordinea de pe timeline. Fiecare pornește când ajunge capul de redare. Se văd la mărimea lor naturală, centrate.",
      cale: ["secventa"],
      adauga: "Adaugă clip",
      gol: "Niciun clip: timeline-ul arată creațiile.",
      eticheta: (c) => faraMarcaj(c.eticheta),
      meta: (c) => [String(c.media || "").split("/").pop(), c.secunde ? `${c.secunde} s` : ""],
      avertizari: (c) => (c.media && !areMarcaj(c.media) ? [] : ["fără fișier"]),
      nou: () => ({ eticheta: "", media: "", secunde: 5 }),
      campuri: () => [
        { k: "eticheta", t: "text", eticheta: "Eticheta de pe timeline", obligatoriu: true, lista: valoriFolosite(["secventa"], "eticheta"), placeholder: "ex: Acasă" },
        { k: "secunde", t: "number", eticheta: "Cât stă pe timeline (secunde)", min: 1, max: 120, step: 0.01, ajutor: "Dacă e mai mult decât durează fișierul, clipul se reia." },
        { k: "media", t: "fisier", eticheta: "Clip (MP4) sau GIF", lat: true, accept: "video/mp4,video/webm,image/gif", ajutor: "Un clip scurt. MP4 e mai mic și mai clar decât GIF-ul. Ca să meargă invers, trebuie inversat înainte de încărcare." },
      ],
    },
    parcurs: {
      titlu: "Parcurs: studii și organizații",
      descriere: "Linia de timp de pe prima pagină: unde ai învățat, unde înveți, organizațiile din care faci parte. Cel mai recent sus.",
      cale: ["parcurs"],
      adauga: "Adaugă în parcurs",
      gol: "Nimic în parcurs încă.",
      eticheta: (e) => faraMarcaj(e.nume),
      meta: (e) => [faraMarcaj(e.tip), faraMarcaj(e.perioada)],
      avertizari: () => [],
      nou: () => ({ tip: "Universitate", nume: "", oras: "Chișinău", perioada: "", detalii: "", descriere: "", puncte: [], softSkills: [], hardSkills: [], link: "" }),
      campuri: () => [
        { k: "nume", t: "text", eticheta: "Nume (instituție sau organizație)", lat: true, obligatoriu: true },
        { k: "tip", t: "text", eticheta: "Tip", lista: valoriFolosite(["parcurs"], "tip", ["Universitate", "Colegiu", "Liceu", "Organizație"]) },
        { k: "perioada", t: "text", eticheta: "Perioada", placeholder: "ex: 2022 – 2026 sau 2026 – prezent" },
        { k: "oras", t: "text", eticheta: "Oraș" },
        { k: "link", t: "text", eticheta: "Site (opțional)", placeholder: "https://…" },
        { k: "detalii", t: "text", eticheta: "Detalii", lat: true, placeholder: "ex: Facultatea … · Specialitatea … · Licență, sau rolul tău" },
        { k: "descriere", t: "textarea", eticheta: "Descriere", lat: true, rows: 3 },
        { k: "puncte", t: "randuri", eticheta: "Realizări / ce faci acolo (opțional)", lat: true, rows: 3, ajutor: "Câte una pe rând." },
        { k: "softSkills", t: "taguri", eticheta: "Soft skills (opțional)", lat: true, placeholder: "ex: Comunicare, Lucru în echipă" },
        { k: "hardSkills", t: "taguri", eticheta: "Hard skills (opțional)", lat: true, placeholder: "ex: HTML și CSS, JavaScript" },
      ],
    },
    cursuri: {
      titlu: "Cursuri și certificate",
      descriere: "Apar sub linia de timp. Poza certificatului se deschide mare la click.",
      cale: ["cursuri"],
      adauga: "Adaugă curs",
      gol: "Niciun curs încă.",
      eticheta: (c) => faraMarcaj(c.nume),
      meta: (c) => [faraMarcaj(c.organizator), faraMarcaj(c.data)],
      avertizari: () => [],
      miniatura: (c) => c.imagine,
      nou: () => ({ nume: "", organizator: "", data: lunaCurenta(), ore: "", descriere: "", imagine: "", alt: "", link: "" }),
      campuri: () => [
        { k: "nume", t: "text", eticheta: "Numele cursului", lat: true, obligatoriu: true },
        { k: "organizator", t: "text", eticheta: "Organizator / platformă", lat: true },
        { k: "data", t: "text", eticheta: "Data", placeholder: "ex: 2 noiembrie 2026" },
        { k: "ore", t: "text", eticheta: "Durata (opțional)", placeholder: "ex: 8 ore academice" },
        { k: "descriere", t: "textarea", eticheta: "Descriere", lat: true, rows: 3 },
        { k: "imagine", t: "fisier", eticheta: "Poza certificatului", lat: true, accept: "image/*" },
        { k: "alt", t: "text", eticheta: "Descrierea pozei (pentru cititoare de ecran)", lat: true },
        { k: "link", t: "text", eticheta: "Link de verificare (opțional)", lat: true, placeholder: "https://…" },
      ],
    },
    platforme: {
      titlu: "Platforme unde ești activ",
      descriere: "Paginile pe care le administrezi sau unde postezi. Conturile tale personale se pun la „Linkuri și contact”.",
      cale: ["platforme"],
      adauga: "Adaugă platformă",
      gol: "Nicio platformă încă.",
      eticheta: (pl) => faraMarcaj(pl.nume),
      meta: (pl) => [faraMarcaj(pl.rol)],
      avertizari: (pl) => (pl.url && !areMarcaj(pl.url) ? [] : ["fără link"]),
      nou: () => ({ nume: "", rol: "", descriere: "", url: "", iconita: "instagram" }),
      campuri: () => [
        { k: "nume", t: "text", eticheta: "Nume", lat: true, obligatoriu: true, placeholder: "ex: Instagram · FJȘC USM" },
        { k: "rol", t: "text", eticheta: "Rolul tău", placeholder: "ex: Administrator" },
        { k: "iconita", t: "text", eticheta: "Iconiță", lista: ["instagram", "youtube", "github", "web"], ajutor: "instagram, youtube, github sau web." },
        { k: "url", t: "text", eticheta: "Link", lat: true, placeholder: "https://instagram.com/…" },
        { k: "descriere", t: "textarea", eticheta: "Descriere", lat: true, rows: 2 },
      ],
    },
    experienta: {
      titlu: "Experiență",
      descriere: "„Pe unde am lucrat”, de la cea mai recentă la cea mai veche. Secțiunea apare pe site doar dacă e bifată în „Profil și despre mine” → „Secțiuni”.",
      cale: ["experienta"],
      adauga: "Adaugă experiență",
      gol: "Nicio experiență încă.",
      eticheta: (e) => [faraMarcaj(e.rol), faraMarcaj(e.companie)].filter(Boolean).join(" · "),
      meta: (e) => [faraMarcaj(e.perioada)],
      avertizari: () => [],
      nou: () => ({ perioada: "", rol: "", companie: "", descriere: "" }),
      campuri: () => [
        { k: "rol", t: "text", eticheta: "Rol", obligatoriu: true },
        { k: "companie", t: "text", eticheta: "Companie / loc" },
        { k: "perioada", t: "text", eticheta: "Perioada", placeholder: "ex: 2024 — prezent" },
        { k: "descriere", t: "textarea", eticheta: "Descriere", lat: true },
      ],
    },
  };

  const FORMULARE = {
    profil: {
      titlu: "Profil și despre mine",
      descriere: "Datele din partea de sus a primei pagini, blocul „Despre mine” și footerul.",
      panouri: [
        { titlu: "Cine ești", campuri: [
          { k: "profil.nume", t: "text", eticheta: "Nume" },
          { k: "profil.initiale", t: "text", eticheta: "Inițiale", ajutor: "Apar în pătratul din stânga sus." },
          { k: "profil.rol", t: "text", eticheta: "Rol", placeholder: "ex: Video editor" },
          { k: "profil.aniExperienta", t: "text", eticheta: "Ani de experiență", placeholder: "ex: 3" },
          { k: "profil.descriereScurta", t: "textarea", eticheta: "Descriere scurtă", lat: true, rows: 3 },
          { k: "profil.avatar", t: "fisier", eticheta: "Poza ta", lat: true, accept: "image/*" },
          { k: "profil.cv", t: "fisier", eticheta: "CV (PDF)", lat: true, accept: ".pdf,application/pdf" },
          { k: "profil.acumLucrezLa", t: "text", eticheta: "Acum lucrez la (footer)", lat: true },
        ] },
        { titlu: "Despre mine", campuri: [
          { k: "profil.despre", t: "randuri", eticheta: "Rânduri", lat: true, rows: 6, ajutor: "Fiecare rând apare ca o subtitrare separată." },
        ] },
        { titlu: "Secțiuni", campuri: [
          { k: "arataExperienta", t: "bifa", eticheta: "Arată secțiunea „Pe unde am lucrat”", lat: true, ajutor: "Bifeaz-o când ai completat experiența. Până atunci rămâne ascunsă, cu tot cu linkul din meniu." },
        ] },
        { titlu: "Showreel (ecranul mare de sus)", campuri: [
          { k: "profil.showreel.imagine", t: "fisier", eticheta: "Imagine 16:9", lat: true, accept: "image/*" },
          { k: "profil.showreel.alt", t: "text", eticheta: "Descrierea imaginii", lat: true },
          { k: "profil.showreel.video", t: "fisier", eticheta: "Video (opțional, sub 25 MB)", lat: true, accept: "video/*", ajutor: "Apare butonul „Redă showreel”." },
        ] },
      ],
    },
    contact: {
      titlu: "Linkuri și contact",
      descriere: "Rețelele sociale și textele din footer. Adrese complete, ex: https://instagram.com/numele-tau.",
      panouri: [
        { titlu: "Linkuri", campuri: [
          { k: "linkuri.instagram", t: "text", eticheta: "Instagram", placeholder: "https://instagram.com/…" },
          { k: "linkuri.youtube", t: "text", eticheta: "YouTube", placeholder: "https://youtube.com/@…" },
          { k: "linkuri.github", t: "text", eticheta: "GitHub", placeholder: "https://github.com/…" },
          { k: "linkuri.email", t: "text", eticheta: "Email", placeholder: "nume@exemplu.com", ajutor: "Doar adresa, fără „mailto:”." },
        ] },
        { titlu: "Footer", campuri: [
          { k: "contact.titlu", t: "text", eticheta: "Titlu", lat: true },
          { k: "contact.text", t: "textarea", eticheta: "Text", lat: true, rows: 3 },
        ] },
      ],
    },
    universitate: {
      titlu: "Universitate (date generale)",
      descriere: "Partea de sus a paginii Universitate. Din anul de început și durata studiilor se calculează semestrele.",
      panouri: [
        { titlu: "Studii", campuri: [
          { k: "universitate.institutie", t: "text", eticheta: "Universitatea", lat: true },
          { k: "universitate.facultate", t: "text", eticheta: "Facultatea" },
          { k: "universitate.specialitate", t: "text", eticheta: "Specialitatea" },
          { k: "universitate.ciclu", t: "text", eticheta: "Ciclu", placeholder: "ex: Licență" },
          { k: "universitate.site", t: "text", eticheta: "Site-ul universității", placeholder: "https://…" },
          { k: "universitate.anInceput", t: "text", eticheta: "Anul de început", placeholder: "ex: 2025" },
          { k: "universitate.aniStudiu", t: "text", eticheta: "Ani de studiu", placeholder: "ex: 3" },
          { k: "universitate.descriere", t: "textarea", eticheta: "Descriere", lat: true, rows: 3 },
        ] },
        { titlu: "Imaginea de sus", campuri: [
          { k: "universitate.imagine", t: "fisier", eticheta: "Imagine 16:9", lat: true, accept: "image/*" },
          { k: "universitate.alt", t: "text", eticheta: "Descrierea imaginii", lat: true },
        ] },
      ],
    },
  };

  /* ---------- câmpuri ---------- */
  let contor = 0;

  function camp(tinta, def, laSchimbare) {
    if (def.t === "fisier") return campFisier(tinta, def, laSchimbare);
    if (def.t === "linkuri") return campLinkuri(tinta, def, laSchimbare);
    if (def.t === "bifa") {
      const cale = def.k.split(".");
      const id = `c${++contor}`;
      const control = h("input", { id, type: "checkbox" });
      control.checked = ia(tinta, cale) !== false;
      control.addEventListener("change", () => {
        pune(tinta, cale, control.checked);
        if (laSchimbare) laSchimbare();
        modificat();
      });
      const invelis = h("div", { class: `camp camp--bifa${def.lat ? " lat" : ""}` },
        h("label", { class: "bifa", for: id }, control, h("span", { text: def.eticheta })));
      if (def.ajutor) invelis.append(h("p", { class: "camp__ajutor", text: def.ajutor }));
      return invelis;
    }

    const cale = def.k.split(".");
    const valoare = ia(tinta, cale);
    const id = `c${++contor}`;
    const invelis = h("div", { class: `camp${def.lat ? " lat" : ""}` });
    const eticheta = h("label", { class: "camp__eticheta", for: id, text: def.eticheta });
    let control;
    let citeste;

    if (def.t === "textarea" || def.t === "randuri") {
      control = h("textarea", { id, rows: def.rows || 4, placeholder: def.placeholder });
      control.value = def.t === "randuri" ? (Array.isArray(valoare) ? valoare.join("\n") : valoare ?? "") : valoare ?? "";
      citeste = () => (def.t === "randuri" ? control.value.split("\n").map((r) => r.trim()).filter(Boolean) : control.value);
    } else if (def.t === "number") {
      control = h("input", { id, type: "number", min: def.min, max: def.max, step: def.step, inputmode: def.step && def.step < 1 ? "decimal" : "numeric" });
      control.value = valoare ?? "";
      citeste = () => (control.value === "" ? "" : Number(control.value));
    } else if (def.t === "taguri") {
      control = h("input", { id, type: "text", placeholder: def.placeholder || "ex: Storyboard, Scurtmetraj" });
      control.value = Array.isArray(valoare) ? valoare.join(", ") : valoare ?? "";
      citeste = () => control.value.split(",").map((t) => t.trim()).filter(Boolean);
    } else {
      control = h("input", { id, type: "text", placeholder: def.placeholder, autocomplete: "off" });
      control.value = valoare ?? "";
      citeste = () => control.value;
    }
    if (def.obligatoriu) control.required = true;

    const marcaj = h("p", { class: "camp__marcaj", hidden: true },
      "Încă are „[DE COMPLETAT]”.",
      h("button", { type: "button", text: "Scoate marcajul", onclick: () => {
        control.value = control.value.split("\n").map(faraMarcaj).join("\n");
        control.dispatchEvent(new Event("input"));
        control.focus();
      } }));
    const eroare = h("p", { class: "camp__eroare", hidden: true });

    const verifica = () => {
      const are = control.value.includes(MARCAJ);
      invelis.classList.toggle("camp--de-completat", are);
      marcaj.hidden = !are;
      const mesaj = def.valideaza ? def.valideaza(control.value) : "";
      eroare.textContent = mesaj;
      eroare.hidden = !mesaj;
      invelis.classList.toggle("camp--invalid", Boolean(mesaj));
    };
    control.addEventListener("input", () => {
      pune(tinta, cale, citeste());
      verifica();
      if (laSchimbare) laSchimbare();
      modificat();
    });

    invelis.append(eticheta, control);
    if (def.lista && def.lista.length) {
      const idLista = `${id}-lista`;
      control.setAttribute("list", idLista);
      invelis.append(h("datalist", { id: idLista }, def.lista.map((v) => h("option", { value: v }))));
    }
    if (def.ajutor) invelis.append(h("p", { class: "camp__ajutor", text: def.ajutor }));
    invelis.append(marcaj, eroare);
    verifica();
    return invelis;
  }

  function miniatura(cale, clasa = "element__miniatura") {
    if (esteImagine(cale)) return h("img", { class: clasa, src: cale, alt: "", loading: "lazy" });
    const ext = extensie(cale);
    return h("span", { class: clasa, text: ext ? ext.toUpperCase() : "—" });
  }

  function campFisier(tinta, def, laSchimbare) {
    const cale = def.k.split(".");
    const id = `c${++contor}`;
    const invelis = h("div", { class: `camp${def.lat ? " lat" : ""}` });
    const cutie = h("div", { class: "camp-fisier" });
    const intrare = h("input", { id, type: "text", placeholder: "Niciun fișier — încarcă unul sau trage-l aici", autocomplete: "off" });
    intrare.value = ia(tinta, cale) ?? "";
    const selector = h("input", { type: "file", accept: def.accept || "" });
    const bara = h("div", { class: "progres__bara" });
    const progres = h("div", { class: "progres", hidden: true }, bara);
    const previzualizare = h("div", { class: "camp-fisier__previzualizare" });
    const marcaj = h("p", { class: "camp__marcaj", hidden: true }, "Fișierul nu e încă pus.");

    const actualizeaza = () => {
      const v = intrare.value.trim();
      marcaj.hidden = !v.includes(MARCAJ);
      invelis.classList.toggle("camp--de-completat", v.includes(MARCAJ));
      previzualizare.replaceChildren();
      if (!v || v.includes(MARCAJ)) return;
      if (esteImagine(v)) previzualizare.append(h("img", { src: v, alt: "" }));
      const nume = decodeURIComponent(v.split("/").pop() || v);
      previzualizare.append(h("span", {}, h("a", { href: v, target: "_blank", rel: "noopener", text: "Deschide ↗" }), ` ${nume}`));
    };
    const seteaza = (v) => {
      intrare.value = v;
      pune(tinta, cale, v);
      actualizeaza();
      if (laSchimbare) laSchimbare();
      modificat();
    };
    intrare.addEventListener("input", () => seteaza(intrare.value));

    const trimite = async (fisier) => {
      if (!fisier) return;
      progres.hidden = false;
      bara.style.width = "0%";
      try {
        const r = await incarcaFisier(fisier, (p) => { bara.style.width = `${p}%`; });
        seteaza(r.url);
        toast(`Încărcat: ${fisier.name}. Nu uita să apeși Publică.`, "succes");
      } catch (e) {
        toast(e.message, "eroare");
      } finally {
        progres.hidden = true;
        selector.value = "";
      }
    };
    selector.addEventListener("change", () => trimite(selector.files[0]));
    cutie.addEventListener("dragover", (e) => { e.preventDefault(); cutie.classList.add("peste"); });
    cutie.addEventListener("dragleave", () => cutie.classList.remove("peste"));
    cutie.addEventListener("drop", (e) => {
      e.preventDefault();
      cutie.classList.remove("peste");
      trimite(e.dataTransfer.files[0]);
    });

    cutie.append(
      h("div", { class: "camp-fisier__rand" },
        intrare,
        h("button", { class: "buton buton-mic", type: "button", text: "Încarcă…", onclick: () => selector.click() }),
        h("button", { class: "buton buton-mic", type: "button", text: "Din fișiere", onclick: () => alegeFisier((url) => seteaza(url), def.accept) }),
        h("button", { class: "buton buton-mic buton-text", type: "button", title: "Golește", "aria-label": "Golește câmpul", text: "✕", onclick: () => seteaza("") })),
      progres, previzualizare, selector);
    invelis.append(h("label", { class: "camp__eticheta", for: id, text: def.eticheta }), cutie);
    if (def.ajutor) invelis.append(h("p", { class: "camp__ajutor", text: def.ajutor }));
    invelis.append(marcaj);
    actualizeaza();
    return invelis;
  }

  function campLinkuri(tinta, def, laSchimbare) {
    const cale = def.k.split(".");
    const invelis = h("div", { class: `camp${def.lat ? " lat" : ""}` });
    const randuri = h("div", { class: "repetabil" });
    const lista = () => {
      let l = ia(tinta, cale);
      if (!Array.isArray(l)) { l = []; pune(tinta, cale, l); }
      return l;
    };
    const schimbat = () => { if (laSchimbare) laSchimbare(); modificat(); };
    const randeaza = () => {
      const l = lista();
      randuri.replaceChildren(
        ...l.map((link, i) => {
          const text = h("input", { type: "text", placeholder: "Textul butonului, ex: Vezi pe YouTube", "aria-label": "Textul linkului" });
          text.value = link.text ?? "";
          const url = h("input", { type: "text", placeholder: "https://…", "aria-label": "Adresa linkului", class: "mono" });
          url.value = link.url ?? "";
          const marcheaza = () => {
            text.style.borderStyle = String(text.value).includes(MARCAJ) ? "dashed" : "";
            url.style.borderStyle = String(url.value).includes(MARCAJ) ? "dashed" : "";
          };
          text.addEventListener("input", () => { link.text = text.value; marcheaza(); schimbat(); });
          url.addEventListener("input", () => { link.url = url.value.trim(); marcheaza(); schimbat(); });
          marcheaza();
          return h("div", { class: "repetabil__rand" }, text, url,
            h("button", { class: "buton buton-icon buton-text", type: "button", title: "Șterge linkul", "aria-label": "Șterge linkul", text: "✕",
              onclick: () => { l.splice(i, 1); randeaza(); schimbat(); } }));
        }),
        h("div", {}, h("button", { class: "buton buton-mic", type: "button", text: "+ Adaugă link", onclick: () => {
          lista().push({ text: "", url: "" });
          randeaza();
          schimbat();
          const campuri = randuri.querySelectorAll(".repetabil__rand input");
          if (campuri.length) campuri[campuri.length - 2].focus();
        } })));
    };
    randeaza();
    invelis.append(h("span", { class: "camp__eticheta", text: def.eticheta }), randuri);
    return invelis;
  }

  /* ---------- alegerea unui fișier deja încărcat ---------- */
  async function alegeFisier(laAlegere, accept = "") {
    const dialog = $("#dialog-fisiere");
    const listaEl = $("#lista-dialog-fisiere");
    const cauta = $("#cauta-fisiere");
    cauta.value = "";
    listaEl.replaceChildren(h("p", { class: "gri", text: "Se încarcă…" }));
    dialog.showModal();
    let toate = [];
    try { toate = await fisiere(); } catch (e) { listaEl.replaceChildren(h("p", { class: "mesaj-eroare", text: e.message })); return; }
    const doarImagini = /image/.test(accept);
    const randeaza = () => {
      const q = normalizeaza(cauta.value);
      const potrivite = toate.filter((f) => (!doarImagini || String(f.tip).startsWith("image/")) && normalizeaza(f.nume).includes(q));
      listaEl.replaceChildren(...(potrivite.length
        ? potrivite.map((f) => h("button", { class: "dialog__fisier", type: "button", onclick: () => { dialog.close(); laAlegere(f.url); } },
            miniatura(String(f.tip).startsWith("image/") ? f.url : f.cheie), h("span", { text: f.nume })))
        : [h("p", { class: "gri", text: toate.length ? "Niciun fișier nu se potrivește." : "Niciun fișier încărcat încă." })]));
    };
    cauta.oninput = randeaza;
    randeaza();
  }

  /* ---------- editor de liste ---------- */
  function editorLista(id) {
    const cfg = LISTE[id];
    const elemente = lista(cfg.cale);
    const sectiuneEl = h("section");
    const listaEl = h("div", { class: "lista" });
    let cautare = "";
    let filtruSemestru = "";
    let filtruTip = "";

    const randeaza = () => {
      const q = normalizeaza(cautare);
      listaEl.replaceChildren();
      let vizibile = 0;
      elemente.forEach((el, i) => {
        if (q && !normalizeaza(JSON.stringify(el)).includes(q)) return;
        if (filtruSemestru && String(el.semestru) !== filtruSemestru) return;
        if (filtruTip && faraMarcaj(el.tip) !== filtruTip) return;
        vizibile++;
        listaEl.append(card(el, i));
      });
      if (!vizibile) listaEl.append(h("p", { class: "gol", text: elemente.length ? "Niciun rezultat pentru filtrele alese." : cfg.gol }));
    };

    const card = (el, i) => {
      const deschis = deschise.has(el);
      const art = h("article", { class: `element${deschis ? " deschis" : ""}` });
      const titlu = h("span", { class: "element__titlu" });
      const meta = h("span", { class: "element__meta" });
      const miniEl = h("span");
      const actualizeazaCap = () => {
        titlu.textContent = cfg.eticheta(el) || "(fără titlu)";
        const parti = cfg.meta(el).filter(Boolean).map((m) => h("span", { text: m }));
        for (const a of cfg.avertizari(el)) parti.push(h("span", { class: "eticheta-galbena", text: a }));
        if (areMarcaj(el)) parti.push(h("span", { class: "eticheta-galbena", text: "de completat" }));
        meta.replaceChildren(...parti);
        if (cfg.miniatura) miniEl.replaceChildren(miniatura(cfg.miniatura(el)));
      };
      const comuta = h("button", { class: "element__comuta", type: "button", "aria-expanded": String(deschis), onclick: () => {
        if (deschise.has(el)) deschise.delete(el); else deschise.add(el);
        randeaza();
      } }, h("span", { class: "element__sageata", "aria-hidden": "true", text: "›" }), cfg.miniatura ? miniEl : null, h("span", { class: "element__text" }, titlu, meta));
      const muta = (pas) => {
        const j = i + pas;
        if (j < 0 || j >= elemente.length) return;
        [elemente[i], elemente[j]] = [elemente[j], elemente[i]];
        randeaza();
        modificat();
      };
      const actiuni = h("div", { class: "element__actiuni" },
        h("button", { class: "buton buton-icon buton-text", type: "button", title: "Mută mai sus", "aria-label": "Mută mai sus", text: "↑", disabled: i === 0, onclick: () => muta(-1) }),
        h("button", { class: "buton buton-icon buton-text", type: "button", title: "Mută mai jos", "aria-label": "Mută mai jos", text: "↓", disabled: i === elemente.length - 1, onclick: () => muta(1) }),
        h("button", { class: "buton buton-icon buton-text ascunde-mobil", type: "button", title: "Duplică", "aria-label": "Duplică", text: "⧉", onclick: () => {
          const copie = JSON.parse(JSON.stringify(el));
          elemente.splice(i + 1, 0, copie);
          deschise.add(copie);
          randeaza();
          modificat();
        } }),
        h("button", { class: "buton buton-icon buton-text buton-pericol", type: "button", title: "Șterge", "aria-label": "Șterge", text: "🗑", onclick: () => {
          if (!confirm(`Ștergi „${cfg.eticheta(el) || "elementul fără titlu"}”? (Fișierul încărcat rămâne în „Fișiere încărcate”.)`)) return;
          elemente.splice(i, 1);
          randeaza();
          modificat();
        } }));
      art.append(h("div", { class: "element__cap" }, comuta, actiuni));
      if (deschis) {
        art.append(h("div", { class: "element__corp" }, h("div", { class: "grila" }, cfg.campuri().map((d) => camp(el, d, actualizeazaCap)))));
      }
      actualizeazaCap();
      return art;
    };

    const adauga = () => {
      const nou = cfg.nou();
      elemente.unshift(nou);
      deschise.add(nou);
      cautare = "";
      filtruSemestru = "";
      filtruTip = "";
      if (campCautare) campCautare.value = "";
      randeaza();
      modificat();
      const primul = listaEl.querySelector(".element__corp input");
      if (primul) primul.focus();
    };

    sectiuneEl.append(h("div", { class: "sectiune__cap" },
      h("h1", { text: cfg.titlu }), h("span", { class: "spatiu" }),
      h("button", { class: "buton buton-accent", type: "button", text: `+ ${cfg.adauga}`, onclick: adauga }),
      h("p", { text: cfg.descriere })));

    let campCautare = null;
    if (id === "materiale") {
      sectiuneEl.append(zonaRapida(elemente, randeaza));
      campCautare = h("input", { type: "search", placeholder: "Caută după titlu, materie, tag…", "aria-label": "Caută", oninput: (e) => { cautare = e.target.value; randeaza(); } });
      const semestre = [...new Set(elemente.map((m) => m.semestru).filter(Boolean))].sort((a, b) => a - b);
      const tipuri = valoriFolosite(cfg.cale, "tip");
      sectiuneEl.append(h("div", { class: "filtre" },
        campCautare,
        h("select", { "aria-label": "Semestru", onchange: (e) => { filtruSemestru = e.target.value; randeaza(); } },
          h("option", { value: "", text: "Toate semestrele" }), semestre.map((s) => h("option", { value: String(s), text: `Semestrul ${s}` }))),
        h("select", { "aria-label": "Tip", onchange: (e) => { filtruTip = e.target.value; randeaza(); } },
          h("option", { value: "", text: "Toate tipurile" }), tipuri.map((t) => h("option", { value: t, text: t })))));
    }
    sectiuneEl.append(listaEl);
    randeaza();
    return sectiuneEl;
  }

  // Zona în care tragi fișiere ca să creezi direct materiale noi
  function zonaRapida(elemente, randeaza) {
    const selector = h("input", { type: "file", multiple: true });
    const text = h("span", { text: "Pentru fiecare fișier se creează un material nou, cu semestrul și luna curente. Apoi completezi detaliile." });
    const zona = h("div", { class: "zona-drop" },
      h("span", { class: "zona-drop__icon", "aria-hidden": "true", text: "⬆" }),
      h("div", { class: "zona-drop__text" }, h("strong", { text: "Trage aici fișierele de la universitate" }), text),
      h("button", { class: "buton", type: "button", text: "Alege fișiere…", onclick: () => selector.click() }),
      selector);
    const proceseaza = async (lista) => {
      const fisiereNoi = [...lista];
      if (!fisiereNoi.length) return;
      let reusite = 0;
      for (const [index, fisier] of fisiereNoi.entries()) {
        const material = LISTE.materiale.nou();
        material.titlu = titluDinNume(fisier.name);
        material.tip = tipDinExtensie(extensie(fisier.name));
        try {
          const r = await incarcaFisier(fisier, (p) => {
            text.textContent = `Se încarcă ${index + 1} din ${fisiereNoi.length}: ${fisier.name} — ${p}%`;
          });
          material.fisier = r.url;
          if (String(r.tip || "").startsWith("image/")) material.imagine = r.url;
          elemente.unshift(material);
          deschise.add(material);
          reusite++;
          randeaza();
          modificat();
        } catch (e) {
          toast(e.message, "eroare");
        }
      }
      text.textContent = reusite
        ? `Gata: ${reusite} ${reusite === 1 ? "material nou" : "materiale noi"}, sus în listă. Completează materia și descrierea, apoi apasă Publică.`
        : "Nu s-a încărcat niciun fișier.";
      selector.value = "";
    };
    selector.addEventListener("change", () => proceseaza(selector.files));
    zona.addEventListener("dragover", (e) => { e.preventDefault(); zona.classList.add("peste"); });
    zona.addEventListener("dragleave", () => zona.classList.remove("peste"));
    zona.addEventListener("drop", (e) => { e.preventDefault(); zona.classList.remove("peste"); proceseaza(e.dataTransfer.files); });
    return zona;
  }

  /* ---------- formulare simple ---------- */
  function editorFormular(id) {
    const cfg = FORMULARE[id];
    const s = h("section", {}, h("div", { class: "sectiune__cap" }, h("h1", { text: cfg.titlu }), h("p", { text: cfg.descriere })));
    for (const panou of cfg.panouri) {
      s.append(h("div", { class: "panou" }, h("h2", { text: panou.titlu }), h("div", { class: "grila" }, panou.campuri.map((d) => camp(DATE, d)))));
    }
    return s;
  }

  /* ---------- fișiere încărcate ---------- */
  function undeEFolosit(url) {
    const locuri = [];
    const contine = (v) => JSON.stringify(v ?? "").includes(url);
    lista(["universitate", "materiale"]).forEach((m) => { if (contine(m)) locuri.push(`Material: ${faraMarcaj(m.titlu) || "fără titlu"}`); });
    lista(["proiecte"]).forEach((p) => { if (contine(p)) locuri.push(`Creație: ${faraMarcaj(p.titlu) || "fără titlu"}`); });
    lista(["cursuri"]).forEach((c) => { if (contine(c)) locuri.push(`Curs: ${faraMarcaj(c.nume) || "fără nume"}`); });
    lista(["secventa"]).forEach((c) => { if (contine(c)) locuri.push(`Studio: ${faraMarcaj(c.eticheta) || "clip"}`); });
    if (contine(DATE.profil)) locuri.push("Profil");
    const { materiale, ...restUniversitate } = DATE.universitate || {};
    if (contine(restUniversitate)) locuri.push("Universitate");
    return locuri;
  }

  function sectiuneFisiere() {
    const s = h("section");
    const listaEl = h("div", { class: "tabel-fisiere" }, h("p", { class: "gri", text: "Se încarcă…" }));
    const selector = h("input", { type: "file", multiple: true });
    const stare = h("span", { text: "Fișierele se pot folosi apoi în orice câmp „Fișier” sau „Imagine”, cu butonul „Din fișiere”." });
    const zona = h("div", { class: "zona-drop" },
      h("span", { class: "zona-drop__icon", "aria-hidden": "true", text: "⬆" }),
      h("div", { class: "zona-drop__text" }, h("strong", { text: "Trage aici fișiere ca să le încarci" }), stare),
      h("button", { class: "buton", type: "button", text: "Alege fișiere…", onclick: () => selector.click() }),
      selector);

    const randeaza = async (forteaza = false) => {
      let toate;
      try { toate = await fisiere(forteaza); } catch (e) { listaEl.replaceChildren(h("p", { class: "mesaj-eroare", text: e.message })); return; }
      actualizeazaMeniu();
      const total = toate.reduce((suma, f) => suma + (f.marime || 0), 0);
      stare.textContent = `${toate.length} ${toate.length === 1 ? "fișier" : "fișiere"} · ${marime(total)} din 1 GB gratuit.`;
      if (!toate.length) { listaEl.replaceChildren(h("p", { class: "gol", text: "Niciun fișier încărcat încă." })); return; }
      listaEl.replaceChildren(...toate.map((f) => {
        const folosit = undeEFolosit(f.url);
        return h("div", { class: "fisier-rand" },
          miniatura(String(f.tip).startsWith("image/") ? f.url : f.cheie),
          h("div", { style: "min-width:0" },
            h("p", { class: "fisier-rand__nume", text: f.nume || f.cheie }),
            h("p", { class: "fisier-rand__meta" }, `${marime(f.marime)} · ${dataOra(f.incarcatLa)} · `,
              folosit.length ? h("span", { class: "fisier-rand__folosit", text: `folosit: ${folosit.join(", ")}` }) : h("span", { class: "fisier-rand__nefolosit", text: "nefolosit" }))),
          h("div", { class: "fisier-rand__actiuni" },
            h("a", { class: "buton buton-mic", href: f.url, target: "_blank", rel: "noopener", text: "Deschide ↗" }),
            h("button", { class: "buton buton-mic", type: "button", text: "Copiază linkul", onclick: async () => {
              try { await navigator.clipboard.writeText(location.origin + f.url); toast("Linkul a fost copiat."); }
              catch { prompt("Copiază linkul:", location.origin + f.url); }
            } }),
            h("button", { class: "buton buton-mic buton-pericol", type: "button", text: "Șterge", onclick: async () => {
              const mesaj = folosit.length
                ? `„${f.nume}” e folosit în: ${folosit.join(", ")}.\nDacă îl ștergi, linkul de pe site nu va mai merge. Îl ștergi oricum?`
                : `Ștergi definitiv „${f.nume}”?`;
              if (!confirm(mesaj)) return;
              try { await api(`fisiere/${encodeURIComponent(f.cheie)}`, { method: "DELETE" }); toast("Fișier șters."); randeaza(true); }
              catch (e) { toast(e.message, "eroare"); }
            } })));
      }));
    };

    const proceseaza = async (listaFisiere) => {
      const noi = [...listaFisiere];
      for (const [i, fisier] of noi.entries()) {
        try {
          await incarcaFisier(fisier, (p) => { stare.textContent = `Se încarcă ${i + 1} din ${noi.length}: ${fisier.name} — ${p}%`; });
        } catch (e) { toast(e.message, "eroare"); }
      }
      selector.value = "";
      await randeaza(true);
      if (noi.length) toast("Încărcare terminată.", "succes");
    };
    selector.addEventListener("change", () => proceseaza(selector.files));
    zona.addEventListener("dragover", (e) => { e.preventDefault(); zona.classList.add("peste"); });
    zona.addEventListener("dragleave", () => zona.classList.remove("peste"));
    zona.addEventListener("drop", (e) => { e.preventDefault(); zona.classList.remove("peste"); proceseaza(e.dataTransfer.files); });

    s.append(h("div", { class: "sectiune__cap" }, h("h1", { text: "Fișiere încărcate" }),
      h("p", { text: "Toate fișierele urcate din admin. Sunt publice: oricine are linkul le poate deschide, așa că nu încărca acte personale." })),
      zona, listaEl);
    randeaza();
    return s;
  }

  /* ---------- versiuni și copii ---------- */
  function descarca(nume, continut, tip) {
    const url = URL.createObjectURL(new Blob([continut], { type: tip }));
    const a = h("a", { href: url, download: nume });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function sectiuneVersiuni() {
    const s = h("section", {}, h("div", { class: "sectiune__cap" }, h("h1", { text: "Versiuni și copii" }),
      h("p", { text: "La fiecare publicare se păstrează versiunea anterioară (ultimele 20). Dacă greșești ceva, o poți restaura." })));
    const stareEl = h("p", { class: "gri", text: "Se încarcă…" });
    const versiuniEl = h("div", {}, h("p", { class: "gri", text: "Se încarcă…" }));
    s.append(h("div", { class: "panou" }, h("h2", { text: "Acum pe site" }), stareEl));
    s.append(h("div", { class: "panou" }, h("h2", { text: "Versiuni anterioare" }), versiuniEl));

    const incarca = async () => {
      try {
        const r = await api("versiuni");
        stareEl.textContent = r.curent
          ? `Site-ul folosește conținutul publicat din admin, ultima dată pe ${dataOra(r.curent.salvatLa)}.`
          : "Site-ul folosește încă fișierul data.js urcat odată cu site-ul. La prima publicare din admin, conținutul trece aici.";
        if (!r.versiuni.length) { versiuniEl.replaceChildren(h("p", { class: "gri", text: "Nicio versiune anterioară încă." })); return; }
        versiuniEl.replaceChildren(...r.versiuni.map((v) => h("div", { class: "versiune" },
          h("div", { class: "versiune__text" }, h("strong", { text: `Publicată pe ${dataOra(v.salvatLa)}` }),
            h("p", { class: "gri mono", text: `înlocuită pe ${dataOra(v.inlocuitLa)}${v.motiv ? " · " + v.motiv : ""}` })),
          h("button", { class: "buton buton-mic", type: "button", text: "Restaurează", onclick: async () => {
            if (areModificari() && !confirm("Ai modificări nepublicate. Restaurarea le înlocuiește. Continui?")) return;
            if (!confirm(`Pui pe site versiunea publicată pe ${dataOra(v.salvatLa)}? Versiunea actuală se păstrează în listă.`)) return;
            try {
              const rez = await api("versiuni/restaureaza", { method: "POST", json: { id: v.id } });
              DATE = rez.date;
              publicat = JSON.stringify(DATE);
              sursa = "admin";
              ultimaPublicare = rez.salvatLa;
              toast("Versiunea a fost restaurată și publicată.", "succes");
              randeazaSectiunea();
            } catch (e) { toast(e.message, "eroare"); }
          } }))));
      } catch (e) {
        stareEl.textContent = e.message;
        versiuniEl.replaceChildren();
      }
    };
    incarca();

    s.append(h("div", { class: "panou" }, h("h2", { text: "Copie de siguranță" }),
      h("p", { class: "gri", text: "Descarcă tot conținutul într-un fișier. data.js poate înlocui fișierul cu același nume din zip-ul site-ului." }),
      h("div", { class: "randuri-butoane" },
        h("button", { class: "buton", type: "button", text: "Descarcă data.js", onclick: () => descarca("data.js",
          `/* data.js — exportat din /admin pe ${dataOra(new Date().toISOString())} */\nconst DATE = ${JSON.stringify(DATE, null, 2)};\n`, "application/javascript") }),
        h("button", { class: "buton", type: "button", text: "Descarcă JSON", onclick: () => descarca("continut-site.json", JSON.stringify(DATE, null, 2), "application/json") }))));

    const editor = h("textarea", { class: "json-editor", spellcheck: "false", "aria-label": "Conținutul site-ului în format JSON" });
    editor.value = JSON.stringify(DATE, null, 2);
    s.append(h("div", { class: "panou" }, h("h2", { text: "Editare avansată (JSON)" }),
      h("p", { class: "gri", text: "Tot conținutul site-ului, inclusiv fps și culorile categoriilor. Folosește-l doar dacă știi ce faci; „Aplică” nu publică, doar pregătește." }),
      h("div", { style: "margin-top:12px" }, editor),
      h("div", { class: "randuri-butoane" },
        h("button", { class: "buton", type: "button", text: "Aplică", onclick: () => {
          try {
            const nou = JSON.parse(editor.value);
            if (!nou || typeof nou !== "object" || !nou.profil || !nou.universitate || !Array.isArray(nou.proiecte)) throw new Error("Lipsesc părțile profil, proiecte sau universitate.");
            DATE = nou;
            modificat();
            toast("Aplicat. Apasă Publică ca să apară pe site.", "succes");
          } catch (e) { toast(`JSON invalid: ${e.message}`, "eroare"); }
        } }),
        h("button", { class: "buton buton-text", type: "button", text: "Reîmprospătează", onclick: () => { editor.value = JSON.stringify(DATE, null, 2); } }))));

    s.append(h("div", { class: "panou" }, h("h2", { text: "Revino la data.js din fișiere" }),
      h("p", { class: "gri", text: "Site-ul ignoră conținutul din admin și folosește din nou fișierul data.js urcat cu site-ul. Conținutul din admin rămâne în versiunile anterioare." }),
      h("div", { class: "randuri-butoane" }, h("button", { class: "buton buton-pericol", type: "button", text: "Revino la data.js", onclick: async () => {
        if (!confirm("Sigur? Site-ul va arăta din nou conținutul din fișierul data.js.")) return;
        try {
          await api("date", { method: "DELETE" });
          await incarcaDate(true);
          toast("Gata: site-ul folosește din nou data.js.", "succes");
          randeazaSectiunea();
        } catch (e) { toast(e.message, "eroare"); }
      } }))));
    return s;
  }

  /* ---------- meniu și navigare ---------- */
  const MENIU = [
    { grup: "Încarcă" },
    { id: "materiale", titlu: "Materiale universitate", numar: () => lista(["universitate", "materiale"]).length, marcaje: () => numarMarcaje(DATE.universitate && DATE.universitate.materiale) },
    { id: "proiecte", titlu: "Creații", numar: () => lista(["proiecte"]).length, marcaje: () => numarMarcaje(DATE.proiecte) },
    { id: "secventa", titlu: "Secvența din studio", numar: () => lista(["secventa"]).length },
    { id: "fisiere", titlu: "Fișiere încărcate", numar: () => (fisiereCache ? fisiereCache.length : "") },
    { grup: "Pagini" },
    { id: "profil", titlu: "Profil și despre mine", marcaje: () => numarMarcaje(DATE.profil) },
    { id: "contact", titlu: "Linkuri și contact", marcaje: () => numarMarcaje([DATE.linkuri, DATE.contact]) },
    { id: "skills", titlu: "Skills", numar: () => lista(["skills"]).length, marcaje: () => numarMarcaje(DATE.skills) },
    { id: "parcurs", titlu: "Parcurs (studii, AIESEC…)", numar: () => lista(["parcurs"]).length, marcaje: () => numarMarcaje(DATE.parcurs) },
    { id: "cursuri", titlu: "Cursuri și certificate", numar: () => lista(["cursuri"]).length, marcaje: () => numarMarcaje(DATE.cursuri) },
    { id: "platforme", titlu: "Platforme", numar: () => lista(["platforme"]).length, marcaje: () => numarMarcaje(DATE.platforme) },
    { id: "experienta", titlu: "Experiență", numar: () => lista(["experienta"]).length, marcaje: () => numarMarcaje(DATE.experienta) },
    { id: "universitate", titlu: "Universitate (date)", marcaje: () => { const { materiale, ...rest } = DATE.universitate || {}; return numarMarcaje(rest); } },
    { grup: "Siguranță" },
    { id: "versiuni", titlu: "Versiuni și copii" },
    { grup: "Cont" },
    { href: "/", titlu: "Vezi site-ul ↗" },
    { actiune: "iesi", titlu: "Ieși din cont" },
  ];

  function construiesteMeniu() {
    const meniu = $("#meniu");
    meniu.replaceChildren(...MENIU.map((m) => {
      if (m.grup) return h("p", { class: "meniu__grup", text: m.grup });
      if (m.href) return h("a", { class: "meniu__link", href: m.href, target: "_blank", rel: "noopener", text: m.titlu });
      if (m.actiune) return h("a", { class: "meniu__link", href: "#", onclick: (e) => { e.preventDefault(); iesi(); }, text: m.titlu });
      return h("a", { class: "meniu__link", href: `#${m.id}`, "data-id": m.id }, h("span", { text: m.titlu }),
        h("span", { class: "meniu__marcaj", hidden: true, title: "câmpuri cu [DE COMPLETAT]" }), h("span", { class: "meniu__numar" }));
    }));
  }

  function actualizeazaMeniu() {
    for (const m of MENIU) {
      if (!m.id) continue;
      const link = $(`.meniu__link[data-id="${m.id}"]`);
      if (!link) continue;
      link.toggleAttribute("aria-current", m.id === sectiune);
      if (m.id === sectiune) link.setAttribute("aria-current", "page");
      const marc = m.marcaje ? m.marcaje() : 0;
      const eMarcaj = link.querySelector(".meniu__marcaj");
      eMarcaj.hidden = !marc;
      eMarcaj.textContent = marc;
      link.querySelector(".meniu__numar").textContent = m.numar ? m.numar() : "";
    }
  }

  function randeazaSectiunea() {
    const continut = $("#continut");
    let el;
    if (LISTE[sectiune]) el = editorLista(sectiune);
    else if (FORMULARE[sectiune]) el = editorFormular(sectiune);
    else if (sectiune === "fisiere") el = sectiuneFisiere();
    else if (sectiune === "versiuni") el = sectiuneVersiuni();
    else { sectiune = "materiale"; el = editorLista("materiale"); }
    continut.replaceChildren(el);
    actualizeazaStare();
  }

  function dinAdresa() {
    const id = location.hash.slice(1);
    sectiune = MENIU.some((m) => m.id === id) ? id : "materiale";
    randeazaSectiunea();
    window.scrollTo(0, 0);
  }

  /* ---------- pornire, login, publicare ---------- */
  function evalueazaDate(text) {
    // data.js e codul site-ului (nu vine de la altcineva); îl rulăm ca să obținem DATE
    return new Function(`${text}\n;return DATE;`)();
  }

  async function incarcaDate(original = false) {
    const raspuns = await fetch(original ? "/data.js?original=1" : "/data.js", { cache: "no-store" });
    const text = await raspuns.text();
    sursa = text.startsWith("/* Conținut salvat din /admin") ? "admin" : "fisiere";
    const m = /salvat din \/admin la ([^.\s]+(?:\.\d+Z)?)/.exec(text);
    ultimaPublicare = m ? m[1] : "";
    DATE = evalueazaDate(text);
    publicat = JSON.stringify(DATE);
  }

  async function pornesteAplicatia() {
    arata("incarcare");
    try {
      await incarcaDate();
    } catch (e) {
      arata("configurare");
      $("#stare-configurare").textContent = `Nu am putut citi data.js: ${e.message}`;
      return;
    }
    construiesteMeniu();
    arata("aplicatie");
    dinAdresa();
    fisiere().then(actualizeazaMeniu).catch(() => {});
  }

  function cereLogin() {
    arata("login");
    $("#eroare-login").textContent = DATE ? "Sesiunea a expirat. Intră din nou; modificările tale sunt păstrate." : "";
    setTimeout(() => $("#parola").focus(), 50);
  }

  async function publica() {
    if (!areModificari()) return;
    const buton = $("#publica");
    buton.disabled = true;
    buton.textContent = "Se publică…";
    try {
      const r = await api("date", { method: "PUT", json: DATE });
      publicat = JSON.stringify(DATE);
      sursa = "admin";
      ultimaPublicare = r.salvatLa;
      toast("Publicat! Modificările apar pe site în cel mult un minut.", "succes");
    } catch (e) {
      toast(e.message, "eroare");
    } finally {
      buton.textContent = "Publică";
      actualizeazaStare();
    }
  }

  async function iesi() {
    if (areModificari() && !confirm("Ai modificări nepublicate. Ieși oricum?")) return;
    try { await api("logout", { method: "POST" }); } catch { /* oricum ieșim */ }
    publicat = JSON.stringify(DATE);
    location.href = "/admin";
  }

  async function porneste() {
    $("#form-login").addEventListener("submit", async (e) => {
      e.preventDefault();
      const parola = $("#parola").value;
      const eroare = $("#eroare-login");
      if (!parola) { eroare.textContent = "Scrie parola."; return; }
      eroare.textContent = "";
      const buton = e.submitter || $("#form-login button[type=submit]");
      buton.disabled = true;
      try {
        await api("login", { method: "POST", json: { parola } });
        $("#parola").value = "";
        if (DATE) { arata("aplicatie"); toast("Ai intrat din nou. Poți continua."); }
        else await pornesteAplicatia();
      } catch (err) {
        eroare.textContent = err.message;
      } finally {
        buton.disabled = false;
      }
    });
    $("#publica").addEventListener("click", publica);
    $("#iesi").addEventListener("click", iesi);
    window.addEventListener("hashchange", () => { if (DATE) dinAdresa(); });
    window.addEventListener("beforeunload", (e) => {
      if (areModificari()) { e.preventDefault(); e.returnValue = ""; }
    });
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s" && !$("#aplicatie").hidden) {
        e.preventDefault();
        publica();
      }
    });

    let stare;
    try {
      const r = await fetch("/api/stare", { cache: "no-store", credentials: "same-origin" });
      stare = await r.json();
    } catch {
      arata("configurare");
      $("#stare-configurare").textContent = "Serverul adminului nu răspunde. Verifică dacă ai urcat zip-ul nou, care conține fișierul _worker.js.";
      return;
    }
    if (!stare.kv || !stare.parola) {
      $("#pas-kv").classList.toggle("gata", stare.kv);
      $("#pas-parola").classList.toggle("gata", stare.parola);
      $("#stare-configurare").textContent = `Stocare (SITE): ${stare.kv ? "gata" : "lipsește"} · Parolă (ADMIN_PASSWORD): ${stare.parola ? "gata" : "lipsește"}`;
      arata("configurare");
      return;
    }
    if (!stare.autentificat) { cereLogin(); return; }
    await pornesteAplicatia();
  }

  porneste();
})();
