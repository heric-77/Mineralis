const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const game = {
  width: canvas.width,
  height: canvas.height,
  gravity: 0.7,
  cameraY: 0
};

const keys = { left: false, right: false, jump: false };

// ─── BLOCK SYSTEM ────────────────────────────────────────────────────────────
const BLOCK_SIZE = 32; // bigger blocks
const COLS = Math.ceil(1280 / BLOCK_SIZE);
const SURFACE_ROW = 20; // surface row index
const TOTAL_ROWS = 60;
const SURFACE_Y = SURFACE_ROW * BLOCK_SIZE; // pixel Y of surface

const BLOCK = { AIR: 0, DIRT: 1, STONE: 2, COAL: 3, IRON: 4, GOLD: 5, GEM: 6 };

const BLOCK_DEF = {
  [BLOCK.DIRT]:  { color: "#5a3d1e", dark: "#3b2712", hp: 2, name: "Terra" },
  [BLOCK.STONE]: { color: "#6b6b6b", dark: "#4a4a4a", hp: 4, name: "Pedra" },
  [BLOCK.COAL]:  { color: "#2a2a2a", dark: "#111",    hp: 3, name: "Carvão", ore: "#666" },
  [BLOCK.IRON]:  { color: "#7a6b5a", dark: "#5a4a3a", hp: 4, name: "Ferro",  ore: "#c8a882" },
  [BLOCK.GOLD]:  { color: "#7a6b40", dark: "#5a4a28", hp: 5, name: "Ouro",   ore: "#ffd700" },
  [BLOCK.GEM]:   { color: "#2a3a6a", dark: "#1a2a4a", hp: 6, name: "Gema",   ore: "#60c8ff" },
};

const ORE_TO_INV = {
  [BLOCK.DIRT]: "dirt", [BLOCK.STONE]: "stone", [BLOCK.COAL]: "coal",
  [BLOCK.IRON]: "iron", [BLOCK.GOLD]: "gold",   [BLOCK.GEM]: "gem",
};

// Generate underground grid
const grid = [];
for (let row = 0; row < TOTAL_ROWS; row++) {
  grid[row] = [];
  for (let col = 0; col < COLS; col++) {
    const d = row;
    let type;
    if (d === 0)     type = BLOCK.DIRT;
    else if (d < 5)  type = Math.random() < 0.10 ? BLOCK.COAL  : BLOCK.DIRT;
    else if (d < 15) {
      const r = Math.random();
      type = r < 0.05 ? BLOCK.COAL : r < 0.08 ? BLOCK.IRON : BLOCK.STONE;
    } else if (d < 35) {
      const r = Math.random();
      type = r < 0.04 ? BLOCK.IRON : r < 0.07 ? BLOCK.GOLD : BLOCK.STONE;
    } else {
      const r = Math.random();
      type = r < 0.03 ? BLOCK.GOLD : r < 0.06 ? BLOCK.GEM : BLOCK.STONE;
    }
    grid[row][col] = { type, hp: BLOCK_DEF[type].hp, maxHp: BLOCK_DEF[type].hp };
  }
}

function worldToRow(worldY) { return Math.floor((worldY - SURFACE_Y) / BLOCK_SIZE); }
function worldToCol(worldX) { return Math.floor(worldX / BLOCK_SIZE); }

function getSolid(wx, wy) {
  if (wy < SURFACE_Y) return false;
  const col = worldToCol(wx);
  const row = worldToRow(wy);
  if (row < 0 || row >= TOTAL_ROWS || col < 0 || col >= COLS) return false;
  return grid[row][col].type !== BLOCK.AIR;
}

// ─── PLAYER ──────────────────────────────────────────────────────────────────
const player = {
  x: 120, y: SURFACE_Y - 56,
  width: 32, height: 56,
  velocityX: 0, velocityY: 0,
  speed: 5, jumpForce: 15,
  onGround: false, facingLeft: false,
  animFrame: 0, animTimer: 0,
};

