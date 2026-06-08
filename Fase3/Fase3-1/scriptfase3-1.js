const SAVE_KEY='mineralis_save_v3';
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
  if(type==='jump')       {o.frequency.setValueAtTime(220,t);o.frequency.exponentialRampToValueAtTime(440,t+.14);g.gain.setValueAtTime(.13,t);g.gain.exponentialRampToValueAtTime(.001,t+.16);}
  else if(type==='halita'){o.type='triangle';o.frequency.setValueAtTime(1200,t);o.frequency.exponentialRampToValueAtTime(1800,t+.08);g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.001,t+.3);}
  else if(type==='gipso') {o.type='sine';o.frequency.setValueAtTime(280,t);o.frequency.exponentialRampToValueAtTime(140,t+.2);g.gain.setValueAtTime(.1,t);g.gain.exponentialRampToValueAtTime(.001,t+.25);}
  else if(type==='talhadeira'){o.type='square';o.frequency.setValueAtTime(160,t);o.frequency.exponentialRampToValueAtTime(80,t+.18);g.gain.setValueAtTime(.14,t);g.gain.exponentialRampToValueAtTime(.001,t+.2);}
  else if(type==='lampada'){o.type='sine';o.frequency.setValueAtTime(550,t);o.frequency.setValueAtTime(660,t+.1);o.frequency.setValueAtTime(440,t+.2);g.gain.setValueAtTime(.09,t);g.gain.exponentialRampToValueAtTime(.001,t+.4);}
  else if(type==='colapso'){o.type='sawtooth';o.frequency.setValueAtTime(120,t);o.frequency.exponentialRampToValueAtTime(40,t+.4);g.gain.setValueAtTime(.2,t);g.gain.exponentialRampToValueAtTime(.001,t+.5);}
  else if(type==='item')  {o.frequency.setValueAtTime(440,t);o.frequency.setValueAtTime(660,t+.1);o.frequency.setValueAtTime(880,t+.2);g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.001,t+.3);}
  else if(type==='unlock'){o.frequency.setValueAtTime(330,t);o.frequency.setValueAtTime(440,t+.15);o.frequency.setValueAtTime(660,t+.3);g.gain.setValueAtTime(.13,t);g.gain.exponentialRampToValueAtTime(.001,t+.5);}
  else if(type==='hit')   {o.type='sawtooth';o.frequency.setValueAtTime(200,t);o.frequency.exponentialRampToValueAtTime(60,t+.2);g.gain.setValueAtTime(.18,t);g.gain.exponentialRampToValueAtTime(.001,t+.22);}
  else if(type==='bison') {o.type='sine';o.frequency.setValueAtTime(180,t);o.frequency.setValueAtTime(140,t+.15);o.frequency.setValueAtTime(200,t+.3);g.gain.setValueAtTime(.1,t);g.gain.exponentialRampToValueAtTime(.001,t+.5);}
  o.start(t);o.stop(t+.7);
}

const IMG={};
let assetsLoaded=0,totalAssets=4,gameReady=false;
[['bg01','Assets/cena1_31.svg'],['bg02','Assets/cena2_31.svg'],
 ['bg03','Assets/cena3_31.svg'],['bg04','Assets/cena4_31.svg']].forEach(([key,src])=>{
  const img=new Image();
  img.onload=()=>{IMG[key]=img;if(++assetsLoaded>=totalAssets){gameReady=true;startGame();}};
  img.onerror=()=>{IMG[key]=null;if(++assetsLoaded>=totalAssets){gameReady=true;startGame();}};
  img.src=src;
});
IMG.card31=null;
(function(){const ci=new Image();ci.onload=()=>{IMG.card31=ci;};ci.onerror=()=>{IMG.card31=null;};ci.src='Assets/3_1_wieliczka.svg';})();

