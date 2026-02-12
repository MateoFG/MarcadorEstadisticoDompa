#!/usr/bin/env node

/**
 * Script de verificación pre-despliegue
 * Valida que todas las configuraciones necesarias estén correctas
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const checks = [];

console.log('🔍 Verificación pre-despliegue iniciada...\n');

// 1. Verificar que existe .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
    checks.push({ name: 'Archivo .env existe', status: '✅' });

    // Leer variables
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const requiredVars = [
        'VITE_FIREBASE_API_KEY',
        'VITE_FIREBASE_AUTH_DOMAIN',
        'VITE_FIREBASE_PROJECT_ID',
        'VITE_FIREBASE_STORAGE_BUCKET',
        'VITE_FIREBASE_MESSAGING_SENDER_ID',
        'VITE_FIREBASE_APP_ID'
    ];

    const missingVars = requiredVars.filter(v => !envContent.includes(v));
    if (missingVars.length === 0) {
        checks.push({ name: 'Variables Firebase requeridas presentes', status: '✅' });
    } else {
        checks.push({ name: 'Variables Firebase requeridas', status: '❌', details: `Faltan: ${missingVars.join(', ')}` });
    }
} else {
    checks.push({ name: 'Archivo .env existe', status: '❌', details: 'Crea el archivo .env basándote en .env.example' });
}

// 2. Verificar que dist existe y tiene contenido
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        checks.push({ name: 'Build de producción existe', status: '✅' });
    } else {
        checks.push({ name: 'Build de producción', status: '⚠️', details: 'Ejecuta npm run build' });
    }
} else {
    checks.push({ name: 'Build de producción', status: '⚠️', details: 'Ejecuta npm run build' });
}

// 3. Verificar server.cjs
const serverPath = path.join(__dirname, '..', 'server.cjs');
if (fs.existsSync(serverPath)) {
    checks.push({ name: 'Servidor de producción (server.cjs)', status: '✅' });
} else {
    checks.push({ name: 'Servidor de producción', status: '❌', details: 'Falta server.cjs' });
}

// 4. Verificar apphosting.yaml
const apphostingPath = path.join(__dirname, '..', 'apphosting.yaml');
if (fs.existsSync(apphostingPath)) {
    checks.push({ name: 'Configuración App Hosting (apphosting.yaml)', status: '✅' });
} else {
    checks.push({ name: 'Configuración App Hosting', status: '❌', details: 'Falta apphosting.yaml' });
}

// 5. Verificar .gitignore
const gitignorePath = path.join(__dirname, '..', '.gitignore');
if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
    const hasEnv = gitignoreContent.includes('.env');
    const hasFirebaseJson = gitignoreContent.includes('*-firebase-adminsdk-*.json');

    if (hasEnv && hasFirebaseJson) {
        checks.push({ name: 'Archivos sensibles en .gitignore', status: '✅' });
    } else {
        checks.push({ name: 'Archivos sensibles en .gitignore', status: '⚠️', details: 'Asegúrate de que .env y archivos JSON estén ignorados' });
    }
} else {
    checks.push({ name: '.gitignore existe', status: '❌' });
}

// 6. Verificar package.json scripts
const packagePath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packagePath)) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

    if (pkg.scripts.start && pkg.scripts.start.includes('server.cjs')) {
        checks.push({ name: 'Script de inicio configurado correctamente', status: '✅' });
    } else {
        checks.push({ name: 'Script de inicio', status: '❌', details: 'npm start debe ejecutar server.cjs' });
    }

    if (pkg.engines && pkg.engines.node) {
        checks.push({ name: 'Versión de Node especificada', status: '✅', details: pkg.engines.node });
    } else {
        checks.push({ name: 'Versión de Node especificada', status: '⚠️', details: 'Considera añadir engines.node en package.json' });
    }

    if (pkg.dependencies.express) {
        checks.push({ name: 'Express instalado', status: '✅' });
    } else {
        checks.push({ name: 'Express instalado', status: '❌', details: 'npm install express' });
    }
} else {
    checks.push({ name: 'package.json existe', status: '❌' });
}

// Imprimir resultados
console.log('━'.repeat(60));
checks.forEach(check => {
    console.log(`${check.status} ${check.name}`);
    if (check.details) {
        console.log(`   ${check.details}`);
    }
});
console.log('━'.repeat(60));

// Resumen
const passed = checks.filter(c => c.status === '✅').length;
const warnings = checks.filter(c => c.status === '⚠️').length;
const failed = checks.filter(c => c.status === '❌').length;

console.log(`\n📊 Resumen: ${passed}/${checks.length} verificaciones pasadas`);
if (warnings > 0) console.log(`⚠️  ${warnings} advertencias`);
if (failed > 0) console.log(`❌ ${failed} errores críticos`);

if (failed === 0) {
    console.log('\n✨ El proyecto está listo para desplegar\n');
    console.log('📝 Próximos pasos:');
    console.log('   1. Configura las variables de entorno en Firebase App Hosting');
    console.log('      (Lee FIREBASE_ENV_SETUP.md para instrucciones)');
    console.log('   2. Haz git push para disparar el despliegue automático');
    process.exit(0);
} else {
    console.log('\n❌ Hay errores que debes corregir antes de desplegar\n');
    process.exit(1);
}
