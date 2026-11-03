/*
 * MÒDUL DE VOTACIÓ (pàgina votacio.html)
 * -------------------------------------------------------------
 * Base de dades: Supabase (Postgres). Esquema i regles: supabase/esquema.sql
 * (o supabase/migracio-02-sense-codis.sql si es va instal·lar la versió amb codis).
 * Només s'inicialitza si DADES.config.votacioActiva === true.
 *
 * Com funciona:
 *  - Sense codis: cada persona tria el seu nom d'una llista tancada (taula «participants»).
 *  - En el primer ús, el navegador genera un identificador aleatori («dispositiu») i el desa.
 *    El vot queda lligat a aquest identificador: des d'un altre navegador no es pot canviar
 *    ni veure el vot d'una altra persona.
 *  - El recompte per casa no surt de la base de dades fins que arriba la data límit,
 *    ha votat tothom o es tanca a mà. Llavors la votació queda tancada.
 *  - El navegador només pot cridar aquestes funcions:
 *      participants_votacio()            → noms i si cadascú ha votat (no QUÈ)
 *      el_meu_vot(nom, dispositiu)       → el vot propi, només des del mateix navegador
 *      votar(nom, casa, dispositiu)      → desa o canvia el vot
 *      retirar_vot(nom, dispositiu)      → esborra el vot propi
 *      resultats()                       → estat; el recompte només quan és visible
 *  - Al navegador només es desen el nom triat i l'identificador. Els vots sempre es
 *    llegeixen de la base de dades.
 */

