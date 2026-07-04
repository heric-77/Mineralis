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
  if      (type==='jump')      { o.frequency.setValueAtTime(280,t); o.frequency.exponentialRampToValueAtTime(520,t+.14); g.gain.setValueAtTime(.15,t); g.gain.exponentialRampToValueAtTime(.001,t+.16); }
  else if (type==='coin')      { o.frequency.setValueAtTime(880,t); o.frequency.exponentialRampToValueAtTime(1760,t+.09); g.gain.setValueAtTime(.12,t); g.gain.exponentialRampToValueAtTime(.001,t+.12); }
  else if (type==='hit')       { o.type='sawtooth'; o.frequency.setValueAtTime(200,t); o.frequency.exponentialRampToValueAtTime(50,t+.18); g.gain.setValueAtTime(.18,t); g.gain.exponentialRampToValueAtTime(.001,t+.22); }
  else if (type==='item')      { o.frequency.setValueAtTime(440,t); o.frequency.setValueAtTime(660,t+.1); o.frequency.setValueAtTime(880,t+.2); g.gain.setValueAtTime(.14,t); g.gain.exponentialRampToValueAtTime(.001,t+.3); }
  else if (type==='unlock')    { o.frequency.setValueAtTime(330,t); o.frequency.setValueAtTime(440,t+.15); o.frequency.setValueAtTime(660,t+.3); g.gain.setValueAtTime(.15,t); g.gain.exponentialRampToValueAtTime(.001,t+.5); }
  // Magnetita: clonk metálico grave + zumbido magnético
  else if (type==='magnetita') { o.type='square'; o.frequency.setValueAtTime(180,t); o.frequency.exponentialRampToValueAtTime(90,t+.16); g.gain.setValueAtTime(.18,t); g.gain.exponentialRampToValueAtTime(.001,t+.2); const o2=AC.createOscillator(),g2=AC.createGain(); o2.type='sine'; o2.frequency.setValueAtTime(60,t+.05); g2.gain.setValueAtTime(.08,t+.05); g2.gain.exponentialRampToValueAtTime(.001,t+.3); o2.connect(g2); g2.connect(AC.destination); o2.start(t+.05); o2.stop(t+.35); }
  // Hematita: krank seco sem zumbido — fracasso
  else if (type==='hematita')  { o.type='sawtooth'; o.frequency.setValueAtTime(280,t); o.frequency.exponentialRampToValueAtTime(80,t+.08); g.gain.setValueAtTime(.12,t); g.gain.exponentialRampToValueAtTime(.001,t+.1); }
  // Picareta em rocha metamórfica: krank duro cristalino
  else if (type==='picareta')  { o.type='triangle'; o.frequency.setValueAtTime(1000,t); o.frequency.exponentialRampToValueAtTime(400,t+.08); g.gain.setValueAtTime(.14,t); g.gain.exponentialRampToValueAtTime(.001,t+.1); }
  // Agulha tocando água: plof minúsculo
  else if (type==='plof')      { o.type='sine'; o.frequency.setValueAtTime(280,t); o.frequency.exponentialRampToValueAtTime(120,t+.1); g.gain.setValueAtTime(.08,t); g.gain.exponentialRampToValueAtTime(.001,t+.12); }
  // Alinhamento ao norte: click suave imperceptível mas audível
  else if (type==='compass_ok'){ o.type='sine'; o.frequency.setValueAtTime(2400,t); g.gain.setValueAtTime(.06,t); g.gain.exponentialRampToValueAtTime(.001,t+.08); const o2=AC.createOscillator(),g2=AC.createGain(); o2.type='sine'; o2.frequency.setValueAtTime(3200,t+.04); g2.gain.setValueAtTime(.04,t+.04); g2.gain.exponentialRampToValueAtTime(.001,t+.14); o2.connect(g2); g2.connect(AC.destination); o2.start(t+.04); o2.stop(t+.18); }
  // Friccionar agulha contra magnetita: sshhhk metálico
  else if (type==='friction')  { o.type='sawtooth'; o.frequency.setValueAtTime(2200,t); o.frequency.exponentialRampToValueAtTime(800,t+.18); g.gain.setValueAtTime(.05,t); g.gain.linearRampToValueAtTime(.08,t+.05); g.gain.exponentialRampToValueAtTime(.001,t+.22); }
  // Guqin — 5 notas ascendentes (tema de Shen Kuo)
  else if (type==='guqin') {
    [220,277,329,440,554].forEach((f,i)=>{ const oi=AC.createOscillator(),gi=AC.createGain(); oi.type='sine'; oi.frequency.setValueAtTime(f,t+i*.15); gi.gain.setValueAtTime(.1,t+i*.15); gi.gain.exponentialRampToValueAtTime(.001,t+i*.15+.45); oi.connect(gi); gi.connect(AC.destination); oi.start(t+i*.15); oi.stop(t+i*.15+.6); });
  }
  // Fundição: FWOOM grave
  else if (type==='fwoom')     { o.type='sawtooth'; o.frequency.setValueAtTime(80,t); g.gain.setValueAtTime(.08,t); g.gain.linearRampToValueAtTime(.18,t+.3); g.gain.exponentialRampToValueAtTime(.001,t+.9); }
  // Risco em cerâmica — som agudo de risco
  else if (type==='streak')    { o.type='sawtooth'; o.frequency.setValueAtTime(3000,t); o.frequency.exponentialRampToValueAtTime(2000,t+.18); g.gain.setValueAtTime(.04,t); g.gain.exponentialRampToValueAtTime(.001,t+.2); }
  else if (type==='stone')     { o.type='square'; o.frequency.setValueAtTime(120,t); g.gain.setValueAtTime(.1,t); g.gain.exponentialRampToValueAtTime(.001,t+.15); }
  o.start(t); o.stop(t+1.5);
}

// ── Música ambiente ──────────────────────────────────────────────
// Fase 5.3 não tinha trilha de fundo (só sfx pontuais). O roteiro atravessa
// 4 momentos com humores bem distintos: a energia rítmica da forja Song
// (Cena1), o mistério escuro e gotejante da mina de magnetita (Cena2), a
// busca metódica de escavar/testar/confirmar minério (Cena3) e a resolução
// calorosa no laboratório de Shen Kuo, onde tudo converge (Cena4). Em vez
// de 4 músicas soltas, todas compartilham a MESMA escala pentatônica
// chinesa (modo gong, em Ré — D E F# A B), a mesma usada no timbre do
// guqin (sfx 'guqin' do Mengxi Bitan), para dar identidade sonora coerente
// à fase inteira, variando apenas ritmo/densidade/camadas por cena.
let _bgMusicActive=false,_bgMusicTimeout=null,_bgMusicGain=null,_bgMusicScene=-1;
const _NOTES_53=[146.8,164.8,185.0,220.0,246.9,293.7,329.6,370.0,440.0]; // D3 E3 F#3 A3 B3 D4 E4 F#4 A4
const _BG_SCENES=[
  { // Cena 1 — A Fundição Song: trabalho, ritmo de martelo, energia
    step:0.4, vol:0.065, type:'triangle',
    seq:[0,3,5,3,0,4,6,4,0,3,5,3,0,2,4,2],
    anvil:true,
  },
  { // Cena 2 — Colinas de Gnaisse / Minas de Magnetita: escuro, esparso
    step:0.85, vol:0.045, type:'sine',
    seq:[0,null,3,null,0,null,4,null,0,null,2,null],
  },
  { // Cena 3 — Coleta + Teste: busca metódica, curiosidade, repetição
    step:0.55, vol:0.055, type:'triangle',
    seq:[0,2,4,2,0,3,5,3,0,2,4,6,4,2,0,0],
    echo:true,
  },
  { // Cena 4 — Rio Gan + Laboratório de Shen Kuo: calorosa, conclusiva
    step:0.5, vol:0.07, type:'triangle',
    seq:[0,2,4,6,8,6,4,2,0,3,5,7,5,3,0,0],
    harmony:2,
  },
];
function startBgMusic(sceneIdx){
  if(!AC) return;
  if(_bgMusicActive && _bgMusicScene===sceneIdx) return;
  stopBgMusic();
  _bgMusicActive=true; _bgMusicScene=sceneIdx;
  if(AC.state==='suspended') AC.resume();
  const cfg=_BG_SCENES[sceneIdx]||_BG_SCENES[0];
  _bgMusicGain=AC.createGain(); _bgMusicGain.gain.value=cfg.vol; _bgMusicGain.connect(AC.destination);
  function _nota(freq,start,dur,type,vol){
    const o=AC.createOscillator(),g=AC.createGain();
    o.type=type||cfg.type; o.frequency.value=freq;
    const v=vol!==undefined?vol:0.07;
    g.gain.setValueAtTime(0,start); g.gain.linearRampToValueAtTime(v,start+0.06);
    g.gain.setValueAtTime(v,start+dur-0.18); g.gain.linearRampToValueAtTime(0,start+dur);
    o.connect(g); g.connect(_bgMusicGain); o.start(start); o.stop(start+dur);
  }
  function _anvil(start){
    // Batida de martelo na forja (só na Cena1) — clonk metálico curto
    const o=AC.createOscillator(),g=AC.createGain();
    o.type='square'; o.frequency.setValueAtTime(1200,start); o.frequency.exponentialRampToValueAtTime(300,start+0.08);
    g.gain.setValueAtTime(0.05,start); g.gain.exponentialRampToValueAtTime(0.001,start+0.1);
    o.connect(g); g.connect(_bgMusicGain); o.start(start); o.stop(start+0.12);
  }
  function _ciclo(){
    if(!_bgMusicActive||_bgMusicScene!==sceneIdx) return;
    const t=AC.currentTime+0.1, step=cfg.step;
    _nota(_NOTES_53[0]/2, t, cfg.seq.length*step, 'sine', cfg.vol*0.5);
    cfg.seq.forEach((idx,i)=>{
      if(idx===null) return;
      const start=t+i*step;
      _nota(_NOTES_53[idx%_NOTES_53.length], start, step*1.05);
      if(cfg.harmony!==undefined) _nota(_NOTES_53[(idx+cfg.harmony)%_NOTES_53.length], start, step*1.05, cfg.type, cfg.vol*0.5);
      if(cfg.echo && i%2===1) _nota(_NOTES_53[idx%_NOTES_53.length]*2, start+step*0.5, step*0.5, 'sine', cfg.vol*0.3);
      if(cfg.anvil && i%4===0) _anvil(start);
    });
    _bgMusicTimeout=setTimeout(_ciclo,(cfg.seq.length*step-0.2)*1000);
  }
  _ciclo();
}
function stopBgMusic(){
  _bgMusicActive=false; _bgMusicScene=-1; clearTimeout(_bgMusicTimeout);
  if(_bgMusicGain&&AC){ _bgMusicGain.gain.linearRampToValueAtTime(0,AC.currentTime+0.5); _bgMusicGain=null; }
}
let _prevBgState='', _prevBgScene=-1;

// ── Save ─────────────────────────────────────────────────────────
const SAVE_KEY = 'mineralis_save_v2';
function _salvarFase(score, deaths){
  const estrelas = deaths===0?4:deaths<=2?3:deaths<=5?2:1;
  try{
    const raw=localStorage.getItem(SAVE_KEY);
    const save=raw?JSON.parse(raw):{versao:1,iniciado:true,fases:{}};
    if(!save.fases) save.fases={};
    if(!save.fases['5.3']) save.fases['5.3']={desbloqueada:true,estrelas:0};
    save.fases['5.3'].estrelas=Math.max(save.fases['5.3'].estrelas||0,estrelas);
    save.fases['5.3'].desbloqueada=true;
    localStorage.setItem(SAVE_KEY,JSON.stringify(save));
  }catch(e){}
}
function unlockPhase(id){
  try{
    const raw=localStorage.getItem(SAVE_KEY);
    const save=raw?JSON.parse(raw):{versao:1,iniciado:true,fases:{}};
    if(!save.fases)save.fases={};
    if(!save.fases[id])save.fases[id]={desbloqueada:false,estrelas:0};
    save.fases[id].desbloqueada=true;
    localStorage.setItem(SAVE_KEY,JSON.stringify(save));
  }catch(e){}
}
function _voltarAoMenu(){ _salvarFase(G.player?.score||0,G.deaths); unlockPhase('6.1'); window.location.href='../../MenuPrincipal/index.html?unlocked=6.1';  }

