const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const game = {
  width: canvas.width,
  height: canvas.height,
  gravity: 0.7
};

const keys = {
  left: false,
  right: false,
  jump: false
};

const ground = {
  x: 0,
  y: 620,
  width: game.width,
  height: 100
};

const player = {
  x: 120,
  y: 200,
  width: 50,
  height: 80,
  color: "#ef4444",
  velocityX: 0,
  velocityY: 0,
  speed: 5,
  jumpForce: 15,
  onGround: false
};

function drawBackground() {
  ctx.fillStyle = "#14532d";
  ctx.fillRect(0, 0, game.width, game.height);

  ctx.fillStyle = "#166534";
  ctx.fillRect(0, 500, game.width, 120);

  ctx.fillStyle = "#0ea5e9";
  ctx.fillRect(0, 560, game.width, 60);

  ctx.fillStyle = "#15803d";
  ctx.fillRect(80, 300, 40, 220);
  ctx.fillRect(260, 260, 50, 260);
  ctx.fillRect(480, 280, 45, 240);
  ctx.fillRect(860, 250, 50, 270);
  ctx.fillRect(1100, 290, 42, 230);

  ctx.fillStyle = "#22c55e";
  ctx.beginPath();
  ctx.arc(100, 260, 80, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(285, 220, 95, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(500, 240, 85, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(885, 210, 100, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(1120, 250, 80, 0, Math.PI * 2);
  ctx.fill();
}

function drawGround() {
  ctx.fillStyle = "#6b4f2a";
  ctx.fillRect(ground.x, ground.y, ground.width, ground.height);
}

function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function updatePlayer() {
  if (keys.left) {
    player.velocityX = -player.speed;
  } else if (keys.right) {
    player.velocityX = player.speed;
  } else {
    player.velocityX = 0;
  }

  if (keys.jump && player.onGround) {
    player.velocityY = -player.jumpForce;
    player.onGround = false;
  }

  player.velocityY += game.gravity;

  player.x += player.velocityX;
  player.y += player.velocityY;

  if (player.x < 0) {
    player.x = 0;
  }

  if (player.x + player.width > game.width) {
    player.x = game.width - player.width;
  }

  if (player.y + player.height >= ground.y) {
    player.y = ground.y - player.height;
    player.velocityY = 0;
    player.onGround = true;
  }
}

function draw() {
  ctx.clearRect(0, 0, game.width, game.height);
  drawBackground();
  drawGround();
  drawPlayer();
}

function update() {
  updatePlayer();
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    keys.left = true;
  }

  if (event.key === "ArrowRight") {
    keys.right = true;
  }

  if (event.key === " " || event.code === "Space" || event.key === "ArrowUp") {
    keys.jump = true;
  }
});

window.addEventListener("keyup", (event) => {
  if (event.key === "ArrowLeft") {
    keys.left = false;
  }

  if (event.key === "ArrowRight") {
    keys.right = false;
  }

  if (event.key === " " || event.code === "Space" || event.key === "ArrowUp") {
    keys.jump = false;
  }
});

gameLoop();