# WebSockets y Socket.IO - Preguntas Resueltas

## 1. ¿Cómo contar el número de clientes conectados y notificarle a todos el número de clientes conectados a todos?

```js
const io = require("socket.io")(3000);

let connectedClients = 0;

io.on("connection", (socket) => {
  connectedClients++;

  // Notificar a todos el número de clientes conectados
  io.emit("clientsCount", connectedClients);

  socket.on("disconnect", () => {
    connectedClients--;
    io.emit("clientsCount", connectedClients);
  });
});
```

---

## 2. ¿Cómo identificar a cada cliente que se une con un id único?

```js
io.on("connection", (socket) => {
  console.log("Cliente conectado con id:", socket.id);

  // Enviar el id al cliente mismo
  socket.emit("yourId", socket.id);
});
```

---

## 3. ¿Cómo emitir eventos para un sólo cliente de todos los conectados?

```js
// Emitir a un cliente en específico
io.to(socket.id).emit("privateMessage", "Este mensaje es solo para ti");

// Si tienes el id de otro cliente
io.to("otroSocketId").emit("privateMessage", "Hola!");
```

---

## 4. ¿Cómo identificar cuando un usuario se desconectó?

```js
io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    console.log(`Cliente ${socket.id} se desconectó`);
  });
});
```

---

## Resumencito:

- `io.emit(...)` → mensaje a **todos**.
- `socket.emit(...)` → mensaje **solo al cliente actual**.
- `io.to(id).emit(...)` → mensaje a **un cliente específico**.
- Eventos `connection` y `disconnect` sirven para manejar la entrada/salida.
