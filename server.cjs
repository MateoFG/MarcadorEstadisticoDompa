const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;

console.log('>>> [APP HOSTING] Iniciando Servidor Voleibol...');
console.log('>>> [APP HOSTING] Puerto asignado:', port);

// Servir estáticos
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Health check para Firebase
app.get('/__health', (req, res) => {
    res.status(200).send('ok');
});

// SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log('>>> [APP HOSTING] Servidor arriba y escuchando en 0.0.0.0:' + port);
});
