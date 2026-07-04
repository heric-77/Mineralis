const SAVE_KEY='mineralis_save_v2';
function saveRead(){try{return JSON.parse(localStorage.getItem(SAVE_KEY))||{};}catch{return{};}}
function saveWrite(d){try{localStorage.setItem(SAVE_KEY,JSON.stringify(d));}catch{}}
function unlockPhase(id){const s=saveRead();if(!s.fases)s.fases={};if(!s.fases[id])s.fases[id]={};s.fases[id].desbloqueada=true;saveWrite(s);}
const _JOURNAL_ALIAS={picareta_ponta_fina:'picareta_fina'};
function journalCollect(id){id=_JOURNAL_ALIAS[id]||id;if(window.JournalStore){window.JournalStore.collect(id);return;}const s=saveRead();if(!s.coletados)s.coletados={};if(!s.coletados[id]){s.coletados[id]=true;saveWrite(s);}}

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
  else if(type==='picareta'){o.type='sawtooth';o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(50,t+.35);g.gain.setValueAtTime(.18,t);g.gain.exponentialRampToValueAtTime(.001,t+.40);}
  else if(type==='bastao'){o.type='sine';o.frequency.setValueAtTime(80,t);o.frequency.setValueAtTime(120,t+.1);o.frequency.setValueAtTime(60,t+.2);g.gain.setValueAtTime(.15,t);g.gain.exponentialRampToValueAtTime(.001,t+.6);}
  else if(type==='opala'){

    const freqs=[320,640,960,1280];
    freqs.forEach((f,i)=>{
      const oo=AC.createOscillator(),gg=AC.createGain();
      oo.type='sine';oo.frequency.value=f;
      gg.gain.setValueAtTime(0,t+i*.05);gg.gain.linearRampToValueAtTime(.04,t+i*.05+.1);
      gg.gain.exponentialRampToValueAtTime(.001,t+.8);
      oo.connect(gg);gg.connect(AC.destination);oo.start(t+i*.05);oo.stop(t+1);
    });
    o.stop(t);return;
  }
  else if(type==='churinga'){o.type='sine';o.frequency.setValueAtTime(55,t);o.frequency.exponentialRampToValueAtTime(110,t+.5);g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.001,t+.8);}
  else if(type==='wombat'){o.type='triangle';o.frequency.setValueAtTime(200,t);o.frequency.setValueAtTime(160,t+.08);o.frequency.setValueAtTime(240,t+.16);g.gain.setValueAtTime(.1,t);g.gain.exponentialRampToValueAtTime(.001,t+.4);}
  else if(type==='potch'){o.type='square';o.frequency.setValueAtTime(180,t);o.frequency.exponentialRampToValueAtTime(80,t+.2);g.gain.setValueAtTime(.1,t);g.gain.exponentialRampToValueAtTime(.001,t+.25);}
  else if(type==='item')  {o.frequency.setValueAtTime(440,t);o.frequency.setValueAtTime(660,t+.1);o.frequency.setValueAtTime(880,t+.2);g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.001,t+.3);}
  else if(type==='unlock'){o.frequency.setValueAtTime(330,t);o.frequency.setValueAtTime(440,t+.15);o.frequency.setValueAtTime(660,t+.3);g.gain.setValueAtTime(.13,t);g.gain.exponentialRampToValueAtTime(.001,t+.5);}
  else if(type==='hit')   {o.type='sawtooth';o.frequency.setValueAtTime(200,t);o.frequency.exponentialRampToValueAtTime(60,t+.2);g.gain.setValueAtTime(.18,t);g.gain.exponentialRampToValueAtTime(.001,t+.22);}
  else if(type==='roldana'){o.type='sawtooth';o.frequency.setValueAtTime(90,t);o.frequency.setValueAtTime(70,t+.3);g.gain.setValueAtTime(.08,t);g.gain.exponentialRampToValueAtTime(.001,t+.5);}
  o.start(t);o.stop(t+.7);
}

const IMG={};
let assetsLoaded=0,gameReady=false;
const ASSET_LIST=[
  ['bg01','Assets/cena1_planicie_lightning_ridge.svg'],
  ['bg02','Assets/cena2_shaft_galerias.svg'],
  ['bg03','Assets/cena3_campo_opalas.svg'],
  ['bg04','Assets/cena4_por_do_sol_songlines.svg'],
  ['ipicareta','Assets/6_1_picareta_ponta_fina.svg'],
  ['iroldana','Assets/6_1_roldana_poco.svg'],
  ['ibastao','Assets/6_1_bastao_escuta.svg'],
  ['iopala','Assets/6_1_opala.svg'],
  ['ichuringa','Assets/6_1_churinga.svg'],
  ['iwombat','Assets/6_1_wombat.svg'],
  ['card61','Assets/6_1_opala.svg'],
];
const totalAssets=ASSET_LIST.length;
ASSET_LIST.forEach(([key,src])=>{
  const img=new Image();
  img.onload=()=>{IMG[key]=img;if(++assetsLoaded>=totalAssets){gameReady=true;startGame();}};
  img.onerror=()=>{IMG[key]=null;if(++assetsLoaded>=totalAssets){gameReady=true;startGame();}};
  img.src=src;
});

const keys={},jp={};
window.addEventListener('keydown',e=>{if(!keys[e.code])jp[e.code]=true;keys[e.code]=true;
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
  if((e.code==="KeyI"||e.code==="Tab")&&G.state==="playing"){e.preventDefault();if(G.player&&(INV.open||!BUBBLE.active))INV.toggle(G.player);}
  if(e.code==='Escape'&&INV.open){INV.close();}
  if(e.code==='Escape'&&G.sonarMode){G.sonarMode=null;G.dialog=false;}
  if(e.code==='Escape'&&G.lightMode){G.lightMode=null;G.dialog=false;}
  if(e.code==='KeyM'){try{sessionStorage.setItem('mineralis_session','1');}catch(e){}
  window.location.href='../../MenuPrincipal/index.html';}
});
window.addEventListener('keyup',e=>delete keys[e.code]);
window.addEventListener('blur',()=>{for(const k in keys)delete keys[k];for(const k in jp)delete jp[k];TOUCH.l=TOUCH.r=TOUCH.j=TOUCH.e=false;});
document.addEventListener('visibilitychange',()=>{if(document.hidden){for(const k in keys)delete keys[k];for(const k in jp)delete jp[k];TOUCH.l=TOUCH.r=TOUCH.j=TOUCH.e=false;}});
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
  picareta_ponta_fina:{
    cat:'ferramenta',nome:'Picareta de Ponta Fina',icon:'⛏️',
    journalId:'picareta_fina',drawHand:'left',
    desc:'Picareta estreita adaptada para argila — não fragmenta opalas.\nCabo de madeira de mulga, mais leve que as anteriores.\nA argila de Lightning Ridge exige precisão, não força bruta.',
  },
  roldana_poco:{
    cat:'ferramenta',nome:'Roldana de Poço',icon:'🪤',
    journalId:'roldana_poco',drawHand:'right',
    desc:'Sistema de corda e roldana de madeira para descer nos shafts.\nOs shafts de Lightning Ridge têm 10–20m de profundidade.\nEscavados manualmente pelos garimpeiros artesanais.',
  },
  bastao_escuta:{
    cat:'ferramenta',nome:'Bastão de Escuta Aborígene',icon:'🔍',
    journalId:'bastao_escuta',drawHand:'right',
    desc:'Bastão de madeira de mulga para diagnóstico de cavidades.\nPresionado ao solo, transmite ressonância do que há embaixo.\nArgila densa: som abafado. Bolsão de opala: som oco e ressonante.',
  },
  opala_vermelha:{
    cat:'minerio',nome:'Opala Negra — Play Vermelho',icon:'🔴',
    journalId:'opala_vermelha',
    desc:'Black opal com jogo de cores dominante vermelho.\nSiO₂·nH₂O — sílica amorfa com esferas microscópicas em grade.\nA cor vermelha é a mais rara e valiosa do play of color.',
  },
  opala_azul:{
    cat:'minerio',nome:'Opala Negra — Play Azul',icon:'🔵',
    journalId:'opala_azul',
    desc:'Black opal com jogo de cores dominante azul.\nO fundo escuro da opala negra amplifica o brilho das cores.\nLightning Ridge produz 95% de toda opala negra do mundo.',
  },
  opala_verde:{
    cat:'minerio',nome:'Opala Negra — Play Verde',icon:'🟢',
    journalId:'opala_verde',
    desc:'Black opal com jogo de cores dominante verde.\nEsferas de sílica do mesmo tamanho — grade perfeita levou milhões de anos.\nNenhuma tecnologia humana consegue replicar completamente.',
  },
  churinga:{
    cat:'artefato',nome:'Churinga (Tjuringa)',icon:'🪨',
    journalId:'churinga',
    desc:'Placa oval de arenito com gravuras espirais — objeto sagrado Arrernte.\nRepresenta a identidade espiritual de um indivíduo e seus ancestrais.\nExistia antes do nascimento do dono e continua após sua morte.\nNota: Corvan não a leva — ela pertence ao lugar onde está.',
  },
};

