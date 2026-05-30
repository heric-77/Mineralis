// ─── SAVE ────────────────────────────────────────────────────────────────────
const SAVE_KEY='mineralis_save_v2';
function saveRead(){try{return JSON.parse(localStorage.getItem(SAVE_KEY))||{};}catch{return{};}}
function saveWrite(d){try{localStorage.setItem(SAVE_KEY,JSON.stringify(d));}catch{}}
function unlockPhase(id){const s=saveRead();if(!s.fases)s.fases={};if(!s.fases[id])s.fases[id]={};s.fases[id].desbloqueada=true;saveWrite(s);}
function journalCollect(id){const s=saveRead();if(!s.coletados)s.coletados={};if(!s.coletados[id]){s.coletados[id]=true;saveWrite(s);}}

// ─── CANVAS ──────────────────────────────────────────────────────────────────
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

// ─── AUDIO ───────────────────────────────────────────────────────────────────
let AC;try{AC=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}
function sfx(type){
  if(!AC)return;if(AC.state==='suspended')AC.resume();
  const o=AC.createOscillator(),g=AC.createGain();
  o.connect(g);g.connect(AC.destination);const t=AC.currentTime;
  if(type==='jump')      {o.frequency.setValueAtTime(220,t);o.frequency.exponentialRampToValueAtTime(440,t+.14);g.gain.setValueAtTime(.13,t);g.gain.exponentialRampToValueAtTime(.001,t+.16);}
  else if(type==='ouro') {o.type='triangle';o.frequency.setValueAtTime(1100,t);o.frequency.exponentialRampToValueAtTime(1760,t+.1);g.gain.setValueAtTime(.14,t);g.gain.exponentialRampToValueAtTime(.001,t+.28);}
  else if(type==='pirita'){o.type='square';o.frequency.setValueAtTime(200,t);o.frequency.exponentialRampToValueAtTime(90,t+.18);g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.001,t+.22);}
  else if(type==='pan')  {o.type='sine';o.frequency.setValueAtTime(320,t);o.frequency.setValueAtTime(280,t+.08);o.frequency.setValueAtTime(320,t+.16);g.gain.setValueAtTime(.09,t);g.gain.exponentialRampToValueAtTime(.001,t+.35);}
  else if(type==='picareta'){o.type='square';o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(70,t+.15);g.gain.setValueAtTime(.15,t);g.gain.exponentialRampToValueAtTime(.001,t+.18);}
  else if(type==='item') {o.frequency.setValueAtTime(440,t);o.frequency.setValueAtTime(660,t+.1);o.frequency.setValueAtTime(880,t+.2);g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.001,t+.3);}
  else if(type==='unlock'){o.frequency.setValueAtTime(330,t);o.frequency.setValueAtTime(440,t+.15);o.frequency.setValueAtTime(660,t+.3);g.gain.setValueAtTime(.13,t);g.gain.exponentialRampToValueAtTime(.001,t+.5);}
  else if(type==='hit')  {o.type='sawtooth';o.frequency.setValueAtTime(200,t);o.frequency.exponentialRampToValueAtTime(60,t+.2);g.gain.setValueAtTime(.18,t);g.gain.exponentialRampToValueAtTime(.001,t+.22);}
  else if(type==='teste'){o.type='triangle';o.frequency.setValueAtTime(520,t);o.frequency.setValueAtTime(880,t+.12);o.frequency.setValueAtTime(660,t+.24);g.gain.setValueAtTime(.11,t);g.gain.exponentialRampToValueAtTime(.001,t+.4);}
  o.start(t);o.stop(t+.6);
}

// ─── ASSETS ──────────────────────────────────────────────────────────────────
const IMG={};
let assetsLoaded=0,totalAssets=4,gameReady=false;
[['bg01','Assets/cena1.svg'],['bg02','Assets/cena2.svg'],
 ['bg03','Assets/cena3.svg'],['bg04','Assets/cena4.svg']].forEach(([key,src])=>{
  const img=new Image();
  img.onload=()=>{IMG[key]=img;if(++assetsLoaded>=totalAssets){gameReady=true;startGame();}};
  img.onerror=()=>{IMG[key]=null;if(++assetsLoaded>=totalAssets){gameReady=true;startGame();}};
  img.src=src;
});
IMG.card21=null;
(function(){const ci=new Image();ci.onload=()=>{IMG.card21=ci;};ci.onerror=()=>{IMG.card21=null;};ci.src='Assets/2_1_california.svg';})();

