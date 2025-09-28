# Laboratorio Bases de Datos – Aplicaciones y Ecosistemas

Este proyecto contiene un **backend en Node.js + Supabase** y dos **frontends (app1 y app2)** para consumir y visualizar datos desde una base de datos.

---

## 📂 Estructura del proyecto
app1/ # Frontend 1 (HTML, JS, CSS)
app2/ # Frontend 2 (HTML, JS, CSS)
server/ # Backend con Express + Supabase
├── controllers/ # Controladores (reciben req, llaman a db y responden)
├── db/ # Consultas a Supabase (from, select, etc.)
├── routes/ # Definición de endpoints por recurso
└── services/ # Servicios (supabase.client, socket.io, etc.)

---

## ⭐ Database Tasks

1. Traer todos los registros de la tabla `products`

2. Traer todos los productos cuyo precio sea menor a 50

3. Traer solo los campos `username` y `email` de todos los usuarios

4. Traer todas las órdenes ordenadas por `created_at` de forma descendente

5. Traer todos los productos que cuesten más de 30 y que pertenezcan a la categoría "Electronics"

6. Traer todos los posts cuyo título contenga la palabra "tutorial"

7. Traer los primeros 10 productos (usando `LIMIT` y `OFFSET`)

8. Traer todos los productos asociados al usuario actual

---
