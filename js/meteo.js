/*
 * MÒDUL DEL TEMPS (pàgina temps.html) — DESACTIVAT FINS A FINALS DE NOVEMBRE
 * -------------------------------------------------------------
 * Només s'executa si DADES.config.meteoActiva === true (vegeu js/dades.js).
 * Amb false, la pàgina no surt al menú, mostra un avís i no es fa cap petició.
 * Només es consulten les zones que tenen alguna casa visible a la web.
 *
 * Font: Open-Meteo (https://open-meteo.com), gratuït i sense clau.
 * La previsió arriba a uns 16 dies vista: activeu-la a partir del 20 de novembre de 2026.
 */

window.Meteo = (function () {
  // Punt representatiu de cada zona (centre del poble de referència).
  const PUNTS = {
    A: { nom: "Font-Romeu", lat: 42.4966, lon: 2.0417 },
    B: { nom: "Prats de Molló", lat: 42.4026, lon: 2.4814 },
    C: { nom: "el Voló", lat: 42.5255, lon: 2.8336 },
    D: { nom: "Vilafranca de Conflent", lat: 42.5873, lon: 2.3673 },
  };

  const DIES = ["dg.", "dl.", "dt.", "dc.", "dj.", "dv.", "ds."];
  const fmt = (v, d = 0) => new Intl.NumberFormat("ca-ES", { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);

  async function carregarPrevisio(punt, inici, fi) {
    const url = "https://api.open-meteo.com/v1/forecast"
      + `?latitude=${punt.lat}&longitude=${punt.lon}`
      + "&daily=temperature_2m_min,temperature_2m_max,precipitation_sum,snowfall_sum"
      + `&timezone=Europe%2FParis&start_date=${inici}&end_date=${fi}`;
    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error(`Open-Meteo ha respost ${resposta.status}`);
    return (await resposta.json()).daily;
  }

  function pintarZona(zona, dadesZona, punt, dies) {
    const files = dies.time.map((data, i) => {
      const d = new Date(data + "T12:00:00");
      const neu = dies.snowfall_sum[i] > 0 ? `, neu ${fmt(dies.snowfall_sum[i], 1)} cm` : "";
      return `<div class="meteo__dia"><span>${DIES[d.getDay()]} ${d.getDate()}</span>
        <span>${fmt(dies.temperature_2m_min[i])}° / ${fmt(dies.temperature_2m_max[i])}°, ${fmt(dies.precipitation_sum[i], 1)} mm${neu}</span></div>`;
    }).join("");
    return `<article class="meteo__zona zona-${zona}"><h3>Zona ${zona}</h3><p>${dadesZona.nom} (${punt.nom})</p>${files}</article>`;
  }

  async function inicialitzar(dades) {
    const seccio = document.getElementById("meteo");
    const cont = document.getElementById("meteo-zones");
    seccio.hidden = false;
    const avis = document.getElementById("meteo-desactivada");
    if (avis) avis.hidden = true;
    const { arribada, sortida } = dades.viatge;
    try {
      const resultats = await Promise.all(Object.entries(PUNTS).filter(([z]) => dades.zones[z]).map(async ([z, p]) => [z, p, await carregarPrevisio(p, arribada, sortida)]));
      cont.innerHTML = resultats.map(([z, p, d]) => pintarZona(z, dades.zones[z], p, d)).join("");
      const ara = new Date().toLocaleString("ca-ES", { dateStyle: "long", timeStyle: "short" });
      document.getElementById("meteo-font").textContent = `Previsió d'Open-Meteo, actualitzada el ${ara}. Mínima i màxima, pluja i neu prevista.`;
    } catch (e) {
      cont.innerHTML = `<p class="buit">No s'ha pogut carregar la previsió (${e.message}). Torna-ho a provar més tard.</p>`;
    }
  }

  return { inicialitzar, carregarPrevisio, PUNTS };
})();