function updatePlayer() {
  if (keys.left)       { player.velocityX = -player.speed; player.facingLeft = true; }
  else if (keys.right) { player.velocityX =  player.speed; player.facingLeft = false; }
  else                   player.velocityX = 0;

  if (keys.jump && player.onGround) {
    player.velocityY = -player.jumpForce;
    player.onGround  = false;
  }

  player.velocityY += game.gravity;

  player.x += player.velocityX;
  for (let cy = 4; cy < player.height; cy += BLOCK_SIZE) {
    if (player.velocityX > 0 && getSolid(player.x + player.width, player.y + cy)) {
      player.x = Math.floor((player.x + player.width) / BLOCK_SIZE) * BLOCK_SIZE - player.width;
      player.velocityX = 0;
    }
    if (player.velocityX < 0 && getSolid(player.x, player.y + cy)) {
      player.x = Math.floor(player.x / BLOCK_SIZE) * BLOCK_SIZE + BLOCK_SIZE;
      player.velocityX = 0;
    }
  }
  player.x = Math.max(0, Math.min(game.width - player.width, player.x));

  player.y += player.velocityY;
  player.onGround = false;

  if (player.velocityY > 0) {
    const fy = player.y + player.height;
    if (getSolid(player.x + 4, fy) || getSolid(player.x + player.width - 4, fy)) {
      player.y       = Math.floor(fy / BLOCK_SIZE) * BLOCK_SIZE - player.height;
      player.velocityY = 0;
      player.onGround  = true;
    }
  } else if (player.velocityY < 0) {
    const hy = player.y;
    if (getSolid(player.x + 4, hy) || getSolid(player.x + player.width - 4, hy)) {
      player.y       = Math.floor(hy / BLOCK_SIZE) * BLOCK_SIZE + BLOCK_SIZE;
      player.velocityY = 0;
    }
  }

  // Smooth camera
  const target = Math.max(0, player.y - game.height / 2 + player.height);
  game.cameraY += (target - game.cameraY) * 0.12;

  // Walk anim
  if (player.velocityX !== 0 && player.onGround) {
    if (++player.animTimer > 6) { player.animFrame++; player.animTimer = 0; }
  } else { player.animFrame = 0; player.animTimer = 0; }
}

// ─── MINING (mouse) ──────────────────────────────────────────────────────────
const HITS_PER_BLOCK = 10;
const MAX_REACH = 4; // blocks radius the player can reach

const mining = {
  active: false,
  holding: false, // mouse button held
  col: -1, row: -1,
  timer: 0, swing: 0,
  hoverCol: -1, hoverRow: -1,
};

const inventory = { dirt: 0, stone: 0, coal: 0, iron: 0, gold: 0, gem: 0 };
let particles = [];

function screenToWorld(sx, sy) {
  return { wx: sx, wy: sy + Math.round(game.cameraY) };
}

function isInReach(col, row) {
  // Player center in world pixels
  const pcx = player.x + player.width / 2;
  const pcy = player.y + player.height / 2;

  // Block center in world pixels (row 0 = SURFACE_Y)
  const bcx = col * BLOCK_SIZE + BLOCK_SIZE / 2;
  const bcy = row * BLOCK_SIZE + SURFACE_Y + BLOCK_SIZE / 2;

  const dx = (bcx - pcx) / BLOCK_SIZE;
  const dy = (bcy - pcy) / BLOCK_SIZE;
  return Math.sqrt(dx * dx + dy * dy) <= MAX_REACH;
}

function spawnParticles(wx, wy, color) {
  for (let i = 0; i < 8; i++) {
    particles.push({
      x: wx + Math.random() * BLOCK_SIZE,
      y: wy + Math.random() * BLOCK_SIZE,
      vx: (Math.random() - 0.5) * 5,
      vy: -Math.random() * 5 - 1,
      life: 40 + Math.random() * 20,
      color, size: 3 + Math.random() * 4
    });
  }
}

