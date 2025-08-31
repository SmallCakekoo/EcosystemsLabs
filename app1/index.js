// Estado de la aplicación
let currentUser = null;
let currentView = "stores"; // 'stores', 'products', 'orders'
let currentStore = null;
let tiendas = []; // Global tiendas array
let myOrders = []; // Mis pedidos
let ordersPollingInterval = null; // Para el polling de pedidos

// Elementos del DOM
const loginSection = document.getElementById("loginSection");
const mainSection = document.getElementById("mainSection");
const storesSection = document.getElementById("storesSection");
const storeProductsSection = document.getElementById("storeProductsSection");
const myOrdersSection = document.getElementById("myOrdersSection");

// Tabs de login
const loginTab = document.querySelector('[data-tab="login"]');
const registerTab = document.querySelector('[data-tab="register"]');
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

// Navigation tabs
const storesTab = document.getElementById("storesTab");
const ordersTab = document.getElementById("ordersTab");

// Formularios
const loginUsernameInput = document.getElementById("loginUsername");
const loginPasswordInput = document.getElementById("loginPassword");
const registerUsernameInput = document.getElementById("registerUsername");
const registerPasswordInput = document.getElementById("registerPassword");

// Botones
const loginBtn = document.querySelector("#loginForm .btn-login");
const registerBtn = document.querySelector("#registerForm .btn-login");
const logoutBtn = document.getElementById("logoutBtn");
const backToStoresBtn = document.getElementById("backToStores");
const refreshStoresBtn = document.getElementById("refreshStoresBtn");
const refreshOrdersBtn = document.getElementById("refreshOrdersBtn");

// Contenedores
const storesGrid = document.getElementById("storesList");
const productsGrid = document.getElementById("productsList");
const myOrdersList = document.getElementById("myOrdersList");
const userDisplay = document.getElementById("userDisplay");

// Event Listeners
document.addEventListener("DOMContentLoaded", function () {
  // Tabs de login
  loginTab.addEventListener("click", () => switchTab("login"));
  registerTab.addEventListener("click", () => switchTab("register"));

  // Formularios
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleLogin();
  });
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleRegister();
  });

  // Navigation tabs
  storesTab.addEventListener("click", () => switchView("stores"));
  ordersTab.addEventListener("click", () => switchView("orders"));

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }

  // Navegación
  if (backToStoresBtn) {
    backToStoresBtn.addEventListener("click", showStores);
  }

  // Refresh buttons
  if (refreshStoresBtn) {
    refreshStoresBtn.addEventListener("click", loadStores);
  }
  if (refreshOrdersBtn) {
    refreshOrdersBtn.addEventListener("click", loadMyOrders);
  }

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

// Cambiar entre vistas principales
function switchView(view) {
  currentView = view;

  // Actualizar tabs activos
  if (view === "stores") {
    storesTab.classList.add("active");
    ordersTab.classList.remove("active");
    storesSection.classList.add("active");
    myOrdersSection.classList.remove("active");
    storeProductsSection.style.display = "none";
    loadStores();
  } else if (view === "orders") {
    ordersTab.classList.add("active");
    storesTab.classList.remove("active");
    myOrdersSection.classList.add("active");
    storesSection.classList.remove("active");
    storeProductsSection.style.display = "none";
    loadMyOrders();
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
    const response = await fetch("/usuarios/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      currentUser = data.usuario;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      showMessage("¡Bienvenido de vuelta!", "success");
      showMainSection();
    } else {
      showMessage(data.error || "Error en el login", "error");
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
  const nombre = document.getElementById("registerNombre").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const telefono = document.getElementById("registerTelefono").value.trim();

  if (!username || !password || !nombre || !email || !telefono) {
    showMessage("Por favor completa todos los campos", "error");
    return;
  }

  try {
    const response = await fetch("/usuarios/registro", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, nombre, email, telefono }),
    });

    const data = await response.json();

    if (response.ok) {
      currentUser = data.usuario;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      showMessage("¡Registro exitoso! Bienvenido a MiniRappi", "success");
      showMainSection();
    } else {
      showMessage(data.error || "Error en el registro", "error");
    }
  } catch (error) {
    showMessage("Error de conexión", "error");
    console.error("Error:", error);
  }
}

