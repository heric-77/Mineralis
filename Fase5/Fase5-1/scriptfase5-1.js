const SAVE_KEY='mineralis_save_v2';
function saveRead(){try{return JSON.parse(localStorage.getItem(SAVE_KEY))||{};}catch{return{};}}
function saveWrite(d){try{localStorage.setItem(SAVE_KEY,JSON.stringify(d));}catch{}}
function unlockPhase(id){const s=saveRead();if(!s.fases)s.fases={};if(!s.fases[id])s.fases[id]={};s.fases[id].desbloqueada=true;saveWrite(s);}
const _JOURNAL_ALIAS={jadeia_verde:'jadeita_imperial',jadeia_lavanda:'jadeita_lavanda',jadeia_branca:'jadeita_branca',bacia_madeira:'bacia_jade',placa_jade_ressoante:'placa_jade',bracelete_imperial:'bracelete_jade'};
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

// ── SFX — sons únicos da Fase 5.1 ──────────────────────────────────────────
function sfx(type){
  if(!AC)return;if(AC.state==='suspended')AC.resume();
  const o=AC.createOscillator(),g=AC.createGain();
  o.connect(g);g.connect(AC.destination);const t=AC.currentTime;
  if(type==='jump')      {o.frequency.setValueAtTime(220,t);o.frequency.exponentialRampToValueAtTime(440,t+.14);g.gain.setValueAtTime(.13,t);g.gain.exponentialRampToValueAtTime(.001,t+.16);}
  // Cinzel de bambu em jadeíta — tok claro e musical, sustentado como sino
  else if(type==='cinzel_jade'){
    o.type='sine';o.frequency.setValueAtTime(880,t);o.frequency.setValueAtTime(1100,t+.02);
    g.gain.setValueAtTime(.18,t);g.gain.exponentialRampToValueAtTime(.001,t+1.2); // longo sustain
  }
  // Cinzel em serpentinita — som morto, sem ressonância
  else if(type==='cinzel_serpentina'){
    o.type='square';o.frequency.setValueAtTime(180,t);o.frequency.exponentialRampToValueAtTime(80,t+.15);
    g.gain.setValueAtTime(.14,t);g.gain.exponentialRampToValueAtTime(.001,t+.18); // curto, sem eco
  }
  // Coleta de jadeíta — tok + onda de sino
  else if(type==='jade'){
    o.type='sine';o.frequency.setValueAtTime(660,t);o.frequency.setValueAtTime(880,t+.05);o.frequency.setValueAtTime(1320,t+.1);
    g.gain.setValueAtTime(.15,t);g.gain.exponentialRampToValueAtTime(.001,t+.8);
  }
  // Coleta do bracelete — sequência de erhu (violino chinês de 2 cordas)
  else if(type==='bracelete'){
    o.type='triangle';
    o.frequency.setValueAtTime(440,t);o.frequency.setValueAtTime(550,t+.15);
    o.frequency.setValueAtTime(660,t+.3);o.frequency.setValueAtTime(550,t+.45);o.frequency.setValueAtTime(880,t+.6);
    g.gain.setValueAtTime(.14,t);g.gain.exponentialRampToValueAtTime(.001,t+.9);
  }
  else if(type==='item')  {o.frequency.setValueAtTime(440,t);o.frequency.setValueAtTime(660,t+.1);o.frequency.setValueAtTime(880,t+.2);g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.001,t+.3);}
  else if(type==='unlock'){o.frequency.setValueAtTime(330,t);o.frequency.setValueAtTime(440,t+.15);o.frequency.setValueAtTime(660,t+.3);g.gain.setValueAtTime(.13,t);g.gain.exponentialRampToValueAtTime(.001,t+.5);}
  else if(type==='hit')   {o.type='sawtooth';o.frequency.setValueAtTime(200,t);o.frequency.exponentialRampToValueAtTime(60,t+.2);g.gain.setValueAtTime(.18,t);g.gain.exponentialRampToValueAtTime(.001,t+.22);}
  else if(type==='tigre') {o.type='sawtooth';o.frequency.setValueAtTime(110,t);o.frequency.setValueAtTime(140,t+.08);o.frequency.setValueAtTime(90,t+.18);g.gain.setValueAtTime(.1,t);g.gain.exponentialRampToValueAtTime(.001,t+.5);}
  // Coleta de artefato regional de cena (pena, nefrita, quartzo) — "tin" curto e leve, distinto do jade
  else if(type==='artefato'){o.type='sine';o.frequency.setValueAtTime(720,t);o.frequency.setValueAtTime(960,t+.06);g.gain.setValueAtTime(.11,t);g.gain.exponentialRampToValueAtTime(.001,t+.35);}
  o.start(t);o.stop(t+1.4);
}

// Toca a nota de referência da Placa de Jade (Mi natural = 659.25 Hz)
function sfxPlacaReferencia(){
  if(!AC)return;if(AC.state==='suspended')AC.resume();
  const t=AC.currentTime;
  [659.25, 1318.5].forEach((freq,i)=>{
    const o=AC.createOscillator(),g=AC.createGain();
    o.type='sine';o.frequency.value=freq;
    g.gain.setValueAtTime(0,t+i*0.05);
    g.gain.linearRampToValueAtTime(i===0?.15:.08,t+i*0.05+.04);
    g.gain.exponentialRampToValueAtTime(.001,t+i*0.05+1.8);
    o.connect(g);g.connect(AC.destination);o.start(t+i*0.05);o.stop(t+i*0.05+2.0);
  });
}

