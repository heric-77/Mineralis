const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const BASE_WIDTH = 1280;
const BASE_HEIGHT = 720;

const assets = {
  background: loadImage("assets/imagens/Fase 1.2 - Cena 01.png"),
  corvan: loadImage("assets/imagens/Corvan.png")
};

const world = {
  width: window.innerWidth,
  height: window.innerHeight,
  scale: 1
};

const keys = {};
const mouse = {
  x: 0,
  y: 0,
  inside: false
};

const state = {
  scene: "exploration",
  panCollected: false,
  tutorialSeen: false,
  mercuryWarned: false,
  objective: "Encontre a bateia perto da entrada da selva.",
  dialogue: [
    "Corvan: Nesta fase, a floresta e o rio ensinam junto com a coleta.",
    "Procure a bateia primeiro. Sem a ferramenta certa, o ouro aluvial passa despercebido."
  ],
  messageTimer: 0,
  popups: [],
  panning: {
    active: false,
    progress: 0,
    nuggetsFound: 0,
    cleanWaterBonus: 0.32,
    swirlAngle: 0,
    lastMouseAngle: null,
    complete: false,
    quality: "clean"
  }
};

const player = {
  x: 120,
  y: 540,
  width: 84,
  height: 128,
  speed: 3.2,
  facing: "right",
  isMoving: false,
  walkTime: 0
};

const zones = {
  river: { x: 58, y: 455, width: 1165, height: 78 },
  shallowWater: [
    { x: 58, y: 455, width: 1165, height: 19 },
    { x: 58, y: 514, width: 1165, height: 19 }
  ],
  panTool: { x: 190, y: 488, radius: 24 },
  siftZone: { x: 520, y: 455, width: 190, height: 78 },
  mercuryZone: { x: 918, y: 566, width: 115, height: 46 }
};

const collisionZones = [
  { x: 0, y: 0, width: 1280, height: 398 },
  { x: 0, y: 399, width: 62, height: 241 },
  { x: 1225, y: 399, width: 55, height: 241 },
  { x: 0, y: 626, width: 210, height: 94 },
  { x: 1085, y: 626, width: 195, height: 94 }
];

const deepWaterZones = [
  { x: 58, y: 474, width: 1165, height: 40 }
];

const foregroundElements = [
  { type: "trunk", x: 0, y: 399, width: 62, height: 241 },
  { type: "trunk", x: 1225, y: 399, width: 55, height: 241 },
  { type: "bush", x: 0, y: 626, width: 210, height: 94 },
  { type: "bush", x: 1085, y: 626, width: 195, height: 94 },
  { type: "reeds", x: 72, y: 290, width: 38, height: 160 },
  { type: "reeds", x: 1180, y: 304, width: 52, height: 146 }
];

function loadImage(src) {
  const image = new Image();
  image.src = src;
  return image;
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  world.width = canvas.width;
  world.height = canvas.height;
  world.scale = Math.min(world.width / BASE_WIDTH, world.height / BASE_HEIGHT);
  clampPlayerToScreen();
}

function sx(value) {
  return (value / BASE_WIDTH) * world.width;
}

function sy(value) {
  return (value / BASE_HEIGHT) * world.height;
}