function updateMining() {
  if (!mining.holding) {
    // slowly reset timer when not holding
    if (mining.timer > 0) mining.timer = Math.max(0, mining.timer - 2);
    mining.swing = 0;
    mining.active = false;
    return;
  }

  const col = mining.col;
  const row = mining.row;

  if (col < 0 || row < 0 || row >= TOTAL_ROWS || col >= COLS) { mining.active = false; return; }

  const block = grid[row][col];
  if (block.type === BLOCK.AIR) { mining.active = false; return; }

  if (!isInReach(col, row)) { mining.active = false; return; }

  mining.active = true;
  mining.timer++;
  mining.swing = Math.sin((mining.timer / HITS_PER_BLOCK) * Math.PI) * 0.9;

  // face the target
  const targetWX = col * BLOCK_SIZE + BLOCK_SIZE / 2;
  player.facingLeft = targetWX < player.x + player.width / 2;

  if (mining.timer >= HITS_PER_BLOCK) {
    mining.timer = 0;
    block.hp--;
    if (block.hp <= 0) {
      const wx = col * BLOCK_SIZE;
      const wy = row * BLOCK_SIZE + SURFACE_Y;
      spawnParticles(wx, wy, BLOCK_DEF[block.type].color);
      inventory[ORE_TO_INV[block.type]]++;
      block.type = BLOCK.AIR;
      mining.active = false;
      mining.col = -1; mining.row = -1;
    }
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy; p.vy += 0.3; p.life--;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

// Mouse events
canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  const sx = (e.clientX - rect.left) * (canvas.width / rect.width);
  const sy = (e.clientY - rect.top)  * (canvas.height / rect.height);
  const { wx, wy } = screenToWorld(sx, sy);
  mining.hoverCol = worldToCol(wx);
  mining.hoverRow = worldToRow(wy);
});

canvas.addEventListener("mousedown", e => {
  if (e.button !== 0) return;
  const rect = canvas.getBoundingClientRect();
  const sx = (e.clientX - rect.left) * (canvas.width / rect.width);
  const sy = (e.clientY - rect.top)  * (canvas.height / rect.height);
  const { wx, wy } = screenToWorld(sx, sy);
  const col = worldToCol(wx);
  const row = worldToRow(wy);

  // Reset progress if different block
  if (col !== mining.col || row !== mining.row) mining.timer = 0;

  mining.col = col;
  mining.row = row;
  mining.holding = true;
});

canvas.addEventListener("mouseup",    () => { mining.holding = false; });
canvas.addEventListener("mouseleave", () => { mining.holding = false; });

// ─── STARS ───────────────────────────────────────────────────────────────────
const stars = Array.from({ length: 80 }, () => ({
  x: Math.random() * 1280, y: Math.random() * 280,
  size: Math.random() < 0.2 ? 2 : 1, bright: Math.random() > 0.7
}));

// ─── DRAW ────────────────────────────────────────────────────────────────────
function drawBg() {
  const g = ctx.createLinearGradient(0, 0, 0, 500);
  g.addColorStop(0, "#0a0e2a"); g.addColorStop(0.5, "#121838"); g.addColorStop(1, "#1a2248");
  ctx.fillStyle = g; ctx.fillRect(0, 0, game.width, 500);

  for (const s of stars) {
    if (s.bright) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(s.x, s.y, s.size + 1, 1);
      ctx.fillRect(s.x + (s.size > 1 ? 1 : 0), s.y - 1, 1, s.size + 1);
    } else {
      ctx.fillStyle = s.size === 2 ? "#cce0ff" : "#8aabdd";
      ctx.fillRect(s.x, s.y, s.size, s.size);
    }
  }

  ctx.fillStyle = "#e8d87a";
  ctx.beginPath(); ctx.arc(1200, 50, 38, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#121838";
  ctx.beginPath(); ctx.arc(1186, 44, 32, 0, Math.PI * 2); ctx.fill();

  const farMtns = [{x:0,w:280,h:180},{x:220,w:320,h:220},{x:490,w:280,h:190},{x:720,w:340,h:210},{x:1000,w:310,h:185}];
  farMtns.forEach(m => drawMtn(m.x, 480, m.w, m.h, "#1e2d5a", "#2a3f7a"));
  [[0,350,260],[280,420,300],[650,380,280],[950,350,260],[1150,280,240]].forEach(([x,w,h]) =>
    drawMtn(x, 540, w, h, "#3d2b1a", "#4a3420"));
  [[175,280,60,20],[490,240,70,22],[840,260,65,20]].forEach(([px,py,w,h]) => drawSnow(px,py,w,h));

  ctx.fillStyle = "#1a3a4a"; ctx.fillRect(0, 490, game.width, 30);
  ctx.fillStyle = "#1e4455"; ctx.fillRect(0, 495, game.width, 10);
}

