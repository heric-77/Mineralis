/* ═══════════════════════════════════════════════════════════════
   FASE 2.1 – O Brilho do American River
   Engine canvas idêntica à Fase 1.1 — Sierra Nevada, Califórnia, 1848
   ═══════════════════════════════════════════════════════════════ */

const SAVE_KEY = 'mineralis_save_v2';
function saveRead(){try{return JSON.parse(localStorage.getItem(SAVE_KEY))||{};}catch{return{};}}
function saveWrite(d){try{localStorage.setItem(SAVE_KEY,JSON.stringify(d));}catch{}}
function unlockPhase(id){const s=saveRead();if(!s.fases)s.fases={};if(!s.fases[id])s.fases[id]={};s.fases[id].desbloqueada=true;saveWrite(s);}
function journalCollect(id){const s=saveRead();if(!s.coletados)s.coletados={};if(!s.coletados[id]){s.coletados[id]=true;saveWrite(s);}}

const W=1280,H=720;
const wrap=document.getElementById('wrap');
const canvas=document.getElementById('c');
const ctx=canvas.getContext('2d');
canvas.width=W;canvas.height=H;

function resize(){
  const s=Math.min(window.innerWidth/W,window.innerHeight/H);
  const sw=Math.round(W*s),sh=Math.round(H*s);
  canvas.style.width=sw+'px';canvas.style.height=sh+'px';
  wrap.style.position='fixed';
  wrap.style.left=Math.round((window.innerWidth-sw)/2)+'px';
  wrap.style.top=Math.round((window.innerHeight-sh)/2)+'px';
  wrap.style.width=sw+'px';wrap.style.height=sh+'px';
}
resize();window.addEventListener('resize',resize);

// ── Áudio ────────────────────────────────────────────────────────
let AC;try{AC=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}
function sfx(type){
  if(!AC)return;if(AC.state==='suspended')AC.resume();
  const o=AC.createOscillator(),g=AC.createGain();
  o.connect(g);g.connect(AC.destination);const t=AC.currentTime;
  if(type==='jump')   {o.frequency.setValueAtTime(220,t);o.frequency.exponentialRampToValueAtTime(440,t+.14);g.gain.setValueAtTime(.13,t);g.gain.exponentialRampToValueAtTime(.001,t+.16);}
  else if(type==='ouro')   {o.type='triangle';o.frequency.setValueAtTime(880,t);o.frequency.exponentialRampToValueAtTime(1760,t+.18);g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.001,t+.28);}
  else if(type==='picareta'){o.type='square';o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(70,t+.15);g.gain.setValueAtTime(.15,t);g.gain.exponentialRampToValueAtTime(.001,t+.18);}
  else if(type==='item')   {o.frequency.setValueAtTime(440,t);o.frequency.setValueAtTime(660,t+.1);o.frequency.setValueAtTime(880,t+.2);g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.001,t+.3);}
  else if(type==='unlock') {o.frequency.setValueAtTime(330,t);o.frequency.setValueAtTime(440,t+.15);o.frequency.setValueAtTime(660,t+.3);g.gain.setValueAtTime(.13,t);g.gain.exponentialRampToValueAtTime(.001,t+.5);}
  else if(type==='hit')    {o.type='sawtooth';o.frequency.setValueAtTime(200,t);o.frequency.exponentialRampToValueAtTime(60,t+.2);g.gain.setValueAtTime(.18,t);g.gain.exponentialRampToValueAtTime(.001,t+.22);}
  else if(type==='water')  {o.type='sine';o.frequency.setValueAtTime(320,t);o.frequency.setValueAtTime(280,t+.05);o.frequency.setValueAtTime(350,t+.12);g.gain.setValueAtTime(.07,t);g.gain.exponentialRampToValueAtTime(.001,t+.35);}
  else if(type==='pirita') {o.type='sawtooth';o.frequency.setValueAtTime(250,t);o.frequency.exponentialRampToValueAtTime(180,t+.2);g.gain.setValueAtTime(.10,t);g.gain.exponentialRampToValueAtTime(.001,t+.22);}
  o.start(t);o.stop(t+.6);
}

// ── Assets ──────────────────────────────────────────────────────
const IMG={};
let assetsLoaded=0,totalAssets=5,gameReady=false;
[
  ['bg01','Assets/cena1.svg'],
  ['bg02','Assets/cena2.svg'],
  ['bg03','Assets/cena3.svg'],
  ['bg04','Assets/cena4.svg'],
  ['card21','Assets/2_1_california.svg'],
].forEach(([key,src])=>{
  const img=new Image();
  img.onload=()=>{IMG[key]=img;if(++assetsLoaded>=totalAssets){gameReady=true;startGame();}};
  img.onerror=()=>{IMG[key]=null;if(++assetsLoaded>=totalAssets){gameReady=true;startGame();}};
  img.src=src;
});

// ── Input ────────────────────────────────────────────────────────
const keys={},jp={};
window.addEventListener('keydown',e=>{if(!keys[e.code])jp[e.code]=true;keys[e.code]=true;
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
  if((e.code==='KeyI'||e.code==='Tab')&&G.state==='playing'){e.preventDefault();if(G.player)INV.toggle(G.player);}
  if(e.code==='Escape'&&INV.open){INV.close();}
  if(e.code==='KeyM'){window.location.href='../../MenuPrincipal/index.html';}
});
window.addEventListener('keyup',e=>delete keys[e.code]);
const TOUCH={l:false,r:false,j:false,e:false};
function bindT(id,k){const el=document.getElementById(id);if(!el)return;
  el.addEventListener('touchstart',ev=>{ev.preventDefault();TOUCH[k]=true;if(k==='j'||k==='e')jp['_t'+k]=true;},{passive:false});
  el.addEventListener('touchend',ev=>{ev.preventDefault();TOUCH[k]=false;},{passive:false});}
bindT('tb-l','l');bindT('tb-r','r');bindT('tb-j','j');bindT('tb-e','e');
const isL=()=>keys['ArrowLeft']||keys['KeyA']||TOUCH.l;
const isR=()=>keys['ArrowRight']||keys['KeyD']||TOUCH.r;
const isJ=()=>jp['ArrowUp']||jp['KeyW']||jp['Space']||jp['_tj'];
const isE=()=>jp['KeyE']||jp['Enter']||jp['_te'];
function clearJP(){for(const k in jp)delete jp[k];}

// ── Item Defs ────────────────────────────────────────────────────
const ITEM_DEFS={
  bateia:     {cat:'ferramenta',nome:'Bateia',icon:'🪣',journalId:'bateia',desc:'Separa o ouro do sedimento pela diferença de densidade.\nGire em círculos: os leves saem, o ouro fica no centro.',drawHand:'left'},
  picareta:   {cat:'ferramenta',nome:'Picareta',icon:'⛏',journalId:'picareta_basica',desc:'Extrai veios de quartzo aurífero das paredes rochosas.\nUse [E] próximo a um veio brilhante.',drawHand:'left'},
  touchstone: {cat:'ferramenta',nome:'Pedra de Toque',icon:'🪨',journalId:'pedra_toque',desc:'Testa a autenticidade do ouro.\nTraço dourado = ouro real. Traço verde-escuro = pirita.',drawHand:'right'},
  ouro:       {cat:'minerio',nome:'Ouro (Au)',icon:'✨',journalId:'ouro',desc:'Metal mais maleável que existe.\n1g pode virar um fio de 3km ou uma folha translúcida.'},
  pirita:     {cat:'minerio',nome:'Pirita (FeS₂)',icon:'🟡',journalId:'pirita',desc:'O "Ouro de Tolo" — cor dourada similar ao ouro.\nMas é frágil, mais leve e deixa traço esverdeado.'},
  placa:      {cat:'artefato',nome:'Placa de Reivindicação',icon:'📋',journalId:'placa_claim',desc:'Registrava o direito exclusivo de garimpar um lote.\nBase do sistema legal de propriedade dos EUA.'},
};

// ── Inventário / Diário ──────────────────────────────────────────
const INV={
  open:false,tab:0,cursor:0,
  TABS:[
    {id:'ferramenta',label:'🔧 Ferramentas',color:'#e0b840'},
    {id:'minerio',   label:'⛏ Minérios',   color:'#f0d060'},
    {id:'artefato',  label:'🏺 Artefatos',  color:'#d4a060'},
  ],
  tabItems(player){
    const cat=this.TABS[this.tab].id;
    let saved={};try{const s=localStorage.getItem(SAVE_KEY);if(s){const j=JSON.parse(s);saved=j.coletados||{};}}catch(e){}
    return Object.entries(ITEM_DEFS).filter(([id,def])=>{
      if(def.cat!==cat)return false;
      return player.items.includes(id)||player.items.includes(id+'_ok')||saved[def.journalId||id];
    }).map(([id,def])=>({id,...def}));
  },
  toggle(player){this.open=!this.open;if(this.open){this.cursor=Math.min(this.cursor,Math.max(0,this.tabItems(player).length-1));}G.dialog=this.open;},
  close(){this.open=false;G.dialog=false;},
  isUpKey(){return jp['ArrowUp']||jp['KeyW'];},
  isDownKey(){return jp['ArrowDown']||jp['KeyS'];},
  isLeftKey(){return jp['ArrowLeft']||jp['KeyA'];},
  isRightKey(){return jp['ArrowRight']||jp['KeyD'];},
  navigate(player){
    if(!this.open)return false;
    if(this.isLeftKey()){this.tab=(this.tab+2)%3;this.cursor=0;return true;}
    if(this.isRightKey()){this.tab=(this.tab+1)%3;this.cursor=0;return true;}
    const items=this.tabItems(player);
    if(this.isUpKey()){this.cursor=Math.max(0,this.cursor-1);return true;}
    if(this.isDownKey()){this.cursor=Math.min(items.length-1,this.cursor+1);return true;}
    return false;
  },
  draw(player){
    if(!this.open)return;
    ctx.fillStyle='rgba(0,0,0,0.65)';ctx.fillRect(0,0,W,H);
    const PW=780,PH=480,PX=(W-PW)/2,PY=(H-PH)/2;
    ctx.shadowColor='rgba(0,0,0,0.7)';ctx.shadowBlur=20;
    ctx.fillStyle='rgba(10,6,2,0.97)';roundRect(PX,PY,PW,PH,16);ctx.fill();ctx.shadowBlur=0;
    ctx.strokeStyle='#c08820';ctx.lineWidth=2.5;roundRect(PX,PY,PW,PH,16);ctx.stroke();
    ctx.fillStyle='#e0b840';ctx.font='bold 16px "Courier New"';ctx.textAlign='center';
    ctx.fillText('📔 DIÁRIO DE BORDO',W/2,PY+28);ctx.textAlign='left';
    ctx.fillStyle='rgba(200,160,40,0.3)';ctx.fillRect(PX+16,PY+38,PW-32,1);
    const TAB_W=PW/3,TAB_Y=PY+44;
    this.TABS.forEach((tab,i)=>{
      const tx=PX+i*TAB_W,active=(i===this.tab);
      ctx.fillStyle=active?'rgba(200,160,40,0.18)':'rgba(0,0,0,0.3)';ctx.fillRect(tx+2,TAB_Y,TAB_W-4,34);
      ctx.fillStyle=active?tab.color:'#666';ctx.font=(active?'bold ':'')+'13px "Courier New"';
      ctx.textAlign='center';ctx.fillText(tab.label,tx+TAB_W/2,TAB_Y+22);ctx.textAlign='left';
      if(active){ctx.fillStyle=tab.color;ctx.fillRect(tx+2,TAB_Y+32,TAB_W-4,3);}
    });
    const CY=TAB_Y+40,CH=PH-(CY-PY)-50,items=this.tabItems(player);
    const COL_W=260,DESC_X=PX+280;
    if(items.length===0){
      ctx.fillStyle='#554';ctx.font='14px "Courier New"';ctx.textAlign='center';
      ctx.fillText('Nenhum item ainda.',W/2,CY+CH/2);ctx.fillText('Explore para desbloquear!',W/2,CY+CH/2+24);ctx.textAlign='left';
    } else {
      items.forEach((item,i)=>{
        const iy=CY+16+i*52,selected=(i===this.cursor);
        if(selected){ctx.fillStyle='rgba(200,160,40,0.18)';roundRect(PX+16,iy-10,COL_W,46,8);ctx.fill();ctx.strokeStyle='#e0b840';ctx.lineWidth=1.5;roundRect(PX+16,iy-10,COL_W,46,8);ctx.stroke();}
        ctx.font='24px serif';ctx.fillText(item.icon,PX+28,iy+22);
        ctx.font='14px "Courier New"';ctx.fillStyle=selected?'#e8d8a0':'#aaa';ctx.fillText(item.nome,PX+62,iy+16);
      });
      const sel=items[this.cursor];
      if(sel){
        ctx.fillStyle='rgba(200,160,40,0.08)';roundRect(DESC_X,CY,PW-DESC_X+PX-16,CH-10,8);ctx.fill();
        ctx.font='48px serif';ctx.textAlign='center';ctx.fillText(sel.icon,DESC_X+(PW-DESC_X+PX-16)/2,CY+70);ctx.textAlign='left';
        ctx.font='bold 15px "Courier New"';ctx.fillStyle='#e0b840';ctx.textAlign='center';ctx.fillText(sel.nome,DESC_X+(PW-DESC_X+PX-16)/2,CY+100);ctx.textAlign='left';
        const catLabel={ferramenta:'🔧 Ferramenta',minerio:'⛏ Minério',artefato:'🏺 Artefato'};
        ctx.font='11px "Courier New"';ctx.fillStyle='#888';ctx.textAlign='center';ctx.fillText(catLabel[sel.cat],DESC_X+(PW-DESC_X+PX-16)/2,CY+118);ctx.textAlign='left';
        ctx.fillStyle='rgba(200,160,40,0.25)';ctx.fillRect(DESC_X+20,CY+126,PW-DESC_X+PX-56,1);
        const descLines=sel.desc.split('\n');ctx.font='13px "Courier New"';ctx.fillStyle='#d8c898';
        descLines.forEach((l,i)=>{ctx.textAlign='center';ctx.fillText(l,DESC_X+(PW-DESC_X+PX-16)/2,CY+146+i*22);});ctx.textAlign='left';
      }
    }
    ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(PX,PY+PH-38,PW,38);
    ctx.fillStyle='rgba(200,160,40,0.3)';ctx.fillRect(PX+16,PY+PH-39,PW-32,1);
    ctx.font='11px "Courier New"';ctx.fillStyle='#888';ctx.textAlign='center';
    ctx.fillText('◀ ▶ Abas   ↑ ↓ Navegar   I Fechar',W/2,PY+PH-14);ctx.textAlign='left';
  }
};

