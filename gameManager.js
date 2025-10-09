// // gameManager.js

// // เก็บสถานะทั้งหมดของเกม
// const gameState = {
//   players: {}, // ข้อมูลผู้เล่นทั้งหมด, key คือ socket.id
//   gameStatus: 'waiting', // สถานะเกม: waiting, placing, playing, gameover
//   currentPlayerTurn: null, // socket.id ของผู้เล่นที่กำลังจะเล่น
// };

// // ฟังก์ชันสำหรับเพิ่มผู้เล่นใหม่
// function addPlayer(socketId, nickname) {
//   if (Object.keys(gameState.players).length < 2) {
//     gameState.players[socketId] = {
//       nickname: nickname,
//       score: 0,
//       ships: [], // ตำแหน่งเรือ
//       gameBoard: Array(8).fill(0).map(() => Array(8).fill(null)), // ตารางเกมของผู้เล่นนี้
//     };
//     console.log(`${nickname} has joined. Total players: ${Object.keys(gameState.players).length}`);
//     return gameState.players[socketId];
//   }
//   return null; // ไม่สามารถเพิ่มผู้เล่นได้แล้ว (ห้องเต็ม)
// }

// // ฟังก์ชันสำหรับลบผู้เล่นเมื่อหลุดการเชื่อมต่อ
// function removePlayer(socketId) {
//   const nickname = gameState.players[socketId]?.nickname;
//   if (nickname) {
//     delete gameState.players[socketId];
//     console.log(`${nickname} has left. Total players: ${Object.keys(gameState.players).length}`);
//   }
// }

// // ฟังก์ชันสำหรับเช็คว่าเกมพร้อมจะเริ่มหรือยัง
// function isGameReady() {
//     return Object.keys(gameState.players).length === 2;
// }

// // ฟังก์ชันสำหรับดึงข้อมูลสถานะเกมทั้งหมด
// function getGameState() {
//   return gameState;
// }

// // // ส่งออกฟังก์ชันเหล่านี้เพื่อให้ server.js เรียกใช้ได้
// // module.exports = {
// //   addPlayer,
// //   removePlayer,
// //   getGameState,
// //   isGameReady,
// // };
// // src/gameManager.js

// // ... (โค้ดเดิมด้านบน) ...

// // ฟังก์ชันสำหรับเริ่มเกม (เปลี่ยนสถานะเป็น 'placing')
// function startGame() {
//   if (!isGameReady()) return;
  
//   gameState.gameStatus = 'placing';
//   console.log("Game status changed to 'placing'");

//   // ตรงนี้เราจะเพิ่ม logic การสุ่มคนเริ่มเล่นทีหลัง
//   // ตอนนี้แค่เปลี่ยนสถานะก่อน
// }

// // ฟังก์ชันสำหรับรับตำแหน่งเรือจากผู้เล่น
// function placeShips(socketId, ships) {
//     if (gameState.players[socketId]) {
//         gameState.players[socketId].ships = ships;
//         console.log(`Received ships from ${gameState.players[socketId].nickname}`);
//     }

//     // เช็คว่าผู้เล่นทั้งสองคนวางเรือเสร็จหรือยัง
//     const allPlayersPlacedShips = Object.values(gameState.players).every(p => p.ships.length > 0);

//     if (isGameReady() && allPlayersPlacedShips) {
//         gameState.gameStatus = 'playing';
//         console.log("All players placed ships. Game status changed to 'playing'");
//         // TODO: สุ่มผู้เล่นคนแรกและเริ่มตาแรก
//     }
// }


// // ... (โค้ดเดิมด้านล่าง) ...

// // ส่งออกฟังก์ชันใหม่ไปด้วย
// module.exports = {
//   addPlayer,
//   removePlayer,
//   getGameState,
//   isGameReady,
//   startGame,    // <-- เพิ่มอันนี้
//   placeShips,   // <-- เพิ่มอันนี้
// };

// gameManager.js   10/8/2025 7.28
// let timerInterval = null;
// const gameState = {
  
//   players: {},
//   gameStatus: 'waiting', // waiting, placing, playing, gameover
//   currentPlayerTurn: null,
//   winner: null,
//   timer: 10, // เพิ่ม state ของ timer
// };
// function stopTimer() {
//     if (timerInterval) {
//         clearInterval(timerInterval);
//         timerInterval = null;
//     }
// }
// function startTimer(io) {
//     stopTimer();
//     gameState.timer = 10;
    
