// server.js

// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const gameManager = require('./gameManager'); // นำเข้าตัวจัดการเกม
// const path = require('path');

// const app = express();
// app.use(express.static(path.join(__dirname, 'server-ui'))); // <-- สั่งให้ serve โฟลเดอร์ server-ui
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "*", // อนุญาตให้ client ทุกที่เชื่อมต่อได้ (เพื่อความง่ายในการทดสอบ)
//     methods: ["GET", "POST"]
//   }
// });

// const PORT = 3001; // Port ที่เซิร์ฟเวอร์จะรัน

// // เมื่อมี client เชื่อมต่อเข้ามา
// io.on('connection', (socket) => {
//   // console.log(`A user connected: ${socket.id}`);

//   console.log(`A user connected: ${socket.id}`);

//   // ===================== ▼ ใส่โค้ดตรงนี้ ▼ =====================

//   // ส่งข้อมูลอัปเดตให้หน้า admin และ client ทั่วไปทันทีที่เชื่อมต่อ
//   io.emit('admin-update', gameManager.getGameState());
//   io.emit('update-game-state', gameManager.getGameState());

//   // เพิ่ม listener สำหรับปุ่ม reset จากหน้า admin
//   socket.on('admin-reset-game', () => {
//     gameManager.resetGame(io);
//   });

//   // ===================== ▲ สิ้นสุดส่วนที่เพิ่ม ▲ =====================

  
//   // เมื่อ client ส่งอีเวนต์ 'join-game' พร้อมชื่อเล่น
//   socket.on('join-game', (nickname) => {
//     const player = gameManager.addPlayer(socket.id, nickname);

//     if (player) {
//       console.log(`${nickname} successfully added.`);
//       // ส่งข้อความกลับไปหา client ที่เพิ่งต่อเข้ามา บอกว่าสำเร็จ
//       socket.emit('join-success', { playerId: socket.id, nickname: player.nickname });

//       // แจ้งผู้เล่นทุกคนให้ทราบถึงสถานะล่าสุด
//       io.emit('update-game-state', gameManager.getGameState());
      

//       // ถ้าผู้เล่นครบ 2 คนแล้ว ให้เริ่มเกม
//       if (gameManager.isGameReady()) {
//         console.log('Game is ready to start!');
//         gameManager.startGame(); // <-- เรียกใช้ฟังก์ชันเริ่มเกม
//         io.emit('game-start', gameManager.getGameState()); // <-- เปลี่ยนจาก 'game-ready' เป็น 'game-start' และส่ง state ไปด้วย
//       }
//     } else {
//       socket.emit('game-full', 'The game is already full.');
//     }
//   });
//   // socket.on('place-ships', (ships) => {
//   //     gameManager.placeShips(socket.id, ships);
//   //     // แจ้งทุกคนให้ทราบสถานะล่าสุด (เผื่อต้องแสดงผลว่าใครวางเสร็จแล้ว)
//   //     io.emit('update-game-state', gameManager.getGameState());
//   // });
//   // เพิ่มการดักฟังอีเวนต์เมื่อผู้เล่นวางเรือ
//   // เมื่อผู้เล่นส่งอีเวนต์ 'place-ships'
//   socket.on('place-ships', (ships) => {
//     gameManager.placeShips(socket.id, ships, io);
//     io.emit('update-game-state', gameManager.getGameState());
//   });

//   // <-- เพิ่มส่วนนี้เข้ามาใหม่ -->
//   // เมื่อผู้เล่นส่งอีเวนต์ 'fire-shot'
//   socket.on('fire-shot', (coords) => {
//     gameManager.handleFireShot(socket.id, coords, io);
//     // ส่งสถานะเกมที่อัปเดตแล้วกลับไปให้ทุกคน
//     io.emit('update-game-state', gameManager.getGameState());
//   });
//   // <-- สิ้นสุดส่วนที่เพิ่มใหม่ -->
  

//   // เมื่อ client หลุดการเชื่อมต่อ
//   // socket.on('disconnect', () => {
//   //   console.log(`User disconnected: ${socket.id}`);
//   //   gameManager.removePlayer(socket.id);
//   //   // แจ้งผู้เล่นที่ยังอยู่ให้ทราบสถานะล่าสุด
//   //   io.emit('update-game-state', gameManager.getGameState());
//   //   io.emit('admin-update', gameManager.getGameState()); 
//   // });
//   // server.js

//   // เมื่อ client หลุดการเชื่อมต่อ
//   socket.on('disconnect', () => {
//     console.log(`User disconnected: ${socket.id}`);
    
//     // ▼▼▼ ตรวจสอบบรรทัดนี้ ▼▼▼
//     gameManager.removePlayer(socket.id, io); // ต้องมี io ส่งเข้าไปตรงนี้
    
//     io.emit('admin-update', gameManager.getGameState());
//   });

//   socket.on('place-ships', (ships) => {
//       gameManager.placeShips(socket.id, ships, io); // ส่ง io เข้าไป
//       io.emit('update-game-state', gameManager.getGameState());
//   });

//   socket.on('fire-shot', (coords) => {
//     gameManager.handleFireShot(socket.id, coords, io); // ส่ง io เข้าไป
//     // ไม่ต้อง emit จากตรงนี้แล้ว เพราะใน handleFireShot emit ให้ทุกวินาทีอยู่แล้ว
//   });
// });

// //-------------------------------------------------------------------------------------------

  
// //---------------------------------------------------------------------------------

// // เริ่มรันเซิร์ฟเวอร์
// server.listen(PORT, () => {
//   console.log(`Battleship server running on port ${PORT}`);
// });





// //


// // npm start

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
});

// เริ่มรันเซิร์ฟเวอร์
server.listen(PORT, () => {
  console.log(`Battleship server running on port ${PORT}`);
  console.log(`Admin UI available at http://localhost:${PORT}`);
});