const IMG={};
let assetsLoaded=0,gameReady=false;
const ASSET_LIST=[
  ['bg01','Assets/cena1_floresta_rio.svg'],
  ['bg02','Assets/cena2_secao_geologica.svg'],
  ['bg03','Assets/cena3_pedras_cima.svg'],
  ['bg04','Assets/cena4_oficina_lapidario.svg'],
  ['icinzel','Assets/5_1_cinzel_bambu.svg'],
  ['ibacia','Assets/5_1_bacia_areia.svg'],
  ['iplaca','Assets/5_1_placa_jade.svg'],
  ['ibracelete','Assets/5_1_bracelete_jade.svg'],
  ['itigre','Assets/5_1_tigre_indochina.svg'],
  ['card51','Assets/5_1_jade.svg'],
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
  if(e.code==='Escape'&&G.sonicMode){G.sonicMode=null;G.dialog=false;}
  if(e.code==='KeyP'&&G.sonicMode){sfxPlacaReferencia();} // [P] toca placa de referência
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

// ── Definições de itens — Fase 5.1 ──────────────────────────────────────────
const ITEM_DEFS={
  cinzel_bambu:{
    cat:'ferramenta',nome:'Cinzel de Bambu Endurecido',icon:'🎋',
    journalId:'cinzel_bambu',drawHand:'left',
    desc:'Bambu queimado e endurecido ao fogo, com ponta oblíqua.\nMais duro que o jade superficial, mais gentil que o metal.\nO metal fraturaria o jade. O bambu extrai sem quebrar.',
  },
  bacia_madeira:{
    cat:'ferramenta',nome:'Bacia de Madeira com Areia',icon:'🥌',
    journalId:'bacia_jade',drawHand:'right',
    desc:'Bacia de teca com areia fina no fundo para estabilizar blocos.\nImobiliza o jade durante o teste de sonoridade.\nSem estabilização, o som não ressoa com clareza diagnóstica.',
  },
  placa_jade_ressoante:{
    cat:'ferramenta',nome:'Placa de Jade Ressoante',icon:'🟩',
    journalId:'placa_jade',drawHand:'right',
    desc:'Placa fina de jadeíta confirmada pelos lapidários Kachin.\nProduz um "Mi" natural (659 Hz) ao ser percutida levemente.\nReferência acústica: qualquer pedra com som similar é jadeíta.',
  },
  jadeia_verde:{
    cat:'minerio',nome:'Jadeíta Verde-Imperial (NaAlSi₂O₆)',icon:'💚',
    journalId:'jadeita_imperial',
    desc:'Verde-esmeralda translúcido — o jade mais valorizado do mundo.\nDureza 6.5–7 Mohs. Formada em zonas de subducção: alta pressão, baixa T°.\nVerde-imperial: traços de cromo, o mesmo que dá cor ao esmeralda.',
  },
  jadeia_lavanda:{
    cat:'minerio',nome:'Jadeíta Lavanda-Pálido',icon:'💜',
    journalId:'jadeita_lavanda',
    desc:'Jadeíta de tonalidade lavanda — variedade rara, altamente valorizada.\nMesma fórmula: NaAlSi₂O₆. Cor de traços de ferro e manganês.\nNa China imperial, era associada à sabedoria e clareza mental.',
  },
  jadeia_branca:{
    cat:'minerio',nome:'Jadeíta Branco-Translúcida',icon:'🤍',
    journalId:'jadeita_branca',
    desc:'Jadeíta sem impurezas cromáticas — quase pura em composição.\nTranslúcida ao ser iluminada, como cera derretida solidificada.\nChamada "mutton fat jade" pelos lapidários chineses imperiais.',
  },
  bracelete_imperial:{
    cat:'artefato',nome:'Bracelete de Jade Imperial Chinês',icon:'⭕',
    journalId:'bracelete_jade',
    desc:'Jadeíta verde-imperial, polida a espelho, dragões em baixo-relevo.\nO presente de maior prestígio do Imperador da China.\nGravado com o nome do artesão Kachin que nunca recebeu crédito.',
  },
};

// ── Inventário ─────────────────────────────────────────────────────────────
const INV={
  open:false,tab:0,cursor:0,
  TABS:[
    {id:'ferramenta',label:'🎋 Ferramentas',color:'#a0d870'},
    {id:'minerio',   label:'💚 Minérios',   color:'#70e8c0'},
    {id:'artefato',  label:'⭕ Artefatos',  color:'#e8c070'},
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
      if(player.items.includes(id)||player.items.includes(id+'_ok')||player.items.includes(id+'_col')){
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
    ctx.fillStyle='rgba(2,10,6,0.97)';roundRect(PX,PY,PW,PH,16);ctx.fill();
    ctx.shadowBlur=0;
    ctx.strokeStyle='#4a9858';ctx.lineWidth=2.5;roundRect(PX,PY,PW,PH,16);ctx.stroke();
    ctx.strokeStyle='rgba(100,200,120,0.2)';ctx.lineWidth=1;roundRect(PX+4,PY+4,PW-8,PH-8,12);ctx.stroke();
    ctx.fillStyle='#a0d870';ctx.font='bold 16px "Courier New"';
    ctx.textAlign='center';ctx.fillText('📔 DIÁRIO DE BORDO',W/2,PY+28);ctx.textAlign='left';
    ctx.fillStyle='rgba(100,200,120,0.3)';ctx.fillRect(PX+16,PY+38,PW-32,1);
    const TAB_W=PW/3,TAB_Y=PY+44;
    this.TABS.forEach((tab,i)=>{
      const tx=PX+i*TAB_W,active=(i===this.tab);
      ctx.fillStyle=active?'rgba(100,200,120,0.18)':'rgba(0,0,0,0.3)';
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
      ctx.fillStyle='#445544';ctx.font='14px "Courier New"';
      ctx.textAlign='center';ctx.fillText('Nenhum item coletado ainda.',W/2,CY+CH/2);
      ctx.fillText('Explore a fase para desbloquear!',W/2,CY+CH/2+24);ctx.textAlign='left';
    } else {
      const ROW_H=52,maxRows=Math.max(1,Math.floor(CH/ROW_H));
      const scrollTop=items.length>maxRows?Math.max(0,Math.min(this.cursor-maxRows+1,items.length-maxRows)):0;
      const visible=items.slice(scrollTop,scrollTop+maxRows);
      visible.forEach((item,vi)=>{
        const i=scrollTop+vi;
        const iy=CY+16+vi*ROW_H,selected=(i===this.cursor),equipped=player.activeTools.has(item.id);
        if(selected){ctx.fillStyle='rgba(100,200,120,0.18)';roundRect(PX+16,iy-10,COL_W,46,8);ctx.fill();ctx.strokeStyle='#a0d870';ctx.lineWidth=1.5;roundRect(PX+16,iy-10,COL_W,46,8);ctx.stroke();}
        ctx.font='24px serif';ctx.fillText(item.icon,PX+28,iy+22);
        ctx.font=(equipped?'bold ':'')+'14px "Courier New"';
        ctx.fillStyle=equipped?'#d0f090':(selected?'#c0e8c0':'#aaa');
        ctx.fillText(item.nome,PX+62,iy+16);
        if(equipped){ctx.fillStyle='rgba(100,200,120,0.22)';roundRect(PX+62,iy+20,80,16,4);ctx.fill();ctx.font='10px "Courier New"';ctx.fillStyle='#a0d870';ctx.fillText('▶ EQUIPADO',PX+66,iy+32);}
      });
      if(scrollTop>0){ctx.font='bold 12px "Courier New"';ctx.fillStyle='#a0d870';ctx.textAlign='center';ctx.fillText('▲ mais',PX+16+COL_W/2,CY+8);ctx.textAlign='left';}
      if(scrollTop+maxRows<items.length){ctx.font='bold 12px "Courier New"';ctx.fillStyle='#a0d870';ctx.textAlign='center';ctx.fillText('▼ mais',PX+16+COL_W/2,CY+16+maxRows*ROW_H+2);ctx.textAlign='left';}
      const sel=items[this.cursor];
      if(sel){
        ctx.fillStyle='rgba(100,200,120,0.08)';roundRect(DESC_X,CY,PW-DESC_X+PX-16,CH-10,8);ctx.fill();
        ctx.font='48px serif';ctx.textAlign='center';ctx.fillText(sel.icon,DESC_X+(PW-DESC_X+PX-16)/2,CY+70);ctx.textAlign='left';
        ctx.font='bold 15px "Courier New"';ctx.fillStyle='#a0d870';
        ctx.textAlign='center';ctx.fillText(sel.nome,DESC_X+(PW-DESC_X+PX-16)/2,CY+100);ctx.textAlign='left';
        const catLabel={ferramenta:'🎋 Ferramenta',minerio:'💚 Minério',artefato:'⭕ Artefato'};
        ctx.font='11px "Courier New"';ctx.fillStyle='#888';
        ctx.textAlign='center';ctx.fillText(catLabel[sel.cat],DESC_X+(PW-DESC_X+PX-16)/2,CY+118);ctx.textAlign='left';
        ctx.fillStyle='rgba(100,200,120,0.25)';ctx.fillRect(DESC_X+20,CY+126,PW-DESC_X+PX-56,1);
        const descLines=sel.desc.split('\n');
        ctx.font='13px "Courier New"';ctx.fillStyle='#c8e8c8';
        descLines.forEach((l,i)=>{ctx.textAlign='center';ctx.fillText(l,DESC_X+(PW-DESC_X+PX-16)/2,CY+146+i*22);});
        ctx.textAlign='left';
        if(sel.cat==='ferramenta'){
          const btnTxt=player.activeTools.has(sel.id)?'[E] Desequipar':'[E] Equipar';
          const btnColor=player.activeTools.has(sel.id)?'rgba(180,60,20,0.3)':'rgba(100,200,120,0.2)';
          ctx.fillStyle=btnColor;roundRect(DESC_X+40,CY+CH-60,PW-DESC_X+PX-96,34,8);ctx.fill();
          ctx.strokeStyle=player.activeTools.has(sel.id)?'#c04020':'#a0d870';ctx.lineWidth=1.5;
          roundRect(DESC_X+40,CY+CH-60,PW-DESC_X+PX-96,34,8);ctx.stroke();
          ctx.font='bold 13px "Courier New"';ctx.fillStyle=player.activeTools.has(sel.id)?'#e06040':'#a0d870';
          ctx.textAlign='center';ctx.fillText(btnTxt,DESC_X+(PW-DESC_X+PX-16)/2,CY+CH-38);ctx.textAlign='left';
        }
      }
    }
    ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(PX,PY+PH-38,PW,38);
    ctx.fillStyle='rgba(100,200,120,0.3)';ctx.fillRect(PX+16,PY+PH-39,PW-32,1);
    ctx.font='11px "Courier New"';ctx.fillStyle='#888';ctx.textAlign='center';
    ctx.fillText('◀ ▶ Abas   ↑ ↓ Navegar   E Equipar/Desequipar   I Fechar',W/2,PY+PH-14);
    ctx.textAlign='left';
  }
};

// ── Partículas ─────────────────────────────────────────────────────────────
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

const GRAV=0.52,PSPD=5.2,JUMPF=-12.4,MAXFALL=17;
// Paleta de cores — temática de floresta tropical / jade
const TILE_THEMES={
  1:{top:'#3a6830',body:'#1e3818',dark:'#0e1c0a'}, // floresta densa
  2:{top:'#2a5845',body:'#163528',dark:'#0a1e16'}, // interior do vale / rio
  3:{top:'#4a6038',body:'#283418',dark:'#141a0a'}, // oficina do lapidário
  4:{top:'#5a7040',body:'#303818',dark:'#181e08'}, // entardecer
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
    const nc=Math.max(1,Math.floor(p.w/20));
    const tw=p.w/nc;
    for(let i=0;i<nc;i++){
      const tx=sx+i*tw;
      const baseY=sy+p.h,tipY=sy,tipX=tx+tw/2;
      // Sombra de contato no chão (ajuda a perceber a base do espinho)
      ctx.fillStyle='rgba(0,0,0,0.25)';
      ctx.beginPath();ctx.ellipse(tipX,baseY+1,tw/2.3,2.5,0,0,Math.PI*2);ctx.fill();
      // Corpo do triângulo — cinza-claro, ponta para cima
      const grad=ctx.createLinearGradient(tx,baseY,tx,tipY);
      grad.addColorStop(0,'#8a8a92');grad.addColorStop(1,'#e8e8ee');
      ctx.fillStyle=grad;
      ctx.beginPath();ctx.moveTo(tx+1,baseY);ctx.lineTo(tipX,tipY);ctx.lineTo(tx+tw-1,baseY);ctx.closePath();ctx.fill();
      // Contorno escuro para destacar contra qualquer fundo
      ctx.strokeStyle='#3a3a42';ctx.lineWidth=1.5;ctx.stroke();
      // Brilho/aresta clara do lado esquerdo (sugere facetas de pedra/metal)
      ctx.strokeStyle='rgba(255,255,255,0.55)';ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(tx+3,baseY-2);ctx.lineTo(tipX-1,tipY+3);ctx.stroke();
    }
    return;
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
  if(p.moving){ctx.fillStyle='rgba(140,200,140,0.35)';ctx.fillRect(sx,sy,p.w,4);}
}

function roundRect(x,y,w,h,r){
  ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();
}

// ── Desenho do Corvan ──────────────────────────────────────────────────────
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
  // Ferramentas na mão — Fase 5.1
  if(activeTool==='cinzel_bambu'){
    // Cinzel de bambu — haste diagonal + ponta oblíqua
    const wb=Math.sin(frame*0.2)*1.5;
    ctx.fillStyle='#8a7040';ctx.fillRect(0*S,(22+wb)*S,4*S,1*S); // cabo bambu
    ctx.fillStyle='#c8a860';ctx.fillRect(-1*S,(23+wb)*S,2*S,7*S); // haste
    ctx.fillStyle='#e0c878';ctx.fillRect(-1*S,(30+wb)*S,3*S,2*S); // ponta oblíqua
    ctx.fillStyle='#f0d890';ctx.fillRect(0*S,(30+wb)*S,1*S,1*S); // brilho ponta
  } else if(activeTool==='bacia_madeira'){
    // Bacia de madeira com areia
    ctx.fillStyle='#6a4020';ctx.fillRect(-8*S,26*S,16*S,3*S); // borda superior
    ctx.fillStyle='#8a5530';ctx.fillRect(-6*S,29*S,12*S,8*S); // corpo bacia
    ctx.fillStyle='#d4b88a';ctx.fillRect(-5*S,30*S,10*S,6*S); // areia dentro
    ctx.fillStyle='#e0c8a0';ctx.fillRect(-4*S,31*S,3*S,1*S); // destaque areia
  } else if(activeTool==='placa_jade_ressoante'){
    // Placa fina de jadeíta — retângulo verde translúcido na mão
    ctx.fillStyle='rgba(60,180,100,0.85)';ctx.fillRect(24*S,22*S,10*S,6*S);
    ctx.fillStyle='rgba(120,240,160,0.6)';ctx.fillRect(25*S,23*S,8*S,4*S);
    ctx.fillStyle='rgba(200,255,220,0.5)';ctx.fillRect(25*S,23*S,3*S,2*S);
  }
  ctx.restore();
}

// ── Desenho do Tigre-de-Indochina ─────────────────────────────────────────
function drawTigre(cx,cy,frame=0){
  ctx.save();ctx.translate(cx,cy);
  const bob=Math.sin(frame*0.5)*1.0;
  if(IMG.itigre){
    const iw=72,ih=72;
    ctx.drawImage(IMG.itigre,-iw/2,-ih+8+bob,iw,ih);
    ctx.restore();return;
  }
  // Fallback — desenho manual caso o asset não carregue
  ctx.fillStyle='#d4882a';
  ctx.fillRect(-30,(-28+bob),60,22);
  ctx.fillStyle='#1a0a00';
  for(let i=0;i<5;i++){
    ctx.fillRect(-28+i*11,(-26+bob),3,18);
  }
  ctx.fillStyle='#f0e0c0';ctx.fillRect(-22,(-14+bob),44,10);
  ctx.fillStyle='#d4882a';ctx.beginPath();ctx.ellipse(0,(-38+bob),18,14,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#c07020';ctx.fillRect(-18,(-52+bob),10,10);ctx.fillRect(8,(-52+bob),10,10);
  ctx.fillStyle='#e89040';ctx.fillRect(-16,(-50+bob),7,8);ctx.fillRect(9,(-50+bob),7,8);
  ctx.fillStyle='#f0c030';ctx.beginPath();ctx.ellipse(-8,(-40+bob),5,3.5,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(8,(-40+bob),5,3.5,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#1a0800';ctx.beginPath();ctx.ellipse(-8,(-40+bob),2,3,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(8,(-40+bob),2,3,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(255,255,200,0.7)';ctx.beginPath();ctx.arc(-7,(-41+bob),1.2,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(9,(-41+bob),1.2,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#f0d8c0';ctx.beginPath();ctx.ellipse(0,(-33+bob),8,6,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#b06050';ctx.beginPath();ctx.ellipse(0,(-34+bob),4,2.5,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#1a0a00';ctx.fillRect(-14,(-50+bob),3,12);ctx.fillRect(11,(-50+bob),3,12);
  ctx.fillStyle='#c07020';ctx.fillRect(-30,(-8+bob),14,12);ctx.fillRect(16,(-8+bob),14,12);
  ctx.fillStyle='#d4882a';ctx.fillRect(-32,(-22+bob),10,14);ctx.fillRect(22,(-22+bob),10,14);
  ctx.fillStyle='#e8d0a0';
  for(let c=0;c<3;c++){ctx.fillRect(-30+c*4,3+bob,2,4);ctx.fillRect(20+c*4,3+bob,2,4);}
  ctx.strokeStyle='#d4882a';ctx.lineWidth=5;
  ctx.beginPath();ctx.moveTo(30,(-18+bob));ctx.quadraticCurveTo(55,(-10+bob),58,(5+bob));ctx.stroke();
  ctx.strokeStyle='#1a0a00';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(32,(-16+bob));ctx.quadraticCurveTo(54,(-8+bob),57,(5+bob));ctx.stroke();
  ctx.restore();
}

// ── Pedra de Jade (canvas) ─────────────────────────────────────────────────
function drawJadeItem(cx,cy,bobT=0,variety='verde'){
  ctx.save();ctx.translate(cx,cy+Math.sin(bobT)*5);
  const colors={
    verde:['#1a8050','#2aaa70','#50d090','#90ffc0'],
    lavanda:['#6050a0','#8070c0','#a090e0','#c0b0f8'],
    branca:['#c0d8d0','#d8eee8','#eef8f4','#ffffff'],
  };
  const C=colors[variety]||colors.verde;
  const glow=ctx.createRadialGradient(0,0,2,0,0,30);
  glow.addColorStop(0,`rgba(100,220,150,0.35)`);glow.addColorStop(1,`rgba(100,220,150,0)`);
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,30,0,Math.PI*2);ctx.fill();
  if(IMG.icard_jade||IMG.card51){
    const img=IMG.icard_jade||IMG.card51;
    const tints={verde:null,lavanda:'hue-rotate(60deg) saturate(1.3)',branca:'saturate(0.15) brightness(1.5)'};
    const filt=tints[variety];
    if(filt)ctx.filter=filt;
    ctx.drawImage(img,-20,-20,40,40);
    ctx.filter='none';
    const ta=Math.abs(Math.sin(Date.now()/600));
    ctx.fillStyle=`rgba(200,255,230,${ta*0.35})`;
    ctx.beginPath();ctx.ellipse(-2,-4,8,6,0.3,0,Math.PI*2);ctx.fill();
    ctx.restore();return;
  }
  // Fallback — desenho manual
  ctx.fillStyle=C[0];
  ctx.beginPath();ctx.moveTo(-16,-10);ctx.lineTo(-8,-20);ctx.lineTo(10,-18);ctx.lineTo(18,-6);
  ctx.lineTo(14,12);ctx.lineTo(-2,16);ctx.lineTo(-18,8);ctx.closePath();ctx.fill();
  ctx.fillStyle=C[1];
  ctx.beginPath();ctx.moveTo(-16,-10);ctx.lineTo(-8,-20);ctx.lineTo(10,-18);ctx.lineTo(4,-4);ctx.lineTo(-10,-2);ctx.closePath();ctx.fill();
  ctx.fillStyle=C[2];
  ctx.beginPath();ctx.moveTo(-8,-20);ctx.lineTo(4,-16);ctx.lineTo(4,-4);ctx.lineTo(-4,-6);ctx.closePath();ctx.fill();
  const ta=Math.abs(Math.sin(Date.now()/600));
  ctx.fillStyle=`rgba(200,255,230,${ta*0.5})`;
  ctx.beginPath();ctx.ellipse(-2,-4,8,6,0.3,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=C[3];ctx.beginPath();ctx.arc(-4,-8,2,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

// ── Serpentinita (item a descartar) ───────────────────────────────────────
function drawSerpentinitaItem(cx,cy,bobT=0){
  ctx.save();ctx.translate(cx,cy+Math.sin(bobT)*4);
  // Brilho fosco, sem translucidez
  const glow=ctx.createRadialGradient(0,0,2,0,0,22);
  glow.addColorStop(0,'rgba(120,140,80,0.2)');glow.addColorStop(1,'rgba(120,140,80,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,22,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#6a7840';
  ctx.beginPath();ctx.moveTo(-14,-8);ctx.lineTo(-6,-16);ctx.lineTo(12,-14);ctx.lineTo(16,-2);
  ctx.lineTo(12,10);ctx.lineTo(-4,14);ctx.lineTo(-16,6);ctx.closePath();ctx.fill();
  ctx.fillStyle='#7a8850';
  ctx.beginPath();ctx.moveTo(-14,-8);ctx.lineTo(-6,-16);ctx.lineTo(8,-14);ctx.lineTo(2,-4);ctx.closePath();ctx.fill();
  ctx.fillStyle='#8a9860';
  ctx.beginPath();ctx.arc(-2,-8,4,0,Math.PI*2);ctx.fill();
  // Aparência mais opaca e "morta"
  ctx.fillStyle='rgba(160,180,100,0.3)';
  ctx.beginPath();ctx.ellipse(0,-2,6,4,0.2,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

// ── Quartzito — o outro falso jade, visual e cor distintos da serpentinita ──
// (evita que as duas pedras "não-jade" do teste de sonoridade pareçam idênticas)
function drawQuartzitoItem(cx,cy,bobT=0){
  ctx.save();ctx.translate(cx,cy+Math.sin(bobT)*4);
  const glow=ctx.createRadialGradient(0,0,2,0,0,22);
  glow.addColorStop(0,'rgba(180,190,200,0.18)');glow.addColorStop(1,'rgba(180,190,200,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,22,0,Math.PI*2);ctx.fill();
  // Corpo acinzentado/esbranquiçado, textura granular (sem translucidez do jade)
  ctx.fillStyle='#9098a0';
  ctx.beginPath();ctx.moveTo(-13,-9);ctx.lineTo(-3,-15);ctx.lineTo(13,-10);ctx.lineTo(15,4);
  ctx.lineTo(6,13);ctx.lineTo(-8,12);ctx.lineTo(-16,0);ctx.closePath();ctx.fill();
  ctx.fillStyle='#a8b0b8';
  ctx.beginPath();ctx.moveTo(-13,-9);ctx.lineTo(-3,-15);ctx.lineTo(9,-11);ctx.lineTo(0,-2);ctx.closePath();ctx.fill();
  // Pontos granulares (aspecto de quartzo cristalino, sem veios contínuos)
  ctx.fillStyle='rgba(220,225,230,0.6)';
  ctx.beginPath();ctx.arc(-4,-6,2,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(4,-2,1.6,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(-2,4,1.8,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

// ── Bracelete Imperial (artefato) ─────────────────────────────────────────
function drawBracaleteItem(cx,cy,bobT=0){
  ctx.save();ctx.translate(cx,cy+Math.sin(bobT)*5);
  const t=Date.now()/600;
  const glow=ctx.createRadialGradient(0,0,2,0,0,32);
  glow.addColorStop(0,`rgba(60,200,120,${0.5+Math.sin(t)*0.2})`);
  glow.addColorStop(1,'rgba(60,200,120,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,32,0,Math.PI*2);ctx.fill();
  if(IMG.ibracelete){
    ctx.drawImage(IMG.ibracelete,-24,-24,48,48);
    // Reflexo espelhado animado, por cima do asset
    const sa=Math.abs(Math.sin(t));
    ctx.fillStyle=`rgba(200,255,220,${sa*0.7})`;
    ctx.beginPath();ctx.arc(11,-4,2,0,Math.PI*2);ctx.fill();
    ctx.restore();return;
  }
  // Fallback — desenho manual
  ctx.strokeStyle='#1a9050';ctx.lineWidth=8;
  ctx.beginPath();ctx.arc(0,0,16,0,Math.PI*2);ctx.stroke();
  ctx.strokeStyle='#30c070';ctx.lineWidth=5;
  ctx.beginPath();ctx.arc(0,0,16,0,Math.PI*2);ctx.stroke();
  ctx.strokeStyle='rgba(150,255,200,0.7)';ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(0,0,16,-Math.PI*0.7,-Math.PI*0.2);ctx.stroke();
  ctx.strokeStyle='#0a5030';ctx.lineWidth=1.5;
  for(let i=0;i<3;i++){
    const a=i*(Math.PI*2/3);
    ctx.save();ctx.rotate(a);
    ctx.beginPath();ctx.moveTo(8,-3);ctx.quadraticCurveTo(12,0,8,3);ctx.stroke();
    ctx.restore();
  }
  const sa=Math.abs(Math.sin(t));
  ctx.fillStyle=`rgba(200,255,220,${sa*0.8})`;
  ctx.beginPath();ctx.arc(11,0,2.5,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

// ── Placa de Jade Ressoante (item) ────────────────────────────────────────
function drawPlacaItem(cx,cy,bobT=0){
  ctx.save();ctx.translate(cx,cy+Math.sin(bobT)*5);
  const t=Date.now()/500;
  const glow=ctx.createRadialGradient(0,0,2,0,0,28);
  glow.addColorStop(0,`rgba(80,220,140,${0.4+Math.sin(t)*0.15})`);
  glow.addColorStop(1,'rgba(80,220,140,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,28,0,Math.PI*2);ctx.fill();
  if(IMG.iplaca){
    ctx.drawImage(IMG.iplaca,-22,-22,44,44);
  } else {
    // Fallback — desenho manual
    ctx.fillStyle='#1a7040';roundRect(-18,-10,36,20,3);ctx.fill();
    ctx.fillStyle='#28a060';roundRect(-16,-8,32,16,2);ctx.fill();
    ctx.fillStyle='rgba(100,255,180,0.5)';roundRect(-14,-6,20,10,2);ctx.fill();
    ctx.fillStyle='rgba(200,255,230,0.7)';roundRect(-13,-5,8,4,1);ctx.fill();
    ctx.fillStyle='rgba(0,80,30,0.8)';ctx.font='bold 14px serif';
    ctx.textAlign='center';ctx.fillText('♩',0,5);ctx.textAlign='left';
  }
  // Ondas sonoras animadas (sempre desenhadas, por cima do asset)
  const wa=Math.abs(Math.sin(t*1.5));
  ctx.strokeStyle=`rgba(100,240,160,${wa*0.6})`;ctx.lineWidth=1;
  ctx.beginPath();ctx.arc(0,0,24+wa*4,Math.PI*1.1,Math.PI*1.9);ctx.stroke();
  ctx.beginPath();ctx.arc(0,0,28+wa*4,Math.PI*1.05,Math.PI*1.95);ctx.stroke();
  ctx.restore();
}

// ── Cinzel de Bambu (item no chão) ────────────────────────────────────────
function drawCinzelItem(cx,cy,bobT=0){
  ctx.save();ctx.translate(cx,cy+Math.sin(bobT)*5);
  const glow=ctx.createRadialGradient(0,0,2,0,0,26);
  glow.addColorStop(0,'rgba(200,180,100,0.28)');glow.addColorStop(1,'rgba(200,180,100,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,26,0,Math.PI*2);ctx.fill();
  if(IMG.icinzel){
    ctx.drawImage(IMG.icinzel,-24,-24,48,48);
    ctx.restore();return;
  }
  // Fallback — desenho manual
  const S=0.6,O=-22;
  const r=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x*S+O,y*S+O,w*S,h*S);};
  for(let i=0;i<6;i++){r(8+i*6,60-i*6,6,6,'#8a8030');}
  for(let i=0;i<6;i++){r(9+i*6,61-i*6,2,4,'#a8a050');}
  r(14,54,6,2,'#605820');r(26,42,6,2,'#605820');r(38,30,6,2,'#605820');
  r(42,26,8,4,'#3a3010');r(44,24,6,4,'#4a4020');r(46,22,4,3,'#6a6030');
  r(47,23,2,2,'#9a9058');
  r(50,20,4,4,'#1a7040');r(51,20,2,2,'#30b060');r(51,19,1,1,'#80f0b0');
  const sa=Math.abs(Math.sin(Date.now()/500));
  ctx.strokeStyle=`rgba(180,180,80,${sa*0.6})`;ctx.lineWidth=1.2;
  ctx.beginPath();ctx.moveTo(50*S+O,18*S+O);ctx.lineTo(54*S+O,14*S+O);ctx.stroke();
  ctx.restore();
}

function drawBaciaItem(cx,cy,bobT=0){
  ctx.save();ctx.translate(cx,cy+Math.sin(bobT)*5);
  const glow=ctx.createRadialGradient(0,0,2,0,0,26);
  glow.addColorStop(0,'rgba(180,140,80,0.25)');glow.addColorStop(1,'rgba(180,140,80,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,26,0,Math.PI*2);ctx.fill();
  if(IMG.ibacia){
    ctx.drawImage(IMG.ibacia,-24,-24,48,48);
    ctx.restore();return;
  }
  // Fallback — desenho manual
  const S=0.65,O=-22;
  const r=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x*S+O,y*S+O,w*S,h*S);};
  ctx.strokeStyle='#8a5828';ctx.lineWidth=3*S;
  ctx.beginPath();ctx.ellipse(O+38*S,O+28*S,22*S,8*S,0,0,Math.PI*2);ctx.stroke();
  ctx.strokeStyle='#b07040';ctx.lineWidth=1.5*S;
  ctx.beginPath();ctx.ellipse(O+38*S,O+28*S,20*S,7*S,0,0,Math.PI*2);ctx.stroke();
  r(16,28,44,22,'#7a4820');r(18,30,40,20,'#8a5830');
  r(20,28,40,2,'#b07840');
  r(20,48,40,2,'#6a3818');
  r(16,28,2,22,'#6a3818');
  r(58,28,2,22,'#6a3818');
  r(22,34,36,14,'#d4b888');r(24,36,32,10,'#e0c898');r(26,38,10,4,'#ece0b0');
  for(let i=0;i<5;i++) r(24+i*6,40,3,2,'rgba(0,0,0,0.08)');
  ctx.restore();
}

// ── Pedra de Rio (padrão estático) ───────────────────────────────────────
function drawRiverStone(cx,cy,w=32,h=20,colIdx=0){
  const colors=['#4a6050','#3a5040','#5a7060','#2a4030'];
  ctx.fillStyle=colors[colIdx%colors.length];
  ctx.beginPath();ctx.ellipse(cx,cy,w,h,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(200,240,220,0.2)';
  ctx.beginPath();ctx.ellipse(cx-w*0.2,cy-h*0.3,w*0.3,h*0.2,0,0,Math.PI*2);ctx.fill();
}

// ── Col — item coletável ───────────────────────────────────────────────────
class Col{
  constructor(x,y,type){this.x=x;this.y=y;this.w=34;this.h=34;this.type=type;this.done=false;this.t=Math.random()*Math.PI*2;}
  tick(){if(!this.done)this.t+=0.06;}
  draw(playerX,playerY){
    if(this.done)return;
    const sx=this.x-cam.x,sy=this.y-cam.y;
    if(sx<-60||sx>W+60)return;
    const TOOL_TYPES=['cinzel_bambu','bacia_madeira','placa_jade_ressoante'];
    const isTool=TOOL_TYPES.includes(this.type);
    if(isTool){
      const a=0.25+Math.abs(Math.sin(this.t*0.8))*0.35;
      const glow=ctx.createRadialGradient(sx+17,sy+17,4,sx+17,sy+17,36);
      glow.addColorStop(0,`rgba(100,220,140,${a})`);glow.addColorStop(1,'rgba(100,220,140,0)');
      ctx.fillStyle=glow;ctx.beginPath();ctx.arc(sx+17,sy+17,36,0,Math.PI*2);ctx.fill();
    }
    ctx.save();ctx.translate(sx+this.w/2,sy+this.h/2);
    if(this.type==='cinzel_bambu')             drawCinzelItem(0,0,this.t);
    else if(this.type==='bacia_madeira')        drawBaciaItem(0,0,this.t);
    else if(this.type==='placa_jade_ressoante') drawPlacaItem(0,0,this.t);
    else if(this.type==='bracelete_imperial')   drawBracaleteItem(0,0,this.t);
    ctx.restore();
    if(isTool&&playerX!==undefined){
      const dist=Math.hypot(playerX+20-(this.x+17),playerY+40-(this.y+17));
      if(dist<110){
        const labels={cinzel_bambu:'🎋 Cinzel de Bambu',bacia_madeira:'🥌 Bacia de Madeira',placa_jade_ressoante:'▦  Placa Ressoante'};
        const txt=`[E] Pegar ${labels[this.type]||this.type}`;
        const pulse=0.7+Math.sin(Date.now()/300)*0.3;
        ctx.font='bold 13px "Courier New"';
        const tw=ctx.measureText(txt).width+20;
        const bx=Math.max(6,Math.min(sx+17-tw/2,W-tw-6)),by=Math.min(sy-42,playerY-cam.y-68-8);
        ctx.fillStyle=`rgba(2,10,6,${0.88*pulse})`;roundRect(bx,by,tw,24,5);ctx.fill();
        ctx.strokeStyle=`rgba(100,220,140,${pulse})`;ctx.lineWidth=1.5;roundRect(bx,by,tw,24,5);ctx.stroke();
        ctx.fillStyle=`rgba(140,240,180,${pulse})`;
        ctx.textAlign='center';ctx.fillText(txt,bx+tw/2,by+16);ctx.textAlign='left';
      }
    }
  }
}

// ── Artefatos Regionais (colecionáveis de cena — NÃO são itens de diário) ──
// Cada cena tem um colecionável diferente, ligado ao contexto regional do
// roteiro (Vale de Hpakant / Mianmar). Servem só para "dar sentido" ao
// mundo — não entram no Diário de Bordo [I] nem no inventário de ferramentas.
const ARTIFACT_DEFS={
  1:{idPrefix:'artefato_pena',    icon:'🪶',label:'Pena de Calau',        total:3,hex:'#e8b860',rgb:'232,184,96', flavor:'O calau sobrevoa o vale — ave sagrada da floresta de Kachin.'},
  2:{idPrefix:'artefato_nefrita', icon:'💠',label:'Seixo de Nefrita',     total:3,hex:'#68b8d0',rgb:'104,184,208',flavor:'Nefrita — "o outro jade". Mais comum, ainda assim reverenciada.'},
  3:{idPrefix:'jadeia_',          icon:'💚',label:'Jadeíta',              total:3,hex:'#50d090',rgb:'80,208,144', flavor:null}, // mecânica principal — já coletada via teste de sonoridade
  4:{idPrefix:'artefato_quartzo', icon:'✨',label:'Grão de Quartzo',      total:3,hex:'#e8e0a0',rgb:'232,224,160',flavor:'Abrasivo de quartzo — usado para a lapidação final do jade.'},
};

class Artifact{
  constructor(x,y,level){this.x=x;this.y=y;this.w=28;this.h=28;this.done=false;this.t=Math.random()*Math.PI*2;this.level=level;}
  tick(){if(!this.done)this.t+=0.045;}
  draw(playerX,playerY){
    if(this.done)return;
    const sx=this.x-cam.x,sy=this.y-cam.y;
    if(sx<-60||sx>W+60)return;
    const def=ARTIFACT_DEFS[this.level]||ARTIFACT_DEFS[1];
    const bob=Math.sin(this.t)*6;
    const a=0.28+Math.abs(Math.sin(this.t*0.8))*0.32;
    const cx=sx+this.w/2,cy=sy+this.h/2+bob;
    const glow=ctx.createRadialGradient(cx,cy,4,cx,cy,28);
    glow.addColorStop(0,`rgba(${def.rgb},${a})`);glow.addColorStop(1,`rgba(${def.rgb},0)`);
    ctx.fillStyle=glow;ctx.beginPath();ctx.arc(cx,cy,28,0,Math.PI*2);ctx.fill();
    ctx.font='22px "Courier New"';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(def.icon,cx,cy);ctx.textAlign='left';ctx.textBaseline='alphabetic';
  }
}

// ── Trigger ────────────────────────────────────────────────────────────────
class Trigger{
  constructor(x,y,w,h,label,fn,auto=false){this.x=x;this.y=y;this.w=w;this.h=h;this.label=label;this.fn=fn;this.done=false;this.auto=auto;}
  draw(px,py){
    if(this.done||this.auto)return;
    const near=Math.abs((px+24)-(this.x+this.w/2))<this.w/2+72&&Math.abs((py+40)-(this.y+this.h/2))<this.h/2+72;
    if(!near)return;
    const sx=this.x+this.w/2-cam.x,sy=Math.min(this.y-cam.y-26+Math.sin(Date.now()/350)*4,py-cam.y-68-8);
    const txt='[E] '+this.label;ctx.font='14px "Courier New"';
    const tw=ctx.measureText(txt).width+24;
    const bx=Math.max(6,Math.min(sx-tw/2,W-tw-6));
    const tcx=bx+tw/2;
    ctx.fillStyle='rgba(0,0,0,0.82)';roundRect(bx,sy-16,tw,24,4);ctx.fill();
    ctx.strokeStyle='#60c080';ctx.lineWidth=1.5;roundRect(bx,sy-16,tw,24,4);ctx.stroke();
    ctx.fillStyle='#60c080';ctx.textAlign='center';ctx.fillText(txt,tcx,sy);ctx.textAlign='left';
  }
}

// ── Texto com quebra de linha ──────────────────────────────────────────────
function wrapText(text,maxW){
  ctx.font='15px "Courier New"';
  const pars=text.split('\n'),result=[];
  for(const para of pars){
    const words=para.split(' ');let line='';
    for(const w of words){const test=line?line+' '+w:w;if(ctx.measureText(test).width>maxW&&line){result.push(line);line=w;}else line=test;}
    if(line)result.push(line);
  }return result;
}

// ── Diálogo ────────────────────────────────────────────────────────────────
const BUBBLE={
  active:false,queue:[],cb:null,lines:[],speakerTxt:'CORVAN',speakerColor:'#a0d870',faceFrame:0,
  show(msgs,cb,speaker='CORVAN',color='#a0d870'){this.queue=[...msgs];this.cb=cb;this.active=true;this.speakerTxt=speaker;this.speakerColor=color;G.dialog=true;this._next();},
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
    ctx.fillStyle='rgba(2,10,4,0.96)';roundRect(bx,by,bubW,bubH,14);ctx.fill();
    ctx.shadowBlur=0;
    ctx.strokeStyle=this.speakerColor;ctx.lineWidth=2.5;roundRect(bx,by,bubW,bubH,14);ctx.stroke();
    ctx.strokeStyle='rgba(100,200,120,0.2)';ctx.lineWidth=1;roundRect(bx+4,by+4,bubW-8,bubH-8,10);ctx.stroke();
    const tbx=Math.max(bx+30,Math.min(pcx,bx+bubW-30));
    const tty=by+bubH,tipy=Math.min(pcy,tty+38);
    ctx.fillStyle='rgba(2,10,4,0.96)';ctx.beginPath();ctx.moveTo(tbx-14,tty);ctx.lineTo(tbx+14,tty);ctx.lineTo(pcx,tipy);ctx.closePath();ctx.fill();
    ctx.strokeStyle=this.speakerColor;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(tbx-14,tty);ctx.lineTo(pcx,tipy);ctx.lineTo(tbx+14,tty);ctx.stroke();
    const fx=bx+facePad,fy=by+pad;
    ctx.fillStyle='rgba(4,14,8,0.85)';roundRect(fx,fy,faceW,faceH,6);ctx.fill();
    ctx.strokeStyle='rgba(100,200,120,0.45)';ctx.lineWidth=1.5;roundRect(fx,fy,faceW,faceH,6);ctx.stroke();
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
    ctx.fillStyle='rgba(100,200,120,0.35)';ctx.fillRect(tx,by+pad+20,textW,1);
    ctx.font='15px "Courier New"';ctx.fillStyle='#e8f8e8';
    this.lines.forEach((l,i)=>ctx.fillText(l,tx,by+pad+40+i*lineH));
    const pulse=0.5+Math.sin(Date.now()/400)*0.5;
    ctx.fillStyle=`rgba(100,200,120,${pulse})`;ctx.font='12px "Courier New"';
    ctx.textAlign='right';ctx.fillText('[E] Continuar →',bx+bubW-pad,by+bubH-10);ctx.textAlign='left';
  }
};
function showDialog(msgs,cb,speaker='CORVAN',color='#a0d870'){BUBBLE.show(msgs,cb,speaker,color);}
function checkDlg(){if(G.dialog&&!INV.open&&isE())BUBBLE.advance();}

// ── Popup educativo ────────────────────────────────────────────────────────
let popup={active:false,timer:0,title:'',lines:[],color:'#70e8c0'};
function showPopup(title,lines,color,ms=6500){popup={active:true,timer:ms,title,lines,color};}
function tickPopup(){if(popup.active&&popup.timer>0){popup.timer-=16;if(popup.timer<=0)popup.active=false;}}
function drawPopup(){
  if(!popup.active)return;
  const al=Math.min(1,popup.timer/400);ctx.save();ctx.globalAlpha=al;
  const pw=340,padX=16,bulletIndent=14,lineH=20;
  // Quebra de linha: cada bullet vira 1+ linhas conforme largura disponível
  ctx.font='12px "Courier New"';
  const maxTextW=pw-(padX*2)-bulletIndent;
  const rows=[];
  popup.lines.forEach(raw=>{
    const words=raw.split(' ');let line='',first=true;
    for(const w of words){
      const test=line?line+' '+w:w;
      if(ctx.measureText(test).width>maxTextW&&line){rows.push({text:line,bullet:first});line=w;first=false;}
      else line=test;
    }
    if(line)rows.push({text:line,bullet:first});
  });
  const ph=rows.length*lineH+80;
  const px=W-pw-18,py=56;
  ctx.fillStyle='rgba(2,10,4,0.94)';roundRect(px,py,pw,ph,10);ctx.fill();
  ctx.strokeStyle=popup.color;ctx.lineWidth=2;roundRect(px,py,pw,ph,10);ctx.stroke();
  ctx.strokeStyle='rgba(100,200,140,0.2)';ctx.lineWidth=1;roundRect(px+4,py+4,pw-8,ph-8,7);ctx.stroke();
  ctx.font='bold 13px "Courier New"';ctx.fillStyle=popup.color;ctx.textAlign='center';ctx.fillText(popup.title,px+pw/2,py+22);
  ctx.fillStyle='rgba(100,200,140,0.12)';ctx.fillRect(px+14,py+30,pw-28,1);
  ctx.font='12px "Courier New"';ctx.fillStyle='#e0f0e0';ctx.textAlign='left';
  rows.forEach((r,i)=>{
    const prefix=r.bullet?'• ':'  ';
    ctx.fillText(prefix+r.text,px+padX,py+48+i*lineH);
  });
  ctx.textAlign='left';ctx.restore();
}

let notifText='',notifAlpha=0,notifTimer=0;
function notify(msg,ms=2800){notifText=msg;notifTimer=ms;notifAlpha=1;}
function tickNotif(){if(notifTimer>0){notifTimer-=16;if(notifTimer<=0)notifAlpha=0;else notifAlpha=Math.min(1,notifTimer/300);}}
function drawNotif(){
  if(notifAlpha<=0)return;ctx.save();ctx.globalAlpha=notifAlpha;ctx.font='14px "Courier New"';
  const tw=ctx.measureText(notifText).width+32,nx=(W-tw)/2,ny=46;
  ctx.fillStyle='rgba(2,10,4,0.88)';roundRect(nx,ny,tw,28,6);ctx.fill();
  ctx.strokeStyle='#60c080';ctx.lineWidth=1.5;roundRect(nx,ny,tw,28,6);ctx.stroke();
  ctx.fillStyle='#a0e0b0';ctx.textAlign='center';ctx.fillText(notifText,W/2,ny+19);ctx.textAlign='left';
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════════════════
// ── MECÂNICA CENTRAL: Teste de Sonoridade ──────────────────────────────────
// Exibe 8 pedras candidatas, o jogador compara ondas sonoras com a placa ref.
// ═══════════════════════════════════════════════════════════════════════════
function drawSonicOverlay(sonic){
  if(!sonic)return;
  ctx.fillStyle='rgba(0,0,0,0.68)';ctx.fillRect(0,0,W,H);
  const pw=700,ph=260,px=(W-pw)/2,py=H/2-ph/2-30;
  ctx.shadowColor='rgba(0,0,0,0.8)';ctx.shadowBlur=20;
  ctx.fillStyle='rgba(2,12,6,0.97)';roundRect(px,py,pw,ph,14);ctx.fill();
  ctx.shadowBlur=0;
  ctx.strokeStyle='#50d080';ctx.lineWidth=2.5;roundRect(px,py,pw,ph,14);ctx.stroke();
  ctx.strokeStyle='rgba(80,220,120,0.2)';ctx.lineWidth=1;roundRect(px+4,py+4,pw-8,ph-8,10);ctx.stroke();
  ctx.font='bold 14px "Courier New"';ctx.fillStyle='#80e8a0';
  ctx.textAlign='center';ctx.fillText('TESTE DE SONORIDADE — DIAGNÓSTICO AUDITIVO',W/2,py+24);
  ctx.fillStyle='rgba(80,220,120,0.3)';ctx.fillRect(px+16,py+32,pw-32,1);
  const hasPlaca=G.player&&G.player.items.includes('placa_jade_ressoante');
  ctx.font='12px "Courier New"';
  ctx.fillStyle=hasPlaca?'#80e8a0':'#f0c860';
  ctx.fillText(
    hasPlaca?'🟩 Placa Ressoante equipada — compare a onda de cada pedra com a referência  [P] Ouvir placa':'⚠ Equipe a Placa de Jade Ressoante para comparar sonoridade!',
    W/2,py+50);
  ctx.textAlign='left';
  // Onda de referência (jade)
  const refX=px+16,refY=py+80,refW=140,refH=40;
  ctx.fillStyle='rgba(40,120,70,0.3)';roundRect(refX,refY,refW,refH,4);ctx.fill();
  ctx.strokeStyle='rgba(80,200,120,0.5)';ctx.lineWidth=1;roundRect(refX,refY,refW,refH,4);ctx.stroke();
  ctx.font='10px "Courier New"';ctx.fillStyle='#70d090';ctx.textAlign='center';
  ctx.fillText('REFERÊNCIA — JADEÍTA',refX+refW/2,refY-4);ctx.textAlign='left';
  // Onda sustentada e clara (jade)
  const t=Date.now()/400;
  ctx.strokeStyle='#40e890';ctx.lineWidth=2;ctx.beginPath();
  for(let i=0;i<refW;i++){
    const fx=refX+i;
    const fy=refY+refH/2+Math.sin((i/refW)*Math.PI*6+t)*16*Math.exp(-i/refW*1.5);
    i===0?ctx.moveTo(fx,fy):ctx.lineTo(fx,fy);
  }ctx.stroke();
  // Slots de pedras candidatas
  const slotCount=sonic.slots.length;
  const slotW=140,slotH=110,slotGap=14;
  const totalW=slotCount*slotW+(slotCount-1)*slotGap;
  const startX=px+(pw-totalW)/2+80;
  while(sonic.cursor<slotCount&&sonic.slots[sonic.cursor].consumed)sonic.cursor++;
  sonic.slots.forEach((slot,i)=>{
    const sx=startX+i*(slotW+slotGap),sy=py+65;
    const selected=(i===sonic.cursor&&!slot.consumed);
    if(slot.consumed){
      ctx.fillStyle='rgba(8,8,8,0.5)';roundRect(sx,sy,slotW,slotH,8);ctx.fill();
      ctx.strokeStyle='rgba(50,50,50,0.4)';ctx.lineWidth=1;roundRect(sx,sy,slotW,slotH,8);ctx.stroke();
      ctx.fillStyle='rgba(80,80,80,0.4)';ctx.font='12px "Courier New"';
      ctx.textAlign='center';ctx.fillText('— testada —',sx+slotW/2,sy+slotH/2+5);ctx.textAlign='left';
      return;
    }
    ctx.fillStyle=selected?'rgba(50,140,80,0.22)':'rgba(8,20,12,0.7)';
    roundRect(sx,sy,slotW,slotH,8);ctx.fill();
    ctx.strokeStyle=selected?'#60d890':'rgba(40,100,60,0.4)';ctx.lineWidth=selected?2:1;
    roundRect(sx,sy,slotW,slotH,8);ctx.stroke();
    // Miniatura visual da pedra
    ctx.save();ctx.translate(sx+slotW/2,sy+28);
    if(hasPlaca){
      if(slot.isJade) drawJadeItem(0,0,Date.now()/800,slot.variety||'verde');
      else if(slot.type==='quartzito') drawQuartzitoItem(0,0,Date.now()/700+i);
      else            drawSerpentinitaItem(0,0,Date.now()/700+i);
    } else {
      // Sem placa: pedra ambígua verde genérica
      ctx.fillStyle='rgba(60,100,70,0.7)';ctx.beginPath();ctx.ellipse(0,0,14,10,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='rgba(100,160,110,0.5)';ctx.beginPath();ctx.arc(-4,-3,5,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
    // Onda sonora da pedra
    const waveY=sy+64,waveX=sx+10,waveW=slotW-20;
    if(hasPlaca){
      if(slot.isJade){
        // Onda jade: longa e musical
        const tw=Date.now()/400+i*0.8;
        ctx.strokeStyle='#40e890';ctx.lineWidth=1.5;ctx.beginPath();
        for(let j=0;j<waveW;j++){
          const fy=waveY+8+Math.sin((j/waveW)*Math.PI*5+tw)*12*Math.exp(-j/waveW*2.5);
          j===0?ctx.moveTo(waveX+j,fy):ctx.lineTo(waveX+j,fy);
        }ctx.stroke();
        ctx.font='bold 11px "Courier New"';ctx.fillStyle='#60e8a0';
        ctx.textAlign='center';ctx.fillText('🎵 Ressoa — JADE',sx+slotW/2,sy+slotH-10);
      } else {
        // Onda do falso jade: curta e morta — leve variação por pedra (fase e
        // cor) para que duas pedras "não-jade" no mesmo teste não pareçam
        // cópias idênticas uma da outra.
        const isQuartzito=slot.type==='quartzito';
        const tf=Date.now()/500+i*1.3;
        ctx.strokeStyle=isQuartzito?'#9098a8':'#808870';ctx.lineWidth=1.5;ctx.beginPath();
        for(let j=0;j<waveW;j++){
          const exp=Math.exp(-j/waveW*8);
          const fy=waveY+8+Math.sin((j/waveW)*Math.PI*2+(isQuartzito?tf*0.15:0))*8*exp;
          j===0?ctx.moveTo(waveX+j,fy):ctx.lineTo(waveX+j,fy);
        }ctx.stroke();
        ctx.font='bold 11px "Courier New"';ctx.fillStyle=isQuartzito?'#a0a8b0':'#909880';
        const nome=isQuartzito?'Quartzito':'Serpentinita';
        ctx.textAlign='center';ctx.fillText(`— Sem eco — ${nome}`,sx+slotW/2,sy+slotH-10);
      }
    } else {
      ctx.strokeStyle='rgba(100,140,110,0.5)';ctx.lineWidth=1;ctx.beginPath();
      ctx.moveTo(waveX,waveY+8);ctx.lineTo(waveX+waveW,waveY+8);ctx.stroke();
      ctx.font='11px "Courier New"';ctx.fillStyle='#608070';
      ctx.textAlign='center';ctx.fillText('? ? ?',sx+slotW/2,sy+slotH-10);
    }
    ctx.textAlign='left';
  });
  // Controles
  const hintA=0.6+Math.sin(Date.now()/400)*0.4;
  ctx.font='12px "Courier New"';ctx.fillStyle=`rgba(100,200,140,${hintA})`;
  ctx.textAlign='center';
  ctx.fillText('[← →] Selecionar pedra   [E] Testar / Coletar   [P] Ouvir referência   [Esc] Fechar',W/2,py+ph-12);
  ctx.textAlign='left';
}

// ── Paredes de Pedra (pedras do leito do rio para mineração) ───────────────
class RiverStoneWall{
  constructor(x,y,jadeVariety){
    this.x=x;this.y=y;this.w=52;this.h=72;
    this.jadeVariety=jadeVariety;
    this.state='intact';
    this.done=false;this.glowT=Math.random()*Math.PI*2;
    this.slots=this._makeSlots();
  }
  _makeSlots(){
    // 1 jadeíta + 2 "falsos jades" — variados entre serpentinita e quartzito
    // (as duas pedras impostoras historicamente mais confundidas com jade)
    // para não parecerem duas cópias idênticas da mesma pedra no teste.
    const falsos=['serpentinita','quartzito'];
    const f1=falsos[Math.floor(Math.random()*falsos.length)];
    let f2=falsos[Math.floor(Math.random()*falsos.length)];
    if(f2===f1&&Math.random()<0.7)f2=falsos.find(f=>f!==f1); // prioriza variedade
    const arr=[
      {type:'jade_'+this.jadeVariety,isJade:true,variety:this.jadeVariety,consumed:false},
      {type:f1,isJade:false,consumed:false},
      {type:f2,isJade:false,consumed:false},
    ];
    for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}
    return arr;
  }
  tick(){this.glowT+=0.035;}
  draw(){
    if(this.done)return;
    const sx=this.x-cam.x,sy=this.y-cam.y;
    if(sx<-120||sx>W+120)return;
    const a=this.state==='cinzelado'?0.4:(0.5+Math.abs(Math.sin(this.glowT))*0.4);
    // Pedra de rio com veias translúcidas
    ctx.fillStyle=this.state==='cinzelado'?`rgba(30,60,40,${a})`:`rgba(40,80,55,${a})`;
    ctx.fillRect(sx,sy,this.w,this.h);
    if(this.state==='intact'){
      // Veias de jade visíveis
      ctx.strokeStyle=`rgba(80,200,120,${a*0.7})`;ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(sx+8,sy+10);ctx.quadraticCurveTo(sx+26,sy+28,sx+20,sy+58);ctx.stroke();
      ctx.beginPath();ctx.moveTo(sx+28,sy+6);ctx.quadraticCurveTo(sx+40,sy+36,sx+34,sy+62);ctx.stroke();
      // Musgo verde na superfície
      ctx.fillStyle=`rgba(40,140,70,${a*0.5})`;
      ctx.fillRect(sx+2,sy,this.w-4,6);
      ctx.fillRect(sx,sy+2,4,this.h-4);
      // Brilho cristalino
      const cg=ctx.createRadialGradient(sx+26,sy+36,4,sx+26,sy+36,40);
      cg.addColorStop(0,`rgba(80,220,130,${a*0.2})`);cg.addColorStop(1,'rgba(80,220,130,0)');
      ctx.fillStyle=cg;ctx.fillRect(sx-10,sy-10,this.w+20,this.h+20);
    } else {
      // Após cinzelada: rachaduras
      ctx.strokeStyle='rgba(20,60,35,0.8)';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(sx+10,sy);ctx.lineTo(sx+18,sy+26);ctx.lineTo(sx+12,sy+52);ctx.stroke();
      ctx.beginPath();ctx.moveTo(sx+32,sy+12);ctx.lineTo(sx+24,sy+40);ctx.stroke();
    }
    // Label de interação
    const ha=0.5+Math.sin(Date.now()/400)*0.5;
    ctx.fillStyle=`rgba(140,240,180,${ha*0.9})`;ctx.font='bold 11px "Courier New"';
    ctx.textAlign='center';
    if(this.state==='intact'){
      ctx.fillText('[E] Cinzelar Pedra',sx+this.w/2,sy-28);
      ctx.font='10px "Courier New"';ctx.fillStyle=`rgba(100,200,140,${ha*0.7})`;
      ctx.fillText('🎋 Cinzel necessário',sx+this.w/2,sy-14);
    } else {
      ctx.fillText('[E] Testar Sonoridade',sx+this.w/2,sy-28);
      ctx.font='10px "Courier New"';ctx.fillStyle=`rgba(100,200,140,${ha*0.7})`;
      ctx.fillText('🟩 Placa Ressoante necessária',sx+this.w/2,sy-14);
    }
    ctx.textAlign='left';
  }
}

// ── Exposição geológica (formação de jade in situ) ─────────────────────────
class JadeExposition{
  constructor(x,y,type){this.x=x;this.y=y;this.type=type;this.examined=false;this.glowT=0;}
  tick(){this.glowT+=0.03;}
  examine(){if(!this.examined){this.examined=true;sfx('cinzel_jade');burst(this.x,this.y-10,'#60e890',10,2.5);}}
  draw(){
    const sx=this.x-cam.x,sy=this.y-cam.y;
    if(sx<-100||sx>W+100)return;
    const a=this.examined?0.3:(0.5+Math.abs(Math.sin(this.glowT))*0.4);
    ctx.fillStyle=`rgba(30,90,55,${a})`;
    ctx.beginPath();
    ctx.moveTo(sx-24,sy);ctx.lineTo(sx-12,sy-26);ctx.lineTo(sx+6,sy-32);
    ctx.lineTo(sx+22,sy-22);ctx.lineTo(sx+26,sy+8);ctx.lineTo(sx+12,sy+14);
    ctx.lineTo(sx-18,sy+12);ctx.closePath();ctx.fill();
    // Veia de jade translúcida
    ctx.fillStyle=`rgba(60,200,110,${a*0.8})`;
    ctx.beginPath();ctx.ellipse(sx+2,sy-10,12,16,0.2,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=`rgba(160,255,200,${a*0.9})`;
    ctx.beginPath();ctx.arc(sx-6,sy-18,4,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(sx+14,sy-12,3,0,Math.PI*2);ctx.fill();
    if(!this.examined){
      const ha=0.5+Math.sin(Date.now()/400)*0.5;
      ctx.fillStyle=`rgba(120,240,160,${ha*0.9})`;ctx.font='bold 12px "Courier New"';
      ctx.textAlign='center';ctx.fillText('[E] Examinar Formação',sx,sy-44);ctx.textAlign='left';
    } else {
      ctx.fillStyle='rgba(100,200,130,0.6)';ctx.font='11px "Courier New"';
      ctx.textAlign='center';ctx.fillText('✔ Examinada',sx,sy-38);ctx.textAlign='left';
    }
  }
}

// ── Contador de erros sonoridade ───────────────────────────────────────────
let wrongPicks=0,sonicHintShown=false;

// ── Player ─────────────────────────────────────────────────────────────────
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
    if(INV.open){INV.navigate(this);return;}

    // ── Modo Sonoridade ──────────────────────────────────────────────────
    if(G.sonicMode){
      const sonic=G.sonicMode;
      const active=sonic.slots.filter(s=>!s.consumed);
      if(active.length===0){G.sonicMode=null;G.dialog=false;return;}
      if(isL()){do{sonic.cursor=(sonic.cursor+2)%3;}while(sonic.slots[sonic.cursor].consumed);return;}
      if(isR()){do{sonic.cursor=(sonic.cursor+1)%3;}while(sonic.slots[sonic.cursor].consumed);return;}
      if(isE()){
        const slot=sonic.slots[sonic.cursor];
        if(slot&&!slot.consumed){
          slot.consumed=true;
          if(slot.isJade){
            // Coleta correta de jade
            const itemId='jadeia_'+slot.variety;
            this.items.push(itemId);this.score+=60;
            journalCollect(itemId);sfx('jade');
            burst(this.x+20,this.y,'#60e890',14,3.5);
            burst(this.x+20,this.y,'#e0fff0',10,2.5);
            const nomes={verde:'Jadeíta Verde-Imperial',lavanda:'Jadeíta Lavanda-Pálido',branca:'Jadeíta Branco-Translúcida'};
            notify(`💚 ${nomes[slot.variety]||'Jadeíta'} coletada! "Esta pedra canta."`)
            showPopup('💚 JADEÍTA COLETADA',
              ['NaAlSi₂O₆ — piroxênio, não silicato simples',
               'Dureza 6.5–7 Mohs. Alta pressão + baixa temperatura',
               'Formada onde a placa indiana mergulha sob a Eurásia',
               'Ressoa como sino — a "voz da pedra" dos Kachin'],
              '#70e8c0');
            sonic.wall.done=true;G.sonicMode=null;G.dialog=false;
          } else {
            // Falso jade (serpentinita ou quartzito) — erro: apenas feedback, sem custo de vida
            wrongPicks++;sfx('cinzel_serpentina');
            burst(this.x+20,this.y,'#909870',8,2);
            const nomeFalso=slot.type==='quartzito'?'Quartzito':'Serpentinita';
            notify(`❌ "Esta não canta." — ${nomeFalso} descartado(a).`);
            if(wrongPicks>=2&&!sonicHintShown){
              sonicHintShown=true;
              const sv=G.sonicMode;
              G.sonicMode=null;
              setTimeout(()=>showDialog([
                '"Observe a forma da onda. A jadeíta produz um som sustentado — a onda oscila por mais de um segundo, como um sino. A serpentinita morre imediatamente: sem eco, sem sustain."',
                '"Os lapidários Kachin chamam essa qualidade de \'voz da pedra\'. Equipe a Placa Ressoante no Diário [I] para ver as ondas comparadas."',
              ],()=>{if(sv&&!sv.wall.done)G.sonicMode=sv;}),400);
            }
            const remaining=sonic.slots.filter(s=>!s.consumed);
            if(remaining.length===1&&remaining[0].isJade){
              remaining[0].consumed=true;
              const itemId='jadeia_'+remaining[0].variety;
              this.items.push(itemId);this.score+=60;
              journalCollect(itemId);sfx('jade');
              burst(this.x+20,this.y,'#60e890',14,3.5);
              const nomes2={verde:'Jadeíta Verde-Imperial',lavanda:'Jadeíta Lavanda-Pálido',branca:'Jadeíta Branco-Translúcida'};
              notify(`💚 ${nomes2[remaining[0].variety]||'Jadeíta'} por eliminação!`);
              sonic.wall.done=true;G.sonicMode=null;G.dialog=false;
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

    if(this.onG)this.coyote=5;else if(this.coyote>0)this.coyote--;
    if(isJ())this.jbuf=7;if(this.jbuf>0)this.jbuf--;
    if(this.jbuf>0&&(this.onG||this.coyote>0)){this.vy=JUMPF;this.onG=false;this.coyote=0;this.jbuf=0;sfx('jump');}

    if(this.onMoving){this.x+=this.onMoving.vx||0;this.y+=this.onMoving.vy||0;}
    this.onMoving=null;
    this.vy=Math.min(this.vy+GRAV,MAXFALL);
    this.x+=this.vx;this._colX(level.plats);
    this.onG=false;this.y+=this.vy;this._colY(level.plats);
    this.x=Math.max(0,this.x);

    if(!this.inv){
      // Espinho: 1 coração por toque, igual ao padrão das demais fases (era 2,
      // tirando 2/3 da vida numa única encostada).
      for(const p of level.plats){if(p.type==='spike'&&this.overlaps(p))this._hurt(1,level,'espinho');}
    }
    if(this.inv>0)this.inv--;if(this.interactAnim>0)this.interactAnim--;

    // Artefatos regionais de cena — coleta automática ao passar perto, sem tecla e sem alerta.
    // NÃO entram no Diário de Bordo: só somam na contagem do canto superior direito.
    if(level.artifacts){
      for(const art of level.artifacts){
        if(art.done)continue;
        if(!this.overlaps({x:art.x-10,y:art.y-10,w:art.w+20,h:art.h+20}))continue;
        art.done=true;
        const def=ARTIFACT_DEFS[level.num]||ARTIFACT_DEFS[1];
        this.items.push(def.idPrefix+'_'+Math.round(art.x));
        this.score+=15;sfx('artefato');
        burst(art.x+14,art.y+14,def.hex,10,2.2);
      }
    }

    if(isE()){
      // Coleta de ferramentas
      const TOOL_TYPES=['cinzel_bambu','bacia_madeira'];
      for(const c of level.cols||[]){
        if(c.done||!TOOL_TYPES.includes(c.type))continue;
        if(!this.near({x:c.x,y:c.y,w:c.w,h:c.h},90))continue;
        c.done=true;
        if(c.type==='cinzel_bambu'){
          this.items.push('cinzel_bambu');this.activeTools.add('cinzel_bambu');sfx('item');
          burst(c.x+17,c.y+17,'#a0a040',12);journalCollect('cinzel_bambu');
          showPopup('🎋 CINZEL DE BAMBU ENDURECIDO',['Bambu queimado ao fogo — ponta oblíqua','Mais duro que jade superficial, gentil o suficiente','O metal fraturaria o bloco — o bambu extrai inteiro','Use [E] próximo às pedras do rio com veias verdes'],'#c0c860');
          notify('✦ Cinzel de Bambu! Equipe-o no Diário [I].');
        } else if(c.type==='bacia_madeira'){
          this.items.push('bacia_madeira');sfx('item');
          burst(c.x+17,c.y+17,'#a08060',10);journalCollect('bacia_madeira');
          showPopup('BACIA DE MADEIRA COM AREIA',['Teca com areia fina — estabiliza blocos de jade','Sem a bacia o som se perde na pedra do rio','Use antes de aplicar o teste de sonoridade','Combine com a Placa Ressoante para diagnóstico completo'],'#c09870');
          notify('✦ Bacia coletada! Busque o Tigre para a Placa →');
        }
        break;
      }

      // Tigre-de-Indochina dá a Placa Ressoante
      if(level.tigre&&!level.tigre.gifted&&this.near({x:level.tigre.x-60,y:level.tigre.y-80,w:120,h:80})){
        level.tigre.gifted=true;sfx('tigre');
        for(let i=0;i<16;i++)burst(level.tigre.x,level.tigre.y-30,'#60e890',1,2+Math.random()*2);
        if(level.tigre.isGuide){
          // Cena 4: tigre guia para oficina final
          showDialog([
            '"O Tigre-de-Indochina descansa sobre uma rocha plana no leito do rio — o felino sagrado das tradições budistas e animistas de Mianmar. Ele te olha por um segundo longo."',
            '"Segue-o. Ele conhece o caminho até a oficina do lapidário."',
          ],()=>{notify('✦ Siga o tigre até a oficina do lapidário!')},'CORVAN','#a0d870');
        } else {
          // Cena 1: tigre dá a Placa Ressoante
          this.items.push('placa_jade_ressoante');this.activeTools.add('placa_jade_ressoante');journalCollect('placa_jade_ressoante');
          showDialog([
            '"O Tigre-de-Indochina. Panthera tigris corbetti — hoje criticamente ameaçado, com menos de 200 indivíduos na natureza. No século XIII, era o predador dominante desta floresta."',
            '"Ele descansava sobre a Placa de Jade Ressoante — uma placa fina de jadeíta usada pelos lapidários Kachin como referência sonora. Ao percutir levemente, ela produz um Mi natural: 659 Hz."',
            '"Esta é a ferramenta diagnóstica mais importante desta fase. Bata levemente em qualquer pedra candidata e compare o som com esta placa: jadeíta ressoa com o mesmo tom. Serpentinita soa morta."',
          ],()=>{
            notify('✦ Placa Ressoante! Use [P] no teste de sonoridade para ouvir a referência.');
            // Popup só aparece depois do balão de diálogo fechar, para não sobrepor
            showPopup('🟩 PLACA DE JADE RESSOANTE',['Produz Mi natural (659 Hz) ao ser percutida','Jadeíta: tom sustentado por 1-2 segundos','Serpentinita: som morto, sem eco, sem sustain','Pressione [P] durante o teste para ouvir'],'#70e8b0');
          },'CORVAN','#a0d870');
        }
      }

      // Exposições geológicas
      if(level.expositions){
        for(const ex of level.expositions){
          if(!ex.examined&&this.near({x:ex.x-28,y:ex.y-28,w:56,h:56})){
            if(!G.dialog){
              ex.examine();
              const cnt=level.expositions.filter(e=>e.examined).length;
              const tot=level.expositions.length;
              if(cnt===1)showPopup('💚 JADEÍTA — NaAlSi₂O₆',['Piroxênio — diferente da nefrita (anfibólio)','Zona de subducção: placa indiana → Eurásia','Verde por cromo; lavanda por Fe/Mn; branca pura','"Imperial Green" > US$ 10M por bracelete hoje'],'#70e8c0');
              else if(ex.type==='serpentinite')showPopup('⬜ SERPENTINITA — O FALSO JADE',['Mineral metamórfico verde, mais macio (3-4 Mohs)','Brilho resinoso ou ceroso vs. vítreo do jade','Som morto ao percutir — nenhuma ressonância','70% do "jade" vendido historicamente era serpentinita'],'#909880');
              if(cnt===tot&&!level._expDialogDone){
                level._expDialogDone=true;
                showDialog([
                  '"A jadeíta se forma em condições extremas raras: alta pressão e baixa temperatura nas zonas de subducção. O norte de Mianmar é um dos poucos lugares do planeta com essas condições."',
                  '"A serpentinita — o falso jade — se parece quase idêntica visualmente. A distinção auditiva, porém, é imediata: jadeíta tem uma \'voz\' interna que a serpentinita nunca terá."',
                  '"O rio Uru carrega ambas as pedras, misturadas. O teste de sonoridade é o único diagnóstico confiável sem laboratório moderno — e os lapidários Kachin o usam há milênios."',
                ],(()=>{notify('✦ Busque as pedras do rio para cinzelar e testar!');}));
              }
              notify(`⛰️ Formação examinada! (${cnt}/${tot})`);
            }
            break;
          }
        }
      }

      // Pedras do rio — cinzelar e testar
      if(level.walls&&!G.sonicMode){
        for(const w of level.walls){
          if(w.done)continue;
          if(!this.near({x:w.x,y:w.y,w:w.w,h:w.h},70))continue;
          if(w.state==='intact'){
            if(!this.items.includes('cinzel_bambu')){notify('🎋 Encontre o Cinzel de Bambu primeiro!');break;}
            w.state='cinzelado';sfx('cinzel_jade');shake(4,14);
            burst(w.x+26,w.y+36,'#50d080',12,2.5);
            burst(w.x+26,w.y+36,'#c8e0c8',8,2);
            notify('🎋 Pedra cinzelada! Realize o Teste de Sonoridade [E].');
          } else if(w.state==='cinzelado'){
            if(!this.items.includes('placa_jade_ressoante')){notify('🟩 Encontre a Placa Ressoante primeiro!');break;}
            sfxPlacaReferencia();
            G.sonicMode={wall:w,slots:w.slots,cursor:0};
            G.dialog=true;
          }
          break;
        }
      }

      // Bracelete Imperial (artefato)
      if(level.bracaleteObj&&!level.bracaleteObj.done&&this.near({x:level.bracaleteObj.x-40,y:level.bracaleteObj.y-40,w:80,h:40})){
        level.bracaleteObj.done=true;this.items.push('bracelete_imperial');this.score+=120;sfx('bracelete');
        burst(level.bracaleteObj.x,level.bracaleteObj.y,'#40e890',20,3.5);
        burst(level.bracaleteObj.x,level.bracaleteObj.y,'#e0ffe8',14,2.5);
        journalCollect('bracelete_imperial');this.interactAnim=40;
        showDialog([
          '"O Bracelete de Jade Imperial. Jadeíta verde-esmeralda, polida a espelho, dragões em baixo-relevo. Meses de trabalho de um artesão Kachin usando apenas bambu, areia e água."',
          '"No Palácio Imperial de Pequim, este objeto era tratado como se tivesse nascido pronto — como se o jade fosse um presente da natureza sem mãos humanas. O nome do artesão gravado aqui nunca aparece nos registros imperiais chineses."',
          '"Esta é a história invisível de cada pedra preciosa: o trabalho, o conhecimento, a vida de quem tirou do rio e transformou em algo eterno — e nunca recebeu crédito por isso."',
        ],null,'CORVAN','#a0d870');
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
        // Usa os PÉS (com pequena tolerância), não o centro do corpo, para decidir
        // se ainda estamos "abaixo" da plataforma. Com o centro (h*0.5 = até 40px
        // de folga), o jogador ficava bloqueado de lado no meio do pulo — travava
        // horizontalmente antes mesmo de encostar no topo — e depois "escorregava"
        // de repente quando o centro cruzava a linha. Pés = comportamento previsível.
        if(this.y+this.h<=p.y+4)continue;
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
    const _dispTool=this.activeTools.has('placa_jade_ressoante')?'placa_jade_ressoante':
                    this.activeTools.has('cinzel_bambu')?'cinzel_bambu':
                    this.activeTools.has('bacia_madeira')?'bacia_madeira':null;
    ctx.save();drawCorvan(dx,dy,S,flip,wf,_dispTool);ctx.restore();
    if(this.inv>0&&Math.floor(this.inv/6)%2===0){ctx.fillStyle='rgba(255,60,60,0.35)';ctx.fillRect(this.x-cam.x,this.y-cam.y,this.w,this.h);}
  }
}

// ── Fundo ──────────────────────────────────────────────────────────────────
function drawBg(levelNum,levelW,levelH){
  const skyGrad=ctx.createLinearGradient(0,0,0,H);
  if(levelNum===1){
    // Floresta tropical densa — cobre sol
    skyGrad.addColorStop(0,'#2a4818');skyGrad.addColorStop(0.5,'#3a6028');skyGrad.addColorStop(1,'#1e3010');
  } else if(levelNum===2){
    // Leito do rio Uru — céu parcialmente visível
    skyGrad.addColorStop(0,'#4a8870');skyGrad.addColorStop(0.5,'#2a5840');skyGrad.addColorStop(1,'#162e20');
  } else if(levelNum===3){
    // Oficina do lapidário — interior
    skyGrad.addColorStop(0,'#1e2810');skyGrad.addColorStop(1,'#0e1808');
  } else {
    // Entardecer — laranja com verde
    skyGrad.addColorStop(0,'#e07020');skyGrad.addColorStop(0.4,'#b05018');skyGrad.addColorStop(0.75,'#602808');skyGrad.addColorStop(1,'#301408');
  }
  ctx.fillStyle=skyGrad;ctx.fillRect(0,0,W,H);
  const bgKeys=['bg01','bg02','bg03','bg04'];
  const bgImg=IMG[bgKeys[levelNum-1]];
  if(bgImg){
    const scale=H/bgImg.height;
    const iw=bgImg.width*scale;
    const tilesNeeded=Math.ceil(levelW/iw)+2;
    ctx.save();ctx.globalAlpha=0.9;
    for(let t=0;t<tilesNeeded;t++){
      const bx=-cam.x*0.18+t*iw;
      if(bx>W+iw)break;
      ctx.drawImage(bgImg,bx,0,iw,H);
    }
    ctx.restore();
  }
  // Chuva leve (monção) — cenas 1 e 2
  if(levelNum<=2){
    ctx.save();ctx.globalAlpha=0.12;ctx.strokeStyle='#a0c8c0';ctx.lineWidth=1;
    for(let i=0;i<30;i++){
      const rx=((i*137+Date.now()/20)%W+cam.x*0.05)%W;
      const ry=((i*97+Date.now()/15)%H);
      ctx.beginPath();ctx.moveTo(rx,ry);ctx.lineTo(rx-2,ry+18);ctx.stroke();
    }
    ctx.restore();
  }
}

let dustPts=[];
function spawnDust(levelNum){
  if(Math.random()<0.04){
    const x=cam.x+Math.random()*W;
    const y=Math.random()*H;
    let c='rgba(100,180,120,0.3)';
    if(levelNum===3)c='rgba(180,160,80,0.3)'; // poeira de jade na oficina
    if(levelNum===4)c='rgba(200,120,40,0.35)'; // pó de entardecer
    dustPts.push({x,y,vx:(Math.random()-.5)*0.4,vy:-(Math.random()*0.6+0.1),life:80+Math.random()*60,max:140,c,r:1+Math.random()*2.5});
  }
}
function tickDust(){for(let i=dustPts.length-1;i>=0;i--){const p=dustPts[i];p.x+=p.vx;p.y+=p.vy;p.life--;if(p.life<=0)dustPts.splice(i,1);}if(dustPts.length>60)dustPts.splice(0,5);}
function drawDust(){for(const p of dustPts){ctx.save();ctx.globalAlpha=(p.life/p.max)*0.6;ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x-cam.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.restore();}}

// ── HUD ────────────────────────────────────────────────────────────────────
function drawHUD(player,level){
  if(!player)return;
  // Barra topo — mesmo padrão da Fase 3.1 (altura 38 + linha divisória), desenhada ANTES dos corações
  ctx.fillStyle='rgba(2,12,4,0.85)';ctx.fillRect(0,0,W,38);
  ctx.fillStyle='rgba(80,200,120,0.2)';ctx.fillRect(0,36,W,2);
  // Corações — cor do tema da fase (verde-jade), padrão idêntico à Fase 3.1
  for(let i=0;i<player.maxHp;i++){
    ctx.fillStyle=i<player.hp?'#2ecc71':'#334';
    ctx.beginPath();const hx=16+i*28,hy=10;
    ctx.arc(hx+5,hy+5,5,Math.PI,0);ctx.arc(hx+15,hy+5,5,Math.PI,0);
    ctx.lineTo(hx+20,hy+5);ctx.bezierCurveTo(hx+20,hy+14,hx+10,hy+18,hx+10,hy+18);
    ctx.bezierCurveTo(hx+10,hy+18,hx,hy+14,hx,hy+5);ctx.closePath();ctx.fill();
  }
  const levelTitles=['A Floresta e o Rio','O Leito do Uru','A Câmara de Jade','O Entardecer de Hpakant'];
  const levelNum=(G.currentLevel?G.currentLevel.num:1)-1;
  const levelTitle=levelTitles[levelNum]||'';
  ctx.fillStyle='#d8f0e0';ctx.font='20px "Courier New"';
  ctx.textAlign='center';ctx.fillText(levelTitle,W/2,24);ctx.textAlign='left';
  // Contador do colecionável desta cena (artefato regional — não é item de diário)
  const artDef=ARTIFACT_DEFS[level.num]||ARTIFACT_DEFS[3];
  const artCount=player.items.filter(id=>id.startsWith(artDef.idPrefix)).length;
  ctx.fillStyle=artDef.hex;ctx.font='bold 20px "Courier New"';
  ctx.textAlign='right';ctx.fillText(artDef.icon+' '+artCount+'/'+artDef.total,W-14,26);ctx.textAlign='left';

  // Painel Diário de Bordo — mesmo padrão visual/estrutural da Fase 3.1
  const TOOL_DEFS=[
    {id:'cinzel_bambu',        icon:'🎋',nome:'Cinzel Bambu'},
    {id:'bacia_madeira',       icon:'🥌',nome:'Bacia c/Areia'},
    {id:'placa_jade_ressoante',icon:'🟩',nome:'Placa Ressoante'},
    {id:'bracelete_imperial',  icon:'⭕',nome:'Bracelete Imp.'},
  ];
  const tools=TOOL_DEFS.filter(t=>player.items.includes(t.id));
  const PX=12,PY=46,PW=190,HEADER_H=26;
  const PH=HEADER_H+(tools.length>0?10+tools.length*22:26);
  ctx.save();
  ctx.shadowColor='rgba(0,0,0,0.7)';ctx.shadowBlur=8;
  ctx.fillStyle='rgba(2,12,4,0.88)';roundRect(PX,PY,PW,PH,6);ctx.fill();
  ctx.shadowBlur=0;
  ctx.strokeStyle='#3a9858';ctx.lineWidth=1.5;roundRect(PX,PY,PW,PH,6);ctx.stroke();
  ctx.restore();
  const midX=PX+PW/2,kw=26,kx=PX+PW-kw-6,ky=PY+5;
  ctx.font='11px serif';ctx.fillStyle='#80d090';ctx.fillText('📔',PX+8,PY+20);
  ctx.font='bold 10px "Courier New"';ctx.fillStyle='#80d090';ctx.fillText('DIÁRIO DE BORDO',PX+24,PY+20);
  ctx.fillStyle='rgba(80,200,120,0.2)';roundRect(kx,ky,kw,18,3);ctx.fill();
  ctx.strokeStyle='#80d090';ctx.lineWidth=1;roundRect(kx,ky,kw,18,3);ctx.stroke();
  ctx.font='bold 10px "Courier New"';ctx.fillStyle='#a0d870';ctx.textAlign='center';ctx.fillText('[I]',kx+kw/2,ky+13);ctx.textAlign='left';
  ctx.fillStyle='rgba(80,200,120,0.3)';ctx.fillRect(PX+6,PY+HEADER_H,PW-12,1);
  // Lista de ferramentas — cada item aparece uma única vez; a equipada é destacada
  ctx.textAlign='center';
  if(tools.length>0){
    tools.forEach((t,i)=>{
      const ty=PY+HEADER_H+8+i*22,equipped=player.activeTools.has(t.id);
      ctx.font=(equipped?'bold ':'')+'12px "Courier New"';ctx.fillStyle=equipped?'#f0d060':'#a8c8b0';
      ctx.fillText(t.icon+' '+t.nome+(equipped?' ◀':''),midX,ty+10);
    });
  } else {
    ctx.font='12px "Courier New"';ctx.fillStyle='#c0d8c8';
    ctx.fillText('Não Equipado',midX,PY+HEADER_H+18);
  }
  ctx.textAlign='left';

  // Hint rodapé — mesmo padrão da Fase 3.1 (sem barra/sombra), com emojis contextuais de ferramentas/itens
  const hints=[
    (()=>{
      if(!player.items.includes('cinzel_bambu'))return '🎋 Encontre o Cinzel de Bambu →';
      if(!player.items.includes('bacia_madeira'))return 'Encontre a 🥌 Bacia de Madeira →';
      if(!player.items.includes('placa_jade_ressoante'))return '🐅 Procure o Tigre para a Placa Ressoante →';
      return '✦ Ferramentas obtidas — siga em frente →';
    })(),
    '💚 Examine as formações de jade e serpentinita no vale.',
    '🎋 Cinzele pedras [E], depois teste a sonoridade! [P] para ouvir referência.',
    '🐅 Siga o Tigre até a Oficina do Lapidário [⭕]. [E] para concluir.',
  ];
  const hintText=hints[levelNum]||'';
  ctx.fillStyle='#a8d8b8';ctx.font='18px "Courier New"';
  ctx.textAlign='center';ctx.fillText(hintText,W/2,H-10);ctx.textAlign='left';
}

// ── Tela de Título ─────────────────────────────────────────────────────────
function drawTitle(){
  drawBg(1,3200,720);
  ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(0,0,W,H);
  spawnDust(1);tickDust();drawDust();
  // Pirilampos / vaga-lumes na floresta
  ctx.save();
  for(let i=0;i<60;i++){
    const sx=((i*137+11)%W),sy=((i*97+7)%(H*0.8));
    const sa=0.2+Math.abs(Math.sin(Date.now()/800+i))*0.8;
    ctx.fillStyle=`rgba(180,255,160,${sa})`;
    ctx.beginPath();ctx.arc(sx,sy,1+Math.abs(Math.sin(i))*1.5,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
  ctx.textAlign='center';
  ctx.shadowColor='#60e890';ctx.shadowBlur=40;
  ctx.fillStyle='#d0f0d0';ctx.font='bold 42px "Courier New"';
  ctx.fillText('O Jade Sagrado de Mianmar',W/2,148);
  ctx.shadowBlur=0;
  ctx.fillStyle='#80d890';ctx.font='19px "Courier New"';
  ctx.fillText('Fase 5.1  —  Vale de Hpakant, Mianmar — Século XIII',W/2,200);

  if(IMG.card51){
    const cs=160,cardX=W/2-80,cardY=230;
    const glow=ctx.createRadialGradient(W/2,cardY+80,0,W/2,cardY+80,130);
    glow.addColorStop(0,'rgba(60,220,120,0.28)');glow.addColorStop(1,'rgba(60,220,120,0)');
    ctx.fillStyle=glow;ctx.beginPath();ctx.arc(W/2,cardY+80,130,0,Math.PI*2);ctx.fill();
    ctx.shadowColor='rgba(0,0,0,0.7)';ctx.shadowBlur=18;
    ctx.drawImage(IMG.card51,cardX,cardY,cs,cs);
    ctx.shadowBlur=0;
    ctx.strokeStyle='rgba(60,200,100,0.55)';ctx.lineWidth=2;ctx.strokeRect(cardX,cardY,cs,cs);
  } else {
    ctx.save();ctx.translate(W/2,308);ctx.scale(3,3);
    drawJadeItem(0,0,Date.now()/1000,'verde');
    ctx.restore();
  }

  ctx.fillStyle=`rgba(120,240,160,${.55+Math.sin(Date.now()/550)*.4})`;
  ctx.font='19px "Courier New"';
  ctx.fillText('▶  Pressione ENTER para começar  ◀',W/2,454);

  ctx.fillStyle='#80c0a0';ctx.font='18px "Courier New"';
  ctx.fillText('← → Mover   |   ↑ Espaço Pular   |   E Interagir   |   I Diário de Bordo',W/2,500);
  ctx.fillText('[M] Menu Principal',W/2,538);
  ctx.textAlign='left';
}

function drawDeath(player){
  ctx.fillStyle='rgba(0,0,0,0.78)';ctx.fillRect(0,0,W,H);
  const cause=player?player.deathCause||'queda':'queda';
  const msgs={queda:'CORVAN CAIU!',espinho:'QUE ESPINHO!',inimigo:'O INIMIGO FOI MAIS RÁPIDO!',sonoridade:'OUVIDO TREINADO DEMAIS TARDE!'};
  const subs={queda:'Uma queda no vale de Hpakant — o rio Uru é impiedoso!',espinho:'Cuidado com as pedras cortantes do leito do rio!',inimigo:'',sonoridade:'Três pedras mudas em sequência — a "voz da pedra" tem que ser ouvida com cuidado.'};
  const msg=msgs[cause]||'CORVAN CAIU!';
  const sub=subs[cause]||'O vale de Hpakant guarda seus segredos.';
  ctx.textAlign='center';ctx.shadowColor='#ff4040';ctx.shadowBlur=30;
  ctx.fillStyle='#ff6060';ctx.font='bold 54px "Courier New"';ctx.fillText(msg,W/2,H/2-50);
  ctx.shadowBlur=0;
  ctx.fillStyle='#cc8888';ctx.font='16px "Courier New"';ctx.fillText(sub,W/2,H/2-10);
  ctx.fillStyle='#80d890';ctx.font='20px "Courier New"';
  ctx.fillText('Pressione  R  para recomeçar',W/2,H/2+80);
  ctx.fillText(`Tentativas: ${G.deaths||1}`,W/2,H/2+108);
  ctx.fillStyle='#888';ctx.font='15px "Courier New"';ctx.fillText('[M] Menu Principal',W/2,H/2+140);
  ctx.textAlign='left';
}

// ── Tela de Conclusão ──────────────────────────────────────────────────────
function drawComplete(player){
  const g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#204818');g.addColorStop(0.45,'#102808');g.addColorStop(1,'#081408');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  // Vaga-lumes finais
  ctx.save();
  for(let i=0;i<50;i++){
    const sx=((i*137+11)%W),sy=((i*97+7)%(H*0.9));
    const sa=0.3+Math.abs(Math.sin(Date.now()/800+i))*0.7;
    ctx.fillStyle=`rgba(160,255,140,${sa})`;
    ctx.beginPath();ctx.arc(sx,sy,1+Math.abs(Math.sin(i))*1.5,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
  ctx.textAlign='center';
  ctx.shadowColor='#60e890';ctx.shadowBlur=40;
  ctx.fillStyle='#a0f0c0';ctx.font='bold 38px "Courier New"';
  ctx.fillText('✦  FASE 5.1 CONCLUÍDA  ✦',W/2,108);
  ctx.shadowBlur=0;
  drawCorvan(W/2-40,140,3,false,Date.now()/300,'placa_jade_ressoante');
  ctx.fillStyle='#c0e8c8';ctx.font='17px "Courier New"';
  ctx.fillText('O vale de Hpakant revelou seus segredos.',W/2,340);
  const jadeCount=player?player.items.filter(id=>id.startsWith('jadeia_')).length:0;
  const hasB=player&&player.items.includes('bracelete_imperial');
  const lines=[
    `✦  Cinzel de Bambu Endurecido — extração sem fratura`,
    `✦  Bacia de Madeira com Areia — estabilização sonora`,
    `✦  Placa de Jade Ressoante — diagnóstico auditivo (Mi / 659 Hz)`,
    hasB?'✦  Bracelete de Jade Imperial — o artesão Kachin sem nome':'✦  Bracelete Imperial — não encontrado',
  ];
  ctx.fillStyle='#90c898';ctx.font='14px "Courier New"';
  lines.forEach((l,i)=>ctx.fillText(l,W/2,400+i*32));
  const _scoreY=400+lines.length*32+40;
  ctx.fillStyle='#80b090';ctx.font='16px "Courier New"';
  ctx.fillText(`Pontuação: ◈ ${G.player?.score||0}   Mortes: ${G.deaths}`,W/2,_scoreY);
  ctx.fillStyle='#80b090';ctx.font='14px "Courier New"';
  ctx.fillText(`💚 Jadeítas coletadas: ${jadeCount}/3`,W/2,_scoreY+22);
  // Resumo dos artefatos regionais de cena (colecionáveis à parte do diário)
  const artTotals=[1,2,4].map(n=>{const d=ARTIFACT_DEFS[n];const c=player?player.items.filter(id=>id.startsWith(d.idPrefix)).length:0;return `${d.icon} ${c}/${d.total}`;}).join('   ');
  ctx.fillText(`Artefatos regionais: ${artTotals}`,W/2,_scoreY+44);
  const pulse=0.65+Math.sin(Date.now()/550)*0.4;
  ctx.fillStyle=`rgba(120,240,160,${pulse})`;ctx.font='15px "Courier New"';
  ctx.fillText('✦ Fase 5.2 desbloqueada!   [M] Menu Principal',W/2,_scoreY+35+44);
  ctx.textAlign='left';
}

function buildL1(){
  // Cena 1: Floresta tropical + entrada do vale
  const LW=3200,LH=720;
  const GROUND=560;
  const plats=[];
  plats.push({x:0,y:GROUND,w:LW,h:160,type:'ground'});
  // Rochas e pedras salientes — gaps mais largos, exigem timing de salto
  plats.push({x:340,y:GROUND-40,w:80,h:40,type:'plat'});
  plats.push({x:560,y:GROUND-70,w:60,h:70,type:'plat'});
  plats.push({x:780,y:GROUND-50,w:70,h:50,type:'plat'});
  plats.push({x:1000,y:GROUND,w:140,h:160,type:'_dead'}); // fosso — abertura para o vale
  plats.push({x:1140,y:GROUND-90,w:64,h:18,type:'plat'});
  plats.push({x:1300,y:GROUND-130,w:60,h:18,type:'plat'});
  plats.push({x:1460,y:GROUND-80,w:64,h:18,type:'plat'});
  plats.push({x:1640,y:GROUND-50,w:80,h:50,type:'plat'});
  plats.push({x:1760,y:GROUND-18,w:60,h:18,type:'spike'});
  plats.push({x:1850,y:GROUND-90,w:90,h:90,type:'plat'});
  plats.push({x:2080,y:GROUND-50,w:70,h:50,type:'plat'});
  plats.push({x:2280,y:GROUND-60,w:90,h:60,type:'plat'});
  plats.push({x:2440,y:GROUND-18,w:50,h:18,type:'spike'});
  plats.push({x:2520,y:GROUND-40,w:90,h:40,type:'plat'});
  plats.push({x:2740,y:GROUND-30,w:110,h:30,type:'plat'});
  plats.push({x:2960,y:GROUND-80,w:200,h:80,type:'plat'});
  const cols=[
    new Col(300,GROUND-90,'cinzel_bambu'),
    new Col(1700,GROUND-90,'bacia_madeira'),
  ];
  // Colecionável de cena — Penas de Calau (ave sagrada mencionada no roteiro)
  const artifacts=[
    new Artifact(585,GROUND-70-56,1),
    new Artifact(1320,GROUND-130-56,1),
    new Artifact(2310,GROUND-60-56,1),
  ];
  const triggers=[];
  triggers.push(new Trigger(LW-60,GROUND-120,60,120,'Descer ao Leito do Rio',()=>{G.loadLevel(2);}));
  const tigre={x:2880,y:GROUND-4,gifted:false};
  return {num:1,W:LW,H:LH,startX:80,startY:GROUND-68,plats,cols,artifacts,triggers,tigre,_startDone:false};
}

function buildL2(){
  // Cena 2: Leito do rio Uru — geologia e formações
  const LW=2600,LH=860;
  const FLOOR=700;
  const plats=[];
  plats.push({x:0,y:FLOOR,w:LW,h:160,type:'ground'});
  // Pedras do rio — irregulares, mais estreitas e altas
  plats.push({x:200,y:FLOOR-100,w:90,h:20,type:'plat'});
  plats.push({x:200,y:FLOOR-14,w:18,h:18,type:'spike'});
  plats.push({x:420,y:FLOOR-190,w:64,h:20,type:'plat'});
  plats.push({x:600,y:FLOOR-130,w:80,h:20,type:'plat'});
  plats.push({x:760,y:FLOOR-12,w:18,h:18,type:'spike'});
  plats.push({x:840,y:FLOOR-200,w:96,h:20,type:'plat'});
  plats.push({x:1060,y:FLOOR-110,w:80,h:20,type:'plat'});
  plats.push({x:1280,y:FLOOR-230,w:64,h:20,type:'plat'});
  plats.push({x:1280,y:FLOOR-12,w:18,h:18,type:'spike'});
  plats.push({x:1480,y:FLOOR-160,w:80,h:20,type:'plat'});
  plats.push({x:1680,y:FLOOR-12,w:18,h:18,type:'spike'});
  plats.push({x:1700,y:FLOOR-100,w:96,h:20,type:'plat'});
  plats.push({x:1980,y:FLOOR-190,w:64,h:20,type:'plat'});
  plats.push({x:2200,y:FLOOR-130,w:80,h:20,type:'plat'});
  plats.push({x:2360,y:FLOOR-80,w:90,h:20,type:'plat'});
  const expositions=[
    new JadeExposition(450,FLOOR-30,'jade'),
    new JadeExposition(880,FLOOR-30,'serpentinite'),
    new JadeExposition(1550,FLOOR-30,'jade'),
    new JadeExposition(2080,FLOOR-30,'serpentinite'),
  ];
  // Colecionável de cena — Seixos de Nefrita ("o outro jade", mencionado no roteiro)
  const artifacts=[
    new Artifact(430,FLOOR-190-46,2),
    new Artifact(1090,FLOOR-110-46,2),
    new Artifact(2220,FLOOR-130-46,2),
  ];
  const triggers=[];
  triggers.push(new Trigger(LW-60,FLOOR-120,60,120,'Câmara de Coleta',()=>{G.loadLevel(3);}));
  return {num:2,W:LW,H:LH,startX:80,startY:FLOOR-68,plats,cols:[],artifacts,triggers,expositions,_expDialogDone:false};
}

function buildL3(){
  // Cena 3: Câmara de coleta — 3 pedras de jade + bracelete
  const LW=2100,LH=720;
  const FLOOR=560;
  const plats=[];
  plats.push({x:0,y:FLOOR,w:LW,h:160,type:'ground'});
  plats.push({x:280,y:FLOOR-100,w:90,h:20,type:'plat'});
  plats.push({x:460,y:FLOOR-18,w:50,h:18,type:'spike'});
  plats.push({x:580,y:FLOOR-80,w:70,h:20,type:'plat'});
  plats.push({x:800,y:FLOOR-18,w:60,h:18,type:'spike'});
  plats.push({x:1000,y:FLOOR-100,w:90,h:20,type:'plat'});
  plats.push({x:1230,y:FLOOR-18,w:60,h:18,type:'spike'});
  plats.push({x:1440,y:FLOOR-80,w:70,h:20,type:'plat'});
  plats.push({x:1620,y:FLOOR-18,w:50,h:18,type:'spike'});
  plats.push({x:1760,y:FLOOR-100,w:90,h:20,type:'plat'});
  const walls=[
    new RiverStoneWall(360,FLOOR-72,'verde'),
    new RiverStoneWall(940,FLOOR-72,'lavanda'),
    new RiverStoneWall(1550,FLOOR-72,'branca'),
  ];
  // Bracelete Imperial na oficina ao fundo
  const bracaleteObj={x:1900,y:FLOOR-50,done:false};
  const cols=[];
  const triggers=[];
  triggers.push(new Trigger(LW-60,FLOOR-120,60,120,'Oficina do Lapidário',()=>{G.loadLevel(4);}));
  return {num:3,W:LW,H:LH,startX:80,startY:FLOOR-68,plats,cols,triggers,walls,bracaleteObj};
}

function buildL4(){
  // Cena 4: Entardecer — oficina do lapidário, conclusão
  const LW=2600,LH=720;
  const FLOOR=560;
  const plats=[];
  plats.push({x:0,y:FLOOR,w:LW,h:160,type:'ground'});
  plats.push({x:200,y:FLOOR-60,w:100,h:60,type:'plat'});
  plats.push({x:380,y:FLOOR-18,w:50,h:18,type:'spike'});
  plats.push({x:520,y:FLOOR-80,w:70,h:20,type:'plat'});
  plats.push({x:700,y:FLOOR-18,w:60,h:18,type:'spike'});
  plats.push({x:840,y:FLOOR-60,w:100,h:20,type:'plat'});
  plats.push({x:1060,y:FLOOR-18,w:60,h:18,type:'spike'});
  plats.push({x:1250,y:FLOOR-100,w:70,h:20,type:'plat'});
  plats.push({x:1460,y:FLOOR-18,w:70,h:18,type:'spike'});
  plats.push({x:1680,y:FLOOR-70,w:90,h:20,type:'plat'});
  plats.push({x:1900,y:FLOOR-18,w:50,h:18,type:'spike'});
  plats.push({x:1980,y:FLOOR-60,w:140,h:60,type:'plat'});
  // Colecionável de cena — Grãos de Abrasivo de Quartzo (lapidação, citado no roteiro)
  const artifacts=[
    new Artifact(550,FLOOR-80-46,4),
    new Artifact(1270,FLOOR-100-46,4),
    new Artifact(1700,FLOOR-70-46,4),
  ];
  const triggers=[];
  triggers.push(new Trigger(LW-120,FLOOR-160,120,160,'Entrar na Oficina',(player)=>{
    if(!player.items.includes('jadeia_verde')){notify('💚 Volte ao leito do rio e cinzele a Jadeíta Verde-Imperial!');return;}
    if(!player.items.includes('jadeia_lavanda')){notify('💜 Falta a Jadeíta Lavanda-Pálido — teste as pedras do rio!');return;}
    if(!player.items.includes('jadeia_branca')){notify('🤍 Falta a Jadeíta Branco-Translúcida — teste as pedras do rio!');return;}
    if(!player.items.includes('bracelete_imperial')){notify('⭕ O Bracelete de Jade Imperial ainda não foi encontrado na oficina!');return;}
    G.state='complete';
  }));
  const tigre={x:200,y:FLOOR-4,gifted:false,isGuide:true};
  return {num:4,W:LW,H:LH,startX:80,startY:FLOOR-68,plats,cols:[],artifacts,triggers,tigre};
}

// ═══════════════════════════════════════════════════════════════════════════
// ── GAME LOOP ──────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

const G={
  state:'title',
  level:1,
  player:null,
  currentLevel:null,
  dialog:false,
  sonicMode:null,
  deaths:0,
  // Snapshot do que o jogador tinha ao ENTRAR na cena atual pela primeira vez
  // (antes de coletar qualquer coisa nesta tentativa). Usado para resetar de
  // verdade o progresso da cena quando ele morre e reinicia — do contrário,
  // um respawn após morte reaproveitava this.player.items da tentativa que
  // acabou de falhar, então tudo já aparecia coletado de novo.
  _enteredLevel:null,_levelEntryItems:[],_levelEntryScore:0,_levelEntryTools:null,

  loadLevel(n,skipIntro=false){
    this.level=n;
    this.sonicMode=null;this.dialog=false;
    const prev=this.player;
    const isRespawnSameLevel=skipIntro&&this._enteredLevel===n;
    const prevItems=isRespawnSameLevel?[...this._levelEntryItems]:(prev?[...prev.items]:[]);
    const prevScore=isRespawnSameLevel?this._levelEntryScore:(prev?prev.score:0);
    const prevTools=isRespawnSameLevel?new Set(this._levelEntryTools||[]):(prev?new Set(prev.activeTools):new Set());
    if(!isRespawnSameLevel){
      this._enteredLevel=n;this._levelEntryItems=[...prevItems];this._levelEntryScore=prevScore;this._levelEntryTools=new Set(prevTools);
    }

    if(n===1)this.currentLevel=buildL1();
    else if(n===2)this.currentLevel=buildL2();
    else if(n===3)this.currentLevel=buildL3();
    else if(n===4)this.currentLevel=buildL4();

    const lv=this.currentLevel;
    this.player=new Player(lv.startX||80,lv.startY||(lv.H-200));
    this.player.items=prevItems;
    this.player.score=prevScore;
    this.player.activeTools=prevTools;
    if(this.player.items.includes('cinzel_bambu'))this.player.activeTools.add('cinzel_bambu');
    if(this.player.items.includes('placa_jade_ressoante'))this.player.activeTools.add('placa_jade_ressoante');

    // Reconciliação anti-duplicata: ao reconstruir a cena (ex.: respawn após morte),
    // marca como já feito tudo que o jogador já possui, para não coletar de novo.
    if(lv.cols){for(const c of lv.cols){if(this.player.items.includes(c.type))c.done=true;}}
    if(lv.walls){for(const w of lv.walls){if(this.player.items.includes('jadeia_'+w.jadeVariety))w.done=true;}}
    if(lv.bracaleteObj&&this.player.items.includes('bracelete_imperial'))lv.bracaleteObj.done=true;
    if(lv.tigre&&!lv.tigre.isGuide&&this.player.items.includes('placa_jade_ressoante'))lv.tigre.gifted=true;
    if(lv.artifacts){
      const def=ARTIFACT_DEFS[n];
      if(def){
        let already=this.player.items.filter(id=>id.startsWith(def.idPrefix)).length;
        for(const a of lv.artifacts){if(already<=0)break;a.done=true;already--;}
      }
    }

    cam.x=0;cam.y=0;cam.W=W;cam.H=H;
    cam.LW=lv.W;cam.LH=lv.H;
    particles.length=0;dustPts.length=0;
    this.state='playing';

    if(skipIntro){
      // Reentrada por morte — sem repetir a narração de entrada da cena
    } else if(n===1){
      setTimeout(()=>showDialog([
        '"Século XIII, norte de Mianmar. Vale de Hpakant. O rio Uru corre sobre pedras cobertas de musgo verde-escuro. Algumas têm veias translúcidas visíveis — jade."',
        '"O jade não é apenas uma pedra aqui. Para os chineses, conecta os vivos aos ancestrais, representa cinco virtudes, cura pelo toque. Um bracelete de jadeíta imperial pode valer mais que um diamante."',
        '"Encontre o Cinzel de Bambu e a Bacia de Madeira antes de descer ao leito do rio. O Tigre-de-Indochina nesta floresta pode ter algo fundamental para o diagnóstico."',
      ],null),600);
    } else if(n===2){
      setTimeout(()=>showDialog([
        '"Leito do rio Uru. As pedras revelam a geologia desta região única: é aqui que a placa indiana mergulha sob a Eurásia para criar o Himalaia — e, como subproduto, criar jade."',
        '"Examine as formações. Jadeíta e serpentinita coexistem neste leito. Visualmente muito similares. Mas acusticamente? Uma tem voz. A outra não."',
      ],null),500);
    } else if(n===3){
      setTimeout(()=>showDialog([
        '"Câmara de coleta. Três pedras de rio com veias de jade. Cinzele com o bambu, depois posicione na bacia e aplique o teste de sonoridade."',
        '"O bracelete imperial também está aqui, na oficina do lapidário ao fundo. O artesão Kachin que o esculpiu nunca terá seu nome nos registros do Palácio de Pequim."',
      ],null),500);
    } else if(n===4){
      setTimeout(()=>showDialog([
        '"O entardecer de Hpakant. A luz laranjada atravessa bambus e ilumina o jade de dentro — ele brilha como uma lanterna vegetal."',
        '"O Tigre conhece o caminho até a oficina. Siga-o."',
      ],()=>{notify('✦ Siga o Tigre até a Oficina do Lapidário!')}),500);
    }
  },

  restart(){
    wrongPicks=0;sonicHintShown=false;
    popup.active=false;notifAlpha=0;
    BUBBLE.active=false;BUBBLE.queue=[];BUBBLE.cb=null;
    INV.open=false;INV.cursor=0;INV.tab=0;
    this.sonicMode=null;
    this.loadLevel(this.level||1,true); // volta ao início da cena ATUAL, sem repetir a narração
  },

  advance(){
    unlockPhase('5.2');
    try{sessionStorage.setItem('mineralis_session','1');}catch(e){}
    window.location.href='../../MenuPrincipal/index.html?unlocked=5.2';
  },
};

// ── Música de fundo — Fase 5.1: Saung Gauk (harpa birmanesa) ───────────────
// Pentatônica birmana — saung gauk tem 16 cordas, afinação modal
let _bgMusicActive=false,_bgMusicTimeout=null,_bgMusicGain=null;
const _NOTES_BRM=[195.99,220,246.94,293.66,329.63,369.99,440,493.88]; // modal birmana
function startBgMusic(){
  if(_bgMusicActive||!AC)return;
  _bgMusicActive=true;
  if(AC.state==='suspended')AC.resume();
  _bgMusicGain=AC.createGain();_bgMusicGain.gain.value=0.05;_bgMusicGain.connect(AC.destination);
  function _nota(freq,start,dur){
    const o=AC.createOscillator(),g=AC.createGain();
    o.type='triangle'; // timbre de harpa/arco — mais suave que onda quadrada
    o.frequency.value=freq;
    g.gain.setValueAtTime(0,start);g.gain.linearRampToValueAtTime(0.07,start+0.02);
    g.gain.setValueAtTime(0.07,start+dur-0.12);g.gain.linearRampToValueAtTime(0,start+dur);
    o.connect(g);g.connect(_bgMusicGain);o.start(start);o.stop(start+dur);
  }
  // Sequência meditativa e circular — Saung Gauk / Pat Waing
  const SEQ=[0,2,4,5,4,2,5,7,5,4,2,0,1,2,4,2];
  function _ciclo(){
    if(!_bgMusicActive)return;
    const t=AC.currentTime+0.1;
    SEQ.forEach((idx,i)=>_nota(_NOTES_BRM[idx%_NOTES_BRM.length],t+i*0.42,0.5));
    _bgMusicTimeout=setTimeout(_ciclo,(SEQ.length*0.42-0.3)*1000);
  }
  _ciclo();
}
function stopBgMusic(){
  _bgMusicActive=false;clearTimeout(_bgMusicTimeout);
  if(_bgMusicGain&&AC){_bgMusicGain.gain.linearRampToValueAtTime(0,AC.currentTime+0.5);_bgMusicGain=null;}
}
let _prevBgState='';

function startGame(){
  // Mostra a capa (título) primeiro — o jogo só entra em 'playing' quando o
  // jogador confirma com ENTER/ESPAÇO (ver checagem em loop() abaixo). Antes,
  // startGame() pulava direto para loadLevel(1)+'playing', então a capa nunca
  // aparecia entre o clique no menu e a Cena 1.
  G.state='title';
  cam.x=0;cam.y=0;
  particles.length=0;dustPts.length=0;
  loop();
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

  const lv=G.currentLevel;

  if(G.state==='title'){
    drawTitle();
    ctx.restore();
    if(jp['Enter']||jp['Space']){G.loadLevel(1);}
    clearJP();return;
  }

  if(G.state==='dead'){
    if(lv){tileTheme=TILE_THEMES[lv.num]||TILE_THEMES[1];drawBg(lv.num,lv.W,lv.H);}
    else{ctx.fillStyle='#0a140a';ctx.fillRect(0,0,W,H);}
    drawDeath(G.player);
    ctx.restore();
    if(jp['KeyR']||jp['Enter']||jp['KeyE']){G.deaths=(G.deaths||0)+1;G.restart();}
    clearJP();return;
  }

  if(G.state==='complete'){
    drawBg(4,2600,720);spawnDust(4);tickDust();drawDust();
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
  if(lv.artifacts){for(const a of lv.artifacts)a.tick();}

  for(const p of lv.plats){
    if(p.type==='_dead')continue;
    drawPlatform(p);
  }
  drawDust();

  if(lv.expositions){for(const ex of lv.expositions)ex.draw();}

  if(lv.walls){
    for(const w of lv.walls)w.draw();
  }

  // Bracelete na oficina
  if(lv.bracaleteObj&&!lv.bracaleteObj.done){
    const bo=lv.bracaleteObj;
    const bsx=bo.x-cam.x,bsy=bo.y-cam.y;
    ctx.save();ctx.translate(bsx,bsy);drawBracaleteItem(0,0,Date.now()/600);ctx.restore();
    // Label
    if(player&&Math.abs(player.x+13-bo.x)<80){
      const ha=0.7+Math.sin(Date.now()/350)*0.3;
      ctx.font='bold 13px "Courier New"';
      const txt='[E] Pegar Bracelete Imperial';
      const tw=ctx.measureText(txt).width+20;
      const bby=Math.min(bsy-56,player.y-cam.y-68-8);
      const bbx=Math.max(6,Math.min(bsx-tw/2,W-tw-6));
      ctx.fillStyle=`rgba(2,12,4,${0.88*ha})`;roundRect(bbx,bby,tw,24,5);ctx.fill();
      ctx.strokeStyle=`rgba(100,240,160,${ha})`;ctx.lineWidth=1.5;roundRect(bbx,bby,tw,24,5);ctx.stroke();
      ctx.fillStyle=`rgba(160,255,200,${ha})`;
      ctx.textAlign='center';ctx.fillText(txt,bbx+tw/2,bby+16);ctx.textAlign='left';
    }
  }

  if(lv.cols){
    for(const c of lv.cols){
      c.draw(player?player.x:0,player?player.y:0);
    }
  }

  // Artefatos regionais de cena (colecionável de "sentido de mundo")
  if(lv.artifacts){
    for(const a of lv.artifacts){
      a.draw(player?player.x:0,player?player.y:0);
    }
  }

  // Tigre-de-Indochina
  if(lv.tigre){
    const m=lv.tigre;
    if(m.isGuide&&player&&!m.gifted){
      const targetX=Math.min(lv.W-200,player.x+420);
      m.x+=(targetX-m.x)*0.035;
    }
    const mx=m.x-cam.x,my=m.y-cam.y;
    if(!m.gifted){
      ctx.save();
      const gl=ctx.createRadialGradient(mx,my,4,mx,my,60);
      gl.addColorStop(0,'rgba(255,160,40,0.2)');gl.addColorStop(1,'rgba(255,160,40,0)');
      ctx.fillStyle=gl;ctx.beginPath();ctx.arc(mx,my,60,0,Math.PI*2);ctx.fill();
      ctx.restore();
    }
    // O Tigre não é um item colecionável — permanece sempre visível em cena
    const frame=Date.now()/1000;
    drawTigre(mx,my,frame);
    if(!m.gifted&&player&&Math.abs(player.x+13-m.x)<150){
      const ha=0.7+Math.sin(Date.now()/350)*0.3;
      ctx.font='bold 13px "Courier New"';
      const txt='[E] Aproximar do Tigre';
      const tw=ctx.measureText(txt).width+20;
      const bx=Math.max(6,Math.min(mx-tw/2,W-tw-6)),by=Math.min(my-100,player.y-cam.y-68-8);
      ctx.fillStyle=`rgba(2,12,4,${0.88*ha})`;roundRect(bx,by,tw,24,5);ctx.fill();
      ctx.strokeStyle=`rgba(255,180,60,${ha})`;ctx.lineWidth=1.5;roundRect(bx,by,tw,24,5);ctx.stroke();
      ctx.fillStyle=`rgba(255,200,100,${ha})`;
      ctx.textAlign='center';ctx.fillText(txt,bx+tw/2,by+16);ctx.textAlign='left';
    }
  }

  if(lv.triggers){for(const t of lv.triggers)t.draw(player.x,player.y);}

  tickParticles();drawParticles();
  if(player){player.update(lv);player.draw();}

  BUBBLE.draw(player||{x:W/2,y:H/2,w:26,h:68});
  drawSonicOverlay(G.sonicMode);
  INV.draw(player||{items:[],activeTools:new Set()});
  drawHUD(player,lv);
  tickPopup();drawPopup();
  tickNotif();drawNotif();
  checkDlg();

  if(player&&player.dead)G.state='dead';

  clearJP();
  ctx.restore();
}

// ── Loading screen ──────────────────────────────────────────────────────────
if(!gameReady){(function loadLoop(){
  if(gameReady)return;
  requestAnimationFrame(loadLoop);
  ctx.fillStyle='#040a04';ctx.fillRect(0,0,W,H);
  const t=Date.now()/600;
  const cg=ctx.createRadialGradient(W/2,H/2,20,W/2,H/2,300);
  cg.addColorStop(0,'rgba(60,200,100,0.15)');cg.addColorStop(1,'rgba(60,200,100,0)');
  ctx.fillStyle=cg;ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#80e090';ctx.font='bold 24px "Courier New"';ctx.textAlign='center';
  ctx.fillText(`Carregando${'.'.repeat(Math.floor(Date.now()/400)%4)}  ${assetsLoaded}/${totalAssets}`,W/2,H/2);
  ctx.save();ctx.translate(W/2,H/2+80);ctx.scale(2.5,2.5);
  drawJadeItem(0,0,t,'verde');
  ctx.restore();
  ctx.textAlign='left';
})();}