document.addEventListener('DOMContentLoaded', () => {
   const grid = document.querySelector('#grid');
   const width = 10;
   const height = 20;
   const squares = Array.from(Array(width * height), (_, i) => {
        const div = document.createElement('div');
        grid.appendChild(div);
        return div;
   });

   //Add bottom border to detect when Ttromino hits the bottom 
   for (let i = 0; i < width; i++) {
    const bottomSquare = document.createElement('div');
    bottomSquare.classList.add('taken');
    grid.appendChild(bottomSquare);
   }

   //Tetrominoes definitions
   const lTetromino = [
    [1, width+1, width*2+1, 2],
    [width, width+1, width+2, width*2+2],
    [1, width+1, width*2+1, width*2],
    [width, width*2, width*2+1, width*2+2]
   ];

   const zTetromino = [
    [0, width, width+1, width*2+1],
    [width+1, width+2, width*2, width*2+1],
    [0, width, width+1, width*2+1],
    [width+1, width+2, width*2, width*2+1]
   ];

   const tTetromino = [
    [1, width, width+1, width+2],
    [1, width+1, width+2, width*2+1],
    [width, width+1, width+2, width*2+1],
    [1, width, width+1, width*2+1]
   ];

   const oTetromino = [
    [0, 1, width, width+1],
    [0, 1, width, width+1],
    [0, 1, width, width+1],
    [0, 1, width, width+1]
   ];

   const iTetromino = [
    [1, width+1, width*2+1, width*3+1],
    [width, width+1, width+2, width+3],
    [1, width+1, width*2+1, width*3+1],
    [width, width+1, width+2, width+3]
   ];

   const sTetromino = [
    [1, 2, width, width+1],
    [0, width, width+1, width*2+1],
    [1, 2, width, width+1],
    [0, width, width+1, width*2+1]
   ];

   const jTetrominoes = [
    [1, width+1, width*2+1, width*2],
    [width, width+1, width+2, width*2+2],
    [1, width+1, width*2+1, 2],
    [width, width+1, width+2, 0]
   ];

   const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino, sTetromino, jTetromino];

   let currentPosition = 4; //starting position of Tetromino
   let currentRotation = 0; //Starting rotation of Tetromino

   //Random Tetromino 
   let random = Math.floor(Math.random() * theTetrominoes.length);
   let current = theTetrominoes[random][currentRotation];

   //Draw the Tetromino
   const draw = () => {
    current.forEach(index => {
        squares[currentPosition + index].classList.add('tetromino');   
    });
   }

   //Undraw the Tetromino 
   const undraw = () => {
    current.forEach(index => {
        squares[currentPosition + index].classList.remove('tetromino');
    });
   }

   

   
   startButton.addEventListener('click', () => {
    if (timerId) return; //Prevents multiple intervals
    timerId = setInterval(moveDown, 1000);
   })

   //Move down every second
   const moveDown = () => {
    undraw();
    currentPosition += width;
    draw();
    freeze();
   }

   //Freeze Tetromino when it hits the bottom or another Tetromino
   const freeze = () => {
    if (
        current.some(index => 
            squares[currentPosition + index + width].classList.contains('taken')
        )
    ) {
        current.forEach(index => 
            squares[currentPosition + index].classList.add('taken')
        );
        //Start a new Tetromino
        random = nextRandom;
        nextRandom = Math.floor(Math.random() * theTetrominoes.length);
        current = theTetrominoes[random][currentRotation];
        currentPosition = 4; //Reset position
        draw();
        displayNext();
        addScore();
        gameOver();
    }
   };
    
   const moveLeft = () => {
    undraw();
    const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);
    if (!isAtLeftEdge && !current.some(index => squares[currentPosition + index - 1].classList.contains('taken'))) {
        currentPosition -= 1;
    }
    draw();
   };

   const moveRight = () => {
    undraw();
    const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1);
    if (!isAtRightEdge && !current.some(index => squares[curtentPosition + index + 1].classList.contains('taken'))) {
        currentPosition += 1;
    }
    draw();
   };

   const rotate = () => {
    undraw();
    currentRotation++;
    if (currentRotation ===  theTetrominoes[random].length) currentRotation = 0;
        currentRotation = theTetrominoes[random][currentRotation];
        draw();
   };

   const control = (e) => {
    if (e.key === 'ArrowLeft') moveLeft();
    else if (e.key === 'ArrowRight') moveRight();
    else if (e.key === 'ArrowDown') moveDown();
    else if (e.key === 'ArrowUp') rotate();
   };
   document.addEventListener('keydown', control);

   //Timer
   let timerId;
   const startButton = document.getElementById('start-button');
   const pauseButton = document.getElementById('pause-button');
   const resetButton = document.getElementById('reset-button');
   let score = 0;

   startButton.addEventListener('click', () => {
    if (!timerId) {
        draw();
        timerId = setInterval(moveDown, 800);
        displayNext();
    }
   });

   pauseButton.addEventListener('click', () => {
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
    }
   });

   resetButton.addEventListener('click', () => {
    clearInterval(timerId);
    timerId = null;
    squares.forEach(sq => {
        sq,classList.remove('tetromino', 'taken');
    });
    currentPosition = 4;
    score = 0;
    scoreDisplay.textContent = score;
    random = Math.floor(Math.random() * theTetrominoes.length);
    currentRotation = 0;
    current = theTetrominoes[random][currentRotation];
    draw();
   });

   //Show next tetromino
   const displaySquares = document.querySelectorAll('#next-piece div');
   const displayWidth = 4;
   const upNextTetrominoes = [
    [1, displayWidth+1, displayWidth*2+1, 2],   //L
    [0, displayWidth, displayWidth+1, displayWidth*2+1],    //Z
    [1, displayWidth, displayWidth+1, displayWidth+2],   //T
    [0, 1, displayWidth, displayWidth+1],   //O
    [1, displayWidth+1, displayWidth*2+1, displayWidth*3+1],   //I
    [1, 2, displayWidth, displayWidth+1],   //S
    [1, displayWidth+1, displayWidth*2+1, displayWidth*2]    //J
   ];

   let nextRandom = Math.floor(Math.random() * theTetrominoes.length);
   

   const displayNext = () => {
    displaySquares.forEach(squares => squares.classList.remove('tetromin'));
    upNextTetrominoes[nextRandom].forEach(index => {
        displaySquares[index].classList.add('tetromino');
    });
   };

   //Score logic 
   function addScore() {
    for (let i = 0; i < width * height; i += width) {
        const row = Array.from({length: width }, (_,k) => i + k);
        if (row.every(index => squares[index].classList.contains('taken'))) {
            row.forEach(index => {
                squares[index].classList.remove('taken', 'tetromino');
            });
            const removed = squares.splice(i, width);
            squares.unshift(...removed);
            squares.forEach(square => grid.appendChild(square));
            score += 10;
            scoreDisplay.textContent = score;
        }
    }
   }
    

   //Game over logic
   function gameOver() {
    if (current.some(index => squares[currentPosition + index].contains('taken'))) {
        clearInterval(timerId);
        timerId = null;
        alert('Game Over!');
    }
   }
});