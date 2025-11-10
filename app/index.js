// Estado de los LEDs individuales
const ledStates = {
    ledRed: false,
    ledGreen: false,
    ledYellow: false
};

// Estado del RGB
const rgbState = {
    r: 255,
    g: 0,
    b: 0
};

// Estado del potenciómetro
let potValue = 50;

// Estado de la fotocelda
let photoValue = 512;

// Estado de la matriz 8x8
const matrixState = Array(8).fill().map(() => Array(8).fill(false));

// Inicializar LEDs individuales
function initLEDs() {
    ['ledRed', 'ledGreen', 'ledYellow'].forEach(id => {
        const btn = document.getElementById(id);
        btn.addEventListener('click', () => {
            ledStates[id] = !ledStates[id];
            btn.classList.toggle('active');
            console.log(`${id}: ${ledStates[id]}`);
        });
    });
}

// Inicializar LED RGB
function initRGB() {
    const redSlider = document.getElementById('redSlider');
    const greenSlider = document.getElementById('greenSlider');
    const blueSlider = document.getElementById('blueSlider');
    const preview = document.getElementById('rgbPreview');
    
    function updateRGB() {
        rgbState.r = parseInt(redSlider.value);
        rgbState.g = parseInt(greenSlider.value);
        rgbState.b = parseInt(blueSlider.value);
        
        document.getElementById('redValue').textContent = rgbState.r;
        document.getElementById('greenValue').textContent = rgbState.g;
        document.getElementById('blueValue').textContent = rgbState.b;
        
        const color = `rgb(${rgbState.r}, ${rgbState.g}, ${rgbState.b})`;
        preview.style.background = color;
        preview.style.boxShadow = `inset 4px 4px 8px rgba(0,0,0,0.3), inset -4px -4px 8px rgba(255,255,255,0.1), 0 0 40px rgba(${rgbState.r}, ${rgbState.g}, ${rgbState.b}, 0.5)`;
        
        redSlider.style.background = `linear-gradient(to right, #000 0%, #ff0000 ${(rgbState.r/255)*100}%, #e0e5ec ${(rgbState.r/255)*100}%)`;
        greenSlider.style.background = `linear-gradient(to right, #000 0%, #00ff00 ${(rgbState.g/255)*100}%, #e0e5ec ${(rgbState.g/255)*100}%)`;
        blueSlider.style.background = `linear-gradient(to right, #000 0%, #0000ff ${(rgbState.b/255)*100}%, #e0e5ec ${(rgbState.b/255)*100}%)`;
        
        console.log('RGB:', rgbState);
    }
    
    redSlider.addEventListener('input', updateRGB);
    greenSlider.addEventListener('input', updateRGB);
    blueSlider.addEventListener('input', updateRGB);
    
    updateRGB();
}

// Inicializar Potenciómetro
function initPotentiometer() {
    const slider = document.getElementById('potSlider');
    const needle = document.getElementById('potNeedle');
    const valueDisplay = document.getElementById('potValue');
    
    function updatePot() {
        potValue = parseInt(slider.value);
        valueDisplay.textContent = potValue + '%';
        
        const angle = (potValue / 100) * 270 - 135;
        needle.style.transform = `rotate(${angle}deg)`;
        
        slider.style.background = `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${potValue}%, #e0e5ec ${potValue}%)`;
        
        console.log('Potenciómetro:', potValue);
    }
    
    slider.addEventListener('input', updatePot);
    updatePot();
}

// Inicializar Matriz 8x8
function initMatrix() {
    const grid = document.getElementById('matrixGrid');
    const clearBtn = document.getElementById('clearMatrix');
    
    // Crear píxeles
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const pixel = document.createElement('button');
            pixel.className = 'matrix-pixel';
            pixel.dataset.row = i;
            pixel.dataset.col = j;
            
            pixel.addEventListener('click', () => {
                matrixState[i][j] = !matrixState[i][j];
                pixel.classList.toggle('active');
                console.log(`Matriz [${i}][${j}]:`, matrixState[i][j]);
            });
            
            grid.appendChild(pixel);
        }
    }
    
    // Botón limpiar
    clearBtn.addEventListener('click', () => {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                matrixState[i][j] = false;
            }
        }
        document.querySelectorAll('.matrix-pixel').forEach(pixel => {
            pixel.classList.remove('active');
        });
        console.log('Matriz limpiada');
    });
}

// Inicializar Fotocelda
function initPhotocell() {
    const slider = document.getElementById('photoSlider');
    const overlay = document.getElementById('photoOverlay');
    const valueDisplay = document.getElementById('photoValue');
    
    function updatePhoto() {
        photoValue = parseInt(slider.value);
        valueDisplay.textContent = photoValue;
        
        const opacity = photoValue / 1023;
        overlay.style.opacity = opacity;
        
        slider.style.background = `linear-gradient(to right, #fbbf24 0%, #fbbf24 ${(photoValue/1023)*100}%, #e0e5ec ${(photoValue/1023)*100}%)`;
        
        console.log('Fotocelda:', photoValue);
    }
    
    slider.addEventListener('input', updatePhoto);
    updatePhoto();
}

// Inicializar todo al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    initLEDs();
    initRGB();
    initPotentiometer();
    initMatrix();
    initPhotocell();
    
    console.log('Arduino Control Panel iniciado');
});
