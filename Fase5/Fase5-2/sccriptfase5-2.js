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

let _bgMusicActive=false,_bgMusicTimeout=null,_bgMusicGain=null;
const _NOTES_S2=[146.8,155.6,185.0,196.0,220.0,233.1,261.6,293.7];
function startBgMusic(){
  if(_bgMusicActive||!AC)return;
  _bgMusicActive=true;
  if(AC.state==='suspended')AC.resume();
  _bgMusicGain=AC.createGain();_bgMusicGain.gain.value=0.045;_bgMusicGain.connect(AC.destination);
  function _nota(freq,start,dur,type,vol){
    const o=AC.createOscillator(),g=AC.createGain();
    o.type=type||'triangle';o.frequency.value=freq;
    g.gain.setValueAtTime(0,start);g.gain.linearRampToValueAtTime(vol||0.07,start+0.06);
    g.gain.setValueAtTime(vol||0.07,start+dur-0.18);g.gain.linearRampToValueAtTime(0,start+dur);
    o.connect(g);g.connect(_bgMusicGain);o.start(start);o.stop(start+dur);
  }
  const SEQ=[0,3,4,3,0,2,1,0,4,6,4,3,2,1,0,0];
  function _ciclo(){
    if(!_bgMusicActive)return;
    const t=AC.currentTime+0.1, step=0.55;
    _nota(_NOTES_S2[0]/2,t,SEQ.length*step,'sine',0.035);
    SEQ.forEach((idx,i)=>_nota(_NOTES_S2[idx%_NOTES_S2.length],t+i*step,step*1.05));
    _bgMusicTimeout=setTimeout(_ciclo,(SEQ.length*step-0.2)*1000);
  }
  _ciclo();
}
function stopBgMusic(){
  _bgMusicActive=false;clearTimeout(_bgMusicTimeout);
  if(_bgMusicGain&&AC){_bgMusicGain.gain.linearRampToValueAtTime(0,AC.currentTime+0.5);_bgMusicGain=null;}
}
let _prevBgState='';

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
    if(!save.fases['5.3']) save.fases['5.3']={desbloqueada:false,estrelas:0};
    save.fases['5.3'].desbloqueada=true;
    localStorage.setItem(SAVE_KEY,JSON.stringify(save));
  }catch(e){}
}
function _voltarAoMenu(){ _salvarFase(G.player?.score||0,G.deaths); window.location.href='../../MenuPrincipal/index.html'; }

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

const cam={x:0,y:0};
function updateCam(px,worldW){ const t=px-W/2+24; const c=Math.max(0,Math.min(t,worldW-W)); cam.x+=(c-cam.x)*0.12; }

const GRAV=0.46, PSPD=4.6, JUMPF=-12.4, MAXFALL=16;

const TILE_THEMES={
  1:{top:'#d8d0c0',body:'#b8ac98',dark:'#8a7c68'},  // calcário externo
  2:{top:'#c8bca8',body:'#a89880',dark:'#786858'},  // galerias
  3:{top:'#b8a888',body:'#988060',dark:'#685840'},  // fire-setting
  4:{top:'#c0a870',body:'#a08850',dark:'#705c30'},  // oficina
};
let tileTheme=TILE_THEMES[1];

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
  if(p.type==='spike'){
    // Visibilidade melhorada (padrão da Fase5-1): gradiente claro + contorno
    // escuro + aresta de brilho + sombra de contato — antes era um triângulo
    // marrom-acinzentado chapado ('#786858') sem contorno, que sumia de vista
    // contra os fundos escuros das galerias/cânion desta fase.
    const nc=Math.max(1,Math.floor(p.w/20)), tw=p.w/nc;
    for(let i=0;i<nc;i++){
      const tx=sx+i*tw, baseY=sy+p.h, tipY=sy, tipX=tx+tw/2;
      ctx.fillStyle='rgba(0,0,0,0.25)';
      ctx.beginPath();ctx.ellipse(tipX,baseY+1,tw/2.3,2.5,0,0,Math.PI*2);ctx.fill();
      const grad=ctx.createLinearGradient(tx,baseY,tx,tipY);
      grad.addColorStop(0,'#8a8a92');grad.addColorStop(1,'#e8e8ee');
      ctx.fillStyle=grad;
      ctx.beginPath();ctx.moveTo(tx+1,baseY);ctx.lineTo(tipX,tipY);ctx.lineTo(tx+tw-1,baseY);ctx.closePath();ctx.fill();
      ctx.strokeStyle='#3a3a42';ctx.lineWidth=1.5;ctx.stroke();
      ctx.strokeStyle='rgba(255,255,255,0.55)';ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(tx+3,baseY-2);ctx.lineTo(tipX-1,tipY+3);ctx.stroke();
    }
    return;
  }
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