//     timerInterval = setInterval(() => {
//         gameState.timer--;
//         io.emit('update-game-state', getGameState()); // ส่งเวลาที่อัปเดตไปให้ client ทุกวินาที

//         if (gameState.timer <= 0) {
//             console.log(`Time ran out for ${gameState.players[gameState.currentPlayerTurn]?.nickname}`);
//             // เวลาหมด ให้สลับตาเหมือนยิงพลาด
//             const playerIds = Object.keys(gameState.players);
//             const opponentId = playerIds.find(id => id !== gameState.currentPlayerTurn);
//             gameState.currentPlayerTurn = opponentId;
//             startTimer(io); // เริ่มจับเวลาใหม่สำหรับคนถัดไป
//         }
//     }, 1000);
// }
// function addPlayer(socketId, nickname) {
//   if (Object.keys(gameState.players).length >= 2) return null;

//   gameState.players[socketId] = {
//     nickname,
//     score: 0,
//     ships: [], // ตำแหน่งเรือ {row, col}
//     shipPartsHit: 0, // จำนวนชิ้นส่วนเรือที่ถูกยิง
//     // ตารางของผู้เล่นนี้ ที่จะบันทึกการโจมตีจากฝ่ายตรงข้าม
//     gameBoard: Array(8).fill(0).map(() => Array(8).fill(null)), 
//   };
//   console.log(`${nickname} has joined. Total players: ${Object.keys(gameState.players).length}`);
//   return gameState.players[socketId];
// }
// function removePlayer(socketId, io) {
//   if (gameState.players[socketId]) {
//     console.log(`${gameState.players[socketId].nickname} has left.`);
//     delete gameState.players[socketId];
//     // ถ้ามีคนหลุดระหว่างเล่น ให้รีเซ็ตเกม
//     resetGame(io); // <-- ส่ง io ต่อไปให้ resetGame ด้วย
//   }
// }
// // function removePlayer(socketId) {
// //   if (gameState.players[socketId]) {
// //     console.log(`${gameState.players[socketId].nickname} has left.`);
// //     delete gameState.players[socketId];
// //     // ถ้ามีคนหลุดระหว่างเล่น ให้รีเซ็ตเกม
// //     resetGame();
// //   }
// // }

// // function placeShips(socketId, ships) {
// //   if (!gameState.players[socketId]) return;
  
// //   gameState.players[socketId].ships = ships;
// //   console.log(`Received ships from ${gameState.players[socketId].nickname}`);

// //   const players = Object.values(gameState.players);
// //   if (players.length === 2 && players.every(p => p.ships.length > 0)) {
// //     gameState.gameStatus = 'playing';
// //     // สุ่มผู้เล่นคนแรก
// //     const playerIds = Object.keys(gameState.players);
// //     gameState.currentPlayerTurn = playerIds[Math.floor(Math.random() * playerIds.length)];
// //     console.log(`All players placed ships. Game starting. First turn: ${gameState.players[gameState.currentPlayerTurn].nickname}`);
// //   }
// // }
// function placeShips(socketId, ships, io) { // รับ io เพิ่ม
//   if (!gameState.players[socketId]) return;
  
//   gameState.players[socketId].ships = ships;
//   console.log(`Received ships from ${gameState.players[socketId].nickname}`);

//   const players = Object.values(gameState.players);
//   // ... โค้ดเดิม ...
//   if (players.length === 2 && players.every(p => p.ships.length > 0)) {
//     gameState.gameStatus = 'playing';
//     const playerIds = Object.keys(gameState.players);
//     gameState.currentPlayerTurn = playerIds[Math.floor(Math.random() * playerIds.length)];
//     console.log(`Game starting. First turn: ${gameState.players[gameState.currentPlayerTurn].nickname}`);
//     startTimer(io); // <-- เริ่มจับเวลาครั้งแรก
//   }
// }

// function handleFireShot(firingPlayerId, coords, io) {
//   // เช็คว่าเป็นตาของผู้เล่นคนนี้จริงหรือไม่
//   if (gameState.gameStatus !== 'playing' || gameState.currentPlayerTurn !== firingPlayerId) {
//     return; // ไม่ใช่ตาของคนนี้ หรือเกมไม่ได้กำลังเล่นอยู่
//   }

