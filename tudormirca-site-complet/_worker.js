// Versiune: 24.11.2026 — expoziția 16 Zile. 16 Voci. (17 voci)
/* ==========================================================================
   _worker.js — SERVERUL MIC DIN SPATELE SITE-ULUI (Cloudflare Pages)

   Ce face:
   - /data.js      dacă ai salvat ceva din /admin, trimite conținutul salvat
                   (părțile care lipsesc de acolo se iau din data.js);
                   altfel trimite fișierul data.js din site, ca înainte.
   - /files/...    fișierele încărcate din /admin (PDF, imagini, video...).
   - /16voci16zile/<voce>/  pagina unei voci din expoziție (unde duce QR-ul);
                   pentru o voce fără folder propriu se trimite pagina-șablon.
   - /api/...      operațiile adminului: autentificare, salvare, încărcare.
   - orice altceva paginile și fișierele site-ului, neschimbate.

   Are nevoie de două setări în Cloudflare (proiectul Pages → Settings):
   - Bindings: un KV namespace legat cu numele  SITE
   - Variables and Secrets: un secret numit     ADMIN_PASSWORD
   Nu trebuie să modifici nimic în acest fișier.
   ========================================================================== */

const COOKIE = "tm_admin";
const ZILE_SESIUNE = 30;
const MAX_FISIER = 25 * 1024 * 1024; // limita Cloudflare KV pentru o valoare
const MAX_DATE = 1024 * 1024;
const VERSIUNI_PASTRATE = 20;
const INCERCARI_LOGIN = 8;

const ANTET_ADMIN = {
  "cache-control": "no-store",
  "x-robots-tag": "noindex, nofollow",
  "x-frame-options": "DENY",
  "referrer-policy": "same-origin",
  "x-content-type-options": "nosniff",
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cale = url.pathname;
    try {
      if (cale === "/data.js") return await trimiteDate(request, env, url);
      // Adrese scrise invers sau fără „/” la final duc tot la expoziție
      const gresit = cale.match(/^\/(16zile16voci|16voci16zile)(\/.*)?$/i);
      if (gresit && (gresit[1] !== "16voci16zile" || !gresit[2])) {
        return Response.redirect(url.origin + "/16voci16zile" + (gresit[2] || "/") + url.search, 301);
      }
      if (cale.startsWith("/16voci16zile/")) return await paginaVoce(request, env, url, cale);
      if (cale.startsWith("/files/")) return await trimiteFisier(request, env, cale.slice(7), url);
      if (cale.startsWith("/api/")) return await api(request, env, url);
      if (cale === "/admin" || cale === "/admin/") {
        return cuAntete(await env.ASSETS.fetch(request), ANTET_ADMIN);
      }
      return env.ASSETS.fetch(request);
    } catch (eroare) {
      return json({ eroare: "Eroare pe server: " + (eroare && eroare.message ? eroare.message : String(eroare)) }, 500);
    }
  },
};

/* ---------- utilitare ---------------------------------------------------- */
function json(obiect, status = 200, antete = {}) {
  return new Response(JSON.stringify(obiect), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...antete },
  });
}

function cuAntete(raspuns, antete) {
  const r = new Response(raspuns.body, raspuns);
  for (const [k, v] of Object.entries(antete)) r.headers.set(k, v);
  return r;
}

const encoder = new TextEncoder();

function b64url(bytes) {
  let s = "";
  const arr = new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sha256(text) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(text)));
}

// comparație în timp constant (pe rezumate de aceeași lungime)
async function egalSigur(a, b) {
  const [x, y] = await Promise.all([sha256("cmp|" + a), sha256("cmp|" + b)]);
  let diferenta = 0;
  for (let i = 0; i < x.length; i++) diferenta |= x[i] ^ y[i];
  return diferenta === 0;
}