// Manejar logout
function handleLogout() {
  currentUser = null;
  currentView = "stores";
  currentStore = null;
  myOrders = [];
  localStorage.removeItem("currentUser");

  // Detener polling de pedidos
  if (ordersPollingInterval) {
    clearInterval(ordersPollingInterval);
    ordersPollingInterval = null;
  }

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
  currentView = "login";
  loginSection.style.display = "flex";
  mainSection.style.display = "none";

  // Limpiar formularios
  loginUsernameInput.value = "";
  loginPasswordInput.value = "";
  registerUsernameInput.value = "";
  registerPasswordInput.value = "";
  document.getElementById("registerNombre").value = "";
  document.getElementById("registerEmail").value = "";
  document.getElementById("registerTelefono").value = "";
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
  if (userDisplay) {
    userDisplay.textContent = currentUser.nombre;
  }

  // Mostrar vista por defecto
  switchView("stores");

  // Iniciar polling de pedidos
  startOrdersPolling();
}

// Cargar tiendas
async function loadStores() {
  try {
    const response = await fetch("/tiendas");
    const data = await response.json();

    if (response.ok) {
      tiendas = data.tiendas || [];
      displayStores(tiendas);
    } else {
      showMessage("Error al cargar las tiendas", "error");
    }
  } catch (error) {
    showMessage("Error al cargar las tiendas", "error");
    console.error("Error:", error);
  }
}

// Mostrar tiendas
function showStores() {
  switchView("stores");
}

// Mostrar productos de una tienda
async function showStoreProducts(tiendaId) {
  if (!currentUser) return;

  currentView = "products";
  storesSection.classList.remove("active");
  myOrdersSection.classList.remove("active");
  storeProductsSection.style.display = "block";

  try {
    const response = await fetch(`/tiendas/${tiendaId}/productos`);
    const data = await response.json();

    if (response.ok) {
      currentStore = data.tienda;
      displayStoreProducts(data.productos || []);
      displayStoreInfo(data.tienda);
    } else {
      showMessage("Error al cargar los productos", "error");
    }
  } catch (error) {
    showMessage("Error al cargar los productos", "error");
    console.error("Error:", error);
  }
}

// Mostrar información de la tienda
function displayStoreInfo(tienda) {
  const storeInfo = document.getElementById("storeInfo");
  const storeName = document.getElementById("storeName");

  if (storeName) {
    storeName.textContent = tienda.nombre;
  }

  if (storeInfo) {
    storeInfo.innerHTML = `
      <div class="store-info-content">
        <div class="store-info-item">
          <strong>Descripción:</strong> ${
            tienda.descripcion || "Sin descripción"
          }
        </div>
        <div class="store-info-item">
          <strong>Categoría:</strong> ${tienda.categoria}
        </div>
        <div class="store-info-item">
          <strong>Tiempo de entrega:</strong> ${
            tienda.tiempoEntrega || "30-45 min"
          }
        </div>
        <div class="store-info-item">
          <strong>Rating:</strong> ⭐⭐⭐⭐⭐ ${tienda.rating || "4.5"}
        </div>
      </div>
    `;
  }
}

