/* ==========================================================================
   16voci16zile/oglinda.js — OGLINDA (vocea EISOPTROPHOBIA)

   În locul fotografiei, pagina arată imaginea de la camera vizitatorului,
   ca într-o oglindă. Camera pornește doar după ce vizitatorul acceptă
   termenii de mai jos și după ce browserul îi cere permisiunea.
   Imaginea rămâne pe ecranul lui: nu se înregistrează, nu se salvează
   și nu se trimite nicăieri. Microfonul nu se folosește.

   O voce devine oglindă cu `oglinda: true` în date.js.
   ========================================================================== */

"use strict";

(function () {
  const CHEIE = "oglinda-acord-v1";
  const TERMENI = [
    "Camera pornește doar după ce accepți acești termeni și după ce browserul îți cere permisiunea.",
    "Imaginea apare numai pe ecranul tău. Nu este înregistrată, salvată sau trimisă nicăieri — nici organizatorilor, nici altcuiva.",
    "Microfonul nu este folosit.",
    "Poți opri camera oricând, cu butonul „Oprește camera” sau închizând pagina. Camera se oprește singură și când ieși din pagină.",
    "Dacă nu vrei să pornești camera, poți citi vocea și fără ea.",
  ];

  let flux = null; // fluxul camerei, cât timp e pornită

  const acordDat = () => {
    try { return sessionStorage.getItem(CHEIE) === "1"; } catch (e) { return false; }
  };
  const memoreazaAcord = () => {
    try { sessionStorage.setItem(CHEIE, "1"); } catch (e) { /* fără memorie, se cere din nou */ }
  };

  function scrieStare(cadru, text) {
    const el = cadru.querySelector(".oglinda__stare");
    if (!el) return;
    el.textContent = text || "";
    el.hidden = !text;
  }

  function opreste() {
    if (flux) {
      flux.getTracks().forEach((t) => t.stop());
      flux = null;
    }
    document.querySelectorAll("[data-oglinda]").forEach((c) => {
      c.classList.remove("oglinda--pornita");
      c.querySelectorAll("video").forEach((v) => (v.srcObject = null));
    });
  }

  async function porneste(cadru) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      scrieStare(cadru, "Browserul tău nu permite camera pe această pagină.");
      return;
    }
    scrieStare(cadru, "Se pornește camera…");
    try {
      flux = flux || (await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1080 }, height: { ideal: 1350 } },
        audio: false,
      }));
      cadru.querySelectorAll("video").forEach((v) => {
        v.srcObject = flux;
        const p = v.play();
        if (p && p.catch) p.catch(() => {});
      });
      cadru.classList.add("oglinda--pornita");
      scrieStare(cadru, "");
      const stop = cadru.querySelector("[data-oglinda-opreste]");
      if (stop) stop.focus({ preventScroll: true });
    } catch (e) {
      const refuz = e && (e.name === "NotAllowedError" || e.name === "SecurityError");
      scrieStare(cadru, refuz
        ? "Nu ai dat voie camerei. Poți schimba asta din setările browserului, apoi apasă din nou „Privește-te”."
        : "Camera nu a putut porni pe acest dispozitiv.");
    }
  }

  // Fereastra cu termenii: camera pornește doar după bifă + „Pornește oglinda”
  function cereAcord(titlu, laAcord) {
    const inainte = document.activeElement;
    const d = document.createElement("div");
    d.className = "acord";
    d.setAttribute("role", "dialog");
    d.setAttribute("aria-modal", "true");
    d.setAttribute("aria-labelledby", "acord-titlu");
    d.innerHTML = `<div class="acord__cutie">
        <p class="acord__eticheta">Oglinda · termeni și condiții pentru cameră</p>
        <h2 class="acord__titlu negru" id="acord-titlu"></h2>
        <p class="acord__intro">Această voce nu are fotografie. Fotografia ești tu: pagina îți arată imaginea de la camera dispozitivului, ca într-o oglindă.</p>
        <ul class="acord__termeni">${TERMENI.map((t) => `<li>${t}</li>`).join("")}</ul>
        <label class="acord__bifa"><input type="checkbox" id="acord-bifa"><span>Am citit și sunt de acord cu termenii de mai sus.</span></label>
        <div class="acord__butoane">
          <button class="buton" type="button" id="acord-da" disabled>Pornește oglinda</button>
          <button class="buton buton--gol" type="button" id="acord-nu">Continuă fără cameră</button>
        </div>
      </div>`;
    d.querySelector("#acord-titlu").textContent = titlu || "Oglinda";
    document.body.appendChild(d);
    document.documentElement.classList.add("cu-acord");

    const bifa = d.querySelector("#acord-bifa");
    const da = d.querySelector("#acord-da");
    const nu = d.querySelector("#acord-nu");
    const inchide = () => {
      d.remove();
      document.documentElement.classList.remove("cu-acord");
      if (inainte && inainte.focus) inainte.focus({ preventScroll: true });
    };
    bifa.addEventListener("change", () => (da.disabled = !bifa.checked));
    da.addEventListener("click", () => {
      memoreazaAcord();
      inchide();
      laAcord();
    });
    nu.addEventListener("click", inchide);
    d.addEventListener("keydown", (e) => {
      if (e.key === "Escape") inchide();
      if (e.key === "Tab") { // focusul rămâne în fereastră
        const f = [bifa, da, nu].filter((x) => !x.disabled);
        const i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
    setTimeout(() => bifa.focus(), 30);
  }

  // Cadrul oglinzii, pus în locul fotografiei
  function cadru(nr) {
    return `<div class="voce__cadru oglinda" data-oglinda>
        <video class="oglinda__video" playsinline muted autoplay aria-label="Reflexia ta, de la camera dispozitivului"></video>
        <video class="oglinda__ecou" playsinline muted autoplay aria-hidden="true"></video>
        <div class="oglinda__repaus">
          <span class="gol__nr" aria-hidden="true">${nr}</span>
          <p class="oglinda__text">Aici nu e o fotografie.<br>E o oglindă.</p>
          <button class="buton" type="button" data-oglinda-porneste>Privește-te</button>
        </div>
        <p class="oglinda__stare" role="status" hidden></p>
        <button class="oglinda__opreste" type="button" data-oglinda-opreste>Oprește camera</button>
        <p class="oglinda__nota">Reflexia ta nu e înregistrată și nu pleacă de pe acest ecran.</p>
      </div>`;
  }

  // laIncarcare: pe pagina vocii, termenii apar înainte de orice
  function leaga(c, titlu, laIncarcare) {
    if (!c) return;
    const cere = () => (acordDat() ? porneste(c) : cereAcord(titlu, () => porneste(c)));
    c.querySelector("[data-oglinda-porneste]").addEventListener("click", cere);
    c.querySelector("[data-oglinda-opreste]").addEventListener("click", () => {
      opreste();
      const b = c.querySelector("[data-oglinda-porneste]");
      if (b) b.focus({ preventScroll: true });
    });
    if (laIncarcare) cere();
  }

  addEventListener("pagehide", opreste);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) opreste();
  });

  window.Oglinda = { cadru, leaga, opreste };
})();