function roundRect(x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r); ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath(); }
function _rr(x,y,w,h,r){ roundRect(x,y,w,h,r); }
// Caixa de texto sólida (fundo preto + borda colorida) para avisos/ações no
// mundo (fogueiras, fragmentos etc.) — mesmo padrão já usado no tooltip
// "[E] Pegar X" dos itens (Col) e dos Triggers. Antes esses avisos eram só
// texto pulsante semi-transparente (chegava a alpha=0, ficando invisível por
// completo em parte do ciclo) sem nenhum fundo, difícil de ler contra
// qualquer cenário mais claro/cheio de detalhes.
function drawActionTooltip(cx,cy,txt,color,pulse=1,fontSize=10){
  ctx.font='bold '+fontSize+'px "Courier New"';
  const tw=ctx.measureText(txt).width+22;
  ctx.fillStyle='rgba(0,0,0,0.8)'; roundRect(cx-tw/2,cy-14,tw,22,4); ctx.fill();
  ctx.strokeStyle=color; ctx.globalAlpha=0.5+pulse*0.5; ctx.lineWidth=1.5; roundRect(cx-tw/2,cy-14,tw,22,4); ctx.stroke(); ctx.globalAlpha=1;
  ctx.fillStyle=color; ctx.textAlign='center'; ctx.fillText(txt,cx,cy+1); ctx.textAlign='left';
}
function wrapText(text,maxW){ ctx.font='15px "Courier New"'; const paragraphs=text.split('\n'); const result=[]; for(const para of paragraphs){ const words=para.split(' ');let line=''; for(const word of words){ const test=line?line+' '+word:word; if(ctx.measureText(test).width>maxW&&line){result.push(line);line=word;}else line=test; } if(line)result.push(line); } return result; }

