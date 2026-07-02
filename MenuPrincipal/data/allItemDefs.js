// ═══════════════════════════════════════════════════════════════════
// allItemDefs.js — Catálogo global de itens de TODAS as fases
// Carregado antes do script de cada fase para garantir que o
// Diário de Bordo exiba itens coletados em fases anteriores.
// ═══════════════════════════════════════════════════════════════════
window.ALL_ITEM_DEFS = {

  // ── FASE 1.1 — Potosí, Bolívia ──────────────────────────────────
  picareta_basica: {
    cat:'ferramenta', nome:'Picareta Básica', icon:'⛏', fase:'1.1',
    journalId:'picareta_basica',
    desc:'Extrai veios de prata e estanho das paredes.\nEssencial nas minas de Potosí.',
  },
  prata: {
    cat:'minerio', nome:'Prata', icon:'◆', fase:'1.1',
    journalId:'prata',
    desc:'Melhor condutor elétrico e térmico da natureza.\nUsada pelos Incas como arte e símbolo lunar.',
  },
  estanho: {
    cat:'minerio', nome:'Estanho', icon:'◈', fase:'1.1',
    journalId:'estanho',
    desc:'Liga-se ao cobre formando bronze desde 3.000 a.C.\nBolívia possui a 2ª maior reserva mundial.',
  },
  mapa_potosi: {
    cat:'artefato', nome:'Tupu de Prata', icon:'✦', fase:'1.1',
    journalId:'mapa_potosi',
    desc:'Fivela ornamental da nobreza Inca.\nA prata, para os Incas, era arte — não moeda.',
  },

  // ── FASE 1.2 — Serra Pelada, Brasil ─────────────────────────────
  bateia: {
    cat:'ferramenta', nome:'Bateia', icon:'🥌', fase:'1.2',
    journalId:'bateia',
    desc:'Separa ouro pesado do sedimento leve.\nUsada há 2.000 anos na Amazônia.',
  },
  pa_exploradora: {
    cat:'ferramenta', nome:'Pá Exploradora', icon:'🪏', fase:'1.2',
    journalId:'pa_exploradora',
    desc:'Escava solo aluvial amazônico.\nUsada para encontrar artefatos enterrados.',
  },
  ouro_aluvial: {
    cat:'minerio', nome:'Ouro Aluvial', icon:'💛', fase:'1.2',
    journalId:'ouro_aluvial',
    desc:'Depositado nos rios por erosão milenar.\nDensidade: 19,3 g/cm³ — 19× mais pesado que a água.',
  },
  vaso_amazônico: {
    cat:'artefato', nome:'Urna Marajoara', icon:'🏺', fase:'1.2',
    journalId:'vaso_amazônico',
    desc:'Cerâmica de 1.000 anos da Ilha de Marajó.\nEvidência de civilizações amazônicas avançadas.',
  },

  // ── FASE 1.3 — Machu Picchu, Peru ───────────────────────────────
  lanterna_arqueologa: {
    cat:'ferramenta', nome:'Lanterna', icon:'🔦', fase:'1.3',
    journalId:'lanterna_arqueologa',
    desc:'Ilumina a mina e revela símbolos ocultos.\nNecessária para abrir portões de pedra.',
  },
  pedra_constelacao: {
    cat:'artefato', nome:'Pedra da Constelação', icon:'💎', fase:'1.3',
    journalId:'pedra_constelacao',
    desc:'Peça da constelação do Condor.\nColete 3 para alinhar o painel astronômico.',
  },
  tumi_dourado: {
    cat:'artefato', nome:'Tumi de Ouro', icon:'🥇', fase:'1.3',
    journalId:'tumi_dourado',
    desc:'Faca ritual Inca de ouro, prata e turquesa.\nUsada em oferendas ao deus sol — Inti.',
  },
  relevo_inca: {
    cat:'artefato', nome:'Relevo Inca', icon:'🗿', fase:'1.3',
    journalId:'relevo_inca',
    desc:'Entalhado nas pedras de Machu Picchu.\nRegistra o conhecimento astronômico Inca.',
  },

  // ── FASE 2.1 — Sierra Nevada, EUA ───────────────────────────────
  pedra_de_toque: {
    cat:'ferramenta', nome:'Pedra de Toque', icon:'🪨', fase:'2.1',
    journalId:'pedra_de_toque',
    desc:'Usada por ensaiadores do século XIX.\nTraço dourado = ouro puro; esverdeado = pirita.',
  },
  ouro_pepita: {
    cat:'minerio', nome:'Ouro (Pepita)', icon:'◎', fase:'2.1',
    journalId:'ouro_pepita',
    desc:'1g de ouro pode formar um fio de 3km.\nFormado em fluidos hidrotermais há 120 mi de anos.',
  },
  quartzo_aureo: {
    cat:'minerio', nome:'Quartzo Aurífero', icon:'◈', fase:'2.1',
    journalId:'quartzo_aureo',
    desc:'Veios da Mother Lode — 200 km de quartzo.\nA erosão dos rios libera as pepitas.',
  },
  placa_reivindicacao: {
    cat:'artefato', nome:'Placa de Reivindicação', icon:'📋', fase:'2.1',
    journalId:'placa_reivindicacao',
    desc:'Registro legal do "claim" de um garimpeiro.\nInfluenciou a legislação dos EUA. Data de 1849.',
  },

  // ── FASE 2.2 — Apalaches, EUA ────────────────────────────────────
  picareta_industrial: {
    cat:'ferramenta', nome:'Picareta Industrial', icon:'⛏', fase:'2.2',
    journalId:'picareta_industrial',
    desc:'Mais pesada e robusta que a picareta básica.\nUsada nas minas de carvão dos Apalaches.',
  },
  lampada_davy: {
    cat:'ferramenta', nome:'Lâmpada de Davy', icon:'🏮', fase:'2.2',
    journalId:'lampada_davy',
    desc:'Criada por Humphry Davy em 1815.\nA malha metálica impede que a chama ignite o metano.',
  },
  lignito: {
    cat:'minerio', nome:'Lignito', icon:'🪨', fase:'2.2',
    journalId:'lignito',
    desc:'Carvão de baixo grau: ~25–35% de carbono.\nPrimeiro estágio de transformação vegetal em carvão.',
  },
  carvao_betuminoso: {
    cat:'minerio', nome:'Carvão Betuminoso', icon:'⬛', fase:'2.2',
    journalId:'carvao_betuminoso',
    desc:'Carvão de médio grau: ~45–86% de carbono.\nCombustível central da Revolução Industrial americana.',
  },
  antracito: {
    cat:'minerio', nome:'Antracito', icon:'💎', fase:'2.2',
    journalId:'antracito',
    desc:'O "diamante negro" — até 98% de carbono.\nMais valioso dos carvões dos Apalaches.',
  },
  xisto_carbonoso: {
    cat:'minerio', nome:'Xisto Carbonoso', icon:'🪨', fase:'2.2',
    journalId:'xisto_carbonoso',
    desc:'Rocha sedimentar que envolve o carvão.\nOs breaker boys separavam xisto de carvão nas usinas.',
  },
  cracha_breaker_boy: {
    cat:'artefato', nome:'Crachá de Breaker Boy', icon:'📛', fase:'2.2',
    journalId:'cracha_breaker_boy',
    desc:'Identificação de criança trabalhadora.\nMeninos de 8 anos separavam carvão 10h/dia.',
  },

  // ── FASE 2.3 — Michigan, EUA ─────────────────────────────────────
  maco_pedra: {
    cat:'ferramenta', nome:'Maço de Pedra', icon:'🪨', fase:'2.3',
    journalId:'maco_pedra',
    desc:'Seixo pesado dos Anishinaabe.\nUsado para extrair cobre por percussão a frio.',
  },
  martelo_pedra: {
    cat:'ferramenta', nome:'Martelo de Pedra', icon:'🪓', fase:'2.3',
    journalId:'martelo_pedra',
    desc:'Menor e preciso — para o Teste do Martelinho.\nIdentifica cobre (dobra) de calcita (estilhaça).',
  },
  escopro_cobre: {
    cat:'ferramenta', nome:'Escopro de Cobre', icon:'🔧', fase:'2.3',
    journalId:'escopro_cobre',
    desc:'Forjado por cold hammering — martelamento a frio.\nEndurece o cobre sem precisar de fogo.',
  },
  cobre_nativo: {
    cat:'minerio', nome:'Cobre Nativo', icon:'🟠', fase:'2.3',
    journalId:'cobre_nativo',
    desc:'Cobre puro — sem fundição.\nTradição Anishinaabe de 7.000 anos.',
  },
  gorget_cobre: {
    cat:'artefato', nome:'Gorget de Cobre', icon:'🌐', fase:'2.3',
    journalId:'gorget_cobre',
    desc:'Ornamento peitoral em cobre nativo.\nSímbolo de status e espiritualidade Anishinaabe.',
  },

  // ── FASE 3.1 — Rio Tinto, Espanha ────────────────────────────────
  talhadeira: {
    cat:'ferramenta', nome:'Talhadeira de Madeira', icon:'🪓', fase:'3.1',
    journalId:'talhadeira',
    desc:'Ferramenta medieval para clivar o sal em blocos.\nGolpe em ângulo reto produz arestas perfeitas.',
  },
  corda_de_poco: {
    cat:'ferramenta', nome:'Corda de Poço', icon:'🪢', fase:'3.1',
    journalId:'corda_de_poco',
    desc:'Usada para descer entre os níveis da mina.\nFabricada com fibras de cânhamo trançado.',
  },
  lampada_de_sal: {
    cat:'ferramenta', nome:'Lâmpada de Sal', icon:'🕯️', fase:'3.1',
    journalId:'lampada_de_sal',
    desc:'Bloco de halita rosada aquecido por uma vela.\nChama oscilando para baixo = excesso de vapor.',
  },
  halita_cubica: {
    cat:'minerio', nome:'Halita Cúbica', icon:'🧊', fase:'3.1',
    journalId:'halita_cubica',
    desc:'Sal-gema com clivagem cúbica perfeita — 3 planos a 90°.\nÚnico mineral consumido diretamente por humanos.',
  },
  halita_tabular: {
    cat:'minerio', nome:'Halita Tabular', icon:'◫', fase:'3.1',
    journalId:'halita_tabular',
    desc:'Cristais achatados em placas largas.\nResulta de crescimento lento em soluções diluídas.',
  },
  halita_prismatica: {
    cat:'minerio', nome:'Halita Prismática', icon:'💎', fase:'3.1',
    journalId:'halita_prismatica',
    desc:'Colunas hexagonais comprimidas.\nForma-se em evaporação rápida de salmoura concentrada.',
  },
  gipso: {
    cat:'minerio', nome:'Gipso (imitador)', icon:'⬜', fase:'3.1',
    journalId:'gipso',
    desc:'CaSO₄ — sulfato de cálcio branco.\nSimilar ao sal mas esfarela em pó ao ser golpeado.',
  },
  insignia_guilda: {
    cat:'artefato', nome:'Insígnia da Guilda', icon:'⚜️', fase:'3.1',
    journalId:'insignia_guilda',
    desc:'Marca de membro das guildas medievais de mineiros.\nGarantia direitos e proteção corporativa.',
  },

  // ── FASE 3.2 — Pântanos Vikings, Escandinávia ────────────────────
  ferrao_sondagem: {
    cat:'ferramenta', nome:'Ferrão de Sondagem', icon:'🎣', fase:'3.2',
    journalId:'ferrao_sondagem',
    desc:'Vara longa para sondar a lama antes de pisar.\nSom abafado: turfa mole. Som metálico: ferro.',
  },
  cesto_vime: {
    cat:'ferramenta', nome:'Cesto de Vime', icon:'🧺', fase:'3.2',
    journalId:'cesto_vime',
    desc:'Cesto leve para carregar nódulos de limonita.\nSimples mas essencial para coleta superficial.',
  },
  cristal_islandia: {
    cat:'ferramenta', nome:'Cristal de Islândia', icon:'🔷', fase:'3.2',
    journalId:'cristal_islandia',
    desc:'Espato solar de calcita birrefringente.\nAjudava a encontrar o sol em céu nublado.',
  },
  limonita: {
    cat:'minerio', nome:'Limonita / Goetita', icon:'🟤', fase:'3.2',
    journalId:'limonita',
    desc:'Ferro de pântano: hidróxido de ferro.\nDepósitos podiam se renovar em 20 a 50 anos.',
  },
  turfa_carbonizada: {
    cat:'minerio', nome:'Turfa Carbonizada', icon:'⬛', fase:'3.2',
    journalId:'turfa_carbonizada',
    desc:'Matéria orgânica escura dos pântanos.\nQuando carbonizada, alimentava forjas simples.',
  },
  pedra_afiar: {
    cat:'minerio', nome:'Pedra de Afiar', icon:'▰', fase:'3.2',
    journalId:'pedra_afiar',
    desc:'Arenito fino para polir e manter lâminas.\nSem afiar, o melhor ferro perde utilidade.',
  },
  amuleto_mjolnir: {
    cat:'artefato', nome:'Amuleto de Mjolnir', icon:'🔨', fase:'3.2',
    journalId:'amuleto_mjolnir',
    desc:'Pingente em forma do martelo de Thor.\nObjeto pessoal de proteção e identidade viking.',
  },

  // ── FASE 3.3 — Almadén, Espanha ──────────────────────────────────
  picareta_calcario_item: {
    cat:'ferramenta', nome:'Picareta de Calcário', icon:'⛏', fase:'3.3',
    journalId:'picareta_calcario_item',
    desc:'Adaptada para rocha sedimentar calcária.\nRevela veias de cinábrio com precisão.',
  },
  tocha_alcatrao: {
    cat:'ferramenta', nome:'Tocha de Alcatrão', icon:'🔥', fase:'3.3',
    journalId:'tocha_alcatrao',
    desc:'A chama reage ao vapor de mercúrio: azuleja quando há Hg.\nSeu único detector numa mina do séc. XVI.',
  },
  destilador_item: {
    cat:'ferramenta', nome:'Destilador de Cornue', icon:'🧪', fase:'3.3',
    journalId:'destilador_item',
    desc:'Recipiente alquímico de vidro em forma de pera.\nAo aquecer cinábrio, condensa mercúrio puro.',
  },
  cinabrio: {
    cat:'minerio', nome:'Cinábrio (HgS)', icon:'🔴', fase:'3.3',
    journalId:'cinabrio',
    desc:'Sulfeto de mercúrio escarlate.\nO mais belo e o mais tóxico — usado para amalgamar prata.',
  },
  frasco_mercurio: {
    cat:'artefato', nome:'Frasco de Mercúrio', icon:'⚗️', fase:'3.3',
    journalId:'frasco_mercurio',
    desc:'Frascos de cerâmica selados com mercúrio líquido.\nExportados de Almadén para as minas de Potosí.',
  },

  // ── FASE 4.1 — Kimberley, África do Sul ──────────────────────────
  picareta_kimberlito: {
    cat:'ferramenta', nome:'Picareta de Kimberlito', icon:'⛏️', fase:'4.1',
    journalId:'picareta_kimberlito',
    desc:'Cabo longo para trabalho em parede vertical.\nO kimberlito é rocha vulcânica densa; exige impacto forte.',
  },
  peneira_classificacao: {
    cat:'ferramenta', nome:'Peneira de Classificação', icon:'🪣', fase:'4.1',
    journalId:'peneira_classificacao',
    desc:'Malha de aço com furos calibrados.\nPrimeiro estágio de separação antes da Lupa.',
  },
  lupa_lapidario: {
    cat:'ferramenta', nome:'Lupa de Lapidário (10x)', icon:'🔍', fase:'4.1',
    journalId:'lupa_lapidario',
    desc:'Diamante: faces cristalinas com ângulos de 120°.\nQuartzo: faces hexagonais de 60°.',
  },
  diamante_pequeno: {
    cat:'minerio', nome:'Diamante Bruto (Pequeno)', icon:'💎', fase:'4.1',
    journalId:'diamante_pequeno',
    desc:'Cristal octoédrico de carbono puro — Mohs 10.\nFormado a 150 km de profundidade há bilhões de anos.',
  },
  diamante_medio: {
    cat:'minerio', nome:'Diamante Bruto (Médio)', icon:'💎', fase:'4.1',
    journalId:'diamante_medio',
    desc:'Diamante de tamanho mediano — visível a olho nu.\nO kimberlito azulado é sua embalagem vulcânica.',
  },
  diamante_grande: {
    cat:'minerio', nome:'Diamante Bruto (Grande)', icon:'💎', fase:'4.1',
    journalId:'diamante_grande',
    desc:'Diamante excepcional — muda a vida do garimpeiro.\nMas a De Beers ficava com o lucro real.',
  },
  quartzo_hialino: {
    cat:'minerio', nome:'Quartzo Hialino', icon:'◇', fase:'4.1',
    journalId:'quartzo_hialino',
    desc:'Quartzo translúcido — o "ouro de tolo" dos diamantes.\nFaces hexagonais de 60°, mais mole que o diamante.',
  },
  contrato_trabalho: {
    cat:'artefato', nome:'Contrato de Trabalho', icon:'📜', fase:'4.1',
    journalId:'contrato_trabalho',
    desc:'Documento que prendia trabalhadores às minas.\nO sistema de contratos era trabalho forçado legalizado.',
  },

  // ── FASE 4.2 — Zimbábue, África ───────────────────────────────────
  bateia_madeira: {
    cat:'ferramenta', nome:'Bateia de Madeira Curvada', icon:'🥣', fase:'4.2',
    journalId:'bateia_madeira',
    desc:'Bateia leve de madeira de mopane.\nUsada pelos Shona para separar ouro pesado da areia.',
  },
  calabaca_agua: {
    cat:'ferramenta', nome:'Calabaça de Água', icon:'💧', fase:'4.2',
    journalId:'calabaca_agua',
    desc:'Recipiente natural para controlar o fluxo na bateia.\nSubstitui mecanismos metálicos modernos.',
  },
  bastao_sombra: {
    cat:'ferramenta', nome:'Bastão de Sombra Shona', icon:'☀️', fase:'4.2',
    journalId:'bastao_sombra',
    desc:'Bastão fincado no solo para ler a sombra.\nFunciona como relógio solar e bússola no hemisfério sul.',
  },
  ouro_aluvial_zimbabue: {
    cat:'minerio', nome:'Ouro Aluvial (Zimbábue)', icon:'🟡', fase:'4.2',
    journalId:'ouro_aluvial_zimbabue',
    desc:'Pepitas e pó de ouro concentradas nos rios do planalto.\nVieram de veios de quartzo antigos, arredondadas pela água.',
  },
  quartzo_aurifero: {
    cat:'minerio', nome:'Quartzo Aurífero', icon:'◇', fase:'4.2',
    journalId:'quartzo_aurifero',
    desc:'Quartzo branco com inclusões douradas.\nAs veias cortam os granitos antigos do planalto.',
  },
  mica_dourada: {
    cat:'minerio', nome:'Mica Dourada', icon:'✧', fase:'4.2',
    journalId:'mica_dourada',
    desc:'Biotita ou muscovita em flocos brilhantes.\nParece ouro, mas é leve e flexível.',
  },
  passaro_esteatita: {
    cat:'artefato', nome:'Pássaro de Esteatita do Zimbábue', icon:'🐦', fase:'4.2',
    journalId:'passaro_esteatita',
    desc:'Escultura Shona em pedra-sabão.\nSua imagem aparece na bandeira nacional do Zimbábue.',
  },

  // ── FASE 4.3 — Timbuktu, Mali ────────────────────────────────────
  machado_item: {
    cat:'ferramenta', nome:'Machado de Pedra Tuaregue', icon:'🪓', fase:'4.3',
    journalId:'machado_item',
    desc:'Golpe horizontal para separar lajes de sal.\nOs Tuaregues extraem assim há séculos.',
  },
  balanca_item: {
    cat:'ferramenta', nome:'Balança de Bronze', icon:'⚖️', fase:'4.3',
    journalId:'balanca_item',
    desc:'Mercadores de Timbuktu pesavam ouro em pó.\nA moeda era o peso, não a forma.',
  },
  astrolabio_item: {
    cat:'ferramenta', nome:'Astrolábio de Latão', icon:'🔭', fase:'4.3',
    journalId:'astrolabio_item',
    desc:'Instrumento islâmico séc. XIV.\nInventado pelos gregos, aperfeiçoado pelos árabes.',
  },
  halita: {
    cat:'minerio', nome:'Halita Saariana (Sal)', icon:'⬜', fase:'4.3',
    journalId:'halita',
    desc:'Sal de Taoudenni — 700 km no Saara.\nSéc. XIV: 1 laje de sal = 1 laje de ouro.',
  },
  manuscrito_item: {
    cat:'artefato', nome:'Manuscrito de Timbuktu', icon:'📖', fase:'4.3',
    journalId:'manuscrito_item',
    desc:'Um dos 700.000 manuscritos islâmicos preservados.\nProva que Timbuktu era capital intelectual do mundo.',
  },

  // ── FASE 5.1 — Jade de Mianmar (Vale de Hpakant) ─────────────────
  cinzel_bambu: {
    cat:'ferramenta', nome:'Cinzel de Bambu', icon:'🔨', fase:'5.1',
    journalId:'cinzel_bambu',
    desc:'Ferramenta de extração sem metal.\nBambu endurecido permite corte preciso sem lascar o jade.',
  },
  bacia_jade: {
    cat:'ferramenta', nome:'Bacia de Madeira com Areia', icon:'🪣', fase:'5.1',
    journalId:'bacia_jade',
    desc:'Estabiliza blocos durante o teste de sonoridade.\nA areia absorve vibrações para diagnóstico auditivo preciso.',
  },
  placa_jade: {
    cat:'ferramenta', nome:'Placa de Jade Ressoante', icon:'💚', fase:'5.1',
    journalId:'placa_jade',
    desc:'Referência sonora para identificar jade verdadeiro.\nJadeíta emite som cristalino; serpentinita, som apagado.',
  },
  jadeita_imperial: {
    cat:'minerio', nome:'Jadeíta Verde-Imperial', icon:'💚', fase:'5.1',
    journalId:'jadeita_imperial',
    desc:'A mais valiosa de todas as jadeítas.\nCor profunda causada por traços de cromo na estrutura cristalina.',
  },
  jadeita_lavanda: {
    cat:'minerio', nome:'Jadeíta Lavanda', icon:'💜', fase:'5.1',
    journalId:'jadeita_lavanda',
    desc:'Tom roxo-pálido raro, causado por manganês e ferro.\nMuito apreciada na China Imperial como símbolo de pureza.',
  },
  jadeita_branca: {
    cat:'minerio', nome:'Jadeíta Branco-Translúcida', icon:'🤍', fase:'5.1',
    journalId:'jadeita_branca',
    desc:'A forma mais translúcida da jadeíta — quase vítrea.\nA mais rara e pura; estrutura cristalina quase sem impurezas.',
  },
  bracelete_jade: {
    cat:'artefato', nome:'Bracelete de Jade Imperial', icon:'⭕', fase:'5.1',
    journalId:'bracelete_jade',
    desc:'Jadeíta verde-imperial com dragões em baixo-relevo.\nNa China Imperial, jade representava virtude, não riqueza.',
  },

  // ── FASE 5.2 — Lápis-Lazúli de Badakhshan (Afeganistão) ──────────
  tora_fogo: {
    cat:'ferramenta', nome:'Tora de Pinheiro Seco', icon:'🌲', fase:'5.2',
    journalId:'tora_fogo',
    desc:'Técnica de fire-setting: aquecimento seguido de choque térmico.\nA mais antiga técnica de mineração da humanidade.',
  },
  anfora_agua: {
    cat:'ferramenta', nome:'Ânfora de Barro com Água', icon:'🏺', fase:'5.2',
    journalId:'anfora_agua',
    desc:'Resfriamento brusco após o aquecimento da rocha.\nA diferença de temperatura cria microfissuras na rocha.',
  },
  pilao_agata: {
    cat:'ferramenta', nome:'Pilão e Almofariz de Ágata', icon:'⚗️', fase:'5.2',
    journalId:'pilao_agata',
    desc:'Ágata (dureza 7) não contamina o pó de lápis-lazúli.\nUsado para moer e produzir o pigmento ultramarino.',
  },
  lapis_grau1: {
    cat:'minerio', nome:'Lápis-Lazúli Grau 1', icon:'🔵', fase:'5.2',
    journalId:'lapis_grau1',
    desc:'Alta concentração de lazurita com pirita abundante.\nA pirita dourada cria efeito de "céu estrelado" na pedra.',
  },
  lapis_grau2: {
    cat:'minerio', nome:'Lápis-Lazúli Grau 2', icon:'🔵', fase:'5.2',
    journalId:'lapis_grau2',
    desc:'Calcita visível reduz a pureza do azul.\nAinda assim mais valioso que ouro na Europa medieval.',
  },
  lapis_puro: {
    cat:'minerio', nome:'Lazurita Pura', icon:'💙', fase:'5.2',
    journalId:'lapis_puro',
    desc:'Fragmento puro de lazurita — o mais raro.\nFonte do pigmento ultramarino usado por Vermeer e Michelangelo.',
  },
  frasco_ultramarino: {
    cat:'artefato', nome:'Frasco de Pigmento Ultramarino', icon:'🫙', fase:'5.2',
    journalId:'frasco_ultramarino',
    desc:'Vidro veneziano séc. XIII com pó de lápis-lazúli.\nO ultramarino era mais caro que ouro por grama até o séc. XIX.',
  },

  // ── FASE 5.3 — Magnetita e a Bússola (Jiangxi, China — Séc. XI) ──
  picareta_aco_song: {
    cat:'ferramenta', nome:'Picareta de Aço Song', icon:'⛏', fase:'5.3',
    journalId:'picareta_aco_song',
    desc:'Mais resistente que qualquer picareta anterior.\nO aço Song (séc. XI) era superior ao ferro europeu da época.',
  },
  bacia_laqueada: {
    cat:'ferramenta', nome:'Bacia de Madeira Laqueada', icon:'🪣', fase:'5.3',
    journalId:'bacia_laqueada',
    desc:'Usada para o experimento da agulha magnética.\nA água parada permite que a agulha aponte para o norte.',
  },
  agulha_aco: {
    cat:'ferramenta', nome:'Agulha de Costura de Aço', icon:'🪡', fase:'5.3',
    journalId:'agulha_aco',
    desc:'Magnetizada por fricção com magnetita → bússola primitiva.\nShen Kuo descreveu este processo em 1088 no Mengxi Bitan.',
  },
  magnetita: {
    cat:'minerio', nome:'Magnetita (Fe₃O₄)', icon:'⬛', fase:'5.3',
    journalId:'magnetita',
    desc:'Óxido de ferro magnético — o mineral mais magnético da natureza.\nEstrutura espinélio alinha domínios magnéticos.\nOs chineses Song a chamavam de cí shí (慈石) — "pedra que ama o ferro".',
  },
  bussola: {
    cat:'ferramenta', nome:'Bússola (Agulha + Bacia)', icon:'🧭', fase:'5.3',
    journalId:'bussola',
    desc:'A primeira bússola da história.\nAgulha magnetizada flutuando em água — aponta para o norte magnético, sempre.\nGuiou Vasco da Gama, Colombo e Magalhães.',
  },
  mengxi_bitan: {
    cat:'artefato', nome:'Mengxi Bitan (Dream Pool Essays)', icon:'📜', fase:'5.3',
    journalId:'mengxi_bitan',
    desc:'Rolo de papel impresso em xilografia — Shen Kuo, 1088.\nPrimeira descrição científica da bússola magnética.',
  },

  // ── FASE 6.1 — Opala de Lightning Ridge (Austrália) ──────────────
  picareta_fina: {
    cat:'ferramenta', nome:'Picareta de Ponta Fina', icon:'⛏', fase:'6.1',
    journalId:'picareta_fina',
    desc:'Ponta estreita para argila — não esmaga a opala.\nUma pancada errada destrói milênios de formação.',
  },
  roldana_poco: {
    cat:'ferramenta', nome:'Roldana de Poço', icon:'🪢', fase:'6.1',
    journalId:'roldana_poco',
    desc:'Sistema de corda para descer nos shafts verticais.\nOs "fossickers" desciam sozinhos em poços estreitos.',
  },
  bastao_escuta: {
    cat:'ferramenta', nome:'Bastão de Escuta Aborígene', icon:'🔍', fase:'6.1',
    journalId:'bastao_escuta',
    desc:'Diagnóstico de cavidades por ressonância sonora do solo.\nOs Yuwaalaraay conheciam esses depósitos há milênios.',
  },
  opala_vermelha: {
    cat:'minerio', nome:'Opala Negra (Play Vermelho)', icon:'🔴', fase:'6.1',
    journalId:'opala_vermelha',
    desc:'Play of color dominante no vermelho-laranja.\nO mais valioso — apenas em Lightning Ridge, Austrália.',
  },
  opala_azul: {
    cat:'minerio', nome:'Opala Negra (Play Azul)', icon:'🔵', fase:'6.1',
    journalId:'opala_azul',
    desc:'Play of color dominante no azul-verde.\nResulta da difração da luz em sílica em nanoesferas.',
  },
  opala_verde: {
    cat:'minerio', nome:'Opala Negra (Play Verde)', icon:'💚', fase:'6.1',
    journalId:'opala_verde',
    desc:'Play of color com dominância no verde.\nA estrutura de sílica hidratada levou 5 milhões de anos para formar.',
  },
  churinga: {
    cat:'artefato', nome:'Churinga / Tjuringa', icon:'🪨', fase:'6.1',
    journalId:'churinga',
    desc:'Placa oval de arenito com gravuras espirais — objeto sagrado Yuwaalaraay.\nDevolvida ao lugar — o primeiro artefato que Corvan não leva.',
  },

  // ── FASE 6.2 — Obsidiana Lapita (Papua Nova Guiné — 1500 a.C.) ───
  percutor_quartzito: {
    cat:'ferramenta', nome:'Percutor de Quartzito', icon:'🪨', fase:'6.2',
    journalId:'percutor_quartzito',
    desc:'Seixo de quartzo arredondado para knapping inicial.\nO ângulo de golpe determina o tipo de lasca produzida.',
  },
  protetor_couro: {
    cat:'ferramenta', nome:'Protetor de Couro de Mão', icon:'🧤', fase:'6.2',
    journalId:'protetor_couro',
    desc:'Luva de couro de tartaruga para knapping.\nAs lascas de obsidiana cortam mais que bisturis cirúrgicos.',
  },
  talha_obsidiana: {
    cat:'ferramenta', nome:'Talha-Obsidiana de Osso', icon:'🦴', fase:'6.2',
    journalId:'talha_obsidiana',
    desc:'Permite lascamentos mais controlados que o percutor.\nO osso transmite força de forma mais gradual que a pedra.',
  },
  obsidiana_pequena: {
    cat:'minerio', nome:'Lâmina de Obsidiana (Precisão)', icon:'🖤', fase:'6.2',
    journalId:'obsidiana_pequena',
    desc:'Lâmina pequena para trabalhos finos.\nObsidiana: vidro vulcânico com borda de 3 nanômetros — a mais fina possível.',
  },
  obsidiana_geral: {
    cat:'minerio', nome:'Lâmina de Obsidiana (Uso Geral)', icon:'🖤', fase:'6.2',
    journalId:'obsidiana_geral',
    desc:'Lâmina de tamanho médio para uso cotidiano.\nRastros de obsidiana de Talasea foram encontrados a 6.000 km.',
  },
  obsidiana_cerimonia: {
    cat:'minerio', nome:'Lâmina de Obsidiana (Cerimônia)', icon:'⚫', fase:'6.2',
    journalId:'obsidiana_cerimonia',
    desc:'Lâmina grande de uso ritual Lapita.\nO comércio de obsidiana prova rotas marítimas pré-históricas.',
  },
  ceramica_lapita: {
    cat:'artefato', nome:'Cerâmica Lapita', icon:'🏺', fase:'6.2',
    journalId:'ceramica_lapita',
    desc:'Caco com decoração dentada geométrica — cultura Lapita, 1500 a.C.\nEncontrada de PNG à Samoa: prova de navegação de 4.000 km.',
  },

  // ── FASE 6.3 — Pounamu Māori (Nova Zelândia — Séc. XIII) — FINAL ─
  toki_pounamu: {
    cat:'ferramenta', nome:'Toki Pounamu', icon:'🪓', fase:'6.3',
    journalId:'toki_pounamu',
    desc:'Adze de nefrita Māori — ferramenta e instrumento de teste.\nUsa-se para trabalhar madeira e para testar a dureza da pedra.',
  },
  corda_harakeke: {
    cat:'ferramenta', nome:'Corda de Fibra de Harakeke', icon:'🪢', fase:'6.3',
    journalId:'corda_harakeke',
    desc:'Fibra de linho neozelandês amarrada ao tornozelo no mergulho.\nHarakeke é a planta mais útil da cultura Māori.',
  },
  mascara_kelp: {
    cat:'ferramenta', nome:'Máscara de Mergulho de Kelp', icon:'🌿', fase:'6.3',
    journalId:'mascara_kelp',
    desc:'Bexiga de alga seca usada como visor subaquático primitivo.\nPermite enxergar no leito do rio para encontrar seixos de pounamu.',
  },
  pounamu: {
    cat:'minerio', nome:'Pounamu (Nefrita)', icon:'🟢', fase:'6.3',
    journalId:'pounamu',
    desc:'Jade verde Māori — Ca₂(Mg,Fe)₅Si₈O₂₂(OH)₂.\nMais tenaz que diamante. Variedades:\n• kawakawa — verde-escuro (folha)\n• kahurangi — verde pálido translúcido\n• inanga — verde-claro quase branco (a mais rara)',
  },
  hei_tiki: {
    cat:'artefato', nome:'Hei-Tiki de Pounamu', icon:'🗿', fase:'6.3',
    journalId:'hei_tiki',
    desc:'Pingente humano de 8cm em kawakawa — artefato final do jogo.\nFica equipado permanentemente em Corvan ao fim da jornada.',
  },
};
