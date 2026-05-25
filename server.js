require('dotenv').config({ quiet: true });

const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const MAX_PLAYERS = 4;
const GAME_DURATION = 30 * 60 * 1000;
const STARTING_MONEY = 1000;
const SALIDA_BONUS = 200;
const DECISION_TIMEOUT = 20000;
const MAX_HOUSES = 4;

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const rooms = Object.create(null);
const roomTimers = Object.create(null);
const actionTimers = Object.create(null);
const reservedNames = ['sistema', 'juego', 'admin', 'administrador'];

const eventCards = {
  chisme: [
    { text: 'En la pulperia aseguran que un vecino debe favores. Resolve el rumor.', options: ['gossip', 'give'] },
    { text: 'Un audio comprometedor se compartio en el grupo de la colonia.', options: ['gossip', 'give', 'transfer'] },
    { text: 'Se supo quien se estaciona siempre en doble fila en Circunvalacion.', options: ['gossip', 'give'] },
    { text: 'Aparecio una foto vieja de la feria patronal y todos preguntan.', options: ['gossip', 'transfer'] },
    { text: 'Tu tia llevo el cuento completo a la reunion familiar.', options: ['gossip', 'give', 'transfer'] },
    { text: 'Un mensaje de voz se envio al chat equivocado.', options: ['gossip', 'give'] },
    { text: 'Dicen que conseguiste precio especial en el mercado.', options: ['gossip', 'give'] },
    { text: 'La cuadra comenta una remodelacion misteriosa.', options: ['gossip', 'transfer'] },
    { text: 'Un vecino afirma que tu negocio tiene nuevo socio.', options: ['gossip', 'give', 'transfer'] },
    { text: 'Alguien publico un recibo que no debia verse.', options: ['gossip', 'give'] },
    { text: 'La sobremesa se puso intensa con historias de terrenos.', options: ['gossip', 'transfer'] },
    { text: 'El grupo escolar revivio una anécdota tuya.', options: ['gossip', 'give'] },
    { text: 'Una llamada en altavoz revelo mas de la cuenta.', options: ['gossip', 'give', 'transfer'] },
    { text: 'La barberia ya tiene una version de tus negocios.', options: ['gossip', 'give'] },
    { text: 'Corren rumores sobre una casa con nuevo dueno.', options: ['gossip', 'transfer'] },
    { text: 'El conductor del bus conto una historia demasiado detallada.', options: ['gossip', 'give'] },
    { text: 'Un familiar quiere arreglar el chisme antes de la cena.', options: ['gossip', 'give', 'transfer'] },
    { text: 'La fila del banco sabe mas de lo que deberia.', options: ['gossip', 'give'] },
    { text: 'La colonia organiza una reunion y tu nombre salio primero.', options: ['gossip', 'transfer'] },
    { text: 'Una captura de pantalla circula sin contexto.', options: ['gossip', 'give', 'transfer'] }
  ],
  tragedia: [
    { text: 'Se dano tu carro en el bulevar: pagaste 150 Lps.', amount: 150 },
    { text: 'Una llanta se arruino con un bache: pagaste 100 Lps.', amount: 100 },
    { text: 'Te cayo una factura electrica elevada: pagaste 180 Lps.', amount: 180 },
    { text: 'Lluvia fuerte dano el techo: pagaste 220 Lps.', amount: 220 },
    { text: 'Un reten te aplico una multa: pagaste 125 Lps.', amount: 125 },
    { text: 'Tu celular sufrio una caida costosa: pagaste 160 Lps.', amount: 160 },
    { text: 'Se averio la refrigeradora de la casa: pagaste 240 Lps.', amount: 240 },
    { text: 'Perdiste la billetera en el mercado: perdiste 130 Lps.', amount: 130 },
    { text: 'Un pedido llego equivocado y no tuvo reembolso: pagaste 90 Lps.', amount: 90 },
    { text: 'La tuberia de agua necesita reparacion: pagaste 200 Lps.', amount: 200 },
    { text: 'Una infraccion de estacionamiento te costo 110 Lps.', amount: 110 },
    { text: 'El aire acondicionado dejo de funcionar: pagaste 210 Lps.', amount: 210 },
    { text: 'Olvidaste renovar un tramite y pagaste recargo: 140 Lps.', amount: 140 },
    { text: 'Tu mascota necesito visita urgente al veterinario: pagaste 170 Lps.', amount: 170 },
    { text: 'Una gotera dano tus muebles: pagaste 230 Lps.', amount: 230 },
    { text: 'Te quedaste sin combustible en plena ruta: pagaste 95 Lps.', amount: 95 },
    { text: 'Un vidrio roto requirio reemplazo: pagaste 155 Lps.', amount: 155 },
    { text: 'La conexion de internet fallo antes de una entrega: pagaste 105 Lps.', amount: 105 },
    { text: 'Se extravio un paquete importante: pagaste 135 Lps.', amount: 135 },
    { text: 'Un cobro bancario inesperado redujo tu saldo: pagaste 120 Lps.', amount: 120 }
  ],
  premio: [
    { text: 'Ganaste la loteria del barrio: recibiste 300 Lps.', amount: 300 },
    { text: 'Tu emprendimiento tuvo un excelente fin de semana: recibiste 180 Lps.', amount: 180 },
    { text: 'Ganaste un sorteo de la feria: recibiste 150 Lps.', amount: 150 },
    { text: 'Te devolvieron un deposito pendiente: recibiste 120 Lps.', amount: 120 },
    { text: 'Vendiste una artesania en el bazar: recibiste 100 Lps.', amount: 100 },
    { text: 'Cobraste un trabajo extra: recibiste 160 Lps.', amount: 160 },
    { text: 'Recibiste un reembolso inesperado: recibiste 90 Lps.', amount: 90 },
    { text: 'Tu pulperia tuvo buenas ventas: recibiste 140 Lps.', amount: 140 },
    { text: 'Ganaste un concurso comunitario: recibiste 200 Lps.', amount: 200 },
    { text: 'Una inversion pequena rindio frutos: recibiste 175 Lps.', amount: 175 },
    { text: 'Te pagaron una deuda antigua: recibiste 130 Lps.', amount: 130 },
    { text: 'Vendiste entradas para una actividad escolar: recibiste 110 Lps.', amount: 110 },
    { text: 'Ganaste un torneo local: recibiste 220 Lps.', amount: 220 },
    { text: 'Encontraste una oportunidad de negocio: recibiste 190 Lps.', amount: 190 },
    { text: 'Tu cosecha salio mejor de lo esperado: recibiste 210 Lps.', amount: 210 },
    { text: 'Recibiste un bono por puntualidad: recibiste 95 Lps.', amount: 95 },
    { text: 'Alquilaste tu espacio para un evento: recibiste 170 Lps.', amount: 170 },
    { text: 'Vendiste comida en un partido: recibiste 125 Lps.', amount: 125 },
    { text: 'Ganaste una rifa solidaria: recibiste 250 Lps.', amount: 250 },
    { text: 'Tu proyecto recibio apoyo comunitario: recibiste 155 Lps.', amount: 155 }
  ]
};

