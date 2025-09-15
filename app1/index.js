const socket = io("/", { path: "/real-time" });

const nameInput = document.getElementById("player-name");
const joinBtn = document.getElementById("join-btn");
const statusP = document.getElementById("status");
const gameSection = document.getElementById("game-section");
const versus = document.getElementById("versus");
const resultDiv = document.getElementById("result");
const winsSpan = document.getElementById("wins");
const lossesSpan = document.getElementById("losses");
const drawsSpan = document.getElementById("draws");
const choiceButtons = Array.from(document.querySelectorAll(".choice"));

let hasJoined = false;

joinBtn.addEventListener("click", () => {
  if (hasJoined) return;
  const name = nameInput.value.trim();
  if (!name) {
    statusP.textContent = "Por favor ingresa tu nombre";
    return;
  }
  socket.emit("registerPlayer", { name });
  statusP.textContent = "Esperando oponente...";
  hasJoined = true;
});

socket.on("waitingForOpponent", () => {
  gameSection.style.display = "block";
  choiceButtons.forEach((b) => (b.disabled = true));
  versus.textContent = "Esperando oponente...";
});

socket.on("matchReady", ({ you, opponent }) => {
  document.getElementById("name-section").style.display = "none";
  gameSection.style.display = "block";
  versus.textContent = `${you} vs ${opponent}`;
  choiceButtons.forEach((b) => (b.disabled = false));
  resultDiv.textContent = "Selecciona tu jugada";
});

choiceButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const choice = btn.getAttribute("data-choice");
    socket.emit("playerChoice", { choice });
    resultDiv.textContent = `Elegiste ${humanize(
      choice
    )}. Esperando al oponente...`;
    choiceButtons.forEach((b) => (b.disabled = true));
  });
});

socket.on("roundResult", ({ p1, p2, winner }) => {
  // Find my player by name in the versus label
  const [youName] = versus.textContent.split(" vs ");
  const me = p1.name === youName ? p1 : p2;
  const opp = p1.name === youName ? p2 : p1;
  let text = `${me.name} (${humanize(me.choice)}) vs ${opp.name} (${humanize(
    opp.choice
  )}) → `;
  if (winner === "draw") text += "Empate";
  else text += `${winner === "player1" ? p1.name : p2.name} gana`;
  resultDiv.textContent = text;
  winsSpan.textContent = String(me.wins || 0);
  lossesSpan.textContent = String(me.losses || 0);
  if (drawsSpan) drawsSpan.textContent = String(me.draws || 0);
});

socket.on("readyForNextRound", () => {
  choiceButtons.forEach((b) => (b.disabled = false));
});

socket.on("playerLeft", () => {
  choiceButtons.forEach((b) => (b.disabled = true));
  resultDiv.textContent = "El oponente salió. Esperando nuevo jugador...";
  versus.textContent = "Esperando oponente...";
});

socket.on("matchFull", () => {
  statusP.textContent = "La sala ya tiene 2 jugadores. Intenta más tarde.";
});

function humanize(key) {
  if (!key) return "";
  const c = String(key).toLowerCase();
  if (c === "rock" || c === "piedra") return "Piedra";
  if (c === "paper" || c === "papel") return "Papel";
  if (c === "scissors" || c === "tijera" || c === "tijeras") return "Tijera";
  return key;
}
