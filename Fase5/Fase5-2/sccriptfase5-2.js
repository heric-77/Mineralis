// ═══════════════════════════════════════════════════════════════
//  MINERALIS  –  Fase 5.2  ·  O Azul que o Mundo Buscou
//  scriptfase5-2.js
//  Sar-e-Sang, Badakhshan, Afeganistão · 2500 a.C.
//  Lápis-Lazúli · Fire-Setting · Sodalita · Pigmento Ultramarino
// ═══════════════════════════════════════════════════════════════

const W = 1280, H = 720;
const wrap   = document.getElementById('wrap');
const canvas = document.getElementById('c');
const ctx    = canvas.getContext('2d');
canvas.width = W; canvas.height = H;

function resize() {
  const s = Math.min(window.innerWidth/W, window.innerHeight/H);
  const sw = Math.round(W*s), sh = Math.round(H*s);
  canvas.style.width = sw+'px'; canvas.style.height = sh+'px';
  wrap.style.width   = sw+'px'; wrap.style.height   = sh+'px';
  wrap.style.position = 'fixed';
  wrap.style.left = Math.round((window.innerWidth -sw)/2)+'px';
  wrap.style.top  = Math.round((window.innerHeight-sh)/2)+'px';
}
resize(); window.addEventListener('resize', resize);

// ── Audio ──────────────────────────────────────────────────────
let AC;
try { AC = new (window.AudioContext||window.webkitAudioContext)(); } catch(e){}
function sfx(type) {
  if (!AC) return;
  if (AC.state==='suspended') AC.resume();
  const o=AC.createOscillator(), g=AC.createGain();
  o.connect(g); g.connect(AC.destination);
  const t=AC.currentTime;
  let stopAt=.45;
  if      (type==='jump')      { o.frequency.setValueAtTime(280,t); o.frequency.exponentialRampToValueAtTime(520,t+.14); g.gain.setValueAtTime(.15,t); g.gain.exponentialRampToValueAtTime(.001,t+.16); }
  else if (type==='coin')      { o.frequency.setValueAtTime(880,t); o.frequency.exponentialRampToValueAtTime(1760,t+.09); g.gain.setValueAtTime(.12,t); g.gain.exponentialRampToValueAtTime(.001,t+.12); }
  else if (type==='hit')       { o.type='sawtooth'; o.frequency.setValueAtTime(200,t); o.frequency.exponentialRampToValueAtTime(50,t+.18); g.gain.setValueAtTime(.18,t); g.gain.exponentialRampToValueAtTime(.001,t+.22); }
  else if (type==='item')      { o.frequency.setValueAtTime(440,t); o.frequency.setValueAtTime(660,t+.1); o.frequency.setValueAtTime(880,t+.2); g.gain.setValueAtTime(.14,t); g.gain.exponentialRampToValueAtTime(.001,t+.3); }
  else if (type==='unlock')    { o.frequency.setValueAtTime(330,t); o.frequency.setValueAtTime(440,t+.15); o.frequency.setValueAtTime(660,t+.3); g.gain.setValueAtTime(.15,t); g.gain.exponentialRampToValueAtTime(.001,t+.5); }
  // Crepitar do fogo (loop curto, chamado repetidamente durante heating)
  else if (type==='crackle')   { o.type='triangle'; o.frequency.setValueAtTime(260+Math.random()*280,t); g.gain.setValueAtTime(.012,t); g.gain.exponentialRampToValueAtTime(.001,t+.09); stopAt=.12; }
  // TSSSHHH explosivo — água na rocha quente
  else if (type==='tssh')      { o.type='sawtooth'; o.frequency.setValueAtTime(1600,t); o.frequency.exponentialRampToValueAtTime(180,t+.42); g.gain.setValueAtTime(.11,t); g.gain.linearRampToValueAtTime(.09,t+.22); g.gain.exponentialRampToValueAtTime(.001,t+.55); const o2=AC.createOscillator(),g2=AC.createGain(); o2.type='triangle'; o2.frequency.setValueAtTime(85,t+.05); g2.gain.setValueAtTime(.07,t+.05); g2.gain.exponentialRampToValueAtTime(.001,t+.32); o2.connect(g2); g2.connect(AC.destination); o2.start(t+.05); o2.stop(t+.42); stopAt=.65; }
  // CRACK — rocha rachando em lascas
  else if (type==='rockcrack') { o.type='square'; o.frequency.setValueAtTime(150,t); o.frequency.exponentialRampToValueAtTime(45,t+.18); g.gain.setValueAtTime(.14,t); g.gain.exponentialRampToValueAtTime(.001,t+.24); stopAt=.3; }
  // Água cedo demais — falha
  else if (type==='fail_hiss') { o.type='sine'; o.frequency.setValueAtTime(520,t); o.frequency.exponentialRampToValueAtTime(180,t+.28); g.gain.setValueAtTime(.05,t); g.gain.exponentialRampToValueAtTime(.001,t+.34); stopAt=.4; }
  // Pilão moendo grosso
  else if (type==='grind')     { o.type='triangle'; o.frequency.setValueAtTime(120+Math.random()*50,t); g.gain.setValueAtTime(.055,t); g.gain.exponentialRampToValueAtTime(.001,t+.13); stopAt=.18; }
  // Pó fino final da moagem — sussurro
  else if (type==='grindfine') { o.type='triangle'; o.frequency.setValueAtTime(1800,t); o.frequency.exponentialRampToValueAtTime(2600,t+.14); g.gain.setValueAtTime(.018,t); g.gain.exponentialRampToValueAtTime(.001,t+.2); stopAt=.25; }
  // Plof do pó na água + shhh
  else if (type==='plof_water'){ o.type='sine'; o.frequency.setValueAtTime(280,t); o.frequency.exponentialRampToValueAtTime(140,t+.14); g.gain.setValueAtTime(.06,t); g.gain.exponentialRampToValueAtTime(.001,t+.32); stopAt=.4; }
  // Shimmer dourado — pirita vista
  else if (type==='shimmer')   { [1600,2000,2400].forEach((f,i)=>{const oi=AC.createOscillator(),gi=AC.createGain();oi.type='sine';oi.frequency.setValueAtTime(f,t+i*.05);gi.gain.setValueAtTime(.06,t+i*.05);gi.gain.exponentialRampToValueAtTime(.001,t+i*.05+.2);oi.connect(gi);gi.connect(AC.destination);oi.start(t+i*.05);oi.stop(t+i*.05+.25);}); }
  // Silêncio marcado + duduk grave — coleta de lápis genuíno
  else if (type==='duduk')     { o.type='sine'; o.frequency.setValueAtTime(220,t); g.gain.setValueAtTime(.0,t); g.gain.linearRampToValueAtTime(.07,t+.25); g.gain.linearRampToValueAtTime(.045,t+.8); g.gain.exponentialRampToValueAtTime(.001,t+1.25); stopAt=1.35; }
  // Vidro fechado com cera — frasco de ultramarino
  else if (type==='glass')     { o.type='sine'; o.frequency.setValueAtTime(1200,t); o.frequency.exponentialRampToValueAtTime(900,t+.15); g.gain.setValueAtTime(.055,t); g.gain.exponentialRampToValueAtTime(.001,t+.2); const o2=AC.createOscillator(),g2=AC.createGain(); o2.type='sine'; o2.frequency.setValueAtTime(440,t+.2); g2.gain.setValueAtTime(.055,t+.2); g2.gain.exponentialRampToValueAtTime(.001,t+.8); o2.connect(g2); g2.connect(AC.destination); o2.start(t+.2); o2.stop(t+.9); stopAt=.95; }
  // Águia dourada no cânion
  else if (type==='eagle')     { o.type='sine'; o.frequency.setValueAtTime(1800,t); o.frequency.exponentialRampToValueAtTime(1200,t+.3); g.gain.setValueAtTime(.08,t); g.gain.exponentialRampToValueAtTime(.001,t+.35); }
  else if (type==='stone')     { o.type='square'; o.frequency.setValueAtTime(120,t); g.gain.setValueAtTime(.1,t); g.gain.exponentialRampToValueAtTime(.001,t+.15); }
  o.start(t); o.stop(t+stopAt);
}

// ── Save ─────────────────────────────────────────────────────────
const SAVE_KEY = 'mineralis_save_v2';
function _salvarFase(score, deaths){
  const estrelas = deaths===0?4:deaths<=2?3:deaths<=5?2:1;
  try{
    const raw=localStorage.getItem(SAVE_KEY);
    const save=raw?JSON.parse(raw):{versao:1,iniciado:true,fases:{}};
    if(!save.fases) save.fases={};
    if(!save.fases['5.2']) save.fases['5.2']={desbloqueada:true,estrelas:0};
    save.fases['5.2'].estrelas=Math.max(save.fases['5.2'].estrelas||0,estrelas);
    save.fases['5.2'].desbloqueada=true;
    localStorage.setItem(SAVE_KEY,JSON.stringify(save));
  }catch(e){}
}
function _voltarAoMenu(){ _salvarFase(G.player?.score||0,G.deaths); window.location.href='../../MenuPrincipal/index.html'; }

// ── Assets ───────────────────────────────────────────────────────
const IMG={};
const ASSETS=[
  ['bg01','Assets/cena1_vale_sar_e_sang.svg'],
  ['bg02','Assets/cena2_galerias_lapis.svg'],
  ['bg03','Assets/cena3_fire_setting.svg'],
  ['bg04','Assets/cena4_oficina_pigmento.svg'],
  ['ovelha_img',  'Assets/5_2_ovelha_marco_polo.svg'],
  ['pilao_img',   'Assets/5_2_pilao_almofariz_agata.svg'],
  ['tora_img',    'Assets/5_2_tora_pinheiro.svg'],
  ['anfora_img',  'Assets/5_2_anfora_barro.svg'],
  ['frasco_img',  'Assets/5_2_frasco_ultramarino.svg'],
  ['card52',      'Assets/5_2_lapis.svg'],
];
let assetsLoaded=0, totalAssets=ASSETS.length, gameReady=false;
ASSETS.forEach(([key,src])=>{
  const img=new Image();
  img.onload  = () => { IMG[key]=img; if(++assetsLoaded>=totalAssets){gameReady=true;startGame();} };
  img.onerror = () => { IMG[key]=null; if(++assetsLoaded>=totalAssets){gameReady=true;startGame();} };
  img.src=src;
});