// ── Partículas ───────────────────────────────────────────────────
let particles=[];
function burst(x,y,color,n=8,spd=3.2){
  for(let i=0;i<n;i++){const a=(i/n)*Math.PI*2+Math.random()*.5;
    particles.push({x,y,vx:Math.cos(a)*spd*(0.4+Math.random()),vy:Math.sin(a)*spd*(0.4+Math.random())-1,life:40+Math.random()*20,max:60,color,r:3+Math.random()*4});}
}
function tickParticles(){for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=0.18;p.life--;if(p.life<=0)particles.splice(i,1);}}
function drawParticles(){for(const p of particles){ctx.globalAlpha=p.life/p.max;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x-cam.x,p.y-cam.y,p.r*(p.life/p.max),0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}

// ── Câmera ───────────────────────────────────────────────────────
const cam={x:0,y:0};
function updateCam(px,worldW){cam.x+=(Math.max(0,Math.min(px-W/2+24,worldW-W))-cam.x)*0.12;}

// ── Física ───────────────────────────────────────────────────────
const GRAV=0.46,PSPD=4.5,JUMPF=-12.2,MAXFALL=16;

// ── Tiles ────────────────────────────────────────────────────────
const TILE_THEMES={
  1:{top:'#7a9858',body:'#5a7840',dark:'#3a5820'},  // exterior verde
  2:{top:'#6a5840',body:'#4a3828',dark:'#2a1810'},  // interior pedra/mina
  3:{top:'#7a9858',body:'#5a7840',dark:'#3a5820'},  // rio
  4:{top:'#7a9858',body:'#5a7840',dark:'#3a5820'},  // conclusão
};
let tileTheme=TILE_THEMES[1];

function solid(x,y,w,h){return{type:'solid',x,y,w,h};}
function movH(x,y,w,x0,x1,spd){return{type:'solid',moving:true,x,y,w,h:16,x0,x1,spd,vx:spd,vy:0};}
function tickMoving(plats){for(const p of plats){if(!p.moving)continue;if(p.x0!==undefined){p.x+=p.vx;if(p.x<=p.x0||p.x+p.w>=p.x1)p.vx=-p.vx;}}}

function drawPlatform(p){
  const sx=p.x-cam.x,sy=p.y-cam.y;
  if(sx>W+80||sx+p.w<-80||sy>H+40||sy+p.h<-40)return;
  if(p.type==='_dead')return;
  const ts=24,cols=Math.ceil(p.w/ts),rows=Math.ceil(p.h/ts);
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      const tx=sx+c*ts,ty=sy+r*ts,tw=Math.min(ts,sx+p.w-tx),th=Math.min(ts,sy+p.h-ty);
      ctx.fillStyle=r===0?tileTheme.body:(r%2===0?tileTheme.dark:tileTheme.body);ctx.fillRect(tx,ty,tw,th);
      ctx.fillStyle='rgba(0,0,0,0.1)';ctx.fillRect(tx+tw-1,ty,1,th);ctx.fillRect(tx,ty+th-1,tw,1);
    }
  }
  ctx.fillStyle=tileTheme.top;ctx.fillRect(sx,sy,p.w,4);
  ctx.fillStyle='rgba(180,200,140,0.3)';
  for(let i=0;i<Math.floor(p.w/20);i++)ctx.fillRect(sx+i*20+4,sy-2,6,4);
  if(p.moving){ctx.fillStyle='rgba(200,180,100,0.35)';ctx.fillRect(sx,sy,p.w,4);}
}

function roundRect(x,y,w,h,r){
  ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();
}

