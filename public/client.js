const socket = io();
const joinBtn = document.getElementById('joinBtn');
const playerNameInput = document.getElementById('playerName');
const roomNameInput = document.getElementById('roomName');
const lobby = document.getElementById('lobby');
const gameRoom = document.getElementById('gameRoom');
const playersList = document.getElementById('playersList');
const portfolio = document.getElementById('portfolio');
const roomListContainer = document.querySelector('#roomList .room-list-items');
const createModeBtn = document.getElementById('createModeBtn');
const joinModeBtn = document.getElementById('joinModeBtn');
const roomControls = document.querySelector('.room-controls');
const rollBtn = document.getElementById('rollBtn');
const startBtn = document.getElementById('startBtn');
const turnInfo = document.getElementById('turnInfo');
const currentRoomLabel = document.getElementById('currentRoomLabel');
const transactionNotice = document.getElementById('transactionNotice');
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
let latestState = null;
let movementAnimation = null;
let movementPhase = null;
let movementPlayerName = '';
let movementRoll = null;
let movingPlayerId = null;
let landingPosition = null;
let movementCompletionQueue = [];
let activeDecision = null;
let transactionNoticeTimeout = null;

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

function houseCost(space) {
  return Math.ceil(space.cost * 0.35);
}

function hotelCost(space) {
  return Math.ceil(space.cost * 0.6);
}

function currentRent(space) {
  if (space.hotel) return space.rent * 7;
  return space.rent * ((space.houses || 0) + 1);
}

function colorFamily(state, space) {
  return state.board.filter((candidate) => candidate.type === 'property' && candidate.color === space.color);
}

function ownsCompleteFamily(state, player, space) {
  const family = colorFamily(state, space);
  return family.length >= 2 && family.every((candidate) => candidate.owner === player.id);
}

function familyHasImprovements(state, space) {
  return colorFamily(state, space).some((candidate) => candidate.houses || candidate.hotel);
}

function canTradeProperty(state, space) {
  return !space.mortgaged && !familyHasImprovements(state, space);
}

function improvementLabel(space) {
  if (space.hotel) return 'Hotel';
  if (space.houses) return `${space.houses} casa${space.houses === 1 ? '' : 's'}`;
  return 'Sin mejoras';
}

