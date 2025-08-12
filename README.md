# Laboratory – Posts CRUD App

El objetivo es implementar una aplicación que permita _crear, listar y eliminar publicaciones_ utilizando un servidor simulado con json-server.

---

## Descripción

La aplicación consume un API REST simulada y permite:

- _Crear_ un post con:
  - URL de imagen
  - Título
  - Descripción  
    Después de guardar, el usuario es redirigido a la pantalla de lista y el nuevo post aparece inmediatamente.
- _Listar_ posts, mostrando:
  - Imagen
  - Título
  - Descripción
- _Eliminar_ posts con un botón dedicado y actualizar automáticamente la lista después de la eliminación.

---

## Tecnologías

- _json-server_ para simular el servidor  
  📦 [json-server en npm](https://www.npmjs.com/package/json-server)
- HTML / CSS / JavaScript (o framework usado en la implementación)

---

## Endpoints

### Obtener lista de posts

````http
GET http://localhost:3004/posts```
````
