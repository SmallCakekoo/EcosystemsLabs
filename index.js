const express = require("express");
const path = require("path");

const app = express();
const PORT = 5050;

// Middleware
app.use(express.json());

// Servir archivos estáticos
app.use("/app1", express.static(path.join(__dirname, "app1")));
app.use("/app2", express.static(path.join(__dirname, "app2")));
app.use("/app3", express.static(path.join(__dirname, "app3")));
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/", express.static(path.join(__dirname, "public")));

// Arrays en memoria - Estructura mejorada para Rappi
let usuarios = []; // Consumidores
let tiendas = []; // Tiendas de comida
let repartidores = []; // Repartidores
let productos = []; // Productos asociados a tiendas
let pedidos = []; // Pedidos con relaciones completas

// Datos de ejemplo para testing
usuarios.push({
  id: 1,
  username: "cliente1",
  password: "123456",
  nombre: "Juan Pérez",
  email: "juan@email.com",
  telefono: "3001234567",
});

tiendas.push({
  id: 1,
  username: "pizzeria_roma",
  password: "123456",
  nombre: "Pizzería Roma",
  descripcion: "Las mejores pizzas italianas",
  categoria: "Pizza",
  direccion: "Calle 123 #45-67",
  telefono: "3001234567",
  horario: "12:00 PM - 10:00 PM",
  rating: 4.5,
  tiempoEntrega: "30-45 min",
});

repartidores.push({
  id: 1,
  username: "repartidor1",
  password: "123456",
  nombre: "Carlos López",
  telefono: "3001234567",
  disponible: true,
});

productos.push({
  id: 1,
  tiendaId: 1,
  nombre: "Pizza Margherita",
  descripcion: "Pizza tradicional con tomate, mozzarella y albahaca",
  precio: 25000,
  imagen:
    "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=400&h=300&fit=crop",
  categoria: "Pizza",
  disponible: true,
  tiempoPreparacion: "15 min",
});

productos.push({
  id: 2,
  tiendaId: 1,
  nombre: "Pizza Pepperoni",
  descripcion: "Pizza con pepperoni, queso y salsa de tomate",
  precio: 28000,
  imagen:
    "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop",
  categoria: "Pizza",
  disponible: true,
  tiempoPreparacion: "18 min",
});

pedidos.push({
  id: 1,
  usuarioId: 1,
  tiendaId: 1,
  repartidorId: null,
  productos: [{ productoId: 1, cantidad: 2, precioUnitario: 25000 }],
  total: 50000,
  estado: "pendiente",
  direccionEntrega: "Calle 78 #12-34",
  fechaCreacion: new Date(),
  tiempoEstimado: "45 min",
});

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({
    message: "🍕 MiniRappi - Backend funcionando correctamente",
    rutas: {
      usuarios: "POST /usuarios/registro, POST /usuarios/login",
      tiendas: "POST /tiendas/registro, POST /tiendas/login, GET /tiendas",
      productos: "GET /tiendas/:id/productos, POST /tiendas/:id/productos",
      pedidos: "GET /pedidos, POST /pedidos, PUT /pedidos/:id",
    },
  });
});

// ===== USUARIOS (CONSUMIDORES) =====
// POST /usuarios/registro - Registro de consumidor
app.post("/usuarios/registro", (req, res) => {
  const { username, password, nombre, email, telefono } = req.body;

  if (!username || !password || !nombre || !email || !telefono) {
    return res.status(400).json({
      error: "Todos los campos son requeridos",
    });
  }

  // Verificar si el usuario ya existe
  const existingUser = usuarios.find((user) => user.username === username);
  if (existingUser) {
    return res.status(400).json({
      error: "El nombre de usuario ya existe",
    });
  }

  const newUser = {
    id: Date.now(),
    username,
    password,
    nombre,
    email,
    telefono,
  };

  usuarios.push(newUser);

  res.status(201).json({
    message: "Usuario registrado exitosamente",
    usuario: {
      id: newUser.id,
      username: newUser.username,
      nombre: newUser.nombre,
    },
  });
});

// POST /usuarios/login - Login de consumidor
app.post("/usuarios/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      error: "Username y password son requeridos",
    });
  }

  const user = usuarios.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({
      error: "Credenciales incorrectas",
    });
  }

  res.status(200).json({
    message: "Login exitoso",
    usuario: { id: user.id, username: user.username, nombre: user.nombre },
  });
});

