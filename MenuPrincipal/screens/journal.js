const Journal = (() => {

  let abaAtiva = 'minerios';
  let overlay  = null;

  const ITENS = {
    ferramentas: [
      { id:'picareta_basica',  nome:'Picareta Básica',    fase:'1.1', desc:'Ferramenta essencial para quebrar rochas sedimentares e extrair minérios superficiais.' },
      { id:'pa_exploradora',   nome:'Pá Exploradora',     fase:'1.2', desc:'Ideal para escavar solo aluvial e encontrar pepitas de ouro em leitos de rios.' },
      { id:'bateia',           nome:'Bateia',             fase:'1.2', desc:'Usada para garimpar ouro em rios. Separa o minério pesado do sedimento leve.' },
      { id:'lupa_geologica',   nome:'Lupa Geológica',     fase:'1.3', desc:'Permite identificar estruturas cristalinas e classificar minerais com precisão.' },
      { id:'picareta_ferro',   nome:'Picareta de Ferro',  fase:'2.2', desc:'Mais resistente, capaz de penetrar camadas de xisto e carvão compactado.' },
      { id:'broca_manual',     nome:'Broca Manual',       fase:'3.3', desc:'Equipamento industrial da Revolução Industrial. Perfura rochas duras com eficiência.' },
      { id:'sonar_geologico',  nome:'Sonar Geológico',    fase:'5.2', desc:'Tecnologia moderna para localizar reservatórios de petróleo e gás em subsolo.' },
      { id:'escafandro',       nome:'Escafandro',         fase:'6.3', desc:'Equipamento de mergulho para explorar recifes e leitos oceânicos em busca de pérolas.' },
    ],
    minerios: [
      { id:'prata',            nome:'Prata',              fase:'1.1', desc:'Metal precioso extraído nos Andes. Usado pelo Império Inca e pelos colonizadores espanhóis.' },
      { id:'estanho',          nome:'Estanho',            fase:'1.1', desc:'Mineral metálico encontrado nos Andes. Essencial para a fabricação de bronze.' },
      { id:'ouro_aluvial',     nome:'Ouro Aluvial',       fase:'1.2', desc:'Pepitas de ouro depositadas em leitos de rios pela erosão. Base da corrida do ouro.' },
      { id:'quartzo',          nome:'Quartzo',            fase:'2.1', desc:'Mineral silicioso abundante na Serra Nevada. Frequentemente associado a veios de ouro.' },
      { id:'carvao',           nome:'Carvão Mineral',     fase:'2.2', desc:'Rocha sedimentar formada por matéria orgânica. Combustível da Revolução Industrial.' },
      { id:'cobre_nativo',     nome:'Cobre Nativo',       fase:'2.3', desc:'Cobre puro encontrado em formações vulcânicas. Usado por povos nativos há 7.000 anos.' },
      { id:'chumbo',           nome:'Chumbo',             fase:'3.1', desc:'Metal denso extraído pelos romanos no Rio Tinto. Usado em encanamentos e moedas.' },
      { id:'sal_gema',         nome:'Sal-Gema',           fase:'3.2', desc:'Mineral formado pela evaporação de mares antigos. Valioso como conservante e moeda.' },
      { id:'diamante',         nome:'Diamante Bruto',     fase:'4.1', desc:'Formado a 3 bilhões de anos em kimberlit. O mineral natural mais duro do planeta.' },
      { id:'jade',             nome:'Jade',               fase:'5.1', desc:'Pedra semipreciosa sagrada na China antiga. Símbolo de virtude, poder e imortalidade.' },
      { id:'petroleo',         nome:'Petróleo',           fase:'5.2', desc:'Recurso fóssil formado em milhões de anos. Transformou a geopolítica global no séc. XX.' },
      { id:'opal',             nome:'Opala',              fase:'6.1', desc:'Gema única do Outback australiano com jogo de cores. Formada por sílica hidratada.' },
    ],
    artefatos: [
      { id:'ceramica_inca',    nome:'Cerâmica Inca',      fase:'1.1', desc:'Vasilha de cerâmica vermelha com padrões geométricos. Usada em rituais do Império Inca.' },
      { id:'mapa_potosi',      nome:'Mapa de Potosí',     fase:'1.1', desc:'Fragmento de mapa colonial espanhol indicando túneis da Montanha Rica.' },
      { id:'vaso_amazônico',   nome:'Vaso Amazônico',     fase:'1.2', desc:'Cerâmica pré-colombiana com pigmentação natural. Evidência de civilizações amazônicas.' },
      { id:'relevo_inca',      nome:'Relevo Inca',        fase:'1.3', desc:'Pedra entalhada com símbolos astronômicos incas. Usada para calcular o solstício.' },
      { id:'ferramenta_cobre', nome:'Ferramenta de Cobre',fase:'2.3', desc:'Instrumento nativo americano forjado em cobre puro. Data de 5.000 anos atrás.' },
      { id:'escoria_romana',   nome:'Escória Romana',     fase:'3.1', desc:'Resíduo da fundição romana de chumbo e prata. Evidência da engenharia minerária antiga.' },
      { id:'ferramenta_bronze',nome:'Ferramenta de Bronze',fase:'3.2',desc:'Instrumento celta da Idade do Bronze encontrado nas minas de sal de Hallstatt.' },
      { id:'hieroglifo',       nome:'Placa de Hieróglifos',fase:'4.2',desc:'Pedra com escrita egípcia antiga descrevendo rotas de mineração no Deserto Oriental.' },
      { id:'vaso_faraos',      nome:'Vaso dos Faraós',    fase:'4.2', desc:'Recipiente funerário em ouro e lapis lazuli. Encontrado em antigo túnel de mineração.' },
      { id:'jade_escultura',   nome:'Escultura de Jade',  fase:'5.1', desc:'Dragão esculpido em jade branco. Símbolo imperial da Dinastia Han, 200 a.C.' },
      { id:'pearl_aboriginal', nome:'Colar Aborigene',    fase:'6.1', desc:'Colar de pedras e sementes sagradas. Pertenceu a um ancião da tribo Wangkathaa.' },
    ],
  };

  const ICONES = {
    // FERRAMENTAS
    picareta_basica:  `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="2" y="10" width="14" height="2" fill="#7a4818"/><rect x="2" y="11" width="1" height="8" fill="#7a4818"/><rect x="2" y="8" width="10" height="4" fill="#888"/><rect x="10" y="6" width="3" height="4" fill="#aaa"/><rect x="11" y="5" width="2" height="2" fill="#ccc"/></svg>`,
    pa_exploradora:   `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="10" y="2" width="4" height="12" fill="#888"/><rect x="9" y="12" width="6" height="4" fill="#aaa"/><rect x="11" y="4" width="2" height="16" fill="#7a4818"/></svg>`,
    bateia:           `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="3" y="10" width="18" height="3" fill="#8b6835"/><rect x="5" y="13" width="14" height="2" fill="#a07840"/><rect x="7" y="15" width="10" height="2" fill="#8b6835"/><rect x="9" y="17" width="6" height="2" fill="#7a5728"/><rect x="8" y="11" width="2" height="2" fill="#ffd700"/><rect x="14" y="12" width="2" height="1" fill="#ffd700"/></svg>`,
    lupa_geologica:   `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="6" y="4" width="10" height="10" fill="none" stroke="#888" stroke-width="2"/><rect x="7" y="5" width="8" height="8" fill="#88ccff" opacity="0.3"/><rect x="14" y="13" width="6" height="2" fill="#888" transform="rotate(45 14 13)"/><rect x="6" y="4" width="10" height="10" fill="#888" opacity="0" stroke="#aaa" stroke-width="2"/><rect x="5" y="3" width="12" height="12" fill="none"/><rect x="14" y="14" width="2" height="6" fill="#7a4818" transform="rotate(45 14 14)"/></svg>`,
    picareta_ferro:   `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="2" y="10" width="14" height="2" fill="#6b4818"/><rect x="2" y="11" width="1" height="8" fill="#6b4818"/><rect x="2" y="7" width="11" height="5" fill="#555"/><rect x="11" y="5" width="3" height="5" fill="#777"/><rect x="12" y="4" width="2" height="3" fill="#999"/></svg>`,
    broca_manual:     `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="10" y="2" width="4" height="8" fill="#666"/><rect x="9" y="10" width="6" height="4" fill="#888"/><rect x="10" y="14" width="4" height="2" fill="#777"/><rect x="11" y="16" width="2" height="6" fill="#555"/><rect x="10" y="20" width="4" height="2" fill="#444"/></svg>`,
    sonar_geologico:  `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="8" y="4" width="8" height="6" fill="#2a5a8a"/><rect x="9" y="5" width="6" height="4" fill="#3a7aaa"/><rect x="11" y="3" width="2" height="2" fill="#888"/><rect x="6" y="10" width="12" height="8" fill="#1a3a5a"/><rect x="7" y="11" width="10" height="6" fill="#4a9aff" opacity="0.4"/><rect x="10" y="14" width="4" height="1" fill="#4aff4a"/></svg>`,
    escafandro:       `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="7" y="3" width="10" height="10" fill="#2a5a8a"/><rect x="8" y="4" width="8" height="8" fill="#3a7aaa"/><rect x="9" y="5" width="6" height="6" fill="#88ccff" opacity="0.5"/><rect x="10" y="7" width="4" height="3" fill="#fff" opacity="0.3"/><rect x="5" y="8" width="3" height="4" fill="#888"/><rect x="16" y="8" width="3" height="4" fill="#888"/><rect x="9" y="13" width="6" height="4" fill="#2a5a8a"/></svg>`,
    // MINÉRIOS
    prata:            `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="8" y="6" width="8" height="12" fill="#aaa"/><rect x="7" y="8" width="10" height="8" fill="#ccc"/><rect x="9" y="7" width="6" height="10" fill="#bbb"/><rect x="10" y="6" width="4" height="2" fill="#ddd"/><rect x="9" y="9" width="2" height="2" fill="#eee"/></svg>`,
    estanho:          `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="7" y="7" width="10" height="10" fill="#8a9aaa"/><rect x="8" y="8" width="8" height="8" fill="#aabbc0"/><rect x="9" y="9" width="3" height="3" fill="#c0ccd0"/><rect x="6" y="9" width="2" height="6" fill="#7a8a9a"/><rect x="16" y="9" width="2" height="6" fill="#7a8a9a"/></svg>`,
    ouro_aluvial:     `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="9" y="8" width="6" height="6" fill="#ffd700"/><rect x="8" y="9" width="8" height="6" fill="#ffcc00"/><rect x="10" y="7" width="4" height="2" fill="#ffe060"/><rect x="7" y="10" width="2" height="4" fill="#cc9900"/><rect x="15" y="10" width="2" height="4" fill="#cc9900"/><rect x="9" y="9" width="2" height="2" fill="#fff176"/></svg>`,
    quartzo:          `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="10" y="4" width="4" height="4" fill="#e8f0ff"/><rect x="8" y="8" width="8" height="8" fill="#d0d8ee"/><rect x="9" y="16" width="6" height="4" fill="#b8c0da"/><rect x="11" y="5" width="2" height="2" fill="#fff"/><rect x="9" y="10" width="2" height="2" fill="#fff" opacity="0.5"/></svg>`,
    carvao:           `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="6" y="7" width="12" height="10" fill="#1a1a1a"/><rect x="7" y="8" width="10" height="8" fill="#2a2a2a"/><rect x="8" y="9" width="3" height="3" fill="#3a3a3a"/><rect x="13" y="12" width="3" height="2" fill="#3a3a3a"/><rect x="9" y="7" width="2" height="1" fill="#444"/></svg>`,
    cobre_nativo:     `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="7" y="7" width="10" height="10" fill="#b87333"/><rect x="8" y="8" width="8" height="8" fill="#cd8a3a"/><rect x="9" y="9" width="3" height="3" fill="#e8a050"/><rect x="6" y="9" width="2" height="6" fill="#a06020"/><rect x="10" y="8" width="2" height="2" fill="#ffa040"/></svg>`,
    chumbo:           `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="7" y="8" width="10" height="8" fill="#606070"/><rect x="8" y="9" width="8" height="6" fill="#7a7a8a"/><rect x="9" y="10" width="3" height="2" fill="#8a8a9a"/><rect x="6" y="10" width="2" height="4" fill="#505060"/></svg>`,
    sal_gema:         `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="9" y="6" width="6" height="6" fill="#e8e8f8"/><rect x="8" y="8" width="8" height="8" fill="#f0f0ff"/><rect x="10" y="7" width="4" height="4" fill="#fff"/><rect x="7" y="10" width="2" height="4" fill="#d0d0e8"/><rect x="15" y="10" width="2" height="4" fill="#d0d0e8"/><rect x="11" y="8" width="2" height="2" fill="#fff"/></svg>`,
    diamante:         `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="10" y="4" width="4" height="2" fill="#e8f4ff"/><rect x="8" y="6" width="8" height="2" fill="#d0eeff"/><rect x="7" y="8" width="10" height="6" fill="#b8e0ff"/><rect x="9" y="14" width="6" height="4" fill="#88c8f8"/><rect x="11" y="18" width="2" height="2" fill="#60a8e0"/><rect x="11" y="6" width="2" height="2" fill="#fff"/><rect x="9" y="9" width="2" height="2" fill="#fff" opacity="0.7"/></svg>`,
    jade:             `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="8" y="6" width="8" height="12" fill="#2a8a2a"/><rect x="9" y="7" width="6" height="10" fill="#3a9a3a"/><rect x="10" y="8" width="4" height="8" fill="#4aaa4a"/><rect x="11" y="6" width="2" height="2" fill="#5aca5a"/><rect x="10" y="9" width="2" height="2" fill="#6ada6a" opacity="0.7"/></svg>`,
    petroleo:         `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="9" y="8" width="6" height="8" fill="#0a0a0a"/><rect x="10" y="9" width="4" height="6" fill="#1a1a1a"/><rect x="8" y="10" width="8" height="4" fill="#0a0a0a"/><rect x="11" y="6" width="2" height="4" fill="#555"/><rect x="10" y="5" width="4" height="2" fill="#444"/><rect x="10" y="10" width="2" height="2" fill="#2a2a2a"/></svg>`,
    opal:             `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="8" y="7" width="8" height="10" fill="#aa88cc"/><rect x="9" y="8" width="6" height="8" fill="#bb99dd"/><rect x="10" y="9" width="4" height="6" fill="#ccaaee"/><rect x="11" y="7" width="2" height="2" fill="#ffaaff"/><rect x="9" y="11" width="2" height="2" fill="#aaffaa" opacity="0.7"/><rect x="13" y="12" width="2" height="2" fill="#aaaaff" opacity="0.7"/></svg>`,
    // ARTEFATOS
    ceramica_inca:    `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="8" y="6" width="8" height="2" fill="#8b4513"/><rect x="7" y="8" width="10" height="10" fill="#a0522d"/><rect x="8" y="9" width="8" height="8" fill="#8b4513"/><rect x="9" y="18" width="6" height="2" fill="#6b3510"/><rect x="9" y="10" width="2" height="2" fill="#5c2808"/><rect x="13" y="13" width="2" height="2" fill="#5c2808"/><rect x="9" y="15" width="6" height="1" fill="#6b3510"/></svg>`,
    mapa_potosi:      `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="4" y="4" width="16" height="16" fill="#d4b483"/><rect x="5" y="5" width="14" height="14" fill="#c9a96e"/><rect x="6" y="6" width="2" height="2" fill="#6b3d1e"/><rect x="10" y="8" width="4" height="1" fill="#6b3d1e"/><rect x="8" y="11" width="8" height="1" fill="#6b3d1e"/><rect x="7" y="14" width="6" height="1" fill="#6b3d1e"/><rect x="14" y="12" width="3" height="3" fill="#ffd700" opacity="0.6"/></svg>`,
    vaso_amazônico:   `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="9" y="5" width="6" height="2" fill="#8b4513"/><rect x="7" y="7" width="10" height="2" fill="#a0522d"/><rect x="6" y="9" width="12" height="8" fill="#8b4513"/><rect x="7" y="17" width="10" height="2" fill="#6b3510"/><rect x="8" y="10" width="2" height="2" fill="#5c2808"/><rect x="12" y="12" width="2" height="2" fill="#5c2808"/><rect x="9" y="14" width="6" height="1" fill="#6b3510"/></svg>`,
    relevo_inca:      `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="4" y="6" width="16" height="12" fill="#9a9080"/><rect x="5" y="7" width="14" height="10" fill="#a8a090"/><rect x="10" y="8" width="4" height="4" fill="#8a8070"/><rect x="11" y="9" width="2" height="2" fill="#7a7060"/><rect x="7" y="10" width="2" height="2" fill="#8a8070"/><rect x="15" y="10" width="2" height="2" fill="#8a8070"/><rect x="8" y="14" width="8" height="1" fill="#7a7060"/></svg>`,
    ferramenta_cobre: `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="5" y="10" width="12" height="2" fill="#7a4818"/><rect x="5" y="11" width="1" height="6" fill="#7a4818"/><rect x="5" y="8" width="8" height="4" fill="#b87333"/><rect x="11" y="6" width="3" height="4" fill="#cd8a3a"/><rect x="12" y="5" width="2" height="2" fill="#e8a050"/></svg>`,
    escoria_romana:   `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="5" y="10" width="14" height="8" fill="#3a2010"/><rect x="6" y="11" width="12" height="6" fill="#4a3020"/><rect x="7" y="12" width="4" height="3" fill="#2a1808"/><rect x="13" y="13" width="4" height="2" fill="#2a1808"/><rect x="8" y="14" width="2" height="1" fill="#888" opacity="0.4"/></svg>`,
    ferramenta_bronze:`<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="4" y="10" width="14" height="2" fill="#7a4818"/><rect x="4" y="11" width="1" height="7" fill="#7a4818"/><rect x="4" y="8" width="9" height="4" fill="#cd8a3a"/><rect x="11" y="6" width="3" height="5" fill="#dda040"/><rect x="12" y="5" width="2" height="3" fill="#eeaa50"/></svg>`,
    hieroglifo:       `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="4" y="4" width="16" height="16" fill="#c8a050"/><rect x="5" y="5" width="14" height="14" fill="#d8b060"/><rect x="7" y="7" width="3" height="3" fill="#6b3d1e"/><rect x="12" y="7" width="2" height="3" fill="#6b3d1e"/><rect x="7" y="12" width="4" height="2" fill="#6b3d1e"/><rect x="13" y="13" width="3" height="2" fill="#6b3d1e"/><rect x="8" y="16" width="8" height="1" fill="#6b3d1e"/></svg>`,
    vaso_faraos:      `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="9" y="4" width="6" height="2" fill="#ffd700"/><rect x="7" y="6" width="10" height="2" fill="#ffc800"/><rect x="6" y="8" width="12" height="8" fill="#ffd700"/><rect x="7" y="16" width="10" height="2" fill="#ffc800"/><rect x="8" y="9" width="2" height="2" fill="#2222aa"/><rect x="14" y="11" width="2" height="2" fill="#2222aa"/><rect x="9" y="13" width="6" height="1" fill="#cc9900"/></svg>`,
    jade_escultura:   `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="9" y="5" width="6" height="4" fill="#2a8a2a"/><rect x="7" y="9" width="10" height="6" fill="#3a9a3a"/><rect x="8" y="15" width="8" height="4" fill="#2a8a2a"/><rect x="10" y="6" width="4" height="2" fill="#5aca5a"/><rect x="9" y="10" width="2" height="2" fill="#5aca5a"/><rect x="13" y="12" width="2" height="2" fill="#4aba4a"/></svg>`,
    pearl_aboriginal: `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="6" y="11" width="2" height="2" fill="#e8d8c0"/><rect x="10" y="10" width="2" height="2" fill="#f0e0c8"/><rect x="14" y="11" width="2" height="2" fill="#e8d8c0"/><rect x="8" y="13" width="2" height="2" fill="#d8c8b0"/><rect x="12" y="13" width="2" height="2" fill="#e0d0b8"/><rect x="4" y="12" width="16" height="1" fill="#8b4513" opacity="0.5"/><rect x="10" y="12" width="2" height="2" fill="#fff" opacity="0.5"/></svg>`,
  };


  function _renderAba(tipo) {
    const itens    = ITENS[tipo] || [];
    const save     = _getSave();
    const coletados = save?.coletados || {};

    return itens.map(item => {
      const coletado = !!coletados[item.id];
      const icone    = ICONES[item.id] || '';
      return `
        <div class="journal-item ${coletado ? 'coletado' : 'bloqueado'}" data-id="${item.id}" title="${item.nome}">
          <div class="journal-item-icon">${icone}</div>
          <div class="journal-item-info">
            <span class="journal-item-nome">${coletado ? item.nome : '???'}</span>
            <span class="journal-item-fase">${coletado ? item.fase : '?'}</span>
          </div>
          ${coletado ? `<div class="journal-item-desc">${item.desc}</div>` : ''}
        </div>`;
    }).join('');
  }

  function _getSave() {
    try { return JSON.parse(localStorage.getItem('mineralis_save_v2')); } catch { return null; }
  }

  function _contagem(tipo) {
    const save     = _getSave();
    const coletados = save?.coletados || {};
    const total    = ITENS[tipo].length;
    const found    = ITENS[tipo].filter(i => coletados[i.id]).length;
    return `${found}/${total}`;
  }


  function abrir() {
    if (overlay) return;

    overlay = document.createElement('div');
    overlay.id        = 'journalOverlay';
    overlay.className = 'journal-overlay';
    overlay.innerHTML = _buildHTML();
    document.getElementById('frame').appendChild(overlay);

    requestAnimationFrame(() => overlay.classList.add('visible'));

    overlay.querySelector('#journalClose').addEventListener('click', fechar);
    overlay.querySelectorAll('.journal-tab').forEach(tab => {
      tab.addEventListener('click', () => _trocarAba(tab.dataset.aba));
    });

    overlay.addEventListener('click', e => {
      if (e.target === overlay) fechar();
    });
  }

  function fechar() {
    if (!overlay) return;
    Audio.fecharMenu();
    overlay.classList.remove('visible');
    setTimeout(() => {
      overlay?.remove();
      overlay = null;
    }, 250);
  }

  function _trocarAba(novaAba) {
    if (novaAba === abaAtiva) return;
    abaAtiva = novaAba;
    Audio.clickMenu();

    overlay.querySelectorAll('.journal-tab').forEach(t => {
      t.classList.toggle('ativa', t.dataset.aba === abaAtiva);
    });

    const content = overlay.querySelector('.journal-items');
    content.classList.add('fade-out');
    setTimeout(() => {
      content.innerHTML = _renderAba(abaAtiva);
      content.classList.remove('fade-out');
      _bindItemHover();
    }, 150);
  }

  function _bindItemHover() {
    overlay.querySelectorAll('.journal-item.coletado').forEach(el => {
      el.addEventListener('mouseenter', () => {
        overlay.querySelectorAll('.journal-item').forEach(i => i.classList.remove('expandido'));
        el.classList.add('expandido');
      });
    });
  }

  function _buildHTML() {
    const tabs = [
      { id:'minerios',    label:'⛏ Minérios'  },
      { id:'ferramentas', label:'🔧 Ferramentas' },
      { id:'artefatos',   label:'🏺 Artefatos'  },
    ];

    const tabsHTML = tabs.map(t => `
      <button class="journal-tab ${t.id === abaAtiva ? 'ativa' : ''}" data-aba="${t.id}">
        <span>${t.label}</span>
        <span class="journal-tab-count">${_contagem(t.id)}</span>
      </button>`).join('');

    return `
      <div class="journal-box">

        <!-- Capa / Header -->
        <div class="journal-header">
          <div class="journal-header-left">
            <span class="journal-title">DIÁRIO DE BORDO</span>
            <span class="journal-subtitle">Explorando o Mundo Subterrâneo</span>
          </div>
          <button class="journal-close" id="journalClose" title="Fechar">✕</button>
        </div>

        <!-- Divisor decorativo -->
        <div class="journal-header-deco">
          <span>⬥</span><div class="journal-deco-line"></div><span>⬥</span>
        </div>

        <!-- Abas -->
        <div class="journal-tabs">${tabsHTML}</div>

        <!-- Conteúdo scrollável -->
        <div class="journal-body">
          <div class="journal-items">${_renderAba(abaAtiva)}</div>
        </div>

        <!-- Rodapé -->
        <div class="journal-footer">
          <span class="journal-footer-text">Corvan · Guardião dos Minérios e da História</span>
        </div>

      </div>`;
  }


  function coletar(id) {
    try {
      const raw  = localStorage.getItem('mineralis_save_v2');
      const save = raw ? JSON.parse(raw) : {};
      if (!save.coletados) save.coletados = {};
      if (!save.coletados[id]) {
        save.coletados[id] = true;
        localStorage.setItem('mineralis_save_v2', JSON.stringify(save));
        console.info(`[Journal] Item coletado: ${id}`);
      }
    } catch { console.warn('[Journal] Erro ao salvar item.'); }
  }

  return { abrir, fechar, coletar };

})();