// ── Input ─────────────────────────────────────────────────────────
const keys={}, jp={};
window.addEventListener('keydown',e=>{
  if(!keys[e.code]) jp[e.code]=true; keys[e.code]=true;
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
  if((e.code==='KeyI'||e.code==='Tab')&&G.state==='playing'){e.preventDefault();if(G.player)INV.toggle(G.player);}
  if(e.code==='Escape'&&INV.open) INV.close();
  if(e.code==='KeyM') window.location.href='../../MenuPrincipal/index.html';
});
window.addEventListener('keyup',e=>delete keys[e.code]);
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
function sparkBurst(x,y,n=12){ // faíscas de fogo
  for(let i=0;i<n;i++){
    const a=-Math.PI/2+(Math.random()-.5)*1.4;
    particles.push({x,y,vx:Math.cos(a)*(1+Math.random()*2),vy:Math.sin(a)*(2+Math.random()*2)-1,life:30+Math.random()*20,max:50,color:['#ff9030','#ffcc50','#ff6020'][Math.floor(Math.random()*3)],r:1.5+Math.random()*2});
  }
}
function steamBurst(x,y,n=18){ // vapor da água na pedra quente
  for(let i=0;i<n;i++){
    const a=Math.random()*Math.PI*2;
    particles.push({x,y,vx:Math.cos(a)*(1+Math.random()*3),vy:Math.sin(a)*(1+Math.random()*2)-2,life:50+Math.random()*30,max:80,color:'rgba(230,230,240,0.7)',r:3+Math.random()*4,steam:true});
  }
}
function dustBurst(x,y,color,n=10){ // pó de moagem
  for(let i=0;i<n;i++){
    const a=Math.random()*Math.PI*2;
    particles.push({x,y,vx:Math.cos(a)*(0.5+Math.random()*1.5),vy:Math.sin(a)*(0.5+Math.random()*1.5)-0.5,life:40+Math.random()*20,max:60,color,r:1.5+Math.random()*2.5});
  }
}
function tickParticles(){
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i];
    if(p.steam){ p.vy-=0.02; p.vx*=0.98; } else p.vy+=0.15;
    p.x+=p.vx; p.y+=p.vy; p.life--;
    if(p.life<=0) particles.splice(i,1);
  }
}
function drawParticles(){for(const p of particles){ctx.globalAlpha=p.life/p.max;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x-cam.x,p.y-cam.y,p.r*(p.life/p.max),0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}

// ── Camera ────────────────────────────────────────────────────────
const cam={x:0,y:0};
function updateCam(px,worldW){ const t=px-W/2+24; const c=Math.max(0,Math.min(t,worldW-W)); cam.x+=(c-cam.x)*0.12; }

const GRAV=0.46, PSPD=4.6, JUMPF=-12.4, MAXFALL=16;

// ── Tile themes — calcário branco/rosado com veios azuis ──────────
const TILE_THEMES={
  1:{top:'#d8d0c0',body:'#b8ac98',dark:'#8a7c68'},  // calcário externo
  2:{top:'#c8bca8',body:'#a89880',dark:'#786858'},  // galerias
  3:{top:'#b8a888',body:'#988060',dark:'#685840'},  // fire-setting
  4:{top:'#c0a870',body:'#a08850',dark:'#705c30'},  // oficina
};
let tileTheme=TILE_THEMES[1];

// ── Platform helpers ──────────────────────────────────────────────
function solid(x,y,w,h){ return {type:'solid',x,y,w,h}; }
function movH(x,y,w,x0,x1,spd){ return {type:'solid',moving:true,x,y,w,h:18,x0,x1,spd,vx:spd,vy:0}; }
function movV(x,y,w,y0,y1,spd){ return {type:'solid',moving:true,x,y,w,h:18,y0,y1,spd,vx:0,vy:spd}; }
function trap(x,y,w){ return {type:'trapdoor',x,y,w,h:14}; }
function spike(x,y,w){ return {type:'spike',x,y,w,h:20}; }

function tickMoving(plats){ for(const p of plats){ if(!p.moving) continue; if(p.x0!==undefined){p.x+=p.vx;if(p.x<=p.x0||p.x+p.w>=p.x1)p.vx=-p.vx;} if(p.y0!==undefined){p.y+=p.vy;if(p.y<=p.y0||p.y>=p.y1)p.vy=-p.vy;} } }
function tickTrapdoors(plats){ for(const p of plats){ if(p.type!=='trapdoor') continue; if(p.crumble!==undefined){p.crumble--;if(p.crumble<=0){p.crumble=undefined;p.type='_dead';}} } }

function drawPlatform(p){
  const sx=p.x-cam.x, sy=p.y-cam.y;
  if(sx>W+80||sx+p.w<-80||sy>H+40||sy+p.h<-40) return;
  if(p.type==='spike'){ const nc=Math.max(1,Math.floor(p.w/20)); ctx.fillStyle='#786858'; for(let i=0;i<nc;i++){const tx=sx+i*(p.w/nc);ctx.beginPath();ctx.moveTo(tx,sy+p.h);ctx.lineTo(tx+p.w/nc/2,sy);ctx.lineTo(tx+p.w/nc,sy+p.h);ctx.fill();} return; }
  if(p.type==='trapdoor'){ const alpha=p.crumble!==undefined?p.crumble/70:1; ctx.globalAlpha=alpha; ctx.fillStyle=tileTheme.dark;ctx.fillRect(sx,sy,p.w,p.h); ctx.fillStyle=tileTheme.top;ctx.fillRect(sx,sy,p.w,3); ctx.globalAlpha=1; return; }
  if(p.type==='_dead') return;
  const ts=24,cols=Math.ceil(p.w/ts),rows=Math.ceil(p.h/ts);
  for(let r=0;r<rows;r++){ for(let c=0;c<cols;c++){
    const tx=sx+c*ts,ty=sy+r*ts,tw=Math.min(ts,sx+p.w-tx),th=Math.min(ts,sy+p.h-ty);
    ctx.fillStyle=r===0?tileTheme.body:(r%2===0?tileTheme.dark:tileTheme.body); ctx.fillRect(tx,ty,tw,th);
    ctx.fillStyle='rgba(0,0,0,0.08)'; ctx.fillRect(tx+tw-1,ty,1,th); ctx.fillRect(tx,ty+th-1,tw,1);
  } }
  ctx.fillStyle=tileTheme.top; ctx.fillRect(sx,sy,p.w,4);
  if(p.moving){ ctx.fillStyle='rgba(40,60,200,0.35)'; ctx.fillRect(sx,sy,p.w,4); }
}

// ── Utils ─────────────────────────────────────────────────────────
function roundRect(x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r); ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath(); }
function _rr(x,y,w,h,r){ roundRect(x,y,w,h,r); }
function wrapText(text,maxW){ ctx.font='15px "Courier New"'; const paragraphs=text.split('\n'); const result=[]; for(const para of paragraphs){ const words=para.split(' ');let line=''; for(const word of words){ const test=line?line+' '+word:word; if(ctx.measureText(test).width>maxW&&line){result.push(line);line=word;}else line=test; } if(line)result.push(line); } return result; }

// ── Item Definitions ──────────────────────────────────────────────
const ITEM_DEFS={
  // Herdados
  picareta_basica:  { cat:'ferramenta',nome:'Picareta Básica',       icon:'⛏',fase:'1.1',desc:'Extrai minérios das paredes rochosas.' },
  maco_pedra:       { cat:'ferramenta',nome:'Maço de Pedra',         icon:'🪨',fase:'2.3',desc:'Percussão a frio Anishinaabe.' },
  picareta_calcario:{ cat:'ferramenta',nome:'Picareta de Calcário',  icon:'⛏',fase:'3.3',desc:'Para rocha sedimentar.' },
  machado_item:     { cat:'ferramenta',nome:'Machado Tuaregue',      icon:'🪓',fase:'4.3',desc:'Golpe horizontal para sal.' },
  picareta_aco_song:{ cat:'ferramenta',nome:'Picareta de Aço Song',  icon:'⛏',fase:'5.3',desc:'Aço chinês do séc. XI.' },
  // Novas 5.2
  tora_pinheiro:    { cat:'ferramenta',nome:'Tora de Pinheiro Seco', icon:'🪵',fase:'5.2',desc:'Madeira seca para a fogueira do fire-setting.\nAquece a rocha até o limite — mas se a água\nvier cedo demais, a tora se perde.',multiple:true },
  anfora_barro:     { cat:'ferramenta',nome:'Ânfora com Água Fria',  icon:'🏺',fase:'5.2',desc:'Resfriamento brusco após o aquecimento.\nAs duas partes do fire-setting são inseparáveis:\nfogo que expande, água que contrai — a rocha racha.' },
  pilao_agata:      { cat:'ferramenta',nome:'Pilão de Ágata',        icon:'⚱️',fase:'5.2',desc:'A ágata é mais dura que o lápis — não contamina\no pigmento com sua própria cor ao moer.\nUsado por lapidários medievais para extrair\nultramarino puro em processo de semanas.' },
  // Minérios
  cobre_nativo:     { cat:'minerio', nome:'Cobre Nativo',     icon:'🟠',fase:'2.3',desc:'Tradição Anishinaabe.',multiple:true },
  cinabrio:         { cat:'minerio', nome:'Cinábrio (HgS)',   icon:'🔴',fase:'3.3',desc:'Sulfeto de mercúrio escarlate.',multiple:true },
  halita:           { cat:'minerio', nome:'Halita Saariana',  icon:'⬜',fase:'4.3',desc:'Sal de Taoudenni.',multiple:true },
  magnetita:        { cat:'minerio', nome:'Magnetita (Fe₃O₄)',icon:'⬛',fase:'5.3',desc:'Pedra que ama o ferro.',multiple:true },
  lapis_lazuli:     { cat:'minerio', nome:'Lápis-Lazúli',     icon:'🔷',fase:'5.2',desc:'Rocha composta: lazurita (azul) + calcita (branco)\n+ pirita (pontos dourados). Formada há 150 milhões\nde anos por fluidos hidrotermais no calcário marinho.\nO pigmento ultramarino mais puro da natureza.',multiple:true },
  // Artefatos
  tumi_dourado:     { cat:'artefato',nome:'Tumi de Ouro Inca',icon:'🥇',fase:'1.3',desc:'Faca ritual Inca de ouro.' },
  frasco_mercurio:  { cat:'artefato',nome:'Frasco de Mercúrio',icon:'⚗️',fase:'3.3',desc:'10.000 km de Almadén a Potosí.' },
  manuscrito_item:  { cat:'artefato',nome:'Manuscrito de Timbuktu',icon:'📜',fase:'4.3',desc:'Mineralogia árabe.' },
  mengxi_bitan:     { cat:'artefato',nome:'Mengxi Bitan',icon:'📚',fase:'5.3',desc:'Dream Pool Essays — Shen Kuo.' },
  frasco_ultramarino:{ cat:'artefato',nome:'Frasco de Ultramarino Medieval',icon:'🧪',fase:'5.2',desc:'Vidro soprado veneziano, século XIII.\nPó de ultramarino puro de Sar-e-Sang, selado\ncom cera de abelha. Rota: Badakhshan → Veneza\n→ ateliê de Giotto → Capela dos Scrovegni.\nO ultramarino não desbota — 700 anos depois.' },
};
const TIPO_TO_JOURNAL={
  tora:'tora_pinheiro', anfora:'anfora_barro', pilao:'pilao_agata',
  lapis:'lapis_lazuli', frasco:'frasco_ultramarino',
};

