const socket = io();
const joinBtn = document.getElementById('joinBtn');
const playerNameInput = document.getElementById('playerName');
const roomNameInput = document.getElementById('roomName');
const lobby = document.getElementById('lobby');
const gameRoom = document.getElementById('gameRoom');
const playersList = document.getElementById('playersList');
const roomListContainer = document.querySelector('#roomList .room-list-items');
const createModeBtn = document.getElementById('createModeBtn');
const joinModeBtn = document.getElementById('joinModeBtn');
const roomControls = document.querySelector('.room-controls');
const rollBtn = document.getElementById('rollBtn');
const startBtn = document.getElementById('startBtn');
const turnInfo = document.getElementById('turnInfo');
const currentRoomLabel = document.getElementById('currentRoomLabel');
const messages = document.getElementById('messages');
const chatText = document.getElementById('chatText');
const sendBtn = document.getElementById('sendBtn');
const timerEl = document.getElementById('timer');
const diceEl = document.getElementById('dice');
const diceFace = document.getElementById('diceFace');
const cardModal = document.getElementById('cardModal');
const modalTitle = document.getElementById('modalTitle');
const modalText = document.getElementById('modalText');
const modalOptions = document.getElementById('modalOptions');
const modalClose = document.getElementById('modalClose');
const joinFeedback = document.getElementById('joinFeedback');
const lobbyPlayers = document.querySelector('#lobbyPlayers .player-list-items');

let playerId = null;
let playerName = '';
let currentRoomId = null;
let currentRoomName = '';

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[character]));
}

function formatLempiras(value) {
  return `L ${new Intl.NumberFormat('es-HN').format(value)}`;
}

joinBtn.addEventListener('click', () => {
  playerName = playerNameInput.value.trim() || 'Jugador';
  const roomName = roomNameInput.value.trim() || 'Sala 1';
  const avatar = document.querySelector('input[name="avatar"]:checked')?.value || 'assets/avatar1.svg';
  setJoinFeedback('Conectando...', 'info');
  joinBtn.disabled = true;
  // emit join request (server will create room if it doesn't exist)
  socket.emit('joinGame', { name: playerName, avatar, room: roomName });
});

// Mode toggle: create vs join
function setModeCreate() {
  createModeBtn.classList.add('active');
  joinModeBtn.classList.remove('active');
  roomListContainer.parentElement.classList.add('hidden');
  roomNameInput.placeholder = 'Nueva sala (Ej: Sala Las Palmas)';
}

function setModeJoin() {
  createModeBtn.classList.remove('active');
  joinModeBtn.classList.add('active');
  roomListContainer.parentElement.classList.remove('hidden');
  roomNameInput.placeholder = 'Selecciona una sala o escribe su nombre';
  socket.emit('getRoomList');
}

createModeBtn?.addEventListener('click', setModeCreate);
joinModeBtn?.addEventListener('click', setModeJoin);

// default mode
setModeCreate();

startBtn.addEventListener('click', () => {
  socket.emit('startGame');
});

sendBtn.addEventListener('click', () => {
  const text = chatText.value.trim();
  if (!text) return;
  socket.emit('sendMessage', text);
  chatText.value = '';
});

chatText.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') sendBtn.click();
});

rollBtn.addEventListener('click', () => {
  // trigger roll and show local animation; server will send 'rolled' with actual value
  socket.emit('rollDice');
  diceEl.classList.add('rolling');
  diceFace.textContent = '...';
  rollBtn.disabled = true;
});

diceEl.addEventListener('click', () => {
  // same as pressing roll
  if (!rollBtn.disabled) rollBtn.click();
});

modalClose.addEventListener('click', () => {
  closeModal();
});

cardModal.addEventListener('click', (event) => {
  if (event.target === cardModal) closeModal();
});

function openModal() {
  cardModal.classList.remove('hidden');
}

function closeModal() {
  cardModal.classList.add('hidden');
  modalOptions.innerHTML = '';
}

function setJoinFeedback(message, type = 'error') {
  joinFeedback.textContent = message;
  joinFeedback.classList.remove('hidden');
  if (type === 'info') {
    joinFeedback.style.background = 'rgba(39, 174, 96, 0.15)';
    joinFeedback.style.borderColor = 'rgba(39, 174, 96, 0.25)';
  } else {
    joinFeedback.style.background = 'rgba(243, 156, 18, 0.15)';
    joinFeedback.style.borderColor = 'rgba(243, 156, 18, 0.25)';
  }
}

function renderLobby(state) {
  if (!lobbyPlayers) return;
  lobbyPlayers.innerHTML = '';
  if (!state.players.length) {
    lobbyPlayers.innerHTML = '<div class="empty">Esperando jugadores...</div>';
    return;
  }
  state.players.forEach((player, index) => {
    const item = document.createElement('div');
    item.className = `lobby-player-item${player.id === playerId ? ' active' : ''}`;
    item.innerHTML = `
      <img src="${escapeHtml(player.avatar || 'assets/avatar1.svg')}" class="player-avatar" alt="avatar">
      <span>${escapeHtml(player.name)}</span>
      ${index === 0 ? '<span class="host-badge">Anfitrión</span>' : ''}
      ${player.id === playerId ? '<span class="self-badge">Tú</span>' : ''}
    `;
    lobbyPlayers.appendChild(item);
  });
}

