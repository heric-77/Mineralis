// ═══════════════════════════════════════════════════════════════
//  MINERALIS  –  Fase 4.3  ·  A Cidade Onde o Ouro Vira Conhecimento
//  scriptfase4-3.js
//  Timbuktu, Mali — Século XIV
//  Sal · Ouro · Astrolábio · Harmattan
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
  if      (type==='jump')     { o.frequency.setValueAtTime(280,t); o.frequency.exponentialRampToValueAtTime(520,t+.14); g.gain.setValueAtTime(.15,t); g.gain.exponentialRampToValueAtTime(.001,t+.16); }
  else if (type==='coin')     { o.frequency.setValueAtTime(880,t); o.frequency.exponentialRampToValueAtTime(1760,t+.09); g.gain.setValueAtTime(.12,t); g.gain.exponentialRampToValueAtTime(.001,t+.12); }
  else if (type==='hit')      { o.type='sawtooth'; o.frequency.setValueAtTime(200,t); o.frequency.exponentialRampToValueAtTime(50,t+.18); g.gain.setValueAtTime(.18,t); g.gain.exponentialRampToValueAtTime(.001,t+.22); }
  else if (type==='item')     { o.frequency.setValueAtTime(440,t); o.frequency.setValueAtTime(660,t+.1); o.frequency.setValueAtTime(880,t+.2); g.gain.setValueAtTime(.14,t); g.gain.exponentialRampToValueAtTime(.001,t+.3); }
  else if (type==='unlock')   { o.frequency.setValueAtTime(330,t); o.frequency.setValueAtTime(440,t+.15); o.frequency.setValueAtTime(660,t+.3); g.gain.setValueAtTime(.15,t); g.gain.exponentialRampToValueAtTime(.001,t+.5); }
  // Machado horizontal no sal: klak seco e agudo
  else if (type==='sal_ok')   { o.type='triangle'; o.frequency.setValueAtTime(1400,t); o.frequency.exponentialRampToValueAtTime(600,t+.08); g.gain.setValueAtTime(.18,t); g.gain.exponentialRampToValueAtTime(.001,t+.12); }
  // Golpe vertical errado: sal vira pó — crack + silêncio
  else if (type==='sal_fail') { o.type='sawtooth'; o.frequency.setValueAtTime(800,t); o.frequency.exponentialRampToValueAtTime(100,t+.15); g.gain.setValueAtTime(.14,t); g.gain.exponentialRampToValueAtTime(.001,t+.18); }
  // Astrolábio: tick metálico de latão
  else if (type==='astro')    { o.type='sine'; o.frequency.setValueAtTime(1800,t); g.gain.setValueAtTime(.09,t); g.gain.exponentialRampToValueAtTime(.001,t+.12); const o2=AC.createOscillator(),g2=AC.createGain(); o2.type='sine'; o2.frequency.setValueAtTime(2200,t+.06); g2.gain.setValueAtTime(.07,t+.06); g2.gain.exponentialRampToValueAtTime(.001,t+.18); o2.connect(g2); g2.connect(AC.destination); o2.start(t+.06); o2.stop(t+.25); }
  // Astrolábio calibrado — sequência musical de latão
  else if (type==='astro_ok') { [1200,1600,2000,2400].forEach((f,i)=>{ const oi=AC.createOscillator(),gi=AC.createGain(); oi.type='sine'; oi.frequency.setValueAtTime(f,t+i*.1); gi.gain.setValueAtTime(.1,t+i*.1); gi.gain.exponentialRampToValueAtTime(.001,t+i*.1+.18); oi.connect(gi); gi.connect(AC.destination); oi.start(t+i*.1); oi.stop(t+i*.1+.3); }); }
  // Manuscrito: farfalhar suave + oud
  else if (type==='manus')    { o.type='sine'; o.frequency.setValueAtTime(440,t); g.gain.setValueAtTime(.1,t); g.gain.linearRampToValueAtTime(.001,t+.8); }
  // Harmattan arriving: vento crescente
  else if (type==='harmattan'){ o.type='sawtooth'; o.frequency.setValueAtTime(60,t); g.gain.setValueAtTime(.04,t); g.gain.linearRampToValueAtTime(.15,t+1.5); g.gain.exponentialRampToValueAtTime(.001,t+2.5); }
  else if (type==='stone')    { o.type='square'; o.frequency.setValueAtTime(120,t); g.gain.setValueAtTime(.1,t); g.gain.exponentialRampToValueAtTime(.001,t+.15); }
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
    if(!save.fases['4.3']) save.fases['4.3']={desbloqueada:true,estrelas:0};
    save.fases['4.3'].estrelas=Math.max(save.fases['4.3'].estrelas||0,estrelas);
    save.fases['4.3'].desbloqueada=true;
    localStorage.setItem(SAVE_KEY,JSON.stringify(save));
  }catch(e){}
}
function _voltarAoMenu(){ _salvarFase(G.player?.score||0,G.deaths); window.location.href='../../MenuPrincipal/index.html'; }

// ── Assets ───────────────────────────────────────────────────────
const IMG={};
const ASSETS=[
  ['bg01','Assets/Fase 4.3 - Cena 01.svg'],
  ['bg02','Assets/Fase 4.3 - Cena 02.svg'],
  ['bg03','Assets/Fase 4.3 - Cena 03.svg'],
  ['bg04','Assets/Fase 4.3 - Cena 04.svg'],
  ['dromedario_img','Assets/dromedario.svg'],
  ['astrolabio_img','Assets/astrolabio.svg'],
  ['machado_img',   'Assets/machado_pedra.svg'],
  ['balanca_img',   'Assets/balanca_bronze.svg'],
  ['manuscrito_img','Assets/manuscrito.svg'],
];



let assetsLoaded=0, totalAssets=ASSETS.length, gameReady=false;
ASSETS.forEach(([key,src])=>{
  const img=new Image();
  img.onload=()=>{ IMG[key]=img; if(++assetsLoaded>=totalAssets){gameReady=true;startGame();} };
  img.onerror=()=>{ IMG[key]=null; if(++assetsLoaded>=totalAssets){gameReady=true;startGame();} };
  img.src=src;
});
IMG.card43=null;
(()=>{ const ci=new Image(); ci.onload=()=>{IMG.card43=ci;}; ci.src='Assets/4_3_timbuktu.svg'; })();

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
function sandBurst(x,y,n=20){ // partículas de areia do harmattan
  for(let i=0;i<n;i++){
    const a=Math.random()*Math.PI*2;
    particles.push({x,y,vx:Math.cos(a)*(2+Math.random()*4)+(Math.random()*3),vy:Math.sin(a)*(1+Math.random()*2),life:60+Math.random()*40,max:100,color:'#c8a050',r:1+Math.random()*3});
  }
}
function tickParticles(){for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=0.15;p.life--;if(p.life<=0)particles.splice(i,1);}}
function drawParticles(){for(const p of particles){ctx.globalAlpha=p.life/p.max;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x-cam.x,p.y-cam.y,p.r*(p.life/p.max),0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}

// ── Camera ────────────────────────────────────────────────────────
const cam={x:0,y:0};
function updateCam(px,worldW){ const target=px-W/2+24; const clamped=Math.max(0,Math.min(target,worldW-W)); cam.x+=(clamped-cam.x)*0.12; }

const GRAV=0.46, PSPD=4.6, JUMPF=-12.4, MAXFALL=16;

// ── Tile themes — areia, deserto branco de sal, bazar, biblioteca ─
const TILE_THEMES={
  1:{top:'#d4aa60',body:'#b88840',dark:'#886018'},  // areia quente
  2:{top:'#e8e4d8',body:'#d0ccc0',dark:'#a8a498'},  // deserto de sal branco
  3:{top:'#c8901c',body:'#a07010',dark:'#704808'},   // adobe/terra da cidade
  4:{top:'#b89050',body:'#907030',dark:'#604808'},   // biblioteca Sankoré
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
  if(p.type==='spike'){ const nc=Math.max(1,Math.floor(p.w/20)); ctx.fillStyle='#804808'; for(let i=0;i<nc;i++){const tx=sx+i*(p.w/nc);ctx.beginPath();ctx.moveTo(tx,sy+p.h);ctx.lineTo(tx+p.w/nc/2,sy);ctx.lineTo(tx+p.w/nc,sy+p.h);ctx.fill();} return; }
  if(p.type==='trapdoor'){ const alpha=p.crumble!==undefined?p.crumble/70:1; ctx.globalAlpha=alpha; ctx.fillStyle=tileTheme.dark;ctx.fillRect(sx,sy,p.w,p.h); ctx.fillStyle=tileTheme.top;ctx.fillRect(sx,sy,p.w,3); ctx.globalAlpha=1; return; }
  if(p.type==='_dead') return;
  const ts=24,cols=Math.ceil(p.w/ts),rows=Math.ceil(p.h/ts);
  for(let r=0;r<rows;r++){ for(let c=0;c<cols;c++){
    const tx=sx+c*ts,ty=sy+r*ts,tw=Math.min(ts,sx+p.w-tx),th=Math.min(ts,sy+p.h-ty);
    ctx.fillStyle=r===0?tileTheme.body:(r%2===0?tileTheme.dark:tileTheme.body); ctx.fillRect(tx,ty,tw,th);
    ctx.fillStyle='rgba(0,0,0,0.07)'; ctx.fillRect(tx+tw-1,ty,1,th); ctx.fillRect(tx,ty+th-1,tw,1);
  } }
  ctx.fillStyle=tileTheme.top; ctx.fillRect(sx,sy,p.w,4);
  if(p.moving){ ctx.fillStyle='rgba(200,160,30,0.35)'; ctx.fillRect(sx,sy,p.w,4); }
}

// ── Utils ─────────────────────────────────────────────────────────
function roundRect(x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r); ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath(); }
function _rr(x,y,w,h,r){ roundRect(x,y,w,h,r); }
function wrapText(text,maxW){ ctx.font='15px "Courier New"'; const paragraphs=text.split('\n'); const result=[]; for(const para of paragraphs){ const words=para.split(' ');let line=''; for(const word of words){ const test=line?line+' '+word:word; if(ctx.measureText(test).width>maxW&&line){result.push(line);line=word;}else line=test; } if(line)result.push(line); } return result; }

