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
  if      (type==='jump')        { o.frequency.setValueAtTime(280,t); o.frequency.exponentialRampToValueAtTime(520,t+.14); g.gain.setValueAtTime(.15,t); g.gain.exponentialRampToValueAtTime(.001,t+.16); }
  else if (type==='coin')        { o.frequency.setValueAtTime(880,t); o.frequency.exponentialRampToValueAtTime(1760,t+.09); g.gain.setValueAtTime(.12,t); g.gain.exponentialRampToValueAtTime(.001,t+.12); }
  else if (type==='hit')         { o.type='sawtooth'; o.frequency.setValueAtTime(200,t); o.frequency.exponentialRampToValueAtTime(50,t+.18); g.gain.setValueAtTime(.18,t); g.gain.exponentialRampToValueAtTime(.001,t+.22); }
  else if (type==='item')        { o.frequency.setValueAtTime(440,t); o.frequency.setValueAtTime(660,t+.1); o.frequency.setValueAtTime(880,t+.2); g.gain.setValueAtTime(.14,t); g.gain.exponentialRampToValueAtTime(.001,t+.3); }
  else if (type==='unlock')      { o.frequency.setValueAtTime(330,t); o.frequency.setValueAtTime(440,t+.15); o.frequency.setValueAtTime(660,t+.3); g.gain.setValueAtTime(.15,t); g.gain.exponentialRampToValueAtTime(.001,t+.5); }
  // Pounamu — wumm de ressonância suave (taça de cristal)
  else if (type==='pounamu')     { o.type='sine'; o.frequency.setValueAtTime(440,t); g.gain.setValueAtTime(.12,t); g.gain.exponentialRampToValueAtTime(.001,t+.5); const o2=AC.createOscillator(),g2=AC.createGain(); o2.type='sine'; o2.frequency.setValueAtTime(660,t); g2.gain.setValueAtTime(.06,t); g2.gain.exponentialRampToValueAtTime(.001,t+.7); o2.connect(g2); g2.connect(AC.destination); o2.start(t); o2.stop(t+.8); }
  // Tang subaquático do pounamu (musical, abafado)
  else if (type==='pounamu_water'){ o.type='sine'; o.frequency.setValueAtTime(330,t); g.gain.setValueAtTime(.08,t); g.gain.exponentialRampToValueAtTime(.001,t+.4); }
  // Granito subaquático (tonk surdo)
  else if (type==='granito')     { o.type='square'; o.frequency.setValueAtTime(100,t); o.frequency.exponentialRampToValueAtTime(60,t+.1); g.gain.setValueAtTime(.1,t); g.gain.exponentialRampToValueAtTime(.001,t+.14); }
  // Serpentinita subaquática (tok suave, ligeiramente mais grave que pounamu)
  else if (type==='serpentina')  { o.type='triangle'; o.frequency.setValueAtTime(180,t); o.frequency.exponentialRampToValueAtTime(120,t+.12); g.gain.setValueAtTime(.1,t); g.gain.exponentialRampToValueAtTime(.001,t+.16); }
  // Toki riscando serpentinita (shhh suave)
  else if (type==='toki_streak') { o.type='sawtooth'; o.frequency.setValueAtTime(2400,t); o.frequency.exponentialRampToValueAtTime(800,t+.2); g.gain.setValueAtTime(.04,t); g.gain.linearRampToValueAtTime(.06,t+.06); g.gain.exponentialRampToValueAtTime(.001,t+.24); }
  // Toki em pounamu (nenhum risco — toque suave)
  else if (type==='toki_ok')     { o.type='sine'; o.frequency.setValueAtTime(220,t); g.gain.setValueAtTime(.05,t); g.gain.exponentialRampToValueAtTime(.001,t+.18); }
  // Mergulho — entrada na água
  else if (type==='splash')      { o.type='sawtooth'; o.frequency.setValueAtTime(900,t); o.frequency.exponentialRampToValueAtTime(120,t+.4); g.gain.setValueAtTime(.14,t); g.gain.exponentialRampToValueAtTime(.001,t+.5); }
  // Bolha de ar
  else if (type==='bubble')      { o.type='sine'; o.frequency.setValueAtTime(800,t); o.frequency.exponentialRampToValueAtTime(1600,t+.15); g.gain.setValueAtTime(.06,t); g.gain.exponentialRampToValueAtTime(.001,t+.18); }
  // Batimento cardíaco (urgência de fôlego)
  else if (type==='heartbeat')   { o.type='sine'; o.frequency.setValueAtTime(80,t); g.gain.setValueAtTime(.18,t); g.gain.exponentialRampToValueAtTime(.001,t+.18); const o2=AC.createOscillator(),g2=AC.createGain(); o2.type='sine'; o2.frequency.setValueAtTime(70,t+.2); g2.gain.setValueAtTime(.16,t+.2); g2.gain.exponentialRampToValueAtTime(.001,t+.36); o2.connect(g2); g2.connect(AC.destination); o2.start(t+.2); o2.stop(t+.4); }
  // Kiwi — grito agudo e penetrante
  else if (type==='kiwi')        { o.type='sine'; o.frequency.setValueAtTime(2200,t); o.frequency.exponentialRampToValueAtTime(1600,t+.1); g.gain.setValueAtTime(.1,t); g.gain.exponentialRampToValueAtTime(.001,t+.14); const o2=AC.createOscillator(),g2=AC.createGain(); o2.type='sine'; o2.frequency.setValueAtTime(2400,t+.18); o2.frequency.exponentialRampToValueAtTime(1800,t+.28); g2.gain.setValueAtTime(.08,t+.18); g2.gain.exponentialRampToValueAtTime(.001,t+.32); o2.connect(g2); g2.connect(AC.destination); o2.start(t+.18); o2.stop(t+.4); }
  // Putorino — nota bifurcada longa (voz masc + fem)
  else if (type==='putorino')    {
    // Voz feminina (alta)
    o.type='sine'; o.frequency.setValueAtTime(523,t); o.frequency.exponentialRampToValueAtTime(440,t+1.5); g.gain.setValueAtTime(.0,t); g.gain.linearRampToValueAtTime(.12,t+.4); g.gain.linearRampToValueAtTime(.10,t+1.2); g.gain.exponentialRampToValueAtTime(.001,t+2);
    // Voz masculina (oitava abaixo)
    const o2=AC.createOscillator(),g2=AC.createGain(); o2.type='sine'; o2.frequency.setValueAtTime(262,t); o2.frequency.exponentialRampToValueAtTime(220,t+1.5); g2.gain.setValueAtTime(.0,t); g2.gain.linearRampToValueAtTime(.10,t+.4); g2.gain.linearRampToValueAtTime(.08,t+1.2); g2.gain.exponentialRampToValueAtTime(.001,t+2); o2.connect(g2); g2.connect(AC.destination); o2.start(t); o2.stop(t+2.2);
  }
  // Pukaea — trompete cerimonial grave
  else if (type==='pukaea')      {
    o.type='sawtooth'; o.frequency.setValueAtTime(110,t); g.gain.setValueAtTime(.0,t); g.gain.linearRampToValueAtTime(.12,t+.2); g.gain.linearRampToValueAtTime(.1,t+1); g.gain.exponentialRampToValueAtTime(.001,t+1.5);
  }
  // Tui — pássaro neozelandês (notas misturadas)
  else if (type==='tui')         { o.type='sine'; o.frequency.setValueAtTime(1800,t); o.frequency.linearRampToValueAtTime(2400,t+.1); o.frequency.linearRampToValueAtTime(1400,t+.2); g.gain.setValueAtTime(.07,t); g.gain.exponentialRampToValueAtTime(.001,t+.25); }
  else if (type==='stone')       { o.type='square'; o.frequency.setValueAtTime(120,t); g.gain.setValueAtTime(.1,t); g.gain.exponentialRampToValueAtTime(.001,t+.15); }
  o.start(t); o.stop(t+2.5);
}

// ── Save ─────────────────────────────────────────────────────────
const SAVE_KEY = 'mineralis_save_v2';
function _salvarFase(score, deaths){
  const estrelas = deaths===0?4:deaths<=2?3:deaths<=5?2:1;
  try{
    const raw=localStorage.getItem(SAVE_KEY);
    const save=raw?JSON.parse(raw):{versao:1,iniciado:true,fases:{}};
    if(!save.fases) save.fases={};
    if(!save.fases['6.3']) save.fases['6.3']={desbloqueada:true,estrelas:0};
    save.fases['6.3'].estrelas=Math.max(save.fases['6.3'].estrelas||0,estrelas);
    save.fases['6.3'].desbloqueada=true;
    save.jogoCompleto = true; // marca jogo finalizado
    localStorage.setItem(SAVE_KEY,JSON.stringify(save));
  }catch(e){}
}
function _voltarAoMenu(){ _salvarFase(G.player?.score||0,G.deaths); window.location.href='../../MenuPrincipal/index.html'; }

// ── Assets ───────────────────────────────────────────────────────
const IMG={};
const ASSETS=[
  ['bg01','Assets/cena1_rio_arahura.svg'],
  ['bg02','Assets/cena2_leito_geologico.svg'],
  ['bg03','Assets/cena3_visao_subaquatica.svg'],
  ['bg04','Assets/cena4_clareira_mapa.svg'],
  ['kiwi_img',    'Assets/6_3_kiwi.svg'],
  ['mascara_img', 'Assets/6_3_mascara_kelp.svg'],
  ['toki_img',    'Assets/6_3_toki_pounamu.svg'],
  ['corda_img',   'Assets/6_3_corda_harakeke.svg'],
  ['heitiki_img', 'Assets/6_3_hei_tiki.svg'],
  ['card63',      'Assets/6_3_pounamu.svg'],
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
window.addEventListener('blur',()=>{for(const k in keys)delete keys[k];for(const k in jp)delete jp[k];TOUCH.l=TOUCH.r=TOUCH.j=TOUCH.e=false;});
document.addEventListener('visibilitychange',()=>{if(document.hidden){for(const k in keys)delete keys[k];for(const k in jp)delete jp[k];TOUCH.l=TOUCH.r=TOUCH.j=TOUCH.e=false;}});
const TOUCH={l:false,r:false,j:false,e:false};
function bindT(id,k){ const el=document.getElementById(id); if(!el)return;
  el.addEventListener('touchstart',ev=>{ev.preventDefault();TOUCH[k]=true;if(k==='j'||k==='e')jp['_t'+k]=true;},{passive:false});
  el.addEventListener('touchend',  ev=>{ev.preventDefault();TOUCH[k]=false;},{passive:false}); }
bindT('tb-l','l'); bindT('tb-r','r'); bindT('tb-j','j'); bindT('tb-e','e');
const isL=()=>keys['ArrowLeft'] ||keys['KeyA']||TOUCH.l;
const isR=()=>keys['ArrowRight']||keys['KeyD']||TOUCH.r;
const isU=()=>keys['ArrowUp']   ||keys['KeyW']||TOUCH.j;
const isD=()=>keys['ArrowDown'] ||keys['KeyS'];
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
function bubbleBurst(x,y,n=6){
  for(let i=0;i<n;i++){
    particles.push({x:x+(Math.random()-.5)*16,y,vx:(Math.random()-.5)*.6,vy:-1-Math.random()*1.5,life:80,max:80,color:'rgba(180,220,240,0.7)',r:2+Math.random()*3,bubble:true});
  }
}
function tickParticles(){
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i];
    if(p.bubble){ p.vy*=0.99; p.x+=Math.sin(p.life*0.05)*0.3; }
    else p.vy+=0.15;
    p.x+=p.vx; p.y+=p.vy; p.life--;
    if(p.life<=0) particles.splice(i,1);
  }
}
function drawParticles(){
  for(const p of particles){
    ctx.globalAlpha=p.life/p.max;
    if(p.bubble){
      ctx.strokeStyle=p.color; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.arc(p.x-cam.x,p.y-cam.y,p.r,0,Math.PI*2); ctx.stroke();
      ctx.fillStyle='rgba(220,240,255,0.4)';
      ctx.beginPath(); ctx.arc(p.x-cam.x-p.r/2,p.y-cam.y-p.r/2,p.r*0.4,0,Math.PI*2); ctx.fill();
    } else {
      ctx.fillStyle=p.color;
      ctx.beginPath(); ctx.arc(p.x-cam.x,p.y-cam.y,p.r*(p.life/p.max),0,Math.PI*2); ctx.fill();
    }
  }
  ctx.globalAlpha=1;
}

// ── Camera ────────────────────────────────────────────────────────
const cam={x:0,y:0};
function updateCam(px,worldW){ const t=px-W/2+24; const c=Math.max(0,Math.min(t,worldW-W)); cam.x+=(c-cam.x)*0.12; }

const GRAV=0.46, PSPD=4.6, JUMPF=-12.4, MAXFALL=16;
const SWIM_SPD=3.0; // velocidade nadando