// ── Inventory ─────────────────────────────────────────────────────
const INV={
  open:false,tab:0,cursor:0,
  TABS:[{id:'ferramenta',label:'🔧 Ferramentas',color:'#3868c8'},{id:'minerio',label:'⛏ Minérios',color:'#2850a8'},{id:'artefato',label:'🏺 Artefatos',color:'#4878d0'}],
  tabItems(player){
    const cat=this.TABS[this.tab].id;
    let coletados={};
    try{const s=localStorage.getItem('mineralis_save_v2');if(s){const j=JSON.parse(s);coletados=j.coletados||{};}}catch(e){}
    if(coletados['mapa_potosi']&&!coletados['tupu_prata']) coletados['tupu_prata']=true;
    for(const tipo of player.items){
      const jid=TIPO_TO_JOURNAL[tipo]||tipo;
      coletados[jid]=true;
    }
    const lapN=player.items.filter(i=>i==='lapis').length;
    const toraN=player.items.filter(i=>i==='tora').length;

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
      const saved=coletados[jid]||coletados[id];
      if(def.multiple){
        if(id==='lapis_lazuli'&&lapN>0) out.push({id,...def,count:lapN});
        else if(id==='tora_pinheiro'&&toraN>0) out.push({id,...def,count:toraN});
        else if(saved&&id!=='lapis_lazuli'&&id!=='tora_pinheiro') out.push({id,...def,count:typeof saved==='number'?saved:1});
      } else if(id in ITEM_DEFS){
        if(player.items.includes(id)||player.items.includes(id+'_ok')||player.items.includes(id+'_col')||saved) out.push({id,...def,count:1});
      } else if(saved){
        out.push({id,...def,count:1});
      }
    }
    return out;
  },
  toggle(player){ this.open=!this.open; if(this.open)this.cursor=Math.min(this.cursor,Math.max(0,this.tabItems(player).length-1)); G.dialog=this.open; },
  close(){ this.open=false; G.dialog=false; },
  navigate(player){ if(!this.open)return false; if(jp['ArrowLeft']||jp['KeyA']){this.tab=(this.tab+2)%3;this.cursor=0;return true;} if(jp['ArrowRight']||jp['KeyD']){this.tab=(this.tab+1)%3;this.cursor=0;return true;} const items=this.tabItems(player); if(jp['ArrowUp']||jp['KeyW']){this.cursor=Math.max(0,this.cursor-1);return true;} if(jp['ArrowDown']||jp['KeyS']){this.cursor=Math.min(items.length-1,this.cursor+1);return true;} if(isE()&&items.length>0&&this.tab===0){const item=items[this.cursor];player.activeTool=(player.activeTool===item.id)?null:item.id;return true;} return false; },
  draw(player){
    if(!this.open)return;
    ctx.fillStyle='rgba(0,0,0,0.65)';ctx.fillRect(0,0,W,H);
    const PW=780,PH=480,PX=(W-PW)/2,PY=(H-PH)/2;
    ctx.shadowColor='rgba(0,0,0,0.7)';ctx.shadowBlur=20;ctx.fillStyle='rgba(2,4,12,0.97)';_rr(PX,PY,PW,PH,16);ctx.fill();ctx.shadowBlur=0;
    ctx.strokeStyle='#204090';ctx.lineWidth=2.5;_rr(PX,PY,PW,PH,16);ctx.stroke();
    ctx.fillStyle='#4878d0';ctx.font='bold 16px "Courier New"';ctx.textAlign='center';ctx.fillText('📔  DIÁRIO DE BORDO',W/2,PY+28);ctx.textAlign='left';
    ctx.fillStyle='rgba(40,80,200,0.3)';ctx.fillRect(PX+16,PY+38,PW-32,1);
    const TAB_W=PW/3,TAB_Y=PY+44;
    this.TABS.forEach((tab,i)=>{ const tx=PX+i*TAB_W,active=(i===this.tab); ctx.fillStyle=active?'rgba(40,80,200,0.18)':'rgba(0,0,0,0.3)';ctx.fillRect(tx+2,TAB_Y,TAB_W-4,34); ctx.fillStyle=active?tab.color:'#666';ctx.font=(active?'bold ':'')+'13px "Courier New"';ctx.textAlign='center';ctx.fillText(tab.label,tx+TAB_W/2,TAB_Y+22);ctx.textAlign='left'; if(active){ctx.fillStyle=tab.color;ctx.fillRect(tx+2,TAB_Y+32,TAB_W-4,3);} });
    const CY=TAB_Y+40,CH=PH-(CY-PY)-50,items=this.tabItems(player),COL_W=260,DESC_X=PX+280;
    if(items.length===0){ ctx.fillStyle='#445';ctx.font='14px "Courier New"';ctx.textAlign='center';ctx.fillText('Nenhum item coletado ainda.',W/2,CY+CH/2);ctx.textAlign='left'; }
    else { items.forEach((item,i)=>{ const iy=CY+16+i*52,sel=(i===this.cursor),eq=(player.activeTool===item.id); if(sel){ctx.fillStyle='rgba(40,80,200,0.18)';_rr(PX+16,iy-10,COL_W,46,8);ctx.fill();ctx.strokeStyle='#4878d0';ctx.lineWidth=1.5;_rr(PX+16,iy-10,COL_W,46,8);ctx.stroke();} const cnt=item.count>1?' ×'+item.count:''; ctx.font='20px serif';ctx.fillText(item.icon,PX+28,iy+20); ctx.font=(eq?'bold ':'')+'14px "Courier New"';ctx.fillStyle=eq?'#ffe060':(sel?'#f0e8c0':'#aaa');ctx.fillText(item.nome+cnt,PX+62,iy+14); });
      const sel=items[this.cursor]; if(sel){ ctx.fillStyle='rgba(40,80,200,0.08)';_rr(DESC_X,CY,PW-DESC_X+PX-16,CH-10,8);ctx.fill(); ctx.font='44px serif';ctx.textAlign='center';ctx.fillText(sel.icon,DESC_X+(PW-DESC_X+PX-16)/2,CY+68); ctx.font='bold 15px "Courier New"';ctx.fillStyle='#4878d0';ctx.fillText(sel.nome,DESC_X+(PW-DESC_X+PX-16)/2,CY+98); const catL={ferramenta:'🔧 Ferramenta',minerio:'⛏ Minério',artefato:'🏺 Artefato'}; ctx.font='11px "Courier New"';ctx.fillStyle='#888';ctx.fillText(catL[sel.cat],DESC_X+(PW-DESC_X+PX-16)/2,CY+116);ctx.textAlign='left';ctx.fillStyle='rgba(40,80,200,0.25)';ctx.fillRect(DESC_X+20,CY+124,PW-DESC_X+PX-56,1); const descLines=sel.desc.split('\n');ctx.font='13px "Courier New"';ctx.fillStyle='#f0e8c0';descLines.forEach((l,i)=>{ctx.textAlign='center';ctx.fillText(l,DESC_X+(PW-DESC_X+PX-16)/2,CY+144+i*22);});ctx.textAlign='left';
        if(sel.cat==='ferramenta'&&sel.id!=='tora_pinheiro'){ const btnTxt=player.activeTool===sel.id?'[E] Desequipar':'[E] Equipar'; ctx.fillStyle=player.activeTool===sel.id?'rgba(180,80,20,0.3)':'rgba(40,80,200,0.2)';_rr(DESC_X+40,CY+CH-60,PW-DESC_X+PX-96,34,8);ctx.fill();ctx.strokeStyle=player.activeTool===sel.id?'#c04020':'#4878d0';ctx.lineWidth=1.5;_rr(DESC_X+40,CY+CH-60,PW-DESC_X+PX-96,34,8);ctx.stroke(); ctx.font='bold 13px "Courier New"';ctx.fillStyle=player.activeTool===sel.id?'#e06040':'#4878d0';ctx.textAlign='center';ctx.fillText(btnTxt,DESC_X+(PW-DESC_X+PX-16)/2,CY+CH-38);ctx.textAlign='left'; } } }
    ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(PX,PY+PH-38,PW,38);ctx.fillStyle='rgba(40,80,200,0.3)';ctx.fillRect(PX+16,PY+PH-39,PW-32,1);ctx.font='11px "Courier New"';ctx.fillStyle='#888';ctx.textAlign='center';ctx.fillText('◀ ▶ Abas   ↑ ↓ Navegar   E Equipar/Desequipar   I Fechar',W/2,PY+PH-14);ctx.textAlign='left';
  }
};

// ── Dialog Bubble ─────────────────────────────────────────────────
let dlgFaceT=0;
const BUBBLE={
  active:false,queue:[],cb:null,lines:[],speakerTxt:'CORVAN',faceFrame:0,
  show(messages,cb,speaker='CORVAN'){ this.queue=[...messages];this.cb=cb;this.active=true;this.speakerTxt=speaker;G.dialog=true;this._next(); },
  _next(){ if(!this.queue.length){ this.active=false;G.dialog=false; if(this.cb){const f=this.cb;this.cb=null;f();} return; } this.lines=wrapText(this.queue.shift(),480); },
  advance(){ if(this.active) this._next(); },
  draw(player){
    if(!this.active) return; this.faceFrame+=0.08;
    const FONT='15px "Courier New"',NAMEFNT='bold 12px "Courier New"'; ctx.font=FONT;
    const lineH=22,pad=18,faceW=56,faceH=68,textAreaW=480;
    const bubW=faceW+pad+textAreaW+pad*2; const bubH=Math.max(faceH,this.lines.length*lineH+30)+pad*2;
    const pcx=player.x-cam.x+player.w/2,pcy=player.y-cam.y;
    let bx=pcx-bubW/2,by=pcy-bubH-28; bx=Math.max(12,Math.min(bx,W-bubW-12)); if(by<40)by=pcy+player.h+10; by=Math.max(40,Math.min(by,H-bubH-10));
    ctx.shadowColor='rgba(0,0,0,0.6)';ctx.shadowBlur=12; ctx.fillStyle='rgba(2,4,12,0.95)';roundRect(bx,by,bubW,bubH,14);ctx.fill();ctx.shadowBlur=0;
    ctx.strokeStyle='#204090';ctx.lineWidth=2.5;roundRect(bx,by,bubW,bubH,14);ctx.stroke();
    const tailBaseX=Math.max(bx+30,Math.min(pcx,bx+bubW-30)),tailTopY=by+bubH,tailTipX=pcx,tailTipY=Math.min(pcy,tailTopY+36);
    ctx.fillStyle='rgba(2,4,12,0.95)'; ctx.beginPath();ctx.moveTo(tailBaseX-14,tailTopY);ctx.lineTo(tailBaseX+14,tailTopY);ctx.lineTo(tailTipX,tailTipY);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#204090';ctx.lineWidth=2; ctx.beginPath();ctx.moveTo(tailBaseX-14,tailTopY);ctx.lineTo(tailTipX,tailTipY);ctx.lineTo(tailBaseX+14,tailTopY);ctx.stroke();
    const fx=bx+pad,fy=by+pad;
    CORVAN.drawFace(ctx, this.faceFrame, fx, fy, faceW, faceH);
    ctx.strokeStyle='rgba(40,80,200,0.5)';ctx.lineWidth=1.5;ctx.strokeRect(fx,fy,faceW,faceH);
    const tx=fx+faceW+pad; ctx.font=NAMEFNT;ctx.fillStyle='#4878d0';ctx.fillText(this.speakerTxt,tx,by+pad+14);
    ctx.font=FONT;ctx.fillStyle='#f0e8c0';this.lines.forEach((l,i)=>ctx.fillText(l,tx,by+pad+36+i*lineH));
    const pulse=0.55+Math.sin(Date.now()/400)*0.45; ctx.fillStyle=`rgba(40,80,200,${pulse})`;ctx.font='12px "Courier New"';ctx.textAlign='right';ctx.fillText('[E] Continuar →',bx+bubW-pad,by+bubH-8);ctx.textAlign='left';
  }
};
function showDialog(lines,cb,speaker='CORVAN'){ BUBBLE.show(lines,cb,speaker); }
function checkDlg(){ if(G.dialog&&!INV.open&&isE()) BUBBLE.advance(); }

// ── Notification ──────────────────────────────────────────────────
let notifText='',notifAlpha=0,notifTimer=0;
function notify(msg,ms=2800){notifText=msg;notifTimer=ms;notifAlpha=1;}
function tickNotif(){if(notifTimer>0){notifTimer-=16;if(notifTimer<=0)notifAlpha=0;else notifAlpha=Math.min(1,notifTimer/300);}}
function drawNotif(){
  if(notifAlpha<=0) return; ctx.save();ctx.globalAlpha=notifAlpha;ctx.font='14px "Courier New"';
  const tw=ctx.measureText(notifText).width+32,nx=(W-tw)/2,ny=46;
  ctx.fillStyle='rgba(0,0,0,0.82)';roundRect(nx,ny,tw,28,6);ctx.fill();ctx.strokeStyle='#4878d0';ctx.lineWidth=1.5;roundRect(nx,ny,tw,28,6);ctx.stroke();
  ctx.fillStyle='#4878d0';ctx.textAlign='center';ctx.fillText(notifText,W/2,ny+19);ctx.textAlign='left';ctx.restore();
}

// ── Pop-up informativo ────────────────────────────────────────────
const POPUP={ active:false,title:'',lines:[],icon:'🔷',timer:0,
  show(title,icon,text,duration=8000){this.active=true;this.title=title;this.icon=icon;this.lines=text.split('\n');this.timer=duration;},
  tick(){if(this.timer>0){this.timer-=16;if(this.timer<=0)this.active=false;}},
  draw(){ if(!this.active)return; const alpha=Math.min(1,this.timer/400); const PW=370,PH=this.lines.length*20+100,PX=W-PW-20,PY=60;
    ctx.save();ctx.globalAlpha=alpha; ctx.fillStyle='rgba(2,4,12,0.94)';_rr(PX,PY,PW,PH,12);ctx.fill();ctx.strokeStyle='#204090';ctx.lineWidth=2;_rr(PX,PY,PW,PH,12);ctx.stroke();
    ctx.font='32px serif';ctx.textAlign='center';ctx.fillText(this.icon,PX+40,PY+46); ctx.font='bold 13px "Courier New"';ctx.fillStyle='#4878d0';ctx.fillText(this.title,PX+60,PY+28);
    ctx.font='12px "Courier New"';ctx.fillStyle='#f0e8c0';ctx.textAlign='left';this.lines.forEach((l,i)=>ctx.fillText(l,PX+16,PY+52+i*20));ctx.restore(); }
};

