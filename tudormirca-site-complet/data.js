/* ==========================================================================
   data.js — AICI SE AFLĂ TOT CONȚINUTUL SITE-ULUI

   Mai simplu: intră pe tudormirca.com/admin, unde schimbi tot conținutul
   din formulare și încarci fișiere, fără să umbli în cod. După prima
   publicare din admin, site-ul folosește conținutul de acolo, iar acest
   fișier rămâne doar ca punct de pornire (sau copie de siguranță).

   Dacă preferi totuși să editezi aici: schimbi valorile de mai jos,
   salvezi fișierul și urci din nou site-ul.

   Reguli simple:
   - Textele stau între ghilimele: "așa". Fiecare element se termină cu virgulă.
   - Tot ce conține [DE COMPLETAT] apare pe site într-o etichetă punctată,
     ca să vezi ușor ce mai ai de scris.
   - Un link care conține încă [DE COMPLETAT] nu duce nicăieri: la click
     afișează doar un mesaj scurt. Devine link real când pui adresa corectă.
   - Pe site apar automat: numărul de creații, lista de categorii, culorile
     categoriilor și timecode-urile IN/OUT. Pe acestea nu le scrii.
   - Secțiunile noi (parcurs, cursuri, platforme) apar pe site și dacă ai
     publicat deja din admin: ce lipsește de acolo se ia din acest fișier.
   ========================================================================== */