// ===== TIENDAS =====
// POST /tiendas/registro - Registro de tienda
app.post("/tiendas/registro", (req, res) => {
  const {
    username,
    password,
    nombre,
    descripcion,
    categoria,
    direccion,
    telefono,
    horario,
  } = req.body;

  if (
    !username ||
    !password ||
    !nombre ||
    !categoria ||
    !direccion ||
    !telefono
  ) {
    return res.status(400).json({
      error:
        "Los campos username, password, nombre, categoria, direccion y telefono son requeridos",
    });
  }

  // Verificar si la tienda ya existe
  const existingStore = tiendas.find((store) => store.username === username);
  if (existingStore) {
    return res.status(400).json({
      error: "El nombre de usuario de tienda ya existe",
    });
  }

  const newStore = {
    id: Date.now(),
    username,
    password,
    nombre,
    descripcion: descripcion || "",
    categoria,
    direccion,
    telefono,
    horario: horario || "Horario no especificado",
    rating: 0,
    tiempoEntrega: "30-45 min",
  };

  tiendas.push(newStore);

  res.status(201).json({
    message: "Tienda registrada exitosamente",
    tienda: {
      id: newStore.id,
      username: newStore.username,
      nombre: newStore.nombre,
    },
  });
});

// POST /tiendas/login - Login de tienda
app.post("/tiendas/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      error: "Username y password son requeridos",
    });
  }

  const tienda = tiendas.find(
    (t) => t.username === username && t.password === password
  );

  if (!tienda) {
    return res.status(401).json({
      error: "Credenciales incorrectas",
    });
  }

  res.status(200).json({
    message: "Login exitoso",
    tienda: { id: tienda.id, username: tienda.username, nombre: tienda.nombre },
  });
});

// GET /tiendas - Obtener todas las tiendas
app.get("/tiendas", (req, res) => {
  const tiendasPublicas = tiendas.map((tienda) => ({
    id: tienda.id,
    nombre: tienda.nombre,
    descripcion: tienda.descripcion,
    categoria: tienda.categoria,
    rating: tienda.rating,
    tiempoEntrega: tienda.tiempoEntrega,
    horario: tienda.horario,
  }));

  res.status(200).json({
    message: "Tiendas obtenidas correctamente",
    tiendas: tiendasPublicas,
  });
});

// ===== PRODUCTOS =====
// GET /tiendas/:id/productos - Obtener productos de una tienda específica
app.get("/tiendas/:id/productos", (req, res) => {
  const tiendaId = parseInt(req.params.id);

  const tienda = tiendas.find((t) => t.id === tiendaId);
  if (!tienda) {
    return res.status(404).json({
      error: "Tienda no encontrada",
    });
  }

  const productosTienda = productos.filter(
    (p) => p.tiendaId === tiendaId && p.disponible
  );

  res.status(200).json({
    message: "Productos de la tienda obtenidos correctamente",
    tienda: {
      id: tienda.id,
      nombre: tienda.nombre,
      descripcion: tienda.descripcion,
      categoria: tienda.categoria,
      rating: tienda.rating,
      tiempoEntrega: tienda.tiempoEntrega,
    },
    productos: productosTienda,
  });
});

// POST /tiendas/:id/productos - Crear producto en una tienda
app.post("/tiendas/:id/productos", (req, res) => {
  const tiendaId = parseInt(req.params.id);
  const {
    nombre,
    descripcion,
    precio,
    imagen,
    categoria,
    tiempoPreparacion,
    tiendaId: bodyTiendaId,
  } = req.body;

  if (!nombre || !precio || !categoria) {
    return res.status(400).json({
      error: "Los campos nombre, precio y categoria son requeridos",
    });
  }

  // Verificar que la tienda existe
  const tienda = tiendas.find((t) => t.id === tiendaId);
  if (!tienda) {
    return res.status(404).json({
      error: "Tienda no encontrada",
    });
  }

  // Validar que el tiendaId del body coincide con el de la URL
  if (bodyTiendaId && parseInt(bodyTiendaId) !== tiendaId) {
    return res.status(400).json({
      error: "El ID de la tienda no coincide",
    });
  }

  // Validar que es comida
  const categoriasComida = [
    "Pizza",
    "Hamburguesas",
    "Sushi",
    "Pollo",
    "Combo",
    "Bebida",
    "Postre",
    "Ensalada",
    "Pasta",
    "Carne",
    "hamburguesas",
    "pizza",
    "sushi",
    "comida-mexicana",
    "comida-china",
    "comida-italiana",
    "postres",
    "bebidas",
    "combos",
  ];
  if (!categoriasComida.includes(categoria)) {
    return res.status(400).json({
      error: "La categoría debe ser de comida válida",
    });
  }

  const nuevoProducto = {
    id: Date.now(),
    tiendaId,
    nombre,
    descripcion: descripcion || "",
    precio: parseFloat(precio),
    imagen:
      imagen ||
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    categoria,
    disponible: true,
    tiempoPreparacion: tiempoPreparacion || "20 min",
  };

  productos.push(nuevoProducto);

  res.status(201).json({
    message: "Producto creado exitosamente",
    producto: nuevoProducto,
  });
});