const ITEM_DEFS={
  // Herdados
  picareta_basica:  { cat:'ferramenta',nome:'Picareta Básica',       icon:'⛏',fase:'1.1',desc:'Extrai minérios das paredes rochosas.' },
  maco_pedra:       { cat:'ferramenta',nome:'Maço de Pedra',         icon:'🪨',fase:'2.3',desc:'Percussão a frio Anishinaabe.' },
  picareta_calcario:{ cat:'ferramenta',nome:'Picareta de Calcário',  icon:'⛏',fase:'3.3',desc:'Para rocha sedimentar.' },
  machado_item:     { cat:'ferramenta',nome:'Machado Tuaregue',      icon:'🪓',fase:'4.3',desc:'Golpe horizontal para sal.' },
  picareta_aco_song:{ cat:'ferramenta',nome:'Picareta de Aço Song',  icon:'⛏',fase:'5.3',desc:'Aço chinês do séc. XI.' },
  // Novas 5.2
  tora_pinheiro:    { cat:'ferramenta',nome:'Tora de Pinheiro Seco', icon:'🌲',fase:'5.2',desc:'Madeira seca para a fogueira do fire-setting.\nAquece a rocha até o limite — mas se a água\nvier cedo demais, a tora se perde.',multiple:true },
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

let notifText='',notifAlpha=0,notifTimer=0;
function notify(msg,ms=2800){notifText=msg;notifTimer=ms;notifAlpha=1;}
function tickNotif(){if(notifTimer>0){notifTimer-=16;if(notifTimer<=0)notifAlpha=0;else notifAlpha=Math.min(1,notifTimer/300);}}
function drawNotif(){
  if(notifAlpha<=0) return; ctx.save();ctx.globalAlpha=notifAlpha;ctx.font='14px "Courier New"';
  const tw=ctx.measureText(notifText).width+32,nx=(W-tw)/2,ny=46;
  ctx.fillStyle='rgba(0,0,0,0.82)';roundRect(nx,ny,tw,28,6);ctx.fill();ctx.strokeStyle='#4878d0';ctx.lineWidth=1.5;roundRect(nx,ny,tw,28,6);ctx.stroke();
  ctx.fillStyle='#4878d0';ctx.textAlign='center';ctx.fillText(notifText,W/2,ny+19);ctx.textAlign='left';ctx.restore();
}

const POPUP={ active:false,title:'',lines:[],icon:'🔷',timer:0,
  show(title,icon,text,duration=8000){this.active=true;this.title=title;this.icon=icon;this.lines=text.split('\n');this.timer=duration;},
  tick(){if(this.timer>0){this.timer-=16;if(this.timer<=0)this.active=false;}},
  draw(){ if(!this.active)return; const alpha=Math.min(1,this.timer/400); const PW=370,PX=W-PW-20,PY=60;
    ctx.font='12px "Courier New"';
    const maxTextW=PW-32;
    const wrapped=[];
    this.lines.forEach(line=>{
      const words=line.split(' ');let cur='';
      for(const w of words){ const test=cur?cur+' '+w:w; if(ctx.measureText(test).width>maxTextW&&cur){wrapped.push(cur);cur=w;}else cur=test; }
      wrapped.push(cur);
    });
    const PH=wrapped.length*20+100;
    ctx.save();ctx.globalAlpha=alpha; ctx.fillStyle='rgba(2,4,12,0.94)';_rr(PX,PY,PW,PH,12);ctx.fill();ctx.strokeStyle='#204090';ctx.lineWidth=2;_rr(PX,PY,PW,PH,12);ctx.stroke();
    ctx.font='32px serif';ctx.textAlign='center';ctx.fillText(this.icon,PX+40,PY+46);
    // BUG: textAlign continuava 'center' (herdado do desenho do ícone acima)
    // na hora de escrever o título, então o título era centralizado em vez de
    // começar em PX+60 — títulos longos ("Pilão e Almofariz de Ágata")
    // estouravam para FORA da caixa pela esquerda. Reset explícito + encolhe
    // a fonte se ainda não couber na largura disponível (defensivo).
    ctx.textAlign='left';
    const titleMaxW=PX+PW-16-(PX+60);
    let tfs=13; ctx.font='bold '+tfs+'px "Courier New"';
    while(ctx.measureText(this.title).width>titleMaxW&&tfs>9){ tfs--; ctx.font='bold '+tfs+'px "Courier New"'; }
    ctx.fillStyle='#4878d0';ctx.fillText(this.title,PX+60,PY+28);
    ctx.font='12px "Courier New"';ctx.fillStyle='#f0e8c0';ctx.textAlign='left';wrapped.forEach((l,i)=>ctx.fillText(l,PX+16,PY+52+i*20));ctx.restore(); }
};

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
  draw(px,py,hasPilao){
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
      // Barra de aquecimento — BUG: ficava em sy-24 (acima do TOPO da parede),
      // enquanto a chama é desenhada bem abaixo da parede (fy=sy+h+4). Isso
      // deixava uns 80px de distância entre a fogueira e seu próprio status,
      // com a parede inteira no meio — na prática a chama aparecia sozinha,
      // sem nenhum alerta visível por perto, parecendo um item "solto" sem
      // explicação. Reposicionado para ficar logo acima da própria chama.
      const bw=100, bx2=fx-bw/2, by2=fy-46;
      ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(bx2,by2,bw,10);
      const heatCol = this.heat<80 ? `rgba(${Math.round(180+this.heat*0.7)},${Math.round(140-this.heat)},40,0.9)` : 'rgba(255,80,30,0.95)';
      ctx.fillStyle=heatCol; ctx.fillRect(bx2,by2,bw*(this.heat/100),10);
      ctx.strokeStyle=this.heat>=80?'#ffe060':'rgba(200,150,40,0.6)'; ctx.lineWidth=this.heat>=80?2:1;
      ctx.strokeRect(bx2,by2,bw,10);
      // BUG: o clamp "headY-8" fazia esse aviso subir/descer seguindo a altura
      // do JOGADOR (que pode estar longe, em outra plataforma), em vez de
      // ficar fixo relativo à própria fogueira — parecia "pular junto com o
      // Corvan" em vez de estático sobre o objeto. Removido: a posição agora
      // é sempre fixa em relação à chama/parede.
      if(this.heat>=80){
        const pulse=0.6+Math.sin(this.t*4)*0.4;
        drawActionTooltip(fx,by2-6,'[E] Despeje a água!','#ffc850',pulse);
      } else {
        drawActionTooltip(fx,by2-6,`🔥 Aquecendo ${Math.floor(this.heat)}%`,'#e0c060',1,9);
      }
    } else if(this.state==='unlit'){
      const pulse=0.5+Math.sin(this.t*2)*0.5;
      drawActionTooltip(sx+this.w/2,sy-10,'[E] Acender com 🌲 Tora','#e0983c',pulse);
    }
    // Fragmentos — só o mais próximo do jogador mostra o texto de ação. Antes
    // TODOS os fragmentos exibiam seu aviso o tempo todo (sem checar
    // proximidade), e como ficam a só 28px um do outro, 2-3 avisos apareciam
    // sobrepostos/ilegíveis sempre que a rocha rachava com múltiplos
    // fragmentos por perto.
    let nearestF=null, nearestD=80;
    for(const f of this.fragments){
      if(f.done) continue;
      const d=Math.hypot((px+20)-(f.x+f.w/2),(py+40)-(f.y+f.h/2));
      if(d<nearestD){nearestD=d;nearestF=f;}
    }
    for(const f of this.fragments) f.draw(px,py,hasPilao,f===nearestF);
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
  draw(px,py,hasPilao,showTooltip=true){
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
    // Indicador — só desenhado para o fragmento mais próximo (showTooltip),
    // e agora numa caixa sólida em vez de texto pulsante semi-transparente
    // (que ficava ilegível contra o fundo e, com vários fragmentos por
    // perto, virava uma sopa de letras sobrepostas).
    if(!showTooltip) return;
    // Posição fixa relativa ao fragmento (mesmo ajuste do FireSettingSpot):
    // clampar pela altura da cabeça do jogador fazia o aviso "pular" para
    // cima/baixo conforme o Corvan pulava, em vez de ficar parado sobre o
    // próprio fragmento.
    const promptY=sy-6;
    if(!this.examined){
      const pulse=0.5+Math.sin(this.t*2)*0.5;
      if(hasPilao){
        drawActionTooltip(sx+this.w/2,promptY,'[E] Moer amostra','#c8aae0',pulse,9);
      } else {
        drawActionTooltip(sx+this.w/2,promptY,'🔒 Precisa do Pilão','#e0785a',pulse,9);
      }
    } else {
      if(this.type==='lapis'){
        drawActionTooltip(sx+this.w/2,promptY,'✓ [E] Coletar','#e0d060',1,9);
      } else {
        drawActionTooltip(sx+this.w/2,promptY,'✗ sodalita — [E] descartar','#a0a0b0',1,9);
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
      // Reduzida de 110→66 (60%) para condizer com a escala do Corvan (dh≈77);
      // no tamanho antigo a ovelha ficava quase 1,5x maior que o próprio jogador.
      // O "pé" é mantido na mesma linha de chão de antes (sy+55), só encolhendo
      // a partir do topo, para não flutuar nem afundar na pedra.
      const dw=66,dh=66,bob=this.state==='guide'?Math.sin(this.frame*1.4)*2:0;
      const topY=sy+55-dh+bob;
      if(this.facing<0){ctx.translate(sx+dw/2,topY);ctx.scale(-1,1);}else ctx.translate(sx-dw/2,topY);
      ctx.drawImage(IMG['ovelha_img'],0,0,96,96,0,0,dw,dh);
    } else {
      ctx.translate(sx,sy); const bob=this.state==='guide'?Math.sin(this.frame*1.4)*2:0;
      if(this.facing<0)ctx.scale(-1,1);
      ctx.scale(0.6,0.6); // mesma redução de escala do desenho vetorial de reserva
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
// Ferramentas coletáveis (exigem [E] e mostram alerta padrão) — pirita e
// frasco não entram aqui: pirita é bônus decorativo e frasco é auto-coleta
// do artefato final.
const TOOL_LABELS={tora:'Tora de Pinheiro',anfora:'Ânfora com Água Fria'};

class Col{
  constructor(x,y,type){this.x=x;this.y=y;this.w=30;this.h=30;this.type=type;this.done=false;this.t=Math.random()*Math.PI*2;}
  tick(){if(!this.done)this.t+=0.06;}
  draw(player){
    if(this.done) return;
    const sx=this.x-cam.x, sy=this.y-cam.y+Math.sin(this.t)*5; if(sx<-50||sx>W+50) return;
    const isTool=TOOL_LABELS.hasOwnProperty(this.type);
    const near=isTool&&player&&player.near(this,70);
    if(near){
      const pulse=0.5+Math.sin(Date.now()/300)*0.5;
      const glow=ctx.createRadialGradient(sx+15,sy+15,0,sx+15,sy+15,26);
      glow.addColorStop(0,`rgba(72,120,208,${0.35+pulse*0.2})`); glow.addColorStop(1,'rgba(72,120,208,0)');
      ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(sx+15,sy+15,26,0,Math.PI*2); ctx.fill();
    }
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
    } else if(this.type==='pirita'){
      // Fragmento solto de pirita — bônus decorativo colecionável na galeria
      const sh=0.6+Math.sin(this.t*2)*0.4;
      ctx.fillStyle=`rgba(230,190,60,${sh})`;
      ctx.beginPath(); ctx.moveTo(0,-9); ctx.lineTo(8,0); ctx.lineTo(0,9); ctx.lineTo(-8,0); ctx.closePath(); ctx.fill();
      ctx.strokeStyle='rgba(255,224,120,0.9)'; ctx.lineWidth=1; ctx.stroke();
      ctx.fillStyle='rgba(255,240,180,0.8)'; ctx.beginPath(); ctx.arc(-2,-2,2,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
    if(near){
      const label=TOOL_LABELS[this.type];
      const txt='[E] Pegar '+label; ctx.font='13px "Courier New"'; const tw=ctx.measureText(txt).width+22;
      const headTop=(player.y-cam.y)-16, itemTop=sy-16;
      const cy=Math.min(itemTop,headTop-24);
      const cx=Math.max(tw/2+6,Math.min(sx+15,W-tw/2-6));
      ctx.fillStyle='rgba(0,0,0,0.78)';roundRect(cx-tw/2,cy-16,tw,24,4);ctx.fill();
      ctx.strokeStyle='#4878d0';ctx.lineWidth=1.5;roundRect(cx-tw/2,cy-16,tw,24,4);ctx.stroke();
      ctx.fillStyle='#4878d0';ctx.textAlign='center';ctx.fillText(txt,cx,cy);ctx.textAlign='left';
    }
  }
}

// ── Trigger ───────────────────────────────────────────────────────
class Trigger{
  constructor(x,y,w,h,label,fn){this.x=x;this.y=y;this.w=w;this.h=h;this.label=label;this.fn=fn;this.done=false;}
  draw(px,py){ if(this.done)return; const near=Math.abs((px+24)-(this.x+this.w/2))<this.w/2+72&&Math.abs((py+40)-(this.y+this.h/2))<this.h/2+72; if(!near)return; const sx=this.x+this.w/2-cam.x; let sy=this.y-cam.y-26+Math.sin(Date.now()/350)*4; const headY=py-cam.y; if(sy-16>headY-8) sy=headY-8+16; const txt='[E] '+this.label;ctx.font='14px "Courier New"';const tw=ctx.measureText(txt).width+24; const bx=Math.max(tw/2+6,Math.min(sx,W-tw/2-6)); ctx.fillStyle='rgba(0,0,0,0.78)';roundRect(bx-tw/2,sy-16,tw,24,4);ctx.fill();ctx.strokeStyle='#4878d0';ctx.lineWidth=1.5;roundRect(bx-tw/2,sy-16,tw,24,4);ctx.stroke();ctx.fillStyle='#4878d0';ctx.textAlign='center';ctx.fillText(txt,bx,sy);ctx.textAlign='left'; }
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

    // Coletáveis simples — ferramentas (tora/ânfora) exigem [E] com o alerta
    // visível (igual ao padrão de outras fases); os demais tipos continuam
    // sendo coletados automaticamente ao encostar.
    for(const c of level.cols){
      if(c.done) continue;
      const isTool=TOOL_LABELS.hasOwnProperty(c.type);
      if(isTool){ if(!this.overlaps(c)||!ePressed) continue; }
      else if(!this.overlaps(c)) continue;
      {
        c.done=true;
        if(c.type==='pirita'){
          // Bônus decorativo — não é ferramenta/artefato, só pontuação, então
          // não entra no Diário de Bordo nem no array de itens.
          this.score+=5; sfx('coin'); burst(c.x+15,c.y+15,'#e6c04a',10);
          notify('✨ Fragmento de pirita! (+5)');
        } else {
          this.items.push(c.type); sfx('item'); _journalColetar(c.type);
          burst(c.x+15,c.y+15,'#4878d0',10);
          // Ferramentas/artefatos (tora, ânfora, pilão, frasco) NÃO somam mais
          // pontuação: eles já aparecem no Diário de Bordo, e o contador ⭐ só
          // é exibido em cenas com bônus "puros" sem entrada no Diário (ex.:
          // pirita). Antes essas coletas ainda incrementavam this.score em
          // segredo mesmo com o contador escondido na Cena 1 — ao chegar na
          // Cena 2 (onde o contador aparece), o placar já vinha "carregado"
          // com pontos de itens que o jogador nunca viu contabilizados.
          if(c.type==='tora'){   notify('🌲 Tora de Pinheiro coletada! ('+this.items.filter(i=>i==='tora').length+')'); }
          if(c.type==='anfora'){ notify('🏺 Ânfora de Água Fria coletada!'); }
          if(c.type==='pilao'){  notify('⚱️ Pilão de Ágata recebido!'); }
          if(c.type==='frasco'){ sfx('glass'); notify('🧪 Frasco de Ultramarino Medieval encontrado!'); }
        }
      }
    }

    // Fire-Setting Spots — ignição e despejo de água. A Tora é consumível
    // (combustível, é gasta ao usar — não faz sentido "equipar" lenha), então
    // continua bastando tê-la no inventário. Já a Ânfora é uma ferramenta
    // única, como o Machado da Fase4-3: precisa estar EQUIPADA pelo Diário
    // [I] antes de funcionar, não basta só tê-la coletado.
    const anforaEquipada = this.activeTool==='anfora_barro';
    if(level.fireSpots && ePressed && !eConsumed){
      for(const spot of level.fireSpots){
        if(this.near({x:spot.x,y:spot.y,w:spot.w,h:spot.h},70)){
          if(spot.state==='unlit'){
            if(this.items.includes('tora')){
              const idx=this.items.indexOf('tora'); this.items.splice(idx,1);
              spot.ignite(); eConsumed=true;
            } else {
              notify('Você precisa de uma 🌲 Tora de Pinheiro para acender!');
              eConsumed=true;
            }
            break;
          } else if(spot.state==='heating'){
            if(!this.items.includes('anfora')){
              notify('Você precisa da 🏺 Ânfora com Água Fria!');
              eConsumed=true;
            } else if(!anforaEquipada){
              notify('🔒 Equipe a Ânfora pelo Diário [I] antes de usar!');
              eConsumed=true;
            } else {
              spot.pourWater(this); eConsumed=true;
            }
            break;
          }
        }
      }
    }

    // Fragmentos — examinar (moer) e coletar/descartar. O Pilão também
    // precisa estar EQUIPADO (mesmo padrão da Ânfora acima), não basta tê-lo
    // no inventário.
    const pilaoEquipado = this.activeTool==='pilao_agata';
    if(level.fireSpots && ePressed && !eConsumed && !pilaoEquipado){
      outer2:
      for(const spot of level.fireSpots){
        for(const frag of spot.fragments){
          if(frag.done||frag.examined) continue;
          if(this.near({x:frag.x,y:frag.y,w:frag.w,h:frag.h},50)){
            if(!this.items.includes('pilao')) notify('🔒 Você precisa do ⚱️ Pilão de Ágata para examinar este fragmento!');
            else notify('🔒 Equipe o Pilão de Ágata pelo Diário [I] antes de usar!');
            eConsumed=true; break outer2;
          }
        }
      }
    }

    // Fragmentos — examinar (moer) e coletar/descartar
    if(level.fireSpots && ePressed && !eConsumed && pilaoEquipado){
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
                // Sem pontuação aqui — lápis-lazúli já é um minério contado no
                // Diário de Bordo (com contador ×N), igual ao critério usado
                // para tora/ânfora/pilão/frasco (ver comentário acima).
                this.items.push('lapis'); sfx('duduk');
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
    if(this.dead)return; const dx=this.x-cam.x,dy=this.y-cam.y;
    // CORVAN.draw() calcula a escala a partir de dh (S=dh/46, personagem-base
    // tem 46 unidades de altura); dw só serve para centralizar horizontalmente
    // e nesta fórmula (dx-ox onde ox=(dw-w)/2) o termo se cancela, então dw
    // não tem efeito visual real — só a altura (dh) importa.
    // CORREÇÃO: a correção anterior usava Fase4-3 (S=1.67) como referência,
    // mas ao conferir TODAS as fases anteriores, S=1.67 é na verdade uma
    // exceção (só Fase3-3 e Fase4-3 usam esse valor). O padrão real, usado
    // por Fase1-1 (a própria origem do sprite), Fase2-1/2/3, Fase3-1,
    // Fase4-1, Fase5-1 e Fase6-1, é S=1.5 → altura fixa de 46*1.5=69px,
    // independente da altura do hitbox de colisão de cada fase. dh agora é
    // fixo em 69 (em vez de proporcional a this.h) para bater exatamente
    // com esse padrão predominante.
    const dw=this.w,dh=69; const ox=(dw-this.w)/2,oy=dh-this.h; const flip=this.facing===-1;
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
  // OVELHA_Y era FL-90: como a ovelha não tem física/gravidade (posição fixa
  // via land()), isso a deixava ~35-40px acima do chão real, flutuando visivelmente
  // acima da pedra decorativa em vez de parecer apoiada nela. Aproximada do chão.
  const OVELHA_X=3000, OVELHA_Y=FL-50;
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
    hint:'Colete 🌲 Tora e 🏺 Ânfora, depois encontre a Ovelha de Marco Polo!',
    plats, enemies, cols, triggers, ovelha, fireSpots:[],
    intro:[
      '"2500 antes de Cristo. Estas minas já funcionam há 4.500 anos quando chegamos aqui. O lápis que sai deste vale chegou ao Egito de Tutankamon, a Sumer, ao Vale do Indo — atravessando desertos e montanhas sem qualquer rota comercial formal."',
      '"As pessoas que viviam aqui nem sabiam que existia o Egito, e os egípcios não sabiam que existia este vale. Mas o azul desta pedra estava nos dois lugares ao mesmo tempo."',
      '"Um mineral criou uma rede global 5.000 anos antes da globalização."'
    ],
    update(player){ tickMoving(this.plats); for(const e of this.enemies)e.update(this.plats,player); if(!G.dialog)this.ovelha.update(player); for(const c of this.cols)c.tick(); POPUP.tick();
      if(Math.random()<0.003) sfx('eagle'); },
    draw(player){
      // Pinheiros tortos (parallax) — aumentados para condizer com a escala
      // das paredes do cânion ao fundo (antes ficavam pequenos/"de brinquedo"
      // perto das formações rochosas altas do fundo SVG).
      for(let i=0;i<7;i++){
        const tx=200+i*460-cam.x*0.5; if(tx<-40||tx>W+40) continue;
        const th=220+(i%3)*40; const ty=FL-cam.y-th;
        ctx.fillStyle='#302818'; ctx.fillRect(tx-4,ty+th-40,8,40);
        ctx.fillStyle='#3a4028';
        for(let lev=0;lev<3;lev++){ ctx.beginPath(); const cw=20+lev*9; ctx.moveTo(tx-cw,ty+lev*54+36); ctx.lineTo(tx,ty+lev*54); ctx.lineTo(tx+cw,ty+lev*54+36); ctx.closePath(); ctx.fill(); }
      }
      // Removidas as fogueiras decorativas dos "mineiros antigos": o fire-setting
      // só é ensinado na Cena 3, então fogueiras já acesas na Cena 1 confundiam
      // o jogador (parecia mecânica interativa antes da hora).
      // Pedra onde a ovelha pousa
      const rx=OVELHA_X-cam.x, ry=OVELHA_Y-cam.y;
      if(rx>-80&&rx<W+80){ ctx.fillStyle='#c0b498'; ctx.beginPath(); ctx.ellipse(rx+30,ry+40,60,16,0,0,Math.PI*2); ctx.fill(); }
      this.ovelha.draw();
      for(const e of this.enemies)e.draw(); for(const c of this.cols)c.draw(player); for(const t of this.triggers)t.draw(player.x,player.y);
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
  // Fragmentos soltos de pirita — bônus colecionável espalhado pela galeria.
  // Antes a cena não tinha absolutamente nada para coletar (cols=[]), só
  // plataformas e inimigos até o trigger do final — sem nenhum objetivo claro
  // no caminho. Dá um motivo simples para explorar as plataformas elevadas.
  const cols=[
    new Col(440,FL-290,'pirita'), new Col(880,FL-280,'pirita'), new Col(1360,FL-310,'pirita'),
    new Col(1570,FL-230,'pirita'), new Col(1805,FL-290,'pirita'), new Col(2090,FL-225,'pirita'),
    new Col(2560,FL-245,'pirita'),
  ];
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
      for(const c of this.cols)c.tick();
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
      for(const c of this.cols)c.draw(player);
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
  // Toras extras de reserva (caso desperdice). A do meio ficava em x=1600,
  // a só 50px do fireSpot em x=1550 — perto o suficiente para o tooltip
  // "[E] Pegar Tora" (Col) e o status da fogueira/fragmentos (FireSettingSpot)
  // aparecerem sobrepostos ao mesmo tempo. Movida para x=1230 (~320px de
  // distância), sobre o mesmo chão sólido, sem esse conflito.
  // A primeira (x=560) caía dentro do vão 530-630 (sem plataforma nenhuma
  // embaixo) — mesma causa da 1ª fogueira, ver comentário abaixo. Movida
  // para x=200, dentro do trecho de chão inicial (solid#1: 0-300), logo
  // depois do ponto de partida do jogador (startX=60).
  const cols=[
    new Col(200,FL-50,'tora'),
    new Col(1230,FL-50,'tora'),
    new Col(2450,FL-50,'tora'),
  ];
  // 3 pontos de fire-setting espalhados. Tentativa anterior recentralizou as
  // 3 spots dentro das respectivas plataformas sólidas (660/1460/2340), mas
  // a 1ª (em solid#3: 630-780) só é alcançável cruzando o vão 530-630, que
  // NÃO tem plataforma móvel — só as fases mais altas (movH) cobrem alguns
  // vãos, alternando com vãos "a seco" que dependem de pular por cima ou
  // usar as placas flutuantes lá em cima. Isso fazia o jogador cair ao
  // tentar chegar na 1ª fogueira. Movida para solid#2 (380-530), alcançável
  // pela movH(300,380) já existente logo no início — sem vão a seco no
  // caminho. As outras duas (1460/2340) ficam mantidas.
  const fireSpots=[
    new FireSettingSpot(420,FL-70),
    new FireSettingSpot(1460,FL-70),
    new FireSettingSpot(2340,FL-70),
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
    hint:'[E] Acender c/ 🌲 Tora → aguarde 80%+ → [E] Ânfora → examine c/ Pilão!',
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
      // Reflete o Pilão EQUIPADO (não só coletado) — mesma exigência aplicada
      // na ação de moer em Player.update(), senão a dica visual ("[E] Moer
      // amostra" vs "🔒 Precisa do Pilão") ficaria inconsistente com o que
      // realmente acontece ao apertar [E].
      const hasPilao=player.activeTool==='pilao_agata';
      for(const spot of this.fireSpots) spot.draw(player.x,player.y,hasPilao);
      for(const e of this.enemies)e.draw();
      for(const c of this.cols)c.draw(player);
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
      ctx.fillStyle=ag; ctx.fillRect(2900-150-cam.x,FL-450-150-cam.y,300,300);
      this.ovelha.draw();
      for(const e of this.enemies)e.draw(); for(const c of this.cols)c.draw(player); for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

function drawHUD(player,level){
  // Barra superior — mesmo padrão (fundo escuro + linha divisória) do resto do jogo
  ctx.fillStyle='rgba(2,4,12,0.85)';ctx.fillRect(0,0,W,38);
  ctx.fillStyle='rgba(40,80,200,0.25)';ctx.fillRect(0,36,W,2);
  // Corações em azul (tema da fase — lápis-lazúli/ultramarino), em vez do
  // vermelho padrão das demais fases, que destoava da paleta de Sar-e-Sang.
  for(let i=0;i<player.maxHp;i++){ ctx.fillStyle=i<player.hp?'#4878d0':'#333'; ctx.beginPath();const hx=16+i*28,hy=10;ctx.arc(hx+5,hy+5,5,Math.PI,0);ctx.arc(hx+15,hy+5,5,Math.PI,0);ctx.lineTo(hx+20,hy+5);ctx.bezierCurveTo(hx+20,hy+14,hx+10,hy+18,hx+10,hy+18);ctx.bezierCurveTo(hx+10,hy+18,hx,hy+14,hx,hy+5);ctx.closePath();ctx.fill(); }
  ctx.fillStyle='#d8e0f8';ctx.font='20px "Courier New"';ctx.textAlign='center';ctx.fillText(level.title,W/2,24);ctx.textAlign='left';
  // O contador de estrelas só faz sentido em cenas que têm bônus de pontuação
  // "puros" (ex.: pirita — sem entrada própria no Diário, tipos que não estão
  // em TIPO_TO_JOURNAL). Ferramentas/artefatos (tora, ânfora, pilão, frasco)
  // já aparecem no Diário de Bordo — não precisam também de um placar, então
  // cenas onde só existem esses itens (como a Cena 1) não mostram o contador.
  const hasScoreBonus = level.cols && level.cols.some(c=>!TIPO_TO_JOURNAL.hasOwnProperty(c.type));
  if(hasScoreBonus){
    ctx.fillStyle='#4878d0';ctx.font='bold 20px "Courier New"';ctx.textAlign='right';ctx.fillText('⭐ '+player.score,W-14,26);ctx.textAlign='left';
  }


  const toraN=player.items.filter(i=>i==='tora').length;
  const TOOL_DEFS=[
    {id:'tora_pinheiro',icon:'🌲',nome:'Tora',has:()=>toraN>0,count:toraN},
    {id:'anfora_barro', icon:'🏺',nome:'Ânfora',has:()=>player.items.includes('anfora')},
    {id:'pilao_agata',  icon:'⚱️',nome:'Pilão',has:()=>player.items.includes('pilao')},
  ];
  const tools=TOOL_DEFS.filter(t=>t.has());
  const PX=12,PY=46,PW=190,HEADER_H=26;
  const PH=HEADER_H+(tools.length>0?10+tools.length*22:26);
  ctx.save();
  ctx.shadowColor='rgba(0,0,0,0.7)';ctx.shadowBlur=8;
  ctx.fillStyle='rgba(2,4,12,0.9)';_rr(PX,PY,PW,PH,6);ctx.fill();
  ctx.shadowBlur=0;
  ctx.strokeStyle='#3858c0';ctx.lineWidth=1.5;_rr(PX,PY,PW,PH,6);ctx.stroke();
  ctx.restore();
  const midX=PX+PW/2,kw=26,kx=PX+PW-kw-6,ky=PY+5;
  ctx.font='11px serif';ctx.fillStyle='#6890e0';ctx.fillText('📔',PX+8,PY+20);
  ctx.font='bold 10px "Courier New"';ctx.fillStyle='#6890e0';ctx.fillText('DIÁRIO DE BORDO',PX+24,PY+20);
  ctx.fillStyle='rgba(40,80,200,0.2)';_rr(kx,ky,kw,18,3);ctx.fill();
  ctx.strokeStyle='#6890e0';ctx.lineWidth=1;_rr(kx,ky,kw,18,3);ctx.stroke();
  ctx.font='bold 10px "Courier New"';ctx.fillStyle='#88a8f0';ctx.textAlign='center';ctx.fillText('[I]',kx+kw/2,ky+13);ctx.textAlign='left';
  ctx.fillStyle='rgba(40,80,200,0.3)';ctx.fillRect(PX+6,PY+HEADER_H,PW-12,1);
  ctx.textAlign='center';
  if(tools.length>0){
    tools.forEach((t,i)=>{
      const ty=PY+HEADER_H+8+i*22,eq=(player.activeTool===t.id);
      const cnt=t.count>0?' ×'+t.count:'';
      ctx.font=(eq?'bold ':'')+'12px "Courier New"';ctx.fillStyle=eq?'#f0d060':'#a8c0e8';
      ctx.fillText(t.icon+' '+t.nome+cnt+(eq?' ◀':''),midX,ty+10);
    });
  } else {
    // Padrão do jogo (Fase4-3, Fase5-1): "Não Equipado", já que as ferramentas
    // já existem como entradas fixas do Diário — só ainda não foram obtidas/
    // equipadas. "Nenhuma ferramenta" dava a entender que a fase não tem
    // ferramentas nenhuma, o que é diferente do padrão das demais fases.
    ctx.font='12px "Courier New"';ctx.fillStyle='#6878a0';
    ctx.fillText('Não Equipado',midX,PY+HEADER_H+18);
  }
  ctx.textAlign='left';

  const lapN=player.items.filter(i=>i==='lapis').length;
  ctx.font='12px "Courier New"';ctx.fillStyle='#88a8f0';ctx.textAlign='right';
  if(lapN>0) ctx.fillText('🔷 Lápis-Lazúli ×'+lapN,W-14,52);
  if(player.items.includes('frasco')) ctx.fillText('🧪 Frasco coletado',W-14,52+(lapN>0?18:0));
  ctx.textAlign='left';

  ctx.fillStyle='#cfe0ff';ctx.font='18px "Courier New"';
  ctx.textAlign='center';ctx.fillText(level.hint,W/2,H-10);ctx.textAlign='left';
}

function drawTitle(){
  const bg=IMG['bg01'];
  if(bg&&bg.complete&&bg.naturalWidth>0){ctx.globalAlpha=0.55;drawBg('bg01');ctx.globalAlpha=1;}
  else{const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0a1030');g.addColorStop(1,'#020408');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
  ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(0,0,W,H);
  for(let i=0;i<120;i++){const sx=(i*143.5)%W,sy=(i*87.7)%280;ctx.fillStyle=`rgba(160,190,255,${.15+Math.sin(Date.now()/1400+i)*.15})`;ctx.fillRect(sx,sy,i%4===0?2:1,i%4===0?2:1);}
  ctx.textAlign='center';
  ctx.shadowColor='#2848c8';ctx.shadowBlur=40;
  ctx.fillStyle='#4878e0';ctx.font='bold 48px "Courier New"';ctx.fillText('O Azul que o Mundo Buscou',W/2,168);
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
  ctx.fillText('← → Mover   |   ↑ Espaço Pular   |   E Interagir   |   I Diário de Bordo',W/2,504);
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
  ctx.fillStyle='#4878d0';ctx.font='18px "Courier New"';ctx.fillText(`Pontuação: ◈ ${G.player?.score||0}   Mortes: ${G.deaths}`,W/2,548);
  ctx.fillStyle=`rgba(60,100,220,${.6+Math.sin(Date.now()/600)*.4})`;ctx.font='17px "Courier New"';
  ctx.fillText('✦ Fase 5.3 desbloqueada!   [M] Menu Principal',W/2,594);
  ctx.font='42px serif';ctx.fillText('🏆',W/2-20,640);
  ctx.textAlign='left';
}

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
  if(G.state!==_prevBgState){
    if(G.state==='playing'&&_prevBgState!=='playing')startBgMusic();
    if((G.state==='dead'||G.state==='complete'||G.state==='title')&&_prevBgState==='playing')stopBgMusic();
    _prevBgState=G.state;
  }
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