const chismeActions = {
  gossip: { kind: 'gossip', text: 'Contar tu version y seguir adelante.' },
  give: { kind: 'give', text: 'Calmar el rumor dando 200 Lps. a alguien.' },
  transfer: { kind: 'transfer', text: 'Cerrar el trato transfiriendo una propiedad.' }
};

function property(name, cost, rent, color) {
  return { name, type: 'property', cost, rent, color, owner: null, mortgaged: false, houses: 0, hotel: false };
}

function event(name, eventType) {
  return { name, type: 'event', eventType, owner: null };
}

function createBoard() {
  return [
    { name: 'Salida', type: 'start', owner: null },
    property('Barrio Rio de Piedras', 120, 30, '#8e44ad'),
    event('Premio de la feria', 'premio'),
    property('Colonia Trejo', 140, 35, '#8e44ad'),
    property('Los Andes', 160, 40, '#2980b9'),
    event('Tragedia en la ruta', 'tragedia'),
    property('Jardines del Valle', 180, 45, '#2980b9'),
    property('Altia', 200, 50, '#2980b9'),
    event('Chisme de oficina', 'chisme'),
    property('Universidad', 220, 55, '#0f9bb2'),
    { name: 'Presidio', type: 'presidio', owner: null },
    property('Rivera Hernandez', 230, 60, '#16a085'),
    event('Tragedia inesperada', 'tragedia'),
    property('Felipe Zelaya', 240, 65, '#16a085'),
    property('Circunvalacion', 260, 70, '#f39c12'),
    event('Chisme viral', 'chisme'),
    property('El Pedregal', 270, 75, '#f39c12'),
    property('El Sauce', 280, 80, '#f39c12'),
    event('Tragedia vehicular', 'tragedia'),
    property('Mall Galerias', 300, 85, '#c0392b'),
    event('Premio emprendedor', 'premio'),
    property('Las Palmas', 310, 90, '#c0392b'),
    event('Chisme familiar', 'chisme'),
    property('La Puerta', 320, 95, '#c0392b'),
    property('Bermejo', 330, 100, '#d35400'),
    event('Tragedia de mercado', 'tragedia'),
    property('Choloma Express', 340, 105, '#d35400'),
    property('Boulevard del Norte', 350, 110, '#d35400'),
    event('Chisme en redes', 'chisme'),
    property('Zona Industrial', 360, 115, '#27ae60'),
    event('Premio comunitario', 'premio'),
    property('El Carmen', 380, 120, '#27ae60'),
    event('Tragedia bancaria', 'tragedia'),
    property('Monte Maria', 400, 125, '#27ae60'),
    property('Residencial Campisa', 420, 130, '#2c3e50'),
    event('Chisme final', 'chisme'),
    property('Merendon', 440, 135, '#2c3e50'),
    property('El Zapotal', 460, 140, '#2c3e50'),
    event('Tragedia final', 'tragedia'),
    property('San Pedro Sula Centro', 500, 160, '#7f8c8d')
  ];
}

