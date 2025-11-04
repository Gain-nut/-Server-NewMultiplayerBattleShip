// server-ui/script.js

// Connect to the same-origin Socket.IO server (http://localhost:3001)
const socket = io();

// --- DOM refs (defensive: some may not exist depending on your HTML) ---
const statusEl      = document.getElementById('status') || document.getElementById('statusTxt');
const playerCountEl = document.getElementById('player-count');
const resetButton   = document.getElementById('reset-button');
const logBox        = document.getElementById('log');
const clearBtn      = document.getElementById('clear-logs');   // only Clear now
const autoScrollChk = document.getElementById('autoscroll');   // optional

// --- helpers ---
function timeNow() {
  return new Date().toLocaleTimeString();
}

// Append a line into #log (works for <pre> or <div>)
function appendLogLine(text) {
  if (!logBox) return;
  const entry = `[${timeNow()}] ${text}`;

  if (logBox.tagName === 'PRE' || logBox.tagName === 'TEXTAREA') {
    logBox.textContent += entry + '\n';
  } else {
    const div = document.createElement('div');
    div.className = 'line';
    div.textContent = entry;
    logBox.appendChild(div);
  }

  // auto-scroll if checkbox exists and is checked (or if checkbox not present)
  const shouldAutoScroll = !autoScrollChk || autoScrollChk.checked;
  if (shouldAutoScroll) {
    logBox.scrollTop = logBox.scrollHeight;
  }
}

// --- socket events ---
socket.on('connect', () => {
  if (statusEl) statusEl.textContent = 'Connected';
  appendLogLine('Admin UI connected.');
});

socket.on('disconnect', () => {
  if (statusEl) statusEl.textContent = 'Disconnected';
  appendLogLine('Admin UI disconnected.');
});

// Existing admin-update handler
socket.on('admin-update', updatePlayerCount);
socket.on('update-game-state', updatePlayerCount); // <- NEW: also listen here

function updatePlayerCount(gameState = {}) {
  if (playerCountEl) {
    const count = gameState.players ? Object.keys(gameState.players).length : 0;
    playerCountEl.textContent = count;
  }
}

socket.on('log-message', (msg) => {
  appendLogLine(msg);
});

// --- UI actions ---
if (resetButton) {
  resetButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset the game and all scores?')) {
      socket.emit('admin-reset-game');
    }
  });
}

if (clearBtn && logBox) {
  clearBtn.addEventListener('click', () => {
    if (logBox.tagName === 'PRE' || logBox.tagName === 'TEXTAREA') {
      logBox.textContent = '';
    } else {
      logBox.innerHTML = '';
    }
    appendLogLine('Logs cleared.');
  });
}