function drawMtn(baseX, baseY, width, height, dark, light) {
  const peakX = baseX + width / 2, peakY = baseY - height;
  for (let r = 0; r < height; r++) {
    const p = r / height, rw = Math.round(width * p);
    ctx.fillStyle = p < 0.15 ? light : dark;
    ctx.fillRect(Math.round(peakX - rw / 2), Math.round(peakY + r), rw, 2);
  }
}
function drawSnow(peakX, peakY, width, height) {
  for (let r = 0; r < height; r++) {
    const rw = Math.round(width * r / height);
    ctx.fillStyle = "#b8d4f0";
    ctx.fillRect(Math.round(peakX - rw / 2), Math.round(peakY + r), rw, 1);
  }
}

function drawSurface(camY) {
  const sy = SURFACE_Y - camY;
  ctx.fillStyle = "#3b2712"; ctx.fillRect(0, sy, game.width, BLOCK_SIZE);
  ctx.fillStyle = "#4e3318"; ctx.fillRect(0, sy, game.width, 6);
  ctx.fillStyle = "#5a3d1e"; ctx.fillRect(0, sy + 6, game.width, 4);
  ctx.fillStyle = "#2e1e0e";
  for (let i = 0; i < game.width; i += 80) {
    ctx.fillRect(i + 10, sy + 14, 40, 8);
    ctx.fillRect(i + 50, sy + 24, 25, 5);
  }
  [200, 370, 540, 680, 820, 1000, 1150].forEach(px => {
    ctx.fillStyle = "#2d6a2a";
    ctx.fillRect(px, sy - 8, 4, 14);
    ctx.fillRect(px - 6, sy - 2, 16, 4);
  });
}

// Returns the background color for an air block based on surrounding blocks
function getAirBgColor(row, col) {
  // Sample neighbors to find the dominant block type nearby
  const neighbors = [
    [row-1, col], [row+1, col], [row, col-1], [row, col+1],
    [row-1, col-1], [row-1, col+1], [row+1, col-1], [row+1, col+1]
  ];
  for (const [r, c] of neighbors) {
    if (r >= 0 && r < TOTAL_ROWS && c >= 0 && c < COLS) {
      const b = grid[r][c];
      if (b.type !== BLOCK.AIR) {
        // Return a very dark version of that block's color
        return BLOCK_DEF[b.type].dark;
      }
    }
  }
  // Deep default - very dark brown/grey
  return row < 5 ? "#1a0e06" : row < 20 ? "#111" : "#0a0a0a";
}

