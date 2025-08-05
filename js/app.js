// Obtenemos los elementos del DOM para Anime
const animeSearchForm = document.getElementById("animeSearchForm");
const animeQuery = document.getElementById("animeQuery");
const animeType = document.getElementById("animeType");
const animeStatus = document.getElementById("animeStatus");
const animeLimit = document.getElementById("animeLimit");
const searchBtn = document.getElementById("searchBtn");

// Obtenemos los elementos del DOM para estados de Anime
const animeLoading = document.getElementById("animeLoading");
const animeError = document.getElementById("animeError");
const animeEmpty = document.getElementById("animeEmpty");
const animeResults = document.getElementById("animeResults");
const animeErrorMessage = document.getElementById("animeErrorMessage");

// Obtenemos los elementos del DOM para Cat Facts
const catFactBtn = document.getElementById("catFactBtn");
const catFactsLoading = document.getElementById("catFactsLoading");
const catFactsError = document.getElementById("catFactsError");
const catFactsResults = document.getElementById("catFactsResults");
const catFactsErrorMessage = document.getElementById("catFactsErrorMessage");

// Obtenemos los elementos del DOM para Random Cats
const colorPaletteBtn = document.getElementById("colorPaletteBtn");
const randomCatsLoading = document.getElementById("randomCatsLoading");
const randomCatsError = document.getElementById("randomCatsError");
const randomCatsResults = document.getElementById("randomCatsResults");
const randomCatsErrorMessage = document.getElementById(
  "randomCatsErrorMessage"
);

// Obtenemos los elementos del DOM para Random User
const randomUserBtn = document.getElementById("randomUserBtn");
const randomUserLoading = document.getElementById("randomUserLoading");
const randomUserError = document.getElementById("randomUserError");
const randomUserResults = document.getElementById("randomUserResults");
const randomUserErrorMessage = document.getElementById(
  "randomUserErrorMessage"
);

// Definimos event listeners para cada botón/API
catFactBtn.addEventListener("click", () => fetchCatFacts());
colorPaletteBtn.addEventListener("click", () => fetchRandomCats());
randomUserBtn.addEventListener("click", () => fetchRandomUser());
animeSearchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  searchAnime();
});

// Variable global para almacenar parámetros de búsqueda anterior
let lastSearchParams = {};

// Función para crear una petición con timeout
function fetchWithTimeout(url, options = {}, timeout = 10000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Timeout: La petición tardó demasiado")),
        timeout
      )
    ),
  ]);
}

// Función para mostrar estado de carga de Anime
function showAnimeLoading() {
  animeLoading.style.display = "block";
  animeError.style.display = "none";
  animeEmpty.style.display = "none";
  animeResults.innerHTML = "";
}

// Función para ocultar estado de carga de Anime
function hideAnimeLoading() {
  animeLoading.style.display = "none";
}

// Función para mostrar error en búsqueda de Anime
function showAnimeError(message) {
  hideAnimeLoading();
  animeError.style.display = "block";
  animeEmpty.style.display = "none";
  animeErrorMessage.textContent = message;
}

// Función para mostrar estado vacío en búsqueda de Anime
function showAnimeEmpty() {
  hideAnimeLoading();
  animeError.style.display = "none";
  animeEmpty.style.display = "block";
  animeResults.innerHTML = "";
}

// Función para mostrar resultados de Anime
function showAnimeResults() {
  hideAnimeLoading();
  animeError.style.display = "none";
  animeEmpty.style.display = "none";
}

// Función para mostrar estado de carga de Cat Facts
function showCatFactsLoading() {
  catFactsLoading.style.display = "block";
  catFactsError.style.display = "none";
  catFactsResults.innerHTML = "";
}

// Función para ocultar estado de carga de Cat Facts
function hideCatFactsLoading() {
  catFactsLoading.style.display = "none";
}

// Función para mostrar error en Cat Facts
function showCatFactsError(message) {
  hideCatFactsLoading();
  catFactsError.style.display = "block";
  catFactsErrorMessage.textContent = message;
}

// Función para mostrar resultados de Cat Facts
function showCatFactsResults() {
  hideCatFactsLoading();
  catFactsError.style.display = "none";
}