function showTransactionNotice({ title, text, tone = 'neutral' }) {
  if (!transactionNotice) return;
  if (transactionNoticeTimeout) clearTimeout(transactionNoticeTimeout);
  transactionNotice.className = `transaction-notice ${tone === 'income' ? 'income' : tone === 'expense' ? 'expense' : ''}`;
  transactionNotice.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(text)}</span>`;
  transactionNoticeTimeout = setTimeout(() => {
    transactionNotice.classList.add('hidden');
  }, 5000);
}

function afterMovement(callback) {
  if (movementAnimation) {
    movementCompletionQueue.push(callback);
  } else {
    callback();
  }
}

function finishMovement() {
  movementPhase = null;
  movementPlayerName = '';
  movementRoll = null;
  movingPlayerId = null;
  landingPosition = null;
  movementAnimation = null;
  if (latestState) renderBoard(latestState);
  movementCompletionQueue.splice(0).forEach((callback) => callback());
}

function calculatePatrimony(state, player) {
  const equity = state.board
    .filter((space) => space.owner === player.id)
    .reduce((total, space) => total + (space.mortgaged
      ? Math.floor(space.cost / 2)
      : space.cost + ((space.houses || 0) * houseCost(space)) + (space.hotel ? hotelCost(space) : 0)), 0);
  return player.money + equity;
}

function renderGameState(state, options = {}) {
  latestState = state;
  renderPlayers(state);
  renderPortfolio(state);
  renderLobby(state);
  updateControls(state);
  if (!options.skipBoard && !movementAnimation) renderBoard(state);
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
  if (activeDecision === 'property') {
    socket.emit('propertyDecision', { action: 'pass' });
  } else if (activeDecision === 'chisme') {
    socket.emit('chismeAction', { action: 'gossip' });
  } else if (activeDecision === 'trade') {
    socket.emit('respondTrade', { accept: false });
  }
  activeDecision = null;
  cardModal.classList.add('hidden');
  modalOptions.innerHTML = '';
}

function completeDecision() {
  activeDecision = null;
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

  if (state.pendingAction && current) {
    turnInfo.textContent = state.pendingAction.type === 'debt'
      ? `Turno: ${current.name} - cuenta pendiente`
      : `Turno: ${current.name} - esperando decisión`;
  } else {
    turnInfo.textContent = current ? `Turno: ${current.name}` : 'Esperando jugadores...';
  }
  timerEl.textContent = timerEl.textContent || '00:00';

  rollBtn.disabled = !state.gameStarted || current?.id !== playerId || Boolean(state.pendingAction);
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
  renderGameState(state);
  setJoinFeedback('¡Bienvenido! Estás conectado.', 'info');
  joinBtn.textContent = 'Entrar al juego';
});

socket.on('roomList', renderRoomList);

socket.on('gameState', (state) => {
  renderGameState(state, { skipBoard: Boolean(movementAnimation) });
});

socket.on('chatMessage', (message) => {
  const el = document.createElement('div');
  el.className = `message${message.type === 'rent' ? ' rent-message' : message.type === 'trade' ? ' trade-message' : ''}`;
  el.innerHTML = `<strong>${escapeHtml(message.author)}:</strong> ${escapeHtml(message.text)}`;
  messages.appendChild(el);
  messages.scrollTop = messages.scrollHeight;
});

socket.on('transactionNotice', (notice) => afterMovement(() => showTransactionNotice(notice)));

socket.on('timer', ({ remaining }) => {
  const s = Math.max(0, Math.floor(remaining / 1000));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  timerEl.textContent = `${mm}:${ss}`;
  if (s <= 0) timerEl.textContent = '00:00';
});

socket.on('gameOver', ({ winner, finalState }) => {
  completeDecision();
  alert(`Juego terminado. Ganador: ${winner?.name || 'Nadie'}. Fortuna: ${formatLempiras(winner?.money || 0)}.`);
  rollBtn.disabled = true;
  startBtn.disabled = false;
});

socket.on('chismeOptions', ({ text, options, players }) => {
  afterMovement(() => {
  activeDecision = 'chisme';
  renderModalCard({
    title: 'Carta Chisme',
    text: `${text} Elegí qué hacer:`,
    options: options.map((option) => ({
      label: option.text,
      onClick: () => {
        if (option.kind === 'transfer' || option.kind === 'give') {
          const otherPlayers = players.filter(p => p.id !== playerId);
          if (otherPlayers.length === 0) {
            socket.emit('chismeAction', { action: 'gossip' });
            completeDecision();
            return;
          }
          renderModalCard({
            title: option.text,
            text: 'Selecciona el jugador destino:',
            options: otherPlayers.map((target) => ({
              label: target.name,
              onClick: () => {
                socket.emit('chismeAction', { action: option.kind === 'transfer' ? 'transfer' : 'give', targetId: target.id });
                completeDecision();
              }
            }))
          });
        } else {
          socket.emit('chismeAction', { action: 'gossip' });
          completeDecision();
        }
      }
    }))
  });
  });
});

socket.on('rolled', ({ playerId: pid, roll, fromPosition, toPosition }) => {
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
  animateMovement(pid, roll, fromPosition, toPosition);
});

socket.on('cardDrawn', (card) => {
  afterMovement(() => {
  activeDecision = null;
  renderModalCard({
    title: card.title || 'Carta',
    text: card.text || '',
    options: card.options || [
      {
        label: 'Aceptar',
        onClick: () => {
          completeDecision();
        }
      }
    ]
  });
  });
});

socket.on('propertyOffer', ({ property, money }) => {
  afterMovement(() => {
  activeDecision = 'property';
  renderModalCard({
    title: 'Propiedad disponible',
    text: `${property.name} cuesta ${formatLempiras(property.cost)} y cobra renta de ${formatLempiras(property.rent)}. Tu saldo: ${formatLempiras(money)}.`,
    options: [
      {
        label: `Comprar por ${formatLempiras(property.cost)}`,
        onClick: () => {
          socket.emit('propertyDecision', { action: 'buy' });
          completeDecision();
        }
      },
      {
        label: 'Pasar sin comprar',
        onClick: () => {
          socket.emit('propertyDecision', { action: 'pass' });
          completeDecision();
        }
      }
    ]
  });
  });
});

socket.on('tradeOfferReceived', (offer) => {
  activeDecision = 'trade';
  renderModalCard({
    title: 'Propuesta de intercambio',
    text: `${offer.requesterName} ofrece ${offer.offeredProperty} a cambio de tu propiedad ${offer.requestedProperty}.`,
    options: [
      {
        label: 'Aceptar intercambio',
        onClick: () => {
          socket.emit('respondTrade', { accept: true });
          completeDecision();
        }
      },
      {
        label: 'Rechazar',
        onClick: () => {
          socket.emit('respondTrade', { accept: false });
          completeDecision();
        }
      }
    ]
  });
});

socket.on('tradeOfferClosed', () => {
  if (activeDecision === 'trade') completeDecision();
});

socket.on('actionFeedback', (message) => {
  activeDecision = null;
  renderModalCard({
    title: 'Banco',
    text: message,
    options: [{ label: 'Entendido', onClick: completeDecision }]
  });
});

socket.on('debtWarning', ({ balance, mortgageValue, needed, reason }) => {
  activeDecision = 'debt';
  renderModalCard({
    title: 'Cuenta pendiente',
    text: `${reason} Tu saldo es ${formatLempiras(balance)}. Vende mejoras o hipoteca propiedades por al menos ${formatLempiras(needed)} para continuar. Disponible en liquidacion: ${formatLempiras(mortgageValue)}.`,
    options: [
      {
        label: 'Ir a Mis lugares',
        onClick: completeDecision
      },
      {
        label: 'Declararme en quiebra',
        onClick: () => {
          socket.emit('declareBankruptcy');
          completeDecision();
        }
      }
    ]
  });
});

socket.on('eliminated', ({ reason }) => {
  completeDecision();
  renderModalCard({
    title: 'Quedaste fuera',
    text: `${reason} Tu saldo llego a cero.`,
    options: [{ label: 'Ver resultado', onClick: completeDecision }]
  });
});

function renderPlayers(state) {
  playersList.innerHTML = '<h2>Jugadores</h2>';
  state.players.forEach((player) => {
    const improvements = state.board
      .filter((space) => space.owner === player.id && (space.houses || space.hotel))
      .map((space) => `${space.name} (${improvementLabel(space)})`)
      .join(', ');
    const card = document.createElement('div');
    card.className = 'player-card';
    card.innerHTML = `
      <div style="display:flex;align-items:center;"><img src="${escapeHtml(player.avatar || 'assets/avatar1.svg')}" class="player-avatar" alt="avatar"> <strong>${escapeHtml(player.name)}</strong></div>
      <div class="money">Fortuna: ${formatLempiras(player.money)}</div>
      <div>Patrimonio: ${formatLempiras(calculatePatrimony(state, player))}</div>
      <div>Posición: ${player.position}</div>
      <div>Propiedades: ${escapeHtml(player.properties.join(', ') || 'Ninguna')}</div>
      ${improvements ? `<div>Mejoras: ${escapeHtml(improvements)}</div>` : ''}
    `;
    playersList.appendChild(card);
  });
}

function renderPortfolio(state) {
  const player = state.players.find((candidate) => candidate.id === playerId);
  portfolio.innerHTML = '<h2>Mis lugares</h2>';
  if (!player) {
    portfolio.innerHTML += '<div class="empty">Ya no participás en esta partida.</div>';
    return;
  }

  const properties = state.board.filter((space) => space.owner === playerId);
  const requestedProperties = state.board.filter((space) => space.owner && space.owner !== playerId && canTradeProperty(state, space));
  if (!properties.length) {
    portfolio.innerHTML += '<div class="empty">Todavía no tenés propiedades.</div>';
    return;
  }

  if (state.pendingAction?.type === 'debt' && state.pendingAction.playerId === playerId) {
    const warning = document.createElement('div');
    warning.className = 'debt-banner';
    warning.textContent = 'Tenés una deuda pendiente: hipotecá propiedades para seguir jugando.';
    portfolio.appendChild(warning);
  }
  if (state.tradeOffer) {
    const offer = document.createElement('div');
    offer.className = 'trade-banner';
    offer.textContent = `${state.tradeOffer.requesterName} ofrece ${state.tradeOffer.offeredProperty} por ${state.tradeOffer.requestedProperty}.`;
    portfolio.appendChild(offer);
  }

  properties.forEach((space) => {
    const item = document.createElement('div');
    item.className = `portfolio-item${space.mortgaged ? ' mortgaged' : ''}`;
    const hasImprovements = Boolean(space.houses || space.hotel);
    const family = colorFamily(state, space);
    const completeFamily = ownsCompleteFamily(state, player, space);
    item.innerHTML = `
      <div>
        <strong>${escapeHtml(space.name)}</strong>
        <span>${space.mortgaged ? 'Hipotecada: sin renta' : `Renta actual ${formatLempiras(currentRent(space))}`}</span>
        <span class="improvement-status">${escapeHtml(improvementLabel(space))}</span>
        <span class="family-status ${completeFamily ? 'complete' : ''}">${family.length >= 2 ? `Familia: ${family.filter((candidate) => candidate.owner === playerId).length}/${family.length}` : 'Sin familia construible'}</span>
      </div>
    `;
    const button = document.createElement('button');
    button.type = 'button';
    const resolvingDebt = state.pendingAction?.type === 'debt' && state.pendingAction.playerId === playerId;
    const improvedFamily = familyHasImprovements(state, space);
    button.disabled = !state.gameStarted || (resolvingDebt && space.mortgaged) || (!space.mortgaged && improvedFamily);
    button.title = improvedFamily && !space.mortgaged ? 'Vende las mejoras de la familia antes de hipotecar.' : '';
    button.textContent = space.mortgaged
      ? `Recuperar ${formatLempiras(Math.ceil(space.cost * 0.55))}`
      : `Hipotecar ${formatLempiras(Math.floor(space.cost / 2))}`;
    button.addEventListener('click', () => {
      socket.emit('mortgageProperty', { propertyName: space.name });
    });
    const actions = document.createElement('div');
    actions.className = 'portfolio-actions';
    actions.appendChild(button);
    if (!space.hotel) {
      const buildButton = document.createElement('button');
      const buildsHotel = space.houses === 4;
      buildButton.type = 'button';
      buildButton.className = 'build-button';
      buildButton.disabled = !state.gameStarted || space.mortgaged || resolvingDebt || !completeFamily;
      buildButton.title = completeFamily ? '' : 'Compra toda la familia del mismo color para construir.';
      buildButton.textContent = buildsHotel
        ? `Hotel ${formatLempiras(hotelCost(space))}`
        : `Casa ${formatLempiras(houseCost(space))}`;
      buildButton.addEventListener('click', () => {
        socket.emit('upgradeProperty', { propertyName: space.name });
      });
      actions.appendChild(buildButton);
    }
    if (canTradeProperty(state, space) && requestedProperties.length) {
      const tradeButton = document.createElement('button');
      tradeButton.type = 'button';
      tradeButton.className = 'trade-button';
      tradeButton.disabled = !state.gameStarted || Boolean(state.pendingAction) || Boolean(state.tradeOffer);
      tradeButton.textContent = 'Intercambiar';
      tradeButton.addEventListener('click', () => {
        renderModalCard({
          title: 'Proponer intercambio',
          text: `Ofrecerás ${space.name}. Elegí qué propiedad querés recibir:`,
          options: requestedProperties.map((requested) => {
            const owner = state.players.find((candidate) => candidate.id === requested.owner);
            return {
              label: `${requested.name} de ${owner?.name || 'jugador'}`,
              onClick: () => {
                socket.emit('proposeTrade', {
                  offeredProperty: space.name,
                  requestedProperty: requested.name,
                  targetId: requested.owner
                });
                completeDecision();
              }
            };
          })
        });
      });
      actions.appendChild(tradeButton);
    }
    if (hasImprovements) {
      const sellButton = document.createElement('button');
      const refund = space.hotel ? Math.floor(hotelCost(space) / 2) : Math.floor(houseCost(space) / 2);
      sellButton.type = 'button';
      sellButton.className = 'sell-button';
      sellButton.disabled = !state.gameStarted || space.mortgaged;
      sellButton.textContent = `Vender mejora +${formatLempiras(refund)}`;
      sellButton.addEventListener('click', () => {
        socket.emit('sellImprovement', { propertyName: space.name });
      });
      actions.appendChild(sellButton);
    }
    item.appendChild(actions);
    portfolio.appendChild(item);
  });
}

function animateMovement(pid, roll, fromPosition, toPosition) {
  if (!latestState || !Number.isInteger(fromPosition) || !Number.isInteger(toPosition)) return;
  const animatedState = JSON.parse(JSON.stringify(latestState));
  const player = animatedState.players.find((candidate) => candidate.id === pid);
  if (!player) return;
  if (movementAnimation) clearTimeout(movementAnimation);
  player.position = fromPosition;
  movementPhase = 'rolling';
  movementPlayerName = player.name;
  movementRoll = roll;
  movingPlayerId = pid;
  landingPosition = null;
  renderBoard(animatedState);
  let step = 0;
  const move = () => {
    movementPhase = 'moving';
    step += 1;
    player.position = (fromPosition + step) % animatedState.board.length;
    renderBoard(animatedState);
    if (step < roll) {
      movementAnimation = setTimeout(move, 250);
    } else {
      movementPhase = 'landed';
      landingPosition = toPosition;
      if (latestState) renderBoard(latestState);
      movementAnimation = setTimeout(finishMovement, 650);
    }
  };
  movementAnimation = setTimeout(move, 900);
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
          <div class="board-seal${movementPhase ? ' dimmed' : ''}">
            <span class="board-stars">★ ★ ★ ★ ★</span>
            <strong>Catrachópolis</strong>
            <small>SAN PEDRO SULA</small>
            <p>Comprá. Negociá. Ganá.</p>
          </div>
          ${movementPhase ? `<div class="center-roll ${movementPhase}"><span>${escapeHtml(movementPlayerName)}</span><strong>${movementRoll}</strong><small>${movementPhase === 'rolling' ? 'LANZANDO DADO' : movementPhase === 'moving' ? 'AVANZANDO' : 'LLEGO A SU DESTINO'}</small></div>` : ''}
        `;
        grid.appendChild(cell);
      }
      continue;
    }

    const boardIdx = perimeter.indexOf(idx);
    if (boardIdx !== -1 && boardIdx < state.board.length) {
      const space = state.board[boardIdx];
      const owner = state.players.find((p) => p.id === space.owner);
      if (space.mortgaged) cell.classList.add('mortgaged');
      if (movingPlayerId && state.players.some((player) => player.id === movingPlayerId && player.position === boardIdx)) {
        cell.classList.add('movement-space');
      }
      if (landingPosition === boardIdx) cell.classList.add('landing-space');
      cell.innerHTML = `
        <div class="title">${boardIdx}. ${escapeHtml(space.name)}</div>
        ${space.type === 'property' ? `<div class="space-price">${formatLempiras(space.cost)}</div><div class="space-rent">${space.mortgaged ? 'HIPOTECADA' : `Renta ${formatLempiras(currentRent(space))}`}</div>${(space.houses || space.hotel) ? `<div class="space-upgrade">${escapeHtml(improvementLabel(space))}</div>` : ''}<div class="space-owner">${escapeHtml(owner?.name || 'Disponible')}</div>` : `<div class="space-event">${space.eventType === 'chisme' ? 'Chisme' : space.eventType === 'tragedia' ? 'Tragedia' : space.eventType === 'premio' ? 'Premio' : escapeHtml(space.name)}</div>`}
      `;

      if (space.color) {
        const band = document.createElement('div');
        band.className = 'color-band';
        band.style.background = space.color;
        cell.appendChild(band);
      } else if (space.type === 'event') {
        const band = document.createElement('div');
        band.className = 'color-band';
        band.style.background = space.eventType === 'chisme' ? '#9b59b6' : space.eventType === 'premio' ? '#f3c858' : '#95a5a6';
        cell.appendChild(band);
      }

      const tokensWrap = document.createElement('div');
      tokensWrap.className = 'tokens';
      state.players.forEach((player, pi) => {
        if (player.position === boardIdx) {
          // show avatar thumbnail as token if available
          const img = document.createElement('img');
          img.className = `token-avatar${player.id === movingPlayerId ? ' moving-token' : ''}`;
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
