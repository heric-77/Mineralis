const SAVE_KEY='mineralis_save_v4';
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
  if(type==='jump')      {o.frequency.setValueAtTime(220,t);o.frequency.exponentialRampToValueAtTime(440,t+.14);g.gain.setValueAtTime(.13,t);g.gain.exponentialRampToValueAtTime(.001,t+.16);}
  else if(type==='picareta'){o.type='sawtooth';o.frequency.setValueAtTime(160,t);o.frequency.exponentialRampToValueAtTime(60,t+.3);g.gain.setValueAtTime(.2,t);g.gain.exponentialRampToValueAtTime(.001,t+.35);}
  else if(type==='diamante'){o.type='sine';o.frequency.setValueAtTime(2000,t);o.frequency.exponentialRampToValueAtTime(2800,t+.06);g.gain.setValueAtTime(.15,t);g.gain.exponentialRampToValueAtTime(.001,t+.5);}
  else if(type==='quartzo'){o.type='triangle';o.frequency.setValueAtTime(450,t);o.frequency.exponentialRampToValueAtTime(220,t+.25);g.gain.setValueAtTime(.1,t);g.gain.exponentialRampToValueAtTime(.001,t+.28);}
  else if(type==='lupa')  {o.type='sine';o.frequency.setValueAtTime(700,t);o.frequency.setValueAtTime(950,t+.07);g.gain.setValueAtTime(.1,t);g.gain.exponentialRampToValueAtTime(.001,t+.38);}
  else if(type==='meerkat'){o.type='triangle';o.frequency.setValueAtTime(1000,t);o.frequency.setValueAtTime(1300,t+.05);o.frequency.setValueAtTime(950,t+.1);g.gain.setValueAtTime(.09,t);g.gain.exponentialRampToValueAtTime(.001,t+.3);}
  else if(type==='peneira'){o.type='triangle';o.frequency.setValueAtTime(320,t);o.frequency.setValueAtTime(240,t+.12);o.frequency.setValueAtTime(380,t+.22);g.gain.setValueAtTime(.1,t);g.gain.exponentialRampToValueAtTime(.001,t+.4);}
  else if(type==='item')  {o.frequency.setValueAtTime(440,t);o.frequency.setValueAtTime(660,t+.1);o.frequency.setValueAtTime(880,t+.2);g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.001,t+.3);}
  else if(type==='unlock'){o.frequency.setValueAtTime(330,t);o.frequency.setValueAtTime(440,t+.15);o.frequency.setValueAtTime(660,t+.3);g.gain.setValueAtTime(.13,t);g.gain.exponentialRampToValueAtTime(.001,t+.5);}
  else if(type==='hit')   {o.type='sawtooth';o.frequency.setValueAtTime(200,t);o.frequency.exponentialRampToValueAtTime(60,t+.2);g.gain.setValueAtTime(.18,t);g.gain.exponentialRampToValueAtTime(.001,t+.22);}
  else if(type==='colapso'){o.type='sawtooth';o.frequency.setValueAtTime(120,t);o.frequency.exponentialRampToValueAtTime(40,t+.4);g.gain.setValueAtTime(.2,t);g.gain.exponentialRampToValueAtTime(.001,t+.5);}
  o.start(t);o.stop(t+.7);
}

const IMG={};
let assetsLoaded=0,gameReady=false;
const ASSET_LIST=[
  ['bg01','Assets/cena1_borda_big_hole.svg'],
  ['bg02','Assets/cena2_kimberlito_geologico.svg'],
  ['bg03','Assets/cena3_peneiramento.svg'],
  ['bg04','Assets/cena4_entardecer_compound.svg'],
  ['ipicareta','Assets/item_picareta.svg'],
  ['ipeneira','Assets/item_peneira.svg'],
  ['ilupa','Assets/item_lupa.svg'],
  ['icontrato','Assets/item_contrato.svg'],
  ['isuricato','Assets/item_suricato.svg'],
  ['card41','Assets/4_1_kimberley.svg'],
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
  if((e.code==='KeyI'||e.code==='Tab')&&G.state==='playing'){e.preventDefault();if(G.player)INV.toggle(G.player);}
  if(e.code==='Escape'&&INV.open){INV.close();}
  if(e.code==='Escape'&&G.sieveMode){G.sieveMode=null;G.dialog=false;}
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
  picareta_kimberlito:{
    cat:'ferramenta',nome:'Picareta de Kimberlito',icon:'⛏️',
    journalId:'picareta_kimberlito',drawHand:'left',
    desc:'Picareta de cabo longo para trabalho em parede vertical.\nCabo de madeira reforçado, 1,2m — mais pesada que a comum.\nO kimberlito é rocha vulcânica densa; exige impacto forte.',
  },
  peneira_classificacao:{
    cat:'ferramenta',nome:'Peneira de Classificação',icon:'🪣',
    journalId:'peneira_classificacao',drawHand:'right',
    desc:'Malha de aço com furos calibrados para separar por tamanho.\nFragmentos menores que a malha caem — cristais maiores ficam.\nPrimeiro estágio de separação antes da Lupa de Lapidário.',
  },
  lupa_lapidario:{
    cat:'ferramenta',nome:'Lupa de Lapidário (10x)',icon:'🔍',
    journalId:'lupa_lapidario',drawHand:'right',
    desc:'Lupa de 10 aumentos usada por lapidários e gemologistas.\nDiamante: faces cristalinas com ângulos de 120° (estrutura cúbica).\nQuartzo: faces hexagonais de 60°. A diferença salva fortuna!',
  },
  diamante_pequeno:{
    cat:'minerio',nome:'Diamante Bruto (Pequeno)',icon:'💎',
    journalId:'diamante_pequeno',
    desc:'Cristal octoédrico de carbono puro — Mohs 10, mais duro do mundo.\nFormado a 1.200°C e 50.000 atm, a 150 km de profundidade.\nMais antigo que os dinossauros: 1 a 3 bilhões de anos.',
  },
  diamante_medio:{
    cat:'minerio',nome:'Diamante Bruto (Médio)',icon:'💎',
    journalId:'diamante_medio',
    desc:'Diamante de tamanho mediano — visível a olho nu após peneiramento.\nCaras cristalinas limpas revelam a geometria do carbono.\nO kimberlito azulado é sua embalagem vulcânica natural.',
  },
  diamante_grande:{
    cat:'minerio',nome:'Diamante Bruto (Grande — Sorte!)',icon:'💎',
    journalId:'diamante_grande',
    desc:'Diamante de "sorte" — maior que os comuns, excepcional.\nNo século XIX, um cristal deste tamanho mudava a vida do garimpeiro.\nMas a De Beers ficava com o lucro real: apenas 5% ficava em Kimberley.',
  },
  quartzo_hialino:{
    cat:'minerio',nome:'Quartzo Hialino (Imitador)',icon:'⬜',
    journalId:'quartzo_hialino',
    desc:'SiO₂ transparente — silicato, não carbono como o diamante.\nFrequente nas escavações de kimberlito: imitador visual perigoso.\nFaces hexagonais de 60° (vs 120° do diamante). A Lupa revela tudo!',
  },
  contrato_trabalho:{
    cat:'artefato',nome:'Contrato de Trabalho Migratório',icon:'📜',
    journalId:'contrato_trabalho',
    desc:'Contrato De Beers para trabalhador africano no compound.\nConfinamento de 3-6 meses sem direito de sair ou possuir diamantes.\nAssinado com impressão digital — a maioria não sabia ler.\nPrecursor do apartheid formal declarado em 1948.',
  },
};

