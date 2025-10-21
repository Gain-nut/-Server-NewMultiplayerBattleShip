const socket = io();
const statusEl = document.getElementById('status');
const playerCountEl = document.getElementById('player-count');
const resetButton = document.getElementById('reset-button');

socket.on('connect', () => {
    statusEl.textContent = 'Connected';
});

socket.on('disconnect', () => {
    statusEl.textContent = 'Disconnected';
});


socket.on('admin-update', (gameState) => {
    playerCountEl.textContent = Object.keys(gameState.players).length;
});

resetButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset the game and all scores?')) {
        socket.emit('admin-reset-game');
    }
    
});
// Changes
const logBox = document.getElementById('log');

socket.on('log-message', (msg) => {
  const time = new Date().toLocaleTimeString();
  logBox.textContent += `[${time}] ${msg}\n`;
  logBox.scrollTop = logBox.scrollHeight; // auto-scroll to latest line
});
// End changes