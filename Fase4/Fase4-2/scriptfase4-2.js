// Mineralis â€” Fase 4.2: Ouro do Grande Zimbabue
// Mantem o padrao das fases em Canvas: Corvan, HUD, dialogos, inventario, 4 cenas e desbloqueio.

const SAVE_KEY='mineralis_save_v2';
function saveRead(){try{return JSON.parse(localStorage.getItem(SAVE_KEY))||{};}catch{return{};}}
function saveWrite(d){try{localStorage.setItem(SAVE_KEY,JSON.stringify(d));}catch(e){}}
function unlockPhase(id){const s=saveRead();if(!s.fases)s.fases={};if(!s.fases[id])s.fases[id]={desbloqueada:true,estrelas:0};s.fases[id].desbloqueada=true;saveWrite(s);}
function completeCurrentPhase(id,deaths){const s=saveRead();if(!s.fases)s.fases={};if(!s.fases[id])s.fases[id]={desbloqueada:true,estrelas:0};const estrelas=deaths===0?4:deaths<=2?3:deaths<=5?2:1;s.fases[id].desbloqueada=true;s.fases[id].estrelas=Math.max(s.fases[id].estrelas||0,estrelas);saveWrite(s);}
// 'ouro_aluvial' já é usado pela Fase 1.2 (Ouro Aluvial da Amazônia) no catálogo
// global; aqui usamos um id canônico próprio para não colidir com aquele item.
const _JOURNAL_ALIAS={ouro_aluvial:'ouro_aluvial_zimbabue'};
function journalCollect(id){id=_JOURNAL_ALIAS[id]||id;if(window.JournalStore){window.JournalStore.collect(id);return;}const s=saveRead();if(!s.coletados)s.coletados={};if(!s.coletados[id]){s.coletados[id]=true;saveWrite(s);}}

const UI_ACCENT='#d8b34a',UI_BORDER='#7b6328',UI_BORDER_DARK='#554018',UI_MUTED='#a18a48';
const W=1280,H=720;
const wrap=document.getElementById('wrap'),canvas=document.getElementById('c'),ctx=canvas.getContext('2d');
canvas.width=W;canvas.height=H;
function resize(){const s=Math.min(window.innerWidth/W,window.innerHeight/H);const sw=Math.round(W*s),sh=Math.round(H*s);canvas.style.width=sw+'px';canvas.style.height=sh+'px';wrap.style.left=Math.round((window.innerWidth-sw)/2)+'px';wrap.style.top=Math.round((window.innerHeight-sh)/2)+'px';wrap.style.width=sw+'px';wrap.style.height=sh+'px';wrap.style.position='fixed';}
resize();addEventListener('resize',resize);

let AC;try{AC=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}
function sfx(type){if(!AC)return;if(AC.state==='suspended')AC.resume();const o=AC.createOscillator(),g=AC.createGain();o.connect(g);g.connect(AC.destination);const t=AC.currentTime;g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.001,t+.35);if(type==='jump'){o.frequency.setValueAtTime(220,t);o.frequency.exponentialRampToValueAtTime(420,t+.15);}else if(type==='probe_soft'){o.type='sine';o.frequency.setValueAtTime(80,t);o.frequency.exponentialRampToValueAtTime(55,t+.2);}else if(type==='probe_iron'){o.type='triangle';o.frequency.setValueAtTime(280,t);o.frequency.exponentialRampToValueAtTime(520,t+.12);}else if(type==='item'){o.frequency.setValueAtTime(440,t);o.frequency.setValueAtTime(660,t+.1);o.frequency.setValueAtTime(880,t+.2);}else if(type==='raven'){o.type='square';o.frequency.setValueAtTime(260,t);o.frequency.setValueAtTime(180,t+.12);g.gain.setValueAtTime(.08,t);}else if(type==='hurt'){o.type='sawtooth';o.frequency.setValueAtTime(180,t);o.frequency.exponentialRampToValueAtTime(60,t+.22);g.gain.setValueAtTime(.18,t);}else if(type==='unlock'){o.frequency.setValueAtTime(330,t);o.frequency.setValueAtTime(440,t+.14);o.frequency.setValueAtTime(660,t+.28);}else{o.frequency.setValueAtTime(200,t);}o.start(t);o.stop(t+.45);}

const IMG={};let assetsLoaded=0,totalAssets=5,gameReady=false;
[['bg01','Assets/Cena01_Fase42.svg'],['bg02','Assets/Cena02_Fase42.svg'],['bg03','Assets/Cena03_Fase42.svg'],['bg04','Assets/Cena04_Fase42.svg'],['card42','Assets/4_2_zimbabwe.svg']].forEach(([k,src])=>{const im=new Image();im.onload=()=>{IMG[k]=im;if(++assetsLoaded>=totalAssets){gameReady=true;startGame();}};im.onerror=()=>{IMG[k]=null;if(++assetsLoaded>=totalAssets){gameReady=true;startGame();}};im.src=src;});
['bateia','calabaca','peixe','bastao','passaro'].forEach((k,i)=>{const src=['Assets/Item_BateiaMadeira.svg','Assets/Item_Calabaca.svg','Assets/Item_PeixeAguia.svg','Assets/Item_BastaoSombra.svg','Assets/Item_PassaroEsteatita.svg'][i];const im=new Image();im.onload=()=>IMG[k]=im;im.onerror=()=>IMG[k]=null;im.src=src;});

const keys={},jp={};
addEventListener('keydown',e=>{if(!keys[e.code])jp[e.code]=true;keys[e.code]=true;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','Tab'].includes(e.code))e.preventDefault();if((e.code==="KeyI"||e.code==="Tab")&&G.state==="playing"){if(G.player&&(INV.open||!BUBBLE.active))INV.toggle(G.player);}if(e.code==='Escape')INV.close();if(e.code==='KeyM')location.href='../../MenuPrincipal/index.html';});
addEventListener('keyup',e=>delete keys[e.code]);
addEventListener('blur',()=>{for(const k in keys)delete keys[k];for(const k in jp)delete jp[k];TOUCH.l=TOUCH.r=TOUCH.j=TOUCH.e=false;});
document.addEventListener('visibilitychange',()=>{if(document.hidden){for(const k in keys)delete keys[k];for(const k in jp)delete jp[k];TOUCH.l=TOUCH.r=TOUCH.j=TOUCH.e=false;}});
const TOUCH={l:false,r:false,j:false,e:false};function bindT(id,k){const el=document.getElementById(id);if(!el)return;el.addEventListener('touchstart',ev=>{ev.preventDefault();TOUCH[k]=true;if(k==='j'||k==='e')jp['_t'+k]=true;},{passive:false});el.addEventListener('touchend',ev=>{ev.preventDefault();TOUCH[k]=false;},{passive:false});}
bindT('tb-l','l');bindT('tb-r','r');bindT('tb-j','j');bindT('tb-e','e');
const isL=()=>keys.ArrowLeft||keys.KeyA||TOUCH.l,isR=()=>keys.ArrowRight||keys.KeyD||TOUCH.r,isJ=()=>jp.ArrowUp||jp.KeyW||jp.Space||jp._tj,isE=()=>jp.KeyE||jp.Enter||jp._te;function clearJP(){for(const k in jp)delete jp[k];}

function roundRect(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);}
const cam={x:0,y:0};function updateCam(px,lw){cam.x=Math.max(0,Math.min(lw-W,px-W*0.38));}
function solid(x,y,w,h){return{x,y,w,h,type:'solid'};}function spike(x,y,w){return{x,y,w,h:20,type:'spike'};}function trap(x,y,w){return{x,y,w,h:16,type:'trap',t:0,open:false};}function movH(x,y,w,min,max,v){return{x,y,w,h:18,type:'movH',min,max,vx:v};}
function tickPlats(plats){for(const p of plats){if(p.type==='movH'){p.x+=p.vx;if(p.x<p.min){p.x=p.min;p.vx=Math.abs(p.vx);}else if(p.x>p.max){p.x=p.max;p.vx=-Math.abs(p.vx);}}if(p.type==='trap'){p.t++;p.open=p.t%180>110;}}}
function drawPlatform(p){if(p.type==='trap'&&p.open)return;const x=p.x-cam.x,y=p.y-cam.y;if(x>W+80||x+p.w<-80)return;if(p.type==='spike'){ctx.fillStyle='#48351c';for(let i=0;i<p.w;i+=20){ctx.beginPath();ctx.moveTo(x+i,y+20);ctx.lineTo(x+i+10,y);ctx.lineTo(x+i+20,y+20);ctx.closePath();ctx.fill();}return;}ctx.fillStyle=p.type==='movH'?'#3d3b28':'#273018';ctx.fillRect(x,y,p.w,p.h);ctx.fillStyle='rgba(216,179,74,.22)';ctx.fillRect(x,y,p.w,2);ctx.strokeStyle='rgba(0,0,0,.35)';ctx.strokeRect(x,y,p.w,p.h);}

let particles=[];function burst(x,y,c='#d8b34a',n=10,sp=3){for(let i=0;i<n;i++)particles.push({x,y,vx:(Math.random()*2-1)*sp,vy:(Math.random()*2-1)*sp-1,life:30+Math.random()*25,c});}function tickParticles(){particles=particles.filter(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.08;p.life--;return p.life>0;});}function drawParticles(){for(const p of particles){ctx.globalAlpha=Math.max(0,p.life/50);ctx.fillStyle=p.c;ctx.fillRect(p.x-cam.x,p.y-cam.y,3,3);ctx.globalAlpha=1;}}
let notif={txt:'',t:0};function notify(txt){notif={txt,t:150};}function tickNotif(){if(notif.t>0)notif.t--;}function drawNotif(){if(notif.t<=0)return;ctx.fillStyle='rgba(0,0,0,.82)';roundRect(W/2-330,54,660,34,6);ctx.fill();ctx.strokeStyle=UI_ACCENT;ctx.stroke();ctx.fillStyle=UI_ACCENT;ctx.font='bold 14px Courier New';ctx.textAlign='center';ctx.fillText(notif.txt,W/2,76);ctx.textAlign='left';}



