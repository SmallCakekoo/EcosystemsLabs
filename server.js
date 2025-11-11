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

// Proceso Python
let pythonProcess = null;
let pythonReady = false;
const pendingResponses = [];

function startPythonProcess() {
    console.log('🔄 Iniciando proceso Python...');
    
    // Usar el Python del entorno virtual
    const pythonPath = path.join(__dirname, 'venv', 'bin', 'python3');
    
    pythonProcess = spawn(pythonPath, [path.join(__dirname, 'hardware_controller.py')], {
        env: { ...process.env }
    });
    
    pythonProcess.stdout.on('data', (data) => {
        const lines = data.toString().split('\n').filter(line => line.trim());
        lines.forEach(line => {
            try {
                const response = JSON.parse(line);
                console.log('📥 Python:', response);
                
                // Marcar como listo cuando reciba el mensaje 'ready'
                if (response.status === 'ready') {
                    pythonReady = true;
                    console.log('✅ Python listo');
                }
                
                // Resolver promesas pendientes
                if (pendingResponses.length > 0) {
                    const resolve = pendingResponses.shift();
                    resolve(response);
                }
            } catch (e) {
                console.log('📄 Python output:', line);
            }
        });
    });
    
    pythonProcess.stderr.on('data', (data) => {
        console.error('❌ Python Error:', data.toString());
    });
    
    pythonProcess.on('close', (code) => {
        console.log(`⚠️ Proceso Python cerrado con código ${code}`);
        pythonReady = false;
        
        // Reintentar después de 2 segundos
        setTimeout(() => {
            console.log('🔄 Reintentando iniciar Python...');
            startPythonProcess();
        }, 2000);
    });
    
    pythonProcess.on('error', (err) => {
        console.error('❌ Error al iniciar Python:', err);
        pythonReady = false;
    });
}

// Función para enviar comandos a Python
function sendToPython(command) {
    return new Promise((resolve, reject) => {
        if (!pythonProcess || !pythonReady) {
            reject(new Error('Python no está listo'));
            return;
        }
        
        try {
            pendingResponses.push(resolve);
            pythonProcess.stdin.write(JSON.stringify(command) + '\n');
            
            // Timeout de 5 segundos
            setTimeout(() => {
                const index = pendingResponses.indexOf(resolve);
                if (index > -1) {
                    pendingResponses.splice(index, 1);
                    reject(new Error('Timeout esperando respuesta de Python'));
                }
            }, 5000);
        } catch (err) {
            reject(err);
        }
    });
}

// Iniciar Python al arrancar
startPythonProcess();

// Socket.io
io.on('connection', (socket) => {
    console.log('✅ Cliente conectado:', socket.id);
    
    // Enviar estado de Python al cliente
    socket.emit('pythonStatus', { ready: pythonReady });
    
    // Control LEDs individuales
    socket.on('ledControl', async (data) => {
        try {
            console.log('📍 LED Control:', data);
            const response = await sendToPython({
                command: 'led',
                color: data.color,
                state: data.state
            });
            socket.emit('commandResponse', response);
        } catch (e) {
            console.error('❌ Error LED:', e.message);
            socket.emit('commandResponse', { status: 'error', message: e.message });
        }
    });
    
    // Control LED RGB
    socket.on('rgbControl', async (data) => {
        try {
            console.log('🌈 RGB Control:', data);
            const response = await sendToPython({
                command: 'rgb',
                r: data.r,
                g: data.g,
                b: data.b
            });
            socket.emit('commandResponse', response);
        } catch (e) {
            console.error('❌ Error RGB:', e.message);
            socket.emit('commandResponse', { status: 'error', message: e.message });
        }
    });
    
    // Control Matriz 8x8
    socket.on('matrixControl', async (data) => {
        try {
            console.log('📟 Matrix Control recibido');
            const response = await sendToPython({
                command: 'matrix',
                pattern: data.pattern
            });
            socket.emit('commandResponse', response);
        } catch (e) {
            console.error('❌ Error Matriz:', e.message);
            socket.emit('commandResponse', { status: 'error', message: e.message });
        }
    });
    
    // Leer sensores periódicamente
    const sensorInterval = setInterval(async () => {
        if (!pythonReady) return;
        
        try {
            const sensors = await sendToPython({ command: 'read_sensors' });
            socket.emit('sensorData', sensors);
        } catch (e) {
            // Silencioso para no llenar logs
        }
    }, 500); // Reducido a 500ms
    
    socket.on('disconnect', () => {
        console.log('❌ Cliente desconectado:', socket.id);
        clearInterval(sensorInterval);
    });
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
    console.log(`📱 Accede desde tu navegador en la red local`);
});

// Cleanup
process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando servidor...');
    if (pythonProcess) {
        pythonProcess.kill();
    }
    process.exit();
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Cerrando servidor...');
    if (pythonProcess) {
        pythonProcess.kill();
    }
    process.exit();
});