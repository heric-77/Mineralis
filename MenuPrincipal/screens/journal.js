const Journal = (() => {

  let abaAtiva = 'minerios';
  let overlay  = null;

  const ITENS = {
    ferramentas: [
      // ── América do Sul (Fases 1.x) ──
      { id:'picareta_basica',       nome:'Picareta Básica',         fase:'1.1', desc:'Ferramenta essencial para quebrar rochas sedimentares e extrair minérios das paredes.' },
      { id:'lanterna',              nome:'Lanterna',                fase:'1.1', desc:'Ilumina túneis e cavernas, revelando veios metálicos nas sombras. Essencial nas minas de Potosí.' },
      { id:'pa_exploradora',        nome:'Pá Exploradora',          fase:'1.2', desc:'Ideal para escavar solo aluvial amazônico e encontrar fragmentos de cerâmica enterrados.' },
      { id:'bateia',                nome:'Bateia',                  fase:'1.2', desc:'Usada para garimpar ouro em rios. Separa o minério pesado do sedimento leve.' },
      { id:'pedra_constelacao',     nome:'Pedra da Constelação',    fase:'1.3', desc:'Peça da constelação do Condor usada para alinhar o painel astronômico Inca em Machu Picchu.' },
      // ── América do Norte (Fases 2.x) ──
      { id:'pedra_de_toque',        nome:'Pedra de Toque',          fase:'2.1', desc:'Pedra usada para testar ouro: traço dourado = ouro puro; traço esverdeado = pirita.' },
      { id:'picareta_industrial',   nome:'Picareta Industrial',     fase:'2.2', desc:'Mais pesada e robusta. Penetra camadas de xisto e carvão compactado nos Apalaches.' },
      { id:'lampada_davy',          nome:'Lâmpada de Davy',         fase:'2.2', desc:'Lâmpada de segurança que detecta gás metano nas minas de carvão. Inventada em 1815.' },
      { id:'maco_pedra',            nome:'Maço de Pedra',           fase:'2.3', desc:'Seixo pesado dos Anishinaabe. Usado para extrair cobre nativo por percussão a frio.' },
      { id:'martelo_pedra',         nome:'Martelo de Pedra',        fase:'2.3', desc:'Menor e preciso. Identifica cobre (dobra) de calcita (estilhaça) pelo martelamento.' },
      { id:'escopro_cobre',         nome:'Escopro de Cobre',        fase:'2.3', desc:'Forjado por cold hammering — martelamento a frio. Endurece o cobre sem precisar de fogo.' },
      // ── Europa (Fases 3.x) ──
      { id:'talhadeira',            nome:'Talhadeira de Madeira',   fase:'3.1', desc:'Ferramenta clássica para clivar blocos de sal sem fragmentá-los nas minas de Wieliczka.' },
      { id:'corda_de_poco',         nome:'Corda de Poço',           fase:'3.1', desc:'Usada para descer e subir entre os níveis da mina de sal. Substitui a escada.' },
      { id:'lampada_de_sal',        nome:'Lâmpada de Sal',          fase:'3.1', desc:'Bloco de halita rosa aquecido que emite brilho avermelhado. Iluminação milenar dos mineiros.' },
      { id:'ferrao_sondagem',       nome:'Ferrão de Sondagem',      fase:'3.2', desc:'Vara longa com ponta dura para sondar o fundo lodoso dos pântanos sem afundar.' },
      { id:'cesto_vime',            nome:'Cesto de Vime',           fase:'3.2', desc:'Cesto leve para carregar nódulos de limonita. Mantém as amostras separadas da lama.' },
      { id:'cristal_islandia',      nome:'Cristal de Islândia',     fase:'3.2', desc:'Espato solar de calcita birrefringente. Vikings o usavam para localizar o sol em dias nublados.' },
      { id:'picareta_calcario_item',nome:'Picareta de Calcário',    fase:'3.3', desc:'Adaptada para rocha sedimentar calcária. Mais leve que a industrial, revela veias de cinábrio.' },
      { id:'tocha_alcatrao',        nome:'Tocha de Alcatrão',       fase:'3.3', desc:'A chama azuleja quando há vapor de mercúrio no ar. Único detector numa mina do séc. XVI.' },
      { id:'destilador_item',       nome:'Destilador de Cornue',    fase:'3.3', desc:'Recipiente alquímico em forma de pera. Ao aquecer cinábrio, condensa mercúrio puro.' },
      // ── África (Fases 4.x) ──
      { id:'picareta_kimberlito',   nome:'Picareta de Kimberlito',  fase:'4.1', desc:'Projetada para perfurar kimberlito — a rocha vulcânica onde os diamantes se formam.' },
      { id:'peneira_classificacao', nome:'Peneira de Classificação', fase:'4.1', desc:'Separa diamantes brutos por tamanho e remove o kimberlito pulverizado.' },
      { id:'lupa_lapidario',        nome:'Lupa de Lapidário (10x)',  fase:'4.1', desc:'Permite identificar inclusões, clivagem e qualidade do diamante bruto.' },
      { id:'bateia_madeira',        nome:'Bateia de Madeira',        fase:'4.2', desc:'Bateia leve de madeira de mopane usada pelos povos Shona para garimpar ouro aluvial.' },
      { id:'calabaca_agua',         nome:'Calabaça de Água',         fase:'4.2', desc:'Recipiente natural para controlar o fluxo de água na bateia durante o garimpo.' },
      { id:'bastao_sombra',         nome:'Bastão de Sombra Shona',   fase:'4.2', desc:'Bastão fincado no solo para ler a sombra e orientar o garimpo. Astronomia a serviço da mineração.' },
      { id:'machado_item',          nome:'Machado Tuaregue',          fase:'4.3', desc:'Golpe horizontal para separar lajes de sal. Os Tuaregues extraem assim há séculos no Saara.' },
      { id:'balanca_item',          nome:'Balança de Bronze',         fase:'4.3', desc:'Mercadores de Timbuktu pesavam ouro em pó. A moeda era o peso, não a forma.' },
      { id:'astrolabio_item',       nome:'Astrolábio de Latão',       fase:'4.3', desc:'Instrumento islâmico do séc. XIV. Mede altitude do sol e determina o norte.' },
      // ── Ásia / Oceania (Fases 5.x – 6.x — a implementar) ──
      { id:'sonar_geologico',       nome:'Sonar Geológico',           fase:'5.2', desc:'Tecnologia moderna para localizar reservatórios de petróleo e gás em subsolo.' },
      { id:'escafandro',            nome:'Escafandro',                 fase:'6.3', desc:'Equipamento de mergulho para explorar recifes e leitos oceânicos em busca de pérolas.' },
    ],
    minerios: [
      // ── América do Sul (Fases 1.x) ──
      { id:'prata',            nome:'Prata',                fase:'1.1', desc:'Metal precioso extraído nos Andes. Usado pelo Império Inca como arte e símbolo lunar — nunca como moeda.' },
      { id:'estanho',          nome:'Estanho',              fase:'1.1', desc:'Mineral metálico encontrado junto à prata em Potosí. Essencial para a fabricação de bronze.' },
      { id:'ouro_aluvial',     nome:'Ouro Aluvial',         fase:'1.2', desc:'Pepitas de ouro depositadas em leitos de rios pela erosão. Base da corrida do ouro na Amazônia.' },
      { id:'tumi_dourado',     nome:'Ouro Inca',            fase:'1.3', desc:'Para os Incas, o ouro era o sol materializado. Não era moeda — era divindade e arte.' },
      // ── América do Norte (Fases 2.x) ──
      { id:'ouro_pepita',      nome:'Ouro (Pepita)',        fase:'2.1', desc:'Pepitas auríferas da Sierra Nevada. Um grama pode ser esticado em 3 km de fio.' },
      { id:'quartzo_aureo',    nome:'Quartzo Aurífero',     fase:'2.1', desc:'Veios brancos de quartzo com motas douradas da Mother Lode. O ouro se infiltrou há 120 milhões de anos.' },
      { id:'lignito',          nome:'Lignito',              fase:'2.2', desc:'Carvão marrom-escuro e opaco. Menor poder calorífico. Primeira etapa da carvonificação.' },
      { id:'carvao_betuminoso',nome:'Carvão Betuminoso',    fase:'2.2', desc:'Carvão preto com leve brilho. Combustível da Revolução Industrial americana.' },
      { id:'antracito',        nome:'Antracito',            fase:'2.2', desc:'Carvão preto brilhante quase espelhado. Maior grau de carvonificação e poder calorífico.' },
      { id:'cobre_nativo',     nome:'Cobre Nativo',         fase:'2.3', desc:'Cobre puro em estado natural, sem fundição. Tradição Anishinaabe de 7.000 anos no Lago Superior.' },
      // ── Europa (Fases 3.x) ──
      { id:'halita_cubica',    nome:'Halita Cúbica',        fase:'3.1', desc:'Sal-gema em clivagem cúbica perfeita. Extraída nas minas de Wieliczka há mais de 700 anos.' },
      { id:'halita_tabular',   nome:'Halita Tabular',       fase:'3.1', desc:'Sal-gema em forma de placa tabular. Evidência das condições de pressão na evaporação dos mares.' },
      { id:'halita_prismatica',nome:'Halita Prismática',    fase:'3.1', desc:'Sal-gema em cristal prismático. Cada forma revela uma história diferente de formação geológica.' },
      { id:'limonita',         nome:'Limonita / Goetita',   fase:'3.2', desc:'Ferro de pântano: hidróxido de ferro formado por bactérias. Base da metalurgia Viking.' },
      { id:'cinabrio',         nome:'Cinábrio (HgS)',        fase:'3.3', desc:'Sulfeto de mercúrio escarlate. Densidade 8,1 g/cm³. Usado como pigmento vermilhão desde Roma.' },
      // ── África (Fases 4.x) ──
      { id:'diamante_pequeno', nome:'Diamante Bruto (P)',   fase:'4.1', desc:'Diamante bruto pequeno extraído do kimberlito. Formado há 3 bilhões de anos nas profundezas da Terra.' },
      { id:'diamante_medio',   nome:'Diamante Bruto (M)',   fase:'4.1', desc:'Diamante bruto médio. O mineral natural mais duro do planeta, classificado 10 na escala Mohs.' },
      { id:'diamante_grande',  nome:'Diamante Bruto (G)',   fase:'4.1', desc:'Diamante bruto raro e valioso. Uma descoberta excepcional nas minas de kimberlito do Botswana.' },
      { id:'quartzo_aurifero', nome:'Quartzo Aurífero',     fase:'4.2', desc:'Quartzo branco com inclusões douradas. Diferente da mica: mais pesado e não se parte em lâminas.' },
      { id:'mica_dourada',     nome:'Mica Dourada',         fase:'4.2', desc:'Biotita ou muscovita em flocos brilhantes. O "ouro de tolo" africano — confunde garimpeiros.' },
      { id:'halita',           nome:'Halita Saariana (Sal)',fase:'4.3', desc:'Sal-gema de Taoudenni — 700 km no Saara. Em Timbuktu (séc. XIV) valia o mesmo que ouro.' },
      // ── Ásia / Oceania (a implementar) ──
      { id:'jade',             nome:'Jade',                 fase:'5.1', desc:'Pedra semipreciosa sagrada na China antiga. Símbolo de virtude, poder e imortalidade.' },
      { id:'petroleo',         nome:'Petróleo',             fase:'5.2', desc:'Recurso fóssil formado em milhões de anos. Transformou a geopolítica global no séc. XX.' },
      { id:'opal',             nome:'Opala',                fase:'6.1', desc:'Gema única do Outback australiano com jogo de cores. Formada por sílica hidratada.' },
    ],
    artefatos: [
      // ── América do Sul (Fases 1.x) ──
      { id:'ceramica_inca',    nome:'Cerâmica Inca',           fase:'1.1', desc:'Vasilha cerimonial com padrões geométricos. Usada em rituais do Império Inca em Potosí.' },
      { id:'tupu_prata',       nome:'Tupu de Prata',           fase:'1.1', desc:'Fivela ornamental da nobreza Inca em prata pura. Para os Incas, a prata era arte — não moeda.' },
      { id:'vaso_amazônico',   nome:'Urna Marajoara',          fase:'1.2', desc:'Cerâmica funerária da Ilha de Marajó (400–1300 d.C.). Evidência de civilizações amazônicas avançadas.' },
      { id:'relevo_inca',      nome:'Tumi — Faca Cerimonial',  fase:'1.3', desc:'Faca ritual Inca de ouro, prata e turquesa. Usada em oferendas ao deus sol — Inti.' },
      // ── América do Norte (Fases 2.x) ──
      { id:'placa_reivindicacao',nome:'Placa de Reivindicação',fase:'2.1', desc:'Plaqueta de madeira com coordenadas do "claim" do garimpeiro. Base do sistema legal da Corrida do Ouro.' },
      { id:'cracha_breaker_boy', nome:'Crachá de Breaker Boy', fase:'2.2', desc:'Chapa metálica amassada com número de um trabalhador infantil nas minas de carvão dos Apalaches.' },
      { id:'gorget_cobre',     nome:'Gorget de Cobre',         fase:'2.3', desc:'Ornamento peitoral Anishinaabe polido. Comercializado do Lago Superior à Flórida há 7.000 anos.' },
      // ── Europa (Fases 3.x) ──
      { id:'insignia_guilda',  nome:'Insígnia da Guilda de Sal',fase:'3.1', desc:'Brasão da Guilda dos Mineiros de Wieliczka. Dois blocos de sal cruzados em forma de escudo.' },
      { id:'amuleto_mjolnir',  nome:'Amuleto de Mjölnir',      fase:'3.2', desc:'Pingente de ferro em forma do martelo de Thor. Objeto de proteção e identidade Viking.' },
      { id:'frasco_mercurio',  nome:'Frasco de Mercúrio',       fase:'3.3', desc:'Vidro soprado com mercúrio puro. Percorreu 10.000 km de Almadén (Espanha) a Potosí (Bolívia).' },
      // ── África (Fases 4.x) ──
      { id:'contrato_trabalho',nome:'Contrato de Trabalho',    fase:'4.1', desc:'Contrato migratório das minas de diamante do Botswana. Evidência do sistema de trabalho colonial.' },
      { id:'passaro_esteatita',nome:'Pássaro de Esteatita',    fase:'4.2', desc:'Escultura Shona em pedra-sabão do Grande Zimbábue. Símbolo nacional do Zimbábue atual.' },
      { id:'manuscrito_item',  nome:'Manuscrito de Timbuktu',  fase:'4.3', desc:'Manuscrito árabe do séc. XIV sobre mineralogia. Um dos 700.000 manuscritos da cidade dourada.' },
      // ── Ásia / Oceania (a implementar) ──
      { id:'jade_escultura',   nome:'Escultura de Jade',       fase:'5.1', desc:'Dragão esculpido em jade branco. Símbolo imperial da Dinastia Han, 200 a.C.' },
      { id:'pearl_aboriginal', nome:'Colar Aborigene',         fase:'6.1', desc:'Colar de pedras e sementes sagradas. Pertenceu a um ancião da tribo Wangkathaa.' },
    ],
  };

  const ICONES = {
    // ── FERRAMENTAS ──────────────────────────────────────────────────
    picareta_basica:       `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="2" y="10" width="14" height="2" fill="#7a4818"/><rect x="2" y="11" width="1" height="8" fill="#7a4818"/><rect x="2" y="8" width="10" height="4" fill="#888"/><rect x="10" y="6" width="3" height="4" fill="#aaa"/><rect x="11" y="5" width="2" height="2" fill="#ccc"/></svg>`,
    lanterna:              `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="9" y="3" width="6" height="2" fill="#c8a020"/><rect x="8" y="5" width="8" height="10" fill="#c8a020"/><rect x="9" y="6" width="6" height="8" fill="#f0e060"/><rect x="7" y="15" width="10" height="2" fill="#806010"/><rect x="9" y="17" width="6" height="3" fill="#c8a020"/><rect x="10" y="7" width="4" height="4" fill="#fff" opacity="0.5"/></svg>`,
    pa_exploradora:        `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="10" y="2" width="4" height="12" fill="#888"/><rect x="9" y="12" width="6" height="4" fill="#aaa"/><rect x="11" y="4" width="2" height="16" fill="#7a4818"/></svg>`,
    bateia:                `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="3" y="10" width="18" height="3" fill="#8b6835"/><rect x="5" y="13" width="14" height="2" fill="#a07840"/><rect x="7" y="15" width="10" height="2" fill="#8b6835"/><rect x="9" y="17" width="6" height="2" fill="#7a5728"/><rect x="8" y="11" width="2" height="2" fill="#ffd700"/><rect x="14" y="12" width="2" height="1" fill="#ffd700"/></svg>`,
    pedra_constelacao:     `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="10" y="3" width="4" height="2" fill="#88aadd"/><rect x="8" y="5" width="8" height="2" fill="#aaccff"/><rect x="7" y="7" width="10" height="6" fill="#88aadd"/><rect x="9" y="13" width="6" height="4" fill="#6688cc"/><rect x="11" y="17" width="2" height="2" fill="#4466aa"/><rect x="10" y="6" width="2" height="2" fill="#fff" opacity="0.7"/></svg>`,
    pedra_de_toque:        `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="5" y="6" width="14" height="12" fill="#1a1a2a"/><rect x="6" y="7" width="12" height="10" fill="#2a2a3a"/><rect x="8" y="9" width="4" height="2" fill="#ffd700" opacity="0.6"/><rect x="14" y="12" width="3" height="2" fill="#555"/><rect x="7" y="14" width="4" height="1" fill="#333"/></svg>`,
    picareta_industrial:   `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="2" y="10" width="15" height="2" fill="#5a3810"/><rect x="2" y="11" width="1" height="8" fill="#5a3810"/><rect x="2" y="7" width="12" height="5" fill="#444"/><rect x="12" y="5" width="4" height="5" fill="#666"/><rect x="14" y="4" width="2" height="3" fill="#888"/></svg>`,
    lampada_davy:          `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="9" y="4" width="6" height="2" fill="#888"/><rect x="8" y="6" width="8" height="10" fill="#aaa"/><rect x="9" y="7" width="6" height="8" fill="#ffe080" opacity="0.6"/><rect x="7" y="16" width="10" height="2" fill="#666"/><rect x="10" y="18" width="4" height="2" fill="#888"/><rect x="11" y="5" width="2" height="2" fill="#ccc"/></svg>`,
    maco_pedra:            `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="4" y="8" width="12" height="8" fill="#7a7060"/><rect x="5" y="9" width="10" height="6" fill="#9a9080"/><rect x="10" y="16" width="4" height="6" fill="#6a5840"/><rect x="6" y="10" width="4" height="2" fill="#aaa090"/></svg>`,
    martelo_pedra:         `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="6" y="8" width="8" height="6" fill="#7a7060"/><rect x="7" y="9" width="6" height="4" fill="#9a9080"/><rect x="9" y="14" width="3" height="7" fill="#6a5840"/><rect x="7" y="10" width="3" height="2" fill="#aaa090"/></svg>`,
    escopro_cobre:         `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="10" y="3" width="4" height="14" fill="#b87333"/><rect x="11" y="4" width="2" height="12" fill="#cd8a3a"/><rect x="9" y="17" width="6" height="3" fill="#8a5520"/><rect x="8" y="16" width="8" height="2" fill="#9a6530"/></svg>`,
    talhadeira:            `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="10" y="3" width="4" height="16" fill="#8b6835"/><rect x="11" y="4" width="2" height="14" fill="#a07840"/><rect x="8" y="19" width="8" height="2" fill="#6a5028"/><rect x="9" y="2" width="6" height="3" fill="#aaa"/></svg>`,
    corda_de_poco:         `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="8" y="4" width="2" height="16" fill="#c8a060"/><rect x="14" y="4" width="2" height="16" fill="#c8a060"/><rect x="8" y="5" width="8" height="2" fill="#a87840"/><rect x="8" y="9" width="8" height="2" fill="#a87840"/><rect x="8" y="13" width="8" height="2" fill="#a87840"/><rect x="8" y="17" width="8" height="2" fill="#a87840"/></svg>`,
    lampada_de_sal:        `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="9" y="3" width="6" height="12" fill="#f08878"/><rect x="10" y="4" width="4" height="10" fill="#f8a898"/><rect x="7" y="15" width="10" height="3" fill="#a05040"/><rect x="10" y="18" width="4" height="3" fill="#c06050"/><rect x="8" y="7" width="2" height="2" fill="#fff" opacity="0.4"/></svg>`,
    ferrao_sondagem:       `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="11" y="2" width="2" height="20" fill="#8b6835"/><rect x="10" y="20" width="4" height="2" fill="#555"/><rect x="9" y="3" width="2" height="4" fill="#a07840"/><rect x="13" y="3" width="2" height="4" fill="#a07840"/></svg>`,
    cesto_vime:            `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="4" y="10" width="16" height="10" fill="#a07840"/><rect x="5" y="11" width="14" height="8" fill="#c09858"/><rect x="4" y="8" width="16" height="2" fill="#8b6835"/><rect x="6" y="12" width="2" height="6" fill="#8b6835"/><rect x="10" y="12" width="2" height="6" fill="#8b6835"/><rect x="14" y="12" width="2" height="6" fill="#8b6835"/><rect x="8" y="10" width="8" height="2" fill="#7a5728"/></svg>`,
    cristal_islandia:      `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="10" y="3" width="4" height="4" fill="#d0e8ff"/><rect x="8" y="7" width="8" height="8" fill="#b8d8f8"/><rect x="9" y="15" width="6" height="4" fill="#90b8e0"/><rect x="11" y="4" width="2" height="2" fill="#fff"/><rect x="9" y="9" width="3" height="3" fill="#fff" opacity="0.5"/><rect x="13" y="11" width="2" height="2" fill="#e0f0ff" opacity="0.7"/></svg>`,
    picareta_calcario_item:`<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="2" y="10" width="14" height="2" fill="#8a6838"/><rect x="2" y="11" width="1" height="8" fill="#8a6838"/><rect x="2" y="8" width="10" height="4" fill="#bbb"/><rect x="10" y="6" width="3" height="4" fill="#ddd"/><rect x="11" y="5" width="2" height="2" fill="#eee"/><rect x="14" y="9" width="4" height="2" fill="#bbb"/></svg>`,
    tocha_alcatrao:        `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="10" y="14" width="4" height="8" fill="#5a3810"/><rect x="9" y="8" width="6" height="8" fill="#cc4400"/><rect x="10" y="4" width="4" height="6" fill="#ff8800"/><rect x="11" y="3" width="2" height="4" fill="#ffdd00"/><rect x="10" y="5" width="2" height="3" fill="#fff" opacity="0.3"/></svg>`,
    destilador_item:       `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="10" y="3" width="4" height="2" fill="#aaa"/><rect x="8" y="5" width="8" height="10" fill="#88aacc" opacity="0.7"/><rect x="7" y="7" width="10" height="6" fill="#aaccee" opacity="0.5"/><rect x="9" y="15" width="6" height="2" fill="#777"/><rect x="11" y="17" width="2" height="4" fill="#666"/><rect x="10" y="20" width="4" height="2" fill="#444"/><rect x="10" y="8" width="3" height="3" fill="#fff" opacity="0.3"/></svg>`,
    picareta_kimberlito:   `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="2" y="10" width="14" height="2" fill="#6a4018"/><rect x="2" y="11" width="1" height="8" fill="#6a4018"/><rect x="2" y="7" width="11" height="5" fill="#777"/><rect x="11" y="5" width="3" height="5" fill="#999"/><rect x="12" y="4" width="2" height="3" fill="#bbb"/><rect x="15" y="9" width="5" height="2" fill="#888"/></svg>`,
    peneira_classificacao: `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="3" y="6" width="18" height="2" fill="#888"/><rect x="4" y="8" width="16" height="10" fill="#666" opacity="0.3"/><rect x="5" y="9" width="2" height="8" fill="#888"/><rect x="9" y="9" width="2" height="8" fill="#888"/><rect x="13" y="9" width="2" height="8" fill="#888"/><rect x="17" y="9" width="2" height="8" fill="#888"/><rect x="4" y="14" width="16" height="2" fill="#888"/><rect x="3" y="18" width="18" height="2" fill="#777"/></svg>`,
    lupa_lapidario:        `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="6" y="4" width="10" height="10" fill="none" stroke="#888" stroke-width="2"/><rect x="7" y="5" width="8" height="8" fill="#88ccff" opacity="0.4"/><rect x="14" y="14" width="2" height="6" fill="#7a4818" transform="rotate(45 14 14)"/><rect x="9" y="7" width="3" height="3" fill="#fff" opacity="0.5"/></svg>`,
    bateia_madeira:        `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="3" y="10" width="18" height="3" fill="#6b4513"/><rect x="5" y="13" width="14" height="2" fill="#8b5a30"/><rect x="7" y="15" width="10" height="2" fill="#6b4513"/><rect x="9" y="17" width="6" height="2" fill="#5a3810"/><rect x="8" y="11" width="2" height="2" fill="#ffd700"/></svg>`,
    calabaca_agua:         `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="10" y="3" width="4" height="2" fill="#6a8830"/><rect x="9" y="5" width="6" height="2" fill="#8aaa48"/><rect x="7" y="7" width="10" height="10" fill="#8aaa48"/><rect x="8" y="8" width="8" height="8" fill="#aac860"/><rect x="9" y="17" width="6" height="3" fill="#6a8830"/><rect x="10" y="9" width="3" height="3" fill="#c8e880" opacity="0.5"/></svg>`,
    bastao_sombra:         `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="11" y="2" width="2" height="18" fill="#8b6835"/><rect x="10" y="3" width="4" height="2" fill="#a07840"/><rect x="4" y="18" width="8" height="2" fill="#555" opacity="0.5"/><rect x="11" y="19" width="2" height="3" fill="#7a5828"/></svg>`,
    machado_item:          `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="3" y="8" width="8" height="8" fill="#7a7060"/><rect x="4" y="9" width="6" height="6" fill="#9a9080"/><rect x="11" y="11" width="10" height="2" fill="#8b6835"/><rect x="5" y="10" width="4" height="2" fill="#aaa090"/></svg>`,
    balanca_item:          `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="11" y="3" width="2" height="4" fill="#8a7030"/><rect x="4" y="7" width="16" height="2" fill="#c8a020"/><rect x="4" y="9" width="6" height="6" fill="#b87020" opacity="0.5"/><rect x="14" y="9" width="6" height="6" fill="#b87020" opacity="0.5"/><rect x="3" y="15" width="8" height="2" fill="#9a8018"/><rect x="13" y="15" width="8" height="2" fill="#9a8018"/><rect x="10" y="19" width="4" height="2" fill="#7a6010"/></svg>`,
    astrolabio_item:       `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="7" y="7" width="10" height="10" fill="#c8a020" opacity="0.3"/><rect x="8" y="8" width="8" height="8" fill="#e0b830" opacity="0.4"/><rect x="11" y="4" width="2" height="16" fill="#a08018" opacity="0.6"/><rect x="4" y="11" width="16" height="2" fill="#a08018" opacity="0.6"/><rect x="10" y="10" width="4" height="4" fill="#ffd700"/><rect x="11" y="3" width="2" height="2" fill="#888"/></svg>`,
    sonar_geologico:       `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="8" y="4" width="8" height="6" fill="#2a5a8a"/><rect x="9" y="5" width="6" height="4" fill="#3a7aaa"/><rect x="11" y="3" width="2" height="2" fill="#888"/><rect x="6" y="10" width="12" height="8" fill="#1a3a5a"/><rect x="7" y="11" width="10" height="6" fill="#4a9aff" opacity="0.4"/><rect x="10" y="14" width="4" height="1" fill="#4aff4a"/></svg>`,
    escafandro:            `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="7" y="3" width="10" height="10" fill="#2a5a8a"/><rect x="8" y="4" width="8" height="8" fill="#3a7aaa"/><rect x="9" y="5" width="6" height="6" fill="#88ccff" opacity="0.5"/><rect x="5" y="8" width="3" height="4" fill="#888"/><rect x="16" y="8" width="3" height="4" fill="#888"/><rect x="9" y="13" width="6" height="4" fill="#2a5a8a"/></svg>`,
    // ── MINÉRIOS ─────────────────────────────────────────────────────
    prata:               `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="8" y="6" width="8" height="12" fill="#aaa"/><rect x="7" y="8" width="10" height="8" fill="#ccc"/><rect x="9" y="7" width="6" height="10" fill="#bbb"/><rect x="10" y="6" width="4" height="2" fill="#ddd"/><rect x="9" y="9" width="2" height="2" fill="#eee"/></svg>`,
    estanho:             `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="7" y="7" width="10" height="10" fill="#8a9aaa"/><rect x="8" y="8" width="8" height="8" fill="#aabbc0"/><rect x="9" y="9" width="3" height="3" fill="#c0ccd0"/><rect x="6" y="9" width="2" height="6" fill="#7a8a9a"/><rect x="16" y="9" width="2" height="6" fill="#7a8a9a"/></svg>`,
    ouro_aluvial:        `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="9" y="8" width="6" height="6" fill="#ffd700"/><rect x="8" y="9" width="8" height="6" fill="#ffcc00"/><rect x="10" y="7" width="4" height="2" fill="#ffe060"/><rect x="7" y="10" width="2" height="4" fill="#cc9900"/><rect x="15" y="10" width="2" height="4" fill="#cc9900"/></svg>`,
    tumi_dourado:        `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="9" y="6" width="8" height="6" fill="#ffd700"/><rect x="10" y="7" width="6" height="4" fill="#ffe060"/><rect x="8" y="8" width="2" height="4" fill="#cc9900"/><rect x="12" y="4" width="2" height="4" fill="#ffaa00"/><rect x="10" y="12" width="4" height="8" fill="#cc8800"/></svg>`,
    ouro_pepita:         `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="8" y="8" width="8" height="8" fill="#ffd700"/><rect x="9" y="7" width="6" height="10" fill="#ffcc00"/><rect x="7" y="10" width="10" height="4" fill="#ffe060"/><rect x="9" y="9" width="3" height="3" fill="#fff176"/></svg>`,
    quartzo_aureo:       `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="10" y="4" width="4" height="4" fill="#e8f0ff"/><rect x="8" y="8" width="8" height="8" fill="#d0d8ee"/><rect x="9" y="16" width="6" height="4" fill="#b8c0da"/><rect x="11" y="5" width="2" height="2" fill="#fff"/><rect x="12" y="10" width="3" height="2" fill="#ffd700" opacity="0.7"/></svg>`,
    lignito:             `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="6" y="8" width="12" height="8" fill="#4a3818"/><rect x="7" y="9" width="10" height="6" fill="#5a4828"/><rect x="8" y="10" width="4" height="3" fill="#6a5838"/></svg>`,
    carvao_betuminoso:   `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="6" y="7" width="12" height="10" fill="#1a1a1a"/><rect x="7" y="8" width="10" height="8" fill="#2a2a2a"/><rect x="8" y="9" width="3" height="3" fill="#3a3a3a"/><rect x="13" y="12" width="3" height="2" fill="#3a3a3a"/></svg>`,
    antracito:           `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="6" y="7" width="12" height="10" fill="#0a0a0a"/><rect x="7" y="8" width="10" height="8" fill="#1a1a2a"/><rect x="8" y="9" width="4" height="3" fill="#2a2a4a"/><rect x="10" y="10" width="3" height="2" fill="#4a4a6a" opacity="0.8"/><rect x="13" y="13" width="3" height="2" fill="#3a3a5a" opacity="0.8"/></svg>`,
    cobre_nativo:        `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="7" y="7" width="10" height="10" fill="#b87333"/><rect x="8" y="8" width="8" height="8" fill="#cd8a3a"/><rect x="9" y="9" width="3" height="3" fill="#e8a050"/><rect x="6" y="9" width="2" height="6" fill="#a06020"/><rect x="10" y="8" width="2" height="2" fill="#ffa040"/></svg>`,
    halita_cubica:       `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="6" y="6" width="12" height="12" fill="#e8e8f8"/><rect x="7" y="7" width="10" height="10" fill="#f0f0ff"/><rect x="8" y="8" width="8" height="8" fill="#fff"/><rect x="6" y="6" width="2" height="2" fill="#c0c0e0"/><rect x="16" y="6" width="2" height="2" fill="#c0c0e0"/></svg>`,
    halita_tabular:      `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="4" y="9" width="16" height="6" fill="#e8e8f8"/><rect x="5" y="10" width="14" height="4" fill="#f8f8ff"/><rect x="4" y="8" width="16" height="2" fill="#d0d0e8"/><rect x="4" y="15" width="16" height="2" fill="#d0d0e8"/></svg>`,
    halita_prismatica:   `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="10" y="3" width="4" height="4" fill="#e8e8f8"/><rect x="8" y="7" width="8" height="10" fill="#f0f0ff"/><rect x="9" y="17" width="6" height="4" fill="#d8d8f0"/><rect x="11" y="4" width="2" height="2" fill="#fff"/></svg>`,
    limonita:            `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="7" y="7" width="10" height="10" fill="#8b5a20"/><rect x="8" y="8" width="8" height="8" fill="#a07030"/><rect x="9" y="9" width="5" height="5" fill="#c08840"/><rect x="6" y="10" width="2" height="4" fill="#7a4810"/></svg>`,
    cinabrio:            `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="7" y="7" width="10" height="10" fill="#cc2010"/><rect x="8" y="8" width="8" height="8" fill="#dd3020"/><rect x="9" y="9" width="4" height="4" fill="#ee5040"/><rect x="6" y="9" width="2" height="6" fill="#aa1008"/><rect x="10" y="8" width="2" height="2" fill="#ff8070"/></svg>`,
    diamante_pequeno:    `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="10" y="6" width="4" height="2" fill="#e8f4ff"/><rect x="9" y="8" width="6" height="2" fill="#d0eeff"/><rect x="8" y="10" width="8" height="4" fill="#b8e0ff"/><rect x="9" y="14" width="6" height="3" fill="#88c8f8"/><rect x="11" y="17" width="2" height="1" fill="#60a8e0"/><rect x="11" y="8" width="2" height="2" fill="#fff"/></svg>`,
    diamante_medio:      `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="10" y="4" width="4" height="2" fill="#e8f4ff"/><rect x="8" y="6" width="8" height="2" fill="#d0eeff"/><rect x="7" y="8" width="10" height="6" fill="#b8e0ff"/><rect x="9" y="14" width="6" height="4" fill="#88c8f8"/><rect x="11" y="18" width="2" height="2" fill="#60a8e0"/><rect x="11" y="6" width="2" height="2" fill="#fff"/></svg>`,
    diamante_grande:     `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="9" y="3" width="6" height="2" fill="#e8f4ff"/><rect x="7" y="5" width="10" height="2" fill="#d0eeff"/><rect x="5" y="7" width="14" height="8" fill="#b8e0ff"/><rect x="7" y="15" width="10" height="4" fill="#88c8f8"/><rect x="10" y="19" width="4" height="2" fill="#60a8e0"/><rect x="10" y="5" width="4" height="2" fill="#fff"/><rect x="8" y="9" width="3" height="3" fill="#fff" opacity="0.6"/></svg>`,
    quartzo_aurifero:    `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="10" y="4" width="4" height="4" fill="#e8f0ff"/><rect x="8" y="8" width="8" height="8" fill="#d8e8ff"/><rect x="9" y="16" width="6" height="4" fill="#b8c8ee"/><rect x="11" y="5" width="2" height="2" fill="#fff"/><rect x="13" y="9" width="2" height="2" fill="#ffd700"/><rect x="9" y="13" width="2" height="2" fill="#ffd700" opacity="0.8"/></svg>`,
    mica_dourada:        `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="5" y="8" width="14" height="2" fill="#d4a830"/><rect x="6" y="11" width="12" height="2" fill="#e8c040"/><rect x="7" y="14" width="10" height="2" fill="#d4a830"/><rect x="8" y="7" width="8" height="1" fill="#c89820"/><rect x="6" y="16" width="4" height="1" fill="#b88018"/></svg>`,
    halita:              `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="6" y="7" width="12" height="10" fill="#f0f0f8"/><rect x="7" y="8" width="10" height="8" fill="#fff"/><rect x="8" y="9" width="8" height="6" fill="#e8e8f8"/><rect x="6" y="6" width="12" height="2" fill="#d8d8e8"/><rect x="6" y="17" width="12" height="2" fill="#d8d8e8"/></svg>`,
    jade:                `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="8" y="6" width="8" height="12" fill="#2a8a2a"/><rect x="9" y="7" width="6" height="10" fill="#3a9a3a"/><rect x="10" y="8" width="4" height="8" fill="#4aaa4a"/><rect x="11" y="6" width="2" height="2" fill="#5aca5a"/></svg>`,
    petroleo:            `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="9" y="8" width="6" height="8" fill="#0a0a0a"/><rect x="10" y="9" width="4" height="6" fill="#1a1a1a"/><rect x="11" y="6" width="2" height="4" fill="#555"/><rect x="10" y="5" width="4" height="2" fill="#444"/></svg>`,
    opal:                `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="8" y="7" width="8" height="10" fill="#aa88cc"/><rect x="9" y="8" width="6" height="8" fill="#bb99dd"/><rect x="10" y="9" width="4" height="6" fill="#ccaaee"/><rect x="11" y="7" width="2" height="2" fill="#ffaaff"/><rect x="9" y="11" width="2" height="2" fill="#aaffaa" opacity="0.7"/></svg>`,
    // ── ARTEFATOS ────────────────────────────────────────────────────
    ceramica_inca:       `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="8" y="6" width="8" height="2" fill="#8b4513"/><rect x="7" y="8" width="10" height="10" fill="#a0522d"/><rect x="8" y="9" width="8" height="8" fill="#8b4513"/><rect x="9" y="18" width="6" height="2" fill="#6b3510"/><rect x="9" y="10" width="2" height="2" fill="#5c2808"/><rect x="13" y="13" width="2" height="2" fill="#5c2808"/></svg>`,
    tupu_prata:          `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="10" y="3" width="4" height="4" fill="#c0c0d8"/><rect x="9" y="7" width="6" height="2" fill="#aaa"/><rect x="7" y="9" width="10" height="2" fill="#c0c0d8"/><rect x="9" y="11" width="6" height="2" fill="#aaa"/><rect x="10" y="13" width="4" height="6" fill="#c0c0d8"/><rect x="11" y="5" width="2" height="2" fill="#e0e0f0"/></svg>`,
    vaso_amazônico:      `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="9" y="5" width="6" height="2" fill="#8b4513"/><rect x="7" y="7" width="10" height="2" fill="#a0522d"/><rect x="6" y="9" width="12" height="8" fill="#8b4513"/><rect x="7" y="17" width="10" height="2" fill="#6b3510"/><rect x="8" y="10" width="2" height="2" fill="#5c2808"/><rect x="12" y="12" width="2" height="2" fill="#5c2808"/></svg>`,
    relevo_inca:         `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="5" y="6" width="14" height="12" fill="#c8a050"/><rect x="6" y="7" width="12" height="10" fill="#d8b060"/><rect x="9" y="9" width="6" height="3" fill="#a08030"/><rect x="8" y="13" width="8" height="2" fill="#a08030"/><rect x="10" y="8" width="2" height="2" fill="#6b3d1e"/></svg>`,
    placa_reivindicacao: `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="4" y="4" width="16" height="16" fill="#8b6835"/><rect x="5" y="5" width="14" height="14" fill="#a07840"/><rect x="6" y="7" width="12" height="1" fill="#6b4818"/><rect x="6" y="10" width="12" height="1" fill="#6b4818"/><rect x="6" y="13" width="8" height="1" fill="#6b4818"/><rect x="6" y="16" width="6" height="1" fill="#6b4818"/></svg>`,
    cracha_breaker_boy:  `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="5" y="6" width="14" height="12" fill="#555"/><rect x="6" y="7" width="12" height="10" fill="#666"/><rect x="9" y="9" width="6" height="2" fill="#888"/><rect x="8" y="12" width="8" height="1" fill="#777"/><rect x="10" y="14" width="4" height="1" fill="#777"/><rect x="11" y="4" width="2" height="4" fill="#888"/></svg>`,
    gorget_cobre:        `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="4" y="8" width="16" height="8" fill="#b87333"/><rect x="5" y="9" width="14" height="6" fill="#cd8a3a"/><rect x="6" y="10" width="12" height="4" fill="#b87333"/><rect x="7" y="11" width="10" height="2" fill="#e8a050" opacity="0.5"/><rect x="10" y="5" width="4" height="4" fill="#a06020"/></svg>`,
    insignia_guilda:     `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="6" y="4" width="12" height="14" fill="#888"/><rect x="7" y="5" width="10" height="12" fill="#aaa"/><rect x="8" y="7" width="3" height="3" fill="#fff"/><rect x="13" y="7" width="3" height="3" fill="#fff"/><rect x="9" y="12" width="6" height="3" fill="#e8e8f8"/><rect x="6" y="18" width="12" height="2" fill="#666"/></svg>`,
    amuleto_mjolnir:     `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="6" y="6" width="12" height="8" fill="#666"/><rect x="7" y="7" width="10" height="6" fill="#888"/><rect x="10" y="14" width="4" height="6" fill="#555"/><rect x="9" y="12" width="6" height="3" fill="#777"/><rect x="8" y="8" width="3" height="3" fill="#999"/></svg>`,
    frasco_mercurio:     `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="10" y="3" width="4" height="2" fill="#888"/><rect x="9" y="5" width="6" height="2" fill="#aaa"/><rect x="7" y="7" width="10" height="12" fill="#88aacc" opacity="0.7"/><rect x="8" y="8" width="8" height="10" fill="#aaccee" opacity="0.5"/><rect x="9" y="16" width="6" height="3" fill="#c0a020" opacity="0.8"/><rect x="10" y="9" width="4" height="4" fill="#fff" opacity="0.3"/></svg>`,
    contrato_trabalho:   `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="5" y="3" width="14" height="18" fill="#d4b483"/><rect x="6" y="4" width="12" height="16" fill="#e8c898"/><rect x="7" y="6" width="10" height="1" fill="#8b6020"/><rect x="7" y="9" width="10" height="1" fill="#8b6020"/><rect x="7" y="12" width="10" height="1" fill="#8b6020"/><rect x="7" y="15" width="6" height="1" fill="#8b6020"/><rect x="7" y="17" width="8" height="1" fill="#8b6020" opacity="0.5"/></svg>`,
    passaro_esteatita:   `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="8" y="6" width="8" height="6" fill="#9a9080"/><rect x="9" y="7" width="6" height="4" fill="#a8a090"/><rect x="7" y="9" width="2" height="4" fill="#888070"/><rect x="15" y="9" width="2" height="4" fill="#888070"/><rect x="10" y="12" width="4" height="6" fill="#9a9080"/><rect x="9" y="5" width="6" height="2" fill="#7a7060"/><rect x="11" y="4" width="2" height="2" fill="#6a6050"/></svg>`,
    manuscrito_item:     `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="4" y="3" width="16" height="18" fill="#d4a860"/><rect x="5" y="4" width="14" height="16" fill="#e8c080"/><rect x="6" y="6" width="12" height="1" fill="#8b5020"/><rect x="6" y="9" width="12" height="1" fill="#8b5020"/><rect x="6" y="12" width="12" height="1" fill="#8b5020"/><rect x="6" y="15" width="8" height="1" fill="#8b5020"/><rect x="14" y="12" width="4" height="4" fill="#c09030" opacity="0.6"/></svg>`,
    jade_escultura:      `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="9" y="5" width="6" height="4" fill="#2a8a2a"/><rect x="7" y="9" width="10" height="6" fill="#3a9a3a"/><rect x="8" y="15" width="8" height="4" fill="#2a8a2a"/><rect x="10" y="6" width="4" height="2" fill="#5aca5a"/></svg>`,
    pearl_aboriginal:    `<svg viewBox="0 0 24 24" shape-rendering="crispEdges"><rect x="6" y="11" width="2" height="2" fill="#e8d8c0"/><rect x="10" y="10" width="2" height="2" fill="#f0e0c8"/><rect x="14" y="11" width="2" height="2" fill="#e8d8c0"/><rect x="8" y="13" width="2" height="2" fill="#d8c8b0"/><rect x="12" y="13" width="2" height="2" fill="#e0d0b8"/><rect x="4" y="12" width="16" height="1" fill="#8b4513" opacity="0.5"/></svg>`,
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