function drawUnderground(camY) {
  const startRow = Math.max(0, Math.floor(camY / BLOCK_SIZE) - 1);
  const endRow   = Math.min(TOTAL_ROWS - 1, Math.ceil((camY + game.height) / BLOCK_SIZE));

  // First pass: fill AIR blocks with dark background color
  for (let row = startRow; row <= endRow; row++) {
    for (let col = 0; col < COLS; col++) {
      const block = grid[row][col];
      if (block.type !== BLOCK.AIR) continue;
      const wx = col * BLOCK_SIZE;
      const wy = row * BLOCK_SIZE + SURFACE_Y - camY;
      ctx.fillStyle = getAirBgColor(row, col);
      ctx.fillRect(wx, wy, BLOCK_SIZE, BLOCK_SIZE);
    }
  }

  // Second pass: draw solid blocks on top
  for (let row = startRow; row <= endRow; row++) {
    for (let col = 0; col < COLS; col++) {
      const block = grid[row][col];
      if (block.type === BLOCK.AIR) continue;

      const def = BLOCK_DEF[block.type];
      const wx = col * BLOCK_SIZE;
      const wy = row * BLOCK_SIZE + SURFACE_Y - camY;

      // Base
      ctx.fillStyle = def.color;
      ctx.fillRect(wx, wy, BLOCK_SIZE, BLOCK_SIZE);

      // Shading edges
      ctx.fillStyle = def.dark;
      ctx.fillRect(wx, wy + BLOCK_SIZE - 3, BLOCK_SIZE, 3);
      ctx.fillRect(wx + BLOCK_SIZE - 3, wy, 3, BLOCK_SIZE);
      // Highlight top/left
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fillRect(wx, wy, BLOCK_SIZE, 2);
      ctx.fillRect(wx, wy, 2, BLOCK_SIZE);

      // Ore vein
      if (def.ore) {
        ctx.fillStyle = def.ore;
        ctx.fillRect(wx + 8,  wy + 8,  6, 6);
        ctx.fillRect(wx + 18, wy + 14, 5, 5);
        ctx.fillRect(wx + 6,  wy + 18, 4, 4);
      }

      // Damage cracks
      const ratio = block.hp / block.maxHp;
      if (ratio < 1) {
        ctx.fillStyle = ratio < 0.34 ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.25)";
        ctx.fillRect(wx, wy, BLOCK_SIZE, BLOCK_SIZE);
        ctx.strokeStyle = "rgba(0,0,0,0.7)";
        ctx.lineWidth = 1;
        if (ratio < 0.67) {
          ctx.beginPath(); ctx.moveTo(wx+6, wy+4); ctx.lineTo(wx+10, wy+14); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(wx+14, wy+6); ctx.lineTo(wx+18, wy+20); ctx.stroke();
        }
        if (ratio < 0.34) {
          ctx.beginPath(); ctx.moveTo(wx+4, wy+18); ctx.lineTo(wx+22, wy+22); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(wx+20, wy+4); ctx.lineTo(wx+24, wy+28); ctx.stroke();
        }
      }

      // Mining target highlight
      const isMiningThis = mining.active && mining.row === row && mining.col === col;
      if (isMiningThis) {
        // Pulsing white border
        const pulse = 0.15 + 0.1 * Math.sin(Date.now() / 80);
        ctx.fillStyle = `rgba(255,255,255,${pulse})`;
        ctx.fillRect(wx, wy, BLOCK_SIZE, BLOCK_SIZE);

        // Progress bar at bottom of block
        const prog = mining.timer / HITS_PER_BLOCK;
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(wx, wy + BLOCK_SIZE - 5, BLOCK_SIZE, 5);
        ctx.fillStyle = "#ffcc00";
        ctx.fillRect(wx, wy + BLOCK_SIZE - 5, Math.round(BLOCK_SIZE * prog), 5);
      }
    }
  }

  // Hover highlight (block under mouse)
  const hr = mining.hoverRow, hc = mining.hoverCol;
  if (hr >= 0 && hr < TOTAL_ROWS && hc >= 0 && hc < COLS) {
    const hBlock = grid[hr][hc];
    if (hBlock.type !== BLOCK.AIR && isInReach(hc, hr)) {
      const hwx = hc * BLOCK_SIZE;
      const hwy = hr * BLOCK_SIZE + SURFACE_Y - camY;
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 2;
      ctx.strokeRect(hwx + 1, hwy + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
    }
  }
}

function drawParticles(camY) {
  for (const p of particles) {
    ctx.globalAlpha = Math.min(1, p.life / 40);
    ctx.fillStyle = p.color;
    ctx.fillRect(Math.round(p.x), Math.round(p.y - camY), Math.round(p.size), Math.round(p.size));
  }
  ctx.globalAlpha = 1;
}

function drawDungeon(camY) {
  const dx = 540, dy = 320 - camY, dw = 200, dh = 280;
  if (dy + dh < 0 || dy > game.height) return;
  const sc = ["#7a6548","#8a7358","#6e5a40","#9a8368"];
  for (let r = 0; r < 14; r++) for (let c = 0; c < 10; c++) {
    const bx = dx + c * 20, by = dy + r * 20;
    ctx.fillStyle = sc[(r + c) % sc.length]; ctx.fillRect(bx, by, 19, 19);
    ctx.fillStyle = "#5a4830"; ctx.fillRect(bx, by, 19, 1); ctx.fillRect(bx, by, 1, 19);
  }
  ctx.fillStyle = "#0a0808";
  ctx.fillRect(dx+30, dy+10,  dw-60, 55);
  ctx.fillRect(dx+30, dy+75,  dw-60, 55);
  ctx.fillRect(dx+30, dy+140, dw-60, 130);
  ctx.fillRect(dx+50, dy,     dw-100, 15);
  ctx.fillRect(dx+40, dy+5,   dw-80, 10);
  ctx.fillStyle = "#5c3d1e";
  ctx.fillRect(dx+20, dy+65,  dw-40, 12);
  ctx.fillRect(dx+20, dy+130, dw-40, 12);
  ctx.fillStyle = "#7a5230"; ctx.fillRect(dx+20, dy+66, dw-40, 4);
  drawTorch(dx+22, dy+90); drawTorch(dx+dw-30, dy+90);
  ctx.fillStyle = "#7a5230";
  for (let fi = 0; fi < 8; fi++) ctx.fillRect(dx+30+fi*20, dy+dh-40, 8, 38);
  ctx.fillRect(dx+25, dy+dh-42, dw-50, 6);
}

