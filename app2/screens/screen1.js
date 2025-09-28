import { makeRequest } from "../app.js";

export default function renderScreen1() {
  const app = document.getElementById("app");
  app.innerHTML = `
      <div id="screen1">
        <h2>Laboratorio de Bases de Datos - App 2</h2>
        
        <div class="section">
          <h3>Productos</h3>
          <button id="get-all-products">Todos los productos</button>
          <button id="get-cheap-products">Productos baratos (&lt;50)</button>
          <button id="get-electronics">Electrónicos (&gt;30)</button>
          <button id="get-page1">Página 1 (paginación)</button>
          <button id="get-page2">Página 2 (paginación)</button>
        </div>

        <div class="section">
          <h3>Usuarios</h3>
          <button id="get-users-basic">Usuarios básicos</button>
          <button id="get-all-users">Todos los usuarios</button>
          <button id="get-user1-products">Productos del usuario 1</button>
        </div>

        <div class="section">
          <h3>Órdenes y Posts</h3>
          <button id="get-orders">Todas las órdenes</button>
          <button id="search-tutorial-posts">Buscar posts "tutorial"</button>
        </div>

        <div class="section">
          <h3>Navegación</h3>
          <button id="go-to-app1">Ir a App1 (Rosa)</button>
        </div>

        <div id="results" class="results"></div>
    </div>
      `;

  // Event listeners para productos
  document
    .getElementById("get-all-products")
    .addEventListener("click", getAllProducts);
  document
    .getElementById("get-cheap-products")
    .addEventListener("click", getCheapProducts);
  document
    .getElementById("get-electronics")
    .addEventListener("click", getElectronicsProducts);
  document
    .getElementById("get-page1")
    .addEventListener("click", () => getProductsPage(1));
  document
    .getElementById("get-page2")
    .addEventListener("click", () => getProductsPage(2));

  // Event listeners para usuarios
  document
    .getElementById("get-users-basic")
    .addEventListener("click", getUsersBasic);
  document
    .getElementById("get-all-users")
    .addEventListener("click", getAllUsers);
  document
    .getElementById("get-user1-products")
    .addEventListener("click", () => getUserProducts(1));

  // Event listeners para órdenes y posts
  document.getElementById("get-orders").addEventListener("click", getOrders);
  document
    .getElementById("search-tutorial-posts")
    .addEventListener("click", searchTutorialPosts);

  // Event listener para navegación
  document.getElementById("go-to-app1").addEventListener("click", goToApp1);

  function displayResults(title, data) {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = `
      <h4>${title}</h4>
      <pre>${JSON.stringify(data, null, 2)}</pre>
    `;
  }

  // Funciones para productos
  async function getAllProducts() {
    try {
      const response = await makeRequest("/products", "GET");
      displayResults("Todos los productos", response);
      console.log("Todos los productos:", response);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async function getCheapProducts() {
    try {
      const response = await makeRequest("/products/cheap", "GET");
      displayResults("Productos baratos (precio < 50)", response);
      console.log("Productos baratos:", response);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async function getElectronicsProducts() {
    try {
      const response = await makeRequest("/products/electronics", "GET");
      displayResults("Productos electrónicos (precio > 30)", response);
      console.log("Productos electrónicos:", response);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async function getProductsPage(page) {
    try {
      const response = await makeRequest(`/products/page/${page}`, "GET");
      displayResults(`Productos página ${page}`, response);
      console.log(`Productos página ${page}:`, response);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  // Funciones para usuarios
  async function getUsersBasic() {
    try {
      const response = await makeRequest("/users/basic", "GET");
      displayResults("Usuarios básicos (username y email)", response);
      console.log("Usuarios básicos:", response);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async function getAllUsers() {
    try {
      const response = await makeRequest("/users", "GET");
      displayResults("Todos los usuarios", response);
      console.log("Todos los usuarios:", response);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async function getUserProducts(userId) {
    try {
      const response = await makeRequest(`/users/${userId}/products`, "GET");
      displayResults(`Productos del usuario ${userId}`, response);
      console.log(`Productos del usuario ${userId}:`, response);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  // Funciones para órdenes y posts
  async function getOrders() {
    try {
      const response = await makeRequest("/orders", "GET");
      displayResults("Todas las órdenes (ordenadas por fecha desc)", response);
      console.log("Todas las órdenes:", response);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async function searchTutorialPosts() {
    try {
      const response = await makeRequest("/posts/search?title=tutorial", "GET");
      displayResults('Posts que contienen "tutorial"', response);
      console.log('Posts "tutorial":', response);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  function goToApp1() {
    // Redirigir a App1
    window.location.href = "http://localhost:5050/app1/index.html";
  }
}
