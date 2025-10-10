// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const gameManager = require('./gameManager');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'server-ui')));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
     origin: ["http://localhost:3000"],
    methods: ["GET", "POST"]
  }
});

const PORT = 3001;

io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // ส่งข้อมูลอัปเดตให้ client และ admin ทันทีที่เชื่อมต่อ
  io.emit('admin-update', gameManager.getGameState());
  io.emit('update-game-state', gameManager.getGameState());

  // Listener สำหรับปุ่ม reset จากหน้า admin
  socket.on('admin-reset-game', () => {
    gameManager.resetGame(io);
  });
  
  // Listener เมื่อ client ขอเข้าร่วมเกม
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

  // Listener เมื่อผู้เล่นวางเรือ
  socket.on('place-ships', (ships) => {
    gameManager.placeShips(socket.id, ships, io);
    io.emit('update-game-state', gameManager.getGameState());
  });

  // Listener เมื่อผู้เล่นยิง
  socket.on('fire-shot', (coords) => {
    gameManager.handleFireShot(socket.id, coords, io);
    // ไม่ต้อง emit ที่นี่ เพราะ timer loop ใน gameManager จะ emit ให้เอง
  });

  // Listener เมื่อ client หลุดการเชื่อมต่อ
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    gameManager.removePlayer(socket.id, io);
    io.emit('admin-update', gameManager.getGameState());
  });

  socket.on('ready-for-next-round', () => {
    gameManager.readyForNextRound(socket.id, io);
  });
  
});

// เริ่มรันเซิร์ฟเวอร์
server.listen(PORT, () => {
  console.log(`Battleship server running on port ${PORT}`);
  console.log(`Admin UI available at http://localhost:${PORT}`);
});