function ss(value) {
  return value * world.scale;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distance(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}

function pointInRect(x, y, rect) {
  return x > rect.x && x < rect.x + rect.width && y > rect.y && y < rect.y + rect.height;
}

function distanceToRect(x, y, rect) {
  const nearestX = clamp(x, rect.x, rect.x + rect.width);
  const nearestY = clamp(y, rect.y, rect.y + rect.height);
  return distance(x, y, nearestX, nearestY);
}

function getRiverRect() {
  return {
    x: sx(zones.river.x),
    y: sy(zones.river.y),
    width: sx(zones.river.width),
    height: sy(zones.river.height)
  };
}

function getPanTool() {
  return {
    x: sx(zones.panTool.x),
    y: sy(zones.panTool.y),
    radius: ss(zones.panTool.radius)
  };
}

function getSiftZone() {
  return {
    x: sx(zones.siftZone.x),
    y: sy(zones.siftZone.y),
    width: sx(zones.siftZone.width),
    height: sy(zones.siftZone.height)
  };
}

function getMercuryZone() {
  return {
    x: sx(zones.mercuryZone.x),
    y: sy(zones.mercuryZone.y),
    width: sx(zones.mercuryZone.width),
    height: sy(zones.mercuryZone.height)
  };
}

function getCollisionRects() {
  return collisionZones.map((zone) => ({
    x: sx(zone.x),
    y: sy(zone.y),
    width: sx(zone.width),
    height: sy(zone.height)
  }));
}

function getDeepWaterRects() {
  return deepWaterZones.map((zone) => ({
    x: sx(zone.x),
    y: sy(zone.y),
    width: sx(zone.width),
    height: sy(zone.height)
  }));
}

function getShallowWaterRects() {
  return zones.shallowWater.map((zone) => ({
    x: sx(zone.x),
    y: sy(zone.y),
    width: sx(zone.width),
    height: sy(zone.height)
  }));
}

function clampPlayerToScreen() {
  const marginX = ss(player.width * 0.3);
  const topLimit = ss(player.height * 0.9);
  const bottomLimit = world.height - ss(player.height * 0.18);
  player.x = clamp(player.x, marginX, world.width - marginX);
  player.y = clamp(player.y, topLimit, bottomLimit);
}

function getPlayerCollider(nextX = player.x, nextY = player.y) {
  return {
    x: nextX - ss(player.width * 0.18),
    y: nextY - ss(player.height * 0.34),
    width: ss(player.width * 0.36),
    height: ss(player.height * 0.24)
  };
}

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function isBlocked(nextX, nextY) {
  const collider = getPlayerCollider(nextX, nextY);
  const blockedByGround = getCollisionRects().some((rect) => rectsOverlap(collider, rect));
  const blockedByWater = getDeepWaterRects().some((rect) => rectsOverlap(collider, rect));
  return blockedByGround || blockedByWater;
}

function movePlayer(dx, dy) {
  const nextX = player.x + dx;
  const nextY = player.y + dy;

  if (!isBlocked(nextX, player.y)) {
    player.x = nextX;
  }

  if (!isBlocked(player.x, nextY)) {
    player.y = nextY;
  }
}

function pushPopup(title, text) {
  state.popups = [{ title, text }];
}

function queueDialogue(lines) {
  state.dialogue = lines;
  state.messageTimer = 600;
}

function currentPrompt() {
  const panTool = getPanTool();
  const siftZone = getSiftZone();
  const panPickupRadius = ss(100);
  const siftPromptDistance = ss(72);

  if (!state.panCollected && distance(player.x, player.y, panTool.x, panTool.y) < panPickupRadius) {
    return "Pressione E para pegar a bateia.";
  }

  if (
    state.panCollected &&
    !state.panning.complete &&
    distanceToRect(player.x, player.y, siftZone) < siftPromptDistance
  ) {
    return "Pressione E para peneirar no banco de areia.";
  }

  return null;
}

function startPanning() {
  state.scene = "panning";
  state.panning.active = true;
  state.panning.progress = 0;
  state.panning.nuggetsFound = 0;
  state.panning.swirlAngle = 0;
  state.panning.lastMouseAngle = null;
  state.panning.complete = false;
  state.objective = "Gire a bateia em circulos para separar o ouro mais denso do sedimento.";
  queueDialogue([
    "Corvan: O ouro aluvial costuma parar no fundo do rio porque e mais denso do que areia e cascalho.",
    "Faca movimentos circulares suaves. A agua limpa ajuda voce a ver o que fica no fundo da bateia."
  ]);
}

function completePanning() {
  state.scene = "exploration";
  state.panning.active = false;
  state.panning.complete = true;
  state.objective = "Objetivo concluido: voce recuperou ouro aluvial usando a ferramenta certa.";
  queueDialogue([
    "Corvan: Boa leitura do ambiente. A mecanica mostra o conceito: agua corrente separa materiais leves, e o ouro fica retido por ser mais denso.",
    "Proximo passo da fase: seguir rio acima e investigar pistas de um artefato marajoara."
  ]);
  pushPopup(
    "Aprendizado liberado",
    "Ouro aluvial se acumula em leitos e bancos de rio. Garimpo com mercurio contamina agua, solo e seres vivos, por isso o jogo incentiva observacao e tecnicas seguras."
  );
}

function tryInteract() {
  const panTool = getPanTool();
  const siftZone = getSiftZone();
  const panPickupRadius = ss(100);
  const siftInteractDistance = ss(72);

  if (!state.panCollected && distance(player.x, player.y, panTool.x, panTool.y) < panPickupRadius) {
    state.panCollected = true;
    state.objective = "Va ate o banco de areia claro na margem do rio para testar a bateia.";
    queueDialogue([
      "Corvan: Encontramos a bateia. Agora sim faz sentido procurar ouro no banco de areia.",
      "Ferramenta correta faz parte do aprendizado: bateia para ouro aluvial, nao picareta."
    ]);
    pushPopup(
      "Ferramenta encontrada",
      "A bateia usa agua e movimento circular para separar sedimentos leves de materiais mais densos, como pequenas pepitas de ouro."
    );
    return;
  }

  if (
    state.panCollected &&
    !state.panning.complete &&
    distanceToRect(player.x, player.y, siftZone) < siftInteractDistance
  ) {
    if (state.popups.length) {
      state.popups.shift();
    }
    startPanning();
  }
}

function updateExploration() {
  let dx = 0;
  let dy = 0;

  if (keys.ArrowLeft || keys.a || keys.A) dx -= 1;
  if (keys.ArrowRight || keys.d || keys.D) dx += 1;
  if (keys.ArrowUp || keys.w || keys.W) dy -= 1;
  if (keys.ArrowDown || keys.s || keys.S) dy += 1;

  player.isMoving = dx !== 0 || dy !== 0;

  if (player.isMoving) {
    const length = Math.hypot(dx, dy) || 1;
    dx /= length;
    dy /= length;

    movePlayer(dx * ss(player.speed), dy * ss(player.speed));

    if (Math.abs(dx) > Math.abs(dy)) {
      player.facing = dx > 0 ? "right" : "left";
    }
  }

  if (player.isMoving) {
    player.walkTime += 0.18;
  } else {
    player.walkTime *= 0.82;
    if (player.walkTime < 0.01) {
      player.walkTime = 0;
    }
  }

  clampPlayerToScreen();

  const mercuryZone = getMercuryZone();
  if (pointInRect(player.x, player.y, mercuryZone) && !state.mercuryWarned) {
    state.mercuryWarned = true;
    queueDialogue([
      "Corvan: Repare nessa mancha proxima ao barranco. Ela lembra como o garimpo ilegal usa mercurio para separar ouro.",
      "Isso contamina agua, peixes e pessoas. Aqui a fase ensina coleta segura e leitura do ambiente."
    ]);
    pushPopup(
      "Alerta ambiental",
      "Mercurio pode parecer uma solucao rapida no garimpo, mas deixa um rastro toxico na cadeia alimentar e nos rios amazonicos."
    );
  }

  if (state.messageTimer > 0) {
    state.messageTimer -= 1;
  }
}

function updatePanning() {
  const centerX = world.width / 2;
  const centerY = world.height / 2 + ss(20);
  const angle = Math.atan2(mouse.y - centerY, mouse.x - centerX);

  if (state.panning.lastMouseAngle !== null && mouse.inside) {
    let delta = angle - state.panning.lastMouseAngle;
    if (delta > Math.PI) delta -= Math.PI * 2;
    if (delta < -Math.PI) delta += Math.PI * 2;

    const circularMotion = Math.abs(delta);
    if (circularMotion > 0.01 && circularMotion < 0.6) {
      state.panning.progress = clamp(state.panning.progress + circularMotion * (1 + state.panning.cleanWaterBonus), 0, 1);
      state.panning.swirlAngle += delta;
    }
  }

  state.panning.lastMouseAngle = mouse.inside ? angle : null;
  state.panning.nuggetsFound = Math.min(3, Math.floor(state.panning.progress * 3.99));

  if (state.panning.progress >= 1) {
    completePanning();
  }
}

function update() {
  if (state.scene === "exploration") {
    updateExploration();
  } else if (state.scene === "panning") {
    updatePanning();
  }
}

function drawImageCover(image, dx, dy, dWidth, dHeight) {
  if (!image.complete || !image.naturalWidth) {
    return false;
  }

  const imageRatio = image.naturalWidth / image.naturalHeight;
  const destRatio = dWidth / dHeight;
  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = image.naturalWidth;
  let sourceHeight = image.naturalHeight;

  if (imageRatio > destRatio) {
    sourceWidth = image.naturalHeight * destRatio;
    sourceX = (image.naturalWidth - sourceWidth) / 2;
  } else {
    sourceHeight = image.naturalWidth / destRatio;
    sourceY = (image.naturalHeight - sourceHeight) / 2;
  }

  ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, dx, dy, dWidth, dHeight);
  return true;
}