// ── Item Definitions ──────────────────────────────────────────────
const ITEM_DEFS={
  // Herdados
  picareta_basica:  { cat:'ferramenta',nome:'Picareta Básica',       icon:'⛏',fase:'1.1',desc:'Extrai minérios das paredes rochosas.\nEssencial nas minas de Potosí.' },
  maco_pedra:       { cat:'ferramenta',nome:'Maço de Pedra',         icon:'🪨',fase:'2.3',desc:'Percussão a frio Anishinaabe.\nExtrai cobre nativo do basalto.' },
  picareta_calcario:{ cat:'ferramenta',nome:'Picareta de Calcário',  icon:'⛏',fase:'3.3',desc:'Adaptada para rocha sedimentar.\nRevela veias de cinábrio com precisão.' },
  // Novas
  machado_item:     { cat:'ferramenta',nome:'Machado de Pedra Tuaregue',icon:'🪓',fase:'4.3',desc:'Golpe HORIZONTAL para separar lajes de sal.\nGolpe vertical = sal virou pó.\nOs Tuaregues extraem assim há séculos.' },
  balanca_item:     { cat:'ferramenta',nome:'Balança de Bronze',     icon:'⚖️',fase:'4.3',desc:'Mercadores de Timbuktu pesavam ouro\nem pó com balanças de precisão.\nA moeda era o peso, não a forma.' },
  astrolabio_item:  { cat:'ferramenta',nome:'Astrolábio de Latão',   icon:'🔭',fase:'4.3',desc:'Instrumento islâmico séc. XIV.\nMede altitude do sol → determina norte.\nInventado pelos gregos, aperfeiçoado pelos árabes,\ntransmitido à Europa por Timbuktu.' },
  // Minérios
  cobre_nativo:     { cat:'minerio',   nome:'Cobre Nativo',          icon:'🟠',fase:'2.3',desc:'Tradição Anishinaabe de 7.000 anos.',multiple:true },
  cinabrio:         { cat:'minerio',   nome:'Cinábrio (HgS)',        icon:'🔴',fase:'3.3',desc:'Sulfeto de mercúrio escarlate.\nUsado para amalgamar a prata de Potosí.',multiple:true },
  halita:           { cat:'minerio',   nome:'Halita Saariana (Sal)', icon:'⬜',fase:'4.3',desc:'Sal-gema de Taoudenni — 700 km no Saara.\nEm Timbuktu séc. XIV = mesmo valor em ouro.\n"Salário" vem de "salarium" — pagamento romano.',multiple:true },
  // Artefatos
  tumi_dourado:     { cat:'artefato',  nome:'Tumi de Ouro Inca',     icon:'🥇',fase:'1.3',desc:'Faca ritual Inca de ouro e turquesa.' },
  frasco_mercurio:  { cat:'artefato',  nome:'Frasco de Mercúrio',    icon:'⚗️',fase:'3.3',desc:'10.000 km de Almadén a Potosí.' },
  manuscrito_item:  { cat:'artefato',  nome:'Manuscrito de Timbuktu',icon:'📜',fase:'4.3',desc:'Manuscrito árabe sobre mineralogia, séc. XIV.\nDescreve propriedades de ouro, prata e mercúrio.\nChegou à Europa via Marrocos → Florença.\nUm dos 700.000 manuscritos da cidade.' },
};
const TIPO_TO_JOURNAL={ machado:'machado_item',balanca:'balanca_item',astrolabio:'astrolabio_item', halita:'halita',manuscrito:'manuscrito_item' };