// Mostrar tiendas en el grid
function displayStores(tiendas) {
  if (!storesGrid) return;

  storesGrid.innerHTML = "";

  if (tiendas.length === 0) {
    storesGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--rappi-gray-dark);">
        <div style="font-size: 3rem; margin-bottom: 20px;">🏪</div>
        <h3>No hay restaurantes disponibles</h3>
        <p>Intenta más tarde</p>
      </div>
    `;
    return;
  }

  tiendas.forEach((tienda) => {
    const storeCard = document.createElement("div");
    storeCard.className = "store-card";
    storeCard.onclick = () => showStoreProducts(tienda.id);

    storeCard.innerHTML = `
      <div class="store-header">
        <div class="store-icon">🏪</div>
        <div>
          <div class="store-name">${tienda.nombre}</div>
          <div class="store-category">${tienda.categoria}</div>
        </div>
      </div>
      <div class="store-description">${
        tienda.descripcion || "Deliciosa comida para llevar"
      }</div>
      <div class="store-meta">
        <div class="store-rating">
          <span class="rating-stars">⭐⭐⭐⭐⭐</span>
          <span>${tienda.rating || "4.5"}</span>
        </div>
        <div class="store-delivery">${tienda.tiempoEntrega || "30-45 min"}</div>
      </div>
    `;

    storesGrid.appendChild(storeCard);
  });
}

// Mostrar productos de una tienda
function displayStoreProducts(productos) {
  if (!productsGrid) return;

  productsGrid.innerHTML = "";

  if (productos.length === 0) {
    productsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--rappi-gray-dark);">
        <div style="font-size: 3rem; margin-bottom: 20px;">🍽️</div>
        <h3>No hay productos disponibles</h3>
        <p>Esta tienda aún no tiene productos</p>
      </div>
    `;
    return;
  }

  productos.forEach((producto) => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";

    productCard.innerHTML = `
      <img src="${producto.imagen}" alt="${
      producto.nombre
    }" class="product-image" 
           onerror="this.src='https://via.placeholder.com/300x200/FF4940/FFFFFF?text=${encodeURIComponent(
             producto.nombre
           )}'">
      <div class="product-content">
        <div class="product-name">${producto.nombre}</div>
        <div class="product-description">${
          producto.descripcion || "Delicioso producto de comida"
        }</div>
        <div class="product-footer">
          <div class="product-price">$${producto.precio}</div>
          <button class="btn-add-to-cart" onclick="createOrderImmediately(${JSON.stringify(
            producto
          ).replace(/"/g, "&quot;")})">
            Agregar
          </button>
        </div>
      </div>
    `;

    productsGrid.appendChild(productCard);
  });
}

// Cargar mis pedidos
async function loadMyOrders() {
  if (!currentUser) return;

  try {
    const response = await fetch(`/pedidos?usuarioId=${currentUser.id}`);
    const data = await response.json();

    if (response.ok) {
      myOrders = data.pedidos || [];
      displayMyOrders(myOrders);
    } else {
      showMessage("Error al cargar los pedidos", "error");
    }
  } catch (error) {
    showMessage("Error al cargar los pedidos", "error");
    console.error("Error:", error);
  }
}