//   const playerIds = Object.keys(gameState.players);
//   const opponentId = playerIds.find(id => id !== firingPlayerId);
//   const opponent = gameState.players[opponentId];

//   const { row, col } = coords;

//   // เช็คว่าเคยยิงช่องนี้ไปแล้วหรือยัง
//   if (opponent.gameBoard[row][col] !== null) {
//     return; // ยิงไปแล้ว
//   }

//   // เช็คว่ายิงโดนเรือหรือไม่
//   const isHit = opponent.ships.some(shipPart => shipPart.row === row && shipPart.col === col);

//   if (isHit) {
//     opponent.gameBoard[row][col] = 'hit';
//     opponent.shipPartsHit += 1;
//     console.log(`${gameState.players[firingPlayerId].nickname} scored a HIT!`);

//     // เช็คว่าชนะหรือยัง (ยิงชิ้นส่วนเรือครบ 16 ชิ้น)
//     if (opponent.shipPartsHit >= 16) {
//       gameState.gameStatus = 'gameover';
//       gameState.winner = firingPlayerId;
//       gameState.players[firingPlayerId].score += 1;
//       console.log(`Game over! Winner is ${gameState.players[firingPlayerId].nickname}`);
//       stopTimer(); // <-- หยุด timer เมื่อเกมจบ
//     } else {
//       // ถ้ายังไม่จบเกม ให้สลับตา
//       gameState.currentPlayerTurn = opponentId;
//       startTimer(io); // <-- เริ่มจับเวลาใหม่เมื่อสลับตา
//     }
    
//   } else {
//     opponent.gameBoard[row][col] = 'miss';
//     console.log(`${gameState.players[firingPlayerId].nickname} MISSED!`);
//     // ถ้ายิงพลาด ให้สลับตา
//     gameState.currentPlayerTurn = opponentId;
//     startTimer(io); // <-- เริ่มจับเวลาใหม่เมื่อสลับตา
//   }
//   //------------------------------]
 
// }

// function resetGame() {
//     stopTimer();
//     Object.keys(gameState.players).forEach(id => {
//         // gameState.players[id].ships = [];
//         // gameState.players[id].shipPartsHit = 0;
//         // gameState.players[id].gameBoard = Array(8).fill(0).map(() => Array(8).fill(null));
//         const player = gameState.players[id];
//         player.score = 0; // <-- รีเซ็ตคะแนน
//         player.ships = [];
//         player.shipPartsHit = 0;
//         player.gameBoard = Array(8).fill(0).map(() => Array(8).fill(null));
//     });
//     gameState.gameStatus = 'waiting';
//     gameState.currentPlayerTurn = null;
//     gameState.winner = null;
//     gameState.timer = 10;
//     console.log('Game has been reset.');
//     io.emit('update-game-state', getGameState());
// }

// function getGameState() {
//   return gameState;
// }

// function isGameReady() {
//   return Object.keys(gameState.players).length === 2;
// }

// function startGame() {
//   if (!isGameReady()) return;
//   gameState.gameStatus = 'placing';
//   console.log("Game status changed to 'placing'");
// }

// module.exports = {
//   addPlayer,
//   removePlayer,
//   getGameState,
//   isGameReady,
//   startGame,
//   placeShips,
//   handleFireShot, // <-- เพิ่มอันนี้
//   resetGame,      // <-- เพิ่มอันนี้ (สำหรับปุ่ม Reset ในอนาคต)
//   placeShips,
//   handleFireShot,
//   resetGame,
// };

//---------------------------------------------------------------------------------------------------------------------------------------
//v3
// gameManager.js

// let timerInterval = null; // ตัวแปรสำหรับเก็บ interval ของ timer

// const gameState = {
//   players: {},
//   gameStatus: 'waiting',
//   currentPlayerTurn: null,
//   winner: null,
//   timer: 10, // เพิ่ม state ของ timer
// };

// function stopTimer() {
//     if (timerInterval) {
//         clearInterval(timerInterval);
//         timerInterval = null;
//     }
// }

// // ต้องรับ io เข้ามาเพื่อใช้ broadcast
// function startTimer(io) {
//     stopTimer();
//     gameState.timer = 10;
    
//     timerInterval = setInterval(() => {
//         gameState.timer--;
//         io.emit('update-game-state', getGameState()); // ส่งเวลาที่อัปเดตไปให้ client ทุกวินาที

