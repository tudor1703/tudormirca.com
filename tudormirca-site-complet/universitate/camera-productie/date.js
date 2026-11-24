/* ==========================================================================
   date.js — TEXTELE COMPONENTELOR DIN MODELUL 3D

   Aici schimbi ce scrie în panoul „Componentă selectată” și în modul de
   prezentare. Nu schimba câmpul „id”: el leagă textul de piesa din camera.glb.

   Câmpuri:
     id       numele piesei din model (fără „C_”)
     nume     titlul afișat
     grup     una dintre grupele din GRUPE, mai jos
     ce       ce este și ce face
     deCe     de ce contează
     sfat     un sfat practic
     interior true dacă piesa e în interiorul corpului (se activează vederea în interior)
   ========================================================================== */

const GRUPE = {
  corp: { nume: "Corpul camerei", culoare: "#38bdf8" },
  optica: { nume: "Optică", culoare: "#a78bfa" },
  structura: { nume: "Structură și suport", culoare: "#34d399" },
  focalizare: { nume: "Focalizare", culoare: "#f472b6" },
  monitorizare: { nume: "Monitorizare", culoare: "#facc15" },
  sunet: { nume: "Sunet", culoare: "#60a5fa" },
  alimentare: { nume: "Alimentare", culoare: "#fb7185" },
  transmisie: { nume: "Transmisie", culoare: "#a3e635" },
};

