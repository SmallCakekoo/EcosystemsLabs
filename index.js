// Dependencias del servidor
const express = require("express");
const path = require("path");
const { Server } = require("socket.io");
const { createServer } = require("http");

const app = express();
const httpServer = createServer(app);

// Configuración Socket.IO
const io = new Server(httpServer, {
  path: "/real-time",
  cors: { origin: "*" },
});

// Middleware y archivos estáticos
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/app1", express.static(path.join(__dirname, "app1")));
app.use("/app2", express.static(path.join(__dirname, "app2")));

// Estado del juego en memoria
const matchState = {
  playersBySocketId: {},
  playerOrder: [],
};

// Resetea elecciones de jugadores
function resetChoices() {
  Object.values(matchState.playersBySocketId).forEach((p) => {
    p.choice = null;
  });
}

// Normaliza elección del jugador
function normalizeChoice(choice) {
  if (!choice) return null;
  const c = String(choice).toLowerCase().trim();
  if (c === "rock" || c === "piedra") return "piedra";
  if (c === "paper" || c === "papel") return "papel";
  if (c === "scissors" || c === "tijera" || c === "tijeras") return "tijera";
  return null;
}

// Determina ganador de la ronda
function determineWinner(choicePlayer1, choicePlayer2) {
  if (choicePlayer1 === choicePlayer2) return "draw"; // 'draw' es empate
  const rules = { piedra: "tijera", tijera: "papel", papel: "piedra" };
  return rules[choicePlayer1] === choicePlayer2 ? "player1" : "player2";
}

// Calcula resultado completo de la ronda
function computeRoundResult() {
  const players = matchState.playerOrder
    .map((sid) => ({ sid, ...matchState.playersBySocketId[sid] }))
    .filter((p) => !!p);
  if (players.length < 2) return null;
  const [p1, p2] = players;
  if (!p1.choice || !p2.choice) return null;

  const c1 = normalizeChoice(p1.choice);
  const c2 = normalizeChoice(p2.choice);
  if (!c1 || !c2) return null;

  const winner = determineWinner(c1, c2); // 'player1' | 'player2' | 'draw'

  if (winner === "draw") {
    matchState.playersBySocketId[p1.sid].draws =
      (matchState.playersBySocketId[p1.sid].draws || 0) + 1;
    matchState.playersBySocketId[p2.sid].draws =
      (matchState.playersBySocketId[p2.sid].draws || 0) + 1;
  } else if (winner === "player1") {
    matchState.playersBySocketId[p1.sid].wins =
      (matchState.playersBySocketId[p1.sid].wins || 0) + 1;
    matchState.playersBySocketId[p2.sid].losses =
      (matchState.playersBySocketId[p2.sid].losses || 0) + 1;
  } else if (winner === "player2") {
    matchState.playersBySocketId[p2.sid].wins =
      (matchState.playersBySocketId[p2.sid].wins || 0) + 1;
    matchState.playersBySocketId[p1.sid].losses =
      (matchState.playersBySocketId[p1.sid].losses || 0) + 1;
  }

  return {
    p1: {
      name: p1.name,
      choice: c1,
      wins: matchState.playersBySocketId[p1.sid].wins || 0,
      losses: matchState.playersBySocketId[p1.sid].losses || 0,
      draws: matchState.playersBySocketId[p1.sid].draws || 0,
    },
    p2: {
      name: p2.name,
      choice: c2,
      wins: matchState.playersBySocketId[p2.sid].wins || 0,
      losses: matchState.playersBySocketId[p2.sid].losses || 0,
      draws: matchState.playersBySocketId[p2.sid].draws || 0,
    },
    winner,
  };
}

// Conexión de cliente
io.on("connection", (socket) => {
  // Registro de jugador
  socket.on("registerPlayer", ({ name }) => {
    // Only allow up to two players in the match
    if (matchState.playerOrder.length >= 2) {
      socket.emit("matchFull");
      return;
    }
    matchState.playersBySocketId[socket.id] = {
      name: name?.trim() || `Jugador-${socket.id.slice(0, 4)}`,
      choice: null,
      wins: 0,
      losses: 0,
    };
    matchState.playerOrder.push(socket.id);

    const players = matchState.playerOrder.map(
      (sid) => matchState.playersBySocketId[sid]
    );
    io.emit(
      "playerJoined",
      players.map((p) => p.name)
    ); // notify monitors too

    if (matchState.playerOrder.length === 2) {
      // Notify both players match is ready
      io.to(matchState.playerOrder[0]).emit("matchReady", {
        you: players[0].name,
        opponent: players[1].name,
      });
      io.to(matchState.playerOrder[1]).emit("matchReady", {
        you: players[1].name,
        opponent: players[0].name,
      });
      io.to("monitors").emit(
        "matchReadyMonitor",
        players.map((p) => p.name)
      );
    } else {
      socket.emit("waitingForOpponent");
    }
  });

  // Registro de monitor
  socket.on("registerMonitor", () => {
    socket.join("monitors");
    const players = matchState.playerOrder.map(
      (sid) => matchState.playersBySocketId[sid]
    );
    socket.emit("monitorSync", {
      players: players.map((p) => p?.name).filter(Boolean),
    });
  });

  // Elección de jugador
  socket.on("playerChoice", ({ choice }) => {
    const player = matchState.playersBySocketId[socket.id];
    if (!player) return;
    const normalized = normalizeChoice(choice);
    if (!normalized) return;
    player.choice = normalized;

    // If both choices present, compute and broadcast
    const result = computeRoundResult();
    if (!result) return;

    io.to(matchState.playerOrder[0]).emit("roundResult", {
      you: matchState.playersBySocketId[matchState.playerOrder[0]].name,
      opponent: matchState.playersBySocketId[matchState.playerOrder[1]].name,
      p1: result.p1,
      p2: result.p2,
      winner: result.winner,
    });
    io.to(matchState.playerOrder[1]).emit("roundResult", {
      you: matchState.playersBySocketId[matchState.playerOrder[1]].name,
      opponent: matchState.playersBySocketId[matchState.playerOrder[0]].name,
      p1: result.p1,
      p2: result.p2,
      winner: result.winner,
    });

    // Send to monitors
    io.to("monitors").emit("monitorRound", {
      p1: result.p1,
      p2: result.p2,
      winner: result.winner,
      timestamp: Date.now(),
    });

    // Reset choices for next round
    resetChoices();
    io.emit("readyForNextRound");
  });

  // Desconexión de cliente
  socket.on("disconnect", () => {
    const wasPlayer = !!matchState.playersBySocketId[socket.id];
    if (wasPlayer) {
      delete matchState.playersBySocketId[socket.id];
      matchState.playerOrder = matchState.playerOrder.filter(
        (sid) => sid !== socket.id
      );
      resetChoices();
      io.emit("playerLeft");
      io.to("monitors").emit("monitorInfo", {
        message: "Un jugador se desconectó. Esperando nuevo jugador...",
      });
    }
  });
});

// Inicia servidor
httpServer.listen(5050, () =>
  console.log(`Server running at http://localhost:${5050}`)
);
