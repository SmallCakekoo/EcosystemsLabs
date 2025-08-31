// Estado de la aplicación
let currentUser = null;
let currentFilter = "pendiente"; // 'pendiente', 'aceptado'
let orders = [];

// Elementos del DOM
const loginSection = document.getElementById("loginSection");
const mainSection = document.getElementById("mainSection");
const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

// Formularios
const loginUsernameInput = document.getElementById("loginUsername");
const loginPasswordInput = document.getElementById("loginPassword");
const registerUsernameInput = document.getElementById("registerUsername");
const registerPasswordInput = document.getElementById("registerPassword");
const registerNameInput = document.getElementById("registerName");
const registerPhoneInput = document.getElementById("registerPhone");

// Botones
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const logoutBtn = document.getElementById("logoutBtn");
const pendingTab = document.getElementById("pendingTab");
const acceptedTab = document.getElementById("acceptedTab");

// Contenedores
const ordersGrid = document.getElementById("ordersGrid");
const loading = document.getElementById("loading");
const noOrders = document.getElementById("noOrders");
const userName = document.getElementById("userName");

// Event Listeners
document.addEventListener("DOMContentLoaded", function () {
  // Tabs de login
  loginTab.addEventListener("click", () => switchTab("login"));
  registerTab.addEventListener("click", () => switchTab("register"));

  // Formularios
  loginBtn.addEventListener("click", handleLogin);
  registerBtn.addEventListener("click", handleRegister);
  logoutBtn.addEventListener("click", handleLogout);

  // Filtros de pedidos
  pendingTab.addEventListener("click", () => switchFilter("pendiente"));
  acceptedTab.addEventListener("click", () => switchFilter("aceptado"));

  // Verificar si ya hay un usuario logueado
  checkAuthStatus();
});

// Cambiar entre tabs de login
function switchTab(tab) {
  if (tab === "login") {
    loginTab.classList.add("active");
    registerTab.classList.remove("active");
    loginForm.classList.add("active");
    registerForm.classList.remove("active");
  } else {
    registerTab.classList.add("active");
    loginTab.classList.remove("active");
    registerForm.classList.add("active");
    loginForm.classList.remove("active");
  }
}

// Manejar login
async function handleLogin() {
  const username = loginUsernameInput.value.trim();
  const password = loginPasswordInput.value.trim();

  if (!username || !password) {
    showMessage("Por favor completa todos los campos", "error");
    return;
  }

  try {
    const response = await fetch("/repartidores/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      currentUser = data.repartidor;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      showMessage("¡Bienvenido de vuelta!", "success");
      showMainSection();
    } else {
      showMessage(data.message || "Error en el login", "error");
    }
  } catch (error) {
    showMessage("Error de conexión", "error");
    console.error("Error:", error);
  }
}

// Manejar registro
async function handleRegister() {
  const username = registerUsernameInput.value.trim();
  const password = registerPasswordInput.value.trim();
  const name = registerNameInput.value.trim();
  const phone = registerPhoneInput.value.trim();

  if (!username || !password || !name || !phone) {
    showMessage("Por favor completa todos los campos", "error");
    return;
  }

  try {
    const response = await fetch("/repartidores/registro", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
        nombre: name,
        telefono: phone,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      currentUser = data.repartidor;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      showMessage("¡Registro exitoso! Bienvenido a MiniRappi", "success");
      showMainSection();
    } else {
      showMessage(data.message || "Error en el registro", "error");
    }
  } catch (error) {
    showMessage("Error de conexión", "error");
    console.error("Error:", error);
  }
}

// Manejar logout
function handleLogout() {
  currentUser = null;
  orders = [];
  localStorage.removeItem("currentUser");
  showLogin();
}

// Verificar estado de autenticación
function checkAuthStatus() {
  const savedUser = localStorage.getItem("currentUser");
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    showMainSection();
  } else {
    showLogin();
  }
}

// Mostrar vista de login
function showLogin() {
  loginSection.style.display = "flex";
  mainSection.style.display = "none";

  // Limpiar formularios
  loginUsernameInput.value = "";
  loginPasswordInput.value = "";
  registerUsernameInput.value = "";
  registerPasswordInput.value = "";
  registerNameInput.value = "";
  registerPhoneInput.value = "";
}

// Mostrar sección principal
function showMainSection() {
  if (!currentUser) {
    showLogin();
    return;
  }

  loginSection.style.display = "none";
  mainSection.style.display = "block";

  // Actualizar nombre del usuario
  userName.textContent = currentUser.nombre || currentUser.username;

  // Cargar pedidos
  loadOrders();
}

// Cambiar filtro de pedidos
function switchFilter(filter) {
  currentFilter = filter;

  // Actualizar tabs activos
  if (filter === "pendiente") {
    pendingTab.classList.add("active");
    acceptedTab.classList.remove("active");
  } else {
    acceptedTab.classList.add("active");
    pendingTab.classList.remove("active");
  }

  // Filtrar y mostrar pedidos
  displayOrders();
}

