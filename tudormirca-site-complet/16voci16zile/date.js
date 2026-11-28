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
  autori: "Studenții specialității Producție multimedia, grupa PM266",
  grupa: "PM266",
  studenti: 45,
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
    { valoare: 45, eticheta: "studenți" },
    { valoare: "PM266", eticheta: "grupa" },
    { valoare: 7, eticheta: "departamente" },
    { valoare: 16, eticheta: "voci" },
  ],

  /* ------------------------------------------------------------------------
     VOCILE — câte un poster fiecare, în ordinea din expoziție: întâi fobiile, apoi maniile
       slug          adresa paginii (ce e scris în QR)
       alias         opțional: alte adrese care duc tot aici
       titlu         titlul mare de pe poster
       titluRo       numele în română
       etichete      rândul mic de sub titlu
       descriere     textul în română de pe poster
       descriereEn   textul în engleză de pe poster
       efect         ce poate lăsa violența în urmă
       relevanta     de ce contează pentru campania 16 zile
       oglinda       opțional: true = în locul fotografiei apare camera vizitatorului
       poster/foto   imaginile din img/ (posterul întreg și doar fotografia).
                     Cât timp sunt goale (""), pagina arată un loc pentru fotografie.
     ------------------------------------------------------------------------ */
  voci: [
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
      poster: "",
      posterMic: "",
      foto: "img/haphephobia-foto.jpg",
      fotoMica: "img/haphephobia-foto-mic.jpg",
      alt: "Fotografie alb-negru: mai multe mâini apasă pe fața unei tinere cu buzele roșii, trăgându-i pleoapele și gura.",
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
      poster: "",
      posterMic: "",
      foto: "img/phonophobia-foto.jpg",
      fotoMica: "img/phonophobia-foto-mic.jpg",
      alt: "Fotografie alb-negru: o persoană cu părul creț țipă cu ochii închiși, cu palmele lipite de obraji.",
    },
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
      poster: "",
      posterMic: "",
      foto: "img/lalophobia-foto.jpg",
      fotoMica: "img/lalophobia-foto-mic.jpg",
      alt: "O tânără cu privirea întoarsă își îndeasă în gură un ghem de cabluri albe și roșii.",
    },
    {
      slug: "atelophobia",
      alias: ["atelofobia"],
      titlu: "ATELOPHOBIA",
      titluRo: "Atelofobia",
      etichete: "", // rândul mic de sub titlu, de pe poster
      descriere:
        "Atelofobia este frica de imperfecțiune și de a nu fi niciodată suficient de bun. Persoanele care o experimentează pot avea așteptări exagerat de mari de la ele însele și o teamă constantă de a greși.",
      descriereEn:
        "Atelophobia is the fear of imperfection and of never being good enough. People experiencing it may have unrealistically high expectations of themselves and a constant fear of making mistakes.",
      efect:
        "Criticile constante, umilirea și comparațiile sunt forme de violență psihologică. Cine aude zi de zi că nu face nimic bine ajunge să creadă asta despre sine și își cere perfecțiunea, ca să nu mai dea motiv de ceartă sau de pedeapsă. Frica de a greși poate rămâne mult timp după ce relația abuzivă s-a încheiat.",
      relevanta:
        "Atelofobia arată cum violența psihologică mută vina pe victimă: „dacă aș fi fost mai bună, nu s-ar fi întâmplat”. Nimeni nu provoacă abuzul prin greșelile sale. Campania amintește că umilirea constantă este violență, chiar dacă nu lasă urme pe corp.",
      poster: "", // img/atelophobia-poster.jpg
      posterMic: "",
      foto: "img/atelophobia-foto.jpg",
      fotoMica: "img/atelophobia-foto-mic.jpg",
      alt: "Picioare în ciorapi albi cu stele albastre, întinse pe o folie, presărate cu sclipici albastru și roz.",
    },
    {
      slug: "algophobia",
      alias: ["algofobia", "agophobia"],
      titlu: "ALGOPHOBIA",
      titluRo: "Algofobia",
      etichete: "", // rândul mic de sub titlu, de pe poster
      descriere:
        "Algofobia este frica intensă de durere, fie fizică, fie de posibilitatea de a o simți. Aceasta poate determina evitarea situațiilor sau activităților percepute ca dureroase.",
      descriereEn:
        "Algophobia is an intense fear of pain, whether physical or the possibility of experiencing it. It can lead to avoiding situations or activities perceived as painful.",
      efect:
        "După violența fizică, durerea nu mai e doar o amintire, ci o așteptare. Mulți supraviețuitori trăiesc cu frica următoarei lovituri: urmăresc tonul vocii, pașii, ușa care se deschide. Corpul rămâne încordat și poate evita tot ce ar putea durea, chiar și un control medical.",
      relevanta:
        "Algofobia arată că violența fizică doare și după ce vânătăile dispar. Frica de durere ține oamenii în tăcere și supunere. Campania spune că nimeni nu trebuie să trăiască așteptând următoarea lovitură — și că există ajutor.",
      poster: "", // img/algophobia-poster.jpg
      posterMic: "",
      foto: "img/algophobia-foto.jpg",
      fotoMica: "img/algophobia-foto-mic.jpg",
      alt: "Prim-plan cu jumătate de chip în lacrimi; o bandă verticală în culoare arată pielea înroșită de sub ochi.",
    },
    {
      slug: "autophobia",
      alias: ["autofobia", "athazagoraphobia", "atazagorafobia"],
      titlu: "AUTOPHOBIA",
      titluRo: "Autofobia",
      etichete: "", // rândul mic de sub titlu, de pe poster
      descriere:
        "Autofobia este o fobie specifică caracterizată printr-o teamă intensă și irațională de a fi singur, izolat sau abandonat. Chiar și atunci când se află într-un mediu sigur, o persoană care suferă de autofobie poate resimți anxietate severă, atacuri de panică sau sentimentul unui pericol iminent atunci când rămâne singură.",
      descriereEn:
        "Autophobia is a specific phobia characterized by an overwhelming, irrational fear of being alone or isolated. Even when physically safe, someone experiencing autophobia may feel severe anxiety, panic, or a sense of impending danger if left by themselves or separated from a specific person.",
      efect:
        "Agresorul izolează adesea victima de prieteni și familie, până când singurul om din viața ei rămâne chiar el. După o asemenea relație, a rămâne singur poate însemna panică: fiecare seară, fiecare zgomot pare un pericol. Din frica de singurătate, unii oameni se întorc la cel care i-a rănit.",
      relevanta:
        "Izolarea este un instrument de control. Autofobia ne cere să nu-i lăsăm singuri pe cei care trec prin violență: un mesaj, un apel sau o vizită pot conta enorm. Campania amintește că nimeni nu trebuie să treacă singur prin asta.",
      poster: "", // img/autophobia-poster.jpg
      posterMic: "",
      foto: "img/autophobia-foto.jpg",
      fotoMica: "img/autophobia-foto-mic.jpg",
      alt: "Fotografie alb-negru: o tânără cu chipul estompat, cu cămașa căzută de pe umăr și mâna la gât.",
    },
    {
      slug: "erotophobia",
      alias: ["erotofobia"],
      titlu: "EROTOPHOBIA",
      titluRo: "Erotofobia",
      etichete: "", // rândul mic de sub titlu, de pe poster
      descriere:
        "Erotofobia este frica intensă de sex, intimitate sexuală sau subiecte legate de sexualitate. Aceasta poate provoca anxietate, disconfort și evitarea discuțiilor sau situațiilor intime.",
      descriereEn:
        "Erotophobia is an intense fear of sex, sexual intimacy, or topics related to sexuality. It can cause anxiety, discomfort, and avoidance of intimate situations or conversations.",
      efect:
        "După violența sexuală, intimitatea se poate lega în corp de frică, rușine și pierderea controlului. Apropierea, chiar și cu un partener iubitor, poate aduce panică sau amintiri dureroase. Mulți supraviețuitori evită orice discuție despre sexualitate, pentru că le amintește de ce s-a întâmplat.",
      relevanta:
        "Erotofobia vorbește despre consimțământ: intimitatea fără acord este violență, inclusiv într-un cuplu sau într-o căsnicie. Vindecarea cere timp și respect pentru ritmul fiecăruia. Campania ne amintește că vina nu este niciodată a victimei.",
      poster: "", // img/erotophobia-poster.jpg
      posterMic: "",
      foto: "img/erotophobia-foto.jpg",
      fotoMica: "img/erotophobia-foto-mic.jpg",
      alt: "Fotografie alb-negru: un tânăr ține strâns bărbia unei tinere cu ochii închiși și buzele întredeschise.",
    },
    {
      slug: "scopophobia",
      alias: ["scopofobia"],
      titlu: "SCOPOPHOBIA",
      titluRo: "Scopofobia",
      etichete: "", // rândul mic de sub titlu, de pe poster
      descriere:
        "Scopofobia este o fobie specifică ce presupune teama intensă și irațională de a fi privit sau analizat de ceilalți. Aceasta declanșează anxietate severă și panică, transformând fiecare privire într-o judecată critică și o invazie asupra propriei vulnerabilități.",
      descriereEn:
        "Scopophobia is a specific phobia involving an intense, irrational fear of being watched or scrutinized by others. It triggers severe anxiety and panic, turning every gaze into a critical judgment and an intrusion upon one’s vulnerability.",
      efect:
        "Telefonul verificat, pașii urmăriți, comentariile despre cum arată sau cum se îmbracă îl fac pe om să se simtă mereu privit și judecat. Uneori, fotografiile intime ajung să fie distribuite fără acord. După asemenea experiențe, privirea celorlalți poate deveni o amenințare, iar omul se retrage din spațiile publice.",
      relevanta:
        "Scopofobia arată violența care nu atinge corpul: supravegherea, urmărirea și umilirea online. Și acestea sunt forme de violență în bază de gen. Campania ne cere să nu distribuim, să nu comentăm și să nu judecăm, ci să-i sprijinim pe cei expuși.",
      poster: "", // img/scopophobia-poster.jpg
      posterMic: "",
      foto: "img/scopophobia-foto.jpg",
      fotoMica: "img/scopophobia-foto-mic.jpg",
      alt: "O tânără cu fața acoperită de zeci de ochi de jucărie privește speriată spre cameră.",
    },
    {
      slug: "nymphomania",
      alias: ["nimfomania"],
      titlu: "NYMPHOMANIA",
      titluRo: "Nimfomania",
      etichete: "", // rândul mic de sub titlu, de pe poster
      descriere:
        "Nimfomania este termenul istoric pentru hipersexualitate sau comportamentul sexual compulsiv la femei. Dincolo de dorință, este un impuls necontrolat folosit ca mecanism de apărare pentru a masca trauma, anxietatea sau un gol interior.",
      descriereEn:
        "Nymphomania is the historical term for hypersexuality or compulsive sexual behavior in women. Beyond desire, it is an uncontrollable urge used as a coping mechanism to mask underlying trauma, anxiety, or a deep inner void.",
      efect:
        "După abuz, unii oameni ajung la comportamente sexuale compulsive: nu din dorință, ci ca să amorțească durerea, să recapete o iluzie de control sau să umple un gol. Cercetările găsesc o legătură între abuzul sexual din copilărie și hipersexualitate. Termenul „nimfomanie” a fost folosit istoric ca să judece și să rușineze femeile.",
      relevanta:
        "Acest poster contrazice o idee periculoasă: că felul în care se poartă o femeie ar justifica violența. Comportamentul cuiva nu înseamnă niciodată consimțământ. Campania ne cere să privim dincolo de etichete și să vedem rana.",
      poster: "", // img/nymphomania-poster.jpg
      posterMic: "",
      foto: "img/nymphomania-foto.jpg",
      fotoMica: "img/nymphomania-foto-mic.jpg",
      alt: "Fotografie alb-negru: spatele gol al unui tânăr, de care se agață două mâini de femeie.",
    },
    {
      slug: "alexithymia",
      alias: ["alexitimia"],
      titlu: "ALEXITHYMIA",
      titluRo: "Alexitimia",
      etichete: "", // rândul mic de sub titlu, de pe poster
      descriere:
        "Alexitimia este dificultatea majoră de a identifica, înțelege și exprima în cuvinte propriile emoții. Persoanele afectate resimt stresul la nivel fizic, dar rămân prizoniere într-o furtună tăcută, izolate emoțional de cei din jur.",
      descriereEn:
        "Alexithymia is a significant difficulty in identifying, understanding, and putting one’s own emotions into words. Affected individuals feel distress physically yet remain trapped in a silent storm, emotionally isolated from others.",
      efect:
        "Copiii care cresc printre violențe și adulții care trăiesc mult timp în abuz învață adesea să-și amorțească emoțiile, pentru că a le arăta era periculos. Mai târziu le este greu să spună ce simt, deși corpul vorbește prin oboseală, dureri sau insomnie. Cercetările leagă alexitimia de traumele trăite în copilărie.",
      relevanta:
        "Alexitimia explică de ce unele victime povestesc despre violență calm, aproape fără emoție. Asta nu înseamnă că mint sau că nu le-a durut. Campania ne învață să credem victimele, chiar și atunci când nu reacționează cum ne-am aștepta.",
      poster: "", // img/alexithymia-poster.jpg
      posterMic: "",
      foto: "img/alexithymia-foto.jpg",
      fotoMica: "img/alexithymia-foto-mic.jpg",
      alt: "Colaj alb-negru din fâșii de hârtie ruptă: ochi în lacrimi, o gură care țipă și o mână care apasă buzele.",
    },
    {
      slug: "lypemania",
      alias: ["lipemania"],
      titlu: "LYPEMANIA",
      titluRo: "Lipemania",
      etichete: "", // rândul mic de sub titlu, de pe poster
      descriere:
        "Lipemania este un termen clasic din psihiatrie care definește o formă severă de melancolie și tristețe patologică profundă. Această stare se manifestă printr-o durere sufletească copleșitoare și retragerea completă din lume, fiind precursorul depresiei majore.",
      descriereEn:
        "Lypemania is a classical psychiatric term defining a severe form of melancholia and profound pathological sadness. It manifests as overwhelming emotional pain and complete withdrawal from the world, serving as the precursor to major depression.",
      efect:
        "Violența repetată poate stinge treptat bucuria: apar oboseala, lipsa de speranță și retragerea din viață. Femeile care trec prin violență din partea partenerului au un risc mai mare de depresie. Tristețea profundă nu este o slăbiciune, ci o urmă a ceea ce s-a întâmplat.",
      relevanta:
        "Lipemania arată violența care continuă în tăcere, în interior. Depresia de după abuz se poate trata, iar a cere ajutor este un pas de curaj, nu de rușine. Campania amintește că nimeni nu trebuie să ducă singur această greutate.",
      poster: "", // img/lypemania-poster.jpg
      posterMic: "",
      foto: "img/lypemania-foto.jpg",
      fotoMica: "img/lypemania-foto-mic.jpg",
      alt: "Negativ fotografic: o siluetă albă, ghemuită, își strânge brațul, pe un fundal roz și verde.",
    },
    {
      slug: "dipsomania",
      alias: [],
      titlu: "DIPSOMANIA",
      titluRo: "Dipsomania",
      etichete: "", // rândul mic de sub titlu, de pe poster
      descriere:
        "Dipsomania este o tulburare caracterizată prin crize bruște și irezistibile de dorință compulsivă de a consuma alcool. Persoana își pierde complet controlul și bea pentru a evada din durere, deși este pe deplin conștientă de consecințele distructive.",
      descriereEn:
        "Dipsomania is a condition characterized by sudden, irresistible crises of a compulsive craving for alcohol. The person loses all control and drinks to escape emotional pain, despite being fully aware of the destructive consequences.",
      efect:
        "Pentru unii supraviețuitori, alcoolul devine un fel de anestezic: îi ajută câteva ore să nu simtă frica, rușinea sau amintirile. Violența și consumul de alcool apar adesea împreună, iar dependența adâncește izolarea și vulnerabilitatea. Omul știe că își face rău, dar durerea pare mai greu de suportat decât consecințele.",
      relevanta:
        "Dipsomania arată un cerc vicios: durerea duce la băutură, iar băutura aduce și mai multă durere. Alcoolul nu este niciodată o scuză pentru violență, iar dependența victimei nu o face vinovată. Campania vorbește despre ajutor fără judecată.",
      poster: "", // img/dipsomania-poster.jpg
      posterMic: "",
      foto: "img/dipsomania-foto.jpg",
      fotoMica: "img/dipsomania-foto-mic.jpg",
      alt: "Sub lumină albastră, o tânără cu machiajul întins își sprijină de frunte o sticlă goală.",
    },
    {
      slug: "trichotillomania",
      alias: ["tricotilomania"],
      titlu: "TRICHOTILLOMANIA",
      titluRo: "Tricotilomania",
      etichete: "", // rândul mic de sub titlu, de pe poster
      descriere:
        "Tricotilomania este o tulburare obsesiv-compulsivă ce constă în impulsul irepresibil de a-ți smulge propriul păr. Acest gest funcționează ca un mecanism inconștient de auto-calmare pentru a elibera tensiunea, trauma și anxietatea intensă.",
      descriereEn:
        "Trichotillomania is an obsessive-compulsive spectrum disorder involving the irresistible urge to pull out one’s own hair. This behavior acts as an unconscious self-soothing mechanism to release intense tension, trauma, and anxiety.",
      efect:
        "Tensiunea care nu are unde să iasă poate ajunge în corp. Pentru unii oameni, gestul devine automat în momentele de stres, frică sau amintiri dureroase. Aduce o ușurare scurtă, urmată de rușine, iar mulți își ascund urmele sub căciuli, eșarfe sau machiaj.",
      relevanta:
        "Tricotilomania arată că urmele violenței pot fi ascunse chiar sub ochii noștri. În loc de remarci sau glume, persoana are nevoie de înțelegere și de sprijin specializat. Campania ne învață să observăm și să întrebăm cu grijă.",
      poster: "", // img/trichotillomania-poster.jpg
      posterMic: "",
      foto: "img/trichotillomania-foto.jpg",
      fotoMica: "img/trichotillomania-foto-mic.jpg",
      alt: "Fotografie mișcată, în mov și verde: o tânără își prinde părul cu ambele mâini, cu gura deschisă.",
    },
    {
      slug: "megalomania",
      alias: [],
      titlu: "MEGALOMANIA",
      titluRo: "Megalomania",
      etichete: "", // rândul mic de sub titlu, de pe poster
      descriere:
        "Megalomania este o stare psihologică marcată de convingeri exagerate despre propria putere, grandoare și superioritate. În spatele acestei nevoi obsesive de a domina se ascunde adesea o fragilitate profundă și teama de a fi nesemnificativ.",
      descriereEn:
        "Megalomania is a psychological state marked by exaggerated beliefs about one’s own power, grandeur, and superiority. Behind this obsessive need to dominate others often lies a deep fragility and an unconscious fear of insignificance.",
      efect:
        "Lângă cineva care are nevoie să domine, celălalt învață să se facă mic: să nu contrazică, să nu iasă în evidență, să nu ceară nimic. Violența în bază de gen se sprijină pe ideea că un om are dreptul să-l controleze pe altul. Cine a trăit așa poate continua mult timp să-și ceară voie pentru propria existență.",
      relevanta:
        "Megalomania arată rădăcina multor abuzuri: dorința de putere și de control. În spatele ei stau adesea fragilitatea și frica de a nu conta, dar nimic din toate acestea nu scuză violența. Campania cere relații construite pe egalitate, nu pe dominare.",
      poster: "", // img/megalomania-poster.jpg
      posterMic: "",
      foto: "img/megalomania-foto.jpg",
      fotoMica: "img/megalomania-foto-mic.jpg",
      alt: "Privit de sus, un tânăr în cămașă albă stă pe o scară metalică, înconjurat de siluete mișcate; pe podea arde o urmă de lumină.",
    },
    {
      slug: "reimania",
      alias: ["reimanie", "objectification", "obiectificare", "depersonalization", "depersonalizare"],
      titlu: "REIMANIA",
      titluRo: "Reimanie",
      etichete: "", // rândul mic de sub titlu, de pe poster
      descriere:
        "O obsesie intensă sau o compulsie de a reduce oamenii, emoțiile sau propria persoană la simple obiecte fizice, eliminând identitatea, umanitatea și profunzimea emoțională în favoarea obiectificării și a depersonalizării.",
      descriereEn:
        "An intense obsession or compulsion to reduce people, emotions, or oneself into mere physical objects, stripping away personhood, agency, and emotional depth in favor of cold objectification and depersonalization.",
      efect:
        "În abuzul psihologic, persoana este tratată ca o proprietate: i se controlează banii, hainele, prietenii și deciziile. Ca să supraviețuiască, mintea se poate detașa, iar omul simte că își privește viața din afară, ca și cum corpul nu ar mai fi al lui. Depersonalizarea este o reacție cunoscută la trauma care se repetă.",
      relevanta:
        "Gelozia și controlul sunt adesea confundate cu dragostea. Acest poster spune clar că un om nu aparține nimănui. Campania vorbește despre dreptul fiecăruia de a decide pentru sine și de a-și aparține.",
      poster: "", // img/reimania-poster.jpg
      posterMic: "",
      foto: "img/reimania-foto.jpg",
      fotoMica: "img/reimania-foto-mic.jpg",
      alt: "Picioare în ciorapi subțiri, cu cărți de joc, o bancnotă, un cutter și un ruj prinse sub ciorap; lângă ele, un pantof negru.",
    },
    {
      slug: "pseudomania",
      alias: [],
      titlu: "PSEUDOMANIA",
      titluRo: "Pseudomania",
      etichete: "", // rândul mic de sub titlu, de pe poster
      descriere:
        "Pseudomania descrie aici starea psihologică de a purta o mască protectoare sau o barieră pentru a-ți ascunde adevărata esență. Este un mecanism de supraviețuire prin care individul se detașează emoțional într-un mediu perceput ca fiind sufocant și nesigur.",
      descriereEn:
        "Pseudomania here describes the psychological state of wearing a protective mask or barrier to conceal one’s true essence. It acts as a survival mechanism where an individual detaches emotionally to endure an unsafe, suffocating environment.",
      efect:
        "Într-o casă sau o relație în care nu ești în siguranță, înveți să porți o mască: zâmbești, spui că totul e bine, îți ascunzi gândurile și emoțiile. Masca protejează, dar în timp omul se poate îndepărta de sine și nu mai știe cine este cu adevărat. Mulți supraviețuitori spun că ani la rând au părut „normali” pentru cei din jur.",
      relevanta:
        "Pseudomania ne amintește că violența nu se vede întotdeauna din afară, iar un zâmbet nu înseamnă că totul e bine. Campania ne cere să fim atenți la cei din jur și să creăm spații în care masca poate fi dată jos în siguranță.",
      poster: "", // img/pseudomania-poster.jpg
      posterMic: "",
      foto: "img/pseudomania-foto.jpg",
      fotoMica: "img/pseudomania-foto-mic.jpg",
      alt: "O siluetă ascunsă sub o folie translucidă, luminată din spate, pe o scenă întunecată.",
    },
    {
      slug: "eisoptrophobia",
      oglinda: true, // în locul fotografiei: camera vizitatorului, ca o oglindă (vezi oglinda.js)
      alias: ["eisoptrofobia"],
      titlu: "EISOPTROPHOBIA",
      titluRo: "Eisoptrofobia",
      etichete: "", // rândul mic de sub titlu, de pe poster
      descriere:
        "Eisoptrofobia reprezintă teama patologică de oglinzi și de propria reflexie, fiind adesea legată de o imagine de sine distorsionată. Aceasta provoacă atacuri de panică și groaza de a confrunta un străin care îți reflectă toate nesiguranțele.",
      descriereEn:
        "Eisoptrophobia is the pathological fear of mirrors and one’s own reflection, often linked to a distorted self-image. It triggers acute panic and the dread of confronting a stranger reflecting all your deepest insecurities.",
      efect:
        "Insultele despre corp, comparațiile și umilirea schimbă felul în care omul se vede. După violență, oglinda poate arăta urmele loviturilor sau un chip pe care persoana nu-l mai recunoaște. Unii supraviețuitori evită oglinzile pentru că văd în ele rușinea și frica lăsate de agresor.",
      relevanta:
        "Eisoptrofobia arată cum violența fură încrederea în sine. Cuvintele unui agresor nu definesc pe nimeni. Campania vorbește despre dreptul de a te privi din nou cu blândețe și despre sprijinul care face posibil acest drum.",
      poster: "", // img/eisoptrophobia-poster.jpg
      posterMic: "",
      foto: "", // img/eisoptrophobia-foto.jpg
      fotoMica: "",
      alt: "",
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
     ECHIPA — câte un rând pentru fiecare student: nume, rol, foto (din img/echipa/)
       Pe site apar toți într-o singură grilă („Meet the team”), fără departamente.
       Câmpurile grupa și departament pot rămâne, dar nu se afișează.
     Exemplu:
       { nume: "Tudor Mirca", grupa: "PM266", departament: "Comunicare și documentare",
         rol: "Site-ul expoziției și paginile QR", foto: "img/echipa/tudor-mirca.jpg?v=2" },
     Până se completează lista, grila arată locuri gri (câte studenți sunt în total).
     ------------------------------------------------------------------------ */
  // numele și rolul se pot completa oricând; până atunci apare doar fotografia
  echipa: [
    { nume: "", rol: "", foto: "img/echipa/student-01.jpg?v=2" },
    { nume: "", rol: "", foto: "img/echipa/student-02.jpg?v=2" },
    { nume: "", rol: "", foto: "img/echipa/student-03.jpg?v=3" },
    { nume: "", rol: "", foto: "img/echipa/student-04.jpg?v=2" },
    { nume: "", rol: "", foto: "img/echipa/student-05.jpg?v=2" },
    { nume: "", rol: "", foto: "img/echipa/student-06.jpg?v=2" },
    { nume: "", rol: "", foto: "img/echipa/student-07.jpg?v=2" },
    { nume: "", rol: "", foto: "img/echipa/student-08.jpg?v=2" },
    { nume: "", rol: "", foto: "img/echipa/student-09.jpg?v=2" },
    { nume: "", rol: "", foto: "img/echipa/student-10.jpg?v=2" },
    { nume: "", rol: "", foto: "img/echipa/student-11.jpg?v=2" },
    { nume: "", rol: "", foto: "img/echipa/student-12.jpg?v=2" },
    { nume: "", rol: "", foto: "img/echipa/student-13.jpg?v=3" },
    { nume: "", rol: "", foto: "img/echipa/student-14.jpg?v=2" },
    { nume: "", rol: "", foto: "img/echipa/student-15.jpg?v=2" },
    { nume: "", rol: "", foto: "img/echipa/student-16.jpg?v=3" },
    { nume: "", rol: "", foto: "img/echipa/student-17.jpg?v=3" },
    // principal: true = apare separat, mare, deasupra grilei (cine a dus greul proiectului)
    { nume: "Gherasim Dumitru", rol: "Fotograf & editor", instagram: "diamondpts", principal: true, foto: "img/echipa/student-18.jpg?v=2" },
    { nume: "", rol: "", foto: "img/echipa/student-19.jpg?v=2" },
    { nume: "", rol: "", foto: "img/echipa/student-20.jpg?v=2" },
    { nume: "", rol: "", foto: "img/echipa/student-21.jpg?v=2" },
    { nume: "", rol: "", foto: "img/echipa/student-22.jpg?v=2" },
    { nume: "", rol: "", foto: "img/echipa/student-23.jpg?v=2" },
    { nume: "", rol: "", foto: "img/echipa/student-24.jpg?v=2" },
    { nume: "", rol: "", foto: "img/echipa/student-25.jpg?v=2" },
    { nume: "", rol: "", foto: "img/echipa/student-26.jpg?v=2" },
    { nume: "", rol: "", foto: "img/echipa/student-27.jpg?v=2" },
    { nume: "", rol: "", foto: "img/echipa/student-28.jpg" },
    { nume: "", rol: "", foto: "img/echipa/student-29.jpg" },
    { nume: "", rol: "", foto: "img/echipa/student-30.jpg" },
    { nume: "", rol: "", foto: "img/echipa/student-31.jpg" },
    { nume: "", rol: "", foto: "img/echipa/student-32.jpg" },
    { nume: "", rol: "", foto: "img/echipa/student-33.jpg" },
  ],

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