function drawTorch(x, y) {
  ctx.fillStyle = "#8b5e2e"; ctx.fillRect(x, y, 6, 16);
  const fl = Math.sin(Date.now() / 80) * 2;
  const g = ctx.createRadialGradient(x+3, y-4+fl, 1, x+3, y, 16);
  g.addColorStop(0, "rgba(255,180,40,0.7)");
  g.addColorStop(0.5, "rgba(255,100,10,0.3)");
  g.addColorStop(1, "rgba(255,60,0,0)");
  ctx.fillStyle = g; ctx.fillRect(x-12, y-18, 30, 30);
  ctx.fillStyle = "#ffd060"; ctx.fillRect(x+1, y-10+fl, 4, 8);
  ctx.fillStyle = "#ff8c00"; ctx.fillRect(x, y-6+fl, 6, 6);
  ctx.fillStyle = "#fff0a0"; ctx.fillRect(x+2, y-12+fl, 2, 4);
}

function drawPlayer(camY) {
  const px = Math.round(player.x), py = Math.round(player.y - camY);
  const flip = player.facingLeft;

  ctx.save();
  if (flip) { ctx.translate(px + player.width, 0); ctx.scale(-1, 1); ctx.translate(-px, 0); }

  // Pickaxe swing when mining
  if (mining.active || mining.holding) {
    ctx.save();
    ctx.translate(px + 28, py + 28);
    ctx.rotate((mining.swing || 0) - 0.5);
    ctx.fillStyle = "#8b5e2e"; ctx.fillRect(-2, -18, 4, 22);
    ctx.fillStyle = "#a0a0b0"; ctx.fillRect(-8, -22, 16, 6);
    ctx.fillStyle = "#c8c8d8"; ctx.fillRect(-8, -22, 16, 2);
    ctx.fillStyle = "#808090";
    ctx.fillRect(-10, -18, 4, 4);
    ctx.fillRect( 6,  -18, 4, 4);
    ctx.restore();
  }

  // Cape
  ctx.fillStyle = "#1a1a2e"; ctx.fillRect(px+6, py+18, 20, 30);
  // Body
  ctx.fillStyle = "#1c1c1c"; ctx.fillRect(px+8, py+18, 16, 22);
  // Belt
  ctx.fillStyle = "#5a3d1e"; ctx.fillRect(px+7, py+36, 18, 4);
  ctx.fillStyle = "#c8a040"; ctx.fillRect(px+14, py+36, 4, 4);

  // Legs
  const lo = player.onGround && player.velocityX !== 0
    ? (Math.floor(player.animFrame / 4) % 2 === 0 ? 3 : -3) : 0;
  ctx.fillStyle = "#2a2a3a";
  ctx.fillRect(px+8,  py+40, 7, 16 + lo);
  ctx.fillRect(px+17, py+40, 7, 16 - lo);
  // Boots
  ctx.fillStyle = "#3d2b1a";
  ctx.fillRect(px+6,  py+54 + lo, 10, 6);
  ctx.fillRect(px+16, py+54 - lo, 10, 6);

  // Arms
  ctx.fillStyle = "#1c1c1c";
  ctx.fillRect(px+3,  py+20, 6, 14);
  ctx.fillRect(px+23, py+20, 6, 14);
  // Hands
  ctx.fillStyle = "#c8a07a";
  ctx.fillRect(px+3,  py+32, 6, 6);
  ctx.fillRect(px+23, py+32, 6, 6);

  // Bag
  ctx.fillStyle = "#7a5230"; ctx.fillRect(px+24, py+28, 10, 14);
  ctx.fillStyle = "#5a3d1e"; ctx.fillRect(px+24, py+28, 10, 3);

  // Head
  ctx.fillStyle = "#c8a07a"; ctx.fillRect(px+9, py+6, 14, 14);
  // Hat brim & top
  ctx.fillStyle = "#111";
  ctx.fillRect(px+5, py+2, 22, 4);
  ctx.fillRect(px+9, py-4, 14, 8);
  // Hat band
  ctx.fillStyle = "#8b6914"; ctx.fillRect(px+9, py+2, 14, 2);
  // Eyes
  ctx.fillStyle = "#fff";
  ctx.fillRect(px+11, py+11, 3, 3);
  ctx.fillRect(px+18, py+11, 3, 3);
  ctx.fillStyle = "#000";
  ctx.fillRect(px+12, py+12, 2, 2);
  ctx.fillRect(px+19, py+12, 2, 2);

  ctx.restore();
}

