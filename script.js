// private gameBoard Module
const gameBoard = (function createBoard() {
    let board = ["", "", "", "", "", "", "", "", ""]; // 9 empty cells (#0-8)

    function getBoard() {
        return [...board];//return copy to prevent external mutation
    }

    // function to place mark & check if cell is empty
    function placeMark(index, mark) {
        if (board[index] === "") {
            board[index] = mark;
            return true;
        }
        return false;
    }

    // function to reset board to initial state
    function resetBoard() {
        board = ["", "", "", "", "", "", "", "", ""];
    }

    //public API
    return {
        getBoard,
        placeMark,
        resetBoard
    };
})();



// player factory function
function createPlayer(name, mark) {
    if (mark !== "X" && mark !== "O") {
        throw new Error("Mark must be 'X' or 'O'"); //ensures valid mark
    }
    // name and mark are private to the player object
    return { name, mark };
}


//private gameController Module
const gameController = (function() {
    const board = gameBoard;
    const player1 = createPlayer("Player 1", "X");
    const player2 = createPlayer("Player 2", "O");
    let currentPlayer = player1; // start with player1

    const winningCombos = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];

    function switchTurn() {
        currentPlayer = currentPlayer === player1 ? player2 : player1;
    }

    // checks if current player has won by comparing board state to winning combos
    function checkWinner() {
        const boardState = board.getBoard();
        return winningCombos.some(combo => 
            combo.every(index => boardState[index] === currentPlayer.mark)
        );
    }

    // checks for tie by ensuring all cells are filled and no winner
    function checkTie() {
        return board.getBoard().every(cell => cell !== "") && !checkWinner();
    }

    // main function to handle a player's turn, returns game status or success boolean
    function playTurn(index) {
        const success = board.placeMark(index, currentPlayer.mark);
        if (!success) return false;

        if (checkWinner()) return `${currentPlayer.name} wins!`;
        if (checkTie()) return "It's a tie!";

        // if no winner/tie, game continues, switch turn to the other player
        switchTurn();
        return true;
    }

    function getCurrentPlayer() {
        return currentPlayer;
    }

    function getBoard() {
        return board.getBoard();
    }

    function resetGame() {
        board.resetBoard();
        currentPlayer = player1;
    }

    // allows setting player names from the UI, keeps default if empty
    function setPlayerNames(name1, name2) {
        if (name1) player1.name = name1;
        if (name2) player2.name = name2;
    }

    //public API
    return {
        playTurn,
        getCurrentPlayer,
        getBoard,
        resetGame,
        setPlayerNames
    };
})();

//module for display and ui
const displayModule = (function() {
    // Create board container
    const boardContainer = document.createElement('div');
    boardContainer.id = 'board';
    boardContainer.style.display = 'none'; // hidden until Start clicked
    boardContainer.style.gridTemplateColumns = 'repeat(3, 100px)';
    boardContainer.style.gridTemplateRows = 'repeat(3, 100px)';
    boardContainer.style.display = 'grid';
    boardContainer.style.gap = '5px';
    boardContainer.style.margin = '20px auto';
    boardContainer.style.width = 'max-content';
    document.body.appendChild(boardContainer);

    // Create status div
    const statusDiv = document.createElement('div');
    statusDiv.id = 'status';
    statusDiv.style.display = 'none'; // hidden until Start clicked
    statusDiv.style.textAlign = 'center';
    statusDiv.style.marginTop = '10px';
    statusDiv.style.fontSize = '20px';
    statusDiv.style.fontWeight = 'bold';
    document.body.appendChild(statusDiv);

    // create start menu for player names
    const startDiv = document.createElement('div');
    startDiv.style.textAlign = 'center';
    startDiv.style.marginTop = '20px';

    const player1Input = document.createElement('input');
    player1Input.placeholder = 'Enter Player 1 name';
    player1Input.style.marginRight = '10px';

    const player2Input = document.createElement('input');
    player2Input.placeholder = 'Enter Player 2 name';

    const startButton = document.createElement('button');
    startButton.textContent = 'Start Game';
    startButton.style.marginLeft = '10px';
    startButton.style.padding = '5px 10px';
    startButton.style.cursor = 'pointer';

    startDiv.appendChild(player1Input);
    startDiv.appendChild(player2Input);
    startDiv.appendChild(startButton);
    document.body.insertBefore(startDiv, boardContainer);

    // Create Reset button
    const resetButton = document.createElement('button');
    resetButton.textContent = 'Reset Game';
    resetButton.style.display = 'none'; // hidden until Start clicked
    resetButton.style.margin = '10px auto';
    resetButton.style.padding = '10px 20px';
    resetButton.style.fontSize = '16px';
    resetButton.style.cursor = 'pointer';
    document.body.appendChild(resetButton);

    // function to create a cell element
    function createCell(index) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = index;
        cell.style.width = '100px';
        cell.style.height = '100px';
        cell.style.display = 'flex';
        cell.style.justifyContent = 'center';
        cell.style.alignItems = 'center';
        cell.style.fontSize = '40px';
        cell.style.cursor = 'pointer';
        cell.style.border = '2px solid #333';
        return cell;
    }

    // status handler
    function updateStatus() {
        const player = gameController.getCurrentPlayer();
        statusDiv.textContent = `Current Turn: ${player.name} (${player.mark})`;
    }

    // render board using game state (in gameController)
    function renderBoard() {
        boardContainer.innerHTML = '';
        const boardState = gameController.getBoard();
        boardState.forEach((mark, index) => {
            const cell = createCell(index);
            cell.textContent = mark;
            cell.addEventListener('click', () => handleClick(index));
            boardContainer.appendChild(cell);
        });
        updateStatus();
    }

    // player turn event listener
    function handleClick(index) {
        const result = gameController.playTurn(index);
        renderBoard();

        if (typeof result === 'string') {
            // game over message
            statusDiv.textContent = result;

            // Automatically reset board 2 seconds after game end
            setTimeout(() => {
                gameController.resetGame();
                renderBoard();
                updateStatus();
            }, 2000);
        }
    }

    // Start button event listener and name handling
    startButton.addEventListener('click', () => {
        const name1 = player1Input.value.trim();
        const name2 = player2Input.value.trim();

        gameController.setPlayerNames(name1 || "Player 1", name2 || "Player 2");
        
        // this happens after start menu selection
        startDiv.style.display = 'none'; //hide start menu
        boardContainer.style.display = 'grid'; // show board
        statusDiv.style.display = 'block'; // show status
        resetButton.style.display = 'block'; // show reset button

        renderBoard();
    });

    // Manual reset button
    resetButton.addEventListener('click', () => {
        gameController.resetGame(); // clears board, keeps names
        renderBoard();
    });

    function init() {
    // Nothing to render until game start
    }

    //public API
    return {
        init
    };
})();
