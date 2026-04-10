const W = 1280, H = 720;
const wrap   = document.getElementById('wrap');
const canvas = document.getElementById('c');
const ctx    = canvas.getContext('2d');
canvas.width  = W;
canvas.height = H;

function resize() {
  const scaleW = window.innerWidth  / W;
  const scaleH = window.innerHeight / H;
  const s  = Math.max(scaleW, scaleH);          // cover: sem barras laterais
  const sw = Math.round(W * s);
  const sh = Math.round(H * s);
  canvas.style.width  = sw + 'px';
  canvas.style.height = sh + 'px';
  wrap.style.width    = sw + 'px';
  wrap.style.height   = sh + 'px';
  wrap.style.position = 'fixed';
  wrap.style.overflow = 'hidden';
  wrap.style.left     = Math.round((window.innerWidth  - sw) / 2) + 'px';
  wrap.style.top      = Math.round((window.innerHeight - sh) / 2) + 'px';
}
resize();
window.addEventListener('resize', resize);

let AC;
try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){}
function sfx(type) {
  if (!AC) return;
  if (AC.state === 'suspended') AC.resume();
  const o = AC.createOscillator(), g = AC.createGain();
  o.connect(g); g.connect(AC.destination);
  const t = AC.currentTime;
  if      (type==='jump')   { o.frequency.setValueAtTime(280,t); o.frequency.exponentialRampToValueAtTime(520,t+.14); g.gain.setValueAtTime(.15,t); g.gain.exponentialRampToValueAtTime(.001,t+.16); }
  else if (type==='coin')   { o.frequency.setValueAtTime(880,t); o.frequency.exponentialRampToValueAtTime(1760,t+.09); g.gain.setValueAtTime(.12,t); g.gain.exponentialRampToValueAtTime(.001,t+.12); }
  else if (type==='hit')    { o.type='sawtooth'; o.frequency.setValueAtTime(200,t); o.frequency.exponentialRampToValueAtTime(50,t+.18); g.gain.setValueAtTime(.18,t); g.gain.exponentialRampToValueAtTime(.001,t+.2); }
  else if (type==='item')   { o.frequency.setValueAtTime(440,t); o.frequency.setValueAtTime(660,t+.1); o.frequency.setValueAtTime(880,t+.2); g.gain.setValueAtTime(.14,t); g.gain.exponentialRampToValueAtTime(.001,t+.3); }
  else if (type==='unlock') { o.frequency.setValueAtTime(330,t); o.frequency.setValueAtTime(440,t+.15); o.frequency.setValueAtTime(660,t+.3); g.gain.setValueAtTime(.15,t); g.gain.exponentialRampToValueAtTime(.001,t+.5); }
  else if (type==='stone')  { o.type='square'; o.frequency.setValueAtTime(120,t); g.gain.setValueAtTime(.1,t); g.gain.exponentialRampToValueAtTime(.001,t+.15); }
  o.start(t); o.stop(t+.6);
}


const IMG = {}, SPRITES = {};
const ASSETS = [
  ['bg01','Fase 1.3 - Cena 01.PNG'],
  ['bg02','Fase 1.3 - Cena 02.PNG'],
  ['bg03','Fase 1.3 - Cena 03.PNG'],
  ['bg04','Fase 1.3 - Cena 04.PNG'],
  ['walk','Sprite_Caminhando.PNG'],
  ['idle','Respirando_Levemente.PNG'],
  ['hurt','Soroche_-_Ofegante.PNG'],
  ['lant','Sprite_com_lanterna.PNG'],
  ['talk','Falando.PNG'],
  ['dig', 'Escavando.PNG'],
  ['condor','condor_sprite_sheet.png'], 
  ['capa', '1_3_machu_pichu.svg'],
];

function makeSprite(img, threshold = 28) {
  const oc = document.createElement('canvas');
  oc.width = img.naturalWidth; oc.height = img.naturalHeight;
  const c2 = oc.getContext('2d');
  c2.drawImage(img, 0, 0);
  const d = c2.getImageData(0, 0, oc.width, oc.height);
  for (let i = 0; i < d.data.length; i += 4) {
    const r=d.data[i], g=d.data[i+1], b=d.data[i+2];
    if (r<threshold && g<threshold && b<threshold) d.data[i+3]=0;
    else if (r<20 && g<20 && b<36) d.data[i+3]=0;
  }
  c2.putImageData(d, 0, 0);
  return oc;
}

const SPRITE_INFO = {
  walk:  { n:6, ox:8,  oy:0,  fw:84,  fh:200 },
  idle:  { n:4, ox:24, oy:80, fw:120, fh:440 },
  hurt:  { n:4, ox:36, oy:19, fw:172, fh:352 },
  lant:  { n:6, ox:11, oy:17, fw:183, fh:175 },
  talk:  { n:2, ox:25, oy:17, fw:184, fh:376 },
  dig :  { n:6, ox:0,  oy:0,  fw:245, fh:400 },
  condor:{ n:4, ox:0,  oy:0,  fw:336, fh:168 },
};

const SPRITE_KEYS_TO_PROCESS = ['walk','idle','hurt','lant','talk','dig','condor'];

let assetsLoaded = 0, totalAssets = ASSETS.length, gameReady = false;
ASSETS.forEach(([key,src]) => {
  const img = new Image();
  img.onload = () => {
    IMG[key] = img;
    if (SPRITE_KEYS_TO_PROCESS.includes(key)) SPRITES[key] = makeSprite(img);
    if (++assetsLoaded >= totalAssets) { gameReady = true; startGame(); }
  };
  img.onerror = () => { 
    console.error("Erro ao carregar o arquivo:", src); // Verifique isso no F12 se não carregar
    IMG[key]=null; 
    if (++assetsLoaded >= totalAssets) { gameReady=true; startGame(); } 
  };
  img.src = src;
});


const keys={}, jp={};
window.addEventListener('keydown', e => {
  if (!keys[e.code]) jp[e.code]=true;
  keys[e.code]=true;
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
});
window.addEventListener('keyup', e => delete keys[e.code]);

const TOUCH={l:false,r:false,j:false,e:false};
function bindT(id,k){ const el=document.getElementById(id); if(!el)return;
  el.addEventListener('touchstart',ev=>{ev.preventDefault();TOUCH[k]=true;if(k==='j'||k==='e')jp['_t'+k]=true;},{passive:false});
  el.addEventListener('touchend',  ev=>{ev.preventDefault();TOUCH[k]=false;},{passive:false}); }
bindT('tb-l','l'); bindT('tb-r','r'); bindT('tb-j','j'); bindT('tb-e','e');

const isL=()=>keys['ArrowLeft'] ||keys['KeyA']||TOUCH.l;
const isR=()=>keys['ArrowRight']||keys['KeyD']||TOUCH.r;
const isJ=()=>jp['ArrowUp']||jp['KeyW']||jp['Space']||jp['_tj'];
const isE=()=>jp['KeyE']||jp['Enter']||jp['_te'];
function clearJP(){ for(const k in jp) delete jp[k]; }


function drawSprite(key, frame, dx, dy, dw, dh, flipX=false, alpha=1) {
  const spr=SPRITES[key]; if(!spr) return false;
  const info=SPRITE_INFO[key];
  const fi=Math.floor(frame)%info.n;
  const nw=spr.width/info.n;
  const sx=fi*nw+info.ox;
  ctx.save(); ctx.globalAlpha=alpha;
  if (flipX) { ctx.translate(dx+dw,dy); ctx.scale(-1,1); ctx.drawImage(spr,sx,info.oy,info.fw,info.fh,0,0,dw,dh); }
  else       { ctx.drawImage(spr,sx,info.oy,info.fw,info.fh,dx,dy,dw,dh); }
  ctx.restore(); return true;
}

let dlgFaceT=0;
function drawFaceSprite(frame, talk=false){
  const fc=document.getElementById('dlg-fc'); if(!fc) return;
  const c2=fc.getContext('2d'); c2.clearRect(0,0,80,96);
  const key=talk?'talk':'idle'; const spr=SPRITES[key]||SPRITES['walk'];
  if(!spr){ c2.fillStyle='#c8845a'; c2.fillRect(20,8,40,40); return; }
  const info=SPRITE_INFO[key]; const fi=Math.floor(frame)%info.n;
  const nw=spr.width/info.n; const sx=fi*nw+info.ox;
  const showH=info.fh*0.55; const scale=96/showH;
  const dw=info.fw*scale; c2.drawImage(spr,sx,info.oy,info.fw,showH,(80-dw)/2,0,dw,96);
}