// ===== REPARTIDORES =====
// POST /repartidores/registro - Registro de repartidor
app.post("/repartidores/registro", (req, res) => {
  const { username, password, nombre, telefono } = req.body;

  if (!username || !password || !nombre || !telefono) {
    return res.status(400).json({
      error: "Todos los campos son requeridos",
    });
  }

  const existingRepartidor = repartidores.find((r) => r.username === username);
  if (existingRepartidor) {
    return res.status(400).json({
      error: "El nombre de usuario ya existe",
    });
  }

  const newRepartidor = {
    id: Date.now(),
    username,
    password,
    nombre,
    telefono,
    disponible: true,
  };

  repartidores.push(newRepartidor);

  res.status(201).json({
    message: "Repartidor registrado exitosamente",
    repartidor: {
      id: newRepartidor.id,
      username: newRepartidor.username,
      nombre: newRepartidor.nombre,
    },
  });
});

// POST /repartidores/login - Login de repartidor
app.post("/repartidores/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      error: "Username y password son requeridos",
    });
  }

  const repartidor = repartidores.find(
    (r) => r.username === username && r.password === password
  );

  if (!repartidor) {
    return res.status(401).json({
      error: "Credenciales incorrectas",
    });
  }

  res.status(200).json({
    message: "Login exitoso",
    repartidor: {
      id: repartidor.id,
      username: repartidor.username,
      nombre: repartidor.nombre,
    },
  });
});

// ===== PEDIDOS =====
// POST /pedidos - Crear nuevo pedido
app.post("/pedidos", (req, res) => {
  console.log("Recibiendo pedido:", req.body);
  const {
    usuarioId,
    tiendaId,
    productos: productosRequest,
    direccionEntrega,
  } = req.body;

  if (!usuarioId || !tiendaId || !productosRequest || !direccionEntrega) {
    return res.status(400).json({
      error: "Todos los campos son requeridos",
    });
  }

  // Verificar que el usuario existe
  const usuario = usuarios.find((u) => u.id === parseInt(usuarioId));
  if (!usuario) {
    return res.status(404).json({
      error: "Usuario no encontrado",
    });
  }

  // Verificar que la tienda existe
  const tienda = tiendas.find((t) => t.id === parseInt(tiendaId));
  if (!tienda) {
    return res.status(404).json({
      error: "Tienda no encontrada",
    });
  }

  // Calcular total del pedido
  let total = 0;
  const productosPedido = [];

  for (const item of productosRequest) {
    const productoEncontrado = productos.find((p) => p.id === item.productoId);
    if (
      !productoEncontrado ||
      productoEncontrado.tiendaId !== parseInt(tiendaId)
    ) {
      return res.status(400).json({
        error: "Producto no válido para esta tienda",
      });
    }

    const subtotal = productoEncontrado.precio * item.cantidad;
    total += subtotal;

    productosPedido.push({
      productoId: item.productoId,
      cantidad: item.cantidad,
      precioUnitario: productoEncontrado.precio,
      nombre: productoEncontrado.nombre,
    });
  }

  const nuevoPedido = {
    id: Date.now(),
    usuarioId: parseInt(usuarioId),
    tiendaId: parseInt(tiendaId),
    repartidorId: null,
    productos: productosPedido,
    total,
    estado: "pendiente",
    direccionEntrega,
    fechaCreacion: new Date(),
    tiempoEstimado: tienda.tiempoEntrega,
  };

  pedidos.push(nuevoPedido);

  res.status(201).json({
    message: "Pedido creado exitosamente",
    pedido: {
      id: nuevoPedido.id,
      total: nuevoPedido.total,
      estado: nuevoPedido.estado,
      tiempoEstimado: nuevoPedido.tiempoEstimado,
    },
  });
});