// Función para mostrar estado de carga de Random Cats
function showRandomCatsLoading() {
  randomCatsLoading.style.display = "block";
  randomCatsError.style.display = "none";
  randomCatsResults.innerHTML = "";
}

// Función para ocultar estado de carga de Random Cats
function hideRandomCatsLoading() {
  randomCatsLoading.style.display = "none";
}

// Función para mostrar error en Random Cats
function showRandomCatsError(message) {
  hideRandomCatsLoading();
  randomCatsError.style.display = "block";
  randomCatsErrorMessage.textContent = message;
}

// Función para mostrar resultados de Random Cats
function showRandomCatsResults() {
  hideRandomCatsLoading();
  randomCatsError.style.display = "none";
}

// Función para mostrar estado de carga de Random User
function showRandomUserLoading() {
  randomUserLoading.style.display = "block";
  randomUserError.style.display = "none";
  randomUserResults.innerHTML = "";
}

// Función para ocultar estado de carga de Random User
function hideRandomUserLoading() {
  randomUserLoading.style.display = "none";
}

// Función para mostrar error en Random User
function showRandomUserError(message) {
  hideRandomUserLoading();
  randomUserError.style.display = "block";
  randomUserErrorMessage.textContent = message;
}

// Función para mostrar resultados de Random User
function showRandomUserResults() {
  hideRandomUserLoading();
  randomUserError.style.display = "none";
}

// Función para reintentar búsqueda de anime con parámetros anteriores
function retryAnimeSearch() {
  if (Object.keys(lastSearchParams).length > 0) {
    searchAnime(
      lastSearchParams.query,
      lastSearchParams.type,
      lastSearchParams.status,
      lastSearchParams.limit
    );
  }
}

// API de búsqueda de anime usando Jikan
async function searchAnime(
  query = null,
  type = null,
  status = null,
  limit = null
) {
  // Obtenemos los valores de búsqueda del formulario o parámetros
  const searchQuery = query || animeQuery.value.trim();
  const searchType = type || animeType.value;
  const searchStatus = status || animeStatus.value;
  const searchLimit = limit || animeLimit.value || 20;

  // Validamos que se haya ingresado un término de búsqueda
  if (!searchQuery) {
    showAnimeError("Por favor ingresa un término de búsqueda");
    return;
  }

  // Guardamos los parámetros para reintentar
  lastSearchParams = {
    query: searchQuery,
    type: searchType,
    status: searchStatus,
    limit: searchLimit,
  };
  showAnimeLoading();

  try {
    // Construimos la URL de la API con los parámetros
    // Limite como query param
    let url = `https://api.jikan.moe/v4/anime?q=${searchQuery}&limit=${searchLimit}`;
    if (searchType) url += `&type=${searchType}`;
    if (searchStatus) url += `&status=${searchStatus}`;

    // Realizamos la petición a la API
    const response = await fetchWithTimeout(url);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

    // Procesamos la respuesta
    const data = await response.json();
    showAnimeResults();

    // Mostramos resultados o estado vacío
    if (data.data && data.data.length > 0) {
      displayAnimeResults(data.data, data.pagination);
    } else {
      showAnimeEmpty();
    }
  } catch (error) {
    console.error("Error buscando anime:", error);
    showAnimeError(`Error al buscar anime: ${error.message}`);
  }
}

// Función para mostrar los resultados de anime en el DOM
function displayAnimeResults(animes, pagination) {
  // Creamos el encabezado con información de resultados
  const resultsHeader = `
        <div class="results-header">
            <h2 class="results-title">Resultados de búsqueda</h2>
            <p class="results-count">${pagination.items.total} resultados encontrados</p>
        </div>
    `;

  // Generamos las tarjetas de anime
  const animeCards = animes
    .map(
      (anime) => `
        <div class="anime-card">
            <img src="${anime.images.jpg.image_url}" alt="${
        anime.title
      }" class="anime-image" 
                 onerror="this.src='https://via.placeholder.com/300x180/f8f9fa/666?text=Sin+imagen'">
            <div class="anime-content">
                <h3 class="anime-title">${anime.title}</h3>
                ${
                  anime.title_english
                    ? `<p class="anime-english">${anime.title_english}</p>`
                    : ""
                }
                
                <div class="anime-info">
                    <span class="anime-tag">${anime.type || "N/A"}</span>
                    <span class="anime-tag">${anime.status || "N/A"}</span>
                    ${
                      anime.genres
                        ? anime.genres
                            .slice(0, 3)
                            .map(
                              (genre) =>
                                `<span class="anime-tag">${genre.name}</span>`
                            )
                            .join("")
                        : ""
                    }
                </div>
                
                <p class="anime-description">${
                  anime.synopsis || "Sin descripción disponible"
                }</p>
                
                <div class="anime-stats">
                    <span class="anime-score">⭐ ${anime.score || "N/A"}</span>
                    <span class="anime-episodes">${
                      anime.episodes || "?"
                    } episodios</span>
                </div>
            </div>
        </div>
    `
    )
    .join("");

  // Insertamos todo el contenido en el DOM
  animeResults.innerHTML = `
        ${resultsHeader}
        <div class="anime-results">
            ${animeCards}
        </div>
    `;
}

