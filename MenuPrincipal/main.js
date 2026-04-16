const frame   = document.getElementById('frame');
const tooltip = document.getElementById('tooltip');

const Cards = (() => {

  // Injeta shimmer-overlay e lock-icon em um card (novo ou já existente no HTML)
  function _prepararCard(card) {
    if (card.querySelector('.shimmer-overlay')) return; // já preparado
    const shimmer  = document.createElement('div');
    shimmer.className = 'shimmer-overlay';
    const lockIcon = document.createElement('span');
    lockIcon.className = 'lock-icon';
    lockIcon.textContent = '🔒';
    card.insertBefore(lockIcon,  card.firstChild);
    card.insertBefore(shimmer,   card.firstChild);
  }

  function renderizar() {
    const mapaEl = document.getElementById('frame');

    // 1.1, 1.2 e 1.3 estão hardcoded no HTML — não recriar dinamicamente
    const existentes = new Set(['1.1', '1.2', '1.3']);

    PhasesData.forEach(fase => {
      if (existentes.has(fase.id)) return;

      // Usa o SVG do cards_svg.js se existir, senão ícone genérico de fallback
      const svgContent = (typeof CardsSVG !== 'undefined' && CardsSVG[fase.id])
        ? CardsSVG[fase.id]
        : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#2C1810"/><text x="40" y="52" text-anchor="middle" font-size="36" fill="#e0b840">⛏</text></svg>';

      const card = document.createElement('div');
      card.className     = 'phase-card locked';
      card.dataset.phase = fase.id;
      card.dataset.tip   = '🔒 ' + fase.nome;
      card.style.top     = fase.mapPos.top;
      card.style.left    = fase.mapPos.left;
      card.innerHTML     = `<div class="card-icon">${svgContent}</div>`;
      card.addEventListener('click', () => selectCard(card));
      _prepararCard(card);
      mapaEl.appendChild(card);
    });

    // Prepara shimmer/lock-icon e garante listener nos cards hardcoded no HTML
    document.querySelectorAll('.phase-card').forEach(card => {
      _prepararCard(card);
      card.removeAttribute('onclick');
      card.addEventListener('click', () => selectCard(card));
    });
  }

  function sincronizar() {
    document.querySelectorAll('.phase-card').forEach(card => {
      const id   = card.dataset.phase;
      const fase = PhasesData.find(p => p.id === id);
      if (!fase) return;

      const desbloqueada = SaveManager.faseDesbloqueada(id);

      if (desbloqueada) {
        card.classList.remove('locked');
        card.classList.add('unlocked');
        card.dataset.tip = fase.nome;
      } else {
        card.classList.add('locked');
        card.classList.remove('unlocked');
        card.dataset.tip = '🔒 ' + fase.nome;
      }
    });
  }

  // Animação de desbloqueio baseada no preview mineralis_cards_america_norte_preview.html
  function animarDesbloqueio(faseId) {
    const card = document.querySelector(`[data-phase="${faseId}"]`);
    if (!card) return;

    card.classList.remove('locked');
    card.classList.add('unlocking');

    const shimmer = card.querySelector('.shimmer-overlay');
    if (shimmer) shimmer.classList.add('active');

    if (typeof Audio !== 'undefined' && Audio.clickMenu) Audio.clickMenu();

    setTimeout(() => {
      card.classList.remove('unlocking');
      card.classList.add('unlocked');
      if (shimmer) shimmer.classList.remove('active');
      card.dataset.tip = PhasesData.find(p => p.id === faseId)?.nome || faseId;
    }, 800);
  }

  return { renderizar, sincronizar, animarDesbloqueio };

})();



