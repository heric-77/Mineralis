
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
  let stopAt=.45;
  g.gain.setValueAtTime(0,t);
  if      (type==='jump')      { o.frequency.setValueAtTime(280,t); o.frequency.exponentialRampToValueAtTime(520,t+.14); g.gain.setValueAtTime(.15,t); g.gain.exponentialRampToValueAtTime(.001,t+.16); }
  else if (type==='coin')      { o.frequency.setValueAtTime(880,t); o.frequency.exponentialRampToValueAtTime(1760,t+.09); g.gain.setValueAtTime(.12,t); g.gain.exponentialRampToValueAtTime(.001,t+.12); }
  else if (type==='hit')       { o.type='sawtooth'; o.frequency.setValueAtTime(200,t); o.frequency.exponentialRampToValueAtTime(50,t+.18); g.gain.setValueAtTime(.18,t); g.gain.exponentialRampToValueAtTime(.001,t+.22); }
  else if (type==='item')      { o.frequency.setValueAtTime(440,t); o.frequency.setValueAtTime(660,t+.1); o.frequency.setValueAtTime(880,t+.2); g.gain.setValueAtTime(.14,t); g.gain.exponentialRampToValueAtTime(.001,t+.3); }
  else if (type==='unlock')    { o.frequency.setValueAtTime(330,t); o.frequency.setValueAtTime(440,t+.15); o.frequency.setValueAtTime(660,t+.3); g.gain.setValueAtTime(.15,t); g.gain.exponentialRampToValueAtTime(.001,t+.5); stopAt=.55; }
  // KLINK vítreo — lascamento bem-sucedido
  else if (type==='klink')     { o.type='sine'; o.frequency.setValueAtTime(2600,t); o.frequency.exponentialRampToValueAtTime(1400,t+.09); g.gain.setValueAtTime(.12,t); g.gain.exponentialRampToValueAtTime(.001,t+.12); const o2=AC.createOscillator(),g2=AC.createGain(); o2.type='sine'; o2.frequency.setValueAtTime(3400,t); g2.gain.setValueAtTime(.055,t); g2.gain.exponentialRampToValueAtTime(.001,t+.06); o2.connect(g2); g2.connect(AC.destination); o2.start(t); o2.stop(t+.08); stopAt=.16; }
  // Thud — ângulo errado, pedra absorve o golpe
  else if (type==='thud')      { o.type='sine'; o.frequency.setValueAtTime(90,t); g.gain.setValueAtTime(.1,t); g.gain.exponentialRampToValueAtTime(.001,t+.14); stopAt=.18; }
  // Fragmenta — força excessiva
  else if (type==='shatter')   { o.type='square'; o.frequency.setValueAtTime(240,t); o.frequency.exponentialRampToValueAtTime(60,t+.2); g.gain.setValueAtTime(.14,t); g.gain.exponentialRampToValueAtTime(.001,t+.24); stopAt=.3; }
  // Crunch granular — riolito
  else if (type==='crunch')    { o.type='sawtooth'; o.frequency.setValueAtTime(300,t); o.frequency.exponentialRampToValueAtTime(150,t+.15); g.gain.setValueAtTime(.09,t); g.gain.exponentialRampToValueAtTime(.001,t+.18); stopAt=.22; }
  // Shiing — lâmina finalizada
  else if (type==='shiing')    { o.type='sine'; o.frequency.setValueAtTime(800,t); o.frequency.exponentialRampToValueAtTime(2400,t+.35); g.gain.setValueAtTime(.0,t); g.gain.linearRampToValueAtTime(.08,t+.1); g.gain.linearRampToValueAtTime(.045,t+.3); g.gain.exponentialRampToValueAtTime(.001,t+.5); stopAt=.58; }
  // Escavar cerâmica na areia
  else if (type==='dig_sand')  { o.type='sawtooth'; o.frequency.setValueAtTime(200,t); o.frequency.exponentialRampToValueAtTime(140,t+.2); g.gain.setValueAtTime(.045,t); g.gain.exponentialRampToValueAtTime(.001,t+.24); stopAt=.3; }
  // Conchas dispostas — coleta da cerâmica
  else if (type==='shells')    { [1200,1500,1800].forEach((f,i)=>{const oi=AC.createOscillator(),gi=AC.createGain();oi.type='sine';oi.frequency.setValueAtTime(f,t+i*.08);gi.gain.setValueAtTime(.055,t+i*.08);gi.gain.exponentialRampToValueAtTime(.001,t+i*.08+.2);oi.connect(gi);gi.connect(AC.destination);oi.start(t+i*.08);oi.stop(t+i*.08+.25);}); stopAt=.05; }
  // Rugido surdo do vulcão
  else if (type==='volcano')   { o.type='sine'; o.frequency.setValueAtTime(45,t); g.gain.setValueAtTime(.035,t); g.gain.linearRampToValueAtTime(.065,t+.6); g.gain.exponentialRampToValueAtTime(.001,t+1.4); stopAt=1.5; }
  // Concha nautilus — trompete marinho (cena 4)
  else if (type==='nautilus')  { o.type='sine'; o.frequency.setValueAtTime(180,t); g.gain.setValueAtTime(.0,t); g.gain.linearRampToValueAtTime(.1,t+.3); g.gain.linearRampToValueAtTime(.07,t+1.2); g.gain.exponentialRampToValueAtTime(.001,t+2); stopAt=2.1; }
  else if (type==='stone')     { o.type='square'; o.frequency.setValueAtTime(120,t); g.gain.setValueAtTime(.1,t); g.gain.exponentialRampToValueAtTime(.001,t+.15); }
  o.start(t); o.stop(t+stopAt);
}

// ── Save ─────────────────────────────────────────────────────────
const SAVE_KEY = 'mineralis_save_v2';
function _salvarFase(score, deaths){
  const estrelas = deaths===0?4:deaths<=2?3:deaths<=5?2:1;
  try{
    const raw=localStorage.getItem(SAVE_KEY);
    const save=raw?JSON.parse(raw):{versao:1,iniciado:true,fases:{}};
    if(!save.fases) save.fases={};
    if(!save.fases['6.2']) save.fases['6.2']={desbloqueada:true,estrelas:0};
    save.fases['6.2'].estrelas=Math.max(save.fases['6.2'].estrelas||0,estrelas);
    save.fases['6.2'].desbloqueada=true;
    if(!save.fases['6.3']) save.fases['6.3']={desbloqueada:false,estrelas:0};
    save.fases['6.3'].desbloqueada=true;
    localStorage.setItem(SAVE_KEY,JSON.stringify(save));
  }catch(e){}
}
function _voltarAoMenu(){ _salvarFase(G.player?.score||0,G.deaths); window.location.href='../../MenuPrincipal/index.html'; }

// ── Assets ───────────────────────────────────────────────────────
const IMG={};
const ASSETS=[
  ['bg01','Assets/cena1_costa_talasea.svg'],
  ['bg02','Assets/cena2_afloramento_obsidiana.svg'],
  ['bg03','Assets/cena3_knapping_praia.svg'],
  ['bg04','Assets/cena4_partida_lapita.svg'],
  ['casuario_img',  'Assets/6_2_casuario.svg'],
  ['percutor_img',  'Assets/6_2_percutor_quartzito.svg'],
  ['protetor_img',  'Assets/6_2_protetor_couro.svg'],
  ['talha_img',     'Assets/6_2_talha_osso.svg'],
  ['ceramica_img',  'Assets/6_2_ceramica_lapita.svg'],
  ['card62',        'Assets/6_2_obsidiana.svg'],
];
let assetsLoaded=0, totalAssets=ASSETS.length, gameReady=false;
ASSETS.forEach(([key,src])=>{
  const img=new Image();
  img.onload  = () => { IMG[key]=img; if(++assetsLoaded>=totalAssets){gameReady=true;startGame();} };
  img.onerror = () => { IMG[key]=null; if(++assetsLoaded>=totalAssets){gameReady=true;startGame();} };
  img.src=src;
});

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
// Direcionais brutos (para o modo de talhe — ajuste de ângulo/força)
const jpL=()=>jp['ArrowLeft']||jp['KeyA'];
const jpR=()=>jp['ArrowRight']||jp['KeyD'];
const jpU=()=>jp['ArrowUp']||jp['KeyW'];
const jpD=()=>jp['ArrowDown']||jp['KeyS'];
function clearJP(){ for(const k in jp) delete jp[k]; }

// ── Particles ─────────────────────────────────────────────────────
let particles=[];
function burst(x,y,color,n=8,spd=3.5){
  for(let i=0;i<n;i++){
    const a=(i/n)*Math.PI*2+Math.random()*.5;
    particles.push({x,y,vx:Math.cos(a)*spd*(0.4+Math.random()),vy:Math.sin(a)*spd*(0.4+Math.random())-1,life:40+Math.random()*20,max:60,color,r:3+Math.random()*4});
  }
}
function glassShardBurst(x,y,n=14){ // lascas de vidro vulcânico voando
  for(let i=0;i<n;i++){
    const a=Math.random()*Math.PI*2;
    particles.push({x,y,vx:Math.cos(a)*(2+Math.random()*4),vy:Math.sin(a)*(2+Math.random()*4)-2,life:35+Math.random()*20,max:55,color:'#181818',r:1.5+Math.random()*2.5,shard:true});
  }
}
function dustBurstStone(x,y,color,n=8){
  for(let i=0;i<n;i++){
    const a=Math.random()*Math.PI*2;
    particles.push({x,y,vx:Math.cos(a)*(0.5+Math.random()*1.5),vy:Math.sin(a)*(0.5+Math.random()*1.5)-0.5,life:40+Math.random()*20,max:60,color,r:1.5+Math.random()*2.5});
  }
}
function tickParticles(){
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i];
    p.vy+=0.15; p.x+=p.vx; p.y+=p.vy; p.life--;
    if(p.life<=0) particles.splice(i,1);
  }
}
function drawParticles(){
  for(const p of particles){
    ctx.globalAlpha=p.life/p.max;
    if(p.shard){ ctx.fillStyle=p.color; ctx.save(); ctx.translate(p.x-cam.x,p.y-cam.y); ctx.rotate(p.life*0.3); ctx.fillRect(-p.r,-p.r*0.4,p.r*2,p.r*0.8); ctx.restore(); }
    else { ctx.fillStyle=p.color; ctx.beginPath(); ctx.arc(p.x-cam.x,p.y-cam.y,p.r*(p.life/p.max),0,Math.PI*2); ctx.fill(); }
  }
  ctx.globalAlpha=1;
}

// ── Camera ────────────────────────────────────────────────────────
const cam={x:0,y:0};
function updateCam(px,worldW){ const t=px-W/2+24; const c=Math.max(0,Math.min(t,worldW-W)); cam.x+=(c-cam.x)*0.12; }

const GRAV=0.46, PSPD=4.6, JUMPF=-12.4, MAXFALL=16;

// ── Tile themes — rocha vulcânica negra ────────────────────────────
const TILE_THEMES={
  1:{top:'#2a2830',body:'#1a1820',dark:'#0c0a10'},  // costa de lava
  2:{top:'#3a3838',body:'#282628',dark:'#161418'},  // afloramento
  3:{top:'#302e30',body:'#201e20',dark:'#100e10'},  // praia de knapping
  4:{top:'#282430',body:'#181420',dark:'#0c0810'},  // partida
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
  if(p.type==='spike'){ const nc=Math.max(1,Math.floor(p.w/20)); ctx.fillStyle='#161418'; for(let i=0;i<nc;i++){const tx=sx+i*(p.w/nc);ctx.beginPath();ctx.moveTo(tx,sy+p.h);ctx.lineTo(tx+p.w/nc/2,sy);ctx.lineTo(tx+p.w/nc,sy+p.h);ctx.fill();} return; }
  if(p.type==='trapdoor'){ const alpha=p.crumble!==undefined?p.crumble/70:1; ctx.globalAlpha=alpha; ctx.fillStyle=tileTheme.dark;ctx.fillRect(sx,sy,p.w,p.h); ctx.fillStyle=tileTheme.top;ctx.fillRect(sx,sy,p.w,3); ctx.globalAlpha=1; return; }
  if(p.type==='_dead') return;
  const ts=24,cols=Math.ceil(p.w/ts),rows=Math.ceil(p.h/ts);
  for(let r=0;r<rows;r++){ for(let c=0;c<cols;c++){
    const tx=sx+c*ts,ty=sy+r*ts,tw=Math.min(ts,sx+p.w-tx),th=Math.min(ts,sy+p.h-ty);
    ctx.fillStyle=r===0?tileTheme.body:(r%2===0?tileTheme.dark:tileTheme.body); ctx.fillRect(tx,ty,tw,th);
    ctx.fillStyle='rgba(0,0,0,0.1)'; ctx.fillRect(tx+tw-1,ty,1,th); ctx.fillRect(tx,ty+th-1,tw,1);
  } }
  ctx.fillStyle=tileTheme.top; ctx.fillRect(sx,sy,p.w,4);
  if(p.moving){ ctx.fillStyle='rgba(40,200,200,0.3)'; ctx.fillRect(sx,sy,p.w,4); }
}