const ITEM_DEFS={
  bateia_madeira:{cat:'ferramenta',nome:'Bateia de Madeira Curvada',icon:'🥣',journalId:'bateia_madeira',desc:`Bateia leve de madeira de mopane.
Usada pelos Shona para separar ouro pesado da areia do rio.
Na fase, permite garimpar ouro aluvial.`,tool:true},
  calabaca_agua:{cat:'ferramenta',nome:'Calabaça de Água',icon:'💧',journalId:'calabaca_agua',desc:`Recipiente natural usado para controlar o fluxo de água na bateia.
Ajuda a lavar a areia sem perder o ouro.
Substitui mecanismos metálicos modernos.`,tool:true},
  bastao_sombra:{cat:'ferramenta',nome:'Bastão de Sombra Shona',icon:'☀️',journalId:'bastao_sombra',desc:`Bastão fincado no solo para ler a sombra.
Funciona como relógio solar e bússola simples no hemisfério sul.
Revela a direção correta na torre cônica.`,tool:true},
  ouro_aluvial:{cat:'minerio',nome:'Ouro Aluvial',icon:'🟡',journalId:'ouro_aluvial_zimbabue',desc:`Pepitas e pó de ouro concentradas nos rios.
Vieram de veios de quartzo antigos e foram arredondadas pela água.
Afundam rápido na bateia por serem densas.`},
  quartzo_aurifero:{cat:'minerio',nome:'Quartzo Aurífero',icon:'◇',journalId:'quartzo_aurifero',desc:`Quartzo branco com inclusões douradas.
As veias cortam os granitos antigos do planalto.
São a fonte original do ouro carregado pelo rio.`},
  mica_dourada:{cat:'minerio',nome:'Mica Dourada',icon:'✧',journalId:'mica_dourada',desc:`Biotita ou muscovita em flocos brilhantes.
Parece ouro, mas é leve e flexível.
Na bateia, fica em suspensão em vez de afundar.`},
  passaro_esteatita:{cat:'artefato',nome:'Pássaro de Esteatita do Zimbábue',icon:'🐦',journalId:'passaro_esteatita',desc:`Escultura Shona em pedra-sabão.
Representa ancestrais e mensageiros espirituais.
Sua imagem aparece na bandeira nacional do Zimbábue.`}
};
const INV={open:false,tab:0,cursor:0,TABS:[{id:'ferramenta',label:'🔧 Ferramentas'},{id:'minerio',label:'⛏ Minérios'},{id:'artefato',label:'🏺 Artefatos'}],items(player){
    const cat=this.TABS[this.tab].id;
    const saved=(saveRead().coletados)||{};
    const out=[];const canonShown=new Set();
    for(const [id,d] of Object.entries(ITEM_DEFS)){
      if(d.cat!==cat) continue;
      if(player.items.includes(id)){ out.push({id,...d}); canonShown.add(d.journalId||id); }
    }
    for(const [id,d] of Object.entries(window.ALL_ITEM_DEFS||{})){
      if(d.cat!==cat || id in ITEM_DEFS || canonShown.has(id)) continue;
      const got=window.JournalStore?window.JournalStore.isCollected(id):!!saved[id];
      if(got) out.push({id,...d});
    }
    return out;
    },toggle(p){this.open=!this.open;G.dialog=this.open||BUBBLE.active;if(this.open)this.cursor=0;},close(){this.open=false;G.dialog=BUBBLE.active;},navigate(p){if(!this.open)return;const its=this.items(p);if(jp.ArrowLeft||jp.KeyA){this.tab=(this.tab+2)%3;this.cursor=0;}if(jp.ArrowRight||jp.KeyD){this.tab=(this.tab+1)%3;this.cursor=0;}if(jp.ArrowUp||jp.KeyW)this.cursor=Math.max(0,this.cursor-1);if(jp.ArrowDown||jp.KeyS)this.cursor=Math.min(Math.max(0,its.length-1),this.cursor+1);if(isE()&&its.length&&its[this.cursor].tool){const id=its[this.cursor].id;p.activeTool=p.activeTool===id?null:id;sfx('item');}},draw(p){if(!this.open)return;ctx.fillStyle='rgba(0,0,0,.68)';ctx.fillRect(0,0,W,H);const PX=250,PY=110,PW=780,PH=500;ctx.fillStyle='rgba(8,6,2,.97)';roundRect(PX,PY,PW,PH,16);ctx.fill();ctx.strokeStyle=UI_BORDER;ctx.lineWidth=2;roundRect(PX,PY,PW,PH,16);ctx.stroke();ctx.fillStyle=UI_ACCENT;ctx.font='bold 18px Courier New';ctx.textAlign='center';ctx.fillText('📔 DIÁRIO DE BORDO',W/2,PY+34);const tw=PW/3;this.TABS.forEach((t,i)=>{ctx.fillStyle=i===this.tab?'rgba(216,179,74,.22)':'rgba(0,0,0,.25)';ctx.fillRect(PX+i*tw+6,PY+52,tw-12,34);ctx.fillStyle=i===this.tab?UI_ACCENT:'#786b44';ctx.font='bold 13px Courier New';ctx.fillText(t.label,PX+i*tw+tw/2,PY+74);});const its=this.items(p);ctx.textAlign='left';if(!its.length){ctx.fillStyle='#887b58';ctx.font='16px Courier New';ctx.textAlign='center';ctx.fillText('Nenhum item coletado nesta aba.',W/2,PY+285);return;}const ROW_H=52,maxRows=6;const scrollTop=its.length>maxRows?Math.max(0,Math.min(this.cursor-maxRows+1,its.length-maxRows)):0;const visible=its.slice(scrollTop,scrollTop+maxRows);visible.forEach((it,vi)=>{const i=scrollTop+vi;const y=PY+115+vi*ROW_H;ctx.fillStyle=i===this.cursor?'rgba(216,179,74,.18)':'transparent';roundRect(PX+22,y-26,260,42,7);ctx.fill();ctx.font='24px serif';ctx.fillText(it.icon,PX+36,y);ctx.font='bold 14px Courier New';ctx.fillStyle=p.activeTool===it.id?'#e9c45c':(i===this.cursor?'#d8c891':'#aaa');ctx.fillText(it.nome+(p.activeTool===it.id?'  EQUIPADO':''),PX+72,y-3);});if(scrollTop>0){ctx.fillStyle=UI_ACCENT;ctx.font='bold 12px Courier New';ctx.textAlign='center';ctx.fillText('▲ mais',PX+152,PY+92);ctx.textAlign='left';}if(scrollTop+maxRows<its.length){ctx.fillStyle=UI_ACCENT;ctx.font='bold 12px Courier New';ctx.textAlign='center';ctx.fillText('▼ mais',PX+152,PY+115+maxRows*ROW_H+2);ctx.textAlign='left';}const sel=its[this.cursor];ctx.fillStyle='rgba(216,179,74,.08)';roundRect(PX+320,PY+118,430,310,10);ctx.fill();ctx.font='52px serif';ctx.textAlign='center';ctx.fillText(sel.icon,PX+535,PY+190);ctx.fillStyle=UI_ACCENT;ctx.font='bold 16px Courier New';ctx.fillText(sel.nome,PX+535,PY+220);ctx.fillStyle='#d8c891';ctx.font='14px Courier New';sel.desc.split('\\n').forEach((l,i)=>ctx.fillText(l,PX+535,PY+260+i*24));ctx.fillStyle='#8c7c50';ctx.font='12px Courier New';ctx.fillText('[I]/ESC fechar   ← → abas   ↑ ↓ itens   E equipar ferramenta',W/2,PY+465);ctx.textAlign='left';}}

