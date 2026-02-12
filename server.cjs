const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 8080;

console.log('>>> [APP HOSTING] Iniciando Servidor Voleibol...');
console.log('>>> [APP HOSTING] Puerto asignado:', port);
console.log('>>> [APP HOSTING] Directorio de trabajo:', process.cwd());

// Verificar que dist existe
const distPath = path.join(__dirname, 'dist');
console.log('>>> [APP HOSTING] Ruta de dist:', distPath);

if (!fs.existsSync(distPath)) {
    console.error('❌ [ERROR] Carpeta dist NO existe!');
    console.error('❌ Listando contenido del directorio actual:');
    console.error(fs.readdirSync(__dirname));
    throw new Error('dist directory not found');
}

const distContents = fs.readdirSync(distPath);
console.log('>>> [APP HOSTING] Contenido de dist:', distContents);

// Configurar servir archivos estáticos con opciones explícitas
app.use(express.static(distPath, {
    setHeaders: (res, filePath) => {
        console.log('>>> [STATIC] Sirviendo:', path.basename(filePath));

        // Asegurar Content-Type correcto
        if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (filePath.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html');
        }
    },
    index: false, // No servir index.html automáticamente desde express.static
}));

// Health check para Firebase
app.get('/__health', (req, res) => {
    res.status(200).send('ok');
});

// SPA routing - solo para rutas HTML, no para assets
app.get('*', (req, res) => {
    // Si es una petición de un asset (tiene extensión), devolver 404
    const ext = path.extname(req.path);
    if (ext && ext !== '.html') {
        console.warn(`⚠️  [404] Asset no encontrado: ${req.path}`);
        return res.status(404).send('Not found');
    }

    console.log(`>>> [SPA] Sirviendo index.html para ruta: ${req.path}`);
    res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log('>>> [APP HOSTING] ✅ Servidor arriba y escuchando en 0.0.0.0:' + port);
});
