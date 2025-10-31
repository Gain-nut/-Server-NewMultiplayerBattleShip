// ---- gameManager.js ----

let timerInterval = null;

const gameState = {
  players: {},
  gameStatus: 'waiting',
  currentPlayerTurn: null,
  winner: null,
  timer: 10,
  nextStarterId: null,          // <— remember who should start next round
};

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function startTimer(io) {
  stopTimer();
  gameState.timer = 10;
  io.emit('update-game-state', getGameState());
  timerInterval = setInterval(() => {
    gameState.timer--;
    io.emit('update-game-state', getGameState());
    if (gameState.timer <= 0) {
      const ids = Object.keys(gameState.players);
      const oppId = ids.find(id => id !== gameState.currentPlayerTurn);
      gameState.currentPlayerTurn = oppId || null;
      startTimer(io);
    }
  }, 1000);
}

function addPlayer(socketId, nickname) {
  if (Object.keys(gameState.players).length >= 2) return null;
  gameState.players[socketId] = {
    nickname,
    score: 0,
    ships: [],
    shipPartsHit: 0,
    gameBoard: Array(8).fill(0).map(() => Array(8).fill(null)),
    readyForNextRound: false,
  };
  return gameState.players[socketId];
}

function resetGame(io, { resetScores = false } = {}) {
  stopTimer();
  Object.keys(gameState.players).forEach(id => {
    const p = gameState.players[id];
    if (resetScores) p.score = 0;
    p.ships = [];
    p.shipPartsHit = 0;
    p.gameBoard = Array(8).fill(0).map(() => Array(8).fill(null));
    p.readyForNextRound = false;
  });

  gameState.gameStatus = 'placing';
  gameState.currentPlayerTurn = null;
  gameState.winner = null;
  gameState.timer = 10;
  gameState.nextStarterId = null; // <— clear only on FULL reset

  if (io) io.emit('update-game-state', getGameState());
}

function removePlayer(socketId, io) {
  if (gameState.players[socketId]) {
    console.log(`${gameState.players[socketId].nickname} has left.`);
    delete gameState.players[socketId];
    resetGame(io);
  }
}

function placeShips(socketId, ships, io) {
  if (!gameState.players[socketId]) return;
  gameState.players[socketId].ships = ships;

  const ids = Object.keys(gameState.players);
  const allPlaced = ids.length === 2 && ids.every(id => gameState.players[id].ships.length > 0);
  if (!allPlaced) return;

  gameState.gameStatus = 'playing';

  // Use previous winner if valid, otherwise randomize for the first ever round
  if (gameState.nextStarterId && ids.includes(gameState.nextStarterId)) {
    gameState.currentPlayerTurn = gameState.nextStarterId;
    console.log('[ROUND START] winner starts:', gameState.currentPlayerTurn);
  } else {
    gameState.currentPlayerTurn = ids[Math.floor(Math.random() * ids.length)];
    console.log('[ROUND START] random first player:', gameState.currentPlayerTurn);
  }

  startTimer(io);
  if (io) io.emit('update-game-state', getGameState());
}

function handleFireShot(socketId, coords, io) {
  if (gameState.gameStatus !== 'playing' || gameState.currentPlayerTurn !== socketId) return;

  const ids = Object.keys(gameState.players);
  const opponentId = ids.find(id => id !== socketId);
  if (!opponentId) return;

  const opponent = gameState.players[opponentId];
  const { row, col } = coords;

  if (opponent.gameBoard[row][col] !== null) return;

  const isHit = opponent.ships.some(p => p.row === row && p.col === col);

  if (isHit) {
    opponent.gameBoard[row][col] = 'hit';
    opponent.shipPartsHit += 1;

    if (opponent.shipPartsHit >= 16) {
      // round winner
      gameState.winner = socketId;
      gameState.players[socketId].score += 1;
      gameState.nextStarterId = socketId;      // <— winner starts next round
      stopTimer();

      if (gameState.players[socketId].score >= 2) {
        gameState.gameStatus = 'matchover';
        console.log('Match over! Winner:', gameState.players[socketId].nickname);
      } else {
        gameState.gameStatus = 'gameover';
        console.log('Game over! Winner:', gameState.players[socketId].nickname);
      }
      if (io) io.emit('update-game-state', getGameState());
      return;
    }

    // (design choice) after any shot, swap turn:
    const next = opponentId;
    gameState.currentPlayerTurn = next;
    startTimer(io);
  } else {
    opponent.gameBoard[row][col] = 'miss';
    gameState.currentPlayerTurn = opponentId;
    startTimer(io);
  }

  if (io) io.emit('update-game-state', getGameState());
}

function getGameState() { return gameState; }
function isGameReady() { return Object.keys(gameState.players).length === 2; }
function startGame() { if (isGameReady()) gameState.gameStatus = 'placing'; }

function resetRound(io) {
  stopTimer();
  Object.values(gameState.players).forEach(p => {
    p.ships = [];
    p.shipPartsHit = 0;
    p.gameBoard = Array(8).fill(0).map(() => Array(8).fill(null));
    p.readyForNextRound = false;
  });
  gameState.gameStatus = 'placing';
  gameState.currentPlayerTurn = null;
  gameState.winner = null;
  // NOTE: DO NOT clear nextStarterId here; it holds the previous round winner
  if (io) io.emit('update-game-state', getGameState());
}

function readyForNextRound(socketId, io) {
  if (gameState.players[socketId]) {
    gameState.players[socketId].readyForNextRound = true;
  }
  const players = Object.values(gameState.players);
  if (players.length === 2 && players.every(p => p.readyForNextRound)) {
    resetRound(io);
  } else {
    if (io) io.emit('update-game-state', getGameState());
  }
}

module.exports = {
  addPlayer,
  removePlayer,
  getGameState,
  isGameReady,
  startGame,
  placeShips,
  handleFireShot,
  resetGame,
  readyForNextRound,
};