async function cheieSesiune(env) {
  const material = await sha256("tm-admin-sesiune|" + env.ADMIN_PASSWORD);
  return crypto.subtle.importKey("raw", material, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
}

async function semneaza(env, text) {
  const cheie = await cheieSesiune(env);
  return b64url(await crypto.subtle.sign("HMAC", cheie, encoder.encode(text)));
}

async function creeazaToken(env) {
  const expira = String(Date.now() + ZILE_SESIUNE * 86400000);
  return expira + "." + (await semneaza(env, expira));
}

function citesteCookie(request, nume) {
  const antet = request.headers.get("cookie") || "";
  for (const parte of antet.split(";")) {
    const [k, ...rest] = parte.trim().split("=");
    if (k === nume) return rest.join("=");
  }
  return "";
}

async function esteAutentificat(request, env) {
  if (!env.ADMIN_PASSWORD) return false;
  const token = citesteCookie(request, COOKIE);
  const [expira, semnatura] = token.split(".");
  if (!expira || !semnatura || !/^\d+$/.test(expira) || Number(expira) < Date.now()) return false;
  return egalSigur(semnatura, await semneaza(env, expira));
}

function cookieSesiune(valoare, secunde) {
  return `${COOKIE}=${valoare}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${secunde}`;
}

/* ---------- /16voci16zile/<voce>/ ----------------------------------------- */
// Vocile au foldere proprii (făcute de tools/build_16voci.py). O voce adăugată
// în date.js fără folder primește tot pagina-șablon, care o găsește după adresă.
async function paginaVoce(request, env, url, cale) {
  const raspuns = await env.ASSETS.fetch(request);
  if (raspuns.status !== 404) return raspuns;
  const potrivire = cale.match(/^\/16voci16zile\/([a-z0-9-]+)\/?$/i);
  if (!potrivire || potrivire[1] === "poster") return raspuns;
  if (!cale.endsWith("/")) return Response.redirect(url.origin + cale + "/" + url.search, 301);
  const sablon = await env.ASSETS.fetch(new Request(new URL("/16voci16zile/poster/", url), request));
  return new Response(sablon.body, { status: 200, headers: sablon.headers });
}

/* ---------- /data.js ----------------------------------------------------- */
async function trimiteDate(request, env, url) {
  if (env.SITE && !url.searchParams.has("original")) {
    const salvat = await env.SITE.getWithMetadata("site:date");
    if (salvat && salvat.value) {
      const cand = salvat.metadata && salvat.metadata.salvatLa ? salvat.metadata.salvatLa : "";
      // Părțile care lipsesc din conținutul salvat (ex: secțiuni adăugate
      // după ultima publicare) se iau din data.js; restul vine din admin.
      let implicit = "";
      try {
        const fisier = await env.ASSETS.fetch(new Request(new URL("/data.js", url)));
        const text = fisier.ok ? await fisier.text() : "";
        if (/\bconst DATE\s*=/.test(text)) implicit = text.replace(/\bconst DATE\s*=/, "const DATE_FISIER =");
      } catch (e) {
        implicit = "";
      }
      const corp =
        "/* Conținut salvat din /admin" + (cand ? " la " + cand : "") +
        ". Ce nu există acolo se ia din data.js. */\n" +
        (implicit
          ? implicit + "\nconst DATE = Object.assign({}, DATE_FISIER, " + salvat.value + ");\n"
          : "const DATE = " + salvat.value + ";\n");
      return new Response(corp, {
        headers: { "content-type": "application/javascript; charset=utf-8", "cache-control": "no-cache" },
      });
    }
  }
  return cuAntete(await env.ASSETS.fetch(new Request(new URL("/data.js", url), request)), { "cache-control": "no-cache" });
}

/* ---------- /files/... --------------------------------------------------- */
const TIPURI_INLINE = /^(image\/(png|jpeg|gif|webp|avif)|application\/pdf|video\/|audio\/|text\/plain)/;

async function trimiteFisier(request, env, cheieBruta, url) {
  if (!env.SITE) return new Response("Fișierul nu există.", { status: 404 });
  let cheie;
  try { cheie = decodeURIComponent(cheieBruta); } catch { return new Response("Adresă greșită.", { status: 400 }); }
  if (!/^[a-z0-9][a-z0-9._-]{0,200}$/i.test(cheie)) return new Response("Fișierul nu există.", { status: 404 });

  const interval = request.headers.get("range");
  const rezultat = await env.SITE.getWithMetadata("file:" + cheie, { type: interval ? "arrayBuffer" : "stream" });
  if (!rezultat || rezultat.value === null) return new Response("Fișierul nu există.", { status: 404 });

  const meta = rezultat.metadata || {};
  const tip = meta.tip || "application/octet-stream";
  const inline = TIPURI_INLINE.test(tip);
  const descarca = url.searchParams.has("download");
  const nume = meta.nume || cheie;
  const antete = {
    "content-type": tip,
    "cache-control": "public, max-age=31536000, immutable",
    "x-content-type-options": "nosniff",
    "accept-ranges": "bytes",
    "content-disposition": (descarca || !inline ? "attachment" : "inline") + "; filename*=UTF-8''" + encodeURIComponent(nume),
  };
  if (!inline) antete["content-security-policy"] = "default-src 'none'; style-src 'unsafe-inline'; sandbox";

  if (interval) {
    const date = new Uint8Array(rezultat.value);
    const total = date.byteLength;
    const m = /^bytes=(\d*)-(\d*)$/.exec(interval.trim());
    if (!m || (m[1] === "" && m[2] === "")) {
      return new Response(null, { status: 416, headers: { "content-range": `bytes */${total}` } });
    }
    let start, sfarsit;
    if (m[1] === "") { start = Math.max(0, total - Number(m[2])); sfarsit = total - 1; }
    else { start = Number(m[1]); sfarsit = m[2] === "" ? total - 1 : Math.min(Number(m[2]), total - 1); }
    if (start > sfarsit || start >= total) {
      return new Response(null, { status: 416, headers: { "content-range": `bytes */${total}` } });
    }
    return new Response(date.slice(start, sfarsit + 1), {
      status: 206,
      headers: { ...antete, "content-range": `bytes ${start}-${sfarsit}/${total}`, "content-length": String(sfarsit - start + 1) },
    });
  }
  if (meta.marime) antete["content-length"] = String(meta.marime);
  return new Response(rezultat.value, { headers: antete });
}

/* ---------- /api/... ----------------------------------------------------- */
async function api(request, env, url) {
  const ruta = url.pathname.slice(5).replace(/\/+$/, "");
  const metoda = request.method;

  if (ruta === "stare" && metoda === "GET") {
    return json({
      kv: Boolean(env.SITE),
      parola: Boolean(env.ADMIN_PASSWORD),
      autentificat: await esteAutentificat(request, env),
    });
  }
  if (!env.SITE) return json({ eroare: "Lipsește legătura KV numită SITE (Settings → Bindings)." }, 503);
  if (!env.ADMIN_PASSWORD) return json({ eroare: "Lipsește secretul ADMIN_PASSWORD (Settings → Variables and Secrets)." }, 503);

  // cererile care schimbă ceva trebuie să vină de pe același site
  if (metoda !== "GET" && metoda !== "HEAD") {
    const origine = request.headers.get("origin");
    if (origine !== url.origin) return json({ eroare: "Cerere respinsă (altă origine)." }, 403);
  }

  if (ruta === "login" && metoda === "POST") return login(request, env);
  if (!(await esteAutentificat(request, env))) return json({ eroare: "Sesiunea a expirat. Intră din nou." }, 401);

  if (ruta === "logout" && metoda === "POST") return json({ ok: true }, 200, { "set-cookie": cookieSesiune("", 0) });
  if (ruta === "date" && metoda === "PUT") return salveazaDate(request, env);
  if (ruta === "date" && metoda === "DELETE") return revinoLaFisiere(env);
  if (ruta === "versiuni" && metoda === "GET") return listeazaVersiuni(env);
  if (ruta === "versiuni/restaureaza" && metoda === "POST") return restaureaza(request, env);
  if (ruta === "fisiere" && metoda === "GET") return listeazaFisiere(env);
  if (ruta === "fisiere" && metoda === "POST") return incarca(request, env);
  if (ruta.startsWith("fisiere/") && metoda === "DELETE") return stergeFisier(env, ruta.slice(8));
  return json({ eroare: "Rută necunoscută." }, 404);
}

async function login(request, env) {
  const ip = request.headers.get("cf-connecting-ip") || "necunoscut";
  const cheieIncercari = "incercari:" + ip;
  const esuari = parseInt((await env.SITE.get(cheieIncercari)) || "0", 10);
  if (esuari >= INCERCARI_LOGIN) {
    return json({ eroare: "Prea multe încercări greșite. Mai încearcă peste 15 minute." }, 429);
  }
  let corp = {};
  try { corp = await request.json(); } catch { /* corp gol */ }
  const corecta = typeof corp.parola === "string" && corp.parola.length > 0 && (await egalSigur(corp.parola, env.ADMIN_PASSWORD));
  if (!corecta) {
    await env.SITE.put(cheieIncercari, String(esuari + 1), { expirationTtl: 900 });
    return json({ eroare: "Parolă greșită." }, 401);
  }
  if (esuari) await env.SITE.delete(cheieIncercari);
  const token = await creeazaToken(env);
  return json({ ok: true }, 200, { "set-cookie": cookieSesiune(token, ZILE_SESIUNE * 86400) });
}

function acum() {
  return new Date().toISOString();
}

async function pastreazaVersiune(env, motiv) {
  const curent = await env.SITE.getWithMetadata("site:date");
  if (!curent || !curent.value) return;
  const cand = acum();
  await env.SITE.put("versiune:" + cand, curent.value, {
    metadata: { salvatLa: (curent.metadata && curent.metadata.salvatLa) || cand, inlocuitLa: cand, motiv },
  });
  // păstrăm doar ultimele VERSIUNI_PASTRATE
  const lista = await env.SITE.list({ prefix: "versiune:" });
  const chei = lista.keys.map((k) => k.name).sort().reverse();
  for (const vechi of chei.slice(VERSIUNI_PASTRATE)) await env.SITE.delete(vechi);
}

function verificaStructura(date) {
  if (!date || typeof date !== "object" || Array.isArray(date)) return "Conținutul trebuie să fie un obiect.";
  for (const cheie of ["profil", "proiecte", "universitate"]) {
    if (!(cheie in date)) return `Lipsește partea „${cheie}”.`;
  }
  if (!Array.isArray(date.proiecte)) return "„proiecte” trebuie să fie o listă.";
  if (date.universitate.materiale && !Array.isArray(date.universitate.materiale)) return "„materiale” trebuie să fie o listă.";
  return "";
}

async function salveazaDate(request, env) {
  const text = await request.text();
  if (text.length > MAX_DATE) return json({ eroare: "Conținutul e prea mare (peste 1 MB)." }, 413);
  let date;
  try { date = JSON.parse(text); } catch { return json({ eroare: "Conținutul nu e JSON valid." }, 400); }
  const problema = verificaStructura(date);
  if (problema) return json({ eroare: problema }, 400);
  await pastreazaVersiune(env, "salvare");
  const cand = acum();
  await env.SITE.put("site:date", JSON.stringify(date), { metadata: { salvatLa: cand } });
  return json({ ok: true, salvatLa: cand });
}

async function revinoLaFisiere(env) {
  await pastreazaVersiune(env, "revenire la data.js");
  await env.SITE.delete("site:date");
  return json({ ok: true });
}

async function listeazaVersiuni(env) {
  const lista = await env.SITE.list({ prefix: "versiune:" });
  const versiuni = lista.keys
    .map((k) => ({ id: k.name.slice(9), ...(k.metadata || {}) }))
    .sort((a, b) => (a.id < b.id ? 1 : -1));
  const curent = await env.SITE.getWithMetadata("site:date");
  return json({
    curent: curent && curent.value ? (curent.metadata || {}) : null,
    versiuni,
  });
}

async function restaureaza(request, env) {
  let corp = {};
  try { corp = await request.json(); } catch { /* gol */ }
  const id = String(corp.id || "");
  const versiune = await env.SITE.get("versiune:" + id);
  if (!versiune) return json({ eroare: "Versiunea nu mai există." }, 404);
  await pastreazaVersiune(env, "înainte de restaurare");
  const cand = acum();
  await env.SITE.put("site:date", versiune, { metadata: { salvatLa: cand, restauratDin: id } });
  return json({ ok: true, salvatLa: cand, date: JSON.parse(versiune) });
}

/* ---------- fișiere ------------------------------------------------------ */
const TIPURI_EXTENSIE = {
  pdf: "application/pdf", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif",
  webp: "image/webp", avif: "image/avif", svg: "image/svg+xml", mp4: "video/mp4", webm: "video/webm",
  mov: "video/quicktime", m4v: "video/mp4", mp3: "audio/mpeg", wav: "audio/wav", m4a: "audio/mp4",
  txt: "text/plain", doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  zip: "application/zip", psd: "image/vnd.adobe.photoshop", ai: "application/postscript",
};

function slug(text) {
  return String(text)
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    .slice(0, 60) || "fisier";
}

async function incarca(request, env) {
  let formular;
  try { formular = await request.formData(); } catch { return json({ eroare: "Încărcarea nu a putut fi citită." }, 400); }
  const fisier = formular.get("fisier");
  if (!fisier || typeof fisier === "string") return json({ eroare: "Nu am primit niciun fișier." }, 400);
  if (fisier.size === 0) return json({ eroare: "Fișierul e gol." }, 400);
  if (fisier.size > MAX_FISIER) return json({ eroare: "Fișierul are peste 25 MB. Micșorează-l sau pune-l pe YouTube / Google Drive și adaugă un link." }, 413);

  const numeOriginal = String(fisier.name || "fisier").slice(0, 150);
  const punct = numeOriginal.lastIndexOf(".");
  const ext = punct > 0 ? numeOriginal.slice(punct + 1).toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) : "";
  const baza = punct > 0 ? numeOriginal.slice(0, punct) : numeOriginal;
  const data = acum().slice(0, 10).replace(/-/g, "");
  const aleator = b64url(crypto.getRandomValues(new Uint8Array(4))).replace(/[^a-z0-9]/gi, "").toLowerCase().slice(0, 5) || "x";
  const cheie = `${data}-${slug(baza)}-${aleator}${ext ? "." + ext : ""}`;
  const tip = (fisier.type && fisier.type !== "application/octet-stream" ? fisier.type : TIPURI_EXTENSIE[ext]) || "application/octet-stream";
  const meta = { nume: numeOriginal, tip, marime: fisier.size, incarcatLa: acum() };

  await env.SITE.put("file:" + cheie, await fisier.arrayBuffer(), { metadata: meta });
  return json({ ok: true, cheie, url: "/files/" + cheie, ...meta });
}

async function listeazaFisiere(env) {
  const fisiere = [];
  let cursor;
  do {
    const lista = await env.SITE.list({ prefix: "file:", cursor });
    for (const k of lista.keys) {
      const cheie = k.name.slice(5);
      fisiere.push({ cheie, url: "/files/" + cheie, ...(k.metadata || {}) });
    }
    cursor = lista.list_complete ? undefined : lista.cursor;
  } while (cursor);
  fisiere.sort((a, b) => String(b.incarcatLa || "").localeCompare(String(a.incarcatLa || "")));
  return json({ fisiere });
}

async function stergeFisier(env, cheieBruta) {
  let cheie;
  try { cheie = decodeURIComponent(cheieBruta); } catch { return json({ eroare: "Adresă greșită." }, 400); }
  if (!/^[a-z0-9][a-z0-9._-]{0,200}$/i.test(cheie)) return json({ eroare: "Nume de fișier invalid." }, 400);
  await env.SITE.delete("file:" + cheie);
  return json({ ok: true });
}