// ── Utils ─────────────────────────────────────────────────────────
function roundRect(x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r); ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath(); }
function _rr(x,y,w,h,r){ roundRect(x,y,w,h,r); }
function wrapText(text,maxW,font='15px "Courier New"'){ ctx.font=font; const paragraphs=text.split('\n'); const result=[]; for(const para of paragraphs){ const words=para.split(' ');let line=''; for(const word of words){ const test=line?line+' '+word:word; if(ctx.measureText(test).width>maxW&&line){result.push(line);line=word;}else line=test; } if(line)result.push(line); } return result; }

// ── Item Definitions ──────────────────────────────────────────────
const ITEM_DEFS={
  // Herdados
  picareta_basica:  { cat:'ferramenta',nome:'Picareta Básica',       icon:'⛏',fase:'1.1',desc:'Extrai minérios das paredes rochosas.' },
  maco_pedra:       { cat:'ferramenta',nome:'Maço de Pedra',         icon:'🪨',fase:'2.3',desc:'Percussão a frio Anishinaabe.' },
  picareta_calcario:{ cat:'ferramenta',nome:'Picareta de Calcário',  icon:'⛏',fase:'3.3',desc:'Para rocha sedimentar.' },
  machado_item:     { cat:'ferramenta',nome:'Machado Tuaregue',      icon:'🪓',fase:'4.3',desc:'Golpe horizontal para sal.' },
  picareta_aco_song:{ cat:'ferramenta',nome:'Picareta de Aço Song',  icon:'⛏',fase:'5.3',desc:'Aço chinês do séc. XI.' },
  tora_pinheiro:    { cat:'ferramenta',nome:'Tora de Pinheiro',      icon:'🪵',fase:'5.2',desc:'Fire-setting em Badakhshan.' },
  // Novas 6.2
  percutor_quartzito:{ cat:'ferramenta',nome:'Percutor de Quartzito',icon:'🪨',fase:'6.2',desc:'Seixo de quartzo arredondado, mais duro\nque a obsidiana. Ferramenta de percussão\ndireta dos knappers Lapita — controla\nângulo e força para lascar vidro vulcânico.' },
  protetor_couro:   { cat:'ferramenta',nome:'Protetor de Couro de Mão',icon:'🧤',fase:'6.2',desc:'Luva primitiva de couro de tartaruga.\nProtege a mão que segura o núcleo —\nbordas de obsidiana recém-lascadas\ncortam sem qualquer pressão.' },
  talha_osso:       { cat:'ferramenta',nome:'Talha-Obsidiana de Osso',icon:'🦴',fase:'6.2',desc:'Percutor de osso de casuário — denso como\nmarfim. Lascamentos de pressão mais\ncontrolados que o percutor de pedra:\no salto de ferramentas brutas para\nferramentas de precisão cirúrgica.' },
  // Minérios
  cobre_nativo:     { cat:'minerio', nome:'Cobre Nativo',     icon:'🟠',fase:'2.3',desc:'Tradição Anishinaabe.',multiple:true },
  cinabrio:         { cat:'minerio', nome:'Cinábrio (HgS)',   icon:'🔴',fase:'3.3',desc:'Sulfeto de mercúrio escarlate.',multiple:true },
  halita:           { cat:'minerio', nome:'Halita Saariana',  icon:'⬜',fase:'4.3',desc:'Sal de Taoudenni.',multiple:true },
  magnetita:        { cat:'minerio', nome:'Magnetita (Fe₃O₄)',icon:'⬛',fase:'5.3',desc:'Pedra que ama o ferro.',multiple:true },
  lapis_lazuli:     { cat:'minerio', nome:'Lápis-Lazúli',     icon:'🔷',fase:'5.2',desc:'Pigmento ultramarino.',multiple:true },
  obsidiana:        { cat:'minerio', nome:'Lâmina de Obsidiana', icon:'🔺',fase:'6.2',desc:'Vidro vulcânico riolítico — fratura conchoidal.\nA borda de um lascamento bem feito tem\n3 nanômetros de espessura: 500× mais fina\nque um bisturi de aço. A faca mais afiada\nda pré-história — e ainda usada em\nmicrocirurgia hoje.',multiple:true },
  // Artefatos
  tumi_dourado:     { cat:'artefato',nome:'Tumi de Ouro Inca',icon:'🥇',fase:'1.3',desc:'Faca ritual Inca de ouro.' },
  frasco_mercurio:  { cat:'artefato',nome:'Frasco de Mercúrio',icon:'⚗️',fase:'3.3',desc:'10.000 km de Almadén a Potosí.' },
  manuscrito_item:  { cat:'artefato',nome:'Manuscrito de Timbuktu',icon:'📜',fase:'4.3',desc:'Mineralogia árabe.' },
  mengxi_bitan:     { cat:'artefato',nome:'Mengxi Bitan',icon:'📚',fase:'5.3',desc:'Dream Pool Essays — Shen Kuo.' },
  frasco_ultramarino:{ cat:'artefato',nome:'Frasco de Ultramarino',icon:'🧪',fase:'5.2',desc:'Pigmento de Sar-e-Sang.' },
  ceramica_lapita:  { cat:'artefato',nome:'Fragmento de Cerâmica Lapita',icon:'🏺',fase:'6.2',desc:'Caco de argila com decoração "dentate-stamped" —\npressionada com pente de dentes de concha.\nA assinatura cultural Lapita encontrada de\nPapua até Tonga e Fiji. Prova viva da rede\nde comércio mais extensa do mundo pré-histórico.' },
};
const TIPO_TO_JOURNAL={
  percutor:'percutor_quartzito', protetor:'protetor_couro', talha:'talha_osso',
  obsidiana:'obsidiana', ceramica:'ceramica_lapita',
};

