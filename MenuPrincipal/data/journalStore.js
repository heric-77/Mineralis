// ═══════════════════════════════════════════════════════════════════
// journalStore.js — Fonte ÚNICA de verdade para o Diário de Bordo.
//
// Antes desta versão, cada uma das 16 fases tinha sua própria função
// local de persistência (journalCollect/_journalColetar) e sua própria
// lógica de mesclagem com o catálogo global (allItemDefs.js). Isso
// causava divergências constantes: uma fase gravava a descoberta sob
// uma chave diferente da que o catálogo esperava, e o item ficava
// invisível para sempre no Diário das fases seguintes.
//
// A partir de agora, TODA fase deve:
//   1. Incluir <script src=".../data/allItemDefs.js"></script>
//   2. Incluir <script src=".../data/journalStore.js"></script>
//   3. Chamar window.JournalStore.collect(idCanonico) ao coletar um
//      item — o idCanonico é a chave usada em window.ALL_ITEM_DEFS.
//   4. Usar window.JournalStore.list(categoria, player.items) para
//      montar a lista exibida no Diário daquela fase.
//
// Isso não substitui os ids internos de jogabilidade de cada fase
// (os usados em player.items, ativação de ferramenta, gates de
// conclusão etc.) — cada fase continua livre para usar seus próprios
// ids internos, e só precisa de uma pequena tabela de alias local
// (ex.: { tupu_prata:'mapa_potosi' }) na hora de chamar collect().
// ═══════════════════════════════════════════════════════════════════
window.JournalStore = (() => {

  const SAVE_KEY = 'mineralis_save_v2';

  function _read() {
    try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || {}; }
    catch { return {}; }
  }

  function _write(save) {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); }
    catch { console.warn('[JournalStore] Não foi possível gravar no localStorage.'); }
  }

  function _defOf(id) {
    return (window.ALL_ITEM_DEFS || {})[id];
  }

  /**
   * Registra a descoberta de um item pelo id CANÔNICO do catálogo
   * (window.ALL_ITEM_DEFS). Para itens com cat:'minerio' e
   * multiple:true, incrementa a contagem; para os demais, marca
   * apenas como coletado (true).
   *
   * @param {string} id     id canônico (deve existir em ALL_ITEM_DEFS)
   * @param {object} [opts] { count } — força uma contagem específica
   *                        em vez de incrementar de 1 em 1.
   */
  function collect(id, opts = {}) {
    const def = _defOf(id);
    if (!def) {
      console.warn(`[JournalStore] id desconhecido no catálogo global: "${id}". Verifique allItemDefs.js ou a tabela de alias da fase.`);
    }
    const save = _read();
    if (!save.coletados) save.coletados = {};

    if (def && def.multiple) {
      const atual = typeof save.coletados[id] === 'number' ? save.coletados[id] : (save.coletados[id] ? 1 : 0);
      const novo  = opts.count != null ? opts.count : atual + 1;
      save.coletados[id] = Math.max(atual, novo);
    } else {
      save.coletados[id] = true;
    }
    _write(save);
  }

  function isCollected(id) {
    const save = _read();
    return !!(save.coletados && save.coletados[id]);
  }

  function getCount(id) {
    const save = _read();
    const v = save.coletados && save.coletados[id];
    return typeof v === 'number' ? v : (v ? 1 : 0);
  }

  function getAllCollected() {
    const save = _read();
    return save.coletados || {};
  }

  /**
   * Lista os itens de uma categoria ('ferramenta' | 'minerio' | 'artefato')
   * já coletados, cruzando o catálogo global com o save persistido.
   *
   * @param {string} cat         categoria a filtrar
   * @param {string[]} [sessionIds] ids canônicos coletados NESTA sessão de
   *   jogo mas que ainda podem não ter sido persistidos via collect()
   *   (normalmente basta chamar collect() no momento da coleta e não
   *   precisar passar isso — é só uma rede de segurança para feedback
   *   visual imediato).
   */
  function list(cat, sessionIds = []) {
    const coletados = getAllCollected();
    const defs = window.ALL_ITEM_DEFS || {};
    const out = [];
    for (const [id, def] of Object.entries(defs)) {
      if (def.cat !== cat) continue;
      const emSessao = sessionIds.includes(id);
      if (def.multiple) {
        const count = Math.max(getCount(id), emSessao ? 1 : 0);
        if (count > 0) out.push({ id, ...def, count });
      } else if (coletados[id] || emSessao) {
        out.push({ id, ...def, count: 1 });
      }
    }
    return out;
  }

  return {
    SAVE_KEY,
    collect,
    isCollected,
    getCount,
    getAllCollected,
    list,
  };

})();