function getRoomState(roomId, roomName) {
  if (!rooms[roomId]) {
    rooms[roomId] = {
      id: roomId,
      name: roomName,
      players: [],
      board: createBoard(),
      currentTurnIndex: 0,
      gameStarted: false,
      endTime: null,
      pendingAction: null,
      tradeOffer: null
    };
  }
  return rooms[roomId];
}

function getActiveRooms() {
  return Object.values(rooms).map((room) => ({
    id: room.id,
    name: room.name,
    players: room.players.length,
    started: room.gameStarted
  }));
}

function broadcastRoomList() {
  io.emit('roomList', getActiveRooms());
}

function emitState(roomState) {
  io.to(roomState.id).emit('gameState', roomState);
}

function clearPendingAction(roomState) {
  if (actionTimers[roomState.id]) {
    clearTimeout(actionTimers[roomState.id]);
    delete actionTimers[roomState.id];
  }
  roomState.pendingAction = null;
}

function stopRoomGame(roomState, winner) {
  roomState.gameStarted = false;
  clearPendingAction(roomState);
  if (roomTimers[roomState.id]) {
    clearInterval(roomTimers[roomState.id]);
    delete roomTimers[roomState.id];
  }
  emitState(roomState);
  io.to(roomState.id).emit('gameOver', { winner, finalState: roomState });
  broadcastRoomList();
}

function releaseProperties(roomState, player) {
  roomState.board.forEach((space) => {
    if (space.owner === player.id) {
      space.owner = null;
      space.mortgaged = false;
      space.houses = 0;
      space.hotel = false;
    }
  });
  player.properties = [];
}

function mortgageValue(space) {
  return Math.floor(space.cost / 2);
}

function houseCost(space) {
  return Math.ceil(space.cost * 0.35);
}

function hotelCost(space) {
  return Math.ceil(space.cost * 0.6);
}

function currentRent(space) {
  if (space.hotel) return space.rent * 7;
  return space.rent * (space.houses + 1);
}

function colorFamily(roomState, space) {
  return roomState.board.filter((candidate) => candidate.type === 'property' && candidate.color === space.color);
}

function ownsCompleteFamily(roomState, player, space) {
  const family = colorFamily(roomState, space);
  return family.length >= 2 && family.every((candidate) => candidate.owner === player.id);
}

function canTradeProperty(roomState, space) {
  return space
    && space.type === 'property'
    && !space.mortgaged
    && colorFamily(roomState, space).every((candidate) => !candidate.houses && !candidate.hotel);
}

function clearTradeOffer(roomState, message) {
  if (!roomState.tradeOffer) return;
  io.to(roomState.tradeOffer.targetId).emit('tradeOfferClosed');
  roomState.tradeOffer = null;
  if (message) {
    io.to(roomState.id).emit('chatMessage', { author: 'Intercambio', text: message, type: 'trade' });
  }
  emitState(roomState);
}

function improvementResaleValue(space) {
  const housesValue = space.houses * Math.floor(houseCost(space) / 2);
  const hotelValue = space.hotel ? Math.floor(hotelCost(space) / 2) : 0;
  return housesValue + hotelValue;
}

function availableMortgageValue(roomState, player) {
  return roomState.board
    .filter((space) => space.owner === player.id && !space.mortgaged)
    .reduce((total, space) => total + mortgageValue(space) + improvementResaleValue(space), 0);
}

function eliminatePlayer(roomState, player, reason) {
  const index = roomState.players.findIndex((candidate) => candidate.id === player.id);
  if (index === -1) return false;

  player.money = 0;
  releaseProperties(roomState, player);
  roomState.players.splice(index, 1);
  if (index < roomState.currentTurnIndex) roomState.currentTurnIndex -= 1;
  if (roomState.players.length) roomState.currentTurnIndex %= roomState.players.length;
  clearPendingAction(roomState);

  io.to(roomState.id).emit('chatMessage', {
    author: 'Sistema',
    text: `${player.name} quedo sin dinero y sale de la partida. ${reason}`
  });
  io.to(player.id).emit('eliminated', { reason });

  if (roomState.players.length <= 1) {
    const winner = roomState.players[0] || null;
    stopRoomGame(roomState, winner);
  } else {
    emitState(roomState);
  }
  return true;
}

