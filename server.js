// server.js (Node)
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const gameManager = require('./gameManager');

const app = express();
app.use(express.static(path.join(__dirname, 'server-ui')));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: ['http://localhost:3000'], methods: ['GET','POST'] }
});

// Mirror console.log to admin UI
const origLog = console.log;
console.log = (...args) => {
  origLog(...args);
  try {
    const msg = args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
    io.emit('log-message', msg);
  } catch {}
};

const PORT = 3001;

io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // send snapshot to admin + clients
  io.emit('admin-update', gameManager.getGameState());
  io.emit('update-game-state', gameManager.getGameState());

  socket.on('admin-reset-game', () => {
    console.log('Admin requested full reset (scores + boards)');
    gameManager.resetGame(io, { resetScores: true });
    io.emit('game-reset');
    io.emit('admin-update', gameManager.getGameState());
  });

  socket.on('join-game', (nickname) => {
    const player = gameManager.addPlayer(socket.id, nickname);
    if (player) {
      socket.emit('join-success', { playerId: socket.id, nickname: player.nickname });
      io.emit('update-game-state', gameManager.getGameState());
      if (gameManager.isGameReady()) {
        gameManager.startGame(io);
        io.emit('update-game-state', gameManager.getGameState());
      }
    } else {
      socket.emit('game-full', 'The game is already full.');
    }
  });

  socket.on('place-ships', (ships) => {
    gameManager.placeShips(socket.id, ships, io);
    io.emit('update-game-state', gameManager.getGameState());
  });

  socket.on('fire-shot', (coords) => {
    gameManager.handleFireShot(socket.id, coords, io);
  });

  socket.on('ready-for-next-round', () => {
    gameManager.readyForNextRound(socket.id, io);
  });

// Player surrenders
socket.on('surrender', ({ playerId }) => {
  const gameState = gameManager.getGameState();
  const player = gameState.players[playerId];
  const playerName = player?.nickname || playerId;

  const players = Object.keys(gameState.players || {});
  if (players.length !== 2) return; // no opponent yet

  // Find the opponent
  const opponentId = players.find(id => id !== playerId);
  const opponent = gameState.players[opponentId];
  const opponentName = opponent?.nickname || opponentId;

  // Log surrender
  console.log(`Player ${playerName} surrendered!`);
  console.log(`${opponentName} wins because ${playerName} surrendered!`);

  // Update game state
  gameState.gameStatus = 'gameover';
  gameState.winner = opponentId;
  gameState.gameOverReason = 'surrender';

  // Add score for winner
  if (opponent) {
    opponent.score = (opponent.score || 0) + 1;
  }

  // Set next round starter = winner
  gameState.nextStarterId = opponentId;

  io.emit('update-game-state', gameState);
  io.emit('admin-update', gameState);
});

socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);

    if (socket.isAdmin) {
      console.log("Admin disconnected, but keep players active.");
      // ❌ อย่าแตะ player state เลย
      return;
    }

    // ✅ ผู้เล่นออกจริง ๆ ค่อยลบ
   gameManager.removePlayer(socket.id, io);
   io.emit('update-game-state', gameManager.getGameState());

  });


  
});
 

server.listen(PORT, () => {
  console.log(`Battleship server running on port ${PORT}`);
  console.log(`Admin UI available at http://localhost:${PORT}`);
});