const DATE = {
  /* ------------------------------------------------------------------------
     TIMECODE — cadre pe secundă folosite la calculul timecode-urilor.
     Timecode-urile au formatul ore:minute:secunde:cadre, ex: 00:02:14:08
     ------------------------------------------------------------------------ */
  fps: 25,

  /* ------------------------------------------------------------------------
     CULORILE CATEGORIILOR — prima categorie găsită în creații primește prima
     culoare, a doua categorie pe a doua și așa mai departe.
     ------------------------------------------------------------------------ */
  culoriCategorii: ["#38bdf8", "#a78bfa", "#34d399", "#f472b6", "#facc15", "#60a5fa", "#fb7185", "#a3e635"],

  /* ------------------------------------------------------------------------
     PROFIL — cine ești
     ------------------------------------------------------------------------ */
  profil: {
    nume: "Tudor Mirca",
    initiale: "TM", // apar în pătratul din stânga sus
    rol: "[DE COMPLETAT]", // ex: "Video editor", "Designer", "Developer"
    aniExperienta: "[DE COMPLETAT]", // pune doar numărul, ex: 5
    varsta: 20, // doar numărul; apare în fișa din studio ca „20 de ani”
    avatar: "assets/avatar.svg", // înlocuiește cu poza ta, ex: "assets/tudor.jpg"
    descriereScurta: "[DE COMPLETAT] O propoziție despre ce faci și pentru cine.",

    // Ecranul mare de sus. Pune o imagine 16:9, ex: un cadru din showreel.
    showreel: {
      imagine: "assets/showreel.svg",
      alt: "Cadru abstract cu lumină portocalie pe fundal albastru închis",

      // Opțional: un fișier video, ex: "assets/showreel.mp4". Apare butonul
      // „Redă showreel”, iar imaginea de mai sus se vede până la pornire.
      // Ține fișierul mic (sub 25 MB), altfel site-ul se încarcă greu.
      video: "",
    },

    // Blocul „Despre mine”: fiecare rând apare ca o subtitrare separată.
    despre: [
      "Salut, sunt Tudor.",
      "[DE COMPLETAT] Ce faci, pe scurt.",
      "[DE COMPLETAT] Ce îți place să creezi.",
      "[DE COMPLETAT] Cu cine vrei să lucrezi.",
    ],

    acumLucrezLa: "[DE COMPLETAT]", // apare în footer

    // Pune fișierul în assets/ și scrie aici calea, ex: "assets/cv-tudor.pdf"
    cv: "[DE COMPLETAT]",
  },

  /* ------------------------------------------------------------------------
     LINKURI — adrese complete, ex: "https://github.com/numele-tau"
     La email scrii doar adresa, ex: "nume@exemplu.ro"
     ------------------------------------------------------------------------ */
  linkuri: {
    instagram: "[DE COMPLETAT]",
    youtube: "[DE COMPLETAT]",
    github: "[DE COMPLETAT]",
    email: "[DE COMPLETAT]",
  },

  /* ------------------------------------------------------------------------
     CONTACT — textele din footer
     ------------------------------------------------------------------------ */
  contact: {
    titlu: "Hai să lucrăm împreună",
    text: "[DE COMPLETAT] Spune ce fel de proiecte cauți și cum preferi să fii contactat.",
  },

  /* ------------------------------------------------------------------------
     SECVENȚA DIN STUDIO — clipurile care rulează pe monitorul de sus, în
     ordinea de pe timeline. Fiecare clip pornește când ajunge capul de redare.
       eticheta  numele de pe timeline, ex: "Acasă"
       media     clip video scurt (.mp4) sau GIF, din assets/ sau din admin
       secunde   cât stă clipul pe timeline; dacă e mai lung decât fișierul,
                 clipul se reia (ex: 4.8 = de două ori un clip de 2.4 s)
     Clipurile se văd la mărimea lor naturală, centrate, ca să nu se strice
     calitatea. Fără secvență, timeline-ul arată creațiile.
     ------------------------------------------------------------------------ */
  secventa: [
    { eticheta: "Acasă", media: "assets/studio/trezire.mp4", secunde: 5.87 },
    { eticheta: "Pe drum", media: "assets/studio/drum-spre-universitate.mp4", secunde: 4.1 },
    { eticheta: "Universitate", media: "assets/studio/lucru.mp4", secunde: 4.8 },
    { eticheta: "Pe drum", media: "assets/studio/drum-spre-casa.mp4", secunde: 4.1 },
    { eticheta: "Acasă", media: "assets/studio/lucru.mp4", secunde: 4.8 },
    { eticheta: "Acasă", media: "assets/studio/culcare.mp4", secunde: 5.87 },
  ],

  /* ------------------------------------------------------------------------
     CREAȚII DE ALE MELE — imaginile din portofoliu, în ordinea de aici
     (în cod lista se numește tot „proiecte”, ca să nu se piardă nimic din admin)

     Ca să adaugi o creație: copiază un bloc { ... } întreg, lipește-l unde
     vrei să apară în listă și schimbă valorile.

     Câmpuri:
       titlu      numele creației
       categorie  ex: "Fotografie", "Design", "Video" (o categorie nouă
                  primește automat filtru și culoare)
       taguri     cuvinte-cheie; folosește aceleași nume ca la skills, ca un
                  click pe un skill să găsească creațiile legate de el
       data       ex: "Mar 2025"
       imagine    calea către imagine, din assets/ sau încărcată din admin
       alt        descrierea imaginii, pentru cititoarele de ecran
       descriere  textul afișat când deschizi creația
       linkuri    opțional: butoane, ex: spre Instagram sau Behance
       durata     opțional, doar la video: timecode-ul, ex: 00:02:14:08

     Titlurile și categoriile de mai jos sunt doar exemple: schimbă-le cu ale tale.
     ------------------------------------------------------------------------ */
  proiecte: [
    {
      titlu: "Creația 1 [DE COMPLETAT]",
      categorie: "Fotografie",
      taguri: ["Skill 1", "Skill 2"],
      data: "[DE COMPLETAT]",
      imagine: "assets/proiect-1.svg",
      alt: "Cadru abstract cu o șosea care se pierde spre un orizont luminos, noaptea",
      descriere: "[DE COMPLETAT] Ce ai creat, cu ce și ce poveste are.",
      linkuri: [{ text: "Vezi creația", url: "[DE COMPLETAT]" }],
    },
    {
      titlu: "Creația 2 [DE COMPLETAT]",
      categorie: "Design",
      taguri: ["Skill 3"],
      data: "[DE COMPLETAT]",
      imagine: "assets/proiect-2.svg",
      alt: "Cadru abstract cu valuri desenate din linii pe fundal turcoaz",
      descriere: "[DE COMPLETAT] Ce ai creat, cu ce și ce poveste are.",
      linkuri: [{ text: "Vezi creația", url: "[DE COMPLETAT]" }],
    },
    {
      titlu: "Creația 3 [DE COMPLETAT]",
      categorie: "Video",
      taguri: ["Skill 4", "Skill 5"],
      data: "[DE COMPLETAT]",
      imagine: "assets/proiect-3.svg",
      alt: "Cadru abstract cu siluete de clădiri și ferestre aprinse la amurg",
      descriere: "[DE COMPLETAT] Ce ai creat, cu ce și ce poveste are.",
      linkuri: [{ text: "Vezi creația", url: "[DE COMPLETAT]" }],
    },
    {
      titlu: "Creația 4 [DE COMPLETAT]",
      categorie: "Fotografie",
      taguri: ["Skill 1", "Skill 6"],
      data: "[DE COMPLETAT]",
      imagine: "assets/proiect-4.svg",
      alt: "Cadru abstract cu un soare mare deasupra unor dealuri suprapuse",
      descriere: "[DE COMPLETAT] Ce ai creat, cu ce și ce poveste are.",
      linkuri: [{ text: "Vezi creația", url: "[DE COMPLETAT]" }],
    },
    {
      titlu: "Creația 5 [DE COMPLETAT]",
      categorie: "Design",
      taguri: ["Skill 2", "Skill 3"],
      data: "[DE COMPLETAT]",
      imagine: "assets/proiect-5.svg",
      alt: "Cadru abstract cu o undă audio verde pe fundal întunecat",
      descriere: "[DE COMPLETAT] Ce ai creat, cu ce și ce poveste are.",
      linkuri: [{ text: "Vezi creația", url: "[DE COMPLETAT]" }],
    },
    {
      titlu: "Creația 6 [DE COMPLETAT]",
      categorie: "Video",
      taguri: ["Skill 4"],
      data: "[DE COMPLETAT]",
      imagine: "assets/proiect-6.svg",
      alt: "Cadru abstract cu lumini rotunde, neclare, violet și roz",
      descriere: "[DE COMPLETAT] Ce ai creat, cu ce și ce poveste are.",
      linkuri: [{ text: "Vezi creația", url: "[DE COMPLETAT]" }],
    },
  ],

  /* ------------------------------------------------------------------------
     SKILLS — fiecare primește automat un card.
     Click pe card = arată proiectele care au acel skill în „taguri”.
     ------------------------------------------------------------------------ */
  skills: [
    { nume: "Skill 1", detaliu: "[DE COMPLETAT]" },
    { nume: "Skill 2", detaliu: "[DE COMPLETAT]" },
    { nume: "Skill 3", detaliu: "[DE COMPLETAT]" },
    { nume: "Skill 4", detaliu: "[DE COMPLETAT]" },
    { nume: "Skill 5", detaliu: "[DE COMPLETAT]" },
    { nume: "Skill 6", detaliu: "[DE COMPLETAT]" },
  ],

  /* ------------------------------------------------------------------------
     PARCURS — unde ai învățat / înveți și organizațiile din care faci parte.
     Apar pe o linie de timp, în ordinea de aici (cel mai recent sus).

     Câmpuri:
       tip         ex: "Universitate", "Colegiu", "Organizație"
       nume        numele complet al instituției sau organizației
       oras        orașul
       perioada    ex: "2022 – 2026" sau "2026 – prezent"
       detalii     facultate, specialitate, rol, departament…
       descriere   1–2 propoziții
       puncte      opțional: realizări sau ce faci acolo, câte una pe rând
       softSkills  opțional: listă scurtă
       hardSkills  opțional: listă scurtă
       link        opțional: site-ul instituției
     ------------------------------------------------------------------------ */
  parcurs: [
    {
      tip: "Organizație",
      nume: "AIESEC Chișinău",
      oras: "Chișinău",
      perioada: "nov. 2026 – prezent",
      detalii: "Membru · Departamentul Marketing & PR",
      descriere:
        "Organizație internațională condusă de tineri, care dezvoltă leadership prin voluntariat, stagii și schimburi în alte țări. Am intrat în echipă pe 19 noiembrie 2026.",
      puncte: [
        "Creez strategia de conținut pentru canalele AIESEC Chișinău",
        "Urmăresc rezultatele postărilor și trag concluzii din cifre (analytics)",
      ],
      hardSkills: ["Content strategy", "Analytics"],
      link: "https://aiesec.org",
    },
    {
      tip: "Universitate",
      nume: "Universitatea de Stat din Moldova",
      oras: "Chișinău",
      perioada: "2026 – prezent",
      detalii: "Facultatea de Jurnalism și Științe ale Comunicării · Producție multimedia · Licență",
      descriere:
        "Studiez producția multimedia: o specialitate nouă, lansată de USM în 2022, care leagă jurnalismul de video, foto, sunet și design pentru media digitală.",
      puncte: ["Administratorul paginii de Instagram a Facultății de Jurnalism și Științe ale Comunicării (FJȘC)"],
      link: "https://usm.md",
    },
    {
      tip: "Colegiu",
      nume: "Centrul de Excelență în Informatică și Tehnologii Informaționale (CEITI)",
      oras: "Chișinău",
      perioada: "2022 – 2026",
      detalii: "Dezvoltarea și administrarea aplicațiilor web",
      descriere:
        "Patru ani de formare în dezvoltare web: de la structura și aspectul paginilor până la programare pe server, baze de date și administrarea serverelor.",
      softSkills: ["Comunicare", "Lucru în echipă", "Managementul proiectelor", "Organizarea timpului", "Rezolvarea problemelor"],
      hardSkills: [
        "HTML și CSS",
        "JavaScript",
        "PHP",
        "Framework-uri MVC",
        "Baze de date MySQL",
        "Administrarea serverelor web",
        "Testarea aplicațiilor web",
        "Animații web",
      ],
      link: "https://ceiti.md",
    },
  ],

  /* ------------------------------------------------------------------------
     CURSURI ȘI CERTIFICATE
       nume, organizator, data, ore (opțional), descriere,
       imagine (poza certificatului), alt, link (opțional)
     ------------------------------------------------------------------------ */
  cursuri: [
    {
      nume: "Etica și integritatea academică",
      organizator: "Ministerul Educației și Cercetării · platforma Integritate Academică",
      data: "2 noiembrie 2026",
      ore: "8 ore academice",
      descriere: "Normele integrității academice, prevenirea plagiatului și responsabilitatea în studiu și cercetare.",
      imagine: "assets/certificat-etica-integritate-academica.jpg",
      alt: "Certificat de absolvire a programului de formare „Etica și integritatea academică”, eliberat pe numele Mirca Tudor",
    },
  ],

  /* ------------------------------------------------------------------------
     PLATFORME UNDE SUNT ACTIV
       nume, rol, descriere, url, iconita ("instagram", "youtube", "github"
       sau "web" pentru orice altceva)
     ------------------------------------------------------------------------ */
  platforme: [
    {
      nume: "Instagram · FJȘC USM",
      rol: "Administrator",
      descriere: "Gestionez pagina de Instagram a Facultății de Jurnalism și Științe ale Comunicării.",
      url: "[DE COMPLETAT]",
      iconita: "instagram",
    },
  ],

  /* ------------------------------------------------------------------------
     EXPERIENȚĂ — „Pe unde am lucrat”. Ascunsă deocamdată: pune true când
     ai ce scrie aici. Ordonează de la cea mai recentă la cea mai veche.
     ------------------------------------------------------------------------ */
  arataExperienta: false,

  experienta: [
    {
      perioada: "[DE COMPLETAT]",
      rol: "Rol [DE COMPLETAT]",
      companie: "Companie [DE COMPLETAT]",
      descriere: "[DE COMPLETAT] Ce ai făcut aici și ce ai reușit.",
    },
    {
      perioada: "[DE COMPLETAT]",
      rol: "Rol [DE COMPLETAT]",
      companie: "Companie [DE COMPLETAT]",
      descriere: "[DE COMPLETAT] Ce ai făcut aici și ce ai reușit.",
    },
    {
      perioada: "[DE COMPLETAT]",
      rol: "Rol [DE COMPLETAT]",
      companie: "Companie [DE COMPLETAT]",
      descriere: "[DE COMPLETAT] Ce ai făcut aici și ce ai reușit.",
    },
  ],

  /* ========================================================================
     UNIVERSITATE — conținutul paginii universitate.html
     ======================================================================== */
  universitate: {
    institutie: "Universitatea de Stat din Moldova",
    facultate: "Facultatea de Jurnalism și Științe ale Comunicării",
    specialitate: "Producție multimedia",
    ciclu: "Licență [DE COMPLETAT]", // ex: "Licență", "Master"
    descriere: "[DE COMPLETAT] Ce studiezi, pe scurt, și ce te interesează cel mai mult.",
    site: "[DE COMPLETAT]", // adresa site-ului universității, ex: "https://usm.md"

    // Anul în care ai început și câți ani durează studiile. Din ele se
    // calculează automat semestrele (sep–ian și feb–iun), anul și semestrul
    // în care ești acum și progresul de pe timeline.
    anInceput: "2025 [DE COMPLETAT]",
    aniStudiu: "3 [DE COMPLETAT]",

    // Imaginea mare de sus (16:9). Pune o poză cu universitatea, ex: "assets/usm.jpg"
    imagine: "assets/universitate.svg",
    alt: "Cadru abstract cu arcade și coloane în lumină albastră",

    /* ----------------------------------------------------------------------
       MATERIALE — tot ce încarci de la universitate

       Pune fișierele în folderul universitate/ și scrie aici calea lor,
       ex: "universitate/referat-istorie.pdf". Ține fiecare fișier sub 25 MB.
       Atenție: tot ce pui aici e public. Nu încărca acte personale.

       Câmpuri:
         titlu      numele materialului
         materie    materia; din ele se fac automat cardurile de la „Materii”
         tip        ex: "Document", "Proiect", "Video", "Prezentare", "Notițe",
                    "Certificat", "Link". Un tip nou primește automat culoare,
                    iconiță și filtru.
         semestru   numărul semestrului: 1, 2, 3...
         data       ex: "Oct 2025"
         descriere  textul afișat la materialul selectat
         fisier     opțional: fișierul din universitate/ (apar butoanele
                    „Deschide” și „Descarcă”)
         imagine    opțional: o imagine 16:9; fără ea se desenează o copertă
                    după tip
         taguri     opțional: cuvinte-cheie, se găsesc și prin căutare
         linkuri    opțional: butoane în plus, ca la proiecte
       ---------------------------------------------------------------------- */
    materiale: [
      {
        titlu: "Omul care aleargă · Ruta Nr. 20",
        materie: "[DE COMPLETAT]",
        tip: "Prezentare",
        semestru: 3,
        data: "Nov 2026",
        descriere:
          "Prezentare despre procesul creativ, de la idee la rezultat, pe un proiect propriu: un traseu de alergare de 20 km prin Chișinău care desenează pe hartă silueta unui om care aleargă (GPS art). Alergat pe 20.11.2026, în 2h 9m.",
        imagine: "universitate/omul-care-alearga/img/coperta.jpg",
        alt: "Silueta unui om care aleargă, desenată cu roșu pe străzile Chișinăului",
        taguri: ["GPS art", "Strava", "Proces creativ"],
        linkuri: [{ text: "Deschide prezentarea", url: "universitate/omul-care-alearga/" }],
      },
      {
        titlu: "Camera de producție și accesorii adiționale",
        materie: "Mijloace tehnice în multimedia",
        tip: "Prezentare",
        semestru: 3,
        data: "Nov 2026",
        descriere:
          "Prezentare interactivă cu o cameră 3D modelată în Blender: componentele camerei de producție, accesoriile, configurațiile tipice și drumul imaginii prin cameră. Tema 5.1.",
        imagine: "universitate/camera-productie/img/coperta.jpg",
        alt: "Cameră de producție echipată cu matte box, follow focus, monitor și microfon",
        taguri: ["3D", "Blender", "Tema 5.1"],
        linkuri: [{ text: "Deschide prezentarea 3D", url: "universitate/camera-productie/" }],
      },
      {
        titlu: "Șase măști — storyboard",
        materie: "Materia 3 [DE COMPLETAT]",
        tip: "Proiect",
        semestru: 3,
        data: "Nov 2026",
        descriere:
          "Scurtmetraj despre un reality show cu șase concurenți care joacă rolurile cerute de societate. Doar Mihai rămâne el însuși. Mesajul: câștigi atunci când nu mai joci un rol pentru alții.",
        fisier: "[DE COMPLETAT]",
        taguri: ["Storyboard", "Scurtmetraj"],
        linkuri: [{ text: "Vezi storyboard-ul", url: "[DE COMPLETAT]" }],
      },
      {
        titlu: "Proiect video [DE COMPLETAT]",
        materie: "Materia 3 [DE COMPLETAT]",
        tip: "Video",
        semestru: 3,
        data: "[DE COMPLETAT]",
        descriere: "[DE COMPLETAT] Ce ai făcut și ce ai învățat.",
        linkuri: [{ text: "Vezi pe YouTube", url: "[DE COMPLETAT]" }],
      },
      {
        titlu: "Prezentare [DE COMPLETAT]",
        materie: "Materia 2 [DE COMPLETAT]",
        tip: "Prezentare",
        semestru: 2,
        data: "[DE COMPLETAT]",
        descriere: "[DE COMPLETAT] Despre ce a fost prezentarea.",
        fisier: "[DE COMPLETAT]",
      },
      {
        titlu: "Certificat [DE COMPLETAT]",
        materie: "Materia 2 [DE COMPLETAT]",
        tip: "Certificat",
        semestru: 2,
        data: "[DE COMPLETAT]",
        descriere: "[DE COMPLETAT] Pentru ce l-ai primit.",
        fisier: "[DE COMPLETAT]",
      },
      {
        titlu: "Notițe de curs [DE COMPLETAT]",
        materie: "Materia 2 [DE COMPLETAT]",
        tip: "Notițe",
        semestru: 2,
        data: "[DE COMPLETAT]",
        descriere: "[DE COMPLETAT] Ce conțin notițele.",
        fisier: "[DE COMPLETAT]",
      },
      {
        titlu: "Referat [DE COMPLETAT]",
        materie: "Materia 1 [DE COMPLETAT]",
        tip: "Document",
        semestru: 1,
        data: "[DE COMPLETAT]",
        descriere: "[DE COMPLETAT] Tema referatului.",
        fisier: "[DE COMPLETAT]",
      },
      {
        titlu: "Link util [DE COMPLETAT]",
        materie: "Materia 1 [DE COMPLETAT]",
        tip: "Link",
        semestru: 1,
        data: "[DE COMPLETAT]",
        descriere: "[DE COMPLETAT] De ce e util.",
        linkuri: [{ text: "Deschide linkul", url: "[DE COMPLETAT]" }],
      },
    ],
  },
};
