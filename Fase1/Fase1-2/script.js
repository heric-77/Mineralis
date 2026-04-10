const SAVE_KEY = 'mineralis_save_v2';
function saveRead() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || {}; } catch { return {}; }
}
function saveWrite(data) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch {}
}
function unlockPhase(id) {
  const s = saveRead();
  if (!s.fases) s.fases = {};
  if (!s.fases[id]) s.fases[id] = {};
  s.fases[id].desbloqueada = true;
  saveWrite(s);
}
function journalCollect(id) {
  const s = saveRead();
  if (!s.coletados) s.coletados = {};
  if (!s.coletados[id]) {
    s.coletados[id] = true;
    saveWrite(s);
    console.info('[Fase1-2] Journal item:', id);
  }
}


const JOURNAL_ITEMS = {
  bateia:       { id:'bateia',        tipo:'ferramenta', nome:'Bateia' },
  pa:           { id:'pa_exploradora',tipo:'ferramenta', nome:'Pá Exploradora' },
  ouro_aluvial: { id:'ouro_aluvial',  tipo:'minerio',    nome:'Ouro Aluvial' },
  vaso:         { id:'vaso_amazônico',tipo:'artefato',   nome:'Vaso Amazônico' },
};

const W = 1280, H = 720;
const wrap   = document.getElementById('wrap');
const canvas = document.getElementById('c');
const ctx    = canvas.getContext('2d');
canvas.width = W; canvas.height = H;

function resize() {
  const s  = Math.min(window.innerWidth / W, window.innerHeight / H);
  const sw = Math.round(W * s), sh = Math.round(H * s);
  canvas.style.width  = sw + 'px'; canvas.style.height = sh + 'px';
  wrap.style.position = 'fixed';
  wrap.style.left = Math.round((window.innerWidth  - sw) / 2) + 'px';
  wrap.style.top  = Math.round((window.innerHeight - sh) / 2) + 'px';
  wrap.style.width = sw + 'px'; wrap.style.height = sh + 'px';
}
resize(); window.addEventListener('resize', resize);

let AC;
try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){}
function sfx(type) {
  if (!AC) return; if (AC.state==='suspended') AC.resume();
  const o=AC.createOscillator(), g=AC.createGain();
  o.connect(g); g.connect(AC.destination); const t=AC.currentTime;
  if      (type==='jump')   { o.frequency.setValueAtTime(260,t); o.frequency.exponentialRampToValueAtTime(480,t+.14); g.gain.setValueAtTime(.14,t); g.gain.exponentialRampToValueAtTime(.001,t+.16); }
  else if (type==='gold')   { o.frequency.setValueAtTime(700,t); o.frequency.exponentialRampToValueAtTime(1100,t+.1); g.gain.setValueAtTime(.1,t); g.gain.exponentialRampToValueAtTime(.001,t+.18); }
  else if (type==='bateia') { o.frequency.setValueAtTime(380,t); o.frequency.setValueAtTime(260,t+.08); o.frequency.setValueAtTime(420,t+.16); g.gain.setValueAtTime(.12,t); g.gain.exponentialRampToValueAtTime(.001,t+.35); }
  else if (type==='hit')    { o.type='sawtooth'; o.frequency.setValueAtTime(180,t); o.frequency.exponentialRampToValueAtTime(60,t+.2); g.gain.setValueAtTime(.2,t); g.gain.exponentialRampToValueAtTime(.001,t+.22); }
  else if (type==='item')   { o.frequency.setValueAtTime(440,t); o.frequency.setValueAtTime(660,t+.1); o.frequency.setValueAtTime(880,t+.2); g.gain.setValueAtTime(.12,t); g.gain.exponentialRampToValueAtTime(.001,t+.3); }
  else if (type==='unlock') { o.frequency.setValueAtTime(330,t); o.frequency.setValueAtTime(440,t+.15); o.frequency.setValueAtTime(660,t+.3); g.gain.setValueAtTime(.13,t); g.gain.exponentialRampToValueAtTime(.001,t+.5); }
  else if (type==='dig')    { o.type='square'; o.frequency.setValueAtTime(100,t); g.gain.setValueAtTime(.09,t); g.gain.exponentialRampToValueAtTime(.001,t+.2); }
  o.start(t); o.stop(t+.6);
}

const IMG = {};
let assetsLoaded = 0, totalAssets = 5, gameReady = false; // Aumentado para 5 ativos
[['bg01','Fase 1.2 - Cena 01.PNG'],['bg02','Fase 1.2 - Cena 02.PNG'],
 ['bg03','Fase 1.2 - Cena 03.PNG'],['bg04','Fase 1.2 - Cena 04.PNG'],
 ['bgext','Fase 1.2 - Cena 01.PNG'], // Usando a cena 1 como fundo da capa
 ['capa','1_2_amazonia.svg']].forEach(([key,src]) => {
  const img = new Image();
  img.onload  = () => { IMG[key]=img; if (++assetsLoaded>=totalAssets){gameReady=true;startGame();} };
  img.onerror = () => { IMG[key]=null; if (++assetsLoaded>=totalAssets){gameReady=true;startGame();} };
  img.src = src;
});

const keys={}, jp={};
window.addEventListener('keydown',e=>{ if(!keys[e.code])jp[e.code]=true; keys[e.code]=true;
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
  if((e.code==='KeyI'||e.code==='Tab')&&G.state==='playing'){e.preventDefault();if(G.player)INV.toggle(G.player);}
  if(e.code==='Escape'&&INV.open)INV.close();
});
window.addEventListener('keyup',e=>delete keys[e.code]);
const TOUCH={l:false,r:false,j:false,e:false};
function bindT(id,k){ const el=document.getElementById(id);if(!el)return;
  el.addEventListener('touchstart',ev=>{ev.preventDefault();TOUCH[k]=true;if(k==='j'||k==='e')jp['_t'+k]=true;},{passive:false});
  el.addEventListener('touchend',  ev=>{ev.preventDefault();TOUCH[k]=false;},{passive:false}); }
bindT('tb-l','l');bindT('tb-r','r');bindT('tb-j','j');bindT('tb-e','e');
const isL=()=>keys['ArrowLeft']||keys['KeyA']||TOUCH.l;
const isR=()=>keys['ArrowRight']||keys['KeyD']||TOUCH.r;
const isJ=()=>jp['ArrowUp']||jp['KeyW']||jp['Space']||jp['_tj'];
const isE=()=>jp['KeyE']||jp['Enter']||jp['_te'];
function clearJP(){for(const k in jp)delete jp[k];}


const ITEM_DEFS = {
  bateia: {
    cat:'ferramenta', nome:'Bateia', icon:'🥌', journalId:'bateia',
    desc:'Separa ouro pesado do sedimento leve.\nUse [E] nas zonas ⚓ para garimpar.',
    drawHand:'left',
  },
  pa: {
    cat:'ferramenta', nome:'Pá Exploradora', icon:'🪏', journalId:'pa_exploradora',
    desc:'Escava solo aluvial amazônico.\nUse [E] próximo a fragmentos de cerâmica.',
    drawHand:'left',
  },
  lanterna: {
    cat:'ferramenta', nome:'Lanterna', icon:'🔦', journalId:null,
    desc:'Revela itens ocultos nas sombras da selva.\nNecessária para encontrar a Urna Marajoara.',
    drawHand:'right',
  },
  ouro_aluvial: {
    cat:'minerio', nome:'Ouro Aluvial', icon:'💛', journalId:'ouro_aluvial',
    desc:'Depositado nos rios por erosão milenar.\nDensidade: 19,3 g/cm³ — 19× mais pesado que a água.',
  },
  urna: {
    cat:'artefato', nome:'Urna Marajoara', icon:'🏺', journalId:'vaso_amazônico',
    desc:'Cerâmica de 1.000 anos da Ilha de Marajó.\nEvidência de civilizações amazônicas avançadas.',
  },
};

const INV = {
  open:false, tab:0, cursor:0,
  TABS:[
    {id:'ferramenta',label:'🔧 Ferramentas',color:'#78d840'},
    {id:'minerio',   label:'⛏ Minérios',   color:'#d4a017'},
    {id:'artefato',  label:'🏺 Artefatos',  color:'#d4804a'},
  ],
  tabItems(player){
    const cat=this.TABS[this.tab].id;
    return Object.entries(ITEM_DEFS)
      .filter(([id,def])=>def.cat===cat&&player.items.includes(id))
      .map(([id,def])=>({id,...def}));
  },
  toggle(player){
    this.open=!this.open;
    if(this.open){this.cursor=Math.min(this.cursor,Math.max(0,this.tabItems(player).length-1));}
    G.dialog=this.open;
  },
  close(){this.open=false;G.dialog=false;},
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
    ctx.fillStyle='rgba(2,14,2,0.97)';roundRect(PX,PY,PW,PH,16);ctx.fill();
    ctx.shadowBlur=0;
    ctx.strokeStyle='#3a7820';ctx.lineWidth=2.5;roundRect(PX,PY,PW,PH,16);ctx.stroke();
    ctx.strokeStyle='rgba(80,200,80,0.2)';ctx.lineWidth=1;roundRect(PX+4,PY+4,PW-8,PH-8,12);ctx.stroke();
    ctx.fillStyle='#78d840';ctx.font='bold 16px "Courier New"';
    ctx.textAlign='center';ctx.fillText('📔  DIÁRIO DE BORDO',W/2,PY+28);ctx.textAlign='left';
    ctx.fillStyle='rgba(80,200,80,0.3)';ctx.fillRect(PX+16,PY+38,PW-32,1);
    const TAB_W=PW/3,TAB_Y=PY+44;
    this.TABS.forEach((tab,i)=>{
      const tx=PX+i*TAB_W,active=(i===this.tab);
      ctx.fillStyle=active?'rgba(80,200,80,0.18)':'rgba(0,0,0,0.3)';
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
      ctx.fillStyle='#445';ctx.font='14px "Courier New"';ctx.textAlign='center';
      ctx.fillText('Nenhum item coletado ainda.',W/2,CY+CH/2);
      ctx.fillText('Explore a fase para desbloquear!',W/2,CY+CH/2+24);
      ctx.textAlign='left';
    } else {
      items.forEach((item,i)=>{
        const iy=CY+16+i*52,selected=(i===this.cursor),equipped=(player.activeTool===item.id);
        if(selected){
          ctx.fillStyle='rgba(80,200,80,0.18)';roundRect(PX+16,iy-10,COL_W,46,8);ctx.fill();
          ctx.strokeStyle='#78d840';ctx.lineWidth=1.5;roundRect(PX+16,iy-10,COL_W,46,8);ctx.stroke();
        }
        ctx.font='22px serif';ctx.fillText(item.icon,PX+28,iy+20);
        ctx.font=(equipped?'bold ':'')+'14px "Courier New"';
        ctx.fillStyle=equipped?'#a0e860':(selected?'#d8f0b8':'#aaa');
        ctx.fillText(item.nome,PX+62,iy+14);
        if(equipped){
          ctx.fillStyle='rgba(80,200,80,0.22)';roundRect(PX+62,iy+20,80,16,4);ctx.fill();
          ctx.font='10px "Courier New"';ctx.fillStyle='#78d840';ctx.fillText('▶ EQUIPADO',PX+66,iy+32);
        }
      });
      const sel=items[this.cursor];
      if(sel){
        ctx.fillStyle='rgba(80,200,80,0.08)';roundRect(DESC_X,CY,PW-DESC_X+PX-16,CH-10,8);ctx.fill();
        ctx.font='44px serif';ctx.textAlign='center';ctx.fillText(sel.icon,DESC_X+(PW-DESC_X+PX-16)/2,CY+68);ctx.textAlign='left';
        ctx.font='bold 15px "Courier New"';ctx.fillStyle='#78d840';
        ctx.textAlign='center';ctx.fillText(sel.nome,DESC_X+(PW-DESC_X+PX-16)/2,CY+98);
        const catLabel={ferramenta:'🔧 Ferramenta',minerio:'⛏ Minério',artefato:'🏺 Artefato'};
        ctx.font='11px "Courier New"';ctx.fillStyle='#888';
        ctx.fillText(catLabel[sel.cat],DESC_X+(PW-DESC_X+PX-16)/2,CY+116);ctx.textAlign='left';
        ctx.fillStyle='rgba(80,200,80,0.25)';ctx.fillRect(DESC_X+20,CY+124,PW-DESC_X+PX-56,1);
        const descLines=sel.desc.split('\n');
        ctx.font='13px "Courier New"';ctx.fillStyle='#c8e8b0';
        descLines.forEach((l,i)=>{ctx.textAlign='center';ctx.fillText(l,DESC_X+(PW-DESC_X+PX-16)/2,CY+144+i*22);});
        ctx.textAlign='left';
        if(sel.cat==='ferramenta'){
          const btnTxt=player.activeTool===sel.id?'[E] Desequipar':'[E] Equipar';
          ctx.fillStyle=player.activeTool===sel.id?'rgba(180,60,20,0.3)':'rgba(80,200,80,0.2)';
          roundRect(DESC_X+40,CY+CH-60,PW-DESC_X+PX-96,34,8);ctx.fill();
          ctx.strokeStyle=player.activeTool===sel.id?'#c04020':'#78d840';ctx.lineWidth=1.5;
          roundRect(DESC_X+40,CY+CH-60,PW-DESC_X+PX-96,34,8);ctx.stroke();
          ctx.font='bold 13px "Courier New"';ctx.fillStyle=player.activeTool===sel.id?'#e06040':'#78d840';
          ctx.textAlign='center';ctx.fillText(btnTxt,DESC_X+(PW-DESC_X+PX-16)/2,CY+CH-38);ctx.textAlign='left';
        }
      }
    }
    ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(PX,PY+PH-38,PW,38);
    ctx.fillStyle='rgba(80,200,80,0.3)';ctx.fillRect(PX+16,PY+PH-39,PW-32,1);
    ctx.font='11px "Courier New"';ctx.fillStyle='#888';ctx.textAlign='center';
    ctx.fillText('◀ ▶ Abas   ↑ ↓ Navegar   E Equipar/Desequipar   I Fechar',W/2,PY+PH-14);
    ctx.textAlign='left';
  }
};

