
const W = 1280, H = 720;
const wrap   = document.getElementById('wrap');
const canvas = document.getElementById('c');
const ctx    = canvas.getContext('2d');
canvas.width  = W;
canvas.height = H;

function resize() {
  const s  = Math.min(window.innerWidth/W, window.innerHeight/H);
  const sw = Math.round(W*s), sh = Math.round(H*s);
  canvas.style.width  = sw+'px'; canvas.style.height = sh+'px';
  wrap.style.width    = sw+'px'; wrap.style.height   = sh+'px';
  wrap.style.position = 'fixed';
  wrap.style.left = Math.round((window.innerWidth -sw)/2)+'px';
  wrap.style.top  = Math.round((window.innerHeight-sh)/2)+'px';
}
resize();
window.addEventListener('resize', resize);

// ── Audio ──────────────────────────────────────────────────────
let AC;
try { AC = new (window.AudioContext||window.webkitAudioContext)(); } catch(e){}
function sfx(type) {
  if (!AC) return;
  if (AC.state==='suspended') AC.resume();
  const o=AC.createOscillator(), g=AC.createGain();
  o.connect(g); g.connect(AC.destination);
  const t=AC.currentTime;
  if      (type==='jump')     { o.frequency.setValueAtTime(280,t); o.frequency.exponentialRampToValueAtTime(520,t+.14); g.gain.setValueAtTime(.15,t); g.gain.exponentialRampToValueAtTime(.001,t+.16); }
  else if (type==='coin')     { o.frequency.setValueAtTime(880,t); o.frequency.exponentialRampToValueAtTime(1760,t+.09); g.gain.setValueAtTime(.12,t); g.gain.exponentialRampToValueAtTime(.001,t+.12); }
  else if (type==='hit')      { o.type='sawtooth'; o.frequency.setValueAtTime(200,t); o.frequency.exponentialRampToValueAtTime(50,t+.18); g.gain.setValueAtTime(.18,t); g.gain.exponentialRampToValueAtTime(.001,t+.2); }
  else if (type==='item')     { o.frequency.setValueAtTime(440,t); o.frequency.setValueAtTime(660,t+.1); o.frequency.setValueAtTime(880,t+.2); g.gain.setValueAtTime(.14,t); g.gain.exponentialRampToValueAtTime(.001,t+.3); }
  else if (type==='unlock')   { o.frequency.setValueAtTime(330,t); o.frequency.setValueAtTime(440,t+.15); o.frequency.setValueAtTime(660,t+.3); g.gain.setValueAtTime(.15,t); g.gain.exponentialRampToValueAtTime(.001,t+.5); }
  // Cinábrio: crack + shimmer vermelho (sawtooth curto + sine alto)
  else if (type==='cinabrio') { o.type='sawtooth'; o.frequency.setValueAtTime(600,t); o.frequency.exponentialRampToValueAtTime(180,t+.14); g.gain.setValueAtTime(.16,t); g.gain.exponentialRampToValueAtTime(.001,t+.18); const o2=AC.createOscillator(),g2=AC.createGain(); o2.frequency.setValueAtTime(1400,t+.08); g2.gain.setValueAtTime(.08,t+.08); g2.gain.exponentialRampToValueAtTime(.001,t+.22); o2.connect(g2); g2.connect(AC.destination); o2.start(t+.08); o2.stop(t+.3); }
  // Destilador: fsss + plink
  else if (type==='destilador') { o.type='sine'; o.frequency.setValueAtTime(180,t); g.gain.setValueAtTime(.08,t); g.gain.exponentialRampToValueAtTime(.001,t+.35); const o2=AC.createOscillator(),g2=AC.createGain(); o2.type='sine'; o2.frequency.setValueAtTime(2200,t+.3); g2.gain.setValueAtTime(.1,t+.3); g2.gain.exponentialRampToValueAtTime(.001,t+.45); o2.connect(g2); g2.connect(AC.destination); o2.start(t+.3); o2.stop(t+.5); }
  // Frasco: glug grave viscoso
  else if (type==='frasco')   { o.type='sine'; o.frequency.setValueAtTime(80,t); o.frequency.exponentialRampToValueAtTime(55,t+.25); g.gain.setValueAtTime(.2,t); g.gain.exponentialRampToValueAtTime(.001,t+.3); }
  // Tocha azulando: pulso de frequência baixa
  else if (type==='vapor_warn') { o.type='sine'; o.frequency.setValueAtTime(60,t); g.gain.setValueAtTime(.05,t); g.gain.linearRampToValueAtTime(.12,t+.4); g.gain.exponentialRampToValueAtTime(.001,t+.8); }
  else if (type==='stone')    { o.type='square'; o.frequency.setValueAtTime(120,t); g.gain.setValueAtTime(.1,t); g.gain.exponentialRampToValueAtTime(.001,t+.15); }
  o.start(t); o.stop(t+.9);
}


// ── Save ─────────────────────────────────────────────────────────
const SAVE_KEY = 'mineralis_save_v2';
function unlockPhase(id){try{const raw=localStorage.getItem(SAVE_KEY);const save=raw?JSON.parse(raw):{versao:1,iniciado:true,fases:{}};if(!save.fases)save.fases={};if(!save.fases[id])save.fases[id]={desbloqueada:false,estrelas:0};save.fases[id].desbloqueada=true;localStorage.setItem(SAVE_KEY,JSON.stringify(save));}catch(e){}}
function _salvarFase(score, deaths){
  const estrelas = deaths===0?4 : deaths<=2?3 : deaths<=5?2 : 1;
  try{
    const raw=localStorage.getItem(SAVE_KEY);
    const save=raw?JSON.parse(raw):{versao:1,iniciado:true,fases:{}};
    if(!save.fases) save.fases={};
    if(!save.fases['3.3']) save.fases['3.3']={desbloqueada:true,estrelas:0};
    save.fases['3.3'].estrelas=Math.max(save.fases['3.3'].estrelas||0,estrelas);
    save.fases['3.3'].desbloqueada=true;
    localStorage.setItem(SAVE_KEY,JSON.stringify(save));
  }catch(e){}
}
function _voltarAoMenu(){
  _salvarFase(G.player?.score||0, G.deaths);
  unlockPhase('4.1');
  try{sessionStorage.setItem('mineralis_session','1');}catch(e){}
  window.location.href='../../MenuPrincipal/index.html?unlocked=4.1';
}

// ── Assets ───────────────────────────────────────────────────────
const IMG={};
// Cenas: pixel-art SVG 640×360 (viewBox 320×180)
// Items: pixel-art SVG 96×96 (viewBox 48×48)
const ASSETS=[
  ['bg01','Assets/cena1_entrada_mina.svg'],
  ['bg02','Assets/cena2_galerias_cinabrio.svg'],
  ['bg03','Assets/cena3_mapa_vapor.svg'],
  ['bg04','Assets/cena4_entardecer_moinho.svg'],
  ['lince','Assets/3_3_lince_iberico.svg'],
  ['cornue','Assets/3_3_destilador_cornue.svg'],
  ['picareta_img','Assets/3_3_picareta_calcario.svg'],
  ['tocha_img','Assets/3_3_tocha_alcatrao.svg'],
  ['frasco_img','Assets/3_3_frasco_mercurio.svg'],
];



let assetsLoaded=0, totalAssets=ASSETS.length, gameReady=false;
ASSETS.forEach(([key,src])=>{
  const img=new Image();
  img.onload=()=>{
    IMG[key]=img;
    if(++assetsLoaded>=totalAssets){gameReady=true;startGame();}
  };
  img.onerror=()=>{IMG[key]=null;if(++assetsLoaded>=totalAssets){gameReady=true;startGame();}};
  img.src=src;
});

IMG.card33=null;
(()=>{ const ci=new Image(); ci.onload=()=>{IMG.card33=ci;}; ci.onerror=()=>{}; ci.src='Assets/3_3_almaden.svg'; })();

// ── Input ─────────────────────────────────────────────────────────
const keys={}, jp={};
window.addEventListener('keydown',e=>{
  if(!keys[e.code]) jp[e.code]=true;
  keys[e.code]=true;
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
  if((e.code==="KeyI"||e.code==="Tab")&&G.state==="playing"){e.preventDefault();if(G.player&&(INV.open||!BUBBLE.active))INV.toggle(G.player);}
  if(e.code==='Escape'&&INV.open) INV.close();
  if(e.code==='KeyM'){try{sessionStorage.setItem('mineralis_session','1');}catch(e){}
  window.location.href='../../MenuPrincipal/index.html';}
});
window.addEventListener('keyup',e=>delete keys[e.code]);
window.addEventListener('blur',()=>{for(const k in keys)delete keys[k];for(const k in jp)delete jp[k];TOUCH.l=TOUCH.r=TOUCH.j=TOUCH.e=false;});
document.addEventListener('visibilitychange',()=>{if(document.hidden){for(const k in keys)delete keys[k];for(const k in jp)delete jp[k];TOUCH.l=TOUCH.r=TOUCH.j=TOUCH.e=false;}});

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


// ── Particles ─────────────────────────────────────────────────────
let particles=[];
function burst(x,y,color,n=8,spd=3.5){
  for(let i=0;i<n;i++){
    const a=(i/n)*Math.PI*2+Math.random()*.5;
    particles.push({x,y,vx:Math.cos(a)*spd*(0.4+Math.random()),vy:Math.sin(a)*spd*(0.4+Math.random())-1,life:40+Math.random()*20,max:60,color,r:3+Math.random()*4});
  }
}
function tickParticles(){for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=0.2;p.life--;if(p.life<=0)particles.splice(i,1);}}
function drawParticles(){for(const p of particles){ctx.globalAlpha=p.life/p.max;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x-cam.x,p.y-cam.y,p.r*(p.life/p.max),0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}

// ── Camera ────────────────────────────────────────────────────────
const cam={x:0,y:0};
function updateCam(px,worldW){
  const target=px-W/2+24;
  const clamped=Math.max(0,Math.min(target,worldW-W));
  cam.x+=(clamped-cam.x)*0.12;
}

const GRAV=0.46, PSPD=4.6, JUMPF=-12.4, MAXFALL=16;

// ── Tile themes — calcário branco e galerias escuras ──────────────
const TILE_THEMES={
  1:{top:'#d8d0b8',body:'#b8b0a0',dark:'#989080'},  // calcário La Mancha
  2:{top:'#2a2020',body:'#181418',dark:'#100c0c'},   // mina escura
  3:{top:'#201820',body:'#160e16',dark:'#0e080e'},   // galerias profundas
  4:{top:'#c8b890',body:'#a89870',dark:'#786848'},   // saída entardecer
};
let tileTheme=TILE_THEMES[1];

// ── Platform helpers ──────────────────────────────────────────────
function solid(x,y,w,h){ return {type:'solid',x,y,w,h}; }
function movH(x,y,w,x0,x1,spd){ return {type:'solid',moving:true,x,y,w,h:18,x0,x1,spd,vx:spd,vy:0}; }
function movV(x,y,w,y0,y1,spd){ return {type:'solid',moving:true,x,y,w,h:18,y0,y1,spd,vx:0,vy:spd}; }
function trap(x,y,w){ return {type:'trapdoor',x,y,w,h:14}; }
function spike(x,y,w){ return {type:'spike',x,y,w,h:20}; }

function tickMoving(plats){
  for(const p of plats){ if(!p.moving) continue;
    if(p.x0!==undefined){p.x+=p.vx; if(p.x<=p.x0||p.x+p.w>=p.x1) p.vx=-p.vx;}
    if(p.y0!==undefined){p.y+=p.vy; if(p.y<=p.y0||p.y>=p.y1) p.vy=-p.vy;}
  }
}
function tickTrapdoors(plats){
  for(const p of plats){ if(p.type!=='trapdoor') continue;
    if(p.crumble!==undefined){p.crumble--;if(p.crumble<=0){p.crumble=undefined;p.type='_dead';}}
  }
}

function drawPlatform(p){
  const sx=p.x-cam.x, sy=p.y-cam.y;
  if(sx>W+80||sx+p.w<-80||sy>H+40||sy+p.h<-40) return;
  if(p.type==='spike'){
    const nc=Math.max(1,Math.floor(p.w/20)); ctx.fillStyle='#804010';
    for(let i=0;i<nc;i++){const tx=sx+i*(p.w/nc);ctx.beginPath();ctx.moveTo(tx,sy+p.h);ctx.lineTo(tx+p.w/nc/2,sy);ctx.lineTo(tx+p.w/nc,sy+p.h);ctx.fill();}
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
      const tx=sx+c*ts,ty=sy+r*ts,tw=Math.min(ts,sx+p.w-tx),th=Math.min(ts,sy+p.h-ty);
      ctx.fillStyle=r===0?tileTheme.body:(r%2===0?tileTheme.dark:tileTheme.body); ctx.fillRect(tx,ty,tw,th);
      ctx.fillStyle='rgba(0,0,0,0.08)'; ctx.fillRect(tx+tw-1,ty,1,th); ctx.fillRect(tx,ty+th-1,tw,1);
    }
  }
  ctx.fillStyle=tileTheme.top; ctx.fillRect(sx,sy,p.w,4);
  if(p.moving){ ctx.fillStyle='rgba(180,40,30,0.3)'; ctx.fillRect(sx,sy,p.w,4); }
}

// ── Utils ─────────────────────────────────────────────────────────
function roundRect(x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();
}
function _rr(x,y,w,h,r){ roundRect(x,y,w,h,r); }

