// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const gameManager = require('./gameManager');
const path = require('path');

const app = express();

// Serve the admin UI (server-ui/index.html, script.js, etc.)
app.use(express.static(path.join(__dirname, 'server-ui')));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000'], // your React client
    methods: ['GET', 'POST'],
  },
});

const PORT = 3001;

io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // Send current state to everyone (admin + clients)
  io.emit('admin-update', gameManager.getGameState());
  io.emit('update-game-state', gameManager.getGameState());

  // --- SINGLE handler for admin reset (scores + boards) ---
  socket.on('admin-reset-game', () => {
    console.log('Admin requested full reset (scores + boards)');
    gameManager.resetGame(io, { resetScores: true }); // <-- use the flag you added
    io.emit('game-reset'); // optional: let clients clear local UI immediately
    io.emit('admin-update', gameManager.getGameState()); // refresh admin panel
  });

  // Player joins
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

  // Place ships
  socket.on('place-ships', (ships) => {
    gameManager.placeShips(socket.id, ships, io);
    io.emit('update-game-state', gameManager.getGameState());
  });

  // Fire shot
  socket.on('fire-shot', (coords) => {
    gameManager.handleFireShot(socket.id, coords, io);
    // Timer loop inside gameManager will emit updates as needed
  });

  // Ready for next round
  socket.on('ready-for-next-round', () => {
    gameManager.readyForNextRound(socket.id, io);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    gameManager.removePlayer(socket.id, io);
    io.emit('admin-update', gameManager.getGameState());
  });
});

server.listen(PORT, () => {
  console.log(`Battleship server running on port ${PORT}`);
  console.log(`Admin UI available at http://localhost:${PORT}`);
});
