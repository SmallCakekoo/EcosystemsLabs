const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Servir archivos estáticos desde /public
app.use(express.static(path.join(__dirname, 'public')));

// Iniciar proceso Python para controlar hardware
let pythonProcess = null;

function startPythonProcess() {
    pythonProcess = spawn('python3', [path.join(__dirname, 'hardware_controller.py')]);
    
    pythonProcess.stdout.on('data', (data) => {
        const lines = data.toString().split('\n').filter(line => line.trim());
        lines.forEach(line => {
            try {
                const response = JSON.parse(line);
                if (pendingResponses.length > 0) {
                    const resolve = pendingResponses.shift();
                    resolve(response);
                }
            } catch (e) {
                console.log('Python output:', line);
            }
        });
    });
    
    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python Error: ${data}`);
    });
    
    pythonProcess.on('close', (code) => {
        console.log(`Proceso Python terminado con código ${code}`);
    });
}

// Cola de respuestas pendientes
const pendingResponses = [];

// Función para enviar comandos a Python
function sendToPython(command) {
    return new Promise((resolve, reject) => {
        if (!pythonProcess) {
            reject(new Error('Python process not started'));
            return;
        }
        
        pendingResponses.push(resolve);
        pythonProcess.stdin.write(JSON.stringify(command) + '\n');
        
        setTimeout(() => {
            const index = pendingResponses.indexOf(resolve);
            if (index > -1) {
                pendingResponses.splice(index, 1);
                reject(new Error('Python timeout'));
            }
        }, 5000);
    });
}

// Iniciar Python al arrancar
startPythonProcess();

// Socket.io
io.on('connection', (socket) => {
    console.log('✅ Cliente conectado:', socket.id);
    
    // Control LEDs individuales
    socket.on('ledControl', async (data) => {
        try {
            console.log('📍 LED Control:', data);
            await sendToPython({
                command: 'led',
                color: data.color,
                state: data.state
            });
        } catch (e) {
            console.error('❌ Error LED:', e.message);
        }
    });
    
    // Control LED RGB
    socket.on('rgbControl', async (data) => {
        try {
            console.log('🌈 RGB Control:', data);
            await sendToPython({
                command: 'rgb',
                r: data.r,
                g: data.g,
                b: data.b
            });
        } catch (e) {
            console.error('❌ Error RGB:', e.message);
        }
    });
    
    // Control Matriz 8x8
    socket.on('matrixControl', async (data) => {
        try {
            console.log('📟 Matrix Control recibido');
            await sendToPython({
                command: 'matrix',
                pattern: data.pattern
            });
        } catch (e) {
            console.error('❌ Error Matriz:', e.message);
        }
    });
    
    // Leer sensores periódicamente
    const sensorInterval = setInterval(async () => {
        try {
            const sensors = await sendToPython({ command: 'read_sensors' });
            socket.emit('sensorData', sensors);
        } catch (e) {
            // console.error('Error leyendo sensores:', e.message);
        }
    }, 200);
    
    socket.on('disconnect', () => {
        console.log('❌ Cliente desconectado:', socket.id);
        clearInterval(sensorInterval);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
    console.log(`📱 Accede desde tu navegador`);
});

// Cleanup
process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando servidor...');
    if (pythonProcess) {
        pythonProcess.kill();
    }
    process.exit();
});