let particles=[];
function burst(x,y,color,n=8,spd=3.5){
  for(let i=0;i<n;i++){
    const a=(i/n)*Math.PI*2+Math.random()*.5;
    particles.push({x,y,vx:Math.cos(a)*spd*(0.4+Math.random()),vy:Math.sin(a)*spd*(0.4+Math.random())-1,life:40+Math.random()*20,max:60,color,r:3+Math.random()*4});
  }
}
function tickParticles(){ for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=0.2;p.life--;if(p.life<=0)particles.splice(i,1);} }
function drawParticles(){ for(const p of particles){ctx.globalAlpha=p.life/p.max;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x-cam.x,p.y-cam.y,p.r*(p.life/p.max),0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1; }


const cam={x:0,y:0};
function updateCam(px,worldW){
  const target=px-W/2+24;
  const clamped=Math.max(0,Math.min(target,worldW-W));
  cam.x+=(clamped-cam.x)*0.12;
}

// ═══════════════════════════════════════════════════════════
//  PHYSICS CONSTANTS
// ═══════════════════════════════════════════════════════════
const GRAV=0.46, PSPD=4.6, JUMPF=-12.4, MAXFALL=16;

// ═══════════════════════════════════════════════════════════
//  TILE THEMES
// ═══════════════════════════════════════════════════════════
const TILE_THEMES={
  1:{top:'#b09060',body:'#8a6a3a',dark:'#5a3a18'},
  2:{top:'#5a4835',body:'#3a2818',dark:'#22180e'},
  3:{top:'#5a4835',body:'#3a2818',dark:'#1a1008'},
  4:{top:'#9a8855',body:'#6a5830',dark:'#3a2e14'},
};
let tileTheme=TILE_THEMES[1];

// ═══════════════════════════════════════════════════════════
//  PLATFORM FACTORY & RENDER
// ═══════════════════════════════════════════════════════════
function solid(x,y,w,h){ return {type:'solid',x,y,w,h}; }
function movH(x,y,w,x0,x1,spd){ return {type:'solid',moving:true,x,y,w,h:18,x0,x1,spd,vx:spd,vy:0}; }
function movV(x,y,w,y0,y1,spd){ return {type:'solid',moving:true,x,y,w,h:18,y0,y1,spd,vx:0,vy:spd}; }
function trap(x,y,w){ return {type:'trapdoor',x,y,w,h:14}; }
function water(x,y,w,h){ return {type:'water',x,y,w,h}; }
function spike(x,y,w){ return {type:'spike',x,y,w,h:20}; }

function tickMoving(plats){
  for(const p of plats){
    if(!p.moving) continue;
    if(p.x0!==undefined){p.x+=p.vx; if(p.x<=p.x0||p.x+p.w>=p.x1) p.vx=-p.vx;}
    if(p.y0!==undefined){p.y+=p.vy; if(p.y<=p.y0||p.y>=p.y1) p.vy=-p.vy;}
  }
}
function tickTrapdoors(plats){
  for(const p of plats){
    if(p.type!=='trapdoor') continue;
    if(p.crumble!==undefined){p.crumble--;if(p.crumble<=0){p.crumble=undefined;p.type='_dead';}}
  }
}

function drawPlatform(p){
  const sx=p.x-cam.x, sy=p.y-cam.y;
  if(sx>W+80||sx+p.w<-80||sy>H+40||sy+p.h<-40) return;
  if(p.type==='spike'){
    const nc=Math.max(1,Math.floor(p.w/20)); ctx.fillStyle='#cc3020';
    for(let i=0;i<nc;i++){const tx=sx+i*(p.w/nc);ctx.beginPath();ctx.moveTo(tx,sy+p.h);ctx.lineTo(tx+p.w/nc/2,sy);ctx.lineTo(tx+p.w/nc,sy+p.h);ctx.fill();}
    return;
  }
  if(p.type==='water'){
    const wg=ctx.createLinearGradient(0,sy,0,sy+p.h);
    wg.addColorStop(0,'rgba(30,80,180,0.78)'); wg.addColorStop(1,'rgba(10,30,100,0.9)');
    ctx.fillStyle=wg; ctx.fillRect(sx,sy,p.w,p.h);
    ctx.fillStyle='rgba(100,160,255,0.25)'; ctx.fillRect(sx,sy,p.w,6+Math.sin(Date.now()/1200+sx)*3);
    return;
  }
  if(p.type==='trapdoor'){
    const alpha=p.crumble!==undefined?p.crumble/70:1; ctx.globalAlpha=alpha;
    ctx.fillStyle=tileTheme.dark; ctx.fillRect(sx,sy,p.w,p.h);
    ctx.fillStyle=tileTheme.top;  ctx.fillRect(sx,sy,p.w,3);
    ctx.globalAlpha=1; return;
  }
  if(p.type==='_dead') return;
  const ts=24, cols=Math.ceil(p.w/ts), rows=Math.ceil(p.h/ts);
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      const tx=sx+c*ts, ty=sy+r*ts, tw=Math.min(ts,sx+p.w-tx), th=Math.min(ts,sy+p.h-ty);
      ctx.fillStyle=r===0?tileTheme.body:(r%2===0?tileTheme.dark:tileTheme.body); ctx.fillRect(tx,ty,tw,th);
      ctx.fillStyle='rgba(0,0,0,0.08)'; ctx.fillRect(tx+tw-1,ty,1,th); ctx.fillRect(tx,ty+th-1,tw,1);
    }
  }
  ctx.fillStyle=tileTheme.top; ctx.fillRect(sx,sy,p.w,4);
  if(p.moving){ ctx.fillStyle='rgba(240,192,64,0.35)'; ctx.fillRect(sx,sy,p.w,4); }
}

// ═══════════════════════════════════════════════════════════
//  HELPER: ROUNDED RECT
// ═══════════════════════════════════════════════════════════
function roundRect(x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
  ctx.closePath();
}

// ═══════════════════════════════════════════════════════════
//  SISTEMA DE BALÕES DE DIÁLOGO
// ═══════════════════════════════════════════════════════════
function wrapText(text, maxW) {
  ctx.font = '15px "Courier New"';
  const paragraphs = text.split('\n');
  const result = [];
  for (const para of paragraphs) {
    const words = para.split(' ');
    let line = '';
    for (const word of words) {
      const test = line ? line+' '+word : word;
      if (ctx.measureText(test).width > maxW && line) { result.push(line); line=word; }
      else line=test;
    }
    if (line) result.push(line);
  }
  return result;
}

const BUBBLE = {
  active: false,
  queue: [],
  cb: null,
  lines: [],
  speakerTxt: 'CORVAN',
  faceFrame: 0,

  show(messages, cb, speaker='CORVAN') {
    this.queue = [...messages];
    this.cb = cb;
    this.active = true;
    this.speakerTxt = speaker;
    G.dialog = true;
    this._next();
  },

  _next() {
    if (!this.queue.length) {
      this.active = false;
      G.dialog = false;
      if (this.cb) { const f=this.cb; this.cb=null; f(); }
      return;
    }
    const raw = this.queue.shift();
    this.lines = wrapText(raw, 480);
  },

  advance() { if (this.active) this._next(); },

  draw(player) {
    if (!this.active) return;
    this.faceFrame += 0.08;

    const FONT    = '15px "Courier New"';
    const NAMEFNT = 'bold 12px "Courier New"';
    ctx.font = FONT;
    const lineH   = 22;
    const pad     = 18;
    const faceW   = 56;
    const faceH   = 68;
    const textAreaW = 480;

    const bubW = faceW + pad + textAreaW + pad*2;
    const bubH = Math.max(faceH, this.lines.length*lineH + 30) + pad*2;

    const pcx = player.x - cam.x + player.w/2;
    const pcy = player.y - cam.y;

    let bx = pcx - bubW/2;
    let by = pcy - bubH - 28;

    bx = Math.max(12, Math.min(bx, W - bubW - 12));
    if (by < 40) by = pcy + player.h + 10;
    by = Math.max(40, Math.min(by, H - bubH - 10));

    ctx.shadowColor='rgba(0,0,0,0.6)'; ctx.shadowBlur=12;
    ctx.fillStyle='rgba(6,3,0,0.94)';
    roundRect(bx,by,bubW,bubH,14); ctx.fill();
    ctx.shadowBlur=0;

    ctx.strokeStyle='#c8a020'; ctx.lineWidth=2.5;
    roundRect(bx,by,bubW,bubH,14); ctx.stroke();

    const tailBaseX = Math.max(bx+30, Math.min(pcx, bx+bubW-30));
    const tailTopY  = by + bubH;
    const tailTipX  = pcx;
    const tailTipY  = Math.min(pcy, tailTopY+36);

    ctx.fillStyle='rgba(6,3,0,0.94)';
    ctx.beginPath();
    ctx.moveTo(tailBaseX-14, tailTopY);
    ctx.lineTo(tailBaseX+14, tailTopY);
    ctx.lineTo(tailTipX, tailTipY);
    ctx.closePath(); ctx.fill();

    ctx.strokeStyle='#c8a020'; ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(tailBaseX-14, tailTopY);
    ctx.lineTo(tailTipX, tailTipY);
    ctx.lineTo(tailBaseX+14, tailTopY);
    ctx.stroke();

    const fx = bx+pad, fy = by+pad;
    if (SPRITES['idle']||SPRITES['talk']) {
      const key = 'talk';
      const spr = SPRITES[key]||SPRITES['idle']||SPRITES['walk'];
      if (spr) {
        const info = SPRITE_INFO[key]||SPRITE_INFO['idle']||SPRITE_INFO['walk'];
        const fi = Math.floor(this.faceFrame)%info.n;
        const nw = spr.width/info.n;
        const showH = info.fh*0.55;
        const scl = faceH/showH;
        const dw = info.fw*scl;
        ctx.save();
        ctx.beginPath(); ctx.rect(fx,fy,faceW,faceH); ctx.clip();
        ctx.drawImage(spr, fi*nw+info.ox, info.oy, info.fw, showH, fx+(faceW-dw)/2, fy, dw, faceH);
        ctx.restore();
      }
    } else {
      ctx.fillStyle='#c8845a'; ctx.fillRect(fx+8,fy+4,40,50);
    }
    ctx.strokeStyle='rgba(200,160,32,0.5)'; ctx.lineWidth=1.5;
    ctx.strokeRect(fx,fy,faceW,faceH);

    const tx = fx + faceW + pad;
    ctx.font = NAMEFNT;
    ctx.fillStyle='#f0c040';
    ctx.fillText(this.speakerTxt, tx, by+pad+14);

    ctx.font = FONT;
    ctx.fillStyle='#f0e8c0';
    this.lines.forEach((l,i)=>ctx.fillText(l, tx, by+pad+36+i*lineH));

    const pulse = 0.55+Math.sin(Date.now()/400)*0.45;
    ctx.fillStyle=`rgba(200,160,32,${pulse})`;
    ctx.font='12px "Courier New"';
    ctx.textAlign='right';
    ctx.fillText('[E] Continuar →', bx+bubW-pad, by+bubH-8);
    ctx.textAlign='left';
  }
};