// Cargar pedidos del backend
async function loadOrders() {
  try {
    showLoading(true);
    hideNoOrders();

    const response = await fetch("/pedidos");
    const data = await response.json();

    if (response.ok) {
      orders = data.pedidos || [];
      displayOrders();
    } else {
      showMessage("Error al cargar los pedidos", "error");
    }
  } catch (error) {
    showMessage("Error de conexión", "error");
    console.error("Error:", error);
  } finally {
    showLoading(false);
  }
}

// Mostrar pedidos filtrados
function displayOrders() {
  const filteredOrders = orders.filter((order) => {
    if (currentFilter === "pendiente") {
      return order.estado === "pendiente";
    } else {
      return (
        order.estado === "aceptado" && order.repartidorId === currentUser.id
      );
    }
  });

  if (filteredOrders.length === 0) {
    showNoOrders();
    return;
  }

  hideNoOrders();
  ordersGrid.innerHTML = "";

  filteredOrders.forEach((order) => {
    const orderCard = createOrderCard(order);
    ordersGrid.appendChild(orderCard);
  });
}

// Crear tarjeta de pedido
function createOrderCard(order) {
  const orderCard = document.createElement("div");
  orderCard.className = `order-card ${order.estado}`;

  // Calcular total del pedido
  const total = order.productos.reduce((sum, producto) => {
    return (
      sum + (producto.precioUnitario || producto.precio) * producto.cantidad
    );
  }, 0);

  // Formatear fecha
  const orderDate = new Date(order.fechaCreacion || order.fecha);
  const timeString = orderDate.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  orderCard.innerHTML = `
        <div class="order-header">
            <div class="order-id">Pedido #${order.id}</div>
            <div class="order-status ${order.estado}">${order.estado}</div>
        </div>
        
        <div class="order-details">
            <div class="order-store">
                <div class="store-icon">🏪</div>
                <div class="store-name">${
                  order.tienda?.nombre || "Tienda"
                }</div>
            </div>
            
            <div class="order-products">
                <h4>Productos</h4>
                ${order.productos
                  .map(
                    (producto) => `
                    <div class="product-item">
                        <span class="product-name">${
                          producto.nombre || producto.name || "Producto"
                        }</span>
                        <span class="product-quantity">x${
                          producto.cantidad || producto.quantity || 1
                        }</span>
                    </div>
                `
                  )
                  .join("")}
            </div>
        </div>
        
        <div class="order-meta">
            <div class="order-total">$${total.toLocaleString()}</div>
            <div class="order-time">${timeString}</div>
        </div>
        
        <div class="order-actions">
            ${
              order.estado === "pendiente"
                ? `<button class="btn-accept" onclick="acceptOrder(${order.id})">Aceptar Pedido</button>`
                : `<button class="btn-view-details" onclick="viewOrderDetails(${order.id})">Ver Detalles</button>`
            }
        </div>
    `;

  return orderCard;
}

// Aceptar pedido
async function acceptOrder(orderId) {
  try {
    const response = await fetch(`/pedidos/${orderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        estado: "aceptado",
        repartidorId: currentUser.id,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      showMessage("¡Pedido aceptado exitosamente!", "success");
      // Recargar pedidos
      loadOrders();
    } else {
      showMessage(data.message || "Error al aceptar el pedido", "error");
    }
  } catch (error) {
    showMessage("Error de conexión", "error");
    console.error("Error:", error);
  }
}

// Ver detalles del pedido
function viewOrderDetails(orderId) {
  const order = orders.find((o) => o.id === orderId);
  if (order) {
    alert(
      `Detalles del pedido #${order.id}:\n\n` +
        `Tienda: ${order.tienda?.nombre || "N/A"}\n` +
        `Cliente: ${order.usuario?.nombre || "N/A"}\n` +
        `Estado: ${order.estado}\n` +
        `Total: $${order.productos
          .reduce(
            (sum, p) => sum + (p.precioUnitario || p.precio) * p.cantidad,
            0
          )
          .toLocaleString()}`
    );
  }
}

// Mostrar/ocultar loading
function showLoading(show) {
  loading.style.display = show ? "flex" : "none";
}

// Mostrar/ocultar mensaje de no pedidos
function showNoOrders() {
  noOrders.style.display = "block";
  ordersGrid.innerHTML = "";
}

function hideNoOrders() {
  noOrders.style.display = "none";
}

// Mostrar mensajes
function showMessage(message, type = "info") {
  // Remover mensajes existentes
  const existingMessages = document.querySelectorAll(
    ".error-message, .success-message"
  );
  existingMessages.forEach((msg) => msg.remove());

  const messageDiv = document.createElement("div");
  messageDiv.className = `${type}-message`;
  messageDiv.textContent = message;

  // Insertar al inicio del contenedor principal
  const container = document.querySelector(".container");
  container.insertBefore(messageDiv, container.firstChild);

  // Auto-remover después de 5 segundos
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.remove();
    }
  }, 5000);
}