function selectCard(el) {
  if (el.classList.contains('locked')) return;

  document.querySelectorAll('.phase-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  Audio.clickMenu();

  const phase = PhasesData.find(p => p.id === el.dataset.phase);
  if (phase?.caminho) {
    window.location.href = phase.caminho;
  }
}


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



(function injectKeyframes() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes menuFlash {
      0%   { opacity: 1; }
      100% { opacity: 0; }
    }

    /* ── Animações de desbloqueio de card (baseado no preview oficial) ── */

    /* Card bloqueado: SVG em escala de cinza */
    .phase-card.locked .card-icon svg,
    .phase-card.locked svg {
      filter: grayscale(100%) brightness(0.55);
    }
    /* Card desbloqueado/animando: SVG colorido */
    .phase-card.unlocked .card-icon svg,
    .phase-card.unlocking .card-icon svg,
    .phase-card.unlocked svg,
    .phase-card.unlocking svg {
      filter: grayscale(0%) brightness(1);
    }

    /* Ícone de cadeado */
    .lock-icon {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      font-size: 22px;
      pointer-events: none;
      opacity: 0.85;
      text-shadow: 0 2px 8px #000;
      z-index: 2;
      transition: opacity 0.3s;
    }
    .phase-card.locked   .lock-icon { display: block; }
    .phase-card.unlocked .lock-icon { display: none; }
    .phase-card.unlocking .lock-icon { opacity: 0; }

    /* Shimmer overlay */
    .shimmer-overlay {
      position: absolute;
      top: 0; left: -50%;
      width: 40%; height: 100%;
      background: linear-gradient(to right, transparent, rgba(255,255,255,0.5), transparent);
      pointer-events: none;
      opacity: 0;
      z-index: 3;
    }
    .shimmer-overlay.active {
      animation: shimmer 0.5s 0.3s ease-out forwards;
    }

    @keyframes shimmer {
      0%   { left: -50%; opacity: 1; }
      100% { left: 120%; opacity: 0; }
    }

    /* Flash + pulse ao desbloquear */
    @keyframes unlock-flash {
      0%   { filter: brightness(3) grayscale(0); transform: scale(1.15); }
      40%  { filter: brightness(1.5) grayscale(0); transform: scale(1.08); }
      100% { filter: brightness(1) grayscale(0); transform: scale(1); }
    }
    @keyframes unlock-pulse {
      0%   { box-shadow: 0 0 0 0 #FFD70088; }
      50%  { box-shadow: 0 0 28px 14px #FFD70033; }
      100% { box-shadow: 0 0 0 0 #FFD70000; }
    }
    .phase-card.unlocking {
      animation: unlock-flash 0.6s ease-out forwards, unlock-pulse 0.8s ease-out;
    }

    /* Hover somente em cards desbloqueados */
    .phase-card.unlocked:hover  { transform: scale(1.06); }
    .phase-card.unlocked:active { transform: scale(0.97); }
    .phase-card.locked          { cursor: default; }
  `;
  document.head.appendChild(style);
})();




(function init() {

  if (!sessionStorage.getItem('mineralis_session')) {
    sessionStorage.setItem('mineralis_session', '1');
    Object.keys(localStorage)
      .filter(k => k.startsWith('mineralis'))
      .forEach(k => {
        localStorage.removeItem(k);
        console.info(`[Init] Chave "${k}" removida para sessão limpa.`);
      });
  }

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (document.getElementById('modalOverlay')?.classList.contains('visible')) return;

    if (typeof Options !== 'undefined' && Options.fechar) { Options.fechar(); return; }
    if (typeof Journal !== 'undefined' && document.querySelector('.journal-overlay')) {
      Journal.fechar(); return;
    }
    if (typeof Menu !== 'undefined') Menu.close();
  });

  // Lê ?unlocked= ao retornar de uma fase concluída
  const params   = new URLSearchParams(window.location.search);
  const unlocked = params.get('unlocked'); // ex: '1.2'
  if (unlocked) {
    SaveManager.desbloquearFase(unlocked);
    history.replaceState(null, '', window.location.pathname);
    console.info(`[Init] Retorno de fase — desbloqueando "${unlocked}".`);
  }

  Cards.renderizar();
  Cards.sincronizar();

  // Dispara animação de desbloqueio no card recém-liberado
  if (unlocked) {
    setTimeout(() => Cards.animarDesbloqueio(unlocked), 700);
  }


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


const Modal = (() => {

  const overlay = document.getElementById('modalOverlay');
  const msg     = document.getElementById('modalMsg');
  const btnOk   = document.getElementById('modalConfirm');
  const btnCan  = document.getElementById('modalCancel');


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