// ── Fire-Setting Spot — mecânica inédita: aquecer + resfriar ──────
class FireSettingSpot {
  constructor(x,y){
    this.x=x; this.y=y; this.w=90; this.h=70;
    this.state='unlit';  // 'unlit' | 'heating' | 'ready' | 'cracked'
    this.heat=0;         // 0-100
    this.fragments=[];   // LapisFragment[] spawnados ao rachar
    this.t=0;
    this.crackleTimer=0;
  }
  tick(){
    this.t+=0.05;
    if(this.state==='heating'){
      this.heat = Math.min(100, this.heat + 100/1750); // ~29s a 60fps
      this.crackleTimer--;
      if(this.crackleTimer<=0){ sfx('crackle'); this.crackleTimer=22+Math.floor(Math.random()*24); if(Math.random()<0.45) sparkBurst(this.x+this.w/2+(Math.random()-.5)*20,this.y+10,3); }
      if(this.heat>=100 && this.state==='heating'){ /* fica pronto mas não estoura sozinho, precisa água */ }
    }
  }
  ignite(){
    this.state='heating'; this.heat=0; this.crackleTimer=18;
    sfx('crackle'); notify('🔥 Fogueira acesa! Aguarde o aquecimento... use a Ânfora quando a barra estiver alta.');
  }
  pourWater(player){
    if(this.state!=='heating'){ return; }
    if(this.heat>=80){
      // Sucesso — racha
      this.state='cracked';
      sfx('tssh');
      steamBurst(this.x+this.w/2,this.y+20,24);
      setTimeout(()=>{ sfx('rockcrack'); burst(this.x+this.w/2,this.y+this.h/2,'#c8bca8',18,4); },350);
      // Spawna fragmentos: mistura de lápis (com pirita) e sodalita
      const types = this.fragmentPlan || ['lapis','lapis','sodalita'];
      types.forEach((ty,i)=>{
        const fx = this.x + 10 + i*28 + (Math.random()-.5)*10;
        const fy = this.y + this.h - 10 - Math.random()*10;
        this.fragments.push(new LapisFragment(fx,fy,ty));
      });
      notify('💥 A rocha rachou! Examine os fragmentos com o Pilão antes de coletar.');
    } else {
      // Falha — cedo demais
      this.state='unlit'; this.heat=0;
      sfx('fail_hiss');
      burst(this.x+this.w/2,this.y+30,'rgba(200,200,210,0.6)',8,2);
      notify('💨 Água cedo demais! A rocha não rachou — a tora se perdeu. Busque mais lenha.');
    }
  }
  draw(){
    const sx=this.x-cam.x, sy=this.y-cam.y;
    if(sx<-120||sx>W+120) return;
    ctx.save(); ctx.translate(sx,sy);
    // Parede de calcário com veio azul visível
    ctx.fillStyle='#c8bca8'; ctx.fillRect(0,0,this.w,this.h);
    ctx.fillStyle='#d8d0c0'; ctx.fillRect(4,4,this.w-8,this.h-8);
    // Veio azul
    if(this.state!=='cracked'){
      ctx.fillStyle='#2848a8'; ctx.fillRect(this.w*0.35,10,this.w*0.3,this.h-20);
      ctx.fillStyle='#3858c0'; ctx.fillRect(this.w*0.4,14,this.w*0.2,this.h-28);
      // Pontos dourados (pirita) cintilantes
      for(let i=0;i<4;i++){
        const px=this.w*0.4+Math.sin(i*2)*10+10, py=18+i*12;
        const sh=0.4+Math.sin(this.t*3+i)*0.3;
        ctx.fillStyle=`rgba(230,190,60,${sh})`;
        ctx.fillRect(px,py,2,2);
      }
    } else {
      // Rachada — mostra buraco escuro
      ctx.fillStyle='#302820'; ctx.fillRect(this.w*0.25,8,this.w*0.5,this.h-16);
      ctx.strokeStyle='#786858'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(this.w*0.25,8); ctx.lineTo(this.w*0.15,this.h-8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(this.w*0.75,8); ctx.lineTo(this.w*0.85,this.h-8); ctx.stroke();
    }
    ctx.strokeStyle='#8a7c68'; ctx.lineWidth=2; ctx.strokeRect(0,0,this.w,this.h);
    ctx.restore();
    // Fogueira (se heating/ready)
    if(this.state==='heating'){
      const fx=sx+this.w/2, fy=sy+this.h+4;
      const flicker=Math.sin(this.t*8)*3;
      ctx.save(); ctx.translate(fx,fy);
      ctx.fillStyle='#ff6020'; ctx.beginPath(); ctx.moveTo(-10,20); ctx.quadraticCurveTo(-12,0+flicker,0,-14-flicker); ctx.quadraticCurveTo(12,0+flicker,10,20); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#ffaa30'; ctx.beginPath(); ctx.moveTo(-6,18); ctx.quadraticCurveTo(-7,4,0,-8-flicker*0.6); ctx.quadraticCurveTo(7,4,6,18); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#fff060'; ctx.beginPath(); ctx.moveTo(-3,15); ctx.quadraticCurveTo(-3,6,0,-2); ctx.quadraticCurveTo(3,6,3,15); ctx.closePath(); ctx.fill();
      // Tora
      ctx.fillStyle='#5a3010'; ctx.fillRect(-16,18,32,6);
      ctx.restore();
      // Barra de aquecimento
      const bw=100, bx2=sx+this.w/2-bw/2, by2=sy-24;
      ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(bx2,by2,bw,10);
      const heatCol = this.heat<80 ? `rgba(${Math.round(180+this.heat*0.7)},${Math.round(140-this.heat)},40,0.9)` : 'rgba(255,80,30,0.95)';
      ctx.fillStyle=heatCol; ctx.fillRect(bx2,by2,bw*(this.heat/100),10);
      ctx.strokeStyle=this.heat>=80?'#ffe060':'rgba(200,150,40,0.6)'; ctx.lineWidth=this.heat>=80?2:1;
      ctx.strokeRect(bx2,by2,bw,10);
      if(this.heat>=80){
        const pulse=0.6+Math.sin(this.t*4)*0.4;
        ctx.font='bold 10px "Courier New"'; ctx.fillStyle=`rgba(255,200,80,${pulse})`; ctx.textAlign='center';
        ctx.fillText('[E] Despeje a água!', sx+this.w/2, by2-6); ctx.textAlign='left';
      } else {
        ctx.font='9px "Courier New"'; ctx.fillStyle='#c0a850'; ctx.textAlign='center';
        ctx.fillText(`Aquecendo ${Math.floor(this.heat)}%`, sx+this.w/2, by2-6); ctx.textAlign='left';
      }
    } else if(this.state==='unlit'){
      const pulse=0.5+Math.sin(this.t*2)*0.5;
      ctx.font='bold 10px "Courier New"'; ctx.fillStyle=`rgba(220,140,40,${pulse})`; ctx.textAlign='center';
      ctx.fillText('[E] Acender com 🪵 Tora', sx+this.w/2, sy-10); ctx.textAlign='left';
    }
    // Fragmentos
    for(const f of this.fragments) f.draw();
  }
}

// ── Fragmento de Lápis/Sodalita — mecânica de moagem/exame ────────
class LapisFragment {
  constructor(x,y,type){
    this.x=x; this.y=y; this.w=22; this.h=18;
    this.type=type; // 'lapis' | 'sodalita'
    this.grade = type==='lapis' ? (['grau1','grau2','puro'][Math.floor(Math.random()*3)]) : null;
    this.examined=false;
    this.done=false;
    this.t=Math.random()*Math.PI*2;
  }
  tick(){ this.t+=0.05; }
  draw(){
    if(this.done) return;
    const sx=this.x-cam.x, sy=this.y-cam.y+Math.sin(this.t)*1.5;
    if(sx<-40||sx>W+40) return;
    ctx.save(); ctx.translate(sx,sy);
    if(this.type==='lapis'){
      ctx.fillStyle='#2040a0'; ctx.fillRect(0,0,this.w,this.h);
      ctx.fillStyle='#2c50b8'; ctx.fillRect(2,2,this.w-4,this.h-4);
      if(this.grade!=='puro'){ ctx.fillStyle='#d8d0c0'; ctx.fillRect(3,3,6,5); } // calcita branca
      if(this.grade==='grau1'||this.examined){
        // Pontos dourados de pirita
        const sh=this.examined?1:0.5+Math.sin(this.t*3)*0.3;
        ctx.fillStyle=`rgba(230,190,60,${sh})`;
        ctx.fillRect(this.w-8,4,2,2); ctx.fillRect(this.w-5,9,2,2); ctx.fillRect(this.w-10,12,2,2);
      }
    } else {
      // Sodalita — azul uniforme, sem pirita
      ctx.fillStyle='#3050a8'; ctx.fillRect(0,0,this.w,this.h);
      ctx.fillStyle='#3a5cb8'; ctx.fillRect(2,2,this.w-4,this.h-4);
    }
    ctx.strokeStyle='rgba(0,0,0,0.3)'; ctx.lineWidth=1; ctx.strokeRect(0,0,this.w,this.h);
    ctx.restore();
    // Indicador
    if(!this.examined){
      const pulse=0.5+Math.sin(this.t*2)*0.5;
      ctx.fillStyle=`rgba(200,170,220,${pulse})`;
      ctx.font='bold 9px "Courier New"'; ctx.textAlign='center';
      ctx.fillText('[E] Moer amostra',sx+this.w/2,sy-6); ctx.textAlign='left';
    } else {
      if(this.type==='lapis'){
        ctx.fillStyle='rgba(220,190,80,0.9)'; ctx.font='bold 9px "Courier New"'; ctx.textAlign='center';
        ctx.fillText('✓ [E] Coletar',sx+this.w/2,sy-6); ctx.textAlign='left';
      } else {
        ctx.fillStyle='rgba(150,150,160,0.8)'; ctx.font='bold 9px "Courier New"'; ctx.textAlign='center';
        ctx.fillText('✗ sodalita — [E] descartar',sx+this.w/2,sy-6); ctx.textAlign='left';
      }
    }
  }
}

// ── Ovelha de Marco Polo companion ─────────────────────────────────
class OvelhaMarcoPolo {
  constructor(){
    this.x=400;this.y=300;this.frame=0;this.visible=false;this.state='perched';
    this.facing=1;this.guideMin=0;this.guideMax=0;this.guideY=0;this.lastX=this.x;
  }
  update(player){
    if(!this.visible)return;
    this.lastX=this.x;
    if(this.state==='guide'){
      const desired=Math.max(this.guideMin,Math.min(this.guideMax,player.x+150));
      this.x+=(desired-this.x)*0.045;
      this.y+=(this.guideY-this.y)*0.18;
      if(Math.abs(this.x-this.lastX)>0.08)this.facing=this.x>this.lastX?1:-1;
    }
    const walking=this.state==='guide'&&Math.abs(this.x-this.lastX)>0.08;
    this.frame+=walking?0.09:0.025;
  }
  land(x,y){ this.x=x; this.y=y; this.state='perched'; this.facing=-1; this.visible=true; }
  guide(x,y,minX,maxX){ this.x=x; this.y=y; this.guideY=y; this.guideMin=minX; this.guideMax=maxX; this.state='guide'; this.facing=1; this.visible=true; }
  draw(){
    if(!this.visible)return;
    const sx=this.x-cam.x, sy=this.y-cam.y; if(sx<-100||sx>W+100) return;
    ctx.save();
    if(IMG['ovelha_img']&&IMG['ovelha_img'].complete&&IMG['ovelha_img'].naturalWidth>0){
      const dw=110,dh=110,bob=this.state==='guide'?Math.sin(this.frame*1.4)*2:0;
      if(this.facing<0){ctx.translate(sx+dw/2,sy-dh/2+bob);ctx.scale(-1,1);}else ctx.translate(sx-dw/2,sy-dh/2+bob);
      ctx.drawImage(IMG['ovelha_img'],0,0,96,96,0,0,dw,dh);
    } else {
      ctx.translate(sx,sy); const bob=this.state==='guide'?Math.sin(this.frame*1.4)*2:0;
      if(this.facing<0)ctx.scale(-1,1);
      ctx.fillStyle='#dcc898'; ctx.beginPath(); ctx.ellipse(0,bob,28,15,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#e4d0a0'; ctx.beginPath(); ctx.arc(24,bob-10,10,0,Math.PI*2); ctx.fill();
      // Chifres espiralados enormes
      ctx.strokeStyle='#b8a050'; ctx.lineWidth=3;
      ctx.beginPath(); ctx.moveTo(28,bob-16); ctx.bezierCurveTo(40,bob-30,30,bob-42,42,bob-48); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(28,bob-16); ctx.bezierCurveTo(20,bob-28,32,bob-36,26,bob-44); ctx.stroke();
      ctx.fillStyle='#101008'; ctx.beginPath(); ctx.arc(30,bob-13,2,0,Math.PI*2); ctx.fill();
      for(let l=-1;l<=1;l+=2){ ctx.fillStyle='#c8b078'; ctx.fillRect(-16+l*10,bob+10,7,18); }
    }
    ctx.restore();
  }
  speak(msg){ showDialog(msg,null,'🐏 OVELHA DE MARCO POLO'); }
}

// ── Enemy — mineiros hostis e águias ───────────────────────────────
class Enemy{
  constructor(x,y,type,patrol){
    this.x=x;this.y=y;this.spawnX=x;this.type=type;
    this.w=type==='aguia'?34:42; this.h=type==='aguia'?22:56;
    this.patrol=patrol;this.vx=type==='aguia'?2.2:1.1;this.facing=1;this.dead=false;this.frame=0;
    if(type==='aguia') this.baseY=y;
  }
  update(plats,player){
    if(this.dead)return; this.x+=this.vx;this.frame+=0.08;
    if(this.type==='aguia'){ this.y=this.baseY+Math.sin(this.frame*1.6)*16; if(Math.abs(this.x-this.spawnX)>this.patrol)this.vx=-this.vx; this.facing=this.vx>0?1:-1; return; }
    let onG=false; for(const p of plats){if(p.type==='spike'||p.type==='_dead')continue;if(this.x+this.w>p.x&&this.x<p.x+p.w&&this.y+this.h>=p.y&&this.y+this.h<=p.y+10)onG=true;}
    const edge=this.vx>0?this.x+this.w:this.x; let onEdge=false;
    for(const p of plats){if(p.type==='spike'||p.type==='_dead')continue;if(edge>p.x&&edge<p.x+p.w&&this.y+this.h+2>=p.y&&this.y+this.h+2<=p.y+12)onEdge=true;}
    if((onG&&!onEdge)||Math.abs(this.x-this.spawnX)>this.patrol)this.vx=-this.vx;
    this.facing=this.vx>0?1:-1;
  }
  draw(){
    if(this.dead)return; const sx=this.x-cam.x,sy=this.y-cam.y; if(sx<-80||sx>W+80)return;
    ctx.save();ctx.translate(sx+this.w/2,sy+this.h);if(this.facing===-1)ctx.scale(-1,1);
    if(this.type==='mineiro'){
      ctx.fillStyle='#5a4830'; ctx.fillRect(-18,-52,36,52);
      ctx.fillStyle='#6a5838'; ctx.fillRect(-16,-50,32,20);
      ctx.fillStyle='#c8a878'; ctx.fillRect(-4,-52,8,8);
      ctx.fillStyle='#382818'; ctx.fillRect(-8,-56,16,6);
      ctx.fillStyle='#484028'; ctx.fillRect(-16,-28,14,28); ctx.fillRect(2,-28,14,28);
      ctx.fillStyle='#786040'; ctx.fillRect(-24,-44,6,26);
    } else {
      const flap=Math.abs(Math.sin(this.frame*2.5))*8;
      ctx.fillStyle='#4a3820'; ctx.beginPath(); ctx.ellipse(0,-8,9,6,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#3a2a18'; ctx.beginPath(); ctx.arc(8,-11,5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#5a4828';
      ctx.beginPath(); ctx.moveTo(-6,-8); ctx.lineTo(-24,-16-flap); ctx.lineTo(-26,-2-flap); ctx.lineTo(-6,-2); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(6,-8); ctx.lineTo(24,-16-flap); ctx.lineTo(26,-2-flap); ctx.lineTo(6,-2); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#e8c850'; ctx.fillRect(11,-13,4,2);
    }
    ctx.restore();
  }
}

// ── Col (itens flutuantes) ────────────────────────────────────────
class Col{
  constructor(x,y,type){this.x=x;this.y=y;this.w=30;this.h=30;this.type=type;this.done=false;this.t=Math.random()*Math.PI*2;}
  tick(){if(!this.done)this.t+=0.06;}
  draw(){
    if(this.done) return;
    const sx=this.x-cam.x, sy=this.y-cam.y+Math.sin(this.t)*5; if(sx<-50||sx>W+50) return;
    ctx.save(); ctx.translate(sx+15, sy+15);
    if(this.type==='tora'){
      if(IMG['tora_img']) ctx.drawImage(IMG['tora_img'],0,0,48,48,-15,-15,30,30);
      else{ ctx.fillStyle='#7a4a18';ctx.fillRect(-14,-6,28,12); ctx.fillStyle='#a06830';ctx.fillRect(-12,-4,24,8); }
    } else if(this.type==='anfora'){
      if(IMG['anfora_img']) ctx.drawImage(IMG['anfora_img'],0,0,48,48,-15,-15,30,30);
      else{ ctx.fillStyle='#9a6030';ctx.beginPath();ctx.ellipse(0,2,10,12,0,0,Math.PI*2);ctx.fill(); }
    } else if(this.type==='pilao'){
      if(IMG['pilao_img']) ctx.drawImage(IMG['pilao_img'],0,0,48,48,-15,-15,30,30);
      else{ ctx.fillStyle='#a8a0a0';ctx.beginPath();ctx.arc(0,4,10,0,Math.PI*2);ctx.fill(); ctx.fillStyle='#2030a0';ctx.beginPath();ctx.arc(0,4,6,0,Math.PI*2);ctx.fill(); }
    } else if(this.type==='frasco'){
      if(IMG['frasco_img']) ctx.drawImage(IMG['frasco_img'],0,0,48,48,-15,-15,30,30);
      else{ ctx.fillStyle='#6aa8a8';ctx.fillRect(-10,-8,20,20); ctx.fillStyle='#2030a0';ctx.fillRect(-8,-4,16,14); }
    }
    ctx.restore();
  }
}

// ── Trigger ───────────────────────────────────────────────────────
class Trigger{
  constructor(x,y,w,h,label,fn){this.x=x;this.y=y;this.w=w;this.h=h;this.label=label;this.fn=fn;this.done=false;}
  draw(px,py){ if(this.done)return; const near=Math.abs((px+24)-(this.x+this.w/2))<this.w/2+72&&Math.abs((py+40)-(this.y+this.h/2))<this.h/2+72; if(!near)return; const sx=this.x+this.w/2-cam.x,sy=this.y-cam.y-26+Math.sin(Date.now()/350)*4; const txt='[E] '+this.label;ctx.font='14px "Courier New"';const tw=ctx.measureText(txt).width+24; ctx.fillStyle='rgba(0,0,0,0.78)';roundRect(sx-tw/2,sy-16,tw,24,4);ctx.fill();ctx.strokeStyle='#4878d0';ctx.lineWidth=1.5;roundRect(sx-tw/2,sy-16,tw,24,4);ctx.stroke();ctx.fillStyle='#4878d0';ctx.textAlign='center';ctx.fillText(txt,sx,sy);ctx.textAlign='left'; }
}

// ── Player ────────────────────────────────────────────────────────
class Player{
  constructor(x,y){ this.x=x;this.y=y;this.prevX=x;this.prevY=y;this.w=40;this.h=80; this.vx=0;this.vy=0;this.onG=false;this.facing=1; this.hp=3;this.maxHp=3;this.inv=0;this.dead=false; this.activeTool=null;this.frame=0;this.ft=0;this.state='idle'; this.coyote=0;this.jbuf=0;this.onMoving=null; this.items=[];this.score=0;this.interactAnim=0; }
  overlaps(r){return this.x<r.x+r.w&&this.x+this.w>r.x&&this.y<r.y+r.h&&this.y+this.h>r.y;}
  near(r,d=80){return Math.abs(this.x+20-(r.x+r.w/2))<r.w/2+d&&Math.abs(this.y+40-(r.y+r.h/2))<r.h/2+d;}
  update(level){
    if(G.dialog)return;
    this.prevX=this.x;this.prevY=this.y;
    if(isL()){this.vx=-PSPD;this.facing=-1;}else if(isR()){this.vx=PSPD;this.facing=1;}else this.vx*=0.7;
    if(this.onG)this.coyote=8;else if(this.coyote>0)this.coyote--;
    if(isJ())this.jbuf=10; if(this.jbuf>0)this.jbuf--;
    if(this.jbuf>0&&(this.onG||this.coyote>0)){this.vy=JUMPF;this.onG=false;this.coyote=0;this.jbuf=0;sfx('jump');}
    if(this.onMoving){this.x+=this.onMoving.vx||0;this.y+=this.onMoving.vy||0;} this.onMoving=null;
    this.vy=Math.min(this.vy+GRAV,MAXFALL); this.x+=this.vx;this._colX(level.plats);
    this.onG=false;this.y+=this.vy;this._colY(level.plats); this.x=Math.max(0,this.x);
    if(!this.inv){ for(const p of level.plats) if(p.type==='spike'&&this.overlaps(p))this._hurt(1,level);
      for(const e of level.enemies){ if(!e.dead&&this.overlaps(e)){ if(this.vy>2&&this.y+this.h<e.y+e.h*0.5){e.dead=true;this.vy=-8;burst(e.x+20,e.y,'#4878d0',10);sfx('coin');}else{this._hurt(1,level);this.vy=-7;this.vx=(this.x<e.x?-7:7);} } } }
    if(this.inv>0)this.inv--;
    if(this.interactAnim>0)this.interactAnim--;

    // FIX: flag para evitar múltiplas ações num único E
    let eConsumed = false;
    const ePressed = isE();

    // Coletáveis simples
    for(const c of level.cols){
      if(!c.done&&this.overlaps(c)){
        c.done=true;
        this.items.push(c.type); sfx('item'); _journalColetar(c.type);
        burst(c.x+15,c.y+15,'#4878d0',10);
        if(c.type==='tora')   notify('🪵 Tora de Pinheiro coletada! ('+this.items.filter(i=>i==='tora').length+')');
        if(c.type==='anfora') notify('🏺 Ânfora de Água Fria coletada!');
        if(c.type==='pilao')  notify('⚱️ Pilão de Ágata recebido!');
        if(c.type==='frasco'){ sfx('glass'); notify('🧪 Frasco de Ultramarino Medieval encontrado!'); }
      }
    }

    // Fire-Setting Spots — ignição e despejo de água
    if(level.fireSpots && ePressed && !eConsumed){
      for(const spot of level.fireSpots){
        if(this.near({x:spot.x,y:spot.y,w:spot.w,h:spot.h},70)){
          if(spot.state==='unlit'){
            if(this.items.includes('tora')){
              const idx=this.items.indexOf('tora'); this.items.splice(idx,1);
              spot.ignite(); eConsumed=true;
            } else {
              notify('Você precisa de uma 🪵 Tora de Pinheiro para acender!');
              eConsumed=true;
            }
            break;
          } else if(spot.state==='heating'){
            if(this.items.includes('anfora')){
              spot.pourWater(this); eConsumed=true;
            } else {
              notify('Você precisa da 🏺 Ânfora com Água Fria!');
              eConsumed=true;
            }
            break;
          }
        }
      }
    }

    // Fragmentos — examinar (moer) e coletar/descartar
    if(level.fireSpots && ePressed && !eConsumed && this.items.includes('pilao')){
      outer:
      for(const spot of level.fireSpots){
        for(const frag of spot.fragments){
          if(frag.done) continue;
          if(this.near({x:frag.x,y:frag.y,w:frag.w,h:frag.h},50)){
            if(!frag.examined){
              frag.examined=true; this.interactAnim=30;
              if(frag.type==='lapis'){
                sfx('grind'); setTimeout(()=>sfx('grindfine'),150); setTimeout(()=>sfx('shimmer'),300);
                dustBurst(frag.x+10,frag.y,'#2848c8',8);
                notify('✨ Pó azul-cobalto intenso com brilho dourado — LÁPIS-LAZÚLI!');
              } else {
                sfx('grind'); setTimeout(()=>sfx('grindfine'),150);
                dustBurst(frag.x+10,frag.y,'#5878b0',8);
                notify('Pó cinza-azulado pálido, sem brilho — sodalita.');
              }
              eConsumed=true; break outer;
            } else {
              // Coletar ou descartar
              frag.done=true; eConsumed=true;
              if(frag.type==='lapis'){
                this.score+=15; this.items.push('lapis'); sfx('duduk');
                burst(frag.x+10,frag.y+8,'#3868e0',14);
                _journalColetar('lapis', this.items.filter(i=>i==='lapis').length);
                const gradeLabel={grau1:'Grau 1 (pirita abundante)',grau2:'Grau 2 (calcita visível)',puro:'Lazurita pura — o mais raro!'}[frag.grade];
                notify(`🔷 Lápis-Lazúli coletado! ${gradeLabel} (${this.items.filter(i=>i==='lapis').length}/3)`);
                if(frag.grade==='puro'){
                  POPUP.show('Lazurita Pura','🔷','Fragmento raro — sem calcita visível.\nQuase 100% lazurita, o mineral azul puro.\nO pigmento ultramarino mais precioso\nque um lapidário medieval poderia sonhar.',7500);
                }
              } else {
                showDialog(['"Azul, mas sem ouro por dentro — não é lápis."'],null);
                burst(frag.x+10,frag.y+8,'#5878b0',8);
              }
              break outer;
            }
          }
        }
      }
    }

    // Triggers
    if(ePressed && !eConsumed && this.onG){for(const t of level.triggers){if(!t.done&&this.near(t)){t.fn(this,level);break;}}}

    if(this.y>level.H+200)this._hurt(3,level);
    if(!this.onG&&this.vy<0)this.state='jump';else if(!this.onG&&this.vy>0)this.state='fall';else if(Math.abs(this.vx)>0.5)this.state='run';else this.state='idle';
    const spd=this.state==='run'?6:this.state==='idle'?18:8; if(++this.ft>=spd){this.ft=0;this.frame=(this.frame+1)%6;}
  }
  _colX(plats){
    for(const p of plats){
      if(p.type==='spike'||p.type==='_dead')continue;
      if(!this.overlaps(p))continue;
      if(this.prevY+this.h<=p.y+2||this.prevY>=p.y+p.h-2)continue;
      if(this.prevX+this.w<=p.x)this.x=p.x-this.w;
      else if(this.prevX>=p.x+p.w)this.x=p.x+p.w;
      else if(this.vx>0)this.x=p.x-this.w;
      else if(this.vx<0)this.x=p.x+p.w;
      this.vx=0;
    }
  }
  _colY(plats){
    for(const p of plats){
      if(p.type==='spike'||p.type==='_dead')continue;
      if(p.type==='trapdoor'&&this.vy<0)continue;
      if(!this.overlaps(p))continue;
      const wasAbove=this.prevY+this.h<=p.y+4;
      const wasBelow=this.prevY>=p.y+p.h-4;
      if(this.vy>=0&&wasAbove){
        this.y=p.y-this.h;this.vy=0;this.onG=true;if(p.moving)this.onMoving=p;if(p.type==='trapdoor'&&p.crumble===undefined)p.crumble=70;
      }else if(this.vy<0&&wasBelow){
        this.y=p.y+p.h;this.vy=0;
      }else if(this.vy>=0){
        this.y=p.y-this.h;this.vy=0;this.onG=true;if(p.moving)this.onMoving=p;if(p.type==='trapdoor'&&p.crumble===undefined)p.crumble=70;
      }else{
        this.y=p.y+p.h;this.vy=0;
      }
    }
  }
  _hurt(dmg,level){ if(this.inv>0)return; this.hp-=dmg;this.inv=100; burst(this.x+20,this.y+40,'#ff4040',10);sfx('hit'); if(this.hp<=0){this.hp=0;this.dead=true;} }
  draw(){
    if(this.dead)return; const dx=this.x-cam.x,dy=this.y-cam.y; const dw=this.w*2.4,dh=this.h*1.45; const ox=(dw-this.w)/2,oy=dh-this.h; const flip=this.facing===-1;
    if(this.interactAnim>0&&this.state!=='jump') CORVAN.draw(ctx, 'dig',  this.frame,    dx-ox,dy-oy,dw,dh,flip);
    else if(this.state==='run')                  CORVAN.draw(ctx, 'walk', this.frame,    dx-ox,dy-oy,dw,dh,flip);
    else                                         CORVAN.draw(ctx, 'idle', this.frame%4,  dx-ox,dy-oy,dw,dh,flip);
    if(this.inv>0&&Math.floor(this.inv/6)%2===0){ctx.fillStyle='rgba(255,60,60,0.35)';ctx.fillRect(dx,dy,this.w,this.h);}
  }
}

// ── Background draw ───────────────────────────────────────────────
function drawBg(bgKey){
  const img=IMG[bgKey];
  if(img&&img.complete&&img.naturalWidth>0){
    const scale=Math.max(W/img.naturalWidth,H/img.naturalHeight);
    const sw=img.naturalWidth*scale, sh=img.naturalHeight*scale;
    ctx.drawImage(img,(W-sw)/2,(H-sh)/2,sw,sh);
  } else {
    const fb={bg01:'#1a3a8a',bg02:'#0c0a08',bg03:'#0c0a08',bg04:'#1a3888'};
    const grd=ctx.createLinearGradient(0,0,0,H);
    grd.addColorStop(0,fb[bgKey]||'#0a1030'); grd.addColorStop(1,'#040814');
    ctx.fillStyle=grd; ctx.fillRect(0,0,W,H);
  }
  ctx.fillStyle='rgba(0,0,0,0.22)'; ctx.fillRect(0,0,W,H);
}

// ═══════════════════════════════════════════════════════════════
//  LEVEL BUILDERS
// ═══════════════════════════════════════════════════════════════

// ── Cena 1: Vale de Sar-e-Sang — ferramentas + Ovelha ─────────────
function buildL1(){
  const FL=560,WW=3200,WH=900;
  const plats=[
    solid(0,FL,500,WH-FL), solid(580,FL,200,WH-FL), solid(860,FL,180,WH-FL),
    solid(1120,FL,220,WH-FL), solid(1420,FL,200,WH-FL), solid(1700,FL,240,WH-FL),
    solid(1980,FL,260,WH-FL), solid(2280,FL,200,WH-FL), solid(2560,FL,220,WH-FL),
    solid(2820,FL,600,WH-FL),
    solid(200,FL-160,130,18), solid(420,FL-240,120,18), solid(660,FL-200,130,18),
    solid(900,FL-270,120,18), solid(1100,FL-170,140,18), solid(1320,FL-280,120,18),
    solid(1500,FL-200,150,18), solid(1750,FL-270,130,18), solid(2060,FL-180,150,18),
    solid(2280,FL-300,120,18), solid(2500,FL-220,140,18), solid(2700,FL-280,120,18),
    movH(500,FL-36,80,500,580,2.2), movH(780,FL-36,80,780,860,2.0),
    movH(1040,FL-36,80,1040,1120,2.2), movH(1340,FL-36,80,1340,1420,1.8),
    movH(1620,FL-36,80,1620,1700,2.0), movH(1900,FL-36,80,1900,1980,2.2),
    movH(2200,FL-36,80,2200,2280,2.0), movH(2480,FL-36,80,2480,2560,1.8),
    movH(2740,FL-36,80,2740,2820,2.0),
    spike(455,FL-20,25), spike(818,FL-20,25), spike(1018,FL-20,25),
  ];
  const enemies=[
    new Enemy(680,FL-44,'mineiro',70), new Enemy(1200,FL-44,'aguia',70),
    new Enemy(1700,FL-44,'mineiro',80), new Enemy(2100,FL-44,'aguia',60),
    new Enemy(2400,FL-44,'mineiro',80),
  ];
  const cols=[
    new Col(240,FL-50,'tora'),
    new Col(580,FL-50,'anfora'),
  ];
  const OVELHA_X=3000, OVELHA_Y=FL-90;
  const ovelha=new OvelhaMarcoPolo(); ovelha.land(OVELHA_X,OVELHA_Y);
  const triggers=[
    new Trigger(2880,FL-300,200,300,'Aproximar da Ovelha',(player,level)=>{
      if(!player.items.includes('anfora')){notify('Colete a Ânfora de Água Fria primeiro!');return;}
      player.interactAnim=60; sfx('item'); level.ovelha.land(OVELHA_X,OVELHA_Y);
      showDialog([
        '"A Ovelha de Marco Polo — Ovis ammon polii. O maior ovídeo do mundo, com chifres em espiral de até 1,9 metros. Vive apenas no Pamir e no Hindu Kush, e foi descrita por Marco Polo ao passar por esta rota em 1271."',
        '"Ela pousou numa saliência acima da mina, guardando um instrumento essencial: o Pilão e Almofariz de Ágata."',
        '"Os lapidários medievais usavam pilões de ágata — mais dura que o lápis — para moer o mineral sem contaminar o pigmento com a cor da própria ferramenta. O processo para extrair o ultramarino puro envolvia moer, misturar com cera e óleo, e lavar repetidamente em água até o azul puro flutuar. Levava semanas e era segredo de mestre artesão."',
      ],()=>{
        player.items.push('pilao'); _journalColetar('pilao');
        notify('⚱️ Pilão de Ágata recebido!');
        POPUP.show('Pilão e Almofariz de Ágata','⚱️','Ágata é mais dura que o lápis-lazúli.\nMoagem sem contaminar o pigmento.\nO processo completo (moer, misturar, lavar)\nlevava semanas — segredo de mestre artesão.',8000);
        level.triggers[0].done=true; setTimeout(()=>G.nextLevel(),4000);
      });
    }),
  ];
  return{
    id:1, bg:'bg01', W:WW, H:WH, startX:60, startY:FL-90,
    title:'O Vale de Sar-e-Sang',
    hint:'Colete 🪵 Tora e 🏺 Ânfora, depois encontre a Ovelha de Marco Polo!',
    plats, enemies, cols, triggers, ovelha, fireSpots:[],
    intro:[
      '"2500 antes de Cristo. Estas minas já funcionam há 4.500 anos quando chegamos aqui. O lápis que sai deste vale chegou ao Egito de Tutankamon, a Sumer, ao Vale do Indo — atravessando desertos e montanhas sem qualquer rota comercial formal."',
      '"As pessoas que viviam aqui nem sabiam que existia o Egito, e os egípcios não sabiam que existia este vale. Mas o azul desta pedra estava nos dois lugares ao mesmo tempo."',
      '"Um mineral criou uma rede global 5.000 anos antes da globalização."'
    ],
    update(player){ tickMoving(this.plats); for(const e of this.enemies)e.update(this.plats,player); if(!G.dialog)this.ovelha.update(player); for(const c of this.cols)c.tick(); POPUP.tick();
      if(Math.random()<0.003) sfx('eagle'); },
    draw(player){
      // Pinheiros tortos (parallax)
      for(let i=0;i<7;i++){
        const tx=200+i*460-cam.x*0.5; if(tx<-40||tx>W+40) continue;
        const th=140+(i%3)*30; const ty=FL-cam.y-th;
        ctx.fillStyle='#302818'; ctx.fillRect(tx-3,ty+th-30,6,30);
        ctx.fillStyle='#3a4028';
        for(let lev=0;lev<3;lev++){ ctx.beginPath(); const cw=14+lev*6; ctx.moveTo(tx-cw,ty+lev*36+24); ctx.lineTo(tx,ty+lev*36); ctx.lineTo(tx+cw,ty+lev*36+24); ctx.closePath(); ctx.fill(); }
      }
      // Fogueiras de mineiros antigos (decorativas)
      for(let i=0;i<4;i++){
        const fx=500+i*640-cam.x*0.7; if(fx<-40||fx>W+40) continue;
        const fy=FL-cam.y-6;
        const flicker=Math.sin(Date.now()/150+i)*2;
        ctx.fillStyle='#ff7020'; ctx.beginPath(); ctx.moveTo(fx-6,fy); ctx.quadraticCurveTo(fx-7,fy-10+flicker,fx,fy-18-flicker); ctx.quadraticCurveTo(fx+7,fy-10+flicker,fx+6,fy); ctx.closePath(); ctx.fill();
      }
      // Pedra onde a ovelha pousa
      const rx=OVELHA_X-cam.x, ry=OVELHA_Y-cam.y;
      if(rx>-80&&rx<W+80){ ctx.fillStyle='#c0b498'; ctx.beginPath(); ctx.ellipse(rx+30,ry+40,60,16,0,0,Math.PI*2); ctx.fill(); }
      this.ovelha.draw();
      for(const e of this.enemies)e.draw(); for(const c of this.cols)c.draw(); for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

// ── Cena 2: Galerias de Lápis — geologia + pop-ups ────────────────
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
  const enemies=[ new Enemy(500,FL-44,'mineiro',70),new Enemy(800,FL-44,'aguia',60),new Enemy(1060,FL-44,'mineiro',80),new Enemy(1380,FL-44,'aguia',70),new Enemy(1620,FL-44,'mineiro',90),new Enemy(1920,FL-44,'aguia',80),new Enemy(2200,FL-44,'mineiro',70),new Enemy(2560,FL-44,'aguia',80) ];
  const geoMessages=[
    {x:700, shown:false, text:'Formação do Lápis', icon:'🔷',body:'Há 150 milhões de anos, fluidos hidrotermais\nricos em sódio e enxofre circularam pelo\ncalcário marinho e reagiram com ele,\ncriando a lazurita azul. Uma rocha,\ntrês minerais formados juntos.'},
    {x:1500,shown:false, text:'O Azul Mais Caro da História', icon:'👑',body:'O ultramarino era mais caro que ouro na\nEuropa medieval. Reservado para pintar\no manto da Virgem Maria — considerado\na cor mais próxima do divino.'},
    {x:2300,shown:false, text:'O Teste da Pirita', icon:'✨',body:'A sodalita é o imitador mais perigoso —\ntambém azul, também calcita, mesma origem.\nMas NUNCA tem pirita. Pontos dourados\nmetálicos = sempre lápis-lazúli genuíno.'},
  ];
  const cols=[];
  const triggers=[
    new Trigger(2870,FL-300,200,300,'Examinar Veio Principal',(player,level)=>{
      player.interactAnim=90; sfx('shimmer');
      showDialog([
        '"O que torna o lápis único é que ele não é um mineral — é uma rocha composta de três minerais diferentes que se formaram juntos. A lazurita é o azul. A calcita é o branco. A pirita são os pontos dourados."',
        '"Quando você mói o lápis e lava, a lazurita flutua — é o pigmento mais puro que existe na natureza. Os artistas renascentistas chamavam de \'ultramarino\' porque vinha de \'além do mar\'. E \'além do mar\' era este vale, no coração das montanhas do Afeganistão."',
        '"A sodalita é o imitador mais perigoso: também azul, também com calcita, também de origem metamórfica. A diferença crítica — a sodalita não tem pirita. Se o azul for uniforme, sem qualquer ponto dourado, é sodalita. À frente: o fire-setting."',
      ],()=>{notify('✦ Geologia do lápis revelada!');level.triggers[0].done=true;setTimeout(()=>G.nextLevel(),4000);});
    }),
  ];
  return{
    id:2, bg:'bg02', W:WW, H:WH, startX:60, startY:FL-90,
    title:'As Galerias de Lápis',
    hint:'Percorra a galeria e examine o veio principal para revelar a geologia.',
    plats, enemies, cols, triggers, geoMessages, fireSpots:[],
    intro:[
      '"Corvan entra nas galerias, onde as paredes de calcário branco são cortadas por veias azul-cobalto intenso — o contraste é de impacto visual imediato."',
      '"Os pontos dourados são cristais de pirita crescidos simultaneamente. As nuvens brancas são calcita. O lápis é, literalmente, um sistema de três minerais formados ao mesmo tempo."',
      'Percorra a galeria e examine o veio principal.'
    ],
    update(player){
      tickMoving(this.plats); tickTrapdoors(this.plats);
      for(const e of this.enemies)e.update(this.plats,player);
      for(const gm of this.geoMessages){ if(!gm.shown&&player.x>gm.x&&!G.dialog){gm.shown=true;POPUP.show(gm.text,gm.icon,gm.body,7500);} }
      POPUP.tick();
    },
    draw(player){
      // Veios azuis na parede de calcário (decorativo)
      for(let i=0;i<8;i++){
        const vx=250+i*400-cam.x; if(vx<-30||vx>W+30) continue;
        ctx.strokeStyle='#2848a8'; ctx.lineWidth=5+Math.random()*2;
        ctx.beginPath(); ctx.moveTo(vx,0); ctx.lineTo(vx+30+i*3,FL-cam.y+80); ctx.stroke();
        ctx.strokeStyle='#3858c0'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(vx+8,0); ctx.lineTo(vx+38+i*3,FL-cam.y+80); ctx.stroke();
        // Pontos dourados
        for(let j=0;j<3;j++){
          const py=40+j*50; const sh=0.4+Math.sin(Date.now()/500+i+j)*0.3;
          ctx.fillStyle=`rgba(230,190,60,${sh})`; ctx.fillRect(vx+14,py,2,2);
        }
      }
      for(const e of this.enemies)e.draw();
      for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

// ── Cena 3: Fire-Setting — a mecânica central da fase ─────────────
function buildL3(){
  const FL=570,WW=3400,WH=900;
  const plats=[
    solid(0,FL,300,WH-FL), solid(380,FL,150,WH-FL), solid(630,FL,150,WH-FL),
    solid(880,FL,180,WH-FL), solid(1160,FL,150,WH-FL), solid(1410,FL,180,WH-FL),
    solid(1690,FL,150,WH-FL), solid(1940,FL,260,WH-FL), solid(2300,FL,180,WH-FL),
    solid(2580,FL,150,WH-FL), solid(2830,FL,570,WH-FL),
    solid(140,FL-180,140,18), solid(500,FL-215,110,18), solid(750,FL-175,130,18),
    solid(1000,FL-225,120,18), solid(1250,FL-155,140,18), solid(1520,FL-205,130,18),
    solid(1780,FL-195,145,18), solid(2050,FL-225,140,18), solid(2400,FL-175,130,18),
    movH(300,FL-36,100,300,380,2.0), movH(780,FL-36,100,780,880,2.0),
    movH(1310,FL-36,100,1310,1410,1.8), movH(1840,FL-36,100,1840,1940,2.2),
    movH(2480,FL-36,100,2480,2580,2.0),
  ];
  // Toras extras de reserva (caso desperdice)
  const cols=[
    new Col(560,FL-50,'tora'),
    new Col(1600,FL-50,'tora'),
    new Col(2450,FL-50,'tora'),
  ];
  // 3 pontos de fire-setting espalhados
  const fireSpots=[
    new FireSettingSpot(700,FL-70),
    new FireSettingSpot(1550,FL-70),
    new FireSettingSpot(2200,FL-70),
  ];
  // Planos de fragmentos: garante pelo menos 1 lápis por spot, com mix de sodalita
  fireSpots[0].fragmentPlan=['lapis','sodalita','lapis'];
  fireSpots[1].fragmentPlan=['sodalita','lapis','sodalita'];
  fireSpots[2].fragmentPlan=['lapis','lapis','sodalita'];
  const enemies=[ new Enemy(450,FL-44,'mineiro',60),new Enemy(950,FL-44,'aguia',70),new Enemy(1450,FL-44,'mineiro',70),new Enemy(1980,FL-44,'aguia',80),new Enemy(2350,FL-44,'mineiro',70) ];
  const triggers=[
    new Trigger(3200,FL-300,200,300,'Seguir para a Oficina',(player,level)=>{
      const lapN=player.items.filter(i=>i==='lapis').length;
      if(lapN<3){notify(`Colete ${3-lapN} bloco(s) de Lápis-Lazúli antes de seguir!`);return;}
      player.interactAnim=90; sfx('duduk');
      showDialog([
        '"O fire-setting é simples e violento: aqueça a rocha até ela estar no limite, depois resfrie abruptamente. O choque térmico cria microfissuras internas que partem a rocha em planos naturais."',
        '"Mas o timing importa — pouco aquecimento e a rocha não racha; muito aquecimento e o lápis dentro fica queimado e perde a cor. Os mineiros de Badakhshan aprendem o tempo certo ao ouvir o crepitar do fogo mudar de frequência."',
        `"${lapN} blocos de lápis-lazúli em mãos. Hora de levar à oficina de pigmento."`,
      ],()=>{notify('✦ Fire-setting dominado! Siga para a oficina.');level.triggers[0].done=true;setTimeout(()=>G.nextLevel(),4000);});
    }),
  ];
  return{
    id:3, bg:'bg03', W:WW, H:WH, startX:60, startY:FL-90,
    title:'Fire-Setting: A Técnica Mais Antiga',
    hint:'[E] Acender c/ 🪵 Tora → aguarde 80%+ → [E] Ânfora → examine c/ Pilão!',
    plats, enemies, cols, triggers, fireSpots,
    intro:[
      '"Três pontos de extração. Em cada um: encoste a Tora à parede [E] para acender. Espere a barra de calor passar de 80% — só então use a Ânfora [E] para resfriar."',
      '"Se a água vier cedo demais, a rocha não racha e a lenha se perde — procure mais toras pela galeria."',
      'Depois que a rocha rachar, examine cada fragmento com o Pilão antes de decidir: pirita dourada = lápis; azul uniforme = sodalita.'
    ],
    update(player){
      tickMoving(this.plats);
      for(const e of this.enemies)e.update(this.plats,player);
      for(const c of this.cols)c.tick();
      for(const spot of this.fireSpots){ spot.tick(); for(const f of spot.fragments) f.tick(); }
      POPUP.tick();
    },
    draw(player){
      for(const spot of this.fireSpots) spot.draw();
      for(const e of this.enemies)e.draw();
      for(const c of this.cols)c.draw();
      for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

// ── Cena 4: Oficina de Pigmento — conclusão + frasco ──────────────
function buildL4(){
  const FL=610,WW=3200,WH=900;
  const plats=[
    solid(0,FL,380,WH-FL),solid(460,FL,320,WH-FL),solid(870,FL,360,WH-FL),
    solid(1330,FL,380,WH-FL),solid(1810,FL,400,WH-FL),solid(2320,FL,680,WH-FL),
    solid(200,FL-140,160,18),solid(400,FL-240,140,18),solid(600,FL-180,155,18),
    solid(840,FL-250,140,18),solid(1060,FL-200,155,18),solid(1280,FL-305,130,18),
    solid(1540,FL-200,175,18),solid(1760,FL-280,150,18),solid(2050,FL-180,160,18),
    solid(2380,FL-80,560,80),solid(2440,FL-160,500,80),solid(2510,FL-240,440,80),
    solid(2590,FL-300,380,18),solid(2680,FL-360,320,18),solid(2780,FL-420,260,18),
    movH(440,FL-180,120,440,730,2.2), movH(1380,FL-150,110,1380,1680,2.0), movH(2240,FL-140,110,2240,2380,1.8),
    trap(340,FL-80,110),trap(1100,FL-90,100),
    spike(395,FL-20,50),spike(810,FL-20,50),spike(1250,FL-20,50),spike(1730,FL-20,50),spike(2250,FL-20,60),
  ];
  const ovelha=new OvelhaMarcoPolo(); ovelha.guide(180,FL-55,140,2860);
  const ovelhaMessages=[
    {x:500, shown:false, text:'"O lápis chegou ao Egito de Tutankamon, a Sumer, ao Vale do Indo — 5.000 anos antes da globalização, sem rota comercial formal."'},
    {x:1300,shown:false, text:'"O ultramarino não desbota. As tintas sintéticas modernas sim. 700 anos depois, o azul de Giotto continua tão vívido quanto no dia em que foi pintado."'},
    {x:2100,shown:false, text:'"Em 1704, Diesbach sintetizou o azul prussiano em Berlim — primeiro pigmento sintético da história. As minas de Sar-e-Sang perderam o monopólio de 9.000 anos numa única noite de laboratório."'},
    {x:2700,shown:false, text:'"Na oficina, complete a missão. O Frasco de Ultramarino espera."'},
  ];
  const enemies=[ new Enemy(200,FL-44,'mineiro',60),new Enemy(680,FL-44,'aguia',70),new Enemy(1100,FL-44,'mineiro',80),new Enemy(1600,FL-44,'aguia',70),new Enemy(2050,FL-44,'mineiro',80) ];
  const cols=[ new Col(2900,FL-450,'frasco') ];
  const triggers=[
    new Trigger(2780,FL-460,240,460,'Completar a Fase!',(player,level)=>{
      if(!player.items.includes('frasco')){notify('Colete o Frasco de Ultramarino primeiro!');return;}
      level.triggers[0].done=true;player.interactAnim=120;sfx('unlock');
      const lapN=player.items.filter(i=>i==='lapis').length;
      showDialog([
        '"O azul do manto da Virgem Maria na Sistina. O azul das faianças de Tutankamon. O azul da cerâmica persa. O azul das iluminuras islâmicas. Todos vieram deste vale."',
        '"Por 9.000 anos, este lugar remoto e inacessível foi o único fornecedor de um dos pigmentos mais importantes da história da arte humana."',
        '"Quando Johann Jacob Diesbach sintetizou o azul prussiano em Berlim em 1704 — o primeiro pigmento sintético da história — as minas de Sar-e-Sang perderam o monopólio de 9.000 anos em uma noite de laboratório. O lápis continuou bonito. Mas o mundo não precisava mais dele."',
        `🏆 FASE 5.2 CONCLUÍDA! ${lapN} blocos de lápis-lazúli coletados.\nPróximo destino: Jiangxi, China!`,
      ],()=>{_salvarProgresso(G.player?.score||0,G.deaths);G.state='complete';});
    }),
  ];
  return{
    id:4, bg:'bg04', W:WW, H:WH, startX:60, startY:FL-90,
    title:'A Oficina de Pigmento',
    hint:'Siga a Ovelha ao altar. [E] para completar a jornada.',
    plats, enemies, cols, triggers, ovelha, ovelhaMessages, fireSpots:[],
    intro:[
      '"Na pequena oficina de pigmento ao pé da mina, a luz de final de tarde atravessa vidro veneziano e projeta uma sombra azul-cobalto perfeita na parede de calcário branco."',
      '"Uma animação mostra a rota de 5.000 anos do lápis de Sar-e-Sang: ondas concêntricas saindo do vale de Kokcha alcançando Sumer, Egito, Índia, Pérsia, Veneza, Paris."',
      'Siga a Ovelha até o altar e complete a missão.'
    ],
    update(player){
      tickMoving(this.plats); tickTrapdoors(this.plats);
      for(const e of this.enemies)e.update(this.plats,player);
      if(!G.dialog)this.ovelha.update(player);
      for(const om of this.ovelhaMessages){ if(!om.shown&&player.x>om.x&&!G.dialog){om.shown=true;showDialog([om.text],null,'🐏 OVELHA DE MARCO POLO');} }
      for(const c of this.cols)c.tick();POPUP.tick();
    },
    draw(player){
      // Luz azulada do frasco ao fundo
      const blueGlow=ctx.createLinearGradient(0,H*0.3,0,H);
      blueGlow.addColorStop(0,'rgba(40,80,200,0.06)'); blueGlow.addColorStop(1,'rgba(20,50,140,0.12)');
      ctx.fillStyle=blueGlow; ctx.fillRect(0,H*0.3,W,H*0.7);
      // Prateleiras da oficina com blocos de pigmento
      for(let sh=0;sh<3;sh++){
        const sy=100+sh*90; ctx.fillStyle='#806030'; ctx.fillRect(0,sy,80,10);
        for(let b=0;b<5;b++){ ctx.fillStyle=['#2848c8','#3858d8','#2040b0','#4060e0','#3050c0'][b%5]; ctx.fillRect(4+b*14,sy-16,12,20); }
      }
      // Glow do frasco no altar
      const ag=ctx.createRadialGradient(2900-cam.x,FL-450-cam.y,0,2900-cam.x,FL-450-cam.y,150);
      ag.addColorStop(0,'rgba(40,80,220,0.3)'); ag.addColorStop(1,'rgba(40,80,220,0)');
      ctx.fillStyle=ag; ctx.fillRect(3300-cam.x,FL-500-cam.y,300,300);
      this.ovelha.draw();
      for(const e of this.enemies)e.draw(); for(const c of this.cols)c.draw(); for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

// ── HUD ────────────────────────────────────────────────────────────
function drawHUD(player,level){
  ctx.fillStyle='rgba(0,0,0,0.65)';ctx.fillRect(0,0,W,38);
  for(let i=0;i<player.maxHp;i++){ ctx.fillStyle=i<player.hp?'#e02020':'#333'; ctx.beginPath();const hx=16+i*28,hy=10;ctx.arc(hx+5,hy+5,5,Math.PI,0);ctx.arc(hx+15,hy+5,5,Math.PI,0);ctx.lineTo(hx+20,hy+5);ctx.bezierCurveTo(hx+20,hy+14,hx+10,hy+18,hx+10,hy+18);ctx.bezierCurveTo(hx+10,hy+18,hx,hy+14,hx,hy+5);ctx.closePath();ctx.fill(); }
  ctx.fillStyle='rgba(70,120,220,.9)';ctx.font='13px "Courier New"';ctx.textAlign='center';ctx.fillText(level.title,W/2,24);ctx.textAlign='left';
  ctx.fillStyle='#4878d0';ctx.font='bold 15px "Courier New"';ctx.textAlign='right';ctx.fillText('⭐ '+player.score,W-14,24);ctx.textAlign='left';
  const tY=44;
  ctx.fillStyle='rgba(0,0,0,0.5)';_rr(16,tY,140,28,4);ctx.fill();
  ctx.strokeStyle=player.activeTool?'#4878d0':'#444';ctx.lineWidth=1.5;_rr(16,tY,140,28,4);ctx.stroke();
  if(player.activeTool&&ITEM_DEFS[player.activeTool]){const def=ITEM_DEFS[player.activeTool];ctx.font='14px serif';ctx.fillText(def.icon,24,tY+20);ctx.font='11px "Courier New"';ctx.fillStyle='#4878d0';ctx.fillText(def.nome,42,tY+20);}
  else{ctx.font='11px "Courier New"';ctx.fillStyle='#555';ctx.fillText('Sem ferramenta',22,tY+20);}
  ctx.fillStyle='rgba(40,80,200,0.15)';_rr(162,tY,46,28,4);ctx.fill();ctx.strokeStyle='#204090';ctx.lineWidth=1.5;_rr(162,tY,46,28,4);ctx.stroke();
  ctx.font='bold 11px "Courier New"';ctx.fillStyle='#5888d8';ctx.textAlign='center';ctx.fillText('[I]',185,tY+19);ctx.textAlign='left';
  let ix=W-16;const inv=[];
  if(player.items.includes('frasco'))  inv.push('🧪 FRASCO');
  if(player.items.includes('pilao'))   inv.push('⚱️ PILÃO');
  if(player.items.includes('anfora'))  inv.push('🏺 ÂNFORA');
  const toraN=player.items.filter(i=>i==='tora').length;
  if(toraN>0) inv.push('🪵 '+toraN);
  const lapN=player.items.filter(i=>i==='lapis').length;
  if(lapN>0) inv.push('🔷 '+lapN);
  for(const it of inv){ctx.fillStyle='#4878d0';ctx.font='12px "Courier New"';ctx.textAlign='right';ctx.fillText(it,ix,tY+20);ctx.textAlign='left';ix-=ctx.measureText(it).width+20;}
  ctx.fillStyle='rgba(140,170,230,.72)';ctx.font='12px "Courier New"';ctx.textAlign='center';ctx.fillText(level.hint,W/2,H-10);ctx.textAlign='left';
  if(G.timeOnLevel<600){ctx.fillStyle='rgba(0,0,0,0.55)';ctx.fillRect(8,H-44,480,28);ctx.fillStyle='#aaa';ctx.font='12px "Courier New"';ctx.fillText('← → Mover  ↑/Espaço Pular  E Interagir  I Inventário',14,H-25);}
}

// ── Title Screen ──────────────────────────────────────────────────
function drawTitle(){
  const bg=IMG['bg01'];
  if(bg&&bg.complete&&bg.naturalWidth>0){ctx.globalAlpha=0.55;drawBg('bg01');ctx.globalAlpha=1;}
  else{const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0a1030');g.addColorStop(1,'#020408');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
  ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(0,0,W,H);
  for(let i=0;i<120;i++){const sx=(i*143.5)%W,sy=(i*87.7)%280;ctx.fillStyle=`rgba(160,190,255,${.15+Math.sin(Date.now()/1400+i)*.15})`;ctx.fillRect(sx,sy,i%4===0?2:1,i%4===0?2:1);}
  {
    const walkPeriod = 9000;
    const tWalk = (Date.now() % walkPeriod) / walkPeriod;
    const cwX = tWalk * (W + 120) - 60;
    const cwY = H - 140;
    CORVAN.drawLarge(ctx, cwX, cwY, 2.2, false, Date.now()/180, null);
  }
  if(IMG['ovelha_img']&&IMG['ovelha_img'].complete){
    const lx=((Date.now()/24)%(W+130))-65; const ly=H-160+Math.sin(Date.now()/260)*2;
    ctx.drawImage(IMG['ovelha_img'],0,0,96,96,lx,ly,116,116);
  }
  ctx.textAlign='center';
  ctx.shadowColor='#2848c8';ctx.shadowBlur=40;
  ctx.fillStyle='#4878e0';ctx.font='bold 48px "Courier New"';ctx.fillText('O AZUL QUE O MUNDO BUSCOU',W/2,168);
  ctx.shadowBlur=0;
  ctx.fillStyle='#4060a0';ctx.font='22px "Courier New"';ctx.fillText('Fase 5.2  —  Sar-e-Sang, Badakhshan · 2500 a.C.',W/2,216);
  if(IMG.card52){
    const cardSize=160,cardX=W/2-80,cardY=246;
    const glow=ctx.createRadialGradient(W/2,cardY+80,0,W/2,cardY+80,130);
    glow.addColorStop(0,'rgba(40,80,220,0.25)'); glow.addColorStop(1,'rgba(40,80,220,0)');
    ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(W/2,cardY+80,130,0,Math.PI*2); ctx.fill();
    ctx.drawImage(IMG.card52,cardX,cardY,cardSize,cardSize);
  }
  ctx.fillStyle=`rgba(60,100,220,${.55+Math.sin(Date.now()/550)*.4})`;ctx.font='19px "Courier New"';
  ctx.fillText('▶  Pressione ENTER para começar  ◀',W/2,460);
  ctx.fillStyle='#a0b0d8';ctx.font='18px "Courier New"';
  ctx.fillText('← → Mover  ↑/Espaço Pular  E Interagir  I Inventário',W/2,504);
  ctx.fillText('[M] Menu Principal',W/2,538);
  ctx.textAlign='left';
}

function drawDeath(){
  ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);
  ctx.textAlign='center';ctx.shadowColor='#ff2020';ctx.shadowBlur=30;
  ctx.fillStyle='#ff5050';ctx.font='bold 56px "Courier New"';ctx.fillText('VOCÊ CAIU!',W/2,H/2-50);ctx.shadowBlur=0;
  CORVAN.drawLarge(ctx, W/2-24, H/2+10, 3, false);
  ctx.fillStyle='#4878d0';ctx.font='20px "Courier New"';
  ctx.fillText('Pressione  R  para recomeçar',W/2,H/2+140);
  ctx.fillText(`Mortes: ${G.deaths}`,W/2,H/2+172);
  ctx.fillStyle='#888';ctx.font='15px "Courier New"';ctx.fillText('[M] Menu Principal',W/2,H/2+204);
  ctx.textAlign='left';
}

function drawComplete(){
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#020410');g.addColorStop(1,'#081030');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  const rg=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,500);rg.addColorStop(0,'rgba(40,80,220,.16)');rg.addColorStop(1,'rgba(40,80,220,0)');ctx.fillStyle=rg;ctx.fillRect(0,0,W,H);
  ctx.textAlign='center';
  ctx.shadowColor='#4878e0';ctx.shadowBlur=40;
  ctx.fillStyle='#5888e8';ctx.font='bold 40px "Courier New"';ctx.fillText('✦  FASE 5.2 CONCLUÍDA  ✦',W/2,108);
  ctx.shadowBlur=0;
  CORVAN.drawLarge(ctx, W/2 - 24, H/2 - 200, 3, false);
  ctx.fillStyle='#e8d090';ctx.font='20px "Courier New"';ctx.fillText('O Azul que o Mundo Buscou foi conquistado!',W/2,160);
  const lines=[
    '🔷  Lápis-Lazúli — o pigmento mais puro da natureza',
    '🧪  Frasco de Ultramarino — a rota de Badakhshan a Giotto',
    '⚱️  Pilão de Ágata — moagem sem contaminação',
    '🐏  Ovelha de Marco Polo — testemunha do Pamir',
  ];
  ctx.fillStyle='#c8d8f0';ctx.font='16px "Courier New"';lines.forEach((l,i)=>ctx.fillText(l,W/2,400+i*32));
  ctx.fillStyle='#4878d0';ctx.font='18px "Courier New"';ctx.fillText(`Pontuação: ⭐ ${G.player?.score||0}   Mortes: ${G.deaths}`,W/2,548);
  ctx.fillStyle=`rgba(60,100,220,${.6+Math.sin(Date.now()/600)*.4})`;ctx.font='17px "Courier New"';
  ctx.fillText('▶ [M] Menu Principal ◀',W/2,594);
  ctx.font='42px serif';ctx.fillText('🏆',W/2-20,640);
  ctx.textAlign='left';
}

// ── Game engine ───────────────────────────────────────────────────
const LEVELS=[buildL1,buildL2,buildL3,buildL4];
const G={
  state:'title', lvIdx:0, level:null, player:null,
  dialog:false, deaths:0, timeOnLevel:0,
  _storedItems:[], _storedScore:0, _storedTool:null,

  load(idx){
    this.lvIdx=idx; particles=[];
    tileTheme=TILE_THEMES[idx+1]||TILE_THEMES[1];
    this.level=LEVELS[idx]();
    cam.x=0; cam.y=0;
    this.player=new Player(this.level.startX,this.level.startY);
    if(idx>0){
      this.player.items=[...this._storedItems];
      this.player.score=this._storedScore;
      this.player.activeTool=this._storedTool||null;
    }
    this.dialog=false; this.state='playing'; this.timeOnLevel=0;
    BUBBLE.active=false; POPUP.active=false;
    setTimeout(()=>{if(this.state==='playing')showDialog(this.level.intro,null);},900);
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
    if(this.state==='title'){drawTitle();return;}
    if(this.state==='complete'){drawComplete();return;}
    drawBg(this.level.bg);
    for(const p of this.level.plats) drawPlatform(p);
    this.level.draw(this.player);
    drawParticles();
    this.player.draw();
    if(this.state==='dead'){drawDeath();return;}
    drawHUD(this.player,this.level);
    BUBBLE.draw(this.player);
    drawNotif(); POPUP.draw(); INV.draw(this.player);
  }
};

function _journalColetar(tipo, count) {
  const id = TIPO_TO_JOURNAL[tipo] || tipo;
  if (!id) return;
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
    if (!save.fases['5.2']) save.fases['5.2'] = {desbloqueada:true, estrelas:0, coletados:{}};
    if (!save.fases['5.2'].coletados) save.fases['5.2'].coletados = {};
    if (count && count > 1) {
      save.fases['5.2'].coletados[id] = Math.max(Number(save.fases['5.2'].coletados[id])||0, count);
    } else {
      save.fases['5.2'].coletados[id] = true;
    }
    localStorage.setItem('mineralis_save_v2', JSON.stringify(save));
  } catch(e) {}
}

function _salvarProgresso(score,deaths){
  const estrelas=deaths===0?4:deaths<=2?3:deaths<=5?2:1;
  try{
    const raw=localStorage.getItem('mineralis_save_v2');
    const save=raw?JSON.parse(raw):{versao:1,iniciado:true,fases:{}};
    if(!save.fases) save.fases={};
    if(!save.fases['5.2']) save.fases['5.2']={desbloqueada:true,estrelas:0};
    save.fases['5.2'].estrelas=Math.max(save.fases['5.2'].estrelas||0,estrelas);
    save.fases['5.2'].desbloqueada=true;
    localStorage.setItem(SAVE_KEY,JSON.stringify(save));
  }catch(e){}
}

function startGame(){
  CORVAN.load('Assets/', () => {});
  G.load(0); G.state='title'; loop();
}

function loop(){
  requestAnimationFrame(loop);
  if(G.state==='title'    &&(jp['Enter']||jp['Space'])) G.load(0);
  if(G.state==='dead'     && jp['KeyR'])                G.load(G.lvIdx);
  if(G.state==='complete' &&(jp['Enter']||jp['KeyM'])) _voltarAoMenu();
  if(G.state==='complete' && jp['KeyM']) _voltarAoMenu();
  G.update(); G.draw(); clearJP();
}

if(!gameReady){
  (function loadLoop(){
    if(gameReady) return;
    requestAnimationFrame(loadLoop);
    ctx.fillStyle='#020408';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#4878d0';ctx.font='bold 22px "Courier New"';ctx.textAlign='center';
    ctx.fillText(`Carregando${'.'.repeat(Math.floor(Date.now()/400)%4)}  ${assetsLoaded}/${totalAssets}`,W/2,H/2);
    ctx.fillStyle='#888';ctx.font='14px "Courier New"';
    ctx.fillText('Fase 5.2 — O Azul que o Mundo Buscou',W/2,H/2+36);
    ctx.textAlign='left';
  })();
}
