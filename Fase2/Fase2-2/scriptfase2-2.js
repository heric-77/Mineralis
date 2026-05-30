const SAVE_KEY='mineralis_save_v2';
function saveRead(){try{return JSON.parse(localStorage.getItem(SAVE_KEY))||{};}catch{return{};}}
function saveWrite(d){try{localStorage.setItem(SAVE_KEY,JSON.stringify(d));}catch{}}
function unlockPhase(id){const s=saveRead();if(!s.fases)s.fases={};if(!s.fases[id])s.fases[id]={};s.fases[id].desbloqueada=true;saveWrite(s);}
function journalCollect(id){const s=saveRead();if(!s.coletados)s.coletados={};if(!s.coletados[id]){s.coletados[id]=true;saveWrite(s);}}

const UI_ACCENT='#e0b840';
const UI_BORDER='#8a6820';
const UI_BORDER_DARK='#6a4a18';
const UI_MUTED='#a08030';

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
  if(type==='jump')      {o.frequency.setValueAtTime(220,t);o.frequency.exponentialRampToValueAtTime(440,t+.14);g.gain.setValueAtTime(.13,t);g.gain.exponentialRampToValueAtTime(.001,t+.16);}
  else if(type==='picareta'){o.type='square';o.frequency.setValueAtTime(120,t);o.frequency.exponentialRampToValueAtTime(55,t+.18);g.gain.setValueAtTime(.17,t);g.gain.exponentialRampToValueAtTime(.001,t+.22);}  // impacto pesado e abafado — carvão
  else if(type==='lignito'){o.type='sine';o.frequency.setValueAtTime(90,t);o.frequency.exponentialRampToValueAtTime(60,t+.2);g.gain.setValueAtTime(.14,t);g.gain.exponentialRampToValueAtTime(.001,t+.25);}   // ploc — úmido abafado
  else if(type==='betuminoso'){o.type='square';o.frequency.setValueAtTime(160,t);o.frequency.exponentialRampToValueAtTime(80,t+.16);g.gain.setValueAtTime(.14,t);g.gain.exponentialRampToValueAtTime(.001,t+.2);}// crack — seco
  else if(type==='antracito'){o.type='triangle';o.frequency.setValueAtTime(600,t);o.frequency.exponentialRampToValueAtTime(900,t+.1);g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.001,t+.22);} // clink — cristalino
  else if(type==='cracha'){o.type='sine';o.frequency.setValueAtTime(320,t);o.frequency.exponentialRampToValueAtTime(220,t+.4);g.gain.setValueAtTime(.10,t);g.gain.exponentialRampToValueAtTime(.001,t+.6);}  // lamento — violino
  else if(type==='item') {o.frequency.setValueAtTime(440,t);o.frequency.setValueAtTime(660,t+.1);o.frequency.setValueAtTime(880,t+.2);g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.001,t+.3);}
  else if(type==='unlock'){o.frequency.setValueAtTime(330,t);o.frequency.setValueAtTime(440,t+.15);o.frequency.setValueAtTime(660,t+.3);g.gain.setValueAtTime(.13,t);g.gain.exponentialRampToValueAtTime(.001,t+.5);}
  else if(type==='hit')  {o.type='sawtooth';o.frequency.setValueAtTime(200,t);o.frequency.exponentialRampToValueAtTime(60,t+.2);g.gain.setValueAtTime(.18,t);g.gain.exponentialRampToValueAtTime(.001,t+.22);}
  else if(type==='grisu'){o.type='sawtooth';o.frequency.setValueAtTime(80,t);o.frequency.linearRampToValueAtTime(120,t+.5);g.gain.setValueAtTime(.15,t);g.gain.exponentialRampToValueAtTime(.001,t+.7);}  // assobio gás
  else if(type==='canario'){o.type='sine';o.frequency.setValueAtTime(1200,t);o.frequency.setValueAtTime(1600,t+.1);o.frequency.setValueAtTime(1000,t+.2);g.gain.setValueAtTime(.09,t);g.gain.exponentialRampToValueAtTime(.001,t+.35);}
  o.start(t);o.stop(t+.8);
}

const IMG={};
let assetsLoaded=0,totalAssets=4,gameReady=false;
[['bg01','Assets/cena1.svg'],['bg02','Assets/cena2.svg'],
 ['bg03','Assets/cena3.svg'],['bg04','Assets/cena4.svg']].forEach(([key,src])=>{
  const img=new Image();
  img.onload=()=>{IMG[key]=img;if(++assetsLoaded>=totalAssets){gameReady=true;startGame();}};
  img.onerror=()=>{IMG[key]=null;if(++assetsLoaded>=totalAssets){gameReady=true;startGame();}};
  img.src=src;
});
IMG.card22=null;
(function(){const ci=new Image();ci.onload=()=>{IMG.card22=ci;};ci.onerror=()=>{IMG.card22=null;};ci.src='Assets/2_2_apalaches.svg';})();
['canario','lampada','picareta_ind','cracha','xisto'].forEach((k,i)=>{
  const src=['Assets/Canario_da_Mina.svg','Assets/Lampada_de_Davy.svg','Assets/Picareta_Industrial.svg','Assets/Cracha_de_Breaker_Boy.svg','Assets/Xisto_Carbonoso.svg'][i];
  const img=new Image();img.onload=()=>{IMG[k]=img;};img.onerror=()=>{IMG[k]=null;};img.src=src;
});

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

const ITEM_DEFS={
  picareta_industrial:{
    cat:'ferramenta',nome:'Picareta Industrial',icon:'⛏',
    journalId:'picareta_industrial',
    desc:'Mais pesada e robusta que a picareta básica.\nUse [E] próximo a uma camada de carvão.\nAngule paralelo à camada para não fragmentar.\nAcerto no carvão: "krack!" abafado e pesado.\nAcerto no xisto: som seco e estilhaçante.',
    drawHand:'right',
  },
  lampada_davy:{
    cat:'ferramenta',nome:'Lâmpada de Davy',icon:'🏮',
    journalId:'lampada_davy',
    desc:'Criada por Humphry Davy em 1815.\nA malha metálica impede que a chama\nignite o metano — mas ao detectá-lo\na chama cresce: sinal de evacuação.\nMineiros usaram canários vivos até 1986.',
    drawHand:'left',
  },
  lignito:{
    cat:'minerio',nome:'Lignito',icon:'🪨',
    journalId:'lignito',
    desc:'Carvão de baixo grau: ~25–35% de carbono.\nMarrom-escuro e opaco, textura quase terrosa.\nPrimeiro estágio de transformação da\nmatéria orgânica vegetal em carvão.\nSom abafado e úmido ao ser extraído.',
  },
  carvao_betuminoso:{
    cat:'minerio',nome:'Carvão Betuminoso',icon:'⬛',
    journalId:'carvao_betuminoso',
    desc:'Carvão de médio grau: ~45–86% de carbono.\nPreto com leve brilho metálico.\nCombustível central da Revolução Industrial\namericana — aquecia casas, movia locomotivas.\nSom médio e seco ao ser extraído.',
  },
  antracito:{
    cat:'minerio',nome:'Antracito',icon:'💎',
    journalId:'antracito',
    desc:'O "diamante negro" — até 98% de carbono.\nQueima mais quente, limpo e duradouro.\nTão duro e brilhante quanto pedra preciosa.\nFoi o carvão mais valioso dos Apalaches.\nSom cristalino agudo ao ser extraído.',
  },
  xisto_carbonoso:{
    cat:'minerio',nome:'Xisto Carbonoso',icon:'🪨',
    journalId:'xisto_carbonoso',
    desc:'Rocha sedimentar que envolve o carvão.\nOs breaker boys separavam xisto de carvão\nnas usinas — trabalho infernal e perigoso.\nA inclinação do xisto indica o "mergulho\nda camada" — guia para veios mais espessos.',
  },
  cracha_breaker_boy:{
    cat:'artefato',nome:'Crachá de Breaker Boy',icon:'🏷️',
    journalId:'cracha_breaker_boy',
    desc:'Chapa de metal com nº 247 gravado.\nIdentificação de trabalhador infantil nas\nusinas de triagem de carvão dos Apalaches.\nBreaker boys: 8–12 anos, pagos por produção.\nTrabalho infantil proibido nos EUA em 1938.',
  },
};

