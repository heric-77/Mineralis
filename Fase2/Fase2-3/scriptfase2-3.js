const W = 1280, H = 720;
const wrap   = document.getElementById('wrap');
const canvas = document.getElementById('c');
const ctx    = canvas.getContext('2d');
canvas.width  = W;
canvas.height = H;

function resize() {
  const scaleW = window.innerWidth  / W;
  const scaleH = window.innerHeight / H;
  const s  = Math.min(scaleW, scaleH);
  const sw = Math.round(W * s);
  const sh = Math.round(H * s);
  canvas.style.width  = sw + 'px';
  canvas.style.height = sh + 'px';
  wrap.style.width    = sw + 'px';
  wrap.style.height   = sh + 'px';
  wrap.style.position = 'fixed';
  wrap.style.left     = Math.round((window.innerWidth  - sw) / 2) + 'px';
  wrap.style.top      = Math.round((window.innerHeight - sh) / 2) + 'px';
}
resize();
window.addEventListener('resize', resize);

// ── Audio ──────────────────────────────────────────────────────
let AC;
try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){}
function sfx(type) {
  if (!AC) return;
  if (AC.state === 'suspended') AC.resume();
  const o = AC.createOscillator(), g = AC.createGain();
  o.connect(g); g.connect(AC.destination);
  const t = AC.currentTime;
  if      (type==='jump')   { o.frequency.setValueAtTime(280,t); o.frequency.exponentialRampToValueAtTime(520,t+.14); g.gain.setValueAtTime(.15,t); g.gain.exponentialRampToValueAtTime(.001,t+.16); }
  else if (type==='coin')   { o.frequency.setValueAtTime(880,t); o.frequency.exponentialRampToValueAtTime(1760,t+.09); g.gain.setValueAtTime(.12,t); g.gain.exponentialRampToValueAtTime(.001,t+.12); }
  else if (type==='hit')    { o.type='sawtooth'; o.frequency.setValueAtTime(200,t); o.frequency.exponentialRampToValueAtTime(50,t+.18); g.gain.setValueAtTime(.18,t); g.gain.exponentialRampToValueAtTime(.001,t+.2); }
  else if (type==='item')   { o.frequency.setValueAtTime(440,t); o.frequency.setValueAtTime(660,t+.1); o.frequency.setValueAtTime(880,t+.2); g.gain.setValueAtTime(.14,t); g.gain.exponentialRampToValueAtTime(.001,t+.3); }
  else if (type==='unlock') { o.frequency.setValueAtTime(330,t); o.frequency.setValueAtTime(440,t+.15); o.frequency.setValueAtTime(660,t+.3); g.gain.setValueAtTime(.15,t); g.gain.exponentialRampToValueAtTime(.001,t+.5); }
  // Cobre: "tonk" metálico caloroso
  else if (type==='copper') { o.type='triangle'; o.frequency.setValueAtTime(520,t); o.frequency.exponentialRampToValueAtTime(280,t+.22); g.gain.setValueAtTime(.16,t); g.gain.exponentialRampToValueAtTime(.001,t+.28); }
  // Calcita: crack seco
  else if (type==='crack')  { o.type='sawtooth'; o.frequency.setValueAtTime(900,t); o.frequency.exponentialRampToValueAtTime(80,t+.12); g.gain.setValueAtTime(.14,t); g.gain.exponentialRampToValueAtTime(.001,t+.14); }
  // Maço: dok percussivo
  else if (type==='maco')   { o.type='square'; o.frequency.setValueAtTime(140,t); o.frequency.exponentialRampToValueAtTime(60,t+.18); g.gain.setValueAtTime(.13,t); g.gain.exponentialRampToValueAtTime(.001,t+.2); }
  // Gorget: flauta nativa
  else if (type==='gorget') {
    o.type='sine';
    o.frequency.setValueAtTime(440,t); o.frequency.setValueAtTime(370,t+.15); o.frequency.setValueAtTime(330,t+.35);
    g.gain.setValueAtTime(.1,t); g.gain.exponentialRampToValueAtTime(.001,t+.7);
  }
  else if (type==='stone')  { o.type='square'; o.frequency.setValueAtTime(120,t); g.gain.setValueAtTime(.1,t); g.gain.exponentialRampToValueAtTime(.001,t+.15); }
  o.start(t); o.stop(t+.8);
}

// ── Save ────────────────────────────────────────────────────────
const SAVE_KEY = 'mineralis_save_v2';
function _salvarFase(score, deaths){
  const estrelas = deaths===0?4 : deaths<=2?3 : deaths<=5?2 : 1;
  try{
    const raw = localStorage.getItem(SAVE_KEY);
    const save = raw ? JSON.parse(raw) : {versao:1,iniciado:true,fases:{}};
    if(!save.fases) save.fases = {};
    if(!save.fases['2.3']) save.fases['2.3'] = {desbloqueada:true,estrelas:0};
    save.fases['2.3'].estrelas = Math.max(save.fases['2.3'].estrelas||0, estrelas);
    save.fases['2.3'].desbloqueada = true;
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    console.info('[Fase2-3] Progresso salvo — estrelas:', estrelas);
  }catch(e){}
}
function _voltarAoMenu(){
  _salvarFase(G.player?.score||0, G.deaths);
  try{sessionStorage.setItem('mineralis_session','1');}catch(e){}
  window.location.href = '../../MenuPrincipal/index.html';
}

// ── Assets ──────────────────────────────────────────────────────
const IMG = {};

// Sprites da Águia — sprite sheet SVG com 4 frames (1280×230, frames de 320px cada)
// Frames: F1 upstroke, F2 glide, F3 downstroke, F4 land
const AGUIA_FRAME_W = 320;
const AGUIA_FRAME_H = 230;
const AGUIA_N_FRAMES = 4;

const ASSETS = [
  ['bg01','Assets/cena1.svg'],
  ['bg02','Assets/cena2.svg'],
  ['bg03','Assets/cena3.svg'],
  ['bg04','Assets/cena4.svg'],
  ['aguia','Assets/aguia_sprite_sheet.svg'],
];




let assetsLoaded = 0, totalAssets = ASSETS.length, gameReady = false;
ASSETS.forEach(([key,src]) => {
  const img = new Image();
  img.onload = () => {
    IMG[key] = img;
    if (++assetsLoaded >= totalAssets) { gameReady = true; startGame(); }
  };
  img.onerror = () => { IMG[key]=null; if (++assetsLoaded >= totalAssets) { gameReady=true; startGame(); } };
  img.src = src;
});

// Card do mapa
IMG.card23 = null;
(function(){
  const ci = new Image();
  ci.onload  = () => { IMG.card23 = ci; };
  ci.onerror = () => { IMG.card23 = null; };
  ci.src = 'Assets/2_3_grande_lago.svg';
})();

// ── Input ────────────────────────────────────────────────────────
const keys={}, jp={};
window.addEventListener('keydown', e => {
  if (!keys[e.code]) jp[e.code]=true;
  keys[e.code]=true;
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
  if((e.code==='KeyI'||e.code==='Tab')&&G.state==='playing'&&!BUBBLE.active){e.preventDefault();if(G.player)INV.toggle(G.player);}
  if(e.code==='Escape'&&INV.open)INV.close();
  if(e.code==='KeyM'){try{sessionStorage.setItem('mineralis_session','1');}catch(e){}
  window.location.href='../../MenuPrincipal/index.html';}
});
window.addEventListener('keyup', e => delete keys[e.code]);

const TOUCH={l:false,r:false,j:false,e:false};
function bindT(id,k){ const el=document.getElementById(id); if(!el)return;
  el.addEventListener('touchstart',ev=>{ev.preventDefault();TOUCH[k]=true;if(k==='j'||k==='e')jp['_t'+k]=true;},{passive:false});
  el.addEventListener('touchend',  ev=>{ev.preventDefault();TOUCH[k]=false;},{passive:false}); }
bindT('tb-l','l'); bindT('tb-r','r'); bindT('tb-j','j'); bindT('tb-e','e');

const isL=()=>keys['ArrowLeft'] ||keys['KeyA']||TOUCH.l;
const isR=()=>keys['ArrowRight']||keys['KeyD']||TOUCH.r;
const isJ=()=>jp['ArrowUp']||jp['KeyW']||jp['Space']||jp['_tj'];
const isE=()=>jp['KeyE']||jp['Enter']||jp['_te'];
function clearJP(){ for(const k in jp) delete jp[k]; }


// ── Particles ────────────────────────────────────────────────────
let particles=[];
function burst(x,y,color,n=8,spd=3.5){
  for(let i=0;i<n;i++){
    const a=(i/n)*Math.PI*2+Math.random()*.5;
    particles.push({x,y,vx:Math.cos(a)*spd*(0.4+Math.random()),vy:Math.sin(a)*spd*(0.4+Math.random())-1,life:40+Math.random()*20,max:60,color,r:3+Math.random()*4});
  }
}
function tickParticles(){ for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=0.2;p.life--;if(p.life<=0)particles.splice(i,1);} }
function drawParticles(){ for(const p of particles){ctx.globalAlpha=p.life/p.max;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x-cam.x,p.y-cam.y,p.r*(p.life/p.max),0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1; }

// ── Camera ───────────────────────────────────────────────────────
const cam={x:0,y:0};
function updateCam(px,worldW){
  const target=px-W/2+24;
  const clamped=Math.max(0,Math.min(target,worldW-W));
  cam.x+=(clamped-cam.x)*0.12;
}

// ── Physics constants ────────────────────────────────────────────
const GRAV=0.46, PSPD=4.6, JUMPF=-12.4, MAXFALL=16;

// ── Tile themes — tons de basalto/cobre para o Lago Superior ────
const TILE_THEMES={
  1:{top:'#3a3a40',body:'#252528',dark:'#18181c'},   // basalto escuro
  2:{top:'#4a3830',body:'#2a2018',dark:'#1a1408'},   // rocha rochosa com cobre
  3:{top:'#2a2a30',body:'#1c1c22',dark:'#12121a'},   // basalto profundo
  4:{top:'#5a4030',body:'#3a2818',dark:'#221408'},   // afloramento alaranjado
};
let tileTheme=TILE_THEMES[1];

// ── Platform helpers ─────────────────────────────────────────────
function solid(x,y,w,h){ return {type:'solid',x,y,w,h}; }
function movH(x,y,w,x0,x1,spd){ return {type:'solid',moving:true,x,y,w,h:18,x0,x1,spd,vx:spd,vy:0}; }
function movV(x,y,w,y0,y1,spd){ return {type:'solid',moving:true,x,y,w,h:18,y0,y1,spd,vx:0,vy:spd}; }
function trap(x,y,w){ return {type:'trapdoor',x,y,w,h:14}; }
function water(x,y,w,h){ return {type:'water',x,y,w,h}; }
function spike(x,y,w){ return {type:'spike',x,y,w,h:20}; }

function tickMoving(plats){
  for(const p of plats){
    if(!p.moving) continue;
    if(p.x0!==undefined){p.x+=p.vx; if(p.x<=p.x0||p.x+p.w>=p.x1) p.vx=-p.vx;}
    if(p.y0!==undefined){p.y+=p.vy; if(p.y<=p.y0||p.y>=p.y1) p.vy=-p.vy;}
  }
}
function tickTrapdoors(plats){
  for(const p of plats){
    if(p.type!=='trapdoor') continue;
    if(p.crumble!==undefined){p.crumble--;if(p.crumble<=0){p.crumble=undefined;p.type='_dead';}}
  }
}

function drawPlatform(p){
  const sx=p.x-cam.x, sy=p.y-cam.y;
  if(sx>W+80||sx+p.w<-80||sy>H+40||sy+p.h<-40) return;
  if(p.type==='spike'){
    const nc=Math.max(1,Math.floor(p.w/20)); ctx.fillStyle='#4a3020';
    for(let i=0;i<nc;i++){const tx=sx+i*(p.w/nc);ctx.beginPath();ctx.moveTo(tx,sy+p.h);ctx.lineTo(tx+p.w/nc/2,sy);ctx.lineTo(tx+p.w/nc,sy+p.h);ctx.fill();}
    return;
  }
  if(p.type==='water'){
    // Lago Superior — água fria e escura
    const wg=ctx.createLinearGradient(0,sy,0,sy+p.h);
    wg.addColorStop(0,'rgba(20,50,100,0.85)'); wg.addColorStop(1,'rgba(5,15,50,0.95)');
    ctx.fillStyle=wg; ctx.fillRect(sx,sy,p.w,p.h);
    ctx.fillStyle='rgba(60,100,180,0.22)'; ctx.fillRect(sx,sy,p.w,6+Math.sin(Date.now()/1400+sx)*3);
    return;
  }
  if(p.type==='trapdoor'){
    const alpha=p.crumble!==undefined?p.crumble/70:1; ctx.globalAlpha=alpha;
    ctx.fillStyle=tileTheme.dark; ctx.fillRect(sx,sy,p.w,p.h);
    ctx.fillStyle=tileTheme.top;  ctx.fillRect(sx,sy,p.w,3);
    ctx.globalAlpha=1; return;
  }
  if(p.type==='_dead') return;
  const ts=24, cols=Math.ceil(p.w/ts), rows=Math.ceil(p.h/ts);
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      const tx=sx+c*ts, ty=sy+r*ts, tw=Math.min(ts,sx+p.w-tx), th=Math.min(ts,sy+p.h-ty);
      ctx.fillStyle=r===0?tileTheme.body:(r%2===0?tileTheme.dark:tileTheme.body); ctx.fillRect(tx,ty,tw,th);
      ctx.fillStyle='rgba(0,0,0,0.1)'; ctx.fillRect(tx+tw-1,ty,1,th); ctx.fillRect(tx,ty+th-1,tw,1);
    }
  }
  ctx.fillStyle=tileTheme.top; ctx.fillRect(sx,sy,p.w,4);
  if(p.moving){ ctx.fillStyle='rgba(180,100,30,0.35)'; ctx.fillRect(sx,sy,p.w,4); }
}