// ─── INPUT ───────────────────────────────────────────────────────────────────
const keys={},jp={};
window.addEventListener('keydown',e=>{if(!keys[e.code])jp[e.code]=true;keys[e.code]=true;
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
  if((e.code==='KeyI'||e.code==='Tab')&&G.state==='playing'&&!BUBBLE.active){e.preventDefault();if(G.player)INV.toggle(G.player);}
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

// ─── ITEM DEFS ────────────────────────────────────────────────────────────────
const ITEM_DEFS={
  bateia:{
    cat:'ferramenta',nome:'Bateia',icon:'🥣',
    journalId:'bateia',
    desc:'Separação por densidade: o ouro (19,3 g/cm³)\nsubmerge enquanto areia e sedimento flutuam.\nGire em círculos na água para garimpar.',
    drawHand:'right',
  },
  picareta:{
    cat:'ferramenta',nome:'Picareta Básica',icon:'⛏',
    journalId:'picareta_basica',
    desc:'Extrai veios de ouro do quartzo.\nUse [E] próximo a um veio brilhante.',
    drawHand:'left',
  },
  pedra_de_toque:{
    cat:'ferramenta',nome:'Pedra de Toque',icon:'🪨',
    journalId:'pedra_de_toque',
    desc:'Usada por ensaiadores do século XIX.\nRisque o mineral: traço dourado = ouro puro;\ntraço esverdeado/escuro = pirita (ouro de tolo).',
    drawHand:'left',
  },
  ouro:{
    cat:'minerio',nome:'Ouro (Pepita)',icon:'◎',
    journalId:'ouro_pepita',
    desc:'1g de ouro pode formar um fio de 3km.\nFormado há 120 mi de anos em fluidos\nhidrotermais que infiltraram fissuras de quartzo.',
  },
  quartzo_aureo:{
    cat:'minerio',nome:'Quartzo Aurífero',icon:'◈',
    journalId:'quartzo_aureo',
    desc:'Veios da Mother Lode — 200 km de quartzo\nauríferoa percorrem a Sierra Nevada.\nA erosão dos rios libera as pepitas.',
  },
  placa_reivindicacao:{
    cat:'artefato',nome:'Placa de Reivindicação',icon:'📋',
    journalId:'placa_reivindicacao',
    desc:'Registro legal do "claim" de um garimpeiro.\nInfluenciou a legislação de propriedade dos EUA.\nData de 1849 — assinada J. W. Garrett.',
  },
};

// ─── INVENTORY ────────────────────────────────────────────────────────────────
const INV={
  open:false,tab:0,cursor:0,
  TABS:[
    {id:'ferramenta',label:'🔧 Ferramentas',color:'#e0b840'},
    {id:'minerio',   label:'⛏ Minérios',   color:'#c0c8d8'},
    {id:'artefato',  label:'🏺 Artefatos',  color:'#d4a060'},
  ],
  tabItems(player){
    const cat=this.TABS[this.tab].id;
    let saved={};
    try{const s=localStorage.getItem(SAVE_KEY);if(s){const j=JSON.parse(s);saved=j.coletados||{};}}catch(e){}
    // Mescla global + local sem duplicar journalIds (local tem prioridade)
    const _seenJids=new Set(Object.values(ITEM_DEFS).map(d=>d.journalId||'').filter(Boolean));
    const _FINAL={...ITEM_DEFS};
    for(const [id,def] of Object.entries(window.ALL_ITEM_DEFS||{})){
      if(id in ITEM_DEFS)continue;
      const jid=def.journalId||id;
      if(_seenJids.has(jid))continue;
      _seenJids.add(jid);_FINAL[id]=def;
    }
    return Object.entries(_FINAL).filter(([id,def])=>{
      if(def.cat!==cat)return false;
      return player.items.includes(id)||player.items.includes(id+'_ok')||player.items.includes(id+'_col')||saved[def.journalId||id];
    }).map(([id,def])=>({id,...def}));
  },
  toggle(player){this.open=!this.open;if(this.open){this.cursor=Math.min(this.cursor,Math.max(0,this.tabItems(player).length-1));}G.dialog=this.open||BUBBLE.active;},
  close(){this.open=false;G.dialog=BUBBLE.active;},
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
    if(isE()&&items.length>0&&this.tab===0){
      const item=items[this.cursor];
      if(player.activeTools.has(item.id))player.activeTools.delete(item.id);
      else player.activeTools.add(item.id);
      return true;
    }
    return false;
  },
  draw(player){
    if(!this.open)return;
    ctx.fillStyle='rgba(0,0,0,0.65)';ctx.fillRect(0,0,W,H);
    const PW=780,PH=480,PX=(W-PW)/2,PY=(H-PH)/2;
    ctx.shadowColor='rgba(0,0,0,0.7)';ctx.shadowBlur=20;
    ctx.fillStyle='rgba(10,6,2,0.97)';roundRect(PX,PY,PW,PH,16);ctx.fill();
    ctx.shadowBlur=0;
    ctx.strokeStyle='#8a6820';ctx.lineWidth=2.5;roundRect(PX,PY,PW,PH,16);ctx.stroke();
    ctx.strokeStyle='rgba(200,160,40,0.2)';ctx.lineWidth=1;roundRect(PX+4,PY+4,PW-8,PH-8,12);ctx.stroke();
    ctx.fillStyle='#e0b840';ctx.font='bold 16px "Courier New"';
    ctx.textAlign='center';ctx.fillText('📔DIÁRIO DE BORDO',W/2,PY+28);ctx.textAlign='left';
    ctx.fillStyle='rgba(200,160,40,0.3)';ctx.fillRect(PX+16,PY+38,PW-32,1);
    const TAB_W=PW/3,TAB_Y=PY+44;
    this.TABS.forEach((tab,i)=>{
      const tx=PX+i*TAB_W,active=(i===this.tab);
      ctx.fillStyle=active?'rgba(200,160,40,0.18)':'rgba(0,0,0,0.3)';
      ctx.fillRect(tx+2,TAB_Y,TAB_W-4,34);
      ctx.fillStyle=active?tab.color:'#666';
      ctx.font=(active?'bold ':'')+'13px "Courier New"';
      ctx.textAlign='center';ctx.fillText(tab.label,tx+TAB_W/2,TAB_Y+22);ctx.textAlign='left';
      if(active){ctx.fillStyle=tab.color;ctx.fillRect(tx+2,TAB_Y+32,TAB_W-4,3);}
    });
    const CY=TAB_Y+40,CH=PH-(CY-PY)-50;
    const items=this.tabItems(player);
    const COL_W=260,DESC_X=PX+280,DESC_Y=CY+20;
    if(items.length===0){
      ctx.fillStyle='#554';ctx.font='14px "Courier New"';
      ctx.textAlign='center';ctx.fillText('Nenhum item coletado ainda.',W/2,CY+CH/2);
      ctx.fillText('Explore a fase para desbloquear!',W/2,CY+CH/2+24);ctx.textAlign='left';
    } else {
      items.forEach((item,i)=>{
        const iy=CY+16+i*52,selected=(i===this.cursor),equipped=player.activeTools.has(item.id);
        if(selected){ctx.fillStyle='rgba(200,160,40,0.18)';roundRect(PX+16,iy-10,COL_W,46,8);ctx.fill();ctx.strokeStyle='#e0b840';ctx.lineWidth=1.5;roundRect(PX+16,iy-10,COL_W,46,8);ctx.stroke();}
        ctx.font='24px serif';ctx.fillText(item.icon,PX+28,iy+22);
        ctx.font=(equipped?'bold ':'')+'14px "Courier New"';
        ctx.fillStyle=equipped?'#f0c840':(selected?'#e8d8a0':'#aaa');
        ctx.fillText(item.nome,PX+62,iy+16);
        if(equipped){ctx.fillStyle='rgba(200,160,40,0.22)';roundRect(PX+62,iy+20,80,16,4);ctx.fill();ctx.font='10px "Courier New"';ctx.fillStyle='#e0b840';ctx.fillText('▶ EQUIPADO',PX+66,iy+32);}
        else if(item.consumivel){ctx.font='10px "Courier New"';ctx.fillStyle='#5a8a50';ctx.fillText('CONSUMÍVEL',PX+62,iy+32);}
      });
      const sel=items[this.cursor];
      if(sel){
        ctx.fillStyle='rgba(200,160,40,0.08)';roundRect(DESC_X,CY,PW-DESC_X+PX-16,CH-10,8);ctx.fill();
        ctx.font='48px serif';ctx.textAlign='center';ctx.fillText(sel.icon,DESC_X+(PW-DESC_X+PX-16)/2,CY+70);ctx.textAlign='left';
        ctx.font='bold 15px "Courier New"';ctx.fillStyle='#e0b840';
        ctx.textAlign='center';ctx.fillText(sel.nome,DESC_X+(PW-DESC_X+PX-16)/2,CY+100);ctx.textAlign='left';
        const catLabel={ferramenta:'🔧 Ferramenta',minerio:'⛏ Minério',artefato:'🏺 Artefato'};
        ctx.font='11px "Courier New"';ctx.fillStyle='#888';
        ctx.textAlign='center';ctx.fillText(catLabel[sel.cat],DESC_X+(PW-DESC_X+PX-16)/2,CY+118);ctx.textAlign='left';
        ctx.fillStyle='rgba(200,160,40,0.25)';ctx.fillRect(DESC_X+20,CY+126,PW-DESC_X+PX-56,1);
        const descLines=sel.desc.split('\n');
        ctx.font='13px "Courier New"';ctx.fillStyle='#d8c898';
        descLines.forEach((l,i)=>{ctx.textAlign='center';ctx.fillText(l,DESC_X+(PW-DESC_X+PX-16)/2,CY+146+i*22);});
        ctx.textAlign='left';
        if(sel.cat==='ferramenta'){
          const btnTxt=player.activeTools.has(sel.id)?'[E] Desequipar':'[E] Equipar';
          const btnColor=player.activeTools.has(sel.id)?'rgba(180,60,20,0.3)':'rgba(200,160,40,0.2)';
          ctx.fillStyle=btnColor;roundRect(DESC_X+40,CY+CH-60,PW-DESC_X+PX-96,34,8);ctx.fill();
          ctx.strokeStyle=player.activeTools.has(sel.id)?'#c04020':'#e0b840';ctx.lineWidth=1.5;
          roundRect(DESC_X+40,CY+CH-60,PW-DESC_X+PX-96,34,8);ctx.stroke();
          ctx.font='bold 13px "Courier New"';ctx.fillStyle=player.activeTools.has(sel.id)?'#e06040':'#e0b840';
          ctx.textAlign='center';ctx.fillText(btnTxt,DESC_X+(PW-DESC_X+PX-16)/2,CY+CH-38);ctx.textAlign='left';
        }
      }
    }
    ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(PX,PY+PH-38,PW,38);
    ctx.fillStyle='rgba(200,160,40,0.3)';ctx.fillRect(PX+16,PY+PH-39,PW-32,1);
    ctx.font='11px "Courier New"';ctx.fillStyle='#888';ctx.textAlign='center';
    ctx.fillText('◀ ▶ Abas   ↑ ↓ Navegar   E Equipar/Desequipar   I Fechar',W/2,PY+PH-14);
    ctx.textAlign='left';
  }
};

// ─── PARTICLES ────────────────────────────────────────────────────────────────
let particles=[];
function burst(x,y,color,n=8,spd=3.2){
  for(let i=0;i<n;i++){const a=(i/n)*Math.PI*2+Math.random()*.5;
    particles.push({x,y,vx:Math.cos(a)*spd*(0.4+Math.random()),vy:Math.sin(a)*spd*(0.4+Math.random())-1,life:40+Math.random()*20,max:60,color,r:3+Math.random()*4});}
}
function tickParticles(){for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=0.18;p.life--;if(p.life<=0)particles.splice(i,1);}}
function drawParticles(){for(const p of particles){ctx.globalAlpha=p.life/p.max;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x-cam.x,p.y-cam.y,p.r*(p.life/p.max),0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}

// ─── CAMERA ───────────────────────────────────────────────────────────────────
const cam={x:0,y:0};
function updateCam(px,worldW){cam.x+=(Math.max(0,Math.min(px-W/2+24,worldW-W))-cam.x)*0.12;}

// ─── PHYSICS ──────────────────────────────────────────────────────────────────
const GRAV=0.46,PSPD=4.5,JUMPF=-12.2,MAXFALL=16;

const TILE_THEMES={
  1:{top:'#9a8870',body:'#6a5040',dark:'#3a2a18'},
  2:{top:'#9a8870',body:'#6a5040',dark:'#3a2a18'},
  3:{top:'#9a8870',body:'#6a5040',dark:'#3a2a18'},
  4:{top:'#9a8870',body:'#6a5040',dark:'#3a2a18'},
};
let tileTheme=TILE_THEMES[1];

function solid(x,y,w,h){return{type:'solid',x,y,w,h};}
function movH(x,y,w,x0,x1,spd){return{type:'solid',moving:true,x,y,w,h:16,x0,x1,spd,vx:spd,vy:0};}
function trap(x,y,w){return{type:'trapdoor',x,y,w,h:14};}
function spike(x,y,w){return{type:'spike',x,y,w,h:18};}

function tickMoving(plats){for(const p of plats){if(!p.moving)continue;if(p.x0!==undefined){p.x+=p.vx;if(p.x<=p.x0||p.x+p.w>=p.x1)p.vx=-p.vx;}}}
function tickTrapdoors(plats){for(const p of plats){if(p.type!=='trapdoor')continue;if(p.crumble!==undefined){p.crumble--;if(p.crumble<=0){p.crumble=undefined;p.type='_dead';}}}}

function drawPlatform(p){
  const sx=p.x-cam.x,sy=p.y-cam.y;
  if(sx>W+80||sx+p.w<-80||sy>H+40||sy+p.h<-40)return;
  if(p.type==='spike'){
    ctx.fillStyle='#8a6840';const nc=Math.max(1,Math.floor(p.w/20));
    for(let i=0;i<nc;i++){const tx=sx+i*(p.w/nc);ctx.beginPath();ctx.moveTo(tx,sy+p.h);ctx.lineTo(tx+p.w/nc/2,sy);ctx.lineTo(tx+p.w/nc,sy+p.h);ctx.fill();}return;
  }
  if(p.type==='_dead')return;
  if(p.type==='trapdoor'){
    const al=p.crumble!==undefined?p.crumble/70:1;ctx.globalAlpha=al;
    ctx.fillStyle='#5a7040';ctx.fillRect(sx,sy,p.w,p.h);
    ctx.fillStyle='#7a9060';ctx.fillRect(sx,sy,p.w,3);ctx.globalAlpha=1;return;
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
  ctx.fillStyle='rgba(180,220,160,0.2)';
  for(let i=0;i<Math.floor(p.w/20);i++)ctx.fillRect(sx+i*20+4,sy-2,6,4);
  if(p.moving){ctx.fillStyle='rgba(160,220,180,0.35)';ctx.fillRect(sx,sy,p.w,4);}
}

// ─── roundRect ────────────────────────────────────────────────────────────────
function roundRect(x,y,w,h,r){
  ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();
}

// ─── DRAW CORVAN (adapted for Phase 2.1 tools) ────────────────────────────────
function drawCorvan(cx,cy,scale=1,flipX=false,frame=0,activeTool=null){
  const S=scale;
  ctx.save();ctx.translate(cx,cy);if(flipX)ctx.scale(-1,1);
  const r=(x,y,w,h,fill,op)=>{ctx.fillStyle=fill;ctx.globalAlpha=op!==undefined?op:1;ctx.fillRect(x*S,y*S,w*S,h*S);ctx.globalAlpha=1;};
  const lb=0.7+Math.sin(frame*0.4)*0.3;
  r(7,3,18,2,'#3a2208');r(9,1,14,4,'#4a2e10');
  r(5,3,22,2,'#5a3a10');
  r(13,0,6,3,'#c89820');r(14,0,4,2,'#ffe060');
  r(9,5,14,9,'#c88050');r(10,6,12,1,'#a86030');
  r(11,8,3,2,'#1a0a04');r(18,8,3,2,'#1a0a04');
  r(12,8,1,1,'#fff');r(19,8,1,1,'#fff');
  r(14,11,4,1,'#a86030');r(12,13,8,1,'#7a3820');
  r(13,14,6,2,'#c88050');
  r(8,16,16,13,'#b82010');r(15,17,2,1,'#8a1008');r(15,20,2,1,'#8a1008');r(15,23,2,1,'#8a1008');
  r(12,16,3,3,'#d03018');r(17,16,3,3,'#d03018');
  r(8,28,16,2,'#5a3010');r(14,28,4,2,'#c88020');
  r(9,30,14,12,'#6a4820');r(15,36,2,6,'#5a3810');
  r(3,16,5,12,'#b82010');r(3,28,5,3,'#a86030');
  r(24,16,5,12,'#b82010');r(24,28,5,3,'#a86030');
  r(9,42,6,4,'#3a1e08');r(17,42,6,4,'#3a1e08');
  r(8,44,8,2,'#2a1008');r(16,44,8,2,'#2a1008');
  ctx.fillStyle='#ffe060';ctx.globalAlpha=0.25*lb;ctx.beginPath();ctx.arc(16*S,1*S,4*S,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=1;
  _drawCorvanTools(activeTool,S,frame,lb);
  ctx.restore();
}

// ─── ITEM DRAW FUNCTIONS ──────────────────────────────────────────────────────
function drawPicareta(cx,cy,bobT=0){
  ctx.save();ctx.translate(cx,cy+Math.sin(bobT)*5);
  ctx.fillStyle='#8a5820';ctx.fillRect(-3,-24,6,28);
  ctx.fillStyle='#aa7030';ctx.fillRect(-2,-22,4,24);
  ctx.fillStyle='#9090a8';ctx.fillRect(-14,-26,28,8);
  ctx.fillStyle='#b0b0c8';ctx.fillRect(-14,-26,28,3);
  ctx.fillStyle='#c0c0d8';ctx.fillRect(-16,-24,4,6);ctx.fillRect(12,-24,4,6);
  ctx.fillStyle='rgba(255,255,255,0.5)';ctx.beginPath();ctx.arc(-12,-22,2,0,Math.PI*2);ctx.fill();
  const gg=ctx.createRadialGradient(0,-22,0,0,-22,18);
  gg.addColorStop(0,'rgba(180,180,220,0.2)');gg.addColorStop(1,'rgba(180,180,220,0)');
  ctx.fillStyle=gg;ctx.beginPath();ctx.arc(0,-22,18,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

function drawBateia(cx,cy,bobT=0){
  ctx.save();ctx.translate(cx,cy+Math.sin(bobT)*5);
  const glow=ctx.createRadialGradient(0,0,0,0,0,24);
  glow.addColorStop(0,'rgba(160,130,80,0.3)');glow.addColorStop(1,'rgba(140,110,60,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,24,0,Math.PI*2);ctx.fill();
  // Pan body
  ctx.fillStyle='#8a6840';
  ctx.beginPath();ctx.ellipse(0,0,20,11,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#6a4820';
  ctx.beginPath();ctx.ellipse(0,-2,14,7,0,0,Math.PI*2);ctx.fill();
  // Water in pan
  ctx.fillStyle='rgba(160,210,240,0.45)';
  ctx.beginPath();ctx.ellipse(-1,-3,9,4.5,0.2,0,Math.PI*2);ctx.fill();
  // Handle
  ctx.fillStyle='#9a7030';
  ctx.fillRect(16,-3,14,6);ctx.fillRect(28,-4,4,8);
  ctx.restore();
}

function drawOuro(cx,cy,bobT=0){
  ctx.save();ctx.translate(cx,cy+Math.sin(bobT)*5);
  const glow=ctx.createRadialGradient(0,0,0,0,0,26);
  glow.addColorStop(0,'rgba(255,210,50,0.55)');glow.addColorStop(1,'rgba(255,200,40,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,26,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#c89820';
  ctx.beginPath();ctx.moveTo(-8,-10);ctx.lineTo(4,-14);ctx.lineTo(14,-4);
  ctx.lineTo(12,6);ctx.lineTo(2,12);ctx.lineTo(-8,8);ctx.lineTo(-12,-2);ctx.closePath();ctx.fill();
  ctx.fillStyle='#f0c840';
  ctx.beginPath();ctx.moveTo(-6,-8);ctx.lineTo(2,-12);ctx.lineTo(10,-4);ctx.lineTo(8,4);ctx.lineTo(-2,8);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.7)';ctx.beginPath();ctx.ellipse(-3,-5,3.5,2.5,0.5,0,Math.PI*2);ctx.fill();
  const sa=Math.abs(Math.sin(Date.now()/450));
  ctx.strokeStyle=`rgba(255,225,80,${sa*0.9})`;ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(6,-8);ctx.lineTo(10,-13);ctx.stroke();
  ctx.restore();
}

function drawPirita(cx,cy,bobT=0){
  ctx.save();ctx.translate(cx,cy+Math.sin(bobT)*5);
  const glow=ctx.createRadialGradient(0,0,0,0,0,20);
  glow.addColorStop(0,'rgba(185,185,50,0.3)');glow.addColorStop(1,'rgba(185,185,50,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,20,0,Math.PI*2);ctx.fill();
  // Cubic pyrite — geometric/angular
  ctx.fillStyle='#aaaa20';
  ctx.beginPath();ctx.moveTo(-10,-12);ctx.lineTo(10,-12);ctx.lineTo(14,-4);
  ctx.lineTo(10,8);ctx.lineTo(-6,10);ctx.lineTo(-14,0);ctx.closePath();ctx.fill();
  ctx.fillStyle='#c0c030';
  ctx.beginPath();ctx.moveTo(-8,-10);ctx.lineTo(8,-10);ctx.lineTo(10,-4);ctx.lineTo(-6,6);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(200,200,60,0.5)';ctx.beginPath();ctx.ellipse(-2,-4,4,3,0.4,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

function drawPedraDeToque(cx,cy,bobT=0){
  ctx.save();ctx.translate(cx,cy+Math.sin(bobT)*5);
  // Glow externo — aura dourada pulsante
  const pulse=0.18+Math.abs(Math.sin(bobT*0.9))*0.18;
  const glow=ctx.createRadialGradient(0,0,0,0,0,28);
  glow.addColorStop(0,`rgba(200,160,30,${pulse})`);
  glow.addColorStop(1,'rgba(160,120,10,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,28,0,Math.PI*2);ctx.fill();
  // Sombra base
  ctx.fillStyle='rgba(0,0,0,0.25)';
  ctx.beginPath();ctx.ellipse(0,10,16,5,0,0,Math.PI*2);ctx.fill();
  // Corpo da pedra — forma irregular escura (basalto negro)
  ctx.fillStyle='#18140c';
  ctx.beginPath();
  ctx.moveTo(-15,-8);ctx.lineTo(-8,-14);ctx.lineTo(4,-16);ctx.lineTo(15,-10);
  ctx.lineTo(17,3);ctx.lineTo(10,10);ctx.lineTo(-6,11);ctx.lineTo(-16,4);
  ctx.closePath();ctx.fill();
  // Face superior com textura granulada
  ctx.fillStyle='#2a2418';
  ctx.beginPath();
  ctx.moveTo(-13,-7);ctx.lineTo(-6,-12);ctx.lineTo(4,-14);ctx.lineTo(13,-9);
  ctx.lineTo(14,1);ctx.lineTo(8,7);ctx.lineTo(-5,8);ctx.lineTo(-13,3);
  ctx.closePath();ctx.fill();
  // Reflexo mineral na superfície
  ctx.fillStyle='rgba(80,70,55,0.6)';
  ctx.beginPath();ctx.ellipse(-4,-5,5,3,-0.4,0,Math.PI*2);ctx.fill();
  // Riscos de teste — traço dourado (ouro puro) já feito
  ctx.strokeStyle='rgba(225,185,40,0.95)';ctx.lineWidth=2.2;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(-8,0);ctx.lineTo(8,2);ctx.stroke();
  // Segundo traço — resultado prateado (prata)
  ctx.strokeStyle='rgba(180,190,210,0.8)';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(-7,4);ctx.lineTo(5,5);ctx.stroke();
  // Micro-brilhos na superfície
  const sa=0.4+Math.abs(Math.sin(bobT*1.3))*0.5;
  ctx.fillStyle=`rgba(255,230,100,${sa})`;
  ctx.beginPath();ctx.arc(-5,-3,1.5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=`rgba(255,230,100,${sa*0.6})`;
  ctx.beginPath();ctx.arc(7,-1,1,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

function drawPlaca(cx,cy,bobT=0){
  ctx.save();ctx.translate(cx,cy+Math.sin(bobT)*5);
  const glow=ctx.createRadialGradient(0,0,0,0,0,24);
  glow.addColorStop(0,'rgba(165,120,60,0.35)');glow.addColorStop(1,'rgba(140,100,40,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,24,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#8a5020';ctx.fillRect(-16,-14,32,28);
  ctx.fillStyle='#a86030';ctx.fillRect(-16,-14,32,6);
  ctx.fillStyle='rgba(255,225,160,0.8)';
  ctx.fillRect(-11,-4,22,2);ctx.fillRect(-11,2,16,2);ctx.fillRect(-11,8,19,2);
  ctx.fillStyle='#5a3010';
  ctx.beginPath();ctx.arc(-12,-12,2,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(12,-12,2,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(-12,12,2,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(12,12,2,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

function drawQuartzoItem(cx,cy,bobT=0){
  ctx.save();ctx.translate(cx,cy+Math.sin(bobT)*5);
  const glow=ctx.createRadialGradient(0,0,0,0,0,22);
  glow.addColorStop(0,'rgba(240,235,220,0.4)');glow.addColorStop(1,'rgba(240,235,220,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,22,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#e0dcd0';
  ctx.beginPath();ctx.moveTo(-8,-14);ctx.lineTo(0,-18);ctx.lineTo(10,-10);
  ctx.lineTo(12,4);ctx.lineTo(4,12);ctx.lineTo(-8,8);ctx.lineTo(-10,-4);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(255,225,80,0.7)';
  ctx.beginPath();ctx.arc(-2,-4,3,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(5,2,2,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

// ─── GRIZZLY BEAR NPC ─────────────────────────────────────────────────────────
function drawGrizzly(cx,cy,frame=0){
  ctx.save();ctx.translate(cx,cy);
  const bob=Math.sin(frame*0.7)*2.5;
  const S=1; // escala base

  // Sombra no chão
  ctx.fillStyle='rgba(0,0,0,0.22)';
  ctx.beginPath();ctx.ellipse(0,22,34,8,0,0,Math.PI*2);ctx.fill();

  // === PATAS TRASEIRAS ===
  ctx.fillStyle='#3e2e1c';
  ctx.beginPath();ctx.ellipse(-16,20,9,12,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(16,20,9,12,0,0,Math.PI*2);ctx.fill();
  // garras traseiras
  ctx.fillStyle='#1a120a';
  for(let g=-1;g<=1;g++){
    ctx.beginPath();ctx.ellipse(-16+g*5,30,2.5,3.5,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(16+g*5,30,2.5,3.5,0,0,Math.PI*2);ctx.fill();
  }

  // === CORPO PRINCIPAL ===
  // camada de pelo mais escura (fundo)
  ctx.fillStyle='#3e2e1c';
  ctx.beginPath();ctx.ellipse(0,-2,32,28,0,0,Math.PI*2);ctx.fill();
  // pelo médio
  ctx.fillStyle='#5a4230';
  ctx.beginPath();ctx.ellipse(0,-4,28,24,0,0,Math.PI*2);ctx.fill();
  // destaque dorsal (pelo mais claro no topo — típico do grizzly)
  ctx.fillStyle='#7a6248';
  ctx.beginPath();ctx.ellipse(0,-14,22,12,0,0,Math.PI*2);ctx.fill();

  // === CORCOVA DO OMBRO (característica do grizzly) ===
  ctx.fillStyle='#4e3824';
  ctx.beginPath();ctx.ellipse(0,-22,26,14,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#6a5240';
  ctx.beginPath();ctx.ellipse(0,-24,20,10,0,0,Math.PI*2);ctx.fill();
  // pelo prateado na corcova (grizzly = "grisalho")
  ctx.fillStyle='rgba(180,165,140,0.35)';
  ctx.beginPath();ctx.ellipse(2,-26,14,7,-0.2,0,Math.PI*2);ctx.fill();

  // === PATAS DIANTEIRAS ===
  ctx.fillStyle='#4a3420';
  ctx.beginPath();ctx.ellipse(-28,-4,9,14,-0.2,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(28,-4,9,14,0.2,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#3a2818';
  ctx.beginPath();ctx.ellipse(-29,8,8,6,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(29,8,8,6,0,0,Math.PI*2);ctx.fill();
  // garras dianteiras
  ctx.fillStyle='#1a120a';
  for(let g=-1;g<=1;g++){
    ctx.beginPath();ctx.ellipse(-29+g*5,14,2.5,4,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(29+g*5,14,2.5,4,0,0,Math.PI*2);ctx.fill();
  }

  // === TEXTURA DE PELO (linhas) ===
  ctx.strokeStyle='rgba(30,20,10,0.22)';ctx.lineWidth=1.2;
  for(let i=0;i<7;i++){
    const x=-24+i*8;
    ctx.beginPath();ctx.moveTo(x,-18);ctx.quadraticCurveTo(x+2,-2,x-1,14);ctx.stroke();
  }
  // Pelos laterais mais claros
  ctx.strokeStyle='rgba(130,100,70,0.18)';ctx.lineWidth=1;
  for(let i=0;i<4;i++){
    ctx.beginPath();ctx.moveTo(-20+i*12,-8);ctx.lineTo(-18+i*12,6);ctx.stroke();
  }

  // === CABEÇA ===
  // pescoço
  ctx.fillStyle='#4e3824';
  ctx.beginPath();ctx.ellipse(0,-34+bob,18,10,0,0,Math.PI*2);ctx.fill();
  // cabeça principal
  ctx.fillStyle='#5a4230';
  ctx.beginPath();ctx.ellipse(0,-50+bob,24,20,0,0,Math.PI*2);ctx.fill();
  // fronte mais escura
  ctx.fillStyle='#3e2e1c';
  ctx.beginPath();ctx.ellipse(0,-56+bob,18,10,0,0,Math.PI*2);ctx.fill();
  // focinho protuberante
  ctx.fillStyle='#6a5238';
  ctx.beginPath();ctx.ellipse(0,-44+bob,16,11,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#7a6248';
  ctx.beginPath();ctx.ellipse(0,-46+bob,12,7,0,0,Math.PI*2);ctx.fill();

  // === ORELHAS ===
  ctx.fillStyle='#4a3420';
  ctx.beginPath();ctx.ellipse(-18,-66+bob,10,9,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(18,-66+bob,10,9,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#7a5858';
  ctx.beginPath();ctx.ellipse(-18,-66+bob,6,5,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(18,-66+bob,6,5,0,0,Math.PI*2);ctx.fill();

  // === OLHOS ===
  ctx.fillStyle='#0a0806';
  ctx.beginPath();ctx.ellipse(-10,-54+bob,5,5,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(10,-54+bob,5,5,0,0,Math.PI*2);ctx.fill();
  // íris âmbar
  ctx.fillStyle='#8a5a10';
  ctx.beginPath();ctx.ellipse(-10,-54+bob,3,3,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(10,-54+bob,3,3,0,0,Math.PI*2);ctx.fill();
  // pupila
  ctx.fillStyle='#050404';
  ctx.beginPath();ctx.ellipse(-10,-54+bob,1.5,2,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(10,-54+bob,1.5,2,0,0,Math.PI*2);ctx.fill();
  // brilho
  ctx.fillStyle='rgba(255,255,255,0.6)';
  ctx.beginPath();ctx.arc(-8,-56+bob,1.5,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(12,-56+bob,1.5,0,Math.PI*2);ctx.fill();

  // === NARIZ ===
  ctx.fillStyle='#180e06';
  ctx.beginPath();ctx.ellipse(0,-38+bob,8,5,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(80,50,30,0.4)';
  ctx.beginPath();ctx.ellipse(-2,-37+bob,3,2,0,0,Math.PI*2);ctx.fill();

  // === BOCA / SORRISO LEVEMENTE ABERTA ===
  ctx.strokeStyle='#0e0806';ctx.lineWidth=2;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(-7,-33+bob);ctx.quadraticCurveTo(0,-30+bob,7,-33+bob);ctx.stroke();

  // === ESTRELA CALIFORNIA (referência à bandeira) ===
  const starX=4,starY=-10+bob;
  const glowS=ctx.createRadialGradient(starX,starY,0,starX,starY,12);
  glowS.addColorStop(0,'rgba(220,60,20,0.3)');glowS.addColorStop(1,'rgba(220,60,20,0)');
  ctx.fillStyle=glowS;ctx.beginPath();ctx.arc(starX,starY,12,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#c83010';
  ctx.beginPath();
  for(let i=0;i<5;i++){
    const a=i*Math.PI*2/5-Math.PI/2,ao=a+Math.PI/5;
    ctx.lineTo(starX+Math.cos(a)*9,starY+Math.sin(a)*9);
    ctx.lineTo(starX+Math.cos(ao)*3.5,starY+Math.sin(ao)*3.5);
  }
  ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(255,100,60,0.4)';
  ctx.beginPath();
  for(let i=0;i<5;i++){
    const a=i*Math.PI*2/5-Math.PI/2,ao=a+Math.PI/5;
    ctx.lineTo(starX+Math.cos(a)*9,starY+Math.sin(a)*9);
    ctx.lineTo(starX+Math.cos(ao)*3.5,starY+Math.sin(ao)*3.5);
  }
  ctx.closePath();
  ctx.fillStyle='rgba(255,140,80,0.25)';ctx.fill();

  ctx.restore();
}

// ─── QUARTZ VEIN (examinar, não minerar) ──────────────────────────────────────
class QuartzVein{
  constructor(x,y){this.x=x;this.y=y;this.examined=false;this.glowT=0;}
  tick(){this.glowT+=0.04;}
  examine(){
    if(!this.examined){this.examined=true;sfx('ouro');burst(this.x,this.y-10,'#f0d060',10,2.5);}
  }
  draw(){
    const sx=this.x-cam.x,sy=this.y-cam.y;
    if(sx<-80||sx>W+80)return;
    const a=this.examined?0.35:(0.5+Math.abs(Math.sin(this.glowT))*0.45);
    // Quartz body — milky white irregular mass
    ctx.fillStyle=`rgba(240,236,225,${a})`;
    ctx.beginPath();ctx.moveTo(sx-22,sy-8);ctx.lineTo(sx-8,sy-18);ctx.lineTo(sx+12,sy-12);
    ctx.lineTo(sx+22,sy+6);ctx.lineTo(sx+10,sy+14);ctx.lineTo(sx-10,sy+12);ctx.lineTo(sx-20,sy+4);ctx.closePath();ctx.fill();
    // Gold specks in quartz
    const ga=this.examined?0.5:(a*0.8);
    ctx.fillStyle=`rgba(225,185,45,${ga})`;
    ctx.beginPath();ctx.arc(sx-3,sy-4,3.5,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(sx+8,sy+2,2.5,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(sx-8,sy+5,2,0,Math.PI*2);ctx.fill();
    if(!this.examined){
      const ha=0.5+Math.sin(Date.now()/400)*0.5;
      ctx.fillStyle=`rgba(255,220,80,${ha*0.8})`;ctx.font='bold 12px "Courier New"';
      ctx.textAlign='center';ctx.fillText('[E] Examinar Veio',sx,sy-28);ctx.textAlign='left';
    } else {
      ctx.fillStyle='rgba(180,160,100,0.55)';ctx.font='11px "Courier New"';
      ctx.textAlign='center';ctx.fillText('✔ Examinado',sx,sy-26);ctx.textAlign='left';
    }
  }
}

// ─── PAN SPOT ─────────────────────────────────────────────────────────────────
class PanSpot{
  constructor(x,y,type){this.x=x;this.y=y;this.type=type;this.done=false;this.t=Math.random()*Math.PI*2;}
  tick(){if(!this.done)this.t+=0.05;}
  draw(){
    if(this.done)return;
    const sx=this.x-cam.x,sy=this.y-cam.y;
    if(sx<-80||sx>W+80)return;
    const a=0.45+Math.abs(Math.sin(this.t))*0.5;
    const isPlaca=this.type==='placa_reivindicacao';
    const col=isPlaca?`rgba(180,140,80,${a})`:`rgba(220,190,55,${a*0.85})`;
    // Ripple in river
    ctx.strokeStyle=col;ctx.lineWidth=1.5;
    ctx.beginPath();ctx.arc(sx,sy,18+Math.sin(this.t)*4,0,Math.PI*2);ctx.stroke();
    ctx.beginPath();ctx.arc(sx,sy,28+Math.sin(this.t+1)*5,0,Math.PI*2);ctx.stroke();
    // Sparkle
    ctx.fillStyle=col;ctx.beginPath();ctx.arc(sx,sy,7+Math.sin(this.t)*2,0,Math.PI*2);ctx.fill();
    const ha=0.5+Math.sin(Date.now()/350)*0.5;
    ctx.fillStyle=`rgba(255,220,80,${ha*0.8})`;ctx.font='bold 12px "Courier New"';
    ctx.textAlign='center';ctx.fillText('[E] Garimpar',sx,sy-28);ctx.textAlign='left';
  }
}

// ─── COL (floating collectible) ───────────────────────────────────────────────
class Col{
  constructor(x,y,type){this.x=x;this.y=y;this.w=34;this.h=34;this.type=type;this.done=false;this.t=Math.random()*Math.PI*2;}
  tick(){if(!this.done)this.t+=0.06;}
  draw(playerX,playerY){
    if(this.done)return;
    const sx=this.x-cam.x,sy=this.y-cam.y;
    if(sx<-60||sx>W+60)return;
    const TOOL_TYPES=['bateia','picareta','pedra_de_toque'];
    const isTool=TOOL_TYPES.includes(this.type);
    if(isTool){
      const a=0.3+Math.abs(Math.sin(this.t*0.8))*0.5;
      const glow=ctx.createRadialGradient(sx+17,sy+17,4,sx+17,sy+17,32);
      glow.addColorStop(0,`rgba(255,220,80,${a})`);glow.addColorStop(1,'rgba(255,200,50,0)');
      ctx.fillStyle=glow;ctx.fillRect(sx-15,sy-15,64,64);
    }
    ctx.save();ctx.translate(sx+this.w/2,sy+this.h/2);
    if(this.type==='picareta')   drawPicareta(0,0,this.t);
    else if(this.type==='bateia')drawBateia(0,0,this.t);
    else if(this.type==='pedra_de_toque')drawPedraDeToque(0,0,this.t);
    else if(this.type==='ouro')  drawOuro(0,0,this.t);
    else if(this.type==='quartzo_aureo')drawQuartzoItem(0,0,this.t);
    ctx.restore();
    if(isTool&&playerX!==undefined){
      const dist=Math.hypot(playerX+20-(this.x+17),playerY+40-(this.y+17));
      if(dist<110){
        const label=this.type==='bateia'?'🥣 Bateia':this.type==='pedra_de_toque'?'🪨 Pedra de Toque':'⛏ Picareta';
        const txt=`[E] Pegar ${label}`;
        const pulse=0.7+Math.sin(Date.now()/300)*0.3;
        ctx.font='bold 13px "Courier New"';
        const tw=ctx.measureText(txt).width+20;
        const bx=sx+17-tw/2,by=sy-42;
        ctx.fillStyle=`rgba(8,4,0,${0.88*pulse})`;roundRect(bx,by,tw,24,5);ctx.fill();
        ctx.strokeStyle=`rgba(220,185,80,${pulse})`;ctx.lineWidth=1.5;roundRect(bx,by,tw,24,5);ctx.stroke();
        ctx.fillStyle=`rgba(8,4,0,${0.88*pulse})`;
        ctx.beginPath();ctx.moveTo(sx+10,by+24);ctx.lineTo(sx+24,by+24);ctx.lineTo(sx+17,by+32);ctx.closePath();ctx.fill();
        ctx.strokeStyle=`rgba(220,185,80,${pulse})`;ctx.lineWidth=1.5;
        ctx.beginPath();ctx.moveTo(sx+10,by+24);ctx.lineTo(sx+17,by+32);ctx.lineTo(sx+24,by+24);ctx.stroke();
        ctx.fillStyle=`rgba(240,200,60,${pulse})`;
        ctx.textAlign='center';ctx.fillText(txt,sx+17,by+16);ctx.textAlign='left';
      }
    }
  }
}

// ─── TRIGGER ─────────────────────────────────────────────────────────────────
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

// ─── DIALOG BUBBLE ───────────────────────────────────────────────────────────
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
    const faceW=60,faceH=76,facePad=12;
    const lineH=24,pad=20,textW=480;
    const bubW=facePad+faceW+facePad+textW+pad;
    const bubH=Math.max(faceH+pad*2,this.lines.length*lineH+70)+pad;
    const pcx=player.x-cam.x+player.w/2,pcy=player.y-cam.y;
    let bx=Math.max(10,Math.min(pcx-bubW/2,W-bubW-10)),by=Math.max(10,pcy-bubH-32);
    ctx.shadowColor='rgba(0,0,0,0.6)';ctx.shadowBlur=14;
    ctx.fillStyle='rgba(8,4,0,0.96)';roundRect(bx,by,bubW,bubH,14);ctx.fill();
    ctx.shadowBlur=0;
    ctx.strokeStyle=this.speakerColor;ctx.lineWidth=2.5;roundRect(bx,by,bubW,bubH,14);ctx.stroke();
    ctx.strokeStyle='rgba(200,160,40,0.2)';ctx.lineWidth=1;roundRect(bx+4,by+4,bubW-8,bubH-8,10);ctx.stroke();
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

// ─── POPUP & NOTIF ────────────────────────────────────────────────────────────
let popup={active:false,timer:0,title:'',lines:[],color:'#c0c8d8'};
function showPopup(title,lines,color,ms=6500){popup={active:true,timer:ms,title,lines,color};}
function tickPopup(){if(popup.active&&popup.timer>0){popup.timer-=16;if(popup.timer<=0)popup.active=false;}}
function drawPopup(){
  if(!popup.active)return;
  const al=Math.min(1,popup.timer/400);ctx.save();ctx.globalAlpha=al;
  const pw=340,lineH=20,ph=popup.lines.length*lineH+80;
  const px=W-pw-18,py=56;
  ctx.fillStyle='rgba(8,4,0,0.94)';roundRect(px,py,pw,ph,10);ctx.fill();
  ctx.strokeStyle=popup.color;ctx.lineWidth=2;roundRect(px,py,pw,ph,10);ctx.stroke();
  ctx.strokeStyle='rgba(200,200,220,0.2)';ctx.lineWidth=1;roundRect(px+4,py+4,pw-8,ph-8,7);ctx.stroke();
  ctx.font='bold 13px "Courier New"';ctx.fillStyle=popup.color;ctx.textAlign='center';ctx.fillText(popup.title,px+pw/2,py+22);
  ctx.fillStyle='rgba(255,255,255,0.12)';ctx.fillRect(px+14,py+30,pw-28,1);
  ctx.font='12px "Courier New"';ctx.fillStyle='#e8e0d0';
  popup.lines.forEach((l,i)=>{ctx.textAlign='left';ctx.fillText('• '+l,px+16,py+48+i*lineH);});
  ctx.textAlign='left';ctx.restore();
}

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

// ─── PLAYER ───────────────────────────────────────────────────────────────────
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

    if(!this.inv){
      for(const p of level.plats){if(p.type==='spike'&&this.overlaps(p))this._hurt(2,level,'rocha');}
    }
    if(this.inv>0)this.inv--;if(this.interactAnim>0)this.interactAnim--;

    // Auto-collect floating minerals
    const TOOL_TYPES=['bateia','picareta','pedra_de_toque'];
    for(const c of level.cols){
      if(c.done||TOOL_TYPES.includes(c.type))continue;
      if(!this.overlaps(c))continue;
      c.done=true;
      if(c.type==='ouro'){
        this.score+=25;sfx('ouro');
        burst(c.x+17,c.y+17,'#f0d060',10,3);
        if(!this.items.includes('ouro_ok')){
          this.items.push('ouro_ok');journalCollect('ouro_pepita');
          showPopup('◎ PEPITA DE OURO',['Formada há 120 mi anos por fluidos hidrotermais','É o metal mais maleável da natureza','1g forma fio de 3km ou folha translúcida','Densidade: 19,3 g/cm³ — 7x a da água'],'#e0c040');
        }
        const cnt=this.items.filter(i=>i==='ouro_pepita').length;
        this.items.push('ouro_pepita');
        notify(`◎ Pepita de ouro coletada!`);
      } else if(c.type==='quartzo_aureo'){
        this.score+=15;sfx('ouro');
        burst(c.x+17,c.y+17,'#e0d8b0',8,2.5);
        if(!this.items.includes('quartzo_ok')){
          this.items.push('quartzo_ok');journalCollect('quartzo_aureo');
          showPopup('◈ QUARTZO AURÍFERO',['Veios da "Mother Lode" — 200 km de quartzo','Formados por atividade magmática há 120 mi a','A erosão fluvial libera pepitas do quartzo','Base geológica da Corrida do Ouro de 1849'],'#d8d0a0');
        }
        notify('◈ Quartzo aurífero coletado!');
      }
    }

    if(isE()){
      // Collect tools
      for(const c of level.cols){
        if(c.done||!TOOL_TYPES.includes(c.type))continue;
        if(!this.near({x:c.x,y:c.y,w:c.w,h:c.h},90))continue;
        c.done=true;
        if(c.type==='bateia'){
          this.items.push('bateia');this.activeTools.add('bateia');sfx('item');burst(c.x+17,c.y+17,'#c0a860',12);
          journalCollect('bateia');
          showPopup('🥣 BATEIA COLETADA',['Separação por densidade: ouro submerge','Gire em círculos para lavar o sedimento','Ouro: 19,3 g/cm³ vs areia: 2,7 g/cm³','Garimpeiros de 1849 usavam todo o dia'],'#c0a860');
          notify('✦ Bateia coletada! Equipe-a no Diário [I].');
        } else if(c.type==='pedra_de_toque'){
          this.items.push('pedra_de_toque');this.activeTools.add('pedra_de_toque');sfx('item');burst(c.x+17,c.y+17,'#808060',12);
          journalCollect('pedra_de_toque');
          showPopup('🪨 PEDRA DE TOQUE',['Usada por ensaiadores do século XIX','Risque o mineral: traço dourado = ouro','Traço esverdeado/escuro = pirita!','Custo: $0. Precisão: impressionante.'],'#909080');
          notify('✦ Pedra de Toque coletada!');
        } else if(c.type==='picareta'){
          this.items.push('picareta');sfx('item');
          notify('✦ Picareta obtida!');
        }
        break;
      }

      // Examine quartz veins
      if(level.veins){
        for(const v of level.veins){
          if(!v.examined&&this.near({x:v.x-28,y:v.y-28,w:56,h:56})){
            if(!G.dialog){
              v.examine();
              const cnt=level.veins.filter(vv=>vv.examined).length;
              const tot=level.veins.length;
              if(cnt===1)showPopup('◈ VEIO DE QUARTZO',['O ouro se formou há 120 mi de anos','Fluidos hidrotermais infiltraram fissuras','A erosão dos rios liberou as pepitas','É por isso que garimpamos no leito fluvial!'],'#e0d8a0');
              if(cnt===tot&&!level._veinsDialogDone){
                level._veinsDialogDone=true;
                showDialog([
                  '"Cada veio de quartzo branco que vejo aqui tem motas douradas — é a Mother Lode, o cinturão aurífero de 200km que percorre a Sierra Nevada."',
                  '"O ouro não surge solto. Há 120 milhões de anos, fluidos hidrotermais empurrados por magma infiltraram fissuras no quartzo. A erosão ao longo dos milênios é que carregou os fragmentos até este leito do rio."',
                  '"Com a bateia, posso separar o ouro do sedimento usando a diferença de densidade. O ouro é 7 vezes mais denso que a água — ele sempre fica no fundo!"',
                ],(()=>{notify('✦ Vá para o leito do rio e use a bateia!');level.triggers[0].done=false;}),'CORVAN','#e0b840');
              }
              notify(`◈ Veio examinado! (${cnt}/${tot})`);
            }
            break;
          }
        }
      }

      // Pan spots (Level 3)
      if(level.panSpots){
        for(const ps of level.panSpots){
          if(ps.done||!this.near({x:ps.x-20,y:ps.y-20,w:40,h:40},70))continue;
          if(!this.items.includes('bateia')){notify('Equipe a Bateia no Diário [I] primeiro!');break;}
          if(!this.activeTools.has('bateia')){notify('Equipe a Bateia no Diário [I]!');break;}
          ps.done=true;sfx('pan');
          burst(ps.x,ps.y,'#80b8d0',8,2.5);
          if(ps.type==='pirita'){
            // Test with touchstone
            if(this.items.includes('pedra_de_toque')){
              sfx('pirita');burst(ps.x,ps.y,'#909040',10,2);
              showPopup('⚠ PIRITA — OURO DE TOLO!',['A Pedra de Toque revelou traço esverdeado','Pirita (FeS₂) tem cor similar ao ouro','Mas é mais frágil, mais leve e frágil','Traço no pedra = esverdeado/escuro. Descartada!'],'#aaa040',7000);
              notify('⚠ Era pirita! Testada e descartada pela Pedra de Toque.');
            } else {
              // Shouldn't reach here in normal flow
              this.items.push('pirita_tmp');
              notify('⚠ Mineral coletado — precisa de teste!');
            }
          } else if(ps.type==='ouro'){
            this.items.push('ouro_pepita');this.score+=30;sfx('ouro');
            burst(ps.x,ps.y,'#f0d060',14,3.5);
            const cnt=this.items.filter(i=>i==='ouro_pepita').length;
            if(!this.items.includes('ouro_ok')){this.items.push('ouro_ok');journalCollect('ouro_pepita');}
            showPopup('◎ PEPITA DE OURO',['Ouro puro — traço dourado na Pedra de Toque','Densidade de 19,3 g/cm³ confirma pureza','Formado em veio de quartzo há 120 mi de anos','Garimpeiro do século XIX estaria orgulhoso!'],'#e0c040',5000);
            notify(`◎ Ouro coletado! (${cnt}/3)`);
          } else if(ps.type==='placa_reivindicacao'){
            this.items.push('placa_reivindicacao');this.score+=60;sfx('unlock');
            burst(ps.x,ps.y,'#c0a060',16,3);
            journalCollect('placa_reivindicacao');this.interactAnim=40;
            showDialog([
              '"Uma Placa de Reivindicação de Mineração! J. W. Garrett, 1849. Um garimpeiro dos \'49ers\' registrava seu \'claim\' em cartório para garantir direito exclusivo de garimpar aquela área."',
              '"O sistema de claims foi a primeira lei de propriedade que os EUA criaram às pressas para gerir a Corrida do Ouro. Tornou-se a base da legislação de recursos naturais americana."',
              '"Mas havia um lado sombrio: os povos Miwok e Nisenan, que viviam aqui há milênios, foram sistematicamente expulsos. A lei protegia o claim do garimpeiro, mas não os direitos dos povos originários."',
            ],null,'CORVAN','#e0b840');
          }
          break;
        }
      }

      // Grizzly NPC interaction
      if(level.grizzly&&!level.grizzly.gifted&&this.near({x:level.grizzly.x-60,y:level.grizzly.y-80,w:120,h:80})){
        level.grizzly.gifted=true;sfx('item');
        for(let i=0;i<14;i++)burst(level.grizzly.x,level.grizzly.y-40,'#909060',1,2+Math.random()*2);
        this.items.push('pedra_de_toque');this.activeTools.add('pedra_de_toque');journalCollect('pedra_de_toque');
        showDialog([
          '"Um Grizzly da Califórnia! Este urso está extinto desde 1922 — foi caçado até o desaparecimento durante a Corrida do Ouro. Só sobrevive na bandeira estadual da Califórnia."',
          '"Ele me deixou uma Pedra de Toque — os ensaiadores do século XIX usavam essa pedra escura para testar o ouro: ao riscar, o ouro deixa traço dourado, a pirita deixa traço esverdeado-escuro."',
          '"No leito do American River vou encontrar tanto ouro quanto pirita. Preciso da Pedra de Toque para não ser enganado pelo \'ouro de tolo\'! Vamos garimpar!"',
        ],null,'CORVAN','#e0b840');
      }

      // Placa da Reivindicação NPC object (Cena 3 direct object)
      if(level.placaObj&&!level.placaObj.done&&this.near({x:level.placaObj.x-40,y:level.placaObj.y-40,w:80,h:40})){
        level.placaObj.done=true;this.items.push('placa_reivindicacao');this.score+=60;sfx('unlock');
        burst(level.placaObj.x,level.placaObj.y,'#c0a060',16,3);
        journalCollect('placa_reivindicacao');this.interactAnim=40;
        showDialog([
          '"Uma Placa de Reivindicação de Mineração! J. W. Garrett, 1849. Um garimpeiro dos \'49ers\' registrava seu \'claim\' em cartório para garantir o direito exclusivo de garimpar aquela área."',
          '"Este sistema foi a primeira lei de recursos naturais que os EUA criaram às pressas para gerir a Corrida do Ouro. Tornou-se a base da legislação americana de propriedade."',
          '"Mas havia um lado sombrio: os povos Miwok e Nisenan, que viviam aqui há milênios, foram sistematicamente expulsos. A lei protegia o claim do garimpeiro, mas não os povos originários."',
        ],null,'CORVAN','#e0b840');
      }

      for(const t of level.triggers){if(!t.done&&this.near(t)){t.fn(this,level);break;}}
    }

    if(this.y>level.H+200)this._hurt(3,level,'queda');
    if(!this.onG&&this.vy<0)this.state='jump';
    else if(!this.onG&&this.vy>0)this.state='fall';
    else if(Math.abs(this.vx)>0.5)this.state='run';
    else this.state='idle';
    if(Math.abs(this.vx)>0.5)this.walkT+=0.18;
  }

  _colX(plats){
    const STEP=6;
    for(const p of plats){if(p.type==='spike'||p.type==='_dead')continue;
      if(this.overlaps(p)){
        if(this.y+this.h*0.5<=p.y)continue;
        const stepUp=p.y-(this.y+this.h);
        if(this.onG&&stepUp>-STEP&&stepUp<=0){this.y=p.y-this.h;}
        else{if(this.vx>0)this.x=p.x-this.w;else this.x=p.x+p.w;this.vx=0;}
      }
    }
  }
  _colY(plats){for(const p of plats){if(p.type==='spike'||p.type==='_dead')continue;
    if(p.type==='trapdoor'&&this.vy<0)continue;
    if(this.overlaps(p)){
      if(this.vy>=0){this.y=p.y-this.h;this.vy=0;this.onG=true;if(p.moving)this.onMoving=p;if(p.type==='trapdoor'&&p.crumble===undefined)p.crumble=70;}
      else{this.y=p.y+p.h;this.vy=Math.abs(this.vy)*0.2;}}}}
  _hurt(dmg,level,cause='queda'){if(this.inv>0)return;this.hp-=dmg;this.inv=80;burst(this.x+20,this.y+40,'#ff4040',10);sfx('hit');if(this.hp<=0){this.hp=0;this.dead=true;this.deathCause=cause;}}

  draw(){
    if(this.dead)return;
    const S=1.5,FOOT_Y=46*S;
    const dx=this.x-cam.x+this.w/2-16*S;
    const dy=this.y-cam.y+this.h-FOOT_Y;
    const flip=this.facing===-1;
    const wf=this.state==='run'?this.walkT:(this.state==='idle'?Date.now()/800:0);
    const _dispTool=this.activeTools.has('pedra_de_toque')?'pedra_de_toque':this.activeTools.has('bateia')?'bateia':this.activeTools.has('picareta')?'picareta':null;
    ctx.save();drawCorvan(dx,dy,S,flip,wf,_dispTool);ctx.restore();
    if(this.inv>0&&Math.floor(this.inv/6)%2===0){ctx.fillStyle='rgba(255,60,60,0.35)';ctx.fillRect(this.x-cam.x,this.y-cam.y,this.w,this.h);}
  }
}

// ─── DRAW UTILITIES ──────────────────────────────────────────────────────────
function drawBg(bgKey){
  const img=IMG[bgKey];
  if(img&&img.complete&&img.naturalWidth>0){
    const sc=Math.max(W/img.naturalWidth,H/img.naturalHeight);
    const iw=img.naturalWidth*sc,ih=img.naturalHeight*sc;
    ctx.drawImage(img,(W-iw)/2,(H-ih)/2,iw,ih);
  } else {
    const fb={bg01:'#0a1a0a',bg02:'#121008',bg03:'#08141a',bg04:'#1a0c04'};
    const grd=ctx.createLinearGradient(0,0,0,H);
    grd.addColorStop(0,fb[bgKey]||'#111');grd.addColorStop(1,'#050308');
    ctx.fillStyle=grd;ctx.fillRect(0,0,W,H);
  }
  ctx.fillStyle='rgba(0,0,0,0.2)';ctx.fillRect(0,0,W,H);
}

let stars=Array.from({length:80},()=>({x:Math.random()*W,y:Math.random()*200,sz:Math.random()<0.2?2:1,br:Math.random()>0.7}));
function drawStars(){
  for(const s of stars){
    const a=0.5+Math.sin(Date.now()/1100+s.x*0.01)*0.5;
    ctx.fillStyle=s.br?`rgba(255,255,255,${a})`:'rgba(180,200,255,0.6)';
    ctx.fillRect(s.x,s.y,s.sz,s.sz);
  }
}

let windP=[];function initWind(){windP=[];for(let i=0;i<30;i++)windP.push({x:Math.random()*W,y:100+Math.random()*300,spd:1+Math.random()*2});}
initWind();
function drawWind(){
  ctx.strokeStyle='rgba(200,220,255,0.12)';ctx.lineWidth=1;
  for(const w of windP){w.x+=w.spd;if(w.x>W)w.x=-100;
    ctx.beginPath();ctx.moveTo(w.x,w.y);ctx.lineTo(w.x+40,w.y+2);ctx.stroke();}
}

// River sparkle particles
let riverP=[];function initRiver(){riverP=[];for(let i=0;i<40;i++)riverP.push({wx:Math.random()*4000,y:Math.random()*80,a:Math.random(),t:Math.random()*Math.PI*2});}
initRiver();
function drawRiver(floorY){
  for(const p of riverP){
    p.t+=0.025;p.a=0.2+Math.sin(p.t)*0.18;
    const sx=p.wx-cam.x;if(sx<-10||sx>W+10)continue;
    ctx.fillStyle=`rgba(120,200,240,${p.a})`;
    ctx.beginPath();ctx.arc(sx,floorY-8+Math.sin(p.t+p.wx)*5,2.5,0,Math.PI*2);ctx.fill();
  }
}

// Draw sign post (Cena 1 decoration)
function drawSignPost(worldX,floorY){
  const sx=worldX-cam.x,sy=floorY-cam.y;
  if(sx<-200||sx>W+200)return;
  ctx.fillStyle='#7a5020';ctx.fillRect(sx-4,sy-140,8,160);  // pole embeds 20px into ground
  ctx.fillStyle='#9a6830';ctx.fillRect(sx-60,sy-140,120,44);
  ctx.fillStyle='#8a5820';ctx.fillRect(sx-60,sy-140,120,5);
  ctx.font='bold 11px "Courier New"';ctx.fillStyle='#f0e0b0';ctx.textAlign='center';
  ctx.fillText('Sacramento Valley',sx,sy-120);
  ctx.fillText('Ouro encontrado aqui!',sx,sy-103);
  ctx.textAlign='left';
}

// ─── HUD ──────────────────────────────────────────────────────────────────────
function drawHUD(player,level){
  ctx.fillStyle='rgba(8,4,0,0.82)';ctx.fillRect(0,0,W,38);
  ctx.fillStyle='rgba(200,160,40,0.18)';ctx.fillRect(0,36,W,2);
  for(let i=0;i<player.maxHp;i++){
    ctx.fillStyle=i<player.hp?'#e07040':'#334';
    ctx.beginPath();const hx=16+i*28,hy=10;
    ctx.arc(hx+5,hy+5,5,Math.PI,0);ctx.arc(hx+15,hy+5,5,Math.PI,0);
    ctx.lineTo(hx+20,hy+5);ctx.bezierCurveTo(hx+20,hy+14,hx+10,hy+18,hx+10,hy+18);
    ctx.bezierCurveTo(hx+10,hy+18,hx,hy+14,hx,hy+5);ctx.closePath();ctx.fill();
  }
  ctx.fillStyle='#c0c8d8';ctx.font='20px "Courier New"';
  ctx.textAlign='center';ctx.fillText(level.title,W/2,24);ctx.textAlign='left';
  ctx.fillStyle='#e0c040';ctx.font='bold 20px "Courier New"';
  ctx.textAlign='right';ctx.fillText('◎ '+player.score,W-14,26);ctx.textAlign='left';

  // Mini tool panel
  const PX=12,PY=46,PW=178,PH_BASE=52;
  const TOOL_DEFS=[{id:'bateia',icon:'🥣',nome:'Bateia'},{id:'pedra_de_toque',icon:'🪨',nome:'Pedra de Toque'},{id:'picareta',icon:'⛏',nome:'Picareta'}];
  const tools=TOOL_DEFS.filter(t=>player.items.includes(t.id));
  const PH=PH_BASE+(tools.length>0?6+tools.length*22:0);
  ctx.save();
  ctx.shadowColor='rgba(0,0,0,0.6)';ctx.shadowBlur=8;
  ctx.fillStyle='rgba(8,4,0,0.88)';roundRect(PX,PY,PW,PH,6);ctx.fill();
  ctx.shadowBlur=0;
  ctx.strokeStyle='#8a6820';ctx.lineWidth=1.5;roundRect(PX,PY,PW,PH,6);ctx.stroke();
  ctx.strokeStyle='rgba(200,160,40,0.25)';ctx.lineWidth=1;roundRect(PX+3,PY+3,PW-6,PH-6,4);ctx.stroke();
  ctx.restore();
  const midX=PX+PW/2,kw=26,kx=PX+PW-kw-6,ky=PY+5;
  ctx.font='11px serif';ctx.fillStyle='#c0a030';ctx.fillText('📔',PX+8,PY+20);
  ctx.font='bold 10px "Courier New"';ctx.fillStyle='#c0a030';ctx.fillText('DIÁRIO DE BORDO',PX+24,PY+20);
  ctx.fillStyle='rgba(200,160,40,0.2)';roundRect(kx,ky,kw,18,3);ctx.fill();
  ctx.strokeStyle='#c0a030';ctx.lineWidth=1;roundRect(kx,ky,kw,18,3);ctx.stroke();
  ctx.font='bold 10px "Courier New"';ctx.fillStyle='#e0b840';ctx.textAlign='center';ctx.fillText('[I]',kx+kw/2,ky+13);ctx.textAlign='left';
  ctx.fillStyle='rgba(200,160,40,0.3)';ctx.fillRect(PX+6,PY+26,PW-12,1);
  const atY=PY+44;ctx.textAlign='center';
  ctx.font='12px "Courier New"';ctx.fillStyle='#c0c8d8';
  if(player.activeTools.size>0){
    const eq=[...player.activeTools].filter(id=>ITEM_DEFS[id]).map(id=>ITEM_DEFS[id].icon+''+ITEM_DEFS[id].nome.split(' ')[0]).join(' ');
    ctx.fillStyle='#f0c040';ctx.fillText(eq,midX,atY);
  } else {ctx.fillText('Sem ferramenta',midX,atY);}
  ctx.textAlign='left';
  if(tools.length>0){
    ctx.fillStyle='rgba(200,160,40,0.3)';ctx.fillRect(PX+6,PY+PH_BASE,PW-12,1);
    tools.forEach((t,i)=>{
      const ty=PY+PH_BASE+8+i*22,equipped=player.activeTools.has(t.id);
      ctx.textAlign='center';ctx.font='11px serif';ctx.fillStyle=equipped?'#f0c040':'#a08040';
      ctx.fillText(t.icon+' '+t.nome+(equipped?' ◀':''),midX,ty+10);ctx.textAlign='left';
    });
  }

  // Ouro counter (Level 3)
  if(level.id===3){
    const ouros=player.items.filter(i=>i==='ouro_pepita').length;
    const hasPlaca=player.items.includes('placa_reivindicacao');
    const ox=W/2+180,oy=48;
    ctx.fillStyle='rgba(8,4,0,0.85)';roundRect(ox,oy,180,70,6);ctx.fill();
    ctx.strokeStyle='#e0c040';ctx.lineWidth=1.5;roundRect(ox,oy,180,70,6);ctx.stroke();
    ctx.font='bold 12px "Courier New"';ctx.fillStyle='#e0c040';
    ctx.textAlign='center';ctx.fillText('GARIMPAGEM',ox+90,oy+18);ctx.textAlign='left';
    ctx.fillStyle='rgba(200,160,40,0.3)';ctx.fillRect(ox+8,oy+24,164,1);
    for(let i=0;i<3;i++){
      ctx.fillStyle=i<ouros?'#f0c840':'#334';
      ctx.font='20px serif';ctx.fillText('◎',ox+14+i*54,oy+50);
    }
    ctx.fillStyle=hasPlaca?'#d4a060':'#334';
    ctx.font='16px serif';ctx.fillText('📋',ox+14+3*54-6,oy+48);
  }

  const hintText=typeof level.hint==='function'?level.hint(player):level.hint;
  ctx.fillStyle='#b0b0c8';ctx.font='18px "Courier New"';
  ctx.textAlign='center';ctx.fillText(hintText,W/2,H-10);ctx.textAlign='left';
}

// ─── TITLE SCREEN ─────────────────────────────────────────────────────────────
function drawTitle(){
  drawBg('bg01');
  ctx.fillStyle='rgba(0,0,0,0.52)';ctx.fillRect(0,0,W,H);
  drawStars();
  ctx.textAlign='center';
  ctx.shadowColor='#e0c040';ctx.shadowBlur=40;
  ctx.fillStyle='#e0c040';ctx.font='bold 46px "Courier New"';ctx.fillText('O Brilho do American River',W/2,148);
  ctx.shadowBlur=0;
  ctx.fillStyle='#c8a060';ctx.font='19px "Courier New"';ctx.fillText('Fase 2.1  —  Sierra Nevada, Califórnia',W/2,200);
  if(IMG.card21){
    const cardSize=160,cardX=W/2-80,cardY=230;
    const glow=ctx.createRadialGradient(W/2,cardY+80,0,W/2,cardY+80,130);
    glow.addColorStop(0,'rgba(220,185,80,0.25)');glow.addColorStop(1,'rgba(220,185,80,0)');
    ctx.fillStyle=glow;ctx.beginPath();ctx.arc(W/2,cardY+80,130,0,Math.PI*2);ctx.fill();
    ctx.drawImage(IMG.card21,cardX,cardY,cardSize,cardSize);
  }
  ctx.fillStyle=`rgba(220,185,80,${.55+Math.sin(Date.now()/550)*.4})`;ctx.font='19px "Courier New"';
  ctx.fillText('▶  Pressione ENTER para começar  ◀',W/2,454);
  ctx.fillStyle='#c0c8d8';ctx.font='18px "Courier New"';
  ctx.fillText('← → Mover   ↑/ Espaço Pular   E Interagir/Garimpar',W/2,500);
  ctx.fillText('[M] Menu Principal',W/2,538);
  ctx.textAlign='left';
}

// ─── DEATH SCREEN ─────────────────────────────────────────────────────────────
function drawDeath(){
  ctx.fillStyle='rgba(0,0,0,0.72)';ctx.fillRect(0,0,W,H);
  const cause=G.player?.deathCause||'queda';
  const msg=cause==='rocha'?'QUE PEDRA!':'VOCÊ CAIU!';
  const sub=cause==='rocha'?'Cuidado com as rochas afiadas!':'Você caiu no abismo.';
  ctx.textAlign='center';ctx.shadowColor='#ff4040';ctx.shadowBlur=30;
  ctx.fillStyle='#ff6060';ctx.font='bold 54px "Courier New"';ctx.fillText(msg,W/2,H/2-50);
  ctx.shadowBlur=0;
  ctx.fillStyle='#cc8888';ctx.font='16px "Courier New"';ctx.fillText(sub,W/2,H/2-10);
  drawCorvan(W/2-24,H/2+10,3,false,Date.now()/200);
  ctx.fillStyle='#e0b840';ctx.font='20px "Courier New"';
  ctx.fillText('Pressione  R  para recomeçar',W/2,H/2+140);ctx.fillText(`Mortes: ${G.deaths}`,W/2,H/2+168);
  ctx.fillStyle='#888';ctx.font='15px "Courier New"';ctx.fillText('[M] Menu Principal',W/2,H/2+200);
  ctx.textAlign='left';
}

// ─── COMPLETE SCREEN ──────────────────────────────────────────────────────────
function drawComplete(){
  const gr=ctx.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#060c04');gr.addColorStop(1,'#180c04');ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
  drawStars();
  const rg=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,500);rg.addColorStop(0,'rgba(220,185,80,.16)');rg.addColorStop(1,'rgba(220,185,80,0)');ctx.fillStyle=rg;ctx.fillRect(0,0,W,H);
  ctx.textAlign='center';ctx.shadowColor='#e0c040';ctx.shadowBlur=40;
  ctx.fillStyle='#e0c040';ctx.font='bold 42px "Courier New"';ctx.fillText('✦  FASE 2.1 CONCLUÍDA  ✦',W/2,118);
  ctx.shadowBlur=0;
  drawCorvan(W/2-160,200,4,false,Date.now()/300);
  // Floating placa
  ctx.save();ctx.translate(W/2+80,280);ctx.scale(2.8,2.8);drawPlaca(0,0,Date.now()/1000);ctx.restore();
  ctx.fillStyle='#e8d8a0';ctx.font='17px "Courier New"';ctx.fillText('O Brilho do American River foi revelado!',W/2,196);
  const lines=['🥣  Bateia — separação por densidade no garimpo','◎  Ouro — 1g forma fio de 3km, metal mais maleável','🪨  Pedra de Toque — ensaiadores de 1849 testavam ouro','📋  Placa de Reivindicação — base da lei de propriedade'];
  ctx.fillStyle='#c8b880';ctx.font='14px "Courier New"';lines.forEach((l,i)=>ctx.fillText(l,W/2,248+i*28));
  ctx.fillStyle='#c0c8d8';ctx.font='16px "Courier New"';ctx.fillText(`Pontuação: ◎ ${G.player?.score||0}   Mortes: ${G.deaths}`,W/2,428);
  ctx.fillStyle=`rgba(220,185,80,${.6+Math.sin(Date.now()/600)*.4})`;ctx.font='15px "Courier New"';
  ctx.fillText('✦ Fase 2.2 desbloqueada!   [M] Menu Principal',W/2,458);ctx.textAlign='left';
}

// ═══ LEVEL BUILDERS ══════════════════════════════════════════════════════════

// ─── LEVEL 1 — Cena 1: O Início no American River ─────────────────────────────
function buildL1(){
  const FL=590,WW=3400,WH=900;
  const plats=[
    solid(0,FL,380,WH-FL),solid(460,FL,200,WH-FL),solid(740,FL,200,WH-FL),
    solid(1020,FL,220,WH-FL),solid(1320,FL,200,WH-FL),solid(1600,FL,220,WH-FL),
    solid(1900,FL,240,WH-FL),solid(2200,FL,200,WH-FL),solid(2480,FL,220,WH-FL),
    solid(2760,FL,700,WH-FL),
    solid(220,FL-200,130,18),solid(500,FL-240,110,18),solid(760,FL-180,130,18),
    solid(1000,FL-230,120,18),solid(1260,FL-180,130,18),solid(1540,FL-250,110,18),
    solid(1760,FL-180,130,18),solid(2040,FL-240,120,18),solid(2320,FL-180,110,18),
    solid(2560,FL-240,120,18),
    solid(400,FL-36,80,14),solid(660,FL-36,80,14),solid(900,FL-36,80,14),
    solid(1160,FL-36,80,14),solid(1460,FL-36,80,14),solid(1720,FL-36,80,14),
    solid(2040,FL-36,80,14),solid(2360,FL-36,80,14),solid(2640,FL-36,80,14),
    movH(1400,FL-120,100,1400,1560,1.8),
    trap(1100,FL-60,100),
    spike(860,FL-18,60),
  ];
  const cols=[
    ...[100,240,500,780,1060,1360,1660,1960,2260,2580,2820,3000].map(x=>new Col(x,FL-50,'ouro')),
  ];
  const grizzly={x:3060,y:FL-40,gifted:false};
  const triggers=[
    new Trigger(3200,FL-200,120,200,'Avançar para Cena 2',(player,level)=>{
      if(!player.items.includes('pedra_de_toque')){notify('Interaja com o Grizzly para obter a Pedra de Toque!');return;}
      if(level._advFired)return;level._advFired=true;
      player.interactAnim=40;sfx('unlock');
      showDialog([
        '"Estamos em janeiro de 1848, às margens do American River, na Sierra Nevada. James Marshall acabou de encontrar algo brilhando no canal do moinho de John Sutter — foi o gatilho da maior migração voluntária da história americana."',
        '"Em menos de um ano, 300.000 pessoas de todo o mundo vieram para cá. Os \'49ers\', como ficaram conhecidos os garimpeiros de 1849, transformaram a Califórnia para sempre."',
        '"Logo à frente posso ver veios de quartzo branco nas paredes das rochas. O ouro se formou neles há 120 milhões de anos — preciso examinar esses veios para entender a geologia antes de começar o garimpo!"',
      ],()=>{notify('✦ Examine os veios de quartzo na próxima área!');level.triggers[0].done=true;setTimeout(()=>G.nextLevel(),2000);});
    },true),
  ];
  return{id:1,bg:'bg01',W:WW,H:WH,startX:60,startY:FL-90,
    title:'O Início no American River',
    hint(player){
      if(!player.items.includes('pedra_de_toque'))return '🐻 Interaja com o Grizzly da Califórnia para a Pedra de Toque →';
      return '✦ Pedra de Toque obtida — avance para os veios de quartzo →';
    },
    plats,cols,triggers,grizzly,veins:[],panSpots:null,
    intro:[
      '"Estamos em 1848, Sierra Nevada, Califórnia. Um carpinteiro chamado James Marshall acabou de descobrir algo que mudaria a história americana para sempre."',
      '"Em menos de um ano, 300.000 pessoas de todo o mundo virão para cá em busca de ouro. Já carrego a Bateia e a Picareta da expedição anterior."',
      'Encontre o Grizzly da Califórnia para obter a Pedra de Toque — será essencial para identificar o ouro verdadeiro!'
    ],
    update(player){
      tickMoving(this.plats);tickTrapdoors(this.plats);
      for(const c of this.cols)c.tick();
      const ent=this.triggers[0];
      if(!ent.done&&!G.dialog&&player.items.includes('pedra_de_toque')){
        if(player.x+player.w>=ent.x&&player.x<=ent.x+ent.w+80)ent.fn(player,this);
      }
    },
    draw(player){
      drawStars();drawWind();
      drawSignPost(550,FL);
      // River visual below platforms
      const ry=FL-cam.y;
      if(ry>0&&ry<H){
        ctx.fillStyle='rgba(40,100,160,0.3)';ctx.fillRect(0,ry-12,W,20);
        drawRiver(FL);
      }
      // Grizzly bear
      if(this.grizzly){
        const gx=this.grizzly.x-cam.x,gy=this.grizzly.y-cam.y;
        if(gx>-150&&gx<W+150){
          drawGrizzly(gx,gy,Date.now()/500);
          if(!this.grizzly.gifted&&Math.abs(player.x-this.grizzly.x)<160){
            ctx.fillStyle='rgba(0,0,0,0.82)';ctx.font='14px "Courier New"';
            const t2='[E] Interagir com o Grizzly 🐻';const tw=ctx.measureText(t2).width+24;
            roundRect(gx-tw/2,gy-110,tw,24,4);ctx.fill();
            ctx.strokeStyle='#e0b840';ctx.lineWidth=1.5;roundRect(gx-tw/2,gy-110,tw,24,4);ctx.stroke();
            ctx.fillStyle='#e0b840';ctx.textAlign='center';ctx.fillText(t2,gx,gy-93);ctx.textAlign='left';
          }
          if(this.grizzly.gifted){
            ctx.fillStyle='rgba(200,200,100,0.6)';ctx.font='12px "Courier New"';
            ctx.textAlign='center';ctx.fillText('Boa sorte, garimpeiro! 🐻',gx,gy-90);ctx.textAlign='left';
          }
        }
      }
      for(const c of this.cols)c.draw(player.x,player.y);
      for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

// ─── LEVEL 2 — Cena 2: Os Veios de Quartzo ─────────────────────────────────
function buildL2(){
  const FL=590,WW=3200,WH=900;
  const plats=[
    solid(0,FL,340,WH-FL),solid(420,FL,200,WH-FL),solid(700,FL,200,WH-FL),
    solid(980,FL,220,WH-FL),solid(1260,FL,200,WH-FL),solid(1540,FL,220,WH-FL),
    solid(1820,FL,200,WH-FL),solid(2100,FL,200,WH-FL),solid(2380,FL,200,WH-FL),
    solid(2660,FL,600,WH-FL),
    solid(200,FL-200,130,18),solid(460,FL-250,120,18),solid(720,FL-200,120,18),
    solid(1020,FL-240,120,18),solid(1300,FL-200,130,18),solid(1580,FL-250,110,18),
    solid(1880,FL-200,120,18),solid(2180,FL-250,120,18),solid(2480,FL-200,110,18),
    solid(340,FL-36,80,14),solid(620,FL-36,80,14),solid(900,FL-36,80,14),
    solid(1180,FL-36,80,14),solid(1460,FL-36,80,14),solid(1760,FL-36,80,14),
    solid(2060,FL-36,80,14),solid(2360,FL-36,80,14),solid(2640,FL-36,80,14),
    movH(1700,FL-100,100,1700,1860,2.0),
    spike(900,FL-18,60),spike(1780,FL-18,60),
    trap(1260,FL-60,100),
  ];
  const veins=[
    new QuartzVein(480,FL-280),
    new QuartzVein(1080,FL-260),
    new QuartzVein(1880,FL-270),
  ];
  const cols=[
    ...[80,220,460,740,1020,1300,1560,1840,2120,2400,2680,2900].map(x=>new Col(x,FL-50,'ouro')),
    ...[520,1200,2200].map(x=>new Col(x,FL-90,'quartzo_aureo')),
  ];
  const triggers=[
    new Trigger(3000,FL-250,140,250,'Avançar para Cena 3',(player,level)=>{
      const vDone=level.veins.filter(v=>v.examined).length;
      if(vDone<2){notify(`Examine mais veios de quartzo! (${vDone}/3)`);return;}
      if(level._advFired)return;level._advFired=true;sfx('unlock');
      showDialog([
        '"Esses veios de quartzo branco com motas douradas são a Mother Lode — o cinturão de 200km de quartzo aurífero que percorre as encostas da Sierra Nevada."',
        '"O ouro não surge solto. Há 120 milhões de anos, fluidos hidrotermais infiltraram fissuras de quartzo. Com o tempo, a erosão fluvial expôs esses veios e carregou os fragmentos para o leito do rio."',
        '"Com a bateia, separar ouro do sedimento é questão de densidade: o ouro (19,3 g/cm³) é quase 7 vezes mais denso que a água — ele sempre afunda e fica no centro da bateia!"',
        '"Mas atenção à pirita — o \'ouro de tolo\'. Parece ouro, mas é FeS₂. A Pedra de Toque do Grizzly vai me salvar de um erro embaraçoso. Vamos ao rio!"',
      ],()=>{notify('✦ Vá ao leito do rio garimpar!');level.triggers[0].done=true;setTimeout(()=>G.nextLevel(),2000);});
    }),
  ];
  return{id:2,bg:'bg02',W:WW,H:WH,startX:60,startY:FL-90,
    title:'Os Veios de Quartzo',
    hint(player){
      const vDone=this.veins?this.veins.filter(v=>v.examined).length:0;
      return vDone<3?`◈ Examine os veios de quartzo [E] (${vDone}/3) →`:'✦ Veios examinados — avance para o garimpo no rio →';
    },
    plats,cols,triggers,veins,grizzly:null,panSpots:null,
    intro:[
      '"As paredes rochosas próximas ao American River exibem veios brancos de quartzo com motas douradas — é a Mother Lode!"',
      '"Examine os veios de quartzo [E] para entender como o ouro se formou antes de ir para o leito do rio garimpar.",',
      'Examine ao menos 2 veios de quartzo para avançar para a garimpagem!'
    ],
    update(player){tickMoving(this.plats);tickTrapdoors(this.plats);for(const v of this.veins)v.tick();for(const c of this.cols)c.tick();},
    draw(player){
      drawWind();
      const ry=FL-cam.y;
      if(ry>0&&ry<H){ctx.fillStyle='rgba(40,100,160,0.25)';ctx.fillRect(0,ry-10,W,18);drawRiver(FL);}
      for(const v of this.veins)v.draw();
      for(const c of this.cols)c.draw(player.x,player.y);
      for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

// ─── LEVEL 3 — Cena 3: Garimpagem no Rio ─────────────────────────────────────
function buildL3(){
  const FL=590,WW=3200,WH=900;
  // River level — platforms at water level, some stepping stones
  const plats=[
    solid(0,FL,340,WH-FL),solid(420,FL,200,WH-FL),solid(700,FL,200,WH-FL),
    solid(980,FL,220,WH-FL),solid(1260,FL,200,WH-FL),solid(1540,FL,220,WH-FL),
    solid(1820,FL,200,WH-FL),solid(2100,FL,240,WH-FL),solid(2380,FL,200,WH-FL),
    solid(2660,FL,600,WH-FL),
    // Stepping stones in river
    solid(340,FL,80,WH-FL),solid(620,FL,80,WH-FL),solid(900,FL,80,WH-FL),
    solid(1180,FL,80,WH-FL),solid(1460,FL,80,WH-FL),solid(1740,FL,80,WH-FL),
    solid(2020,FL,80,WH-FL),solid(2300,FL,80,WH-FL),solid(2580,FL,80,WH-FL),
    // Upper bank ledges
    solid(200,FL-200,130,18),solid(480,FL-240,120,18),solid(760,FL-200,120,18),
    solid(1060,FL-230,120,18),solid(1340,FL-200,130,18),
    movH(1600,FL-130,100,1600,1780,1.8),movH(2400,FL-140,100,2400,2560,1.6),
    spike(2220,FL-18,60),
    trap(1040,FL-50,100),
  ];
  // Pan spots: ouro, pirita, ouro, ouro, placa_reivindicacao
  const panSpots=[
    new PanSpot(420,FL-30,'ouro'),
    new PanSpot(780,FL-30,'pirita'),
    new PanSpot(1200,FL-30,'ouro'),
    new PanSpot(1700,FL-30,'ouro'),
    new PanSpot(2200,FL-30,'placa_reivindicacao'),
  ];
  const cols=[
    ...[100,240,500,780,1060,1360,1660,1960,2260,2580,2820].map(x=>new Col(x,FL-55,'ouro')),
  ];
  const triggers=[
    new Trigger(3000,FL-250,140,250,'Avançar para Cena 4',(player,level)=>{
      const ouros=player.items.filter(i=>i==='ouro_pepita').length;
      if(ouros<3){notify(`Colete mais ouro na bateia! (${ouros}/3)`);return;}
      if(!player.items.includes('placa_reivindicacao')){notify('Encontre a Placa de Reivindicação no rio!');return;}
      if(level._advFired)return;level._advFired=true;sfx('unlock');
      showDialog([
        '"Consegui! 3 pepitas de ouro e a Placa de Reivindicação de J. W. Garrett, um dos 49ers."',
        '"A Pedra de Toque do Grizzly me salvou da pirita — o ouro de tolo. Sem ela, poderia ter comemorado e levado para casa FeS₂ sem valor nenhum."',
        '"A bateia girou e o ouro ficou no centro pela lei da física: densidade. 19,3 g/cm³ contra 2,7 g/cm³ da areia. A diferença de densidade é o melhor detetive de ouro."',
      ],()=>{notify('✦ Avançando para a conclusão!');level.triggers[0].done=true;setTimeout(()=>G.nextLevel(),2000);});
    }),
  ];
  return{id:3,bg:'bg03',W:WW,H:WH,startX:60,startY:FL-90,
    title:'Garimpagem no Rio',
    hint(player){
      const ouros=player.items.filter(i=>i==='ouro_pepita').length;
      const hasPlaca=player.items.includes('placa_reivindicacao');
      if(ouros<3)return `🥣 Garimpe com a Bateia [E] — Ouro: ${ouros}/3`;
      if(!hasPlaca)return '📋 Encontre a Placa de Reivindicação mais adiante!';
      return '✦ Tudo coletado — avance para a conclusão →';
    },
    plats,cols,triggers,veins:null,panSpots,grizzly:null,
    intro:[
      '"Estamos no leito do American River, a garimpagem começa! Uso a bateia para separar o ouro do sedimento pela diferença de densidade."',
      '"Cuidado: vou encontrar pirita misturada ao ouro! Ela parece ouro mas deixa traço esverdeado na Pedra de Toque. Não me deixo enganar."',
      'Colete 3 pepitas de ouro e encontre a Placa de Reivindicação para avançar!'
    ],
    update(player){tickMoving(this.plats);tickTrapdoors(this.plats);for(const ps of this.panSpots)ps.tick();for(const c of this.cols)c.tick();},
    draw(player){
      // River visual throughout level
      const ry=FL-cam.y;
      if(ry>0&&ry<H){
        ctx.fillStyle='rgba(40,110,180,0.28)';ctx.fillRect(0,ry-14,W,22);
        ctx.fillStyle='rgba(60,140,200,0.15)';ctx.fillRect(0,ry+8,W,H-(ry+8));
        drawRiver(FL);
      }
      drawWind();
      for(const ps of this.panSpots)ps.draw();
      for(const c of this.cols)c.draw(player.x,player.y);
      for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

// ─── LEVEL 4 — Cena 4: Conclusão ao Entardecer ────────────────────────────────
function buildL4(){
  const FL=590,WW=1400,WH=900;
  const plats=[
    solid(0,FL,1400,WH-FL),
    solid(280,FL-220,160,18),solid(680,FL-180,140,18),solid(1040,FL-240,140,18),
  ];
  const cols=[...[180,360,540,720,900,1080].map(x=>new Col(x,FL-50,'ouro'))];
  const celebState={active:false,t:0};
  const triggers=[
    new Trigger(1200,FL-200,140,200,'Concluir Fase 2.1',(player,level)=>{
      if(!player.items.includes('placa_reivindicacao')){notify('Volte e encontre a Placa de Reivindicação!');return;}
      const ouros=player.items.filter(i=>i==='ouro_pepita').length;
      if(ouros<3){notify(`Volte e colete mais ouro! (${ouros}/3)`);return;}
      if(level._finFired)return;level._finFired=true;level.triggers[0].done=true;
      celebState.active=true;celebState.t=0;
      sfx('unlock');
      for(let i=0;i<20;i++)burst(player.x+20,player.y,'#f0d060',2,5+Math.random()*3);
      for(let i=0;i<12;i++)burst(player.x+20,player.y,'#e0b840',1,4+Math.random()*3);
      player.interactAnim=60;
      setTimeout(()=>{
        showDialog([
          '"Consegui! Esta Placa de Reivindicação pertenceu a um dos 300.000 garimpeiros que transformaram a Califórnia para sempre."',
          '"Mas a pressa pelo ouro teve um custo: os povos Miwok e Nisenan, que viviam aqui há milênios, foram expulsos. A mineração hidráulica, desenvolvida quando os depósitos superficiais se esgotaram, despejou toneladas de sedimento nos rios — destruindo ecossistemas inteiros."',
          '"O Grizzly da Califórnia que me deu a Pedra de Toque foi caçado até a extinção nessa mesma era. O ouro que brilha nessa bateia carrega também essa sombra."',
          '"Itens registrados no Diário de Bordo. Fase 2.1 concluída!"',
        ],()=>{
          unlockPhase('2.2');
          BUBBLE.active=false;G.dialog=false;
          try{sessionStorage.setItem('mineralis_session','1');}catch(e){}
          G.state='complete';
        });
      },1200);
    },true),
  ];
  return{id:4,bg:'bg04',W:WW,H:WH,startX:105,startY:FL-90,
    title:'A Saída do American River',
    hint(player){
      const ouros=player.items.filter(i=>i==='ouro_pepita').length;
      return (player.items.includes('placa_reivindicacao')&&ouros>=3)?'✦ Chegue ao marco final para concluir!':'← Volte e colete o ouro e a Placa de Reivindicação!';
    },
    plats,bats:[],cols,triggers,veins:null,panSpots:null,grizzly:null,celebState,
    intro:[
      '"Corvan emerge do American River ao entardecer, segurando a Placa de Reivindicação e as pepitas de ouro."',
      '"Chegue ao marco dourado para registrar todas as descobertas e concluir a Fase 2.1!"',
    ],
    update(player){
      for(const c of this.cols)c.tick();
      if(this.celebState.active)this.celebState.t+=0.06;
      const fim=this.triggers[0];
      if(!fim.done&&!G.dialog){
        const ouros=player.items.filter(i=>i==='ouro_pepita')