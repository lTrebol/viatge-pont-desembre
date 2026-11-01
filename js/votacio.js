/*
 * MÒDUL DE VOTACIÓ — DESACTIVAT
 * -------------------------------------------------------------
 * La web és estàtica (GitHub Pages) i no desa dades compartides.
 * Aquest mòdul només s'inicialitza si DADES.config.votacioActiva === true.
 * Amb false, cap d'aquestes funcions s'executa i no es fa cap petició externa.
 *
 * Per activar-la en el futur:
 *  1. Crear un projecte gratuït a Supabase (o Firebase).
 *  2. Taula "vots": participant (text, únic), casa_id (int), actualitzat (timestamp).
 *  3. Activar Row Level Security: la clau pública és visible al codi, així que
 *     les regles han d'impedir esborrar o falsejar vots d'altres participants
 *     (p. ex. un codi secret per persona validat per una funció del servidor).
 *  4. Omplir PARTICIPANTS amb una llista tancada de noms o codis.
 *  5. Implementar les funcions de sota i posar config.votacioActiva = true a js/dades.js.
 *
 * No s'ha d'utilitzar localStorage per simular vots ni mostrar resultats ficticis.
 */

window.Votacio = (function () {
  // const SUPABASE_URL = "";
  // const SUPABASE_CLAU_PUBLICA = "";
  // const PARTICIPANTS = [];

  async function carregarVots() {
    // TODO: llegir els vots del servei i retornar [{ participant, casaId }].
    return [];
  }

  async function enviarVot(participant, casaId) {
    // TODO: desar (o actualitzar) el vot del participant al servei.
  }

  function mostrarResultats(vots, cases) {
    // TODO: pintar #votacio-resultats amb el nombre de vots i el percentatge per casa,
    // i #votacio-meu-vot amb el vot del participant actual.
  }

  async function inicialitzar(dades) {
    const seccio = document.getElementById("votacio");
    seccio.hidden = false;
    // TODO: omplir #votacio-cases amb un botó «Vota» per casa, connectar enviarVot()
    // i refrescar amb carregarVots() + mostrarResultats().
  }

  return { inicialitzar, carregarVots, enviarVot, mostrarResultats };
})();