function settleOrRequestRescue(roomState, player, reason) {
  if (player.money > 0) return false;
  const rescueFunds = availableMortgageValue(roomState, player);
  if (player.money + rescueFunds <= 0) {
    return eliminatePlayer(roomState, player, reason);
  }

  clearPendingAction(roomState);
  roomState.pendingAction = { type: 'debt', playerId: player.id, reason };
  io.to(player.id).emit('debtWarning', {
    balance: player.money,
    mortgageValue: rescueFunds,
    needed: Math.abs(player.money) + 1,
    reason
  });
  io.to(roomState.id).emit('chatMessage', {
    author: 'Banco',
    text: `${player.name} tiene una cuenta pendiente y debe hipotecar para continuar.`
  });
  emitState(roomState);
  actionTimers[roomState.id] = setTimeout(() => {
    if (roomState.pendingAction?.type === 'debt' && roomState.pendingAction.playerId === player.id) {
      eliminatePlayer(roomState, player, 'No resolvio su deuda a tiempo.');
    }
  }, DECISION_TIMEOUT * 3);
  return true;
}

function finishTurn(roomState, message) {
  clearPendingAction(roomState);
  if (!roomState.players.length) return;
  io.to(roomState.id).emit('chatMessage', { author: 'Juego', text: message });
  roomState.currentTurnIndex = (roomState.currentTurnIndex + 1) % roomState.players.length;
  emitState(roomState);
}

function resolveTurnPayment(roomState, player, message, bankruptcyReason, author = 'Juego', type) {
  io.to(roomState.id).emit('chatMessage', { author, text: message, type });
  if (!settleOrRequestRescue(roomState, player, bankruptcyReason)) {
    clearPendingAction(roomState);
    roomState.currentTurnIndex = (roomState.currentTurnIndex + 1) % roomState.players.length;
    emitState(roomState);
  }
}

function isNameTaken(name, roomState) {
  const normalized = String(name).trim().toLowerCase();
  return reservedNames.includes(normalized)
    || roomState.players.some((player) => player.name.toLowerCase() === normalized);
}

function cleanString(value, maxLength) {
  return String(value || '').trim().substring(0, maxLength);
}

