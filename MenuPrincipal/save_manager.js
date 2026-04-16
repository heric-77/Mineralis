/**
 * SaveManager — Mineralis
 * Gerencia progresso de fases no localStorage.
 *
 * Chave única: 'mineralis_save_v2'
 * Estrutura:
 * {
 *   versao: 1,
 *   iniciado: true,
 *   fases: {
 *     '1.1': { desbloqueada: true,  estrelas: 3 },
 *     '1.2': { desbloqueada: false, estrelas: 0 },
 *     ...
 *   },
 *   coletados: { 'prata': true, ... }
 * }
 *
 * Regras de progressão:
 *   Fase 1.1 → desbloqueia 1.2
 *   Fase 1.2 → desbloqueia 1.3
 *   Fase 1.3 → desbloqueia 2.1  (início do próximo continente)
 *   (e assim por diante)
 */

const SAVE_KEY = 'mineralis_save_v2';

// Mapa: ao concluir a fase X, desbloqueia a fase Y
const PROXIMA_FASE = {
  '1.1': '1.2',
  '1.2': '1.3',
  '1.3': '2.1',
  '2.1': '2.2',
  '2.2': '2.3',
  '2.3': '3.1',
  '3.1': '3.2',
  '3.2': '3.3',
  '3.3': '4.1',
  '4.1': '4.2',
  '4.2': '4.3',
  '4.3': '5.1',
  '5.1': '5.2',
  '5.2': '5.3',
  '5.3': '6.1',
  '6.1': '6.2',
  '6.2': '6.3',
  // 6.3 é a última fase — sem próxima
};

const SaveManager = (() => {

  // ── Leitura ────────────────────────────────────────────────────

  function _carregar() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return _salveInicial();
      const save = JSON.parse(raw);
      if (!save.fases)     save.fases     = {};
      if (!save.coletados) save.coletados  = {};
      return save;
    } catch (e) {
      return _salveInicial();
    }
  }

  function _salveInicial() {
    const save = { versao: 1, iniciado: true, fases: {}, coletados: {} };
    // Fase 1.1 sempre começa desbloqueada
    save.fases['1.1'] = { desbloqueada: true, estrelas: 0 };
    _persistir(save);
    return save;
  }

  function _persistir(save) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    } catch (e) {
      console.warn('[SaveManager] Erro ao persistir save:', e);
    }
  }

  // ── API pública ────────────────────────────────────────────────

  /**
   * Retorna true se a fase está desbloqueada.
   * A fase 1.1 é sempre desbloqueada por padrão.
   */
  function faseDesbloqueada(id) {
    if (id === '1.1') return true;
    const save = _carregar();
    return !!(save.fases[id]?.desbloqueada);
  }

  /**
   * Retorna o número de estrelas da fase (0–4).
   */
  function faseEstrelas(id) {
    const save = _carregar();
    return save.fases[id]?.estrelas || 0;
  }

  /**
   * Registra conclusão de uma fase:
   * - Salva estrelas obtidas (guarda o máximo histórico)
   * - Desbloqueia a próxima fase no mapa de progressão
   *
   * @param {string} faseId   - ex: '1.1'
   * @param {number} score    - pontuação final do player
   * @param {number} deaths   - número de mortes
   * @returns {string|null}   - id da fase desbloqueada, ou null se não há próxima
   */
  function concluirFase(faseId, score, deaths) {
    const estrelas = deaths === 0 ? 4
                   : deaths <= 2  ? 3
                   : deaths <= 5  ? 2 : 1;

    const save = _carregar();
    if (!save.fases[faseId]) save.fases[faseId] = { desbloqueada: true, estrelas: 0 };

    // Marca fase atual como concluída
    save.fases[faseId].desbloqueada = true;
    save.fases[faseId].estrelas     = Math.max(save.fases[faseId].estrelas || 0, estrelas);

    // Desbloqueia próxima fase
    const proxima = PROXIMA_FASE[faseId] || null;
    if (proxima) {
      if (!save.fases[proxima]) save.fases[proxima] = { desbloqueada: false, estrelas: 0 };
      save.fases[proxima].desbloqueada = true;
      console.info(`[SaveManager] Fase "${proxima}" desbloqueada!`);
    }

    _persistir(save);
    console.info(`[SaveManager] Fase "${faseId}" concluída — ⭐ ${estrelas}`);
    return proxima;
  }

  /**
   * Registra item coletado no diário.
   */
  function registrarColetado(id) {
    if (!id) return;
    const save = _carregar();
    if (!save.coletados)    save.coletados = {};
    if (!save.coletados[id]) {
      save.coletados[id] = true;
      _persistir(save);
    }
  }

  /**
   * Retorna todos os ids de itens já coletados.
   */
  function coletados() {
    return _carregar().coletados || {};
  }

  /**
   * Limpa todo o progresso (usado na tela de início de sessão).
   */
  function resetar() {
    localStorage.removeItem(SAVE_KEY);
    console.info('[SaveManager] Save resetado.');
  }

  return { faseDesbloqueada, faseEstrelas, concluirFase, registrarColetado, coletados, resetar };

})();
