/* ==========================================================================
   intro.js — INTRAREA ÎN SITE

   1. așteaptă fontul (altfel literele „sar” când se încarcă)
   2. pornește secvența din intro.css: semnul, numele, timecode-ul
   3. după o scurtă pauză, ecranul negru se topește în site

   Apare o dată pe sesiune. Click, Enter, Spațiu sau Esc = sari peste.
   Pentru cine a cerut mișcare redusă în sistem, intro-ul nu apare deloc.
   Pornirea e decisă de scriptul mic din <head> (clasa „intro-activ”).
   ========================================================================== */

"use strict";

(function () {
  const html = document.documentElement;
  if (!html.classList.contains("intro-activ")) return;

  // Cât rămâne numele întreg pe ecran înainte să se deschidă site-ul (ms)
  const PAUZA = 850;

  const anunta = () => window.dispatchEvent(new CustomEvent("intro:deschis"));

  // Pe o conexiune foarte lentă, stratul negru dispare singur după 4 secunde.
  // Dacă scriptul ajunge abia acum, nu mai pornim intro-ul peste site.
  if (performance.now() > 3200) {
    html.classList.remove("intro-activ");
    anunta();
    return;
  }

  const date = typeof DATE !== "undefined" ? DATE : {};
  const nume = String((date.profil && date.profil.nume) || "Tudor Mirca").replace("[DE COMPLETAT]", "").trim() || "Tudor Mirca";
  const FPS = Number(date.fps) || 25;

  /* ---------- Elementele -------------------------------------------------- */
  const caractere = Array.from(nume);
  let index = 0;
  const litere = caractere
    .map((caracter, i) => {
      if (caracter === " ") return '<span class="intro__spatiu"></span>';
      const dinCoada = caractere.length - 1 - i;
      const stins = dinCoada < 3 ? ` intro__litera--stins-${3 - dinCoada}` : "";
      const sigur = caracter.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
      return `<span class="intro__masca"><span class="intro__litera${stins}" style="--i:${index++}">${sigur}</span></span>`;
    })
    .join("");

  const ecran = document.createElement("div");
  ecran.className = "intro";
  ecran.setAttribute("aria-hidden", "true");
  ecran.innerHTML = `
    <div class="intro__fundal"></div>
    <div class="intro__lumina"></div>
    <div class="intro__continut">
      <div class="intro__scena">
        <svg class="intro__semn" viewBox="0 0 100 100">
          <circle class="intro__inel" cx="50" cy="50" r="42"></circle>
          <circle class="intro__punct" cx="50" cy="50" r="16" fill="currentColor"></circle>
          <path class="intro__play" d="M41 33.5 68 50 41 66.5Z" fill="currentColor" stroke="currentColor" stroke-width="6" stroke-linejoin="round"></path>
        </svg>
        <p class="intro__nume">${litere}</p>
        <p class="intro__sub"><span>Portofoliu</span><span class="intro__tc">00:00:00:00</span></p>
      </div>
    </div>
    <button class="intro__sari" type="button" aria-hidden="false">Sari peste <kbd>Esc</kbd></button>`;
  document.body.appendChild(ecran);
  html.classList.add("intro-pornit");

  try {
    sessionStorage.setItem("tm-intro", "1");
  } catch (eroare) {
    /* fără sessionStorage intro-ul apare la fiecare încărcare; nu e grav */
  }

  const semn = ecran.querySelector(".intro__semn");
  const scena = ecran.querySelector(".intro__scena");
  const tc = ecran.querySelector(".intro__tc");

  /* ---------- Pornirea, după ce fontul e gata ----------------------------- */
  let pornit = false;
  let iesit = false;
  let cronometru = 0;
  let cadruTc = 0;

  function porneste() {
    if (pornit || iesit) return;
    pornit = true;

    // Semnul pornește din centrul ecranului, apoi alunecă la locul lui
    const s = scena.getBoundingClientRect();
    const m = semn.getBoundingClientRect();
    scena.style.setProperty("--dx", `${(s.left + s.width / 2 - (m.left + m.width / 2)).toFixed(1)}px`);

    // Două cadre: browserul desenează întâi poziția de start, apoi animația curge
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        ecran.classList.add("intro--ruleaza");
        const t0 = performance.now();
        const bucla = () => {
          const cadre = Math.floor(((performance.now() - t0) / 1000) * FPS);
          const sec = Math.floor(cadre / FPS);
          tc.textContent = `00:00:${String(sec % 60).padStart(2, "0")}:${String(cadre % FPS).padStart(2, "0")}`;
          cadruTc = requestAnimationFrame(bucla);
        };
        cadruTc = requestAnimationFrame(bucla);

        const sfarsitLitere = 1820 + index * 45 + 1000;
        cronometru = setTimeout(iese, Math.max(sfarsitLitere, 3300) + PAUZA - 550);
      })
    );
  }

  const fontGata =
    document.fonts && document.fonts.load
      ? Promise.race([
          Promise.all([document.fonts.load('600 40px "Space Grotesk"'), document.fonts.load('500 12px "JetBrains Mono"')]),
          new Promise((rezolva) => setTimeout(rezolva, 900)),
        ])
      : Promise.resolve();
  fontGata.then(porneste, porneste);

  /* ---------- Ieșirea ----------------------------------------------------- */
  function iese() {
    if (iesit) return;
    iesit = true;
    clearTimeout(cronometru);
    ecran.classList.add("intro--iese");

    // Site-ul începe să apară sub stratul care se topește
    setTimeout(() => {
      html.classList.remove("intro-activ");
      anunta();
    }, 380);

    setTimeout(() => ecran.classList.add("intro--stinge"), 900);

    setTimeout(() => {
      cancelAnimationFrame(cadruTc);
      ecran.remove();
      html.classList.remove("intro-pornit");
      document.removeEventListener("keydown", laTasta);
    }, 1900);
  }

  function laTasta(eveniment) {
    if (["Escape", "Enter", " ", "Spacebar"].includes(eveniment.key)) {
      eveniment.preventDefault();
      iese();
    }
  }
  document.addEventListener("keydown", laTasta);
  ecran.addEventListener("click", iese);
})();