// ── Corvan — sprite canvas nativo (padrão fase 1-1) ───────────────
function drawCorvan(cx,cy,scale=1,flipX=false,frame=0,activeTool=null){
  const S=scale;
  ctx.save();ctx.translate(cx,cy);if(flipX)ctx.scale(-1,1);
  const r=(x,y,w,h,fill,op)=>{ctx.fillStyle=fill;ctx.globalAlpha=op!==undefined?op:1;ctx.fillRect(x*S,y*S,w*S,h*S);ctx.globalAlpha=1;};
  const lb=0.7+Math.sin(frame*0.4)*0.3;
  const showPickaxe=activeTool==='picareta_calc';
  const showTorch  =activeTool==='tocha';
  // Chapéu
  r(7,3,18,2,'#3a2208');r(9,1,14,4,'#4a2e10');
  r(13,0,6,3,'#c8a020');r(14,0,4,2,'#ffe060');
  // Cabeça
  r(9,5,14,9,'#c88050');r(10,6,12,1,'#a86030');
  r(11,8,3,2,'#1a0a04');r(18,8,3,2,'#1a0a04');
  r(12,8,1,1,'#fff');r(19,8,1,1,'#fff');
  r(14,11,4,1,'#a86030');r(12,13,8,1,'#7a3820');
  r(13,14,6,2,'#c88050');
  // Torso
  r(8,16,16,13,'#b82010');r(15,17,2,1,'#8a1008');r(15,20,2,1,'#8a1008');r(15,23,2,1,'#8a1008');
  r(12,16,3,3,'#d03018');r(17,16,3,3,'#d03018');
  // Cinto
  r(8,28,16,2,'#2a1408');r(14,28,4,2,'#c88020');
  // Pernas
  r(9,30,14,12,'#383838');r(15,36,2,6,'#282828');
  // Braço esquerdo
  r(3,16,5,12,'#b82010');r(3,28,5,3,'#a86030');
  if(showPickaxe){
    const wb=Math.sin(frame*0.2)*1.5;
    r(0,24+wb,6,1,'#7a4818');r(0,25+wb,1,7,'#7a4818');
    r(0,22+wb,6,3,'#888888');r(4,20+wb,2,3,'#aaaaaa');
  }
  // Braço direito
  r(24,16,5,12,'#b82010');r(24,28,5,3,'#a86030');
  if(showTorch){
    r(26,31,1,3,'#888888');r(24,34,5,6,'#604010');r(25,35,3,4,'#ffe080');
    r(23,33,7,8,'#ffcc00',0.12*lb);
  }
  // Botas
  r(9,42,6,4,'#3a1e08');r(17,42,6,4,'#3a1e08');
  r(8,44,8,2,'#2a1008');r(16,44,8,2,'#2a1008');
  // Brilho chapéu
  ctx.fillStyle='#ffe060';ctx.globalAlpha=0.25*lb;ctx.beginPath();ctx.arc(16*S,1*S,4*S,0,Math.PI*2);ctx.fill();
  if(showTorch){ctx.fillStyle='#ffcc00';ctx.globalAlpha=0.18*lb;ctx.beginPath();ctx.arc(26*S,37*S,5*S,0,Math.PI*2);ctx.fill();}
  ctx.globalAlpha=1;ctx.restore();
}

function wrapText(text,maxW){
  ctx.font='15px "Courier New"';
  const paragraphs=text.split('\n'); const result=[];
  for(const para of paragraphs){
    const words=para.split(' '); let line='';
    for(const word of words){
      const test=line?line+' '+word:word;
      if(ctx.measureText(test).width>maxW&&line){result.push(line);line=word;}
      else line=test;
    }
    if(line) result.push(line);
  }
  return result;
}

// ── Item Definitions ──────────────────────────────────────────────
const ITEM_DEFS={
  // Ferramentas anteriores herdadas
  picareta_basica: { cat:'ferramenta',nome:'Picareta Básica',      icon:'⛏',fase:'1.1',journalId:'picareta_basica',desc:'Extrai minérios das paredes rochosas.\nEssencial nas minas de Potosí.' },
  lanterna:        { cat:'ferramenta',nome:'Lanterna',             icon:'🔦',fase:'1.1',journalId:'lanterna',desc:'Ilumina cavernas e revela cristais ocultos.\nNecessária para o efeito de luz nas minas.' },
  maco_pedra:      { cat:'ferramenta',nome:'Maço de Pedra',        icon:'🪨',fase:'2.3',journalId:'maco_pedra',desc:'Percussão a frio Anishinaabe.\nExtrai cobre nativo do basalto.' },
  // Novas da 3.3
  picareta_calcario_item:{ cat:'ferramenta',nome:'Picareta de Calcário',icon:'⛏',fase:'3.3',desc:'Adaptada para rocha sedimentar calcária.\nMais leve que a industrial.\nRevela veias de cinábrio com precisão.' },
  tocha_alcatrao: { cat:'ferramenta',nome:'Tocha de Alcatrão',    icon:'🔥',fase:'3.3',desc:'A chama reage ao vapor de mercúrio:\nazuleja quando há Hg no ar.\nSeu único detector numa mina do séc. XVI.' },
  destilador_item:{ cat:'ferramenta',nome:'Destilador de Cornue', icon:'🧪',fase:'3.3',desc:'Recipiente alquímico de vidro em forma de pera.\nAo aquecer cinábrio, condensa mercúrio puro.\nTambém mede concentração de vapor no ar.' },
  // Minérios
  prata:           { cat:'minerio',nome:'Prata',                   icon:'◆',fase:'1.1',desc:'Melhor condutor elétrico e térmico.\nExtraída de Potosí com mercúrio de Almadén.' },
  cobre_nativo:    { cat:'minerio',nome:'Cobre Nativo',            icon:'🟠',fase:'2.3',desc:'Cobre puro — sem fundição.\nTradição Anishinaabe de 7.000 anos.',multiple:true },
  cinabrio:        { cat:'minerio',nome:'Cinábrio (HgS)',          icon:'🔴',fase:'3.3',desc:'Sulfeto de mercúrio escarlate.\nDensidade 8,1 g/cm³ — surpreendentemente pesado.\nUsado como pigmento vermilhão desde Roma.\nO mais belo e o mais tóxico da série.',multiple:true },
  // Artefatos
  tumi_dourado:    { cat:'artefato',nome:'Tumi — Faca Cerimonial', icon:'🗡',fase:'1.3',journalId:'tumi_dourado',desc:'Faca ritual Inca de ouro, prata e turquesa.\nUsada em oferendas ao deus sol — Inti.' },
  gorget_cobre:    { cat:'artefato',nome:'Gorget de Cobre',        icon:'🌐',fase:'2.3',journalId:'gorget_cobre',desc:'Ornamento Anishinaabe — rota comercial\ndo Lago Superior à Flórida e ao México.' },
  frasco_mercurio: { cat:'artefato',nome:'Frasco de Mercúrio',     icon:'⚗️',fase:'3.3',desc:'Vidro soprado, cera vermelha, mercúrio puro.\nPercorreu 10.000 km de Almadén a Potosí.\nA cadeia logística que conectou dois continentes\ndurante 300 anos de Império Espanhol.' },
};

const TIPO_TO_JOURNAL={
  picareta_calc:'picareta_calcario_item', tocha:'tocha_alcatrao',
  destilador:'destilador_item', cinabrio:'cinabrio', frasco:'frasco_mercurio',
};

// ── Inventory ─────────────────────────────────────────────────────
const INV={
  open:false,tab:0,cursor:0,
  TABS:[
    {id:'ferramenta',label:'🔧 Ferramentas',color:'#e04030'},
    {id:'minerio',   label:'⛏ Minérios',   color:'#c02020'},
    {id:'artefato',  label:'🏺 Artefatos',  color:'#b84040'},
  ],
  tabItems(player){
    const cat=this.TABS[this.tab].id;
    let col={};
    try{const s=localStorage.getItem('mineralis_save_v2');if(s){const j=JSON.parse(s);col=j.coletados||{};}}catch(e){}
    // Migração: código antigo usava 'mapa_potosi' para o Tupu de Prata
    if(col['mapa_potosi']&&!col['tupu_prata']) col['tupu_prata']=true;
    for(const tipo of player.items){ const jid=TIPO_TO_JOURNAL[tipo]||tipo; col[jid]=true; }
    const cinN=player.items.filter(i=>i==='cinabrio').length;
    const out=[];
    for(const [id,def] of Object.entries(ITEM_DEFS)){
      if(def.cat!==cat) continue;
      if(def.multiple){ if(cinN>0) out.push({id,...def,count:cinN}); }
      else if(def.fase==='3.3'){
        // Fase atual: só aparece se coletado nesta sessão
        if(player.items.includes(id)||col[id]) out.push({id,...def,count:1});
      } else if(col[id]){ // Fases anteriores: persiste via coletados
        out.push({id,...def,count:1});
      }
    }
    // Itens coletados em OUTRAS fases (catálogo global via JournalStore)
    if (window.ALL_ITEM_DEFS) {
      const idsLocais=new Set(Object.keys(ITEM_DEFS));
      for(const [id,def] of Object.entries(window.ALL_ITEM_DEFS)){
        if(def.cat!==cat||idsLocais.has(id)) continue;
        const got = window.JournalStore ? window.JournalStore.isCollected(id) : !!col[id];
        if(got) out.push({id,...def,count:1});
      }
    }
    return out;
  },
  toggle(player){ this.open=!this.open; if(this.open)this.cursor=Math.min(this.cursor,Math.max(0,this.tabItems(player).length-1)); G.dialog=this.open||BUBBLE.active; },
  close(){ this.open=false;G.dialog=BUBBLE.active; },
  navigate(player){
    if(!this.open)return false;
    if(jp['ArrowLeft']||jp['KeyA']){this.tab=(this.tab+2)%3;this.cursor=0;return true;}
    if(jp['ArrowRight']||jp['KeyD']){this.tab=(this.tab+1)%3;this.cursor=0;return true;}
    const items=this.tabItems(player);
    if(jp['ArrowUp']  ||jp['KeyW']){this.cursor=Math.max(0,this.cursor-1);return true;}
    if(jp['ArrowDown']||jp['KeyS']){this.cursor=Math.min(items.length-1,this.cursor+1);return true;}
    if(isE()&&items.length>0&&this.tab===0){ const item=items[this.cursor]; player.activeTool=(player.activeTool===item.id)?null:item.id; return true; }
    return false;
  },
  draw(player){
    if(!this.open)return;
    ctx.fillStyle='rgba(0,0,0,0.65)';ctx.fillRect(0,0,W,H);
    const PW=780,PH=480,PX=(W-PW)/2,PY=(H-PH)/2;
    ctx.shadowColor='rgba(0,0,0,0.7)';ctx.shadowBlur=20;
    ctx.fillStyle='rgba(5,0,0,0.97)';_rr(PX,PY,PW,PH,16);ctx.fill();
    ctx.shadowBlur=0;
    ctx.strokeStyle='#8a2010';ctx.lineWidth=2.5;_rr(PX,PY,PW,PH,16);ctx.stroke();
    ctx.fillStyle='#e04030';ctx.font='bold 16px "Courier New"';
    ctx.textAlign='center';ctx.fillText('📔  DIÁRIO DE BORDO',W/2,PY+28);ctx.textAlign='left';
    ctx.fillStyle='rgba(180,40,20,0.3)';ctx.fillRect(PX+16,PY+38,PW-32,1);
    const TAB_W=PW/3,TAB_Y=PY+44;
    this.TABS.forEach((tab,i)=>{
      const tx=PX+i*TAB_W,active=(i===this.tab);
      ctx.fillStyle=active?'rgba(180,40,20,0.18)':'rgba(0,0,0,0.3)';ctx.fillRect(tx+2,TAB_Y,TAB_W-4,34);
      ctx.fillStyle=active?tab.color:'#666';ctx.font=(active?'bold ':'')+'13px "Courier New"';
      ctx.textAlign='center';ctx.fillText(tab.label,tx+TAB_W/2,TAB_Y+22);ctx.textAlign='left';
      if(active){ctx.fillStyle=tab.color;ctx.fillRect(tx+2,TAB_Y+32,TAB_W-4,3);}
    });
    const CY=TAB_Y+40,CH=PH-(CY-PY)-50,items=this.tabItems(player),COL_W=260,DESC_X=PX+280;
    if(items.length===0){
      ctx.fillStyle='#554';ctx.font='14px "Courier New"';ctx.textAlign='center';
      ctx.fillText('Nenhum item coletado ainda.',W/2,CY+CH/2);
      ctx.fillText('Explore a fase para desbloquear!',W/2,CY+CH/2+24);ctx.textAlign='left';
    } else {
      const ROW_H=52,maxRows=Math.max(1,Math.floor(CH/ROW_H));
      const scrollTop=items.length>maxRows?Math.max(0,Math.min(this.cursor-maxRows+1,items.length-maxRows)):0;
      const visible=items.slice(scrollTop,scrollTop+maxRows);
      visible.forEach((item,vi)=>{
        const i=scrollTop+vi;
        const iy=CY+16+vi*ROW_H,sel=(i===this.cursor),eq=(player.activeTool===item.id);
        if(sel){ctx.fillStyle='rgba(180,40,20,0.18)';_rr(PX+16,iy-10,COL_W,46,8);ctx.fill();ctx.strokeStyle='#e04030';ctx.lineWidth=1.5;_rr(PX+16,iy-10,COL_W,46,8);ctx.stroke();}
        const cnt=item.count>1?' ×'+item.count:'';
        ctx.font='20px serif';ctx.fillText(item.icon,PX+28,iy+20);
        ctx.font=(eq?'bold ':'')+'14px "Courier New"';ctx.fillStyle=eq?'#ffe060':(sel?'#f0e8c0':'#aaa');
        ctx.fillText(item.nome+cnt,PX+62,iy+14);
      });
      if(scrollTop>0){ctx.fillStyle='#e04030';ctx.font='12px "Courier New"';ctx.textAlign='center';ctx.fillText('▲ mais',PX+16+COL_W/2,CY+6);ctx.textAlign='left';}
      if(scrollTop+maxRows<items.length){ctx.fillStyle='#e04030';ctx.font='12px "Courier New"';ctx.textAlign='center';ctx.fillText('▼ mais',PX+16+COL_W/2,CY+16+maxRows*ROW_H+2);ctx.textAlign='left';}
      const sel=items[this.cursor];
      if(sel){
        ctx.fillStyle='rgba(180,40,20,0.08)';_rr(DESC_X,CY,PW-DESC_X+PX-16,CH-10,8);ctx.fill();
        ctx.font='44px serif';ctx.textAlign='center';ctx.fillText(sel.icon,DESC_X+(PW-DESC_X+PX-16)/2,CY+68);
        ctx.font='bold 15px "Courier New"';ctx.fillStyle='#e04030';ctx.fillText(sel.nome,DESC_X+(PW-DESC_X+PX-16)/2,CY+98);
        const catL={ferramenta:'🔧 Ferramenta',minerio:'⛏ Minério',artefato:'🏺 Artefato'};
        ctx.font='11px "Courier New"';ctx.fillStyle='#888';ctx.fillText(catL[sel.cat],DESC_X+(PW-DESC_X+PX-16)/2,CY+116);
        ctx.textAlign='left';ctx.fillStyle='rgba(180,40,20,0.25)';ctx.fillRect(DESC_X+20,CY+124,PW-DESC_X+PX-56,1);
        const descLines=sel.desc.split('\n');ctx.font='13px "Courier New"';ctx.fillStyle='#f0e8c0';
        descLines.forEach((l,i)=>{ctx.textAlign='center';ctx.fillText(l,DESC_X+(PW-DESC_X+PX-16)/2,CY+144+i*22);});
        ctx.textAlign='left';
        if(sel.cat==='ferramenta'){
          const btnTxt=player.activeTool===sel.id?'[E] Desequipar':'[E] Equipar';
          ctx.fillStyle=player.activeTool===sel.id?'rgba(180,60,20,0.3)':'rgba(180,40,20,0.2)';
          _rr(DESC_X+40,CY+CH-60,PW-DESC_X+PX-96,34,8);ctx.fill();
          ctx.strokeStyle=player.activeTool===sel.id?'#c04020':'#e04030';ctx.lineWidth=1.5;_rr(DESC_X+40,CY+CH-60,PW-DESC_X+PX-96,34,8);ctx.stroke();
          ctx.font='bold 13px "Courier New"';ctx.fillStyle=player.activeTool===sel.id?'#e06040':'#e04030';
          ctx.textAlign='center';ctx.fillText(btnTxt,DESC_X+(PW-DESC_X+PX-16)/2,CY+CH-38);ctx.textAlign='left';
        }
      }
    }
    ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(PX,PY+PH-38,PW,38);
    ctx.fillStyle='rgba(180,40,20,0.3)';ctx.fillRect(PX+16,PY+PH-39,PW-32,1);
    ctx.font='11px "Courier New"';ctx.fillStyle='#888';ctx.textAlign='center';
    ctx.fillText('◀ ▶ Abas   ↑ ↓ Navegar   E Equipar/Desequipar   I Fechar',W/2,PY+PH-14);
    ctx.textAlign='left';
  }
};