// GET /pedidos - Obtener pedidos (con filtros opcionales)
app.get("/pedidos", (req, res) => {
  const { estado, usuarioId, tiendaId, repartidorId } = req.query;

  let pedidosFiltrados = [...pedidos];

  if (estado) {
    pedidosFiltrados = pedidosFiltrados.filter((p) => p.estado === estado);
  }

  if (usuarioId) {
    pedidosFiltrados = pedidosFiltrados.filter(
      (p) => p.usuarioId === parseInt(usuarioId)
    );
  }

  if (tiendaId) {
    pedidosFiltrados = pedidosFiltrados.filter(
      (p) => p.tiendaId === parseInt(tiendaId)
    );
  }

  if (repartidorId) {
    pedidosFiltrados = pedidosFiltrados.filter(
      (p) => p.repartidorId === parseInt(repartidorId)
    );
  }

  // Enriquecer pedidos con información de usuario, tienda y repartidor
  const pedidosEnriquecidos = pedidosFiltrados.map((pedido) => {
    const usuario = usuarios.find((u) => u.id === pedido.usuarioId);
    const tienda = tiendas.find((t) => t.id === pedido.tiendaId);
    const repartidor = repartidores.find((r) => r.id === pedido.repartidorId);

    return {
      ...pedido,
      usuario: usuario
        ? { nombre: usuario.nombre, telefono: usuario.telefono }
        : null,
      tienda: tienda
        ? { nombre: tienda.nombre, direccion: tienda.direccion }
        : null,
      repartidor: repartidor
        ? { nombre: repartidor.nombre, telefono: repartidor.telefono }
        : null,
    };
  });

  res.status(200).json({
    message: "Pedidos obtenidos correctamente",
    pedidos: pedidosEnriquecidos,
  });
});

// PUT /pedidos/:id - Actualizar estado del pedido
app.put("/pedidos/:id", (req, res) => {
  const pedidoId = parseInt(req.params.id);
  const { estado, repartidorId } = req.body;

  if (!estado) {
    return res.status(400).json({
      error: "El campo estado es requerido",
    });
  }

  const pedidoIndex = pedidos.findIndex((p) => p.id === pedidoId);

  if (pedidoIndex === -1) {
    return res.status(404).json({
      error: "Pedido no encontrado",
    });
  }

  // Validar estado
  const estadosValidos = ["pendiente", "aceptado", "cancelado"];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({
      error: "Estado no válido",
    });
  }

  // Si se está aceptando, verificar que se asigne un repartidor
  if (estado === "aceptado" && !repartidorId) {
    return res.status(400).json({
      error: "Se debe asignar un repartidor para aceptar el pedido",
    });
  }

  // Actualizar pedido
  pedidos[pedidoIndex].estado = estado;
  if (repartidorId) {
    pedidos[pedidoIndex].repartidorId = parseInt(repartidorId);
  }

  res.status(200).json({
    message: "Estado del pedido actualizado correctamente",
    pedido: pedidos[pedidoIndex],
  });
});

// Ruta para obtener estadísticas
app.get("/stats", (req, res) => {
  res.status(200).json({
    totalUsuarios: usuarios.length,
    totalTiendas: tiendas.length,
    totalRepartidores: repartidores.length,
    totalProductos: productos.length,
    totalPedidos: pedidos.length,
    pedidosPendientes: pedidos.filter((p) => p.estado === "pendiente").length,
    pedidosAceptados: pedidos.filter((p) => p.estado === "aceptado").length,
  });
});

// Manejo de rutas no encontradas
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🍕 MiniRappi corriendo en http://localhost:${PORT}`);
  console.log(`📁 Archivos estáticos servidos en:`);
  console.log(`   - /app1 (Consumidor)`);
  console.log(`   - /app2 (Repartidor)`);
  console.log(`   - /app3 (Tienda)`);
  console.log(`   - / (Página principal)`);
  console.log(`🔗 Endpoints disponibles:`);
  console.log(`   - POST /usuarios/registro, /usuarios/login`);
  console.log(`   - POST /tiendas/registro, /tiendas/login, GET /tiendas`);
  console.log(`   - GET /tiendas/:id/productos, POST /tiendas/:id/productos`);
  console.log(`   - POST /repartidores/registro, /repartidores/login`);
  console.log(`   - GET, POST /pedidos, PUT /pedidos/:id`);
  console.log(`   - GET /stats`);
});
