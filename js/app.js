/* Escapada de desembre 2026 — lògica de la pàgina.
   Les dades són a js/dades.js; l'aspecte, a css/estils.css (valors de DESIGN.md). */
(function () {
  "use strict";

  const D = window.DADES;
  // Cada pàgina declara qui és a <body data-pagina="...">.
  const PAGINA = document.body.dataset.pagina || "inici";
  // Només es mostren les cases amb prou places (config.capacitatMinimaWeb);
  // la resta es conserven a dades.js però no surten enlloc de la web.
  const CASES = D.cases.filter((c) => c.capacitat >= (D.config.capacitatMinimaWeb || 0));
  // Zones i activitats: només les que tenen alguna casa visible.
  const ZONES = Object.fromEntries(Object.entries(D.zones).filter(([k]) => CASES.some((c) => c.zona === k)));
  const ACTIVITATS = D.activitats.filter((a) => ZONES[a.zona]);
  const DADES_WEB = { ...D, cases: CASES, zones: ZONES, activitats: ACTIVITATS };
  const CATS = D.categoriesActivitats;
  const NITS = D.viatge.nits;
  const CLAU_DESCARTADES = "escapada-desembre-2026:descartades";
  const CLAU_COMPARAR = "escapada-desembre-2026:comparar";
  const NOMBRES = ["cap", "una", "dues", "tres", "quatre", "cinc", "sis", "set", "vuit", "nou", "deu"];

  /* ---------- Utilitats ---------- */
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  const eur = (v, d = 2) => new Intl.NumberFormat("ca-ES", { style: "currency", currency: "EUR", minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
  const num = (v, d = 0) => new Intl.NumberFormat("ca-ES", { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
  const MESOS = ["de gener", "de febrer", "de març", "d'abril", "de maig", "de juny", "de juliol", "d'agost", "de setembre", "d'octubre", "de novembre", "de desembre"];
  const fmtData = (iso) => { const [a, m, d] = iso.split("-").map(Number); return `${d} ${MESOS[m - 1]} de ${a}`; };
  const fmtTemps = (min) => { const h = Math.floor(min / 60), m = min % 60; return h ? `${h} h ${String(m).padStart(2, "0")} min` : `${m} min`; };
  const casa = (id) => CASES.find((c) => c.id === id);

  const pp = (c, n) => (c.preus[String(n)] == null ? null : c.preus[String(n)] / n);
  const total = (c, n) => c.preus[String(n)] ?? null;
  const apta7 = (c) => c.capacitat >= 7 && c.preus["7"] != null;
  const nota10 = (c) => (c.valoracio.nota / c.valoracio.escala) * 10;
  const notaFiable = (c) => c.valoracio.ressenyes >= 10;
  const valoracioText = (v) => `${num(v.nota, v.escala === 10 ? 1 : 2)} de ${v.escala}`;
  const plataformaNota = (v) => (v.escala === 10 ? "Booking" : "Airbnb");
  const disc = (c, petit) => `<span class="disc zona-${c.zona}${petit ? " disc--petit" : ""}" aria-label="Casa ${c.id}, zona ${c.zona}">${c.id}</span>`;
  const rmMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  function avisa(text) {
    const el = $("#avis-copiat");
    el.textContent = text;
    el.classList.add("visible");
    clearTimeout(avisa.t);
    avisa.t = setTimeout(() => el.classList.remove("visible"), 2000);
  }

  async function copia(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch {
      const t = document.createElement("textarea");
      t.value = text; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
      document.body.appendChild(t); t.select();
      let ok = false; try { ok = document.execCommand("copy"); } catch { ok = false; }
      t.remove(); return ok;
    }
  }

  /* ---------- Estat ---------- */
  const estat = {
    ordreCases: "p6",
    resum: { col: "p6", dir: "asc" },
    resumMobil: "preu",
    comparar: [],
    descartades: new Set(),
    catActivitat: "totes",
    zonesObertes: new Set(),
    zonaDestacada: null,
  };

  try {
    const g = JSON.parse(localStorage.getItem(CLAU_DESCARTADES) || "[]");
    if (Array.isArray(g)) g.filter((id) => casa(id)).forEach((id) => estat.descartades.add(id));
  } catch { /* sense localStorage: funciona només durant la visita */ }
  // Les cases triades per comparar es recorden entre pàgines (només en aquest navegador).
  try {
    const g = JSON.parse(localStorage.getItem(CLAU_COMPARAR) || "[]");
    if (Array.isArray(g)) estat.comparar = g.filter((id) => casa(id) && !estat.descartades.has(id)).slice(0, 3);
  } catch { /* ignorat */ }

  function desaDescartades() {
    try { localStorage.setItem(CLAU_DESCARTADES, JSON.stringify([...estat.descartades])); } catch { /* ignorat */ }
  }
  function desaComparar() {
    try { localStorage.setItem(CLAU_COMPARAR, JSON.stringify(estat.comparar)); } catch { /* ignorat */ }
  }

  const visibles = () => CASES.filter((c) => !estat.descartades.has(c.id));

  /* ---------- Càlculs compartits ---------- */
  function minim(llista, f) { const v = llista.map(f).filter((x) => x != null); return v.length ? Math.min(...v) : null; }
  function maxim(llista, f) { const v = llista.map(f).filter((x) => x != null); return v.length ? Math.max(...v) : null; }
  function unic(llista, f, cmp) {
    const v = cmp(llista, f);
    if (v == null) return null;
    const g = llista.filter((c) => f(c) === v);
    return g.length === 1 ? g[0] : null;
  }

  // Un distintiu com a màxim per casa, calculat amb les dades.
  function distintius() {
    const llista = visibles();
    const out = {};
    const posa = (c, t) => { if (c && !out[c.id]) out[c.id] = t; };
    posa(unic(llista, (c) => pp(c, 6), minim), "Més econòmica amb 6");
    posa(unic(llista, (c) => pp(c, 7), minim), "Més econòmica amb 7");
    posa(unic(llista.filter(notaFiable), nota10, maxim), "Millor valorada");
    posa(unic(llista, (c) => c.superficie, maxim), "La més gran");
    return out;
  }

  const INSTAL = {
    jardi: "Jardí", barbacoa: "Barbacoa", llar: "Estufa o llar", wifi: "Wi-Fi",
    mascotes: "Admet mascotes", aparcament: "Aparcament", roba: "Roba de llit inclosa",
  };

  function avisosImportants(c) {
    const out = [];
    if (!c.compatibleDates) out.push(c.motiuIncompatible);
    if (c.piscinaTancada) out.push("La piscina està tancada al desembre.");
    if (c.id === 6) out.push("Accés per un camí de 200 m en mal estat i aigua de font amb poca pressió.");
    return out;
  }

  /* ---------- Preguntes pendents ---------- */
  function preguntes(c) {
    const q = [];
    const t6 = eur(c.preus["6"], 0);
    const t7 = c.preus["7"] != null ? ` i ${eur(c.preus["7"], 0)} per a 7` : "";
    q.push(`Està disponible del 4 al 8 de desembre de 2026 (4 nits)?`);
    q.push(`El preu de ${t6} per a 6 persones${t7} inclou la neteja final, les taxes i els impostos?`);
    if (c.caracteristiques.roba === null) q.push("Inclou llençols i tovalloles?");
    if (c.caracteristiques.roba === false) q.push("Quant costa afegir llençols i tovalloles?");
    if (c.caracteristiques.llar === null) q.push("Hi ha estufa o llar de foc que es pugui utilitzar?");
    q.push("La calefacció està inclosa en el preu?");
    q.push("Cal deixar dipòsit o fiança? De quin import?");
    q.push("Quina és la política de cancel·lació?");
    (c.preguntesExtra || []).forEach((x) => q.push(x));
    return q;
  }

  function missatgePreguntes(c) {
    const persones = "6 o 7 persones";
    return `Hola! Som un grup de ${persones} i ens interessa «${c.titolAnunci}» per al pont de desembre, del 4 al 8 de desembre de 2026 (4 nits). Abans de reservar, voldríem saber:\n\n`
      + preguntes(c).map((p) => `- ${p}`).join("\n")
      + `\n\nMoltes gràcies!`;
  }

  /* ---------- Capçalera ---------- */
  function pintaNav() {
    const actiu = { votacio: D.config.votacioActiva === true, temps: D.config.meteoActiva === true };
    $$("[data-nav]").forEach((el) => { if (el.dataset.nav in actiu) el.hidden = !actiu[el.dataset.nav]; });
    $$(".nav [data-pag]").forEach((a) => { if (a.dataset.pag === PAGINA) a.setAttribute("aria-current", "page"); });
  }

  function pintaCapcalera() {
    $("#ultima-actualitzacio").textContent = fmtData(D.config.lastUpdated);
    $$("[data-nombre-cases]").forEach((el) => {
      let t = String(el.dataset.nombreCases === "text" ? (NOMBRES[CASES.length] || CASES.length) : CASES.length);
      if (el.classList.contains("majuscula")) t = t.charAt(0).toUpperCase() + t.slice(1);
      el.textContent = t;
    });
    if (!$("#peces")) return;
    if (D.config.grupConfirmat) $("#hero-nota").textContent = `Preus consultats el ${fmtData(D.viatge.dataConsultaPreus)}.`;

    const b6 = CASES.reduce((a, b) => (pp(a, 6) <= pp(b, 6) ? a : b));
    const amb7 = CASES.filter(apta7);
    const b7 = amb7.reduce((a, b) => (pp(a, 7) <= pp(b, 7) ? a : b));
    const fotos = [...CASES].filter((c) => c.fotos.length).sort((a, b) => pp(a, 6) - pp(b, 6)).slice(0, 3);
    const peca = (c, x, y, r, z) => `<div class="peca" style="left:${x}px;top:${y}px;transform:rotate(${r}deg);z-index:${z}">
        <img src="${esc(c.fotos[0])}" alt="${esc(`Foto de ${c.nom}`)}" width="190" height="190"></div>`;
    const etiqueta = (c, n, x, y, r, z, cls) => `<a class="etiqueta ${cls}" href="cases.html#casa-${c.id}" style="left:${x}px;top:${y}px;transform:rotate(${r}deg);z-index:${z}">
        ${disc(c)}<span class="etiqueta__nom">${esc(c.nom)}</span>
        <span><span class="etiqueta__preu">${eur(pp(c, n))}</span><span class="etiqueta__unitat">per persona amb ${n}</span></span></a>`;
    const pos = [[40, 20, -6, 1], [300, 0, 4, 1], [90, 215, 3, 2]];
    $("#peces").innerHTML =
      fotos.map((c, i) => peca(c, ...pos[i])).join("") +
      etiqueta(b6, 6, 200, 150, 5, 3, `zona-${b6.zona}`) +
      etiqueta(b7, 7, 330, 230, -4, 4, "etiqueta--lila");
  }

  /* ---------- Resum (full de càlcul) ---------- */
  const SI_NO = (v) => (v === true ? 2 : v === null ? 1 : 0);
  const ETIQ_EQ = { wifi: "Wi-Fi", jardi: "Jardí", barbacoa: "Barbacoa", llar: "Estufa", roba: "Roba de llit", mascotes: "Mascotes", aparcament: "Aparcament" };
  function resumEquipament(c) {
    const k = c.caracteristiques;
    const si = Object.keys(ETIQ_EQ).filter((x) => k[x] === true).map((x) => ETIQ_EQ[x]);
    const no = Object.keys(ETIQ_EQ).filter((x) => k[x] === false).map((x) => (x === "llar" && c.llarText ? c.llarText : ETIQ_EQ[x]));
    const pend = Object.keys(ETIQ_EQ).filter((x) => k[x] == null).length;
    return [si.length ? `Sí: ${si.join(", ")}` : "", no.length ? `No: ${no.join(", ")}` : "", pend ? `Per confirmar: ${pend}` : ""].filter(Boolean);
  }

  // m: grup visible al mòbil (preu, total, espai, valoracio, equip, atencio); null = només a l'escriptori.
  const COLS = [
    { key: "municipi", label: "Municipi", m: null, get: (c) => c.municipi, text: true },
    { key: "p6", label: "Amb 6", lm: "Amb 6", m: "preu", grup: "pp", n: true, get: (c) => pp(c, 6), fmt: (v) => eur(v), millor: "min" },
    { key: "p7", label: "Amb 7", lm: "Amb 7", m: "preu", grup: "pp", n: true, get: (c) => pp(c, 7), fmt: (v) => eur(v), millor: "min", buit: "No apta" },
    { key: "t6", label: "Amb 6", lm: "Amb 6", m: "total", grup: "tot", n: true, sep: true, get: (c) => total(c, 6), fmt: (v) => eur(v, 0), millor: "min" },
    { key: "t7", label: "Amb 7", lm: "Amb 7", m: "total", grup: "tot", n: true, get: (c) => total(c, 7), fmt: (v) => eur(v, 0), millor: "min", buit: "No apta" },
    { key: "bcn", label: "Des de BCN", m: "valoracio", grup: "esp", n: true, sep: true, get: (c) => c.tempsBCN.minuts, fmt: (v) => fmtTemps(v), millor: "min" },
    { key: "places", label: "Places", m: "espai", grup: "esp", n: true, get: (c) => c.capacitat, fmt: (v) => v, millor: "max" },
    { key: "dorm", label: "Dorm.", m: "espai", grup: "esp", n: true, get: (c) => c.dormitoris, fmt: (v, c) => `${v}${c.dormitorisAvis ? "*" : ""}`, millor: "max" },
    { key: "banys", label: "Banys", m: "espai", grup: "esp", n: true, get: (c) => c.banys, fmt: (v, c) => c.banysText, millor: "max" },
    { key: "m2", label: "m²", m: "espai", grup: "esp", n: true, get: (c) => c.superficie, fmt: (v) => v, millor: "max", buit: "Per confirmar" },
    { key: "nota", label: "Sobre 10", m: "valoracio", grup: "val", n: true, sep: true, get: (c) => nota10(c), fmt: (v) => num(v, 1), millor: "max", filtreMillor: notaFiable },
    { key: "ress", label: "Ressenyes", m: "valoracio", grup: "val", n: true, get: (c) => c.valoracio.ressenyes, fmt: (v) => v },
    ...Object.keys(ETIQ_EQ).map((k, i) => ({
      key: k, label: ETIQ_EQ[k], m: null,
      grup: "eq", sep: i === 0, bool: true, get: (c) => c.caracteristiques[k], ordre: (c) => SI_NO(c.caracteristiques[k]),
    })),
    { key: "equipm", label: "Equipament confirmat", m: "equip", nomesMobil: true, get: (c) => resumEquipament(c), llista: true, llarg: true },
    { key: "atencio", label: "A tenir en compte", m: "atencio", sep: true, get: (c) => avisosImportants(c).join(" ") || "—", text: true, llarg: true },
  ];
  const GRUPS = { pp: "Per persona", tot: "Total 4 nits", esp: "Espai i trajecte", val: "Valoració", eq: "Equipament" };
  const GRUPS_MOBIL = { preu: "Per persona", total: "Total", espai: "Espai", valoracio: "Valoració", equip: "Equipament", atencio: "Atenció" };
  const classeMobil = (c) => (c.nomesMobil ? `nomes-mobil m-${c.m}` : c.m ? `m-${c.m}` : "nomes-escriptori");

  function pintaResum() {
    const llista = visibles();
    const col = COLS.find((c) => c.key === estat.resum.col);
    const dir = estat.resum.dir === "asc" ? 1 : -1;
    const clau = col ? (col.ordre || col.get) : (c) => pp(c, 6);
    const ord = [...llista].sort((a, b) => {
      const va = clau(a), vb = clau(b);
      if (va == null && vb == null) return a.id - b.id;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === "string") return va.localeCompare(vb, "ca") * dir;
      return (va - vb) * dir || a.id - b.id;
    });

    const millors = {};
    COLS.filter((c) => c.millor).forEach((c) => {
      const base = c.filtreMillor ? llista.filter(c.filtreMillor) : llista;
      const v = base.length > 1 ? (c.millor === "min" ? minim(base, c.get) : maxim(base, c.get)) : null;
      millors[c.key] = { v, base: new Set(base.map((x) => x.id)) };
    });

    // Capçalera de grups (només escriptori)
    const colsEscriptori = COLS.filter((c) => !c.nomesMobil);
    let grups = `<tr class="grups"><th scope="col"></th>`;
    let i = 0;
    while (i < colsEscriptori.length) {
      const g = colsEscriptori[i].grup;
      let n = 1;
      while (g && colsEscriptori[i + n] && colsEscriptori[i + n].grup === g) n++;
      grups += `<th scope="colgroup" colspan="${n}"${colsEscriptori[i].sep ? ' class="sep"' : ""}>${g ? GRUPS[g] : ""}</th>`;
      i += n;
    }
    grups += `<th scope="col"></th></tr>`;

    const ariaSort = (k) => (estat.resum.col === k ? (estat.resum.dir === "asc" ? "ascending" : "descending") : "none");
    const fletxa = (k) => (estat.resum.col === k ? (estat.resum.dir === "asc" ? "▲" : "▼") : "");
    const etiqueta = (c) => (c.lm ? `<span class="nomes-escriptori">${c.label}</span><span class="nomes-mobil">${c.lm}</span>` : c.label);
    const cap = `<tr><th scope="col">Casa</th>` + COLS.map((c) => {
      const cls = [c.n ? "n" : "", c.sep ? "sep" : "", classeMobil(c)].join(" ").trim();
      if (c.llarg) return `<th scope="col" class="${cls}">${c.label}</th>`;
      return `<th scope="col" class="${cls}" aria-sort="${ariaSort(c.key)}"><button type="button" data-ordena="${c.key}">${etiqueta(c)}<span class="fletxa" aria-hidden="true">${fletxa(c.key)}</span></button></th>`;
    }).join("") + `<th scope="col" class="m-atencio"><span class="sr">Accions</span></th></tr>`;

    const files = ord.map((c) => {
      const cel = COLS.map((col) => {
        const v = col.get(c);
        const cls = [col.n ? "n" : "", col.sep ? "sep" : "", classeMobil(col)];
        if (col.bool) {
          const t = v === true ? "Sí" : v === false ? "No" : "Per confirmar";
          cls.push(v === true ? "si" : v === false ? "no" : "pend");
          return `<td class="${cls.join(" ").trim()}">${t}</td>`;
        }
        if (col.llista) return `<td class="text ${cls.join(" ").trim()}">${v.map((x) => `<span class="full__linia">${esc(x)}</span>`).join("")}</td>`;
        if (col.llarg) return `<td class="text ${cls.join(" ").trim()}">${esc(v)}</td>`;
        if (v == null) { cls.push(col.buit === "No apta" ? "no" : "pend"); return `<td class="${cls.join(" ").trim()}">${col.buit || "Per confirmar"}</td>`; }
        const m = millors[col.key];
        if (m && m.v != null && v === m.v && m.base.has(c.id)) cls.push("millor");
        return `<td class="${cls.join(" ").trim()}">${col.text ? esc(v) : col.fmt(v, c)}</td>`;
      }).join("");
      return `<tr><th scope="row"><span class="full__casa">${disc(c)}<a href="cases.html#casa-${c.id}" data-anar-casa="${c.id}">${esc(c.nom)}</a></span></th>${cel}
        <td class="m-atencio"><button type="button" class="boto boto--text" data-descartar="${c.id}">Descartar<span class="sr"> ${esc(c.nom)}</span></button></td></tr>`;
    }).join("");

    const t = $("#taula-resum");
    t.dataset.mobil = estat.resumMobil;
    t.innerHTML = `<caption class="sr">Resum de les cases, ordenat per ${col ? col.label : "preu"}</caption><thead>${grups}${cap}</thead><tbody>${files}</tbody>`;
  }

  function preparaResumMobil() {
    const cont = $("#resum-grups");
    cont.innerHTML = Object.entries(GRUPS_MOBIL).map(([k, t]) =>
      `<button type="button" data-resum-mobil="${k}" aria-pressed="${k === estat.resumMobil}">${t}</button>`).join("");
    cont.addEventListener("click", (e) => {
      const b = e.target.closest("[data-resum-mobil]");
      if (!b) return;
      estat.resumMobil = b.dataset.resumMobil;
      $$("[data-resum-mobil]", cont).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      $("#taula-resum").dataset.mobil = estat.resumMobil;
    });
  }

  /* ---------- Filtres ---------- */
  function preparaFiltres() {
    const zona = $("#f-zona");
    Object.entries(ZONES).forEach(([k, z]) => zona.insertAdjacentHTML("beforeend", `<option value="${k}">Zona ${k}: ${esc(z.nom)}</option>`));
    const r = $("#f-preu");
    const vals = CASES.map((c) => pp(c, 6));
    r.min = Math.floor(Math.min(...vals) / 5) * 5;
    r.max = Math.ceil(Math.max(...vals) / 5) * 5;
    r.value = r.max;
    const form = $("#form-filtres");
    form.addEventListener("input", pintaCases);
    form.addEventListener("change", pintaCases);
    form.addEventListener("reset", () => setTimeout(() => { r.value = r.max; pintaCases(); }, 0));
  }

  function filtres() {
    const f = new FormData($("#form-filtres"));
    return {
      zona: f.get("zona"),
      places: Number(f.get("places")),
      dormitoris: Number(f.get("dormitoris")),
      banys: Number(f.get("banys")),
      preu: Number(f.get("preu")),
      preuAlMax: Number(f.get("preu")) >= Number($("#f-preu").max),
      c: f.getAll("c"),
      apta7: f.get("apta7") === "on",
      dates: f.get("dates") === "on",
    };
  }

  /* ---------- Targetes ---------- */
  const ORDRES = {
    p6: { text: "Ordenades pel preu per persona amb 6.", f: (a, b) => pp(a, 6) - pp(b, 6) },
    p7: { text: CASES.every(apta7) ? "Ordenades pel preu per persona amb 7." : "Ordenades pel preu per persona amb 7. Les cases de màxim 6 persones van al final.", f: (a, b) => (pp(a, 7) ?? 1e9) - (pp(b, 7) ?? 1e9) || pp(a, 6) - pp(b, 6) },
    valoracio: { text: "Ordenades per valoració sobre 10. Les notes amb menys de 10 ressenyes van al final.", f: (a, b) => (notaFiable(b) - notaFiable(a)) || nota10(b) - nota10(a) || b.valoracio.ressenyes - a.valoracio.ressenyes },
    places: { text: "Ordenades per nombre de places.", f: (a, b) => b.capacitat - a.capacitat || pp(a, 6) - pp(b, 6) },
    bcn: { text: "Ordenades pel temps en cotxe des de Barcelona.", f: (a, b) => a.tempsBCN.minuts - b.tempsBCN.minuts },
  };

  function instalacionsHTML(c) {
    const k = c.caracteristiques;
    const r = [];
    if (k.llar === true) r.push(`<li>${esc(c.llarText || INSTAL.llar)}</li>`);
    if (k.llar === false) r.push(`<li class="no">${esc(c.llarText || "Estufa no utilitzable")}</li>`);
    if (k.jardi) r.push(`<li>${INSTAL.jardi}</li>`);
    if (k.wifi === true) r.push(`<li>${INSTAL.wifi}</li>`);
    if (k.wifi === false) r.push(`<li class="no">Sense Wi-Fi</li>`);
    if (k.barbacoa) r.push(`<li>${INSTAL.barbacoa}</li>`);
    if (k.aparcament) r.push(`<li>${INSTAL.aparcament}</li>`);
    if (k.roba) r.push(`<li>${INSTAL.roba}</li>`);
    if (k.mascotes) r.push(`<li>${INSTAL.mascotes}</li>`);
    return r.slice(0, 4).join("");
  }

  function targeta(c, distintiu) {
    const p7 = pp(c, 7);
    const comparant = estat.comparar.includes(c.id);
    const atencio = avisosImportants(c);
    return `<article class="casa" id="casa-${c.id}" aria-labelledby="nom-casa-${c.id}">
      <div class="casa__foto">${carrusel(c, "llistat")}
        ${c.capacitat < 7 ? `<span class="casa__max6">Màxim 6 persones</span>` : ""}
        ${distintiu ? `<span class="casa__distintiu">${distintiu}</span>` : ""}
      </div>
      <div class="casa__valoracio"><span aria-hidden="true">★</span><b>${valoracioText(c.valoracio)}</b><small>a ${plataformaNota(c.valoracio)} (${c.valoracio.ressenyes} ${c.valoracio.ressenyes === 1 ? "ressenya" : "ressenyes"})</small></div>
      <div class="casa__franja">${disc(c, true)}<span>${esc(c.municipi)}, ${esc(c.comarca)}</span><a href="mapa.html#casa-${c.id}">Mapa<span class="sr"> de ${esc(c.nom)}</span></a></div>
      <div class="casa__cos">
        <p class="casa__meta">${c.capacitat} places, ${c.dormitoris}${c.dormitorisAvis ? "*" : ""} dormitoris, ${esc(c.banysText)} ${c.banysText === "1" ? "bany" : "banys"}${c.superficie ? `, ${c.superficie} m²` : ""}<br>${fmtTemps(c.tempsBCN.minuts)} des de Barcelona</p>
        <h3 class="casa__nom" id="nom-casa-${c.id}">${esc(c.nom)}</h3>
        <div class="preus">
          <div class="preus__6">${eur(pp(c, 6))}<small>/per persona amb 6</small></div>
          ${p7 == null ? `<div class="preus__no7">No apta per a 7 persones</div>` : `<div class="preus__7">${eur(p7)}<small>/per persona amb 7</small></div>`}
          <div class="preus__total">Total: ${eur(total(c, 6), 0)} amb 6${total(c, 7) != null ? `, ${eur(total(c, 7), 0)} amb 7` : ""}. Confirmar què inclou el preu.</div>
        </div>
        ${atencio.length ? `<p class="atencio"><strong>Atenció:</strong> ${esc(atencio[0])}</p>` : ""}
        <ul class="checks" aria-label="Equipament destacat">${instalacionsHTML(c)}</ul>
        <div class="casa__accions">
          <button type="button" class="boto boto--pill" data-comparar="${c.id}" aria-pressed="${comparant}">${comparant ? "✓ Comparant" : "+ Comparar"}<span class="sr"> ${esc(c.nom)}</span></button>
          <a class="boto boto--text" href="${esc(c.url)}" target="_blank" rel="noopener">Veure l'anunci<span class="sr"> de ${esc(c.nom)} (s'obre en una pestanya nova)</span></a>
          <button type="button" class="boto boto--text" data-descartar="${c.id}">Descartar<span class="sr"> ${esc(c.nom)}</span></button>
        </div>
      </div>
      <button type="button" class="casa__detalls" data-detalls="${c.id}" aria-haspopup="dialog"><span class="caixa-mes" aria-hidden="true"></span>Veure detalls<span class="sr"> de ${esc(c.nom)}</span></button>
    </article>`;
  }

  function pintaCases() {
    const f = filtres();
    const llista = visibles().filter((c) => {
      if (f.zona && c.zona !== f.zona) return false;
      if (f.places && c.capacitat < f.places) return false;
      if (f.dormitoris && c.dormitoris < f.dormitoris) return false;
      if (f.banys && c.banys < f.banys) return false;
      if (!f.preuAlMax && pp(c, 6) > f.preu) return false;
      if (f.c.some((k) => c.caracteristiques[k] !== true)) return false;
      if (f.apta7 && !apta7(c)) return false;
      if (f.dates && !c.compatibleDates) return false;
      return true;
    }).sort(ORDRES[estat.ordreCases].f);

    const d = distintius();
    $("#llista-cases").innerHTML = llista.map((c) => targeta(c, d[c.id])).join("");
    $("#buit-cases").hidden = llista.length > 0;
    $("#cases-subtitol").textContent = ORDRES[estat.ordreCases].text;
    $("#f-preu-valor").textContent = f.preuAlMax ? "sense límit" : eur(f.preu, 0);
    $("#f-preu").setAttribute("aria-valuetext", f.preuAlMax ? "sense límit" : eur(f.preu, 0));

    const actius = [f.zona, f.places, f.dormitoris, f.banys, !f.preuAlMax, f.apta7, f.dates].filter(Boolean).length + f.c.length;
    $("#filtres-actius").textContent = actius ? `(${actius} ${actius === 1 ? "actiu" : "actius"}, ${llista.length} de ${visibles().length} cases)` : "";
  }

  function pintaDescartades() {
    const ids = [...estat.descartades];
    const det = $("#descartades");
    det.hidden = ids.length === 0;
    $("#descartades-titol").textContent = `Cases descartades (${ids.length})`;
    $("#llista-descartades").innerHTML = ids.map((id) => {
      const c = casa(id);
      return `<li>${disc(c)}<span>${esc(c.nom)}</span><button type="button" class="boto" data-recuperar="${id}">Recuperar</button></li>`;
    }).join("");
  }

  /* ---------- Comparador ---------- */
  function llegeixHash() {
    const m = location.hash.match(/^#comparar=([\d-]+)$/);
    if (!m) return;
    const ids = [...new Set(m[1].split("-").map(Number))].filter((id) => casa(id) && !estat.descartades.has(id)).slice(0, 3);
    estat.comparar = ids;
    desaComparar();
  }

  // L'enllaç amb #comparar=... només es manté a la pàgina del comparador (per compartir-lo).
  function escriuHash() {
    desaComparar();
    if (PAGINA !== "comparar") return;
    const base = location.pathname + location.search;
    if (estat.comparar.length >= 2) history.replaceState(null, "", `${base}#comparar=${estat.comparar.join("-")}`);
    else if (/^#comparar=/.test(location.hash)) history.replaceState(null, "", base);
  }

  const NO_TE = { roba: "Roba de llit no inclosa", mascotes: "No admet mascotes", wifi: "Sense Wi-Fi" };

  function diferencies(cs) {
    const etiquetes = { jardi: "Jardí", barbacoa: "Barbacoa", llar: "Estufa o llar que funciona", wifi: "Wi-Fi", mascotes: "Admet mascotes", aparcament: "Aparcament", roba: "Roba de llit inclosa" };
    return cs.map((c) => {
      const altres = cs.filter((x) => x !== c);
      const mes = [], menys = [];
      Object.keys(etiquetes).forEach((k) => {
        const v = c.caracteristiques[k];
        if (v === true && altres.every((a) => a.caracteristiques[k] !== true)) mes.push(etiquetes[k]);
        if (v === false && altres.some((a) => a.caracteristiques[k] === true)) menys.push(NO_TE[k] || (k === "llar" && c.llarText) || `Sense ${etiquetes[k].toLowerCase()}`);
      });
      if (apta7(c) && altres.some((a) => !apta7(a))) mes.push("Admet 7 persones");
      if (!apta7(c) && altres.some(apta7)) menys.push("Màxim 6 persones");
      if (c.preus["7"] != null && c.preus["7"] === c.preus["6"]) mes.push("Mateix preu amb 6 que amb 7");
      if (c.superficie && altres.every((a) => a.superficie == null || a.superficie < c.superficie)) mes.push(`La més gran de les ${cs.length} (${c.superficie} m²)`);
      if (c.banys > Math.max(...altres.map((a) => a.banys))) mes.push(`Més banys (${c.banysText})`);
      if (c.tempsBCN.minuts < Math.min(...altres.map((a) => a.tempsBCN.minuts)) - 10) mes.push(`La més a prop de Barcelona (${fmtTemps(c.tempsBCN.minuts)})`);
      if (!c.compatibleDates) menys.push("Estada mínima de 5 nits");
      if (c.id === 2) menys.push("Neteja a càrrec dels hostes");
      if (c.id === 6) menys.push("Camí d'accés en mal estat");
      return { c, mes, menys };
    });
  }

  // Barra fixa a les pàgines on es trien cases: porta a la pàgina del comparador.
  function pintaBarraComparar() {
    const barra = $("#barra-comparar");
    if (!barra) return;
    const cs = estat.comparar.map(casa).filter(Boolean);
    barra.hidden = cs.length === 0;
    $("#barra-comparar-text").textContent = cs.length === 1
      ? `Has triat ${cs[0].nom}. Tria'n una altra per comparar.`
      : `${cs.length} cases triades per comparar.`;
    const a = $("a", barra);
    a.hidden = cs.length < 2;
    a.href = `comparar.html#comparar=${estat.comparar.join("-")}`;
  }

  function pintaComparador() {
    pintaBarraComparar();
    const cos = $("#comparador-cos");
    if (!cos) return;
    const cs = estat.comparar.map(casa).filter(Boolean);
    const triades = $("#comparador-triades");
    triades.innerHTML = cs.length
      ? cs.map((c) => `<span>${disc(c, true)}${esc(c.nom)}<button type="button" data-treure="${c.id}">Treure<span class="sr"> ${esc(c.nom)}</span></button></span>`).join("")
      : "";
    triades.hidden = cs.length === 0;

    if (cs.length < 2) {
      cos.innerHTML = `<p class="buit">${cs.length === 1 ? `Has triat ${esc(cs[0].nom)}. ` : ""}Tria 2 o 3 cases amb el botó «+ Comparar» de la pàgina <a href="cases.html">Cases</a>.</p>`;
      return;
    }

    const files = [
      { l: "Amb 7, per persona", get: (c) => pp(c, 7), fmt: (v) => eur(v), menor: true, buit: "No apta per a 7" },
      { l: "Des de Barcelona", get: (c) => c.tempsBCN.minuts, fmt: (v) => fmtTemps(v), menor: true },
      { l: "Places", get: (c) => c.capacitat, fmt: (v) => v },
      { l: "Banys", get: (c) => c.banys, fmt: (v, c) => c.banysText },
      { l: "Superfície", get: (c) => c.superficie, fmt: (v) => `${v} m²`, buit: "Per confirmar" },
      { l: "Valoració sobre 10", get: (c) => nota10(c), fmt: (v, c) => `${num(v, 1)} (${c.valoracio.ressenyes} ress.)`, opta: notaFiable },
    ];
    const millor6 = minim(cs, (c) => pp(c, 6));

    const plans = cs.map((c) => {
      const filesHTML = files.map((f) => {
        const v = f.get(c);
        if (v == null) return `<div class="pla__fila pla__fila--pend"><div class="pla__fila-l"><span>${f.l}</span><b>${f.buit}</b></div></div>`;
        const base = cs.filter((x) => f.get(x) != null && (!f.opta || f.opta(x)));
        const vals = base.map(f.get);
        const millor = vals.length > 1 ? (f.menor ? Math.min(...vals) : Math.max(...vals)) : null;
        const tots = cs.map(f.get).filter((x) => x != null);
        const ample = f.menor ? (Math.min(...tots) / v) * 100 : (v / Math.max(...tots)) * 100;
        const guanya = millor != null && v === millor && (!f.opta || f.opta(c));
        return `<div class="pla__fila"><div class="pla__fila-l"><span>${f.l}</span><b>${f.fmt(v, c)}${guanya ? '<span class="marca-millor">Millor</span>' : ""}</b></div>
          <div class="barra" aria-hidden="true"><i style="width:${Math.max(4, Math.min(100, ample)).toFixed(1)}%"></i></div></div>`;
      }).join("");
      return `<article class="pla" aria-labelledby="pla-${c.id}">
        <div class="pla__cos zona-${c.zona}">
          <div class="pla__cap"><span class="disc">${c.id}</span>${pp(c, 6) === millor6 ? '<span class="pla__millor">Millor preu amb 6</span>' : ""}</div>
          <h3 class="pla__nom" id="pla-${c.id}">${esc(c.nom)}</h3>
          <p class="pla__lloc">${esc(c.municipi)}, zona ${c.zona}</p>
          <p class="pla__amb">Amb 6 persones</p>
          <p class="pla__preu">${eur(pp(c, 6))}</p>
          <p class="pla__unitat">per persona</p>
          ${filesHTML}
        </div>
        <a class="pla__peu zona-${c.zona}-fosc" href="${esc(c.url)}" target="_blank" rel="noopener">Veure l'anunci<span class="sr"> de ${esc(c.nom)} (s'obre en una pestanya nova)</span></a>
      </article>`;
    }).join("");

    const difs = diferencies(cs).map(({ c, mes, menys }) => `<div>
        <h4>${disc(c, true)}${esc(c.nom)}</h4>
        <ul>${mes.map((x) => `<li>${esc(x)}</li>`).join("")}${menys.map((x) => `<li class="menys"><span class="sr">Desavantatge: </span>${esc(x)}</li>`).join("")}
        ${mes.length + menys.length === 0 ? "<li>Sense diferències destacades amb les dades confirmades</li>" : ""}</ul></div>`).join("");

    cos.innerHTML = `<div class="plans" style="--columnes:${cs.length}">${plans}</div>
      <div class="diferencies" style="--columnes:${cs.length}"><h3>Diferències clau</h3>${difs}</div>`;
  }

  function commutaComparar(id) {
    const i = estat.comparar.indexOf(id);
    if (i >= 0) estat.comparar.splice(i, 1);
    else {
      if (estat.comparar.length >= 3) { avisa("Pots comparar 3 cases com a màxim. Treu-ne una abans."); return; }
      estat.comparar.push(id);
    }
    escriuHash();
    pintaComparador();
    $$(`[data-comparar]`).forEach((b) => {
      const on = estat.comparar.includes(Number(b.dataset.comparar));
      b.setAttribute("aria-pressed", String(on));
      b.firstChild.textContent = on ? "✓ Comparant" : "+ Comparar";
    });
  }

  /* ---------- Descartar ---------- */
  function descarta(id) {
    estat.descartades.add(id);
    estat.comparar = estat.comparar.filter((x) => x !== id);
    desaDescartades();
    escriuHash();
    actualitzaLlistes();
    avisa(`${casa(id).nom} descartada. La pots recuperar al final del llistat.`);
  }
  function recupera(id) {
    estat.descartades.delete(id);
    desaDescartades();
    actualitzaLlistes();
  }

  /* ---------- Mapa ---------- */
  let mapa = null;
  const marcadors = new Map();
  const marcadorsAct = new Map();
  let capaAct = null;
  const VORA = { A: "#3F7FB5", B: "#B07535", C: "#2F9C88", D: "#5F9A2A" };
  const PASTEL = { A: "#B4DBFA", B: "#FFD6A8", C: "#95EEDD", D: "#C9F296" };

  function popupCasa(c) {
    const p7 = pp(c, 7);
    return `<div class="popup__nom">Casa ${c.id}: ${esc(c.nom)}</div>
      <div class="popup__lloc">${esc(c.municipi)}, zona ${c.zona}</div>
      <div class="popup__nota">${c.coords.precisa ? "Ubicació exacta (adreça de Booking)" : "Ubicació aproximada"}</div>
      <div class="popup__preu">${eur(pp(c, 6))}</div><div>per persona amb 6</div>
      <div>${p7 == null ? "Màxim 6 persones" : `<b>${eur(p7)}</b> per persona amb 7`}</div>
      <div class="popup__nota">${fmtTemps(c.tempsBCN.minuts)} des de Barcelona</div>
      <p><a href="cases.html#casa-${c.id}" data-anar-casa="${c.id}">Veure la fitxa</a></p>`;
  }

  function iniciaMapa() {
    if (typeof L === "undefined") {
      $("#mapa-leaflet").innerHTML = `<p class="buit">No s'ha pogut carregar el mapa. Comprova la connexió i torna a carregar la pàgina.</p>`;
      return;
    }
    const tactil = matchMedia("(pointer: coarse)").matches;
    mapa = L.map("mapa-leaflet", { scrollWheelZoom: false, dragging: !tactil });
    // Mapa estàndard d'OpenStreetMap. Atenció: els servidors d'OSM bloquegen les peticions
    // sense Referer, és a dir, obrint index.html directament com a fitxer (file://).
    // Funciona publicat a GitHub Pages o amb un servidor local (python3 -m http.server).
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>',
    }).addTo(mapa);
    mapa.fitBounds(L.latLngBounds(CASES.map((c) => [c.coords.lat, c.coords.lon])).pad(0.08));
    mapa.on("focus", () => mapa.scrollWheelZoom.enable());
    mapa.on("blur", () => mapa.scrollWheelZoom.disable());
    if (tactil) {
      const b = $("#mapa-activar");
      b.hidden = false;
      b.addEventListener("click", () => { mapa.dragging.enable(); b.hidden = true; });
    }

    capaAct = L.layerGroup().addTo(mapa);
    ACTIVITATS.filter((a) => a.coords).forEach((a) => {
      const m = L.marker(a.coords, { title: `${a.nom} (${CATS[a.cat]})`, alt: a.nom, keyboard: false });
      m.bindPopup(() => `<div class="popup__nom">${esc(a.nom)}</div><div class="popup__lloc">${esc(CATS[a.cat])}, zona ${a.zona}</div><p>${esc(a.descripcio)}</p><div class="popup__nota">Desembre: ${esc(a.estat)}</div>`);
      marcadorsAct.set(a.id, { m, a });
    });
    refrescaActivitatsMapa();

    CASES.forEach((c) => {
      const pos = [c.coords.lat, c.coords.lon];
      if (!c.coords.precisa) {
        L.circle(pos, { radius: 1800, color: VORA[c.zona], weight: 1.5, fillColor: PASTEL[c.zona], fillOpacity: 0.45, interactive: false }).addTo(mapa);
      }
      const icona = L.divIcon({
        className: "",
        html: `<div class="marcador${c.coords.precisa ? " marcador--exacte" : ""}" style="background:${PASTEL[c.zona]}"><span>${c.id}</span></div>`,
        iconSize: [32, 32],
        iconAnchor: c.coords.precisa ? [16, 39] : [16, 16],
        popupAnchor: [0, -18],
      });
      const m = L.marker(pos, { icon: icona, title: `Casa ${c.id}: ${c.nom}`, alt: `Casa ${c.id}`, riseOnHover: true, zIndexOffset: 1000 }).addTo(mapa);
      m.bindPopup(() => popupCasa(c));
      marcadors.set(c.id, m);
    });

    mapa.on("popupopen", (e) => {
      const a = e.popup.getElement().querySelector("[data-anar-casa]");
      if (a) a.addEventListener("click", (ev) => { ev.preventDefault(); anarACasa(Number(a.dataset.anarCasa)); });
    });

    $("#m-activitats").addEventListener("change", refrescaActivitatsMapa);

    $("#mapa-llegenda").innerHTML = Object.entries(ZONES).map(([k, z]) =>
      `<span><span class="disc zona-${k}">${k}</span>${esc(z.nom)}</span>`).join("") +
      `<span><span class="marcador-act" style="background:#fff" aria-hidden="true"></span>Activitat</span>` +
      `<span>Cercle: ubicació aproximada. Gota: ubicació exacta.</span>`;
  }

  function refrescaActivitatsMapa() {
    if (!capaAct) return;
    capaAct.clearLayers();
    if (!$("#m-activitats").checked) return;
    marcadorsAct.forEach(({ m, a }) => {
      if (estat.catActivitat !== "totes" && a.cat !== estat.catActivitat) return;
      const dest = estat.zonaDestacada === a.zona;
      m.setIcon(L.divIcon({
        className: "",
        html: `<div class="marcador-act${dest ? " marcador-act--destacada" : ""}" style="background:${PASTEL[a.zona]}"></div>`,
        iconSize: dest ? [16, 16] : [12, 12],
      }));
      capaAct.addLayer(m);
    });
  }

  function pintaLlistaMapa() {
    const ord = [...CASES].sort((a, b) => pp(a, 6) - pp(b, 6));
    $("#mapa-llista").innerHTML = ord.map((c) => `<li><button type="button" data-centra="${c.id}">
        ${disc(c)}<span><b>${esc(c.nom)}</b><small>${esc(c.municipi)}, zona ${c.zona}</small></span>
        <span class="preu">${eur(pp(c, 6))}<small>${pp(c, 7) == null ? "Màxim 6" : `${eur(pp(c, 7))} amb 7`}</small></span></button></li>`).join("");
  }

  function centraCasa(id) {
    const c = casa(id);
    if (!c || !mapa) return;
    estat.zonaDestacada = c.zona;
    $("#m-activitats").checked = true;
    refrescaActivitatsMapa();
    $$("#mapa-llista [data-centra]").forEach((b) => b.setAttribute("aria-current", String(Number(b.dataset.centra) === id)));
    mapa.invalidateSize();
    mapa.setView([c.coords.lat, c.coords.lon], 12, { animate: !rmMotion() });
    marcadors.get(id).openPopup();
  }

  // Des de la pàgina de cases: desplaça fins a la targeta. Des d'altres pàgines: obre la fitxa
  // emergent si n'hi ha, o va a la pàgina de cases.
  function anarACasa(id) {
    if (PAGINA !== "cases") {
      if ($("#fitxa") && casa(id)) obreFitxa(id);
      else location.href = `cases.html#casa-${id}`;
      return;
    }
    let el = document.getElementById(`casa-${id}`);
    if (!el && estat.descartades.has(id)) { avisa("Aquesta casa està descartada. Recupera-la al final del llistat."); return; }
    if (!el) { $("#form-filtres").reset(); pintaCases(); el = document.getElementById(`casa-${id}`); }
    if (!el) return;
    el.scrollIntoView({ behavior: rmMotion() ? "auto" : "smooth", block: "start" });
    el.classList.add("casa--destacada");
    setTimeout(() => el.classList.remove("casa--destacada"), 2000);
    const h = el.querySelector("h3");
    if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
  }

  /* ---------- Activitats ---------- */
  function preparaActivitats() {
    const cats = [["totes", "Totes"], ...Object.entries(CATS)];
    $("#pestanyes").innerHTML = cats.map(([k, t]) => {
      const n = k === "totes" ? ACTIVITATS.length : ACTIVITATS.filter((a) => a.cat === k).length;
      const sel = k === estat.catActivitat;
      return `<button type="button" role="tab" id="tab-${k}" data-cat="${k}" aria-selected="${sel}" aria-controls="llista-activitats" tabindex="${sel ? 0 : -1}">${esc(t)} (${n})</button>`;
    }).join("");
    $("#pestanyes").addEventListener("click", (e) => { const b = e.target.closest("[data-cat]"); if (b) triaPestanya(b.dataset.cat); });
    $("#pestanyes").addEventListener("keydown", (e) => {
      const tecles = ["ArrowLeft", "ArrowRight", "Home", "End"];
      if (!tecles.includes(e.key)) return;
      const bs = $$("#pestanyes [data-cat]");
      let i = bs.findIndex((b) => b.dataset.cat === estat.catActivitat);
      if (e.key === "ArrowRight") i = (i + 1) % bs.length;
      if (e.key === "ArrowLeft") i = (i - 1 + bs.length) % bs.length;
      if (e.key === "Home") i = 0;
      if (e.key === "End") i = bs.length - 1;
      e.preventDefault();
      triaPestanya(bs[i].dataset.cat);
      bs[i].focus();
    });
    // Recorda quines zones estan obertes quan es canvia de pestanya.
    $("#llista-activitats").addEventListener("toggle", (e) => {
      const z = e.target.dataset && e.target.dataset.zonaAct;
      if (!z) return;
      if (e.target.open) estat.zonesObertes.add(z); else estat.zonesObertes.delete(z);
    }, true);
    $("#llista-fonts").innerHTML = Object.values(D.fonts).map((f) =>
      `<li><a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.text)}<span class="sr"> (s'obre en una pestanya nova)</span></a></li>`).join("");
  }

  function triaPestanya(cat) {
    estat.catActivitat = cat;
    $$("#pestanyes [data-cat]").forEach((b) => {
      const sel = b.dataset.cat === cat;
      b.setAttribute("aria-selected", String(sel));
      b.tabIndex = sel ? 0 : -1;
    });
    $("#llista-activitats").setAttribute("aria-labelledby", `tab-${cat}`);
    pintaActivitats();
    refrescaActivitatsMapa();
  }

  function pintaActivitats() {
    const llista = ACTIVITATS.filter((a) => estat.catActivitat === "totes" || a.cat === estat.catActivitat);
    $("#avis-muntanya").hidden = !llista.some((a) => a.muntanya || a.cat === "rutes");
    const html = Object.entries(ZONES).map(([k, z]) => {
      const acts = llista.filter((a) => a.zona === k);
      if (!acts.length) return "";
      const casesZona = CASES.filter((c) => c.zona === k).map((c) => `${c.id} (${c.nom})`).join(", ");
      const obert = estat.zonesObertes.has(k) ? " open" : "";
      return `<details class="zona-act" id="act-zona-${k}" data-zona-act="${k}"${obert}>
        <summary><span class="caixa-mes" aria-hidden="true"></span><span class="mostra zona-${k}" aria-hidden="true"></span>
          <h3>Zona ${k}: ${esc(z.nom)}</h3><span class="zona-act__compte">${acts.length} ${acts.length === 1 ? "activitat" : "activitats"}</span></summary>
        <p class="zona-act__cases">Cases d'aquesta zona: ${esc(casesZona)}</p>
        <ul class="act-llista">${acts.map((a) => {
          const font = D.fonts[a.font];
          return `<li class="act"><div><span class="act__nom">${esc(a.nom)}</span><span class="act__tipus">${esc(a.tipus)}</span></div>
            <div><span class="act__desc">${esc(a.descripcio)}</span><span class="act__estat">Desembre: ${esc(a.estat)}</span>
            ${font ? `<a class="act__font" href="${esc(font.url)}" target="_blank" rel="noopener">${esc(font.text)}<span class="sr"> (s'obre en una pestanya nova)</span></a>` : ""}</div></li>`;
        }).join("")}</ul></details>`;
    }).join("");
    $("#llista-activitats").innerHTML = html || `<p class="buit">No hi ha activitats d'aquest tipus.</p>`;
  }

  /* ---------- Què falta preguntar ---------- */
  function pintaPreguntes() {
    const n = visibles().length;
    $("#preguntes-compte").textContent = `${n} ${n === 1 ? "casa" : "cases"}`;
    $("#llista-preguntes").innerHTML = visibles().sort((a, b) => a.id - b.id).map((c) => `<article class="preg">
        <h3>${disc(c)}${esc(c.nom)}</h3>
        <ul class="preg__llista">${preguntes(c).map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
        <button type="button" class="boto" data-copiar-preguntes="${c.id}">Copiar les preguntes<span class="sr"> per a ${esc(c.nom)}</span></button>
      </article>`).join("");
  }

  /* ---------- Fotos: carrusel a la targeta i a la fitxa ---------- */
  const fotoActual = new Map(); // id de casa -> índex de la foto que es veu

  function carrusel(c, lloc) {
    const n = c.fotos.length;
    if (!n) return `<span class="casa__sense-foto">Foto de l'anunci pendent</span>`;
    const i = Math.min(fotoActual.get(c.id) || 0, n - 1);
    const fletxes = n > 1 ? `
      <button type="button" class="carrusel__fletxa carrusel__fletxa--ant" data-foto-pas="-1" aria-label="Foto anterior de ${esc(c.nom)}"><span aria-hidden="true">‹</span></button>
      <button type="button" class="carrusel__fletxa carrusel__fletxa--seg" data-foto-pas="1" aria-label="Foto següent de ${esc(c.nom)}"><span aria-hidden="true">›</span></button>
      <span class="carrusel__comptador" aria-live="polite">${i + 1} de ${n}</span>` : "";
    return `<div class="carrusel carrusel--${lloc}" data-carrusel="${c.id}">
      <img src="${esc(c.fotos[i])}" alt="${esc(`Foto ${i + 1} de ${n} de ${c.nom}`)}" ${lloc === "llistat" ? 'loading="lazy" width="640" height="400"' : 'width="900" height="560"'}>${fletxes}</div>`;
  }

  function mouFoto(id, nouIndex) {
    const c = casa(id);
    const n = c.fotos.length;
    if (!n) return;
    const i = ((nouIndex % n) + n) % n;
    fotoActual.set(id, i);
    $$(`[data-carrusel="${id}"]`).forEach((el) => {
      const img = el.querySelector("img");
      el.querySelectorAll(".casa__sense-foto").forEach((x) => x.remove());
      if (img) { img.hidden = false; img.src = c.fotos[i]; img.alt = `Foto ${i + 1} de ${n} de ${c.nom}`; }
      const comp = el.querySelector(".carrusel__comptador");
      if (comp) comp.textContent = `${i + 1} de ${n}`;
    });
    $$(`[data-foto-index]`).forEach((b) => b.setAttribute("aria-current", String(Number(b.dataset.fotoIndex) === i)));
  }

  function fitxaHTML(c) {
    const llistaLi = (a) => a.map((x) => `<li>${esc(x)}</li>`).join("");
    const p7 = pp(c, 7);
    const miniatures = c.fotos.length > 1
      ? `<div class="miniatures" role="group" aria-label="Fotos de ${esc(c.nom)}">${c.fotos.map((f, i) =>
          `<button type="button" data-foto-index="${i}" data-casa-foto="${c.id}" aria-label="Veure la foto ${i + 1}" aria-current="${i === (fotoActual.get(c.id) || 0)}"><img src="${esc(f)}" alt="" width="72" height="72" loading="lazy"></button>`).join("")}</div>`
      : "";
    return `<div class="fitxa__foto">${carrusel(c, "fitxa")}</div>${miniatures}
      <div class="fitxa__resum">
        <p class="casa__meta">${disc(c, true)} ${esc(c.municipi)}, ${esc(c.comarca)}. ${c.capacitat} places, ${c.dormitoris}${c.dormitorisAvis ? "*" : ""} dormitoris, ${esc(c.banysText)} ${c.banysText === "1" ? "bany" : "banys"}${c.superficie ? `, ${c.superficie} m²` : ""}.</p>
        <p class="fitxa__preus"><b>${eur(pp(c, 6))}</b> per persona amb 6. ${p7 == null ? "No apta per a 7 persones." : `<b>${eur(p7)}</b> per persona amb 7.`}</p>
      </div>
      <div class="fitxa__cos">
        <p>${esc(c.descripcio)}</p>
        ${c.dormitorisAvis ? `<p><strong>*</strong> ${esc(c.dormitorisAvis)}</p>` : ""}
        <h3>Distribució</h3><ul>${llistaLi(c.distribucio)}</ul>
        <h3>Equipament</h3><ul>${llistaLi(c.equipament)}</ul>
        <h3>Normes i condicions</h3><ul>${llistaLi(c.condicions)}</ul>
        <h3>Ubicació</h3>
        <p>${c.adreca ? esc(c.adreca) : `${esc(c.municipi)} (${esc(c.municipiOficial)}). Ubicació aproximada: l'adreça exacta no és pública.`} ${fmtTemps(c.tempsBCN.minuts)} des de Barcelona.</p>
        <h3>En resum</h3><p>${esc(c.perfil)}</p>
        <h3>Què falta preguntar</h3>
        <ul class="preg__llista">${llistaLi(preguntes(c))}</ul>
        <div class="fitxa__accions">
          <button type="button" class="boto" data-copiar-preguntes="${c.id}">Copiar les preguntes</button>
          <a class="boto boto--ple" href="${esc(c.url)}" target="_blank" rel="noopener">Veure l'anunci<span class="sr"> (s'obre en una pestanya nova)</span></a>
        </div>
      </div>`;
  }

  function obreFitxa(id) {
    const c = casa(id);
    const d = $("#fitxa");
    $("#fitxa-titol").textContent = c.nom;
    $("#fitxa-cos").innerHTML = fitxaHTML(c);
    d.dataset.casa = String(id);
    if (!d.open) { if (typeof d.showModal === "function") d.showModal(); else d.setAttribute("open", ""); }
    $("#fitxa-cos").scrollTop = 0;
  }

  function preparaFitxa() {
    const d = $("#fitxa");
    $("#fitxa-tancar").addEventListener("click", () => d.close());
    d.addEventListener("click", (e) => { if (e.target === d) d.close(); });
    d.addEventListener("keydown", (e) => {
      if (e.target.closest("input, select, textarea")) return;
      const id = Number(d.dataset.casa);
      if (e.key === "ArrowLeft") mouFoto(id, (fotoActual.get(id) || 0) - 1);
      if (e.key === "ArrowRight") mouFoto(id, (fotoActual.get(id) || 0) + 1);
    });
  }

  /* ---------- Esdeveniments globals ---------- */
  function preparaEsdeveniments() {
    document.addEventListener("click", async (e) => {
      const t = e.target.closest("[data-comparar],[data-descartar],[data-recuperar],[data-treure],[data-centra],[data-foto-pas],[data-foto-index],[data-detalls],[data-copiar-preguntes],[data-ordena],[data-ordre],[data-anar-casa]");
      if (!t) return;
      const d = t.dataset;
      if (d.comparar) commutaComparar(Number(d.comparar));
      else if (d.descartar) descarta(Number(d.descartar));
      else if (d.recuperar) recupera(Number(d.recuperar));
      else if (d.treure) commutaComparar(Number(d.treure));
      else if (d.centra) centraCasa(Number(d.centra));
      else if (d.fotoPas) { const id = Number(t.closest("[data-carrusel]").dataset.carrusel); mouFoto(id, (fotoActual.get(id) || 0) + Number(d.fotoPas)); }
      else if (d.fotoIndex) mouFoto(Number(d.casaFoto), Number(d.fotoIndex));
      else if (d.detalls) obreFitxa(Number(d.detalls));
      else if (d.copiarPreguntes) {
        const ok = await copia(missatgePreguntes(casa(Number(d.copiarPreguntes))));
        const original = t.firstChild.textContent;
        t.firstChild.textContent = ok ? "Preguntes copiades" : "No s'han pogut copiar";
        setTimeout(() => { t.firstChild.textContent = original; }, 2000);
      } else if (d.ordena) {
        const col = d.ordena;
        if (estat.resum.col === col) estat.resum.dir = estat.resum.dir === "asc" ? "desc" : "asc";
        else {
          const def = COLS.find((c) => c.key === col);
          estat.resum = { col, dir: def && (def.millor === "max" || def.bool) ? "desc" : "asc" };
        }
        pintaResum();
        const b = $(`[data-ordena="${col}"]`); if (b) b.focus();
      } else if (d.ordre) {
        estat.ordreCases = d.ordre;
        $$("#ordre-cases [data-ordre]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.ordre === d.ordre)));
        pintaCases();
      } else if (d.anarCasa) {
        e.preventDefault();
        anarACasa(Number(d.anarCasa));
      }
    });

    // Imatges que no carreguen: s'amaguen sense trencar la targeta.
    document.addEventListener("error", (e) => {
      const img = e.target;
      if (!(img instanceof HTMLImageElement)) return;
      const car = img.closest(".carrusel");
      if (car) { img.hidden = true; if (!car.querySelector(".casa__sense-foto")) car.insertAdjacentHTML("afterbegin", `<span class="casa__sense-foto">Foto no disponible</span>`); }
      else if (img.closest(".miniatures button, .peca")) (img.closest(".miniatures button") || img.closest(".peca")).hidden = true;
    }, true);

    // Navegació: fons sòlid quan surt de la capçalera; tanca el menú mòbil en triar.
    const nav = $(".nav-embolcall");
    const onScroll = () => nav.classList.toggle("enganxada", window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    $(".nav__mobil").addEventListener("click", (e) => { if (e.target.closest("a")) e.currentTarget.removeAttribute("open"); });

    window.addEventListener("hashchange", () => {
      if (PAGINA === "comparar" && /^#comparar=/.test(location.hash)) { llegeixHash(); pintaComparador(); }
      const m = location.hash.match(/^#casa-(\d+)$/);
      if (m && PAGINA === "cases") anarACasa(Number(m[1]));
      if (m && PAGINA === "mapa") centraCasa(Number(m[1]));
    });
  }

  // Cada funció comprova si la seva part existeix a la pàgina actual.
  function actualitzaLlistes() {
    if ($("#taula-resum")) pintaResum();
    if ($("#llista-cases")) pintaCases();
    if ($("#descartades")) pintaDescartades();
    pintaComparador();
    if ($("#llista-preguntes")) pintaPreguntes();
  }

  /* ---------- Inici ---------- */
  if (PAGINA === "comparar") { llegeixHash(); escriuHash(); }
  pintaNav();
  pintaCapcalera();
  if ($("#form-filtres")) preparaFiltres();
  if ($("#resum-grups")) preparaResumMobil();
  if ($("#fitxa")) preparaFitxa();
  if ($("#pestanyes")) preparaActivitats();
  preparaEsdeveniments();
  actualitzaLlistes();
  if ($("#llista-activitats")) pintaActivitats();
  if ($("#mapa-leaflet")) { pintaLlistaMapa(); iniciaMapa(); }

  // Enllaços d'una altra pàgina a una casa concreta (cases.html#casa-5, mapa.html#casa-5).
  const casaHash = location.hash.match(/^#casa-(\d+)$/);
  if (casaHash) {
    const id = Number(casaHash[1]);
    if (PAGINA === "cases") setTimeout(() => anarACasa(id), 0);
    if (PAGINA === "mapa") setTimeout(() => centraCasa(id), 0);
  }

  // Mòduls opcionals: només s'executen amb l'interruptor actiu i a la seva pàgina.
  if (D.config.meteoActiva === true && window.Meteo && $("#meteo")) window.Meteo.inicialitzar(DADES_WEB);
  if (D.config.votacioActiva === true && window.Votacio && $("#votacio")) window.Votacio.inicialitzar(DADES_WEB);
  else if ($("#votacio-no-connectada")) $("#votacio-no-connectada").hidden = false;
})();