// ── Assets ───────────────────────────────────────────────────────
const IMG={};
const ASSETS=[
  ['bg01','Assets/cena1_fundicao_song.svg'],
  ['bg02','Assets/cena2_minas_magnetita.svg'],
  ['bg03','Assets/cena3_rio_gan.svg'],
  ['bg04','Assets/cena4_laboratorio_shen_kuo.svg'],
  ['grua_img',     'Assets/5_3_grua_coroa_vermelha.svg'],
  ['agulha_img',   'Assets/5_3_agulha_aco.svg'],
  ['picareta_img', 'Assets/5_3_picareta_aco_song.svg'],
  ['bacia_img',    'Assets/5_3_bacia_laqueada.svg'],
  ['mengxi_img',   'Assets/5_3_mengxi_bitan.svg'],
  ['card53',       'Assets/5_3_magnetita.svg'],
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
function ironFiling(x,y,target,n=12){ // partículas de ferro atraídas magneticamente
  for(let i=0;i<n;i++){
    const a=Math.random()*Math.PI*2;
    const dist=30+Math.random()*40;
    particles.push({x:x+Math.cos(a)*dist,y:y+Math.sin(a)*dist,vx:0,vy:0,
      tx:x,ty:y,magnetic:true,life:50+Math.random()*30,max:80,color:'#888',r:2});
  }
}
function tickParticles(){
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i];
    if(p.magnetic){
      // Atração magnética
      const dx=p.tx-p.x, dy=p.ty-p.y, d=Math.hypot(dx,dy);
      if(d>1){ p.vx+=dx/d*0.6; p.vy+=dy/d*0.6; }
      p.vx*=0.86; p.vy*=0.86;
    } else { p.vy+=0.15; }
    p.x+=p.vx; p.y+=p.vy; p.life--;
    if(p.life<=0) particles.splice(i,1);
  }
}
function drawParticles(){for(const p of particles){ctx.globalAlpha=p.life/p.max;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x-cam.x,p.y-cam.y,p.r*(p.life/p.max),0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}

// ── Camera ────────────────────────────────────────────────────────
const cam={x:0,y:0};
function updateCam(px,worldW){ const t=px-W/2+24; const c=Math.max(0,Math.min(t,worldW-W)); cam.x+=(c-cam.x)*0.12; }

const GRAV=0.46, PSPD=4.6, JUMPF=-12.4, MAXFALL=16;

// ── Tile themes ──────────────────────────────────────────────────
const TILE_THEMES={
  1:{top:'#a08068',body:'#7a5840',dark:'#503820'},  // pátio fundição
  2:{top:'#383028',body:'#1e1a18',dark:'#100c0c'},  // mina escura
  3:{top:'#586848',body:'#384828',dark:'#1c2818'},  // margem rio Gan
  4:{top:'#807058',body:'#605040',dark:'#403028'},  // laboratório
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
  if(p.type==='spike'){ const nc=Math.max(1,Math.floor(p.w/20)); ctx.fillStyle='#403028'; for(let i=0;i<nc;i++){const tx=sx+i*(p.w/nc);ctx.beginPath();ctx.moveTo(tx,sy+p.h);ctx.lineTo(tx+p.w/nc/2,sy);ctx.lineTo(tx+p.w/nc,sy+p.h);ctx.fill();} return; }
  if(p.type==='trapdoor'){ const alpha=p.crumble!==undefined?p.crumble/70:1; ctx.globalAlpha=alpha; ctx.fillStyle=tileTheme.dark;ctx.fillRect(sx,sy,p.w,p.h); ctx.fillStyle=tileTheme.top;ctx.fillRect(sx,sy,p.w,3); ctx.globalAlpha=1; return; }
  if(p.type==='_dead') return;
  const ts=24,cols=Math.ceil(p.w/ts),rows=Math.ceil(p.h/ts);
  for(let r=0;r<rows;r++){ for(let c=0;c<cols;c++){
    const tx=sx+c*ts,ty=sy+r*ts,tw=Math.min(ts,sx+p.w-tx),th=Math.min(ts,sy+p.h-ty);
    ctx.fillStyle=r===0?tileTheme.body:(r%2===0?tileTheme.dark:tileTheme.body); ctx.fillRect(tx,ty,tw,th);
    ctx.fillStyle='rgba(0,0,0,0.08)'; ctx.fillRect(tx+tw-1,ty,1,th); ctx.fillRect(tx,ty+th-1,tw,1);
  } }
  ctx.fillStyle=tileTheme.top; ctx.fillRect(sx,sy,p.w,4);
  if(p.moving){ ctx.fillStyle='rgba(200,80,40,0.35)'; ctx.fillRect(sx,sy,p.w,4); }
}

// ── Utils ─────────────────────────────────────────────────────────
function roundRect(x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r); ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath(); }
function _rr(x,y,w,h,r){ roundRect(x,y,w,h,r); }
function wrapText(text,maxW,font){ ctx.font=font||'15px "Courier New"'; const paragraphs=text.split('\n'); const result=[]; for(const para of paragraphs){ const words=para.split(' ');let line=''; for(const word of words){ const test=line?line+' '+word:word; if(ctx.measureText(test).width>maxW&&line){result.push(line);line=word;}else line=test; } if(line)result.push(line); } return result; }
// FIX: tooltips flutuantes (Trigger, Col) usavam posição própria sem saber
// de outras áreas fixas da tela — o POPUP informativo (canto superior
// direito) e a faixa de itens do HUD (contador de magnetita, "Mengxi Bitan
// coletado" etc., também no canto superior direito). Perto do fim de uma
// cena (ex.: gatilho final em x alto, câmera no limite direito do nível),
// essas caixas coincidem na tela e ficam ilegíveis sobrepostas. Esta função
// empurra a caixa para baixo de qualquer área reservada com que colida.
function _reservedUiRects(){
  const rects=[];
  const pr=POPUP.rect(); if(pr) rects.push(pr);
  // Faixa do HUD onde ficam o contador de estrelas/magnetita e a lista de
  // itens especiais coletados (ex.: "📚 Mengxi Bitan coletado").
  rects.push({x:W-260,y:36,w:256,h:60});
  return rects;
}
function _avoidPopup(bx,by,tw){
  const boxL=bx-tw/2, boxR=bx+tw/2, boxT=by-16, boxB=by+8;
  for(const r of _reservedUiRects()){
    if(boxR>r.x && boxL<r.x+r.w && boxB>r.y && boxT<r.y+r.h) return r.y+r.h+24;
  }
  return by;
}

// ── Item Definitions ──────────────────────────────────────────────
const ITEM_DEFS={
  // Herdados
  picareta_basica:  { cat:'ferramenta',nome:'Picareta Básica',       icon:'⛏',fase:'1.1',desc:'Extrai minérios das paredes rochosas.\nEssencial nas minas de Potosí.' },
  maco_pedra:       { cat:'ferramenta',nome:'Maço de Pedra',         icon:'🪨',fase:'2.3',desc:'Percussão a frio Anishinaabe.\nExtrai cobre nativo do basalto.' },
  picareta_calcario:{ cat:'ferramenta',nome:'Picareta de Calcário',  icon:'⛏',fase:'3.3',desc:'Adaptada para rocha sedimentar.\nRevela veias de cinábrio com precisão.' },
  machado_item:     { cat:'ferramenta',nome:'Machado de Pedra Tuaregue',icon:'🪓',fase:'4.3',desc:'Golpe HORIZONTAL para separar lajes de sal.' },
  // Novas
  picareta_aco_song:{ cat:'ferramenta',nome:'Picareta de Aço Song',  icon:'⛏',fase:'5.3',desc:'Forjada no aço de alta qualidade Song,\nresistente a rocha metamórfica densa.\nO aço chinês do séc. XI superava o europeu\nde 1700 — sete séculos de vantagem.' },
  bacia_laqueada:   { cat:'ferramenta',nome:'Bacia de Madeira Laqueada',icon:'🥣',fase:'5.3',desc:'Bacia laqueada não-magnética.\nA laca impede que o material interfira\ncom a medição magnética. Usada por Shen Kuo\npara suspender a agulha sobre água.' },
  agulha_aco:       { cat:'ferramenta',nome:'Agulha de Costura de Aço',icon:'🪡',fase:'5.3',desc:'Agulha de aço fina, presente da Grua.\nFriccionada contra magnetita = agulha magnetizada.\nSuspensa sobre água = primeira bússola da história.' },
  bussola:          { cat:'ferramenta',nome:'Bússola (agulha + bacia)',icon:'🧭',fase:'5.3',desc:'A primeira bússola da história.\nAgulha magnetizada flutuando em água.\nAponta para o norte magnético — sempre.\nGuiou Vasco da Gama, Colombo e Magalhães.' },
  // Minérios
  cobre_nativo:     { cat:'minerio', nome:'Cobre Nativo',     icon:'🟠',fase:'2.3',desc:'Tradição Anishinaabe.',multiple:true },
  cinabrio:         { cat:'minerio', nome:'Cinábrio (HgS)',   icon:'🔴',fase:'3.3',desc:'Sulfeto de mercúrio escarlate.',multiple:true },
  halita:           { cat:'minerio', nome:'Halita Saariana',  icon:'⬜',fase:'4.3',desc:'Sal de Taoudenni.',multiple:true },
  magnetita:        { cat:'minerio', nome:'Magnetita (Fe₃O₄)',icon:'⬛',fase:'5.3',desc:'Óxido de ferro magnético — o mineral mais\nmagnético da natureza. Estrutura espinélio\nalinha domínios magnéticos.\nOs chineses Song a chamavam de cí shí\n(慈石) — "pedra que ama o ferro".',multiple:true },
  // Artefatos
  tumi_dourado:     { cat:'artefato',nome:'Tumi de Ouro Inca',icon:'🥇',fase:'1.3',desc:'Faca ritual Inca de ouro.' },
  frasco_mercurio:  { cat:'artefato',nome:'Frasco de Mercúrio',icon:'⚗️',fase:'3.3',desc:'10.000 km de Almadén a Potosí.' },
  manuscrito_item:  { cat:'artefato',nome:'Manuscrito de Timbuktu',icon:'📜',fase:'4.3',desc:'Mineralogia Anishinaabe-árabe.' },
  mengxi_bitan:     { cat:'artefato',nome:'Mengxi Bitan (1088)',icon:'📚',fase:'5.3',desc:'Dream Pool Essays — primeira descrição\ncientífica da bússola magnética por Shen Kuo.\nIncluindo a declinação magnética.\nChegou à Europa em tradução árabe no séc. XII,\ne tornou possível Vasco da Gama, Colombo, Magalhães.' },
};
const TIPO_TO_JOURNAL={
  picareta_aco:'picareta_aco_song', bacia:'bacia_laqueada',
  agulha:'agulha_aco', bussola:'bussola',
  magnetita:'magnetita', mengxi:'mengxi_bitan',
};