// ── Dialog Bubble ─────────────────────────────────────────────────
let dlgFaceT=0;
const BUBBLE={
  active:false,queue:[],cb:null,lines:[],speakerTxt:'CORVAN',speakerColor:'#e0b840',faceFrame:0,
  slowMode:false,
  show(messages,cb,speaker='CORVAN',slow=false){
    this.queue=[...messages];this.cb=cb;this.active=true;
    this.speakerTxt=speaker;this.slowMode=slow;
    this.speakerColor=slow?'#6040c0':'#e0b840';
    G.dialog=true;this._next();
  },
  _next(){
    if(!this.queue.length){this.active=false;G.dialog=false;if(this.cb){const f=this.cb;this.cb=null;f();}return;}
    this.lines=wrapText(this.queue.shift(),480);
  },
  advance(){if(this.active)this._next();},
  draw(player){
    if(!this.active)return;this.faceFrame+=0.03;
    ctx.font='15px "Courier New"';
    const faceW=60,faceH=76,facePad=12;
    const lineH=24,pad=20,textW=480;
    const bubW=facePad+faceW+facePad+textW+pad;
    const bubH=Math.max(faceH+pad*2,this.lines.length*lineH+70)+pad;
    const pcx=player.x-cam.x+player.w/2,pcy=player.y-cam.y;
    let bx=Math.max(10,Math.min(pcx-bubW/2,W-bubW-10)),by=Math.max(10,pcy-bubH-32);
    // Fundo + sombra
    ctx.shadowColor='rgba(0,0,0,0.6)';ctx.shadowBlur=14;
    ctx.fillStyle='rgba(8,4,0,0.96)';roundRect(bx,by,bubW,bubH,14);ctx.fill();
    ctx.shadowBlur=0;
    // Borda principal — dourada (padrão fase 1-1)
    ctx.strokeStyle=this.speakerColor;ctx.lineWidth=2.5;roundRect(bx,by,bubW,bubH,14);ctx.stroke();
    // Borda interna dupla
    ctx.strokeStyle='rgba(200,160,40,0.2)';ctx.lineWidth=1;roundRect(bx+4,by+4,bubW-8,bubH-8,10);ctx.stroke();
    // Cauda do balão
    const tbx=Math.max(bx+30,Math.min(pcx,bx+bubW-30));
    const tty=by+bubH,tipy=Math.min(pcy,tty+38);
    ctx.fillStyle='rgba(8,4,0,0.96)';ctx.beginPath();ctx.moveTo(tbx-14,tty);ctx.lineTo(tbx+14,tty);ctx.lineTo(pcx,tipy);ctx.closePath();ctx.fill();
    ctx.strokeStyle=this.speakerColor;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(tbx-14,tty);ctx.lineTo(pcx,tipy);ctx.lineTo(tbx+14,tty);ctx.stroke();
    // Face box — fundo escuro + borda dourada
    const fx=bx+facePad,fy=by+pad;
    ctx.fillStyle='rgba(20,10,2,0.85)';roundRect(fx,fy,faceW,faceH,6);ctx.fill();
    ctx.strokeStyle='rgba(200,160,40,0.45)';ctx.lineWidth=1.5;roundRect(fx,fy,faceW,faceH,6);ctx.stroke();
    // Corvan no face box — canvas nativo (padrão fase 1-1)
    const faceScale=faceW/18*0.82;
    const sprX=fx+faceW/2-16*faceScale;
    const sprY=fy+4;
    ctx.save();
    ctx.beginPath();roundRect(fx+1,fy+1,faceW-2,faceH-2,5);ctx.clip();
    drawCorvan(sprX,sprY,faceScale,false,this.faceFrame*4,null);
    const mouthY=sprY+13*faceScale,mouthX=sprX+12*faceScale,mouthW=8*faceScale;
    const open=Math.abs(Math.sin(this.faceFrame*4))*1.8*faceScale;
    if(open>0.5){ctx.fillStyle='#2a0e06';ctx.fillRect(mouthX,mouthY,mouthW,open);}
    ctx.restore();
    // Nome do falante — dourado
    const tx=fx+faceW+facePad;
    ctx.font='bold 12px "Courier New"';ctx.fillStyle=this.speakerColor;ctx.fillText(this.speakerTxt,tx,by+pad+14);
    // Linha separadora dourada
    ctx.fillStyle='rgba(200,160,40,0.35)';ctx.fillRect(tx,by+pad+20,textW,1);
    // Texto
    ctx.font='15px "Courier New"';ctx.fillStyle=this.slowMode?'#c0b0e0':'#f0e8c0';
    this.lines.forEach((l,i)=>ctx.fillText(l,tx,by+pad+40+i*lineH));
    // Hint [E] Continuar — dourado pulsante
    const pulse=0.5+Math.sin(Date.now()/400)*0.5;
    ctx.fillStyle=`rgba(200,160,40,${pulse})`;ctx.font='12px "Courier New"';
    ctx.textAlign='right';ctx.fillText('[E] Continuar →',bx+bubW-pad,by+bubH-10);ctx.textAlign='left';
  }
};

function showDialog(lines,cb,speaker='CORVAN',slow=false){ BUBBLE.show(lines,cb,speaker,slow); }
function checkDlg(){ if(G.dialog&&!INV.open&&isE()) BUBBLE.advance(); }

// ── Notification ──────────────────────────────────────────────────
let notifText='',notifAlpha=0,notifTimer=0;
function notify(msg,ms=2800){notifText=msg;notifTimer=ms;notifAlpha=1;}
function tickNotif(){if(notifTimer>0){notifTimer-=16;if(notifTimer<=0)notifAlpha=0;else notifAlpha=Math.min(1,notifTimer/300);}}
function drawNotif(){
  if(notifAlpha<=0) return;
  ctx.save();ctx.globalAlpha=notifAlpha;ctx.font='14px "Courier New"';
  const tw=ctx.measureText(notifText).width+32,nx=(W-tw)/2,ny=46;
  ctx.fillStyle='rgba(0,0,0,0.88)';roundRect(nx,ny,tw,28,6);ctx.fill();
  ctx.strokeStyle='#e04030';ctx.lineWidth=1.5;roundRect(nx,ny,tw,28,6);ctx.stroke();
  ctx.fillStyle='#fff0d0';ctx.textAlign='center';ctx.fillText(notifText,W/2,ny+19);ctx.textAlign='left';
  ctx.restore();
}

// ── Pop-up informativo ────────────────────────────────────────────
const POPUP={
  active:false,title:'',lines:[],icon:'🔴',timer:0,
  show(title,icon,text,duration=8000){this.active=true;this.title=title;this.icon=icon;this.lines=text.split('\n');this.timer=duration;},
  tick(){if(this.timer>0){this.timer-=16;if(this.timer<=0)this.active=false;}},
  draw(){
    if(!this.active) return;
    const alpha=Math.min(1,this.timer/400);
    const PW=370,PH=this.lines.length*20+100,PX=W-PW-20,PY=60;
    ctx.save();ctx.globalAlpha=alpha;
    ctx.fillStyle='rgba(4,0,0,0.94)';_rr(PX,PY,PW,PH,12);ctx.fill();
    ctx.strokeStyle='#c02010';ctx.lineWidth=2;_rr(PX,PY,PW,PH,12);ctx.stroke();
    ctx.font='32px serif';ctx.textAlign='center';ctx.fillText(this.icon,PX+40,PY+46);
    ctx.font='bold 13px "Courier New"';ctx.fillStyle='#f0d060';ctx.fillText(this.title,PX+60,PY+28);
    ctx.font='12px "Courier New"';ctx.fillStyle='#f0e8c0';ctx.textAlign='left';
    this.lines.forEach((l,i)=>ctx.fillText(l,PX+16,PY+52+i*20));
    ctx.restore();
  }
};

// ── Zona de vapor de mercúrio ─────────────────────────────────────
// vaporZones: {x,y,w,h,level} — level 0..2
// Efeito visual: overlay azul-violeta sutil
// Efeito gameplay: chama da tocha azuleja; se ignorado, fala de Corvan vai ficando distorcida
class VaporZone {
  constructor(x,y,w,h,level){this.x=x;this.y=y;this.w=w;this.h=h;this.level=level;this.cleared=false;}
  overlaps(px,py,pw,ph){ return px<this.x+this.w&&px+pw>this.x&&py<this.y+this.h&&py+ph>this.y; }
  draw(){
    if(this.cleared) return;
    const sx=this.x-cam.x,sy=this.y-cam.y;
    if(sx>W+60||sx+this.w<-60) return;
    const pulse=0.04+Math.sin(Date.now()/900)*0.02;
    const col=['rgba(100,60,200,','rgba(120,80,220,','rgba(150,100,250,'][this.level];
    ctx.fillStyle=col+(pulse+this.level*0.02)+')';
    ctx.fillRect(sx,sy,this.w,this.h);
  }
}