// ── Corvan (pixel art) ───────────────────────────────────────────
function drawCorvan(cx,cy,scale=1,flipX=false,frame=0,activeTool=null){
  const S=scale;
  ctx.save();ctx.translate(cx,cy);if(flipX)ctx.scale(-1,1);
  const r=(x,y,w,h,fill,op)=>{ctx.fillStyle=fill;ctx.globalAlpha=op!==undefined?op:1;ctx.fillRect(x*S,y*S,w*S,h*S);ctx.globalAlpha=1;};
  const lb=0.7+Math.sin(frame*0.4)*0.3;
  const showPicareta=activeTool==='picareta';
  const showBateia=activeTool==='bateia';
  const showTouchstone=activeTool==='touchstone';
  const showPlaca=activeTool==='placa';
  // Chapéu
  r(7,3,18,2,'#3a2208');r(9,1,14,4,'#4a2e10');
  r(13,0,6,3,'#c8a020');r(14,0,4,2,'#ffe060');
  // Cabeça
  r(9,5,14,9,'#c88050');r(10,6,12,1,'#a86030');
  r(11,8,3,2,'#1a0a04');r(18,8,3,2,'#1a0a04');
  r(12,8,1,1,'#fff');r(19,8,1,1,'#fff');
  r(14,11,4,1,'#a86030');r(12,13,8,1,'#7a3820');
  r(13,14,6,2,'#c88050');
  // Corpo
  r(8,16,16,13,'#3a6030');r(15,17,2,1,'#2a5020');r(15,20,2,1,'#2a5020');r(15,23,2,1,'#2a5020');
  r(12,16,3,3,'#4a7040');r(17,16,3,3,'#4a7040');
  r(8,28,16,2,'#2a1408');r(14,28,4,2,'#c88020');
  // Calças
  r(9,30,14,12,'#383838');r(15,36,2,6,'#282828');
  // Braço esq
  r(3,16,5,12,'#3a6030');r(3,28,5,3,'#a86030');
  // Ferramenta mão esquerda
  if(showPicareta){
    const wb=Math.sin(frame*0.2)*1.5;
    r(0,24+wb,6,1,'#7a4818');r(0,25+wb,1,7,'#7a4818');
    r(0,22+wb,6,3,'#888888');r(4,20+wb,2,3,'#aaaaaa');
  } else if(showBateia){
    // Bateia na mão — forma de tigela
    r(-2,26,10,2,'#8a6020');r(-3,28,12,1,'#6a4810');
    r(-2,25,10,3,'rgba(180,150,80,0.6)');
    ctx.fillStyle='rgba(100,180,255,0.35)';ctx.fillRect(-2*S,26*S,10*S,2*S);
  }
  // Braço dir
  r(24,16,5,12,'#3a6030');r(24,28,5,3,'#a86030');
  if(showTouchstone){
    r(26,30,3,4,'#6a5848');r(24,33,7,3,'#5a4838');
    ctx.fillStyle='rgba(255,200,60,0.6)';ctx.fillRect(25*S,31*S,4*S,2*S);
  }
  if(showPlaca){
    r(25,28,5,8,'#8a5820');r(26,29,3,6,'#c0a060');
    ctx.fillStyle='#5a3010';ctx.font=(2*S)+'px monospace';
    ctx.fillText('⛏',25*S,35*S);
  }
  // Pés
  r(9,42,6,4,'#3a1e08');r(17,42,6,4,'#3a1e08');
  r(8,44,8,2,'#2a1008');r(16,44,8,2,'#2a1008');
  // Brilho chapéu
  ctx.fillStyle='#ffe060';ctx.globalAlpha=0.25*lb;ctx.beginPath();ctx.arc(16*S,1*S,4*S,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=1;ctx.restore();
}

// ── Desenho de colecionáveis ─────────────────────────────────────
function drawOuro(cx,cy,bobT=0){
  ctx.save();ctx.translate(cx,cy+Math.sin(bobT)*5);
  const glow=ctx.createRadialGradient(0,0,0,0,0,22);
  glow.addColorStop(0,'rgba(255,220,60,0.5)');glow.addColorStop(1,'rgba(255,180,0,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,22,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#e0b820';
  ctx.beginPath();ctx.moveTo(-10,-6);ctx.lineTo(0,-14);ctx.lineTo(10,-6);ctx.lineTo(12,4);ctx.lineTo(4,12);ctx.lineTo(-4,12);ctx.lineTo(-12,4);ctx.closePath();ctx.fill();
  ctx.fillStyle='#ffe060';ctx.beginPath();ctx.ellipse(-2,-4,5,4,0.3,0,Math.PI*2);ctx.fill();
  const sa=Math.abs(Math.sin(Date.now()/400));
  ctx.strokeStyle=`rgba(255,240,80,${sa*0.9})`;ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(6,-8);ctx.lineTo(10,-12);ctx.stroke();
  ctx.restore();
}
function drawPirita(cx,cy,bobT=0){
  ctx.save();ctx.translate(cx,cy+Math.sin(bobT)*5);
  ctx.fillStyle='#c8a820';
  ctx.beginPath();ctx.moveTo(-9,-7);ctx.lineTo(2,-12);ctx.lineTo(12,-4);ctx.lineTo(10,8);ctx.lineTo(-2,11);ctx.lineTo(-11,3);ctx.closePath();ctx.fill();
  ctx.fillStyle='#9a8010';ctx.beginPath();ctx.ellipse(0,0,4,3,0.4,0,Math.PI*2);ctx.fill();
  ctx.restore();
}
function drawTouchstone(cx,cy,bobT=0){
  ctx.save();ctx.translate(cx,cy+Math.sin(bobT)*5);
  ctx.fillStyle='#5a4838';
  ctx.beginPath();ctx.moveTo(-14,-8);ctx.lineTo(14,-8);ctx.lineTo(16,8);ctx.lineTo(-16,8);ctx.closePath();ctx.fill();
  ctx.fillStyle='#7a6858';ctx.beginPath();ctx.ellipse(-3,-2,5,3,0.2,0,Math.PI*2);ctx.fill();
  const streak=ctx.createLinearGradient(-6,2,6,2);
  streak.addColorStop(0,'rgba(200,180,40,0.8)');streak.addColorStop(1,'rgba(200,180,40,0)');
  ctx.fillStyle=streak;ctx.fillRect(-6,1,12,3);
  ctx.restore();
}
function drawPlaca(cx,cy,bobT=0){
  ctx.save();ctx.translate(cx,cy+Math.sin(bobT)*5);
  const glow=ctx.createRadialGradient(0,0,0,0,0,26);
  glow.addColorStop(0,'rgba(200,160,80,0.35)');glow.addColorStop(1,'rgba(200,160,80,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,26,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#8a5820';ctx.fillRect(-14,-12,28,24);
  ctx.fillStyle='#c0a060';ctx.fillRect(-12,-10,24,20);
  ctx.fillStyle='#8a5820';ctx.font='8px monospace';ctx.textAlign='center';
  ctx.fillText('⛏ CLAIM',0,-2);ctx.fillText('R. MASON',0,8);ctx.textAlign='left';
  ctx.restore();
}
function drawBateia(cx,cy,bobT=0){
  ctx.save();ctx.translate(cx,cy+Math.sin(bobT)*5);
  const glow=ctx.createRadialGradient(0,0,0,0,0,22);
  glow.addColorStop(0,'rgba(180,150,60,0.4)');glow.addColorStop(1,'rgba(180,150,60,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,22,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#8a6020';
  ctx.beginPath();ctx.ellipse(0,2,18,10,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#6a4810';ctx.beginPath();ctx.ellipse(0,4,14,7,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(100,180,255,0.4)';ctx.beginPath();ctx.ellipse(0,4,10,5,0,0,Math.PI*2);ctx.fill();
  ctx.restore();
}
function drawGrizzly(cx,cy,frame=0){
  ctx.save();ctx.translate(cx,cy);
  const bob=Math.sin(frame*0.5)*3;
  // Corpo
  ctx.fillStyle='#8a5830';ctx.beginPath();ctx.ellipse(0,-10+bob,28,22,0,0,Math.PI*2);ctx.fill();
  // Cabeça
  ctx.fillStyle='#9a6840';ctx.beginPath();ctx.ellipse(2,-40+bob,18,16,0.1,0,Math.PI*2);ctx.fill();
  // Orelhas
  ctx.fillStyle='#8a5830';ctx.beginPath();ctx.arc(-12,-54+bob,7,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(16,-54+bob,7,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#c09070';ctx.beginPath();ctx.arc(-12,-54+bob,4,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(16,-54+bob,4,0,Math.PI*2);ctx.fill();
  // Focinho
  ctx.fillStyle='#c09070';ctx.beginPath();ctx.ellipse(2,-34+bob,10,7,0,0,Math.PI*2);ctx.fill();
  // Olhos
  ctx.fillStyle='#1a0a04';ctx.beginPath();ctx.arc(-6,-42+bob,3,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(10,-42+bob,3,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.6)';ctx.beginPath();ctx.arc(-5,-43+bob,1,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(11,-43+bob,1,0,Math.PI*2);ctx.fill();
  // Nariz
  ctx.fillStyle='#2a1808';ctx.beginPath();ctx.ellipse(2,-32+bob,4,3,0,0,Math.PI*2);ctx.fill();
  // Pernas
  ctx.fillStyle='#7a4820';ctx.fillRect(-24,8+bob,12,22);ctx.fillRect(12,8+bob,12,22);
  ctx.fillRect(-20,18+bob,10,16);ctx.fillRect(10,18+bob,10,16);
  ctx.fillStyle='#5a3210';ctx.fillRect(-22,28+bob,10,8);ctx.fillRect(12,28+bob,10,8);
  ctx.restore();
}
function drawQuartzVein(x,y,frame=0){
  const sx=x-cam.x,sy=y-cam.y;
  if(sx<-80||sx>W+80)return;
  const a=0.5+Math.abs(Math.sin(frame))*0.5;
  // Quartzo branco
  ctx.fillStyle=`rgba(240,240,220,${a*0.9})`;
  ctx.beginPath();ctx.moveTo(sx-20,sy-4);ctx.lineTo(sx-4,sy-16);ctx.lineTo(sx+14,sy-10);ctx.lineTo(sx+20,sy+6);ctx.lineTo(sx+6,sy+14);ctx.lineTo(sx-10,sy+10);ctx.closePath();ctx.fill();
  // Motas douradas
  ctx.fillStyle=`rgba(220,180,20,${a})`;
  for(let i=0;i<5;i++){
    const gx=sx-12+i*8,gy=sy-6+Math.sin(i*1.7)*6;
    ctx.beginPath();ctx.arc(gx,gy,2+Math.random(),0,Math.PI*2);ctx.fill();
  }
  ctx.fillStyle=`rgba(255,230,60,${a*0.7})`;ctx.beginPath();ctx.ellipse(sx-2,sy-4,6,4,0.3,0,Math.PI*2);ctx.fill();
}
function drawRiverFord(x,y,w,frame=0){
  // Seção de rio onde garimpar
  const sx=x-cam.x,sy=y-cam.y;
  if(sx>W+200||sx+w<-200)return;
  // Água
  const wg=ctx.createLinearGradient(sx,sy,sx,sy+40);
  wg.addColorStop(0,'rgba(60,130,200,0.7)');wg.addColorStop(1,'rgba(40,100,170,0.5)');
  ctx.fillStyle=wg;ctx.fillRect(sx,sy,w,40);
  // Ondas
  ctx.strokeStyle='rgba(180,220,255,0.4)';ctx.lineWidth=1.5;
  for(let i=0;i<3;i++){
    const woff=((frame*2+i*40)%w);
    ctx.beginPath();ctx.moveTo(sx+woff,sy+10+i*10);ctx.lineTo(sx+woff+30,sy+10+i*10);ctx.stroke();
  }
  // Pedras
  ctx.fillStyle='#8a7a68';
  for(let i=0;i<6;i++){const rx=sx+30+i*(w/6),ry=sy+20;ctx.beginPath();ctx.ellipse(rx,ry,8+i%3*3,5+i%2*2,i*0.4,0,Math.PI*2);ctx.fill();}
}

// ── Colecionável ─────────────────────────────────────────────────
class Col{
  constructor(x,y,type){this.x=x;this.y=y;this.w=34;this.h=34;this.type=type;this.done=false;this.t=Math.random()*Math.PI*2;}
  tick(){if(!this.done)this.t+=0.06;}
  draw(playerX,playerY){
    if(this.done)return;
    const sx=this.x-cam.x,sy=this.y-cam.y;
    if(sx<-60||sx>W+60)return;
    const TOOL_TYPES=['bateia','picareta','touchstone'];
    const isTool=TOOL_TYPES.includes(this.type);
    if(isTool){
      const a=0.3+Math.abs(Math.sin(this.t*0.8))*0.5;
      const glow=ctx.createRadialGradient(sx+17,sy+17,4,sx+17,sy+17,32);
      glow.addColorStop(0,`rgba(255,220,80,${a})`);glow.addColorStop(1,'rgba(255,200,50,0)');
      ctx.fillStyle=glow;ctx.fillRect(sx-15,sy-15,64,64);
    }
    ctx.save();ctx.translate(sx+this.w/2,sy+this.h/2);
    if(this.type==='ouro')         drawOuro(0,0,this.t);
    else if(this.type==='pirita')  drawPirita(0,0,this.t);
    else if(this.type==='touchstone') drawTouchstone(0,0,this.t);
    else if(this.type==='placa')   drawPlaca(0,0,this.t);
    else if(this.type==='bateia')  drawBateia(0,0,this.t);
    ctx.restore();
    if(isTool&&playerX!==undefined){
      const dist=Math.hypot(playerX+20-(this.x+17),playerY+40-(this.y+17));
      if(dist<110){
        const label=this.type==='bateia'?'🪣 Bateia':this.type==='touchstone'?'🪨 Pedra de Toque':'⛏ Picareta';
        const txt=`[E] Pegar ${label}`;
        const pulse=0.7+Math.sin(Date.now()/300)*0.3;
        ctx.font='bold 13px "Courier New"';
        const tw=ctx.measureText(txt).width+20,bx=sx+17-tw/2,by=sy-42;
        ctx.fillStyle=`rgba(8,4,0,${0.88*pulse})`;roundRect(bx,by,tw,24,5);ctx.fill();
        ctx.strokeStyle=`rgba(220,185,80,${pulse})`;ctx.lineWidth=1.5;roundRect(bx,by,tw,24,5);ctx.stroke();
        ctx.fillStyle=`rgba(240,200,60,${pulse})`;ctx.textAlign='center';ctx.fillText(txt,sx+17,by+16);ctx.textAlign='left';
      }
    }
  }
}

// ── Trigger ──────────────────────────────────────────────────────
class Trigger{
  constructor(x,y,w,h,label,fn,auto=false){this.x=x;this.y=y;this.w=w;this.h=h;this.label=label;this.fn=fn;this.done=false;this.auto=auto;}
  draw(px,py){
    if(this.done||this.auto)return;
    const near=Math.abs((px+24)-(this.x+this.w/2))<this.w/2+72&&Math.abs((py+40)-(this.y+this.h/2))<this.h/2+72;
    if(!near)return;
    const sx=this.x+this.w/2-cam.x,sy=this.y-cam.y-26+Math.sin(Date.now()/350)*4;
    const txt='[E] '+this.label;ctx.font='14px "Courier New"';
    const tw=ctx.measureText(txt).width+24;
    ctx.fillStyle='rgba(0,0,0,0.82)';roundRect(sx-tw/2,sy-16,tw,24,4);ctx.fill();
    ctx.strokeStyle='#e0b840';ctx.lineWidth=1.5;roundRect(sx-tw/2,sy-16,tw,24,4);ctx.stroke();
    ctx.fillStyle='#e0b840';ctx.textAlign='center';ctx.fillText(txt,sx,sy);ctx.textAlign='left';
  }
}

// ── Diálogos ─────────────────────────────────────────────────────
function wrapText(text,maxW){
  ctx.font='15px "Courier New"';
  const pars=text.split('\n'),result=[];
  for(const para of pars){
    const words=para.split(' ');let line='';
    for(const w of words){const test=line?line+' '+w:w;if(ctx.measureText(test).width>maxW&&line){result.push(line);line=w;}else line=test;}
    if(line)result.push(line);
  }return result;
}
const BUBBLE={
  active:false,queue:[],cb:null,lines:[],speakerTxt:'CORVAN',speakerColor:'#e0b840',faceFrame:0,
  show(msgs,cb,speaker='CORVAN',color='#e0b840'){this.queue=[...msgs];this.cb=cb;this.active=true;this.speakerTxt=speaker;this.speakerColor=color;G.dialog=true;this._next();},
  _next(){if(!this.queue.length){this.active=false;G.dialog=false;if(this.cb){const f=this.cb;this.cb=null;f();}return;}this.lines=wrapText(this.queue.shift(),480);},
  advance(){if(this.active)this._next();},
  draw(player){
    if(!this.active)return;this.faceFrame+=0.03;
    ctx.font='15px "Courier New"';
    const faceW=60,faceH=76,facePad=12,lineH=24,pad=20,textW=480;
    const bubW=facePad+faceW+facePad+textW+pad;
    const bubH=Math.max(faceH+pad*2,this.lines.length*lineH+70)+pad;
    const pcx=player.x-cam.x+player.w/2,pcy=player.y-cam.y;
    let bx=Math.max(10,Math.min(pcx-bubW/2,W-bubW-10)),by=Math.max(10,pcy-bubH-32);
    ctx.shadowColor='rgba(0,0,0,0.6)';ctx.shadowBlur=14;
    ctx.fillStyle='rgba(8,4,0,0.96)';roundRect(bx,by,bubW,bubH,14);ctx.fill();ctx.shadowBlur=0;
    ctx.strokeStyle=this.speakerColor;ctx.lineWidth=2.5;roundRect(bx,by,bubW,bubH,14);ctx.stroke();
    const tbx=Math.max(bx+30,Math.min(pcx,bx+bubW-30));
    const tty=by+bubH,tipy=Math.min(pcy,tty+38);
    ctx.fillStyle='rgba(8,4,0,0.96)';ctx.beginPath();ctx.moveTo(tbx-14,tty);ctx.lineTo(tbx+14,tty);ctx.lineTo(pcx,tipy);ctx.closePath();ctx.fill();
    ctx.strokeStyle=this.speakerColor;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(tbx-14,tty);ctx.lineTo(pcx,tipy);ctx.lineTo(tbx+14,tty);ctx.stroke();
    const fx=bx+facePad,fy=by+pad;
    ctx.fillStyle='rgba(20,10,2,0.85)';roundRect(fx,fy,faceW,faceH,6);ctx.fill();
    ctx.strokeStyle='rgba(200,160,40,0.45)';ctx.lineWidth=1.5;roundRect(fx,fy,faceW,faceH,6);ctx.stroke();
    const faceScale=faceW/18*0.82,sprX=fx+faceW/2-16*faceScale,sprY=fy+4;
    ctx.save();ctx.beginPath();roundRect(fx+1,fy+1,faceW-2,faceH-2,5);ctx.clip();
    drawCorvan(sprX,sprY,faceScale,false,this.faceFrame*4,null);
    const mouthY=sprY+13*faceScale,mouthX=sprX+12*faceScale,mouthW=8*faceScale;
    const open=Math.abs(Math.sin(this.faceFrame*4))*1.8*faceScale;
    if(open>0.5){ctx.fillStyle='#2a0e06';ctx.fillRect(mouthX,mouthY,mouthW,open);}
    ctx.restore();
    const tx=fx+faceW+facePad;
    ctx.font='bold 12px "Courier New"';ctx.fillStyle=this.speakerColor;ctx.fillText(this.speakerTxt,tx,by+pad+14);
    ctx.fillStyle='rgba(200,160,40,0.35)';ctx.fillRect(tx,by+pad+20,textW,1);
    ctx.font='15px "Courier New"';ctx.fillStyle='#f0e8c0';
    this.lines.forEach((l,i)=>ctx.fillText(l,tx,by+pad+40+i*lineH));
    const pulse=0.5+Math.sin(Date.now()/400)*0.5;
    ctx.fillStyle=`rgba(200,160,40,${pulse})`;ctx.font='12px "Courier New"';
    ctx.textAlign='right';ctx.fillText('[E] Continuar →',bx+bubW-pad,by+bubH-10);ctx.textAlign='left';
  }
};
function showDialog(msgs,cb,speaker='CORVAN',color='#e0b840'){BUBBLE.show(msgs,cb,speaker,color);}
function checkDlg(){if(G.dialog&&!INV.open&&isE())BUBBLE.advance();}

// ── Popup flutuante ──────────────────────────────────────────────
let popup={active:false,timer:0,title:'',lines:[],color:'#f0d060'};
function showPopup(title,lines,color,ms=6500){popup={active:true,timer:ms,title,lines,color};}
function tickPopup(){if(popup.active&&popup.timer>0){popup.timer-=16;if(popup.timer<=0)popup.active=false;}}
function drawPopup(){
  if(!popup.active)return;
  const al=Math.min(1,popup.timer/400);ctx.save();ctx.globalAlpha=al;
  const pw=340,lineH=20,ph=popup.lines.length*lineH+80;
  const px=W-pw-18,py=56;
  ctx.fillStyle='rgba(8,4,0,0.94)';roundRect(px,py,pw,ph,10);ctx.fill();
  ctx.strokeStyle=popup.color;ctx.lineWidth=2;roundRect(px,py,pw,ph,10);ctx.stroke();
  ctx.font='bold 13px "Courier New"';ctx.fillStyle=popup.color;ctx.textAlign='center';ctx.fillText(popup.title,px+pw/2,py+22);
  ctx.fillStyle='rgba(255,255,255,0.12)';ctx.fillRect(px+14,py+30,pw-28,1);
  ctx.font='12px "Courier New"';ctx.fillStyle='#e8e0d0';
  popup.lines.forEach((l,i)=>{ctx.textAlign='left';ctx.fillText('• '+l,px+16,py+48+i*lineH);});
  ctx.textAlign='left';ctx.restore();
}

// ── Notificações ─────────────────────────────────────────────────
let notifText='',notifAlpha=0,notifTimer=0;
function notify(msg,ms=2800){notifText=msg;notifTimer=ms;notifAlpha=1;}
function tickNotif(){if(notifTimer>0){notifTimer-=16;if(notifTimer<=0)notifAlpha=0;else notifAlpha=Math.min(1,notifTimer/300);}}
function drawNotif(){
  if(notifAlpha<=0)return;ctx.save();ctx.globalAlpha=notifAlpha;ctx.font='14px "Courier New"';
  const tw=ctx.measureText(notifText).width+32,nx=(W-tw)/2,ny=46;
  ctx.fillStyle='rgba(8,4,0,0.88)';roundRect(nx,ny,tw,28,6);ctx.fill();
  ctx.strokeStyle='#e0b840';ctx.lineWidth=1.5;roundRect(nx,ny,tw,28,6);ctx.stroke();
  ctx.fillStyle='#e0b840';ctx.textAlign='center';ctx.fillText(notifText,W/2,ny+19);ctx.textAlign='left';
  ctx.restore();
}

// ── Player ───────────────────────────────────────────────────────
class Player{
  constructor(x,y){
    this.x=x;this.y=y;this.w=32;this.h=68;
    this.vx=0;this.vy=0;this.onG=false;this.facing=1;
    this.hp=3;this.maxHp=3;this.inv=0;this.dead=false;
    this.walkT=0;this.state='idle';
    this.coyote=0;this.jbuf=0;this.onMoving=null;
    this.items=[];this.score=0;
    this.activeTools=new Set();
    this.interactAnim=0;
  }
  overlaps(r){return this.x<r.x+r.w&&this.x+this.w>r.x&&this.y<r.y+r.h&&this.y+this.h>r.y;}
  near(r,d=80){return Math.abs(this.x+20-(r.x+r.w/2))<r.w/2+d&&Math.abs(this.y+40-(r.y+r.h/2))<r.h/2+d;}
  update(level){
    if(INV.open){INV.navigate(this);return;}
    if(G.dialog)return;
    if(isL()){this.vx=-PSPD;this.facing=-1;}
    else if(isR()){this.vx=PSPD;this.facing=1;}
    else this.vx*=0.7;
    if(this.onG)this.coyote=8;else if(this.coyote>0)this.coyote--;
    if(isJ())this.jbuf=10;if(this.jbuf>0)this.jbuf--;
    if(this.jbuf>0&&(this.onG||this.coyote>0)){this.vy=JUMPF;this.onG=false;this.coyote=0;this.jbuf=0;sfx('jump');}
    if(this.onMoving){this.x+=this.onMoving.vx||0;this.y+=this.onMoving.vy||0;}
    this.onMoving=null;
    this.vy=Math.min(this.vy+GRAV,MAXFALL);
    this.x+=this.vx;this._colX(level.plats);
    this.onG=false;this.y+=this.vy;this._colY(level.plats);
    this.x=Math.max(0,this.x);

    const TOOL_TYPES=['bateia','picareta','touchstone'];
    for(const c of level.cols){
      if(c.done||TOOL_TYPES.includes(c.type))continue;
      if(!this.overlaps(c))continue;
      c.done=true;
      if(c.type==='ouro'){
        this.score+=20;sfx('ouro');burst(c.x+17,c.y+17,'#ffe060',10,3);
        if(!this.items.includes('ouro_ok')){
          this.items.push('ouro_ok');journalCollect('ouro');
          showPopup('✨ OURO (Au)',['Metal mais maleável que existe','1g = fio de 3km ou folha translúcida','Densidade: 19,3 g/cm³ (7× mais que areia)','Ouro afunda na bateia pelo peso!'],'#f0d060');
        }
        const cnt=level.cols.filter(cc=>cc.done&&cc.type==='ouro').length;
        const tot=level.cols.filter(cc=>cc.type==='ouro').length;
        notify(`✨ Ouro coletado! (${cnt}/${tot})`);
        addToInventory(this,'ouro');
      } else if(c.type==='pirita'){
        // Pirita — exige teste da pedra de toque
        if(this.items.includes('touchstone')){
          sfx('picareta');burst(c.x+17,c.y+17,'#c8a820',8,2);
          journalCollect('pirita');
          if(!this.items.includes('pirita_ok'))this.items.push('pirita_ok');
          showPopup('🟡 PIRITA — "OURO DE TOLO"',['Traço esverdeado na Pedra de Toque','Mais frágil e leve que o ouro real','FeS₂ — Sulfeto de Ferro','Enganou muitos garimpeiros de 1849!'],'#c8a820');
          notify('🪨 Pirita testada — "Ouro de Tolo" confirmado!');
        } else {
          notify('Obtenha a Pedra de Toque antes de testar a pirita!');
          this.x=c.x-this.w;// empurra de volta
        }
      } else if(c.type==='placa'){
        this.score+=50;sfx('unlock');burst(c.x+17,c.y+17,'#d4a060',16,3);
        this.items.push('placa');journalCollect('placa_claim');addToInventory(this,'placa');
        showDialog([
          '"Placa de Reivindicação! Este pequeno pedaço de madeira garantia o direito exclusivo de garimpar este trecho do rio."',
          '"Os garimpeiros de 1849 criaram um sistema legal próprio baseado na posse pelo trabalho — que influenciou toda a legislação de propriedade mineral dos EUA."',
          '"Mas este mesmo sistema expulsou os povos Miwok e Nisenan de suas terras ancestrais. O progresso americano tinha um preço humano e ambiental enorme."'
        ],()=>{notify('✦ Placa de Reivindicação coletada!');});
      }
    }
    if(isE()){
      for(const c of level.cols){
        if(c.done||!TOOL_TYPES.includes(c.type))continue;
        if(!this.near({x:c.x,y:c.y,w:c.w,h:c.h},90))continue;
        c.done=true;
        if(c.type==='bateia'){
          this.items.push('bateia');sfx('item');burst(c.x+17,c.y+17,'#c0a040',12);
          journalCollect('bateia');addToInventory(this,'bateia');
          showPopup('🪣 BATEIA COLETADA',['Separa materiais pela densidade','Gire em círculos na água','Ouro pesado fica no centro','Sedimento leve escoa pela borda'],'#c0a040');
          notify('✦ Bateia coletada!');
        } else if(c.type==='picareta'){
          this.items.push('picareta');sfx('item');burst(c.x+17,c.y+17,'#c0c0d8',12);
          journalCollect('picareta_basica');addToInventory(this,'picareta');
          showPopup('⛏ PICARETA COLETADA',['Extrai veios de quartzo aurífero','Ângulo oblíquo preserva os cristais','Use [E] próximo a um veio brilhante','Equipe-a no Diário [I]'],'#c0c0d8');
          notify('✦ Picareta coletada!');
        } else if(c.type==='touchstone'){
          this.items.push('touchstone');sfx('item');burst(c.x+17,c.y+17,'#a08868',12);
          journalCollect('pedra_toque');addToInventory(this,'touchstone');
          showPopup('🪨 PEDRA DE TOQUE!',['Ensaiadores do século XIX a usavam','Traço dourado = ouro verdadeiro','Traço esverdeado = pirita (FeS₂)','Obtida com o Grizzly da Califórnia'],'#c0a870');
          notify('🪨 Pedra de Toque obtida! Use para testar minerais.');
        }
        break;
      }
      if(level.grizzly&&!level.grizzly.gifted&&this.near({x:level.grizzly.x-50,y:level.grizzly.y-80,w:100,h:80})){
        level.grizzly.gifted=true;sfx('item');
        burst(level.grizzly.x,level.grizzly.y-40,'#a08868',14);
        showDialog([
          '"Um Grizzly da Califórnia! Este urso majestoso foi extinto em 1922, mas ainda habita a bandeira do estado. Está me oferecendo algo..."',
          '"Uma Pedra de Toque! Ensaiadores do século XIX usavam essa pedra negra para testar o ouro: ao riscar o mineral, o traço dourado indica ouro puro — a pirita deixa um traço esverdeado-escuro."',
          '"Com a Pedra de Toque, posso distinguir o ouro verdadeiro do \'Ouro de Tolo\'. Isso vai ser essencial na garimpagem!"'
        ],()=>{
          this.items.push('touchstone');journalCollect('pedra_toque');addToInventory(this,'touchstone');
          notify('🪨 Pedra de Toque obtida do Grizzly!');
        });
      }
      if(level.quartzVein&&!level.quartzVein.done&&this.near({x:level.quartzVein.x-40,y:level.quartzVein.y-40,w:80,h:80})){
        level.quartzVein.done=true;sfx('picareta');burst(level.quartzVein.x,level.quartzVein.y,'#ffe060',14);
        journalCollect('ouro');if(!this.items.includes('ouro_ok'))this.items.push('ouro_ok');
        addToInventory(this,'ouro');this.score+=25;
        showDialog([
          '"Veio de quartzo aurífero! Estas formações brancas brilhantes abrigam o ouro que se infiltrou em fissuras rochosas há 120 milhões de anos."',
          '"O ouro (Au) é o metal mais maleável que existe — 1 grama pode ser esticado em um fio de 3 quilômetros, ou laminado em uma folha tão fina que deixa a luz passar!"',
          '"Densidade 19,3 g/cm³ — quase 7 vezes mais denso que a areia comum (2,7 g/cm³). É exatamente por isso que a bateia funciona: o ouro afunda, a areia flutua para fora."'
        ],()=>{notify('✨ Veio de quartzo examinado! +25 pontos');});
      }
      for(const t of level.triggers){if(!t.done&&this.near(t)){t.fn(this,level);break;}}
    }
    if(this.y>level.H+200){this.hp=0;this.dead=true;this.deathCause='queda';}
    if(!this.onG&&this.vy<0)this.state='jump';
    else if(!this.onG&&this.vy>0)this.state='fall';
    else if(Math.abs(this.vx)>0.5)this.state='run';
    else this.state='idle';
    if(Math.abs(this.vx)>0.5)this.walkT+=0.18;
    if(this.inv>0)this.inv--;if(this.interactAnim>0)this.interactAnim--;
  }
  _colX(plats){
    const STEP=6;
    for(const p of plats){if(p.type==='_dead')continue;
      if(this.overlaps(p)){
        if(this.y+this.h*0.5<=p.y)continue;
        const stepUp=p.y-(this.y+this.h);
        if(this.onG&&stepUp>-STEP&&stepUp<=0){this.y=p.y-this.h;}
        else{if(this.vx>0)this.x=p.x-this.w;else this.x=p.x+p.w;this.vx=0;}
      }
    }
  }
  _colY(plats){for(const p of plats){if(p.type==='_dead')continue;
    if(this.overlaps(p)){
      if(this.vy>=0){this.y=p.y-this.h;this.vy=0;this.onG=true;if(p.moving)this.onMoving=p;}
      else{this.y=p.y+p.h;this.vy=Math.abs(this.vy)*0.2;}}}}
  draw(){
    if(this.dead)return;
    const S=1.5,FOOT_Y=46*S;
    const dx=this.x-cam.x+this.w/2-16*S,dy=this.y-cam.y+this.h-FOOT_Y;
    const flip=this.facing===-1;
    const wf=this.state==='run'?this.walkT:(this.state==='idle'?Date.now()/800:0);
    const _dispTool=this.activeTools.has('placa')?'placa':this.activeTools.has('picareta')?'picareta':this.activeTools.has('bateia')?'bateia':this.activeTools.has('touchstone')?'touchstone':null;
    ctx.save();drawCorvan(dx,dy,S,flip,wf,_dispTool);ctx.restore();
    if(this.inv>0&&Math.floor(this.inv/6)%2===0){ctx.fillStyle='rgba(255,60,60,0.35)';ctx.fillRect(this.x-cam.x,this.y-cam.y,this.w,this.h);}
  }
}

// Util
function addToInventory(player,key){if(!player.items.includes(key))player.items.push(key);}

// ── Backgrounds ──────────────────────────────────────────────────
function drawBg(bgKey){
  const img=IMG[bgKey];
  if(img&&img.complete&&img.naturalWidth>0){
    const sc=Math.max(W/img.naturalWidth,H/img.naturalHeight);
    const iw=img.naturalWidth*sc,ih=img.naturalHeight*sc;
    ctx.drawImage(img,(W-iw)/2,(H-ih)/2,iw,ih);
  } else {
    const fb={bg01:'#0a1a08',bg02:'#0a0e18',bg03:'#071520',bg04:'#0a1a08'};
    const grd=ctx.createLinearGradient(0,0,0,H);
    grd.addColorStop(0,fb[bgKey]||'#111');grd.addColorStop(1,'#050308');
    ctx.fillStyle=grd;ctx.fillRect(0,0,W,H);
  }
  ctx.fillStyle='rgba(0,0,0,0.22)';ctx.fillRect(0,0,W,H);
}

// ── Estrelas & Ambiente ──────────────────────────────────────────
let stars=Array.from({length:60},()=>({x:Math.random()*W,y:Math.random()*160,sz:Math.random()<0.2?2:1,br:Math.random()>0.7}));
function drawStars(){
  for(const s of stars){
    const a=0.5+Math.sin(Date.now()/1100+s.x*0.01)*0.5;
    ctx.fillStyle=s.br?`rgba(255,255,255,${a})`:'rgba(200,220,255,0.6)';ctx.fillRect(s.x,s.y,s.sz,s.sz);
  }
}
let windP=[];function initWind(){windP=[];for(let i=0;i<20;i++)windP.push({x:Math.random()*W,y:60+Math.random()*200,spd:0.8+Math.random()*1.5});}
initWind();
function drawWind(){
  ctx.strokeStyle='rgba(200,220,180,0.14)';ctx.lineWidth=1;
  for(const w of windP){w.x+=w.spd;if(w.x>W)w.x=-60;ctx.beginPath();ctx.moveTo(w.x,w.y);ctx.lineTo(w.x+35,w.y+1);ctx.stroke();}
}
let riverAnim=0;
function drawRiverBg(y,w,frame){
  // Faixa de rio decorativa no background da cena
  const rg=ctx.createLinearGradient(0,y,0,y+50);
  rg.addColorStop(0,'rgba(40,100,200,0.55)');rg.addColorStop(1,'rgba(20,70,160,0.35)');
  ctx.fillStyle=rg;ctx.fillRect(0,y,w,50);
  ctx.strokeStyle='rgba(180,220,255,0.25)';ctx.lineWidth=1.5;
  for(let i=0;i<5;i++){
    const off=((frame+i*80)%(W+100));
    ctx.beginPath();ctx.moveTo(off-100,y+8+i*8);ctx.lineTo(off+30,y+8+i*8);ctx.stroke();
  }
}

// ── HUD ─────────────────────────────────────────────────────────
function drawHUD(player,level){
  ctx.fillStyle='rgba(8,4,0,0.82)';ctx.fillRect(0,0,W,38);
  ctx.fillStyle='rgba(200,160,40,0.18)';ctx.fillRect(0,36,W,2);
  for(let i=0;i<player.maxHp;i++){
    ctx.fillStyle=i<player.hp?'#f0d060':'#334';
    ctx.beginPath();const hx=16+i*28,hy=10;
    ctx.arc(hx+5,hy+5,5,Math.PI,0);ctx.arc(hx+15,hy+5,5,Math.PI,0);
    ctx.lineTo(hx+20,hy+5);ctx.bezierCurveTo(hx+20,hy+14,hx+10,hy+18,hx+10,hy+18);
    ctx.bezierCurveTo(hx+10,hy+18,hx,hy+14,hx,hy+5);ctx.closePath();ctx.fill();
  }
  ctx.fillStyle='#f0d060';ctx.font='20px "Courier New"';ctx.textAlign='center';ctx.fillText(level.title,W/2,24);ctx.textAlign='left';
  ctx.fillStyle='#f0d060';ctx.font='bold 20px "Courier New"';ctx.textAlign='right';ctx.fillText('✨ '+player.score,W-14,26);ctx.textAlign='left';
  const PX=12,PY=46,PW=178;
  const TOOL_DEFS=[{id:'bateia',icon:'🪣',nome:'Bateia'},{id:'picareta',icon:'⛏',nome:'Picareta'},{id:'touchstone',icon:'🪨',nome:'Pedra de Toque'}];
  const tools=TOOL_DEFS.filter(t=>player.items.includes(t.id));
  const PH=52+(tools.length>0?6+tools.length*22:0);
  ctx.save();ctx.shadowColor='rgba(0,0,0,0.6)';ctx.shadowBlur=8;
  ctx.fillStyle='rgba(8,4,0,0.88)';roundRect(PX,PY,PW,PH,6);ctx.fill();ctx.shadowBlur=0;
  ctx.strokeStyle='#8a6820';ctx.lineWidth=1.5;roundRect(PX,PY,PW,PH,6);ctx.stroke();
  ctx.restore();
  const midX=PX+PW/2;
  ctx.font='11px serif';ctx.fillStyle='#c0a030';ctx.textAlign='left';ctx.fillText('📔',PX+8,PY+20);
  ctx.font='bold 10px "Courier New"';ctx.fillStyle='#c0a030';ctx.fillText('DIÁRIO DE BORDO',PX+24,PY+20);
  const kw=26,kx=PX+PW-kw-6,ky=PY+5;
  ctx.fillStyle='rgba(200,160,40,0.2)';roundRect(kx,ky,kw,18,3);ctx.fill();
  ctx.strokeStyle='#c0a030';ctx.lineWidth=1;roundRect(kx,ky,kw,18,3);ctx.stroke();
  ctx.font='bold 10px "Courier New"';ctx.fillStyle='#e0b840';ctx.textAlign='center';ctx.fillText('[I]',kx+kw/2,ky+13);ctx.textAlign='left';
  ctx.fillStyle='rgba(200,160,40,0.3)';ctx.fillRect(PX+6,PY+26,PW-12,1);
  if(tools.length>0){
    ctx.fillStyle='rgba(200,160,40,0.3)';ctx.fillRect(PX+6,PY+52,PW-12,1);
    tools.forEach((t,i)=>{
      const ty=PY+52+8+i*22;ctx.textAlign='center';
      ctx.font='11px serif';ctx.fillStyle='#f0d060';ctx.fillText(t.icon+' '+t.nome,midX,ty+10);ctx.textAlign='left';
    });
  }
  const hintText=typeof level.hint==='function'?level.hint(player):level.hint;
  ctx.fillStyle='#b0d080';ctx.font='18px "Courier New"';ctx.textAlign='center';ctx.fillText(hintText,W/2,H-10);ctx.textAlign='left';
}

// ── Tela Título ──────────────────────────────────────────────────
function drawTitle(){
  const bgCapa=IMG['card21'];
  const grd=ctx.createLinearGradient(0,0,0,H);
  grd.addColorStop(0,'#0a1a06');grd.addColorStop(0.5,'#061220');grd.addColorStop(1,'#050308');
  ctx.fillStyle=grd;ctx.fillRect(0,0,W,H);
  drawStars();drawWind();
  if(bgCapa){
    const cardS=200,cardX=W/2-100,cardY=230;
    const glow=ctx.createRadialGradient(W/2,cardY+100,0,W/2,cardY+100,160);
    glow.addColorStop(0,'rgba(220,185,40,0.22)');glow.addColorStop(1,'rgba(220,185,40,0)');
    ctx.fillStyle=glow;ctx.beginPath();ctx.arc(W/2,cardY+100,160,0,Math.PI*2);ctx.fill();
    ctx.drawImage(bgCapa,cardX,cardY,cardS,cardS);
  }
  ctx.textAlign='center';
  ctx.shadowColor='#e0b840';ctx.shadowBlur=40;
  ctx.fillStyle='#e0b840';ctx.font='bold 20px "Courier New"';ctx.fillText('FASE 2.1',W/2,110);
  ctx.shadowColor='#ffe060';ctx.shadowBlur=50;
  ctx.fillStyle='#ffe060';ctx.font='bold 44px "Courier New"';ctx.fillText('O Brilho do American River',W/2,160);
  ctx.shadowBlur=0;
  ctx.fillStyle='#c8a060';ctx.font='19px "Courier New"';ctx.fillText('Sierra Nevada, Califórnia — Janeiro de 1848',W/2,200);
  ctx.fillStyle=`rgba(220,185,80,${.55+Math.sin(Date.now()/550)*.4})`;ctx.font='19px "Courier New"';
  ctx.fillText('▶  Pressione ENTER para iniciar  ◀',W/2,460);
  ctx.fillStyle='#c0d0a0';ctx.font='17px "Courier New"';
  ctx.fillText('← → Mover   ↑ / Espaço Pular   E Interagir   I Diário',W/2,500);
  ctx.fillText('[M] Menu Principal',W/2,530);
  ctx.textAlign='left';
}

// ── Tela Morte ───────────────────────────────────────────────────
function drawDeath(){
  ctx.fillStyle='rgba(0,0,0,0.72)';ctx.fillRect(0,0,W,H);
  ctx.textAlign='center';ctx.shadowColor='#ff4040';ctx.shadowBlur=30;
  ctx.fillStyle='#ff6060';ctx.font='bold 54px "Courier New"';ctx.fillText('VOCÊ CAIU!',W/2,H/2-50);ctx.shadowBlur=0;
  ctx.fillStyle='#cc8888';ctx.font='16px "Courier New"';ctx.fillText('O rio te levou. Tente novamente!',W/2,H/2-10);
  drawCorvan(W/2-24,H/2+10,3,false,Date.now()/200);
  ctx.fillStyle='#e0b840';ctx.font='20px "Courier New"';ctx.fillText('Pressione R para recomeçar',W/2,H/2+140);
  ctx.fillStyle='#888';ctx.font='15px "Courier New"';ctx.fillText('[M] Menu Principal',W/2,H/2+180);
  ctx.textAlign='left';
}

// ── Tela Conclusão ───────────────────────────────────────────────
function drawComplete(){
  const gr=ctx.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#080a04');gr.addColorStop(1,'#100c04');ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
  drawStars();
  const rg=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,500);rg.addColorStop(0,'rgba(220,185,40,.14)');rg.addColorStop(1,'rgba(220,185,40,0)');ctx.fillStyle=rg;ctx.fillRect(0,0,W,H);
  ctx.textAlign='center';ctx.shadowColor='#e0b840';ctx.shadowBlur=40;
  ctx.fillStyle='#e0b840';ctx.font='bold 42px "Courier New"';ctx.fillText('✦  FASE 2.1 CONCLUÍDA  ✦',W/2,110);ctx.shadowBlur=0;
  drawCorvan(W/2-160,200,4,false,Date.now()/300,'placa');
  // Placa animada
  ctx.save();ctx.translate(W/2+80,270);ctx.scale(2.5,2.5);drawPlaca(0,0,Date.now()/600);ctx.restore();
  ctx.fillStyle='#e8d8a0';ctx.font='17px "Courier New"';ctx.fillText('O Brilho do American River foi revelado!',W/2,188);
  const lines=[
    '✨  Ouro (Au) — metal mais maleável da natureza',
    '🪣  Bateia — separa ouro de sedimento pela densidade',
    '⛏  Picareta — extrai veios de quartzo aurífero',
    '🪨  Pedra de Toque — distingue ouro de pirita',
    '📋  Placa de Reivindicação — base do direito mineral EUA',
  ];
  ctx.fillStyle='#c8b880';ctx.font='14px "Courier New"';lines.forEach((l,i)=>ctx.fillText(l,W/2,240+i*28));
  ctx.fillStyle='#c0d090';ctx.font='16px "Courier New"';ctx.fillText(`Pontuação: ✨ ${G.player?.score||0}`,W/2,412);
  ctx.fillStyle=`rgba(220,185,80,${.6+Math.sin(Date.now()/600)*.4})`;ctx.font='15px "Courier New"';
  ctx.fillText('✦ Fase 2.2 desbloqueada!   [M] Menu Principal',W/2,450);
  ctx.textAlign='left';
}

// ═══════════════════════════════════════════════════════════════
// NÍVEL 1 — Margem do American River (Início)
// ═══════════════════════════════════════════════════════════════
function buildL1(){
  const FL=600,WW=3200,WH=900;
  const plats=[
    solid(0,FL,420,WH-FL),solid(500,FL,200,WH-FL),solid(780,FL,200,WH-FL),
    solid(1060,FL,220,WH-FL),solid(1360,FL,200,WH-FL),solid(1640,FL,220,WH-FL),
    solid(1920,FL,240,WH-FL),solid(2220,FL,200,WH-FL),solid(2500,FL,220,WH-FL),
    solid(2780,FL,560,WH-FL),
    solid(240,FL-180,130,18),solid(540,FL-240,110,18),solid(780,FL-180,130,18),
    solid(1040,FL-230,120,18),solid(1280,FL-180,130,18),solid(1560,FL-250,110,18),
    solid(1760,FL-180,130,18),solid(2060,FL-240,120,18),solid(2320,FL-180,110,18),
    solid(2560,FL-240,120,18),
  ];
  const grizzly={x:2900,y:FL-60,gifted:false};
  const cols=[
    // bateias e picaretas já vieram da fase 1, mas colocamos 1 de cada para a fase nova
    new Col(200,FL-50,'bateia'),
    ...[400,640,900,1180,1440,1720,2000,2280,2540].map(x=>new Col(x,FL-50,'ouro')),
    new Col(1600,FL-50,'pirita'),
    new Col(2100,FL-50,'pirita'),
  ];
  const triggers=[
    new Trigger(3050,FL-200,100,200,'Ir para as Rochas',(player,level)=>{
      if(!player.items.includes('bateia')){notify('Colete a Bateia primeiro!');return;}
      if(!player.items.includes('touchstone')){notify('Interaja com o Grizzly para obter a Pedra de Toque!');return;}
      if(level._enterFired)return;level._enterFired=true;
      player.interactAnim=40;sfx('unlock');
      showDialog([
        '"Sierra Nevada, Califórnia — 24 de janeiro de 1848. James Marshall encontrou pepitas brilhando no canal do moinho de John Sutter neste mesmo rio."',
        '"Em menos de um ano, mais de 300.000 pessoas vieram de todo o mundo. Esta foi a maior migração voluntária da história americana — a Corrida do Ouro de 1849."',
        '"Com a Bateia e a Pedra de Toque, estou pronto para examinar os veios de quartzo nas paredes rochosas. O ouro se forma onde o magma encontra a rocha!"',
      ],()=>{notify('✦ Vamos examinar os veios de quartzo!');level.triggers[0].done=true;setTimeout(()=>G.nextLevel(),2000);});
    },true),
  ];
  return{id:1,bg:'bg01',W:WW,H:WH,startX:60,startY:FL-90,
    title:'American River — Início',
    hint(player){
      if(!player.items.includes('bateia'))return '🪣 Colete a Bateia →';
      if(!player.items.includes('touchstone'))return '🐻 Interaja com o Urso Grizzly →';
      return '→ Avance para os veios de quartzo!';
    },
    plats,cols,triggers,grizzly,quartzVein:null,
    intro:[
      '"Estamos em janeiro de 1848, na Califórnia. Um carpinteiro chamado James Marshall encontrou algo brilhando no canal de um moinho à beira deste rio."',
      '"Em menos de um ano, mais de 300.000 pessoas vieram de todo o mundo para cá. Esta foi a maior migração voluntária da história americana."',
      'Colete a 🪣 Bateia e encontre o 🐻 Urso Grizzly da Califórnia para obter a Pedra de Toque!'
    ],
    update(player){tickMoving(this.plats);for(const c of this.cols)c.tick();
      const ent=this.triggers[0];
      if(!ent.done&&!G.dialog&&player.items.includes('bateia')&&player.items.includes('touchstone')){
        if(player.x+player.w>=ent.x&&player.x<=ent.x+ent.w+80)ent.fn(player,this);
      }
    },
    draw(player){
      drawStars();drawWind();
      riverAnim++;
      // Rio decorativo no meio do cenário
      drawRiverBg(FL-20,WW,riverAnim);
      // Grizzly
      if(this.grizzly){
        const gx=this.grizzly.x-cam.x,gy=this.grizzly.y-cam.y;
        if(gx>-120&&gx<W+120){
          drawGrizzly(gx,gy,Date.now()/400);
          if(!this.grizzly.gifted&&Math.abs(player.x-this.grizzly.x)<160){
            ctx.fillStyle='rgba(0,0,0,0.82)';ctx.font='14px "Courier New"';
            const t2='[E] Interagir com o Grizzly 🐻';const tw=ctx.measureText(t2).width+24;
            roundRect(gx-tw/2,gy-110,tw,24,4);ctx.fill();
            ctx.strokeStyle='#c0a870';ctx.lineWidth=1.5;roundRect(gx-tw/2,gy-110,tw,24,4);ctx.stroke();
            ctx.fillStyle='#c0a870';ctx.textAlign='center';ctx.fillText(t2,gx,gy-93);ctx.textAlign='left';
          }
          if(this.grizzly.gifted){
            const ha=Math.abs(Math.sin(Date.now()/1000))*0.7;
            ctx.fillStyle=`rgba(180,220,100,${ha})`;ctx.font='15px serif';ctx.textAlign='center';
            ctx.fillText('🐻',gx,gy-100+Math.sin(Date.now()/600)*6);ctx.textAlign='left';
          }
        }
      }
      for(const c of this.cols)c.draw(player.x,player.y);
      for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

// ═══════════════════════════════════════════════════════════════
// NÍVEL 2 — Geologia: Veios de Quartzo na Rocha
// ═══════════════════════════════════════════════════════════════
function buildL2(){
  const FL=600,WW=3200,WH=900;
  const plats=[
    solid(0,FL,320,WH-FL),solid(400,FL,200,WH-FL),solid(680,FL,200,WH-FL),
    solid(960,FL,220,WH-FL),solid(1260,FL,200,WH-FL),solid(1540,FL,220,WH-FL),
    solid(1840,FL,200,WH-FL),solid(2120,FL,240,WH-FL),solid(2440,FL,200,WH-FL),
    solid(2720,FL,200,WH-FL),solid(3000,FL,300,WH-FL),
    solid(180,FL-200,130,18),solid(440,FL-250,120,18),solid(700,FL-200,120,18),
    solid(1000,FL-240,120,18),solid(1300,FL-200,130,18),solid(1580,FL-250,110,18),
    solid(1880,FL-200,120,18),solid(2180,FL-250,120,18),solid(2480,FL-200,110,18),
    solid(2760,FL-240,120,18),
    movH(1500,FL-100,90,1500,1660,1.8),
  ];
  const quartzVein={x:1600,y:FL-280,done:false,glowT:0};
  const cols=[
    new Col(200,FL-50,'picareta'),
    ...[60,380,660,940,1220,1500,1800,2100,2400,2700,2980].map(x=>new Col(x,FL-50,'ouro')),
    new Col(1200,FL-50,'pirita'),new Col(2200,FL-50,'pirita'),
  ];
  const triggers=[
    new Trigger(3080,FL-200,120,200,'Ir para a Garimpagem',(player,level)=>{
      if(!player.items.includes('picareta')){notify('Colete a Picareta primeiro!');return;}
      if(!level.quartzVein.done){notify('Examine o veio de quartzo nas paredes! [E]');return;}
      if(level._advFired)return;level._advFired=true;
      sfx('unlock');
      showDialog([
        '"As paredes rochosas desta região revelam o cinturão de quartzo aurífero — a \'Mother Lode\' — que percorre 200 km sob as encostas da Sierra Nevada."',
        '"O ouro (Au) não surge solto. Ele se formou há 120 milhões de anos quando fluidos hidrotermais empurrados por atividade magmática se infiltraram nestas fissuras de quartzo."',
        '"Com a erosão dos rios ao longo de milênios, esses veios foram expostos e os fragmentos de ouro carregados morro abaixo. É por isso que encontramos pepitas no leito do rio!"',
        '"Agora que entendo a geologia, vamos à garimpagem prática. Com a bateia e a pedra de toque, posso separar o ouro verdadeiro do \'Ouro de Tolo\'!"'
      ],()=>{notify('✦ Vamos garimpar!');level.triggers[0].done=true;setTimeout(()=>G.nextLevel(),2000);});
    },true),
  ];
  return{id:2,bg:'bg02',W:WW,H:WH,startX:60,startY:FL-90,
    title:'Geologia — Veios de Quartzo',
    hint(player){
      if(!player.items.includes('picareta'))return '⛏ Colete a Picareta →';
      if(!player.quartzVeinDone)return '⛏ Examine o veio de quartzo brilhante [E]';
      return '→ Avance para a garimpagem!';
    },
    plats,cols,triggers,quartzVein,grizzly:null,
    intro:[
      '"Entramos nas margens rochosas do American River. Aqui estão os veios de quartzo aurífero — a fonte primária do ouro que desceu para o leito do rio."',
      '"O ouro é o metal mais maleável que existe: 1g pode ser esticado em 3km de fio ou laminado em folha translúcida! Sua densidade de 19,3 g/cm³ é 7× maior que a areia."',
      'Pegue a ⛏ Picareta e examine o veio de quartzo brilhante!'
    ],
    update(player){tickMoving(this.plats);for(const c of this.cols)c.tick();
      this.quartzVein.glowT+=0.04;
      player.quartzVeinDone=this.quartzVein.done;
      const adv=this.triggers[0];
      if(!adv.done&&!G.dialog&&player.items.includes('picareta')&&this.quartzVein.done){
        if(player.x+player.w>=adv.x&&player.x<=adv.x+adv.w+80)adv.fn(player,this);
      }
    },
    draw(player){
      riverAnim++;drawRiverBg(FL-15,WW,riverAnim);
      // Veio de quartzo
      if(!this.quartzVein.done){
        const qx=this.quartzVein.x-cam.x,qy=this.quartzVein.y-cam.y;
        if(qx>-100&&qx<W+100){
          drawQuartzVein(this.quartzVein.x,this.quartzVein.y,this.quartzVein.glowT);
          if(Math.abs(player.x-this.quartzVein.x)<120){
            ctx.fillStyle='rgba(0,0,0,0.82)';ctx.font='14px "Courier New"';
            const lt='[E] Examinar Veio de Quartzo';const ltw=ctx.measureText(lt).width+24;
            roundRect(qx-ltw/2,qy-60,ltw,24,4);ctx.fill();
            ctx.strokeStyle='#f0e060';ctx.lineWidth=1.5;roundRect(qx-ltw/2,qy-60,ltw,24,4);ctx.stroke();
            ctx.fillStyle='#f0e060';ctx.textAlign='center';ctx.fillText(lt,qx,qy-43);ctx.textAlign='left';
          }
        }
      }
      for(const c of this.cols)c.draw(player.x,player.y);
      for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

// ═══════════════════════════════════════════════════════════════
// NÍVEL 3 — Coleta: Garimpagem no Rio (Mini-jogo no mundo)
// ═══════════════════════════════════════════════════════════════
function buildL3(){
  const FL=600,WW=3400,WH=900;
  const plats=[
    solid(0,FL,320,WH-FL),solid(420,FL,220,WH-FL),solid(700,FL,220,WH-FL),
    solid(980,FL,220,WH-FL),solid(1260,FL,220,WH-FL),solid(1540,FL,220,WH-FL),
    solid(1820,FL,220,WH-FL),solid(2100,FL,220,WH-FL),solid(2380,FL,220,WH-FL),
    solid(2660,FL,220,WH-FL),solid(2940,FL,220,WH-FL),solid(3200,FL,600,WH-FL),
    solid(200,FL-200,140,18),solid(480,FL-240,130,18),solid(760,FL-200,130,18),
    solid(1040,FL-240,130,18),solid(1320,FL-200,140,18),solid(1600,FL-240,130,18),
    solid(1880,FL-200,130,18),solid(2160,FL-240,130,18),solid(2440,FL-200,130,18),
    solid(2720,FL-240,130,18),solid(3000,FL-200,140,18),
    solid(320,FL-36,100,14),solid(600,FL-36,100,14),solid(880,FL-36,100,14),
    solid(1160,FL-36,100,14),solid(1440,FL-36,100,14),solid(1720,FL-36,100,14),
    solid(2000,FL-36,100,14),solid(2280,FL-36,100,14),solid(2560,FL-36,100,14),
    solid(2840,FL-36,100,14),
    movH(1400,FL-110,100,1400,1560,1.2),
  ];
  const placaObj={x:3260,y:FL-80,done:false};
  const cols=[
    ...[60,220,440,700,960,1220,1480,1740,2000,2260,2520,2780,3020].map(x=>new Col(x,FL-50,'ouro')),
    new Col(600,FL-90,'pirita'),new Col(1400,FL-90,'pirita'),new Col(2200,FL-90,'pirita'),
  ];
  const triggers=[
    new Trigger(3260,FL-200,160,200,'Concluir Coleta',(player,level)=>{
      if(!level.placaObj.done){notify('Encontre a Placa de Reivindicação mais à frente!');return;}
      const goldCount=player.items.filter(i=>i==='ouro_ok'||i==='ouro').length;
      if(goldCount<1&&player.score<60){notify('Colete mais ouro no caminho!');return;}
      if(level._finFired)return;level._finFired=true;
      player.activeTools.clear();player.activeTools.add('placa');
      sfx('unlock');player.interactAnim=60;
      for(let i=0;i<18;i++)burst(player.x+20,player.y,'#f0d040',2,5+Math.random()*3);
      setTimeout(()=>{
        showDialog([
          '"Consegui! Esta Placa de Reivindicação pertenceu a um dos 300.000 garimpeiros que transformaram a Califórnia para sempre."',
          '"O sistema de \'claims\' que emergia aqui — registrar em cartório o direito sobre um trecho de terra — influenciou toda a legislação de propriedade mineral dos Estados Unidos."',
          '"Mas nem tudo era glória: os povos Miwok e Nisenan, que viviam aqui há milênios, foram expulsos. E a mineração hidráulica destruiu ecossistemas inteiros com toneladas de sedimento."',
          '"O ouro que brilha nessa bateia carrega também essa sombra histórica. Vamos registrar nossas descobertas!"'
        ],()=>{
          unlockPhase('2.2');
          try{sessionStorage.setItem('mineralis_session','1');}catch(e){}
          level.triggers[0].done=true;setTimeout(()=>G.nextLevel(),2000);
        });
      },1200);
    },true),
  ];
  return{id:3,bg:'bg03',W:WW,H:WH,startX:60,startY:FL-90,
    title:'Garimpagem — Coleta no Rio',
    hint(player){
      if(!player.quartzVeinDone&&!player.items.includes('placa'))return '⛏ [E] nos veios brilhantes • 🪨 Pedra de Toque nos minerais suspeitos';
      return '→ Chegue à Placa de Reivindicação ao fundo!';
    },
    plats,cols,triggers,placaObj,grizzly:null,quartzVein:null,
    intro:[
      '"Agora que entendo a geologia, é hora da garimpagem prática! O ouro que vejo no leito do rio veio dos veios de quartzo que examino."',
      '"Atenção: nem tudo que brilha é ouro! A pirita — o \'Ouro de Tolo\' — tem aparência similar mas é frágil e deixa traço esverdeado na Pedra de Toque."',
      'Use a 🪨 Pedra de Toque (pickup) para testar minerais suspeitos. Encontre a 📋 Placa de Reivindicação!'
    ],
    update(player){tickMoving(this.plats);for(const c of this.cols)c.tick();
      player.quartzVeinDone=true;
      // Auto-coleta da placa quando jogador chega perto
      if(!this.placaObj.done&&!G.dialog&&Math.abs(player.x-this.placaObj.x)<140){
        this.placaObj.done=true;
        player.items.push('placa');addToInventory(player,'placa');
        journalCollect('placa_claim');sfx('unlock');player.score+=50;
        burst(this.placaObj.x,this.placaObj.y,'#d4a060',18,4);
        showDialog([
          '"Placa de Reivindicação! Este pedaço de madeira registrava o direito exclusivo de um garimpeiro sobre este trecho do rio."',
          '"Os miners de 1849 criaram um sistema legal que influenciou toda a legislação de propriedade dos EUA — mas também expulsou os povos nativos de suas terras ancestrais."',
        ],null);
      }
      const fin=this.triggers[0];
      if(!fin.done&&!G.dialog&&this.placaObj.done){
        if(player.x+player.w>=fin.x&&player.x<=fin.x+fin.w+80)fin.fn(player,this);
      }
    },
    draw(player){
      riverAnim++;drawRiverBg(FL-20,WW,riverAnim);
      // Placa de Reivindicação
      if(!this.placaObj.done){
        const px2=this.placaObj.x-cam.x,py2=this.placaObj.y-cam.y;
        if(px2>-100&&px2<W+100){
          ctx.fillStyle='#6a4020';ctx.fillRect(px2-30,py2,60,30);
          ctx.fillStyle='#8a6040';ctx.fillRect(px2-30,py2,60,5);
          ctx.save();ctx.translate(px2,py2-10);ctx.scale(2,2);drawPlaca(0,0,Date.now()/600);ctx.restore();
          ctx.fillStyle='rgba(0,0,0,0.82)';ctx.font='14px "Courier New"';
          const lt='📋 Placa de Reivindicação';const ltw=ctx.measureText(lt).width+24;
          roundRect(px2-ltw/2,py2-70,ltw,24,4);ctx.fill();
          ctx.strokeStyle='#d4a060';ctx.lineWidth=1.5;roundRect(px2-ltw/2,py2-70,ltw,24,4);ctx.stroke();
          ctx.fillStyle='#d4a060';ctx.textAlign='center';ctx.fillText(lt,px2,py2-53);ctx.textAlign='left';
        }
      }
      for(const c of this.cols)c.draw(player.x,player.y);
      for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

// ═══════════════════════════════════════════════════════════════
// NÍVEL 4 — Conclusão e Impacto
// ═══════════════════════════════════════════════════════════════
function buildL4(){
  const FL=600,WW=1600,WH=900;
  const plats=[solid(0,FL,1600,WH-FL),solid(300,FL-220,160,18),solid(800,FL-180,140,18),solid(1200,FL-240,140,18)];
  const cols=[...[180,380,580,780,980,1180].map(x=>new Col(x,FL-50,'ouro'))];
  const celebState={active:false,t:0};
  const triggers=[
    new Trigger(1380,FL-200,160,200,'Concluir Fase 2.1',(player,level)=>{
      if(level._finFired)return;level._finFired=true;
      level.triggers[0].done=true;
      player.activeTools.clear();player.activeTools.add('placa');
      celebState.active=true;celebState.t=0;sfx('unlock');
      for(let i=0;i<20;i++)burst(player.x+20,player.y,'#f0d040',2,5+Math.random()*3);
      player.interactAnim=60;
      setTimeout(()=>{
        showDialog([
          '"Consegui! Esta placa pertenceu a um dos 300.000 garimpeiros que transformaram a Califórnia para sempre. Mas o ouro brilha com uma sombra."',
          '"A pressa pelo ouro teve um custo humano imenso: os povos Miwok e Nisenan, que viviam aqui há milênios, foram expulsos de suas terras ancestrais."',
          '"E a mineração hidráulica — que os garimpeiros desenvolveram após esgotar os depósitos superficiais — despejou toneladas de sedimento nos rios, destruindo ecossistemas inteiros."',
          '"A Califórnia se tornou estado em 1850. O ouro que brilhava nessa bateia financiou essa transformação — e carrega também essa sombra histórica."',
        ],()=>{
          unlockPhase('2.2');BUBBLE.active=false;G.dialog=false;
          try{sessionStorage.setItem('mineralis_session','1');}catch(e){}
          G.state='complete';
        });
      },1200);
    },true),
  ];
  return{id:4,bg:'bg04',W:WW,H:WH,startX:60,startY:FL-90,
    title:'A Sombra do Ouro — Conclusão',
    hint(player){return '→ Chegue ao marco final para concluir!';},
    plats,cols,triggers,grizzly:null,quartzVein:null,celebState,
    intro:[
      '"Corvan emerge do rio com a Placa de Reivindicação. O entardecer da Sierra Nevada pinta o céu de dourado — a ironia não passa desapercebida."',
      '"Chegue ao marco final para registrar todas as descobertas e refletir sobre o legado da Corrida do Ouro!"',
    ],
    update(player){for(const c of this.cols)c.tick();if(this.celebState.active)this.celebState.t+=0.06;
      const fim=this.triggers[0];
      if(!fim.done&&!G.dialog){if(player.x+player.w>=fim.x&&player.x<=fim.x+fim.w+60)fim.fn(player,this);}
    },
    draw(player){
      drawStars();drawWind();riverAnim++;
      drawRiverBg(FL-15,WW,riverAnim);
      // Marco final
      const fx=1380-cam.x,fy=FL-cam.y;
      ctx.fillStyle='#7a5020';ctx.fillRect(fx,fy-160,5,160);
      const flagWave=Math.sin(Date.now()/300)*4;
      ctx.fillStyle='#d4a020';ctx.beginPath();
      ctx.moveTo(fx+5,fy-158);ctx.lineTo(fx+55,fy-145+flagWave);ctx.lineTo(fx+5,fy-128);ctx.closePath();ctx.fill();
      ctx.strokeStyle='#f0c040';ctx.lineWidth=1.5;ctx.beginPath();
      ctx.moveTo(fx+5,fy-158);ctx.lineTo(fx+55,fy-145+flagWave);ctx.lineTo(fx+5,fy-128);ctx.stroke();
      ctx.save();ctx.translate(fx+28,fy-143+flagWave*0.5);ctx.rotate(flagWave*0.01);
      ctx.font='bold 10px "Courier New"';ctx.fillStyle='#3a1808';ctx.textAlign='center';ctx.fillText('FIM',0,4);ctx.textAlign='left';ctx.restore();

      // Placa celebração
      if(player.items.includes('placa')){
        const now=Date.now()/1000;
        const px2=player.x-cam.x+20,py2=player.y-cam.y;
        if(this.celebState.active){
          const t=this.celebState.t;
          ctx.save();ctx.translate(px2,py2-70+Math.sin(t*2)*10);ctx.rotate(Math.sin(t*1.5)*0.3);ctx.scale(2.5,2.5);drawPlaca(0,0,t);ctx.restore();
          for(let i=0;i<8;i++){const a=t*0.9+i*(Math.PI*2/8);const sr=40+Math.sin(t*2+i)*8;const sx2=px2+Math.cos(a)*sr,sy2=py2-70+Math.sin(a)*sr;const sa=0.5+Math.abs(Math.sin(t*2.5+i))*0.5;ctx.fillStyle=`rgba(200,160,40,${sa})`;ctx.font='13px serif';ctx.textAlign='center';ctx.fillText('✦',sx2,sy2);ctx.textAlign='left';}
        } else {
          const bob=Math.sin(now*2)*5;ctx.save();ctx.translate(px2,py2-52+bob);ctx.rotate(Math.sin(now*1.2)*0.12);ctx.scale(1.5,1.5);drawPlaca(0,0,now);ctx.restore();
        }
      }
      for(const c of this.cols)c.draw(player.x,player.y);
      for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

// ═══════════════════════════════════════════════════════════════
// GAME ENGINE
// ═══════════════════════════════════════════════════════════════
const LEVELS=[buildL1,buildL2,buildL3,buildL4];
const G={
  state:'title',lvIdx:0,level:null,player:null,
  dialog:false,deaths:0,timeOnLevel:0,_storedItems:[],_storedScore:0,
  load(idx){
    this.lvIdx=idx;particles=[];
    tileTheme=TILE_THEMES[idx+1]||TILE_THEMES[1];
    this.level=LEVELS[idx]();cam.x=0;cam.y=0;
    this.player=new Player(this.level.startX,this.level.startY);
    if(idx>0){this.player.items=[...this._storedItems];this.player.score=this._storedScore;}
    // Ferramentas iniciais da Fase 2.1 (vêm da fase 1)
    if(!this.player.items.includes('bateia')){}
    this.dialog=false;this.state='playing';this.timeOnLevel=0;
    BUBBLE.active=false;popup.active=false;
    for(const k in jp)delete jp[k];
    setTimeout(()=>{if(this.state==='playing')showDialog(this.level.intro,null);},1200);
  },
  nextLevel(){this._storedItems=[...this.player.items];this._storedScore=this.player.score;
    if(this.lvIdx+1<LEVELS.length)this.load(this.lvIdx+1);else{BUBBLE.active=false;this.dialog=false;this.state='complete';}},
  update(){
    if(this.state!=='playing')return;this.timeOnLevel++;
    checkDlg();updateCam(this.player.x,this.level.W);
    this.level.update(this.player);this.player.update(this.level);
    tickParticles();tickNotif();tickPopup();
    if(this.player.dead){this.deaths++;this.state='dead';}
  },
  draw(){
    ctx.clearRect(0,0,W,H);
    if(this.state==='title')    {drawTitle();return;}
    if(this.state==='complete') {drawComplete();return;}
    drawBg(this.level.bg);
    for(const p of this.level.plats)drawPlatform(p);
    this.level.draw(this.player);
    drawParticles();
    this.player.draw();
    if(this.state==='dead'){drawDeath();return;}
    drawHUD(this.player,this.level);
    drawPopup();BUBBLE.draw(this.player);drawNotif();
    INV.draw(this.player);
  }
};

function startGame(){G.load(0);G.state='title';loop();}
function loop(){
  requestAnimationFrame(loop);
  if(G.state==='title'    &&(jp['Enter']||jp['Space']))G.load(0);
  if(G.state==='dead'     &&jp['KeyR'])G.load(G.lvIdx);
  if(G.state==='complete' &&jp['Enter']){
    unlockPhase('2.2');G.deaths=0;G._storedItems=[];G._storedScore=0;
    window.location.href='../../MenuPrincipal/index.html?unlocked=2.2';
  }
  G.update();G.draw();clearJP();
}

if(!gameReady){(function loadLoop(){
  if(gameReady)return;requestAnimationFrame(loadLoop);
  ctx.fillStyle='#0a1006';ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#e0b840';ctx.font='bold 24px "Courier New"';ctx.textAlign='center';
  ctx.fillText(`Carregando${'.'.repeat(Math.floor(Date.now()/400)%4)}  ${assetsLoaded}/${totalAssets}`,W/2,H/2);
  ctx.textAlign='left';
})();}