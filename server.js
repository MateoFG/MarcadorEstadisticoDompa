import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '8080', 10);

console.log('Iniciando servidor Express...');
console.log(`Puerto detectado: ${port}`);
console.log(`Directorio actual: ${process.cwd()}`);
console.log(`__dirname: ${__dirname}`);

// Servir archivos estáticos
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback para SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

const server = app.listen(port, '0.0.0.0', () => {
    const address = server.address();
    console.log(`Servidor escuchando en: http://0.0.0.0:${port}`);
    console.log('--- Servidor arriba ---');
});