// API 1: Obtenemos datos curiosos de gatos
async function fetchCatFacts() {
  showCatFactsLoading();

  try {
    // Realizamos petición a la API de cat facts
    const response = await fetchWithTimeout("https://catfact.ninja/fact");
    const data = await response.json();

    showCatFactsResults();

    // Mostramos el dato curioso en el DOM
    catFactsResults.innerHTML = `
      <div class="anime-card">
        <div class="anime-content">
          <h3 class="anime-title">🐱 Dato Curioso</h3>
          <p class="anime-description">${data.fact}</p>
          <div class="anime-stats">
            <span class="anime-tag">${data.length} caracteres</span>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    showCatFactsError("Error al obtener datos de gatos: " + error.message);
  }
}

// API 2: Obtenemos imágenes aleatorias de gatos
async function fetchRandomCats() {
  showRandomCatsLoading();

  try {
    // Definimos las categorías de gatos disponibles
    const categories = [
      "https://cataas.com/cat",
      "https://cataas.com/cat/cute",
      "https://cataas.com/cat/small",
      "https://cataas.com/cat/gif",
      "https://cataas.com/cat/says/Hello",
      "https://cataas.com/cat/says/Hi",
      "https://cataas.com/cat/says/Meow",
    ];

    // Seleccionamos 3 categorías aleatorias sin repetir
    const selected = [];
    while (selected.length < 3) {
      const random = categories[Math.floor(Math.random() * categories.length)];
      if (!selected.includes(random)) {
        selected.push(random);
      }
    }

    showRandomCatsResults();

    // Generamos las imágenes de gatos
    const catsHTML = selected
      .map(
        (url) => `
      <div class="cat-item">
        <img src="${url}" alt="Gato" onerror="this.src='https://via.placeholder.com/100x100/f8f9fa/666?text=🐱'">
      </div>
    `
      )
      .join("");

    // Mostramos las imágenes en el DOM
    randomCatsResults.innerHTML = `<div class="cat-grid">${catsHTML}</div>`;
  } catch (error) {
    showRandomCatsError("Error al obtener gatos: " + error.message);
  }
}

// API 3: Obtenemos un usuario aleatorio
async function fetchRandomUser() {
  showRandomUserLoading();

  try {
    // Realizamos petición a la API de usuarios aleatorios
    const response = await fetchWithTimeout("https://randomuser.me/api/");
    const data = await response.json();

    showRandomUserResults();

    // Verificamos que hay datos y mostramos el usuario
    if (data.results && data.results.length > 0) {
      const user = data.results[0];

      // Generamos la tarjeta del usuario
      randomUserResults.innerHTML = `
        <div class="anime-card">
          <div class="anime-content">
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
              <img src="${user.picture.medium}" alt="Avatar" style="width: 50px; height: 50px; border-radius: 50%;">
              <div>
                <h3 class="anime-title">${user.name.first} ${user.name.last}</h3>
                <p class="anime-english">${user.email}</p>
              </div>
            </div>
            <div class="anime-info">
              <span class="anime-tag">${user.location.country}</span>
              <span class="anime-tag">${user.dob.age} años</span>
            </div>
            <p class="anime-description">
              <strong>Teléfono:</strong> ${user.phone}
            </p>
          </div>
        </div>
      `;
    } else {
      showRandomUserError("No se pudo obtener el usuario");
    }
  } catch (error) {
    showRandomUserError("Error al obtener usuario aleatorio: " + error.message);
  }
}