// ── Tile themes — pedras de granito do leito Arahura ─────────────
const TILE_THEMES={
  1:{top:'#5a6850',body:'#3a4838',dark:'#1c2820'},  // margem rio verde
  2:{top:'#4a5860',body:'#2a3038',dark:'#181c20'},  // leito molhado
  3:{top:'#1a3848',body:'#0a1820',dark:'#040810'},  // subaquático
  4:{top:'#3a4838',body:'#1a2818',dark:'#0c1408'},  // floresta noturna
};
let tileTheme=TILE_THEMES[1];

// ── Platform helpers ──────────────────────────────────────────────
function solid(x,y,w,h){ return {type:'solid',x,y,w,h}; }
function movH(x,y,w,x0,x1,spd){ return {type:'solid',moving:true,x,y,w,h:18,x0,x1,spd,vx:spd,vy:0}; }
function movV(x,y,w,y0,y1,spd){ return {type:'solid',moving:true,x,y,w,h:18,y0,y1,spd,vx:0,vy:spd}; }
function water(x,y,w,h){ return {type:'water',x,y,w,h}; }
function spike(x,y,w){ return {type:'spike',x,y,w,h:20}; }

function tickMoving(plats){ for(const p of plats){ if(!p.moving) continue; if(p.x0!==undefined){p.x+=p.vx;if(p.x<=p.x0||p.x+p.w>=p.x1)p.vx=-p.vx;} if(p.y0!==undefined){p.y+=p.vy;if(p.y<=p.y0||p.y>=p.y1)p.vy=-p.vy;} } }

function drawPlatform(p){
  const sx=p.x-cam.x, sy=p.y-cam.y;
  if(sx>W+80||sx+p.w<-80||sy>H+40||sy+p.h<-40) return;
  if(p.type==='spike'){ const nc=Math.max(1,Math.floor(p.w/20)); ctx.fillStyle='#403028'; for(let i=0;i<nc;i++){const tx=sx+i*(p.w/nc);ctx.beginPath();ctx.moveTo(tx,sy+p.h);ctx.lineTo(tx+p.w/nc/2,sy);ctx.lineTo(tx+p.w/nc,sy+p.h);ctx.fill();} return; }
  if(p.type==='water'){
    // Água cristalina do rio Arahura — gradiente azul-esverdeado
    const wg=ctx.createLinearGradient(0,sy,0,sy+p.h);
    wg.addColorStop(0,'rgba(60,140,180,0.7)'); wg.addColorStop(1,'rgba(20,60,90,0.92)');
    ctx.fillStyle=wg; ctx.fillRect(sx,sy,p.w,p.h);
    // Ondulações
    ctx.fillStyle='rgba(140,200,220,0.3)'; ctx.fillRect(sx,sy,p.w,5+Math.sin(Date.now()/1200+sx)*3);
    ctx.fillStyle='rgba(80,160,180,0.2)';
    for(let i=0;i<p.w;i+=24){ const wy=sy+8+Math.sin(Date.now()/800+(sx+i)*0.05)*2; ctx.fillRect(sx+i,wy,12,1); }
    return;
  }
  const ts=24,cols=Math.ceil(p.w/ts),rows=Math.ceil(p.h/ts);
  for(let r=0;r<rows;r++){ for(let c=0;c<cols;c++){
    const tx=sx+c*ts,ty=sy+r*ts,tw=Math.min(ts,sx+p.w-tx),th=Math.min(ts,sy+p.h-ty);
    ctx.fillStyle=r===0?tileTheme.body:(r%2===0?tileTheme.dark:tileTheme.body); ctx.fillRect(tx,ty,tw,th);
    ctx.fillStyle='rgba(0,0,0,0.08)'; ctx.fillRect(tx+tw-1,ty,1,th); ctx.fillRect(tx,ty+th-1,tw,1);
  } }
  ctx.fillStyle=tileTheme.top; ctx.fillRect(sx,sy,p.w,4);
  // Musgo no topo na cena 1 e 4
  if(G&&G.level&&(G.level.id===1||G.level.id===4)){
    ctx.fillStyle='rgba(60,120,40,0.5)';
    for(let i=0;i<p.w;i+=6){ const mh=2+Math.floor(Math.sin((p.x+i)*0.7)*2+2); ctx.fillRect(sx+i,sy,3,mh); }
  }
  if(p.moving){ ctx.fillStyle='rgba(40,180,120,0.35)'; ctx.fillRect(sx,sy,p.w,4); }
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
  // Novas
  toki_pounamu:     { cat:'ferramenta',nome:'Toki Pounamu',           icon:'🪓',fase:'6.3',desc:'Adze cerimonial Māori de pounamu.\nTanto ferramenta quanto instrumento de teste de dureza.\nFunde uso prático e significado espiritual.' },
  corda_harakeke:   { cat:'ferramenta',nome:'Corda de Harakeke',     icon:'🪢',fase:'6.3',desc:'Fibra de flaxo neozelandês entrançada.\nAmarrada ao tornozelo, conecta o mergulhador\na uma âncora na margem — impede que a\ncorrenteza do Arahura o arraste.' },
  mascara_kelp:     { cat:'ferramenta',nome:'Máscara de Kelp',       icon:'🥽',fase:'6.3',desc:'Lente primitiva de bull kelp esticada\nsobre osso. Permite visão subaquática:\ndistinguir cores de pedra no leito do rio.\nO kiwi a entrega — quem vê sem ver.' },
  // Minérios
  cobre_nativo:     { cat:'minerio', nome:'Cobre Nativo',     icon:'🟠',fase:'2.3',desc:'Tradição Anishinaabe.',multiple:true },
  cinabrio:         { cat:'minerio', nome:'Cinábrio (HgS)',   icon:'🔴',fase:'3.3',desc:'Sulfeto de mercúrio escarlate.',multiple:true },
  halita:           { cat:'minerio', nome:'Halita Saariana',  icon:'⬜',fase:'4.3',desc:'Sal de Taoudenni.',multiple:true },
  magnetita:        { cat:'minerio', nome:'Magnetita (Fe₃O₄)',icon:'⬛',fase:'5.3',desc:'Pedra que ama o ferro.',multiple:true },
  pounamu:          { cat:'minerio', nome:'Pounamu (Nefrita)',icon:'🟢',fase:'6.3',desc:'Jade verde Māori — Ca₂(Mg,Fe)₅Si₈O₂₂(OH)₂.\nMais tenaz que diamante. Variedades:\n• kawakawa — verde-escuro (folha)\n• kahurangi — verde pálido translúcido\n• inanga — verde-claro quase branco (a mais rara)',multiple:true },
  // Artefatos
  tumi_dourado:     { cat:'artefato',nome:'Tumi de Ouro Inca',icon:'🥇',fase:'1.3',desc:'Faca ritual Inca de ouro.' },
  frasco_mercurio:  { cat:'artefato',nome:'Frasco de Mercúrio',icon:'⚗️',fase:'3.3',desc:'10.000 km de Almadén a Potosí.' },
  manuscrito_item:  { cat:'artefato',nome:'Manuscrito de Timbuktu',icon:'📜',fase:'4.3',desc:'Mineralogia árabe-Māori.' },
  mengxi_bitan:     { cat:'artefato',nome:'Mengxi Bitan',icon:'📚',fase:'5.3',desc:'Dream Pool Essays — Shen Kuo.' },
  hei_tiki:         { cat:'artefato',nome:'Hei-Tiki de Pounamu',icon:'🗿',fase:'6.3',desc:'Pingente humano Māori de pounamu kawakawa.\nNão é decoração — é um ancestral preservado.\nOs nomes de todos que o usaram estão entalhados\nna borda. O artefato final do Guardião.' },
};
const TIPO_TO_JOURNAL={
  toki:'toki_pounamu', corda:'corda_harakeke', mascara:'mascara_kelp',
  pounamu:'pounamu', heitiki:'hei_tiki',
};

