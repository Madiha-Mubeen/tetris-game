 const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");

const nextCanvas = document.getElementById("next");
const nextCtx = nextCanvas.getContext("2d");

const scoreElement = document.getElementById("score");
const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const resetBtn = document.getElementById("reset");
const soundBtn = document.getElementById("sound");

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 20;

ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
nextCtx.scale(BLOCK_SIZE / 2, BLOCK_SIZE / 2);

let arena = createMatrix(COLS, ROWS);
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let paused = false;
let score = 0;

const colors = [
  null,
  "#FF0D72",
  "#0DC2FF",
  "#0DFF72",
  "#F538FF",
  "#FF8E0D",
  "#FFE138",
  "#3877FF",
];

const pieces = "TJLOSZI";

function createPiece(type) {
  switch (type) {
    case "T": return [[0,1,0],[1,1,1],[0,0,0]];
    case "O": return [[2,2],[2,2]];
    case "L": return [[0,0,3],[3,3,3],[0,0,0]];
    case "J": return [[4,0,0],[4,4,4],[0,0,0]];
    case "I": return [[0,5,0,0],[0,5,0,0],[0,5,0,0],[0,5,0,0]];
    case "S": return [[0,6,6],[6,6,0],[0,0,0]];
    case "Z": return [[7,7,0],[0,7,7],[0,0,0]];
  }
}

function drawMatrix(matrix, offset, context = ctx) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        context.fillStyle = colors[value];
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function createMatrix(w, h) {
  const matrix = [];
  while (h--) matrix.push(new Array(w).fill(0));
  return matrix;
}

function collide(arena, player) {
  const [m, o] = [player.matrix, player.pos];
  return m.some((row, y) => row.some((val, x) => val && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0));
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val) arena[y + player.pos.y][x + player.pos.x] = val;
    });
  });
}

function rotate(matrix) {
  return matrix[0].map((_, i) => matrix.map(row => row[i])).reverse();
}

function playerRotate() {
  const clone = rotate(player.matrix);
  const pos = player.pos.x;
  let offset = 1;
  while (collide(arena, { matrix: clone, pos: player.pos })) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > clone[0].length) return;
  }
  player.matrix = clone;
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    resetPlayer();
    arenaSweep();
    updateScore();
  }
  dropCounter = 0;
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) player.pos.x -= dir;
}

function arenaSweep() {
  outer: for (let y = arena.length - 1; y >= 0; y--) {
    if (arena[y].every(v => v)) {
      const row = arena.splice(y, 1)[0].fill(0);
      arena.unshift(row);
      y++;
      score += 10;
    }
  }
}

function updateScore() {
  scoreElement.innerText = score;
}

function resetPlayer() {
  player.matrix = next;
  next = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
  player.pos.y = 0;
  player.pos.x = Math.floor((COLS - player.matrix[0].length) / 2);
  if (collide(arena, player)) {
    arena = createMatrix(COLS, ROWS);
    score = 0;
    updateScore();
  }
  drawNext();
}

function drawNext() {
  nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  drawMatrix(next, { x: 0, y: 0 }, nextCtx);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMatrix(arena, { x: 0, y: 0 });
  drawMatrix(player.matrix, player.pos);
}

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  if (!paused) {
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) playerDrop();
    draw();
  }
  requestAnimationFrame(update);
}

document.addEventListener("keydown", (e) => {
  if (paused) return;
  if (e.key === "ArrowLeft") playerMove(-1);
  else if (e.key === "ArrowRight") playerMove(1);
  else if (e.key === "ArrowDown") playerDrop();
  else if (e.key === "ArrowUp") playerRotate();
});

startBtn.onclick = () => {
  paused = false;
  update();
};

pauseBtn.onclick = () => {
  paused = !paused;
};

resetBtn.onclick = () => {
  arena = createMatrix(COLS, ROWS);
  score = 0;
  updateScore();
  resetPlayer();
};

soundBtn.onclick = () => {
  alert("🔊 Sound feature coming soon!");
};

let next = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
let player = {
  pos: { x: 0, y: 0 },
  matrix: null,
};

resetPlayer();
update();
