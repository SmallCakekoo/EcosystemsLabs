const API_URL = "http://localhost:3000/posts";

const postForm = document.getElementById("postForm");
const postsList = document.getElementById("postsList");

async function fetchPosts() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Error al obtener posts");
    const posts = await res.json();
    renderPosts(posts);
  } catch (error) {
    alert("No se pudo cargar la lista de posts.");
    console.error(error);
  }
}

function renderPosts(posts) {
  postsList.innerHTML = "";

  if (posts.length === 0) {
    postsList.innerHTML = "<p>No hay posts aún.</p>";
    return;
  }
  // Return del post like a card
  posts.forEach((post) => {
    const postDiv = document.createElement("div");

    postDiv.innerHTML = `
      <img src="${post.imageUrl}" alt="${post.title}" />
      <div class="post-content">
        <h3>${post.title}</h3>
        <p>${post.description}</p>
      </div>
      <button class="delete-btn" data-id="${post.id}">Eliminar</button>
    `;

    postsList.appendChild(postDiv);
  });

  // Agregar event listeners a botones eliminar
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.getAttribute("data-id");
      await deletePost(id);
    });
  });
}

async function deletePost(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar post");
    fetchPosts();
  } catch (error) {
    alert("No se pudo eliminar el post.");
    console.error(error);
  }
}

postForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const imageUrl = document.getElementById("imageUrl").value.trim();
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();

  if (!imageUrl || !title || !description) {
    alert("Por favor completa todos los campos.");
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl, title, description }),
    });

    if (!res.ok) throw new Error("Error al guardar post");

    // Limpiar formulario
    postForm.reset();

    // Refrescar lista
    fetchPosts();
  } catch (error) {
    alert("No se pudo guardar el post.");
    console.error(error);
  }
});

// Carga inicial
fetchPosts();