function updateControls(state) {
  const current = state.players[state.currentTurnIndex];
  const amHost = state.players[0]?.id === playerId;
  const enoughPlayers = state.players.length >= 2;

  turnInfo.textContent = current ? `Turno: ${current.name}` : 'Esperando jugadores...';
  timerEl.textContent = timerEl.textContent || '00:00';

  rollBtn.disabled = !state.gameStarted || current?.id !== playerId;
  startBtn.disabled = !amHost || state.gameStarted || !enoughPlayers;

  if (!amHost) {
    startBtn.textContent = 'Esperando anfitrión';
  } else if (state.gameStarted) {
    startBtn.textContent = 'Juego en curso';
  } else {
    startBtn.textContent = 'Iniciar juego';
  }
}

function renderModalCard({ title, text, options }) {
  modalTitle.textContent = title;
  modalText.textContent = text;
  modalOptions.innerHTML = '';
  if (options && options.length) {
    options.forEach((option) => {
      const button = document.createElement('button');
      button.className = 'modal-option-button';
      button.textContent = option.label;
      button.addEventListener('click', () => {
        option.onClick();
      });
      modalOptions.appendChild(button);
    });
  }
  openModal();
}

function renderRoomList(rooms) {
  if (!roomListContainer) return;
  roomListContainer.innerHTML = '';
  if (!rooms.length) {
    roomListContainer.innerHTML = '<div class="empty">No hay salas activas. Crea una sala nueva al entrar.</div>';
    return;
  }
  rooms.forEach((room) => {
    const item = document.createElement('div');
    item.className = 'room-item';
    item.innerHTML = `
      <div>
        <strong>${escapeHtml(room.name)}</strong>
        <div class="room-meta">${room.players} / 4 jugadores · ${room.started ? 'En curso' : 'En espera'}</div>
      </div>
      <button type="button">Unirse</button>
    `;
    item.querySelector('button').addEventListener('click', () => {
      roomNameInput.value = room.name;
      roomNameInput.focus();
    });
    roomListContainer.appendChild(item);
  });
}

socket.on('connect', () => {
  playerId = socket.id;
  socket.emit('getRoomList');
});

socket.on('joinError', (msg) => {
  setJoinFeedback(msg, 'error');
  lobby.classList.remove('hidden');
  gameRoom.classList.add('hidden');
  joinBtn.disabled = false;
  joinBtn.textContent = 'Entrar al juego';
});

socket.on('joinSuccess', ({ playerId: id, state, roomId, roomName }) => {
  playerId = id;
  currentRoomId = roomId;
  currentRoomName = roomName;
  currentRoomLabel.textContent = `Sala: ${roomName}`;
  lobby.classList.add('hidden');
  gameRoom.classList.remove('hidden');
  renderPlayers(state);
  renderBoard(state);
  renderLobby(state);
  updateControls(state);
  setJoinFeedback('¡Bienvenido! Estás conectado.', 'info');
  joinBtn.textContent = 'Entrar al juego';
});

socket.on('roomList', renderRoomList);

socket.on('gameState', (state) => {
  renderPlayers(state);
  renderBoard(state);
  renderLobby(state);
  updateControls(state);
});

socket.on('chatMessage', (message) => {
  const el = document.createElement('div');
  el.className = 'message';
  el.innerHTML = `<strong>${escapeHtml(message.author)}:</strong> ${escapeHtml(message.text)}`;
  messages.appendChild(el);
  messages.scrollTop = messages.scrollHeight;
});

socket.on('timer', ({ remaining }) => {
  const s = Math.max(0, Math.floor(remaining / 1000));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  timerEl.textContent = `${mm}:${ss}`;
  if (s <= 0) timerEl.textContent = '00:00';
});

socket.on('gameOver', ({ winner, finalState }) => {
  alert(`Juego terminado. Ganador: ${winner?.name || 'Nadie'}. Fortuna: ${formatLempiras(winner?.money || 0)}.`);
  rollBtn.disabled = true;
  startBtn.disabled = false;
});

socket.on('chismeOptions', ({ options, players }) => {
  renderModalCard({
    title: 'Carta Chisme',
    text: 'Elige qué hacer con el chisme:',
    options: options.map((option) => ({
      label: option.text,
      onClick: () => {
        if (option.kind === 'transfer' || option.kind === 'give') {
          const otherPlayers = players.filter(p => p.id !== playerId);
          if (otherPlayers.length === 0) {
            socket.emit('chismeAction', { action: 'gossip' });
            closeModal();
            return;
          }
          renderModalCard({
            title: option.text,
            text: 'Selecciona el jugador destino:',
            options: otherPlayers.map((target) => ({
              label: target.name,
              onClick: () => {
                socket.emit('chismeAction', { action: option.kind === 'transfer' ? 'transfer' : 'give', targetId: target.id });
                closeModal();
              }
            }))
          });
        } else {
          socket.emit('chismeAction', { action: 'gossip' });
          closeModal();
        }
      }
    }))
  });
});