let popup={active:false,title:'',lines:[],color:UI_ACCENT,t:0};function showPopup(title,lines,color=UI_ACCENT,time=5200){popup={active:true,title,lines,color,t:time/16};}function tickPopup(){if(popup.t>0)popup.t--;else popup.active=false;}function drawPopup(){if(!popup.active)return;const PW=470,PH=90+popup.lines.length*22,PX=W-PW-28,PY=105;ctx.fillStyle='rgba(6,5,2,.93)';roundRect(PX,PY,PW,PH,12);ctx.fill();ctx.strokeStyle=popup.color;ctx.lineWidth=2;roundRect(PX,PY,PW,PH,12);ctx.stroke();ctx.fillStyle=popup.color;ctx.font='bold 17px Courier New';ctx.textAlign='center';ctx.fillText(popup.title,PX+PW/2,PY+30);ctx.fillStyle='#e3d59a';ctx.font='13px Courier New';popup.lines.forEach((l,i)=>ctx.fillText(l,PX+PW/2,PY+60+i*22));ctx.textAlign='left';}
function wrapText(text,maxW){ctx.font='15px Courier New';let out=[];for(const par of text.split('\n')){let line='';for(const w of par.split(' ')){const test=line?line+' '+w:w;if(ctx.measureText(test).width>maxW&&line){out.push(line);line=w;}else line=test;}if(line)out.push(line);}return out;}
const BUBBLE={
  active:false,queue:[],lines:[],cb:null,faceFrame:0,
  show(msgs,cb){this.queue=[...msgs];this.cb=cb;this.active=true;G.dialog=true;this.faceFrame=0;this._next();},
  _next(){if(!this.queue.length){this.active=false;G.dialog=false;const f=this.cb;this.cb=null;if(f)f();return;}this.lines=wrapText(this.queue.shift(),480);},
  advance(){if(this.active)this._next();},
  draw(player){
    if(!this.active)return;
    this.faceFrame+=0.03;
    ctx.font='15px "Courier New"';
    const faceW=60,faceH=76,facePad=12,lineH=24,pad=20,textW=480;
    const bubW=facePad+faceW+facePad+textW+pad;
    const bubH=Math.max(faceH+pad*2,this.lines.length*lineH+70)+pad;
    const pcx=player.x-cam.x+player.w/2,pcy=player.y-cam.y;
    const bx=Math.max(10,Math.min(pcx-bubW/2,W-bubW-10)),by=Math.max(10,pcy-bubH-32);
    // Fundo + sombra
    ctx.shadowColor='rgba(0,0,0,0.6)';ctx.shadowBlur=14;
    ctx.fillStyle='rgba(8,6,1,0.96)';roundRect(bx,by,bubW,bubH,14);ctx.fill();
    ctx.shadowBlur=0;
    // Borda dupla dourada
    ctx.strokeStyle=UI_ACCENT;ctx.lineWidth=2.5;roundRect(bx,by,bubW,bubH,14);ctx.stroke();
    ctx.strokeStyle='rgba(216,179,74,0.2)';ctx.lineWidth=1;roundRect(bx+4,by+4,bubW-8,bubH-8,10);ctx.stroke();
    // Cauda apontando para o player
    const tbx=Math.max(bx+30,Math.min(pcx,bx+bubW-30));
    const tty=by+bubH,tipy=Math.min(pcy,tty+38);
    ctx.fillStyle='rgba(8,6,1,0.96)';ctx.beginPath();ctx.moveTo(tbx-14,tty);ctx.lineTo(tbx+14,tty);ctx.lineTo(pcx,tipy);ctx.closePath();ctx.fill();
    ctx.strokeStyle=UI_ACCENT;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(tbx-14,tty);ctx.lineTo(pcx,tipy);ctx.lineTo(tbx+14,tty);ctx.stroke();
    // Face box
    const fx=bx+facePad,fy=by+pad;
    ctx.fillStyle='rgba(20,14,4,0.85)';roundRect(fx,fy,faceW,faceH,6);ctx.fill();
    ctx.strokeStyle='rgba(216,179,74,0.45)';ctx.lineWidth=1.5;roundRect(fx,fy,faceW,faceH,6);ctx.stroke();
    // Corvan dentro da face box
    const faceScale=faceW/18*0.82,sprX=fx+faceW/2-16*faceScale,sprY=fy+4;
    ctx.save();ctx.beginPath();roundRect(fx+1,fy+1,faceW-2,faceH-2,5);ctx.clip();
    drawCorvan(sprX,sprY,faceScale,false,this.faceFrame*4,null);
    const open=Math.abs(Math.sin(this.faceFrame*4))*1.8*faceScale;
    if(open>0.5){ctx.fillStyle='#2a0e06';ctx.fillRect(sprX+12*faceScale,sprY+13*faceScale,8*faceScale,open);}
    ctx.restore();
    // Nome do falante
    const tx=fx+faceW+facePad;
    ctx.font='bold 12px "Courier New"';ctx.fillStyle=UI_ACCENT;ctx.fillText('CORVAN',tx,by+pad+14);
    // Separador
    ctx.fillStyle='rgba(216,179,74,0.35)';ctx.fillRect(tx,by+pad+20,textW,1);
    // Texto
    ctx.font='15px "Courier New"';ctx.fillStyle='#f0e8c0';
    this.lines.forEach((l,i)=>ctx.fillText(l,tx,by+pad+40+i*lineH));
    // Hint [E] Continuar pulsante
    const pulse=0.5+Math.sin(Date.now()/400)*0.5;
    ctx.fillStyle=`rgba(216,179,74,${pulse})`;ctx.font='12px "Courier New"';
    ctx.textAlign='right';ctx.fillText('[E] Continuar →',bx+bubW-pad,by+bubH-10);ctx.textAlign='left';
  }
};
function showDialog(msgs,cb){BUBBLE.show(msgs,cb);}
function checkDlg(){if(BUBBLE.active&&isE())BUBBLE.advance();}


