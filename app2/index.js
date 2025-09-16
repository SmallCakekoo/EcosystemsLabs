// Conexión Socket.IO
const socket = io("/", { path: "/real-time" });

// Referencias a elementos DOM
const playersP = document.getElementById("players");
const rows = document.getElementById("rows");
const events = document.getElementById("events");

// Registra como monitor
socket.emit("registerMonitor");

// Sincroniza jugadores conectados
socket.on("monitorSync", ({ players }) => {
  playersP.textContent = `Jugadores conectados: ${players.length}`;
});

// Jugador se unió
socket.on("playerJoined", (players) => {
  playersP.textContent = `Jugadores conectados: ${players.length}`;
  pushEvent(`Se unió ${players[players.length - 1]}`);
});

// Mensaje informativo
socket.on("monitorInfo", ({ message }) => pushEvent(message));

// Partida lista
socket.on("matchReadyMonitor", (players) => {
  pushEvent(`Partida lista: ${players[0]} vs ${players[1]}`);
});

// Ronda completada - crea fila en tabla
socket.on("monitorRound", ({ p1, p2, winner, timestamp }) => {
  const tr = document.createElement("tr");
  const date = new Date(timestamp);
  const winnerName =
    winner === "draw" ? "Empate" : winner === "player1" ? p1.name : p2.name;
  tr.innerHTML = `
    <td>${date.toLocaleTimeString()}</td>
    <td>${p1.name} (${humanize(p1.choice)})</td>
    <td>${p2.name} (${humanize(p2.choice)})</td>
    <td>${winnerName}</td>
  `;
  rows.prepend(tr);
});

// Agrega evento a la lista
function pushEvent(text) {
  const li = document.createElement("li");
  li.textContent = text;
  events.prepend(li);
}

// Convierte opciones del juego a español
function humanize(key) {
  if (!key) return "";
  const c = String(key).toLowerCase();
  if (c === "rock" || c === "piedra") return "Piedra";
  if (c === "paper" || c === "papel") return "Papel";
  if (c === "scissors" || c === "tijera" || c === "tijeras") return "Tijera";
  return key;
}
