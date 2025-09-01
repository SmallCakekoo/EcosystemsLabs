// Estado de la aplicación
let currentUser = null;
let currentTab = "products"; // 'products', 'orders'
let products = [];
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
const registerStoreNameInput = document.getElementById("registerStoreName");
const registerCategoryInput = document.getElementById("registerCategory");
const registerDescriptionInput = document.getElementById("registerDescription");

// Botones
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const logoutBtn = document.getElementById("logoutBtn");
const productsTab = document.getElementById("productsTab");
const ordersTab = document.getElementById("ordersTab");
const addProductBtn = document.getElementById("addProductBtn");
const cancelProductBtn = document.getElementById("cancelProductBtn");
const refreshOrdersBtn = document.getElementById("refreshOrdersBtn");
const storeStatusToggle = document.getElementById("storeStatusToggle");

// Contenedores
const productsSection = document.getElementById("productsSection");
const ordersSection = document.getElementById("ordersSection");
const addProductForm = document.getElementById("addProductForm");
const productsGrid = document.getElementById("productsGrid");
const ordersGrid = document.getElementById("ordersGrid");
const productForm = document.getElementById("productForm");

// Formulario de producto
const productNameInput = document.getElementById("productName");
const productPriceInput = document.getElementById("productPrice");
const productCategoryInput = document.getElementById("productCategory");
const productImageInput = document.getElementById("productImage");
const productDescriptionInput = document.getElementById("productDescription");

// Stats
const totalProducts = document.getElementById("totalProducts");
const totalOrders = document.getElementById("totalOrders");
const totalRevenue = document.getElementById("totalRevenue");
const storeName = document.getElementById("storeName");