// ── Inventory ─────────────────────────────────────────────────────
const INV={
  open:false,tab:0,cursor:0,
  TABS:[{id:'ferramenta',label:'🔧 Ferramentas',color:'#30c8c8'},{id:'minerio',label:'⛏ Minérios',color:'#20a0a8'},{id:'artefato',label:'🏺 Artefatos',color:'#40d0d0'}],
  tabItems(player){
    const cat=this.TABS[this.tab].id;
    let coletados={};
    try{const s=localStorage.getItem('mineralis_save_v2');if(s){const j=JSON.parse(s);coletados=j.coletados||{};}}catch(e){}
    if(coletados['mapa_potosi']&&!coletados['tupu_prata']) coletados['tupu_prata']=true;
    for(const tipo of player.items){
      const jid=TIPO_TO_JOURNAL[tipo]||tipo;
      coletados[jid]=true;
    }
    const obsN=player.items.filter(i=>i==='obsidiana').length;

    const _seenJids=new Set(Object.values(ITEM_DEFS).map(d=>d.journalId||'').filter(Boolean));
    const _FINAL={...ITEM_DEFS};
    for(const [id,def] of Object.entries(window.ALL_ITEM_DEFS||{})){
      if(id in ITEM_DEFS)continue;
      const jid=def.journalId||id;
      if(_seenJids.has(jid))continue;
      _seenJids.add(jid);_FINAL[id]=def;
    }

    const out=[];
    for(const [id,def] of Object.entries(_FINAL)){
      if(def.cat!==cat) continue;
      const jid=def.journalId||id;
      const saved=coletados[jid]||coletados[id];
      if(def.multiple){
        if(id==='obsidiana'&&obsN>0) out.push({id,...def,count:obsN});
        else if(saved&&id!=='obsidiana') out.push({id,...def,count:typeof saved==='number'?saved:1});
      } else if(id in ITEM_DEFS){
        if(player.items.includes(id)||player.items.includes(id+'_ok')||player.items.includes(id+'_col')||saved) out.push({id,...def,count:1});
      } else if(saved){
        out.push({id,...def,count:1});
      }
    }
    return out;
  },
  toggle(player){ this.open=!this.open; if(this.open)this.cursor=Math.min(this.cursor,Math.max(0,this.tabItems(player).length-1)); G.dialog=this.open; },
  close(){ this.open=false; G.dialog=false; },
  navigate(player){ if(!this.open)return false; if(jp['ArrowLeft']||jp['KeyA']){this.tab=(this.tab+2)%3;this.cursor=0;return true;} if(jp['ArrowRight']||jp['KeyD']){this.tab=(this.tab+1)%3;this.cursor=0;return true;} const items=this.tabItems(player); if(jp['ArrowUp']||jp['KeyW']){this.cursor=Math.max(0,this.cursor-1);return true;} if(jp['ArrowDown']||jp['KeyS']){this.cursor=Math.min(items.length-1,this.cursor+1);return true;} if(isE()&&items.length>0&&this.tab===0){const item=items[this.cursor];player.activeTool=(player.activeTool===item.id)?null:item.id;return true;} return false; },
  draw(player){
    if(!this.open)return;
    ctx.fillStyle='rgba(0,0,0,0.65)';ctx.fillRect(0,0,W,H);
    const PW=780,PH=480,PX=(W-PW)/2,PY=(H-PH)/2;
    ctx.shadowColor='rgba(0,0,0,0.7)';ctx.shadowBlur=20;ctx.fillStyle='rgba(2,6,8,0.97)';_rr(PX,PY,PW,PH,16);ctx.fill();ctx.shadowBlur=0;
    ctx.strokeStyle='#188888';ctx.lineWidth=2.5;_rr(PX,PY,PW,PH,16);ctx.stroke();
    ctx.fillStyle='#40d0d0';ctx.font='bold 16px "Courier New"';ctx.textAlign='center';ctx.fillText('📔  DIÁRIO DE BORDO',W/2,PY+28);ctx.textAlign='left';
    ctx.fillStyle='rgba(24,136,136,0.3)';ctx.fillRect(PX+16,PY+38,PW-32,1);
    const TAB_W=PW/3,TAB_Y=PY+44;
    this.TABS.forEach((tab,i)=>{ const tx=PX+i*TAB_W,active=(i===this.tab); ctx.fillStyle=active?'rgba(24,136,136,0.18)':'rgba(0,0,0,0.3)';ctx.fillRect(tx+2,TAB_Y,TAB_W-4,34); ctx.fillStyle=active?tab.color:'#666';ctx.font=(active?'bold ':'')+'13px "Courier New"';ctx.textAlign='center';ctx.fillText(tab.label,tx+TAB_W/2,TAB_Y+22);ctx.textAlign='left'; if(active){ctx.fillStyle=tab.color;ctx.fillRect(tx+2,TAB_Y+32,TAB_W-4,3);} });
    const CY=TAB_Y+40,CH=PH-(CY-PY)-50,items=this.tabItems(player),COL_W=260,DESC_X=PX+280;
    if(items.length===0){ ctx.fillStyle='#445';ctx.font='14px "Courier New"';ctx.textAlign='center';ctx.fillText('Nenhum item coletado ainda.',W/2,CY+CH/2);ctx.textAlign='left'; }
    else { items.forEach((item,i)=>{ const iy=CY+16+i*52,sel=(i===this.cursor),eq=(player.activeTool===item.id); if(sel){ctx.fillStyle='rgba(24,136,136,0.18)';_rr(PX+16,iy-10,COL_W,46,8);ctx.fill();ctx.strokeStyle='#40d0d0';ctx.lineWidth=1.5;_rr(PX+16,iy-10,COL_W,46,8);ctx.stroke();} const cnt=item.count>1?' ×'+item.count:''; ctx.font='20px serif';ctx.fillText(item.icon,PX+28,iy+20); ctx.font=(eq?'bold ':'')+'14px "Courier New"';ctx.fillStyle=eq?'#ffe060':(sel?'#f0e8c0':'#aaa');ctx.fillText(item.nome+cnt,PX+62,iy+14); });
      const sel=items[this.cursor]; if(sel){ ctx.fillStyle='rgba(24,136,136,0.08)';_rr(DESC_X,CY,PW-DESC_X+PX-16,CH-10,8);ctx.fill(); ctx.font='44px serif';ctx.textAlign='center';ctx.fillText(sel.icon,DESC_X+(PW-DESC_X+PX-16)/2,CY+68); ctx.font='bold 15px "Courier New"';ctx.fillStyle='#40d0d0';ctx.fillText(sel.nome,DESC_X+(PW-DESC_X+PX-16)/2,CY+98); const catL={ferramenta:'🔧 Ferramenta',minerio:'⛏ Minério',artefato:'🏺 Artefato'}; ctx.font='11px "Courier New"';ctx.fillStyle='#888';ctx.fillText(catL[sel.cat],DESC_X+(PW-DESC_X+PX-16)/2,CY+116);ctx.textAlign='left';ctx.fillStyle='rgba(24,136,136,0.25)';ctx.fillRect(DESC_X+20,CY+124,PW-DESC_X+PX-56,1); const descLines=sel.desc.split('\n');ctx.font='13px "Courier New"';ctx.fillStyle='#f0e8c0';descLines.forEach((l,i)=>{ctx.textAlign='center';ctx.fillText(l,DESC_X+(PW-DESC_X+PX-16)/2,CY+144+i*22);});ctx.textAlign='left';
        if(sel.cat==='ferramenta'){ const btnTxt=player.activeTool===sel.id?'[E] Desequipar':'[E] Equipar'; ctx.fillStyle=player.activeTool===sel.id?'rgba(180,80,20,0.3)':'rgba(24,136,136,0.2)';_rr(DESC_X+40,CY+CH-60,PW-DESC_X+PX-96,34,8);ctx.fill();ctx.strokeStyle=player.activeTool===sel.id?'#c04020':'#40d0d0';ctx.lineWidth=1.5;_rr(DESC_X+40,CY+CH-60,PW-DESC_X+PX-96,34,8);ctx.stroke(); ctx.font='bold 13px "Courier New"';ctx.fillStyle=player.activeTool===sel.id?'#e06040':'#40d0d0';ctx.textAlign='center';ctx.fillText(btnTxt,DESC_X+(PW-DESC_X+PX-16)/2,CY+CH-38);ctx.textAlign='left'; } } }
    ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(PX,PY+PH-38,PW,38);ctx.fillStyle='rgba(24,136,136,0.3)';ctx.fillRect(PX+16,PY+PH-39,PW-32,1);ctx.font='11px "Courier New"';ctx.fillStyle='#888';ctx.textAlign='center';ctx.fillText('◀ ▶ Abas   ↑ ↓ Navegar   E Equipar/Desequipar   I Fechar',W/2,PY+PH-14);ctx.textAlign='left';
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
    ctx.shadowColor='rgba(0,0,0,0.6)';ctx.shadowBlur=12; ctx.fillStyle='rgba(2,6,8,0.95)';roundRect(bx,by,bubW,bubH,14);ctx.fill();ctx.shadowBlur=0;
    ctx.strokeStyle='#188888';ctx.lineWidth=2.5;roundRect(bx,by,bubW,bubH,14);ctx.stroke();
    const tailBaseX=Math.max(bx+30,Math.min(pcx,bx+bubW-30)),tailTopY=by+bubH,tailTipX=pcx,tailTipY=Math.min(pcy,tailTopY+36);
    ctx.fillStyle='rgba(2,6,8,0.95)'; ctx.beginPath();ctx.moveTo(tailBaseX-14,tailTopY);ctx.lineTo(tailBaseX+14,tailTopY);ctx.lineTo(tailTipX,tailTipY);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#188888';ctx.lineWidth=2; ctx.beginPath();ctx.moveTo(tailBaseX-14,tailTopY);ctx.lineTo(tailTipX,tailTipY);ctx.lineTo(tailBaseX+14,tailTopY);ctx.stroke();
    const fx=bx+pad,fy=by+pad;
    CORVAN.drawFace(ctx, this.faceFrame, fx, fy, faceW, faceH);
    ctx.strokeStyle='rgba(24,136,136,0.5)';ctx.lineWidth=1.5;ctx.strokeRect(fx,fy,faceW,faceH);
    const tx=fx+faceW+pad; ctx.font=NAMEFNT;ctx.fillStyle='#40d0d0';ctx.fillText(this.speakerTxt,tx,by+pad+14);
    ctx.font=FONT;ctx.fillStyle='#f0e8c0';this.lines.forEach((l,i)=>ctx.fillText(l,tx,by+pad+36+i*lineH));
    const pulse=0.55+Math.sin(Date.now()/400)*0.45; ctx.fillStyle=`rgba(24,136,136,${pulse})`;ctx.font='12px "Courier New"';ctx.textAlign='right';ctx.fillText('[E] Continuar →',bx+bubW-pad,by+bubH-8);ctx.textAlign='left';
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
  ctx.fillStyle='rgba(0,0,0,0.82)';roundRect(nx,ny,tw,28,6);ctx.fill();ctx.strokeStyle='#40d0d0';ctx.lineWidth=1.5;roundRect(nx,ny,tw,28,6);ctx.stroke();
  ctx.fillStyle='#40d0d0';ctx.textAlign='center';ctx.fillText(notifText,W/2,ny+19);ctx.textAlign='left';ctx.restore();
}

// ── Pop-up informativo ────────────────────────────────────────────
const POPUP={ active:false,title:'',lines:[],icon:'🔺',timer:0,
  show(title,icon,text,duration=8000){this.active=true;this.title=title;this.icon=icon;this.lines=text.split('\n');this.timer=duration;},
  tick(){if(this.timer>0){this.timer-=16;if(this.timer<=0)this.active=false;}},
  draw(){ if(!this.active)return; const alpha=Math.min(1,this.timer/400); const PW=370,lineH=20;
    const innerW=PW-32;
    const wrapped=wrapText(this.lines.join(' '),innerW,'12px "Courier New"');
    const PH=wrapped.length*lineH+100,PX=W-PW-20,PY=60;
    ctx.save();ctx.globalAlpha=alpha; ctx.fillStyle='rgba(2,6,8,0.94)';_rr(PX,PY,PW,PH,12);ctx.fill();ctx.strokeStyle='#188888';ctx.lineWidth=2;_rr(PX,PY,PW,PH,12);ctx.stroke();
    ctx.font='32px serif';ctx.textAlign='center';ctx.fillText(this.icon,PX+40,PY+46); ctx.textAlign='left';
    let titleFont=13;ctx.font=`bold ${titleFont}px "Courier New"`;
    while(ctx.measureText(this.title).width>PW-60-14&&titleFont>9){titleFont--;ctx.font=`bold ${titleFont}px "Courier New"`;}
    ctx.fillStyle='#40d0d0';ctx.fillText(this.title,PX+60,PY+28);
    ctx.font='12px "Courier New"';ctx.fillStyle='#f0e8c0';ctx.textAlign='left';wrapped.forEach((l,i)=>ctx.fillText(l,PX+16,PY+52+i*lineH));ctx.restore(); }
};

// ── Núcleo de Obsidiana — mecânica central: ângulo + força ─────────
class ObsidianNodule {
  constructor(x,y,isRiolito,idealAngle,sizeTag){
    this.x=x; this.y=y; this.w=54; this.h=46;
    this.isRiolito=!!isRiolito;
    this.idealAngle = idealAngle!==undefined ? idealAngle : (45+Math.random()*20); // 45-65 padrão
    this.sizeTag=sizeTag||'geral'; // 'precisao'|'geral'|'cerimonia'
    this.depleted=false;   // true quando já gerou 1 lâmina ou foi fragmentado
    this.shattered=false;  // força excessiva destruiu o núcleo
    this.riolitoWarned=false;
    this.t=Math.random()*Math.PI*2;
    this.strikeFlash=0;    // anim de golpe
    this.lastResult=null;  // 'success'|'thud'|'shatter'|'crunch'
  }
  tick(){ this.t+=0.04; if(this.strikeFlash>0)this.strikeFlash--; }
  attemptStrike(angle, force){
    this.strikeFlash=14;
    if(this.isRiolito){
      this.lastResult='crunch'; sfx('crunch');
      dustBurstStone(this.x+this.w/2,this.y,'#4a4448',6);
      return {success:false, reason:'riolito'};
    }
    if(this.shattered || this.depleted) return {success:false, reason:'depleted'};
    const diff = Math.abs(angle - this.idealAngle);
    if(diff > 10){
      this.lastResult='thud'; sfx('thud');
      return {success:false, reason:'angle'};
    }
    if(force > 82){
      this.shattered=true; this.lastResult='shatter'; sfx('shatter');
      glassShardBurst(this.x+this.w/2,this.y+this.h/2,16);
      return {success:false, reason:'force_high'};
    }
    if(force < 35){
      this.lastResult='thud'; sfx('thud');
      return {success:false, reason:'force_low'};
    }
    // Sucesso!
    this.depleted=true; this.lastResult='success'; sfx('klink');
    glassShardBurst(this.x+this.w/2,this.y+this.h/2,10);
    return {success:true};
  }
  draw(){
    const sx=this.x-cam.x, sy=this.y-cam.y;
    if(sx<-100||sx>W+100) return;
    const shakeX = this.strikeFlash>0 ? (Math.random()-.5)*4 : 0;
    ctx.save(); ctx.translate(sx+shakeX,sy);
    // Bloco de rocha vulcânica
    const baseColor = this.isRiolito ? '#585458' : '#141418';
    const hiColor    = this.isRiolito ? '#6c686c' : '#282430';
    if(this.depleted || this.shattered){
      // Núcleo já usado — mais opaco / rachado
      ctx.fillStyle='#302c30'; ctx.fillRect(0,0,this.w,this.h);
      ctx.strokeStyle='#484448'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(this.w*0.3,4); ctx.lineTo(this.w*0.5,this.h-4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(this.w*0.6,4); ctx.lineTo(this.w*0.4,this.h-6); ctx.stroke();
    } else {
      ctx.fillStyle=baseColor; ctx.fillRect(0,0,this.w,this.h);
      ctx.fillStyle=hiColor; ctx.fillRect(3,3,this.w-6,this.h-6);
      if(!this.isRiolito){
        // Brilho vítreo (reflexos)
        const sh=0.3+Math.sin(this.t*1.5)*0.25;
        ctx.fillStyle=`rgba(140,200,220,${sh})`;
        ctx.fillRect(this.w*0.2,this.h*0.25,8,3);
        ctx.fillRect(this.w*0.6,this.h*0.5,6,2);
      } else {
        // Textura microcristalina fosca
        ctx.fillStyle='rgba(160,155,160,0.35)';
        for(let i=0;i<6;i++){ ctx.fillRect(6+Math.sin(i*3)*14+this.w*0.3,6+i*6,3,3); }
      }
    }
    ctx.strokeStyle='#0a0810'; ctx.lineWidth=2; ctx.strokeRect(0,0,this.w,this.h);
    ctx.restore();
    // Indicador
    if(this.depleted && !this.isRiolito){
      ctx.font='bold 9px "Courier New"'; ctx.fillStyle='#606060'; ctx.textAlign='center';
      ctx.fillText('núcleo esgotado', sx+this.w/2, sy-8); ctx.textAlign='left';
    } else if(this.shattered){
      ctx.font='bold 9px "Courier New"'; ctx.fillStyle='#a05040'; ctx.textAlign='center';
      ctx.fillText('fragmentado — perdido', sx+this.w/2, sy-8); ctx.textAlign='left';
    } else {
      const pulse=0.5+Math.sin(this.t*2)*0.5;
      ctx.font='bold 9px "Courier New"'; ctx.fillStyle=this.isRiolito?`rgba(160,150,150,${pulse})`:`rgba(80,220,220,${pulse})`; ctx.textAlign='center';
      ctx.fillText('[E] Talhar', sx+this.w/2, sy-8); ctx.textAlign='left';
    }
  }
}

// ── Interface de Talhe (Knapping) — ângulo + força ─────────────────
const KNAP_UI = {
  active:false,
  nodule:null,
  angle:50,   // 0-90
  force:50,   // 0-100
  msgTimer:0,
  msgText:'',
  msgColor:'#40d0d0',
  open(nodule){ this.active=true; this.nodule=nodule; this.angle=50; this.force=50; G.dialog=false; },
  close(){ this.active=false; this.nodule=null; },
  tick(){
    if(!this.active) return;
    if(jpL()) this.angle=Math.max(0,this.angle-5);
    if(jpR()) this.angle=Math.min(90,this.angle+5);
    if(jpU()) this.force=Math.min(100,this.force+8);
    if(jpD()) this.force=Math.max(0,this.force-8);
    if(jp['KeyJ']||jp['_te']||jp['Enter']) this._strike();
    if(isJ()) this.close(); // pular = cancelar/recuar
    if(this.msgTimer>0) this.msgTimer--;
  },
  _strike(){
    const nodule=this.nodule; if(!nodule) return;
    const res = nodule.attemptStrike(this.angle, this.force);
    const player=G.player;
    if(res.success){
      player.score+=15;
      player.items.push('obsidiana');
      const cnt=player.items.filter(i=>i==='obsidiana').length;
      _journalColetar('obsidiana', cnt);
      const sizeLbl={precisao:'de Precisão (minúscula)',geral:'de Uso Geral',cerimonia:'de Cerimônia (grande)'}[nodule.sizeTag]||'';
      notify(`🔺 Lâmina de Obsidiana ${sizeLbl} produzida! (${cnt}/3)`);
      this.msgText='KLINK! Lasca perfeita.'; this.msgColor='#40e0e0'; this.msgTimer=60;
      if(cnt===1){
        POPUP.show('Fratura Conchoidal','🔺','A borda de uma lasca de obsidiana tem\napenas 3 nanômetros — 500× mais fina que\num bisturi de aço. Cirurgiões usam obsidiana\nem microcirurgias até hoje.',7500);
      }
      setTimeout(()=>this.close(),500);
    } else if(res.reason==='riolito'){
      this.msgText='CRUNCH — não flui, tem cristais dentro.'; this.msgColor='#a09090'; this.msgTimer=70;
      if(!nodule.riolitoWarned){
        nodule.riolitoWarned=true;
        setTimeout(()=>{ this.close(); showDialog(['"Esta pedra não flui — tem cristais dentro. Não serve para lâminas."'],null); },500);
      }
    } else if(res.reason==='angle'){
      this.msgText='THUD — ângulo incorreto. Ajuste ← →.'; this.msgColor='#c09040'; this.msgTimer=60;
    } else if(res.reason==='force_high'){
      this.msgText='CRACK! Força excessiva — núcleo fragmentado.'; this.msgColor='#e05030'; this.msgTimer=80;
      setTimeout(()=>this.close(),700);
    } else if(res.reason==='force_low'){
      this.msgText='Nada aconteceu — força insuficiente. Aumente ↑.'; this.msgColor='#8080a0'; this.msgTimer=60;
    } else if(res.reason==='depleted'){
      this.msgText='Este núcleo já foi esgotado.'; this.msgColor='#606060'; this.msgTimer=50;
      setTimeout(()=>this.close(),400);
    }
  },
  draw(){
    if(!this.active) return;
    ctx.fillStyle='rgba(0,0,0,0.72)'; ctx.fillRect(0,0,W,H);
    const PW=560, PH=340, PX=(W-PW)/2, PY=(H-PH)/2;
    ctx.fillStyle='rgba(4,8,10,0.96)'; _rr(PX,PY,PW,PH,16); ctx.fill();
    ctx.strokeStyle='#188888'; ctx.lineWidth=2.5; _rr(PX,PY,PW,PH,16); ctx.stroke();
    ctx.font='bold 15px "Courier New"'; ctx.fillStyle='#40d0d0'; ctx.textAlign='center';
    ctx.fillText('🔨 TALHE POR PERCUSSÃO DIRETA (KNAPPING)', W/2, PY+30);
    ctx.textAlign='left';

    // Núcleo grande no centro
    const coreX=PX+PW/2, coreY=PY+150;
    ctx.save(); ctx.translate(coreX,coreY);
    const isR=this.nodule.isRiolito;
    ctx.fillStyle=isR?'#585458':'#141418'; ctx.fillRect(-40,-32,80,64);
    ctx.fillStyle=isR?'#6c686c':'#282430'; ctx.fillRect(-36,-28,72,56);
    if(!isR){ const sh=0.3+Math.sin(Date.now()/500)*0.2; ctx.fillStyle=`rgba(140,200,220,${sh})`; ctx.fillRect(-20,-16,14,4); }
    ctx.strokeStyle='#0a0810'; ctx.lineWidth=2; ctx.strokeRect(-40,-32,80,64);
    ctx.restore();

    // Arco de ângulo (0-90°)
    const arcCx=PX+130, arcCy=PY+230, arcR=60;
    ctx.strokeStyle='rgba(80,220,220,0.25)'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.arc(arcCx,arcCy,arcR,Math.PI,Math.PI*1.5,false); ctx.stroke();
    // Faixa ideal (verde) — ideal ± 10°
    const idealA = this.nodule.idealAngle;
    const a0 = Math.PI + Math.max(0,idealA-10)/90*(Math.PI/2);
    const a1 = Math.PI + Math.min(90,idealA+10)/90*(Math.PI/2);
    ctx.strokeStyle='rgba(60,220,120,0.5)'; ctx.lineWidth=6;
    ctx.beginPath(); ctx.arc(arcCx,arcCy,arcR,a0,a1,false); ctx.stroke();
    // Ponteiro do ângulo atual
    const curA = Math.PI + this.angle/90*(Math.PI/2);
    const px2=arcCx+Math.cos(curA)*arcR, py2=arcCy+Math.sin(curA)*arcR;
    ctx.strokeStyle='#ffe060'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(arcCx,arcCy); ctx.lineTo(px2,py2); ctx.stroke();
    ctx.fillStyle='#ffe060'; ctx.beginPath(); ctx.arc(px2,py2,5,0,Math.PI*2); ctx.fill();
    ctx.font='11px "Courier New"'; ctx.fillStyle='#a0e0e0'; ctx.textAlign='center';
    ctx.fillText(`Ângulo: ${this.angle}°  (← →)`, arcCx, arcCy+24);
    ctx.textAlign='left';

    // Barra de força vertical
    const fbX=PX+PW-100, fbY=PY+180, fbW=28, fbH=100;
    ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(fbX,fbY,fbW,fbH);
    // Zona ideal 35-82
    const zoneTop = fbY + fbH*(1-0.82);
    const zoneH = fbH*((82-35)/100);
    ctx.fillStyle='rgba(60,220,120,0.25)'; ctx.fillRect(fbX,zoneTop,fbW,zoneH);
    const fillH = fbH*(this.force/100);
    ctx.fillStyle = this.force>82?'rgba(224,80,48,0.9)': this.force<35?'rgba(120,120,160,0.7)':'rgba(80,220,220,0.9)';
    ctx.fillRect(fbX,fbY+fbH-fillH,fbW,fillH);
    ctx.strokeStyle='rgba(80,180,180,0.6)'; ctx.lineWidth=1.5; ctx.strokeRect(fbX,fbY,fbW,fbH);
    ctx.font='11px "Courier New"'; ctx.fillStyle='#a0e0e0'; ctx.textAlign='center';
    ctx.fillText(`Força`, fbX+fbW/2, fbY-8);
    ctx.fillText(`${this.force}  (↑ ↓)`, fbX+fbW/2, fbY+fbH+16);
    ctx.textAlign='left';

    // Mensagem de resultado
    if(this.msgTimer>0){
      ctx.font='bold 13px "Courier New"'; ctx.fillStyle=this.msgColor; ctx.textAlign='center';
      ctx.fillText(this.msgText, W/2, PY+PH-46);
      ctx.textAlign='left';
    }
    // Controles
    ctx.font='11px "Courier New"'; ctx.fillStyle='#789'; ctx.textAlign='center';
    ctx.fillText('← → Ângulo   ↑ ↓ Força   [E] Golpear   [Espaço] Recuar', W/2, PY+PH-16);
    ctx.textAlign='left';
  }
};

// ── Casuário do Sul companion ───────────────────────────────────────
class Casuario {
  constructor(){
    this.x=400;this.y=300;this.frame=0;this.visible=false;this.state='perched';
    this.facing=1;this.guideMin=0;this.guideMax=0;this.guideY=0;this.lastX=this.x;
  }
  update(player){
    if(!this.visible)return;
    this.lastX=this.x;
    if(this.state==='guide'){
      const desired=Math.max(this.guideMin,Math.min(this.guideMax,player.x+150));
      this.x+=(desired-this.x)*0.045;
      this.y+=(this.guideY-this.y)*0.18;
      if(Math.abs(this.x-this.lastX)>0.08)this.facing=this.x>this.lastX?1:-1;
    }
    const walking=this.state==='guide'&&Math.abs(this.x-this.lastX)>0.08;
    this.frame+=walking?0.09:0.025;
  }
  land(x,y){ this.x=x; this.y=y; this.state='perched'; this.facing=-1; this.visible=true; }
  guide(x,y,minX,maxX){ this.x=x; this.y=y; this.guideY=y; this.guideMin=minX; this.guideMax=maxX; this.state='guide'; this.facing=1; this.visible=true; }
  draw(){
    if(!this.visible)return;
    const sx=this.x-cam.x, sy=this.y-cam.y; if(sx<-100||sx>W+100) return;
    ctx.save();
    if(IMG['casuario_img']&&IMG['casuario_img'].complete&&IMG['casuario_img'].naturalWidth>0){
      const dw=110,dh=110,bob=this.state==='guide'?Math.sin(this.frame*1.4)*2:0;
      if(this.facing<0){ctx.translate(sx+dw/2,sy-dh/2+bob);ctx.scale(-1,1);}else ctx.translate(sx-dw/2,sy-dh/2+bob);
      ctx.drawImage(IMG['casuario_img'],0,0,96,96,0,0,dw,dh);
    } else {
      ctx.translate(sx,sy); const bob=this.state==='guide'?Math.sin(this.frame*1.4)*2:0;
      if(this.facing<0)ctx.scale(-1,1);
      // Casuário fallback vetorial — corpo negro, pescoço azul, capacete
      ctx.fillStyle='#181818'; ctx.beginPath(); ctx.ellipse(0,bob+6,22,26,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#2868a0'; ctx.fillRect(14,bob-24,7,26);
      ctx.fillStyle='#c02818'; ctx.beginPath(); ctx.arc(18,bob-6,5,0,Math.PI); ctx.fill();
      ctx.fillStyle='#906020'; ctx.beginPath(); ctx.moveTo(20,bob-30); ctx.lineTo(24,bob-40); ctx.lineTo(28,bob-30); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#d0c020'; ctx.beginPath(); ctx.arc(19,bob-27,2,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#282020'; ctx.fillRect(-2,bob+24,3,16); ctx.fillRect(6,bob+24,3,16);
      // Garras
      ctx.fillStyle='#a09080'; ctx.fillRect(-3,bob+38,4,3); ctx.fillRect(5,bob+38,4,3);
    }
    ctx.restore();
  }
  speak(msg){ showDialog(msg,null,'🦤 CASUÁRIO DO SUL'); }
}

// ── Enemy — Lapita guardas e aves marinhas ─────────────────────────
class Enemy{
  constructor(x,y,type,patrol){
    this.x=x;this.y=y;this.spawnX=x;this.type=type;
    this.w=type==='ave'?32:42; this.h=type==='ave'?22:56;
    this.patrol=patrol;this.vx=type==='ave'?2.2:1.1;this.facing=1;this.dead=false;this.frame=0;
    if(type==='ave') this.baseY=y;
  }
  update(plats,player){
    if(this.dead)return; this.x+=this.vx;this.frame+=0.08;
    if(this.type==='ave'){ this.y=this.baseY+Math.sin(this.frame*1.6)*16; if(Math.abs(this.x-this.spawnX)>this.patrol)this.vx=-this.vx; this.facing=this.vx>0?1:-1; return; }
    let onG=false; for(const p of plats){if(p.type==='spike'||p.type==='_dead')continue;if(this.x+this.w>p.x&&this.x<p.x+p.w&&this.y+this.h>=p.y&&this.y+this.h<=p.y+10)onG=true;}
    const edge=this.vx>0?this.x+this.w:this.x; let onEdge=false;
    for(const p of plats){if(p.type==='spike'||p.type==='_dead')continue;if(edge>p.x&&edge<p.x+p.w&&this.y+this.h+2>=p.y&&this.y+this.h+2<=p.y+12)onEdge=true;}
    if((onG&&!onEdge)||Math.abs(this.x-this.spawnX)>this.patrol)this.vx=-this.vx;
    this.facing=this.vx>0?1:-1;
  }
  draw(){
    if(this.dead)return; const sx=this.x-cam.x,sy=this.y-cam.y; if(sx<-80||sx>W+80)return;
    ctx.save();ctx.translate(sx+this.w/2,sy+this.h);if(this.facing===-1)ctx.scale(-1,1);
    if(this.type==='guerreiro'){
      ctx.fillStyle='#4a3020'; ctx.fillRect(-18,-52,36,52);
      ctx.fillStyle='#5a4028'; ctx.fillRect(-16,-50,32,20);
      ctx.fillStyle='#c8a878'; ctx.fillRect(-4,-52,8,8);
      ctx.fillStyle='#282018'; ctx.fillRect(-8,-58,16,8); // penas na cabeça
      ctx.fillStyle='#d04020'; ctx.fillRect(-3,-60,3,6); ctx.fillRect(2,-62,3,8);
      ctx.fillStyle='#382818'; ctx.fillRect(-16,-28,14,28); ctx.fillRect(2,-28,14,28);
      ctx.fillStyle='#786040'; ctx.fillRect(-24,-44,6,26); // lança
    } else {
      const flap=Math.abs(Math.sin(this.frame*2.5))*8;
      ctx.fillStyle='#e8e0d0'; ctx.beginPath(); ctx.ellipse(0,-8,9,6,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#d0c8b8'; ctx.beginPath(); ctx.arc(8,-11,5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#f0f0f0';
      ctx.beginPath(); ctx.moveTo(-6,-8); ctx.lineTo(-24,-16-flap); ctx.lineTo(-26,-2-flap); ctx.lineTo(-6,-2); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(6,-8); ctx.lineTo(24,-16-flap); ctx.lineTo(26,-2-flap); ctx.lineTo(6,-2); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#e8a020'; ctx.fillRect(11,-13,4,2);
    }
    ctx.restore();
  }
}

// ── Col (itens flutuantes) ────────────────────────────────────────
class Col{
  constructor(x,y,type){this.x=x;this.y=y;this.w=30;this.h=30;this.type=type;this.done=false;this.t=Math.random()*Math.PI*2;}
  tick(){if(!this.done)this.t+=0.06;}
  draw(){
    if(this.done) return;
    const sx=this.x-cam.x, sy=this.y-cam.y+Math.sin(this.t)*5; if(sx<-50||sx>W+50) return;
    ctx.save(); ctx.translate(sx+15, sy+15);
    if(this.type==='percutor'){
      if(IMG['percutor_img']) ctx.drawImage(IMG['percutor_img'],0,0,48,48,-15,-15,30,30);
      else{ ctx.fillStyle='#8a8078';ctx.beginPath();ctx.arc(0,0,10,0,Math.PI*2);ctx.fill(); }
    } else if(this.type==='protetor'){
      if(IMG['protetor_img']) ctx.drawImage(IMG['protetor_img'],0,0,48,48,-15,-15,30,30);
      else{ ctx.fillStyle='#6a4828';ctx.fillRect(-12,-8,24,16); }
    } else if(this.type==='talha'){
      if(IMG['talha_img']) ctx.drawImage(IMG['talha_img'],0,0,48,48,-15,-15,30,30);
      else{ ctx.fillStyle='#e0d8c0';ctx.fillRect(-3,-14,6,28); }
    } else if(this.type==='ceramica'){
      if(IMG['ceramica_img']) ctx.drawImage(IMG['ceramica_img'],0,0,48,48,-15,-15,30,30);
      else{ ctx.fillStyle='#c88850';ctx.fillRect(-12,-10,24,20); ctx.fillStyle='#382418';for(let i=0;i<4;i++)ctx.fillRect(-10+i*6,-8,2,16); }
    }
    ctx.restore();
  }
}

// ── Trigger ───────────────────────────────────────────────────────
class Trigger{
  constructor(x,y,w,h,label,fn){this.x=x;this.y=y;this.w=w;this.h=h;this.label=label;this.fn=fn;this.done=false;}
  draw(px,py){ if(this.done)return; const near=Math.abs((px+24)-(this.x+this.w/2))<this.w/2+72&&Math.abs((py+40)-(this.y+this.h/2))<this.h/2+72; if(!near)return; const sx=this.x+this.w/2-cam.x; const syItem=this.y-cam.y-26+Math.sin(Date.now()/350)*4; const headClearY=(py-cam.y)+8; const sy=Math.min(syItem,headClearY); const txt='[E] '+this.label;ctx.font='14px "Courier New"';const tw=ctx.measureText(txt).width+24; const bx=Math.max(tw/2+6,Math.min(sx,W-tw/2-6)); ctx.fillStyle='rgba(0,0,0,0.78)';roundRect(bx-tw/2,sy-16,tw,24,4);ctx.fill();ctx.strokeStyle='#40d0d0';ctx.lineWidth=1.5;roundRect(bx-tw/2,sy-16,tw,24,4);ctx.stroke();ctx.fillStyle='#40d0d0';ctx.textAlign='center';ctx.fillText(txt,bx,sy);ctx.textAlign='left'; }
}

// ── Player ────────────────────────────────────────────────────────
class Player{
  constructor(x,y){ this.x=x;this.y=y;this.prevX=x;this.prevY=y;this.w=40;this.h=80; this.vx=0;this.vy=0;this.onG=false;this.facing=1; this.hp=3;this.maxHp=3;this.inv=0;this.dead=false; this.activeTool=null;this.frame=0;this.ft=0;this.state='idle'; this.coyote=0;this.jbuf=0;this.onMoving=null; this.items=[];this.score=0;this.interactAnim=0; }
  overlaps(r){return this.x<r.x+r.w&&this.x+this.w>r.x&&this.y<r.y+r.h&&this.y+this.h>r.y;}
  near(r,d=80){return Math.abs(this.x+20-(r.x+r.w/2))<r.w/2+d&&Math.abs(this.y+40-(r.y+r.h/2))<r.h/2+d;}
  update(level){
    if(G.dialog || KNAP_UI.active) return;
    this.prevX=this.x;this.prevY=this.y;
    if(isL()){this.vx=-PSPD;this.facing=-1;}else if(isR()){this.vx=PSPD;this.facing=1;}else this.vx*=0.7;
    if(this.onG)this.coyote=8;else if(this.coyote>0)this.coyote--;
    if(isJ())this.jbuf=10; if(this.jbuf>0)this.jbuf--;
    if(this.jbuf>0&&(this.onG||this.coyote>0)){this.vy=JUMPF;this.onG=false;this.coyote=0;this.jbuf=0;sfx('jump');}
    if(this.onMoving){this.x+=this.onMoving.vx||0;this.y+=this.onMoving.vy||0;} this.onMoving=null;
    this.vy=Math.min(this.vy+GRAV,MAXFALL); this.x+=this.vx;this._colX(level.plats);
    this.onG=false;this.y+=this.vy;this._colY(level.plats); this.x=Math.max(0,this.x);
    if(!this.inv){ for(const p of level.plats) if(p.type==='spike'&&this.overlaps(p))this._hurt(1,level);
      for(const e of level.enemies){ if(!e.dead&&this.overlaps(e)){ if(this.vy>2&&this.y+this.h<e.y+e.h*0.5){e.dead=true;this.vy=-8;burst(e.x+20,e.y,'#40d0d0',10);sfx('coin');}else{this._hurt(1,level);this.vy=-7;this.vx=(this.x<e.x?-7:7);} } } }
    if(this.inv>0)this.inv--;
    if(this.interactAnim>0)this.interactAnim--;

    let eConsumed = false;
    const ePressed = isE();

    // Coletáveis simples
    for(const c of level.cols){
      if(!c.done&&this.overlaps(c)){
        c.done=true;
        this.items.push(c.type); sfx('item'); _journalColetar(c.type);
        burst(c.x+15,c.y+15,'#40d0d0',10);
        if(c.type==='percutor') notify('🪨 Percutor de Quartzito coletado!');
        if(c.type==='protetor') notify('🧤 Protetor de Couro de Mão coletado!');
        if(c.type==='talha')    notify('🦴 Talha-Obsidiana de Osso recebida!');
        if(c.type==='ceramica'){ sfx('dig_sand'); setTimeout(()=>sfx('shells'),200); notify('🏺 Fragmento de Cerâmica Lapita encontrado!'); }
      }
    }

    // Abrir modo de talhe (knapping) num núcleo
    if(level.nodules && ePressed && !eConsumed){
      for(const nod of level.nodules){
        if(this.near({x:nod.x,y:nod.y,w:nod.w,h:nod.h},70)){
          if(!this.items.includes('percutor')){ notify('Você precisa do 🪨 Percutor de Quartzito!'); eConsumed=true; break; }
          if(!this.items.includes('protetor')){ notify('Use o 🧤 Protetor de Couro antes de talhar!'); eConsumed=true; break; }
          if(nod.depleted || nod.shattered){ notify('Este núcleo já foi utilizado.'); eConsumed=true; break; }
          KNAP_UI.open(nod); eConsumed=true; break;
        }
      }
    }

    // Triggers
    if(ePressed && !eConsumed && this.onG){for(const t of level.triggers){if(!t.done&&this.near(t)){t.fn(this,level);break;}}}

    if(this.y>level.H+200)this._hurt(3,level);
    if(!this.onG&&this.vy<0)this.state='jump';else if(!this.onG&&this.vy>0)this.state='fall';else if(Math.abs(this.vx)>0.5)this.state='run';else this.state='idle';
    const spd=this.state==='run'?6:this.state==='idle'?18:8; if(++this.ft>=spd){this.ft=0;this.frame=(this.frame+1)%6;}
  }
  _colX(plats){
    for(const p of plats){
      if(p.type==='spike'||p.type==='_dead')continue;
      if(!this.overlaps(p))continue;
      if(this.prevY+this.h<=p.y+2||this.prevY>=p.y+p.h-2)continue;
      if(this.prevX+this.w<=p.x)this.x=p.x-this.w;
      else if(this.prevX>=p.x+p.w)this.x=p.x+p.w;
      else if(this.vx>0)this.x=p.x-this.w;
      else if(this.vx<0)this.x=p.x+p.w;
      this.vx=0;
    }
  }
  _colY(plats){
    for(const p of plats){
      if(p.type==='spike'||p.type==='_dead')continue;
      if(p.type==='trapdoor'&&this.vy<0)continue;
      if(!this.overlaps(p))continue;
      const wasAbove=this.prevY+this.h<=p.y+4;
      const wasBelow=this.prevY>=p.y+p.h-4;
      if(this.vy>=0&&wasAbove){
        this.y=p.y-this.h;this.vy=0;this.onG=true;if(p.moving)this.onMoving=p;if(p.type==='trapdoor'&&p.crumble===undefined)p.crumble=70;
      }else if(this.vy<0&&wasBelow){
        this.y=p.y+p.h;this.vy=0;
      }else if(this.vy>=0){
        this.y=p.y-this.h;this.vy=0;this.onG=true;if(p.moving)this.onMoving=p;if(p.type==='trapdoor'&&p.crumble===undefined)p.crumble=70;
      }else{
        this.y=p.y+p.h;this.vy=0;
      }
    }
  }
  _hurt(dmg,level){ if(this.inv>0)return; this.hp-=dmg;this.inv=100; burst(this.x+20,this.y+40,'#ff4040',10);sfx('hit'); if(this.hp<=0){this.hp=0;this.dead=true;} }
  draw(){
    if(this.dead)return; const dx=this.x-cam.x,dy=this.y-cam.y;
    // Escala corrigida para o padrão real do jogo (S=1.5, o mesmo usado desde
    // a Fase1-1, origem do sprite, e na maioria das fases). Uma correção
    // anterior usou S≈1.67 (copiado da Fase4-3), mas esse valor é uma exceção
    // — só Fase3-3/Fase4-3 usam S=1.67. dh agora é fixo em 46*1.5=69px,
    // independente da altura da hitbox de colisão (80px) desta fase.
    const dw=this.w,dh=69; const ox=(dw-this.w)/2,oy=dh-this.h; const flip=this.facing===-1;
    if(this.interactAnim>0&&this.state!=='jump') CORVAN.draw(ctx, 'dig',  this.frame,    dx-ox,dy-oy,dw,dh,flip);
    else if(this.state==='run')                  CORVAN.draw(ctx, 'walk', this.frame,    dx-ox,dy-oy,dw,dh,flip);
    else                                         CORVAN.draw(ctx, 'idle', this.frame%4,  dx-ox,dy-oy,dw,dh,flip);
    if(this.inv>0&&Math.floor(this.inv/6)%2===0){ctx.fillStyle='rgba(255,60,60,0.35)';ctx.fillRect(dx,dy,this.w,this.h);}
  }
}

// ── Background draw ───────────────────────────────────────────────
function drawBg(bgKey){
  const img=IMG[bgKey];
  if(img&&img.complete&&img.naturalWidth>0){
    const scale=Math.max(W/img.naturalWidth,H/img.naturalHeight);
    const sw=img.naturalWidth*scale, sh=img.naturalHeight*scale;
    ctx.drawImage(img,(W-sw)/2,(H-sh)/2,sw,sh);
  } else {
    const fb={bg01:'#0c0a10',bg02:'#141014',bg03:'#0c0a0c',bg04:'#0c080c'};
    const grd=ctx.createLinearGradient(0,0,0,H);
    grd.addColorStop(0,fb[bgKey]||'#0a0a10'); grd.addColorStop(1,'#020204');
    ctx.fillStyle=grd; ctx.fillRect(0,0,W,H);
  }
  ctx.fillStyle='rgba(0,0,0,0.22)'; ctx.fillRect(0,0,W,H);
}

// ═══════════════════════════════════════════════════════════════
//  LEVEL BUILDERS
// ═══════════════════════════════════════════════════════════════

// ── Cena 1: Costa de Talasea — ferramentas + Casuário ─────────────
function buildL1(){
  const FL=560,WW=3200,WH=900;
  const plats=[
    solid(0,FL,500,WH-FL), solid(580,FL,200,WH-FL), solid(860,FL,180,WH-FL),
    solid(1120,FL,220,WH-FL), solid(1420,FL,200,WH-FL), solid(1700,FL,240,WH-FL),
    solid(1980,FL,260,WH-FL), solid(2280,FL,200,WH-FL), solid(2560,FL,220,WH-FL),
    solid(2820,FL,600,WH-FL),
    solid(200,FL-160,130,18), solid(420,FL-240,120,18), solid(660,FL-200,130,18),
    solid(900,FL-270,120,18), solid(1100,FL-170,140,18), solid(1320,FL-280,120,18),
    solid(1500,FL-200,150,18), solid(1750,FL-270,130,18), solid(2060,FL-180,150,18),
    solid(2280,FL-300,120,18), solid(2500,FL-220,140,18), solid(2700,FL-280,120,18),
    movH(500,FL-36,80,500,580,2.2), movH(780,FL-36,80,780,860,2.0),
    movH(1040,FL-36,80,1040,1120,2.2), movH(1340,FL-36,80,1340,1420,1.8),
    movH(1620,FL-36,80,1620,1700,2.0), movH(1900,FL-36,80,1900,1980,2.2),
    movH(2200,FL-36,80,2200,2280,2.0), movH(2480,FL-36,80,2480,2560,1.8),
    movH(2740,FL-36,80,2740,2820,2.0),
    spike(455,FL-20,25), spike(818,FL-20,25), spike(1018,FL-20,25),
  ];
  const enemies=[
    new Enemy(680,FL-44,'guerreiro',70), new Enemy(1200,FL-44,'ave',70),
    new Enemy(1700,FL-44,'guerreiro',80), new Enemy(2100,FL-44,'ave',60),
    new Enemy(2400,FL-44,'guerreiro',80),
  ];
  const cols=[
    new Col(240,FL-50,'percutor'),
    new Col(580,FL-50,'protetor'),
  ];
  const CASU_X=3000, CASU_Y=FL-90;
  const casuario=new Casuario(); casuario.land(CASU_X,CASU_Y);
  const triggers=[
    new Trigger(2880,FL-300,200,300,'Aproximar do Casuário',(player,level)=>{
      if(!player.items.includes('protetor')){notify('Colete o Protetor de Couro de Mão primeiro!');return;}
      player.interactAnim=60; sfx('item'); level.casuario.land(CASU_X,CASU_Y);
      showDialog([
        '"O Casuário do Sul — Casuarius casuarius. O maior e mais perigoso pássaro da Oceania, com garras de 12cm capazes de matar um humano. Os Lapita o domesticavam parcialmente para cerimônias."',
        '"Ele traz um instrumento mais refinado: uma Talha-Obsidiana feita de osso de casuário — denso como marfim. Knappers mais avançados usam percutores de osso ou chifre para lascamentos de pressão mais controlados, produzindo bordas mais finas e precisas que o percutor de pedra."',
        '"É o salto de ferramentas brutas para ferramentas de precisão cirúrgica. Guarde-a bem — ela representa séculos de refinamento técnico."',
      ],()=>{
        player.items.push('talha'); _journalColetar('talha');
        notify('🦴 Talha-Obsidiana de Osso recebida!');
        POPUP.show('Talha-Obsidiana de Osso','🦴','Percutor de osso de casuário — denso como marfim.\nLascamentos de pressão mais controlados que\no percutor de pedra: bordas mais finas e precisas.\nO salto para ferramentas de precisão cirúrgica.',8000);
        level.triggers[0].done=true; setTimeout(()=>G.nextLevel(),4000);
      });
    }),
  ];
  return{
    id:1, bg:'bg01', W:WW, H:WH, startX:60, startY:FL-90,
    title:'A Costa de Talasea',
    hint:'Colete 🪨 Percutor e 🧤 Protetor, depois encontre o Casuário!',
    plats, enemies, cols, triggers, casuario, nodules:[],
    intro:[
      '"1500 antes de Cristo. O povo Lapita vai partir daqui com esta obsidiana negra e chegar a Fiji — 4.000 quilômetros de oceano aberto sem costa visível. Sem bússola, sem GPS, sem mapas de papel."',
      '"Apenas as estrelas, os ventos, o voo dos pássaros e o sabor da água do mar. A obsidiana que carregam vale a viagem porque não existe outra faca tão afiada no Pacífico — a borda de um lascamento bem feito é mais fina que qualquer bisturi de aço moderno."',
      '"Esta pedra construiu o Pacífico."'
    ],
    update(player){ tickMoving(this.plats); for(const e of this.enemies)e.update(this.plats,player); if(!G.dialog)this.casuario.update(player); for(const c of this.cols)c.tick(); POPUP.tick();
      if(Math.random()<0.004) sfx('volcano'); },
    draw(player){
      // Vulcão fumegante ao fundo
      const vx=2200-cam.x*0.25, vy=FL-cam.y-260;
      ctx.fillStyle='#201820'; ctx.beginPath(); ctx.moveTo(vx-140,FL-cam.y); ctx.lineTo(vx,vy); ctx.lineTo(vx+140,FL-cam.y); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#302028'; ctx.beginPath(); ctx.moveTo(vx-20,vy+10); ctx.lineTo(vx,vy-10); ctx.lineTo(vx+20,vy+10); ctx.closePath(); ctx.fill();
      // Fumaça
      for(let i=0;i<4;i++){
        const fy=vy-10-i*22-Math.sin(Date.now()/900+i)*6;
        ctx.fillStyle=`rgba(90,80,90,${0.25-i*0.05})`;
        ctx.beginPath(); ctx.arc(vx+Math.sin(Date.now()/1300+i)*10,fy,18+i*4,0,Math.PI*2); ctx.fill();
      }
      // Fragmentos de obsidiana brilhando na praia
      for(let i=0;i<20;i++){
        const px=100+i*150-cam.x*0.95; if(px<-10||px>W+10) continue;
        const py=FL-cam.y-3;
        const sh=0.3+Math.sin(Date.now()/600+i)*0.3;
        ctx.fillStyle=`rgba(60,180,200,${sh*0.5})`; ctx.fillRect(px,py,4,2);
      }
      const rx=CASU_X-cam.x, ry=CASU_Y-cam.y;
      if(rx>-80&&rx<W+80){ ctx.fillStyle='#1a1820'; ctx.beginPath(); ctx.ellipse(rx+30,ry+40,60,16,0,0,Math.PI*2); ctx.fill(); }
      this.casuario.draw();
      for(const e of this.enemies)e.draw(); for(const c of this.cols)c.draw(); for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

// ── Cena 2: Afloramento de Obsidiana — geologia + pop-ups ─────────
function buildL2(){
  const FL=570,WW=3400,WH=900;
  const plats=[
    solid(0,FL,340,WH-FL), solid(420,FL,200,WH-FL), solid(700,FL,200,WH-FL),
    solid(980,FL,200,WH-FL), solid(1260,FL,220,WH-FL), solid(1560,FL,200,WH-FL),
    solid(1840,FL,240,WH-FL), solid(2140,FL,220,WH-FL), solid(2440,FL,240,WH-FL),
    solid(2760,FL,600,WH-FL),
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
  const enemies=[ new Enemy(500,FL-44,'guerreiro',70),new Enemy(800,FL-44,'ave',60),new Enemy(1060,FL-44,'guerreiro',80),new Enemy(1380,FL-44,'ave',70),new Enemy(1620,FL-44,'guerreiro',90),new Enemy(1920,FL-44,'ave',80),new Enemy(2200,FL-44,'guerreiro',70),new Enemy(2560,FL-44,'ave',80) ];
  const geoMessages=[
    {x:700, shown:false, text:'Vidro Vulcânico', icon:'🔺',body:'Obsidiana e riolito têm a mesma composição\nquímica — 70% de sílica. A diferença é\napenas a velocidade de resfriamento.\nLava rápida = vidro. Lava lenta = cristais.'},
    {x:1500,shown:false, text:'A Faca Mais Afiada', icon:'🔪',body:'A borda de uma lasca de obsidiana tem\n3 nanômetros — 500× mais fina que um\nbisturi de aço. Cirurgiões modernos usam\nobsidiana em microcirurgia até hoje.'},
    {x:2300,shown:false, text:'Translucidez e Fratura', icon:'✨',body:'Obsidiana: brilho vítreo, translúcida nas\nbordas, fratura côncava e brilhante.\nRiolito: opaco, brilho fosco, fratura\nirregular e serrilhada. A diferença é sutil\nmas decisiva para quem depende da lâmina.'},
  ];
  const cols=[];
  const triggers=[
    new Trigger(2870,FL-300,200,300,'Examinar Afloramento',(player,level)=>{
      player.interactAnim=90; sfx('klink');
      showDialog([
        '"A obsidiana e o riolito são a mesma lava. A diferença é tempo. Um segundo a mais de resfriamento e você tem riolito — útil, mas não cortante. Um segundo a menos e você tem vidro."',
        '"A temperatura de resfriamento da lava decidiu quais povos tinham a melhor ferramenta de corte por 10.000 anos de história humana. Para distinguir: translucidez, brilho vítreo e fratura conchoidal côncava."',
        '"À frente: a praia de talhe. O ângulo é tudo — golpear reto distribui a energia e nada acontece; golpear oblíquo, entre 45° e 65°, cria um plano de fraqueza e a lasca se separa."',
      ],()=>{notify('✦ Geologia da obsidiana revelada!');level.triggers[0].done=true;setTimeout(()=>G.nextLevel(),4000);});
    }),
  ];
  return{
    id:2, bg:'bg02', W:WW, H:WH, startX:60, startY:FL-90,
    title:'O Afloramento de Obsidiana',
    hint:'Percorra o afloramento e examine a rocha vulcânica.',
    plats, enemies, cols, triggers, geoMessages, nodules:[],
    intro:[
      '"Corvan sobe até o afloramento de obsidiana na rocha vulcânica acima da praia. A vista é de tirar o fôlego: oceano turquesa em todas as direções, ilhas ao longe e o vulcão fumegando atrás."',
      '"No afloramento, a diferença entre obsidiana e riolito é visualmente óbvia mas geologicamente sutil."',
      'Percorra o afloramento e examine a rocha para revelar a geologia.'
    ],
    update(player){
      tickMoving(this.plats); tickTrapdoors(this.plats);
      for(const e of this.enemies)e.update(this.plats,player);
      for(const gm of this.geoMessages){ if(!gm.shown&&player.x>gm.x&&!G.dialog){gm.shown=true;POPUP.show(gm.text,gm.icon,gm.body,7500);} }
      POPUP.tick();
    },
    draw(player){
      // Veios negros vítreos na rocha (decorativo)
      for(let i=0;i<8;i++){
        const vx=250+i*400-cam.x; if(vx<-30||vx>W+30) continue;
        ctx.strokeStyle='#0c0a10'; ctx.lineWidth=6+Math.random()*3;
        ctx.beginPath(); ctx.moveTo(vx,0); ctx.lineTo(vx+30+i*3,FL-cam.y+80); ctx.stroke();
        const sh=0.3+Math.sin(Date.now()/500+i)*0.25;
        ctx.strokeStyle=`rgba(80,200,220,${sh})`; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(vx+8,0); ctx.lineTo(vx+38+i*3,FL-cam.y+80); ctx.stroke();
      }
      for(const e of this.enemies)e.draw();
      for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

// ── Cena 3: Praia de Knapping — a mecânica central da fase ────────
function buildL3(){
  const FL=570,WW=3400,WH=900;
  const plats=[
    solid(0,FL,300,WH-FL), solid(380,FL,150,WH-FL), solid(630,FL,150,WH-FL),
    solid(880,FL,180,WH-FL), solid(1160,FL,150,WH-FL), solid(1410,FL,180,WH-FL),
    solid(1690,FL,150,WH-FL), solid(1940,FL,260,WH-FL), solid(2300,FL,180,WH-FL),
    solid(2580,FL,150,WH-FL), solid(2830,FL,570,WH-FL),
    solid(140,FL-180,140,18), solid(500,FL-215,110,18), solid(750,FL-175,130,18),
    solid(1000,FL-225,120,18), solid(1250,FL-155,140,18), solid(1520,FL-205,130,18),
    solid(1780,FL-195,145,18), solid(2050,FL-225,140,18), solid(2400,FL-175,130,18),
    movH(300,FL-36,100,300,380,2.0), movH(780,FL-36,100,780,880,2.0),
    movH(1310,FL-36,100,1310,1410,1.8), movH(1840,FL-36,100,1840,1940,2.2),
    movH(2480,FL-36,100,2480,2580,2.0),
  ];
  // 3 núcleos de obsidiana (com ângulos ideais variados) + 1 riolito enganoso
  const nodules=[
    new ObsidianNodule(700,FL-56,false, 48, 'precisao'),
    new ObsidianNodule(1150,FL-56,true,  0,  null),      // riolito
    new ObsidianNodule(1600,FL-56,false, 58, 'geral'),
    new ObsidianNodule(2250,FL-56,false, 64, 'cerimonia'),
  ];
  const cols=[ new Col(2900,FL-50,'ceramica') ];
  const enemies=[ new Enemy(450,FL-44,'guerreiro',60),new Enemy(950,FL-44,'ave',70),new Enemy(1450,FL-44,'guerreiro',70),new Enemy(1980,FL-44,'ave',80),new Enemy(2350,FL-44,'guerreiro',70) ];
  const triggers=[
    new Trigger(3200,FL-300,200,300,'Seguir para a Partida',(player,level)=>{
      const obsN=player.items.filter(i=>i==='obsidiana').length;
      if(obsN<3){notify(`Produza ${3-obsN} lâmina(s) de obsidiana antes de seguir!`);return;}
      if(!player.items.includes('ceramica')){notify('Encontre o Fragmento de Cerâmica Lapita enterrado na areia!');return;}
      player.interactAnim=90; sfx('shiing');
      showDialog([
        '"O ângulo é tudo. Se você golpear reto, a energia se distribui na pedra e nada acontece. Se golpear oblíquo — entre 45° e 65° — você cria um plano de fraqueza e a lasca se separa."',
        '"Os knappers Lapita aprendiam esse ângulo observando como a pedra fratura naturalmente. Cada golpe errado é uma lição sobre como a força e a geometria conversam dentro da pedra."',
        `"${obsN} lâminas produzidas, e a cerâmica confirma a rede de comércio. Hora de partir com os navegantes."`,
      ],()=>{notify('✦ Talhe dominado! Siga para a partida.');level.triggers[0].done=true;setTimeout(()=>G.nextLevel(),4000);});
    }),
  ];
  return{
    id:3, bg:'bg03', W:WW, H:WH, startX:60, startY:FL-90,
    title:'A Praia de Knapping',
    hint:'[E] no núcleo → ajuste ← → (ângulo) e ↑ ↓ (força) → [E] golpear!',
    plats, enemies, cols, triggers, nodules,
    intro:[
      '"Quatro núcleos no afloramento — mas nem todos são obsidiana verdadeira. Aproxime-se e pressione [E] para entrar no modo de talhe: ajuste o ângulo do percutor e a força do golpe."',
      '"O ângulo ideal varia ligeiramente entre núcleos — aprenda a ler cada um antes de golpear, como um knapper de verdade. Força excessiva fragmenta a pedra; força insuficiente não faz nada."',
      'Produza 3 lâminas de obsidiana e encontre a Cerâmica Lapita enterrada na areia.'
    ],
    update(player){
      tickMoving(this.plats);
      for(const e of this.enemies)e.update(this.plats,player);
      for(const c of this.cols)c.tick();
      for(const nod of this.nodules) nod.tick();
      POPUP.tick();
    },
    draw(player){
      for(const nod of this.nodules) nod.draw();
      for(const e of this.enemies)e.draw();
      for(const c of this.cols)c.draw();
      for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

// ── Cena 4: Partida Lapita — conclusão + cerâmica ─────────────────
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
  const casuario=new Casuario(); casuario.guide(180,FL-55,140,2860);
  const casuMessages=[
    {x:500, shown:false, text:'"Estes knappers vão partir hoje numa canoa de 15 metros e viajar 4.000 quilômetros de oceano aberto — lendo estrelas, correntes e o voo dos pássaros."'},
    {x:1300,shown:false, text:'"A cerâmica que encontrei tem o mesmo padrão dentate-stamped que cerâmicas encontradas em Fiji — 4.000 quilômetros daqui. A rede de comércio mais extensa do mundo pré-histórico."'},
    {x:2100,shown:false, text:'"Não precisou de metal, não precisou de escrita, não precisou de bússola. Precisou de coragem e de saber ler o mundo ao redor."'},
    {x:2700,shown:false, text:'"Na praia, a canoa está pronta. Complete a missão — os navegantes esperam."'},
  ];
  const enemies=[ new Enemy(200,FL-44,'guerreiro',60),new Enemy(680,FL-44,'ave',70),new Enemy(1100,FL-44,'guerreiro',80),new Enemy(1600,FL-44,'ave',70),new Enemy(2050,FL-44,'guerreiro',80) ];
  const cols=[];
  const triggers=[
    new Trigger(2780,FL-460,240,460,'Completar a Fase!',(player,level)=>{
      if(!player.items.includes('ceramica')){notify('Você precisa da Cerâmica Lapita coletada na praia!');return;}
      level.triggers[0].done=true;player.interactAnim=120;sfx('nautilus');
      const obsN=player.items.filter(i=>i==='obsidiana').length;
      showDialog([
        '"Estes knappers vão partir hoje numa canoa de 15 metros e viajar 4.000 quilômetros de oceano aberto. Vão encontrar terra nova porque sabem ler as estrelas, sentir as correntes pelos cascos da canoa e reconhecer os pássaros que indicam terra firme."',
        '"Vão levar esta obsidiana como presente, como moeda, como sinal de identidade cultural. A cerâmica que encontrei tem o mesmo padrão que cerâmicas encontradas em Fiji — 4.000 quilômetros daqui."',
        '"A rede de comércio mais extensa do mundo pré-histórico não precisou de metal, não precisou de escrita, não precisou de bússola. Precisou de coragem e de saber ler o mundo ao redor."',
        `🏆 FASE 6.2 CONCLUÍDA! ${obsN} lâminas de obsidiana produzidas.\nÚltima sub-região da Oceania desbloqueada!`,
      ],()=>{_salvarProgresso(G.player?.score||0,G.deaths);G.state='complete';});
    }),
  ];
  return{
    id:4, bg:'bg04', W:WW, H:WH, startX:60, startY:FL-90,
    title:'A Partida Lapita',
    hint:'Siga o Casuário até a canoa. [E] para completar a jornada.',
    plats, enemies, cols, triggers, casuario, casuMessages, nodules:[],
    intro:[
      '"Na praia de areia negra ao amanhecer, a canoa de balancim está pronta para partir, carregada de obsidiana fardada e cerâmicas geométricas."',
      '"Os navegantes Lapita partem cantando — rumo ao horizonte vazio, sem medo."',
      'Siga o Casuário até a canoa e complete a missão.'
    ],
    update(player){
      tickMoving(this.plats); tickTrapdoors(this.plats);
      for(const e of this.enemies)e.update(this.plats,player);
      if(!G.dialog)this.casuario.update(player);
      for(const cm of this.casuMessages){ if(!cm.shown&&player.x>cm.x&&!G.dialog){cm.shown=true;showDialog([cm.text],null,'🦤 CASUÁRIO DO SUL');} }
      POPUP.tick();
    },
    draw(player){
      // Amanhecer turquesa
      const dawnG=ctx.createLinearGradient(0,0,0,H*0.6);
      dawnG.addColorStop(0,'rgba(20,140,150,0.10)'); dawnG.addColorStop(1,'rgba(10,60,80,0.06)');
      ctx.fillStyle=dawnG; ctx.fillRect(0,0,W,H*0.6);
      // Canoa de balancim ao fundo perto do altar
      const cx=2900-cam.x, cy=FL-cam.y-30;
      if(cx>-200&&cx<W+200){
        ctx.fillStyle='#3a2818'; ctx.beginPath(); ctx.moveTo(cx-90,cy+20); ctx.quadraticCurveTo(cx,cy+40,cx+90,cy+20); ctx.lineTo(cx+80,cy+30); ctx.quadraticCurveTo(cx,cy+46,cx-80,cy+30); ctx.closePath(); ctx.fill();
        ctx.fillStyle='#4a3820'; ctx.beginPath(); ctx.moveTo(cx-80,cy+18); ctx.quadraticCurveTo(cx,cy+34,cx+80,cy+18); ctx.stroke();
        // Vela
        ctx.fillStyle='#d8c8a0'; ctx.beginPath(); ctx.moveTo(cx,cy+10); ctx.lineTo(cx-4,cy-60); ctx.lineTo(cx+30,cy+8); ctx.closePath(); ctx.fill();
      }
      this.casuario.draw();
      for(const e of this.enemies)e.draw(); for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

// ── HUD ────────────────────────────────────────────────────────────
function drawHUD(player,level){
  ctx.fillStyle='rgba(0,0,0,0.65)';ctx.fillRect(0,0,W,38);
  for(let i=0;i<player.maxHp;i++){ ctx.fillStyle=i<player.hp?'#e02020':'#333'; ctx.beginPath();const hx=16+i*28,hy=10;ctx.arc(hx+5,hy+5,5,Math.PI,0);ctx.arc(hx+15,hy+5,5,Math.PI,0);ctx.lineTo(hx+20,hy+5);ctx.bezierCurveTo(hx+20,hy+14,hx+10,hy+18,hx+10,hy+18);ctx.bezierCurveTo(hx+10,hy+18,hx,hy+14,hx,hy+5);ctx.closePath();ctx.fill(); }
  ctx.fillStyle='rgba(60,190,190,.9)';ctx.font='13px "Courier New"';ctx.textAlign='center';ctx.fillText(level.title,W/2,24);ctx.textAlign='left';
  ctx.fillStyle='#40d0d0';ctx.font='bold 15px "Courier New"';ctx.textAlign='right';ctx.fillText('⭐ '+player.score,W-14,24);ctx.textAlign='left';
  const tY=44;
  ctx.fillStyle='rgba(0,0,0,0.5)';_rr(16,tY,140,28,4);ctx.fill();
  ctx.strokeStyle=player.activeTool?'#40d0d0':'#444';ctx.lineWidth=1.5;_rr(16,tY,140,28,4);ctx.stroke();
  if(player.activeTool&&ITEM_DEFS[player.activeTool]){const def=ITEM_DEFS[player.activeTool];ctx.font='14px serif';ctx.fillText(def.icon,24,tY+20);ctx.font='11px "Courier New"';ctx.fillStyle='#40d0d0';ctx.fillText(def.nome,42,tY+20);}
  else{ctx.font='11px "Courier New"';ctx.fillStyle='#555';ctx.fillText('Sem ferramenta',22,tY+20);}
  ctx.fillStyle='rgba(24,136,136,0.15)';_rr(162,tY,46,28,4);ctx.fill();ctx.strokeStyle='#188888';ctx.lineWidth=1.5;_rr(162,tY,46,28,4);ctx.stroke();
  ctx.font='bold 11px "Courier New"';ctx.fillStyle='#58c8c8';ctx.textAlign='center';ctx.fillText('[I]',185,tY+19);ctx.textAlign='left';
  let ix=W-16;const inv=[];
  if(player.items.includes('ceramica'))  inv.push('🏺 CERÂMICA');
  if(player.items.includes('talha'))     inv.push('🦴 TALHA');
  if(player.items.includes('protetor'))  inv.push('🧤 PROTETOR');
  if(player.items.includes('percutor'))  inv.push('🪨 PERCUTOR');
  const obsN=player.items.filter(i=>i==='obsidiana').length;
  if(obsN>0) inv.push('🔺 '+obsN);
  for(const it of inv){ctx.fillStyle='#40d0d0';ctx.font='12px "Courier New"';ctx.textAlign='right';ctx.fillText(it,ix,tY+20);ctx.textAlign='left';ix-=ctx.measureText(it).width+20;}
  ctx.fillStyle='rgba(140,220,220,.72)';ctx.font='12px "Courier New"';ctx.textAlign='center';ctx.fillText(level.hint,W/2,H-10);ctx.textAlign='left';
  if(G.timeOnLevel<600){ctx.fillStyle='rgba(0,0,0,0.55)';ctx.fillRect(8,H-44,480,28);ctx.fillStyle='#aaa';ctx.font='12px "Courier New"';ctx.fillText('← → Mover  ↑/Espaço Pular  E Interagir  I Inventário',14,H-25);}
}

// ── Title Screen ──────────────────────────────────────────────────
function drawTitle(){
  const bg=IMG['bg01'];
  if(bg&&bg.complete&&bg.naturalWidth>0){ctx.globalAlpha=0.55;drawBg('bg01');ctx.globalAlpha=1;}
  else{const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0a0a10');g.addColorStop(1,'#020204');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
  ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(0,0,W,H);
  for(let i=0;i<120;i++){const sx=(i*141.5)%W,sy=(i*91.7)%280;ctx.fillStyle=`rgba(120,220,220,${.15+Math.sin(Date.now()/1400+i)*.15})`;ctx.fillRect(sx,sy,i%4===0?2:1,i%4===0?2:1);}
  ctx.textAlign='center';
  ctx.shadowColor='#188888';ctx.shadowBlur=40;
  ctx.fillStyle='#40d0d0';ctx.font='bold 48px "Courier New"';ctx.fillText('O Vidro que Navegou o Oceano',W/2,168);
  ctx.shadowBlur=0;
  ctx.fillStyle='#308888';ctx.font='22px "Courier New"';ctx.fillText('Fase 6.2  —  Talasea, Papua Nova Guiné · Povo Lapita · 1500 a.C.',W/2,216);
  if(IMG.card62){
    const cardSize=160,cardX=W/2-80,cardY=246;
    const glow=ctx.createRadialGradient(W/2,cardY+80,0,W/2,cardY+80,130);
    glow.addColorStop(0,'rgba(24,136,136,0.28)'); glow.addColorStop(1,'rgba(24,136,136,0)');
    ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(W/2,cardY+80,130,0,Math.PI*2); ctx.fill();
    ctx.drawImage(IMG.card62,cardX,cardY,cardSize,cardSize);
  }
  ctx.fillStyle=`rgba(40,180,180,${.55+Math.sin(Date.now()/550)*.4})`;ctx.font='19px "Courier New"';
  ctx.fillText('▶  Pressione ENTER para começar  ◀',W/2,460);
  ctx.fillStyle='#a0d0d0';ctx.font='18px "Courier New"';
  ctx.fillText('← → Mover   |   ↑ Espaço Pular   |   E Interagir   |   I Diário de Bordo',W/2,504);
  ctx.fillText('[M] Menu Principal',W/2,538);
  ctx.textAlign='left';
}

function drawDeath(){
  ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);
  ctx.textAlign='center';ctx.shadowColor='#ff2020';ctx.shadowBlur=30;
  ctx.fillStyle='#ff5050';ctx.font='bold 56px "Courier New"';ctx.fillText('VOCÊ CAIU!',W/2,H/2-50);ctx.shadowBlur=0;
  CORVAN.drawLarge(ctx, W/2-24, H/2+10, 3, false);
  ctx.fillStyle='#40d0d0';ctx.font='20px "Courier New"';
  ctx.fillText('Pressione  R  para recomeçar',W/2,H/2+140);
  ctx.fillText(`Mortes: ${G.deaths}`,W/2,H/2+172);
  ctx.fillStyle='#888';ctx.font='15px "Courier New"';ctx.fillText('[M] Menu Principal',W/2,H/2+204);
  ctx.textAlign='left';
}

function drawComplete(){
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#020608');g.addColorStop(1,'#081818');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  const rg=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,500);rg.addColorStop(0,'rgba(24,136,136,.16)');rg.addColorStop(1,'rgba(24,136,136,0)');ctx.fillStyle=rg;ctx.fillRect(0,0,W,H);
  ctx.textAlign='center';
  ctx.shadowColor='#40d0d0';ctx.shadowBlur=40;
  ctx.fillStyle='#50e0e0';ctx.font='bold 40px "Courier New"';ctx.fillText('✦  FASE 6.2 CONCLUÍDA  ✦',W/2,108);
  ctx.shadowBlur=0;
  CORVAN.drawLarge(ctx, W/2 - 24, H/2 - 200, 3, false);
  ctx.fillStyle='#e8d090';ctx.font='20px "Courier New"';ctx.fillText('O Vidro que Navegou o Oceano foi dominado!',W/2,160);
  const lines=[
    '🔺  Obsidiana — a faca mais afiada da pré-história',
    '🏺  Cerâmica Lapita — prova de 4.000 km de comércio',
    '🦴  Talha de Osso — precisão cirúrgica ancestral',
    '🦤  Casuário do Sul — o guardião mais perigoso da Oceania',
  ];
  ctx.fillStyle='#c0e8e8';ctx.font='16px "Courier New"';lines.forEach((l,i)=>ctx.fillText(l,W/2,400+i*32));
  ctx.fillStyle='#40d0d0';ctx.font='18px "Courier New"';ctx.fillText(`Pontuação: ◈ ${G.player?.score||0}   Mortes: ${G.deaths}`,W/2,548);
  ctx.fillStyle=`rgba(40,180,180,${.6+Math.sin(Date.now()/600)*.4})`;ctx.font='17px "Courier New"';
  ctx.fillText('✦ Fase 6.3 desbloqueada!   [M] Menu Principal',W/2,594);
  ctx.font='42px serif';ctx.fillText('🏆',W/2-20,640);
  ctx.textAlign='left';
}

// ── Game engine ───────────────────────────────────────────────────
const LEVELS=[buildL1,buildL2,buildL3,buildL4];
const G={
  state:'title', lvIdx:0, level:null, player:null,
  dialog:false, deaths:0, timeOnLevel:0,
  _storedItems:[], _storedScore:0, _storedTool:null,

  load(idx){
    this.lvIdx=idx; particles=[];
    tileTheme=TILE_THEMES[idx+1]||TILE_THEMES[1];
    this.level=LEVELS[idx]();
    cam.x=0; cam.y=0;
    this.player=new Player(this.level.startX,this.level.startY);
    if(idx>0){
      this.player.items=[...this._storedItems];
      this.player.score=this._storedScore;
      this.player.activeTool=this._storedTool||null;
    }
    this.dialog=false; this.state='playing'; this.timeOnLevel=0;
    BUBBLE.active=false; POPUP.active=false; KNAP_UI.close();
    setTimeout(()=>{if(this.state==='playing')showDialog(this.level.intro,null);},900);
  },
  nextLevel(){
    this._storedItems=[...this.player.items];
    this._storedScore=this.player.score;
    this._storedTool=this.player.activeTool;
    if(this.lvIdx+1<LEVELS.length) this.load(this.lvIdx+1);
    else this.state='complete';
  },
  update(){
    if(this.state!=='playing') return;
    this.timeOnLevel++;
    checkDlg();
    if(INV.open) INV.navigate(this.player);
    if(KNAP_UI.active) KNAP_UI.tick();
    updateCam(this.player.x,this.level.W);
    this.level.update(this.player);
    this.player.update(this.level);
    tickParticles(); tickNotif();
    if(this.player.dead){this.deaths++;this.state='dead';}
    dlgFaceT+=0.08;
  },
  draw(){
    ctx.clearRect(0,0,W,H);
    if(this.state==='title'){drawTitle();return;}
    if(this.state==='complete'){drawComplete();return;}
    drawBg(this.level.bg);
    for(const p of this.level.plats) drawPlatform(p);
    this.level.draw(this.player);
    drawParticles();
    this.player.draw();
    if(this.state==='dead'){drawDeath();return;}
    drawHUD(this.player,this.level);
    BUBBLE.draw(this.player);
    drawNotif(); POPUP.draw(); INV.draw(this.player);
    KNAP_UI.draw();
  }
};

function _journalColetar(tipo, count) {
  const id = TIPO_TO_JOURNAL[tipo] || tipo;
  if (!id) return;
  try {
    const raw = localStorage.getItem('mineralis_save_v2');
    const save = raw ? JSON.parse(raw) : {versao:1,iniciado:true};
    if (!save.coletados) save.coletados = {};
    if (count && count > 1) {
      save.coletados[id] = Math.max(Number(save.coletados[id])||0, count);
    } else if (!save.coletados[id]) {
      save.coletados[id] = true;
    }
    if (!save.fases) save.fases = {};
    if (!save.fases['6.2']) save.fases['6.2'] = {desbloqueada:true, estrelas:0, coletados:{}};
    if (!save.fases['6.2'].coletados) save.fases['6.2'].coletados = {};
    if (count && count > 1) {
      save.fases['6.2'].coletados[id] = Math.max(Number(save.fases['6.2'].coletados[id])||0, count);
    } else {
      save.fases['6.2'].coletados[id] = true;
    }
    localStorage.setItem('mineralis_save_v2', JSON.stringify(save));
  } catch(e) {}
}

function _salvarProgresso(score,deaths){
  const estrelas=deaths===0?4:deaths<=2?3:deaths<=5?2:1;
  try{
    const raw=localStorage.getItem('mineralis_save_v2');
    const save=raw?JSON.parse(raw):{versao:1,iniciado:true,fases:{}};
    if(!save.fases) save.fases={};
    if(!save.fases['6.2']) save.fases['6.2']={desbloqueada:true,estrelas:0};
    save.fases['6.2'].estrelas=Math.max(save.fases['6.2'].estrelas||0,estrelas);
    save.fases['6.2'].desbloqueada=true;
    if(!save.fases['6.3']) save.fases['6.3']={desbloqueada:false,estrelas:0};
    save.fases['6.3'].desbloqueada=true;
    localStorage.setItem(SAVE_KEY,JSON.stringify(save));
  }catch(e){}
}

function startGame(){
  CORVAN.load('Assets/', () => {});
  G.state='title'; cam.x=0; cam.y=0; loop();
}

function loop(){
  requestAnimationFrame(loop);
  if(G.state==='title'    &&(jp['Enter']||jp['Space'])) G.load(0);
  if(G.state==='dead'     && jp['KeyR'])                G.load(G.lvIdx);
  if(G.state==='complete' &&(jp['Enter']||jp['KeyM'])) _voltarAoMenu();
  if(G.state==='complete' && jp['KeyM']) _voltarAoMenu();
  G.update(); G.draw(); clearJP();
}

if(!gameReady){
  (function loadLoop(){
    if(gameReady) return;
    requestAnimationFrame(loadLoop);
    ctx.fillStyle='#020204';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#40d0d0';ctx.font='bold 22px "Courier New"';ctx.textAlign='center';
    ctx.fillText(`Carregando${'.'.repeat(Math.floor(Date.now()/400)%4)}  ${assetsLoaded}/${totalAssets}`,W/2,H/2);
    ctx.fillStyle='#888';ctx.font='14px "Courier New"';
    ctx.fillText('Fase 6.2 — O Vidro que Navegou o Oceano',W/2,H/2+36);
    ctx.textAlign='left';
  })();
}