// ── Inventory ─────────────────────────────────────────────────────
const INV={
  open:false,tab:0,cursor:0,
  TABS:[{id:'ferramenta',label:'🔧 Ferramentas',color:'#e04030'},{id:'minerio',label:'⛏ Minérios',color:'#c02020'},{id:'artefato',label:'🏺 Artefatos',color:'#d04040'}],
  tabItems(player){ const cat=this.TABS[this.tab].id; let col={};
    try{const s=localStorage.getItem('mineralis_save_v2');if(s){const j=JSON.parse(s);col=j.coletados||{};}}catch(e){}
    for(const tipo of player.items){const jid=TIPO_TO_JOURNAL[tipo]||tipo;col[jid]=true;}
    const magN=player.items.filter(i=>i==='magnetita').length;
    const out=[]; for(const [id,def] of Object.entries(ITEM_DEFS)){ if(def.cat!==cat) continue;
      if(def.multiple){ if(magN>0&&id==='magnetita') out.push({id,...def,count:magN}); else if(col[id]&&id!=='magnetita') out.push({id,...def,count: typeof col[id]==='number'?col[id]:1}); }
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
    ctx.shadowColor='rgba(0,0,0,0.7)';ctx.shadowBlur=20;ctx.fillStyle='rgba(4,3,0,0.97)';_rr(PX,PY,PW,PH,16);ctx.fill();ctx.shadowBlur=0;
    ctx.strokeStyle='#8a2010';ctx.lineWidth=2.5;_rr(PX,PY,PW,PH,16);ctx.stroke();
    ctx.fillStyle='#e04030';ctx.font='bold 16px "Courier New"';ctx.textAlign='center';ctx.fillText('📔  DIÁRIO DE BORDO',W/2,PY+28);ctx.textAlign='left';
    ctx.fillStyle='rgba(180,40,20,0.3)';ctx.fillRect(PX+16,PY+38,PW-32,1);
    const TAB_W=PW/3,TAB_Y=PY+44;
    this.TABS.forEach((tab,i)=>{ const tx=PX+i*TAB_W,active=(i===this.tab); ctx.fillStyle=active?'rgba(180,40,20,0.18)':'rgba(0,0,0,0.3)';ctx.fillRect(tx+2,TAB_Y,TAB_W-4,34); ctx.fillStyle=active?tab.color:'#666';ctx.font=(active?'bold ':'')+'13px "Courier New"';ctx.textAlign='center';ctx.fillText(tab.label,tx+TAB_W/2,TAB_Y+22);ctx.textAlign='left'; if(active){ctx.fillStyle=tab.color;ctx.fillRect(tx+2,TAB_Y+32,TAB_W-4,3);} });
    const CY=TAB_Y+40,CH=PH-(CY-PY)-50,items=this.tabItems(player),COL_W=260,DESC_X=PX+280;
    if(items.length===0){ ctx.fillStyle='#554';ctx.font='14px "Courier New"';ctx.textAlign='center';ctx.fillText('Nenhum item coletado ainda.',W/2,CY+CH/2);ctx.fillText('Explore a fase para desbloquear!',W/2,CY+CH/2+24);ctx.textAlign='left'; }
    else { const ROW_H=52,maxRows=Math.max(1,Math.floor(CH/ROW_H));
      const scrollTop=items.length>maxRows?Math.max(0,Math.min(this.cursor-maxRows+1,items.length-maxRows)):0;
      const visible=items.slice(scrollTop,scrollTop+maxRows);
      visible.forEach((item,vi)=>{ const i=scrollTop+vi; const iy=CY+16+vi*ROW_H,sel=(i===this.cursor),eq=(player.activeTool===item.id); if(sel){ctx.fillStyle='rgba(180,40,20,0.18)';_rr(PX+16,iy-10,COL_W,46,8);ctx.fill();ctx.strokeStyle='#e04030';ctx.lineWidth=1.5;_rr(PX+16,iy-10,COL_W,46,8);ctx.stroke();} const cnt=item.count>1?' ×'+item.count:''; ctx.font='20px serif';ctx.fillText(item.icon,PX+28,iy+20); ctx.font=(eq?'bold ':'')+'14px "Courier New"';ctx.fillStyle=eq?'#ffe060':(sel?'#f0e8c0':'#aaa');ctx.fillText(item.nome+cnt,PX+62,iy+14); });
      if(scrollTop>0){ ctx.font='11px "Courier New"';ctx.fillStyle='#e04030';ctx.textAlign='center';ctx.fillText('▲ mais',PX+16+COL_W/2,CY+8);ctx.textAlign='left'; }
      if(scrollTop+maxRows<items.length){ ctx.font='11px "Courier New"';ctx.fillStyle='#e04030';ctx.textAlign='center';ctx.fillText('▼ mais',PX+16+COL_W/2,CY+16+maxRows*ROW_H+2);ctx.textAlign='left'; }
      const sel=items[this.cursor]; if(sel){ ctx.fillStyle='rgba(180,40,20,0.08)';_rr(DESC_X,CY,PW-DESC_X+PX-16,CH-10,8);ctx.fill(); ctx.font='44px serif';ctx.textAlign='center';ctx.fillText(sel.icon,DESC_X+(PW-DESC_X+PX-16)/2,CY+68); ctx.font='bold 15px "Courier New"';ctx.fillStyle='#e04030';ctx.fillText(sel.nome,DESC_X+(PW-DESC_X+PX-16)/2,CY+98); const catL={ferramenta:'🔧 Ferramenta',minerio:'⛏ Minério',artefato:'🏺 Artefato'}; ctx.font='11px "Courier New"';ctx.fillStyle='#888';ctx.fillText(catL[sel.cat],DESC_X+(PW-DESC_X+PX-16)/2,CY+116);ctx.textAlign='left';ctx.fillStyle='rgba(180,40,20,0.25)';ctx.fillRect(DESC_X+20,CY+124,PW-DESC_X+PX-56,1); const descLines=sel.desc.split('\n');ctx.font='13px "Courier New"';ctx.fillStyle='#f0e8c0';descLines.forEach((l,i)=>{ctx.textAlign='center';ctx.fillText(l,DESC_X+(PW-DESC_X+PX-16)/2,CY+144+i*22);});ctx.textAlign='left';
        if(sel.cat==='ferramenta'){ const btnTxt=player.activeTool===sel.id?'[E] Desequipar':'[E] Equipar'; ctx.fillStyle=player.activeTool===sel.id?'rgba(180,80,20,0.3)':'rgba(180,40,20,0.2)';_rr(DESC_X+40,CY+CH-60,PW-DESC_X+PX-96,34,8);ctx.fill();ctx.strokeStyle=player.activeTool===sel.id?'#c04020':'#e04030';ctx.lineWidth=1.5;_rr(DESC_X+40,CY+CH-60,PW-DESC_X+PX-96,34,8);ctx.stroke(); ctx.font='bold 13px "Courier New"';ctx.fillStyle=player.activeTool===sel.id?'#e06040':'#e04030';ctx.textAlign='center';ctx.fillText(btnTxt,DESC_X+(PW-DESC_X+PX-16)/2,CY+CH-38);ctx.textAlign='left'; } } }
    ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(PX,PY+PH-38,PW,38);ctx.fillStyle='rgba(180,40,20,0.3)';ctx.fillRect(PX+16,PY+PH-39,PW-32,1);ctx.font='11px "Courier New"';ctx.fillStyle='#888';ctx.textAlign='center';ctx.fillText('◀ ▶ Abas   ↑ ↓ Navegar   E Equipar/Desequipar   I Fechar',W/2,PY+PH-14);ctx.textAlign='left';
  }
};

// ── Dialog Bubble ─────────────────────────────────────────────────
let dlgFaceT=0;
const BUBBLE={
  active:false,queue:[],cb:null,lines:[],speakerTxt:'CORVAN',faceFrame:0,
  // FIX: se o Diário (INV) ficasse aberto quando um diálogo automático fosse
  // disparado (ex.: aviso de hematita ao encostar num depósito), checkDlg()
  // exige "!INV.open" para avançar o balão — com o Diário aberto, [E] nunca
  // fecha o diálogo e o jogo trava permanentemente nessa mensagem. Fechamos
  // o Diário à força sempre que um novo diálogo começa.
  show(messages,cb,speaker='CORVAN'){ if(INV.open) INV.close(); this.queue=[...messages];this.cb=cb;this.active=true;this.speakerTxt=speaker;G.dialog=true;this._next(); },
  _next(){ if(!this.queue.length){ this.active=false;G.dialog=false; if(this.cb){const f=this.cb;this.cb=null;f();} return; } this.lines=wrapText(this.queue.shift(),480); },
  advance(){ if(this.active) this._next(); },
  draw(player){
    if(!this.active) return; this.faceFrame+=0.08;
    const FONT='15px "Courier New"',NAMEFNT='bold 12px "Courier New"'; ctx.font=FONT;
    const lineH=22,pad=18,faceW=56,faceH=68,textAreaW=480;
    const bubW=faceW+pad+textAreaW+pad*2; const bubH=Math.max(faceH,this.lines.length*lineH+30)+pad*2;
    const pcx=player.x-cam.x+player.w/2,pcy=player.y-cam.y;
    let bx=pcx-bubW/2,by=pcy-bubH-28; bx=Math.max(12,Math.min(bx,W-bubW-12)); if(by<40)by=pcy+player.h+10; by=Math.max(40,Math.min(by,H-bubH-10));
    ctx.shadowColor='rgba(0,0,0,0.6)';ctx.shadowBlur=12; ctx.fillStyle='rgba(4,3,0,0.95)';roundRect(bx,by,bubW,bubH,14);ctx.fill();ctx.shadowBlur=0;
    ctx.strokeStyle='#c02010';ctx.lineWidth=2.5;roundRect(bx,by,bubW,bubH,14);ctx.stroke();
    const tailBaseX=Math.max(bx+30,Math.min(pcx,bx+bubW-30)),tailTopY=by+bubH,tailTipX=pcx,tailTipY=Math.min(pcy,tailTopY+36);
    ctx.fillStyle='rgba(4,3,0,0.95)'; ctx.beginPath();ctx.moveTo(tailBaseX-14,tailTopY);ctx.lineTo(tailBaseX+14,tailTopY);ctx.lineTo(tailTipX,tailTipY);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#c02010';ctx.lineWidth=2; ctx.beginPath();ctx.moveTo(tailBaseX-14,tailTopY);ctx.lineTo(tailTipX,tailTipY);ctx.lineTo(tailBaseX+14,tailTopY);ctx.stroke();
    const fx=bx+pad,fy=by+pad;
    CORVAN.drawFace(ctx, this.faceFrame, fx, fy, faceW, faceH);
    ctx.strokeStyle='rgba(200,40,20,0.5)';ctx.lineWidth=1.5;ctx.strokeRect(fx,fy,faceW,faceH);
    const tx=fx+faceW+pad; ctx.font=NAMEFNT;ctx.fillStyle='#e04030';ctx.fillText(this.speakerTxt,tx,by+pad+14);
    ctx.fillStyle='rgba(200,40,20,0.35)';ctx.fillRect(tx,by+pad+20,textAreaW,1);
    ctx.font=FONT;ctx.fillStyle='#f0e8c0';this.lines.forEach((l,i)=>ctx.fillText(l,tx,by+pad+36+i*lineH));
    const pulse=0.55+Math.sin(Date.now()/400)*0.45; ctx.fillStyle=`rgba(200,40,20,${pulse})`;ctx.font='12px "Courier New"';ctx.textAlign='right';ctx.fillText('[E] Continuar →',bx+bubW-pad,by+bubH-8);ctx.textAlign='left';
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
  ctx.fillStyle='rgba(0,0,0,0.82)';roundRect(nx,ny,tw,28,6);ctx.fill();ctx.strokeStyle='#e04030';ctx.lineWidth=1.5;roundRect(nx,ny,tw,28,6);ctx.stroke();
  ctx.fillStyle='#e04030';ctx.textAlign='center';ctx.fillText(notifText,W/2,ny+19);ctx.textAlign='left';ctx.restore();
}

// ── Pop-up informativo ────────────────────────────────────────────
const POPUP={ active:false,title:'',lines:[],icon:'⬛',timer:0,
  // FIX: o corpo do texto era só um text.split('\n') — dependia do autor ter
  // quebrado as linhas manualmente do tamanho certo para a caixa (PW=370).
  // Qualquer frase um pouco mais longa "estourava" pela borda direita (ex.:
  // "...pedra que ama o ferro" cortado). Agora usa wrapText() para calcular
  // a quebra de linha de verdade, a partir da largura real disponível.
  show(title,icon,text,duration=8000){this.active=true;this.title=title;this.icon=icon;this.lines=wrapText(text,370-16-16,'12px "Courier New"');this.timer=duration;},
  tick(){if(this.timer>0){this.timer-=16;if(this.timer<=0)this.active=false;}},
  // Retângulo atual na tela (usado por outros elementos flutuantes — como
  // tooltips de Trigger/Col — para não desenhar por cima do POPUP).
  rect(){ if(!this.active) return null; const PW=370,PH=this.lines.length*20+100,PX=W-PW-20,PY=60; return {x:PX,y:PY,w:PW,h:PH}; },
  draw(){ if(!this.active)return; const alpha=Math.min(1,this.timer/400); const PW=370,PH=this.lines.length*20+100,PX=W-PW-20,PY=60;
    ctx.save();ctx.globalAlpha=alpha; ctx.fillStyle='rgba(4,3,0,0.94)';_rr(PX,PY,PW,PH,12);ctx.fill();ctx.strokeStyle='#c02010';ctx.lineWidth=2;_rr(PX,PY,PW,PH,12);ctx.stroke();
    ctx.font='32px serif';ctx.textAlign='center';ctx.fillText(this.icon,PX+40,PY+46);
    // FIX: textAlign ficava 'center' (herdado do ícone acima) ao desenhar o
    // título — mesmo bug já corrigido na Fase5-2 (task #92). Reset explícito
    // + encolhimento defensivo de fonte para títulos mais longos.
    ctx.textAlign='left';
    const titleMaxW=PX+PW-16-(PX+60);
    let tfs=13; ctx.font='bold '+tfs+'px "Courier New"';
    while(ctx.measureText(this.title).width>titleMaxW&&tfs>9){ tfs--; ctx.font='bold '+tfs+'px "Courier New"'; }
    ctx.fillStyle='#e04030';ctx.fillText(this.title,PX+60,PY+28);
    ctx.font='12px "Courier New"';ctx.fillStyle='#f0e8c0';ctx.textAlign='left';this.lines.forEach((l,i)=>ctx.fillText(l,PX+16,PY+52+i*20));ctx.restore(); }
};

// ── Magnetita Deposit (extração com picareta) ─────────────────────
class MagnetitaDeposit {
  constructor(x,y,isReal){
    this.x=x; this.y=y; this.w=48; this.h=36;
    this.isReal=isReal;       // true = magnetita, false = hematita
    this.exposed=false;       // após picareta golpear
    this.tested=false;        // após teste com agulha
    this.done=false;          // após coletado/finalizado
    this.t=Math.random()*Math.PI*2;
    this.hits=0;
    this.magneticPulse=0;     // pulso de brilho quando picareta atrai fragmentos
  }
  tick(){ this.t+=0.04; if(this.magneticPulse>0) this.magneticPulse--; }
  draw(){
    if(this.done) return;
    const sx=this.x-cam.x, sy=this.y-cam.y+Math.sin(this.t)*2;
    if(sx<-60||sx>W+60) return;
    ctx.save(); ctx.translate(sx, sy);
    // Bloco preto-acinzentado (ambos iguais visualmente)
    ctx.fillStyle='#1a1a20'; ctx.fillRect(0,0,this.w,this.h);
    ctx.fillStyle='#2a2a30'; ctx.fillRect(2,2,this.w-4,this.h-4);
    ctx.fillStyle='#3a3a42'; ctx.fillRect(4,4,this.w-8,8);
    // Brilho metálico
    ctx.fillStyle='rgba(180,180,200,0.5)'; ctx.fillRect(8,6,12,4);
    ctx.strokeStyle='#0a0a10'; ctx.lineWidth=1; ctx.strokeRect(0,0,this.w,this.h);
    // Se exposto, indicador de estado
    if(this.exposed){
      if(this.isReal&&this.tested){
        // Magnetita confirmada — brilho magnético + fragmentos atraídos
        const pulse=0.4+Math.sin(this.t*2)*0.4;
        ctx.fillStyle=`rgba(100,150,220,${pulse*0.4})`;
        ctx.fillRect(-6,-6,this.w+12,this.h+12);
        ctx.font='bold 10px "Courier New"'; ctx.fillStyle='#80c8ff'; ctx.textAlign='center';
        ctx.fillText('⬛ MAGNETITA',this.w/2,-8); ctx.textAlign='left';
      } else if(!this.isReal&&this.tested){
        // Hematita confirmada — apagado
        ctx.font='bold 10px "Courier New"'; ctx.fillStyle='#c87060'; ctx.textAlign='center';
        ctx.fillText('❌ HEMATITA',this.w/2,-8); ctx.textAlign='left';
      } else {
        ctx.font='bold 10px "Courier New"'; ctx.fillStyle='#a0a0b0'; ctx.textAlign='center';
        ctx.fillText('? Testar com agulha',this.w/2,-8); ctx.textAlign='left';
      }
    } else {
      const pulse=0.5+Math.sin(this.t*1.5)*0.5;
      ctx.fillStyle=`rgba(200,80,40,${pulse})`;
      ctx.font='bold 10px "Courier New"'; ctx.textAlign='center';
      ctx.fillText('[E] Escavar com ⛏',this.w/2,-8); ctx.textAlign='left';
      // Barra de progresso de hits
      if(this.hits>0){ ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(0,this.h+2,this.w,4); ctx.fillStyle='#c84020';ctx.fillRect(0,this.h+2,this.w*(this.hits/3),4); }
    }
    // Magnetic pulse — limalhas voando para o bloco quando picareta golpeia
    if(this.magneticPulse>0 && this.isReal){
      const a=this.magneticPulse/30;
      ctx.fillStyle=`rgba(180,180,220,${a*0.6})`;
      for(let i=0;i<4;i++){
        const fa=Math.PI*2*i/4 + this.t;
        const fd=20+Math.sin(this.t*3+i)*5;
        const fx=this.w/2 + Math.cos(fa)*fd;
        const fy=this.h/2 + Math.sin(fa)*fd;
        ctx.fillRect(fx-1,fy-1,2,2);
      }
    }
    ctx.restore();
  }
}

// ── Grua de Coroa Vermelha companion ──────────────────────────────
class GruaCoroaVermelha {
  constructor(){
    this.x=400; this.y=300; this.angle=0; this.frame=0;
    this.sparks=[]; this.sparkT=0;
    this.visible=false; this.state='orbit'; this.landX=0; this.landY=0;
  }
  update(player){
    this.frame+=0.04; this.sparkT++;
    if(this.state==='orbit'){
      this.angle+=0.012;
      const orbitR=140;
      const orbitX=player.x+Math.cos(this.angle)*orbitR*1.5;
      const orbitY=player.y-150+Math.sin(this.angle)*orbitR*0.4;
      this.x+=(orbitX-this.x)*0.035; this.y+=(orbitY-this.y)*0.035;
    } else if(this.state==='land'){
      this.x+=(this.landX-this.x)*0.06; this.y+=(this.landY-this.y)*0.06;
      if(Math.abs(this.x-this.landX)<8&&Math.abs(this.y-this.landY)<8) this.state='landed';
    } else if(this.state==='walk'){
      // FIX: na Cena4 ela sobrevoava o Corvan a fase inteira (state='orbit'
      // padrão), o que não fazia sentido para o hint "Siga a Grua" — uma
      // guia deveria CAMINHAR no chão à frente dele, não voar. 'y' fica fixo
      // (definido externamente ao nível do piso); só o x se move, seguindo
      // um pouco na frente do Corvan e esperando se ele ficar muito atrás.
      const lead=110;
      if(Math.abs(player.vx)>0.3) this._walkDir=player.vx<0?-1:1;
      const dir=this._walkDir||1;
      const targetX=player.x+lead*dir;
      this.x+=(targetX-this.x)*0.05;
    }
    if(this.sparkT%18===0 && this.state==='orbit'){
      this.sparks.push({x:this.x,y:this.y,vx:(Math.random()-.5)*.5,vy:(Math.random()+.2)*.4,life:60,max:60,size:2+Math.random()*2});
    }
    for(let i=this.sparks.length-1;i>=0;i--){const s=this.sparks[i];s.x+=s.vx;s.y+=s.vy;s.life--;if(s.life<=0)this.sparks.splice(i,1);}
  }
  land(x,y){ this.state='land'; this.landX=x; this.landY=y; }
  draw(){
    for(const s of this.sparks){
      ctx.save();ctx.globalAlpha=(s.life/s.max)*0.5;
      ctx.fillStyle='#e02020';
      ctx.beginPath();ctx.arc(s.x-cam.x,s.y-cam.y,s.size*(s.life/s.max),0,Math.PI*2);ctx.fill();ctx.restore();
    }
    const sx=this.x-cam.x, sy=this.y-cam.y;
    if(sx<-100||sx>W+100) return;
    ctx.save();
    if(this.state==='orbit'){
      const glow=ctx.createRadialGradient(sx,sy,0,sx,sy,55);
      glow.addColorStop(0,'rgba(220,40,40,0.16)'); glow.addColorStop(1,'rgba(220,40,40,0)');
      ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(sx,sy,55,0,Math.PI*2); ctx.fill();
    }
    if(IMG['grua_img']&&IMG['grua_img'].complete&&IMG['grua_img'].naturalWidth>0){
      const dw=100, dh=100;
      // FIX: o bob (oscilação senoidal vertical) era aplicado sempre, mesmo
      // parada/andando no chão — fazia parecer flutuando/voando. Agora só
      // oscila enquanto ela realmente voa (orbit/land); parada ou andando
      // (landed/walk) fica com os pés fixos no chão.
      const bob=(this.state==='orbit'||this.state==='land')?Math.sin(this.frame*1.5)*5:0;
      const flipLeft=(this.state==='walk')?(this._walkDir||1)<0:Math.cos(this.angle)<0;
      if(flipLeft){ctx.translate(sx+dw/2,sy-dh/2+bob);ctx.scale(-1,1);}
      else ctx.translate(sx-dw/2,sy-dh/2+bob);
      ctx.drawImage(IMG['grua_img'],0,0,96,96,0,0,dw,dh);
    } else {
      // Fallback grua vetorial
      ctx.translate(sx,sy);
      const bob=(this.state==='orbit'||this.state==='land')?Math.sin(this.frame*1.5)*5:0;
      // Corpo branco
      ctx.fillStyle='#f8f8f0'; ctx.beginPath(); ctx.ellipse(0,bob,24,14,0,0,Math.PI*2); ctx.fill();
      // Pescoço longo
      ctx.fillRect(-2, bob-30, 4, 24);
      // Cabeça
      ctx.beginPath(); ctx.arc(0,bob-32,8,0,Math.PI*2); ctx.fill();
      // Coroa vermelha (tufo)
      ctx.fillStyle='#e02020'; ctx.fillRect(-4,bob-40,8,5);
      ctx.fillStyle='#ff4040'; ctx.fillRect(-3,bob-42,6,3);
      // Olho
      ctx.fillStyle='#1a1010'; ctx.fillRect(2,bob-34,2,2);
      // Bico
      ctx.fillStyle='#d0a040'; ctx.fillRect(8,bob-33,8,2);
      // Pernas finas pretas
      ctx.fillStyle='#101010'; ctx.fillRect(-6,bob+10,2,18); ctx.fillRect(4,bob+10,2,18);
      // Asas com listras pretas
      ctx.fillStyle='#181818'; ctx.fillRect(-22,bob-2,16,8);
    }
    ctx.restore();
  }
}

// ── Streak Test (teste do risco em cerâmica) ─────────────────────
class StreakPlate {
  constructor(x,y){ this.x=x; this.y=y; this.w=80; this.h=24; this.streaks=[]; this.t=0; }
  tick(){ this.t+=0.04; }
  addStreak(color){ this.streaks.push({color, x:Math.random()*(this.w-20)+10, y:Math.random()*8+8, length:14+Math.random()*8, life:300}); }
  draw(){
    const sx=this.x-cam.x, sy=this.y-cam.y;
    if(sx<-100||sx>W+100) return;
    ctx.save(); ctx.translate(sx,sy);
    // Placa de cerâmica branca
    ctx.fillStyle='#e8e0d0'; ctx.fillRect(0,0,this.w,this.h);
    ctx.fillStyle='#f0e8d8'; ctx.fillRect(2,2,this.w-4,this.h-4);
    ctx.strokeStyle='#a09080'; ctx.lineWidth=1; ctx.strokeRect(0,0,this.w,this.h);
    // Riscos
    for(const s of this.streaks){
      ctx.strokeStyle=s.color; ctx.lineWidth=2.5;
      ctx.beginPath(); ctx.moveTo(s.x,s.y); ctx.lineTo(s.x+s.length,s.y); ctx.stroke();
    }
    // Label
    ctx.font='bold 10px "Courier New"'; ctx.fillStyle='#806040'; ctx.textAlign='center';
    ctx.fillText('CERÂMICA — TESTE DO RISCO', this.w/2, this.h+12); ctx.textAlign='left';
    if(this.streaks.length===0){
      const pulse=0.5+Math.sin(this.t*2)*0.5;
      ctx.fillStyle=`rgba(200,80,40,${pulse})`;
      ctx.fillText('[E] Riscar pedra aqui', this.w/2, -6); ctx.textAlign='left';
    }
    ctx.restore();
  }
}

// ── Compass (bússola interativa) ─────────────────────────────────
class Compass {
  constructor(){
    this.angle=0;          // ângulo atual da agulha (radianos)
    this.targetAngle=0;    // norte = -PI/2 (cima)
    this.activated=false;  // bússola pronta?
    this.aligned=false;    // alinhada ao norte?
    this.t=0;
  }
  activate(){ this.activated=true; this.angle=Math.random()*Math.PI*2; this.t=0; sfx('plof'); }
  tick(){
    if(!this.activated) return;
    this.t+=0.04;
    // Norte real do mundo: cima (-PI/2)
    this.targetAngle = -Math.PI/2;
    // Agulha gira suavemente em direção ao alvo
    let delta = this.targetAngle - this.angle;
    while(delta > Math.PI) delta -= Math.PI*2;
    while(delta < -Math.PI) delta += Math.PI*2;
    this.angle += delta * 0.05;
    if(Math.abs(delta) < 0.05 && !this.aligned){ this.aligned=true; sfx('compass_ok'); notify('🧭 Bússola alinhada ao Norte!'); }
  }
  draw(){
    if(!this.activated) return;
    // Bússola flutuante no canto inferior direito do HUD
    const cx=W-110, cy=H-110, R=46;
    ctx.save();
    // Bacia laqueada vermelha
    ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.arc(cx,cy,R+8,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#a01010'; ctx.beginPath(); ctx.arc(cx,cy,R+5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#c02020'; ctx.beginPath(); ctx.arc(cx,cy,R+2,0,Math.PI*2); ctx.fill();
    // Água
    ctx.fillStyle='#3a5870'; ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#4a7090'; ctx.beginPath(); ctx.arc(cx-4,cy-4,R-8,0,Math.PI*2); ctx.fill();
    // Marcadores cardinais (visualmente N=cima)
    ctx.font='bold 10px "Courier New"'; ctx.fillStyle='#fff'; ctx.textAlign='center';
    ctx.fillText('N',cx,cy-R-6); ctx.fillText('S',cx,cy+R+14);
    ctx.fillText('L',cx+R+10,cy+4); ctx.fillText('O',cx-R-10,cy+4);
    // Agulha
    ctx.save(); ctx.translate(cx,cy); ctx.rotate(this.angle + Math.PI/2);
    // Ponta vermelha (norte)
    ctx.fillStyle='#e02020'; ctx.fillRect(-2,-R+4,4,R-4);
    ctx.fillStyle='#ff4040'; ctx.fillRect(-1,-R+4,2,R-6);
    // Ponta cinza (sul)
    ctx.fillStyle='#888'; ctx.fillRect(-2,0,4,R-4);
    // Centro
    ctx.fillStyle='#c0c8d0'; ctx.beginPath(); ctx.arc(0,0,3,0,Math.PI*2); ctx.fill();
    ctx.restore();
    // Glow quando alinhada
    if(this.aligned){
      const pulse=0.4+Math.sin(this.t*2)*0.3;
      ctx.fillStyle=`rgba(80,180,255,${pulse*0.2})`;
      ctx.beginPath(); ctx.arc(cx,cy,R+12,0,Math.PI*2); ctx.fill();
    }
    ctx.font='10px "Courier New"'; ctx.fillStyle='#e04030'; ctx.textAlign='center';
    ctx.fillText('🧭 BÚSSOLA',cx,cy+R+30);
    ctx.textAlign='left'; ctx.restore();
  }
}

// ── Enemy — guardas Song e morcegos da mina ──────────────────────
class Enemy{
  constructor(x,y,type,patrol){
    this.x=x;this.y=y;this.spawnX=x;this.type=type;
    this.w=type==='morcego'?32:42; this.h=type==='morcego'?22:56;
    this.patrol=patrol;this.vx=type==='morcego'?2:1.2;this.facing=1;this.dead=false;this.frame=0;
    if(type==='morcego') this.baseY=y;
  }
  update(plats,player){
    if(this.dead)return;
    this.x+=this.vx; this.frame+=0.08;
    if(this.type==='morcego'){
      this.y=this.baseY+Math.sin(this.frame*2)*12;
      if(Math.abs(this.x-this.spawnX)>this.patrol) this.vx=-this.vx;
      this.facing=this.vx>0?1:-1; return;
    }
    let onG=false;
    for(const p of plats){if(p.type==='spike'||p.type==='_dead')continue;if(this.x+this.w>p.x&&this.x<p.x+p.w&&this.y+this.h>=p.y&&this.y+this.h<=p.y+10)onG=true;}
    const edge=this.vx>0?this.x+this.w:this.x; let onEdge=false;
    for(const p of plats){if(p.type==='spike'||p.type==='_dead')continue;if(edge>p.x&&edge<p.x+p.w&&this.y+this.h+2>=p.y&&this.y+this.h+2<=p.y+12)onEdge=true;}
    if((onG&&!onEdge)||Math.abs(this.x-this.spawnX)>this.patrol)this.vx=-this.vx;
    this.facing=this.vx>0?1:-1;
  }
  draw(){
    if(this.dead)return;
    const sx=this.x-cam.x,sy=this.y-cam.y; if(sx<-80||sx>W+80)return;
    ctx.save(); ctx.translate(sx+this.w/2,sy+this.h);
    if(this.facing===-1) ctx.scale(-1,1);
    if(this.type==='guarda'){
      // Guarda Song — armadura escura com detalhes vermelhos
      ctx.fillStyle='#3a2010'; ctx.fillRect(-18,-52,36,52);
      ctx.fillStyle='#502820'; ctx.fillRect(-16,-50,32,20);
      // Capacete cônico chinês
      ctx.fillStyle='#28201a'; ctx.fillRect(-14,-58,28,8);
      ctx.beginPath(); ctx.moveTo(-12,-58); ctx.lineTo(0,-66); ctx.lineTo(12,-58); ctx.closePath(); ctx.fill();
      // Detalhes vermelhos (gola)
      ctx.fillStyle='#c02020'; ctx.fillRect(-12,-38,24,4);
      // Rosto
      ctx.fillStyle='#c8a070'; ctx.fillRect(-4,-50,8,8);
      // Espada/lança
      ctx.fillStyle='#888'; ctx.fillRect(-22,-46,4,30);
      ctx.fillStyle='#c0c0c8'; ctx.fillRect(-21,-46,2,4);
      // Pernas
      ctx.fillStyle='#1a1008'; ctx.fillRect(-14,-28,12,28); ctx.fillRect(2,-28,12,28);
    } else {
      // Morcego da mina
      const flap=Math.abs(Math.sin(this.frame*3))*6;
      ctx.fillStyle='#28202a';
      ctx.beginPath(); ctx.ellipse(0,-6,8,5,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#1a1218'; ctx.beginPath(); ctx.arc(0,-10,5,0,Math.PI*2); ctx.fill();
      // Asas
      ctx.fillStyle='#382838';
      ctx.beginPath(); ctx.moveTo(-7,-7); ctx.lineTo(-18,-12-flap); ctx.lineTo(-20,-4-flap); ctx.lineTo(-7,-2); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(7,-7); ctx.lineTo(18,-12-flap); ctx.lineTo(20,-4-flap); ctx.lineTo(7,-2); ctx.closePath(); ctx.fill();
      // Olhos vermelhos
      ctx.fillStyle='#e02020'; ctx.fillRect(-2,-11,1.5,1.5); ctx.fillRect(1,-11,1.5,1.5);
    }
    ctx.restore();
  }
}

// ── Col (collectible itens flutuantes) ────────────────────────────
// Ferramentas coletáveis (exigem [E] e mostram alerta padrão) — magnetita e
// mengxi continuam sendo coletados automaticamente ao encostar (minério/artefato).
const TOOL_LABELS={picareta_aco:'Picareta de Aço Song',bacia:'Bacia de Madeira Laqueada',agulha:'Agulha de Costura de Aço'};

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
      glow.addColorStop(0,`rgba(224,64,48,${0.35+pulse*0.2})`); glow.addColorStop(1,'rgba(224,64,48,0)');
      ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(sx+15,sy+15,26,0,Math.PI*2); ctx.fill();
    }
    ctx.save(); ctx.translate(sx+15, sy+15);
    if(this.type==='picareta_aco'){
      if(IMG['picareta_img']) ctx.drawImage(IMG['picareta_img'],0,0,48,48,-15,-15,30,30);
      else { ctx.fillStyle='#787890';ctx.fillRect(-12,-8,24,10); ctx.fillStyle='#7a4820';ctx.fillRect(-4,-2,4,16); }
    } else if(this.type==='bacia'){
      if(IMG['bacia_img']) ctx.drawImage(IMG['bacia_img'],0,0,48,48,-15,-15,30,30);
      else { ctx.fillStyle='#c02020';ctx.beginPath();ctx.arc(0,2,12,0,Math.PI*2);ctx.fill(); ctx.fillStyle='#3a5870';ctx.beginPath();ctx.arc(0,0,8,0,Math.PI*2);ctx.fill(); }
    } else if(this.type==='agulha'){
      if(IMG['agulha_img']) ctx.drawImage(IMG['agulha_img'],0,0,48,48,-15,-15,30,30);
      else { ctx.fillStyle='#c0c8d0';ctx.fillRect(-12,-1,24,2); ctx.fillStyle='#c89048';ctx.fillRect(8,-2,6,4); }
    } else if(this.type==='mengxi'){
      if(IMG['mengxi_img']) ctx.drawImage(IMG['mengxi_img'],0,0,48,48,-15,-15,30,30);
      else { ctx.fillStyle='#f0e0a0';ctx.fillRect(-14,-10,28,20); ctx.fillStyle='#2a1808'; for(let i=0;i<3;i++) for(let j=0;j<5;j++) ctx.fillRect(-12+i*8,-8+j*4,2,2); }
    } else if(this.type==='magnetita'){
      // Magnetita bruta — bloco preto brilhante (forma diferente do MagnetitaDeposit)
      ctx.fillStyle='#1a1a22'; ctx.fillRect(-12,-12,24,24);
      ctx.fillStyle='#2a2a32'; ctx.fillRect(-10,-10,20,20);
      ctx.fillStyle='rgba(180,180,220,0.6)'; ctx.fillRect(-6,-8,8,4);
      // Pequenas limalhas magnéticas aderidas
      const pulse=Math.sin(this.t*2)*2;
      ctx.fillStyle='#888'; ctx.fillRect(-13+pulse,-3,2,2); ctx.fillRect(11-pulse,1,2,2);
      ctx.fillRect(-2,-14+pulse,2,2); ctx.fillRect(3,12-pulse,2,2);
    }
    ctx.restore();
    if(near){
      const label=TOOL_LABELS[this.type];
      const txt='[E] Pegar '+label; ctx.font='13px "Courier New"'; const tw=ctx.measureText(txt).width+22;
      const headTop=(player.y-cam.y)-16, itemTop=sy-16;
      let cy=Math.min(itemTop,headTop-24);
      const cx=Math.max(tw/2+6,Math.min(sx+15,W-tw/2-6));
      // FIX: sobreposição com o POPUP informativo quando ambos ativos juntos.
      cy=_avoidPopup(cx,cy,tw);
      ctx.fillStyle='rgba(0,0,0,0.78)';roundRect(cx-tw/2,cy-16,tw,24,4);ctx.fill();
      ctx.strokeStyle='#e04030';ctx.lineWidth=1.5;roundRect(cx-tw/2,cy-16,tw,24,4);ctx.stroke();
      ctx.fillStyle='#e04030';ctx.textAlign='center';ctx.fillText(txt,cx,cy);ctx.textAlign='left';
    }
  }
}

// ── Trigger ───────────────────────────────────────────────────────
class Trigger{
  constructor(x,y,w,h,label,fn){this.x=x;this.y=y;this.w=w;this.h=h;this.label=label;this.fn=fn;this.done=false;}
  draw(px,py){ if(this.done)return; const near=Math.abs((px+24)-(this.x+this.w/2))<this.w/2+72&&Math.abs((py+40)-(this.y+this.h/2))<this.h/2+72; if(!near)return; const sx=this.x+this.w/2-cam.x; const itemSy=this.y-cam.y-26+Math.sin(Date.now()/350)*4; const headTop=py-cam.y-8; let sy=Math.min(itemSy,headTop); const txt='[E] '+this.label;ctx.font='14px "Courier New"';const tw=ctx.measureText(txt).width+24;
    // FIX: faltava o clamp horizontal (mesmo padrão já aplicado na Fase4-3/
    // Fase5-2) — perto das bordas do nível a caixa saía da tela.
    const bx=Math.max(tw/2+6,Math.min(sx,W-tw/2-6));
    // FIX: sobreposição com o POPUP informativo (canto superior direito)
    // quando ambos ficavam ativos ao mesmo tempo.
    sy=_avoidPopup(bx,sy,tw);
    ctx.fillStyle='rgba(0,0,0,0.78)';roundRect(bx-tw/2,sy-16,tw,24,4);ctx.fill();ctx.strokeStyle='#e04030';ctx.lineWidth=1.5;roundRect(bx-tw/2,sy-16,tw,24,4);ctx.stroke();ctx.fillStyle='#e04030';ctx.textAlign='center';ctx.fillText(txt,bx,sy);ctx.textAlign='left'; }
}

// ── Player ────────────────────────────────────────────────────────
class Player{
  constructor(x,y){ this.x=x;this.y=y;this.w=40;this.h=80; this.vx=0;this.vy=0;this.onG=false;this.facing=1; this.hp=3;this.maxHp=3;this.inv=0;this.dead=false; this.activeTool=null;this.frame=0;this.ft=0;this.state='idle'; this.coyote=0;this.jbuf=0;this.onMoving=null; this.items=[];this.score=0;this.interactAnim=0;
    // Estado da bússola — etapas encadeadas
    this.frictionCount=0;   // 0..20 fricções
    this.needleMagnetized=false; }
  overlaps(r){return this.x<r.x+r.w&&this.x+this.w>r.x&&this.y<r.y+r.h&&this.y+this.h>r.y;}
  near(r,d=80){return Math.abs(this.x+20-(r.x+r.w/2))<r.w/2+d&&Math.abs(this.y+40-(r.y+r.h/2))<r.h/2+d;}
  update(level){
    if(G.dialog)return;
    if(isL()){this.vx=-PSPD;this.facing=-1;}else if(isR()){this.vx=PSPD;this.facing=1;}else this.vx*=0.7;
    if(this.onG)this.coyote=8;else if(this.coyote>0)this.coyote--;
    if(isJ())this.jbuf=10; if(this.jbuf>0)this.jbuf--;
    if(this.jbuf>0&&(this.onG||this.coyote>0)){this.vy=JUMPF;this.onG=false;this.coyote=0;this.jbuf=0;sfx('jump');}
    if(this.onMoving){this.x+=this.onMoving.vx||0;this.y+=this.onMoving.vy||0;} this.onMoving=null;
    this.vy=Math.min(this.vy+GRAV,MAXFALL); this.x+=this.vx;this._colX(level.plats);
    this.onG=false;this.y+=this.vy;this._colY(level.plats); this.x=Math.max(0,this.x);
    if(!this.inv){ for(const p of level.plats) if(p.type==='spike'&&this.overlaps(p))this._hurt(1,level);
      for(const e of level.enemies){ if(!e.dead&&this.overlaps(e)){ if(this.vy>2&&this.y+this.h<e.y+e.h*0.5){e.dead=true;this.vy=-8;burst(e.x+20,e.y,'#e04030',10);sfx('coin');}else{this._hurt(1,level);this.vy=-7;this.vx=(this.x<e.x?-7:7);} } } }
    if(this.inv>0)this.inv--;
    if(this.interactAnim>0)this.interactAnim--;
    // Coletáveis — ferramentas (picareta/bacia/agulha) exigem [E] com o alerta
    // visível (igual ao padrão de outras fases); minério/artefato continuam
    // sendo coletados automaticamente ao encostar.
    const ePressedCol=isE();
    for(const c of level.cols){
      if(c.done) continue;
      const isTool=TOOL_LABELS.hasOwnProperty(c.type);
      if(isTool){ if(!this.overlaps(c)||!ePressedCol) continue; }
      else if(!this.overlaps(c)) continue;
      {
        c.done=true;
        if(c.type==='magnetita'){
          this.score+=15; this.items.push('magnetita'); sfx('magnetita');
          burst(c.x+15,c.y+15,'#888',10); ironFiling(c.x+15,c.y+15,null,8);
          _journalColetar('magnetita', this.items.filter(i=>i==='magnetita').length);
          notify('⬛ Magnetita coletada! ('+this.items.filter(i=>i==='magnetita').length+'/3)');
          POPUP.show('Magnetita (Fe₃O₄)','⬛','Óxido de ferro magnético — Fe₃O₄.\nEstrutura espinélio alinha domínios magnéticos.\nOs Song a chamavam de cí shí — "pedra que ama o ferro".\nHumanos têm traços de magnetita no crânio.',8000);
        } else if(c.type==='mengxi'){
          this.items.push('mengxi'); sfx('guqin'); _journalColetar('mengxi');
          burst(c.x+15,c.y+15,'#e0c860',12);
          notify('📚 Mengxi Bitan coletado!');
        } else {
          this.items.push(c.type); sfx('item'); _journalColetar(c.type);
          burst(c.x+15,c.y+15,'#e04030',10);
          if(c.type==='picareta_aco') notify('⛏ Picareta de Aço Song coletada!');
          if(c.type==='bacia')        notify('🥣 Bacia de Madeira Laqueada coletada!');
          if(c.type==='agulha')       notify('🪡 Agulha de Costura de Aço recebida!');
        }
      }
    }
    // ── Depósitos de Magnetita / Hematita ────────────────────
    // FIX BUG: One E press should only trigger ONE step, not chain
    // through Etapa 1 → 2 → 3 in a single frame
    let eConsumed = false;
    const ePressed = isE();
    // Etapa 1: extrair com picareta
    if(level.deposits && this.items.includes('picareta_aco') && ePressed && !eConsumed){
      for(const dep of level.deposits){
        if(!dep.exposed && !dep.done && this.near({x:dep.x,y:dep.y,w:dep.w,h:dep.h},65)){
          dep.hits++; sfx('picareta'); this.interactAnim=40;
          if(dep.isReal) { dep.magneticPulse=30; ironFiling(dep.x+dep.w/2,dep.y+dep.h/2,null,4); }
          burst(dep.x+dep.w/2,dep.y-4,'#888',6,2);
          if(dep.hits>=3){
            dep.exposed=true;
            notify('Bloco exposto. Teste com a agulha (Etapa 2).');
          }
          eConsumed = true;
          break;
        }
      }
    }
    // Etapa 2: testar com agulha
    if(level.deposits && this.items.includes('agulha') && ePressed && !eConsumed){
      for(const dep of level.deposits){
        if(dep.exposed && !dep.tested && !dep.done && this.near({x:dep.x,y:dep.y,w:dep.w,h:dep.h},65)){
          dep.tested=true;
          if(dep.isReal){
            sfx('magnetita'); dep.magneticPulse=60;
            ironFiling(dep.x+dep.w/2,dep.y+dep.h/2,null,10);
            notify('⬛ MAGNETITA! Friccione a agulha (Etapa 3) próximo do bloco.');
            POPUP.show('Teste Magnético','✓','A agulha foi atraída — campo magnético confirmado.\nFriccione a agulha unidirecionalmente nesta pedra:\n20 passagens sempre no mesmo sentido.',6500);
          } else {
            sfx('hematita');
            notify('❌ HEMATITA — sem reação magnética. "Essa pedra não tem voz magnética."');
            POPUP.show('Teste do Risco','❌','Aparência igual à magnetita, mas inerte.\nUse a placa de cerâmica para confirmar:\nMagnetita = risco preto. Hematita = risco vermelho.',7000);
          }
          eConsumed = true;
          break;
        }
      }
    }
    // Etapa 3: friccionar agulha contra bloco confirmado de magnetita
    if(level.deposits && this.items.includes('agulha') && !this.needleMagnetized && ePressed && !eConsumed){
      for(const dep of level.deposits){
        if(dep.exposed && dep.tested && dep.isReal && !dep.done && this.near({x:dep.x,y:dep.y,w:dep.w,h:dep.h},65)){
          this.frictionCount++; sfx('friction'); this.interactAnim=30;
          burst(dep.x+dep.w/2,dep.y,'#c0c8d8',4,1.5);
          if(this.frictionCount>=20){
            this.needleMagnetized=true;
            this.items.push('bussola'); _journalColetar('bussola');
            sfx('compass_ok');
            notify('🧭 Agulha magnetizada! Bússola pronta — usa-a se equipada.');
            POPUP.show('Bússola Pronta','🧭','Agulha magnetizada por indução.\nVá até a Bacia Laqueada [E] para flutuar a agulha\nsobre a água. Ela apontará para o norte.\nA primeira bússola da história.',8000);
            if(level.activateCompassReady) level.activateCompassReady();
          } else {
            notify(`🪡 Fricção ${this.frictionCount}/20 — sempre no mesmo sentido!`);
          }
          eConsumed = true;
          break;
        }
      }
    }
    // Hematita errada friccionada — fala de Corvan (apenas warning, não consome E)
    if(level.deposits && this.items.includes('agulha') && !this.needleMagnetized && ePressed && !eConsumed){
      for(const dep of level.deposits){
        if(dep.exposed && dep.tested && !dep.isReal && this.near({x:dep.x,y:dep.y,w:dep.w,h:dep.h},65)){
          if(!dep._warned){
            dep._warned=true;
            showDialog([
              '"Essa pedra não tem voz magnética. É hematita — também óxido de ferro, mas com estrutura cristalina diferente. Os domínios não se alinham para criar um campo."',
              '"Use a placa de cerâmica branca para o teste definitivo: friccione o mineral nela. Magnetita deixa risco preto-acinzentado. Hematita deixa risco vermelho-castanho — como ferrugem."',
            ],null);
            eConsumed = true;
          }
          break;
        }
      }
    }
    // Placa de risco — confirma identificação
    if(level.streakPlate && this.items.includes('magnetita') && ePressed && !eConsumed && this.near(level.streakPlate,60)){
      level.streakPlate.addStreak('#1a1a18');
      sfx('streak'); notify('Risco preto-acinzentado = MAGNETITA confirmada!');
      eConsumed = true;
    }
    // Triggers
    if(ePressed && !eConsumed && this.onG){for(const t of level.triggers){if(!t.done&&this.near(t)){t.fn(this,level);break;}}}
    if(this.y>level.H+200)this._hurt(3,level);
    if(!this.onG&&this.vy<0)this.state='jump';else if(!this.onG&&this.vy>0)this.state='fall';else if(Math.abs(this.vx)>0.5)this.state='run';else this.state='idle';
    const spd=this.state==='run'?6:this.state==='idle'?18:8; if(++this.ft>=spd){this.ft=0;this.frame=(this.frame+1)%6;}
  }
  _colX(plats){ for(const p of plats){ if(p.type==='spike'||p.type==='_dead')continue; if(this.overlaps(p)){if(this.y+this.h<=p.y+4)continue;if(this.vx>0)this.x=p.x-this.w;else this.x=p.x+p.w;this.vx=0;} } }
  _colY(plats){ for(const p of plats){ if(p.type==='spike'||p.type==='_dead')continue; if(p.type==='trapdoor'&&this.vy<0)continue; if(this.overlaps(p)){ if(this.vy>=0){this.y=p.y-this.h;this.vy=0;this.onG=true;if(p.moving)this.onMoving=p;if(p.type==='trapdoor'&&p.crumble===undefined)p.crumble=70;}else{if(this.y+this.h>p.y+p.h-4){this.y=p.y+p.h;this.vy=Math.abs(this.vy)*0.2;}} } } }
  _hurt(dmg,level){ if(this.inv>0)return; this.hp-=dmg;this.inv=100; burst(this.x+20,this.y+40,'#ff4040',10);sfx('hit'); if(this.hp<=0){this.hp=0;this.dead=true;} }
  draw(){
    if(this.dead)return;
    const dx=this.x-cam.x, dy=this.y-cam.y;
    // CORVAN.draw() escala a partir de dh (S=dh/46); dw só centraliza e se
    // cancela nesta fórmula (dx-ox), não afeta o tamanho visual. Com
    // dw=w*2.4, dh=h*1.45 o Corvan saía bem maior que a hitbox (40×80).
    // Uma correção anterior usou S=1.67 (Fase4-3) como referência, mas ao
    // conferir todas as fases, S=1.67 é uma exceção (só Fase3-3/Fase4-3) —
    // o padrão real, usado desde a Fase1-1 (origem do sprite) e na maioria
    // das fases, é S=1.5 → altura fixa de 46*1.5=69px, independente da
    // hitbox de colisão de cada fase.
    const dw=this.w, dh=69;
    const ox=(dw-this.w)/2, oy=dh-this.h;
    const flip=this.facing===-1;
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
    const fb={bg01:'#7a4820',bg02:'#181820',bg03:'#384828',bg04:'#806858'};
    const grd=ctx.createLinearGradient(0,0,0,H);
    grd.addColorStop(0,fb[bgKey]||'#1a0e08'); grd.addColorStop(1,'#0a0604');
    ctx.fillStyle=grd; ctx.fillRect(0,0,W,H);
  }
  ctx.fillStyle='rgba(0,0,0,0.22)'; ctx.fillRect(0,0,W,H);
}

// ═══════════════════════════════════════════════════════════════
//  LEVEL BUILDERS
// ═══════════════════════════════════════════════════════════════

// ── Cena 1: Fundição Song — ferramentas + Grua ───────────────────
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
    spike(455,FL-20,25), spike(558,FL-20,25), spike(818,FL-20,25), spike(1018,FL-20,25),
  ];
  const enemies=[
    new Enemy(680,FL-44,'guarda',70), new Enemy(1200,FL-44,'morcego',80),
    new Enemy(1700,FL-44,'guarda',80), new Enemy(2100,FL-44,'morcego',70),
    new Enemy(2400,FL-44,'guarda',80),
  ];
  const cols=[
    new Col(240,FL-50,'picareta_aco'),
    new Col(580,FL-50,'bacia'),
  ];
  // GRUA_Y: o sprite da Grua (100px) é centralizado verticalmente em torno
  // de this.y no draw() (translate usa sy-dh/2), então os "pés" ficam em
  // this.y+50. FL-90 deixava os pés ~40px ACIMA da plataforma real (que
  // existe em x=2820..3420, topo em FL) — por isso ela parecia flutuar no
  // ar mesmo parada. FL-50 encosta os pés exatamente no chão da plataforma.
  const GRUA_X=3000, GRUA_Y=FL-50;
  // BUG: GruaCoroaVermelha nascia com state='orbit' (padrão da classe), o que
  // a fazia voar em círculos ao redor do Corvan pela cena INTEIRA, desde o
  // início, em vez de ficar pousada no chão no final (onde a interação
  // acontece) — diferente do padrão da Ovelha de Marco Polo (Fase5-2), que já
  // nasce pousada. Agora ela já começa pousada em GRUA_X/GRUA_Y.
  const grua=new GruaCoroaVermelha();
  grua.x=GRUA_X; grua.y=GRUA_Y; grua.state='landed';
  grua.visible=true;
  const triggers=[
    new Trigger(2880,FL-300,200,300,'Aproximar da Grua',(player,level)=>{
      if(!player.items.includes('bacia')){notify('Colete a Bacia Laqueada primeiro!');return;}
      player.interactAnim=60; sfx('item'); level.grua.land(GRUA_X,GRUA_Y);
      showDialog([
        '"A Grua de Coroa Vermelha — Grus japonensis. Símbolo da longevidade e da sabedoria na cultura chinesa e japonesa, presente em mil pinturas Song."',
        '"Ela traz um instrumento simples mas crucial: uma agulha de costura de aço. Shen Kuo descreveu dois métodos de fazer uma bússola — friccionar uma agulha contra a magnetita para magnetizá-la, e suspendê-la sobre água em um palito de cortiça."',
        '"Esta agulha, combinada com a magnetita que vamos encontrar, vai se tornar a primeira bússola da série — um instrumento de síntese de todos os minerais e rotas que estudamos até aqui."',
      ],()=>{
        player.items.push('agulha'); _journalColetar('agulha');
        notify('🪡 Agulha de Costura de Aço recebida da Grua!');
        POPUP.show('Agulha de Costura de Aço','🪡','Aço de alta qualidade da Dinastia Song.\nFriccionada contra magnetita = magnetizada.\nFlutuando sobre água em uma bacia laqueada\nnão-magnética = a primeira bússola da história.',8000);
        level.triggers[0].done=true; setTimeout(()=>G.nextLevel(),4000);
      });
    }),
  ];
  return{
    id:1,bg:'bg01',W:WW,H:WH,startX:60,startY:FL-90,
    title:'A Fundição Song',
    hint:'Colete ⛏ Picareta e 🥣 Bacia, depois encontre a Grua!',
    plats,enemies,cols,triggers,grua,deposits:[],streakPlate:null,
    intro:[
      '"Século XI, China da Dinastia Song. Enquanto a Europa estava na Idade Média construindo castelos de pedra, a China já tinha rodas d\'água automatizando fundições, imprensas produzindo livros em série, cientistas como Shen Kuo documentando experimentos."',
      '"A mesma China que está fundindo ferro aqui descobriu que uma pedra específica — a magnetita — sempre aponta para o norte quando colocada sobre água."',
      '"E essa descoberta vai mudar o mundo inteiro, incluindo cada rota marítima que existe depois deste século."'
    ],
    update(player){ tickMoving(this.plats);tickTrapdoors(this.plats);for(const e of this.enemies)e.update(this.plats,player);if(!G.dialog)this.grua.update(player);for(const c of this.cols)c.tick();POPUP.tick(); },
    draw(player){
      // Fumaça das fornalhas (parallax)
      for(let i=0;i<5;i++){
        const fx=400+i*640-cam.x*0.5; if(fx<-100||fx>W+100) continue;
        const fy=120+Math.sin(Date.now()/2000+i)*8;
        ctx.fillStyle='rgba(120,90,60,0.18)'; ctx.beginPath(); ctx.arc(fx,fy,30+Math.sin(Date.now()/1000+i)*6,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='rgba(180,140,80,0.12)'; ctx.beginPath(); ctx.arc(fx+10,fy-20,22,0,Math.PI*2); ctx.fill();
      }
      // Pedra onde a Grua pousa
      const rx=GRUA_X-cam.x, ry=GRUA_Y-cam.y;
      if(rx>-80&&rx<W+80){ ctx.fillStyle='#3a3028'; ctx.beginPath(); ctx.ellipse(rx+30,ry+40,60,16,0,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#4a3a30'; ctx.beginPath(); ctx.ellipse(rx+28,ry+28,52,14,0,0,Math.PI*2); ctx.fill(); }
      this.grua.draw();
      for(const e of this.enemies)e.draw(); for(const c of this.cols)c.draw(player); for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

// ── Cena 2: Minas de Magnetita — geologia + pop-ups ──────────────
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
  const enemies=[ new Enemy(500,FL-44,'morcego',70),new Enemy(800,FL-44,'morcego',60),new Enemy(1060,FL-44,'guarda',80),new Enemy(1380,FL-44,'morcego',70),new Enemy(1620,FL-44,'guarda',90),new Enemy(1920,FL-44,'morcego',80),new Enemy(2200,FL-44,'morcego',70),new Enemy(2560,FL-44,'guarda',80),
    new Enemy(200,FL-180-20,'morcego',45), new Enemy(640,FL-200-20,'morcego',50),
    new Enemy(1300,FL-280-20,'morcego',45), new Enemy(1520,FL-200-20,'morcego',45),
  ];
  // Magnetita solta (sem mecânica de teste — só para colecionar)
  const cols=[ ...[80,250,480,720,960,1200,1480,1720,2000,2260,2540,2760].map(x=>new Col(x,FL-50,'magnetita')) ];
  const geoMessages=[
    {x:700, shown:false, text:'Rocha Metamórfica', icon:'⛰️',body:'A magnetita se forma em rochas metamórficas\nquando óxido de ferro é submetido a pressão\ne calor intermediários. Camadas dobradas no\ngnaisse contam essa história visual.'},
    {x:1500,shown:false, text:'cí shí — Pedra que Ama o Ferro', icon:'⬛',body:'Os chineses Song chamavam magnetita de cí shí.\nA tradução literal é "pedra carinhosa" — porque\nela "ama" o ferro. E não só o ferro: ela também\nama o norte. Ninguém sabia ainda por quê.'},
    {x:2300,shown:false, text:'Declinação Magnética', icon:'🧭',body:'Shen Kuo (1088) foi o primeiro a notar que\na agulha NÃO aponta para o norte geográfico exato,\nmas para um ponto ligeiramente a leste —\no que hoje chamamos de declinação magnética.\n450 anos antes da Europa descobrir o mesmo.'},
  ];
  const triggers=[
    new Trigger(2870,FL-300,200,300,'Examinar Veio Principal',(player,level)=>{
      player.interactAnim=90; sfx('magnetita');
      showDialog([
        '"A magnetita é ferro oxidado com uma organização cristalina específica que cria um campo magnético natural. Não é qualquer pedaço de ferro que faz isso — é a estrutura espinélio da Fe₃O₄ que alinha os domínios magnéticos."',
        '"Os chineses Song a chamavam de cí shí — pedra que ama o ferro. E descobriram que, quando suspensa livremente, essa pedra não ama apenas o ferro: ela ama o norte."',
        '"Ninguém sabe ainda exatamente por quê ela aponta para o polo magnético. Shen Kuo foi o primeiro a notar que não aponta para o polo geográfico exato — declinação magnética. Vamos para a mina principal: lá tem os blocos que valem a pena. Mas atenção: hematita aparece igual a magnetita."',
        'Mina principal desbloqueada. Cena 3 desbloqueada!',
      ],()=>{notify('✦ Geologia da magnetita revelada!');level.triggers[0].done=true;setTimeout(()=>G.nextLevel(),4000);});
    }),
  ];
  return{
    id:2,bg:'bg02',W:WW,H:WH,startX:60,startY:FL-90,
    title:'As Colinas de Gnaisse',
    hint:'Colete ⬛ Magnetita pelo caminho — pequenos fragmentos da rocha.',
    plats,enemies,cols,triggers,deposits:[],streakPlate:null,
    intro:[
      '"Colinas de gnaisse no sul de Jiangxi. Paredes de rocha metamórfica mostram camadas dobradas e retorcidas — a história de pressão e calor gravada na pedra."',
      '"Veias de magnetita preta e brilhante cortam o gnaisse em ângulos irregulares. Pequenos fragmentos de ferro aderidos naturalmente à magnetita revelam seu campo magnético mesmo antes de ser extraída."',
      'Colete magnetita pelo caminho e examine o veio principal!'
    ],
    update(player){
      tickMoving(this.plats);tickTrapdoors(this.plats);
      for(const e of this.enemies)e.update(this.plats,player);
      for(const gm of this.geoMessages){ if(!gm.shown&&player.x>gm.x&&!G.dialog){gm.shown=true;POPUP.show(gm.text,gm.icon,gm.body,7000);} }
      for(const c of this.cols)c.tick();POPUP.tick();
    },
    geoMessages,
    draw(player){
      // Veios escuros de magnetita na parede de gnaisse
      for(let i=0;i<10;i++){
        const vx=300+i*340-cam.x; if(vx<-30||vx>W+30) continue;
        ctx.strokeStyle='#1a1a22'; ctx.lineWidth=4+Math.random()*2;
        ctx.beginPath(); ctx.moveTo(vx,0); ctx.lineTo(vx+30+i*4,FL-cam.y+80); ctx.stroke();
        ctx.strokeStyle='#2a2a32'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(vx+8,0); ctx.lineTo(vx+38+i*4,FL-cam.y+80); ctx.stroke();
      }
      // Pingos de água nas paredes
      const t=Date.now()/700;
      for(let i=0;i<8;i++){
        const wx=(180+i*440-cam.x)%(this.W); if(wx<-15||wx>W+15) continue;
        const wy=120+Math.sin(t+i)*5;
        ctx.fillStyle='rgba(140,170,200,0.5)'; ctx.beginPath(); ctx.arc(wx,wy,2.5,0,Math.PI*2); ctx.fill();
      }
      for(const e of this.enemies)e.draw();
      for(const c of this.cols)c.draw(player);
      for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

// ── Cena 3: Coleta + Teste — mecânica das 3 etapas ───────────────
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
    // Plataforma final do altar
    solid(2980,FL-80,120,80), solid(3020,FL-160,110,80), solid(3060,FL-240,140,80),
    solid(3100,FL-300,180,18), solid(3200,FL-360,200,18), solid(3320,FL-420,360,18),
    solid(3100,FL-240,580,WH-FL+240),
  ];
  // Depósitos de Magnetita/Hematita — mistura 3 magnetita real + 2 hematita falsa
  const deposits=[
    new MagnetitaDeposit(440,FL-50, true),   // magnetita
    new MagnetitaDeposit(700,FL-50, false),  // hematita imitadora
    new MagnetitaDeposit(1200,FL-50, true),  // magnetita
    new MagnetitaDeposit(1640,FL-50, false), // hematita imitadora
    new MagnetitaDeposit(2280,FL-50, true),  // magnetita
  ];
  // Placa de risco no centro da fase
  const streakPlate = new StreakPlate(1860, FL-90);
  const enemies=[ new Enemy(420,FL-44,'guarda',60),new Enemy(880,FL-44,'morcego',80),new Enemy(1380,FL-44,'guarda',70),new Enemy(1900,FL-44,'morcego',100),new Enemy(2320,FL-44,'guarda',80) ];
  const cols=[ new Col(3450,FL-450,'mengxi') ];
  let compassReady=false;
  const triggers=[
    new Trigger(3400,FL-480,200,480,'Pegar o Mengxi Bitan',(player,level)=>{
      if(!player.items.includes('mengxi')){notify('Colete o Mengxi Bitan primeiro!');return;}
      if(!player.items.includes('bussola')){notify('Você precisa magnetizar a agulha antes!');return;}
      player.interactAnim=90; sfx('guqin');
      const magN=player.items.filter(i=>i==='magnetita').length;
      showDialog([
        '"Shen Kuo não sabia que estava escrevendo o livro que tornaria possível a navegação transoceânica. Ele era funcionário do governo, astrônomo, matemático, farmacologista e engenheiro — um homem que simplesmente anotava tudo o que observava com precisão."',
        '"A bússola que acabei de fazer com uma agulha de costura e uma pedra preta é a mesma bússola que guiou Vasco da Gama ao redor da África, Colombo até as Américas, Magalhães ao redor do mundo."',
        `"${magN} magnetitas coletadas. Cada uma carrega o campo magnético da Terra inteira. Agora, com a bússola na bacia, podemos descer o rio Gan."`,
        'Vá ao laboratório de Shen Kuo!',
      ],()=>{notify('✦ Mengxi Bitan adquirido! Vá ao laboratório!');level.triggers[0].done=true;setTimeout(()=>G.nextLevel(),4000);});
    }),
  ];
  return{
    id:3,bg:'bg03',W:WW,H:WH,startX:60,startY:FL-90,
    title:'A Pedra que Aprendeu o Norte',
    hint:'⛏ Escave → 🪡 Teste → Friccione 20× → 🧭 Bússola pronta!',
    plats,enemies,cols,triggers,deposits,streakPlate,
    activateCompassReady(){ compassReady=true; if(G.compass)G.compass.activate(); },
    intro:[
      '"Mina principal de Jiangxi. Aqui dentro há blocos pretos brilhantes — mas nem todos são magnetita. A hematita imita perfeitamente: mesma cor, mesmo brilho, dureza próxima."',
      '"Três etapas: 1️⃣ Escave com a picareta (3 golpes). 2️⃣ Teste com a agulha [E] — magnetita atrai, hematita não. 3️⃣ Friccione a agulha 20× no bloco de magnetita confirmado, sempre no mesmo sentido."',
      'O resultado: a primeira bússola da história. Use-a para encontrar o Mengxi Bitan no altar!'
    ],
    update(player){
      tickMoving(this.plats);tickTrapdoors(this.plats);
      for(const e of this.enemies)e.update(this.plats,player);
      for(const c of this.cols)c.tick();
      for(const dep of this.deposits)dep.tick();
      this.streakPlate.tick();
      POPUP.tick();
    },
    draw(player){
      // Lanternas de papel chinesas penduradas
      for(let i=0;i<6;i++){
        const lx=400+i*520-cam.x; if(lx<-30||lx>W+30) continue;
        const ly=120+Math.sin(Date.now()/1200+i)*4;
        // Corda
        ctx.strokeStyle='#3a2010'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(lx,0); ctx.lineTo(lx,ly); ctx.stroke();
        // Lanterna vermelha
        ctx.fillStyle='#c01010'; ctx.beginPath(); ctx.ellipse(lx,ly+12,11,14,0,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#e02020'; ctx.beginPath(); ctx.ellipse(lx,ly+10,9,12,0,0,Math.PI*2); ctx.fill();
        // Topo e base douradas
        ctx.fillStyle='#c89020'; ctx.fillRect(lx-5,ly-2,10,3); ctx.fillRect(lx-5,ly+24,10,3);
        // Glow
        const glow=ctx.createRadialGradient(lx,ly+12,0,lx,ly+12,30);
        glow.addColorStop(0,'rgba(255,180,80,0.3)'); glow.addColorStop(1,'rgba(255,180,80,0)');
        ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(lx,ly+12,30,0,Math.PI*2); ctx.fill();
      }
      // Veios de magnetita escuros
      for(let i=0;i<6;i++){
        const vx=200+i*600-cam.x; if(vx<-30||vx>W+30) continue;
        ctx.strokeStyle='#1a1a22'; ctx.lineWidth=4;
        ctx.beginPath(); ctx.moveTo(vx,0); ctx.lineTo(vx+50,FL-cam.y+80); ctx.stroke();
      }
      // Depósitos de magnetita/hematita
      for(const dep of this.deposits) dep.draw();
      // Placa de cerâmica para teste do risco
      this.streakPlate.draw();
      // Glow do mengxi no altar
      const ag=ctx.createRadialGradient(3450-cam.x,FL-450-cam.y,0,3450-cam.x,FL-450-cam.y,160);
      ag.addColorStop(0,'rgba(200,160,40,0.25)'); ag.addColorStop(1,'rgba(200,160,40,0)');
      ctx.fillStyle=ag; ctx.fillRect(3270-cam.x,FL-500-cam.y,360,300);
      for(const e of this.enemies)e.draw();
      for(const c of this.cols)c.draw(player);
      for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

// ── Cena 4: Rio Gan + Laboratório Shen Kuo ───────────────────────
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
  // FIX: ela sobrevoava o Corvan a cena inteira (state='orbit', padrão da
  // classe) — não fazia sentido para o hint "Siga a Grua", que sugere uma
  // guia caminhando à frente dele, não voando. Agora ela anda no chão
  // (state='walk'), com 'y' fixo na altura do piso (pés em FL, mesma lógica
  // já usada para o pouso da Cena1: this.y = FL - 50 -> pés em FL).
  const grua=new GruaCoroaVermelha();
  grua.x=60; grua.y=FL-50; grua.state='walk';
  grua.visible=true;
  const gruaMessages=[
    {x:500, shown:false, text:'"A bússola Song chegou à Europa via Ásia Central em cerca de 150 anos. Tornou possível a navegação de alto mar — e, com ela, as explorações que conectaram todo o mundo da série Mineralis."'},
    {x:1300,shown:false, text:'"Shen Kuo era polímata: astrônomo, matemático, farmacologista, engenheiro. Em seu Dream Pool Essays (1088), descreveu mais de 600 experimentos científicos — séculos antes da revolução científica europeia."'},
    {x:2100,shown:false, text:'"O nome chinês da bússola é zhi nan zhen — agulha que aponta o sul. Os Song se orientavam pelo sul, não pelo norte. Diferença cultural, mesma física."'},
    {x:2700,shown:false, text:'"No altar do laboratório, complete a missão. Toda a série Mineralis convergiu para este ponto — toda mina, todo mineral, toda rota só foi possível porque alguém no sul da China decidiu anotar que uma pedra aprende o norte."'},
  ];
  const enemies=[ new Enemy(200,FL-44,'guarda',60),new Enemy(680,FL-44,'morcego',70),new Enemy(1100,FL-44,'guarda',80),new Enemy(1600,FL-44,'morcego',70),new Enemy(2050,FL-44,'guarda',80) ];
  const cols=[ ...[100,200,900,1100,1340,1560,1820,2060,2380,2480].map(x=>new Col(x,FL-50,'magnetita')) ];
  const triggers=[
    new Trigger(2780,FL-460,240,460,'Completar a Fase!',(player,level)=>{
      const magN0=player.items.filter(i=>i==='magnetita').length;
      if(magN0<3){notify('⬛ Faltam magnetitas — encontrou apenas '+magN0+'/3!');return;}
      if(!player.items.includes('mengxi')){notify('📚 O Mengxi Bitan de Shen Kuo ainda não foi encontrado!');return;}
      level.triggers[0].done=true; player.interactAnim=120; sfx('guqin');
      const magN=player.items.filter(i=>i==='magnetita').length;
      showDialog([
        '"Toda a série Mineralis — cada mina, cada mineral, cada rota de comércio — só foi possível porque alguém, num laboratório de papel no sul da China, decidiu anotar que uma pedra aprende o norte."',
        '"Vasco da Gama dobrou a África com esta bússola. Colombo cruzou o Atlântico com esta bússola. Magalhães circum-navegou o mundo com esta bússola. Almadén e Potosí. Lago Superior e Timbuktu. Tudo conectado pela agulha que aprende o norte."',
        '"Shen Kuo morreu sem saber. Anotou o experimento, foi para outras coisas. A história não é feita por quem sabe que está fazendo história. É feita por quem anota com cuidado o que observa com paciência."',
        `🏆 FASE 5.3 CONCLUÍDA! ${magN} magnetitas coletadas.\nTrilogia da Ásia encerrada — Mineralis chega ao seu ponto de convergência.`,
      ],()=>{_salvarProgresso(G.player?.score||0,G.deaths);G.state='complete';});
    }),
  ];
  return{
    id:4,bg:'bg04',W:WW,H:WH,startX:60,startY:FL-90,
    title:'O Laboratório de Shen Kuo',
    hint:'Siga a Grua. A bússola te orienta. [E] para completar a jornada.',
    plats,enemies,cols,triggers,grua,gruaMessages,deposits:[],streakPlate:null,
    intro:[
      '"Corvan navega o rio Gan em um junco de pesca com a bússola caseira flutuando na bacia de madeira. A agulha aponta firme para o norte enquanto o barco vira nas curvas — ela corrige sozinha."',
      '"Ao chegar ao laboratório de Shen Kuo, um homem de meia-idade em túnica verde escreve num rolo de papel à luz de uma lanterna. O manuscrito que muda tudo."',
      'Siga a Grua até o altar e complete a missão.'
    ],
    update(player){
      tickMoving(this.plats);tickTrapdoors(this.plats);
      for(const e of this.enemies)e.update(this.plats,player);
      if(!G.dialog)this.grua.update(player);
      for(const gm of this.gruaMessages){ if(!gm.shown&&player.x>gm.x&&!G.dialog){gm.shown=true;showDialog([gm.text],null,'🦩 GRUA DE COROA VERMELHA');} }
      for(const c of this.cols)c.tick();POPUP.tick();
    },
    draw(player){
      // Brilho dourado do entardecer Song
      const sunG=ctx.createLinearGradient(0,0,0,H*0.5);
      sunG.addColorStop(0,'rgba(200,160,80,0.10)'); sunG.addColorStop(1,'rgba(180,140,60,0.06)');
      ctx.fillStyle=sunG; ctx.fillRect(0,0,W,H*0.5);
      // Pinheiros chineses ao fundo (silhuetas)
      for(let i=0;i<8;i++){
        const tx=200+i*420-cam.x*0.3; if(tx<-50||tx>W+50) continue;
        const th=180+i%3*30;
        const ty=FL-cam.y-th;
        // Tronco
        ctx.fillStyle='#2a1a08'; ctx.fillRect(tx-3,ty+th-30,6,30);
        // Copa em camadas
        ctx.fillStyle='#384828';
        for(let lev=0;lev<3;lev++){
          ctx.beginPath();
          const cw=20+lev*8;
          ctx.moveTo(tx-cw,ty+lev*40+30);
          ctx.lineTo(tx,ty+lev*40);
          ctx.lineTo(tx+cw,ty+lev*40+30);
          ctx.closePath(); ctx.fill();
        }
      }
      // Glow do altar
      const ag=ctx.createRadialGradient(2900-cam.x,FL-440-cam.y,0,2900-cam.x,FL-440-cam.y,200);
      ag.addColorStop(0,'rgba(220,180,40,0.25)'); ag.addColorStop(1,'rgba(220,180,40,0)');
      ctx.fillStyle=ag; ctx.fillRect(2700-cam.x,FL-540-cam.y,400,360);
      // Lanternas suspensas
      for(let i=0;i<5;i++){
        const lx=400+i*600-cam.x; if(lx<-30||lx>W+30) continue;
        const ly=80+Math.sin(Date.now()/1200+i)*3;
        ctx.strokeStyle='#3a2010'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(lx,0); ctx.lineTo(lx,ly); ctx.stroke();
        ctx.fillStyle='#c01010'; ctx.beginPath(); ctx.ellipse(lx,ly+10,10,12,0,0,Math.PI*2); ctx.fill();
        const glow=ctx.createRadialGradient(lx,ly+10,0,lx,ly+10,28);
        glow.addColorStop(0,'rgba(255,180,80,0.3)'); glow.addColorStop(1,'rgba(255,180,80,0)');
        ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(lx,ly+10,28,0,Math.PI*2); ctx.fill();
      }
      this.grua.draw();
      for(const e of this.enemies)e.draw();
      for(const c of this.cols)c.draw(player);
      for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

// ── HUD ────────────────────────────────────────────────────────────
function drawHUD(player,level){
  // Barra superior — mesmo padrão (fundo escuro + linha divisória) do resto do jogo
  ctx.fillStyle='rgba(0,0,0,0.65)';ctx.fillRect(0,0,W,38);
  ctx.fillStyle='rgba(200,60,40,0.25)';ctx.fillRect(0,36,W,2);
  for(let i=0;i<player.maxHp;i++){ ctx.fillStyle=i<player.hp?'#e02020':'#333'; ctx.beginPath();const hx=16+i*28,hy=10;ctx.arc(hx+5,hy+5,5,Math.PI,0);ctx.arc(hx+15,hy+5,5,Math.PI,0);ctx.lineTo(hx+20,hy+5);ctx.bezierCurveTo(hx+20,hy+14,hx+10,hy+18,hx+10,hy+18);ctx.bezierCurveTo(hx+10,hy+18,hx,hy+14,hx,hy+5);ctx.closePath();ctx.fill(); }
  ctx.save();ctx.shadowColor='rgba(0,0,0,0.8)';ctx.shadowBlur=6;
  ctx.fillStyle='#f0e0d0';ctx.font='20px "Courier New"';ctx.textAlign='center';ctx.fillText(level.title,W/2,24);ctx.textAlign='left';
  ctx.restore();
  // O contador de estrelas só faz sentido em cenas que têm coleta de
  // magnetita (única fonte de pontuação); as demais só têm ferramentas/
  // artefatos, já refletidos no Diário de Bordo — mostrar "⭐ 0" ali não
  // fazia sentido (mesmo padrão corrigido na Fase5-2).
  const hasScoreBonus = level.cols && level.cols.some(c=>c.type==='magnetita');
  if(hasScoreBonus){
    ctx.fillStyle='#e04030';ctx.font='bold 20px "Courier New"';ctx.textAlign='right';ctx.fillText('⭐ '+player.score,W-14,26);ctx.textAlign='left';
  }

  // Diário de Bordo — painel único no padrão do jogo (Fase5-2/Fase5-1/Fase4-3)
  const TOOL_DEFS=[
    {id:'picareta_aco_song',icon:'⛏', nome:'Picareta',has:()=>player.items.includes('picareta_aco')},
    {id:'bacia_laqueada',   icon:'🥣',nome:'Bacia',   has:()=>player.items.includes('bacia')},
    {id:'agulha_aco',       icon:'🪡',nome:'Agulha',  has:()=>player.items.includes('agulha')},
    {id:'bussola',          icon:'🧭',nome:'Bússola', has:()=>player.items.includes('bussola')},
  ];
  const tools=TOOL_DEFS.filter(t=>t.has());
  const PX=12,PY=46,PW=190,HEADER_H=26;
  const PH=HEADER_H+(tools.length>0?10+tools.length*22:26);
  ctx.save();
  ctx.shadowColor='rgba(0,0,0,0.7)';ctx.shadowBlur=8;
  ctx.fillStyle='rgba(10,2,0,0.9)';_rr(PX,PY,PW,PH,6);ctx.fill();
  ctx.shadowBlur=0;
  ctx.strokeStyle='#8a2010';ctx.lineWidth=1.5;_rr(PX,PY,PW,PH,6);ctx.stroke();
  ctx.restore();
  const midX=PX+PW/2,kw=26,kx=PX+PW-kw-6,ky=PY+5;
  ctx.font='11px serif';ctx.fillStyle='#e04030';ctx.fillText('📔',PX+8,PY+20);
  ctx.font='bold 10px "Courier New"';ctx.fillStyle='#e04030';ctx.fillText('DIÁRIO DE BORDO',PX+24,PY+20);
  ctx.fillStyle='rgba(180,40,20,0.2)';_rr(kx,ky,kw,18,3);ctx.fill();
  ctx.strokeStyle='#e04030';ctx.lineWidth=1;_rr(kx,ky,kw,18,3);ctx.stroke();
  ctx.font='bold 10px "Courier New"';ctx.fillStyle='#f0a080';ctx.textAlign='center';ctx.fillText('[I]',kx+kw/2,ky+13);ctx.textAlign='left';
  ctx.fillStyle='rgba(180,40,20,0.3)';ctx.fillRect(PX+6,PY+HEADER_H,PW-12,1);
  ctx.textAlign='center';
  if(tools.length>0){
    tools.forEach((t,i)=>{
      const ty=PY+HEADER_H+8+i*22,eq=(player.activeTool===t.id);
      ctx.font=(eq?'bold ':'')+'12px "Courier New"';ctx.fillStyle=eq?'#ffe060':'#e0a888';
      ctx.fillText(t.icon+' '+t.nome+(eq?' ◀':''),midX,ty+10);
    });
  } else {
    // Padrão do jogo (Fase4-3, Fase5-1, Fase5-2): "Não Equipado", já que as
    // ferramentas já existem como entradas fixas do Diário — só ainda não
    // foram obtidas/equipadas.
    ctx.font='12px "Courier New"';ctx.fillStyle='#a06050';
    ctx.fillText('Não Equipado',midX,PY+HEADER_H+18);
  }
  ctx.textAlign='left';

  const magN=player.items.filter(i=>i==='magnetita').length;
  ctx.font='12px "Courier New"';ctx.fillStyle='#e0a888';ctx.textAlign='right';
  if(magN>0) ctx.fillText('⬛ Magnetita ×'+magN,W-14,52);
  if(player.items.includes('mengxi')) ctx.fillText('📚 Mengxi Bitan coletado',W-14,52+(magN>0?18:0));
  ctx.textAlign='left';

  // Barra de fricção (Etapa 3)
  if(player.frictionCount>0 && !player.needleMagnetized){
    const bW=180,bX=16,bY=PY+PH+8;
    ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(bX,bY,bW,12);
    ctx.fillStyle='rgba(200,80,40,0.9)';ctx.fillRect(bX,bY,bW*(player.frictionCount/20),12);
    ctx.strokeStyle='rgba(200,140,80,0.6)';ctx.lineWidth=1;ctx.strokeRect(bX,bY,bW,12);
    ctx.font='10px "Courier New"';ctx.fillStyle='#ffb060';ctx.fillText(`🪡 FRICÇÃO ${player.frictionCount}/20`,bX+2,bY+10);
  }

  ctx.save();ctx.shadowColor='rgba(0,0,0,0.9)';ctx.shadowBlur=6;
  ctx.fillStyle='#f0e0c0';ctx.font='17px "Courier New"';ctx.textAlign='center';ctx.fillText(level.hint,W/2,H-10);ctx.textAlign='left';
  ctx.restore();
}

// ── Title Screen ──────────────────────────────────────────────────
function drawTitle(){
  drawBg('bg01');
  ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(0,0,W,H);
  // Estrelas / faíscas metálicas
  for(let i=0;i<100;i++){const sx=(i*149.5)%W,sy=(i*89.7)%280;ctx.fillStyle=`rgba(255,200,160,${.15+Math.sin(Date.now()/1200+i)*.15})`;ctx.fillRect(sx,sy,i%4===0?2:1,i%4===0?2:1);}
  // A Grua de Coroa Vermelha (companion) foi removida da capa — o padrão do
  // jogo (Fase4-3, Fase5-1, etc.) é a tela de título não mostrar Corvan nem
  // nenhum bicho/companheiro, só título, subtítulo, card e prompts. A grua
  // continua aparecendo normalmente na tela de conclusão (drawComplete).
  ctx.textAlign='center';
  ctx.shadowColor='#c02010';ctx.shadowBlur=40;
  ctx.fillStyle='#e02020';ctx.font='bold 42px "Courier New"';ctx.fillText('A Pedra que Aprendeu o Norte',W/2,148);
  ctx.shadowBlur=0;
  ctx.fillStyle='#a04040';ctx.font='19px "Courier New"';ctx.fillText('Fase 5.3  —  Jiangxi, China · Dinastia Song · Séc. XI',W/2,200);
  if(IMG.card53){
    const cardSize=160,cardX=W/2-80,cardY=230;
    const glow=ctx.createRadialGradient(W/2,cardY+80,0,W/2,cardY+80,130);
    glow.addColorStop(0,'rgba(80,80,140,0.25)'); glow.addColorStop(1,'rgba(80,80,140,0)');
    ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(W/2,cardY+80,130,0,Math.PI*2); ctx.fill();
    ctx.shadowColor='rgba(0,0,0,0.7)';ctx.shadowBlur=18;
    ctx.drawImage(IMG.card53,cardX,cardY,cardSize,cardSize);
    ctx.shadowBlur=0;
    ctx.strokeStyle='rgba(200,60,40,0.55)';ctx.lineWidth=2;ctx.strokeRect(cardX,cardY,cardSize,cardSize);
  }
  ctx.fillStyle=`rgba(220,60,40,${.55+Math.sin(Date.now()/550)*.4})`;ctx.font='19px "Courier New"';
  ctx.fillText('▶  Pressione ENTER para começar  ◀',W/2,454);
  ctx.fillStyle='#c0c8d8';ctx.font='18px "Courier New"';
  ctx.fillText('← → Mover   |   ↑ Espaço Pular   |   E Interagir   |   I Diário de Bordo',W/2,500);
  ctx.fillText('[M] Menu Principal',W/2,538);
  ctx.textAlign='left';
}

function drawDeath(){
  ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);
  ctx.textAlign='center';ctx.shadowColor='#ff2020';ctx.shadowBlur=30;
  ctx.fillStyle='#ff5050';ctx.font='bold 56px "Courier New"';ctx.fillText('VOCÊ CAIU!',W/2,H/2-50);ctx.shadowBlur=0;
  ctx.fillStyle='#e04030';ctx.font='20px "Courier New"';
  ctx.fillText('Pressione  R  para recomeçar',W/2,H/2+30);
  ctx.fillText(`Mortes: ${G.deaths}`,W/2,H/2+62);
  ctx.fillStyle='#888';ctx.font='15px "Courier New"';ctx.fillText('[M] Menu Principal',W/2,H/2+94);
  ctx.textAlign='left';
}

function drawComplete(){
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#080208');g.addColorStop(1,'#200408');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  const rg=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,500);rg.addColorStop(0,'rgba(200,40,40,.16)');rg.addColorStop(1,'rgba(200,40,40,0)');ctx.fillStyle=rg;ctx.fillRect(0,0,W,H);
  ctx.textAlign='center';
  ctx.shadowColor='#e02020';ctx.shadowBlur=40;
  ctx.fillStyle='#e02020';ctx.font='bold 40px "Courier New"';ctx.fillText('✦  FASE 5.3 CONCLUÍDA  ✦',W/2,108);
  ctx.shadowBlur=0;
  CORVAN.drawLarge(ctx, W/2 - 24, H/2 - 200, 3, false);
  ctx.fillStyle='#e8d090';ctx.font='20px "Courier New"';ctx.fillText('A Pedra que Aprendeu o Norte foi domada!',W/2,160);
  const lines=[
    '⬛  Magnetita (Fe₃O₄) — a pedra que ama o norte',
    '🧭  Bússola — a primeira da história, feita por suas mãos',
    '📚  Mengxi Bitan (1088) — o livro que mudou o mundo',
    '🦩  Grua de Coroa Vermelha — a sabedoria que guiou Shen Kuo',
  ];
  ctx.fillStyle='#e0c878';ctx.font='16px "Courier New"';lines.forEach((l,i)=>ctx.fillText(l,W/2,400+i*32));
  ctx.fillStyle='#e02020';ctx.font='18px "Courier New"';ctx.fillText(`Pontuação: ◈ ${G.player?.score||0}   Mortes: ${G.deaths}`,W/2,548);
  ctx.fillStyle=`rgba(220,60,40,${.6+Math.sin(Date.now()/600)*.4})`;ctx.font='17px "Courier New"';
  ctx.fillText('✦ Fase 6.1 desbloqueada!   [M] Menu Principal',W/2,594);
  ctx.font='42px serif';ctx.fillText('🏆',W/2-20,640);
  ctx.textAlign='left';
}

// ── Game engine ───────────────────────────────────────────────────
const LEVELS=[buildL1,buildL2,buildL3,buildL4];
const G={
  state:'title', lvIdx:0, level:null, player:null,
  dialog:false, deaths:0, timeOnLevel:0,
  _storedItems:[], _storedScore:0, _storedTool:null, _storedFrictionCount:0, _storedNeedleMag:false,
  compass: null,

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
      this.player.frictionCount=this._storedFrictionCount;
      this.player.needleMagnetized=this._storedNeedleMag;
    }
    // Manter bússola entre cenas
    if(!this.compass) this.compass = new Compass();
    if(this.player.items.includes('bussola')) this.compass.activate();
    // FIX: INV.open não era resetado ao trocar de cena — se por algum motivo
    // ficasse "preso" true, checkDlg() (que exige !INV.open) nunca deixaria
    // nenhum diálogo avançar na cena nova, travando o jogo permanentemente.
    INV.open=false;
    this.dialog=false; this.state='playing'; this.timeOnLevel=0;
    BUBBLE.active=false; POPUP.active=false;
    setTimeout(()=>{if(this.state==='playing')showDialog(this.level.intro,null);},900);
  },
  nextLevel(){
    this._storedItems=[...this.player.items];
    this._storedScore=this.player.score;
    this._storedTool=this.player.activeTool;
    this._storedFrictionCount=this.player.frictionCount;
    this._storedNeedleMag=this.player.needleMagnetized;
    if(this.lvIdx+1<LEVELS.length) this.load(this.lvIdx+1);
    else this.state='complete';
  },
  update(){
    if(this.state!=='playing') return;
    this.timeOnLevel++;
    const _wasDialog=this.dialog;
    checkDlg();
    // FIX: se este [E] acabou de FECHAR um diálogo (dialog true→false neste
    // frame), não deixa o mesmo toque de tecla ser lido de novo logo abaixo
    // por Player.update() (que só passa a rodar DEPOIS que dialog vira
    // false) — sem isso, o mesmo [E] podia disparar imediatamente outra
    // interação (fricção, trigger, etc.) no instante em que o balão fechava.
    if(_wasDialog && !this.dialog){ delete jp['KeyE']; delete jp['Enter']; delete jp['_te']; }
    if(INV.open) INV.navigate(this.player);
    updateCam(this.player.x,this.level.W);
    this.level.update(this.player);
    this.player.update(this.level);
    if(this.compass) this.compass.tick();
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
    if(this.compass&&this.player.items.includes('bussola')) this.compass.draw();
    BUBBLE.draw(this.player);
    drawNotif(); POPUP.draw(); INV.draw(this.player);
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
    if (!save.fases['5.3']) save.fases['5.3'] = {desbloqueada:true, estrelas:0, coletados:{}};
    if (!save.fases['5.3'].coletados) save.fases['5.3'].coletados = {};
    if (count && count > 1) {
      save.fases['5.3'].coletados[id] = Math.max(Number(save.fases['5.3'].coletados[id])||0, count);
    } else {
      save.fases['5.3'].coletados[id] = true;
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
    if(!save.fases['5.3']) save.fases['5.3']={desbloqueada:true,estrelas:0};
    save.fases['5.3'].estrelas=Math.max(save.fases['5.3'].estrelas||0,estrelas);
    save.fases['5.3'].desbloqueada=true;
    localStorage.setItem('mineralis_save_v2',JSON.stringify(save));
  }catch(e){}
}

function startGame(){
  CORVAN.load('Assets/', () => {});
  G.state='title'; cam.x=0; cam.y=0; loop();
}

function loop(){
  requestAnimationFrame(loop);
  // Música ambiente: toca durante o gameplay, trocando de variação quando
  // a cena muda (G.lvIdx), e para nas telas de título/morte/conclusão.
  if(G.state==='playing'){
    if(_prevBgState!=='playing'||G.lvIdx!==_prevBgScene){ startBgMusic(G.lvIdx); _prevBgScene=G.lvIdx; }
  } else if(_prevBgState==='playing'){
    stopBgMusic();
  }
  _prevBgState=G.state;
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
    ctx.fillStyle='#0a0204';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#e04030';ctx.font='bold 22px "Courier New"';ctx.textAlign='center';
    ctx.fillText(`Carregando${'.'.repeat(Math.floor(Date.now()/400)%4)}  ${assetsLoaded}/${totalAssets}`,W/2,H/2);
    ctx.fillStyle='#888';ctx.font='14px "Courier New"';
    ctx.fillText('Fase 5.3 — A Pedra que Aprendeu o Norte',W/2,H/2+36);
    ctx.textAlign='left';
  })();
}
