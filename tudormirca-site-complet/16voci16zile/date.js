/* ==========================================================================
   16voci16zile/date.js — CONȚINUTUL EXPOZIȚIEI „16 ZILE. 16 VOCI.”

   Aici adaugi posterele (vocile) și echipa. Paginile se construiesc singure:
   - tudormirca.com/16voci16zile/           pagina expoziției
   - tudormirca.com/16voci16zile/<slug>/    pagina unei voci (unde duce QR-ul)

   Reguli simple:
   - Textele stau între ghilimele: "așa". Fiecare element se termină cu virgulă.
   - „slug” e adresa vocii: doar litere mici, cifre și cratimă, ex: "lalophobia".
     Odată tipărit pe QR, nu-l mai schimba.
   - Pozele stau în folderul 16voci16zile/img/.
   ========================================================================== */

const EXPOZITIE = {
  titlu: "16 Zile. 16 Voci.",
  campanie: "Campania națională „16 zile de activism împotriva violenței în bază de gen”",
  perioadaCampaniei: "25 noiembrie – 10 decembrie",
  // Ziua lansării, marcată pe cele 16 zile (format zi.lună)
  lansare: { zi: "30.11", data: "30 noiembrie 2026", loc: "Mediacor", oras: "Chișinău" },
  autori: "Studenții specialității Producție multimedia, grupele PM265 și PM266",
  facultate: "Facultatea de Jurnalism și Științe ale Comunicării · Universitatea de Stat din Moldova",
  coordonatori: ["Laura Tugarev, dr., conf. univ.", "Adriana Hămuraru, asist. univ."],

  concept: {
    titlu: "Fobii și manii",
    text: [
      "Violența în bază de gen nu lasă doar vânătăi. Lasă frici — de a vorbi, de sunete, de atingere — și obsesii prin care omul încearcă să țină frica sub control.",
      "Am ales fobiile și maniile ca limbaj vizual pentru urmele pe care nu le vede nimeni. Fiecare poster e o voce. Scanează codul QR de lângă el ca s-o asculți.",
    ],
  },

  cifre: [
    { valoare: 92, eticheta: "studenți" },
    { valoare: 2, eticheta: "grupe" },
    { valoare: 7, eticheta: "departamente" },
    { valoare: 16, eticheta: "voci", sufix: "–20" },
  ],

  etape: [
    { data: "09–13.11", titlu: "Concept și planificare" },
    { data: "16.11", titlu: "Fotosesia PM265" },
    { data: "20.11", titlu: "Fotosesia PM266" },
    { data: "23–27.11", titlu: "Editare și print" },
    { data: "30.11", titlu: "Lansarea la Mediacor" },
  ],

  /* ------------------------------------------------------------------------
     VOCILE — câte un poster fiecare, în ordinea din expoziție
       slug          adresa paginii (ce e scris în QR)
       alias         opțional: alte adrese care duc tot aici
       titlu         titlul mare de pe poster
       titluRo       numele în română
       etichete      rândul mic de sub titlu
       descriere     textul în română de pe poster
       descriereEn   textul în engleză de pe poster
       efect         ce poate lăsa violența în urmă
       relevanta     de ce contează pentru campania 16 zile
       poster/foto   imaginile din img/ (posterul întreg și doar fotografia)
     ------------------------------------------------------------------------ */
  voci: [
    {
      slug: "lalophobia",
      alias: ["lalofobia"],
      titlu: "LALOPHOBIA",
      titluRo: "Lalofobia",
      etichete: "fear of speaking / anxiety / avoidance of verbal communication",
      descriere:
        "Lalofobia este frica intensă de a vorbi sau de a rosti cuvinte. Poate fi provocată de teama de a nu se bâlbâi, de a pronunța greșit sau de a fi judecat de ceilalți.",
      descriereEn:
        "Lalophobia is an intense fear of speaking or talking. It can be caused by the fear of stuttering, mispronouncing words, or being judged by others.",
      efect:
        "Violența psihologică îl învață pe om că vocea lui e periculoasă: fiecare cuvânt poate fi luat în râs, întors împotriva lui sau pedepsit. După abuz, multe supraviețuitoare tac din rușine, din frica de a nu fi crezute sau de răzbunare. Tăcerea poate rămâne și după ce abuzul s-a oprit, ca teamă de a vorbi chiar și în situații obișnuite.",
      relevanta:
        "Violența se ascunde în tăcere. Lalofobia arată de ce întrebarea „De ce n-ai spus nimic?” rănește: uneori, a vorbi e cel mai greu pas. „16 Voci” înseamnă să facem loc acestor voci și să le ascultăm fără să judecăm.",
      poster: "img/lalophobia-poster.jpg",
      posterMic: "img/lalophobia-poster-mic.jpg",
      foto: "img/lalophobia-foto.jpg",
      fotoMica: "img/lalophobia-foto-mic.jpg",
      alt: "O tânără cu privirea întoarsă își îndeasă în gură un ghem de cabluri albe și roșii.",
    },
    {
      slug: "phonophobia",
      alias: ["fonofobia"],
      titlu: "PHONOPHOBIA",
      titluRo: "Fonofobia",
      etichete: "fear of loud sounds / panic / sensory overload",
      descriere:
        "Fonofobia este frica intensă de sunete puternice și zgomote. Poate apărea atât în copilărie, cât și la maturitate, iar terapiile psihologice, precum terapia cognitiv-comportamentală și terapia prin expunere, pot ajuta la reducerea acestei frici.",
      descriereEn:
        "Phonophobia is an intense fear of loud sounds and noises. It can develop in childhood or adulthood, and psychological treatments, such as cognitive behavioral therapy and exposure therapy, can help reduce this fear.",
      efect:
        "Țipetele, ușile trântite și obiectele sparte sunt adesea limbajul violenței în familie. După traumă, corpul poate rămâne în alertă: un zgomot puternic aduce tresărire, panică sau dorința de a fugi, chiar și după ani. Tresărirea exagerată la sunete este una dintre reacțiile cunoscute ale stresului posttraumatic.",
      relevanta:
        "Fonofobia arată că intimidarea și strigătele lasă urme reale, chiar și fără nicio lovitură. Iar copiii care cresc printre țipete le poartă cu ei. Campania ne amintește că și violența psihologică este violență — și că se poate cere ajutor.",
      poster: "img/phonophobia-poster.jpg",
      posterMic: "img/phonophobia-poster-mic.jpg",
      foto: "img/phonophobia-foto.jpg",
      fotoMica: "img/phonophobia-foto-mic.jpg",
      alt: "Fotografie alb-negru: o persoană cu părul creț țipă cu ochii închiși, cu palmele lipite de obraji.",
    },
    {
      slug: "haphephobia",
      alias: ["hafefobia"],
      titlu: "HAPHEPHOBIA",
      titluRo: "Hafefobia",
      etichete: "fear of touch / anxiety / avoidance of physical contact",
      descriere:
        "Hafefobia este frica intensă de a fi atins de alte persoane, chiar și prin gesturi delicate sau afectuoase. Aceasta poate provoca anxietate, disconfort și nevoia de a evita contactul fizic.",
      descriereEn:
        "Haphephobia is an intense fear of being touched by other people, even through gentle or affectionate gestures. It can cause anxiety, discomfort, and a need to avoid physical contact.",
      efect:
        "După violența fizică sau sexuală, atingerea își poate pierde sensul de grijă. Corpul își amintește: o mână pe umăr, o îmbrățișare sau chiar un consult medical pot aduce frică, îngheț sau dorința de a se retrage. Mulți supraviețuitori simt că propriul corp nu mai e un loc sigur.",
      relevanta:
        "Hafefobia vorbește despre consimțământ și despre timp: încrederea se reconstruiește doar cu respect pentru limitele celuilalt. Campania cere exact asta — să credem, să susținem și să nu forțăm apropierea.",
      poster: "img/haphephobia-poster.jpg",
      posterMic: "img/haphephobia-poster-mic.jpg",
      foto: "img/haphephobia-foto.jpg",
      fotoMica: "img/haphephobia-foto-mic.jpg",
      alt: "Fotografie alb-negru: mai multe mâini apasă pe fața unei tinere cu buzele roșii, trăgându-i pleoapele și gura.",
    },
  ],

  /* ------------------------------------------------------------------------
     DEPARTAMENTELE (din planul proiectului; „studenti” = câți are o grupă)
     ------------------------------------------------------------------------ */
  departamente: [
    { nume: "Cercetare și concept creativ", studenti: 6, responsabilitati: "Documentare, mesaj central, slogan, storytelling, moodboard" },
    { nume: "Direcție artistică și scenografie", studenti: 6, responsabilitati: "Compoziții vizuale, decor, recuzită, cromatică" },
    { nume: "Casting și styling", studenti: 5, responsabilitati: "Selectarea modelelor, vestimentație, machiaj, pregătirea personajelor" },
    { nume: "Fotografie și iluminare", studenti: 8, responsabilitati: "Setări cameră, lumină, încadrare, realizarea fotografiilor" },
    { nume: "Producție și logistică", studenti: 6, responsabilitati: "Planificare, echipamente, programări, organizarea fotosesiunii" },
    { nume: "Postproducție și design grafic", studenti: 8, responsabilitati: "Selecție foto, retușare, postere, machetare pentru print" },
    { nume: "Comunicare și documentare", studenti: 7, responsabilitati: "Making-of, reels, texte, promovare, pregătirea lansării" },
  ],

  /* ------------------------------------------------------------------------
     ECHIPA — câte un rând pentru fiecare student
       nume, grupa ("PM265" sau "PM266"),
       departament (exact ca în lista de mai sus), rol, foto (din img/echipa/)
     Exemplu:
       { nume: "Tudor Mirca", grupa: "PM266", departament: "Comunicare și documentare",
         rol: "Site-ul expoziției și paginile QR", foto: "img/echipa/tudor-mirca.jpg" },
     Cât timp lista e goală, fiecare departament arată locuri libere.
     ------------------------------------------------------------------------ */
  echipa: [],

  sprijin: [
    {
      nume: "Telefonul de încredere pentru femei și fete",
      numar: "0 8008 8008",
      tel: "080088008",
      detalii: "Gratuit, confidențial, non-stop. Din străinătate: +373 22 24 06 24.",
    },
    { nume: "Pericol imediat", numar: "112", tel: "112", detalii: "Poliția, ambulanța și salvatorii." },
  ],
};