function showDialog(lines, cb, speaker='CORVAN') { BUBBLE.show(lines, cb, speaker); }
function checkDlg() { if (G.dialog && isE()) BUBBLE.advance(); }

// ═══════════════════════════════════════════════════════════
//  NOTIFICATION
// ═══════════════════════════════════════════════════════════
let notifText='', notifAlpha=0, notifTimer=0;
function notify(msg, ms=2800){
  notifText=msg; notifTimer=ms; notifAlpha=1;
}
function tickNotif(){
  if(notifTimer>0){
    notifTimer-=16;
    if(notifTimer<=0) notifAlpha=0;
    else notifAlpha=Math.min(1, notifTimer/300);
  }
}
function drawNotif(){
  if(notifAlpha<=0) return;
  ctx.save();
  ctx.globalAlpha=notifAlpha;
  ctx.font='14px "Courier New"';
  const tw=ctx.measureText(notifText).width+32;
  const nx=(W-tw)/2, ny=46;
  ctx.fillStyle='rgba(0,0,0,0.82)'; roundRect(nx,ny,tw,28,6); ctx.fill();
  ctx.strokeStyle='#f0c040'; ctx.lineWidth=1.5; roundRect(nx,ny,tw,28,6); ctx.stroke();
  ctx.fillStyle='#f0c040'; ctx.textAlign='center'; ctx.fillText(notifText,W/2,ny+19); ctx.textAlign='left';
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════
//  ENEMY — patrulha baseada em spawnX (não em distância do player)
//  Assim os inimigos se movem desde o início, sem precisar do player perto
// ═══════════════════════════════════════════════════════════
class Enemy {
  constructor(x,y,type,patrol){
    this.x=x; this.y=y;
    this.spawnX=x;         // ← posição de spawn fixa para a patrulha
    this.type=type;
    this.w=type==='snake'?60:36;
    this.h=type==='snake'?24:60;
    this.patrol=patrol; this.vx=1.4; this.facing=1; this.dead=false; this.frame=0;
  }
  update(plats,player){
    if(this.dead) return;
    this.x+=this.vx; this.frame+=0.08;
    let onG=false;
    for(const p of plats){
      if(p.type==='spike'||p.type==='water'||p.type==='_dead') continue;
      if(this.x+this.w>p.x&&this.x<p.x+p.w&&this.y+this.h>=p.y&&this.y+this.h<=p.y+10) onG=true;
    }
    const edge=this.vx>0?this.x+this.w:this.x;
    let onEdge=false;
    for(const p of plats){
      if(p.type==='spike'||p.type==='water'||p.type==='_dead') continue;
      if(edge>p.x&&edge<p.x+p.w&&this.y+this.h+2>=p.y&&this.y+this.h+2<=p.y+12) onEdge=true;
    }
    // ← Usa spawnX ao invés de player.x: inimigos patrulham desde o início
    if((onG&&!onEdge)||Math.abs(this.x-this.spawnX)>this.patrol) this.vx=-this.vx;
    this.facing=this.vx>0?1:-1;
  }
  draw(){
    if(this.dead) return;
    const sx=this.x-cam.x, sy=this.y-cam.y;
    if(sx<-80||sx>W+80) return;
    ctx.save(); ctx.translate(sx+this.w/2,sy+this.h);
    if(this.facing===-1) ctx.scale(-1,1);
    if(this.type==='guardian'){
      ctx.fillStyle='#7a6a50'; ctx.fillRect(-16,-60,32,60);
      ctx.fillStyle='#5a4a34'; ctx.fillRect(-14,-58,28,20);
      ctx.fillStyle='#cc2020'; ctx.fillRect(-9,-50,7,7); ctx.fillRect(2,-50,7,7);
      ctx.fillStyle='#3a2a18'; ctx.fillRect(-13,-30,11,30); ctx.fillRect(2,-30,11,30);
      ctx.fillStyle='#6a5a40'; ctx.fillRect(-22,-40,8,18); ctx.fillRect(14,-40,8,18);
      ctx.strokeStyle='rgba(0,0,0,0.3)'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(-4,-58); ctx.lineTo(-2,-38); ctx.stroke();
    } else if(this.type==='snake'){
      const t=Date.now()/200+this.x/30;
      ctx.fillStyle='#2a5a18';
      for(let i=4;i>=0;i--){ctx.beginPath();ctx.arc(-12+i*7,-10+Math.sin(t+i)*5,7,0,Math.PI*2);ctx.fill();}
      ctx.fillStyle='#1a4a10'; ctx.beginPath(); ctx.arc(24,-10+Math.sin(t+5)*5,10,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#e8d010'; ctx.fillRect(26,-16+Math.sin(t+5)*5,4,4);
      ctx.fillStyle='#d00'; ctx.fillRect(32,-11+Math.sin(t+5)*5,7,2);
    }
    ctx.restore();
  }
}

// ═══════════════════════════════════════════════════════════
//  CONDOR ALIADO — usa sprite se disponível, fallback procedural
// ═══════════════════════════════════════════════════════════
class CondorCompanion {
  constructor(){
    this.x=400; this.y=200;
    this.angle=0;
    this.frame=0;
    this.sparkT=0;
    this.sparks=[];
    this.visible=false;
    this.introShown=false;
  }

  update(player){
    this.frame+=0.055;
    this.angle+=0.018;
    this.sparkT++;

    const orbitR = 110;
    const orbitX = player.x + Math.cos(this.angle)*orbitR*1.3;
    const orbitY = player.y - 160 + Math.sin(this.angle)*orbitR*0.5;
    this.x += (orbitX - this.x) * 0.04;
    this.y += (orbitY - this.y) * 0.04;

    if(this.sparkT%12===0){
      this.sparks.push({
        x: this.x, y: this.y,
        vx: (Math.random()-0.5)*0.8,
        vy: (Math.random()+0.3)*0.6,
        life: 55, max:55,
        size: 2+Math.random()*3
      });
    }
    for(let i=this.sparks.length-1;i>=0;i--){
      const s=this.sparks[i]; s.x+=s.vx; s.y+=s.vy; s.life--;
      if(s.life<=0) this.sparks.splice(i,1);
    }
  }

  draw(){
    // Partículas douradas
    for(const s of this.sparks){
      ctx.save();
      ctx.globalAlpha=(s.life/s.max)*0.7;
      ctx.fillStyle='#f0c040';
      ctx.beginPath(); ctx.arc(s.x-cam.x,s.y-cam.y,s.size*(s.life/s.max),0,Math.PI*2); ctx.fill();
      ctx.restore();
    }

    const sx=this.x-cam.x, sy=this.y-cam.y;
    if(sx<-120||sx>W+120) return;

    // Brilho dourado
    ctx.save();
    const glow=ctx.createRadialGradient(sx,sy,0,sx,sy,70);
    glow.addColorStop(0,'rgba(255,210,60,0.25)');
    glow.addColorStop(1,'rgba(255,180,0,0)');
    ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(sx,sy,70,0,Math.PI*2); ctx.fill();
    ctx.restore();

    // ── Usa o sprite do condor se carregado ──
    if(SPRITES['condor']){
      const dw=140, dh=70;
      const flipLeft = Math.cos(this.angle) < 0;
      drawSprite('condor', Math.floor(this.frame)%4, sx-dw/2, sy-dh/2, dw, dh, flipLeft);
    } else {
      // Fallback procedural
      const flap=Math.sin(this.frame*Math.PI/1.8)*16;
      ctx.save(); ctx.translate(sx,sy);
      ctx.fillStyle='#2a2010';
      ctx.beginPath(); ctx.ellipse(-46,flap,44,10,Math.PI/8,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse( 46,-flap,44,10,-Math.PI/8,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#201808';
      ctx.beginPath(); ctx.ellipse(0,0,18,13,0,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(255,240,200,0.9)'; ctx.lineWidth=2.5;
      ctx.beginPath(); ctx.arc(0,3,11,Math.PI,0); ctx.stroke();
      ctx.fillStyle='#181408'; ctx.beginPath(); ctx.arc(0,-16,10,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#f0a020'; ctx.beginPath(); ctx.arc(5,-18,4,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#fff';    ctx.beginPath(); ctx.arc(6,-19,1.5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#d4a020'; ctx.fillRect(10,-20,11,4);
      ctx.strokeStyle='rgba(255,215,60,0.18)'; ctx.lineWidth=4;
      ctx.beginPath(); ctx.arc(0,-18,18,0,Math.PI*2); ctx.stroke();
      ctx.restore();
    }
  }

  speak(msg){
    showDialog(msg, null, '✦ CONDOR');
  }
}

// ═══════════════════════════════════════════════════════════
//  COLLECTIBLE
// ═══════════════════════════════════════════════════════════
class Col{
  constructor(x,y,type){this.x=x;this.y=y;this.w=30;this.h=30;this.type=type;this.done=false;this.t=Math.random()*Math.PI*2;}
  tick(){if(!this.done)this.t+=0.06;}
  draw(){
    if(this.done) return;
    const sx=this.x-cam.x, sy=this.y-cam.y+Math.sin(this.t)*5;
    if(sx<-50||sx>W+50) return;
    ctx.save(); ctx.translate(sx+15,sy+15);
    if(this.type==='gold'){
      ctx.fillStyle='#f0c040'; ctx.beginPath(); ctx.arc(0,0,12,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#a07010'; ctx.lineWidth=2; ctx.stroke();
      ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.arc(-4,-4,4,0,Math.PI*2); ctx.fill();
    } else if(this.type==='lantern'){
      ctx.fillStyle='#c8a020'; ctx.fillRect(-8,-12,16,22);
      ctx.fillStyle='#f0e060'; ctx.fillRect(-5,-9,10,15);
      ctx.strokeStyle='#806010'; ctx.lineWidth=1.5; ctx.strokeRect(-8,-12,16,22);
      ctx.fillStyle='rgba(255,220,80,0.4)'; ctx.beginPath(); ctx.arc(0,0,20,0,Math.PI*2); ctx.fill();
    } else if(this.type==='stone'){
      ctx.fillStyle='#9090b8';
      ctx.beginPath(); ctx.moveTo(0,-14); ctx.lineTo(12,5); ctx.lineTo(7,14); ctx.lineTo(-7,14); ctx.lineTo(-12,5); ctx.closePath(); ctx.fill();
      ctx.strokeStyle='#6060a0'; ctx.lineWidth=1.5; ctx.stroke();
      ctx.fillStyle='rgba(180,180,255,0.45)'; ctx.beginPath(); ctx.arc(-2,-3,5,0,Math.PI*2); ctx.fill();
    } else if(this.type==='tumi'){
      ctx.fillStyle='#f0c040';
      ctx.beginPath(); ctx.moveTo(0,-18); ctx.lineTo(16,-5); ctx.lineTo(18,8); ctx.lineTo(10,20); ctx.lineTo(-10,20); ctx.lineTo(-18,8); ctx.lineTo(-16,-5); ctx.closePath(); ctx.fill();
      ctx.strokeStyle='#a07010'; ctx.lineWidth=2; ctx.stroke();
      ctx.fillStyle='#28a890'; ctx.beginPath(); ctx.arc(0,6,7,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(255,240,100,0.6)'; ctx.beginPath(); ctx.arc(-5,-8,4,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }
}

// ═══════════════════════════════════════════════════════════
//  TRIGGER
// ═══════════════════════════════════════════════════════════
class Trigger{
  constructor(x,y,w,h,label,fn){this.x=x;this.y=y;this.w=w;this.h=h;this.label=label;this.fn=fn;this.done=false;}
  draw(px,py){
    if(this.done) return;
    const near=Math.abs((px+24)-(this.x+this.w/2))<this.w/2+72&&Math.abs((py+40)-(this.y+this.h/2))<this.h/2+72;
    if(!near) return;
    const sx=this.x+this.w/2-cam.x, sy=this.y-cam.y-26+Math.sin(Date.now()/350)*4;
    const txt='[E] '+this.label;
    ctx.font='14px "Courier New"';
    const tw=ctx.measureText(txt).width+24;
    ctx.fillStyle='rgba(0,0,0,0.78)'; roundRect(sx-tw/2,sy-16,tw,24,4); ctx.fill();
    ctx.strokeStyle='#f0c040'; ctx.lineWidth=1.5; roundRect(sx-tw/2,sy-16,tw,24,4); ctx.stroke();
    ctx.fillStyle='#f0c040'; ctx.textAlign='center'; ctx.fillText(txt,sx,sy); ctx.textAlign='left';
  }
}

// ═══════════════════════════════════════════════════════════
//  PLAYER
// ═══════════════════════════════════════════════════════════
class Player{
  constructor(x,y){
    this.x=x; this.y=y; this.w=40; this.h=80;
    this.vx=0; this.vy=0; this.onG=false; this.facing=1;
    this.hp=3; this.maxHp=3; this.inv=0; this.dead=false;
    this.frame=0; this.ft=0; this.state='idle';
    this.coyote=0; this.jbuf=0; this.onMoving=null;
    this.items=[]; this.score=0;
    this.soroche=0; this.sorocheAnim=0; this.interactAnim=0;
  }

  overlaps(r){return this.x<r.x+r.w&&this.x+this.w>r.x&&this.y<r.y+r.h&&this.y+this.h>r.y;}
  near(r,d=80){return Math.abs(this.x+20-(r.x+r.w/2))<r.w/2+d&&Math.abs(this.y+40-(r.y+r.h/2))<r.h/2+d;}

  update(level){
    if(G.dialog) return;
    if(isR()||isL()) this.soroche=Math.min(100,this.soroche+0.08);
    else             this.soroche=Math.max(0,this.soroche-0.3);
    if(this.soroche>=100) this.sorocheAnim=Math.min(120,this.sorocheAnim+1);
    else                  this.sorocheAnim=Math.max(0,this.sorocheAnim-2);
    const sm=this.soroche>=100?0.55:1.0;

    if(isL()){this.vx=-PSPD*sm;this.facing=-1;}
    else if(isR()){this.vx=PSPD*sm;this.facing=1;}
    else this.vx*=0.7;

    if(this.onG) this.coyote=8; else if(this.coyote>0) this.coyote--;
    if(isJ()) this.jbuf=10;
    if(this.jbuf>0) this.jbuf--;
    if(this.jbuf>0&&(this.onG||this.coyote>0)){this.vy=JUMPF;this.onG=false;this.coyote=0;this.jbuf=0;sfx('jump');}

    if(this.onMoving){this.x+=this.onMoving.vx||0;this.y+=this.onMoving.vy||0;}
    this.onMoving=null;
    this.vy=Math.min(this.vy+GRAV,MAXFALL);
    this.x+=this.vx;
    this._colX(level.plats);
    this.onG=false;
    this.y+=this.vy;
    this._colY(level.plats);
    this.x=Math.max(0,this.x);

    if(!this.inv){
      for(const p of level.plats)
        if((p.type==='spike'||p.type==='water')&&this.overlaps(p)) this._hurt(p.type==='water'?3:1,level);
      for(const e of level.enemies){
        if(!e.dead&&this.overlaps(e)){
          if(this.vy>2&&this.y+this.h<e.y+e.h*0.5){e.dead=true;this.vy=-8;burst(e.x+20,e.y,'#f0c040',10);sfx('coin');}
          else{this._hurt(1,level);this.vy=-7;this.vx=(this.x<e.x?-7:7);}
        }
      }
    }
    if(this.inv>0) this.inv--;
    if(this.interactAnim>0) this.interactAnim--;

    for(const c of level.cols){
      if(!c.done&&this.overlaps(c)){
        c.done=true;
        if(c.type==='gold'){this.score+=10;sfx('coin');burst(c.x+15,c.y+15,'#f0c040');}
        else{this.items.push(c.type);sfx('item');burst(c.x+15,c.y+15,'#f0c040',12);}
      }
    }
    if(isE()){for(const t of level.triggers){if(!t.done&&this.near(t)){t.fn(this,level);break;}}}
    if(this.y>level.H+200) this._hurt(3,level);

    if(!this.onG&&this.vy<0)     this.state='jump';
    else if(!this.onG&&this.vy>0) this.state='fall';
    else if(Math.abs(this.vx)>0.5) this.state='run';
    else this.state='idle';
    const spd=this.state==='run'?6:this.state==='idle'?18:8;
    if(++this.ft>=spd){this.ft=0;this.frame=(this.frame+1)%6;}
  }

  _colX(plats){
    for(const p of plats){
      if(p.type==='spike'||p.type==='water'||p.type==='_dead') continue;
      if(this.overlaps(p)){
        // só permite "subir degrau" se os pés estiverem a menos de 4px do topo
        if(this.y+this.h <= p.y+4) continue;
        if(this.vx>0) this.x=p.x-this.w; else this.x=p.x+p.w;
        this.vx=0;
      }
    }
  }
  _colY(plats){
    for(const p of plats){
      if(p.type==='spike'||p.type==='water'||p.type==='_dead') continue;
      if(p.type==='trapdoor'&&this.vy<0) continue;
      if(this.overlaps(p)){
        if(this.vy>=0){
          this.y=p.y-this.h; this.vy=0; this.onG=true;
          if(p.moving) this.onMoving=p;
          if(p.type==='trapdoor'&&p.crumble===undefined) p.crumble=70;
        } else {
          // só bate no teto se os pés estavam abaixo da base da plataforma
          // evita teletransportar o jogador ao bater no LADO de blocos altos
          if(this.y+this.h > p.y+p.h-4){
            this.y=p.y+p.h; this.vy=Math.abs(this.vy)*0.2;
          }
        }
      }
    }
  }
  _hurt(dmg,level){
    if(this.inv>0) return;
    this.hp-=dmg; this.inv=100;
    burst(this.x+20,this.y+40,'#ff4040',10); sfx('hit');
    if(this.hp<=0){this.hp=0;this.dead=true;}
  }

  draw(){
    if(this.dead) return;
    const dx=this.x-cam.x, dy=this.y-cam.y;
    const dw=this.w*2.4, dh=this.h*1.45;
    const ox=(dw-this.w)/2, oy=dh-this.h;
    const flip=this.facing===-1;
    const hasLant=this.items.includes('lantern');
    let drawn=false;
    if(this.interactAnim>0&&this.state!=='jump') drawn=drawSprite('dig',this.frame,dx-ox,dy-oy,dw,dh,flip);
    else if(hasLant)        drawn=drawSprite('lant',this.frame,dx-ox,dy-oy,dw,dh,flip);
    else if(this.state==='run')  drawn=drawSprite('walk',this.frame,dx-ox,dy-oy,dw,dh,flip);
    else if(this.state==='idle') drawn=drawSprite('idle',this.frame%4,dx-ox,dy-oy,dw,dh,flip);
    if(!drawn){
      ctx.save();
      if(flip){ctx.translate(dx+this.w,dy);ctx.scale(-1,1);}else ctx.translate(dx,dy);
      ctx.fillStyle='#c8845a';ctx.fillRect(8,0,24,20);
      ctx.fillStyle='#4a2e10';ctx.fillRect(6,-4,28,8);
      ctx.fillStyle='#f0c040';ctx.fillRect(16,-6,8,4);
      ctx.fillStyle='#b82010';ctx.fillRect(6,20,28,30);
      ctx.fillStyle='#383838';ctx.fillRect(8,50,12,24);ctx.fillRect(22,50,12,24);
      ctx.fillStyle='#c8845a';ctx.fillRect(2,22,6,18);ctx.fillRect(32,22,6,18);
      ctx.restore();
    }
    if(hasLant){
      const gx=dx+(flip?-8:this.w+4), gy=dy+this.h*0.7;
      const lg=ctx.createRadialGradient(gx,gy,0,gx,gy,80);
      lg.addColorStop(0,'rgba(255,200,80,0.22)'); lg.addColorStop(1,'rgba(255,200,80,0)');
      ctx.fillStyle=lg; ctx.fillRect(gx-80,gy-80,160,160);
    }
    if(this.inv>0&&Math.floor(this.inv/6)%2===0){ctx.fillStyle='rgba(255,60,60,0.35)';ctx.fillRect(dx,dy,this.w,this.h);}
    if(this.sorocheAnim>0){
      const a=this.sorocheAnim/120*0.5;
      ctx.fillStyle=`rgba(80,20,20,${a})`;ctx.fillRect(0,0,W,H);
      if(this.sorocheAnim>60){
        ctx.fillStyle=`rgba(255,80,0,${(this.sorocheAnim-60)/60*0.7})`;
        ctx.font='bold 28px "Courier New"';ctx.textAlign='center';
        ctx.fillText('⚠ SOROCHE!',W/2,90);ctx.textAlign='left';
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════
//  BACKGROUNDS
// ═══════════════════════════════════════════════════════════
function drawBg(bgKey){
  const img=IMG[bgKey];
  if(img&&img.complete&&img.naturalWidth>0){
    const scale=Math.max(W/img.naturalWidth, H/img.naturalHeight);
    const sw=img.naturalWidth*scale, sh=img.naturalHeight*scale;
    ctx.drawImage(img,(W-sw)/2,(H-sh)/2,sw,sh);
  } else {
    const fb={bg01:'#4a8fd4',bg02:'#c04020',bg03:'#1a1208',bg04:'#0a0808'};
    const grd=ctx.createLinearGradient(0,0,0,H);
    grd.addColorStop(0,fb[bgKey]||'#111'); grd.addColorStop(1,'#0a0600');
    ctx.fillStyle=grd; ctx.fillRect(0,0,W,H);
  }
  ctx.fillStyle='rgba(0,0,0,0.28)'; ctx.fillRect(0,0,W,H);
}

// ═══════════════════════════════════════════════════════════
//  LEVEL 1 — Espinhos realocados: chão + plataformas
// ═══════════════════════════════════════════════════════════
function buildL1(){
  const FL=580,WW=3600,WH=900;
  const plats=[
    solid(0,FL,480,WH-FL),
    solid(560,FL,200,WH-FL),solid(840,FL,180,WH-FL),solid(1100,FL,220,WH-FL),
    solid(1400,FL,200,WH-FL),solid(1680,FL,240,WH-FL),solid(1980,FL,260,WH-FL),
    solid(2310,FL,200,WH-FL),solid(2580,FL,220,WH-FL),solid(2860,FL,260,WH-FL),
    solid(3180,FL,600,WH-FL),
    solid(200,FL-160,140,18),solid(420,FL-260,120,18),solid(640,FL-200,140,18),
    solid(870,FL-280,120,18),solid(1080,FL-180,140,18),solid(1320,FL-300,120,18),
    solid(1500,FL-200,150,18),solid(1760,FL-280,130,18),solid(2050,FL-180,150,18),
    solid(2220,FL-320,120,18),solid(2450,FL-220,140,18),solid(2700,FL-300,120,18),
    solid(2940,FL-200,150,18),
    movH(480,FL-36,80,480,560,2.2),movH(760,FL-36,80,760,840,2.0),
    movH(1020,FL-36,80,1020,1100,2.2),movH(1320,FL-36,80,1320,1400,1.8),
    movH(1620,FL-36,80,1620,1680,2.0),movH(1920,FL-36,80,1920,1980,2.2),
    movH(2240,FL-36,80,2240,2310,2.0),movH(2520,FL-36,80,2520,2580,1.8),
    movH(2800,FL-36,80,2800,2860,2.2),movH(3080,FL-36,80,3080,3180,2.0),
    trap(640,FL-80,100),trap(1180,FL-80,100),
    spike(455,FL-20,25), spike(560,FL-20,25),
    spike(818,FL-20,25), spike(1025,FL-20,25),
    spike(430,FL-278,30), spike(880,FL-298,30), spike(1330,FL-318,30),
  ];
  const enemies=[
    new Enemy(660,FL-44,'guardian',60),new Enemy(1180,FL-44,'snake',80),
    new Enemy(1800,FL-44,'guardian',70),new Enemy(2400,FL-44,'snake',90),
    new Enemy(2900,FL-44,'guardian',80),
  ];
  const cols=[
    ...[100,250,480,700,920,1160,1450,1680,1960,2220,2500,2760,3040,3200,3350].map(x=>new Col(x,FL-50,'gold')),
    new Col(3300,FL-80,'lantern'),
  ];
  const triggers=[
    new Trigger(3380,FL-300,200,300,'Acender o Intihuatana',(player,level)=>{
      if(!player.items.includes('lantern')){notify('Colete a Lanterna primeiro!');return;}
      player.interactAnim=90; sfx('unlock');            // ← comemorando mais tempo
      showDialog([
        '"Chegamos ao Vale Sagrado. O verdadeiro \'ouro\' não era apenas o metal — era o domínio do tempo e das estrelas."',
        '"Os Incas construíram Machu Picchu numa altitude de 2.430 metros. Cada pedra foi colocada com precisão milimétrica, sem uso de cimento."',
        '"O Intihuatana é um relógio solar de pedra. Ao alinhar a luz com a picareta, você revela a câmara oculta."',
        'O portão de pedra range e se abre. A câmara das constelações aguarda!'
      ],()=>{notify('✦ Portão aberto! Próxima cena desbloqueada!');level.triggers[0].done=true;setTimeout(()=>G.nextLevel(),4000);}); // ← 4 s
    }),
  ];
  return{
    id:1,bg:'bg01',W:WW,H:WH,startX:60,startY:FL-90,
    title:'Cena I — O Observatório das Nuvens',
    hint:'Colete a 🔦 Lanterna e use [E] no Intihuatana ao final!',
    plats,enemies,cols,triggers,
    intro:[
      '"Machu Picchu foi construída pelos Incas no século XV, a 2.430 metros de altitude nos Andes peruanos."',
      '"É considerada uma das Sete Maravilhas do Mundo Moderno — e ninguém sabe ao certo como as pedras chegaram até aqui."',
      'Encontre a Lanterna de arqueólogo e use-a no Intihuatana para abrir o portal!'
    ],
    update(player){tickMoving(this.plats);tickTrapdoors(this.plats);for(const e of this.enemies)e.update(this.plats,player);for(const c of this.cols)c.tick();},
    draw(player){
      const ix=3400-cam.x,iy=FL-280-cam.y;
      ctx.fillStyle='rgba(240,192,64,0.15)';ctx.beginPath();ctx.arc(ix,iy,80,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#b09060';ctx.fillRect(ix-20,iy-60,40,60);
      ctx.fillStyle='#d0b070';ctx.fillRect(ix-30,iy-20,60,20);
      for(const e of this.enemies)e.draw();
      for(const c of this.cols)c.draw();for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

// ═══════════════════════════════════════════════════════════
//  LEVEL 2 — Mais inimigos no chão e nas plataformas
// ═══════════════════════════════════════════════════════════
function buildL2(){
  const FL=580,WW=3400,WH=900;
  const rocks=[],rockZones=[];
  const plats=[
    solid(0,FL,340,WH-FL),solid(420,FL,200,WH-FL),solid(700,FL,180,WH-FL),
    solid(960,FL,200,WH-FL),solid(1240,FL,220,WH-FL),solid(1540,FL,200,WH-FL),
    solid(1820,FL,240,WH-FL),solid(2140,FL,220,WH-FL),solid(2440,FL,240,WH-FL),
    solid(2760,FL,600,WH-FL),
    solid(160,FL-180,140,18),solid(380,FL-280,120,18),solid(580,FL-200,130,18),
    solid(800,FL-280,120,18),solid(1040,FL-180,140,18),solid(1280,FL-300,120,18),
    solid(1480,FL-200,140,18),solid(1720,FL-280,130,18),solid(2000,FL-200,140,18),
    solid(2240,FL-320,120,18),solid(2480,FL-220,140,18),
    movH(340,FL-36,80,340,420,2.0),movH(620,FL-36,80,620,700,2.2),
    movH(880,FL-36,80,880,960,2.0),movH(1160,FL-36,80,1160,1240,1.8),
    movH(1460,FL-36,80,1460,1540,2.2),movH(1740,FL-36,80,1740,1820,2.0),
    movH(2060,FL-36,80,2060,2140,2.2),movH(2360,FL-36,80,2360,2440,2.0),
    movH(2680,FL-36,80,2680,2760,1.8),
    trap(780,FL-60,100),trap(1360,FL-60,100),
    solid(2850,FL-320,200,WH-FL+320),
  ];
  [600,1100,1800,2300].forEach(x=>rockZones.push({x,done:false}));

  const enemies=[
    // ── Inimigos no chão ──
    new Enemy(500,FL-44,'guardian',70),
    new Enemy(780,FL-44,'snake',60),
    new Enemy(1060,FL-44,'snake',80),
    new Enemy(1360,FL-44,'guardian',70),
    new Enemy(1600,FL-44,'guardian',90),
    new Enemy(1900,FL-44,'snake',80),
    new Enemy(2200,FL-44,'snake',70),
    new Enemy(2550,FL-44,'guardian',80),
    // ── Inimigos nas plataformas ──
    new Enemy(200, FL-180-60,'guardian',45),    // plat(160,FL-180)
    new Enemy(620, FL-200-24,'snake',  50),     // plat(580,FL-200)
    new Enemy(1060,FL-180-60,'guardian',45),    // plat(1040,FL-180)
    new Enemy(1510,FL-200-60,'guardian',45),    // plat(1480,FL-200)
    new Enemy(2030,FL-200-60,'guardian',45),    // plat(2000,FL-200)
    new Enemy(2510,FL-220-24,'snake',  50),     // plat(2480,FL-220)
    new Enemy(400, FL-280-24,'snake',  45),     // plat(380,FL-280)
    new Enemy(820, FL-280-60,'guardian',45),    // plat(800,FL-280)
    new Enemy(1300,FL-300-24,'snake',  45),     // plat(1280,FL-300)
  ];
  const cols=[
    ...[80,240,480,720,960,1180,1440,1680,1960,2220,2500,2700].map(x=>new Col(x,FL-50,'gold')),
    new Col(1200,FL-60,'stone'),new Col(1880,FL-60,'stone'),new Col(2540,FL-60,'stone'),
  ];
  const triggers=[
    new Trigger(2860,FL-400,180,400,'Alinhar Constelação',(player,level)=>{
      const n=player.items.filter(i=>i==='stone').length;
      if(n<3){notify(`Colete as 3 pedras! (${n}/3)`);return;}
      player.interactAnim=90;sfx('stone');sfx('unlock');
      showDialog([
        '"Veja como estas pedras se encaixam. Nem uma lâmina de faca passa entre elas — e resistem a terremotos há 600 anos."',
        '"Os Incas dominavam a astronomia. Usavam as posições das estrelas para definir datas de plantio e colheita com precisão máxima."',
        '"A constelação do Condor marca o início do ciclo sagrado. Três estrelas, três pedras — como estão no céu, assim ficam na terra."',
        'A câmara secreta se abre com um eco profundo de pedra sobre pedra. O Tumi aguarda!'
      ],()=>{notify('✦ Constelação alinhada! Câmara aberta!');level.triggers[0].done=true;setTimeout(()=>G.nextLevel(),4000);}); // ← 4 s
    }),
  ];
  return{
    id:2,bg:'bg02',W:WW,H:WH,startX:60,startY:FL-90,
    title:'Cena II — Engenharia e Astronomia',
    hint:'Colete as 3 💎 pedras da constelação do Condor!',
    plats,enemies,cols,triggers,rocks,rockZones,
    intro:[
      '"As paredes de Machu Picchu foram construídas sem cimento. As pedras poligonais se encaixam com tanta precisão que resistem a terremotos."',
      '"Os Incas não tinham escrita, mas dominavam a geometria, a astronomia e a engenharia hidráulica."',
      'Colete as 3 pedras da Constelação do Condor e resolva o enigma!'
    ],
    update(player){
      tickMoving(this.plats);tickTrapdoors(this.plats);
      for(const rz of this.rockZones){
        if(!rz.done&&player.x>rz.x-50){rz.done=true;
          for(let i=0;i<2;i++){const e=new Enemy(rz.x+60+Math.random()*100,FL-480,'rock',0);e.w=28;e.h=28;e.vy=0;this.rocks.push(e);}}
      }
      for(let i=this.rocks.length-1;i>=0;i--){
        const r=this.rocks[i];r.vy=Math.min(r.vy+0.6,14);r.y+=r.vy;
        if(r.y>WH+50){this.rocks.splice(i,1);continue;}
        if(!player.inv&&player.overlaps(r)){player._hurt(1,this);player.vy=-6;}
        r.dead=r.y>WH;
      }
      for(const e of this.enemies)e.update(this.plats,player);
      for(const c of this.cols)c.tick();
    },
    draw(player){
      for(const rz of this.rockZones){
        if(!rz.done&&Math.abs(player.x-rz.x)<220){
          const rx=rz.x-cam.x;ctx.fillStyle='rgba(255,80,0,0.75)';ctx.font='bold 16px "Courier New"';
          ctx.textAlign='center';ctx.fillText('⚠ ROCHAS CAINDO!',rx+80,90);ctx.textAlign='left';
        }
      }
      for(const r of this.rocks){
        const rx=r.x-cam.x,ry=r.y-cam.y;
        ctx.fillStyle='#8a7060';ctx.beginPath();ctx.arc(rx+14,ry+14,14,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#6a5040';ctx.beginPath();ctx.arc(rx+9,ry+10,8,0,Math.PI*2);ctx.fill();
      }
      if(!this.triggers[0].done){
        const gx=2860-cam.x,gy=FL-280-cam.y;const sc=player.items.filter(i=>i==='stone').length;
        ctx.fillStyle='#100c08';ctx.fillRect(gx,gy,180,280);
        const stars=[[30,40],[90,25],[150,45],[55,110],[130,100],[40,170],[110,155]];
        ctx.fillStyle='#f0c040';for(const[sx,sy]of stars){ctx.beginPath();ctx.arc(gx+sx,gy+sy,4,0,Math.PI*2);ctx.fill();}
        ctx.font='bold 13px "Courier New"';ctx.fillStyle='#f0c040';ctx.textAlign='center';ctx.fillText(`${sc}/3 ⬡`,gx+90,gy-12);ctx.textAlign='left';
      }
      for(const e of this.enemies)e.draw();for(const c of this.cols)c.draw();for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

// ═══════════════════════════════════════════════════════════
//  LEVEL 3 — Água corrigida (width uniforme)
// ═══════════════════════════════════════════════════════════
function buildL3(){
  const FL=580,WW=3600,WH=900;
  const plats=[
    solid(0,FL,280,WH-FL),
    solid(380,FL,140,WH-FL),solid(620,FL,120,WH-FL),solid(840,FL,160,WH-FL),
    solid(1100,FL,140,WH-FL),solid(1360,FL,160,WH-FL),solid(1630,FL,130,WH-FL),
    solid(1870,FL,280,WH-FL),solid(2260,FL,160,WH-FL),solid(2540,FL,140,WH-FL),
    solid(2790,FL,200,WH-FL),
    solid(160,FL-180,140,18),solid(520,FL-220,110,18),solid(750,FL-180,130,18),
    solid(980,FL-240,120,18),solid(1220,FL-160,140,18),solid(1500,FL-220,130,18),
    solid(1730,FL-200,145,18),solid(2000,FL-240,140,18),solid(2380,FL-180,130,18),
    solid(2640,FL-220,110,18),
    movH(280,FL-36,100,280,380,2.0),movH(760,FL-36,100,760,860,2.0),
    movH(1000,FL-36,100,1000,1100,2.0),movH(1524,FL-36,110,1524,1630,1.8),
    movH(2150,FL-36,100,2150,2260,2.2),movH(2690,FL-36,100,2690,2790,2.0),
    movV(2870,FL-100,100,FL-220,FL-36,2.0),
    trap(1100,FL-50,110),
    // ── Águas: largura e posição agora uniformes ──
    water(280,FL,100,WH-FL), water(520,FL,100,WH-FL),
    water(740,FL,100,WH-FL),                           // ← corrigido: era 760,w=80
    water(1000,FL,100,WH-FL),water(1240,FL,120,WH-FL),
    water(1524,FL,106,WH-FL),water(1760,FL,110,WH-FL),
    water(2150,FL,110,WH-FL),water(2424,FL,116,WH-FL),
    water(2684,FL,106,WH-FL),water(2990,FL,110,WH-FL),
    // Escadaria do altar
    solid(2990,FL-80, 120,80),
    solid(3030,FL-160,110,80),
    solid(3060,FL-240,140,80),
    solid(3100,FL-300,180,18),
    solid(3200,FL-360,200,18),
    solid(3320,FL-420,360,18),
    solid(3100,FL-240,580,WH-FL+240),
  ];
  const enemies=[
    new Enemy(420,FL-44,'guardian',60),new Enemy(900,FL-44,'guardian',80),
    new Enemy(1400,FL-44,'snake',70),new Enemy(1920,FL-44,'guardian',100),
    new Enemy(2320,FL-44,'snake',80),
  ];
  const cols=[
    ...[100,200,420,660,880,1140,1400,1660,1920,2280,2560,2800].map(x=>new Col(x,FL-50,'gold')),
    new Col(3460,FL-460,'tumi'),
  ];
  const torches=[3150,3500];
  const triggers=[
    new Trigger(3400,FL-480,200,480,'Pegar o Tumi',(player,level)=>{
      if(!player.items.includes('tumi')){notify('Colete o Tumi dourado primeiro!');return;}
      player.interactAnim=90;sfx('unlock');
      showDialog([
        '"A água era sagrada para os Incas. Eles criaram sistemas de irrigação e canais que funcionam até hoje — após 600 anos."',
        '"Este é o Tumi — faca cerimonial de liga de ouro e prata, incrustada com turquesa. Usada em rituais de oferenda ao sol."',
        '"Não use a picareta aqui. Para revelar o compartimento secreto, a lanterna reflete a luz no símbolo do condor na pedra."',
        'Você segurou o Tumi dourado. A luz do altar brilha ao seu redor. Suba ao Templo do Sol!'
      ],()=>{notify('✦ Tumi encontrado! Vá ao Templo do Sol!');level.triggers[0].done=true;setTimeout(()=>G.nextLevel(),4000);}); // ← 4 s
    }),
  ];
  return{
    id:3,bg:'bg03',W:WW,H:WH,startX:60,startY:FL-90,
    title:'Cena III — A Relíquia de Ouro e Prata',
    hint:'Atravesse os canais sagrados. Suba a escadaria até o altar!',
    plats,enemies,cols,triggers,torches,
    intro:[
      '"Os canais de água dos Incas transportavam água pura das montanhas por quilômetros, sem bomba, sem motor — apenas gravidade e engenharia."',
      '"Cair nos canais é fatal. Use as plataformas móveis para atravessar. O Tumi cerimonial está no altar central."',
      'Salte sobre os canais sagrados e suba a escadaria do altar!'
    ],
    update(player){tickMoving(this.plats);tickTrapdoors(this.plats);for(const e of this.enemies)e.update(this.plats,player);for(const c of this.cols)c.tick();},
    draw(player){
      const ag=ctx.createRadialGradient(3460-cam.x,FL-460-cam.y,0,3460-cam.x,FL-460-cam.y,180);
      ag.addColorStop(0,'rgba(240,192,64,0.28)');ag.addColorStop(1,'rgba(240,192,64,0)');
      ctx.fillStyle=ag;ctx.fillRect(3280-cam.x,FL-520-cam.y,360,320);
      for(const tx of this.torches){
        const tcx=tx-cam.x,flk=Math.sin(Date.now()/80+tx)*3;
        ctx.fillStyle='#7a5010';ctx.fillRect(tcx-3,FL-200-cam.y,7,80);
        ctx.fillStyle=`rgba(255,${148+flk|0},0,0.92)`;ctx.beginPath();ctx.arc(tcx,FL-204-cam.y+flk,13+flk,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=`rgba(255,${200+flk|0},80,0.4)`;ctx.beginPath();ctx.arc(tcx,FL-220-cam.y+flk,24+flk,0,Math.PI*2);ctx.fill();
      }
      for(const e of this.enemies)e.draw();for(const c of this.cols)c.draw();for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

// ═══════════════════════════════════════════════════════════
//  LEVEL 4 — Mais adversidades; templo ajustado; moedas acessíveis
//  Condor é ALIADO: voa ao lado, não ataca
// ═══════════════════════════════════════════════════════════
function buildL4(){
  const FL=620,WW=3200,WH=900;
  const plats=[
    // Chão
    solid(0,FL,380,WH-FL),solid(460,FL,320,WH-FL),solid(870,FL,360,WH-FL),
    solid(1330,FL,380,WH-FL),solid(1810,FL,400,WH-FL),solid(2320,FL,680,WH-FL),
    // Plataformas elevadas
    solid(200,FL-140,160,18),solid(400,FL-240,140,18),solid(600,FL-180,155,18),
    solid(840,FL-260,140,18),solid(1060,FL-200,155,18),solid(1280,FL-310,130,18),
    solid(1540,FL-200,175,18),solid(1760,FL-280,150,18),solid(2050,FL-180,160,18),
    // ── Templo do Sol redesenhado: cume acessível (y=200) ──
    solid(2380,FL-80, 560,80),
    solid(2440,FL-160,500,80),
    solid(2510,FL-240,440,80),
    solid(2590,FL-300,380,18),   // step 4, topo y = FL-300 = 320
    solid(2680,FL-360,320,18),   // step 5, topo y = FL-360 = 260
    solid(2780,FL-420,260,18),   // CUME, topo y = FL-420 = 200  ← acessível
    // Plataformas móveis
    movH(440,FL-180,120,440,730,2.2),
    movH(1380,FL-150,110,1380,1680,2.0),
    movH(2240,FL-140,110,2240,2380,1.8),
    // Trapdoors
    trap(340,FL-80,110),trap(1100,FL-90,100),trap(2100,FL-80,110),
    // ── Espinhos realocados: no chão entre os gaps e em cima das plataformas ──
    // Chão
    spike(395,FL-20,50),  spike(810,FL-20,50),  spike(1250,FL-20,50),
    spike(1730,FL-20,50), spike(2250,FL-20,60),
    // Plataformas
    spike(430,FL-260,36), spike(870,FL-280,36),
    spike(1080,FL-220,36),spike(1790,FL-300,36),
  ];

  const condor=new CondorCompanion();

  // ── Mais inimigos para aumentar dificuldade ──
  const enemies=[
    new Enemy(200, FL-44,'guardian',60),
    new Enemy(680, FL-44,'snake',  70),
    new Enemy(1100,FL-44,'guardian',80),
    new Enemy(1600,FL-44,'snake',  70),
    new Enemy(2050,FL-44,'guardian',80),
    // Nas plataformas
    new Enemy(440, FL-140-60,'guardian',45),  // plat(200,FL-140)
    new Enemy(640, FL-180-24,'snake',  50),   // plat(600,FL-180)
    new Enemy(1310,FL-310-60,'guardian',40),  // plat(1280,FL-310)
    new Enemy(1790,FL-280-24,'snake',  50),   // plat(1760,FL-280)
    new Enemy(1080,FL-200-24,'snake',  45),   // plat(1060,FL-200)
    new Enemy(1560,FL-200-60,'guardian',45),  // plat(1540,FL-200)
  ];

  const cols=[
    ...[100,200,900,1100,1340,1560,1820,2060,2380,2480].map(x=>new Col(x,FL-50,'gold')),
  ];

  const condorMessages=[
    {x:600,  shown:false, text:'"Sou o mensageiro dos deuses Incas. Sigo seu caminho até o cume — vá em frente!"'},
    {x:1400, shown:false, text:'"Os Incas acreditavam que o Condor conecta o mundo dos vivos ao mundo espiritual."'},
    {x:2100, shown:false, text:'"O Templo do Sol está próximo. Os degraus foram construídos para os sacerdotes subirem ao céu."'},
    {x:2700, shown:false, text:'"Você chegou perto do cume! Use [E] no altar dourado para completar a jornada!"'},
  ];

  const triggers=[
    new Trigger(2780,FL-460,240,460,'Completar a Fase!',(player,level)=>{
      level.triggers[0].done=true;
      player.interactAnim=120;sfx('unlock');           // ← comemoração longa
      showDialog([
        '"O Condor era o mensageiro dos deuses Incas — unindo o Hanan Pacha (mundo superior) ao Kay Pacha (mundo terreno)."',
        '"Machu Picchu foi abandonada pelos Incas no século XVI, após a chegada dos colonizadores espanhóis."',
        '"A cidade permaneceu oculta por séculos, protegida pelas nuvens e pela floresta, até ser redescoberta em 1911 por Hiram Bingham."',
        'Descobertas: ✦ Lanterna do Arqueólogo ✦ Pedras da Constelação ✦ Tumi de Ouro e Turquesa',
        '🏆 FASE 1.3 CONCLUÍDA! A sabedoria do Vale Sagrado foi preservada. Próximo destino: América do Norte!'
      ],()=>{G.state='complete';});
    }),
  ];

  return{
    id:4,bg:'bg04',W:WW,H:WH,startX:60,startY:FL-90,
    title:'Cena IV — O Voo do Condor',
    hint:'Siga o Condor sagrado e escale o Templo do Sol! Use [E] no cume.',
    plats,enemies,cols,triggers,condor,condorMessages,
    intro:[
      '"O Condor sagrado aparece para guiar você ao cume. Ele não é inimigo — é o mensageiro dos Incas."',
      '"Escale os degraus do Templo do Sol. O Condor voa ao seu lado durante toda a jornada."',
      'Siga o Condor e chegue ao topo!'
    ],
    update(player){
      tickMoving(this.plats);tickTrapdoors(this.plats);
      for(const e of this.enemies)e.update(this.plats,player);
      if(!G.dialog) this.condor.update(player);
      for(const cm of this.condorMessages){
        if(!cm.shown&&player.x>cm.x&&!G.dialog){
          cm.shown=true;
          showDialog([cm.text], null, '✦ CONDOR SAGRADO');
        }
      }
      for(const c of this.cols)c.tick();
    },
    draw(player){
      const sg=ctx.createRadialGradient(3050-cam.x,-40,0,3050-cam.x,-40,600);
      sg.addColorStop(0,'rgba(255,160,0,0.14)');sg.addColorStop(1,'rgba(255,80,0,0)');
      ctx.fillStyle=sg;ctx.fillRect(0,0,W,H);
      this.condor.draw();
      for(const e of this.enemies)e.draw();
      for(const c of this.cols)c.draw();for(const t of this.triggers)t.draw(player.x,player.y);
    }
  };
}

// ═══════════════════════════════════════════════════════════
//  HUD
// ═══════════════════════════════════════════════════════════
function drawHUD(player,level){
  ctx.fillStyle='rgba(0,0,0,0.62)';ctx.fillRect(0,0,W,38);
  for(let i=0;i<player.maxHp;i++){
    ctx.fillStyle=i<player.hp?'#e02020':'#333';
    ctx.beginPath();const hx=16+i*28,hy=10;
    ctx.arc(hx+5,hy+5,5,Math.PI,0);ctx.arc(hx+15,hy+5,5,Math.PI,0);
    ctx.lineTo(hx+20,hy+5);ctx.bezierCurveTo(hx+20,hy+14,hx+10,hy+18,hx+10,hy+18);
    ctx.bezierCurveTo(hx+10,hy+18,hx,hy+14,hx,hy+5);ctx.closePath();ctx.fill();
  }
  ctx.fillStyle='rgba(240,192,64,.9)';ctx.font='13px "Courier New"';
  ctx.textAlign='center';ctx.fillText(level.title,W/2,24);ctx.textAlign='left';
  ctx.fillStyle='#f0c040';ctx.font='bold 15px "Courier New"';
  ctx.textAlign='right';ctx.fillText('⭐ '+player.score,W-14,24);ctx.textAlign='left';
  let ix=W-16;const inv=[];
  if(player.items.includes('tumi'))    inv.push('🗡 TUMI');
  if(player.items.includes('lantern')) inv.push('🔦 LANTERNA');
  const sc=player.items.filter(i=>i==='stone').length;
  if(sc>0) inv.push('💎 '+sc+'/3');
  for(const it of inv){ctx.fillStyle='#f0c040';ctx.font='12px "Courier New"';ctx.textAlign='right';ctx.fillText(it,ix,48);ctx.textAlign='left';ix-=ctx.measureText(it).width+20;}
  if(player.soroche>40){
    const pct=(player.soroche-40)/60,bW=120,bX=16,bY=44;
    ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(bX,bY,bW,12);
    ctx.fillStyle=`hsl(${30-pct*30},100%,50%)`;ctx.fillRect(bX,bY,bW*pct,12);
    ctx.strokeStyle='#f0a020';ctx.lineWidth=1;ctx.strokeRect(bX,bY,bW,12);
    ctx.fillStyle='#ffb040';ctx.font='10px "Courier New"';ctx.fillText('SOROCHE',bX+2,bY+10);
  }
  ctx.fillStyle='rgba(240,220,120,.72)';ctx.font='12px "Courier New"';
  ctx.textAlign='center';ctx.fillText(level.hint,W/2,H-10);ctx.textAlign='left';
  if(G.timeOnLevel<600){
    ctx.fillStyle='rgba(0,0,0,0.55)';ctx.fillRect(8,H-44,400,28);
    ctx.fillStyle='#aaa';ctx.font='12px "Courier New"';
    ctx.fillText('← → Mover   ↑/Espaço Pular   E Interagir   [Stomp inimigo]',14,H-25);
  }
}



function drawTitle(){
  const bg=IMG['bg01'];
  if(bg&&bg.complete&&bg.naturalWidth>0){ ctx.globalAlpha=0.55; drawBg('bg01'); ctx.globalAlpha=1; }
  else{ const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#060300');g.addColorStop(1,'#180e00');ctx.fillStyle=g;ctx.fillRect(0,0,W,H); }
  ctx.fillStyle='rgba(0,0,0,0.52)';ctx.fillRect(0,0,W,H);

  // Estrelas
  for(let i=0;i<150;i++){const sx=(i*137.5)%W,sy=(i*83.7)%380;ctx.fillStyle=`rgba(255,248,210,${.2+Math.sin(Date.now()/1100+i)*.2})`;ctx.fillRect(sx,sy,i%4===0?2:1,i%4===0?2:1);}

  if(IMG['capa']) {
    const imgSize = 250;
    ctx.drawImage(IMG['capa'], W/2 - imgSize/2, 210, imgSize, imgSize);
  }

  const condorPeriod = 14000;
  const condorT  = (Date.now() % condorPeriod) / condorPeriod;
  const condorX  = condorT * (W + 280) - 140;
  const condorY  = 160 + Math.sin(Date.now()/1100) * 30;
  const condorFr = Math.floor(Date.now()/220) % 4;
  if(SPRITES['condor']){
    drawSprite('condor', condorFr, condorX, condorY, 150, 75, false);
  }

  ctx.textAlign='center';
  ctx.shadowColor='#f0c040';ctx.shadowBlur=40;
  ctx.fillStyle='#f0c040';ctx.font='bold 48px "Courier New"';
  ctx.fillText('O TESOURO DO CONDOR',W/2,150); 
  
  ctx.shadowBlur=0;
  ctx.fillStyle='#c8a846';ctx.font='22px "Courier New"';
  ctx.fillText('Fase 1.3 — Machu Picchu, Peru',W/2,185);

  ctx.fillStyle=`rgba(240,192,64,${.55+Math.sin(Date.now()/550)*.4})`;
  ctx.font='20px "Courier New"';
  ctx.fillText('▶ Pressione ENTER para começar ◀',W/2,485);
  
  ctx.fillStyle='#888';ctx.font='14px "Courier New"';
  ctx.fillText('← → Mover   ↑/Espaço Pular   E Interagir',W/2,525);
  ctx.fillText('Soroche: não corra demais na altitude!',W/2,548);
  ctx.textAlign='left';
}

function drawDeath(){
  ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);
  ctx.textAlign='center';ctx.shadowColor='#ff2020';ctx.shadowBlur=30;
  ctx.fillStyle='#ff5050';ctx.font='bold 56px "Courier New"';ctx.fillText('VOCÊ CAIU!',W/2,H/2-50);
  ctx.shadowBlur=0;
  if(SPRITES['hurt']) drawSprite('hurt',Math.floor(Date.now()/250)%4,W/2-40,H/2-30,80,Math.round(80/172*352));
  ctx.fillStyle='#f0c040';ctx.font='20px "Courier New"';
  ctx.fillText('Pressione  R  para recomeçar',W/2,H/2+100);ctx.fillText(`Mortes: ${G.deaths}`,W/2,H/2+132);ctx.textAlign='left';
}

function drawComplete(){
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#100800');g.addColorStop(1,'#301800');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  const rg=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,500);rg.addColorStop(0,'rgba(240,192,64,.18)');rg.addColorStop(1,'rgba(240,192,64,0)');ctx.fillStyle=rg;ctx.fillRect(0,0,W,H);
  ctx.textAlign='center';ctx.shadowColor='#f0c040';ctx.shadowBlur=40;
  ctx.fillStyle='#f0c040';ctx.font='bold 46px "Courier New"';ctx.fillText('✦  FASE 1.3 CONCLUÍDA  ✦',W/2,130);
  ctx.shadowBlur=0;ctx.fillStyle='#e8d090';ctx.font='20px "Courier New"';ctx.fillText('O Tesouro do Condor foi preservado!',W/2,188);
  const lines=['✦  Faca Cerimonial Tumi — ouro, prata e turquesa','✦  Intihuatana — o relógio solar Inca revelado','✦  Constelação do Condor — geometria das estrelas','✦  Sistema de irrigação do Vale Sagrado'];
  ctx.fillStyle='#e0c878';ctx.font='16px "Courier New"';lines.forEach((l,i)=>ctx.fillText(l,W/2,250+i*30));
  ctx.fillStyle='#f0c040';ctx.font='18px "Courier New"';ctx.fillText(`Pontuação: ⭐ ${G.player?.score||0}   Mortes: ${G.deaths}`,W/2,400);
  ctx.fillStyle=`rgba(240,192,64,${.6+Math.sin(Date.now()/600)*.4})`;ctx.font='17px "Courier New"';ctx.fillText('Pressione ENTER para jogar novamente',W/2,450);
  ctx.font='64px serif';ctx.fillText('🏆',W/2-32,540);ctx.textAlign='left';
}


const LEVELS=[buildL1,buildL2,buildL3,buildL4];
const G={
  state:'title',
  lvIdx:0,level:null,player:null,
  dialog:false,
  deaths:0,timeOnLevel:0,
  _storedItems:[],_storedScore:0,

  load(idx){
    this.lvIdx=idx;particles=[];
    tileTheme=TILE_THEMES[idx+1]||TILE_THEMES[1];
    this.level=LEVELS[idx]();
    cam.x=0;cam.y=0;
    this.player=new Player(this.level.startX,this.level.startY);
    if(idx>0){this.player.items=[...this._storedItems];this.player.score=this._storedScore;}
    this.dialog=false;this.state='playing';this.timeOnLevel=0;
    BUBBLE.active=false;
    setTimeout(()=>{if(this.state==='playing') showDialog(this.level.intro,null);},900);
  },

  nextLevel(){
    this._storedItems=[...this.player.items];
    this._storedScore=this.player.score;
    if(this.lvIdx+1<LEVELS.length) this.load(this.lvIdx+1);
    else this.state='complete';
  },

  update(){
    if(this.state!=='playing') return;
    this.timeOnLevel++;
    checkDlg();
    updateCam(this.player.x,this.level.W);
    this.level.update(this.player);
    this.player.update(this.level);
    tickParticles();
    tickNotif();
    if(this.player.dead){this.deaths++;this.state='dead';}
    dlgFaceT+=0.08;
  },

  draw(){
    ctx.clearRect(0,0,W,H);
    if(this.state==='title')    {drawTitle();return;}
    if(this.state==='complete') {drawComplete();return;}

    drawBg(this.level.bg);
    for(const p of this.level.plats) drawPlatform(p);
    this.level.draw(this.player);
    drawParticles();
    this.player.draw();

    if(this.state==='dead'){drawDeath();return;}

    drawHUD(this.player,this.level);
    BUBBLE.draw(this.player);
    drawNotif();
  }
};

// ═══════════════════════════════════════════════════════════
//  LOOP
// ═══════════════════════════════════════════════════════════
function startGame(){G.load(0);G.state='title';loop();}

function loop(){
  requestAnimationFrame(loop);
  if(G.state==='title'    &&(jp['Enter']||jp['Space'])) G.load(0);
  if(G.state==='dead'     && jp['KeyR'])                G.load(G.lvIdx);
  if(G.state==='complete' && jp['Enter']){G.deaths=0;G._storedItems=[];G._storedScore=0;G.state='title';}
  G.update();
  G.draw();
  clearJP();
}

// Loading screen
if(!gameReady){
  (function loadLoop(){
    if(gameReady) return;
    requestAnimationFrame(loadLoop);
    ctx.fillStyle='#0a0600';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#f0c040';ctx.font='bold 24px "Courier New"';ctx.textAlign='center';
    ctx.fillText(`Carregando${'.'.repeat(Math.floor(Date.now()/400)%4)}  ${assetsLoaded}/${totalAssets}`,W/2,H/2);
    ctx.textAlign='left';
  })();
}
