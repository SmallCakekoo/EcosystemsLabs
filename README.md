# MiniRappi - Sistema de Delivery

Un sistema completo de delivery construido con Node.js, Express y frontend estático que simula una plataforma de delivery con tres roles: Consumidor, Repartidor y Tienda.

## Video & Diapositivas

- **[Video](https://youtu.be/IoaCB9kLrIA)**
- **[Diapos](https://www.figma.com/slides/bFzB69hQeWR3bUKtYPxktR/MiniRappi?node-id=3-21&t=3gKZkSipDLFOXSxi-1)**

## Características

- ✅ **Backend Express.js** con middleware JSON
- ✅ **Tres aplicaciones frontend** con roles específicos
- ✅ **Sistema de autenticación** automático
- ✅ **Gestión de productos** y pedidos
- ✅ **Carrito de compras** con funcionalidad completa
- ✅ **Control de estado de tiendas** (abierta/cerrada)
- ✅ **Información del cliente** en pedidos para repartidores
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
- **Carrito de compras** con agregar/eliminar productos
- **Formulario de compra** con método de pago y dirección
- **Indicador de tiendas cerradas** (no se puede acceder)
- **Interfaz intuitiva** para compras

### 🚚 **Repartidor (App2)**

- **Login** para acceder al sistema
- **Ver pedidos pendientes** y en curso
- **Información completa del cliente** (nombre, teléfono, dirección)
- **Aceptar pedidos** y cambiar estados
- **Filtros** por estado de pedido

### 🏪 **Tienda (App3)**

- **Login** para gestión de productos
- **Crear nuevos productos** (nombre, precio, tienda)
- **Ver productos** existentes
- **Control de estado** (abrir/cerrar tienda)
- **Contador** de productos totales

## API Endpoints

### Autenticación

- **POST** `/usuarios/login` - Login de consumidor
- **POST** `/usuarios/registro` - Registro de consumidor
- **POST** `/tiendas/login` - Login de tienda
- **POST** `/tiendas/registro` - Registro de tienda
- **POST** `/repartidores/login` - Login de repartidor
- **POST** `/repartidores/registro` - Registro de repartidor

### Tiendas

- **GET** `/tiendas` - Obtener todas las tiendas
- **PUT** `/tiendas/:id/estado` - Cambiar estado de tienda (abierta/cerrada)

### Productos

- **GET** `/tiendas/:id/productos` - Obtener productos de una tienda
- **POST** `/tiendas/:id/productos` - Crear nuevo producto

### Pedidos

- **GET** `/pedidos` - Obtener todos los pedidos (con filtros opcionales)
- **POST** `/pedidos` - Crear nuevo pedido con carrito y datos de cliente
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
- Ver productos disponibles (tiendas cerradas aparecen marcadas)
- Agregar productos al carrito
- Confirmar compra con método de pago y dirección

### 3. **Repartidor gestiona pedidos**

- Login en `/app2`
- Ver pedidos pendientes con información completa del cliente
- Aceptar y cambiar estados

### 4. **Seguimiento completo**

- Todos los cambios se reflejan en tiempo real
- Estados visibles en todas las aplicaciones

## Funcionalidades Avanzadas

### 🛒 **Carrito de Compras**

- **Agregar productos** al carrito desde la vista de productos
- **Eliminar productos** del carrito individualmente
- **Cálculo automático** del total
- **Formulario de compra** con método de pago y dirección
- **Limpieza automática** del carrito al cambiar de tienda

### 🏪 **Control de Estado de Tiendas**

- **Toggle visual** para abrir/cerrar tienda
- **Indicador "Cerrado"** en tiendas no disponibles
- **Bloqueo de acceso** a tiendas cerradas
- **Validación en backend** para pedidos en tiendas cerradas

### 🚚 **Información del Cliente**

- **Datos completos** del cliente en cada pedido
- **Nombre, teléfono y dirección** visibles para repartidores
- **Información persistente** en la base de datos
- **Iconos visuales** para mejor identificación

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
