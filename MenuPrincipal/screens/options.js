const Options = (() => {

  const OPT_KEY = 'mineralis_options_v1';

  const DEFAULTS = {
    volMusica:  80,   
    volEfeitos: 80,  
    mudo:       false,
    idioma:     'pt-BR',
  };

  let overlay = null;


  function _loadOpts() {
    try {
      const raw = localStorage.getItem(OPT_KEY);
      return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
    } catch { return { ...DEFAULTS }; }
  }

  function _saveOpts(opts) {
    try {
      localStorage.setItem(OPT_KEY, JSON.stringify(opts));
    } catch { console.warn('[Options] Não foi possível salvar opções.'); }
  }


  function _aplicarAudio(opts) {
    if (typeof Audio === 'undefined') return;
    const vol = opts.mudo ? 0 : opts.volMusica / 100;
    const sfx = opts.mudo ? 0 : opts.volEfeitos / 100;
    if (Audio.setVolMusica)  Audio.setVolMusica(vol);
    if (Audio.setVolEfeitos) Audio.setVolEfeitos(sfx);
  }

  function inicializar() {
    const opts = _loadOpts();
    _aplicarAudio(opts);
  }

  function _buildHTML(opts) {
    return `
      <div class="options-box">

        <!-- Header -->
        <div class="options-header">
          <span class="options-title">OPÇÕES</span>
          <button class="options-close" id="optionsClose" title="Fechar">✕</button>
        </div>
        <div class="options-divider">
          <span>⬥</span><div class="options-deco-line"></div><span>⬥</span>
        </div>

        <!-- Corpo -->
        <div class="options-body">

          <!-- Seção: Áudio -->
          <div class="options-section">
            <div class="options-section-title">⚙ ÁUDIO</div>

            <!-- Volume da Música -->
            <div class="options-row">
              <label class="options-label" for="sliderMusica">🎵 Música</label>
              <div class="options-slider-wrap">
                <input
                  type="range" id="sliderMusica"
                  class="options-slider"
                  min="0" max="100" step="5"
                  value="${opts.volMusica}"
                />
                <span class="options-slider-val" id="valMusica">${opts.volMusica}%</span>
              </div>
            </div>

            <!-- Volume dos Efeitos -->
            <div class="options-row">
              <label class="options-label" for="sliderEfeitos">🔊 Efeitos</label>
              <div class="options-slider-wrap">
                <input
                  type="range" id="sliderEfeitos"
                  class="options-slider"
                  min="0" max="100" step="5"
                  value="${opts.volEfeitos}"
                />
                <span class="options-slider-val" id="valEfeitos">${opts.volEfeitos}%</span>
              </div>
            </div>

            <!-- Mudo -->
            <div class="options-row">
              <span class="options-label">🔇 Silenciar</span>
              <button
                class="options-toggle ${opts.mudo ? 'ativo' : ''}"
                id="btnMudo"
                data-state="${opts.mudo ? '1' : '0'}"
              >${opts.mudo ? 'LIGADO' : 'DESLIGADO'}</button>
            </div>
          </div>

          <!-- Seção: Idioma -->
          <div class="options-section">
            <div class="options-section-title">🌐 IDIOMA</div>
            <div class="options-row options-row-langs">
              <button class="options-lang-btn ativo" data-lang="pt-BR">🇧🇷 PT-BR</button>
              <button class="options-lang-btn disabled" data-lang="en" title="Em breve">🇬🇧 EN (em breve)</button>
            </div>
          </div>

          <!-- Seção: Dados -->
          <div class="options-section">
            <div class="options-section-title">💾 DADOS</div>
            <div class="options-row">
              <span class="options-label">Progresso salvo</span>
              <button class="options-danger-btn" id="btnZerar">Zerar Dados</button>
            </div>
          </div>

          <!-- Seção: Créditos -->
          <div class="options-section">
            <div class="options-section-title">📜 CRÉDITOS</div>
            <div class="options-credits">
              <p>Design & Programação</p>
              <p class="options-credits-name">Dominic Krelling | Franciele Torquato | Gustavo Schmitt | Heric Moreira Ribeiro</p>
              <div class="options-credits-sep">· · ·</div>
              <p>Trilha Sonora</p>
              <p class="options-credits-name">Web Audio API ♪</p>
              <div class="options-credits-sep">· · ·</div>
              <p>Arte Pixel</p>
              <p class="options-credits-name">Sprites & SVG Artesanal | Franciele Torquato </p>
              <div class="options-credits-sep">· · ·</div>
              <p class="options-version">v1.0 · 2026 · Mineralis</p>
            </div>
          </div>

        </div><!-- /.options-body -->

        <!-- Footer -->
        <div class="options-footer">
          <span>Corvan · Guardião dos Minérios e da História</span>
        </div>

      </div>`;
  }

  function _bindEventos() {
    const opts = _loadOpts();

    document.getElementById('optionsClose').addEventListener('click', fechar);

    const slMusica = document.getElementById('sliderMusica');
    const valMusica = document.getElementById('valMusica');
    slMusica.addEventListener('input', () => {
      const v = parseInt(slMusica.value);
      valMusica.textContent = v + '%';
      const cur = _loadOpts();
      cur.volMusica = v;
      _saveOpts(cur);
      _aplicarAudio(cur);
    });

    const slEfeitos = document.getElementById('sliderEfeitos');
    const valEfeitos = document.getElementById('valEfeitos');
    slEfeitos.addEventListener('input', () => {
      const v = parseInt(slEfeitos.value);
      valEfeitos.textContent = v + '%';
      const cur = _loadOpts();
      cur.volEfeitos = v;
      _saveOpts(cur);
      _aplicarAudio(cur);
      if (typeof Audio !== 'undefined' && Audio.clickMenu) Audio.clickMenu();
    });

    const btnMudo = document.getElementById('btnMudo');
    btnMudo.addEventListener('click', () => {
      const cur  = _loadOpts();
      cur.mudo   = !cur.mudo;
      _saveOpts(cur);
      _aplicarAudio(cur);
      btnMudo.textContent  = cur.mudo ? 'LIGADO' : 'DESLIGADO';
      btnMudo.dataset.state = cur.mudo ? '1' : '0';
      btnMudo.classList.toggle('ativo', cur.mudo);
    });

    document.getElementById('btnZerar').addEventListener('click', () => {
      fechar();
      Modal.confirmar('⚠ Isso apagará TODO o progresso salvo.\nDeseja continuar?')
        .then(ok => {
          if (!ok) return;
          SaveManager.iniciarNovaJornada();
          if (typeof Cards !== 'undefined') Cards.sincronizar();
          console.info('[Options] Dados zerados pelo jogador.');
        });
    });

    overlay._escHandler = (e) => {
      if (e.key === 'Escape') fechar();
    };
    document.addEventListener('keydown', overlay._escHandler);
  }


  function abrir() {
    if (overlay) return; 

    const opts = _loadOpts();
    overlay = document.createElement('div');
    overlay.className = 'options-overlay';
    overlay.innerHTML = _buildHTML(opts);

    overlay.addEventListener('click', e => {
      if (e.target === overlay) fechar();
    });

    document.getElementById('frame').appendChild(overlay);

    requestAnimationFrame(() => overlay.classList.add('visible'));

    _bindEventos();
    if (typeof Audio !== 'undefined') Audio.clickMenu();

    console.info('[Options] Tela de opções aberta.');
  }

  function fechar() {
    if (!overlay) return;
    if (overlay._escHandler) {
      document.removeEventListener('keydown', overlay._escHandler);
    }
    overlay.classList.remove('visible');
    overlay.addEventListener('transitionend', () => {
      overlay?.remove();
      overlay = null;
    }, { once: true });
    if (typeof Audio !== 'undefined') Audio.fecharMenu();
    console.info('[Options] Tela de opções fechada.');
  }

  return { abrir, fechar, inicializar };

})();