function drawBackground() {
  const drawn = drawImageCover(assets.background, 0, 0, world.width, world.height);
  if (!drawn) {
    const sky = ctx.createLinearGradient(0, 0, 0, world.height);
    sky.addColorStop(0, "#7bc0a8");
    sky.addColorStop(1, "#1d4235");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, world.width, world.height);
  }

  ctx.fillStyle = "rgba(7, 20, 13, 0.22)";
  ctx.fillRect(0, 0, world.width, world.height);
}

function drawWaterOverlays() {
  const river = getRiverRect();
  const shallowRects = getShallowWaterRects();

  ctx.fillStyle = "rgba(190, 227, 238, 0.12)";
  shallowRects.forEach((rect) => {
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  });

  ctx.strokeStyle = "rgba(214, 246, 242, 0.16)";
  ctx.lineWidth = ss(2);
  ctx.beginPath();
  ctx.moveTo(river.x, river.y + river.height * 0.28);
  ctx.lineTo(river.x + river.width, river.y + river.height * 0.28);
  ctx.moveTo(river.x, river.y + river.height * 0.72);
  ctx.lineTo(river.x + river.width, river.y + river.height * 0.72);
  ctx.stroke();
}

function drawPanTool() {
  if (state.panCollected) return;

  const panTool = getPanTool();
  ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
  ctx.beginPath();
  ctx.ellipse(panTool.x, panTool.y + ss(10), panTool.radius * 1.25, panTool.radius * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#6f4c2c";
  ctx.beginPath();
  ctx.ellipse(panTool.x, panTool.y, panTool.radius * 1.18, panTool.radius * 0.86, -0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#8c6239";
  ctx.beginPath();
  ctx.ellipse(panTool.x, panTool.y - ss(2), panTool.radius, panTool.radius * 0.72, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#c79d5d";
  ctx.lineWidth = ss(3);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 236, 179, 0.65)";
  ctx.lineWidth = ss(2);
  ctx.beginPath();
  ctx.arc(panTool.x + ss(6), panTool.y - ss(8), ss(8) + Math.sin(Date.now() / 260) * ss(1.4), 3.9, 5.6);
  ctx.stroke();

  ctx.fillStyle = "rgba(94, 134, 78, 0.65)";
  ctx.beginPath();
  ctx.ellipse(panTool.x - ss(20), panTool.y + ss(4), ss(10), ss(5), 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(panTool.x + ss(18), panTool.y + ss(8), ss(12), ss(5), -0.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawMercuryWarning() {
  const mercuryZone = getMercuryZone();

  ctx.fillStyle = "rgba(120, 130, 148, 0.55)";
  ctx.beginPath();
  ctx.ellipse(
    mercuryZone.x + mercuryZone.width * 0.45,
    mercuryZone.y + mercuryZone.height * 0.48,
    mercuryZone.width * 0.4,
    mercuryZone.height * 0.22,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = "rgba(169, 181, 198, 0.24)";
  ctx.beginPath();
  ctx.ellipse(
    mercuryZone.x + mercuryZone.width * 0.58,
    mercuryZone.y + mercuryZone.height * 0.44,
    mercuryZone.width * 0.24,
    mercuryZone.height * 0.12,
    -0.25,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.fillStyle = "rgba(92, 112, 124, 0.28)";
  ctx.beginPath();
  ctx.ellipse(
    mercuryZone.x + mercuryZone.width * 0.42,
    mercuryZone.y + mercuryZone.height * 0.56,
    mercuryZone.width * 0.18,
    mercuryZone.height * 0.12,
    0.16,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function drawPlayer() {
  const drawWidth = ss(player.width);
  const drawHeight = ss(player.height);
  const baseX = player.x;
  const baseY = player.y;
  const walkCycle = Math.sin(player.walkTime * 2);
  const bounce = player.isMoving ? Math.abs(walkCycle) * ss(4) : 0;
  const sway = player.isMoving ? Math.sin(player.walkTime) * 0.035 : 0;
  const squashX = player.isMoving ? 1 + Math.abs(Math.cos(player.walkTime * 2)) * 0.025 : 1;
  const squashY = player.isMoving ? 1 - Math.abs(Math.cos(player.walkTime * 2)) * 0.025 : 1;

  if (assets.corvan.complete && assets.corvan.naturalWidth) {
    ctx.save();
    ctx.translate(baseX, baseY - bounce);

    if (player.facing === "left") {
      ctx.scale(-1, 1);
    }

    ctx.rotate(sway);
    ctx.scale(squashX, squashY);
    ctx.drawImage(assets.corvan, -drawWidth / 2, -drawHeight, drawWidth, drawHeight);
    ctx.restore();
    return;
  }

  ctx.fillStyle = "#7a3d22";
  ctx.fillRect(baseX - drawWidth / 2, baseY - drawHeight, drawWidth, drawHeight);
}

function drawInteractionHints() {
  const panTool = getPanTool();
  const siftZone = getSiftZone();
  const panHintRadius = ss(135);

  if (!state.panCollected && distance(player.x, player.y, panTool.x, panTool.y) < panHintRadius) {
    ctx.strokeStyle = "rgba(255, 228, 160, 0.5)";
    ctx.lineWidth = ss(2);
    ctx.beginPath();
    ctx.arc(panTool.x, panTool.y, panTool.radius + ss(24), 0, Math.PI * 2);
    ctx.stroke();
  }

  if (state.panCollected && !state.panning.complete) {
    const nearSiftZone = pointInRect(player.x, player.y, {
      x: siftZone.x - ss(155),
      y: siftZone.y - ss(120),
      width: siftZone.width + ss(310),
      height: siftZone.height + ss(240)
    });

    if (nearSiftZone) {
      const shimmer = 0.18 + Math.sin(Date.now() / 220) * 0.06;
      ctx.fillStyle = `rgba(236, 215, 156, ${shimmer})`;
      ctx.beginPath();
      ctx.ellipse(
        siftZone.x + siftZone.width * 0.5,
        siftZone.y + siftZone.height * 0.6,
        siftZone.width * 0.52,
        siftZone.height * 0.38,
        -0.18,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }
}

function drawInteractionIcon(x, y, label) {
  const bob = Math.sin(Date.now() / 180) * ss(3);
  const boxWidth = ss(34);
  const boxHeight = ss(34);
  const drawX = x - boxWidth / 2;
  const drawY = y - boxHeight / 2 + bob;

  ctx.fillStyle = "rgba(8, 17, 13, 0.9)";
  ctx.fillRect(drawX, drawY, boxWidth, boxHeight);
  ctx.strokeStyle = "rgba(236, 215, 156, 0.75)";
  ctx.lineWidth = ss(2);
  ctx.strokeRect(drawX, drawY, boxWidth, boxHeight);

  ctx.fillStyle = "#f2ecdd";
  ctx.font = `700 ${ss(20)}px Trebuchet MS`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x, y + bob + ss(1));
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
}

function drawForegroundLayer() {
  foregroundElements.forEach((element) => {
    const x = sx(element.x);
    const y = sy(element.y);
    const width = sx(element.width);
    const height = sy(element.height);

    if (element.type === "trunk") {
      ctx.fillStyle = "rgba(81, 42, 18, 0.92)";
      ctx.fillRect(x, y, width, height);
      ctx.fillStyle = "rgba(50, 24, 11, 0.28)";
      ctx.fillRect(x + width * 0.44, y + height * 0.12, width * 0.18, height * 0.72);
    }

    if (element.type === "bush") {
      ctx.fillStyle = "#14570f";
      ctx.fillRect(x, y + height * 0.28, width, height * 0.72);
      ctx.fillStyle = "#24861a";
      ctx.fillRect(x + width * 0.12, y + height * 0.1, width * 0.5, height * 0.26);
      ctx.fillRect(x + width * 0.26, y, width * 0.24, height * 0.18);
      ctx.fillStyle = "#1b6e13";
      ctx.fillRect(x, y + height * 0.55, width * 0.72, height * 0.08);
      ctx.fillRect(x + width * 0.44, y + height * 0.42, width * 0.56, height * 0.1);
    }

    if (element.type === "reeds") {
      ctx.fillStyle = "rgba(63, 151, 41, 0.92)";
      const stemCount = 4;
      for (let i = 0; i < stemCount; i += 1) {
        const stemX = x + (width / stemCount) * i + width * 0.1;
        ctx.fillRect(stemX, y, width * 0.12, height);
      }

      ctx.fillStyle = "rgba(94, 187, 74, 0.85)";
      ctx.fillRect(x + width * 0.08, y + height * 0.45, width * 0.5, height * 0.06);
      ctx.fillRect(x + width * 0.34, y + height * 0.72, width * 0.52, height * 0.06);
    }
  });
}

function wrapText(text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let offsetY = 0;

  for (let i = 0; i < words.length; i += 1) {
    const test = `${line}${words[i]} `;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line.trim(), x, y + offsetY);
      line = `${words[i]} `;
      offsetY += lineHeight;
    } else {
      line = test;
    }
  }

  if (line) {
    ctx.fillText(line.trim(), x, y + offsetY);
  }
}

function drawHud() {
  const panelX = ss(18);
  const panelY = ss(18);
  const panelW = ss(430);
  const panelH = ss(106);
  const progressW = ss(286);
  const progressX = world.width - progressW - ss(18);

  ctx.fillStyle = "rgba(6, 20, 14, 0.48)";
  ctx.fillRect(panelX, panelY, panelW, panelH);
  ctx.strokeStyle = "rgba(214, 239, 227, 0.24)";
  ctx.lineWidth = ss(1.5);
  ctx.strokeRect(panelX, panelY, panelW, panelH);

  ctx.fillStyle = "#9fd8cb";
  ctx.font = `700 ${ss(14)}px Trebuchet MS`;
  ctx.fillText("Cena 01  Entrada da Selva", panelX + ss(18), panelY + ss(22));
  ctx.fillStyle = "#f2ecdd";
  ctx.font = `600 ${ss(17)}px Trebuchet MS`;
  wrapText(state.objective, panelX + ss(18), panelY + ss(48), panelW - ss(36), ss(21));

  ctx.fillStyle = "rgba(6, 20, 14, 0.48)";
  ctx.fillRect(progressX, panelY, progressW, ss(88));
  ctx.strokeRect(progressX, panelY, progressW, ss(96));
  ctx.fillStyle = "#e6c56f";
  ctx.font = `700 ${ss(14)}px Trebuchet MS`;
  ctx.fillText("Status da Expedicao", progressX + ss(18), panelY + ss(22));
  ctx.fillStyle = "#f2ecdd";
  ctx.font = `600 ${ss(16)}px Trebuchet MS`;
  ctx.fillText(`Bateia: ${state.panCollected ? "coletada" : "faltando"}`, progressX + ss(18), panelY + ss(47));
  ctx.fillText(`Ouro: ${state.panning.complete ? "3 pepitas separadas" : "0/3"}`, progressX + ss(18), panelY + ss(70));

  ctx.fillStyle = "rgba(242, 236, 221, 0.18)";
  ctx.fillRect(progressX + ss(18), panelY + ss(78), progressW - ss(36), ss(8));
  ctx.fillStyle = "#e1b84f";
  ctx.fillRect(
    progressX + ss(18),
    panelY + ss(78),
    (progressW - ss(36)) * ((state.panCollected ? 0.5 : 0) + (state.panning.complete ? 0.5 : 0)),
    ss(8)
  );
}

function drawDialogueBox() {
  if (!state.dialogue.length || state.messageTimer <= 0) return;

  const boxX = ss(80);
  const boxY = world.height - ss(160);
  const boxW = world.width - ss(160);
  const boxH = ss(120);

  ctx.fillStyle = "rgba(8, 17, 13, 0.82)";
  ctx.fillRect(boxX, boxY, boxW, boxH);
  ctx.strokeStyle = "rgba(226, 211, 168, 0.35)";
  ctx.strokeRect(boxX, boxY, boxW, boxH);
  ctx.fillStyle = "#f2ecdd";
  ctx.font = `600 ${ss(24)}px Trebuchet MS`;
  wrapText(state.dialogue.join(" "), boxX + ss(32), boxY + ss(43), boxW - ss(64), ss(30));
}

function drawPrompt() {
  const prompt = currentPrompt();
  if (!prompt || state.scene !== "exploration") return;

  const width = ss(440);
  const height = ss(46);
  const x = world.width / 2 - width / 2;
  const y = world.height - ss(84);

  ctx.fillStyle = "rgba(8, 17, 13, 0.85)";
  ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = "rgba(226, 211, 168, 0.35)";
  ctx.strokeRect(x, y, width, height);
  ctx.fillStyle = "#f2ecdd";
  ctx.font = `700 ${ss(20)}px Trebuchet MS`;
  ctx.textAlign = "center";
  ctx.fillText(prompt, world.width / 2, y + ss(31));
  ctx.textAlign = "start";
}

function drawPopup() {
  if (!state.popups.length) return;

  const popup = state.popups[0];
  const boxW = Math.min(ss(660), world.width - ss(100));
  const boxH = ss(180);
  const boxX = world.width / 2 - boxW / 2;
  const boxY = ss(140);

  ctx.fillStyle = "rgba(9, 18, 14, 0.94)";
  ctx.fillRect(boxX, boxY, boxW, boxH);
  ctx.strokeStyle = "rgba(226, 211, 168, 0.5)";
  ctx.strokeRect(boxX, boxY, boxW, boxH);
  ctx.fillStyle = "#e1b84f";
  ctx.font = `700 ${ss(28)}px Palatino Linotype`;
  ctx.fillText(popup.title, boxX + ss(30), boxY + ss(45));
  ctx.fillStyle = "#f2ecdd";
  ctx.font = `600 ${ss(22)}px Trebuchet MS`;
  wrapText(popup.text, boxX + ss(30), boxY + ss(85), boxW - ss(60), ss(30));
  ctx.font = `700 ${ss(18)}px Trebuchet MS`;
  ctx.fillStyle = "#9ed6c8";
  ctx.fillText("Pressione Enter para fechar", boxX + ss(30), boxY + boxH - ss(26));
}

function drawPanningScene() {
  ctx.fillStyle = "rgba(4, 12, 10, 0.9)";
  ctx.fillRect(0, 0, world.width, world.height);

  ctx.fillStyle = "#f2ecdd";
  ctx.font = `700 ${ss(32)}px Palatino Linotype`;
  ctx.fillText("Peneiramento de Ouro Aluvial", world.width / 2 - ss(260), ss(84));
  ctx.font = `600 ${ss(22)}px Trebuchet MS`;
  wrapText(
    "Gire o mouse em movimentos circulares sobre a bateia. O sedimento leve sai com a agua e o ouro, mais denso, permanece no fundo.",
    world.width / 2 - ss(420),
    ss(122),
    ss(840),
    ss(30)
  );

  const centerX = world.width / 2;
  const centerY = world.height / 2 + ss(20);
  const radius = ss(150);

  ctx.fillStyle = "#8b5f34";
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#5b4025";
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius - ss(22), 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(state.panning.swirlAngle);
  for (let i = 0; i < 8; i += 1) {
    ctx.strokeStyle = i % 2 === 0 ? "rgba(111, 185, 204, 0.75)" : "rgba(232, 218, 178, 0.55)";
    ctx.lineWidth = ss(6);
    ctx.beginPath();
    ctx.arc(0, 0, ss(48 + i * 9), i * 0.18, i * 0.18 + Math.PI / 1.6);
    ctx.stroke();
  }
  ctx.restore();

  ctx.fillStyle = "#e1b84f";
  for (let i = 0; i < state.panning.nuggetsFound; i += 1) {
    ctx.beginPath();
    ctx.arc(centerX - ss(38) + i * ss(34), centerY + ss(58) - i * ss(6), ss(8 + (i % 2)), 0, Math.PI * 2);
    ctx.fill();
  }

  const barX = ss(150);
  const barY = world.height - ss(150);
  const barW = world.width - ss(300);
  const barH = ss(86);

  ctx.fillStyle = "rgba(8, 17, 13, 0.82)";
  ctx.fillRect(barX, barY, barW, barH);
  ctx.strokeStyle = "rgba(226, 211, 168, 0.35)";
  ctx.strokeRect(barX, barY, barW, barH);
  ctx.fillStyle = "#9ed6c8";
  ctx.font = `700 ${ss(18)}px Trebuchet MS`;
  ctx.fillText("Separacao por densidade", barX + ss(30), barY + ss(30));
  ctx.fillStyle = "#f2ecdd";
  ctx.fillRect(barX + ss(30), barY + ss(46), barW - ss(60), ss(16));
  ctx.fillStyle = "#e1b84f";
  ctx.fillRect(barX + ss(30), barY + ss(46), (barW - ss(60)) * state.panning.progress, ss(16));
  ctx.font = `600 ${ss(22)}px Trebuchet MS`;
  ctx.fillStyle = "#f2ecdd";
  ctx.fillText(`Pepitas visiveis: ${state.panning.nuggetsFound}/3`, barX + ss(30), barY + ss(75));
}

function drawExplorationScene() {
  drawBackground();
  drawWaterOverlays();
  drawPanTool();
  drawMercuryWarning();
  drawInteractionHints();
  if (!state.panCollected) {
    const panTool = getPanTool();
    const iconDistance = ss(120);
    if (distance(player.x, player.y, panTool.x, panTool.y) < iconDistance) {
      drawInteractionIcon(
        panTool.x,
        panTool.y - ss(34),
        "E"
      );
    }
  }
  if (state.panCollected && !state.panning.complete) {
    const siftZone = getSiftZone();
    const iconDistance = ss(110);
    if (distanceToRect(player.x, player.y, siftZone) < iconDistance) {
      drawInteractionIcon(
        siftZone.x + siftZone.width * 0.5,
        siftZone.y - ss(22),
        "E"
      );
    }
  }
  drawPlayer();
  drawForegroundLayer();
  drawHud();
  drawPrompt();
  drawDialogueBox();
  drawPopup();
}

function draw() {
  ctx.clearRect(0, 0, world.width, world.height);

  if (state.scene === "panning") {
    drawPanningScene();
    drawDialogueBox();
    return;
  }

  drawExplorationScene();
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", (event) => {
  keys[event.key] = true;

  if (event.key.toLowerCase() === "e") {
    tryInteract();
  }

  if (event.key === "Enter" && state.popups.length) {
    state.popups.shift();
  }
});

window.addEventListener("keyup", (event) => {
  keys[event.key] = false;
});

window.addEventListener("resize", resizeCanvas);

canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  mouse.x = (event.clientX - rect.left) * scaleX;
  mouse.y = (event.clientY - rect.top) * scaleY;
  mouse.inside = true;
});

canvas.addEventListener("mouseleave", () => {
  mouse.inside = false;
});

resizeCanvas();
gameLoop();
