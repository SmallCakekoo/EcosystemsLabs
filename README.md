# APIs Demo

Una aplicación web simple que permite probar diferentes APIs públicas a través de botones interactivos.

## Características

- **3 APIs integradas:**

  - 🐱 **Cat Facts**: Obtiene datos curiosos sobre gatos
  - 🐱 **Random Cats**: Obtiene imágenes aleatorias de gatos
  - 👤 **Random User**: Genera usuarios aleatorios

- **Interfaz moderna y responsiva**
- **Indicador de carga**
- **Manejo de errores**
- **Diseño atractivo con gradientes**

## APIs Utilizadas

### 1. Cat Facts API

- **URL**: https://catfact.ninja/fact
- **Función**: Obtiene datos curiosos sobre gatos
- **Respuesta**: Facto curioso y longitud del texto

### 2. Random Cats API

- **URL**: https://api.thecatapi.com/v1/images/search
- **Función**: Obtiene imágenes aleatorias de gatos
- **Respuesta**: Imágenes de gatos con información adicional

### 3. Random User API

- **URL**: https://randomuser.me/api/
- **Función**: Genera usuarios aleatorios
- **Respuesta**: Información completa del usuario incluyendo foto

## Cómo usar

1. Abre `index.html` en tu navegador
2. Haz clic en cualquiera de los tres botones
3. Espera a que se carguen los datos
4. Visualiza los resultados

## Estructura del Proyecto

```
EcosystemsLabs/
├── index.html          # Página principal
├── css/
│   └── styles.css      # Estilos de la aplicación
├── js/
│   └── app.js         # Lógica de la aplicación
└── README.md          # Este archivo
```

## Tecnologías Utilizadas

- **HTML5**: Estructura de la página
- **CSS3**: Estilos y animaciones
- **JavaScript ES6+**: Lógica de la aplicación
- **Fetch API**: Para las llamadas a las APIs (desde JS)

## Características Técnicas

- **Async/Await**: Para manejo asíncrono de las APIs
- **Error Handling**: Manejo robusto de errores
- **Loading States**: Indicadores de carga para mejor UX

## Instalación

1. Clona o descarga este repositorio
2. Abre `index.html` en tu navegador web
3. ¡Listo para usar!

## Notas

- Todas las APIs son públicas y gratuitas
- No se requieren claves de API
- La aplicación funciona completamente en el frontend
- Compatible con todos los navegadores modernos
- Video: https://youtu.be/zxXnRzdE6xE
