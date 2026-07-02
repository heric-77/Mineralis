// ═══════════════════════════════════════════════════════════════
//  MINERALIS · corvan.js  —  Módulo de Sprite do Corvan
//  Canvas pixel-art puro — mesma técnica da Fase 1.1
//  API pública: CORVAN.draw(ctx, state, frame, dx, dy, dw, dh, flipX, alpha)
//               CORVAN.drawFace(ctx, faceFrame, fx, fy, fw, fh)
// ═══════════════════════════════════════════════════════════════

(function(global){
  'use strict';

  // ── Pixel-art Corvan ─────────────────────────────────────────
  // Fiel ao original da Fase 1.1 (scriptfase1-1.js)
  // Parâmetros: cx,cy = posição de origem  S = escala  flipX = espelhar
  //             frame = valor de animação contínuo  activeTool = ferramenta visível
  function _drawCorvan(ctx, cx, cy, S, flipX, frame, activeTool){
    ctx.save();
    ctx.translate(cx, cy);
    if(flipX) ctx.scale(-1, 1);

    const r = (x,y,w,h,fill,op) => {
      ctx.fillStyle = fill;
      ctx.globalAlpha = op !== undefined ? op : 1;
      ctx.fillRect(x*S, y*S, w*S, h*S);
      ctx.globalAlpha = 1;
    };

    const lb = 0.7 + Math.sin(frame * 0.4) * 0.3;

    const showPickaxe = activeTool === 'picareta' || activeTool === 'maco'
                     || activeTool === 'machado'  || activeTool === 'escopro';
    const showLantern = activeTool === 'lanterna' || activeTool === 'tocha';
    const showCoca    = activeTool === 'coca';
    const showTupu    = activeTool === 'tupu';

    // ── Chapéu ───────────────────────────────────────────────
    r(7, 3, 18, 2, '#3a2208');
    r(9, 1, 14, 4, '#4a2e10');
    // Fita dourada
    r(13, 0,  6, 3, '#c8a020');
    r(14, 0,  4, 2, '#ffe060');

    // ── Rosto ────────────────────────────────────────────────
    r(9,  5, 14, 9, '#c88050');
    r(10, 6, 12, 1, '#a86030');
    // Olhos
    r(11, 8,  3, 2, '#1a0a04');
    r(18, 8,  3, 2, '#1a0a04');
    r(12, 8,  1, 1, '#fff');
    r(19, 8,  1, 1, '#fff');
    // Nariz / boca
    r(14, 11, 4, 1, '#a86030');
    r(12, 13, 8, 1, '#7a3820');
    r(13, 14, 6, 2, '#c88050');

    // ── Camisa vermelha ───────────────────────────────────────
    r(8,  16, 16, 13, '#b82010');
    r(15, 17,  2,  1, '#8a1008');
    r(15, 20,  2,  1, '#8a1008');
    r(15, 23,  2,  1, '#8a1008');
    r(12, 16,  3,  3, '#d03018');
    r(17, 16,  3,  3, '#d03018');

    // ── Cinto ─────────────────────────────────────────────────
    r(8, 28, 16, 2, '#2a1408');
    r(14,28,  4, 2, '#c88020');

    // ── Calça ─────────────────────────────────────────────────
    r(9,  30, 14, 12, '#383838');
    r(15, 36,  2,  6, '#282828');

    // ── Braço esquerdo ────────────────────────────────────────
    r(3, 16, 5, 12, '#b82010');
    r(3, 28, 5,  3, '#a86030');

    // Ferramenta mão esquerda
    if(showPickaxe){
      const wb = Math.sin(frame * 0.2) * 1.5;
      r(0, 24+wb, 6, 1, '#7a4818');
      r(0, 25+wb, 1, 7, '#7a4818');
      r(0, 22+wb, 6, 3, '#888888');
      r(4, 20+wb, 2, 3, '#aaaaaa');
    } else if(showCoca){
      r(1, 22, 5, 10, '#b82010');
      r(1, 32, 5,  3, '#a86030');
      ctx.fillStyle = '#2a7a28'; ctx.globalAlpha = 0.9;
      ctx.beginPath(); ctx.ellipse(2.5*S, 30*S, 3*S, 5*S, -0.3, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(5*S,   28*S, 3*S, 5*S,  0.3, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
    }

    // ── Braço direito ─────────────────────────────────────────
    r(24, 16, 5, 12, '#b82010');
    r(24, 28, 5,  3, '#a86030');

    // Ferramenta mão direita
    if(showLantern){
      r(26, 31, 1, 3, '#888888');
      r(24, 34, 5, 6, '#604010');
      r(25, 35, 3, 4, '#ffe080');
      r(23, 33, 7, 8, '#ffcc00', 0.12 * lb);
    }
    if(showTupu){
      r(27, 28, 2, 6, '#9090b8');
      r(24, 26, 8, 3, '#9090b8');
      r(25, 25, 6, 2, '#c0c0d8');
      ctx.fillStyle = '#28a890'; ctx.globalAlpha = 0.95;
      ctx.beginPath(); ctx.arc(28*S, 26*S, 1.8*S, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
      const tpGlow = 0.18 + Math.sin(frame * 0.5) * 0.12;
      ctx.fillStyle = `rgba(192,200,216,${tpGlow})`;
      ctx.beginPath(); ctx.arc(28*S, 26*S, 4*S, 0, Math.PI*2); ctx.fill();
    }

    // ── Botas ─────────────────────────────────────────────────
    r(9,  42, 6, 4, '#3a1e08');
    r(17, 42, 6, 4, '#3a1e08');
    r(8,  44, 8, 2, '#2a1008');
    r(16, 44, 8, 2, '#2a1008');

    // ── Brilho no chapéu ──────────────────────────────────────
    ctx.fillStyle = '#ffe060';
    ctx.globalAlpha = 0.25 * lb;
    ctx.beginPath(); ctx.arc(16*S, 1*S, 4*S, 0, Math.PI*2); ctx.fill();
    if(showLantern){
      ctx.fillStyle = '#ffcc00'; ctx.globalAlpha = 0.18 * lb;
      ctx.beginPath(); ctx.arc(26*S, 37*S, 5*S, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // ── Pública: draw ────────────────────────────────────────────
  // state: 'idle'|'walk'|'run'|'dig'|'hurt'|'fall'|'jump'
  // frame: animation frame counter (inteiro, incrementado pelo jogo)
  // dx,dy,dw,dh: retângulo destino no ctx
  // flipX: espelhar (facing=-1)
  // alpha: transparência (0-1)
  function draw(ctx, state, frame, dx, dy, dw, dh, flipX, alpha){
    if(alpha === undefined) alpha = 1;
    if(flipX === undefined) flipX = false;

    // Calcular escala a partir da altura destino
    // O personagem base tem 46 unidades de altura (de 0 a 46)
    const S = dh / 46;

    // Centro x: o personagem é desenhado com largura ~32 units, centrado em x=16
    // Para centrar no rect destino: cx = dx + (dw/2) - 16*S
    const cx = dx + (dw / 2) - 16 * S;
    const cy = dy;

    // Calcular frame de animação contínuo
    let animFrame;
    if(state === 'walk' || state === 'run'){
      // Walk cycle: incremento por frame → valor contínuo
      animFrame = frame * 0.18;
    } else if(state === 'dig'){
      animFrame = frame * 0.22;
    } else {
      // idle / hurt / jump / fall — usa Date.now para respirar suavemente
      animFrame = Date.now() / 800;
    }

    // Ferramenta ativa baseada no estado
    const activeTool = (state === 'dig') ? 'picareta' : null;

    ctx.save();
    if(alpha !== 1) ctx.globalAlpha = alpha;
    _drawCorvan(ctx, cx, cy, S, flipX, animFrame, activeTool);

    // Hurt: flash vermelho
    if(state === 'hurt'){
      ctx.fillStyle = 'rgba(255,80,80,0.45)';
      ctx.fillRect(dx, dy, dw, dh);
    }
    ctx.restore();
  }

  // ── Pública: drawFace ─────────────────────────────────────────
  // Usada no balão de diálogo — igual à fase 1.1
  function drawFace(ctx, faceFrame, fx, fy, fw, fh){
    const faceScale = fw / 18 * 0.82;
    const sprX = fx + fw / 2 - 16 * faceScale;
    const sprY = fy + 2;
    ctx.save();
    ctx.beginPath();
    // Clip ao box do rosto
    ctx.rect(fx, fy, fw, fh);
    ctx.clip();
    _drawCorvan(ctx, sprX, sprY, faceScale, false, faceFrame * 4, null);
    // Boca animada
    const mouthY  = sprY + 13 * faceScale;
    const mouthX  = sprX + 12 * faceScale;
    const mouthW  =  8 * faceScale;
    const open = Math.abs(Math.sin(faceFrame * 4)) * 1.8 * faceScale;
    if(open > 0.5){
      ctx.fillStyle = '#2a0e06';
      ctx.fillRect(mouthX, mouthY, mouthW, open);
    }
    ctx.restore();
  }

  // ── Pública: drawLarge ─────────────────────────────────────────
  // Usado nas telas de título/morte/conclusão — escala livre
  function drawLarge(ctx, cx, cy, S, flipX, frame, activeTool){
    _drawCorvan(ctx, cx, cy, S, flipX, frame || Date.now()/300, activeTool || null);
  }

  // ── Stub load (sem SVG necessário) ───────────────────────────
  function load(basePath, cb){ if(cb) cb(); }
  function ready(){ return true; }

  // ── API ───────────────────────────────────────────────────────
  global.CORVAN = { load, draw, drawFace, drawLarge, ready };

})(window);
