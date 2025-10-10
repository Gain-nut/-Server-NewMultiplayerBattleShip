let timerInterval = null; // <-- เพิ่มตัวแปรที่หายไป

const gameState = {
  players: {},
  gameStatus: 'waiting',
  currentPlayerTurn: null,
  winner: null,
  timer: 10,
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
  io.emit('update-game-state', getGameState()); // ส่งเวลาเริ่มต้นทันที

  timerInterval = setInterval(() => {
    gameState.timer--;
    io.emit('update-game-state', getGameState());
    if (gameState.timer <= 0) {
      const playerIds = Object.keys(gameState.players);
      const opponentId = playerIds.find(id => id !== gameState.currentPlayerTurn);
      gameState.currentPlayerTurn = opponentId;
      startTimer(io);
    }
  }, 1000);
}
function createPlayerState() {
  return {
    nickname: '',
    score: 0,
    ships: [],
    shipPartsHit: 0,
    gameBoard: Array(8).fill(0).map(() => Array(8).fill(null)),
    readyForNextRound: false,
  };
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

function resetGame(io) { // <-- แก้ไข: รับ io เข้ามา
  stopTimer();
  Object.keys(gameState.players).forEach(id => {
    const player = gameState.players[id];
    // player.score = 0;
    player.ships = [];
    player.shipPartsHit = 0;
    player.gameBoard = Array(8).fill(0).map(() => Array(8).fill(null));
    player.readyForNextRound = false;
  });
  // gameState.gameStatus = 'waiting';
  gameState.gameStatus = 'placing';
  gameState.currentPlayerTurn = null;
  gameState.winner = null;
  gameState.timer = 10;
  console.log('Game has been reset.');
  if (io) { // <-- เพิ่มการตรวจสอบ io ก่อนใช้งาน
    io.emit('update-game-state', getGameState());
  }
}

function removePlayer(socketId, io) {
  if (gameState.players[socketId]) {
    console.log(`${gameState.players[socketId].nickname} has left.`);
    delete gameState.players[socketId];
    resetGame(io); // ส่ง io ต่อไป
  }
}

function placeShips(socketId, ships, io) {
  if (!gameState.players[socketId]) return;
  gameState.players[socketId].ships = ships;
  const players = Object.values(gameState.players);
  if (players.length === 2 && players.every(p => p.ships.length > 0)) {
    gameState.gameStatus = 'playing';
    const playerIds = Object.keys(gameState.players);
    gameState.currentPlayerTurn = playerIds[Math.floor(Math.random() * playerIds.length)];
    startTimer(io);
  }
}

function handleFireShot(socketId, coords, io) {
  if (gameState.gameStatus !== 'playing' || gameState.currentPlayerTurn !== socketId) return;
  
  const playerIds = Object.keys(gameState.players);
  const opponentId = playerIds.find(id => id !== socketId);
  if (!opponentId) return; // ป้องกัน error ถ้าหา opponent ไม่เจอ

  const opponent = gameState.players[opponentId];
  const { row, col } = coords;

  if (opponent.gameBoard[row][col] !== null) return;

  const isHit = opponent.ships.some(shipPart => shipPart.row === row && shipPart.col === col);
  if (isHit) {
    opponent.gameBoard[row][col] = 'hit';
    opponent.shipPartsHit += 1;
    console.log(`${gameState.players[socketId].nickname} scored a HIT!`);

//     // เช็คว่าชนะหรือยัง (ยิงชิ้นส่วนเรือครบ 16 ชิ้น)
    if (opponent.shipPartsHit >= 16) {
      // gameState.gameStatus = 'gameover';
      gameState.winner = socketId;
      // gameState.players[socketId].score++;
      stopTimer(); // <-- หยุด timer เมื่อเกมจบ
      gameState.players[socketId].score += 1;
      if (gameState.players[socketId].score >= 2) { // ชนะทั้งแมตช์
        gameState.gameStatus = 'matchover';
        console.log(`Matchs over! Winner is ${gameState.players[socketId].nickname}`);
        if (io) io.emit('update-game-state', getGameState());
        return
      } else { // ชนะแค่รอบนี้
        gameState.gameStatus = 'gameover';
        console.log(`Game over! Winner is ${gameState.players[socketId].nickname}`);
        if (io) io.emit('update-game-state', getGameState());
        return
        // return 
      }
      
    } else {
      // ถ้ายังไม่จบเกม ให้สลับตา
      console.log(`Turn end: ${gameState.players[socketId].nickname}`)
      gameState.currentPlayerTurn = opponentId;
      startTimer(io); // <-- เริ่มจับเวลาใหม่เมื่อสลับตา
    }
    
  } else {
    opponent.gameBoard[row][col] = 'miss';
    console.log(`${gameState.players[socketId].nickname} MISSED!`);
    // ถ้ายิงพลาด ให้สลับตา
    gameState.currentPlayerTurn = opponentId;
    startTimer(io); // <-- เริ่มจับเวลาใหม่เมื่อสลับตา
  }
  //------------------------------]
 
}
//   if (isHit) {
//     opponent.gameBoard[row][col] = 'hit';
//     opponent.shipPartsHit += 1;
//     if (opponent.shipPartsHit >= 16) {
//       gameState.gameStatus = 'gameover';
//       gameState.winner = socketId;
//       gameState.players[socketId].score += 1;
//       stopTimer();
//     } else {
//       gameState.currentPlayerTurn = opponentId;
//       startTimer(io);
//     }
//   } else {
//     opponent.gameBoard[row][col] = 'miss';
//     gameState.currentPlayerTurn = opponentId;
//     startTimer(io);
//   }
// }

function getGameState() {
  return gameState;
}

function isGameReady() {
  return Object.keys(gameState.players).length === 2;
}

function startGame(io) {
  if (!isGameReady()) return;
  gameState.gameStatus = 'placing';
}
function resetRound(io) {
    stopTimer();
    Object.values(gameState.players).forEach(player => {
        player.ships = [];
        player.shipPartsHit = 0;
        player.gameBoard = Array(8).fill(0).map(() => Array(8).fill(null));
        player.readyForNextRound = false;
    });
    gameState.gameStatus = 'placing';
    gameState.currentPlayerTurn = null;
    gameState.winner = null;
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

// แก้ไข module.exports ให้ถูกต้อง ไม่มี key ซ้ำ
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



