// Script para uso administrativo con firebase-admin (ejecutar con 'node')
// Uso: node scripts/admin-example.js

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from '../marcador4estadistico-293-f8d49-firebase-adminsdk-fbsvc-e002f68f38.json' assert { type: "json" };

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

async function main() {
    console.log('--- Iniciando script administrativo ---');
    // Aquí tu lógica administrativa. Ejemplo: listar usuarios o colecciones
    const snapshot = await db.collection('matches').limit(5).get();
    snapshot.forEach(doc => {
        console.log(doc.id, doc.data());
    });
    console.log('--- Fin del script ---');
}

main().catch(console.error);