window.Votacio = (function () {
  "use strict";

  const CLAU_NOM = "escapada-desembre-2026:votacio-nom";
  const CLAU_DISPOSITIU = "escapada-desembre-2026:votacio-dispositiu";
  const REFRESC_MS = 30000;
  const ERRORS = {
    votacio_tancada: "La votació ja està tancada: no es poden fer canvis.",
    participant_desconegut: "Aquest nom no és a la llista. Torna a carregar la pàgina.",
    casa_invalida: "Aquesta casa no es pot votar.",
    vot_altre_dispositiu: "Ja consta un vot teu fet des d'un altre mòbil o navegador. Si el vols canviar, demana a qui organitza que l'esborri.",
    dispositiu_invalid: "Aquest navegador no permet desar dades. Prova-ho amb un altre navegador o fora del mode privat.",
  };

  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  const eur = (v) => new Intl.NumberFormat("ca-ES", { style: "currency", currency: "EUR" }).format(v);
  const pct = (v) => new Intl.NumberFormat("ca-ES", { style: "percent", maximumFractionDigits: 0 }).format(v);
  const fmtLimit = (iso) => {
    const d = new Date(iso);
    const dia = new Intl.DateTimeFormat("ca-ES", { day: "numeric", month: "long", timeZone: "Europe/Madrid" }).format(d);
    const hora = new Intl.DateTimeFormat("ca-ES", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid" }).format(d);
    return `el ${dia} a les ${hora}`;
  };
  const llegeix = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
  const desa = (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch { /* ignorat */ } };

  let cfg = null;
  let cases = [];
  let dispositiu = null;
  let participants = [];       // [{ nom, ha_votat }]
  let nom = null;              // nom triat en aquest navegador
  let meuVot = null;           // id de casa o null
  let resultats = null;        // { visibles, data_limit, participants, votants, vots }
  let ocupat = false;

  function idDispositiu() {
    let id = llegeix(CLAU_DISPOSITIU);
    if (!id) {
      id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
        : Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      desa(CLAU_DISPOSITIU, id);
    }
    return id;
  }

  /* ---------- Connexió amb Supabase (API REST, sense llibreries) ---------- */
  async function rpc(funcio, params = {}) {
    const headers = { apikey: cfg.clauPublica, "Content-Type": "application/json" };
    // Les claus antigues («anon», un JWT que comença per eyJ) també van a Authorization.
    if (cfg.clauPublica.startsWith("eyJ")) headers.Authorization = `Bearer ${cfg.clauPublica}`;
    const r = await fetch(`${cfg.supabaseUrl.replace(/\/+$/, "").replace(/\/rest\/v1$/, "")}/rest/v1/rpc/${funcio}`, {
      method: "POST", headers, body: JSON.stringify(params),
    });
    const text = await r.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch { /* resposta no JSON */ }
    if (!r.ok) {
      const e = new Error((json && json.message) || `Error ${r.status}`);
      e.codi = json && json.message;
      throw e;
    }
    return json;
  }

  const carregarVots = () => rpc("resultats");
  const enviarVot = (persona, casaId) => rpc("votar", { p_nom: persona, p_casa: casaId, p_dispositiu: dispositiu });

  const missatgeError = (e) => ERRORS[e.codi] || "No s'ha pogut connectar amb la base de dades. Comprova la connexió i torna-ho a provar.";

  function avis(text, error) {
    const el = $("votacio-avis");
    el.textContent = text || "";
    el.classList.toggle("votacio__avis--error", !!error);
  }

  /* ---------- Pintar ---------- */
  function pintaSelector() {
    const sel = $("votacio-persona");
    const actual = sel.value;
    sel.innerHTML = `<option value="">Tria el teu nom</option>` + participants.map((p) =>
      `<option value="${esc(p.nom)}">${esc(p.nom)}${p.ha_votat ? " (ja ha votat)" : ""}</option>`).join("");
    sel.value = actual;
  }

  function mostrarResultats() {
    const r = resultats || { visibles: false, participants: 0, votants: 0, vots: null };
    const tancada = !!r.visibles;
    const jo = participants.find((p) => p.nom === nom);
    const votAltreLloc = !!jo && jo.ha_votat && meuVot == null;
    const potVotar = !!jo && !tancada && !ocupat && !votAltreLloc;

    // Qui ets
    $("votacio-form").hidden = !!jo || tancada;
    $("votacio-qui").hidden = !jo;
    if (jo) {
      const c = cases.find((x) => x.id === meuVot);
      $("votacio-nom").textContent = jo.nom;
      $("votacio-meu-vot").textContent = c ? `Has votat ${c.nom}.`
        : votAltreLloc ? "Ja consta el teu vot, fet des d'un altre mòbil o navegador."
        : tancada ? "No vas arribar a votar." : "Encara no has votat.";
      $("votacio-retirar").hidden = !c || tancada;
      $("votacio-sortir").hidden = tancada;
    }

    // Estat i participació
    const limit = r.data_limit ? fmtLimit(r.data_limit) : null;
    $("votacio-titol-llista").textContent = tancada ? "Resultats" : "Cases";
    $("votacio-estat").textContent = `${r.votants} de ${r.participants} ${r.participants === 1 ? "persona ha" : "persones han"} votat. `
      + (tancada ? "La votació està tancada."
        : limit ? `El recompte es veurà ${limit} o quan hagi votat tothom, el que passi primer.`
        : "El recompte es veurà quan hagi votat tothom.");
    const han = participants.filter((p) => p.ha_votat).map((p) => p.nom);
    const falten = participants.filter((p) => !p.ha_votat).map((p) => p.nom);
    $("votacio-participants").innerHTML = participants.length
      ? `${han.length ? `<span><b>Han votat:</b> ${han.map(esc).join(", ")}.</span> ` : ""}${falten.length ? `<span><b>Falten:</b> ${falten.map(esc).join(", ")}.</span>` : ""}`
      : "";

    // Cases
    const vots = new Map((r.vots || []).map((v) => [v.casa_id, v.vots]));
    const maxim = Math.max(0, ...vots.values());
    $("votacio-cases").innerHTML = cases.map((c) => {
      const esMeu = meuVot === c.id;
      const preu = c.preus["7"] != null ? `${eur(c.preus["7"] / 7)} amb 7` : `${eur(c.preus["6"] / 6)} amb 6`;
      let resultat = "";
      if (tancada) {
        const n = vots.get(c.id) || 0;
        const part = r.votants ? n / r.votants : 0;
        resultat = `<div class="vot__resultat">
          <div class="vot__xifres"><span>${n} ${n === 1 ? "vot" : "vots"}</span><span>${pct(part)}</span>${n > 0 && n === maxim ? '<span class="vot__davant">Més votada</span>' : ""}</div>
          <div class="barra barra--vot" aria-hidden="true"><i style="width:${(part * 100).toFixed(1)}%"></i></div>
        </div>`;
      }
      const accio = tancada
        ? (esMeu ? `<span class="vot__meu">✓ El teu vot</span>` : "<span></span>")
        : `<button type="button" class="boto${esMeu ? " boto--ple" : ""}" data-votar="${c.id}" aria-pressed="${esMeu}" ${potVotar ? "" : "disabled"}>
            ${esMeu ? "✓ El teu vot" : "Votar"}<span class="sr"> ${esc(c.nom)}</span></button>`;
      return `<li class="vot${esMeu ? " vot--meu" : ""}${tancada ? "" : " vot--oberta"}">
        <span class="disc zona-${c.zona}" aria-hidden="true">${c.id}</span>
        <div class="vot__casa"><b>${esc(c.nom)}</b><small>${esc(c.municipi)} · ${preu} per persona</small></div>
        ${resultat}${accio}
      </li>`;
    }).join("");
  }

  async function refrescar() {
    try {
      const [r, ps] = await Promise.all([carregarVots(), rpc("participants_votacio")]);
      resultats = r;
      participants = ps || [];
      if (nom && !participants.some((p) => p.nom === nom)) { nom = null; desa(CLAU_NOM, null); }
      meuVot = nom ? await rpc("el_meu_vot", { p_nom: nom, p_dispositiu: dispositiu }) : null;
      pintaSelector();
      mostrarResultats();
    } catch (e) {
      avis(missatgeError(e), true);
    }
  }

  /* ---------- Accions ---------- */
  async function triaNom(n) {
    if (!n) return;
    nom = n;
    desa(CLAU_NOM, n);
    avis("");
    await refrescar();
  }

  function canviaNom() {
    nom = null;
    meuVot = null;
    desa(CLAU_NOM, null);
    avis("");
    mostrarResultats();
    $("votacio-persona").value = "";
    $("votacio-persona").focus();
  }

  async function votar(casaId) {
    if (!nom || ocupat) return;
    ocupat = true;
    mostrarResultats();
    try {
      await enviarVot(nom, casaId);
      const c = cases.find((x) => x.id === casaId);
      avis(`Vot desat: ${c ? c.nom : "casa " + casaId}. El pots canviar fins que es tanqui la votació.`);
    } catch (e) {
      avis(missatgeError(e), true);
    }
    ocupat = false;
    await refrescar();
    if (resultats && resultats.visibles && meuVot === casaId) avis("Vot desat. Ja ha votat tothom: aquí tens els resultats.");
  }

  async function retirar() {
    if (!nom || ocupat) return;
    ocupat = true;
    try {
      await rpc("retirar_vot", { p_nom: nom, p_dispositiu: dispositiu });
      avis("Has retirat el teu vot.");
    } catch (e) {
      avis(missatgeError(e), true);
    }
    ocupat = false;
    await refrescar();
  }

  /* ---------- Inici ---------- */
  async function inicialitzar(dades) {
    cfg = (dades.config && dades.config.votacio) || {};
    cases = [...dades.cases].sort((a, b) => a.id - b.id);
    $("votacio").hidden = false;

    if (!cfg.supabaseUrl || !cfg.clauPublica) {
      $("votacio-no-connectada").hidden = false;
      return;
    }
    $("votacio-cos").hidden = false;
    dispositiu = idDispositiu();
    nom = llegeix(CLAU_NOM);

    $("votacio-form").addEventListener("submit", (e) => { e.preventDefault(); triaNom($("votacio-persona").value); });
    $("votacio-sortir").addEventListener("click", canviaNom);
    $("votacio-retirar").addEventListener("click", retirar);
    $("votacio-cases").addEventListener("click", (e) => {
      const b = e.target.closest("[data-votar]");
      if (b && !b.disabled) votar(Number(b.dataset.votar));
    });

    mostrarResultats();
    await refrescar();

    // Al dia mentre la pàgina és visible (participació, i resultats quan s'obren).
    setInterval(() => { if (document.visibilityState === "visible" && !ocupat) refrescar(); }, REFRESC_MS);
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") refrescar(); });
  }

  return { inicialitzar, carregarVots, enviarVot, mostrarResultats };
})();