const INV={
  open:false,tab:0,cursor:0,
  TABS:[
    {id:'ferramenta',label:'⛏️ Ferramentas',color:'#e8b850'},
    {id:'minerio',   label:'🔴 Minérios',   color:'#ff9060'},
    {id:'artefato',  label:'🪨 Artefatos',  color:'#d4a8c0'},
  ],
  tabItems(player){
    const cat=this.TABS[this.tab].id;
    let saved={};
    try{const s=localStorage.getItem(SAVE_KEY);if(s){const j=JSON.parse(s);saved=j.coletados||{};}}catch(e){}
    // Itens desta fase: só aparecem se coletados nesta sessão (id interno do jogo)
    const out=[];
    const canonShown=new Set();
    for(const [id,def] of Object.entries(ITEM_DEFS)){
      if(def.cat!==cat) continue;
      if(player.items.includes(id) || !!saved[def.journalId||id]){
        out.push({id,...def});
        canonShown.add(def.journalId||id);
      }
    }
    // Itens de OUTRAS fases: via catálogo global, evitando duplicar o que já apareceu acima
    for(const [id,def] of Object.entries(window.ALL_ITEM_DEFS||{})){
      if(def.cat!==cat || id in ITEM_DEFS || canonShown.has(id)) continue;
      const got = window.JournalStore ? window.JournalStore.isCollected(id) : !!saved[id];
      if(got) out.push({id,...def});
    }
    return out;
  },
  toggle(player){this.open=!this.open;if(this.open){this.cursor=Math.min(this.cursor,Math.max(0,this.tabItems(player).length-1));}G.dialog=this.open||BUBBLE.active;},
  close(){this.open=false;G.dialog=BUBBLE.active||false;},
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
    ctx.strokeStyle='#7a8050';ctx.lineWidth=2.5;roundRect(PX,PY,PW,PH,16);ctx.stroke();
    ctx.strokeStyle='rgba(180,200,120,0.2)';ctx.lineWidth=1;roundRect(PX+4,PY+4,PW-8,PH-8,12);ctx.stroke();
    ctx.fillStyle='#d0c890';ctx.font='bold 16px "Courier New"';
    ctx.textAlign='center';ctx.fillText('📔 DIÁRIO DE BORDO',W/2,PY+28);ctx.textAlign='left';
    ctx.fillStyle='rgba(180,200,120,0.3)';ctx.fillRect(PX+16,PY+38,PW-32,1);
    const TAB_W=PW/3,TAB_Y=PY+44;
    this.TABS.forEach((tab,i)=>{
      const tx=PX+i*TAB_W,active=(i===this.tab);
      ctx.fillStyle=active?'rgba(180,200,120,0.18)':'rgba(0,0,0,0.3)';
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
      const ROW_H=52,maxRows=Math.max(1,Math.floor(CH/ROW_H));
      const scrollTop=items.length>maxRows?Math.max(0,Math.min(this.cursor-maxRows+1,items.length-maxRows)):0;
      const visible=items.slice(scrollTop,scrollTop+maxRows);
      visible.forEach((item,vi)=>{
        const i=scrollTop+vi;
        const iy=CY+16+vi*ROW_H,selected=(i===this.cursor),equipped=player.activeTools.has(item.id);
        if(selected){ctx.fillStyle='rgba(180,200,120,0.18)';roundRect(PX+16,iy-10,COL_W,46,8);ctx.fill();ctx.strokeStyle='#d0c890';ctx.lineWidth=1.5;roundRect(PX+16,iy-10,COL_W,46,8);ctx.stroke();}
        ctx.font='24px serif';ctx.fillText(item.icon,PX+28,iy+22);
        ctx.font=(equipped?'bold ':'')+'14px "Courier New"';
        ctx.fillStyle=equipped?'#f0d8a0':(selected?'#e0f0d0':'#aaa');
        ctx.fillText(item.nome,PX+62,iy+16);
        if(equipped){ctx.fillStyle='rgba(180,200,120,0.22)';roundRect(PX+62,iy+20,80,16,4);ctx.fill();ctx.font='10px "Courier New"';ctx.fillStyle='#d0c890';ctx.fillText('▶ EQUIPADO',PX+66,iy+32);}
      });
      if(scrollTop>0){ctx.font='11px "Courier New"';ctx.fillStyle='#d0c890';ctx.textAlign='center';ctx.fillText('▲ mais',PX+16+COL_W/2,CY+10);ctx.textAlign='left';}
      if(scrollTop+maxRows<items.length){ctx.font='11px "Courier New"';ctx.fillStyle='#d0c890';ctx.textAlign='center';ctx.fillText('▼ mais',PX+16+COL_W/2,CY+16+maxRows*ROW_H+2);ctx.textAlign='left';}
      const sel=items[this.cursor];
      if(sel){
        ctx.fillStyle='rgba(180,200,120,0.08)';roundRect(DESC_X,CY,PW-DESC_X+PX-16,CH-10,8);ctx.fill();
        ctx.font='48px serif';ctx.textAlign='center';ctx.fillText(sel.icon,DESC_X+(PW-DESC_X+PX-16)/2,CY+70);ctx.textAlign='left';
        ctx.font='bold 15px "Courier New"';ctx.fillStyle='#d0c890';
        ctx.textAlign='center';ctx.fillText(sel.nome,DESC_X+(PW-DESC_X+PX-16)/2,CY+100);ctx.textAlign='left';
        const catLabel={ferramenta:'⛏️ Ferramenta',minerio:'🔴 Minério',artefato:'🪨 Artefato'};
        ctx.font='11px "Courier New"';ctx.fillStyle='#888';
        ctx.textAlign='center';ctx.fillText(catLabel[sel.cat],DESC_X+(PW-DESC_X+PX-16)/2,CY+118);ctx.textAlign='left';
        ctx.fillStyle='rgba(180,200,120,0.25)';ctx.fillRect(DESC_X+20,CY+126,PW-DESC_X+PX-56,1);
        const descLines=sel.desc.split('\n');
        ctx.font='13px "Courier New"';ctx.fillStyle='#d8e8c8';
        descLines.forEach((l,i)=>{ctx.textAlign='center';ctx.fillText(l,DESC_X+(PW-DESC_X+PX-16)/2,CY+146+i*22);});
        ctx.textAlign='left';
        if(sel.cat==='ferramenta'){
          const btnTxt=player.activeTools.has(sel.id)?'[E] Desequipar':'[E] Equipar';
          const btnColor=player.activeTools.has(sel.id)?'rgba(180,60,20,0.3)':'rgba(180,200,120,0.2)';
          ctx.fillStyle=btnColor;roundRect(DESC_X+40,CY+CH-60,PW-DESC_X+PX-96,34,8);ctx.fill();
          ctx.strokeStyle=player.activeTools.has(sel.id)?'#c04020':'#d0c890';ctx.lineWidth=1.5;
          roundRect(DESC_X+40,CY+CH-60,PW-DESC_X+PX-96,34,8);ctx.stroke();
          ctx.font='bold 13px "Courier New"';ctx.fillStyle=player.activeTools.has(sel.id)?'#e06040':'#d0c890';
          ctx.textAlign='center';ctx.fillText(btnTxt,DESC_X+(PW-DESC_X+PX-16)/2,CY+CH-38);ctx.textAlign='left';
        }
      }
    }
    ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(PX,PY+PH-38,PW,38);
    ctx.fillStyle='rgba(180,200,120,0.3)';ctx.fillRect(PX+16,PY+PH-39,PW-32,1);
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

const cam={x:0,y:0,W:W,H:H,LW:3200,LH:720,
  track(player,worldW,worldH){
    const tx=Math.max(0,Math.min(player.x-W/2+player.w/2,worldW-W));
    const ty=Math.max(0,Math.min(player.y-H*0.55,worldH-H));
    this.x+=(tx-this.x)*0.12;
    this.y+=(ty-this.y)*0.12;
  }
};

const GRAV=0.46,PSPD=5.2,JUMPF=-12.0,MAXFALL=16;
const TILE_THEMES={
  1:{top:'#c87030',body:'#8a4820',dark:'#5a2808'},
  2:{top:'#a08060',body:'#604030',dark:'#382010'},
  3:{top:'#c0a060',body:'#7a5030',dark:'#4a2810'},
  4:{top:'#d07840',body:'#904820',dark:'#602008'},
};
let tileTheme=TILE_THEMES[1];

function solid(x,y,w,h){return{type:'solid',x,y,w,h};}
function spike(x,y,w){return{type:'spike',x,y,w,h:18};}

function drawPlatform(p){
  const sx=p.x-cam.x,sy=p.y-cam.y;
  if(sx>W+80||sx+p.w<-80||sy>H+40||sy+p.h<-40)return;
  if(p.type==='spike'){
    ctx.fillStyle='#7a5030';const nc=Math.max(1,Math.floor(p.w/20));
    for(let i=0;i<nc;i++){const tx=sx+i*(p.w/nc);ctx.beginPath();ctx.moveTo(tx,sy+p.h);ctx.lineTo(tx+p.w/nc/2,sy);ctx.lineTo(tx+p.w/nc,sy+p.h);ctx.fill();}return;
  }
  if(p.type==='_dead')return;
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
  r(13,0,6,3,'#c09030');r(14,0,4,2,'#ffe060');
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
  r(9,42,6,4,'#3a1c08');r(17,42,6,4,'#3a1c08');
  r(8,44,8,2,'#2a1008');r(16,44,8,2,'#2a1008');
  ctx.fillStyle='#ffe060';ctx.globalAlpha=0.25*lb;ctx.beginPath();ctx.arc(16*S,1*S,4*S,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=1;

  if(activeTool==='picareta_ponta_fina'){
    const wb=Math.sin(frame*0.2)*1.5;
    r(0,24+wb,5,1,'#7a4818');r(0,25+wb,1,8,'#7a4818');
    r(-1,22+wb,7,2,'#909080');r(2,20+wb,2,3,'#b0b0a0');
  } else if(activeTool==='roldana_poco'){

    ctx.strokeStyle='#808070';ctx.lineWidth=2*S;
    ctx.beginPath();ctx.arc(2*S,28*S,6*S,0,Math.PI*2);ctx.stroke();
    ctx.strokeStyle='rgba(100,90,70,0.7)';ctx.lineWidth=1*S;
    ctx.beginPath();ctx.moveTo(-4*S,28*S);ctx.lineTo(8*S,28*S);ctx.stroke();
    ctx.beginPath();ctx.moveTo(2*S,22*S);ctx.lineTo(2*S,34*S);ctx.stroke();
  } else if(activeTool==='bastao_escuta'){

    r(25,20,2,20,'#6a3c20');r(26,19,1,22,'#7a4828');

    r(25,17,3,4,'#c84020');

    r(24,38,4,3,'#5a2c10');
  }
  ctx.restore();
}

function drawWombat(cx,cy,frame=0){
  ctx.save();ctx.translate(cx,cy);
  const bob=Math.sin(frame*0.6)*1.0;

  ctx.fillStyle='#786050';
  ctx.beginPath();ctx.ellipse(0,0+bob,28,16,0,0,Math.PI*2);ctx.fill();

  ctx.fillStyle='#907870';
  ctx.beginPath();ctx.ellipse(0,-2+bob,20,11,0,0,Math.PI*2);ctx.fill();

  ctx.fillStyle='#786050';
  ctx.beginPath();ctx.ellipse(-20,-2+bob,16,12,0.2,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#907870';
  ctx.beginPath();ctx.ellipse(-20,-3+bob,12,9,0.2,0,Math.PI*2);ctx.fill();

  ctx.fillStyle='#4a3028';
  ctx.fillRect(-37,-6+bob,12,9);
  ctx.fillStyle='#605040';
  ctx.fillRect(-36,-5+bob,10,4);

  ctx.fillStyle='#2a1818';
  ctx.fillRect(-35,-3+bob,3,2);
  ctx.fillRect(-30,-3+bob,3,2);

  ctx.fillStyle='#1a1010';
  ctx.beginPath();ctx.arc(-28,-6+bob,2.5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.6)';
  ctx.beginPath();ctx.arc(-27,-7+bob,1,0,Math.PI*2);ctx.fill();

  ctx.fillStyle='#786050';
  ctx.beginPath();ctx.arc(-16,-14+bob,5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#c0a090';
  ctx.beginPath();ctx.arc(-16,-14+bob,3,0,Math.PI*2);ctx.fill();

  const legBob=Math.sin(frame*1.2)*2;
  ctx.fillStyle='#5a4030';
  ctx.fillRect(-22,10+bob,10,6);
  ctx.fillRect(-5,10+bob,10,6);
  ctx.fillRect(10,10+bob,10,6);

  ctx.fillStyle='#3a2818';
  for(let leg of [-22,-5,10]){
    ctx.fillRect(leg,14+bob,3,3);
    ctx.fillRect(leg+3,14+bob,3,3);
    ctx.fillRect(leg+6,14+bob,3,3);
  }

  ctx.fillStyle='#786050';
  ctx.beginPath();ctx.arc(26,2+bob,6,0,Math.PI*2);ctx.fill();

  ctx.fillStyle='#5a4030';
  ctx.fillRect(34,-2,6,6);
  ctx.fillRect(42,0,6,6);
  ctx.fillStyle='#6a5040';
  ctx.fillRect(34,-2,3,3);
  ctx.fillRect(42,0,3,3);
  ctx.restore();
}

function drawOpalaItem(cx,cy,bobT=0,dominantColor='red'){
  ctx.save();ctx.translate(cx,cy+Math.sin(bobT)*5);
  const t=Date.now()/500;

  const colors=['rgba(255,60,60,0.3)','rgba(60,60,255,0.3)','rgba(60,200,60,0.3)','rgba(255,200,60,0.3)'];
  const ci=Math.floor(t*2)%colors.length;
  const glow=ctx.createRadialGradient(0,0,2,0,0,30);
  glow.addColorStop(0,colors[ci]);glow.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,30,0,Math.PI*2);ctx.fill();

  const opalColors={
    red:['#ff3030','#ff8060','#20a040','#4040ff'],
    blue:['#2040ff','#60c0ff','#ff4040','#40c060'],
    green:['#20a040','#80ff60','#4040ff','#ff6030'],
  };
  const oc=opalColors[dominantColor]||opalColors.red;

  ctx.fillStyle='#151010';
  ctx.beginPath();ctx.ellipse(0,0,18,14,0,0,Math.PI*2);ctx.fill();

  const angle=t;
  for(let i=0;i<4;i++){
    const a=angle+i*(Math.PI/2);
    const px=Math.cos(a)*6,py=Math.sin(a)*4;
    const gg=ctx.createRadialGradient(px,py,0,px,py,10);
    gg.addColorStop(0,oc[i]+'cc');gg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=gg;
    ctx.beginPath();ctx.ellipse(0,0,16,12,0,0,Math.PI*2);ctx.fill();
  }

  const sa=Math.abs(Math.sin(t*2));
  ctx.fillStyle=`rgba(255,255,255,${sa*0.8})`;
  ctx.beginPath();ctx.arc(-5,-4,2,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

function drawPicaretaFinaItem(cx,cy,bobT=0){
  ctx.save();ctx.translate(cx,cy+Math.sin(bobT)*5);
  const glow=ctx.createRadialGradient(0,0,2,0,0,28);
  glow.addColorStop(0,'rgba(180,140,100,0.28)');glow.addColorStop(1,'rgba(180,140,100,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,28,0,Math.PI*2);ctx.fill();
  const S=0.6,O=-24;
  const r=(x,y,w,h,c,a)=>{if(a!==undefined)ctx.globalAlpha=a;ctx.fillStyle=c;ctx.fillRect(x*S+O,y*S+O,w*S,h*S);ctx.globalAlpha=1;};

  r(10,58,4,8,'#7A5228');r(12,54,4,8,'#7A5228');r(14,50,4,8,'#8A6030');
  r(16,46,4,8,'#8A6030');r(18,42,4,8,'#9A6A38');r(20,38,4,8,'#9A6A38');
  r(22,34,4,6,'#AA7440');r(24,30,4,6,'#AA7440');

  r(11,59,1,6,'#9A7048');r(13,55,1,6,'#9A7048');r(15,51,1,6,'#AE8050');

  r(26,25,8,9,'#484840');r(27,26,6,7,'#545448');

  r(16,22,20,5,'#686858');r(18,20,16,4,'#787868');r(20,18,12,3,'#888878');
  r(10,22,8,3,'#909080');r(6,23,5,2,'#A0A090');r(2,24,4,1,'#C0C0B0');
  r(10,22,5,2,'#D0D0C0');

  const sa=Math.abs(Math.sin(Date.now()/500));
  ctx.strokeStyle=`rgba(200,180,80,${sa*0.7})`;ctx.lineWidth=1.2;
  ctx.beginPath();ctx.moveTo(4*S+O,24*S+O);ctx.lineTo(0*S+O,20*S+O);ctx.stroke();
  ctx.restore();
}

function drawRoldanaItem(cx,cy,bobT=0){
  ctx.save();ctx.translate(cx,cy+Math.sin(bobT)*5);
  const glow=ctx.createRadialGradient(0,0,2,0,0,28);
  glow.addColorStop(0,'rgba(160,140,100,0.25)');glow.addColorStop(1,'rgba(160,140,100,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,28,0,Math.PI*2);ctx.fill();
  const S=0.6,O=-24;
  const r=(x,y,w,h,c,a)=>{if(a!==undefined)ctx.globalAlpha=a;ctx.fillStyle=c;ctx.fillRect(x*S+O,y*S+O,w*S,h*S);ctx.globalAlpha=1;};

  r(36,10,8,60,'#7A5228');r(37,10,6,60,'#8A6030');

  ctx.strokeStyle='#909080';ctx.lineWidth=3*S;
  ctx.beginPath();ctx.arc(40*S+O,30*S+O,16*S,0,Math.PI*2);ctx.stroke();
  ctx.strokeStyle='#606050';ctx.lineWidth=5*S;
  ctx.beginPath();ctx.arc(40*S+O,30*S+O,11*S,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle='#484838';ctx.beginPath();ctx.arc(40*S+O,30*S+O,5*S,0,Math.PI*2);ctx.fill();

  ctx.strokeStyle='#c0a060';ctx.lineWidth=2*S;
  const angle=Date.now()/800;
  ctx.beginPath();ctx.arc(40*S+O,30*S+O,13*S,angle,angle+Math.PI*0.8);ctx.stroke();

  r(28,6,16,8,'#7A5228');r(29,7,14,6,'#8A6030');
  ctx.restore();
}

function drawChuringaItem(cx,cy,bobT=0){
  ctx.save();ctx.translate(cx,cy+Math.sin(bobT)*4);

  const t=Date.now()/600;
  const glow=ctx.createRadialGradient(0,0,2,0,0,30);
  const a=0.3+Math.abs(Math.sin(t))*0.2;
  glow.addColorStop(0,`rgba(200,160,80,${a})`);glow.addColorStop(1,'rgba(200,160,80,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,30,0,Math.PI*2);ctx.fill();

  ctx.fillStyle='#8a4820';
  ctx.beginPath();ctx.ellipse(0,0,20,13,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#a05828';
  ctx.beginPath();ctx.ellipse(0,0,18,11,0,0,Math.PI*2);ctx.fill();

  ctx.fillStyle='#c07840';
  ctx.beginPath();ctx.ellipse(0,-1,15,9,0,0,Math.PI*2);ctx.fill();

  ctx.strokeStyle='#5a2c10';ctx.lineWidth=1.5;

  for(let i=0;i<3;i++){
    ctx.beginPath();
    ctx.arc(0,0,(4+i*4),0,Math.PI*1.6);ctx.stroke();
  }

  ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(-14,-2);ctx.lineTo(-8,-2);ctx.stroke();
  ctx.beginPath();ctx.moveTo(8,-2);ctx.lineTo(14,-2);ctx.stroke();
  ctx.beginPath();ctx.moveTo(-12,4);ctx.lineTo(-6,4);ctx.stroke();
  ctx.beginPath();ctx.moveTo(6,4);ctx.lineTo(12,4);ctx.stroke();

  ctx.fillStyle='#5a2c10';
  for(let i=0;i<6;i++){
    const ang=i*(Math.PI/3);
    ctx.beginPath();ctx.arc(Math.cos(ang)*9,Math.sin(ang)*6,1.5,0,Math.PI*2);ctx.fill();
  }
  const sa=Math.abs(Math.sin(t));
  ctx.strokeStyle=`rgba(200,160,80,${sa*0.6})`;ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(12,-10);ctx.lineTo(16,-16);ctx.stroke();
  ctx.restore();
}

class OpalField{
  constructor(x,y,opalType){
    this.x=x;this.y=y;this.w=52;this.h=58;
    this.opalType=opalType;
    this.state='intact';
    this.done=false;this.glowT=Math.random()*Math.PI*2;
    this.isOpal=true;
  }
  tick(){this.glowT+=0.03;}
  draw(){
    if(this.done)return;
    const sx=this.x-cam.x,sy=this.y-cam.y;
    if(sx<-120||sx>W+120)return;
    const a=this.state==='excavated'?0.25:(0.4+Math.abs(Math.sin(this.glowT))*0.35);

    ctx.fillStyle=this.state==='excavated'?`rgba(160,150,140,${a})`:`rgba(210,200,190,${a})`;
    ctx.fillRect(sx,sy,this.w,this.h);
    if(this.state==='intact'){

      ctx.strokeStyle=`rgba(100,160,180,${a*0.7})`;ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(sx+8,sy+10);ctx.lineTo(sx+40,sy+28);ctx.stroke();
      ctx.strokeStyle=`rgba(180,120,60,${a*0.6})`;
      ctx.beginPath();ctx.moveTo(sx+20,sy+5);ctx.lineTo(sx+30,sy+45);ctx.stroke();

      const colBob=0.5+Math.abs(Math.sin(this.glowT*1.5))*0.5;
      ctx.fillStyle=`rgba(255,${100+Math.floor(colBob*100)},${50+Math.floor(colBob*100)},${colBob*0.7})`;
      ctx.beginPath();ctx.arc(sx+26,sy+28,5+colBob*3,0,Math.PI*2);ctx.fill();
    } else if(this.state==='probed'){

      ctx.fillStyle='#c03020';ctx.fillRect(sx+22,sy-16,2,16);
      ctx.fillStyle='#e04030';ctx.fillRect(sx+24,sy-16,10,8);
      ctx.fillStyle='rgba(220,180,160,0.5)';ctx.fillRect(sx+6,sy+8,40,40);
    } else {
      ctx.fillStyle='rgba(150,140,130,0.4)';ctx.fillRect(sx+8,sy+8,36,42);
    }
    const ha=0.5+Math.sin(Date.now()/400)*0.5;
    ctx.fillStyle=`rgba(220,200,160,${ha*0.9})`;ctx.font='bold 11px "Courier New"';
    ctx.textAlign='center';
    if(this.state==='intact'){
      ctx.fillText('[E] Usar Bastão de Escuta',sx+this.w/2,sy-32);
      ctx.font='10px "Courier New"';ctx.fillStyle=`rgba(200,180,140,${ha*0.7})`;
      ctx.fillText('🔍 Bastão necessário',sx+this.w/2,sy-18);
    } else if(this.state==='probed'){
      ctx.fillText('[E] Escavar com Picareta',sx+this.w/2,sy-32);
      ctx.font='10px "Courier New"';ctx.fillStyle=`rgba(200,180,140,${ha*0.7})`;
      ctx.fillText('⛏️ Picareta necessária',sx+this.w/2,sy-18);
    }
    ctx.textAlign='left';
  }
}

function drawLightOverlay(lightMode){
  if(!lightMode)return;
  ctx.fillStyle='rgba(0,0,0,0.70)';ctx.fillRect(0,0,W,H);
  const pw=660,ph=260,px=(W-pw)/2,py=H/2-ph/2-20;
  ctx.shadowColor='rgba(0,0,0,0.8)';ctx.shadowBlur=20;
  ctx.fillStyle='rgba(6,4,10,0.97)';roundRect(px,py,pw,ph,14);ctx.fill();
  ctx.shadowBlur=0;
  ctx.strokeStyle='#c08040';ctx.lineWidth=2.5;roundRect(px,py,pw,ph,14);ctx.stroke();
  ctx.font='bold 14px "Courier New"';ctx.fillStyle='#f0d080';
  ctx.textAlign='center';ctx.fillText('TESTE DE LUZ ANGULAR — GIRAR 360°',W/2,py+24);
  ctx.fillStyle='rgba(180,140,60,0.3)';ctx.fillRect(px+16,py+32,pw-32,1);
  ctx.font='12px "Courier New"';ctx.fillStyle='#f0c860';
  ctx.fillText('Gire a pedra sob a lanterna e observe o jogo de cores',W/2,py+50);
  const slotW=180,slotH=130,slotGap=20;
  const totalW=3*slotW+2*slotGap;
  const startX=px+(pw-totalW)/2;
  lightMode.slots.forEach((slot,i)=>{
    const sx=startX+i*(slotW+slotGap);
    const sy=py+62;
    const selected=(i===lightMode.cursor&&!slot.consumed);
    if(slot.consumed){
      ctx.fillStyle='rgba(8,8,8,0.5)';roundRect(sx,sy,slotW,slotH,8);ctx.fill();
      ctx.fillStyle='rgba(80,80,80,0.4)';ctx.font='12px "Courier New"';
      ctx.textAlign='center';ctx.fillText('— examinado —',sx+slotW/2,sy+slotH/2+5);ctx.textAlign='left';
      return;
    }
    ctx.fillStyle=selected?'rgba(200,140,60,0.22)':'rgba(14,10,6,0.7)';
    roundRect(sx,sy,slotW,slotH,8);ctx.fill();
    ctx.strokeStyle=selected?'#e0a040':'rgba(120,90,40,0.4)';ctx.lineWidth=selected?2:1;
    roundRect(sx,sy,slotW,slotH,8);ctx.stroke();

    const t=Date.now()/600;
    const angle=(t+i)*0.8;
    ctx.save();ctx.translate(sx+slotW/2,sy+slotH/2-10);

    ctx.fillStyle='#151010';
    ctx.beginPath();ctx.ellipse(0,0,18,14,angle*0.3,0,Math.PI*2);ctx.fill();
    if(slot.isOpal){

      const playColors=[`rgba(255,${60+Math.floor(Math.abs(Math.sin(angle))*160)},60,0.9)`,
                        `rgba(60,60,${200+Math.floor(Math.abs(Math.cos(angle))*55)},0.9)`,
                        `rgba(40,${150+Math.floor(Math.abs(Math.sin(angle+1))*100)},40,0.9)`];
      playColors.forEach((c,ci)=>{
        const gg=ctx.createRadialGradient(Math.cos(angle+ci)*5,Math.sin(angle+ci)*4,0,Math.cos(angle+ci)*5,Math.sin(angle+ci)*4,10);
        gg.addColorStop(0,c);gg.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=gg;
        ctx.beginPath();ctx.ellipse(0,0,16,12,angle*0.3,0,Math.PI*2);ctx.fill();
      });
      ctx.font='bold 11px "Courier New"';ctx.textAlign='center';
      ctx.fillStyle='#f0c860';ctx.fillText('✨ ACENDE! Opala Preciosa',sx+slotW/2,sy+slotH-8);
    } else {

      ctx.fillStyle='rgba(200,200,195,0.6)';
      ctx.beginPath();ctx.ellipse(0,0,16,12,0,0,Math.PI*2);ctx.fill();
      ctx.font='bold 11px "Courier New"';ctx.textAlign='center';
      ctx.fillStyle='#a0a090';ctx.fillText('○ Não acende — Potch',sx+slotW/2,sy+slotH-8);
    }
    ctx.textAlign='left';
    ctx.restore();
  });
  const hintA=0.6+Math.sin(Date.now()/400)*0.4;
  ctx.font='12px "Courier New"';ctx.fillStyle=`rgba(200,180,100,${hintA})`;
  ctx.textAlign='center';
  ctx.fillText('[← →] Selecionar   [E] Coletar pedra   [Esc] Fechar',W/2,py+ph-14);
  ctx.textAlign='left';
}

class Col{
  constructor(x,y,type){this.x=x;this.y=y;this.w=34;this.h=34;this.type=type;this.done=false;this.t=Math.random()*Math.PI*2;}
  tick(){if(!this.done)this.t+=0.06;}
  draw(playerX,playerY){
    if(this.done)return;
    const sx=this.x-cam.x,sy=this.y-cam.y;
    if(sx<-60||sx>W+60)return;
    const TOOL_TYPES=['picareta_ponta_fina','roldana_poco'];
    const isTool=TOOL_TYPES.includes(this.type);
    if(isTool){
      const a=0.25+Math.abs(Math.sin(this.t*0.8))*0.35;
      const glow=ctx.createRadialGradient(sx+17,sy+17,4,sx+17,sy+17,36);
      glow.addColorStop(0,`rgba(200,170,100,${a})`);glow.addColorStop(1,'rgba(200,170,100,0)');
      ctx.fillStyle=glow;ctx.beginPath();ctx.arc(sx+17,sy+17,36,0,Math.PI*2);ctx.fill();
    }
    ctx.save();ctx.translate(sx+this.w/2,sy+this.h/2);
    if(this.type==='picareta_ponta_fina')      drawPicaretaFinaItem(0,0,this.t);
    else if(this.type==='roldana_poco')         drawRoldanaItem(0,0,this.t);
    else if(this.type==='churinga')             drawChuringaItem(0,0,this.t);
    ctx.restore();
    if(isTool&&playerX!==undefined){
      const dist=Math.hypot(playerX+20-(this.x+17),playerY+40-(this.y+17));
      if(dist<110){
        const labels={picareta_ponta_fina:'⛏️ Picareta de Ponta Fina',roldana_poco:'🪤 Roldana de Poço'};
        const txt=`[E] Pegar ${labels[this.type]||this.type}`;
        const pulse=0.7+Math.sin(Date.now()/300)*0.3;
        ctx.font='bold 13px "Courier New"';
        const tw=ctx.measureText(txt).width+20;
        const headY=playerY-cam.y-8;
        let bx=sx+17-tw/2;bx=Math.max(6,Math.min(bx,W-tw-6));
        const by=Math.min(sy-42,headY-24);
        ctx.fillStyle=`rgba(6,4,10,${0.88*pulse})`;roundRect(bx,by,tw,24,5);ctx.fill();
        ctx.strokeStyle=`rgba(220,200,140,${pulse})`;ctx.lineWidth=1.5;roundRect(bx,by,tw,24,5);ctx.stroke();
        ctx.fillStyle=`rgba(220,200,140,${pulse})`;
        ctx.textAlign='center';ctx.fillText(txt,bx+tw/2,by+16);ctx.textAlign='left';
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
    const sx=this.x+this.w/2-cam.x;
    const baseSy=this.y-cam.y-26+Math.sin(Date.now()/350)*4;
    const headSy=py-cam.y-8;
    const sy=Math.min(baseSy,headSy);
    const txt='[E] '+this.label;ctx.font='14px "Courier New"';
    const tw=ctx.measureText(txt).width+24;
    const bx=Math.max(tw/2+6,Math.min(sx,W-tw/2-6));
    ctx.fillStyle='rgba(0,0,0,0.82)';roundRect(bx-tw/2,sy-16,tw,24,4);ctx.fill();
    ctx.strokeStyle='#c09060';ctx.lineWidth=1.5;roundRect(bx-tw/2,sy-16,tw,24,4);ctx.stroke();
    ctx.fillStyle='#c09060';ctx.textAlign='center';ctx.fillText(txt,bx,sy);ctx.textAlign='left';
  }
}

function wrapText(text,maxW,font='15px "Courier New"'){
  ctx.font=font;
  const pars=text.split('\n'),result=[];
  for(const para of pars){
    const words=para.split(' ');let line='';
    for(const w of words){const test=line?line+' '+w:w;if(ctx.measureText(test).width>maxW&&line){result.push(line);line=w;}else line=test;}
    if(line)result.push(line);
  }return result;
}
const BUBBLE={
  active:false,queue:[],cb:null,lines:[],speakerTxt:'CORVAN',speakerColor:'#d0c890',faceFrame:0,
  show(msgs,cb,speaker='CORVAN',color='#d0c890'){this.queue=[...msgs];this.cb=cb;this.active=true;this.speakerTxt=speaker;this.speakerColor=color;G.dialog=true;this._next();},
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
    ctx.strokeStyle='rgba(200,180,120,0.2)';ctx.lineWidth=1;roundRect(bx+4,by+4,bubW-8,bubH-8,10);ctx.stroke();
    const tbx=Math.max(bx+30,Math.min(pcx,bx+bubW-30));
    const tty=by+bubH,tipy=Math.min(pcy,tty+38);
    ctx.fillStyle='rgba(6,4,10,0.96)';ctx.beginPath();ctx.moveTo(tbx-14,tty);ctx.lineTo(tbx+14,tty);ctx.lineTo(pcx,tipy);ctx.closePath();ctx.fill();
    ctx.strokeStyle=this.speakerColor;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(tbx-14,tty);ctx.lineTo(pcx,tipy);ctx.lineTo(tbx+14,tty);ctx.stroke();
    const fx=bx+facePad,fy=by+pad;
    ctx.fillStyle='rgba(14,8,20,0.85)';roundRect(fx,fy,faceW,faceH,6);ctx.fill();
    ctx.strokeStyle='rgba(200,180,120,0.45)';ctx.lineWidth=1.5;roundRect(fx,fy,faceW,faceH,6);ctx.stroke();
    const faceScale=faceW/18*0.82,sprX=fx+faceW/2-16*faceScale,sprY=fy+4;
    ctx.save();ctx.beginPath();roundRect(fx+1,fy+1,faceW-2,faceH-2,5);ctx.clip();
    const activeTool=[...((G.player&&G.player.activeTools)||[])][0]||null;
    drawCorvan(sprX,sprY,faceScale,false,this.faceFrame*4,activeTool);
    const mouthY=sprY+13*faceScale,mouthX=sprX+12*faceScale,mouthW=8*faceScale;
    const open=Math.abs(Math.sin(this.faceFrame*4))*1.8*faceScale;
    if(open>0.5){ctx.fillStyle='#2a0e06';ctx.fillRect(mouthX,mouthY,mouthW,open);}
    ctx.restore();
    const tx=fx+faceW+facePad;
    ctx.font='bold 12px "Courier New"';ctx.fillStyle=this.speakerColor;ctx.fillText(this.speakerTxt,tx,by+pad+14);
    ctx.fillStyle='rgba(200,180,120,0.35)';ctx.fillRect(tx,by+pad+20,textW,1);
    ctx.font='15px "Courier New"';ctx.fillStyle='#f0ecd8';
    this.lines.forEach((l,i)=>ctx.fillText(l,tx,by+pad+40+i*lineH));
    const pulse=0.5+Math.sin(Date.now()/400)*0.5;
    ctx.fillStyle=`rgba(200,180,120,${pulse})`;ctx.font='12px "Courier New"';
    ctx.textAlign='right';ctx.fillText('[E] Continuar →',bx+bubW-pad,by+bubH-10);ctx.textAlign='left';
  }
};
function showDialog(msgs,cb,speaker='CORVAN',color='#d0c890'){BUBBLE.show(msgs,cb,speaker,color);}
function checkDlg(){if(G.dialog&&!INV.open&&isE())BUBBLE.advance();}

let popup={active:false,timer:0,title:'',lines:[],color:'#f0d080'};
function showPopup(title,lines,color,ms=6500){popup={active:true,timer:ms,title,lines,color};}
function tickPopup(){if(popup.active&&popup.timer>0){popup.timer-=16;if(popup.timer<=0)popup.active=false;}}
function drawPopup(){
  if(!popup.active)return;
  const al=Math.min(1,popup.timer/400);ctx.save();ctx.globalAlpha=al;
  const pw=340,lineH=20;
  const innerW=pw-32-14;
  const wrapped=[];
  popup.lines.forEach(l=>{
    wrapText(l,innerW,'12px "Courier New"').forEach((seg,i)=>wrapped.push((i===0?'• ':'  ')+seg));
  });
  const ph=wrapped.length*lineH+80;
  const px=W-pw-18,py=56;
  ctx.fillStyle='rgba(6,4,10,0.94)';roundRect(px,py,pw,ph,10);ctx.fill();
  ctx.strokeStyle=popup.color;ctx.lineWidth=2;roundRect(px,py,pw,ph,10);ctx.stroke();
  ctx.strokeStyle='rgba(200,180,120,0.2)';ctx.lineWidth=1;roundRect(px+4,py+4,pw-8,ph-8,7);ctx.stroke();
  let titleFont=13;ctx.font=`bold ${titleFont}px "Courier New"`;
  while(ctx.measureText(popup.title).width>pw-24&&titleFont>9){titleFont--;ctx.font=`bold ${titleFont}px "Courier New"`;}
  ctx.fillStyle=popup.color;ctx.textAlign='center';ctx.fillText(popup.title,px+pw/2,py+22);
  ctx.textAlign='left';
  ctx.fillStyle='rgba(200,180,120,0.12)';ctx.fillRect(px+14,py+30,pw-28,1);
  ctx.font='12px "Courier New"';ctx.fillStyle='#e8e0c0';
  wrapped.forEach((l,i)=>{ctx.fillText(l,px+16,py+48+i*lineH);});
  ctx.restore();
}

let notifText='',notifAlpha=0,notifTimer=0;
function notify(msg,ms=2800){notifText=msg;notifTimer=ms;notifAlpha=1;}
function tickNotif(){if(notifTimer>0){notifTimer-=16;if(notifTimer<=0)notifAlpha=0;else notifAlpha=Math.min(1,notifTimer/300);}}
function drawNotif(){
  if(notifAlpha<=0)return;ctx.save();ctx.globalAlpha=notifAlpha;ctx.font='14px "Courier New"';
  const tw=ctx.measureText(notifText).width+32,nx=(W-tw)/2,ny=46;
  ctx.fillStyle='rgba(6,4,10,0.88)';roundRect(nx,ny,tw,28,6);ctx.fill();
  ctx.strokeStyle='#c09060';ctx.lineWidth=1.5;roundRect(nx,ny,tw,28,6);ctx.stroke();
  ctx.fillStyle='#c09060';ctx.textAlign='center';ctx.fillText(notifText,W/2,ny+19);ctx.textAlign='left';
  ctx.restore();
}

function drawSonarOverlay(sonar){
  if(!sonar)return;
  ctx.fillStyle='rgba(0,0,0,0.0)';

  const sx=sonar.testX-cam.x,sy=sonar.testY-cam.y;
  const t=Date.now()/400;
  for(let ring=0;ring<3;ring++){
    const rad=20+ring*18+((t*30)%18);
    const a=Math.max(0,1-(ring*0.3)-(((t*30)%18)/18)*0.5);
    ctx.strokeStyle=sonar.isHollow?`rgba(255,200,60,${a})`:`rgba(100,150,100,${a*0.5})`;
    ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(sx,sy,rad,0,Math.PI*2);ctx.stroke();
  }

  const label=sonar.isHollow?'🔔 BOLSÃO OCO — opala!':'🔕 Argila densa';
  const color=sonar.isHollow?'#f0d060':'#90a080';
  ctx.font='bold 13px "Courier New"';
  const tw=ctx.measureText(label).width+24;
  ctx.fillStyle='rgba(6,4,10,0.88)';roundRect(sx-tw/2,sy-60,tw,26,5);ctx.fill();
  ctx.strokeStyle=color;ctx.lineWidth=1.5;roundRect(sx-tw/2,sy-60,tw,26,5);ctx.stroke();
  ctx.fillStyle=color;ctx.textAlign='center';ctx.fillText(label,sx,sy-42);ctx.textAlign='left';
}

let wrongLightTests=0;
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
    this.opalaCount=0;
  }
  overlaps(r){return this.x<r.x+r.w&&this.x+this.w>r.x&&this.y<r.y+r.h&&this.y+this.h>r.y;}
  near(r,d=80){return Math.abs(this.x+20-(r.x+r.w/2))<r.w/2+d&&Math.abs(this.y+40-(r.y+r.h/2))<r.h/2+d;}

  update(level){
    if(INV.open){INV.navigate(this);return;}

    if(G.lightMode){
      const lm=G.lightMode;
      const active=lm.slots.filter(s=>!s.consumed);
      if(active.length===0){G.lightMode=null;G.dialog=false;return;}
      if(isL()){
        do{lm.cursor=(lm.cursor+lm.slots.length-1)%lm.slots.length;}while(lm.slots[lm.cursor].consumed);
        return;
      }
      if(isR()){
        do{lm.cursor=(lm.cursor+1)%lm.slots.length;}while(lm.slots[lm.cursor].consumed);
        return;
      }
      if(isE()){
        const slot=lm.slots[lm.cursor];
        if(slot&&!slot.consumed){
          slot.consumed=true;
          if(slot.isOpal){
            this.items.push(slot.opalId);
            this.opalaCount++;
            this.score+=60;
            journalCollect(slot.opalId);
            sfx('opala');
            burst(this.x+20,this.y,'#ff8060',8,3);
            burst(this.x+20,this.y,'#6060ff',8,3);
            burst(this.x+20,this.y,'#40c040',8,3);
            const names={opala_vermelha:'Opala Negra (Play Vermelho)',opala_azul:'Opala Negra (Play Azul)',opala_verde:'Opala Negra (Play Verde)'};
            notify(`🔴 ${names[slot.opalId]||'Opala'} coletada!`);
            showPopup('✨ OPALA NEGRA COLETADA',
              ['SiO₂·nH₂O — sílica amorfa, não é cristal',
               'Play of color: esferas de sílica em grade perfeita',
               'A luz se difrata em cores como um prisma',
               'Lightning Ridge: 95% de toda opala negra do mundo'],
              '#f0a060');
            lm.field.done=true;G.lightMode=null;G.dialog=false;
          } else {
            wrongLightTests++;
            sfx('potch');
            burst(this.x+20,this.y,'#c0c0b0',8,2);
            notify('⬜ Esta não acende — é potch. Tente outro ângulo.');
            const remaining=lm.slots.filter(s=>!s.consumed);
            if(remaining.length===1&&remaining[0].isOpal){
              remaining[0].consumed=true;
              this.items.push(remaining[0].opalId);
              this.opalaCount++;
              this.score+=60;
              journalCollect(remaining[0].opalId);
              sfx('opala');
              burst(this.x+20,this.y,'#ff8060',12,3.5);
              lm.field.done=true;G.lightMode=null;G.dialog=false;
            }
          }
        }
        return;
      }
      return;
    }

    if(G.dialog)return;

    if(isL()){this.vx=-PSPD;this.facing=-1;}
    else if(isR()){this.vx=PSPD;this.facing=1;}
    else this.vx*=0.7;

    if(this.onG)this.coyote=8;else if(this.coyote>0)this.coyote--;
    if(isJ())this.jbuf=10;if(this.jbuf>0)this.jbuf--;
    if(this.jbuf>0&&(this.onG||this.coyote>0)){this.vy=JUMPF;this.onG=false;this.coyote=0;this.jbuf=0;sfx('jump');}

    this.onMoving=null;
    this.vy=Math.min(this.vy+GRAV,MAXFALL);
    this.x+=this.vx;this._colX(level.plats);
    this.onG=false;this.y+=this.vy;this._colY(level.plats);
    this.x=Math.max(0,this.x);

    if(!this.inv){
      for(const p of level.plats){if(p.type==='spike'&&this.overlaps(p))this._hurt(2,level,'espinho');}
    }
    if(this.inv>0)this.inv--;if(this.interactAnim>0)this.interactAnim--;

    if(isE()){

      const TOOL_TYPES=['picareta_ponta_fina','roldana_poco'];
      for(const c of level.cols||[]){
        if(c.done||!TOOL_TYPES.includes(c.type))continue;
        if(!this.near({x:c.x,y:c.y,w:c.w,h:c.h},90))continue;
        c.done=true;
        if(c.type==='picareta_ponta_fina'){
          this.items.push('picareta_ponta_fina');this.activeTools.add('picareta_ponta_fina');sfx('item');
          burst(c.x+17,c.y+17,'#c0a060',12);journalCollect('picareta_ponta_fina');
          showPopup('⛏️ PICARETA DE PONTA FINA',['Cabo estreito — não fragmenta opalas delicadas','Mais leve que a de kimberlito','Argila de Lightning Ridge exige precisão','Equipe no Diário [I]'],'#c8a050');
          notify('✦ Picareta de Ponta Fina! Equipe-a no Diário [I].');
        } else if(c.type==='roldana_poco'){
          this.items.push('roldana_poco');sfx('item');
          burst(c.x+17,c.y+17,'#a0b090',10);journalCollect('roldana_poco');
          showPopup('🪤 ROLDANA DE POÇO',['Sistema de corda e roldana para descer nos shafts','Shafts de 10–20m escavados manualmente','Permite subir e descer com amostras de argila','Busque o Wombat →'],'#a0b090');
          notify('✦ Roldana coletada! Busque o Wombat →');
        }
        break;
      }

      if(level.wombat&&!level.wombat.gifted&&this.near({x:level.wombat.x-60,y:level.wombat.y-80,w:120,h:80})){
        level.wombat.gifted=true;sfx('wombat');
        for(let i=0;i<16;i++)burst(level.wombat.x,level.wombat.y-20,'#c0a060',1,2+Math.random()*2);
        this.items.push('bastao_escuta');
        this.activeTools.add('bastao_escuta');
        journalCollect('bastao_escuta');
        showDialog([
          '"O Wombat Comum — Vombatus ursinus. O marsupial escavador mais poderoso da Austrália. 30 metros de galeria com suas garras. O único animal do mundo que produz fezes cúbicas para marcar território em pedras sem rolar."',
          '"O wombat conhece os vazios subterrâneos do outback como nenhum outro ser vivo. Ele me deixou o Bastão de Escuta — madeira de mulga pressionada ao solo. Coloco o ouvido na extremidade superior."',
          '"A diferença é clara: argila densa produz um zumbido abafado. Um bolsão oco onde a opala se forma — ressoa como um bong. É a sabedoria de 50.000 anos ouvindo a terra."',
        ],()=>{notify('✦ Bastão de Escuta obtido! Use [E] nos campos de argila →');},'CORVAN','#d0c890');
        showPopup('🔍 BASTÃO DE ESCUTA ABORÍGENE',['Diagnóstico de cavidade por ressonância sonora','Solo maciço: zumbido abafado (mmmh)','Bolsão de opala: bong oco e ressonante','Sabedoria Yuwaalaraay de 50.000 anos'],'#c0a060');
      }

      if(level.opalFields&&this.items.includes('bastao_escuta')){
        for(const field of level.opalFields){
          if(field.done)continue;
          if(field.state==='intact'&&this.near({x:field.x,y:field.y,w:field.w,h:field.h},80)){
            if(!G.dialog){
              field.state='probed';
              sfx('bastao');

              G.sonarTimer=120;
              G.sonarData={testX:field.x+field.w/2,testY:field.y,isHollow:true};
              shake(3,10);
              burst(field.x+field.w/2,field.y,'#f0d060',6,2);
              notify('🔔 BOLSÃO OCO detectado! Escave com a Picareta [E].');
            }
            break;
          }
          if(field.state==='probed'&&this.near({x:field.x,y:field.y,w:field.w,h:field.h},80)){
            if(!this.items.includes('picareta_ponta_fina')){notify('⛏️ Encontre a Picareta de Ponta Fina primeiro!');break;}
            if(!G.dialog){
              field.state='excavated';
              sfx('picareta');shake(5,15);
              burst(field.x+26,field.y+28,'#c0b8a0',10,2.5);

              const slots=[
                {isOpal:true,opalId:field.opalType,consumed:false},
                {isOpal:false,opalId:null,consumed:false},
                {isOpal:false,opalId:null,consumed:false},
              ];

              for(let i=slots.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[slots[i],slots[j]]=[slots[j],slots[i]];}
              G.lightMode={field,slots,cursor:0};
              G.dialog=true;
              notify('💡 Gire cada pedra sob a luz antes de guardar!');
            }
            break;
          }
        }
      }

      if(level.churingaObj&&!level.churingaObj.done&&this.near({x:level.churingaObj.x-40,y:level.churingaObj.y-40,w:80,h:40})){
        level.churingaObj.done=true;this.churingaDevolvida=true;sfx('churinga');
        burst(level.churingaObj.x,level.churingaObj.y,'#c0a060',18,3);

        showDialog([
          '"A Churinga. Uma placa oval de arenito vermelho com gravuras espirais e lineares. Para os Arrernte, cada pessoa possui uma Churinga que existia antes de seu nascimento e continuará existindo após sua morte."',
          '"Objetos sagrados não mudam de dono — eles pertencem ao lugar onde estão, ao songline que os criou. Eu a encontrei guardada nas galerias de argila: o lugar mais sagrado que existe, para quem conhece a terra."',
          '"Guardo as opalas — sou guardião delas. Mas a Churinga precisa voltar. Há coisas que o guardião não guarda: ele apenas se certifica de que estão seguras e no lugar certo."',
        ],()=>{
          notify('🪨 Churinga devolvida ao lugar.');

          journalCollect('churinga');
        },'CORVAN','#d0c890');
      }

      for(const t of level.triggers||[]){if(!t.done&&this.near(t)){t.fn(this,level);break;}}
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
    if(this.overlaps(p)){
      if(this.vy>=0){this.y=p.y-this.h;this.vy=0;this.onG=true;}
      else{this.y=p.y+p.h;this.vy=Math.abs(this.vy)*0.2;}}}
  }
  _hurt(dmg,level,cause='queda'){if(this.inv>0)return;this.hp-=dmg;this.inv=80;burst(this.x+20,this.y+40,'#ff4040',10);sfx('hit');if(this.hp<=0){this.hp=0;this.dead=true;this.deathCause=cause;}}

  draw(){
    if(this.dead)return;
    const S=1.5,FOOT_Y=46*S;
    const dx=this.x-cam.x+this.w/2-16*S;
    const dy=this.y-cam.y+this.h-FOOT_Y;
    const flip=this.facing===-1;
    const wf=this.state==='run'?this.walkT:(this.state==='idle'?Date.now()/800:0);
    const _dispTool=this.activeTools.has('bastao_escuta')?'bastao_escuta':
                    this.activeTools.has('picareta_ponta_fina')?'picareta_ponta_fina':
                    this.activeTools.has('roldana_poco')?'roldana_poco':null;
    ctx.save();drawCorvan(dx,dy,S,flip,wf,_dispTool);ctx.restore();
    if(this.inv>0&&Math.floor(this.inv/6)%2===0){ctx.fillStyle='rgba(255,60,60,0.35)';ctx.fillRect(this.x-cam.x,this.y-cam.y,this.w,this.h);}
  }
}

function drawBg(levelNum,levelW,levelH){
  const skyGrad=ctx.createLinearGradient(0,0,0,H);
  if(levelNum===1){

    skyGrad.addColorStop(0,'#1a6ab0');skyGrad.addColorStop(0.6,'#4898e0');skyGrad.addColorStop(1,'#d05820');
  } else if(levelNum===2){

    skyGrad.addColorStop(0,'#181008');skyGrad.addColorStop(0.5,'#2a1c0e');skyGrad.addColorStop(1,'#3a2818');
  } else if(levelNum===3){

    skyGrad.addColorStop(0,'#141008');skyGrad.addColorStop(1,'#302018');
  } else {

    skyGrad.addColorStop(0,'#8020a0');skyGrad.addColorStop(0.35,'#d05010');skyGrad.addColorStop(0.65,'#f08020');skyGrad.addColorStop(1,'#a03010');
  }
  ctx.fillStyle=skyGrad;ctx.fillRect(0,0,W,H);

  const bgKeys=['bg01','bg02','bg03','bg04'];
  const bgImg=IMG[bgKeys[levelNum-1]];
  if(bgImg){
    const scale=H/bgImg.height;
    const iw=bgImg.width*scale;
    const tilesNeeded=Math.ceil(levelW/iw)+2;
    ctx.save();ctx.globalAlpha=0.92;
    for(let t=0;t<tilesNeeded;t++){
      const bx=-cam.x*0.18+t*iw;
      if(bx>W+iw)break;
      ctx.drawImage(bgImg,bx,0,iw,H);
    }
    ctx.restore();
  }
}

let dustPts=[];
function spawnDust(levelNum){
  if(Math.random()<0.06){
    const x=cam.x+Math.random()*W;
    const y=Math.random()*H;
    let c='rgba(200,150,80,0.4)';
    if(levelNum===2||levelNum===3)c='rgba(200,190,170,0.2)';
    if(levelNum===4)c='rgba(220,120,60,0.4)';
    dustPts.push({x,y,vx:(Math.random()-.5)*0.4,vy:-(Math.random()*0.6+0.1),life:80+Math.random()*60,max:140,c,r:1+Math.random()*2.5});
  }
}
function tickDust(){for(let i=dustPts.length-1;i>=0;i--){const p=dustPts[i];p.x+=p.vx;p.y+=p.vy;p.life--;if(p.life<=0)dustPts.splice(i,1);}if(dustPts.length>60)dustPts.splice(0,5);}
function drawDust(){for(const p of dustPts){ctx.save();ctx.globalAlpha=(p.life/p.max)*0.6;ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x-cam.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.restore();}}

function drawSvgItem(key,cx,cy,size=48,bobT=0){
  const img=IMG[key];if(!img)return;
  const bx=cx-size/2;const by=cy-size/2+Math.sin(bobT)*5;
  ctx.save();
  const gl=ctx.createRadialGradient(cx,cy,2,cx,cy,size*0.7);
  gl.addColorStop(0,'rgba(220,200,140,0.25)');gl.addColorStop(1,'rgba(220,200,140,0)');
  ctx.fillStyle=gl;ctx.beginPath();ctx.arc(cx,cy,size*0.7,0,Math.PI*2);ctx.fill();
  ctx.drawImage(img,bx,by,size,size);
  ctx.restore();
}

function drawHUD(player,level){
  if(!player)return;

  for(let i=0;i<player.maxHp;i++){
    ctx.fillStyle=i<player.hp?'#e08040':'#333';
    ctx.beginPath();const hx=16+i*28,hy=10;
    ctx.arc(hx+5,hy+5,5,Math.PI,0);ctx.arc(hx+15,hy+5,5,Math.PI,0);
    ctx.lineTo(hx+20,hy+5);ctx.bezierCurveTo(hx+20,hy+14,hx+10,hy+18,hx+10,hy+18);
    ctx.bezierCurveTo(hx+10,hy+18,hx,hy+14,hx,hy+5);ctx.closePath();ctx.fill();
  }

  ctx.fillStyle='rgba(0,0,0,0.55)';ctx.fillRect(0,0,W,34);
  const levelTitles=['A Planície de Lightning Ridge','Os Shafts e Galerias','O Campo de Opalas','Pôr do Sol — Songlines'];
  const levelNum=(G.currentLevel?G.currentLevel.num:1)-1;
  const levelTitle=levelTitles[levelNum]||'';
  ctx.shadowColor='rgba(0,0,0,0.8)';ctx.shadowBlur=6;
  ctx.fillStyle='#e8e0c0';ctx.font='20px "Courier New"';
  ctx.textAlign='center';ctx.fillText(levelTitle,W/2,24);ctx.textAlign='left';
  ctx.shadowBlur=0;

  const opalas=player.items.filter(id=>id.startsWith('opala_')).length;
  const _lvNum=G.currentLevel?G.currentLevel.num:1;
  if(_lvNum>=3||opalas>0){
    ctx.fillStyle='#f0d060';ctx.font='bold 20px "Courier New"';
    ctx.textAlign='right';ctx.fillText('🔴 '+opalas+'/3',W-14,26);ctx.textAlign='left';
  }

  const TOOL_DEFS=[
    {id:'picareta_ponta_fina',icon:'⛏️',nome:'Picareta'},
    {id:'roldana_poco',icon:'🪤',nome:'Roldana'},
    {id:'bastao_escuta',icon:'🔍',nome:'Bastão'},
  ];
  const tools=TOOL_DEFS.filter(t=>player.items.includes(t.id));
  const PX=12,PY=46,PW=178,PH_BASE=52;
  const PH=PH_BASE+(tools.length>0?6+tools.length*22:0);
  ctx.save();
  ctx.shadowColor='rgba(0,0,0,0.6)';ctx.shadowBlur=8;
  ctx.fillStyle='rgba(8,6,0,0.88)';roundRect(PX,PY,PW,PH,6);ctx.fill();
  ctx.shadowBlur=0;
  ctx.strokeStyle='#7a7840';ctx.lineWidth=1.5;roundRect(PX,PY,PW,PH,6);ctx.stroke();
  ctx.strokeStyle='rgba(200,200,120,0.25)';ctx.lineWidth=1;roundRect(PX+3,PY+3,PW-6,PH-6,4);ctx.stroke();
  ctx.restore();
  const midX=PX+PW/2;
  const kw=26,kx=PX+PW-kw-6,ky=PY+5;
  ctx.font='11px serif';ctx.fillStyle='#c0c060';ctx.textAlign='left';ctx.fillText('📔',PX+8,PY+20);
  ctx.font='bold 10px "Courier New"';ctx.fillStyle='#c0c060';ctx.fillText('DIÁRIO DE BORDO',PX+24,PY+20);
  ctx.fillStyle='rgba(200,200,120,0.2)';roundRect(kx,ky,kw,18,3);ctx.fill();
  ctx.strokeStyle='#c0c060';ctx.lineWidth=1;roundRect(kx,ky,kw,18,3);ctx.stroke();
  ctx.font='bold 10px "Courier New"';ctx.fillStyle='#d0d080';
  ctx.textAlign='center';ctx.fillText('[I]',kx+kw/2,ky+13);ctx.textAlign='left';
  ctx.fillStyle='rgba(200,200,120,0.3)';ctx.fillRect(PX+6,PY+26,PW-12,1);
  const activeTool=player.activeTools&&player.activeTools.size>0?[...player.activeTools][0]:null;
  const atY=PY+44;ctx.textAlign='center';
  if(activeTool&&ITEM_DEFS[activeTool]){
    const def=ITEM_DEFS[activeTool];
    ctx.fillStyle='rgba(200,200,120,0.1)';roundRect(PX+6,atY-14,PW-12,20,3);ctx.fill();
    ctx.font='11px "Courier New"';ctx.fillStyle='#f0f0a0';
    ctx.fillText(def.icon+' '+def.nome,midX,atY+1);
  } else {
    ctx.font='12px "Courier New"';ctx.fillStyle='#c0c8a0';ctx.fillText('Não Equipado',midX,atY);
  }
  ctx.textAlign='left';
  if(tools.length>0){
    ctx.fillStyle='rgba(200,200,120,0.3)';ctx.fillRect(PX+6,PY+PH_BASE,PW-12,1);
    tools.forEach((t,i)=>{
      const ty=PY+PH_BASE+8+i*22;
      const equipped=activeTool===t.id;
      ctx.textAlign='center';
      ctx.font='11px serif';ctx.fillStyle=equipped?'#f0f0a0':'#a0a060';
      ctx.fillText(t.icon+' '+t.nome+(equipped?' ◀':''),midX,ty+10);
      ctx.textAlign='left';
    });
  }

  const hints=['Encontre a Picareta e a Roldana. Busque o Wombat para o Bastão!',
               'Desça pelos shafts com a Roldana. Observe a geologia.',
               'Use o Bastão para detectar bolsões. Picareta para escavar.',
               'Caminhe até o horizonte do songline para concluir.'];
  let hint=hints[levelNum]||'';
  if(levelNum===0){
    const needPicareta=!player.items.includes('picareta_ponta_fina');
    const needRoldana=!player.items.includes('roldana_poco');
    const needBastao=!player.items.includes('bastao_escuta');
    const parts=[];
    if(needPicareta)parts.push('a Picareta');
    if(needRoldana)parts.push('a Roldana');
    hint=parts.length?('Encontre '+parts.join(' e ')+'.'):'';
    if(needBastao)hint+=(hint?' ':'')+'Busque o Wombat para o Bastão!';
    if(!hint)hint='Prossiga pela planície.';
  }
  ctx.fillStyle='rgba(0,0,0,0.60)';ctx.fillRect(0,H-32,W,32);
  ctx.shadowColor='rgba(0,0,0,0.9)';ctx.shadowBlur=6;
  ctx.fillStyle='#f0e8b0';ctx.font='17px "Courier New"';
  ctx.textAlign='center';ctx.fillText(hint,W/2,H-10);
  ctx.textAlign='left';ctx.shadowBlur=0;
}

function drawTitle(){
  drawBg(1,3200,720);
  ctx.fillStyle='rgba(0,0,0,0.45)';ctx.fillRect(0,0,W,H);
  spawnDust(1);tickDust();drawDust();

  ctx.save();
  for(let i=0;i<60;i++){
    const sx=((i*137+11)%W),sy=((i*97+7)%(H*0.5));
    const sa=0.2+Math.abs(Math.sin(Date.now()/1200+i))*0.6;
    ctx.fillStyle=`rgba(255,240,200,${sa})`;
    ctx.beginPath();ctx.arc(sx,sy,0.8+Math.abs(Math.sin(i*0.7))*1.2,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
  ctx.textAlign='center';
  ctx.shadowColor='#c08030';ctx.shadowBlur=40;
  ctx.fillStyle='#f0e8c0';ctx.font='bold 46px "Courier New"';
  ctx.fillText('A Pedra que Guarda o Arco-Íris',W/2,148);
  ctx.shadowBlur=0;
  ctx.fillStyle='#f0b840';ctx.font='19px "Courier New"';
  ctx.fillText('Fase 6.1  —  Opala Negra de Lightning Ridge, Austrália',W/2,200);

  // FIX: o card da fase (IMG['card61'], já carregado) nunca era desenhado
  // na capa — só o item procedural (drawOpalaItem) aparecia. Padronizado
  // com o mesmo layout de card+glow+borda usado nas demais fases.
  if(IMG.card61){
    const cardSize=160,cardX=W/2-80,cardY=230;
    const glow=ctx.createRadialGradient(W/2,cardY+80,0,W/2,cardY+80,130);
    glow.addColorStop(0,'rgba(200,140,40,0.25)'); glow.addColorStop(1,'rgba(200,140,40,0)');
    ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(W/2,cardY+80,130,0,Math.PI*2); ctx.fill();
    ctx.shadowColor='rgba(0,0,0,0.7)';ctx.shadowBlur=18;
    ctx.drawImage(IMG.card61,cardX,cardY,cardSize,cardSize);
    ctx.shadowBlur=0;
    ctx.strokeStyle='rgba(240,184,64,0.55)';ctx.lineWidth=2;ctx.strokeRect(cardX,cardY,cardSize,cardSize);
  } else {
    ctx.save();ctx.translate(W/2,310);
    drawOpalaItem(0,0,Date.now()/800,'red');
    ctx.restore();
  }
  ctx.fillStyle=`rgba(210,180,100,${.55+Math.sin(Date.now()/550)*.4})`;
  ctx.font='19px "Courier New"';
  ctx.fillText('▶  Pressione ENTER para começar  ◀',W/2,454);
  ctx.fillStyle='#c0b890';ctx.font='18px "Courier New"';
  ctx.fillText('← → Mover   |   ↑ Espaço Pular   |   E Interagir   |   I Diário de Bordo',W/2,500);
  ctx.fillText('[M] Menu Principal',W/2,538);
  ctx.textAlign='left';
}

function drawDeath(player){
  ctx.fillStyle='rgba(0,0,0,0.78)';ctx.fillRect(0,0,W,H);
  const cause=player?player.deathCause||'queda':'queda';
  const msgs={queda:'CORVAN CAIU!',espinho:'QUE ESPINHO!',abismo:'O SHAFT É FUNDO DEMAIS!'};
  const subs={queda:'Uma queda fatal no outback de Lightning Ridge!',espinho:'Cuidado com as pedras cortantes da argila!',abismo:'Os shafts de Lightning Ridge têm 20 metros — a queda foi fatal!'};
  const msg=msgs[cause]||'CORVAN CAIU!';
  const sub=subs[cause]||'Uma queda fatal.';
  ctx.textAlign='center';ctx.shadowColor='#ff4040';ctx.shadowBlur=30;
  ctx.fillStyle='#ff6060';ctx.font='bold 54px "Courier New"';ctx.fillText(msg,W/2,H/2-50);
  ctx.shadowBlur=0;
  ctx.fillStyle='#cc8888';ctx.font='16px "Courier New"';ctx.fillText(sub,W/2,H/2-10);
  ctx.fillStyle='#e0b840';ctx.font='20px "Courier New"';
  ctx.fillText('Pressione  R  para recomeçar',W/2,H/2+50);
  ctx.fillText(`Mortes: ${G.deaths||1}`,W/2,H/2+78);
  ctx.fillStyle='#888';ctx.font='15px "Courier New"';ctx.fillText('[M] Menu Principal',W/2,H/2+110);
  ctx.textAlign='left';
}

function drawComplete(player){
  const g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#6010a0');g.addColorStop(0.4,'#c04808');g.addColorStop(0.8,'#e08018');g.addColorStop(1,'#c05010');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);

  ctx.save();ctx.globalAlpha=0.18;
  const t=Date.now()/800;
  for(let i=0;i<8;i++){
    ctx.strokeStyle=`hsl(${i*45},80%,60%)`;ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(0,(H/8*i)+Math.sin(t+i)*20);
    for(let x=0;x<W;x+=40){ctx.lineTo(x,H/8*i+Math.sin(t+i+x/80)*30);}
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  for(let i=0;i<50;i++){
    const sx=((i*137+11)%W),sy=((i*97+7)%(H*0.5));
    const sa=0.3+Math.abs(Math.sin(Date.now()/1000+i))*0.6;
    ctx.fillStyle=`rgba(255,240,200,${sa})`;
    ctx.beginPath();ctx.arc(sx,sy,1+Math.abs(Math.sin(i))*1.2,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
  ctx.textAlign='center';
  ctx.shadowColor='#e0a030';ctx.shadowBlur=40;
  ctx.fillStyle='#f0d040';ctx.font='bold 42px "Courier New"';
  ctx.fillText('✦  FASE 6.1 CONCLUÍDA  ✦',W/2,118);
  ctx.shadowBlur=0;
  drawCorvan(W/2-40,140,3,false,Date.now()/300,'bastao_escuta');
  ctx.fillStyle='#e8d8a0';ctx.font='17px "Courier New"';
  ctx.fillText('Os olhos da terra revelaram seus segredos!',W/2,340);
  const opalas=player?player.items.filter(id=>id.startsWith('opala_')).length:0;
  const hasBastao=player&&player.items.includes('bastao_escuta');
  const lines=[
    `✦  Picareta de Ponta Fina — não fragmenta a opala`,
    `✦  Roldana de Poço — acesso aos shafts artesanais`,
    `✦  Bastão de Escuta — sabedoria Yuwaalaraay`,
    `✦  Opalas negras coletadas: ${opalas}/3`,
    `✦  Churinga — devolvida ao lugar. Não é nossa para levar.`,
  ];
  ctx.fillStyle='#c8b860';ctx.font='14px "Courier New"';
  lines.forEach((l,i)=>ctx.fillText(l,W/2,400+i*32));
  const _scoreY=400+lines.length*32+40;
  ctx.fillStyle='#c0b880';ctx.font='16px "Courier New"';
  ctx.fillText(`Pontuação: ◈ ${G.player?.score||0}   Mortes: ${G.deaths}`,W/2,_scoreY);
  ctx.fillStyle='#c8b860';ctx.font='14px "Courier New"';
  ctx.fillText(`🔴 Opalas coletadas: ${opalas}/3`,W/2,_scoreY+22);
  const pulse=0.65+Math.sin(Date.now()/550)*0.4;
  ctx.fillStyle=`rgba(220,190,100,${pulse})`;ctx.font='15px "Courier New"';
  ctx.fillText('✦ Fase 6.2 desbloqueada!   [M] Menu Principal',W/2,_scoreY+35+22);
  ctx.textAlign='left';
}

function buildL1(){

  const LW=3200,LH=720;
  const GROUND=560;
  const plats=[];
  plats.push({x:0,y:GROUND,w:LW,h:160,type:'ground'});

  for(let i=0;i<8;i++){
    const cx=400+i*330;
    plats.push({x:cx,y:GROUND-70,w:80,h:70,type:'plat'});
    plats.push({x:cx-40,y:GROUND-40,w:40,h:40,type:'plat'});
    plats.push({x:cx+80,y:GROUND-40,w:40,h:40,type:'plat'});
  }

  plats.push({x:300,y:GROUND-50,w:80,h:20,type:'plat'});
  plats.push({x:700,y:GROUND-80,w:60,h:20,type:'plat'});
  plats.push({x:1100,y:GROUND-60,w:80,h:20,type:'plat'});
  plats.push({x:1500,y:GROUND-90,w:60,h:20,type:'plat'});
  plats.push({x:1900,y:GROUND-70,w:80,h:20,type:'plat'});
  plats.push({x:2400,y:GROUND-80,w:60,h:20,type:'plat'});
  plats.push({x:2800,y:GROUND-60,w:100,h:20,type:'plat'});

  const cols=[
    new Col(260,GROUND-70,'picareta_ponta_fina'),
    new Col(1650,GROUND-70,'roldana_poco'),
  ];

  const wombat={x:2750,y:GROUND-74,gifted:false};
  const triggers=[];
  triggers.push(new Trigger(LW-60,GROUND-120,60,120,'Descer pelo Shaft',()=>{G.loadLevel(2);}));
  return {num:1,W:LW,H:LH,startX:80,startY:GROUND-68,plats,cols,triggers,wombat,_startDone:false};
}

function buildL2(){

  const LW=2400,LH=860;
  const FLOOR=700;
  const plats=[];
  plats.push({x:0,y:FLOOR,w:LW,h:160,type:'ground'});

  plats.push({x:100,y:FLOOR-100,w:100,h:20,type:'plat'});
  plats.push({x:300,y:FLOOR-180,w:80,h:20,type:'plat'});
  plats.push({x:500,y:FLOOR-130,w:100,h:20,type:'plat'});
  plats.push({x:700,y:FLOOR-200,w:80,h:20,type:'plat'});
  plats.push({x:900,y:FLOOR-140,w:100,h:20,type:'plat'});
  plats.push({x:1100,y:FLOOR-100,w:80,h:20,type:'plat'});
  plats.push({x:1300,y:FLOOR-180,w:100,h:20,type:'plat'});
  plats.push({x:1500,y:FLOOR-120,w:80,h:20,type:'plat'});
  plats.push({x:1800,y:FLOOR-160,w:100,h:20,type:'plat'});
  plats.push({x:2000,y:FLOOR-100,w:100,h:20,type:'plat'});
  plats.push({x:2200,y:FLOOR-80,w:100,h:20,type:'plat'});

  const geologyPlats=[
    {x:400,y:FLOOR-250,w:60,h:8,type:'plat'},
    {x:800,y:FLOOR-230,w:80,h:8,type:'plat'},
    {x:1200,y:FLOOR-220,w:60,h:8,type:'plat'},
    {x:1600,y:FLOOR-240,w:80,h:8,type:'plat'},
  ];
  for(const gp of geologyPlats)plats.push(gp);
  const triggers=[];
  triggers.push(new Trigger(LW-60,FLOOR-120,60,120,'Câmara de Opalas',()=>{G.loadLevel(3);}));
  const cols=[];
  return {num:2,W:LW,H:LH,startX:80,startY:FLOOR-68,plats,cols,triggers};
}

function buildL3(){

  const LW=2000,LH=720;
  const FLOOR=560;
  const plats=[];
  plats.push({x:0,y:FLOOR,w:LW,h:160,type:'ground'});
  plats.push({x:200,y:FLOOR-90,w:80,h:20,type:'plat'});
  plats.push({x:500,y:FLOOR-70,w:80,h:20,type:'plat'});
  plats.push({x:800,y:FLOOR-90,w:80,h:20,type:'plat'});
  plats.push({x:1100,y:FLOOR-70,w:80,h:20,type:'plat'});
  plats.push({x:1500,y:FLOOR-90,w:80,h:20,type:'plat'});
  plats.push({x:1750,y:FLOOR-70,w:80,h:20,type:'plat'});

  const opalFields=[
    new OpalField(300,FLOOR-58,'opala_vermelha'),
    new OpalField(780,FLOOR-58,'opala_azul'),
    new OpalField(1380,FLOOR-58,'opala_verde'),
  ];

  const churingaObj={x:1750,y:FLOOR-40,done:false};
  const triggers=[];
  triggers.push(new Trigger(LW-60,FLOOR-120,60,120,'Subir — Pôr do Sol',()=>{G.loadLevel(4);}));
  const cols=[];
  return {num:3,W:LW,H:LH,startX:80,startY:FLOOR-68,plats,cols,triggers,opalFields,churingaObj};
}

function buildL4(){

  const LW=2400,LH=720;
  const FLOOR=560;
  const plats=[];
  plats.push({x:0,y:FLOOR,w:LW,h:160,type:'ground'});
  plats.push({x:200,y:FLOOR-60,w:100,h:60,type:'plat'});
  plats.push({x:500,y:FLOOR-70,w:80,h:20,type:'plat'});
  plats.push({x:800,y:FLOOR-60,w:100,h:20,type:'plat'});
  plats.push({x:1200,y:FLOOR-80,w:80,h:20,type:'plat'});
  plats.push({x:1600,y:FLOOR-60,w:100,h:20,type:'plat'});
  plats.push({x:1900,y:FLOOR-50,w:140,h:50,type:'plat'});
  const triggers=[];
  triggers.push(new Trigger(LW-120,FLOOR-160,120,160,'Completar a Fase',(player,level)=>{
    if(!player.items.includes('opala_vermelha')){notify('Ainda falta a Opala Negra de play vermelho — volte ao Campo de Opalas!');return;}
    if(!player.items.includes('opala_azul')){notify('Ainda falta a Opala Negra de play azul — volte ao Campo de Opalas!');return;}
    if(!player.items.includes('opala_verde')){notify('Ainda falta a Opala Negra de play verde — volte ao Campo de Opalas!');return;}
    if(!player.churingaDevolvida){notify('A Churinga ainda precisa ser devolvida ao seu lugar antes de partir!');return;}
    G.state='complete';
  }));
  const cols=[];
  return {num:4,W:LW,H:LH,startX:80,startY:FLOOR-68,plats,cols,triggers};
}

let _bgMusicActive=false,_bgMusicTimeout=null,_bgMusicGain=null;
const _NOTES_AUS=[55,82.4,110,138.6,164.8,220,246.9,329.6];
function startBgMusic(){
  if(_bgMusicActive||!AC)return;
  _bgMusicActive=true;
  if(AC.state==='suspended')AC.resume();
  _bgMusicGain=AC.createGain();_bgMusicGain.gain.value=0.04;_bgMusicGain.connect(AC.destination);

  const drone=AC.createOscillator();
  const droneG=AC.createGain();
  drone.type='sawtooth';drone.frequency.value=55;
  droneG.gain.value=0.03;
  drone.connect(droneG);droneG.connect(_bgMusicGain);
  drone.start();
  function _nota(freq,start,dur,vol=0.05){
    const o=AC.createOscillator(),g=AC.createGain();
    o.type='triangle';o.frequency.value=freq;
    g.gain.setValueAtTime(0,start);g.gain.linearRampToValueAtTime(vol,start+0.08);
    g.gain.setValueAtTime(vol,start+dur-0.15);g.gain.linearRampToValueAtTime(0,start+dur);
    o.connect(g);g.connect(_bgMusicGain);o.start(start);o.stop(start+dur+0.1);
  }

  const SEQ=[0,0,2,4,2,0,4,6,4,2,0,2,4,2,0,0];
  const RHYTHM=[0.8,0.4,0.8,0.8,0.4,0.8,0.8,0.4,0.8,0.8,0.4,0.4,0.8,0.8,0.4,1.2];
  function _ciclo(){
    if(!_bgMusicActive)return;
    const t=AC.currentTime+0.1;let offset=0;
    SEQ.forEach((idx,i)=>{_nota(_NOTES_AUS[idx%_NOTES_AUS.length],t+offset,RHYTHM[i]*0.85);offset+=RHYTHM[i];});
    _bgMusicTimeout=setTimeout(_ciclo,(offset-0.3)*1000);
  }
  _ciclo();
}
function stopBgMusic(){
  _bgMusicActive=false;clearTimeout(_bgMusicTimeout);
  if(_bgMusicGain&&AC){_bgMusicGain.gain.linearRampToValueAtTime(0,AC.currentTime+0.5);_bgMusicGain=null;}
}
let _prevBgState='';

const G={
  state:'title',
  level:1,
  player:null,
  currentLevel:null,
  dialog:false,
  lightMode:null,
  sonarTimer:0,
  sonarData:null,
  deaths:0,

  loadLevel(n){
    this.level=n;
    this.lightMode=null;this.dialog=false;this.sonarTimer=0;this.sonarData=null;
    const prev=this.player;
    const prevItems=prev?[...prev.items]:[];
    const prevScore=prev?prev.score:0;
    const prevTools=prev?new Set(prev.activeTools):new Set();
    const prevChuringaDevolvida=prev?!!prev.churingaDevolvida:false;

    if(n===1)this.currentLevel=buildL1();
    else if(n===2)this.currentLevel=buildL2();
    else if(n===3)this.currentLevel=buildL3();
    else if(n===4)this.currentLevel=buildL4();

    const lv=this.currentLevel;
    this.player=new Player(lv.startX||80,lv.startY||(lv.H-200));
    this.player.items=prevItems;
    this.player.score=prevScore;
    this.player.activeTools=prevTools;
    this.player.opalaCount=prevItems.filter(id=>id.startsWith('opala_')).length;
    this.player.churingaDevolvida=prevChuringaDevolvida;
    if(this.player.items.includes('picareta_ponta_fina'))this.player.activeTools.add('picareta_ponta_fina');
    if(this.player.items.includes('bastao_escuta'))this.player.activeTools.add('bastao_escuta');
    if(lv.cols){for(const c of lv.cols){if(this.player.items.includes(c.type))c.done=true;}}

    cam.x=0;cam.y=0;cam.W=W;cam.H=H;cam.LW=lv.W;cam.LH=lv.H;
    particles.length=0;dustPts.length=0;
    this.state='playing';

    if(n===1){
      setTimeout(()=>showDialog([
        '"Lightning Ridge, Austrália. Para os povos Yuwaalaraay, a opala nasceu quando o Criador desceu à Terra numa bola de fogo — e onde tocou o chão, as pedras começaram a brilhar com todas as cores do arco-íris."',
        '"Cada opala negra é única. Não existem duas iguais no mundo. Preciso encontrar a Picareta de Ponta Fina e a Roldana de Poço — e encontrar o Wombat. Ele conhece os vazios da terra melhor do que qualquer instrumento."',
      ],null),600);
    } else if(n===2){
      setTimeout(()=>showDialog([
        '"Dentro do shaft vertical. A luz do sol acima vai se tornando um círculo cada vez menor. Há 110 milhões de anos, esta região era um mar interior. Quando o mar recuou, a sílica dissolvida preencheu as cavidades e gelificou em opala."',
        '"Cada bolsão de opala está onde havia um fóssil marinho, um galho, uma concha. Quando você encontra uma opala, está segurando o fantasma de algo que viveu quando os dinossauros ainda dominavam a Terra."',
      ],null),500);
    } else if(n===3){
      setTimeout(()=>showDialog([
        '"Campo de Opalas — câmaras de argila branca. Uso o Bastão de Escuta: pressiono ao chão e ponho o ouvido na extremidade superior. Solo maciço: zumbido abafado. Bolsão oco onde opala se formou: bong ressonante e claro."',
        '"Depois de detectar um bolsão, escavo com a Picareta de Ponta Fina. Para cada pedra: giro lentamente sob a lanterna. Opala preciosa acende em cores que mudam com o ângulo. Potch não muda — fica branco. A pressa é a maior inimiga da opala."',
      ],null),500);
    } else if(n===4){
      setTimeout(()=>showDialog([
        '"Na superfície ao pôr do sol. O céu do outback explode em laranja, roxo e vermelho — as mesmas cores da opala no bolso. Os Yuwaalaraay chamam este lugar de songline: uma linha de energia que atravessa o solo, conectando tudo que existe e existiu."',
        '"Guardo as opalas — sou seu guardião. Mas a Churinga que encontrei precisou voltar. Há coisas que o guardião não guarda: ele apenas se certifica de que estão seguras e no lugar certo."',
      ],()=>{notify('✦ Caminhe até o horizonte do songline para concluir.');},),500);
    }
  },

  restart(){
    wrongLightTests=0;
    popup.active=false;notifAlpha=0;
    BUBBLE.active=false;BUBBLE.queue=[];BUBBLE.cb=null;
    INV.open=false;INV.cursor=0;INV.tab=0;
    this.lightMode=null;this.sonarTimer=0;this.sonarData=null;
    this.loadLevel(1);
  },

  advance(){
    unlockPhase('6.2');
    try{sessionStorage.setItem('mineralis_session','1');}catch(e){}
    window.location.href='../../MenuPrincipal/index.html?unlocked=6.2';
  },
};

function startGame(){
  G.state='title';cam.x=0;cam.y=0;loop();
}

function loop(){
  requestAnimationFrame(loop);
  if(G.state!==_prevBgState){
    if(G.state==='playing'&&_prevBgState!=='playing')startBgMusic();
    if((G.state==='dead'||G.state==='complete')&&_prevBgState==='playing')stopBgMusic();
    _prevBgState=G.state;
  }
  const {dx,dy}=getShake();
  ctx.save();ctx.translate(dx,dy);
  ctx.clearRect(-10,-10,W+20,H+20);

  if(G.state==='title'){
    drawTitle();ctx.restore();
    if(jp['Enter']||jp['Space']){
      clearJP();
      G.loadLevel(1);
    }
    clearJP();return;
  }

  const lv=G.currentLevel;

  if(G.state==='dead'){
    if(lv){tileTheme=TILE_THEMES[lv.num]||TILE_THEMES[1];drawBg(lv.num,lv.W,lv.H);}
    else{ctx.fillStyle='#0e0a06';ctx.fillRect(0,0,W,H);}
    drawDeath(G.player);ctx.restore();
    if(jp['KeyR']||jp['Enter']||jp['KeyE']){G.deaths=(G.deaths||0)+1;G.restart();}
    clearJP();return;
  }

  if(G.state==='complete'){
    drawBg(4,2400,720);spawnDust(4);tickDust();drawDust();
    drawComplete(G.player);ctx.restore();
    if(jp['Enter']||jp['KeyE']){G.advance();}
    clearJP();return;
  }

  if(!lv){clearJP();ctx.restore();return;}
  const player=G.player;

  tileTheme=TILE_THEMES[lv.num]||TILE_THEMES[1];
  drawBg(lv.num,lv.W,lv.H);
  spawnDust(lv.num);tickDust();
  cam.track(player,lv.W,lv.H);

  if(lv.opalFields){for(const f of lv.opalFields)f.tick();}
  if(lv.cols){for(const c of lv.cols)c.tick();}

  for(const p of lv.plats){
    if(p.type==='_dead'||p.type==='spike')continue;
    drawPlatform(p);
  }
  drawDust();

  if(lv.opalFields){for(const f of lv.opalFields)f.draw();}

  if(lv.churingaObj&&!lv.churingaObj.done){
    const co=lv.churingaObj;
    ctx.save();ctx.translate(co.x-cam.x,co.y-cam.y);
    drawChuringaItem(0,0,Date.now()/800);
    ctx.restore();
    if(player&&Math.hypot(player.x+13-co.x,player.y+40-co.y)<90){
      const ha=0.5+Math.sin(Date.now()/400)*0.5;
      ctx.font='bold 13px "Courier New"';
      const txt='[E] Examinar Churinga';const tw=ctx.measureText(txt).width+20;
      const headY=player.y-cam.y-8;
      const bx=co.x-cam.x-tw/2,by=Math.min(co.y-cam.y-50,headY-24);
      ctx.fillStyle=`rgba(6,4,10,${0.88*ha})`;roundRect(bx,by,tw,24,5);ctx.fill();
      ctx.strokeStyle=`rgba(200,160,80,${ha})`;ctx.lineWidth=1.5;roundRect(bx,by,tw,24,5);ctx.stroke();
      ctx.fillStyle=`rgba(200,160,80,${ha})`;
      ctx.textAlign='center';ctx.fillText(txt,co.x-cam.x,by+16);ctx.textAlign='left';
    }
  }

  if(lv.cols){for(const c of lv.cols)c.draw(player?player.x:0,player?player.y:0);}

  if(lv.wombat){
    const m=lv.wombat;
    const mx=m.x-cam.x,my=m.y-cam.y;
    const frame=Date.now()/600;
    if(!m.gifted){
      ctx.save();
      const gl=ctx.createRadialGradient(mx,my,4,mx,my,55);
      gl.addColorStop(0,'rgba(200,160,80,0.22)');gl.addColorStop(1,'rgba(200,160,80,0)');
      ctx.fillStyle=gl;ctx.beginPath();ctx.arc(mx,my,55,0,Math.PI*2);ctx.fill();
      ctx.restore();
    }
    drawWombat(mx,my,frame);
    if(!m.gifted){
      if(player&&Math.abs(player.x+13-m.x)<150){
        const ha=0.7+Math.sin(Date.now()/350)*0.3;
        ctx.font='bold 13px "Courier New"';
        const txt='[E] Cumprimentar Wombat';
        const tw=ctx.measureText(txt).width+20;
        const headY=player.y-cam.y-8;
        const bx=mx-tw/2,by=Math.min(my-75,headY-24);
        ctx.fillStyle=`rgba(6,4,10,${0.88*ha})`;roundRect(bx,by,tw,24,5);ctx.fill();
        ctx.strokeStyle=`rgba(200,160,80,${ha})`;ctx.lineWidth=1.5;roundRect(bx,by,tw,24,5);ctx.stroke();
        ctx.fillStyle=`rgba(200,160,80,${ha})`;
        ctx.textAlign='center';ctx.fillText(txt,mx,by+16);ctx.textAlign='left';
      }
    }
  }

  if(lv.triggers){for(const t of lv.triggers)t.draw(player.x,player.y);}

  tickParticles();drawParticles();
  if(player){player.update(lv);player.draw();}

  if(G.sonarTimer>0){
    G.sonarTimer--;
    if(G.sonarData)drawSonarOverlay(G.sonarData);
    if(G.sonarTimer<=0)G.sonarData=null;
  }

  BUBBLE.draw(player||{x:W/2,y:H/2,w:26,h:68});
  drawLightOverlay(G.lightMode);
  INV.draw(player||{items:[],activeTools:new Set()});
  drawHUD(player,lv);
  tickPopup();drawPopup();
  tickNotif();drawNotif();
  checkDlg();

  if(player&&player.dead)G.state='dead';
  clearJP();
  ctx.restore();
}

if(!gameReady){(function loadLoop(){
  if(gameReady)return;
  requestAnimationFrame(loadLoop);
  ctx.fillStyle='#080604';ctx.fillRect(0,0,W,H);
  const t=Date.now()/600;
  const cg=ctx.createRadialGradient(W/2,H/2,20,W/2,H/2,300);
  cg.addColorStop(0,'rgba(200,140,40,0.15)');cg.addColorStop(1,'rgba(200,140,40,0)');
  ctx.fillStyle=cg;ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#e0c850';ctx.font='bold 24px "Courier New"';ctx.textAlign='center';
  ctx.fillText(`Carregando${'.'.repeat(Math.floor(Date.now()/400)%4)}  ${assetsLoaded}/${totalAssets}`,W/2,H/2);
  ctx.save();ctx.translate(W/2,H/2+80);ctx.scale(2.5,2.5);
  drawOpalaItem(0,0,t,'red');
  ctx.restore();
  ctx.textAlign='left';
})();}