// Event Listeners
document.addEventListener("DOMContentLoaded", async function () {
  // Tabs de login
  loginTab.addEventListener("click", () => switchTab("login"));
  registerTab.addEventListener("click", () => switchTab("register"));

  // Formularios
  loginBtn.addEventListener("click", handleLogin);
  registerBtn.addEventListener("click", handleRegister);
  logoutBtn.addEventListener("click", handleLogout);

  // Tabs de contenido
  productsTab.addEventListener("click", () => switchContentTab("products"));
  ordersTab.addEventListener("click", () => switchContentTab("orders"));

  // Productos
  addProductBtn.addEventListener("click", toggleAddProductForm);
  cancelProductBtn.addEventListener("click", toggleAddProductForm);
  productForm.addEventListener("submit", handleCreateProduct);

  // Pedidos
  refreshOrdersBtn.addEventListener("click", loadOrders);

  // Estado de la tienda
  if (storeStatusToggle) {
    storeStatusToggle.addEventListener("change", handleStoreStatusChange);
  }

  // Verificar si ya hay un usuario logueado
  await checkAuthStatus();
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
    const response = await fetch("/tiendas/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      currentUser = data.tienda;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      showMessage("¡Bienvenido de vuelta!", "success");
      await showMainSection();
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
  const storeName = registerStoreNameInput.value.trim();
  const category = registerCategoryInput.value;
  const description = registerDescriptionInput.value.trim();
  const address = document.getElementById("registerAddress").value.trim();
  const phone = document.getElementById("registerPhone").value.trim();

  if (!username || !password || !storeName || !category || !address || !phone) {
    showMessage("Por favor completa todos los campos obligatorios", "error");
    return;
  }

  try {
    const response = await fetch("/tiendas/registro", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
        nombre: storeName,
        categoria: category,
        descripcion: description || "Deliciosa comida para llevar",
        direccion: address,
        telefono: phone,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      currentUser = data.tienda;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      showMessage("¡Registro exitoso! Bienvenido a MiniRappi", "success");
      await showMainSection();
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
  products = [];
  orders = [];
  localStorage.removeItem("currentUser");
  showLogin();
}

// Verificar estado de autenticación
async function checkAuthStatus() {
  const savedUser = localStorage.getItem("currentUser");
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    await showMainSection();
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
  registerStoreNameInput.value = "";
  registerCategoryInput.value = "";
  registerDescriptionInput.value = "";
  document.getElementById("registerAddress").value = "";
  document.getElementById("registerPhone").value = "";
}

// Mostrar sección principal
async function showMainSection() {
  if (!currentUser) {
    showLogin();
    return;
  }

  loginSection.style.display = "none";
  mainSection.style.display = "block";

  // Actualizar nombre de la tienda
  storeName.textContent = currentUser.nombre;

  // Configurar estado de la tienda
  await loadStoreStatus();

  // Cargar datos
  loadProducts();
  loadOrders();
  await updateStats();
}

// Cambiar entre tabs de contenido
function switchContentTab(tab) {
  currentTab = tab;

  // Actualizar tabs activos
  if (tab === "products") {
    productsTab.classList.add("active");
    ordersTab.classList.remove("active");
    productsSection.classList.add("active");
    ordersSection.classList.remove("active");
  } else {
    ordersTab.classList.add("active");
    productsTab.classList.remove("active");
    ordersSection.classList.add("active");
    productsSection.classList.remove("active");
  }
}

// Toggle del formulario de agregar producto
function toggleAddProductForm() {
  const isVisible = addProductForm.style.display !== "none";
  addProductForm.style.display = isVisible ? "none" : "block";

  if (!isVisible) {
    // Limpiar formulario
    productForm.reset();
  }
}

// Manejar creación de producto
async function handleCreateProduct(e) {
  e.preventDefault();

  const name = productNameInput.value.trim();
  const price = parseFloat(productPriceInput.value);
  const category = productCategoryInput.value;
  const image = productImageInput.value.trim();
  const description = productDescriptionInput.value.trim();

  if (!name || !price || !category) {
    showMessage("Por favor completa todos los campos obligatorios", "error");
    return;
  }

  try {
    // Ensure currentUser.id is properly set
    if (!currentUser || !currentUser.id) {
      showMessage("Error: No se pudo identificar la tienda", "error");
      return;
    }

    console.log(
      "Creating product for store ID:",
      currentUser.id,
      "Type:",
      typeof currentUser.id
    );

    const response = await fetch(`/tiendas/${currentUser.id}/productos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre: name,
        precio: price,
        categoria: category,
        tiendaId: currentUser.id, // Include store ID in body for validation
        imagen: image || "https://picsum.photos/300/200",
        descripcion: description || "Delicioso producto de comida",
      }),
    });

    const data = await response.json();

    if (response.ok) {
      showMessage("¡Producto creado exitosamente!", "success");
      toggleAddProductForm();
      loadProducts();
      await updateStats();
    } else {
      console.error("Error response:", data);
      showMessage(
        data.error || data.message || "Error al crear el producto",
        "error"
      );
    }
  } catch (error) {
    showMessage("Error de conexión", "error");
    console.error("Error:", error);
  }
}

// Cargar productos de la tienda
async function loadProducts() {
  try {
    if (!currentUser || !currentUser.id) {
      console.error("No currentUser or currentUser.id found:", currentUser);
      return;
    }

    const response = await fetch(`/tiendas/${currentUser.id}/productos`);
    const data = await response.json();

    if (response.ok) {
      products = data.productos || [];
      displayProducts();
    } else {
      console.error("Error loading products:", data);
      showMessage("Error al cargar los productos", "error");
    }
  } catch (error) {
    showMessage("Error de conexión", "error");
    console.error("Error:", error);
  }
}

// Mostrar productos
function displayProducts() {
  productsGrid.innerHTML = "";

  if (products.length === 0) {
    productsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--rappi-gray-dark);">
                <div style="font-size: 3rem; margin-bottom: 20px;"><i class="ri-restaurant-line"></i></div>
                <h3>No hay productos aún</h3>
                <p>Comienza agregando tu primer producto</p>
            </div>
        `;
    return;
  }

  products.forEach((producto) => {
    const productCard = createProductCard(producto);
    productsGrid.appendChild(productCard);
  });
}

// Crear tarjeta de producto
function createProductCard(producto) {
  const productCard = document.createElement("div");
  productCard.className = "product-card";

  // Manejar imagen con fallback apropiado
  const imageUrl =
    producto.imagen && producto.imagen.trim() !== ""
      ? producto.imagen
      : "https://picsum.photos/300/200";

  productCard.innerHTML = `
        <img src="${imageUrl}" alt="${producto.nombre}" class="product-image" 
             onerror="this.src='https://picsum.photos/300/200'">
        <div class="product-content">
            <div class="product-name">${producto.nombre}</div>
            <div class="product-description">${
              producto.descripcion || "Delicioso producto de comida"
            }</div>
            <div class="product-meta">
                <div class="product-price">$${producto.precio}</div>
                <div class="product-category">${producto.categoria}</div>
            </div>
            <div class="product-actions">
                <button class="btn-edit" onclick="editProduct(${
                  producto.id
                })"><i class="ri-edit-line"></i> Editar</button>
                <button class="btn-delete" onclick="deleteProduct(${
                  producto.id
                })"><i class="ri-delete-bin-line"></i> Eliminar</button>
            </div>
        </div>
    `;

  return productCard;
}

// Editar producto (placeholder)
function editProduct(productId) {
  showMessage("Función de edición próximamente disponible", "info");
}

// Eliminar producto (placeholder)
function deleteProduct(productId) {
  if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
    showMessage("Función de eliminación próximamente disponible", "info");
  }
}

// Cargar pedidos de la tienda
async function loadOrders() {
  try {
    const response = await fetch(`/pedidos?tiendaId=${currentUser.id}`);
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
  }
}

// Mostrar pedidos
function displayOrders() {
  ordersGrid.innerHTML = "";

  if (orders.length === 0) {
    ordersGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--rappi-gray-dark);">
                <div style="font-size: 3rem; margin-bottom: 20px;"><i class="ri-shopping-bag-line"></i></div>
                <h3>No hay pedidos aún</h3>
                <p>Los pedidos aparecerán aquí cuando los clientes ordenen</p>
            </div>
        `;
    return;
  }

  orders.forEach((pedido) => {
    const orderCard = createOrderCard(pedido);
    ordersGrid.appendChild(orderCard);
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

  orderCard.innerHTML = `
        <div class="order-header">
            <div class="order-id">Pedido #${pedido.id}</div>
            <div class="order-status ${pedido.estado}">${pedido.estado}</div>
        </div>
        
        <div class="order-details">
            <div class="order-customer">
                <div class="customer-icon"><i class="ri-user-line"></i></div>
                <div class="customer-name">${
                  pedido.usuario?.username || "Cliente"
                }</div>
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
    `;

  return orderCard;
}

// Obtener conteo de productos desde el backend
async function getProductsCount() {
  try {
    if (!currentUser || !currentUser.id) {
      return 0;
    }

    const response = await fetch(`/tiendas/${currentUser.id}/productos`);
    const data = await response.json();

    if (response.ok) {
      return (data.productos || []).length;
    } else {
      console.error("Error getting products count:", data);
      return 0;
    }
  } catch (error) {
    console.error("Error getting products count:", error);
    return 0;
  }
}

// Actualizar estadísticas
async function updateStats() {
  // Obtener conteo de productos desde el backend
  const productsCount = await getProductsCount();
  totalProducts.textContent = productsCount;

  totalOrders.textContent = orders.length;

  const revenue = orders.reduce((sum, pedido) => {
    return (
      sum +
      pedido.productos.reduce((orderSum, producto) => {
        return orderSum + producto.precioUnitario * producto.cantidad;
      }, 0)
    );
  }, 0);

  totalRevenue.textContent = `$${revenue}`;
}

// Funciones para manejar el estado de la tienda
async function loadStoreStatus() {
  try {
    // Obtener información actualizada de la tienda
    const response = await fetch(`/tiendas`);
    const data = await response.json();

    if (response.ok) {
      const currentStore = data.tiendas.find((t) => t.id === currentUser.id);
      if (currentStore) {
        // Actualizar el toggle
        storeStatusToggle.checked = currentStore.abierta;
        updateStoreStatusLabel(currentStore.abierta);
      }
    }
  } catch (error) {
    console.error("Error al cargar el estado de la tienda:", error);
  }
}

async function handleStoreStatusChange() {
  const isOpen = storeStatusToggle.checked;

  try {
    const response = await fetch(`/tiendas/${currentUser.id}/estado`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ abierta: isOpen }),
    });

    const data = await response.json();

    if (response.ok) {
      showMessage(
        `Tienda ${isOpen ? "abierta" : "cerrada"} correctamente`,
        "success"
      );
      updateStoreStatusLabel(isOpen);
    } else {
      // Revertir el toggle si hay error
      storeStatusToggle.checked = !isOpen;
      showMessage(
        data.error || "Error al cambiar el estado de la tienda",
        "error"
      );
    }
  } catch (error) {
    // Revertir el toggle si hay error
    storeStatusToggle.checked = !isOpen;
    showMessage("Error de conexión", "error");
    console.error("Error:", error);
  }
}

function updateStoreStatusLabel(isOpen) {
  const toggleLabel = document.querySelector(".toggle-label");
  if (toggleLabel) {
    toggleLabel.textContent = isOpen ? "Tienda Abierta" : "Tienda Cerrada";
  }
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