// ── Rounded rect ─────────────────────────────────────────────────
function roundRect(x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
  ctx.closePath();
}
function _roundRect(x,y,w,h,r){
  ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();
}

function wrapText(text, maxW) {
  ctx.font = '15px "Courier New"';
  const paragraphs = text.split('\n');
  const result = [];
  for (const para of paragraphs) {
    const words = para.split(' ');
    let line = '';
    for (const word of words) {
      const test = line ? line+' '+word : word;
      if (ctx.measureText(test).width > maxW && line) { result.push(line); line=word; }
      else line=test;
    }
    if (line) result.push(line);
  }
  return result;
}

// ── Item Definitions ─────────────────────────────────────────────
// Inclui itens das fases anteriores + novos da 2.3
const ITEM_DEFS = {
  // ── Fases anteriores (herdados) ──
  picareta_basica:  { cat:'ferramenta', nome:'Picareta Básica',       icon:'⛏', fase:'1.1',
    desc:'Extrai minérios das paredes rochosas.\nEssencial nas minas de Potosí.' },
  pa_exploradora:   { cat:'ferramenta', nome:'Pá Exploradora',        icon:'🪏', fase:'1.2',
    desc:'Escava solo aluvial amazônico.\nUsada para encontrar artefatos enterrados.' },
  bateia:           { cat:'ferramenta', nome:'Bateia',                 icon:'🥌', fase:'1.2',
    desc:'Separa ouro pesado do sedimento leve.\nUsada há 2.000 anos na Amazônia.' },
  lanterna_arqueologa: { cat:'ferramenta', nome:'Lanterna',           icon:'🔦', fase:'1.3',
    desc:'Ilumina a mina e revela símbolos ocultos.\nNecessária para abrir portões de pedra.' },
  // ── Fases 2.1, 2.2 (herdados de viagens anteriores) ──
  picareta_mineira: { cat:'ferramenta', nome:'Picareta Mineira',      icon:'⛏', fase:'2.1',
    desc:'Picareta de ferro reforçado.\nUsada nas minas de carvão da América do Norte.' },
  // ── Novas ferramentas da Fase 2.3 ──
  maco_pedra:       { cat:'ferramenta', nome:'Maço de Pedra',         icon:'🪨', fase:'2.3',
    desc:'Seixo pesado e arredondado dos Anishinaabe.\nUsado para extrair cobre por percussão a frio.' },
  martelo_pedra:    { cat:'ferramenta', nome:'Martelo de Pedra',      icon:'🪓', fase:'2.3',
    desc:'Menor e preciso — para o Teste do Martelinho.\nIdentifica cobre (dobra) de calcita (estilhaça).' },
  escopro_cobre:    { cat:'ferramenta', nome:'Escopro de Cobre',      icon:'🔧', fase:'2.3',
    desc:'Forjado por cold hammering — martelamento a frio.\nEndurece o cobre sem precisar de fogo.' },
  // ── Minérios ──
  prata:            { cat:'minerio',   nome:'Prata',                   icon:'◆', fase:'1.1',
    desc:'Melhor condutor elétrico e térmico.\nUsada pelos Incas como arte e símbolo lunar.' },
  estanho:          { cat:'minerio',   nome:'Estanho',                 icon:'◈', fase:'1.1',
    desc:'Liga-se ao cobre formando bronze desde 3.000 a.C.\nBolívia: 2ª maior reserva mundial.' },
  ouro_aluvial:     { cat:'minerio',   nome:'Ouro Aluvial',            icon:'💛', fase:'1.2',
    desc:'Depositado nos rios por erosão milenar.\n19× mais pesado que a água.' },
  cobre_nativo:     { cat:'minerio',   nome:'Cobre Nativo',            icon:'🟠', fase:'2.3',
    desc:'Cobre puro em estado natural — sem fundição.\nCor alaranjada, maleável, densidade 8,9 g/cm³.\nTerceiro melhor condutor elétrico do planeta.',
    multiple:true },
  // ── Artefatos ──
  ceramica_inca:    { cat:'artefato',  nome:'Cerâmica Inca',           icon:'🏺', fase:'1.1',
    desc:'Vasilha ritual do Império Inca.\nPadrões geométricos representando o cosmos.' },
  tumi_dourado:     { cat:'artefato',  nome:'Tumi de Ouro',            icon:'🥇', fase:'1.3',
    desc:'Para os Incas, o ouro era o sol materializado.\nNão era moeda — era divindade.' },
  gorget_cobre:     { cat:'artefato',  nome:'Gorget de Cobre',         icon:'🌐', fase:'2.3',
    desc:'Ornamento peitoral Anishinaabe polido e fino.\nComercializado da Flórida ao México por redes\nnativas que existiam 7.000 anos antes dos europeus.' },
};

const TIPO_TO_JOURNAL = {
  maco:'maco_pedra', martelo:'martelo_pedra', escopro:'escopro_cobre',
  cobre:'cobre_nativo', gorget:'gorget_cobre',
};
function _journalColetar(tipo){
  const id=TIPO_TO_JOURNAL[tipo]||tipo; if(!id) return;
  try{
    const raw=localStorage.getItem('mineralis_save_v2');
    const save=raw?JSON.parse(raw):{};
    if(!save.coletados) save.coletados={};
    if(!save.coletados[id]){save.coletados[id]=true;localStorage.setItem('mineralis_save_v2',JSON.stringify(save));}
  }catch(e){}
}

// ── Inventory / Diário ────────────────────────────────────────────
const INV = {
  open:false, tab:0, cursor:0,
  TABS:[
    {id:'ferramenta',label:'🔧 Ferramentas',color:'#e08830'},
    {id:'minerio',   label:'⛏ Minérios',   color:'#c86020'},
    {id:'artefato',  label:'🏺 Artefatos',  color:'#d09050'},
  ],
  tabItems(player){
    const cat=this.TABS[this.tab].id;
    let coletados={};
    try{const s=localStorage.getItem('mineralis_save_v2');if(s){const j=JSON.parse(s);coletados=j.coletados||{};}}catch(e){}
    // Mergear itens do player atual
    for(const tipo of player.items){
      const jid=TIPO_TO_JOURNAL[tipo]||tipo;
      coletados[jid]=true;
    }
    const cobreCount=player.items.filter(i=>i==='cobre').length;
    // Catálogo: local ITEM_DEFS + global ALL_ITEM_DEFS (sem duplicar journalIds)
    const _seenJids=new Set(Object.values(ITEM_DEFS).map(d=>d.journalId||'').filter(Boolean));
    const _FINAL={...ITEM_DEFS};
    for(const [id,def] of Object.entries(window.ALL_ITEM_DEFS||{})){
      if(id in ITEM_DEFS)continue;
      const jid=def.journalId||id;
      if(_seenJids.has(jid))continue;
      _seenJids.add(jid);_FINAL[id]=def;
    }
    const out=[];
    for(const [id,def] of Object.entries(_FINAL)){
      if(def.cat!==cat) continue;
      const jid=def.journalId||id;
      if(def.multiple){
        if(cobreCount>0) out.push({id,...def,count:cobreCount});
      } else if(coletados[jid]||coletados[id]){
        out.push({id,...def,count:1});
      }
    }
    return out;
  },
  toggle(player){ this.open=!this.open; if(this.open){this.cursor=Math.min(this.cursor,Math.max(0,this.tabItems(player).length-1));} G.dialog=this.open||BUBBLE.active; },
  close(){ this.open=false;G.dialog=BUBBLE.active; },
  navigate(player){
    if(!this.open)return false;
    if(jp['ArrowLeft']||jp['KeyA']){this.tab=(this.tab+2)%3;this.cursor=0;return true;}
    if(jp['ArrowRight']||jp['KeyD']){this.tab=(this.tab+1)%3;this.cursor=0;return true;}
    const items=this.tabItems(player);
    if(jp['ArrowUp']  ||jp['KeyW']){this.cursor=Math.max(0,this.cursor-1);return true;}
    if(jp['ArrowDown']||jp['KeyS']){this.cursor=Math.min(items.length-1,this.cursor+1);return true;}
    if(isE()&&items.length>0&&this.tab===0){
      const item=items[this.cursor];
      player.activeTool=(player.activeTool===item.id)?null:item.id;
      return true;
    }
    return false;
  },
  draw(player){
    if(!this.open)return;
    ctx.fillStyle='rgba(0,0,0,0.65)';ctx.fillRect(0,0,W,H);
    const PW=780,PH=480,PX=(W-PW)/2,PY=(H-PH)/2;
    ctx.shadowColor='rgba(0,0,0,0.7)';ctx.shadowBlur=20;
    ctx.fillStyle='rgba(6,3,0,0.97)';_roundRect(PX,PY,PW,PH,16);ctx.fill();
    ctx.shadowBlur=0;
    ctx.strokeStyle='#8a4820';ctx.lineWidth=2.5;_roundRect(PX,PY,PW,PH,16);ctx.stroke();
    ctx.fillStyle='#e08830';ctx.font='bold 16px "Courier New"';
    ctx.textAlign='center';ctx.fillText('📔  DIÁRIO DE BORDO',W/2,PY+28);ctx.textAlign='left';
    ctx.fillStyle='rgba(200,120,40,0.3)';ctx.fillRect(PX+16,PY+38,PW-32,1);
    const TAB_W=PW/3,TAB_Y=PY+44;
    this.TABS.forEach((tab,i)=>{
      const tx=PX+i*TAB_W,active=(i===this.tab);
      ctx.fillStyle=active?'rgba(200,100,40,0.18)':'rgba(0,0,0,0.3)';
      ctx.fillRect(tx+2,TAB_Y,TAB_W-4,34);
      ctx.fillStyle=active?tab.color:'#666';
      ctx.font=(active?'bold ':'')+'13px "Courier New"';
      ctx.textAlign='center';ctx.fillText(tab.label,tx+TAB_W/2,TAB_Y+22);ctx.textAlign='left';
      if(active){ctx.fillStyle=tab.color;ctx.fillRect(tx+2,TAB_Y+32,TAB_W-4,3);}
    });
    const CY=TAB_Y+40,CH=PH-(CY-PY)-50;
    const items=this.tabItems(player);
    const COL_W=260,DESC_X=PX+280;
    if(items.length===0){
      ctx.fillStyle='#554';ctx.font='14px "Courier New"';ctx.textAlign='center';
      ctx.fillText('Nenhum item coletado ainda.',W/2,CY+CH/2);
      ctx.fillText('Explore a fase para desbloquear!',W/2,CY+CH/2+24);
      ctx.textAlign='left';
    } else {
      items.forEach((item,i)=>{
        const iy=CY+16+i*52,selected=(i===this.cursor),equipped=(player.activeTool===item.id);
        if(selected){ctx.fillStyle='rgba(200,100,40,0.18)';_roundRect(PX+16,iy-10,COL_W,46,8);ctx.fill();ctx.strokeStyle='#e08830';ctx.lineWidth=1.5;_roundRect(PX+16,iy-10,COL_W,46,8);ctx.stroke();}
        const cnt=item.count>1?' ×'+item.count:'';
        ctx.font='20px serif';ctx.fillText(item.icon,PX+28,iy+20);
        ctx.font=(equipped?'bold ':'')+'14px "Courier New"';
        ctx.fillStyle=equipped?'#ffe060':(selected?'#f0e8c0':'#aaa');
        ctx.fillText(item.nome+cnt,PX+62,iy+14);
        if(equipped){ctx.fillStyle='rgba(200,100,40,0.22)';_roundRect(PX+62,iy+20,80,16,4);ctx.fill();ctx.font='10px "Courier New"';ctx.fillStyle='#e08830';ctx.fillText('▶ EQUIPADO',PX+66,iy+32);}
      });
      const sel=items[this.cursor];
      if(sel){
        ctx.fillStyle='rgba(200,100,40,0.08)';_roundRect(DESC_X,CY,PW-DESC_X+PX-16,CH-10,8);ctx.fill();
        ctx.font='44px serif';ctx.textAlign='center';ctx.fillText(sel.icon,DESC_X+(PW-DESC_X+PX-16)/2,CY+68);
        ctx.font='bold 15px "Courier New"';ctx.fillStyle='#e08830';ctx.fillText(sel.nome,DESC_X+(PW-DESC_X+PX-16)/2,CY+98);
        const catLabel={ferramenta:'🔧 Ferramenta',minerio:'⛏ Minério',artefato:'🏺 Artefato'};
        ctx.font='11px "Courier New"';ctx.fillStyle='#888';ctx.fillText(catLabel[sel.cat],DESC_X+(PW-DESC_X+PX-16)/2,CY+116);
        ctx.textAlign='left';
        ctx.fillStyle='rgba(200,100,40,0.25)';ctx.fillRect(DESC_X+20,CY+124,PW-DESC_X+PX-56,1);
        const descLines=sel.desc.split('\n');
        ctx.font='13px "Courier New"';ctx.fillStyle='#f0e8c0';
        descLines.forEach((l,i)=>{ctx.textAlign='center';ctx.fillText(l,DESC_X+(PW-DESC_X+PX-16)/2,CY+144+i*22);});
        ctx.textAlign='left';
        if(sel.cat==='ferramenta'){
          const btnTxt=player.activeTool===sel.id?'[E] Desequipar':'[E] Equipar';
          ctx.fillStyle=player.activeTool===sel.id?'rgba(180,60,20,0.3)':'rgba(200,100,40,0.2)';
          _roundRect(DESC_X+40,CY+CH-60,PW-DESC_X+PX-96,34,8);ctx.fill();
          ctx.strokeStyle=player.activeTool===sel.id?'#c04020':'#e08830';ctx.lineWidth=1.5;_roundRect(DESC_X+40,CY+CH-60,PW-DESC_X+PX-96,34,8);ctx.stroke();
          ctx.font='bold 13px "Courier New"';ctx.fillStyle=player.activeTool===sel.id?'#e06040':'#e08830';
          ctx.textAlign='center';ctx.fillText(btnTxt,DESC_X+(PW-DESC_X+PX-16)/2,CY+CH-38);ctx.textAlign='left';
        }
      }
    }
    ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(PX,PY+PH-38,PW,38);
    ctx.fillStyle='rgba(200,100,40,0.3)';ctx.fillRect(PX+16,PY+PH-39,PW-32,1);
    ctx.font='11px "Courier New"';ctx.fillStyle='#888';ctx.textAlign='center';
    ctx.fillText('◀ ▶ Abas   ↑ ↓ Navegar   E Equipar/Desequipar   I Fechar',W/2,PY+PH-14);
    ctx.textAlign='left';
  }
};