// Mostrar mis pedidos
function displayMyOrders(pedidos) {
  if (!myOrdersList) return;

  myOrdersList.innerHTML = "";

  if (pedidos.length === 0) {
    myOrdersList.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--rappi-gray-dark);">
        <div style="font-size: 3rem; margin-bottom: 20px;">📦</div>
        <h3>No tienes pedidos aún</h3>
        <p>¡Haz tu primer pedido!</p>
      </div>
    `;
    return;
  }

  pedidos.forEach((pedido) => {
    const orderCard = createOrderCard(pedido);
    myOrdersList.appendChild(orderCard);
  });
}

// Crear tarjeta de pedido
function createOrderCard(pedido) {
  const orderCard = document.createElement("div");
  orderCard.className = `order-card ${pedido.estado}`;

  // Calcular total del pedido
  const total = pedido.productos.reduce((sum, producto) => {
    return sum + producto.precioUnitario * producto.cantidad;
  }, 0);

  // Formatear fecha
  const orderDate = new Date(pedido.fechaCreacion);
  const timeString = orderDate.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Crear tracking steps
  const trackingSteps = createTrackingSteps(pedido.estado, orderDate);

  orderCard.innerHTML = `
    <div class="order-header">
      <div class="order-id">Pedido #${pedido.id}</div>
      <div class="order-status ${pedido.estado}">${pedido.estado}</div>
    </div>
    
    <div class="order-details">
      <div class="order-store">
        <div class="store-icon-small">🏪</div>
        <div class="store-name-small">${pedido.tienda?.nombre || "Tienda"}</div>
      </div>
      
      <div class="order-products">
        <h4>Productos</h4>
        ${pedido.productos
          .map(
            (producto) => `
          <div class="product-item">
            <span class="product-name">${producto.nombre}</span>
            <span class="product-quantity">x${producto.cantidad}</span>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
    
    <div class="order-meta">
      <div class="order-total">$${total}</div>
      <div class="order-time">${timeString}</div>
    </div>

    <div class="order-tracking">
      ${trackingSteps}
    </div>
  `;

  return orderCard;
}

// Crear pasos de tracking
function createTrackingSteps(estado, orderDate) {
  const steps = [
    { id: "pedido", title: "Pedido Realizado", icon: "📝", completed: true },
    {
      id: "aceptado",
      title: "Pedido Aceptado",
      icon: "✅",
      completed: estado === "aceptado",
    },
  ];

  return steps
    .map((step) => {
      let statusClass = "pending";
      if (step.completed) {
        statusClass = estado === step.id ? "current" : "completed";
      }

      return `
      <div class="tracking-step">
        <div class="tracking-icon ${statusClass}">${step.icon}</div>
        <div class="tracking-text">
          <div class="tracking-title">${step.title}</div>
          <div class="tracking-time">${
            step.completed
              ? orderDate.toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Pendiente"
          }</div>
        </div>
      </div>
    `;
    })
    .join("");
}

// Iniciar polling de pedidos
function startOrdersPolling() {
  // Detener polling anterior si existe
  if (ordersPollingInterval) {
    clearInterval(ordersPollingInterval);
  }

  // Cargar pedidos inmediatamente
  loadMyOrders();

  // Configurar polling cada 5 segundos
  ordersPollingInterval = setInterval(() => {
    if (currentView === "orders") {
      loadMyOrders();
    }
  }, 5000);
}

// Crear pedido inmediatamente
async function createOrderImmediately(producto) {
  if (!currentUser) {
    showMessage("Debes iniciar sesión para hacer pedidos", "error");
    return;
  }

  if (!currentStore) {
    showMessage("Error: No hay tienda seleccionada", "error");
    return;
  }

  try {
    // Mostrar mensaje de procesamiento
    showMessage("Creando tu pedido...", "info");

    const productos = [
      {
        productoId: producto.id,
        cantidad: 1,
      },
    ];

    // Debug: mostrar qué se está enviando
    console.log("Enviando pedido:", {
      usuarioId: currentUser.id,
      tiendaId: currentStore.id,
      productos: productos,
      direccionEntrega: currentUser.direccion || "Dirección del cliente",
    });

    const response = await fetch("/pedidos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        usuarioId: currentUser.id,
        tiendaId: currentStore.id,
        productos: productos,
        direccionEntrega: currentUser.direccion || "Dirección del cliente",
      }),
    });

    const data = await response.json();

    if (response.ok) {
      showMessage(
        `¡Pedido de ${producto.nombre} creado con éxito! Estado: Pendiente`,
        "success"
      );

      // Recargar pedidos para mostrar el nuevo
      loadMyOrders();

      // Cambiar a la vista de pedidos para que el usuario vea su pedido
      switchView("orders");
    } else {
      showMessage(data.error || "Error al crear el pedido", "error");
    }
  } catch (error) {
    showMessage("Error de conexión", "error");
    console.error("Error:", error);
  }
}

// Mostrar mensajes
function showMessage(message, type = "info") {
  // Remover mensajes existentes
  const existingMessages = document.querySelectorAll(
    ".error-message, .success-message, .info-message"
  );
  existingMessages.forEach((msg) => msg.remove());

  const messageDiv = document.createElement("div");
  messageDiv.className = `${type}-message`;
  messageDiv.textContent = message;

  // Insertar al inicio del contenedor principal
  const container = document.querySelector(".container");
  if (container) {
    container.insertBefore(messageDiv, container.firstChild);

    // Auto-remover después de 5 segundos
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 5000);
  }
}

// Funciones globales para onclick en HTML
window.createOrderImmediately = createOrderImmediately;