let particles=[];
function burst(x,y,color,n=8,spd=3.5){
  for(let i=0;i<n;i++){const a=(i/n)*Math.PI*2+Math.random()*.5;
    particles.push({x,y,vx:Math.cos(a)*spd*(0.4+Math.random()),vy:Math.sin(a)*spd*(0.4+Math.random())-1,life:40+Math.random()*20,max:60,color,r:3+Math.random()*4});}
}
function splashBurst(x,y){
  burst(x,y,'#4ab0d0',10,4);
  burst(x,y,'rgba(255,255,255,0.6)',5,2);
}
function tickParticles(){for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=0.18;p.life--;if(p.life<=0)particles.splice(i,1);}}
function drawParticles(){for(const p of particles){ctx.globalAlpha=p.life/p.max;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x-cam.x,p.y-cam.y,p.r*(p.life/p.max),0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}

const cam={x:0,y:0};
function updateCam(px,worldW){cam.x+=(Math.max(0,Math.min(px-W/2+24,worldW-W))-cam.x)*0.12;}

const GRAV=0.46, PSPD=4.5, JUMPF=-12.2, MAXFALL=16;
const RUN_ACCEL=0.78, AIR_ACCEL=0.44, GROUND_FRICTION=0.72, AIR_FRICTION=0.92;
const JUMP_CUT=0.55, COYOTE_FRAMES=8, JUMP_BUFFER_FRAMES=10;

const TILE_THEMES={
  1:{top:'#4a9a28',body:'#5a3a18',dark:'#3a2008'},
  2:{top:'#4a9a28',body:'#6a4a20',dark:'#3a2808'},
  3:{top:'#2a6018',body:'#4a3010',dark:'#2a1808'},
  4:{top:'#3a7a20',body:'#5a3818',dark:'#2a1808'},
};
let tileTheme=TILE_THEMES[1];

function solid(x,y,w,h)         {return{type:'solid',x,y,w,h};}
function movH(x,y,w,x0,x1,spd) {return{type:'solid',moving:true,x,y,w,h:18,x0,x1,spd,vx:spd,vy:0};}
function trap(x,y,w)            {return{type:'trapdoor',x,y,w,h:14};}
function river(x,y,w,h)         {return{type:'river',x,y,w,h};}
function mudwater(x,y,w,h)      {return{type:'mudwater',x,y,w,h};}
function logPlatform(x,y,w)     {return{type:'solid',log:true,x,y,w,h:16};}
function spike(x,y,w)           {return{type:'spike',x,y,w,h:18};}

function tickMoving(plats){
  for(const p of plats){if(!p.moving)continue;
    if(p.x0!==undefined){p.x+=p.vx;if(p.x<=p.x0||p.x+p.w>=p.x1)p.vx=-p.vx;}
  }
}
function tickTrapdoors(plats){
  for(const p of plats){if(p.type!=='trapdoor')continue;
    if(p.crumble!==undefined){p.crumble--;if(p.crumble<=0){p.crumble=undefined;p.type='_dead';}}}
}

function drawPlatform(p){
  const sx=p.x-cam.x,sy=p.y-cam.y;
  if(sx>W+80||sx+p.w<-80||sy>H+40||sy+p.h<-40)return;

  if(p.type==='spike'){
    const nc=Math.max(1,Math.floor(p.w/20)); ctx.fillStyle='#cc3020';
    for(let i=0;i<nc;i++){const tx=sx+i*(p.w/nc);ctx.beginPath();ctx.moveTo(tx,sy+p.h);ctx.lineTo(tx+p.w/nc/2,sy);ctx.lineTo(tx+p.w/nc,sy+p.h);ctx.fill();}
    return;
  }
  if(p.type==='river'){
    const t=Date.now()/1200;
    const g=ctx.createLinearGradient(0,sy,0,sy+p.h);
    g.addColorStop(0,'rgba(52,140,210,0.88)');g.addColorStop(1,'rgba(20,70,140,0.95)');
    ctx.fillStyle=g;ctx.fillRect(sx,sy,p.w,p.h);
    ctx.fillStyle='rgba(160,220,255,0.2)';
    for(let i=0;i<5;i++){const rx=sx+(i*p.w/5)+Math.sin(t+i)*16;ctx.fillRect(rx%(sx+p.w),sy+4+Math.sin(t*1.3+i)*3,40,4);}
    return;
  }
  if(p.type==='mudwater'){
    const g=ctx.createLinearGradient(0,sy,0,sy+p.h);
    g.addColorStop(0,'rgba(90,60,20,0.9)');g.addColorStop(1,'rgba(40,20,5,0.97)');
    ctx.fillStyle=g;ctx.fillRect(sx,sy,p.w,p.h);
    const t2=Date.now()/2200;
    ctx.fillStyle='rgba(120,80,30,0.3)';
    for(let i=0;i<3;i++)ctx.fillRect(sx+i*(p.w/3)+Math.sin(t2+i)*10,sy+6,28,4);
    ctx.fillStyle='rgba(180,200,20,0.5)';
    for(let i=0;i<3;i++){const bx=sx+((i*p.w/3+Date.now()/50)%p.w);ctx.beginPath();ctx.arc(bx,sy+4+Math.sin(Date.now()/600+i)*6,4,0,Math.PI*2);ctx.fill();}
    return;
  }
  if(p.type==='_dead')return;
  if(p.type==='trapdoor'){
    const al=p.crumble!==undefined?p.crumble/70:1; ctx.globalAlpha=al;
    ctx.fillStyle='#5a3010';ctx.fillRect(sx,sy,p.w,p.h);
    ctx.fillStyle='#7a5020';ctx.fillRect(sx,sy,p.w,3);
    ctx.globalAlpha=1;return;
  }
  if(p.log){
    ctx.fillStyle='#6a3810';ctx.fillRect(sx,sy,p.w,p.h);
    ctx.fillStyle='#8a5020';ctx.fillRect(sx,sy,p.w,4);
    ctx.fillStyle='rgba(200,160,80,0.25)';
    for(let i=0;i<Math.ceil(p.w/40);i++)ctx.fillRect(sx+i*40+10,sy,8,p.h);
    if(p.moving){ctx.fillStyle='rgba(80,200,80,0.35)';ctx.fillRect(sx,sy,p.w,4);}
    return;
  }
  const ts=24,cols=Math.ceil(p.w/ts),rows=Math.ceil(p.h/ts);
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      const tx=sx+c*ts,ty=sy+r*ts,tw=Math.min(ts,sx+p.w-tx),th=Math.min(ts,sy+p.h-ty);
      ctx.fillStyle=r===0?tileTheme.body:(r%2===0?tileTheme.dark:tileTheme.body);
      ctx.fillRect(tx,ty,tw,th);
      ctx.fillStyle='rgba(0,0,0,0.1)';ctx.fillRect(tx+tw-1,ty,1,th);ctx.fillRect(tx,ty+th-1,tw,1);
    }
  }
  ctx.fillStyle=tileTheme.top;ctx.fillRect(sx,sy,p.w,4);
  ctx.fillStyle='rgba(80,160,40,0.55)';
  for(let i=0;i<Math.floor(p.w/16);i++)ctx.fillRect(sx+i*16+4,sy-3,4,5);
  if(p.moving){ctx.fillStyle='rgba(80,200,80,0.35)';ctx.fillRect(sx,sy,p.w,4);}
}

function roundRect(x,y,w,h,r){
  ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();
}


