document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-board');
    const ctx = canvas.getContext('2d');
    const nextCanvas = document.getElementById('next-piece-canvas');
    const nextCtx = nextCanvas.getContext('2d');

    const ROWS = 20;
    const COLS = 10;
    const BLOCK_SIZE = 30;
    canvas.width = COLS * BLOCK_SIZE;
    canvas.height = ROWS * BLOCK_SIZE;
    nextCanvas.width = 5 * BLOCK_SIZE;
    nextCanvas.height = 5 * BLOCK_SIZE;

    const colors = [
        null,
        "#FF0D72",
        "#0DC2FF",
        "#0DFF72",
        "#F538FF",
        "#FF8E0D",
        "#FFE138",
        "#3877FF"
    ];

    const arena = createMatrix(COLS, ROWS);

    let dropCounter = 0;
    let dropInterval = 1000;
    let lastTime = 0;
    let gameOver = false;

    const player = {
        pos: { x: 0, y: 0 },
        matrix: null,
        nextMatrix: null,
        score: 0,
        lines: 0,
        level: 1
    };

    function createMatrix(w, h) {
        const matrix = [];
        while (h--) matrix.push(new Array(w).fill(0));
        return matrix;
    }

    function createPiece(type) {
        switch (type) {
            case 'T': return [[0, 0, 0], [1, 1, 1], [0, 1, 0]];
            case 'O': return [[2, 2], [2, 2]];
            case 'L': return [[0, 3, 0], [0, 3, 0], [0, 3, 3]];
            case 'J': return [[0, 4, 0], [0, 4, 0], [4, 4, 0]];
            case 'I': return [[0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0]];
            case 'S': return [[0, 6, 6], [6, 6, 0], [0, 0, 0]];
            case 'Z': return [[7, 7, 0], [0, 7, 7], [0, 0, 0]];
        }
    }

    function drawMatrix(matrix, offset, context) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    context.fillStyle = colors[value];
                    context.fillRect((x + offset.x) * BLOCK_SIZE,
                        (y + offset.y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                    context.strokeStyle = 'black';
                    context.strokeRect((x + offset.x) * BLOCK_SIZE,
                        (y + offset.y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                }
            });
        });
    }

    function merge(arena, player) {
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    arena[y + player.pos.y][x + player.pos.x] = value;
                }
            });
        });
    }

    function collide(arena, player) {
        const [m, o] = [player.matrix, player.pos];
        for (let y = 0; y < m.length; y++) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }

    function playerReset() {
        const pieces = 'TJLOSZI';
        if (player.nextMatrix === null) {
            player.matrix = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
            player.nextMatrix = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
        } else {
            player.matrix = player.nextMatrix;
            player.nextMatrix = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
        }
        player.pos.y = 0;
        player.pos.x = (COLS / 2 | 0) - (player.matrix[0].length / 2 | 0);

        if (collide(arena, player)) {
            gameOver = true;
            document.getElementById("final-score").innerText = player.score;
            document.getElementById("game-over-popup").style.display = "block";
        }
    }

    function playerMove(dir) {
        player.pos.x += dir;
        if (collide(arena, player)) {
            player.pos.x -= dir;
        }
    }

    function playerDrop() {
        player.pos.y++;
        if (collide(arena, player)) {
            player.pos.y--;
            merge(arena, player);
            arenaSweep();
            playerReset();
            updateScore();
        }
        dropCounter = 0;
    }

    function playerRotate(dir) {
        const pos = player.pos.x;
        let offset = 1;
        rotate(player.matrix, dir);
        while (collide(arena, player)) {
            player.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > player.matrix[0].length) {
                rotate(player.matrix, -dir);
                player.pos.x = pos;
                return;
            }
        }
    }

    function rotate(matrix, dir) {
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
            }
        }
        if (dir > 0) {
            matrix.forEach(row => row.reverse());
        } else {
            matrix.reverse();
        }
    }

    function arenaSweep() {
        let rowCount = 0;
        outer: for (let y = arena.length - 1; y >= 0; --y) {
            for (let x = 0; x < arena[y].length; ++x) {
                if (arena[y][x] === 0) {
                    continue outer;
                }
            }
            const row = arena.splice(y, 1)[0].fill(0);
            arena.unshift(row);
            rowCount++;
        }

        if (rowCount > 0) {
            player.lines += rowCount;
            player.score += rowCount * 100;
            player.level = Math.floor(player.lines / 10) + 1;
            dropInterval = 1000 - (player.level - 1) * 100;
        }
    }

    function draw() {
        ctx.fillStyle = "#111";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawMatrix(arena, { x: 0, y: 0 }, ctx);
        drawMatrix(player.matrix, player.pos, ctx);

        nextCtx.fillStyle = "#222";
        nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
        drawMatrix(player.nextMatrix, { x: 1, y: 1 }, nextCtx);
    }

    function update(time = 0) {
        const deltaTime = time - lastTime;
        lastTime = time;
        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
            playerDrop();
        }
        draw();
        if (!gameOver) requestAnimationFrame(update);
    }

    function updateScore() {
        document.getElementById('score').innerText = player.score;
        document.getElementById('lines').innerText = player.lines;
        document.getElementById('level').innerText = player.level;
    }

    function hardDrop() {
        while (!collide(arena, player)) {
            player.pos.y++;
        }
        player.pos.y--;
        merge(arena, player);
        arenaSweep();
        playerReset();
        updateScore();
        dropCounter = 0;
        draw();
    }

    // Button and keyboard events
    document.getElementById("start-button").addEventListener("click", () => {
        if (gameOver) {
            gameOver = false;
            arena.forEach(row => row.fill(0));
            player.score = 0;
            player.lines = 0;
            player.level = 1;
        }
        playerReset();
        updateScore();
        update();
    });

    document.getElementById("pause-button").addEventListener("click", () => {
        gameOver = !gameOver;
        if (!gameOver) update();
    });

    document.getElementById("reset-button").addEventListener("click", () => {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        player.lines = 0;
        player.level = 1;
        player.nextMatrix = null;
        playerReset();
        updateScore();
        gameOver = false;
        update();
    });

    document.getElementById("hardrop-btn").addEventListener("click", () => {
        if (!gameOver) hardDrop();
    });

    document.getElementById("restart-button").addEventListener("click", () => {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        player.lines = 0;
        player.level = 1;
        player.nextMatrix = null;
        updateScore();
        document.getElementById("game-over-popup").style.display = "none";
        gameOver = false;
        playerReset();
        update();
    });

    document.addEventListener("keydown", (event) => {
        if (gameOver) return;
        if (event.key === "ArrowLeft") playerMove(-1);
        else if (event.key === "ArrowRight") playerMove(1);
        else if (event.key === "ArrowDown") playerDrop();
        else if (event.key === "q") playerRotate(-1);
        else if (event.key === "w") playerRotate(1);
        else if (event.key === "p") {
            gameOver = !gameOver;
            if (!gameOver) update();
        }
    });

    document.getElementById("left-btn").addEventListener("click", () => {
        if (!gameOver) playerMove(-1);
    });

    document.getElementById("right-btn").addEventListener("click", () => {
        if (!gameOver) playerMove(1);
    });

    document.getElementById("down-btn").addEventListener("click", () => {
        if (!gameOver) playerDrop();
    });

    document.getElementById("rotate-btn").addEventListener("click", () => {
        if (!gameOver) playerRotate(1);
    });

    // Start the game
    playerReset();
    updateScore();
    draw();
    update();
});