socket.on('rolled', ({ playerId: pid, roll }) => {
  // animate dice briefly and show roll
  diceEl.classList.add('rolling');
  setTimeout(() => {
    diceEl.classList.remove('rolling');
    diceFace.textContent = roll;
  }, 700);
  // if this client rolled, keep rollBtn disabled until gameState updates
  if (pid === playerId) {
    rollBtn.disabled = true;
  }
});

socket.on('cardDrawn', (card) => {
  renderModalCard({
    title: card.title || 'Carta',
    text: card.text || '',
    options: card.options || [
      {
        label: 'Aceptar',
        onClick: () => {
          closeModal();
        }
      }
    ]
  });
});

function renderPlayers(state) {
  playersList.innerHTML = '<h2>Jugadores</h2>';
  state.players.forEach((player) => {
    const card = document.createElement('div');
    card.className = 'player-card';
    card.innerHTML = `
      <div style="display:flex;align-items:center;"><img src="${escapeHtml(player.avatar || 'assets/avatar1.svg')}" class="player-avatar" alt="avatar"> <strong>${escapeHtml(player.name)}</strong></div>
      <div class="money">Fortuna: ${formatLempiras(player.money)}</div>
      <div>Posición: ${player.position}</div>
      <div>Propiedades: ${escapeHtml(player.properties.join(', ') || 'Ninguna')}</div>
    `;
    playersList.appendChild(card);
  });
}

function renderBoard(state) {
  const grid = document.getElementById('boardGrid');
  grid.innerHTML = '';

  const N = 11;
  const total = N * N;

  // build perimeter indices in grid order
  const perimeter = [];
  for (let c = 0; c < N; c++) perimeter.push(0 * N + c); // top
  for (let r = 1; r < N - 1; r++) perimeter.push(r * N + (N - 1)); // right
  for (let c = N - 1; c >= 0; c--) perimeter.push((N - 1) * N + c); // bottom
  for (let r = N - 2; r >= 1; r--) perimeter.push(r * N + 0); // left

  for (let idx = 0; idx < total; idx++) {
    const cell = document.createElement('div');
    cell.className = 'space';

    const r = Math.floor(idx / N);
    const c = idx % N;

    // center area
    if (r >= 1 && r <= N - 2 && c >= 1 && c <= N - 2) {
      cell.classList.add('center');
      if (r === 1 && c === 1) {
        cell.innerHTML = `
          <div class="board-seal">
            <span class="board-stars">★ ★ ★ ★ ★</span>
            <strong>Catrachópolis</strong>
            <small>SAN PEDRO SULA</small>
            <p>Comprá. Negociá. Ganá.</p>
          </div>
        `;
        grid.appendChild(cell);
      }
      continue;
    }

    const boardIdx = perimeter.indexOf(idx);
    if (boardIdx !== -1 && boardIdx < state.board.length) {
      const space = state.board[boardIdx];
      const owner = state.players.find((p) => p.id === space.owner);
      cell.innerHTML = `
        <div class="title">${boardIdx}. ${escapeHtml(space.name)}</div>
        ${space.type === 'property' ? `<div class="space-price">${formatLempiras(space.cost)}</div><div class="space-rent">Renta ${formatLempiras(space.rent)}</div><div class="space-owner">${escapeHtml(owner?.name || 'Disponible')}</div>` : `<div class="space-event">${space.eventType === 'chisme' ? 'Chisme' : space.eventType === 'tragedia' ? 'Tragedia' : escapeHtml(space.name)}</div>`}
      `;

      if (space.color) {
        const band = document.createElement('div');
        band.className = 'color-band';
        band.style.background = space.color;
        cell.appendChild(band);
      } else if (space.type === 'event') {
        const band = document.createElement('div');
        band.className = 'color-band';
        band.style.background = space.eventType === 'chisme' ? '#9b59b6' : '#95a5a6';
        cell.appendChild(band);
      }

      const tokensWrap = document.createElement('div');
      tokensWrap.className = 'tokens';
      state.players.forEach((player, pi) => {
        if (player.position === boardIdx) {
          // show avatar thumbnail as token if available
          const img = document.createElement('img');
          img.className = 'token-avatar';
          img.src = player.avatar || 'assets/avatar1.svg';
          img.title = player.name;
          img.style.width = '22px';
          img.style.height = '22px';
          img.style.borderRadius = '4px';
          tokensWrap.appendChild(img);
        }
      });
      cell.appendChild(tokensWrap);
    }

    grid.appendChild(cell);
  }
}