// ── Inventory ─────────────────────────────────────────────────────
const INV={
  open:false,tab:0,cursor:0,
  TABS:[{id:'ferramenta',label:'🔧 Ferramentas',color:'#e0b030'},{id:'minerio',label:'⛏ Minérios',color:'#c89820'},{id:'artefato',label:'🏺 Artefatos',color:'#d0a030'}],
  tabItems(player){ const cat=this.TABS[this.tab].id; let col={};
    try{const s=localStorage.getItem('mineralis_save_v2');if(s){const j=JSON.parse(s);col=j.coletados||{};}}catch(e){}
    for(const tipo of player.items){const jid=TIPO_TO_JOURNAL[tipo]||tipo;col[jid]=true;}
    const halN=player.items.filter(i=>i==='halita').length;
    const out=[]; for(const [id,def] of Object.entries(ITEM_DEFS)){ if(def.cat!==cat) continue; if(def.multiple){if(halN>0)out.push({id,...def,count:halN});}else if(col[id])out.push({id,...def,count:1}); } return out; },
  toggle(player){ this.open=!this.open; if(this.open)this.cursor=Math.min(this.cursor,Math.max(0,this.tabItems(player).length-1)); G.dialog=this.open; },
  close(){ this.open=false; G.dialog=false; },
  navigate(player){ if(!this.open)return false; if(jp['ArrowLeft']||jp['KeyA']){this.tab=(this.tab+2)%3;this.cursor=0;return true;} if(jp['ArrowRight']||jp['KeyD']){this.tab=(this.tab+1)%3;this.cursor=0;return true;} const items=this.tabItems(player); if(jp['ArrowUp']||jp['KeyW']){this.cursor=Math.max(0,this.cursor-1);return true;} if(jp['ArrowDown']||jp['KeyS']){this.cursor=Math.min(items.length-1,this.cursor+1);return true;} if(isE()&&items.length>0&&this.tab===0){const item=items[this.cursor];player.activeTool=(player.activeTool===item.id)?null:item.id;return true;} return false; },
  draw(player){
    if(!this.open)return;
    ctx.fillStyle='rgba(0,0,0,0.65)';ctx.fillRect(0,0,W,H);
    const PW=780,PH=480,PX=(W-PW)/2,PY=(H-PH)/2;
    ctx.shadowColor='rgba(0,0,0,0.7)';ctx.shadowBlur=20;ctx.fillStyle='rgba(4,3,0,0.97)';_rr(PX,PY,PW,PH,16);ctx.fill();ctx.shadowBlur=0;
    ctx.strokeStyle='#906010';ctx.lineWidth=2.5;_rr(PX,PY,PW,PH,16);ctx.stroke();
    ctx.fillStyle='#e0b030';ctx.font='bold 16px "Courier New"';ctx.textAlign='center';ctx.fillText('📔  DIÁRIO DE BORDO',W/2,PY+28);ctx.textAlign='left';
    ctx.fillStyle='rgba(180,140,20,0.3)';ctx.fillRect(PX+16,PY+38,PW-32,1);
    const TAB_W=PW/3,TAB_Y=PY+44;
    this.TABS.forEach((tab,i)=>{ const tx=PX+i*TAB_W,active=(i===this.tab); ctx.fillStyle=active?'rgba(180,140,20,0.18)':'rgba(0,0,0,0.3)';ctx.fillRect(tx+2,TAB_Y,TAB_W-4,34); ctx.fillStyle=active?tab.color:'#666';ctx.font=(active?'bold ':'')+'13px "Courier New"';ctx.textAlign='center';ctx.fillText(tab.label,tx+TAB_W/2,TAB_Y+22);ctx.textAlign='left'; if(active){ctx.fillStyle=tab.color;ctx.fillRect(tx+2,TAB_Y+32,TAB_W-4,3);} });
    const CY=TAB_Y+40,CH=PH-(CY-PY)-50,items=this.tabItems(player),COL_W=260,DESC_X=PX+280;
    if(items.length===0){ ctx.fillStyle='#554';ctx.font='14px "Courier New"';ctx.textAlign='center';ctx.fillText('Nenhum item coletado ainda.',W/2,CY+CH/2);ctx.fillText('Explore a fase para desbloquear!',W/2,CY+CH/2+24);ctx.textAlign='left'; }
    else { items.forEach((item,i)=>{ const iy=CY+16+i*52,sel=(i===this.cursor),eq=(player.activeTool===item.id); if(sel){ctx.fillStyle='rgba(180,140,20,0.18)';_rr(PX+16,iy-10,COL_W,46,8);ctx.fill();ctx.strokeStyle='#e0b030';ctx.lineWidth=1.5;_rr(PX+16,iy-10,COL_W,46,8);ctx.stroke();} const cnt=item.count>1?' ×'+item.count:''; ctx.font='20px serif';ctx.fillText(item.icon,PX+28,iy+20); ctx.font=(eq?'bold ':'')+'14px "Courier New"';ctx.fillStyle=eq?'#ffe060':(sel?'#f0e8c0':'#aaa');ctx.fillText(item.nome+cnt,PX+62,iy+14); });
      const sel=items[this.cursor]; if(sel){ ctx.fillStyle='rgba(180,140,20,0.08)';_rr(DESC_X,CY,PW-DESC_X+PX-16,CH-10,8);ctx.fill(); ctx.font='44px serif';ctx.textAlign='center';ctx.fillText(sel.icon,DESC_X+(PW-DESC_X+PX-16)/2,CY+68); ctx.font='bold 15px "Courier New"';ctx.fillStyle='#e0b030';ctx.fillText(sel.nome,DESC_X+(PW-DESC_X+PX-16)/2,CY+98); const catL={ferramenta:'🔧 Ferramenta',minerio:'⛏ Minério',artefato:'🏺 Artefato'}; ctx.font='11px "Courier New"';ctx.fillStyle='#888';ctx.fillText(catL[sel.cat],DESC_X+(PW-DESC_X+PX-16)/2,CY+116);ctx.textAlign='left';ctx.fillStyle='rgba(180,140,20,0.25)';ctx.fillRect(DESC_X+20,CY+124,PW-DESC_X+PX-56,1); const descLines=sel.desc.split('\n');ctx.font='13px "Courier New"';ctx.fillStyle='#f0e8c0';descLines.forEach((l,i)=>{ctx.textAlign='center';ctx.fillText(l,DESC_X+(PW-DESC_X+PX-16)/2,CY+144+i*22);});ctx.textAlign='left';
        if(sel.cat==='ferramenta'){ const btnTxt=player.activeTool===sel.id?'[E] Desequipar':'[E] Equipar'; ctx.fillStyle=player.activeTool===sel.id?'rgba(180,80,20,0.3)':'rgba(180,140,20,0.2)';_rr(DESC_X+40,CY+CH-60,PW-DESC_X+PX-96,34,8);ctx.fill();ctx.strokeStyle=player.activeTool===sel.id?'#c04020':'#e0b030';ctx.lineWidth=1.5;_rr(DESC_X+40,CY+CH-60,PW-DESC_X+PX-96,34,8);ctx.stroke(); ctx.font='bold 13px "Courier New"';ctx.fillStyle=player.activeTool===sel.id?'#e06040':'#e0b030';ctx.textAlign='center';ctx.fillText(btnTxt,DESC_X+(PW-DESC_X+PX-16)/2,CY+CH-38);ctx.textAlign='left'; } } }
    ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(PX,PY+PH-38,PW,38);ctx.fillStyle='rgba(180,140,20,0.3)';ctx.fillRect(PX+16,PY+PH-39,PW-32,1);ctx.font='11px "Courier New"';ctx.fillStyle='#888';ctx.textAlign='center';ctx.fillText('◀ ▶ Abas   ↑ ↓ Navegar   E Equipar/Desequipar   I Fechar',W/2,PY+PH-14);ctx.textAlign='left';
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
    ctx.shadowColor='rgba(0,0,0,0.6)';ctx.shadowBlur=12; ctx.fillStyle='rgba(4,3,0,0.95)';roundRect(bx,by,bubW,bubH,14);ctx.fill();ctx.shadowBlur=0;
    ctx.strokeStyle='#c89020';ctx.lineWidth=2.5;roundRect(bx,by,bubW,bubH,14);ctx.stroke();
    const tailBaseX=Math.max(bx+30,Math.min(pcx,bx+bubW-30)),tailTopY=by+bubH,tailTipX=pcx,tailTipY=Math.min(pcy,tailTopY+36);
    ctx.fillStyle='rgba(4,3,0,0.95)'; ctx.beginPath();ctx.moveTo(tailBaseX-14,tailTopY);ctx.lineTo(tailBaseX+14,tailTopY);ctx.lineTo(tailTipX,tailTipY);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#c89020';ctx.lineWidth=2; ctx.beginPath();ctx.moveTo(tailBaseX-14,tailTopY);ctx.lineTo(tailTipX,tailTipY);ctx.lineTo(tailBaseX+14,tailTopY);ctx.stroke();
    const fx=bx+pad,fy=by+pad;
    CORVAN.drawFace(ctx, this.faceFrame, fx, fy, faceW, faceH);
    ctx.strokeStyle='rgba(200,150,20,0.5)';ctx.lineWidth=1.5;ctx.strokeRect(fx,fy,faceW,faceH);
    const tx=fx+faceW+pad; ctx.font=NAMEFNT;ctx.fillStyle='#e0b030';ctx.fillText(this.speakerTxt,tx,by+pad+14);
    ctx.font=FONT;ctx.fillStyle='#f0e8c0';this.lines.forEach((l,i)=>ctx.fillText(l,tx,by+pad+36+i*lineH));
    const pulse=0.55+Math.sin(Date.now()/400)*0.45; ctx.fillStyle=`rgba(200,150,20,${pulse})`;ctx.font='12px "Courier New"';ctx.textAlign='right';ctx.fillText('[E] Continuar →',bx+bubW-pad,by+bubH-8);ctx.textAlign='left';
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
  ctx.fillStyle='rgba(0,0,0,0.82)';roundRect(nx,ny,tw,28,6);ctx.fill();ctx.strokeStyle='#e0b030';ctx.lineWidth=1.5;roundRect(nx,ny,tw,28,6);ctx.stroke();
  ctx.fillStyle='#e0b030';ctx.textAlign='center';ctx.fillText(notifText,W/2,ny+19);ctx.textAlign='left';ctx.restore();
}

// ── Pop-up informativo ────────────────────────────────────────────
const POPUP={ active:false,title:'',lines:[],icon:'⬜',timer:0,
  show(title,icon,text,duration=8000){this.active=true;this.title=title;this.icon=icon;this.lines=text.split('\n');this.timer=duration;},
  tick(){if(this.timer>0){this.timer-=16;if(this.timer<=0)this.active=false;}},
  draw(){ if(!this.active)return; const alpha=Math.min(1,this.timer/400); const PW=370,PH=this.lines.length*20+100,PX=W-PW-20,PY=60;
    ctx.save();ctx.globalAlpha=alpha; ctx.fillStyle='rgba(4,3,0,0.94)';_rr(PX,PY,PW,PH,12);ctx.fill();ctx.strokeStyle='#a07818';ctx.lineWidth=2;_rr(PX,PY,PW,PH,12);ctx.stroke();
    ctx.font='32px serif';ctx.textAlign='center';ctx.fillText(this.icon,PX+40,PY+46); ctx.font='bold 13px "Courier New"';ctx.fillStyle='#e0b030';ctx.fillText(this.title,PX+60,PY+28);
    ctx.font='12px "Courier New"';ctx.fillStyle='#f0e8c0';ctx.textAlign='left';this.lines.forEach((l,i)=>ctx.fillText(l,PX+16,PY+52+i*20));ctx.restore(); }
};

// ── Sal Deposit (mecânica do machado horizontal) ──────────────────
class SalDeposit {
  constructor(x,y){ this.x=x; this.y=y; this.w=48; this.h=36; this.done=false; this.t=Math.random()*Math.PI*2; }
  tick(){ if(!this.done)this.t+=0.04; }
  draw(){
    if(this.done) return;
    const sx=this.x-cam.x,sy=this.y-cam.y+Math.sin(this.t)*3;
    if(sx<-60||sx>W+60) return;
    ctx.save(); ctx.translate(sx,sy);
    // Camadas horizontais de halita
    for(let r=0;r<4;r++){
      const clr=['#f0ece4','#e8e4d8','#ddd8cc','#d8d4c8'][r];
      ctx.fillStyle=clr; ctx.fillRect(0,r*9,this.w,9);
      ctx.strokeStyle='rgba(180,170,150,0.5)'; ctx.lineWidth=0.5; ctx.strokeRect(0,r*9,this.w,9);
    }
    // Brilho cristalino
    ctx.fillStyle='rgba(255,255,240,0.5)'; ctx.beginPath(); ctx.arc(12,8,4,0,Math.PI*2); ctx.fill();
    // Indicador de direção
    const pulse=0.5+Math.sin(Date.now()/300)*0.5;
    ctx.fillStyle=`rgba(200,180,80,${pulse*0.7})`; ctx.font='bold 10px "Courier New"'; ctx.textAlign='center';
    ctx.fillText('→ HORIZONTAL',this.w/2,-10); ctx.textAlign='left';
    ctx.restore();
  }
}

// ── Ponto de Astrolábio (calibração de navegação) ─────────────────
class AstroPoint {
  constructor(x,y,label){ this.x=x; this.y=y; this.w=40; this.h=40; this.label=label; this.done=false; this.t=0; }
  tick(){ this.t+=0.05; }
  draw(){
    if(this.done) return;
    const sx=this.x-cam.x,sy=this.y-cam.y;
    if(sx<-60||sx>W+60) return;
    // Raio de sol para calibrar
    const pulse=0.6+Math.sin(this.t)*0.4;
    ctx.save(); ctx.translate(sx+20,sy+20);
    for(let i=0;i<8;i++){ ctx.save(); ctx.rotate(i*Math.PI/4+this.t*0.3); ctx.fillStyle=`rgba(240,200,60,${pulse*0.6})`; ctx.fillRect(-2,-28,4,14); ctx.restore(); }
    ctx.fillStyle=`rgba(240,180,40,${pulse})`; ctx.beginPath(); ctx.arc(0,0,10,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(255,240,100,0.8)'; ctx.beginPath(); ctx.arc(-3,-3,4,0,Math.PI*2); ctx.fill();
    ctx.restore();
    // Label
    ctx.font='bold 11px "Courier New"'; ctx.fillStyle='#e0b030'; ctx.textAlign='center';
    ctx.fillText('[E] '+this.label,sx+20,sy-14); ctx.textAlign='left';
  }
}

// ── Enemy — guardas do bazar e escorpiões ─────────────────────────
class Enemy{
  constructor(x,y,type,patrol){
    this.x=x;this.y=y;this.spawnX=x;this.type=type;
    this.w=type==='escorpiao'?28:44; this.h=type==='escorpiao'?20:56;
    this.patrol=patrol;this.vx=1.1;this.facing=1;this.dead=false;this.frame=0;
  }
  update(plats,player){ if(this.dead)return; this.x+=this.vx;this.frame+=0.08; let onG=false; for(const p of plats){if(p.type==='spike'||p.type==='_dead')continue;if(this.x+this.w>p.x&&this.x<p.x+p.w&&this.y+this.h>=p.y&&this.y+this.h<=p.y+10)onG=true;} const edge=this.vx>0?this.x+this.w:this.x;let onEdge=false;for(const p of plats){if(p.type==='spike'||p.type==='_dead')continue;if(edge>p.x&&edge<p.x+p.w&&this.y+this.h+2>=p.y&&this.y+this.h+2<=p.y+12)onEdge=true;}if((onG&&!onEdge)||Math.abs(this.x-this.spawnX)>this.patrol)this.vx=-this.vx;this.facing=this.vx>0?1:-1; }
  draw(){
    if(this.dead)return; const sx=this.x-cam.x,sy=this.y-cam.y; if(sx<-80||sx>W+80)return;
    ctx.save();ctx.translate(sx+this.w/2,sy+this.h);if(this.facing===-1)ctx.scale(-1,1);
    if(this.type==='mercador'){
      // Mercador tuaregue — vestes azuis/índigo
      ctx.fillStyle='#1a2860';ctx.fillRect(-18,-52,36,52);
      ctx.fillStyle='#2a3880';ctx.fillRect(-16,-50,32,20);
      ctx.fillStyle='#e8d8a0';ctx.fillRect(-8,-52,16,10); // turbante
      ctx.fillStyle='#c8b480';ctx.fillRect(-5,-50,10,8);  // rosto
      ctx.fillStyle='#101840';ctx.fillRect(-16,-28,14,28);ctx.fillRect(2,-28,14,28);
      ctx.fillStyle='#1a2860';ctx.fillRect(-22,-44,6,20);ctx.fillRect(16,-44,6,20);
    } else {
      // Escorpião do deserto
      const bob=Math.sin(this.frame*Math.PI)*1.5;
      ctx.fillStyle='#a07830';ctx.beginPath();ctx.ellipse(0,-8+bob,12,7,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#c09840';ctx.beginPath();ctx.arc(10,-12+bob,6,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#a07830';ctx.lineWidth=2.5;
      ctx.beginPath();ctx.moveTo(-10,-8+bob);ctx.bezierCurveTo(-16,-14+bob,-16,-4+bob,-10,-6+bob);ctx.stroke();
      // pernas
      for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(-4+i*3,-10+bob);ctx.lineTo(-8+i*4,-18+bob+i);ctx.stroke();}
      // ferrão
      ctx.beginPath();ctx.moveTo(10,-14+bob);ctx.bezierCurveTo(18,-20+bob,22,-12+bob,20,-6+bob);ctx.stroke();
      ctx.fillStyle='#e0b050';ctx.beginPath();ctx.arc(20,-6+bob,2.5,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }
}

// ── Dromedário Companion ──────────────────────────────────────────
class Dromedario{
  constructor(){ this.x=400;this.y=300;this.angle=0;this.frame=0;this.sparkT=0;this.sparks=[];this.visible=false;this.state='orbit';this.landX=0;this.landY=0; }
  update(player){ this.frame+=0.04;this.angle+=0.012;this.sparkT++;
    if(this.state==='orbit'){ const orbitR=160,orbitX=player.x+Math.cos(this.angle)*orbitR*1.5,orbitY=player.y-120+Math.sin(this.angle)*orbitR*0.3; this.x+=(orbitX-this.x)*0.035;this.y+=(orbitY-this.y)*0.035; }
    else if(this.state==='land'){ this.x+=(this.landX-this.x)*0.06;this.y+=(this.landY-this.y)*0.06; if(Math.abs(this.x-this.landX)<10&&Math.abs(this.y-this.landY)<10)this.state='landed'; }
    if(this.sparkT%20===0&&this.state==='orbit'){ this.sparks.push({x:this.x,y:this.y,vx:(Math.random()-.5)*.5,vy:(Math.random()+.2)*.4,life:60,max:60,size:1.5+Math.random()*2}); }
    for(let i=this.sparks.length-1;i>=0;i--){const s=this.sparks[i];s.x+=s.vx;s.y+=s.vy;s.life--;if(s.life<=0)this.sparks.splice(i,1);}
  }
  land(x,y){ this.state='land';this.landX=x;this.landY=y; }
  draw(){
    for(const s of this.sparks){ ctx.save();ctx.globalAlpha=(s.life/s.max)*0.5;ctx.fillStyle='#d4a030';ctx.beginPath();ctx.arc(s.x-cam.x,s.y-cam.y,s.size*(s.life/s.max),0,Math.PI*2);ctx.fill();ctx.restore(); }
    const sx=this.x-cam.x,sy=this.y-cam.y; if(sx<-100||sx>W+100) return;
    ctx.save();
    if(this.state==='orbit'){ const glow=ctx.createRadialGradient(sx,sy,0,sx,sy,55);glow.addColorStop(0,'rgba(200,160,40,0.18)');glow.addColorStop(1,'rgba(200,160,40,0)');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(sx,sy,55,0,Math.PI*2);ctx.fill(); }
    if(IMG['dromedario_img']&&IMG['dromedario_img'].complete&&IMG['dromedario_img'].naturalWidth>0){
      const dw=110,dh=110,bob=Math.sin(this.frame*1.2)*5;
      const flipLeft=Math.cos(this.angle)<0;
      if(flipLeft){ctx.translate(sx+dw/2,sy-dh/2+bob);ctx.scale(-1,1);}else ctx.translate(sx-dw/2,sy-dh/2+bob);
      ctx.drawImage(IMG['dromedario_img'],0,0,96,96,0,0,dw,dh);
    } else {
      ctx.translate(sx,sy); const bob=Math.sin(this.frame*1.2)*5;
      // Dromedário fallback vetorial
      ctx.fillStyle='#d09040';ctx.beginPath();ctx.ellipse(0,bob,30,14,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#c08030';ctx.beginPath();ctx.ellipse(-8,bob-18,8,12,0,0,Math.PI*2);ctx.fill(); // corcova
      ctx.fillStyle='#d89848';ctx.beginPath();ctx.arc(28,bob-10,9,0,Math.PI*2);ctx.fill(); // cabeça
      ctx.fillStyle='#101008';ctx.beginPath();ctx.arc(32,bob-13,2,0,Math.PI*2);ctx.fill(); // olho
      ctx.fillStyle='#c07828';ctx.fillRect(32,bob-8,12,5); // focinho
      for(let l=-1;l<=1;l+=2){ ctx.fillStyle='#b87828';ctx.fillRect(-20+l*8,bob+12,6,20); }
    }
    ctx.restore();
  }
  speak(msg){ showDialog(msg,null,'🐪 DROMEDÁRIO'); }
}

// ── Col (items flutuantes) ────────────────────────────────────────
class Col{
  constructor(x,y,type){this.x=x;this.y=y;this.w=30;this.h=30;this.type=type;this.done=false;this.t=Math.random()*Math.PI*2;}
  tick(){if(!this.done)this.t+=0.06;}
  draw(){
    if(this.done)return; const sx=this.x-cam.x,sy=this.y-cam.y+Math.sin(this.t)*5; if(sx<-50||sx>W+50)return;
    ctx.save();ctx.translate(sx+15,sy+15);
    if(this.type==='halita'){ ctx.fillStyle='#f0ece0';ctx.beginPath();ctx.arc(0,0,12,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#d0cab8';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,12,0,Math.PI*2);ctx.stroke();ctx.fillStyle='rgba(255,255,240,0.6)';ctx.beginPath();ctx.arc(-4,-4,4,0,Math.PI*2);ctx.fill(); }
    else if(this.type==='machado'){ if(IMG['machado_img'])ctx.drawImage(IMG['machado_img'],0,0,96,96,-15,-15,30,30);else{ctx.fillStyle='#585850';ctx.fillRect(-12,-8,24,16);ctx.fillStyle='#8a4818';ctx.fillRect(8,-18,6,36);} }
    else if(this.type==='balanca'){ if(IMG['balanca_img'])ctx.drawImage(IMG['balanca_img'],0,0,96,96,-15,-15,30,30);else{ctx.fillStyle='#c89028';ctx.fillRect(-14,-6,28,12);ctx.fillRect(-1,-16,2,24);} }
    else if(this.type==='astrolabio'){ if(IMG['astrolabio_img'])ctx.drawImage(IMG['astrolabio_img'],0,0,96,96,-15,-15,30,30);else{ctx.fillStyle='#c09028';ctx.beginPath();ctx.arc(0,0,12,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#a07018';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#1a1408';ctx.beginPath();ctx.arc(0,0,3,0,Math.PI*2);ctx.fill();} }
    else if(this.type==='manuscrito'){ if(IMG['manuscrito_img'])ctx.drawImage(IMG['manuscrito_img'],0,0,96,96,-15,-15,30,30);else{ctx.fillStyle='#e8c870';ctx.fillRect(-12,-16,24,32);ctx.fillStyle='#2a1a08';for(let r=0;r<5;r++)ctx.fillRect(-8,-12+r*6,16,2);} }
    ctx.restore();
  }
}

// ── Trigger ───────────────────────────────────────────────────────
class Trigger{
  constructor(x,y,w,h,label,fn){this.x=x;this.y=y;this.w=w;this.h=h;this.label=label;this.fn=fn;this.done=false;}
  draw(px,py){ if(this.done)return; const near=Math.abs((px+24)-(this.x+this.w/2))<this.w/2+72&&Math.abs((py+40)-(this.y+this.h/2))<this.h/2+72; if(!near)return; const sx=this.x+this.w/2-cam.x,sy=this.y-cam.y-26+Math.sin(Date.now()/350)*4; const txt='[E] '+this.label;ctx.font='14px "Courier New"';const tw=ctx.measureText(txt).width+24; ctx.fillStyle='rgba(0,0,0,0.78)';roundRect(sx-tw/2,sy-16,tw,24,4);ctx.fill();ctx.strokeStyle='#e0b030';ctx.lineWidth=1.5;roundRect(sx-tw/2,sy-16,tw,24,4);ctx.stroke();ctx.fillStyle='#e0b030';ctx.textAlign='center';ctx.fillText(txt,sx,sy);ctx.textAlign='left'; }
}

// ── Player ────────────────────────────────────────────────────────
class Player{
  constructor(x,y){ this.x=x;this.y=y;this.w=40;this.h=80; this.vx=0;this.vy=0;this.onG=false;this.facing=1; this.hp=3;this.maxHp=3;this.inv=0;this.dead=false; this.activeTool=null;this.frame=0;this.ft=0;this.state='idle'; this.coyote=0;this.jbuf=0;this.onMoving=null; this.items=[];this.score=0;this.interactAnim=0;
    // Mecânica do machado: ângulo do golpe
    this.machadoMode='horizontal'; // 'horizontal' | 'vertical'
    this.machadoAnim=0; }
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
    if(!this.inv){ for(const p of level.plats) if(p.type==='spike'&&this.overlaps(p))this._hurt(1,level); for(const e of level.enemies){ if(!e.dead&&this.overlaps(e)){ if(this.vy>2&&this.y+this.h<e.y+e.h*0.5){e.dead=true;this.vy=-8;burst(e.x+20,e.y,'#d4a030',10);sfx('coin');}else{this._hurt(1,level);this.vy=-7;this.vx=(this.x<e.x?-7:7);} } } }
    if(this.inv>0)this.inv--;
    if(this.interactAnim>0)this.interactAnim--; if(this.machadoAnim>0)this.machadoAnim--;
    // Coletar itens
    for(const c of level.cols){ if(!c.done&&this.overlaps(c)){ c.done=true;
      if(c.type==='halita'){this.score+=10;this.items.push('halita');sfx('sal_ok');burst(c.x+15,c.y+15,'#f0ece0',10);_journalColetar('halita', this.items.filter(i=>i==='halita').length);notify('⬜ Halita Saariana coletada! ('+this.items.filter(i=>i==='halita').length+'/2)');POPUP.show('Halita Saariana (Sal)','⬜','Sal de Taoudenni — extraído do Saara.\nSéc. XIV: 1 laje de sal = 1 laje de ouro.\n"Salário" vem de "salarium" romano.',7000);}
      else{this.items.push(c.type);sfx('item');burst(c.x+15,c.y+15,'#d4a030',10);_journalColetar(c.type);
        if(c.type==='machado')   notify('🪓 Machado de Pedra Tuaregue coletado!');
        if(c.type==='balanca')   notify('⚖️ Balança de Bronze coletada!');
        if(c.type==='astrolabio'){notify('🔭 Astrolábio de Latão recebido!');POPUP.show('Astrolábio Islâmico','🔭','Inventado pelos gregos, aperfeiçoado pelos árabes.\nMede altitude do sol → determina norte.\nTransmitido à Europa pelos estudiosos de Timbuktu.',8000);}
        if(c.type==='manuscrito'){sfx('manus');notify('📜 Manuscrito de Timbuktu encontrado!');}
      }
    } }
    // Depósitos de sal — mecânica do machado horizontal
    if(level.salDeposits&&this.items.includes('machado')){
      for(const sd of level.salDeposits){ if(!sd.done&&this.near({x:sd.x,y:sd.y,w:sd.w,h:sd.h},60)&&isE()){
        this.machadoAnim=50; this.interactAnim=50;
        // Verifica modo: se player está se movendo = golpe horizontal; parado = vertical (fail)
        if(Math.abs(this.vx)>0.5||this.machadoMode==='horizontal'){ // Correto
          sd.done=true; sfx('sal_ok'); this.score+=15; this.items.push('halita'); _journalColetar('halita', this.items.filter(i=>i==='halita').length);
          burst(sd.x+sd.w/2,sd.y,'#f0ece0',16,2.5);
          notify('⬜ Golpe horizontal correto! Laje de sal extraída.');
          POPUP.show('Halita Saariana (Sal)','⬜','Sal de Taoudenni — extraído do Saara.\nSéc. XIV: 1 laje de sal = 1 laje de ouro.\n"Salário" vem de "salarium" romano.',7000);
        } else { // Errado — sal virou pó
          sd.done=true; sfx('sal_fail'); burst(sd.x+sd.w/2,sd.y,'#e8e0d0',20,1.5);
          notify('💨 Sal virou pó! Golpe vertical fragmenta a laje — use o machado se movendo (←→).');
        }
        break;
      } }
    }
    // Pontos de astrolábio — calibração
    if(level.astroPoints&&this.items.includes('astrolabio')){
      for(const ap of level.astroPoints){ if(!ap.done&&this.near({x:ap.x,y:ap.y,w:ap.w,h:ap.h},70)&&isE()){
        ap.done=true; sfx('astro'); this.interactAnim=40;
        const totalDone=level.astroPoints.filter(a=>a.done).length;
        if(totalDone>=3){ sfx('astro_ok'); notify('🔭 Astrolábio calibrado! A Biblioteca fica a NORDESTE!'); if(level.onAstroCalibrated)level.onAstroCalibrated(); }
        else notify(`🔭 Alinhamento ${totalDone}/3 — continue calibrando o astrolábio!`);
        break;
      } }
    }
    if(isE()&&this.onG){for(const t of level.triggers){if(!t.done&&this.near(t)){t.fn(this,level);break;}}}
    if(this.y>level.H+200)this._hurt(3,level);
    if(!this.onG&&this.vy<0)this.state='jump';else if(!this.onG&&this.vy>0)this.state='fall';else if(Math.abs(this.vx)>0.5)this.state='run';else this.state='idle';
    const spd=this.state==='run'?6:this.state==='idle'?18:8; if(++this.ft>=spd){this.ft=0;this.frame=(this.frame+1)%6;}
  }
  _colX(plats){ for(const p of plats){ if(p.type==='spike'||p.type==='_dead')continue; if(this.overlaps(p)){ if(this.y+this.h<=p.y+4)continue; if(this.vx>0)this.x=p.x-this.w;else this.x=p.x+p.w; this.vx=0; } } }
  _colY(plats){ for(const p of plats){ if(p.type==='spike'||p.type==='_dead')continue; if(p.type==='trapdoor'&&this.vy<0)continue; if(this.overlaps(p)){ if(this.vy>=0){this.y=p.y-this.h;this.vy=0;this.onG=true;if(p.moving)this.onMoving=p;if(p.type==='trapdoor'&&p.crumble===undefined)p.crumble=70;}else{if(this.y+this.h>p.y+p.h-4){this.y=p.y+p.h;this.vy=Math.abs(this.vy)*0.2;}} } } }
  _hurt(dmg,level){ if(this.inv>0)return; this.hp-=dmg;this.inv=100; burst(this.x+20,this.y+40,'#ff4040',10);sfx('hit'); if(this.hp<=0){this.hp=0;this.dead=true;} }
  draw(){
    if(this.dead)return; const dx=this.x-cam.x,dy=this.y-cam.y; const dw=this.w*2.4,dh=this.h*1.45; const ox=(dw-this.w)/2,oy=dh-this.h; const flip=this.facing===-1;
    if(this.interactAnim>0&&this.state!=='jump') CORVAN.draw(ctx, 'dig',  this.frame,    dx-ox,dy-oy,dw,dh,flip);
    else if(this.state==='run')                  CORVAN.draw(ctx, 'walk', this.frame,    dx-ox,dy-oy,dw,dh,flip);
    else                                         CORVAN.draw(ctx, 'idle', this.frame%4,  dx-ox,dy-oy,dw,dh,flip);
    if(this.inv>0&&Math.floor(this.inv/6)%2===0){ctx.fillStyle='rgba(255,60,60,0.35)';ctx.fillRect(dx,dy,this.w,this.h);}
    // Machado anim — swing horizontal
    if(this.machadoAnim>0&&this.items.includes('machado')){
      const prog=1-this.machadoAnim/50; const swingAngle=(flip?1:-1)*prog*Math.PI*0.7;
      ctx.save();ctx.translate(dx+(flip?0:this.w),dy+this.h*0.35);ctx.rotate(swingAngle);
      if(IMG['machado_img'])ctx.drawImage(IMG['machado_img'],0,0,96,96,-12,-20,36,36);
      else{ctx.fillStyle='#585850';ctx.fillRect(-16,-4,28,8);ctx.fillStyle='#8a4818';ctx.fillRect(8,-20,6,40);}
      ctx.restore();
    }
  }
}

// ── Background draw ───────────────────────────────────────────────
function drawBg(bgKey){
  const img=IMG[bgKey];
  if(img&&img.complete&&img.naturalWidth>0){ const scale=Math.max(W/img.naturalWidth,H/img.naturalHeight); const sw=img.naturalWidth*scale,sh=img.naturalHeight*scale; ctx.drawImage(img,(W-sw)/2,(H-sh)/2,sw,sh); }
  else{ const fb={bg01:'#d4aa50',bg02:'#f0ece0',bg03:'#c89020',bg04:'#806030'}; const grd=ctx.createLinearGradient(0,0,0,H);grd.addColorStop(0,fb[bgKey]||'#a07820');grd.addColorStop(1,'#402808');ctx.fillStyle=grd;ctx.fillRect(0,0,W,H); }
  ctx.fillStyle='rgba(0,0,0,0.22)';ctx.fillRect(0,0,W,H);
}

// ═══════════════════════════════════════════════════════════════
//  LEVEL BUILDERS
// ═══════════════════════════════════════════════════════════════

// ── Cena 1: Caravana chegando a Timbuktu — ferramentas + dromedário
function buildL1(){
  const FL=560,WW=3200,WH=900;
  const plats=[
    solid(0,FL,500,WH-FL), solid(580,FL,200,WH-FL), solid(860,FL,180,WH-FL),
    solid(1120,FL,220,WH-FL), solid(1420,FL,200,WH-FL), solid(1700,FL,240,WH-FL),
    solid(1980,FL,260,WH-FL), solid(2280,FL,200,WH-FL), solid(2560,FL,220,WH-FL), solid(2820,FL,600,WH-FL),
    solid(200,FL-160,130,18), solid(420,FL-240,120,18), solid(660,FL-200,130,18),
    solid(900,FL-270,120,18), solid(1100,FL-170,140,18), solid(1320,FL-280,120,18),
    solid(1500,FL-200,150,18), solid(1750,FL-270,130,18), solid(2060,FL-180,150,18),
    solid(2280,FL-300,120,18), solid(2500,FL-220,140,18), solid(2700,FL-280,120,18),
    movH(500,FL-36,80,500,580,2.2), movH(780,FL-36,80,780,860,2.0), movH(1040,FL-36,80,1040,1120,2.2),
    movH(1340,FL-36,80,1340,1420,1.8), movH(1620,FL-36,80,1620,1700,2.0),
    movH(1900,FL-36,80,1900,1980,2.2), movH(2200,FL-36,80,2200,2280,2.0),
    movH(2480,FL-36,80,2480,2560,1.8), movH(2740,FL-36,80,2740,2820,2.0),
    spike(455,FL-20,25), spike(558,FL-20,25), spike(818,FL-20,25), spike(1018,FL-20,25),
  ];
  const enemies=[ new Enemy(680,FL-44,'mercador',70), new Enemy(1200,FL-44,'escorpiao',50), new Enemy(1700,FL-44,'mercador',80), new Enemy(2100,FL-44,'escorpiao',60), new Enemy(2400,FL-44,'mercador',80) ];
  const cols=[ new Col(240,FL-50,'machado'), new Col(580,FL-50,'balanca'), ...[100,350,850,1180,1460,1740,2020,2300,2600,2860].map(x=>new Col(x,FL-50,'halita')) ];
  const DROM_X=3000,DROM_Y=FL-90;
  const dromedario=new Dromedario(); dromedario.visible=true;
  const triggers=[
    new Trigger(2880,FL-300,200,300,'Aproximar do Dromedário',(player,level)=>{
      if(!player.items.includes('balanca')){notify('Colete a Balança de Bronze primeiro!');return;}
      player.interactAnim=60; sfx('item'); level.dromedario.land(DROM_X,DROM_Y);
      showDialog([
        '"O Dromedário de Caravana — companheiro inseparável dos Tuaregues há milênios. Este porta os ornamentos de bronze de uma caravana que saiu de Taoudenni há 21 dias."',
        '"Ele carrega um instrumento dos sábios islâmicos de Timbuktu — um astrolábio de latão, forjado com precisão de relojoeiro."',
        '"Os astrolábios islâmicos do século XIV mediam a altitude do sol para determinar latitude, horário de oração e orientação no deserto. Foram os GPS medievais."',
        '"Este foi inventado pelos gregos, aperfeiçoado pelos árabes e chegou à Europa através dos manuscritos desta cidade. Conheça Timbuktu."',
      ],()=>{
        player.items.push('astrolabio'); _journalColetar('astrolabio');
        notify('🔭 Astrolábio de Latão recebido!'); sfx('astro_ok');
        POPUP.show('Astrolábio de Latão','🔭','Instrumento de navegação islâmico séc. XIV.\nMede altitude do sol → determina norte.\nFoi inventado pelos gregos, aperfeiçoado pelos árabes,\ne transmitido à Europa por Timbuktu.',8000);
        level.triggers[0].done=true; setTimeout(()=>G.nextLevel(),4000);
      });
    }),
  ];
  return{
    id:1,bg:'bg01',W:WW,H:WH,startX:60,startY:FL-90,
    title:'A Caravana de Sal',
    hint:'Colete 🪓 Machado e ⚖️ Balança, depois encontre o Dromedário!',
    plats,enemies,cols,triggers,dromedario,salDeposits:[],astroPoints:[],
    intro:[
      '"Século XIV, Mali. Esta caravana saiu das minas de sal de Taoudenni há 21 dias — 700 quilômetros de deserto puro, sem rio, sem vegetação, sem sombra."',
      '"Cada laje de sal que chega aqui vale tanto quanto uma laje de ouro do mesmo tamanho. E o ouro que sai daqui vai para o Egito, para Veneza, para a China."',
      '"Timbuktu é o lugar onde o deserto e o rio se encontram, onde o sal vira ouro e o ouro vira conhecimento."',
    ],
    update(player){ tickMoving(this.plats);tickTrapdoors(this.plats);for(const e of this.enemies)e.update(this.plats,player);if(!G.dialog)this.dromedario.update(player);for(const c of this.cols)c.tick();POPUP.tick(); },
    draw(player){
      // Poeira de caravana
      if(Math.floor(Date.now()/40)%3===0) sandBurst(cam.x+50,FL-cam.y,3);
      // Dromedário pousado
      const rx=DROM_X-cam.x,ry=DROM_Y-cam.y;
      if(rx>-80&&rx<W+80){ ctx.fillStyle='#c8a050';ctx.beginPath();ctx.ellipse(rx+40,ry+50,80,18,0,0,Math.PI*2);ctx.fill(); }
      this.dromedario.draw();
      for(const e of this.enemies)e.draw(); for(const c of this.cols)c.draw(); for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

// ── Cena 2: Minas de Taoudenni — sal branco, mecânica do machado
function buildL2(){
  const FL=570,WW=3400,WH=900;
  const plats=[
    solid(0,FL,340,WH-FL), solid(420,FL,200,WH-FL), solid(700,FL,200,WH-FL),
    solid(980,FL,200,WH-FL), solid(1260,FL,220,WH-FL), solid(1560,FL,200,WH-FL),
    solid(1840,FL,240,WH-FL), solid(2140,FL,220,WH-FL), solid(2440,FL,240,WH-FL), solid(2760,FL,600,WH-FL),
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
  // Depósitos de sal estratificado — mecânica do machado
  const salDeposits=[
    new SalDeposit(500,FL-50), new SalDeposit(900,FL-50), new SalDeposit(1500,FL-50),
    new SalDeposit(2000,FL-50), new SalDeposit(2600,FL-50),
    new SalDeposit(380,FL-270), new SalDeposit(1060,FL-185),new SalDeposit(1740,FL-270),
  ];
  const enemies=[ new Enemy(500,FL-44,'mercador',70),new Enemy(800,FL-44,'escorpiao',60),new Enemy(1060,FL-44,'escorpiao',80),new Enemy(1380,FL-44,'mercador',70),new Enemy(1620,FL-44,'mercador',90),new Enemy(1920,FL-44,'escorpiao',80),new Enemy(2200,FL-44,'mercador',70),new Enemy(2560,FL-44,'escorpiao',80) ];
  const cols=[ ...[80,250,480,720,960,1200,1480,1720,2000,2260,2540,2760].map(x=>new Col(x,FL-50,'halita')) ];
  const geoMessages=[
    {x:700,shown:false,text:'Saara Verde',icon:'🌿',body:'Há 10.000 anos, o Saara era um lago.\nGirafas pastavam onde hoje há dunas.\nQuando o clima secou, o lago evaporou\ne deixou camadas de sal — halita pura.'},
    {x:1500,shown:false,text:'O Sal como Moeda',icon:'⬜',body:'Em Timbuktu séc. XIV: 1 laje de sal = 1 laje de ouro.\n"Salário" vem do latim "salarium" —\no pagamento em sal dos soldados romanos.\nPrimeira moeda global da história.'},
    {x:2300,shown:false,text:'Técnica Tuaregue',icon:'🪓',body:'Golpe HORIZONTAL = laje inteira separada.\nGolpe VERTICAL = sal em pó — desperdício.\nOs Tuaregues extraem assim há séculos.\nNenhuma ferramenta de metal — enferruja no sal.'},
  ];
  const triggers=[
    new Trigger(2870,FL-300,200,300,'Examinar Estratificação',(player,level)=>{
      if(!player.items.includes('machado')){notify('Use o Machado de Pedra Tuaregue!');return;}
      player.interactAnim=90;sfx('sal_ok');
      showDialog([
        '"Há 10.000 anos, o Saara era um lago. Girafas pastavam onde hoje há dunas. Quando o clima secou, o lago evaporou — e deixou sal."',
        '"Camada sobre camada de halita, preservada pelo calor e pela ausência de chuva. Os Tuaregues exploram este sal há séculos — as mesmas minas, as mesmas técnicas, os mesmos caminhos."',
        '"Enquanto a Europa construía catedrais no século XIV, eles cruzavam este deserto com o único produto que valia tanto quanto ouro: o sal, sem o qual nenhuma civilização sobrevive."',
        'Técnica dominada! O bazar de Timbuktu e a tempestade do Harmattan esperam.',
      ],()=>{notify('✦ Geologia do deserto revelada!');level.triggers[0].done=true;setTimeout(()=>G.nextLevel(),4000);});
    }),
  ];
  return{
    id:2,bg:'bg02',W:WW,H:WH,startX:60,startY:FL-90,
    title:'O Deserto Branco de Taoudenni',
    hint:'🪓 Machado MOVENDO (←→) = golpe horizontal! Parado = sal vira pó.',
    plats,enemies,cols,triggers,salDeposits,astroPoints:[],
    intro:[
      '"As minas de Taoudenni — uma das paisagens mais alienígenas do planeta: um deserto BRANCO ABSOLUTO onde o solo É sal."',
      '"Camadas de halita se alternam em estratos horizontais como páginas de um livro gigante."',
      'Use o Machado MOVENDO para golpes horizontais — extraia lajes inteiras, não pó!'
    ],
    update(player){ tickMoving(this.plats);tickTrapdoors(this.plats);for(const e of this.enemies)e.update(this.plats,player);for(const sd of this.salDeposits)sd.tick();for(const gm of this.geoMessages){if(!gm.shown&&player.x>gm.x&&!G.dialog){gm.shown=true;POPUP.show(gm.text,gm.icon,gm.body,7000);}}for(const c of this.cols)c.tick();POPUP.tick(); },
    geoMessages,
    draw(player){
      // Superfície de sal brilhando
      const saltG=ctx.createLinearGradient(0,FL-cam.y-20,0,FL-cam.y);
      saltG.addColorStop(0,'rgba(240,236,224,0)');saltG.addColorStop(1,'rgba(240,236,224,0.12)');
      ctx.fillStyle=saltG;ctx.fillRect(0,FL-cam.y-20,W,20);
      // Parede estratificada de sal ao fundo
      for(let i=0;i<6;i++){
        const sy=40+i*28,ht=25; const clr=['#f0ece4','#e8e4d8','#ece8dc','#e0dcd0','#eceae0','#e4e0d4'][i];
        ctx.fillStyle=clr;ctx.fillRect(0,sy,W,ht);
        ctx.fillStyle='rgba(200,195,185,0.3)';ctx.fillRect(0,sy+ht-2,W,2);
      }
      for(const sd of this.salDeposits)sd.draw();
      for(const e of this.enemies)e.draw();for(const c of this.cols)c.draw();for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

// ── Cena 3: Bazar + Harmattan — astrolábio, timer de tempestade
function buildL3(){
  const FL=570,WW=3600,WH=900;
  const plats=[
    solid(0,FL,280,WH-FL), solid(360,FL,140,WH-FL), solid(600,FL,120,WH-FL), solid(820,FL,160,WH-FL),
    solid(1080,FL,140,WH-FL), solid(1340,FL,160,WH-FL), solid(1610,FL,130,WH-FL),
    solid(1850,FL,280,WH-FL), solid(2240,FL,160,WH-FL), solid(2520,FL,140,WH-FL), solid(2780,FL,200,WH-FL),
    solid(140,FL-180,140,18), solid(500,FL-215,110,18), solid(740,FL-175,130,18),
    solid(980,FL-225,120,18), solid(1220,FL-155,140,18), solid(1480,FL-205,130,18),
    solid(1720,FL-195,145,18), solid(1980,FL-225,140,18), solid(2360,FL-175,130,18), solid(2640,FL-205,110,18),
    movH(280,FL-36,100,280,360,2.0), movH(740,FL-36,100,740,840,2.0), movH(980,FL-36,100,980,1080,2.0),
    movH(1520,FL-36,110,1520,1610,1.8), movH(2140,FL-36,100,2140,2240,2.2), movH(2680,FL-36,100,2680,2780,2.0),
    movV(2860,FL-100,100,FL-220,FL-36,2.0),
    trap(1080,FL-46,110),
    solid(2980,FL-80,120,80), solid(3020,FL-160,110,80), solid(3060,FL-240,140,80),
    solid(3100,FL-300,180,18), solid(3200,FL-360,200,18), solid(3320,FL-420,360,18),
    solid(3100,FL-240,580,WH-FL+240),
  ];
  // Pontos de calibração do astrolábio
  const astroPoints=[
    new AstroPoint(600,FL-60,'Calibrar'),
    new AstroPoint(1400,FL-60,'Calibrar'),
    new AstroPoint(2200,FL-60,'Calibrar'),
  ];
  // Timer do Harmattan
  let harmattanTimer=1800; // frames até tempestade chegar (30s)
  let harmattanActive=false, harmattanPeak=false;
  let astroCalibrated=false;
  const enemies=[ new Enemy(420,FL-44,'mercador',60),new Enemy(880,FL-44,'escorpiao',80),new Enemy(1380,FL-44,'mercador',70),new Enemy(1900,FL-44,'escorpiao',100),new Enemy(2320,FL-44,'mercador',80) ];
  const cols=[ ...[100,200,420,640,880,1120,1380,1640,1900,2260,2540,2780].map(x=>new Col(x,FL-50,'halita')) ];
  const triggers=[
    new Trigger(3400,FL-480,200,480,'Encontrar a Biblioteca',(player,level)=>{
      if(!astroCalibrated){notify('Calibre o Astrolábio primeiro (3/3 pontos de sol)!');return;}
      player.interactAnim=90;sfx('astro_ok');
      showDialog([
        '"Use o Astrolábio para encontrar a Biblioteca antes da tempestade. Gire o instrumento até a sombra do estilete se alinhar com o sol — ele vai te mostrar onde fica o norte."',
        '"A Biblioteca de Sankoré fica a nordeste do bazar. Rápido — quando a areia começa a subir no horizonte, você tem cerca de 10 minutos antes de não conseguir mais ver a rua à sua frente."',
        '"Ferramentas de leitura do ambiente natural são mais confiáveis que a intuição visual. A mesma lição que os Anishinaabe ensinaram com o cobre."',
        'A Biblioteca está próxima. Um último capítulo.',
      ],()=>{notify('✦ Biblioteca encontrada! Cena 4 desbloqueada.');level.triggers[0].done=true;setTimeout(()=>G.nextLevel(),4000);});
    }),
  ];
  return{
    id:3,bg:'bg03',W:WW,H:WH,startX:60,startY:FL-90,
    title:'O Bazar e o Harmattan',
    hint:'🔭 Use Astrolábio [E] nos raios de sol (3×) antes da tempestade!',
    plats,enemies,cols,triggers,astroPoints,salDeposits:[],
    harmattanTimer,harmattanActive,harmattanPeak,astroCalibrated,
    onAstroCalibrated(){ this.astroCalibrated=true; astroCalibrated=true; this.harmattanTimer=3600; notify('✦ Norte determinado! Tempestade desacelerada — siga a nordeste!'); },
    intro:[
      '"O bazar de Timbuktu — Século XIV. 25.000 estudantes na Universidade de Sankoré. Ouro pesado em balanças de bronze. Manuscritos em árabe, tamacheque e mandinga."',
      '"Mas o Harmattan se aproxima no horizonte norte — uma parede de areia que vai cobrir tudo em minutos."',
      'Calibre o Astrolábio nos pontos de sol [E] antes que a tempestade chegue!'
    ],
    update(player){
      tickMoving(this.plats);tickTrapdoors(this.plats);
      for(const e of this.enemies)e.update(this.plats,player);
      for(const ap of this.astroPoints)ap.tick();
      for(const c of this.cols)c.tick();
      // Harmattan timer
      if(this.harmattanTimer>0){ this.harmattanTimer--; if(this.harmattanTimer<=600&&!this.harmattanActive){this.harmattanActive=true;sfx('harmattan');notify('⚠ HARMATTAN! A tempestade de areia se aproxima — calibre o Astrolábio AGORA!');} if(this.harmattanTimer<=0&&!this.astroCalibrated){ this.harmattanPeak=true; if(!G.dialog)showDialog(['"A areia cobre tudo. Não consigo ver a frente da mão. Tenho que me abrigar e esperar passar..."','[Sistema] Use o Astrolábio nos raios de sol antes que o Harmattan chegue. Pressione [E] nos 3 pontos de calibração luminosos.',],()=>{this.harmattanTimer=900;this.harmattanPeak=false;}); } }
      POPUP.tick();
    },
    draw(player){
      // Harmattan overlay — areia crescente
      if(this.harmattanActive){
        const intensity=Math.min(1,(1800-this.harmattanTimer)/1800);
        const sandAlpha=this.harmattanPeak?0.7:intensity*0.45;
        ctx.fillStyle=`rgba(200,160,60,${sandAlpha})`;ctx.fillRect(0,0,W,H);
        // Partículas de areia
        if(Math.floor(Date.now()/20)%2===0) sandBurst(cam.x+Math.random()*W,Math.random()*H,4);
      }
      // Minaretes de Timbuktu ao fundo
      for(let m=0;m<3;m++){
        const mx=800+m*500-cam.x*0.4; const my=FL-cam.y-280;
        if(mx<-60||mx>W+60) continue;
        ctx.fillStyle='#c89050';ctx.fillRect(mx-18,my,36,260);
        ctx.fillStyle='#b87840';ctx.fillRect(mx-22,my+200,44,30); // varanda
        ctx.fillStyle='#d4a060';ctx.fillRect(mx-14,my-30,28,40); // topo
        ctx.fillStyle='#c89050';ctx.beginPath();ctx.arc(mx,my-30,6,0,Math.PI*2);ctx.fill();
        // Espigas de palma típicas da arquitetura sahel
        for(let s=0;s<5;s++) ctx.fillRect(mx-16+s*8,my-10+s%2*6,4,20);
      }
      for(const ap of this.astroPoints)ap.draw();
      for(const e of this.enemies)e.draw();for(const c of this.cols)c.draw();for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

// ── Cena 4: Biblioteca de Sankoré — conclusão, manuscrito
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
  const dromedario=new Dromedario(); dromedario.visible=true;
  const dromMessages=[
    {x:500,shown:false,text:'"Sankoré — 25.000 estudantes no século XIV. Mais do que nas universidades de Oxford e Paris juntas nesta época."'},
    {x:1300,shown:false,text:'"O conhecimento que permitiu a Revolução Científica europeia passou por aqui. Astronomia, medicina, mineralogia — tudo documentado."'},
    {x:2100,shown:false,text:'"700.000 manuscritos de Timbuktu. Muitos escondidos na areia durante invasões do século XVI. Estão sendo recuperados até hoje."'},
    {x:2700,shown:false,text:'"No altar da biblioteca, complete a missão. Este manuscrito sobre minerais chegou à Europa e estava em Florença quando Galileu nasceu."'},
  ];
  const enemies=[ new Enemy(200,FL-44,'mercador',60),new Enemy(680,FL-44,'escorpiao',70),new Enemy(1100,FL-44,'mercador',80),new Enemy(1600,FL-44,'escorpiao',70),new Enemy(2050,FL-44,'mercador',80) ];
  const cols=[ ...[100,200,900,1100,1340,1560,1820,2060,2380,2480].map(x=>new Col(x,FL-50,'halita')), new Col(3450,FL-450,'manuscrito') ];
  const triggers=[
    new Trigger(2780,FL-460,240,460,'Completar a Fase!',(player,level)=>{
      if(!player.items.includes('manuscrito')){notify('Colete o Manuscrito de Timbuktu primeiro!');return;}
      level.triggers[0].done=true;player.interactAnim=120;sfx('unlock');
      const halN=player.items.filter(i=>i==='halita').length;
      showDialog([
        '"Este manuscrito sobre minerais foi escrito aqui, em Timbuktu, no século XIV. Cinquenta anos depois, chegou à Europa via Marrocos."',
        '"Está na biblioteca de Florença quando Galileu nasce. O conhecimento que permitiu a Revolução Científica europeia passou por aqui — por este deserto, por esta cidade de sal e ouro."',
        '"Não existe um centro do mundo intelectual. Existe uma rede. E esta cidade de areia foi um dos nós mais importantes dessa rede."',
        '"A história que a Europa decidiu esquecer: antes de Columbus, antes da Revolução Industrial, havia um mundo conectado por caravanas, manuscritos e curiosidade."',
        `🏆 FASE 4.3 CONCLUÍDA! ${halN} lajes de sal coletadas.\nTrilogia da África encerrada.\nPróximo destino: Ásia!`,
      ],()=>{_salvarProgresso(G.player?.score||0,G.deaths);G.state='complete';});
    }),
  ];
  return{
    id:4,bg:'bg04',W:WW,H:WH,startX:60,startY:FL-90,
    title:'A Biblioteca de Sankoré',
    hint:'Siga o Dromedário ao altar. [E] para completar a jornada.',
    plats,enemies,cols,triggers,dromedario,dromMessages,salDeposits:[],astroPoints:[],
    intro:[
      '"Na Biblioteca de Sankoré ao entardecer — prateleiras de papiro, a luz entrando por aberturas geométricas na parede de terra."',
      '"Através de uma janela, o rio Níger brilha dourado."',
      'Siga o Dromedário até o altar e complete a missão.'
    ],
    update(player){
      tickMoving(this.plats);tickTrapdoors(this.plats);for(const e of this.enemies)e.update(this.plats,player);
      if(!G.dialog)this.dromedario.update(player);
      for(const dm of this.dromMessages){ if(!dm.shown&&player.x>dm.x&&!G.dialog){dm.shown=true;showDialog([dm.text],null,'🐪 DROMEDÁRIO');} }
      for(const c of this.cols)c.tick();POPUP.tick();
    },
    draw(player){
      // Luz de entardecer dourada pelo Níger
      const nigerGlow=ctx.createLinearGradient(0,H*0.4,0,H);
      nigerGlow.addColorStop(0,'rgba(200,140,30,0.06)');nigerGlow.addColorStop(1,'rgba(160,100,20,0.12)');
      ctx.fillStyle=nigerGlow;ctx.fillRect(0,H*0.4,W,H*0.6);
      // Prateleiras de manuscritos na biblioteca
      for(let sh=0;sh<4;sh++){
        const sy=100+sh*80; ctx.fillStyle='#806030';ctx.fillRect(0,sy,80,10);
        for(let b=0;b<6;b++){ ctx.fillStyle=['#c89050','#a07030','#b88040','#e0c870','#c0a050','#d0b060'][b%6]; ctx.fillRect(4+b*12,sy-20+b%3*8,10,24); }
      }
      // Glow do manuscrito no altar
      const ag=ctx.createRadialGradient(3450-cam.x,FL-450-cam.y,0,3450-cam.x,FL-450-cam.y,140);
      ag.addColorStop(0,'rgba(220,180,40,0.22)');ag.addColorStop(1,'rgba(220,180,40,0)');
      ctx.fillStyle=ag;ctx.fillRect(3310-cam.x,FL-490-cam.y,280,280);
      this.dromedario.draw();
      for(const e of this.enemies)e.draw();for(const c of this.cols)c.draw();for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

// ── HUD ────────────────────────────────────────────────────────────
function drawHUD(player,level){
  ctx.fillStyle='rgba(0,0,0,0.65)';ctx.fillRect(0,0,W,38);
  for(let i=0;i<player.maxHp;i++){ ctx.fillStyle=i<player.hp?'#e02020':'#333'; ctx.beginPath();const hx=16+i*28,hy=10;ctx.arc(hx+5,hy+5,5,Math.PI,0);ctx.arc(hx+15,hy+5,5,Math.PI,0);ctx.lineTo(hx+20,hy+5);ctx.bezierCurveTo(hx+20,hy+14,hx+10,hy+18,hx+10,hy+18);ctx.bezierCurveTo(hx+10,hy+18,hx,hy+14,hx,hy+5);ctx.closePath();ctx.fill(); }
  ctx.fillStyle='rgba(210,170,30,.9)';ctx.font='13px "Courier New"';ctx.textAlign='center';ctx.fillText(level.title,W/2,24);ctx.textAlign='left';
  ctx.fillStyle='#e0b030';ctx.font='bold 15px "Courier New"';ctx.textAlign='right';ctx.fillText('⭐ '+player.score,W-14,24);ctx.textAlign='left';
  const tY=44;
  ctx.fillStyle='rgba(0,0,0,0.5)';_rr(16,tY,140,28,4);ctx.fill();
  ctx.strokeStyle=player.activeTool?'#e0b030':'#444';ctx.lineWidth=1.5;_rr(16,tY,140,28,4);ctx.stroke();
  if(player.activeTool&&ITEM_DEFS[player.activeTool]){const def=ITEM_DEFS[player.activeTool];ctx.font='14px serif';ctx.fillText(def.icon,24,tY+20);ctx.font='11px "Courier New"';ctx.fillStyle='#e0b030';ctx.fillText(def.nome,42,tY+20);}
  else{ctx.font='11px "Courier New"';ctx.fillStyle='#555';ctx.fillText('Sem ferramenta',22,tY+20);}
  ctx.fillStyle='rgba(180,140,20,0.15)';_rr(162,tY,46,28,4);ctx.fill();ctx.strokeStyle='#806010';ctx.lineWidth=1.5;_rr(162,tY,46,28,4);ctx.stroke();
  ctx.font='bold 11px "Courier New"';ctx.fillStyle='#b09020';ctx.textAlign='center';ctx.fillText('[I]',185,tY+19);ctx.textAlign='left';
  let ix=W-16;const inv=[];
  if(player.items.includes('manuscrito'))  inv.push('📜 MANUS.');
  if(player.items.includes('astrolabio')) inv.push('🔭 ASTRO');
  if(player.items.includes('balanca'))    inv.push('⚖️ BALANÇA');
  if(player.items.includes('machado'))    inv.push('🪓 MACHADO');
  const hn=player.items.filter(i=>i==='halita').length;
  if(hn>0) inv.push('⬜ '+hn);
  for(const it of inv){ctx.fillStyle='#e0b030';ctx.font='12px "Courier New"';ctx.textAlign='right';ctx.fillText(it,ix,tY+20);ctx.textAlign='left';ix-=ctx.measureText(it).width+20;}
  // Harmattan timer bar
  if(level.harmattanActive&&!level.astroCalibrated){
    const pct=Math.max(0,level.harmattanTimer/1800); const bW=180,bX=W/2-90,bY=tY;
    ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(bX,bY,bW,12);
    ctx.fillStyle=pct>0.4?'rgba(200,140,20,0.9)':'rgba(200,60,20,0.9)';ctx.fillRect(bX,bY,bW*pct,12);
    ctx.strokeStyle='rgba(200,150,40,0.6)';ctx.lineWidth=1;ctx.strokeRect(bX,bY,bW,12);
    ctx.font='10px "Courier New"';ctx.fillStyle='#ffd060';ctx.textAlign='center';ctx.fillText('⚠ HARMATTAN',W/2,bY+10);ctx.textAlign='left';
  }
  ctx.fillStyle='rgba(220,180,80,.72)';ctx.font='12px "Courier New"';ctx.textAlign='center';ctx.fillText(level.hint,W/2,H-10);ctx.textAlign='left';
  if(G.timeOnLevel<600){ctx.fillStyle='rgba(0,0,0,0.55)';ctx.fillRect(8,H-44,480,28);ctx.fillStyle='#aaa';ctx.font='12px "Courier New"';ctx.fillText('← → Mover  ↑/Espaço Pular  E Interagir/Astrolábio  I Inventário',14,H-25);}
}

// ── Title Screen ──────────────────────────────────────────────────
function drawTitle(){
  const bg=IMG['bg01'];
  if(bg&&bg.complete){ctx.globalAlpha=0.55;drawBg('bg01');ctx.globalAlpha=1;}
  else{const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#180e02');g.addColorStop(1,'#050200');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
  ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(0,0,W,H);
  // Estrelas
  for(let i=0;i<120;i++){const sx=(i*147.5)%W,sy=(i*79.7)%280;ctx.fillStyle=`rgba(255,240,180,${.15+Math.sin(Date.now()/1400+i)*.15})`;ctx.fillRect(sx,sy,i%4===0?2:1,i%4===0?2:1);}
  // Dromedário andando no título
  if(IMG['dromedario_img']&&IMG['dromedario_img'].complete){
    const lx=((Date.now()/18)%(W+140))-70;const ly=200+Math.sin(Date.now()/1100)*12;
    ctx.drawImage(IMG['dromedario_img'],0,0,96,96,lx,ly,120,120);
  }
  ctx.textAlign='center';
  ctx.shadowColor='#d4a020';ctx.shadowBlur=40;ctx.fillStyle='#e0b030';ctx.font='bold 46px "Courier New"';ctx.fillText('A CIDADE ONDE O OURO VIRA CONHECIMENTO',W/2,168);
  ctx.shadowBlur=0;ctx.fillStyle='#a07820';ctx.font='22px "Courier New"';ctx.fillText('Fase 4.3  —  Timbuktu, Mali · Século XIV',W/2,216);
  if(IMG.card43){ const cardSize=160,cardX=W/2-80,cardY=248; const glow=ctx.createRadialGradient(W/2,cardY+80,0,W/2,cardY+80,130);glow.addColorStop(0,'rgba(200,160,40,0.22)');glow.addColorStop(1,'rgba(200,160,40,0)');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(W/2,cardY+80,130,0,Math.PI*2);ctx.fill();ctx.drawImage(IMG.card43,cardX,cardY,cardSize,cardSize); }
  ctx.fillStyle=`rgba(200,160,30,${.55+Math.sin(Date.now()/550)*.4})`;ctx.font='19px "Courier New"';ctx.fillText('▶  Pressione ENTER para começar  ◀',W/2,462);
  ctx.fillStyle='#c0c8d8';ctx.font='18px "Courier New"';ctx.fillText('← → Mover  ↑/Espaço Pular  E Interagir/Astrolábio  I Inventário',W/2,506);ctx.fillText('[M] Menu Principal',W/2,540);ctx.textAlign='left';
}

function drawDeath(){
  ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);
  ctx.textAlign='center';ctx.shadowColor='#ff2020';ctx.shadowBlur=30;ctx.fillStyle='#ff5050';ctx.font='bold 56px "Courier New"';ctx.fillText('VOCÊ CAIU!',W/2,H/2-50);ctx.shadowBlur=0;
  CORVAN.draw(ctx, 'hurt', Math.floor(Date.now()/250)%4,W/2-40,H/2-30,80,Math.round(80/172*352));
  ctx.fillStyle='#e0b030';ctx.font='20px "Courier New"';ctx.fillText('Pressione  R  para recomeçar',W/2,H/2+100);ctx.fillText(`Mortes: ${G.deaths}`,W/2,H/2+132);
  ctx.fillStyle='#888';ctx.font='15px "Courier New"';ctx.fillText('[M] Menu Principal',W/2,H/2+168);ctx.textAlign='left';
}

function drawComplete(){
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0c0700');g.addColorStop(1,'#241200');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  const rg=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,500);rg.addColorStop(0,'rgba(200,160,40,.16)');rg.addColorStop(1,'rgba(200,160,40,0)');ctx.fillStyle=rg;ctx.fillRect(0,0,W,H);
  ctx.textAlign='center';ctx.shadowColor='#e0b030';ctx.shadowBlur=40;ctx.fillStyle='#d4a020';ctx.font='bold 40px "Courier New"';ctx.fillText('✦  FASE 4.3 CONCLUÍDA  ✦',W/2,120);
  ctx.shadowBlur=0;ctx.fillStyle='#e8d090';ctx.font='20px "Courier New"';ctx.fillText('A Cidade Onde o Ouro Vira Conhecimento!',W/2,170);
  const lines=['⬜  Halita Saariana — o sal que valia ouro no Saara medieval','📜  Manuscrito de Timbuktu — o elo que ligou África e Europa','🔭  Astrolábio Islâmico — a bússola que atravessou continentes','🐪  Dromedário — 700 km de deserto, 21 dias, uma cidade'];
  ctx.fillStyle='#e0c878';ctx.font='16px "Courier New"';lines.forEach((l,i)=>ctx.fillText(l,W/2,232+i*32));
  ctx.fillStyle='#e0b030';ctx.font='18px "Courier New"';ctx.fillText(`Pontuação: ⭐ ${G.player?.score||0}   Mortes: ${G.deaths}`,W/2,398);
  ctx.fillStyle=`rgba(200,160,30,${.6+Math.sin(Date.now()/600)*.4})`;ctx.font='17px "Courier New"';ctx.fillText('▶ [M] Menu Principal ◀',W/2,444);
  ctx.font='64px serif';ctx.fillText('🏆',W/2-32,528);ctx.textAlign='left';
}

// ── Game engine ───────────────────────────────────────────────────
const LEVELS=[buildL1,buildL2,buildL3,buildL4];
const G={ state:'title',lvIdx:0,level:null,player:null,dialog:false,deaths:0,timeOnLevel:0,_storedItems:[],_storedScore:0,_storedTool:null,
  load(idx){ this.lvIdx=idx;particles=[];tileTheme=TILE_THEMES[idx+1]||TILE_THEMES[1];this.level=LEVELS[idx]();cam.x=0;cam.y=0;this.player=new Player(this.level.startX,this.level.startY);if(idx>0){this.player.items=[...this._storedItems];this.player.score=this._storedScore;this.player.activeTool=this._storedTool||null;}this.dialog=false;this.state='playing';this.timeOnLevel=0;BUBBLE.active=false;POPUP.active=false;setTimeout(()=>{if(this.state==='playing')showDialog(this.level.intro,null);},900); },
  nextLevel(){ this._storedItems=[...this.player.items];this._storedScore=this.player.score;this._storedTool=this.player.activeTool;if(this.lvIdx+1<LEVELS.length)this.load(this.lvIdx+1);else this.state='complete'; },
  update(){ if(this.state!=='playing')return;this.timeOnLevel++;checkDlg();if(INV.open)INV.navigate(this.player);updateCam(this.player.x,this.level.W);this.level.update(this.player);this.player.update(this.level);tickParticles();tickNotif();if(this.player.dead){this.deaths++;this.state='dead';}dlgFaceT+=0.08; },
  draw(){ ctx.clearRect(0,0,W,H);if(this.state==='title'){drawTitle();return;}if(this.state==='complete'){drawComplete();return;}drawBg(this.level.bg);for(const p of this.level.plats)drawPlatform(p);this.level.draw(this.player);drawParticles();this.player.draw();if(this.state==='dead'){drawDeath();return;}drawHUD(this.player,this.level);BUBBLE.draw(this.player);drawNotif();POPUP.draw();INV.draw(this.player); }
};

function _journalColetar(tipo, count){
  // Save item to both coletados (diary) and phase-specific collection
  const id = TIPO_TO_JOURNAL[tipo] || tipo;
  if (!id) return;
  try {
    const raw = localStorage.getItem('mineralis_save_v2');
    const save = raw ? JSON.parse(raw) : {versao:1,iniciado:true};
    // Global diary
    if (!save.coletados) save.coletados = {};
    if (count && count > 1) {
      save.coletados[id] = Math.max(save.coletados[id]||0, count);
    } else if (!save.coletados[id]) {
      save.coletados[id] = true;
    }
    // Phase-specific collection
    if (!save.fases) save.fases = {};
    if (!save.fases['4.3']) save.fases['4.3'] = {desbloqueada:true,estrelas:0,coletados:{}};
    if (!save.fases['4.3'].coletados) save.fases['4.3'].coletados = {};
    if (count && count > 1) {
      save.fases['4.3'].coletados[id] = Math.max(save.fases['4.3'].coletados[id]||0, count);
    } else {
      save.fases['4.3'].coletados[id] = true;
    }
    localStorage.setItem('mineralis_save_v2', JSON.stringify(save));
  } catch(e) {}
}
function _salvarProgresso(score,deaths){ const estrelas=deaths===0?4:deaths<=2?3:deaths<=5?2:1;try{const raw=localStorage.getItem('mineralis_save_v2');const save=raw?JSON.parse(raw):{versao:1,iniciado:true,fases:{}};if(!save.fases)save.fases={};if(!save.fases['4.3'])save.fases['4.3']={desbloqueada:true,estrelas:0};save.fases['4.3'].estrelas=Math.max(save.fases['4.3'].estrelas||0,estrelas);save.fases['4.3'].desbloqueada=true;localStorage.setItem('mineralis_save_v2',JSON.stringify(save));}catch(e){} }

function startGame(){ G.load(0);G.state='title';loop(); }
function loop(){
  requestAnimationFrame(loop);
  if(G.state==='title'    &&(jp['Enter']||jp['Space'])) G.load(0);
  if(G.state==='dead'     && jp['KeyR'])                G.load(G.lvIdx);
  if(G.state==='complete' &&(jp['Enter']||jp['KeyM'])) _voltarAoMenu();
  if(G.state==='complete' && jp['KeyM']) _voltarAoMenu();
  G.update();G.draw();clearJP();
}

if(!gameReady){
  (function loadLoop(){
    if(gameReady)return;
    requestAnimationFrame(loadLoop);
    ctx.fillStyle='#080500';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#e0b030';ctx.font='bold 22px "Courier New"';ctx.textAlign='center';
    ctx.fillText(`Carregando${'.'.repeat(Math.floor(Date.now()/400)%4)}  ${assetsLoaded}/${totalAssets}`,W/2,H/2);
    ctx.fillStyle='#888';ctx.font='14px "Courier New"';ctx.fillText('Fase 4.3 — A Cidade Onde o Ouro Vira Conhecimento',W/2,H/2+36);
    ctx.textAlign='left';
  })();
}
