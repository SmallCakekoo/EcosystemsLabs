# MiniRappi - Sistema de Delivery

Un sistema completo de delivery construido con Node.js, Express y frontend estático que simula una plataforma de delivery con tres roles: Consumidor, Repartidor y Tienda.

## Características

- ✅ **Backend Express.js** con middleware JSON
- ✅ **Tres aplicaciones frontend** con roles específicos
- ✅ **Sistema de autenticación** automático
- ✅ **Gestión de productos** y pedidos
- ✅ **Interfaces modernas** y responsivas
- ✅ **Arrays en memoria** para desarrollo y testing
- ✅ **Puerto 5050**

## Fuentes Utilizadas

- **[TASA Explorer](https://fonts.google.com/specimen/TASA+Explorer)** - Fuente principal para títulos y elementos destacados
- **[Montserrat](https://fonts.google.com/specimen/Montserrat)** - Fuente secundaria para texto y contenido

## Estructura del Proyecto

```
EcosystemsLabs (branch:Laboratorio3)/
├── app1/                 # App Consumidor 🛒
│   ├── index.html       # Interfaz del consumidor
│   ├── styles.css       # Estilos del consumidor
│   └── index.js         # Lógica del consumidor
├── app2/                 # App Repartidor 🚚
│   ├── index.html       # Interfaz del repartidor
│   ├── styles.css       # Estilos del repartidor
│   └── index.js         # Lógica del repartidor
├── app3/                 # App Tienda 🏪
│   ├── index.html       # Interfaz de la tienda
│   ├── styles.css       # Estilos de la tienda
│   └── index.js         # Lógica de la tienda
├── public/               # Página principal
│   ├── index.html       # Página de bienvenida
│   └── styles.css       # Estilos principales
├── index.js             # Backend principal
├── request.http         # Archivo de pruebas HTTP
├── package.json         # Dependencias
└── README.md           # Este archivo
```

## Instalación y Ejecución

### 1. Instalar dependencias

```bash
npm install
```

### 2. Ejecutar el servidor

```bash
npm start
# o
node index.js
```

### 3. Acceder a las aplicaciones

- **Página principal**: `http://localhost:5050/`
- **Consumidor**: `http://localhost:5050/app1`
- **Repartidor**: `http://localhost:5050/app2`
- **Tienda**: `http://localhost:5050/app3`

## Roles y Funcionalidades

### 🛒 **Consumidor (App1)**

- **Login/Registro** automático
- **Ver productos** disponibles
- **Crear pedidos** con un clic
- **Interfaz intuitiva** para compras

### 🚚 **Repartidor (App2)**

- **Login** para acceder al sistema
- **Ver pedidos pendientes** y en curso
- **Aceptar pedidos** y cambiar estados
- **Filtros** por estado de pedido

### 🏪 **Tienda (App3)**

- **Login** para gestión de productos
- **Crear nuevos productos** (nombre, precio, tienda)
- **Ver productos** existentes
- **Contador** de productos totales

## API Endpoints

### Autenticación

- **POST** `/usuarios/login` - Login de consumidor
- **POST** `/usuarios/registro` - Registro de consumidor
- **POST** `/tiendas/login` - Login de tienda
- **POST** `/tiendas/registro` - Registro de tienda
- **POST** `/repartidores/login` - Login de repartidor

### Productos

- **GET** `/tiendas` - Obtener todas las tiendas
- **GET** `/tiendas/:id/productos` - Obtener productos de una tienda
- **POST** `/tiendas/:id/productos` - Crear nuevo producto

### Pedidos

- **GET** `/pedidos` - Obtener todos los pedidos
- **POST** `/pedidos` - Crear nuevo pedido
- **PUT** `/pedidos/:id` - Actualizar estado del pedido

### Utilidades

- **GET** `/` - Página principal de MiniRappi
- **GET** `/stats` - Estadísticas del sistema

## Estados de Pedidos

El sistema maneja un flujo completo de estados:

1. **`pendiente`** - Pedido creado por el consumidor
2. **`aceptado`** - Pedido aceptado por el repartidor

## Pruebas

### Usando el archivo request.http

1. Abre el archivo `request.http` en VS Code
2. Instala la extensión "REST Client", "Insomnia" o "Thunder CLient" si no la tienes
3. Haz clic en "Send Request" en cada endpoint

## Flujo de Trabajo

### 1. **Tienda crea productos**

- Login en `/app3`
- Crear productos con nombre, precio y tienda

### 2. **Consumidor hace pedidos**

- Login en `/app1`
- Ver productos disponibles
- Crear pedidos con un clic

### 3. **Repartidor gestiona pedidos**

- Login en `/app2`
- Ver pedidos pendientes
- Aceptar y cambiar estados

### 4. **Seguimiento completo**

- Todos los cambios se reflejan en tiempo real
- Estados visibles en todas las aplicaciones

## Características de UI/UX

- **Diseño responsivo** para móviles y desktop
- **Gradientes modernos** y animaciones suaves
- **Iconos de Remix Icon y Font Awesome** para mejor experiencia visual
- **Mensajes de feedback** claros y útiles
- **Validaciones en tiempo real** en formularios
- **Loading states** y manejo de errores

## Manejo de Errores ⚠️

- **400** - Datos inválidos o faltantes
- **401** - Credenciales incorrectas
- **404** - Recurso no encontrado
- **200** - Operación exitosa

## Notas Importantes

- **Sin persistencia**: Los datos se pierden al reiniciar el servidor
- **Arrays en memoria**: Todo se maneja en variables del servidor
- **Sin base de datos**: Diseñado para desarrollo y testing
- **Puerto fijo**: El servidor siempre corre en el puerto 5050
- **Registro automático**: Los usuarios se crean automáticamente al hacer login

## Personalización

Puedes modificar fácilmente:

- **Puerto del servidor** en `index.js`
- **Estados de pedidos** y flujo de trabajo
- **Validaciones** en cada endpoint
- **Mensajes de respuesta** y errores
- **Colores y estilos** en cada `styles.css`

## Logs del Servidor

Al iniciar verás:

- Puerto del servidor
- Carpetas de archivos estáticos
- Rutas disponibles
- EndPoints

## Casos de Uso

### Escenario 1: Múltiples Usuarios

- Varios consumidores pueden hacer pedidos simultáneamente
- Repartidores pueden gestionar múltiples pedidos
- Tiendas pueden crear catálogos completos

---

:D
