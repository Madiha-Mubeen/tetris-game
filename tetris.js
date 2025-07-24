document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('#grid');
    const width = 10;
    const height = 20;
    const squares = [];

    //Create grid
    for (let i = 0; i < width * height; i++) {
        const square = document.createElement('div');
        grid.appendChild(square);
        squares.push(square);
    }

    //Tetrominoes (basic shapes)
    const lTetromino = [
        [1, width+1, width*2+1, 2],
        [width, width+1, width+2, width*2+2],
        [1, width+1, width*2+1, width*2],
        [width, width*2, width*2+1, width*2+2]
    ];

    let currentPosition = 4;
    let currentRotation = 0;

    //Randomly select a tetromino
    let current = lTetromino[currentRotation];

    function draw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.remove('tetromino');
        });
    }

    function undraw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.remove('tetromino');
        });
    }

    //Move down every second
    function moveDown() {
        undraw();
        currentPosition += width;
        draw();
    }

    timerId = setInterval(moveDown, 1000);

    //Add styles for tetromino
    const style = document.createElement('style');
    style.innerHTML = `.tetromino { background-color: orange; }`;
    document.head.appendChild(style);
})  