// ── Dialog Bubble ─────────────────────────────────────────────────
let dlgFaceT=0;

// ── Corvan pixel-art (padrão de todas as fases) ──────────────────
function drawCorvan(cx,cy,scale=1,flipX=false,frame=0,activeTool=null){
  const S=scale;
  ctx.save();ctx.translate(cx,cy);if(flipX)ctx.scale(-1,1);
  const r=(x,y,w,h,fill,op)=>{ctx.fillStyle=fill;ctx.globalAlpha=op!==undefined?op:1;ctx.fillRect(x*S,y*S,w*S,h*S);ctx.globalAlpha=1;};
  const lb=0.7+Math.sin(frame*0.4)*0.3;
  r(7,3,18,2,'#3a2208');r(9,1,14,4,'#4a2e10');
  r(13,0,6,3,'#c8a020');r(14,0,4,2,'#ffe060');
  r(9,5,14,9,'#c88050');r(10,6,12,1,'#a86030');
  r(11,8,3,2,'#1a0a04');r(18,8,3,2,'#1a0a04');
  r(12,8,1,1,'#fff');r(19,8,1,1,'#fff');
  r(14,11,4,1,'#a86030');r(12,13,8,1,'#7a3820');
  r(13,14,6,2,'#c88050');
  r(8,16,16,13,'#b82010');r(15,17,2,1,'#8a1008');r(15,20,2,1,'#8a1008');r(15,23,2,1,'#8a1008');
  r(12,16,3,3,'#d03018');r(17,16,3,3,'#d03018');
  r(8,28,16,2,'#2a1408');r(14,28,4,2,'#c88020');
  r(9,30,14,12,'#383838');r(15,36,2,6,'#282828');
  r(3,16,5,12,'#b82010');r(3,28,5,3,'#a86030');
  r(24,16,5,12,'#b82010');r(24,28,5,3,'#a86030');
  r(9,42,6,4,'#3a1e08');r(17,42,6,4,'#3a1e08');
  r(8,44,8,2,'#2a1008');r(16,44,8,2,'#2a1008');
  ctx.fillStyle='#ffe060';ctx.globalAlpha=0.25*lb;ctx.beginPath();ctx.arc(16*S,1*S,4*S,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=1;
  _drawCorvanTools(activeTool,S,frame,lb);
  ctx.restore();
}

const BUBBLE = {
  active: false, queue: [], cb: null, lines: [],
  speakerTxt: 'CORVAN', faceFrame: 0,
  show(messages, cb, speaker='CORVAN') {
    this.queue = [...messages]; this.cb = cb; this.active = true;
    this.speakerTxt = speaker; G.dialog = true; this._next();
  },
  _next() {
    if (!this.queue.length) {
      this.active = false; G.dialog = false;
      if (this.cb) { const f=this.cb; this.cb=null; f(); }
      return;
    }
    const raw = this.queue.shift();
    this.lines = wrapText(raw, 480);
  },
  advance() { if (this.active) this._next(); },
  draw(player) {
    if (!this.active) return;
    this.faceFrame += 0.03;
    const FONT='15px "Courier New"', NAMEFNT='bold 12px "Courier New"';
    ctx.font = FONT;
    const lineH=24, pad=20, faceW=60, faceH=76, facePad=12, textAreaW=480;
    const bubW=facePad+faceW+facePad+textAreaW+pad;
    const bubH=Math.max(faceH+pad*2,this.lines.length*lineH+70)+pad;
    const pcx=player.x-cam.x+player.w/2, pcy=player.y-cam.y;
    let bx=pcx-bubW/2, by=pcy-bubH-28;
    bx=Math.max(12,Math.min(bx,W-bubW-12));
    if(by<40) by=pcy+player.h+10;
    by=Math.max(40,Math.min(by,H-bubH-10));
    ctx.shadowColor='rgba(0,0,0,0.6)'; ctx.shadowBlur=12;
    ctx.fillStyle='rgba(6,3,0,0.94)';
    roundRect(bx,by,bubW,bubH,14); ctx.fill();
    ctx.shadowBlur=0;
    ctx.strokeStyle='#c86020'; ctx.lineWidth=2.5;
    roundRect(bx,by,bubW,bubH,14); ctx.stroke();
    const tailBaseX=Math.max(bx+30,Math.min(pcx,bx+bubW-30));
    const tailTopY=by+bubH, tailTipX=pcx, tailTipY=Math.min(pcy,tailTopY+36);
    ctx.fillStyle='rgba(6,3,0,0.94)';
    ctx.beginPath(); ctx.moveTo(tailBaseX-14,tailTopY); ctx.lineTo(tailBaseX+14,tailTopY); ctx.lineTo(tailTipX,tailTipY); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='#c86020'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(tailBaseX-14,tailTopY); ctx.lineTo(tailTipX,tailTipY); ctx.lineTo(tailBaseX+14,tailTopY); ctx.stroke();
    const fx=bx+facePad, fy=by+pad;
    ctx.fillStyle='rgba(20,10,2,0.85)';roundRect(fx,fy,faceW,faceH,6);ctx.fill();
    ctx.strokeStyle='rgba(200,160,40,0.45)';ctx.lineWidth=1.5;roundRect(fx,fy,faceW,faceH,6);ctx.stroke();
    const faceScale=faceW/18*0.82, sprX=fx+faceW/2-16*faceScale, sprY=fy+4;
    ctx.save();
    ctx.beginPath();roundRect(fx+1,fy+1,faceW-2,faceH-2,5);ctx.clip();
    drawCorvan(sprX,sprY,faceScale,false,this.faceFrame*4,null);
    const mouthY=sprY+13*faceScale,mouthX=sprX+12*faceScale,mouthW=8*faceScale;
    const mOpen=Math.abs(Math.sin(this.faceFrame*4))*1.8*faceScale;
    if(mOpen>0.5){ctx.fillStyle='#2a0e06';ctx.fillRect(mouthX,mouthY,mouthW,mOpen);}
    ctx.restore();
    const tx=fx+faceW+facePad;
    ctx.font=NAMEFNT; ctx.fillStyle='#e08830'; ctx.fillText(this.speakerTxt,tx,by+pad+14);
    ctx.fillStyle='rgba(200,130,40,0.35)';ctx.fillRect(tx,by+pad+20,textAreaW,1);
    ctx.font=FONT; ctx.fillStyle='#f0e8c0';
    this.lines.forEach((l,i)=>ctx.fillText(l,tx,by+pad+40+i*lineH));
    const pulse=0.5+Math.sin(Date.now()/400)*0.5;
    ctx.fillStyle=`rgba(200,130,40,${pulse})`; ctx.font='12px "Courier New"';
    ctx.textAlign='right'; ctx.fillText('[E] Continuar →',bx+bubW-pad,by+bubH-10); ctx.textAlign='left';
  }
};

function showDialog(lines, cb, speaker='CORVAN') { BUBBLE.show(lines, cb, speaker); }
function checkDlg() { if (G.dialog && !INV.open && isE()) { BUBBLE.advance(); jp['KeyE']=false; jp['Enter']=false; jp['_te']=false; } }

// ── Notification ──────────────────────────────────────────────────
let notifText='', notifAlpha=0, notifTimer=0;
function notify(msg, ms=2800){ notifText=msg; notifTimer=ms; notifAlpha=1; }
function tickNotif(){ if(notifTimer>0){ notifTimer-=16; if(notifTimer<=0) notifAlpha=0; else notifAlpha=Math.min(1,notifTimer/300); } }
function drawNotif(){
  if(notifAlpha<=0) return;
  ctx.save(); ctx.globalAlpha=notifAlpha;
  ctx.font='14px "Courier New"';
  const tw=ctx.measureText(notifText).width+32, nx=(W-tw)/2, ny=46;
  ctx.fillStyle='rgba(0,0,0,0.82)'; roundRect(nx,ny,tw,28,6); ctx.fill();
  ctx.strokeStyle='#e08830'; ctx.lineWidth=1.5; roundRect(nx,ny,tw,28,6); ctx.stroke();
  ctx.fillStyle='#e08830'; ctx.textAlign='center'; ctx.fillText(notifText,W/2,ny+19); ctx.textAlign='left';
  ctx.restore();
}

// ── Pop-up informativo (mineral/item) ────────────────────────────
const POPUP = {
  active: false, title:'', lines:[], icon:'🟠', timer:0,
  show(title, icon, text, duration=8000){
    this.active=true; this.title=title; this.icon=icon;
    this.lines=text.split('\n'); this.timer=duration;
  },
  tick(){ if(this.timer>0){ this.timer-=16; if(this.timer<=0) this.active=false; } },
  draw(){
    if(!this.active) return;
    const alpha=Math.min(1,this.timer/400);
    const PW=360,PH=this.lines.length*20+100,PX=W-PW-20,PY=60;
    ctx.save(); ctx.globalAlpha=alpha;
    ctx.fillStyle='rgba(5,2,0,0.93)';_roundRect(PX,PY,PW,PH,12);ctx.fill();
    ctx.strokeStyle='#c86020';ctx.lineWidth=2;_roundRect(PX,PY,PW,PH,12);ctx.stroke();
    ctx.font='32px serif';ctx.textAlign='center';ctx.fillText(this.icon,PX+40,PY+46);
    ctx.font='bold 13px "Courier New"';ctx.fillStyle='#e08830';ctx.fillText(this.title,PX+60,PY+28);
    ctx.font='12px "Courier New"';ctx.fillStyle='#f0e8c0';ctx.textAlign='left';
    this.lines.forEach((l,i)=>ctx.fillText(l,PX+16,PY+52+i*20));
    ctx.restore();
  }
};

// ── Enemy ─────────────────────────────────────────────────────────
class Enemy {
  constructor(x,y,type,patrol){
    this.x=x; this.y=y; this.spawnX=x; this.type=type;
    // Tipos: 'lobo' (lobo cinzento), 'urso' (urso negro)
    this.w=type==='urso'?52:38; this.h=type==='urso'?52:42;
    this.patrol=patrol; this.vx=1.2; this.facing=1; this.dead=false; this.frame=0;
  }
  update(plats,player){
    if(this.dead) return;
    this.x+=this.vx; this.frame+=0.07;
    let onG=false;
    for(const p of plats){
      if(p.type==='spike'||p.type==='water'||p.type==='_dead') continue;
      if(this.x+this.w>p.x&&this.x<p.x+p.w&&this.y+this.h>=p.y&&this.y+this.h<=p.y+10) onG=true;
    }
    const edge=this.vx>0?this.x+this.w:this.x;
    let onEdge=false;
    for(const p of plats){
      if(p.type==='spike'||p.type==='water'||p.type==='_dead') continue;
      if(edge>p.x&&edge<p.x+p.w&&this.y+this.h+2>=p.y&&this.y+this.h+2<=p.y+12) onEdge=true;
    }
    if((onG&&!onEdge)||Math.abs(this.x-this.spawnX)>this.patrol) this.vx=-this.vx;
    this.facing=this.vx>0?1:-1;
  }
  draw(){
    if(this.dead) return;
    const sx=this.x-cam.x, sy=this.y-cam.y;
    if(sx<-80||sx>W+80) return;
    ctx.save(); ctx.translate(sx+this.w/2,sy+this.h);
    if(this.facing===-1) ctx.scale(-1,1);
    if(this.type==='urso'){
      // Urso negro — corpo robusto
      ctx.fillStyle='#1a1a1a'; ctx.fillRect(-22,-52,44,52);
      ctx.fillStyle='#0d0d0d'; ctx.fillRect(-20,-50,40,18); // cabeça
      ctx.fillStyle='#f0c080'; ctx.fillRect(-8,-52,6,8); ctx.fillRect(4,-52,6,8); // orelhas
      ctx.fillStyle='#333'; ctx.fillRect(-10,-44,7,7); ctx.fillRect(4,-44,7,7); // olhos area
      ctx.fillStyle='#ffd0a0'; ctx.fillRect(-6,-42,4,4); ctx.fillRect(4,-42,4,4); // olhos
      ctx.fillStyle='#1a1a1a'; ctx.fillRect(-18,-32,14,30); ctx.fillRect(4,-32,14,30); // pernas
      // movimento de andar
      const bob=Math.sin(this.frame*Math.PI)*4;
      ctx.fillStyle='#2a2a2a'; ctx.fillRect(-22,-48+bob,8,14); ctx.fillRect(14,-48-bob,8,14);
    } else {
      // Lobo cinzento
      ctx.fillStyle='#707080';
      ctx.fillRect(-16,-38,32,38);
      ctx.fillStyle='#5a5a6a'; ctx.fillRect(-14,-36,28,16);
      ctx.fillStyle='#888898'; ctx.fillRect(-7,-42,5,8); ctx.fillRect(3,-42,5,8);
      ctx.fillStyle='#e8d090'; ctx.fillRect(-5,-36,4,4); ctx.fillRect(3,-36,4,4);
      ctx.fillStyle='#909098'; ctx.fillRect(12,-26,8,24);
      const tail=Math.sin(this.frame*Math.PI)*8;
      ctx.fillStyle='#707080'; ctx.fillRect(-24,-20+tail,10,6);
      ctx.fillStyle='#ccccdd'; ctx.fillRect(-20,-20+tail,6,4);
    }
    ctx.restore();
  }
}

// ── Águia Careca companion ────────────────────────────────────────
class AguiaCareca {
  constructor(){
    this.x=400; this.y=200; this.angle=0;
    this.frame=0; this.sparkT=0; this.sparks=[];
    this.visible=false; this.introShown=false;
    this.landX=0; this.landY=0;
    this.state='orbit'; // 'orbit' | 'land' | 'landed'
  }
  update(player){
    this.frame+=0.06;
    this.sparkT++;
    if(this.state==='orbit'){
      this.angle+=0.016;
      const orbitR=120;
      const orbitX=player.x+Math.cos(this.angle)*orbitR*1.3;
      const orbitY=player.y-180+Math.sin(this.angle)*orbitR*0.5;
      this.x+=(orbitX-this.x)*0.04;
      this.y+=(orbitY-this.y)*0.04;
    } else if(this.state==='land'){
      this.x+=(this.landX-this.x)*0.06;
      this.y+=(this.landY-this.y)*0.06;
      if(Math.abs(this.x-this.landX)<8&&Math.abs(this.y-this.landY)<8) this.state='landed';
    }
    if(this.sparkT%15===0&&this.state==='orbit'){
      this.sparks.push({x:this.x,y:this.y,vx:(Math.random()-.5)*.7,vy:(Math.random()+.3)*.5,life:50,max:50,size:2+Math.random()*2});
    }
    for(let i=this.sparks.length-1;i>=0;i--){
      const s=this.sparks[i];s.x+=s.vx;s.y+=s.vy;s.life--;
      if(s.life<=0)this.sparks.splice(i,1);
    }
  }
  land(x,y){ this.state='land'; this.landX=x; this.landY=y; }
  draw(){
    for(const s of this.sparks){
      ctx.save(); ctx.globalAlpha=(s.life/s.max)*0.6;
      ctx.fillStyle='#e08040';
      ctx.beginPath();ctx.arc(s.x-cam.x,s.y-cam.y,s.size*(s.life/s.max),0,Math.PI*2);ctx.fill();
      ctx.restore();
    }
    const sx=this.x-cam.x, sy=this.y-cam.y;
    if(sx<-120||sx>W+120) return;
    ctx.save();
    if(this.state==='orbit'){
      const glow=ctx.createRadialGradient(sx,sy,0,sx,sy,60);
      glow.addColorStop(0,'rgba(240,180,60,0.2)');
      glow.addColorStop(1,'rgba(240,180,60,0)');
      ctx.fillStyle=glow;ctx.beginPath();ctx.arc(sx,sy,60,0,Math.PI*2);ctx.fill();
    }
    // Tentar usar sprite sheet SVG da águia
    if(IMG['aguia']&&IMG['aguia'].complete&&IMG['aguia'].naturalWidth>0){
      const dw=160, dh=Math.round(160*(AGUIA_FRAME_H/AGUIA_FRAME_W));
      const fi=Math.floor(this.frame)%AGUIA_N_FRAMES;
      const flipLeft=Math.cos(this.angle)<0;
      const srcX=fi*AGUIA_FRAME_W;
      if(flipLeft){ctx.translate(sx+dw/2,sy-dh/2);ctx.scale(-1,1);}
      else ctx.translate(sx-dw/2,sy-dh/2);
      ctx.drawImage(IMG['aguia'],srcX,0,AGUIA_FRAME_W,AGUIA_FRAME_H,0,0,dw,dh);
    } else {
      // Fallback: desenhar águia vetorial no canvas
      ctx.translate(sx,sy);
      const flap=Math.sin(this.frame*Math.PI/1.6)*18;
      // Corpo
      ctx.fillStyle='#3a3028';
      ctx.beginPath();ctx.ellipse(0,0,18,12,0,0,Math.PI*2);ctx.fill();
      // Asas
      ctx.fillStyle='#2a2018';
      ctx.beginPath();ctx.ellipse(-50,flap,48,9,Math.PI/10,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.ellipse(50,-flap,48,9,-Math.PI/10,0,Math.PI*2);ctx.fill();
      // Cabeça branca
      ctx.fillStyle='#f8f8f0';ctx.beginPath();ctx.arc(0,-16,11,0,Math.PI*2);ctx.fill();
      // Bico amarelo
      ctx.fillStyle='#f0c020';ctx.fillRect(9,-20,13,5);
      // Cauda branca
      ctx.fillStyle='#f8f8f0';
      ctx.beginPath();ctx.moveTo(-5,10);ctx.lineTo(5,10);ctx.lineTo(0,26);ctx.closePath();ctx.fill();
      // Olho
      ctx.fillStyle='#f8c040';ctx.beginPath();ctx.arc(4,-17,2.5,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#000';ctx.beginPath();ctx.arc(5,-17,1.2,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }
  speak(msg){ showDialog(msg, null, '🦅 ÁGUIA CARECA'); }
}

// ── Collectible (Col) ─────────────────────────────────────────────
// Tipos: 'cobre' (fragmento alaranjado), 'gorget', 'maco', 'martelo', 'escopro'
class Col {
  constructor(x,y,type){this.x=x;this.y=y;this.w=30;this.h=30;this.type=type;this.done=false;this.t=Math.random()*Math.PI*2;}
  tick(){if(!this.done)this.t+=0.06;}
  draw(){
    if(this.done) return;
    const sx=this.x-cam.x, sy=this.y-cam.y+Math.sin(this.t)*5;
    if(sx<-50||sx>W+50) return;
    ctx.save();ctx.translate(sx+15,sy+15);
    if(this.type==='cobre'){
      // Fragmento de cobre nativo — alaranjado-avermelhado irregular
      ctx.fillStyle='#c86020'; ctx.beginPath(); ctx.arc(0,0,12,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#e08840'; ctx.beginPath(); ctx.arc(-3,-3,7,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#a04010'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(0,0,12,0,Math.PI*2); ctx.stroke();
      // brilho metálico
      ctx.fillStyle='rgba(255,200,100,0.45)'; ctx.beginPath(); ctx.arc(-4,-5,4,0,Math.PI*2); ctx.fill();
    } else if(this.type==='gorget'){
      // Gorget de cobre — ornamento semicircular
      ctx.strokeStyle='#c86020'; ctx.lineWidth=3;
      ctx.beginPath(); ctx.arc(0,4,14,Math.PI,0); ctx.stroke();
      ctx.fillStyle='#e08840';
      for(let i=0;i<5;i++){const gx=-10+i*5;ctx.fillRect(gx,-4,3,8);}
      ctx.fillStyle='rgba(240,160,60,0.5)'; ctx.beginPath(); ctx.arc(-4,-2,4,0,Math.PI*2); ctx.fill();
    } else if(this.type==='maco'){
      // Glow pulsante para destaque
      const gp=0.3+Math.sin(this.t*1.5)*0.2;
      ctx.fillStyle=`rgba(180,180,240,${gp})`; ctx.beginPath(); ctx.arc(0,2,22,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle=`rgba(200,200,255,${gp+0.1})`; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,2,22,0,Math.PI*2); ctx.stroke();
      // Maço de pedra — ovalo cinza pesado
      ctx.fillStyle='#a0a0b8';ctx.beginPath();ctx.ellipse(0,2,12,9,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#8a8a9a';ctx.beginPath();ctx.ellipse(-2,0,10,8,0,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#d0d0e8';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(0,2,12,9,0,0,Math.PI*2);ctx.stroke();
      // Label
      ctx.fillStyle='rgba(220,220,255,0.9)'; ctx.font='bold 9px "Courier New"'; ctx.textAlign='center';
      ctx.fillText('🪨',0,-18);
    } else if(this.type==='martelo'){
      // Glow pulsante para destaque
      const gp=0.3+Math.sin(this.t*1.5+1)*0.2;
      ctx.fillStyle=`rgba(180,180,240,${gp})`; ctx.beginPath(); ctx.arc(0,0,22,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle=`rgba(200,200,255,${gp+0.1})`; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,0,22,0,Math.PI*2); ctx.stroke();
      // Martelo de pedra — mais angular
      ctx.fillStyle='#9a9aaa'; ctx.fillRect(-10,-6,20,12);
      ctx.fillStyle='#7a7a8a'; ctx.fillRect(-12,-8,6,16);
      ctx.strokeStyle='#c0c0d8'; ctx.lineWidth=1.5; ctx.strokeRect(-10,-6,20,12);
      // Label
      ctx.fillStyle='rgba(220,220,255,0.9)'; ctx.font='bold 9px "Courier New"'; ctx.textAlign='center';
      ctx.fillText('🪓',0,-18);
    } else if(this.type==='escopro'){
      // Escopro de cobre — barra alaranjada fina
      ctx.fillStyle='#c86020'; ctx.fillRect(-3,-16,6,28);
      ctx.fillStyle='#e08840'; ctx.fillRect(-2,-14,4,12);
      ctx.fillStyle='#a04010'; ctx.fillRect(-3,8,6,4);
      ctx.strokeStyle='#804010'; ctx.lineWidth=1; ctx.strokeRect(-3,-16,6,28);
    }
    ctx.restore();
  }
}

// ── Calcita (imitador — obstáculo cena 3) ────────────────────────
class Calcita {
  constructor(x,y){this.x=x;this.y=y;this.w=28;this.h=28;this.type='calcita';this.done=false;this.t=Math.random()*Math.PI*2;}
  tick(){if(!this.done)this.t+=0.06;}
  draw(){
    if(this.done) return;
    const sx=this.x-cam.x, sy=this.y-cam.y+Math.sin(this.t)*4;
    if(sx<-40||sx>W+40) return;
    ctx.save();ctx.translate(sx+14,sy+14);
    // Calcita — aspecto branco-amarelado similar ao cobre mas diferente
    ctx.fillStyle='#e8e0c0'; ctx.beginPath(); ctx.arc(0,0,11,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#d4c8a0'; ctx.beginPath(); ctx.arc(-2,-2,7,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='#b8a870'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(0,0,11,0,Math.PI*2); ctx.stroke();
    // brilho diferente do cobre
    ctx.fillStyle='rgba(255,255,220,0.5)'; ctx.beginPath(); ctx.arc(-3,-3,3,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }
}

// ── Trigger ───────────────────────────────────────────────────────
class Trigger{
  constructor(x,y,w,h,label,fn){this.x=x;this.y=y;this.w=w;this.h=h;this.label=label;this.fn=fn;this.done=false;}
  draw(px,py){
    if(this.done) return;
    const near=Math.abs((px+24)-(this.x+this.w/2))<this.w/2+72&&Math.abs((py+40)-(this.y+this.h/2))<this.h/2+72;
    if(!near) return;
    const sx=this.x+this.w/2-cam.x, sy=this.y-cam.y-26+Math.sin(Date.now()/350)*4;
    const txt='[E] '+this.label;
    ctx.font='14px "Courier New"';
    const tw=ctx.measureText(txt).width+24;
    ctx.fillStyle='rgba(0,0,0,0.78)'; roundRect(sx-tw/2,sy-16,tw,24,4); ctx.fill();
    ctx.strokeStyle='#e08830'; ctx.lineWidth=1.5; roundRect(sx-tw/2,sy-16,tw,24,4); ctx.stroke();
    ctx.fillStyle='#e08830'; ctx.textAlign='center'; ctx.fillText(txt,sx,sy); ctx.textAlign='left';
  }
}

// ── Player ────────────────────────────────────────────────────────
class Player{
  constructor(x,y){
    this.x=x; this.y=y; this.w=40; this.h=80;
    this.vx=0; this.vy=0; this.onG=false; this.facing=1;
    this.hp=3; this.maxHp=3; this.inv=0; this.dead=false;
    this.activeTool=null; this.frame=0; this.ft=0; this.walkT=0; this.state='idle';
    this.coyote=0; this.jbuf=0; this.onMoving=null;
    this.items=[]; this.score=0; this.interactAnim=0;
  }
  overlaps(r){return this.x<r.x+r.w&&this.x+this.w>r.x&&this.y<r.y+r.h&&this.y+this.h>r.y;}
  near(r,d=80){return Math.abs(this.x+20-(r.x+r.w/2))<r.w/2+d&&Math.abs(this.y+40-(r.y+r.h/2))<r.h/2+d;}
  update(level){
    if(G.dialog) return;
    if(isL()){this.vx=-PSPD;this.facing=-1;}
    else if(isR()){this.vx=PSPD;this.facing=1;}
    else this.vx*=0.7;
    if(this.onG) this.coyote=8; else if(this.coyote>0) this.coyote--;
    if(isJ()) this.jbuf=10;
    if(this.jbuf>0) this.jbuf--;
    if(this.jbuf>0&&(this.onG||this.coyote>0)){this.vy=JUMPF;this.onG=false;this.coyote=0;this.jbuf=0;sfx('jump');}
    if(this.onMoving){this.x+=this.onMoving.vx||0;this.y+=this.onMoving.vy||0;}
    this.onMoving=null;
    this.vy=Math.min(this.vy+GRAV,MAXFALL);
    this.x+=this.vx; this._colX(level.plats);
    this.onG=false; this.y+=this.vy; this._colY(level.plats);
    this.x=Math.max(0,this.x);
    if(!this.inv){
      for(const p of level.plats)
        if((p.type==='spike'||p.type==='water')&&this.overlaps(p)) this._hurt(p.type==='water'?3:1,level);
      for(const e of level.enemies){
        if(!e.dead&&this.overlaps(e)){
          if(this.vy>2&&this.y+this.h<e.y+e.h*0.5){e.dead=true;this.vy=-8;burst(e.x+20,e.y,'#e08040',10);sfx('coin');}
          else{this._hurt(1,level);this.vy=-7;this.vx=(this.x<e.x?-7:7);}
        }
      }
    }
    if(this.inv>0) this.inv--;
    if(this.interactAnim>0) this.interactAnim--;
    for(const c of level.cols){
      if(!c.done&&this.overlaps(c)){
        c.done=true;
        if(c.type==='cobre'){
          this.score+=10; this.items.push('cobre'); sfx('copper');
          burst(c.x+15,c.y+15,'#e08040',12);
          _journalColetar('cobre', this.items.filter(i=>i==='cobre').length);
          notify('🟠 Cobre Nativo coletado! ('+this.items.filter(i=>i==='cobre').length+'/3)');
          POPUP.show('Cobre Nativo','🟠','Cor alaranjada, maleável, 8,9 g/cm³.\nTerceiro melhor condutor elétrico.\nNos seres vivos: essencial para hemoglobina.');
        } else {
          this.items.push(c.type); sfx('item'); burst(c.x+15,c.y+15,'#e08040',12); _journalColetar(c.type);
          if(c.type==='gorget') notify('🌐 Gorget de Cobre encontrado!');
          else if(c.type==='maco')    notify('🪨 Maço de Pedra coletado!');
          else if(c.type==='martelo') notify('🪓 Martelo de Pedra coletado!');
          else if(c.type==='escopro') notify('🔧 Escopro de Cobre recebido!');
        }
      }
    }
    // Calcitas — Teste do Martelinho
    if(level.calcitas){
      for(const cl of level.calcitas){
        if(!cl.done&&this.overlaps(cl)&&this.items.includes('martelo')){
          cl.done=true; sfx('crack');
          burst(cl.x+14,cl.y+14,'#e8e0c0',10,2);
          notify('💥 Calcita! Estilhaça — não é cobre.');
        }
      }
    }
    if(isE()&&(this.onG||this.coyote>0||this.vy===0)){for(const t of level.triggers){if(!t.done&&this.near(t)){t.fn(this,level);break;}}}
    if(this.y>level.H+200) this._hurt(3,level);
    if(!this.onG&&this.vy<0)      this.state='jump';
    else if(!this.onG&&this.vy>0) this.state='fall';
    else if(Math.abs(this.vx)>0.5) this.state='run';
    else this.state='idle';
    if(Math.abs(this.vx)>0.5) this.walkT+=0.18;
    const spd=this.state==='run'?6:this.state==='idle'?18:8;
    if(++this.ft>=spd){this.ft=0;this.frame=(this.frame+1)%6;}
  }
  _colX(plats){
    for(const p of plats){
      if(p.type==='spike'||p.type==='water'||p.type==='_dead') continue;
      if(this.overlaps(p)){
        if(this.y+this.h<=p.y+4) continue;
        if(this.vx>0) this.x=p.x-this.w; else this.x=p.x+p.w;
        this.vx=0;
      }
    }
  }
  _colY(plats){
    for(const p of plats){
      if(p.type==='spike'||p.type==='water'||p.type==='_dead') continue;
      if(p.type==='trapdoor'&&this.vy<0) continue;
      if(this.overlaps(p)){
        if(this.vy>=0){
          this.y=p.y-this.h; this.vy=0; this.onG=true;
          if(p.moving) this.onMoving=p;
          if(p.type==='trapdoor'&&p.crumble===undefined) p.crumble=70;
        } else {
          if(this.y+this.h>p.y+p.h-4){ this.y=p.y+p.h; this.vy=Math.abs(this.vy)*0.2; }
        }
      }
    }
  }
  _hurt(dmg,level){
    if(this.inv>0) return;
    this.hp-=dmg; this.inv=100;
    burst(this.x+20,this.y+40,'#ff4040',10); sfx('hit');
    if(this.hp<=0){this.hp=0;this.dead=true;}
  }
  draw(){
    if(this.dead) return;
    const S=1.5, FOOT_Y=46*S, CW=32*S;
    const dx=this.x-cam.x+this.w/2-CW/2;
    const dy=this.y-cam.y+this.h-FOOT_Y;
    const flip=this.facing===-1;
    const wf=this.state==='run'?this.walkT:(this.state==='idle'?Date.now()/800:0);
    const _tool=this.activeTool||null;
    ctx.save();drawCorvan(dx,dy,S,flip,wf,_tool);ctx.restore();
    if(this.inv>0&&Math.floor(this.inv/6)%2===0){ctx.fillStyle='rgba(255,60,60,0.35)';ctx.fillRect(this.x-cam.x,this.y-cam.y,this.w,this.h);}
  }
}


// ── Background draw ───────────────────────────────────────────────
function drawBg(bgKey){
  const img=IMG[bgKey];
  if(img&&img.complete&&img.naturalWidth>0){
    const scale=Math.max(W/img.naturalWidth, H/img.naturalHeight);
    const sw=img.naturalWidth*scale, sh=img.naturalHeight*scale;
    ctx.drawImage(img,(W-sw)/2,(H-sh)/2,sw,sh);
  } else {
    // Fallback: Lago Superior — paleta escura com névoa
    const fb={
      bg01:'#1a2838', bg02:'#1c2230', bg03:'#181822', bg04:'#101820'
    };
    const grd=ctx.createLinearGradient(0,0,0,H);
    grd.addColorStop(0,fb[bgKey]||'#111'); grd.addColorStop(1,'#050508');
    ctx.fillStyle=grd; ctx.fillRect(0,0,W,H);
  }
  ctx.fillStyle='rgba(0,0,0,0.22)'; ctx.fillRect(0,0,W,H);
}

// ═══════════════════════════════════════════════════════════════
//  LEVEL BUILDERS
// ═══════════════════════════════════════════════════════════════

// ── Cena 1: Início ── costa basáltica, encontrar ferramentas e Águia
function buildL1(){
  const FL=560,WW=3200,WH=900;
  const plats=[
    solid(0,FL,500,WH-FL),
    solid(580,FL,200,WH-FL), solid(860,FL,180,WH-FL),
    solid(1120,FL,220,WH-FL), solid(1420,FL,200,WH-FL),
    solid(1700,FL,240,WH-FL), solid(1980,FL,260,WH-FL),
    solid(2280,FL,200,WH-FL), solid(2560,FL,220,WH-FL),
    solid(2820,FL,600,WH-FL),
    // Plataformas de pedra rochosa
    solid(200,FL-160,130,18), solid(420,FL-240,120,18),
    solid(660,FL-200,130,18), solid(900,FL-280,120,18),
    solid(1100,FL-170,140,18), solid(1320,FL-290,120,18),
    solid(1500,FL-200,150,18), solid(1760,FL-270,130,18),
    solid(2060,FL-180,150,18), solid(2260,FL-300,120,18),
    solid(2480,FL-220,140,18), solid(2700,FL-290,120,18),
    // Plataformas móveis sobre água do lago
    movH(500,FL-36,80,500,580,2.2), movH(780,FL-36,80,780,860,2.0),
    movH(1040,FL-36,80,1040,1120,2.2), movH(1340,FL-36,80,1340,1420,1.8),
    movH(1620,FL-36,80,1620,1700,2.0), movH(1900,FL-36,80,1900,1980,2.2),
    movH(2200,FL-36,80,2200,2280,2.0), movH(2480,FL-36,80,2480,2560,1.8),
    movH(2740,FL-36,80,2740,2820,2.0),
    // Água fria do Lago Superior nos gaps
    water(500,FL,80,WH-FL), water(780,FL,80,WH-FL),
    water(1040,FL,80,WH-FL), water(1340,FL,80,WH-FL),
    water(1620,FL,80,WH-FL), water(1900,FL,80,WH-FL),
    water(2200,FL,80,WH-FL), water(2480,FL,80,WH-FL),
    water(2740,FL,80,WH-FL),
  ];
  const enemies=[
    new Enemy(700,FL-44,'lobo',70), new Enemy(1200,FL-44,'urso',60),
    new Enemy(1700,FL-44,'lobo',80), new Enemy(2100,FL-44,'urso',70),
    new Enemy(2400,FL-44,'lobo',80),
  ];
  const cols=[
    new Col(240,FL-50,'maco'),
    new Col(600,FL-50,'martelo'),
    ...[100,350,850,1180,1460,1740,2020,2300,2600,2860].map(x=>new Col(x,FL-50,'cobre')),
  ];
  const aguia=new AguiaCareca();
  aguia.visible=true;
  // Águia pousará em uma pedra no final da cena
  const AGUIA_ROCK_X=3000, AGUIA_ROCK_Y=FL-100;

  let aguiaInteracted=false, aguiaCooldown=0;
  const _fireAguia=(player,level)=>{
    if(G.transitioning||aguiaInteracted) return;
    aguiaInteracted=true;
    G.transitioning=true;
    player.interactAnim=60; sfx('item');
    level.aguia.land(AGUIA_ROCK_X,AGUIA_ROCK_Y);
    showDialog([
      '"A Águia Careca — Migizi para os Ojibwe. Símbolo sagrado que conecta o povo ao Grande Manitou."',
      '"Ela pousa aqui trazendo um presente dos ancestrais. O Escopro de Cobre — forjado sem fogo, só com força de pedra."',
      '"Cold hammering. Martelamento a frio. O cobre nativo do Lago Superior era tão puro que os Anishinaabe podiam moldá-lo assim — trabalhar o metal por 7.000 anos sem precisar de fornalha."',
      '"A Águia entrega o Escopro de Cobre. Próxima etapa: a geologia do lago."',
    ],()=>{
      player.items.push('escopro'); _journalColetar('escopro');
      notify('🔧 Escopro de Cobre recebido da Águia!'); sfx('gorget');
      POPUP.show('Escopro de Cobre','🔧','Cold Hammering — martelamento a frio.\nEndurece o cobre por encruamento.\nSem forno. Sem fogo. Só pedra e paciência.',6000);
      // Congelar jogador durante transição: invencibilidade + G.dialog bloqueia movimento
      player.inv=9999; player.vx=0; player.vy=0;
      G.dialog=true;
      setTimeout(()=>{G.dialog=false;G.transitioning=false;G.nextLevel();},2000);
    });
  };
  const triggers=[];
  return{
    id:1, bg:'bg01', W:WW, H:WH, startX:60, startY:FL-90,
    title:'A Costa Basáltica',
    hint:'Colete 🪨 Maço e 🪓 Martelo, depois [E] perto da Águia!',
    plats, enemies, cols, triggers, aguia,
    intro:[
      '"Estamos no Lago Superior, Michigan. Mas desta vez não viemos para o século XIX. Viemos há 7.000 anos."',
      '"Os povos Anishinaabe já sabiam sobre este cobre muito antes de qualquer europeu pisar aqui. E a forma como eles trabalhavam revela uma compreensão profunda da natureza do metal — sem fornos, sem fogo, apenas pedra contra pedra."',
      'Colete as ferramentas nativas e interaja com a Águia Careca sagrada!'
    ],
    update(player){
      tickMoving(this.plats);tickTrapdoors(this.plats);
      for(const e of this.enemies)e.update(this.plats,player);
      if(!G.dialog)this.aguia.update(player);
      for(const c of this.cols)c.tick(); POPUP.tick();
      // A águia orbita sempre o jogador — E aciona a interação
      if(aguiaCooldown>0) aguiaCooldown--;
      if(!aguiaInteracted&&!G.dialog&&!G.transitioning&&aguiaCooldown===0&&isE()){
        if(!player.items.includes('maco')||!player.items.includes('martelo')){
          const falta=!player.items.includes('maco')?'🪨 Maço de Pedra':'🪓 Martelo de Pedra';
          aguiaCooldown=30; // 30 frames de cooldown após diálogo de aviso
          showDialog(['"A Águia observa de longe — mas ainda não se aproxima."',`"Você precisa de ${falta} para interagir com ela."`]);
        } else {
          _fireAguia(player,this);
        }
      }
    },
    draw(player){
      // Névoa sobre o lago
      const mist=ctx.createLinearGradient(0,FL-cam.y-60,0,FL-cam.y);
      mist.addColorStop(0,'rgba(180,200,220,0)'); mist.addColorStop(1,'rgba(180,200,220,0.12)');
      ctx.fillStyle=mist; ctx.fillRect(0,FL-cam.y-60,W,60);
      this.aguia.draw();
      for(const e of this.enemies)e.draw();
      for(const c of this.cols)c.draw();
      // Prompt [E] só aparece quando o jogador já tem maço E martelo
      if(!aguiaInteracted&&player.items.includes('maco')&&player.items.includes('martelo')){
        const ax=this.aguia.x-cam.x, ay=this.aguia.y-cam.y;
        if(ax>0&&ax<W){
          const txt='[E] Interagir com a Águia';
          ctx.font='14px "Courier New"';
          const tw=ctx.measureText(txt).width+24;
          ctx.fillStyle='rgba(0,0,0,0.78)'; roundRect(ax-tw/2,ay-36,tw,24,4); ctx.fill();
          ctx.strokeStyle='#ffe060'; ctx.lineWidth=1.5; roundRect(ax-tw/2,ay-36,tw,24,4); ctx.stroke();
          ctx.fillStyle='#ffe060'; ctx.textAlign='center'; ctx.fillText(txt,ax,ay-18); ctx.textAlign='left';
        }
      }
    }
  };
}

// ── Cena 2: Geologia e Solo ── afloramento basalto, pop-ups científicos
function buildL2(){
  const FL=570,WW=3400,WH=900;
  const plats=[
    solid(0,FL,340,WH-FL), solid(420,FL,200,WH-FL), solid(700,FL,200,WH-FL),
    solid(980,FL,200,WH-FL), solid(1260,FL,220,WH-FL), solid(1560,FL,200,WH-FL),
    solid(1840,FL,240,WH-FL), solid(2140,FL,220,WH-FL), solid(2440,FL,240,WH-FL),
    solid(2760,FL,600,WH-FL),
    solid(160,FL-180,140,18), solid(380,FL-270,120,18), solid(600,FL-200,130,18),
    solid(820,FL-260,120,18), solid(1060,FL-180,140,18), solid(1300,FL-290,120,18),
    solid(1500,FL-200,140,18), solid(1740,FL-270,130,18), solid(2020,FL-200,140,18),
    solid(2260,FL-310,120,18), solid(2490,FL-220,140,18),
    movH(340,FL-36,80,340,420,2.0), movH(620,FL-36,80,620,700,2.2),
    movH(900,FL-36,80,900,980,2.0), movH(1180,FL-36,80,1180,1260,1.8),
    movH(1480,FL-36,80,1480,1560,2.2), movH(1760,FL-36,80,1760,1840,2.0),
    movH(2060,FL-36,80,2060,2140,2.2), movH(2380,FL-36,80,2380,2440,2.0),
    movH(2680,FL-36,80,2680,2760,1.8),
    water(340,FL,80,WH-FL), water(620,FL,80,WH-FL),
    water(900,FL,80,WH-FL), water(1180,FL,80,WH-FL),
    water(1480,FL,80,WH-FL), water(1760,FL,80,WH-FL),
    water(2060,FL,80,WH-FL), water(2380,FL,80,WH-FL),
    water(2680,FL,80,WH-FL),
  ];
  const enemies=[
    new Enemy(500,FL-44,'lobo',70), new Enemy(800,FL-44,'urso',60),
    new Enemy(1060,FL-44,'lobo',80), new Enemy(1380,FL-44,'urso',70),
    new Enemy(1620,FL-44,'lobo',90), new Enemy(1920,FL-44,'urso',80),
    new Enemy(2200,FL-44,'lobo',70), new Enemy(2560,FL-44,'urso',80),
    // Plataforma elevada
    new Enemy(200,FL-180-60,'lobo',45), new Enemy(640,FL-200-24,'lobo',50),
    new Enemy(1300,FL-290-24,'lobo',45), new Enemy(1520,FL-200-60,'urso',45),
  ];
  const cols=[
    ...[80,250,480,720,960,1200,1480,1720,2000,2260,2540,2760].map(x=>new Col(x,FL-50,'cobre')),
  ];
  // Pop-up de geologia automático
  const geoMessages=[
    {x:600,shown:false,text:'Geologia do Rift',icon:'🌋',body:'Há 1,1 bilhão de anos, o Midcontinent Rift System\nabriu o centro da América do Norte.\nFluidos quentes depositaram cobre puro nas fissuras\ndo basalto — o mais puro do mundo.'},
    {x:1400,shown:false,text:'Cobre Nativo',icon:'🟠',body:'Cobre nativo = Cu puro em estado natural.\nNão precisa de fundição nem de minério.\nA natureza já fez o trabalho.\nSó o Lago Superior tem depósitos desta escala.'},
    {x:2200,shown:false,text:'Cold Hammering',icon:'🔨',body:'Martelamento a frio = cold hammering.\nO cobre endurece por encruamento (work hardening)\nmas pode ser recozido e voltado a ser maleável.\nSem fogo. Só pedra contra metal.'},
  ];
  const triggers=[
    new Trigger(2870,FL-300,200,300,'Examinar Veio de Cobre',(player,level)=>{
      if(!player.items.includes('escopro')){notify('Você precisa do Escopro de Cobre!');return;}
      if(G.transitioning)return;
      level.triggers[0].done=true;
      G.transitioning=true;
      player.interactAnim=90; sfx('maco');
      showDialog([
        '"O escopro entra no basalto e revela o veio. Cobre puro — sem impurezas, sem fundição necessária. A natureza fez em um bilhão de anos o que a metalurgia levaria séculos para aprender."',
        '"Este veio se estende por quilômetros sob o lago. Os Anishinaabe conheciam cada afloramento. Para eles, extrair o cobre não era mineração — era uma conversa com a terra."',
        '"Sinto a diferença entre a rocha e o metal: o cobre cede, dobra, não estilhaça. Cold hammering. O segredo está no ritmo, não na força."',
        'Geologia compreendida. O cobre nativo revela seus segredos. Próxima etapa: a extração em campo!'
      ],()=>{notify('✦ Geologia compreendida! Vá para a extração!');if(G.player){G.player.inv=9999;G.player.vx=0;G.player.vy=0;}G.dialog=true;setTimeout(()=>{G.dialog=false;G.transitioning=false;G.nextLevel();},2000);});
    }),
  ];
  return{
    id:2, bg:'bg02', W:WW, H:WH, startX:60, startY:FL-90,
    title:'O Afloramento Basáltico',
    hint:'Colete o cobre nativo e examine o grande veio ao final!',
    plats, enemies, cols, triggers, geoMessages,
    intro:[
      '"Há 1,1 bilhão de anos, o Midcontinent Rift rasgou o centro da América do Norte. Fluidos quentes subiram pelas fissuras do basalto — e deixaram para trás algo único no mundo."',
      '"Este afloramento basáltico guarda fragmentos de cobre puro. Não em minério. Não ligado a outras rochas. Apenas metal, esperando ser coletado."',
      'Explore o afloramento, colete o cobre nativo e encontre o grande veio ao final da cena!'
    ],
    update(player){
      tickMoving(this.plats);tickTrapdoors(this.plats);
      for(const e of this.enemies)e.update(this.plats,player);
      for(const gm of this.geoMessages){
        if(!gm.shown&&player.x>gm.x&&!G.dialog){
          gm.shown=true;
          POPUP.show(gm.text, gm.icon, gm.body, 7000);
        }
      }
      for(const c of this.cols)c.tick();
      POPUP.tick();
    },
    draw(player){
      // Névoa azulada
      const mist=`rgba(20,40,80,0.08)`;
      ctx.fillStyle=mist; ctx.fillRect(0,0,W,H);
      // Veio de cobre no afloramento final
      if(!this.triggers[0].done){
        const vx=2870-cam.x, vy=FL-240-cam.y;
        if(vx>-60&&vx<W+60){
          ctx.fillStyle='#1c1c22'; ctx.fillRect(vx,vy,180,240);
          // Veios alaranjados de cobre
          ctx.strokeStyle='#c86020'; ctx.lineWidth=3;
          ctx.beginPath(); ctx.moveTo(vx+30,vy+20); ctx.lineTo(vx+90,vy+100); ctx.lineTo(vx+60,vy+200); ctx.stroke();
          ctx.strokeStyle='#e08040'; ctx.lineWidth=2;
          ctx.beginPath(); ctx.moveTo(vx+80,vy+30); ctx.lineTo(vx+140,vy+120); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(vx+50,vy+80); ctx.lineTo(vx+120,vy+180); ctx.stroke();
          // Brilho
          ctx.fillStyle='rgba(200,100,40,0.18)'; ctx.beginPath(); ctx.arc(vx+90,vy+120,60,0,Math.PI*2); ctx.fill();
          ctx.font='bold 13px "Courier New"'; ctx.fillStyle='#e08040'; ctx.textAlign='center';
          ctx.fillText('VEIO DE COBRE',vx+90,vy-14); ctx.textAlign='left';
        }
      }
      for(const e of this.enemies)e.draw();
      for(const c of this.cols)c.draw();
      for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

// ── Cena 3: Coleta — mini-puzzle percussão rítmica
// Teste do Martelinho: cobre dobra, calcita estilhaça
function buildL3(){
  const FL=570,WW=3600,WH=900;
  const plats=[
    solid(0,FL,280,WH-FL),
    solid(360,FL,140,WH-FL), solid(600,FL,120,WH-FL), solid(820,FL,160,WH-FL),
    solid(1080,FL,140,WH-FL), solid(1340,FL,160,WH-FL), solid(1610,FL,130,WH-FL),
    solid(1850,FL,280,WH-FL), solid(2240,FL,160,WH-FL), solid(2520,FL,140,WH-FL),
    solid(2780,FL,200,WH-FL),
    solid(140,FL-180,140,18), solid(500,FL-220,110,18), solid(740,FL-180,130,18),
    solid(980,FL-230,120,18), solid(1220,FL-160,140,18), solid(1480,FL-210,130,18),
    solid(1720,FL-200,145,18), solid(1980,FL-230,140,18), solid(2360,FL-180,130,18),
    solid(2640,FL-210,110,18),
    movH(280,FL-36,100,280,360,2.0), movH(740,FL-36,100,740,840,2.0),
    movH(980,FL-36,100,980,1080,2.0), movH(1520,FL-36,110,1520,1610,1.8),
    movH(2140,FL-36,100,2140,2240,2.2), movH(2680,FL-36,100,2680,2780,2.0),
    movV(2860,FL-100,100,FL-220,FL-36,2.0),
    trap(1080,FL-50,110),
    water(280,FL,80,WH-FL), water(500,FL,100,WH-FL),
    water(720,FL,100,WH-FL), water(980,FL,100,WH-FL),
    water(1220,FL,120,WH-FL), water(1520,FL,106,WH-FL),
    water(1750,FL,100,WH-FL), water(2140,FL,100,WH-FL),
    water(2424,FL,96,WH-FL), water(2680,FL,100,WH-FL),
    // Plataforma final com afloramento
    solid(2980,FL-80,120,80), solid(3020,FL-160,110,80),
    solid(3060,FL-240,140,80), solid(3100,FL-300,180,18),
    solid(3200,FL-360,200,18), solid(3320,FL-420,360,18),
    solid(3100,FL-240,580,WH-FL+240),
  ];
  const enemies=[
    new Enemy(420,FL-44,'lobo',60), new Enemy(880,FL-44,'urso',80),
    new Enemy(1380,FL-44,'lobo',70), new Enemy(1900,FL-44,'urso',100),
    new Enemy(2320,FL-44,'lobo',80),
  ];
  // Cobre nativo nos afloramentos
  const cols=[
    ...[100,200,420,640,880,1120,1380,1640,1900,2260,2540,2780].map(x=>new Col(x,FL-50,'cobre')),
    new Col(3450,FL-450,'gorget'),
  ];
  // Calcitas falsas intercaladas — Teste do Martelinho
  const calcitas=[
    new Calcita(480,FL-48), new Calcita(860,FL-48), new Calcita(1360,FL-48),
    new Calcita(1640,FL-48), new Calcita(2240,FL-48), new Calcita(2560,FL-48),
    // Calcitas em plataformas
    new Calcita(500,FL-230), new Calcita(980,FL-238), new Calcita(1480,FL-218),
  ];
  const triggers=[
    new Trigger(3400,FL-480,200,480,'Coletar o Gorget',(player,level)=>{
      if(!player.items.includes('gorget')){notify('Colete o Gorget de Cobre primeiro!');return;}
      if(G.transitioning)return;
      level.triggers[0].done=true;
      G.transitioning=true;
      player.interactAnim=90; sfx('gorget');
      showDialog([
        '"Cuidado: nem tudo que brilha aqui é cobre. A calcita pode ter tons amarelados parecidos. Mas experimente bater levemente com o martelo: o cobre vai amassar, vai ceder."',
        '"A calcita vai estilhaçar. A rocha revela o que é pelo que faz quando você a toca."',
        '"Este gorget pode ter viajado por toda a América do Norte. As rotas de comércio nativas conectavam este lago ao Golfo do México."',
        'Você encontrou o Gorget de Cobre Anishinaabe. Último capítulo: Conclusão.',
      ],()=>{notify('✦ Gorget encontrado! Vá à conclusão!');if(G.player){G.player.inv=9999;G.player.vx=0;G.player.vy=0;}G.dialog=true;setTimeout(()=>{G.dialog=false;G.transitioning=false;G.nextLevel();},2000);});
    }),
  ];
  return{
    id:3, bg:'bg03', W:WW, H:WH, startX:60, startY:FL-90,
    title:'O Teste do Martelinho',
    hint:'🔴 MARÉ SUBINDO! Teste antes de extrair: 🪓 Martelo [E] → cobre dobra, calcita estilhaça!',
    plats, enemies, cols, calcitas, triggers,
    intro:[
      '"Atenção: a maré do Lago Superior está subindo. O basalto vai ficar submerso em breve — você tem tempo limitado para extrair."',
      '"Use o Martelo de Pedra [E] para TESTAR antes de extrair. Cobre: dobra (som grave). Calcita: estilhaça (som seco). Cada erro desperdiça tempo."',
      'Colete 3 cobres verdadeiros e encontre o Gorget ANTES que a maré suba!'
    ],
    update(player){
      tickMoving(this.plats);tickTrapdoors(this.plats);
      for(const e of this.enemies)e.update(this.plats,player);
      for(const c of this.cols)c.tick();
      for(const cl of this.calcitas)cl.tick();
      POPUP.tick();
    },
    draw(player){
      // Glow do gorget no altar
      // Rising tide overlay
      if(this.tideLevel > 0){
        const tideSy = FL - cam.y - this.tideLevel;
        const wg = ctx.createLinearGradient(0,tideSy,0,tideSy+this.tideLevel);
        wg.addColorStop(0,'rgba(20,50,120,0.7)'); wg.addColorStop(1,'rgba(5,20,80,0.9)');
        ctx.fillStyle=wg; ctx.fillRect(0,tideSy,W,this.tideLevel);
        // Wave line
        ctx.strokeStyle='rgba(80,140,220,0.6)'; ctx.lineWidth=3;
        ctx.beginPath();
        for(let wx=0;wx<W;wx+=4) ctx.lineTo(wx, tideSy + Math.sin((wx+Date.now()/200)*0.08)*6);
        ctx.stroke();
        // Tide warning bar
        const tpct = Math.min(1, this.tideLevel/120);
        ctx.fillStyle=`rgba(${Math.round(tpct*200)},${Math.round((1-tpct)*120)},20,0.85)`;
        ctx.fillRect(W-180,10,170*tpct,14);
        ctx.strokeStyle='rgba(100,180,255,0.6)'; ctx.lineWidth=1.5; ctx.strokeRect(W-180,10,170,14);
        ctx.font='10px "Courier New"'; ctx.fillStyle='#80c8ff'; ctx.textAlign='right';
        ctx.fillText('🌊 MARÉ',W-12,22); ctx.textAlign='left';
      }
      const ag=ctx.createRadialGradient(3450-cam.x,FL-450-cam.y,0,3450-cam.x,FL-450-cam.y,160);
      ag.addColorStop(0,'rgba(200,100,40,0.22)');ag.addColorStop(1,'rgba(200,100,40,0)');
      ctx.fillStyle=ag;ctx.fillRect(3270-cam.x,FL-500-cam.y,360,300);
      // Fogueiras/tochas nativas
      for(const tx of [3150,3500]){
        const tcx=tx-cam.x, flk=Math.sin(Date.now()/80+tx)*3;
        ctx.fillStyle='#3a2010'; ctx.fillRect(tcx-3,FL-180-cam.y,7,80);
        ctx.fillStyle=`rgba(200,${100+flk|0},0,0.9)`;ctx.beginPath();ctx.arc(tcx,FL-184-cam.y+flk,10+flk,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=`rgba(240,${160+flk|0},60,0.35)`;ctx.beginPath();ctx.arc(tcx,FL-200-cam.y+flk,20+flk,0,Math.PI*2);ctx.fill();
      }
      for(const e of this.enemies)e.draw();
      for(const c of this.cols)c.draw();
      for(const cl of this.calcitas)cl.draw();
      for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

// ── Cena 4: Conclusão — beira do lago, rota comercial, Gorget
function buildL4(){
  const FL=600,WW=3200,WH=900;
  const plats=[
    solid(0,FL,380,WH-FL), solid(460,FL,320,WH-FL), solid(870,FL,360,WH-FL),
    solid(1330,FL,380,WH-FL), solid(1810,FL,400,WH-FL), solid(2320,FL,680,WH-FL),
    solid(200,FL-140,160,18), solid(400,FL-240,140,18), solid(600,FL-180,155,18),
    solid(840,FL-250,140,18), solid(1060,FL-200,155,18), solid(1280,FL-300,130,18),
    solid(1540,FL-200,175,18), solid(1760,FL-280,150,18), solid(2050,FL-180,160,18),
    // Degraus finais de pedra
    solid(2380,FL-80, 560,80), solid(2440,FL-160,500,80),
    solid(2510,FL-240,440,80), solid(2590,FL-300,380,18),
    solid(2680,FL-360,320,18), solid(2780,FL-420,260,18),
    movH(440,FL-180,120,440,730,2.2),
    movH(1380,FL-150,110,1380,1680,2.0),
    movH(2240,FL-140,110,2240,2380,1.8),
    trap(340,FL-80,110), trap(1100,FL-90,100), trap(2100,FL-80,110),
    spike(395,FL-20,50), spike(810,FL-20,50), spike(1250,FL-20,50),
    spike(1730,FL-20,50), spike(2250,FL-20,60),
    water(440,FL,320,WH-FL), water(870,FL,300,WH-FL),
    water(1330,FL,320,WH-FL), water(1810,FL,360,WH-FL),
  ];
  const aguia=new AguiaCareca();
  aguia.visible=true;
  const aguiaMessages=[
    {x:500,  shown:false, text:'"Migizi — a Águia. Para os Ojibwe eu carrego a visão dos ancestrais, o conhecimento que veio antes de tudo."'},
    {x:1300, shown:false, text:'"Este cobre viajou pela América do Norte por 7.000 anos antes dos europeus chegarem. Cada gorget, cada faca — uma rede de conexão."'},
    {x:2100, shown:false, text:'"O metal que você carrega foi tirado desta terra com respeito. Esse é o ensinamento — a terra dá, mas exige cuidado."'},
    {x:2700, shown:false, text:'"No altar do Lago Superior, complete a missão. O gorget volta para a terra como memória."'},
  ];
  const enemies=[
    new Enemy(200,FL-44,'lobo',60), new Enemy(680,FL-44,'urso',70),
    new Enemy(1100,FL-44,'lobo',80), new Enemy(1600,FL-44,'urso',70),
    new Enemy(2050,FL-44,'lobo',80),
    new Enemy(440,FL-140-60,'lobo',45), new Enemy(640,FL-180-24,'lobo',50),
    new Enemy(1310,FL-300-60,'urso',40), new Enemy(1790,FL-280-24,'lobo',50),
  ];
  const cols=[
    ...[100,200,900,1100,1340,1560,1820,2060,2380,2480].map(x=>new Col(x,FL-50,'cobre')),
  ];
  let faseCompleted=false;
  const _fireComplete=(player)=>{
    if(G.transitioning||faseCompleted) return;
    faseCompleted=true; G.transitioning=true;
    player.interactAnim=120; sfx('unlock');
    const cobreN=player.items.filter(i=>i==='cobre').length;
    showDialog([
      '"Este gorget pode ter viajado por toda a América do Norte antes da chegada dos europeus. As rotas de comércio nativas conectavam este lago ao Golfo do México."',
      '"O que me lembra que a história da mineração não começa com a Revolução Industrial, nem com os espanhóis em Potosí."',
      '"Ela começa aqui — e em centenas de outros lugares — com pessoas que conheciam a terra de dentro para fora, muito antes de qualquer nós."',
      '"Sem destruição visível. Sem cicatrizes na paisagem. Esta é a única fase da série norte-americana sem dano ambiental evidente — e esse contraste é intencional."',
      `🏆 FASE 2.3 CONCLUÍDA! Cobre coletado: ${cobreN} fragmentos. Descoberta: a mineração nativa que o mundo esqueceu. Próximo destino: Europa Medieval!`,
    ],()=>{
      player.inv=9999; player.vx=0; player.vy=0;
      G.dialog=true;
      setTimeout(()=>{
        _salvarFase(G.player?.score||0, G.deaths);
        G.dialog=false; G.transitioning=false;
        G.state='complete';
      },1500);
    });
  };
  const triggers=[];
  return{
    id:4, bg:'bg04', W:WW, H:WH, startX:60, startY:FL-90,
    title:'O Gorget e o Grande Lago',
    hint:'Siga a Águia até o altar. [E] para completar a jornada.',
    plats, enemies, cols, triggers, aguia, aguiaMessages,
    intro:[
      '"Na margem do lago ao amanhecer — a névoa sobre a água. Não há destruição. Não há cicatriz."',
      '"Siga a Águia Careca até o altar. Este é o único momento de paz intencional nesta série."',
      'Complete a missão e honre o legado dos Anishinaabe.'
    ],
    update(player){
      tickMoving(this.plats);tickTrapdoors(this.plats);
      for(const e of this.enemies)e.update(this.plats,player);
      if(!G.dialog)this.aguia.update(player);
      for(const am of this.aguiaMessages){
        if(!am.shown&&player.x>am.x&&!G.dialog){
          am.shown=true;
          showDialog([am.text],null,'🦅 ÁGUIA CARECA');
        }
      }
      for(const c of this.cols)c.tick();
      POPUP.tick();
      // Conclusão: E no altar (x>2780) aciona o final da fase
      if(!faseCompleted&&!G.dialog&&!G.transitioning&&player.x>2780&&isE()){
        _fireComplete(player);
      }
    },
    draw(player){
      const ag=ctx.createLinearGradient(0,0,0,H*0.4);
      ag.addColorStop(0,'rgba(0,60,40,0.06)');
      ag.addColorStop(1,'rgba(0,60,40,0)');
      ctx.fillStyle=ag;ctx.fillRect(0,0,W,H*0.4);
      const mist=ctx.createLinearGradient(0,FL-cam.y-80,0,FL-cam.y);
      mist.addColorStop(0,'rgba(180,210,240,0)');
      mist.addColorStop(1,'rgba(180,210,240,0.1)');
      ctx.fillStyle=mist;ctx.fillRect(0,FL-cam.y-80,W,80);
      this.aguia.draw();
      for(const e of this.enemies)e.draw();
      for(const c of this.cols)c.draw();
      // Prompt de conclusão no altar
      if(!faseCompleted&&player.x>2780){
        const px=Math.min(player.x-cam.x+20, W-200);
        const py=player.y-cam.y-32;
        const txt='[E] Completar a Jornada';
        ctx.font='14px "Courier New"';
        const tw=ctx.measureText(txt).width+24;
        ctx.fillStyle='rgba(0,0,0,0.82)'; roundRect(px-tw/2,py,tw,24,4); ctx.fill();
        ctx.strokeStyle='#ffe060'; ctx.lineWidth=1.5; roundRect(px-tw/2,py,tw,24,4); ctx.stroke();
        ctx.fillStyle='#ffe060'; ctx.textAlign='center'; ctx.fillText(txt,px,py+17); ctx.textAlign='left';
      }
    }
  };
}

// ── HUD ────────────────────────────────────────────────────────────
function drawHUD(player,level){
  // ── Barra topo
  ctx.fillStyle='rgba(8,4,0,0.82)';ctx.fillRect(0,0,W,38);
  ctx.fillStyle='rgba(200,160,40,0.18)';ctx.fillRect(0,36,W,2);
  // Corações
  for(let i=0;i<player.maxHp;i++){
    ctx.fillStyle=i<player.hp?'#e08030':'#334';
    ctx.beginPath();const hx=16+i*28,hy=10;
    ctx.arc(hx+5,hy+5,5,Math.PI,0);ctx.arc(hx+15,hy+5,5,Math.PI,0);
    ctx.lineTo(hx+20,hy+5);ctx.bezierCurveTo(hx+20,hy+14,hx+10,hy+18,hx+10,hy+18);
    ctx.bezierCurveTo(hx+10,hy+18,hx,hy+14,hx,hy+5);ctx.closePath();ctx.fill();
  }
  // Título e score
  ctx.fillStyle='#d8b878';ctx.font='20px "Courier New"';
  ctx.textAlign='center';ctx.fillText(level.title,W/2,24);ctx.textAlign='left';
  ctx.fillStyle='#e08830';ctx.font='bold 20px "Courier New"';
  ctx.textAlign='right';ctx.fillText('✦ '+player.score,W-14,26);ctx.textAlign='left';
  // ── Painel Diário minimizado
  const PX=12,PY=46,PW=186;
  const TOOL_DEFS=[
    {id:'maco',   icon:'🪨',nome:'Maço de Pedra'},
    {id:'martelo',icon:'🪓',nome:'Martelo de Pedra'},
    {id:'escopro',icon:'🔧',nome:'Escopro de Cobre'},
    {id:'gorget', icon:'🌐',nome:'Gorget de Cobre'},
  ];
  const tools=TOOL_DEFS.filter(t=>player.items.includes(t.id));
  const PH=52+(tools.length>0?6+tools.length*22:0);
  ctx.save();
  ctx.shadowColor='rgba(0,0,0,0.6)';ctx.shadowBlur=8;
  ctx.fillStyle='rgba(8,4,0,0.88)';
  roundRect(PX,PY,PW,PH,6);ctx.fill();
  ctx.shadowBlur=0;
  ctx.strokeStyle='#7a4820';ctx.lineWidth=1.5;roundRect(PX,PY,PW,PH,6);ctx.stroke();
  ctx.strokeStyle='rgba(200,130,40,0.25)';ctx.lineWidth=1;roundRect(PX+3,PY+3,PW-6,PH-6,4);ctx.stroke();
  ctx.restore();
  const kw=26,kx=PX+PW-kw-6,ky=PY+5;
  ctx.font='11px serif';ctx.fillStyle='#c06030';ctx.textAlign='left';ctx.fillText('📔',PX+8,PY+20);
  ctx.font='bold 10px "Courier New"';ctx.fillStyle='#c06030';ctx.fillText('DIÁRIO DE BORDO',PX+24,PY+20);
  ctx.fillStyle='rgba(200,130,40,0.2)';roundRect(kx,ky,kw,18,3);ctx.fill();
  ctx.strokeStyle='#c06030';ctx.lineWidth=1;roundRect(kx,ky,kw,18,3);ctx.stroke();
  ctx.font='bold 10px "Courier New"';ctx.fillStyle='#e08830';
  ctx.textAlign='center';ctx.fillText('[I]',kx+kw/2,ky+13);ctx.textAlign='left';
  ctx.fillStyle='rgba(200,130,40,0.3)';ctx.fillRect(PX+6,PY+26,PW-12,1);
  const midX=PX+PW/2,atY=PY+44;
  ctx.textAlign='center';
  if(player.activeTool&&ITEM_DEFS[player.activeTool]){
    const def=ITEM_DEFS[player.activeTool];
    ctx.fillStyle='rgba(200,130,40,0.1)';roundRect(PX+6,atY-14,PW-12,20,3);ctx.fill();
    ctx.font='11px "Courier New"';ctx.fillStyle='#f0c040';
    ctx.fillText(def.icon+' '+def.nome,midX,atY+1);
  } else {
    ctx.font='12px "Courier New"';ctx.fillStyle='#c0a880';ctx.fillText('Não Equipado',midX,atY);
  }
  ctx.textAlign='left';
  if(tools.length>0){
    ctx.fillStyle='rgba(200,130,40,0.3)';ctx.fillRect(PX+6,PY+52,PW-12,1);
    tools.forEach((t,i)=>{
      const ty=PY+52+8+i*22;
      const eq=player.activeTool===t.id;
      ctx.textAlign='center';
      ctx.font='11px serif';ctx.fillStyle=eq?'#f0c040':'#a07040';
      ctx.fillText(t.icon+' '+t.nome+(eq?' ◀':''),midX,ty+10);
      ctx.textAlign='left';
    });
  }
  // Cobre coletado
  const cn=player.items.filter(i=>i==='cobre').length;
  if(cn>0){
    ctx.font='bold 12px "Courier New"';ctx.fillStyle='#e08030';
    ctx.textAlign='right';ctx.fillText('🟠 Cobre ×'+cn,W-16,PY+20);ctx.textAlign='left';
  }
  // ── Hint rodapé
  const hintText=typeof level.hint==='function'?level.hint(player):level.hint;
  ctx.fillStyle='#b0b0c8';ctx.font='18px "Courier New"';
  ctx.textAlign='center';ctx.fillText(hintText,W/2,H-10);ctx.textAlign='left';
}

// ── Title Screen ─────────────────────────────────────────────────
function drawTitle(){
  const bg=IMG['bg01'];
  if(bg&&bg.complete&&bg.naturalWidth>0){ ctx.globalAlpha=0.75; drawBg('bg01'); ctx.globalAlpha=1; }
  else{ const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#060808');g.addColorStop(1,'#100c04');ctx.fillStyle=g;ctx.fillRect(0,0,W,H); }
  ctx.fillStyle='rgba(0,0,0,0.45)';ctx.fillRect(0,0,W,H);
  // Estrelas / névoa
  for(let i=0;i<120;i++){const sx=(i*137.5)%W,sy=(i*83.7)%300;ctx.fillStyle=`rgba(220,240,255,${.15+Math.sin(Date.now()/1400+i)*.15})`;ctx.fillRect(sx,sy,i%4===0?2:1,i%4===0?2:1);}
  // Águia voando no título
  const eaglePeriod=12000;
  const eagleT=(Date.now()%eaglePeriod)/eaglePeriod;
  const eagleX=eagleT*(W+320)-160;
  const eagleY=140+Math.sin(Date.now()/1200)*25;
  if(IMG['aguia']&&IMG['aguia'].complete&&IMG['aguia'].naturalWidth>0){
    const fi=Math.floor(Date.now()/200)%AGUIA_N_FRAMES;
    const dw=180,dh=Math.round(180*(AGUIA_FRAME_H/AGUIA_FRAME_W));
    ctx.drawImage(IMG['aguia'],fi*AGUIA_FRAME_W,0,AGUIA_FRAME_W,AGUIA_FRAME_H,eagleX,eagleY,dw,dh);
  } else {
    // Fallback águia vetorial
    ctx.save(); ctx.translate(eagleX+90,eagleY+40);
    const fl=Math.sin(Date.now()/130)*16;
    ctx.fillStyle='#2a2018';
    ctx.beginPath();ctx.ellipse(-52,fl,50,10,Math.PI/10,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(52,-fl,50,10,-Math.PI/10,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#181410';ctx.beginPath();ctx.ellipse(0,0,18,12,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#f0f0e0';ctx.beginPath();ctx.arc(0,-17,12,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#f0c020';ctx.fillRect(10,-21,14,5);
    ctx.restore();
  }
  ctx.textAlign='center';
  ctx.shadowColor='#c86020';ctx.shadowBlur=40;
  ctx.fillStyle='#e08040';ctx.font='bold 50px "Courier New"';ctx.fillText('O Metal Que o Lago Guardou',W/2,170);
  ctx.shadowBlur=0;
  ctx.fillStyle='#b07040';ctx.font='22px "Courier New"';ctx.fillText('Fase 2.3  —  Lago Superior, Michigan · 7.000 a.C.',W/2,218);
  if(IMG.card23){
    const cardSize=160,cardX=W/2-80,cardY=246;
    const glow=ctx.createRadialGradient(W/2,cardY+80,0,W/2,cardY+80,130);
    glow.addColorStop(0,'rgba(200,100,40,0.22)'); glow.addColorStop(1,'rgba(200,100,40,0)');
    ctx.fillStyle=glow; ctx.beginPath();ctx.arc(W/2,cardY+80,130,0,Math.PI*2);ctx.fill();
    ctx.drawImage(IMG.card23,cardX,cardY,cardSize,cardSize);
  }
  ctx.fillStyle=`rgba(200,120,40,${.55+Math.sin(Date.now()/550)*.4})`;ctx.font='19px "Courier New"';
  ctx.fillText('▶  Pressione ENTER para começar  ◀',W/2,460);
  ctx.fillStyle='#c0c8d8';ctx.font='18px "Courier New"';
  ctx.fillText('← → Mover   ↑ Espaço Pular   E Interagir/Testar',W/2,504);
  ctx.fillText('[M] Menu Principal',W/2,538);
  ctx.textAlign='left';
}

function drawDeath(){
  ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);
  ctx.textAlign='center';ctx.shadowColor='#ff2020';ctx.shadowBlur=30;
  ctx.fillStyle='#ff5050';ctx.font='bold 56px "Courier New"';ctx.fillText('VOCÊ CAIU!',W/2,H/2-50);
  ctx.shadowBlur=0;
  CORVAN.draw(ctx, 'hurt', Math.floor(Date.now()/250)%4,W/2-40,H/2-30,80,Math.round(80/172*352));
  ctx.fillStyle='#e08830';ctx.font='20px "Courier New"';
  ctx.fillText('Pressione  R  para recomeçar',W/2,H/2+100);
  ctx.fillText(`Mortes: ${G.deaths}`,W/2,H/2+132);
  ctx.fillStyle='#888';ctx.font='15px "Courier New"';ctx.fillText('[M] Menu Principal',W/2,H/2+168);
  ctx.textAlign='left';
}

function drawComplete(){
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0a0400');g.addColorStop(1,'#200c00');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  const rg=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,500);rg.addColorStop(0,'rgba(200,100,40,.16)');rg.addColorStop(1,'rgba(200,100,40,0)');ctx.fillStyle=rg;ctx.fillRect(0,0,W,H);
  ctx.textAlign='center';ctx.shadowColor='#e08830';ctx.shadowBlur=40;
  ctx.fillStyle='#e08040';ctx.font='bold 42px "Courier New"';ctx.fillText('✦  FASE 2.3 CONCLUÍDA  ✦',W/2,120);
  ctx.shadowBlur=0;ctx.fillStyle='#e8d090';ctx.font='20px "Courier New"';ctx.fillText('O Metal que o Lago Guardou foi preservado!',W/2,175);
  const lines=[
    '🟠  Cobre Nativo — puro, sem fundição, 7.000 anos de história',
    '🌐  Gorget de Cobre Anishinaabe — rota comercial continental',
    '🔧  Escopro por cold hammering — metalurgia sem fogo',
    '🦅  Conhecimento da Águia — sabedoria antes dos europeus',
  ];
  ctx.fillStyle='#e0c878';ctx.font='16px "Courier New"';lines.forEach((l,i)=>ctx.fillText(l,W/2,238+i*32));
  ctx.fillStyle='#e08830';ctx.font='18px "Courier New"';ctx.fillText(`Pontuação: ⭐ ${G.player?.score||0}   Mortes: ${G.deaths}`,W/2,400);
  ctx.fillStyle=`rgba(200,120,40,${.6+Math.sin(Date.now()/600)*.4})`;ctx.font='17px "Courier New"';ctx.fillText('▶ [M] Menu Principal ◀',W/2,446);
  ctx.font='64px serif';ctx.fillText('🏆',W/2-32,530);
  ctx.textAlign='left';
}

// ── Game engine ────────────────────────────────────────────────────
const LEVELS=[buildL1,buildL2,buildL3,buildL4];
const G={
  state:'title',
  lvIdx:0, level:null, player:null,
  dialog:false, transitioning:false,
  deaths:0, timeOnLevel:0,
  _storedItems:[], _storedScore:0, _storedTool:null,

  load(idx){
    this.lvIdx=idx; particles=[];
    tileTheme=TILE_THEMES[idx+1]||TILE_THEMES[1];
    this.level=LEVELS[idx]();
    cam.x=0; cam.y=0;
    this.player=new Player(this.level.startX,this.level.startY);
    if(idx>0){this.player.items=[...this._storedItems];this.player.score=this._storedScore;this.player.activeTool=this._storedTool||null;}
    this.dialog=false; this.transitioning=false; this.state='playing'; this.timeOnLevel=0;
    BUBBLE.active=false; POPUP.active=false;
    setTimeout(()=>{if(this.state==='playing') showDialog(this.level.intro,null);},900);
  },

  nextLevel(){
    this._storedItems=[...this.player.items];
    this._storedScore=this.player.score;
    this._storedTool=this.player.activeTool;
    if(this.lvIdx+1<LEVELS.length) this.load(this.lvIdx+1);
    else this.state='complete';
  },

  update(){
    if(this.state!=='playing') return;
    this.timeOnLevel++;
    checkDlg();
    if(INV.open) INV.navigate(this.player);
    updateCam(this.player.x,this.level.W);
    this.level.update(this.player);
    this.player.update(this.level);
    tickParticles(); tickNotif();
    if(this.player.dead){this.deaths++;this.state='dead';}
    dlgFaceT+=0.08;
  },

  draw(){
    ctx.clearRect(0,0,W,H);
    if(this.state==='title')    {drawTitle();return;}
    if(this.state==='complete') {drawComplete();return;}
    drawBg(this.level.bg);
    for(const p of this.level.plats) drawPlatform(p);
    this.level.draw(this.player);
    drawParticles();
    this.player.draw();
    if(this.state==='dead'){drawDeath();return;}
    drawHUD(this.player,this.level);
    BUBBLE.draw(this.player);
    drawNotif();
    INV.draw(this.player);
  }
};

function startGame(){ G.load(0); G.state='title'; loop(); }

function loop(){
  requestAnimationFrame(loop);
  if(G.state==='title'    &&(jp['Enter']||jp['Space'])) G.load(0);
  if(G.state==='dead'     && jp['KeyR'])                G.load(G.lvIdx);
  if(G.state==='complete' &&(jp['Enter']||jp['KeyM']))  _voltarAoMenu();
  G.update(); G.draw(); clearJP();
}