// ── Enemy — guardas espanhóis e ratos ────────────────────────────
class Enemy{
  constructor(x,y,type,patrol){
    this.x=x;this.y=y;this.spawnX=x;this.type=type;
    this.w=type==='rato'?32:40; this.h=type==='rato'?22:60;
    this.patrol=patrol;this.vx=1.2;this.facing=1;this.dead=false;this.frame=0;
  }
  update(plats,player){
    if(this.dead) return;
    this.x+=this.vx;this.frame+=0.08;
    let onG=false;
    for(const p of plats){
      if(p.type==='spike'||p.type==='_dead') continue;
      if(this.x+this.w>p.x&&this.x<p.x+p.w&&this.y+this.h>=p.y&&this.y+this.h<=p.y+10) onG=true;
    }
    const edge=this.vx>0?this.x+this.w:this.x;
    let onEdge=false;
    for(const p of plats){
      if(p.type==='spike'||p.type==='_dead') continue;
      if(edge>p.x&&edge<p.x+p.w&&this.y+this.h+2>=p.y&&this.y+this.h+2<=p.y+12) onEdge=true;
    }
    if((onG&&!onEdge)||Math.abs(this.x-this.spawnX)>this.patrol) this.vx=-this.vx;
    this.facing=this.vx>0?1:-1;
  }
  draw(){
    if(this.dead) return;
    const sx=this.x-cam.x,sy=this.y-cam.y;
    if(sx<-80||sx>W+80) return;
    ctx.save();ctx.translate(sx+this.w/2,sy+this.h);
    if(this.facing===-1) ctx.scale(-1,1);
    if(this.type==='guarda'){
      // Guarda espanhol séc. XVI
      ctx.fillStyle='#8a1010';ctx.fillRect(-16,-58,32,58); // corpo/armadura
      ctx.fillStyle='#c82020';ctx.fillRect(-14,-54,28,20); // peito
      ctx.fillStyle='#d4a060';ctx.fillRect(-12,-38,24,18); // gola/golila branca
      ctx.fillStyle='#8a8060';ctx.fillRect(-10,-58,20,14); // capacete
      ctx.fillStyle='#a09070';ctx.fillRect(-12,-60,24,6);  // aba do capacete
      ctx.fillStyle='#c0a090';ctx.fillRect(-4,-60,8,8);    // rosto
      ctx.fillStyle='#601010';ctx.fillRect(-14,-34,12,34); ctx.fillRect(2,-34,12,34); // pernas
      ctx.fillStyle='#a8a080';ctx.fillRect(-18,-50,6,16);  // braço + lança
      ctx.fillStyle='#b0b090';ctx.fillRect(-20,-70,3,26);  // lança
    } else {
      // Rato da mina
      const bob=Math.sin(this.frame*Math.PI)*2;
      ctx.fillStyle='#4a4040';ctx.beginPath();ctx.ellipse(0,-8+bob,14,8,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#6a5a5a';ctx.beginPath();ctx.arc(12,-10+bob,6,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#d08080';ctx.beginPath();ctx.arc(14,-9+bob,2.5,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#302828';ctx.fillRect(-14,-8+bob,4,3);ctx.fillRect(-14,-4+bob,4,3);
      ctx.strokeStyle='#8a7070';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(12,-10+bob);ctx.bezierCurveTo(-5,-2+bob,-12,4+bob,-14,0+bob);ctx.stroke();
    }
    ctx.restore();
  }
}

// ── Lince Ibérico companion ───────────────────────────────────────
class LinceIberico{
  constructor(){
    this.x=400;this.y=300;this.angle=0;this.frame=0;this.sparkT=0;
    this.sparks=[];this.visible=false;this.introShown=false;
    this.state='orbit';this.landX=0;this.landY=0;
  }
  update(player){
    this.frame+=0.055;this.angle+=0.015;this.sparkT++;
    if(this.state==='orbit'){
      const orbitR=130;
      const orbitX=player.x+Math.cos(this.angle)*orbitR*1.4;
      const orbitY=player.y-140+Math.sin(this.angle)*orbitR*0.45;
      this.x+=(orbitX-this.x)*0.04;
      this.y+=(orbitY-this.y)*0.04;
    } else if(this.state==='land'){
      this.x+=(this.landX-this.x)*0.07;
      this.y+=(this.landY-this.y)*0.07;
      if(Math.abs(this.x-this.landX)<8&&Math.abs(this.y-this.landY)<8) this.state='landed';
    }
    if(this.sparkT%18===0&&this.state==='orbit'){
      this.sparks.push({x:this.x,y:this.y,vx:(Math.random()-.5)*.6,vy:(Math.random()+.2)*.5,life:50,max:50,size:2+Math.random()*2});
    }
    for(let i=this.sparks.length-1;i>=0;i--){const s=this.sparks[i];s.x+=s.vx;s.y+=s.vy;s.life--;if(s.life<=0)this.sparks.splice(i,1);}
  }
  land(x,y){ this.state='land';this.landX=x;this.landY=y; }
  draw(){
    for(const s of this.sparks){
      ctx.save();ctx.globalAlpha=(s.life/s.max)*0.55;
      ctx.fillStyle='#d0a040';
      ctx.beginPath();ctx.arc(s.x-cam.x,s.y-cam.y,s.size*(s.life/s.max),0,Math.PI*2);ctx.fill();
      ctx.restore();
    }
    const sx=this.x-cam.x,sy=this.y-cam.y;
    if(sx<-80||sx>W+80) return;
    ctx.save();
    if(this.state==='orbit'){
      const glow=ctx.createRadialGradient(sx,sy,0,sx,sy,50);
      glow.addColorStop(0,'rgba(210,160,60,0.18)');glow.addColorStop(1,'rgba(210,160,60,0)');
      ctx.fillStyle=glow;ctx.beginPath();ctx.arc(sx,sy,50,0,Math.PI*2);ctx.fill();
    }
    // Usar sprite SVG do lince
    if(IMG['lince']&&IMG['lince'].complete&&IMG['lince'].naturalWidth>0){
      const dw=80,dh=80;
      const flipX=this.state==='orbit'?Math.cos(this.angle)<0:false;
      const bob=this.state==='landed'?0:Math.sin(this.frame*1.5)*4;
      if(flipX){ctx.translate(sx+dw/2,sy-dh/2+bob);ctx.scale(-1,1);}
      else     ctx.translate(sx-dw/2,sy-dh/2+bob);
      ctx.drawImage(IMG['lince'],0,0,96,96,0,0,dw,dh);
    } else {
      // Fallback lince vetorial
      ctx.translate(sx,sy);
      const bob=Math.sin(this.frame*1.5)*4;
      ctx.fillStyle='#d09848';ctx.beginPath();ctx.ellipse(0,bob,22,12,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#e0a850';ctx.beginPath();ctx.ellipse(-8,bob-12,10,8,-0.2,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#1a1010';ctx.beginPath();ctx.arc(-8,bob-16,3,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.arc(-8,bob-16,1.2,0,Math.PI*2);ctx.fillStyle='#90d040';ctx.fill();
      ctx.fillStyle='#1a1010';ctx.fillRect(-12,bob-22,3,7);ctx.fillRect(-6,bob-22,3,7);
      // Pintas
      ctx.fillStyle='rgba(58,32,16,0.7)';
      for(const [ox,oy] of [[-4,bob-2],[4,bob+2],[-12,bob+4],[8,bob-4]]){
        ctx.beginPath();ctx.arc(ox,oy,3,0,Math.PI*2);ctx.fill();
      }
    }
    ctx.restore();
    // Hint de interação quando pousado e jogador próximo
    if(this.state==='landed'&&G.player){
      const dist=Math.hypot(G.player.x-this.x,G.player.y-this.y);
      if(dist<200){
        const ha=0.6+Math.sin(Date.now()/350)*0.4;
        ctx.font='bold 13px "Courier New"';
        const txt='[E] Interagir';
        const tw=ctx.measureText(txt).width+20;
        const bx=sx-tw/2,by=sy-100;
        ctx.fillStyle=`rgba(8,4,0,${0.85*ha})`;roundRect(bx,by,tw,24,5);ctx.fill();
        ctx.strokeStyle=`rgba(200,160,40,${ha})`;ctx.lineWidth=1.5;roundRect(bx,by,tw,24,5);ctx.stroke();
        ctx.fillStyle=`rgba(220,185,80,${ha})`;
        ctx.textAlign='center';ctx.fillText(txt,sx,by+16);ctx.textAlign='left';
      }
    }
  }
  speak(msg){ showDialog(msg,null,'🐾 LINCE IBÉRICO'); }
}

// ── Collectible ───────────────────────────────────────────────────
// Tipos: 'cinabrio', 'calcita_v', 'picareta_calc', 'tocha', 'destilador', 'frasco'
class Col{
  constructor(x,y,type){this.x=x;this.y=y;this.w=30;this.h=30;this.type=type;this.done=false;this.t=Math.random()*Math.PI*2;}
  tick(){if(!this.done)this.t+=0.06;}
  draw(){
    if(this.done) return;
    const sx=this.x-cam.x,sy=this.y-cam.y+Math.sin(this.t)*5;
    if(sx<-50||sx>W+50) return;
    ctx.save();ctx.translate(sx+15,sy+15);
    if(this.type==='cinabrio'){
      // Cinábrio — vermelho escarlate brillante irregular
      ctx.fillStyle='#c81818';ctx.beginPath();ctx.arc(0,0,12,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#e02828';ctx.beginPath();ctx.arc(-3,-3,7,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#901010';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,12,0,Math.PI*2);ctx.stroke();
      // Brilho escarlate
      ctx.fillStyle='rgba(255,180,180,0.5)';ctx.beginPath();ctx.arc(-4,-5,4,0,Math.PI*2);ctx.fill();
      // Shimmer metálico
      const sh=0.4+Math.sin(this.t*2)*0.4;
      ctx.fillStyle=`rgba(255,100,100,${sh})`;ctx.beginPath();ctx.arc(2,2,3,0,Math.PI*2);ctx.fill();
    } else if(this.type==='calcita_v'){
      // Calcita vermelha — imitadora, mas diferente
      ctx.fillStyle='#c87060';ctx.beginPath();ctx.arc(0,0,11,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#b06050';ctx.beginPath();ctx.arc(-2,-2,7,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#906040';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,11,0,Math.PI*2);ctx.stroke();
      ctx.fillStyle='rgba(230,200,190,0.4)';ctx.beginPath();ctx.arc(-3,-3,3,0,Math.PI*2);ctx.fill();
    } else if(this.type==='picareta_calc'){
      // Ícone pixel art da picareta de calcário
      if(IMG['picareta_img']){ctx.drawImage(IMG['picareta_img'],-15,-15,30,30);}
      else{ctx.fillStyle='#909898';ctx.fillRect(-14,-5,28,10);ctx.fillStyle='#7a5020';ctx.fillRect(-4,4,8,16);}
    } else if(this.type==='tocha'){
      if(IMG['tocha_img']){ctx.drawImage(IMG['tocha_img'],-15,-15,30,30);}
      else{ctx.fillStyle='#7a4520';ctx.fillRect(-3,2,6,16);ctx.fillStyle='#ff7010';ctx.beginPath();ctx.arc(0,-4,7,0,Math.PI*2);ctx.fill();}
    } else if(this.type==='destilador'){
      if(IMG['cornue']){ctx.drawImage(IMG['cornue'],-15,-15,30,30);}
      else{ctx.fillStyle='#78b4c8';ctx.beginPath();ctx.arc(4,2,10,0,Math.PI*2);ctx.fill();ctx.fillStyle='#a0cde8';ctx.fillRect(-12,0,10,5);}
    } else if(this.type==='frasco'){
      if(IMG['frasco_img']){ctx.drawImage(IMG['frasco_img'],-15,-15,30,30);}
      else{ctx.fillStyle='#6aaab0';ctx.beginPath();ctx.ellipse(0,4,8,12,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#c42020';ctx.fillRect(-4,-12,8,6);}
    }
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
    const sx=this.x+this.w/2-cam.x,sy=this.y-cam.y-26+Math.sin(Date.now()/350)*4;
    const txt='[E] '+this.label;ctx.font='14px "Courier New"';
    const tw=ctx.measureText(txt).width+24;
    ctx.fillStyle='rgba(0,0,0,0.82)';roundRect(sx-tw/2,sy-16,tw,24,4);ctx.fill();
    ctx.strokeStyle='#e04030';ctx.lineWidth=1.5;roundRect(sx-tw/2,sy-16,tw,24,4);ctx.stroke();
    ctx.fillStyle='#fff0d0';ctx.textAlign='center';ctx.fillText(txt,sx,sy);ctx.textAlign='left';
  }
}

// ── Player ────────────────────────────────────────────────────────
class Player{
  constructor(x,y){
    this.x=x;this.y=y;this.w=40;this.h=80;
    this.vx=0;this.vy=0;this.onG=false;this.facing=1;
    this.hp=3;this.maxHp=3;this.inv=0;this.dead=false;
    this.activeTool=null;this.frame=0;this.ft=0;this.state='idle';
    this.coyote=0;this.jbuf=0;this.onMoving=null;
    this.items=[];this.score=0;this.interactAnim=0;
    // Mecânica especial: nível de intoxicação por vapor (0..100)
    this.vaporExposure=0;
    this.vaporStunTimer=0;  // tempo bloqueado após intoxicação
    this.torchBlue=0;       // 0=normal, 1=azul (perigo)
  }
  overlaps(r){return this.x<r.x+r.w&&this.x+this.w>r.x&&this.y<r.y+r.h&&this.y+this.h>r.y;}
  near(r,d=80){return Math.abs(this.x+20-(r.x+r.w/2))<r.w/2+d&&Math.abs(this.y+40-(r.y+r.h/2))<r.h/2+d;}

  update(level){
    if(G.dialog) return;
    // Vapor stun — retrocede ao checkpoint
    if(this.vaporStunTimer>0){ this.vaporStunTimer--; return; }

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
    this.x+=this.vx;this._colX(level.plats);
    this.onG=false;this.y+=this.vy;this._colY(level.plats);
    this.x=Math.max(0,this.x);

    // Checar zonas de vapor
    let inVapor=false,vaporLvl=0;
    if(level.vaporZones){
      for(const vz of level.vaporZones){
        if(!vz.cleared&&vz.overlaps(this.x,this.y,this.w,this.h)){inVapor=true;vaporLvl=Math.max(vaporLvl,vz.level);}
      }
    }

    if(inVapor){
      this.vaporExposure=Math.min(100,this.vaporExposure+(1+vaporLvl));
      this.torchBlue=Math.min(1,this.torchBlue+0.04*(1+vaporLvl));
      if(this.vaporExposure>20&&Math.floor(this.vaporExposure)%30===0){sfx('vapor_warn');}
    } else {
      this.vaporExposure=Math.max(0,this.vaporExposure-0.5);
      this.torchBlue=Math.max(0,this.torchBlue-0.03);
    }

    // Intoxicação máxima — stun + retrocesso + fala confusa
    if(this.vaporExposure>=100&&!G.dialog){
      this.vaporExposure=60;
      this.vaporStunTimer=90;
      // Corvan fica onde está — apenas stunado, sem reset de posição
      showDialog([
        '"Não consigo... pensar direito."',
        '[Sistema] Vapor de mercúrio em concentração tóxica! Use o Destilador de Cornue para medir o ar antes de avançar. Procure a rota de ventilação — correntes de ar frio vindas das fissuras.',
      ],()=>{
        this.vaporExposure=0;   // zera exposição ao fechar o diálogo
        this.vaporStunTimer=0;  // libera movimento imediatamente
        this.torchBlue=0;       // restaura chama
      },'CORVAN',true);
    }

    if(!this.inv){
      for(const p of level.plats)
        if(p.type==='spike'&&this.overlaps(p)) this._hurt(1,level);
      for(const e of level.enemies){
        if(!e.dead&&this.overlaps(e)){
          if(this.vy>2&&this.y+this.h<e.y+e.h*0.5){e.dead=true;this.vy=-8;burst(e.x+20,e.y,'#e04030',10);sfx('coin');}
          else{this._hurt(1,level);this.vy=-7;this.vx=(this.x<e.x?-7:7);}
        }
      }
    }
    if(this.inv>0) this.inv--;
    if(this.interactAnim>0) this.interactAnim--;

    for(const c of level.cols){
      if(!c.done&&this.overlaps(c)){
        c.done=true;
        if(c.type==='cinabrio'){
          this.score+=10;this.items.push('cinabrio');sfx('cinabrio');
          burst(c.x+15,c.y+15,'#e02020',12);_journalColetar('cinabrio', this.items.filter(i=>i==='cinabrio').length);
          notify('🔴 Cinábrio coletado! ('+this.items.filter(i=>i==='cinabrio').length+'/3)');
          POPUP.show('Cinábrio (HgS)','🔴','Sulfeto de mercúrio escarlate.\nDensidade 8,1 g/cm³ — mais pesado que o esperado.\nPigmento vermilhão dos afrescos romanos.\nUsado para amalgamar prata em Potosí.',7000);
        } else if(c.type==='calcita_v'){
          sfx('crack');burst(c.x+15,c.y+15,'#c07060',8,2);
          notify('❌ Calcita vermelha! Mais leve que cinábrio — observe a densidade!');
        } else {
          this.items.push(c.type);sfx('item');burst(c.x+15,c.y+15,'#e04030',10);_journalColetar(c.type);
          if(c.type==='tocha')    notify('🔥 Tocha de Alcatrão coletada!');
          if(c.type==='picareta_calc') notify('⛏ Picareta de Calcário coletada!');
          if(c.type==='destilador'){
            notify('🧪 Destilador de Cornue recebido!');
            POPUP.show('Destilador de Cornue','🧪','Instrumento alquímico renascentista.\nAquece o mineral: cinábrio libera mercúrio.\nTambém detecta vapor no ar:\nse condensar sem aquecimento, há perigo.',8000);
          }
          if(c.type==='frasco'){sfx('frasco');notify('⚗️ Frasco de Mercúrio Alquímico encontrado!');}
        }
      }
    }

    // Testar com destilador zonas de vapor
    if(isE()&&this.items.includes('destilador')&&level.vaporZones){
      for(const vz of level.vaporZones){
        if(!vz.cleared&&vz.overlaps(this.x,this.y,this.w,this.h)){
          sfx('destilador');vz.cleared=true;
          notify('🧪 Vapor medido — zona segura!');
          burst(this.x+20,this.y+40,'#8060ff',12);
          this.vaporExposure=0;       // Limpa vapor completamente
          this.vaporStunTimer=0;      // Libera movimento imediatamente
          this.torchBlue=0;           // Restaura chama ao normal
          break;
        }
      }
    }

    if(isE()&&this.onG){for(const t of level.triggers){if(!t.done&&this.near(t)){t.fn(this,level);break;}}}
    if(this.y>level.H+200) this._hurt(3,level);

    if(!this.onG&&this.vy<0)      this.state='jump';
    else if(!this.onG&&this.vy>0) this.state='fall';
    else if(Math.abs(this.vx)>0.5) this.state='run';
    else this.state='idle';
    const spd=this.state==='run'?6:this.state==='idle'?18:8;
    if(++this.ft>=spd){this.ft=0;this.frame=(this.frame+1)%6;}
  }
  _colX(plats){
    for(const p of plats){
      if(p.type==='spike'||p.type==='_dead') continue;
      if(this.overlaps(p)){if(this.y+this.h<=p.y+4) continue;if(this.vx>0)this.x=p.x-this.w;else this.x=p.x+p.w;this.vx=0;}
    }
  }
  _colY(plats){
    for(const p of plats){
      if(p.type==='spike'||p.type==='_dead') continue;
      if(p.type==='trapdoor'&&this.vy<0) continue;
      if(this.overlaps(p)){
        if(this.vy>=0){this.y=p.y-this.h;this.vy=0;this.onG=true;if(p.moving)this.onMoving=p;if(p.type==='trapdoor'&&p.crumble===undefined)p.crumble=70;}
        else{if(this.y+this.h>p.y+p.h-4){this.y=p.y+p.h;this.vy=Math.abs(this.vy)*0.2;}}
      }
    }
  }
  _hurt(dmg,level){
    if(this.inv>0) return;
    this.hp-=dmg;this.inv=100;burst(this.x+20,this.y+40,'#ff4040',10);sfx('hit');
    if(this.hp<=0){this.hp=0;this.dead=true;}
  }
  drawTorch(){
    // Desenha tocha na mão de Corvan quando equipada
    // A chama vai ficando azul conforme torchBlue
    if(!this.items.includes('tocha')) return;
    const dx=this.x-cam.x+(this.facing===1?this.w-2:-12),dy=this.y-cam.y+this.h*0.3;
    // Cabo
    ctx.fillStyle='#6b4520';ctx.fillRect(dx-2,dy,5,22);
    // Chama
    const blueT=this.torchBlue;
    const r=Math.round(255*(1-blueT*0.9));
    const g2=Math.round(100*(1-blueT)+blueT*100);
    const b=Math.round(blueT*255);
    const flk=Math.sin(Date.now()/100)*2;
    ctx.fillStyle=`rgb(${r},${g2},${b})`;
    ctx.globalAlpha=0.85;ctx.beginPath();ctx.arc(dx+1,dy-4+flk,8,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=0.4;
    ctx.fillStyle=`rgb(${Math.min(255,r+80)},${Math.min(255,g2+80)},${Math.min(255,b+80)})`;
    ctx.beginPath();ctx.arc(dx+1,dy-10+flk,4,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=1;
    // Halo de luz (azuleja com vapor)
    const haloG=ctx.createRadialGradient(dx+1,dy-4,0,dx+1,dy-4,60);
    haloG.addColorStop(0,`rgba(${r},${g2},${b},0.14)`);haloG.addColorStop(1,`rgba(${r},${g2},${b},0)`);
    ctx.fillStyle=haloG;ctx.beginPath();ctx.arc(dx+1,dy-4,60,0,Math.PI*2);ctx.fill();
  }
  draw(){
    if(this.dead) return;
    // S=1.67 para h=80 — pé do sprite alinhado com base do hitbox (padrão fase 1-1)
    const S=1.67,FOOT_Y=46*S;
    const dx=this.x-cam.x+this.w/2-16*S;
    const dy=this.y-cam.y+this.h-FOOT_Y;
    const flip=this.facing===-1;
    const wf=this.state==='run'?this.frame:(this.state==='idle'?Date.now()/800:0);
    const _dispTool=this.activeTool||null;
    ctx.save();drawCorvan(dx,dy,S,flip,wf,_dispTool);ctx.restore();
    this.drawTorch();
    if(this.inv>0&&Math.floor(this.inv/6)%2===0){ctx.fillStyle='rgba(255,60,60,0.35)';ctx.fillRect(this.x-cam.x,this.y-cam.y,this.w,this.h);}
    if(this.vaporStunTimer>0){
      const a=this.vaporStunTimer/90*0.35;
      ctx.fillStyle=`rgba(80,40,160,${a})`;ctx.fillRect(0,0,W,H);
    }
  }
}

// ── Background draw ───────────────────────────────────────────────
function drawBg(bgKey){
  const img=IMG[bgKey];
  if(img&&img.complete&&img.naturalWidth>0){
    // SVGs pixel-art 640×360 — escalar para cobrir 1280×720
    ctx.drawImage(img,0,0,W,H);
  } else {
    const fb={bg01:'#d8c890',bg02:'#0a0806',bg03:'#0e0810',bg04:'#4a1830'};
    const grd=ctx.createLinearGradient(0,0,0,H);
    grd.addColorStop(0,fb[bgKey]||'#111');grd.addColorStop(1,'#050304');
    ctx.fillStyle=grd;ctx.fillRect(0,0,W,H);
  }
  ctx.fillStyle='rgba(0,0,0,0.25)';ctx.fillRect(0,0,W,H);
}

// ═══════════════════════════════════════════════════════════════
//  LEVEL BUILDERS
// ═══════════════════════════════════════════════════════════════

// ── Cena 1: Entrada da mina — La Mancha, calor, Lince, ferramentas
function buildL1(){
  const FL=560,WW=3200,WH=900;
  const plats=[
    solid(0,FL,480,WH-FL),
    solid(560,FL,200,WH-FL), solid(840,FL,180,WH-FL),
    solid(1100,FL,220,WH-FL), solid(1400,FL,200,WH-FL),
    solid(1680,FL,240,WH-FL), solid(1960,FL,260,WH-FL),
    solid(2280,FL,200,WH-FL), solid(2560,FL,220,WH-FL),
    solid(2820,FL,600,WH-FL),
    // Blocos de calcário
    solid(200,FL-160,130,18), solid(420,FL-240,120,18),
    solid(660,FL-200,130,18), solid(900,FL-270,120,18),
    solid(1100,FL-170,140,18), solid(1320,FL-280,120,18),
    solid(1500,FL-200,150,18), solid(1750,FL-270,130,18),
    solid(2060,FL-180,150,18), solid(2280,FL-300,120,18),
    solid(2500,FL-220,140,18), solid(2700,FL-280,120,18),
    movH(480,FL-36,80,480,560,2.2), movH(760,FL-36,80,760,840,2.0),
    movH(1020,FL-36,80,1020,1100,2.2), movH(1320,FL-36,80,1320,1400,1.8),
    movH(1620,FL-36,80,1620,1680,2.0), movH(1900,FL-36,80,1900,1960,2.2),
    movH(2200,FL-36,80,2200,2280,2.0), movH(2500,FL-36,80,2500,2560,1.8),
    movH(2740,FL-36,80,2740,2820,2.0),
    spike(455,FL-20,25), spike(558,FL-20,25),
    spike(818,FL-20,25), spike(1018,FL-20,25),
  ];
  const enemies=[
    new Enemy(680,FL-44,'guarda',70), new Enemy(1200,FL-44,'rato',80),
    new Enemy(1700,FL-44,'guarda',80), new Enemy(2100,FL-44,'rato',70),
    new Enemy(2400,FL-44,'guarda',80),
  ];
  const cols=[
    new Col(240,FL-50,'picareta_calc'),
    new Col(600,FL-50,'tocha'),
    ...[100,350,850,1180,1460,1740,2020,2300,2600,2860].map(x=>new Col(x,FL-50,'cinabrio')),
  ];
  const LINCE_X=3000,LINCE_Y=FL-40; // pé do lince no chão
  const lince=new LinceIberico();lince.visible=true;
  lince.x=LINCE_X;lince.y=LINCE_Y;lince.state='landed';

  const triggers=[
    new Trigger(2880,FL-300,200,300,'Aproximar do Lince',(player,level)=>{
      if(!player.items.includes('tocha')){notify('Colete a Tocha de Alcatrão primeiro!');return;}
      player.interactAnim=60;sfx('item');
      level.lince.state='landed';
      showDialog([
        '"O Lince Ibérico — Lynx pardinus. Menos de 1.000 sobreviventes. O felino mais ameaçado do mundo, endêmico desta terra calcária."',
        '"Ele descansa à sombra de uma azinheira com um instrumento dos alquimistas. Um Destilador de Cornue — para destilar cinábrio e medir o vapor de mercúrio."',
        '"Os alquimistas acreditavam que o mercúrio era a essência de todos os metais. Mas aqui dentro, esse vapor invisível e inodoro destruiu mentes e vidas."',
        'O Lince entrega o Destilador de Cornue. Entre na mina com cautela.',
      ],()=>{
        player.items.push('destilador');_journalColetar('destilador');
        notify('🧪 Destilador de Cornue recebido!');sfx('destilador');
        POPUP.show('Destilador de Cornue','🧪','Recipiente alquímico de vidro em pera.\nAquece cinábrio → condensa mercúrio puro.\nSem aquecimento: condensado visível = vapor perigoso.\nUse [E] em zonas azuladas para medir.',8000);
        level.triggers[0].done=true;setTimeout(()=>G.nextLevel(),4000);
      });
    }),
  ];
  return{
    id:1,bg:'bg01',W:WW,H:WH,startX:60,startY:FL-90,
    title:'A Porta de Plutão',
    hint:'Colete ⛏ Picareta de Calcário e a Tocha 🔥, depois encontre o Lince Ibérico 🐅!',
    plats,enemies,cols,triggers,lince,vaporZones:[],checkpoint:{x:60,y:FL-90},
    intro:[
      '"Almadén. Esta mina tem mais de 2.000 anos de história. Os romanos já a exploravam antes de Cristo."',
      '"Mas foi o Império Espanhol que a tornou indispensável — porque aqui dentro existe o único metal líquido em temperatura ambiente. E sem este metal vermelho, a prata dos Andes jamais teria sido explorada em escala. Tudo está conectado."',
      'Colete suas ferramentas e encontre o Lince Ibérico sagrado desta terra!'
    ],
    update(player){tickMoving(this.plats);tickTrapdoors(this.plats);for(const e of this.enemies)e.update(this.plats,player);if(!G.dialog)this.lince.update(player);for(const c of this.cols)c.tick();POPUP.tick();},
    draw(player){
      // Calor de La Mancha — shimmer de calor no horizonte
      const heatY=FL-cam.y;
      if(heatY>0&&heatY<H){
        const heatG=ctx.createLinearGradient(0,heatY-30,0,heatY);
        heatG.addColorStop(0,'rgba(220,180,80,0)');heatG.addColorStop(1,'rgba(220,180,80,0.08)');
        ctx.fillStyle=heatG;ctx.fillRect(0,heatY-30,W,30);
      }
      // Pedra de calcário branco na entrada da mina
      const ex=3000-cam.x,ey=FL-200-cam.y;
      if(ex>-100&&ex<W+100){
        ctx.fillStyle='#e8e0d0';ctx.fillRect(ex,ey,200,200);
        ctx.fillStyle='#d0c8b8';ctx.fillRect(ex+10,ey+10,180,180);
        // Arco da entrada
        ctx.fillStyle='#2a1a0a';ctx.beginPath();ctx.arc(ex+100,ey+180,70,Math.PI,0,true);ctx.fill();
        // Inscrição em latim
        ctx.font='bold 13px "Courier New"';ctx.fillStyle='#8a6840';ctx.textAlign='center';
        ctx.fillText('PLVTONIS PORTA',ex+100,ey+40);ctx.textAlign='left';
      }
      this.lince.draw();
      for(const e of this.enemies)e.draw();
      for(const c of this.cols)c.draw();
      for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

// ── Cena 2: Galerias de cinábrio — geologia, pop-ups, vapor suave
function buildL2(){
  const FL=570,WW=3400,WH=900;
  const plats=[
    solid(0,FL,340,WH-FL), solid(420,FL,200,WH-FL), solid(700,FL,200,WH-FL),
    solid(980,FL,200,WH-FL), solid(1260,FL,220,WH-FL), solid(1560,FL,200,WH-FL),
    solid(1840,FL,240,WH-FL), solid(2140,FL,220,WH-FL), solid(2440,FL,240,WH-FL),
    solid(2760,FL,600,WH-FL),
    solid(160,FL-180,140,18), solid(380,FL-260,120,18), solid(600,FL-200,130,18),
    solid(820,FL-250,120,18), solid(1060,FL-175,140,18), solid(1300,FL-280,120,18),
    solid(1500,FL-200,140,18), solid(1740,FL-260,130,18), solid(2020,FL-195,140,18),
    solid(2260,FL-300,120,18), solid(2490,FL-215,140,18),
    movH(340,FL-36,80,340,420,2.0), movH(620,FL-36,80,620,700,2.2),
    movH(900,FL-36,80,900,980,2.0), movH(1180,FL-36,80,1180,1260,1.8),
    movH(1480,FL-36,80,1480,1560,2.2), movH(1760,FL-36,80,1760,1840,2.0),
    movH(2060,FL-36,80,2060,2140,2.2), movH(2380,FL-36,80,2380,2440,2.0),
    movH(2680,FL-36,80,2680,2760,1.8),
    trap(780,FL-50,100), trap(1360,FL-50,100),
  ];
  const vaporZones=[
    new VaporZone(1020,FL-WH,200,WH,0),
    new VaporZone(1800,FL-WH,180,WH,1),
    new VaporZone(2500,FL-WH,220,WH,0),
  ];
  const enemies=[
    new Enemy(500,FL-44,'guarda',70), new Enemy(800,FL-44,'rato',60),
    new Enemy(1060,FL-44,'rato',80), new Enemy(1380,FL-44,'guarda',70),
    new Enemy(1620,FL-44,'guarda',90), new Enemy(1920,FL-44,'rato',80),
    new Enemy(2200,FL-44,'guarda',70), new Enemy(2560,FL-44,'rato',80),
    new Enemy(200,FL-180-60,'rato',45), new Enemy(640,FL-200-24,'guarda',50),
    new Enemy(1300,FL-280-24,'rato',45), new Enemy(1520,FL-200-60,'guarda',45),
  ];
  const cols=[
    ...[80,250,480,720,960,1200,1480,1720,2000,2260,2540,2760].map(x=>new Col(x,FL-50,'cinabrio')),
  ];
  const geoMessages=[
    {x:700,shown:false,text:'Origem Hidrotermal',icon:'⚗️',body:'Há 400 milhões de anos, fluidos ricos em\nenxofre e mercúrio preencheram fissuras\nno calcário marinho da Espanha pré-histórica.\nResultado: cinábrio — o sulfeto de mercúrio.'},
    {x:1500,shown:false,text:'Cinábrio e Vermilhão',icon:'🔴',body:'Cinábrio moído = vermilhão — pigmento vermelho.\nUsado nos afrescos de Pompeia (79 d.C.).\nOs romanos sabiam que era tóxico — mas continuavam.\nA beleza da cor justificava o custo humano.'},
    {x:2300,shown:false,text:'O Preço do Mercúrio',icon:'⚠️',body:'"Mal de mina" — os mineiros chamavam assim.\nTremores, perda de memória, psicose.\n"Mad as a hatter" — chapeleiros usavam Hg\npara curar feltro. Loucura profissional.'},
  ];
  const triggers=[
    new Trigger(2870,FL-300,200,300,'Examinar Veio Principal',(player,level)=>{
      if(!player.items.includes('destilador')){notify('Use o Destilador de Cornue primeiro!');return;}
      player.interactAnim=90;sfx('cinabrio');
      showDialog([
        '"Olhem essas veias vermelhas. Cinábrio — sulfeto de mercúrio puro. É um dos minerais mais belos do mundo, e um dos mais letais."',
        '"O vermelho vem do enxofre ligado ao mercúrio. Os romanos o usavam como pigmento — o famoso vermelho-vermilhão dos afrescos de Pompeia."',
        '"Mas os mineiros que o extraíam pagavam com a saúde e com a mente. Trabalho forçado — escravos, condenados, povos colonizados em ambas as pontas da rota."',
        'As galerias mais profundas esperam. Cena 3 desbloqueada.',
      ],()=>{notify('✦ Geologia da mina revelada!');level.triggers[0].done=true;setTimeout(()=>G.nextLevel(),4000);});
    }),
  ];
  return{
    id:2,bg:'bg02',W:WW,H:WH,startX:60,startY:FL-90,
    title:'As Galerias Escarlates',
    hint:'Monitore a chama 🔥 — fica azul = vapor! Use 🧪 [E] para medir.',
    plats,enemies,cols,triggers,vaporZones,geoMessages,checkpoint:{x:60,y:FL-90},
    intro:[
      '"Galerias de calcário branco intercaladas com veias escarlates de cinábrio. Um vermelho tão intenso que parece pintado."',
      '"Cuidado: o vapor de mercúrio é invisível e inodoro. A chama da tocha reage — fica azul quando há Hg no ar."',
      'Use [E] com o Destilador nas zonas azuladas antes de avançar!'
    ],
    update(player){
      tickMoving(this.plats);tickTrapdoors(this.plats);
      for(const e of this.enemies)e.update(this.plats,player);
      for(const gm of this.geoMessages){
        if(!gm.shown&&player.x>gm.x&&!G.dialog){gm.shown=true;POPUP.show(gm.text,gm.icon,gm.body,7000);}
      }
      for(const c of this.cols)c.tick();POPUP.tick();
    },
    draw(player){
      // Gotículas de mercúrio nas paredes
      const t=Date.now()/800;
      for(let i=0;i<12;i++){
        const mx=(200+i*230-cam.x)%WW;if(mx<0||mx>W+20) continue;
        const my=FL-cam.y-50+Math.sin(t+i)*8;
        ctx.fillStyle='rgba(180,200,220,0.7)';
        ctx.beginPath();ctx.arc(mx,my,3+Math.sin(t*0.5+i)*1.5,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='rgba(220,240,255,0.5)';ctx.beginPath();ctx.arc(mx-1,my-1,1.5,0,Math.PI*2);ctx.fill();
      }
      // Veios de cinábrio nas paredes
      for(let i=0;i<8;i++){
        const vx=400+i*350-cam.x;if(vx<-30||vx>W+30) continue;
        ctx.strokeStyle='#c02020';ctx.lineWidth=3+Math.random()*2;
        ctx.beginPath();ctx.moveTo(vx,0);ctx.lineTo(vx+40,FL-cam.y+60);ctx.stroke();
        ctx.strokeStyle='#e03030';ctx.lineWidth=1.5;
        ctx.beginPath();ctx.moveTo(vx+10,0);ctx.lineTo(vx+50,FL-cam.y+60);ctx.stroke();
      }
      for(const vz of this.vaporZones)vz.draw();
      for(const e of this.enemies)e.draw();
      for(const c of this.cols)c.draw();
      for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

// ── Cena 3: Coleta — vapor intenso, calcita vermelha, frasco
function buildL3(){
  const FL=570,WW=3600,WH=900;
  const plats=[
    solid(0,FL,280,WH-FL),
    solid(360,FL,140,WH-FL), solid(600,FL,120,WH-FL), solid(820,FL,160,WH-FL),
    solid(1080,FL,140,WH-FL), solid(1340,FL,160,WH-FL), solid(1610,FL,130,WH-FL),
    solid(1850,FL,280,WH-FL), solid(2240,FL,160,WH-FL), solid(2520,FL,140,WH-FL),
    solid(2780,FL,200,WH-FL),
    solid(140,FL-180,140,18), solid(500,FL-215,110,18), solid(740,FL-175,130,18),
    solid(980,FL-225,120,18), solid(1220,FL-155,140,18), solid(1480,FL-205,130,18),
    solid(1720,FL-195,145,18), solid(1980,FL-225,140,18), solid(2360,FL-175,130,18),
    solid(2640,FL-205,110,18),
    movH(280,FL-36,100,280,360,2.0), movH(740,FL-36,100,740,840,2.0),
    movH(980,FL-36,100,980,1080,2.0), movH(1520,FL-36,110,1520,1610,1.8),
    movH(2140,FL-36,100,2140,2240,2.2), movH(2680,FL-36,100,2680,2780,2.0),
    movV(2860,FL-100,100,FL-220,FL-36,2.0),
    trap(1080,FL-46,110),
    // Escadaria final
    solid(2980,FL-80,120,80), solid(3020,FL-160,110,80),
    solid(3060,FL-240,140,80), solid(3100,FL-300,180,18),
    solid(3200,FL-360,200,18), solid(3320,FL-420,360,18),
    solid(3100,FL-240,580,WH-FL+240),
  ];
  // Zonas de vapor — mais intensas aqui, com rotas de ventilação
  const vaporZones=[
    new VaporZone(420,FL-WH,140,WH,1),
    new VaporZone(900,FL-WH,180,WH,2),
    new VaporZone(1500,FL-WH,200,WH,1),
    new VaporZone(2100,FL-WH,150,WH,2),
    new VaporZone(2700,FL-WH,160,WH,1),
  ];
  const enemies=[
    new Enemy(420,FL-44,'guarda',60), new Enemy(880,FL-44,'rato',80),
    new Enemy(1380,FL-44,'guarda',70), new Enemy(1900,FL-44,'rato',100),
    new Enemy(2320,FL-44,'guarda',80),
  ];
  const cols=[
    // Cinábrio nas veias
    ...[100,200,420,640,880,1120,1380,1640,1900,2260,2540,2780].map(x=>new Col(x,FL-50,'cinabrio')),
    // Calcitas vermelhas imitadoras intercaladas
    new Col(480,FL-50,'calcita_v'), new Col(860,FL-50,'calcita_v'), new Col(1360,FL-50,'calcita_v'),
    new Col(1640,FL-50,'calcita_v'), new Col(2240,FL-50,'calcita_v'),
    // Frasco no altar
    new Col(3450,FL-450,'frasco'),
  ];
  const triggers=[
    new Trigger(3400,FL-480,200,480,'Pegar o Frasco',(player,level)=>{
      if(!player.items.includes('frasco')){notify('Colete o Frasco de Mercúrio primeiro!');return;}
      player.interactAnim=90;sfx('unlock');
      const cinN=player.items.filter(i=>i==='cinabrio').length;
      showDialog([
        '"Cuidado com o ar aqui. O vapor de mercúrio é invisível e inodoro — não consigo cheirá-lo nem vê-lo. Mas a tocha reage."',
        '"Quando a chama ficar azulada, há vapor no ar. Use o Destilador para medir antes de avançar. Se eu começar a falar devagar... é sinal que fui longe demais."',
        '"Este frasco de vidro soprado, fechado com cera vermelha — carregou mercúrio puro de Sevilha até Cartagena das Índias, depois em lombo de mula até Potosí."',
        `"${cinN} fragmentos de cinábrio coletados. Cada um valia vidas — dos mineiros de Almadén, dos trabalhadores de Potosí. A mesma cadeia. Dois continentes."`,
        'Suba ao exterior. A luz do entardecer de La Mancha espera.',
      ],()=>{notify('✦ Frasco encontrado! Suba à saída!');level.triggers[0].done=true;setTimeout(()=>G.nextLevel(),4000);});
    }),
  ];
  return{
    id:3,bg:'bg03',W:WW,H:WH,startX:60,startY:FL-90,
    title:'O Vapor Invisível',
    hint:'Tocha azul = perigo! [E] com 🧪 Destilador nas zonas. Calcita ≠ cinábrio.',
    plats,enemies,cols,triggers,vaporZones,checkpoint:{x:60,y:FL-90},
    intro:[
      '"Galerias mais profundas. Mais veias de cinábrio — e mais zonas de vapor."',
      '"A calcita vermelha imita o cinábrio, mas é mais leve. A densidade revela o verdadeiro."',
      'Colete 3 cinábrios verdadeiros e encontre o Frasco de Mercúrio Alquímico!'
    ],
    update(player){ tickMoving(this.plats);tickTrapdoors(this.plats); for(const e of this.enemies)e.update(this.plats,player); for(const c of this.cols)c.tick(); POPUP.tick(); },
    draw(player){
      // Glow do frasco no altar
      const ag=ctx.createRadialGradient(3450-cam.x,FL-450-cam.y,0,3450-cam.x,FL-450-cam.y,160);
      ag.addColorStop(0,'rgba(200,20,20,0.2)');ag.addColorStop(1,'rgba(200,20,20,0)');
      ctx.fillStyle=ag;ctx.fillRect(3270-cam.x,FL-500-cam.y,360,300);
      // Tochas de alcatrão nas paredes
      for(const tx of [3100,3500]){
        const tcx=tx-cam.x,flk=Math.sin(Date.now()/80+tx)*3;
        ctx.fillStyle='#3a1808';ctx.fillRect(tcx-3,FL-200-cam.y,7,80);
        ctx.fillStyle=`rgba(220,${80+flk|0},10,0.9)`;ctx.beginPath();ctx.arc(tcx,FL-204-cam.y+flk,11+flk,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=`rgba(255,${130+flk|0},40,0.35)`;ctx.beginPath();ctx.arc(tcx,FL-218-cam.y+flk,20+flk,0,Math.PI*2);ctx.fill();
      }
      // Mercúrio escorrendo
      const t2=Date.now()/600;
      for(let i=0;i<8;i++){
        const mx=(300+i*420-cam.x);if(mx<0||mx>W+20) continue;
        const drop=((t2*60+i*120)%200)/200;
        const my=FL-cam.y*(1-drop)*0.2-cam.y+drop*30;
        ctx.fillStyle='rgba(160,180,200,0.85)';ctx.beginPath();ctx.arc(mx,my,3.5,0,Math.PI*2);ctx.fill();
      }
      for(const vz of this.vaporZones)vz.draw();
      for(const e of this.enemies)e.draw();
      for(const c of this.cols)c.draw();
      for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

// ── Cena 4: Conclusão — entardecer La Mancha, moinho, rota do mercúrio
function buildL4(){
  const FL=610,WW=3200,WH=900;
  const plats=[
    solid(0,FL,380,WH-FL), solid(460,FL,320,WH-FL), solid(870,FL,360,WH-FL),
    solid(1330,FL,380,WH-FL), solid(1810,FL,400,WH-FL), solid(2320,FL,680,WH-FL),
    solid(200,FL-140,160,18), solid(400,FL-230,140,18), solid(600,FL-175,155,18),
    solid(840,FL-245,140,18), solid(1060,FL-195,155,18), solid(1280,FL-300,130,18),
    solid(1540,FL-195,175,18), solid(1760,FL-275,150,18), solid(2050,FL-175,160,18),
    solid(2380,FL-80,560,80), solid(2440,FL-160,500,80),
    solid(2510,FL-240,440,80), solid(2590,FL-300,380,18),
    solid(2680,FL-360,320,18), solid(2780,FL-420,260,18),
    movH(440,FL-175,120,440,730,2.2),
    movH(1380,FL-145,110,1380,1680,2.0),
    movH(2240,FL-135,110,2240,2380,1.8),
    trap(340,FL-76,110), trap(1100,FL-85,100),
    spike(395,FL-20,50), spike(810,FL-20,50), spike(1250,FL-20,50),
    spike(1730,FL-20,50), spike(2250,FL-20,60),
  ];
  const lince=new LinceIberico();lince.visible=true;
  const linceMessages=[
    {x:500,shown:false,text:'"Almadén produziu 1/3 de todo o mercúrio da história humana. A terra foi envenenada — e ainda hoje mostra altos níveis de mercúrio no solo."'},
    {x:1300,shown:false,text:'"A rota: Almadén → Sevilha → Atlântico → Cartagena → Andes → Potosí. 10.000 km. A mesma rota que a prata percorria no sentido inverso."'},
    {x:2100,shown:false,text:'"O Lince Ibérico quase desapareceu — como tantas coisas nesta terra. Restam menos de 1.000. A natureza aqui também pagou o preço da mineração."'},
    {x:2700,shown:false,text:'"No altar do entardecer, complete a missão. O mapa-múndi da mineração é sempre um mapa de conexões que ninguém quis ver."'},
  ];
  const enemies=[
    new Enemy(200,FL-44,'guarda',60), new Enemy(680,FL-44,'rato',70),
    new Enemy(1100,FL-44,'guarda',80), new Enemy(1600,FL-44,'rato',70),
    new Enemy(2050,FL-44,'guarda',80),
    new Enemy(440,FL-140-60,'guarda',45), new Enemy(640,FL-175-24,'rato',50),
  ];
  const cols=[
    ...[100,200,900,1100,1340,1560,1820,2060,2380,2480].map(x=>new Col(x,FL-50,'cinabrio')),
  ];
  const triggers=[
    new Trigger(2780,FL-460,240,460,'Completar a Fase!',(player,level)=>{
      if(!player.items.includes('cinabrio')){notify('Volte às galerias e colete o Cinábrio!');return;}
      if(!player.items.includes('frasco')){notify('Volte e encontre o Frasco de Mercúrio no altar!');return;}
      level.triggers[0].done=true;player.interactAnim=120;sfx('unlock');
      const cinN=player.items.filter(i=>i==='cinabrio').length;
      showDialog([
        '"Este frasco de mercúrio percorreu mais de 10.000 quilômetros para dissolver a prata nos Andes. Lembra da Fase 1? Aquela prata de Potosí?"',
        '"Ela só existiu porque deste mercúrio vermelho saído daqui. Almadén e Potosí eram dois lados de uma mesma engrenagem."',
        '"Dois lugares no mundo, dois povos diferentes, dois tipos de sofrimento, uma única cadeia de riqueza que enriqueceu a Espanha e espalhou miséria em dois continentes."',
        '"O mapa-múndi da mineração é sempre um mapa de conexões que ninguém quis ver."',
        `🏆 FASE 3.3 CONCLUÍDA! ${cinN} cinábrios coletados.\nTrilogia da Europa encerrada.\nPróximo destino: África!`,
      ],()=>{_salvarProgresso(G.player?.score||0,G.deaths);G.state='complete';});
    }),
  ];
  return{
    id:4,bg:'bg04',W:WW,H:WH,startX:60,startY:FL-90,
    title:'O Entardecer de La Mancha',
    hint:'Siga o Lince até o altar. [E] para completar a jornada.',
    plats,enemies,cols,triggers,lince,linceMessages,vaporZones:[],checkpoint:{x:60,y:FL-90},
    intro:[
      '"Na saída da mina ao entardecer — a planície de La Mancha, amarela e quente. Um moinho de vento ao longe."',
      '"Siga o Lince Ibérico até o altar. Esta é a fase que fecha o círculo — a conexão entre Almadén e Potosí."',
      'Complete a missão e honre a memória dos trabalhadores de ambas as pontas da rota.'
    ],
    update(player){
      tickMoving(this.plats);tickTrapdoors(this.plats);
      for(const e of this.enemies)e.update(this.plats,player);
      if(!G.dialog)this.lince.update(player);
      for(const lm of this.linceMessages){
        if(!lm.shown&&player.x>lm.x&&!G.dialog){lm.shown=true;showDialog([lm.text],null,'🐾 LINCE IBÉRICO');}
      }
      for(const c of this.cols)c.tick();POPUP.tick();
    },
    draw(player){
      // Pôr do sol La Mancha — céu laranja/violeta
      const sunG=ctx.createLinearGradient(0,0,0,H*0.6);
      sunG.addColorStop(0,'rgba(80,20,60,0.12)');sunG.addColorStop(1,'rgba(200,80,20,0.08)');
      ctx.fillStyle=sunG;ctx.fillRect(0,0,W,H*0.6);
      // Moinho de vento ao fundo (parallax)
      const mx=2100-cam.x*0.6;
      if(mx>-100&&mx<W+100){
        const my=FL-cam.y-160;
        // Torre
        ctx.fillStyle='#e0d8c0';ctx.fillRect(mx-12,my,24,120);
        ctx.fillStyle='#c8c0a8';ctx.fillRect(mx-10,my+2,20,116);
        // Pás girando
        const rot=Date.now()/2000;
        ctx.save();ctx.translate(mx,my+10);
        for(let i=0;i<4;i++){
          ctx.save();ctx.rotate(rot+i*Math.PI/2);
          ctx.fillStyle='#d8d0b8';ctx.fillRect(-3,-60,6,60);
          ctx.restore();
        }
        ctx.restore();
      }
      this.lince.draw();
      for(const e of this.enemies)e.draw();
      for(const c of this.cols)c.draw();
      for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

// ── HUD ────────────────────────────────────────────────────────────
function drawHUD(player,level){
  // Corações de vida
  for(let i=0;i<player.maxHp;i++){
    ctx.fillStyle=i<player.hp?'#e02020':'#333';
    ctx.beginPath();const hx=16+i*28,hy=10;
    ctx.arc(hx+5,hy+5,5,Math.PI,0);ctx.arc(hx+15,hy+5,5,Math.PI,0);
    ctx.lineTo(hx+20,hy+5);ctx.bezierCurveTo(hx+20,hy+14,hx+10,hy+18,hx+10,hy+18);
    ctx.bezierCurveTo(hx+10,hy+18,hx,hy+14,hx,hy+5);ctx.closePath();ctx.fill();
  }
  // Barra escura no topo — padrão fase 1-1
  ctx.fillStyle='rgba(0,0,0,0.55)';ctx.fillRect(0,0,W,34);
  // Título da cena — centro, branco com sombra
  ctx.shadowColor='rgba(0,0,0,0.8)';ctx.shadowBlur=6;
  ctx.fillStyle='#e8e0d0';ctx.font='20px "Courier New"';
  ctx.textAlign='center';ctx.fillText(level.title,W/2,24);ctx.textAlign='left';
  ctx.shadowBlur=0;
  // Score — canto direito
  ctx.fillStyle='#e8e0d0';ctx.font='bold 20px "Courier New"';
  ctx.textAlign='right';ctx.fillText('🔴 '+player.score,W-14,26);ctx.textAlign='left';

  // Painel Diário de Bordo — padrão fase 1-1 (fundo escuro + borda dourada)
  const PX=12,PY=46,PW=178,PH_BASE=52;
  const TOOL_DEFS=[
    {id:'picareta_calc',icon:'⛏', nome:'Picareta'},
    {id:'tocha',        icon:'🔥',nome:'Tocha'},
    {id:'frasco',       icon:'⚗️',nome:'Frasco Hg'},
    {id:'destilador',   icon:'🧪',nome:'Cornue'},
  ];
  const tools=TOOL_DEFS.filter(t=>player.items.includes(t.id));
  const PH=PH_BASE+(tools.length>0?6+tools.length*22:0);
  ctx.save();
  ctx.shadowColor='rgba(0,0,0,0.6)';ctx.shadowBlur=8;
  ctx.fillStyle='rgba(8,4,0,0.88)';roundRect(PX,PY,PW,PH,6);ctx.fill();
  ctx.shadowBlur=0;
  ctx.strokeStyle='#8a6820';ctx.lineWidth=1.5;roundRect(PX,PY,PW,PH,6);ctx.stroke();
  ctx.strokeStyle='rgba(200,160,40,0.25)';ctx.lineWidth=1;roundRect(PX+3,PY+3,PW-6,PH-6,4);ctx.stroke();
  ctx.restore();
  // Ícone livro + label + tecla [I]
  const midX=PX+PW/2;
  const kw=26,kx=PX+PW-kw-6,ky=PY+5;
  ctx.font='11px serif';ctx.fillStyle='#c0a030';ctx.textAlign='left';ctx.fillText('📔',PX+8,PY+20);
  ctx.font='bold 10px "Courier New"';ctx.fillStyle='#c0a030';ctx.fillText('DIÁRIO DE BORDO',PX+24,PY+20);
  ctx.fillStyle='rgba(200,160,40,0.2)';roundRect(kx,ky,kw,18,3);ctx.fill();
  ctx.strokeStyle='#c0a030';ctx.lineWidth=1;roundRect(kx,ky,kw,18,3);ctx.stroke();
  ctx.font='bold 10px "Courier New"';ctx.fillStyle='#e0b840';
  ctx.textAlign='center';ctx.fillText('[I]',kx+kw/2,ky+13);ctx.textAlign='left';
  // Separador fino
  ctx.fillStyle='rgba(200,160,40,0.3)';ctx.fillRect(PX+6,PY+26,PW-12,1);
  // Ferramenta ativa
  const atY=PY+44;ctx.textAlign='center';
  if(player.activeTool&&ITEM_DEFS[player.activeTool]){
    const def=ITEM_DEFS[player.activeTool];
    ctx.fillStyle='rgba(200,160,40,0.1)';roundRect(PX+6,atY-14,PW-12,20,3);ctx.fill();
    ctx.font='11px "Courier New"';ctx.fillStyle='#f0c040';
    ctx.fillText(def.icon+' '+def.nome,midX,atY+1);
  } else {
    ctx.font='12px "Courier New"';ctx.fillStyle='#c0c8d8';ctx.fillText('Não Equipado',midX,atY);
  }
  ctx.textAlign='left';
  // Ferramentas coletadas
  if(tools.length>0){
    ctx.fillStyle='rgba(200,160,40,0.3)';ctx.fillRect(PX+6,PY+PH_BASE,PW-12,1);
    tools.forEach((t,i)=>{
      const ty=PY+PH_BASE+8+i*22;
      const equipped=player.activeTool===t.id;
      ctx.textAlign='center';
      ctx.font='11px serif';ctx.fillStyle=equipped?'#f0c040':'#a08040';
      ctx.fillText(t.icon+' '+t.nome+(equipped?' ◀':''),midX,ty+10);
      ctx.textAlign='left';
    });
  }
  // Barra de vapor de mercúrio
  if(player.vaporExposure>15){
    const pct=player.vaporExposure/100,bW=130,bX=PX+PW+10,bY=PY+8;
    ctx.fillStyle='rgba(8,4,0,0.82)';roundRect(bX,bY,bW+8,22,4);ctx.fill();
    ctx.strokeStyle='rgba(200,160,40,0.4)';ctx.lineWidth=1;roundRect(bX,bY,bW+8,22,4);ctx.stroke();
    ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(bX+4,bY+5,bW,12);
    const col=player.torchBlue>0.5?`rgb(80,60,220)`:`rgb(${Math.round(200-pct*100)},${Math.round(80-pct*60)},${Math.round(20+pct*200)})`;
    ctx.fillStyle=col;ctx.fillRect(bX+4,bY+5,bW*pct,12);
    ctx.strokeStyle='#c0a040';ctx.lineWidth=1;ctx.strokeRect(bX+4,bY+5,bW,12);
    ctx.font='9px "Courier New"';ctx.fillStyle='#c0a040';
    ctx.fillText(player.torchBlue>0.3?'⚠ VAPOR Hg':'MERCÚRIO',bX+6,bY+15);
  }
  // Hint rodapé — fundo escuro + texto creme legível
  ctx.fillStyle='rgba(0,0,0,0.60)';ctx.fillRect(0,H-32,W,32);
  ctx.shadowColor='rgba(0,0,0,0.9)';ctx.shadowBlur=6;
  ctx.fillStyle='#f0e8c0';ctx.font='17px "Courier New"';
  ctx.textAlign='center';ctx.fillText(level.hint,W/2,H-10);
  ctx.textAlign='left';ctx.shadowBlur=0;
  if(G.timeOnLevel<600){
    ctx.save();ctx.globalAlpha=Math.min(1,(600-G.timeOnLevel)/120);
    ctx.fillStyle='#aaa';ctx.font='12px "Courier New"';
    ctx.restore();
  }
}

// ── Title Screen ──────────────────────────────────────────────────
function drawTitle(){
  // Fundo: cena 4 (entardecer/moinho) — estático, cobrindo toda a tela
  const bgImg=IMG['bg04'];
  if(bgImg&&bgImg.complete&&bgImg.naturalWidth>0){
    ctx.save();ctx.globalAlpha=0.92;
    ctx.drawImage(bgImg,0,0,W,H);
    ctx.restore();
  } else {
    const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#4a1830');g.addColorStop(1,'#060002');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  }
  ctx.fillStyle='rgba(0,0,0,0.62)';ctx.fillRect(0,0,W,H);
  // Estrelas
  for(let i=0;i<100;i++){const sx=(i*149.5)%W,sy=(i*89.7)%260;ctx.fillStyle=`rgba(255,240,200,${.15+Math.sin(Date.now()/1200+i)*.15})`;ctx.fillRect(sx,sy,i%4===0?2:1,i%4===0?2:1);}
  ctx.textAlign='center';
  // Título — branco-quente com sombra escura forte
  ctx.shadowColor='rgba(0,0,0,0.9)';ctx.shadowBlur=18;
  ctx.fillStyle='#fff5e8';ctx.font='bold 46px "Courier New"';ctx.fillText('O Vermelho Que Move o Mundo',W/2,148);
  ctx.shadowBlur=0;
  ctx.fillStyle='#f0c898';ctx.font='19px "Courier New"';ctx.fillText('Fase 3.3  —  Almadén, Espanha · Século XVI',W/2,200);
  if(IMG.card33){
    const cardSize=160,cardX=W/2-80,cardY=230;
    const glow=ctx.createRadialGradient(W/2,cardY+80,0,W/2,cardY+80,130);
    glow.addColorStop(0,'rgba(200,20,20,0.2)');glow.addColorStop(1,'rgba(200,20,20,0)');
    ctx.fillStyle=glow;ctx.beginPath();ctx.arc(W/2,cardY+80,130,0,Math.PI*2);ctx.fill();
    ctx.drawImage(IMG.card33,cardX,cardY,cardSize,cardSize);
  }
  ctx.fillStyle=`rgba(255,220,80,${.7+Math.sin(Date.now()/550)*.3})`;ctx.font='19px "Courier New"';
  ctx.fillText('▶  Pressione ENTER para começar  ◀',W/2,454);
  ctx.fillStyle='#c0c8d8';ctx.font='18px "Courier New"';
  ctx.fillText('← → Mover   |   ↑ Espaço Pular   |   E Interagir   |   I Diário de Bordo',W/2,500);
  ctx.fillText('[M] Menu Principal',W/2,538);
  ctx.textAlign='left';
}

function drawDeath(){
  ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);
  const cause=G.player?.deathCause||'queda';
  const msgs={queda:'CORVAN CAIU!',rocha:'QUE ESPETO!',inimigo:'O LINCE NÃO PERDOOU!',vapor:'O VAPOR TE QUEIMOU!',colapso:'DESMORONAMENTO!'};
  const subs={queda:'As minas de cinábrio de Almadén são profundas e traiçoeiras!',rocha:'Cuidado com as estacas e paredes afiadas das galerias!',inimigo:'O lince é guardião da mina — respeite seu território!',vapor:'Os gases de mercúrio são invisíveis e mortais. Cuidado!',colapso:'A galeria de calcário desabou. Nunca pare sob tetos instáveis!'};
  ctx.textAlign='center';ctx.shadowColor='#ff2020';ctx.shadowBlur=30;
  ctx.fillStyle='#ff5050';ctx.font='bold 54px "Courier New"';ctx.fillText(msgs[cause]||'CORVAN CAIU!',W/2,H/2-50);
  ctx.shadowBlur=0;
  ctx.fillStyle='#e8c890';ctx.font='16px "Courier New"';ctx.fillText(subs[cause]||'As minas de Almadén não perdoam.',W/2,H/2-10);
  drawCorvan(W/2-24,H/2+10,3,false,Date.now()/200);
  ctx.fillStyle='#e04030';ctx.font='20px "Courier New"';
  ctx.fillText('Pressione  R  para recomeçar',W/2,H/2+100);
  ctx.fillText(`Mortes: ${G.deaths}`,W/2,H/2+132);
  ctx.fillStyle='#888';ctx.font='15px "Courier New"';ctx.fillText('[M] Menu Principal',W/2,H/2+168);
  ctx.textAlign='left';
}

function drawComplete(){
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0e0204');g.addColorStop(1,'#200408');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  const rg=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,500);rg.addColorStop(0,'rgba(180,20,20,.15)');rg.addColorStop(1,'rgba(180,20,20,0)');ctx.fillStyle=rg;ctx.fillRect(0,0,W,H);
  ctx.textAlign='center';ctx.shadowColor='#e04030';ctx.shadowBlur=40;
  ctx.fillStyle='#e03020';ctx.font='bold 40px "Courier New"';ctx.fillText('✦  FASE 3.3 CONCLUÍDA  ✦',W/2,120);
  ctx.shadowBlur=0;ctx.fillStyle='#e8d090';ctx.font='20px "Courier New"';ctx.fillText('O Vermelho que Move o Mundo foi revelado!',W/2,170);
  const lines=[
    '🔴  Cinábrio (HgS) — o mais belo e o mais letal da série',
    '⚗️  Frasco de Mercúrio — 10.000 km, dois continentes, uma corrente',
    '🧪  Destilador de Cornue — alquimia a serviço da sobrevivência',
    '🐾  Lince Ibérico — a natureza que pagou junto',
  ];
  ctx.fillStyle='#e0c878';ctx.font='16px "Courier New"';lines.forEach((l,i)=>ctx.fillText(l,W/2,230+i*32));
  ctx.fillStyle='#e04030';ctx.font='18px "Courier New"';ctx.fillText(`Pontuação: ⭐ ${G.player?.score||0}   Mortes: ${G.deaths}`,W/2,395);
  ctx.fillStyle=`rgba(200,60,40,${.6+Math.sin(Date.now()/600)*.4})`;ctx.font='17px "Courier New"';ctx.fillText('▶ [M] Menu Principal ◀',W/2,440);
  ctx.font='64px serif';ctx.fillText('🏆',W/2-32,524);ctx.textAlign='left';
}

// ── Game engine ───────────────────────────────────────────────────
const LEVELS=[buildL1,buildL2,buildL3,buildL4];
const G={
  state:'title',lvIdx:0,level:null,player:null,
  dialog:false,deaths:0,timeOnLevel:0,
  _storedItems:[],_storedScore:0,_storedTool:null,

  load(idx){
    this.lvIdx=idx;particles=[];
    tileTheme=TILE_THEMES[idx+1]||TILE_THEMES[1];
    this.level=LEVELS[idx]();
    cam.x=0;cam.y=0;
    this.player=new Player(this.level.startX,this.level.startY);
    if(idx>0){this.player.items=[...this._storedItems];this.player.score=this._storedScore;this.player.activeTool=this._storedTool||null;}
    this.dialog=false;this.state='playing';this.timeOnLevel=0;
    BUBBLE.active=false;POPUP.active=false;
    setTimeout(()=>{if(this.state==='playing')showDialog(this.level.intro,null);},900);
  },
  nextLevel(){
    this._storedItems=[...this.player.items];this._storedScore=this.player.score;this._storedTool=this.player.activeTool;
    if(this.lvIdx+1<LEVELS.length) this.load(this.lvIdx+1); else this.state='complete';
  },
  update(){
    if(this.state!=='playing') return;
    this.timeOnLevel++;checkDlg();
    if(INV.open) INV.navigate(this.player);
    updateCam(this.player.x,this.level.W);
    this.level.update(this.player);
    this.player.update(this.level);
    tickParticles();tickNotif();
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
    drawNotif();POPUP.draw();INV.draw(this.player);
  }
};

function _journalColetar(tipo, count) {
  const id = TIPO_TO_JOURNAL[tipo] || tipo;
  if (!id) return;
  if (window.JournalStore) window.JournalStore.collect(id, count!=null?{count}:undefined);
  try {
    const raw = localStorage.getItem('mineralis_save_v2');
    const save = raw ? JSON.parse(raw) : {versao:1,iniciado:true};
    if (!save.coletados) save.coletados = {};
    if (count && count > 1) {
      save.coletados[id] = Math.max(Number(save.coletados[id])||0, count);
    } else if (!save.coletados[id]) {
      save.coletados[id] = true;
    }
    if (!save.fases) save.fases = {};
    if (!save.fases['3.3']) save.fases['3.3'] = {desbloqueada:true, estrelas:0, coletados:{}};
    if (!save.fases['3.3'].coletados) save.fases['3.3'].coletados = {};
    if (count && count > 1) {
      save.fases['3.3'].coletados[id] = Math.max(Number(save.fases['3.3'].coletados[id])||0, count);
    } else {
      save.fases['3.3'].coletados[id] = true;
    }
    localStorage.setItem('mineralis_save_v2', JSON.stringify(save));
  } catch(e) {}
}
function _salvarProgresso(score,deaths){
  const estrelas=deaths===0?4:deaths<=2?3:deaths<=5?2:1;
  try{const raw=localStorage.getItem('mineralis_save_v2');const save=raw?JSON.parse(raw):{versao:1,iniciado:true,fases:{}};if(!save.fases)save.fases={};if(!save.fases['3.3'])save.fases['3.3']={desbloqueada:true,estrelas:0};save.fases['3.3'].estrelas=Math.max(save.fases['3.3'].estrelas||0,estrelas);save.fases['3.3'].desbloqueada=true;localStorage.setItem('mineralis_save_v2',JSON.stringify(save));}catch(e){}
}

// ── Música de fundo — Fase 3.3 (Almadén/Mercúrio): modo frígio sombrio ──
let _bgMusicActive=false,_bgMusicTimeout=null,_bgMusicGain=null;
const _NOTES_ALM=[146.8,155.6,174.6,196,207.6,220,246.9,261.6]; // frígio grave
function startBgMusic(){
  if(_bgMusicActive||!AC)return;
  _bgMusicActive=true;
  if(AC.state==='suspended')AC.resume();
  _bgMusicGain=AC.createGain();_bgMusicGain.gain.value=0.04;_bgMusicGain.connect(AC.destination);
  function _nota(freq,start,dur){
    const o=AC.createOscillator(),g=AC.createGain();
    o.type='sine';o.frequency.value=freq;
    g.gain.setValueAtTime(0,start);g.gain.linearRampToValueAtTime(0.05,start+0.1);
    g.gain.setValueAtTime(0.05,start+dur-0.25);g.gain.linearRampToValueAtTime(0,start+dur);
    o.connect(g);g.connect(_bgMusicGain);o.start(start);o.stop(start+dur);
  }
  const SEQ=[0,1,3,4,3,1,0,2,3,5,4,3,1,0,2,1];
  function _ciclo(){
    if(!_bgMusicActive)return;
    const t=AC.currentTime+0.1;
    SEQ.forEach((idx,i)=>_nota(_NOTES_ALM[idx%_NOTES_ALM.length],t+i*0.55,0.65));
    _bgMusicTimeout=setTimeout(_ciclo,(SEQ.length*0.55-0.4)*1000);
  }
  _ciclo();
}
function stopBgMusic(){
  _bgMusicActive=false;clearTimeout(_bgMusicTimeout);
  if(_bgMusicGain&&AC){_bgMusicGain.gain.linearRampToValueAtTime(0,AC.currentTime+0.5);_bgMusicGain=null;}
}
let _prevState='';

function startGame(){
  G.load(0); G.state='title'; loop();
}
function loop(){
  requestAnimationFrame(loop);
  if(G.state!==_prevState){
    if(G.state==='playing'&&_prevState!=='playing')startBgMusic();
    if((G.state==='dead'||G.state==='complete')&&_prevState==='playing')stopBgMusic();
    _prevState=G.state;
  }
  if(G.state==='title'    &&(jp['Enter']||jp['Space'])) G.load(0);
  if(G.state==='dead'     && jp['KeyR'])                G.load(G.lvIdx);
  if(G.state==='complete' &&(jp['Enter']||jp['KeyM'])) _voltarAoMenu();
  G.update();G.draw();clearJP();
}

if(!gameReady){
  (function loadLoop(){
    if(gameReady) return;
    requestAnimationFrame(loadLoop);
    ctx.fillStyle='#080202';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#e04030';ctx.font='bold 22px "Courier New"';ctx.textAlign='center';
    ctx.fillText(`Carregando${'.'.repeat(Math.floor(Date.now()/400)%4)}  ${assetsLoaded}/${totalAssets}`,W/2,H/2);
    ctx.textAlign='left';
  })();
}