function drawReachIndicator(camY) {
  // Show reach radius as faint dotted circle around player
  const cx = player.x + player.width / 2;
  const cy = player.y + player.height / 2 - camY;
  const radius = MAX_REACH * BLOCK_SIZE;

  ctx.save();
  ctx.setLineDash([4, 6]);
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawHUD() {
  const depth = Math.max(0, worldToRow(player.y + player.height)) * 2;

  // Depth
  ctx.fillStyle = "rgba(0,0,0,0.65)";
  ctx.fillRect(10, 10, 230, 36);
  ctx.fillStyle = "#c8d8ff";
  ctx.font = "bold 14px monospace";
  ctx.fillText(`⛏  Profundidade: ${depth}m`, 18, 33);

  // Inventory
  const items = [
    { key:"dirt",  label:"Terra",  color:"#5a3d1e" },
    { key:"stone", label:"Pedra",  color:"#888" },
    { key:"coal",  label:"Carvão", color:"#aaa" },
    { key:"iron",  label:"Ferro",  color:"#c8a882" },
    { key:"gold",  label:"Ouro",   color:"#ffd700" },
    { key:"gem",   label:"Gema",   color:"#60c8ff" },
  ];
  ctx.fillStyle = "rgba(0,0,0,0.65)";
  ctx.fillRect(10, 54, 165, items.length * 22 + 10);
  items.forEach((item, i) => {
    const y = 70 + i * 22;
    ctx.fillStyle = item.color;
    ctx.fillRect(18, y - 10, 12, 12);
    ctx.fillStyle = inventory[item.key] > 0 ? "#f8fafc" : "#556";
    ctx.font = "13px monospace";
    ctx.fillText(`${item.label}: ${inventory[item.key]}`, 36, y);
  });

  // Mining popup
  if (mining.active) {
    const block = grid[mining.row]?.[mining.col];
    if (block && block.type !== BLOCK.AIR) {
      ctx.fillStyle = "rgba(0,0,0,0.75)";
      ctx.fillRect(game.width / 2 - 100, game.height - 68, 200, 32);
      ctx.fillStyle = "#ffd060";
      ctx.font = "bold 14px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${BLOCK_DEF[block.type].name} — ${block.hp} golpe(s)`, game.width / 2, game.height - 47);
      ctx.textAlign = "left";
    }
  }

  // Controls bar
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(0, game.height - 30, game.width, 30);
  ctx.fillStyle = "#8899aa";
  ctx.font = "12px monospace";
  ctx.fillText("← → Mover   ↑/Espaço Pular   Clique Segurar para Minerar", 16, game.height - 11);
}

// ─── MAIN LOOP ───────────────────────────────────────────────────────────────
function draw() {
  const camY = Math.round(game.cameraY);
  ctx.clearRect(0, 0, game.width, game.height);

  if (camY < game.height) drawBg();

  // Base dark fill for underground screen area (so unexcavated-but-off-grid areas look dark)
  if (camY > 0) {
    const underStart = Math.max(0, SURFACE_Y - camY + BLOCK_SIZE);
    ctx.fillStyle = "#100b06";
    ctx.fillRect(0, underStart, game.width, game.height - underStart);
  }

  drawUnderground(camY);
  drawSurface(camY);
  drawDungeon(camY);
  drawParticles(camY);
  drawReachIndicator(camY);
  drawPlayer(camY);
  drawHUD();
}

function gameLoop() {
  updatePlayer();
  updateMining();
  updateParticles();
  draw();
  requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft")  keys.left  = true;
  if (e.key === "ArrowRight") keys.right = true;
  if (e.key === " " || e.code === "Space" || e.key === "ArrowUp") keys.jump = true;
  if (["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"," "].includes(e.key)) e.preventDefault();
});
window.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft")  keys.left  = false;
  if (e.key === "ArrowRight") keys.right = false;
  if (e.key === " " || e.code === "Space" || e.key === "ArrowUp") keys.jump = false;
});

gameLoop();