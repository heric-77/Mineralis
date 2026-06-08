const SaveManager = (() => {

  const SAVE_KEY = 'mineralis_save_v2';

  function _load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function _save(data) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch {
      console.warn('[SaveManager] Não foi possível gravar no localStorage.');
    }
  }

  function jogoIniciado() {
    const save = _load();
    return !!(save && save.iniciado);
  }

  function faseDesbloqueada(id) {
    const save = _load();
    return !!(save && save.fases && save.fases[id] && save.fases[id].desbloqueada);
  }

  function estrelasDaFase(id) {
    const save = _load();
    return save?.fases?.[id]?.estrelas ?? 0;
  }


  function iniciarNovaJornada() {
    const fases = {};
    PhasesData.forEach((fase, idx) => {
      fases[fase.id] = { desbloqueada: idx === 0, estrelas: 0 };
    });
    const save = { versao: 1, iniciado: true, fases, coletados: {} };
    _save(save);
    console.info('[SaveManager] Nova jornada iniciada.');
  }


  function desbloquearFase(id) {
    const save = _load();
    if (!save) return;
    if (!save.fases[id]) save.fases[id] = { desbloqueada: false, estrelas: 0 };
    save.fases[id].desbloqueada = true;
    _save(save);
    console.info(`[SaveManager] Fase ${id} desbloqueada.`);
  }


  function gravarEstrelas(id, qtd) {
    const save = _load();
    if (!save?.fases?.[id]) return;
    save.fases[id].estrelas = Math.max(save.fases[id].estrelas, qtd);
    _save(save);
  }

  return {
    jogoIniciado,
    faseDesbloqueada,
    estrelasDaFase,
    iniciarNovaJornada,
    desbloquearFase,
    gravarEstrelas,
  };

})();


const Menu = (() => {

  const titleBlock = document.getElementById('titleBlock');
  const menuBlock  = document.getElementById('menuBlock');
  const frame      = document.getElementById('frame');


  function open() {
    Audio.clickMenu();
    titleBlock.style.display = 'none';
    menuBlock.classList.add('visible');
  }

  function close() {
    Audio.fecharMenu();
    menuBlock.classList.remove('visible');
    titleBlock.style.display = '';
  }


  function _flash() {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position: 'absolute', inset: '0',
      background: 'rgba(255,210,80,.12)',
      zIndex: '999', pointerEvents: 'none',
      animation: 'menuFlash .4s forwards'
    });
    frame.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }


  function _novaJornada() {
    if (SaveManager.jogoIniciado()) {
      Modal.confirmar('Iniciar uma Nova Jornada vai apagar seu progresso atual.\nDeseja continuar?')
        .then(ok => {
          if (!ok) return;
          _executarNovaJornada();
        });
    } else {
      _executarNovaJornada();
    }
  }

  function _executarNovaJornada() {
    SaveManager.iniciarNovaJornada();
    _flash();
    close();
    Cards.sincronizar();
    Audio.novaJornada();

    const card11 = document.querySelector('.phase-card[data-phase="1.1"]');
    if (card11) {
      setTimeout(() => {
        card11.classList.add('just-unlocked');
        card11.addEventListener('animationend', () => {
          card11.classList.remove('just-unlocked');
        }, { once: true });
      }, 250);
    }
    console.info('[Menu] Nova Jornada iniciada – fase 1.1 desbloqueada.');
  }

  function _explorar() {
    if (!SaveManager.jogoIniciado()) {
      Modal.confirmar('Inicie uma Nova Jornada primeiro para explorar o mapa!', true)
        .then(() => {});
      return;
    }
    Audio.clickMenu();
    menuBlock.classList.remove('visible');
    titleBlock.style.display = '';
    document.getElementById('frame').classList.add('explore-mode');
    console.info('[Menu] Modo exploração ativo.');
  }

 
  function voltarDoMapa() {
    Audio.clickMenu();
    document.getElementById('frame').classList.remove('explore-mode');
    console.info('[Menu] Voltou ao menu principal.');
  }

  function _diario() {
    Audio.clickMenu();
    close();
    Journal.abrir();
    console.info('[Menu] Diário de Bordo aberto.');
  }

  function _opcoes() {
    Audio.clickMenu();
    close();                   
    Options.abrir();           
  }

  function _sair() {
    Modal.confirmar('Deseja sair do Mineralis?')
      .then(ok => {
        if (ok) window.close();
      });
  }


  function action(key) {
    const actions = {
      nova:     _novaJornada,
      explorar: _explorar,
      diario:   _diario,
      opcoes:   _opcoes,
      sair:     _sair,
    };
    if (actions[key]) {
      actions[key]();
    } else {
      console.warn(`[Menu] Ação desconhecida: "${key}"`);
    }
  }

  return { open, close, action, voltarDoMapa };

})();

