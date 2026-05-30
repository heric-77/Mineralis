// ═══════════════════════════════════════════════════════════════
//  MINERALIS · corvan.js  —  Módulo de Sprite do Corvan
//  SVG sprite sheet: 680×2202 px (viewBox 0 0 680 2202)
//
//  Frame map (coords em unidades SVG):
//  IDLE  RIGHT  4f  tx=[361,403,445,487]  sy=120  sw=42  sh=85
//  IDLE  FRONT  4f  tx=[15,57,99,141]     sy=120  sw=42  sh=85
//  WALK  RIGHT  6f  tx=[11,123,235,347,459,571] sy=340 sw=112 sh=85
//  DIG   RIGHT  6f  tx=[11,123,235,347,459,571] sy=808 sw=112 sh=96
//  HURT fallback canvas
// ═══════════════════════════════════════════════════════════════

(function(global){
  'use strict';

  // ── Palette (fiel ao sprite sheet) ──────────────────────────
  const C = {
    skin:    '#C8845A', skinDk: '#A0623A', skinLt: '#E8A07A',
    shirt:   '#C03020', shirtDk:'#902010', shirtLt:'#E04030',
    pants:   '#3A3850', pantsDk:'#282840', pantsLt:'#4A4860',
    hat:     '#4A3A20', hatDk:  '#2A1A08',
    boots:   '#2A1A10', bootsDk:'#1A0E08',
    belt:    '#4A3020', beltLt: '#6A4A2A',
    lant:    '#D4A840', lantLt: '#FFE080',
    pick:    '#888898', pickH:  '#7A4A20',
    hair:    '#2A1A08',
  };

  // ── SVG natural dimensions ───────────────────────────────────
  const SHEET_W = 680, SHEET_H = 2202;

  // ── Frame definitions [sx, sy, sw, sh] ──────────────────────
  const FRAMES = {
    idle:  [[361,120,42,85],[403,120,42,85],[445,120,42,85],[487,120,42,85]],
    front: [[15, 120,42,85],[57, 120,42,85],[99, 120,42,85],[141,120,42,85]],
    walk:  [[11,340,112,85],[123,340,112,85],[235,340,112,85],[347,340,112,85],[459,340,112,85],[571,340,112,85]],
    dig:   [[11,808,112,96],[123,808,112,96],[235,808,112,96],[347,808,112,96],[459,808,112,96],[571,808,112,96]],
  };

  // ── Sprite sheet image ───────────────────────────────────────
  let sheetImg = null;
  let sheetReady = false;
  let _onLoad = null;

  function loadSheet(basePath, cb) {
    _onLoad = cb;
    // Fetch SVG and set explicit dimensions for reliable naturalWidth
    fetch(basePath + 'corvan_sprite.svg')
      .then(r => r.text())
      .then(svgText => {
        // Replace width="100%" with explicit value
        const fixed = svgText
          .replace(/width="100%"/, `width="${SHEET_W}"`)
          .replace(/height="100%"/, `height="${SHEET_H}"`);
        const blob = new Blob([fixed], {type:'image/svg+xml'});
        const url = URL.createObjectURL(blob);
        const img = new Image(SHEET_W, SHEET_H);
        img.onload = () => {
          sheetImg = img;
          sheetReady = true;
          URL.revokeObjectURL(url);
          if (_onLoad) _onLoad();
        };
        img.onerror = () => {
          console.warn('[Corvan] SVG sheet load failed — using canvas fallback');
          sheetReady = false;
          if (_onLoad) _onLoad();
        };
        img.src = url;
      })
      .catch(() => { if (_onLoad) _onLoad(); });
  }

  // ── Draw one frame from sheet ────────────────────────────────
  // state: 'idle' | 'walk' | 'dig' | 'front' | 'hurt'
  // frame: animation frame index
  // dx,dy,dw,dh: destination rect on ctx
  // flipX: mirror for left-facing
  // alpha: transparency
  function draw(ctx, state, frame, dx, dy, dw, dh, flipX, alpha) {
    if (alpha === undefined) alpha = 1;
    if (flipX === undefined) flipX = false;

    if (sheetReady && sheetImg) {
      const anim = FRAMES[state] || FRAMES.idle;
      const n = anim.length;
      const fi = Math.abs(Math.floor(frame)) % n;
      const [sx, sy, sw, sh] = anim[fi];

      ctx.save();
      ctx.globalAlpha = alpha;
      if (flipX) {
        ctx.translate(dx + dw, dy);
        ctx.scale(-1, 1);
        ctx.drawImage(sheetImg, sx, sy, sw, sh, 0, 0, dw, dh);
      } else {
        ctx.drawImage(sheetImg, sx, sy, sw, sh, dx, dy, dw, dh);
      }
      ctx.restore();
    } else {
      // ── Canvas fallback (faithful to sprite palette) ─────────
      _drawFallback(ctx, state, frame, dx, dy, dw, dh, flipX, alpha);
    }
  }

  // ── Draw face in dialog bubble ───────────────────────────────
  // Draws a small cropped face for the chat bubble
  function drawFace(ctx, faceFrame, fx, fy, fw, fh) {
    if (sheetReady && sheetImg) {
      const anim = FRAMES.front;
      const fi = Math.abs(Math.floor(faceFrame)) % anim.length;
      const [sx, sy, sw, sh] = anim[fi];
      // Show top ~55% of sprite for face area
      const showH = sh * 0.55;
      const scl = fh / showH;
      const dw = sw * scl;
      ctx.save();
      ctx.beginPath(); ctx.rect(fx, fy, fw, fh); ctx.clip();
      ctx.drawImage(sheetImg, sx, sy, sw, showH, fx + (fw - dw) / 2, fy, dw, fh);
      ctx.restore();
    } else {
      _drawFaceFallback(ctx, fx, fy, fw, fh);
    }
  }

  // ── Fallback: pixel-art Corvan drawn in canvas ───────────────
  function _drawFallback(ctx, state, frame, dx, dy, dw, dh, flipX, alpha) {
    const fi = Math.abs(Math.floor(frame));
    ctx.save();
    ctx.globalAlpha = alpha || 1;
    if (flipX) { ctx.translate(dx + dw, dy); ctx.scale(-1, 1); dx = 0; dy = 0; }
    else { ctx.translate(dx, dy); dx = 0; dy = 0; }

    const W = dw, H = dh;
    const cx = W / 2;  // center x

    // Animation offsets
    const walkBob = state === 'walk' ? Math.sin(fi * Math.PI / 3) * (H * 0.03) : 0;
    const breathe = state === 'idle' ? Math.sin(fi * Math.PI / 2) * (H * 0.01) : 0;
    const digSwing = state === 'dig' ? Math.sin(fi * Math.PI / 3) : 0;

    // Walk leg swing
    const legL = state === 'walk' ? Math.sin(fi * Math.PI / 3) * (H * 0.12) : 0;
    const legR = state === 'walk' ? -legL : 0;

    const s = H / 96; // scale unit

    // ── Hat ──────────────────────────────────────────────────
    ctx.fillStyle = C.hat;
    ctx.fillRect(cx - 10*s, 0 + breathe, 20*s, 5*s);
    ctx.fillRect(cx - 8*s, 5*s + breathe, 16*s, 8*s);
    ctx.fillStyle = C.hatDk;
    ctx.fillRect(cx - 8*s, 5*s + breathe, 16*s, 2*s);
    // Hat band
    ctx.fillStyle = C.belt;
    ctx.fillRect(cx - 8*s, 10*s + breathe, 16*s, 2*s);

    // ── Head ─────────────────────────────────────────────────
    ctx.fillStyle = C.skin;
    ctx.fillRect(cx - 6*s, 13*s + breathe, 12*s, 10*s);
    // Darker cheeks
    ctx.fillStyle = C.skinDk;
    ctx.fillRect(cx - 6*s, 15*s + breathe, 3*s, 5*s);
    // Eyes
    ctx.fillStyle = '#1A0E04';
    ctx.fillRect(cx - 4*s, 15*s + breathe, 2*s, 2*s);
    ctx.fillRect(cx + 2*s, 15*s + breathe, 2*s, 2*s);

    // ── Neck ─────────────────────────────────────────────────
    ctx.fillStyle = C.skin;
    ctx.fillRect(cx - 2*s, 23*s + breathe, 4*s, 4*s);

    // ── Shirt (torso) ─────────────────────────────────────────
    ctx.fillStyle = C.shirt;
    ctx.fillRect(cx - 9*s, 27*s + walkBob, 18*s, 20*s);
    ctx.fillStyle = C.shirtLt;
    ctx.fillRect(cx - 9*s, 27*s + walkBob, 18*s, 3*s); // collar
    ctx.fillStyle = C.shirtDk;
    ctx.fillRect(cx - 9*s, 44*s + walkBob, 18*s, 3*s); // bottom edge

    // ── Belt ─────────────────────────────────────────────────
    ctx.fillStyle = C.belt;
    ctx.fillRect(cx - 9*s, 46*s + walkBob, 18*s, 4*s);
    ctx.fillStyle = C.beltLt;
    ctx.fillRect(cx - 2*s, 47*s + walkBob, 4*s, 2*s); // buckle

    // ── Arms ─────────────────────────────────────────────────
    const armSwingL = state === 'walk' ? -legL * 0.6 : 0;
    const armSwingR = state === 'walk' ? -legR * 0.6 : 0;
    ctx.fillStyle = C.shirt;
    // Left arm
    ctx.fillRect(cx - 13*s, 28*s + walkBob + armSwingL, 5*s, 14*s);
    ctx.fillStyle = C.skin;
    ctx.fillRect(cx - 13*s, 42*s + walkBob + armSwingL, 5*s, 5*s); // hand
    // Right arm
    ctx.fillStyle = C.shirt;
    ctx.fillRect(cx + 8*s, 28*s + walkBob + armSwingR, 5*s, 14*s);
    ctx.fillStyle = C.skin;
    ctx.fillRect(cx + 8*s, 42*s + walkBob + armSwingR, 5*s, 5*s); // hand

    // Dig: right arm raises with tool
    if (state === 'dig') {
      const dAng = digSwing * 20 * s;
      ctx.fillStyle = C.shirt;
      ctx.fillRect(cx + 8*s, 28*s - dAng, 5*s, 14*s + dAng);
      ctx.fillStyle = C.skin;
      ctx.fillRect(cx + 8*s, 42*s - dAng, 5*s, 5*s);
      // Pickaxe
      ctx.fillStyle = C.pickH;
      ctx.fillRect(cx + 13*s, 22*s - dAng * 1.5, 3*s, 18*s);
      ctx.fillStyle = C.pick;
      ctx.fillRect(cx + 10*s, 19*s - dAng * 1.5, 12*s, 5*s);
    }

    // ── Pants (legs) ──────────────────────────────────────────
    ctx.fillStyle = C.pants;
    // Left leg
    ctx.fillRect(cx - 8*s, 50*s + walkBob, 8*s, 24*s + legL);
    // Right leg
    ctx.fillRect(cx, 50*s + walkBob, 8*s, 24*s + legR);
    ctx.fillStyle = C.pantsDk;
    ctx.fillRect(cx - 1*s, 50*s + walkBob, 2*s, 20*s); // center seam

    // ── Boots ────────────────────────────────────────────────
    ctx.fillStyle = C.boots;
    ctx.fillRect(cx - 9*s, 74*s + walkBob + legL, 10*s, 10*s);
    ctx.fillRect(cx - 1*s, 74*s + walkBob + legR, 10*s, 10*s);
    ctx.fillStyle = C.bootsDk;
    ctx.fillRect(cx - 9*s, 74*s + walkBob + legL, 10*s, 3*s);
    ctx.fillRect(cx - 1*s, 74*s + walkBob + legR, 10*s, 3*s);

    // ── Hurt state: lean back ─────────────────────────────────
    if (state === 'hurt') {
      ctx.fillStyle = 'rgba(255,80,80,0.45)';
      ctx.fillRect(0, 0, W, H);
    }

    ctx.restore();
  }

  function _drawFaceFallback(ctx, fx, fy, fw, fh) {
    const s = fh / 68;
    ctx.fillStyle = C.hat;
    ctx.fillRect(fx + fw*0.2, fy, fw*0.6, fh*0.15);
    ctx.fillStyle = C.skin;
    ctx.fillRect(fx + fw*0.2, fy + fh*0.15, fw*0.6, fh*0.35);
    ctx.fillStyle = '#1A0E04';
    ctx.fillRect(fx + fw*0.3, fy + fh*0.25, fw*0.1, fh*0.06);
    ctx.fillRect(fx + fw*0.6, fy + fh*0.25, fw*0.1, fh*0.06);
    ctx.fillStyle = C.shirt;
    ctx.fillRect(fx + fw*0.1, fy + fh*0.5, fw*0.8, fh*0.5);
  }

  // ── Public API ───────────────────────────────────────────────
  global.CORVAN = { load: loadSheet, draw, drawFace, ready: () => sheetReady, C };

})(window);
