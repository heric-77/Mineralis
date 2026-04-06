/* ═══════════════════════════════════════════════
   MINERALIS – main.js
   Ponto de entrada do jogo.
   Responsabilidade: inicializar componentes e
   efeitos visuais globais (partículas, tooltip).
   Lógica de menu  → components/menu.js
   Dados das fases → data/phases.js
   ═══════════════════════════════════════════════ */

// ── Referências globais ──
const frame   = document.getElementById('frame');
const tooltip = document.getElementById('tooltip');

// ════════════════════════════════
// CARDS
// Renderiza e sincroniza todos os cards do mapa.
// ════════════════════════════════

const Cards = (() => {

  /**
   * Cria todos os cards no mapa dinamicamente a partir de PhasesData + CardsSVG.
   * Os 3 cards da América do Sul já estão no HTML — os demais são gerados aqui.
   */
  function renderizar() {
    const mapaEl = document.getElementById('frame');

    // IDs já presentes no HTML (América do Sul)
    const existentes = new Set(['1.1','1.2','1.3']);

    PhasesData.forEach(fase => {
      if (existentes.has(fase.id)) return; // já no HTML
      if (!CardsSVG[fase.id])      return; // SVG não definido

      const card = document.createElement('div');
      card.className        = 'phase-card locked';
      card.dataset.phase    = fase.id;
      card.dataset.tip      = '🔒 ' + fase.nome;
      card.style.top        = fase.mapPos.top;
      card.style.left       = fase.mapPos.left;
      card.innerHTML        = `<div class="card-icon">${CardsSVG[fase.id]}</div>`;
      card.addEventListener('click', () => selectCard(card));

      mapaEl.appendChild(card);
    });
  }

  /**
   * Sincroniza estado visual (locked/unlocked + tooltip) de todos os cards.
   */
  function sincronizar() {
    document.querySelectorAll('.phase-card').forEach(card => {
      const id   = card.dataset.phase;
      const fase = PhasesData.find(p => p.id === id);
      if (!fase) return;

      const desbloqueada = SaveManager.faseDesbloqueada(id);

      if (desbloqueada) {
        card.classList.remove('locked');
        card.dataset.tip = fase.nome;
      } else {
        card.classList.add('locked');
        card.dataset.tip = id === '1.1' && !SaveManager.jogoIniciado()
          ? '🔒 Inicie uma Nova Jornada para explorar'
          : '🔒 ' + fase.nome;
      }
    });
  }

  return { renderizar, sincronizar };

})();

// ════════════════════════════════
// SELEÇÃO DE CARD
// ════════════════════════════════

function selectCard(el) {
  if (el.classList.contains('locked')) return;

  document.querySelectorAll('.phase-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');

  const phase = PhasesData.find(p => p.id === el.dataset.phase);
  if (phase && SaveManager.faseDesbloqueada(phase.id) && phase.caminho) {
    window.location.href = phase.caminho;
  }
}

// ════════════════════════════════
// TOOLTIP DOS CARDS
// Usa event delegation no frame para capturar
// tanto os cards do HTML quanto os gerados via JS
// ════════════════════════════════

frame.addEventListener('mousemove', e => {
  const card = e.target.closest('.phase-card');
  if (!card) {
    tooltip.classList.remove('visible');
    return;
  }
  tooltip.textContent = card.dataset.tip || '';
  tooltip.classList.add('visible');

  const r = frame.getBoundingClientRect();
  let x = e.clientX - r.left + 12;
  let y = e.clientY - r.top  + 12;
  if (x + tooltip.offsetWidth > r.width - 10)
    x = e.clientX - r.left - tooltip.offsetWidth - 8;
  tooltip.style.left = x + 'px';
  tooltip.style.top  = y + 'px';
});

frame.addEventListener('mouseleave', () => tooltip.classList.remove('visible'));

// ════════════════════════════════
// PARTÍCULAS DE POEIRA
// ════════════════════════════════

(function spawnParticles() {
  for (let i = 0; i < 24; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 4 + 2;
    Object.assign(p.style, {
      width:             size + 'px',
      height:            size + 'px',
      left:              Math.random() * 100 + '%',
      bottom:            Math.random() * 35  + '%',
      animationDuration: (Math.random() * 9 + 5) + 's',
      animationDelay:    (Math.random() * 8)      + 's',
    });
    frame.appendChild(p);
  }
})();

// ════════════════════════════════
// KEYFRAMES DINÂMICOS
// ════════════════════════════════

(function injectKeyframes() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes menuFlash {
      0%   { opacity: 1; }
      100% { opacity: 0; }
    }
  `;
  document.head.appendChild(style);
})();

// ════════════════════════════════
// INICIALIZAÇÃO
// Roda quando a página carrega.
// ════════════════════════════════

(function init() {

  // Limpa o localStorage do jogo a cada nova sessão do browser.
  // sessionStorage é apagado ao fechar a aba — se a flag não existe,
  // é sessão nova e limpamos todo o localStorage do jogo.
  if (!sessionStorage.getItem('mineralis_session')) {
    sessionStorage.setItem('mineralis_session', '1');
    Object.keys(localStorage)
      .filter(k => k.startsWith('mineralis'))
      .forEach(k => {
        localStorage.removeItem(k);
        console.info(`[Init] Chave "${k}" removida para sessão limpa.`);
      });
  }

  Cards.renderizar();
  Cards.sincronizar();

  // Som: inicia no primeiro sinal de interação do usuário.
  // mousemove dispara assim que o cursor entra na janela —
  // antes de qualquer clique, dando sensação de início imediato.
  function _iniciarAudio() {
    Audio.iniciarTrilha();
    document.removeEventListener('mousemove', _iniciarAudio);
    document.removeEventListener('click',     _iniciarAudio);
    document.removeEventListener('keydown',   _iniciarAudio);
  }
  document.addEventListener('mousemove', _iniciarAudio);
  document.addEventListener('click',     _iniciarAudio);
  document.addEventListener('keydown',   _iniciarAudio);

})();

// ════════════════════════════════
// MODAL CUSTOMIZADO
// Substitui window.confirm() com visual pixel art.
// Uso: Modal.confirmar('Mensagem aqui').then(ok => { if(ok) ... })
// ════════════════════════════════

const Modal = (() => {

  const overlay = document.getElementById('modalOverlay');
  const msg     = document.getElementById('modalMsg');
  const btnOk   = document.getElementById('modalConfirm');
  const btnCan  = document.getElementById('modalCancel');

  /**
   * Exibe o modal com a mensagem e retorna uma Promise<boolean>.
   * true  = jogador clicou OK
   * false = jogador clicou Cancelar
   */
  function confirmar(texto, apenasOk = false) {
    msg.textContent = texto;
    btnCan.style.display = apenasOk ? 'none' : '';
    overlay.classList.add('visible');

    return new Promise(resolve => {
      function _ok() {
        _fechar(); resolve(true);
      }
      function _cancel() {
        _fechar(); resolve(false);
      }
      function _fechar() {
        overlay.classList.remove('visible');
        btnOk.removeEventListener('click', _ok);
        btnCan.removeEventListener('click', _cancel);
      }

      btnOk.addEventListener('click',  _ok,     { once: true });
      btnCan.addEventListener('click', _cancel, { once: true });
    });
  }

  return { confirmar };

})();