app.disable('x-powered-by');
app.get('/health', (req, res) => {
  res.json({ ok: true, rooms: Object.keys(rooms).length });
});
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  socket.on('getRoomList', () => {
    socket.emit('roomList', getActiveRooms());
  });

  socket.on('joinGame', (payload = {}) => {
    const details = typeof payload === 'object' && payload !== null ? payload : { name: payload };
    const roomName = cleanString(details.room || details.roomName || 'Sala 1', 20);
    const roomId = roomName.toLowerCase().replace(/\s+/g, '-');
    const name = cleanString(details.name || `Jugador ${Object.keys(rooms).length + 1}`, 20);
    const avatar = /^assets\/avatar[1-4]\.svg$/.test(details.avatar)
      ? details.avatar
      : 'assets/avatar1.svg';

    if (!name) {
      socket.emit('joinError', 'Debes ingresar un nombre valido.');
      return;
    }
    if (!roomName) {
      socket.emit('joinError', 'Debes ingresar un nombre de sala valido.');
      return;
    }

    const roomState = getRoomState(roomId, roomName);
    if (roomState.gameStarted) {
      socket.emit('joinError', 'El juego ya comenzo en esa sala. Elige otra sala o espera a que termine.');
      return;
    }
    if (isNameTaken(name, roomState)) {
      socket.emit('joinError', 'Ese nombre ya esta en uso en esta sala. Elige otro.');
      return;
    }
    if (roomState.players.length >= MAX_PLAYERS) {
      socket.emit('joinError', 'La sala ya esta llena (4 jugadores maximo).');
      return;
    }

    const player = {
      id: socket.id,
      name,
      avatar,
      position: 0,
      money: STARTING_MONEY,
      properties: [],
      skipTurns: 0
    };

    roomState.players.push(player);
    socket.data.roomId = roomId;
    socket.join(roomId);
    socket.emit('joinSuccess', { playerId: player.id, state: roomState, roomId, roomName: roomState.name });
    emitState(roomState);
    io.to(roomId).emit('chatMessage', { author: 'Sistema', text: `${player.name} se unio al juego.` });
    broadcastRoomList();
  });

  socket.on('startGame', () => {
    const roomState = rooms[socket.data.roomId];
    if (!roomState || roomState.gameStarted || roomState.players[0]?.id !== socket.id) return;
    if (roomState.players.length < 2) {
      socket.emit('chatMessage', { author: 'Sistema', text: 'Se necesitan al menos 2 jugadores para iniciar.' });
      return;
    }

    roomState.gameStarted = true;
    roomState.endTime = Date.now() + GAME_DURATION;
    io.to(roomState.id).emit('chatMessage', { author: 'Sistema', text: 'El juego comenzo. Duracion: 30 minutos.' });
    emitState(roomState);

    roomTimers[roomState.id] = setInterval(() => {
      const remaining = Math.max(0, roomState.endTime - Date.now());
      io.to(roomState.id).emit('timer', { remaining });
      if (remaining <= 0) {
        const winner = roomState.players.reduce(
          (best, player) => (player.money > (best?.money ?? -Infinity) ? player : best),
          null
        );
        stopRoomGame(roomState, winner);
      }
    }, 1000);
    broadcastRoomList();
  });

  socket.on('sendMessage', (message) => {
    const roomState = rooms[socket.data.roomId];
    const text = cleanString(message, 250);
    if (!roomState || !text) return;
    const player = roomState.players.find((candidate) => candidate.id === socket.id);
    if (!player) return;
    io.to(roomState.id).emit('chatMessage', { author: player.name, text });
  });

  socket.on('rollDice', () => {
    const roomState = rooms[socket.data.roomId];
    if (!roomState || !roomState.gameStarted || roomState.pendingAction) return;
    const playerIndex = roomState.players.findIndex((candidate) => candidate.id === socket.id);
    if (playerIndex !== roomState.currentTurnIndex) return;
    const player = roomState.players[playerIndex];
    if (roomState.tradeOffer) {
      clearTradeOffer(roomState, 'La propuesta pendiente vencio al comenzar la siguiente jugada.');
    }

    if (player.skipTurns > 0) {
      player.skipTurns -= 1;
      finishTurn(roomState, `${player.name} cumple su turno en el presidio y queda libre.`);
      return;
    }

    const roll = Math.floor(Math.random() * 6) + 1;
    const fromPosition = player.position;
    const passedSalida = fromPosition + roll >= roomState.board.length;
    player.position = (fromPosition + roll) % roomState.board.length;
    if (passedSalida) player.money += SALIDA_BONUS;

    io.to(roomState.id).emit('rolled', {
      playerId: player.id,
      roll,
      fromPosition,
      toPosition: player.position
    });
    emitState(roomState);

    const space = roomState.board[player.position];
    let actionText = `${player.name} lanzo ${roll} y llego a ${space.name}. `;
    if (passedSalida) actionText += `Paso por Salida y recibio ${SALIDA_BONUS} Lps. `;

    if (space.type === 'property') {
      if (!space.owner && player.money > space.cost) {
        roomState.pendingAction = { type: 'property', playerId: player.id, position: player.position };
        socket.emit('propertyOffer', { property: space, money: player.money });
        io.to(roomState.id).emit('chatMessage', {
          author: 'Juego',
          text: `${actionText}${player.name} decide si compra ${space.name}.`
        });
        emitState(roomState);
        actionTimers[roomState.id] = setTimeout(() => {
          if (roomState.pendingAction?.playerId === player.id) {
            finishTurn(roomState, `${player.name} dejo pasar ${space.name}.`);
          }
        }, DECISION_TIMEOUT);
      } else if (!space.owner) {
        finishTurn(roomState, `${actionText}No tiene saldo suficiente para comprar esta propiedad.`);
      } else if (space.owner !== player.id && !space.mortgaged) {
        const owner = roomState.players.find((candidate) => candidate.id === space.owner);
        const rent = currentRent(space);
        const improvement = space.hotel ? ' con hotel' : space.houses ? ` con ${space.houses} casa${space.houses === 1 ? '' : 's'}` : '';
        player.money -= rent;
        if (owner) owner.money += rent;
        socket.emit('transactionNotice', {
          title: 'Pagaste renta',
          text: `-${rent} Lps. por ${space.name}${improvement}.`,
          tone: 'expense'
        });
        if (owner) {
          io.to(owner.id).emit('transactionNotice', {
            title: 'Cobraste renta',
            text: `+${rent} Lps. de ${player.name} por ${space.name}${improvement}.`,
            tone: 'income'
          });
        }
        resolveTurnPayment(
          roomState,
          player,
          `${player.name} pago ${rent} Lps. de renta a ${owner?.name || 'el dueno'} por ${space.name}${improvement}.`,
          `No pudo pagar la renta de ${space.name}.`,
          'Renta',
          'rent'
        );
      } else if (space.owner !== player.id) {
        finishTurn(roomState, `${actionText}La propiedad esta hipotecada; no paga renta.`);
      } else {
        finishTurn(roomState, `${actionText}Esta propiedad ya es suya.`);
      }
      return;
    }

    if (space.type === 'presidio') {
      player.skipTurns = 1;
      finishTurn(roomState, `${actionText}Fue al presidio y perdera 1 turno.`);
      return;
    }

    if (space.type !== 'event') {
      finishTurn(roomState, actionText);
      return;
    }

    if (space.eventType === 'tragedia') {
      const card = eventCards.tragedia[Math.floor(Math.random() * eventCards.tragedia.length)];
      const amount = card.amount;
      player.money -= amount;
      const text = card.text;
      socket.emit('cardDrawn', { title: `Tragedia para ${player.name}`, text });
      resolveTurnPayment(
        roomState,
        player,
        `${actionText}La tragedia le toco a ${player.name}: ${text}`,
        `La tragedia (${text}) lo dejo sin fondos.`
      );
      return;
    }

    if (space.eventType === 'premio') {
      const card = eventCards.premio[Math.floor(Math.random() * eventCards.premio.length)];
      player.money += card.amount;
      socket.emit('cardDrawn', { title: `Premio para ${player.name}`, text: card.text });
      finishTurn(roomState, `${actionText}La suerte favorecio a ${player.name}: ${card.text}`);
      return;
    }

    const card = eventCards.chisme[Math.floor(Math.random() * eventCards.chisme.length)];
    const options = card.options.map((action) => chismeActions[action]);
    roomState.pendingAction = { type: 'chisme', playerId: player.id, position: player.position };
    socket.emit('chismeOptions', {
      text: card.text,
      options,
      players: roomState.players.map((candidate) => ({ id: candidate.id, name: candidate.name }))
    });
    emitState(roomState);

    const resolveChisme = (text) => {
      if (roomState.pendingAction?.playerId !== player.id) return;
      socket.off('chismeAction', handleChisme);
      io.to(roomState.id).emit('chatMessage', { author: 'Juego', text: `${actionText}${text}` });
      if (!settleOrRequestRescue(roomState, player, 'Un chisme lo dejo sin fondos.')) {
        clearPendingAction(roomState);
        roomState.currentTurnIndex = (roomState.currentTurnIndex + 1) % roomState.players.length;
        emitState(roomState);
      }
    };
    const handleChisme = (choice = {}) => {
      const target = roomState.players.find((candidate) => candidate.id === choice.targetId && candidate.id !== player.id);
      const propertyName = player.properties.find((name) => {
        const candidate = roomState.board.find((space) => space.name === name);
        return canTradeProperty(roomState, candidate);
      });
      if (choice.action === 'transfer' && target && propertyName) {
        const ownedSpace = roomState.board.find((candidate) => candidate.name === propertyName);
        if (ownedSpace) ownedSpace.owner = target.id;
        player.properties = player.properties.filter((name) => name !== propertyName);
        target.properties.push(propertyName);
        resolveChisme(`Transfirio ${propertyName} a ${target.name}.`);
      } else if (choice.action === 'transfer' && target) {
        resolveChisme('No tiene una propiedad libre de mejoras o hipotecas para transferir.');
      } else if (choice.action === 'give' && target && player.money >= 200) {
        player.money -= 200;
        target.money += 200;
        resolveChisme(`Le dio 200 Lps. a ${target.name}.`);
      } else if (choice.action === 'gossip') {
        resolveChisme(`${player.name} conto el chisme con exito.`);
      } else {
        resolveChisme('No pudo realizar esa accion de chisme.');
      }
    };
    actionTimers[roomState.id] = setTimeout(() => {
      const others = roomState.players.filter((candidate) => candidate.id !== player.id);
      player.money -= 500 * others.length;
      others.forEach((candidate) => {
        candidate.money += 500;
      });
      resolveChisme(`${player.name} no respondio: pago 500 Lps. a cada jugador.`);
    }, DECISION_TIMEOUT);
    socket.once('chismeAction', handleChisme);
  });

  socket.on('propertyDecision', (choice = {}) => {
    const roomState = rooms[socket.data.roomId];
    if (!roomState || roomState.pendingAction?.type !== 'property' || roomState.pendingAction.playerId !== socket.id) return;
    const player = roomState.players.find((candidate) => candidate.id === socket.id);
    const space = roomState.board[roomState.pendingAction.position];
    if (!player || !space || space.owner) return;

    if (choice.action === 'buy' && player.money > space.cost) {
      player.money -= space.cost;
      space.owner = player.id;
      player.properties.push(space.name);
      resolveTurnPayment(
        roomState,
        player,
        `${player.name} compro ${space.name} por ${space.cost} Lps.`,
        `Compro ${space.name} y se quedo sin dinero.`
      );
    } else {
      finishTurn(roomState, `${player.name} dejo pasar ${space.name}.`);
    }
  });

  socket.on('mortgageProperty', ({ propertyName } = {}) => {
    const roomState = rooms[socket.data.roomId];
    const player = roomState?.players.find((candidate) => candidate.id === socket.id);
    const space = roomState?.board.find((candidate) => candidate.name === propertyName && candidate.owner === socket.id);
    if (!roomState || !player || !space || !roomState.gameStarted) return;

    if (space.mortgaged) {
      if (roomState.pendingAction?.type === 'debt' && roomState.pendingAction.playerId === player.id) {
        socket.emit('actionFeedback', 'Primero cubri tu deuda hipotecando otra propiedad disponible.');
        return;
      }
      const repayment = Math.ceil(space.cost * 0.55);
      if (player.money <= repayment) {
        socket.emit('actionFeedback', `Necesitas mas de ${repayment} Lps. para levantar la hipoteca sin quebrar.`);
        return;
      }
      player.money -= repayment;
      space.mortgaged = false;
      io.to(roomState.id).emit('chatMessage', {
        author: 'Banco',
        text: `${player.name} recupero ${space.name} por ${repayment} Lps.`
      });
    } else {
      if (colorFamily(roomState, space).some((candidate) => candidate.houses || candidate.hotel)) {
        socket.emit('actionFeedback', 'Vende primero las casas o el hotel de esta familia antes de hipotecar.');
        return;
      }
      const loan = mortgageValue(space);
      player.money += loan;
      space.mortgaged = true;
      io.to(roomState.id).emit('chatMessage', {
        author: 'Banco',
        text: `${player.name} hipoteco ${space.name} y recibio ${loan} Lps.`
      });
    }
    if (roomState.pendingAction?.type === 'debt' && roomState.pendingAction.playerId === player.id && player.money > 0) {
      clearPendingAction(roomState);
      io.to(roomState.id).emit('chatMessage', {
        author: 'Banco',
        text: `${player.name} cubrio su deuda y sigue en la partida.`
      });
      roomState.currentTurnIndex = (roomState.currentTurnIndex + 1) % roomState.players.length;
    }
    emitState(roomState);
  });

  socket.on('upgradeProperty', ({ propertyName } = {}) => {
    const roomState = rooms[socket.data.roomId];
    const player = roomState?.players.find((candidate) => candidate.id === socket.id);
    const space = roomState?.board.find((candidate) => candidate.name === propertyName && candidate.owner === socket.id);
    if (!roomState || !player || !space || !roomState.gameStarted) return;
    if (roomState.pendingAction?.type === 'debt' && roomState.pendingAction.playerId === player.id) {
      socket.emit('actionFeedback', 'Primero cubri tu deuda antes de construir.');
      return;
    }
    if (space.mortgaged) {
      socket.emit('actionFeedback', 'Recupera la propiedad hipotecada antes de construir.');
      return;
    }
    if (!ownsCompleteFamily(roomState, player, space)) {
      const familySize = colorFamily(roomState, space).length;
      const requirement = familySize >= 2
        ? `Debes tener las ${familySize} propiedades del mismo color para construir.`
        : 'Esta propiedad no pertenece a una familia construible.';
      socket.emit('actionFeedback', requirement);
      return;
    }
    if (space.hotel) {
      socket.emit('actionFeedback', 'Esta propiedad ya tiene hotel.');
      return;
    }

    const buildsHotel = space.houses === MAX_HOUSES;
    const cost = buildsHotel ? hotelCost(space) : houseCost(space);
    const label = buildsHotel ? 'un hotel' : 'una casa';
    if (player.money <= cost) {
      socket.emit('actionFeedback', `Necesitas mas de ${cost} Lps. para construir ${label} sin quebrar.`);
      return;
    }

    player.money -= cost;
    if (buildsHotel) {
      space.hotel = true;
    } else {
      space.houses += 1;
    }
    const rent = currentRent(space);
    io.to(roomState.id).emit('chatMessage', {
      author: 'Construccion',
      text: `${player.name} construyo ${label} en ${space.name}. Su renta ahora es ${rent} Lps.`
    });
    socket.emit('transactionNotice', {
      title: buildsHotel ? 'Hotel construido' : 'Casa construida',
      text: `-${cost} Lps. en ${space.name}. Renta: ${rent} Lps.`,
      tone: 'expense'
    });
    emitState(roomState);
  });

  socket.on('proposeTrade', ({ offeredProperty, requestedProperty, targetId } = {}) => {
    const roomState = rooms[socket.data.roomId];
    const requester = roomState?.players.find((candidate) => candidate.id === socket.id);
    const target = roomState?.players.find((candidate) => candidate.id === targetId && candidate.id !== socket.id);
    const offered = roomState?.board.find((candidate) => candidate.name === offeredProperty && candidate.owner === socket.id);
    const requested = roomState?.board.find((candidate) => candidate.name === requestedProperty && candidate.owner === targetId);
    if (!roomState || !requester || !target || !roomState.gameStarted) return;
    if (roomState.pendingAction || roomState.tradeOffer) {
      socket.emit('actionFeedback', 'Espera a que termine la decision u oferta pendiente.');
      return;
    }
    if (!canTradeProperty(roomState, offered) || !canTradeProperty(roomState, requested)) {
      socket.emit('actionFeedback', 'Solo se pueden intercambiar familias sin mejoras ni propiedades hipotecadas.');
      return;
    }

    roomState.tradeOffer = {
      requesterId: requester.id,
      requesterName: requester.name,
      targetId: target.id,
      targetName: target.name,
      offeredProperty: offered.name,
      requestedProperty: requested.name
    };
    io.to(target.id).emit('tradeOfferReceived', roomState.tradeOffer);
    io.to(requester.id).emit('actionFeedback', `Oferta enviada a ${target.name}. Tiene hasta la proxima jugada para responder.`);
    io.to(roomState.id).emit('chatMessage', {
      author: 'Intercambio',
      text: `${requester.name} propuso un intercambio a ${target.name}.`,
      type: 'trade'
    });
    emitState(roomState);
  });

  socket.on('respondTrade', ({ accept } = {}) => {
    const roomState = rooms[socket.data.roomId];
    const offer = roomState?.tradeOffer;
    if (!roomState || !offer || offer.targetId !== socket.id) return;
    const requester = roomState.players.find((candidate) => candidate.id === offer.requesterId);
    const target = roomState.players.find((candidate) => candidate.id === offer.targetId);
    const offered = roomState.board.find((candidate) => candidate.name === offer.offeredProperty && candidate.owner === offer.requesterId);
    const requested = roomState.board.find((candidate) => candidate.name === offer.requestedProperty && candidate.owner === offer.targetId);

    if (!accept) {
      clearTradeOffer(roomState, `${target?.name || 'El jugador'} rechazo el intercambio de ${offer.requesterName}.`);
      return;
    }
    if (!requester || !target || !canTradeProperty(roomState, offered) || !canTradeProperty(roomState, requested)) {
      clearTradeOffer(roomState, 'La propuesta ya no es valida y fue cancelada.');
      return;
    }

    offered.owner = target.id;
    requested.owner = requester.id;
    requester.properties = requester.properties.filter((name) => name !== offered.name);
    target.properties = target.properties.filter((name) => name !== requested.name);
    requester.properties.push(requested.name);
    target.properties.push(offered.name);
    clearTradeOffer(
      roomState,
      `${target.name} acepto: ${requester.name} recibe ${requested.name} y ${target.name} recibe ${offered.name}.`
    );
  });

  socket.on('sellImprovement', ({ propertyName } = {}) => {
    const roomState = rooms[socket.data.roomId];
    const player = roomState?.players.find((candidate) => candidate.id === socket.id);
    const space = roomState?.board.find((candidate) => candidate.name === propertyName && candidate.owner === socket.id);
    if (!roomState || !player || !space || !roomState.gameStarted || space.mortgaged) return;
    if (!space.hotel && !space.houses) return;

    const soldHotel = space.hotel;
    const refund = soldHotel ? Math.floor(hotelCost(space) / 2) : Math.floor(houseCost(space) / 2);
    if (soldHotel) {
      space.hotel = false;
    } else {
      space.houses -= 1;
    }
    player.money += refund;
    io.to(roomState.id).emit('chatMessage', {
      author: 'Construccion',
      text: `${player.name} vendio ${soldHotel ? 'el hotel' : 'una casa'} de ${space.name} y recibio ${refund} Lps.`
    });
    socket.emit('transactionNotice', {
      title: soldHotel ? 'Hotel vendido' : 'Casa vendida',
      text: `+${refund} Lps. por ${space.name}.`,
      tone: 'income'
    });

    if (roomState.pendingAction?.type === 'debt' && roomState.pendingAction.playerId === player.id && player.money > 0) {
      clearPendingAction(roomState);
      io.to(roomState.id).emit('chatMessage', {
        author: 'Banco',
        text: `${player.name} cubrio su deuda y sigue en la partida.`
      });
      roomState.currentTurnIndex = (roomState.currentTurnIndex + 1) % roomState.players.length;
    }
    emitState(roomState);
  });

  socket.on('declareBankruptcy', () => {
    const roomState = rooms[socket.data.roomId];
    const player = roomState?.players.find((candidate) => candidate.id === socket.id);
    if (!roomState || !player || roomState.pendingAction?.type !== 'debt' || roomState.pendingAction.playerId !== player.id) return;
    eliminatePlayer(roomState, player, 'Se declaro en quiebra.');
  });

  socket.on('disconnect', () => {
    const roomState = rooms[socket.data.roomId];
    if (!roomState) return;
    const index = roomState.players.findIndex((player) => player.id === socket.id);
    if (index === -1) return;

    const [left] = roomState.players.splice(index, 1);
    releaseProperties(roomState, left);
    if (roomState.pendingAction?.playerId === left.id) clearPendingAction(roomState);

    if (!roomState.players.length) {
      if (roomTimers[roomState.id]) {
        clearInterval(roomTimers[roomState.id]);
        delete roomTimers[roomState.id];
      }
      delete rooms[roomState.id];
      broadcastRoomList();
      return;
    }

    if (index < roomState.currentTurnIndex) roomState.currentTurnIndex -= 1;
    roomState.currentTurnIndex %= roomState.players.length;
    io.to(roomState.id).emit('chatMessage', { author: 'Sistema', text: `${left.name} salio del juego.` });
    if (roomState.gameStarted && roomState.players.length === 1) {
      stopRoomGame(roomState, roomState.players[0]);
    } else {
      emitState(roomState);
      broadcastRoomList();
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Servidor en http://${HOST}:${PORT}`);
});

function shutdown() {
  Object.values(roomTimers).forEach((timer) => clearInterval(timer));
  Object.values(actionTimers).forEach((timer) => clearTimeout(timer));
  server.close(() => process.exit(0));
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
