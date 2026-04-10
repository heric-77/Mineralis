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

let AC;try{AC=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}
function sfx(type){
  if(!AC)return;if(AC.state==='suspended')AC.resume();
  const o=AC.createOscillator(),g=AC.createGain();
  o.connect(g);g.connect(AC.destination);const t=AC.currentTime;
  if(type==='jump')   {o.frequency.setValueAtTime(220,t);o.frequency.exponentialRampToValueAtTime(440,t+.14);g.gain.setValueAtTime(.13,t);g.gain.exponentialRampToValueAtTime(.001,t+.16);}
  else if(type==='prata')  {o.type='triangle';o.frequency.setValueAtTime(880,t);o.frequency.exponentialRampToValueAtTime(1320,t+.12);g.gain.setValueAtTime(.11,t);g.gain.exponentialRampToValueAtTime(.001,t+.22);}
  else if(type==='picareta'){o.type='square';o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(70,t+.15);g.gain.setValueAtTime(.15,t);g.gain.exponentialRampToValueAtTime(.001,t+.18);}
  else if(type==='item')   {o.frequency.setValueAtTime(440,t);o.frequency.setValueAtTime(660,t+.1);o.frequency.setValueAtTime(880,t+.2);g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.001,t+.3);}
  else if(type==='unlock') {o.frequency.setValueAtTime(330,t);o.frequency.setValueAtTime(440,t+.15);o.frequency.setValueAtTime(660,t+.3);g.gain.setValueAtTime(.13,t);g.gain.exponentialRampToValueAtTime(.001,t+.5);}
  else if(type==='hit')    {o.type='sawtooth';o.frequency.setValueAtTime(200,t);o.frequency.exponentialRampToValueAtTime(60,t+.2);g.gain.setValueAtTime(.18,t);g.gain.exponentialRampToValueAtTime(.001,t+.22);}
  else if(type==='coca')   {o.type='sine';o.frequency.setValueAtTime(520,t);o.frequency.setValueAtTime(440,t+.1);o.frequency.setValueAtTime(660,t+.2);g.gain.setValueAtTime(.1,t);g.gain.exponentialRampToValueAtTime(.001,t+.4);}
  o.start(t);o.stop(t+.6);
}

const IMG={};
let assetsLoaded=0,totalAssets=3,gameReady=false;
[['bg01','Cena01.JPG'],['bg02','Cena02.PNG'],['bgext','Cena01-04.JPG']].forEach(([key,src])=>{
  const img=new Image();
  img.onload=()=>{IMG[key]=img;if(++assetsLoaded>=totalAssets){gameReady=true;startGame();}};
  img.onerror=()=>{IMG[key]=null;if(++assetsLoaded>=totalAssets){gameReady=true;startGame();}};
  img.src=src;
});