function drawCorvan(cx,cy,scale=1,flipX=false,frame=0,activeTool=null){
  const S=scale;
  ctx.save();ctx.translate(cx,cy);if(flipX)ctx.scale(-1,1);
  const r=(x,y,w,h,fill,op)=>{ctx.fillStyle=fill;ctx.globalAlpha=op!==undefined?op:1;ctx.fillRect(x*S,y*S,w*S,h*S);ctx.globalAlpha=1;};
  const lb=0.7+Math.sin(frame*0.4)*0.3;
  const showBateia=(activeTool==='bateia');
  const showPa=(activeTool==='pa');
  const showLantern=(activeTool==='lanterna');
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
  if(showBateia){
    const wb=Math.sin(frame*0.15)*1.2;
    r(0,26+wb,5,1,'#8a5820');r(0,27+wb,1,5,'#8a5820');
    ctx.fillStyle='#7a4010';ctx.beginPath();ctx.ellipse(2*S,(30+wb)*S,7*S,4*S,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#9aaab8';ctx.lineWidth=2*S;ctx.beginPath();ctx.ellipse(2*S,(30+wb)*S,7*S,4*S,0,0,Math.PI*2);ctx.stroke();
  } else if(showPa){
    r(1,20,5,12,'#b82010');r(1,32,5,3,'#a86030');
    r(0,22,4,1,'#8a5820');r(-1,23,1,8,'#8a5820');
    r(-4,20,9,6,'#9090a8');r(-4,20,9,2,'#b0b0c8');
  }
  r(24,16,5,12,'#b82010');r(24,28,5,3,'#a86030');
  if(showLantern){
    r(26,31,1,3,'#888888');r(24,34,5,6,'#604010');r(25,35,3,4,'#ffe080');
    r(23,33,7,8,'#ffcc00',0.12*lb);
  }
  r(9,42,6,4,'#3a1e08');r(17,42,6,4,'#3a1e08');
  r(8,44,8,2,'#2a1008');r(16,44,8,2,'#2a1008');
  ctx.fillStyle='#ffe060';ctx.globalAlpha=0.25*lb;ctx.beginPath();ctx.arc(16*S,1*S,4*S,0,Math.PI*2);ctx.fill();
  if(showLantern){ctx.fillStyle='#ffcc00';ctx.globalAlpha=0.18*lb;ctx.beginPath();ctx.arc(26*S,37*S,5*S,0,Math.PI*2);ctx.fill();}
  ctx.globalAlpha=1;ctx.restore();
}

function corvanFrame(t){return Math.sin(t)*2;}


function drawBateia(cx,cy,bobT=0,scale=1){
  ctx.save(); ctx.translate(cx, cy+Math.sin(bobT)*4);
  const S=scale;
  ctx.fillStyle='#7a4010'; ctx.beginPath(); ctx.ellipse(0,0,28*S,14*S,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#8b5018'; ctx.beginPath(); ctx.ellipse(0,0,26*S,12*S,0,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#8a9ba8'; ctx.lineWidth=3*S;
  ctx.beginPath(); ctx.ellipse(0,0,28*S,14*S,0,0,Math.PI*2); ctx.stroke();
  ctx.strokeStyle='#b0c4cc'; ctx.lineWidth=1.5*S;
  ctx.beginPath(); ctx.ellipse(0,1*S,26*S,12*S,0,0,Math.PI*2); ctx.stroke();
  ctx.fillStyle='#5a6670'; ctx.beginPath(); ctx.ellipse(0,1*S,20*S,9*S,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#6b7880'; ctx.beginPath(); ctx.ellipse(0,1*S,16*S,7*S,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(154,176,184,0.5)'; ctx.beginPath(); ctx.ellipse(-4*S,-1*S,5*S,2.5*S,-0.4,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='rgba(90,48,8,0.35)'; ctx.lineWidth=2*S;
  ctx.beginPath(); ctx.ellipse(0,0,22*S,11*S,0,0.2,1.0); ctx.stroke();
  ctx.restore();
}

function drawGoldNugget(cx,cy,bobT=0,sz=1){
  ctx.save(); ctx.translate(cx, cy+Math.sin(bobT)*5);
  const glow=ctx.createRadialGradient(0,0,0,0,0,22*sz);
  glow.addColorStop(0,'rgba(255,210,50,0.4)'); glow.addColorStop(1,'rgba(255,180,0,0)');
  ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(0,0,22*sz,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#c9920f';
  ctx.beginPath(); ctx.moveTo(-8*sz,-6*sz); ctx.lineTo(0,-11*sz); ctx.lineTo(10*sz,-5*sz);
  ctx.lineTo(12*sz,2*sz); ctx.lineTo(6*sz,11*sz); ctx.lineTo(-4*sz,12*sz);
  ctx.lineTo(-11*sz,5*sz); ctx.lineTo(-12*sz,-2*sz); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#e8a820';
  ctx.beginPath(); ctx.moveTo(-7*sz,-5*sz); ctx.lineTo(-1*sz,-9*sz); ctx.lineTo(8*sz,-4*sz);
  ctx.lineTo(10*sz,2*sz); ctx.lineTo(5*sz,9*sz); ctx.lineTo(-4*sz,9*sz); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#f0c040'; ctx.beginPath(); ctx.ellipse(-2*sz,-3*sz,4*sz,3*sz,0.4,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(255,255,200,0.7)'; ctx.beginPath(); ctx.arc(-3*sz,-5*sz,2*sz,0,Math.PI*2); ctx.fill();
  const ga=Math.abs(Math.sin(Date.now()/400+cx*0.01));
  ctx.strokeStyle=`rgba(255,255,200,${ga*0.9})`; ctx.lineWidth=2*sz;
  ctx.beginPath(); ctx.moveTo(4*sz,-7*sz); ctx.lineTo(9*sz,-12*sz); ctx.stroke();
  ctx.restore();
}

function drawUrna(cx,cy,bobT=0,buried=false){
  ctx.save(); ctx.translate(cx, cy+(buried?0:Math.sin(bobT)*4));
  if(!buried){
    const glow=ctx.createRadialGradient(0,0,0,0,0,34);
    glow.addColorStop(0,'rgba(180,60,20,0.32)'); glow.addColorStop(1,'rgba(180,50,0,0)');
    ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(0,0,34,0,Math.PI*2); ctx.fill();
  }
  ctx.fillStyle='#aa1a00'; ctx.beginPath(); ctx.ellipse(0,5,15,20,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#cc2200'; ctx.beginPath(); ctx.ellipse(-2,3,13,17,-0.1,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#888'; ctx.beginPath(); ctx.ellipse(0,-7,10,6,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#eee'; ctx.beginPath(); ctx.ellipse(0,-14,9,3.5,0,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#fff'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(-12,2); ctx.lineTo(-7,-2); ctx.lineTo(-2,2); ctx.lineTo(3,-2); ctx.lineTo(8,2); ctx.lineTo(13,-2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-12,9); ctx.lineTo(-7,5); ctx.lineTo(-2,9); ctx.lineTo(3,5); ctx.lineTo(8,9); ctx.lineTo(13,5); ctx.stroke();
  ctx.fillStyle='#880a00'; ctx.fillRect(-20,0,5,12); ctx.fillRect(15,0,5,12);
  ctx.strokeStyle='rgba(255,255,255,0.5)'; ctx.lineWidth=1.5;
  ctx.strokeRect(-20,0,5,12); ctx.strokeRect(15,0,5,12);
  ctx.fillStyle='#6a0000';
  for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(-6+i*4,16,2.5,0,Math.PI*2);ctx.fill();}
  if(buried){ctx.fillStyle='rgba(60,35,10,0.5)';ctx.fillRect(-22,-24,44,28);}
  ctx.restore();
}

function drawPa(cx,cy,bobT=0){
  ctx.save(); ctx.translate(cx, cy+Math.sin(bobT)*5);
  ctx.fillStyle='#888'; ctx.fillRect(-6,-20,12,24);
  ctx.fillStyle='#aaa'; ctx.fillRect(-8,-22,16,6);
  ctx.fillStyle='#ccc'; ctx.fillRect(-7,-21,14,4);
  ctx.fillStyle='#7a4818'; ctx.fillRect(-3,4,6,22);
  ctx.fillStyle='#8a5828'; ctx.fillRect(-2,5,4,18);
  const lg=ctx.createRadialGradient(0,-18,0,0,-18,20);
  lg.addColorStop(0,'rgba(180,220,255,0.2)');lg.addColorStop(1,'rgba(180,220,255,0)');
  ctx.fillStyle=lg;ctx.fillRect(-20,-30,40,20);
  ctx.restore();
}

function wrapText(text, maxW) {
  ctx.font='15px "Courier New"';
  const pars=text.split('\n'), result=[];
  for(const para of pars){
    const words=para.split(' '); let line='';
    for(const w of words){
      const test=line?line+' '+w:w;
      if(ctx.measureText(test).width>maxW&&line){result.push(line);line=w;}
      else line=test;
    }
    if(line)result.push(line);
  }
  return result;
}

const BUBBLE={
  active:false,queue:[],cb:null,lines:[],speakerTxt:'',speakerColor:'#78d840',faceFrame:0,
  show(messages,cb,speaker='CORVAN',color='#78d840'){
   this.queue=[...messages];this.cb=cb;this.active=true;
   this.speakerTxt=speaker;this.speakerColor=color;G.dialog=true;this._next();
  },
  _next(){
    if(!this.queue.length){this.active=false;G.dialog=false;if(this.cb){const f=this.cb;this.cb=null;f();}return;}
    this.lines=wrapText(this.queue.shift(),470);
  },
  advance(){if(this.active)this._next();},
  draw(player){
    if(!this.active)return;
    ctx.font='15px "Courier New"';
    const lineH=22,pad=20,textAreaW=560;
    const bubW=textAreaW+pad*2;
    const bubH=this.lines.length*lineH+80;
    const pcx=player.x-cam.x+player.w/2, pcy=player.y-cam.y;
    let bx=Math.max(10,Math.min(pcx-bubW/2, W-bubW-10));
    let by=Math.max(10, pcy-bubH-32);

    ctx.shadowColor='rgba(0,0,0,0.6)'; ctx.shadowBlur=14;
    ctx.fillStyle='rgba(4,14,4,0.95)'; roundRect(bx,by,bubW,bubH,14); ctx.fill();
    ctx.shadowBlur=0;
    ctx.strokeStyle=this.speakerColor; ctx.lineWidth=2.5;
    roundRect(bx,by,bubW,bubH,14); ctx.stroke();
    ctx.strokeStyle=`rgba(120,216,64,0.2)`; ctx.lineWidth=1;
    roundRect(bx+4,by+4,bubW-8,bubH-8,10); ctx.stroke();

    const tailBX=Math.max(bx+30,Math.min(pcx,bx+bubW-30));
    const tailTY=by+bubH, tailTipY=Math.min(pcy,tailTY+38);
    ctx.fillStyle='rgba(4,14,4,0.95)';
    ctx.beginPath();ctx.moveTo(tailBX-14,tailTY);ctx.lineTo(tailBX+14,tailTY);ctx.lineTo(pcx,tailTipY);ctx.closePath();ctx.fill();
    ctx.strokeStyle=this.speakerColor;ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(tailBX-14,tailTY);ctx.lineTo(pcx,tailTipY);ctx.lineTo(tailBX+14,tailTY);ctx.stroke();

    const tx=bx+pad;
    ctx.font='bold 12px "Courier New"';ctx.fillStyle=this.speakerColor;
    ctx.fillText(this.speakerTxt, tx, by+pad+14);

    ctx.font='15px "Courier New"';ctx.fillStyle='#e8f8e0';
    this.lines.forEach((l,i)=>ctx.fillText(l, tx, by+pad+36+i*lineH));

    const pulse=0.5+Math.sin(Date.now()/400)*0.5;
    ctx.fillStyle=`rgba(80,200,80,${pulse})`;
    ctx.font='12px "Courier New"';ctx.textAlign='right';
    ctx.fillText('[E] Continuar →', bx+bubW-pad, by+bubH-8);ctx.textAlign='left';
  }
};

function showDialog(msgs,cb,speaker='CORVAN',color='#78d840'){BUBBLE.show(msgs,cb,speaker,color);}
function checkDlg(){if(G.dialog&&!INV.open&&isE())BUBBLE.advance();}

let popup={active:false,timer:0,title:'',lines:[],color:'#f0c040',icon:''};
function showPopup(title,lines,color,icon,ms=6500){popup={active:true,timer:ms,title,lines,color,icon};}
function tickPopup(){if(popup.active&&popup.timer>0){popup.timer-=16;if(popup.timer<=0)popup.active=false;}}
function drawPopup(){
  if(!popup.active)return;
  const al=Math.min(1,popup.timer/400);
  ctx.save();ctx.globalAlpha=al;
  const pw=340,lineH=20,ph=popup.lines.length*lineH+80;
  const px=W-pw-18,py=56;
  ctx.fillStyle='rgba(0,20,0,0.94)';roundRect(px,py,pw,ph,10);ctx.fill();
  ctx.strokeStyle=popup.color;ctx.lineWidth=2;roundRect(px,py,pw,ph,10);ctx.stroke();
  ctx.strokeStyle=`rgba(120,216,64,0.2)`;ctx.lineWidth=1;roundRect(px+4,py+4,pw-8,ph-8,7);ctx.stroke();
  ctx.font='bold 13px "Courier New"';ctx.fillStyle=popup.color;
  ctx.textAlign='center';ctx.fillText(popup.title,px+pw/2,py+22);
  ctx.fillStyle='rgba(255,255,255,0.12)';ctx.fillRect(px+14,py+30,pw-28,1);
  ctx.font='12px "Courier New"';ctx.fillStyle='#d8f0d0';
  popup.lines.forEach((l,i)=>{ctx.textAlign='left';ctx.fillText('• '+l,px+16,py+48+i*lineH);});
  ctx.textAlign='left';ctx.restore();
}

let notifText='',notifAlpha=0,notifTimer=0;
function notify(msg,ms=2800){notifText=msg;notifTimer=ms;notifAlpha=1;}
function tickNotif(){if(notifTimer>0){notifTimer-=16;if(notifTimer<=0)notifAlpha=0;else notifAlpha=Math.min(1,notifTimer/300);}}
function drawNotif(){
  if(notifAlpha<=0)return;
  ctx.save();ctx.globalAlpha=notifAlpha;ctx.font='14px "Courier New"';
  const tw=ctx.measureText(notifText).width+32,nx=(W-tw)/2,ny=46;
  ctx.fillStyle='rgba(0,22,0,0.88)';roundRect(nx,ny,tw,28,6);ctx.fill();
  ctx.strokeStyle='#78d840';ctx.lineWidth=1.5;roundRect(nx,ny,tw,28,6);ctx.stroke();
  ctx.fillStyle='#78d840';ctx.textAlign='center';ctx.fillText(notifText,W/2,ny+19);ctx.textAlign='left';
  ctx.restore();
}


class Enemy{
  constructor(x,y,type,patrol){
    this.x=x;this.y=y;this.type=type;
    this.w=type==='piranha'?28:(type==='caiman'?70:44);
    this.h=type==='piranha'?18:(type==='caiman'?28:76);
    this.patrol=patrol;this.vx=type==='piranha'?2:2.1;
    this.facing=1;this.dead=false;this.frame=0;
    this.spawnX=x;this.spawnY=y;this.waterZone=null;this.landZone=null;
  }
  update(plats,player){
    if(this.dead)return; this.frame+=0.08;
    if(this.type==='piranha'){
      const cx=this.x+this.w/2;
      const waters=plats.filter(p=>p.type==='river'||p.type==='mudwater');
      const containing=waters.find(p=>cx>=p.x&&cx<=p.x+p.w);
      if(containing)this.waterZone=containing;
      else if(!this.waterZone){
        this.waterZone=waters.reduce((best,p)=>{
          const mid=p.x+p.w/2;
          if(!best)return p;
          return Math.abs(mid-this.spawnX)<Math.abs((best.x+best.w/2)-this.spawnX)?p:best;
        },null);
      }

      this.x+=this.vx;
      const zone=this.waterZone;
      if(zone){
        const left=Math.max(zone.x+8, this.spawnX-this.patrol);
        const right=Math.min(zone.x+zone.w-this.w-8, this.spawnX+this.patrol);
        if(this.x<=left){this.x=left;this.vx=Math.abs(this.vx);}
        if(this.x>=right){this.x=right;this.vx=-Math.abs(this.vx);}

        const top=zone.y+10;
        const bottom=zone.y+zone.h-this.h-10;
        const swimBase=Math.min(bottom, Math.max(top, this.spawnY));
        this.y=Math.max(top, Math.min(bottom, swimBase+Math.sin(this.frame*2+this.spawnX/30)*6));
      } else {
        if(Math.abs(this.x-this.spawnX)>this.patrol)this.vx=-this.vx;
        this.y=this.spawnY+Math.sin(this.frame*2+this.spawnX/30)*6;
      }
      this.facing=this.vx>0?1:-1;return;
    }
    const grounds=plats.filter(p=>p.type==='solid'||p.type==='trapdoor');
    const standing=grounds.find(p=>
      this.spawnX+this.w/2>=p.x&&this.spawnX+this.w/2<=p.x+p.w&&Math.abs(this.spawnY+this.h-p.y)<=18
    );
    if(standing)this.landZone=standing;
    else if(!this.landZone){
      this.landZone=grounds.reduce((best,p)=>{
        const mid=p.x+p.w/2;
        if(!best)return p;
        return Math.abs(mid-this.spawnX)<Math.abs((best.x+best.w/2)-this.spawnX)?p:best;
      },null);
    }

    this.x+=this.vx;
    const zone=this.landZone;
    let onG=false;
    let onEdge=false;
    if(zone){
      this.y=zone.y-this.h;
      onG=this.x+this.w>zone.x&&this.x<zone.x+zone.w;
      const edge=this.vx>0?this.x+this.w:this.x;
      onEdge=edge>zone.x+6&&edge<zone.x+zone.w-6;
      const left=Math.max(zone.x, this.spawnX-this.patrol);
      const right=Math.min(zone.x+zone.w-this.w, this.spawnX+this.patrol);
      if(this.x<=left){this.x=left;this.vx=Math.abs(this.vx);}
      if(this.x>=right){this.x=right;this.vx=-Math.abs(this.vx);}
      if(right-left<18){
        const center=zone.x+(zone.w-this.w)/2;
        this.x=center;
        this.vx=this.facing>=0?2.1:-2.1;
      }
    }
    if((onG&&!onEdge)||Math.abs(this.x-this.spawnX)>this.patrol)this.vx=-this.vx;
    this.facing=this.vx>0?1:-1;
  }
  draw(){
    if(this.dead)return;
    const sx=this.x-cam.x,sy=this.y-cam.y;
    if(sx<-80||sx>W+80)return;
    ctx.save();ctx.translate(sx+this.w/2,sy+this.h/2);
    if(this.facing===-1)ctx.scale(-1,1);
    if(this.type==='piranha'){
      const wb=Math.sin(this.frame*3)*3;
      ctx.fillStyle='#c02020';ctx.beginPath();ctx.ellipse(0,0,14,8,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#e03030';ctx.beginPath();ctx.ellipse(-2,-1,10,5,-0.1,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(6,-2,2.5,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#000';ctx.beginPath();ctx.arc(6.5,-2,1.5,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#901010';ctx.beginPath();ctx.moveTo(-13,0);ctx.lineTo(-20,-5+wb);ctx.lineTo(-20,5+wb);ctx.closePath();ctx.fill();
      ctx.fillStyle='#fff';ctx.fillRect(-2,5,2,3);ctx.fillRect(2,5,2,3);ctx.fillRect(6,5,2,3);
    } else if(this.type==='caiman'){
      ctx.fillStyle='#3a7a28';ctx.fillRect(-35,-10,70,20);
      ctx.fillStyle='#4a9a38';ctx.fillRect(-30,-8,58,14);
      ctx.fillStyle='#f0c020';ctx.fillRect(20,-14,8,6);ctx.fillRect(28,-14,8,6);
      ctx.fillStyle='#000';ctx.fillRect(22,-13,4,4);ctx.fillRect(30,-13,4,4);
      ctx.fillStyle='#3a7a28';ctx.fillRect(30,-8,18,14);
      ctx.fillStyle='#fffae0';ctx.fillRect(32,4,3,5);ctx.fillRect(37,4,3,5);ctx.fillRect(42,4,3,5);
      ctx.fillStyle='#2a6018';ctx.fillRect(-46,-7,18,14);ctx.fillRect(-56,-5,12,10);
      ctx.strokeStyle='#2a5a18';ctx.lineWidth=1;
      for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(-20+i*14,-8);ctx.lineTo(-20+i*14,8);ctx.stroke();}
    }
    ctx.restore();
  }
}


class Col{
  constructor(x,y,type){this.x=x;this.y=y;this.w=36;this.h=36;this.type=type;this.done=false;this.t=Math.random()*Math.PI*2;}
  tick(){if(!this.done)this.t+=0.06;}
  collectRect(){
    if(this.type==='gold'){
      return {x:this.x-10,y:this.y-12,w:this.w+20,h:this.h+24};
    }
    return this;
  }
  draw(){
    if(this.done)return;
    const sx=this.x-cam.x,sy=this.y-cam.y;
    if(sx<-60||sx>W+60)return;
    ctx.save();ctx.translate(sx+this.w/2,sy+this.h/2);
    if(this.type==='gold')    drawGoldNugget(0,0,this.t);
    else if(this.type==='bateia')  drawBateia(0,0,this.t,0.9);
    else if(this.type==='pa')      drawPa(0,0,this.t);
    else if(this.type==='urna')    drawUrna(0,8,this.t,false);
    ctx.restore();
  }
}

class Trigger{
  constructor(x,y,w,h,label,fn){this.x=x;this.y=y;this.w=w;this.h=h;this.label=label;this.fn=fn;this.done=false;}
  draw(px,py){
    if(this.done)return;
    const near=Math.abs((px+24)-(this.x+this.w/2))<this.w/2+80&&Math.abs((py+40)-(this.y+this.h/2))<this.h/2+80;
    if(!near)return;
    const sx=this.x+this.w/2-cam.x,sy=this.y-cam.y-26+Math.sin(Date.now()/350)*4;
    const txt='[E] '+this.label;
    ctx.font='14px "Courier New"';const tw=ctx.measureText(txt).width+24;
    ctx.fillStyle='rgba(0,22,0,0.82)';roundRect(sx-tw/2,sy-16,tw,24,4);ctx.fill();
    ctx.strokeStyle='#78d840';ctx.lineWidth=1.5;roundRect(sx-tw/2,sy-16,tw,24,4);ctx.stroke();
    ctx.fillStyle='#78d840';ctx.textAlign='center';ctx.fillText(txt,sx,sy);ctx.textAlign='left';
  }
}

class DigSpot{
  constructor(x,y){this.x=x;this.y=y;this.progress=0;this.revealed=false;this.done=false;this.glowT=0;}
  tick(){this.glowT+=0.04;}
  tryDig(){
    if(!this.done&&!this.revealed){
      this.progress+=24;sfx('dig');
      burst(this.x,this.y-10,'#8a5020',6,2);
      if(this.progress>=100)this.revealed=true;
    }
  }
  draw(){
    if(this.done)return;
    const sx=this.x-cam.x,sy=this.y-cam.y;
    if(sx<-80||sx>W+80)return;
    if(!this.revealed){
      const a=Math.abs(Math.sin(this.glowT))*0.4+0.1;
      ctx.fillStyle=`rgba(180,80,20,${a})`;ctx.beginPath();ctx.arc(sx,sy,20,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='rgba(160,60,20,0.55)';ctx.fillRect(sx-9,sy-5,13,7);
      ctx.fillStyle='rgba(120,216,64,0.85)';ctx.font='bold 12px "Courier New"';
      ctx.textAlign='center';ctx.fillText('[E] Escavar',sx,sy-30);ctx.textAlign='left';
      if(this.progress>0){
        ctx.strokeStyle='#78d840';ctx.lineWidth=3;
        ctx.beginPath();ctx.arc(sx,sy,24,-Math.PI/2,-Math.PI/2+Math.PI*2*(this.progress/100));ctx.stroke();
      }
    } else {
      ctx.save();ctx.translate(sx,sy-8);drawUrna(0,0,this.glowT,false);ctx.restore();
      const st=Date.now()/300;
      ctx.fillStyle=`rgba(200,80,30,${0.5+Math.sin(st)*0.4})`;
      for(let i=0;i<4;i++){const a=st+i*Math.PI/2;ctx.beginPath();ctx.arc(sx+Math.cos(a)*30,sy+Math.sin(a)*30,2.5,0,Math.PI*2);ctx.fill();}
    }
  }
}

let panning={active:false,timer:0,px:0,py:0,cb:null};
function startPanning(x,y,cb){panning={active:true,timer:0,px:x,py:y,cb};}
function tickPanning(){if(!panning.active)return;panning.timer+=16;if(panning.timer>=2200){panning.active=false;if(panning.cb)panning.cb();}}
function drawPanning(){
  if(!panning.active)return;
  const sx=panning.px-cam.x,sy=panning.py-cam.y-90;
  const prog=panning.timer/2200;
  ctx.save();ctx.translate(sx,sy);
  const swirl=Math.sin(panning.timer/110)*0.45; ctx.rotate(swirl);
  drawBateia(0,0,0,1.3);
  const t=panning.timer/200;
  ctx.strokeStyle='rgba(74,176,208,0.75)';ctx.lineWidth=2.5;
  for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(0,4,(10+i*5)*prog,t+i,t+i+Math.PI*1.5);ctx.stroke();}
  if(prog>0.5){
    for(let i=0;i<4;i++){const a=t+i*Math.PI/2;
      ctx.fillStyle='rgba(212,160,23,0.9)';ctx.beginPath();ctx.arc(Math.cos(a)*9,4+Math.sin(a)*5,3.5,0,Math.PI*2);ctx.fill();}
  }
  ctx.restore();
  ctx.fillStyle='rgba(0,22,0,0.82)';ctx.fillRect(sx-54,sy-54,108,13);
  ctx.fillStyle='#d4a017';ctx.fillRect(sx-54,sy-54,108*prog,13);
  ctx.strokeStyle='#78d840';ctx.lineWidth=1.5;ctx.strokeRect(sx-54,sy-54,108,13);
  ctx.fillStyle='#78d840';ctx.font='11px "Courier New"';ctx.textAlign='center';ctx.fillText('Garimpar...',sx,sy-58);ctx.textAlign='left';
}

class Player{
  constructor(x,y){
    this.x=x;this.y=y;this.w=40;this.h=82;
    this.vx=0;this.vy=0;this.onG=false;this.facing=1;
    this.hp=3;this.maxHp=3;this.inv=0;this.dead=false;
    this.frame=0;this.walkT=0;this.state='idle';
    this.coyote=0;this.jbuf=0;this.onMoving=null;
    this.prevX=x;this.prevY=y;this.jumpHeld=false;this.groundPlatform=null;
    this.items=[];this.score=0;
    this.activeTool=null;
    this.heat=0;this.heatAnim=0;
    this.interactAnim=0;
    this.mudInv=0;this.inMudwater=false;this.mudFlash=0;
  }
  overlaps(r){return this.x<r.x+r.w&&this.x+this.w>r.x&&this.y<r.y+r.h&&this.y+this.h>r.y;}
  near(r,d=80){return Math.abs(this.x+20-(r.x+r.w/2))<r.w/2+d&&Math.abs(this.y+40-(r.y+r.h/2))<r.h/2+d;}
  goldNear(col){
    const area=col.collectRect();
    return this.overlaps(area) || this.near(area,20);
  }
  mudwaterNear(p){
    const area={x:p.x-8,y:p.y-10,w:p.w+16,h:p.h+16};
    return this.overlaps(area);
  }

  update(level){
    if(INV.open){INV.navigate(this);return;}
    if(G.dialog||panning.active)return;
    this.prevX=this.x;this.prevY=this.y;
    if(isR()||isL())this.heat=Math.min(100,this.heat+0.06);
    else            this.heat=Math.max(0,this.heat-0.25);
    if(this.heat>=100)this.heatAnim=Math.min(80,this.heatAnim+1);
    else              this.heatAnim=Math.max(0,this.heatAnim-2);
    const sm=this.heat>=100?0.6:1.0;

    const moveDir=(isR()?1:0)-(isL()?1:0);
    const accel=this.onG?RUN_ACCEL:AIR_ACCEL;
    const maxSpeed=PSPD*sm;
    if(moveDir!==0){
      this.vx+=moveDir*accel*sm;
      this.vx=Math.max(-maxSpeed,Math.min(maxSpeed,this.vx));
      this.facing=moveDir;
    } else {
      this.vx*=this.onG?GROUND_FRICTION:AIR_FRICTION;
      if(Math.abs(this.vx)<0.05)this.vx=0;
    }

    if(this.onG)this.coyote=COYOTE_FRAMES;else if(this.coyote>0)this.coyote--;
    const jumpPressed=isJ();
    if(jumpPressed)this.jbuf=JUMP_BUFFER_FRAMES;
    if(this.jbuf>0)this.jbuf--;
    if(this.jbuf>0&&(this.onG||this.coyote>0)){
      this.vy=JUMPF;this.onG=false;this.coyote=0;this.jbuf=0;this.groundPlatform=null;sfx('jump');
    }
    const jumpDown=keys['ArrowUp']||keys['KeyW']||keys['Space']||TOUCH.j;
    if(!jumpDown&&this.jumpHeld&&this.vy<0)this.vy*=JUMP_CUT;
    this.jumpHeld=jumpDown;

    if(this.groundPlatform){
      this.x+=this.groundPlatform.vx||0;
      this.y+=this.groundPlatform.vy||0;
    }
    this.groundPlatform=null;
    this.vy=Math.min(this.vy+GRAV,MAXFALL);
    this.x+=this.vx;this._colX(level.plats);
    this.onG=false;
    this.y+=this.vy;this._colY(level.plats);
    this.x=Math.max(0,this.x);
    this.inMudwater=false;

    for(const p of level.plats){
      if(p.type==='mudwater'&&this.mudwaterNear(p)){
        this.inMudwater=true;
        this.mudFlash=Math.min(18,this.mudFlash+2);
        if(this.mudInv<=0){
          this._hurtMudwater(1);
          notify('⚠ Água contaminada! Mercúrio!',1600);
        }
      }
    }

    if(!this.inv){
      for(const p of level.plats){
        if(p.type==='river'&&this.overlaps(p)){splashBurst(this.x+20,p.y);this._hurt(2,level);}
      }
      for(const e of level.enemies){
        if(!e.dead&&this.overlaps(e)){
          if(this.vy>2&&this.y+this.h<e.y+e.h*0.5){e.dead=true;this.vy=-8;burst(e.x+14,e.y,'#78d840',10);sfx('gold');}
          else{this._hurt(1,level);this.vy=-6;this.vx=(this.x<e.x?-6:6);}
        }
      }
    }
    if(this.inv>0)this.inv--;if(this.interactAnim>0)this.interactAnim--;
    if(this.mudInv>0)this.mudInv--;
    if(!this.inMudwater)this.mudFlash=Math.max(0,this.mudFlash-1);

    for(const c of level.cols){
      const canCollect = c.type==='gold' ? this.goldNear(c) : this.overlaps(c);
      if(!c.done&&canCollect){c.done=true;
        if(c.type==='gold'){
          this.score+=15;sfx('gold');burst(c.x+18,c.y+18,'#d4a017',10);
          if(!this.items.includes('ouro_aluvial_ok')){this.items.push('ouro_aluvial_ok');journalCollect('ouro_aluvial');
            showPopup('⭐ OURO ALUVIAL ENCONTRADO',['Metal 19× mais pesado que a água','Depositado nos rios por erosão','Serra Pelada: 100mil garimpeiros em 1980','Uma grama → fio de kilômetros'],'#d4a017');}
        } else if(c.type==='bateia'){
          this.items.push('bateia');sfx('item');burst(c.x+18,c.y+18,'#78d840',12);
          journalCollect('bateia');
          showPopup('🥌 BATEIA COLETADA',['Ferramenta ancestral de garimpo','Movimentos circulares separam o ouro','Usada há 2.000 anos na Amazônia','Ouro: pesado, afunda no centro'],'#78d840');
        } else if(c.type==='pa'){
          this.items.push('pa');sfx('item');burst(c.x+18,c.y+18,'#78d840',12);
          journalCollect('pa_exploradora');
          notify('✦ Pá Exploradora coletada! Registrada no Diário.');
        }
      }
    }

    if(isE()){
      if(level.digSpots){
        for(const ds of level.digSpots){
          if(!ds.done&&this.near({x:ds.x-32,y:ds.y-32,w:64,h:64})){
            if(ds.revealed&&!ds.done){
              ds.done=true;
              if(!this.items.includes('urna'))this.items.push('urna');
              sfx('unlock');burst(ds.x,ds.y,'#cc2200',14);
              const firstUrna=!this.items.includes('urna_memoria');
              if(firstUrna){
                this.items.push('urna_memoria');
                journalCollect('vaso_amazônico');
                showDialog([
                  '"Este vaso sobreviveu a séculos de umidade amazônica — é cerâmica Marajoara. Foi criado na Ilha de Marajó, no Pará."',
                  '"A cultura Marajoara (400–1300 d.C.) enterrava seus mortos em urnas cerâmicas elaboradas, com padrões geométricos representando serpentes e o ciclo da vida."',
                  '"Para os povos amazônicos originais, o ouro era divindade, símbolo do sol. Não havia conceito de propriedade individual dos recursos da floresta."',
                  '"A corrida do ouro moderna destruiu em décadas o que esses povos preservaram por milênios. O verdadeiro tesouro não brilha — é a memória desta floresta."'
                ],()=>{notify('✦ Urna Marajoara arquivada no Diário de Bordo!');},
                '#78d840');
              } else {
                notify('Achei outra!',1800);
              }
            } else if(this.activeTool==='pa'){
              ds.tryDig();
            } else {
              if(this.items.includes('pa')) notify('Equipe a Pá no Diário [I] para escavar!');
              else notify('Colete a Pá Exploradora para escavar!');
            }
            break;
          }
        }
      }
      if(level.panZones&&this.activeTool==='bateia'&&!panning.active){
        for(const pz of level.panZones){
          if(!pz.done&&Math.abs(this.x+this.w/2-pz.x)<120){
            pz.done=true;sfx('bateia');
            startPanning(this.x+20,this.y,()=>{
              this.score+=25;burst(this.x+20,this.y-40,'#d4a017',14);
              showPopup('⚙ GARIMPO REALIZADO',['Ouro: densidade 19,3 g/cm³','Areia leve sai pela água','Ouro pesado fica no fundo','Técnica milenar dos garimpeiros'],'#d4a017');
            });break;
          }
        }
      } else if(level.panZones&&this.activeTool!=='bateia'){
        for(const pz of level.panZones){
          if(!pz.done&&Math.abs(this.x+this.w/2-pz.x)<120){
            if(this.items.includes('bateia')) notify('Equipe a Bateia no Diário [I] para garimpar!');
            else notify('Colete a Bateia para garimpar!');
            break;
          }
        }
      }
      for(const t of level.triggers){if(!t.done&&this.near(t)){t.fn(this,level);break;}}
    }

    if(this.y>level.H+200)this._hurt(3,level);
    if(!this.onG&&this.vy<0)this.state='jump';
    else if(!this.onG&&this.vy>0)this.state='fall';
    else if(Math.abs(this.vx)>0.5)this.state='run';
    else this.state='idle';
    if(Math.abs(this.vx)>0.5)this.walkT+=0.18;
  }

  _colX(plats){
    for(const p of plats){if(p.type==='river'||p.type==='mudwater'||p.type==='_dead')continue;
      if(!this.overlaps(p))continue;
      if(this.prevY+this.h<=p.y+2||this.prevY>=p.y+p.h-2)continue;
      if(this.prevX+this.w<=p.x){
        this.x=p.x-this.w;
      } else if(this.prevX>=p.x+p.w){
        this.x=p.x+p.w;
      } else if(this.vx>0){
        this.x=p.x-this.w;
      } else if(this.vx<0){
        this.x=p.x+p.w;
      }
      this.vx=0;
    }
  }
  _colY(plats){
    for(const p of plats){if(p.type==='river'||p.type==='mudwater'||p.type==='_dead')continue;
      if(p.type==='trapdoor'&&this.vy<0)continue;
      if(!this.overlaps(p))continue;
      const wasAbove=this.prevY+this.h<=p.y+4;
      const wasBelow=this.prevY>=p.y+p.h-4;
      if(this.vy>=0&&wasAbove){
        this.y=p.y-this.h;this.vy=0;this.onG=true;this.groundPlatform=p.moving?p:null;
        if(p.type==='trapdoor'&&p.crumble===undefined)p.crumble=70;
      } else if(this.vy<0&&wasBelow){
        this.y=p.y+p.h;this.vy=0;
      } else if(this.vy>=0){
        this.y=p.y-this.h;this.vy=0;this.onG=true;this.groundPlatform=p.moving?p:null;
      } else {
        this.y=p.y+p.h;this.vy=0;
      }
    }
  }
  _hurt(dmg,level){
    if(this.inv>0)return;this.hp-=dmg;this.inv=80;
    burst(this.x+20,this.y+40,'#ff4040',10);sfx('hit');
    if(this.hp<=0){this.hp=0;this.dead=true;}
  }
  _hurtMudwater(dmg){
    this.hp-=dmg;this.mudInv=36;this.mudFlash=18;
    burst(this.x+20,this.y+44,'rgba(170,140,30,0.9)',8,2.4);
    sfx('hit');
    if(this.hp<=0){this.hp=0;this.dead=true;}
  }

  draw(){
    if(this.dead)return;
    const S = 1.5;
    const CW = 32*S;           
    const FOOT_Y = 46*S;       
    const dx = this.x - cam.x + this.w/2 - CW/2;
    const dy = this.y - cam.y + this.h - FOOT_Y; 

    const flip = this.facing===-1;
    const wf = this.state==='run' ? this.walkT : (this.state==='idle' ? Date.now()/800 : 0);

    ctx.save();
    drawCorvan(dx, dy, S, flip, wf, this.activeTool);
    ctx.restore();
    if(this.activeTool==='bateia'||this.items.includes('urna')){
      const gx=this.x-cam.x+(flip?-10:this.w+12),gy=this.y-cam.y+this.h*0.6;
      const lg=ctx.createRadialGradient(gx,gy,0,gx,gy,80);
      lg.addColorStop(0,'rgba(255,200,80,0.2)');lg.addColorStop(1,'rgba(255,200,80,0)');
      ctx.fillStyle=lg;ctx.fillRect(gx-80,gy-80,160,160);
    }
    if(this.inv>0&&Math.floor(this.inv/6)%2===0){ctx.fillStyle='rgba(255,60,60,0.35)';ctx.fillRect(this.x-cam.x,this.y-cam.y,this.w,this.h);}
    if(this.inMudwater||this.mudFlash>0){
      const alpha=this.inMudwater?0.24:Math.min(0.2,this.mudFlash/90);
      ctx.fillStyle=`rgba(175,145,40,${alpha})`;
      ctx.fillRect(this.x-cam.x-2,this.y-cam.y+this.h*0.42,this.w+4,this.h*0.58);
      ctx.strokeStyle=`rgba(220,195,90,${Math.min(0.5,alpha+0.12)})`;
      ctx.lineWidth=2;
      ctx.strokeRect(this.x-cam.x-1,this.y-cam.y+this.h*0.48,this.w+2,this.h*0.44);
    }
    if(this.heatAnim>0){
      const a=this.heatAnim/80*0.4;ctx.fillStyle=`rgba(40,20,0,${a})`;ctx.fillRect(0,0,W,H);
      if(this.heatAnim>40){ctx.fillStyle=`rgba(255,120,0,${(this.heatAnim-40)/40*0.55})`;
        ctx.font='bold 26px "Courier New"';ctx.textAlign='center';ctx.fillText('⚠ CALOR DA SELVA!',W/2,90);ctx.textAlign='left';}
    }
  }
}

function drawBg(bgKey,murky=false){
  const img=IMG[bgKey];
  if(img&&img.complete&&img.naturalWidth>0){
    const sc=Math.max(W/img.naturalWidth,H/img.naturalHeight);
    ctx.drawImage(img,(W-img.naturalWidth*sc)/2,(H-img.naturalHeight*sc)/2,img.naturalWidth*sc,img.naturalHeight*sc);
  } else {
    const fb={bg01:'#2a8040',bg02:'#1a6030',bg03:'#1a4820',bg04:'#3a5010'};
    const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,fb[bgKey]||'#1a4010');g.addColorStop(1,'#0a1808');
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  }
  ctx.fillStyle=murky?'rgba(20,10,0,0.42)':'rgba(0,10,0,0.22)';ctx.fillRect(0,0,W,H);
}

let rainDrops=[];
function initRain(){rainDrops=[];for(let i=0;i<120;i++)rainDrops.push({x:Math.random()*W,y:Math.random()*H,spd:7+Math.random()*5});}
initRain();
function drawRain(){
  ctx.strokeStyle='rgba(160,200,255,0.35)';ctx.lineWidth=1.2;
  for(const d of rainDrops){d.y+=d.spd;d.x-=1.5;if(d.y>H){d.y=-10;d.x=Math.random()*W;}
    ctx.beginPath();ctx.moveTo(d.x,d.y);ctx.lineTo(d.x-4,d.y+12);ctx.stroke();}
}
let fireflies=[];
function initFireflies(){fireflies=[];for(let i=0;i<28;i++)fireflies.push({x:Math.random()*W,y:300+Math.random()*300,t:Math.random()*Math.PI*2,sp:0.4+Math.random()*0.6});}
initFireflies();
function drawFireflies(){
  for(const f of fireflies){
    f.t+=0.02;f.x+=(Math.random()-0.5)*f.sp;f.y+=(Math.random()-0.5)*f.sp;
    if(f.x<0)f.x=W;if(f.x>W)f.x=0;
    const a=Math.abs(Math.sin(f.t))*0.9+0.1;
    ctx.fillStyle=`rgba(255,240,80,${a})`;ctx.beginPath();ctx.arc(f.x,f.y,2.5,0,Math.PI*2);ctx.fill();
    const fg=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,12);
    fg.addColorStop(0,`rgba(255,240,80,${a*0.35})`);fg.addColorStop(1,'rgba(255,240,80,0)');
    ctx.fillStyle=fg;ctx.beginPath();ctx.arc(f.x,f.y,12,0,Math.PI*2);ctx.fill();
  }
}


function buildL1(){
  const FL=540,WW=3400,WH=860;
  const plats=[
    solid(0,FL,360,WH-FL),solid(420,FL,240,WH-FL),solid(740,FL,200,WH-FL),
    solid(1010,FL,220,WH-FL),solid(1300,FL,240,WH-FL),solid(1620,FL,220,WH-FL),
    solid(1920,FL,260,WH-FL),solid(2260,FL,220,WH-FL),solid(2560,FL,200,WH-FL),
    solid(2840,FL,260,WH-FL),solid(3160,FL,480,WH-FL),
    solid(200,FL-160,130,18),solid(440,FL-220,110,18),solid(660,FL-180,130,18),
    solid(880,FL-240,120,18),solid(1100,FL-180,130,18),solid(1380,FL-260,110,18),
    solid(1560,FL-200,140,18),solid(1800,FL-240,120,18),solid(2050,FL-180,130,18),
    solid(2320,FL-220,110,18),solid(2620,FL-180,130,18),solid(2900,FL-240,110,18),
    logPlatform(360,FL-36,62),logPlatform(700,FL-36,66),logPlatform(940,FL-36,62),
    logPlatform(1240,FL-36,62),logPlatform(1560,FL-36,58),logPlatform(1860,FL-36,62),
    logPlatform(2200,FL-36,64),logPlatform(2500,FL-36,62),logPlatform(2800,FL-36,62),
    logPlatform(3060,FL-36,62),
    river(360,FL,60,WH-FL),river(660,FL,80,WH-FL),river(940,FL,70,WH-FL),
    river(1240,FL,60,WH-FL),river(1600,FL,60,WH-FL),river(1860,FL,60,WH-FL),
    river(2200,FL,60,WH-FL),river(2500,FL,60,WH-FL),river(2800,FL,40,WH-FL),
    river(3060,FL,60,WH-FL),
  ];
  const enemies=[
    new Enemy(950,FL-44,'caiman',100),
    new Enemy(2000,FL-44,'caiman',90),
  ];
  const cols=[
    ...[100,250,520,780,1060,1360,1680,1960,2300,2620,2900,3100,3260].map(x=>new Col(x,FL-50,'gold')),
    new Col(3100,FL-60,'pa'),
    new Col(3260,FL-60,'bateia'),
  ];
  const triggers=[
    new Trigger(3320,FL-200,120,200,'Seguir ao Rio',(player,level)=>{
      if(!player.items.includes('bateia')){notify('Colete a Bateia primeiro!');return;}
      player.interactAnim=40;sfx('unlock');
      showDialog([
        '"Saímos do ar rarefeito dos Andes para a densa umidade da Amazônia. Aqui o ouro não está nas profundezas — está misturado ao sedimento que os rios carregam."',
        '"É o ouro aluvial: fragmentos erodidos das montanhas ao longo de milhões de anos, transportados pelas águas e depositados no fundo dos rios."',
        '"Serra Pelada, no Pará, foi o maior garimpo a céu aberto do mundo. Em 1980, mais de 100.000 garimpeiros trabalhavam em condições extremas por pepitas de ouro."',
        '"Com a bateia em mãos, seguiremos o leito do rio. Mas lembre-se: o verdadeiro tesouro desta floresta vai além do que brilha."'
      ],()=>{notify('✦ Bateia e Pá registradas no Diário!');level.triggers[0].done=true;setTimeout(()=>G.nextLevel(),2000);});
    }),
  ];
  return{id:1,bg:'bg01',W:WW,H:WH,startX:60,startY:FL-90,
    title:'Cena I — A Entrada na Selva',
    hint:'Colete a 🥌 Bateia e a Pá Exploradora ao final do caminho!',
    plats,enemies,cols,triggers,digSpots:[],panZones:[],
    intro:[
      '"A Amazônia cobre 5,5 milhões de km² — o maior ecossistema tropical do planeta, produzindo 20% do oxigênio terrestre."',
      '"O ouro aluvial não está em veios de rocha: foi erodido das montanhas por milhões de anos e se depositou no leito dos rios. É isso que vamos encontrar."',
      'Colete a Bateia e a Pá Exploradora. Cuidado com os rios — piranhas e jacarés habitam estas águas!'
    ],
    update(player){tickMoving(this.plats);tickTrapdoors(this.plats);for(const e of this.enemies)e.update(this.plats,player);for(const c of this.cols)c.tick();},
    draw(player){
      const rt=Date.now()/1000;
      for(const p of this.plats.filter(p=>p.type==='river')){
        const rx=p.x-cam.x;
        ctx.fillStyle='rgba(255,255,200,0.12)';ctx.beginPath();ctx.ellipse(rx+p.w/2,p.y-cam.y+8,p.w*.3,6,Math.sin(rt)*0.3,0,Math.PI*2);ctx.fill();
      }
      for(const e of this.enemies)e.draw();for(const c of this.cols)c.draw();for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}


function buildL2(){
  const FL=540,WW=3600,WH=860;
  const plats=[
    solid(0,FL,280,WH-FL),solid(380,FL,160,WH-FL),solid(640,FL,140,WH-FL),
    solid(900,FL,160,WH-FL),solid(1160,FL,180,WH-FL),solid(1460,FL,160,WH-FL),
    solid(1740,FL,180,WH-FL),solid(2060,FL,160,WH-FL),solid(2360,FL,180,WH-FL),
    solid(2660,FL,160,WH-FL),solid(2940,FL,220,WH-FL),solid(3200,FL,560,WH-FL),
    solid(160,FL-180,130,18),solid(440,FL-240,110,18),solid(680,FL-180,120,18),
    solid(940,FL-220,120,18),solid(1200,FL-180,130,18),solid(1500,FL-240,110,18),
    solid(1790,FL-180,120,18),solid(2100,FL-220,120,18),solid(2420,FL-180,110,18),
    solid(2700,FL-220,120,18),solid(2980,FL-180,130,18),
    logPlatform(280,FL-36,100),logPlatform(545,FL-36,95),logPlatform(800,FL-36,100),
    logPlatform(1005,FL-36,95),logPlatform(1300,FL-36,95),logPlatform(1605,FL-36,100),
    logPlatform(1880,FL-36,95),logPlatform(2200,FL-36,100),logPlatform(2505,FL-36,95),
    logPlatform(2800,FL-36,100),
    movH(2160,FL-90,90,2160,2340,1.8),movH(2460,FL-90,90,2460,2640,1.8),
    river(280,FL,100,WH-FL),river(545,FL,95,WH-FL),river(800,FL,100,WH-FL),
    river(1005,FL,95,WH-FL),river(1300,FL,160,WH-FL),river(1605,FL,135,WH-FL),
    river(1880,FL,180,WH-FL),river(2200,FL,160,WH-FL),river(2505,FL,155,WH-FL),
    river(2800,FL,140,WH-FL),
  ];
  const enemies=[
    new Enemy(316,FL-20,'piranha',34),new Enemy(575,FL-20,'piranha',28),
    new Enemy(1000,FL-44,'caiman',80),new Enemy(1350,FL-20,'piranha',70),
    new Enemy(2266,FL-20,'piranha',48),
    new Enemy(2600,FL-44,'caiman',80),
  ];
  const cols=[
    new Col(120,FL-50,'gold'),
    new Col(240,FL-210,'gold'),
    new Col(310,FL-92,'gold'),
    new Col(500,FL-88,'gold'),
    new Col(560,FL-270,'gold'),
    new Col(760,FL-210,'gold'),
    new Col(830,FL-92,'gold'),
    new Col(1050,FL-256,'gold'),
    new Col(1100,FL-74,'gold'),
    new Col(1350,FL-92,'gold'),
    new Col(1400,FL-220,'gold'),
    new Col(1650,FL-272,'gold'),
    new Col(1700,FL-84,'gold'),
    new Col(1930,FL-90,'gold'),
    new Col(2000,FL-210,'gold'),
    new Col(2250,FL-256,'gold'),
    new Col(2300,FL-84,'gold'),
    new Col(2560,FL-92,'gold'),
    new Col(2620,FL-220,'gold'),
    new Col(2850,FL-208,'gold'),
    new Col(3050,FL-84,'gold'),
  ];
  const panZones=[{x:1290,done:false},{x:2070,done:false},{x:2930,done:false}];
  const triggers=[
    new Trigger(3280,FL-260,160,260,'Avançar para Cena 3',(player,level)=>{
      sfx('unlock');
      showDialog([
        '"Observe como a água molda tudo. O ouro é pesado — deposita-se no fundo dos rios após ser erodido das montanhas por milhares de anos."',
        '"O ciclo da água é o motor desta riqueza: chuvas carregam partículas das encostas, rios as transportam, e o ouro acumula nos meandros."',
        '"Mas há um preço. A turbidez que você verá adiante é resultado do mercúrio e do garimpo ilegal — um veneno invisível para o rio e para quem bebe essa água."',
        '"O Brasil exporta toneladas de ouro ilegalmente todos os anos. Junto vai a floresta, o rio, e a memória dos povos que aqui viveram."'
      ],()=>{notify('✦ Continue para as águas contaminadas!');level.triggers[0].done=true;setTimeout(()=>G.nextLevel(),2000);});
    }),
  ];
  return{id:2,bg:'bg02',W:WW,H:WH,startX:60,startY:FL-90,
    title:'Cena II — Geologia Aluvial e Ciclo da Água',
    hint:'Use [E] nas zonas ⚓ para garimpar com a bateia!',
    plats,enemies,cols,triggers,digSpots:[],panZones,
    intro:[
      '"O ouro aluvial se forma durante milhões de anos. Fragmentos de rocha contendo ouro são erodidos pelas chuvas e carregados pelos rios."',
      '"O ouro (densidade 19,3 g/cm³) é 19× mais pesado que a água — afunda e acumula no fundo dos rios, pronto para ser separado com a bateia."',
      'Use [E] nas zonas marcadas com ⚓ para usar a bateia e garimpar ouro!'
    ],
    update(player){
      tickMoving(this.plats);tickTrapdoors(this.plats);
      for(const e of this.enemies)e.update(this.plats,player);for(const c of this.cols)c.tick();
      tickPanning();
    },
    draw(player){
      if(player.items.includes('bateia')){
        for(const pz of this.panZones){
          if(!pz.done){const px=pz.x-cam.x;
            const a=0.5+Math.sin(Date.now()/400)*0.45;
            ctx.fillStyle=`rgba(212,160,23,${a})`;ctx.beginPath();ctx.arc(px,FL-cam.y-12,16,0,Math.PI*2);ctx.fill();
            ctx.fillStyle='#fff';ctx.font='bold 13px "Courier New"';ctx.textAlign='center';ctx.fillText('⚓',px,FL-cam.y-5);ctx.textAlign='left';
            if(Math.abs(player.x+player.w/2-pz.x)<120){
              ctx.font='11px "Courier New"';ctx.fillStyle='rgba(100,220,60,0.8)';
              ctx.textAlign='center';const ht=player.activeTool==='bateia'?'[E] Garimpar':'Equipe Bateia [I]';
              ctx.fillText(ht,px,FL-cam.y-28);ctx.textAlign='left';
            }
          }
        }
      }
      drawPanning();
      for(const e of this.enemies)e.draw();for(const c of this.cols)c.draw();for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}


function buildL3(){
  const FL=540,WW=3800,WH=860;
  const plats=[
    solid(0,FL,300,WH-FL),solid(380,FL,180,WH-FL),solid(660,FL,160,WH-FL),
    solid(920,FL,180,WH-FL),solid(1200,FL,160,WH-FL),solid(1480,FL,180,WH-FL),
    solid(1780,FL,160,WH-FL),solid(2080,FL,180,WH-FL),solid(2380,FL,160,WH-FL),
    solid(2680,FL,200,WH-FL),solid(2980,FL,180,WH-FL),solid(3280,FL,700,WH-FL),
    solid(160,FL-200,130,18),solid(440,FL-260,110,18),solid(700,FL-200,120,18),
    solid(980,FL-240,120,18),solid(1260,FL-200,130,18),solid(1540,FL-260,110,18),
    solid(1840,FL-200,120,18),solid(2140,FL-240,120,18),solid(2440,FL-200,110,18),
    solid(2740,FL-240,120,18),solid(3040,FL-200,130,18),
    logPlatform(300,FL-36,80),logPlatform(570,FL-36,90),logPlatform(820,FL-36,80),
    logPlatform(1060,FL-36,80),logPlatform(1340,FL-36,90),logPlatform(1640,FL-36,80),
    logPlatform(1940,FL-36,80),logPlatform(2240,FL-36,80),logPlatform(2540,FL-36,80),
    logPlatform(2840,FL-36,80),logPlatform(3160,FL-36,80),
    movH(1080,FL-100,85,1080,1200,2.0),movH(1900,FL-100,85,1900,2060,2.0),movH(2540,FL-100,85,2540,2680,1.8),
    river(300,FL,80,WH-FL),river(570,FL,90,WH-FL),river(820,FL,80,WH-FL),river(1060,FL,80,WH-FL),
    mudwater(1340,FL,140,WH-FL),mudwater(1640,FL,140,WH-FL),mudwater(1940,FL,140,WH-FL),
    mudwater(2240,FL,140,WH-FL),mudwater(2540,FL,140,WH-FL),
    river(2840,FL,140,WH-FL),river(3160,FL,120,WH-FL),
    trap(1200,FL-60,110),
  ];
  const enemies=[
    new Enemy(780,FL-20,'piranha',60),
    new Enemy(1120,FL-44,'caiman',80),
    new Enemy(2100,FL-44,'caiman',80),
    new Enemy(2900,FL-20,'piranha',60),
  ];
  const cols=[
    ...[100,220,450,720,980,1100,1280,1540,1800,2100,2400,2720,3000,3180].map(x=>new Col(x,FL-50,'gold')),
  ];
  const triggers=[
    new Trigger(3360,FL-280,160,280,'Avançar para Cena 4',(player,level)=>{
      sfx('unlock');player.interactAnim=40;
      showDialog([
        '"O mercúrio usado na mineração ilegal se dissolve na água e entra na cadeia alimentar: peixe, garça, onça, e depois o ser humano."',
        '"A Amazônia já perdeu mais de 20% de sua cobertura original. Cada pepita de ouro ilegal carrega a destruição de hectares de floresta e rios envenenados."',
        '"Mas a floresta resiste. Em áreas protegidas, ela se recupera — e com ela, os rios voltam a ser limpos e o ouro volta a brilhar no fundo transparente."',
        '"Na margem à frente, algo me chama. Não é ouro — é cerâmica. Um vaso que sobreviveu séculos de chuva e raízes. Vamos investigar com cuidado."'
      ],()=>{notify('✦ Siga para a Cena Final!');level.triggers[0].done=true;setTimeout(()=>G.nextLevel(),2000);});
    }),
  ];
  return{id:3,bg:'bg03',W:WW,H:WH,startX:60,startY:FL-90,murky:true,
    title:'Cena III — A Coleta e o Impacto Ambiental',
    hint:'Água MARROM = contaminada por mercúrio! Evite-a.',
    plats,enemies,cols,triggers,digSpots:[],panZones:[],
    intro:[
      '"Em certas áreas, a água está turva pela mineração ilegal. O mercúrio usado para separar o ouro contamina rios inteiros por décadas."',
      '"As zonas escuras são contaminadas — causam dano extra. Atravesse apenas nos troncos e nas seções de rio azul."',
      'Colete o ouro nos trechos limpos e avance sem tocar na água contaminada!'
    ],
    update(player){tickMoving(this.plats);tickTrapdoors(this.plats);for(const e of this.enemies)e.update(this.plats,player);for(const c of this.cols)c.tick();},
    draw(player){
      drawRain();
      for(const p of this.plats.filter(p=>p.type==='mudwater')){
        const px=p.x-cam.x;if(px>-100&&px<W+100){
          ctx.fillStyle='rgba(100,80,0,0.18)';ctx.fillRect(px,0,p.w,H);
          const na=0.4+Math.sin(Date.now()/800+p.x)*0.28;
          ctx.fillStyle=`rgba(200,180,0,${na})`;ctx.font='bold 11px "Courier New"';ctx.textAlign='center';
          ctx.fillText('☠ MERCÚRIO',px+p.w/2,FL-cam.y-32);ctx.textAlign='left';}
      }
      for(const e of this.enemies)e.draw();for(const c of this.cols)c.draw();for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}


function buildL4(){
  const FL=540,WW=3000,WH=860;
  const plats=[
    solid(0,FL,340,WH-FL),solid(420,FL,200,WH-FL),solid(700,FL,180,WH-FL),
    solid(960,FL,200,WH-FL),solid(1240,FL,220,WH-FL),solid(1560,FL,200,WH-FL),
    solid(1860,FL,260,WH-FL),solid(2200,FL,220,WH-FL),solid(2520,FL,680,WH-FL),
    solid(180,FL-180,130,18),solid(480,FL-240,110,18),solid(760,FL-180,120,18),
    solid(1020,FL-220,110,18),solid(1300,FL-180,130,18),solid(1620,FL-240,110,18),
    solid(1920,FL-180,120,18),solid(2260,FL-220,110,18),
    logPlatform(340,FL-36,80),logPlatform(622,FL-36,78),logPlatform(878,FL-36,82),
    logPlatform(1164,FL-36,76),logPlatform(1460,FL-36,80),logPlatform(1760,FL-36,78),
    logPlatform(2100,FL-36,80),logPlatform(2420,FL-36,80),
    movH(1480,FL-100,80,1480,1560,1.8),movH(2100,FL-100,80,2100,2200,2.0),
    river(340,FL,82,WH-FL),river(622,FL,78,WH-FL),river(878,FL,82,WH-FL),
    river(1164,FL,76,WH-FL),river(1460,FL,100,WH-FL),river(1760,FL,100,WH-FL),
    river(2100,FL,100,WH-FL),river(2420,FL,100,WH-FL),
  ];
  const enemies=[
    new Enemy(820,FL-20,'piranha',60),
    new Enemy(1120,FL-44,'caiman',80),
    new Enemy(2000,FL-20,'piranha',60),
  ];
  const cols=[
    ...[100,220,460,740,1000,1280,1600,1900,2240].map(x=>new Col(x,FL-50,'gold')),
  ];
  const digSpots=[
    new DigSpot(1035,FL-18),
    new DigSpot(1925,FL-16),
    new DigSpot(2680,FL-18),
  ];
  const triggers=[
    new Trigger(2860,FL-180,180,180,'Concluir Fase 1.2',(player,level)=>{
      if(!player.items.includes('urna')){notify('Colete a Urna Marajoara primeiro!');return;}
      player.interactAnim=40;sfx('unlock');
      showDialog([
        '"Você encontrou a Urna Funerária Marajoara. Com mais de 1.000 anos, ela prova que povos sofisticados habitavam a Amazônia muito antes da colonização europeia."',
        '"A cultura Marajoara (400–1300 d.C.) criava cerâmicas elaboradas para rituais funerários com padrões que representavam o ciclo da vida e os espíritos da floresta."',
        '"Para eles, o ouro era o sol materializado. Não havia mineração destrutiva — apenas coleta cuidadosa do que a terra oferecia, em equilíbrio com a floresta."',
        '"Você preservou essa memória. Nossa próxima parada: Machu Picchu: o Tesouro do Condor!"'
      ],()=>{
        unlockPhase('1.3');
        G.state='complete';
      });
    }),
  ];
  return{id:4,bg:'bg04',W:WW,H:WH,startX:60,startY:FL-90,
    title:'Cena IV — Relíquias Perdidas e Conclusão',
    hint:'[E] próximo à terra vermelha para Escavar a Urna Marajoara!',
    plats,enemies,cols,triggers,digSpots,panZones:[],
    intro:[
      '"No entardecer da Amazônia, o rio reflete ouro. Mas o maior tesouro está enterrado na margem — esperando há séculos para ser encontrado com cuidado."',
      '"Procure fragmentos de cerâmica avermelhada perto das raízes. Use [E] várias vezes para escavar camada por camada sem danificar o artefato."',
      'Escave com cuidado e colete a Urna para completar a Fase 1.2!'
    ],
    update(player){
      tickMoving(this.plats);tickTrapdoors(this.plats);
      for(const ds of this.digSpots)ds.tick();
      for(const e of this.enemies)e.update(this.plats,player);
      for(const c of this.cols)c.tick();
    },
    draw(player){
      drawFireflies();
      for(const ds of this.digSpots){
        if(!ds.done){
          const dsx=ds.x-cam.x,dsy=ds.y-cam.y;
          ctx.strokeStyle='rgba(80,40,10,0.55)';ctx.lineWidth=4;
          ctx.beginPath();ctx.moveTo(dsx-30,dsy-45);ctx.quadraticCurveTo(dsx-10,dsy-15,dsx+8,dsy);ctx.stroke();
          ctx.beginPath();ctx.moveTo(dsx+30,dsy-45);ctx.quadraticCurveTo(dsx+10,dsy-15,dsx-5,dsy);ctx.stroke();
        }
        ds.draw();
      }
      for(const e of this.enemies)e.draw();for(const c of this.cols)c.draw();for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

function drawHUD(player,level){
  ctx.fillStyle='rgba(0,22,0,0.68)';ctx.fillRect(0,0,W,38);
  for(let i=0;i<player.maxHp;i++){
    ctx.fillStyle=i<player.hp?'#20c040':'#244';
    ctx.beginPath();const hx=16+i*28,hy=10;
    ctx.arc(hx+5,hy+5,5,Math.PI,0);ctx.arc(hx+15,hy+5,5,Math.PI,0);
    ctx.lineTo(hx+20,hy+5);ctx.bezierCurveTo(hx+20,hy+14,hx+10,hy+18,hx+10,hy+18);
    ctx.bezierCurveTo(hx+10,hy+18,hx,hy+14,hx,hy+5);ctx.closePath();ctx.fill();
  }
  ctx.fillStyle='rgba(120,216,64,.9)';ctx.font='13px "Courier New"';ctx.textAlign='center';ctx.fillText(level.title,W/2,24);ctx.textAlign='left';
  ctx.fillStyle='#78d840';ctx.font='bold 15px "Courier New"';ctx.textAlign='right';ctx.fillText('⭐ '+player.score,W-14,24);ctx.textAlign='left';
  const tY=44;
  ctx.fillStyle='rgba(0,0,0,0.5)';roundRect(16,tY,140,28,4);ctx.fill();
  ctx.strokeStyle=player.activeTool?'#78d840':'#444';ctx.lineWidth=1.5;roundRect(16,tY,140,28,4);ctx.stroke();
  if(player.activeTool&&ITEM_DEFS[player.activeTool]){
    const def=ITEM_DEFS[player.activeTool];
    ctx.font='14px serif';ctx.fillText(def.icon,24,tY+20);
    ctx.font='11px "Courier New"';ctx.fillStyle='#78d840';ctx.fillText(def.nome,42,tY+20);
  } else {ctx.font='11px "Courier New"';ctx.fillStyle='#555';ctx.fillText('Sem ferramenta',22,tY+20);}
  ctx.fillStyle='rgba(80,200,80,0.15)';roundRect(162,tY,46,28,4);ctx.fill();
  ctx.strokeStyle='#2a5a18';ctx.lineWidth=1.5;roundRect(162,tY,46,28,4);ctx.stroke();
  ctx.font='bold 11px "Courier New"';ctx.fillStyle='#5a9830';ctx.textAlign='center';ctx.fillText('[I]',185,tY+19);ctx.textAlign='left';
  let ix=W-16;const inv=[];
  if(player.items.includes('urna'))   inv.push('🏺 URNA');
  if(player.items.includes('bateia')) inv.push('🥌 BATEIA');
  if(player.items.includes('pa'))     inv.push('🪏 PÁ');
  for(const it of inv){ctx.fillStyle='#78d840';ctx.font='12px "Courier New"';ctx.textAlign='right';ctx.fillText(it,ix,tY+20);ctx.textAlign='left';ix-=ctx.measureText(it).width+20;}
  if(player.heat>40){
    const pct=(player.heat-40)/60;
    ctx.fillStyle='rgba(0,22,0,0.6)';ctx.fillRect(16,76,120,12);
    ctx.fillStyle=`hsl(${90-pct*90},100%,45%)`;ctx.fillRect(16,44,120*pct,12);
    ctx.strokeStyle='#78d840';ctx.lineWidth=1;ctx.strokeRect(16,44,120,12);
    ctx.fillStyle='#78d840';ctx.font='10px "Courier New"';ctx.fillText('CALOR',18,54);
  }
  ctx.fillStyle='rgba(120,240,80,.7)';ctx.font='12px "Courier New"';ctx.textAlign='center';ctx.fillText(level.hint,W/2,H-10);ctx.textAlign='left';
  if(G.timeOnLevel<600){
    ctx.fillStyle='rgba(0,22,0,0.58)';ctx.fillRect(8,H-44,430,28);
    ctx.fillStyle='#aaa';ctx.font='12px "Courier New"';ctx.fillText('← → Mover   ↑/Espaço Pular   E Interagir/Escavar   [Stomp inimigo]',14,H-25);
  }
}

function drawTitle(){
  const bg=IMG['bgext'];
  if(bg&&bg.complete&&bg.naturalWidth>0){ctx.globalAlpha=0.5;drawBg('bgext');ctx.globalAlpha=1;}
  else{ctx.fillStyle='#0a1c08';ctx.fillRect(0,0,W,H);}
  ctx.fillStyle='rgba(0,10,0,0.56)';ctx.fillRect(0,0,W,H);
  drawFireflies();
  ctx.textAlign='center';
  ctx.shadowColor='#78d840';ctx.shadowBlur=40;
  ctx.fillStyle='#78d840';
  ctx.font='bold 48px "Courier New"'; 
  ctx.fillText('O OURO DOS RIOS',W/2,150); 
  ctx.shadowBlur=0;
  ctx.fillStyle='#a8d860';
  ctx.font='19px "Courier New"';
  ctx.fillText('Fase 1.2  —  Serra Pelada & Amazônia, Brasil',W/2,195)
  if(IMG.capa) {
    const imgW = 220; 
    const imgH = 220;
    ctx.drawImage(IMG.capa, W/2 - imgW/2, 215, imgW, imgH);
  }
  ctx.fillStyle=`rgba(120,216,64,${.55+Math.sin(Date.now()/550)*.4})`;
  ctx.font='19px "Courier New"';
  ctx.fillText('▶  Pressione ENTER para começar  ◀',W/2,485); // Empurrado para baixo da imagem
  ctx.fillStyle='#888';ctx.font='13px "Courier New"';
  ctx.fillText('← → Mover   ↑/Espaço Pular   E Interagir/Escavar',W/2,520);
  ctx.textAlign='left';
}

function drawDeath(){
  ctx.fillStyle='rgba(0,0,0,0.72)';ctx.fillRect(0,0,W,H);
  ctx.textAlign='center';ctx.shadowColor='#ff4040';ctx.shadowBlur=30;
  ctx.fillStyle='#ff6060';ctx.font='bold 56px "Courier New"';ctx.fillText('VOCÊ CAIU!',W/2,H/2-50);
  ctx.shadowBlur=0;
  drawCorvan(W/2-48,H/2-20,3,false,Date.now()/200);
  ctx.fillStyle='#78d840';ctx.font='20px "Courier New"';
  ctx.fillText('Pressione  R  para recomeçar',W/2,H/2+140);
  ctx.fillText(`Mortes: ${G.deaths}`,W/2,H/2+168);ctx.textAlign='left';
}

function drawComplete(){
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#041008');g.addColorStop(1,'#0c2010');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  drawFireflies();
  const rg=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,500);
  rg.addColorStop(0,'rgba(120,216,64,.15)');rg.addColorStop(1,'rgba(120,216,64,0)');
  ctx.fillStyle=rg;ctx.fillRect(0,0,W,H);
  ctx.textAlign='center';ctx.shadowColor='#78d840';ctx.shadowBlur=40;
  ctx.fillStyle='#78d840';ctx.font='bold 42px "Courier New"';ctx.fillText('✦  FASE 1.2 CONCLUÍDA  ✦',W/2,118);
  ctx.shadowBlur=0;
  drawCorvan(W/2-160,200,4,false,Date.now()/300);
  ctx.save();ctx.translate(W/2+80,280);ctx.scale(2.8,2.8);drawUrna(0,0,Date.now()/1000,false);ctx.restore();

  ctx.fillStyle='#d8f0d0';ctx.font='17px "Courier New"';ctx.fillText('O Ouro dos Rios foi preservado!',W/2,196);
  const lines=[
    '✦  Bateia — ferramenta milenar de garimpo aluvial',
    '✦  Pá Exploradora — escavação de solo amazônico',
    '✦  Ouro Aluvial — erodido por milhões de anos',
    '✦  Urna Marajoara — cerâmica de 1.000 anos',
  ];
  ctx.fillStyle='#a8e880';ctx.font='14px "Courier New"';lines.forEach((l,i)=>ctx.fillText(l,W/2,248+i*28));
  ctx.fillStyle='rgba(120,216,64,0.8)';ctx.font='14px "Courier New"';ctx.fillText('📚 Itens arquivados no Diário de Bordo!',W/2,368);
  ctx.fillStyle='#78d840';ctx.font='16px "Courier New"';ctx.fillText(`Pontuação: ⭐ ${G.player?.score||0}   Mortes: ${G.deaths}`,W/2,400);
  ctx.fillStyle=`rgba(120,216,64,${.6+Math.sin(Date.now()/600)*.4})`;ctx.font='15px "Courier New"';
  ctx.fillText('Pressione ENTER para voltar ao início',W/2,436);
  ctx.textAlign='left';
}


const LEVELS=[buildL1,buildL2,buildL3,buildL4];
const G={
  state:'title',lvIdx:0,level:null,player:null,
  dialog:false,deaths:0,timeOnLevel:0,
  _storedItems:[],_storedScore:0,_storedTool:null,

  load(idx){
    this.lvIdx=idx;particles=[];
    tileTheme=TILE_THEMES[idx+1]||TILE_THEMES[1];
    this.level=LEVELS[idx]();cam.x=0;cam.y=0;
    this.player=new Player(this.level.startX,this.level.startY);
    if(idx>0){this.player.items=[...this._storedItems];this.player.score=this._storedScore;this.player.activeTool=this._storedTool||null;}
    this.dialog=false;this.state='playing';this.timeOnLevel=0;
    BUBBLE.active=false;popup.active=false;
    setTimeout(()=>{if(this.state==='playing')showDialog(this.level.intro,null);},900);
  },
  nextLevel(){
    this._storedItems=[...this.player.items];this._storedScore=this.player.score;this._storedTool=this.player.activeTool;
    if(this.lvIdx+1<LEVELS.length)this.load(this.lvIdx+1);else this.state='complete';
  },
  update(){
    if(this.state!=='playing')return;
    this.timeOnLevel++;checkDlg();
    updateCam(this.player.x,this.level.W);
    this.level.update(this.player);this.player.update(this.level);
    tickParticles();tickNotif();tickPopup();
    if(this.player.dead){this.deaths++;this.state='dead';}
  },
  draw(){
    ctx.clearRect(0,0,W,H);
    if(this.state==='title')    {drawTitle();return;}
    if(this.state==='complete') {drawComplete();return;}
    drawBg(this.level.bg,this.level.murky||false);
    for(const p of this.level.plats)drawPlatform(p);
    this.level.draw(this.player);
    drawParticles();
    this.player.draw();
    if(this.state==='dead'){drawDeath();return;}
    drawHUD(this.player,this.level);
    drawPopup();
    BUBBLE.draw(this.player);
    drawNotif();
    INV.draw(this.player);
  }
};


function startGame(){G.load(0);G.state='title';loop();}
function loop(){
  requestAnimationFrame(loop);
  if(G.state==='title'    &&(jp['Enter']||jp['Space']))G.load(0);
  if(G.state==='dead'     &&jp['KeyR'])G.load(G.lvIdx);
  if(G.state==='complete' &&jp['Enter']){G.deaths=0;G._storedItems=[];G._storedScore=0;G._storedTool=null;G.state='title';}
  G.update();G.draw();clearJP();
}


if(!gameReady){(function loadLoop(){
  if(gameReady)return;requestAnimationFrame(loadLoop);
  ctx.fillStyle='#0a1808';ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#78d840';ctx.font='bold 24px "Courier New"';ctx.textAlign='center';
  ctx.fillText(`Carregando${'.'.repeat(Math.floor(Date.now()/400)%4)}  ${assetsLoaded}/${totalAssets}`,W/2,H/2);
  ctx.textAlign='left';
})();}