const INV={
  open:false,tab:0,cursor:0,
  TABS:[
    {id:'ferramenta',label:'⛏️ Ferramentas',color:'#e8c850'},
    {id:'minerio',   label:'💎 Minérios',   color:'#90d8ff'},
    {id:'artefato',  label:'📜 Artefatos',  color:'#d4a8c0'},
  ],
  tabItems(player){
    const cat=this.TABS[this.tab].id;
    let saved={};
    try{const s=localStorage.getItem(SAVE_KEY);if(s){const j=JSON.parse(s);saved=j.coletados||{};}}catch(e){}
    return Object.entries(ITEM_DEFS).filter(([id,def])=>{
      if(def.cat!==cat)return false;
      return player.items.includes(id)||saved[def.journalId||id];
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
        const catLabel={ferramenta:'⛏️ Ferramenta',minerio:'💎 Minério',artefato:'📜 Artefato'};
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

const cam={x:0,y:0,W:W,H:H,LW:3200,LH:720,
  track(player,worldW,worldH){
    const tx=Math.max(0,Math.min(player.x-W/2+player.w/2,worldW-W));
    const ty=Math.max(0,Math.min(player.y-H*0.55,worldH-H));
    this.x+=(tx-this.x)*0.12;
    this.y+=(ty-this.y)*0.12;
  }
};
function updateCam(px,worldW){cam.x+=(Math.max(0,Math.min(px-W/2+24,worldW-W))-cam.x)*0.12;}

const GRAV=0.46,PSPD=5.2,JUMPF=-12.0,MAXFALL=16;
const TILE_THEMES={
  1:{top:'#c8602a',body:'#7a3818',dark:'#4a1e08'},
  2:{top:'#4a6870',body:'#283848',dark:'#142028'},
  3:{top:'#405870',body:'#243040',dark:'#101820'},
  4:{top:'#c06830',body:'#703818',dark:'#401808'},
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
    ctx.fillStyle='#7a5030';const nc=Math.max(1,Math.floor(p.w/20));
    for(let i=0;i<nc;i++){const tx=sx+i*(p.w/nc);ctx.beginPath();ctx.moveTo(tx,sy+p.h);ctx.lineTo(tx+p.w/nc/2,sy);ctx.lineTo(tx+p.w/nc,sy+p.h);ctx.fill();}return;
  }
  if(p.type==='_dead')return;
  if(p.type==='trapdoor'){
    const al=p.crumble!==undefined?p.crumble/70:1;ctx.globalAlpha=al;
    ctx.fillStyle='#806040';ctx.fillRect(sx,sy,p.w,p.h);
    ctx.fillStyle='#a07850';ctx.fillRect(sx,sy,p.w,3);ctx.globalAlpha=1;return;
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
  if(p.moving){ctx.fillStyle='rgba(200,180,140,0.35)';ctx.fillRect(sx,sy,p.w,4);}
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
  const showPicareta = activeTool==='picareta_kimberlito';
  const showPeneira  = activeTool==='peneira_classificacao';
  const showLupa     = activeTool==='lupa_lapidario';
  
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
  
  if(showPicareta){
    const wb=Math.sin(frame*0.25)*3;
    ctx.save();ctx.translate(0*S,(22+wb)*S);ctx.rotate(-0.25+wb*0.04);
    
    ctx.fillStyle='#7a4a18';ctx.fillRect(-2*S,-28*S,5*S,36*S);
    ctx.fillStyle='#9a6028';ctx.fillRect(-1*S,-26*S,3*S,32*S);
    
    ctx.fillStyle='#585870';ctx.fillRect(-20*S,-32*S,36*S,11*S);
    ctx.fillStyle='#7878a0';ctx.fillRect(-20*S,-32*S,36*S,5*S);
    
    ctx.fillStyle='#909090';
    ctx.beginPath();ctx.moveTo(-20*S,-28*S);ctx.lineTo(-32*S,-22*S);ctx.lineTo(-20*S,-22*S);ctx.closePath();ctx.fill();
    
    ctx.fillStyle='#a0a0c0';
    ctx.beginPath();ctx.moveTo(16*S,-32*S);ctx.lineTo(30*S,-42*S);ctx.lineTo(18*S,-42*S);ctx.closePath();ctx.fill();
    ctx.restore();
  }
  
  r(24,16,5,12,'#b82010');r(24,28,5,3,'#a86030');
  
  if(showPeneira){
    
    ctx.strokeStyle='#808090';ctx.lineWidth=2.5*S;
    ctx.beginPath();ctx.arc(31*S,26*S,10*S,0,Math.PI*2);ctx.stroke();
    ctx.strokeStyle='rgba(120,130,145,0.55)';ctx.lineWidth=0.8*S;
    for(let i=-8;i<=8;i+=4){
      const hl=Math.sqrt(Math.max(0,100-(i*i)));
      ctx.beginPath();ctx.moveTo((31+i)*S,(26-hl)*S);ctx.lineTo((31+i)*S,(26+hl)*S);ctx.stroke();
    }
    r(28,35,6,5,'#7a4818');
  } else if(showLupa){
    
    r(26,18,4,10,'#5a3010');
    ctx.strokeStyle='#606060';ctx.lineWidth=2.5*S;
    ctx.beginPath();ctx.arc(28*S,14*S,8*S,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle='rgba(180,225,255,0.22)';
    ctx.beginPath();ctx.arc(28*S,14*S,8*S,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.55)';
    ctx.beginPath();ctx.arc(25*S,11*S,2*S,0,Math.PI*2);ctx.fill();
  }
  
  r(9,42,6,4,'#3a1c08');r(17,42,6,4,'#3a1c08');
  r(8,44,8,2,'#2a1008');r(16,44,8,2,'#2a1008');
  ctx.restore();
}

function drawMeerkat(cx,cy,frame=0){
  ctx.save();ctx.translate(cx,cy);
  const bob=Math.sin(frame*0.8)*1.2;

  ctx.fillStyle='#b09060';
  ctx.beginPath();ctx.moveTo(5,-18+bob);ctx.quadraticCurveTo(16,-2+bob,12,10+bob);ctx.lineTo(9,10+bob);ctx.quadraticCurveTo(13,0+bob,2,-16+bob);ctx.closePath();ctx.fill();
  ctx.fillStyle='#2a1808';ctx.beginPath();ctx.arc(11,10+bob,3.5,0,Math.PI*2);ctx.fill();
  
  ctx.fillStyle='#c8a878';ctx.fillRect(-9,-28+bob,18,22);
  
  ctx.fillStyle='#e8d8b0';ctx.fillRect(-6,-24+bob,12,18);
  
  ctx.fillStyle='#9a7040';ctx.fillRect(-9,-26+bob,4,18);ctx.fillRect(5,-26+bob,4,18);
  
  ctx.fillStyle='#c8a878';ctx.beginPath();ctx.arc(0,-38+bob,10,0,Math.PI*2);ctx.fill();
  
  ctx.fillStyle='#2a1808';ctx.fillRect(-8,-43+bob,6,5);ctx.fillRect(2,-43+bob,6,5);
  
  ctx.fillStyle='#1a1008';ctx.beginPath();ctx.arc(-5,-40+bob,2.5,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(5,-40+bob,2.5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.5)';ctx.beginPath();ctx.arc(-4,-41+bob,1,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(6,-41+bob,1,0,Math.PI*2);ctx.fill();
  
  ctx.fillStyle='#8a5028';ctx.fillRect(-3,-35+bob,6,4);
  
  ctx.fillStyle='#b89060';ctx.beginPath();ctx.arc(-11,-44+bob,5,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(11,-44+bob,5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#3a2010';ctx.beginPath();ctx.arc(-11,-47+bob,2.5,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(11,-47+bob,2.5,0,Math.PI*2);ctx.fill();
  
  ctx.fillStyle='#c8a878';
  ctx.fillRect(-15,-26+bob,6,12);ctx.fillRect(9,-26+bob,6,12);
  
  ctx.fillStyle='#a08050';ctx.fillRect(-16,-16+bob,7,4);ctx.fillRect(9,-16+bob,7,4);
  
  ctx.fillStyle='#b09060';ctx.fillRect(-8,-8+bob,6,8);ctx.fillRect(2,-8+bob,6,8);
  
  ctx.fillStyle='#8a6030';ctx.fillRect(-9,0+bob,8,4);ctx.fillRect(1,0+bob,8,4);
  ctx.restore();
}

function drawPicaretaItem(cx,cy,bobT=0){
  ctx.save();ctx.translate(cx,cy+Math.sin(bobT)*5);
  const glow=ctx.createRadialGradient(0,0,0,0,0,26);
  glow.addColorStop(0,'rgba(200,160,100,0.3)');glow.addColorStop(1,'rgba(200,160,100,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,26,0,Math.PI*2);ctx.fill();
  
  ctx.save();ctx.rotate(-0.28);
  ctx.fillStyle='#7a4a18';ctx.fillRect(-3,-30,6,44);
  ctx.fillStyle='#9a6028';ctx.fillRect(-2,-28,4,40);
  ctx.restore();
  
  ctx.save();ctx.rotate(-0.28);
  ctx.fillStyle='#585870';ctx.fillRect(-22,-34,40,12);
  ctx.fillStyle='#8080a0';ctx.fillRect(-22,-34,40,5);
  
  ctx.fillStyle='#909090';ctx.beginPath();ctx.moveTo(-22,-30);ctx.lineTo(-36,-22);ctx.lineTo(-22,-22);ctx.closePath();ctx.fill();
  
  ctx.fillStyle='#a0a0c0';ctx.beginPath();ctx.moveTo(18,-34);ctx.lineTo(32,-46);ctx.lineTo(20,-46);ctx.closePath();ctx.fill();
  ctx.restore();
  const sa=Math.abs(Math.sin(Date.now()/500));
  ctx.strokeStyle=`rgba(200,160,80,${sa*0.7})`;ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(10,-24);ctx.lineTo(14,-32);ctx.stroke();
  ctx.restore();
}

function drawPeneiraItem(cx,cy,bobT=0){
  ctx.save();ctx.translate(cx,cy+Math.sin(bobT)*5);
  const glow=ctx.createRadialGradient(0,0,0,0,0,22);
  glow.addColorStop(0,'rgba(160,190,210,0.3)');glow.addColorStop(1,'rgba(160,190,210,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,22,0,Math.PI*2);ctx.fill();
  
  ctx.strokeStyle='#808090';ctx.lineWidth=4;
  ctx.beginPath();ctx.arc(0,0,15,0,Math.PI*2);ctx.stroke();
  ctx.strokeStyle='#b0b0c0';ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(0,0,15,0,Math.PI*2);ctx.stroke();
  
  ctx.strokeStyle='rgba(140,150,165,0.65)';ctx.lineWidth=1;
  for(let i=-12;i<=12;i+=4){
    const hl=Math.sqrt(Math.max(0,225-i*i));
    ctx.beginPath();ctx.moveTo(i,-hl);ctx.lineTo(i,hl);ctx.stroke();
    ctx.beginPath();ctx.moveTo(-hl,i);ctx.lineTo(hl,i);ctx.stroke();
  }
  
  ctx.fillStyle='#7a4818';ctx.fillRect(-3,13,6,14);
  ctx.fillStyle='#9a6028';ctx.fillRect(-2,14,4,12);
  
  const ta=Math.abs(Math.sin(Date.now()/450));
  ctx.fillStyle=`rgba(200,230,255,${ta*0.8})`;
  ctx.beginPath();ctx.arc(-5,-3,2,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(7,5,1.5,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

function drawLupaItem(cx,cy,bobT=0){
  ctx.save();ctx.translate(cx,cy+Math.sin(bobT)*5);
  const glow=ctx.createRadialGradient(0,-2,0,0,-2,24);
  glow.addColorStop(0,'rgba(200,240,255,0.35)');glow.addColorStop(1,'rgba(200,240,255,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,-2,24,0,Math.PI*2);ctx.fill();
  
  ctx.save();ctx.rotate(0.5);
  ctx.fillStyle='#5a3010';ctx.fillRect(-3,10,6,18);
  ctx.fillStyle='#7a4820';ctx.fillRect(-2,11,4,16);
  ctx.restore();
  
  ctx.strokeStyle='#707070';ctx.lineWidth=3.5;
  ctx.beginPath();ctx.arc(0,-2,13,0,Math.PI*2);ctx.stroke();
  ctx.strokeStyle='#a0a0a0';ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(0,-2,13,0,Math.PI*2);ctx.stroke();
  
  ctx.fillStyle='rgba(180,225,255,0.28)';
  ctx.beginPath();ctx.arc(0,-2,13,0,Math.PI*2);ctx.fill();
  
  ctx.fillStyle='rgba(255,255,255,0.6)';
  ctx.beginPath();ctx.arc(-5,-7,3.5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.3)';
  ctx.beginPath();ctx.arc(-3,-5,2,0,Math.PI*2);ctx.fill();
  
  ctx.fillStyle='rgba(50,90,140,0.75)';ctx.font='bold 8px "Courier New"';
  ctx.textAlign='center';ctx.fillText('10x',0,0);ctx.textAlign='left';
  const sa=Math.abs(Math.sin(Date.now()/500));
  ctx.strokeStyle=`rgba(200,240,255,${sa*0.7})`;ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(9,-14);ctx.lineTo(13,-20);ctx.stroke();
  ctx.restore();
}

function drawDiamanteBruto(cx,cy,bobT=0,size='pequeno'){
  ctx.save();ctx.translate(cx,cy+Math.sin(bobT)*5);
  const scl={pequeno:0.78,medio:1.0,grande:1.28}[size]||1;
  const t=Date.now()/600;
  const glow=ctx.createRadialGradient(0,0,0,0,0,30*scl);
  glow.addColorStop(0,`rgba(180,235,255,${0.4+Math.sin(t)*0.15})`);
  glow.addColorStop(1,'rgba(180,235,255,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,30*scl,0,Math.PI*2);ctx.fill();
  
  ctx.fillStyle='#e8f6ff';
  ctx.beginPath();ctx.moveTo(0,-18*scl);ctx.lineTo(12*scl,-4*scl);ctx.lineTo(0,2*scl);ctx.lineTo(-12*scl,-4*scl);ctx.closePath();ctx.fill();
  ctx.fillStyle='#c0e4ff';
  ctx.beginPath();ctx.moveTo(0,-18*scl);ctx.lineTo(12*scl,-4*scl);ctx.lineTo(10*scl,10*scl);ctx.lineTo(0,4*scl);ctx.closePath();ctx.fill();
  ctx.fillStyle='#a8d4ff';
  ctx.beginPath();ctx.moveTo(0,-18*scl);ctx.lineTo(-12*scl,-4*scl);ctx.lineTo(-10*scl,10*scl);ctx.lineTo(0,4*scl);ctx.closePath();ctx.fill();
  
  ctx.fillStyle='#88b8f0';
  ctx.beginPath();ctx.moveTo(0,18*scl);ctx.lineTo(10*scl,10*scl);ctx.lineTo(12*scl,-4*scl);ctx.lineTo(0,4*scl);ctx.closePath();ctx.fill();
  ctx.fillStyle='#70a0e0';
  ctx.beginPath();ctx.moveTo(0,18*scl);ctx.lineTo(-10*scl,10*scl);ctx.lineTo(-12*scl,-4*scl);ctx.lineTo(0,4*scl);ctx.closePath();ctx.fill();
  
  ctx.fillStyle='#d4eeff';
  ctx.beginPath();ctx.moveTo(-12*scl,-4*scl);ctx.lineTo(12*scl,-4*scl);ctx.lineTo(10*scl,10*scl);ctx.lineTo(-10*scl,10*scl);ctx.closePath();ctx.fill();
  
  const sa=Math.abs(Math.sin(t));
  ctx.fillStyle=`rgba(255,255,255,${sa*0.9})`;
  ctx.beginPath();ctx.arc(-4*scl,-10*scl,2.5*scl,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=`rgba(200,240,255,${sa*0.7})`;ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(7*scl,-14*scl);ctx.lineTo(11*scl,-20*scl);ctx.stroke();
  ctx.restore();
}

function drawQuartzoCristal(cx,cy,bobT=0){
  ctx.save();ctx.translate(cx,cy+Math.sin(bobT)*5);
  const t=Date.now()/600;
  const glow=ctx.createRadialGradient(0,0,0,0,0,22);
  glow.addColorStop(0,`rgba(240,238,220,${0.32+Math.sin(t)*0.1})`);
  glow.addColorStop(1,'rgba(240,238,220,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,22,0,Math.PI*2);ctx.fill();
  
  const h=16,rr=9;
  
  ctx.fillStyle='#e8e4d8';
  ctx.fillRect(-rr,-h,rr*2,h*2);
  ctx.fillStyle='#f0ece2';ctx.fillRect(-rr,-h,6,h*2);
  ctx.fillStyle='#d8d2c4';ctx.fillRect(rr-5,-h,5,h*2);
  
  ctx.fillStyle='#f4f0e4';
  ctx.beginPath();
  ctx.moveTo(-rr,-h);ctx.lineTo(0,-h-9);ctx.lineTo(rr,-h);ctx.closePath();ctx.fill();
  ctx.fillStyle='#e0d8ca';
  ctx.beginPath();ctx.moveTo(0,-h-9);ctx.lineTo(rr,-h);ctx.lineTo(rr,-h+4);ctx.lineTo(0,-h-5);ctx.closePath();ctx.fill();
  
  ctx.strokeStyle='rgba(200,194,175,0.55)';ctx.lineWidth=1;
  for(let i=0;i<4;i++){
    ctx.beginPath();ctx.moveTo(-rr,-h+i*8+4);ctx.lineTo(rr,-h+i*8+4);ctx.stroke();
  }
  
  ctx.fillStyle='#c8c0b0';
  ctx.beginPath();ctx.moveTo(-rr,h);ctx.lineTo(0,h+6);ctx.lineTo(rr,h);ctx.closePath();ctx.fill();
  const sa=Math.abs(Math.sin(t+1));
  ctx.strokeStyle=`rgba(240,232,200,${sa*0.6})`;ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(7,-h-5);ctx.lineTo(11,-h-12);ctx.stroke();
  ctx.restore();
}

function drawContratoItem(cx,cy,bobT=0){
  ctx.save();ctx.translate(cx,cy+Math.sin(bobT)*5);
  const glow=ctx.createRadialGradient(0,0,0,0,0,28);
  glow.addColorStop(0,'rgba(180,140,220,0.45)');glow.addColorStop(1,'rgba(180,140,220,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,28,0,Math.PI*2);ctx.fill();
  
  ctx.fillStyle='#f0e8d0';ctx.fillRect(-14,-20,28,38);
  ctx.fillStyle='#f8f0dc';ctx.fillRect(-14,-20,28,9);
  ctx.fillStyle='#e0d2b4';ctx.fillRect(-14,14,28,4);
  
  ctx.fillStyle='#c0a030';ctx.beginPath();ctx.arc(0,-10,7,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#e0c050';ctx.beginPath();ctx.arc(0,-10,4.5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#2a1408';ctx.font='bold 5px serif';
  ctx.textAlign='center';ctx.fillText('DB',0,-8);ctx.textAlign='left';
  
  ctx.fillStyle='rgba(40,30,20,0.65)';
  for(let i=0;i<3;i++){ctx.fillRect(-11,0+i*5,22,2.5);}
  
  ctx.strokeStyle='rgba(60,40,20,0.55)';ctx.lineWidth=0.9;
  for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(0,17,2+i*1.5,0.2,Math.PI-0.2);ctx.stroke();}
  const sa=Math.abs(Math.sin(Date.now()/500));
  ctx.strokeStyle=`rgba(220,200,80,${sa*0.8})`;ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(10,-18);ctx.lineTo(14,-24);ctx.stroke();
  ctx.restore();
}

function drawCristalAmbiguo(cx,cy,bobT=0){
  ctx.save();ctx.translate(cx,cy+Math.sin(bobT)*4);
  const t=Date.now()/700;
  const a=0.45+Math.sin(t)*0.25;
  ctx.fillStyle=`rgba(215,210,195,${a})`;
  ctx.beginPath();
  ctx.moveTo(0,-14);ctx.lineTo(10,-4);ctx.lineTo(8,8);
  ctx.lineTo(-8,8);ctx.lineTo(-10,-4);ctx.closePath();ctx.fill();
  ctx.strokeStyle=`rgba(240,235,220,${a*0.5})`;ctx.lineWidth=1;ctx.stroke();
  ctx.fillStyle=`rgba(255,255,240,${a*0.45})`;
  ctx.beginPath();ctx.arc(-3,-8,3,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

class KimberliteWall{
  constructor(x,y,diamondType){
    this.x=x;this.y=y;this.w=48;this.h=68;
    this.diamondType=diamondType;
    this.state='intact';
    this.done=false;this.glowT=Math.random()*Math.PI*2;
    
    this.slots=this._makeSlots();
  }
  _makeSlots(){
    const arr=[
      {type:this.diamondType,isDiamond:true,consumed:false},
      {type:'quartzo_hialino',isDiamond:false,consumed:false},
      {type:'quartzo_hialino',isDiamond:false,consumed:false},
    ];
    for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}
    return arr;
  }
  tick(){this.glowT+=0.035;}
  draw(lupaOn){
    if(this.done)return;
    const sx=this.x-cam.x,sy=this.y-cam.y;
    if(sx<-120||sx>W+120)return;
    const a=this.state==='mined'?0.35:(0.5+Math.abs(Math.sin(this.glowT))*0.4);
    
    ctx.fillStyle=this.state==='mined'?`rgba(30,55,70,${a})`:`rgba(50,85,100,${a})`;
    ctx.fillRect(sx,sy,this.w,this.h);
    if(this.state==='intact'){
      
      const crystalPositions=[[12,20],[28,14],[20,38],[8,50],[35,42]];
      crystalPositions.forEach(([rx,ry],i)=>{
        ctx.fillStyle=`rgba(${i%2?'200,230,255':'240,235,215'},${a*0.8})`;
        ctx.beginPath();ctx.moveTo(sx+rx,sy+ry-6);
        ctx.lineTo(sx+rx+5,sy+ry+2);ctx.lineTo(sx+rx,sy+ry+8);
        ctx.lineTo(sx+rx-5,sy+ry+2);ctx.closePath();ctx.fill();
      });
      
      ctx.strokeStyle=`rgba(80,120,140,${a*0.7})`;ctx.lineWidth=1.5;
      for(let i=0;i<3;i++){
        ctx.beginPath();ctx.moveTo(sx,sy+i*22+10);ctx.lineTo(sx+this.w,sy+i*22+10);ctx.stroke();
      }
      
      const cg=ctx.createRadialGradient(sx+24,sy+34,4,sx+24,sy+34,40);
      cg.addColorStop(0,`rgba(120,200,240,${a*0.18})`);cg.addColorStop(1,'rgba(120,200,240,0)');
      ctx.fillStyle=cg;ctx.fillRect(sx-10,sy-10,this.w+20,this.h+20);
    } else {
      
      ctx.strokeStyle='rgba(30,50,65,0.8)';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(sx+8,sy);ctx.lineTo(sx+16,sy+24);ctx.lineTo(sx+10,sy+48);ctx.stroke();
      ctx.beginPath();ctx.moveTo(sx+30,sy+10);ctx.lineTo(sx+22,sy+36);ctx.stroke();
      ctx.fillStyle='rgba(20,40,55,0.6)';ctx.fillRect(sx+10,sy+20,16,12);
    }
    
    const ha=0.5+Math.sin(Date.now()/400)*0.5;
    ctx.fillStyle=`rgba(180,220,240,${ha*0.9})`;ctx.font='bold 11px "Courier New"';
    ctx.textAlign='center';
    if(this.state==='intact'){
      ctx.fillText('[E] Minerar Kimberlito',sx+this.w/2,sy-28);
      ctx.font='10px "Courier New"';ctx.fillStyle=`rgba(140,190,220,${ha*0.7})`;
      ctx.fillText('⛏️ Picareta necessária',sx+this.w/2,sy-14);
    } else {
      ctx.fillText('[E] Peneirar Material',sx+this.w/2,sy-28);
      ctx.font='10px "Courier New"';ctx.fillStyle=`rgba(140,190,220,${ha*0.7})`;
      ctx.fillText('🪣 Peneira necessária',sx+this.w/2,sy-14);
    }
    ctx.textAlign='left';
  }
}

class KimberliteExposition{
  constructor(x,y,type){this.x=x;this.y=y;this.type=type;this.examined=false;this.glowT=0;}
  tick(){this.glowT+=0.03;}
  examine(){if(!this.examined){this.examined=true;sfx('lupa');burst(this.x,this.y-10,'#80d0f0',10,2.5);}}
  draw(){
    const sx=this.x-cam.x,sy=this.y-cam.y;
    if(sx<-100||sx>W+100)return;
    const a=this.examined?0.3:(0.5+Math.abs(Math.sin(this.glowT))*0.4);
    
    ctx.fillStyle=`rgba(60,100,120,${a})`;
    ctx.beginPath();
    ctx.moveTo(sx-22,sy);ctx.lineTo(sx-10,sy-24);ctx.lineTo(sx+4,sy-30);
    ctx.lineTo(sx+20,sy-20);ctx.lineTo(sx+24,sy+6);ctx.lineTo(sx+10,sy+12);
    ctx.lineTo(sx-16,sy+10);ctx.closePath();ctx.fill();
    
    ctx.fillStyle=`rgba(80,140,170,${a*0.7})`;
    ctx.beginPath();ctx.ellipse(sx+2,sy-8,10,14,0.2,0,Math.PI*2);ctx.fill();
    
    ctx.fillStyle=`rgba(200,240,255,${a*0.9})`;
    ctx.beginPath();ctx.arc(sx-5,sy-16,3,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(sx+12,sy-10,2.5,0,Math.PI*2);ctx.fill();
    if(!this.examined){
      const ha=0.5+Math.sin(Date.now()/400)*0.5;
      ctx.fillStyle=`rgba(160,220,240,${ha*0.9})`;ctx.font='bold 12px "Courier New"';
      ctx.textAlign='center';ctx.fillText('[E] Examinar Formação',sx,sy-42);ctx.textAlign='left';
    } else {
      ctx.fillStyle='rgba(140,200,220,0.6)';ctx.font='11px "Courier New"';
      ctx.textAlign='center';ctx.fillText('✔ Examinado',sx,sy-38);ctx.textAlign='left';
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
    const TOOL_TYPES=['picareta_kimberlito','peneira_classificacao','lupa_lapidario'];
    const isTool=TOOL_TYPES.includes(this.type);
    if(isTool){
      const a=0.3+Math.abs(Math.sin(this.t*0.8))*0.5;
      const glow=ctx.createRadialGradient(sx+17,sy+17,4,sx+17,sy+17,32);
      glow.addColorStop(0,`rgba(220,190,130,${a})`);glow.addColorStop(1,'rgba(200,170,110,0)');
      ctx.fillStyle=glow;ctx.fillRect(sx-15,sy-15,64,64);
    }
    ctx.save();ctx.translate(sx+this.w/2,sy+this.h/2);
    if(this.type==='picareta_kimberlito')      drawPicaretaItem(0,0,this.t);
    else if(this.type==='peneira_classificacao')drawPeneiraItem(0,0,this.t);
    else if(this.type==='lupa_lapidario')       drawLupaItem(0,0,this.t);
    else if(this.type==='contrato_trabalho')    drawContratoItem(0,0,this.t);
    ctx.restore();
    if(isTool&&playerX!==undefined){
      const dist=Math.hypot(playerX+20-(this.x+17),playerY+40-(this.y+17));
      if(dist<110){
        const labels={picareta_kimberlito:'⛏️ Picareta de Kimberlito',peneira_classificacao:'🪣 Peneira de Classificação',lupa_lapidario:'🔍 Lupa de Lapidário'};
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
    const activeTool=[...((G.player&&G.player.activeTools)||[])][0]||null;
    drawCorvan(sprX,sprY,faceScale,false,this.faceFrame*4,activeTool);
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
function checkDlg(){if(G.dialog&&!INV.open&&!G.sieveMode&&isE())BUBBLE.advance();}

let popup={active:false,timer:0,title:'',lines:[],color:'#90d8ff'};
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

function drawSieveOverlay(sieve){
  if(!sieve)return;
  ctx.fillStyle='rgba(0,0,0,0.65)';ctx.fillRect(0,0,W,H);
  const pw=660,ph=220,px=(W-pw)/2,py=H/2-ph/2-20;
  ctx.shadowColor='rgba(0,0,0,0.8)';ctx.shadowBlur=20;
  ctx.fillStyle='rgba(6,4,10,0.97)';roundRect(px,py,pw,ph,14);ctx.fill();
  ctx.shadowBlur=0;
  ctx.strokeStyle='#80c0d8';ctx.lineWidth=2.5;roundRect(px,py,pw,ph,14);ctx.stroke();
  ctx.strokeStyle='rgba(120,190,220,0.2)';ctx.lineWidth=1;roundRect(px+4,py+4,pw-8,ph-8,10);ctx.stroke();
  ctx.font='bold 14px "Courier New"';ctx.fillStyle='#a0d8f0';
  ctx.textAlign='center';ctx.fillText('PENEIRA DE CLASSIFICAÇÃO',W/2,py+24);
  ctx.fillStyle='rgba(120,190,220,0.3)';ctx.fillRect(px+16,py+32,pw-32,1);
  const lupaOn=G.player&&G.player.activeTools.has('lupa_lapidario');
  ctx.font='12px "Courier New"';ctx.fillStyle=lupaOn?'#80e0b0':'#f0c860';
  ctx.fillText(lupaOn?'🔍 Lupa equipada — ângulos cristalinos revelados!':'⚠ Equipe a Lupa de Lapidário para identificar corretamente',W/2,py+50);
  const slotW=150,slotH=110,slotGap=22;
  const totalW=3*slotW+2*slotGap;
  const startX=px+(pw-totalW)/2;
  const remaining=sieve.slots.filter(s=>!s.consumed);
  
  while(sieve.cursor<3&&sieve.slots[sieve.cursor].consumed)sieve.cursor++;
  sieve.slots.forEach((slot,i)=>{
    const sx=startX+i*(slotW+slotGap);
    const sy=py+62;
    const selected=(i===sieve.cursor&&!slot.consumed);
    
    if(slot.consumed){
      ctx.fillStyle='rgba(8,8,8,0.5)';roundRect(sx,sy,slotW,slotH,8);ctx.fill();
      ctx.strokeStyle='rgba(50,50,50,0.4)';ctx.lineWidth=1;roundRect(sx,sy,slotW,slotH,8);ctx.stroke();
      ctx.fillStyle='rgba(80,80,80,0.4)';ctx.font='12px "Courier New"';
      ctx.textAlign='center';ctx.fillText('— examinado —',sx+slotW/2,sy+slotH/2+5);ctx.textAlign='left';
      return;
    }
    ctx.fillStyle=selected?'rgba(80,150,180,0.22)':'rgba(14,24,34,0.7)';
    roundRect(sx,sy,slotW,slotH,8);ctx.fill();
    ctx.strokeStyle=selected?'#90d0e8':'rgba(60,100,120,0.4)';ctx.lineWidth=selected?2:1;
    roundRect(sx,sy,slotW,slotH,8);ctx.stroke();
    
    ctx.save();ctx.translate(sx+slotW/2,sy+slotH/2-10);
    if(lupaOn){
      if(slot.isDiamond){
        const sz={diamante_pequeno:'pequeno',diamante_medio:'medio',diamante_grande:'grande'}[slot.type]||'pequeno';
        drawDiamanteBruto(0,0,Date.now()/800,sz);
      } else {
        drawQuartzoCristal(0,0,Date.now()/800);
      }
    } else {
      drawCristalAmbiguo(0,0,Date.now()/700);
    }
    ctx.restore();
    
    ctx.font='bold 11px "Courier New"';ctx.textAlign='center';
    if(lupaOn&&slot.isDiamond){
      ctx.fillStyle='#90d8ff';ctx.fillText('💎 Diamante (120°)',sx+slotW/2,sy+slotH-8);
    } else if(lupaOn&&!slot.isDiamond){
      ctx.fillStyle='#c0c0a8';ctx.fillText('⬜ Quartzo (60°)',sx+slotW/2,sy+slotH-8);
    } else {
      ctx.fillStyle=selected?'#90b8d0':'#607080';
      ctx.fillText('Cristal Bruto [?]',sx+slotW/2,sy+slotH-8);
    }
    ctx.textAlign='left';
  });
  const hintA=0.6+Math.sin(Date.now()/400)*0.4;
  ctx.font='12px "Courier New"';ctx.fillStyle=`rgba(140,200,220,${hintA})`;
  ctx.textAlign='center';
  ctx.fillText('[← →] Selecionar   [E] Coletar cristal   [Esc] Fechar',W/2,py+ph-14);
  ctx.textAlign='left';
}

let wrongPickups=0,lupaHintShown=false;
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
    
    if(G.sieveMode){
      const sieve=G.sieveMode;
      const active=sieve.slots.filter(s=>!s.consumed);
      if(active.length===0){G.sieveMode=null;G.dialog=false;return;}
      if(isL()){
        do{sieve.cursor=(sieve.cursor+2)%3;}while(sieve.slots[sieve.cursor].consumed);
        return;
      }
      if(isR()){
        do{sieve.cursor=(sieve.cursor+1)%3;}while(sieve.slots[sieve.cursor].consumed);
        return;
      }
      if(isE()){
        const slot=sieve.slots[sieve.cursor];
        if(slot&&!slot.consumed){
          slot.consumed=true;
          if(slot.isDiamond){
            
            this.items.push(slot.type);
            this.score+=slot.type==='diamante_grande'?50:30;
            journalCollect(slot.type);
            sfx('diamante');
            burst(this.x+20,this.y,'#90d8ff',14,3.5);
            burst(this.x+20,this.y,'#e8f8ff',10,2.5);
            const nomes={diamante_pequeno:'Diamante Bruto (Pequeno)',diamante_medio:'Diamante Bruto (Médio)',diamante_grande:'Diamante Bruto (Grande)'};
            notify(`💎 ${nomes[slot.type]||'Diamante'} coletado!`);
            const dSizes={diamante_pequeno:'pequeno',diamante_medio:'medio',diamante_grande:'grande'};
            showPopup('💎 DIAMANTE BRUTO COLETADO',
              ['Cristal de carbono puro — Mohs 10, mais duro da natureza',
               'Formado a 1.200°C sob 50.000 atmosferas de pressão',
               'Mais antigo que os dinossauros: 1-3 bilhões de anos',
               'O kimberlito é sua "embalagem" vulcânica natural'],
              '#90d8ff');
            sieve.wall.done=true;G.sieveMode=null;G.dialog=false;
          } else {
            
            wrongPickups++;
            sfx('quartzo');
            burst(this.x+20,this.y,'#e0d8c0',8,2);
            notify('⬜ Este é quartzo — belo, mas não é o que procuro.');
            if(wrongPickups>=2&&!lupaHintShown){
              lupaHintShown=true;
              setTimeout(()=>showDialog([
                '"Use a lupa antes de guardar qualquer cristal. O quartzo engana — é transparente, brilha, tem faces cristalinas. Mas olhe o ângulo das faces com a lupa: o diamante sempre mostrará ângulos de 120°, a geometria perfeita do carbono. O quartzo tem faces de 60°."',
                '"A diferença entre riqueza e engano está no detalhe que você não vê a olho nu. Equipe a Lupa de Lapidário no Diário [I] e tente novamente."',
              ],null),400);
            }
            
            const remaining=sieve.slots.filter(s=>!s.consumed);
            if(remaining.length===1&&remaining[0].isDiamond){
              remaining[0].consumed=true;
              this.items.push(remaining[0].type);
              this.score+=remaining[0].type==='diamante_grande'?50:30;
              journalCollect(remaining[0].type);
              sfx('diamante');
              burst(this.x+20,this.y,'#90d8ff',14,3.5);
              const nomes2={diamante_pequeno:'Diamante Bruto (Pequeno)',diamante_medio:'Diamante Bruto (Médio)',diamante_grande:'Diamante Bruto (Grande)'};
              notify(`💎 ${nomes2[remaining[0].type]||'Diamante'} coletado por eliminação!`);
              sieve.wall.done=true;G.sieveMode=null;G.dialog=false;
            }
          }
        }
        return;
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
      for(const p of level.plats){if(p.type==='spike'&&this.overlaps(p))this._hurt(2,level,'espinho');}
    }
    if(this.inv>0)this.inv--;if(this.interactAnim>0)this.interactAnim--;

    if(isE()){
      
      const TOOL_TYPES=['picareta_kimberlito','peneira_classificacao'];
      for(const c of level.cols||[]){
        if(c.done||!TOOL_TYPES.includes(c.type))continue;
        if(!this.near({x:c.x,y:c.y,w:c.w,h:c.h},90))continue;
        c.done=true;
        if(c.type==='picareta_kimberlito'){
          this.items.push('picareta_kimberlito');this.activeTools.add('picareta_kimberlito');sfx('item');
          burst(c.x+17,c.y+17,'#c0a060',12);journalCollect('picareta_kimberlito');
          showPopup('⛏️ PICARETA DE KIMBERLITO',['Cabo longo para trabalho em parede vertical','Kimberlito é rocha vulcânica densa do manto terrestre','Use [E] próximo às paredes azul-esverdeadas','Equipe no Diário [I]'],'#c8a050');
          notify('✦ Picareta de Kimberlito! Equipe-a no Diário [I].');
        } else if(c.type==='peneira_classificacao'){
          this.items.push('peneira_classificacao');sfx('item');
          burst(c.x+17,c.y+17,'#a0b8c0',10);journalCollect('peneira_classificacao');
          showPopup('🪣 PENEIRA DE CLASSIFICAÇÃO',['Malha de aço para separar cristais por tamanho','Fragmentos pequenos caem, cristais maiores ficam','Primeiro estágio da identificação','Depois use a Lupa de Lapidário!'],'#90b8d0');
          notify('✦ Peneira coletada! Busque o Suricato →');
        }
        break;
      }

      if(level.meerkat&&!level.meerkat.gifted&&this.near({x:level.meerkat.x-60,y:level.meerkat.y-80,w:120,h:80})){
        level.meerkat.gifted=true;sfx('meerkat');
        for(let i=0;i<16;i++)burst(level.meerkat.x,level.meerkat.y-30,'#e8c860',1,2+Math.random()*2);
        this.items.push('lupa_lapidario');journalCollect('lupa_lapidario');
        showDialog([
          '"O Suricato! Suricata suricatta — o animal de visão mais aguçada da savana. Em pé nas patas traseiras, escaneia o horizonte por predadores a 800 metros de distância. É a sentinela perfeita do Karoo."',
          '"Ele me deixou a Lupa de Lapidário de 10 aumentos — o instrumento que lapidários e gemologistas usam para examinar a clareza, as inclusões e as faces cristalinas de gemas brutas."',
          '"No século XIX, a primeira coisa que um comprador fazia ao receber um diamante bruto era examiná-lo com a lupa. O suricato, com sua postura de sentinela e visão aguçada, é a metáfora perfeita desse ato de escrutínio."',
        ],()=>{notify('✦ Lupa coletada! Equipe-a no Diário [I] e desça na mina →');},'CORVAN','#d0a8e0');
        showPopup('🔍 LUPA DE LAPIDÁRIO (10x)',['Instrumento essencial de gemologistas','Diamante: faces de 120° (estrutura cúbica)','Quartzo: faces de 60° (prisma hexagonal)','A diferença está no ângulo que você não vê a olho nu'],'#c0e0f0');
      }

      if(level.expositions){
        for(const ex of level.expositions){
          if(!ex.examined&&this.near({x:ex.x-28,y:ex.y-28,w:56,h:56})){
            if(!G.dialog){
              ex.examine();
              const cnt=level.expositions.filter(e=>e.examined).length;
              const tot=level.expositions.length;
              if(cnt===1)showPopup('💎 DIAMANTE — CARBONO PURO',['C — único elemento, dureza 10 Mohs','Formado a 1.200°C e 50.000 atmosferas a 150km','O mesmo carbono do grafite de um lápis!','Diferença: estrutura tetraédrica 3D vs camadas planas'],'#90d8ff');
              else if(ex.type==='kimberlite')showPopup('🪨 KIMBERLITO — EMBALAGEM DE DIAMANTES',['Rocha vulcânica rara do manto terrestre','Explosão profunda trouxe diamantes em segundos','A "blue ground" contém os cristais mais puros','Kimberley foi o maior depósito kimberlítico conhecido'],'#80b8d0');
              if(cnt===tot&&!level._expDialogDone){
                level._expDialogDone=true;
                showDialog([
                  '"O kimberlito é uma rocha vulcânica rara — vem do manto da Terra, de mais de 150 quilômetros de profundidade. Os diamantes dentro dele se formaram a bilhões de anos, sob pressão de 50.000 atmosferas e temperatura de 1.200°C."',
                  '"Para virem até cá, precisaram de uma explosão profunda que os trouxe em segundos até a superfície — em tubos vulcânicos chamados pipes de kimberlito. Cada diamante que você encontra nesta rocha azul é mais antigo que os dinossauros."',
                  '"O quartzo hialino e o diamante bruto têm aparência similar sob o pó de kimberlito. Para distinguir: use a lupa. O diamante tem faces cristalinas nítidas com ângulos de 120°; o quartzo tem faces hexagonais de 60°."',
                ],(()=>{notify('✦ Busque as paredes de kimberlito para minerar!');}));
              }
              notify(`🪨 Formação examinada! (${cnt}/${tot})`);
            }
            break;
          }
        }
      }

      if(level.kimberliteWalls&&!G.sieveMode){
        for(const w of level.kimberliteWalls){
          if(w.done)continue;
          if(!this.near({x:w.x,y:w.y,w:w.w,h:w.h},70))continue;
          if(w.state==='intact'){
            if(!this.items.includes('picareta_kimberlito')){notify('⛏️ Encontre a Picareta de Kimberlito primeiro!');break;}
            
            w.state='mined';sfx('picareta');shake(6,18);
            burst(w.x+24,w.y+34,'#60a0c0',12,2.5);
            burst(w.x+24,w.y+34,'#c8c8b0',8,2);
            notify('⛏️ Kimberlito minerado! Use a Peneira para classificar os fragmentos [E].');
          } else if(w.state==='mined'){
            if(!this.items.includes('peneira_classificacao')){notify('🪣 Encontre a Peneira de Classificação primeiro!');break;}
            
            sfx('peneira');
            G.sieveMode={wall:w,slots:w.slots,cursor:0};
            G.dialog=true;
          }
          break;
        }
      }

      if(level.contratoObj&&!level.contratoObj.done&&this.near({x:level.contratoObj.x-40,y:level.contratoObj.y-40,w:80,h:40})){
        level.contratoObj.done=true;this.items.push('contrato_trabalho');this.score+=80;sfx('unlock');
        burst(level.contratoObj.x,level.contratoObj.y,'#c0a0e0',18,3);
        journalCollect('contrato_trabalho');this.interactAnim=40;
        showDialog([
          '"Este contrato diz que o trabalho vale nada sem o documento que comprova que você concordou. Mas quem assinou com o dedo não sabia o que estava assinando."',
          '"O contrato de trabalho migratório da De Beers: o trabalhador africano concordava em viver confinado no compound por 3 a 6 meses, sem direito de sair, vender ou possuir diamantes, sujeito a revista corporal diária."',
          '"O sistema de compound — campos fechados onde trabalhadores eram confinados — foi uma das primeiras formas industriais de segregação racial sistemática. O apartheid formal só viria em 1948. Mas começou aqui, nas minas de diamante, em 1871."',
        ],null,'CORVAN','#d0a8e0');
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
    if(p.type==='trapdoor'&&this.vy<0)continue;
    if(this.overlaps(p)){
      if(this.vy>=0){this.y=p.y-this.h;this.vy=0;this.onG=true;if(p.moving)this.onMoving=p;if(p.type==='trapdoor'&&p.crumble===undefined)p.crumble=70;}
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
    const _dispTool=this.activeTools.has('lupa_lapidario')?'lupa_lapidario':
                    this.activeTools.has('picareta_kimberlito')?'picareta_kimberlito':
                    this.activeTools.has('peneira_classificacao')?'peneira_classificacao':null;
    ctx.save();drawCorvan(dx,dy,S,flip,wf,_dispTool);ctx.restore();
    if(this.inv>0&&Math.floor(this.inv/6)%2===0){ctx.fillStyle='rgba(255,60,60,0.35)';ctx.fillRect(this.x-cam.x,this.y-cam.y,this.w,this.h);}
  }
}

function drawBg(levelNum,levelW,levelH){
  
  const skies=['#f0a830','#1a2a35','#1a2030','#e87820'];
  const grounds=['#c87020','#1e3040','#1a2c3a','#b05818'];
  const sky=skies[levelNum-1]||'#f0a830';
  const gnd=grounds[levelNum-1]||'#c87020';

  const skyGrad=ctx.createLinearGradient(0,0,0,H);
  if(levelNum===1){
    skyGrad.addColorStop(0,'#87ceeb');skyGrad.addColorStop(0.55,'#f0c878');skyGrad.addColorStop(1,'#e09040');
  } else if(levelNum===2){
    skyGrad.addColorStop(0,'#0e1820');skyGrad.addColorStop(0.5,'#1e3848');skyGrad.addColorStop(1,'#2a4858');
  } else if(levelNum===3){
    skyGrad.addColorStop(0,'#101822');skyGrad.addColorStop(1,'#1e3040');
  } else {
    skyGrad.addColorStop(0,'#e06820');skyGrad.addColorStop(0.4,'#f08030');skyGrad.addColorStop(0.75,'#d04818');skyGrad.addColorStop(1,'#802010');
  }
  ctx.fillStyle=skyGrad;ctx.fillRect(0,0,W,H);

  const bgKeys=['bg01','bg02','bg03','bg04'];
  const bgImg=IMG[bgKeys[levelNum-1]];
  if(bgImg){
    
    const px=-(cam.x*0.15)%(bgImg.width>0?bgImg.width:W);
    
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
    if(levelNum===2||levelNum===3)c='rgba(80,160,200,0.25)';
    if(levelNum===4)c='rgba(220,120,60,0.4)';
    dustPts.push({x,y,vx:(Math.random()-.5)*0.4,vy:-(Math.random()*0.6+0.1),life:80+Math.random()*60,max:140,c,r:1+Math.random()*2.5});
  }
}
function tickDust(){for(let i=dustPts.length-1;i>=0;i--){const p=dustPts[i];p.x+=p.vx;p.y+=p.vy;p.life--;if(p.life<=0)dustPts.splice(i,1);}if(dustPts.length>60)dustPts.splice(0,5);}
function drawDust(){for(const p of dustPts){ctx.save();ctx.globalAlpha=(p.life/p.max)*0.6;ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x-cam.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.restore();}}

function drawSvgItem(key,cx,cy,size=48,bobT=0){
  const img=IMG[key];
  if(!img){return;}
  const bx=cx-size/2;
  const by=cy-size/2+Math.sin(bobT)*5;
  ctx.save();
  
  const gl=ctx.createRadialGradient(cx,cy,2,cx,cy,size*0.7);
  gl.addColorStop(0,'rgba(220,200,140,0.25)');gl.addColorStop(1,'rgba(220,200,140,0)');
  ctx.fillStyle=gl;ctx.beginPath();ctx.arc(cx,cy,size*0.7,0,Math.PI*2);ctx.fill();
  ctx.drawImage(img,bx,by,size,size);
  ctx.restore();
}

function drawHUD(player,level){
  if(!player)return;
  
  ctx.fillStyle='rgba(0,0,0,0.55)';ctx.fillRect(14,14,130,22);
  ctx.strokeStyle='rgba(180,140,220,0.4)';ctx.lineWidth=1.5;ctx.strokeRect(14,14,130,22);
  for(let i=0;i<player.maxHp;i++){
    ctx.fillStyle=i<player.hp?'#e04040':'rgba(60,40,40,0.6)';
    ctx.fillRect(18+i*40,18,36,14);
    ctx.strokeStyle='rgba(0,0,0,0.5)';ctx.lineWidth=1;ctx.strokeRect(18+i*40,18,36,14);
    ctx.fillStyle='#fff';ctx.font='10px "Courier New"';ctx.textAlign='center';
    ctx.fillText(i<player.hp?'♥':'♡',18+i*40+18,29);
  }ctx.textAlign='left';

  const diamonds=player.items.filter(id=>id.startsWith('diamante_')).length;
  ctx.fillStyle='rgba(0,0,0,0.55)';ctx.fillRect(14,42,130,22);
  ctx.strokeStyle='rgba(80,200,240,0.4)';ctx.lineWidth=1.5;ctx.strokeRect(14,42,130,22);
  ctx.font='bold 12px "Courier New"';ctx.fillStyle='#90d8ff';
  ctx.fillText(`💎 Diamantes: ${diamonds}/3`,20,57);

  if(player.items.includes('contrato_trabalho')){
    ctx.fillStyle='rgba(0,0,0,0.55)';ctx.fillRect(14,70,130,22);
    ctx.strokeStyle='rgba(180,120,200,0.4)';ctx.lineWidth=1.5;ctx.strokeRect(14,70,130,22);
    ctx.font='12px "Courier New"';ctx.fillStyle='#d0a8e0';
    ctx.fillText('📜 Contrato ✔',20,85);
  }

  if(player.activeTools.size>0){
    const tool=[...player.activeTools][0];
    const icons={picareta_kimberlito:'⛏️',peneira_classificacao:'🪣',lupa_lapidario:'🔍'};
    ctx.fillStyle='rgba(0,0,0,0.55)';roundRect(W-68,14,54,24,5);ctx.fill();
    ctx.strokeStyle='rgba(200,180,240,0.4)';ctx.lineWidth=1.5;roundRect(W-68,14,54,24,5);ctx.stroke();
    ctx.font='13px "Courier New"';ctx.fillStyle='#d0a8e0';
    ctx.textAlign='center';ctx.fillText((icons[tool]||'?')+' Eqp',W-41,30);ctx.textAlign='left';
  }

  const labels=['Borda do Big Hole','Interior do Kimberlito','Câmara de Coleta','O Entardecer'];
  ctx.font='11px "Courier New"';ctx.fillStyle='rgba(200,180,220,0.6)';
  ctx.textAlign='center';ctx.fillText(`Cena ${G.level}: ${labels[(G.level-1)%4]||''}`,W/2,H-10);
  ctx.textAlign='left';

  if(G.hintTimer>0){
    G.hintTimer--;
    ctx.save();ctx.globalAlpha=Math.min(1,G.hintTimer/60)*0.7;
    ctx.font='11px "Courier New"';ctx.fillStyle='#c0b0d0';
    ctx.textAlign='center';
    ctx.fillText('← → Mover   ↑/Espaço Pular   E Interagir   I Diário   M Menu',W/2,H-28);
    ctx.restore();
  }
  ctx.textAlign='left';
}

function drawTitle(){
  
  drawBg(1,3200,720);
  
  ctx.fillStyle='rgba(0,0,0,0.55)';ctx.fillRect(0,0,W,H);
  
  spawnDust(1);tickDust();drawDust();
  ctx.textAlign='center';
  
  ctx.shadowColor='#e0a030';ctx.shadowBlur=44;
  ctx.fillStyle='#f0e8d0';ctx.font='bold 42px "Courier New"';
  ctx.fillText('O Palácio Subterrâneo',W/2,138);
  ctx.shadowBlur=0;
  ctx.fillStyle='#f0c060';ctx.font='19px "Courier New"';
  ctx.fillText('Fase 4.1  —  Diamantes de Kimberley, África do Sul',W/2,184);
  
  if(IMG.card41){
    const cs=160,cardX=W/2-80,cardY=218;
    const glow=ctx.createRadialGradient(W/2,cardY+80,0,W/2,cardY+80,130);
    glow.addColorStop(0,'rgba(240,190,60,0.28)');glow.addColorStop(1,'rgba(240,190,60,0)');
    ctx.fillStyle=glow;ctx.beginPath();ctx.arc(W/2,cardY+80,130,0,Math.PI*2);ctx.fill();
    ctx.shadowColor='rgba(0,0,0,0.7)';ctx.shadowBlur=18;
    ctx.drawImage(IMG.card41,cardX,cardY,cs,cs);
    ctx.shadowBlur=0;
    ctx.strokeStyle='rgba(220,170,60,0.55)';ctx.lineWidth=2;ctx.strokeRect(cardX,cardY,cs,cs);
  } else {
    
    ctx.save();ctx.translate(W/2,308);ctx.scale(3,3);
    drawDiamanteBruto(0,0,Date.now()/1000,'grande');
    ctx.restore();
  }
  
  ctx.fillStyle=`rgba(210,180,240,${.55+Math.sin(Date.now()/550)*.4})`;
  ctx.font='19px "Courier New"';
  ctx.fillText('▶  Pressione ENTER para começar  ◀',W/2,458);
  
  ctx.fillStyle='#b0a8c8';ctx.font='18px "Courier New"';
  ctx.fillText('← → Mover   ↑/Espaço Pular   E Interagir/Minerar',W/2,500);
  ctx.fillText('← → Navegar Peneira   [I] Diário   [M] Menu Principal',W/2,536);
  ctx.textAlign='left';
}

function drawDeath(player){
  ctx.fillStyle='rgba(0,0,0,0.78)';ctx.fillRect(0,0,W,H);
  const cause=player?player.deathCause||'queda':'queda';
  const msgs={queda:'Caiu no Big Hole...',espinho:'Atingido por espinhos!'};
  ctx.fillStyle='#e04040';ctx.font='bold 38px "Courier New"';
  ctx.textAlign='center';ctx.fillText('CORVAN CAIU!',W/2,H/2-60);
  ctx.font='20px "Courier New"';ctx.fillStyle='#d09090';
  ctx.fillText(msgs[cause]||'Foi derrotado.',W/2,H/2-20);
  ctx.font='15px "Courier New"';ctx.fillStyle='#b07070';
  ctx.fillText('No Big Hole, um segundo de descuido custava tudo.',W/2,H/2+20);
  const pulse=0.65+Math.sin(Date.now()/500)*0.35;
  ctx.globalAlpha=pulse;ctx.fillStyle='#d0a8e0';ctx.font='bold 18px "Courier New"';
  ctx.fillText('[E] Tentar novamente',W/2,H/2+74);
  ctx.globalAlpha=1;ctx.textAlign='left';
}

function drawComplete(player){
  const g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#e86820');g.addColorStop(0.5,'#801800');g.addColorStop(1,'#1a0808');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  
  ctx.fillStyle='rgba(255,140,0,0.15)';ctx.beginPath();ctx.arc(W/2,H*0.42,280,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#f0d060';ctx.font='bold 38px "Courier New"';
  ctx.textAlign='center';ctx.fillText('O Entardecer de Kimberley',W/2,H*0.28);
  ctx.font='18px "Courier New"';ctx.fillStyle='#e8c090';
  ctx.fillText('Fase 4.1 — Diamantes de Kimberley concluída',W/2,H*0.36);
  
  const score=player?player.score:0;
  ctx.fillStyle='rgba(0,0,0,0.45)';roundRect(W/2-200,H*0.43,400,120,12);ctx.fill();
  ctx.strokeStyle='rgba(200,150,60,0.5)';ctx.lineWidth=1.5;roundRect(W/2-200,H*0.43,400,120,12);ctx.stroke();
  ctx.font='bold 20px "Courier New"';ctx.fillStyle='#f0d070';
  ctx.fillText(`Pontuação Final: ${score} pts`,W/2,H*0.43+36);
  ctx.font='14px "Courier New"';ctx.fillStyle='#d0b870';
  const diamonds=player?player.items.filter(id=>id.startsWith('diamante_')).length:0;
  ctx.fillText(`💎 Diamantes coletados: ${diamonds}/3`,W/2,H*0.43+62);
  const hasContrato=player&&player.items.includes('contrato_trabalho');
  ctx.fillStyle=hasContrato?'#d0a8e0':'#666';
  ctx.fillText(hasContrato?'📜 Contrato De Beers: encontrado':'📜 Contrato De Beers: não encontrado',W/2,H*0.43+86);
  ctx.font='13px "Courier New"';ctx.fillStyle='rgba(200,160,80,0.8)';
  ctx.fillText('A De Beers controlava 90% da produção mundial até 2000.',W/2,H*0.43+110);
  const pulse=0.65+Math.sin(Date.now()/500)*0.35;
  ctx.globalAlpha=pulse;ctx.fillStyle='#d0a8e0';ctx.font='bold 18px "Courier New"';
  ctx.fillText('[E] Próxima Região',W/2,H*0.82);
  ctx.globalAlpha=1;ctx.textAlign='left';
}

function buildL1(){
  
  const LW=3200,LH=720;
  const GROUND=560;
  const plats=[];
  
  plats.push({x:0,y:GROUND,w:LW,h:160,type:'ground'});

  plats.push({x:900,y:GROUND,w:500,h:160,type:'_dead'});
  
  plats.push({x:920,y:GROUND-80,w:80,h:20,type:'plat'});
  plats.push({x:1060,y:GROUND-120,w:80,h:20,type:'plat'});
  plats.push({x:1200,y:GROUND-80,w:80,h:20,type:'plat'});
  
  plats.push({x:400,y:GROUND-40,w:80,h:40,type:'plat'});
  plats.push({x:600,y:GROUND-60,w:60,h:60,type:'plat'});
  plats.push({x:1500,y:GROUND-50,w:100,h:50,type:'plat'});
  plats.push({x:1800,y:GROUND-80,w:120,h:80,type:'plat'});
  plats.push({x:2100,y:GROUND-50,w:80,h:50,type:'plat'});
  plats.push({x:2400,y:GROUND-60,w:100,h:60,type:'plat'});
  plats.push({x:2700,y:GROUND-40,w:140,h:40,type:'plat'});
  
  plats.push({x:2900,y:GROUND-80,w:200,h:80,type:'plat'});

  const cols=[
    new Col(320,GROUND-90,'picareta_kimberlito'),
    new Col(1650,GROUND-90,'peneira_classificacao'),
  ];

  const triggers=[];
  
  triggers.push(new Trigger(LW-60,GROUND-120,60,120,'Descer na Mina',()=>{G.loadLevel(2);}));

  const meerkat={x:2840,y:GROUND-60,gifted:false};

  const startDlg=new Trigger(200,0,100,720,'',()=>{},true);
  startDlg.done=false;

  return {
    num:1,W:LW,H:LH,
    startX:80,startY:GROUND-68,
    plats,cols,triggers,meerkat,
    _startDone:false,
  };
}

function buildL2(){
  
  const LW=2400,LH=860;
  const FLOOR=700;
  const plats=[];
  
  plats.push({x:0,y:FLOOR,w:LW,h:160,type:'ground'});

  plats.push({x:200,y:FLOOR-120,w:100,h:20,type:'plat'});
  plats.push({x:400,y:FLOOR-200,w:80,h:20,type:'plat'});
  plats.push({x:580,y:FLOOR-140,w:100,h:20,type:'plat'});
  plats.push({x:800,y:FLOOR-180,w:120,h:20,type:'plat'});
  plats.push({x:1000,y:FLOOR-100,w:100,h:20,type:'plat'});
  plats.push({x:1200,y:FLOOR-220,w:80,h:20,type:'plat'});
  plats.push({x:1400,y:FLOOR-160,w:100,h:20,type:'plat'});
  plats.push({x:1600,y:FLOOR-100,w:120,h:20,type:'plat'});
  plats.push({x:1900,y:FLOOR-180,w:80,h:20,type:'plat'});
  plats.push({x:2100,y:FLOOR-130,w:100,h:20,type:'plat'});
  plats.push({x:2250,y:FLOOR-80,w:100,h:20,type:'plat'});
  
  const expositions=[
    new KimberliteExposition(480,FLOOR-30,'diamond'),
    new KimberliteExposition(900,FLOOR-30,'kimberlite'),
    new KimberliteExposition(1500,FLOOR-30,'quartz'),
    new KimberliteExposition(2000,FLOOR-30,'kimberlite'),
  ];
  const triggers=[];
  triggers.push(new Trigger(LW-60,FLOOR-120,60,120,'Câmara de Coleta',()=>{G.loadLevel(3);}));
  const cols=[];
  return {num:2,W:LW,H:LH,startX:80,startY:FLOOR-68,plats,cols,triggers,expositions,_expDialogDone:false};
}

function buildL3(){
  
  const LW=2000,LH=720;
  const FLOOR=560;
  const plats=[];
  plats.push({x:0,y:FLOOR,w:LW,h:160,type:'ground'});
  plats.push({x:300,y:FLOOR-100,w:100,h:20,type:'plat'});
  plats.push({x:600,y:FLOOR-80,w:80,h:20,type:'plat'});
  plats.push({x:1000,y:FLOOR-100,w:100,h:20,type:'plat'});
  plats.push({x:1400,y:FLOOR-80,w:80,h:20,type:'plat'});
  plats.push({x:1700,y:FLOOR-100,w:100,h:20,type:'plat'});
  
  const walls=[
    new KimberliteWall(380,FLOOR-68,'diamante_pequeno'),
    new KimberliteWall(920,FLOOR-68,'diamante_medio'),
    new KimberliteWall(1500,FLOOR-68,'diamante_grande'),
  ];
  
  const cols=[new Col(1820,FLOOR-60,'contrato_trabalho')];
  const triggers=[];
  triggers.push(new Trigger(LW-60,FLOOR-120,60,120,'Subir — Entardecer',()=>{G.loadLevel(4);}));
  return {num:3,W:LW,H:LH,startX:80,startY:FLOOR-68,plats,cols,triggers,walls};
}

function buildL4(){
  
  const LW=2400,LH=720;
  const FLOOR=560;
  const plats=[];
  plats.push({x:0,y:FLOOR,w:LW,h:160,type:'ground'});
  plats.push({x:200,y:FLOOR-60,w:100,h:60,type:'plat'});
  plats.push({x:500,y:FLOOR-80,w:80,h:20,type:'plat'});
  plats.push({x:800,y:FLOOR-60,w:120,h:20,type:'plat'});
  plats.push({x:1200,y:FLOOR-100,w:80,h:20,type:'plat'});
  plats.push({x:1600,y:FLOOR-70,w:100,h:20,type:'plat'});
  plats.push({x:1900,y:FLOOR-60,w:140,h:60,type:'plat'});
  
  const triggers=[];
  triggers.push(new Trigger(LW-120,FLOOR-160,120,160,'Entrar no Compound',()=>{G.state='complete';}));
  const cols=[];
  return {num:4,W:LW,H:LH,startX:80,startY:FLOOR-68,plats,cols,triggers};
}

const G={
  state:'title',
  level:1,
  player:null,
  currentLevel:null,
  dialog:false,
  sieveMode:null,
  hintTimer:240,

  loadLevel(n){
    this.level=n;
    this.sieveMode=null;this.dialog=false;
    const prev=this.player;
    
    const prevItems=prev?[...prev.items]:[];
    const prevScore=prev?prev.score:0;
    const prevTools=prev?new Set(prev.activeTools):new Set();

    if(n===1)this.currentLevel=buildL1();
    else if(n===2)this.currentLevel=buildL2();
    else if(n===3)this.currentLevel=buildL3();
    else if(n===4)this.currentLevel=buildL4();

    const lv=this.currentLevel;
    this.player=new Player(lv.startX||80, lv.startY||(lv.H-200));
    this.player.items=prevItems;
    this.player.score=prevScore;
    this.player.activeTools=prevTools;
    
    if(this.player.items.includes('picareta_kimberlito'))this.player.activeTools.add('picareta_kimberlito');

    cam.x=0;cam.y=0;cam.W=W;cam.H=H;
    cam.LW=lv.W;cam.LH=lv.H;
    particles.length=0;dustPts.length=0;

    this.state='playing';
    
    if(n===1){
      setTimeout(()=>showDialog([
        '"Kimberley, África do Sul, 1880. Estamos na borda do Big Hole — a maior escavação manual da história humana. Mais de 50.000 homens trabalharam aqui entre 1871 e 1914, retirando 2.722 kg de diamantes."',
        '"Encontre a Picareta de Kimberlito e a Peneira de Classificação antes de descer. O suricato no campo pode ter algo útil. Cuidado com a borda do Hole — uma queda aqui é fatal."',
      ],null),600);
    } else if(n===2){
      setTimeout(()=>showDialog([
        '"Interior do Kimberlito — a rocha azul-esverdeada que contém os diamantes. O kimberlito vem do manto terrestre, trazido por explosões profundas. Cada formação conta a história de como o diamante chega à superfície."',
        '"Examine as formações antes de prosseguir. Você precisa compreender a diferença entre kimberlito, quartzo e diamante para peneirar corretamente na câmara à frente."',
      ],null),500);
    } else if(n===3){
      setTimeout(()=>showDialog([
        '"Câmara de Coleta — aqui os trabalhadores mineravam o kimberlito diretamente das paredes. Use a picareta [E] para extrair, depois a peneira [E] para classificar os cristais."',
        '"Três paredes de kimberlito, três chances de encontrar um diamante. A Lupa de Lapidário revela a geometria cristalina — 120° para diamante, 60° para quartzo. O Contrato De Beers também está aqui em algum lugar."',
      ],null),500);
    } else if(n===4){
      setTimeout(()=>showDialog([
        '"O entardecer de Kimberley. Os trabalhadores entram no compound — o cercado De Beers onde viviam confinados por meses. Não podiam sair, não podiam possuir diamantes."',
        '"A De Beers fundou este sistema de controle em 1887. Em 70 anos, seria formalizado como apartheid. Caminhe até o portão do compound para concluir a fase."',
      ],()=>{notify('✦ Vá ao portão do compound para concluir!');}),500);
    }
  },

  restart(){
    wrongPickups=0;lupaHintShown=false;
    popup.active=false;notifAlpha=0;
    BUBBLE.active=false;BUBBLE.queue=[];BUBBLE.cb=null;
    INV.open=false;INV.cursor=0;INV.tab=0;
    this.loadLevel(1);
  },

  advance(){
    
    unlockPhase('4_2');
    window.location.href='../../MenuPrincipal/index.html';
  },
};

function startGame(){
  
  G.loadLevel(1);
  G.state='title';
  cam.x=0;cam.y=0;
  loop();
}

function loop(){
  requestAnimationFrame(loop);
  const {dx,dy}=getShake();
  ctx.save();ctx.translate(dx,dy);
  ctx.clearRect(-10,-10,W+20,H+20);

  if(G.state==='title'){
    drawTitle();
    ctx.restore();
    if(jp['Enter']||jp['Space']||jp['KeyE']||jp['_te']){
      G.state='playing';
      cam.x=0;cam.y=0;
      particles.length=0;dustPts.length=0;
      clearJP();
      setTimeout(()=>{
        if(G.state==='playing')showDialog([
          '"Kimberley, África do Sul, 1880. Estamos na borda do Big Hole — a maior escavação manual da história humana. Mais de 50.000 homens trabalharam aqui entre 1871 e 1914, retirando 2.722 kg de diamantes."',
          '"Encontre a Picareta de Kimberlito e a Peneira de Classificação antes de descer. O suricato no campo pode ter algo útil. Cuidado com a borda do Hole — uma queda aqui é fatal."',
        ],null);
      },800);
    }
    clearJP();
    return;
  }

  const lv=G.currentLevel;

  if(G.state==='dead'){
    if(lv){tileTheme=TILE_THEMES[lv.num]||TILE_THEMES[1];drawBg(lv.num,lv.W,lv.H);}
    else{ctx.fillStyle='#0e0810';ctx.fillRect(0,0,W,H);}
    drawDeath(G.player);
    ctx.restore();
    if(jp['KeyR']||jp['Enter']||jp['KeyE']){G.restart();}
    clearJP();return;
  }

  if(G.state==='complete'){
    drawBg(4,2400,720);spawnDust(4);tickDust();drawDust();
    drawComplete(G.player);
    ctx.restore();
    if(jp['Enter']||jp['KeyE']){G.advance();}
    clearJP();return;
  }

  if(!lv){clearJP();ctx.restore();return;}
  const player=G.player;

  tileTheme=TILE_THEMES[lv.num]||TILE_THEMES[1];
  drawBg(lv.num,lv.W,lv.H);
  spawnDust(lv.num);tickDust();
  cam.track(player,lv.W,lv.H);

  if(lv.walls){for(const w of lv.walls)w.tick();}
  if(lv.expositions){for(const ex of lv.expositions)ex.tick();}
  if(lv.cols){for(const c of lv.cols)c.tick();}

  for(const p of lv.plats){
    if(p.type==='_dead'||p.type==='spike')continue;
    drawPlatform(p);
  }
  drawDust();

  if(lv.expositions){for(const ex of lv.expositions)ex.draw();}

  if(lv.walls){
    const lupaOn=player&&player.activeTools.has('lupa_lapidario');
    for(const w of lv.walls)w.draw(lupaOn);
  }

  if(lv.cols){
    for(const c of lv.cols){
      if(c.done)continue;
      const sx=c.x-cam.x,sy=c.y-cam.y;
      const svgMap={picareta_kimberlito:'ipicareta',peneira_classificacao:'ipeneira',
                    lupa_lapidario:'ilupa',contrato_trabalho:'icontrato'};
      const svgKey=svgMap[c.type];
      if(svgKey&&IMG[svgKey]){
        drawSvgItem(svgKey,sx+17,sy+17,44,c.t);
        if(player){
          const dist=Math.hypot(player.x+13-(c.x+17),player.y+34-(c.y+17));
          if(dist<120){
            const labels={picareta_kimberlito:'⛏️ Picareta de Kimberlito',peneira_classificacao:'🪣 Peneira de Classificação',
                          lupa_lapidario:'🔍 Lupa de Lapidário',contrato_trabalho:'📜 Contrato De Beers'};
            const txt=`[E] Pegar ${labels[c.type]||c.type}`;
            ctx.font='bold 13px "Courier New"';
            const tw=ctx.measureText(txt).width+20;
            const bx=sx+17-tw/2,by=sy-42;
            ctx.fillStyle='rgba(6,4,10,0.88)';roundRect(bx,by,tw,24,5);ctx.fill();
            ctx.strokeStyle='rgba(200,180,240,0.9)';ctx.lineWidth=1.5;roundRect(bx,by,tw,24,5);ctx.stroke();
            ctx.fillStyle='#e0d0f0';ctx.textAlign='center';ctx.fillText(txt,sx+17,by+16);ctx.textAlign='left';
          }
        }
      } else {
        c.draw(player?player.x:0,player?player.y:0);
      }
    }
  }

  if(lv.meerkat){
    const m=lv.meerkat;
    const mx=m.x-cam.x,my=m.y-cam.y;
    if(!m.gifted){
      if(IMG.isuricato){
        const bob=Math.sin(Date.now()/400)*4;
        ctx.save();
        const gl=ctx.createRadialGradient(mx,my+bob,4,mx,my+bob,44);
        gl.addColorStop(0,'rgba(240,200,80,0.3)');gl.addColorStop(1,'rgba(240,200,80,0)');
        ctx.fillStyle=gl;ctx.beginPath();ctx.arc(mx,my+bob,44,0,Math.PI*2);ctx.fill();
        ctx.drawImage(IMG.isuricato,mx-28,my-56+bob,56,56);
        ctx.restore();
      } else {
        drawMeerkat(mx,my,false,Date.now()/1000);
      }
      if(player&&Math.abs(player.x+13-m.x)<150){
        const ha=0.7+Math.sin(Date.now()/350)*0.3;
        ctx.fillStyle=`rgba(240,200,80,${ha})`;ctx.font='bold 12px "Courier New"';
        ctx.textAlign='center';ctx.fillText('[E] Cumprimentar Suricato',mx,my-70);ctx.textAlign='left';
      }
    }
  }

  if(lv.triggers){for(const t of lv.triggers)t.draw(player.x,player.y);}

  tickParticles();drawParticles();
  if(player){player.update(lv);player.draw();}

  BUBBLE.draw(player||{x:W/2,y:H/2,w:26,h:68});
  drawSieveOverlay(G.sieveMode);
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
  ctx.fillStyle='#070408';ctx.fillRect(0,0,W,H);
  const t=Date.now()/600;
  const cg=ctx.createRadialGradient(W/2,H/2,20,W/2,H/2,300);
  cg.addColorStop(0,'rgba(220,170,60,0.15)');cg.addColorStop(1,'rgba(220,170,60,0)');
  ctx.fillStyle=cg;ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#e0c870';ctx.font='bold 24px "Courier New"';ctx.textAlign='center';
  ctx.fillText(`Carregando${'.'.repeat(Math.floor(Date.now()/400)%4)}  ${assetsLoaded}/${totalAssets}`,W/2,H/2);
  ctx.save();ctx.translate(W/2,H/2+80);ctx.scale(2.5,2.5);
  drawDiamanteBruto(0,0,t,'medio');
  ctx.restore();
  ctx.textAlign='left';
})();}