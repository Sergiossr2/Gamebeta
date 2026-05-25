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

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const rooms = Object.create(null);
const roomTimers = Object.create(null);
const reservedNames = ['sistema', 'juego', 'admin', 'administrador'];

const eventCards = {
  chisme: [
    { kind: 'gossip', text: 'Contar el chisme y continuar.' },
    { kind: 'give', text: 'Dar 200 Lps. a otro jugador.' },
    { kind: 'transfer', text: 'Transferir una propiedad a otro jugador.' }
  ],
  tragedia: [
    { kind: 'repair', text: 'Se dano tu carro: pagaste 150 Lps.', amount: 150 },
    { kind: 'rob', text: 'Te asaltaron al salir: perdiste 200 Lps.', amount: 200 },
    { kind: 'fine', text: 'Te detuvo un reten: debes pagar una multa.', amounts: [100, 150, 250] },
    { kind: 'market_chino', text: 'Una compra impulsiva te costo 120 Lps.', amount: 120 }
  ]
};

function property(name, cost, rent, color) {
  return { name, type: 'property', cost, rent, color, owner: null };
}

function event(name, eventType) {
  return { name, type: 'event', eventType, owner: null };
}

function createBoard() {
  return [
    { name: 'Salida', type: 'start', owner: null },
    property('Barrio Rio de Piedras', 120, 30, '#8e44ad'),
    event('Chisme del barrio', 'chisme'),
    property('Colonia Trejo', 140, 35, '#8e44ad'),
    property('Los Andes', 160, 40, '#2980b9'),
    event('Tragedia en la ruta', 'tragedia'),
    property('Jardines del Valle', 180, 45, '#2980b9'),
    property('Altia', 200, 50, '#2980b9'),
    event('Chisme de oficina', 'chisme'),
    property('Universidad', 220, 55, '#16a085'),
    { name: 'Presidio', type: 'presidio', owner: null },
    property('Guamilito', 230, 60, '#16a085'),
    event('Tragedia inesperada', 'tragedia'),
    property('Centro', 240, 65, '#16a085'),
    property('Circunvalacion', 260, 70, '#f39c12'),
    event('Chisme viral', 'chisme'),
    property('El Pedregal', 270, 75, '#f39c12'),
    property('El Sauce', 280, 80, '#f39c12'),
    event('Tragedia vehicular', 'tragedia'),
    property('Mall Galerias', 300, 85, '#c0392b'),
    { name: 'Descanso', type: 'rest', owner: null },
    property('Las Palmas', 310, 90, '#c0392b'),
    event('Chisme familiar', 'chisme'),
    property('La Puerta', 320, 95, '#c0392b'),
    property('Bermejo', 330, 100, '#d35400'),
    event('Tragedia de mercado', 'tragedia'),
    property('Choloma Express', 340, 105, '#d35400'),
    property('Boulevard del Norte', 350, 110, '#d35400'),
    event('Chisme en redes', 'chisme'),
    property('Zona Industrial', 360, 115, '#27ae60'),
    { name: 'Visita al Presidio', type: 'rest', owner: null },
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
      endTime: null
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
    io.to(roomId).emit('gameState', roomState);
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
    io.to(roomState.id).emit('gameState', roomState);

    roomTimers[roomState.id] = setInterval(() => {
      const remaining = Math.max(0, roomState.endTime - Date.now());
      io.to(roomState.id).emit('timer', { remaining });
      if (remaining <= 0) {
        clearInterval(roomTimers[roomState.id]);
        delete roomTimers[roomState.id];
        roomState.gameStarted = false;
        const winner = roomState.players.reduce(
          (best, player) => (player.money > (best?.money ?? -Infinity) ? player : best),
          null
        );
        io.to(roomState.id).emit('gameOver', { winner, finalState: roomState });
        broadcastRoomList();
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
    if (!roomState || !roomState.gameStarted) return;
    const playerIndex = roomState.players.findIndex((candidate) => candidate.id === socket.id);
    if (playerIndex !== roomState.currentTurnIndex) return;
    const player = roomState.players[playerIndex];

    const finishTurn = (actionText) => {
      if (!rooms[roomState.id] || !roomState.players.length) return;
      roomState.currentTurnIndex = (roomState.currentTurnIndex + 1) % roomState.players.length;
      io.to(roomState.id).emit('chatMessage', { author: 'Juego', text: actionText });
      io.to(roomState.id).emit('gameState', roomState);
    };

    if (player.skipTurns > 0) {
      player.skipTurns -= 1;
      finishTurn(`${player.name} esta en el presidio y pierde este turno.`);
      return;
    }

    const roll = Math.floor(Math.random() * 6) + 1;
    io.to(roomState.id).emit('rolled', { playerId: player.id, roll });
    player.position = (player.position + roll) % roomState.board.length;

    const space = roomState.board[player.position];
    let actionText = `${player.name} lanzo ${roll} y llego a ${space.name}. `;

    if (space.type === 'property') {
      if (!space.owner && player.money >= space.cost) {
        player.money -= space.cost;
        space.owner = player.id;
        player.properties.push(space.name);
        actionText += `Compro la propiedad por ${space.cost} Lps.`;
      } else if (!space.owner) {
        actionText += 'No tiene suficiente dinero para comprar.';
      } else if (space.owner !== player.id) {
        const owner = roomState.players.find((candidate) => candidate.id === space.owner);
        player.money -= space.rent;
        if (owner) owner.money += space.rent;
        actionText += `Pago ${space.rent} Lps. de renta a ${owner?.name || 'el dueno'}.`;
      } else {
        actionText += 'Ya es tu propiedad.';
      }
      finishTurn(actionText);
      return;
    }

    if (space.type === 'presidio') {
      player.skipTurns = 2;
      finishTurn(`${actionText}Vaya, fuiste al presidio. Pierdes 2 turnos.`);
      return;
    }

    if (space.type !== 'event') {
      finishTurn(actionText);
      return;
    }

    if (space.eventType === 'tragedia') {
      const card = eventCards.tragedia[Math.floor(Math.random() * eventCards.tragedia.length)];
      let amount = card.amount || 0;
      if (card.kind === 'fine') {
        amount = card.amounts[Math.floor(Math.random() * card.amounts.length)];
      }
      player.money -= amount;
      const text = card.kind === 'fine' ? `Reten: pagaste ${amount} Lps.` : card.text;
      io.to(roomState.id).emit('cardDrawn', { title: 'Carta Tragedia', text });
      finishTurn(`${actionText}${text}`);
      return;
    }

    const options = eventCards.chisme;
    socket.emit('chismeOptions', {
      options,
      players: roomState.players.map((candidate) => ({ id: candidate.id, name: candidate.name }))
    });

    let resolved = false;
    const resolveChisme = (text) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);
      socket.off('chismeAction', handleChisme);
      finishTurn(`${actionText}${text}`);
    };
    const handleChisme = (choice = {}) => {
      const target = roomState.players.find((candidate) => candidate.id === choice.targetId && candidate.id !== player.id);
      if (choice.action === 'transfer' && target && player.properties.length) {
        const propertyName = player.properties.shift();
        const ownedSpace = roomState.board.find((candidate) => candidate.name === propertyName);
        if (ownedSpace) ownedSpace.owner = target.id;
        target.properties.push(propertyName);
        resolveChisme(`Transferiste ${propertyName} a ${target.name}.`);
      } else if (choice.action === 'give' && target && player.money >= 200) {
        player.money -= 200;
        target.money += 200;
        resolveChisme(`Le diste 200 Lps. a ${target.name}.`);
      } else if (choice.action === 'gossip') {
        resolveChisme(`${player.name} conto el chisme con exito.`);
      } else {
        resolveChisme('No se pudo realizar esa accion de chisme.');
      }
    };
    const timeout = setTimeout(() => {
      const others = roomState.players.filter((candidate) => candidate.id !== player.id);
      player.money -= 500 * others.length;
      others.forEach((candidate) => {
        candidate.money += 500;
      });
      resolveChisme('No contestaste el chisme: pagaste 500 Lps. a cada jugador.');
    }, 20000);
    socket.once('chismeAction', handleChisme);
  });

  socket.on('disconnect', () => {
    const roomState = rooms[socket.data.roomId];
    if (!roomState) return;
    const index = roomState.players.findIndex((player) => player.id === socket.id);
    if (index === -1) return;

    const [left] = roomState.players.splice(index, 1);
    roomState.board.forEach((space) => {
      if (space.owner === left.id) space.owner = null;
    });

    if (!roomState.players.length) {
      if (roomTimers[roomState.id]) {
        clearInterval(roomTimers[roomState.id]);
        delete roomTimers[roomState.id];
      }
      delete rooms[roomState.id];
      broadcastRoomList();
      return;
    }

    roomState.currentTurnIndex %= roomState.players.length;
    io.to(roomState.id).emit('chatMessage', { author: 'Sistema', text: `${left.name} salio del juego.` });
    io.to(roomState.id).emit('gameState', roomState);
    broadcastRoomList();
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Servidor en http://${HOST}:${PORT}`);
});

function shutdown() {
  Object.values(roomTimers).forEach((timer) => clearInterval(timer));
  server.close(() => process.exit(0));
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