function drawBateia(x,y,S=1,t=0){ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(t)*.04);ctx.fillStyle='#7b4c22';ctx.beginPath();ctx.ellipse(0,4*S,26*S,12*S,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#a66a2b';ctx.beginPath();ctx.ellipse(0,0,25*S,10*S,0,0,Math.PI);ctx.fill();ctx.strokeStyle='#4d2c12';ctx.lineWidth=2*S;ctx.beginPath();ctx.ellipse(0,1*S,27*S,13*S,0,0,Math.PI*2);ctx.stroke();for(let i=-14;i<=14;i+=7){ctx.strokeStyle='rgba(235,190,100,.45)';ctx.beginPath();ctx.moveTo(i*S,-4*S);ctx.lineTo(i*.6*S,11*S);ctx.stroke();}ctx.restore();}
function drawCalabaca(x,y,S=1,t=0){ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(t)*.05);ctx.fillStyle='#b5752b';ctx.beginPath();ctx.ellipse(0,5*S,17*S,21*S,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#d99a45';ctx.beginPath();ctx.ellipse(0,-13*S,9*S,8*S,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(100,45,12,.35)';ctx.fillRect(-9*S,-1*S,18*S,4*S);ctx.restore();}
function drawBastao(x,y,S=1,t=0){ctx.save();ctx.translate(x,y);ctx.rotate(-.25+Math.sin(t)*.03);ctx.fillStyle='#6b3e18';ctx.fillRect(-2*S,-32*S,4*S,64*S);ctx.fillStyle='#e7c765';ctx.beginPath();ctx.arc(0,-36*S,5*S,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(20,10,0,.35)';ctx.lineWidth=2*S;ctx.beginPath();ctx.moveTo(0,28*S);ctx.lineTo(32*S,44*S);ctx.stroke();ctx.restore();}
function drawOuro(x,y,S=1,t=0){ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(t)*.08);ctx.fillStyle='#d8b34a';ctx.beginPath();ctx.moveTo(-13*S,-2*S);ctx.lineTo(-5*S,-12*S);ctx.lineTo(9*S,-9*S);ctx.lineTo(15*S,2*S);ctx.lineTo(6*S,12*S);ctx.lineTo(-11*S,9*S);ctx.closePath();ctx.fill();ctx.fillStyle='rgba(255,245,180,.55)';ctx.beginPath();ctx.arc(-3*S,-4*S,4*S,0,Math.PI*2);ctx.fill();ctx.restore();}
function drawMica(x,y,S=1,t=0){ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(t)*.18);ctx.fillStyle='rgba(238,218,126,.72)';for(let i=0;i<4;i++){ctx.save();ctx.rotate(i*.55);ctx.fillRect(-13*S,-2*S,26*S,4*S);ctx.restore();}ctx.strokeStyle='rgba(255,255,220,.6)';ctx.strokeRect(-12*S,-5*S,24*S,10*S);ctx.restore();}
function drawPassaro(x,y,S=1,t=0){ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(t)*.04);ctx.fillStyle='#9aa08a';ctx.beginPath();ctx.ellipse(0,0,18*S,25*S,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#70785f';ctx.beginPath();ctx.moveTo(0,-25*S);ctx.lineTo(18*S,-38*S);ctx.lineTo(15*S,-16*S);ctx.closePath();ctx.fill();ctx.fillStyle='#c9c0a0';ctx.beginPath();ctx.arc(6*S,-15*S,3*S,0,Math.PI*2);ctx.fill();ctx.fillStyle='#6c705c';ctx.fillRect(-16*S,19*S,32*S,8*S);ctx.restore();}
function drawPeixeAguia(x,y,t=0){
  ctx.save();ctx.translate(x,y+Math.sin(t)*4);
  // Corpo marrom-escuro
  ctx.fillStyle='#3a2417';ctx.beginPath();ctx.ellipse(0,0,26,14,0,0,Math.PI*2);ctx.fill();
  // Cabeça branca
  ctx.fillStyle='#f5f1d0';ctx.beginPath();ctx.ellipse(21,-9,12,10,0,0,Math.PI*2);ctx.fill();
  // Bico dourado
  ctx.fillStyle='#d8b34a';ctx.beginPath();ctx.moveTo(32,-9);ctx.lineTo(49,-5);ctx.lineTo(32,-1);ctx.closePath();ctx.fill();
  // Asa esquerda — bate com sin(t)
  const wingUp=Math.sin(t*2.2)*18;
  ctx.fillStyle='#4b2b15';
  ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(-44,-20+wingUp);ctx.lineTo(-38,8);ctx.closePath();ctx.fill();
  // Asa direita — bate oposta
  ctx.fillStyle='#5a3820';
  ctx.beginPath();ctx.moveTo(8,-4);ctx.lineTo(38,-22-wingUp*0.6);ctx.lineTo(30,4);ctx.closePath();ctx.fill();
  // Reflexo asa
  ctx.fillStyle='rgba(100,70,40,0.4)';
  ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(-44,-20+wingUp);ctx.lineTo(-30,-12+wingUp*0.5);ctx.closePath();ctx.fill();
  // Olho
  ctx.fillStyle='#111';ctx.beginPath();ctx.arc(25,-11,2.5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(24.5,-11.5,1,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

function _drawCorvanTools(activeTool,S,frame){
  if(activeTool==='bateia_madeira'){
    const wb=Math.sin(frame*0.15)*1.5;
    ctx.fillStyle='#7b4c22';ctx.beginPath();ctx.ellipse(2*S,(31+wb)*S,10*S,5*S,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#4d2c12';ctx.lineWidth=S;ctx.beginPath();ctx.ellipse(2*S,(31+wb)*S,11*S,6*S,0,0,Math.PI*2);ctx.stroke();
  } else if(activeTool==='calabaca_agua'){
    ctx.fillStyle='#b5752b';ctx.beginPath();ctx.ellipse(27*S,28*S,5*S,8*S,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#d99a45';ctx.beginPath();ctx.ellipse(27*S,20*S,3*S,3*S,0,0,Math.PI*2);ctx.fill();
  } else if(activeTool==='bastao_sombra'){
    const wb=Math.sin(frame*0.2)*1;
    ctx.fillStyle='#6b3e18';ctx.fillRect(26*S,(16+wb)*S,2*S,20*S);
    ctx.fillStyle='#e7c765';ctx.beginPath();ctx.arc(27*S,(14+wb)*S,3*S,0,Math.PI*2);ctx.fill();
  }
}

function drawCorvan(cx,cy,scale=1,flipX=false,frame=0,activeTool=null){
  const S=scale;ctx.save();ctx.translate(cx,cy);if(flipX)ctx.scale(-1,1);
  const r=(x,y,w,h,f,a=1)=>{ctx.fillStyle=f;ctx.globalAlpha=a;ctx.fillRect(x*S,y*S,w*S,h*S);ctx.globalAlpha=1;};
  const lb=0.7+Math.sin(frame*0.4)*0.3;
  r(7,3,18,2,'#3a2208');r(9,1,14,4,'#4a2e10');r(5,3,22,2,'#5a3a10');r(13,0,6,3,'#c89820');
  r(14,0,4,2,'#ffe060');
  r(9,5,14,9,'#c88050');r(10,6,12,1,'#a86030');
  r(11,8,3,2,'#1a0a04');r(18,8,3,2,'#1a0a04');r(12,8,1,1,'#fff');r(19,8,1,1,'#fff');
  r(14,11,4,1,'#a86030');r(12,13,8,1,'#7a3820');r(13,14,6,2,'#c88050');
  r(8,16,16,13,'#b82010');r(15,17,2,1,'#8a1008');r(15,20,2,1,'#8a1008');r(15,23,2,1,'#8a1008');
  r(12,16,3,3,'#d03018');r(17,16,3,3,'#d03018');
  r(8,28,16,2,'#5a3010');r(14,28,4,2,'#c88020');
  r(9,30,14,12,'#6a4820');r(15,36,2,6,'#4a3020');
  r(3,16,5,12,'#b82010');r(3,28,5,3,'#a86030');
  r(24,16,5,12,'#b82010');r(24,28,5,3,'#a86030');
  r(9,42,6,4,'#3a1e08');r(17,42,6,4,'#3a1e08');r(8,44,8,2,'#2a1008');r(16,44,8,2,'#2a1008');
  ctx.fillStyle='#ffe060';ctx.globalAlpha=0.25*lb;ctx.beginPath();ctx.arc(16*S,1*S,4*S,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=1;
  _drawCorvanTools(activeTool,S,frame);
  ctx.restore();
}


class Col{constructor(x,y,type){this.x=x;this.y=y;this.w=34;this.h=34;this.type=type;this.done=false;this.t=Math.random()*6;}tick(){this.t+=.06;}draw(px,py){if(this.done)return;const sx=this.x-cam.x,sy=this.y-cam.y;if(sx<-80||sx>W+80)return;ctx.save();ctx.translate(sx+17,sy+17+Math.sin(this.t)*4);const draw={bateia_madeira:()=>drawBateia(0,0,.75,this.t),calabaca_agua:()=>drawCalabaca(0,0,.75,this.t),bastao_sombra:()=>drawBastao(0,0,.75,this.t),quartzo_aurifero:()=>drawMica(0,0,.8,this.t),passaro_esteatita:()=>drawPassaro(0,0,.7,this.t)}[this.type];if(draw)draw();ctx.restore();const near=px!==undefined&&Math.hypot(px+18-(this.x+17),py+38-(this.y+17))<95;if(near){ctx.fillStyle='rgba(0,0,0,.82)';ctx.font='bold 12px Courier New';const txt='[E] Pegar '+(ITEM_DEFS[this.type]?.nome||this.type);const tw=ctx.measureText(txt).width+18;roundRect(sx+17-tw/2,sy-36,tw,22,5);ctx.fill();ctx.strokeStyle=UI_ACCENT;ctx.stroke();ctx.fillStyle=UI_ACCENT;ctx.textAlign='center';ctx.fillText(txt,sx+17,sy-21);ctx.textAlign='left';}}}
class GoldSpot{constructor(x,y,real=true){this.x=x;this.y=y;this.w=50;this.h=34;this.real=real;this.sondado=false;this.coletado=false;this.t=Math.random()*6;}draw(){if(this.coletado)return;const sx=this.x-cam.x,sy=this.y-cam.y;if(sx<-90||sx>W+90)return;if(this.sondado){ctx.save();ctx.translate(sx+25,sy+16);if(this.real)drawOuro(0,0,1,this.t);else drawMica(0,0,1,this.t);ctx.restore();ctx.fillStyle=this.real?'#d8b34a':'#d6d0a0';ctx.font='bold 11px Courier New';ctx.textAlign='center';ctx.fillText(this.real?'[E] coletar ouro':'mica dourada',sx+25,sy-8);ctx.textAlign='left';}else{ctx.fillStyle='rgba(220,190,80,.22)';ctx.beginPath();ctx.ellipse(sx+25,sy+20,34,13,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(255,230,120,.35)';ctx.fillRect(sx+9,sy+17,32,3);}}}
class RiverCurrent{constructor(x,y,w,h){this.x=x;this.y=y;this.w=w;this.h=h;this.safe=false;this.t=0;}draw(){const sx=this.x-cam.x,sy=this.y-cam.y;if(sx>W+80||sx+this.w<-80)return;this.t+=.03;ctx.fillStyle=this.safe?'rgba(80,135,130,.35)':'rgba(35,80,95,.62)';ctx.fillRect(sx,sy,this.w,this.h);for(let i=0;i<6;i++){ctx.strokeStyle=`rgba(190,225,230,${.18+Math.sin(this.t+i)*.08})`;ctx.beginPath();ctx.moveTo(sx+18+i*42,sy+13+Math.sin(this.t+i)*5);ctx.quadraticCurveTo(sx+45+i*42,sy+4,sx+72+i*42,sy+13);ctx.stroke();}ctx.fillStyle=this.safe?'#b4e1cb':'#d8b34a';ctx.font='bold 11px Courier New';ctx.textAlign='center';ctx.fillText(this.safe?'fluxo controlado':'corrente rápida',sx+this.w/2,sy-7);ctx.textAlign='left';}}

class Trigger{constructor(x,y,w,h,label,fn,auto=false){this.x=x;this.y=y;this.w=w;this.h=h;this.label=label;this.fn=fn;this.done=false;this.auto=auto;}draw(px,py){if(this.done||this.auto)return;const near=Math.abs(px+18-(this.x+this.w/2))<this.w/2+70&&Math.abs(py+35-(this.y+this.h/2))<this.h/2+70;if(!near)return;const sx=this.x+this.w/2-cam.x,sy=this.y-cam.y-18;ctx.fillStyle='rgba(0,0,0,.82)';ctx.font='bold 13px Courier New';const txt='[E] '+this.label,tw=ctx.measureText(txt).width+22;roundRect(sx-tw/2,sy-17,tw,24,5);ctx.fill();ctx.strokeStyle=UI_ACCENT;ctx.stroke();ctx.fillStyle=UI_ACCENT;ctx.textAlign='center';ctx.fillText(txt,sx,sy);ctx.textAlign='left';}}
function basePlats(FL,WW,WH){return[solid(0,FL,340,WH-FL),solid(420,FL,230,WH-FL),solid(720,FL,220,WH-FL),solid(1010,FL,220,WH-FL),solid(1290,FL,240,WH-FL),solid(1590,FL,220,WH-FL),solid(1880,FL,230,WH-FL),solid(2170,FL,240,WH-FL),solid(2480,FL,WW-2480,WH-FL),solid(220,FL-170,120,18),solid(750,FL-210,120,18),solid(1320,FL-185,120,18),solid(1910,FL-220,120,18),movH(1450,FL-105,110,1450,1660,1.5),trap(980,FL-52,110)];}

class Player{
constructor(x,y){
  this.x=x;this.y=y;this.w=32;this.h=68;
  this.vx=0;this.vy=0;this.onG=false;this.facing=1;
  this.hp=3;this.maxHp=3;this.inv=0;this.dead=false;this.deathCause='queda';
  this.items=[];this.score=0;this.activeTool=null;this.walkT=0;this.state='idle';
  this.coyote=0;this.jbuf=0;this.prevX=x;this.prevY=y;this.groundPlatform=null;
}
overlaps(r){return this.x<r.x+r.w&&this.x+this.w>r.x&&this.y<r.y+r.h&&this.y+this.h>r.y;}
near(r,d=80){return Math.abs(this.x+18-(r.x+r.w/2))<r.w/2+d&&Math.abs(this.y+38-(r.y+r.h/2))<r.h/2+d;}
update(level){
  if(INV.open){INV.navigate(this);return;}
  if(G.dialog)return;
  if(this.inv>0)this.inv--;
  this.prevX=this.x;this.prevY=this.y;
  if(isL()){this.vx=-4.5;this.facing=-1;}else if(isR()){this.vx=4.5;this.facing=1;}else this.vx*=.72;
  if(this.onG)this.coyote=8;else if(this.coyote>0)this.coyote--;
  if(isJ())this.jbuf=10;
  if(this.jbuf>0)this.jbuf--;
  if(this.jbuf>0&&(this.onG||this.coyote>0)){this.vy=-12.2;this.onG=false;this.jbuf=0;this.coyote=0;this.groundPlatform=null;sfx('jump');}
  if(this.groundPlatform){this.x+=this.groundPlatform.vx||0;this.y+=this.groundPlatform.vy||0;}
  this.groundPlatform=null;
  this.vy=Math.min(this.vy+.46,16);
  this.x+=this.vx;
  this._colX(level.plats);
  this.onG=false;
  this.y+=this.vy;
  this._colY(level.plats);
  if(level.currents){
    for(const b of level.currents){
      if(this.overlaps(b)&&!b.safe){
        // Corrente desacelera mas não machuca — só notifica para usar a Calabaça
        this.vx*=.60;
        if(!this._currentNotified){this._currentNotified=true;notify('Corrente forte! Equipe a Calabaça [I] e use [E] aqui para controlar o fluxo.');setTimeout(()=>this._currentNotified=false,3000);}
      } else if(b.safe){
        this._currentNotified=false;
      }
    }
  }
  if(isE())this.interact(level);
  if(this.y>level.H+240)this._hurt(3,level,'queda');
  if(!this.onG&&this.vy<0)this.state='jump';
  else if(!this.onG)this.state='fall';
  else if(Math.abs(this.vx)>0.6)this.state='run';
  else this.state='idle';
  if(Math.abs(this.vx)>0.5)this.walkT+=.18;
}
interact(level){
  if(level.cols){
    for(const c of level.cols){
      if(!c.done&&this.near(c,70)){
        c.done=true;
        if(!this.items.includes(c.type))this.items.push(c.type);
        if(ITEM_DEFS[c.type]?.tool&&!this.activeTool)this.activeTool=c.type;
        this.score+=20;
        journalCollect(c.type);
        sfx('item');
        notify('✦ '+ITEM_DEFS[c.type].nome+' obtido!');
        if(c.type==='quartzo_aurifero')showPopup('◇ QUARTZO AURÍFERO',['Veios brancos cortam o granito antigo','O ouro aluvial nasceu de fragmentos desses veios','A água arredondou as pepitas ao longo de milhares de anos'],UI_ACCENT,6500);
        return;
      }
    }
  }
  if(level.aguia&&!level.aguia.gifted&&this.near({x:level.aguia.x-60,y:level.aguia.y-80,w:120,h:100},70)){
    level.aguia.gifted=true;sfx('raven');burst(level.aguia.x,level.aguia.y,'#f4e7b2',16,3);
    if(!this.items.includes('bastao_sombra'))this.items.push('bastao_sombra');
    this.activeTool='bastao_sombra';journalCollect('bastao_sombra');
    showDialog(['O Peixe-Águia observa o rio Mutirikwe. Seu grito ainda é símbolo nacional do Zimbábue.','Perto do ninho há um Bastão de Sombra Shona. Com ele, a sombra vira bússola e relógio solar.','Na torre cônica, a orientação da luz vai revelar o compartimento escondido.']);
    return;
  }
  if(level.nodes){
    for(const n of level.nodes){
      if(n.coletado||!this.near(n,65))continue;
      if(!n.sondado){
        if(this.activeTool!=='bateia_madeira'){notify('Equipe a Bateia de Madeira no Diário [I] para garimpar.');return;}
        if(!this.items.includes('calabaca_agua')){notify('Pegue a Calabaça de Água para controlar o fluxo.');return;}
        n.sondado=true;sfx(n.real?'probe_iron':'probe_soft');burst(n.x+24,n.y+16,n.real?'#d8b34a':'#d6d0a0',10,2);
        notify(n.real?'Pesado: afundou no centro da bateia. É ouro!':'Leve e brilhante: ficou boiando. É mica.');
        return;
      }
      if(n.real){
        n.coletado=true;this.items.push('ouro_aluvial');this.score+=35;journalCollect('ouro_aluvial');sfx('item');
        showPopup('🟡 OURO ALUVIAL COLETADO',['Pepita de rio lisa e arredondada','Veio do quartzo e foi carregada pela água','Como é denso, afunda rápido na bateia'],'#d8b34a',6000);
        return;
      }
      n.coletado=true;
      if(!this.items.includes('mica_dourada'))this.items.push('mica_dourada');
      journalCollect('mica_dourada');sfx('probe_soft');notify('Belo, mas leve demais: é mica.');
      showPopup('✧ MICA DOURADA',['Brilha mais que o ouro, mas é leve','Dobra em folhas finas e pode voltar ao lugar','Na bateia, fica suspensa na água'],'#d6d0a0',5600);
      return;
    }
  }
  if(level.currents){
    for(const b of level.currents){
      if(!b.safe&&this.near(b,80)){
        if(this.activeTool==='calabaca_agua'){b.safe=true;sfx('probe_soft');notify('Fluxo controlado: agora dá para atravessar devagar.');return;}
        notify('Equipe a Calabaça de Água antes de enfrentar a corrente.');
        return;
      }
    }
  }
  if(level.relic&&!level.relic.done&&this.near({x:level.relic.x-45,y:level.relic.y-55,w:90,h:100},78)){
    if(this.activeTool!=='bastao_sombra'){notify('Equipe o Bastão de Sombra para alinhar a luz da torre.');return;}
    const ok=Math.abs(this.x-level.relic.alignX)<95;
    if(!ok){notify('A sombra ainda não aponta para o entalhe correto. Ajuste sua posição.');return;}
    level.relic.done=true;this.items.push('passaro_esteatita');this.score+=110;journalCollect('passaro_esteatita');sfx('unlock');burst(level.relic.x,level.relic.y,'#d8b34a',30,4);
    showDialog(['A luz tocou o entalhe. Dentro da câmara, repousa o Pássaro de Esteatita do Zimbábue.','Essas esculturas ligavam os ancestrais Shona ao mundo dos vivos. Algumas foram levadas no período colonial.','Mas a imagem do pássaro voltou como símbolo nacional na bandeira do Zimbábue desde 1980.']);
    return;
  }
  for(const t of level.triggers){if(!t.done&&this.near(t)){t.fn(this,level);return;}}
}
_colX(plats){
  for(const p of plats){
    if(p.type==='spike'||(p.type==='trap'&&p.open))continue;
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
    if(p.type==='spike'){if(this.overlaps(p))this._hurt(1,G.level,'rocha');continue;}
    if(p.type==='trap'&&p.open)continue;
    if(p.type==='trap'&&this.vy<0)continue;
    if(!this.overlaps(p))continue;
    const wasAbove=this.prevY+this.h<=p.y+4;
    const wasBelow=this.prevY>=p.y+p.h-4;
    if(this.vy>=0&&wasAbove){this.y=p.y-this.h;this.vy=0;this.onG=true;this.groundPlatform=p.type==='movH'?p:null;}
    else if(this.vy<0&&wasBelow){this.y=p.y+p.h;this.vy=0;}
    else if(this.vy>=0){this.y=p.y-this.h;this.vy=0;this.onG=true;this.groundPlatform=p.type==='movH'?p:null;}
    else{this.y=p.y+p.h;this.vy=0;}
  }
}
_hurt(d,level,cause){
  if(this.inv>0)return;
  this.hp-=d;this.inv=70;this.deathCause=cause;sfx('hurt');burst(this.x+16,this.y+30,'#d65a34',14,3);
  if(this.hp<=0)this.dead=true;
  else{this.x=level.startX;this.y=level.startY;this.vx=0;this.vy=0;this.groundPlatform=null;}
}
draw(){drawCorvan(this.x-cam.x,this.y-cam.y,1.45,this.facing<0,Date.now()/220,this.activeTool);}
}


function drawBg(k){const im=IMG[k];if(im)ctx.drawImage(im,0,0,W,H);else{const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#25321d');g.addColorStop(1,'#0f1308');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}ctx.fillStyle='rgba(0,0,0,.16)';ctx.fillRect(0,0,W,H);}function goldSparkles(){for(let i=0;i<36;i++){const x=(i*173+Date.now()/45)%W,y=390+(i*41)%230;ctx.fillStyle=`rgba(226,190,80,${.07+Math.sin(Date.now()/620+i)*.06})`;ctx.fillRect(x,y,2,2);}}
function drawHUD(p,l){
  // Corações de vida — forma padrão 1-1
  for(let i=0;i<p.maxHp;i++){
    ctx.fillStyle=i<p.hp?'#e02020':'#333';
    ctx.beginPath();const hx=16+i*28,hy=10;
    ctx.arc(hx+5,hy+5,5,Math.PI,0);ctx.arc(hx+15,hy+5,5,Math.PI,0);
    ctx.lineTo(hx+20,hy+5);ctx.bezierCurveTo(hx+20,hy+14,hx+10,hy+18,hx+10,hy+18);
    ctx.bezierCurveTo(hx+10,hy+18,hx,hy+14,hx,hy+5);ctx.closePath();ctx.fill();
  }
  // Barra escura + título centralizado
  ctx.fillStyle='rgba(0,0,0,0.55)';ctx.fillRect(0,0,W,34);
  ctx.shadowColor='rgba(0,0,0,0.8)';ctx.shadowBlur=6;
  ctx.fillStyle='#e8e0d0';ctx.font='20px "Courier New"';
  ctx.textAlign='center';ctx.fillText(l.title,W/2,24);ctx.textAlign='left';ctx.shadowBlur=0;
  // Score / ouro — canto direito
  ctx.fillStyle='#e8e0d0';ctx.font='bold 20px "Courier New"';
  ctx.textAlign='right';ctx.fillText('◈ '+p.score,W-14,26);ctx.textAlign='left';

  // Painel Diário de Bordo — padrão 1-1
  const TOOL_DEFS=[
    {id:'bateia_madeira',  icon:'🥣',nome:'Bateia'},
    {id:'calabaca_agua',   icon:'💧',nome:'Calabaça'},
    {id:'bastao_sombra',   icon:'☀️',nome:'Bastão Sombra'},
  ];
  // Mapa de nomes curtos para o painel (evita overflow)
  const NOME_CURTO={bateia_madeira:'Bateia',calabaca_agua:'Calabaça',bastao_sombra:'Bastão'};
  const tools=TOOL_DEFS.filter(t=>p.items.includes(t.id));
  const PX=12,PY=46,PW=178,PH_BASE=52;
  const PH=PH_BASE+(tools.length>0?6+tools.length*22:0);
  ctx.save();
  ctx.shadowColor='rgba(0,0,0,0.6)';ctx.shadowBlur=8;
  ctx.fillStyle='rgba(8,6,1,0.88)';roundRect(PX,PY,PW,PH,6);ctx.fill();
  ctx.shadowBlur=0;
  ctx.strokeStyle=UI_BORDER;ctx.lineWidth=1.5;roundRect(PX,PY,PW,PH,6);ctx.stroke();
  ctx.strokeStyle='rgba(216,179,74,0.25)';ctx.lineWidth=1;roundRect(PX+3,PY+3,PW-6,PH-6,4);ctx.stroke();
  ctx.restore();
  const midX=PX+PW/2;
  const kw=26,kx=PX+PW-kw-6,ky=PY+5;
  ctx.font='11px serif';ctx.fillStyle=UI_MUTED;ctx.textAlign='left';ctx.fillText('📔',PX+8,PY+20);
  ctx.font='bold 10px "Courier New"';ctx.fillStyle=UI_MUTED;ctx.fillText('DIÁRIO DE BORDO',PX+24,PY+20);
  ctx.fillStyle='rgba(216,179,74,0.2)';roundRect(kx,ky,kw,18,3);ctx.fill();
  ctx.strokeStyle=UI_MUTED;ctx.lineWidth=1;roundRect(kx,ky,kw,18,3);ctx.stroke();
  ctx.font='bold 10px "Courier New"';ctx.fillStyle=UI_ACCENT;
  ctx.textAlign='center';ctx.fillText('[I]',kx+kw/2,ky+13);ctx.textAlign='left';
  ctx.fillStyle='rgba(216,179,74,0.3)';ctx.fillRect(PX+6,PY+26,PW-12,1);
  // Ferramenta ativa
  const atY=PY+44;ctx.textAlign='center';
  if(p.activeTool&&ITEM_DEFS[p.activeTool]){
    const def=ITEM_DEFS[p.activeTool];
    const nomeExib=NOME_CURTO[p.activeTool]||def.nome;
    ctx.fillStyle='rgba(216,179,74,0.1)';roundRect(PX+6,atY-14,PW-12,20,3);ctx.fill();
    ctx.font='11px "Courier New"';ctx.fillStyle='#f0c040';
    ctx.fillText(def.icon+' '+nomeExib,midX,atY+1);
  } else {
    ctx.font='12px "Courier New"';ctx.fillStyle='#c0c8d8';ctx.fillText('Não Equipado',midX,atY);
  }
  ctx.textAlign='left';
  // Ferramentas coletadas
  if(tools.length>0){
    ctx.fillStyle='rgba(216,179,74,0.3)';ctx.fillRect(PX+6,PY+PH_BASE,PW-12,1);
    tools.forEach((t,i)=>{
      const ty=PY+PH_BASE+8+i*22,equipped=p.activeTool===t.id;
      ctx.textAlign='center';
      ctx.font='11px serif';ctx.fillStyle=equipped?'#f0c040':'#a08040';
      ctx.fillText(t.icon+' '+t.nome+(equipped?' ◀':''),midX,ty+10);
      ctx.textAlign='left';
    });
  }

  // Hint rodapé com fundo
  const hintTxt=typeof l.hint==='function'?l.hint(p):l.hint;
  ctx.fillStyle='rgba(0,0,0,0.60)';ctx.fillRect(0,H-32,W,32);
  ctx.shadowColor='rgba(0,0,0,0.9)';ctx.shadowBlur=6;
  ctx.fillStyle='#f0e8c0';ctx.font='17px "Courier New"';
  ctx.textAlign='center';ctx.fillText(hintTxt,W/2,H-10);
  ctx.textAlign='left';ctx.shadowBlur=0;
}
function drawTitle(){drawBg('bg01');ctx.fillStyle='rgba(0,0,0,.58)';ctx.fillRect(0,0,W,H);goldSparkles();ctx.textAlign='center';ctx.shadowColor=UI_ACCENT;ctx.shadowBlur=40;ctx.fillStyle=UI_ACCENT;ctx.font='bold 46px "Courier New"';ctx.fillText('O Ouro que a Pedra Guardou',W/2,148);ctx.shadowBlur=0;ctx.fillStyle='#c8c0a0';ctx.font='19px "Courier New"';ctx.fillText('Fase 4.2 - Ouro do Grande Zimbabué · Zimbábue, século XIII',W/2,200);if(IMG.card42){const cardSize=160,cardX=W/2-80,cardY=230;const glow=ctx.createRadialGradient(W/2,cardY+80,0,W/2,cardY+80,130);glow.addColorStop(0,'rgba(216,179,74,0.25)');glow.addColorStop(1,'rgba(216,179,74,0)');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(W/2,cardY+80,130,0,Math.PI*2);ctx.fill();ctx.drawImage(IMG.card42,cardX,cardY,cardSize,cardSize);}ctx.fillStyle=`rgba(216,179,74,${.55+Math.sin(Date.now()/550)*.4})`;ctx.font='19px "Courier New"';ctx.fillText('▶  Pressione ENTER para começar  ◀',W/2,454);ctx.fillStyle='#c0c8d8';ctx.font='18px "Courier New"';ctx.fillText('← → Mover   |   ↑ Espaço Pular   |   E Interagir   |   I Diário de Bordo',W/2,500);ctx.fillText('[M] Menu Principal',W/2,538);ctx.textAlign='left';}
function drawDeath(){
  ctx.fillStyle='rgba(0,0,0,.72)';ctx.fillRect(0,0,W,H);
  const cause=G.player?.deathCause||'queda';
  const msgs={corrente:'A CORRENTE TE LEVOU!',queda:'CORVAN CAIU!',rocha:'TERRENO PERIGOSO!',inimigo:'O DESERTO VINGOU-SE!'};
  const subs={corrente:'O Nilo é generoso com seus filhos — mas fatal com os descuidados!',queda:'O deserto oriental do Egito não tem misericórdia.',rocha:'As rochas do deserto são afiadíssimas. Cuidado!',inimigo:'Os guardiões das minas dos faraós não perdoam intrusos!'};
  ctx.textAlign='center';ctx.shadowColor='#c04020';ctx.shadowBlur=28;
  ctx.fillStyle='#e05a38';ctx.font='bold 48px Courier New';ctx.fillText(msgs[cause]||'CORVAN CAIU!',W/2,H/2-50);
  ctx.shadowBlur=0;
  ctx.fillStyle='#d8b34a';ctx.font='16px Courier New';ctx.fillText(subs[cause]||'O deserto não perdoa.',W/2,H/2-8);
  ctx.font='19px Courier New';ctx.fillText('Pressione R para tentar novamente',W/2,H/2+40);
  ctx.fillStyle='#999';ctx.font='15px Courier New';ctx.fillText('[M] Menu Principal',W/2,H/2+75);ctx.textAlign='left';
}
function drawComplete(){drawBg('bg04');ctx.fillStyle='rgba(0,0,0,.62)';ctx.fillRect(0,0,W,H);ctx.textAlign='center';ctx.shadowColor=UI_ACCENT;ctx.shadowBlur=38;ctx.fillStyle=UI_ACCENT;ctx.font='bold 42px Courier New';ctx.fillText('✦ FASE 4.2 CONCLUÍDA ✦',W/2,118);ctx.shadowBlur=0;drawCorvan(W/2-180,210,2.4,false,Date.now()/260,'bastao_sombra');ctx.save();ctx.translate(W/2+90,285);ctx.scale(2.3,2.3);drawPassaro(0,0,1,Date.now()/700);ctx.restore();ctx.fillStyle='#e8dba5';ctx.font='17px Courier New';ctx.fillText('O ouro revelou o comércio e a memória do Grande Zimbabué.',W/2,190);const lines=['🥣 Bateia de Madeira - garimpo Shona sem ferramentas metálicas','🟡 Ouro Aluvial - pepitas densas que afundam na bateia','✧ Mica Dourada - brilho enganoso, leve e flexível','🐦 Pássaro de Esteatita - ancestralidade, símbolo e resistência'];ctx.fillStyle='#d8c891';ctx.font='14px Courier New';lines.forEach((l,i)=>ctx.fillText(l,W/2,250+i*29));ctx.fillStyle='#c8c0a0';ctx.font='16px Courier New';ctx.fillText(`Pontuação: ◈ ${G.player?.score||0}   Mortes: ${G.deaths}`,W/2,430);ctx.fillStyle=`rgba(216,179,74,${.6+Math.sin(Date.now()/550)*.35})`;ctx.font='15px Courier New';ctx.fillText('✦ Fase 4.3 desbloqueada!   ENTER para voltar ao Menu',W/2,465);ctx.textAlign='left';}

function buildL1(){const FL=590,WW=3100,WH=900;const plats=basePlats(FL,WW,WH);const cols=[new Col(210,FL-55,'bateia_madeira'),new Col(540,FL-55,'calabaca_agua')];const aguia={x:2520,y:FL-215,gifted:false,vx:0.6,patrolMin:2200,patrolMax:2850,t:0};const triggers=[new Trigger(2880,FL-190,120,190,'Descer ao rio',(p,l)=>{if(!p.items.includes('bateia_madeira')){notify('Pegue a Bateia de Madeira primeiro.');return;}if(!p.items.includes('calabaca_agua')){notify('Pegue a Calabaça de Água primeiro.');return;}if(!p.items.includes('bastao_sombra')){notify('Interaja com o Peixe-Águia para receber o Bastão de Sombra.');return;}l.triggers[0].done=true;sfx('unlock');showDialog(['Século XIII. Diante de nós está o Grande Zimbabué: muralhas de granito sem argamassa e uma torre cônica que observa o planalto.','Mais de 18 mil pessoas viveram aqui. O ouro viajava do interior da África até Sofala, depois para a Índia e além.','A primeira tarefa é simples: recolher as ferramentas Shona e seguir para o rio Mutirikwe.'],()=>setTimeout(()=>G.nextLevel(),600));},true)];return{id:1,bg:'bg01',W:WW,H:WH,startX:60,startY:FL-90,title:'Grande Zimbabué - Muralhas ao Amanhecer',hint:p=>!p.items.includes('bateia_madeira')?'🥣 Pegue a Bateia de Madeira →':!p.items.includes('calabaca_agua')?'💧 Pegue a Calabaça de Água →':!p.items.includes('bastao_sombra')?'🦅 Encontre o Peixe-Águia e receba o Bastão de Sombra →':'✦ Ferramentas prontas - desça ao rio →',plats,cols,triggers,aguia,intro:['Capim dourado, kopjes de granito e muralhas curvas no amanhecer africano.','Colete a Bateia de Madeira e a Calabaça. Depois procure o Peixe-Águia sobre a rocha acima do rio.'],update(p){
  tickPlats(this.plats);for(const c of this.cols)c.tick();
  // Peixe-Águia: voo de patrulha suave + ondulação vertical
  if(!this.aguia.gifted){
    this.aguia.t=(this.aguia.t||0)+0.018;
    this.aguia.x+=this.aguia.vx;
    this.aguia.y=590-215+Math.sin(this.aguia.t)*18; // ondula suavemente
    if(this.aguia.x>this.aguia.patrolMax){this.aguia.x=this.aguia.patrolMax;this.aguia.vx=-Math.abs(this.aguia.vx);}
    if(this.aguia.x<this.aguia.patrolMin){this.aguia.x=this.aguia.patrolMin;this.aguia.vx=Math.abs(this.aguia.vx);}
  }
  const tr=this.triggers[0];if(p.items.includes('bateia_madeira')&&p.items.includes('calabaca_agua')&&p.items.includes('bastao_sombra')&&p.x>tr.x-110&&!tr.done&&!G.dialog)tr.fn(p,this);},draw(p){goldSparkles();const cx=this.aguia.x-cam.x,cy=this.aguia.y-cam.y;if(cx>-100&&cx<W+100){
  // Vira o peixe de acordo com a direção do voo
  ctx.save();if(this.aguia.vx<0){ctx.translate(cx*2,0);ctx.scale(-1,1);}
  drawPeixeAguia(cx,cy,this.aguia.t||Date.now()/400);
  ctx.restore();if(!this.aguia.gifted){ctx.fillStyle=UI_ACCENT;ctx.font='bold 12px Courier New';ctx.textAlign='center';ctx.fillText('[E] Interagir com o Peixe-Águia',cx,cy-48);ctx.textAlign='left';}}for(const c of this.cols)c.draw(p.x,p.y);for(const t of this.triggers)t.draw(p.x,p.y);}};}
function buildL2(){const FL=590,WW=2600,WH=900;const plats=basePlats(FL,WW,WH);const cols=[new Col(820,FL-65,'quartzo_aurifero')];const triggers=[new Trigger(2350,FL-180,120,180,'Avançar para a coleta',(p,l)=>{if(!p.items.includes('quartzo_aurifero')){notify('Colete a amostra de Quartzo Aurífero.');return;}l.triggers[0].done=true;showDialog(['Estas rochas têm mais de 2,7 bilhões de anos. Veios de quartzo branco cortam o granito antigo.','Fluidos hidrotermais depositaram ouro nessas fissuras. Depois, a água arrancou fragmentos e os concentrou no rio.','A dica de coleta: mica brilha, mas é leve. Ouro é denso e afunda.'],()=>setTimeout(()=>G.nextLevel(),600));},true)];return{id:2,bg:'bg02',W:WW,H:WH,startX:60,startY:FL-90,title:'Geologia - Granito, Quartzo e Ouro',hint:p=>!p.items.includes('quartzo_aurifero')?'◇ Examine o Quartzo Aurífero no leito do rio →':'✦ Formação compreendida - avance para garimpar →',plats,cols,triggers,intro:['Corvan desce ao rio Mutirikwe. O granito cor de mel aparece sob a água clara.','Veios de quartzo branco cortam o leito. É dali que o ouro do rio se originou.'],update(p){tickPlats(this.plats);for(const c of this.cols)c.tick();const tr=this.triggers[0];if(p.items.includes('quartzo_aurifero')&&p.x>tr.x-120&&!tr.done&&!G.dialog)tr.fn(p,this);},draw(p){goldSparkles();for(const c of this.cols)c.draw(p.x,p.y);for(const t of this.triggers)t.draw(p.x,p.y);}};}
function buildL3(){const FL=590,WW=3400,WH=900;
  // basePlats sem os spikes que bloqueavam o caminho nas correntes
  const plats=basePlats(FL,WW,WH).filter(p=>p.type!=='spike');
  // Correntes mais estreitas + plataforma de apoio no meio para o player conseguir cruzar
  const nodes=[new GoldSpot(430,FL-82,true),new GoldSpot(720,FL-82,false),new GoldSpot(1060,FL-82,true),new GoldSpot(1510,FL-82,false),new GoldSpot(1880,FL-82,true),new GoldSpot(2290,FL-82,false)];
  const currents=[new RiverCurrent(1240,FL-28,140,36),new RiverCurrent(2540,FL-28,150,36)];const relic={x:2920,y:FL-105,alignX:2850,done:false};const triggers=[new Trigger(3160,FL-180,120,180,'Concluir coleta',(p,l)=>{const count=p.items.filter(x=>x==='ouro_aluvial').length;if(count<3){notify('Colete 3 pepitas de Ouro Aluvial.');return;}if(!p.items.includes('passaro_esteatita')){notify('Revele o Pássaro de Esteatita com o Bastão de Sombra.');return;}l.triggers[0].done=true;showDialog(['A mica engana os olhos, mas a bateia revela o peso. O ouro fica no centro.','O Bastão de Sombra revelou a câmara da torre cônica: tecnologia, astronomia e memória reunidas.','Com o artefato e as pepitas, podemos registrar o impacto histórico desta cidade.'],()=>setTimeout(()=>G.nextLevel(),600));},true)];return{id:3,bg:'bg03',W:WW,H:WH,startX:60,startY:FL-90,title:'Coleta - Bateia e Orientação Solar',hint:p=>{const count=p.items.filter(x=>x==='ouro_aluvial').length;if(count<3)return `🥣 Garimpe e colete Ouro Aluvial (${count}/3)`;if(!p.items.includes('passaro_esteatita'))return '☀️ Use o Bastão de Sombra na torre para revelar o Pássaro →';return '✦ Coleta completa - avance para a conclusão →';},plats,cols:[],triggers,nodes,currents,relic,intro:['Agora vem o mini-puzzle de garimpagem. Equipe a Bateia [I] e pressione [E] sobre pontos brilhantes.','O ouro afunda; a mica fica leve e suspensa. Colete 3 pepitas verdadeiras.','Depois, equipe o Bastão de Sombra e alinhe a posição dentro da torre cônica para revelar o Pássaro de Esteatita.'],update(p){tickPlats(this.plats);const tr=this.triggers[0];if(p.items.filter(x=>x==='ouro_aluvial').length>=3&&p.items.includes('passaro_esteatita')&&p.x>tr.x-130&&!tr.done&&!G.dialog)tr.fn(p,this);},draw(p){goldSparkles();for(const b of this.currents)b.draw();for(const n of this.nodes)n.draw();if(!this.relic.done){const sx=this.relic.x-cam.x,sy=this.relic.y-cam.y;ctx.save();ctx.translate(sx,sy+Math.sin(Date.now()/400)*3);ctx.scale(1.25,1.25);drawPassaro(0,0,1,Date.now()/600);ctx.restore();ctx.fillStyle=UI_ACCENT;ctx.font='bold 12px Courier New';ctx.textAlign='center';ctx.fillText('[E] Câmara Solar da Torre',sx,sy-48);ctx.textAlign='left';if(p.activeTool==='bastao_sombra'){ctx.strokeStyle='rgba(216,179,74,.75)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p.x+16-cam.x,p.y+10-cam.y);ctx.lineTo(sx,sy);ctx.stroke();}}for(const t of this.triggers)t.draw(p.x,p.y);}};}
function buildL4(){const FL=590,WW=1900,WH=900;const plats=basePlats(FL,WW,WH);const triggers=[new Trigger(1680,FL-200,120,200,'Concluir Fase 4.2',(p,l)=>{if(l._done)return;if(!p.items.includes('quartzo_aurifero')){notify('Falta examinar o Quartzo Aurífero no leito do rio!');return;}if(p.items.filter(x=>x==='ouro_aluvial').length<3){notify('Ainda faltam pepitas de Ouro Aluvial na bateia!');return;}if(!p.items.includes('passaro_esteatita')){notify('O Pássaro de Esteatita ainda não foi revelado na torre!');return;}l._done=true;sfx('unlock');showDialog(['Este pássaro é o Zimbábue: não apenas ouro ou pedra, mas memória esculpida para atravessar séculos.','Quando colonialistas disseram que africanos não poderiam ter construído esta cidade, as próprias muralhas responderam em silêncio.','O ouro sustentou rotas comerciais; o pássaro sustentou identidade. Algumas histórias são mais fortes que quem tenta apagá-las.'],()=>{completeCurrentPhase('4.2',G.deaths);unlockPhase('4.3');try{sessionStorage.setItem('mineralis_session','1');}catch(e){}G.state='complete';});},true)];return{id:4,bg:'bg04',W:WW,H:WH,startX:80,startY:FL-90,title:'Rota de Sofala e Memória Shona',hint:'✦ Suba à torre para concluir a fase →',plats,cols:[],triggers,intro:['No pôr do sol, Corvan segura o Pássaro de Esteatita no alto da torre cônica.','Uma animação mostra a rota: planalto zimbabweano, Sofala, mercadores árabes, Índia e China.'],update(p){tickPlats(this.plats);const tr=this.triggers[0];if(p.x>tr.x-120&&!tr.done&&!G.dialog)tr.fn(p,this);},draw(p){goldSparkles();for(const t of this.triggers)t.draw(p.x,p.y);const sx=1480-cam.x,sy=FL-100;ctx.save();ctx.translate(sx,sy);ctx.fillStyle='rgba(90,70,35,.55)';ctx.beginPath();ctx.moveTo(-55,100);ctx.lineTo(0,-85);ctx.lineTo(55,100);ctx.closePath();ctx.fill();ctx.strokeStyle='#d8b34a';ctx.stroke();ctx.translate(0,-20);drawPassaro(0,0,1.15,Date.now()/650);ctx.restore();}};}

const LEVELS=[buildL1,buildL2,buildL3,buildL4];
const G={state:'title',lvIdx:0,level:null,player:null,dialog:false,deaths:0,_items:[],_score:0,_tool:null,load(i){this.lvIdx=i;particles=[];this.level=LEVELS[i]();cam.x=0;this.player=new Player(this.level.startX,this.level.startY);if(i>0){this.player.items=[...this._items];this.player.score=this._score;this.player.activeTool=this._tool;}else{this._items=[];this._score=0;this._tool=null;}this.dialog=false;this.state='playing';BUBBLE.active=false;popup.active=false;for(const k in jp)delete jp[k];setTimeout(()=>{if(this.state==='playing')showDialog(this.level.intro);},700);},nextLevel(){this._items=[...this.player.items];this._score=this.player.score;this._tool=this.player.activeTool;if(this.lvIdx+1<LEVELS.length)this.load(this.lvIdx+1);else this.state='complete';},update(){if(this.state!=='playing')return;checkDlg();updateCam(this.player.x,this.level.W);this.level.update(this.player);this.player.update(this.level);tickParticles();tickNotif();tickPopup();if(this.player.dead){this.deaths++;this.state='dead';}},draw(){ctx.clearRect(0,0,W,H);if(this.state==='title'){drawTitle();return;}if(this.state==='complete'){drawComplete();return;}drawBg(this.level.bg);for(const p of this.level.plats)drawPlatform(p);this.level.draw(this.player);drawParticles();this.player.draw();if(this.state==='dead'){drawDeath();return;}drawHUD(this.player,this.level);drawPopup();BUBBLE.draw(this.player);drawNotif();INV.draw(this.player);}};
// ── Música de fundo — Fase 4.2 (Zimbabué/Egito): pentatônica africana grave ──
let _bgMusicActive=false,_bgMusicTimeout=null,_bgMusicGain=null;
const _NOTES_ZIM=[146.8,174.6,196,220,261.6,293.6,349.2,392]; // pentatônica menor
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
  const SEQ=[0,2,4,5,4,2,5,7,5,4,2,4,2,0,2,4];
  function _ciclo(){
    if(!_bgMusicActive)return;
    const t=AC.currentTime+0.1;
    SEQ.forEach((idx,i)=>_nota(_NOTES_ZIM[idx%_NOTES_ZIM.length],t+i*0.45,0.52));
    _bgMusicTimeout=setTimeout(_ciclo,(SEQ.length*0.45-0.3)*1000);
  }
  _ciclo();
}
function stopBgMusic(){
  _bgMusicActive=false;clearTimeout(_bgMusicTimeout);
  if(_bgMusicGain&&AC){_bgMusicGain.gain.linearRampToValueAtTime(0,AC.currentTime+0.5);_bgMusicGain=null;}
}
let _prevState='';
function startGame(){G.state='title';loop();}
function loop(){
  requestAnimationFrame(loop);
  if(G.state!==_prevState){
    if(G.state==='playing'&&_prevState!=='playing')startBgMusic();
    if((G.state==='dead'||G.state==='complete')&&_prevState==='playing')stopBgMusic();
    _prevState=G.state;
  }
  if(G.state==='title'&&(jp.Enter||jp.Space))G.load(0);
  if(G.state==='dead'&&jp.KeyR)G.load(G.lvIdx);
  if(G.state==='complete'&&jp.Enter){unlockPhase('4.3');location.href='../../MenuPrincipal/index.html?unlocked=4.3';}
  G.update();G.draw();clearJP();
}
if(!gameReady){(function loadLoop(){if(gameReady)return;requestAnimationFrame(loadLoop);ctx.fillStyle='#050805';ctx.fillRect(0,0,W,H);ctx.fillStyle=UI_ACCENT;ctx.font='bold 24px Courier New';ctx.textAlign='center';ctx.fillText(`Carregando${'.'.repeat(Math.floor(Date.now()/400)%4)}  ${assetsLoaded}/${totalAssets}`,W/2,H/2);ctx.textAlign='left';})();}