const keys={},jp={};
window.addEventListener('keydown',e=>{if(!keys[e.code])jp[e.code]=true;keys[e.code]=true;
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
  if((e.code==='KeyI'||e.code==='Tab')&&G.state==='playing'){e.preventDefault();if(G.player)INV.toggle(G.player);}
  if(e.code==='Escape'&&INV.open){INV.close();}
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

const ITEM_DEFS = {
  picareta: {
    cat:'ferramenta', nome:'Picareta Básica', icon:'⛏',
    journalId:'picareta_basica',
    desc:'Extrai veios de prata e estanho das paredes.\nUse [E] próximo a um veio brilhante.',
    drawHand:'left',  
  },
  lanterna: {
    cat:'ferramenta', nome:'Lanterna', icon:'🔦',
    journalId:null,
    desc:'Ilumina cavernas e revela cristais ocultos.\nNecessária para o efeito de luz nas minas.',
    drawHand:'right',
  },
  coca: {
    cat:'ferramenta', nome:'Folhas de Coca', icon:'🌿',
    journalId:null,
    desc:'Sagradas para os povos andinos há 4.000 anos.\nUse [E] para recuperar o fôlego do Soroche.',
    drawHand:'left', consumivel:true,
  },
  prata: {
    cat:'minerio', nome:'Prata', icon:'◆',
    journalId:'prata',
    desc:'Melhor condutor elétrico e térmico da natureza.\nUsada pelos Incas como arte e símbolo lunar.',
  },
  estanho: {
    cat:'minerio', nome:'Estanho', icon:'◈',
    journalId:'estanho',
    desc:'Liga-se ao cobre formando bronze desde 3.000 a.C.\nBolívia possui a 2ª maior reserva mundial.',
  },
  tupu: {
    cat:'artefato', nome:'Tupu de Prata', icon:'✦',
    journalId:'mapa_potosi',
    desc:'Fivela ornamental da nobreza Inca.\nA prata, para os Incas, era arte — não moeda.',
  },
};

const INV = {
  open: false,
  tab: 0,         
  cursor: 0,      
  TABS: [
    { id:'ferramenta', label:'🔧 Ferramentas', color:'#e0b840' },
    { id:'minerio',    label:'⛏ Minérios',    color:'#c0c8d8' },
    { id:'artefato',   label:'🏺 Artefatos',   color:'#d4a060' },
  ],
  tabItems(player) {
    const cat = this.TABS[this.tab].id;
    return Object.entries(ITEM_DEFS)
      .filter(([id, def]) => def.cat === cat && player.items.includes(id))
      .map(([id, def]) => ({ id, ...def }));
  },
  toggle(player) {
    this.open = !this.open;
    if (this.open) { this.cursor = Math.min(this.cursor, Math.max(0, this.tabItems(player).length-1)); }
    G.dialog = this.open;   
  },
  close() { this.open = false; G.dialog = false; },
  isUpKey()   { return jp['ArrowUp']   || jp['KeyW']; },
  isDownKey() { return jp['ArrowDown'] || jp['KeyS']; },
  isLeftKey() { return jp['ArrowLeft'] || jp['KeyA']; },
  isRightKey(){ return jp['ArrowRight']|| jp['KeyD']; },
  navigate(player) {
    if (!this.open) return false;
    if (this.isLeftKey())  { this.tab = (this.tab+2)%3; this.cursor=0; return true; }
    if (this.isRightKey()) { this.tab = (this.tab+1)%3; this.cursor=0; return true; }
    const items = this.tabItems(player);
    if (this.isUpKey())   { this.cursor = Math.max(0, this.cursor-1); return true; }
    if (this.isDownKey()) { this.cursor = Math.min(items.length-1, this.cursor+1); return true; }
    if (isE() && items.length > 0 && this.tab === 0) {
      const item = items[this.cursor];
      if (player.activeTool === item.id) player.activeTool = null;
      else player.activeTool = item.id;
      return true;
    }
    return false;
  },

  draw(player) {
    if (!this.open) return;
    ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(0,0,W,H);

    const PW=780, PH=480;
    const PX=(W-PW)/2, PY=(H-PH)/2;

    ctx.shadowColor='rgba(0,0,0,0.7)'; ctx.shadowBlur=20;
    ctx.fillStyle='rgba(10,6,2,0.97)'; roundRect(PX,PY,PW,PH,16); ctx.fill();
    ctx.shadowBlur=0;
    ctx.strokeStyle='#8a6820'; ctx.lineWidth=2.5; roundRect(PX,PY,PW,PH,16); ctx.stroke();
    ctx.strokeStyle='rgba(200,160,40,0.2)'; ctx.lineWidth=1; roundRect(PX+4,PY+4,PW-8,PH-8,12); ctx.stroke();

    ctx.fillStyle='#e0b840'; ctx.font='bold 16px "Courier New"';
    ctx.textAlign='center'; ctx.fillText('📔  DIÁRIO DE BORDO',W/2,PY+28); ctx.textAlign='left';
    ctx.fillStyle='rgba(200,160,40,0.3)'; ctx.fillRect(PX+16,PY+38,PW-32,1);

    const TAB_W=PW/3, TAB_Y=PY+44;
    this.TABS.forEach((tab,i)=>{
      const tx=PX+i*TAB_W, active=(i===this.tab);
      ctx.fillStyle=active?'rgba(200,160,40,0.18)':'rgba(0,0,0,0.3)';
      ctx.fillRect(tx+2,TAB_Y,TAB_W-4,34);
      ctx.fillStyle=active?tab.color:'#666';
      ctx.font=(active?'bold ':'')+'13px "Courier New"';
      ctx.textAlign='center'; ctx.fillText(tab.label,tx+TAB_W/2,TAB_Y+22); ctx.textAlign='left';
      if(active){ ctx.fillStyle=tab.color; ctx.fillRect(tx+2,TAB_Y+32,TAB_W-4,3); }
    });

    const CY=TAB_Y+40, CH=PH-(CY-PY)-50;
    const items = this.tabItems(player);
    const COL_W=260, DESC_X=PX+280, DESC_Y=CY+20;

    if(items.length === 0){
      ctx.fillStyle='#554'; ctx.font='14px "Courier New"';
      ctx.textAlign='center';
      ctx.fillText('Nenhum item coletado ainda.',W/2,CY+CH/2);
      ctx.fillText('Explore a fase para desbloquear!',W/2,CY+CH/2+24);
      ctx.textAlign='left';
    } else {
      items.forEach((item,i)=>{
        const iy=CY+16+i*52;
        const selected=(i===this.cursor);
        const equipped=(player.activeTool===item.id);
        if(selected){
          ctx.fillStyle='rgba(200,160,40,0.18)';
          roundRect(PX+16,iy-10,COL_W,46,8); ctx.fill();
          ctx.strokeStyle='#e0b840'; ctx.lineWidth=1.5;
          roundRect(PX+16,iy-10,COL_W,46,8); ctx.stroke();
        }
        ctx.font='24px serif'; ctx.fillText(item.icon,PX+28,iy+22);
        ctx.font=(equipped?'bold ':'')+'14px "Courier New"';
        ctx.fillStyle=equipped?'#f0c840':(selected?'#e8d8a0':'#aaa');
        ctx.fillText(item.nome,PX+62,iy+16);
        if(equipped){
          ctx.fillStyle='rgba(200,160,40,0.22)';
          roundRect(PX+62,iy+20,80,16,4); ctx.fill();
          ctx.font='10px "Courier New"'; ctx.fillStyle='#e0b840';
          ctx.fillText('▶ EQUIPADO',PX+66,iy+32);
        } else if(item.consumivel){
          ctx.font='10px "Courier New"'; ctx.fillStyle='#5a8a50';
          ctx.fillText('CONSUMÍVEL',PX+62,iy+32);
        }
      });

      const sel=items[this.cursor];
      if(sel){
        ctx.fillStyle='rgba(200,160,40,0.08)'; roundRect(DESC_X,CY,PW-DESC_X+PX-16,CH-10,8); ctx.fill();
        ctx.font='48px serif'; ctx.textAlign='center'; ctx.fillText(sel.icon,DESC_X+(PW-DESC_X+PX-16)/2,CY+70); ctx.textAlign='left';
        ctx.font='bold 15px "Courier New"'; ctx.fillStyle='#e0b840';
        ctx.textAlign='center'; ctx.fillText(sel.nome,DESC_X+(PW-DESC_X+PX-16)/2,CY+100); ctx.textAlign='left';
        const catLabel={ferramenta:'🔧 Ferramenta',minerio:'⛏ Minério',artefato:'🏺 Artefato'};
        ctx.font='11px "Courier New"'; ctx.fillStyle='#888';
        ctx.textAlign='center'; ctx.fillText(catLabel[sel.cat],DESC_X+(PW-DESC_X+PX-16)/2,CY+118); ctx.textAlign='left';
        ctx.fillStyle='rgba(200,160,40,0.25)'; ctx.fillRect(DESC_X+20,CY+126,PW-DESC_X+PX-56,1);
        const descLines=sel.desc.split('\n');
        ctx.font='13px "Courier New"'; ctx.fillStyle='#d8c898';
        descLines.forEach((l,i)=>{ ctx.textAlign='center'; ctx.fillText(l,DESC_X+(PW-DESC_X+PX-16)/2,CY+146+i*22); });
        ctx.textAlign='left';
        if(sel.cat==='ferramenta'){
          const btnTxt=player.activeTool===sel.id?'[E] Desequipar':'[E] Equipar';
          const btnColor=player.activeTool===sel.id?'rgba(180,60,20,0.3)':'rgba(200,160,40,0.2)';
          ctx.fillStyle=btnColor;
          roundRect(DESC_X+40,CY+CH-60,PW-DESC_X+PX-96,34,8); ctx.fill();
          ctx.strokeStyle=player.activeTool===sel.id?'#c04020':'#e0b840'; ctx.lineWidth=1.5;
          roundRect(DESC_X+40,CY+CH-60,PW-DESC_X+PX-96,34,8); ctx.stroke();
          ctx.font='bold 13px "Courier New"'; ctx.fillStyle=player.activeTool===sel.id?'#e06040':'#e0b840';
          ctx.textAlign='center'; ctx.fillText(btnTxt,DESC_X+(PW-DESC_X+PX-16)/2,CY+CH-38); ctx.textAlign='left';
        }
      }
    }

    ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(PX,PY+PH-38,PW,38);
    ctx.fillStyle='rgba(200,160,40,0.3)'; ctx.fillRect(PX+16,PY+PH-39,PW-32,1);
    ctx.font='11px "Courier New"'; ctx.fillStyle='#888'; ctx.textAlign='center';
    ctx.fillText('◀ ▶ Abas   ↑ ↓ Navegar   E Equipar/Desequipar   I Fechar',W/2,PY+PH-14);
    ctx.textAlign='left';
  }
};

let particles=[];
function burst(x,y,color,n=8,spd=3.2){
  for(let i=0;i<n;i++){const a=(i/n)*Math.PI*2+Math.random()*.5;
    particles.push({x,y,vx:Math.cos(a)*spd*(0.4+Math.random()),vy:Math.sin(a)*spd*(0.4+Math.random())-1,life:40+Math.random()*20,max:60,color,r:3+Math.random()*4});}
}
function tickParticles(){for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=0.18;p.life--;if(p.life<=0)particles.splice(i,1);}}
function drawParticles(){for(const p of particles){ctx.globalAlpha=p.life/p.max;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x-cam.x,p.y-cam.y,p.r*(p.life/p.max),0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}

const cam={x:0,y:0};
function updateCam(px,worldW){cam.x+=(Math.max(0,Math.min(px-W/2+24,worldW-W))-cam.x)*0.12;}

const GRAV=0.46,PSPD=4.5,JUMPF=-12.2,MAXFALL=16;

const TILE_THEMES={
  1:{top:'#9a8870',body:'#6a5040',dark:'#3a2a18'},  
  2:{top:'#7a6858',body:'#4a3828',dark:'#2a1810'},  
  3:{top:'#6a5848',body:'#3a2818',dark:'#1a1008'},  
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
    ctx.fillStyle='#aa2818';const nc=Math.max(1,Math.floor(p.w/20));
    for(let i=0;i<nc;i++){const tx=sx+i*(p.w/nc);ctx.beginPath();ctx.moveTo(tx,sy+p.h);ctx.lineTo(tx+p.w/nc/2,sy);ctx.lineTo(tx+p.w/nc,sy+p.h);ctx.fill();}return;
  }
  if(p.type==='_dead')return;
  if(p.type==='trapdoor'){
    const al=p.crumble!==undefined?p.crumble/70:1;ctx.globalAlpha=al;
    ctx.fillStyle='#6a4820';ctx.fillRect(sx,sy,p.w,p.h);
    ctx.fillStyle='#8a6030';ctx.fillRect(sx,sy,p.w,3);ctx.globalAlpha=1;return;
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
  ctx.fillStyle='rgba(180,160,120,0.3)';
  for(let i=0;i<Math.floor(p.w/20);i++)ctx.fillRect(sx+i*20+4,sy-2,6,4);
  if(p.moving){ctx.fillStyle='rgba(200,180,100,0.35)';ctx.fillRect(sx,sy,p.w,4);}
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
  const showPickaxe = activeTool==='picareta';
  const showLantern = activeTool==='lanterna';
  const showCoca    = activeTool==='coca';
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
  if(showPickaxe){
    const wb=Math.sin(frame*0.2)*1.5;
    r(0,24+wb,6,1,'#7a4818');r(0,25+wb,1,7,'#7a4818');
    r(0,22+wb,6,3,'#888888');r(4,20+wb,2,3,'#aaaaaa');
  } else if(showCoca){
    r(1,22,5,10,'#b82010');r(1,32,5,3,'#a86030');
    ctx.fillStyle='#2a7a28';ctx.globalAlpha=0.9;
    ctx.beginPath();ctx.ellipse(2.5*S,30*S,3*S,5*S,-0.3,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(5*S,28*S,3*S,5*S,0.3,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=1;
  }
  r(24,16,5,12,'#b82010');r(24,28,5,3,'#a86030');
  if(showLantern){
    r(26,31,1,3,'#888888');r(24,34,5,6,'#604010');r(25,35,3,4,'#ffe080');
    r(23,33,7,8,'#ffcc00',0.12*lb);
  }
  r(9,42,6,4,'#3a1e08');r(17,42,6,4,'#3a1e08');
  r(8,44,8,2,'#2a1008');r(16,44,8,2,'#2a1008');
  ctx.fillStyle='#ffe060';ctx.globalAlpha=0.25*lb;ctx.beginPath();ctx.arc(16*S,1*S,4*S,0,Math.PI*2);ctx.fill();
  if(showLantern){
    ctx.fillStyle='#ffcc00';ctx.globalAlpha=0.18*lb;ctx.beginPath();ctx.arc(26*S,37*S,5*S,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;ctx.restore();
}

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

function drawLanterna(cx,cy,bobT=0){
  ctx.save();ctx.translate(cx,cy+Math.sin(bobT)*5);
  ctx.fillStyle='#c8a020';ctx.fillRect(-8,-12,16,22);
  ctx.fillStyle='#f0e060';ctx.fillRect(-5,-9,10,15);
  ctx.strokeStyle='#806010';ctx.lineWidth=1.5;ctx.strokeRect(-8,-12,16,22);
  const lg=ctx.createRadialGradient(0,0,0,0,0,24);
  lg.addColorStop(0,'rgba(255,220,80,0.5)');lg.addColorStop(1,'rgba(255,220,80,0)');
  ctx.fillStyle=lg;ctx.beginPath();ctx.arc(0,0,24,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

function drawPrata(cx,cy,bobT=0){
  ctx.save();ctx.translate(cx,cy+Math.sin(bobT)*5);
  const glow=ctx.createRadialGradient(0,0,0,0,0,22);
  glow.addColorStop(0,'rgba(200,210,230,0.45)');glow.addColorStop(1,'rgba(180,200,220,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,22,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#9090a8';
  ctx.beginPath();ctx.moveTo(-8,-10);ctx.lineTo(2,-14);ctx.lineTo(12,-6);ctx.lineTo(14,4);
  ctx.lineTo(6,12);ctx.lineTo(-6,10);ctx.lineTo(-12,2);ctx.closePath();ctx.fill();
  ctx.fillStyle='#b8b8d0';
  ctx.beginPath();ctx.moveTo(-6,-8);ctx.lineTo(0,-12);ctx.lineTo(10,-4);ctx.lineTo(12,4);
  ctx.lineTo(4,10);ctx.lineTo(-4,8);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.7)';ctx.beginPath();ctx.ellipse(-2,-4,4,3,0.4,0,Math.PI*2);ctx.fill();
  const sa=Math.abs(Math.sin(Date.now()/500));
  ctx.strokeStyle=`rgba(255,255,255,${sa*0.9})`;ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(4,-8);ctx.lineTo(8,-12);ctx.stroke();
  ctx.restore();
}

function drawTupu(cx,cy,bobT=0){
  ctx.save();ctx.translate(cx,cy+(Math.sin(bobT)*5));
  const glow=ctx.createRadialGradient(0,0,0,0,0,30);
  glow.addColorStop(0,'rgba(200,210,240,0.38)');glow.addColorStop(1,'rgba(180,200,220,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,30,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#9090b8';
  ctx.fillRect(-16,-14,32,8);
  ctx.fillRect(-4,-6,8,28);
  ctx.fillStyle='#c0c0d8';ctx.fillRect(-14,-13,28,3);
  ctx.fillStyle='#d8d8f0';ctx.fillRect(-12,-12,8,4);
  ctx.fillStyle='#aaaacc';
  ctx.beginPath();ctx.moveTo(-4,22);ctx.lineTo(4,22);ctx.lineTo(0,30);ctx.closePath();ctx.fill();
  ctx.fillStyle='#28a890';ctx.beginPath();ctx.arc(0,-10,5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.5)';ctx.beginPath();ctx.arc(-2,-12,2,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#28a890';ctx.beginPath();ctx.arc(-10,-10,3,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(10,-10,3,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

function drawEstanho(cx,cy,bobT=0){
  ctx.save();ctx.translate(cx,cy+Math.sin(bobT)*5);
  const glow=ctx.createRadialGradient(0,0,0,0,0,18);
  glow.addColorStop(0,'rgba(160,170,180,0.35)');glow.addColorStop(1,'rgba(140,150,160,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,18,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#7a8890';
  ctx.beginPath();ctx.moveTo(-9,-8);ctx.lineTo(4,-12);ctx.lineTo(12,-2);ctx.lineTo(10,8);ctx.lineTo(-2,11);ctx.lineTo(-10,4);ctx.closePath();ctx.fill();
  ctx.fillStyle='#9aaab8';ctx.beginPath();ctx.ellipse(-1,-2,5,4,-0.3,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

function drawCoca(cx,cy,bobT=0){
  ctx.save();ctx.translate(cx,cy+Math.sin(bobT)*5);
  ctx.fillStyle='#2a7a28';
  ctx.beginPath();ctx.ellipse(-6,2,8,5,-0.3,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(6,2,8,5,0.3,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(0,-4,6,8,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#3a9a38';
  ctx.beginPath();ctx.ellipse(-5,1,5,3,-0.3,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(0,-3,4,6,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='rgba(80,160,60,0.7)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(0,-8);ctx.lineTo(0,4);ctx.stroke();
  ctx.beginPath();ctx.moveTo(0,-2);ctx.lineTo(-5,2);ctx.stroke();
  ctx.beginPath();ctx.moveTo(0,-2);ctx.lineTo(5,2);ctx.stroke();
  ctx.restore();
}

function drawLlama(cx,cy,frame=0){
  ctx.save();ctx.translate(cx,cy);
  const bob=Math.sin(frame)*2;
  ctx.fillStyle='#d8c8a0';
  ctx.fillRect(-22,20,8,22);ctx.fillRect(-10,20,8,22);
  ctx.fillRect(4,20,8,22);ctx.fillRect(16,20,8,22);
  ctx.fillStyle='#e8d8b0';ctx.fillRect(-24,-10,48,32);
  ctx.fillStyle='#e0d0a8';ctx.fillRect(-6,-38+bob,12,32);
  ctx.fillStyle='#e8d8b0';ctx.fillRect(-10,-52+bob,20,16);
  ctx.fillStyle='#d0c098';ctx.fillRect(-10,-64+bob,6,14);ctx.fillRect(4,-64+bob,6,14);
  ctx.fillStyle='#2a1808';ctx.fillRect(-5,-48+bob,4,4);ctx.fillRect(1,-48+bob,4,4);
  ctx.fillStyle='#c8b088';ctx.fillRect(-4,-42+bob,8,4);
  ctx.fillStyle='#7a5030';ctx.fillRect(-3,-41+bob,3,2);ctx.fillRect(1,-41+bob,3,2);
  ctx.fillStyle='rgba(255,250,230,0.4)';
  for(let i=0;i<6;i++)for(let j=0;j<3;j++)ctx.fillRect(-22+i*8+j%2*2,-8+j*10,6,6);
  ctx.fillStyle='#c83010';ctx.fillRect(-18,0,36,8);
  ctx.fillStyle='#f0c040';
  for(let i=0;i<5;i++)ctx.fillRect(-14+i*8,2,4,4);
  ctx.restore();
}

class MineVein{
  constructor(x,y,type='prata'){
    this.x=x;this.y=y;this.type=type;this.progress=0;
    this.done=false;this.glowT=0;
  }
  tick(){this.glowT+=0.05;}
  tryMine(){
    if(!this.done){
      this.progress+=20;sfx('picareta');
      burst(this.x,this.y-10,'#c0c0d8',6,2);
      if(this.progress>=100)this.done=true;
    }
  }
  draw(){
    if(this.done)return;
    const sx=this.x-cam.x,sy=this.y-cam.y;
    if(sx<-60||sx>W+60)return;
    const a=0.6+Math.abs(Math.sin(this.glowT))*0.4;
    ctx.fillStyle=`rgba(${this.type==='estanho'?'130,145,155':'180,190,210'},${a})`;
    ctx.beginPath();ctx.moveTo(sx-16,sy-6);ctx.lineTo(sx-4,sy-12);ctx.lineTo(sx+10,sy-8);
    ctx.lineTo(sx+18,sy+4);ctx.lineTo(sx+8,sy+10);ctx.lineTo(sx-6,sy+8);ctx.lineTo(sx-14,sy+2);ctx.closePath();ctx.fill();
    ctx.fillStyle=`rgba(220,230,250,${a*0.6})`;
    ctx.beginPath();ctx.ellipse(sx-2,sy-2,6,4,0.3,0,Math.PI*2);ctx.fill();
    if(!this.done){
      const ha=0.5+Math.sin(Date.now()/400)*0.5;
      ctx.fillStyle=`rgba(200,210,240,${ha*0.8})`;ctx.font='bold 12px "Courier New"';
      ctx.textAlign='center';ctx.fillText('[E] Minerar',sx,sy-28);ctx.textAlign='left';
      if(this.progress>0){
        ctx.strokeStyle='#c0c0d8';ctx.lineWidth=3;
        ctx.beginPath();ctx.arc(sx,sy,20,-Math.PI/2,-Math.PI/2+Math.PI*2*(this.progress/100));ctx.stroke();
      }
    }
  }
}

class Col{
  constructor(x,y,type){this.x=x;this.y=y;this.w=34;this.h=34;this.type=type;this.done=false;this.t=Math.random()*Math.PI*2;}
  tick(){if(!this.done)this.t+=0.06;}
  draw(playerX, playerY){
    if(this.done)return;
    const sx=this.x-cam.x,sy=this.y-cam.y;
    if(sx<-60||sx>W+60)return;

    const TOOL_TYPES=['picareta','lanterna','coca'];
    const isTool=TOOL_TYPES.includes(this.type);

    if(isTool){
      const a=0.3+Math.abs(Math.sin(this.t*0.8))*0.5;
      const glow=ctx.createRadialGradient(sx+17,sy+17,4,sx+17,sy+17,32);
      glow.addColorStop(0,`rgba(255,220,80,${a})`);
      glow.addColorStop(1,'rgba(255,200,50,0)');
      ctx.fillStyle=glow;ctx.fillRect(sx-15,sy-15,64,64);
    }

    ctx.save();ctx.translate(sx+this.w/2,sy+this.h/2);
    if(this.type==='picareta') drawPicareta(0,0,this.t);
    else if(this.type==='lanterna') drawLanterna(0,0,this.t);
    else if(this.type==='prata')  drawPrata(0,0,this.t);
    else if(this.type==='tupu')   drawTupu(0,0,this.t);
    else if(this.type==='estanho') drawEstanho(0,0,this.t);
    else if(this.type==='coca')   drawCoca(0,0,this.t);
    ctx.restore();

    if(isTool&&playerX!==undefined){
      const dist=Math.hypot(playerX+20-(this.x+17), playerY+40-(this.y+17));
      if(dist<110){
        const label=this.type==='picareta'?'⛏ Picareta':
                    this.type==='lanterna'?'🔦 Lanterna':'🌿 Coca';
        const txt=`[E] Pegar ${label}`;
        const pulse=0.7+Math.sin(Date.now()/300)*0.3;
        ctx.font='bold 13px "Courier New"';
        const tw=ctx.measureText(txt).width+20;
        const bx=sx+17-tw/2, by=sy-42;
        ctx.fillStyle=`rgba(8,4,0,${0.88*pulse})`;
        roundRect(bx,by,tw,24,5);ctx.fill();
        ctx.strokeStyle=`rgba(220,185,80,${pulse})`;ctx.lineWidth=1.5;
        roundRect(bx,by,tw,24,5);ctx.stroke();
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

class Trigger{
  constructor(x,y,w,h,label,fn){this.x=x;this.y=y;this.w=w;this.h=h;this.label=label;this.fn=fn;this.done=false;}
  draw(px,py){
    if(this.done)return;
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

class Bat{
  constructor(x,y,patrol){this.x=x;this.y=y;this.patrol=patrol;this.vx=1.4;this.vy=0;this.baseY=y;this.frame=0;this.dead=false;this.w=28;this.h=18;}
  update(player){
    if(this.dead)return;
    this.frame+=0.1;this.x+=this.vx;this.y=this.baseY+Math.sin(this.frame*1.2)*30;
    if(Math.abs(this.x-player.x)>this.patrol)this.vx=-this.vx;
  }
  draw(){
    if(this.dead)return;
    const sx=this.x-cam.x,sy=this.y-cam.y;
    if(sx<-50||sx>W+50)return;
    const flap=Math.sin(this.frame*4)*12;
    ctx.save();ctx.translate(sx,sy);
    ctx.fillStyle='#2a1828';
    ctx.beginPath();ctx.ellipse(-14,flap,14,6,Math.PI/8,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(14,-flap,14,6,-Math.PI/8,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#3a2838';ctx.beginPath();ctx.ellipse(0,0,8,6,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#e03030';ctx.fillRect(-3,-3,2,2);ctx.fillRect(1,-3,2,2);
    ctx.restore();
  }
}

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
  _next(){if(!this.queue.length){this.active=false;G.dialog=false;if(this.cb){const f=this.cb;this.cb=null;f();}return;}this.lines=wrapText(this.queue.shift(),560);},
  advance(){if(this.active)this._next();},
  draw(player){
    if(!this.active)return;this.faceFrame+=0.06;
    ctx.font='15px "Courier New"';
    const lineH=24,pad=20,textW=560;
    const bubW=textW+pad*2;
    const bubH=Math.max(80,this.lines.length*lineH+70)+pad;
    const pcx=player.x-cam.x+player.w/2,pcy=player.y-cam.y;
    let bx=Math.max(10,Math.min(pcx-bubW/2,W-bubW-10)),by=Math.max(10,pcy-bubH-32);
    ctx.shadowColor='rgba(0,0,0,0.6)';ctx.shadowBlur=14;
    ctx.fillStyle='rgba(8,4,0,0.96)';roundRect(bx,by,bubW,bubH,14);ctx.fill();
    ctx.shadowBlur=0;
    ctx.strokeStyle=this.speakerColor;ctx.lineWidth=2.5;roundRect(bx,by,bubW,bubH,14);ctx.stroke();
    ctx.strokeStyle=`rgba(200,160,40,0.2)`;ctx.lineWidth=1;roundRect(bx+4,by+4,bubW-8,bubH-8,10);ctx.stroke();
    const tbx=Math.max(bx+30,Math.min(pcx,bx+bubW-30));
    const tty=by+bubH,tipy=Math.min(pcy,tty+38);
    ctx.fillStyle='rgba(8,4,0,0.96)';ctx.beginPath();ctx.moveTo(tbx-14,tty);ctx.lineTo(tbx+14,tty);ctx.lineTo(pcx,tipy);ctx.closePath();ctx.fill();
    ctx.strokeStyle=this.speakerColor;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(tbx-14,tty);ctx.lineTo(pcx,tipy);ctx.lineTo(tbx+14,tty);ctx.stroke();
    const tx=bx+pad;
    ctx.font='bold 13px "Courier New"';ctx.fillStyle=this.speakerColor;ctx.fillText(this.speakerTxt,tx,by+pad+14);
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

let popup={active:false,timer:0,title:'',lines:[],color:'#c0c0d8'};
function showPopup(title,lines,color,ms=6500){popup={active:true,timer:ms,title,lines,color};}
function tickPopup(){if(popup.active&&popup.timer>0){popup.timer-=16;if(popup.timer<=0)popup.active=false;}}
function drawPopup(){
  if(!popup.active)return;
  const al=Math.min(1,popup.timer/400);ctx.save();ctx.globalAlpha=al;
  const pw=340,lineH=20,ph=popup.lines.length*lineH+80;
  const px=W-pw-18,py=56;
  ctx.fillStyle='rgba(8,4,0,0.94)';roundRect(px,py,pw,ph,10);ctx.fill();
  ctx.strokeStyle=popup.color;ctx.lineWidth=2;roundRect(px,py,pw,ph,10);ctx.stroke();
  ctx.strokeStyle=`rgba(200,200,220,0.2)`;ctx.lineWidth=1;roundRect(px+4,py+4,pw-8,ph-8,7);ctx.stroke();
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

class Player{
  constructor(x,y){
    this.x=x;this.y=y;this.w=40;this.h=82;
    this.vx=0;this.vy=0;this.onG=false;this.facing=1;
    this.hp=3;this.maxHp=3;this.inv=0;this.dead=false;
    this.walkT=0;this.state='idle';
    this.coyote=0;this.jbuf=0;this.onMoving=null;
    this.items=[];this.score=0;
    this.activeTool=null;  
    this.soroche=0;this.sorocheAnim=0;  
    this.interactAnim=0;
  }
  overlaps(r){return this.x<r.x+r.w&&this.x+this.w>r.x&&this.y<r.y+r.h&&this.y+this.h>r.y;}
  near(r,d=80){return Math.abs(this.x+20-(r.x+r.w/2))<r.w/2+d&&Math.abs(this.y+40-(r.y+r.h/2))<r.h/2+d;}

  update(level){
    if(INV.open){ INV.navigate(this); return; }
    if(G.dialog)return;
    if(level.underground){
      this.soroche=Math.min(100,this.soroche+(isR()||isL()?0.10:0.04));
    } else {
      this.soroche=Math.max(0,this.soroche-0.4);
    }
    if(this.soroche>=100)this.sorocheAnim=Math.min(80,this.sorocheAnim+1);
    else this.sorocheAnim=Math.max(0,this.sorocheAnim-2);
    if(this.soroche>=100&&this.sorocheAnim>40&&this.inv===0&&Math.random()<0.008)this._hurt(1,level);
    const sm=this.soroche>=80?0.65:1.0;

    if(isL()){this.vx=-PSPD*sm;this.facing=-1;}
    else if(isR()){this.vx=PSPD*sm;this.facing=1;}
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
      for(const p of level.plats){if(p.type==='spike'&&this.overlaps(p))this._hurt(2,level);}
      for(const e of level.bats||[]){
        if(!e.dead&&this.overlaps(e)){
          if(this.vy>2&&this.y+this.h<e.y+e.h*0.5){e.dead=true;this.vy=-8;burst(e.x+14,e.y,'#e0b840',10);sfx('prata');}
          else{this._hurt(1,level);this.vy=-6;this.vx=(this.x<e.x?-6:6);}
        }
      }
    }
    if(this.inv>0)this.inv--;if(this.interactAnim>0)this.interactAnim--;

    const TOOL_TYPES = ['picareta','lanterna','coca'];

    for(const c of level.cols){
      if(c.done||TOOL_TYPES.includes(c.type)) continue; 
      if(!this.overlaps(c)) continue;
      c.done=true;
      if(c.type==='prata'){this.score+=20;sfx('prata');burst(c.x+17,c.y+17,'#c0c8d8',10);
        if(!this.items.includes('prata_ok')){this.items.push('prata_ok');journalCollect('prata');
          showPopup('✦ PRATA (FRAGMENTO)',['Melhor condutor elétrico e térmico','Liga-se ao estanho formando bronze','Usada pelos Incas em ornamentos','Hoje em circuitos e medicina'],'#c0c8d8');}
      }
      else if(c.type==='estanho'){this.score+=15;sfx('prata');burst(c.x+17,c.y+17,'#9aaab8',8);
        if(!this.items.includes('estanho_ok')){this.items.push('estanho_ok');journalCollect('estanho');
          showPopup('◆ ESTANHO (FRAGMENTO)',['Metal dúctil, baixo ponto de fusão','Encontrado junto à prata em Potosí','Liga + Cobre = Bronze (5.000 a.C.)','Bolívia: 2° maior reserva mundial'],'#9aaab8');}
      }
      else if(c.type==='tupu'){this.items.push('tupu');sfx('unlock');burst(c.x+17,c.y+17,'#c0c8d8',16);
        journalCollect('mapa_potosi');this.score+=50;
      }
    }

    if(isE()){
      for(const c of level.cols){
        if(c.done||!TOOL_TYPES.includes(c.type)) continue;
        if(!this.near({x:c.x,y:c.y,w:c.w,h:c.h},90)) continue;
        c.done=true;
        if(c.type==='picareta'){
          this.items.push('picareta');sfx('item');burst(c.x+17,c.y+17,'#c0c0d8',12);
          journalCollect('picareta_basica');
          showPopup('⛏ PICARETA COLETADA',['Extraia minerais das paredes rochosas','Ângulo oblíquo preserva o cristal','Essencial nas minas de Potosí','Equipe-a no Diário [I] para usar'],'#c0c0d8');
          notify('✦ Picareta coletada! Equipe-a no Diário [I].');
        } else if(c.type==='lanterna'){
          this.items.push('lanterna');sfx('item');burst(c.x+17,c.y+17,'#ffe080',14);
          showPopup('🔦 LANTERNA ENCONTRADA',['Ilumina as paredes de pedra vulcânica','Revela o brilho metálico da prata','Sem lanterna, a mina fica às escuras','Equipe-a no Diário [I] para usar'],'#ffe080');
          notify('✦ Lanterna coletada! Equipe-a no Diário [I].');
        } else if(c.type==='coca'){
          this.items.push('coca');sfx('coca');burst(c.x+17,c.y+17,'#3a9a38',10);
          showPopup('🌿 FOLHAS DE COCA',['Usadas contra o soroche há 4.000 anos','Sagradas para os povos andinos','Reduzem falta de ar na altitude','[E] para usar quando Soroche estiver alto'],'#3a9a38');
          notify('✦ Folhas de coca coletadas!');
        }
        break;
      }

      if(this.items.includes('coca')&&this.soroche>20){
        this.items=this.items.filter(i=>i!=='coca');
        if(this.activeTool==='coca') this.activeTool=null;
        this.soroche=Math.max(0,this.soroche-60);sfx('coca');
        burst(this.x+20,this.y-20,'#3a9a38',12);notify('✦ Folhas de coca usadas — fôlego recuperado!');
      }
      if(level.veins&&this.activeTool==='picareta'){
        for(const v of level.veins){
          if(!v.done&&this.near({x:v.x-28,y:v.y-28,w:56,h:56})){
            if(!G.dialog){v.tryMine();
              if(v.done){
                const t=v.type==='estanho'?'estanho':'prata';
                this.items.push(t+'_col');this.score+=25;
                burst(v.x,v.y,'#c0c0d8',14);sfx('prata');
                const cnt=level.veins.filter(vv=>vv.done).length;
                const tot=level.veins.length;
                notify(`✦ ${t==='estanho'?'Estanho':'Prata'} extraído! (${cnt}/${tot})`);
              }
            }break;
          }
        }
      } else if(level.veins&&this.activeTool!=='picareta'){
        for(const v of level.veins){
          if(!v.done&&this.near({x:v.x-28,y:v.y-28,w:56,h:56})){
            if(this.items.includes('picareta')) notify('Equipe a Picareta no Diário [I]!');
            else notify('Colete a Picareta primeiro!');
            break;
          }
        }
      }
      if(level.llama&&!level.llama.gifted&&this.near({x:level.llama.x-50,y:level.llama.y-60,w:100,h:60})){
        level.llama.gifted=true;sfx('coca');
        for(let i=0;i<12;i++)burst(level.llama.x,level.llama.y-30,'#3a9a38',1,2+Math.random()*2);
        this.items.push('coca');journalCollect('ceramica_inca');
        showDialog([
          '"Olá, linda lhama! Estes animais eram sagrados para os Incas — carregavam minérios pelas montanhas a 4.000 metros de altitude."',
          '"A lhama me olha e me oferece Folhas de Coca. Os povos andinos as usam há mais de 4.000 anos contra o Soroche — o mal de altitude."',
          '"Dentro da mina, a 4.000 metros, o ar é rarefeito. A barra de Soroche vai subir. Quando ficar vermelha, pressione [E] para mastigar as folhas."',
          '"Com a Picareta e as Folhas de Coca, estou pronto para entrar. Mas vou precisar de uma Lanterna — deve estar em algum lugar lá dentro!"'
        ],null,'CORVAN','#e0b840');
      }
      if(level.tupu&&!level.tupu.done&&this.near({x:level.tupu.x-30,y:level.tupu.y-30,w:60,h:60})){
        level.tupu.done=true;this.items.push('tupu');sfx('unlock');burst(level.tupu.x,level.tupu.y,'#c0c0d8',16);
        journalCollect('mapa_potosi');
        showDialog([
          '"O Tupu de Prata! Uma fivela ornamental usada pela nobreza Inca para prender mantos cerimoniais."',
          '"Para os Incas, a prata representava a Lua e tinha valor espiritual — não econômico. Era o metal dos deuses, não do comércio."',
          '"Diferente dos espanhóis, que fundiam tudo em moeda, os Incas criavam obras de arte com a prata de Potosí. Até os templos eram revestidos dela."',
          '"Preservar este artefato é preservar a memória de quem cuidou destas montanhas por séculos antes da colonização."'
        ],null,'CORVAN','#e0b840');
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

  _colX(plats){for(const p of plats){if(p.type==='spike'||p.type==='_dead')continue;
    if(this.overlaps(p)){if(this.y+this.h*0.5<=p.y)continue;
      if(this.vx>0)this.x=p.x-this.w;else this.x=p.x+p.w;this.vx=0;}}}
  _colY(plats){for(const p of plats){if(p.type==='spike'||p.type==='_dead')continue;
    if(p.type==='trapdoor'&&this.vy<0)continue;
    if(this.overlaps(p)){
      if(this.vy>=0){this.y=p.y-this.h;this.vy=0;this.onG=true;if(p.moving)this.onMoving=p;if(p.type==='trapdoor'&&p.crumble===undefined)p.crumble=70;}
      else{this.y=p.y+p.h;this.vy=Math.abs(this.vy)*0.2;}}}}
  _hurt(dmg,level){if(this.inv>0)return;this.hp-=dmg;this.inv=80;burst(this.x+20,this.y+40,'#ff4040',10);sfx('hit');if(this.hp<=0){this.hp=0;this.dead=true;}}

  draw(){
    if(this.dead)return;
    const S=1.5,CW=32*S,FOOT_Y=46*S;
    const dx=this.x-cam.x+this.w/2-CW/2;
    const dy=this.y-cam.y+this.h-FOOT_Y;
    const flip=this.facing===-1;
    const wf=this.state==='run'?this.walkT:(this.state==='idle'?Date.now()/800:0);
    ctx.save();drawCorvan(dx,dy,S,flip,wf,this.activeTool);ctx.restore();
    if(this.activeTool==='lanterna'){
      const gx=this.x-cam.x+(flip?-12:this.w+14),gy=this.y-cam.y+this.h*0.6;
      const lg=ctx.createRadialGradient(gx,gy,0,gx,gy,120);
      lg.addColorStop(0,'rgba(255,210,80,0.28)');lg.addColorStop(1,'rgba(255,210,80,0)');
      ctx.fillStyle=lg;ctx.fillRect(gx-120,gy-120,240,240);
    }
    if(this.inv>0&&Math.floor(this.inv/6)%2===0){ctx.fillStyle='rgba(255,60,60,0.35)';ctx.fillRect(this.x-cam.x,this.y-cam.y,this.w,this.h);}
    if(this.sorocheAnim>0){
      const a=this.sorocheAnim/80*0.45;ctx.fillStyle=`rgba(20,10,40,${a})`;ctx.fillRect(0,0,W,H);
      if(this.sorocheAnim>40){ctx.fillStyle=`rgba(120,80,200,${(this.sorocheAnim-40)/40*0.6})`;
        ctx.font='bold 26px "Courier New"';ctx.textAlign='center';ctx.fillText('⚠ SOROCHE! [E] Coca',W/2,90);ctx.textAlign='left';}
    }
  }
}

function drawBg(bgKey,dark=false){
  const img=IMG[bgKey];
  if(img&&img.complete&&img.naturalWidth>0){
    const sc=Math.max(W/img.naturalWidth,H/img.naturalHeight);
    ctx.drawImage(img,(W-img.naturalWidth*sc)/2,(H-img.naturalHeight*sc)/2,img.naturalWidth*sc,img.naturalHeight*sc);
  } else {
    const fb={bg01:'#0a0e2a',bg02:'#1a0e08',bgext:'#0a0e2a'};
    const grd=ctx.createLinearGradient(0,0,0,H);
    grd.addColorStop(0,fb[bgKey]||'#111');grd.addColorStop(1,'#050308');
    ctx.fillStyle=grd;ctx.fillRect(0,0,W,H);
  }
  const ovAlpha=dark?0.38:0.22;
  ctx.fillStyle=`rgba(0,0,0,${ovAlpha})`;ctx.fillRect(0,0,W,H);
}

function drawDarkness(player){
  if(player.activeTool!=='lanterna')return;
  const px=player.x-cam.x+player.w/2,py=player.y-cam.y+player.h*0.5;
  const darkCanvas=document.createElement('canvas');darkCanvas.width=W;darkCanvas.height=H;
  const dc=darkCanvas.getContext('2d');
  dc.fillStyle='rgba(0,0,0,0.72)';dc.fillRect(0,0,W,H);
  dc.globalCompositeOperation='destination-out';
  const lg=dc.createRadialGradient(px,py,20,px,py,220);
  lg.addColorStop(0,'rgba(0,0,0,1)');lg.addColorStop(0.7,'rgba(0,0,0,0.5)');lg.addColorStop(1,'rgba(0,0,0,0)');
  dc.fillStyle=lg;dc.beginPath();dc.arc(px,py,220,0,Math.PI*2);dc.fill();
  ctx.drawImage(darkCanvas,0,0);
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
  ctx.strokeStyle='rgba(200,200,220,0.18)';ctx.lineWidth=1;
  for(const w of windP){w.x+=w.spd;if(w.x>W)w.x=-100;
    ctx.beginPath();ctx.moveTo(w.x,w.y);ctx.lineTo(w.x+40,w.y+2);ctx.stroke();}
}

let mineP=[];function initMineDust(){mineP=[];for(let i=0;i<20;i++)mineP.push({x:Math.random()*3600,y:200+Math.random()*300,a:Math.random(),t:Math.random()*Math.PI*2});}
initMineDust();
function drawMineDust(){
  for(const p of mineP){p.t+=0.02;p.a=0.3+Math.sin(p.t)*0.25;
    const sx=p.x-cam.x;if(sx<-10||sx>W+10)continue;
    ctx.fillStyle=`rgba(180,160,140,${p.a})`;ctx.beginPath();ctx.arc(sx,p.y-cam.y,2,0,Math.PI*2);ctx.fill();}
}

function buildL1(){
  const FL=600,WW=3400,WH=900;
  const plats=[
    solid(0,FL,400,WH-FL),solid(480,FL,200,WH-FL),solid(760,FL,200,WH-FL),
    solid(1040,FL,220,WH-FL),solid(1340,FL,200,WH-FL),solid(1620,FL,220,WH-FL),
    solid(1920,FL,240,WH-FL),solid(2220,FL,200,WH-FL),solid(2500,FL,220,WH-FL),
    solid(2780,FL,800,WH-FL),
    solid(220,FL-180,130,18),solid(520,FL-240,110,18),solid(760,FL-180,130,18),
    solid(1000,FL-230,120,18),solid(1260,FL-180,130,18),solid(1540,FL-250,110,18),
    solid(1760,FL-180,130,18),solid(2040,FL-240,120,18),solid(2320,FL-180,110,18),
    solid(2560,FL-240,120,18),
    solid(400,FL-36,80,14),solid(660,FL-36,80,14),solid(900,FL-36,80,14),
    solid(1160,FL-36,80,14),solid(1460,FL-36,80,14),solid(1720,FL-36,80,14),
    solid(2040,FL-36,80,14),solid(2360,FL-36,80,14),solid(2640,FL-36,80,14),
    solid(1480,FL-90,200,18),   
    solid(1680,FL-90,80,90),
  ];
  const bats=[];
  const llama={x:3060,y:FL-42,gifted:false};
  const cols=[
    ...[100,240,520,780,1060,1360,1660,1960,2260,2580,2820,3000].map(x=>new Col(x,FL-50,'prata')),
    new Col(1620,FL-48,'picareta'),
  ];
  const triggers=[
    new Trigger(3140,FL-200,120,200,'Entrar na Mina',(player,level)=>{
      if(!player.items.includes('picareta')){notify('Colete a Picareta primeiro!');return;}
      if(!player.items.includes('coca')){notify('Fale com a Lhama para obter as Folhas de Coca!');return;}
      player.interactAnim=40;sfx('unlock');
      showDialog([
        '"Bem-vindo às alturas de Potosí, Bolívia — 4.090 metros de altitude. Esta é a Montanha Rica, o Cerro Rico."',
        '"No tempo do Império Inca, a prata extraída aqui decorava templos sagrados. Com os espanhóis, tornou-se a maior fonte de prata do mundo colonial."',
        '"Entre 1545 e 1825, estima-se que 45.000 toneladas de prata saíram daqui — mudando a economia global e financiando a Europa por séculos."',
        '"As Folhas de Coca vão nos ajudar contra o Soroche lá dentro. Mas primeiro precisamos encontrar uma lanterna — está em algum lugar na mina!"'
      ],()=>{notify('✦ Entrando na mina! Encontre a Lanterna lá dentro.');level.triggers[0].done=true;setTimeout(()=>G.nextLevel(),2000);});
    }),
  ];
  return{id:1,bg:'bgext',W:WW,H:WH,startX:60,startY:FL-90,underground:false,
    title:'Cena I — O Início em Potosí',
    hint:'⛏ Picareta na alcova • 🦙 Fale com a Lhama • Entre na mina →',
    plats,bats,cols,triggers,llama,veins:[],
    intro:[
      '"Bem-vindo ao Cerro Rico de Potosí, Bolívia — 4.090 metros de altitude. Uma das maiores jazidas de prata do mundo."',
      '"Os Incas mineravam aqui séculos antes dos espanhóis. A prata era símbolo lunar — dos deuses, não do comércio."',
      'Encontre a Picareta na alcova de pedra, converse com a Lhama para obter as Folhas de Coca, e entre na mina!'
    ],
    update(player){tickMoving(this.plats);tickTrapdoors(this.plats);for(const b of this.bats)b.update(player);for(const c of this.cols)c.tick();},
    draw(player){
      drawStars();drawWind();
      const alcovaCX=1630-cam.x;
      if(alcovaCX>-200&&alcovaCX<W+200&&!player.items.includes('picareta')){
        const ay=FL-120-cam.y;
        const a=0.55+Math.sin(Date.now()/450)*0.45;
        ctx.fillStyle=`rgba(200,200,220,${a})`;
        ctx.font='bold 12px "Courier New"';ctx.textAlign='center';
        ctx.fillText('⛏ alcova →',alcovaCX,ay);ctx.textAlign='left';
      }
      if(this.llama){
        const lx=this.llama.x-cam.x,ly=this.llama.y-cam.y;
        if(lx>-100&&lx<W+100){
          const bobSpeed=this.llama.gifted?400:600;
          drawLlama(lx,ly,Date.now()/bobSpeed);
          if(this.llama.gifted&&Math.abs(player.x-this.llama.x)<200){
            const ht=Date.now()/1000;
            const ha=Math.abs(Math.sin(ht))*0.8;
            ctx.fillStyle=`rgba(80,200,80,${ha})`;
            ctx.font='16px serif';ctx.textAlign='center';
            ctx.fillText('🌿',lx+Math.sin(ht*2)*12,ly-80+Math.sin(ht*1.5)*10);
            ctx.textAlign='left';
          }
          if(!this.llama.gifted&&Math.abs(player.x-this.llama.x)<140){
            ctx.fillStyle='rgba(0,0,0,0.82)';ctx.font='14px "Courier New"';
            const t2='[E] Cumprimentar a Lhama 🦙';const tw=ctx.measureText(t2).width+24;
            roundRect(lx-tw/2,ly-90,tw,24,4);ctx.fill();
            ctx.strokeStyle='#e0b840';ctx.lineWidth=1.5;roundRect(lx-tw/2,ly-90,tw,24,4);ctx.stroke();
            ctx.fillStyle='#e0b840';ctx.textAlign='center';ctx.fillText(t2,lx,ly-73);ctx.textAlign='left';
          }
          if(this.llama.gifted&&Math.abs(player.x-this.llama.x)<200){
            ctx.fillStyle='rgba(220,185,80,0.65)';ctx.font='12px "Courier New"';
            ctx.textAlign='center';ctx.fillText('Boa sorte na mina! 🦙',lx,ly-58);ctx.textAlign='left';
          }
        }
      }
      for(const b of this.bats)b.draw();for(const c of this.cols)c.draw(player.x,player.y);for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

function buildL2(){
  const FL=600,WW=3400,WH=900;
  const plats=[
    solid(0,FL,320,WH-FL),solid(400,FL,200,WH-FL),solid(680,FL,200,WH-FL),
    solid(960,FL,220,WH-FL),solid(1260,FL,200,WH-FL),solid(1540,FL,220,WH-FL),
    solid(1840,FL,200,WH-FL),solid(2120,FL,240,WH-FL),solid(2440,FL,200,WH-FL),
    solid(2720,FL,200,WH-FL),solid(3000,FL,560,WH-FL),
    solid(180,FL-200,130,18),solid(440,FL-250,120,18),solid(700,FL-200,120,18),
    solid(1000,FL-240,120,18),solid(1300,FL-200,130,18),solid(1580,FL-250,110,18),
    solid(1880,FL-200,120,18),solid(2180,FL-250,120,18),solid(2480,FL-200,110,18),
    solid(2760,FL-240,120,18),
    solid(320,FL-36,80,14),solid(600,FL-36,80,14),solid(880,FL-36,80,14),
    solid(1180,FL-36,80,14),solid(1460,FL-36,80,14),solid(1760,FL-36,80,14),
    solid(2060,FL-36,80,14),solid(2360,FL-36,80,14),solid(2640,FL-36,80,14),
    solid(2920,FL-36,80,14),
    solid(620,FL-120,80,18),solid(1100,FL-140,80,18),
    movH(1800,FL-100,90,1800,1960,2.0),movH(2500,FL-120,90,2500,2640,1.8),
    trap(1540,FL-80,110),
    spike(920,FL+8,80),spike(1680,FL+8,60),
  ];
  const veins=[
    new MineVein(440,FL-260,'prata'),
    new MineVein(1100,FL-250,'prata'),
    new MineVein(1880,FL-260,'estanho'),
  ];
  const cols=[
    ...[80,200,460,740,1020,1300,1600,1900,2200,2500,2780,3020,3160].map(x=>new Col(x,FL-50,'prata')),
    new Col(160,FL-80,'lanterna'),
  ];
  const bats=[new Bat(600,FL-200,100),new Bat(1200,FL-180,90),new Bat(1900,FL-220,110),new Bat(2600,FL-200,100)];
  const triggers=[
    new Trigger(3100,FL-260,140,260,'Avançar para Cena 3',(player,level)=>{
      if(!player.activeTool&&!player.items.includes('lanterna')){
        notify('Encontre a Lanterna na mina antes de avançar!');return;
      }
      const vDone=level.veins.filter(v=>v.done).length;
      if(vDone<2){notify(`Mine mais veios de prata! (${vDone}/2)`);return;}
      sfx('unlock');
      showDialog([
        '"Observe as paredes — esses veios cinza-brilhantes são prata. Ela se infiltrou em fendas rochosas junto com estanho durante atividade vulcânica."',
        '"A Prata não existe pura aqui — está em compostos como Argentita (Ag₂S). Precisamos da picareta para liberar os cristais sem fragmentá-los."',
        '"As paredes desta mina têm 500 anos de marcas de picareta. Cada golpe é um registro da história dos trabalhadores mitayos — indígenas forçados a trabalhar aqui."',
        '"Vamos mais fundo. O Tupu de Prata está nos níveis mais baixos desta caverna. Não se esqueça de usar as folhas de coca se sentir o Soroche!"'
      ],()=>{notify('✦ Continue mais fundo na mina!');level.triggers[0].done=true;setTimeout(()=>G.nextLevel(),2000);});
    }),
  ];
  return{id:2,bg:'bg02',W:WW,H:WH,startX:60,startY:FL-90,underground:true,
    title:'Cena II — Geologia e Solo da Mina',
    hint:'🔦 Ache a Lanterna na entrada • ⛏ [E] nos veios brilhantes • Soroche aumenta!',
    plats,bats,cols,triggers,veins,llama:null,
    intro:[
      '"Corvan entra na mina. Está escuro — mas há algo brilhando na entrada. Uma lanterna abandonada!"',
      '"Com a Lanterna em mãos, o caminho se ilumina. Os veios de prata nas paredes ficam visíveis."',
      'Pegue a 🔦 Lanterna na entrada, equipe-a no Diário [I] e use a ⛏ Picareta nos veios brilhantes!'
    ],
    update(player){tickMoving(this.plats);tickTrapdoors(this.plats);for(const v of this.veins)v.tick();for(const b of this.bats)b.update(player);for(const c of this.cols)c.tick();},
    draw(player){
      drawMineDust();
      for(const v of this.veins)v.draw();
      for(const b of this.bats)b.draw();for(const c of this.cols)c.draw(player.x,player.y);for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

function buildL3(){
  const FL=580,WW=3600,WH=900;
  const plats=[
    solid(0,FL,280,WH-FL),solid(360,FL,180,WH-FL),solid(620,FL,160,WH-FL),
    solid(880,FL,180,WH-FL),solid(1160,FL,180,WH-FL),solid(1440,FL,180,WH-FL),
    solid(1720,FL,180,WH-FL),solid(2000,FL,200,WH-FL),solid(2280,FL,180,WH-FL),
    solid(2560,FL,180,WH-FL),solid(2840,FL,200,WH-FL),solid(3120,FL,680,WH-FL),
    solid(160,FL-200,120,18),solid(400,FL-260,110,18),solid(660,FL-200,110,18),
    solid(940,FL-250,110,18),solid(1220,FL-200,120,18),solid(1500,FL-260,110,18),
    solid(1780,FL-200,110,18),solid(2060,FL-250,120,18),solid(2340,FL-200,110,18),
    solid(2620,FL-260,110,18),solid(2900,FL-200,120,18),
    solid(280,FL-36,80,14),solid(540,FL-36,80,14),solid(800,FL-36,80,14),
    solid(1080,FL-36,80,14),solid(1360,FL-36,80,14),solid(1640,FL-36,80,14),
    solid(1920,FL-36,80,14),solid(2200,FL-36,80,14),solid(2480,FL-36,80,14),
    solid(2760,FL-36,80,14),solid(3040,FL-36,80,14),
    movH(500,FL-110,80,500,620,2.0),movH(1100,FL-130,80,1100,1200,1.8),
    movH(1860,FL-110,80,1860,2000,2.2),movH(2580,FL-130,80,2580,2700,2.0),
    trap(880,FL-80,110),trap(1720,FL-80,110),trap(2560,FL-80,100),
    spike(620,FL+8,60),spike(1160,FL+8,60),spike(1960,FL+8,60),spike(2640,FL+8,60),
  ];
  const veins=[
    new MineVein(400,FL-280,'prata'),
    new MineVein(1000,FL-270,'prata'),
    new MineVein(1740,FL-280,'prata'),
    new MineVein(2400,FL-270,'estanho'),
  ];
  const tupu={x:3180,y:FL-80,done:false};
  const cols=[
    ...[80,200,380,640,900,1180,1460,1740,2020,2300,2580,2860,3060,3200].map(x=>new Col(x,FL-50,'prata')),
  ];
  const bats=[new Bat(480,FL-220,90),new Bat(900,FL-200,80),new Bat(1360,FL-220,90),
               new Bat(1800,FL-200,80),new Bat(2300,FL-220,90),new Bat(2800,FL-200,80)];
  const triggers=[
    new Trigger(3240,FL-200,160,200,'Subir ao Exterior',(player,level)=>{
      if(!player.items.includes('tupu')){notify('Encontre o Tupu de Prata primeiro!');return;}
      const vDone=level.veins.filter(v=>v.done).length;
      if(vDone<3){notify(`Mine mais veios! (${vDone}/3)`);return;}
      sfx('unlock');player.interactAnim=40;
      showDialog([
        '"Precisamos ter cuidado com o ritmo — a 4.000 metros, o ar é rarefeito e o corpo cansa o dobro."',
        '"Com a lanterna identifico o brilho metálico nas sombras. Cada veio conta a história geológica de milhões de anos de atividade vulcânica."',
        '"Estamos prontos para subir. O Tupu de Prata e os fragmentos coletados nos contam mais sobre esta civilização do que qualquer livro colonial."',
        '"Vamos sair da mina e registrar nossas descobertas. A Amazônia nos espera a seguir!"'
      ],()=>{level.triggers[0].done=true;setTimeout(()=>G.nextLevel(),2000);});
    }),
  ];
  return{id:3,bg:'bg02',W:WW,H:WH,startX:60,startY:FL-90,underground:true,
    title:'Cena III — A Coleta nas Câmaras Profundas',
    hint:'[E] nos veios de prata ⛏ | [E] para usar Coca 🌿 | Encontre o Tupu!',
    plats,bats,cols,triggers,veins,tupu,llama:null,
    intro:[
      '"As câmaras mais profundas da mina. O Soroche é mais intenso aqui — use as folhas de coca quando a barra ficar vermelha."',
      '"Minere os veios de prata nas paredes. O Tupu de Prata está guardado no fundo desta câmara."',
      'Mine 3 veios de prata e encontre o Tupu para completar a coleta!'
    ],
    update(player){tickMoving(this.plats);tickTrapdoors(this.plats);
      for(const v of this.veins)v.tick();for(const b of this.bats)b.update(player);for(const c of this.cols)c.tick();},
    draw(player){
      drawMineDust();
      if(!this.tupu.done){
        const tx=this.tupu.x-cam.x,ty=this.tupu.y-cam.y;
        if(tx>-80&&tx<W+80){
          ctx.fillStyle='#6a5040';ctx.fillRect(tx-30,ty,60,30);
          ctx.fillStyle='#8a6850';ctx.fillRect(tx-30,ty,60,5);
          drawTupu(tx,ty-10,Date.now()/600);
          if(Math.abs(player.x-this.tupu.x)<120){
            ctx.fillStyle='rgba(0,0,0,0.82)';ctx.font='14px "Courier New"';
            const lt='[E] Pegar o Tupu de Prata';const ltw=ctx.measureText(lt).width+24;
            roundRect(tx-ltw/2,ty-70,ltw,24,4);ctx.fill();
            ctx.strokeStyle='#c0c0d8';ctx.lineWidth=1.5;roundRect(tx-ltw/2,ty-70,ltw,24,4);ctx.stroke();
            ctx.fillStyle='#c0c0d8';ctx.textAlign='center';ctx.fillText(lt,tx,ty-53);ctx.textAlign='left';
          }
        }
      }
      for(const v of this.veins)v.draw();
      for(const b of this.bats)b.draw();for(const c of this.cols)c.draw(player.x,player.y);for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

function buildL4(){
  const FL=600,WW=2400,WH=900;
  const plats=[
    solid(0,FL,2400,WH-FL),
    solid(200,FL-200,140,18),solid(420,FL-280,120,18),solid(660,FL-200,140,18),
    solid(900,FL-260,120,18),solid(1140,FL-200,140,18),solid(1380,FL-280,120,18),
    solid(1620,FL-200,140,18),solid(1860,FL-260,120,18),solid(2100,FL-200,140,18),
  ];
  const cols=[
    ...[80,260,500,740,980,1220,1460,1700,1940].map(x=>new Col(x,FL-50,'prata')),
  ];
  const triggers=[
    new Trigger(2200,FL-200,160,200,'Completar Fase 1.1',(player,level)=>{
      if(!player.items.includes('tupu')){notify('Volte e encontre o Tupu de Prata!');return;}
      player.interactAnim=40;sfx('unlock');
      showDialog([
        '"Consegui! Este Tupu de Prata viajou séculos. A mineração excessiva deixou cicatrizes profundas nesta montanha — o Cerro Rico está oco por dentro."',
        '"Como guardião, meu trabalho é extrair o conhecimento sem apagar a história. A prata, para os Incas, era arte e espiritualidade. Para os colonizadores, era poder."',
        '"Esta diferença mudou o mundo: financiou guerras europeias, criou o sistema econômico global moderno e custou milhões de vidas indígenas e africanas escravizadas."',
        '"Itens registrados no Diário de Bordo. Nossa próxima parada: a Serra Pelada, na Amazônia brasileira — onde o ouro esconde segredos igualmente profundos."',
        '🏆 FASE 1.1 CONCLUÍDA! O Segredo de Potosí foi desvendado!'
      ],()=>{unlockPhase('1.2');G.state='complete';});
    }),
  ];
  return{id:4,bg:'bgext',W:WW,H:WH,startX:60,startY:FL-90,underground:false,
    title:'Cena IV — A Saída de Potosí',
    hint:'Chegue ao marco final para concluir a Fase 1.1!',
    plats,bats:[],cols,triggers,veins:[],llama:null,
    intro:[
      '"Corvan emerge da mina segurando o Tupu de Prata. O céu de Potosí está estrelado — a altitude torna as estrelas mais brilhantes."',
      '"A Fase 1.1 está quase completa. Chegue ao marco final para registrar todas as descobertas!"'
    ],
    update(player){for(const c of this.cols)c.tick();},
    draw(player){
      drawStars();drawWind();
      const fx=2240-cam.x,fy=FL-cam.y;
      ctx.fillStyle='#8a6030';ctx.fillRect(fx,fy-120,4,120);
      ctx.fillStyle='#c8a020';ctx.fillRect(fx+4,fy-120,40,24);
      ctx.fillStyle='#fff';ctx.font='bold 11px "Courier New"';ctx.fillText('FIM',fx+8,fy-103);
      for(const c of this.cols)c.draw(player.x,player.y);for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

function drawHUD(player,level){
  ctx.fillStyle='rgba(8,4,0,0.68)';ctx.fillRect(0,0,W,38);
  // Hearts
  for(let i=0;i<player.maxHp;i++){
    ctx.fillStyle=i<player.hp?'#c83020':'#334';
    ctx.beginPath();const hx=16+i*28,hy=10;
    ctx.arc(hx+5,hy+5,5,Math.PI,0);ctx.arc(hx+15,hy+5,5,Math.PI,0);
    ctx.lineTo(hx+20,hy+5);ctx.bezierCurveTo(hx+20,hy+14,hx+10,hy+18,hx+10,hy+18);
    ctx.bezierCurveTo(hx+10,hy+18,hx,hy+14,hx,hy+5);ctx.closePath();ctx.fill();
  }
  ctx.fillStyle='rgba(220,185,80,.9)';ctx.font='13px "Courier New"';ctx.textAlign='center';ctx.fillText(level.title,W/2,24);ctx.textAlign='left';
  ctx.fillStyle='#e0b840';ctx.font='bold 15px "Courier New"';ctx.textAlign='right';ctx.fillText('⭐ '+player.score,W-14,24);ctx.textAlign='left';

  const toolY=44;
  ctx.fillStyle='rgba(0,0,0,0.5)';roundRect(16,toolY,130,30,4);ctx.fill();
  ctx.strokeStyle=player.activeTool?'#e0b840':'#444';ctx.lineWidth=1.5;roundRect(16,toolY,130,30,4);ctx.stroke();
  if(player.activeTool&&ITEM_DEFS[player.activeTool]){
    const def=ITEM_DEFS[player.activeTool];
    ctx.font='16px serif';ctx.fillText(def.icon,24,toolY+21);
    ctx.font='12px "Courier New"';ctx.fillStyle='#e0b840';ctx.fillText(def.nome,46,toolY+21);
  } else {
    ctx.font='12px "Courier New"';ctx.fillStyle='#555';ctx.fillText('Sem ferramenta',24,toolY+21);
  }
  ctx.fillStyle='rgba(200,160,40,0.15)';roundRect(152,toolY,52,30,4);ctx.fill();
  ctx.strokeStyle='#8a6820';ctx.lineWidth=1.5;roundRect(152,toolY,52,30,4);ctx.stroke();
  ctx.font='bold 12px "Courier New"';ctx.fillStyle='#c0a030';ctx.textAlign='center';ctx.fillText('[I]',178,toolY+21);ctx.textAlign='left';

  let ix=W-16;const inv=[];
  if(player.items.includes('tupu'))    inv.push('✦ TUPU');
  if(player.items.includes('picareta'))inv.push('⛏ PICARETA');
  if(player.items.includes('lanterna'))inv.push('🔦 LANTERNA');
  if(player.items.includes('coca'))    inv.push('🌿 COCA');
  for(const it of inv){ctx.fillStyle='#e0b840';ctx.font='12px "Courier New"';ctx.textAlign='right';ctx.fillText(it,ix,toolY+21);ctx.textAlign='left';ix-=ctx.measureText(it).width+20;}
  if(player.soroche>20||level.underground){
    const pct=player.soroche/100,bW=140,bX=16,bY=44;
    ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(bX,bY,bW,12);
    const sc=pct<0.5?`rgb(${Math.round(100+pct*2*140)},180,100)`:(pct<0.8?'#e8a020':'#cc2020');
    ctx.fillStyle=sc;ctx.fillRect(bX,bY,bW*pct,12);
    ctx.strokeStyle='#c0a040';ctx.lineWidth=1;ctx.strokeRect(bX,bY,bW,12);
    ctx.fillStyle='#c0a040';ctx.font='10px "Courier New"';ctx.fillText('SOROCHE',bX+2,bY+10);
  }
  ctx.fillStyle='rgba(210,185,80,.7)';ctx.font='12px "Courier New"';ctx.textAlign='center';ctx.fillText(level.hint,W/2,H-10);ctx.textAlign='left';
  if(G.timeOnLevel<600){
    ctx.fillStyle='rgba(0,0,0,0.55)';ctx.fillRect(8,H-44,440,28);
    ctx.fillStyle='#aaa';ctx.font='12px "Courier New"';
    ctx.fillText('← → Mover   ↑/Espaço Pular   E Interagir/Minerar   [Stomp morcegos]',14,H-25);
  }
}

function drawTitle(){
  drawBg('bgext');ctx.fillStyle='rgba(0,0,0,0.52)';ctx.fillRect(0,0,W,H);
  drawStars();
  ctx.textAlign='center';
  ctx.shadowColor='#e0b840';ctx.shadowBlur=40;
  ctx.fillStyle='#e0b840';ctx.font='bold 46px "Courier New"';ctx.fillText('O SEGREDO DE POTOSÍ',W/2,220);
  ctx.shadowBlur=0;
  ctx.fillStyle='#c8a060';ctx.font='19px "Courier New"';ctx.fillText('Fase 1.1  —  Potosí, Bolívia',W/2,270);
  ctx.fillStyle=`rgba(220,185,80,${.55+Math.sin(Date.now()/550)*.4})`;ctx.font='19px "Courier New"';
  ctx.fillText('▶  Pressione ENTER para começar  ◀',W/2,454);
  ctx.fillStyle='#888';ctx.font='13px "Courier New"';
  ctx.fillText('← → Mover   ↑/Espaço Pular   E Interagir/Minerar',W/2,494);
  ctx.fillText('📚 Minerais e artefatos coletados vão para o Diário de Bordo!',W/2,516);
  ctx.textAlign='left';
}
function drawDeath(){
  ctx.fillStyle='rgba(0,0,0,0.72)';ctx.fillRect(0,0,W,H);
  ctx.textAlign='center';ctx.shadowColor='#ff4040';ctx.shadowBlur=30;
  ctx.fillStyle='#ff6060';ctx.font='bold 54px "Courier New"';ctx.fillText('VOCÊ CAIU!',W/2,H/2-50);
  ctx.shadowBlur=0;drawCorvan(W/2-24,H/2-20,3,false,Date.now()/200);
  ctx.fillStyle='#e0b840';ctx.font='20px "Courier New"';
  ctx.fillText('Pressione  R  para recomeçar',W/2,H/2+140);ctx.fillText(`Mortes: ${G.deaths}`,W/2,H/2+168);ctx.textAlign='left';
}
function drawComplete(){
  const gr=ctx.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#080408');gr.addColorStop(1,'#180c04');ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
  drawStars();
  const rg=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,500);rg.addColorStop(0,'rgba(220,185,80,.16)');rg.addColorStop(1,'rgba(220,185,80,0)');ctx.fillStyle=rg;ctx.fillRect(0,0,W,H);
  ctx.textAlign='center';ctx.shadowColor='#e0b840';ctx.shadowBlur=40;
  ctx.fillStyle='#e0b840';ctx.font='bold 42px "Courier New"';ctx.fillText('✦  FASE 1.1 CONCLUÍDA  ✦',W/2,118);
  ctx.shadowBlur=0;
  // Draw Corvan + Tupu
  drawCorvan(W/2-160,200,4,false,Date.now()/300);
  ctx.save();ctx.translate(W/2+80,280);ctx.scale(2.8,2.8);drawTupu(0,0,Date.now()/1000);ctx.restore();
  ctx.fillStyle='#e8d8a0';ctx.font='17px "Courier New"';ctx.fillText('O Segredo de Potosí foi desvendado!',W/2,196);
  const lines=['✦  Picareta — ferramenta da mineração andina','✦  Prata — melhor condutor, metal dos Incas','✦  Estanho — base do bronze por 5.000 anos','✦  Tupu de Prata — arte ornamental Inca','✦  Folhas de Coca — combate ao Soroche'];
  ctx.fillStyle='#c8b880';ctx.font='14px "Courier New"';lines.forEach((l,i)=>ctx.fillText(l,W/2,248+i*28));
  ctx.fillStyle='rgba(220,185,80,0.8)';ctx.font='14px "Courier New"';ctx.fillText('📚 Itens arquivados no Diário de Bordo!',W/2,400);
  ctx.fillStyle='#e0b840';ctx.font='16px "Courier New"';ctx.fillText(`Pontuação: ⭐ ${G.player?.score||0}   Mortes: ${G.deaths}`,W/2,428);
  ctx.fillStyle=`rgba(220,185,80,${.6+Math.sin(Date.now()/600)*.4})`;ctx.font='15px "Courier New"';
  ctx.fillText('Pressione ENTER para voltar ao início',W/2,458);ctx.textAlign='left';
}

const LEVELS=[buildL1,buildL2,buildL3,buildL4];
const G={
  state:'title',lvIdx:0,level:null,player:null,
  dialog:false,deaths:0,timeOnLevel:0,_storedItems:[],_storedScore:0,_storedTool:null,
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
  nextLevel(){this._storedItems=[...this.player.items];this._storedScore=this.player.score;
    this._storedTool=this.player.activeTool;
    if(this.lvIdx+1<LEVELS.length)this.load(this.lvIdx+1);else this.state='complete';},
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
    drawBg(this.level.bg,this.level.underground||false);
    for(const p of this.level.plats)drawPlatform(p);
    this.level.draw(this.player);
    drawParticles();
    if(this.level.underground)drawDarkness(this.player);
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
  if(G.state==='complete' &&jp['Enter']){G.deaths=0;G._storedItems=[];G._storedScore=0;G.state='title';}
  G.update();G.draw();clearJP();
}

if(!gameReady){(function loadLoop(){
  if(gameReady)return;requestAnimationFrame(loadLoop);
  ctx.fillStyle='#0a0608';ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#e0b840';ctx.font='bold 24px "Courier New"';ctx.textAlign='center';
  ctx.fillText(`Carregando${'.'.repeat(Math.floor(Date.now()/400)%4)}  ${assetsLoaded}/${totalAssets}`,W/2,H/2);
  ctx.textAlign='left';
})();}