const keys={},jp={};
window.addEventListener('keydown',e=>{if(!keys[e.code])jp[e.code]=true;keys[e.code]=true;
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
  if((e.code==="KeyI"||e.code==="Tab")&&G.state==="playing"){e.preventDefault();if(G.player&&(INV.open||!BUBBLE.active))INV.toggle(G.player);}
  if(e.code==='Escape'&&INV.open){INV.close();}
  if(e.code==='Escape'&&G.miningWall){G.miningWall=null;G.angleChoice=null;G.dialog=false;}
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

const ITEM_DEFS={
  talhadeira:{
    cat:'ferramenta',nome:'Talhadeira de Madeira',icon:'🪓',
    journalId:'talhadeira',
    desc:'Ferramenta medieval para clivar o sal em blocos.\nGoIpe em ângulo reto produz arestas perfeitas de 90°.\nO sal (dureza 2,5 Mohs) cede limpo à talhadeira.',
    drawHand:'left',
  },
  corda_de_poco:{
    cat:'ferramenta',nome:'Corda de Poço',icon:'🪢',
    journalId:'corda_de_poco',
    desc:'Usada para descer entre os níveis da mina.\nSubstitui escadas verticais nas galerias mais profundas.\nFabricada com fibras de cânhamo trançado.',
    drawHand:'right',
  },
  lampada_de_sal:{
    cat:'ferramenta',nome:'Lâmpada de Sal',icon:'🕯️',
    journalId:'lampada_de_sal',
    desc:'Bloco de halita rosada aquecido por uma vela.\nO calor reduz a umidade local ao redor.\nChama oscilando para baixo = excesso de vapor d\'água.',
    drawHand:'right',
  },
  halita_cubica:{
    cat:'minerio',nome:'Halita Cúbica',icon:'🧊',
    journalId:'halita_cubica',
    desc:'Sal-gema com clivagem cúbica perfeita — 3 planos a 90°.\nGoIpe horizontal separa camadas horizontais.\nÚnico mineral consumido diretamente por humanos.',
  },
  halita_tabular:{
    cat:'minerio',nome:'Halita Tabular',icon:'◫',
    journalId:'halita_tabular',
    desc:'Forma tabular: cristais achatados em placas largas.\nResulta de crescimento lento em soluções diluídas.\nUsada pelos mineiros para revestir pisos de capelas.',
  },
  halita_prismatica:{
    cat:'minerio',nome:'Halita Prismática',icon:'💎',
    journalId:'halita_prismatica',
    desc:'Cristal prismático — colunas hexagonais comprimidas.\nForma-se em evaporação rápida de salmoura concentrada.\nHalita rosa: traços de ferro e manganês na estrutura.',
  },
  gipso:{
    cat:'minerio',nome:'Gipso (imitador)',icon:'⬜',
    journalId:'gipso',
    desc:'CaSO₄ — sulfato de cálcio branco, presente nas paredes.\nSimilar ao sal mas esfarela em pó ao ser golpeado.\nDureza 2 Mohs (mais mole que a halita): não range nos dentes.',
  },
  insignia_guilda:{
    cat:'artefato',nome:'Insígnia da Guilda de Sal',icon:'🛡️',
    journalId:'insignia_guilda',
    desc:'Brasão dos Salineiros de Wieliczka — século XIV.\nDois blocos de sal cruzados em campo de azul.\nProva de direitos trabalhistas: salário fixo e dias de descanso.',
  },
};

const INV={
  open:false,tab:0,cursor:0,
  TABS:[
    {id:'ferramenta',label:'🔧 Ferramentas',color:'#e8c850'},
    {id:'minerio',   label:'🧊 Minérios',   color:'#d0e0f0'},
    {id:'artefato',  label:'🏺 Artefatos',  color:'#d4a8c0'},
  ],
  tabItems(player){
    const cat=this.TABS[this.tab].id;
    let saved={};
    try{const s=localStorage.getItem(SAVE_KEY);if(s){const j=JSON.parse(s);saved=j.coletados||{};}}catch(e){}
    const _ALL_DEFS=Object.assign({},window.ALL_ITEM_DEFS||{},ITEM_DEFS);
    return Object.entries(_ALL_DEFS).filter(([id,def])=>{
      if(def.cat!==cat)return false;
      // Fase atual: só mostra se coletado nesta sessão
      if(id in ITEM_DEFS) return player.items.includes(id);
      return !!saved[def.journalId||id];
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
    ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);
    const PW=780,PH=480,PX=(W-PW)/2,PY=(H-PH)/2;
    ctx.shadowColor='rgba(0,0,0,0.8)';ctx.shadowBlur=20;
    ctx.fillStyle='rgba(6,4,10,0.97)';roundRect(PX,PY,PW,PH,16);ctx.fill();
    ctx.shadowBlur=0;
    ctx.strokeStyle='#7a5898';ctx.lineWidth=2.5;roundRect(PX,PY,PW,PH,16);ctx.stroke();
    ctx.strokeStyle='rgba(180,140,220,0.2)';ctx.lineWidth=1;roundRect(PX+4,PY+4,PW-8,PH-8,12);ctx.stroke();
    ctx.fillStyle='#d0a8e0';ctx.font='bold 16px "Courier New"';
    ctx.textAlign='center';ctx.fillText('📔 DIÁRIO DE BORDO',W/2,PY+28);ctx.textAlign='left';
    ctx.fillStyle='rgba(180,140,220,0.3)';ctx.fillRect(PX+16,PY+38,PW-32,1);
    const TAB_W=PW/3,TAB_Y=PY+44;
    this.TABS.forEach((tab,i)=>{
      const tx=PX+i*TAB_W,active=(i===this.tab);
      ctx.fillStyle=active?'rgba(180,140,220,0.18)':'rgba(0,0,0,0.3)';
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
        if(selected){ctx.fillStyle='rgba(180,140,220,0.18)';roundRect(PX+16,iy-10,COL_W,46,8);ctx.fill();ctx.strokeStyle='#d0a8e0';ctx.lineWidth=1.5;roundRect(PX+16,iy-10,COL_W,46,8);ctx.stroke();}
        ctx.font='24px serif';ctx.fillText(item.icon,PX+28,iy+22);
        ctx.font=(equipped?'bold ':'')+'14px "Courier New"';
        ctx.fillStyle=equipped?'#f0d8a0':(selected?'#e0d0f0':'#aaa');
        ctx.fillText(item.nome,PX+62,iy+16);
        if(equipped){ctx.fillStyle='rgba(180,140,220,0.22)';roundRect(PX+62,iy+20,80,16,4);ctx.fill();ctx.font='10px "Courier New"';ctx.fillStyle='#d0a8e0';ctx.fillText('▶ EQUIPADO',PX+66,iy+32);}
      });
      const sel=items[this.cursor];
      if(sel){
        ctx.fillStyle='rgba(180,140,220,0.08)';roundRect(DESC_X,CY,PW-DESC_X+PX-16,CH-10,8);ctx.fill();
        ctx.font='48px serif';ctx.textAlign='center';ctx.fillText(sel.icon,DESC_X+(PW-DESC_X+PX-16)/2,CY+70);ctx.textAlign='left';
        ctx.font='bold 15px "Courier New"';ctx.fillStyle='#d0a8e0';
        ctx.textAlign='center';ctx.fillText(sel.nome,DESC_X+(PW-DESC_X+PX-16)/2,CY+100);ctx.textAlign='left';
        const catLabel={ferramenta:'🔧 Ferramenta',minerio:'🧊 Minério',artefato:'🏺 Artefato'};
        ctx.font='11px "Courier New"';ctx.fillStyle='#888';
        ctx.textAlign='center';ctx.fillText(catLabel[sel.cat],DESC_X+(PW-DESC_X+PX-16)/2,CY+118);ctx.textAlign='left';
        ctx.fillStyle='rgba(180,140,220,0.25)';ctx.fillRect(DESC_X+20,CY+126,PW-DESC_X+PX-56,1);
        const descLines=sel.desc.split('\n');
        ctx.font='13px "Courier New"';ctx.fillStyle='#d8c8e8';
        descLines.forEach((l,i)=>{ctx.textAlign='center';ctx.fillText(l,DESC_X+(PW-DESC_X+PX-16)/2,CY+146+i*22);});
        ctx.textAlign='left';
        if(sel.cat==='ferramenta'){
          const btnTxt=player.activeTools.has(sel.id)?'[E] Desequipar':'[E] Equipar';
          const btnColor=player.activeTools.has(sel.id)?'rgba(180,60,20,0.3)':'rgba(180,140,220,0.2)';
          ctx.fillStyle=btnColor;roundRect(DESC_X+40,CY+CH-60,PW-DESC_X+PX-96,34,8);ctx.fill();
          ctx.strokeStyle=player.activeTools.has(sel.id)?'#c04020':'#d0a8e0';ctx.lineWidth=1.5;
          roundRect(DESC_X+40,CY+CH-60,PW-DESC_X+PX-96,34,8);ctx.stroke();
          ctx.font='bold 13px "Courier New"';ctx.fillStyle=player.activeTools.has(sel.id)?'#e06040':'#d0a8e0';
          ctx.textAlign='center';ctx.fillText(btnTxt,DESC_X+(PW-DESC_X+PX-16)/2,CY+CH-38);ctx.textAlign='left';
        }
      }
    }
    ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(PX,PY+PH-38,PW,38);
    ctx.fillStyle='rgba(180,140,220,0.3)';ctx.fillRect(PX+16,PY+PH-39,PW-32,1);
    ctx.font='11px "Courier New"';ctx.fillStyle='#888';ctx.textAlign='center';
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

let shakeAmt=0,shakeT=0;
function shake(amt=8,dur=20){shakeAmt=amt;shakeT=dur;}
function getShake(){if(shakeT>0){shakeT--;return{dx:(Math.random()-.5)*shakeAmt,dy:(Math.random()-.5)*shakeAmt};}shakeAmt=0;return{dx:0,dy:0};}

const cam={x:0,y:0};
function updateCam(px,worldW){cam.x+=(Math.max(0,Math.min(px-W/2+24,worldW-W))-cam.x)*0.12;}

const GRAV=0.46,PSPD=5.2,JUMPF=-12.0,MAXFALL=16;

const TILE_THEMES={
  1:{top:'#4a5050',body:'#252c2c',dark:'#131818'},
  2:{top:'#6a6050',body:'#36301e',dark:'#1c1810'},
  3:{top:'#706050',body:'#3a3020',dark:'#1e1810'},
  4:{top:'#7a6858',body:'#3e3225',dark:'#221a12'},
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
    ctx.fillStyle='#7a6040';const nc=Math.max(1,Math.floor(p.w/20));
    for(let i=0;i<nc;i++){const tx=sx+i*(p.w/nc);ctx.beginPath();ctx.moveTo(tx,sy+p.h);ctx.lineTo(tx+p.w/nc/2,sy);ctx.lineTo(tx+p.w/nc,sy+p.h);ctx.fill();}return;
  }
  if(p.type==='_dead')return;
  if(p.type==='trapdoor'){
    const al=p.crumble!==undefined?p.crumble/70:1;ctx.globalAlpha=al;
    ctx.fillStyle='#606840';ctx.fillRect(sx,sy,p.w,p.h);
    ctx.fillStyle='#808a60';ctx.fillRect(sx,sy,p.w,3);ctx.globalAlpha=1;return;
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
  if(tileTheme!==TILE_THEMES[1]){
    ctx.fillStyle='rgba(240,230,220,0.5)';
    for(let i=0;i<Math.floor(p.w/32);i++){
      const cx=sx+i*32+8,cy2=sy-3;
      ctx.beginPath();ctx.moveTo(cx,cy2);ctx.lineTo(cx+4,cy2-7);ctx.lineTo(cx+8,cy2);ctx.closePath();ctx.fill();
    }
  }
  if(p.moving){ctx.fillStyle='rgba(200,200,240,0.35)';ctx.fillRect(sx,sy,p.w,4);}
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
  r(7,3,18,2,'#2a1a08');r(9,1,14,4,'#3a2610');
  r(5,3,22,2,'#4a3010');
  r(13,0,6,3,'#b08030');r(14,0,4,2,'#ffe060');
  r(9,5,14,9,'#c88050');r(10,6,12,1,'#a86030');
  r(11,8,3,2,'#1a0a04');r(18,8,3,2,'#1a0a04');
  r(12,8,1,1,'#fff');r(19,8,1,1,'#fff');
  r(14,11,4,1,'#a86030');r(12,13,8,1,'#7a3820');
  r(13,14,6,2,'#c88050');
  r(8,16,16,13,'#b82010');r(15,17,2,1,'#8a1008');r(15,20,2,1,'#8a1008');r(15,23,2,1,'#8a1008');
  r(12,16,3,3,'#d03018');r(17,16,3,3,'#d03018');
  r(8,28,16,2,'#5a3010');r(14,28,4,2,'#c88020');
  r(9,30,14,12,'#5a4030');r(15,36,2,6,'#4a3020');
  r(3,16,5,12,'#b82010');r(3,28,5,3,'#a86030');
  r(24,16,5,12,'#b82010');r(24,28,5,3,'#a86030');
  r(9,42,6,4,'#2a1408');r(17,42,6,4,'#2a1408');
  r(8,44,8,2,'#1a0808');r(16,44,8,2,'#1a0808');
  ctx.fillStyle='#ffe060';ctx.globalAlpha=0.25*lb;ctx.beginPath();ctx.arc(16*S,1*S,4*S,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=1;
  _drawCorvanTools(activeTool,S,frame,lb);
  ctx.restore();
}

function drawBison(cx,cy,frame=0){
  ctx.save();ctx.translate(cx,cy);
  const bob=Math.sin(frame*0.7)*1.5;
  ctx.fillStyle='#5a4028';ctx.fillRect(-30,-20,60,38);
  ctx.fillStyle='#6a5030';ctx.fillRect(-28,-36,36,20);
  ctx.fillStyle='#4a3018';ctx.fillRect(-30,-22,20,30);
  ctx.fillStyle='#6a5030';ctx.fillRect(-36,-40+bob,28,26);
  ctx.fillStyle='#7a5a38';ctx.fillRect(-44,-32+bob,22,16);
  ctx.fillStyle='#1a1008';ctx.fillRect(-32,-38+bob,7,7);ctx.fillRect(-20,-38+bob,7,7);
  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.fillRect(-31,-37+bob,3,3);ctx.fillRect(-19,-37+bob,3,3);
  ctx.fillStyle='#3a2810';
  ctx.beginPath();ctx.moveTo(-30,-40+bob);ctx.quadraticCurveTo(-38,-54+bob,-28,-56+bob);ctx.lineTo(-26,-52+bob);ctx.quadraticCurveTo(-34,-52+bob,-28,-42+bob);ctx.fill();
  ctx.beginPath();ctx.moveTo(-18,-40+bob);ctx.quadraticCurveTo(-10,-54+bob,-20,-56+bob);ctx.lineTo(-22,-52+bob);ctx.quadraticCurveTo(-12,-52+bob,-18,-42+bob);ctx.fill();
  ctx.fillStyle='#1a1008';ctx.fillRect(-42,-28+bob,12,8);
  ctx.fillStyle='rgba(255,255,255,0.15)';ctx.fillRect(-40,-26+bob,4,3);
  ctx.fillStyle='#4a3018';
  ctx.fillRect(-26,16,12,22);ctx.fillRect(-10,16,12,22);
  ctx.fillRect(8,16,12,22);ctx.fillRect(18,16,12,22);
  ctx.fillStyle='#5a4028';ctx.fillRect(28,-14,8,16);
  ctx.fillStyle='#3a2818';ctx.fillRect(30,-4,4,8);
  ctx.strokeStyle='rgba(30,20,8,0.35)';ctx.lineWidth=1.5;
  for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(-28+i*9,-18);ctx.lineTo(-26+i*9,12);ctx.stroke();}
  ctx.restore();
}

function drawTalhadeira(cx,cy,bobT=0){
  ctx.save();ctx.translate(cx,cy+Math.sin(bobT)*5);
  const glow=ctx.createRadialGradient(0,0,0,0,0,22);
  glow.addColorStop(0,'rgba(180,160,100,0.3)');glow.addColorStop(1,'rgba(180,160,100,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,22,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#9a6828';ctx.fillRect(-4,-24,8,28);
  ctx.fillStyle='#b07838';ctx.fillRect(-3,-22,6,24);
  ctx.fillStyle='#8888a0';ctx.fillRect(-14,-28,28,8);
  ctx.fillStyle='#a0a0c0';ctx.fillRect(-14,-28,28,4);
  ctx.fillStyle='#c0c0e0';
  ctx.beginPath();ctx.moveTo(-16,-22);ctx.lineTo(16,-22);ctx.lineTo(12,-18);ctx.lineTo(-12,-18);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.6)';ctx.beginPath();ctx.arc(-10,-24,2,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

function drawCorda(cx,cy,bobT=0){
  ctx.save();ctx.translate(cx,cy+Math.sin(bobT)*5);
  const glow=ctx.createRadialGradient(0,0,0,0,0,20);
  glow.addColorStop(0,'rgba(180,150,80,0.3)');glow.addColorStop(1,'rgba(180,150,80,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,20,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#c09a50';ctx.lineWidth=4;
  ctx.beginPath();ctx.arc(0,0,14,0,Math.PI*1.7);ctx.stroke();
  ctx.strokeStyle='#a07a30';ctx.lineWidth=4;
  ctx.beginPath();ctx.arc(0,2,9,0.3,Math.PI*1.5);ctx.stroke();
  ctx.strokeStyle='#c09a50';ctx.lineWidth=3;
  ctx.beginPath();ctx.arc(2,4,5,0.6,Math.PI*1.4);ctx.stroke();
  ctx.fillStyle='#b08840';ctx.beginPath();ctx.arc(-4,-10,4,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#d0a850';ctx.beginPath();ctx.arc(-4,-10,2,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

function drawLampada(cx,cy,bobT=0){
  ctx.save();ctx.translate(cx,cy+Math.sin(bobT)*5);
  const t=Date.now()/600;
  const glow=ctx.createRadialGradient(0,-4,0,0,-4,32);
  glow.addColorStop(0,`rgba(255,160,80,${0.5+Math.sin(t)*0.15})`);glow.addColorStop(0.5,'rgba(240,100,60,0.2)');glow.addColorStop(1,'rgba(240,80,40,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,-4,32,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#e8b0a0';ctx.fillRect(-11,-4,22,16);
  ctx.fillStyle='#f0c8b8';ctx.fillRect(-11,-4,22,6);
  ctx.fillStyle='#d49080';ctx.fillRect(-11,8,22,4);
  ctx.fillStyle='rgba(255,220,200,0.7)';ctx.fillRect(-8,-2,6,4);ctx.fillRect(2,2,4,3);
  ctx.fillStyle='#6a4020';ctx.fillRect(-1,-8,2,8);
  const fa=0.7+Math.sin(t*2.3)*0.3;
  ctx.fillStyle=`rgba(255,220,80,${fa})`;
  ctx.beginPath();ctx.ellipse(0,-14,4,8,Math.sin(t)*0.3,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=`rgba(255,255,200,${fa*0.8})`;
  ctx.beginPath();ctx.ellipse(0,-16,2,4,Math.sin(t)*0.2,0,Math.PI*2);ctx.fill();
  const ga=Math.abs(Math.sin(Date.now()/500));
  ctx.strokeStyle=`rgba(255,200,80,${ga*0.7})`;ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(4,-10);ctx.lineTo(8,-16);ctx.stroke();
  ctx.restore();
}

function drawHalitaItem(cx,cy,bobT=0,type='cubica'){
  ctx.save();ctx.translate(cx,cy+Math.sin(bobT)*5);
  const t=Date.now()/500;
  const colors={cubica:['#e8e0d0','#f0ece4','rgba(255,250,240,0.6)'],tabular:['#e0d8f0','#ece8f8','rgba(220,210,255,0.6)'],prismatica:['#f0d8e8','#f8e4f0','rgba(255,200,230,0.6)']};
  const [c1,c2,cg]=colors[type]||colors.cubica;
  const glow=ctx.createRadialGradient(0,0,0,0,0,24);
  glow.addColorStop(0,cg);glow.addColorStop(1,'rgba(240,230,220,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,24,0,Math.PI*2);ctx.fill();
  if(type==='cubica'){
    ctx.fillStyle=c1;ctx.fillRect(-12,-14,24,24);
    ctx.fillStyle=c2;ctx.fillRect(-12,-14,24,8);
    ctx.fillStyle='rgba(255,255,255,0.4)';ctx.fillRect(-12,-14,4,24);
    ctx.strokeStyle='rgba(180,170,160,0.6)';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(-12,0);ctx.lineTo(12,0);ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,-14);ctx.lineTo(0,10);ctx.stroke();
  } else if(type==='tabular'){
    ctx.fillStyle=c1;ctx.fillRect(-16,-6,32,14);
    ctx.fillStyle=c2;ctx.fillRect(-16,-6,32,4);
    ctx.fillStyle='rgba(255,255,255,0.35)';ctx.fillRect(-16,-6,8,14);
    ctx.strokeStyle='rgba(160,150,200,0.5)';ctx.lineWidth=1;
    for(let i=1;i<3;i++){ctx.beginPath();ctx.moveTo(-16,-6+i*4);ctx.lineTo(16,-6+i*4);ctx.stroke();}
  } else {
    ctx.fillStyle=c1;
    ctx.beginPath();ctx.moveTo(0,-18);ctx.lineTo(10,-8);ctx.lineTo(8,8);ctx.lineTo(-8,8);ctx.lineTo(-10,-8);ctx.closePath();ctx.fill();
    ctx.fillStyle=c2;
    ctx.beginPath();ctx.moveTo(0,-18);ctx.lineTo(10,-8);ctx.lineTo(0,-6);ctx.lineTo(-10,-8);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(255,200,220,0.5)';ctx.beginPath();ctx.arc(-2,-4,3,0,Math.PI*2);ctx.fill();
  }
  const sa=Math.abs(Math.sin(t));
  ctx.strokeStyle=`rgba(240,230,220,${sa*0.8})`;ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(8,-12);ctx.lineTo(13,-18);ctx.stroke();
  ctx.restore();
}

function drawInsignia(cx,cy,bobT=0){
  ctx.save();ctx.translate(cx,cy+Math.sin(bobT)*5);
  const glow=ctx.createRadialGradient(0,0,0,0,0,28);
  glow.addColorStop(0,'rgba(180,160,220,0.45)');glow.addColorStop(1,'rgba(120,100,180,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,28,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#3048a0';
  ctx.beginPath();ctx.moveTo(-14,-16);ctx.lineTo(14,-16);ctx.lineTo(18,-4);
  ctx.lineTo(0,16);ctx.lineTo(-18,-4);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#c0b060';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(-14,-16);ctx.lineTo(14,-16);ctx.lineTo(18,-4);
  ctx.lineTo(0,16);ctx.lineTo(-18,-4);ctx.closePath();ctx.stroke();
  ctx.fillStyle='#f0e8d8';
  ctx.save();ctx.translate(-5,-4);ctx.rotate(-0.4);ctx.fillRect(-6,-3,12,6);ctx.restore();
  ctx.save();ctx.translate(2,-2);ctx.rotate(0.4);ctx.fillRect(-6,-3,12,6);ctx.restore();
  const a=Math.abs(Math.sin(Date.now()/500));
  ctx.strokeStyle=`rgba(220,200,80,${a*0.8})`;ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(8,-14);ctx.lineTo(13,-20);ctx.stroke();
  ctx.restore();
}

class SaltWall{
  constructor(x,y,cleavage,humid=false){
    this.x=x;this.y=y;this.w=44;this.h=64;
    this.cleavage=cleavage;this.humid=humid;
    this.done=false;this.cracked=false;this.glowT=Math.random()*Math.PI*2;
    this.correctAngle={cubica:'H',tabular:'V',prismatica:'D'}[cleavage]||'H';
  }
  tick(){this.glowT+=0.04;}
  draw(lampOn){
    if(this.done)return;
    const sx=this.x-cam.x,sy=this.y-cam.y;
    if(sx<-100||sx>W+100)return;
    const a=this.cracked?0.4:(0.55+Math.abs(Math.sin(this.glowT))*0.35);
    ctx.fillStyle=this.humid?`rgba(80,90,100,${a*0.8})`:`rgba(230,218,200,${a})`;
    ctx.fillRect(sx,sy,this.w,this.h);
    if(this.humid){
      ctx.fillStyle=`rgba(40,80,120,${a*0.6})`;
      ctx.fillRect(sx+4,sy+8,14,20);ctx.fillRect(sx+22,sy+18,12,16);
      if(lampOn){
        const ha=0.6+Math.sin(Date.now()/200)*0.4;
        ctx.fillStyle=`rgba(255,80,80,${ha*0.6})`;ctx.fillRect(sx,sy,this.w,this.h);
        ctx.font='bold 11px "Courier New"';ctx.fillStyle=`rgba(255,100,100,${ha})`;
        ctx.textAlign='center';ctx.fillText('⚠ ÚMIDO',sx+22,sy-14);ctx.textAlign='left';
      } else {
        ctx.font='11px "Courier New"';ctx.fillStyle='rgba(120,160,180,0.7)';
        ctx.textAlign='center';ctx.fillText('~ úmido ~',sx+22,sy-12);ctx.textAlign='left';
      }
      return;
    }
    if(this.cleavage==='cubica'){
      ctx.strokeStyle=`rgba(180,170,160,${a*0.8})`;ctx.lineWidth=1.5;
      for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(sx,sy+i*22+10);ctx.lineTo(sx+this.w,sy+i*22+10);ctx.stroke();}
      for(let i=0;i<2;i++){ctx.beginPath();ctx.moveTo(sx+i*22+12,sy);ctx.lineTo(sx+i*22+12,sy+this.h);ctx.stroke();}
    } else if(this.cleavage==='tabular'){
      ctx.strokeStyle=`rgba(160,150,200,${a*0.8})`;ctx.lineWidth=1.5;
      for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(sx,sy+i*13+6);ctx.lineTo(sx+this.w,sy+i*13+6);ctx.stroke();}
    } else {
      ctx.strokeStyle=`rgba(200,160,180,${a*0.8})`;ctx.lineWidth=1.5;
      for(let i=0;i<3;i++){
        ctx.beginPath();ctx.moveTo(sx+i*16,sy);ctx.lineTo(sx+i*16+8,sy+this.h);ctx.stroke();
      }
    }
    const cg=ctx.createRadialGradient(sx+22,sy+32,4,sx+22,sy+32,36);
    cg.addColorStop(0,`rgba(255,240,220,${a*0.2})`);cg.addColorStop(1,'rgba(255,240,220,0)');
    ctx.fillStyle=cg;ctx.fillRect(sx-10,sy-10,this.w+20,this.h+20);
    if(this.cracked){
      ctx.strokeStyle='rgba(60,40,20,0.7)';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(sx+10,sy);ctx.lineTo(sx+18,sy+20);ctx.lineTo(sx+12,sy+40);ctx.stroke();
      ctx.beginPath();ctx.moveTo(sx+30,sy+10);ctx.lineTo(sx+24,sy+30);ctx.stroke();
    }
    const ha=0.5+Math.sin(Date.now()/400)*0.5;
    const cleavLabel={cubica:'Clivagem Cúbica [← H]',tabular:'Clivagem Tabular [▲ V]',prismatica:'Cristal Prismático [→ D]'};
    ctx.fillStyle=`rgba(220,210,180,${ha*0.8})`;ctx.font='bold 11px "Courier New"';
    ctx.textAlign='center';ctx.fillText('[E] Minerar',sx+22,sy-28);
    ctx.font='10px "Courier New"';ctx.fillStyle=`rgba(180,170,140,${ha*0.7})`;
    ctx.fillText(cleavLabel[this.cleavage],sx+22,sy-14);ctx.textAlign='left';
  }
}

class SaltExposition{
  constructor(x,y,type){this.x=x;this.y=y;this.type=type;this.examined=false;this.glowT=0;}
  tick(){this.glowT+=0.03;}
  examine(){if(!this.examined){this.examined=true;sfx('halita');burst(this.x,this.y-10,'#f0e8d0',10,2.5);}}
  draw(){
    const sx=this.x-cam.x,sy=this.y-cam.y;
    if(sx<-100||sx>W+100)return;
    const a=this.examined?0.3:(0.5+Math.abs(Math.sin(this.glowT))*0.4);
    ctx.fillStyle=`rgba(240,230,215,${a})`;
    ctx.beginPath();
    ctx.moveTo(sx-20,sy);ctx.lineTo(sx-10,sy-22);ctx.lineTo(sx+4,sy-28);
    ctx.lineTo(sx+18,sy-18);ctx.lineTo(sx+22,sy+4);ctx.lineTo(sx+8,sy+10);
    ctx.lineTo(sx-14,sy+8);ctx.closePath();ctx.fill();
    ctx.fillStyle=`rgba(240,200,185,${a*0.8})`;
    ctx.beginPath();ctx.ellipse(sx+2,sy-6,10,13,0.2,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=`rgba(255,245,235,${a*0.9})`;
    ctx.beginPath();ctx.arc(sx-4,sy-14,3,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(sx+12,sy-10,2.5,0,Math.PI*2);ctx.fill();
    if(!this.examined){
      const ha=0.5+Math.sin(Date.now()/400)*0.5;
      ctx.fillStyle=`rgba(220,200,160,${ha*0.9})`;ctx.font='bold 12px "Courier New"';
      ctx.textAlign='center';ctx.fillText('[E] Examinar Formação',sx,sy-38);ctx.textAlign='left';
    } else {
      ctx.fillStyle='rgba(180,170,140,0.6)';ctx.font='11px "Courier New"';
      ctx.textAlign='center';ctx.fillText('✔ Examinado',sx,sy-36);ctx.textAlign='left';
    }
  }
}

class Col{
  constructor(x,y,type){this.x=x;this.y=y;this.w=34;this.h=34;this.type=type;this.done=false;this.t=Math.random()*Math.PI*2;}
  tick(){if(!this.done)this.t+=0.06;}
  draw(playerX,playerY){
    if(this.done)return;
    const sx=this.x-cam.x,sy=this.y-cam.y;
    if(sx<-60||sx>W+60)return;
    const TOOL_TYPES=['talhadeira','corda_de_poco','lampada_de_sal'];
    const isTool=TOOL_TYPES.includes(this.type);
    if(isTool){
      const a=0.3+Math.abs(Math.sin(this.t*0.8))*0.5;
      const glow=ctx.createRadialGradient(sx+17,sy+17,4,sx+17,sy+17,32);
      glow.addColorStop(0,`rgba(220,200,160,${a})`);glow.addColorStop(1,'rgba(200,180,140,0)');
      ctx.fillStyle=glow;ctx.fillRect(sx-15,sy-15,64,64);
    }
    ctx.save();ctx.translate(sx+this.w/2,sy+this.h/2);
    if(this.type==='talhadeira')    drawTalhadeira(0,0,this.t);
    else if(this.type==='corda_de_poco') drawCorda(0,0,this.t);
    else if(this.type==='lampada_de_sal') drawLampada(0,0,this.t);
    else if(this.type==='halita_cubica')   drawHalitaItem(0,0,this.t,'cubica');
    else if(this.type==='halita_tabular')  drawHalitaItem(0,0,this.t,'tabular');
    else if(this.type==='halita_prismatica')drawHalitaItem(0,0,this.t,'prismatica');
    ctx.restore();
    if(isTool&&playerX!==undefined){
      const dist=Math.hypot(playerX+20-(this.x+17),playerY+40-(this.y+17));
      if(dist<110){
        const labels={talhadeira:'🪓 Talhadeira',corda_de_poco:'🪢 Corda de Poço',lampada_de_sal:'🕯️ Lâmpada de Sal'};
        const txt=`[E] Pegar ${labels[this.type]||this.type}`;
        const pulse=0.7+Math.sin(Date.now()/300)*0.3;
        ctx.font='bold 13px "Courier New"';
        const tw=ctx.measureText(txt).width+20;
        const bx=sx+17-tw/2,by=sy-42;
        ctx.fillStyle=`rgba(6,4,10,${0.88*pulse})`;roundRect(bx,by,tw,24,5);ctx.fill();
        ctx.strokeStyle=`rgba(200,180,240,${pulse})`;ctx.lineWidth=1.5;roundRect(bx,by,tw,24,5);ctx.stroke();
        ctx.fillStyle=`rgba(6,4,10,${0.88*pulse})`;
        ctx.beginPath();ctx.moveTo(sx+10,by+24);ctx.lineTo(sx+24,by+24);ctx.lineTo(sx+17,by+32);ctx.closePath();ctx.fill();
        ctx.strokeStyle=`rgba(200,180,240,${pulse})`;ctx.lineWidth=1.5;
        ctx.beginPath();ctx.moveTo(sx+10,by+24);ctx.lineTo(sx+17,by+32);ctx.lineTo(sx+24,by+24);ctx.stroke();
        ctx.fillStyle=`rgba(220,200,240,${pulse})`;
        ctx.textAlign='center';ctx.fillText(txt,sx+17,by+16);ctx.textAlign='left';
      }
    }
  }
}

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
    ctx.strokeStyle='#c0a0e0';ctx.lineWidth=1.5;roundRect(sx-tw/2,sy-16,tw,24,4);ctx.stroke();
    ctx.fillStyle='#c0a0e0';ctx.textAlign='center';ctx.fillText(txt,sx,sy);ctx.textAlign='left';
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
  active:false,queue:[],cb:null,lines:[],speakerTxt:'CORVAN',speakerColor:'#d0a8e0',faceFrame:0,
  show(msgs,cb,speaker='CORVAN',color='#d0a8e0'){this.queue=[...msgs];this.cb=cb;this.active=true;this.speakerTxt=speaker;this.speakerColor=color;G.dialog=true;this._next();},
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
    ctx.fillStyle='rgba(6,4,10,0.96)';roundRect(bx,by,bubW,bubH,14);ctx.fill();
    ctx.shadowBlur=0;
    ctx.strokeStyle=this.speakerColor;ctx.lineWidth=2.5;roundRect(bx,by,bubW,bubH,14);ctx.stroke();
    ctx.strokeStyle='rgba(180,140,220,0.2)';ctx.lineWidth=1;roundRect(bx+4,by+4,bubW-8,bubH-8,10);ctx.stroke();
    const tbx=Math.max(bx+30,Math.min(pcx,bx+bubW-30));
    const tty=by+bubH,tipy=Math.min(pcy,tty+38);
    ctx.fillStyle='rgba(6,4,10,0.96)';ctx.beginPath();ctx.moveTo(tbx-14,tty);ctx.lineTo(tbx+14,tty);ctx.lineTo(pcx,tipy);ctx.closePath();ctx.fill();
    ctx.strokeStyle=this.speakerColor;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(tbx-14,tty);ctx.lineTo(pcx,tipy);ctx.lineTo(tbx+14,tty);ctx.stroke();
    const fx=bx+facePad,fy=by+pad;
    ctx.fillStyle='rgba(14,8,20,0.85)';roundRect(fx,fy,faceW,faceH,6);ctx.fill();
    ctx.strokeStyle='rgba(180,140,220,0.45)';ctx.lineWidth=1.5;roundRect(fx,fy,faceW,faceH,6);ctx.stroke();
    const faceScale=faceW/18*0.82,sprX=fx+faceW/2-16*faceScale,sprY=fy+4;
    ctx.save();ctx.beginPath();roundRect(fx+1,fy+1,faceW-2,faceH-2,5);ctx.clip();
    const lampOn=G.player&&G.player.activeTools&&G.player.activeTools.has('lampada_de_sal');
    drawCorvan(sprX,sprY,faceScale,false,this.faceFrame*4,lampOn?'lampada_de_sal':null);
    const mouthY=sprY+13*faceScale,mouthX=sprX+12*faceScale,mouthW=8*faceScale;
    const open=Math.abs(Math.sin(this.faceFrame*4))*1.8*faceScale;
    if(open>0.5){ctx.fillStyle='#2a0e06';ctx.fillRect(mouthX,mouthY,mouthW,open);}
    ctx.restore();
    const tx=fx+faceW+facePad;
    ctx.font='bold 12px "Courier New"';ctx.fillStyle=this.speakerColor;ctx.fillText(this.speakerTxt,tx,by+pad+14);
    ctx.fillStyle='rgba(180,140,220,0.35)';ctx.fillRect(tx,by+pad+20,textW,1);
    ctx.font='15px "Courier New"';ctx.fillStyle='#f0e8f8';
    this.lines.forEach((l,i)=>ctx.fillText(l,tx,by+pad+40+i*lineH));
    const pulse=0.5+Math.sin(Date.now()/400)*0.5;
    ctx.fillStyle=`rgba(180,140,220,${pulse})`;ctx.font='12px "Courier New"';
    ctx.textAlign='right';ctx.fillText('[E] Continuar →',bx+bubW-pad,by+bubH-10);ctx.textAlign='left';
  }
};
function showDialog(msgs,cb,speaker='CORVAN',color='#d0a8e0'){BUBBLE.show(msgs,cb,speaker,color);}
function checkDlg(){if(G.dialog&&!INV.open&&!G.miningWall&&isE())BUBBLE.advance();}

let popup={active:false,timer:0,title:'',lines:[],color:'#d0e0f0'};
function showPopup(title,lines,color,ms=6500){popup={active:true,timer:ms,title,lines,color};}
function tickPopup(){if(popup.active&&popup.timer>0){popup.timer-=16;if(popup.timer<=0)popup.active=false;}}
function drawPopup(){
  if(!popup.active)return;
  const al=Math.min(1,popup.timer/400);ctx.save();ctx.globalAlpha=al;
  const pw=340,lineH=20,ph=popup.lines.length*lineH+80;
  const px=W-pw-18,py=56;
  ctx.fillStyle='rgba(6,4,10,0.94)';roundRect(px,py,pw,ph,10);ctx.fill();
  ctx.strokeStyle=popup.color;ctx.lineWidth=2;roundRect(px,py,pw,ph,10);ctx.stroke();
  ctx.strokeStyle='rgba(180,160,220,0.2)';ctx.lineWidth=1;roundRect(px+4,py+4,pw-8,ph-8,7);ctx.stroke();
  ctx.font='bold 13px "Courier New"';ctx.fillStyle=popup.color;ctx.textAlign='center';ctx.fillText(popup.title,px+pw/2,py+22);
  ctx.fillStyle='rgba(200,180,240,0.12)';ctx.fillRect(px+14,py+30,pw-28,1);
  ctx.font='12px "Courier New"';ctx.fillStyle='#e8e0f0';
  popup.lines.forEach((l,i)=>{ctx.textAlign='left';ctx.fillText('• '+l,px+16,py+48+i*lineH);});
  ctx.textAlign='left';ctx.restore();
}

let notifText='',notifAlpha=0,notifTimer=0;
function notify(msg,ms=2800){notifText=msg;notifTimer=ms;notifAlpha=1;}
function tickNotif(){if(notifTimer>0){notifTimer-=16;if(notifTimer<=0)notifAlpha=0;else notifAlpha=Math.min(1,notifTimer/300);}}
function drawNotif(){
  if(notifAlpha<=0)return;ctx.save();ctx.globalAlpha=notifAlpha;ctx.font='14px "Courier New"';
  const tw=ctx.measureText(notifText).width+32,nx=(W-tw)/2,ny=46;
  ctx.fillStyle='rgba(6,4,10,0.88)';roundRect(nx,ny,tw,28,6);ctx.fill();
  ctx.strokeStyle='#c0a0e0';ctx.lineWidth=1.5;roundRect(nx,ny,tw,28,6);ctx.stroke();
  ctx.fillStyle='#c0a0e0';ctx.textAlign='center';ctx.fillText(notifText,W/2,ny+19);ctx.textAlign='left';
  ctx.restore();
}

function drawAngleChoice(wall){
  if(!wall)return;
  ctx.fillStyle='rgba(0,0,0,0.62)';ctx.fillRect(0,0,W,H);
  const pw=560,ph=180,px=(W-pw)/2,py=H/2-ph/2-40;
  ctx.shadowColor='rgba(0,0,0,0.8)';ctx.shadowBlur=20;
  ctx.fillStyle='rgba(8,4,16,0.97)';roundRect(px,py,pw,ph,14);ctx.fill();
  ctx.shadowBlur=0;
  ctx.strokeStyle='#c0a0e0';ctx.lineWidth=2.5;roundRect(px,py,pw,ph,14);ctx.stroke();
  const cleavName={cubica:'Halita Cúbica',tabular:'Halita Tabular',prismatica:'Halita Prismática'}[wall.cleavage];
  ctx.font='bold 14px "Courier New"';ctx.fillStyle='#d0b8e8';
  ctx.textAlign='center';ctx.fillText(`Minerar: ${cleavName}`,W/2,py+26);
  ctx.fillStyle='rgba(180,140,220,0.3)';ctx.fillRect(px+16,py+34,pw-32,1);
  ctx.font='13px "Courier New"';ctx.fillStyle='#d0c8e0';
  ctx.fillText('Escolha o ângulo de golpe da talhadeira:',W/2,py+56);
  const opts=[
    {key:'H',label:'[←] Horizontal',desc:'Golpe paralelo ao chão'},
    {key:'V',label:'[▲] Vertical',desc:'Golpe de cima para baixo'},
    {key:'D',label:'[→] Diagonal',desc:'Golpe em 45° inclinado'},
  ];
  const sel=G.angleChoice;
  opts.forEach((o,i)=>{
    const ox=px+26+i*178,oy=py+72,ow=162,oh=70;
    const active=sel===o.key;
    ctx.fillStyle=active?'rgba(180,140,220,0.3)':'rgba(20,14,30,0.7)';
    roundRect(ox,oy,ow,oh,8);ctx.fill();
    ctx.strokeStyle=active?'#d0a8e0':'rgba(120,90,160,0.4)';ctx.lineWidth=active?2:1;
    roundRect(ox,oy,ow,oh,8);ctx.stroke();
    ctx.font='bold 14px "Courier New"';ctx.fillStyle=active?'#f0d8f8':'#a080c0';
    ctx.fillText(o.label,ox+ow/2,oy+28);
    ctx.font='11px "Courier New"';ctx.fillStyle=active?'#d0c0e0':'#787090';
    ctx.fillText(o.desc,ox+ow/2,oy+50);
  });
  const hintA=0.6+Math.sin(Date.now()/400)*0.4;
  ctx.font='12px "Courier New"';ctx.fillStyle=`rgba(180,160,220,${hintA})`;
  ctx.fillText(sel?'[E / Enter] Confirmar   [Esc] Cancelar':'[←] H   [▲] V   [→] D   [Esc] Cancelar',W/2,py+ph-14);
  ctx.textAlign='left';
}

class Player{
  constructor(x,y){
    this.x=x;this.y=y;this.w=26;this.h=68;
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
    if(G.miningWall){
      if(isL())G.angleChoice='H';
      if(isJ())G.angleChoice='V';
      if(isR())G.angleChoice='D';
      if(isE()&&G.angleChoice){
        this._resolveAngle(G.miningWall,G.angleChoice,level);
        G.miningWall=null;G.angleChoice=null;G.dialog=false;
      }
      return;
    }
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

    const TOOL_TYPES=['talhadeira','corda_de_poco','lampada_de_sal'];
    for(const c of level.cols){
      if(c.done||TOOL_TYPES.includes(c.type))continue;
      if(!this.overlaps(c))continue;
      c.done=true;
      if(c.type==='halita_cubica'||c.type==='halita_tabular'||c.type==='halita_prismatica'){
        this.score+=20;sfx('halita');
        burst(c.x+17,c.y+17,'#f0e8d0',10,3);
        this.items.push(c.type);
        notify(`🧊 ${ITEM_DEFS[c.type]?.nome} coletada!`);
      }
    }

    if(isE()){
      for(const c of level.cols){
        if(c.done||!TOOL_TYPES.includes(c.type))continue;
        if(!this.near({x:c.x,y:c.y,w:c.w,h:c.h},90))continue;
        c.done=true;
        if(c.type==='talhadeira'){
          this.items.push('talhadeira');this.activeTools.add('talhadeira');sfx('item');
          burst(c.x+17,c.y+17,'#c0b080',12);journalCollect('talhadeira');
          showPopup('🪓 TALHADEIRA COLETADA',['Ferramenta medieval de clivar blocos de sal','Ângulo correto: cubica=Horizontal V=Tabular D=Prismático','O sal (dureza 2,5 Mohs) cede em arestas de 90°','Equipe no Diário [I] para usar'],'#c8b870');
          notify('✦ Talhadeira coletada! Equipe-a no Diário [I].');
        } else if(c.type==='corda_de_poco'){
          this.items.push('corda_de_poco');sfx('item');
          burst(c.x+17,c.y+17,'#c0a850',10);journalCollect('corda_de_poco');
          showPopup('🪢 CORDA DE POÇO',['Fibra de cânhamo trançado — resistência medieval','Permite descer entre níveis da mina com segurança','Mineiros medievais desciam até 300m de profundidade','Essencial para alcançar as câmaras mais profundas'],'#b09848');
          notify('✦ Corda de Poço coletada!');
        }
        break;
      }

      if(level.bison&&!level.bison.gifted&&this.near({x:level.bison.x-60,y:level.bison.y-80,w:120,h:80})){
        level.bison.gifted=true;sfx('bison');
        for(let i=0;i<16;i++)burst(level.bison.x,level.bison.y-30,'#f0d0c0',1,2+Math.random()*2);
        this.items.push('lampada_de_sal');this.activeTools.add('lampada_de_sal');journalCollect('lampada_de_sal');
        showDialog([
          '"O Bisão Europeu — Żubr em polonês! Este animal quase desapareceu no século XX. Em 1927, apenas 54 sobreviventes viviam em cativeiro. Hoje, graças a programas de reintrodução, são mais de 7.000."',
          '"Ele me deixou uma Lâmpada de Sal — um bloco de halita rosada com uma vela. Os mineiros de Wieliczka usavam isso há séculos: o calor da vela aquece o sal, reduzindo a umidade local ao redor."',
          '"Mais importante: quando a chama da lâmpada oscila para baixo, significa excesso de vapor d\'água no ar — sinal de que a salmoura está infiltrando pelas paredes. Se ouvirmos estalos nas vigas: recuo imediato!"',
        ],null,'CORVAN','#d0a8e0');
      }

      if(level.expositions){
        for(const ex of level.expositions){
          if(!ex.examined&&this.near({x:ex.x-28,y:ex.y-28,w:56,h:56})){
            if(!G.dialog){
              ex.examine();
              const cnt=level.expositions.filter(e=>e.examined).length;
              const tot=level.expositions.length;
              if(cnt===1)showPopup('🧊 HALITA — SAL-GEMA',['Formada há 13 milhões de anos no Mioceno','Um mar raso cobria toda a Europa Central','Com a evaporação, o NaCl cristalizou em camadas','Clivagem cúbica: 3 planos perpendiculares a 90°'],'#d8d0f0');
              else if(ex.type==='gipso')showPopup('⬜ GIPSO — O IMITADOR',['CaSO₄ — sulfato de cálcio, presente nas paredes','Parece sal mas é diferente: esfarela ao golpe','Dureza 2 Mohs (abaixo do sal: 2,5 Mohs)','Não range nos dentes. A diferença salva vidas!'],'#e0e0d8');
              if(cnt===tot&&!level._expositionsDialogDone){
                level._expositionsDialogDone=true;
                showDialog([
                  '"Estas camadas de halita branca e rosada são um oceano fossilizado. Há 13 milhões de anos, um mar raso cobria toda a Europa Central. Com o calor do Mioceno, as águas evaporaram lentamente — deixando para trás sal puro em camadas perfeitas."',
                  '"Os mineiros medievais não sabiam disso, mas respeitavam o que encontravam. Eles não viam rocha — viam um presente sagrado da terra. E começaram a esculpir: capelas, estátuas, altares inteiros em sal."',
                  '"O gipso (CaSO₄) imita o sal nas paredes mas se esfarela ao golpe da talhadeira. A clivagem cúbica do sal é única: sempre se parte em ângulos de 90°, como um cubo perfeito."',
                ],(()=>{notify('✦ Busque as paredes de halita para minerar!');}),'CORVAN','#d0a8e0');
              }
              notify(`🧊 Formação examinada! (${cnt}/${tot})`);
            }
            break;
          }
        }
      }

      if(level.saltWalls&&!G.miningWall){
        for(const w of level.saltWalls){
          if(w.done)continue;
          if(!this.near({x:w.x,y:w.y,w:w.w,h:w.h},70))continue;
          if(!this.items.includes('talhadeira')){notify('Equipe a Talhadeira [I] primeiro!');break;}
          if(w.humid){
            if(this.activeTools.has('lampada_de_sal')){
              notify('🕯️ Lâmpada detectou umidade! Evite este trecho.');
            } else {
              sfx('colapso');shake(10,30);
              this._hurt(1,level,'colapso');
              burst(w.x+22,w.y,'#808090',14,3);
              w.cracked=true;
              notify('⚠ PAREDES ÚMIDAS! A lâmpada de sal detectaria isso!');
            }
            break;
          }
          G.miningWall=w;G.angleChoice=null;G.dialog=true;
          break;
        }
      }

      if(level.insigniaObj&&!level.insigniaObj.done&&this.near({x:level.insigniaObj.x-40,y:level.insigniaObj.y-40,w:80,h:40})){
        level.insigniaObj.done=true;this.items.push('insignia_guilda');this.score+=80;sfx('unlock');
        burst(level.insigniaObj.x,level.insigniaObj.y,'#c0b0e0',18,3);
        journalCollect('insignia_guilda');this.interactAnim=40;
        showDialog([
          '"A Insígnia da Guilda de Sal — o Grêmio dos Salineiros de Wieliczka! Este brasão com dois blocos de sal cruzados foi uma das primeiras formas de contrato trabalhista documentado da Europa."',
          '"No século XIV, os mineiros conseguiram direitos formalizados: salário fixo, dias de descanso obrigatórios, cobertura de acidentes. A palavra \'salário\' vem de \'sal\' — os soldados romanos eram pagos em sal."',
          '"Esta insígnia provava que o minerador tinha direitos. Que o trabalho tinha valor. Que o que era retirado da terra devia ser dividido com quem o tirava."',
        ],null,'CORVAN','#d0a8e0');
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

  _resolveAngle(wall,angle,level){
    if(angle===wall.correctAngle){
      wall.done=true;sfx('halita');
      burst(wall.x+22,wall.y+32,'#f0e8d0',12,3);
      const type='halita_'+wall.cleavage;
      this.items.push(type);this.score+=30;
      journalCollect(type);
      const popups={
        cubica:['🧊 HALITA CÚBICA','Clivagem cúbica perfeita — 3 planos a 90°','Único mineral consumido diretamente por humanos','O corpo adulto contém ~250g de sal','A palavra "salário" vem daqui!'],
        tabular:['◫ HALITA TABULAR','Crescimento lento em solução diluída','Usada para revestir pisos de capelas','13 milhões de anos de história fossilizada','Mineiros medievais esculpiam nela diretamente'],
        prismatica:['💎 HALITA PRISMÁTICA','Cristal prismático rosa: traços de Fe e Mn','Formação rápida em salmoura concentrada','A mais rara das formas de halita em Wieliczka','O brilho avermelhado vem de impurezas no NaCl'],
      }[wall.cleavage];
      showPopup(popups[0],popups.slice(1),wall.cleavage==='cubica'?'#d0e8f0':wall.cleavage==='tabular'?'#d0d0f0':'#f0d0e8');
      const cnt=level.saltWalls.filter(w=>w.done&&!w.humid).length;
      notify(`🧊 ${ITEM_DEFS[type]?.nome} coletada! (${cnt}/3)`);
    } else {
      sfx('gipso');shake(4,12);
      burst(wall.x+22,wall.y+20,'#d0c8b8',6,1.5);
      wall.cracked=true;
      notify('⚠ Ângulo errado — a parede rachou! Tente outra parede.');
    }
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
    const _dispTool=this.activeTools.has('lampada_de_sal')?'lampada_de_sal':this.activeTools.has('talhadeira')?'talhadeira':this.activeTools.has('corda_de_poco')?'corda_de_poco':null;
    ctx.save();drawCorvan(dx,dy,S,flip,wf,_dispTool);ctx.restore();
    if(this.inv>0&&Math.floor(this.inv/6)%2===0){ctx.fillStyle='rgba(255,60,60,0.35)';ctx.fillRect(this.x-cam.x,this.y-cam.y,this.w,this.h);}
  }
}

function drawBg(bgKey){
  const img=IMG[bgKey];
  if(img&&img.complete&&img.naturalWidth>0){
    const sc=Math.max(W/img.naturalWidth,H/img.naturalHeight);
    const iw=img.naturalWidth*sc,ih=img.naturalHeight*sc;
    ctx.drawImage(img,(W-iw)/2,(H-ih)/2,iw,ih);
  } else {
    const fb={bg01:'#3a4858',bg02:'#1a1508',bg03:'#100e14',bg04:'#080610'};
    const grd=ctx.createLinearGradient(0,0,0,H);
    grd.addColorStop(0,fb[bgKey]||'#111');grd.addColorStop(1,'#050308');
    ctx.fillStyle=grd;ctx.fillRect(0,0,W,H);
  }
  ctx.fillStyle='rgba(0,0,0,0.15)';ctx.fillRect(0,0,W,H);
}

let snowP=[];
function initSnow(){snowP=[];for(let i=0;i<60;i++)snowP.push({x:Math.random()*W,y:Math.random()*H,vy:0.4+Math.random()*0.8,vx:(Math.random()-.5)*0.3,r:1+Math.random()*2});}
initSnow();
function drawSnow(){
  ctx.fillStyle='rgba(230,238,248,0.75)';
  for(const p of snowP){
    p.y+=p.vy;p.x+=p.vx+Math.sin(Date.now()/2000+p.x)*0.15;
    if(p.y>H)p.y=-4;if(p.x>W)p.x=0;if(p.x<0)p.x=W;
    ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
  }
}

let crystalP=[];
function initCrystalP(){crystalP=[];for(let i=0;i<50;i++)crystalP.push({wx:Math.random()*3000+100,y:100+Math.random()*400,a:Math.random(),t:Math.random()*Math.PI*2});}
initCrystalP();
function drawCrystalSparkle(){
  for(const p of crystalP){
    p.t+=0.018;p.a=0.15+Math.abs(Math.sin(p.t))*0.45;
    const sx=p.wx-cam.x;if(sx<-10||sx>W+10)continue;
    ctx.fillStyle=`rgba(240,225,210,${p.a})`;
    ctx.beginPath();ctx.arc(sx,p.y,1.5+Math.sin(p.t+p.wx)*0.8,0,Math.PI*2);ctx.fill();
  }
}

function drawLampLight(player,lampOn){
  if(!lampOn){
    const px=player.x-cam.x+16,py=player.y-cam.y+34;
    const vg=ctx.createRadialGradient(px,py,80,px,py,500);
    vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(0.6,'rgba(0,0,0,0.45)');vg.addColorStop(1,'rgba(0,0,0,0.75)');
    ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
  } else {
    const px=player.x-cam.x+16,py=player.y-cam.y+34;
    const lg=ctx.createRadialGradient(px,py,30,px,py,280);
    lg.addColorStop(0,'rgba(255,180,80,0.18)');lg.addColorStop(0.5,'rgba(255,120,40,0.06)');lg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=lg;ctx.fillRect(0,0,W,H);
    const vg=ctx.createRadialGradient(px,py,140,px,py,500);
    vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(0.7,'rgba(0,0,0,0.3)');vg.addColorStop(1,'rgba(0,0,0,0.65)');
    ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
  }
}

function drawMineEntrance(worldX,floorY){
  const sx=worldX-cam.x,sy=floorY-cam.y;
  if(sx<-200||sx>W+200)return;
  ctx.fillStyle='#4a3010';ctx.fillRect(sx-30,sy-80,10,80);ctx.fillRect(sx+20,sy-80,10,80);
  ctx.fillStyle='#5a3818';ctx.fillRect(sx-38,sy-84,76,14);
  ctx.fillStyle='#050308';ctx.fillRect(sx-20,sy-70,40,72);
  const sg=ctx.createLinearGradient(sx-20,sy-70,sx+20,sy-70);
  sg.addColorStop(0,'rgba(0,0,0,0.6)');sg.addColorStop(0.3,'rgba(0,0,0,0)');sg.addColorStop(0.7,'rgba(0,0,0,0)');sg.addColorStop(1,'rgba(0,0,0,0.6)');
  ctx.fillStyle=sg;ctx.fillRect(sx-20,sy-70,40,72);
  for(let i=0;i<3;i++){ctx.fillStyle='#4a3010';ctx.fillRect(sx-22,sy-60+i*22,44,4);}
  ctx.font='bold 12px "Courier New"';ctx.fillStyle='#c8a060';
  ctx.textAlign='center';ctx.fillText('↓ Wieliczka ↓',sx,sy-92);ctx.textAlign='left';
}

function drawCathedralDetail(floorY){
  const cx=W/2+cam.x*0.3;
  const cy=80;
  ctx.fillStyle='rgba(240,220,200,0.4)';ctx.fillRect(cx-2,cy-20,4,40);
  const cglow=ctx.createRadialGradient(cx,cy+40,10,cx,cy+40,80);
  cglow.addColorStop(0,'rgba(240,210,180,0.3)');cglow.addColorStop(1,'rgba(240,210,180,0)');
  ctx.fillStyle=cglow;ctx.fillRect(cx-80,cy,160,120);
  for(let i=0;i<8;i++){
    const a=i/8*Math.PI*2,r=40;
    const ex=cx+Math.cos(a)*r,ey=cy+40+Math.sin(a)*20;
    ctx.strokeStyle='rgba(220,200,180,0.5)';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(cx,cy+40);ctx.lineTo(ex,ey);ctx.stroke();
    ctx.fillStyle='rgba(240,220,210,0.8)';
    ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(ex-4,ey+12);ctx.lineTo(ex+4,ey+12);ctx.closePath();ctx.fill();
  }
  const ly=floorY-cam.y+20;
  if(ly>0&&ly<H){
    const lg=ctx.createLinearGradient(0,ly,0,ly+60);
    lg.addColorStop(0,'rgba(80,140,180,0.3)');lg.addColorStop(1,'rgba(40,80,120,0)');
    ctx.fillStyle=lg;ctx.fillRect(300,ly,W-600,80);
    ctx.strokeStyle='rgba(120,180,220,0.25)';ctx.lineWidth=1;
    for(let i=0;i<6;i++){
      ctx.beginPath();ctx.moveTo(300,ly+i*10);ctx.quadraticCurveTo(W/2,ly+i*10-4,W-300,ly+i*10);ctx.stroke();
    }
  }
}

function drawHUD(player,level){
  ctx.fillStyle='rgba(6,4,10,0.85)';ctx.fillRect(0,0,W,38);
  ctx.fillStyle='rgba(160,120,200,0.2)';ctx.fillRect(0,36,W,2);
  for(let i=0;i<player.maxHp;i++){
    ctx.fillStyle=i<player.hp?'#c040a0':'#334';
    ctx.beginPath();const hx=16+i*28,hy=10;
    ctx.arc(hx+5,hy+5,5,Math.PI,0);ctx.arc(hx+15,hy+5,5,Math.PI,0);
    ctx.lineTo(hx+20,hy+5);ctx.bezierCurveTo(hx+20,hy+14,hx+10,hy+18,hx+10,hy+18);
    ctx.bezierCurveTo(hx+10,hy+18,hx,hy+14,hx,hy+5);ctx.closePath();ctx.fill();
  }
  ctx.fillStyle='#c8b8d8';ctx.font='20px "Courier New"';
  ctx.textAlign='center';ctx.fillText(level.title,W/2,24);ctx.textAlign='left';
  ctx.fillStyle='#d0a8e0';ctx.font='bold 20px "Courier New"';
  ctx.textAlign='right';ctx.fillText('🧊 '+player.score,W-14,26);ctx.textAlign='left';

  const PX=12,PY=46,PW=190,PH_BASE=52;
  const TOOL_DEFS=[{id:'talhadeira',icon:'🪓',nome:'Talhadeira'},{id:'corda_de_poco',icon:'🪢',nome:'Corda'},{id:'lampada_de_sal',icon:'🕯️',nome:'Lâmpada'}];
  const tools=TOOL_DEFS.filter(t=>player.items.includes(t.id));
  const PH=PH_BASE+(tools.length>0?6+tools.length*22:0);
  ctx.save();
  ctx.shadowColor='rgba(0,0,0,0.7)';ctx.shadowBlur=8;
  ctx.fillStyle='rgba(6,4,10,0.88)';roundRect(PX,PY,PW,PH,6);ctx.fill();
  ctx.shadowBlur=0;
  ctx.strokeStyle='#7a5898';ctx.lineWidth=1.5;roundRect(PX,PY,PW,PH,6);ctx.stroke();
  ctx.restore();
  const midX=PX+PW/2,kw=26,kx=PX+PW-kw-6,ky=PY+5;
  ctx.font='11px serif';ctx.fillStyle='#a080c0';ctx.fillText('📔',PX+8,PY+20);
  ctx.font='bold 10px "Courier New"';ctx.fillStyle='#a080c0';ctx.fillText('DIÁRIO DE BORDO',PX+24,PY+20);
  ctx.fillStyle='rgba(160,120,200,0.2)';roundRect(kx,ky,kw,18,3);ctx.fill();
  ctx.strokeStyle='#9070c0';ctx.lineWidth=1;roundRect(kx,ky,kw,18,3);ctx.stroke();
  ctx.font='bold 10px "Courier New"';ctx.fillStyle='#c0a0e0';ctx.textAlign='center';ctx.fillText('[I]',kx+kw/2,ky+13);ctx.textAlign='left';
  ctx.fillStyle='rgba(160,120,200,0.3)';ctx.fillRect(PX+6,PY+26,PW-12,1);
  const atY=PY+44;ctx.textAlign='center';
  ctx.font='12px "Courier New"';ctx.fillStyle='#c0b8d0';
  if(player.activeTools.size>0){
    const eq=[...player.activeTools].filter(id=>ITEM_DEFS[id]).map(id=>ITEM_DEFS[id].icon).join(' ');
    ctx.fillStyle='#f0d060';ctx.fillText(eq+' equipado(s)',midX,atY);
  } else {ctx.fillText('Sem ferramenta',midX,atY);}
  ctx.textAlign='left';
  if(tools.length>0){
    ctx.fillStyle='rgba(160,120,200,0.3)';ctx.fillRect(PX+6,PY+PH_BASE,PW-12,1);
    tools.forEach((t,i)=>{
      const ty=PY+PH_BASE+8+i*22,equipped=player.activeTools.has(t.id);
      ctx.textAlign='center';ctx.font='11px serif';ctx.fillStyle=equipped?'#f0d060':'#8060a0';
      ctx.fillText(t.icon+' '+t.nome+(equipped?' ◀':''),midX,ty+10);ctx.textAlign='left';
    });
  }

  if(level.id===3){
    const halitas=['halita_cubica','halita_tabular','halita_prismatica'].map(k=>player.items.includes(k)?1:0);
    const hasInsignia=player.items.includes('insignia_guilda');
    const ox=W/2+200,oy=48;
    ctx.fillStyle='rgba(6,4,10,0.88)';roundRect(ox,oy,180,76,6);ctx.fill();
    ctx.strokeStyle='#d0a8e0';ctx.lineWidth=1.5;roundRect(ox,oy,180,76,6);ctx.stroke();
    ctx.font='bold 12px "Courier New"';ctx.fillStyle='#d0a8e0';
    ctx.textAlign='center';ctx.fillText('MINERAÇÃO',ox+90,oy+18);ctx.textAlign='left';
    ctx.fillStyle='rgba(160,120,200,0.3)';ctx.fillRect(ox+8,oy+24,164,1);
    const icons=['🧊','◫','💎'];
    icons.forEach((ic,i)=>{
      ctx.font='18px serif';ctx.fillStyle=halitas[i]?'#f0e8d0':'#334';
      ctx.textAlign='center';ctx.fillText(ic,ox+22+i*46,oy+52);ctx.textAlign='left';
    });
    ctx.font='16px serif';ctx.fillStyle=hasInsignia?'#c0b0e0':'#334';
    ctx.textAlign='center';ctx.fillText('🛡️',ox+22+3*46,oy+50);ctx.textAlign='left';
  }

  const hintText=typeof level.hint==='function'?level.hint(player):level.hint;
  ctx.fillStyle='#a898c0';ctx.font='18px "Courier New"';
  ctx.textAlign='center';ctx.fillText(hintText,W/2,H-10);ctx.textAlign='left';
}

function drawTitle(){
  drawBg('bg01');
  ctx.fillStyle='rgba(0,0,0,0.55)';ctx.fillRect(0,0,W,H);
  drawSnow();
  ctx.textAlign='center';
  ctx.shadowColor='#c0a0e0';ctx.shadowBlur=40;
  ctx.fillStyle='#d0a8e0';ctx.font='bold 46px "Courier New"';ctx.fillText('O Palácio Subterrâneo',W/2,148);
  ctx.shadowBlur=0;
  ctx.fillStyle='#c0b0d0';ctx.font='19px "Courier New"';ctx.fillText('Fase 3.1  —  Minas de Sal de Wieliczka, Polônia',W/2,200);
  if(IMG.card31){
    const cs=160,cardX=W/2-80,cardY=230;
    const glow=ctx.createRadialGradient(W/2,cardY+80,0,W/2,cardY+80,130);
    glow.addColorStop(0,'rgba(200,170,240,0.25)');glow.addColorStop(1,'rgba(200,170,240,0)');
    ctx.fillStyle=glow;ctx.beginPath();ctx.arc(W/2,cardY+80,130,0,Math.PI*2);ctx.fill();
    ctx.drawImage(IMG.card31,cardX,cardY,cs,cs);
  } else {
    ctx.save();ctx.translate(W/2,310);ctx.scale(3,3);drawHalitaItem(0,0,Date.now()/1000,'prismatica');ctx.restore();
  }
  ctx.fillStyle=`rgba(200,180,240,${.55+Math.sin(Date.now()/550)*.4})`;ctx.font='19px "Courier New"';
  ctx.fillText('▶  Pressione ENTER para começar  ◀',W/2,454);
  ctx.fillStyle='#c0c8d8';ctx.font='18px "Courier New"';
  ctx.fillText('← → Mover   |   ↑ Espaço Pular   |   E Interagir   |   I Diário de Bordo',W/2,500);
  ctx.fillText('[M] Menu Principal',W/2,538);
  ctx.textAlign='left';
}

function drawDeath(){
  ctx.fillStyle='rgba(0,0,0,0.72)';ctx.fillRect(0,0,W,H);
  const cause=G.player?.deathCause||'queda';
  const msgs={queda:'VOCÊ CAIU!',rocha:'QUE ESPETO!',colapso:'DESMORONAMENTO!'};
  const subs={queda:'Você caiu no abismo.',rocha:'Cuidado com as estacas!',colapso:'A galeria desabou!'};
  ctx.textAlign='center';ctx.shadowColor='#ff4060';ctx.shadowBlur=30;
  ctx.fillStyle='#ff6080';ctx.font='bold 54px "Courier New"';ctx.fillText(msgs[cause]||msgs.queda,W/2,H/2-50);
  ctx.shadowBlur=0;
  ctx.fillStyle='#cc8898';ctx.font='16px "Courier New"';ctx.fillText(subs[cause]||subs.queda,W/2,H/2-10);
  drawCorvan(W/2-24,H/2+10,3,false,Date.now()/200,'lampada_de_sal');
  ctx.fillStyle='#d0a8e0';ctx.font='20px "Courier New"';
  ctx.fillText('Pressione  R  para recomeçar',W/2,H/2+140);ctx.fillText(`Mortes: ${G.deaths}`,W/2,H/2+168);
  ctx.fillStyle='#888';ctx.font='15px "Courier New"';ctx.fillText('[M] Menu Principal',W/2,H/2+200);
  ctx.textAlign='left';
}

function drawComplete(){
  const gr=ctx.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#060410');gr.addColorStop(1,'#100818');ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
  drawCrystalSparkle();
  const rg=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,500);rg.addColorStop(0,'rgba(180,140,220,.18)');rg.addColorStop(1,'rgba(180,140,220,0)');ctx.fillStyle=rg;ctx.fillRect(0,0,W,H);
  ctx.textAlign='center';ctx.shadowColor='#d0a8e0';ctx.shadowBlur=40;
  ctx.fillStyle='#d0a8e0';ctx.font='bold 40px "Courier New"';ctx.fillText('✦  FASE 3.1 CONCLUÍDA  ✦',W/2,110);
  ctx.shadowBlur=0;
  drawCorvan(W/2-170,200,4,false,Date.now()/300,'lampada_de_sal');
  ctx.save();ctx.translate(W/2+80,280);ctx.scale(2.8,2.8);drawInsignia(0,0,Date.now()/1000);ctx.restore();
  ctx.fillStyle='#e8d8f0';ctx.font='16px "Courier New"';ctx.fillText('O Palácio Subterrâneo foi revelado!',W/2,192);
  const lines=['🪓  Talhadeira — clivagem cúbica, ângulo de 90°','🧊  Halita — o único mineral que consumimos diretamente','🕯️  Lâmpada de Sal — detecção de umidade medieval','🛡️  Insígnia da Guilda — os primeiros direitos trabalhistas'];
  ctx.fillStyle='#c0b8d8';ctx.font='14px "Courier New"';lines.forEach((l,i)=>ctx.fillText(l,W/2,244+i*28));
  ctx.fillStyle='#b0a8c8';ctx.font='16px "Courier New"';ctx.fillText(`Pontuação: 🧊 ${G.player?.score||0}   Mortes: ${G.deaths}`,W/2,428);
  ctx.fillStyle=`rgba(200,180,240,${.6+Math.sin(Date.now()/600)*.4})`;ctx.font='15px "Courier New"';
  ctx.fillText('✦ Fase 3.2 desbloqueada!   [M] Menu Principal',W/2,458);ctx.textAlign='left';
}


function buildL1(){
  const FL=570,WW=3200,WH=900;
  const plats=[
    solid(0,FL,380,WH-FL),solid(460,FL,200,WH-FL),solid(740,FL,200,WH-FL),
    solid(1020,FL,220,WH-FL),solid(1320,FL,200,WH-FL),solid(1600,FL,220,WH-FL),
    solid(1900,FL,240,WH-FL),solid(2200,FL,200,WH-FL),solid(2480,FL,220,WH-FL),
    solid(2760,FL,600,WH-FL),
    solid(220,FL-200,130,18),solid(500,FL-240,110,18),solid(760,FL-180,130,18),
    solid(1000,FL-230,120,18),solid(1260,FL-180,130,18),solid(1540,FL-250,110,18),
    solid(1760,FL-180,130,18),solid(2040,FL-240,120,18),solid(2320,FL-180,110,18),
    solid(400,FL-36,80,14),solid(660,FL-36,80,14),solid(900,FL-36,80,14),
    solid(1160,FL-36,80,14),solid(1460,FL-36,80,14),solid(1720,FL-36,80,14),
    solid(2040,FL-36,80,14),solid(2360,FL-36,80,14),solid(2640,FL-36,80,14),
    movH(1400,FL-120,100,1400,1560,1.8),
    trap(1100,FL-60,100),
    spike(860,FL-18,60),
  ];
  const cols=[
    new Col(700,FL-50,'talhadeira'),
    new Col(1500,FL-50,'corda_de_poco'),
  ];
  const bison={x:2960,y:FL-38,gifted:false};
  const triggers=[
    new Trigger(3060,FL-200,100,200,'Descer na Mina',(player,level)=>{
      if(!player.items.includes('corda_de_poco')){notify('Encontre a Corda de Poço antes de descer!');return;}
      if(!player.items.includes('lampada_de_sal')){notify('Interaja com o Bisão para obter a Lâmpada de Sal!');return;}
      if(level._advFired)return;level._advFired=true;sfx('unlock');
      showDialog([
        '"Estamos na Polônia medieval, por volta de 1280. Esta abertura no chão é a entrada de Wieliczka — uma das maiores e mais antigas minas de sal do mundo, com mais de 300 km de galerias em 9 níveis."',
        '"Os mineiros que trabalham aqui passam mais horas no subsolo do que na superfície. Com o tempo, começaram a esculpir capelas, estátuas e câmaras inteiras na rocha de sal — porque quando você vive tanto tempo no escuro, precisa criar beleza para não perder o sentido."',
        '"Com a Talhadeira, a Corda de Poço e a Lâmpada de Sal, podemos descer com segurança. A lâmpada vai me avisar de zonas de alta umidade — onde o sal se dissolve e o colapso é iminente."',
      ],()=>{notify('✦ Descendo para as galerias de sal!');level.triggers[0].done=true;setTimeout(()=>G.nextLevel(),2000);});
    },true),
  ];
  return{id:1,bg:'bg01',W:WW,H:WH,startX:60,startY:FL-90,
    title:'Entrada de Wieliczka',
    hint(player){
      if(!player.items.includes('talhadeira'))return '🪓 Encontre a Talhadeira de Madeira →';
      if(!player.items.includes('corda_de_poco'))return '🪢 Encontre a Corda de Poço →';
      if(!player.items.includes('lampada_de_sal'))return '🦬 Interaja com o Bisão Europeu →';
      return '✦ Ferramentas obtidas — desça na mina →';
    },
    plats,cols,triggers,bison,expositions:null,saltWalls:null,insigniaObj:null,
    intro:[
      '"Estamos em 1280 na Polônia medieval. Esta aldeia tem uma torre de guindaste e uma fila de trabalhadores carregando blocos brancos — estamos em Wieliczka!"',
      '"Ao longe vejo os telhados de Cracóvia. Preciso encontrar a Talhadeira e a Corda de Poço espalhadas pelos arredores — e o Bisão Europeu na borda da floresta me dará algo essencial."',
      'Colete as ferramentas e interaja com o Bisão Europeu para avançar!',
    ],
    update(player){
      tickMoving(this.plats);tickTrapdoors(this.plats);
      for(const c of this.cols)c.tick();
      const ent=this.triggers[0];
      if(!ent.done&&!G.dialog){
        if(player.items.includes('corda_de_poco')&&player.items.includes('lampada_de_sal')){
          if(player.x+player.w>=ent.x&&player.x<=ent.x+ent.w+60)ent.fn(player,this);
        }
      }
    },
    draw(player){
      drawSnow();
      const hg=ctx.createLinearGradient(0,0,0,200);hg.addColorStop(0,'rgba(80,100,140,0.35)');hg.addColorStop(1,'rgba(80,100,140,0)');
      ctx.fillStyle=hg;ctx.fillRect(0,0,W,200);
      ctx.fillStyle='rgba(40,50,70,0.5)';
      for(let i=0;i<12;i++){const bx=i*110-cam.x*0.05-40,bh=30+Math.sin(i*2.1)*15;ctx.fillRect(bx,H/2-bh,18,bh);}
      drawMineEntrance(3080,FL);
      if(this.bison){
        const gx=this.bison.x-cam.x,gy=this.bison.y-cam.y;
        if(gx>-200&&gx<W+200){
          drawBison(gx,gy,Date.now()/600);
          if(!this.bison.gifted&&Math.abs(player.x-this.bison.x)<160){
            ctx.fillStyle='rgba(0,0,0,0.82)';ctx.font='14px "Courier New"';
            const t2='[E] Interagir com o Bisão Europeu 🦬';const tw=ctx.measureText(t2).width+24;
            roundRect(gx-tw/2,gy-110,tw,24,4);ctx.fill();
            ctx.strokeStyle='#d0a8e0';ctx.lineWidth=1.5;roundRect(gx-tw/2,gy-110,tw,24,4);ctx.stroke();
            ctx.fillStyle='#d0a8e0';ctx.textAlign='center';ctx.fillText(t2,gx,gy-93);ctx.textAlign='left';
          }
          if(this.bison.gifted){
            ctx.fillStyle='rgba(200,180,230,0.6)';ctx.font='12px "Courier New"';
            ctx.textAlign='center';ctx.fillText('Boa sorte nas profundezas! 🦬',gx,gy-80);ctx.textAlign='left';
          }
        }
      }
      for(const c of this.cols)c.draw(player.x,player.y);
      for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

function buildL2(){
  const FL=580,WW=2800,WH=900;
  const plats=[
    solid(0,FL,300,WH-FL),solid(380,FL,200,WH-FL),solid(660,FL,200,WH-FL),
    solid(940,FL,220,WH-FL),solid(1220,FL,200,WH-FL),solid(1500,FL,220,WH-FL),
    solid(1780,FL,200,WH-FL),solid(2060,FL,200,WH-FL),solid(2340,FL,520,WH-FL),
    solid(180,FL-200,130,18),solid(420,FL-250,120,18),solid(700,FL-200,120,18),
    solid(1000,FL-240,120,18),solid(1280,FL-200,130,18),solid(1560,FL-250,110,18),
    solid(1840,FL-200,120,18),
    solid(300,FL-36,80,14),solid(580,FL-36,80,14),solid(860,FL-36,80,14),
    solid(1160,FL-36,80,14),solid(1440,FL-36,80,14),solid(1720,FL-36,80,14),
    movH(1600,FL-120,100,1600,1760,1.9),
    spike(860,FL-18,60),spike(1700,FL-18,50),
    trap(1180,FL-60,100),
    solid(1980,FL+80,200,WH-FL-80),
    solid(2160,FL+160,200,WH-FL-160),
  ];
  const expositions=[
    new SaltExposition(380,FL-260,'halita'),
    new SaltExposition(1060,FL-260,'gipso'),
    new SaltExposition(1840,FL-240,'halita'),
  ];
  const triggers=[
    new Trigger(2620,FL-250,140,300,'Avançar para a Câmara de Coleta',(player,level)=>{
      const exDone=level.expositions.filter(e=>e.examined).length;
      if(exDone<2){notify(`Examine mais formações de sal! (${exDone}/3)`);return;}
      if(!player.items.includes('corda_de_poco')){notify('Você precisa da Corda de Poço para descer!');return;}
      if(level._advFired)return;level._advFired=true;sfx('unlock');
      showDialog([
        '"O que vejo não é rocha — é mar. Este sal foi um oceano há 13 milhões de anos. Quando as águas evaporaram no calor do Mioceno, deixaram para trás camadas perfeitas de cloreto de sódio — intercaladas com argila e gipso."',
        '"Os mineiros medievais não sabiam disso, mas respeitavam o que encontravam: esculpiam anjos e santos diretamente nas paredes de sal, porque achavam que estavam trabalhando dentro de um presente sagrado da terra."',
        '"O gipso (CaSO₄) parece sal nas paredes mas se esfarela ao golpe da talhadeira — muito diferente da clivagem cúbica perfeita da halita. Reconhecer a diferença é questão de sobrevivência aqui embaixo."',
        '"Com a Corda de Poço consigo descer para as câmaras mais profundas onde a halita é mais pura e os cristais mais impressionantes. A Lâmpada de Sal vai me guiar — sua chama detecta o vapor de água."',
      ],()=>{notify('✦ Desça para a câmara de coleta!');level.triggers[0].done=true;setTimeout(()=>G.nextLevel(),2000);});
    }),
  ];
  return{id:2,bg:'bg02',W:WW,H:WH,startX:60,startY:FL-90,
    title:'As Galerias de Cristal',
    hint(player){
      const exDone=this.expositions?this.expositions.filter(e=>e.examined).length:0;
      return exDone<3?`🧊 Examine as formações de sal [E] (${exDone}/3) →`:'✦ Galerias examinadas — avance para a coleta →';
    },
    plats,triggers,expositions,saltWalls:null,insigniaObj:null,cols:[],bison:null,
    intro:[
      '"Corvan desce pela Corda de Poço para a segunda galeria — as paredes transitam do marrom-arenoso para o branco-cristalino puro."',
      '"A Lâmpada de Sal lança luz avermelhada que reflete em milhares de facetas cúbicas da halita — como um corredor de espelhos dourados e rosados."',
      'Examine ao menos 2 formações de sal para entender a geologia antes de avançar!',
    ],
    update(player){
      tickMoving(this.plats);tickTrapdoors(this.plats);
      for(const ex of this.expositions)ex.tick();
    },
    draw(player){
      const lampOn=player.activeTools.has('lampada_de_sal');
      drawLampLight(player,lampOn);
      drawCrystalSparkle();
      ctx.fillStyle='rgba(230,218,202,0.25)';
      for(let i=0;i<20;i++){
        const cx=(i*140+70)-cam.x,cy=50+Math.sin(i*1.7)*30;
        if(cx<-40||cx>W+40)continue;
        ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx-7,cy+18+Math.sin(i)*6);ctx.lineTo(cx+7,cy+18+Math.sin(i)*6);ctx.closePath();ctx.fill();
      }
      for(const ex of this.expositions)ex.draw();
      for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

function buildL3(){
  const FL=580,WW=2800,WH=900;
  const plats=[
    solid(0,FL,280,WH-FL),solid(360,FL,200,WH-FL),solid(640,FL,200,WH-FL),
    solid(920,FL,220,WH-FL),solid(1200,FL,200,WH-FL),solid(1480,FL,220,WH-FL),
    solid(1760,FL,200,WH-FL),solid(2040,FL,240,WH-FL),solid(2320,FL,520,WH-FL),
    solid(160,FL-200,130,18),solid(400,FL-250,120,18),solid(680,FL-200,120,18),
    solid(980,FL-240,120,18),solid(1260,FL-200,130,18),solid(1540,FL-250,110,18),
    solid(1820,FL-200,120,18),solid(2100,FL-240,130,18),
    solid(300,FL-36,80,14),solid(580,FL-36,80,14),solid(860,FL-36,80,14),
    solid(1140,FL-36,80,14),solid(1420,FL-36,80,14),solid(1700,FL-36,80,14),
    solid(1980,FL-36,80,14),
    movH(1440,FL-130,100,1440,1600,2.0),movH(2200,FL-150,100,2200,2360,1.7),
    spike(2100,FL-18,60),
    trap(940,FL-50,100),
  ];
  const saltWalls=[
    new SaltWall(440,FL-120,'cubica',false),
    new SaltWall(900,FL-160,'tabular',false),
    new SaltWall(1340,FL-120,'prismatica',false),
    new SaltWall(680,FL-110,'cubica',true),
    new SaltWall(1160,FL-130,'tabular',true),
  ];
  const insigniaObj={x:2200,y:FL-80,done:false};
  const triggers=[
    new Trigger(2640,FL-250,100,250,'Avançar para a Câmara-Catedral',(player,level)=>{
      const halitas=['halita_cubica','halita_tabular','halita_prismatica'];
      const hasAll=halitas.every(h=>player.items.includes(h));
      if(!hasAll){
        const cnt=halitas.filter(h=>player.items.includes(h)).length;
        notify(`Colete mais halita com a Talhadeira! (${cnt}/3)`);return;
      }
      if(!player.items.includes('insignia_guilda')){notify('Encontre a Insígnia da Guilda na câmara lateral!');return;}
      if(level._advFired)return;level._advFired=true;sfx('unlock');
      showDialog([
        '"Consegui! As 3 formas de halita — cúbica, tabular e prismática — e a Insígnia da Guilda de Sal."',
        '"A Lâmpada de Sal me salvou duas vezes: detectou as zonas úmidas antes que eu tentasse minerar. Sem ela, a parede teria desabado."',
        '"O ângulo certo da talhadeira não é por acaso — é química cristalina. A clivagem da halita segue os planos de ligação iônica do NaCl. Golpe em ângulo reto = bloco limpo. Ângulo errado = fragmentos inúteis e paredes danificadas."',
      ],()=>{notify('✦ Avançando para a Câmara-Catedral!');level.triggers[0].done=true;setTimeout(()=>G.nextLevel(),2000);});
    }),
  ];
  return{id:3,bg:'bg03',W:WW,H:WH,startX:60,startY:FL-90,
    title:'A Câmara de Coleta',
    hint(player){
      const halitas=['halita_cubica','halita_tabular','halita_prismatica'];
      const cnt=halitas.filter(h=>player.items.includes(h)).length;
      const hasInsignia=player.items.includes('insignia_guilda');
      if(cnt<3)return `🪓 Minere halita [E] — Blocos: ${cnt}/3`;
      if(!hasInsignia)return '🛡️ Encontre a Insígnia da Guilda mais à frente!';
      return '✦ Tudo coletado — avance para a Câmara-Catedral →';
    },
    plats,saltWalls,insigniaObj,triggers,expositions:null,bison:null,cols:[],
    intro:[
      '"A câmara de coleta! As paredes exibem três tipos de halita — cúbica, tabular e prismática. Cada uma exige um ângulo diferente de golpe da talhadeira."',
      '"Atenção às manchas escuras e úmidas — a Lâmpada de Sal vai me avisar. Onde a chama oscila: salmoura infiltrando, colapso iminente!"',
      'Mineração: [E] próximo à parede → escolha o ângulo ← H  ▲ V  → D',
    ],
    update(player){
      tickMoving(this.plats);tickTrapdoors(this.plats);
      if(this.saltWalls)for(const w of this.saltWalls)w.tick();
    },
    draw(player){
      const lampOn=player.activeTools.has('lampada_de_sal');
      drawLampLight(player,lampOn);
      drawCrystalSparkle();
      ctx.fillStyle='rgba(235,220,208,0.28)';
      for(let i=0;i<25;i++){
        const cx=(i*112+56)-cam.x,cy=40+Math.sin(i*2.3)*40;
        if(cx<-40||cx>W+40)continue;
        const ch=14+Math.sin(i*1.1)*8;
        ctx.beginPath();ctx.moveTo(cx-4,cy);ctx.lineTo(cx,cy+ch);ctx.lineTo(cx+4,cy);ctx.closePath();ctx.fill();
      }
      if(this.insigniaObj&&!this.insigniaObj.done){
        const ix=this.insigniaObj.x-cam.x,iy=this.insigniaObj.y-cam.y;
        if(ix>-60&&ix<W+60){
          const ia=0.4+Math.sin(Date.now()/500)*0.4;
          const gg=ctx.createRadialGradient(ix,iy-20,4,ix,iy-20,40);
          gg.addColorStop(0,`rgba(180,140,220,${ia*0.5})`);gg.addColorStop(1,'rgba(180,140,220,0)');
          ctx.fillStyle=gg;ctx.fillRect(ix-40,iy-60,80,80);
          ctx.save();ctx.translate(ix,iy-30);ctx.scale(1.5,1.5);drawInsignia(0,0,Date.now()/800);ctx.restore();
          ctx.font='bold 12px "Courier New"';ctx.fillStyle=`rgba(200,180,240,${ia})`;
          ctx.textAlign='center';ctx.fillText('[E] Pegar Insígnia da Guilda',ix,iy-66);ctx.textAlign='left';
        }
      }
      if(this.saltWalls){
        for(const w of this.saltWalls)w.draw(lampOn);
      }
      for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

function buildL4(){
  const FL=580,WW=1600,WH=900;
  const plats=[
    solid(0,FL,1600,WH-FL),
    solid(280,FL-240,160,18),solid(680,FL-180,140,18),solid(1060,FL-260,140,18),
    solid(140,FL-120,100,18),solid(480,FL-320,120,18),solid(840,FL-120,120,18),
    solid(1200,FL-120,100,18),
  ];
  const celebState={active:false,t:0};
  const triggers=[
    new Trigger(1380,FL-200,120,200,'Concluir Fase 3.1',(player,level)=>{
      const halitas=['halita_cubica','halita_tabular','halita_prismatica'];
      if(!halitas.every(h=>player.items.includes(h))){notify('Volte e colete os blocos de halita!');return;}
      if(!player.items.includes('insignia_guilda')){notify('Volte e encontre a Insígnia da Guilda!');return;}
      if(level._finFired)return;level._finFired=true;level.triggers[0].done=true;
      celebState.active=true;celebState.t=0;sfx('unlock');
      for(let i=0;i<22;i++)burst(player.x+20,player.y,'#f0e8d0',2,5+Math.random()*3);
      for(let i=0;i<14;i++)burst(player.x+20,player.y,'#d0a8e0',1,4+Math.random()*3);
      player.interactAnim=60;
      setTimeout(()=>{
        showDialog([
          '"Esta câmara levou 400 anos para ser esculpida — geração após geração de mineiros que nunca viram o resultado final. Os lustes de cristal de sal, os relevos de santos, os altares inteiros — tudo obra de trabalhadores anônimos que viviam mais tempo no escuro do que na luz."',
          '"A Insígnia da Guilda representa algo maior que o sal: a ideia de que trabalhadores têm direitos. Que o trabalho tem valor. Que o que é retirado da terra deve ser dividido com quem o tira. Uma das primeiras formas de contrato trabalhista documentado da Europa."',
          '"Esta mina está na UNESCO hoje — não pelo sal que extraiu, mas pelas esculturas, pelas capelas, pela humanidade que os mineiros deixaram para trás nas paredes. Algumas coisas são mais valiosas que o ouro branco."',
          '"Itens registrados no Diário de Bordo. Fase 3.1 concluída!"',
        ],()=>{
          unlockPhase('3.2');
          BUBBLE.active=false;G.dialog=false;
          try{sessionStorage.setItem('mineralis_session','1');}catch(e){}
          G.state='complete';
        });
      },1200);
    },true),
  ];
  return{id:4,bg:'bg04',W:WW,H:WH,startX:80,startY:FL-90,
    title:'A Câmara-Catedral',
    hint(player){
      const halitas=['halita_cubica','halita_tabular','halita_prismatica'];
      return (halitas.every(h=>player.items.includes(h))&&player.items.includes('insignia_guilda'))?'✦ Chegue ao altar para concluir!':'← Volte e colete a halita e a Insígnia da Guilda!';
    },
    plats,cols:[],saltWalls:null,triggers,expositions:null,bison:null,insigniaObj:null,celebState,
    intro:[
      '"Corvan chega à Câmara-Catedral — um espaço subterrâneo de dimensões catedrais, esculpido inteiramente em sal branco e rosado."',
      '"Um lustre de cristal de sal no teto reflete a Lâmpada de Sal em mil facetas douradas e rosadas. Relevos de santos nas paredes."',
      '"Chegue ao altar dourado para registrar todas as descobertas e concluir a Fase 3.1!"',
    ],
    update(player){
      if(this.celebState.active)this.celebState.t+=0.06;
      const fim=this.triggers[0];
      if(!fim.done&&!G.dialog){
        const halitas=['halita_cubica','halita_tabular','halita_prismatica'];
        if(halitas.every(h=>player.items.includes(h))&&player.items.includes('insignia_guilda')){
          if(player.x+player.w>=fim.x&&player.x<=fim.x+fim.w+60)fim.fn(player,this);
        }
      }
    },
    draw(player){
      const lampOn=player.activeTools.has('lampada_de_sal');
      drawLampLight(player,true);
      drawCrystalSparkle();
      drawCathedralDetail(FL);
      ctx.fillStyle='rgba(238,228,215,0.25)';
      for(let i=0;i<4;i++){
        const rx=160+i*340-cam.x,ry=FL-cam.y-60;
        if(rx<-80||rx>W+80)continue;
        ctx.beginPath();ctx.arc(rx,ry-40,16,0,Math.PI*2);ctx.fill();
        ctx.fillRect(rx-14,ry-26,28,30);
        ctx.beginPath();ctx.ellipse(rx-24,ry-36,14,8,0.5,0,Math.PI);ctx.fill();
        ctx.beginPath();ctx.ellipse(rx+24,ry-36,14,8,-0.5,0,Math.PI);ctx.fill();
      }
      const fx=1420-cam.x,fy=FL-cam.y;
      ctx.fillStyle='#6a4818';ctx.fillRect(fx,fy-180,6,180);
      const flagWave=Math.sin(Date.now()/300)*4;
      ctx.fillStyle='#b08028';
      ctx.beginPath();ctx.moveTo(fx+6,fy-178);ctx.lineTo(fx+58,fy-165+flagWave);ctx.lineTo(fx+6,fy-146);ctx.closePath();ctx.fill();
      ctx.strokeStyle='#d0a040';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(fx+6,fy-178);ctx.lineTo(fx+58,fy-165+flagWave);ctx.lineTo(fx+6,fy-146);ctx.stroke();
      ctx.save();ctx.translate(fx+30,fy-163+flagWave*.5);ctx.rotate(flagWave*.01);
      ctx.font='bold 10px "Courier New"';ctx.fillStyle='#3a1808';ctx.textAlign='center';ctx.fillText('FIM',0,4);ctx.textAlign='left';ctx.restore();
      const mg=ctx.createRadialGradient(fx+30,fy-90,5,fx+30,fy-90,70);
      mg.addColorStop(0,'rgba(180,140,220,0.22)');mg.addColorStop(1,'rgba(180,140,220,0)');
      ctx.fillStyle=mg;ctx.fillRect(fx-30,fy-160,120,160);
      if(this.celebState.active){
        const t=this.celebState.t;
        const px2=player.x-cam.x+20,py2=player.y-cam.y;
        const tg=ctx.createRadialGradient(px2,py2-70,0,px2,py2-70,80);
        tg.addColorStop(0,`rgba(200,160,240,${0.3+Math.sin(t*3)*.15})`);tg.addColorStop(1,'rgba(200,160,240,0)');
        ctx.fillStyle=tg;ctx.fillRect(px2-80,py2-150,160,150);
        ctx.save();ctx.translate(px2,py2-65+Math.sin(t*2)*10);ctx.rotate(Math.sin(t*1.5)*.25);ctx.scale(2.5,2.5);drawInsignia(0,0,t);ctx.restore();
        for(let i=0;i<8;i++){
          const a=t*.9+i*(Math.PI*2/8),sr=44+Math.sin(t*2+i)*8;
          const s2x=px2+Math.cos(a)*sr,s2y=py2-65+Math.sin(a)*sr;
          const sa=0.5+Math.abs(Math.sin(t*2.5+i))*.5;
          ctx.font='13px serif';ctx.fillStyle=`rgba(220,200,240,${sa})`;
          ctx.textAlign='center';ctx.fillText('🧊',s2x,s2y);ctx.textAlign='left';
        }
      }
      for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

const LEVELS=[buildL1,buildL2,buildL3,buildL4];
const G={
  state:'title',lvIdx:0,level:null,player:null,
  dialog:false,deaths:0,timeOnLevel:0,_storedItems:[],_storedScore:0,_storedTools:[],
  miningWall:null,angleChoice:null,
  load(idx){
    this.lvIdx=idx;particles=[];
    tileTheme=TILE_THEMES[Math.min(idx+1,4)];
    this.level=LEVELS[idx]();cam.x=0;cam.y=0;
    this.player=new Player(this.level.startX,this.level.startY);
    this.miningWall=null;this.angleChoice=null;
    if(idx===0){
      this.player.items=[];
      this.player.activeTools=new Set();
    } else {
      this.player.items=[...this._storedItems];
      this.player.score=this._storedScore;
      this.player.activeTools=new Set(this._storedTools||[]);
    }
    this.dialog=false;this.state='playing';this.timeOnLevel=0;
    BUBBLE.active=false;popup.active=false;
    for(const k in jp)delete jp[k];
    setTimeout(()=>{if(this.state==='playing')showDialog(this.level.intro,null);},1200);
  },
  nextLevel(){
    this._storedItems=[...this.player.items];
    this._storedScore=this.player.score;
    this._storedTools=[...this.player.activeTools];
    if(this.lvIdx+1<LEVELS.length)this.load(this.lvIdx+1);
    else{BUBBLE.active=false;this.dialog=false;this.state='complete';}
  },
  update(){
    if(this.state!=='playing')return;this.timeOnLevel++;
    checkDlg();updateCam(this.player.x,this.level.W);
    this.level.update(this.player);this.player.update(this.level);
    tickParticles();tickNotif();tickPopup();
    if(this.player.dead){this.deaths++;this.state='dead';}
  },
  draw(){
    const sk=getShake();
    ctx.save();ctx.translate(sk.dx,sk.dy);
    ctx.clearRect(-10,-10,W+20,H+20);
    if(this.state==='title'){drawTitle();ctx.restore();return;}
    if(this.state==='complete'){drawComplete();ctx.restore();return;}
    drawBg(this.level.bg);
    for(const p of this.level.plats)drawPlatform(p);
    this.level.draw(this.player);
    drawParticles();
    this.player.draw();
    if(this.state==='dead'){drawDeath();ctx.restore();return;}
    drawHUD(this.player,this.level);
    drawPopup();BUBBLE.draw(this.player);drawNotif();
    INV.draw(this.player);
    if(this.miningWall)drawAngleChoice(this.miningWall);
    ctx.restore();
  }
};

// ── Música de fundo — Fase 3.1 (Rio Tinto/Espanha): modo frígio, tom sério ──
let _bgMusicActive=false,_bgMusicTimeout=null,_bgMusicGain=null;
const _NOTES_FRI=[164.8,174.6,196,220,246.9,261.6,293.6,329.6]; // E frígio
function startBgMusic(){
  if(_bgMusicActive||!AC)return;
  _bgMusicActive=true;
  if(AC.state==='suspended')AC.resume();
  _bgMusicGain=AC.createGain();_bgMusicGain.gain.value=0.05;_bgMusicGain.connect(AC.destination);
  function _nota(freq,start,dur){
    const o=AC.createOscillator(),g=AC.createGain();
    o.type='sine';o.frequency.value=freq;
    g.gain.setValueAtTime(0,start);g.gain.linearRampToValueAtTime(0.07,start+0.09);
    g.gain.setValueAtTime(0.07,start+dur-0.2);g.gain.linearRampToValueAtTime(0,start+dur);
    o.connect(g);g.connect(_bgMusicGain);o.start(start);o.stop(start+dur);
  }
  const SEQ=[0,1,3,5,4,3,1,0,2,3,5,6,5,3,2,0]; // frígio descendente
  function _ciclo(){
    if(!_bgMusicActive)return;
    const t=AC.currentTime+0.1;
    SEQ.forEach((idx,i)=>_nota(_NOTES_FRI[idx%_NOTES_FRI.length],t+i*0.48,0.56));
    _bgMusicTimeout=setTimeout(_ciclo,(SEQ.length*0.48-0.35)*1000);
  }
  _ciclo();
}
function stopBgMusic(){
  _bgMusicActive=false;clearTimeout(_bgMusicTimeout);
  if(_bgMusicGain&&AC){_bgMusicGain.gain.linearRampToValueAtTime(0,AC.currentTime+0.5);_bgMusicGain=null;}
}
let _prevState='';

function startGame(){G.load(0);G.state='title';loop();}
function loop(){
  requestAnimationFrame(loop);
  if(G.state!==_prevState){
    if(G.state==='playing'&&_prevState!=='playing')startBgMusic();
    if((G.state==='dead'||G.state==='complete')&&_prevState==='playing')stopBgMusic();
    _prevState=G.state;
  }
  if(G.state==='title'&&(jp['Enter']||jp['Space']))G.load(0);
  if(G.state==='dead'&&jp['KeyR'])G.load(G.lvIdx);
  if(G.state==='complete'&&jp['Enter']){
    unlockPhase('3.2');
    G.deaths=0;G._storedItems=[];G._storedScore=0;G._storedTools=[];
    window.location.href='../../MenuPrincipal/index.html?unlocked=3.2';
  }
  G.update();G.draw();clearJP();
}

if(!gameReady){(function loadLoop(){
  if(gameReady)return;requestAnimationFrame(loadLoop);
  ctx.fillStyle='#070408';ctx.fillRect(0,0,W,H);
  const t=Date.now()/600;
  const cg=ctx.createRadialGradient(W/2,H/2,20,W/2,H/2,300);
  cg.addColorStop(0,'rgba(180,140,220,0.15)');cg.addColorStop(1,'rgba(180,140,220,0)');
  ctx.fillStyle=cg;ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#d0a8e0';ctx.font='bold 24px "Courier New"';ctx.textAlign='center';
  ctx.fillText(`Carregando${'.'.repeat(Math.floor(Date.now()/400)%4)}  ${assetsLoaded}/${totalAssets}`,W/2,H/2);
  ctx.save();ctx.translate(W/2,H/2+80);ctx.scale(2.5,2.5);drawHalitaItem(0,0,t,'prismatica');ctx.restore();
  ctx.textAlign='left';
})();}