const COMPONENTE = [
  {
    id: "corp",
    nume: "Corpul camerei",
    grup: "corp",
    ce: "Carcasa din metal care ține la un loc senzorul, procesorul și toate mufele. Are formă de cutie, fără mâner fix, ca să poată fi echipată altfel la fiecare filmare.",
    deCe: "Construcția modulară e marea diferență față de o cameră de amator: accesoriile se prind de corp prin găuri filetate de 1/4″ și 3/8″.",
    sfat: "Corpul singur nu filmează: are nevoie de obiectiv, alimentare și card.",
  },
  {
    id: "montura",
    nume: "Montura obiectivului",
    grup: "corp",
    ce: "Inelul metalic din față în care se prinde obiectivul, printr-un sistem de baionetă.",
    deCe: "Tipul monturii (de exemplu E, RF, EF sau PL) hotărăște ce obiective poți folosi. Cu un adaptor poți monta și obiective de alt tip.",
    sfat: "Schimbă obiectivul cu camera oprită și cu montura întoarsă în jos, ca să nu intre praf pe senzor.",
  },
  {
    id: "obiectiv",
    nume: "Obiectivul",
    grup: "optica",
    ce: "Adună lumina și formează imaginea pe senzor. Are inel de zoom, inel de focalizare cu dinți și diafragmă (iris).",
    deCe: "Distanța focală stabilește cât de larg e cadrul. Diafragma stabilește câtă lumină intră și cât de mare e zona clară (profunzimea de câmp).",
    sfat: "Inelele cu dinți standard (0,8 mod) se potrivesc direct cu roata dințată a unui follow focus.",
  },
  {
    id: "filtru_nd",
    nume: "Filtrele ND încorporate",
    grup: "corp",
    interior: true,
    ce: "Plăci de sticlă gri, montate în corp chiar în fața senzorului. Un motor mic le schimbă la apăsarea unui buton.",
    deCe: "Reduc lumina fără să schimbe culorile. Așa păstrezi diafragma deschisă și timpul de expunere de 1/50 chiar și în plin soare (tema 4.1).",
    sfat: "La unele camere ND-ul e variabil electronic: îl reglezi fin, fără să schimbi filtre.",
  },
  {
    id: "senzor",
    nume: "Senzorul",
    grup: "corp",
    interior: true,
    ce: "Transformă lumina în semnal electric: fiecare pixel adună lumină și produce o sarcină electrică.",
    deCe: "Mărimea senzorului (Super 35, full frame) influențează profunzimea de câmp, imaginea în lumină slabă și aspectul „de film”.",
    sfat: "Nu atinge niciodată senzorul. Praful se scoate doar cu suflanta.",
  },
  {
    id: "procesor",
    nume: "Procesorul de imagine",
    grup: "corp",
    interior: true,
    ce: "Placa electronică ce primește semnalul de la senzor: face conversia digitală, balansul de alb, culoarea, reducerea zgomotului și compresia (codecul).",
    deCe: "De procesor depind codecurile profesionale: 10 biți, 4:2:2, profiluri Log sau RAW, care lasă mai multă libertate la corecția de culoare.",
    sfat: "H.264/H.265 pentru materiale rapide; 10 biți 4:2:2 sau RAW când urmează gradare serioasă.",
  },
  {
    id: "ventilator",
    nume: "Răcirea activă",
    grup: "corp",
    interior: true,
    ce: "Un ventilator scoate căldura procesorului și a senzorului prin grila de pe lateral.",
    deCe: "O cameră de amator se poate opri din supraîncălzire la filmări lungi în 4K. Camera de producție filmează ore întregi fără întrerupere.",
    sfat: "Nu acoperi grila de aerisire cu accesorii sau cu mâna.",
  },
  {
    id: "sloturi_card",
    nume: "Două sloturi de card",
    grup: "corp",
    ce: "Două locașuri pentru carduri de memorie, sub o ușiță laterală.",
    deCe: "Poți înregistra pe ambele carduri deodată (o copie de siguranță directă) sau continuu, de pe un card pe celălalt, fără să oprești filmarea.",
    sfat: "Formatează cardurile în cameră și doar după ce ai copiat materialul în două locuri.",
  },
  {
    id: "butoane",
    nume: "Butoane fizice și ecran de stare",
    grup: "corp",
    ce: "Butoane dedicate pentru ISO, ND, balans de alb și nivel audio, butoane programabile și un ecran mic cu setările curente. Butonul roșu pornește înregistrarea.",
    deCe: "Setările importante se schimbă dintr-o apăsare, fără meniuri. Contează când filmezi ceva ce nu se mai repetă.",
    sfat: "Pune pe butoanele programabile ce folosești des: zebra, mărirea pentru focalizare, focus peaking.",
  },
  {
    id: "xlr",
    nume: "Intrări audio XLR",
    grup: "corp",
    ce: "Două mufe profesionale pentru microfoane, cu reglaj manual separat pe fiecare canal.",
    deCe: "XLR e o conexiune echilibrată: cablul poate fi lung fără să adune zgomot. Poți pune lavaliera pe canalul 1 și microfonul tun pe canalul 2.",
    sfat: "Pornește alimentarea phantom +48 V doar pentru microfoanele care o cer.",
  },
  {
    id: "iesiri_video",
    nume: "Ieșiri SDI, HDMI și timecode",
    grup: "corp",
    ce: "Mufe prin care imaginea pleacă spre monitoare, recordere sau regie: SDI (mufă BNC, cu blocare), HDMI și intrarea/ieșirea de timecode.",
    deCe: "SDI merge pe cabluri lungi și nu se desprinde. Timecode-ul sincronizează mai multe camere și recorderul de sunet.",
    sfat: "În studio și la transmisii folosește SDI. HDMI e bun pentru un monitor aflat aproape.",
  },
  {
    id: "placa_baterie",
    nume: "Placa de baterie V-mount",
    grup: "alimentare",
    ce: "Placa din spate în care se prinde bateria, cu contacte electrice și un sistem de glisare și blocare.",
    deCe: "Standardul V-mount permite baterii mari, care alimentează și accesoriile.",
    sfat: "Ascultă clicul de blocare: o baterie prinsă greșit poate cădea în timpul filmării.",
  },
  {
    id: "baterie",
    nume: "Bateria V-mount",
    grup: "alimentare",
    ce: "Baterie mare, profesională, cu indicator de încărcare și ieșire D-Tap pentru accesorii.",
    deCe: "O singură baterie poate alimenta camera, monitorul și transmițătorul ore în șir.",
    sfat: "Ia mereu cel puțin o baterie de rezervă, încărcată.",
  },
  {
    id: "cusca",
    nume: "Cușca (cage)",
    grup: "structura",
    ce: "Cadru metalic care îmbracă corpul camerei, plin de găuri filetate pentru accesorii.",
    deCe: "Protejează camera și oferă puncte de montaj pentru monitor, mâner, receptor sau transmițător.",
    sfat: "Alege o cușcă făcută pentru modelul tău de cameră, ca să nu blocheze butoanele și mufele.",
  },
  {
    id: "maner",
    nume: "Mânerul superior",
    grup: "structura",
    ce: "Mâner prins deasupra cuștii, pentru filmarea din mână și pentru transport.",
    deCe: "Ține camera stabilă în mișcare și e locul în care se montează microfonul.",
    sfat: "Pentru cadre lungi din mână, combină mânerul cu un suport de umăr.",
  },
  {
    id: "bare",
    nume: "Placa de bază și barele de 15 mm",
    grup: "structura",
    ce: "Placa de sub cameră și două bare paralele, de 15 mm diametru, care ies în față, pe sub obiectiv.",
    deCe: "Pe bare se prind accesoriile din față, cum sunt follow focus-ul și matte box-ul, la distanța standard de obiectiv.",
    sfat: "Barele de 15 mm sunt pentru echipare ușoară. Pentru obiective grele se folosesc bare de 19 mm.",
  },
  {
    id: "matte_box",
    nume: "Matte box",
    grup: "optica",
    ce: "„Parasolarul” profesional din fața obiectivului, cu clape (steaguri) și un sertar pentru filtre.",
    deCe: "Blochează lumina din lateral, care produce reflexii și scade contrastul. Ține filtrele ND, polarizoare sau de difuzie.",
    sfat: "Închide clapele cât mai mult, dar verifică pe monitor să nu intre în cadru.",
  },
  {
    id: "follow_focus",
    nume: "Follow focus",
    grup: "focalizare",
    ce: "Mecanism cu roată dințată care rotește inelul de focalizare. Pe discul alb se marchează distanțele.",
    deCe: "Asistentul de cameră focalizează precis și repetabil, de exemplu când mută claritatea de pe un actor pe altul (rack focus).",
    sfat: "Marchează pe disc pozițiile de focalizare înainte de dublă. Există și variante cu motor, comandate wireless.",
  },
  {
    id: "monitor",
    nume: "Monitorul extern",
    grup: "monitorizare",
    ce: "Ecran mare, de 5–7 inch, montat pe un braț articulat și conectat prin SDI sau HDMI.",
    deCe: "Pe el se văd corect focalizarea și expunerea, cu histogramă, zebra, waveform și focus peaking. Unele modele și înregistrează (monitor-recorder).",
    sfat: "Ecranul din model arată o simulare: setările, histograma și nivelurile audio.",
  },
  {
    id: "microfon",
    nume: "Microfonul tun",
    grup: "sunet",
    ce: "Microfon direcțional, prins pe un suport antișoc deasupra mânerului.",
    deCe: "Prinde sunetul din direcția în care privește camera și reduce zgomotele din lateral. Suportul antișoc oprește vibrațiile mâinii.",
    sfat: "E bun pentru ambianță și reportaj. Pentru dialog clar, adu microfonul aproape (pe boom) sau folosește lavaliere.",
  },
  {
    id: "receptor_wireless",
    nume: "Receptorul audio wireless",
    grup: "sunet",
    ce: "Primește semnalul de la un emițător cu lavalieră, prins pe vorbitor, și îl trimite în intrarea XLR.",
    deCe: "Vorbitorul se mișcă liber, fără cablu, iar vocea rămâne clară și apropiată.",
    sfat: "Verifică bateriile emițătorului și caută un canal liber înainte de filmare.",
  },
  {
    id: "transmitator_video",
    nume: "Transmițătorul video wireless",
    grup: "transmisie",
    ce: "Trimite imaginea camerei fără fir, prin antene, spre monitorul regizorului sau al clientului.",
    deCe: "Regizorul vede cadrul în timp real, fără cabluri pe jos, iar camera se poate mișca liber.",
    sfat: "Ține antenele verticale și fără obstacole metalice între emițător și receptor.",
  },
  {
    id: "trepied",
    nume: "Trepied cu cap fluid",
    grup: "structura",
    ce: "Trepied cu un cap care se rotește lin pe orizontală (panoramare) și pe verticală (tilt), cu rezistență reglabilă.",
    deCe: "Dă imagini stabile la interviuri și mișcări line, fără smucituri.",
    sfat: "Echilibrează camera pe placa capului: lăsată înclinată, trebuie să rămână nemișcată.",
  },
];

/* Configurațiile: ce componente se văd în fiecare. */
const CONFIGURATII = {
  complet: {
    nume: "Complet",
    ascunse: ["trepied"],
  },
  camera: {
    nume: "Doar camera",
    vizibile: ["corp", "montura", "obiectiv", "filtru_nd", "senzor", "procesor", "ventilator", "sloturi_card",
      "butoane", "xlr", "iesiri_video", "placa_baterie", "baterie"],
  },
  interviu: {
    nume: "Interviu",
    vizibile: ["corp", "montura", "obiectiv", "filtru_nd", "senzor", "procesor", "ventilator", "sloturi_card",
      "butoane", "xlr", "iesiri_video", "placa_baterie", "baterie", "cusca", "bare", "monitor",
      "receptor_wireless", "trepied"],
  },
  reportaj: {
    nume: "Reportaj",
    vizibile: ["corp", "montura", "obiectiv", "filtru_nd", "senzor", "procesor", "ventilator", "sloturi_card",
      "butoane", "xlr", "iesiri_video", "placa_baterie", "baterie", "cusca", "maner", "microfon", "monitor"],
  },
};