// ── Inventory (Diário de Bordo) ───────────────────────────────────
const INV={
  open:false,tab:0,cursor:0,
  TABS:[{id:'ferramenta',label:'🔧 Ferramentas',color:'#40c878'},{id:'minerio',label:'⛏ Minérios',color:'#20a050'},{id:'artefato',label:'🏺 Artefatos',color:'#60d090'}],
  tabItems(player){ const cat=this.TABS[this.tab].id; let col={};
    try{const s=localStorage.getItem('mineralis_save_v2');if(s){const j=JSON.parse(s);col=j.coletados||{};}}catch(e){}
    for(const tipo of player.items){const jid=TIPO_TO_JOURNAL[tipo]||tipo;col[jid]=true;}
    const pouN=player.items.filter(i=>i==='pounamu').length;
    const out=[]; for(const [id,def] of Object.entries(ITEM_DEFS)){ if(def.cat!==cat) continue;
      if(def.multiple){ if(id==='pounamu' && pouN>0) out.push({id,...def,count:pouN}); else if(col[id]&&id!=='pounamu') out.push({id,...def,count:typeof col[id]==='number'?col[id]:1}); }
      else if(col[id]) out.push({id,...def,count:1}); }
    if(window.ALL_ITEM_DEFS){ const idsLocais=new Set(Object.keys(ITEM_DEFS)); for(const [id,def] of Object.entries(window.ALL_ITEM_DEFS)){ if(def.cat!==cat||idsLocais.has(id))continue; const got=window.JournalStore?window.JournalStore.isCollected(id):!!col[id]; if(got)out.push({id,...def,count:1}); } }
    return out; },
  toggle(player){ this.open=!this.open; if(this.open)this.cursor=Math.min(this.cursor,Math.max(0,this.tabItems(player).length-1)); G.dialog=this.open; },
  close(){ this.open=false; G.dialog=false; },
  navigate(player){ if(!this.open)return false; if(jp['ArrowLeft']||jp['KeyA']){this.tab=(this.tab+2)%3;this.cursor=0;return true;} if(jp['ArrowRight']||jp['KeyD']){this.tab=(this.tab+1)%3;this.cursor=0;return true;} const items=this.tabItems(player); if(jp['ArrowUp']||jp['KeyW']){this.cursor=Math.max(0,this.cursor-1);return true;} if(jp['ArrowDown']||jp['KeyS']){this.cursor=Math.min(items.length-1,this.cursor+1);return true;} if(isE()&&items.length>0&&this.tab===0){const item=items[this.cursor];player.activeTool=(player.activeTool===item.id)?null:item.id;return true;} return false; },
  draw(player){
    if(!this.open)return;
    ctx.fillStyle='rgba(0,0,0,0.65)';ctx.fillRect(0,0,W,H);
    const PW=780,PH=480,PX=(W-PW)/2,PY=(H-PH)/2;
    ctx.shadowColor='rgba(0,0,0,0.7)';ctx.shadowBlur=20;ctx.fillStyle='rgba(0,4,2,0.97)';_rr(PX,PY,PW,PH,16);ctx.fill();ctx.shadowBlur=0;
    ctx.strokeStyle='#208050';ctx.lineWidth=2.5;_rr(PX,PY,PW,PH,16);ctx.stroke();
    ctx.fillStyle='#40c878';ctx.font='bold 16px "Courier New"';ctx.textAlign='center';ctx.fillText('📔  DIÁRIO DE BORDO',W/2,PY+28);ctx.textAlign='left';
    ctx.fillStyle='rgba(40,180,100,0.3)';ctx.fillRect(PX+16,PY+38,PW-32,1);
    const TAB_W=PW/3,TAB_Y=PY+44;
    this.TABS.forEach((tab,i)=>{ const tx=PX+i*TAB_W,active=(i===this.tab); ctx.fillStyle=active?'rgba(40,180,100,0.18)':'rgba(0,0,0,0.3)';ctx.fillRect(tx+2,TAB_Y,TAB_W-4,34); ctx.fillStyle=active?tab.color:'#666';ctx.font=(active?'bold ':'')+'13px "Courier New"';ctx.textAlign='center';ctx.fillText(tab.label,tx+TAB_W/2,TAB_Y+22);ctx.textAlign='left'; if(active){ctx.fillStyle=tab.color;ctx.fillRect(tx+2,TAB_Y+32,TAB_W-4,3);} });
    const CY=TAB_Y+40,CH=PH-(CY-PY)-50,items=this.tabItems(player),COL_W=260,DESC_X=PX+280;
    if(items.length===0){ ctx.fillStyle='#445';ctx.font='14px "Courier New"';ctx.textAlign='center';ctx.fillText('Nenhum item coletado ainda.',W/2,CY+CH/2);ctx.textAlign='left'; }
    else { const ROW_H=52,maxRows=Math.max(1,Math.floor(CH/ROW_H));
      const scrollTop=items.length>maxRows?Math.max(0,Math.min(this.cursor-maxRows+1,items.length-maxRows)):0;
      const visible=items.slice(scrollTop,scrollTop+maxRows);
      visible.forEach((item,vi)=>{ const i=scrollTop+vi; const iy=CY+16+vi*ROW_H,sel=(i===this.cursor),eq=(player.activeTool===item.id); if(sel){ctx.fillStyle='rgba(40,180,100,0.18)';_rr(PX+16,iy-10,COL_W,46,8);ctx.fill();ctx.strokeStyle='#40c878';ctx.lineWidth=1.5;_rr(PX+16,iy-10,COL_W,46,8);ctx.stroke();} const cnt=item.count>1?' ×'+item.count:''; ctx.font='20px serif';ctx.fillText(item.icon,PX+28,iy+20); ctx.font=(eq?'bold ':'')+'14px "Courier New"';ctx.fillStyle=eq?'#ffe060':(sel?'#f0e8c0':'#aaa');ctx.fillText(item.nome+cnt,PX+62,iy+14); });
      if(scrollTop>0){ctx.fillStyle='#40c878';ctx.font='12px "Courier New"';ctx.textAlign='center';ctx.fillText('▲ mais',PX+16+COL_W/2,CY+6);ctx.textAlign='left';}
      if(scrollTop+maxRows<items.length){ctx.fillStyle='#40c878';ctx.font='12px "Courier New"';ctx.textAlign='center';ctx.fillText('▼ mais',PX+16+COL_W/2,CY+16+maxRows*ROW_H+2);ctx.textAlign='left';}
      const sel=items[this.cursor]; if(sel){ ctx.fillStyle='rgba(40,180,100,0.08)';_rr(DESC_X,CY,PW-DESC_X+PX-16,CH-10,8);ctx.fill(); ctx.font='44px serif';ctx.textAlign='center';ctx.fillText(sel.icon,DESC_X+(PW-DESC_X+PX-16)/2,CY+68); ctx.font='bold 15px "Courier New"';ctx.fillStyle='#40c878';ctx.fillText(sel.nome,DESC_X+(PW-DESC_X+PX-16)/2,CY+98); const catL={ferramenta:'🔧 Ferramenta',minerio:'⛏ Minério',artefato:'🏺 Artefato'}; ctx.font='11px "Courier New"';ctx.fillStyle='#888';ctx.fillText(catL[sel.cat],DESC_X+(PW-DESC_X+PX-16)/2,CY+116);ctx.textAlign='left';ctx.fillStyle='rgba(40,180,100,0.25)';ctx.fillRect(DESC_X+20,CY+124,PW-DESC_X+PX-56,1); const descLines=sel.desc.split('\n');ctx.font='13px "Courier New"';ctx.fillStyle='#f0e8c0';descLines.forEach((l,i)=>{ctx.textAlign='center';ctx.fillText(l,DESC_X+(PW-DESC_X+PX-16)/2,CY+144+i*22);});ctx.textAlign='left';
        if(sel.cat==='ferramenta'){ const btnTxt=player.activeTool===sel.id?'[E] Desequipar':'[E] Equipar'; ctx.fillStyle=player.activeTool===sel.id?'rgba(180,80,20,0.3)':'rgba(40,180,100,0.2)';_rr(DESC_X+40,CY+CH-60,PW-DESC_X+PX-96,34,8);ctx.fill();ctx.strokeStyle=player.activeTool===sel.id?'#c04020':'#40c878';ctx.lineWidth=1.5;_rr(DESC_X+40,CY+CH-60,PW-DESC_X+PX-96,34,8);ctx.stroke(); ctx.font='bold 13px "Courier New"';ctx.fillStyle=player.activeTool===sel.id?'#e06040':'#40c878';ctx.textAlign='center';ctx.fillText(btnTxt,DESC_X+(PW-DESC_X+PX-16)/2,CY+CH-38);ctx.textAlign='left'; } } }
    ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(PX,PY+PH-38,PW,38);ctx.fillStyle='rgba(40,180,100,0.3)';ctx.fillRect(PX+16,PY+PH-39,PW-32,1);ctx.font='11px "Courier New"';ctx.fillStyle='#888';ctx.textAlign='center';ctx.fillText('◀ ▶ Abas   ↑ ↓ Navegar   E Equipar/Desequipar   I Fechar',W/2,PY+PH-14);ctx.textAlign='left';
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
    ctx.shadowColor='rgba(0,0,0,0.6)';ctx.shadowBlur=12; ctx.fillStyle='rgba(0,4,2,0.95)';roundRect(bx,by,bubW,bubH,14);ctx.fill();ctx.shadowBlur=0;
    ctx.strokeStyle='#208050';ctx.lineWidth=2.5;roundRect(bx,by,bubW,bubH,14);ctx.stroke();
    const tailBaseX=Math.max(bx+30,Math.min(pcx,bx+bubW-30)),tailTopY=by+bubH,tailTipX=pcx,tailTipY=Math.min(pcy,tailTopY+36);
    ctx.fillStyle='rgba(0,4,2,0.95)'; ctx.beginPath();ctx.moveTo(tailBaseX-14,tailTopY);ctx.lineTo(tailBaseX+14,tailTopY);ctx.lineTo(tailTipX,tailTipY);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#208050';ctx.lineWidth=2; ctx.beginPath();ctx.moveTo(tailBaseX-14,tailTopY);ctx.lineTo(tailTipX,tailTipY);ctx.lineTo(tailBaseX+14,tailTopY);ctx.stroke();
    const fx=bx+pad,fy=by+pad;
    CORVAN.drawFace(ctx, this.faceFrame, fx, fy, faceW, faceH);
    ctx.strokeStyle='rgba(40,180,100,0.5)';ctx.lineWidth=1.5;ctx.strokeRect(fx,fy,faceW,faceH);
    const tx=fx+faceW+pad; ctx.font=NAMEFNT;ctx.fillStyle='#40c878';ctx.fillText(this.speakerTxt,tx,by+pad+14);
    ctx.fillStyle='rgba(40,180,100,0.35)';ctx.fillRect(tx,by+pad+20,textAreaW,1);
    ctx.font=FONT;ctx.fillStyle='#f0e8c0';this.lines.forEach((l,i)=>ctx.fillText(l,tx,by+pad+36+i*lineH));
    const pulse=0.55+Math.sin(Date.now()/400)*0.45; ctx.fillStyle=`rgba(40,180,100,${pulse})`;ctx.font='12px "Courier New"';ctx.textAlign='right';ctx.fillText('[E] Continuar →',bx+bubW-pad,by+bubH-8);ctx.textAlign='left';
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
  ctx.fillStyle='rgba(0,0,0,0.82)';roundRect(nx,ny,tw,28,6);ctx.fill();ctx.strokeStyle='#40c878';ctx.lineWidth=1.5;roundRect(nx,ny,tw,28,6);ctx.stroke();
  ctx.fillStyle='#40c878';ctx.textAlign='center';ctx.fillText(notifText,W/2,ny+19);ctx.textAlign='left';ctx.restore();
}

// ── Pop-up informativo ────────────────────────────────────────────
const POPUP={ active:false,title:'',lines:[],icon:'🟢',timer:0,
  show(title,icon,text,duration=8000){this.active=true;this.title=title;this.icon=icon;this.lines=text.split('\n');this.timer=duration;},
  tick(){if(this.timer>0){this.timer-=16;if(this.timer<=0)this.active=false;}},
  draw(){ if(!this.active)return; const alpha=Math.min(1,this.timer/400); const PW=370,PH=this.lines.length*20+100,PX=W-PW-20,PY=60;
    ctx.save();ctx.globalAlpha=alpha; ctx.fillStyle='rgba(0,4,2,0.94)';_rr(PX,PY,PW,PH,12);ctx.fill();ctx.strokeStyle='#208050';ctx.lineWidth=2;_rr(PX,PY,PW,PH,12);ctx.stroke();
    ctx.font='32px serif';ctx.textAlign='center';ctx.fillText(this.icon,PX+40,PY+46); ctx.font='bold 13px "Courier New"';ctx.fillStyle='#40c878';ctx.fillText(this.title,PX+60,PY+28);
    ctx.font='12px "Courier New"';ctx.fillStyle='#f0e8c0';ctx.textAlign='left';this.lines.forEach((l,i)=>ctx.fillText(l,PX+16,PY+52+i*20));ctx.restore(); }
};

// ── Seixo Subaquático (Cena 3 — busca em mergulho) ────────────────
class RiverSeixo {
  constructor(x,y,type){
    this.x=x; this.y=y; this.w=36; this.h=24;
    this.type=type;        // 'pounamu' | 'serpentina' | 'granito'
    this.variant=null;     // se pounamu: 'kawakawa' | 'kahurangi' | 'inanga'
    if(type==='pounamu'){
      this.variant = ['kawakawa','kahurangi','inanga'][Math.floor(Math.random()*3)];
    }
    this.touched=false;    // tocou (revelou som)
    this.tested=false;     // testou com toki
    this.done=false;       // coletado
    this.t=Math.random()*Math.PI*2;
  }
  tick(){ this.t+=0.04; }
  get color(){
    if(this.type==='granito') return '#5a5a62';
    if(this.type==='serpentina') return '#608060';
    // pounamu
    if(this.variant==='kawakawa') return '#1a5028';
    if(this.variant==='kahurangi') return '#508870';
    return '#a8d0b0'; // inanga
  }
  get colorLight(){
    if(this.type==='granito') return '#7a7a82';
    if(this.type==='serpentina') return '#7ea080';
    if(this.variant==='kawakawa') return '#2a6038';
    if(this.variant==='kahurangi') return '#70a890';
    return '#c8e0c8';
  }
  draw(){
    if(this.done) return;
    const sx=this.x-cam.x, sy=this.y-cam.y+Math.sin(this.t)*1.5;
    if(sx<-60||sx>W+60) return;
    ctx.save(); ctx.translate(sx,sy);
    // Seixo ovalado
    ctx.fillStyle=this.color;
    ctx.beginPath(); ctx.ellipse(this.w/2,this.h/2,this.w/2,this.h/2,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=this.colorLight;
    ctx.beginPath(); ctx.ellipse(this.w/2-4,this.h/2-3,this.w/2-6,this.h/2-4,0,0,Math.PI*2); ctx.fill();
    // Brilho translúcido se pounamu
    if(this.type==='pounamu'){
      const sh=0.5+Math.sin(this.t*1.5)*0.3;
      ctx.fillStyle=`rgba(180,240,200,${sh*0.4})`;
      ctx.beginPath(); ctx.ellipse(this.w/2-2,this.h/2-4,4,2,0,0,Math.PI*2); ctx.fill();
    }
    // Indicador
    if(!this.touched){
      const pulse=0.5+Math.sin(this.t*2)*0.5;
      ctx.fillStyle=`rgba(120,220,180,${pulse})`;
      ctx.font='bold 9px "Courier New"'; ctx.textAlign='center';
      ctx.fillText('[E] Tocar',this.w/2,-6); ctx.textAlign='left';
    } else if(this.tested && this.type==='pounamu'){
      const pulse=0.4+Math.sin(this.t*2)*0.3;
      ctx.fillStyle=`rgba(120,255,180,${pulse})`;
      ctx.font='bold 9px "Courier New"'; ctx.textAlign='center';
      ctx.fillText('✓ POUNAMU — [E] coletar',this.w/2,-6); ctx.textAlign='left';
    } else if(this.tested && this.type==='serpentina'){
      ctx.font='bold 9px "Courier New"'; ctx.fillStyle='#808060'; ctx.textAlign='center';
      ctx.fillText('— serpentinita',this.w/2,-6); ctx.textAlign='left';
    } else if(this.tested && this.type==='granito'){
      ctx.font='bold 9px "Courier New"'; ctx.fillStyle='#707080'; ctx.textAlign='center';
      ctx.fillText('— granito',this.w/2,-6); ctx.textAlign='left';
    } else if(this.type==='pounamu'){
      // touched but not tested — pounamu candidate
      ctx.font='bold 9px "Courier New"'; ctx.fillStyle='#a0e0c0'; ctx.textAlign='center';
      ctx.fillText('🎵 Suba e teste com 🪓',this.w/2,-6); ctx.textAlign='left';
    } else {
      // touched but not tested — granite or serpentine (probably not pounamu)
      ctx.font='bold 9px "Courier New"'; ctx.fillStyle='#808088'; ctx.textAlign='center';
      ctx.fillText('? Som comum',this.w/2,-6); ctx.textAlign='left';
    }
    ctx.restore();
  }
}

// ── Kiwi companion (noturno, guia sonoro) ────────────────────────
class Kiwi {
  constructor(){
    this.x=400; this.y=400; this.targetX=400; this.targetY=400;
    this.frame=0; this.sparkT=0; this.sparks=[];
    this.visible=false; this.state='hidden'; // 'hidden' | 'emerge' | 'guide' | 'landed'
    this.lastCallTime=0;
  }
  update(player){
    this.frame+=0.06; this.sparkT++;
    if(this.state==='guide'){
      // O kiwi anda à frente do player
      const dx=this.targetX-this.x, dy=this.targetY-this.y;
      this.x+=dx*0.04; this.y+=dy*0.04;
      // Som intermitente de kiwi
      if(Date.now()-this.lastCallTime > 4000){ sfx('kiwi'); this.lastCallTime=Date.now(); }
    } else if(this.state==='landed'){
      this.x+=(this.targetX-this.x)*0.06; this.y+=(this.targetY-this.y)*0.06;
    }
    if(this.sparkT%24===0 && (this.state==='guide'||this.state==='landed')){
      this.sparks.push({x:this.x,y:this.y,vx:(Math.random()-.5)*.3,vy:(Math.random()+.2)*.3,life:60,max:60,size:1.5+Math.random()*1.5});
    }
    for(let i=this.sparks.length-1;i>=0;i--){const s=this.sparks[i];s.x+=s.vx;s.y+=s.vy;s.life--;if(s.life<=0)this.sparks.splice(i,1);}
  }
  emerge(x,y){ this.state='guide'; this.x=x; this.y=y; this.targetX=x; this.targetY=y; this.visible=true; }
  setGuide(x,y){ this.targetX=x; this.targetY=y; }
  land(x,y){ this.state='landed'; this.targetX=x; this.targetY=y; }
  draw(){
    if(!this.visible) return;
    for(const s of this.sparks){ ctx.save();ctx.globalAlpha=(s.life/s.max)*0.4;ctx.fillStyle='#80c860';ctx.beginPath();ctx.arc(s.x-cam.x,s.y-cam.y,s.size*(s.life/s.max),0,Math.PI*2);ctx.fill();ctx.restore(); }
    const sx=this.x-cam.x, sy=this.y-cam.y;
    if(sx<-80||sx>W+80) return;
    ctx.save();
    // Glow leve em volta do kiwi
    const glow=ctx.createRadialGradient(sx,sy,0,sx,sy,40);
    glow.addColorStop(0,'rgba(140,200,80,0.18)'); glow.addColorStop(1,'rgba(140,200,80,0)');
    ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(sx,sy,40,0,Math.PI*2); ctx.fill();
    if(IMG['kiwi_img']&&IMG['kiwi_img'].complete&&IMG['kiwi_img'].naturalWidth>0){
      const dw=80, dh=80; const bob=Math.sin(this.frame*1.8)*4;
      ctx.translate(sx-dw/2, sy-dh/2+bob);
      ctx.drawImage(IMG['kiwi_img'],0,0,96,96,0,0,dw,dh);
    } else {
      // Fallback vetorial — kiwi sem asas, redondo, com bico longo
      ctx.translate(sx,sy);
      const bob=Math.sin(this.frame*1.8)*3;
      ctx.fillStyle='#5a3818'; // marrom escuro de penas
      ctx.beginPath(); ctx.ellipse(0,bob,22,16,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#704828'; ctx.beginPath(); ctx.ellipse(-2,bob-3,18,12,0,0,Math.PI*2); ctx.fill();
      // Bico longo
      ctx.fillStyle='#e8c890'; ctx.fillRect(14,bob-2,18,3);
      ctx.fillStyle='#c8a070'; ctx.fillRect(14,bob+1,18,2);
      // Olho pequeno
      ctx.fillStyle='#1a1010'; ctx.beginPath(); ctx.arc(8,bob-4,2,0,Math.PI*2); ctx.fill();
      // Pernas curtas
      ctx.fillStyle='#4a2810'; ctx.fillRect(-6,bob+12,3,8); ctx.fillRect(4,bob+12,3,8);
    }
    ctx.restore();
  }
}

// ── Mapa-Múndi Final (animação da Cena 4) ────────────────────────
class WorldMap {
  constructor(){
    this.active=false;
    this.startTime=0;
    // 18 estrelas — uma por fase Mineralis
    this.stars=[
      // 6 regiões × 3 fases (1.1, 1.2, 1.3, 2.1...) representadas
      {x:0.30, y:0.62, label:'Potosí', t:0.5},                    // Andes 1.1
      {x:0.28, y:0.58, label:'Machu Picchu', t:1.0},
      {x:0.32, y:0.55, label:'Serra Pelada', t:1.5},
      {x:0.18, y:0.48, label:'Califórnia', t:2.0},                // Am. Norte 2.x
      {x:0.22, y:0.45, label:'Apalaches', t:2.5},
      {x:0.20, y:0.42, label:'Lago Superior', t:3.0},
      {x:0.50, y:0.32, label:'Wieliczka', t:3.5},                 // Europa 3.x
      {x:0.48, y:0.28, label:'Escandinávia', t:4.0},
      {x:0.49, y:0.40, label:'Almadén', t:4.5},
      {x:0.55, y:0.65, label:'Kimberley', t:5.0},                 // África 4.x
      {x:0.58, y:0.58, label:'Grande Zimbabué', t:5.5},
      {x:0.52, y:0.42, label:'Timbuktu', t:6.0},
      {x:0.74, y:0.46, label:'Mianmar', t:6.5},                   // Ásia 5.x
      {x:0.68, y:0.38, label:'Badakhshan', t:7.0},
      {x:0.78, y:0.40, label:'Jiangxi', t:7.5},
      {x:0.88, y:0.72, label:'Lightning Ridge', t:8.0},           // Oceania 6.x
      {x:0.94, y:0.62, label:'Talasea', t:8.5},
      {x:0.90, y:0.78, label:'Arahura', t:9.0, final:true},       // ESTA fase
    ];
  }
  activate(){ this.active=true; this.startTime=Date.now(); sfx('putorino'); }
  draw(){
    if(!this.active) return;
    const elapsed=(Date.now()-this.startTime)/1000;
    // Fundo escuro
    ctx.fillStyle='rgba(0,0,0,0.92)'; ctx.fillRect(0,0,W,H);
    // Mapa-múndi estilizado (continentes simples)
    const MX=80, MY=80, MW=W-160, MH=H-200;
    ctx.fillStyle='rgba(20,40,30,0.6)'; ctx.fillRect(MX,MY,MW,MH);
    ctx.strokeStyle='#206040'; ctx.lineWidth=2; ctx.strokeRect(MX,MY,MW,MH);
    // Continentes (silhuetas grosseiras)
    ctx.fillStyle='rgba(60,90,50,0.55)';
    // América
    ctx.beginPath(); ctx.moveTo(MX+MW*0.16,MY+MH*0.30); ctx.lineTo(MX+MW*0.24,MY+MH*0.20); ctx.lineTo(MX+MW*0.30,MY+MH*0.32); ctx.lineTo(MX+MW*0.30,MY+MH*0.55); ctx.lineTo(MX+MW*0.36,MY+MH*0.65); ctx.lineTo(MX+MW*0.32,MY+MH*0.85); ctx.lineTo(MX+MW*0.26,MY+MH*0.75); ctx.lineTo(MX+MW*0.22,MY+MH*0.55); ctx.lineTo(MX+MW*0.14,MY+MH*0.42); ctx.closePath(); ctx.fill();
    // Europa/África
    ctx.beginPath(); ctx.moveTo(MX+MW*0.46,MY+MH*0.22); ctx.lineTo(MX+MW*0.56,MY+MH*0.20); ctx.lineTo(MX+MW*0.60,MY+MH*0.36); ctx.lineTo(MX+MW*0.58,MY+MH*0.62); ctx.lineTo(MX+MW*0.52,MY+MH*0.78); ctx.lineTo(MX+MW*0.46,MY+MH*0.74); ctx.lineTo(MX+MW*0.46,MY+MH*0.46); ctx.closePath(); ctx.fill();
    // Ásia
    ctx.beginPath(); ctx.moveTo(MX+MW*0.60,MY+MH*0.20); ctx.lineTo(MX+MW*0.86,MY+MH*0.22); ctx.lineTo(MX+MW*0.84,MY+MH*0.50); ctx.lineTo(MX+MW*0.78,MY+MH*0.52); ctx.lineTo(MX+MW*0.66,MY+MH*0.48); ctx.lineTo(MX+MW*0.60,MY+MH*0.42); ctx.closePath(); ctx.fill();
    // Oceania
    ctx.beginPath(); ctx.moveTo(MX+MW*0.84,MY+MH*0.66); ctx.lineTo(MX+MW*0.94,MY+MH*0.64); ctx.lineTo(MX+MW*0.95,MY+MH*0.74); ctx.lineTo(MX+MW*0.86,MY+MH*0.76); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.ellipse(MX+MW*0.90,MY+MH*0.82,16,8,0.3,0,Math.PI*2); ctx.fill();
    // Estrelas — acendem conforme tempo
    for(const s of this.stars){
      if(elapsed < s.t) continue;
      const sx=MX+MW*s.x, sy=MY+MH*s.y;
      const age=elapsed-s.t;
      const sz=s.final ? 8 : 5;
      const pulse=0.7+Math.sin(elapsed*2+s.x*10)*0.3;
      // Glow
      const glow=ctx.createRadialGradient(sx,sy,0,sx,sy,20);
      glow.addColorStop(0,s.final?'rgba(120,255,180,0.9)':`rgba(255,230,140,${pulse*0.6})`);
      glow.addColorStop(1,'rgba(255,230,140,0)');
      ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(sx,sy,20,0,Math.PI*2); ctx.fill();
      // Estrela
      ctx.fillStyle=s.final?'#80ffc0':'#ffe890';
      ctx.beginPath(); ctx.arc(sx,sy,sz*pulse,0,Math.PI*2); ctx.fill();
      // Cruz brilhante
      ctx.strokeStyle=s.final?'#c0ffd8':'#fff8c0'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(sx-sz*2,sy); ctx.lineTo(sx+sz*2,sy); ctx.moveTo(sx,sy-sz*2); ctx.lineTo(sx,sy+sz*2); ctx.stroke();
      // Label (apenas para nova estrela acesa há <2s)
      if(age<2 || s.final){
        ctx.font=(s.final?'bold ':'')+'11px "Courier New"';
        ctx.fillStyle=s.final?'rgba(192,255,216,'+Math.min(1,age*2)+')':`rgba(248,232,160,${Math.max(0,1-age*0.5)})`;
        ctx.textAlign='center'; ctx.fillText(s.label, sx, sy-14); ctx.textAlign='left';
      }
    }
    // Título e contagem
    ctx.font='bold 22px "Courier New"'; ctx.fillStyle='#80ffc0'; ctx.textAlign='center';
    ctx.fillText('MINERALIS — MAPA-MÚNDI DAS MINAS VISITADAS', W/2, H-100);
    const lit=this.stars.filter(s=>elapsed>=s.t).length;
    ctx.font='14px "Courier New"'; ctx.fillStyle='#c0e0c0';
    ctx.fillText(`${lit} / ${this.stars.length} minas iluminadas — ${lit===this.stars.length?'Jornada completa.':'aguarde...'}`,W/2,H-72);
    if(elapsed > this.stars[this.stars.length-1].t + 4){
      const pulse=0.6+Math.sin(Date.now()/500)*0.4;
      ctx.font='15px "Courier New"'; ctx.fillStyle=`rgba(120,255,180,${pulse})`;
      ctx.fillText('▶ [ENTER] Continuar — Modo Guardião ◀', W/2, H-44);
    }
    ctx.textAlign='left';
  }
  ready(){ return this.active && (Date.now()-this.startTime)/1000 > this.stars[this.stars.length-1].t + 4; }
}

// ── Trigger ───────────────────────────────────────────────────────
class Trigger{
  constructor(x,y,w,h,label,fn){this.x=x;this.y=y;this.w=w;this.h=h;this.label=label;this.fn=fn;this.done=false;}
  draw(px,py){ if(this.done)return; const near=Math.abs((px+24)-(this.x+this.w/2))<this.w/2+72&&Math.abs((py+40)-(this.y+this.h/2))<this.h/2+72; if(!near)return; const sx=this.x+this.w/2-cam.x; let sy=this.y-cam.y-26+Math.sin(Date.now()/350)*4; const headY=py-cam.y-8; sy=Math.min(sy,headY); const txt='[E] '+this.label;ctx.font='14px "Courier New"';const tw=ctx.measureText(txt).width+24; ctx.fillStyle='rgba(0,0,0,0.78)';roundRect(sx-tw/2,sy-16,tw,24,4);ctx.fill();ctx.strokeStyle='#40c878';ctx.lineWidth=1.5;roundRect(sx-tw/2,sy-16,tw,24,4);ctx.stroke();ctx.fillStyle='#40c878';ctx.textAlign='center';ctx.fillText(txt,sx,sy);ctx.textAlign='left'; }
}

// ── Col (itens flutuantes) ────────────────────────────────────────
class Col{
  constructor(x,y,type){this.x=x;this.y=y;this.w=30;this.h=30;this.type=type;this.done=false;this.t=Math.random()*Math.PI*2;}
  tick(){if(!this.done)this.t+=0.06;}
  draw(){
    if(this.done) return;
    const sx=this.x-cam.x, sy=this.y-cam.y+Math.sin(this.t)*5; if(sx<-50||sx>W+50) return;
    ctx.save(); ctx.translate(sx+15, sy+15);
    if(this.type==='toki'){
      if(IMG['toki_img']) ctx.drawImage(IMG['toki_img'],0,0,48,48,-15,-15,30,30);
      else{ ctx.fillStyle='#1a5028';ctx.fillRect(-12,-8,24,8); ctx.fillStyle='#7a4820';ctx.fillRect(-2,0,4,16); }
    } else if(this.type==='corda'){
      if(IMG['corda_img']) ctx.drawImage(IMG['corda_img'],0,0,48,48,-15,-15,30,30);
      else{ ctx.strokeStyle='#a08050';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,10,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(0,0,7,0,Math.PI*2);ctx.stroke(); }
    } else if(this.type==='mascara'){
      if(IMG['mascara_img']) ctx.drawImage(IMG['mascara_img'],0,0,48,48,-15,-15,30,30);
      else{ ctx.fillStyle='#3a4830';ctx.fillRect(-12,-6,24,12); ctx.fillStyle='#80a0b0';ctx.fillRect(-10,-4,8,8); ctx.fillRect(2,-4,8,8); }
    } else if(this.type==='heitiki'){
      if(IMG['heitiki_img']) ctx.drawImage(IMG['heitiki_img'],0,0,48,48,-15,-15,30,30);
      else{ ctx.fillStyle='#1a5028';ctx.beginPath();ctx.arc(0,-8,6,0,Math.PI*2);ctx.fill(); ctx.fillStyle='#2a6038';ctx.fillRect(-6,-2,12,12); }
    }
    ctx.restore();
  }
}

// ── Player ────────────────────────────────────────────────────────
class Player{
  constructor(x,y){ this.x=x;this.y=y;this.w=40;this.h=80; this.vx=0;this.vy=0;this.onG=false;this.facing=1; this.hp=3;this.maxHp=3;this.inv=0;this.dead=false; this.activeTool=null;this.frame=0;this.ft=0;this.state='idle'; this.coyote=0;this.jbuf=0;this.onMoving=null; this.items=[];this.score=0;this.interactAnim=0;
    // Submersão / fôlego
    this.swimming=false;
    this.breath=100;     // 0–100, 100 = cheio
    this.lastHeartbeat=0;
    this.candidateSeixo=null; // seixo "carregado" para teste fora d'água
  }
  overlaps(r){return this.x<r.x+r.w&&this.x+this.w>r.x&&this.y<r.y+r.h&&this.y+this.h>r.y;}
  near(r,d=80){return Math.abs(this.x+20-(r.x+r.w/2))<r.w/2+d&&Math.abs(this.y+40-(r.y+r.h/2))<r.h/2+d;}
  update(level){
    if(G.dialog) return;
    if(this.swimming){
      // ── Movimento subaquático livre (8 direções) ─────────────
      if(isL()){this.vx=-SWIM_SPD;this.facing=-1;} else if(isR()){this.vx=SWIM_SPD;this.facing=1;} else this.vx*=0.85;
      if(isU()) this.vy=-SWIM_SPD; else if(isD()) this.vy=SWIM_SPD; else this.vy*=0.85;
      this.x+=this.vx; this.y+=this.vy;
      // Mantém dentro dos limites
      this.x=Math.max(0,Math.min(level.W-this.w,this.x));
      // Correnteza puxa levemente para a direita
      this.x += 0.4;
      // Limite vertical: pode emergir se tocar superfície
      if(level.waterTop && this.y < level.waterTop - this.h*0.5){
        // Player saiu da água
        this.swimming=false; this.y=level.waterTop - this.h;
        this.vx=0; this.vy=0; // FIX: reset momentum on emerge
        sfx('splash'); notify('🌬️ Você emergiu! Pressione [E] em um seixo carregado para testar com 🪓 Toki.');
      }
      // Fôlego consome
      this.breath -= 0.18;
      if(this.breath <= 75 && Date.now()-this.lastHeartbeat > 1200){ sfx('heartbeat'); this.lastHeartbeat=Date.now(); }
      if(this.breath <= 40 && Date.now()-this.lastHeartbeat > 700){ sfx('heartbeat'); this.lastHeartbeat=Date.now(); }
      // Bolhas
      if(Math.random()<0.05) bubbleBurst(this.x+this.w/2,this.y+10,2);
      // Sem fôlego — sobe automaticamente
      if(this.breath<=0){
        this.swimming=false; this.y = (level.waterTop||100)-this.h;
        this.vx=0; this.vy=0; // FIX: reset momentum
        this.breath=15; sfx('splash');
        notify('💨 Sem fôlego! Você subiu automaticamente.');
      }
      // Estado de animação
      this.state='walk'; // usa walk para tela
      const spd=4; if(++this.ft>=spd){this.ft=0;this.frame=(this.frame+1)%6;}
      // Interação com seixos subaquáticos
      if(level.seixos && isE()){
        let closest=null, closestDist=Infinity;
        for(const sx of level.seixos){
          if(sx.done) continue;
          const d=Math.hypot((this.x+this.w/2)-(sx.x+sx.w/2), (this.y+this.h/2)-(sx.y+sx.h/2));
          if(d<closestDist){closestDist=d;closest=sx;}
        }
        if(closest && closestDist<48){
          if(!closest.touched){
            closest.touched=true;
            if(closest.type==='granito') sfx('granito');
            else if(closest.type==='serpentina') sfx('serpentina');
            else sfx('pounamu_water');
            const msg = closest.type==='pounamu' ? '🎵 Ressonância musical! Suba e teste!' :
                        closest.type==='serpentina' ? '~ Som suave, ligeiramente cedente.' : '× Tonk surdo — granito comum.';
            notify(msg);
          } else if(closest.tested && closest.type==='pounamu'){
            // Coletar pounamu subaquático
            closest.done=true;
            this.score+=15; this.items.push('pounamu'); sfx('pounamu');
            burst(closest.x+18,closest.y+12,'#80ffc0',12);
            _journalColetar('pounamu', this.items.filter(i=>i==='pounamu').length);
            const variant=closest.variant;
            notify(`🟢 Pounamu ${variant} coletado! (${this.items.filter(i=>i==='pounamu').length}/3)`);
            if(this.items.filter(i=>i==='pounamu').length===1){
              POPUP.show('Pounamu (Nefrita)','🟢',`Variedade: ${variant}\nMais tenaz que diamante na fratura.\nProtegido pela Ngāi Tahu Claims Settlement (1997):\nsó os Ngāi Tahu podem extrair pounamu hoje.`,7500);
            }
          } else if(!closest.tested){
            // "Pegar" como candidato (vai testar fora d'água)
            this.candidateSeixo=closest;
            notify('🤲 Seixo carregado. Suba à superfície e [E] para testar com Toki.');
          }
        }
      }
      return;
    }
    // ── Movimento normal (superfície / fora d'água) ─────────────
    if(isL()){this.vx=-PSPD;this.facing=-1;}else if(isR()){this.vx=PSPD;this.facing=1;}else this.vx*=0.7;
    if(this.onG)this.coyote=8;else if(this.coyote>0)this.coyote--;
    if(isJ())this.jbuf=10; if(this.jbuf>0)this.jbuf--;
    if(this.jbuf>0&&(this.onG||this.coyote>0)){this.vy=JUMPF;this.onG=false;this.coyote=0;this.jbuf=0;sfx('jump');}
    if(this.onMoving){this.x+=this.onMoving.vx||0;this.y+=this.onMoving.vy||0;} this.onMoving=null;
    this.vy=Math.min(this.vy+GRAV,MAXFALL); this.x+=this.vx;this._colX(level.plats);
    this.onG=false;this.y+=this.vy;this._colY(level.plats); this.x=Math.max(0,this.x);
    // Recuperar fôlego fora d'água
    if(this.breath < 100) this.breath = Math.min(100, this.breath + 0.6);
    // Entrar na água (apenas Cena 3 tem waterTop e seixos)
    if(level.waterTop && this.y + this.h > level.waterTop && this.items.includes('mascara') && this.items.includes('corda')){
      if(isD() || this.vy>3){
        this.swimming=true; sfx('splash');
        notify('🌊 Você mergulhou! ↑↓←→ para nadar. Encontre o pounamu pelo som.');
      }
    }
    // Testar candidate com toki na superfície
    if(this.candidateSeixo && isE() && this.items.includes('toki')){
      const seixo=this.candidateSeixo; seixo.tested=true;
      if(seixo.type==='pounamu'){
        sfx('toki_ok'); notify('🪓 Toki não deixou risco — POUNAMU CONFIRMADO! Mergulhe e colete.');
        POPUP.show('Toki Confirmou Pounamu','✓','Pounamu (Mohs 6–6.5) tem mesma dureza\nque o toki. Nenhum risco = pounamu verdadeiro.\nVolte ao seixo no leito e [E] para coletar.',5500);
      } else if(seixo.type==='serpentina'){
        sfx('toki_streak'); notify('~ Risco visível — serpentinita (Mohs 3–4). Não é pounamu.');
      } else {
        sfx('toki_streak'); notify('× Granito comum. Continue procurando.');
      }
      this.candidateSeixo=null;
    }
    if(!this.inv){ for(const p of level.plats) if(p.type==='spike'&&this.overlaps(p))this._hurt(1,level); }
    if(this.inv>0)this.inv--;
    if(this.interactAnim>0)this.interactAnim--;
    // Coletáveis (itens flutuantes)
    for(const c of level.cols){
      if(!c.done&&this.overlaps(c)){
        c.done=true;
        if(c.type==='heitiki'){
          this.items.push('heitiki'); sfx('putorino'); _journalColetar('heitiki');
          burst(c.x+15,c.y+15,'#80ffc0',16);
          notify('🗿 Hei-Tiki adquirido — artefato final da jornada!');
        } else {
          this.items.push(c.type); sfx('item'); _journalColetar(c.type);
          burst(c.x+15,c.y+15,'#40c878',10);
          if(c.type==='toki')    notify('🪓 Toki Pounamu coletado!');
          if(c.type==='corda')   notify('🪢 Corda de Harakeke coletada!');
          if(c.type==='mascara') notify('🥽 Máscara de Kelp recebida!');
        }
      }
    }
    // Triggers
    if(isE()&&this.onG){for(const t of level.triggers){if(!t.done&&this.near(t)){t.fn(this,level);break;}}}
    if(this.y>level.H+200)this._hurt(3,level);
    if(!this.onG&&this.vy<0)this.state='jump';else if(!this.onG&&this.vy>0)this.state='fall';else if(Math.abs(this.vx)>0.5)this.state='run';else this.state='idle';
    const spd=this.state==='run'?6:this.state==='idle'?18:8; if(++this.ft>=spd){this.ft=0;this.frame=(this.frame+1)%6;}
  }
  _colX(plats){ for(const p of plats){ if(p.type==='spike'||p.type==='water'||p.type==='_dead')continue; if(this.overlaps(p)){if(this.y+this.h<=p.y+4)continue;if(this.vx>0)this.x=p.x-this.w;else this.x=p.x+p.w;this.vx=0;} } }
  _colY(plats){ for(const p of plats){ if(p.type==='spike'||p.type==='water'||p.type==='_dead')continue; if(this.overlaps(p)){ if(this.vy>=0){this.y=p.y-this.h;this.vy=0;this.onG=true;if(p.moving)this.onMoving=p;}else{if(this.y+this.h>p.y+p.h-4){this.y=p.y+p.h;this.vy=Math.abs(this.vy)*0.2;}} } } }
  _hurt(dmg,level){ if(this.inv>0)return; this.hp-=dmg;this.inv=100; burst(this.x+20,this.y+40,'#ff4040',10);sfx('hit'); if(this.hp<=0){this.hp=0;this.dead=true;} }
  draw(){
    if(this.dead)return;
    const dx=this.x-cam.x, dy=this.y-cam.y;
    // Escala corrigida para o padrão real do jogo (S=1.5, o mesmo usado desde
    // a Fase1-1, origem do sprite, e na maioria das fases). Uma correção
    // anterior usou S≈1.67 (copiado da Fase4-3), mas esse valor é uma exceção
    // — só Fase3-3/Fase4-3 usam S=1.67. dh agora é fixo em 46*1.5=69px,
    // independente da altura da hitbox de colisão (80px) desta fase.
    const dw=this.w, dh=69;
    const ox=(dw-this.w)/2, oy=dh-this.h;
    const flip=this.facing===-1;
    if(this.swimming){
      // Postura horizontal nadando — rotaciona 30° para frente
      ctx.save();
      ctx.translate(dx+dw/2, dy+dh/2);
      ctx.rotate((flip?-1:1)*Math.PI/8);
      CORVAN.draw(ctx, 'walk', this.frame, -dw/2, -dh/2, dw, dh, flip);
      ctx.restore();
      // Bolhas ao redor
      if(Math.random()<0.04){
        ctx.fillStyle='rgba(220,240,255,0.6)';
        ctx.beginPath(); ctx.arc(dx+20+(Math.random()-.5)*16, dy+8, 1.5, 0, Math.PI*2); ctx.fill();
      }
    } else {
      if(this.interactAnim>0&&this.state!=='jump') CORVAN.draw(ctx, 'dig',  this.frame,    dx-ox,dy-oy,dw,dh,flip);
      else if(this.state==='run')                  CORVAN.draw(ctx, 'walk', this.frame,    dx-ox,dy-oy,dw,dh,flip);
      else                                         CORVAN.draw(ctx, 'idle', this.frame%4,  dx-ox,dy-oy,dw,dh,flip);
    }
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
    const fb={bg01:'#3a5040',bg02:'#2a3a30',bg03:'#0e2030',bg04:'#1a2818'};
    const grd=ctx.createLinearGradient(0,0,0,H);
    grd.addColorStop(0,fb[bgKey]||'#1a2818'); grd.addColorStop(1,'#040810');
    ctx.fillStyle=grd; ctx.fillRect(0,0,W,H);
  }
  ctx.fillStyle='rgba(0,0,0,0.20)'; ctx.fillRect(0,0,W,H);
}

// ═══════════════════════════════════════════════════════════════
//  LEVEL BUILDERS
// ═══════════════════════════════════════════════════════════════

// ── Cena 1: Margem do Arahura — ferramentas + Kiwi ───────────────
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
    // Pequenos trechos de água nas margens
    water(500,FL,80,WH-FL), water(780,FL,80,WH-FL),
    water(1040,FL,80,WH-FL), water(1340,FL,80,WH-FL),
    water(1620,FL,80,WH-FL), water(1900,FL,80,WH-FL),
    water(2200,FL,80,WH-FL), water(2480,FL,80,WH-FL),
    water(2740,FL,80,WH-FL),
  ];
  const cols=[
    new Col(240,FL-50,'toki'),
    new Col(580,FL-50,'corda'),
  ];
  const KIWI_X=3000, KIWI_Y=FL-90;
  const kiwi=new Kiwi();
  const triggers=[
    new Trigger(2880,FL-300,200,300,'Aproximar do Kiwi',(player,level)=>{
      if(!player.items.includes('corda')){notify('Colete a Corda de Harakeke primeiro!');return;}
      if(!player.items.includes('toki')){notify('Colete o Toki Pounamu primeiro!');return;}
      player.interactAnim=60; sfx('kiwi');
      level.kiwi.emerge(KIWI_X, KIWI_Y);
      setTimeout(()=>level.kiwi.land(KIWI_X, KIWI_Y), 1000);
      showDialog([
        '"O Kiwi — Apteryx australis mantelli. Pássaro nacional da Nova Zelândia. Noturno, sem asas funcionais. Caça pelo cheiro e pelo toque — seu bico tem narinas na ponta. Vê pouco. Sente tudo."',
        '"Ele é o animal que melhor representa o que vamos fazer aqui: encontrar o que é precioso por sentidos que não são visuais. Pounamu não se vê de longe. Pounamu se ouve, se toca, se sente pela densidade na mão."',
        '"Ele me traz uma máscara primitiva — bull kelp seca esticada sobre osso. A alga mais resistente do Pacífico, usada como lente subaquática rudimentar. Suficiente para distinguir as cores das pedras no fundo do rio."',
      ],()=>{
        player.items.push('mascara'); _journalColetar('mascara');
        notify('🥽 Máscara de Mergulho de Kelp recebida!');
        POPUP.show('Máscara de Kelp','🥽','Bull kelp (Durvillaea antarctica) — a alga mais resistente do Pacífico Sul.\nEsticada sobre estrutura de osso, cria visão subaquática rudimentar.\nUsada pelos Māori para buscar pounamu nos rios.',8000);
        level.triggers[0].done=true; setTimeout(()=>G.nextLevel(),4000);
      });
    }),
  ];
  return{
    id:1, bg:'bg01', W:WW, H:WH, startX:60, startY:FL-90,
    title:'A Margem do Arahura',
    hint:'Colete 🪓 Toki e 🪢 Corda, depois encontre o Kiwi!',
    plats, cols, triggers, kiwi, enemies:[], seixos:null, waterTop:null,
    intro:[
      '"Cheguei ao fim. Nova Zelândia, século XIII — a última grande terra habitada pelos humanos na superfície da Terra. Os Māori chegaram aqui há menos de 100 anos numa canoa dupla, da Polinésia, 3.000 km de oceano."',
      '"E encontraram esta pedra verde nos rios — e decidiram que ela não tinha preço. Não se vende pounamu. Não se compra pounamu. Quando ele é dado, ele carrega a memória de quem o usou."',
      '"Cada pedra que encontrei nesta série foi extraída, vendida, comercializada. Esta é a única que não tem preço de mercado. E talvez por isso seja a mais preciosa de todas."'
    ],
    update(player){ tickMoving(this.plats); for(const c of this.cols)c.tick(); if(!G.dialog)this.kiwi.update(player); POPUP.tick(); },
    draw(player){
      // Árvores de rimu/kahikatea (parallax)
      for(let i=0;i<7;i++){
        const tx=200+i*460-cam.x*0.5; if(tx<-40||tx>W+40) continue;
        const th=200+(i%3)*40;
        const ty=FL-cam.y-th;
        ctx.fillStyle='#1a1810'; ctx.fillRect(tx-3,ty+th-40,6,40);
        ctx.fillStyle='#284028';
        for(let lev=0;lev<4;lev++){
          ctx.beginPath();
          const cw=18+lev*7;
          ctx.moveTo(tx-cw,ty+lev*42+30);
          ctx.lineTo(tx,ty+lev*42);
          ctx.lineTo(tx+cw,ty+lev*42+30);
          ctx.closePath(); ctx.fill();
        }
      }
      // Tui chamando ocasionalmente
      if(Math.random()<0.005) sfx('tui');
      // Pedra musgosa onde o kiwi sai
      const rx=KIWI_X-cam.x, ry=KIWI_Y-cam.y;
      if(rx>-80&&rx<W+80){
        ctx.fillStyle='#384830'; ctx.beginPath(); ctx.ellipse(rx+30,ry+40,60,16,0,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#4a6048'; ctx.beginPath(); ctx.ellipse(rx+28,ry+28,52,14,0,0,Math.PI*2); ctx.fill();
        // Musgo
        ctx.fillStyle='rgba(120,200,80,0.55)';
        for(let i=0;i<14;i++) ctx.fillRect(rx+8+i*4,ry+14,2,4);
      }
      this.kiwi.draw();
      for(const c of this.cols)c.draw();
      for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

// ── Cena 2: Leito Geológico — geologia, pop-ups, ponto de mergulho
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
  ];
  const geoMessages=[
    {x:600, shown:false, text:'Origem Tectônica', icon:'⛰️',body:'Há 130–200 milhões de anos, placas oceânicas\nforam empurradas a grandes profundidades.\nPressão alta + temperatura baixa transformaram\nminerais Ca-Mg em nefrita — pounamu.'},
    {x:1500,shown:false, text:'Alpes do Sul', icon:'🏔️',body:'A colisão das placas Australiana e Pacífica\nainda ergue os Alpes do Sul hoje, 1cm/ano.\nO rio Arahura desce essas montanhas\nexpondo pounamu há milênios.'},
    {x:2300,shown:false, text:'Mais Tenaz que Diamante', icon:'🟢',body:'Nefrita é MAIS TENAZ que diamante.\nDiamante = mais duro (resistente a risco).\nNefrita = mais tenaz (resistente a fratura).\nIdeal para ferramentas de impacto.\nLei Ngāi Tahu Claims Settlement (1997):\ntodo o pounamu Sul pertence aos Ngāi Tahu.'},
  ];
  const triggers=[
    new Trigger(2870,FL-300,200,300,'Examinar Veio',(player,level)=>{
      player.interactAnim=90; sfx('pounamu');
      showDialog([
        '"O pounamu se formou quando o fundo do oceano foi empurrado para baixo e cozinhado sob pressão. Os mesmos Alpes do Sul que bloqueiam as nuvens do Tasman e criam este clima selvagem são feitos da mesma colisão tectônica que criou esta pedra."',
        '"O rio faz o trabalho de expor o pounamu — ele carrega os seixos montanha abaixo durante milênios, polindo as bordas. Os Māori procuram pounamu nos leitos de rio porque sabem que a água faz a mineração por eles. Não é necessário picareta. Só paciência e atenção."',
        '"À frente, o trecho profundo do Arahura. Vamos mergulhar — a máscara e a corda serão suficientes. O fôlego é o único limite."',
      ],()=>{notify('✦ Trecho de mergulho desbloqueado — Cena 3!');level.triggers[0].done=true;setTimeout(()=>G.nextLevel(),4000);});
    }),
  ];
  return{
    id:2, bg:'bg02', W:WW, H:WH, startX:60, startY:FL-90,
    title:'O Leito Geológico',
    hint:'Percorra a margem e examine o veio. Em seguida: mergulho.',
    plats, cols:[], triggers, geoMessages, kiwi:null, enemies:[], seixos:null, waterTop:null,
    intro:[
      '"Margem ampla do Arahura, com pedras polidas, granito cinza, quartzo branco e — raramente — pedaços de verde profundo. O rio fez o trabalho por milênios."',
      '"Os Māori procuram pounamu nos leitos de rio porque sabem que a água faz a mineração por eles. Não é necessário picareta. Só paciência e atenção."',
      'Examine o veio principal para abrir o trecho de mergulho.'
    ],
    update(player){
      tickMoving(this.plats);
      for(const gm of this.geoMessages){ if(!gm.shown&&player.x>gm.x&&!G.dialog){gm.shown=true;POPUP.show(gm.text,gm.icon,gm.body,7500);} }
      POPUP.tick();
    },
    draw(player){
      // Seixos no chão decorativos
      for(let i=0;i<24;i++){
        const px=120+i*140-cam.x*0.9; if(px<-20||px>W+20) continue;
        const py=FL-cam.y-4 + (i%3)*2;
        const col=i%5===0?'#306648':(i%3===0?'#7a8088':'#5a6068');
        ctx.fillStyle=col; ctx.beginPath(); ctx.ellipse(px,py,6+(i%3)*2,4,0,0,Math.PI*2); ctx.fill();
      }
      // Alpes do Sul (parallax distante)
      for(let i=0;i<5;i++){
        const mx=200+i*420-cam.x*0.2; if(mx<-100||mx>W+100) continue;
        const my=FL-cam.y-300+(i%2)*30;
        ctx.fillStyle='#506068';
        ctx.beginPath(); ctx.moveTo(mx-100,my+120); ctx.lineTo(mx,my); ctx.lineTo(mx+100,my+120); ctx.closePath(); ctx.fill();
        // Pico nevado
        ctx.fillStyle='#f0f0f8';
        ctx.beginPath(); ctx.moveTo(mx-30,my+40); ctx.lineTo(mx,my); ctx.lineTo(mx+30,my+40); ctx.closePath(); ctx.fill();
      }
      for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

// ── Cena 3: Mergulho — busca subaquática (a mecânica central) ────
function buildL3(){
  const FL=200, WW=2800, WH=900;
  const WATER_TOP = FL+40;
  // Plataformas pequenas — pedras emergentes na superfície
  const plats=[
    solid(0,FL,200,30), solid(280,FL,180,30), solid(540,FL,160,30),
    solid(780,FL,160,30), solid(1040,FL,180,30), solid(1320,FL,160,30),
    solid(1580,FL,180,30), solid(1860,FL,200,30), solid(2160,FL,180,30),
    solid(2440,FL,360,30),
    // Fundo do rio (chão para nadar sobre)
    solid(0,WH-60,WW,60),
  ];
  // Seixos no fundo do rio — 3 pounamu reais + 5 imitadores
  const seixos=[
    new RiverSeixo(180, WH-80, 'pounamu'),
    new RiverSeixo(340, WH-80, 'granito'),
    new RiverSeixo(560, WH-80, 'serpentina'),
    new RiverSeixo(740, WH-80, 'pounamu'),
    new RiverSeixo(960, WH-80, 'granito'),
    new RiverSeixo(1180,WH-80, 'serpentina'),
    new RiverSeixo(1380,WH-80, 'granito'),
    new RiverSeixo(1580,WH-80, 'pounamu'),
    new RiverSeixo(1780,WH-80, 'serpentina'),
    new RiverSeixo(2000,WH-80, 'granito'),
    new RiverSeixo(2200,WH-80, 'serpentina'),
    new RiverSeixo(2440,WH-80, 'granito'),
  ];
  const triggers=[
    new Trigger(2640,FL-30,160,30,'Subir à Clareira',(player,level)=>{
      const n=player.items.filter(i=>i==='pounamu').length;
      if(n<3){notify(`Encontre ${3-n} pounamu(s) restante(s) no fundo do rio!`);return;}
      player.interactAnim=60; sfx('pounamu');
      showDialog([
        '"Três seixos. Cada um com um peso diferente na mão — e cada um com uma voz diferente quando bati no fundo do rio. Pounamu canta, mesmo frio e molhado."',
        '"Agora preciso seguir o canto do kiwi. Ele me leva até a clareira."',
      ],()=>{level.triggers[0].done=true;setTimeout(()=>G.nextLevel(),3000);});
    }),
  ];
  return{
    id:3, bg:'bg03', W:WW, H:WH, startX:60, startY:FL-90,
    title:'O Mergulho no Arahura',
    hint:'Pressione ↓ na água para mergulhar. ↑↓←→ nadar. [E] tocar seixos. Suba para testar.',
    plats, cols:[], triggers, seixos, waterTop:WATER_TOP, kiwi:null, enemies:[],
    intro:[
      '"Mergulhe devagar. No fundo do rio, o som muda — cada pedra tem uma voz diferente na água. O granito é surdo. A serpentinita é mole. O pounamu canta, mesmo frio e molhado."',
      '"Quando sentir aquela ressonância diferente no toque, suba — não tente decidir debaixo d\'água, o fôlego não dá margem para dúvida."',
      'Encontre 3 seixos de pounamu (das 3 variedades: kawakawa, kahurangi, inanga).'
    ],
    update(player){
      tickMoving(this.plats);
      for(const s of this.seixos)s.tick();
      POPUP.tick();
    },
    draw(player){
      // Tudo na cena 3 tem tinta azul-esverdeada (visão subaquática)
      // Plataformas pequenas (pedras emergentes)
      // (já desenhadas por drawPlatform)
      // Camadas de água — gradiente do topo (claro) ao fundo (escuro)
      const wt = WATER_TOP - cam.y;
      const wg=ctx.createLinearGradient(0,wt,0,H);
      wg.addColorStop(0,'rgba(120,180,200,0.3)');
      wg.addColorStop(0.5,'rgba(40,90,120,0.55)');
      wg.addColorStop(1,'rgba(10,30,50,0.85)');
      ctx.fillStyle=wg; ctx.fillRect(0,wt,W,H-wt);
      // Raios de luz penetrando
      ctx.fillStyle='rgba(200,230,255,0.08)';
      for(let i=0;i<5;i++){
        const lx=(i*340 + (Date.now()/200)%340)-cam.x*0.3;
        ctx.beginPath();
        ctx.moveTo(lx, wt);
        ctx.lineTo(lx+15, wt);
        ctx.lineTo(lx+80, H);
        ctx.lineTo(lx-50, H);
        ctx.closePath(); ctx.fill();
      }
      // Linha de superfície ondulada
      ctx.fillStyle='rgba(180,230,240,0.45)';
      ctx.fillRect(0,wt-2,W,4);
      for(let i=0;i<W;i+=8){
        const wy=wt+Math.sin((i+cam.x+Date.now()/250)*0.04)*2;
        ctx.fillRect(i,wy,4,1);
      }
      // Seixos no fundo
      for(const s of this.seixos) s.draw();
      // Corrente — pequenas partículas brancas se movendo para a direita
      ctx.fillStyle='rgba(200,220,240,0.3)';
      for(let i=0;i<30;i++){
        const px=((i*120 + Date.now()/15)%this.W)-cam.x;
        const py=wt+40+(i*73)%(H-wt-80);
        if(px<-10||px>W+10) continue;
        ctx.fillRect(px,py,3,1);
      }
      // Vinheta de visão subaquática (escurecimento nas bordas)
      if(player.swimming){
        const vg=ctx.createRadialGradient(W/2,H/2,W/3,W/2,H/2,W/1.2);
        vg.addColorStop(0,'rgba(0,30,50,0)'); vg.addColorStop(1,'rgba(0,10,30,0.6)');
        ctx.fillStyle=vg; ctx.fillRect(0,0,W,H);
      }
      for(const t of this.triggers)t.draw(player.x,player.y);
      // Indicador de candidato carregado
      if(player.candidateSeixo){
        ctx.fillStyle='rgba(0,0,0,0.7)'; _rr(W-220,80,210,30,6); ctx.fill();
        ctx.strokeStyle='#40c878'; ctx.lineWidth=1.5; _rr(W-220,80,210,30,6); ctx.stroke();
        ctx.font='12px "Courier New"'; ctx.fillStyle='#80ffc0'; ctx.textAlign='center';
        ctx.fillText('🤲 Seixo carregado — Suba e [E]', W-115, 100); ctx.textAlign='left';
      }
    }
  };
}

// ── Cena 4: Clareira Cerimonial + Mapa-Múndi Final ───────────────
function buildL4(){
  const FL=600,WW=3200,WH=900;
  const plats=[
    solid(0,FL,380,WH-FL), solid(460,FL,320,WH-FL), solid(870,FL,360,WH-FL),
    solid(1330,FL,380,WH-FL), solid(1810,FL,400,WH-FL), solid(2320,FL,680,WH-FL),
    solid(200,FL-140,160,18), solid(400,FL-240,140,18), solid(600,FL-180,155,18),
    solid(840,FL-250,140,18), solid(1060,FL-200,155,18), solid(1280,FL-305,130,18),
    solid(1540,FL-200,175,18), solid(1760,FL-280,150,18), solid(2050,FL-180,160,18),
    solid(2380,FL-80,560,80), solid(2440,FL-160,500,80), solid(2510,FL-240,440,80),
    solid(2590,FL-300,380,18), solid(2680,FL-360,320,18), solid(2780,FL-420,260,18),
    movH(440,FL-180,120,440,730,2.2), movH(1380,FL-150,110,1380,1680,2.0), movH(2240,FL-140,110,2240,2380,1.8),
    spike(395,FL-20,50),spike(810,FL-20,50),spike(1250,FL-20,50),spike(1730,FL-20,50),spike(2250,FL-20,60),
  ];
  // Hei-Tiki no altar — FIX: posicionado dentro do nível (x=2900, sobre o trigger)
  const cols=[ new Col(2900,FL-450,'heitiki') ];
  const kiwi=new Kiwi();
  // Kiwi começa visível e guiando
  const kiwiPath=[
    {x:500,y:FL-60}, {x:1100,y:FL-60}, {x:1700,y:FL-60}, {x:2350,y:FL-60}, {x:2900,y:FL-450}
  ];
  let kiwiPathIdx=0;
  const triggers=[
    new Trigger(2780,FL-460,240,460,'Completar a Jornada!',(player,level)=>{
      if(!player.items.includes('heitiki')){notify('Pegue o Hei-Tiki no altar primeiro!');return;}
      level.triggers[0].done=true; player.interactAnim=120;
      // Monólogo final
      showDialog([
        '"Dezoito minerais. Seis continentes. Dez mil anos de história humana."',
        '"Comecei em Potosí, onde a prata financiou impérios. Chego aqui, onde uma pedra verde não tem preço porque não está à venda."',
        '"Cada mineral que encontrei foi, ao mesmo tempo, um recurso e uma história — de poder, de trabalho, de conhecimento, de destruição e de beleza."',
        '"A prata dos Incas virou moeda colonial. O carvão virou Revolução Industrial. O ouro de Kimberley virou apartheid. O lápis de Badakhshan virou o manto azul da Virgem Maria. A magnetita chinesa virou a bússola que ligou o mundo."',
        '"E o jade Māori ficou onde sempre esteve — no rio, esperando por quem sabe ouvir o fundo da água."',
        '"Sou o Guardião dos Minerais. Mas o que aprendi é que guardar não significa possuir. Significa conhecer — e respeitar o que cada pedra carregou por milênios antes de chegar às minhas mãos."',
      ],()=>{
        // Inicia o mapa-múndi
        sfx('putorino');
        G.worldMap.activate();
        _salvarProgresso(G.player?.score||0, G.deaths);
      });
    }),
  ];
  return{
    id:4, bg:'bg04', W:WW, H:WH, startX:60, startY:FL-90,
    title:'A Clareira Cerimonial',
    hint:'Siga o Kiwi até o altar. Pegue o Hei-Tiki. [E] para o monólogo final.',
    plats, cols, triggers, kiwi, kiwiPath, kiwiPathIdx, enemies:[], seixos:null, waterTop:null,
    intro:[
      '"O Kiwi me guia pela floresta noturna. Cada chamado dele atravessa a mata como um alarme distante."',
      '"À frente, uma clareira. No centro, uma pedra plana com o Hei-Tiki repousado sobre musgo."',
      'Siga o kiwi e pegue o Hei-Tiki. O monólogo final está a um [E] de distância.'
    ],
    update(player){
      tickMoving(this.plats);
      for(const c of this.cols)c.tick();
      // Kiwi guia
      if(!this.kiwi.visible){
        this.kiwi.emerge(this.kiwiPath[0].x, this.kiwiPath[0].y);
      } else if(this.kiwi.state==='guide'){
        // Avança o ponto-alvo conforme o player avança
        const target=this.kiwiPath[this.kiwiPathIdx];
        if(target && player.x > target.x - 200){
          this.kiwiPathIdx=Math.min(this.kiwiPath.length-1, this.kiwiPathIdx+1);
          const nxt=this.kiwiPath[this.kiwiPathIdx];
          this.kiwi.setGuide(nxt.x, nxt.y);
        }
      }
      this.kiwi.update(player);
      POPUP.tick();
    },
    draw(player){
      // Céu noturno estrelado
      const sky=ctx.createLinearGradient(0,0,0,H*0.6);
      sky.addColorStop(0,'rgba(0,8,20,0.65)'); sky.addColorStop(1,'rgba(20,40,60,0.25)');
      ctx.fillStyle=sky; ctx.fillRect(0,0,W,H*0.6);
      // Estrelas
      for(let i=0;i<60;i++){
        const sx=(i*149.5)%W,sy=(i*89.7)%280;
        ctx.fillStyle=`rgba(255,250,220,${.3+Math.sin(Date.now()/1200+i)*.2})`;
        ctx.fillRect(sx,sy,i%4===0?2:1,i%4===0?2:1);
      }
      // Floresta de rimu silhuetada
      for(let i=0;i<8;i++){
        const tx=200+i*440-cam.x*0.3; if(tx<-40||tx>W+40) continue;
        const th=240+(i%3)*40;
        const ty=FL-cam.y-th;
        ctx.fillStyle='#080c08'; ctx.fillRect(tx-3,ty+th-40,6,40);
        ctx.fillStyle='#0e1a0e';
        for(let lev=0;lev<5;lev++){
          ctx.beginPath();
          const cw=20+lev*8;
          ctx.moveTo(tx-cw,ty+lev*44+30);
          ctx.lineTo(tx,ty+lev*44);
          ctx.lineTo(tx+cw,ty+lev*44+30);
          ctx.closePath(); ctx.fill();
        }
      }
      // Glow do altar final com Hei-Tiki
      const ag=ctx.createRadialGradient(2900-cam.x,FL-450-cam.y,0,2900-cam.x,FL-450-cam.y,180);
      ag.addColorStop(0,'rgba(120,255,180,0.32)'); ag.addColorStop(1,'rgba(120,255,180,0)');
      ctx.fillStyle=ag; ctx.fillRect(3290-cam.x,FL-500-cam.y,360,300);
      this.kiwi.draw();
      for(const c of this.cols)c.draw();
      for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

// ── HUD ────────────────────────────────────────────────────────────
function drawHUD(player,level){
  ctx.fillStyle='rgba(0,0,0,0.65)';ctx.fillRect(0,0,W,38);
  for(let i=0;i<player.maxHp;i++){ ctx.fillStyle=i<player.hp?'#e02020':'#333'; ctx.beginPath();const hx=16+i*28,hy=10;ctx.arc(hx+5,hy+5,5,Math.PI,0);ctx.arc(hx+15,hy+5,5,Math.PI,0);ctx.lineTo(hx+20,hy+5);ctx.bezierCurveTo(hx+20,hy+14,hx+10,hy+18,hx+10,hy+18);ctx.bezierCurveTo(hx+10,hy+18,hx,hy+14,hx,hy+5);ctx.closePath();ctx.fill(); }
  ctx.fillStyle='rgba(40,200,120,.9)';ctx.font='13px "Courier New"';ctx.textAlign='center';ctx.fillText(level.title,W/2,24);ctx.textAlign='left';
  ctx.fillStyle='#40c878';ctx.font='bold 15px "Courier New"';ctx.textAlign='right';ctx.fillText('⭐ '+player.score,W-14,24);ctx.textAlign='left';
  // Ferramenta ativa
  const tY=44;
  ctx.fillStyle='rgba(0,0,0,0.5)';_rr(16,tY,140,28,4);ctx.fill();
  ctx.strokeStyle=player.activeTool?'#40c878':'#444';ctx.lineWidth=1.5;_rr(16,tY,140,28,4);ctx.stroke();
  if(player.activeTool&&ITEM_DEFS[player.activeTool]){const def=ITEM_DEFS[player.activeTool];ctx.font='14px serif';ctx.fillText(def.icon,24,tY+20);ctx.font='11px "Courier New"';ctx.fillStyle='#40c878';ctx.fillText(def.nome,42,tY+20);}
  else{ctx.font='11px "Courier New"';ctx.fillStyle='#555';ctx.fillText('Sem ferramenta',22,tY+20);}
  ctx.fillStyle='rgba(40,180,100,0.15)';_rr(162,tY,46,28,4);ctx.fill();ctx.strokeStyle='#208050';ctx.lineWidth=1.5;_rr(162,tY,46,28,4);ctx.stroke();
  ctx.font='bold 11px "Courier New"';ctx.fillStyle='#60c890';ctx.textAlign='center';ctx.fillText('[I]',185,tY+19);ctx.textAlign='left';
  // Itens
  let ix=W-16;const inv=[];
  if(player.items.includes('heitiki'))  inv.push('🗿 HEI-TIKI');
  if(player.items.includes('mascara'))  inv.push('🥽 MÁSCARA');
  if(player.items.includes('corda'))    inv.push('🪢 CORDA');
  if(player.items.includes('toki'))     inv.push('🪓 TOKI');
  const pn=player.items.filter(i=>i==='pounamu').length;
  if(pn>0) inv.push('🟢 '+pn);
  for(const it of inv){ctx.fillStyle='#40c878';ctx.font='12px "Courier New"';ctx.textAlign='right';ctx.fillText(it,ix,tY+20);ctx.textAlign='left';ix-=ctx.measureText(it).width+20;}
  // Barra de fôlego (apenas se nadando ou fôlego abaixo de 100)
  if(player.swimming || player.breath < 100){
    const bW=180, bX=16, bY=tY+32;
    const pct=player.breath/100;
    ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(bX,bY,bW,12);
    const col = pct>0.5 ? `rgba(80,220,200,0.9)` : pct>0.25 ? `rgba(220,180,40,0.9)` : `rgba(220,40,40,0.9)`;
    ctx.fillStyle=col; ctx.fillRect(bX,bY,bW*pct,12);
    ctx.strokeStyle='rgba(120,220,200,0.6)'; ctx.lineWidth=1; ctx.strokeRect(bX,bY,bW,12);
    ctx.font='10px "Courier New"'; ctx.fillStyle='#a0f0d0';
    ctx.fillText(player.swimming?'🌊 FÔLEGO':'💨 RECUPERANDO', bX+2, bY+10);
  }
  ctx.fillStyle='rgba(160,220,180,.72)';ctx.font='12px "Courier New"';ctx.textAlign='center';ctx.fillText(level.hint,W/2,H-10);ctx.textAlign='left';
  if(G.timeOnLevel<600){ctx.fillStyle='rgba(0,0,0,0.55)';ctx.fillRect(8,H-44,540,28);ctx.fillStyle='#aaa';ctx.font='12px "Courier New"';ctx.fillText('← → Mover  ↑/Espaço Pular  ↓ Mergulhar  E Interagir  I Inventário',14,H-25);}
}

// ── Title Screen ──────────────────────────────────────────────────
function drawTitle(){
  const bg=IMG['bg01'];
  if(bg&&bg.complete&&bg.naturalWidth>0){ctx.globalAlpha=0.55;drawBg('bg01');ctx.globalAlpha=1;}
  else{const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#062018');g.addColorStop(1,'#020806');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
  ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(0,0,W,H);
  // Estrelas (céu de NZ)
  for(let i=0;i<120;i++){const sx=(i*149.5)%W,sy=(i*89.7)%300;ctx.fillStyle=`rgba(200,255,230,${.15+Math.sin(Date.now()/1400+i)*.15})`;ctx.fillRect(sx,sy,i%4===0?2:1,i%4===0?2:1);}
  // Kiwi no título (anda à frente)
  if(IMG['kiwi_img']&&IMG['kiwi_img'].complete){
    const kx=((Date.now()/22)%(W+120))-60;
    const ky=200+Math.sin(Date.now()/900)*8;
    ctx.drawImage(IMG['kiwi_img'],0,0,96,96,kx,ky,100,100);
  }
  ctx.textAlign='center';
  ctx.shadowColor='#20a050';ctx.shadowBlur=40;
  ctx.fillStyle='#40e090';ctx.font='bold 46px "Courier New"';ctx.fillText('A ÚLTIMA PEDRA DO GUARDIÃO',W/2,168);
  ctx.shadowBlur=0;
  ctx.fillStyle='#60a880';ctx.font='22px "Courier New"';ctx.fillText('Fase 6.3 (FINAL)  —  Te Wahi Pounamu, NZ · Māori · Séc. XIII',W/2,214);
  if(IMG.card63){
    const cardSize=160,cardX=W/2-80,cardY=246;
    const glow=ctx.createRadialGradient(W/2,cardY+80,0,W/2,cardY+80,130);
    glow.addColorStop(0,'rgba(40,200,120,0.28)'); glow.addColorStop(1,'rgba(40,200,120,0)');
    ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(W/2,cardY+80,130,0,Math.PI*2); ctx.fill();
    ctx.drawImage(IMG.card63,cardX,cardY,cardSize,cardSize);
  }
  ctx.fillStyle=`rgba(80,220,140,${.55+Math.sin(Date.now()/550)*.4})`;ctx.font='19px "Courier New"';
  ctx.fillText('▶  Pressione ENTER para começar  ◀',W/2,460);
  ctx.fillStyle='#a0c8b0';ctx.font='18px "Courier New"';
  ctx.fillText('← → Mover   |   ↑ Espaço Pular   |   E Interagir   |   I Diário de Bordo',W/2,504);
  ctx.fillText('[M] Menu Principal',W/2,538);
  ctx.textAlign='left';
}

function drawDeath(){
  ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);
  ctx.textAlign='center';ctx.shadowColor='#ff2020';ctx.shadowBlur=30;
  ctx.fillStyle='#ff5050';ctx.font='bold 56px "Courier New"';ctx.fillText('VOCÊ CAIU!',W/2,H/2-50);ctx.shadowBlur=0;
  ctx.fillStyle='#40c878';ctx.font='20px "Courier New"';
  ctx.fillText('Pressione  R  para recomeçar',W/2,H/2+30);
  ctx.fillText(`Mortes: ${G.deaths}`,W/2,H/2+62);
  ctx.fillStyle='#888';ctx.font='15px "Courier New"';ctx.fillText('[M] Menu Principal',W/2,H/2+94);
  ctx.textAlign='left';
}

function drawComplete(){
  // Se o mapa-múndi está ativo, ele é o foco visual
  if(G.worldMap && G.worldMap.active){
    G.worldMap.draw();
    if(G.worldMap.ready()){
      // Tela final pequena de instrução
      const pulse=0.6+Math.sin(Date.now()/500)*0.4;
      ctx.font='bold 15px "Courier New"'; ctx.fillStyle=`rgba(120,255,180,${pulse})`;
      ctx.textAlign='center';
      ctx.fillText('▶ [M] Menu Principal  —  Modo Guardião ◀', W/2, H-22);
      ctx.textAlign='left';
    }
    return;
  }
  // Fallback (caso o mapa não tenha sido ativado)
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#020806');g.addColorStop(1,'#082018');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  const rg=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,500);rg.addColorStop(0,'rgba(40,200,120,.16)');rg.addColorStop(1,'rgba(40,200,120,0)');ctx.fillStyle=rg;ctx.fillRect(0,0,W,H);
  ctx.textAlign='center';
  ctx.shadowColor='#40c878';ctx.shadowBlur=40;
  ctx.fillStyle='#40e090';ctx.font='bold 40px "Courier New"';ctx.fillText('✦  MINERALIS — JORNADA COMPLETA  ✦',W/2,108);
  ctx.shadowBlur=0;
  CORVAN.drawLarge(ctx, W/2 - 24, H/2 - 180, 3, false);
  ctx.fillStyle='#e8d090';ctx.font='20px "Courier New"';ctx.fillText('O Guardião dos Minerais conhece todas as pedras.',W/2,170);
  const lines=[
    '🟢  Pounamu — a única pedra sem preço de mercado',
    '🗿  Hei-Tiki — o ancestral que viaja com você',
    '🪓  Toki Pounamu — ferramenta e identidade Māori',
    '🦤  Kiwi — quem vê o precioso sem precisar enxergar',
  ];
  ctx.fillStyle='#c0e8d0';ctx.font='16px "Courier New"';lines.forEach((l,i)=>ctx.fillText(l,W/2,400+i*32));
  ctx.fillStyle='#40c878';ctx.font='18px "Courier New"';ctx.fillText(`Pontuação: ◈ ${G.player?.score||0}   Mortes: ${G.deaths}`,W/2,548);
  ctx.fillStyle=`rgba(80,220,140,${.6+Math.sin(Date.now()/600)*.4})`;ctx.font='17px "Courier New"';
  ctx.fillText('▶ [M] Menu Principal — Modo Guardião ◀',W/2,594);
  ctx.font='42px serif';ctx.fillText('🏆',W/2-20,640);
  ctx.textAlign='left';
}

// ── Game engine ───────────────────────────────────────────────────
const LEVELS=[buildL1,buildL2,buildL3,buildL4];
const G={
  state:'title', lvIdx:0, level:null, player:null,
  dialog:false, deaths:0, timeOnLevel:0,
  _storedItems:[], _storedScore:0, _storedTool:null,
  worldMap:null,

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
    if(!this.worldMap) this.worldMap = new WorldMap();
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
    // Detecção de fim do diálogo final (após monólogo) — verifica se world map foi ativado
    if(this.worldMap && this.worldMap.active && this.worldMap.ready()){
      // pronto para o usuário sair com M
    }
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
    // Se world map ativo durante playing (transição), mostrar over
    if(this.worldMap && this.worldMap.active){
      this.worldMap.draw();
      if(this.worldMap.ready()){
        const pulse=0.6+Math.sin(Date.now()/500)*0.4;
        ctx.font='bold 15px "Courier New"'; ctx.fillStyle=`rgba(120,255,180,${pulse})`;
        ctx.textAlign='center'; ctx.fillText('▶ [ENTER] Concluir', W/2, H-22); ctx.textAlign='left';
      }
    }
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
    if (!save.fases['6.3']) save.fases['6.3'] = {desbloqueada:true, estrelas:0, coletados:{}};
    if (!save.fases['6.3'].coletados) save.fases['6.3'].coletados = {};
    if (count && count > 1) {
      save.fases['6.3'].coletados[id] = Math.max(Number(save.fases['6.3'].coletados[id])||0, count);
    } else {
      save.fases['6.3'].coletados[id] = true;
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
    if(!save.fases['6.3']) save.fases['6.3']={desbloqueada:true,estrelas:0};
    save.fases['6.3'].estrelas=Math.max(save.fases['6.3'].estrelas||0,estrelas);
    save.fases['6.3'].desbloqueada=true;
    save.jogoCompleto = true;
    save.modoGuardiao = true;
    localStorage.setItem(SAVE_KEY,JSON.stringify(save));
  }catch(e){}
}

function startGame(){
  CORVAN.load('Assets/', () => {});
  G.state='title'; cam.x=0; cam.y=0; loop();
}

function loop(){
  requestAnimationFrame(loop);
  if(G.state==='title'    &&(jp['Enter']||jp['Space'])) G.load(0);
  if(G.state==='dead'     && jp['KeyR'])                G.load(G.lvIdx);
  // Após monólogo + mapa-múndi pronto, ENTER vai para o menu
  if(G.worldMap && G.worldMap.active && G.worldMap.ready() && (jp['Enter']||jp['KeyM'])){
    G.state='complete';
    if(jp['KeyM']) _voltarAoMenu();
  }
  if(G.state==='complete' && jp['KeyM']) _voltarAoMenu();
  G.update(); G.draw(); clearJP();
}

if(!gameReady){
  (function loadLoop(){
    if(gameReady) return;
    requestAnimationFrame(loadLoop);
    ctx.fillStyle='#020806';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#40c878';ctx.font='bold 22px "Courier New"';ctx.textAlign='center';
    ctx.fillText(`Carregando${'.'.repeat(Math.floor(Date.now()/400)%4)}  ${assetsLoaded}/${totalAssets}`,W/2,H/2);
    ctx.fillStyle='#888';ctx.font='14px "Courier New"';
    ctx.fillText('Fase 6.3 (FINAL) — A Última Pedra do Guardião',W/2,H/2+36);
    ctx.textAlign='left';
  })();
}
