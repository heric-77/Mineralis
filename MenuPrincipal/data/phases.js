/* ═══════════════════════════════════════════════
   MINERALIS – data/phases.js
   Dados centralizados de todas as fases.
   mapPos: posição do card no mapa (top%, left%)
   ═══════════════════════════════════════════════ */

const PhasesData = [

  // ── AMÉRICA DO SUL ── (lm-sa: top 45–73%, left 12–26%)
  { id:'1.1', nome:'Minas de Prata dos Andes',      local:'Potosí, Bolívia',
    continente:'América do Sul',  desbloqueada:false, estrelas:0,
    mapPos:{ top:'59%', left:'15%' },
    caminho:'../Fase1/Fase1-1/index.html' },
  { id:'1.2', nome:'Jazidas de Ouro da Amazônia',   local:'Serra Pelada, Brasil',
    continente:'América do Sul',  desbloqueada:false, estrelas:0,
    mapPos:{ top:'47%', left:'20%' },
    caminho:'../Fase1/Fase1-2/index.html' },
  { id:'1.3', nome:'O Tesouro do Condor',           local:'Machu Picchu, Peru',
    continente:'América do Sul',  desbloqueada:false, estrelas:0,
    mapPos:{ top:'47%', left:'13%' },
    caminho:'../Fase1/Fase1-3/index.html' },

  // ── AMÉRICA DO NORTE ── (lm-na: top 8–44%, left 3–25%)
  { id:'2.1', nome:'Corrida do Ouro na Califórnia', local:'Sierra Nevada, EUA',
    continente:'América do Norte', desbloqueada:false, estrelas:0,
    mapPos:{ top:'7%', left:'3%' },
    caminho:'../Fase2/Fase2-1/index.html' },
  { id:'2.2', nome:'Minas de Carvão dos Apalaches', local:'Leste dos EUA',
    continente:'América do Norte', desbloqueada:false, estrelas:0,
    mapPos:{ top:'7%', left:'18%' },
    caminho:'../Fase2/Fase2-2/index.html' },
  { id:'2.3', nome:'Cobres Antigos do Grande Lago', local:'Michigan, EUA',
    continente:'América do Norte', desbloqueada:false, estrelas:0,
    mapPos:{ top:'28%', left:'10%' },
    caminho:'../Fase2/Fase2-3/index.html' },

  // ── EUROPA ── (lm-eu: top 6–28%, left 36–50%)
  { id:'3.1', nome:'Minas Romanas de Chumbo',       local:'Rio Tinto, Espanha',
    continente:'Europa', desbloqueada:false, estrelas:0,
    mapPos:{ top:'20%', left:'39%' },
    caminho:'../Fase3/Fase3-1/index.html' },
  { id:'3.2', nome:'Sal Gema de Hallstatt',         local:'Áustria',
    continente:'Europa', desbloqueada:false, estrelas:0,
    mapPos:{ top:'6%', left:'45%' },
    caminho:'../Fase3/Fase3-2/index.html' },
  { id:'3.3', nome:'Bacias Carboníferas do Ruhr',   local:'Alemanha',
    continente:'Europa', desbloqueada:false, estrelas:0,
    mapPos:{ top:'6%', left:'35%' },
    caminho:'../Fase3/Fase3-3/index.html' },

  // ── ÁFRICA ── (lm-af: top 28–66%, left 40–56%)
  { id:'4.1', nome:'Diamantes do Kalahari',         local:'Botswana',
    continente:'África', desbloqueada:false, estrelas:0,
    mapPos:{ top:'57%', left:'50%' },
    caminho:'../Fase4/Fase4-1/index.html' },
  { id:'4.2', nome:'Ouro dos Faraós',               local:'Deserto Oriental, Egito',
    continente:'África', desbloqueada:false, estrelas:0,
    mapPos:{ top:'27%', left:'50%' },
    caminho:'../Fase4/Fase4-2/index.html' },
  { id:'4.3', nome:'Minas de Cobre do Congo',       local:'Cinturão de Cobre, RDC',
    continente:'África', desbloqueada:false, estrelas:0,
    mapPos:{ top:'43%', left:'50%' },
    caminho:'../Fase4/Fase4-3/index.html' },

  // ── ÁSIA ── (lm-as: top 5–47%, left 53–85%)
  { id:'5.1', nome:'Rotas de Jade da China Antiga', local:'Xinjiang, China',
    continente:'Ásia', desbloqueada:false, estrelas:0,
    mapPos:{ top:'6%', left:'73%' },
    caminho:'../Fase5/Fase5-1/index.html' },
  { id:'5.2', nome:'Petróleo do Oriente Médio',     local:'Arábia Saudita',
    continente:'Ásia', desbloqueada:false, estrelas:0,
    mapPos:{ top:'22%', left:'54%' },
    caminho:'../Fase5/Fase5-2/index.html' },
  { id:'5.3', nome:'Estanho e Gemas do Sudeste',    local:'Malásia/Tailândia',
    continente:'Ásia', desbloqueada:false, estrelas:0,
    mapPos:{ top:'36%', left:'70%' },
    caminho:'../Fase5/Fase5-3/index.html' },

  // ── OCEANIA ── (lm-oc: top 60–80%, left 68–86%)
  { id:'6.1', nome:'Ouro do Outback',               local:'Kalgoorlie, Austrália',
    continente:'Oceania', desbloqueada:false, estrelas:0,
    mapPos:{ top:'66%', left:'68%' },
    caminho:'../Fase6/Fase6-1/index.html' },
  { id:'6.2', nome:'Níquel e Rochas Vulcânicas',    local:'Nova Caledônia',
    continente:'Oceania', desbloqueada:false, estrelas:0,
    mapPos:{ top:'66%', left:'80%' },
    caminho:'../Fase6/Fase6-2/index.html' },
  { id:'6.3', nome:'Pérolas e Recifes',             local:'Grande Barreira de Corais',
    continente:'Oceania', desbloqueada:false, estrelas:0,
    mapPos:{ top:'74%', left:'73%' },
    caminho:'../Fase6/Fase6-3/index.html' },
];