const INV={
  open:false,tab:0,cursor:0,
  TABS:[
    {id:'ferramenta',label:'🔧 Ferramentas',color:UI_ACCENT},
    {id:'minerio',   label:'⛏ Minérios',   color:'#a0a8b8'},
    {id:'artefato',  label:'🏺 Artefatos',  color:'#b08050'},
  ],
  tabItems(player){
    const cat=this.TABS[this.tab].id;
    let saved={};
    try{const s=localStorage.getItem(SAVE_KEY);if(s){const j=JSON.parse(s);saved=j.coletados||{};}}catch(e){}
    const _ALL_DEFS=Object.assign({},window.ALL_ITEM_DEFS||{},ITEM_DEFS);
    return Object.entries(_ALL_DEFS).filter(([id,def])=>{
      if(def.cat!==cat)return false;
      return player.items.includes(id)||player.items.includes(id+'_ok')||saved[def.journalId||id];
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
    ctx.fillStyle='rgba(6,4,2,0.97)';roundRect(PX,PY,PW,PH,16);ctx.fill();
    ctx.shadowBlur=0;
    ctx.strokeStyle=UI_BORDER_DARK;ctx.lineWidth=2.5;roundRect(PX,PY,PW,PH,16);ctx.stroke();
    ctx.strokeStyle='rgba(160,120,40,0.2)';ctx.lineWidth=1;roundRect(PX+4,PY+4,PW-8,PH-8,12);ctx.stroke();
    ctx.fillStyle=UI_ACCENT;ctx.font='bold 16px "Courier New"';
    ctx.textAlign='center';ctx.fillText('📔  DIÁRIO DE BORDO',W/2,PY+28);ctx.textAlign='left';
    ctx.fillStyle='rgba(160,120,40,0.3)';ctx.fillRect(PX+16,PY+38,PW-32,1);
    const TAB_W=PW/3,TAB_Y=PY+44;
    this.TABS.forEach((tab,i)=>{
      const tx=PX+i*TAB_W,active=(i===this.tab);
      ctx.fillStyle=active?'rgba(160,120,40,0.18)':'rgba(0,0,0,0.3)';
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
      ctx.fillStyle='#554';ctx.font='14px "Courier New"';
      ctx.textAlign='center';ctx.fillText('Nenhum item coletado ainda.',W/2,CY+CH/2);
      ctx.fillText('Explore a fase para desbloquear!',W/2,CY+CH/2+24);ctx.textAlign='left';
    } else {
      items.forEach((item,i)=>{
        const iy=CY+16+i*52,selected=(i===this.cursor),equipped=player.activeTools.has(item.id);
        if(selected){ctx.fillStyle='rgba(160,120,40,0.18)';roundRect(PX+16,iy-10,COL_W,46,8);ctx.fill();ctx.strokeStyle=UI_ACCENT;ctx.lineWidth=1.5;roundRect(PX+16,iy-10,COL_W,46,8);ctx.stroke();}
        ctx.font='24px serif';ctx.fillText(item.icon,PX+28,iy+22);
        ctx.font=(equipped?'bold ':'')+'14px "Courier New"';
        ctx.fillStyle=equipped?'#e0a020':(selected?'#d8c090':'#aaa');
        ctx.fillText(item.nome,PX+62,iy+16);
        if(equipped){ctx.fillStyle='rgba(160,120,40,0.22)';roundRect(PX+62,iy+20,80,16,4);ctx.fill();ctx.font='10px "Courier New"';ctx.fillStyle=UI_ACCENT;ctx.fillText('▶ EQUIPADO',PX+66,iy+32);}
      });
      const sel=items[this.cursor];
      if(sel){
        ctx.fillStyle='rgba(160,120,40,0.08)';roundRect(DESC_X,CY,PW-DESC_X+PX-16,CH-10,8);ctx.fill();
        ctx.font='48px serif';ctx.textAlign='center';ctx.fillText(sel.icon,DESC_X+(PW-DESC_X+PX-16)/2,CY+70);ctx.textAlign='left';
        ctx.font='bold 15px "Courier New"';ctx.fillStyle=UI_ACCENT;
        ctx.textAlign='center';ctx.fillText(sel.nome,DESC_X+(PW-DESC_X+PX-16)/2,CY+100);ctx.textAlign='left';
        const catLabel={ferramenta:'🔧 Ferramenta',minerio:'⛏ Minério',artefato:'🏺 Artefato'};
        ctx.font='11px "Courier New"';ctx.fillStyle='#888';
        ctx.textAlign='center';ctx.fillText(catLabel[sel.cat],DESC_X+(PW-DESC_X+PX-16)/2,CY+118);ctx.textAlign='left';
        ctx.fillStyle='rgba(160,120,40,0.25)';ctx.fillRect(DESC_X+20,CY+126,PW-DESC_X+PX-56,1);
        const descLines=sel.desc.split('\n');
        ctx.font='13px "Courier New"';ctx.fillStyle='#d8c898';
        descLines.forEach((l,i)=>{ctx.textAlign='center';ctx.fillText(l,DESC_X+(PW-DESC_X+PX-16)/2,CY+146+i*22);});
        ctx.textAlign='left';
        if(sel.cat==='ferramenta'){
          const btnTxt=player.activeTools.has(sel.id)?'[E] Desequipar':'[E] Equipar';
          const btnColor=player.activeTools.has(sel.id)?'rgba(140,40,20,0.3)':'rgba(160,120,40,0.2)';
          ctx.fillStyle=btnColor;roundRect(DESC_X+40,CY+CH-60,PW-DESC_X+PX-96,34,8);ctx.fill();
          ctx.strokeStyle=player.activeTools.has(sel.id)?'#a04020':UI_ACCENT;ctx.lineWidth=1.5;
          roundRect(DESC_X+40,CY+CH-60,PW-DESC_X+PX-96,34,8);ctx.stroke();
          ctx.font='bold 13px "Courier New"';ctx.fillStyle=player.activeTools.has(sel.id)?'#e06040':UI_ACCENT;
          ctx.textAlign='center';ctx.fillText(btnTxt,DESC_X+(PW-DESC_X+PX-16)/2,CY+CH-38);ctx.textAlign='left';
        }
      }
    }
    ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(PX,PY+PH-38,PW,38);
    ctx.fillStyle='rgba(160,120,40,0.3)';ctx.fillRect(PX+16,PY+PH-39,PW-32,1);
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

const cam={x:0,y:0};
function updateCam(px,worldW){cam.x+=(Math.max(0,Math.min(px-W/2+24,worldW-W))-cam.x)*0.12;}

const GRAV=0.46,PSPD=4.5,JUMPF=-12.2,MAXFALL=16;

const TILE_THEMES={
  1:{top:'#5a4a38',body:'#3a2a1a',dark:'#1e1208'},  // terra / entrada mina
  2:{top:'#4a5060',body:'#2a3038',dark:'#0e1018'},  // xisto escuro
  3:{top:'#3a3840',body:'#222830',dark:'#0a0c10'},  // galeria profunda
  4:{top:'#5a4a38',body:'#3a2a1a',dark:'#1e1208'},  // saída entardecer
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
    ctx.fillStyle='#4a3828';const nc=Math.max(1,Math.floor(p.w/20));
    for(let i=0;i<nc;i++){const tx=sx+i*(p.w/nc);ctx.beginPath();ctx.moveTo(tx,sy+p.h);ctx.lineTo(tx+p.w/nc/2,sy);ctx.lineTo(tx+p.w/nc,sy+p.h);ctx.fill();}
    ctx.strokeStyle='rgba(120,80,40,0.5)';ctx.lineWidth=1;
    for(let i=0;i<nc;i++){const tx=sx+i*(p.w/nc);ctx.beginPath();ctx.moveTo(tx,sy+p.h);ctx.lineTo(tx+p.w/nc/2,sy);ctx.lineTo(tx+p.w/nc,sy+p.h);ctx.stroke();}
    return;
  }
  if(p.type==='_dead')return;
  if(p.type==='trapdoor'){
    const al=p.crumble!==undefined?p.crumble/70:1;ctx.globalAlpha=al;
    ctx.fillStyle='#4a3828';ctx.fillRect(sx,sy,p.w,p.h);
    ctx.fillStyle='#6a5040';ctx.fillRect(sx,sy,p.w,3);ctx.globalAlpha=1;return;
  }
  const ts=24,cols=Math.ceil(p.w/ts),rows=Math.ceil(p.h/ts);
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      const tx=sx+c*ts,ty=sy+r*ts,tw=Math.min(ts,sx+p.w-tx),th=Math.min(ts,sy+p.h-ty);
      ctx.fillStyle=r===0?tileTheme.body:(r%2===0?tileTheme.dark:tileTheme.body);
      ctx.fillRect(tx,ty,tw,th);
      ctx.fillStyle='rgba(0,0,0,0.15)';ctx.fillRect(tx+tw-1,ty,1,th);ctx.fillRect(tx,ty+th-1,tw,1);
      if(Math.random()<0.015){ctx.fillStyle='rgba(100,120,160,0.25)';ctx.fillRect(tx+Math.random()*tw,ty+Math.random()*th,3,2);}
    }
  }
  ctx.fillStyle=tileTheme.top;ctx.fillRect(sx,sy,p.w,4);
  ctx.fillStyle='rgba(80,60,40,0.3)';
  for(let i=0;i<Math.floor(p.h/14);i++)ctx.fillRect(sx,sy+4+i*14,p.w,1);
  if(p.moving){ctx.fillStyle='rgba(180,140,80,0.3)';ctx.fillRect(sx,sy,p.w,4);}
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

function drawPicaretaIndustrial(x,y,S=1,t=0){
  ctx.save();ctx.translate(x,y);
  // cabo
  ctx.fillStyle='#6a4a20';ctx.fillRect(-2*S,0,4*S,28*S);
  // cabeça da picareta — mais pesada e robusta
  ctx.fillStyle='#707888';
  ctx.beginPath();ctx.moveTo(-14*S,-2*S);ctx.lineTo(-2*S,-8*S);ctx.lineTo(2*S,-8*S);ctx.lineTo(2*S,4*S);ctx.lineTo(-2*S,4*S);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(2*S,-8*S);ctx.lineTo(16*S,-4*S);ctx.lineTo(16*S,6*S);ctx.lineTo(2*S,4*S);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(180,200,220,0.3)';ctx.fillRect(-12*S,-1*S,8*S,2*S);
  // rebites
  ctx.fillStyle='#505868';ctx.beginPath();ctx.arc(-6*S,0,2*S,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

function drawLampadaDavy(x,y,S=1){
  ctx.save();ctx.translate(x,y);
  // cabo
  ctx.fillStyle='#6a4a20';ctx.fillRect(-2*S,12*S,4*S,14*S);
  // corpo da lâmpada
  ctx.fillStyle='#2a1a08';ctx.beginPath();ctx.ellipse(0,0,9*S,13*S,0,0,Math.PI*2);ctx.fill();
  // malha metálica
  ctx.strokeStyle='#8a6a30';ctx.lineWidth=S*0.8;
  for(let i=-10;i<=10;i+=5){ctx.beginPath();ctx.moveTo(i*S,-12*S);ctx.lineTo(i*S,12*S);ctx.stroke();}
  for(let j=-12;j<=12;j+=5){ctx.beginPath();ctx.moveTo(-9*S,j*S);ctx.lineTo(9*S,j*S);ctx.stroke();}
  // topo
  ctx.fillStyle='#4a3010';ctx.fillRect(-5*S,-14*S,10*S,4*S);
  // chama
  const fr=0.6+Math.sin(Date.now()/180)*0.4;
  ctx.fillStyle=`rgba(255,150,30,${fr})`;ctx.beginPath();ctx.ellipse(0,-5*S,4*S,7*S,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=`rgba(255,230,100,${fr*0.9})`;ctx.beginPath();ctx.ellipse(0,-7*S,2*S,4*S,0,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

// Itens desenhados no mundo
function drawCarvaoItem(x,y,t,tipo='lignito'){
  ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(t)*0.08);
  const cols={lignito:'#4a3728',carvao_betuminoso:'#1c1c1c',antracito:'#16181e'};
  const glints={lignito:'rgba(80,60,40,0.5)',carvao_betuminoso:'rgba(60,70,90,0.4)',antracito:'rgba(120,140,200,0.6)'};
  ctx.fillStyle=cols[tipo]||'#2a2a2a';
  ctx.beginPath();ctx.moveTo(-14,0);ctx.lineTo(-6,-12);ctx.lineTo(8,-10);ctx.lineTo(14,4);ctx.lineTo(6,12);ctx.lineTo(-8,10);ctx.closePath();ctx.fill();
  // brilho específico de cada tipo
  ctx.fillStyle=glints[tipo]||'rgba(80,80,80,0.4)';
  if(tipo==='antracito'){
    ctx.beginPath();ctx.moveTo(-4,-8);ctx.lineTo(4,-6);ctx.lineTo(6,2);ctx.lineTo(-2,4);ctx.closePath();ctx.fill();
  } else {
    ctx.fillRect(-6,-5,8,3);
  }
  ctx.restore();
}

function drawXistoItem(x,y,t){
  ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(t)*0.06);
  ctx.fillStyle='#6a7285';
  ctx.beginPath();ctx.moveTo(-16,-4);ctx.lineTo(16,-4);ctx.lineTo(12,8);ctx.lineTo(-12,8);ctx.closePath();ctx.fill();
  // linhas de estratificação
  ctx.strokeStyle='rgba(100,120,150,0.5)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(-14,0);ctx.lineTo(14,0);ctx.stroke();
  ctx.beginPath();ctx.moveTo(-12,4);ctx.lineTo(12,4);ctx.stroke();
  ctx.restore();
}

function drawCrachaItem(x,y,t){
  ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(t*0.7)*0.05);
  ctx.fillStyle='#5a6070';
  ctx.fillRect(-14,-10,28,20);
  ctx.fillStyle='#7a8090';ctx.fillRect(-12,-8,24,3);
  ctx.fillStyle='rgba(200,210,220,0.5)';
  ctx.font=`bold ${8}px "Courier New"`;ctx.textAlign='center';ctx.fillText('Nº 247',0,5);ctx.textAlign='left';
  // furo de fivela
  ctx.fillStyle='#2a3040';ctx.beginPath();ctx.arc(0,-8,2.5,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

// ─── CANÁRIO NPC ──────────────────────────────────────────────────────────────
function drawCanario(cx,cy,frame=0){
  ctx.save();ctx.translate(cx,cy);
  const bob=Math.sin(frame)*3;
  // gaiola
  ctx.strokeStyle='#8a6a30';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.ellipse(0,-18+bob,20,26,0,0,Math.PI*2);ctx.stroke();
  for(let i=-20;i<=20;i+=8){ctx.beginPath();ctx.moveTo(i,-44+bob);ctx.lineTo(i,8+bob);ctx.stroke();}
  for(let j=-44;j<=8;j+=10){ctx.beginPath();ctx.moveTo(-20,j+bob);ctx.lineTo(20,j+bob);ctx.stroke();}
  // suporte
  ctx.strokeStyle=UI_BORDER_DARK;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(0,8+bob);ctx.lineTo(0,24);ctx.stroke();
  ctx.beginPath();ctx.moveTo(-12,24);ctx.lineTo(12,24);ctx.stroke();
  // canário
  ctx.fillStyle='#e8c820';ctx.beginPath();ctx.ellipse(0,-20+bob,8,6,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#e8c820';ctx.beginPath();ctx.ellipse(0,-28+bob,6,6,0,0,Math.PI*2);ctx.fill();
  // bico
  ctx.fillStyle='#d4a020';ctx.beginPath();ctx.moveTo(5,-28+bob);ctx.lineTo(10,-27+bob);ctx.lineTo(5,-26+bob);ctx.closePath();ctx.fill();
  // olho
  ctx.fillStyle='#000';ctx.beginPath();ctx.arc(3,-29+bob,1.5,0,Math.PI*2);ctx.fill();
  // asa
  ctx.fillStyle='#c8a818';ctx.beginPath();ctx.ellipse(-3,-20+bob,6,3.5,-.4,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

// ─── ZONA DE GÁS (Grisú) ─────────────────────────────────────────────────────
class GrisuZone{
  constructor(x,y,w,h){this.x=x;this.y=y;this.w=w;this.h=h;this.triggered=false;this.t=0;}
  tick(){this.t+=0.04;}
  overlaps(player){return player.x<this.x+this.w&&player.x+player.w>this.x&&player.y<this.y+this.h&&player.y+player.h>this.y;}
  draw(){
    const sx=this.x-cam.x,sy=this.y-cam.y;
    if(sx>W+100||sx+this.w<-100)return;
    // Gas haze
    const a=0.08+Math.sin(this.t)*0.04;
    ctx.fillStyle=`rgba(180,220,80,${a})`;ctx.fillRect(sx,sy,this.w,this.h);
    // Warning sign
    const mx=sx+this.w/2,my=sy+30;
    ctx.fillStyle=`rgba(220,80,20,${0.6+Math.sin(this.t*2)*0.4})`;
    ctx.font='bold 16px "Courier New"';ctx.textAlign='center';
    ctx.fillText('⚠ GRISÚ',mx,my);ctx.textAlign='left';
    // Floating gas particles
    for(let i=0;i<4;i++){
      const px=sx+20+i*40+Math.sin(this.t+i)*10;
      const py=sy+this.h-20-Math.abs(Math.sin(this.t*0.5+i*1.5))*50;
      ctx.fillStyle=`rgba(160,200,60,${0.15+Math.sin(this.t+i)*0.1})`;
      ctx.beginPath();ctx.arc(px,py,6+Math.sin(this.t+i)*2,0,Math.PI*2);ctx.fill();
    }
  }
}

// ─── CAMADA GEOLÓGICA (Cena 2) ────────────────────────────────────────────────
class CoalLayer{
  constructor(x,y,w,tipo){this.x=x;this.y=y;this.w=w;this.h=28;this.tipo=tipo;this.mined=false;this.t=Math.random()*Math.PI*2;this.hits=0;}
  tick(){if(!this.mined)this.t+=0.04;}
  mine(){
    if(this.mined)return false;
    this.hits++;
    if(this.hits>=2){this.mined=true;return true;}
    // partial hit particles
    burst(this.x+this.w/2,this.y+this.h/2,'#3a3028',6,2);
    return false;
  }
  draw(){
    const sx=this.x-cam.x,sy=this.y-cam.y;
    if(sx>W+100||sx+this.w<-100)return;
    const cols={lignito:'#4a3728',carvao_betuminoso:'#1c1c22',antracito:'#12141a',xisto_carbonoso:'#6a7285'};
    const glintCols={lignito:'rgba(80,60,40,0.5)',carvao_betuminoso:'rgba(50,60,80,0.5)',antracito:'rgba(120,140,200,0.7)',xisto_carbonoso:'rgba(90,110,140,0.4)'};
    ctx.fillStyle=cols[this.tipo]||'#2a2a2a';
    ctx.fillRect(sx,sy,this.w,this.h);
    // Estratificação
    ctx.strokeStyle='rgba(0,0,0,0.3)';ctx.lineWidth=1;
    for(let i=6;i<this.h;i+=7){ctx.beginPath();ctx.moveTo(sx,sy+i);ctx.lineTo(sx+this.w,sy+i);ctx.stroke();}
    // Brilho/reflexo do tipo
    const ga=this.mined?0.2:(0.4+Math.abs(Math.sin(this.t))*0.4);
    ctx.fillStyle=glintCols[this.tipo]||'rgba(80,80,80,0.3)';
    ctx.fillRect(sx+this.w*0.1,sy+4,this.w*0.3,4);
    if(this.tipo==='antracito'){
      ctx.fillStyle=`rgba(140,160,220,${ga*0.6})`;
      ctx.fillRect(sx+this.w*0.5,sy+8,this.w*0.25,3);
    }
    // Label flutuante quando próximo
    if(!this.mined){
      const ha=0.5+Math.sin(Date.now()/400)*0.5;
      const label={lignito:'[E] Extrair Lignito 🪨',carvao_betuminoso:'[E] Extrair Betuminoso ⬛',antracito:'[E] Extrair Antracito 💎',xisto_carbonoso:'[E] Coletar Xisto 🪨'}[this.tipo]||'[E] Extrair';
      ctx.fillStyle=`rgba(200,160,40,${ha*0.8})`;ctx.font='bold 11px "Courier New"';
      ctx.textAlign='center';ctx.fillText(label,sx+this.w/2,sy-8);ctx.textAlign='left';
    } else {
      ctx.fillStyle='rgba(150,130,90,0.6)';ctx.font='11px "Courier New"';
      ctx.textAlign='center';ctx.fillText('✔ Extraído',sx+this.w/2,sy-6);ctx.textAlign='left';
      // Fill mined area
      ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(sx,sy,this.w,this.h);
    }
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
    const TOOL_TYPES=['picareta_industrial','lampada_davy'];
    const isTool=TOOL_TYPES.includes(this.type);
    if(isTool){
      const a=0.3+Math.abs(Math.sin(this.t*0.8))*0.5;
      const glow=ctx.createRadialGradient(sx+17,sy+17,4,sx+17,sy+17,32);
      glow.addColorStop(0,`rgba(200,150,40,${a})`);glow.addColorStop(1,'rgba(200,130,30,0)');
      ctx.fillStyle=glow;ctx.fillRect(sx-15,sy-15,64,64);
    }
    ctx.save();ctx.translate(sx+this.w/2,sy+this.h/2+Math.sin(this.t)*4);
    if(this.type==='picareta_industrial') drawPicaretaIndustrial(0,0,0.7,this.t);
    else if(this.type==='lampada_davy')   drawLampadaDavy(0,0,0.7);
    else if(this.type==='lignito')        drawCarvaoItem(0,0,this.t,'lignito');
    else if(this.type==='carvao_betuminoso') drawCarvaoItem(0,0,this.t,'carvao_betuminoso');
    else if(this.type==='antracito')      drawCarvaoItem(0,0,this.t,'antracito');
    else if(this.type==='xisto_carbonoso')  drawXistoItem(0,0,this.t);
    else if(this.type==='cracha_breaker_boy') drawCrachaItem(0,0,this.t);
    ctx.restore();
    if(isTool&&playerX!==undefined){
      const dist=Math.hypot(playerX+20-(this.x+17),playerY+40-(this.y+17));
      if(dist<110){
        const labels={picareta_industrial:'⛏ Picareta Industrial',lampada_davy:'🏮 Lâmpada de Davy'};
        const txt=`[E] Pegar ${labels[this.type]||this.type}`;
        const pulse=0.7+Math.sin(Date.now()/300)*0.3;
        ctx.font='bold 13px "Courier New"';
        const tw=ctx.measureText(txt).width+20;
        const bx=sx+17-tw/2,by=sy-42;
        ctx.fillStyle=`rgba(6,3,0,${0.88*pulse})`;roundRect(bx,by,tw,24,5);ctx.fill();
        ctx.strokeStyle=`rgba(200,150,60,${pulse})`;ctx.lineWidth=1.5;roundRect(bx,by,tw,24,5);ctx.stroke();
        ctx.fillStyle=`rgba(200,150,60,${pulse})`;
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
    ctx.strokeStyle=UI_ACCENT;ctx.lineWidth=1.5;roundRect(sx-tw/2,sy-16,tw,24,4);ctx.stroke();
    ctx.fillStyle=UI_ACCENT;ctx.textAlign='center';ctx.fillText(txt,sx,sy);ctx.textAlign='left';
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
  active:false,queue:[],cb:null,lines:[],speakerTxt:'CORVAN',speakerColor:UI_ACCENT,faceFrame:0,
  show(msgs,cb,speaker='CORVAN',color=UI_ACCENT){this.queue=[...msgs];this.cb=cb;this.active=true;this.speakerTxt=speaker;this.speakerColor=color;G.dialog=true;this._next();},
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
function showDialog(msgs,cb,speaker='CORVAN',color=UI_ACCENT){BUBBLE.show(msgs,cb,speaker,color);}
function checkDlg(){if(G.dialog&&!INV.open&&isE())BUBBLE.advance();}

// ─── POPUP & NOTIF ────────────────────────────────────────────────────────────
let popup={active:false,timer:0,title:'',lines:[],color:'#a0a8b8'};
function showPopup(title,lines,color,ms=6500){popup={active:true,timer:ms,title,lines,color};}
function tickPopup(){if(popup.active&&popup.timer>0){popup.timer-=16;if(popup.timer<=0)popup.active=false;}}
function drawPopup(){
  if(!popup.active)return;
  const al=Math.min(1,popup.timer/400);ctx.save();ctx.globalAlpha=al;
  const pw=340,lineH=20,ph=popup.lines.length*lineH+80;
  const px=W-pw-18,py=56;
  ctx.fillStyle='rgba(6,3,0,0.94)';roundRect(px,py,pw,ph,10);ctx.fill();
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
  ctx.fillStyle='rgba(6,3,0,0.88)';roundRect(nx,ny,tw,28,6);ctx.fill();
  ctx.strokeStyle=UI_ACCENT;ctx.lineWidth=1.5;roundRect(nx,ny,tw,28,6);ctx.stroke();
  ctx.fillStyle=UI_ACCENT;ctx.textAlign='center';ctx.fillText(notifText,W/2,ny+19);ctx.textAlign='left';
  ctx.restore();
}

// ─── DAVY LAMP HUD (indicador de gás) ────────────────────────────────────────
let davyFlicker=0;
function drawDavyHUD(hasDavy,inGas){
  if(!hasDavy)return;
  const px=W-90,py=48,pw=78,ph=80;
  ctx.fillStyle='rgba(6,3,0,0.88)';roundRect(px,py,pw,ph,6);ctx.fill();
  ctx.strokeStyle=inGas?'#cc4020':UI_BORDER;ctx.lineWidth=1.5;roundRect(px,py,pw,ph,6);ctx.stroke();
  ctx.font='10px "Courier New"';ctx.fillStyle=UI_ACCENT;ctx.textAlign='center';ctx.fillText('LÂMPADA DE DAVY',px+pw/2,py+12);ctx.textAlign='left';
  // Draw mini lamp
  const lx=px+pw/2,ly=py+46;
  ctx.fillStyle='#2a1a08';ctx.beginPath();ctx.ellipse(lx,ly,10,14,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#8a6a30';ctx.lineWidth=0.8;
  for(let i=-8;i<=8;i+=5){ctx.beginPath();ctx.moveTo(lx+i,ly-12);ctx.lineTo(lx+i,ly+12);ctx.stroke();}
  // Flame — flickers/grows in gas
  davyFlicker+=inGas?0.3:0.08;
  const flameSize=inGas?(8+Math.abs(Math.sin(davyFlicker))*6):4;
  const flameCol=inGas?`rgba(255,60,20,${0.8+Math.sin(davyFlicker)*0.2})`:`rgba(255,160,40,${0.7+Math.sin(davyFlicker)*0.3})`;
  ctx.fillStyle=flameCol;ctx.beginPath();ctx.ellipse(lx,ly-7,flameSize*0.5,flameSize,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(255,230,100,0.8)';ctx.beginPath();ctx.ellipse(lx,ly-9,flameSize*0.25,flameSize*0.5,0,0,Math.PI*2);ctx.fill();
  // Status text
  ctx.font='9px "Courier New"';
  ctx.textAlign='center';
  if(inGas){ctx.fillStyle='#ff6040';ctx.fillText('⚠ METANO!',lx,py+ph-6);}
  else{ctx.fillStyle='#60a060';ctx.fillText('● Seguro',lx,py+ph-6);}
  ctx.textAlign='left';
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

    if(isE()&&!G.dialog){
      // Collect tool Col items
      if(level.cols){
        for(const c of level.cols){
          if(c.done)continue;
          const TOOL_TYPES=['picareta_industrial','lampada_davy'];
          if(!TOOL_TYPES.includes(c.type))continue;
          if(Math.hypot(this.x+20-(c.x+17),this.y+40-(c.y+17))<110){
            c.done=true;sfx('item');
            this.items.push(c.type);
            if(c.type==='picareta_industrial')this.activeTools.add('picareta_industrial');
            if(c.type==='lampada_davy')this.activeTools.add('lampada_davy');
            journalCollect(ITEM_DEFS[c.type]?.journalId||c.type);
            this.interactAnim=40;
            if(c.type==='lampada_davy'){
              sfx('canario');
              showDialog([
                '"A gaiola do Canário da Mina! Mineiros carregavam canários vivos para detectar monóxido de carbono e metano: se o pássaro desmaiasse ou morresse, era sinal de evacuação imediata."',
                '"Junto da gaiola havia esta Lâmpada de Davy — criada por Humphry Davy em 1815. A malha metálica impede ignição, mas a chama cresce ao detectar metano: o primeiro sensor de gás da história."',
                '"O Reino Unido usou canários oficialmente em minas de carvão até 1986. Esta lâmpada agora me protegerá nas galerias mais profundas — onde o grisú espreita."',
              ],null,'CORVAN',UI_ACCENT);
              showPopup('🏮 LÂMPADA DE DAVY',['Criada por Humphry Davy em 1815','Malha metálica: a chama NÃO ignite o gás','Mas cresce ao detectar metano — sinal visual','Primeiro detector de gás da história industrial','Usada junto ao canário vivo nas minas'],UI_ACCENT,7000);
            } else {
              showPopup('⛏ PICARETA INDUSTRIAL',['Mais pesada e robusta que a básica','Angule paralelo à camada sedimentar','Não fragmente demais o carvão ao extrair','Som distinto para cada tipo de carvão','Acerto no xisto: seco e estilhaçante'],'#a0a8b8',5000);
            }
            notify(`✦ ${ITEM_DEFS[c.type]?.nome||c.type} obtida!`);
            break;
          }
        }
      }

      // Canário interaction (level 1 specific)
      if(level.canario&&!level.canario.gifted&&this.near({x:level.canario.x-50,y:level.canario.y-80,w:100,h:80})){
        level.canario.gifted=true;sfx('canario');
        for(let i=0;i<12;i++)burst(level.canario.x,level.canario.y-30,'#e8c820',1,2+Math.random()*2);
        // Lamp is given via canary
        if(!this.items.includes('lampada_davy')){
          this.items.push('lampada_davy');this.activeTools.add('lampada_davy');journalCollect('lampada_davy');this.interactAnim=40;
        }
        showDialog([
          '"Um Canário da Mina! Mineiros dos Apalaches carregavam canários vivos para detectar monóxido de carbono e metano: se o pássaro desmaiasse, era sinal imediato de evacuar."',
          '"Junto da gaiola encontrei uma Lâmpada de Davy — criada por Humphry Davy em 1815. A malha metálica protege a chama, mas ela cresce ao detectar metano: o \'grisú\', responsável por explosões devastadoras."',
          '"O Reino Unido usou canários em minas oficialmente até 1986. Esta lâmpada agora me guiará pelas galerias escuras — e me avisará quando recuar for necessário."',
        ],null,'CORVAN',UI_ACCENT);
      }

      // Coal Layer mining (level 2 specific)
      if(level.coalLayers){
        if(!this.items.includes('picareta_industrial')){
          for(const cl of level.coalLayers){if(this.near({x:cl.x,y:cl.y,w:cl.w,h:cl.h},60)){notify('Equipe a Picareta Industrial no Diário [I] primeiro!');break;}}
        } else if(this.activeTools.has('picareta_industrial')){
          for(const cl of level.coalLayers){
            if(cl.mined||!this.near({x:cl.x,y:cl.y,w:cl.w,h:cl.h},60))continue;
            sfx('picareta');burst(cl.x+cl.w/2,cl.y+cl.h/2,'#3a3028',8,2);
            const done=cl.mine();
            if(done){
              this.items.push(cl.tipo);journalCollect(ITEM_DEFS[cl.tipo]?.journalId||cl.tipo);
              this.score+=20;this.interactAnim=30;
              const sfxType=cl.tipo==='lignito'?'lignito':cl.tipo==='carvao_betuminoso'?'betuminoso':'antracito';
              sfx(sfxType);
              burst(cl.x+cl.w/2,cl.y+cl.h/2,'#404040',14,3);
              if(cl.tipo==='lignito')
                showPopup('🪨 LIGNITO EXTRAÍDO!',['~25–35% de carbono — o menos puro','Marrom-escuro e opaco, textura terrosa','Som abafado e úmido: textura suave','Primeiro estágio de formação do carvão','Era usado em fogões domésticos baratos'],'#7a6a58',6000);
              else if(cl.tipo==='carvao_betuminoso')
                showPopup('⬛ CARVÃO BETUMINOSO!',['~45–86% de carbono — grau médio','Preto com leve brilho metálico','Combustível central da Rev. Industrial','Aquecia casas e movia locomotivas a vapor','Ainda hoje 30% da energia global vem dele'],'#a0a8b8',6000);
              else if(cl.tipo==='antracito')
                showPopup('💎 ANTRACITO — DIAMANTE NEGRO!',['Até 98% de carbono puro — grau máximo','Queima mais quente, limpo e duradouro','Som cristalino e agudo ao ser extraído','Tão duro que já foi chamado de "diamante negro"','Mais valioso e mais raro dos Apalaches'],'#8090c0',7000);
              else if(cl.tipo==='xisto_carbonoso')
                showPopup('🪨 XISTO CARBONOSO',['Rocha sedimentar que envolve o carvão','Os breaker boys separavam xisto de carvão','A inclinação revela o "mergulho da camada"','Guia para encontrar veios mais espessos','Ocorre em camadas intercaladas com o carvão'],'#6a7285',6000);
              notify(`✦ ${ITEM_DEFS[cl.tipo]?.nome||cl.tipo} coletado!`);
            }
            break;
          }
        } else {
          for(const cl of level.coalLayers){if(!cl.mined&&this.near({x:cl.x,y:cl.y,w:cl.w,h:cl.h},60)){notify('Equipe a Picareta Industrial no Diário [I]!');break;}}
        }
      }

      // Crachá trigger (level 3 galeria lateral)
      if(level.crachaObj&&!level.crachaObj.done&&this.near({x:level.crachaObj.x-50,y:level.crachaObj.y-50,w:100,h:50})){
        level.crachaObj.done=true;this.items.push('cracha_breaker_boy');this.score+=60;
        sfx('cracha');burst(level.crachaObj.x,level.crachaObj.y,'#8090a0',14,2.5);
        journalCollect('cracha_breaker_boy');this.interactAnim=50;
        showDialog([
          '"Um Crachá de Breaker Boy — número 247. Uma chapa de metal amassada que identificava um trabalhador infantil nas usinas de triagem de carvão."',
          '"Os \'breaker boys\' tinham entre 8 e 12 anos. Ficavam curvados sobre esteiras de carvão separando xisto do carvão com as mãos nuas — dedos cortados, costas quebradas."',
          '"Eram pagos por quantidade de carvão separado, não por hora. A Revolução Industrial americana foi construída em grande parte sobre esse custo humano."',
          '"O trabalho infantil em minas só foi proibido federalmente nos EUA em 1938, com o Fair Labor Standards Act — 60 anos depois da era deste crachá."',
        ],null,'CORVAN',UI_ACCENT);
      }

      // Grisú zone — push back if no lamp
      if(level.grisuZones){
        for(const gz of level.grisuZones){
          if(gz.overlaps(this)){
            if(!this.items.includes('lampada_davy')){
              // Pushed back
              this.x=gz.x-this.w-10;this.vx=-3;
              notify('⚠ GÁS DETECTADO! Você precisa da Lâmpada de Davy para entrar!');sfx('grisu');
            }
          }
        }
      }

      for(const t of level.triggers){if(!t.done&&this.near(t)){t.fn(this,level);break;}}
    }

    if(this.y>level.H+200)this._hurt(3,level,'queda');
    if(!this.onG&&this.vy<0)this.state='jump';
    else if(!this.onG&&this.vy>0)this.state='fall';
    else if(Math.abs(this.vx)>0.5)this.state='run';
    else this.state='idle';
    if(Math.abs(this.vx)>0.5)this.walkT+=0.18;
    if(this.interactAnim>0)this.interactAnim--;
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
    const _dispTool=this.activeTools.has('picareta_industrial')?'picareta_industrial':this.activeTools.has('lampada_davy')?'lampada_davy':null;
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
    const fb={bg01:'#1a0c04',bg02:'#050508',bg03:'#030306',bg04:'#1a0c04'};
    const grd=ctx.createLinearGradient(0,0,0,H);
    grd.addColorStop(0,fb[bgKey]||'#0a0808');grd.addColorStop(1,'#020202');
    ctx.fillStyle=grd;ctx.fillRect(0,0,W,H);
  }
  ctx.fillStyle='rgba(0,0,0,0.22)';ctx.fillRect(0,0,W,H);
}

// Estrelas / faíscas nas paredes da mina
let mineSparkles=Array.from({length:60},()=>({x:Math.random()*4000,y:200+Math.random()*300,sz:Math.random()<0.3?2:1,t:Math.random()*Math.PI*2}));
function drawMineSparkles(){
  for(const s of mineSparkles){
    s.t+=0.02;
    const a=0.1+Math.abs(Math.sin(s.t))*0.5;
    const sx=s.x-cam.x;if(sx<-5||sx>W+5)continue;
    ctx.fillStyle=`rgba(120,140,180,${a})`;
    ctx.fillRect(sx,s.y,s.sz,s.sz);
  }
}

// Fumaça / vapor nas chaminés (Cena 1 e 4)
let smokeP=[];function initSmoke(x,y){smokeP=[];for(let i=0;i<20;i++)smokeP.push({wx:x+Math.random()*20-10,y:y-Math.random()*60,a:Math.random(),t:Math.random()*Math.PI*2,r:8+Math.random()*12});}
function drawSmoke(worldX,baseY){
  for(const p of smokeP){
    p.t+=0.02;p.y-=0.4+Math.sin(p.t)*0.2;p.a*=0.998;
    if(p.y<baseY-200)p.y=baseY;
    const sx=worldX+p.wx-cam.x;if(sx<-50||sx>W+50)continue;
    const py=p.y;
    ctx.fillStyle=`rgba(30,30,30,${p.a*0.5})`;
    ctx.beginPath();ctx.arc(sx,py,p.r+Math.sin(p.t)*3,0,Math.PI*2);ctx.fill();
  }
}

// Vagão de carvão nos trilhos
function drawVagonete(worldX,floorY){
  const sx=worldX-cam.x,sy=floorY-cam.y;
  if(sx>W+120||sx+80<-80)return;
  // trilhos
  ctx.fillStyle='#3a2810';ctx.fillRect(sx-40,sy-4,160,5);
  // rodas
  ctx.fillStyle='#4a3818';ctx.beginPath();ctx.arc(sx+10,sy-1,8,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(sx+60,sy-1,8,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#2a1a08';ctx.beginPath();ctx.arc(sx+10,sy-1,4,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(sx+60,sy-1,4,0,Math.PI*2);ctx.fill();
  // corpo do vagão
  ctx.fillStyle='#3a2810';ctx.fillRect(sx,sy-28,70,24);
  ctx.fillStyle='#2a1a08';ctx.fillRect(sx+2,sy-26,66,3);
  // carvão no vagão
  ctx.fillStyle='#1a1820';ctx.fillRect(sx+4,sy-22,62,12);
  // glints no carvão
  ctx.fillStyle='rgba(80,90,120,0.4)';ctx.fillRect(sx+10,sy-20,15,3);ctx.fillRect(sx+40,sy-18,12,3);
}

// ─── HUD ──────────────────────────────────────────────────────────────────────
function drawHUD(player,level){
  ctx.fillStyle='rgba(6,3,0,0.82)';ctx.fillRect(0,0,W,38);
  ctx.fillStyle='rgba(160,120,40,0.18)';ctx.fillRect(0,36,W,2);
  // HP hearts
  for(let i=0;i<player.maxHp;i++){
    ctx.fillStyle=i<player.hp?'#d06030':'#334';
    ctx.beginPath();const hx=16+i*28,hy=10;
    ctx.arc(hx+5,hy+5,5,Math.PI,0);ctx.arc(hx+15,hy+5,5,Math.PI,0);
    ctx.lineTo(hx+20,hy+5);ctx.bezierCurveTo(hx+20,hy+14,hx+10,hy+18,hx+10,hy+18);
    ctx.bezierCurveTo(hx+10,hy+18,hx,hy+14,hx,hy+5);ctx.closePath();ctx.fill();
  }
  ctx.fillStyle='#a0a8b8';ctx.font='20px "Courier New"';
  ctx.textAlign='center';ctx.fillText(level.title,W/2,24);ctx.textAlign='left';
  ctx.fillStyle=UI_ACCENT;ctx.font='bold 20px "Courier New"';
  ctx.textAlign='right';ctx.fillText('◈ '+player.score,W-14,26);ctx.textAlign='left';

  // Tool panel
  const PX=12,PY=46,PW=192,PH_BASE=52;
  const TOOL_DEFS=[{id:'picareta_industrial',icon:'⛏',nome:'Picareta Ind.'},{id:'lampada_davy',icon:'🏮',nome:'Lâmpada de Davy'}];
  const tools=TOOL_DEFS.filter(t=>player.items.includes(t.id));
  const PH=PH_BASE+(tools.length>0?6+tools.length*22:0);
  ctx.save();
  ctx.shadowColor='rgba(0,0,0,0.6)';ctx.shadowBlur=8;
  ctx.fillStyle='rgba(6,3,0,0.88)';roundRect(PX,PY,PW,PH,6);ctx.fill();
  ctx.shadowBlur=0;
  ctx.strokeStyle=UI_BORDER_DARK;ctx.lineWidth=1.5;roundRect(PX,PY,PW,PH,6);ctx.stroke();
  ctx.restore();
  const midX=PX+PW/2,kw=26,kx=PX+PW-kw-6,ky=PY+5;
  ctx.font='11px serif';ctx.fillStyle=UI_MUTED;ctx.fillText('📔',PX+8,PY+20);
  ctx.font='bold 10px "Courier New"';ctx.fillStyle=UI_MUTED;ctx.fillText('DIÁRIO DE BORDO',PX+24,PY+20);
  ctx.fillStyle='rgba(160,120,40,0.2)';roundRect(kx,ky,kw,18,3);ctx.fill();
  ctx.strokeStyle=UI_MUTED;ctx.lineWidth=1;roundRect(kx,ky,kw,18,3);ctx.stroke();
  ctx.font='bold 10px "Courier New"';ctx.fillStyle=UI_ACCENT;ctx.textAlign='center';ctx.fillText('[I]',kx+kw/2,ky+13);ctx.textAlign='left';
  ctx.fillStyle='rgba(160,120,40,0.3)';ctx.fillRect(PX+6,PY+26,PW-12,1);
  const atY=PY+44;ctx.textAlign='center';
  ctx.font='12px "Courier New"';
  if(player.activeTools.size>0){
    const eq=[...player.activeTools].filter(id=>ITEM_DEFS[id]).map(id=>ITEM_DEFS[id].icon+''+ITEM_DEFS[id].nome.split(' ')[0]).join(' ');
    ctx.fillStyle='#e0a020';ctx.fillText(eq,midX,atY);
  } else {ctx.fillStyle='#c0c8d8';ctx.fillText('Sem ferramenta',midX,atY);}
  ctx.textAlign='left';
  if(tools.length>0){
    ctx.fillStyle='rgba(160,120,40,0.3)';ctx.fillRect(PX+6,PY+PH_BASE,PW-12,1);
    tools.forEach((t,i)=>{
      const ty=PY+PH_BASE+8+i*22,equipped=player.activeTools.has(t.id);
      ctx.textAlign='center';ctx.font='11px serif';ctx.fillStyle=equipped?'#e0a020':'#a08040';
      ctx.fillText(t.icon+' '+t.nome+(equipped?' ◀':''),midX,ty+10);ctx.textAlign='left';
    });
  }

  // Davy lamp HUD removido — status integrado no painel do Diário

  // Coleta de carvão removida do HUD — itens já constam no Diário de Bordo

  const hintText=typeof level.hint==='function'?level.hint(player):level.hint;
  ctx.fillStyle='#9090a8';ctx.font='18px "Courier New"';
  ctx.textAlign='center';ctx.fillText(hintText,W/2,H-10);ctx.textAlign='left';
}

// ─── TITLE SCREEN ─────────────────────────────────────────────────────────────
function drawTitle(){
  drawBg('bg01');
  ctx.fillStyle='rgba(0,0,0,0.58)';ctx.fillRect(0,0,W,H);
  drawMineSparkles();
  ctx.textAlign='center';
  ctx.shadowColor=UI_ACCENT;ctx.shadowBlur=38;
  ctx.fillStyle=UI_ACCENT;ctx.font='bold 44px "Courier New"';ctx.fillText('A Escuridão que Moveu o Mundo',W/2,140);
  ctx.shadowBlur=0;
  ctx.fillStyle='#a08850';ctx.font='18px "Courier New"';ctx.fillText('Fase 2.2  —  Minas de Carvão dos Apalaches · Séc. XIX',W/2,192);
  if(IMG.card22){
    const cardSize=160,cardX=W/2-80,cardY=225;
    const glow=ctx.createRadialGradient(W/2,cardY+80,0,W/2,cardY+80,130);
    glow.addColorStop(0,'rgba(180,130,40,0.22)');glow.addColorStop(1,'rgba(180,130,40,0)');
    ctx.fillStyle=glow;ctx.beginPath();ctx.arc(W/2,cardY+80,130,0,Math.PI*2);ctx.fill();
    ctx.drawImage(IMG.card22,cardX,cardY,cardSize,cardSize);
  }
  ctx.fillStyle=`rgba(200,155,60,${.55+Math.sin(Date.now()/550)*.4})`;ctx.font='18px "Courier New"';
  ctx.fillText('▶  Pressione ENTER para começar  ◀',W/2,450);
  ctx.fillStyle='#a0a8b8';ctx.font='17px "Courier New"';
  ctx.fillText('← → Mover   ↑ Espaço Pular   E Interagir/Minerar',W/2,494);
  ctx.fillText('[M] Menu Principal',W/2,530);
  ctx.textAlign='left';
}

// ─── DEATH SCREEN ─────────────────────────────────────────────────────────────
function drawDeath(){
  ctx.fillStyle='rgba(0,0,0,0.72)';ctx.fillRect(0,0,W,H);
  const cause=G.player?.deathCause||'queda';
  const msgs={queda:'VOCÊ CAIU!',grisu:'EXPLOSÃO DE GRISÚ!',rocha:'ROCHA INSTÁVEL!'};
  const subs={queda:'Você caiu no abismo da galeria.',grisu:'Metano ignito — evacue ao ver a chama crescer!',rocha:'Cuidado com as estalactites.'};
  ctx.textAlign='center';ctx.shadowColor='#ff4040';ctx.shadowBlur=30;
  ctx.fillStyle='#ff6060';ctx.font='bold 54px "Courier New"';ctx.fillText(msgs[cause]||'VOCÊ CAIU!',W/2,H/2-50);
  ctx.shadowBlur=0;
  ctx.fillStyle='#cc8888';ctx.font='16px "Courier New"';ctx.fillText(subs[cause]||'',W/2,H/2-10);
  drawCorvan(W/2-24,H/2+10,3,false,Date.now()/200);
  ctx.fillStyle=UI_ACCENT;ctx.font='20px "Courier New"';
  ctx.fillText('Pressione  R  para recomeçar',W/2,H/2+140);ctx.fillText(`Mortes: ${G.deaths}`,W/2,H/2+168);
  ctx.fillStyle='#888';ctx.font='15px "Courier New"';ctx.fillText('[M] Menu Principal',W/2,H/2+200);
  ctx.textAlign='left';
}

// ─── COMPLETE SCREEN ──────────────────────────────────────────────────────────
function drawComplete(){
  const gr=ctx.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#060c04');gr.addColorStop(1,'#180c04');ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
  drawMineSparkles();
  const rg=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,500);rg.addColorStop(0,'rgba(220,185,80,.16)');rg.addColorStop(1,'rgba(220,185,80,0)');ctx.fillStyle=rg;ctx.fillRect(0,0,W,H);
  ctx.textAlign='center';ctx.shadowColor='#e0c040';ctx.shadowBlur=40;
  ctx.fillStyle='#e0c040';ctx.font='bold 42px "Courier New"';ctx.fillText('✦  FASE 2.2 CONCLUÍDA  ✦',W/2,118);
  ctx.shadowBlur=0;
  drawCorvan(W/2-160,200,4,false,Date.now()/300);
  ctx.save();ctx.translate(W/2+80,280);ctx.scale(2.8,2.8);drawCrachaItem(0,0,Date.now()/1000);ctx.restore();
  ctx.fillStyle='#e8d8a0';ctx.font='17px "Courier New"';ctx.fillText('A Escuridão que Moveu o Mundo foi revelada!',W/2,196);
  const lines=[
    '⛏  Picareta Industrial — som distinto para cada tipo de carvão',
    '🏮  Lâmpada de Davy — primeiro sensor de gás da história (1815)',
    '🪨  Lignito → ⬛ Betuminoso → 💎 Antracito — os 3 graus do carvão',
    '🏷️  Crachá de Breaker Boy — trabalho infantil proibido em 1938',
  ];
  ctx.fillStyle='#c8b880';ctx.font='14px "Courier New"';lines.forEach((l,i)=>ctx.fillText(l,W/2,248+i*28));
  ctx.fillStyle='#c0c8d8';ctx.font='16px "Courier New"';ctx.fillText(`Pontuação: ◈ ${G.player?.score||0}   Mortes: ${G.deaths}`,W/2,428);
  ctx.fillStyle=`rgba(220,185,80,${.6+Math.sin(Date.now()/600)*.4})`;ctx.font='15px "Courier New"';
  ctx.fillText('✦ Fase 2.3 desbloqueada!   [M] Menu Principal',W/2,458);ctx.textAlign='left';
}

// ═══ LEVEL BUILDERS ══════════════════════════════════════════════════════════

// ─── LEVEL 1 — Cena 1: Exterior da Mina ───────────────────────────────────────
function buildL1(){
  const FL=590,WW=3400,WH=900;
  const plats=[
    solid(0,FL,340,WH-FL),solid(420,FL,200,WH-FL),solid(700,FL,200,WH-FL),
    solid(980,FL,200,WH-FL),solid(1260,FL,220,WH-FL),solid(1540,FL,200,WH-FL),
    solid(1820,FL,240,WH-FL),solid(2100,FL,200,WH-FL),solid(2380,FL,220,WH-FL),
    solid(2660,FL,700,WH-FL),
    // Plataformas intermediárias
    solid(200,FL-200,130,18),solid(460,FL-240,110,18),solid(720,FL-180,130,18),
    solid(1000,FL-230,120,18),solid(1280,FL-200,120,18),solid(1560,FL-250,110,18),
    solid(1820,FL-200,130,18),solid(2100,FL-240,120,18),solid(2380,FL-200,110,18),
    solid(2660,FL-250,120,18),
    // Degraus curtos
    solid(380,FL-36,80,14),solid(660,FL-36,80,14),solid(900,FL-36,80,14),
    solid(1160,FL-36,80,14),solid(1440,FL-36,80,14),solid(1720,FL-36,80,14),
    solid(2000,FL-36,80,14),solid(2300,FL-36,80,14),solid(2600,FL-36,80,14),
    // Plataformas móveis e especiais
    movH(1380,FL-130,100,1380,1540,1.8),
    trap(1060,FL-60,100),
    spike(860,FL-18,60),spike(1760,FL-18,60),
  ];
  // Picareta industrial no chão (início)
  const cols=[
    new Col(180,FL-50,'picareta_industrial'),
  ];
  // Canário (dá a lâmpada de Davy)
  const canario={x:2900,y:FL-100,gifted:false};
  const triggers=[
    new Trigger(3200,FL-250,120,250,'Avançar para a Mina',(player,level)=>{
      if(!player.items.includes('picareta_industrial')){notify('Pegue a Picareta Industrial primeiro!');return;}
      if(!player.items.includes('lampada_davy')){notify('Interaja com o Canário da Mina para a Lâmpada de Davy!');return;}
      if(level._advFired)return;level._advFired=true;
      sfx('unlock');player.interactAnim=40;
      showDialog([
        '"Estamos nos Apalaches, no coração da Pensilvânia ou de West Virginia, por volta de 1880. O carvão que sai dessas montanhas aquece casas, move locomotivas e alimenta as forjas que constroem uma nação inteira."',
        '"Mas o preço disso está gravado nas faces dessas crianças que você vê ali — os \'breaker boys\'. Olhem para essa village à direita: a company town. A empresa controla moradia, comida e salário. Os trabalhadores vivem e morrem no ritmo das minas."',
        '"A Picareta Industrial e a Lâmpada de Davy estão comigo. Agora entramos — pelas camadas de xisto e carvão que contam 300 milhões de anos de história da Terra."',
      ],()=>{notify('✦ Avance para as galerias de carvão!');level.triggers[0].done=true;setTimeout(()=>G.nextLevel(),2000);});
    },true),
  ];
  return{id:1,bg:'bg01',W:WW,H:WH,startX:60,startY:FL-90,
    title:'Exterior — Entrada da Mina',
    hint(player){
      if(!player.items.includes('picareta_industrial'))return '⛏ Pegue a Picareta Industrial no chão →';
      if(!player.items.includes('lampada_davy'))return '🐦 Interaja com o Canário da Mina para a Lâmpada de Davy →';
      return '✦ Ferramentas em mãos — avance para a boca da mina →';
    },
    plats,cols,triggers,canario,coalLayers:null,grisuZones:null,crachaObj:null,
    intro:[
      '"Apalaches — West Virginia, 1880. Estas montanhas antigas guardam nas suas entranhas o combustível que aquece uma nação inteira: o carvão."',
      '"Antes de entrar, preciso de duas coisas: a Picareta Industrial — mais robusta que a básica — e a Lâmpada de Davy, que detecta o metano nas galerias profundas."',
      'Pegue a Picareta Industrial no chão e interaja com o Canário da Mina mais à frente!'
    ],
    update(player){
      tickMoving(this.plats);tickTrapdoors(this.plats);
      for(const c of this.cols)c.tick();
      const ent=this.triggers[0];
      if(!ent.done&&!G.dialog){
        if(player.items.includes('picareta_industrial')&&player.items.includes('lampada_davy')){
          if(player.x+player.w>=ent.x&&player.x<=ent.x+ent.w+80)ent.fn(player,this);
        }
      }
    },
    draw(player){
      drawMineSparkles();
      // Company town silhouette (direita)
      const townX=2400-cam.x,townY=FL-cam.y;
      if(townX<W+200&&townX>-300){
        // Casas
        for(let i=0;i<5;i++){
          const hx=townX+i*70,hy=townY;
          ctx.fillStyle='#2a1808';ctx.fillRect(hx,hy-50,44,52);
          ctx.fillStyle='#3a2010';ctx.beginPath();ctx.moveTo(hx-4,hy-50);ctx.lineTo(hx+22,hy-72);ctx.lineTo(hx+48,hy-50);ctx.closePath();ctx.fill();
        }
        // Chaminé industrial
        ctx.fillStyle='#1a1008';ctx.fillRect(townX+380,townY-130,22,132);
        ctx.fillStyle='#2a1808';ctx.fillRect(townX+376,townY-136,30,10);
        // Fumaça da chaminé
        const t2=Date.now()/1000;
        for(let i=0;i<5;i++){
          const sx2=townX+391+Math.sin(t2+i)*8,sy2=townY-140-i*18;
          ctx.fillStyle=`rgba(20,20,20,${0.4-i*0.07})`;
          ctx.beginPath();ctx.arc(sx2,sy2,10+i*3,0,Math.PI*2);ctx.fill();
        }
        // Trilhos
        ctx.fillStyle='#2a1808';ctx.fillRect(Math.max(0,townX-200),townY-3,600,5);
      }
      // Vagão de carvão
      drawVagonete(2600,FL);
      // Canário
      if(this.canario){
        const cx=this.canario.x-cam.x,cy=this.canario.y-cam.y;
        if(cx>-100&&cx<W+100){
          drawCanario(cx,cy,Date.now()/400);
          if(!this.canario.gifted&&Math.abs(player.x-this.canario.x)<160){
            const t3='[E] Interagir com o Canário da Mina 🐦';const tw=ctx.measureText(t3).width+24;
            ctx.fillStyle='rgba(0,0,0,0.82)';roundRect(cx-tw/2,cy-120,tw,24,4);ctx.fill();
            ctx.strokeStyle=UI_ACCENT;ctx.lineWidth=1.5;roundRect(cx-tw/2,cy-120,tw,24,4);ctx.stroke();
            ctx.fillStyle=UI_ACCENT;ctx.textAlign='center';ctx.fillText(t3,cx,cy-103);ctx.textAlign='left';
          }
          if(this.canario.gifted){
            ctx.fillStyle='rgba(200,200,80,0.7)';ctx.font='12px "Courier New"';
            ctx.textAlign='center';ctx.fillText('Boa sorte, mineiro! 🐦',cx,cy-90);ctx.textAlign='left';
          }
        }
      }
      for(const c of this.cols)c.draw(player.x,player.y);
      for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

// ─── LEVEL 2 — Cena 2: Geologia e Camadas ────────────────────────────────────
function buildL2(){
  const FL=590,WW=3200,WH=900;
  tileTheme=TILE_THEMES[2];
  const plats=[
    solid(0,FL,340,WH-FL),solid(420,FL,200,WH-FL),solid(700,FL,200,WH-FL),
    solid(980,FL,200,WH-FL),solid(1260,FL,220,WH-FL),solid(1540,FL,200,WH-FL),
    solid(1820,FL,240,WH-FL),solid(2100,FL,200,WH-FL),solid(2380,FL,200,WH-FL),
    solid(2660,FL,600,WH-FL),
    solid(200,FL-200,130,18),solid(460,FL-250,120,18),solid(720,FL-200,120,18),
    solid(1020,FL-240,120,18),solid(1300,FL-200,130,18),solid(1580,FL-250,110,18),
    solid(1880,FL-200,120,18),solid(2180,FL-250,120,18),solid(2460,FL-200,110,18),
    solid(340,FL-36,80,14),solid(620,FL-36,80,14),solid(900,FL-36,80,14),
    solid(1180,FL-36,80,14),solid(1460,FL-36,80,14),solid(1740,FL-36,80,14),
    solid(2040,FL-36,80,14),solid(2360,FL-36,80,14),
    movH(1700,FL-110,100,1700,1860,2.0),
    spike(880,FL-18,60),spike(1800,FL-18,60),
    trap(1240,FL-60,100),
  ];
  // Camadas de carvão nas paredes (como Col especiais, mais largas)
  const coalLayers=[
    new CoalLayer(400,FL-110,140,'xisto_carbonoso'),
    new CoalLayer(700,FL-130,160,'lignito'),
    new CoalLayer(1100,FL-125,150,'xisto_carbonoso'),
    new CoalLayer(1400,FL-140,160,'carvao_betuminoso'),
    new CoalLayer(1800,FL-130,150,'xisto_carbonoso'),
    new CoalLayer(2200,FL-145,180,'antracito'),
    new CoalLayer(2600,FL-130,140,'xisto_carbonoso'),
  ];
  const cols=[
    ...[100,260,520,800,1080,1360,1640,1920,2200,2500,2740].map(x=>new Col(x,FL-50,'lignito')),
    ...[600,1300,2000].map(x=>new Col(x,FL-60,'antracito')),
  ];
  const triggers=[
    new Trigger(3000,FL-250,140,250,'Avançar para as Galerias',(player,level)=>{
      const layersDone=level.coalLayers.filter(cl=>cl.mined).length;
      if(layersDone<3){notify(`Extraia mais amostras das camadas! (${layersDone}/3 tipos)`);return;}
      const hasLig=player.items.includes('lignito');
      const hasAnt=player.items.includes('antracito');
      if(!hasLig||!hasAnt){notify('Colete ao menos Lignito e Antracito!');return;}
      if(level._advFired)return;level._advFired=true;sfx('unlock');
      showDialog([
        '"Estas paredes contam 300 milhões de anos de história. No Carbonífero, esta região era um pântano tropical denso de samambaias gigantes. Com o tempo, essa vegetação foi soterrada, comprimida e aquecida."',
        '"O resultado: camadas de carvão em diferentes graus de metamorfismo — do Lignito (mais jovem e impuro) ao Carvão Betuminoso ao Antracito, o \'diamante negro\' com até 98% de carbono puro."',
        '"As camadas de carvão seguem o mesmo ângulo das rochas sedimentares ao redor — os mineiros chamavam de \'mergulho da camada\'. Siga a inclinação para encontrar onde o veio é mais espesso."',
        '"Mas atenção: nas galerias à frente há zonas de grisú — metano que pode explodir. A Lâmpada de Davy indicará quando recuar. Galerias com panos amarelos são ventiladas e seguras."',
      ],()=>{notify('✦ Avance com cuidado — o grisú espreita!');level.triggers[0].done=true;setTimeout(()=>G.nextLevel(),2000);});
    }),
  ];
  return{id:2,bg:'bg02',W:WW,H:WH,startX:60,startY:FL-90,
    title:'Geologia — As Camadas de Carvão',
    hint(player){
      const layersDone=this.coalLayers?this.coalLayers.filter(cl=>cl.mined).length:0;
      return layersDone<3?`⛏ Extraia amostras das camadas [E] (${layersDone}/3) →`:'✦ Amostras coletadas — avance para as galerias profundas →';
    },
    plats,cols,triggers,coalLayers,canario:null,grisuZones:null,crachaObj:null,
    intro:[
      '"Estamos dentro da mina. As paredes exibem a história geológica completa: xisto cinza intercalado com faixas negras brilhantes de carvão."',
      '"Há 300 milhões de anos — o Período Carbonífero — esta região era um pântano tropical denso de samambaias gigantes. Essa vegetação foi soterrada, comprimida e aquecida por milhões de anos."',
      '"O resultado: Lignito → Carvão Betuminoso → Antracito. Cada camada representa um grau diferente de pressão e tempo. Quanto mais fundo, mais puro o carvão."',
      'Extraia amostras [E] das camadas na parede para identificar os três tipos! Equipe a Picareta Industrial no Diário [I].'
    ],
    _eduTimer:0,
    update(player){tickMoving(this.plats);tickTrapdoors(this.plats);for(const cl of this.coalLayers)cl.tick();for(const c of this.cols)c.tick();},
    draw(player){
      drawMineSparkles();
      // Gotículas de água
      const t4=Date.now()/1000;
      for(let i=0;i<6;i++){
        const dx2=200+i*400-cam.x;
        const dy2=200+Math.sin(t4*2+i)*30;
        if(dx2<-5||dx2>W+5)continue;
        ctx.fillStyle='rgba(80,120,180,0.4)';
        ctx.beginPath();ctx.arc(dx2,dy2,2.5,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='rgba(80,120,180,0.2)';ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(dx2,dy2);ctx.lineTo(dx2,dy2+18);ctx.stroke();
      }
      // Painel Carbonifero removido — info integrada nas falas do Corvan (intro)
      for(const cl of this.coalLayers)cl.draw();
      for(const c of this.cols)c.draw(player.x,player.y);
      for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

// ─── LEVEL 3 — Cena 3: Grisú e Coleta ────────────────────────────────────────
function buildL3(){
  const FL=590,WW=3400,WH=900;
  tileTheme=TILE_THEMES[3];
  const plats=[
    solid(0,FL,340,WH-FL),solid(420,FL,200,WH-FL),solid(700,FL,200,WH-FL),
    solid(980,FL,200,WH-FL),solid(1260,FL,220,WH-FL),solid(1540,FL,200,WH-FL),
    solid(1820,FL,240,WH-FL),solid(2100,FL,200,WH-FL),solid(2380,FL,220,WH-FL),
    solid(2660,FL,240,WH-FL),solid(2980,FL,400,WH-FL),
    // Plataformas altas — galeria superior ventilada
    solid(200,FL-200,130,18),solid(460,FL-250,120,18),solid(740,FL-200,120,18),
    solid(1060,FL-240,120,18),solid(1340,FL-200,130,18),
    solid(1640,FL-140,120,18),  // Galeria do grisú (bloqueada)
    solid(1900,FL-200,140,18),  // Galeria ventilada (segura — panos amarelos)
    solid(2200,FL-250,120,18),solid(2500,FL-200,120,18),solid(2760,FL-240,120,18),
    movH(1480,FL-130,100,1480,1640,1.8),
    movH(2400,FL-140,100,2400,2560,1.6),
    spike(860,FL-18,60),spike(2200,FL-18,60),
    trap(1060,FL-60,100),
  ];
  // Camadas para coletar (galeria profunda)
  const coalLayers=[
    new CoalLayer(500,FL-120,140,'lignito'),
    new CoalLayer(1100,FL-135,150,'carvao_betuminoso'),
    new CoalLayer(2800,FL-140,160,'antracito'),
  ];
  // Zona de grisú (galeria esquerda bloqueada)
  const grisuZones=[
    new GrisuZone(1620,FL-280,200,220),
  ];
  // Crachá na galeria lateral segura (depois da zona de grisú)
  const crachaObj={x:2080,y:FL-260,done:false};
  const cols=[
    ...[100,260,500,780,1060,1340,1620,1900,2180,2460,2740].map(x=>new Col(x,FL-55,'lignito')),
    ...[700,1400,2200].map(x=>new Col(x,FL-60,'carvao_betuminoso')),
    ...[1200,2600].map(x=>new Col(x,FL-60,'antracito')),
  ];
  const triggers=[
    new Trigger(3200,FL-250,140,250,'Concluir Coleta',(player,level)=>{
      const hasLig=player.items.includes('lignito');
      const hasBet=player.items.includes('carvao_betuminoso');
      const hasAnt=player.items.includes('antracito');
      const hasCra=player.items.includes('cracha_breaker_boy');
      if(!hasLig){notify('Colete uma amostra de Lignito!');return;}
      if(!hasBet){notify('Colete uma amostra de Carvão Betuminoso!');return;}
      if(!hasAnt){notify('Colete uma amostra de Antracito!');return;}
      if(!hasCra){notify('Encontre o Crachá de Breaker Boy na galeria lateral!');return;}
      if(level._advFired)return;level._advFired=true;sfx('unlock');
      showDialog([
        '"Consegui: Lignito, Carvão Betuminoso e Antracito — os três graus de metamorfismo do carvão. E o Crachá de Breaker Boy nº 247."',
        '"Observem a Lâmpada de Davy — quando a chama cresceu na galeria principal, havia metano. Explosões de grisú podiam matar dezenas de mineiros de uma vez. Os panos amarelos na galeria ventilada eram o sistema real de sinalização dos mineiros."',
        '"O desvio pela galeria segura não é covardia: é o protocolo que salvava vidas. Em 1907, a explosão em Monongah, West Virginia, matou 362 mineiros — a maior tragédia industrial da história americana."',
      ],()=>{notify('✦ Saindo da mina — Cena 4!');level.triggers[0].done=true;setTimeout(()=>G.nextLevel(),2000);});
    }),
  ];
  return{id:3,bg:'bg03',W:WW,H:WH,startX:60,startY:FL-90,
    title:'Galeria Profunda — Coleta e Grisú',
    hint(player){
      const items=[player.items.includes('lignito'),player.items.includes('carvao_betuminoso'),player.items.includes('antracito'),player.items.includes('cracha_breaker_boy')];
      const done=items.filter(Boolean).length;
      if(done<4)return `⛏ Colete os 3 tipos de carvão e o Crachá de Breaker Boy (${done}/4)`;
      return '✦ Tudo coletado — avance para a saída →';
    },
    plats,cols,triggers,coalLayers,grisuZones,crachaObj,canario:null,
    intro:[
      '"Entramos nas galerias profundas. Aqui a pressão da rocha é sentida nas vigas de madeira que rangem. O silêncio é pontuado por gotejamentos e rachaduras."',
      '"Atenção: há zonas de grisú — metano natural liberado pelas camadas de carvão. A Lâmpada de Davy avisará quando a chama crescer. Quando isso acontecer, recue e siga os panos amarelos."',
      'Extraia [E] 1 amostra de cada tipo de carvão nas camadas e encontre o Crachá de Breaker Boy na galeria lateral!'
    ],
    update(player){
      tickMoving(this.plats);tickTrapdoors(this.plats);
      for(const cl of this.coalLayers)cl.tick();
      for(const gz of this.grisuZones)gz.tick();
      for(const c of this.cols)c.tick();
      // Grisú dano se sem lâmpada
      if(!player.items.includes('lampada_davy')){
        for(const gz of this.grisuZones){
          if(gz.overlaps(player))player._hurt(1,this,'grisu');
        }
      }
    },
    draw(player){
      drawMineSparkles();
      // Panos amarelos na galeria ventilada
      const STRIPS=[{wx:1880,wy:FL-280},{wx:1920,wy:FL-260},{wx:1960,wy:FL-270}];
      for(const s of STRIPS){
        const sx=s.wx-cam.x,sy=s.wy-cam.y;
        if(sx<-30||sx>W+30)continue;
        ctx.fillStyle='rgba(200,180,30,0.8)';ctx.fillRect(sx,sy,6,40);
        ctx.fillStyle='rgba(200,180,30,0.5)';ctx.fillRect(sx-4,sy,14,3);
        ctx.font='10px "Courier New"';ctx.fillStyle='rgba(200,180,30,0.7)';
        ctx.textAlign='center';ctx.fillText('VENTILADO',sx+3,sy-8);ctx.textAlign='left';
      }
      // Crachá no mundo
      if(!this.crachaObj.done){
        const cx=this.crachaObj.x-cam.x,cy=this.crachaObj.y-cam.y;
        if(cx>-60&&cx<W+60){
          ctx.save();ctx.translate(cx+Math.sin(Date.now()/600)*3,cy);ctx.scale(2.2,2.2);
          drawCrachaItem(0,0,Date.now()/600);ctx.restore();
          const ha=0.5+Math.sin(Date.now()/400)*0.5;
          ctx.fillStyle=`rgba(200,160,80,${ha*0.9})`;ctx.font='bold 12px "Courier New"';
          ctx.textAlign='center';ctx.fillText('[E] Crachá de Breaker Boy 🏷️',cx,cy-30);ctx.textAlign='left';
        }
      }
      for(const gz of this.grisuZones)gz.draw();
      for(const cl of this.coalLayers)cl.draw();
      for(const c of this.cols)c.draw(player.x,player.y);
      for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

// ─── LEVEL 4 — Cena 4: Saída ao Entardecer ────────────────────────────────────
function buildL4(){
  const FL=590,WW=1600,WH=900;
  tileTheme=TILE_THEMES[4];
  const plats=[
    solid(0,FL,1600,WH-FL),
    solid(240,FL-220,160,18),solid(640,FL-180,140,18),solid(1040,FL-240,140,18),
  ];
  const cols=[...[180,360,540,720,900,1080,1260].map(x=>new Col(x,FL-55,'lignito'))];
  const celebState={active:false,t:0};
  initSmoke(1360,FL-200);
  const triggers=[
    new Trigger(1400,FL-200,140,200,'Concluir Fase 2.2',(player,level)=>{
      const hasLig=player.items.includes('lignito');
      const hasBet=player.items.includes('carvao_betuminoso');
      const hasAnt=player.items.includes('antracito');
      const hasCra=player.items.includes('cracha_breaker_boy');
      if(!hasLig||!hasBet||!hasAnt||!hasCra){
        notify('Volte e complete a coleta das amostras e o Crachá!');return;
      }
      if(level._finFired)return;level._finFired=true;level.triggers[0].done=true;
      celebState.active=true;celebState.t=0;sfx('unlock');
      for(let i=0;i<20;i++)burst(player.x+20,player.y,'#404050',2,5+Math.random()*3);
      for(let i=0;i<12;i++)burst(player.x+20,player.y,UI_ACCENT,1,4+Math.random()*3);
      player.interactAnim=60;
      setTimeout(()=>{
        showDialog([
          '"Este crachá pertenceu a uma criança que nunca foi à escola naquele ano. O carvão que ele separou pode ter aquecido uma cidade inteira."',
          '"A Revolução Industrial foi real e transformou o mundo — mas foi construída também sobre esse custo humano. Os breaker boys. As company towns. Os acidentes por grisú."',
          '"E o CO₂ que aquele carvão liberou? Ainda está na atmosfera. A história que começa aqui ainda não terminou. Cada tonelada de carbono emitido nessas minas em 1880 é carbono que ainda aquece o planeta hoje."',
          '"Itens registrados no Diário de Bordo. Fase 2.2 concluída!"',
        ],()=>{
          unlockPhase('2.3');
          BUBBLE.active=false;G.dialog=false;
          try{sessionStorage.setItem('mineralis_session','1');}catch(e){}
          G.state='complete';
        });
      },1200);
    },true),
  ];
  return{id:4,bg:'bg04',W:WW,H:WH,startX:100,startY:FL-90,
    title:'Saída — A Vila ao Entardecer',
    hint(player){
      const all=player.items.includes('lignito')&&player.items.includes('carvao_betuminoso')&&player.items.includes('antracito')&&player.items.includes('cracha_breaker_boy');
      return all?'✦ Chegue ao marco final para concluir a fase!':'← Volte e colete os 3 tipos de carvão e o Crachá!';
    },
    plats,cols,triggers,coalLayers:null,canario:null,grisuZones:null,crachaObj:null,celebState,
    intro:[
      '"Saímos da mina ao entardecer"',
      '"A vila operária ainda fuma ao fundo. Os pombos pousam nos fios de telégrafo — a modernidade construída sobre o carvão."',
      '"Vamos até o marco final para registrar todas as nossas descobertas e concluir a Fase 2.2!"',
    ],
    update(player){
      tickMoving(this.plats);tickTrapdoors(this.plats);
      for(const c of this.cols)c.tick();
      if(this.celebState.active)this.celebState.t+=0.06;
      const fim=this.triggers[0];
      if(!fim.done&&!G.dialog){
        const all=player.items.includes('lignito')&&player.items.includes('carvao_betuminoso')&&player.items.includes('antracito')&&player.items.includes('cracha_breaker_boy');
        if(all&&player.x+player.w>=fim.x&&player.x<=fim.x+fim.w+60)fim.fn(player,this);
      }
    },
    draw(player){
      const wireY=FL-cam.y-220;
      ctx.strokeStyle='rgba(40,25,10,0.6)';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(0,wireY);ctx.lineTo(W,wireY);ctx.stroke();
      // Postes
      for(let i=0;i<4;i++){
        const px=i*340-cam.x%340;
        ctx.fillStyle='#2a1808';ctx.fillRect(px-3,wireY,6,FL-cam.y-wireY);
        ctx.fillRect(px-18,wireY,36,5);
      }
      // Pombos
      const t5=Date.now()/1000;
      [200,560,880,1200].forEach((wx,i)=>{
        const px=wx-cam.x,py=wireY-2+Math.sin(t5+i)*1.5;
        if(px<-20||px>W+20)return;
        ctx.fillStyle='#4a4848';ctx.beginPath();ctx.ellipse(px,py,6,4,0,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.ellipse(px,py-5,5,5,0,0,Math.PI*2);ctx.fill();
      });
      // Chaminé e fumaça (company town)
      const chX=1340-cam.x,chY=FL-cam.y;
      if(chX>-50&&chX<W+50){
        ctx.fillStyle='#1a1008';ctx.fillRect(chX,chY-160,20,162);
        ctx.fillRect(chX-4,chY-164,28,8);
        drawSmoke(1340,FL-164);
      }
      // Placa memorial
      const memX=80-cam.x,memY=FL-cam.y-240;
      if(memX>-220&&memX<W+20){
        ctx.fillStyle='rgba(10,6,2,0.85)';roundRect(memX,memY,160,130,4);ctx.fill();
        ctx.strokeStyle='rgba(90,60,20,0.7)';ctx.lineWidth=1.5;roundRect(memX,memY,160,130,4);ctx.stroke();
        ctx.font='bold 9px "Courier New"';ctx.fillStyle='rgba(160,120,40,0.8)';
        ctx.textAlign='center';ctx.fillText('EM MEMÓRIA',memX+80,memY+14);ctx.textAlign='left';
        ctx.fillStyle='rgba(160,120,40,0.25)';ctx.fillRect(memX+10,memY+20,140,1);
        ctx.font='9px "Courier New"';ctx.fillStyle='rgba(180,160,120,0.55)';
        ['John K.  — 1882','Thomas R. — 1885','William S.— 1887','James M. — 1891','Patrick C.— 1893'].forEach((n,i)=>ctx.fillText(n,memX+12,memY+34+i*16));
      }
      // Marco final dourado
      const fx=1500-cam.x,fy=FL-cam.y;
      ctx.fillStyle='#5a3810';ctx.fillRect(fx,fy-160,5,160);
      const flagWave=Math.sin(Date.now()/300)*4;
      ctx.fillStyle='#b08020';
      ctx.beginPath();ctx.moveTo(fx+5,fy-158);ctx.lineTo(fx+55,fy-145+flagWave);ctx.lineTo(fx+5,fy-128);ctx.closePath();ctx.fill();
      ctx.strokeStyle=UI_ACCENT;ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(fx+5,fy-158);ctx.lineTo(fx+55,fy-145+flagWave);ctx.lineTo(fx+5,fy-128);ctx.stroke();
      ctx.save();ctx.translate(fx+28,fy-143+flagWave*0.5);
      ctx.font='bold 10px "Courier New"';ctx.fillStyle='#2a1008';
      ctx.textAlign='center';ctx.fillText('FIM',0,4);ctx.textAlign='left';ctx.restore();
      const mg=ctx.createRadialGradient(fx+30,fy-80,5,fx+30,fy-80,60);
      mg.addColorStop(0,'rgba(160,120,40,0.15)');mg.addColorStop(1,'rgba(160,120,40,0)');
      ctx.fillStyle=mg;ctx.fillRect(fx-30,fy-140,120,160);
      // Celebração
      if(this.celebState&&this.celebState.active){
        const t6=this.celebState.t;
        const px2=player.x-cam.x+20,py2=player.y-cam.y;
        const tg=ctx.createRadialGradient(px2,py2-70,0,px2,py2-70,70);
        tg.addColorStop(0,`rgba(180,140,60,${0.3+Math.sin(t6*3)*0.15})`);tg.addColorStop(1,'rgba(180,140,60,0)');
        ctx.fillStyle=tg;ctx.fillRect(px2-70,py2-140,140,140);
        ctx.save();ctx.translate(px2,py2-65+Math.sin(t6*2)*10);ctx.rotate(Math.sin(t6*1.5)*0.25);ctx.scale(2.5,2.5);
        drawCrachaItem(0,0,t6);ctx.restore();
        for(let i=0;i<8;i++){
          const a=t6*0.9+i*(Math.PI*2/8),sr=40+Math.sin(t6*2+i)*8;
          const s2x=px2+Math.cos(a)*sr,s2y=py2-65+Math.sin(a)*sr;
          const sa=0.5+Math.abs(Math.sin(t6*2.5+i))*0.5;
          ctx.fillStyle=`rgba(160,120,40,${sa})`;ctx.font='13px serif';ctx.textAlign='center';ctx.fillText('💎',s2x,s2y);ctx.textAlign='left';
        }
      }
      for(const c of this.cols)c.draw(player.x,player.y);
      for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

// ═══ GAME CONTROLLER ═════════════════════════════════════════════════════════
const LEVELS=[buildL1,buildL2,buildL3,buildL4];
const G={
  state:'title',lvIdx:0,level:null,player:null,
  dialog:false,deaths:0,timeOnLevel:0,_storedItems:[],_storedScore:0,_storedTools:[],
  load(idx){
    this.lvIdx=idx;particles=[];
    tileTheme=TILE_THEMES[idx+1]||TILE_THEMES[1];
    this.level=LEVELS[idx]();cam.x=0;cam.y=0;
    this.player=new Player(this.level.startX,this.level.startY);
    if(idx===0){
      // Fase 2.2 começa com as ferramentas herdadas da Fase 2.1
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
    ctx.clearRect(0,0,W,H);
    if(this.state==='title'){drawTitle();return;}
    if(this.state==='complete'){drawComplete();return;}
    drawBg(this.level.bg);
    for(const p of this.level.plats)drawPlatform(p);
    this.level.draw(this.player);
    drawParticles();
    this.player.draw();
    if(this.state==='dead'){drawDeath();return;}
    drawHUD(this.player,this.level);
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
  if(G.state==='complete' &&jp['Enter']){
    try{sessionStorage.setItem('mineralis_session','1');}catch(e){}
    G.deaths=0;
    window.location.href='../../MenuPrincipal/index.html?unlocked=2.3';
  }
  G.update();G.draw();clearJP();
}

if(!gameReady){(function loadLoop(){
  if(gameReady)return;requestAnimationFrame(loadLoop);
  ctx.fillStyle='#0a0608';ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#e0b840';ctx.font='bold 24px "Courier New"';ctx.textAlign='center';
  ctx.fillText('Carregando...  '+assetsLoaded+'/'+totalAssets,W/2,H/2);
  ctx.fillStyle='#888';ctx.font='14px "Courier New"';
  ctx.fillText('Fase 2.2 - Minas de Carvao dos Apalaches',W/2,H/2+36);
  ctx.textAlign='left';
})();}