//         if (gameState.timer <= 0) {
//             console.log(`Time ran out for ${gameState.players[gameState.currentPlayerTurn]?.nickname}`);
//             // เวลาหมด ให้สลับตาเหมือนยิงพลาด
//             const playerIds = Object.keys(gameState.players);
//             const opponentId = playerIds.find(id => id !== gameState.currentPlayerTurn);
//             gameState.currentPlayerTurn = opponentId;
//             startTimer(io); // เริ่มจับเวลาใหม่สำหรับคนถัดไป
//         }
//     }, 1000);
// }

// // --- เราจะแก้ไขฟังก์ชันเดิมเล็กน้อยเพื่อเรียกใช้ timer ---

// function placeShips(socketId, ships, io) { // รับ io เพิ่ม
//   // ... โค้ดเดิม ...
//   if (players.length === 2 && players.every(p => p.ships.length > 0)) {
//     gameState.gameStatus = 'playing';
//     const playerIds = Object.keys(gameState.players);
//     gameState.currentPlayerTurn = playerIds[Math.floor(Math.random() * playerIds.length)];
//     console.log(`Game starting. First turn: ${gameState.players[gameState.currentPlayerTurn].nickname}`);
//     startTimer(io); // <-- เริ่มจับเวลาครั้งแรก
//   }
// }

// function handleFireShot(firingPlayerId, coords, io) { // รับ io เพิ่ม
//   // ... โค้ดเดิม ...
//   if (isHit) {
//     // ...
//     if (gameState.gameStatus === 'gameover') {
//         stopTimer(); // <-- หยุด timer เมื่อเกมจบ
//     } else {
//       gameState.currentPlayerTurn = opponentId;
//       startTimer(io); // <-- เริ่มจับเวลาใหม่เมื่อสลับตา
//     }
//   } else {
//     // ...
//     gameState.currentPlayerTurn = opponentId;
//     startTimer(io); // <-- เริ่มจับเวลาใหม่เมื่อสลับตา
//   }
// }

// // แก้ไขฟังก์ชัน resetGame ให้รีเซ็ตคะแนนด้วยตามโจทย์
// function resetGame(io) { // รับ io เพิ่ม
//     stopTimer();
//     Object.keys(gameState.players).forEach(id => {
//         const player = gameState.players[id];
//         player.score = 0; // <-- รีเซ็ตคะแนน
//         player.ships = [];
//         player.shipPartsHit = 0;
//         player.gameBoard = Array(8).fill(0).map(() => Array(8).fill(null));
//     });
//     gameState.gameStatus = 'waiting';
//     gameState.currentPlayerTurn = null;
//     gameState.winner = null;
//     gameState.timer = 10;
//     console.log('Game has been reset by admin.');
//     io.emit('update-game-state', getGameState()); // <-- แจ้ง client ทุกคน
// }

// // ... ฟังก์ชันอื่นๆ เหมือนเดิม ...
// // อย่าลืม export ฟังก์ชันที่แก้ด้วย
// module.exports = {
//     // ... exports เดิม ...
//     placeShips,
//     handleFireShot,
//     resetGame,
// };

///// 10/8/2025 7.29

// gameManager.js
// gameManager.js
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

function addPlayer(socketId, nickname) {
  if (Object.keys(gameState.players).length >= 2) return null;
  gameState.players[socketId] = {
    nickname,
    score: 0,
    ships: [],
    shipPartsHit: 0,
    gameBoard: Array(8).fill(0).map(() => Array(8).fill(null)),
  };
  return gameState.players[socketId];
}

function resetGame(io) { // <-- แก้ไข: รับ io เข้ามา
  stopTimer();
  Object.keys(gameState.players).forEach(id => {
    const player = gameState.players[id];
    player.score = 0;
    player.ships = [];
    player.shipPartsHit = 0;
    player.gameBoard = Array(8).fill(0).map(() => Array(8).fill(null));
  });
  gameState.gameStatus = 'waiting';
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
    if (opponent.shipPartsHit >= 16) {
      gameState.gameStatus = 'gameover';
      gameState.winner = socketId;
      gameState.players[socketId].score += 1;
      stopTimer();
    } else {
      gameState.currentPlayerTurn = opponentId;
      startTimer(io);
    }
  } else {
    opponent.gameBoard[row][col] = 'miss';
    gameState.currentPlayerTurn = opponentId;
    startTimer(io);
  }
}

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
};